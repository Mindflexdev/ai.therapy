import { Redirect } from 'expo-router';

export default function PrivacyRedirect() {
    return <Redirect href={{ pathname: '/(main)/legal', params: { section: 'privacy' } }} />;
}
