
import React, { useState } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { TermsAndConditions, PrivacyPolicy } from '../pages/PolicyPages';

interface TermsGateProps {
    onAccept: () => void;
}

export const TermsGate: React.FC<TermsGateProps> = ({ onAccept }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [modalContent, setModalContent] = useState<'terms' | 'privacy' | null>(null);

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-brand-surface p-8 rounded-2xl shadow-2xl border border-brand-secondary-200/50 text-center">
                <Logo className="justify-center mb-4" />
                <h1 className="text-2xl font-bold text-brand-text-primary">Welcome to WinkDrops</h1>
                <p className="text-brand-text-secondary mt-2">Before you begin, please review and accept our terms of service.</p>

                <div className="text-left bg-brand-secondary-50 p-4 rounded-lg my-6 border border-brand-secondary-200">
                    <p className="text-sm text-brand-text-secondary">
                        WinkDrops is a demonstration project and not intended for real-world use. The information provided is not a substitute for professional medical advice.
                    </p>
                    <p className="text-sm text-brand-text-secondary mt-2">
                         By continuing, you acknowledge you have read and agree to our:
                    </p>
                     <div className="flex justify-center gap-4 mt-3">
                        <button onClick={() => setModalContent('terms')} className="font-semibold text-brand-primary-600 hover:underline interactive-scale">Terms & Conditions</button>
                        <button onClick={() => setModalContent('privacy')} className="font-semibold text-brand-primary-600 hover:underline interactive-scale">Privacy Policy</button>
                     </div>
                </div>

                <label className="flex items-center justify-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => setIsChecked(!isChecked)}
                        className="h-5 w-5 rounded border-gray-300 text-brand-primary-600 focus:ring-brand-primary-500"
                    />
                    <span className="text-sm text-brand-text-secondary">I understand and agree to the terms.</span>
                </label>

                <button
                    onClick={onAccept}
                    disabled={!isChecked}
                    className="w-full mt-6 bg-brand-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-scale"
                >
                    Continue
                    <Icon name="arrowRight" className="w-5 h-5" />
                </button>
            </div>
             <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={modalContent === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} size="xl">
                {modalContent === 'terms' && <TermsAndConditions />}
                {modalContent === 'privacy' && <PrivacyPolicy />}
            </Modal>
        </div>
    );
};