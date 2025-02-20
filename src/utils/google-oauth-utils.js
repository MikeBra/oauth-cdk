"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = exports.validateIdToken = exports.getAuthUrl = exports.createOAuthClient = void 0;
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../config");
const createOAuthClient = () => {
    return new google_auth_library_1.OAuth2Client({
        clientId: config_1.config.googleClientId,
        clientSecret: config_1.config.googleClientSecret,
        redirectUri: config_1.config.redirectUri,
    });
};
exports.createOAuthClient = createOAuthClient;
const getAuthUrl = (state) => {
    const client = (0, exports.createOAuthClient)();
    return client.generateAuthUrl({
        access_type: "offline",
        scope: config_1.config.scopes,
        state,
        prompt: "consent",
    });
};
exports.getAuthUrl = getAuthUrl;
const validateIdToken = async (idToken) => {
    const client = (0, exports.createOAuthClient)();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: config_1.config.googleClientId,
    });
    return ticket.getPayload();
};
exports.validateIdToken = validateIdToken;
const getTokens = async (code) => {
    const client = (0, exports.createOAuthClient)();
    const { tokens } = await client.getToken(code);
    return { tokens };
};
exports.getTokens = getTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlLW9hdXRoLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ29vZ2xlLW9hdXRoLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUFrRDtBQUNsRCxzQ0FBa0M7QUFFM0IsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7SUFDckMsT0FBTyxJQUFJLGtDQUFZLENBQUM7UUFDdkIsUUFBUSxFQUFFLGVBQU0sQ0FBQyxjQUFjO1FBQy9CLFlBQVksRUFBRSxlQUFNLENBQUMsa0JBQWtCO1FBQ3ZDLFdBQVcsRUFBRSxlQUFNLENBQUMsV0FBVztLQUMvQixDQUFDLENBQUE7QUFDSCxDQUFDLENBQUE7QUFOWSxRQUFBLGlCQUFpQixxQkFNN0I7QUFFTSxNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQWMsRUFBRSxFQUFFO0lBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUEseUJBQWlCLEdBQUUsQ0FBQTtJQUNsQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDN0IsV0FBVyxFQUFFLFNBQVM7UUFDdEIsS0FBSyxFQUFFLGVBQU0sQ0FBQyxNQUFNO1FBQ3BCLEtBQUs7UUFDTCxNQUFNLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUE7QUFDSCxDQUFDLENBQUE7QUFSWSxRQUFBLFVBQVUsY0FRdEI7QUFFTSxNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDeEQsTUFBTSxNQUFNLEdBQUcsSUFBQSx5QkFBaUIsR0FBRSxDQUFBO0lBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUN6QyxPQUFPO1FBQ1AsUUFBUSxFQUFFLGVBQU0sQ0FBQyxjQUFjO0tBQy9CLENBQUMsQ0FBQTtJQUNGLE9BQU8sTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFBO0FBQzNCLENBQUMsQ0FBQTtBQVBZLFFBQUEsZUFBZSxtQkFPM0I7QUFFTSxNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUUsSUFBWSxFQUFFLEVBQUU7SUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBQSx5QkFBaUIsR0FBRSxDQUFBO0lBQ2xDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDOUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFBO0FBQ2xCLENBQUMsQ0FBQTtBQUpZLFFBQUEsU0FBUyxhQUlyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9BdXRoMkNsaWVudCB9IGZyb20gXCJnb29nbGUtYXV0aC1saWJyYXJ5XCJcbmltcG9ydCB7IGNvbmZpZyB9IGZyb20gXCIuLi9jb25maWdcIlxuXG5leHBvcnQgY29uc3QgY3JlYXRlT0F1dGhDbGllbnQgPSAoKSA9PiB7XG5cdHJldHVybiBuZXcgT0F1dGgyQ2xpZW50KHtcblx0XHRjbGllbnRJZDogY29uZmlnLmdvb2dsZUNsaWVudElkLFxuXHRcdGNsaWVudFNlY3JldDogY29uZmlnLmdvb2dsZUNsaWVudFNlY3JldCxcblx0XHRyZWRpcmVjdFVyaTogY29uZmlnLnJlZGlyZWN0VXJpLFxuXHR9KVxufVxuXG5leHBvcnQgY29uc3QgZ2V0QXV0aFVybCA9IChzdGF0ZT86IHN0cmluZykgPT4ge1xuXHRjb25zdCBjbGllbnQgPSBjcmVhdGVPQXV0aENsaWVudCgpXG5cdHJldHVybiBjbGllbnQuZ2VuZXJhdGVBdXRoVXJsKHtcblx0XHRhY2Nlc3NfdHlwZTogXCJvZmZsaW5lXCIsXG5cdFx0c2NvcGU6IGNvbmZpZy5zY29wZXMsXG5cdFx0c3RhdGUsXG5cdFx0cHJvbXB0OiBcImNvbnNlbnRcIixcblx0fSlcbn1cblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlSWRUb2tlbiA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcblx0Y29uc3QgY2xpZW50ID0gY3JlYXRlT0F1dGhDbGllbnQoKVxuXHRjb25zdCB0aWNrZXQgPSBhd2FpdCBjbGllbnQudmVyaWZ5SWRUb2tlbih7XG5cdFx0aWRUb2tlbixcblx0XHRhdWRpZW5jZTogY29uZmlnLmdvb2dsZUNsaWVudElkLFxuXHR9KVxuXHRyZXR1cm4gdGlja2V0LmdldFBheWxvYWQoKVxufVxuXG5leHBvcnQgY29uc3QgZ2V0VG9rZW5zID0gYXN5bmMgKGNvZGU6IHN0cmluZykgPT4ge1xuXHRjb25zdCBjbGllbnQgPSBjcmVhdGVPQXV0aENsaWVudCgpXG5cdGNvbnN0IHsgdG9rZW5zIH0gPSBhd2FpdCBjbGllbnQuZ2V0VG9rZW4oY29kZSlcblx0cmV0dXJuIHsgdG9rZW5zIH1cbn1cbiJdfQ==