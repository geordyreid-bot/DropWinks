import React, { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { Contact, ContactMethod } from '../../types';
import { COUNTRY_CODES } from '../../constants';

interface SyncContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddContacts: (newContacts: Contact[]) => void;
    onSyncDeviceContacts: () => Promise<void>;
    isSyncingDevice: boolean;
}

const MOCK_SOCIAL_CONTACTS: Record<Exclude<ContactMethod, 'Phone' | 'WinkDrops' | 'Email'>, Omit<Contact, 'id'>[]> = {
    'Instagram': [
        { name: 'Insta Friend 1', method: 'Instagram', handle: '@insta_friend_1' },
        { name: 'Insta Friend 2', method: 'Instagram', handle: '@insta_friend_2' },
    ],
    'X': [
        { name: 'X Colleague', method: 'X', handle: '@x_colleague' },
    ],
    'Snapchat': [
        { name: 'Snap Pal', method: 'Snapchat', handle: 'snap_pal' },
        { name: 'Bestie Snap', method: 'Snapchat', handle: 'bestie_snap' },
    ],
    'TikTok': [
        { name: 'TikTok Creator', method: 'TikTok', handle: '@tiktok_creator' },
    ]
};

const MANUAL_CONTACT_METHODS: ContactMethod[] = ['Phone', 'Email', 'Instagram', 'X', 'Snapchat', 'TikTok', 'WinkDrops'];

export const SyncContactsModal: React.FC<SyncContactsModalProps> = ({ isOpen, onClose, onAddContacts, onSyncDeviceContacts, isSyncingDevice }) => {
    const [manualName, setManualName] = useState('');
    const [manualMethod, setManualMethod] = useState<ContactMethod>('Phone');
    const [manualHandle, setManualHandle] = useState('');
    const [manualCountryCode, setManualCountryCode] = useState('+1');
    
    const handleMockSync = (method: Exclude<ContactMethod, 'Phone' | 'WinkDrops' | 'Email'>) => {
        const newContacts: Contact[] = MOCK_SOCIAL_CONTACTS[method].map((contact, index) => ({
            ...contact,
            id: `mock-${method.toLowerCase()}-${Date.now()}-${index}`
        }));
        onAddContacts(newContacts);
        alert(`Simulated: Added ${newContacts.length} contact(s) from ${method}.`);
        onClose();
    };

    const handleManualAdd = () => {
        if (!manualName.trim() || !manualHandle.trim()) {
            alert('Please fill in all fields.');
            return;
        }
        
        const finalHandle = manualMethod === 'Phone'
            ? `${manualCountryCode} ${manualHandle.trim()}`
            : manualHandle.trim();

        const newContact: Contact = {
            id: `manual-${Date.now()}`,
            name: manualName.trim(),
            method: manualMethod,
            handle: finalHandle,
        };

        onAddContacts([newContact]);
        setManualName('');
        setManualHandle('');
        setManualMethod('Phone');
        setManualCountryCode('+1');
        alert(`Contact "${newContact.name}" added successfully!`);
        onClose();
    };

    const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setManualMethod(e.target.value as ContactMethod);
        setManualHandle(''); // Clear handle when method changes for better UX
    };

    const syncOptions: {
        label: string;
        icon: React.ComponentProps<typeof Icon>['name'];
        method: ContactMethod | 'Device';
        action: () => void;
        disabled?: boolean;
    }[] = [
        { label: 'Sync from Device', icon: 'smartphone', method: 'Device', action: onSyncDeviceContacts, disabled: isSyncingDevice },
        { label: 'Sync from Instagram', icon: 'instagram', method: 'Instagram', action: () => handleMockSync('Instagram') },
        { label: 'Sync from X', icon: 'twitter', method: 'X', action: () => handleMockSync('X') },
        { label: 'Sync from Snapchat', icon: 'ghost', method: 'Snapchat', action: () => handleMockSync('Snapchat') },
        { label: 'Sync from TikTok', icon: 'tiktok', method: 'TikTok', action: () => handleMockSync('TikTok') },
    ];
    
    const getHandleInput = () => {
        switch (manualMethod) {
            case 'Phone':
                return (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label htmlFor="manual-country-code" className="block text-sm font-semibold text-brand-text-primary mb-1">Code</label>
                            <select
                                id="manual-country-code"
                                value={manualCountryCode}
                                onChange={(e) => setManualCountryCode(e.target.value)}
                                className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                            >
                                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.name})</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="manual-handle-phone" className="block text-sm font-semibold text-brand-text-primary mb-1">Phone Number</label>
                            <input
                                id="manual-handle-phone"
                                type="tel"
                                value={manualHandle}
                                onChange={(e) => setManualHandle(e.target.value)}
                                placeholder="555 123 4567"
                                className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                            />
                        </div>
                    </div>
                );
            case 'Email':
                return (
                    <div>
                        <label htmlFor="manual-handle-email" className="block text-sm font-semibold text-brand-text-primary mb-1">Email Address</label>
                        <input
                            id="manual-handle-email"
                            type="email"
                            value={manualHandle}
                            onChange={(e) => setManualHandle(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                );
            default:
                 return (
                    <div>
                        <label htmlFor="manual-handle-text" className="block text-sm font-semibold text-brand-text-primary mb-1">Handle / Info</label>
                        <input
                            id="manual-handle-text"
                            type="text"
                            value={manualHandle}
                            onChange={(e) => setManualHandle(e.target.value)}
                            placeholder={manualMethod === 'WinkDrops' ? 'WinkDrops Username' : '@username'}
                            className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                );
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add & Sync Contacts">
            <div>
                 <div className="mt-2 pt-4 border-t border-brand-secondary-200">
                    <h4 className="font-semibold text-brand-text-primary text-center mb-4">Add Manually</h4>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="manual-name" className="block text-sm font-semibold text-brand-text-primary mb-1">Name</label>
                            <input
                                id="manual-name"
                                type="text"
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                placeholder="e.g., Jane Doe"
                                className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="manual-method" className="block text-sm font-semibold text-brand-text-primary mb-1">Method</label>
                            <select
                                id="manual-method"
                                value={manualMethod}
                                onChange={handleMethodChange}
                                className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                            >
                                {MANUAL_CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            {getHandleInput()}
                        </div>
                         <button
                            onClick={handleManualAdd}
                            className="w-full !mt-6 bg-brand-primary-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors flex items-center justify-center gap-2 interactive-scale"
                        >
                            <Icon name="userPlus" className="w-5 h-5" />
                            Save Contact
                        </button>
                    </div>
                </div>

                <p className="text-brand-text-secondary my-6 text-center text-sm font-semibold">
                    - OR -
                </p>
                <h4 className="font-semibold text-brand-text-primary text-center mb-4">Sync from a Service</h4>
                <div className="space-y-3">
                    {syncOptions.map(opt => (
                        <button
                            key={opt.label}
                            onClick={opt.action}
                            disabled={opt.disabled}
                            className="w-full flex items-center gap-4 p-4 bg-brand-secondary-50 rounded-lg text-left hover:bg-brand-secondary-100 transition-colors disabled:opacity-50 interactive-scale"
                        >
                            <Icon name={opt.icon} className="w-6 h-6 text-brand-secondary-600"/>
                            <span className="font-semibold text-brand-text-primary">{opt.label}</span>
                            {opt.disabled && <Icon name="loader" className="w-5 h-5 animate-spin ml-auto text-brand-secondary-500"/>}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};