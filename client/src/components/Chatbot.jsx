import { useState, useRef, useEffect } from 'react';
import {
    HiOutlineChatBubbleLeftRight,
    HiOutlineXMark,
    HiOutlinePaperAirplane,
    HiOutlineSparkles,
} from 'react-icons/hi2';
import api from '../utils/api';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "Hello! 👋 I'm **NexusBot**, your AI banking assistant. Ask me about your balance, spending, or type **help** to see what I can do!",
            suggestions: ['Check balance', 'Recent transactions', 'Help'],
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        const userMessage = text || input.trim();
        if (!userMessage) return;

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const { data } = await api.post('/ai/chat', { message: userMessage });
            setMessages((prev) => [
                ...prev,
                {
                    role: 'bot',
                    text: data.response,
                    suggestions: data.suggestions,
                    intent: data.intent,
                    confidence: data.confidence,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'bot',
                    text: "Sorry, I'm having trouble right now. Please try again later.",
                    suggestions: ['Help'],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Simple markdown-like bold rendering
    const renderText = (text) => {
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center ${isOpen
                        ? 'bg-dark-700 rotate-0 scale-90'
                        : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:scale-110 shadow-violet-500/40'
                    }`}
            >
                {isOpen ? (
                    <HiOutlineXMark className="w-6 h-6 text-white" />
                ) : (
                    <HiOutlineChatBubbleLeftRight className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-dark-100 dark:border-dark-800 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <HiOutlineSparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">NexusBot</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-white/70 text-xs">AI Assistant • Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                                            : 'bg-dark-50 dark:bg-dark-800 text-dark-700 dark:text-dark-200 rounded-bl-md'
                                        }`}
                                >
                                    {renderText(msg.text)}

                                    {/* Suggestions */}
                                    {msg.suggestions && msg.role === 'bot' && (
                                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-dark-200/30 dark:border-dark-700/50">
                                            {msg.suggestions.map((suggestion, j) => (
                                                <button
                                                    key={j}
                                                    onClick={() => sendMessage(suggestion)}
                                                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-dark-700 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-dark-600 transition-colors border border-violet-200 dark:border-dark-600"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-dark-50 dark:bg-dark-800 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-dark-100 dark:border-dark-800">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-50 dark:bg-dark-800 text-dark-800 dark:text-dark-100 text-sm placeholder-dark-400 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                            >
                                <HiOutlinePaperAirplane className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chatbot;
