
import React from 'react';
import { Icon } from './Icon';

export const MentalHealthDisclaimer: React.FC = () => (
    <div className="bg-rose-50 border-l-4 border-rose-400 text-rose-900 p-4 rounded-r-lg my-6" role="alert">
        <div className="flex items-start gap-3">
            <Icon name="warning" className="w-8 h-8 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-bold">Important Health & Safety Notice</p>
                <p className="text-sm mt-1">
                    This information is not a substitute for professional medical advice. WinkDrop always recommends consulting a physician or qualified mental health provider for any health concerns.
                </p>
                <p className="text-sm mt-2 font-semibold">
                    If you or someone you know is in crisis or immediate danger, please do not rely on this app. Contact a suicide prevention hotline (call or text 988 in the US/Canada) or your local emergency services immediately.
                </p>
            </div>
        </div>
    </div>
);
