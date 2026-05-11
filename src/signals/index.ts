/**
 * Signals — 14 market signals from the Taifoon Spinner Intel layer.
 *
 * Streamed via Server-Sent Events from /api/intel/signals/stream.
 */

import type { TaifoonClient } from "../client";

export type SignalKind =
  | "fill"
  | "intent"
  | "spread_dev"
  | "anomaly"
  | "mev_extraction"
  | "stale_oracle"
  | "decoder_gap"
  | "aggregator_split"
  | "cross_vm_route"
  | "finality_lag"
  | "donut_settlement"
  | "reviewer_verdict"
  | "loop_edge_fired"
  | "self_healer_alert";

export interface FillEvent {
  kind: "fill";
  chainId: number;
  txHash: string;
  protocol: string;
  notional: string;     // bigint as string for JSON
  filledAt: number;
}

export interface IntentEvent {
  kind: "intent";
  intentId: string;
  srcChain: number;
  dstChain: number;
  notional: string;
  deadline: number;
}

export type SignalEvent = FillEvent | IntentEvent | { kind: Exclude<SignalKind, "fill" | "intent">; [k: string]: unknown };

export class Signals {
  constructor(private readonly client: TaifoonClient) {}

  /** Open an SSE stream of signals. Caller iterates. */
  async *stream(kinds: SignalKind[] = []): AsyncGenerator<SignalEvent> {
    const filter = kinds.length ? `?kind=${kinds.join(",")}` : "";
    const url = `${this.client.apiUrl}/api/intel/signals/stream${filter}`;
    const headers = new Headers({ Accept: "text/event-stream" });
    if (this.client.apiKey) headers.set("Authorization", `Bearer ${this.client.apiKey}`);
    const res = await this.client.fetch(url, { headers });
    if (!res.ok || !res.body) throw new Error(`signal stream failed: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n\n")) >= 0) {
        const chunk = buf.slice(0, nl);
        buf = buf.slice(nl + 2);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try { yield JSON.parse(line.slice(6)) as SignalEvent; }
            catch { /* malformed event */ }
          }
        }
      }
    }
  }
}

/** Convenience: subscribe to fills only. */
export async function* subscribeFills(client: TaifoonClient): AsyncGenerator<FillEvent> {
  const s = new Signals(client);
  for await (const ev of s.stream(["fill"])) {
    if (ev.kind === "fill") yield ev as FillEvent;
  }
}

/** Convenience: subscribe to intents only. */
export async function* subscribeIntents(client: TaifoonClient): AsyncGenerator<IntentEvent> {
  const s = new Signals(client);
  for await (const ev of s.stream(["intent"])) {
    if (ev.kind === "intent") yield ev as IntentEvent;
  }
}
