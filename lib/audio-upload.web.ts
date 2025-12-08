export async function uploadAudioFile(uri: string, token: string, uploadUrl: string): Promise<any> {
    const response = await fetch(uri);
    const blob = await response.blob();

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', blob, 'recording.m4a');

    const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Do NOT set Content-Type header manually for FormData
        },
        body: formData,
    });

    if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
    return await uploadRes.json();
}
