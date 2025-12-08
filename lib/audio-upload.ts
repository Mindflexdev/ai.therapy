import * as FileSystem from 'expo-file-system';

export async function uploadAudioFile(uri: string, token: string, uploadUrl: string): Promise<any> {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error("File does not exist");

    const uploadResult = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        fieldName: 'file',
        mimeType: 'audio/m4a',
    });

    if (uploadResult.status !== 200) {
        throw new Error(`Upload failed: ${uploadResult.status}`);
    }
    return JSON.parse(uploadResult.body);
}
