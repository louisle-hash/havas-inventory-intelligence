# Bàn giao — Havas Inventory Intelligence

Tài liệu này giữ những gì **không đọc ra được từ mã nguồn**: quyết định đã chốt,
sự thật về dữ liệu phải mất công mới xác lập, và chỗ cất từng bí mật.

Cập nhật: 27/08/2026 (lần 2) · commit `193da01` + phần phân quyền chưa commit

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
| **ERP KHÔNG có cột khách hàng** | Kiểm cả 44 cột stored procedure trả về; các cột `sync.py` bỏ đều là cột cấu trúc hoặc trùng |
| Tên khách nằm lẫn trong `Remark`, dạng `KHÁCH-MÃ ĐƠN-mô tả` | `QUỐC PHONG-QP-2607-01` · `ĐH-JANGIN` · `ASHT-883.R0--Mousse tấm` |
| Chỉ **52,9%** m³ quy được về khách hàng | Đo trên tồn 28/08/2026: 1.036/1.957 m³ |
| **21,0%** m³ có ô mã đơn để TRỐNG | 410 m³ · 126 block — không quy được về ai |
| `movements` KHÔNG có mã đơn | Nên không phân tích được nhập–xuất theo khách, chỉ phân tích được tồn hiện tại |

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
| **hau.le@havas.vn** là quản trị viên đầu tiên | Claude đặt mặc định 27/08 | Phải có ít nhất một admin, nếu không màn hình Cấu hình không ai mở được. Đổi được trong app |
| Ba tài khoản còn lại mặc định **member**, chưa cấp 3 màn hình quản trị | Claude đặt mặc định 27/08 | Đúng ý "có user không được xem màn hình quản trị". Quản trị viên tự cấp thêm |
| Việc giao: **mọi member sửa được mọi việc**, chỉ người tạo và admin xoá được | Claude đề xuất 27/08 | Họp thì ai cập nhật cũng được; nhưng xoá là mất dấu nên siết hơn |
| **Phương án B** cho màn hình Theo khách hàng: gộp tên khách theo luật, nhưng công khai luật + cho xem nguyên văn | Louis, 28/08 | Giữ nguyên văn thì ra 59 nhóm lẫn lộn, không dùng được. Gộp mà giấu thì phá nguyên tắc trung thực. B là đường giữa |
| **KHÔNG viết lại lịch sử git** để xoá dữ liệu cũ đã từng lọt vào repo | Louis, 27/08 | Chỉ quan tâm dữ liệu đang kéo từ SQL về. Số liệu kho của tháng 7 không còn giá trị. **Claude đã nêu một lần kèm ba phương án — không nhắc lại nữa** |

---

## 5. Ba bảng, ba cách ghi — chỗ dễ hiểu nhầm nhất

| Bảng | Cách ghi mỗi lượt | Vì sao |
|---|---|---|
| `inventory` | Xoá đúng ngày hôm nay rồi chèn lại | Mỗi ngày một ảnh chụp riêng → **đây là lịch sử** để so kỳ |
| `movements` | Ghi bộ mới trước, **dọn ngày cũ sau** | Mỗi lượt đã trả toàn bộ lịch sử; giữ theo ngày → 3,7 triệu dòng/năm, vượt 500 MB |
| `snapshots` | Ghi đè theo ngày | Một ngày đúng một dòng |
| `sync_runs` | Chỉ thêm | Nhật ký vận hành |
| `login_log` | Chỉ thêm — **bảng kiểm toán** | User không sửa/xoá được dấu vết của mình |
| `app_users` | Sửa tại chỗ, chỉ quản trị viên | Vai trò + danh sách màn hình của từng tài khoản |
| `tasks` | Người dùng tự thêm / sửa / xoá | Việc giao trong họp — **không** do sync.py đụng tới |

**Năm bảng do sync.py ghi đều xoá-rồi-ghi-lại, không cộng dồn** → chạy lại bao
nhiêu lần cũng ra cùng kết quả. Chạy bù an toàn.

`app_users` và `tasks` **nằm ngoài vòng đó**: do người dùng nhập, sync.py không
bao giờ đụng tới. Chạy lại sync.py không làm mất việc đã giao hay quyền đã cấp.

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

