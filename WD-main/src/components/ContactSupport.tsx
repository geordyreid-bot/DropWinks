import React, { useState } from 'react';
import { Page } from '@/types';
import { Icon } from '@/ui/Icon';

interface ContactSupportProps {
    navigate: (page: Page) => void;
}

export const ContactSupport: React.FC<ContactSupportProps> = ({ navigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1500);
    };

    if (isSubmitted) {
        return (
            <div className="flex justify-center items-start p-4 sm:p-6 lg:p-8 min-h-full">
                <div className="bg-brand-surface w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl border border-brand-secondary-200/50 text-center animate-fade-in-up">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <Icon name="check" className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-text-primary mt-6">Thank You!</h1>
                    <p className="text-brand-text-secondary mt-2">Your feedback has been submitted. Our team will review it shortly. If you provided an email, we may reach out for more details.</p>
                    <button
                        onClick={() => navigate('Dashboard')}
                        className="w-full mt-8 bg-brand-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors flex items-center justify-center gap-2 interactive-scale"
                    >
                        <Icon name="home" className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="bg-brand-surface w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl border border-brand-secondary-200/50">
                <div className="relative mb-6">
                    <button onClick={() => navigate('Dashboard')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                        <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary text-center">Contact & Feedback</h1>
                </div>
                <p className="text-center text-brand-text-secondary mb-8 -mt-4">
                    Have a question, suggestion, or need support? We'd love to hear from you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-brand-text-primary mb-1.5">Name (Optional)</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full p-3 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-brand-text-primary mb-1.5">Email (Optional)</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full p-3 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                         <p className="text-xs text-brand-text-secondary mt-1">Provide an email if you'd like a response.</p>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-brand-text-primary mb-1.5">Message</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="How can we help?"
                            required
                            rows={5}
                            className="w-full p-3 bg-brand-secondary-100 border border-transparent placeholder-brand-secondary-400 rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                     <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!message.trim() || isSubmitting}
                            className="w-full bg-brand-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-scale"
                        >
                            {isSubmitting ? <Icon name="loader" className="w-5 h-5 animate-spin" /> : <Icon name="send" className="w-5 h-5" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
