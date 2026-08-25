export const isTemporaryTrpcHtmlResponse = (message: string): boolean =>
  /unexpected token ['"]<|doctype html/i.test(message);

export const shouldRetryTrpcQuery = (failureCount: number, message: string): boolean =>
  isTemporaryTrpcHtmlResponse(message) && failureCount < 3;

export const shouldReportTrpcQueryError = (failureCount: number, message: string): boolean =>
  !isTemporaryTrpcHtmlResponse(message) || failureCount >= 3;
