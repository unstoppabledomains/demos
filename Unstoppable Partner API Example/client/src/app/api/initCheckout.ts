import axios from 'axios';

/**
 * Initializes the checkout process for a specific domain.
 *
 * @param {string} domain - The domain name being checked out.
 * @param {string} walletAddress - The wallet address for the domain transfer.
 * @param {boolean} payment - The payment status; `true` if payment is confirmed.
 * @param {string} operationId - The unique ID for the checkout operation.
 * @returns {Promise<any>} - A promise that resolves to the server response on checkout initiation.
 * @throws {Error} - If an error occurs during the request, throws an error with details.
 */
export const initCheckout = async (domain: string, walletAddress: string, payment: boolean, operationId: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/checkout/${domain}`;
    const res = await axios.post(url, 
      {
        wallet: walletAddress,
        payment: payment,
        operationId: operationId,
      }
    );

    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error('Error processing checkout: ', err);
    }
  }
  
}