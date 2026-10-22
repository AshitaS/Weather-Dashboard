# Afterweather — Weather, considered.

A responsive dark weather dashboard built with HTML, CSS, vanilla JavaScript and a Node.js Vercel serverless function.

## Features
- Search any supported city or select ten popular cities.
- Current temperature, condition, feels-like, local time, humidity, wind, UV and cloud cover.
- Deterministic mood engine with explicit priority: Scorching, Freezing, Muggy, Windy, Pleasant, Comfortable, Mixed.
- Raw and formatted JSON inspector with syntax highlighting and copy.
- Server-side WeatherAPI proxy, request validation, timeout, defensive key redaction and best-effort per-instance rate limiting.
- Responsive design, keyboard-friendly controls and reduced-motion support.

## Deploy
1. Import this repository at https://vercel.com/new.
2. In Project Settings → Environment Variables, set `WEATHERAPI_KEY` to your WeatherAPI key for Production (and Preview if needed).
3. Deploy. The site calls `/api/weather?city=...`; the browser never calls WeatherAPI directly.
4. Test a popular city, a city outside the list, an unknown city, and both JSON tabs.

## Local development
Install Node.js 18+ and Vercel CLI, copy `.env.example` to `.env.local`, set `WEATHERAPI_KEY`, then run `vercel dev`.

Never commit API keys, Vercel tokens, or GitHub tokens. The in-memory rate limit is best-effort per serverless instance; use shared storage or an upstream gateway for a strict global limit.
