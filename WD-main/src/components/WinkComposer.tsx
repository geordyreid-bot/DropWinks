import React, { useState, useRef, useEffect } from 'react';
import { Observable, Category, Wink, AIGeneratedContent, Page, Contact, ContactMethod, GroundedContent } from '@/types';
import { CATEGORIES, OBSERVABLES } from '@/constants';
// FIX: Corrected import path from apiService to geminiService
import { generateWinkContent, findSocialResources, reverseGeocode, moderateCustomObservable, generateObservableSuggestions } from '@/services/geminiService';
import { Icon } from '@/ui/Icon';
import { LikelihoodBadge } from './WinkDetailView';
import { MentalHealthDisclaimer } from '@/ui/MentalHealthDisclaimer';
import { Modal } from '@/ui/Modal';
import { Tooltip } from '@/ui/Tooltip';
import { SyncContactsModal } from '@/ui/SyncContactsModal';
import { ContactEditModal } from '@/ui/ContactEditModal';

interface WinkComposerProps {
    onWinkSent: (wink: Omit<Wink, 'id' | 'timestamp'>) => void;
    navigate: (page: Page) => void;
    contacts: Contact[];
    onDeleteContact: (contactId: string) => void;
    onToggleBlockContact: (contactId: string, isBlocked: boolean) => void;
    onAddContacts: (newContacts: Omit<Contact, 'id'>[]) => void;
    onEditContact: (contact: Contact) => void;
}

const categoryIcons: Record<Category, React.ComponentProps<typeof Icon>['name']> = {
    'Physical': 'heart', 'Mental': 'brain', 'Nutritional': 'apple', 'Hygiene': 'droplets', 'Social': 'users', 'Behavioral': 'activity'
};
const contactMethodIcons: Record<ContactMethod, React.ComponentProps<typeof Icon>['name']> = {
    'WinkDrops': 'users', 'Phone': 'smartphone', 'Email': 'mail', 'Instagram': 'instagram', 'X': 'twitter', 'Snapchat': 'ghost', 'TikTok': 'tiktok'
};
const sources: ('All' | ContactMethod)[] = ['All', 'WinkDrops', 'Phone', 'Email', 'Instagram', 'X', 'Snapchat', 'TikTok'];

// Helper for a simple fuzzy search
const fuzzyMatch = (searchTerm: string, target: string): boolean => {
    const searchTermLower = searchTerm.toLowerCase();
    const targetLower = target.toLowerCase();
    let searchIndex = 0;
    for (let i = 0; i < targetLower.length && searchIndex < searchTermLower.length; i++) {
        if (targetLower[i] === searchTermLower[searchIndex]) {
            searchIndex++;
        }
    }
    return searchIndex === searchTermLower.length;
};

