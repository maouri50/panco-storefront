import { describe, expect, it } from "vitest";
import { getHeaderTransitionThreshold } from "./headerTransition";

describe("getHeaderTransitionThreshold", () => {
  it("reveals the compact commerce header when the post-hero title begins entering view", () => {
    expect(getHeaderTransitionThreshold(820, 720)).toBe(212);
  });

  it("keeps a sensible minimum scroll distance when the hero fits in the viewport", () => {
    expect(getHeaderTransitionThreshold(660, 812)).toBe(96);
  });
});
