import React from 'react';
import { Modal } from './Modal';
import { NotificationSettings } from '../../types';
import { Icon } from './Icon';

interface NotificationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: NotificationSettings;
    onSettingsChange: (newSettings: Partial<NotificationSettings>) => void;
}

const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
}> = ({ checked, onChange, label, description }) => (
    <label className="flex justify-between items-center cursor-pointer p-4 rounded-lg hover:bg-brand-secondary-50 transition-colors">
        <div>
            <p className="font-semibold text-brand-text-primary">{label}</p>
            <p className="text-sm text-brand-text-secondary">{description}</p>
        </div>
        <div className="relative">
            <input 
                type="checkbox" 
                checked={checked}
                onChange={(e) => onChange(e.target.checked)} 
                className="sr-only peer" 
            />
            <div className={`block w-12 h-7 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-brand-primary-300 ${checked ? 'bg-brand-primary-500' : 'bg-brand-secondary-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
    </label>
);

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    
    const settingItems = [
        { key: 'newWink' as const, label: 'New Wink Received', description: 'Notify me when someone sends me a Wink.' },
        { key: 'newNudge' as const, label: 'New Nudge Received', description: 'Notify me when someone sends me a Nudge.' },
        { key: 'secondOpinionRequest' as const, label: 'Second Opinion Request', description: 'Notify me when a friend asks for my opinion.' },
        { key: 'communityReaction' as const, label: 'Reaction to my Wink', description: 'Notify me when someone reacts to a Wink I sent.' },
        { key: 'winkUpdate' as const, label: 'Wink Update Received', description: 'Notify me when I receive a positive update.' },
        { key: 'newForumMessage' as const, label: 'New Forum Messages', description: 'Notify me of new posts in forums I follow.'}
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notification Settings" size="lg">
            <div className="space-y-2">
                <p className="text-brand-text-secondary text-sm mb-2 px-4">Choose which notifications you would like to receive.</p>
                {settingItems.map(item => (
                    <ToggleSwitch 
                        key={item.key}
                        label={item.label}
                        description={item.description}
                        checked={settings[item.key]}
                        onChange={(checked) => onSettingsChange({ [item.key]: checked })}
                    />
                ))}
            </div>
        </Modal>
    );
};
