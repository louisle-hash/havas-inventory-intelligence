"""Đồng bộ tồn kho mousse: SQL Server (nội bộ) -> Supabase (đám mây).

Chạy tay:      python scripts/sync.py
Chạy thử:      python scripts/sync.py --dry-run     (đọc SQL nhưng không ghi Supabase)

Toàn bộ thông số đọc từ file .env ở thư mục gốc. File đó đã bị .gitignore chặn.

Logic chuẩn hoá dữ liệu (tách màu, phân loại trạng thái, dải tuổi tồn) giữ đúng
như scripts/build_data.py để số liệu không lệch giữa hai đường.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
import unicodedata
from collections import Counter
from datetime import date, datetime
from pathlib import Path

import pymssql
import requests
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

BATCH = 500          # số dòng mỗi lần POST lên Supabase
HTTP_TIMEOUT = 120

KNOWN_COLORS = [
    "XANH DƯƠNG", "XANH LÁ", "XANH NGỌC", "XANH", "TRẮNG", "ĐEN", "VÀNG",
    "XÁM", "GHI", "ĐỎ", "HỒNG", "CAM", "NÂU", "BE", "KEM", "TÍM",
]


# ---------------------------------------------------------------- tiện ích --

def env(key: str, default: str | None = None) -> str:
    """Trên GitHub Actions, secret chưa đặt sẽ thành chuỗi RỖNG chứ không phải
    thiếu hẳn — nên phải coi rỗng cũng là thiếu, nếu không sẽ đổ lỗi khó hiểu
    tận sâu trong thư viện thay vì báo đúng biến nào chưa có."""
    value = os.environ.get(key, default)
    if value is None or (isinstance(value, str) and not value.strip()):
        sys.exit(f"Thiếu biến {key}. Kiểm tra file .env, hoặc GitHub Secrets nếu chạy trên Actions.")
    return value


BIEN_BAT_BUOC = ["MSSQL_HOST", "MSSQL_DATABASE", "MSSQL_USER", "MSSQL_PASSWORD",
                 "SP_NAME", "SP_DOC_DATE_FROM", "SUPABASE_URL", "SUPABASE_SECRET_KEY"]


def kiem_tra_cau_hinh():
    """Báo MỘT LẦN tất cả biến còn thiếu, thay vì chết ở biến đầu tiên."""
    thieu = [k for k in BIEN_BAT_BUOC if not (os.environ.get(k) or "").strip()]
    if not thieu:
        return
    print("\n!! THIẾU CẤU HÌNH — chưa chạy được\n", file=sys.stderr)
    for k in thieu:
        print(f"     {k}", file=sys.stderr)
    o_dau = "GitHub Secrets của repo" if os.environ.get("GITHUB_ACTIONS") else "file .env ở thư mục gốc"
    print(f"\n   Đặt các biến trên tại: {o_dau}\n", file=sys.stderr)
    sys.exit(1)


def text(value) -> str:
    """pymssql có thể trả bytes với vài kiểu cột — ép hết về str đã strip."""
    if value is None:
        return ""
    if isinstance(value, bytes):
        value = value.decode("utf-8", "replace")
    return " ".join(str(value).split())


def normalize(value) -> str:
    raw = unicodedata.normalize("NFD", text(value).upper())
    return "".join(c for c in raw if unicodedata.category(c) != "Mn").replace("Đ", "D").strip()


def number(value) -> float:
    if value in (None, ""):
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def as_date(value) -> date | None:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(text(value), fmt).date()
        except ValueError:
            continue
    return None


def iso(value: date | None) -> str | None:
    return value.isoformat() if value else None


def split_product_and_color(item_name: str) -> tuple[str, str]:
    """Màu nằm ở đuôi ItemName. Cột Color trong ERP đang rỗng 100% nên phải tách tay."""
    name = text(item_name)
    flat = normalize(name)
    for color in sorted(KNOWN_COLORS, key=len, reverse=True):
        if flat.endswith(normalize(color)):
            base = name[: len(name) - len(color)].strip(" -/")
            return base or name, color.title()
    return name, "Chưa tách màu"


def canonical_status(class_code: str) -> str:
    """ClassCode có cả bản có dấu và không dấu — gộp về một tên duy nhất."""
    raw = text(class_code)
    flat = normalize(raw)
    if not flat:
        return "Chưa xác định"
    if "THEO DON HANG" in flat:
        return "SX theo đơn hàng"
    if "SX DU" in flat:
        return "SX dư"
    return raw


# ------------------------------------------------------------- SQL Server --

def doc_ton_kho(report_date: date) -> list[dict]:
    server, port = env("MSSQL_HOST"), int(env("MSSQL_PORT", "1433"))
    print(f"  Kết nối {server}:{port}/{env('MSSQL_DATABASE')} …", end=" ", flush=True)
    t0 = time.time()
    conn = pymssql.connect(
        server=server, port=port, user=env("MSSQL_USER"),
        password=env("MSSQL_PASSWORD"), database=env("MSSQL_DATABASE"),
        timeout=600, login_timeout=30,
    )
    print(f"ok ({(time.time() - t0) * 1000:.0f} ms)")

    sql = f"""EXECUTE {env('SP_NAME')}
        @_DocDate1=%s, @_DocDate2=%s, @_WarehouseCode=%s, @_lookupModeWarehouse=%s,
        @_ItemCode=%s, @_lookupModeItem=%s, @_Delivery=%s, @_ForeignCurrencyOnly=%s,
        @_nUserId=%s, @_LangId=%s, @_Ma_Dvcs=%s, @_CurrencyCode0=%s"""
    args = (
        f"{env('SP_DOC_DATE_FROM')} 00:00:00", f"{report_date} 23:59:59",
        env("SP_WAREHOUSE_CODE"), int(env("SP_LOOKUP_MODE_WAREHOUSE")),
        env("SP_ITEM_CODE"), int(env("SP_LOOKUP_MODE_ITEM")), int(env("SP_DELIVERY")),
        int(env("SP_FOREIGN_CURRENCY_ONLY")), int(env("SP_USER_ID")),
        int(env("SP_LANG_ID")), env("SP_MA_DVCS"), env("SP_CURRENCY_CODE"),
    )
    print(f"  Chạy {env('SP_NAME')} …", end=" ", flush=True)
    t0 = time.time()
    cur = conn.cursor(as_dict=True)
    cur.execute(sql, args)
    rows = cur.fetchall()
    conn.close()
    print(f"ok ({time.time() - t0:.1f}s, {len(rows):,} dòng)")
    return rows


# ------------------------------------------------------------ chuẩn hoá ----

def chuan_hoa(rows: list[dict], report_date: date) -> tuple[list[dict], list[dict]]:
    ton, bien_dong = [], []

    for row in rows:
        receipt_date = as_date(row.get("ReceiptDate"))
        delivery_date = as_date(row.get("DeliveryDate1") or row.get("DeliveryDate"))
        product, color = split_product_and_color(row.get("ItemName"))

        receipt_volume, receipt_units = number(row.get("ReceiptQuantity")), number(row.get("ReceiptQuantity9"))
        delivery_volume, delivery_units = number(row.get("DeliveryQuantity")), number(row.get("DeliveryQuantity9"))
        close_volume, close_units = number(row.get("CloseInventory")), number(row.get("CloseInventory9"))

        warehouse = text(row.get("WarehouseCode")) or "UNKNOWN"
        status = canonical_status(row.get("ClassCode"))

        if close_volume > 0 or close_units > 0:
            ton.append({
                "report_date": report_date.isoformat(),
                "row_id": text(row.get("RowId")),
                "barcode": text(row.get("BarCodeTP")),
                "sku": text(row.get("ItemCode")),
                "product": product,
                "product_full": text(row.get("ItemName")),
                "color": color,
                "warehouse": warehouse,
                "location": text(row.get("LocationCode")) or "Chưa có vị trí",
                "status": status,
                "order_ref": text(row.get("Remark")),          # mã đơn / lệnh SX
                "defect": text(row.get("Remark1")),            # tình trạng lỗi/hư
                "spec_code": text(row.get("InfoCode")),
                "spec_name": text(row.get("InfoName")),
                "foam_code": text(row.get("InfoCode3")),
                "thickness_code": text(row.get("InfoCode5")),
                "doc_no_wo": text(row.get("DocNo_WO")),
                "unit": text(row.get("Unit")) or "tấm",
                "receipt_no": text(row.get("ReceiptNo")),
                "delivery_no": text(row.get("DeliveryNo")),
                "receipt_date": iso(receipt_date),
                "delivery_date": iso(delivery_date),
                "receipt_volume": round(receipt_volume, 4),
                "receipt_units": round(receipt_units, 2),
                "delivery_volume": round(delivery_volume, 4),
                "delivery_units": round(delivery_units, 2),
                "close_volume": round(close_volume, 4),
                "close_units": round(close_units, 2),
                # days_in_stock và age_bucket là cột tự tính trong Postgres — không gửi.
            })

        chung = {"report_date": report_date.isoformat(), "row_id": text(row.get("RowId")),
                 "warehouse": warehouse, "product": product, "color": color, "status": status}
        if receipt_date and (receipt_units > 0 or receipt_volume > 0):
            bien_dong.append({**chung, "event_type": "receipt", "event_date": iso(receipt_date),
                              "units": round(abs(receipt_units), 2), "volume": round(abs(receipt_volume), 4)})
        if delivery_date and (delivery_units > 0 or delivery_volume > 0):
            bien_dong.append({**chung, "event_type": "delivery", "event_date": iso(delivery_date),
                              "units": round(abs(delivery_units), 2), "volume": round(abs(delivery_volume), 4)})

    return ton, bien_dong


def tinh_snapshot(ton: list[dict], report_date: date) -> dict:
    def tuoi(r):
        d = as_date(r["receipt_date"])
        return (report_date - d).days if d else None

    tong_m3 = sum(r["close_volume"] for r in ton)
    tuoi_list = [t for t in (tuoi(r) for r in ton) if t is not None]

    theo_sp = Counter()
    for r in ton:
        theo_sp[r["product_full"]] += r["close_volume"]
    top5 = sum(v for _, v in theo_sp.most_common(5))

    return {
        "report_date": report_date.isoformat(),
        "stock_rows": len(ton),
        "total_units": round(sum(r["close_units"] for r in ton), 2),
        "total_volume": round(tong_m3, 4),
        "avg_age_days": round(sum(tuoi_list) / len(tuoi_list), 1) if tuoi_list else None,
        "volume_ordered": round(sum(r["close_volume"] for r in ton if r["status"] == "SX theo đơn hàng"), 4),
        "volume_surplus": round(sum(r["close_volume"] for r in ton if r["status"] == "SX dư"), 4),
        "volume_other": round(sum(r["close_volume"] for r in ton
                                  if r["status"] not in ("SX theo đơn hàng", "SX dư")), 4),
        "defect_blocks": sum(1 for r in ton if r["defect"]),
        "volume_over_60d": round(sum(r["close_volume"] for r in ton if (tuoi(r) or 0) > 60), 4),
        "volume_over_90d": round(sum(r["close_volume"] for r in ton if (tuoi(r) or 0) > 90), 4),
        "top5_share_pct": round(top5 / tong_m3 * 100, 2) if tong_m3 else None,
    }


# --------------------------------------------------------------- Supabase --

class Supabase:
    def __init__(self):
        self.base = env("SUPABASE_URL").rstrip("/") + "/rest/v1"
        key = env("SUPABASE_SECRET_KEY")
        self.s = requests.Session()
        self.s.headers.update({
            "apikey": key, "Authorization": f"Bearer {key}",
            "Content-Type": "application/json", "Prefer": "return=minimal",
        })

    def _check(self, resp, viec):
        if resp.status_code >= 300:
            raise RuntimeError(f"Supabase {viec} lỗi {resp.status_code}: {resp.text[:400]}")
        return resp

    def xoa_theo_ngay(self, bang: str, report_date: date):
        self._check(self.s.delete(f"{self.base}/{bang}",
                                  params={"report_date": f"eq.{report_date}"},
                                  timeout=HTTP_TIMEOUT), f"xoá {bang}")

    def xoa_ngay_khac(self, bang: str, report_date: date):
        """Dùng cho movements: mỗi lượt chạy đã trả về TOÀN BỘ lịch sử nhập-xuất,
        nên giữ nhiều bản theo ngày chỉ là chép lại cùng một dữ liệu — sau 1 năm
        bảng phình lên 3,7 triệu dòng và vượt hạn mức 500 MB của gói miễn phí.

        Xoá các ngày KHÁC chứ không xoá sạch, và chỉ gọi SAU khi đã ghi xong bộ
        mới. Nếu xoá trước rồi ghi lỗi giữa chừng thì bảng trống rỗng và biểu đồ
        nhịp nhập xuất biến mất cho tới lượt đồng bộ kế tiếp."""
        self._check(self.s.delete(f"{self.base}/{bang}",
                                  params={"report_date": f"neq.{report_date}"},
                                  timeout=HTTP_TIMEOUT), f"dọn ngày cũ khỏi {bang}")

    def them(self, bang: str, rows: list[dict]):
        for i in range(0, len(rows), BATCH):
            self._check(self.s.post(f"{self.base}/{bang}", json=rows[i:i + BATCH],
                                    timeout=HTTP_TIMEOUT), f"ghi {bang}")

    def ghi_de(self, bang: str, rows: list[dict], on_conflict: str):
        headers = {"Prefer": "resolution=merge-duplicates,return=minimal"}
        self._check(self.s.post(f"{self.base}/{bang}", json=rows, headers=headers,
                                params={"on_conflict": on_conflict},
                                timeout=HTTP_TIMEOUT), f"ghi đè {bang}")

    def mo_phien(self, report_date: date, doc_from: str, doc_to: date) -> int | None:
        """Ghi lại luôn khoảng ngày đã kéo từ SQL Server, để app hiển thị rõ
        cho người xem biết số liệu này phủ từ ngày nào tới ngày nào."""
        r = self.s.post(f"{self.base}/sync_runs",
                        json=[{"status": "running", "report_date": report_date.isoformat(),
                               "doc_date_from": doc_from, "doc_date_to": doc_to.isoformat()}],
                        headers={"Prefer": "return=representation"}, timeout=HTTP_TIMEOUT)
        return r.json()[0]["id"] if r.status_code < 300 and r.json() else None

    def dong_phien(self, run_id, status, rows_loaded=None, message=None, source_rows=None):
        if run_id is None:
            return
        self.s.patch(f"{self.base}/sync_runs", params={"id": f"eq.{run_id}"},
                     json={"status": status, "finished_at": datetime.now().astimezone().isoformat(),
                           "rows_loaded": rows_loaded, "source_rows": source_rows, "message": message},
                     timeout=HTTP_TIMEOUT)


# ------------------------------------------------------------------ main ---

def main() -> int:
    ap = argparse.ArgumentParser(description="Đồng bộ tồn kho mousse lên Supabase")
    ap.add_argument("--dry-run", action="store_true", help="Đọc SQL Server nhưng không ghi Supabase")
    ap.add_argument("--date", help="Ngày báo cáo YYYY-MM-DD (mặc định: hôm nay)")
    args = ap.parse_args()

    report_date = (datetime.strptime(args.date, "%Y-%m-%d").date() if args.date
                   else as_date(os.environ.get("SP_DOC_DATE_TO")) or date.today())

    kiem_tra_cau_hinh()
    print(f"\n=== ĐỒNG BỘ TỒN KHO — ngày báo cáo {report_date} ===\n")
    t0 = time.time()

    sb = None if args.dry_run else Supabase()
    doc_from = env("SP_DOC_DATE_FROM")
    print(f"  Khoảng ngày kéo từ SQL: {doc_from} → {report_date}\n")
    run_id = sb.mo_phien(report_date, doc_from, report_date) if sb else None

    try:
        rows = doc_ton_kho(report_date)
        ton, bien_dong = chuan_hoa(rows, report_date)
        snapshot = tinh_snapshot(ton, report_date)

        print(f"\n  Tồn kho     : {len(ton):,} block · {snapshot['total_volume']:,.1f} m³")
        print(f"  Biến động   : {len(bien_dong):,} lượt nhập/xuất")
        print(f"  Tuổi TB     : {snapshot['avg_age_days']} ngày")
        print(f"  Hàng lỗi/hư : {snapshot['defect_blocks']} block")
        print(f"  SX dư       : {snapshot['volume_surplus']:,.1f} m³ "
              f"({snapshot['volume_surplus'] / snapshot['total_volume'] * 100:.0f}%)")

        if args.dry_run:
            print("\n  [--dry-run] Bỏ qua bước ghi Supabase.")
            return 0

        print("\n  Ghi lên Supabase …")

        # inventory: giữ ảnh chụp riêng cho từng ngày — đây chính là lịch sử
        # dùng để so sánh "tuần này với tuần trước" ở giai đoạn sau.
        sb.xoa_theo_ngay("inventory", report_date)
        sb.them("inventory", ton)
        print(f"    {'inventory':<12} {len(ton):,} dòng  (ảnh chụp ngày {report_date})")

        # Ghi bộ mới TRƯỚC, dọn ngày cũ SAU — nếu ghi lỗi thì dữ liệu cũ vẫn còn
        # nguyên thay vì để bảng trống. Xem chú thích ở xoa_ngay_khac().
        sb.xoa_theo_ngay("movements", report_date)
        sb.them("movements", bien_dong)
        sb.xoa_ngay_khac("movements", report_date)
        print(f"    {'movements':<12} {len(bien_dong):,} dòng  (thay toàn bộ)")
        sb.ghi_de("snapshots", [snapshot], on_conflict="report_date")
        print(f"    {'snapshots':<12} 1 dòng")

        sb.dong_phien(run_id, "success", len(ton),
                      f"{len(ton)} block, {snapshot['total_volume']:.1f} m³",
                      source_rows=len(rows))
        print(f"\n=== XONG sau {time.time() - t0:.1f}s ===\n")
        return 0

    except Exception as exc:
        print(f"\n!! LỖI: {exc}\n", file=sys.stderr)
        if sb:
            sb.dong_phien(run_id, "failed", None, str(exc)[:500])
        return 1


if __name__ == "__main__":
    sys.exit(main())
