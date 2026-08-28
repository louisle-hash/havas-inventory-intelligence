-- =====================================================================
-- PHÂN QUYỀN TÀI KHOẢN + GIAO VIỆC DÙNG CHUNG
-- Bổ sung 27/08/2026 · giai đoạn 5 trong knowledge/LO-TRINH-TRIEN-KHAI.md
--
-- CHẠY MỘT LẦN trong Supabase Dashboard > SQL Editor (project
-- sgsrtpsvhnyjdmlevskr), dán toàn bộ file rồi bấm Run.
-- Chạy lại nhiều lần vẫn an toàn: mọi lệnh đều "if not exists" hoặc
-- "drop ... if exists" trước khi tạo.
--
-- ---------------------------------------------------------------------
-- FILE NÀY GIẢI QUYẾT HAI VIỆC
--
-- 1. Việc giao trong app trước đây nằm trong localStorage của TỪNG trình
--    duyệt. Họp xong không ai thấy việc của ai, đổi máy là mất trắng.
--    Từ đây việc nằm ở bảng public.tasks, ai đăng nhập cũng thấy.
--
-- 2. Chưa có khái niệm vai trò: hễ đăng nhập được là xem được mọi màn
--    hình, kể cả Nhật ký và tài liệu kỹ thuật. Từ đây mỗi tài khoản có
--    một vai trò và một danh sách màn hình được xem.
--
-- ---------------------------------------------------------------------
-- BA VAI TRÒ
--
--   admin   Sửa được cấu hình tài khoản của người khác. Xem mọi màn hình,
--           bất kể allowed_pages ghi gì. Giao và sửa việc.
--   member  Giao việc, cập nhật tiến độ. Chỉ xem những màn hình được cấp.
--   viewer  Chỉ xem, không giao được việc, không sửa được tiến độ.
--
-- ---------------------------------------------------------------------
-- ĐIỀU PHẢI HIỂU ĐÚNG VỀ allowed_pages — ĐỪNG NHẦM
--
-- allowed_pages là hàng rào GIAO DIỆN, không phải hàng rào DỮ LIỆU.
-- Chín màn hình nghiệp vụ (Tổng quan, Theo kho, Theo sản phẩm, Tuổi tồn,
-- Trạng thái, Phương án, Chi tiết block…) đều đọc cùng hai bảng
-- inventory và movements. Bỏ một màn hình khỏi allowed_pages thì người
-- đó không thấy nút vào, nhưng người biết dùng công cụ lập trình của
-- trình duyệt vẫn đọc được số liệu gốc.
--
-- Hai trường hợp DUY NHẤT được chặn tới tận tầng dữ liệu, vì chúng đọc
-- bảng riêng và có policy riêng bên dưới:
--   · 'logs'  -> bảng login_log (ai đăng nhập lúc nào)
--   · 'admin' -> bảng app_users (vai trò của mọi người)
--
-- Kết luận: dùng allowed_pages để dọn màn hình cho gọn đúng vai trò.
-- ĐỪNG dùng nó để giấu số liệu kho khỏi người đã đăng nhập được. Muốn
-- giấu số liệu thì phải không cấp tài khoản.
-- =====================================================================


-- =====================================================================
-- 1. BẢNG app_users — mỗi tài khoản một dòng
-- =====================================================================

create table if not exists public.app_users (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          text not null default 'viewer'
                check (role in ('admin', 'member', 'viewer')),
  -- Mặc định cấp 9 màn hình nghiệp vụ. KHÔNG cấp sẵn 'architecture'
  -- (tài liệu kỹ thuật), 'logs' (nhật ký) và 'admin' (cấu hình tài
  -- khoản) — đó là ba màn hình quản trị, quản trị viên cấp thêm khi cần.
  allowed_pages text[] not null default array[
    'guide', 'overview', 'warehouse', 'product', 'customer',
    'aging', 'status', 'details', 'workflow'
  ],
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid
);

create index if not exists app_users_email_idx on public.app_users (email);


