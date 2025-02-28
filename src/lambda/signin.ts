import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import jwt from "jsonwebtoken"
import { getCorsHeaders } from "../utils/cors-headers"
import bcrypt from "bcrypt"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"
import { dynamodb, TABLE_NAME } from "../utils/dynamodb"

interface SignInRequest {
	email: string
	password: string
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

		const parsedBody = JSON.parse(event.body)
		if (!parsedBody || Object.keys(parsedBody).length === 0) {
			return {
				statusCode: 400,
				headers: corsHeaders,
				body: JSON.stringify({ error: "Missing request body" }),
			}
		}

		const { email, password } = parsedBody as SignInRequest

		if (!email || !password) {
			return {
				statusCode: 400,
				headers: corsHeaders,
				body: JSON.stringify({ error: "Missing required fields" }),
			}
		}

		// Query DynamoDB for user by email
		const userResult = await dynamodb.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				IndexName: "EmailIndex",
				KeyConditionExpression: "email = :email",
				ExpressionAttributeValues: {
					":email": email,
				},
			})
		)

		if (!userResult.Items || userResult.Items.length === 0) {
			return {
				statusCode: 401,
				headers: corsHeaders,
				body: JSON.stringify({ error: "Invalid credentials" }),
			}
		}

		const user = userResult.Items[0]

		// Compare the password
		const isValidPassword = await bcrypt.compare(password, user.hashedPassword)

		if (!isValidPassword) {
			return {
				statusCode: 401,
				headers: corsHeaders,
				body: JSON.stringify({ error: "Invalid credentials" }),
			}
		}

		const JWT_SECRET = process.env.JWT_SECRET
		if (!JWT_SECRET) {
			throw new Error("JWT_SECRET is not configured")
		}

		const sessionToken = jwt.sign(
			{
				sub: user.id,
				email: user.email,
				name: user.name,
			},
			JWT_SECRET,
			{
				expiresIn: "1h",
			}
		)

		// Remove sensitive data before sending response
		const { hashedPassword, ...safeUserData } = user

		return {
			statusCode: 200,
			headers: {
				...corsHeaders,
				"Set-Cookie": `session=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
			},
			body: JSON.stringify({
				message: "Signed in successfully",
				user: safeUserData,
			}),
		}
	} catch (error) {
		console.error("Signin error:", error)
		return {
			statusCode: 500,
			headers: corsHeaders,
			body: JSON.stringify({
				error: "Authentication failed",
			}),
		}
	}
}
