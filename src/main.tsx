import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Map from "./pages/Map";
import HomePage from "./pages/HomePage";
import Footer from "./pages/Footer.tsx";
import NoPage from "./pages/NoPage.tsx";
import theme from './Theme';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/map" element={<Map />} />
                    <Route path="*" element={<NoPage />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

// @ts-expect-error root is not null
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
        <App />
        <Footer />
    </>
);