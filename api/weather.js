const hits = new Map();
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: { message: "Method not allowed" } }); }
  const city = typeof req.query?.city === "string" ? req.query.city.trim() : "";
  if (!city || city.length > 100 || /[\u0000-\u001f]/.test(city)) return res.status(400).json({ error: { message: "Enter a valid city (1–100 characters)." } });
  const key = process.env.WEATHERAPI_KEY;
  if (!key) return res.status(500).json({ error: { message: "Weather service is not configured. Add WEATHERAPI_KEY in Vercel project settings." } });
  const now = Date.now(), ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  let bucket = hits.get(ip);
  if (!bucket || now - bucket.start > 60000) bucket = { start: now, count: 0 };
  bucket.count++; hits.set(ip, bucket);
  if (bucket.count > 30) return res.status(429).json({ error: { message: "Too many requests. Please wait a minute and try again." } });
  if (hits.size > 5000) for (const [k,v] of hits) if (now-v.start > 60000) hits.delete(k);
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url = new URL("https://api.weatherapi.com/v1/current.json");
    url.searchParams.set("key", key); url.searchParams.set("q", city); url.searchParams.set("aqi", "no");
    const upstream = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    const body = await upstream.text();
    // Never return a credential if an upstream error unexpectedly echoes it.
    const safeBody = body.split(key).join("[REDACTED]");
    res.setHeader("Content-Type", upstream.headers.get("content-type")?.includes("json") ? "application/json; charset=utf-8" : "text/plain; charset=utf-8");
    return res.status(upstream.status).send(safeBody);
  } catch (e) {
    const timeout = e.name === "AbortError";
    return res.status(timeout ? 504 : 502).json({ error: { message: timeout ? "Weather service timed out. Please retry." : "Could not reach the weather service. Please retry." } });
  } finally { clearTimeout(timer); }
};