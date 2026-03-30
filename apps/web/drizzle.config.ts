import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "path";

// drizzle-kit no carga .env.local (solo Next en dev); misma fuente que docs/DATA_MODEL.md
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL no está definida. Añádela en apps/web/.env.local (o .env) y vuelve a ejecutar db:migrate.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
