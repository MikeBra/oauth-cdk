import { handler } from "../../src/lambda/google-get-user-info"
import { APIGatewayProxyEvent } from "aws-lambda"
import { OAuth2Client } from "google-auth-library"

// Mock google-auth-library
jest.mock("google-auth-library", () => ({
	OAuth2Client: jest.fn().mockImplementation(() => ({
		verifyIdToken: jest.fn().mockImplementation(({ idToken }) => {
			if (idToken === "invalid-token") {
				throw new Error("Invalid token")
			}
			return {
				getPayload: () => ({
					email: "test@example.com",
					name: "Test User",
					sub: "12345",
					locale: "en",
					exp: 1713859200,
					picture: "http://localhost:3000/picture.jpg",
				}),
			}
		}),
	})),
}))

const createMockEvent = (): APIGatewayProxyEvent => ({
	queryStringParameters: {},
	body: null,
	headers: {},
	multiValueHeaders: {},
	httpMethod: "GET",
	isBase64Encoded: false,
	path: "/user-info",
	pathParameters: null,
	multiValueQueryStringParameters: null,
	stageVariables: null,
	requestContext: {} as any,
	resource: "",
})

describe("google-get-user-info handler", () => {
	it("should return 401 if authorization header is missing", async () => {
		// Don't add authorization header
		const event = createMockEvent()
		const response = await handler(event)
		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({
			error: "No valid authorization header",
		})
	})

	it("should return 401 if authorization header doesn't start with Bearer", async () => {
		const event = createMockEvent()
		event.headers = {
			Authorization: "Basic some-token",
		}
		const response = await handler(event)
		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({
			error: "No valid authorization header",
		})
	})

	it("should return 401 for invalid token", async () => {
		const event = createMockEvent()
		event.headers = {
			Authorization: "Bearer invalid-token",
		}

		const response = await handler(event)
		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({
			error: "Invalid token",
		})
	})

	it("should return user info for valid token", async () => {
		const event = createMockEvent()
		event.headers = {
			Authorization: "Bearer valid-token",
		}

		const response = await handler(event)
		expect(response.statusCode).toBe(200)
		expect(JSON.parse(response.body)).toEqual({
			email: "test@example.com",
			name: "Test User",
			sub: "12345",
			locale: "en",
			exp: 1713859200,
			picture: "http://localhost:3000/picture.jpg",
		})
	})
})
