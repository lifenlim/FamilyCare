-- Lets a weekly-recurring task pin down which day it actually falls on.
-- 0 = Sunday .. 6 = Saturday, matching JS Date#getDay() so app code can
-- compare directly without translation. Only meaningful when
-- recurrence = 'weekly'; left null for every other recurrence.

alter table public.care_tasks
  add column if not exists recurrence_day_of_week smallint
    check (recurrence_day_of_week is null or recurrence_day_of_week between 0 and 6);
