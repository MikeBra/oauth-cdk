"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdToken = exports.getAuthUrl = exports.createOAuthClient = void 0;
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
        access_type: 'offline',
        scope: config_1.config.scopes,
        state,
        prompt: 'consent',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlLW9hdXRoLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ29vZ2xlLW9hdXRoLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZEQUFtRDtBQUNuRCxzQ0FBbUM7QUFFNUIsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7SUFDcEMsT0FBTyxJQUFJLGtDQUFZLENBQUM7UUFDdEIsUUFBUSxFQUFFLGVBQU0sQ0FBQyxjQUFjO1FBQy9CLFlBQVksRUFBRSxlQUFNLENBQUMsa0JBQWtCO1FBQ3ZDLFdBQVcsRUFBRSxlQUFNLENBQUMsV0FBVztLQUNoQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFOVyxRQUFBLGlCQUFpQixxQkFNNUI7QUFFSyxNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQWMsRUFBRSxFQUFFO0lBQzNDLE1BQU0sTUFBTSxHQUFHLElBQUEseUJBQWlCLEdBQUUsQ0FBQztJQUNuQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDNUIsV0FBVyxFQUFFLFNBQVM7UUFDdEIsS0FBSyxFQUFFLGVBQU0sQ0FBQyxNQUFNO1FBQ3BCLEtBQUs7UUFDTCxNQUFNLEVBQUUsU0FBUztLQUNsQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFSVyxRQUFBLFVBQVUsY0FRckI7QUFFSyxNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDdkQsTUFBTSxNQUFNLEdBQUcsSUFBQSx5QkFBaUIsR0FBRSxDQUFDO0lBQ25DLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUN4QyxPQUFPO1FBQ1AsUUFBUSxFQUFFLGVBQU0sQ0FBQyxjQUFjO0tBQ2hDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzdCLENBQUMsQ0FBQztBQVBXLFFBQUEsZUFBZSxtQkFPMUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPQXV0aDJDbGllbnQgfSBmcm9tICdnb29nbGUtYXV0aC1saWJyYXJ5JztcbmltcG9ydCB7IGNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVPQXV0aENsaWVudCA9ICgpID0+IHtcbiAgcmV0dXJuIG5ldyBPQXV0aDJDbGllbnQoe1xuICAgIGNsaWVudElkOiBjb25maWcuZ29vZ2xlQ2xpZW50SWQsXG4gICAgY2xpZW50U2VjcmV0OiBjb25maWcuZ29vZ2xlQ2xpZW50U2VjcmV0LFxuICAgIHJlZGlyZWN0VXJpOiBjb25maWcucmVkaXJlY3RVcmksXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEF1dGhVcmwgPSAoc3RhdGU/OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgY2xpZW50ID0gY3JlYXRlT0F1dGhDbGllbnQoKTtcbiAgcmV0dXJuIGNsaWVudC5nZW5lcmF0ZUF1dGhVcmwoe1xuICAgIGFjY2Vzc190eXBlOiAnb2ZmbGluZScsXG4gICAgc2NvcGU6IGNvbmZpZy5zY29wZXMsXG4gICAgc3RhdGUsXG4gICAgcHJvbXB0OiAnY29uc2VudCcsXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlSWRUb2tlbiA9IGFzeW5jIChpZFRva2VuOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgY2xpZW50ID0gY3JlYXRlT0F1dGhDbGllbnQoKTtcbiAgY29uc3QgdGlja2V0ID0gYXdhaXQgY2xpZW50LnZlcmlmeUlkVG9rZW4oe1xuICAgIGlkVG9rZW4sXG4gICAgYXVkaWVuY2U6IGNvbmZpZy5nb29nbGVDbGllbnRJZCxcbiAgfSk7XG4gIHJldHVybiB0aWNrZXQuZ2V0UGF5bG9hZCgpO1xufTsiXX0=