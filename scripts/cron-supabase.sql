-- =====================================================================
-- LỊCH ĐỒNG BỘ TỰ ĐỘNG — chạy trên Supabase, gọi ngược GitHub Actions
--
-- Đây là BẢN SAO của cấu hình đang chạy thật trong database Supabase
-- (project sgsrtpsvhnyjdmlevskr). Giữ ở đây để nếu lịch bị xoá, hoặc cần
-- dựng lại hệ thống ở nơi khác, thì có cái để tra.
--
-- KHÔNG cần chạy file này nếu lịch đang hoạt động bình thường.
-- Kiểm tra tình trạng:  select jobname, schedule, active from cron.job;
--
-- --------------------------------------------------------------------
-- VÌ SAO PHẢI LÀM VÒNG VO QUA SUPABASE
--
-- GitHub Actions có sẵn lịch cron, nhưng đo thực tế ngày 26/08/2026 cho
-- thấy nó bỏ lỡ 21 trong 24 lượt (chỉ chạy 3 lượt, cách nhau ~55 phút
-- thay vì 30), và hôm sau bỏ lỡ toàn bộ. GitHub ghi rõ trong tài liệu là
-- lịch có thể bị hoãn hoặc bỏ hẳn khi hệ thống tải cao, repo miễn phí
-- được ưu tiên thấp nhất.
--
-- pg_cron chạy trên hạ tầng Postgres của Supabase thì đúng giờ. Nên đổi
-- chiều: thay vì chờ GitHub tự nổ, để Supabase chủ động gọi GitHub.
--
--   Supabase pg_cron  --HTTP POST-->  GitHub API  -->  Actions chạy sync.py
--
-- --------------------------------------------------------------------
-- CẦN CÓ TRƯỚC
--   1. Extension pg_cron và pg_net (mục 1 bên dưới)
--   2. Một GitHub fine-grained token trong Vault, tên 'github_pat_havas_cron'
--      Quyền tối thiểu: chỉ repo havas-inventory-intelligence,
--                       Repository permissions > Actions: Read and write
--      Tạo tại: https://github.com/settings/personal-access-tokens/new
--
--      Lưu token (thay PASTE_TOKEN_HERE bằng token thật):
--        select vault.create_secret('PASTE_TOKEN_HERE',
--                                   'github_pat_havas_cron',
--                                   'Token kich hoat GitHub Actions dong bo ton kho');
--
--      Nếu tên đã tồn tại thì dùng lệnh cập nhật:
--        select vault.update_secret(
--          (select id from vault.secrets where name = 'github_pat_havas_cron'),
--          'PASTE_TOKEN_HERE');
-- =====================================================================


-- 1) EXTENSION ---------------------------------------------------------
create extension if not exists pg_cron;   -- bộ hẹn giờ
create extension if not exists pg_net;    -- cho Postgres gọi HTTP ra ngoài


-- 2) NHẬT KÝ KÍCH HOẠT -------------------------------------------------
-- Ghi lại mỗi lần cron bắn, để đối chiếu khi nghi lịch không chạy.
create table if not exists public.cron_trigger_log (
  id          bigserial primary key,
  fired_at    timestamptz not null default now(),
  request_id  bigint
);

alter table public.cron_trigger_log enable row level security;

drop policy if exists cron_log_read on public.cron_trigger_log;
create policy cron_log_read on public.cron_trigger_log
  for select to authenticated using (true);

grant select on public.cron_trigger_log to authenticated;
grant select, insert on public.cron_trigger_log to service_role;
grant usage, select on all sequences in schema public to service_role;


-- 3) HÀM KÍCH HOẠT -----------------------------------------------------
-- Đọc token từ Vault, POST tới GitHub, ghi nhật ký.
-- security definer để chạy được với quyền đọc Vault; đổi lại phải thu hồi
-- quyền gọi khỏi mọi vai trò thường (xem cuối mục này).
create or replace function public.kich_hoat_dong_bo()
returns bigint
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  v_token      text;
  v_request_id bigint;
