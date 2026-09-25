# Quote Requests Bridge — sample / mapping notes

Live KFPP list was empty during discovery (`{"total":0,"items":[]}`).

KingFisher maps common field aliases (see `normalize-quote-request.ts`):

| Normalized field | Remote aliases |
|------------------|----------------|
| `external_id` | `id`, `ID`, `quote_id`, `request_id` |
| `contact_name` | `contact_name`, `name`, `full_name` |
| `contact_email` | `contact_email`, `email` |
| `contact_phone` | `contact_phone`, `phone`, `mobile` |
| `company_name` | `company_name`, `company` |
| `message` | `message`, `notes`, `comments`, `description` |
| `commodity` | `commodity`, `cargo`, `subject` |
| `status` | `status`, `state` |
| `submitted_at` | `submitted_at`, `created_at`, `date` |

**Status enums:** not published by the WP plugin — stored as free strings; optional `status_map` on the connection.

**Security:** Rotate any API key that appeared in WordPress admin screenshots or chat. KingFisher always uses header `X-KFPP-Api-Key` (never query-string).

**Example item shape (illustrative):**

```json
{
  "id": 1,
  "status": "pending",
  "contact_name": "Jane Doe",
  "contact_email": "jane@example.com",
  "contact_phone": "+971500000000",
  "company_name": "Example LLC",
  "message": "Need ocean freight quote",
  "commodity": "General cargo",
  "created_at": "2026-09-21T10:00:00Z"
}
```
