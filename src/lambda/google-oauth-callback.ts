import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client({
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	redirectUri: process.env.REDIRECT_URI,
})

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	try {
		const code = event.queryStringParameters?.code

		if (!code) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Authorization code is required" }),
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
		console.error("Error:", error)
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal server error" }),
		}
	}
}
