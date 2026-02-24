export const THERAPIST_IMAGES: Record<string, any> = {
    'Marcus': require('../../assets/characters/marcus.jpg'),
    'Sarah': require('../../assets/characters/sarah.jpg'),
    'Liam': require('../../assets/characters/liam.jpg'),
    'Emily': require('../../assets/characters/emily.jpg'),
};

export const THERAPIST_PHILOSOPHIES: Record<string, string> = {
    'Marcus': 'Your thoughts shape your reality — let\'s reshape them together.',
    'Sarah': 'Healing begins when someone truly sees you.',
    'Liam': 'Small changes in behavior create big shifts in how you feel.',
    'Emily': 'The answers you\'re looking for are already within you.',
};

// Greeting templates per character — {FREE_LINE} is replaced with the free-trial sentence
// or removed for Pro users. {CTA} is replaced with the closing question.
export const THERAPIST_GREETINGS: Record<string, { free: string; pro: string }> = {
    'Marcus': {
        free: `Hi, I'm Marcus!\n\nYour thoughts shape your reality, and I'm here to help you reshape them. I'm not a therapist, but I was built by psychologists as your mental health companion. I adapt to your needs and use real psychological approaches, not just generic AI responses. The first session with me is currently free. If it helps you, I'd be happy about your support. Your trust matters to me: everything you share here stays private & secure.\n\nDo you want to start your onboarding?`,
        pro: `Hi, I'm Marcus!\n\nYour thoughts shape your reality, and I'm here to help you reshape them. I'm not a therapist, but I was built by psychologists as your mental health companion. I adapt to your needs and use real psychological approaches, not just generic AI responses. Your trust matters to me: everything you share here stays private & secure.\n\nWhat's on your mind?`,
    },
    'Sarah': {
        free: `Hi, I'm Sarah!\n\nHealing begins when someone truly sees you, and that's what I'm here for. I'm not a therapist, but I was developed by psychologists as a companion who listens and adapts to you. Unlike generic AI, I draw on real psychological approaches to support you more meaningfully. The first session with me is currently free. If it helps you, I'd be happy about your support. Everything you share here is private & secure.\n\nDo you want to start your onboarding?`,
        pro: `Hi, I'm Sarah!\n\nHealing begins when someone truly sees you, and that's what I'm here for. I'm not a therapist, but I was developed by psychologists as a companion who listens and adapts to you. Unlike generic AI, I draw on real psychological approaches to support you more meaningfully. Everything you share here is private & secure.\n\nWhat's on your mind?`,
    },
    'Liam': {
        free: `Hi, I'm Liam!\n\nSmall changes in behavior create big shifts in how you feel, and I'm here to help you find them. I'm not a therapist, but I was developed by psychologists to be your mental health companion. I use real psychological approaches tailored to you, not generic chatbot responses. The first session with me is currently free. If it helps you, I'd be happy about your support. Everything you share here stays private & secure.\n\nDo you want to start your onboarding?`,
        pro: `Hi, I'm Liam!\n\nSmall changes in behavior create big shifts in how you feel, and I'm here to help you find them. I'm not a therapist, but I was developed by psychologists to be your mental health companion. I use real psychological approaches tailored to you, not generic chatbot responses. Everything you share here stays private & secure.\n\nWhat's on your mind?`,
    },
    'Emily': {
        free: `Hi, I'm Emily!\n\nThe answers you're looking for are already within you. I'm here to help you find them. I'm not a therapist, but I was created by psychologists as a companion for your mental health. I adapt to you and draw on various psychological approaches to support you in a way that generic AI simply can't. The first session with me is currently free. If it helps you, I'd be happy about your support. Everything you share here remains private & secure.\n\nDo you want to start your onboarding?`,
        pro: `Hi, I'm Emily!\n\nThe answers you're looking for are already within you. I'm here to help you find them. I'm not a therapist, but I was created by psychologists as a companion for your mental health. I adapt to you and draw on various psychological approaches to support you in a way that generic AI simply can't. Everything you share here remains private & secure.\n\nWhat's on your mind?`,
    },
};

export const THERAPISTS = [
    { id: '1', name: 'Marcus', image: THERAPIST_IMAGES['Marcus'], philosophy: THERAPIST_PHILOSOPHIES['Marcus'] },
    { id: '2', name: 'Sarah', image: THERAPIST_IMAGES['Sarah'], philosophy: THERAPIST_PHILOSOPHIES['Sarah'] },
    { id: '3', name: 'Liam', image: THERAPIST_IMAGES['Liam'], philosophy: THERAPIST_PHILOSOPHIES['Liam'] },
    { id: '4', name: 'Emily', image: THERAPIST_IMAGES['Emily'], philosophy: THERAPIST_PHILOSOPHIES['Emily'] },
];
