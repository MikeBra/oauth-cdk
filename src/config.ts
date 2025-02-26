import { SecretsManager } from "@aws-sdk/client-secrets-manager"

const secretsManager = new SecretsManager({})

export const getConfig = async () => {
	if (process.env.SECRET_ARN) {
		const { SecretString } = await secretsManager.getSecretValue({
			SecretId: process.env.SECRET_ARN,
		})

		const secrets = JSON.parse(SecretString || "{}")

		return {
			googleClientId: secrets.GOOGLE_CLIENT_ID,
			googleClientSecret: secrets.GOOGLE_CLIENT_SECRET,
			redirectUri: secrets.REDIRECT_URI,
			frontEndUrl: secrets.FRONTEND_PROD_URL,
			jwtSecret: secrets.JWT_SECRET,
			// Add additional scopes as needed
			scopes: ["openid", "profile", "email"],
		}
	}

	// Fallback to environment variables for local development
	return {
		googleClientId: process.env.GOOGLE_CLIENT_ID,
		googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
		redirectUri: process.env.REDIRECT_URI,
		frontEndUrl: process.env.FRONTEND_PROD_URL,
		jwtSecret: process.env.JWT_SECRET,
		// Add additional scopes as needed
		scopes: ["openid", "profile", "email"],
	}
}

export const config = {
	googleClientId: process.env.GOOGLE_CLIENT_ID!,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	redirectUri: process.env.REDIRECT_URI!,
	frontEndUrl: process.env.FRONTEND_PROD_URL!,
	jwtSecret: process.env.JWT_SECRET!,
	scopes: [
		"https://www.googleapis.com/auth/userinfo.profile",
		"https://www.googleapis.com/auth/userinfo.email",
	],
}
