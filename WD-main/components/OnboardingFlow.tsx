import React, { useState } from 'react';
import { Logo } from './ui/Logo';
import { Icon } from './ui/Icon';
import { Tooltip } from './ui/Tooltip';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingStep: React.FC<{
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
    <div className="text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-brand-primary-100 text-brand-primary-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Icon name={icon} className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text-primary mt-6">{title}</h2>
        <div className="text-brand-text-secondary mt-3 max-w-md mx-auto space-y-3">
            {children}
        </div>
    </div>
);

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


export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-brand-surface p-6 md:p-8 rounded-2xl shadow-2xl border border-brand-secondary-200/50 flex flex-col items-center">
                <Logo className="mb-8" />

                <div className="w-full min-h-[300px] flex items-center justify-center">
                    {step === 1 && (
                        <OnboardingStep icon="eye" title="Welcome to WinkDrop">
                            <p>
                                Ever been concerned about someone but didn't know how to start the conversation?
                            </p>
                            <p>
                                A{" "}
                                <Tooltip content="You'll select a contact, pick observations from a list, and our AI prepares the supportive message. It's that simple!">
                                    <span className="font-bold text-brand-primary-600 border-b-2 border-brand-primary-200 border-dashed">"Wink"</span>
                                </Tooltip>
                                {' '}is a gentle,{' '}
                                <Tooltip content="The recipient will never know who sent the Wink. We have no way to track senders.">
                                    <span className="font-bold text-brand-primary-600 border-b-2 border-brand-primary-200 border-dashed">anonymous</span>
                                </Tooltip>
                                {' '}way to show you care.
                            </p>
                        </OnboardingStep>
                    )}
                    {step === 2 && (
                        <OnboardingStep icon="sparkles" title="Gentle Insights, Not Alarms">
                            <p>
                                Simply select what you've observed, and our{' '}
                                <Tooltip content="The purpose is to provide the recipient with gentle context and helpful resources without being alarming. It turns a simple concern into actionable, supportive information.">
                                    <span className="font-bold text-brand-primary-600 border-b-2 border-brand-primary-200 border-dashed">AI Insights</span>
                                </Tooltip>
                                {' '}will provide gentle resources.
                            </p>
                             <p className="text-sm p-3 bg-rose-50 border-l-4 border-rose-300 text-rose-800 rounded-r-md">
                                <strong>Important:</strong> This is not a diagnosis. WinkDrop is a communication tool, not a substitute for professional medical advice.
                            </p>
                        </OnboardingStep>
                    )}
                     {step === 3 && (
                        <OnboardingStep icon="shieldCheck" title="You Are in Control">
                            <p>
                                Explore other features like private <strong>Self Check-ins</strong> or sending simple, positive <strong>Nudges</strong>.
                            </p>
                            <p>
                                Your data is stored locally on your device. We prioritize your privacy above all.
                            </p>
                        </OnboardingStep>
                    )}
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
                            onClick={step < totalSteps ? nextStep : onComplete}
                            className="bg-brand-primary-500 text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors flex items-center justify-center gap-2 interactive-scale"
                        >
                            {step < totalSteps ? 'Next' : 'Get Started'}
                            {step < totalSteps && <Icon name="arrowRight" className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
