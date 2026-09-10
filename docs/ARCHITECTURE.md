# Architecture and integration notes

## Two explicitly separate modes

**Demo mode (default):** UI → API adapter → in-memory fixtures. Authentication is a fictional profile selector. No Cognito calls, AWS credentials, remote database, real emails or payments are involved. The cart alone persists in local storage; profiles, catalog edits and reviews reset on reload. The demonstration uses local images and system fonts.

**AWS mode (optional):** UI → API adapter → configured API Gateway endpoint, using the historical Cognito ID-token contract. Invalid or incomplete configuration fails rather than silently switching to a mock backend. Demo identities cannot be used as Bearer tokens. The optional mode requires a separately supplied backend and has not been integration-tested against the retired infrastructure.

## Historical design

The internship report documents three API areas:

| Area               | Routes                                                                                                 | Historical integration                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Products           | `GET /products`, `GET /products/{id}`, `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` | Products Lambda → DynamoDB Products; writes check the admin group       |
| Reviews            | `GET /reviews?productId=...`, `POST /reviews?productId=...`                                            | Reviews Lambda → DynamoDB Reviews / product index; authenticated writes |
| Order notification | `POST /orders`                                                                                         | Order-email Lambda → SES notification to the configured recipient       |

The detailed report describes API Gateway HTTP API payload format 2.0 and JWT authorizers. Although some overview sections use the generic term “REST API,” the documented payload/authorizer configuration corresponds to HTTP APIs.

The detailed SES chapter describes a seller/administrator notification. It does not establish a production payment flow or durable order-history service. Accordingly, this repository does not claim payment processing, verified fulfillment or a DynamoDB order ledger.

Supporting services described in the report:

- AWS Amplify Hosting for the frontend.
- S3 media storage with public access blocked and CloudFront Origin Access Control.
- Cognito User Pool and an admin group; the current frontend does not require an Identity Pool.
- Separate Lambda IAM roles scoped to the necessary table or SES operations.
- CloudWatch logs and alarms, SNS email alerts and AWS Budgets spending notifications.

The original configuration screenshots are not configuration exports or a reproducible deployment. The Word report is not copied into the public repository because it includes personal/account context. These notes summarize the useful technical material without publishing those values.

## Trust boundaries

1. React route guards control navigation only. API Gateway and Lambda must enforce authentication and authorization independently.
2. JWT validation must include signature, expected issuer/audience, expiry and the accepted token type. Cognito groups must be checked in the verified claims for admin writes.
3. Browser prices, totals, identity fields, delivery details and payment-method selections are untrusted input. The server must load catalog prices, validate sizes/stock/quantities and derive the caller from the verified token.
4. CORS is a browser interoperability control, not an authorization system. Non-browser callers can still call an API.
5. The frontend's validation improves feedback but cannot establish the security of a backend that is not included here.
6. Do not claim in-memory-only Cognito token storage: this project does not override Amplify's token-storage provider. Review storage and session policy for any real deployment.

## Optional AWS adapter

Create `.env.local` from `.env.example` using your own public settings:

| Variable                    | Expected value                                    |
| --------------------------- | ------------------------------------------------- |
| `VITE_APP_MODE`             | `demo` or `aws`                                   |
| `VITE_COGNITO_USER_POOL_ID` | Your Cognito User Pool ID                         |
| `VITE_COGNITO_CLIENT_ID`    | Public SPA app-client ID, without a client secret |
| `VITE_PRODUCTS_API_URL`     | HTTPS API base; the adapter appends `/products`   |
| `VITE_REVIEWS_API_URL`      | Full HTTPS `/reviews` endpoint                    |
| `VITE_ORDERS_API_URL`       | Full HTTPS `/orders` endpoint                     |

Vite embeds these values into browser code. They are not a secret-storage mechanism. Never restore retired endpoint values or add IAM credentials to the frontend.

The existing API contract is preserved where practical. Product data uses `id`, `name`, `description`, `price`, `image[]`, `category`, `subCategory`, `sizes[]`, `date` and `bestseller`. Prices are MAD values; UI quantities are integers from 1 to 99.

Order requests contain `user`, `address`, `items`, `totals` and `paymentMethod`. Keeping these fields for compatibility does not authorize the backend to trust them. The historical handler's arithmetic based on client item prices is insufficient to establish trusted catalog pricing; implement independent price lookup before production.

The sign-in interface supports completed sign-in, email/SMS/TOTP code confirmation and a required new password. Other Cognito challenges must be implemented or handled through a suitable managed authentication interface before enabling them. No successful authentication is claimed while a challenge remains pending.

## Deployment is intentionally out of scope

No Terraform/CDK/CloudFormation deployment is supplied. CI checks the local demo only and does not publish the site. To serve a built SPA, configure fallback routing to `index.html`, HTTPS and appropriate security headers on the chosen host. Never expose the Vite development server as a production server.

Before restoring AWS mode, add backend integration tests, server-side validation, rate limits, idempotency, safe logging, IAM review and payment-webhook verification if online payments are introduced. Budget alerts notify; they do not impose a guaranteed spending cap.
