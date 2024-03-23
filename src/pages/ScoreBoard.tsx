import { useState, useEffect } from "react";
import { instance } from "../routes.ts";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

export default function Scoreboard(open: boolean) {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(true); // State to control the open/close of the modal

    useEffect(() => {
        instance.get('/getFirsts').then((response) => {
            setRows(response.data);
        }).catch((error) => {
            console.error(error);
        });
    }, []);

    return (

    );
}