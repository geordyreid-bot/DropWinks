
import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { PhoneMockup } from '../PhoneMockup';
import { MOCK_COMMUNITY_EXPERIENCES } from '../../constants';
import { Modal } from '../ui/Modal';
import { Logo } from '../ui/Logo';
import { AppTour } from '../AppTour';
import { auth } from '../../firebase';
// Fix: Use firebase/compat/app for imports and methods.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';


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
                    <div className="absolute inset-0 border-2 border-brand-primary-300 rounded-full animate-splash-ripple-1 opacity-0" style={{transform: 'scale(0)'}}></div>
                    <div className="absolute inset-0 border-2 border-brand-primary-400 rounded-full animate-splash-ripple-2 opacity-0" style={{transform: 'scale(0)'}}></div>
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ children: React.ReactNode, className?: string, isPadded?: boolean, id?: string }> = ({ children, className = '', isPadded = true, id }) => (
    <section id={id} className={`${isPadded ? 'py-16 md:py-24' : ''} ${className}`}>
        <div className="w-full max-w-5xl mx-auto px-6">
            {children}
        </div>
    </section>
);

const FeatureCard: React.FC<{ icon: React.ComponentProps<typeof Icon>['name'], title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white/50 rounded-2xl shadow-lg border border-white/50 backdrop-blur-lg h-full transition-transform duration-300 hover:scale-105">
        <div className="w-16 h-16 bg-brand-primary-100 text-brand-primary-500 rounded-full flex items-center justify-center mb-4 flex-shrink-0">
            <Icon name={icon} className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-text-primary mb-2">{title}</h3>
        <p className="text-brand-text-secondary">{children}</p>
    </div>
);

const TestimonialCarousel: React.FC<{
    testimonials: { text: string, author: string, role: string }[];
    title: string;
}> = ({ testimonials, title }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % testimonials.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    return (
        <div className="scroll-animate">
            <h3 className="text-2xl md:text-3xl font-bold text-brand-text-primary text-center mb-8">{title}</h3>
            <div className="relative min-h-[18rem] md:min-h-[16rem]">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${activeIndex === index ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <TestimonialCard {...testimonial} />
                    </div>
                ))}
            </div>
             <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            activeIndex === index ? 'bg-brand-primary-500' : 'bg-brand-secondary-300 hover:bg-brand-secondary-400'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};


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
        { icon: 'helpCircle' as const, name: 'Counsellors' },
        { icon: 'bookOpen' as const, name: 'Educators' },
    ];
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
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

