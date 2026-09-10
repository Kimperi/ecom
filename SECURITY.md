# Security and publication notes

This repository is an educational portfolio. The default mode is a browser-local demonstration, not a production service or an authentication-security simulation.

## Reporting a concern

Do not post credentials, tokens, personal customer data or raw sensitive screenshots in a public issue. Use GitHub private vulnerability reporting if the repository owner has enabled it; otherwise start with a non-sensitive request for a private reporting channel.

## Guardrails included

- Explicit separation between demo profiles and the optional AWS adapter.
- No embedded AWS endpoint or Cognito resource values in the current application configuration.
- `.env` files and common private-key/state files ignored; `.env.example` contains public variable names only.
- Input-validation and authentication-state regression tests.
- Generic API failure messages rather than raw response bodies.
- GitHub Actions with read-only permissions, pinned action revisions and no deployment credentials.
- A small secret-pattern scanner that never prints matched values.

Run `npm run check:secrets -- --history` before publishing. Its pattern coverage is deliberately limited; it does not OCR images, scan GitHub logs/artifacts, discover unreachable Git objects or prove that all credentials have been found. Complement it with a dedicated scanner and manual review when handling real credentials.

## If a real secret was committed

Revoke or rotate it first, including when its associated cloud resources have been removed. Ignoring a file or deleting the current line does not remove historical copies. Review the reachable Git history and any CI artifacts, releases, forks or exposed reports. A new public repository containing only a reviewed clean snapshot can be safer than exposing an old private history. No destructive history rewrite is required merely because public Cognito IDs or API URLs exist in old commits.

## Known boundaries

The original backend/configuration exports are not included. Server-side JWT/role checks, prices/stock, ownership, rate limiting, idempotency, IAM and deployment headers cannot be certified from this frontend. Demo profiles are intentionally selectable by anyone and must never be treated as real authorization. Local storage and browser state are user-controlled.

Current dependency audit results are a point-in-time check, not a permanent security guarantee. Online payments are not implemented. Do not supply real customer information to the demonstration.
