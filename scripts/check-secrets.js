// Small, dependency-free guardrail; not a substitute for a specialist scanner.
// Findings print locations and rule names only, never matched values.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
const rules = [
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['JWT literal', /\beyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]+/],
  [
    'Provider token',
    /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk_live_[A-Za-z0-9]{16,})/,
  ],
  [
    'Secret assignment',
    /(?:secretAccessKey|aws_secret_access_key|client_secret|api_key)["']?\s*[:=]\s*["'][A-Za-z0-9/+=_.-]{16,}["']/i,
  ],
];
let count = 0;
function inspect(label, buffer) {
  if (buffer.includes(0)) return;
  const text = buffer.toString('utf8');
  for (const [name, pattern] of rules) {
    const match = pattern.exec(text);
    if (match) {
      count++;
      console.error(
        `${label}:${text.slice(0, match.index).split('\n').length}: ${name} [REDACTED]`,
      );
    }
  }
}
try {
  const names = git('ls-files', '--cached', '--others', '--exclude-standard', '-z')
    .split('\0')
    .filter(Boolean);
  for (const name of new Set(names))
    if (fs.existsSync(name) && fs.statSync(name).isFile()) inspect(name, fs.readFileSync(name));
  if (process.argv.includes('--history')) {
    const records = git('rev-list', '--objects', '--all')
      .trim()
      .split('\n')
      .filter((row) => row.includes(' '))
      .map((row) => ({
        id: row.slice(0, row.indexOf(' ')),
        path: row.slice(row.indexOf(' ') + 1),
      }));
    const batch = execFileSync('git', ['cat-file', '--batch'], {
      input: records.map((r) => r.id).join('\n') + '\n',
      maxBuffer: 150 * 1024 * 1024,
    });
    let offset = 0;
    for (const record of records) {
      const end = batch.indexOf(10, offset);
      const [, type, size] = batch.subarray(offset, end).toString().split(' ');
      offset = end + 1;
      const content = batch.subarray(offset, offset + Number(size));
      offset += Number(size) + 1;
      if (type === 'blob') inspect(`${record.id.slice(0, 8)}:${record.path}`, content);
    }
  }
  console.log(
    count
      ? `${count} potential secret(s). Review locally and revoke any real credential.`
      : 'No matches for the configured secret patterns.',
  );
  process.exitCode = count ? 1 : 0;
} catch {
  console.error('Secret scan could not complete. Run it inside the Git repository.');
  process.exitCode = 2;
}
