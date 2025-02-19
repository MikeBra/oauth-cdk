#!/usr/bin/env node
import "./load-env"
import * as cdk from "aws-cdk-lib"
import { GoogleOAuthCdkStack } from "../lib/google-oauth-cdk-stack"

const app = new cdk.App()
new GoogleOAuthCdkStack(app, "GoogleOAuthCdkStack", {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
})
