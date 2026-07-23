from __future__ import annotations

import csv
import json
import math
import unicodedata
from collections import Counter
from datetime import date, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "inventory.json"
REPORT_DATE = date(2026, 7, 23)
CSV_PATTERN = "*TongHopNhapXuatMousseBlo*.csv"

WAREHOUSE_META = {
    "TP20": {"label": "TP20", "role": "Kho mousse tổng"},
    "TP24NEM": {"label": "TP24NEM", "role": "Kho mousse dành cho nệm"},
}

KNOWN_COLORS = [
    "XANH DƯƠNG",
    "XANH LÁ",
    "XANH NGỌC",
    "XANH",
    "TRẮNG",
    "ĐEN",
    "VÀNG",
    "XÁM",
    "GHI",
    "ĐỎ",
    "HỒNG",
    "CAM",
    "NÂU",
    "BE",
    "KEM",
    "TÍM",
]


def pick_source() -> Path:
    files = sorted(ROOT.glob(CSV_PATTERN), key=lambda path: path.stat().st_mtime, reverse=True)
    if not files:
        raise FileNotFoundError(f"Không tìm thấy file CSV khớp mẫu {CSV_PATTERN}")
    return files[0]


def normalize(value: str | None) -> str:
    if value is None:
        return ""
    text = unicodedata.normalize("NFD", str(value).upper())
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    return text.replace("Đ", "D").strip()


def parse_float(value: str | None) -> float:
    if value in (None, ""):
        return 0.0
    return float(str(value).replace(",", ""))


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    text = str(value).strip()
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def iso_date(value: date | None) -> str:
    return value.isoformat() if value else ""


def split_product_and_color(item_name: str) -> tuple[str, str]:
    text = " ".join((item_name or "").strip().split())
    normalized = normalize(text)
    for color in sorted(KNOWN_COLORS, key=len, reverse=True):
        suffix = normalize(color)
        if normalized.endswith(suffix):
            base = text[: len(text) - len(color)].strip(" -/")
            return base or text, color.title()
    return text, "Chưa tách màu"


def canonical_status(class_code: str) -> str:
    text = " ".join((class_code or "").strip().split())
    normalized = normalize(text)
    if not normalized:
        return "Chưa xác định"
    if "THEO DON HANG" in normalized:
        return "SX theo đơn hàng"
    if "SX DU" in normalized:
        return "SX dư"
    return text


def age_bucket(days: int | None) -> str:
    if days is None:
        return "Thiếu ngày nhập"
    if days <= 7:
        return "0–7 ngày"
    if days <= 30:
        return "8–30 ngày"
    if days <= 60:
        return "31–60 ngày"
    if days <= 90:
        return "61–90 ngày"
    if days <= 180:
        return "91–180 ngày"
    return ">180 ngày"


def week_key(value: date | None) -> str:
    if not value:
        return ""
    year, week, _ = value.isocalendar()
    return f"{year}-W{week:02d}"


def safe_round(value: float, digits: int = 4) -> float:
    return round(value + 0.0, digits)


source = pick_source()

with source.open("r", encoding="utf-8-sig", newline="") as handle:
    rows = list(csv.DictReader(handle))

raw_records = []
stock_records = []
movement_events = []
color_counter = Counter()
status_counter = Counter()

