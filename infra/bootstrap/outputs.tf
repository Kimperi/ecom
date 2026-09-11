output "state_bucket_name" {
  description = "S3 bucket to pass to the main Terraform backend configuration."
  value       = aws_s3_bucket.terraform_state.id
}

output "backend_configuration" {
  description = "Non-sensitive values for infra/backend.hcl."
  value = {
    bucket       = aws_s3_bucket.terraform_state.id
    region       = var.aws_region
    key          = "ecom/dev/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}
