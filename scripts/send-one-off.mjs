// Send a one-off email broadcast to the external contacts in
// drafts/external-contacts.json. Used for recipients we deliberately
// keep out of the signatures database (Option C from the April 2026
// broadcast planning — personal neighbor contacts who are not petition
// signers).
//
// Usage:
//   node scripts/send-one-off.mjs <html-file> "<subject>"
//
// Example:
//   node scripts/send-one-off.mjs drafts/followup-april27.html \
//     "Safe174th Update: April 27 meeting time confirmed"
//
// Requires RESEND_API_KEY in .env. Unsubscribe is routed to a mailto
// link to jasonwadejob@gmail.com — recipients who want out reply and
// get removed from drafts/external-contacts.json manually.

import { readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';

const FROM = 'Safe 174th <noreply@safe174th.com>';
const REPLY_TO = 'jasonwadejob@gmail.com';
const UNSUB_MAILTO =
  'mailto:jasonwadejob@gmail.com?subject=Unsubscribe%20from%20safe174th%20emails' +
  '&body=Please%20remove%20my%20email%20from%20the%20mailing%20list.';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DELAY_MS = 550; // stay under Resend's 2 req/sec rate limit

const [, , htmlFile, subject] = process.argv;
if (!htmlFile || !subject) {
  console.error('Usage: node scripts/send-one-off.mjs <html-file> "<subject>"');
  process.exit(2);
}

// Load RESEND_API_KEY from .env
const env = readFileSync(path.resolve('.env'), 'utf8');
const apiKey = env
  .split('\n')
  .find((l) => l.startsWith('RESEND_API_KEY='))
  ?.split('=', 2)[1]
  ?.trim();
if (!apiKey) {
  console.error('RESEND_API_KEY not found in .env');
  process.exit(2);
}

const htmlTemplate = readFileSync(htmlFile, 'utf8');
if (!htmlTemplate.includes('{{UNSUBSCRIBE_URL}}')) {
  console.error('HTML must contain {{UNSUBSCRIBE_URL}} placeholder');
  process.exit(2);
}

const contacts = JSON.parse(
  readFileSync('drafts/external-contacts.json', 'utf8')
);
console.log(`Sending "${subject}" to ${contacts.length} external contacts`);
console.log();

async function sendOne(to, firstName) {
  const html = htmlTemplate
    .replaceAll('{{FIRST_NAME}}', firstName || 'neighbor')
    .replaceAll('{{UNSUBSCRIBE_URL}}', UNSUB_MAILTO);

  const body = {
    from: FROM,
    reply_to: REPLY_TO,
    to: [to],
    subject,
    html,
    headers: {
      'List-Unsubscribe': `<${UNSUB_MAILTO}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()).id;
}

let ok = 0;
let fail = 0;
const failures = [];

for (let i = 0; i < contacts.length; i++) {
  const c = contacts[i];
  const n = `[${String(i + 1).padStart(2)}/${contacts.length}]`;
  try {
    const id = await sendOne(c.email, c.first_name);
    console.log(`  ${n} OK    ${c.email}  id=${id}`);
    ok++;
  } catch (e) {
    console.log(`  ${n} FAIL  ${c.email}  ${e.message}`);
    fail++;
    failures.push({ email: c.email, error: e.message });
  }
  await sleep(DELAY_MS);
}

console.log();
console.log(`=== Summary ===`);
console.log(`Sent OK:  ${ok}`);
console.log(`Failures: ${fail}`);
if (failures.length) {
  console.log();
  console.log('Failure details:');
  for (const f of failures) console.log(`  ${f.email}: ${f.error}`);
}
process.exit(fail ? 1 : 0);
