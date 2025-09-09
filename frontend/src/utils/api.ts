/* eslint-disable @typescript-eslint/no-explicit-any */
import { IsochroneRequestOptions } from "@/components/map/IsochroneOptions";

export async function generateIsochrones(options: IsochroneRequestOptions): Promise<any> {
    try {
        // Convert boolean intersections to string as required by ORS API
        const requestOptions = {
            ...options,
            intersections: options.intersections ? "true" : "false"
        };

        const response = await fetch('/api/isochrones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestOptions),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate isochrones');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error generating isochrones:', error);
        throw error;
    }
}