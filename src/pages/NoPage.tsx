import { Box, Typography } from '@mui/material';
import JarJar from '@assets/JarJar.png';

const NoPage = () => {
    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                backgroundImage: `url(${JarJar})`,
                backgroundSize: 'cover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', p: 3 }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'red', fontSize: '2em' }}>
                    Ho no, cringe, a 404 error
                </Typography>
            </Box>
        </Box>
    );
}

export default NoPage;