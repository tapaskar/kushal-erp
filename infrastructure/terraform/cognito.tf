# IAM Role for Cognito to send SMS via SNS
resource "aws_iam_role" "cognito_sms" {
  name = "${local.name_prefix}-cognito-sms"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cognito-idp.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = "${local.name_prefix}-cognito-external"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "cognito_sms" {
  name = "${local.name_prefix}-cognito-sms-policy"
  role = aws_iam_role.cognito_sms.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "sns:Publish"
        Resource = "*"
      }
    ]
  })
}

# Cognito User Pool (Phone OTP authentication)
resource "aws_cognito_user_pool" "main" {
  name = local.name_prefix

  # Phone number as primary sign-in
  username_attributes      = ["phone_number"]
  auto_verified_attributes = ["phone_number"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = false
  }

  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 10
      max_length = 15
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 100
    }
  }

  # SMS configuration required for phone_number auto-verification
  sms_configuration {
    sns_caller_arn = aws_iam_role.cognito_sms.arn
    external_id    = "${local.name_prefix}-cognito-external"
  }

  sms_authentication_message = "Your RWA ERP login code is {####}"

  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 1
    }
  }

  tags = { Name = "${local.name_prefix}-user-pool" }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "app" {
  name         = "${local.name_prefix}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
  ]

  generate_secret = false

  # Token validity
  access_token_validity  = 1  # 1 hour
  id_token_validity      = 1  # 1 hour
  refresh_token_validity = 30 # 30 days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}
