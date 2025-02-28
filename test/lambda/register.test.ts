import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../../src/lambda/register"
import bcrypt from "bcrypt"
import { dynamodb } from "../../src/utils/dynamodb"
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb"

jest.mock("bcrypt", () => ({
	hash: jest.fn().mockResolvedValue("hashed_password_mock"),
}))

jest.mock("../../src/utils/dynamodb", () => ({
	dynamodb: {
		send: jest.fn().mockImplementation((command) => {
			if (command instanceof QueryCommand) {
				return Promise.resolve({ Items: [] }) // No existing user by default
			}
			if (command instanceof PutCommand) {
				return Promise.resolve({}) // Successful put
			}
			return Promise.resolve({})
		}),
	},
	TABLE_NAME: "test-table",
	createUserItem: jest
		.fn()
		.mockImplementation((userId, email, hashedPassword, name) => {
			const now = new Date().toISOString()
			return {
				PK: `USER#${userId}`,
				SK: "USER",
				id: userId,
				email,
				hashedPassword,
				name,
				GSI1PK: "USER",
				GSI1SK: now,
				email_index: email,
				createdAt: now,
				updatedAt: now,
			}
		}),
}))

describe("register handler", () => {
	beforeAll(() => {
		process.env.FRONTEND_TEST_URL = "http://localhost:3000"
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

	it("should register a new user successfully", async () => {
		const event = mockEvent({
			email: "test@example.com",
			password: "password123",
			name: "Test User",
		})

		const response = await handler(event)
		const body = JSON.parse(response.body)

		expect(response.statusCode).toBe(201)
		expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10)
		expect(dynamodb.send).toHaveBeenCalledTimes(2) // Once for query, once for put

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

		const putCall = (dynamodb.send as jest.Mock).mock.calls[1][0]
		expect(putCall).toBeInstanceOf(PutCommand)
		expect(putCall.input).toEqual({
			TableName: "test-table",
			Item: expect.objectContaining({
				PK: expect.stringMatching(/^USER#.+/),
				SK: "USER",
				email: "test@example.com",
				name: "Test User",
				hashedPassword: "hashed_password_mock",
				GSI1PK: "USER",
				GSI1SK: expect.any(String),
				email_index: "test@example.com",
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}),
		})

		// First verify the overall response structure
		expect(body).toHaveProperty("message", "User registered successfully")
		expect(body).toHaveProperty("user")

		// Then verify each property of the user object individually
		const user = body.user
		expect(user).toHaveProperty("PK", expect.stringMatching(/^USER#.+/))
		expect(user).toHaveProperty("SK", "USER")
		expect(user).toHaveProperty("id", expect.any(String))
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

	it("should return 409 if user already exists", async () => {
		;(dynamodb.send as jest.Mock).mockResolvedValueOnce({
			Items: [{ email: "test@example.com" }],
		})

		const event = mockEvent({
			email: "test@example.com",
			password: "password123",
			name: "Test User",
		})

		const response = await handler(event)
		expect(response.statusCode).toBe(409)
		expect(JSON.parse(response.body)).toEqual({
			error: "User already exists",
		})
	})

	it("should return 400 for missing body", async () => {
		const event = mockEvent(null)
		const response = await handler(event)

		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing request body",
		})
	})

	it("should return 400 for missing required fields", async () => {
		const event = mockEvent({
			email: "test@example.com",
			// missing password and name
		})

		const response = await handler(event)

		expect(response.statusCode).toBe(400)
		expect(JSON.parse(response.body)).toEqual({
			error: "Missing required fields",
		})
	})
})
