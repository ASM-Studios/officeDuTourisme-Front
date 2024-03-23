import {Box, Button, Typography} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QuestionModal from "../../Components/QuestionModale.tsx";
import { instance, getByCoordinates } from "../routes.ts";
import {json} from "react-router-dom";
import {Streetview} from "@mui/icons-material";

const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
};

const startingPoint = {
    lat: 46.2276,
    lng: 2.2137,
};

const Map = () => {
    const [questions, setQuestions] = useState(false);
    const [data, setData] = useState({
        Coordinate: {
            lat: 0,
            lng: 0,
        },
        Question: {
            type: '',
            prompts: [],
        },
    });
    const [markerPosition, setMarkerPosition] = useState(null);
    const [isStreetViewActive, setIsStreetViewActive] = useState(false);

    const handleMapClick = (event) => {
        setMarkerPosition({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        });
    };

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
        language: 'fr',
    });

    const mapRef = useRef();

    const handleExitStreetView = () => {
        if (mapRef.current) {
            // @ts-expect-error mapRef is not null
            const streetView = mapRef.current.getStreetView();
            streetView.setVisible(false);
            setIsStreetViewActive(false);
        }
    };

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading maps</div>;
    }

    const launchQuestions = async () => {
        const cdata: {"coordinates": {"lng": number, "lat": number}} = {
            "coordinates" : {
                "lng": markerPosition?.lng,
                "lat": markerPosition?.lat
            },
        }

        await instance.post(getByCoordinates, cdata, {}).then((response) => {
            setData(response.data);
            console.log("data", response.data);
            setQuestions(true);
        }).catch((error) => {
            console.error(error);
            toast.error("Une erreur est survenue, veuillez réessayer plus tard.");
        });
    }

    const toggleStreetView = () => {
        if (mapRef?.current) {
            if (mapRef?.current?.getZoom() <= 13) {
                toast.error('Veuillez zoomer pour activer Street View.');
                return;
            }
            // @ts-expect-error mapRef is not null
            const streetView = mapRef.current.getStreetView();
            const streetViewService = new google.maps.StreetViewService();

            streetViewService.getPanoramaByLocation(markerPosition, 50, (streetViewPanoramaData, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    streetView.setPosition(markerPosition);
                    streetView.setVisible(true);
                    setIsStreetViewActive(true);
                } else {
                    toast.error('Street View non disponible à cet endroit.')
                }
            });
        }
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <ToastContainer />
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={7}
                center={startingPoint}
                onClick={handleMapClick}
                onDblClick={toggleStreetView}
                onLoad={(map) => {
                    // @ts-expect-error mapRef is not null
                    mapRef.current = map;
                }}
                options={{
                    disableDefaultUI: true,
                }}
            >
                {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '20%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 2,
                }}
            >
                <Box
                    sx={{
                        border: '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        padding: 1,
                        marginBottom: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'primary.main',
                        mb: 2,
                    }}
                >
                    {!markerPosition ? (
                        <Typography variant="h6" color="white">
                            Cliquez sur la carte pour placer un marqueur
                        </Typography>
                    ) : (
                        <div>
                            <Typography variant="h6" color="white">
                                Latitude: {markerPosition?.lat}
                            </Typography>
                            <Typography variant="h6" color="white">
                                Longitude: {markerPosition?.lng}
                            </Typography>
                        </div>
                    )}
                </Box>
                <Button variant="contained" color="primary" onClick={launchQuestions} disabled={!markerPosition}>
                    Lancer le jeu à cette position
                </Button>
                {isStreetViewActive && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleExitStreetView}
                        sx={{ marginTop: '20px' }}
                    >
                        Retourner sur la carte
                    </Button>
                )}
            </Box>
            {questions && (
                <QuestionModal
                    open={questions}
                    handleClose={() => setQuestions(false)}
                    data={data}
                />
            )}
        </div>
    );
};

export default Map;
