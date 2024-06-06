import SendMsg from './send-msg';
import ChatHistory from './chat-history';
import { useState, useRef, useEffect, memo } from 'react';
import Login from './login';

const ChatWithMegumi = () => {
    const [history, setHistory] = useState([])
    const audioRef = useRef(new Audio());
    const [isRecording, setIsRecording] = useState(false)
    const [isLogin, setIsLogin] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const expires_at = localStorage.getItem('token_expire_at')
        if (!token || Date.now() / 1000 > Number(expires_at)) {
            setIsLogin(false)
        }
    }, [])

    return (
        <div
            id="chat"
            className='flex flex-col justify-center'
            style={{ height: '85vh' }}
        >
            {!isLogin &&
                <Login setIsLogin={setIsLogin} />
            }
            {isLogin && <>
                <h1 className='text-xl font-semibold my-4'>加藤惠</h1>
                <ChatHistory {...{ history, setHistory, audioRef, isRecording }} />
                <SendMsg {...{ setHistory, setIsRecording, audioRef }} />
                {isRecording && (
                    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-select'>
                        <span className='text-white text-lg'>正在录音...（手指上划可取消录音）</span>
                    </div>
                )}</>}
        </div >
    );
};

export default memo(ChatWithMegumi);
