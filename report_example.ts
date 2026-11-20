import {
  reportPropertyMetrics,
  fetchSpendSeries,
  PropertySnapshotSchema,
} from "./property_metrics";

async function main() {
  const snapshot = PropertySnapshotSchema.parse({
    maintenance: [
      { id: "m1", status: "open", unit: "A1" },
      { id: "m2", status: "open", unit: "B2" },
      { id: "m3", status: "closed", unit: "C3" },
    ],
    documents: [
      { id: "d1", tenant: "Alice", signed: true },
      { id: "d2", tenant: "Bob", signed: false },
    ],
    reminders: [
      { id: "r1", due: "2025-01-01", sent: false },
      { id: "r2", due: "2025-01-02", sent: true },
    ],
  });

  await reportPropertyMetrics(snapshot);
  console.log("Reported property metrics");

  const usage = await fetchSpendSeries("day");
  console.log(`Fetched ${usage.buckets.length} usage buckets`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