begin
  select decrypted_secret into v_token
  from vault.decrypted_secrets
  where name = 'github_pat_havas_cron';

  if v_token is null then
    raise exception 'Khong tim thay token github_pat_havas_cron trong Vault';
  end if;

  select net.http_post(
    url := 'https://api.github.com/repos/louisle-hash/havas-inventory-intelligence/actions/workflows/dong-bo-ton-kho.yml/dispatches',
    headers := jsonb_build_object(
      'Accept',               'application/vnd.github+json',
      'Authorization',        'Bearer ' || v_token,
      'X-GitHub-Api-Version', '2022-11-28',
      'User-Agent',           'supabase-pg-cron',
      'Content-Type',         'application/json'
    ),
    body := jsonb_build_object('ref', 'main')
  ) into v_request_id;

  insert into public.cron_trigger_log (request_id) values (v_request_id);
  return v_request_id;
end;
$$;

-- Chỉ hệ thống được gọi. Người dùng app không được phép kích hoạt đồng bộ.
revoke execute on function public.kich_hoat_dong_bo() from public, anon, authenticated;


-- 4) LỊCH --------------------------------------------------------------
-- pg_cron chạy theo giờ UTC. Việt Nam là UTC+7:
--     00:00 UTC = 07:00 VN   ·   11:30 UTC = 18:30 VN
-- '0,30 0-11 * * 1-5' = mỗi 30 phút, 07:00–18:30 giờ VN, thứ Hai đến thứ Sáu.
select cron.unschedule('dong-bo-ton-kho')
where exists (select 1 from cron.job where jobname = 'dong-bo-ton-kho');

select cron.schedule('dong-bo-ton-kho', '0,30 0-11 * * 1-5',
                     'select public.kich_hoat_dong_bo();');


-- 5) KIỂM CHỨNG --------------------------------------------------------
select jobid, jobname, schedule, active from cron.job order by jobid;


-- =====================================================================
-- TRA CỨU KHI NGHI NGỜ LỊCH KHÔNG CHẠY
-- =====================================================================

-- a) Lịch còn sống không
--    select jobname, schedule, active from cron.job;

-- b) pg_cron có thực sự chạy không, và có lỗi gì
--    select jobid, status, return_message, start_time
--    from cron.job_run_details order by start_time desc limit 10;

-- c) GitHub trả về gì. 204 = nhận lệnh thành công (không có nội dung).
--    401 = token sai hoặc hết hạn. 404 = sai tên repo/workflow, hoặc token
--    thiếu quyền Actions.
--    select id, status_code, left(coalesce(content,'(rong)'), 300), created
--    from net._http_response order by id desc limit 10;

-- d) Kiểm tra token trong Vault mà KHÔNG lộ nội dung
--    select length(decrypted_secret) as do_dai,          -- fine-grained: 93
--           left(decrypted_secret, 11) as tien_to,       -- phai la github_pat_
--           decrypted_secret ~ '^github_pat_' as dung_dinh_dang
--    from vault.decrypted_secrets where name = 'github_pat_havas_cron';

-- e) Chạy thử ngay, không chờ lịch
--    select public.kich_hoat_dong_bo();
--    rồi xem lại mục (c) sau vài giây.

-- f) Kết quả cuối cùng của việc đồng bộ nằm ở bảng khác:
--    select id, status, rows_loaded, doc_date_from, doc_date_to, message,
--           started_at, finished_at
--    from public.sync_runs order by started_at desc limit 10;


-- =====================================================================
-- BẢNG NHẬT KÝ ĐĂNG NHẬP  (dùng cho màn hình "Nhật ký" trong app)
--
-- Supabase chỉ lưu MỐC ĐĂNG NHẬP GẦN NHẤT của mỗi người, và schema auth
-- không đọc được qua API. Nên app tự ghi một dòng sau mỗi lần đăng nhập
-- thành công (xem hàm ghiNhatKyDangNhap trong auth.js).
--
-- Đây là BẢNG KIỂM TOÁN nên phân quyền chặt hơn các bảng khác:
--   authenticated : chỉ INSERT dòng của chính mình + SELECT toàn bộ
--                   -> không sửa, không xoá được dấu vết của mình
--   service_role  : thêm quyền DELETE để dọn dẹp (khoá này chỉ ở backend)
-- =====================================================================

create table if not exists public.login_log (
  id           bigserial primary key,
  user_id      uuid not null,
  email        text not null,
  signed_in_at timestamptz not null default now(),
  user_agent   text
);

create index if not exists login_log_time_idx on public.login_log (signed_in_at desc);

alter table public.login_log enable row level security;

create policy login_log_read on public.login_log
  for select to authenticated using (true);

create policy login_log_insert_own on public.login_log
  for insert to authenticated with check ((select auth.uid()) = user_id);

grant select, insert on public.login_log to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select, insert, delete on public.login_log to service_role;
