import { LOCALE } from './Locale';

export const THERAPIST_IMAGES: Record<string, any> = {
    'Marcus': require('../../assets/characters/marcus.jpg'),
    'Sarah': require('../../assets/characters/sarah.jpg'),
    'Liam': require('../../assets/characters/liam.jpg'),
    'Emily': require('../../assets/characters/emily.jpg'),
};

export const THERAPIST_PHILOSOPHIES: Record<string, { en: string; de: string }> = {
    'Marcus': {
        en: 'Your thoughts shape your reality — let\'s reshape them together.',
        de: 'Deine Gedanken formen deine Realit\u00E4t \u2014 lass sie uns gemeinsam ver\u00E4ndern.',
    },
    'Sarah': {
        en: 'Healing begins when someone truly sees you.',
        de: 'Heilung beginnt, wenn dich jemand wirklich sieht.',
    },
    'Liam': {
        en: 'Small changes in behavior create big shifts in how you feel.',
        de: 'Kleine Ver\u00E4nderungen im Verhalten bewirken gro\u00DFe Ver\u00E4nderungen in deinem Empfinden.',
    },
    'Emily': {
        en: 'The answers you\'re looking for are already within you.',
        de: 'Die Antworten, die du suchst, sind bereits in dir.',
    },
};

// Helper to get the philosophy string for the current locale
export const getPhilosophy = (name: string): string =>
    THERAPIST_PHILOSOPHIES[name]?.[LOCALE] || THERAPIST_PHILOSOPHIES[name]?.en || '';

