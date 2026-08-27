# Bàn giao — Havas Inventory Intelligence

Tài liệu này giữ những gì **không đọc ra được từ mã nguồn**: quyết định đã chốt,
sự thật về dữ liệu phải mất công mới xác lập, và chỗ cất từng bí mật.

Cập nhật: 27/08/2026 · commit `74da37a`

---

## 1. Hệ thống là gì

```
SQL Server (ERP)  →  sync.py  →  Supabase  →  App tĩnh
   nội bộ            GitHub      Singapore     GitHub Pages
                     Actions     Postgres      repo PUBLIC
                                 + Auth        (chỉ mã nguồn)
                                 + Realtime
```

**Nguyên tắc gốc: repo công khai được vì trong repo KHÔNG có một dòng dữ liệu nào.**
Toàn bộ số liệu nằm trong Supabase, sau lớp đăng nhập. Mọi thay đổi về sau phải
giữ nguyên tắc này.

| | |
|---|---|
| App | https://louisle-hash.github.io/havas-inventory-intelligence/ |
| Repo | `louisle-hash/havas-inventory-intelligence` (public) |
| Supabase | `sgsrtpsvhnyjdmlevskr` · Singapore ap-southeast-1 |
| SQL Server | `115.75.10.155:1433` · DB `B7R2_Havas_NB_2015` · máy `HAVAS` · SQL 2019 Standard |
| Stored procedure | `usp_Vcd_TongHopNhapXuatMousseBlockData` — 19 tham số, truyền 12 |
| Chi phí | 0đ/tháng |

---

## 2. Bí mật cất ở đâu

| Bí mật | Chỗ cất | Ghi chú |
|---|---|---|
| Mật khẩu SQL Server | `.env` (máy) + GitHub Secrets | user `sa` |
| Supabase secret key | `.env` + GitHub Secrets | bỏ qua mọi RLS |
| Supabase publishable key | `config.js` — **công khai, đúng thiết kế** | RLS mới là lớp chặn thật |
| GitHub token cho cron | Supabase Vault, tên `github_pat_havas_cron` | chỉ quyền Actions trên 1 repo |
| Mật khẩu database Supabase | Trình quản lý mật khẩu của anh Louis | Claude không giữ |

`.gitignore` chặn `.env`, `*.csv`, `*.xlsx`, `data/*.json`, `test/`.

---

## 3. Sự thật về dữ liệu — đã kiểm chứng, đừng đoán lại

| Sự thật | Bằng chứng |
|---|---|
| `RowId` **duy nhất tuyệt đối** — dùng làm khoá | 2.178/2.178 phân biệt |
| `BarCodeTP` **KHÔNG duy nhất** | chỉ 2.076 mã cho 2.178 dòng |
| Cột `Color` trong ERP **rỗng 100%** | phải tách màu từ đuôi `ItemName` |
| `CloseInventory` = `Length×Width×Height/1e9` **chính xác tuyệt đối** | kiểm 400 dòng, 0 lệch |
| Không dòng nào thiếu kích thước | 0/3.183 |
| `@_DocDate1` **KHÔNG** ảnh hưởng tồn kho, chỉ `@_DocDate2` | chạy A/B 1 tháng vs 19 tháng → giống hệt |
| Tồn "trên 90 ngày = 0" là **ĐÚNG**, không phải lỗi | block cũ nhất 83 ngày; kho quay vòng nhanh |
| SQL Server **mở ra Internet** | GitHub Actions ở nước ngoài kết nối được, 1.984ms |
| Thời gian chạy proc **dao động 4–152 giây** | cùng truy vấn, cùng tham số → timeout để 600s |
| 44% block **không có mã vị trí kho** | chặn mọi tính năng "đi lấy hàng" |
| `Remark` = mã đơn/lệnh SX, **không phải** trạng thái phụ | `SST-179--Mousse tấm`, `WB2604-0029` |
| `Remark1` = tình trạng lỗi, nhập tự do | 14 loại lỗi hiển thị thành 15 vì khác cách gõ |

---

## 4. Quyết định đã chốt — không tự ý đổi

| Quyết định | Ai chốt | Lý do |
|---|---|---|
| Repo giữ **public** | Louis | Đổi lại → dữ liệu phải rời Supabase, phá cả kiến trúc |
| Dùng tài khoản **`sa`** | Louis, sau khi nghe rủi ro | Claude đã nêu một lần, không nhắc lại |
| **Giữ nguyên văn** `Remark1` từ SQL, không gộp cách viết | Louis | App phải là gương trung thực của ERP |
| Chỉ hiện block **còn tồn**, không hiện lịch sử đã xuất | Louis | Đúng phạm vi "báo cáo tồn kho" |
| **Không dọn** dữ liệu tháng 7 khỏi lịch sử git | Louis (phương án B) | Ảnh chụp kho 28/07 vẫn tải được từ commit cũ |
| Lịch chạy qua **Supabase pg_cron**, không dùng lịch GitHub | Claude đề xuất, Louis chọn | GitHub bỏ lỡ 21/24 lượt ngày 26/08, hôm sau bỏ hẳn |

