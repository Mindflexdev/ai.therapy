// Speech-to-text via Supabase Edge Function → OpenAI Whisper API.
// Records audio using expo-av, sends base64 to whisper-proxy, returns text.

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

// Use the built-in HIGH_QUALITY preset (known to work on all platforms)
// with isMeteringEnabled for waveform visualization.
// Custom options with non-standard sample rates can cause "recorder not prepared" on iOS.
const RECORDING_OPTIONS = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
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

  // Clean up any stale recording from a previous session/hot-reload.
  // This prevents "recorder not prepared" errors caused by the native
  // audio session retaining state from an orphaned recording.
  if (currentRecording) {
    try {
      await currentRecording.stopAndUnloadAsync();
    } catch (_) {
      // Already stopped — ignore
    }
    currentRecording = null;
  }

  // Reset audio mode first, then enable recording.
  // This forces iOS to tear down and re-create the audio session cleanly.
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const statusCallback = onMeteringUpdate
    ? (status: Audio.RecordingStatus) => {
        if (status.isRecording && status.metering !== undefined) {
          onMeteringUpdate(status.metering);
        }
      }
    : undefined;

  const { recording } = await Audio.Recording.createAsync(
    RECORDING_OPTIONS,
    statusCallback,
    onMeteringUpdate ? 100 : undefined
  );

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
 * Uses a 30s AbortController timeout to prevent indefinite hangs.
 */
export async function transcribeAudio(
  uri: string,
  mimeType = 'audio/m4a',
  language?: string
): Promise<string> {
  // Read the file as base64
  const base64Audio = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });

  // Check auth
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('User must be logged in to use voice input.');
  }

  // 30s timeout — prevents indefinite hang if edge function or OpenAI is unresponsive
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let data: any;
  let error: any;
  try {
    const result = await supabase.functions.invoke('whisper-proxy', {
      body: {
        audio: base64Audio,
        mimeType,
        language,
      },
      // @ts-ignore — signal is supported by fetch but not typed in supabase-js
      signal: controller.signal,
    });
    data = result.data;
    error = result.error;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Transkription hat zu lange gedauert. Bitte versuche es nochmal.');
    }
    throw e;
  }
  clearTimeout(timeoutId);

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
