import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = new IncomingForm();
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // In a real implementation, this would send the file to the gRPC backend
    // For now, we'll just return a mock response similar to text search
    
    // Extract parameters
    const maxResults = parseInt(fields.maxResults?.[0] || '10', 10);
    const albumId = fields.albumId?.[0];
    
    // Simulated backend response delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response with random results
    const mockResults = Array.from({ length: Math.min(maxResults, 15) }, (_, i) => ({
      mediaId: `mock-${i}`,
      score: 1.0 - (i * 0.05),
      mediaType: i % 3 === 0 ? 'video/mp4' : 'image/jpeg',
      url: `https://picsum.photos/id/${(i * 23) % 100}/800/600`,
      thumbnailUrl: `https://picsum.photos/id/${(i * 23) % 100}/400/300`,
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