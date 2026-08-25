export const codOrderFieldNames = ["customerName", "phone", "address", "city"] as const;

export type CodOrderFieldName = (typeof codOrderFieldNames)[number];

export function hasCompleteCodOrderFields(values: Record<CodOrderFieldName, string>) {
  return codOrderFieldNames.every((fieldName) => values[fieldName].trim().length > 0);
}
