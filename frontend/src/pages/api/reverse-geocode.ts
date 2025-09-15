/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next'
import { reverseGeocode } from '@/utils/geocodingHelper';

type ResponseData = {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * API handler for reverse geocoding
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { point, boundaryCircleRadius, size, sources, layers } = req.body;

    // Validate required parameters
    if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request: point with lat and lon is required' 
      });
    }

    // Call the reverse geocoding function
    const result = await reverseGeocode({
      point,
      boundaryCircleRadius,
      size,
      sources,
      layers
    });

    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        data: result.data 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: result.error || 'Reverse geocoding failed'
      });
    }
  } catch (error: any) {
    console.error('Error in reverse geocoding API:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error'
    });
  }
}