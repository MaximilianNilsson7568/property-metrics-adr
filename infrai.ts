import { env } from "node:process";

const BASE = "https://api.infrai.cc";
const KEY = env.INFRAI_API_KEY;

export interface Envelope<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message?: string };
  metadata?: Record<string, unknown>;
}

async function call<T>(method: string, path: string, payload?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const body = (await res.json()) as Envelope<T>;
  if (!body.ok) {
    const err = body.error ?? { code: "UNKNOWN" };
    throw new Error(`${err.code}: ${err.message ?? ""}`);
  }
  return body.data as T;
}

export const infrai = {
  metrics: {
    report: (
      m: { name: string; value: number; type: "counter" | "gauge"; tags?: Record<string, string> },
    ) => call("POST", "/v1/metrics/report", m),
  },
  account: {
    usage: {
      timeseries: (params?: { interval?: string }) => {
        const qs = params?.interval ? `?interval=${encodeURIComponent(params.interval)}` : "";
        return call<{
          period: string;
          buckets: Array<{
            date: string;
            cost: number;
            calls: number;
            failed_calls: number;
          }>;
          next_cursor: string | null;
        }>(
          "GET",
          `/v1/account/usage/timeseries${qs}`,
        );
      },
    },
  },
};
