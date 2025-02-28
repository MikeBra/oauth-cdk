import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as path from "path"

export class GoogleOAuthCdkStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		// DynamoDB Table
		const table = new dynamodb.Table(this, "AuthTable", {
			partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
			sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
		})

		// Add GSI1 index
		table.addGlobalSecondaryIndex({
			indexName: "GSI1",
			partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
			sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
			projectionType: dynamodb.ProjectionType.ALL,
		})

		// Add email index for user lookup
		table.addGlobalSecondaryIndex({
			indexName: "EmailIndex",
			partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
			projectionType: dynamodb.ProjectionType.ALL,
		})

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
				TABLE_NAME: table.tableName!,
			},
			bundling: {
				forceDockerBundling: true,
				minify: true,
				sourceMap: true,
				nodeModules: ["bcrypt"],
				commandHooks: {
					beforeBundling(inputDir: string, outputDir: string): string[] {
						return []
					},
					beforeInstall(inputDir: string, outputDir: string): string[] {
						return []
					},
					afterBundling(inputDir: string, outputDir: string): string[] {
						return [
							`cd ${outputDir}`,
							"npm rebuild bcrypt --build-from-source",
						]
					},
				},
			},
		})

		// Grant signin function access to the table
		table.grantReadWriteData(signinFunction)

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

		// Add register Lambda
		const registerFunction = new nodejs.NodejsFunction(
			this,
			"RegisterFunction",
			{
				runtime: lambda.Runtime.NODEJS_18_X,
				entry: path.join(__dirname, "../src/lambda/register.ts"),
				handler: "handler",
				environment: {
					FRONTEND_PROD_URL: process.env.FRONTEND_PROD_URL!,
					FRONTEND_TEST_URL: process.env.FRONTEND_TEST_URL!,
					TABLE_NAME: table.tableName!,
				},
				bundling: {
					forceDockerBundling: true,
					minify: true,
					sourceMap: true,
					nodeModules: ["bcrypt"],
					commandHooks: {
						beforeBundling(inputDir: string, outputDir: string): string[] {
							return []
						},
						beforeInstall(inputDir: string, outputDir: string): string[] {
							return []
						},
						afterBundling(inputDir: string, outputDir: string): string[] {
							return [
								`cd ${outputDir}`,
								"npm rebuild bcrypt --build-from-source",
							]
						},
					},
				},
			}
		)

		// Grant register function access to the table
		table.grantReadWriteData(registerFunction)

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
			// Add deployment options to control logging
			deployOptions: {
				dataTraceEnabled: false,
				loggingLevel: apigateway.MethodLoggingLevel.ERROR,
				tracingEnabled: false,
			},
		})

		// Create a single request validator for the API
		const requestValidator = new apigateway.RequestValidator(
			this,
			"ApiRequestValidator",
			{
				restApi: api,
				validateRequestBody: true,
				validateRequestParameters: true,
			}
		)

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

		// Add signin endpoint with specific logging configuration
		const signin = auth.addResource("signin")
		signin.addMethod(
			"POST",
			new apigateway.LambdaIntegration(signinFunction, {
				// Configure the integration to not log request body
				passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
				requestTemplates: {
					"application/json":
						'{"body": "$util.escapeJavaScript($input.body)"}',
				},
				integrationResponses: [
					{
						statusCode: "200",
						responseTemplates: {
							"application/json": "$input.body",
						},
					},
				],
			}),
			{
				authorizationType: apigateway.AuthorizationType.NONE,
				methodResponses: [{ statusCode: "200" }],
				// Disable request logging for this sensitive endpoint
				requestParameters: {
					"method.request.header.Content-Type": true,
				},
				requestValidator: requestValidator,
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

		// Add register endpoint with specific logging configuration
		const register = auth.addResource("register")
		register.addMethod(
			"POST",
			new apigateway.LambdaIntegration(registerFunction, {
				// Configure the integration to not log request body
				passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
				requestTemplates: {
					"application/json":
						'{"body": "$util.escapeJavaScript($input.body)"}',
				},
				integrationResponses: [
					{
						statusCode: "200",
						responseTemplates: {
							"application/json": "$input.body",
						},
					},
				],
			}),
			{
				authorizationType: apigateway.AuthorizationType.NONE,
				methodResponses: [{ statusCode: "200" }],
				// Disable request logging for this sensitive endpoint
				requestParameters: {
					"method.request.header.Content-Type": true,
				},
				requestValidator: requestValidator,
			}
		)

		// Output the API URL
		new cdk.CfnOutput(this, "ApiUrl", {
			value: api.url,
			description: "API Gateway URL",
		})
	}
}
