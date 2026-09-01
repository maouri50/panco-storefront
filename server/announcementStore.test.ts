import { describe, expect, it } from "vitest";
import { defaultAnnouncementConfig } from "./announcementStore";

describe("Panco announcement defaults", () => {
  it("provides a green rotating announcement bar fallback", () => {
    expect(defaultAnnouncementConfig.backgroundColor).toBe("#18362a");
    expect(defaultAnnouncementConfig.messages.length).toBeGreaterThan(1);
    expect(defaultAnnouncementConfig.rotationSeconds).toBeGreaterThanOrEqual(2);
  });
});
