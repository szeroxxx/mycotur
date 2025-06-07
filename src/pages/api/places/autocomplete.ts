import { NextApiRequest, NextApiResponse } from "next";

const GOOGLE_MAPS_API_KEY = "AIzaSyDs1k3FSDwY7F-TMMY50SS2BWxpkxB2GEY";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Input parameter is required" });
    }
    const params = new URLSearchParams({
      input,
      key: GOOGLE_MAPS_API_KEY,
      components: "country:es",
      location: "40.5,-5.0", // Center of Ávila region
      radius: "50000", // 50km radius
      strictbounds: "true",
      language: "es",
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Places autocomplete error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
