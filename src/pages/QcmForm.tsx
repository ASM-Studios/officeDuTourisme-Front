import { Box, Button, FormLabel } from '@mui/material';
import { QcmPrompt, QcmType} from "../types/Qcm.type.ts";
import { useState } from "react";

const QcmForm = (data: QcmType | any) => {
    const [score, setScore] = useState(0);
    const [visitedIndex, setVisitedIndex] = useState<number[]>([]);

    const handleReset = () => {
        window.location.reload();
    };

    const handleClick = (prompt: QcmPrompt, index: number, response: boolean) => {
        if (visitedIndex.includes(index)) {
            return;
        }
        setVisitedIndex([...visitedIndex, index])
        if (prompt.valid === response) {
            setScore(score + prompt.points);
        }
    };

    return (
        <Box component="form" sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {data?.data?.Question?.prompts.map((prompt: QcmPrompt, index: number) => (
                <Box key={index} sx={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <FormLabel>{prompt.prompt}</FormLabel>
                    <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleClick(prompt, index, true)}
                            disabled={visitedIndex.includes(index)}
                            sx={{ marginRight: '10px' }}>
                            Oui
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleClick(prompt, index, false)}
                            disabled={visitedIndex.includes(index)}>
                            Non
                        </Button>
                    </Box>
                </Box>
            ))}
            <Box sx={{ marginTop: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <FormLabel>Résultat: {score}</FormLabel>
                <Button variant="contained" color="primary" onClick={handleReset}>
                    Rejouer une partie
                </Button>
            </Box>
        </Box>
    );
};

export default QcmForm;