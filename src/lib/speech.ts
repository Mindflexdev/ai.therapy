// Speech-to-text via Supabase Edge Function → OpenAI Whisper API.
// Records audio using expo-av, sends base64 to whisper-proxy, returns text.

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

// Recording config optimized for speech transcription
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MEDIUM,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

let currentRecording: Audio.Recording | null = null;

/**
 * Request microphone permissions and start recording.
 * Returns the Recording instance (needed to stop later).
 */
export async function startRecording(
  onMeteringUpdate?: (metering: number) => void
): Promise<Audio.Recording> {
  // Request permissions
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) {
    throw new Error('Microphone permission is required for voice input.');
  }

  // Configure audio mode for recording
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(RECORDING_OPTIONS);

  // Register metering callback for real-time audio level visualization
  if (onMeteringUpdate) {
    recording.setProgressUpdateInterval(100);
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && status.metering !== undefined) {
        onMeteringUpdate(status.metering);
      }
    });
  }

  await recording.startAsync();

  currentRecording = recording;
  return recording;
}

/**
 * Stop recording and return the file URI.
 */
export async function stopRecording(
  recording?: Audio.Recording
): Promise<{ uri: string; mimeType: string }> {
  const rec = recording || currentRecording;
  if (!rec) {
    throw new Error('No active recording to stop.');
  }

  await rec.stopAndUnloadAsync();
  currentRecording = null;

  // Reset audio mode so playback works
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  const uri = rec.getURI();
  if (!uri) {
    throw new Error('Recording failed — no audio file produced.');
  }

  return { uri, mimeType: 'audio/m4a' };
}

/**
 * Transcribe an audio file by sending it to the whisper-proxy edge function.
 * Returns the transcribed text.
 */
export async function transcribeAudio(
  uri: string,
  mimeType = 'audio/m4a',
  language?: string
): Promise<string> {
  // Read the file as base64
  const base64Audio = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Check auth
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('User must be logged in to use voice input.');
  }

  // Call the whisper-proxy edge function
  const { data, error } = await supabase.functions.invoke('whisper-proxy', {
    body: {
      audio: base64Audio,
      mimeType,
      language,
    },
  });

  if (error) {
    console.error('Whisper proxy error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }

  if (!data?.text) {
    throw new Error('No transcription returned.');
  }

  return data.text.trim();
}

/**
 * Convenience: record → stop → transcribe in one call.
 * (Not typically used directly — the UI controls start/stop separately.)
 */
export async function recordAndTranscribe(language?: string): Promise<string> {
  const recording = await startRecording();
  // Caller is responsible for stopping — this is just a helper shape
  const { uri, mimeType } = await stopRecording(recording);
  return transcribeAudio(uri, mimeType, language);
}
