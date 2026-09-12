# Ecom AWS infrastructure

This directory recreates the portfolio environment without reusing the old
manually configured AWS resources.

## Architecture

```text
Amplify Hosting
      |
API Gateway HTTP API -- Cognito JWT authorizer
      |
      +-- Products Lambda -- Products DynamoDB table
      |         |
      |         +-- presigned POST -- private S3 -- CloudFront OAC
      +-- Reviews Lambda  -- Reviews + Products tables
      +-- Orders Lambda   -- Orders + Products tables -- SES
```

Terraform creates new resources prefixed with `ecom-<environment>`. It does not
import, change, or delete old manually created resources.

## Security and cost choices

- Remote S3 state with a rotating customer-managed KMS key, versioning, public
  access blocked, TLS-only access, and native S3 lock files.
- No AWS access key, password, token, real email address, or `.tfvars` file committed.
- Separate least-privilege IAM role for each Lambda.
- JWT validation at API Gateway and role checks inside the Products Lambda.
- Administrator-only image uploads use five-minute presigned forms. S3 validates
  file type and a 5 MB limit, while CloudFront OAC is the only public read path.
- The media bucket uses S3-managed encryption to avoid another fixed KMS key
  charge. Old object versions and incomplete uploads have lifecycle cleanup.
- Trivy's dedicated-KMS and CloudFront-WAF checks are suppressed only on these
  two resources with inline rationale. The CDN serves immutable public product
  images through a private origin; a production threat model may require both.
- DynamoDB on-demand billing, encryption, and point-in-time recovery.
- ARM Lambda functions with a small memory allocation and concurrency cap.
- API throttling and short CloudWatch log retention.
- Amplify is created without a GitHub token. A later GitHub Actions workflow
  will deploy the compiled `dist` directory using AWS OIDC.
- MFA is not advertised or enabled until the React login flow handles its
  challenge. Email verification and a strong password policy are enabled.

## Prerequisites

- Terraform 1.10 or newer.
- Node.js 22 or newer.
- AWS CLI authentication through IAM Identity Center/SSO or another temporary
  credential method. Do not place credentials in Terraform files.
- Permission to create the resources declared here.

## 1. Create the remote-state bucket once

From `infra/bootstrap`:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -out bootstrap.tfplan
terraform apply bootstrap.tfplan
terraform output -raw state_bucket_name
terraform output -raw state_kms_key_arn
```

Edit the ignored `terraform.tfvars` with the region/profile you use. Copy the
bucket and KMS outputs into an ignored `infra/backend.hcl` based on
`backend.hcl.example`, and set its `profile` to the same local AWS CLI profile.

The bootstrap state remains local and ignored. Back it up securely because it
is the state that owns the remote-state bucket.

## 2. Install Lambda production dependencies

From `backend`:

```powershell
npm ci --omit=dev --ignore-scripts
npm test
```

Terraform packages `backend/src`, `backend/package.json`, and the installed
production dependencies. Tests are excluded from the Lambda ZIP.

## 3. Plan and create the application

From `infra`:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
Copy-Item backend.hcl.example backend.hcl
terraform init -backend-config=backend.hcl
terraform fmt -check -recursive
terraform validate
terraform plan -out ecom.tfplan
terraform apply ecom.tfplan
```

Use real SES sender/notification addresses only inside the ignored
`terraform.tfvars`. Follow the SES verification email. While the AWS account is
in the SES sandbox, the notification destination must also be verified.

The first apply creates Amplify and returns `amplify_url`. Replace the
`frontend_origins` placeholder in `terraform.tfvars` with that exact URL, then
run another plan and apply. This avoids permitting every website through CORS.

CloudFront can take several minutes to finish its first deployment. After it is
ready, the Admin page can upload JPG, PNG, and WebP product images directly to
the private media bucket. DynamoDB stores only the resulting CloudFront URLs.

## 4. Create an administrator

First create and confirm the user normally through the React sign-up page. Then
add that existing user to the Terraform-created `admin` group:

```powershell
aws cognito-idp admin-add-user-to-group `
  --user-pool-id <terraform-output-user-pool-id> `
  --username <confirmed-user-email> `
  --group-name admin
```

Do not create an admin flag in React or accept a group from an HTTP request.

## 5. Destroy the demonstration environment

From `infra`, using the same backend and variables:

```powershell
terraform plan -destroy -out destroy.tfplan
terraform apply destroy.tfplan
```

This removes only resources recorded in this Terraform state. It does not
remove old manually created AWS resources. Keep the small state bucket for the
next demonstration, or remove it separately only after every dependent stack
has been destroyed and its state has been safely archived.

The development media bucket intentionally uses `force_destroy = true`, so
destroying the stack also deletes every uploaded product image. Do not use that
setting for irreplaceable production assets.

The customer-managed state key has a small monthly KMS cost. It is used because
Terraform state can contain sensitive infrastructure data. If the whole
portfolio environment must be removed, destroy the application first and the
bootstrap last; KMS keeps the key in a seven-day pending-deletion period.

## Outputs used by the frontend

The API URL, Cognito pool ID, and client ID are public configuration values, not
credentials. Terraform stores them in outputs and in a dedicated SSM Parameter
Store path so the future CI workflow can build the Vite app without reading the
entire Terraform state.

## Enable GitHub Actions deployment

The Terraform application creates a GitHub OIDC provider when the AWS account
does not already have one, plus a deployment role restricted to this repository
and the `main` branch. The role can update only the three Lambda packages, read
the public build parameters, and start deployments for this Amplify app.

After the first application apply, create these non-secret GitHub repository
variables from **Settings > Secrets and variables > Actions > Variables**:

- `AWS_DEPLOY_ROLE_ARN`: value of `github_deploy_role_arn`.
- `AWS_REGION`: the region used by Terraform.
- `FRONTEND_CONFIG_PREFIX`: value of `frontend_ssm_parameter_prefix` without a
  trailing slash, for example `/ecom-dev/frontend`.

No AWS access key or secret access key is required. The workflow requests a
short-lived credential through OIDC only after its tests and security scan pass.

The repository may use GitHub's newer immutable OIDC subject format. If AWS
rejects the standard subject, set `github_oidc_subject` in the ignored
`terraform.tfvars` to the exact immutable subject for this repository and apply
again.

The deployment workflow intentionally does not run `terraform apply`. Review
infrastructure changes through a Terraform plan and apply them manually. Code
changes on `main` can then update the Lambda packages and the manually connected
Amplify branch without granting GitHub permission to delete infrastructure.

For stronger repository governance, protect `main`, require a pull request, and
make all three CI jobs required status checks before merging.
