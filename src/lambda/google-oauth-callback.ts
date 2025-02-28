import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { OAuth2Client, TokenPayload } from "google-auth-library"
import { generateSessionToken } from "../utils/generateJWTSessionToken"
import { extractCookieValue } from "../utils/cookie-utils"

interface APIGatewayProxyEventWithCookies extends APIGatewayProxyEvent {
	cookies?: string[]
}

const client = new OAuth2Client({
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	redirectUri: process.env.REDIRECT_URI,
})

/**
 * Handles the OAuth 2.0 callback from Google
 *
 * Flow:
 * 1. Validates the authorization code from Google
 * 2. Verifies state parameter to prevent CSRF attacks
 * 3. Exchanges code for Google tokens
 * 4. Verifies ID token and extracts user info
 * 5. Creates a session token (JWT)
 * 6. Sets secure cookie and redirects to frontend
 *
 * @param event - API Gateway event with optional cookies
 * @returns Redirect response with session cookie
 */
export const handler = async (
	event: APIGatewayProxyEventWithCookies
): Promise<APIGatewayProxyResult> => {
	try {
		const code = event.queryStringParameters?.code

		// 1. Validate the Authorization Code
		if (!code) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Missing authorization code" }),
			}
		}

		// 2. Validate the State Parameter (CSRF Protection)
		// state param is base64 encoded JSON both a random token and the frontend origin
		const state = event.queryStringParameters?.state
		if (!state) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Missing state parameter" }),
			}
		}

		let stateObj
		try {
			stateObj = JSON.parse(Buffer.from(state, "base64").toString())
			if (!stateObj?.randomToken || !stateObj?.frontendOrigin)
				return {
					statusCode: 401,
					body: JSON.stringify({
						error: "Decoded state but missing required fields",
					}),
				}
		} catch (error) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "State was not encoded correctly" }),
			}
		}
		const { randomToken, frontendOrigin } = stateObj

		// Extract the oauth_state cookie using the utility function
		const cookieState = extractCookieValue(event, "oauth_state")

		if (!randomToken || randomToken !== cookieState) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					error: "CSRF attack detected",
					randomToken: randomToken,
					cookieState: cookieState,
				}),
			}
		}

		// 3. Get the tokens
		const { tokens } = await client.getToken(code)
		if (!tokens.id_token) {
			throw new Error("No ID token received from Google")
		}

		// 4. Verify the ID token and get the payload
		const loginTicket = await client.verifyIdToken({
			idToken: tokens.id_token,
			audience: process.env.GOOGLE_CLIENT_ID,
		})
		if (!loginTicket) {
			throw new Error("Invalid ID token")
		}
		const tokenPayload = loginTicket.getPayload()
		if (!tokenPayload) {
			throw new Error("Invalid token payload")
		}

		// Generate a secure session token (e.g., JWT or a secure cookie)
		const sessionToken = generateSessionToken(tokenPayload)

		// Redirect back to the frontend with a session cookie.
		// Also, clear the oauth_state cookie to prevent it from being used again.
		// Todo: Add this line to the Set-Cookie header: `oauth_state=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`,
		const response = {
			statusCode: 302,
			headers: {
				"Set-Cookie": `session=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
				Location: frontendOrigin,
			},
			body: "", // Required by API Gateway
		}

		return response
	} catch (error) {
		console.error("Detailed error:", {
			message: (error as Error).message,
			response: (error as any).response?.data,
			code: (error as any).code,
			stack: (error as Error).stack,
		})

		const errorResponse = {
			statusCode: 401,
			body: JSON.stringify({
				error: "Invalid token",
				details: (error as Error).message,
			}),
		}
		console.log("OAuth callback error response:", errorResponse)
		return errorResponse
	}
}
