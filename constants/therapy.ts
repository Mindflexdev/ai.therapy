export const INTEGRATIVE_OPTION = {
    category: 'Recommended for You',
    styles: [
        {
            name: 'Integrative Therapy (AI decides)',
            description: 'Let the AI choose the best therapy approach based on your needs and the conversation context. Flexible and adaptive.'
        }
    ]
};

export const THERAPY_CATEGORIES = [
    {
        category: 'Cognitive & Behavioral',
        styles: [
            {
                name: 'Cognitive Behavioral Therapy (CBT)',
                description: 'Focus on changing negative thought patterns and behaviors. Best for anxiety, depression, and practical problem-solving.'
            },
            {
                name: 'Acceptance and Commitment Therapy (ACT)',
                description: 'Learn to accept difficult emotions while taking action toward your values. Great for psychological flexibility.'
            },
            {
                name: 'Dialectical Behavior Therapy (DBT)',
                description: 'Build skills for emotional regulation, distress tolerance, and relationships. Especially helpful for intense emotions.'
            },
            {
                name: 'Mindfulness-Based Cognitive Therapy (MBCT)',
                description: 'Combines mindfulness with CBT to prevent relapse and increase present-moment awareness.'
            },
        ]
    },
    {
        category: 'Depth & Insight',
        styles: [
            {
                name: 'Psychodynamic Therapy',
                description: 'Explore unconscious patterns and past experiences. Understand how your history shapes your present.'
            },
            {
                name: 'Psychoanalysis',
                description: 'Deep exploration of unconscious mind, dreams, and early relationships. Long-term, intensive work.'
            },
            {
                name: 'Schema Therapy',
                description: 'Identify and change deeply rooted life patterns formed in childhood. Integrative and transformative.'
            },
        ]
    },
    {
        category: 'Humanistic & Experiential',
        styles: [
            {
                name: 'Humanistic Therapy',
                description: 'Focus on personal growth, self-actualization, and inherent human potential. Client-centered approach.'
            },
            {
                name: 'Gestalt Therapy',
                description: 'Increase awareness of present experience and personal responsibility. "Here and now" focus.'
            },
            {
                name: 'Emotion-Focused Therapy (EFT)',
                description: 'Transform emotional experiences and build emotional intelligence. Great for relationship issues.'
            },
        ]
    },
    {
        category: 'Relational & Systemic',
        styles: [
            {
                name: 'Systemic / Family Therapy',
                description: 'Understand relationships and family dynamics. See problems in context of larger systems.'
            },
        ]
    },
    {
        category: 'Body & Trauma',
        styles: [
            {
                name: 'Somatic Therapy',
                description: 'Work with body sensations and physical experience. Heal trauma stored in the body.'
            },
            {
                name: 'Image Rehearsal Therapy (IRT)',
                description: 'A cognitive-behavioral treatment for reducing the frequency and intensity of nightmares.'
            },
        ]
    },
    {
        category: 'Specialized & Age-Specific',
        styles: [
            {
                name: 'Sexual Therapy',
                description: 'Address sexual concerns, intimacy issues, and sexual health in a safe, non-judgmental space.'
            },
            {
                name: 'Child and Adolescent Therapy',
                description: 'Support for young people traversing developmental stages, behavioral challenges, and identity formation.'
            },
        ]
    },
];

export const ALL_THERAPY_OPTIONS = [INTEGRATIVE_OPTION, ...THERAPY_CATEGORIES];

export const STYLE_ABBREVIATIONS: Record<string, string> = {
    'Integrative Therapy (AI decides)': 'Integrative',
    'Cognitive Behavioral Therapy (CBT)': 'CBT',
    'Acceptance and Commitment Therapy (ACT)': 'ACT',
    'Dialectical Behavior Therapy (DBT)': 'DBT',
    'Mindfulness-Based Cognitive Therapy (MBCT)': 'MBCT',
    'Psychodynamic Therapy': 'Psychodynamic',
    'Psychoanalysis': 'Psychoanalysis',
    'Schema Therapy': 'Schema',
    'Humanistic Therapy': 'Humanistic',
    'Gestalt Therapy': 'Gestalt',
    'Emotion-Focused Therapy (EFT)': 'EFT',
    'Systemic / Family Therapy': 'Systemic',
    'Somatic Therapy': 'Somatic',
    'Image Rehearsal Therapy (IRT)': 'IRT',
    'Sexual Therapy': 'Sexual Therapy',
    'Child and Adolescent Therapy': 'Child & Adolescent',
};

// Reverse lookup: abbreviation -> full name
export const ABBREVIATION_TO_FULL: Record<string, string> = Object.fromEntries(
    Object.entries(STYLE_ABBREVIATIONS).map(([full, abbr]) => [abbr, full])
);

