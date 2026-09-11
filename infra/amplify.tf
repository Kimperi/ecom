resource "aws_amplify_app" "frontend" {
  name                        = "${local.name_prefix}-frontend"
  platform                    = "WEB"
  enable_branch_auto_deletion = true

  custom_rule {
    source = "/<*>"
    target = "/index.html"
    status = "404-200"
  }

  custom_headers = <<-EOT
    customHeaders:
      - pattern: '**/*'
        headers:
          - key: Strict-Transport-Security
            value: max-age=31536000; includeSubDomains
          - key: X-Content-Type-Options
            value: nosniff
          - key: Referrer-Policy
            value: strict-origin-when-cross-origin
          - key: Permissions-Policy
            value: camera=(), microphone=(), geolocation=()
  EOT
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "main"
  stage       = "PRODUCTION"

  enable_auto_build = false
}
