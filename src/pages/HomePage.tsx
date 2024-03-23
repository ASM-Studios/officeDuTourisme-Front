import { Box, Card, Button, CardContent, Typography, Grid } from '@mui/material';
import officeDuTourisme from '@assets/OfficeDuTourisme.png';
import { endpoint, instance } from "../routes.ts";
import { toast, ToastContainer } from "react-toastify";
import { GoogleLogin } from 'react-google-login';

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

const launchGame = async () => {
    await ping().then(() => {
        window.location.href = '/map';
    }).catch(() => {
        toast.error("L'API n'est pas disponible, veuillez réessayer plus tard.");
    });
}

const responseGoogle = (response) => {
    console.log(response);
}

const Actions = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Bienvenue dans l'Office du Tourisme
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    LE site officiel pour explorer la France !
                    Prêt à découvrir les merveilles de notre pays ?
                </Typography>
                <Button variant="contained" color="primary" onClick={launchGame}>
                    Explorer ma france
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