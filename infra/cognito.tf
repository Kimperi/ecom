resource "aws_cognito_user_pool" "main" {
  name                = "${local.name_prefix}-users"
  username_attributes = ["email"]
  auto_verified_attributes = [
    "email",
  ]
  mfa_configuration   = "OFF"
  deletion_protection = "INACTIVE"

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 3
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your ecom verification code"
    email_message        = "Your verification code is {####}."
  }

  schema {
    attribute_data_type = "String"
    mutable             = true
    name                = "email"
    required            = true

    string_attribute_constraints {
      max_length = "254"
      min_length = "3"
    }
  }

  schema {
    attribute_data_type = "String"
    mutable             = true
    name                = "name"
    required            = false

    string_attribute_constraints {
      max_length = "100"
      min_length = "1"
    }
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.name_prefix}-web"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret                               = false
  prevent_user_existence_errors                 = "ENABLED"
  enable_token_revocation                       = true
  explicit_auth_flows                           = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
  supported_identity_providers                  = ["COGNITO"]
  access_token_validity                         = 60
  id_token_validity                             = 60
  refresh_token_validity                        = 30
  auth_session_validity                         = 3
  enable_propagate_additional_user_context_data = false

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  read_attributes  = ["email", "email_verified", "name"]
  write_attributes = ["email", "name"]
}

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Administrators allowed to manage the product catalog."
  precedence   = 1
}
