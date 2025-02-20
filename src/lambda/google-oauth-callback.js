"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});
const handler = async (event) => {
    try {
        const code = event.queryStringParameters?.code;
        const state = event.queryStringParameters?.state;
        // 1. Validate the Authorization Code
        if (!code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing authorization code" }),
            };
        }
        // 2. Validate the State Parameter (CSRF Protection)
        // Retrieve the stored state from the cookie
        const cookieState = event.cookies
            ?.find((cookie) => cookie.startsWith("oauth_state="))
            ?.split("=")[1];
        console.log("cookieState", cookieState);
        console.log("state", state);
        if (!state || state !== cookieState) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Invalid or missing state parameter" }),
            };
        }
        const { tokens } = await client.getToken(code);
        // Here you might want to store the tokens in a secure location
        // like AWS Secrets Manager or pass them to another service
        return {
            statusCode: 200,
            body: JSON.stringify({
                access_token: tokens.access_token,
                id_token: tokens.id_token,
            }),
        };
    }
    catch (error) {
        console.error("Detailed error:", {
            message: error.message,
            response: error.response?.data,
            code: error.code,
            stack: error.stack,
        });
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: "Invalid token",
                details: error.message,
            }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlLW9hdXRoLWNhbGxiYWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ29vZ2xlLW9hdXRoLWNhbGxiYWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDZEQUFrRDtBQU1sRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGtDQUFZLENBQUM7SUFDL0IsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCO0lBQ3RDLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQjtJQUM5QyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO0NBQ3JDLENBQUMsQ0FBQTtBQUVLLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFDM0IsS0FBc0MsRUFDTCxFQUFFO0lBQ25DLElBQUksQ0FBQztRQUNKLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUE7UUFDOUMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQTtRQUVoRCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1gsT0FBTztnQkFDTixVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxDQUFDO2FBQzdELENBQUE7UUFDRixDQUFDO1FBRUQsb0RBQW9EO1FBQ3BELDRDQUE0QztRQUM1QyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTztZQUNoQyxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyRCxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUVoQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUUzQixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxPQUFPO2dCQUNOLFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLG9DQUFvQyxFQUFFLENBQUM7YUFDckUsQ0FBQTtRQUNGLENBQUM7UUFFRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRTlDLCtEQUErRDtRQUMvRCwyREFBMkQ7UUFFM0QsT0FBTztZQUNOLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3BCLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtnQkFDakMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO2FBQ3pCLENBQUM7U0FDRixDQUFBO0lBQ0YsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtZQUNoQyxPQUFPLEVBQUcsS0FBZSxDQUFDLE9BQU87WUFDakMsUUFBUSxFQUFHLEtBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSTtZQUN2QyxJQUFJLEVBQUcsS0FBYSxDQUFDLElBQUk7WUFDekIsS0FBSyxFQUFHLEtBQWUsQ0FBQyxLQUFLO1NBQzdCLENBQUMsQ0FBQTtRQUVGLE9BQU87WUFDTixVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNwQixLQUFLLEVBQUUsZUFBZTtnQkFDdEIsT0FBTyxFQUFHLEtBQWUsQ0FBQyxPQUFPO2FBQ2pDLENBQUM7U0FDRixDQUFBO0lBQ0YsQ0FBQztBQUNGLENBQUMsQ0FBQTtBQTNEWSxRQUFBLE9BQU8sV0EyRG5CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gXCJhd3MtbGFtYmRhXCJcbmltcG9ydCB7IE9BdXRoMkNsaWVudCB9IGZyb20gXCJnb29nbGUtYXV0aC1saWJyYXJ5XCJcblxuaW50ZXJmYWNlIEFQSUdhdGV3YXlQcm94eUV2ZW50V2l0aENvb2tpZXMgZXh0ZW5kcyBBUElHYXRld2F5UHJveHlFdmVudCB7XG5cdGNvb2tpZXM/OiBzdHJpbmdbXVxufVxuXG5jb25zdCBjbGllbnQgPSBuZXcgT0F1dGgyQ2xpZW50KHtcblx0Y2xpZW50SWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQsXG5cdGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQsXG5cdHJlZGlyZWN0VXJpOiBwcm9jZXNzLmVudi5SRURJUkVDVF9VUkksXG59KVxuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChcblx0ZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50V2l0aENvb2tpZXNcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG5cdHRyeSB7XG5cdFx0Y29uc3QgY29kZSA9IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycz8uY29kZVxuXHRcdGNvbnN0IHN0YXRlID0gZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5zdGF0ZVxuXG5cdFx0Ly8gMS4gVmFsaWRhdGUgdGhlIEF1dGhvcml6YXRpb24gQ29kZVxuXHRcdGlmICghY29kZSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c3RhdHVzQ29kZTogNDAwLFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIk1pc3NpbmcgYXV0aG9yaXphdGlvbiBjb2RlXCIgfSksXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gMi4gVmFsaWRhdGUgdGhlIFN0YXRlIFBhcmFtZXRlciAoQ1NSRiBQcm90ZWN0aW9uKVxuXHRcdC8vIFJldHJpZXZlIHRoZSBzdG9yZWQgc3RhdGUgZnJvbSB0aGUgY29va2llXG5cdFx0Y29uc3QgY29va2llU3RhdGUgPSBldmVudC5jb29raWVzXG5cdFx0XHQ/LmZpbmQoKGNvb2tpZSkgPT4gY29va2llLnN0YXJ0c1dpdGgoXCJvYXV0aF9zdGF0ZT1cIikpXG5cdFx0XHQ/LnNwbGl0KFwiPVwiKVsxXVxuXG5cdFx0Y29uc29sZS5sb2coXCJjb29raWVTdGF0ZVwiLCBjb29raWVTdGF0ZSlcblx0XHRjb25zb2xlLmxvZyhcInN0YXRlXCIsIHN0YXRlKVxuXG5cdFx0aWYgKCFzdGF0ZSB8fCBzdGF0ZSAhPT0gY29va2llU3RhdGUpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHN0YXR1c0NvZGU6IDQwMSxcblx0XHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJJbnZhbGlkIG9yIG1pc3Npbmcgc3RhdGUgcGFyYW1ldGVyXCIgfSksXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgeyB0b2tlbnMgfSA9IGF3YWl0IGNsaWVudC5nZXRUb2tlbihjb2RlKVxuXG5cdFx0Ly8gSGVyZSB5b3UgbWlnaHQgd2FudCB0byBzdG9yZSB0aGUgdG9rZW5zIGluIGEgc2VjdXJlIGxvY2F0aW9uXG5cdFx0Ly8gbGlrZSBBV1MgU2VjcmV0cyBNYW5hZ2VyIG9yIHBhc3MgdGhlbSB0byBhbm90aGVyIHNlcnZpY2VcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXNDb2RlOiAyMDAsXG5cdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdGFjY2Vzc190b2tlbjogdG9rZW5zLmFjY2Vzc190b2tlbixcblx0XHRcdFx0aWRfdG9rZW46IHRva2Vucy5pZF90b2tlbixcblx0XHRcdH0pLFxuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRjb25zb2xlLmVycm9yKFwiRGV0YWlsZWQgZXJyb3I6XCIsIHtcblx0XHRcdG1lc3NhZ2U6IChlcnJvciBhcyBFcnJvcikubWVzc2FnZSxcblx0XHRcdHJlc3BvbnNlOiAoZXJyb3IgYXMgYW55KS5yZXNwb25zZT8uZGF0YSxcblx0XHRcdGNvZGU6IChlcnJvciBhcyBhbnkpLmNvZGUsXG5cdFx0XHRzdGFjazogKGVycm9yIGFzIEVycm9yKS5zdGFjayxcblx0XHR9KVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXR1c0NvZGU6IDQwMSxcblx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0ZXJyb3I6IFwiSW52YWxpZCB0b2tlblwiLFxuXHRcdFx0XHRkZXRhaWxzOiAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UsXG5cdFx0XHR9KSxcblx0XHR9XG5cdH1cbn1cbiJdfQ==