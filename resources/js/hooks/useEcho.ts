import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const useEcho = () => {
    const [echo, setEcho] = useState<Echo | null>(null);

    useEffect(() => {
        const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            authEndpoint: '/api/broadcasting/auth',
        });

        const newEcho = new Echo({
            broadcaster: 'pusher',
            client: pusher,
        });

        setEcho(newEcho);

        return () => {
            newEcho.disconnect();
        };
    }, []);

    return { echo };
};
