import React, { useState, useRef, useEffect } from 'react';
import './VoiceInput.css';

export default function VoiceInput({ onSubmit }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState(false);
  const [isXunfeiListening, setIsXunfeiListening] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    // 检查浏览器是否支持 Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsWebSpeechSupported(true);
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'zh-CN';

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setText(prev => prev + transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
    };
  }, []);

  // 使用科大讯飞作为后备方案
  const startXunfeiRecognition = async () => {
    setIsXunfeiListening(true);
    try {
      const response = await fetch('/api/xunfei/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId: process.env.XUNFEI_APP_ID,
          apiKey: process.env.XUNFEI_API_KEY
        })
      });
      if (!response.ok) throw new Error('Failed to start recognition');
      
      // 这里应该建立 WebSocket 连接来接收实时语音识别结果
      // 示例代码省略了具体实现
      
    } catch (error) {
      console.error('Xunfei recognition error:', error);
      setIsXunfeiListening(false);
    }
  };

  const toggleListening = () => {
    if (isWebSpeechSupported) {
      if (!isListening) {
        recognition.current.start();
        setIsListening(true);
      } else {
        recognition.current.stop();
        setIsListening(false);
      }
    } else {
      // 使用科大讯飞作为后备方案
      if (!isXunfeiListening) {
        startXunfeiRecognition();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="voice-input">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="请输入或点击语音按钮描述您的旅行需求（例如：我想去日本，预算1万元，喜欢美食和动漫文化，5天行程）"
            rows={4}
          />
          <button
            type="button"
            className={`voice-button ${isListening || isXunfeiListening ? 'listening' : ''}`}
            onClick={toggleListening}
            title={!isWebSpeechSupported ? "将使用科大讯飞语音识别" : "使用浏览器语音识别"}
          >
            {isListening || isXunfeiListening ? '停止录音' : '语音输入'}
          </button>
        </div>
        <button type="submit" className="submit-button" disabled={!text.trim()}>
          生成行程规划
        </button>
      </form>
    </div>
  );
}
