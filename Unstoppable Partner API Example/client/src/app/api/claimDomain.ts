import axios from 'axios';
import { DomainSuggestion } from '../../types/suggestions';
import { Order } from '@/types/orders';

/**
 * Attempts to claim a specific domain.
 *
 * @param {DomainSuggestion} selectedDomain - The domain to claim, specified by a `DomainSuggestion` object.
 * @returns {Promise<Order>} - A promise that resolves to an `Order` object if the domain is successfully claimed.
 * @throws {Error} - If an error occurs during the request, throws an error with details.
 */
export const claimDomain = async (selectedDomain: DomainSuggestion) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`;
    const res = await axios.post(url, 
      {
        domainId: selectedDomain.name,
      }
    );

    return res.data as Order;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error('Error registering domain(s): ', err);
    }
  }
  
}