
export function generateSessionId(userId: string, characterIdentifier: string): string {
    // Unique Session per Character (Clean UI)
    // "Team Awareness" should be handled in n8n by fetching broader context if needed.
    return `${userId}_${characterIdentifier}`;
}
