import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/get-session-info"
import jwt from "jsonwebtoken"

describe("get-session-info handler", () => {
	// Store original console.error
	const originalError = console.error

	beforeAll(() => {
		process.env.FRONTEND_TEST_URL = "http://localhost:3000"
		process.env.JWT_SECRET = "test_secret"
		// Mock console.error
		console.error = jest.fn()
	})

	afterAll(() => {
		// Restore original console.error
		console.error = originalError
	})

	const mockEvent = (headers = {}): APIGatewayProxyEvent => ({
		headers: {
			origin: process.env.FRONTEND_TEST_URL,
			...headers,
		},
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

	it("should return user info for valid session token", async () => {
		const mockPayload = {
			sub: "123",
			email: "test@example.com",
			name: "Test User",
		}
		const token = jwt.sign(mockPayload, process.env.JWT_SECRET!)
		const event = mockEvent({ Cookie: `session=${token}` })

		const response = await handler(event)

		expect(response.statusCode).toBe(200)
		expect(JSON.parse(response.body)).toEqual(
			expect.objectContaining({
				sub: expect.stringMatching(/.+/),
				email: expect.stringMatching(/^.+@.+\..+$/),
				name: expect.stringMatching(/.+/),
			})
		)
	})

	it("should return 401 when no cookie present", async () => {
		const event = mockEvent()
		const response = await handler(event)

		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({ message: "Unauthorized" })
	})

	it("should return 401 for invalid token", async () => {
		const event = mockEvent({ Cookie: "session=invalid_token" })
		const response = await handler(event)

		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({ error: "Invalid session" })
	})
})
