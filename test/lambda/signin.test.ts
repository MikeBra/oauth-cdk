import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/signin"

describe("signin handler", () => {
	beforeAll(() => {
		process.env.FRONTEND_TEST_URL = "http://localhost:3000"
	})

	const mockEvent = (body: any): APIGatewayProxyEvent => ({
		body: JSON.stringify(body),
		headers: {
			origin: process.env.FRONTEND_TEST_URL,
		},
		multiValueHeaders: {},
		httpMethod: "POST",
		isBase64Encoded: false,
		path: "",
		pathParameters: null,
		queryStringParameters: null,
		multiValueQueryStringParameters: null,
		stageVariables: null,
		requestContext: {} as any,
		resource: "",
	})

	it("should return success for valid credentials", async () => {
		const event = mockEvent({
			email: "test@example.com",
			password: "password123",
			headers: {
				origin: process.env.FRONTEND_TEST_URL,
			},
		})

		const response = await handler(event)

		expect(response.statusCode).toBe(200)
		expect(response.headers).toEqual(
			expect.objectContaining({
				"Access-Control-Allow-Origin": process.env.FRONTEND_TEST_URL!,
				"Access-Control-Allow-Credentials": "true",
				"Set-Cookie": expect.stringContaining("session="),
			})
		)
		expect(JSON.parse(response.body)).toEqual({
			message: "Signed in successfully",
			user: {
				id: "123",
				email: "test@example.com",
				name: "Test User",
			},
		})
	})

	it("should return 400 for null body", async () => {
		const event = mockEvent(null)
		const response = await handler(event)
		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing request body",
		})
	})

	it("should return 400 for empty object body", async () => {
		const event = mockEvent({})
		const response = await handler(event)
		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing request body",
		})
	})
})
