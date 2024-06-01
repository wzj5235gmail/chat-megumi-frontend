import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './chat-message';

// const backendHost = process.env.REACT_APP_MOBILE_HOST
const backendHost = process.env.REACT_APP_LOCAL_HOST
const https = 'http'

const ChatWithMegumi = () => {
    const [message, setMessage] = useState('');
    const [sendVoice, setSendVoice] = useState(false);
    const [history, setHistory] = useState([]);
    // const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef(new Audio());
    const chatHistoryRef = useRef(null);
    const recordBtnRef = useRef(null);
    let voiceMessage = ''
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);


    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [history]);

    const handleStopRecord = async () => {
        recordBtnRef.current.classList.remove('drop-shadow');
        recordBtnRef.current.classList.add('drop-shadow-lg');
        mediaRecorderRef.current.stop()
    };

    const getMimeType = () => {
        const ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod|mac/.test(ua) && !/chrome/.test(ua)) {
            return 'audio/mp4';
        } else if (/chrome/.test(ua)) {
            return 'audio/webm';
        } else {
            return 'audio/webm';
        }
    };

    const handleStartRecord = async () => {
        const mimeType = getMimeType();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support audio recording. Please use a modern browser.');
            return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        audioChunks.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.current.push(event.data);
            }
        };
        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            setHistory((prevHistory) => [...prevHistory, { time: Date.now(), role: 'user', message: '语音消息', audioUrl }]);
            // 创建 FormData 对象并添加音频文件
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            // 发送请求到 API
            try {
                const response = await fetch(`${https}://${backendHost}:8000/stt`, {
                    // const response = await fetch(`http://${backendHost}:8003/stt`, {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const data = await response.json()
                    voiceMessage = data.transcription
                    sendMessage(voiceMessage)
                } else {
                    console.error('Failed to upload audio file');
                }
            } catch (error) {
                console.error('Error while uploading audio file:', error);
            }

        };
        mediaRecorderRef.current.start();
        recordBtnRef.current.classList.remove('drop-shadow-lg');
        recordBtnRef.current.classList.add('drop-shadow');
    };

    const sendMessage = async (voiceMessage) => {
        if (sendVoice) {
            setHistory((prevHistory) => {
                if (prevHistory.length > 0) {
                    const newHistory = [...prevHistory];
                    newHistory[newHistory.length - 1].message = voiceMessage;
                    return newHistory;
                } else return [...prevHistory, { time: Date.now(), role: 'user', message: voiceMessage }]
            })
        } else {
            setHistory((prevHistory) => [...prevHistory, { time: Date.now(), role: 'user', message: message }]);
            setMessage('');
        }

        const chatResponse = await fetch(`${https}://${backendHost}:8000/chat`, {
            // const chatResponse = await fetch(`http://${backendHost}:8000/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: typeof voiceMessage === 'string' ? voiceMessage : message }),
        });

        let result = '';

        if (chatResponse.ok) {
            const data = await chatResponse.json();
            result = data.message;
            setHistory((prevHistory) => [...prevHistory, { time: Date.now(), role: 'megumi', message: result }]);
        }

        setHistory((prevHistory) => {
            const newHistory = [...prevHistory];
            newHistory[newHistory.length - 1].loading = true;
            return newHistory;
        });

        const audioResponse = await fetch(`${https}://${backendHost}:8001/generate_audio`, {
            // const audioResponse = await fetch(`http://${backendHost}:8001/generate_audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: result }),
        });

        // 翻译请求
        const translationResponse = await fetch(`${https}://${backendHost}:8000/translate`, {
            // const translationResponse = await fetch(`http://${backendHost}:8002/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: result }),
        });

        if (audioResponse.ok) {
            // 取消loading状态
            setHistory((prevHistory) => {
                const newHistory = [...prevHistory];
                newHistory[newHistory.length - 1].loading = false;
                return newHistory;
            });
            const blob = await audioResponse.blob();
            const url = window.URL.createObjectURL(blob);
            // 设置audioUrl
            setHistory((prevHistory) => {
                const newHistory = [...prevHistory];
                newHistory[newHistory.length - 1].audioUrl = url;
                return newHistory;
            });
            // 播放audio
            audioRef.current.src = url;
            audioRef.current.play();
        } else {
            alert('Failed to generate audio');
        }


        // 设置翻译结果
        if (translationResponse.ok) {
            const data = await translationResponse.json();
            setHistory((prevHistory) => {
                const newHistory = [...prevHistory];
                newHistory[newHistory.length - 1].translation = data.translation;
                return newHistory;
            });
        }
    };

    return (
        <div id="chat" className='flex flex-col justify-center h-screen'>
            <h1 className='text-xl font-semibold my-4'>加藤惠</h1>
            <div
                id="history"
                className='chat-bg p-4 overflow-y-auto rounded-lg w-full flex-1'
                style={{
                    height: '70vh',
                    backgroundImage: "url('bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                ref={chatHistoryRef}
            >
                {history.length > 0 && history.map(item =>
                    <ChatMessage
                        key={item.time}
                        message={item.message}
                        isUser={item.role === 'user'}
                        audioUrl={item.audioUrl}
                        loading={item.loading}
                        translation={item.translation}
                        audioRef={audioRef}
                    />)}
            </div>
            <div className="send-msg my-4 mx-2 flex gap-4 items-center">
                {sendVoice ?
                    <div className='flex gap-4 w-full'>
                        <button
                            onClick={() => setSendVoice(false)}
                            className='border px-4 py-2 rounded-lg'
                        >文</button>
                        <button
                            onMouseDown={handleStartRecord}
                            onMouseUp={handleStopRecord}
                            onTouchStart={handleStartRecord}
                            onTouchEnd={handleStopRecord}
                            className='border-2 border-red-400 text-red-400 px-4 py-2 rounded-lg flex-grow drop-shadow-lg'
                            ref={recordBtnRef}
                        >按住录音</button>
                    </div>
                    :
                    <div className='send-text flex w-full gap-4'>
                        <button
                            onClick={() => setSendVoice(true)}
                            className='border px-4 py-2 rounded-lg'
                        >音</button>
                        <input
                            type='text'
                            className='w-full p-2 border border-gray rounded-lg flex-grow'
                            id="message"
                            rows="1"
                            placeholder="请输入..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    sendMessage();
                                }
                            }}
                        ></input>
                        <button
                            id="send"
                            onClick={sendMessage}
                            className='px-4 py-2 rounded-lg min-w-20 border-2 border-red-400 text-red-400'
                        >
                            发送
                        </button>
                    </div>
                }
            </div>
        </div >
    );
};

export default ChatWithMegumi;
