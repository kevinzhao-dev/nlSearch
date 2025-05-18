import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure this is a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real implementation, this would make a gRPC call to the backend
    // For now, we'll return mock data
    
    // Simulated backend response delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock response
    const mockInfo = {
      version: '0.1.0',
      totalMediaCount: 42,
      albums: [
        {
          id: 'album-1',
          name: 'Vacation Photos',
          mediaCount: 24
        },
        {
          id: 'album-2',
          name: 'Work Projects',
          mediaCount: 13
        },
        {
          id: 'album-3',
          name: 'Nature',
          mediaCount: 5
        }
      ],
      supportedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime'
      ]
    };
    
    res.status(200).json(mockInfo);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}