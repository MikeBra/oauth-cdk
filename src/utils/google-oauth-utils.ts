import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

export const createOAuthClient = () => {
  return new OAuth2Client({
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
    redirectUri: config.redirectUri,
  });
};

export const getAuthUrl = (state?: string) => {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: config.scopes,
    state,
    prompt: 'consent',
  });
};

export const validateIdToken = async (idToken: string) => {
  const client = createOAuthClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });
  return ticket.getPayload();
};