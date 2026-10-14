export type AdminUserRow = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  providers: string;
  providerType: string;
  createdAt: string | null;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeAdminUser(row: Record<string, unknown>): AdminUserRow {
  return {
    id: asText(row.id) || asText(row.uid),
    displayName: asText(row.display_name) || asText(row.displayName),
    email: asText(row.email),
    phone: asText(row.phone),
    providers: asText(row.providers) || "Email",
    providerType: asText(row.provider_type) || asText(row.providerType),
    createdAt: asText(row.created_at) || asText(row.createdAt) || null,
  };
}

export function formatAdminUserDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
