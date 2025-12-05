import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function CreateScreen() {
    const router = useRouter();

    useEffect(() => {
        // specific fix for web: wait for router to be ready
        const timer = setTimeout(() => {
            router.push('/create-character' as any);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    return null;
}
