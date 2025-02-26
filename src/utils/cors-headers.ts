import { APIGatewayProxyEvent } from "aws-lambda"

export const getCorsHeaders = (event: APIGatewayProxyEvent) => {
	// Get the origin from the request
	const origin = event.headers.origin || event.headers.Origin

	// Check if origin matches allowed domains
	// BUUBUG: Replace FRONTEND_PROD_URL with origin value above. Compare log from loocal test and .
	console.log("origin", origin)

	const allowedOrigins = [
		process.env.FRONTEND_TEST_URL,
		process.env.FRONTEND_PROD_URL,
	].filter(Boolean) as string[]

	// Set CORS headers based on origin
	return {
		"Access-Control-Allow-Origin": allowedOrigins.includes(origin!)
			? origin!
			: process.env.FRONTEND_PROD_URL!,
		"Access-Control-Allow-Credentials": "true",
	}
}
