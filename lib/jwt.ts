// Proper JWT generation for n8n webhook authentication
// Uses Web Crypto API for HMAC-SHA256 signing

const JWT_SECRET = 'nwMrqSPlftSWQkj34mTV+J3+9sB6bfWROxvXVLOrm0F736Wnw8eNxULAB21XfS+na3V/xAIGbfi/faOffklGgA==';

// Base64 URL encode
function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// String to base64url
function stringToBase64Url(str: string): string {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Create a proper JWT token with HMAC-SHA256
export async function createJWT(payload: any): Promise<string> {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = stringToBase64Url(JSON.stringify(header));
    const encodedPayload = stringToBase64Url(JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    }));

    const message = `${encodedHeader}.${encodedPayload}`;

    // Use Web Crypto API for proper HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message)
    );

    const encodedSignature = base64UrlEncode(signature);

    return `${message}.${encodedSignature}`;
}
