import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// GET /api/livepeer/list-streams
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.LIVEPEER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'LIVEPEER_API_KEY not set in environment' });
  }

  try {
    const response = await axios.get('https://livepeer.studio/api/stream', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data || error.message });
  }
}
