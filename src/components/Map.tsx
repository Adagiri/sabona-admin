import React from "react";
import GoogleMapReact from "google-map-react";

import { Box } from "@mui/material";
import { Order } from "../hooks/Admin/interface";


interface MarkerProps {
    orders: any;
}

interface MarkerComponentProps {
    item: any;
    lat: number;
    lng: number;
    onClick: (item: any) => void;
}

const Map: React.FC<MarkerProps> = ({ orders }) => {
    console.log("orders FROMMM COMPONENT===>", orders)
    const Markers: React.FC<MarkerComponentProps> = ({ item, onClick }) => {
        return (
            <Box
                onClick={() => onClick(item)}
                sx={{
                    width: 30, // Set the width of the marker
                    height: 30, // Set the height of the marker
                    cursor: "pointer",
                    backgroundImage: `url('src/components/location-pin.svg')`, // Path to your SVG
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
        );
    };
    // const getMapBounds = (map: any, maps: any, places: Order[]) => {
    //     const bounds = new maps.LatLngBounds();
    //     places.forEach((place) =>
    //         bounds.extend(
    //             new maps.LatLng(place.pickup.pickupLat, place.pickup.pickupLong)
    //         )
    //     );
    //     return bounds;
    // };

    // // Re-center map when resizing
    // const bindResizeListener = (map: any, maps: any, bounds: any) => {
    //     maps.event.addDomListenerOnce(map, "idle", () => {
    //         maps.event.addDomListener(window, "resize", () => {
    //             map.fitBounds(bounds);
    //         });
    //     });
    // };

    // // // Fit map to bounds after loading
    // const apiIsLoaded = (map: any, maps: any, places: Order[]) => {
    //     const bounds = getMapBounds(map, maps, places);
    //     map.fitBounds(bounds);
    //     bindResizeListener(map, maps, bounds);
    // };

    return (
        <Box sx={{ flex: 1, borderWidth: 1, height: '70vh' }}>
            <GoogleMapReact
                bootstrapURLKeys={{
                    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
                    // language: "en",
                }}
                defaultCenter={{
                    lat: 23.8859,
                    lng: 45.0792
                }}
                yesIWantToUseGoogleMapApiInternals
                // onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps, orders)}
                defaultZoom={5}
                draggable={false}
            >
                {orders && orders.map((item: any) => (
                    <Markers
                        onClick={() => console.log(item)}
                        key={item.id}
                        lat={item.pickup?.pickupLat}
                        lng={item.pickup?.pickupLong}
                        item={item}
                    />
                ))}
            </GoogleMapReact>
        </Box>
    );
};

export default Map;
