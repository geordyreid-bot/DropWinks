

import React, { useState, useEffect } from 'react';
// Fix: Use Timestamp type from the local types file for consistency with the compat library.
import { Page, Wink, Nudge, InboxItem, SecondOpinionRequest, ScheduledNudge, Timestamp } from '../../types';
import { Icon } from '../ui/Icon';

interface DashboardHomeProps {
    navigate: (page: Page) => void;
    inbox: InboxItem[];
    outbox: InboxItem[];
    communityWinks: Wink[];
    onOpenTutorial: () => void;
    scheduledNudges: ScheduledNudge[];
    onDeleteScheduledNudge: (id: string) => void;
}

// Define the shape of an ad
interface AdResource {
    title: string;
    description: string;
    link: string;
    icon: React.ComponentProps<typeof Icon>['name'];
    cta: string;
}

// Create a list of available ads
const AD_RESOURCES: AdResource[] = [
    {
        title: "Talk it Out, Anytime",
        description: "Connect with licensed therapists online with BetterHelp.",
        link: "https://betterhelp.com",
        icon: "quote",
        cta: "Learn More",
    },
    {
        title: "Find Your Calm",
        description: "Reduce stress and sleep better with the Headspace app.",
        link: "https://headspace.com",
        icon: "sparkles",
        cta: "Try for Free",
    },
    {
        title: "Crisis Text Line",
        description: "In a crisis? Text HOME to 741741 for free, 24/7 support.",
        link: "https://www.crisistextline.org/",
        icon: "smartphone",
        cta: "Get Help Now",
    },
    {
        title: "The Trevor Project",
        description: "Support for LGBTQ young people in crisis, 24/7, for free.",
        link: "https://www.thetrevorproject.org/",
        icon: "heart",
        cta: "Find Support",
    },
    {
        title: "NAMI",
        description: "The National Alliance on Mental Illness provides advocacy, education, and support.",
        link: "https://www.nami.org",
        icon: "users",
        cta: "Visit NAMI",
    }
];

