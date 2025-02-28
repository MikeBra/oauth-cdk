import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getCorsHeaders } from "../utils/cors-headers"
import bcrypt from "bcrypt"
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { dynamodb, TABLE_NAME, createUserItem } from "../utils/dynamodb"
import { randomUUID } from "crypto"

interface RegisterRequest {
	email: string
	password: string
	name: string
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

		const parsedBody = JSON.parse(event.body) as RegisterRequest
		if (!parsedBody.email || !parsedBody.password || !parsedBody.name) {
			return {
				statusCode: 400,
				headers: corsHeaders,
				body: JSON.stringify({ error: "Missing required fields" }),
			}
		}

		const { email, password, name } = parsedBody

		// Check if user already exists
		const existingUser = await dynamodb.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				IndexName: "EmailIndex",
				KeyConditionExpression: "email = :email",
				ExpressionAttributeValues: {
					":email": email,
				},
			})
		)

		if (existingUser.Items && existingUser.Items.length > 0) {
			return {
				statusCode: 409,
				headers: corsHeaders,
				body: JSON.stringify({ error: "User already exists" }),
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const userId = randomUUID()

		// Create user in DynamoDB
		const userItem = createUserItem(userId, email, hashedPassword, name)
		await dynamodb.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: userItem,
			})
		)

		// Return success response without sensitive data
		const { hashedPassword: _, ...safeUserData } = userItem
		return {
			statusCode: 201,
			headers: corsHeaders,
			body: JSON.stringify({
				message: "User registered successfully",
				user: safeUserData,
			}),
		}
	} catch (error) {
		console.error("Registration error:", error)
		return {
			statusCode: 500,
			headers: corsHeaders,
			body: JSON.stringify({ error: "Failed to register user" }),
		}
	}
}
