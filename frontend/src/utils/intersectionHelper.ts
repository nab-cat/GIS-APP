/* eslint-disable @typescript-eslint/no-explicit-any */
import * as martinez from 'martinez-polygon-clipping';

export interface IntersectionResult {
    type: string;
    features: any[];
    success: boolean;
    error?: string;
}

/**
 * Calculate the intersection between multiple isochrone polygons
 * @param isochroneData - GeoJSON FeatureCollection containing isochrone polygons
 * @returns GeoJSON FeatureCollection with intersection polygon(s)
 */
export function calculateIntersection(isochroneData: any): IntersectionResult {
    try {
        if (!isochroneData || !isochroneData.features || isochroneData.features.length < 2) {
            return {
                type: 'FeatureCollection',
                features: [],
                success: false,
                error: 'Insufficient data: Need at least two isochrone features to calculate intersection'
            };
        }

        // Group features by their group_index (different locations)
        const groupedFeatures: { [key: string]: any[] } = {};

        isochroneData.features.forEach((feature: any) => {
            const groupIndex = feature.properties.group_index;
            if (!groupedFeatures[groupIndex]) {
                groupedFeatures[groupIndex] = [];
            }
            groupedFeatures[groupIndex].push(feature);
        });

        // We need at least 2 different groups
        const groupKeys = Object.keys(groupedFeatures);
        if (groupKeys.length < 2) {
            return {
                type: 'FeatureCollection',
                features: [],
                success: false,
                error: 'Need isochrones from at least two different locations'
            };
        }

        // Get the first feature from each group for intersection
        const featuresForIntersection = groupKeys.map(key => groupedFeatures[key][0]);

        // Extract polygon coordinates for intersection calculation
        const polygons = featuresForIntersection.map(feature => {
            // Handle MultiPolygon vs Polygon
            if (feature.geometry.type === 'MultiPolygon') {
                return feature.geometry.coordinates;
            } else if (feature.geometry.type === 'Polygon') {
                return [feature.geometry.coordinates]; // Wrap in array for consistent format
            }
            return [];
        });

        // Calculate intersection
        let intersection: any = polygons[0]; // Start with first polygon

        // Intersect with each additional polygon
        for (let i = 1; i < polygons.length; i++) {
            intersection = martinez.intersection(intersection, polygons[i]);
            
            // If intersection is empty, return empty result
            if (!intersection || 
                (Array.isArray(intersection) && intersection.length === 0) || 
                JSON.stringify(intersection) === '[]') {
                console.log("No intersection found between polygons");
                return {
                    type: 'FeatureCollection',
                    features: [],
                    success: true, // This is a valid result - it means there's no intersection
                };
            }
        }        // Final check to make sure we have a valid intersection result
        if (!intersection || intersection.length === 0 || JSON.stringify(intersection) === '[]') {
            console.log("Intersection calculation completed but no overlapping areas found");
            return {
                type: 'FeatureCollection',
                features: [],
                success: true
            };
        }
        
        try {
            // Create GeoJSON feature from intersection result
            const intersectionFeature = {
                type: 'Feature',
                properties: {
                    isIntersection: true,
                    area: 0, // Will be calculated by map display system
                    range: featuresForIntersection.map(f => f.properties.value).join(' & '), // Combine the ranges
                    value: featuresForIntersection.map(f => f.properties.value).join('_') // Unique identifier
                },
                geometry: {
                    type: Array.isArray(intersection[0][0][0]) ? 'MultiPolygon' : 'Polygon',
                    coordinates: Array.isArray(intersection[0][0][0]) ? intersection : [intersection]
                }
            };

            // Return as FeatureCollection
            return {
                type: 'FeatureCollection',
                features: [intersectionFeature],
                success: true
            };
        } catch (error) {
            console.error("Error creating intersection feature:", error);
            return {
                type: 'FeatureCollection',
                features: [],
                success: true // Still a valid result - just no intersection
            };
        }
    } catch (error: any) {
        console.error('Error calculating intersection:', error);
        return {
            type: 'FeatureCollection',
            features: [],
            success: false,
            error: `Intersection calculation failed: ${error.message}`
        };
    }
}
