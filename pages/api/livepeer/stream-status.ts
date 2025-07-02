import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// GET /api/livepeer/stream-status?id=...
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const apiKey = process.env.LIVEPEER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'LIVEPEER_API_KEY not set in environment' });
  }
  if (!id) {
    return res.status(400).json({ error: 'Missing stream id' });
  }

  try {
    const response = await axios.get(`https://livepeer.studio/api/stream/${id}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error: any) {
    // Tambahkan log error detail ke response
    res.status(500).json({
      error: error?.response?.data || error.message,
      detail: error?.response?.data || error.toString(),
      status: error?.response?.status || null,
      headers: error?.response?.headers || null,
    });
  }
}
