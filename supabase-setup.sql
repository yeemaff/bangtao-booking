-- =====================================================================
--  Bangtao Village Booking · ตั้งค่าฐานข้อมูล Supabase
--  วิธีใช้: Supabase → โปรเจกต์ของคุณ → SQL Editor → New query
--           วางทั้งไฟล์นี้ แล้วกด Run (รันซ้ำได้ ไม่ทำให้ข้อมูลหาย)
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- ผู้ใช้งานโปรแกรม (ผูกกับบัญชี Supabase Auth) ----------
create table if not exists public.staff (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique,
  display_name  text not null default '',
  role          text not null default 'staff' check (role in ('admin', 'manager', 'staff')),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- ข้อมูลทั้งหมดของโปรแกรม: ห้อง การจอง แขก งานประจำวัน ฯลฯ ----------
create table if not exists public.docs (
  col         text not null,
  id          text not null,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid(),
  primary key (col, id)
);
create index if not exists docs_col_idx on public.docs (col);

create or replace function public.touch_doc() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end $$;
drop trigger if exists docs_touch on public.docs;
create trigger docs_touch before insert or update on public.docs for each row execute function public.touch_doc();

-- ---------- ตัวช่วยตรวจสิทธิ์ ----------
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where id = auth.uid() and active);
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where id = auth.uid() and active and role = 'admin');
$$;

-- ผู้ดูแล (admin) หรือ Admin (manager): เห็นและแก้การเงิน ห้อง และการตั้งค่าได้
create or replace function public.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where id = auth.uid() and active and role in ('admin', 'manager'));
$$;

-- รองรับสิทธิ์ Admin (manager) ในฐานข้อมูลที่สร้างจากสคริปต์เวอร์ชันเก่า
do $$
declare c text;
begin
  for c in select conname from pg_constraint where conrelid = 'public.staff'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%role%' loop
    execute format('alter table public.staff drop constraint %I', c);
  end loop;
  alter table public.staff add constraint staff_role_check check (role in ('admin', 'manager', 'staff'));
end $$;

-- ---------- สิทธิ์การเข้าถึง (Row Level Security) ----------
alter table public.staff enable row level security;
alter table public.docs  enable row level security;

drop policy if exists staff_read  on public.staff;
drop policy if exists staff_admin on public.staff;
create policy staff_read  on public.staff for select to authenticated using (public.is_staff());
create policy staff_admin on public.staff for all    to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists docs_read   on public.docs;
drop policy if exists docs_insert on public.docs;
drop policy if exists docs_update on public.docs;
drop policy if exists docs_delete on public.docs;
-- พนักงานอ่านและแก้การจองได้ รวมถึงราคาและการชำระเงินของแต่ละการจอง (col = 'finance')
-- ส่วนรายงานการเงินและสถิติรายได้ ดูได้เฉพาะผู้ดูแลและ Admin (ซ่อนในโปรแกรม)
-- พนักงานตั้งราคาห้องรายเดือน (settings id ขึ้นต้นด้วย rates-) และเพิ่ม/แก้รายการเอกสาร (files) ได้
-- พนักงานเพิ่ม/แก้งานที่ฝากไว้ (todos) ได้ · ข้อมูลห้องและการตั้งค่าโรงแรม พนักงานอ่านได้ แต่เพิ่ม/แก้ได้เฉพาะผู้ดูแลและ Admin · ลบเอกสารได้เฉพาะผู้ดูแลและ Admin
-- การจัดการผู้ใช้ (ตาราง staff, ตั้งรหัสใหม่, ลบผู้ใช้) ทำได้เฉพาะผู้ดูแล
create or replace function public.bv_can_write(p_col text, p_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_staff() and (
    public.is_manager()
    or p_col not in ('rooms', 'settings')
    or (p_col = 'settings' and p_id like 'rates-%'));
$$;
grant execute on function public.bv_can_write(text, text) to authenticated;
create policy docs_read   on public.docs for select to authenticated
  using (public.is_staff());
create policy docs_insert on public.docs for insert to authenticated
  with check (public.bv_can_write(col, id));
create policy docs_update on public.docs for update to authenticated
  using (public.bv_can_write(col, id))
  with check (public.bv_can_write(col, id));
create policy docs_delete on public.docs for delete to authenticated
  using (public.bv_can_write(col, id) and (col <> 'files' or public.is_manager()));

-- ---------- รวมข้อมูลบางส่วนเข้าเอกสารเดิม (ใช้กับงานประจำวันและสถานะแม่บ้าน) ----------
create or replace function public.jsonb_deep_merge(a jsonb, b jsonb) returns jsonb
language plpgsql immutable as $$
declare k text; result jsonb;
begin
  if a is null or jsonb_typeof(a) <> 'object' or jsonb_typeof(b) <> 'object' then return b; end if;
  result := a;
  for k in select jsonb_object_keys(b) loop
    result := jsonb_set(result, array[k], public.jsonb_deep_merge(a -> k, b -> k), true);
  end loop;
  return result;
end $$;

create or replace function public.doc_merge(p_col text, p_id text, p_patch jsonb) returns void
language plpgsql security invoker set search_path = public as $$
begin
  insert into public.docs (col, id, data) values (p_col, p_id, p_patch)
  on conflict (col, id) do update set data = public.jsonb_deep_merge(public.docs.data, excluded.data);
end $$;

-- ---------- การตั้งค่าครั้งแรก: บัญชีแรกที่สมัครจะเป็นผู้ดูแล ----------
create or replace function public.setup_needed() returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.staff);
$$;

