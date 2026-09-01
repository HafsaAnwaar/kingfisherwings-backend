/** Load .env before any module reads process.env (QueueModule, redis.config, etc.). */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });
