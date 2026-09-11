output "api_base_url" {
  description = "Public API Gateway base URL used by Vite."
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Public Cognito User Pool identifier used by Amplify Auth."
  value       = aws_cognito_user_pool.main.id
}

output "cognito_app_client_id" {
  description = "Public Cognito web client identifier. This client has no secret."
  value       = aws_cognito_user_pool_client.web.id
}

output "amplify_app_id" {
  description = "Amplify app identifier used by the future deployment workflow."
  value       = aws_amplify_app.frontend.id
}

output "amplify_url" {
  description = "Frontend URL. Copy this exact origin to frontend_origins and apply again."
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "lambda_function_names" {
  description = "Created Lambda function names."
  value       = { for name, function in aws_lambda_function.api : name => function.function_name }
}

output "dynamodb_table_names" {
  description = "Created DynamoDB table names."
  value = {
    products = aws_dynamodb_table.products.name
    reviews  = aws_dynamodb_table.reviews.name
    orders   = aws_dynamodb_table.orders.name
  }
}

output "frontend_ssm_parameter_prefix" {
  description = "Parameter Store prefix used later by GitHub Actions without reading Terraform state."
  value       = "/${local.name_prefix}/frontend/"
}
