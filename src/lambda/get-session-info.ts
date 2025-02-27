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
			const response = {
				statusCode: 401,
				headers: corsHeaders,
				body: JSON.stringify({ message: "Unauthorized" }),
			}
			console.log("Session info response:", response)
			return response
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
		const response = {
			statusCode: 200,
			headers: corsHeaders,
			body: JSON.stringify(payload),
		}
		console.log("Session info successful response:", {
			statusCode: response.statusCode,
			headers: response.headers,
			body: JSON.parse(response.body),
		})
		return response
	} catch (error) {
		console.error("Session validation error:", error)
		const response = {
			statusCode: 401,
			headers: corsHeaders,
			body: JSON.stringify({ error: "Invalid session" }),
		}
		console.log("Session info error response:", response)
		return response
	}
}
