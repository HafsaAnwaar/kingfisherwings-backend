-- Customer outcome: WON -> APPROVED, LOST -> DISAPPROVED
-- Internal staff approval: previous APPROVED -> INTERNALLY_APPROVED
-- Must run AFTER 20260903120000 (new enum values cannot be used in the same transaction).

UPDATE quotations
SET status = 'INTERNALLY_APPROVED'
WHERE status = 'APPROVED';

UPDATE quotation_status_history
SET from_status = 'INTERNALLY_APPROVED'
WHERE from_status = 'APPROVED';

UPDATE quotation_status_history
SET to_status = 'INTERNALLY_APPROVED'
WHERE to_status = 'APPROVED';

UPDATE quotations
SET status = 'APPROVED'
WHERE status = 'WON';

UPDATE quotation_status_history
SET from_status = 'APPROVED'
WHERE from_status = 'WON';

UPDATE quotation_status_history
SET to_status = 'APPROVED'
WHERE to_status = 'WON';

UPDATE quotations
SET status = 'DISAPPROVED'
WHERE status = 'LOST';

UPDATE quotation_status_history
SET from_status = 'DISAPPROVED'
WHERE from_status = 'LOST';

UPDATE quotation_status_history
SET to_status = 'DISAPPROVED'
WHERE to_status = 'LOST';
