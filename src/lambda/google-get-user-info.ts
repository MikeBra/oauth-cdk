import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client({
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
})

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	try {
		const authHeader = event.headers.Authorization

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "No valid authorization header" }),
			}
		}

		const token = authHeader.split(" ")[1]

		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		})

		const payload = ticket.getPayload()

		return {
			statusCode: 200,
			body: JSON.stringify({
				email: payload?.email,
				name: payload?.name,
				sub: payload?.sub,
				locale: payload?.locale,
				exp: payload?.exp,
				picture: payload?.picture,
			}),
		}
	} catch (error) {
		// console.error("Error:", error)
		return {
			statusCode: 401,
			body: JSON.stringify({ error: "Invalid token" }),
		}
	}
}
