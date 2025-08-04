import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";

// Set your Mapbox token (from .env.local)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type Location = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
};

const Map: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<MapboxMap | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);

    // Fetch location data from your Go backend
    useEffect(() => {
        fetch("http://localhost:8080/locations")
            .then((res) => res.json())
            .then((data: Location[]) => setLocations(data))
            .catch((err) => console.error("Error fetching locations:", err));
    }, []);

    // Initialize the map only once
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [106.816666, -6.2], // Jakarta
            zoom: 10,
        });
    }, []);

    // Add markers after data is fetched
    useEffect(() => {
        if (!map.current) return;

        locations.forEach((loc) => {
            new mapboxgl.Marker()
                .setLngLat([loc.longitude, loc.latitude])
                .setPopup(new mapboxgl.Popup().setText(loc.name))
                .addTo(map.current!);
        });
    }, [locations]);

    return (
        <div>
            <div
                ref={mapContainer}
                style={{ width: "100%", height: "500px", borderRadius: "8px" }}
            />
        </div>
    );
};

export default Map;
