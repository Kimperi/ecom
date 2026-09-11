resource "aws_sesv2_email_identity" "source" {
  email_identity = var.ses_source_email
}
