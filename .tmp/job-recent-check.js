const fs = require("fs");
const { Pool } = require("pg");

const env = fs.readFileSync("D:/FreightSaas/.env", "utf8");
const match = env.match(/^DATABASE_URL=(.*)$/m);
if (!match) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
let url = match[1].trim().replace(/^["']|["']$/g, "");
const [base, query = ""] = url.split("?");
const params = query
  .split("&")
  .filter(Boolean)
  .filter((part) => !part.toLowerCase().startsWith("channel_binding="));
if (!params.some((p) => p.toLowerCase().startsWith("sslmode="))) {
  params.push("sslmode=require");
}
url = `${base}?${params.join("&")}`;

const pool = new Pool({ connectionString: url, max: 1 });

(async () => {
  const client = await pool.connect();
  try {
    await client.query("SET row_security = off");
    const summary = await client.query(`
      SELECT job_type::text AS job_type,
             (deleted_at IS NOT NULL) AS deleted,
             status::text AS status,
             COUNT(*)::int AS n,
             MIN(created_at) AS first_created,
             MAX(created_at) AS last_created
      FROM jobs
      WHERE created_at > NOW() - INTERVAL '4 days'
        AND job_type::text IN ('AIR_EXPORT','AIR_IMPORT','CUSTOMS_CLEARANCE')
      GROUP BY 1, 2, 3
      ORDER BY 1, 2, 3
    `);
    console.log("SUMMARY");
    console.log(JSON.stringify(summary.rows, null, 2));

    const rows = await client.query(`
      SELECT LEFT(id::text, 8) AS id,
             job_number,
             job_type::text AS job_type,
             status::text AS status,
             (deleted_at IS NOT NULL) AS deleted,
             created_at,
             (parent_job_id IS NOT NULL) AS is_house,
             (branch_id IS NULL) AS no_branch
      FROM jobs
      WHERE created_at > NOW() - INTERVAL '4 days'
        AND job_type::text IN ('AIR_EXPORT','AIR_IMPORT','CUSTOMS_CLEARANCE')
      ORDER BY created_at DESC
      LIMIT 40
    `);
    console.log("ROWS");
    console.log(JSON.stringify(rows.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
