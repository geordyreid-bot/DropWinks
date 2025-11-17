import React, { useState } from 'react';
import { Wink, Category, CommunityExperience, ReactionType, SocialMediaPost } from '@/types';
import { Icon } from '@/ui/Icon';
import { CATEGORIES, REACTIONS, MOCK_SOCIAL_POSTS } from '@/constants';

const WINKS_PER_PAGE = 5;

interface CommunityFeedProps {
    winks: Wink[];
    experiences: CommunityExperience[];
    onReact: (winkId: string, reaction: ReactionType) => void;
    onAddExperience: (experience: Omit<CommunityExperience, 'id' | 'timestamp'>) => void;
}

const ShareExperienceCard: React.FC<{ onAddExperience: (text: string) => void }> = ({ onAddExperience }) => {
    const [text, setText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAddExperience(text.trim());
        setText('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    if (submitted) {
        return (
            <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-center border-2 border-emerald-200 animate-fade-in">
                <Icon name="check" className="w-10 h-10 mx-auto mb-2" />
                <h3 className="font-bold">Thank you for sharing!</h3>
                <p className="text-sm">Your story helps others feel less alone.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-brand-secondary-50 p-6 rounded-2xl border-2 border-dashed border-brand-secondary-300">
            <h3 className="text-lg font-bold text-brand-text-primary text-center">Share Your Experience</h3>
            <p className="text-center text-brand-text-secondary text-sm mt-1 mb-4">How has an anonymous Wink made a difference for you or someone you know? Help inspire others.</p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., 'Getting a Wink was a turning point...'"
                className="w-full p-3 bg-white border border-brand-secondary-300 placeholder-brand-secondary-400 rounded-lg focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                rows={3}
                aria-label="Share your experience"
            />
            <button
                type="submit"
                disabled={!text.trim()}
                className="w-full mt-3 bg-brand-secondary-600 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-brand-secondary-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-scale"
            >
                <Icon name="send" className="w-5 h-5" />
                Share Anonymously
            </button>
        </form>
    );
};

const WellnessBanner: React.FC = () => (
    <div className="bg-gradient-to-br from-brand-primary-400 to-brand-accent-400 text-white p-6 rounded-2xl shadow-lg text-center my-12">
        <Icon name="share" className="w-10 h-10 mx-auto mb-3" />
        <h3 className="text-2xl font-bold">Share Winks for Wellness</h3>
        <p className="mt-1 font-semibold">@WinkDrops #thanksanonymous</p>
    </div>
);

const SocialPostCard: React.FC<{ post: SocialMediaPost }> = ({ post }) => {
    const platformIcons: Record<SocialMediaPost['platform'], React.ComponentProps<typeof Icon>['name']> = {
        X: 'twitter',
        Instagram: 'instagram',
        TikTok: 'tiktok',
        Generic: 'users'
    };

    return (
        <div className="bg-brand-surface p-5 rounded-2xl shadow-lg border border-brand-secondary-200/50">
            <div className="flex items-center gap-3 mb-3">
                 <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${post.platform === 'X' ? 'bg-black text-white' : post.platform === 'Instagram' ? 'bg-pink-500 text-white' : 'bg-brand-secondary-100 text-brand-secondary-600'}`}>
                    <Icon name={platformIcons[post.platform]} className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-brand-text-primary">{post.user.name}</p>
                    <p className="text-sm text-brand-text-secondary">{post.user.handle}</p>
                </div>
            </div>
            <p className="text-brand-text-secondary whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-brand-secondary-200 text-brand-text-secondary text-sm">
                <div className="flex items-center gap-1.5">
                    <Icon name="heart" className="w-4 h-4" />
                    <span>{post.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Icon name="sendHorizontal" className="w-4 h-4" />
                    <span>{post.comments.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};


export const CommunityFeed: React.FC<CommunityFeedProps> = ({ winks, experiences, onReact, onAddExperience }) => {
    const [filter, setFilter] = useState<Category | 'All'>('All');
    
    const handleAddExperience = (text: string) => {
        const newExperience: Omit<CommunityExperience, 'id' | 'timestamp'> = {
            text,
        };
        onAddExperience(newExperience);
    };

    const filteredWinks = winks.filter(wink => 
        filter === 'All' || wink.observables.some(obs => obs.category === filter)
    );

    const [visibleCount, setVisibleCount] = useState(WINKS_PER_PAGE);

    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + WINKS_PER_PAGE);
    };

    const visibleWinks = filteredWinks.slice(0, visibleCount);
    
    const sortedExperiences = [...experiences].sort((a,b) => b.timestamp.toMillis() - a.timestamp.toMillis());

    return (
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="text-center mb-12 max-w-2xl mx-auto">
                <div className="relative inline-block">
                    <div className="absolute -inset-2 bg-gradient-to-br from-brand-primary-300 to-brand-accent-300 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-24 h-24 bg-brand-primary-100 text-brand-primary-500 mx-auto rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <Icon name="users" className="w-12 h-12"/>
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-brand-text-primary mt-6">A Stream of Shared Humanity</h1>
                <p className="text-brand-text-secondary mt-2">You're not alone. See anonymous Winks, read stories, and add your support to a community that cares.</p>
            </div>
            
            <div className="max-w-xl mx-auto space-y-12">
                <section>
                    <ShareExperienceCard onAddExperience={handleAddExperience} />
                    {sortedExperiences.length > 0 && (
                        <div className="mt-8 space-y-4">
                            {sortedExperiences.slice(0, 2).map(exp => (
                                <div key={exp.id} className="bg-brand-surface p-5 rounded-2xl shadow-md border border-brand-secondary-200 flex gap-4">
                                    <Icon name="quote" className="w-8 h-8 text-brand-primary-400 flex-shrink-0 mt-1" />
                                    <p className="text-brand-text-secondary italic">"{exp.text}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                
                <section>
                    <WellnessBanner />
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-brand-text-primary text-center mb-6">Seen on Social Media</h2>
                    <div className="space-y-6">
                        {MOCK_SOCIAL_POSTS.map((post, index) => (
                             <div key={index} className="animate-fade-in-up-subtle" style={{ animationDelay: `${index * 100}ms`}}>
                                <SocialPostCard post={post} />
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-brand-text-primary text-center mb-6">Community Feed</h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {(['All', ...CATEGORIES] as const).map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setFilter(category);
                                    setVisibleCount(WINKS_PER_PAGE); // Reset pagination on filter change
                                }}
                                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors interactive-scale ${
                                    filter === category 
                                    ? 'bg-brand-primary-500 text-white border-brand-primary-500' 
                                    : 'bg-brand-surface text-brand-text-secondary border-brand-secondary-200 hover:bg-brand-secondary-100'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {visibleWinks.length > 0 ? visibleWinks.map((wink, index) => (
                            <div key={wink.id} className="bg-brand-surface p-5 rounded-2xl shadow-lg border border-brand-secondary-200/50 animate-fade-in-up-subtle" style={{ animationDelay: `${index * 50}ms`}}>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-brand-primary-100 text-brand-primary-600">
                                        <Icon name="eye" className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-brand-text-primary">
                                            <span className="font-bold">Someone in {wink.senderLocation || 'their community'}</span> dropped a wink regarding:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {wink.observables.map(obs => (
                                                <span key={obs.id} className="text-xs bg-brand-secondary-100 text-brand-text-secondary px-2 py-1 rounded-full font-medium">
                                                    {obs.category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-brand-secondary-200 flex justify-around">
                                    {REACTIONS.map(reaction => (
                                        <button 
                                            key={reaction.id}
                                            onClick={() => onReact(wink.id, reaction.id)}
                                            className="flex items-center gap-2 text-sm font-medium text-brand-text-secondary hover:text-brand-primary-600 transition-colors interactive-scale"
                                            aria-label={`${reaction.text}: ${wink.reactions?.[reaction.id] || 0} reactions`}
                                        >
                                            <Icon name={reaction.icon} className="w-5 h-5" />
                                            <span>{wink.reactions?.[reaction.id] || 0}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <Icon name="search" className="w-12 h-12 text-brand-secondary-300 mx-auto" />
                                <p className="mt-2 text-brand-text-secondary">No winks found for this category.</p>
                            </div>
                        )}
                    </div>

                    {visibleCount < filteredWinks.length && (
                        <div className="text-center mt-8">
                            <button
                                onClick={handleLoadMore}
                                className="bg-brand-primary-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-brand-primary-600 transition-colors flex items-center justify-center gap-2 mx-auto interactive-scale"
                            >
                                <Icon name="chevronDown" className="w-5 h-5" />
                                Load More
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
