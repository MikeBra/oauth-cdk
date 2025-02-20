import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { OAuth2Client } from "google-auth-library"

interface APIGatewayProxyEventWithCookies extends APIGatewayProxyEvent {
	cookies?: string[]
}

const client = new OAuth2Client({
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	redirectUri: process.env.REDIRECT_URI,
})

export const handler = async (
	event: APIGatewayProxyEventWithCookies
): Promise<APIGatewayProxyResult> => {
	try {
		const code = event.queryStringParameters?.code
		const state = event.queryStringParameters?.state

		// 1. Validate the Authorization Code
		if (!code) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Missing authorization code" }),
			}
		}

		// 2. Validate the State Parameter (CSRF Protection)
		// Retrieve the stored state from the cookie
		const cookieState = event.cookies
			?.find((cookie) => cookie.startsWith("oauth_state="))
			?.split("=")[1]

		if (!state || state !== cookieState) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Invalid or missing state parameter" }),
			}
		}

		const { tokens } = await client.getToken(code)

		// Here you might want to store the tokens in a secure location
		// like AWS Secrets Manager or pass them to another service

		return {
			statusCode: 200,
			body: JSON.stringify({
				access_token: tokens.access_token,
				id_token: tokens.id_token,
			}),
		}
	} catch (error) {
		console.error("Detailed error:", {
			message: (error as Error).message,
			response: (error as any).response?.data,
			code: (error as any).code,
			stack: (error as Error).stack,
		})

		return {
			statusCode: 401,
			body: JSON.stringify({
				error: "Invalid token",
				details: (error as Error).message,
			}),
		}
	}
}
