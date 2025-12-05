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
];

export const ALL_THERAPY_OPTIONS = [INTEGRATIVE_OPTION, ...THERAPY_CATEGORIES];
