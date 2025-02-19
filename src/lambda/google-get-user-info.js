"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});
const handler = async (event) => {
    try {
        const authHeader = event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "No valid authorization header" }),
            };
        }
        const token = authHeader.split(" ")[1];
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return {
            statusCode: 200,
            body: JSON.stringify({
                email: payload?.email,
                name: payload?.name,
                picture: payload?.picture,
            }),
        };
    }
    catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlLWdldC11c2VyLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnb29nbGUtZ2V0LXVzZXItaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2REFBa0Q7QUFFbEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQ0FBWSxDQUFDO0lBQy9CLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtJQUN0QyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7Q0FDOUMsQ0FBQyxDQUFBO0FBRUssTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUMzQixLQUEyQixFQUNNLEVBQUU7SUFDbkMsSUFBSSxDQUFDO1FBQ0osTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUE7UUFFOUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN0RCxPQUFPO2dCQUNOLFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLCtCQUErQixFQUFFLENBQUM7YUFDaEUsQ0FBQTtRQUNGLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRXRDLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUN6QyxPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtTQUN0QyxDQUFDLENBQUE7UUFFRixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUE7UUFFbkMsT0FBTztZQUNOLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3BCLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSztnQkFDckIsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJO2dCQUNuQixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU87YUFDekIsQ0FBQztTQUNGLENBQUE7SUFDRixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM5QixPQUFPO1lBQ04sVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxDQUFDO1NBQ3hELENBQUE7SUFDRixDQUFDO0FBQ0YsQ0FBQyxDQUFBO0FBckNZLFFBQUEsT0FBTyxXQXFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSBcImF3cy1sYW1iZGFcIlxuaW1wb3J0IHsgT0F1dGgyQ2xpZW50IH0gZnJvbSBcImdvb2dsZS1hdXRoLWxpYnJhcnlcIlxuXG5jb25zdCBjbGllbnQgPSBuZXcgT0F1dGgyQ2xpZW50KHtcblx0Y2xpZW50SWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQsXG5cdGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQsXG59KVxuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChcblx0ZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuXHR0cnkge1xuXHRcdGNvbnN0IGF1dGhIZWFkZXIgPSBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb25cblxuXHRcdGlmICghYXV0aEhlYWRlciB8fCAhYXV0aEhlYWRlci5zdGFydHNXaXRoKFwiQmVhcmVyIFwiKSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c3RhdHVzQ29kZTogNDAxLFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIk5vIHZhbGlkIGF1dGhvcml6YXRpb24gaGVhZGVyXCIgfSksXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnNwbGl0KFwiIFwiKVsxXVxuXG5cdFx0Y29uc3QgdGlja2V0ID0gYXdhaXQgY2xpZW50LnZlcmlmeUlkVG9rZW4oe1xuXHRcdFx0aWRUb2tlbjogdG9rZW4sXG5cdFx0XHRhdWRpZW5jZTogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCxcblx0XHR9KVxuXG5cdFx0Y29uc3QgcGF5bG9hZCA9IHRpY2tldC5nZXRQYXlsb2FkKClcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXNDb2RlOiAyMDAsXG5cdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdGVtYWlsOiBwYXlsb2FkPy5lbWFpbCxcblx0XHRcdFx0bmFtZTogcGF5bG9hZD8ubmFtZSxcblx0XHRcdFx0cGljdHVyZTogcGF5bG9hZD8ucGljdHVyZSxcblx0XHRcdH0pLFxuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRjb25zb2xlLmVycm9yKFwiRXJyb3I6XCIsIGVycm9yKVxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXNDb2RlOiA1MDAsXG5cdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkludGVybmFsIHNlcnZlciBlcnJvclwiIH0pLFxuXHRcdH1cblx0fVxufVxuIl19