const timeAgo = (date: Timestamp): string => {
    const jsDate = date.toDate();
    const seconds = Math.floor((new Date().getTime() - jsDate.getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
}


const DashboardCard: React.FC<{onClick: () => void, className?: string, children: React.ReactNode}> = ({ onClick, className, children }) => (
    <div
        onClick={onClick}
        className={`bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-secondary-200/30 cursor-pointer hover:shadow-xl hover:border-brand-primary-300 transition-all duration-300 transform hover:-translate-y-1 interactive-scale h-full flex flex-col ${className}`}
    >
        {children}
    </div>
);

const AdCard: React.FC<{ ad: AdResource }> = ({ ad }) => (
    <div className="animated-border-box p-6 rounded-2xl shadow-lg flex flex-col justify-between h-full transform transition-transform duration-300 hover:-translate-y-1">
        <div>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-brand-text-primary">{ad.title}</h3>
                <Icon name={ad.icon} className="w-8 h-8 text-brand-secondary-300"/>
            </div>
            <p className="mt-1 text-sm text-brand-text-secondary">{ad.description}</p>
        </div>
        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center bg-brand-secondary-100 hover:bg-brand-secondary-200 text-brand-text-primary font-bold py-2 px-4 rounded-lg transition-colors interactive-scale">
            {ad.cta}
        </a>
    </div>
);

const ScheduledNudgesCard: React.FC<{ nudges: ScheduledNudge[], onDelete: (id: string) => void }> = ({ nudges, onDelete }) => (
    <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-secondary-200/30">
        <h3 className="text-xl font-bold text-brand-text-primary mb-4">Scheduled Nudges</h3>
        {nudges.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto themed-scrollbar pr-2">
                {nudges.map(sn => (
                    <div key={sn.id} className="bg-brand-secondary-50 p-3 rounded-lg flex items-start gap-3">
                        <Icon name="bell" className="w-5 h-5 text-brand-secondary-500 mt-1 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-brand-text-primary">To: {sn.nudge.recipient}</p>
                            <p className="text-xs text-brand-text-secondary italic">"{sn.nudge.message}"</p>
                            <p className="text-xs text-emerald-700 font-semibold mt-1">
                                Next: {sn.sendAt.toDate().toLocaleString()}
                                {sn.recurrence !== 'none' && ` (${sn.recurrence})`}
                            </p>
                        </div>
                        <button onClick={() => onDelete(sn.id)} className="p-1.5 rounded-full text-brand-secondary-400 hover:bg-rose-100 hover:text-rose-600 transition-colors" aria-label={`Delete scheduled nudge for ${sn.nudge.recipient}`}>
                            <Icon name="trash" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-brand-text-secondary text-center py-4">No nudges scheduled.</p>
        )}
    </div>
);

export const DashboardHome: React.FC<DashboardHomeProps> = ({ navigate, inbox, outbox, communityWinks, onOpenTutorial, scheduledNudges, onDeleteScheduledNudge }) => {
    
    const [displayedAds, setDisplayedAds] = useState<AdResource[]>([]);

    useEffect(() => {
        // Shuffle the ads array on component mount and take the first two
        const shuffled = [...AD_RESOURCES].sort(() => 0.5 - Math.random());
        setDisplayedAds(shuffled.slice(0, 2));
    }, []); // Empty dependency array ensures this runs only once.

    const recentActivity = [...inbox, ...outbox]
        .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
        .slice(0, 4);

    const renderActivityItem = (item: InboxItem) => {
        let icon: React.ComponentProps<typeof Icon>['name'] = 'inbox';
        let text = '';
        const isInInbox = inbox.some(i => i.id === item.id);

        switch (item.type) {
            case 'Wink':
                icon = isInInbox ? 'inbox' : 'send';
                text = isInInbox ? `You received a Wink` : `You sent a Wink to ${item.recipient}`;
                break;
            case 'Nudge':
                icon = isInInbox ? 'heart' : 'send';
                text = isInInbox ? `You received a Nudge` : `You sent a Nudge to ${item.recipient}`;
                break;
            case 'SecondOpinionRequest':
                icon = 'share';
                text = `Second opinion request for ${item.originalRecipientName}`;
                break;
        }
        return (
            <div className="flex items-center gap-3">
                <Icon name={icon} className="w-5 h-5 text-brand-text-secondary flex-shrink-0"/>
                <span className="text-sm text-brand-text-secondary truncate">{text}</span>
                <span className="text-xs text-brand-text-secondary/60 ml-auto flex-shrink-0">{timeAgo(item.timestamp)}</span>
            </div>
        )
    }

    const unreadCount = inbox.filter(item => !item.isRead).length;

    return (
         <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-brand-text-primary">Good morning.</h1>
                <p className="text-brand-text-secondary mt-1">Ready to make a positive impact today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard onClick={() => navigate('Create Wink')} className="bg-gradient-to-br from-brand-primary-400 to-brand-accent-400 text-white">
                    <div className="flex-grow">
                        <h3 className="text-2xl font-bold">Drop a Wink</h3>
                        <p className="mt-1 opacity-80">Gently share your concern.</p>
                    </div>
                    <div className="flex justify-end">
                        <svg
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10 opacity-70"
                        >
                            <path d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d='M58 60 C 58 66, 68 66, 68 60' stroke='currentColor' strokeWidth='7' strokeLinecap="round" strokeLinejoin="round" fill='none'/>
                        </svg>
                    </div>
                </DashboardCard>
                <DashboardCard onClick={() => navigate('Create Nudge')} className="bg-gradient-to-br from-sky-100 to-violet-100">
                    <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-sky-900">Give a Nudge</h3>
                        <p className="mt-1 text-sky-800">Send a simple, positive message.</p>
                    </div>
                    <div className="flex justify-end">
                        <Icon name="heart" className="w-10 h-10 text-sky-600 opacity-70"/>
                    </div>
                </DashboardCard>
                <DashboardCard onClick={() => navigate('Wink Updates')} className="bg-gradient-to-br from-emerald-100 to-cyan-100">
                     <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-teal-800">Update a Wink</h3>
                        <p className="mt-1 text-teal-700">Follow up with a positive observation.</p>
                    </div>
                    <div className="flex justify-end">
                        <Icon name="sparkles" className="w-10 h-10 text-teal-600 opacity-70"/>
                    </div>
                </DashboardCard>
                <DashboardCard onClick={() => navigate('Wink Social')}>
                    <Icon name="quote" className="w-8 h-8 text-brand-secondary-500 mb-2"/>
                    <h3 className="text-xl font-bold text-brand-text-primary">Wink Social</h3>
                    <p className="text-sm text-brand-text-secondary mt-1">Connect with others in anonymous, supportive forums.</p>
                </DashboardCard>
                 <DashboardCard onClick={() => navigate('Self Check-in')}>
                     <Icon name="clipboardCheck" className="w-8 h-8 text-brand-secondary-500 mb-2"/>
                    <h3 className="text-xl font-bold text-brand-text-primary">Self Check-in</h3>
                    <p className="text-sm text-brand-text-secondary mt-1">Privately reflect on your well-being.</p>
                </DashboardCard>
                <DashboardCard onClick={() => navigate('Community')}>
                    <div className="flex-grow">
                        <Icon name="users" className="w-8 h-8 text-brand-secondary-500 mb-2"/>
                        <h3 className="text-xl font-bold text-brand-text-primary">Community</h3>
                        <p className="text-sm text-brand-text-secondary mt-1">{communityWinks.length} winks shared globally.</p>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-auto pt-4 border-t border-brand-secondary-100">
                        <Icon name="twitter" className="w-5 h-5 text-brand-secondary-400" />
                        <Icon name="instagram" className="w-5 h-5 text-brand-secondary-400" />
                        <Icon name="tiktok" className="w-5 h-5 text-brand-secondary-400" />
                        <Icon name="ghost" className="w-5 h-5 text-brand-secondary-400" />
                    </div>
                </DashboardCard>
                 <DashboardCard onClick={() => navigate('Inbox')}>
                    <Icon name="inbox" className="w-8 h-8 text-brand-secondary-500 mb-2"/>
                    <h3 className="text-xl font-bold text-brand-text-primary">Inbox</h3>
                    <p className="text-sm text-brand-text-secondary mt-1">{unreadCount > 0 ? `${unreadCount} unread message(s)` : 'Your inbox is clear.'}</p>
                </DashboardCard>
                 <DashboardCard onClick={onOpenTutorial}>
                    <Icon name="helpCircle" className="w-8 h-8 text-brand-secondary-500 mb-2"/>
                    <h3 className="text-xl font-bold text-brand-text-primary">App Tutorial</h3>
                    <p className="text-sm text-brand-text-secondary mt-1">Learn about all of WinkDrops' features.</p>
                </DashboardCard>

                {/* Advertisement Cards */}
                {displayedAds.map((ad, index) => (
                    <AdCard key={index} ad={ad} />
                ))}

            </div>
            
            <ScheduledNudgesCard nudges={scheduledNudges} onDelete={onDeleteScheduledNudge} />

            <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-secondary-200/30">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-text-primary">Recent Activity</h3>
                 </div>
                 {recentActivity.length > 0 ? (
                     <div className="space-y-4">
                        {recentActivity.map(item => <div key={item.id}>{renderActivityItem(item)}</div>)}
                    </div>
                 ) : (
                    <p className="text-sm text-brand-text-secondary text-center py-4">No recent activity to show.</p>
                 )}
            </div>
         </div>
    );
};