## 7. Phân quyền — thêm 27/08/2026

### Ba vai trò

| Vai trò | Sửa được cấu hình tài khoản | Giao / sửa việc | Màn hình xem được |
|---|---|---|---|
| `admin` | Có | Có | **Tất cả**, bất kể `allowed_pages` ghi gì |
| `member` | Không | Có | Theo `allowed_pages` |
| `viewer` | Không | Không | Theo `allowed_pages` |

Đổi vai trò và danh sách màn hình ngay trong app: màn hình **Cấu hình tài khoản**.
Thêm tài khoản mới thì vẫn tạo ở Supabase Dashboard > Authentication > Users;
một trigger sẽ tự sinh hồ sơ với vai trò `viewer`.

### Điều dễ hiểu sai nhất — phải nói thẳng với người dùng

`allowed_pages` là **hàng rào giao diện, không phải hàng rào dữ liệu.**

Chín màn hình nghiệp vụ đều đọc chung hai bảng `inventory` và `movements`. Bỏ
"Theo kho" khỏi danh sách của ai đó thì người đó không thấy nút vào, nhưng người
biết mở công cụ lập trình của trình duyệt vẫn đọc được toàn bộ số liệu kho.

Chỉ **hai** trường hợp được chặn tới tận tầng dữ liệu, vì chúng đọc bảng riêng
và có policy riêng:

| Màn hình | Bảng | Policy |
|---|---|---|
| Nhật ký | `login_log` | `using (public.duoc_xem_trang('logs'))` |
| Cấu hình tài khoản | `app_users` | chỉ đọc dòng của chính mình, trừ admin |

→ Dùng `allowed_pages` để **dọn màn hình cho gọn đúng vai trò**. Muốn ai đó
không thấy số liệu kho thì **đừng cấp tài khoản** cho người đó.

### Ba tấm lưới an toàn đã cài trong database

1. **Ba hàm tra quyền bắt buộc là `security definer`.** Nếu để hàm thường, policy
   trên `app_users` phải đọc `app_users` để biết ai là admin, mà đọc `app_users`
   lại kích hoạt chính policy đó → Postgres báo đệ quy vô hạn và **không ai đăng
   nhập được nữa**. Đừng bỏ `security definer`, cũng đừng bỏ `set search_path`.
2. **Trigger `app_users_giu_quan_tri`** chặn tình huống quản trị viên cuối cùng
   tự hạ vai trò mình — gỡ ra chỉ còn cách vào SQL Editor sửa tay.
3. **Quyền UPDATE cấp theo cột.** Policy chặn được "ai sửa" nhưng không chặn được
   "sửa cột nào"; không có `grant update (…cột…)` thì một member có thể sửa
   `created_by` của việc người khác thành tên mình.

### Dọn dữ liệu cũ — 27/08/2026

Thư mục làm việc không còn file dữ liệu nào. Năm file (2 CSV export từ ERP,
2 Excel, `inventory.json` — tổng 5,6 MB) đã chuyển vào
`obsolete/2026-08/du-lieu-cu/`, giữ trên đĩa để tra nhưng `.gitignore` chặn tuyệt đối.

Kéo theo: `scripts/build_data.py` **không còn chạy được** vì mất file CSV đầu vào.
Nó là đường cũ đã ngừng dùng từ khi chuyển sang Supabase, giữ lại chỉ để đọc.

Hai file dữ liệu từng **được git theo dõi** dù `.gitignore` đã có luật chặn:
`_USE_B7R2_..._202607230935.csv` và `Báo cáo tồn kho mousse block.xlsx`.
Cả hai đã gỡ khỏi nhánh `main`. Nguyên nhân: **`.gitignore` chỉ chặn file CHƯA
được theo dõi** — file đã vào git rồi thì luật không có tác dụng. Từ nay kiểm bằng
`git ls-files | grep -iE '\.csv|\.xlsx|\.json'`, đừng tin vào `.gitignore`.

Cẩn thận một cái bẫy khi kiểm: tên file có dấu cách thì `git ls-files` bọc trong
dấu nháy kép, nên `grep '\.xlsx$'` **không khớp** — chính vì vậy lần rà đầu bỏ sót
file Excel. Bỏ dấu `$` neo cuối dòng đi.

