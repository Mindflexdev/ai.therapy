// Clear Created Characters from AsyncStorage
// Open browser console (F12) and paste this code to clear all created characters

if (typeof window !== 'undefined') {
    // For web
    localStorage.removeItem('user_characters');
    console.log('✅ Cleared all created characters from localStorage');
    console.log('Please refresh the page to see changes');
} else {
    console.log('This script is for web only. Run it in the browser console.');
}
