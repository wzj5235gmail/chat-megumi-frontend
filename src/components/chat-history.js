import React, { useRef, useEffect, memo } from 'react';
import ChatMessage from './chat-message';

const ChatHistory = ({ history, setHistory, audioRef }) => {
    const chatHistoryRef = useRef(null);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;
        fetch(`${process.env.REACT_APP_HOST}/api/conversations/${userId}`)
            .then(res => res.json())
            .then(data => {
                const historyFromDB = data.map(item => ({
                    time: item.created_at,
                    message: item.message,
                    role: item.role,
                    translation: item.translation,
                }))
                setHistory(historyFromDB)
            })
            .catch(e => {
                alert('获取历史记录失败')
                console.log(e)
            })
    }, [])

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [history]);


    return (
        <div
            id="history"
            className='chat-bg p-4 overflow-y-auto w-full flex-1'
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
                    isAudio={item.isAudio}
                />)}
        </div>
    )
}

export default memo(ChatHistory);