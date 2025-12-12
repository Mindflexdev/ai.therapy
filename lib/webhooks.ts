import { createJWT } from './jwt';

const WEBHOOK_URL = 'https://mindflex.app.n8n.cloud/webhook/8057d7ee-93b9-453d-bf18-db22a8f1d1d2';

interface GenerateImageRequest {
    description: string;
    characterName?: string;
    userId?: string;
    greeting?: string;
    therapyStyles?: string[];
    goal?: string;
}

interface GenerateImageResponse {
    imageUrl: string;
    success: boolean;
    error?: string;
}

export async function generateCharacterImage(
    request: GenerateImageRequest
): Promise<GenerateImageResponse> {
    try {
        console.log('🚀 Starting image generation...');
        console.log('📝 Description:', request.description);
        console.log('👤 Character name:', request.characterName);

        // Create JWT token for authentication (now async)
        const token = await createJWT({
            userId: request.userId || 'anonymous',
            action: 'generate_character_image',
        });

        console.log('🔑 JWT Token created');

        const requestBody = {
            description: request.description,
            appearance: request.description, // Explicit appearance field
            characterName: request.characterName,
            userId: request.userId,
            greeting: request.greeting,
            therapyStyles: request.therapyStyles,
            goal: request.goal,
            timestamp: new Date().toISOString(),
        };

        console.log('📤 Sending request to:', WEBHOOK_URL);
        console.log('📦 Request body:', requestBody);

        // Send POST request to n8n webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response error:', errorText);
            throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Response data:', data);

        // Handle various response formats:
        // 1. Array with object: [{ image: "url" }]
        // 2. Object with keys: { imageUrl: "url" } or { image: "url" }
        let imageUrl = '';
        if (Array.isArray(data) && data.length > 0) {
            imageUrl = data[0].image || data[0].imageUrl || data[0].image_url || data[0].url;
        } else if (typeof data === 'object' && data !== null) {
            imageUrl = data.image || data.imageUrl || data.image_url || data.url;
        }

        return {
            imageUrl: imageUrl || '',
            success: true,
        };
    } catch (error) {
        console.error('❌ Error generating character image:', error);
        return {
            imageUrl: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
