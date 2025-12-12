// ===== ai.therapy Landing Page JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    // initLangToggle(); - REMOVED
    initGoalTabs();
    initFloatingElements();
    initTherapyCards();
    initEngineControls();
    initCreationControls();
    initSmoothScroll();
    initCarouselScroll();
});

// ===== Theme Toggle =====
function initThemeToggle() {
    // Check for saved preference - default to LIGHT mode
    const savedTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme (always, even if toggle is hidden)
    // Dark is default in CSS now, so we add 'light-mode' class if theme is light
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    // If toggle element exists, set up interactivity
    const toggleContainer = document.getElementById('themeToggle');
    if (!toggleContainer) return;

    const icons = toggleContainer.querySelectorAll('.theme-icon');

    // Set initial active state
    icons.forEach(icon => {
        icon.classList.toggle('active', icon.dataset.theme === savedTheme);
    });

    // Add click handlers to each icon
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            const newTheme = icon.dataset.theme;
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';

            if (newTheme === currentTheme) return; // Already active

            // Toggle theme
            document.body.classList.toggle('light-mode');

            // Update active states
            icons.forEach(i => i.classList.toggle('active', i.dataset.theme === newTheme));

            // Save preference
            localStorage.setItem('theme', newTheme);
        });
    });
}





// Character descriptions
const characterDescTranslations = {};



