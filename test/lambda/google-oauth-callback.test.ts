import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/google-oauth-callback"
import * as googleOAuthUtils from "../../src/utils/google-oauth-utils"

interface APIGatewayProxyEventWithCookies extends APIGatewayProxyEvent {
	cookies?: string[]
}

// Mock google-auth-library
jest.mock("google-auth-library", () => ({
	OAuth2Client: jest.fn().mockImplementation(() => ({
		getToken: jest.fn().mockImplementation(() => {
			return {
				tokens: {
					id_token: "mock-id-token",
					token_type: "Bearer",
				},
				res: null,
			}
		}),
		verifyIdToken: jest.fn().mockImplementation(({ idToken }) => {
			return {
				getPayload: () => ({
					iss: "https://accounts.google.com",
					aud: "test-client-id",
					iat: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + 3600,
					email: "test@example.com",
					name: "Test User",
					sub: "12345",
				}),
			}
		}),
	})),
}))

// Mock the google-oauth-utils
jest.mock("../../src/utils/google-oauth-utils")
const mockedGoogleOAuthUtils = jest.mocked(googleOAuthUtils)

describe("Google OAuth Callback Handler", () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("should handle successful OAuth callback", async () => {
		// Encode a random state and frontend origin in the state param
		const stateObj = {
			randomToken: "test_state", // TODO: Replace with a random token
			frontendOrigin: process.env.FRONTEND_TEST_URL,
		}
		const state = btoa(JSON.stringify(stateObj))

		const mockEvent: Partial<APIGatewayProxyEventWithCookies> = {
			queryStringParameters: {
				code: "test_auth_code",
				state: state,
			},
			cookies: ["oauth_state=test_state"],
		}

		const response = await handler(mockEvent as APIGatewayProxyEvent)

		expect(response.statusCode).toBe(302)
		// Convert both URLs to URL objects to normalize slashes and compare
		const locationUrl = new URL(response.headers?.Location as string)

		expect(response.headers?.Location).toEqual(stateObj.frontendOrigin)
	})

	it("should handle missing code parameter", async () => {
		const mockEvent: Partial<APIGatewayProxyEvent> = {
			queryStringParameters: {},
			headers: {
				origin: process.env.FRONTEND_TEST_URL,
			},
		}

		const response = await handler(mockEvent as APIGatewayProxyEvent)

		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing authorization code",
		})
	})

	it("should handle validation error", async () => {
		// Simulate Cross-Site Request Forgery (CSRF) attack where an
		// attacher is calling our callback. The call should fail because
		// they won't be able to guess or random state value that we defined
		// when we initiated the authentication request.
		const mockEvent: Partial<APIGatewayProxyEventWithCookies> = {
			queryStringParameters: {
				code: "test_auth_code",
				state: "invalid_state",
			},
			headers: {
				origin: process.env.FRONTEND_TEST_URL,
			},
			cookies: ["oauth_state=test_state"],
		}

		const response = await handler(mockEvent as APIGatewayProxyEvent)

		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({
			error: "Invalid or missing state parameter",
		})
	})
})
