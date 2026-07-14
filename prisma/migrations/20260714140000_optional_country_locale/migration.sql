-- Country is optional for tenants, party addresses, and users' personal preference.
-- Existing rows keep their current country_code values.

ALTER TABLE "tenants"
  ALTER COLUMN "country_code" DROP DEFAULT,
  ALTER COLUMN "country_code" DROP NOT NULL;

ALTER TABLE "party_addresses"
  ALTER COLUMN "country_code" DROP NOT NULL;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "preferred_country_code" CHAR(2);