-- =====================================================================
-- 2. BA HÀM TRA QUYỀN
--
-- Bắt buộc phải là SECURITY DEFINER. Nếu để hàm thường, policy trên
-- app_users sẽ phải đọc chính app_users để biết ai là admin, mà đọc
-- app_users lại kích hoạt policy đó -> Postgres báo lỗi đệ quy vô hạn
-- và KHÔNG AI đăng nhập vào được nữa.
-- SECURITY DEFINER cho hàm chạy vượt RLS nên cắt được vòng lặp.
-- 'set search_path = public' là bắt buộc kèm theo, nếu không hàm chạy
-- quyền cao có thể bị đánh lừa sang schema khác.
-- =====================================================================

create or replace function public.la_quan_tri()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.app_users
    where user_id = (select auth.uid()) and role = 'admin' and is_active
  );
$$;

create or replace function public.duoc_sua_viec()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.app_users
    where user_id = (select auth.uid())
      and role in ('admin', 'member') and is_active
  );
$$;

create or replace function public.duoc_xem_trang(ten_trang text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.app_users
    where user_id = (select auth.uid()) and is_active
      and (role = 'admin' or ten_trang = any(allowed_pages))
  );
$$;


-- =====================================================================
-- 3. HAI TẤM LƯỚI AN TOÀN
-- =====================================================================

-- 3a. Tài khoản mới tạo trong Supabase Dashboard sẽ tự có hồ sơ ở đây,
--     vai trò 'viewer'. Không phải nhớ chạy tay lần nào nữa.
create or replace function public.tao_ho_so_nguoi_dung()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.app_users (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists tao_ho_so_khi_them_tai_khoan on auth.users;
create trigger tao_ho_so_khi_them_tai_khoan
  after insert on auth.users
  for each row execute function public.tao_ho_so_nguoi_dung();


-- 3b. Chặn tình huống tự khoá cửa: quản trị viên cuối cùng hạ vai trò
--     chính mình xuống viewer, hoặc tắt hoạt động chính mình, thì từ đó
--     KHÔNG AI mở được màn hình cấu hình nữa — kể cả người vừa bấm.
--     Gỡ ra chỉ còn cách vào SQL Editor sửa tay.
--     Trigger 'deferrable initially deferred' kiểm tra ở cuối giao dịch,
--     nên đổi vai trò A và B trong cùng một lệnh vẫn chạy được.
create or replace function public.giu_it_nhat_mot_quan_tri()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.app_users where role = 'admin' and is_active
  ) then
    raise exception 'Phải còn ít nhất một quản trị viên đang hoạt động';
  end if;
  return null;
end;
$$;

drop trigger if exists app_users_giu_quan_tri on public.app_users;
create constraint trigger app_users_giu_quan_tri
  after update or delete on public.app_users
  deferrable initially deferred
  for each row execute function public.giu_it_nhat_mot_quan_tri();


-- 3c. updated_at tự đóng dấu, không tin vào phía trình duyệt.
create or replace function public.dong_dau_thoi_gian()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_users_dong_dau on public.app_users;
create trigger app_users_dong_dau
  before update on public.app_users
  for each row execute function public.dong_dau_thoi_gian();


-- =====================================================================
-- 4. PHÂN QUYỀN app_users
--
--   Ai cũng đọc được DÒNG CỦA CHÍNH MÌNH — app cần biết mình là ai và
--   được xem màn hình nào ngay khi vừa đăng nhập.
--   Chỉ quản trị viên đọc được TOÀN BỘ danh sách và sửa được.
-- =====================================================================

alter table public.app_users enable row level security;

drop policy if exists app_users_doc on public.app_users;
create policy app_users_doc on public.app_users
  for select to authenticated
  using (user_id = (select auth.uid()) or public.la_quan_tri());

drop policy if exists app_users_quan_tri_them on public.app_users;
create policy app_users_quan_tri_them on public.app_users
  for insert to authenticated
  with check (public.la_quan_tri());

drop policy if exists app_users_quan_tri_sua on public.app_users;
create policy app_users_quan_tri_sua on public.app_users
  for update to authenticated
  using (public.la_quan_tri())
  with check (public.la_quan_tri());

drop policy if exists app_users_quan_tri_xoa on public.app_users;
create policy app_users_quan_tri_xoa on public.app_users
  for delete to authenticated
  using (public.la_quan_tri());

