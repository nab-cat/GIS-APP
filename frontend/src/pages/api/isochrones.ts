/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

type ErrorResponse = {
    error: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const apiKey = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;
        if (!apiKey) {
            throw new Error("OpenRoute API key not configured");
        }

        const {
            profile = "driving-car",
            locations,
            range,
            range_type,
            attributes,
            intersections,
            location_type,
            smoothing,
            area_units,
            options
        } = req.body;

        // Validate required parameters
        if (!locations || !Array.isArray(locations) || !range || !Array.isArray(range)) {
            return res.status(400).json({ error: "Missing required parameters: locations and range" });
        }

        // Build a clean request body with only the parameters OpenRoute accepts
        const requestBody: any = {
            locations,
            range,
            range_type: range_type || 'time',
        };

        // Add optional parameters if they exist
        if (attributes && attributes.length > 0) {
            requestBody.attributes = attributes;
            
            // Only add area_units if attributes includes "area"
            if (attributes.includes("area") && area_units) {
                requestBody.area_units = area_units;
            }
        }
        
        // Convert boolean intersections to string
        if (typeof intersections === 'boolean') {
            requestBody.intersections = intersections.toString();
        } else if (typeof intersections === 'string') {
            requestBody.intersections = intersections;
        }
        
        if (location_type) requestBody.location_type = location_type;
        if (smoothing) requestBody.smoothing = smoothing;
        // Removed units parameter as it causes API errors
        if (options) requestBody.options = options;

        console.log("Sending request to OpenRoute:", JSON.stringify(requestBody));

        // Make the request to OpenRoute Service
        const response = await fetch(
            `https://api.openrouteservice.org/v2/isochrones/${profile}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": apiKey
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            let errorMessage = `OpenRoute Service error: ${response.status} ${response.statusText}`;
            let errorDetails = null;
            
            try {
                // Try to parse as JSON first
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    console.error("OpenRoute API error:", JSON.stringify(errorData));
                    errorDetails = errorData;
                    
                    if (errorData.error && errorData.error.message) {
                        errorMessage = `OpenRoute Service error: ${errorData.error.message}`;
                        if (errorData.error.code) {
                            errorMessage += ` (Code: ${errorData.error.code})`;
                        }
                    }
                } else {
                    // If not JSON, get as text
                    const errorText = await response.text();
                    console.error("OpenRoute API error (text):", errorText);
                }
            } catch (err) {
                console.error("Error parsing error response:", err);
            }
            
            return res.status(response.status).json({
                error: errorMessage,
                details: errorDetails
            });
        }

        const data = await response.json();
        console.log("OpenRoute API success response:", JSON.stringify(data).substring(0, 200) + "...");
        return res.status(200).json(data);

    } catch (error: any) {
        console.error("Isochrones API error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}