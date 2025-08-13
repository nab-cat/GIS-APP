"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapOverlay from "./map-overlay";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lng: string, lat: string } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const currentLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);

    useEffect(() => {
        // Initialize map only once
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/nabcat/cme8qehem001901s9g1p7224e",
            center: [106.8456, -6.2088], // Jakarta
            zoom: 15,
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Add a default marker as an example
        const defaultMarker = new mapboxgl.Marker({ color: "#FF0000" })
            .setLngLat([106.8456, -6.2088])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                    `<div class="text-primary font-body">
                        <h3 class="font-bold ">Jakarta</h3>
                        <p>Longitude: 106.8456</p>
                        <p>Latitude: -6.2088</p>
                    </div>`
                )
            )
            .addTo(map);

        setMarkers(prev => [...prev, defaultMarker]);

        // Click Event to add markers
        map.on("click", (e) => {
            const { lng, lat } = e.lngLat;

            // Format coordinates to 4 decimal places
            const formattedLng = lng.toFixed(4);
            const formattedLat = lat.toFixed(4);

            console.log("Clicked at:", { lng: formattedLng, lat: formattedLat });
            setSelectedLocation({ lng: formattedLng, lat: formattedLat });

            // Create popup with coordinate information
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div class="text-primary font-body">
                    <h3 class="font-bold">Selected Location</h3>
                    <p>Longitude: ${formattedLng}</p>
                    <p>Latitude: ${formattedLat}</p>
                </div>`
            );

            // Add a new marker at the clicked position
            const newMarker = new mapboxgl.Marker({ color: "#3FB1CE" })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map);

            // Store the marker reference
            setMarkers(prev => [...prev, newMarker]);
        });

        // Clean up function
        return () => {
            map.remove();
        };
    }, []);

    // Function to remove all markers
    const removeAllMarkers = () => {
        markers.forEach(marker => marker.remove());
        
        // Also remove current location marker if it exists
        if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.remove();
            currentLocationMarkerRef.current = null;
        }
        
        setMarkers([]);
        setSelectedLocation(null);
    };

    // Function to get current location
    const getCurrentLocation = () => {
        // Check if geolocation is available
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                
                // Format coordinates to 4 decimal places
                const formattedLng = longitude.toFixed(4);
                const formattedLat = latitude.toFixed(4);
                
                console.log("Current location:", { lng: formattedLng, lat: formattedLat });
                
                // Update selected location
                setSelectedLocation({ lng: formattedLng, lat: formattedLat });
                
                // Create popup for current location
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                    `<div class="text-primary font-body">
                        <h3 class="font-bold">Your Location</h3>
                        <p>Longitude: ${formattedLng}</p>
                        <p>Latitude: ${formattedLat}</p>
                    </div>`
                );
                
                // Remove existing current location marker if it exists
                if (currentLocationMarkerRef.current) {
                    currentLocationMarkerRef.current.remove();
                }
                
                // Add a new marker at the current location with a distinct color and pulsing effect
                const userLocationMarker = new mapboxgl.Marker({
                    color: "#4285F4",
                    scale: 1.2
                })
                    .setLngLat([longitude, latitude])
                    .setPopup(popup)
                    .addTo(mapRef.current!);
                
                // Store reference to current location marker
                currentLocationMarkerRef.current = userLocationMarker;
                
                // Fly to current location
                mapRef.current!.flyTo({
                    center: [longitude, latitude],
                    zoom: 16,
                    speed: 1.5,
                    curve: 1,
                    essential: true
                });
                
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting current location:", error);
                alert(`Error getting your location: ${error.message}`);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <div className="relative w-full h-screen bg-white dark:bg-gray-900 font-body">
            {/* Map container */}
            <div ref={mapContainer} className="w-full h-screen" />

            <MapOverlay 
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                selectedLocation={selectedLocation}
                markers={markers}
                onRemoveAllMarkers={removeAllMarkers}
                onGetCurrentLocation={getCurrentLocation}
                isLocating={isLocating}
            />
        </div>
    );
}