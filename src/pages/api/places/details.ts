import { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_MAPS_API_KEY = "AIzaSyDs1k3FSDwY7F-TMMY50SS2BWxpkxB2GEY";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { place_id } = req.query;

    if (!place_id || typeof place_id !== 'string') {
      return res.status(400).json({ message: 'place_id parameter is required' });
    }

    const params = new URLSearchParams({
      place_id,
      key: GOOGLE_MAPS_API_KEY,
      fields: 'geometry,formatted_address,name'
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
