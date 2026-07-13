import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.log("FAIL: .env.local not found");
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf8");
const vars = {};
for (const rawLine of content.split(/\r?\n/)) {
  const m = rawLine.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

const checks = [
  { key: "STRIPE_SECRET_KEY", test: v => /^sk_(test|live)_/.test(v), mode: v => (v.startsWith("sk_live_") ? "LIVE" : "test") },
  { key: "STRIPE_WEBHOOK_SECRET", test: v => /^whsec_/.test(v), mode: () => "set" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", test: v => /^pk_(test|live)_/.test(v), mode: v => (v.startsWith("pk_live_") ? "LIVE" : "test") },
];

let ok = true;
for (const { key, test, mode } of checks) {
  const v = vars[key];
  if (!v || !test(v)) {
    console.log(`FAIL: ${key} is missing or malformed in .env.local`);
    ok = false;
  } else {
    console.log(`OK: ${key} present (${mode(v)})`);
  }
}

const webhookRoute = path.join(process.cwd(), "app", "api", "webhooks", "stripe", "route.ts");
if (!fs.existsSync(webhookRoute)) {
  console.log("FAIL: webhook route app/api/webhooks/stripe/route.ts not found");
  ok = false;
} else {
  const routeSrc = fs.readFileSync(webhookRoute, "utf8");
  if (!routeSrc.includes("STRIPE_WEBHOOK_SECRET") || !routeSrc.includes("constructEvent")) {
    console.log("FAIL: webhook route no longer verifies signature with STRIPE_WEBHOOK_SECRET");
    ok = false;
  } else {
    console.log("OK: webhook route verifies signature via STRIPE_WEBHOOK_SECRET");
  }
}

process.exit(ok ? 0 : 1);
