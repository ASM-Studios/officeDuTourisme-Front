import { Modal, Box } from '@mui/material';
import QcmForm from "../src/pages/QcmForm.tsx";
import NoPage from "../src/pages/NoPage.tsx";

type Question = {
    type: string;
    [key: string]: any;
}

type Data = {
    Coordinate: {
        lat: number;
        lng: number;
    }
    Question: Question;
}

type QuestionModalProps = {
    data: Data;
    open: boolean;
    handleClose: () => void;
};

const QuestionModal = ({ data, open, handleClose }: QuestionModalProps) => {
    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '25%',
                        height: '50%',
                        bgcolor: 'background.paper',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
                        p: 4,
                        overflow: 'auto',
                        transition: 'all 0.3s ease-in-out',
                        padding: '20px',
                        backgroundColor: '#f5f5f5',
                    }}
                >
                    {data?.Question?.type === 'QCM' ? <QcmForm data={data} /> : <NoPage />}
                </Box>
            </Modal>
        </div>
    );
};

export default QuestionModal;