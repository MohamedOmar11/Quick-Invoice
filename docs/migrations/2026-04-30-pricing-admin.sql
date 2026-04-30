-- Run this in Supabase SQL editor BEFORE deploying code that references these fields.

alter table if exists "AppSettings"
  add column if not exists "pricing" jsonb;

alter table if exists "Payment"
  add column if not exists "product" text;

alter table if exists "PromoCode"
  add column if not exists "product" text;

