import { Mic, StopCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useSpeechTranscription } from '../utils/useSpeechTranscription';

interface VoiceRecorderProps {
  userId: string;
  visitId: string;
  language?: string;
  domain?: string;
  onTranscriptComplete?: (transcript: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceRecorder({
  userId,
  visitId,
  language = 'autodialect',
  domain = 'medical',
  onTranscriptComplete,
  className = '',
  size = 'md'
}: VoiceRecorderProps) {
  const {
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
  } = useSpeechTranscription();

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    const result = await stopRecording({
      userId,
      visitId,
      language,
      domain
    });
    
    if (result && onTranscriptComplete) {
      onTranscriptComplete(result);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'w-8 h-8',
          button: 'text-sm px-3 py-2',
          timer: 'text-lg'
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'w-16 h-16',
          button: 'text-lg px-6 py-3',
          timer: 'text-2xl'
        };
      default:
        return {
          container: 'p-6',
          icon: 'w-12 h-12',
          button: 'text-base px-4 py-2',
          timer: 'text-xl'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 录音状态显示区域 */}
      <div className={`
        border-2 rounded-lg ${sizeClasses.container} text-center transition-all
        ${isRecording 
          ? 'border-red-500 bg-red-50' 
          : status === 'processing'
          ? 'border-blue-500 bg-blue-50'
          : status === 'error'
          ? 'border-red-500 bg-red-50'
          : 'border-gray-300 bg-gray-50'
        }
      `}>
        {isRecording ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <Mic className={`${sizeClasses.icon} text-red-500 animate-pulse`} />
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
              </div>
            </div>
            <p className="text-red-600">正在录音中...</p>
            <div className={`${sizeClasses.timer} font-bold text-red-600`}>
              {formatTime(recordingTime)}
            </div>
          </div>
        ) : status === 'processing' ? (
          <div className="space-y-3">
            <div className={`${sizeClasses.icon} mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin`} />
            <p className="text-blue-600">正在处理音频...</p>
            <p className="text-sm text-gray-600">AI正在转录您的语音</p>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-3">
            <AlertCircle className={`${sizeClasses.icon} text-red-500 mx-auto`} />
            <p className="text-red-600">录音失败</p>
            <p className="text-sm text-gray-600">{errorMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Mic className={`${sizeClasses.icon} text-gray-400 mx-auto`} />
            <p className="text-gray-600">点击下方按钮开始语音录制</p>
            <p className="text-sm text-gray-500">系统支持普通话及多种方言识别</p>
          </div>
        )}
      </div>

      {/* 音频可视化 */}
      {isRecording && visualizerData.length > 0 && (
        <div className="flex justify-center items-end h-12 gap-1">
          {visualizerData.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-red-500 rounded-sm transition-all duration-100"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex gap-3 justify-center">
        {!isRecording && status !== 'processing' ? (
          <Button 
            onClick={handleStartRecording}
            className={`gap-2 ${sizeClasses.button}`}
            disabled={status === 'error'}
          >
            <Mic className="w-4 h-4" />
            开始录音
          </Button>
        ) : isRecording ? (
          <Button 
            onClick={handleStopRecording}
            variant="destructive"
            className={`gap-2 ${sizeClasses.button}`}
          >
            <StopCircle className="w-4 h-4" />
            停止录音
          </Button>
        ) : null}
        
        {status === 'error' && (
          <Button 
            onClick={reset}
            variant="outline"
            className={`gap-2 ${sizeClasses.button}`}
          >
            重新开始
          </Button>
        )}
      </div>

      {/* 转录结果 */}
      {transcript && status === 'ready' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-900 mb-2">语音转录完成</p>
              <div className="p-3 bg-white border border-green-200 rounded text-sm">
                {transcript}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}