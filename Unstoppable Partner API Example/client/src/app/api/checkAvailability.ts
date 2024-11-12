import axios from 'axios';
import { Domains } from '@/types/domains';

/**
 * Checks the availability of a list of domains.
 *
 * @param {string[]} domains - An array of domain names to check for availability.
 * @returns {Promise<Domains>} - A promise that resolves to a `Domains` object containing availability data for each domain.
 * @throws {Error} - If an error occurs during the request, throws an error with details.
 */
export const checkAvailability = async (domains: string[]) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/availability`;
    const res = await axios.post(url, 
      {
        domains: domains,
      }
    );

    return res.data as Domains;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error('Error domain(s) availability: ', err);
    }
  }
  
}