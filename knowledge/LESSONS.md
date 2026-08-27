# Bài học dự án Warehouse APP

## 2026-08-26 — Chẩn đoán nguồn dữ liệu SQL Server

**Việc:** Kết nối trực tiếp SQL Server để tự động hoá thay cho export CSV tay.

**Sai gì:** Tôi (Claude) đưa ra 2 giả thuyết, cả hai đều SAI:
1. Đoán tên stored procedure là `usp_Vcd_TongHopNhapXuatMousseBlock` — suy từ tên file
   CSV, nhưng tên file bị cắt cụt ở 60 ký tự. Tên thật có thêm hậu tố: `...BlockData`.
2. Đoán tham số `@_DocDate1` (khoảng ngày) làm mất hàng tồn cũ, gây KPI ">90 ngày = 0".
   Kiểm chứng bằng cách chạy 2 lần với cửa sổ 1 tháng và 19 tháng → kết quả GIỐNG HỆT.
   `@_DocDate1` không ảnh hưởng tồn kho; chỉ `@_DocDate2` (ngày chốt) mới có tác dụng.

**Sửa gì:** Chạy `sys.parameters` để lấy chữ ký thật của proc (19 tham số), và chạy
thử nghiệm A/B trên chính dữ liệu thay vì suy luận từ tên file.

**Rule rút ra:**
- KHÔNG suy tên đối tượng database từ tên file export — tên file luôn có thể bị cắt.
  Luôn xác minh bằng `sys.parameters` / `sys.objects`.
- Giả thuyết về dữ liệu phải kiểm chứng bằng phép so sánh A/B chạy thật, trước khi
  báo cho người dùng như một kết luận.

## 2026-08-26 — Sự thật về tồn kho mousse

- Kho quay vòng NHANH: tuổi tồn trung vị 7 ngày, block cũ nhất 82 ngày.
- ">90 ngày = 0" là ĐÚNG, không phải lỗi cửa sổ dữ liệu.
- Hệ quả: dải tuổi tồn hiện tại (0-7/8-30/31-60/61-90/91-180/>180) có 2 dải cuối
  VĨNH VIỄN RỖNG. Nên chia lại theo nhịp thật: 0-3/4-7/8-14/15-30/31-60/>60.
- `RowId` duy nhất tuyệt đối (2.178/2.178) → dùng làm khoá.
  `BarCodeTP` KHÔNG duy nhất (2.076/2.178) → không dùng làm khoá, và tính năng
  giao việc theo barcode phải lưu ý một barcode có thể ứng nhiều dòng.
- Cột `Color` trong ERP rỗng 100% → bắt buộc tách màu từ đuôi `ItemName`.

## 2026-08-26 — Dữ liệu app đã cũ 29 ngày

App hiển thị 491 block / 1.688,6 m³ (số ngày 28/07), trong khi thực tế ngày 26/08
là 298 block / 904,1 m³. Sai lệch +46% dung tích.

**Rule rút ra:** báo cáo cập nhật tay luôn âm thầm cũ đi. Mọi dashboard đưa cho ban
giám đốc phải hiển thị RÕ thời điểm dữ liệu, và tự cảnh báo khi quá hạn — đây là lý
do bảng `sync_runs` tồn tại.

## 2026-08-26 — Hiệu năng stored procedure biến động mạnh

Cùng một truy vấn, cùng tham số: lần chạy đầu 17,3s — lần sau 152,2s (gấp 9 lần).
Nguyên nhân chưa xác định (nhiều khả năng do tải máy chủ hoặc cache).

**Rule rút ra:** đặt timeout kết nối rộng tay (đang để 600s) và KHÔNG dùng thời gian
chạy của một lần đo duy nhất để kết luận về hiệu năng.

## 2026-08-27 — Rà soát toàn app, 10 lỗi được vá

Chạy rà soát có hệ thống sau khi hệ thống đã chạy tự động. Mười lỗi tìm được,
tất cả đều kiểm chứng bằng dữ liệu thật chứ không suy đoán.

| # | Lỗi | Hậu quả |
|---|---|---|
| 1 | Ngưỡng cũ 26 giờ tính theo lịch, trong khi đồng bộ chỉ chạy T2–T6 | Sáng thứ Hai nào cũng bật băng đỏ giả (62 giờ) |
| 2 | App lọc `movements` theo `report_date` nhưng bảng chỉ giữ một ngày | Chạy `--date` để vá ngày cũ là biểu đồ nhập xuất trống trơn |
| 3 | Ô "Ngày báo cáo" ghi đè `state.reportDate` mà không tải lại | `taskDueState()` dùng chung biến đó → mọi task đổi tình trạng hạn |
| 4 | `refreshData()` không có `.catch()` | Mất mạng lúc Realtime bắn → hỏng im lặng, số cũ vẫn hiện |
| 5 | Bộ lọc trỏ vào giá trị đã biến mất sau đồng bộ | Dropdown hiện "Tất cả" nhưng bảng trống, không rõ lý do |
| 6 | Tra block theo `barcode` vốn KHÔNG duy nhất | Bảng công việc hiện sai sản phẩm, đi tìm sai vị trí hàng |
| 7 | Nội dung task chèn thẳng vào `innerHTML` | Gõ "tồn <30 ngày" là vỡ dòng bảng |
| 8 | `data-product` / `title` không escape | Tên hàng có dấu nháy kép → drill-down trả 0 dòng |
| 9 | `sync.py` xoá sạch `movements` TRƯỚC khi ghi | Ghi lỗi giữa chừng → bảng trống tới lượt sau |
| 10 | Tài nguyên tĩnh không có vân phiên bản | Sau mỗi lần deploy, người dùng cũ vẫn chạy code cũ từ cache |

**Rule rút ra:**

- Ngưỡng cảnh báo "dữ liệu cũ" phải tính theo ĐÚNG lịch chạy. Đếm giờ theo lịch
  trong khi job chỉ chạy ngày làm việc thì cuối tuần nào cũng báo động giả — mà
  báo động giả lặp lại thì người dùng sẽ bỏ qua cả cảnh báo thật.
- Hai bảng có chiến lược lưu khác nhau (`inventory` giữ theo ngày, `movements`
  chỉ giữ bản mới nhất) thì KHÔNG được lọc chúng bằng cùng một điều kiện.
- Thao tác thay dữ liệu phải GHI TRƯỚC, XOÁ SAU. Xoá trước là tự tạo khoảng
  thời gian trống nếu bước ghi hỏng.
- Trang tĩnh không có bước build vẫn cần vân phiên bản trên tài nguyên, nếu
  không thì deploy xong người dùng cũ không nhận được bản mới.
- Mọi chuỗi tự do (do người nhập hoặc từ ERP) đổ vào `innerHTML` đều phải escape.
  Dữ liệu hôm nay sạch không có nghĩa là ngày mai vẫn sạch.
