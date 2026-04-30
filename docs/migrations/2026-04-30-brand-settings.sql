-- Run this in Supabase SQL editor BEFORE deploying code that references brandName.

alter table if exists "User"
  add column if not exists "brandName" text;

