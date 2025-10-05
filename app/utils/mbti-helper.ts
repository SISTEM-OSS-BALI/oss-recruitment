// lib/devil.ts

/* ====== Types ====== */
export type DevilNewTestResp = {
  meta: {
    status_code: number;
    success: boolean;
    docs_url?: string;
    total_results?: number;
  };
  data?: { test_id: string; test_url: string };
};

type DevilNewTestOptions = {
  companyName?: string; // company_name
  returnUrl?: string; // return_url
  notifyUrl?: string; // notify_url
  completedMessage?: string; // completed_message
  nameOfTester?: string; // name_of_tester
  themeColor?: string; // theme_color (#RRGGBB)
  askGender?: boolean; // ask_gender
  askAge?: boolean; // ask_age
  lang?: "en" | "nl" | "id" | "ir" | "vn" | "cn";
};

export async function devilCreateTest(opts: DevilNewTestOptions = {}) {
  const base = process.env.DEVIL_API_BASE!;
  const key = process.env.DEVIL_API_KEY!;
  if (!base || !key)
    throw new Error("DEVIL_API_BASE / DEVIL_API_KEY belum diset");

  const p = new URLSearchParams({ api_key: key });
  if (opts.companyName) p.set("company_name", opts.companyName);
  if (opts.returnUrl) p.set("return_url", opts.returnUrl);
  if (opts.notifyUrl) p.set("notify_url", opts.notifyUrl);
  if (opts.completedMessage) p.set("completed_message", opts.completedMessage);
  if (opts.nameOfTester) p.set("name_of_tester", opts.nameOfTester);
  if (opts.themeColor) p.set("theme_color", opts.themeColor.replace(/^#/, "#"));
  if (typeof opts.askGender === "boolean")
    p.set("ask_gender", opts.askGender ? "1" : "0");
  if (typeof opts.askAge === "boolean")
    p.set("ask_age", opts.askAge ? "1" : "0");
  if (opts.lang) p.set("lang", opts.lang);

  const url = `${base}/new_test?${p.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok)
    throw new Error(`Devil API error: ${res.status} ${await res.text()}`);

  const json = (await res.json()) as DevilNewTestResp;
  if (!json?.meta?.success || !json?.data?.test_url) {
    throw new Error("Devil API unexpected payload (missing data.test_url)");
  }
  return json;
}

/* ====== CHECK TEST ====== */

export type DevilCheckTestResp<T = unknown> = {
  meta: { status_code: number; success: boolean };
  data?: T; // bentuk data vendor bisa berubah; simpan mentah (stringify) di DB
};

type CheckTestOptions<T = unknown> = {
  /** timeout per request (ms). default 10s */
  timeoutMs?: number;
  /** aktifkan polling hingga selesai. default false (hanya satu kali cek) */
  poll?: boolean;
  /** interval polling (ms). default 2s */
  pollIntervalMs?: number;
  /** batas total polling (ms). default 60s */
  pollTimeoutMs?: number;
  /**
   * Deteksi “sudah selesai”. Default: meta.success === true & ada data.
   * Ganti jika vendor mengirim field khusus (mis. data.status === "completed").
   */
  isDone?: (json: DevilCheckTestResp<T>) => boolean;
};

/** Satu kali GET /check_test */
export async function devilCheckTestOnce<T = unknown>(
  testId: string,
  { timeoutMs = 10_000 }: CheckTestOptions<T> = {}
): Promise<DevilCheckTestResp<T>> {
  if (!testId) throw new Error("testId wajib diisi");

  const base = process.env.DEVIL_API_BASE!;
  const key = process.env.DEVIL_API_KEY!;
  if (!base || !key)
    throw new Error("DEVIL_API_BASE / DEVIL_API_KEY belum diset");

  const p = new URLSearchParams({ api_key: key, test_id: testId });
  const url = `${base}/check_test?${p.toString()}`;

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok)
      throw new Error(
        `Devil check_test HTTP ${res.status} ${await res.text()}`
      );
    const json = (await res.json()) as DevilCheckTestResp<T>;

    // Banyak vendor set success=true hanya saat hasil siap. Kalau beda, sesuaikan.
    if (json?.meta?.success !== true) {
      throw new Error(
        "Devil check_test: success=false (hasil belum siap atau error)"
      );
    }
    return json;
  } finally {
    clearTimeout(tid);
  }
}

/**
 * Wrapper dengan POLLING.
 * Akan loop panggil check_test hingga isDone(json) true atau timeout.
 */
export async function devilCheckTest<T = unknown>(
  testId: string,
  opts: CheckTestOptions<T> = {}
): Promise<DevilCheckTestResp<T>> {
  const {
    poll = false,
    pollIntervalMs = 2_000,
    pollTimeoutMs = 60_000,
    timeoutMs = 10_000,
    isDone = (j) => j?.meta?.success === true && typeof j.data !== "undefined",
  } = opts;

  if (!poll) return devilCheckTestOnce<T>(testId, { timeoutMs });

  const started = Date.now();
  let lastErr: unknown;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const json = await devilCheckTestOnce<T>(testId, { timeoutMs });
      if (isDone(json)) return json;
    } catch (e) {
      // simpan error terakhir (mis. saat belum siap, vendor bisa reply success=false)
      lastErr = e;
    }

    if (Date.now() - started > pollTimeoutMs) {
      if (lastErr)
        throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
      throw new Error("Devil check_test polling timeout");
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
}
