import {Box, Button, Typography} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QuestionModal from "../../Components/QuestionModale.tsx";
import { instance, getByCoordinates } from "../routes.ts";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import { useCookies } from 'react-cookie';

const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
};

const startingPoint = {
    lat: 46.5118,
    lng: 1.1754,
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
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [rows, setRows] = useState([]);
    const [dataIsLoading, setDataIsLoading] = useState(false);

    const maxRound = 3;

    const [cookies, setCookie] = useCookies(['username']);

    useEffect(() => {
        if (round === maxRound) {
            toast.success('Félicitations, vous avez terminé la partie !');
            setQuestions(false);
            setRound(0);
            setScore(0);
            const username = cookies.username;
            instance.post('/setScoreByUser', {
                "username": username,
                "score": score,
            })
                .then(() => {});
        }
    }, [round]);

    useEffect(() => {
        if (isStreetViewActive) {
            handleExitStreetView();
            toggleStreetView();
        }
    }, [markerPosition]);

    const getFirsts = async () => {
        instance.get('/getFirsts').then((response) => {
            setRows(response.data);
        }).catch((error) => {
            console.error(error);
        });
    }

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
        const newPosition = {
            lat: position.lat,
            lng: position.lng,
        };
        setMarkerPosition(newPosition);

        if (mapRef.current) {
            mapRef.current.setCenter(newPosition);
        }

        setCanGuess(true);
    }

    const toggleStreetView = () => {
        if (mapRef?.current) {
            let zoomLevel = mapRef.current.getZoom();
            const zoomInterval = setInterval(() => {
                if (zoomLevel >= 20) {
                    clearInterval(zoomInterval);
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
                } else {
                    zoomLevel++;
                    mapRef.current.setZoom(zoomLevel);
                    mapRef.current.setCenter(markerPosition);
                }
            }, 300);
        }
    }

    const handleGuess = async () => {
        const cdata: {"coordinates": {"lng": number, "lat": number}} = {
            "coordinates" : {
                "lng": markerPosition?.lng,
                "lat": markerPosition?.lat,
            },
        }

        setDataIsLoading(true);

        await instance.post(getByCoordinates, cdata, {}).then((response) => {
            setData(response.data);
            setQuestions(true);
            setCanGuess(false);
        }).catch((error) => {
            console.error(error);
            toast.error("Une erreur est survenue, veuillez réessayer plus tard.");
        }).finally(() => {
            setDataIsLoading(false);
        });
    }

    async function generateRandomPosition(latRange, lngRange) {
       const randomLat = Math.random() * (latRange[1] - latRange[0]) + latRange[0];
       const randomLng = Math.random() * (lngRange[1] - lngRange[0]) + lngRange[0];
       return {
           lat: randomLat,
           lng: randomLng,
       };
    }

    async function getStreetAddress(geocoder, position) {
        return new Promise((resolve) => {
            geocoder.geocode({ location: position }, (results, status) => {
                if (status === "OK" && results) {
                    const streetAddressResult = results.find(result => result.types.includes('street_address'));
                    resolve(streetAddressResult);
                } else {
                    resolve(null);
                }
            });
        });
    }

    function isInFrance(streetAddressResult) {
        const countryComponent = streetAddressResult.address_components.find(component => component.types.includes('country'));
        return countryComponent && countryComponent.long_name === 'France';
    }

    function isStreetViewAvailable(streetViewService, position) {
        return new Promise((resolve) => {
            streetViewService.getPanoramaByLocation(position, 50, (data, status) => {
                resolve(status === "OK");
            });
        });
    }

    async function generateRandomCoordinates() {
        const latRange = [42, 50];
        const lngRange = [-4, 8];
        const geocoder = new google.maps.Geocoder();
        const streetViewService = new google.maps.StreetViewService();
        let resolvedData = null;

        while (!resolvedData) {
            const rand_pos = await generateRandomPosition(latRange, lngRange);
            const streetAddressResult = await getStreetAddress(geocoder, rand_pos);

            if (streetAddressResult && isInFrance(streetAddressResult)) {
                const tempResolvedData = {
                    address: streetAddressResult.formatted_address,
                    position: streetAddressResult.geometry.location.toJSON()
                };
                if (await isStreetViewAvailable(streetViewService, tempResolvedData.position)) {
                    resolvedData = tempResolvedData;
                }
            }
        }
        return resolvedData.position;
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
            {dataIsLoading && (
                <>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 2,
                        }}
                    >
                        <Typography variant="h6" color="primary">
                            Chargement des données...
                        </Typography>
                    </Box>
                </>
            )}
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
                        generateRandomCoordinates()
                            .then(position => {
                                launchQuestions(position);
                            })
                            .catch(error => {
                                console.error(error);
                            });
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
                {!isStreetViewActive && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={toggleStreetView}
                        disabled={!markerPosition}
                        sx={{marginTop: '20px', marginBottom: '20px'}}
                    >
                        Passer en StreetView
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
                {rounded &&
                    (<Button variant="contained" color="primary" onClick={() => {
                        getFirsts();
                        setShowScoreboard(true);
                    }} sx={{marginTop: '20px'}}>
                        Voir les meilleurs scores
                    </Button>
                    )}
                <Button variant="contained" color="primary" onClick={() => {
                    window.location.href = '/';
                }} sx={{marginTop: '20px'}}>
                    Revenir à l'accueil
                </Button>
            </Box>
            {rounded && (
                <Modal
                    open={showScoreboard}
                    onClose={() => setShowScoreboard(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '50%',
                            bgcolor: 'background.paper',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
                            p: 4,
                            overflow: 'auto',
                        }}
                    >
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Player</TableCell>
                                        <TableCell align="right">Score</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                            key={row.username}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row.username}
                                            </TableCell>
                                            <TableCell align="right">{row.score}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Modal>
            )}
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
