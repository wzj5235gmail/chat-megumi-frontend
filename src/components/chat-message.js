import React, { useEffect, useRef } from "react"

function ChatMessage({ message, isUser, audioUrl, loading, translation, audioRef }) {
    const ref = useRef(null)

    useEffect(() => {
        if (ref.current) {
            if (isUser) {
                ref.current.classList.add("flex-row-reverse")
            } else {
                ref.current.classList.remove("flex-row-reverse")
            }
        }
    }, [isUser])

    const handlePlayAudio = () => {
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((error) => {
            alert('Error playing audio:', error);
        });
    };

    return (
        <div className="flex items-start gap-4 mb-4" ref={ref}>
            <div className="avatar rounded-full h-12">
                <img src={isUser ? '/user-avatar.jpg' : '/megumi-avatar.jpg'} alt="" className="object-cover h-full rounded-full" />
            </div>
            <div className="message rounded-lg"
                style={{
                    maxWidth: '60%',
                    backgroundColor: isUser ? '#8785a2' : '#ffe2e2',
                    color: isUser ? '#ffffff' : '#000000',
                }}>
                <div className="originalMsg py-2 px-4 text-start">
                    {
                        loading ?
                            <div className="flex gap-2 items-center">
                                <span className=" text-gray-400">对方正在说话...</span
                                ></div> :
                            message
                    }
                </div>
                {!isUser && translation &&
                    <div className="translation py-2 px-4 text-start border-t border-gray-300">
                        {translation}
                    </div>
                }
            </div>
            {audioUrl && (
                <button onClick={handlePlayAudio} className="play-audio-button self-center">
                    <img src="voice-icon.png" alt="" className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}

export default ChatMessage