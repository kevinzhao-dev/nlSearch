import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// This is a basic example of how to handle API requests from the frontend
// In a real implementation, this would use a proper gRPC-web client

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, maxResults, albumId } = req.body;

    // In a real implementation, this would make a gRPC call to the backend
    // For now, we'll return mock data
    
    // Simulated backend response delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response
    const mockResults = Array.from({ length: Math.min(maxResults || 10, 20) }, (_, i) => ({
      mediaId: `mock-${i}`,
      score: 1.0 - (i * 0.05),
      mediaType: i % 3 === 0 ? 'video/mp4' : 'image/jpeg',
      url: `https://picsum.photos/id/${(i * 17) % 100}/800/600`,
      thumbnailUrl: `https://picsum.photos/id/${(i * 17) % 100}/400/300`,
      metadata: JSON.stringify({
        fileName: `sample-${i}.${i % 3 === 0 ? 'mp4' : 'jpg'}`,
        uploadDate: new Date().toISOString(),
        tags: ['sample', 'demo', i % 2 === 0 ? 'nature' : 'architecture']
      })
    }));
    
    res.status(200).json({
      results: mockResults,
      totalResults: mockResults.length,
      truncated: false
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}