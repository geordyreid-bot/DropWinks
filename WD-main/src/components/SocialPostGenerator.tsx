import React, { useState } from 'react';
import { AIGeneratedContent, SocialMediaPost } from '@/types';
// FIX: Corrected import path from apiService to geminiService
import { generateSocialPosts } from '@/services/geminiService';
import { Icon } from '@/ui/Icon';

interface SocialPostGeneratorProps {
    aiContent: AIGeneratedContent;
    onClose?: () => void;
}

const platformIcons: Record<SocialMediaPost['platform'], React.ComponentProps<typeof Icon>['name']> = {
    X: 'twitter',
    Instagram: 'instagram',
    TikTok: 'tiktok',
    Generic: 'users'
};


export const SocialPostGenerator: React.FC<SocialPostGeneratorProps> = ({ aiContent, onClose }) => {
    const [keywords, setKeywords] = useState('');
    const [posts, setPosts] = useState<SocialMediaPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedPost, setCopiedPost] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keywords.trim()) return;
        setIsLoading(true);
        setError(null);
        setPosts([]);
        try {
            const generatedPosts = await generateSocialPosts(
                aiContent.possibleConditions,
                aiContent.resources,
                keywords
            );
            setPosts(generatedPosts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedPost(content);
        setTimeout(() => setCopiedPost(null), 2000);
    };

    return (
        <div className="bg-brand-secondary-50 p-4 rounded-lg border border-brand-secondary-200 relative animate-fade-in">
             {onClose && (
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-brand-secondary-200 transition-colors" aria-label="Close generator">
                    <Icon name="x" className="w-5 h-5 text-brand-text-secondary"/>
                </button>
             )}
            <h4 className="font-semibold text-brand-text-primary mb-2 text-md">Generate Social Posts</h4>
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Add keywords (e.g., hopeful, journey)"
                    className="flex-grow p-2 bg-white border border-brand-secondary-300 placeholder-brand-secondary-400 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!keywords.trim() || isLoading}
                    className="bg-brand-text-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-text-primary/90 transition-colors disabled:bg-slate-300 flex items-center justify-center gap-2"
                >
                     <Icon name={isLoading ? 'loader' : 'sparkles'} className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </form>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            
            <div className="mt-4 space-y-3">
                {isLoading && (
                    <div className="text-center py-4">
                        <Icon name="loader" className="w-6 h-6 text-brand-primary-500 animate-spin mx-auto" />
                        <p className="text-sm text-brand-text-secondary mt-2">Creating posts...</p>
                    </div>
                )}
                {posts.map((post, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-brand-secondary-200">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2">
                                <Icon name={platformIcons[post.platform]} className="w-5 h-5 text-brand-secondary-500" />
                                <h5 className="font-bold text-sm text-brand-text-primary">{post.platform} Post</h5>
                            </div>
                            <button onClick={() => handleCopy(post.content)} className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary-600 hover:text-brand-primary-800">
                                <Icon name={copiedPost === post.content ? 'check' : 'clipboardCheck'} className="w-3.5 h-3.5"/>
                                {copiedPost === post.content ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-sm text-brand-text-secondary mt-2 whitespace-pre-wrap">{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};