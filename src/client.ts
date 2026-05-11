/**
 * TaifoonClient — single configured handle. Every other module receives this.
 */

export interface TaifoonClientConfig {
  /** Base URL of the Taifoon API (default: https://api.taifoon.dev). */
  apiUrl?: string;
  /** API key for authenticated endpoints. Optional for public reads. */
  apiKey?: string;
  /** Chain ID for default reads. Defaults to 36927 (Taifoon Devnet). */
  chainId?: number;
  /** Override the JSON-RPC endpoint used by clients that talk on-chain. */
  rpcUrl?: string;
  /** Optional fetch override (e.g. node-fetch when running in pre-Node-18). */
  fetchImpl?: typeof fetch;
}

export class TaifoonClient {
  readonly apiUrl: string;
  readonly apiKey: string | undefined;
  readonly chainId: number;
  readonly rpcUrl: string;
  readonly fetch: typeof fetch;

  constructor(cfg: TaifoonClientConfig = {}) {
    this.apiUrl = cfg.apiUrl ?? "https://api.taifoon.dev";
    this.apiKey = cfg.apiKey;
    this.chainId = cfg.chainId ?? 36927;
    this.rpcUrl = cfg.rpcUrl ?? "https://rpc.taifoon.dev";
    this.fetch = cfg.fetchImpl ?? globalThis.fetch;
  }

  /** Internal: fetch + standard error handling. */
  async request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const url = this.apiUrl + (path.startsWith("/") ? path : "/" + path);
    const headers = new Headers(init.headers);
    if (this.apiKey) headers.set("Authorization", `Bearer ${this.apiKey}`);
    headers.set("Accept", "application/json");
    const res = await this.fetch(url, { ...init, headers });
    if (!res.ok) {
      throw new TaifoonError(`API ${res.status} on ${path}`, res.status, await safeText(res));
    }
    return (await res.json()) as T;
  }
}

export class TaifoonError extends Error {
  constructor(msg: string, public readonly status?: number, public readonly body?: string) {
    super(msg);
    this.name = "TaifoonError";
  }
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ""; }
}
