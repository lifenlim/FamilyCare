-- Move the "clear the dedup record on reschedule/top-up" logic from app
-- code into triggers. This was previously a SELECT-then-conditional-DELETE
-- (appointments) and an unconditional DELETE (medications) done from the
-- server action -- each an extra sequential round trip on every edit. A
-- trigger does the same check inside the same UPDATE statement, for free.

create or replace function public.clear_appointment_alert_on_reschedule()
returns trigger
language plpgsql
as $$
begin
  if old.appointment_at::date is distinct from new.appointment_at::date then
    delete from public.critical_alerts_sent
    where alert_type = 'appointment_today' and entity_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clear_appointment_alert on public.appointments;
create trigger trg_clear_appointment_alert
  after update of appointment_at on public.appointments
  for each row execute function public.clear_appointment_alert_on_reschedule();

create or replace function public.clear_medication_alert_on_refill()
returns trigger
language plpgsql
as $$
begin
  delete from public.critical_alerts_sent
  where alert_type = 'medication_zero' and entity_id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_clear_medication_alert on public.medications;
create trigger trg_clear_medication_alert
  after update of last_refill_balance, last_refill_at on public.medications
  for each row execute function public.clear_medication_alert_on_refill();
