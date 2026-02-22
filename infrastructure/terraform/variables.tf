variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project name used for resource naming"
  type        = string
  default     = "rwa-erp"
}

variable "stage" {
  description = "Deployment stage"
  type        = string
  default     = "prod"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "rwa_admin"
  sensitive   = true
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "auth_secret" {
  description = "JWT signing secret (min 32 chars)"
  type        = string
  sensitive   = true
}

variable "razorpay_key_id" {
  description = "Razorpay Key ID"
  type        = string
  default     = ""
}

variable "razorpay_key_secret" {
  description = "Razorpay Key Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "razorpay_webhook_secret" {
  description = "Razorpay Webhook Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "domain_name" {
  description = "Custom domain (optional, leave empty for CloudFront URL)"
  type        = string
  default     = ""
}

variable "ses_from_email" {
  description = "SES verified sender email"
  type        = string
  default     = "noreply@rwaerp.in"
}

locals {
  name_prefix = "${var.project}-${var.stage}"
  common_tags = {
    Project     = var.project
    Stage       = var.stage
    ManagedBy   = "terraform"
  }
}