### Việc giao không còn ở trình duyệt

Bảng `tasks` trên Supabase, bật Realtime — giao xong hiện ngay trên máy người
khác. App **không còn ghi vào localStorage**; lần chạy đầu nó đọc khoá cũ
`havas-inventory-tasks-v1` một lần, đẩy nốt việc cũ lên Supabase (cột `legacy_id`
có ràng buộc unique nên không sinh bản trùng dù nhiều máy cùng giữ bản sao), rồi
xoá hẳn khoá đó.

Thứ **duy nhất** còn nằm trong localStorage là **phiếu đăng nhập của Supabase
Auth**. Đó là token phiên, không phải dữ liệu kho, và bắt buộc phải có thì đóng
tab mở lại mới không phải đăng nhập lại.

### Đã nghiệm thu trên Supabase thật — 27/08/2026

`scripts/phan-quyen-supabase.sql` đã chạy trên project `sgsrtpsvhnyjdmlevskr`,
nhánh `main`. Kiểm bằng cách giả lập phiên của `quang.nv@havas.vn` (vai trò
`member`) ngay trong Postgres, mọi phép thử ghi đều bọc trong transaction rồi
rollback nên database không bị đụng.

| Phép thử | Mong đợi | Thực tế |
|---|---|---|
| RLS bật trên `app_users` · `tasks` · `login_log` | bật cả ba | ✅ cả ba |
| 9 policy, 5 hàm tra quyền, 4 trigger | có đủ | ✅ có đủ, cả 5 hàm đều `security definer` |
| `member` đọc `login_log` (không được cấp màn hình Nhật ký) | 0 dòng | ✅ 0 dòng |
| `member` đọc `app_users` | 1 dòng — chỉ mình | ✅ 1 dòng |
| `member` đọc `inventory` | vẫn đọc được | ✅ 780 dòng |
| `member` sửa quyền người khác | 0 dòng | ✅ 0 dòng |
| **`member` tự thăng mình lên `admin`** | **0 dòng** | ✅ **0 dòng** |
| `member` giao việc | 1 dòng | ✅ 1 dòng |
| Hạ quản trị viên **duy nhất** xuống `member` | bị chặn | ✅ `ERROR P0001: Phải còn ít nhất một quản trị viên đang hoạt động` |
| `authenticated` sửa được cột nào của `tasks` | không có `created_by`, `created_at`, `legacy_id` | ✅ chỉ 11 cột nghiệp vụ |
| `authenticated` sửa được cột nào của `app_users` | không có `user_id`, `email`, `created_at` | ✅ chỉ 5 cột |
| Realtime | bật cho `tasks` và `app_users` | ✅ bật cả hai |

**Một điều học được khi kiểm:** đổi `role` bằng `set_config()` giữa chừng một câu
lệnh **không** kiểm được RLS — Postgres quyết định áp policy nào ở lúc **lập kế
hoạch**, trước khi CTE chạy, nên truy vấn vẫn đọc đủ dữ liệu và trông như RLS
hỏng. Phải `begin; set local role authenticated; set local "request.jwt.claims" = …;`
rồi mới chạy câu SELECT thì kế hoạch mới được lập với đúng vai trò.

---

## 8. Phân tích theo khách hàng — thêm 28/08/2026

Màn hình **Theo khách hàng** là màn hình DUY NHẤT trong app là **diễn giải**,
không phải số gốc. Mọi màn hình khác đọc thẳng cột từ ERP; màn hình này phải
tự tách tên khách ra khỏi một ô ghi chú tự do.

### Vì sao phải diễn giải

ERP không có cột khách hàng — đã kiểm cả 44 cột. Tên khách nằm trong ô `Remark`
(map thành `statusSecondary`), lẫn với bốn thứ khác. Đo trên tồn 28/08/2026,
tổng 1.957,3 m³:

