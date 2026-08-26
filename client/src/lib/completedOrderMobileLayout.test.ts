import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const productStyles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Panco mobile completed-order layout", () => {
  it("forces the completed-order content and summary into a non-overlapping single-column flow", () => {
    expect(productStyles).toContain(".product-page--complete { overflow-x: hidden; }");
    expect(productStyles).toContain(".panco-order-success { display: flex; flex-direction: column;");
    expect(productStyles).toContain(".panco-order-summary { order: 2; align-self: stretch; overflow: hidden; }");
    expect(productStyles).toContain(".panco-order-success__main, .panco-order-summary { width: 100%; min-width: 0;");
  });
});
