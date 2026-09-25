/**
 * KFPP Quote Request item schema (discovery notes)
 *
 * Live list was empty during probe (`{ total: 0, items: [] }`).
 * KingFisher normalizes common WordPress / inquiry field aliases:
 * - id / ID / quote_id / request_id → external_id (numeric for KFPP paths)
 * - contact_name / name / full_name
 * - contact_email / email
 * - contact_phone / phone / mobile
 * - company_name / company
 * - message / notes / comments / description
 * - commodity / cargo / subject
 * - status / state
 * - submitted_at / created_at / date
 *
 * Allowed status values: not published by the WP plugin UI — store as free
 * string and optionally map via connection.status_map.
 *
 * Security: rotate the WordPress API key if it was exposed in admin UI / chat.
 * Prefer header auth `X-KFPP-Api-Key` only (never query-string from KingFisher).
 */
export const KFPP_SAMPLE_ITEM_PLACEHOLDER = {
  id: 1,
  status: "pending",
  contact_name: "Jane Doe",
  contact_email: "jane@example.com",
  contact_phone: "+971500000000",
  company_name: "Example LLC",
  message: "Need ocean freight quote DXB → Jebel Ali",
  commodity: "General cargo",
  created_at: "2026-09-21T10:00:00Z",
};
