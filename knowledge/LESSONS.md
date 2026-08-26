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
