alter table bookings
  add column agreement_accepted_at timestamptz,
  add column agreement_version text,
  add column agreement_accepted_ip text;
