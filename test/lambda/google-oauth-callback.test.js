"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_oauth_callback_1 = require("../../src/lambda/google-oauth-callback");
const googleOAuthUtils = require("../../src/utils/google-oauth-utils");
// Mock google-auth-library
jest.mock("google-auth-library", () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({
        getToken: jest.fn().mockImplementation(() => {
            return {
                tokens: {
                    id_token: "mock-id-token",
                    token_type: "Bearer",
                },
                res: null,
            };
        }),
        verifyIdToken: jest.fn().mockImplementation(({ idToken }) => {
            return {
                getPayload: () => ({
                    iss: "https://accounts.google.com",
                    aud: "test-client-id",
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    email: "test@example.com",
                    name: "Test User",
                    sub: "12345",
                }),
            };
        }),
    })),
}));
// Mock the google-oauth-utils
jest.mock("../../src/utils/google-oauth-utils");
const mockedGoogleOAuthUtils = jest.mocked(googleOAuthUtils);
describe("Google OAuth Callback Handler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should handle successful OAuth callback", async () => {
        const mockEvent = {
            queryStringParameters: {
                code: "test_auth_code",
                state: "test_state",
            },
            cookies: ["oauth_state=test_state"],
        };
        const response = await (0, google_oauth_callback_1.handler)(mockEvent);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            id_token: "mock-id-token",
        });
    });
    it("should handle missing code parameter", async () => {
        const mockEvent = {
            queryStringParameters: {},
        };
        const response = await (0, google_oauth_callback_1.handler)(mockEvent);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({
            error: "Missing authorization code",
        });
    });
    it("should handle validation error", async () => {
        // Mock getTokens first
        mockedGoogleOAuthUtils.getTokens.mockResolvedValue({
            tokens: {
                id_token: "mock-id-token",
            },
        });
        // Then mock validateIdToken to throw
        mockedGoogleOAuthUtils.validateIdToken.mockRejectedValue(new Error("Invalid token"));
        const mockEvent = {
            queryStringParameters: {
                code: "test_auth_code",
                state: "test_state",
            },
        };
        const response = await (0, google_oauth_callback_1.handler)(mockEvent);
        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body)).toEqual({
            error: "Invalid or missing state parameter",
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlLW9hdXRoLWNhbGxiYWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnb29nbGUtb2F1dGgtY2FsbGJhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGtGQUFnRTtBQUNoRSx1RUFBc0U7QUFRdEUsMkJBQTJCO0FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN2QyxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDakQsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7WUFDM0MsT0FBTztnQkFDTixNQUFNLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLGVBQWU7b0JBQ3pCLFVBQVUsRUFBRSxRQUFRO2lCQUNwQjtnQkFDRCxHQUFHLEVBQUUsSUFBSTthQUNULENBQUE7UUFDRixDQUFDLENBQUM7UUFDRixhQUFhLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO1lBQzNELE9BQU87Z0JBQ04sVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7b0JBQ2xCLEdBQUcsRUFBRSw2QkFBNkI7b0JBQ2xDLEdBQUcsRUFBRSxnQkFBZ0I7b0JBQ3JCLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7b0JBQ2xDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJO29CQUN6QyxLQUFLLEVBQUUsa0JBQWtCO29CQUN6QixJQUFJLEVBQUUsV0FBVztvQkFDakIsR0FBRyxFQUFFLE9BQU87aUJBQ1osQ0FBQzthQUNGLENBQUE7UUFDRixDQUFDLENBQUM7S0FDRixDQUFDLENBQUM7Q0FDSCxDQUFDLENBQUMsQ0FBQTtBQUVILDhCQUE4QjtBQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLENBQUE7QUFDL0MsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFFNUQsUUFBUSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtJQUM5QyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2YsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO0lBQ3JCLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLHlDQUF5QyxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3hELE1BQU0sU0FBUyxHQUE2QztZQUMzRCxxQkFBcUIsRUFBRTtnQkFDdEIsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsS0FBSyxFQUFFLFlBQVk7YUFDbkI7WUFDRCxPQUFPLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQztTQUNuQyxDQUFBO1FBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLCtCQUFPLEVBQUMsU0FBaUMsQ0FBQyxDQUFBO1FBRWpFLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QyxRQUFRLEVBQUUsZUFBZTtTQUN6QixDQUFDLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNyRCxNQUFNLFNBQVMsR0FBa0M7WUFDaEQscUJBQXFCLEVBQUUsRUFBRTtTQUN6QixDQUFBO1FBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLCtCQUFPLEVBQUMsU0FBaUMsQ0FBQyxDQUFBO1FBRWpFLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QyxLQUFLLEVBQUUsNEJBQTRCO1NBQ25DLENBQUMsQ0FBQTtJQUNILENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQy9DLHVCQUF1QjtRQUN2QixzQkFBc0IsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7WUFDbEQsTUFBTSxFQUFFO2dCQUNQLFFBQVEsRUFBRSxlQUFlO2FBQ3pCO1NBQ0QsQ0FBQyxDQUFBO1FBRUYscUNBQXFDO1FBQ3JDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FDdkQsSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQzFCLENBQUE7UUFFRCxNQUFNLFNBQVMsR0FBa0M7WUFDaEQscUJBQXFCLEVBQUU7Z0JBQ3RCLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLEtBQUssRUFBRSxZQUFZO2FBQ25CO1NBQ0QsQ0FBQTtRQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwrQkFBTyxFQUFDLFNBQWlDLENBQUMsQ0FBQTtRQUVqRSxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDekMsS0FBSyxFQUFFLG9DQUFvQztTQUMzQyxDQUFDLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNILENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQgfSBmcm9tIFwiYXdzLWxhbWJkYVwiXG5pbXBvcnQgeyBoYW5kbGVyIH0gZnJvbSBcIi4uLy4uL3NyYy9sYW1iZGEvZ29vZ2xlLW9hdXRoLWNhbGxiYWNrXCJcbmltcG9ydCAqIGFzIGdvb2dsZU9BdXRoVXRpbHMgZnJvbSBcIi4uLy4uL3NyYy91dGlscy9nb29nbGUtb2F1dGgtdXRpbHNcIlxuaW1wb3J0IHsgT0F1dGgyQ2xpZW50IH0gZnJvbSBcImdvb2dsZS1hdXRoLWxpYnJhcnlcIlxuaW1wb3J0IHsgR2F4aW9zRXJyb3IgfSBmcm9tIFwiZ2F4aW9zXCJcblxuaW50ZXJmYWNlIEFQSUdhdGV3YXlQcm94eUV2ZW50V2l0aENvb2tpZXMgZXh0ZW5kcyBBUElHYXRld2F5UHJveHlFdmVudCB7XG5cdGNvb2tpZXM/OiBzdHJpbmdbXVxufVxuXG4vLyBNb2NrIGdvb2dsZS1hdXRoLWxpYnJhcnlcbmplc3QubW9jayhcImdvb2dsZS1hdXRoLWxpYnJhcnlcIiwgKCkgPT4gKHtcblx0T0F1dGgyQ2xpZW50OiBqZXN0LmZuKCkubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+ICh7XG5cdFx0Z2V0VG9rZW46IGplc3QuZm4oKS5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dG9rZW5zOiB7XG5cdFx0XHRcdFx0aWRfdG9rZW46IFwibW9jay1pZC10b2tlblwiLFxuXHRcdFx0XHRcdHRva2VuX3R5cGU6IFwiQmVhcmVyXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlczogbnVsbCxcblx0XHRcdH1cblx0XHR9KSxcblx0XHR2ZXJpZnlJZFRva2VuOiBqZXN0LmZuKCkubW9ja0ltcGxlbWVudGF0aW9uKCh7IGlkVG9rZW4gfSkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Z2V0UGF5bG9hZDogKCkgPT4gKHtcblx0XHRcdFx0XHRpc3M6IFwiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tXCIsXG5cdFx0XHRcdFx0YXVkOiBcInRlc3QtY2xpZW50LWlkXCIsXG5cdFx0XHRcdFx0aWF0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcblx0XHRcdFx0XHRleHA6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgMzYwMCxcblx0XHRcdFx0XHRlbWFpbDogXCJ0ZXN0QGV4YW1wbGUuY29tXCIsXG5cdFx0XHRcdFx0bmFtZTogXCJUZXN0IFVzZXJcIixcblx0XHRcdFx0XHRzdWI6IFwiMTIzNDVcIixcblx0XHRcdFx0fSksXG5cdFx0XHR9XG5cdFx0fSksXG5cdH0pKSxcbn0pKVxuXG4vLyBNb2NrIHRoZSBnb29nbGUtb2F1dGgtdXRpbHNcbmplc3QubW9jayhcIi4uLy4uL3NyYy91dGlscy9nb29nbGUtb2F1dGgtdXRpbHNcIilcbmNvbnN0IG1vY2tlZEdvb2dsZU9BdXRoVXRpbHMgPSBqZXN0Lm1vY2tlZChnb29nbGVPQXV0aFV0aWxzKVxuXG5kZXNjcmliZShcIkdvb2dsZSBPQXV0aCBDYWxsYmFjayBIYW5kbGVyXCIsICgpID0+IHtcblx0YmVmb3JlRWFjaCgoKSA9PiB7XG5cdFx0amVzdC5jbGVhckFsbE1vY2tzKClcblx0fSlcblxuXHRpdChcInNob3VsZCBoYW5kbGUgc3VjY2Vzc2Z1bCBPQXV0aCBjYWxsYmFja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgbW9ja0V2ZW50OiBQYXJ0aWFsPEFQSUdhdGV3YXlQcm94eUV2ZW50V2l0aENvb2tpZXM+ID0ge1xuXHRcdFx0cXVlcnlTdHJpbmdQYXJhbWV0ZXJzOiB7XG5cdFx0XHRcdGNvZGU6IFwidGVzdF9hdXRoX2NvZGVcIixcblx0XHRcdFx0c3RhdGU6IFwidGVzdF9zdGF0ZVwiLFxuXHRcdFx0fSxcblx0XHRcdGNvb2tpZXM6IFtcIm9hdXRoX3N0YXRlPXRlc3Rfc3RhdGVcIl0sXG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBoYW5kbGVyKG1vY2tFdmVudCBhcyBBUElHYXRld2F5UHJveHlFdmVudClcblxuXHRcdGV4cGVjdChyZXNwb25zZS5zdGF0dXNDb2RlKS50b0JlKDIwMClcblx0XHRleHBlY3QoSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KSkudG9FcXVhbCh7XG5cdFx0XHRpZF90b2tlbjogXCJtb2NrLWlkLXRva2VuXCIsXG5cdFx0fSlcblx0fSlcblxuXHRpdChcInNob3VsZCBoYW5kbGUgbWlzc2luZyBjb2RlIHBhcmFtZXRlclwiLCBhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgbW9ja0V2ZW50OiBQYXJ0aWFsPEFQSUdhdGV3YXlQcm94eUV2ZW50PiA9IHtcblx0XHRcdHF1ZXJ5U3RyaW5nUGFyYW1ldGVyczoge30sXG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBoYW5kbGVyKG1vY2tFdmVudCBhcyBBUElHYXRld2F5UHJveHlFdmVudClcblxuXHRcdGV4cGVjdChyZXNwb25zZS5zdGF0dXNDb2RlKS50b0JlKDQwMClcblx0XHRleHBlY3QoSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KSkudG9FcXVhbCh7XG5cdFx0XHRlcnJvcjogXCJNaXNzaW5nIGF1dGhvcml6YXRpb24gY29kZVwiLFxuXHRcdH0pXG5cdH0pXG5cblx0aXQoXCJzaG91bGQgaGFuZGxlIHZhbGlkYXRpb24gZXJyb3JcIiwgYXN5bmMgKCkgPT4ge1xuXHRcdC8vIE1vY2sgZ2V0VG9rZW5zIGZpcnN0XG5cdFx0bW9ja2VkR29vZ2xlT0F1dGhVdGlscy5nZXRUb2tlbnMubW9ja1Jlc29sdmVkVmFsdWUoe1xuXHRcdFx0dG9rZW5zOiB7XG5cdFx0XHRcdGlkX3Rva2VuOiBcIm1vY2staWQtdG9rZW5cIixcblx0XHRcdH0sXG5cdFx0fSlcblxuXHRcdC8vIFRoZW4gbW9jayB2YWxpZGF0ZUlkVG9rZW4gdG8gdGhyb3dcblx0XHRtb2NrZWRHb29nbGVPQXV0aFV0aWxzLnZhbGlkYXRlSWRUb2tlbi5tb2NrUmVqZWN0ZWRWYWx1ZShcblx0XHRcdG5ldyBFcnJvcihcIkludmFsaWQgdG9rZW5cIilcblx0XHQpXG5cblx0XHRjb25zdCBtb2NrRXZlbnQ6IFBhcnRpYWw8QVBJR2F0ZXdheVByb3h5RXZlbnQ+ID0ge1xuXHRcdFx0cXVlcnlTdHJpbmdQYXJhbWV0ZXJzOiB7XG5cdFx0XHRcdGNvZGU6IFwidGVzdF9hdXRoX2NvZGVcIixcblx0XHRcdFx0c3RhdGU6IFwidGVzdF9zdGF0ZVwiLFxuXHRcdFx0fSxcblx0XHR9XG5cblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGhhbmRsZXIobW9ja0V2ZW50IGFzIEFQSUdhdGV3YXlQcm94eUV2ZW50KVxuXG5cdFx0ZXhwZWN0KHJlc3BvbnNlLnN0YXR1c0NvZGUpLnRvQmUoNDAxKVxuXHRcdGV4cGVjdChKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpKS50b0VxdWFsKHtcblx0XHRcdGVycm9yOiBcIkludmFsaWQgb3IgbWlzc2luZyBzdGF0ZSBwYXJhbWV0ZXJcIixcblx0XHR9KVxuXHR9KVxufSlcbiJdfQ==