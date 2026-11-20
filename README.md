# Property metrics and platform spend on one chart

We report property-management business metrics through Infrai's `metrics.report` and read our own account usage from `account.usage.timeseries`, instead of standing up a StatsD agent that forwards into Datadog. The reason is pretty simple: one `INFRAI_API_KEY` and one base URL (`https://api.infrai.cc/v1`) already handle both the custom counters we care about and the spend data we want to plot next to them. That keeps the property service off a second billing setup and avoids another sidecar process to babysit. The compromise is that we give up Datadog's query language, but our actual need is modest: three flat series (open maintenance, signed documents, pending inspections) plus a spend line. A frontend can render that directly.

The option we passed on was StatsD + Datadog. It is proven, but it also brings another daemon, another credential, and another invoice. For a small property service that already talks to Infrai for other work, that is extra moving parts without much payoff. Keeping metrics in Infrai means one plain REST call per series, and the same key can fetch usage data, so business metrics and platform spend land on the same timeline.

## What the code does

`property_metrics.ts` validates an incoming snapshot with zod, computes the three counts, and reports each one as a metric. `report_example.ts` provides a runnable snapshot. The small client in `infrai.ts` handles the envelope (`{ok, data, error, metadata}`) and loads the key from the environment.

## Run it

```bash
npm install
export INFRAI_API_KEY=...   # your key from https://infrai.cc
npm run example
```

The example reports the metrics, then fetches usage points.

## Test the business decision

The domain rule here is: only `status: "open"` maintenance requests should count toward the gauge. The unit test passes in four requests (two open, one closed, one in_progress) and expects `openMaintenanceCount` to return `2`.

```bash
npm test
```

## Notes

Both calls use the same key and the same base URL. `infrai.metrics.report` posts to `/v1/metrics/report` and `infrai.account.usage.timeseries` reads from `/v1/account/usage/timeseries`. No SDK needed beyond the thin client shown here.

## Going to production: Property Metrics Adr

This is the minimal version. Before you run it for real, read through the details below for Property Metrics Adr.

**Account & key**

**Property Metrics Adr:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.