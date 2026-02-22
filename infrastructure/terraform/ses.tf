# SES Email Identity (domain or email verification)
resource "aws_ses_email_identity" "main" {
  email = var.ses_from_email
}
