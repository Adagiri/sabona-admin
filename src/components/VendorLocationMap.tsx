// import React, { useEffect, useRef } from 'react';
// import { Box } from '@mui/material';

// interface VendorLocationMapProps {
//   lat: number;
//   lng: number;
//   laundryName: string;
// }

// const VendorLocationMap: React.FC<VendorLocationMapProps> = ({
//   lat,
//   lng,
//   laundryName,
// }) => {
//   const mapRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!mapRef.current) return;

//     // Initialize Google Maps
//     const map = new window.google.maps.Map(mapRef.current, {
//       center: { lat, lng },
//       zoom: 15,
//     });

//     // Add marker
//     new window.google.maps.Marker({
//       position: { lat, lng },
//       map,
//       title: laundryName,
//     });
//   }, [lat, lng, laundryName]);

//   return (
//     <Box
//       ref={mapRef}
//       sx={{
//         height: 300,
//         width: '100%',
//         borderRadius: 1,
//         border: '1px solid #ddd',
//       }}
//     />
//   );
// };

// export default VendorLocationMap;


// File: src/components/VendorLocationMap.tsx

import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface VendorLocationMapProps {
  lat: number;
  lng: number;
  laundryName: string;
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
}) => {
  const center = {
    lat: lat,
    lng: lng,
  };

  // If you don't have a Google Maps API key, return a fallback
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
        <Typography variant="body2" color="text.secondary" gutterBottom>
          📍 {laundryName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
        </Typography>
        <Typography variant="caption" color="text.secondary" mt={1}>
          Google Maps API key not configured
        </Typography>
      </Box>
    );
  }

  return (
    <LoadScript 
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
        </Box>
      }
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker
          position={center}
          title={laundryName}
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default VendorLocationMap;