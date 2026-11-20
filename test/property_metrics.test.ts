import { test } from "node:test";
import assert from "node:assert/strict";
import { openMaintenanceCount, PropertySnapshotSchema } from "../property_metrics";

test("open maintenance count excludes closed and in_progress", () => {
  const snapshot = PropertySnapshotSchema.parse({
    maintenance: [
      { id: "m1", status: "open", unit: "A1" },
      { id: "m2", status: "open", unit: "B2" },
      { id: "m3", status: "closed", unit: "C3" },
      { id: "m4", status: "in_progress", unit: "D4" },
    ],
    documents: [],
    reminders: [],
  });
  assert.equal(openMaintenanceCount(snapshot), 2);
});
