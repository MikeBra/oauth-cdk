import * as cdk from "aws-cdk-lib"
import * as GoogleOauthCdk from "../lib/google-oauth-cdk-stack"

// example test. To run these tests, uncomment this file along with the
// example resource in lib/oauth-cdk-stack.ts
test("Empty Stack", () => {
	const app = new cdk.App()
	// WHEN
	const stack = new GoogleOauthCdk.GoogleOAuthCdkStack(app, "MyTestStack")
	// THEN
	const template = app.synth().getStackArtifact(stack.artifactId).template
	expect(template).toMatchSnapshot()
})
