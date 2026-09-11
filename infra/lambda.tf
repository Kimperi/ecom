data "archive_file" "backend" {
  type        = "zip"
  source_dir  = "${path.module}/../backend"
  output_path = "${path.root}/.terraform/ecom-backend.zip"

  excludes = [
    "tests",
    "package-lock.json",
  ]
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.lambda_functions

  name              = "/aws/lambda/${local.name_prefix}-${each.key}"
  retention_in_days = var.log_retention_days
}

locals {
  lambda_environment = {
    products = {
      PRODUCTS_TABLE_NAME = aws_dynamodb_table.products.name
    }
    reviews = {
      PRODUCTS_TABLE_NAME = aws_dynamodb_table.products.name
      REVIEWS_TABLE_NAME  = aws_dynamodb_table.reviews.name
    }
    orders = {
      PRODUCTS_TABLE_NAME       = aws_dynamodb_table.products.name
      ORDERS_TABLE_NAME         = aws_dynamodb_table.orders.name
      DELIVERY_FEE_MINOR        = tostring(var.delivery_fee_minor)
      ORDER_CURRENCY            = var.currency
      SES_SOURCE_EMAIL          = var.ses_source_email
      SELLER_NOTIFICATION_EMAIL = var.seller_notification_email
    }
  }
}

resource "aws_lambda_function" "api" {
  for_each = local.lambda_functions

  function_name = "${local.name_prefix}-${each.key}"
  description   = "Ecom ${each.key} API managed by Terraform."
  role          = aws_iam_role.lambda[each.key].arn
  handler       = each.value.handler
  runtime       = "nodejs22.x"
  architectures = ["arm64"]

  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256

  memory_size                    = 256
  timeout                        = 10
  reserved_concurrent_executions = var.lambda_reserved_concurrency

  environment {
    variables = local.lambda_environment[each.key]
  }

  tracing_config {
    mode = "PassThrough"
  }

  depends_on = [aws_iam_role_policy.lambda_runtime]
}
