export interface Character {
    id: string;
    name: string;
    image: any; // Can be string URL or require() result
    description: string;
    type: 'human' | 'animal' | 'creature';
}

export interface Topic {
    id: string;
    title: string;
    characters: Character[];
}

export interface ChatConversation {
    id: string;
    characterId: string;
    characterName: string;
    characterImage: any; // Can be string URL or require() result
    lastMessage: string;
    timestamp: string;
}

export const TOPICS: Topic[] = [
    {
        id: 'sleep',
        title: 'Sleep better',
        characters: [
            {
                id: 'sleep-1',
                name: 'Dr. Morpheus',
                image: '/characters/Dr. Morpheus.jpg',
                description: 'Ancient dream wizard specializing in sleep cycles and restful nights.',
                type: 'creature',
            },
            {
                id: 'sleep-2',
                name: 'Luna Starlight',
                image: '/characters/Luna Starlight.jpg',
                description: 'Gentle sleep therapist who helps you find peace in the night.',
                type: 'human',
            },
            {
                id: 'sleep-3',
                name: 'Sleepy Bear',
                image: '/characters/Sleepy Bear.jpg',
                description: 'Cozy hibernation expert who knows all about deep, restorative sleep.',
                type: 'animal',
            },
            {
                id: 'sleep-4',
                name: 'Dr. Nightingale',
                image: '/characters/Dr. Nightingale.jpg',
                description: 'Compassionate sleep medicine specialist with 20 years experience.',
                type: 'human',
            },
            {
                id: 'sleep-5',
                name: 'Midnight Cat',
                image: '/characters/Midnight Cat.jpg',
                description: 'Wise feline who teaches the art of perfect napping and night routines.',
                type: 'animal',
            },
            {
                id: 'sleep-6',
                name: 'Sandman',
                image: '/characters/Sandman.jpg',
                description: 'Mystical being who brings peaceful dreams and restful slumber.',
                type: 'creature',
            },
        ],
    },
    {
        id: 'performance',
        title: 'Enhance performance',
        characters: [
            {
                id: 'perf-1',
                name: 'Coach Thunder',
                image: '/characters/Coach Thunder.jpg',
                description: 'High-energy performance coach who pushes you to your peak.',
                type: 'human',
            },
            {
                id: 'perf-2',
                name: 'Eagle Eye',
                image: '/characters/Eagle Eye.jpg',
                description: 'Sharp-focused bird who helps you see opportunities from above.',
                type: 'animal',
            },
            {
                id: 'perf-3',
                name: 'Athena',
                image: '/characters/athena.jpg',
                description: 'Goddess of wisdom and strategic thinking for optimal performance.',
                type: 'creature',
            },
            {
                id: 'perf-4',
                name: 'Marcus Flow',
                image: '/characters/Marcus Flow.jpg',
                description: 'Peak performance psychologist specializing in flow states.',
                type: 'human',
            },
            {
                id: 'perf-5',
                name: 'Cheetah Sprint',
                image: '/characters/Cheetah Sprint.jpg',
                description: 'Speed and efficiency expert who teaches rapid execution.',
                type: 'animal',
            },
            {
                id: 'perf-6',
                name: 'Phoenix Rising',
                image: '/characters/Phoenix Rising.jpg',
                description: 'Mythical guide for transformation and rebirth in your career.',
                type: 'creature',
            },
        ],
    },
    {
        id: 'self-worth',
        title: 'Develop self-worth',
        characters: [
            {
                id: 'worth-1',
                name: 'Dr. Grace Chen',
                image: '/characters/Dr. Grace Chen.jpg',
                description: 'Compassionate therapist specializing in self-esteem and self-love.',
                type: 'human',
            },
            {
                id: 'worth-2',
                name: 'Golden Lion',
                image: '/characters/Golden Lion.jpg',
                description: 'Majestic lion who teaches you to recognize your inner strength.',
                type: 'animal',
            },
            {
                id: 'worth-3',
                name: 'Mirror Sage',
                image: '/characters/Mirror Sage.jpg',
                description: 'Ancient wizard who helps you see your true worth reflected back.',
                type: 'creature',
            },
            {
                id: 'worth-4',
                name: 'Sofia Bright',
                image: '/characters/Sofia Bright.jpg',
                description: 'Warm counselor who guides you to embrace your authentic self.',
                type: 'human',
            },
            {
                id: 'worth-5',
                name: 'Proud Peacock',
                image: '/characters/Proud Peacock.jpg',
                description: 'Colorful bird who teaches healthy pride and self-appreciation.',
                type: 'animal',
            },
            {
                id: 'worth-6',
                name: 'Inner Light',
                image: '/characters/Inner Light.jpg',
                description: 'Ethereal being who illuminates your inherent value and worth.',
                type: 'creature',
            },
        ],
    },
    {
        id: 'fears',
        title: 'Lose fears',
        characters: [
            {
                id: 'fear-1',
                name: 'Brave Knight',
                image: '/characters/Brave Knight.jpg',
                description: 'Courageous warrior who helps you face your dragons.',
                type: 'creature',
            },
            {
                id: 'fear-2',
                name: 'Dr. Courage',
                image: '/characters/Dr. Courage.jpg',
                description: 'Anxiety specialist who teaches evidence-based fear reduction.',
                type: 'human',
            },
            {
                id: 'fear-3',
                name: 'Fearless Wolf',
                image: '/characters/Fearless Wolf.jpg',
                description: 'Pack leader who shows you strength in vulnerability.',
                type: 'animal',
            },
            {
                id: 'fear-4',
                name: 'Maya Calm',
                image: '/characters/Maya Calm.jpg',
                description: 'Gentle therapist specializing in phobias and anxiety disorders.',
                type: 'human',
            },
            {
                id: 'fear-5',
                name: 'Wise Owl',
                image: '/characters/Wise Owl.jpg',
                description: 'Night guardian who helps you see clearly through the darkness.',
                type: 'animal',
            },
            {
                id: 'fear-6',
                name: 'Shadow Walker',
                image: '/characters/Shadow Walker.jpg',
                description: 'Mystical guide who helps you befriend your fears.',
                type: 'creature',
            },
        ],
    },
    {
        id: 'stress',
        title: 'Reduce stress',
        characters: [
            {
                id: 'stress-1',
                name: 'Zen Master',
                image: '/characters/Zen Master.jpg',
                description: 'Ancient monk who teaches mindfulness and inner peace.',
                type: 'creature',
            },
            {
                id: 'stress-2',
                name: 'Dr. Serenity',
                image: '/characters/Dr. Serenity.jpg',
                description: 'Stress management expert with holistic healing approach.',
                type: 'human',
            },
            {
                id: 'stress-3',
                name: 'Calm Dolphin',
                image: '/characters/Calm Dolphin.jpg',
                description: 'Playful ocean dweller who teaches flow and relaxation.',
                type: 'animal',
            },
            {
                id: 'stress-4',
                name: 'River Stone',
                image: '/characters/River Stone.jpg',
                description: 'Grounded counselor who helps you find stillness in chaos.',
                type: 'human',
            },
            {
                id: 'stress-5',
                name: 'Lazy Sloth',
                image: '/characters/Lazy Sloth.jpg',
                description: 'Slow-living expert who teaches the art of doing less.',
                type: 'animal',
            },
            {
                id: 'stress-6',
                name: 'Cloud Spirit',
                image: '/characters/Cloud Spirit.jpg',
                description: 'Ethereal being who helps you let worries drift away.',
                type: 'creature',
            },
        ],
    },
    {
        id: 'happier',
        title: 'Be happier',
        characters: [
            {
                id: 'happy-1',
                name: 'Joy Spark',
                image: '/characters/Joy Spark.jpg',
                description: 'Radiant fairy who spreads happiness and positive energy.',
                type: 'creature',
            },
            {
                id: 'happy-2',
                name: 'Dr. Sunshine',
                image: '/characters/Dr. Sunshine.jpg',
                description: 'Positive psychology expert who teaches sustainable happiness.',
                type: 'human',
            },
            {
                id: 'happy-3',
                name: 'Happy Puppy',
                image: '/characters/Happy Puppy.jpg',
                description: 'Joyful dog who shows you how to find delight in simple things.',
                type: 'animal',
            },
            {
                id: 'happy-4',
                name: 'Lily Bloom',
                image: '/characters/Lily Bloom.jpg',
                description: 'Cheerful therapist who helps you cultivate daily joy.',
                type: 'human',
            },
            {
                id: 'happy-5',
                name: 'Singing Bird',
                image: '/characters/Singing Bird.jpg',
                description: 'Melodious songbird who teaches you to celebrate each moment.',
                type: 'animal',
            },
            {
                id: 'happy-6',
                name: 'Rainbow Wizard',
                image: '/characters/Rainbow Wizard.jpg',
                description: 'Colorful mage who helps you see beauty in every situation.',
                type: 'creature',
            },
        ],
    },
    {
        id: 'grateful',
        title: 'Be more grateful',
        characters: [
            {
                id: 'grat-1',
                name: 'Dr. Thankful',
                image: '/characters/Dr. Thankful.jpg',
                description: 'Gratitude researcher who teaches appreciation practices.',
                type: 'human',
            },
            {
                id: 'grat-2',
                name: 'Harvest Bear',
                image: '/characters/Harvest Bear.jpg',
                description: 'Wise bear who appreciates nature\'s abundance and blessings.',
                type: 'animal',
            },
            {
                id: 'grat-3',
                name: 'Blessing Angel',
                image: '/characters/Blessing Angel.jpg',
                description: 'Divine messenger who helps you count your blessings.',
                type: 'creature',
            },
            {
                id: 'grat-4',
                name: 'Grace Waters',
                image: '/characters/Grace Waters.jpg',
                description: 'Mindfulness coach specializing in gratitude meditation.',
                type: 'human',
            },
            {
                id: 'grat-5',
                name: 'Thankful Turtle',
                image: '/characters/Thankful Turtle.jpg',
                description: 'Patient turtle who teaches slow appreciation of life\'s gifts.',
                type: 'animal',
            },
            {
                id: 'grat-6',
                name: 'Abundance Elf',
                image: '/characters/Abundance Elf.jpg',
                description: 'Magical being who reveals the richness already in your life.',
                type: 'creature',
            },
        ],
    },
];

export const MOCK_CHATS: ChatConversation[] = [
    {
        id: 'chat-1',
        characterId: 'sleep-1',
        characterName: 'Dr. Morpheus',
        characterImage: '/characters/Dr. Morpheus.jpg',
        lastMessage: 'Let\'s work on your sleep schedule tonight...',
        timestamp: '2 hours ago',
    },
    {
        id: 'chat-2',
        characterId: 'happy-3',
        characterName: 'Happy Puppy',
        characterImage: '/characters/Happy Puppy.jpg',
        lastMessage: 'What made you smile today?',
        timestamp: 'Yesterday',
    },
    {
        id: 'chat-3',
        characterId: 'stress-1',
        characterName: 'Zen Master',
        characterImage: '/characters/Zen Master.jpg',
        lastMessage: 'Remember to breathe deeply...',
        timestamp: '3 days ago',
    },
];
