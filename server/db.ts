import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// Database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_P5W3gtTdrNOv@ep-autumn-lake-a54ezkyj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";

// Create neon client
const sql = neon(databaseUrl);

// Create drizzle client
export const db = drizzle(sql, { schema });
