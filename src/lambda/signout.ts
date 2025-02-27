import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getCorsHeaders } from "../utils/cors-headers"

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const corsHeaders = getCorsHeaders(event)

	const response = {
		statusCode: 200,
		headers: {
			...corsHeaders,
			"Set-Cookie":
				"session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
		},
		body: JSON.stringify({ message: "Signed out successfully" }),
	}
	console.log("Signout response:", {
		statusCode: response.statusCode,
		headers: response.headers,
		body: JSON.parse(response.body),
	})
	return response
}
