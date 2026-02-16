import { Redirect } from 'expo-router';

export default function ImprintRedirect() {
    return <Redirect href={{ pathname: '/(main)/legal', params: { section: 'imprint' } }} />;
}
