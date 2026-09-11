locals {
  name_prefix = "ecom-${var.environment}"

  common_tags = {
    Project     = "ecom"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "portfolio"
  }

  lambda_functions = {
    products = {
      handler = "src/functions/products/handler.handler"
    }
    reviews = {
      handler = "src/functions/reviews/handler.handler"
    }
    orders = {
      handler = "src/functions/orders/handler.handler"
    }
  }
}
