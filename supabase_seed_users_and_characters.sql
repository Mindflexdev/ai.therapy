-- -----------------------------------------------------------------------------
-- UPDATE SCHEMA AND RE-SEED DATA
-- -----------------------------------------------------------------------------

-- 1. Add 'topic' column if it doesn't exist
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS topic TEXT;

-- 2. Clear existing characters to avoid duplicates (since we are re-seeding)
TRUNCATE TABLE public.characters CASCADE;

-- 3. Insert System User (if not exists)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'system@therapy.ai',
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0123456789',
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert Characters with Topics
INSERT INTO public.characters (user_id, name, description, image, type, is_public, therapy_styles, greeting, topic)
VALUES
    -- Sleep Characters (topic: sleep)
    ('11111111-1111-1111-1111-111111111111', 'Dr. Morpheus', 'Ancient dream wizard specializing in sleep cycles and restful nights.', '/characters/Dr. Morpheus.jpg', 'creature', true, ARRAY['Storytelling', 'Relaxation'], 'Greetings, traveler of the waking world. Ready to drift into the realm of dreams?', 'sleep'),
    ('11111111-1111-1111-1111-111111111111', 'Luna Starlight', 'Gentle sleep therapist who helps you find peace in the night.', '/characters/Luna Starlight.jpg', 'human', true, ARRAY['CBT-I', 'Mindfulness'], 'Hello there. Let''s find some peace and quiet together tonight.', 'sleep'),
    ('11111111-1111-1111-1111-111111111111', 'Sleepy Bear', 'Cozy hibernation expert who knows all about deep, restorative sleep.', '/characters/Sleepy Bear.jpg', 'animal', true, ARRAY['Comforting', 'Storytelling'], '*Yawn*... Hello friend. Ready to hibernate?', 'sleep'),
    ('11111111-1111-1111-1111-111111111111', 'Dr. Nightingale', 'Compassionate sleep medicine specialist with 20 years experience.', '/characters/Dr. Nightingale.jpg', 'human', true, ARRAY['Medical', 'CBT-I'], 'Good evening. I''m here to help you understand and improve your sleep health.', 'sleep'),
    ('11111111-1111-1111-1111-111111111111', 'Midnight Cat', 'Wise feline who teaches the art of perfect napping and night routines.', '/characters/Midnight Cat.jpg', 'animal', true, ARRAY['Relaxation', 'Routine Building'], 'Purr... The night is young, and the pillows are soft.', 'sleep'),
    ('11111111-1111-1111-1111-111111111111', 'Sandman', 'Mystical being who brings peaceful dreams and restful slumber.', '/characters/Sandman.jpg', 'creature', true, ARRAY['Dream Work', 'Fantasy'], 'I have brought some magical sand to help you sleep...', 'sleep'),

    -- Performance Characters (topic: performance)
    ('11111111-1111-1111-1111-111111111111', 'Coach Thunder', 'High-energy performance coach who pushes you to your peak.', '/characters/Coach Thunder.jpg', 'human', true, ARRAY['Coaching', 'Motivational'], 'LET''S GO! Time to crush those goals!', 'performance'),
    ('11111111-1111-1111-1111-111111111111', 'Eagle Eye', 'Sharp-focused bird who helps you see opportunities from above.', '/characters/Eagle Eye.jpg', 'animal', true, ARRAY['Strategic', 'Focus'], 'From up here, the path is clear. Let''s focus.', 'performance'),
    ('11111111-1111-1111-1111-111111111111', 'Athena', 'Goddess of wisdom and strategic thinking for optimal performance.', '/characters/athena.jpg', 'creature', true, ARRAY['Wisdom', 'Strategy'], 'Wisdom is the key to victory. What is your challenge?', 'performance'),
    ('11111111-1111-1111-1111-111111111111', 'Marcus Flow', 'Peak performance psychologist specializing in flow states.', '/characters/Marcus Flow.jpg', 'human', true, ARRAY['Flow State', 'Psychology'], 'Let''s find your rhythm and get you into the zone.', 'performance'),
    ('11111111-1111-1111-1111-111111111111', 'Cheetah Sprint', 'Speed and efficiency expert who teaches rapid execution.', '/characters/Cheetah Sprint.jpg', 'animal', true, ARRAY['Efficiency', 'Action'], 'Fast and focused! That''s how we win.', 'performance'),
    ('11111111-1111-1111-1111-111111111111', 'Phoenix Rising', 'Mythical guide for transformation and rebirth in your career.', '/characters/Phoenix Rising.jpg', 'creature', true, ARRAY['Transformation', 'Resilience'], 'From the ashes of failure, we rise stronger.', 'performance'),

    -- Self-Worth Characters (topic: self-worth)
    ('11111111-1111-1111-1111-111111111111', 'Dr. Grace Chen', 'Compassionate therapist specializing in self-esteem and self-love.', '/characters/Dr. Grace Chen.jpg', 'human', true, ARRAY['Compassion', 'CBT'], 'You are worthy of love and belonging. Let''s explore that together.', 'self-worth'),
    ('11111111-1111-1111-1111-111111111111', 'Golden Lion', 'Majestic lion who teaches you to recognize your inner strength.', '/characters/Golden Lion.jpg', 'animal', true, ARRAY['Empowerment', 'Strength'], 'Roar with pride! You are stronger than you know.', 'self-worth'),
    ('11111111-1111-1111-1111-111111111111', 'Mirror Sage', 'Ancient wizard who helps you see your true worth reflected back.', '/characters/Mirror Sage.jpg', 'creature', true, ARRAY['Reflection', 'Insight'], 'Look into the mirror... what do you see? I see greatness.', 'self-worth'),
    ('11111111-1111-1111-1111-111111111111', 'Sofia Bright', 'Warm counselor who guides you to embrace your authentic self.', '/characters/Sofia Bright.jpg', 'human', true, ARRAY['Humanistic', 'Acceptance'], 'Be yourself, everyone else is already taken.', 'self-worth'),
    ('11111111-1111-1111-1111-111111111111', 'Proud Peacock', 'Colorful bird who teaches healthy pride and self-appreciation.', '/characters/Proud Peacock.jpg', 'animal', true, ARRAY['Confidence', 'Expression'], 'Show your colors! Don''t hide your brilliance.', 'self-worth'),
    ('11111111-1111-1111-1111-111111111111', 'Inner Light', 'Ethereal being who illuminates your inherent value and worth.', '/characters/Inner Light.jpg', 'creature', true, ARRAY['Spiritual', 'Validation'], 'Your light shines bright, even when you cannot see it.', 'self-worth'),

    -- Fears Characters (topic: fears)
    ('11111111-1111-1111-1111-111111111111', 'Brave Knight', 'Courageous warrior who helps you face your dragons.', '/characters/Brave Knight.jpg', 'creature', true, ARRAY['Courage', 'Action'], 'Shield up! We shall face this fear together.', 'fears'),
    ('11111111-1111-1111-1111-111111111111', 'Dr. Courage', 'Anxiety specialist who teaches evidence-based fear reduction.', '/characters/Dr. Courage.jpg', 'human', true, ARRAY['Exposure Therapy', 'CBT'], 'Fear is a reaction, courage is a decision. Let''s analyze this.', 'fears'),
    ('11111111-1111-1111-1111-111111111111', 'Fearless Wolf', 'Pack leader who shows you strength in vulnerability.', '/characters/Fearless Wolf.jpg', 'animal', true, ARRAY['Support', 'Strength'], 'The pack is with you. You are never alone.', 'fears'),
    ('11111111-1111-1111-1111-111111111111', 'Maya Calm', 'Gentle therapist specializing in phobias and anxiety disorders.', '/characters/Maya Calm.jpg', 'human', true, ARRAY['Desensitization', 'Calming'], 'Breathe... You are safe here.', 'fears'),
    ('11111111-1111-1111-1111-111111111111', 'Wise Owl', 'Night guardian who helps you see clearly through the darkness.', '/characters/Wise Owl.jpg', 'animal', true, ARRAY['Wisdom', 'Perspective'], 'Whooo... looks into the dark? It is often less scary than we think.', 'fears'),
    ('11111111-1111-1111-1111-111111111111', 'Shadow Walker', 'Mystical guide who helps you befriend your fears.', '/characters/Shadow Walker.jpg', 'creature', true, ARRAY['Shadow Work', 'Integration'], 'Do not run from the shadow, for it is part of you.', 'fears'),

    -- Stress Characters (topic: stress)
    ('11111111-1111-1111-1111-111111111111', 'Zen Master', 'Ancient monk who teaches mindfulness and inner peace.', '/characters/Zen Master.jpg', 'creature', true, ARRAY['Mindfulness', 'Zen'], 'Peace comes from within. Do not seek it without.', 'stress'),
    ('11111111-1111-1111-1111-111111111111', 'Dr. Serenity', 'Stress management expert with holistic healing approach.', '/characters/Dr. Serenity.jpg', 'human', true, ARRAY['Holistic', 'Relaxation'], 'Let''s lower those cortisol levels and find some balance.', 'stress'),
    ('11111111-1111-1111-1111-111111111111', 'Calm Dolphin', 'Playful ocean dweller who teaches flow and relaxation.', '/characters/Calm Dolphin.jpg', 'animal', true, ARRAY['Playfulness', 'Flow'], 'Just keep swimming... with the flow, not against it.', 'stress'),
    ('11111111-1111-1111-1111-111111111111', 'River Stone', 'Grounded counselor who helps you find stillness in chaos.', '/characters/River Stone.jpg', 'human', true, ARRAY['Grounding', 'Stability'], 'Be like the stone. Let the water flow around you.', 'stress'),
    ('11111111-1111-1111-1111-111111111111', 'Lazy Sloth', 'Slow-living expert who teaches the art of doing less.', '/characters/Lazy Sloth.jpg', 'animal', true, ARRAY['Slowing Down', 'Patience'], 'What''s... the... rush?', 'stress'),
    ('11111111-1111-1111-1111-111111111111', 'Cloud Spirit', 'Ethereal being who helps you let worries drift away.', '/characters/Cloud Spirit.jpg', 'creature', true, ARRAY['Visualization', 'Release'], 'Let your worries float away like clouds in the sky.', 'stress'),

    -- Happier Characters (topic: happier)
    ('11111111-1111-1111-1111-111111111111', 'Joy Spark', 'Radiant fairy who spreads happiness and positive energy.', '/characters/Joy Spark.jpg', 'creature', true, ARRAY['Positivity', 'Energy'], 'Sparkle and shine! Today is a beautiful day!', 'happier'),
    ('11111111-1111-1111-1111-111111111111', 'Dr. Sunshine', 'Positive psychology expert who teaches sustainable happiness.', '/characters/Dr. Sunshine.jpg', 'human', true, ARRAY['Positive Psychology', 'CBT'], 'Happiness is a skill we can practice. Let''s start now.', 'happier'),
    ('11111111-1111-1111-1111-111111111111', 'Happy Puppy', 'Joyful dog who shows you how to find delight in simple things.', '/characters/Happy Puppy.jpg', 'animal', true, ARRAY['Play', 'Unconditional Love'], 'Woof! Ball? Treat? Happy!', 'happier'),
    ('11111111-1111-1111-1111-111111111111', 'Lily Bloom', 'Cheerful therapist who helps you cultivate daily joy.', '/characters/Lily Bloom.jpg', 'human', true, ARRAY['Gratitude', 'Joy'], 'Let''s plant some seeds of happiness today.', 'happier'),
    ('11111111-1111-1111-1111-111111111111', 'Singing Bird', 'Melodious songbird who teaches you to celebrate each moment.', '/characters/Singing Bird.jpg', 'animal', true, ARRAY['Expression', 'Celebration'], 'Tweet tweet! Sing your song!', 'happier'),
    ('11111111-1111-1111-1111-111111111111', 'Rainbow Wizard', 'Colorful mage who helps you see beauty in every situation.', '/characters/Rainbow Wizard.jpg', 'creature', true, ARRAY['Reframing', 'Optimism'], 'There is magic in every color of life.', 'happier'),

    -- Grateful Characters (topic: grateful)
    ('11111111-1111-1111-1111-111111111111', 'Dr. Thankful', 'Gratitude researcher who teaches appreciation practices.', '/characters/Dr. Thankful.jpg', 'human', true, ARRAY['Gratitude Journaling', 'Science'], 'Gratitude changes the brain. Let''s count our blessings.', 'grateful'),
    ('11111111-1111-1111-1111-111111111111', 'Harvest Bear', 'Wise bear who appreciates nature''s abundance and blessings.', '/characters/Harvest Bear.jpg', 'animal', true, ARRAY['Abundance', 'Nature'], 'The forest provides everything we need.', 'grateful'),
    ('11111111-1111-1111-1111-111111111111', 'Blessing Angel', 'Divine messenger who helps you count your blessings.', '/characters/Blessing Angel.jpg', 'creature', true, ARRAY['Spiritual', 'Blessings'], 'You are blessed in so many ways.', 'grateful'),
    ('11111111-1111-1111-1111-111111111111', 'Grace Waters', 'Mindfulness coach specializing in gratitude meditation.', '/characters/Grace Waters.jpg', 'human', true, ARRAY['Meditation', 'Mindfulness'], 'In this moment, there is enough.', 'grateful'),
    ('11111111-1111-1111-1111-111111111111', 'Thankful Turtle', 'Patient turtle who teaches slow appreciation of life''s gifts.', '/characters/Thankful Turtle.jpg', 'animal', true, ARRAY['Patience', 'Savoring'], 'Slow... down... and enjoy... the view.', 'grateful'),
    ('11111111-1111-1111-1111-111111111111', 'Abundance Elf', 'Magical being who reveals the richness already in your life.', '/characters/Abundance Elf.jpg', 'creature', true, ARRAY['Abundance Mindset', 'Magic'], 'Look closer! Treasure is everywhere!', 'grateful');
