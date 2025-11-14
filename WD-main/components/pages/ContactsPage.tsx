import React, { useState } from 'react';
import { Page, Contact, ContactMethod } from '../../types';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { SyncContactsModal } from '../ui/SyncContactsModal';
import { Tooltip } from '../ui/Tooltip';
import { ContactEditModal } from '../ui/ContactEditModal';

interface ContactsPageProps {
    contacts: Contact[];
    onDeleteContact: (contactId: string) => void;
    onToggleBlockContact: (contactId: string, isBlocked: boolean) => void;
    onAddContacts: (newContacts: Contact[]) => void;
    onEditContact: (contact: Contact) => void;
    navigate: (page: Page) => void;
}

const contactMethodIcons: Record<ContactMethod, React.ComponentProps<typeof Icon>['name']> = {
    'WinkDrops': 'users', 'Phone': 'smartphone', 'Email': 'mail', 'Instagram': 'instagram', 'X': 'twitter', 'Snapchat': 'ghost', 'TikTok': 'tiktok'
};

const avatarColors = [
    'bg-red-200 text-red-800', 'bg-sky-200 text-sky-800', 'bg-emerald-200 text-emerald-800',
    'bg-amber-200 text-amber-800', 'bg-indigo-200 text-indigo-800', 'bg-rose-200 text-rose-800',
    'bg-fuchsia-200 text-fuchsia-800', 'bg-teal-200 text-teal-800'
];

const ContactAvatar: React.FC<{ contact: Contact }> = ({ contact }) => {
    const initials = (contact.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const colorIndex = (initials.charCodeAt(0) || 0) % avatarColors.length;
    const colorClass = avatarColors[colorIndex];

    return (
        <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${colorClass}`}>
                {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                <Icon name={contactMethodIcons[contact.method]} className="w-4 h-4 text-brand-secondary-600" />
            </div>
        </div>
    );
};


export const ContactsPage: React.FC<ContactsPageProps> = ({ contacts, onDeleteContact, onToggleBlockContact, onAddContacts, onEditContact, navigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [actionTarget, setActionTarget] = useState<{ contact: Contact; type: 'delete' | 'block' | 'unblock' } | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedContacts = filteredContacts
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce((acc, contact) => {
            const firstLetter = (contact.name[0] || '#').toUpperCase();
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(contact);
            return acc;
        }, {} as Record<string, Contact[]>);
    
    const sortedGroups = Object.keys(groupedContacts).sort();

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
                const newContacts: Contact[] = deviceContacts.flatMap((contact: any) => {
                    const created: Contact[] = [];
                    if (contact.tel && contact.tel[0]) {
                        created.push({
                            id: `sync-tel-${Date.now()}-${created.length}`,
                            name: contact.name?.[0] || 'Unnamed Contact',
                            method: 'Phone' as ContactMethod,
                            handle: contact.tel[0],
                        });
                    }
                    if (contact.email && contact.email[0]) {
                         created.push({
                            id: `sync-email-${Date.now()}-${created.length}`,
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
            setIsSyncModalOpen(false);
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

    return (
        <div className="flex flex-col h-full p-2 sm:p-4 md:p-6">
            <div className="bg-brand-surface w-full max-w-2xl mx-auto rounded-2xl shadow-xl border border-brand-secondary-200/50 flex flex-col flex-1">
                {/* Header */}
                <div className="p-6 sm:p-8 flex-shrink-0">
                    <div className="relative">
                        <button onClick={() => navigate('Dashboard')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                            <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">My Contacts</h1>
                    </div>
                </div>
                
                {/* Content */}
                <div className="px-6 sm:p-8 pb-4">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                         <div className="relative flex-grow">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search contacts..."
                                className="w-full p-3 pl-10 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                            />
                            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary/50"/>
                        </div>
                        <button
                            onClick={() => setIsSyncModalOpen(true)}
                            className="flex items-center justify-center gap-2 font-semibold bg-brand-primary-500 text-white px-4 py-3 rounded-lg hover:bg-brand-primary-600 transition-colors interactive-scale"
                        >
                            <Icon name="userPlus" className="w-5 h-5"/>
                            Add Contacts
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 sm:p-8 themed-scrollbar">
                    {contacts.length > 0 ? (
                        <div className="space-y-4">
                            {sortedGroups.map(letter => (
                                <div key={letter}>
                                    <h2 className="text-lg font-bold text-brand-primary-600 bg-brand-primary-50 px-3 py-1 rounded-md sticky top-0">{letter}</h2>
                                    <div className="mt-2 space-y-3">
                                        {groupedContacts[letter].map(contact => (
                                            <div key={contact.id} className={`p-4 rounded-xl transition-colors ${contact.isBlocked ? 'bg-brand-secondary-100 opacity-70' : 'bg-brand-surface border border-brand-secondary-200'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <ContactAvatar contact={contact} />
                                                        <div className="flex-grow min-w-0">
                                                            <p className="font-semibold text-brand-text-primary truncate">{contact.name}</p>
                                                            <p className="text-sm text-brand-text-secondary truncate">{contact.handle}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <Tooltip content="More options">
                                                            <div className="relative group">
                                                                <button className="p-2 rounded-full hover:bg-brand-secondary-200 text-brand-secondary-500">
                                                                    <Icon name="settings" className="w-4 h-4" />
                                                                </button>
                                                                <div className="absolute top-full right-0 mt-1 bg-white border border-brand-secondary-200 rounded-lg shadow-xl w-40 z-10 hidden group-hover:block">
                                                                    <button onClick={() => setEditingContact(contact)} className="w-full text-left px-3 py-2 text-sm text-brand-text-secondary hover:bg-brand-secondary-50 flex items-center gap-2">
                                                                        <Icon name="pencil" className="w-4 h-4"/> Edit
                                                                    </button>
                                                                    <button onClick={() => setActionTarget({ contact, type: contact.isBlocked ? 'unblock' : 'block' })} className="w-full text-left px-3 py-2 text-sm text-brand-text-secondary hover:bg-brand-secondary-50 flex items-center gap-2">
                                                                        <Icon name="ban" className="w-4 h-4"/> {contact.isBlocked ? 'Unblock' : 'Block'}
                                                                    </button>
                                                                    <button onClick={() => setActionTarget({ contact, type: 'delete' })} className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                                                        <Icon name="trash" className="w-4 h-4"/> Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-brand-secondary-200/50 flex gap-2">
                                                    <button onClick={() => navigate('Create Wink')} disabled={contact.isBlocked} className="flex-1 text-sm font-semibold flex items-center justify-center gap-2 py-2 px-3 bg-brand-primary-100 text-brand-primary-700 rounded-md hover:bg-brand-primary-200 disabled:opacity-50 disabled:cursor-not-allowed interactive-scale">
                                                        <Icon name="eye" className="w-4 h-4"/> Wink
                                                    </button>
                                                    <button onClick={() => navigate('Create Nudge')} disabled={contact.isBlocked} className="flex-1 text-sm font-semibold flex items-center justify-center gap-2 py-2 px-3 bg-brand-secondary-100 text-brand-secondary-700 rounded-md hover:bg-brand-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed interactive-scale">
                                                        <Icon name="nudge" className="w-4 h-4"/> Nudge
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6">
                            <Icon name="contact" className="w-16 h-16 text-brand-secondary-300 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">No Contacts Yet</h2>
                            <p className="text-brand-text-secondary mt-2">Add contacts to start sending Winks and Nudges.</p>
                        </div>
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
        </div>
    );
};