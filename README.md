# Kimperi — secure serverless e-commerce on AWS

Kimperi is a portfolio e-commerce application built to demonstrate Cloud and
DevSecOps practices on AWS. The React frontend is hosted by Amplify, while a
serverless API handles authentication, products, reviews, orders, and secure
product-image uploads.

## Architecture

```text
React / Amplify Hosting
        |
        +-- Cognito User Pool (sign-up, sign-in, JWT, admin group)
        |
        +-- API Gateway HTTP API (JWT authorizer, CORS, throttling)
                |
                +-- Products Lambda ---- DynamoDB Products
                |         |
                |         +-- short-lived presigned upload
                |                     |
                |               private S3 bucket
                |                     |
                |               CloudFront + OAC
                |
                +-- Reviews Lambda ----- DynamoDB Reviews
                |
                +-- Orders Lambda ------ DynamoDB Orders + Amazon SES

GitHub Actions -- OIDC temporary credentials --> Lambda + Amplify deployment
Terraform ------ remote encrypted state ------> AWS infrastructure
```

## Main features

- Customer registration, email confirmation, sign-in, and session management
  with Cognito and Amplify Auth.
- Public product catalogue and product reviews.
- Protected checkout where the backend reloads product prices from DynamoDB
  instead of trusting browser totals.
- Administrator-only product creation, update, deletion, and image upload.
- Private image storage in S3, delivered through CloudFront with Origin Access
  Control (OAC).
- Five-minute presigned upload forms limited to JPG, PNG, or WebP files of at
  most 5 MB.
- Infrastructure creation and removal with Terraform.
- CI/CD quality gates for linting, tests, dependency auditing, secret scanning,
  and filesystem vulnerability scanning.
- Keyless GitHub-to-AWS deployment using short-lived OIDC credentials.

## Security decisions

- AWS credentials never enter React, Git, or GitHub Actions secrets.
- API Gateway validates Cognito JWTs; Lambda also enforces the `admin` group for
  privileged operations.
- The media bucket blocks public access. Only the CloudFront distribution can
  read `products/*`, and only the Products Lambda can authorize writes there.
- Product images use SSE-S3 encryption. A dedicated KMS key and CloudFront WAF
  are documented risk acceptances for this low-traffic, short-lived portfolio
  environment to avoid fixed monthly charges; production would reassess both.
- Product and order input is validated server-side. Prices and totals are
  calculated from trusted database records.
- IAM roles follow least privilege and logs have limited retention.
- Local environment files, Terraform state, plan files, and generated artifacts
  are excluded from Git.

Public AWS identifiers such as an API URL, User Pool ID, and App Client ID are
deployment configuration, not credentials. The repository contains placeholders
only; revoked historical credentials must still be rotated and removed from Git
history before publication.

## Repository layout

```text
backend/             Lambda source code and Node.js tests
infra/               Terraform application infrastructure
infra/bootstrap/     one-time encrypted remote-state infrastructure
src/                 React application
.github/workflows/   verification and deployment pipelines
```

## Local quality checks

Prerequisites: Node.js 22+, npm, Terraform 1.10+, and AWS CLI v2.

```powershell
npm ci --ignore-scripts
npm --prefix backend ci --ignore-scripts
npm run lint
npm test
terraform -chdir=infra fmt -check -recursive
terraform -chdir=infra validate
```

Copy `.env.example` to `.env` only when running the frontend locally. Never
commit `.env` or AWS credentials.

## Deployment

The detailed bootstrap, Terraform, administrator, deployment, and destruction
procedures are documented in [`infra/README.md`](infra/README.md). Infrastructure
changes are deliberately reviewed and applied manually. A push to `main` then
deploys tested Lambda and frontend code through GitHub Actions.

## Cost control

The stack uses on-demand DynamoDB, small ARM Lambda functions, short log
retention, S3 lifecycle cleanup for old object versions, and the least expensive
CloudFront price class. For a short demonstration, create the environment with
Terraform and destroy the application afterward. Destroying this development
stack permanently removes its product images.

## What this project demonstrates

AWS serverless architecture, Infrastructure as Code, identity and access
management, JWT authorization, secure object storage/CDN delivery, CI/CD,
least-privilege IAM, automated testing, secret scanning, and cost-aware cloud
design.
