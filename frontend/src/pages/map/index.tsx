"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import TwoPointSelector from "@/components/map/TwoPointSelector";
import StepsIndicator from "@/components/map/StepsIndicator";
import Navbar from "@/components/Navbar";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Initialize map only once
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/nabcat/cmeogbsmg000j01sf76ji60t8",
            center: [106.8456, -6.2088], // Jakarta
            zoom: 12,
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Clean up function
        return () => {
            map.remove();
        };
    }, []);

    // Handle marker placement
    const handleLocationSelected = (index: number, lng: number, lat: number, label: string) => {
        if (!mapRef.current) return;
        
        // Remove existing marker at this index if it exists
        if (markersRef.current[index]) {
            markersRef.current[index].remove();
            markersRef.current[index] = null!;
        }
        
        // If this is a clear operation (empty label), return after removing marker
        if (!label) return;
        
        // Create marker with color based on index (blue for first, red for second)
        const markerColor = index === 0 ? "#3b82f6" : "#ef4444";
        
        // Create popup
        const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false 
        }).setHTML(
            `<div class="p-3">
                <h3 class="font-bold mb-1">${label}</h3>
                <p class="text-sm text-gray-600">Long: ${lng.toFixed(4)} | Lat: ${lat.toFixed(4)}</p>
            </div>`
        );
        
        // Add new marker
        const marker = new mapboxgl.Marker({
            color: markerColor,
            draggable: false,
        })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(mapRef.current);
        
        // Save reference to marker
        markersRef.current[index] = marker;
        
        // Show popup
        marker.togglePopup();
        
        // If both markers exist, update the map view to include both
        setTimeout(() => {
            if (markersRef.current[0] && markersRef.current[1]) {
                fitMapToMarkers();
            }
        }, 100); // Small delay to ensure map and markers are ready
    };
    
    // Fit map to show both markers
    const fitMapToMarkers = () => {
        if (!mapRef.current) return;
        
        // Check if we have both markers
        const validMarkers = markersRef.current.filter(marker => marker);
        if (validMarkers.length < 2) return;
        
        const bounds = new mapboxgl.LngLatBounds();
        validMarkers.forEach(marker => {
            bounds.extend(marker.getLngLat());
        });
        
        mapRef.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            maxZoom: 15,
            duration: 800  // Add smooth animation
        });
    };

    return (
        <div className="relative w-full h-screen bg-white dark:bg-gray-900 font-body">
            {/* Map container */}
            <div ref={mapContainer} className="w-full h-screen" />
            
            {/* Steps Indicator at the top */}
            <StepsIndicator currentStep={currentStep} />
            
            {/* Two Point Selector Control Panel */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
                <TwoPointSelector 
                    map={mapRef.current} 
                    onLocationSelected={handleLocationSelected} 
                />
            </div>
            
            {/* Include the Navbar component at the bottom */}
            <Navbar />
            
            {/* Custom styles for popups */}
            <style jsx global>{`
                .mapboxgl-popup-content {
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    padding: 0;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }
                
                .dark .mapboxgl-popup-content {
                    background-color: #1f2937;
                    color: #f3f4f6;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                }
                
                .mapboxgl-popup-close-button {
                    font-size: 18px;
                    padding: 4px 8px; 
                    color: #6b7280;
                    background: transparent;
                    border: none;
                    z-index: 2;
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    transition: color 0.2s ease;
                }
                
                .mapboxgl-popup-close-button:hover {
                    color: #111827;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                }
                
                .dark .mapboxgl-popup-close-button {
                    color: #d1d5db;
                }
                
                .dark .mapboxgl-popup-close-button:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}