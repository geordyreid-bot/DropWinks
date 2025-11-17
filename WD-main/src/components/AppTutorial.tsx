import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Icon } from '@/ui/Icon';

interface AppTutorialProps {
    isOpen: boolean;
    onClose: () => void;
}

const tutorialSteps = [
    {
        icon: 'eye' as const,
        title: 'What is a Wink?',
        description: "A 'Wink' is a gentle, anonymous way to show you care. If you're concerned about someone, you can select observations about them, and our AI will generate a supportive message with helpful resources for them to explore privately.",
    },
    {
        icon: 'sparkles' as const,
        title: 'AI-Powered Insights',
        description: "WinkDrops uses AI to provide gentle insights, not alarms. Based on your observations, it suggests potential underlying issues and resources. This is never a diagnosis, but rather a way to encourage self-reflection and professional consultation.",
    },
    {
        icon: 'nudge' as const,
        title: 'Sending a Nudge',
        description: "Sometimes, a simple message is all that's needed. A 'Nudge' is a quick, positive, pre-written message to let someone know you're thinking of them, with no observations required.",
    },
    {
        icon: 'clipboardCheck' as const,
        title: 'Wink Updates',
        description: "Noticed a positive change in someone you've sent a Wink to? Use 'Wink Updates' to send a follow-up message. Our AI helps you craft an encouraging note to acknowledge their progress.",
    },
    {
        icon: 'share' as const,
        title: 'Getting a Second Opinion',
        description: "If you're unsure about sending a Wink, you can confidentially ask a few trusted friends for their anonymous input. They'll give a simple 'agree' or 'disagree' to your observations, helping you feel more certain.",
    },
    {
        icon: 'users' as const,
        title: 'The Community Feed',
        description: 'See a global stream of anonymous Winks being sent and received. This feature helps to show that you are not alone in your concerns or struggles. You can add your support with reactions.',
    },
    {
        icon: 'clipboardCheck' as const,
        title: 'Self Check-in',
        description: "Use the same observation checklist for yourself, privately. Get personalized insights and resources for your own well-being. Your self check-ins are for your eyes only and are not shared.",
    },
];

const StepDots: React.FC<{ currentStep: number; totalSteps: number; setStep: (step: number) => void }> = ({ currentStep, totalSteps, setStep }) => (
    <div className="flex justify-center gap-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
            <button
                key={index}
                onClick={() => setStep(index + 1)}
                className={`w-3 h-3 rounded-full transition-colors ${
                    currentStep === index + 1 ? 'bg-brand-primary-500' : 'bg-brand-secondary-300 hover:bg-brand-secondary-400'
                }`}
                aria-label={`Go to step ${index + 1}`}
            />
        ))}
    </div>
);

export const AppTutorial: React.FC<AppTutorialProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const totalSteps = tutorialSteps.length;

    const handleClose = () => {
        onClose();
        // Reset to first step for next time it's opened
        setTimeout(() => setStep(1), 300);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const currentStepData = tutorialSteps[step - 1];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="App Tutorial" size="lg">
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-brand-primary-100 text-brand-primary-500 rounded-full flex items-center justify-center mx-auto shadow-inner mb-6">
                    <Icon name={currentStepData.icon} className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-brand-text-primary">{currentStepData.title}</h3>
                <p className="text-brand-text-secondary mt-3 min-h-[96px] max-w-md mx-auto">
                    {currentStepData.description}
                </p>
                <div className="w-full mt-8">
                    <div className="flex justify-between items-center mb-6">
                         <button
                            onClick={prevStep}
                            className={`font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-opacity ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            Back
                        </button>
                        <StepDots currentStep={step} totalSteps={totalSteps} setStep={setStep} />
                        <button
                            onClick={step < totalSteps ? nextStep : handleClose}
                            className="bg-brand-primary-500 text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors flex items-center justify-center gap-2 interactive-scale"
                        >
                            {step < totalSteps ? 'Next' : 'Done'}
                            {step < totalSteps && <Icon name="arrowRight" className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
