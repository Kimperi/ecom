data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  for_each = local.lambda_functions

  name               = "${local.name_prefix}-${each.key}-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

locals {
  lambda_service_permissions = {
    products = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
        ]
        Resource = [aws_dynamodb_table.products.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = ["${aws_s3_bucket.media.arn}/products/*"]
      },
    ]
    reviews = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:Query", "dynamodb:PutItem"]
        Resource = [aws_dynamodb_table.reviews.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem"]
        Resource = [aws_dynamodb_table.products.arn]
      },
    ]
    orders = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:BatchGetItem"]
        Resource = [aws_dynamodb_table.products.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem"]
        Resource = [aws_dynamodb_table.orders.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail"]
        Resource = [aws_sesv2_email_identity.source.arn]
      },
    ]
  }
}

resource "aws_iam_role_policy" "lambda_runtime" {
  for_each = local.lambda_functions

  name = "${local.name_prefix}-${each.key}-runtime"
  role = aws_iam_role.lambda[each.key].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Effect = "Allow"
          Action = [
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ]
          Resource = ["${aws_cloudwatch_log_group.lambda[each.key].arn}:*"]
        },
      ],
      local.lambda_service_permissions[each.key],
    )
  })
}
