import React from 'react';
import { Page } from '../../types';
import { Icon } from '../ui/Icon';
import { PrivacyPolicy } from './PolicyPages';

interface PrivacyPageProps {
    navigate: (page: Page) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigate }) => {
    return (
        <div className="flex justify-center items-start p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="bg-brand-surface w-full max-w-2xl p-6 sm:p-8 rounded-2xl shadow-xl border border-brand-secondary-200/50">
                <div className="relative mb-6">
                    <button onClick={() => navigate('Dashboard')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                        <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">Privacy Policy</h1>
                </div>
                <PrivacyPolicy />
            </div>
        </div>
    );
};