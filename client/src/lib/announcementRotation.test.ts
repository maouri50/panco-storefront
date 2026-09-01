import { describe, expect, it } from "vitest";
import { nextAnnouncementIndex } from "./announcementRotation";

describe("nextAnnouncementIndex", () => {
  it("loops across any number of owner-configured messages", () => {
    expect(nextAnnouncementIndex(0, 4)).toBe(1);
    expect(nextAnnouncementIndex(3, 4)).toBe(0);
  });
  it("keeps a single message stable", () => expect(nextAnnouncementIndex(0, 1)).toBe(0));
});
