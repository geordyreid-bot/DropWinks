// Fix: Corrected typo in import statement for React and useState.
import React, { useState } from 'react';
import { Nudge, Page, Contact, ContactMethod, ScheduledNudge } from '../types';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { Tooltip } from './ui/Tooltip';
import { SyncContactsModal } from './ui/SyncContactsModal';
import { generateNudgeSuggestions } from '../services/geminiService';
import { ContactEditModal } from './ui/ContactEditModal';
import { ScheduleNudgeModal } from './ui/ScheduleNudgeModal';
import { Timestamp } from 'firebase/firestore';

interface NudgeComposerProps {
    onNudgeSent: (nudge: Omit<Nudge, 'id' | 'timestamp'>) => void;
    onAddScheduledNudge: (nudge: Omit<Nudge, 'id' | 'timestamp'>, sendAt: Date, recurrence: ScheduledNudge['recurrence']) => void;
    navigate: (page: Page) => void;
    contacts: Contact[];
    onDeleteContact: (contactId: string) => void;
    onToggleBlockContact: (contactId: string, isBlocked: boolean) => void;
    onAddContacts: (newContacts: Contact[]) => void;
    onEditContact: (contact: Contact) => void;
}

const contactMethodIcons: Record<ContactMethod, React.ComponentProps<typeof Icon>['name']> = {
    'WinkDrops': 'users', 'Phone': 'smartphone', 'Email': 'mail', 'Instagram': 'instagram', 'X': 'twitter', 'Snapchat': 'ghost', 'TikTok': 'tiktok'
};

const PREDEFINED_NUDGES = [
    'Just a gentle note to say I\'m thinking of you.',
    'Hoping you find a moment of peace in your day.',
    'Sending a little bit of kindness your way.',
    'You\'re on my mind. Hope you\'re doing okay.',
    'Remember to be kind to yourself today.',
    'Your presence is valued more than you know.',
    'Just wanted to send a little warmth and support.',
    'No pressure to reply, just wanted to reach out.',
    'Hoping today is gentle with you.',
    'You\'re not alone in whatever you\'re navigating.',
    'Just a quiet reminder that someone cares.',
    'Wishing you a moment of calm amidst the noise.',
    'You make a positive difference, just by being you.',
    'It\'s okay to not be okay. Thinking of you.',
    'Your strength in navigating your path is admirable.',
    'Just sending a pocketful of good thoughts.',
    'You are seen and appreciated.',
    'Take all the time you need. We can wait.',
];

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

