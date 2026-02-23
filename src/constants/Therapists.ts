export const THERAPIST_IMAGES: Record<string, any> = {
    'Marcus': require('../../assets/characters/marcus.jpg'),
    'Sarah': require('../../assets/characters/sarah.jpg'),
    'Liam': require('../../assets/characters/liam.jpg'),
    'Emily': require('../../assets/characters/emily.jpg'),
};

export const THERAPISTS = [
    { id: '1', name: 'Marcus', image: THERAPIST_IMAGES['Marcus'] },
    { id: '2', name: 'Sarah', image: THERAPIST_IMAGES['Sarah'] },
    { id: '3', name: 'Liam', image: THERAPIST_IMAGES['Liam'] },
    { id: '4', name: 'Emily', image: THERAPIST_IMAGES['Emily'] },
];