// ===== Shared Data & Modal Logic =====
// Define therapyData globally so both cards and engine can access it
const therapyData = {
    cbt: {
        title: 'Cognitive Behavioral Therapy (CBT)',
        tagline: '"Change your thoughts, change your life."',
        whatIsIt: 'Our thoughts, feelings, and behaviors are interconnected. By changing negative thought patterns, we can change how we feel and act.',
        inventor: 'Aaron Beck',
        era: '1960s',
        originDesc: 'Beck noticed his depressed patients had automatic negative thoughts. He realized identifying and challenging these thoughts could alleviate symptoms.',
        bestFor: ['Anxiety & Depression', 'Phobias', 'OCD', 'Sleep disorders'],
        techniques: ['Cognitive restructuring', 'Exposure therapy', 'Behavioral experiments', 'Thought records']
    },
    act: {
        title: 'Acceptance & Commitment Therapy (ACT)',
        tagline: '"Embrace what you cannot change, commit to what you value."',
        whatIsIt: 'ACT helps you accept difficult thoughts and feelings rather than fighting them, while taking action aligned with your values.',
        inventor: 'Steven C. Hayes',
        era: '1980s',
        originDesc: 'Hayes developed ACT as a form of clinical behavior analysis, combining acceptance and mindfulness strategies with commitment and behavior-change strategies.',
        bestFor: ['Anxiety', 'Depression', 'Chronic pain', 'Stress management'],
        techniques: ['Mindfulness', 'Values clarification', 'Cognitive defusion', 'Committed action']
    },
    dbt: {
        title: 'Dialectical Behavior Therapy (DBT)',
        tagline: '"Finding balance between acceptance and change."',
        whatIsIt: 'DBT combines cognitive-behavioral techniques with concepts of mindfulness and acceptance, helping you manage intense emotions.',
        inventor: 'Marsha M. Linehan',
        era: '1980s',
        originDesc: 'Linehan developed DBT specifically for treating borderline personality disorder, incorporating zen practices with behavioral science.',
        bestFor: ['Borderline personality', 'Self-harm', 'Emotional dysregulation', 'Relationship issues'],
        techniques: ['Distress tolerance', 'Emotion regulation', 'Interpersonal effectiveness', 'Mindfulness skills']
    },
    psychodynamic: {
        title: 'Psychodynamic Therapy',
        tagline: '"Understanding the past to transform the present."',
        whatIsIt: 'Explores how unconscious thoughts and past experiences shape current behavior and relationships.',
        inventor: 'Sigmund Freud (foundations)',
        era: 'Early 1900s',
        originDesc: 'Evolved from psychoanalysis, focusing on unconscious processes and their influence on behavior through the therapeutic relationship.',
        bestFor: ['Depression', 'Anxiety', 'Relationship patterns', 'Identity issues'],
        techniques: ['Free association', 'Dream analysis', 'Transference exploration', 'Insight development']
    },
    humanistic: {
        title: 'Humanistic/Person-Centered Therapy',
        tagline: '"You have within you the resources for growth."',
        whatIsIt: 'Focuses on personal growth and self-actualization, believing people are inherently good and capable of making rational choices.',
        inventor: 'Carl Rogers',
        era: '1950s',
        originDesc: 'Rogers believed that given the right conditions—empathy, unconditional positive regard, and genuineness—people naturally move toward growth.',
        bestFor: ['Self-esteem issues', 'Life transitions', 'Personal growth', 'Relationship problems'],
        techniques: ['Active listening', 'Unconditional positive regard', 'Empathic understanding', 'Genuineness']
    },
    schema: {
        title: 'Schema Therapy',
        tagline: '"Healing deep patterns from the past."',
        whatIsIt: 'Identifies and changes deep-rooted patterns (schemas) developed in childhood that negatively affect adult life.',
        inventor: 'Jeffrey Young',
        era: '1990s',
        originDesc: 'Young integrated CBT with attachment theory and psychodynamic concepts to address chronic psychological problems.',
        bestFor: ['Personality disorders', 'Chronic depression', 'Relationship issues', 'Childhood trauma'],
        techniques: ['Schema identification', 'Limited reparenting', 'Imagery rescripting', 'Mode work']
    },
    gestalt: {
        title: 'Gestalt Therapy',
        tagline: '"Be here now, fully present."',
        whatIsIt: 'Focuses on present-moment awareness and understanding how past experiences influence current perceptions and behaviors.',
        inventor: 'Fritz Perls',
        era: '1940s-1950s',
        originDesc: 'Perls developed this experiential approach emphasizing personal responsibility and the here-and-now experience.',
        bestFor: ['Self-awareness', 'Unfinished business', 'Present-moment issues', 'Creative blocks'],
        techniques: ['Empty chair technique', 'Awareness exercises', 'Dream work', 'Role-playing']
    },
    somatic: {
        title: 'Somatic Therapy',
        tagline: '"The body remembers what the mind forgets."',
        whatIsIt: 'Addresses physical manifestations of trauma and stress, recognizing the mind-body connection in healing.',
        inventor: 'Various (Peter Levine, Pat Ogden)',
        era: '1970s-present',
        originDesc: 'Emerged from observations that trauma is stored in the body and can be released through body-based interventions.',
        bestFor: ['Trauma & PTSD', 'Chronic pain', 'Stress', 'Anxiety'],
        techniques: ['Body awareness', 'Breathwork', 'Movement', 'Touch therapy']
    },
    systemic: {
        title: 'Systemic/Family Therapy',
        tagline: '"Healing happens in relationship."',
        whatIsIt: 'Views problems in context of family and social systems, understanding how relationships influence individual behavior.',
        inventor: 'Murray Bowen, Salvador Minuchin',
        era: '1950s-1960s',
        originDesc: 'Developed from the recognition that individuals are best understood in the context of their family and social relationships.',
        bestFor: ['Family conflicts', 'Couple issues', 'Parenting challenges', 'Communication problems'],
        techniques: ['Genograms', 'Family mapping', 'Circular questioning', 'Reframing']
    },
    mbct: {
        title: 'Mindfulness-Based Cognitive Therapy (MBCT)',
        tagline: '"Observe your thoughts without judgment."',
        whatIsIt: 'Combines cognitive therapy with mindfulness practices to help prevent relapse in depression.',
        inventor: 'Zindel Segal, Mark Williams, John Teasdale',
        era: '1990s',
        originDesc: 'Developed specifically to prevent depression relapse by teaching patients to recognize and disengage from ruminative thought patterns.',
        bestFor: ['Depression relapse prevention', 'Anxiety', 'Stress', 'Rumination'],
        techniques: ['Meditation', 'Body scan', 'Mindful breathing', 'Cognitive awareness']
    },
    psychoanalysis: {
        title: 'Psychoanalysis',
        tagline: '"Where id was, there ego shall be."',
        whatIsIt: 'Deep exploration of the unconscious mind to understand how early experiences shape personality and current struggles.',
        inventor: 'Sigmund Freud',
        era: '1890s',
        originDesc: 'Freud pioneered the talking cure, developing techniques to access unconscious material through free association and dream analysis.',
        bestFor: ['Deep-seated issues', 'Character problems', 'Repeated life patterns', 'Chronic difficulties'],
        techniques: ['Free association', 'Dream interpretation', 'Analysis of resistance', 'Transference analysis']
    },
    eft: {
        title: 'Emotionally Focused Therapy (EFT)',
        tagline: '"Creating secure emotional bonds."',
        whatIsIt: 'Focuses on creating and strengthening emotional bonds between partners through accessing and reprocessing emotional experiences.',
        inventor: 'Sue Johnson, Les Greenberg',
        era: '1980s',
        originDesc: 'Developed by integrating attachment theory with experiential therapy to help couples create secure bonds.',
        bestFor: ['Couple distress', 'Attachment issues', 'Relationship repair', 'Emotional disconnection'],
        techniques: ['Emotion tracking', 'Accessing attachment needs', 'Restructuring interactions', 'Creating new cycles']
    },
    cft: {
        title: 'Compassion Focused Therapy (CFT)',
        tagline: '"Cultivating inner warmth and safety."',
        whatIsIt: 'Integrates CBT with evolutionary psychology to help those who struggle with shame and self-criticism develop self-compassion.',
        inventor: 'Paul Gilbert',
        era: '2000s',
        originDesc: 'Developed to help patients who could understand the logic of CBT but still felt "bad" emotionally due to high shame.',
        bestFor: ['Shame', 'Self-criticism', 'Trauma', 'Depression'],
        techniques: ['Compassionate mind training', 'Soothing rhythm breathing', 'Safe place imagery', 'Compassionate self']
    },
    // === Detailed Sub-Nodes ===
    // Psychodynamic Sub-nodes
    shadow: {
        title: 'Shadow Work',
        tagline: '"Making the darkness conscious."',
        whatIsIt: 'The process of exploring the "shadow"—the suppressed, rejected, or denied parts of the personality—to achieve wholeness.',
        inventor: 'Carl Jung',
        era: '1900s',
        originDesc: 'Jung belived that "until you make the unconscious conscious, it will direct your life and you will call it fate."',
        bestFor: ['Self-acceptance', 'Inner conflict', 'Creativity', 'Personal integration'],
        techniques: ['Active imagination', 'Journaling', 'Dream work', 'Dialogue with the shadow']
    },
    dreams: {
        title: 'Dream Analysis',
        tagline: '"The royal road to the unconscious."',
        whatIsIt: 'Interpreting the symbols and narratives of dreams to reveal unconscious desires, fears, and conflicts.',
        inventor: 'Sigmund Freud',
        era: '1899',
        originDesc: 'Freud published "The Interpretation of Dreams", proposing that dreams are wish fulfillments used by the unconscious to resolve conflict.',
        bestFor: ['Insight', 'Recurring nightmares', 'Self-discovery', 'Understanding hidden motives'],
        techniques: ['Free association to symbols', 'Amplification', 'Keeping a dream diary', 'Reality testing']
    },
    unconscious: {
        title: 'The Unconscious',
        tagline: '"The submerged part of the iceberg."',
        whatIsIt: 'Working with the vast reservoir of feelings, thoughts, and memories that are outside of our conscious awareness but influence behavior.',
        inventor: 'Freud/Jung',
        era: 'Late 19th Century',
        originDesc: 'The core concept of depth psychology: that we are driven by forces we do not immediately recognize.',
        bestFor: ['Deep-seated patterns', 'Inexplicable behaviors', 'Triggers', 'Automatic reactions'],
        techniques: ['Free association', 'Hypnosis', 'Projective tests', 'Slips of the tongue analysis']
    },
    attachment: {
        title: 'Attachment Theory',
        tagline: '"How we bond defines how we relate."',
        whatIsIt: 'Examining early bonds with caregivers to understand current relationship anxiety, avoidance, or security.',
        inventor: 'John Bowlby',
        era: '1950s',
        originDesc: 'Bowlby observed the distress of children separated from parents, formulating that secure attachment is a primary survival need.',
        bestFor: ['Relationship issues', 'Fear of abandonment', 'Intimacy struggles', 'Trust issues'],
        techniques: ['Identifying attachment style', 'Reparenting', 'Earned security', 'Corrective emotional experience']
    },
    // CBT Sub-nodes
    restructuring: {
        title: 'Cognitive Restructuring',
        tagline: '"Rewire your thinking."',
        whatIsIt: 'The process of learning to identify and dispute irrational or maladaptive thoughts known as cognitive distortions.',
        inventor: 'Albert Ellis / Aaron Beck',
        era: '1960s',
        originDesc: 'The core technique of CBT, based on the idea that it is not events that upset us, but our view of them.',
        bestFor: ['Negative self-talk', 'Catastrophizing', 'Anxiety', 'Depression'],
        techniques: ['Socratic questioning', 'Evidence gathering', 'Thought records', 'Alternative perspective taking']
    },
    exposure: {
        title: 'Exposure Therapy',
        tagline: '"Face the fear to fade the fear."',
        whatIsIt: 'Gradually and systematically exposing oneself to feared situations or objects in a safe environment to reduce anxiety.',
        inventor: 'Behaviorists (Wolpe)',
        era: '1950s',
        originDesc: 'Based on Pavlovian extinction: if the feared stimulus occurs without a negative outcome, the fear response weakens.',
        bestFor: ['Phobias', 'PTSD', 'OCD', 'Social Anxiety'],
        techniques: ['Graded exposure ladder', 'Flooding', 'Response prevention', 'Imaginal exposure']
    },
    logic: {
        title: 'Rational Logic',
        tagline: '"Thinking clearly, feeling better."',
        whatIsIt: 'Using logic and evidence to test the validity of emotional conclusions and reduce emotional reasoning.',
        inventor: 'Stoic Philosophers / CBT',
        era: 'Ancient/Modern',
        originDesc: 'Inspired by Stoicism ("Man is disturbed not by things, but by the views he takes of them"), applied to modern therapy.',
        bestFor: ['Emotional regulation', 'Decision making', 'Reducing impulsivity', 'Clarifying values'],
        techniques: ['Cost-benefit analysis', 'Pie charts', 'Defining terms', 'Logical disputation']
    },
    behavioral: {
        title: 'Behavioral Activation',
        tagline: '"Action precedes motivation."',
        whatIsIt: 'A therapeutic intervention that encourages engaging in activities that are pleasurable or meaningful to lift mood.',
        inventor: 'Peter Lewinsohn',
        era: '1970s',
        originDesc: 'Developed when researchers noticed that depressed people stop getting positive reinforcement from their environment.',
        bestFor: ['Depression', 'Lethargy', 'Motivation issues', 'Social withdrawal'],
        techniques: ['Activity scheduling', 'Graded tasks', 'Pleasure/Mastery rating', 'Breaking cycles']
    },
    // Humanistic Sub-nodes
    empathy: {
        title: 'Radical Empathy',
        tagline: '"Feeling with, not just looking at."',
        whatIsIt: 'The therapist\'s sensitive ability and willingness to understand the client\'s thoughts, feelings, and struggles from the client\'s point of view.',
        inventor: 'Carl Rogers',
        era: '1950s',
        originDesc: 'Rogers posited empathy as one of the specialized conditions necessary for therapeutic change to occur.',
        bestFor: ['Building trust', 'Feeling heard', 'Reducing shame', 'Emotional processing'],
        techniques: ['Reflective listening', 'Validation', 'Mirroring', 'Resonance']
    },
    self: {
        title: 'The True Self',
        tagline: '"Becoming who you truly are."',
        whatIsIt: 'Moving away from "masks" and "shoulds" to uncover and live from one\'s authentic core.',
        inventor: 'Søren Kierkegaard / Rogers',
        era: '19th/20th Century',
        originDesc: 'Based on the existential idea that anxiety often comes from living inauthentically or trying to please others.',
        bestFor: ['Identity crisis', 'People pleasing', 'Purpose', 'Authenticity'],
        techniques: ['Values alignment', 'Discarding false selves', 'Inner voice listening', 'Congruence']
    },
    // Systemic Sub-nodes
    family: {
        title: 'Family Systems',
        tagline: '"The whole is greater than the parts."',
        whatIsIt: 'Visualizing the family as an emotional unit. Change in one person inevitably triggers change in others.',
        inventor: 'Murray Bowen',
        era: '1960s',
        originDesc: 'Bowen Theory posits that individuals cannot be understood in isolation from one another.',
        bestFor: ['Family conflict', 'Boundaries', 'Differentiation', 'Inherited patterns'],
        techniques: ['Genograms', 'Triangulation identification', 'De-triangulation', 'differentiation of self']
    },
    context: {
        title: 'Contextual Therapy',
        tagline: '"Fairness across generations."',
        whatIsIt: 'Focuses on the ethical dimension of family relationships, fairness, and "ledgers" of entitlement and indebtedness.',
        inventor: 'Ivan Boszormenyi-Nagy',
        era: '1970s',
        originDesc: 'Emphasizes that trust is the fundamental glue of relationships and is built through fairness and accountability.',
        bestFor: ['Intergenerational trauma', 'Loyalty conflicts', 'Divorce', 'Estrangement'],
        techniques: ['Multidirected partiality', 'Exoneration', 'Rebalancing ledgers', 'Legacy work']
    },
    // Gestalt Sub-nodes
    awareness: {
        title: 'Awareness',
        tagline: '"Notice what is happening now."',
        whatIsIt: 'The practice of staying in contact with the present moment—sensations, feelings, and thoughts—without judgment.',
        inventor: 'Fritz Perls',
        era: '1950s',
        originDesc: 'The core of Gestalt ("The only time is now"). Change happens when one becomes what he is, not what he tries to be.',
        bestFor: ['Disconnection', 'Numbness', 'Over-thinking', 'Grounding'],
        techniques: ['"What are you aware of?"', 'Body scanning', 'Sensory grounding', 'Exaggeration']
    }
};