export const NudgeComposer: React.FC<NudgeComposerProps> = ({ onNudgeSent, onAddScheduledNudge, navigate, contacts, onDeleteContact, onToggleBlockContact, onAddContacts, onEditContact }) => {
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [selectedSource, setSelectedSource] = useState<'All' | ContactMethod>('All');
    const [isSending, setIsSending] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [actionTarget, setActionTarget] = useState<{ contact: Contact; type: 'delete' | 'block' | 'unblock' } | null>(null);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    
    // AI Suggestion State
    const [aiContext, setAiContext] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);


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
    
    const confirmAndSend = () => {
        if (!recipient.trim() || !message.trim()) return;
        setIsConfirming(false);
        setIsSending(true);
        const newNudge: Omit<Nudge, 'id' | 'timestamp'> = {
            type: 'Nudge',
            recipient,
            message,
            isRead: true, // Nudges are simple and marked as read for the sender
        };
        setTimeout(() => {
            onNudgeSent(newNudge);
            navigate('Outbox');
        }, 2500);
    };
    
    const handleScheduleNudge = (details: { sendAt: Date, recurrence: ScheduledNudge['recurrence'] }) => {
        if (!recipient.trim() || !message.trim()) return;
        
        const newNudge: Omit<Nudge, 'id' | 'timestamp'> = {
            type: 'Nudge',
            recipient,
            message,
            isRead: true, 
        };

        onAddScheduledNudge(newNudge, details.sendAt, details.recurrence);
        setIsScheduleModalOpen(false);
        navigate('Dashboard');
    };

     const handleGenerateSuggestions = async () => {
        if (!aiContext.trim()) return;
        setIsGenerating(true);
        setAiError(null);
        setAiSuggestions([]);

        try {
            const suggestions = await generateNudgeSuggestions(aiContext);
            setAiSuggestions(suggestions);
        } catch (err) {
            setAiError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSyncDeviceContacts = async () => {
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            alert('Contact Picker API is not supported on this browser.');
            return;
        }
        setIsSyncing(true);
        try {
            const props = ['name', 'tel', 'email'];
            const opts = { multiple: true };
            const deviceContacts = await (navigator.contacts as any).select(props, opts);

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

                onAddContacts(newContacts as Contact[]);
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
            <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-brand-primary-400/50 rounded-full animate-ping"></div>
                    <div className="relative w-24 h-24 bg-brand-surface rounded-full flex items-center justify-center border-2 border-brand-primary-400">
                        <Icon name="nudge" className="w-10 h-10 text-brand-primary-400" />
                    </div>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-brand-text-primary">Sending your Nudge...</h2>
                <p className="text-brand-text-secondary mt-2">Your positive message is on its way to {recipient}.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full p-2 sm:p-4 md:p-6">
             <div className="bg-brand-surface w-full max-w-2xl mx-auto rounded-2xl shadow-xl border border-brand-secondary-200/50 flex flex-col flex-1">
                {/* Header */}
                <div className="p-6 sm:p-8 flex-shrink-0">
                    <div className="relative">
                        <button onClick={() => navigate('Dashboard')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                            <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">Send a Nudge</h1>
                         <button
                            onClick={() => navigate('Gift Marketplace')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-amber-100 text-amber-800 font-bold text-sm px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-200 transition-all interactive-scale animate-pulse-soft"
                            style={{ animationDuration: '4s' }}
                        >
                            <Icon name="gift" className="w-4 h-4" />
                            <span>Gift?</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-28 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-semibold text-brand-text-primary">1. Choose a Recipient</h2>
                             <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold bg-brand-secondary-100 text-brand-secondary-800 px-3 py-1.5 rounded-lg hover:bg-brand-secondary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed interactive-scale">
                                <Icon name="userPlus" className="w-4 h-4"/>
                                Add / Sync Contacts
                            </button>
                        </div>
                        <p className="text-brand-text-secondary mb-4">Select a contact to send a positive message to. Your identity will remain anonymous.</p>
                        
                        <div className="mb-4 flex flex-wrap gap-2">
                            {sources.map(source => (
                                <button 
                                    key={source}
                                    onClick={() => setSelectedSource(source)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors interactive-scale ${selectedSource === source ? 'bg-brand-secondary-800 text-white border-brand-secondary-800' : 'bg-brand-surface text-brand-text-secondary border-brand-secondary-200 hover:bg-brand-secondary-100'}`}
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
                       
                        <div className="max-h-48 overflow-y-auto overflow-x-hidden space-y-2 pr-2">
                            {filteredContacts.map(contact => (
                                <div key={contact.id} className="group relative">
                                    <div 
                                        onClick={() => !contact.isBlocked && handleSelectContact(contact)}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors border w-full overflow-hidden ${
                                            contact.isBlocked
                                                ? 'bg-brand-secondary-100 opacity-60 cursor-not-allowed border-transparent'
                                                : recipient === contact.name
                                                ? 'bg-brand-primary-100 border-brand-primary-300'
                                                : 'border-transparent hover:bg-brand-secondary-100 cursor-pointer'
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
                                            <button onClick={() => setEditingContact(contact)} className="p-1.5 rounded-full hover:bg-brand-secondary-200 text-brand-secondary-500 hover:text-brand-primary-600 interactive-scale" aria-label={`Edit ${contact.name}`}>
                                                <Icon name="pencil" className="w-4 h-4" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip content={contact.isBlocked ? 'Unblock Contact' : 'Block Contact'}>
                                            <button onClick={() => setActionTarget({ contact, type: contact.isBlocked ? 'unblock' : 'block' })} className="p-1.5 rounded-full hover:bg-brand-secondary-200 text-brand-secondary-500 hover:text-rose-600 interactive-scale" aria-label={contact.isBlocked ? `Unblock ${contact.name}` : `Block ${contact.name}`}>
                                                <Icon name="ban" className="w-4 h-4" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip content="Delete Contact">
                                            <button onClick={() => setActionTarget({ contact, type: 'delete' })} className="p-1.5 rounded-full hover:bg-brand-secondary-200 text-brand-secondary-500 hover:text-rose-600 interactive-scale" aria-label={`Delete ${contact.name}`}>
                                                <Icon name="trash" className="w-4 h-4" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-brand-text-primary mb-2 flex items-center gap-2">
                                <Icon name="sparkles" className="w-5 h-5 text-amber-500" />
                                <span>2. Generate with AI (Optional)</span>
                            </h2>
                            <p className="text-brand-text-secondary mb-3">Describe the situation to get personalized message ideas.</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={aiContext}
                                    onChange={(e) => setAiContext(e.target.value)}
                                    placeholder="e.g., 'My friend is stressed about exams...'"
                                    className="flex-grow p-3 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateSuggestions}
                                    disabled={!aiContext.trim() || isGenerating}
                                    className="bg-brand-secondary-800 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand-secondary-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-scale"
                                >
                                    <Icon name={isGenerating ? 'loader' : 'sparkles'} className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                                    {isGenerating ? 'Generating...' : 'Get Ideas'}
                                </button>
                            </div>
                            {aiError && <p className="text-sm text-red-600 mt-2">{aiError}</p>}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-brand-text-primary mb-2">3. Pick a Positive Message</h2>
                            <p className="text-brand-text-secondary mb-4">Choose one of the kind messages below to send.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {isGenerating && (
                                    <div className="sm:col-span-2 text-center p-4">
                                        <Icon name="loader" className="w-6 h-6 animate-spin mx-auto text-brand-primary-500" />
                                    </div>
                                )}
                                {aiSuggestions.map(nudge => (
                                    <button key={nudge} onClick={() => setMessage(nudge)} className={`p-4 border rounded-xl text-left text-sm font-semibold transition-all duration-200 transform hover:scale-105 interactive-scale ${message === nudge ? 'bg-brand-primary-500 text-white border-transparent' : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'}`}>
                                        <div className="flex items-start gap-2">
                                            <Icon name="sparkles" className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <span>{nudge}</span>
                                        </div>
                                    </button>
                                ))}
                                {PREDEFINED_NUDGES.map(nudge => (
                                    <button key={nudge} onClick={() => setMessage(nudge)} className={`p-4 border rounded-xl text-left text-sm font-semibold transition-all duration-200 transform hover:scale-105 interactive-scale ${message === nudge ? 'bg-brand-primary-500 text-white border-transparent' : 'bg-brand-surface text-brand-text-secondary border-brand-secondary-200 hover:bg-brand-secondary-50'}`}>
                                        {nudge}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-28 right-6 md:bottom-10 md:right-10 z-[60] flex flex-col md:flex-row gap-3">
                 <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    disabled={!recipient.trim() || !message.trim()}
                    className="bg-brand-surface text-brand-text-primary font-bold py-3 px-4 rounded-full shadow-lg hover:bg-brand-secondary-50 transition-all transform hover:scale-105 disabled:bg-slate-300/80 disabled:scale-100 disabled:cursor-not-allowed interactive-scale flex items-center justify-center gap-2 border border-brand-secondary-200"
                    aria-label="Schedule Nudge"
                >
                    <Icon name="bell" className="w-5 h-5"/>
                    <span className="hidden md:inline">Schedule</span>
                </button>
                <button
                    onClick={() => setIsConfirming(true)}
                    disabled={!recipient.trim() || !message.trim()}
                    className="bg-brand-secondary-800 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:bg-brand-secondary-900 transition-all transform hover:scale-105 disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed interactive-scale flex items-center justify-center gap-2"
                >
                    <span className="hidden md:inline">Send Now</span>
                    <Icon name="send" className="w-5 h-5"/>
                </button>
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
            <ScheduleNudgeModal 
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSchedule={handleScheduleNudge}
            />
            <Modal
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                title="Confirm Your Nudge"
            >
                <div>
                    <p className="text-brand-text-secondary">You are about to send the following anonymous Nudge to:</p>
                    <div className="my-2 p-3 bg-brand-secondary-100 rounded-lg font-semibold text-brand-text-primary text-center">
                        {recipient}
                    </div>
                    <p className="text-brand-text-secondary mb-2">With the message:</p>
                    <div className="p-4 bg-brand-secondary-100 rounded-lg text-brand-text-secondary text-center italic">
                        "{message}"
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsConfirming(false)}
                            className="px-4 py-2 text-sm font-semibold bg-brand-surface text-brand-text-secondary border border-brand-secondary-200 rounded-lg hover:bg-brand-secondary-100 interactive-scale"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmAndSend}
                            className="px-4 py-2 text-sm font-semibold bg-brand-primary-500 text-white rounded-lg hover:bg-brand-primary-600 flex items-center gap-2 interactive-scale"
                        >
                            <Icon name="send" className="w-4 h-4" />
                            Confirm & Send
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
