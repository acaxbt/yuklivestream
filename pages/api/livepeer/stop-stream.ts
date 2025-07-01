import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// POST /api/livepeer/stop-stream
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;
  const apiKey = process.env.LIVEPEER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'LIVEPEER_API_KEY not set in environment' });
  }
  if (!id) {
    return res.status(400).json({ error: 'Missing stream id' });
  }

  try {
    const response = await axios.patch(
      `https://livepeer.studio/api/stream/${id}/terminate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data || error.message });
  }
}
