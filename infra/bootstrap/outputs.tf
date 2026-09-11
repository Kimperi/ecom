output "state_bucket_name" {
  description = "S3 bucket to pass to the main Terraform backend configuration."
  value       = aws_s3_bucket.terraform_state.id
}

output "state_kms_key_arn" {
  description = "KMS key ARN to pass to the main Terraform backend configuration."
  value       = aws_kms_key.terraform_state.arn
}

output "backend_configuration" {
  description = "Non-sensitive values for infra/backend.hcl."
  value = {
    bucket       = aws_s3_bucket.terraform_state.id
    region       = var.aws_region
    key          = "ecom/dev/terraform.tfstate"
    encrypt      = true
    kms_key_id   = aws_kms_key.terraform_state.arn
    use_lockfile = true
  }
}
