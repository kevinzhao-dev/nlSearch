import type { NextApiRequest, NextApiResponse } from 'next';

// Mock albums storage (in a real app, this would be in a database)
const mockAlbums = [
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
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getAlbums(req, res);
    case 'POST':
      return createAlbum(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get all albums
async function getAlbums(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Simulated backend response delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.status(200).json(mockAlbums);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create a new album
async function createAlbum(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Album name is required' });
    }
    
    // Simulated backend response delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a new mock album
    const newAlbum = {
      id: `album-${Date.now()}`,
      name: name.trim(),
      mediaCount: 0
    };
    
    // In a real implementation, this would save to a database
    // Here we'll just pretend it's been created
    
    res.status(201).json(newAlbum);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}