function openModal(therapyKey, interactive = false) {
    const modal = document.getElementById('therapyModal');
    const data = therapyData[therapyKey];
    if (!data) return;

    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalTagline').textContent = data.tagline;
    document.getElementById('modalWhatIsIt').textContent = data.whatIsIt;
    document.getElementById('modalInventor').textContent = data.inventor;
    document.getElementById('modalEra').textContent = data.era;
    document.getElementById('modalOriginDesc').textContent = data.originDesc;

    const tagsContainer = document.getElementById('modalBestFor');
    tagsContainer.innerHTML = data.bestFor.map(tag => `<span class="modal-tag">${tag}</span>`).join('');

    const techniquesList = document.getElementById('modalTechniques');
    techniquesList.innerHTML = data.techniques.map(tech => `<li>${tech}</li>`).join('');

    modal.classList.add('active');

    if (interactive) {
        modal.classList.add('interactive-mode');
        // Allow clicking transparent areas
        document.body.style.overflow = '';
    } else {
        modal.classList.remove('interactive-mode');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('therapyModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Goal Tabs =====
// ===== Supabase Integration =====
const supabaseUrl = 'https://cxzzakslsiynhjeyhejo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4enpha3Nsc2l5bmhqZXloZWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzk3ODcsImV4cCI6MjA4MDQxNTc4N30.ve5Vijc954mg-OVHwj3HCF1cfE3Lkm2zMECWUlJWE7Y';
// Access the global supabase object from the CDN script
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function fetchAndProcessCharacters() {
    console.log('Starting character fetch...');

    // Character category mapping
    const characterConfig = {
        // Sleep Better (6)
        'luna starlight': { category: 'sleep', priority: 0 },
        'dr. morpheus': { category: 'sleep', priority: 1 },
        'sandman': { category: 'sleep', priority: 2 },
        'midnight cat': { category: 'sleep', priority: 3 },
        'dr. nightingale': { category: 'sleep', priority: 4 },
        'sleepy bear': { category: 'sleep', priority: 5 },

        // Enhance Performance (6)
        'coach thunder': { category: 'performance', priority: 0 },
        'eagle eye': { category: 'performance', priority: 1 },
        'athena': { category: 'performance', priority: 2 },
        'marcus flow': { category: 'performance', priority: 3 },
        'cheetah sprint': { category: 'performance', priority: 4 },
        'phoenix rising': { category: 'performance', priority: 5 },

        // Develop Self-Confidence (6)
        'proud peacock': { category: 'self-worth', priority: 0 },
        'dr. grace chen': { category: 'self-worth', priority: 1 },
        'golden lion': { category: 'self-worth', priority: 2 },
        'mirror sage': { category: 'self-worth', priority: 3 },
        'inner light': { category: 'self-worth', priority: 4 },
        'sofia bright': { category: 'self-worth', priority: 5 },

        // Lose Fears (6)
        'brave knight': { category: 'fears', priority: 0 },
        'shadow walker': { category: 'fears', priority: 1 },
        'wise owl': { category: 'fears', priority: 2 },
        'maya calm': { category: 'fears', priority: 3 },
        'fearless wolf': { category: 'fears', priority: 4 },
        'dr. courage': { category: 'fears', priority: 5 },

        // Reduce Stress (6)
        'cloud spirit': { category: 'stress', priority: 0 },
        'lazy sloth': { category: 'stress', priority: 1 },
        'river stone': { category: 'stress', priority: 2 },
        'calm dolphin': { category: 'stress', priority: 3 },
        'dr. serenity': { category: 'stress', priority: 4 },
        'zen master': { category: 'stress', priority: 5 },

        // Be Happier (6)
        'rainbow wizard': { category: 'happier', priority: 0 },
        'dr. sunshine': { category: 'happier', priority: 1 },
        'happy puppy': { category: 'happier', priority: 2 },
        'lily bloom': { category: 'happier', priority: 3 },
        'singing bird': { category: 'happier', priority: 4 },
        'joy spark': { category: 'happier', priority: 5 },

        // Be More Grateful (6)
        'abundance elf': { category: 'grateful', priority: 0 },
        'thankful turtle': { category: 'grateful', priority: 1 },
        'grace waters': { category: 'grateful', priority: 2 },
        'blessing angel': { category: 'grateful', priority: 3 },
        'dr. thankful': { category: 'grateful', priority: 4 },
        'harvest bear': { category: 'grateful', priority: 5 }
    };

    const goals = ['sleep', 'performance', 'self-worth', 'fears', 'stress', 'happier', 'grateful'];

    // Try fetching from database table FIRST (has descriptions)
    try {
        console.log('Fetching from characters table...');
        const { data: tableData, error: tableError } = await supabaseClient
            .from('characters')
            .select('*');

        if (!tableError && tableData && tableData.length > 0) {
            console.log(`Found ${tableData.length} characters in database table`);

            const characters = tableData.map((char, index) => {
                const name = char.name || 'AI Guide';
                const lowerName = name.toLowerCase();
                const config = characterConfig[lowerName];

                let category, priority;
                if (config) {
                    category = config.category;
                    priority = config.priority;
                } else {
                    category = goals[index % goals.length];
                    priority = 99;
                }

                return {
                    name: name,
                    desc: char.description || 'Personalized AI Therapy Companion',
                    img: char.image || '',
                    category: category,
                    priority: priority
                };
            });

            characters.sort((a, b) => a.priority - b.priority);
            return characters;
        }
    } catch (e) {
        console.warn('Table fetch failed:', e);
    }

    // Fallback to storage bucket if table is empty
    const bucketsToTry = ['characters', 'images', 'uploads', 'public'];

    for (const bucket of bucketsToTry) {
        try {
            console.log(`Checking bucket: ${bucket}`);
            const { data: files, error } = await supabaseClient.storage.from(bucket).list();

            if (!error && files && files.length > 0) {
                const validFiles = files.filter(f => !f.name.startsWith('.') && f.name.includes('.'));

                if (validFiles.length > 0) {
                    console.log(`Found ${validFiles.length} images in '${bucket}'`);

                    const characters = validFiles.map((file, index) => {
                        const fileName = file.name;
                        const name = fileName.substring(0, fileName.lastIndexOf('.'))
                            .replace(/[-_]+/g, ' ')
                            .replace(/\b\w/g, c => c.toUpperCase())
                            .trim();

                        const publicUrl = supabaseClient
                            .storage
                            .from(bucket)
                            .getPublicUrl(fileName).data.publicUrl;

                        const lowerName = name.toLowerCase();
                        const config = characterConfig[lowerName];

                        let category, priority;
                        if (config) {
                            category = config.category;
                            priority = config.priority;
                        } else {
                            category = goals[index % goals.length];
                            priority = 99;
                        }

                        return {
                            name: name || 'AI Guide',
                            desc: 'Personalized AI Therapy Companion',
                            img: publicUrl,
                            category: category,
                            priority: priority
                        };
                    });

                    characters.sort((a, b) => a.priority - b.priority);
                    return characters;
                }
            }
        } catch (e) {
            console.warn(`Failed to list bucket ${bucket}`, e);
        }
    }

    return null; // Trigger fallback
}

// ===== Goal Tabs =====
async function initGoalTabs() {
    const grid = document.querySelector('.character-cards-grid');

    // Show loading state with spinner
    grid.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;padding:3rem;width:100%;"><div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);border-top-color:#5B8FD9;border-radius:50%;animation:spin 1s linear infinite;"></div></div><style>@keyframes spin{to{transform:rotate(360deg);}}</style>';

    // Fetch data
    let allCharacters = await fetchAndProcessCharacters();

    if (!allCharacters || allCharacters.length === 0) {
        console.log('Using fallback characters');
        const fallback = getFallbackCharacters();
        allCharacters = [];
        Object.keys(fallback).forEach(key => {
            fallback[key].forEach(char => {
                allCharacters.push({ ...char, category: key });
            });
        });
    }

    // Group characters by category
    const characterMap = {};
    allCharacters.forEach(char => {
        const cat = (char.category || char.goal || 'sleep').toLowerCase();
        if (!characterMap[cat]) characterMap[cat] = [];
        characterMap[cat].push({
            name: char.name,
            desc: char.description || char.desc || 'Your personal AI guide.',
            img: char.image_url || char.img,
            category: cat
        });
    });

    // Create a mixed array: take one character from each category in rotation
    const categories = ['sleep', 'performance', 'self-worth', 'fears', 'stress', 'happier', 'grateful'];
    const mixedCharacters = [];
    const maxPerCategory = Math.max(...Object.values(characterMap).map(arr => arr.length));

    // Round-robin through categories to create diverse mix
    for (let i = 0; i < maxPerCategory; i++) {
        for (const cat of categories) {
            if (characterMap[cat] && characterMap[cat][i]) {
                mixedCharacters.push(characterMap[cat][i]);
            }
        }
    }

    // Custom Order: Luna 1st, Mirror Sage 2nd, Coach Thunder Last
    mixedCharacters.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        // 1. Luna Starlight
        if (nameA.includes('luna starlight')) return -1;
        if (nameB.includes('luna starlight')) return 1;

        // 2. Mirror Sage
        if (nameA.includes('mirror sage')) return -1;
        if (nameB.includes('mirror sage')) return 1;

        // Last: Coach Thunder
        if (nameA.includes('coach thunder')) return 1;
        if (nameB.includes('coach thunder')) return -1;

        return 0;
    });

    // Limit to reasonable number (e.g., 24 characters for diverse selection)
    const displayCharacters = mixedCharacters.slice(0, 24);

    function renderCharacters(characters) {
        if (characters.length === 0) {
            grid.innerHTML = '<div style="color:rgba(255,255,255,0.5); text-align:center; padding:2rem; width:100%;">No guides found.</div>';
            return;
        }

        // Clone for infinite scroll
        const CLONE_COUNT = 2;
        const clonesStart = characters.slice(-CLONE_COUNT);
        const clonesEnd = characters.slice(0, CLONE_COUNT);
        const loopList = [...clonesStart, ...characters, ...clonesEnd];

        grid.innerHTML = loopList.map((char, index) => {
            // Determine if this is a clone
            const isClone = index < CLONE_COUNT || index >= characters.length + CLONE_COUNT;

            // Handle image logic
            let imgSrc = char.img || '';
            if (imgSrc && !imgSrc.includes('/') && !imgSrc.startsWith('http')) {
                imgSrc = `https://images.unsplash.com/${char.img}?w=300&h=350&fit=crop&crop=face`;
            }

            const fallbackImg = "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=300&h=350&fit=crop";

            return `
            <div class="guide-card${isClone ? ' is-clone' : ''}" data-real-index="${(index - CLONE_COUNT + characters.length) % characters.length}">
                <div class="guide-image">
                    <div class="image-placeholder"></div>
                    <img src="${imgSrc}" 
                         alt="${char.name}"
                         loading="lazy"
                         onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';"
                         onerror="this.onerror=null; this.src='${fallbackImg}'; this.classList.add('loaded'); this.previousElementSibling.style.display='none';">
                </div>
                <div class="guide-info">
                    <h3 class="guide-name">${char.name}</h3>
                    <p class="guide-desc">${char.desc}</p>
                </div>
            </div>
        `;
        }).join('');

        // Add click handlers for redirect to app
        grid.querySelectorAll('.guide-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.onclick = (e) => {
                // Prevent redirect if clicking on specific interactive elements if any
                window.location.href = '/app';
            };
        });

        // Apply language to new descriptions
        const currentLang = localStorage.getItem('lang') || 'en';
        if (currentLang === 'de') {
            updateCharacterDescriptions('de');
        }

        // Update carousel dots
        updateCarouselDots(characters.length);

        // Reset carousel position to first REAL character
        currentCharIndex = 0;

        // Wait for layout and images to potentially load layout headers
        setTimeout(() => {
            const cards = grid.querySelectorAll('.guide-card');
            const CLONE_COUNT = 2;
            if (cards.length > CLONE_COUNT) {
                // Scroll to the first real character (Luna Starlight)
                horizontalScrollTo(cards[CLONE_COUNT], false);
            }
        }, 400); // Increased delay to ensure rendering is complete

        // Infinite Scroll Handler
        let scrollTimeout;
        grid.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                checkInfiniteLoop(characters.length, CLONE_COUNT);
            }, 50);
        });
    }

    // Simpler Infinite Loop: just check edges
    function checkInfiniteLoop(totalReal, cloneCount) {
        const scrollLeft = grid.scrollLeft;
        const scrollWidth = grid.scrollWidth;
        const clientWidth = grid.clientWidth;

        // If near start
        if (scrollLeft < 10) {
            const targetIndex = cloneCount + totalReal - 2;
            const targetCard = grid.children[targetIndex];
            if (targetCard) horizontalScrollTo(targetCard, false);
        }
        else if (scrollLeft > scrollWidth - clientWidth - 10) {
            const targetIndex = cloneCount + 1;
            const targetCard = grid.children[targetIndex];
            if (targetCard) horizontalScrollTo(targetCard, false);
        }
    }

    function horizontalScrollTo(card, smooth) {
        if (!card || !grid) return;

        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const gridWidth = grid.clientWidth;

        const targetScrollLeft = cardLeft - (gridWidth / 2) + (cardWidth / 2);

        grid.scrollTo({
            left: targetScrollLeft,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }


    // Carousel navigation
    let currentCharIndex = 0;

    function updateCarouselDots(count) {
        const dotsContainer = document.getElementById('carouselDots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                currentCharIndex = i;
                scrollToCharacter(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    function scrollToCharacter(index, smooth = true) {
        const cards = grid.querySelectorAll('.guide-card');
        if (cards.length === 0) return;

        // Logical index to visual index
        const CLONE_COUNT = 2; // Must match above
        // Clamp index
        const realCount = cards.length - (CLONE_COUNT * 2);

        // Handle wrapping for next/prev buttons
        let validIndex = index;
        if (index < 0) validIndex = realCount - 1;
        if (index >= realCount) validIndex = 0;

        currentCharIndex = validIndex;

        // Visual Index: index + CLONE_COUNT (skip start clones)
        const targetVisualIndex = validIndex + CLONE_COUNT;

        // Scroll to card
        horizontalScrollTo(cards[targetVisualIndex], smooth);

        // Update dots
        const dots = document.querySelectorAll('#carouselDots .dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentCharIndex);
        });
    }

    // Arrow navigation
    const prevBtn = document.getElementById('prevChar');
    const nextBtn = document.getElementById('nextChar');

    // We need real count for modulo
    // We can infer it or store it.
    // DisplayCharacters length is 24.

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const realCount = 24; // Fixed
            scrollToCharacter(currentCharIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const realCount = 24;
            scrollToCharacter(currentCharIndex + 1);
        });
    }

    // Render mixed characters directly (no tabs needed)
    renderCharacters(displayCharacters);
}


function getFallbackCharacters() {
    return {
        sleep: [
            { name: 'Midnight Cat', desc: 'Wise feline who teaches the art of perfect napping.', img: 'midnight-cat.png' },
            { name: 'Dr. Nightingale', desc: 'Compassionate sleep medicine specialist with 20 years experience.', img: 'dr-nightingale.png' },
            { name: 'Sleepy Bear', desc: 'Cozy hibernation expert who knows all about deep, restful sleep.', img: 'sleepy-bear.png' }
        ],
        performance: [
            { name: 'Coach Blaze', desc: 'High-energy motivator for peak performance.', img: 'coach-blaze.png' },
            { name: 'Focus Fox', desc: 'Master of concentration and clarity.', img: 'photo-1474511320723-9a56873571b7' },
            { name: 'Iron Will', desc: 'Builds mental toughness and resilience.', img: 'photo-1507003211169-0a1dd7228f2d' }
        ],
        'self-worth': [
            { name: 'Mirror Sage', desc: 'Helps you see your true worth.', img: 'photo-1472099645785-5658abf4ff4e' },
            { name: 'Heart Guardian', desc: 'Protects your inner light.', img: 'photo-1534528741775-53994a69daeb' },
            { name: 'Dr. Grace', desc: 'Expert in building self-esteem.', img: 'photo-1580489944761-15a19d654956' }
        ],
        fears: [
            { name: 'Brave Knight', desc: 'Courageous warrior who faces dragons.', img: 'photo-1500648767791-00dcc994a43e' },
            { name: 'Shadow Walker', desc: 'Mystical guide who befriends fears.', img: 'photo-1503185912284-5271ff81b9a8' },
            { name: 'Wise Owl', desc: 'Night guardian with clear vision.', img: 'photo-1558618666-fcd25c85cd64' }
        ],
        stress: [
            { name: 'Calm Waters', desc: 'Flows through chaos with serenity.', img: 'photo-1506794778202-cad84cf45f1d' },
            { name: 'Zen Garden', desc: 'Creates peace in any environment.', img: 'photo-1499557354967-2b2d8910bcca' },
            { name: 'Dr. Balance', desc: 'Restores harmony to busy lives.', img: 'photo-1559839734-2b71ea197ec2' }
        ],
        happier: [
            { name: 'Joy Sprite', desc: 'Finds happiness in every moment.', img: 'photo-1489424731084-a5d8b219a5bb' },
            { name: 'Sunshine Bear', desc: 'Warm companion for brighter days.', img: 'photo-1446477597517-1161e261e27c' },
            { name: 'Dr. Bliss', desc: 'Science-backed path to happiness.', img: 'photo-1573496359142-b8d87734a5a2' }
        ],
        grateful: [
            { name: 'Thanks Keeper', desc: 'Counts blessings every day.', img: 'photo-1507591064344-4c6ce005b128' },
            { name: 'Abundance Spirit', desc: 'Sees the fullness in life.', img: 'photo-1488426862026-3ee34a7d66df' },
            { name: 'Dr. Appreciate', desc: 'Expert in gratitude practices.', img: 'photo-1487412720507-e7ab37603c6f' }
        ]
    };
}

// ===== Floating Elements =====
function initFloatingElements() {
    // All floating elements DISABLED per user request
    // createFloatingBalls();
    // createOrbs();
    // createParticles();
    // createFeathers();
}

function createFloatingBalls() {
    const container = document.getElementById('floatingBallsContainer');
    if (!container) return;

    const ballCount = 8; // Number of 3D balls

    for (let i = 0; i < ballCount; i++) {
        const ball = document.createElement('div');
        ball.classList.add('floating-ball');

        // Random size between 60px and 200px
        const size = Math.random() * 140 + 60;

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random animation duration (slow: 20-40 seconds)
        const duration = Math.random() * 20 + 20;
        const delay = Math.random() * -20; // Stagger start

        // Alternate between animations
        const animation = i % 2 === 0 ? 'floatBall' : 'floatBallAlt';

        ball.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            animation: ${animation} ${duration}s ease-in-out ${delay}s infinite;
            opacity: ${0.3 + Math.random() * 0.4};
        `;

        container.appendChild(ball);
    }
}

function createOrbs() {
    const container = document.getElementById('orbsContainer');
    const orbCount = 5;

    for (let i = 0; i < orbCount; i++) {
        const orb = document.createElement('div');
        orb.classList.add('orb');

        const size = Math.random() * 100 + 50;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = 15 + Math.random() * 20;

        const hue = 250 + Math.random() * 60; // Purple to pink range

        orb.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            background: radial-gradient(circle at 30% 30%, 
                hsla(${hue}, 70%, 70%, 0.3), 
                hsla(${hue}, 70%, 50%, 0.1), 
                transparent 70%);
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            /* filter: blur(${size / 20}px); - Removed for performance */
        `;

        container.appendChild(orb);
    }
}

function createParticles() {
    const container = document.getElementById('particlesContainer');
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const x = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 10 + Math.random() * 10;
        const size = 2 + Math.random() * 3;

        particle.style.cssText = `
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;

        container.appendChild(particle);
    }
}

function createFeathers() {
    const container = document.getElementById('feathersContainer');
    const featherCount = 3;

    for (let i = 0; i < featherCount; i++) {
        const feather = document.createElement('div');
        feather.classList.add('feather');

        const x = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = 20 + Math.random() * 15;
        const scale = 0.5 + Math.random() * 0.8;

        feather.style.cssText = `
            left: ${x}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            transform: scale(${scale});
        `;

        container.appendChild(feather);
    }
}

// ===== Therapy Cards =====
function initTherapyCards() {
    // Therapy data was here, now global

    const cards = document.querySelectorAll('.therapy-card');
    const modal = document.getElementById('therapyModal');
    const modalClose = document.getElementById('modalClose');
    const overlay = modal.querySelector('.modal-overlay');

    // openModal/closeModal functions were here, now global

    cards.forEach(card => {
        // Card click - toggle selection
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
        });

        // Info button click - open modal
        const infoBtn = card.querySelector('.info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const therapy = card.dataset.therapy;
                openModal(therapy);
            });
        }

        // 3D tilt effect on hover
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Close modal handlers
    modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function createRipple(element) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(147, 112, 219, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: rippleEffect 0.6s ease-out forwards;
        pointer-events: none;
    `;

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation to stylesheet
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ===== Integrative Engine Controls =====
function initEngineControls() {
    const modules = document.querySelectorAll('.module-card');
    const coreBrain = document.querySelector('.core-brain');
    const orbitsLayer = document.getElementById('orbitsLayer');
    const activeNameDisplay = document.getElementById('activeModuleName');

    // Data for each therapy module (Nodes to spawn)
    const engineData = {
        thirdwave: {
            label: "Third Wave",
            nodes: [
                { name: "ACT", icon: "🎯" },
                { name: "DBT", icon: "⚖️" },
                { name: "Schema", icon: "🗝️" },
                { name: "CFT", icon: "💗" },
                { name: "MBCT", icon: "🧘" }
            ]
        },
        cbt: {
            label: "CBT",
            nodes: [
                { name: "Restructuring", icon: "🧩" },
                { name: "Exposure", icon: "🧗" },
                { name: "Behavioral", icon: "📝" },
                { name: "Logic", icon: "💡" }
            ]
        },
        psychodynamic: {
            label: "Psychodynamic",
            nodes: [
                { name: "Unconscious", icon: "🌑" },
                { name: "Dreams", icon: "💤" },
                { name: "Shadow", icon: "🌗" },
                { name: "Attachment", icon: "🔗" }
            ]
        },
        systemic: {
            label: "Systemic",
            nodes: [
                { name: "Family", icon: "👨‍👩‍👧‍👦" },
                { name: "Context", icon: "🌐" },
                { name: "Patterns", icon: "🔄" },
                { name: "Relations", icon: "🤝" }
            ]
        },
        humanistic: {
            label: "Humanistic",
            nodes: [
                { name: "Empathy", icon: "💖" },
                { name: "Growth", icon: "🌱" },
                { name: "Self", icon: "☀️" },
                { name: "Presence", icon: "🧘" }
            ]
        },
        gestalt: {
            label: "Gestalt",
            nodes: [
                { name: "Here & Now", icon: "👇" },
                { name: "Awareness", icon: "👁️" },
                { name: "Wholeness", icon: "⚪" },
                { name: "Contact", icon: "👉" }
            ]
        }
    };

    modules.forEach(module => {
        module.addEventListener('click', () => {
            // 1. Deactivate all others
            modules.forEach(m => m.classList.remove('active'));

            // 2. Activate clicked
            module.classList.add('active');

            // 3. Get Data
            const moduleKey = module.dataset.module;
            const data = engineData[moduleKey];

            if (data) {
                updateCore(data);
            }
        });
    });

    function updateCore(data) {
        // Update Text
        if (activeNameDisplay) {
            activeNameDisplay.style.opacity = 0;
            setTimeout(() => {
                activeNameDisplay.textContent = data.label + " Architecture";
                activeNameDisplay.style.opacity = 1;
            }, 200);
        }

        // Brain animation disabled - keep grey
        // if (coreBrain) {
        //     coreBrain.classList.add('active');
        //     coreBrain.style.filter = "drop-shadow(0 0 20px var(--accent-purple)) brightness(1.5)";
        //     setTimeout(() => {
        //         coreBrain.style.filter = "";
        //     }, 300);
        // }

        // Spawn Nodes
        spawnNodes(data.nodes);
    }

    function spawnNodes(nodes) {
        if (!orbitsLayer) return;

        // Clear existing
        orbitsLayer.innerHTML = '';

        // Check for mobile to reduce radius
        const isMobile = window.innerWidth < 900;
        const radius = isMobile ? 110 : 160; // Distance from center
        const totalNodes = nodes.length;

        nodes.forEach((node, index) => {
            const angleDeg = (360 / totalNodes) * index;
            // Fixed duration for all to prevent overtaking - USER REQUEST
            const duration = 40;
            const delay = index * (40 / totalNodes); // Evenly distribute along the 40s loop

            const nodeEl = document.createElement('div');
            nodeEl.className = 'orbit-node clickable';
            nodeEl.innerHTML = `<span class="orbit-node-icon">${node.icon}</span> ${node.name}`;

            // Set custom properties for CSS animation
            nodeEl.style.setProperty('--radius', `${radius}px`);

            // Randomize duration slightly for organic feel
            // Random duration removed to prevent overtaking
            // const duration = 20 + Math.random() * 10;
            // Set initial rotation offset
            const startRotation = angleDeg;

            // Apply complex animation
            // NOTE: We use a wrapper approach or direct calculation in CSS? 
            // Let's use the CSS @keyframes 'orbitFloat' we defined.
            // But we need to set the initial position correctly.

            // Simpler approach: Rotate the CONTAINER of the node? No, distinct nodes.
            // Let's just set the animation-delay negative to position them?

            // Correct approach for CSS orbits:
            // 1. node is centered.
            // 2. transform: rotate(START_ANGLE) translateX(RADIUS) rotate(-START_ANGLE)
            // But we want them to MOVE.

            nodeEl.style.animation = `orbitFloat ${duration}s linear infinite`;
            nodeEl.style.animationDelay = `-${(duration / totalNodes) * index}s`; // Distribute along orbit

            // Interaction: Pause on hover
            nodeEl.addEventListener('mouseenter', () => {
                nodeEl.style.animationPlayState = 'paused';
                nodeEl.style.zIndex = '100';
            });
            nodeEl.addEventListener('mouseleave', () => {
                nodeEl.style.animationPlayState = 'running';
                nodeEl.style.zIndex = '';
            });

            // Interaction: Click to open info
            nodeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = findTherapyKey(node.name);
                if (key) {
                    openModal(key, true); // True for interactive mode
                }
            });

            orbitsLayer.appendChild(nodeEl);
        });
    }

    function findTherapyKey(name) {
        // Map display names to keys in therapyData
        const map = {
            // Third Wave
            'ACT': 'act', 'DBT': 'dbt', 'Schema': 'schema', 'MBCT': 'mbct', 'CFT': 'cft',
            // CBT
            'Restructuring': 'restructuring', 'Exposure': 'exposure', 'Behavioral': 'behavioral', 'Logic': 'logic', 'CBT': 'cbt',
            // Psychodynamic
            'Unconscious': 'unconscious', 'Dreams': 'dreams', 'Shadow': 'shadow', 'Attachment': 'attachment', 'Psychodynamic': 'psychodynamic',
            // Systemic
            'Family': 'family', 'Context': 'context', 'Patterns': 'family', 'Relations': 'context', 'Systemic': 'systemic',
            // Humanistic
            'Empathy': 'empathy', 'Growth': 'self', 'Self': 'self', 'Presence': 'awareness', 'Humanistic': 'humanistic',
            // Gestalt
            'Here & Now': 'awareness', 'Awareness': 'awareness', 'Wholeness': 'gestalt', 'Contact': 'empathy', 'Gestalt': 'gestalt',
            // Others
            'Somatic': 'somatic', 'EFT': 'eft', 'Psychoanalysis': 'psychoanalysis'
        };
        return map[name] || null;
    }

    // Auto-select "Third Wave" on load
    const defaultModule = document.querySelector('.module-card[data-module="thirdwave"]');
    if (defaultModule) {
        // Use a small timeout to ensure DOM is ready and animations look good
        setTimeout(() => {
            defaultModule.click();
        }, 500);
    }
}

