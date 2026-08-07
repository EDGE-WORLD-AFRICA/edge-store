let intervalId: ReturnType<typeof setInterval> | null = null;

const checkApi = async (url: string, timeoutMs = 5000) => {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const end = performance.now();
    const latency = Math.round(end - start);

    return { ok: response.ok, latency };
  } catch {
    return { ok: false, latency: null };
  }
};

const checkInternet = async (url: string, timeoutMs = 5000) => {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Using no-cors allows us to detect reachability without reading the response body
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const end = performance.now();
    const latency = Math.round(end - start);

    return { ok: true, latency };
  } catch {
    return { ok: false, latency: null };
  }
};

onmessage = (event: MessageEvent) => {
  const { action, apiUrl, internetUrl, intervalMs } = event.data;

  if (action === "start") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    const runChecks = async () => {
      const apiResult = await checkApi(apiUrl);
      const internetResult = await checkInternet(internetUrl);

      postMessage({
        apiStatus: apiResult.ok
          ? apiResult.latency! > 1500
            ? "slow"
            : "online"
          : "offline",
        apiLatency: apiResult.latency,
        internetStatus: internetResult.ok ? "online" : "offline",
      });
    };

    runChecks();
    intervalId = setInterval(runChecks, intervalMs || 30000);
  } else if (action === "stop") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};