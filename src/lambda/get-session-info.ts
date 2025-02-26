import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import jwt from "jsonwebtoken"
import { getCorsHeaders } from "../utils/cors-headers"

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const corsHeaders = getCorsHeaders(event)

	try {
		const cookies = event.headers.Cookie || event.headers.cookie
		if (!cookies) {
			return {
				statusCode: 401,
				headers: corsHeaders,
				body: JSON.stringify({ message: "Unauthorized" }),
			}
		}

		const sessionCookie = cookies
			.split(";")
			.find((cookie) => cookie.trim().startsWith("session="))
		if (!sessionCookie) {
			return {
				statusCode: 401,
				headers: corsHeaders,
				body: JSON.stringify({ message: "Unauthorized" }),
			}
		}

		const token = sessionCookie.split("=")[1]
		const JWT_SECRET = process.env.JWT_SECRET
		if (!JWT_SECRET) {
			throw new Error("JWT_SECRET is not configured")
		}

		const payload = jwt.verify(token, JWT_SECRET)
		return {
			statusCode: 200,
			headers: corsHeaders,
			body: JSON.stringify(payload),
		}
	} catch (error) {
		console.error("Session validation error:", error)
		return {
			statusCode: 401,
			headers: corsHeaders,
			body: JSON.stringify({ error: "Invalid session" }),
		}
	}
}
