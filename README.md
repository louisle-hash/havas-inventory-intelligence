# Havas Inventory Intelligence

Dashboard tồn kho mousse block dành cho CEO, được thiết kế để chạy trực tiếp bằng Live Preview trong VS Code và có thể triển khai lên GitHub Pages.

## Xem giao diện trong VS Code

1. Mở thư mục dự án bằng VS Code.
2. Mở `index.html`.
3. Chọn **Show Preview** của extension **Live Preview**.

Không mở trực tiếp bằng `file://` vì trình duyệt sẽ chặn việc tải file JSON.

## Cập nhật dữ liệu

Đặt file Excel báo cáo trong thư mục gốc, sau đó chạy:

```bash
python3 scripts/build_data.py
```

Script đọc sheet tồn kho, chuẩn hóa trạng thái và tạo `data/inventory.json`.

## Phân loại trạng thái

- Có nội dung ở `Tình trạng Block` → **Hàng lỗi / hư**.
- `Lý do nhập = SX THEO ĐƠN HÀNG` → **Theo đơn hàng**.
- `Lý do nhập = SX DƯ / SX DU` → **Sản xuất dư**.
- Các trường hợp còn lại → **Chưa xác định**.

## Lưu ý bảo mật

GitHub Pages và repository public sẽ làm dữ liệu JSON trở thành công khai. Chỉ publish dữ liệu thật khi chính sách bảo mật của công ty cho phép; nếu không, hãy dùng dữ liệu demo hoặc repository/deployment có kiểm soát truy cập.
