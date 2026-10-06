import { describe, expect, it } from "vitest";
import { schemaStatements } from "./schemaBootstrap";

describe("runtime database schema bootstrap", () => {
  it("creates every required production table idempotently", () => {
    expect(schemaStatements).toHaveLength(4);
    for (const table of ["catalog_items", "users", "announcement_settings", "newsletter_subscribers"]) {
      const statement = schemaStatements.find((sql) => sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`));
      expect(statement).toBeDefined();
    }
    expect(schemaStatements[0]).toContain("catalog_items_slug_unique");
    expect(schemaStatements[3]).toContain("newsletter_subscribers_email_unique");
  });
});
