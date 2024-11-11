import { Authorization } from '@/types/auth';
import axios from 'axios';

export const verifyLogin = async (auth: Authorization, clientId: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify`;
    const res = await axios.post(url, 
        {
            auth: auth,
            clientId: clientId
        }
    );

    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
        throw new Error('Error verifying login: ', err);
      }
  }
  
}