-- Adds "Only when required" (as-needed/PRN) as a frequency option. It has no
-- fixed daily rate, so it's excluded from the running-low/top-up math in the
-- app (same treatment as dosage or frequency being unset) -- no view change
-- needed here, just widening the allowed values.

alter table public.medications drop constraint if exists medications_frequency_check;

alter table public.medications
  add constraint medications_frequency_check
    check (frequency in ('once_daily', 'twice_daily', 'thrice_daily', 'as_needed'));
