import { APIGatewayProxyEvent } from "aws-lambda"

export const getCorsHeaders = (event: APIGatewayProxyEvent) => {
	// Get the origin from the request
	const origin = event.headers.origin || event.headers.Origin

	// See if the frontend url is in the allowed origins
	const allowedOrigins = [
		process.env.FRONTEND_TEST_URL,
		process.env.FRONTEND_PROD_URL,
	].filter(Boolean) as string[]
	const isAllowedOrigin = allowedOrigins.includes(origin!)
	if (!isAllowedOrigin) {
		console.log("Request origin not allowed", origin)
	}

	// Set CORS headers based on origin
	return {
		"Access-Control-Allow-Origin": isAllowedOrigin
			? origin!
			: process.env.FRONTEND_PROD_URL!,
		"Access-Control-Allow-Credentials": "true",
	}
}
