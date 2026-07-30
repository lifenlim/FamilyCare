-- Adds a descriptive dosing-frequency field to medications, separate from
-- daily_dosage (which stays the number used for the balance/running-low
-- math). Run once in the SQL Editor.

alter table public.medications
  add column if not exists frequency text
    check (frequency in ('once_daily', 'twice_daily', 'thrice_daily'));
