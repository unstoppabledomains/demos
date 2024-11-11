import axios from 'axios';

export const transferDomain = async (domain: string, walletAddress: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transfer/${domain}`;
    const res = await axios.post(url, 
        {
            wallet: walletAddress
        }
    );

    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
        throw new Error('Error registering domain(s): ', err);
      }
  }
  
}