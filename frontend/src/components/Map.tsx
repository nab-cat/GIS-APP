import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

type Spot = {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
};

const Map = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v9',
            projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
            zoom: 1,
            center: [30, 15]
        });

        fetch('http://localhost:8080/spots')
            .then(res => res.json())
            .then((data: Spot[]) => {
                data.forEach((spot) => {
                    const popupContent = `
            <div style="max-width: 250px">
              <h3 style="margin:0; font-size:16px;">${spot.name}</h3>
              <p style="margin:0;">${spot.description}</p>
              <small>${spot.address}</small>
            </div>
          `;

                    new mapboxgl.Marker()
                        .setLngLat([spot.longitude, spot.latitude])
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
                        .addTo(map.current!);
                });
            })
            .catch((err) => {
                console.error('Error fetching locations:', err);
            });

        return () => {
            map.current?.remove();
        };
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{ width: '100%', height: '100vh' }}
        />
    );
};

export default Map;
