import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/get-session-info"
import jwt from "jsonwebtoken"

describe("get-session-info handler", () => {
	const mockJwtSecret = "test_secret"
	process.env.JWT_SECRET = mockJwtSecret

	// Suppress expected error logging
	const originalError = console.error
	beforeAll(() => {
		console.error = jest.fn()
	})
	afterAll(() => {
		console.error = originalError
	})

	it("should return user info for valid session token", async () => {
		const mockPayload = {
			sub: "123",
			email: "test@example.com",
			name: "Test User",
		}
		const token = jwt.sign(mockPayload, mockJwtSecret)
		const mockEvent = (headers = {}): APIGatewayProxyEvent => ({
			headers,
			body: null,
			multiValueHeaders: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			pathParameters: null,
			queryStringParameters: null,
			multiValueQueryStringParameters: null,
			stageVariables: null,
			requestContext: {} as any,
			resource: "",
		})
		const event = mockEvent({ Cookie: `session=${token}` })

		const response = await handler(event)

		expect(response.statusCode).toBe(200)
		expect(JSON.parse(response.body)).toEqual(mockPayload)
	})

	it("should return 401 when no cookie present", async () => {
		const mockEvent = (headers = {}): APIGatewayProxyEvent => ({
			headers,
			body: null,
			multiValueHeaders: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			pathParameters: null,
			queryStringParameters: null,
			multiValueQueryStringParameters: null,
			stageVariables: null,
			requestContext: {} as any,
			resource: "",
		})
		const event = mockEvent()

		const response = await handler(event)

		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({ message: "Unauthorized" })
	})

	it("should return 401 for invalid token", async () => {
		const mockEvent = (headers = {}): APIGatewayProxyEvent => ({
			headers,
			body: null,
			multiValueHeaders: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			pathParameters: null,
			queryStringParameters: null,
			multiValueQueryStringParameters: null,
			stageVariables: null,
			requestContext: {} as any,
			resource: "",
		})
		const event = mockEvent({ Cookie: "session=invalid_token" })

		const response = await handler(event)

		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({ error: "Invalid session" })
	})
})
