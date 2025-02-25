import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/signout"

describe("signout handler", () => {
	it("should clear session cookie and return success", async () => {
		const event = {} as APIGatewayProxyEvent

		const response = await handler(event)

		expect(response.statusCode).toBe(200)
		expect(response.headers).toEqual(
			expect.objectContaining({
				"Access-Control-Allow-Origin": "http://localhost:3000",
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
