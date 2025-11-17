import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Icon } from '@/ui/Icon';

interface AppTourProps {
    isOpen: boolean;
    onClose: () => void;
}

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

const TourStep: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
    <div className="text-center animate-fade-in-up w-full">
        <h3 className="text-2xl font-bold text-brand-text-primary">{title}</h3>
        <p className="text-brand-text-secondary mt-2 mb-6 max-w-md mx-auto">{description}</p>
        <div className="bg-brand-secondary-100 p-4 rounded-xl border border-brand-secondary-200 min-h-[220px] flex items-center justify-center">
            {children}
        </div>
    </div>
);

const DashboardMockup: React.FC = () => (
    <div className="space-y-3 w-full max-w-xs">
        <div className="p-4 rounded-lg bg-gradient-to-br from-brand-primary-400 to-brand-accent-400 text-white text-left shadow-lg">
            <p className="text-lg font-bold">Drop a Wink</p>
            <p className="text-sm opacity-90">Gently share your concern.</p>
        </div>
        <div className="p-4 rounded-lg bg-sky-100 text-sky-900 text-left shadow-md">
            <p className="text-lg font-bold">Give a Nudge</p>
             <p className="text-sm">Send a simple, positive message.</p>
        </div>
         <div className="p-4 rounded-lg bg-brand-surface text-brand-text-primary text-left shadow-md border border-brand-secondary-200">
            <p className="text-lg font-bold">Self Check-in</p>
            <p className="text-sm text-brand-text-secondary">Privately reflect on your well-being.</p>
        </div>
    </div>
);

const WinkCreationObserveMockup: React.FC = () => (
    <div className="p-3 bg-brand-surface rounded-lg border border-brand-secondary-200 w-full max-w-xs text-left">
        <h4 className="font-bold text-sm mb-2">Select Observations</h4>
        <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 p-1 bg-brand-primary-50 rounded"><div className="w-4 h-4 rounded border-2 border-brand-primary-500 bg-brand-primary-500 flex items-center justify-center"><Icon name="check" className="w-3 h-3 text-white"/></div>Looks unusually tired</div>
            <div className="flex items-center gap-2 p-1"><div className="w-4 h-4 rounded border-2 border-brand-secondary-300" />Seems more withdrawn</div>
            <div className="flex items-center gap-2 p-1 bg-brand-primary-50 rounded"><div className="w-4 h-4 rounded border-2 border-brand-primary-500 bg-brand-primary-500 flex items-center justify-center"><Icon name="check" className="w-3 h-3 text-white"/></div>Neglecting responsibilities</div>
        </div>
    </div>
);

const WinkCreationInsightsMockup: React.FC = () => (
     <div className="p-3 bg-brand-surface rounded-lg border-2 border-brand-primary-400 shadow-lg w-full max-w-xs text-left">
        <h4 className="font-bold text-sm mb-2 text-brand-primary-600">AI Provides Gentle Insights</h4>
         <div className="space-y-1.5 text-xs">
            <p className="font-semibold text-brand-text-primary">Potential Insight: Burnout</p>
            <p className="text-brand-text-secondary">A state of emotional, physical, and mental exhaustion...</p>
            <p className="font-semibold text-brand-text-primary mt-2">Resource: Mindful Breathing</p>
        </div>
    </div>
);

const PhoneShell: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`relative w-28 h-56 bg-brand-secondary-800 rounded-2xl p-2 shadow-lg ${className}`}>
        <div className="bg-brand-surface rounded-lg w-full h-full overflow-hidden">
            {children}
        </div>
    </div>
);

const WinkJourneyAnimation: React.FC = () => (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative py-12 md:py-0">
        <PhoneShell>
            <div className="p-2">
                <p className="text-[8px] font-bold">Sending to: Friend</p>
                <div className="w-5 h-5 bg-brand-primary-500 rounded-full mt-2" />
                <p className="text-[7px] text-brand-text-secondary mt-1">Sending anonymously...</p>
            </div>
        </PhoneShell>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 animate-send-wink">
             <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z" className="text-brand-primary-400" fill="currentColor"/>
            </svg>
        </div>
         <PhoneShell>
             <div className="p-2 text-center mt-8">
                <Icon name="bell" className="w-6 h-6 mx-auto text-brand-secondary-400" />
                <p className="text-[8px] font-bold mt-1">New Wink Received</p>
            </div>
        </PhoneShell>
    </div>
);


