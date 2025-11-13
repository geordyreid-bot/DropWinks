import React, { useState, useRef, useEffect } from 'react';
import { Page, ForumMessage } from '../../types';
import { Icon } from '../ui/Icon';

interface WinkSocialProps {
    navigate: (page: Page) => void;
    forums: Record<string, ForumMessage[]>;
    followedForums: string[];
    followedUsers: string[];
    onFollow: (type: 'forum' | 'user', id: string) => void;
    onUnfollow: (type: 'forum' | 'user', id: string) => void;
    onAddForumMessage: (forumId: string, message: ForumMessage) => void;
}

const MOCK_CONDITIONS = ["Burnout", "Depression", "Anxiety", "Stress", "Grief", "ADHD"];

const ChatView: React.FC<{
    condition: string;
    messages: ForumMessage[];
    followedUsers: string[];
    onBack: () => void;
    onFollow: (type: 'user', id: string) => void;
    onUnfollow: (type: 'user', id: string) => void;
    onAddMessage: (message: Omit<ForumMessage, 'id' | 'timestamp'>) => void;
}> = ({ condition, messages, followedUsers, onBack, onFollow, onUnfollow, onAddMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const newMsg: Omit<ForumMessage, 'id' | 'timestamp'> = {
            userId: 'currentUser', // This would be the actual user ID in a real app
            userName: 'You', // This would be the user's display name
            text: newMessage.trim(),
            avatarColor: 'bg-violet-200',
        };
        onAddMessage(newMsg);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full animate-fade-in-up">
            {/* Header */}
            <div className="p-4 sm:p-6 flex-shrink-0 border-b border-brand-secondary-200">
                <div className="relative">
                    <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                        <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">{condition}</h1>
                        <p className="text-sm text-brand-text-secondary">Anonymous Forum</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((msg) => {
                    const isFollowed = followedUsers.includes(msg.userId);
                    return (
                        <div key={msg.id} className="flex items-start gap-3 group">
                            <div className={`w-10 h-10 rounded-full ${msg.avatarColor} flex-shrink-0 flex items-center justify-center font-bold text-xs`}>
                                {msg.userName.substring(0, 2)}
                            </div>
                            <div className="bg-brand-secondary-100 p-3 rounded-lg max-w-[80%]">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-brand-text-primary">{msg.userName}</p>
                                    {msg.userId !== 'currentUser' && (
                                        <button 
                                            onClick={() => isFollowed ? onUnfollow('user', msg.userId) : onFollow('user', msg.userId)}
                                            className={`ml-3 text-xs font-semibold flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100 ${isFollowed ? 'text-amber-600' : 'text-brand-text-secondary'}`}
                                            aria-label={isFollowed ? `Unfollow ${msg.userName}` : `Follow ${msg.userName}`}
                                        >
                                            <Icon name="star" className={`w-3 h-3 ${isFollowed ? 'fill-current' : ''}`} />
                                            {isFollowed ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-brand-text-primary mt-1">{msg.text}</p>
                                <p className="text-xs text-brand-text-secondary/70 mt-1.5 text-right">{msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 sm:p-6 flex-shrink-0 border-t border-brand-secondary-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Share your thoughts anonymously..."
                        className="w-full p-3 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-brand-primary-500 text-white rounded-lg shadow-sm hover:bg-brand-primary-600 disabled:bg-slate-300 interactive-scale" aria-label="Send message">
                        <Icon name="send" className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export const WinkSocial: React.FC<WinkSocialProps> = ({ navigate, forums, followedForums, followedUsers, onFollow, onUnfollow, onAddForumMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

    const filteredConditions = MOCK_CONDITIONS.filter(c =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCondition) {
        return <ChatView 
            condition={selectedCondition} 
            messages={forums[selectedCondition] || []}
            followedUsers={followedUsers}
            onBack={() => setSelectedCondition(null)} 
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onAddMessage={(message) => onAddForumMessage(selectedCondition, message as ForumMessage)}
        />;
    }

    return (
        <div className="flex flex-col h-full p-2 sm:p-4 md:p-6">
            <div className="bg-brand-surface w-full max-w-2xl mx-auto rounded-2xl shadow-xl border border-brand-secondary-200/50 flex flex-col flex-1">
                {/* Header */}
                <div className="p-6 sm:p-8 flex-shrink-0">
                    <div className="relative">
                        <button onClick={() => navigate('Dashboard')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors" aria-label="Back to Dashboard">
                            <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">Wink Social</h1>
                    </div>
                    <p className="text-center text-brand-text-secondary mt-2">Find anonymous forums to connect with others who may be experiencing similar things. You are not alone.</p>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6">
                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for a condition..."
                            className="w-full p-3 pl-10 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary/50"/>
                    </div>
                    
                    <div className="space-y-3">
                        {filteredConditions.map(condition => {
                            const isFollowed = followedForums.includes(condition);
                            return (
                                <div
                                    key={condition}
                                    className="w-full flex justify-between items-center p-4 bg-white border border-brand-secondary-200 rounded-xl group"
                                >
                                    <button onClick={() => setSelectedCondition(condition)} className="flex-grow text-left">
                                        <span className="font-bold text-lg text-brand-text-primary group-hover:text-brand-primary-600">{condition}</span>
                                    </button>
                                    <button 
                                        onClick={() => isFollowed ? onUnfollow('forum', condition) : onFollow('forum', condition)}
                                        className={`flex items-center gap-1.5 text-sm font-semibold p-2 rounded-lg transition-colors ${isFollowed ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-brand-secondary-100 text-brand-secondary-600 hover:bg-brand-secondary-200'}`}
                                        aria-label={isFollowed ? `Unfollow ${condition} forum` : `Follow ${condition} forum`}
                                    >
                                        <Icon name="star" className={`w-4 h-4 transition-colors ${isFollowed ? 'text-amber-500 fill-current' : ''}`}/>
                                        {isFollowed ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
