import { Box, Button, FormLabel } from '@mui/material';
import { QcmPrompt, QcmType} from "../types/Qcm.type.ts";
import { useState } from "react";

const QcmForm = (props: QcmType & { incrementScore: (value: number) => void, handleClose: () => void }) => {
    const { data, incrementScore, handleClose } = props;
    const [visitedIndex, setVisitedIndex] = useState<number[]>([]);

    const handleClick = (prompt: QcmPrompt, index: number, response: boolean) => {
        if (visitedIndex.includes(index)) {
            return;
        }
        setVisitedIndex([...visitedIndex, index])
        if (prompt.valid === response) {
            incrementScore(prompt.points);
        }
    };

    return (
        <Box component="form" sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {data?.Question?.prompts.map((prompt: QcmPrompt, index: number) => (
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
                <Button variant="contained" color="primary" onClick={handleClose}>
                    Fermer
                </Button>
            </Box>
        </Box>
    );
};

export default QcmForm;