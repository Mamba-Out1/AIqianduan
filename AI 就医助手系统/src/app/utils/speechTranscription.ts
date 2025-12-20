interface TranscriptionConfig {
  userId: string;
  visitId: string;
  language?: string;
  domain?: string;
}

interface TranscriptionResult {
  status: 'SUCCESS' | 'ERROR';
  transcriptionText?: string;
  fullText?: string;
  message?: string;
  errorMessage?: string;
}

export class SpeechTranscription {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording = false;

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      this.analyser.fftSize = 256;

      this.mediaRecorder.start(100);
      this.isRecording = true;

    } catch (error) {
      throw new Error(`录音失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('没有正在进行的录音'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const pcmBlob = await this.convertToPCM(audioBlob);
          
          this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
          
          this.isRecording = false;
          resolve(pcmBlob);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  private async convertToPCM(audioBlob: Blob): Promise<Blob> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const targetSampleRate = 16000;
    const channelData = audioBuffer.getChannelData(0);
    const samples = this.resample(channelData, audioBuffer.sampleRate, targetSampleRate);
    
    const pcmData = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    return new Blob([pcmData.buffer], { type: 'audio/pcm' });
  }

  private resample(buffer: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
    if (fromSampleRate === toSampleRate) return buffer;
    
    const sampleRateRatio = fromSampleRate / toSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const index = i * sampleRateRatio;
      const indexInt = Math.floor(index);
      const indexFrac = index - indexInt;
      
      if (indexInt < buffer.length - 1) {
        result[i] = buffer[indexInt] * (1 - indexFrac) + buffer[indexInt + 1] * indexFrac;
      } else {
        result[i] = buffer[indexInt] || 0;
      }
    }
    
    return result;
  }

  async transcribeAudio(audioBlob: Blob, config: TranscriptionConfig): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.pcm');
    formData.append('userId', config.userId);
    formData.append('visitId', config.visitId);
    formData.append('audioEncode', 'pcm_s16le');
    formData.append('sampleRate', '16000');
    formData.append('lang', config.language || 'autodialect');
    
    if (config.domain) {
      formData.append('pd', config.domain);
    }

    try {
      const response = await fetch('/api/transcription/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        return {
          status: 'SUCCESS',
          transcriptionText: data.transcriptionText || data.fullText || '',
          message: data.message
        };
      } else {
        return {
          status: 'ERROR',
          errorMessage: data.message || data.errorMessage || '转录失败'
        };
      }

    } catch (error) {
      return {
        status: 'ERROR',
        errorMessage: `转录失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  getAudioVisualizationData(): Uint8Array | null {
    if (!this.analyser || !this.isRecording) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }

  get recording(): boolean {
    return this.isRecording;
  }
}
