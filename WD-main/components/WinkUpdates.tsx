import React, { useState } from 'react';
import { Wink } from '../types';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { generateWinkUpdateSuggestions } from '../services/geminiService';

interface WinkUpdatesProps {
    sentWinks: Wink[];
    onAddUpdate: (winkId: string, updateTexts: string[]) => void;
}

const UpdateComposer: React.FC<{
    wink: Wink;
    onClose: () => void;
    onSend: (winkId: string, updateTexts: string[]) => void;
}> = ({ wink, onClose, onSend }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedUpdates, setSelectedUpdates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        setSelectedUpdates([]);
        try {
            const generatedSuggestions = await generateWinkUpdateSuggestions(wink.observables);
            setSuggestions(generatedSuggestions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate suggestions.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSelection = (suggestion: string) => {
        setSelectedUpdates(prev => 
            prev.includes(suggestion) 
                ? prev.filter(item => item !== suggestion)
                : [...prev, suggestion]
        );
    };

    const handleSend = () => {
        onSend(wink.id, selectedUpdates);
    };

    return (
        <div>
            <p className="text-brand-text-secondary mb-4">
                Send a positive follow-up for your Wink to <span className="font-bold text-brand-text-primary">{wink.recipient}</span>.
                Generate AI suggestions and select the ones you'd like to send.
            </p>
            <div className="bg-brand-secondary-50 p-3 rounded-lg border border-brand-secondary-200 mb-4">
                <p className="text-xs font-bold text-brand-text-secondary">Original Concerns:</p>
                <p className="text-sm text-brand-text-primary mt-1">{wink.observables.map(o => o.text).join(', ')}</p>
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-3 bg-gradient-to-br from-emerald-400 to-cyan-400 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 interactive-scale"
            >
                <Icon name={isLoading ? 'loader' : 'sparkles'} className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Generating...' : 'Generate Suggestions'}
            </button>
            {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
            
            {suggestions.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                    <h4 className="font-semibold text-brand-text-primary text-sm">Select one or more updates to send:</h4>
                    {suggestions.map((suggestion, index) => {
                        const isSelected = selectedUpdates.includes(suggestion);
                        return (
                            <label key={index} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all interactive-scale ${isSelected ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100' : 'bg-brand-surface border-brand-secondary-200 hover:bg-brand-secondary-50'}`}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelection(suggestion)}
                                    className="sr-only peer"
                                />
                                 <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 border-brand-secondary-300 peer-checked:border-emerald-500 flex items-center justify-center transition-colors peer-checked:bg-emerald-500">
                                    <Icon name="check" className="w-4 h-4 text-white hidden peer-checked:block" />
                                </div>
                                <span className="text-brand-text-secondary text-sm flex-1">{suggestion}</span>
                            </label>
                        )
                    })}
                </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold bg-brand-surface text-brand-text-secondary border border-brand-secondary-200 rounded-lg hover:bg-brand-secondary-100 interactive-scale"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSend}
                    disabled={selectedUpdates.length === 0}
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-br from-emerald-400 to-cyan-400 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 interactive-scale disabled:bg-slate-300"
                >
                    <Icon name="send" className="w-4 h-4" />
                    Send Update(s)
                </button>
            </div>
        </div>
    );
};

export const WinkUpdates: React.FC<WinkUpdatesProps> = ({ sentWinks, onAddUpdate }) => {
    const [selectedWink, setSelectedWink] = useState<Wink | null>(null);

    const sortedWinks = [...sentWinks].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Wink Updates</h1>
            <p className="text-brand-text-secondary mt-1">Noticed a positive change? Send an encouraging follow-up.</p>
            
            <div className="mt-8">
                {sortedWinks.length > 0 ? (
                    <div className="space-y-4">
                        {sortedWinks.map(wink => (
                            <div key={wink.id} className="bg-brand-surface p-4 sm:p-5 rounded-2xl shadow-lg border border-brand-secondary-200/30">
                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm text-brand-text-secondary">{wink.timestamp.toDate().toLocaleDateString()}</p>
                                        <h3 className="font-bold text-brand-text-primary text-lg">Wink for {wink.recipient}</h3>
                                        <p className="text-sm text-brand-text-secondary mt-1 break-words">
                                            Original concerns: {wink.observables.map(o => o.text).join(', ')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedWink(wink)}
                                        className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center sm:justify-start gap-2 interactive-scale flex-shrink-0"
                                    >
                                        <Icon name="plusCircle" className="w-5 h-5"/>
                                        Update
                                    </button>
                                </div>
                                {wink.updates && wink.updates.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-dashed border-brand-secondary-200 space-y-3">
                                        {wink.updates.map((update, index) => (
                                            <div key={index} className="flex items-start gap-3 text-sm">
                                                <Icon name="sparkles" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
                                                <div className="flex-1">
                                                    <p className="text-brand-text-secondary italic">"{update.text}"</p>
                                                    <p className="text-xs text-brand-text-secondary/70 mt-1">{update.timestamp.toDate().toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-16 px-6 bg-brand-surface rounded-2xl border border-brand-secondary-200 shadow-lg">
                        <Icon name="send" className="w-16 h-16 text-brand-secondary-300 mx-auto" />
                        <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">No Winks Sent Yet</h2>
                        <p className="text-brand-text-secondary mt-2">When you send a Wink, you can follow up with positive updates here.</p>
                    </div>
                )}
            </div>

            {selectedWink && (
                <Modal isOpen={!!selectedWink} onClose={() => setSelectedWink(null)} title="Add a Positive Update">
                    <UpdateComposer
                        wink={selectedWink}
                        onClose={() => setSelectedWink(null)}
                        onSend={(winkId, updateTexts) => {
                            onAddUpdate(winkId, updateTexts);
                            setSelectedWink(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};