const GroundedResourceDisplay: React.FC<{ title: string, content: GroundedContent }> = ({ title, content }) => (
    <div>
        <h4 className="font-semibold text-brand-text-primary mb-2">{title}</h4>
        <div className="prose prose-sm text-brand-text-secondary max-w-none p-4 bg-brand-secondary-50 rounded-lg border border-brand-secondary-200" dangerouslySetInnerHTML={{ __html: content.text.replace(/\n/g, '<br />') }} />
        {content.sources.length > 0 && (
            <div className="mt-2">
                <p className="text-xs font-semibold text-brand-text-secondary mb-1">Sources:</p>
                <div className="flex flex-wrap gap-2">
                    {content.sources.map((source, index) => (
                        <a href={source.web?.uri || source.maps?.uri} target="_blank" rel="noopener noreferrer" key={index} className="text-xs bg-brand-primary-100 text-brand-primary-700 px-2 py-1 rounded-full hover:bg-brand-primary-200 truncate flex items-center gap-1.5 interactive-scale">
                            <Icon name="link" className="w-3 h-3"/>
                            {source.web?.title || source.maps?.title || 'Source'}
                        </a>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Contact', 'Concern', 'Connect'];
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {stepIdx < currentStep - 1 ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-brand-primary-600" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-600">
                                    <Icon name="check" className="h-5 w-5 text-white" aria-hidden="true" />
                                </div>
                            </>
                        ) : currentStep === stepIdx + 1 ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-brand-secondary-200" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-primary-600 bg-white" aria-current="step">
                                    <span className="h-2.5 w-2.5 rounded-full bg-brand-primary-600" aria-hidden="true" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-brand-secondary-200" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-secondary-300 bg-white" />
                            </>
                        )}
                         <span className="absolute top-10 -left-2 w-12 text-center text-xs font-semibold text-brand-text-secondary">{step}</span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};


export const WinkComposer: React.FC<WinkComposerProps> = ({ onWinkSent, navigate, contacts, onDeleteContact, onToggleBlockContact, onAddContacts, onEditContact }) => {
    const [step, setStep] = useState(1);
    const [recipient, setRecipient] = useState('');
    const [selectedObservables, setSelectedObservables] = useState<Observable[]>([]);
    const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [observableSearch, setObservableSearch] = useState('');
    const [selectedSource, setSelectedSource] = useState<'All' | ContactMethod>('All');
    const [socialResourcesLoading, setSocialResourcesLoading] = useState(false);
    const [socialResourcesError, setSocialResourcesError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customObservable, setCustomObservable] = useState<{ text: string, category: Category, negativeKeywords: string }>({ text: '', category: 'Physical', negativeKeywords: '' });
    const [isModerating, setIsModerating] = useState(false);
    const [moderationError, setModerationError] = useState<string | null>(null);
    const [actionTarget, setActionTarget] = useState<{ contact: Contact; type: 'delete' | 'block' | 'unblock' } | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set());
    const [fullyShownCategories, setFullyShownCategories] = useState<Set<Category>>(new Set());
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    
    const [aiSuggestionDescription, setAiSuggestionDescription] = useState('');
    const [aiSuggestedObservables, setAiSuggestedObservables] = useState<{ text: string, category: Category }[]>([]);
    const [isGeneratingObservables, setIsGeneratingObservables] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            requestAnimationFrame(() => {
                if(contentRef.current) {
                    contentRef.current.scrollTop = 0;
                }
            });
        }
    }, [step]);

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

    const filteredContacts = contacts.filter(contact => {
        if (recipient.trim() === '') return true;
        const sourceMatch = selectedSource === 'All' || contact.method === selectedSource;
        const searchMatch = fuzzyMatch(recipient, contact.name) || fuzzyMatch(recipient, contact.handle);
        return sourceMatch && searchMatch;
    });

    const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRecipient(e.target.value);
    };
    const handleSelectContact = (contact: Contact) => {
        setRecipient(contact.name);
    };
    const handleObservableToggle = (observable: Observable) => {
        setSelectedObservables(prev =>
            prev.some(o => o.id === observable.id)
                ? prev.filter(o => o.id !== observable.id)
                : [...prev, observable]
        );
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const content = await generateWinkContent(selectedObservables);
            setAiContent(content);
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddCustomObservable = async () => {
        if (!customObservable.text.trim()) return;
        setIsModerating(true);
        setModerationError(null);
        try {
            const moderationResult = await moderateCustomObservable(customObservable.text.trim());
            if (moderationResult.is_safe) {
                const newObservable: Observable = {
                    id: `custom-${Date.now()}`,
                    text: customObservable.text.trim(),
                    category: customObservable.category,
                    negativeKeywords: customObservable.negativeKeywords
                        .split(',')
                        .map(k => k.trim())
                        .filter(Boolean),
                };
                setSelectedObservables(prev => [...prev, newObservable]);
                setCustomObservable({ text: '', category: 'Physical', negativeKeywords: '' });
                setIsAddingCustom(false);
            } else {
                setModerationError(moderationResult.reason || "This observation is not appropriate. Please rephrase it to be a gentle, non-malicious concern.");
            }
        } catch (error) {
            setModerationError("Could not verify the content's safety. Please try again later.");
        } finally {
            setIsModerating(false);
        }
    };

    const handleFindSocial = async () => {
        setSocialResourcesLoading(true);
        setSocialResourcesError(null);
        try {
            const socialData = await findSocialResources(aiContent!.possibleConditions);
            setAiContent(prev => prev ? { ...prev, socialResources: socialData } : null);
        } catch (err) {
            setSocialResourcesError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setSocialResourcesLoading(false);
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

    const handleNext = () => {
        if (step === 1 && recipient.trim() !== '') {
            setStep(2);
        }
    };
    
    const handleSendWink = () => {
        if (!aiContent) return;
        setIsSending(true);

        const newWink: Omit<Wink, 'id' | 'timestamp'> = {
            type: 'Wink',
            recipient,
            observables: selectedObservables,
            aiContent,
            isRead: false,
        };

        setTimeout(() => {
            onWinkSent(newWink);
            navigate('Outbox');
        }, 2500);
    };
    
    const goBack = () => {
        if (isSending) return;
        if (step === 1) navigate('Dashboard');
        else setStep(prev => prev - 1);
    }
    
    const handleSyncDeviceContacts = async () => {
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            alert('Contact Picker API is not supported on this browser.');
            return;
        }
        setIsSyncing(true);
        try {
            const props = ['name', 'tel', 'email'];
            const opts = { multiple: true };
            const deviceContacts = await (navigator as any).contacts.select(props, opts);

            if (deviceContacts.length > 0) {
                const newContacts: Omit<Contact, 'id'>[] = deviceContacts.flatMap((contact: any) => {
                    const created: Omit<Contact, 'id'>[] = [];
                    if (contact.tel && contact.tel[0]) {
                        created.push({
                            name: contact.name?.[0] || 'Unnamed Contact',
                            method: 'Phone' as ContactMethod,
                            handle: contact.tel[0],
                        });
                    }
                    if (contact.email && contact.email[0]) {
                         created.push({
                            name: contact.name?.[0] || 'Unnamed Contact',
                            method: 'Email' as ContactMethod,
                            handle: contact.email[0],
                        });
                    }
                    return created;
                });
                onAddContacts(newContacts);
                alert(`${newContacts.length} contact(s) synced successfully!`);
            }
        } catch (err) {
            console.error('Error syncing contacts:', err);
            alert('Failed to sync contacts. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    const renderActionModal = () => {
        if (!actionTarget) return null;
        const { contact, type } = actionTarget;
        
        const titles = { delete: 'Delete Contact?', block: 'Block Contact?', unblock: 'Unblock Contact?' };
        const descriptions = {
            delete: `Are you sure you want to permanently delete ${contact.name}? This action cannot be undone.`,
            block: `Are you sure you want to block ${contact.name}? You will not be able to select them for Winks or Nudges.`,
            unblock: `Are you sure you want to unblock ${contact.name}? You will be able to select them again.`
        };
        
        const performAction = () => {
            if (type === 'delete') onDeleteContact(contact.id);
            else if (type === 'block') onToggleBlockContact(contact.id, true);
            else if (type === 'unblock') onToggleBlockContact(contact.id, false);
            setActionTarget(null);
        };

        const buttonInfo = {
            delete: { text: 'Delete', icon: 'trash' as const },
            block: { text: 'Block', icon: 'ban' as const },
            unblock: { text: 'Unblock', icon: 'check' as const }
        };

        return (
            <Modal isOpen={!!actionTarget} onClose={() => setActionTarget(null)} title={titles[type]} size="sm">
                <div>
                    <p className="text-brand-text-secondary mb-4">{descriptions[type]}</p>
                    <div className="my-4 p-3 bg-brand-secondary-100 rounded-lg font-semibold text-brand-text-primary text-center">
                        {contact.name}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setActionTarget(null)} className="px-4 py-2 text-sm font-semibold bg-brand-surface text-brand-text-secondary border border-brand-secondary-200 rounded-lg hover:bg-brand-secondary-100 interactive-scale">
                            Cancel
                        </button>
                        <button onClick={performAction} className="px-4 py-2 text-sm font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center gap-2 interactive-scale">
                            <Icon name={buttonInfo[type].icon} className="w-4 h-4" />
                            {buttonInfo[type].text}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    if (isSending) {
        return (
            <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center text-center h-full animate-fade-in-up">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-brand-primary-500 rounded-full animate-ping"></div>
                    <div className="relative w-24 h-24 bg-brand-primary-500 rounded-full flex items-center justify-center">
                        <Icon name="sendHorizontal" className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-brand-text-primary">Dropping your Wink...</h2>
                <p className="text-brand-text-secondary mt-2">Your gentle gesture is on its way to {recipient}.</p>
            </div>
        )
    }
    
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

    return (
         <div className="flex flex-col h-full p-2 sm:p-4 md:p-6">
            <div className="bg-brand-surface w-full max-w-2xl mx-auto rounded-2xl shadow-xl border border-brand-secondary-200/50 flex flex-col flex-1 relative">
                {/* Header */}
                <div className="p-6 sm:p-8 flex-shrink-0">
                    <div className="relative mb-8">
                        <button onClick={goBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                            <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">Drop a Wink</h1>
                    </div>
                    <div className="w-full flex justify-center">
                    <StepIndicator currentStep={step} />
                    </div>
                </div>

                {/* Content */}
                <div ref={contentRef} className="flex-1 overflow-y-auto px-6 sm:p-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3">
                            <Icon name="warning" className="w-5 h-5"/>
                            <span>{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center p-12 min-h-[400px] flex flex-col justify-center">
                            <Icon name="loader" className="w-12 h-12 text-brand-primary-500 animate-spin mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">Generating Insights...</h2>
                            <p className="text-brand-text-secondary mt-2">Our AI is preparing a gentle and helpful message. This may take a moment.</p>
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <div key="step1" className="animate-fade-in-up-subtle">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-xl font-semibold text-brand-text-primary">Who is this for?</h2>
                                        <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold bg-brand-secondary-100 text-brand-secondary-800 px-3 py-1.5 rounded-lg hover:bg-brand-secondary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed interactive-scale">
                                            <Icon name="userPlus" className="w-4 h-4"/>
                                            Add / Sync Contacts
                                        </button>
                                    </div>
                                    <p className="text-brand-text-secondary mb-4">Select a contact or enter a name. Your identity will always remain anonymous.</p>
                                    
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {sources.map(source => (
                                            <button 
                                                key={source}
                                                onClick={() => setSelectedSource(source)}
                                                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors interactive-scale ${selectedSource === source ? 'bg-brand-primary-500 text-white border-brand-primary-500' : 'bg-brand-surface text-brand-text-secondary border-brand-secondary-200 hover:bg-brand-secondary-100'}`}
                                            >
                                                {source}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            value={recipient}
                                            onChange={handleRecipientChange}
                                            placeholder="Search contacts or enter a name..."
                                            className="w-full p-3 pl-10 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                                        />
                                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary/50"/>
                                    </div>

                                    <div className="max-h-60 overflow-y-auto overflow-x-hidden space-y-2 pr-2">
                                        {filteredContacts.map(contact => (
                                            <div key={contact.id} className="group relative">
                                                <div 
                                                    onClick={() => !contact.isBlocked && handleSelectContact(contact)}
                                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full overflow-hidden ${
                                                        contact.isBlocked
                                                            ? 'bg-brand-secondary-100 opacity-60 cursor-not-allowed'
                                                            : recipient === contact.name
                                                            ? 'bg-brand-primary-50'
                                                            : 'hover:bg-brand-secondary-50 cursor-pointer'
                                                    }`}
                                                >
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-brand-secondary-100 text-brand-secondary-600">
                                                        <Icon name={contactMethodIcons[contact.method]} className="w-5 h-5"/>
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-semibold text-brand-text-primary text-sm truncate">{contact.name}</p>
                                                        <p className="text-xs text-brand-text-secondary truncate">{contact.handle}</p>
                                                    </div>
                                                    {recipient === contact.name && <Icon name="check" className="w-5 h-5 text-brand-primary-600 ml-auto"/>}
                                                    {contact.isBlocked && <span className="ml-auto text-xs font-bold text-rose-600 uppercase tracking-wider">Blocked</span>}
                                                </div>
                                                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-surface/80 backdrop-blur-sm rounded-full p-1">
                                                    <Tooltip content="Edit Contact">
                                                        <button onClick={() => setEditingContact(contact)} className="p-1.5 rounded-full hover:bg-brand-secondary-200 text-brand-secondary-500 hover:text-brand-primary-600 interactive-scale" aria-label="Edit Contact">
                                                            <Icon name="pencil" className="w-4 h-4" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip content={contact.isBlocked ? 'Unblock Contact' : 'Block Contact'}>
                                                        <button onClick={() => setActionTarget({ contact, type: contact.isBlocked ? 'unblock' : 'block' })} className="p-1.5 rounded-full hover:bg-brand-secondary-200 text-brand-secondary-500 hover:text-rose-600 interactive-scale" aria-label={contact.isBlocked ? 'Unblock Contact' : 'Block Contact'}>
                                                            <Icon name="ban" className="w-4 h-4" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip content="Delete Contact">
                                                        <button onClick={() => setActionTarget({ contact, type: 'delete' })} className="p-1.5 rounded-full hover:bg-brand-secondary-200 text-brand-secondary-500 hover:text-rose-600 interactive-scale" aria-label="Delete Contact">
                                                            <Icon name="trash" className="w-4 h-4" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div key="step2" className="animate-fade-in-up-subtle">
                                    <h2 className="text-xl font-semibold text-brand-text-primary mb-2">What have you observed?</h2>
                                    <p className="text-brand-text-secondary mb-4">Select one or more characteristics. This helps us provide relevant resources.</p>
                                    
                                    <div className="my-6 p-4 bg-brand-secondary-50 border-2 border-dashed border-brand-secondary-200 rounded-lg">
                                        <h3 className="font-semibold text-brand-text-primary mb-2 flex items-center gap-2">
                                            <Icon name="sparkles" className="w-5 h-5 text-amber-500" />
                                            Get AI Suggestions
                                        </h3>
                                        <p className="text-sm text-brand-text-secondary mb-3">Describe your concern in your own words, and we'll suggest relevant observations.</p>
                                        <textarea
                                            value={aiSuggestionDescription}
                                            onChange={(e) => setAiSuggestionDescription(e.target.value)}
                                            placeholder="e.g., 'My friend seems really sad lately, they aren't going out and look tired all the time...'"
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
                                    <div className="flex justify-end mb-4">
                                         <button 
                                            onClick={() => setIsAddingCustom(true)}
                                            className="flex items-center gap-2 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-800 interactive-scale"
                                        >
                                            <Icon name="plusCircle" className="w-4 h-4" />
                                            Add a custom observation
                                        </button>
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
                                                            <Icon name={categoryIcons[category]} className="w-5 h-5 text-brand-primary-500" />
                                                            {category}
                                                        </h3>
                                                        <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} className="w-5 h-5 text-brand-text-secondary" />
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 space-y-3">
                                                            {visibleObservables.map(observable => (
                                                                <label key={observable.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all interactive-scale ${selectedObservables.some(o => o.id === observable.id) ? 'bg-brand-primary-50 border-brand-primary-500 ring-2 ring-brand-primary-200' : 'bg-brand-surface border-brand-secondary-200 hover:bg-brand-secondary-50'}`}>
                                                                    <input type="checkbox" checked={selectedObservables.some(o => o.id === observable.id)} onChange={() => handleObservableToggle(observable)} className="sr-only peer" />
                                                                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 border-brand-secondary-300 peer-checked:border-brand-primary-500 flex items-center justify-center transition-colors peer-checked:bg-brand-primary-500">
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

                            {step === 3 && aiContent && (
                                <div key="step3" className="animate-fade-in-up-subtle">
                                    <h2 className="text-xl font-semibold text-brand-text-primary mb-2">Review & Drop</h2>
                                    <p className="text-brand-text-secondary mb-6">This is what <span className="font-semibold text-brand-text-primary">{recipient}</span> will receive. You can add local and social resources. Your identity is completely anonymous.</p>
                                    
                                    {hasMentalHealthConcern && <MentalHealthDisclaimer />}

                                    <div className="space-y-6 p-4 border border-brand-secondary-200 rounded-lg bg-brand-surface">
                                        <div>
                                            <h3 className="font-semibold text-brand-text-primary mb-3">Potential Insights</h3>
                                            <p className="text-xs text-brand-text-secondary -mt-3 mb-3 italic">this is not a medical diagnosis.</p>
                                            <div className="space-y-3">
                                                {aiContent.possibleConditions.map(cond => (
                                                    <div key={cond.name} className="bg-brand-secondary-50 p-3 rounded-lg border border-brand-secondary-200">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className="font-bold text-brand-text-primary text-sm">{cond.name}</h4>
                                                            <LikelihoodBadge likelihood={cond.likelihood} />
                                                        </div>
                                                        <p className="text-xs text-brand-text-secondary mt-1">{cond.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-brand-text-primary mb-3">Helpful Resources</h3>
                                            <div className="space-y-2">
                                                {aiContent.resources.map(res => (
                                                    <div key={res.title} className="p-3 bg-white rounded-md border border-brand-secondary-200">
                                                        <p className="font-semibold text-brand-primary-700 capitalize text-xs">{res.type}</p>
                                                        <p className="font-semibold text-brand-text-primary text-sm">{res.title}</p>
                                                        <p className="text-xs text-brand-text-secondary">{res.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border-t border-brand-secondary-200 pt-4">
                                            {aiContent.socialResources ? (
                                                <GroundedResourceDisplay title="Online Communities" content={aiContent.socialResources} />
                                            ) : (
                                                <div>
                                                    <h4 className="font-semibold text-brand-text-primary">Find Online Communities</h4>
                                                    <p className="text-sm text-brand-text-secondary mb-3">Find forums and social media discussions to show {recipient} they're not alone.</p>
                                                    <button onClick={handleFindSocial} disabled={socialResourcesLoading} className="flex items-center gap-2 text-sm font-semibold bg-brand-secondary-100 text-brand-secondary-800 px-4 py-2 rounded-lg hover:bg-brand-secondary-200 disabled:opacity-50 interactive-scale">
                                                        {socialResourcesLoading ? <Icon name="loader" className="w-4 h-4 animate-spin"/> : <Icon name="users" className="w-4 h-4"/>}
                                                        {socialResourcesLoading ? 'Searching...' : 'Add Online Resources'}
                                                    </button>
                                                    {socialResourcesError && <p className="text-xs text-red-600 mt-2">{socialResourcesError}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Floating Action Buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-brand-surface/80 backdrop-blur-sm border-t border-brand-secondary-200/80">
                     {step === 1 && !isLoading && (
                        <button
                            onClick={handleNext}
                            disabled={!recipient.trim()}
                            className="w-full bg-brand-primary-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-brand-primary-600 transition-all transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed interactive-scale flex items-center justify-center gap-2"
                        >
                            Next
                            <Icon name="arrowRight" className="w-5 h-5"/>
                        </button>
                    )}
                    {step === 2 && !isLoading && (
                        <button
                            onClick={handleGenerate}
                            disabled={selectedObservables.length === 0}
                            className="w-full bg-brand-primary-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-brand-primary-600 transition-all transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed interactive-scale flex items-center justify-center gap-2"
                            aria-label="Generate Preview"
                        >
                            Generate Preview
                           <Icon name="arrowRight" className="w-5 h-5" />
                        </button>
                    )}
                    {step === 3 && aiContent && !isSending && (
                        <button
                            onClick={handleSendWink}
                            className="w-full bg-brand-primary-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-brand-primary-600 transition-all transform hover:scale-105 interactive-scale flex items-center justify-center gap-2"
                        >
                            Drop Wink
                            <Icon name="send" className="w-5 h-5"/>
                        </button>
                    )}
                </div>
            </div>

            {renderActionModal()}
            <SyncContactsModal 
                isOpen={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                onAddContacts={onAddContacts}
                onSyncDeviceContacts={handleSyncDeviceContacts}
                isSyncingDevice={isSyncing}
            />
            {editingContact && (
                <ContactEditModal
                    isOpen={!!editingContact}
                    onClose={() => setEditingContact(null)}
                    contact={editingContact}
                    onSave={(updatedContact) => {
                        onEditContact(updatedContact);
                        setEditingContact(null);
                    }}
                />
            )}
             <Modal
                isOpen={isAddingCustom}
                onClose={() => setIsAddingCustom(false)}
                title="Add Custom Observation"
            >
                <div>
                    <p className="text-brand-text-secondary mb-4">Describe the observation in your own words and assign it to a category.</p>
                     {moderationError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg mb-4 text-sm" role="alert">
                            <p className="font-bold">Content Rejected</p>
                            <p>{moderationError}</p>
                        </div>
                    )}
                     <div>
                        <label htmlFor="custom-obs-text" className="block text-sm font-semibold text-brand-text-primary mb-1.5">Observation</label>
                        <textarea
                            id="custom-obs-text"
                            value={customObservable.text}
                            onChange={(e) => {
                                setCustomObservable(prev => ({ ...prev, text: e.target.value }));
                                if (moderationError) {
                                    setModerationError(null);
                                }
                            }}
                            placeholder="E.g., 'Seems to be avoiding conversations about the future...'"
                            className="w-full p-2 bg-white border border-brand-secondary-300 placeholder-brand-secondary-400 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors text-sm"
                            rows={3}
                        />
                    </div>
                     <div className="mt-4">
                        <label htmlFor="custom-obs-category" className="block text-sm font-semibold text-brand-text-primary mb-1.5">Category</label>
                        <select
                             id="custom-obs-category"
                             value={customObservable.category}
                             onChange={(e) => setCustomObservable(prev => ({ ...prev, category: e.target.value as Category }))}
                             className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors text-sm"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="custom-obs-negative-keywords" className="block text-sm font-semibold text-brand-text-primary mb-1.5">Negative Keywords (Optional)</label>
                        <input
                            id="custom-obs-negative-keywords"
                            type="text"
                            value={customObservable.negativeKeywords}
                            onChange={(e) => setCustomObservable(prev => ({ ...prev, negativeKeywords: e.target.value }))}
                            placeholder="e.g., anxiety, medical terms"
                            className="w-full p-2 bg-white border border-brand-secondary-300 placeholder-brand-secondary-400 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors text-sm"
                        />
                        <p className="text-xs text-brand-text-secondary mt-1">Comma-separated words to exclude from AI analysis.</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsAddingCustom(false)}
                            className="px-4 py-2 text-sm font-semibold bg-brand-surface text-brand-text-secondary border border-brand-secondary-200 rounded-lg hover:bg-brand-secondary-100 interactive-scale"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddCustomObservable}
                             disabled={!customObservable.text.trim() || isModerating}
                            className="px-4 py-2 text-sm font-semibold bg-brand-primary-500 text-white rounded-lg hover:bg-brand-primary-600 flex items-center gap-2 interactive-scale disabled:bg-slate-300"
                        >
                            {isModerating ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="plusCircle" className="w-4 h-4" />}
                            {isModerating ? 'Verifying...' : 'Add Observation'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};