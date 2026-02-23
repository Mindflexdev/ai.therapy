import { Redirect } from 'expo-router';

export default function TermsRedirect() {
    return <Redirect href={{ pathname: '/(main)/legal', params: { section: 'terms' } }} />;
}