interface AuthModalProps {
    type: 'login' | 'signup';
    onClose: () => void;
    setModal: (modal: 'login' | 'signup' | null) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ type, onClose, setModal }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isLogin = type === 'login';

    const handleAuthError = (err: any) => {
        let message = 'An unknown error occurred. Please try again.';
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = 'Invalid email or password.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists.';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
        }
        setError(message);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        // Fix: Use firebase.auth.GoogleAuthProvider for compat mode.
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            // Fix: Use auth.signInWithPopup(provider) for compat mode.
            await auth.signInWithPopup(provider);
            onClose();
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (isLogin) {
            try {
                // Fix: Use auth.signInWithEmailAndPassword for compat mode.
                await auth.signInWithEmailAndPassword(email, password);
                onClose();
            } catch (err: any) {
                handleAuthError(err);
            } finally {
                setIsLoading(false);
            }
        } else { // Sign up
            if (!name.trim()) {
                setError("Please enter your name.");
                setIsLoading(false);
                return;
            }
            try {
                // Fix: Use auth.createUserWithEmailAndPassword for compat mode.
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                if (userCredential.user) {
                    // Fix: Use user.updateProfile for compat mode.
                    await userCredential.user.updateProfile({ displayName: name });
                }
                onClose();
            } catch (err: any) {
                handleAuthError(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
         <Modal isOpen={true} onClose={onClose} title={isLogin ? "Welcome Back" : "Create Account"}>
            <div className="space-y-4">
                {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                 <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-brand-secondary-300 rounded-lg hover:bg-brand-secondary-50 transition-colors interactive-scale disabled:opacity-50">
                    <svg className="w-5 h-5" viewBox="0 0 48 48" role="img" aria-label="Google logo">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.84c-.57 2.82-2.34 5.22-4.96 6.81v5.53h7.1c4.16-3.83 6.56-9.47 6.56-16.3z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59v-5.53H2.56C1.02 17.02 0 20.36 0 24c0 3.64 1.02 6.98 2.56 9.53l7.97-6.53z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.53c-2.16 1.45-4.96 2.3-8.79 2.3-6.66 0-12.33-4.46-14.35-10.46H2.56v5.73C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    Sign {isLogin ? 'in' : 'up'} with Google
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-brand-secondary-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-brand-surface px-2 text-brand-text-secondary">Or</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="sr-only">Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Your Name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-brand-secondary-100 border border-transparent rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-brand-secondary-100 border border-transparent rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-brand-secondary-100 border border-transparent rounded-lg focus:bg-white focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-brand-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand-primary-600 transition-colors disabled:bg-slate-300 flex items-center justify-center gap-2">
                        {isLoading ? <Icon name="loader" className="w-5 h-5 animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-brand-text-secondary">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setModal(isLogin ? 'signup' : 'login')} className="font-semibold text-brand-primary-600 hover:underline ml-1">
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </Modal>
    );
};


export const LandingPage: React.FC = () => {
    const [modal, setModal] = useState<'login' | 'signup' | null>(null);
    const [isTourOpen, setIsTourOpen] = useState(false);

    const userTestimonials = [
         {
            text: "Getting a Wink was a turning point. It made me realize I wasn't hiding my struggles as well as I thought, but also that someone cared enough to reach out. It gave me the courage to talk to a professional.",
            author: "Anonymous User",
            role: "Wink Recipient",
        },
        {
            text: "I was so anxious about a friend, and WinkDrop let me break the ice without making things awkward. They actually brought it up to me later and we had a real conversation. So grateful.",
            author: "Anonymous User",
            role: "Wink Sender",
        },
    ];
    
    const professionalTestimonials = [
        {
            text: "WinkDrops addresses a critical challenge in mental health support: initiating the conversation. It provides a non-confrontational 'first step' that can empower individuals.",
            author: "Dr. Anya Sharma",
            role: "Licensed Therapist",
        },
        {
            text: "I see students every day who notice their friends are struggling but are afraid to say the wrong thing. This tool gives them a safe, supportive way to express concern.",
            author: "David Chen",
            role: "High School Counselor",
        },
    ];

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

    const scrollToContent = () => {
        document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
    };
    

    return (
        <div className="bg-brand-bg min-h-screen overflow-x-hidden">
            <main>
                <section className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-primary-200/50 rounded-full filter blur-3xl opacity-60"></div>
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-accent-300/50 rounded-full filter blur-3xl opacity-60"></div>
                    <div className="relative z-10 text-center flex flex-col items-center">
                        <AnimatedLogo />
                        <h1
                            className="text-4xl md:text-5xl font-bold text-brand-text-primary mt-8 max-w-3xl mx-auto animate-fade-in-up"
                            style={{ animationDelay: '1800ms', animationFillMode: 'backwards' }}
                        >
                            Gentle gestures,
                            <br />
                            Anonymously.
                        </h1>
                        <div
                            className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up"
                            style={{ animationDelay: '2000ms', animationFillMode: 'backwards' }}
                        >
                            <button onClick={() => setModal('login')} className="font-semibold bg-brand-primary-500 text-white py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary-600 transition-colors interactive-scale">
                                Log In
                            </button>
                            <button onClick={() => setModal('signup')} className="font-semibold bg-brand-secondary-800 text-white py-3 px-8 rounded-full shadow-lg hover:bg-black transition-colors interactive-scale">
                                Sign Up
                            </button>
                        </div>
                        <button
                            onClick={() => setIsTourOpen(true)}
                            className="mt-8 font-semibold text-brand-text-primary hover:text-brand-primary-600 transition-colors flex items-center gap-2 interactive-scale mx-auto animate-fade-in-up"
                            style={{ animationDelay: '2200ms', animationFillMode: 'backwards' }}
                        >
                            <Icon name="helpCircle" className="w-5 h-5" /> Take a Tour
                        </button>
                    </div>
                     <button
                        onClick={scrollToContent}
                        className="absolute bottom-10 z-20 text-brand-text-secondary animate-bounce-slow animate-fade-in"
                        style={{ animationDelay: '2500ms', animationFillMode: 'backwards' }}
                        aria-label="Scroll down to content"
                    >
                        <Icon name="chevronDown" className="w-8 h-8" />
                    </button>
                </section>
                
                <Section id="main-content" isPadded={true} className="relative">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-center md:text-left px-6 scroll-animate is-visible">
                             <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary">Turn Concern into Connection</h2>
                             <p className="text-md text-brand-text-secondary mt-3">WinkDrops helps you bridge the gap when you're worried about someone, but don't know what to say.</p>
                             <div className="mt-8 space-y-6">
                                <div className="flex items-start gap-4 text-left">
                                    <div className="w-12 h-12 bg-brand-primary-100 text-brand-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon name="shieldCheck" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-text-primary">Anonymous & Private</h4>
                                        <p className="text-sm text-brand-text-secondary">Your identity is always protected. The recipient never knows who sent the Wink, allowing them to focus on the message, not the messenger.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-left">
                                    <div className="w-12 h-12 bg-brand-primary-100 text-brand-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon name="sparkles" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-text-primary">AI-Powered Insights</h4>
                                        <p className="text-sm text-brand-text-secondary">Our AI transforms your simple observations into a supportive message with helpful, non-alarming resources, making it easy to offer meaningful support.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-left">
                                    <div className="w-12 h-12 bg-brand-primary-100 text-brand-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon name="settings" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-text-primary">You're in Control</h4>
                                        <p className="text-sm text-brand-text-secondary">From private self-check-ins to simple 'Nudges,' WinkDrops provides a suite of tools for you to use as you see fit.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="scroll-animate is-visible" style={{ transitionDelay: '200ms' }}>
                            <PhoneMockup />
                        </div>
                    </div>
                </Section>

                <Section className="bg-brand-secondary-100/50">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary scroll-animate">How it Works</h2>
                        <p className="text-md text-brand-text-secondary mt-3 scroll-animate" style={{ transitionDelay: '100ms' }}>A simple process to turn concern into connection.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 mt-12 scroll-animate-stagger">
                        <div style={{ '--stagger-delay': '200ms' }}>
                            <FeatureCard icon="eye" title="1. You Observe">
                                Select from a private list of observations. It’s quick, simple, and non-judgmental.
                            </FeatureCard>
                        </div>
                         <div style={{ '--stagger-delay': '300ms' }}>
                            <FeatureCard icon="sparkles" title="2. AI Provides Insights">
                                Our AI prepares a gentle message with helpful resources. It's supportive, not alarming.
                            </FeatureCard>
                        </div>
                         <div style={{ '--stagger-delay': '400ms' }}>
                            <FeatureCard icon="shieldCheck" title="3. They Receive Support">
                                Your friend receives an anonymous message, giving them privacy to reflect without pressure.
                            </FeatureCard>
                        </div>
                    </div>
                </Section>

                <Section>
                     <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary scroll-animate">Developed with Expert Input</h2>
                        <p className="text-md text-brand-text-secondary mt-3 scroll-animate" style={{ transitionDelay: '100ms' }}>Our framework is developed with input from physicians, therapists, counsellors, and educators to ensure our approach is responsible, safe, and genuinely helpful.</p>
                    </div>
                    <div className="mt-12 scroll-animate" style={{ transitionDelay: '200ms' }}>
                        <ExpertPanel />
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 mt-24">
                        <TestimonialCarousel title="From Our Users" testimonials={userTestimonials} />
                        <TestimonialCarousel title="From Professionals" testimonials={professionalTestimonials} />
                    </div>
                </Section>
                
                 <Section className="bg-brand-secondary-100/50">
                     <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary scroll-animate">More Than Just a Message</h2>
                        <p className="text-md text-brand-text-secondary mt-3 scroll-animate" style={{ transitionDelay: '100ms' }}>WinkDrops offers a suite of tools for fostering well-being.</p>
                    </div>
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 scroll-animate-stagger">
                         <div style={{ '--stagger-delay': '200ms' }}><FeatureCard icon="nudge" title="Send a Nudge">Just want to say "thinking of you"? Send a simple, pre-written positive message.</FeatureCard></div>
                         <div style={{ '--stagger-delay': '300ms' }}><FeatureCard icon="clipboardCheck" title="Self Check-in">Use the same observation checklist for yourself, privately. Get personalized insights and resources for your own well-being.</FeatureCard></div>
                         <div style={{ '--stagger-delay': '400ms' }}><FeatureCard icon="share" title="Second Opinion">Unsure about a Wink? Confidentially ask a few trusted friends for their anonymous input to feel more certain.</FeatureCard></div>
                         <div style={{ '--stagger-delay': '500ms' }}><FeatureCard icon="users" title="Community Feed">See a global stream of anonymous Winks being sent and received, showing that you are not alone in your concerns or struggles.</FeatureCard></div>
                    </div>
                </Section>

                <Section>
                    <div className="bg-gradient-to-br from-brand-primary-400 to-brand-accent-400 text-white p-8 md:p-12 rounded-2xl shadow-2xl text-center scroll-animate">
                        <h2 className="text-3xl md:text-4xl font-bold">Ready to make a difference?</h2>
                        <p className="mt-3 text-lg opacity-90 max-w-2xl mx-auto">Start a conversation that matters. Your gentle gesture could be the first step on someone's path to feeling better.</p>
                        <button onClick={() => setModal('signup')} className="mt-8 bg-white text-brand-primary-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary-50 transition-colors interactive-scale">
                            Create Your First Wink
                        </button>
                    </div>
                </Section>
            </main>

            <footer className="bg-brand-secondary-800 text-white">
                <div className="w-full max-w-5xl mx-auto px-6 py-12">
                     <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <Logo />
                            <p className="text-sm text-brand-secondary-300 mt-2">The gentle way to show you care.</p>
                        </div>
                        <div>
                            <h4 className="font-bold">Features</h4>
                            <ul className="space-y-2 mt-2 text-sm text-brand-secondary-300">
                                <li>Anonymous Winks</li>
                                <li>Self Check-in</li>
                                <li>Community Feed</li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold">Company</h4>
                            <ul className="space-y-2 mt-2 text-sm text-brand-secondary-300">
                                <li>About Us</li>
                                <li>Contact Support</li>
                                <li>Privacy Policy</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold">Connect</h4>
                             <div className="flex gap-4 mt-2">
                                <a href="#" aria-label="Twitter"><Icon name="twitter" className="w-6 h-6 text-brand-secondary-300 hover:text-white" /></a>
                                <a href="#" aria-label="Instagram"><Icon name="instagram" className="w-6 h-6 text-brand-secondary-300 hover:text-white" /></a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-brand-secondary-700 pt-8 text-center text-sm text-brand-secondary-400">
                        &copy; {new Date().getFullYear()} WinkDrops. All Rights Reserved. This is a demonstration app.
                    </div>
                </div>
            </footer>
            
            {modal && <AuthModal type={modal} onClose={() => setModal(null)} setModal={setModal} />}
            <AppTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
        </div>
    );
};
