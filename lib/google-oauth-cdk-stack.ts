import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as path from "path"

export class GoogleOAuthCdkStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		// OAuth Callback Lambda
		const oauthCallbackFunction = new nodejs.NodejsFunction(
			this,
			"OAuthCallbackFunction",
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				entry: path.join(__dirname, "../src/lambda/google-oauth-callback.ts"),
				handler: "handler",
				bundling: {
					forceDockerBundling: true,
					minify: true,
					sourceMap: true,
				},
				environment: {
					GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
					GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
					REDIRECT_URI: process.env.REDIRECT_URI!,
					FRONTEND_PROD_URL: process.env.FRONTEND_PROD_URL!,
					FRONTEND_TEST_URL: process.env.FRONTEND_TEST_URL!,
					JWT_SECRET: process.env.JWT_SECRET!,
					MY_APP_DOMAIN: process.env.MY_APP_DOMAIN!,
				},
			}
		)

		// Session info Lambda
		const getSessionInfoFunction = new nodejs.NodejsFunction(
			this,
			"GetSessionInfoFunction",
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				entry: path.join(__dirname, "../src/lambda/get-session-info.ts"),
				handler: "handler",
				environment: {
					JWT_SECRET: process.env.JWT_SECRET!,
					FRONTEND_PROD_URL: process.env.FRONTEND_PROD_URL!,
					FRONTEND_TEST_URL: process.env.FRONTEND_TEST_URL!,
				},
				bundling: {
					forceDockerBundling: true,
					minify: true,
					sourceMap: true,
				},
			}
		)

		// Signout Lambda
		const signoutFunction = new nodejs.NodejsFunction(
			this,
			"SignoutFunction",
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				entry: path.join(__dirname, "../src/lambda/signout.ts"),
				handler: "handler",
				environment: {
					FRONTEND_PROD_URL: process.env.FRONTEND_PROD_URL!,
					FRONTEND_TEST_URL: process.env.FRONTEND_TEST_URL!,
				},
				bundling: {
					forceDockerBundling: true,
					minify: true,
					sourceMap: true,
				},
			}
		)

		// Add signin Lambda
		const signinFunction = new nodejs.NodejsFunction(this, "SigninFunction", {
			runtime: lambda.Runtime.NODEJS_18_X,
			entry: path.join(__dirname, "../src/lambda/signin.ts"),
			handler: "handler",
			environment: {
				JWT_SECRET: process.env.JWT_SECRET!,
				FRONTEND_PROD_URL: process.env.FRONTEND_PROD_URL!,
				FRONTEND_TEST_URL: process.env.FRONTEND_TEST_URL!,
			},
			bundling: {
				forceDockerBundling: true,
				minify: true,
				sourceMap: true,
			},
		})

		// Add prepare Lambda
		const oauthPrepareFunction = new nodejs.NodejsFunction(
			this,
			"OAuthPrepareFunction",
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				entry: path.join(__dirname, "../src/lambda/oauth-prepare.ts"),
				handler: "handler",
				environment: {
					FRONTEND_TEST_URL: process.env.FRONTEND_TEST_URL!,
					FRONTEND_PROD_URL: process.env.FRONTEND_PROD_URL!,
				},
				bundling: {
					forceDockerBundling: true,
					minify: true,
					sourceMap: true,
				},
			}
		)

		// API Gateway
		const api = new apigateway.RestApi(this, "GoogleOAuthApi", {
			restApiName: "Google OAuth API",
			defaultCorsPreflightOptions: {
				allowOrigins: [
					process.env.FRONTEND_TEST_URL!,
					process.env.FRONTEND_PROD_URL!,
				],
				allowMethods: apigateway.Cors.ALL_METHODS,
				allowHeaders: ["Content-Type", "Authorization", "Cookie"],
				allowCredentials: true,
				exposeHeaders: ["Set-Cookie"],
			},
		})

		// OAuth callback endpoint
		const oauth = api.root.addResource("oauth")
		const callback = oauth.addResource("callback")
		callback.addMethod(
			"GET",
			new apigateway.LambdaIntegration(oauthCallbackFunction)
		)

		// Add session info endpoint
		const auth = api.root.addResource("auth")
		const session = auth.addResource("session")
		session.addMethod(
			"GET",
			new apigateway.LambdaIntegration(getSessionInfoFunction),
			{
				authorizationType: apigateway.AuthorizationType.NONE,
			}
		)

		// Add signout endpoint
		const signout = auth.addResource("signout")
		signout.addMethod(
			"POST",
			new apigateway.LambdaIntegration(signoutFunction)
		)

		// Add signin endpoint
		const signin = auth.addResource("signin")
		signin.addMethod(
			"POST",
			new apigateway.LambdaIntegration(signinFunction),
			{
				authorizationType: apigateway.AuthorizationType.NONE,
			}
		)

		// Add prepare endpoint
		const prepare = oauth.addResource("prepare")
		prepare.addMethod(
			"POST",
			new apigateway.LambdaIntegration(oauthPrepareFunction),
			{
				authorizationType: apigateway.AuthorizationType.NONE,
			}
		)

		// Output the API URL
		new cdk.CfnOutput(this, "ApiUrl", {
			value: api.url,
			description: "API Gateway URL",
		})
	}
}
