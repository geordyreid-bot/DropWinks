import React, { useEffect, useRef, useState } from 'react';
import { Page, Wink, Nudge, InboxItem, Contact, CommunityExperience, ReactionType, NotificationSettings, ForumMessage, ScheduledNudge } from '../../types';
import { Icon, icons } from '../ui/Icon';
import { Inbox } from '../Inbox';
import { WinkComposer } from '../WinkComposer';
import { CommunityFeed } from '../CommunityFeed';
import { Logo } from '../ui/Logo';
import { DashboardHome } from './DashboardHome';
import { NudgeComposer } from '../NudgeComposer';
import { SelfCheckin } from '../SelfCheckin';
import { NotificationBell } from '../ui/NotificationBell';
import { NotificationSettingsModal } from '../ui/NotificationSettingsModal';
import { ContactSupport } from '../ContactSupport';
import { GiftMarketplace } from '../GiftMarketplace';
import { WinkUpdates } from '../WinkUpdates';
import { AppTutorial } from '../AppTutorial';
import { WinkSocial } from './WinkSocial';
import { PrivacyPage } from './PrivacyPage';
import { ContactsPage } from './ContactsPage';

interface DashboardProps {
    currentPage: Page;
    navigate: (page: Page) => void;
    onLogout: () => void;
    inbox: InboxItem[];
    outbox: InboxItem[];
    communityWinks: Wink[];
    communityExperiences: CommunityExperience[];
    contacts: Contact[];
    addWinkToOutbox: (wink: Wink) => void;
    addNudgeToOutbox: (nudge: Nudge) => void;
    handleCommunityWinkReaction: (winkId: string, reactionType: ReactionType) => void;
    addCommunityExperience: (experience: CommunityExperience) => void;
    notificationPermission: NotificationPermission;
    notificationSettings: NotificationSettings;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
    isSubscribed: boolean;
    isSubscriptionLoading: boolean;
    onSubscribe: () => void;
    markItemAsRead: (itemId: string) => void;
    handleSendSecondOpinionRequests: (winkId: string, contacts: Contact[]) => void;
    handleSecondOpinionResponse: (requestId: string, winkId: string, response: 'agree' | 'disagree') => void;
    handleDeleteItem: (itemId: string) => void;
    onDeleteContact: (contactId: string) => void;
    onToggleBlockContact: (contactId: string, isBlocked: boolean) => void;
    onAddContacts: (newContacts: Contact[]) => void;
    onEditContact: (contact: Contact) => void;
    onAddWinkUpdate: (winkId: string, updateTexts: string[]) => void;
    forums: Record<string, ForumMessage[]>;
    followedForums: string[];
    followedUsers: string[];
    onFollow: (type: 'forum' | 'user', id: string) => void;
    onUnfollow: (type: 'forum' | 'user', id: string) => void;
    onAddForumMessage: (forumId: string, message: ForumMessage) => void;
    scheduledNudges: ScheduledNudge[];
    onAddScheduledNudge: (nudge: Nudge, sendAt: Date, recurrence: ScheduledNudge['recurrence']) => void;
    onDeleteScheduledNudge: (id: string) => void;
}

const NavItem: React.FC<{
    icon: keyof typeof icons;
    label: Page | 'Logout' | 'Home' | 'Settings' | 'Contact Support' | 'Privacy Policy';
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3 rounded-lg text-md font-medium transition-colors w-full text-left interactive-scale ${
            isActive
                ? 'text-brand-primary-600 font-bold'
                : 'text-brand-text-secondary hover:bg-brand-secondary-100 hover:text-brand-text-primary'
        }`}
    >
        <Icon name={icon} className={`w-6 h-6 ${isActive ? 'text-brand-primary-500' : ''}`} />
        <span>{label}</span>
    </button>
);

const MobileNavItem: React.FC<{
    icon: keyof typeof icons;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors interactive-scale ${isActive ? 'text-brand-primary-600' : 'text-brand-text-secondary hover:text-brand-primary-500'}`}>
        <Icon name={icon} className="w-6 h-6" />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);


