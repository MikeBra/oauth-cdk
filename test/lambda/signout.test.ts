import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/signout"

describe("signout handler", () => {
	beforeAll(() => {
		process.env.FRONTEND_TEST_URL = "http://localhost:3000"
	})

	it("should clear session cookie and return success", async () => {
		const event = {
			headers: {
				Origin: process.env.FRONTEND_TEST_URL,
			},
			body: null,
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
		} as APIGatewayProxyEvent

		const response = await handler(event)

		expect(response.statusCode).toBe(200)
		expect(response.headers).toEqual(
			expect.objectContaining({
				"Access-Control-Allow-Origin": process.env.FRONTEND_TEST_URL,
				"Access-Control-Allow-Credentials": "true",
				"Set-Cookie":
					"session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
			})
		)
		expect(JSON.parse(response.body)).toEqual({
			message: "Signed out successfully",
		})
	})
})
