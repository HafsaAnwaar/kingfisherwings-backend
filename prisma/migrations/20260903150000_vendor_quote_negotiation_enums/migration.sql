-- Vendor quote negotiation (mirrors customer quotation negotiation)

ALTER TYPE "VendorQuoteStatus" ADD VALUE IF NOT EXISTS 'NEGOTIATING';
ALTER TYPE "VendorQuoteStatus" ADD VALUE IF NOT EXISTS 'VENDOR_REVIEW';

CREATE TYPE "VendorQuoteNegotiationActor" AS ENUM ('TENANT', 'VENDOR');
CREATE TYPE "VendorQuoteNegotiationAction" AS ENUM ('SEND', 'REVISE', 'ACCEPT', 'REJECT', 'COUNTER_OFFER', 'PRICE');
