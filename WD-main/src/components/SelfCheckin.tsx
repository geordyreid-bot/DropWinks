import React, { useState, useRef, useEffect } from 'react';
import { Observable, Category, AIGeneratedContent, Page, Wink } from '../types';
import { CATEGORIES, OBSERVABLES } from '../constants';
import { generateWinkContent, generateObservableSuggestions } from '../services/geminiService';
import { Icon } from './ui/Icon';
import { WinkDetailView } from './WinkDetailView';
import { MentalHealthDisclaimer } from './ui/MentalHealthDisclaimer';


interface SelfCheckinProps {
    navigate: (page: Page) => void;
}

const categoryIcons: Record<Category, React.ComponentProps<typeof Icon>['name']> = {
    'Physical': 'heart', 'Mental': 'brain', 'Nutritional': 'apple', 'Hygiene': 'droplets', 'Social': 'users', 'Behavioral': 'activity'
};

export const SelfCheckin: React.FC<SelfCheckinProps> = ({ navigate }) => {
    const [selectedObservables, setSelectedObservables] = useState<Observable[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
    const [observableSearch, setObservableSearch] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set());
    const [fullyShownCategories, setFullyShownCategories] = useState<Set<Category>>(new Set());
    
    // AI Suggestion State
    const [aiSuggestionDescription, setAiSuggestionDescription] = useState('');
    const [aiSuggestedObservables, setAiSuggestedObservables] = useState<{ text: string, category: Category }[]>([]);
    const [isGeneratingObservables, setIsGeneratingObservables] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    const selfCheckinRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selfCheckinRef.current) {
            selfCheckinRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [aiContent]);

    useEffect(() => {
        if (observableSearch) {
            const categoriesWithMatches = new Set<Category>();
            OBSERVABLES.forEach(o => {
                const term = observableSearch.toLowerCase();
                const inText = o.text.toLowerCase().includes(term);
                const inKeywords = o.keywords?.some(k => k.toLowerCase().includes(term));
                if (inText || inKeywords) {
                    categoriesWithMatches.add(o.category);
                }
            });
            setExpandedCategories(categoriesWithMatches);
            setFullyShownCategories(categoriesWithMatches);
        } else {
            setExpandedCategories(new Set());
            setFullyShownCategories(new Set());
        }
    }, [observableSearch]);


    const hasMentalHealthConcern = selectedObservables.some(obs => obs.category === 'Mental');

    const handleObservableToggle = (observable: Observable) => {
        setSelectedObservables(prev =>
            prev.some(o => o.id === observable.id)
                ? prev.filter(o => o.id !== observable.id)
                : [...prev, observable]
        );
    };

    const handleSubmit = async () => {
        if (selectedObservables.length === 0) return;
        setIsLoading(true);
        setError(null);
        setAiContent(null);
        try {
            const content = await generateWinkContent(selectedObservables);
            setAiContent(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateObservableSuggestions = async () => {
        if (!aiSuggestionDescription.trim()) return;
        setIsGeneratingObservables(true);
        setSuggestionError(null);
        setAiSuggestedObservables([]);
        try {
            const suggestions = await generateObservableSuggestions(aiSuggestionDescription);
            setAiSuggestedObservables(suggestions);
        } catch (err) {
            setSuggestionError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGeneratingObservables(false);
        }
    };
    
    const toggleCategory = (category: Category) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const toggleShowMore = (category: Category) => {
        setFullyShownCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };
    
    if (aiContent) {
        const mockWinkForDisplay: Wink = {
            id: 'self-checkin-wink', type: 'Wink', recipient: 'You',
            observables: selectedObservables, aiContent, timestamp: new Date(), isRead: true,
        };
        return (
            <div ref={selfCheckinRef} className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="bg-brand-surface p-4 sm:p-6 rounded-2xl shadow-xl border border-brand-secondary-200/50 animate-fade-in">
                    <div className="relative mb-8">
                        <button onClick={() => setAiContent(null)} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                            <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-center text-brand-text-primary">Your Private Insights</h2>
                    </div>
                    {hasMentalHealthConcern && <MentalHealthDisclaimer />}
                    <WinkDetailView 
                        wink={mockWinkForDisplay} 
                        isOutbox={false} 
                        onSendSecondOpinion={() => {}} 
                        contacts={[]}
                        isSelfCheckinView={true}
                        navigate={navigate}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full p-2 sm:p-4 md:p-6 relative">
            <div ref={selfCheckinRef} className="bg-brand-surface w-full max-w-2xl mx-auto rounded-2xl shadow-xl border border-brand-secondary-200/50 flex flex-col flex-1">
                {/* Header */}
                <div className="p-6 sm:p-8 flex-shrink-0">
                    <div className="relative mb-6">
                        <button onClick={() => navigate('Dashboard')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                            <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">Self Check-in</h1>
                    </div>
                    <p className="text-center text-brand-text-secondary -mt-4">How are you feeling lately? Select any observations to get personalized, private insights and resources.</p>
                </div>
                
                {/* Content */}
                 <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-24">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3">
                            <Icon name="warning" className="w-5 h-5"/> <span>{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center p-12 min-h-[400px] flex flex-col justify-center">
                            <Icon name="loader" className="w-12 h-12 text-brand-secondary-500 animate-spin mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">Generating Your Insights...</h2>
                            <p className="text-brand-text-secondary mt-2">This is just for you. Your selections are private.</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up-subtle">
                            <div className="my-6 p-4 bg-brand-secondary-50 border-2 border-dashed border-brand-secondary-200 rounded-lg">
                                <h3 className="font-semibold text-brand-text-primary mb-2 flex items-center gap-2">
                                    <Icon name="sparkles" className="w-5 h-5 text-amber-500" />
                                    Need help articulating?
                                </h3>
                                <p className="text-sm text-brand-text-secondary mb-3">Describe how you're feeling, and we'll suggest relevant observations for your private check-in.</p>
                                <textarea
                                    value={aiSuggestionDescription}
                                    onChange={(e) => setAiSuggestionDescription(e.target.value)}
                                    placeholder="e.g., 'I feel so drained all the time, and I don't enjoy my hobbies anymore...'"
                                    className="w-full p-2 bg-white border border-brand-secondary-300 placeholder-brand-secondary-400 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors text-sm"
                                    rows={3}
                                />
                                <button
                                    onClick={handleGenerateObservableSuggestions}
                                    disabled={!aiSuggestionDescription.trim() || isGeneratingObservables}
                                    className="w-full mt-2 bg-brand-secondary-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary-900 transition-colors disabled:bg-slate-300 flex items-center justify-center gap-2"
                                >
                                    <Icon name={isGeneratingObservables ? 'loader' : 'sparkles'} className={`w-4 h-4 ${isGeneratingObservables ? 'animate-spin' : ''}`} />
                                    {isGeneratingObservables ? 'Thinking...' : 'Get Suggestions'}
                                </button>
                                {suggestionError && <p className="text-xs text-red-600 mt-2">{suggestionError}</p>}
                                {aiSuggestedObservables.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-semibold text-brand-text-secondary">Tap to add a suggestion:</h4>
                                        {aiSuggestedObservables.map((suggestion, index) => {
                                            const isSelected = selectedObservables.some(o => o.text.toLowerCase() === suggestion.text.toLowerCase());
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        if (!isSelected) {
                                                            handleObservableToggle({
                                                                id: `suggested-${suggestion.text.slice(0, 10)}-${Date.now()}`,
                                                                ...suggestion
                                                            });
                                                        }
                                                    }}
                                                    disabled={isSelected}
                                                    className={`w-full flex items-center justify-between p-3 border rounded-lg text-left transition-colors ${
                                                        isSelected 
                                                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-not-allowed' 
                                                            : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    <span className="text-sm font-medium">{suggestion.text}</span>
                                                    {isSelected 
                                                        ? <Icon name="check" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                        : <Icon name="plusCircle" className="w-5 h-5 text-amber-700 flex-shrink-0" />
                                                    }
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                             <div className="relative mb-4">
                                <input
                                    type="text"
                                    value={observableSearch}
                                    onChange={(e) => setObservableSearch(e.target.value)}
                                    placeholder="Search all observations..."
                                    className="w-full p-3 pl-10 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                                />
                                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary/50"/>
                            </div>
                            <div className="space-y-3">
                                {CATEGORIES.map(category => {
                                    const observablesInCategory = OBSERVABLES.filter(o => {
                                        if (o.category !== category) return false;
                                        const term = observableSearch.toLowerCase();
                                        if (!term) return true;
                                        const inText = o.text.toLowerCase().includes(term);
                                        const inKeywords = o.keywords?.some(k => k.toLowerCase().includes(term));
                                        return inText || inKeywords;
                                    });

                                    if (observablesInCategory.length === 0) return null;

                                    const isExpanded = expandedCategories.has(category);
                                    const isFullyShown = fullyShownCategories.has(category);
                                    const visibleObservables = isFullyShown ? observablesInCategory : observablesInCategory.slice(0, 5);

                                    return (
                                        <div key={category} className="border border-brand-secondary-200 rounded-xl">
                                            <button onClick={() => toggleCategory(category)} className="w-full flex justify-between items-center p-4 text-left">
                                                <h3 className="font-bold text-lg text-brand-text-primary flex items-center gap-2">
                                                    <Icon name={categoryIcons[category]} className="w-5 h-5 text-brand-secondary-500" />
                                                    {category}
                                                </h3>
                                                <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} className="w-5 h-5 text-brand-text-secondary" />
                                            </button>
                                            {isExpanded && (
                                                <div className="px-4 pb-4 space-y-3">
                                                    {visibleObservables.map(observable => (
                                                        <label key={observable.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all interactive-scale ${selectedObservables.some(o => o.id === observable.id) ? 'bg-brand-secondary-100 border-brand-secondary-400 ring-2 ring-brand-secondary-200' : 'bg-brand-surface border-brand-secondary-200 hover:bg-brand-secondary-50'}`}>
                                                            <input type="checkbox" checked={selectedObservables.some(o => o.id === observable.id)} onChange={() => handleObservableToggle(observable)} className="sr-only peer" />
                                                            <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 border-brand-secondary-300 peer-checked:border-brand-secondary-600 flex items-center justify-center transition-colors peer-checked:bg-brand-secondary-600">
                                                                <Icon name="check" className="w-4 h-4 text-white hidden peer-checked:block" />
                                                            </div>
                                                            <span className="text-brand-text-secondary text-sm flex-1">{observable.text}</span>
                                                        </label>
                                                    ))}
                                                    {observablesInCategory.length > 5 && (
                                                        <div className="text-center pt-2">
                                                            <button onClick={() => toggleShowMore(category)} className="text-sm font-semibold text-brand-primary-600 hover:underline">
                                                                {isFullyShown ? 'Show Less' : `Show ${observablesInCategory.length - 5} More...`}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    )}
                </div>
            </div>
             {!aiContent && (
                <button
                    onClick={handleSubmit}
                    disabled={selectedObservables.length === 0 || isLoading}
                    className="absolute bottom-28 right-6 md:bottom-10 md:right-10 z-20 bg-brand-secondary-600 text-white rounded-full p-4 shadow-lg hover:bg-brand-secondary-700 transition-transform transform hover:scale-110 disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed interactive-scale"
                    aria-label="Get Private Insights"
                >
                    {isLoading ? <Icon name="loader" className="w-6 h-6 animate-spin" /> : <Icon name="arrowRight" className="w-6 h-6" />}
                </button>
            )}
        </div>
    );
};