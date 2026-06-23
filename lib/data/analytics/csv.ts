import "server-only";

/**
 * Tiny CSV builder for report exports. RFC-4180-ish escaping: a cell is quoted
 * when it contains a quote, comma, or newline, and inner quotes are doubled.
 * Rows joined with CRLF for spreadsheet compatibility.
 */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => escapeCell(c.value(r))).join(",")).join("\r\n");
  return body ? `${head}\r\n${body}` : head;
}

/** Safe download filename: lowercase, strip anything but [a-z0-9-_], collapse dashes. */
export function safeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "report";
}
