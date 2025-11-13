import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { Contact, ContactMethod } from '../../types';
import { COUNTRY_CODES } from '../../constants';

interface ContactEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact | null;
    onSave: (updatedContact: Contact) => void;
}

const MANUAL_CONTACT_METHODS: ContactMethod[] = ['Phone', 'Email', 'Instagram', 'X', 'Snapchat', 'TikTok', 'WinkDrops'];

export const ContactEditModal: React.FC<ContactEditModalProps> = ({ isOpen, onClose, contact, onSave }) => {
    const [name, setName] = useState('');
    const [method, setMethod] = useState<ContactMethod>('Phone');
    const [handle, setHandle] = useState('');
    const [countryCode, setCountryCode] = useState('+1');

    useEffect(() => {
        if (contact) {
            setName(contact.name);
            setMethod(contact.method);
            if (contact.method === 'Phone') {
                const parts = contact.handle.split(' ');
                const code = parts.find(p => p.startsWith('+'));
                if (code && COUNTRY_CODES.some(c => c.code === code)) {
                    setCountryCode(code);
                    setHandle(parts.filter(p => !p.startsWith('+')).join(' '));
                } else {
                    setCountryCode('+1');
                    setHandle(contact.handle);
                }
            } else {
                setHandle(contact.handle);
            }
        }
    }, [contact]);

    const handleSaveChanges = () => {
        if (!contact || !name.trim() || !handle.trim()) {
            alert('Please fill in all fields.');
            return;
        }

        const finalHandle = method === 'Phone'
            ? `${countryCode} ${handle.trim()}`
            : handle.trim();

        const updatedContact: Contact = {
            ...contact,
            name: name.trim(),
            method: method,
            handle: finalHandle,
        };

        onSave(updatedContact);
    };

    const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMethod(e.target.value as ContactMethod);
        setHandle('');
    };
    
    const getHandleInput = () => {
        switch (method) {
            case 'Phone':
                return (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label htmlFor="edit-country-code" className="block text-sm font-semibold text-brand-text-primary mb-1">Code</label>
                            <select
                                id="edit-country-code"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                            >
                                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.name})</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="edit-handle-phone" className="block text-sm font-semibold text-brand-text-primary mb-1">Phone Number</label>
                            <input
                                id="edit-handle-phone"
                                type="tel"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="555 123 4567"
                                className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                            />
                        </div>
                    </div>
                );
            case 'Email':
                return (
                    <div>
                        <label htmlFor="edit-handle-email" className="block text-sm font-semibold text-brand-text-primary mb-1">Email Address</label>
                        <input
                            id="edit-handle-email"
                            type="email"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                );
            default:
                 return (
                    <div>
                        <label htmlFor="edit-handle-text" className="block text-sm font-semibold text-brand-text-primary mb-1">Handle / Info</label>
                        <input
                            id="edit-handle-text"
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            placeholder={method === 'WinkDrops' ? 'WinkDrops Username' : '@username'}
                            className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Contact">
            <div className="space-y-4">
                <div>
                    <label htmlFor="edit-name" className="block text-sm font-semibold text-brand-text-primary mb-1">Name</label>
                    <input
                        id="edit-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Jane Doe"
                        className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="edit-method" className="block text-sm font-semibold text-brand-text-primary mb-1">Method</label>
                    <select
                        id="edit-method"
                        value={method}
                        onChange={handleMethodChange}
                        className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                    >
                        {MANUAL_CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    {getHandleInput()}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-brand-surface text-brand-text-secondary border border-brand-secondary-200 rounded-lg hover:bg-brand-secondary-100 interactive-scale">
                        Cancel
                    </button>
                    <button onClick={handleSaveChanges} className="px-4 py-2 text-sm font-semibold bg-brand-primary-500 text-white rounded-lg hover:bg-brand-primary-600 flex items-center gap-2 interactive-scale">
                        <Icon name="check" className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    );
};
