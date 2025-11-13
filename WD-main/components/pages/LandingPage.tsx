import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { PhoneMockup } from '../PhoneMockup';
import { MOCK_COMMUNITY_EXPERIENCES } from '../../constants';
import { Modal } from '../ui/Modal';
import { Logo } from '../ui/Logo';
import { AppTour } from '../AppTour';

const AnimatedLogo = () => {
    return (
        <div className="relative w-48 h-48">
             {/* The final outlined logo, which will be "drawn" */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute top-0 left-0">
                 <defs>
                    <linearGradient id="logoGradientLanding" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand-primary-400)"/>
                        <stop offset="100%" stopColor="var(--color-brand-accent-400)"/>
                    </linearGradient>
                </defs>
                {/* The main drop path */}
                <path
                    className="animate-logo-draw-main"
                    d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z"
                    stroke="url(#logoGradientLanding)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    style={{ strokeDasharray: 276, strokeDashoffset: 276, opacity: 0 }}
                />
                
                {/* Eye Feature */}
                <path
                    className="animate-logo-draw-eye"
                    d='M58 60 C 58 66, 68 66, 68 60'
                    stroke="url(#logoGradientLanding)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    style={{ strokeDasharray: 19, strokeDashoffset: 19, opacity: 0 }}
                />
            </svg>

            {/* The falling drop (filled) */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute top-0 left-0 animate-drop-fall">
                <path d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z" fill="url(#logoGradientLanding)" />
            </svg>

             {/* The splash effect container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-48 h-48">
                    <div className="absolute inset-0 border-4 border-brand-primary-300 rounded-full animate-splash-ripple-1 opacity-0" style={{transform: 'scale(0)'}}></div>
                    <div className="absolute inset-0 border-2 border-brand-primary-400 rounded-full animate-splash-ripple-2 opacity-0" style={{transform: 'scale(0)'}}></div>
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ children: React.ReactNode, className?: string, isPadded?: boolean }> = ({ children, className = '', isPadded = true }) => (
    <section className={`${isPadded ? 'py-16 md:py-24' : ''} ${className}`}>
        <div className="w-full max-w-5xl mx-auto px-6">
            {children}
        </div>
    </section>
);

const FeatureCard: React.FC<{ icon: React.ComponentProps<typeof Icon>['name'], title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white/50 rounded-2xl shadow-lg border border-white/50 backdrop-blur-lg h-full">
        <div className="w-16 h-16 bg-brand-primary-100 text-brand-primary-500 rounded-full flex items-center justify-center mb-4 flex-shrink-0">
            <Icon name={icon} className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-text-primary mb-2">{title}</h3>
        <p className="text-brand-text-secondary">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ text: string, author: string, role: string }> = ({ text, author, role }) => (
    <div className="bg-brand-surface p-8 rounded-2xl shadow-xl border border-brand-secondary-200/50 h-full flex flex-col">
        <Icon name="quote" className="w-8 h-8 text-brand-primary-400 mb-4" />
        <p className="text-brand-text-secondary italic flex-grow">"{text}"</p>
        <div className="mt-6 pt-4 border-t border-brand-secondary-200">
            <p className="font-bold text-brand-text-primary">{author}</p>
            <p className="text-sm text-brand-text-secondary">{role}</p>
        </div>
    </div>
);

const ExpertPanel: React.FC = () => {
    const experts = [
        { icon: 'shieldCheck' as const, name: 'Physicians' },
        { icon: 'brain' as const, name: 'Therapists' },
        { icon: 'users' as const, name: 'Educators' },
        { icon: 'activity' as const, name: 'Coaches' },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {experts.map(expert => (
                <div key={expert.name} className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-brand-surface text-brand-primary-500 rounded-full flex items-center justify-center mb-3 shadow-lg border border-brand-secondary-200/50">
                        <Icon name={expert.icon} className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold text-brand-text-primary">{expert.name}</h4>
                </div>
            ))}
        </div>
    );
};

export const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [showContent, setShowContent] = useState(false);
    const [modal, setModal] = useState<'login' | 'signup' | null>(null);
    const [isTourOpen, setIsTourOpen] = useState(false);

    const testimonials = [
        {
            text: "WinkDrops addresses a critical challenge in mental health support: initiating the conversation. It provides a non-confrontational 'first step' that can empower individuals to seek help and feel validated in their struggles.",
            author: "Dr. Anya Sharma",
            role: "Licensed Therapist",
        },
        {
            text: "I see students every day who notice their friends are struggling but are afraid to say the wrong thing. This tool gives them a safe, supportive way to express concern. It's a brilliant bridge between peer support and professional resources.",
            author: "David Chen",
            role: "High School Counselor",
        },
        {
            text: "As a physician, I appreciate that WinkDrops emphasizes that it is not a diagnostic tool. Instead, it gently guides individuals toward professional resources, which is a responsible and much-needed approach in the digital health space.",
            author: "Dr. Marcus Thorne",
            role: "Primary Care Physician",
        },
        {
            text: "This app normalizes the act of checking in. It lowers the barrier for entry for difficult conversations, fostering a culture of care and empathy that is invaluable in any community, be it a campus or a workplace.",
            author: "Elena Rodriguez",
            role: "University Wellness Coordinator",
        },
    ];

    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % testimonials.length);
        }, 7000); // 7 seconds per testimonial
        return () => clearInterval(timer);
    }, []); // Empty dependency array to run only once.

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 1800);
        return () => clearTimeout(timer);
    }, []);

     useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observer.observe(el));

        return () => elements.forEach(el => observer.unobserve(el));
    }, []);
    
    const AuthModal: React.FC<{ type: 'login' | 'signup', onClose: () => void, onAuthSuccess: () => void }> = ({ type, onClose, onAuthSuccess }) => {
        const isLogin = type === 'login';

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // In a real app, this would trigger Firebase auth
            onAuthSuccess();
        };

        return (
             <Modal isOpen={true} onClose={onClose} title={isLogin ? "Welcome Back" : "Create Account"}>
                <div className="space-y-4">
                     <button className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-brand-secondary-300 rounded-lg hover:bg-brand-secondary-50 transition-colors interactive-scale">
                        <svg className="w-5 h-5" viewBox="0 0 48 48" role="img" aria-label="Google logo">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        <span className="text-sm font-semibold text-brand-text-primary">Continue with Google</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <hr className="flex-grow border-brand-secondary-200" />
                        <span className="text-xs text-brand-text-secondary">OR</span>
                        <hr className="flex-grow border-brand-secondary-200" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {!isLogin && (
                            <div>
                                <label className="text-sm font-medium text-brand-text-primary" htmlFor="name">Name</label>
                                <input id="name" type="text" required className="mt-1 w-full p-2 bg-brand-secondary-100 border border-transparent rounded-md focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors" />
                            </div>
                        )}
                         <div>
                            <label className="text-sm font-medium text-brand-text-primary" htmlFor="email">Email</label>
                            <input id="email" type="email" required className="mt-1 w-full p-2 bg-brand-secondary-100 border border-transparent rounded-md focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-brand-text-primary" htmlFor="password">Password</label>
                            <input id="password" type="password" required className="mt-1 w-full p-2 bg-brand-secondary-100 border border-transparent rounded-md focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors" />
                        </div>
                        <button type="submit" className="w-full !mt-5 bg-brand-primary-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors interactive-scale">
                           {isLogin ? 'Log In' : 'Sign Up'}
                        </button>
                    </form>
                </div>
            </Modal>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-brand-primary-100 via-brand-bg to-brand-accent-300 overflow-x-hidden">
            {modal && <AuthModal type={modal} onClose={() => setModal(null)} onAuthSuccess={onLogin} />}
            <AppTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
            
            <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center relative">
                <div className="relative flex flex-col items-center">
                    <AnimatedLogo />

                    <div className={`transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-secondary-800 tracking-tight mt-8">
                            Gentle Gestures,<br /> Anonymously
                        </h1>
                         <p className="mt-4 text-lg text-brand-text-secondary max-w-md mx-auto">
                            Drop an anonymous Wink of support, powered by kind, AI-driven insights.
                        </p>
                    </div>
                    
                     <div className={`transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} mt-10 flex flex-col sm:flex-row items-center justify-center gap-4`} style={{ transitionDelay: '400ms' }}>
                        <button onClick={() => setModal('signup')} className="bg-brand-primary-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-brand-primary-600 transition-all flex items-center justify-center gap-3 interactive-scale animate-pulse-gentle w-full sm:w-auto">
                            <Icon name="eye" className="w-6 h-6"/>
                            Get Started
                        </button>
                        <button onClick={() => setIsTourOpen(true)} className="bg-brand-surface text-brand-text-primary font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-brand-secondary-50 transition-all flex items-center justify-center gap-3 interactive-scale w-full sm:w-auto border border-brand-secondary-200">
                            <Icon name="sparkles" className="w-6 h-6"/>
                            Take a Tour
                        </button>
                    </div>
                    <div className={`transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} mt-4`} style={{ transitionDelay: '500ms' }}>
                         <button onClick={() => setModal('login')} className="font-bold text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                            Already have an account? Log In
                        </button>
                    </div>
                </div>

                <div className={`absolute bottom-8 text-brand-text-secondary transition-opacity duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                    <Icon name="chevronDown" className="w-8 h-8 animate-bounce-slow" />
                </div>
            </div>

            <main>
                <Section>
                    <div className="text-center max-w-2xl mx-auto scroll-animate">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">A Wink is more than a message.</h2>
                        <p className="mt-4 text-lg text-brand-text-secondary">It's a bridge to a conversation, a gentle way to show you care without the pressure of finding the perfect words. Here’s how it works:</p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 scroll-animate scroll-animate-stagger">
                        <div style={{'--stagger-delay': '0ms'} as React.CSSProperties}><FeatureCard icon="eye" title="1. Observe">You notice a friend might be struggling. You're concerned but unsure how to approach them.</FeatureCard></div>
                        <div style={{'--stagger-delay': '150ms'} as React.CSSProperties}><FeatureCard icon="send" title="2. Wink">Anonymously send a 'Wink' by selecting your observations. Our AI prepares gentle, non-alarming insights and resources.</FeatureCard></div>
                        <div style={{'--stagger-delay': '300ms'} as React.CSSProperties}><FeatureCard icon="heart" title="3. Support">Your friend receives a supportive message, encouraging them to explore resources and know someone cares.</FeatureCard></div>
                    </div>
                </Section>
                
                <Section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="scroll-animate">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">See It in Action</h2>
                            <p className="mt-4 text-lg text-brand-text-secondary">A Wink is designed to be helpful, not hurtful. The recipient gets a supportive message with potential insights and a list of resources—never a diagnosis or an alarm.</p>
                            <p className="mt-4 text-brand-text-secondary">This approach empowers them to explore on their own terms, in their own time, while feeling seen and supported.</p>
                        </div>
                        <div className="scroll-animate" style={{'--stagger-delay': '150ms'} as React.CSSProperties}>
                           <PhoneMockup />
                        </div>
                    </div>
                </Section>

                <Section className="bg-brand-secondary-50">
                    <div className="text-center max-w-2xl mx-auto scroll-animate">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">More Ways to Show You Care</h2>
                        <p className="mt-4 text-lg text-brand-text-secondary">Beyond a Wink, there are other gentle ways to connect and offer support.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 scroll-animate scroll-animate-stagger">
                        <div style={{'--stagger-delay': '0ms'} as React.CSSProperties}><FeatureCard icon="share" title="Get a Second Opinion">Unsure about an observation? Confidentially ask trusted friends for their anonymous input with a simple agree/disagree poll.</FeatureCard></div>
                        <div style={{'--stagger-delay': '150ms'} as React.CSSProperties}><FeatureCard icon="nudge" title="Send a Nudge">Sometimes a simple, positive message is all it takes. Send a 'Nudge' to let someone know you're thinking of them, no observations needed.</FeatureCard></div>
                    </div>
                </Section>
                
                <Section>
                    <div className="text-center max-w-2xl mx-auto scroll-animate">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">Stories from the Community</h2>
                        <p className="mt-4 text-lg text-brand-text-secondary">Real stories, real impact. See how a simple gesture has made a difference.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 scroll-animate scroll-animate-stagger">
                        {MOCK_COMMUNITY_EXPERIENCES.map((exp, index) => (
                            <div key={exp.id} style={{'--stagger-delay': `${index * 150}ms`} as React.CSSProperties}>
                               <TestimonialCard text={exp.text} author="Anonymous User" role="Shared Experience"/>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section className="bg-brand-secondary-50">
                    <div className="text-center max-w-2xl mx-auto scroll-animate">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">What Professionals Are Saying</h2>
                        <p className="mt-4 text-lg text-brand-text-secondary">Mental health experts, educators, and physicians see the value in opening gentle lines of communication.</p>
                    </div>
                    <div className="mt-12 max-w-2xl mx-auto scroll-animate">
                        <div className="relative min-h-[340px] sm:min-h-[280px]">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeTestimonial ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                    aria-hidden={index !== activeTestimonial}
                                >
                                    <TestimonialCard
                                        text={testimonial.text}
                                        author={testimonial.author}
                                        role={testimonial.role}
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-center gap-3 mt-6">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTestimonial(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${activeTestimonial === index ? 'bg-brand-primary-500' : 'bg-brand-secondary-300 hover:bg-brand-secondary-400'}`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </Section>
                
                <Section className="bg-brand-surface/50">
                    <div className="text-center max-w-3xl mx-auto scroll-animate">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">Grounded in Care, Guided by Experts</h2>
                        <p className="mt-4 text-lg text-brand-text-secondary">
                            WinkDrops was designed and informed by a team of dedicated Physicians, Therapists, Educators, and Coaches. Our goal is to blend thoughtful technology with expert-backed principles of empathy and supportive communication.
                        </p>
                    </div>
                     <div className="mt-12 max-w-2xl mx-auto scroll-animate scroll-animate-stagger" style={{'--stagger-delay': `150ms`} as React.CSSProperties}>
                        <ExpertPanel />
                    </div>
                </Section>

                <Section>
                    <div className="text-center max-w-2xl mx-auto scroll-animate">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">Ready to show you care?</h2>
                        <p className="mt-4 text-lg text-brand-text-secondary">Start a gentle conversation today. It's anonymous, free, and could make all the difference.</p>
                        <button onClick={() => setModal('signup')} className="mt-8 bg-brand-primary-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-brand-primary-600 transition-all flex items-center gap-3 mx-auto interactive-scale animate-pulse-gentle">
                            <Icon name="eye" className="w-6 h-6"/>
                            Get Started
                        </button>
                    </div>
                </Section>
            </main>

            <footer className="text-center p-8 bg-brand-secondary-100/50 text-brand-text-secondary text-sm">
                &copy; {new Date().getFullYear()} WinkDrops. All rights reserved.
            </footer>
        </div>
    );
};