for index, row in enumerate(rows, start=1):
    # Tuổi tồn được chốt theo nghiệp vụ: ngày báo cáo - ReceiptDate.
    # ReceiptDate1 chỉ là trường ngày đã làm tròn trong kết quả SQL, không dùng để tính tuổi.
    receipt_date = parse_date(row.get("ReceiptDate"))
    delivery_date = parse_date(row.get("DeliveryDate1") or row.get("DeliveryDate"))
    product_name, color = split_product_and_color(row.get("ItemName", ""))
    status = canonical_status(row.get("ClassCode", ""))
    receipt_volume = parse_float(row.get("ReceiptQuantity"))
    receipt_units = parse_float(row.get("ReceiptQuantity9"))
    delivery_volume = parse_float(row.get("DeliveryQuantity"))
    delivery_units = parse_float(row.get("DeliveryQuantity9"))
    close_volume = parse_float(row.get("CloseInventory"))
    close_units = parse_float(row.get("CloseInventory9"))
    age_days = (REPORT_DATE - receipt_date).days if receipt_date else None
    warehouse_code = (row.get("WarehouseCode") or "").strip() or "UNKNOWN"
    warehouse_meta = WAREHOUSE_META.get(warehouse_code, {"label": warehouse_code, "role": "Kho khác"})

    record = {
        "id": index,
        "sku": (row.get("ItemCode") or "").strip(),
        "barcode": (row.get("BarCodeTP") or "").strip(),
        "rowId": (row.get("RowId") or "").strip(),
        "product": product_name,
        "productFull": " ".join((row.get("ItemName") or "").strip().split()),
        "color": color,
        "warehouse": warehouse_code,
        "warehouseLabel": warehouse_meta["label"],
        "warehouseRole": warehouse_meta["role"],
        "location": (row.get("LocationCode") or "").strip() or "Chưa có vị trí",
        "status": status,
        "statusSecondary": (row.get("Remark") or "").strip(),
        "statusTertiary": (row.get("Remark1") or "").strip(),
        "specCode": (row.get("InfoCode") or "").strip(),
        "specName": (row.get("InfoName") or "").strip(),
        "foamCode": (row.get("InfoCode3") or "").strip(),
        "thicknessCode": (row.get("InfoCode5") or "").strip(),
        "receiptVolume": safe_round(receipt_volume),
        "receiptUnits": safe_round(receipt_units),
        "deliveryVolume": safe_round(delivery_volume),
        "deliveryUnits": safe_round(delivery_units),
        "closeVolume": safe_round(close_volume),
        "closeUnits": safe_round(close_units),
        "unit": (row.get("Unit") or "").strip() or "tấm",
        "receiptDate": iso_date(receipt_date),
        "deliveryDate": iso_date(delivery_date),
        "receiptWeek": week_key(receipt_date),
        "deliveryWeek": week_key(delivery_date),
        "receiptMonth": receipt_date.strftime("%Y-%m") if receipt_date else "",
        "deliveryMonth": delivery_date.strftime("%Y-%m") if delivery_date else "",
        "receiptNo": (row.get("ReceiptNo") or "").strip(),
        "deliveryNo": (row.get("DeliveryNo") or "").strip(),
        "daysInStock": age_days,
        "ageBucket": age_bucket(age_days),
    }

    raw_records.append(record)
    color_counter[color] += 1
    status_counter[status] += 1

    if close_units > 0 or close_volume > 0:
        stock_records.append(record)

    if receipt_date and (receipt_units > 0 or receipt_volume > 0):
        movement_events.append(
            {
                "type": "receipt",
                "date": iso_date(receipt_date),
                "week": week_key(receipt_date),
                "month": receipt_date.strftime("%Y-%m"),
                "warehouse": warehouse_code,
                "product": product_name,
                "color": color,
                "status": status,
                "units": safe_round(abs(receipt_units)),
                "volume": safe_round(abs(receipt_volume)),
            }
        )

    if delivery_date and (delivery_units > 0 or delivery_volume > 0):
        movement_events.append(
            {
                "type": "delivery",
                "date": iso_date(delivery_date),
                "week": week_key(delivery_date),
                "month": delivery_date.strftime("%Y-%m"),
                "warehouse": warehouse_code,
                "product": product_name,
                "color": color,
                "status": status,
                "units": safe_round(abs(delivery_units)),
                "volume": safe_round(abs(delivery_volume)),
            }
        )


active_receipt_dates = [parse_date(record["receiptDate"]) for record in stock_records if record["receiptDate"]]
active_receipt_dates = [value for value in active_receipt_dates if value]

summary = {
    "stockRows": len(stock_records),
    "rawRows": len(raw_records),
    "activeProducts": len({record["productFull"] for record in stock_records}),
    "activeColors": len({record["color"] for record in stock_records}),
    "activeWarehouses": len({record["warehouse"] for record in stock_records}),
    "activeUnits": safe_round(sum(record["closeUnits"] for record in stock_records), 2),
    "activeVolume": safe_round(sum(record["closeVolume"] for record in stock_records), 4),
    "agedOver90Units": safe_round(sum(record["closeUnits"] for record in stock_records if (record["daysInStock"] or 0) > 90), 2),
    "agedOver90Volume": safe_round(sum(record["closeVolume"] for record in stock_records if (record["daysInStock"] or 0) > 90), 4),
    "avgAgeDays": safe_round(
        sum(record["daysInStock"] for record in stock_records if record["daysInStock"] is not None)
        / max(len([record for record in stock_records if record["daysInStock"] is not None]), 1),
        1,
    ),
}

payload = {
    "meta": {
        "source": source.name,
        "reportDate": REPORT_DATE.isoformat(),
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "logic": {
            "productField": "ItemName",
            "colorRule": "Tách màu từ đuôi ItemName",
            "statusPrimaryField": "ClassCode",
            "statusSecondaryFields": ["Remark", "Remark1"],
            "stockRule": "Chỉ giữ các dòng tồn dương theo CloseInventory hoặc CloseInventory9 cho báo cáo tồn hiện tại",
            "ageRule": "Tuổi tồn = reportDate - ReceiptDate (theo ngày lịch)",
        },
        "availableDates": {
            "stockMinReceipt": iso_date(min(active_receipt_dates) if active_receipt_dates else None),
            "stockMaxReceipt": iso_date(max(active_receipt_dates) if active_receipt_dates else None),
        },
    },
    "summary": summary,
    "dictionaries": {
        "warehouses": [
            {"code": code, "label": meta["label"], "role": meta["role"]}
            for code, meta in WAREHOUSE_META.items()
        ],
        "colors": sorted(color_counter),
        "statuses": sorted(status_counter),
    },
    "rawRecords": raw_records,
    "records": stock_records,
    "movements": movement_events,
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {len(stock_records)} stock rows and {len(movement_events)} movement events to {OUTPUT.relative_to(ROOT)}")
