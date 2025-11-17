import React, { useState } from 'react';
import { Page, GiftCardSuggestion } from '@/types';
import { Icon } from '@/ui/Icon';
// FIX: Corrected import path from apiService to geminiService
import { generateGiftCardIdeas } from '@/services/geminiService';

interface GiftMarketplaceProps {
    navigate: (page: Page) => void;
}

export const GiftMarketplace: React.FC<GiftMarketplaceProps> = ({ navigate }) => {
    const [prompt, setPrompt] = useState('');
    const [suggestions, setSuggestions] = useState<GiftCardSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const results = await generateGiftCardIdeas(prompt);
            setSuggestions(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-2 sm:p-4 md:p-6">
            <div className="bg-brand-surface w-full max-w-2xl mx-auto rounded-2xl shadow-xl border border-brand-secondary-200/50 flex flex-col flex-1">
                {/* Header */}
                <div className="p-6 sm:p-8 flex-shrink-0">
                    <div className="relative">
                        <button onClick={() => navigate('Create Nudge')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                            <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">Digital Gift Cards</h1>
                    </div>
                    <p className="text-center text-brand-text-secondary mt-2">Find the perfect gift card to accompany your Nudge. Describe the person's interests and let our AI find thoughtful ideas.</p>
                    <div className="mt-4 text-center text-xs p-2 bg-brand-secondary-100 text-brand-text-secondary rounded-lg">
                        <strong>Please note:</strong> WinkDrops adds a small processing fee to all gift card purchases. This is a demonstration and no real purchases can be made.
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 space-y-6">
                    <div>
                        <label htmlFor="gift-prompt" className="block text-xl font-semibold text-brand-text-primary mb-2">Describe them</label>
                        <textarea
                            id="gift-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'My friend loves cozy video games, drinking tea, and their cat. They're feeling a bit stressed from work lately.'"
                            rows={4}
                            className="w-full p-3 bg-brand-secondary-50 border border-brand-secondary-200 placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                            <Icon name="warning" className="w-5 h-5"/> <span>{error}</span>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center p-8">
                            <Icon name="loader" className="w-10 h-10 text-brand-primary-500 animate-spin mx-auto" />
                            <p className="mt-3 text-brand-text-secondary">Finding perfect gifts...</p>
                        </div>
                    )}

                    {suggestions.length > 0 && !isLoading && (
                        <div className="space-y-4 animate-fade-in-up">
                            <h3 className="text-xl font-semibold text-brand-text-primary">Here are a few ideas:</h3>
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl border border-brand-secondary-200 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold uppercase text-brand-primary-600">{suggestion.category}</p>
                                            <h4 className="font-bold text-lg text-brand-text-primary">{suggestion.store}</h4>
                                        </div>
                                        <button className="text-sm font-bold bg-brand-primary-500 text-white px-4 py-2 rounded-lg hover:bg-brand-primary-600 interactive-scale">
                                            Select
                                        </button>
                                    </div>
                                    <p className="text-sm text-brand-text-secondary mt-2 italic">"{suggestion.reasoning}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-8 flex-shrink-0">
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isLoading}
                        className="w-full bg-brand-secondary-800 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand-secondary-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-scale"
                    >
                        <Icon name={isLoading ? 'loader' : 'sparkles'} className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        Generate Ideas
                    </button>
                </div>
            </div>
        </div>
    );
};