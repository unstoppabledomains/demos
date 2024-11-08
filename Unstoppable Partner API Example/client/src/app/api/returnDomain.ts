import axios from 'axios';

export const returnDomain = async (domain: String) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/return/${domain}`;
    const res = await axios.delete(url);

    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
        throw new Error('Error returning domain: ', err);
      }
  }
  
}