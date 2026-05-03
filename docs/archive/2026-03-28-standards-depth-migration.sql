alter table public.standards
  add column if not exists category text not null default 'Execution',
  add column if not exists last_reviewed_at timestamptz;

alter table public.standards
  alter column category set default 'Execution';

update public.standards
set category = coalesce(nullif(trim(category), ''), 'Execution')
where category is null or trim(category) = '';

create index if not exists standards_user_category_idx
  on public.standards (user_id, category);

create index if not exists standards_user_last_reviewed_idx
  on public.standards (user_id, last_reviewed_at desc);
