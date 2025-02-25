import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import jwt from "jsonwebtoken"

const corsHeaders = {
	"Access-Control-Allow-Origin": "http://localhost:3000",
	"Access-Control-Allow-Credentials": "true",
}

interface SignInRequest {
	email: string
	password: string
}

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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

		// TODO: Validate credentials against DynamoDB
		// Stubbed response for now
		const mockUser = {
			id: "123",
			email,
			name: "Test User",
		}

		const JWT_SECRET = process.env.JWT_SECRET
		if (!JWT_SECRET) {
			throw new Error("JWT_SECRET is not configured")
		}

		const sessionToken = jwt.sign(
			{
				sub: mockUser.id,
				email: mockUser.email,
				name: mockUser.name,
			},
			JWT_SECRET,
			{
				expiresIn: "1h",
			}
		)

		return {
			statusCode: 200,
			headers: {
				...corsHeaders,
				"Set-Cookie": `session=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
			},
			body: JSON.stringify({
				message: "Signed in successfully",
				user: mockUser,
			}),
		}
	} catch (error) {
		console.error("Signin error:", error)
		return {
			statusCode: 401,
			headers: corsHeaders,
			body: JSON.stringify({
				error: "Invalid credentials",
			}),
		}
	}
}