grant select, insert, delete on public.app_users to authenticated;
-- Chỉ cho sửa đúng những cột nên sửa. Không có dòng này thì policy chặn được
-- "ai sửa" nhưng không chặn được "sửa cột nào" — quản trị viên vẫn có thể vô
-- tình hoặc cố ý ghi đè user_id, email, created_at.
grant update (full_name, role, allowed_pages, is_active, updated_by)
  on public.app_users to authenticated;
grant select, insert, update, delete on public.app_users to service_role;


-- =====================================================================
-- 5. NẠP HỒ SƠ CHO CÁC TÀI KHOẢN ĐÃ CÓ
--
-- hau.le@havas.vn được đặt làm quản trị viên đầu tiên. Đây là tài khoản
-- của người dựng hệ thống; phải có ít nhất một admin nếu không màn hình
-- cấu hình sẽ không ai mở được.
-- Ba tài khoản còn lại để 'member': giao việc được, nhưng chưa thấy ba
-- màn hình quản trị. Quản trị viên tự cấp thêm trong app.
-- =====================================================================

insert into public.app_users (user_id, email, role)
select
  u.id,
  u.email,
  case when u.email = 'hau.le@havas.vn' then 'admin' else 'member' end
from auth.users u
on conflict (user_id) do nothing;

-- Nếu chạy lại file sau khi hồ sơ đã tồn tại mà admin bị mất, dòng này
-- dựng lại quyền cho tài khoản gốc.
update public.app_users
   set role = 'admin', is_active = true
 where email = 'hau.le@havas.vn';


-- =====================================================================
-- 6. BẢNG tasks — việc giao trong cuộc họp, ai đăng nhập cũng thấy
--
-- legacy_id giữ mã cũ dạng 'TASK-1756...' của những việc từng nằm trong
-- localStorage. App tự đẩy chúng lên trong lần chạy đầu; ràng buộc unique
-- khiến việc đẩy lên có chạy mấy lần, hoặc chạy từ mấy máy khác nhau,
-- cũng không sinh bản trùng.
-- =====================================================================

create table if not exists public.tasks (
  id               uuid primary key default gen_random_uuid(),
  legacy_id        text unique,
  -- barcode KHÔNG duy nhất (2.076 mã cho 2.178 dòng) nên giữ thêm row_id
  -- để tra ngược về đúng block trong bảng inventory.
  row_id           text,
  barcode          text not null,
  title            text not null,
  assignee         text not null default '',
  start_date       date not null,
  deadline         date not null,
  priority         text not null default 'Cao'
                   check (priority in ('Khẩn cấp', 'Cao', 'Trung bình', 'Thấp')),
  status           text not null default 'Chưa bắt đầu'
                   check (status in ('Chưa bắt đầu', 'Đang xử lý', 'Chờ xác nhận', 'Hoàn thành')),
  note             text,
  created_by       uuid,
  created_by_email text,
  created_at       timestamptz not null default now(),
  updated_by       uuid,
  updated_by_email text,
  updated_at       timestamptz not null default now()
);

create index if not exists tasks_deadline_idx on public.tasks (deadline);
create index if not exists tasks_barcode_idx  on public.tasks (barcode);

drop trigger if exists tasks_dong_dau on public.tasks;
create trigger tasks_dong_dau
  before update on public.tasks
  for each row execute function public.dong_dau_thoi_gian();

alter table public.tasks enable row level security;

-- Đọc: mọi người đã đăng nhập. Đây chính là mục đích của cả thay đổi này
-- — họp xong ai cũng thấy việc của ai.
drop policy if exists tasks_doc on public.tasks;
create policy tasks_doc on public.tasks
  for select to authenticated using (true);

-- Thêm: admin và member. created_by buộc phải là chính mình, không giả
-- danh người khác đứng tên giao việc được.
drop policy if exists tasks_them on public.tasks;
create policy tasks_them on public.tasks
  for insert to authenticated
  with check (public.duoc_sua_viec() and created_by = (select auth.uid()));

-- Sửa: admin và member sửa được mọi việc — họp thì ai cập nhật cũng được.
drop policy if exists tasks_sua on public.tasks;
create policy tasks_sua on public.tasks
  for update to authenticated
  using (public.duoc_sua_viec())
  with check (public.duoc_sua_viec());

