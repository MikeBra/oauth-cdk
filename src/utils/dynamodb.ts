import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

const client = new DynamoDBClient({})
export const dynamodb = DynamoDBDocumentClient.from(client)

export const TABLE_NAME = process.env.TABLE_NAME!

// User-related constants
export const USER_PREFIX = "USER#"
export const USER_TYPE = "USER"

// Create user item for DynamoDB
export const createUserItem = (
	userId: string,
	email: string,
	hashedPassword: string,
	name: string
) => {
	const now = new Date().toISOString()
	return {
		PK: `${USER_PREFIX}${userId}`,
		SK: USER_TYPE,
		id: userId,
		email,
		hashedPassword,
		name,
		GSI1PK: `${USER_TYPE}`,
		GSI1SK: now,
		email_index: email, // For the email GSI
		createdAt: now,
		updatedAt: now,
	}
}
