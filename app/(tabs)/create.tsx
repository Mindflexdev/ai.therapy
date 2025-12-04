import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function CreateScreen() {
    const router = useRouter();

    useEffect(() => {
        router.push('/create-character' as any);
    }, []);

    return null;
}
