import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PancoLogo } from "./PancoLogo";

describe("PancoLogo", () => {
  it("renders the original vector monogram with the Panco wordmark", () => {
    const markup = renderToStaticMarkup(createElement(PancoLogo, { variant: "dark" }));
    expect(markup).toContain("panco-logo--dark");
    expect(markup).toContain("<svg");
    expect(markup).toContain("Panco");
  });

  it("renders a compact monogram-only version for stamps and tight placements", () => {
    const markup = renderToStaticMarkup(createElement(PancoLogo, { variant: "light", markOnly: true }));
    expect(markup).toContain("panco-logo--mark");
    expect(markup).not.toContain("panco-logo__type");
  });
});
