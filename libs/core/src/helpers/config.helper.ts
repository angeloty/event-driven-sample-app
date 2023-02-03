import { config, parse } from "dotenv";
import { resolve } from "path";
import { expand } from "dotenv-expand";
import { existsSync, readFileSync } from "fs";
export const configLoader = (envPath?: string) => {
  let path = resolve(process.cwd(), `.env`);
  const cfg = config({ path });
  path = envPath && existsSync(envPath) ? envPath : path;

  if (process.env.APP_ENV) {
    const filePath = resolve(
      process.cwd(),
      `.env${process.env.APP_ENV ? `.${process.env.APP_ENV}` : ""}`
    );
    if (existsSync(filePath)) {
      const envConfig = parse(readFileSync(filePath));
      expand(envConfig);
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    }
  }
  expand(cfg);
};