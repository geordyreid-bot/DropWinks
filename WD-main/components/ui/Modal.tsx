
import React from 'react';
import { Icon } from './Icon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-3xl',
    };

    return (
        <div 
            className="fixed inset-0 bg-brand-secondary-800/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className={`bg-brand-surface rounded-2xl shadow-2xl w-full m-4 ${sizeClasses[size]} flex flex-col animate-fade-in-up max-h-[90vh]`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-brand-secondary-200 flex-shrink-0">
                    <h2 id="modal-title" className="text-lg font-bold text-brand-text-primary">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-secondary-100 transition-colors interactive-scale" aria-label="Close modal">
                        <Icon name="x" className="w-5 h-5 text-brand-text-secondary" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};