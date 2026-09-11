locals {
  frontend_parameters = {
    api_base_url          = aws_apigatewayv2_api.main.api_endpoint
    cognito_user_pool_id  = aws_cognito_user_pool.main.id
    cognito_app_client_id = aws_cognito_user_pool_client.web.id
    amplify_app_id        = aws_amplify_app.frontend.id
    amplify_branch_name   = aws_amplify_branch.main.branch_name
    products_lambda_name  = aws_lambda_function.api["products"].function_name
    reviews_lambda_name   = aws_lambda_function.api["reviews"].function_name
    orders_lambda_name    = aws_lambda_function.api["orders"].function_name
  }
}

resource "aws_ssm_parameter" "frontend" {
  for_each = local.frontend_parameters

  name  = "/${local.name_prefix}/frontend/${each.key}"
  type  = "String"
  value = each.value
}
