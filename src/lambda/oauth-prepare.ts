import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getCorsHeaders } from "../utils/cors-headers"

interface PrepareRequest {
	randomToken: string
	frontendOrigin: string
}

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const corsHeaders = getCorsHeaders(event)

	try {
		if (!event.body) {
			return {
				statusCode: 400,
				headers: corsHeaders,
				body: JSON.stringify({ error: "Missing request body" }),
			}
		}

		const { randomToken } = JSON.parse(event.body) as PrepareRequest

		if (!randomToken) {
			return {
				statusCode: 400,
				headers: corsHeaders,
				body: JSON.stringify({ error: "Missing required fields" }),
			}
		}

		const response = {
			statusCode: 200,
			headers: {
				...corsHeaders,
				"Set-Cookie": `oauth_state=${randomToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=300`,
			},
			body: JSON.stringify({ message: "OAuth state prepared" }),
		}

		return response
	} catch (error) {
		console.error("OAuth prepare error:", error)
		return {
			statusCode: 400,
			headers: corsHeaders,
			body: JSON.stringify({
				error: "Invalid request",
				details: (error as Error).message,
			}),
		}
	}
}
