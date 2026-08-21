-- The balance was depleting on exact fractional days elapsed (e.g. 2.63
-- days), so current_balance was almost never a whole number even for
-- whole-tablet dosing -- and topping up baked that decimal permanently
-- into last_refill_balance going forward. Switching to whole days elapsed
-- (floor) means the balance only steps down once a full day has actually
-- passed, so it stays a clean number for the common case (whole
-- dose_amount, once/twice/thrice daily) everywhere this view is read --
-- list display, low-stock check, and top-up alike -- not just at display
-- time.
--
-- Note: alternate_day's 0.5/day rate can still land on a .5 after an odd
-- number of days (e.g. 3 days x 0.5 = 1.5) -- that's an inherent property
-- of every-other-day dosing, not something this change addresses.

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
        * floor(extract(epoch from (now() - m.last_refill_at)) / 86400.0)
  ) as current_balance
from public.medications m;

grant select on public.medications_with_balance to authenticated;
