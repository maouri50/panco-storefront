export function createCashOnDeliveryReference(
  timestamp = Date.now(),
  uuid = crypto.randomUUID(),
) {
  return `PA-${timestamp.toString(36).toUpperCase()}-${uuid.slice(0, 4).toUpperCase()}`;
}
