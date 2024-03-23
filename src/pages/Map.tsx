import {Box, Button, Typography} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QuestionModal from "../../Components/QuestionModale.tsx";
import { instance, getByCoordinates } from "../routes.ts";
import {Simulate} from "react-dom/test-utils";
import pointerCancel = Simulate.pointerCancel;

const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
};

const startingPoint = {
    lat: 46.2276,
    lng: 2.2137,
};

interface MapProps {
    rounded: boolean;
}

const Map: React.FC<MapProps> = ({ rounded }) => {
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
    const [round, setRound] = useState(0);
    const [canGuess, setCanGuess] = useState(false);
    const [score, setScore] = useState(0);

    const maxRound = 3;

    useEffect(() => {
        if (round === maxRound) {
            toast.success('Félicitations, vous avez terminé la partie !');
            setQuestions(false);
            setRound(0);
            setScore(0);
        }
    }, [round]);

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

    const launchQuestions = (position: {"lng": number, "lat": number}) => {
        setMarkerPosition({
            lat: position.lat,
            lng: position.lng,
        });
        setCanGuess(true);
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

    const handleGuess = async () => {
        const cdata: {"coordinates": {"lng": number, "lat": number}} = {
            "coordinates" : {
                "lng": markerPosition?.lng,
                "lat": markerPosition?.lat,
            },
        }

        await instance.post(getByCoordinates, cdata, {}).then((response) => {
            setData(response.data);
            setQuestions(true);
            setCanGuess(false);
        }).catch((error) => {
            console.error(error);
            toast.error("Une erreur est survenue, veuillez réessayer plus tard.");
        });
    }

    function generateRandomCoordinates() {
        const latRange = [42, 50];
        const lngRange = [-4, 8];

        const randomLat = Math.random() * (latRange[1] - latRange[0]) + latRange[0];
        const randomLng = Math.random() * (lngRange[1] - lngRange[0]) + lngRange[0];

        return {
            lat: randomLat,
            lng: randomLng,
        };
    }

    const incrementScore = (value: number) => {
        setScore(score + value);
    };

    const handleClick = (event) => {
        if (rounded) return;
        setMarkerPosition({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        });
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <ToastContainer />
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={7}
                center={startingPoint}
                onClick={handleClick}
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
                            Generez un marqueur pour commencer
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
                {rounded && (
                    <Button variant="contained" color="primary" onClick={() => {
                    launchQuestions(generateRandomCoordinates())
                }} sx={{marginTop: '20px'}}>
                    Générer un marqueur
                </Button>
                )}
                {(canGuess || !rounded) && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            handleGuess()
                        }}
                        disabled={!markerPosition}
                        sx={{margin: '20px'}}
                    >
                        Lancer le jeu
                    </Button>
                )}
                {isStreetViewActive && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleExitStreetView}
                        sx={{marginTop: '20px', marginBottom: '20px'}}
                    >
                        Retourner sur la carte
                    </Button>
                )}
                {rounded && (
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
                            marginTop: '20px',
                        }}
                    >
                        <div>
                            <Typography variant="h6" color="white">
                                Manche: { round } / { maxRound }
                            </Typography>
                            <Typography variant="h6" color="white">
                                Score: { score }
                            </Typography>
                        </div>
                    </Box>
                )}
            </Box>
            {questions && (
                <QuestionModal
                    open={questions}
                    handleClose={() => {
                        setQuestions(false);
                        setRound(round + 1);
                    }}
                    data={data}
                    incrementScore={incrementScore}
                />
            )}
        </div>
    );
};

export default Map;