export const Dashboard: React.FC<DashboardProps> = ({
    currentPage, navigate, onLogout, inbox, outbox, communityWinks, communityExperiences, contacts,
    addWinkToOutbox, addNudgeToOutbox, notificationPermission, notificationSettings, updateNotificationSettings,
    isSubscribed, isSubscriptionLoading, onSubscribe, markItemAsRead,
    handleSendSecondOpinionRequests, handleSecondOpinionResponse,
    handleCommunityWinkReaction, addCommunityExperience, handleDeleteItem,
    onDeleteContact, onToggleBlockContact, onAddContacts, onEditContact, onAddWinkUpdate,
    forums, followedForums, followedUsers, onFollow, onUnfollow, onAddForumMessage,
    scheduledNudges, onAddScheduledNudge, onDeleteScheduledNudge,
}) => {
    const mainRef = useRef<HTMLElement>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [currentPage]);
    
    const renderContent = () => {
        switch(currentPage) {
            case 'Inbox':
                return <Inbox 
                    items={inbox} 
                    title="Inbox" 
                    onRead={markItemAsRead} 
                    onSendSecondOpinion={handleSendSecondOpinionRequests}
                    onRespondSecondOpinion={handleSecondOpinionResponse}
                    handleDeleteItem={handleDeleteItem}
                    contacts={contacts}
                    navigate={navigate}
                />;
            case 'Outbox':
                 return <Inbox 
                    items={outbox} 
                    title="Outbox" 
                    onSendSecondOpinion={handleSendSecondOpinionRequests}
                    onRespondSecondOpinion={handleSecondOpinionResponse}
                    handleDeleteItem={handleDeleteItem}
                    contacts={contacts}
                    navigate={navigate}
                />;
            case 'Community':
                return <CommunityFeed 
                    winks={communityWinks}
                    experiences={communityExperiences}
                    onReact={handleCommunityWinkReaction}
                    onAddExperience={addCommunityExperience}
                />;
            case 'Contacts':
                return <ContactsPage
                    contacts={contacts}
                    onDeleteContact={onDeleteContact}
                    onToggleBlockContact={onToggleBlockContact}
                    onAddContacts={onAddContacts}
                    onEditContact={onEditContact}
                    navigate={navigate}
                />;
            case 'Create Wink':
                return <WinkComposer 
                    onWinkSent={addWinkToOutbox} 
                    navigate={navigate} 
                    contacts={contacts}
                    onDeleteContact={onDeleteContact}
                    onToggleBlockContact={onToggleBlockContact}
                    onAddContacts={onAddContacts}
                    onEditContact={onEditContact}
                />;
            case 'Create Nudge':
                return <NudgeComposer 
                    onNudgeSent={addNudgeToOutbox} 
                    onAddScheduledNudge={onAddScheduledNudge}
                    navigate={navigate} 
                    contacts={contacts}
                    onDeleteContact={onDeleteContact}
                    onToggleBlockContact={onToggleBlockContact}
                    onAddContacts={onAddContacts}
                    onEditContact={onEditContact}
                />;
            case 'Self Check-in':
                return <SelfCheckin navigate={navigate} />;
            case 'Contact Support':
                return <ContactSupport navigate={navigate} />;
            case 'Gift Marketplace':
                return <GiftMarketplace navigate={navigate} />;
             case 'Wink Updates':
                return <WinkUpdates 
                    sentWinks={outbox.filter(item => item.type === 'Wink') as Wink[]} 
                    onAddUpdate={onAddWinkUpdate} 
                />;
            case 'Wink Social':
                return <WinkSocial 
                    navigate={navigate} 
                    forums={forums}
                    followedForums={followedForums}
                    followedUsers={followedUsers}
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                    onAddForumMessage={onAddForumMessage}
                />;
            case 'Privacy Policy':
                return <PrivacyPage navigate={navigate} />;
            case 'Dashboard':
            default:
                return (
                   <DashboardHome 
                        navigate={navigate}
                        inbox={inbox}
                        outbox={outbox}
                        communityWinks={communityWinks}
                        onOpenTutorial={() => setIsTutorialOpen(true)}
                        scheduledNudges={scheduledNudges}
                        onDeleteScheduledNudge={onDeleteScheduledNudge}
                   />
                );
        }
    };
    
    const isComposerPage = ['Create Wink', 'Create Nudge', 'Self Check-in', 'Contact Support', 'Gift Marketplace', 'Wink Updates', 'Wink Social', 'Contacts'].includes(currentPage);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-x-hidden">
            <aside className="w-full md:w-64 bg-white/60 backdrop-blur-lg md:border-r md:border-brand-secondary-200/80 p-5 flex-col justify-between hidden md:flex">
                <div>
                    <button onClick={() => navigate('Dashboard')} className="px-2 mb-12 interactive-scale" aria-label="Go to dashboard">
                      <Logo />
                    </button>
                    <nav className="flex flex-col gap-2">
                        <NavItem icon="home" label="Home" isActive={currentPage === 'Dashboard'} onClick={() => navigate('Dashboard')} />
                        <NavItem icon="inbox" label="Inbox" isActive={currentPage === 'Inbox'} onClick={() => navigate('Inbox')} />
                        <NavItem icon="send" label="Outbox" isActive={currentPage === 'Outbox'} onClick={() => navigate('Outbox')} />
                        <NavItem icon="users" label="Community" isActive={currentPage === 'Community'} onClick={() => navigate('Community')} />
                        <NavItem icon="contact" label="Contacts" isActive={currentPage === 'Contacts'} onClick={() => navigate('Contacts')} />
                    </nav>
                     <div className="mt-10 border-t border-brand-secondary-200 pt-6 space-y-3">
                         <button onClick={() => navigate('Create Wink')} className="w-full bg-gradient-to-br from-brand-primary-400 to-brand-accent-400 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 interactive-scale">
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                                <path d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d='M58 60 C 58 66, 68 66, 68 60' stroke='currentColor' strokeWidth='7' strokeLinecap="round" strokeLinejoin="round" fill='none'/>
                            </svg>
                            Drop a Wink
                        </button>
                        <button onClick={() => navigate('Create Nudge')} className="w-full bg-sky-100 text-sky-800 font-semibold px-4 py-3 rounded-xl shadow-md hover:bg-sky-200 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 interactive-scale">
                            <Icon name="heart" className="w-5 h-5 text-sky-600"/>
                            Send a Nudge
                        </button>
                        <button onClick={() => navigate('Wink Updates')} className="w-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 interactive-scale">
                            <Icon name="sparkles" className="w-5 h-5"/>
                            Wink Updates
                        </button>
                     </div>
                </div>
                <div className="mt-auto border-t border-brand-secondary-200 pt-4 space-y-2">
                     {notificationPermission === 'default' && !isSubscribed && (
                         <button
                            onClick={onSubscribe}
                            disabled={isSubscriptionLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-amber-900 font-bold bg-amber-400 hover:bg-amber-500 shadow-lg transition-all interactive-scale animate-pulse-soft"
                            style={{ animationDuration: '3s' }}
                         >
                            <Icon name="bell" className="w-6 h-6"/>
                            <span>Enable Alerts</span>
                        </button>
                    )}
                    
                    {notificationPermission !== 'default' && (
                        <NotificationBell
                            permission={notificationPermission}
                            isSubscribed={isSubscribed}
                            onSubscribe={onSubscribe}
                            disabled={isSubscriptionLoading}
                        />
                    )}
                    
                    {notificationPermission === 'granted' && (
                        <NavItem icon="settings" label="Settings" isActive={false} onClick={() => setIsSettingsModalOpen(true)} />
                    )}
                    
                    <NavItem icon="helpCircle" label="Contact Support" isActive={currentPage === 'Contact Support'} onClick={() => navigate('Contact Support')} />
                    <NavItem icon="shieldCheck" label="Privacy Policy" isActive={currentPage === 'Privacy Policy'} onClick={() => navigate('Privacy Policy')} />
                    <NavItem icon="logout" label="Logout" isActive={false} onClick={onLogout} />
                </div>
            </aside>
            <main ref={mainRef} className={`flex-1 md:pb-0 ${isComposerPage ? '' : 'overflow-y-auto pb-28 themed-scrollbar'}`}>
                <div key={currentPage} className={`animate-fade-in-up ${isComposerPage ? 'h-full' : ''}`}>
                    {renderContent()}
                </div>
            </main>
             {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 h-20 bg-white/80 backdrop-blur-md border border-brand-secondary-200/50 flex justify-around items-center z-50 shadow-2xl rounded-2xl">
                <MobileNavItem icon="home" label="Home" isActive={currentPage === 'Dashboard'} onClick={() => navigate('Dashboard')} />
                <MobileNavItem icon="inbox" label="Inbox" isActive={currentPage === 'Inbox'} onClick={() => navigate('Inbox')} />
                <button onClick={() => navigate('Create Wink')} className="p-4 bg-gradient-to-br from-brand-primary-500 to-brand-accent-400 rounded-full text-white shadow-lg transform hover:scale-110 transition-transform interactive-scale" aria-label="Create Wink">
                    <Icon name="plusCircle" className="w-8 h-8"/>
                </button>
                <MobileNavItem icon="users" label="Community" isActive={currentPage === 'Community'} onClick={() => navigate('Community')} />
                <MobileNavItem icon="contact" label="Contacts" isActive={currentPage === 'Contacts'} onClick={() => navigate('Contacts')} />
            </div>

            <NotificationSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                settings={notificationSettings}
                onSettingsChange={updateNotificationSettings}
            />
             <AppTutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
        </div>
    );
};