create or replace function public.claim_first_admin(p_username text, p_display text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if exists (select 1 from public.staff) then return false; end if;
  insert into public.staff (id, username, display_name, role, active)
  values (auth.uid(), lower(p_username), p_display, 'admin', true);
  return true;
end $$;

-- ---------- ผู้ดูแลตั้งรหัสผ่านใหม่ / ลบผู้ใช้ ----------
create or replace function public.admin_set_password(p_user uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if length(p_password) < 6 then raise exception 'password too short'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now()
  where id = p_user;
end $$;

create or replace function public.admin_delete_user(p_user uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if p_user = auth.uid() then raise exception 'cannot delete yourself'; end if;
  delete from auth.users where id = p_user;
end $$;

revoke all on function public.admin_set_password(uuid, text) from public, anon;
revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.setup_needed() to anon, authenticated;
grant execute on function public.claim_first_admin(text, text) to authenticated;
grant execute on function public.doc_merge(text, text, jsonb) to authenticated;

-- ---------- ไฟล์เอกสาร (Supabase Storage) ----------
-- ทุกคนที่ล็อกอินเปิด/ดาวน์โหลดได้ · อัปโหลด แก้ และลบได้เฉพาะผู้ดูแลและ Admin
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;
drop policy if exists bv_docs_read   on storage.objects;
drop policy if exists bv_docs_insert on storage.objects;
drop policy if exists bv_docs_update on storage.objects;
drop policy if exists bv_docs_delete on storage.objects;
create policy bv_docs_read   on storage.objects for select to authenticated using (bucket_id = 'documents' and public.is_staff());
create policy bv_docs_insert on storage.objects for insert to authenticated with check (bucket_id = 'documents' and public.is_staff());
create policy bv_docs_update on storage.objects for update to authenticated using (bucket_id = 'documents' and public.is_staff());
create policy bv_docs_delete on storage.objects for delete to authenticated using (bucket_id = 'documents' and public.is_manager());

-- สลิปการโอนและเอกสารแนบของแต่ละการจอง: ทุกคนที่ล็อกอินแนบ เปิด และลบได้
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false) on conflict (id) do nothing;
drop policy if exists bv_att_all on storage.objects;
create policy bv_att_all on storage.objects for all to authenticated using (bucket_id = 'attachments' and public.is_staff()) with check (bucket_id = 'attachments' and public.is_staff());

-- ---------- อัปเดตข้ามเครื่องแบบเรียลไทม์ ----------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'staff') then
    alter publication supabase_realtime add table public.staff;
  end if;
end $$;

-- เสร็จแล้ว ✓  ขั้นต่อไป: Authentication → Sign In / Providers → Email → ปิด "Confirm email" แล้วกด Save
