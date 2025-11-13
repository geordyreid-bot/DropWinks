
import React from 'react';
import { Icon } from './Icon';

interface NotificationBellProps {
    permission: NotificationPermission;
    isSubscribed: boolean;
    onSubscribe: () => void;
    disabled: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ permission, isSubscribed, onSubscribe, disabled }) => {
    const getStatus = () => {
        if (permission === 'denied') {
            return {
                text: 'Notifications Blocked',
                icon: 'bellOff' as const,
                color: 'text-red-500',
                disabled: true,
                actionText: 'Blocked in browser'
            };
        }
        if (isSubscribed) {
            return {
                text: 'Notifications Enabled',
                icon: 'bell' as const,
                color: 'text-emerald-500',
                disabled: true,
                actionText: 'You will receive alerts'
            };
        }
        return {
            text: 'Enable Notifications',
            icon: 'bell' as const,
            color: 'text-brand-text-secondary',
            disabled: false,
            actionText: 'Click to receive alerts'
        };
    };

    const { text, icon, color, disabled: isButtonDisabled, actionText } = getStatus();
    const finalDisabledState = isButtonDisabled || disabled;

    return (
        <button
            onClick={onSubscribe}
            disabled={finalDisabledState}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-md font-medium transition-colors w-full text-left ${
                finalDisabledState ? 'cursor-not-allowed' : 'hover:bg-brand-secondary-100 interactive-scale'
            } ${ finalDisabledState ? 'opacity-70' : '' }`}
        >
            <Icon name={icon} className={`w-6 h-6 flex-shrink-0 ${color}`} />
            <div className="flex flex-col">
                <span className={`font-semibold ${isSubscribed || permission === 'denied' ? color : 'text-brand-text-secondary hover:text-brand-text-primary'}`}>{text}</span>
                <span className="text-xs text-brand-text-secondary">{actionText}</span>
            </div>
        </button>
    );
};