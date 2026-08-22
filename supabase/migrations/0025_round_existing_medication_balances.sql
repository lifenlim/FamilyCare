-- One-time cleanup: last_refill_balance values already carry decimal
-- remainders baked in from top-ups made before the whole-days fix
-- (0024_medication_balance_whole_days.sql). Fixing the depletion formula
-- alone doesn't retroactively clean these up -- it only ever subtracts a
-- clean whole amount going forward, so an existing .8/.6/.3 remainder
-- would otherwise persist indefinitely. Rounding to the nearest whole
-- unit here is safe because last_refill_balance tracks a physical count
-- (tablets/capsules/vials), which is inherently a whole-number quantity
-- regardless of whether a single dose happens to be a fraction of a unit.

update public.medications
set last_refill_balance = round(last_refill_balance)
where last_refill_balance <> round(last_refill_balance);
