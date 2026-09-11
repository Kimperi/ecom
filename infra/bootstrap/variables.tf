variable "aws_region" {
  description = "AWS region that stores the Terraform state."
  type        = string
  default     = "eu-west-3"
}

variable "aws_profile" {
  description = "Optional local AWS CLI profile. CI should use OIDC instead."
  type        = string
  default     = null
  nullable    = true
}

variable "state_bucket_prefix" {
  description = "Prefix for the globally unique state bucket name."
  type        = string
  default     = "kimperi-ecom-tfstate"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{2,40}$", var.state_bucket_prefix))
    error_message = "Use 3-41 lowercase letters, numbers, or hyphens."
  }
}
