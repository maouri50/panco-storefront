import { describe, expect, it } from "vitest";
import { isTemporaryTrpcHtmlResponse, shouldReportTrpcQueryError, shouldRetryTrpcQuery } from "./trpcRecovery";

describe("tRPC startup recovery", () => {
  const htmlMessage = 'Unexpected token \'<\', "<!doctype "... is not valid JSON';

  it("recognizes the temporary HTML fallback parsing error", () => {
    expect(isTemporaryTrpcHtmlResponse(htmlMessage)).toBe(true);
    expect(isTemporaryTrpcHtmlResponse("Forbidden")).toBe(false);
  });

  it("retries HTML fallback queries a bounded number of times and reports a persistent failure", () => {
    expect(shouldRetryTrpcQuery(1, htmlMessage)).toBe(true);
    expect(shouldRetryTrpcQuery(3, htmlMessage)).toBe(false);
    expect(shouldReportTrpcQueryError(1, htmlMessage)).toBe(false);
    expect(shouldReportTrpcQueryError(3, htmlMessage)).toBe(true);
  });
});
