import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const Footer = () => {
    const theme = useTheme();

    return (
        <Box sx={{ py: 3, position: 'fixed', bottom: 0, width: '100%', backgroundColor: theme.palette.primary.main, color: 'white' }}>
            <Typography variant="body2" align="center">
                © 2024 Office-Du-Tourisme.gouv.fr. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer;