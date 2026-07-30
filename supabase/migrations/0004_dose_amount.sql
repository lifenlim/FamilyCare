-- "Daily dosage" is now "Per dosage" (amount per single administration).
-- The daily total used for the balance countdown / running-low math becomes
-- dose_amount * doses-per-day (derived from frequency). Run once in the SQL
-- Editor. Existing values are preserved under the new column name.
--
-- CREATE OR REPLACE VIEW can't rename an existing view column, so the view
-- must be dropped and recreated rather than replaced. The rename is guarded
-- so this script is safe to re-run if it partially applied before.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'medications' and column_name = 'daily_dosage'
  ) then
    alter table public.medications rename column daily_dosage to dose_amount;
  end if;
end $$;

drop view if exists public.medications_with_balance;

create view public.medications_with_balance
with (security_invoker = true) as
select
  m.*,
  greatest(
    0,
    m.last_refill_balance
      - coalesce(m.dose_amount, 0)
        * case m.frequency
            when 'once_daily' then 1
            when 'twice_daily' then 2
            when 'thrice_daily' then 3
            else 0
          end
        * extract(epoch from (now() - m.last_refill_at)) / 86400.0
  ) as current_balance
from public.medications m;

grant select on public.medications_with_balance to authenticated;
