'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { X, Send, User, Phone, Loader2 } from 'lucide-react';
import { saveAiLead } from '@/lib/chatbot-service';

export default function LittleAduChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'name' | 'phone' | 'chat'>('name');
    const [leadContent, setLeadContent] = useState({ name: '', phone: '' });
    const [inputValue, setInputValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/ai-chat',
        initialMessages: [],
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, step]);

    const toggleChat = () => setIsOpen(!isOpen);

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[0-9+\s-]{10,15}$/;
        return phoneRegex.test(phone);
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (step === 'name') {
            if (inputValue.trim().length < 2) {
                setErrorMsg('Please enter a valid name.');
                return;
            }
            setLeadContent({ ...leadContent, name: inputValue.trim() });
            setInputValue('');
            setStep('phone');
        } else if (step === 'phone') {
            if (!validatePhone(inputValue)) {
                setErrorMsg('Please enter a valid phone number (e.g. 10 digits).');
                return;
            }
            const finalPhone = inputValue.trim();
            setLeadContent({ ...leadContent, phone: finalPhone });
            setInputValue('');
            setIsSaving(true);

            const response = await saveAiLead({
                name: leadContent.name,
                phone: finalPhone,
            });

            setIsSaving(false);
            if (response.success) {
                setStep('chat');
            } else {
                setErrorMsg('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center animate-bounce duration-[2000]"
                    aria-label="Open Little Adu Chat"
                >
                    <div className="relative">
                        <span className="text-3xl">🧸</span>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-[350px] sm:w-[380px] h-[500px] max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 flex-shrink-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-400 to-primary p-4 flex justify-between items-center text-white shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/30">
                                <span className="text-2xl block drop-shadow-md">🧸</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg tracking-wide">Little Adu</h3>
                                <p className="text-xs text-white/90">AI Assistant • Online</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">

                        {/* Step 1 & 2: Lead Collection Flow */}
                        {step !== 'chat' && (
                            <div className="space-y-4">
                                {/* Initial Greeting */}
                                <div className="flex items-start gap-2">
                                    <div className="bg-blue-100/50 p-1.5 rounded-full flex-shrink-0 border border-blue-200">
                                        <span className="text-sm">🧸</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-sm text-gray-800">
                                        Hi 👋 I'm Little Adu! I can help you with house plans and Vastu. What is your good name?
                                    </div>
                                </div>

                                {/* Name Response (Shown if in phone step) */}
                                {step === 'phone' && (
                                    <>
                                        <div className="flex items-start gap-2 justify-end">
                                            <div className="bg-primary p-3 rounded-2xl rounded-tr-sm shadow-sm text-sm text-white">
                                                {leadContent.name}
                                            </div>
                                        </div>
                                        {/* Ask Phone Number */}
                                        <div className="flex items-start gap-2">
                                            <div className="bg-blue-100/50 p-1.5 rounded-full flex-shrink-0 border border-blue-200">
                                                <span className="text-sm">🧸</span>
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-sm text-gray-800">
                                                Thank you {leadContent.name} 😊 Can I have your phone number so our team can guide you properly?
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: AI Chat Flow */}
                        {step === 'chat' && (
                            <>
                                <div className="flex items-start gap-2">
                                    <div className="bg-blue-100/50 p-1.5 rounded-full flex-shrink-0 border border-blue-200">
                                        <span className="text-sm">🧸</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-sm text-gray-800">
                                        Thanks, {leadContent.name}! How can I help you regarding home construction today?
                                    </div>
                                </div>
                                {messages.map((m: any) => (
                                    <div
                                        key={m.id}
                                        className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {m.role !== 'user' && (
                                            <div className="bg-blue-100/50 p-1.5 rounded-full flex-shrink-0 border border-blue-200 mt-1">
                                                <span className="text-sm">🧸</span>
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${m.role === 'user'
                                                ? 'bg-primary text-white rounded-tr-sm'
                                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                                                }`}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-2">
                                        <div className="bg-blue-100/50 p-1.5 rounded-full flex-shrink-0 border border-blue-200">
                                            <span className="text-sm">🧸</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-sm text-gray-500 flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Adu is typing...
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        {errorMsg && (
                            <p className="text-xs text-red-500 mb-2 px-2 animate-pulse">{errorMsg}</p>
                        )}

                        {step !== 'chat' ? (
                            <form onSubmit={handleLeadSubmit} className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                <div className="p-2 text-gray-400 bg-white rounded-full shadow-sm">
                                    {step === 'name' ? <User size={16} /> : <Phone size={16} />}
                                </div>
                                <input
                                    type={step === 'name' ? 'text' : 'tel'}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={step === 'name' ? 'Type your name...' : 'Type your phone number...'}
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-1.5 h-full w-full"
                                    disabled={isSaving}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isSaving}
                                    className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 text-white p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                <input
                                    name="prompt"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask Little Adu about your dream home..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm px-4 py-1.5 h-full w-full"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 text-white p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
