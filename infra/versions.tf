terraform {
  required_version = ">= 1.10.0"

  backend "s3" {
    key          = "ecom/dev/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = merge(var.additional_tags, local.common_tags)
  }
}
