import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// POST /api/livepeer/create-stream
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.body;
  const apiKey = process.env.LIVEPEER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'LIVEPEER_API_KEY not set in environment' });
  }

  try {
    const response = await axios.post(
      'https://livepeer.studio/api/stream',
      {
        name: name || 'My Live Stream',
        profiles: [
          { name: '720p', bitrate: 2000000, fps: 30, width: 1280, height: 720 },
          { name: '480p', bitrate: 1000000, fps: 30, width: 854, height: 480 },
          { name: '360p', bitrate: 500000, fps: 30, width: 640, height: 360 },
        ],
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
