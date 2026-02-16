import { Redirect } from 'expo-router';

export default function CookiesRedirect() {
    return <Redirect href={{ pathname: '/(main)/legal', params: { section: 'cookies' } }} />;
}