---

## 5. Ba bảng, ba cách ghi — chỗ dễ hiểu nhầm nhất

| Bảng | Cách ghi mỗi lượt | Vì sao |
|---|---|---|
| `inventory` | Xoá đúng ngày hôm nay rồi chèn lại | Mỗi ngày một ảnh chụp riêng → **đây là lịch sử** để so kỳ |
| `movements` | Ghi bộ mới trước, **dọn ngày cũ sau** | Mỗi lượt đã trả toàn bộ lịch sử; giữ theo ngày → 3,7 triệu dòng/năm, vượt 500 MB |
| `snapshots` | Ghi đè theo ngày | Một ngày đúng một dòng |
| `sync_runs` | Chỉ thêm | Nhật ký vận hành |
| `login_log` | Chỉ thêm — **bảng kiểm toán** | User không sửa/xoá được dấu vết của mình |

**Mọi bảng đều xoá-rồi-ghi-lại, không cộng dồn** → chạy lại bao nhiêu lần cũng
ra cùng kết quả. Chạy bù an toàn.

---

## 6. Việc hay làm

```bash
# Đồng bộ tay
.venv/bin/python scripts/sync.py

# Chạy thử, không ghi Supabase
.venv/bin/python scripts/sync.py --dry-run

# Chạy cho một ngày cụ thể
.venv/bin/python scripts/sync.py --date 2026-08-26

# Xem app cục bộ  (BẮT BUỘC qua http://, không mở file://)
python3 -m http.server 4199

# Đẩy .env lên GitHub Secrets
.venv/bin/python scripts/dat-secrets.py
```

**Sau mỗi lần sửa `app.js` / `styles.css` / `auth.js` phải cập nhật vân phiên
bản trong `index.html`**, nếu không người dùng cũ vẫn chạy bản cũ từ cache:

```bash
python3 -c "
import hashlib, re, pathlib
v = lambda f: hashlib.sha256(pathlib.Path(f).read_bytes()).hexdigest()[:8]
p = pathlib.Path('index.html'); h = p.read_text(encoding='utf-8')
p.write_text(re.sub(r'(href|src)=\"(styles\.css|config\.js|app\.js|auth\.js)(\?v=[0-9a-f]+)?\"',
    lambda m: f'{m.group(1)}=\"{m.group(2)}?v={v(m.group(2))}\"', h), encoding='utf-8')
print('xong')"
```

Khi nghi lịch tự động không chạy: mở `scripts/cron-supabase.sql`, phần cuối có
6 câu tra cứu kèm ý nghĩa mã lỗi (204 = OK · 401 = token sai · 404 = sai repo).

---

## 7. Còn treo

**Câu hỏi nghiệp vụ — quan trọng hơn mọi tính năng:**

1. **THÍ NGHIỆM chiếm 217,4 m³ = 19% kho.** Gần một phần năm kho là hàng thí
   nghiệm, chưa ai giải thích đó là gì.
2. **4 phiếu xuất bị huỷ ngày 26/08** làm 97 block quay lại kho, trong đó 31
   block có ghi lỗi. Ba trong bốn phiếu đó chính là phiếu chứa hàng lỗi. Chưa rõ
   là trả hàng do lỗi hay chỉ huỷ chứng từ để làm lại.
3. **`quang.nv@havas.vn` chưa từng đăng nhập.** Hệ thống xây cho ban giám đốc
   nhưng người đầu tiên được cấp tài khoản chưa mở lần nào.

**Kỹ thuật:**

4. **Trang "Biến động kỳ"** — đợi `snapshots` đủ 2–4 tuần (giữa tháng 9). Hai
   ngày đầu bị méo bởi vụ huỷ phiếu nên không dùng để vẽ xu hướng được.
5. Danh mục lỗi `Remark1` nhập tự do → càng dùng lâu càng phân mảnh. Cần kho
   chốt khoảng 10 loại cố định trong ERP. Không phải việc code.
6. Tài khoản chỉ-đọc cho SQL thay cho `sa` — khi nào IT sẵn sàng, chỉ đổi 2 dòng
   trong `.env` và GitHub Secrets.

**Đã bỏ, đừng làm lại:** chia lại dải tuổi tồn. Lý do ban đầu (dồn cục vào 2 dải)
đã tự biến mất; 4 dải đang dùng đều có số liệu, 2 dải cuối rỗng là **thông tin
đúng** và còn hữu ích để bắt hàng tồn lâu về sau.
