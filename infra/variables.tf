variable "aws_region" {
  description = "AWS region for the application resources."
  type        = string
  default     = "eu-west-3"
}

variable "aws_profile" {
  description = "Optional local AWS CLI profile. CI should use OIDC instead."
  type        = string
  default     = null
  nullable    = true
}

variable "environment" {
  description = "Short environment name used in resource names."
  type        = string
  default     = "dev"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,10}$", var.environment))
    error_message = "Use 2-11 lowercase letters, numbers, or hyphens."
  }
}

variable "frontend_origins" {
  description = "Exact HTTPS origins allowed by API Gateway CORS. Replace the placeholder after the first apply with the Amplify URL output."
  type        = list(string)
  default     = ["https://replace-after-first-apply.invalid"]

  validation {
    condition = alltrue([
      for origin in var.frontend_origins :
      can(regex("^https://[^/]+$", origin)) && origin != "https://*"
    ])
    error_message = "Every frontend origin must be an exact HTTPS origin without a trailing slash."
  }
}

variable "ses_source_email" {
  description = "Verified SES sender address. The value belongs in terraform.tfvars, which is ignored by Git."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", var.ses_source_email))
    error_message = "Enter a valid sender email address."
  }
}

variable "seller_notification_email" {
  description = "Address that receives order notifications. Verify it while SES is in sandbox mode."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", var.seller_notification_email))
    error_message = "Enter a valid notification email address."
  }
}

variable "delivery_fee_minor" {
  description = "Delivery fee in the currency's smallest unit; 5000 means 50.00 MAD."
  type        = number
  default     = 5000

  validation {
    condition     = var.delivery_fee_minor >= 0 && floor(var.delivery_fee_minor) == var.delivery_fee_minor
    error_message = "The delivery fee must be a non-negative integer."
  }
}

variable "currency" {
  description = "ISO-style three-letter order currency."
  type        = string
  default     = "MAD"

  validation {
    condition     = can(regex("^[A-Z]{3}$", var.currency))
    error_message = "Use a three-letter uppercase currency code."
  }
}

variable "log_retention_days" {
  description = "CloudWatch log retention for the portfolio environment."
  type        = number
  default     = 14
}

variable "lambda_reserved_concurrency" {
  description = "Per-function concurrency cap to control abuse and cost."
  type        = number
  default     = 5

  validation {
    condition     = var.lambda_reserved_concurrency >= 1
    error_message = "Reserved concurrency must be at least 1."
  }
}

variable "additional_tags" {
  description = "Optional tags added to every supported AWS resource."
  type        = map(string)
  default     = {}
}

variable "github_owner" {
  description = "GitHub repository owner trusted by the deployment role."
  type        = string
  default     = "Kimperi"
}

variable "github_repository" {
  description = "GitHub repository trusted by the deployment role."
  type        = string
  default     = "ecom"
}

variable "github_branch" {
  description = "Only this GitHub branch may assume the deployment role."
  type        = string
  default     = "main"
}

variable "github_oidc_subject" {
  description = "Optional exact GitHub OIDC subject override, including the immutable owner/repository ID format when enabled."
  type        = string
  default     = null
  nullable    = true
}

variable "github_oidc_provider_arn" {
  description = "ARN of an existing account-wide GitHub OIDC provider. Leave null to create it."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition = (
      var.github_oidc_provider_arn == null ||
      can(regex("^arn:aws:iam::[0-9]{12}:oidc-provider/token\\.actions\\.githubusercontent\\.com$", var.github_oidc_provider_arn))
    )
    error_message = "Use the ARN of the token.actions.githubusercontent.com IAM OIDC provider."
  }
}