// Greeting templates per character — locale-aware
export const THERAPIST_GREETINGS: Record<string, { free: { en: string; de: string }; pro: { en: string; de: string } }> = {
    'Marcus': {
        free: {
            en: `Hi, I'm Marcus!\n\nYour thoughts shape your reality, and I'm here to help you reshape them. I'm not a therapist, but I was built by psychologists as your mental health companion. I adapt to your needs and use real psychological approaches, not just generic AI responses. The first session with me is currently free. If it helps you, I'd be happy about your support. Your trust matters to me: everything you share here stays private & secure.\n\nDo you want to start your onboarding?`,
            de: `Hi, ich bin Marcus!\n\nDeine Gedanken formen deine Realit\u00E4t, und ich bin hier, um sie mit dir zu ver\u00E4ndern. Ich bin kein Therapeut, aber ich wurde von Psychologen als dein Begleiter f\u00FCr mentale Gesundheit entwickelt. Ich passe mich deinen Bed\u00FCrfnissen an und nutze echte psychologische Ans\u00E4tze \u2014 keine generischen KI-Antworten. Die erste Sitzung mit mir ist aktuell kostenlos. Wenn sie dir hilft, freue ich mich \u00FCber deine Unterst\u00FCtzung. Dein Vertrauen ist mir wichtig: Alles, was du hier teilst, bleibt privat & sicher.\n\nM\u00F6chtest du dein Onboarding starten?`,
        },
        pro: {
            en: `Hi, I'm Marcus!\n\nYour thoughts shape your reality, and I'm here to help you reshape them. I'm not a therapist, but I was built by psychologists as your mental health companion. I adapt to your needs and use real psychological approaches, not just generic AI responses. Your trust matters to me: everything you share here stays private & secure.\n\nWhat's on your mind?`,
            de: `Hi, ich bin Marcus!\n\nDeine Gedanken formen deine Realit\u00E4t, und ich bin hier, um sie mit dir zu ver\u00E4ndern. Ich bin kein Therapeut, aber ich wurde von Psychologen als dein Begleiter f\u00FCr mentale Gesundheit entwickelt. Ich passe mich deinen Bed\u00FCrfnissen an und nutze echte psychologische Ans\u00E4tze \u2014 keine generischen KI-Antworten. Dein Vertrauen ist mir wichtig: Alles, was du hier teilst, bleibt privat & sicher.\n\nWas besch\u00E4ftigt dich?`,
        },
    },
    'Sarah': {
        free: {
            en: `Hi, I'm Sarah!\n\nHealing begins when someone truly sees you, and that's what I'm here for. I'm not a therapist, but I was developed by psychologists as a companion who listens and adapts to you. Unlike generic AI, I draw on real psychological approaches to support you more meaningfully. The first session with me is currently free. If it helps you, I'd be happy about your support. Everything you share here is private & secure.\n\nDo you want to start your onboarding?`,
            de: `Hi, ich bin Sarah!\n\nHeilung beginnt, wenn dich jemand wirklich sieht \u2014 und genau daf\u00FCr bin ich hier. Ich bin keine Therapeutin, aber ich wurde von Psychologen als Begleiterin entwickelt, die zuh\u00F6rt und sich an dich anpasst. Anders als generische KI nutze ich echte psychologische Ans\u00E4tze, um dich wirkungsvoller zu unterst\u00FCtzen. Die erste Sitzung mit mir ist aktuell kostenlos. Wenn sie dir hilft, freue ich mich \u00FCber deine Unterst\u00FCtzung. Alles, was du hier teilst, bleibt privat & sicher.\n\nM\u00F6chtest du dein Onboarding starten?`,
        },
        pro: {
            en: `Hi, I'm Sarah!\n\nHealing begins when someone truly sees you, and that's what I'm here for. I'm not a therapist, but I was developed by psychologists as a companion who listens and adapts to you. Unlike generic AI, I draw on real psychological approaches to support you more meaningfully. Everything you share here is private & secure.\n\nWhat's on your mind?`,
            de: `Hi, ich bin Sarah!\n\nHeilung beginnt, wenn dich jemand wirklich sieht \u2014 und genau daf\u00FCr bin ich hier. Ich bin keine Therapeutin, aber ich wurde von Psychologen als Begleiterin entwickelt, die zuh\u00F6rt und sich an dich anpasst. Anders als generische KI nutze ich echte psychologische Ans\u00E4tze, um dich wirkungsvoller zu unterst\u00FCtzen. Alles, was du hier teilst, bleibt privat & sicher.\n\nWas besch\u00E4ftigt dich?`,
        },
    },
    'Liam': {
        free: {
            en: `Hi, I'm Liam!\n\nSmall changes in behavior create big shifts in how you feel, and I'm here to help you find them. I'm not a therapist, but I was developed by psychologists to be your mental health companion. I use real psychological approaches tailored to you, not generic chatbot responses. The first session with me is currently free. If it helps you, I'd be happy about your support. Everything you share here stays private & secure.\n\nDo you want to start your onboarding?`,
            de: `Hi, ich bin Liam!\n\nKleine Ver\u00E4nderungen im Verhalten bewirken gro\u00DFe Ver\u00E4nderungen in deinem Empfinden \u2014 und ich bin hier, um sie mit dir zu finden. Ich bin kein Therapeut, aber ich wurde von Psychologen als dein Begleiter f\u00FCr mentale Gesundheit entwickelt. Ich nutze echte psychologische Ans\u00E4tze, die auf dich zugeschnitten sind \u2014 keine generischen Chatbot-Antworten. Die erste Sitzung mit mir ist aktuell kostenlos. Wenn sie dir hilft, freue ich mich \u00FCber deine Unterst\u00FCtzung. Alles, was du hier teilst, bleibt privat & sicher.\n\nM\u00F6chtest du dein Onboarding starten?`,
        },
        pro: {
            en: `Hi, I'm Liam!\n\nSmall changes in behavior create big shifts in how you feel, and I'm here to help you find them. I'm not a therapist, but I was developed by psychologists to be your mental health companion. I use real psychological approaches tailored to you, not generic chatbot responses. Everything you share here stays private & secure.\n\nWhat's on your mind?`,
            de: `Hi, ich bin Liam!\n\nKleine Ver\u00E4nderungen im Verhalten bewirken gro\u00DFe Ver\u00E4nderungen in deinem Empfinden \u2014 und ich bin hier, um sie mit dir zu finden. Ich bin kein Therapeut, aber ich wurde von Psychologen als dein Begleiter f\u00FCr mentale Gesundheit entwickelt. Ich nutze echte psychologische Ans\u00E4tze, die auf dich zugeschnitten sind \u2014 keine generischen Chatbot-Antworten. Alles, was du hier teilst, bleibt privat & sicher.\n\nWas besch\u00E4ftigt dich?`,
        },
    },
    'Emily': {
        free: {
            en: `Hi, I'm Emily!\n\nThe answers you're looking for are already within you. I'm here to help you find them. I'm not a therapist, but I was created by psychologists as a companion for your mental health. I adapt to you and draw on various psychological approaches to support you in a way that generic AI simply can't. The first session with me is currently free. If it helps you, I'd be happy about your support. Everything you share here remains private & secure.\n\nDo you want to start your onboarding?`,
            de: `Hi, ich bin Emily!\n\nDie Antworten, die du suchst, sind bereits in dir. Ich bin hier, um dir zu helfen, sie zu finden. Ich bin keine Therapeutin, aber ich wurde von Psychologen als Begleiterin f\u00FCr deine mentale Gesundheit entwickelt. Ich passe mich an dich an und nutze verschiedene psychologische Ans\u00E4tze, um dich auf eine Weise zu unterst\u00FCtzen, die generische KI einfach nicht kann. Die erste Sitzung mit mir ist aktuell kostenlos. Wenn sie dir hilft, freue ich mich \u00FCber deine Unterst\u00FCtzung. Alles, was du hier teilst, bleibt privat & sicher.\n\nM\u00F6chtest du dein Onboarding starten?`,
        },
        pro: {
            en: `Hi, I'm Emily!\n\nThe answers you're looking for are already within you. I'm here to help you find them. I'm not a therapist, but I was created by psychologists as a companion for your mental health. I adapt to you and draw on various psychological approaches to support you in a way that generic AI simply can't. Everything you share here remains private & secure.\n\nWhat's on your mind?`,
            de: `Hi, ich bin Emily!\n\nDie Antworten, die du suchst, sind bereits in dir. Ich bin hier, um dir zu helfen, sie zu finden. Ich bin keine Therapeutin, aber ich wurde von Psychologen als Begleiterin f\u00FCr deine mentale Gesundheit entwickelt. Ich passe mich an dich an und nutze verschiedene psychologische Ans\u00E4tze, um dich auf eine Weise zu unterst\u00FCtzen, die generische KI einfach nicht kann. Alles, was du hier teilst, bleibt privat & sicher.\n\nWas besch\u00E4ftigt dich?`,
        },
    },
};

// Helper to get the greeting for the current locale
export const getGreeting = (name: string, isPro: boolean): string => {
    const greeting = THERAPIST_GREETINGS[name];
    if (!greeting) return '';
    return isPro
        ? (greeting.pro[LOCALE] || greeting.pro.en)
        : (greeting.free[LOCALE] || greeting.free.en);
};

export const THERAPISTS = [
    { id: '1', name: 'Marcus', image: THERAPIST_IMAGES['Marcus'], philosophy: getPhilosophy('Marcus') },
    { id: '2', name: 'Sarah', image: THERAPIST_IMAGES['Sarah'], philosophy: getPhilosophy('Sarah') },
    { id: '3', name: 'Liam', image: THERAPIST_IMAGES['Liam'], philosophy: getPhilosophy('Liam') },
    { id: '4', name: 'Emily', image: THERAPIST_IMAGES['Emily'], philosophy: getPhilosophy('Emily') },
];
