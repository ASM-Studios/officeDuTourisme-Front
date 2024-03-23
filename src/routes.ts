const endpoint = import.meta.env.VITE_API_ENDPOINT as string;

const user = endpoint + '/user';

export {
    endpoint,
    user,
}
