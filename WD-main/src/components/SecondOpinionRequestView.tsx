

import React, { useState } from 'react';
import { SecondOpinionRequest } from '../types';
import { Icon } from './ui/Icon';

interface SecondOpinionRequestViewProps {
    request: SecondOpinionRequest;
    onResponse: (requestId: string, winkId: string, response: 'agree' | 'disagree') => void;
}

export const SecondOpinionRequestView: React.FC<SecondOpinionRequestViewProps> = ({ request, onResponse }) => {
    const [submitted, setSubmitted] = useState(false);

    const handleResponse = (response: 'agree' | 'disagree') => {
        onResponse(request.id, request.winkId, response);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="text-center p-8 bg-emerald-50 rounded-lg animate-fade-in">
                <Icon name="check" className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="mt-4 text-xl font-bold text-emerald-800">Thank you for your opinion!</h3>
                <p className="text-emerald-700 mt-1">Your anonymous feedback has been recorded.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up-subtle">
            <p className="text-brand-text-secondary mb-4">
                A friend has asked for your anonymous opinion on some things they've noticed about <span className="font-bold text-brand-text-primary">{request.originalRecipientName}</span>. Your response is completely confidential.
            </p>
            
            <div className="bg-brand-secondary-50 p-4 rounded-xl border border-brand-secondary-200 mb-6">
                 <h4 className="font-semibold text-brand-text-primary mb-3 text-md flex items-center gap-2">
                    <Icon name="eye" className="w-5 h-5 text-brand-text-secondary"/>
                    <span>Observed characteristics:</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                    {request.winkObservables.map(obs => (
                        <div key={obs.id} className="bg-white text-brand-text-secondary text-sm px-3 py-1.5 rounded-lg border border-brand-secondary-200 break-words">
                            {obs.text}
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mb-2">
                <p className="font-semibold text-brand-text-primary">Based on these observations, do you generally agree there might be a reason for concern?</p>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
                <button
                    onClick={() => handleResponse('agree')}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-emerald-600 transition-all transform hover:scale-105 interactive-scale"
                >
                    <Icon name="thumbsUp" className="w-5 h-5"/>
                    Agree
                </button>
                 <button
                    onClick={() => handleResponse('disagree')}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-rose-600 transition-all transform hover:scale-105 interactive-scale"
                >
                    <Icon name="thumbsDown" className="w-5 h-5"/>
                    Disagree
                </button>
            </div>
        </div>
    );
};