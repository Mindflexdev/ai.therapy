import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Replace (not push) so the back stack stays clean
    router.replace('/');
  }, []);

  return null;
}
