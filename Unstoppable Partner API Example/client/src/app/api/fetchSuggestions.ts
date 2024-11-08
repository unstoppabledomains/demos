import axios from 'axios';

export const fetchSuggestions = async (query: String) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/domains?query=${query}`;
    const res = await axios.get(url);

    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
        throw new Error('Error fetching domains: ', err);
      }
  }
  
}