-- Xoá: chỉ quản trị viên, hoặc chính người đã giao việc đó.
drop policy if exists tasks_xoa on public.tasks;
create policy tasks_xoa on public.tasks
  for delete to authenticated
  using (public.la_quan_tri() or created_by = (select auth.uid()));

grant select, insert, delete on public.tasks to authenticated;
-- Cùng lý do: policy tasks_sua cho phép mọi member sửa mọi việc (đúng ý đồ —
-- họp thì ai cập nhật cũng được), nhưng KHÔNG được đụng vào created_by,
-- created_at hay legacy_id. Nếu không, người khác có thể sửa dấu vết ai đã giao việc.
grant update (row_id, barcode, title, assignee, start_date, deadline,
              priority, status, note, updated_by, updated_by_email)
  on public.tasks to authenticated;
grant select, insert, update, delete on public.tasks to service_role;

-- Việc mới hiện ngay trên màn hình người khác, không phải bấm F5.
do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then
  null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.app_users;
exception when duplicate_object then
  null;
end;
$$;


-- =====================================================================
-- 7. SIẾT LẠI login_log THEO QUYỀN XEM MÀN HÌNH "NHẬT KÝ"
--
-- Trước đây policy là 'using (true)': hễ đăng nhập là đọc được toàn bộ
-- lịch sử đăng nhập của mọi người. Giờ chỉ ai được cấp màn hình 'logs'
-- mới đọc được. Đây là một trong hai chỗ allowed_pages chặn thật tới
-- tầng dữ liệu.
--
-- Quyền GHI giữ nguyên: mọi người vẫn phải ghi được dấu vết đăng nhập
-- của chính mình, nếu không màn hình Nhật ký sẽ trống dần.
-- KHÔNG đụng tới sync_runs và snapshots — dashboard chính đọc hai bảng
-- đó để biết dữ liệu tươi tới đâu, siết vào là hỏng trang Tổng quan.
-- =====================================================================

drop policy if exists login_log_read on public.login_log;
create policy login_log_read on public.login_log
  for select to authenticated
  using (public.duoc_xem_trang('logs'));


-- =====================================================================
-- 8. BỔ SUNG MÀN HÌNH MỚI CHO CÁC TÀI KHOẢN ĐÃ CÓ
--
-- Đặt 'customer' vào default ở mục 1 chỉ có tác dụng với tài khoản TẠO SAU.
-- Tài khoản đã tồn tại giữ nguyên mảng cũ, nên phải cấp thêm bằng tay.
-- Mỗi lần thêm một màn hình nghiệp vụ mới vào app, thêm một khối như dưới đây
-- rồi chạy lại file này — không cấp thì cả nhóm sẽ không thấy màn hình mới.
--
-- KHÔNG cấp cho những màn hình quản trị ('architecture', 'logs', 'admin'):
-- quản trị viên tự xem được hết, người khác thì phải được cấp có chủ đích.
-- =====================================================================

update public.app_users
   set allowed_pages = array_append(allowed_pages, 'customer')
 where not ('customer' = any(allowed_pages));

-- Màn hình "Phương án xử lý" bỏ ngày 28/08/2026 theo yêu cầu anh Louis.
-- Để 'actions' nằm lại trong allowed_pages thì vô hại (thanh điều hướng chỉ
-- duyệt những trang có thật), nhưng là rác — và sẽ tự sống lại nếu sau này có
-- ai đặt lại một trang trùng tên.
update public.app_users
   set allowed_pages = array_remove(allowed_pages, 'actions')
 where 'actions' = any(allowed_pages);


-- =====================================================================
-- 9. KIỂM TRA SAU KHI CHẠY
-- =====================================================================
--
-- Xem ai đang có vai trò gì:
--   select email, role, is_active, allowed_pages from public.app_users order by role, email;
--
-- Xem việc đang mở:
--   select barcode, title, assignee, deadline, status, created_by_email
--     from public.tasks where status <> 'Hoàn thành' order by deadline;
--
-- Kiểm tra RLS đã bật đủ trên ba bảng:
--   select relname, relrowsecurity from pg_class
--    where relname in ('app_users','tasks','login_log');
--
-- Nếu lỡ khoá hết quản trị viên (không nên xảy ra vì đã có trigger chặn):
--   update public.app_users set role='admin', is_active=true where email='hau.le@havas.vn';
