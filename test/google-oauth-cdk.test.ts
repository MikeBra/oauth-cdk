import * as cdk from "aws-cdk-lib"
import * as GoogleOauthCdk from "../lib/google-oauth-cdk-stack"

describe("GoogleOAuthCdkStack", () => {
	test("creates API Gateway with OAuth endpoints", () => {
		const app = new cdk.App()
		const stack = new GoogleOauthCdk.GoogleOAuthCdkStack(
			app,
			"GoogleOAuthCdkStack"
		)
		const template = app.synth().getStackArtifact(stack.artifactId).template

		// Find Lambda functions by type
		const lambdaFunctions = Object.values(template.Resources).filter(
			(resource: any) => resource.Type === "AWS::Lambda::Function"
		)

		// Test that resources are created
		expect(
			lambdaFunctions.some(
				(fn: any) =>
					fn.Properties.Handler === "index.handler" &&
					fn.Properties.Runtime === "nodejs18.x"
			)
		).toBeTruthy()

		// Test that outputs are created
		expect(template.Outputs).toHaveProperty("ApiUrl")
	})
})
