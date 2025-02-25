import jwt from "jsonwebtoken"
import { TokenPayload } from "google-auth-library"

// Generate a session token using JWT
export function generateSessionToken(user: TokenPayload) {
	const payload = {
		sub: user.sub, // Google's unique user ID
		email: user.email, // User email
		name: user.name, // User name (optional)
		role: "user", // Optional: Role-based access control
	}

	// bugbug Secret key for signing the token (keep this in a secure environment variable)
	const JWT_SECRET = process.env.JWT_SECRET
	if (!JWT_SECRET) {
		throw new Error("JWT_SECRET is not configured")
	}

	const token = jwt.sign(payload, JWT_SECRET, {
		expiresIn: "1h", // Token expiry (e.g., 1 hour)
		audience: "your-app", // Optional: Audience claim
		issuer: "your-backend", // Optional: Issuer claim
	})

	return token
}
