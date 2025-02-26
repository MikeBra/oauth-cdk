import * as dotenv from "dotenv"
import * as path from "path"

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "..", ".env") })

// Validate required environment variables
const requiredEnvVars = [
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
	"MY_APP_DOMAIN",
	"REDIRECT_URI",
	"FRONTEND_TEST_URL",
	"FRONTEND_PROD_URL",
	"JWT_SECRET",
]

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`)
	}
}
