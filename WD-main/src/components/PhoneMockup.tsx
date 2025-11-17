import React, { useState, useEffect } from 'react';
import { Icon } from '@/ui/Icon';

const MockupContent = ({ shouldScroll }: { shouldScroll: boolean }) => (
    <div 
        className="absolute top-0 left-0 w-full transition-transform duration-[5000ms] ease-in-out"
        style={{ transform: shouldScroll ? 'translateY(-50%)' : 'translateY(0)' }}
    >
        <div className="p-3 bg-gradient-to-b from-brand-primary-50 to-brand-secondary-100 text-brand-text-primary h-[960px] space-y-3">
            <div className="text-center pt-2">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                >
                    <defs>
                        <linearGradient id="mockupLogo" x1="0" y1="0" x2="1" y2="1">
                             <stop offset="0%" stopColor="var(--color-brand-primary-400)"/>
                             <stop offset="100%" stopColor="var(--color-brand-accent-400)"/>
                        </linearGradient>
                    </defs>
                    <path d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z" stroke="url(#mockupLogo)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d='M58 60 C 58 66, 68 66, 68 60' stroke='url(#mockupLogo)' strokeWidth='7' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
                </svg>
                <h2 className="font-bold text-lg mt-1">A gentle message for you</h2>
            </div>

            <div className="bg-brand-primary-100/50 border-l-4 border-brand-primary-400 text-brand-primary-800 p-2 rounded-r-lg">
                <p className="text-[10px] leading-tight font-medium">This is not a diagnosis. It's an anonymous message of support. For medical advice, please consult a professional.</p>
            </div>
            
            <div>
                <h3 className="font-semibold text-xs mb-1.5 flex items-center gap-1.5 text-brand-text-secondary">
                    <Icon name="eye" className="w-3.5 h-3.5"/>
                    <span>Someone has gently observed:</span>
                </h3>
                <div className="flex flex-wrap gap-1">
                    <span className="bg-white text-brand-text-secondary text-[10px] px-2 py-0.5 rounded-full font-medium border border-brand-secondary-200">Looks unusually tired</span>
                    <span className="bg-white text-brand-text-secondary text-[10px] px-2 py-0.5 rounded-full font-medium border border-brand-secondary-200">Seems more withdrawn</span>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-sm mb-2 text-brand-text-primary">Potential Insights</h3>
                <div className="space-y-1.5">
                    <div className="bg-white p-2 rounded-lg border border-brand-secondary-200 shadow-sm flex items-start gap-2">
                        <div className="w-1 h-full bg-rose-400 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xs text-brand-text-primary">Burnout</h4>
                                <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-rose-100 text-rose-800">High Likelihood</span>
                            </div>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-tight">A state of emotional, physical, and mental exhaustion caused by excessive and prolonged stress.</p>
                        </div>
                    </div>
                     <div className="bg-white p-2 rounded-lg border border-brand-secondary-200 shadow-sm flex items-start gap-2">
                        <div className="w-1 h-full bg-amber-400 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xs text-brand-text-primary">Depression</h4>
                                <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-amber-100 text-amber-800">Medium Likelihood</span>
                            </div>
                            <p className="text-[10px] text-brand-text-secondary mt-0.5 leading-tight">A mood disorder that causes a persistent feeling of sadness and loss of interest.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="font-semibold text-sm mb-2 text-brand-text-primary">Helpful Resources</h3>
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-white p-2 rounded-lg border border-brand-secondary-200 shadow-sm flex items-center gap-2">
                        <Icon name="bookOpen" className="w-4 h-4 text-brand-primary-500 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-brand-primary-700 text-[9px] uppercase">Article</p>
                            <p className="font-bold text-[10px] text-brand-text-primary leading-tight">Understanding Burnout</p>
                        </div>
                    </div>
                     <div className="bg-white p-2 rounded-lg border border-brand-secondary-200 shadow-sm flex items-center gap-2">
                        <Icon name="gift" className="w-4 h-4 text-brand-primary-500 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-brand-primary-700 text-[9px] uppercase">Product</p>
                            <p className="font-bold text-[10px] text-brand-text-primary leading-tight">BetterHelp Online</p>
                        </div>
                    </div>
                     <div className="bg-white p-2 rounded-lg border border-brand-secondary-200 shadow-sm flex items-center gap-2">
                        <Icon name="users" className="w-4 h-4 text-brand-primary-500 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-brand-primary-700 text-[9px] uppercase">Support</p>
                            <p className="font-bold text-[10px] text-brand-text-primary leading-tight">Depression Group</p>
                        </div>
                    </div>
                     <div className="bg-white p-2 rounded-lg border border-brand-secondary-200 shadow-sm flex items-center gap-2">
                        <Icon name="heart" className="w-4 h-4 text-brand-primary-500 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-brand-primary-700 text-[9px] uppercase">Clinic</p>
                            <p className="font-bold text-[10px] text-brand-text-primary leading-tight">Local Therapy Clinic</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-4 text-center">
                <p className="text-[10px] text-brand-text-secondary/60 font-semibold">WinkDrops - The gentle way to show you care.</p>
            </div>
        </div>
    </div>
);


export const PhoneMockup: React.FC = () => {
    const [time, setTime] = useState(new Date());
    const [step, setStep] = useState(0); // 0: lock screen, 1: notification, 2: scrolling, 3: pause at end

    useEffect(() => {
        const timeUpdater = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timeUpdater);
    }, []);
    
     useEffect(() => {
        const timings = [1500, 2500, 5500, 2500]; // Durations for lock, notif, scroll, pause
        const timer = setTimeout(() => {
            setStep((prevStep) => (prevStep + 1) % 4);
        }, timings[step]);
        return () => clearTimeout(timer);
    }, [step]);
    
    const isNotifVisible = step === 1;
    const isAppVisible = step >= 2;
    const shouldScroll = step === 2;
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[520px] w-[260px] shadow-xl">
            <div className="w-[120px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[13px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-brand-primary-100 relative">
                {/* Lock Screen */}
                <div className={`absolute inset-0 bg-gradient-to-br from-brand-primary-200 to-brand-accent-300 flex flex-col items-center justify-start p-6 text-white transition-opacity duration-500 ${isAppVisible ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="mt-12 text-center text-shadow-lg">
                        <p className="text-5xl font-bold">{formattedTime}</p>
                        <p className="text-sm font-medium mt-1">{formattedDate}</p>
                    </div>
                </div>

                {/* Notification */}
                <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-[90%] bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-3 flex items-start gap-3 transition-all duration-500 ease-in-out ${isNotifVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
                     <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-primary-100 flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs><linearGradient id="notifLogo" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#98d1ff"/><stop offset="100%" stopColor="#e9d1ff"/></linearGradient></defs>
                             <path d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z" stroke="url(#notifLogo)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                             <path d='M58 60 C 58 66, 68 66, 68 60' stroke='url(#notifLogo)' strokeWidth='7' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-brand-text-primary">New Wink Received</p>
                        <p className="text-[10px] text-brand-text-secondary leading-tight mt-0.5">Someone sent you an anonymous Wink of support.</p>
                    </div>
                </div>
                
                {/* App Screen */}
                <div className={`absolute inset-0 transition-opacity duration-500 delay-300 overflow-hidden ${isAppVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                   <MockupContent shouldScroll={shouldScroll} />
                </div>
            </div>
        </div>
    );
};
