# Lộ trình triển khai — Havas Inventory Intelligence

- Soạn: 26/08/2026 · dựa trên bản app ngày 28/07/2026
- Trạng thái: **CHỜ DUYỆT** — cần chốt 3 quyết định ở cuối file trước khi khởi động
- Bản trình bày: https://claude.ai/code/artifact/f80feaa2-3561-412a-b7af-af551a5968d7

## Bối cảnh

App hiện tại trả lời "kho đang có gì". Ban giám đốc cần app trả lời "tồn kho đang tốt lên
hay xấu đi, tiền đang chết ở đâu, tuần này phải quyết gì".

Ba thứ đang chặn:
1. Dữ liệu export tay → không thể tin số liệu mỗi sáng
2. Dữ liệu công khai trên internet → không thể đưa link cho giám đốc dùng thật
3. Chỉ có ảnh chụp một ngày, không lưu lịch sử → không thể nói "tốt lên hay xấu đi"

Tổng: 5–6 tuần · hạ tầng 0đ/tháng · KHÔNG viết lại app.

## Làm rõ "realtime"

Kho mousse chốt nhập/xuất theo phiếu. Cập nhật 1 lần/sáng tự động là đúng nhu cầu.
Muốn dày hơn (6h/12h/17h) chỉ là đổi lịch chạy, không đổi code.
"Realtime từng phút" cần ERP bắn sự kiện — gấp nhiều lần công sức, không đổi quyết định nào.

## Sáu giai đoạn

### GĐ 0 — Khoá dữ liệu lại · 1 ngày · CỬA CHẶN
- Chuyển repo private, hoặc xoá và tạo lại chỉ chứa mã nguồn
- Gỡ CSV / XLSX / inventory.json khỏi TOÀN BỘ lịch sử git (xoá file rồi commit là chưa đủ)
- Siết .gitignore: `*.csv`, `*.xlsx`, `data/*.json`
- Dọn thư mục theo chuẩn: CSV gốc → `data-goc/`, thêm `INDEX.md`
→ Được: đưa dữ liệu thật lên hằng ngày mà không lộ ra ngoài công ty

### GĐ 1 — Chỗ ở mới có khoá cửa · 2 ngày · CỬA CHẶN
- Cloudflare Pages + Cloudflare Access (miễn phí ≤50 người)
- Đăng nhập bằng email @sleepexpert.com.vn (OTP email, hoặc SSO nếu có Google Workspace/M365)
- Có nhật ký ai xem, lúc nào

| Phương án | Chi phí | Đăng nhập từng người | Nhật ký |
|---|---|---|---|
| GitHub Pages private | ~4 USD/người/tháng | Không | Không |
| Vercel | 20 USD/tháng | Chỉ mật khẩu chung | Không |
| **Cloudflare Pages + Access** | **0đ (≤50 người)** | **Có** | **Có** |

→ Được: giám đốc mở link trên điện thoại, đăng nhập email công ty; người ngoài không vào được

### GĐ 2 — Số liệu tự chạy mỗi sáng · 3–5 ngày · TRÁI TIM YÊU CẦU
- Script Python gọi thẳng `usp_Vcd_TongHopNhapXuatMousseBlock` trên SQL Server (bỏ export tay)
- Lịch 6:00 sáng bằng Task Scheduler trên máy trong mạng công ty
- Mỗi lần chạy lưu `data/snapshots/YYYY-MM-DD.json` ← mở khoá toàn bộ phân tích xu hướng GĐ 4
- Tự đẩy lên Cloudflare
- App hiện "Cập nhật 06:02 hôm nay"; quá 26 giờ không có dữ liệu mới → băng cảnh báo đỏ

⚠️ CẦN IT XÁC NHẬN: có cho script nối trực tiếp SQL Server không?
Nếu không → phương án B: SQL Agent tự xuất CSV vào thư mục dùng chung, script đọc thư mục.
Vẫn tự động hoàn toàn, thêm ~2 ngày công.

→ Được: không ai phải làm gì; sáng mở lên là có số mới; bắt đầu tích luỹ lịch sử

### GĐ 3 — Sửa cho đúng nghiệp vụ · 4–6 ngày
Không thêm tính năng mới, chỉ làm số liệu đáng tin:
- Thêm trang **Hàng lỗi / hư** từ `Remark1` (Nứt, Chai, Lem màu, Rách, Sai màu) — đang bị chôn
- Đổi "Trạng thái phụ" → **Đơn hàng / Lệnh sản xuất**; nối `DocNo_WO` để truy vết
- Ô "Ngày báo cáo" phải tính lại tuổi tồn thật (hiện chỉ hiện toast)
- Gỡ/ghi chú KPI ">90 ngày" — đang luôn = 0 vì dữ liệu mới 2 tháng, gây hiểu nhầm kho sạch
- Chuẩn hoá màu — 21% dòng tồn đang "Chưa tách màu"
- Thêm 2 chiều đang bỏ không: mật độ (IFD/NFD), chiều cao (H)

