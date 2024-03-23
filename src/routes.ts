import axios from "axios";

const edt = import.meta.env.VITE_API_ENDPOINT as string;
const port = import.meta.env.VITE_API_PORT as string;
const endpoint = `http://${edt}:${port}`;

const user = endpoint + '/user';

const getByCoordinates = endpoint + '/getByCoordinates';

const instance = axios.create({
    baseURL: endpoint,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
});

export {
    instance,
    endpoint,
    user,
    getByCoordinates,
}
