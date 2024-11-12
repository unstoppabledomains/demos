import { Suggestions } from '@/types/suggestions';
import axios from 'axios';

/**
 * Fetches domain suggestions based on a search query.
 *
 * @param {string} query - The search term used to find domain suggestions.
 * @returns {Promise<Suggestions>} - A promise that resolves to a `Suggestions` object containing domain suggestions.
 * @throws {Error} - If an error occurs during the request, throws an error with details.
 */
export const fetchSuggestions = async (query: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/domains?query=${query}`;
    const res = await axios.get(url);

    return res.data as Suggestions;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error('Error fetching domains: ', err);
    }
  }
  
}