'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function AudioInput({ onTranscript, className }: AudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      console.log('[AudioInput] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[AudioInput] Microphone access granted');

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log('[AudioInput] Audio chunk received:', e.data.size, 'bytes');
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[AudioInput] Recording stopped, total chunks:', chunksRef.current.length);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('[AudioInput] Audio blob created:', audioBlob.size, 'bytes');
        await transcribeAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('[AudioInput] Recording started');
    } catch (error: any) {
      console.error('[AudioInput] Error accessing microphone:', error);
      setError('Microphone access denied. Please check browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('[AudioInput] Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    try {
      console.log('[AudioInput] Starting transcription...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      console.log('[AudioInput] Transcription response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('[AudioInput] Transcription failed. Response:', responseText.substring(0, 500));

        // Try to parse as JSON, otherwise use the text
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Transcription failed');
        } catch (e) {
          throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`);
        }
      }

      const responseText = await response.text();
      console.log('[AudioInput] Raw response:', responseText.substring(0, 200));
      const data = JSON.parse(responseText);
      console.log('[AudioInput] Transcription successful:', data.text);

      if (data.text && data.text.trim()) {
        onTranscript(data.text);
      } else {
        throw new Error('No text was transcribed. Please try speaking more clearly.');
      }
    } catch (error: any) {
      console.error('[AudioInput] Transcription error:', error);
      setError(error.message || 'Transcription failed');
      alert(`Failed to transcribe audio: ${error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        className={cn(
          "gap-2 transition-all duration-200",
          isRecording && "animate-pulse shadow-lg shadow-red-500/50",
          !isRecording && "hover:bg-primary hover:text-primary-foreground",
          error && "border-red-500",
          className
        )}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Transcribing...</span>
          </>
        ) : isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            <span className="text-xs font-semibold">Stop</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            <span className="text-xs">Voice Input</span>
          </>
        )}
      </Button>

      {showTooltip && !isRecording && !isProcessing && (
        <div className="absolute z-50 -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-2">
          Click to speak instead of typing
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}

      {error && (
        <div className="absolute z-50 -bottom-10 left-0 w-48 p-2 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-md shadow-lg backdrop-blur-md">
          {error}
        </div>
      )}
    </div>
  );
}
