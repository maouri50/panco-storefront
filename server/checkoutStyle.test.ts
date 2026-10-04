import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("historical green Easy Order checkout styling", () => {
  it("keeps the rounded white checkout card and green confirmation action", () => {
    expect(stylesheet).toContain(
      ".inline-order-card { margin: 25px 0 0; padding: 25px; border: 1px solid rgba(29,29,27,.2); border-radius: 19px; background: #fff; box-shadow: 0 16px 28px rgba(18,18,18,.09); }",
    );
    expect(stylesheet).toContain(
      ".inline-order-card .direct-order-fields input { height: 46px; padding: 0 15px; border: 1px solid rgba(29,29,27,.14); border-radius: 11px; background: #fff;",
    );
    expect(stylesheet).toContain(
      ".inline-order-card .direct-order-submit { min-height: 56px; margin-top: 20px; border-radius: 14px; background: var(--order-confirm); color: #fff;",
    );
    expect(stylesheet).toContain(
      ".inline-order-card .direct-order-submit:hover { background: #056128; }",
    );
    expect(stylesheet).toContain(
      ".inline-order-card { margin-top: 16px; padding: 24px 17px 19px; border-radius: 23px; }",
    );
  });
});
