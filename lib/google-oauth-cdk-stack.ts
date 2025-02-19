import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as path from "path"

export class GoogleOAuthCdkStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		// Environment variables for the Lambda functions
		const environment = {
			GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
			GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
			REDIRECT_URI: process.env.REDIRECT_URI || "",
		}

		// OAuth Callback Lambda
		const oauthCallbackLambda = new lambda.Function(
			this,
			"OAuthCallbackHandler",
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				handler: "oauth-callback.handler",
				code: lambda.Code.fromAsset(path.join(__dirname, "../src/lambda")),
				environment,
			}
		)

		// Get User Info Lambda
		const getUserInfoLambda = new lambda.Function(this, "GetUserInfoHandler", {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: "get-user-info.handler",
			code: lambda.Code.fromAsset(path.join(__dirname, "../src/lambda")),
			environment,
		})

		// API Gateway
		const api = new apigateway.RestApi(this, "GoogleOAuthApi", {
			restApiName: "Google OAuth Service",
			description: "API Gateway for Google OAuth integration",
		})

		// OAuth callback endpoint
		const oauth = api.root.addResource("oauth")
		const callback = oauth.addResource("callback")
		callback.addMethod(
			"GET",
			new apigateway.LambdaIntegration(oauthCallbackLambda)
		)

		// User info endpoint
		const userInfo = api.root.addResource("userinfo")
		userInfo.addMethod(
			"GET",
			new apigateway.LambdaIntegration(getUserInfoLambda)
		)
	}
}
