import { z } from "zod";
import { infrai } from "./infrai";

export const MaintenanceRequest = z.object({
  id: z.string(),
  status: z.enum(["open", "in_progress", "closed"]),
  unit: z.string(),
});
export type MaintenanceRequest = z.infer<typeof MaintenanceRequest>;

export const TenantDocument = z.object({
  id: z.string(),
  tenant: z.string(),
  signed: z.boolean(),
});
export type TenantDocument = z.infer<typeof TenantDocument>;

export const InspectionReminder = z.object({
  id: z.string(),
  due: z.string(),
  sent: z.boolean(),
});
export type InspectionReminder = z.infer<typeof InspectionReminder>;

export const PropertySnapshotSchema = z.object({
  maintenance: z.array(MaintenanceRequest),
  documents: z.array(TenantDocument),
  reminders: z.array(InspectionReminder),
});
export type PropertySnapshot = z.infer<typeof PropertySnapshotSchema>;

export function openMaintenanceCount(snapshot: PropertySnapshot): number {
  return snapshot.maintenance.filter((m) => m.status === "open").length;
}

export function signedDocumentCount(snapshot: PropertySnapshot): number {
  return snapshot.documents.filter((d) => d.signed).length;
}

export function pendingReminderCount(snapshot: PropertySnapshot): number {
  return snapshot.reminders.filter((r) => !r.sent).length;
}

export async function reportPropertyMetrics(snapshot: PropertySnapshot): Promise<void> {
  const open = openMaintenanceCount(snapshot);
  const signed = signedDocumentCount(snapshot);
  const pending = pendingReminderCount(snapshot);

  await infrai.metrics.report({
    name: "property.maintenance.open",
    value: open,
    type: "gauge",
    tags: { domain: "property" },
  });
  await infrai.metrics.report({
    name: "property.documents.signed",
    value: signed,
    type: "counter",
    tags: { domain: "property" },
  });
  await infrai.metrics.report({
    name: "property.inspection.pending",
    value: pending,
    type: "gauge",
    tags: { domain: "property" },
  });
}

export async function fetchSpendSeries(interval = "day") {
  return infrai.account.usage.timeseries({ interval });
}
