type QcmCoordoninate = {
    lat: number;
    lng: number;
};

export type QcmPrompt = {
    prompt: string;
    valid: boolean;
    points: number;
};

export type QcmQuestion = {
    type: string;
    prompts: QcmPrompt[];
};

export type QcmType = {
    Question: QcmQuestion;
};
