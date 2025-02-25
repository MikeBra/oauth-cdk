import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as path from "path"

export class GoogleOAuthCdkStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		// OAuth Callback Lambda
		const oauthCallbackLambda = new nodejs.NodejsFunction(
			this,
			"OAuthCallbackHandler",
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				entry: path.join(__dirname, "../src/lambda/google-oauth-callback.ts"),
				handler: "handler",
				environment: {
					GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
					GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
					REDIRECT_URI: process.env.REDIRECT_URI!,
					FRONTEND_URL: process.env.FRONTEND_URL!,
					JWT_SECRET: process.env.JWT_SECRET!,
				},
				bundling: {
					forceDockerBundling: true,
					minify: true,
					sourceMap: true,
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
			},
			bundling: {
				forceDockerBundling: true,
				minify: true,
				sourceMap: true,
			},
		})

		// API Gateway
		const api = new apigateway.RestApi(this, "GoogleOAuthApi", {
			restApiName: "Google OAuth API",
		})

		// OAuth callback endpoint
		const oauth = api.root.addResource("oauth")
		const callback = oauth.addResource("callback")
		callback.addMethod(
			"GET",
			new apigateway.LambdaIntegration(oauthCallbackLambda)
		)

		// Add session info endpoint
		const auth = api.root.addResource("auth")
		const session = auth.addResource("session")

		// First: Add CORS preflight
		session.addCorsPreflight({
			allowOrigins: ["http://localhost:3000"],
			allowMethods: ["GET", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			allowCredentials: true,
			exposeHeaders: ["Set-Cookie"],
		})

		// Then: Add the method
		session.addMethod(
			"GET",
			new apigateway.LambdaIntegration(getSessionInfoFunction),
			{
				authorizationType: apigateway.AuthorizationType.NONE,
			}
		)

		// Add signout endpoint
		const signout = auth.addResource("signout")

		// First: CORS
		signout.addCorsPreflight({
			allowOrigins: ["http://localhost:3000"],
			allowMethods: ["POST", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			allowCredentials: true,
		})

		// Then: Method
		signout.addMethod(
			"POST",
			new apigateway.LambdaIntegration(signoutFunction)
		)

		// Add signin endpoint
		const signin = auth.addResource("signin")

		// Add CORS preflight
		signin.addCorsPreflight({
			allowOrigins: ["http://localhost:3000"],
			allowMethods: ["POST", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			allowCredentials: true,
		})

		// Add method
		signin.addMethod(
			"POST",
			new apigateway.LambdaIntegration(signinFunction),
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
