import { Authorization, Verify } from '@/types/auth';
import axios from 'axios';

/**
 * Verifies the login credentials for a user.
 *
 * @param {Authorization} auth - The authorization object containing user credentials.
 * @param {string} clientId - The client ID associated with the login attempt.
 * @returns {Promise<Verify>} - A promise that resolves to a `Verify` object indicating whether the login was successful.
 * @throws {Error} - If an error occurs during the request, throws an error with details.
 */
export const verifyLogin = async (auth: Authorization, clientId: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify`;
    const res = await axios.post(url, 
      {
        auth: auth,
        clientId: clientId
      }
    );

    return res.data as Verify;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error('Error verifying login: ', err);
    }
  }
  
}