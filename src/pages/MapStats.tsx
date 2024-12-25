import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useCallback, useState } from 'react'
import { useFetchUserLocations } from '../hooks/Admin/query'
import { Filter } from '../hooks/Admin/interface'

const containerStyle = {
    width: '100%',
    height: '80vh',
}

const center = {
    lat: 24.64685054900064,
    lng: 46.71954221514672
}

const bounds = {
    north: 32.0, // Northernmost point
    south: 16.0, // Southernmost point
    east: 60.0,  // Easternmost point
    west: 34.0   // Westernmost point
}


const MapStats = () => {
    const { data: userLocations } = useFetchUserLocations();
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    })
    const [map, setMap] = useState(null)

    // const onLoad = useCallback(function callback(map: any) {
    //     const bounds = new window.google.maps.LatLngBounds(center)
    //     map.fitBounds(bounds)

    //     setMap(map)
    // }, [])

    const onLoad = useCallback(function callback(map:any) {
        // Fit the map to the bounds of Saudi Arabia
        const latLngBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(bounds.south, bounds.west),
            new window.google.maps.LatLng(bounds.north, bounds.east)
        );
        map.fitBounds(latLngBounds);

        setMap(map);
    }, [])

    const onUnmount = useCallback(function callback() {
        setMap(null)
    }, [])

    return (
        <main>
            <Typography variant="h4" gutterBottom mb={5}>
                Customer
            </Typography>
            {loadError && <Typography variant="h6" color="error">Error loading map: {loadError.message}</Typography>}
            {isLoaded && <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                // zoom={0.001}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {userLocations && userLocations.data?.map(marker => {
                    return (
                        <Marker
                            key={marker.id}
                            position={{ lat: marker.settings?.lat, lng: marker.settings?.long }}
                            icon={{
                                url: '/pin.png',
                                scaledSize: new window.google.maps.Size(40, 40),
                                fillOpacity: 1,
                                strokeWeight: 0,
                            }}
                        />
                    )
                })}
            </GoogleMap>}
        </main>
    )
}

export default MapStats;