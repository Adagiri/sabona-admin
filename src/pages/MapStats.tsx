import { Typography } from '@mui/material'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useCallback, useState } from 'react'

const containerStyle = {
    width: '100%',
    height: '90vh',
}

const center = {
    lat: 24.64685054900064,
    lng: 46.71954221514672
}

const markersData = [
    {
        id: 1,
        position: center,
    },
    {
        id: 2,
        position: { lat: 24.646, lng: 46.718 },
    },
    {
        id: 3,
        position: { lat: 24.647, lng: 46.720 },
    },
    {
        id: 4,
        position: { lat: 24.648, lng: 46.721 },
    },
    {
        id: 5,
        position: { lat: 24.645, lng: 46.717 },
    },
    {
        id: 6,
        position: { lat: 24.649, lng: 46.722 },
    },
    {
        id: 7,
        position: { lat: 24.644, lng: 46.716 },
    },
    {
        id: 8,
        position: { lat: 24.650, lng: 46.723 },
    },
    {
        id: 9,
        position: { lat: 24.643, lng: 46.715 },
    },
    {
        id: 10,
        position: { lat: 24.651, lng: 46.724 },
    },
]

const MapStats = () => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
    })

    const [map, setMap] = useState(null)

    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center)
        map.fitBounds(bounds)

        setMap(map)
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
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {markersData.map(marker => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={{
                            url: '/pin.png',
                            scaledSize: new window.google.maps.Size(40, 40),
                            fillOpacity: 1,
                            strokeWeight: 0,
                        }}
                    />
                ))}
            </GoogleMap>}
        </main>
    )
}

export default MapStats;