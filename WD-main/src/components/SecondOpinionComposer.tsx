import React, { useState } from 'react';
import { Contact } from '@/types';
import { Icon } from '@/ui/Icon';

interface SecondOpinionComposerProps {
    onClose: () => void;
    onSend: (contacts: Contact[]) => void;
    contacts: Contact[];
}

const MIN_CONTACTS_FOR_OPINION = 5;

export const SecondOpinionComposer: React.FC<SecondOpinionComposerProps> = ({ onClose, onSend, contacts }) => {
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

    const handleToggleContact = (contact: Contact) => {
        setSelectedContacts(prev =>
            prev.some(c => c.id === contact.id)
                ? prev.filter(c => c.id !== contact.id)
                : [...prev, contact]
        );
    };

    const handleSendClick = () => {
        onSend(selectedContacts);
        setSelectedContacts([]);
    };

    const availableContacts = contacts.filter(c => !c.isBlocked);
    const canRequestOpinion = availableContacts.length >= MIN_CONTACTS_FOR_OPINION;
    const isSendDisabled = selectedContacts.length < MIN_CONTACTS_FOR_OPINION;
    const contactsNeeded = MIN_CONTACTS_FOR_OPINION - selectedContacts.length;

    return (
        <div className="animate-fade-in-up">
            <div className="relative mb-8">
                <button onClick={onClose} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                    <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-brand-text-primary">Request a Second Opinion</h2>
            </div>
            <div>
                <p className="text-brand-text-secondary mb-4 text-sm text-center max-w-xl mx-auto">
                    Select at least {MIN_CONTACTS_FOR_OPINION} trusted contacts to anonymously ask for their opinion. This ensures that responses remain private. They will only see the original observations, not the AI-generated content.
                </p>
                
                {canRequestOpinion ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto overflow-x-hidden pr-2 mb-4 p-2 bg-brand-secondary-50 rounded-lg">
                        {availableContacts.map(contact => {
                            const isSelected = selectedContacts.some(c => c.id === contact.id);
                            return (
                                <label
                                    key={contact.id}
                                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all interactive-scale overflow-hidden ${isSelected ? 'bg-brand-primary-50 border-brand-primary-500 ring-2 ring-brand-primary-200' : 'bg-brand-surface border-brand-secondary-200 hover:bg-brand-secondary-50'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleContact(contact)}
                                        className="sr-only peer"
                                    />
                                    <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-brand-secondary-300 peer-checked:border-brand-primary-500 flex items-center justify-center transition-colors peer-checked:bg-brand-primary-500">
                                        <Icon name="check" className="w-4 h-4 text-white hidden peer-checked:block" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-brand-text-primary text-sm truncate">{contact.name}</p>
                                        <p className="text-xs text-brand-text-secondary truncate">{contact.handle}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-4 bg-brand-secondary-100 rounded-lg border border-brand-secondary-200 mb-4">
                        <p className="text-sm text-brand-text-secondary">
                            You need at least {MIN_CONTACTS_FOR_OPINION} available (unblocked) contacts to request a second opinion for anonymity.
                        </p>
                    </div>
                )}
                
                {canRequestOpinion && selectedContacts.length > 0 && isSendDisabled && (
                    <div className="text-center text-sm text-amber-800 bg-amber-100 p-3 rounded-lg my-4 border border-amber-200">
                        Please select {contactsNeeded} more contact{contactsNeeded > 1 ? 's' : ''} to ensure anonymity.
                    </div>
                )}
                
                <button
                    onClick={handleSendClick}
                    disabled={isSendDisabled || !canRequestOpinion}
                    className="w-full bg-brand-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-scale"
                >
                    Send to {selectedContacts.length} contact(s)
                    <Icon name="send" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
