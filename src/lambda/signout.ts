import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getCorsHeaders } from "../utils/cors-headers"

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const corsHeaders = getCorsHeaders(event)

	return {
		statusCode: 200,
		headers: {
			...corsHeaders,
			"Set-Cookie":
				"session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
		},
		body: JSON.stringify({ message: "Signed out successfully" }),
	}
}
