import axios from 'axios';
import { DomainSuggestion } from '../../types/suggestions';

export const claimDomain = async (selectedDomain: DomainSuggestion) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`;
    const res = await axios.post(url, 
        {
            domainId: selectedDomain.name,
        }
    );

    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
        throw new Error('Error registering domain(s): ', err);
      }
  }
  
}