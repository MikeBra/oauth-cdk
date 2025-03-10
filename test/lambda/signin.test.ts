import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/signin"
import bcrypt from "bcrypt"
import { dynamodb } from "../../src/utils/dynamodb"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"

jest.mock("bcrypt", () => ({
	compare: jest.fn().mockResolvedValue(true),
}))

jest.mock("../../src/utils/dynamodb", () => ({
	dynamodb: {
		send: jest.fn().mockImplementation((command) => {
			if (command instanceof QueryCommand) {
				const now = new Date().toISOString()
				return Promise.resolve({
					Items: [
						{
							PK: "USER#123",
							SK: "USER",
							id: "123",
							email: "test@example.com",
							name: "Test User",
							hashedPassword: "hashed_password_mock",
							GSI1PK: "USER",
							GSI1SK: now,
							email_index: "test@example.com",
							createdAt: now,
							updatedAt: now,
						},
					],
				})
			}
			return Promise.resolve({})
		}),
	},
	TABLE_NAME: "test-table",
}))

describe("signin handler", () => {
	beforeAll(() => {
		process.env.FRONTEND_TEST_URL = "http://localhost:3000"
		process.env.JWT_SECRET = "test_secret"
	})

	beforeEach(() => {
		jest.clearAllMocks()
	})

	const mockEvent = (body?: any): APIGatewayProxyEvent => ({
		body: body === null ? null : JSON.stringify(body),
		headers: {
			origin: process.env.FRONTEND_TEST_URL,
		},
		multiValueHeaders: {},
		httpMethod: "POST",
		isBase64Encoded: false,
		path: "",
		pathParameters: null,
		queryStringParameters: null,
		multiValueQueryStringParameters: null,
		stageVariables: null,
		requestContext: {} as any,
		resource: "",
	})

	it("should return success for valid credentials", async () => {
		const event = mockEvent({
			email: "test@example.com",
			password: "password123",
		})

		const response = await handler(event)
		const body = JSON.parse(response.body)

		expect(response.statusCode).toBe(200)
		expect(bcrypt.compare).toHaveBeenCalledWith(
			"password123",
			"hashed_password_mock"
		)
		expect(dynamodb.send).toHaveBeenCalledTimes(1)

		const queryCall = (dynamodb.send as jest.Mock).mock.calls[0][0]
		expect(queryCall).toBeInstanceOf(QueryCommand)
		expect(queryCall.input).toEqual({
			TableName: "test-table",
			IndexName: "EmailIndex",
			KeyConditionExpression: "email = :email",
			ExpressionAttributeValues: {
				":email": "test@example.com",
			},
		})

		expect(response.headers).toEqual(
			expect.objectContaining({
				"Access-Control-Allow-Origin": process.env.FRONTEND_TEST_URL!,
				"Access-Control-Allow-Credentials": "true",
				"Set-Cookie": expect.stringContaining("session="),
			})
		)

		// Verify response structure
		expect(body).toHaveProperty("message", "Signed in successfully")
		expect(body).toHaveProperty("user")

		// Verify user object
		const user = body.user
		expect(user).toHaveProperty("PK", "USER#123")
		expect(user).toHaveProperty("SK", "USER")
		expect(user).toHaveProperty("id", "123")
		expect(user).toHaveProperty("email", "test@example.com")
		expect(user).toHaveProperty("name", "Test User")
		expect(user).toHaveProperty("GSI1PK", "USER")
		expect(user).toHaveProperty("GSI1SK")
		expect(typeof user.GSI1SK).toBe("string")
		expect(user).toHaveProperty("email_index", "test@example.com")
		expect(user).toHaveProperty("createdAt")
		expect(typeof user.createdAt).toBe("string")
		expect(user).toHaveProperty("updatedAt")
		expect(typeof user.updatedAt).toBe("string")

		// Verify sensitive data is not included
		expect(user).not.toHaveProperty("hashedPassword")
	})

	it("should return 401 for non-existent user", async () => {
		;(dynamodb.send as jest.Mock).mockResolvedValueOnce({ Items: [] })
		const event = mockEvent({
			email: "nonexistent@example.com",
			password: "password123",
		})

		const response = await handler(event)
		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({
			error: "Invalid credentials",
		})
	})

	it("should return 401 for invalid password", async () => {
		;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(false)
		const event = mockEvent({
			email: "test@example.com",
			password: "wrongpassword",
		})

		const response = await handler(event)
		expect(response.statusCode).toBe(401)
		expect(JSON.parse(response.body)).toEqual({
			error: "Invalid credentials",
		})
	})

	it("should return 400 for null body", async () => {
		const event = mockEvent(null)
		const response = await handler(event)
		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing request body",
		})
	})

	it("should return 400 for empty object body", async () => {
		const event = mockEvent({})
		const response = await handler(event)
		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing request body",
		})
	})

	it("should return 400 for missing required fields", async () => {
		const event = mockEvent({
			email: "test@example.com",
			// missing password
		})

		const response = await handler(event)
		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing required fields",
		})
	})
})
