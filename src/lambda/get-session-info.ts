import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import jwt from "jsonwebtoken"
import { TokenPayload } from "google-auth-library"

const corsHeaders = {
	"Access-Control-Allow-Origin": "http://localhost:3000",
	"Access-Control-Allow-Credentials": "true",
}

// Get the session token from cookie or Authorization header
const getSessionToken = (event: APIGatewayProxyEvent): string | undefined => {
	// Try cookie first
	const cookies = event.headers.Cookie || event.headers.cookie
	const cookieToken = cookies
		?.split(";")
		.find((c) => c.trim().startsWith("session="))
		?.split("=")[1]

	if (cookieToken) return cookieToken

	// Try Authorization header
	const authHeader = event.headers.Authorization || event.headers.authorization
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.split(" ")[1]
	}

	return undefined
}

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	try {
		// Get the session token from cookie or Authorization header
		const token = getSessionToken(event)

		if (!token) {
			return {
				statusCode: 401,
				headers: corsHeaders,
				body: JSON.stringify({ message: "Unauthorized" }),
			}
		}

		// Verify and decode the JWT
		// bugbug Secret key for signing the token (keep this in a secure environment variable)
		const JWT_SECRET = process.env.JWT_SECRET
		if (!JWT_SECRET) {
			throw new Error("JWT_SECRET is not configured")
		}

		const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

		// TODO: Implement actual session verification
		// For now, always return success
		return {
			statusCode: 200,
			headers: corsHeaders,
			body: JSON.stringify({
				sub: decoded.sub,
				email: decoded.email,
				name: decoded.name,
			}),
		}
	} catch (error) {
		console.error("Session verification failed:", {
			message: (error as Error).message,
			stack: (error as Error).stack,
			headers: {
				cookie: event.headers.Cookie || event.headers.cookie,
				authorization:
					event.headers.Authorization || event.headers.authorization,
			},
		})

		return {
			statusCode: 401,
			headers: corsHeaders,
			body: JSON.stringify({
				error: "Invalid session",
			}),
		}
	}
}
