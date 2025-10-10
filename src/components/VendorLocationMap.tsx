import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';

interface VendorLocationMapProps {
  lat: number;
  lng: number;
  laundryName: string;
  editable?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '4px',
};

const VendorLocationMap: React.FC<VendorLocationMapProps> = ({
  lat,
  lng,
  laundryName,
  editable = false,
  onLocationChange,
}) => {
  const [markerPosition, setMarkerPosition] = useState({ lat, lng });

  useEffect(() => {
    setMarkerPosition({ lat, lng });
  }, [lat, lng]);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!editable || !onLocationChange) return;

      const newLat = event.latLng?.lat();
      const newLng = event.latLng?.lng();

      if (newLat !== undefined && newLng !== undefined) {
        setMarkerPosition({ lat: newLat, lng: newLng });
        onLocationChange(newLat, newLng);
      }
    },
    [editable, onLocationChange]
  );

  const handleMarkerDrag = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!editable || !onLocationChange) return;

      const newLat = event.latLng?.lat();
      const newLng = event.latLng?.lng();

      if (newLat !== undefined && newLng !== undefined) {
        setMarkerPosition({ lat: newLat, lng: newLng });
        onLocationChange(newLat, newLng);
      }
    },
    [editable, onLocationChange]
  );

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Box
        sx={{
          height: 300,
          width: '100%',
          borderRadius: 1,
          border: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          p: 2,
        }}
      >
        <Typography variant='body2' color='text.secondary' gutterBottom>
          📍 {laundryName}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
        </Typography>
        <Typography variant='caption' color='text.secondary' mt={1}>
          Google Maps API key not configured
        </Typography>
      </Box>
    );
  }

  return (
    <LoadScriptNext
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      loadingElement={
        <Box
          sx={{
            height: 300,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            borderRadius: 1,
          }}
        >
          <CircularProgress size={24} />
          <Typography variant='body2' ml={2}>
            Loading map...
          </Typography>
        </Box>
      }
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={15}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        <Marker
          position={markerPosition}
          title={laundryName}
          draggable={editable}
          onDragEnd={handleMarkerDrag}
        />
      </GoogleMap>
    </LoadScriptNext>
  );
};

export default VendorLocationMap;