⚠️ VIỆC KHÔNG PHẢI CỦA LẬP TRÌNH: 44% block không có mã vị trí kho.
Cần bộ phận kho nhập bổ sung, nếu không sẽ không bao giờ làm được sơ đồ kho / lệnh lấy hàng.

→ Được: số liệu chịu được câu hỏi vặn của giám đốc

### GĐ 4 — Màn hình cho giám đốc · 5–7 ngày · GIÁ TRỊ CAO NHẤT
Sau GĐ 2 đã có lịch sử → giờ mới nói được "tốt lên hay xấu đi".
Thêm 1 trang: 6 con số, 3 nhận định, 3 việc cần quyết — vừa một màn hình.

| Chỉ số | Cách tính | Trả lời câu hỏi |
|---|---|---|
| Số ngày tồn kho (DOH) | m³ tồn ÷ m³ xuất TB/ngày | Kho giữ đủ dùng bao nhiêu ngày? |
| Biến động tồn | m³ hôm nay vs tuần trước (Δ%) | Đang phình ra hay co lại? |
| Tỷ lệ SX dư | m³ SX dư ÷ tổng m³ tồn | Bao nhiêu % tồn không gắn đơn hàng? |
| Tỷ lệ hàng lỗi | block có Remark1 ÷ tổng block | Chất lượng đi hướng nào? |
| Tồn chậm luân chuyển | m³ tồn > 60 ngày | Tiền đang chết ở đâu? |
| Tập trung rủi ro | % m³ của top 5 mã | Có phụ thuộc quá vài mã? |

- Mỗi chỉ số: số hôm nay · mũi tên so kỳ trước · sparkline 30 ngày · màu theo ngưỡng
- Thêm trang **Biến động kỳ**: block mới vào / đã xuất / tuổi dịch chuyển, so 2 ngày bất kỳ
- Ngưỡng cảnh báo do ban giám đốc chốt (vd: SX dư >30% vàng, >40% đỏ)

→ Được: giám đốc nhìn 10 giây biết kho ổn hay không, và không ổn ở đâu

### GĐ 5 — Giao việc dùng chung · ~~3–5 ngày~~ ĐÃ LÀM 27/08/2026
- ~~Hiện task lưu localStorage từng người: họp xong không ai thấy việc của ai, đổi máy là mất~~
- ~~Chuyển sang Supabase (free): bảng `tasks`, đăng nhập email công ty, phân quyền RLS~~
- ~~Giữ nguyên giao diện phân công theo barcode, chỉ đổi chỗ lưu~~
→ Xong. Làm rộng hơn dự kiến: kèm luôn bảng `app_users` với ba vai trò
  (admin / member / viewer) và danh sách màn hình được xem cho từng tài khoản,
  cùng màn hình "Cấu hình tài khoản" để quản trị viên tự đổi quyền trong app.
  Chi tiết ở `knowledge/BAN-GIAO.md` mục 7, kèm bảng nghiệm thu RLS.
  SQL đã chạy trên Supabase ngày 27/08/2026, hệ thống đang hoạt động.

### GĐ 6 — Vận hành · liên tục
- 6:15 sáng: email/Zalo tóm tắt 6 chỉ số + cảnh báo vượt ngưỡng
- Nút In / xuất PDF cho họp
- Mỗi tháng rà lại ngưỡng cảnh báo

## Năm việc KHÔNG nên làm

1. ✕ Viết lại bằng React/Next.js — tốn 3 tuần, giám đốc không nhận thêm giá trị nào
2. ✕ Dựng server riêng / Docker — không có gì cần server thường trực
3. ✕ Đồng bộ 2 chiều với ERP — chỉ đọc là đủ; ghi ngược là rủi ro lớn
4. ✕ Đuổi theo "realtime từng phút" — số liệu kho không đổi từng phút
5. ✕ Thêm dự báo/AI lúc này — mới 2 tháng dữ liệu; quay lại sau khi GĐ 2 chạy đủ 6 tháng

## Ba quyết định cần chốt

1. **Repo public hiện tại xử lý thế nào?** private hay xoá tạo lại → ảnh hưởng GĐ 0
2. **IT có cho nối trực tiếp SQL Server không?** → GĐ 2 mất 3 ngày hay 5 ngày
3. **Bao nhiêu người dùng, công ty dùng Google Workspace hay M365?** → cách đăng nhập GĐ 1

## Tuần đầu tiên

Làm GĐ 0 + GĐ 1 (~3 ngày). Hết tuần đầu đã có link riêng có khoá, đưa được cho ban giám đốc
xem bản hiện tại ngay. Phần tự động hoá làm sau, trên nền đã an toàn.
