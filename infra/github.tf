resource "aws_iam_openid_connect_provider" "github" {
  count = var.github_oidc_provider_arn == null ? 1 : 0

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_caller_identity" "current" {}

locals {
  github_oidc_provider_arn = coalesce(
    var.github_oidc_provider_arn,
    try(aws_iam_openid_connect_provider.github[0].arn, null),
  )
  github_oidc_subject = coalesce(
    var.github_oidc_subject,
    "repo:${var.github_owner}/${var.github_repository}:ref:refs/heads/${var.github_branch}",
  )
}

data "aws_iam_policy_document" "github_deploy_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.github_oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [local.github_oidc_subject]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name                 = "${local.name_prefix}-github-deploy"
  description          = "Short-lived GitHub Actions role for application code deployments."
  assume_role_policy   = data.aws_iam_policy_document.github_deploy_assume_role.json
  max_session_duration = 3600
}

data "aws_iam_policy_document" "github_deploy" {
  statement {
    sid    = "ReadPublicBuildConfiguration"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${local.name_prefix}/frontend/*",
    ]
  }

  statement {
    sid    = "DeployLambdaCode"
    effect = "Allow"
   actions = [
  "lambda:GetFunction",
  "lambda:GetFunctionConfiguration",
  "lambda:UpdateFunctionCode",
]
    resources = [for function in aws_lambda_function.api : function.arn]
  }

  statement {
    sid    = "DeployAmplifyFrontend"
    effect = "Allow"
    actions = [
      "amplify:CreateDeployment",
      "amplify:GetJob",
      "amplify:StartDeployment",
    ]
    resources = [
      aws_amplify_app.frontend.arn,
      "${aws_amplify_app.frontend.arn}/branches/${aws_amplify_branch.main.branch_name}",
      "${aws_amplify_app.frontend.arn}/branches/${aws_amplify_branch.main.branch_name}/jobs/*",
    ]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "${local.name_prefix}-application-deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}
