import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface VendorLocationMapProps {
  lat: number;
  lng: number;
  laundryName: string;
}

const VendorLocationMap: React.FC<VendorLocationMapProps> = ({
  lat,
  lng,
  laundryName,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Google Maps
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
    });

    // Add marker
    new window.google.maps.Marker({
      position: { lat, lng },
      map,
      title: laundryName,
    });
  }, [lat, lng, laundryName]);

  return (
    <Box
      ref={mapRef}
      sx={{
        height: 300,
        width: '100%',
        borderRadius: 1,
        border: '1px solid #ddd',
      }}
    />
  );
};

export default VendorLocationMap;
