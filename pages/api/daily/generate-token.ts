import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// POST /api/daily/generate-token
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomName, isOwner } = req.body;
  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'DAILY_API_KEY not set in environment' });
  }
  if (!roomName) {
    return res.status(400).json({ error: 'Missing roomName' });
  }

  try {
    const response = await axios.post(
      'https://api.daily.co/v1/meeting-tokens',
      {
        properties: {
          room_name: roomName,
          is_owner: !!isOwner,
        },
      },
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
