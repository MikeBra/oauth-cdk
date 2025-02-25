import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

const corsHeaders = {
	"Access-Control-Allow-Origin": "http://localhost:3000",
	"Access-Control-Allow-Credentials": "true",
}

export const handler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	return {
		statusCode: 200,
		headers: {
			...corsHeaders,
			"Set-Cookie":
				"session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
		},
		body: JSON.stringify({ message: "Signed out successfully" }),
	}
}