const WinkReceivedMockup: React.FC = () => (
    <div className="w-full max-w-xs text-left bg-brand-surface p-2 rounded-lg border border-brand-secondary-200">
        <h4 className="font-bold text-sm mb-2 text-center">Helpful Resources</h4>
        <div className="space-y-1.5">
            <div className="p-2 bg-white rounded border border-brand-secondary-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <p className="text-[10px] font-semibold text-brand-primary-700">ARTICLE</p>
                <p className="text-xs font-bold text-brand-text-primary">Understanding Burnout</p>
            </div>
            <div className="p-2 bg-white rounded border border-brand-secondary-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <p className="text-[10px] font-semibold text-brand-primary-700">PRODUCT</p>
                <p className="text-xs font-bold text-brand-text-primary">BetterHelp Online Counseling</p>
            </div>
            <div className="p-2 bg-white rounded border border-brand-secondary-200 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <p className="text-[10px] font-semibold text-brand-primary-700">SUPPORT GROUP</p>
                <p className="text-xs font-bold text-brand-text-primary">Depression Support Group</p>
            </div>
        </div>
    </div>
);

const SelfCareToolsMockup: React.FC = () => (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm text-left">
        <div className="p-3 bg-brand-surface rounded-lg border border-brand-secondary-200">
            <h4 className="font-bold text-sm mb-2">Self Check-in</h4>
            <p className="text-xs text-brand-text-secondary">Privately reflect on your own well-being.</p>
        </div>
        <div className="p-3 bg-brand-surface rounded-lg border border-brand-secondary-200">
            <h4 className="font-bold text-sm mb-2">Send a Nudge</h4>
            <p className="text-xs text-brand-text-secondary">Send a simple, positive pre-written message.</p>
        </div>
    </div>
);

const CommunityMockup: React.FC = () => (
     <div className="space-y-3 text-left w-full max-w-xs">
        <div className="p-3 rounded-lg bg-brand-surface border border-brand-secondary-200 shadow-md">
            <p className="font-bold text-brand-text-primary">Community Feed</p>
            <p className="text-sm text-brand-text-secondary">See anonymous Winks and add your support.</p>
        </div>
        <div className="p-3 rounded-lg bg-brand-surface border border-brand-secondary-200 shadow-md">
            <p className="font-bold text-brand-text-primary">Wink Social Forums</p>
            <p className="text-sm text-brand-text-secondary">Connect with others in anonymous, supportive forums.</p>
        </div>
    </div>
);


const tourSteps = [
    {
        component: <DashboardMockup />,
        title: 'Welcome to Your Dashboard',
        description: "From here, you can easily access all of WinkDrops' core features to support others and yourself.",
    },
    {
        component: <WinkCreationObserveMockup />,
        title: '1. You Observe',
        description: "Notice a friend might be struggling? Simply select what you've seen from a private, comprehensive list of observations.",
    },
    {
        component: <WinkCreationInsightsMockup />,
        title: '2. AI Provides Gentle Insights',
        description: "Our AI analyzes your selections to prepare a non-alarming message with helpful resources. This is never a diagnosis, just support.",
    },
    {
        component: <WinkJourneyAnimation />,
        title: '3. The Anonymous Journey',
        description: "Your identity is never shared. The Wink is delivered privately, letting them know someone cares without pressure.",
    },
    {
        component: <WinkReceivedMockup />,
        title: '4. Support is Delivered',
        description: "The recipient gets a message full of care, potential insights, and actionable resources they can explore on their own time.",
    },
    {
        component: <SelfCareToolsMockup />,
        title: '5. Tools for You & Others',
        description: "Use the same tools for your own private 'Self Check-in', or send a simple, positive 'Nudge' to let someone know you're thinking of them.",
    },
    {
        component: <CommunityMockup />,
        title: '6. You Are Not Alone',
        description: 'Connect with a global community, see that others share similar concerns, and find support in anonymous forums.',
    },
];

export const AppTour: React.FC<AppTourProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const totalSteps = tourSteps.length;

    const handleClose = () => {
        onClose();
        setTimeout(() => setStep(1), 300);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const currentStepData = tourSteps[step - 1];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="WinkDrops Tour" size="lg">
            <div className="flex flex-col items-center text-center">
                <div className="min-h-[300px] w-full flex items-center justify-center">
                    <TourStep title={currentStepData.title} description={currentStepData.description}>
                        {currentStepData.component}
                    </TourStep>
                </div>
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
                            {step < totalSteps ? 'Next' : 'Finish Tour'}
                            {step < totalSteps && <Icon name="arrowRight" className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
