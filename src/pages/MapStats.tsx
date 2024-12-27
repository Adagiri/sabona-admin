import { Typography } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useRef } from 'react';
import { useFetchUserLocations } from '../hooks/Admin/query';

const containerStyle = {
    width: '100%',
    height: '80vh',
};


const bounds = {
    north: 32.0, // Northernmost point
    south: 16.0, // Southernmost point
    east: 60.0,  // Easternmost point
    west: 34.0,  // Westernmost point
};

const MapStats = () => {
    const { data: userLocations, isPending: isFetchingUserLocations } = useFetchUserLocations();
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['marker'],
    });
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoaded && mapRef.current) {
            const maps = new google.maps.Map(mapRef.current, {
                center: { lat: 23.8859, lng: 45.0792 }, // Center of Saudi Arabia
                zoom: 6, // Set a default zoom (adjust if needed)
                mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
            });

            // Set bounds to fit Saudi Arabia
            const latLngBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(bounds.south, bounds.west),
                new google.maps.LatLng(bounds.north, bounds.east)
            );
            maps.fitBounds(latLngBounds);

            userLocations?.data?.forEach((marker) => {
                const markerContent = document.createElement('img');
                markerContent.src = '/pin.png';
                markerContent.alt = 'Marker Icon';
                markerContent.style.width = '40px';
                markerContent.style.height = '40px';

                new google.maps.marker.AdvancedMarkerElement({
                    position: { lat: marker.settings?.lat, lng: marker.settings?.long },
                    map: maps,
                    content: markerContent,
                });
            });
        }
    }, [isLoaded, userLocations]);

    return (
        <main>
            <Typography variant="h4" gutterBottom mb={5}>
                Customer
            </Typography>
            {isFetchingUserLocations && <Typography variant="h6">Loading...</Typography>}
            {loadError && <Typography variant="h6" color="error">Error loading map: {loadError.message}</Typography>}
            {isLoaded && (
                <div ref={mapRef} style={containerStyle}></div>
            )}
        </main>
    );
};

export default MapStats;
