
export interface TherapyDetail {
    name: string;
    emoji: string;
    tagline: string;
    history: {
        inventor: string;
        year: string;
        context: string;
    };
    corePhilosophy: string;
    whatItHelps: string[];
    techniques: string[];
    interestingFact: string;
}

export const THERAPY_DETAILS: Record<string, TherapyDetail> = {
    'Integrative Therapy (AI decides)': {
        name: 'Integrative Therapy',
        emoji: '✨',
        tagline: 'The best of all worlds, tailored to you.',
        history: {
            inventor: 'Norcross & Goldfried',
            year: '1980s',
            context: 'Realizing that no single approach works for everyone, therapists began combining the most effective elements from different schools of thought.',
        },
        corePhilosophy: 'Flexibility is key. Instead of forcing you into one box, Integrative Therapy draws from CBT, psychodynamic, humanistic, and other approaches to tailor treatment to your specific personality and needs.',
        whatItHelps: ['Complex issues', 'Personal growth', 'Feeling "stuck"', 'Those unsure which therapy to choose'],
        techniques: ['Tailored interventions', 'Holistic perspective', 'Adaptive strategies', 'Client-centered focus'],
        interestingFact: 'Most modern therapists practice some form of integration, naturally blending tools to help their clients best.',
    },
    'Cognitive Behavioral Therapy (CBT)': {
        name: 'Cognitive Behavioral Therapy (CBT)',
        emoji: '🧠',
        tagline: 'Change your thoughts, change your life.',
        history: {
            inventor: 'Aaron Beck',
            year: '1960s',
            context: 'Beck noticed his depressed patients had automatic negative thoughts. He realized identifying and challenging these thoughts could alleviate symptoms.',
        },
        corePhilosophy: 'Our thoughts, feelings, and behaviors are interconnected. By changing negative thought patterns, we can change how we feel and act.',
        whatItHelps: ['Anxiety & Depression', 'Phobias', 'OCD', 'Sleep disorders'],
        techniques: ['Cognitive restructuring', 'Exposure therapy', 'Journaling', 'Behavioral experiments'],
        interestingFact: 'CBT is often considered the "gold standard" of psychotherapy because it is the most researched and empirically supported method.',
    },
    'Acceptance and Commitment Therapy (ACT)': {
        name: 'Acceptance and Commitment Therapy (ACT)',
        emoji: '🌊',
        tagline: 'Embrace your demons and follow your heart.',
        history: {
            inventor: 'Steven Hayes',
            year: '1982',
            context: 'Developed as part of the "third wave" of behavioral therapies, challenging the idea that we must "fix" or eliminate difficult felings to live a good life.',
        },
        corePhilosophy: 'Pain is inevitable, but suffering is optional. Instead of fighting difficult emotions, accept them and commit to actions that align with your deeply held values.',
        whatItHelps: ['Chronic pain', 'Anxiety', 'Depression', 'Substance abuse'],
        techniques: ['Mindfulness', 'Values clarification', 'Defusion (stepping back from thoughts)', 'Committed action'],
        interestingFact: 'ACT uses many metaphors, like comparing our mind to a "passengers on a bus" scenario where we drive despite noisy passengers (thoughts).',
    },
    'Dialectical Behavior Therapy (DBT)': {
        name: 'Dialectical Behavior Therapy (DBT)',
        emoji: '⚖️',
        tagline: 'Building a life worth living.',
        history: {
            inventor: 'Marsha Linehan',
            year: 'Late 1980s',
            context: 'Created initially for borderline personality disorder when standard CBT wasn\'t working. It emphasizes the balance between acceptance and change.',
        },
        corePhilosophy: 'Reason + Emotion = Wise Mind. We must accept ourselves as we are while simultaneously acknowledging the need to change.',
        whatItHelps: ['Borderline Personality Disorder', 'Self-harm', 'Emotional dysregulation', 'Eating disorders'],
        techniques: ['Mindfulness', 'Distress Tolerance', 'Emotion Regulation', 'Interpersonal Effectiveness'],
        interestingFact: 'The term "Dialectical" refers to the synthesis of opposites—specifically the tension between acceptance and change.',
    },
    'Mindfulness-Based Cognitive Therapy (MBCT)': {
        name: 'Mindfulness-Based Cognitive Therapy',
        emoji: '🧘',
        tagline: 'Awareness is the first step to freedom.',
        history: {
            inventor: 'Segal, Williams, and Teasdale',
            year: '2000s',
            context: 'Designed specifically to prevent relapse in people with recurring depression by combining CBT with Jon Kabat-Zinn\'s mindfulness program.',
        },
        corePhilosophy: 'By learning to pay attention to the present moment without judgment, we can disengage from the "autopilot" modes that lead to downward spirals.',
        whatItHelps: ['Recurrent Depression', 'Stress', 'Anxiety'],
        techniques: ['Body scan meditation', 'Three-minute breathing space', 'Mindful movement', 'Decentering'],
        interestingFact: 'Studies show MBCT can be as effective as antidepressants in preventing relapse of depression.',
    },
    'Psychodynamic Therapy': {
        name: 'Psychodynamic Therapy',
        emoji: '🕰️',
        tagline: 'The past is present.',
        history: {
            inventor: 'Derived from Freud',
            year: 'Early 20th Century',
            context: 'Evolved from classic psychoanalysis but made shorter and more focused on current relationships and patterns.',
        },
        corePhilosophy: 'Our unconscious mind and past experiences (especially childhood) silently shape our current behavior and relationships.',
        whatItHelps: ['Relationship patterns', 'Self-awareness', 'Deep-seated emotional pain', 'Complex personality issues'],
        techniques: ['Free association', 'Interpretation', 'Transference analysis', 'Dream work'],
        interestingFact: 'The concept of "defense mechanisms" (like denial or projection) comes from this tradition.',
    },
    'Psychoanalysis': {
        name: 'Psychoanalysis',
        emoji: '🛋️',
        tagline: 'The deep dive into the unconscious.',
        history: {
            inventor: 'Sigmund Freud',
            year: '1890s',
            context: 'The original "talking cure". Freud believed that bringing unconscious conflicts to light leads to catharsis and healing.',
        },
        corePhilosophy: 'Hidden drives and repressed memories govern our lives. True healing comes from making the unconscious conscious.',
        whatItHelps: ['Deeply rooted neuroses', 'Personality disorders', 'Those seeking profound self-understanding'],
        techniques: ['The couch', 'Dream analysis', 'Free association', 'Intensive sessions (3-5x week)'],
        interestingFact: 'Psychoanalysis is one of the oldest forms of therapy and introduced the idea of the Id, Ego, and Superego.',
    },
    'Schema Therapy': {
        name: 'Schema Therapy',
        emoji: '🏗️',
        tagline: 'Rewriting your life\'s blueprint.',
        history: {
            inventor: 'Jeffrey Young',
            year: '1990s',
            context: 'Developed for patients who didn\'t respond to standard CBT. It addresses "schemas"—deep patterns formed in childhood.',
        },
        corePhilosophy: 'We all have unmet childhood needs that create "lifetraps" (schemas). Healing involves meeting these needs and breaking the patterns.',
        whatItHelps: ['Personality disorders', 'Chronic relationship issues', 'Childhood trauma', 'Chronic depression'],
        techniques: ['Limited reparenting', 'Chair work', 'Imagery rescripting', 'Schema diary'],
        interestingFact: 'It identifies 18 specific schemas, such as "Abandonment," "Defectiveness," and "Unrelenting Standards."',
    },
    'Humanistic Therapy': {
        name: 'Humanistic Therapy',
        emoji: '🌱',
        tagline: 'You have everything you need within you.',
        history: {
            inventor: 'Carl Rogers & Abraham Maslow',
            year: '1950s',
            context: 'A reaction against the determinism of psychoanalysis and behaviorism. It emphasizes human potential and free will.',
        },
        corePhilosophy: 'People are inherently good and have a drive toward self-actualization. The therapist provides the right environment (empathy, unconditional regard) for growth.',
        whatItHelps: ['Self-esteem', 'Finding purpose', 'Depression', 'Relationship issues'],
        techniques: ['Active listening', 'Unconditional positive regard', 'Empathy', 'Non-directive approach'],
        interestingFact: 'Carl Rogers coined the term "client" instead of "patient" to equalize the power dynamic.',
    },
    'Gestalt Therapy': {
        name: 'Gestalt Therapy',
        emoji: '🎭',
        tagline: 'Be here. Be now.',
        history: {
            inventor: 'Fritz Perls',
            year: '1940s/50s',
            context: 'Focused on the "whole" person. It emphasizes direct experience over abstract talking.',
        },
        corePhilosophy: 'Change happens when you become who you are, not when you try to become who you are not. Focus on the "here and now".',
        whatItHelps: ['Unfinished business', 'Awareness', 'Integration of self', 'Anxiety'],
        techniques: ['Empty chair technique', 'Role-playing', 'Focusing on body language', '"I" statements'],
        interestingFact: 'Gestalt is famous for the "Empty Chair" technique, where you talk to an empty chair imagining a person or part of yourself is in it.',
    },
    'Emotion-Focused Therapy (EFT)': {
        name: 'Emotion-Focused Therapy (EFT)',
        emoji: '❤️',
        tagline: 'You have to feel it to heal it.',
        history: {
            inventor: 'Leslie Greenberg & Sue Johnson',
            year: '1980s',
            context: 'Recognized that emotions are not just symptoms to be managed, but vital data and the key to transformation.',
        },
        corePhilosophy: 'Emotions are our compass. Maladaptive emotional responses cause pain; replacing them with adaptive ones causes healing.',
        whatItHelps: ['Couples therapy', 'Depression', 'Trauma', 'Emotional numbness'],
        techniques: ['Two-chair dialogue', 'Evocative unfolding', 'Empathic attunement', 'Tracking interaction cycles'],
        interestingFact: 'EFT is considered one of the most effective therapies for couples significantly improving relationship satisfaction.',
    },
    'Systemic / Family Therapy': {
        name: 'Systemic / Family Therapy',
        emoji: '🕸️',
        tagline: 'No person is an island.',
        history: {
            inventor: 'Gregory Bateson, Murray Bowen, et al.',
            year: '1950s',
            context: 'Shifted focus from the individual mind to the web of relationships (the system) in which the person lives.',
        },
        corePhilosophy: 'Problems don\'t exist solely inside a person but are maintained by patterns of interaction within the family or system.',
        whatItHelps: ['Family conflict', 'Child behavioral issues', 'Marital problems', 'Addiction'],
        techniques: ['Genograms (family trees)', 'Circular questioning', 'Reframing', 'Enactments'],
        interestingFact: 'A systemic therapist might view a child\'s "bad behavior" as a symptom of a hidden conflict between the parents.',
    },
    'Somatic Therapy': {
        name: 'Somatic Therapy',
        emoji: '🧘‍♂️',
        tagline: 'The body keeps the score.',
        history: {
            inventor: 'Peter Levine / Wilhelm Reich',
            year: '1970s',
            context: 'The realization that trauma affects the nervous system and body, and talking alone often isn\'t enough to release it.',
        },
        corePhilosophy: 'Trauma gets "stuck" in the body\'s nervous system. Healing requires processing physical sensations to complete the fight/flight/freeze cycle.',
        whatItHelps: ['PTSD', 'Trauma', 'Chronic pain', 'Stress'],
        techniques: ['Grounding', 'Titration', 'Pendulation', 'Body scanning'],
        interestingFact: 'It suggests looking at how animals in the wild shake off trauma (physically shaking) and applying that wisdom to humans.',
    },
    'Image Rehearsal Therapy (IRT)': {
        name: 'Image Rehearsal Therapy',
        emoji: '🌙',
        tagline: 'Rewrite your dreams.',
        history: {
            inventor: 'Barry Krakow',
            year: '1990s',
            context: 'Developed specifically to treat chronic nightmares in PTSD patients, recognizing nightmares as a learned behavior.',
        },
        corePhilosophy: 'Nightmares are a habit. You can "rescript" a nightmare while awake, changing the ending to something positive, and rehearse it to change the dream.',
        whatItHelps: ['Chronic Nightmares', 'PTSD Sleep disturbances'],
        techniques: ['Rescripting dreams', 'Visualization', 'Relaxation training', 'Daily rehearsal'],
        interestingFact: 'It is the only therapy specifically recommended by the American Academy of Sleep Medicine for nightmares.',
    },
    'Sexual Therapy': {
        name: 'Sexual Therapy',
        emoji: '❤️‍🔥',
        tagline: 'Rediscover intimacy and confidence.',
        history: {
            inventor: 'Masters & Johnson',
            year: '1960s',
            context: 'Pioneered the scientific study of human sexuality and developed specific behavioral treatments for sexual dysfunction.',
        },
        corePhilosophy: 'Sexual health is a vital part of overall well-being. It addresses both physical and psychological factors in a safe, judgment-free space to improve intimacy.',
        whatItHelps: ['Intimacy issues', 'Low libido', 'Performance anxiety', 'Communication'],
        techniques: ['Sensate focus', 'Psychoeducation', 'Communication skills', 'Cognitive restructuring'],
        interestingFact: 'Contrary to myths, it is strictly talk therapy—no sexual acts occur in the therapist\'s office.',
    },
    'Child and Adolescent Therapy': {
        name: 'Child and Adolescent Therapy',
        emoji: '🪁',
        tagline: 'Growing through understanding.',
        corePhilosophy: 'Young minds are not just small adult minds; they require specialized approaches that respect developmental stages. This therapy uses play, art, and talk to help young people process emotions, build resilience, and navigate the complex journey of growing up.',
        history: {
            inventor: 'Anna Freud / Melanie Klein',
            year: '1920s',
            context: 'Pioneered the use of play as a way to access the unconscious and emotional worlds of children, distinct from adult analysis.'
        },
        whatItHelps: [
            'Developmental Challenges',
            'School Anxiety',
            'Family Changes',
            'Behavioral Issues',
            'Identity Formation'
        ],
        techniques: [
            'Play Therapy',
            'Art & Creative Expression',
            'Family System Involvement',
            'Skill Building (Coping)',
            'Narrative Storytelling'
        ],
        interestingFact: 'In Play Therapy, toys are viewed as the child\'s words and play as their language, allowing them to express what they cannot say verbally.'
    },
};
