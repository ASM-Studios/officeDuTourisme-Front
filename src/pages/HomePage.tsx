import { Box, Card, Button, CardContent, Typography, Grid, TextField } from '@mui/material';
import officeDuTourisme from '@assets/OfficeDuTourisme.png';
import { instance } from "../routes.ts";
import { toast, ToastContainer } from "react-toastify";
import { useCookies } from 'react-cookie';
import React from "react";

const ping = async () => {
    try {
        const response = await instance.get("/");
        console.log("response", response);
        if (response.status !== 200) {
            throw new Error('API is not available');
        }
    } catch (error) {
        console.error(error);
        throw new Error('API is not available');
    }
};

const launchGame = async (rounded: boolean) => {
    await ping().then(() => {
        if (rounded) { window.location.href = '/round';}
        else { window.location.href = '/map'; }
    }).catch(() => {
        toast.error("L'API n'est pas disponible, veuillez réessayer plus tard.");
    });
}

const Actions = () => {
    const [username, setUsername] = React.useState('');
    const [cookies, setCookie] = useCookies(['username']);

    const handleButtonClick = (rounded: boolean) => {
        setCookie('username', username, { path: '/' });
        launchGame(rounded);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent>
                <Box sx={{ marginBottom: '20px' }}>
                    <Typography variant="h5" component="div">
                        Bienvenue dans l'Office du Tourisme
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        LE site officiel pour explorer la France !
                        Prêt à découvrir les merveilles de notre pays ?
                    </Typography>
                </Box>
                <Box sx={{ marginBottom: '20px' }}>
                    <TextField
                        label="Nom d'utilisateur"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Box>
                <Button variant="contained" color="primary" onClick={() => {handleButtonClick(false)}} disabled={username === ""}>
                    Explorer ma france
                </Button>
                <Button variant="contained" color="primary" onClick={() => {handleButtonClick(true)}} disabled={username === ""} sx={{marginLeft: '20px'}}>
                    Lancer une partie classée
                </Button>
            </CardContent>
        </Box>
    );
}

const HomePage = () => {
    return (
        <Box sx={{ height: '100vh', width: '100vw', backgroundImage: `url(${officeDuTourisme})`, backgroundSize: 'cover' }}>
            <ToastContainer />
            <Card sx={{ height: '100%', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                <Grid container>
                    <Grid item xs={8}>
                    </Grid>
                    <Grid item xs={4}>
                        <Actions />
                    </Grid>
                </Grid>
            </Card>
        </Box>
    );
}

export default HomePage;