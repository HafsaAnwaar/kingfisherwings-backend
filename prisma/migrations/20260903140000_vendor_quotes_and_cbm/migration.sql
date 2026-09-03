-- Vendor quotes + notification type (enum add must commit before use)

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VENDOR_QUOTE_SENT';