| Nhóm | m³ | % | Block |
|---|---:|---:|---:|
| **Quy được về khách hàng** | 1.036,3 | **52,9** | 326 |
| Ô mã đơn để trống | 410,3 | 21,0 | 126 |
| Lệnh sản xuất nội bộ `WO`/`IN` | 393,9 | 20,1 | 124 |
| Nhóm nội bộ (thí nghiệm, dự trù, QA, TMĐT) | 78,0 | 4,0 | 27 |
| Ghi chú **lỗi** gõ nhầm vào ô mã đơn | 38,8 | 2,0 | 14 |

→ **27 khách hàng**, 5 khách lớn nhất chiếm 56% phần quy được.

### Quyết định của anh Louis: phương án B

Chọn ngày 28/08/2026 sau khi Claude nêu ba phương án. Gộp theo luật, **nhưng**:

1. Màn hình hiện **thanh độ tin cậy ngay đầu trang** — người xem biết ngay mình
   đang nhìn 52,9% của kho, không phải toàn bộ.
2. Có bảng **"Luật gộp đang áp dụng"** công khai từng luật kèm khối lượng bị ảnh hưởng.
3. Mỗi khách có nút **"Xem nguyên văn"** mở ra đúng các chuỗi gốc từ ERP.

Ba điều đó giữ được tinh thần "app là gương trung thực của ERP" ở mục 4 — không
giấu việc mình đang diễn giải, và luôn lần ngược về số gốc được.

### Bốn cái bẫy trong dữ liệu, đã xử lý trong `phanLoaiDon()`

| Bẫy | Hậu quả nếu bỏ qua | Cách xử lý |
|---|---|---|
| `ĐH-JANGIN`, `ĐH-HMT`, `ĐH-LV` | Ba khách bị gộp thành một khách tên "ĐH", và `PHÁT TRIỂN` bị tách đôi | Với tiền tố `ĐH-`, khách là token thứ **hai** |
| `NỨT`, `RÁCH`, `LEM MÀU`, `ĐỔ DƯ` nằm trong ô mã đơn | Bốn "khách hàng" ma | Khớp tiền tố, xếp vào nhóm "ghi chú lỗi" |
| `ĐỔ TN` (đổ thí nghiệm) vs `ĐỔ DƯ` (lỗi) | Giống nhau hai chữ đầu nhưng khác nhóm hẳn | Luật thí nghiệm khớp `ĐỔ TN` **trước** luật lỗi |
| `SST-128-RL/ASHT-882.R0` — một ô hai khách | Đếm trùng hoặc hụt | Tính cho khách đứng trước, và **ghi rõ giới hạn này trên màn hình** |

Tên chỉ một hai ký tự (`Q`, `T`) được đánh dấu **`?`** — luật đoán được nhưng
chưa đủ chắc là khách hàng.

### Ba việc màn hình này KHÔNG làm được

1. **Không có tiền.** ERP không trả về giá. Xếp hạng chỉ theo m³ và số block.
2. **Không có xu hướng theo khách.** Bảng `movements` không có mã đơn.
3. **Chưa so kỳ được.** Cần `snapshots` đủ 2–4 tuần, khoảng giữa tháng 9.

---

## 9. Còn treo

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
7. **Tạo tài khoản mới vẫn phải vào Supabase Dashboard.** Làm được trong app thì
   cần một Edge Function giữ secret key. Chưa làm vì chỉ có 4 tài khoản.

8. **Kho cần chốt danh mục khách hàng trong ERP.** Đây là cách chữa TẬN GỐC cho
   màn hình Theo khách hàng, và không phải việc code. Hiện 21% tồn không ghi mã
   đơn, 2% ghi nhầm tình trạng lỗi vào ô mã đơn, và tên khách nhập tự do nên
   càng dùng lâu càng phân mảnh. Cùng loại vấn đề với danh mục lỗi `Remark1` ở
   mục 5 — cùng một nguyên nhân: ô tự do trong ERP.

9. **`SST` là khách hàng hay mã nội bộ?** Đang là nhóm lớn nhất (197 m³,
   100 block, 12 mã đơn) và đang được xếp là khách hàng. Nếu thực ra là mã nội
   bộ của Havas thì sửa một dòng: thêm `"SST"` vào `DON_NHOM_NOI_BO` trong
   `app.js`. Đã hỏi anh Louis ngày 28/08, chưa có câu trả lời.
