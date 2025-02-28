/**
 * Extracts a specific cookie value from an API Gateway event
 * @param event The API Gateway event containing headers and/or cookies
 * @param cookieName The name of the cookie to extract
 * @returns The cookie value if found, undefined otherwise
 */
export const extractCookieValue = (
	event: {
		headers?: { [key: string]: string | undefined }
		cookies?: string[]
	},
	cookieName: string
): string | undefined => {
	// First try the cookies array if available
	if (event.cookies?.length) {
		const cookie = event.cookies.find((c) => c.startsWith(`${cookieName}=`))
		if (cookie) {
			return cookie.split("=")[1]
		}
	}

	// Fallback to parsing the Cookie header
	const cookieHeader = event.headers?.cookie || event.headers?.Cookie
	if (cookieHeader) {
		const cookies = cookieHeader.split(";")
		const targetCookie = cookies.find((c) =>
			c.trim().startsWith(`${cookieName}=`)
		)
		return targetCookie?.split("=")[1]?.trim()
	}

	return undefined
}
