import { useState, useRef, useCallback, useEffect } from 'react';
import { SpeechTranscription } from './speechTranscription';

interface TranscriptionConfig {
  userId: string;
  visitId: string;
  language?: string;
  domain?: string;
}

export function useSpeechTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [status, setStatus] = useState<'ready' | 'recording' | 'processing' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState('');

  const speechTranscription = useRef(new SpeechTranscription());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (visualizerRef.current) clearInterval(visualizerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startVisualizer = useCallback(() => {
    const bars = Array(32).fill(0);
    setVisualizerData(bars);
    
    visualizerRef.current = setInterval(() => {
      const data = speechTranscription.current.getAudioVisualizationData();
      if (data) {
        const newBars = Array(32).fill(0).map((_, index) => {
          const value = data[Math.floor(index * data.length / 32)];
          return Math.max(5, (value / 255) * 50);
        });
        setVisualizerData(newBars);
      }
    }, 50);
  }, []);

  const stopVisualizer = useCallback(() => {
    if (visualizerRef.current) {
      clearInterval(visualizerRef.current);
      visualizerRef.current = null;
    }
    setVisualizerData([]);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setStatus('recording');
      setTranscript('');
      setErrorMessage('');
      
      await speechTranscription.current.startRecording();
      setIsRecording(true);
      
      startTimer();
      startVisualizer();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '录音启动失败');
    }
  }, [startTimer, startVisualizer]);

  const stopRecording = useCallback(async (config: TranscriptionConfig) => {
    try {
      setStatus('processing');
      setIsRecording(false);
      
      stopTimer();
      stopVisualizer();
      
      const audioBlob = await speechTranscription.current.stopRecording();
      
      const result = await speechTranscription.current.transcribeAudio(audioBlob, config);
      
      if (result.status === 'SUCCESS' && result.transcriptionText) {
        setTranscript(result.transcriptionText);
        setStatus('ready');
        return result.transcriptionText;
      } else {
        setStatus('error');
        setErrorMessage(result.errorMessage || '转录失败');
        return null;
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '处理录音失败');
      setIsRecording(false);
      stopTimer();
      stopVisualizer();
      return null;
    }
  }, [stopTimer, stopVisualizer]);

  const reset = useCallback(() => {
    setStatus('ready');
    setErrorMessage('');
    setTranscript('');
    setRecordingTime(0);
    setVisualizerData([]);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    transcript,
    recordingTime,
    visualizerData,
    status,
    errorMessage,
    startRecording,
    stopRecording,
    reset,
    formatTime
  };
}