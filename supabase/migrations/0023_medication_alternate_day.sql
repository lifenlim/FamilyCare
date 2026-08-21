-- Adds "Alternate day" (every other day) as a medication frequency. Its
-- daily consumption rate is 0.5 -- a continuous approximation consistent
-- with how the balance view already treats every other frequency as a
-- smooth per-day rate rather than discrete dose events.

alter table public.medications drop constraint if exists medications_frequency_check;

alter table public.medications
  add constraint medications_frequency_check
    check (frequency in ('once_daily', 'alternate_day', 'twice_daily', 'thrice_daily', 'as_needed'));

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
            when 'alternate_day' then 0.5
            when 'twice_daily' then 2
            when 'thrice_daily' then 3
            else 0
          end
        * extract(epoch from (now() - m.last_refill_at)) / 86400.0
  ) as current_balance
from public.medications m;

grant select on public.medications_with_balance to authenticated;
