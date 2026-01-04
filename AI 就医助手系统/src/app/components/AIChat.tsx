import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { VoiceRecorder } from './VoiceRecorder';
import { MessageCircle, Send, Mic, Bot, User, Loader2 } from 'lucide-react';

interface AIChatProps {
  largeText: boolean;
  highContrast: boolean;
  patientId: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat({ largeText, highContrast, patientId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '您好！我是AI医疗助手，可以为您提供健康咨询、症状分析和就医指导。请问有什么可以帮助您的吗？',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        userInput: content.trim(),
        userId: patientId
      });
      
      if (conversationId) {
        params.append('conversationId', conversationId);
      }

      const response = await fetch(`/api/dify/chat?${params}`, {
        method: 'POST',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.event === 'message' && data.answer) {
                assistantMessage.content += data.answer;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                );
              }
              
              if (data.conversation_id && !conversationId) {
                setConversationId(data.conversation_id);
              }
            } catch (e) {
              console.warn('解析SSE数据失败:', line);
            }
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: '抱歉，我暂时无法回复您的消息。请稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputText(transcript);
    setShowVoiceRecorder(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-teal-600" />
        <h2 className={`font-semibold ${largeText ? 'text-2xl' : 'text-xl'} ${
          highContrast ? 'text-black' : 'text-gray-800'
        }`}>
          AI医疗助手
        </h2>
      </div>

      <Card className={`h-[600px] flex flex-col ${
        highContrast ? 'bg-white border-2 border-black' : 'bg-white'
      }`}>
        {/* 消息区域 */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[70%] ${
                  message.type === 'user' ? 'order-1' : ''
                }`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? highContrast 
                        ? 'bg-black text-white'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : highContrast
                        ? 'bg-gray-100 border border-black text-black'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className={`whitespace-pre-wrap ${largeText ? 'text-lg' : ''}`}>
                      {message.content}
                    </p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  } ${highContrast ? 'text-gray-700' : ''}`}>
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {message.type === 'user' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className={
                      highContrast 
                        ? 'bg-gray-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    }>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%]">
                  <div className={`rounded-2xl px-4 py-3 ${
                    highContrast
                      ? 'bg-gray-100 border border-black'
                      : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                      <span className={`text-gray-600 ${largeText ? 'text-lg' : ''}`}>
                        AI正在思考中...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 语音录制区域 */}
        {showVoiceRecorder && (
          <div className="p-4 border-t bg-gray-50">
            <VoiceRecorder
              userId={patientId}
              visitId="visit_000"
              language="autodialect"
              domain="medical"
              onTranscriptComplete={handleVoiceTranscript}
              size="sm"
            />
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceRecorder(false)}
              >
                取消录音
              </Button>
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className={`p-4 border-t ${
          highContrast ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                disabled={isLoading}
                className={`pr-12 ${largeText ? 'text-lg py-3' : ''} ${
                  highContrast ? 'border-black' : ''
                }`}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                disabled={isLoading}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className={`gap-2 ${largeText ? 'px-6 py-3' : ''} ${
                highContrast 
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
              }`}
            >
              <Send className="w-4 h-4" />
              {largeText ? '发送' : ''}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xs text-gray-500 ${
              highContrast ? 'text-gray-700' : ''
            }`}>
              按 Enter 发送，Shift + Enter 换行
            </p>
            <p className={`text-xs text-gray-500 ${
              highContrast ? 'text-gray-700' : ''
            }`}>
              点击麦克风图标进行语音输入
            </p>
          </div>
        </div>
      </Card>

      {/* 使用提示 */}
      <Card className={`p-4 ${
        highContrast ? 'bg-white border-2 border-black' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="space-y-2">
          <h3 className={`font-medium ${largeText ? 'text-lg' : ''} ${
            highContrast ? 'text-black' : 'text-blue-800'
          }`}>
            💡 使用提示
          </h3>
          <ul className={`space-y-1 text-sm ${largeText ? 'text-base' : ''} ${
            highContrast ? 'text-black' : 'text-blue-700'
          }`}>
            <li>• 您可以咨询健康问题、症状分析、用药指导等</li>
            <li>• 支持文字输入和语音输入两种方式</li>
            <li>• AI助手会根据您的描述提供专业建议</li>
            <li>• 如需紧急医疗帮助，请立即拨打120或前往医院</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}