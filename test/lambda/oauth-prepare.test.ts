import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/oauth-prepare"

describe("oauth-prepare handler", () => {
	beforeAll(() => {
		process.env.FRONTEND_TEST_URL = "http://localhost:3000"
	})

	const mockEvent = (body?: any): APIGatewayProxyEvent => ({
		body: body === null ? null : JSON.stringify(body),
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

	it("should set oauth state cookie", async () => {
		const event = mockEvent({
			randomToken: "test_random_token",
		})

		const response = await handler(event)

		expect(response.statusCode).toBe(200)
		expect(response.headers).toEqual(
			expect.objectContaining({
				"Access-Control-Allow-Origin": process.env.FRONTEND_TEST_URL,
				"Access-Control-Allow-Credentials": "true",
				"Set-Cookie": expect.stringContaining("oauth_state=test_random_token"),
			})
		)
		expect(JSON.parse(response.body)).toEqual({
			message: "OAuth state prepared",
		})
	})

	it("should handle missing body", async () => {
		const event = {
			...mockEvent(null),
			body: null,
		}

		const response = await handler(event)

		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing request body",
		})
	})

	it("should handle missing required fields", async () => {
		const event = mockEvent({})

		const response = await handler(event)

		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing required fields",
		})
	})
})