// ===== Character Creation Controls =====
function initCreationControls() {
    const approachesData = {
        cbt: {
            en: "<strong>Cognitive Behavioral Therapy (CBT)</strong><br>Focuses on identifying and changing negative thought patterns. Structured and goal-oriented.",
            de: "<strong>Kognitive Verhaltenstherapie (CBT)</strong><br>Konzentriert sich auf das Erkennen und Ändern negativer Gedankenmuster. Strukturiert und zielorientiert."
        },
        act: {
            en: "<strong>Acceptance and Commitment Therapy (ACT)</strong><br>Encourages accepting difficult feelings while committing to actions aligned with your values.",
            de: "<strong>Akzeptanz- und Commitmenttherapie (ACT)</strong><br>Fördert die Akzeptanz schwieriger Gefühle und bindet dich an Werte-orientiertes Handeln."
        },
        dbt: {
            en: "<strong>Dialectical Behavior Therapy (DBT)</strong><br>Combines cognitive techniques with mindfulness. Emphasizes emotion regulation and distress tolerance.",
            de: "<strong>Dialektisch-Behaviorale Therapie (DBT)</strong><br>Kombiniert kognitive Techniken mit Achtsamkeit. Betont Emotionsregulation und Stresstoleranz."
        },
        psychodynamic: {
            en: "<strong>Psychodynamic Therapy</strong><br>Explores how unconscious processes and past experiences shape current behavior.",
            de: "<strong>Psychodynamische Therapie</strong><br>Erforscht, wie unbewusste Prozesse und vergangene Erfahrungen das heutige Verhalten prägen."
        },
        humanistic: {
            en: "<strong>Humanistic Therapy</strong><br>Emphasizes personal growth, self-actualization, and your innate potential.",
            de: "<strong>Humanistische Therapie</strong><br>Betont persönliches Wachstum, Selbstverwirklichung und dein angeborenes Potenzial."
        },
        schema: {
            en: "<strong>Schema Therapy</strong><br>Targets deep-seated patterns (schemas) from childhood to heal emotional wounds.",
            de: "<strong>Schematherapie</strong><br>Zielt auf tiefsitzende Muster (Schemata) aus der Kindheit ab, um emotionale Wunden zu heilen."
        },
        gestalt: {
            en: "<strong>Gestalt Therapy</strong><br>Focuses on the present moment and immediate experience to enhance awareness.",
            de: "<strong>Gestalttherapie</strong><br>Konzentriert sich auf den gegenwärtigen Moment, um das Bewusstsein zu stärken."
        },
        somatic: {
            en: "<strong>Somatic Experiencing</strong><br>Engages the body to release tension and trauma, recognizing the mind-body connection.",
            de: "<strong>Somatische Therapie</strong><br>Bezieht den Körper ein, um Spannungen und Trauma zu lösen (Geist-Körper-Verbindung)."
        },
        systemic: {
            en: "<strong>Systemic Therapy</strong><br>Views you as part of a larger system (family, community) to address relationship dynamics.",
            de: "<strong>Systemische Therapie</strong><br>Betrachtet dich als Teil eines größeren Systems (Familie), um Beziehungsdynamiken zu klären."
        },
        mbct: {
            en: "<strong>Mindfulness-Based Cognitive Therapy</strong><br>Combines cognitive therapy with mindfulness to prevent depression relapse and reduce stress.",
            de: "<strong>Achtsamkeitsbasierte Kognitive Therapie</strong><br>Kombiniert kognitive Therapie mit Achtsamkeit zur Stressreduktion."
        },
        psychoanalysis: {
            en: "<strong>Psychoanalysis</strong><br>Dives deep into the unconscious mind to uncover repressed conflicts and desires.",
            de: "<strong>Psychoanalyse</strong><br>Taucht tief ins Unbewusste ein, um verdrängte Konflikte und Wünsche aufzudecken."
        },
        eft: {
            en: "<strong>Emotionally Focused Therapy (EFT)</strong><br>Short-term approach focusing on adult relationships and secure attachment.",
            de: "<strong>Emotionsfokussierte Therapie (EFT)</strong><br>Kurzzeittherapie, die sich auf Bindung und emotionale Sicherheit in Beziehungen fokussiert."
        }
    };

    const approachBtns = document.querySelectorAll('.approach-btn');
    let currentInfoBox = null;

    approachBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('active');

            // Deselect all
            approachBtns.forEach(b => b.classList.remove('active'));

            // Remove existing info box
            if (currentInfoBox) {
                currentInfoBox.remove();
                currentInfoBox = null;
            }

            // If it wasn't active, select it (toggle behavior for single item)
            if (!wasActive) {
                btn.classList.add('active');

                const type = btn.dataset.type;
                const info = approachesData[type];

                if (info) {
                    // Create info box
                    const infoBox = document.createElement('div');
                    infoBox.className = 'approach-info-box';
                    const currentLang = localStorage.getItem('lang') || 'en';
                    infoBox.innerHTML = info[currentLang];
                    infoBox.setAttribute('data-en', info.en);
                    infoBox.setAttribute('data-de', info.de);

                    // Find where to insert (after the last element of the current row)
                    const grid = btn.parentElement;
                    const buttons = Array.from(grid.children).filter(el => el.classList.contains('approach-btn'));
                    const btnIndex = buttons.indexOf(btn);

                    let insertionPoint = btn;
                    const baseTop = btn.offsetTop;

                    for (let i = btnIndex; i < buttons.length; i++) {
                        if (buttons[i].offsetTop === baseTop) {
                            insertionPoint = buttons[i];
                        } else {
                            break;
                        }
                    }

                    if (insertionPoint.nextSibling) {
                        grid.insertBefore(infoBox, insertionPoint.nextSibling);
                    } else {
                        grid.appendChild(infoBox);
                    }

                    currentInfoBox = infoBox;
                }
            }
        });
    });

    // Preselect CBT by default
    setTimeout(() => {
        const cbtBtn = document.querySelector('.approach-btn[data-type="cbt"]');
        if (cbtBtn) {
            cbtBtn.click();
        }
    }, 100);


}



// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Mobile Carousel Scroll Spy & Desktop Nav =====
function initCarouselScroll() {
    const grid = document.querySelector('.character-cards-grid');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('prevChar');
    const nextBtn = document.getElementById('nextChar');

    if (!grid) return;

    // Update dots on scroll (if dots exist)
    if (dots.length > 0) {
        grid.addEventListener('scroll', () => {
            const itemWidth = grid.clientWidth;
            const activeIndex = Math.round(grid.scrollLeft / itemWidth);

            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });

        // Click on dots to scroll
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const itemWidth = grid.clientWidth;
                grid.scrollTo({
                    left: itemWidth * index,
                    behavior: 'smooth'
                });
            });
        });
    }

    // Arrow Navigation (Desktop/All)
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const itemWidth = 300; // Approx card width + gap
            grid.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const itemWidth = 300; // Approx card width + gap
            grid.scrollBy({ left: itemWidth, behavior: 'smooth' });
        });
    }
}


