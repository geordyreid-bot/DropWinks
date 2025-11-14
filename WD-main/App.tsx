

import React, { useState, useCallback, useEffect } from 'react';
import { LandingPage } from './components/pages/LandingPage';
import { Dashboard } from './components/pages/Dashboard';
import { Wink, Nudge, Page, InboxItem, Contact, ReactionType, CommunityExperience, SecondOpinionRequest, NotificationSettings, ForumMessage, ScheduledNudge } from './types';
import { MOCK_INBOX, MOCK_OUTBOX, MOCK_COMMUNITY_WINKS, MOCK_COMMUNITY_EXPERIENCES, MOCK_CONTACTS, findObservableById, MOCK_FORUMS } from './constants';
import { TermsGate } from './components/ui/TermsGate';
import { OnboardingFlow } from './components/OnboardingFlow';
import { auth } from './firebase';
// Fix: Use firebase/compat/app for imports and types.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const VAPID_PUBLIC_KEY = 'BNo5Y_DoHi83Yd_AOR_nS52LSCzC2aYJ9YQIh2sS6Ca5X_VPYoqRfrk1d2cbj2wHWZWpDTCpBcegCZnSHfDi3mU';
const ICON_DATA_URL = 'data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10ZM58 60C58 66 68 66 68 60Z\' fill=\'%23000000\'/%3E%3C/svg%3E';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    newWink: true,
    newNudge: true,
    secondOpinionRequest: true,
    communityReaction: true,
    winkUpdate: true,
    newForumMessage: true,
};

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const App: React.FC = () => {
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
        return typeof window !== 'undefined' && window.localStorage.getItem('winkdrops_terms_accepted') === 'true';
    });
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
        return typeof window !== 'undefined' && window.localStorage.getItem('winkdrops_onboarding_completed') === 'true';
    });
    // Fix: Use firebase.User type from compat library.
    const [user, setUser] = useState<firebase.User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
    const [inbox, setInbox] = useState<InboxItem[]>(MOCK_INBOX);
    const [outbox, setOutbox] = useState<InboxItem[]>(MOCK_OUTBOX);
    const [communityWinks, setCommunityWinks] = useState<Wink[]>(MOCK_COMMUNITY_WINKS);
    const [communityExperiences, setCommunityExperiences] = useState<CommunityExperience[]>(MOCK_COMMUNITY_EXPERIENCES);
    const [forums, setForums] = useState<Record<string, ForumMessage[]>>(MOCK_FORUMS);
    
    // Note on "Best Practices": This app uses localStorage for simplicity and to maintain user privacy
    // as outlined in the Privacy Policy (no data is sent to a server).
    // For features like cross-device sync, a cloud database like Firestore would be the next step.
    // The app is already configured with `enableFirebase: true` in metadata.json to facilitate this.
    const [contacts, setContacts] = useState<Contact[]>(() => {
        if (typeof window === 'undefined') {
            return MOCK_CONTACTS;
        }
        try {
            const savedContacts = window.localStorage.getItem('winkdrops_contacts');
            return savedContacts ? JSON.parse(savedContacts) : MOCK_CONTACTS;
        } catch (error) {
            console.error('Error parsing contacts from localStorage', error);
            return MOCK_CONTACTS;
        }
    });

    const [followedForums, setFollowedForums] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = window.localStorage.getItem('winkdrops_followed_forums');
        return saved ? JSON.parse(saved) : [];
    });

    const [followedUsers, setFollowedUsers] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = window.localStorage.getItem('winkdrops_followed_users');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [scheduledNudges, setScheduledNudges] = useState<ScheduledNudge[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = window.localStorage.getItem('winkdrops_scheduled_nudges');
        // We need to convert ISO strings back to Timestamp-like objects for consistency
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((sn: any) => ({
                ...sn,
                // Fix: Use firebase.firestore.Timestamp from compat library.
                sendAt: firebase.firestore.Timestamp.fromDate(new Date(sn.sendAt)),
            }));
        }
        return [];
    });

    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
        if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
        const savedSettings = window.localStorage.getItem('winkdrops_notification_settings');
        return savedSettings ? JSON.parse(savedSettings) : DEFAULT_NOTIFICATION_SETTINGS;
    });

    useEffect(() => {
        // Fix: Use compat syntax for onAuthStateChanged.
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('winkdrops_contacts', JSON.stringify(contacts));
        }
    }, [contacts]);

     useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('winkdrops_followed_forums', JSON.stringify(followedForums));
        }
    }, [followedForums]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('winkdrops_followed_users', JSON.stringify(followedUsers));
        }
    }, [followedUsers]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Convert Timestamp to ISO string for JSON serialization
            const serializableNudges = scheduledNudges.map(sn => ({
                ...sn,
                sendAt: sn.sendAt.toDate().toISOString(),
            }));
            window.localStorage.setItem('winkdrops_scheduled_nudges', JSON.stringify(serializableNudges));
        }
    }, [scheduledNudges]);


    const updateNotificationSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        setNotificationSettings(prev => {
            const updated = { ...prev, ...newSettings };
            window.localStorage.setItem('winkdrops_notification_settings', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const showLocalNotification = useCallback((title: string, body: string, type: keyof NotificationSettings) => {
        if (!notificationSettings[type]) {
            console.log(`Notification of type "${type}" is disabled by user settings.`);
            return;
        }

        if ('serviceWorker' in navigator && notificationPermission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body,
                    icon: ICON_DATA_URL,
                    badge: ICON_DATA_URL
                });
            });
        }
    }, [notificationPermission, notificationSettings]);
    
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);


    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            setIsSubscriptionLoading(false);
            return;
        }

        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(sub => {
                if (sub) {
                    setIsSubscribed(true);
                } else {
                    setIsSubscribed(false);
                }
                setIsSubscriptionLoading(false);
            });
        });
    }, []);

    const handleNotificationSubscribe = useCallback(async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }

        if (notificationPermission === 'denied') {
            alert('Notification permission has been blocked in your browser settings. Please enable it to receive notifications.');
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
            setIsSubscriptionLoading(true);
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
                console.log('User is subscribed:', subscription);
                // In a real app, you would send this subscription object to your server.
                setIsSubscribed(true);
            } catch (err) {
                console.error('Failed to subscribe the user: ', err);
                setIsSubscribed(false);
            } finally {
                setIsSubscriptionLoading(false);
            }
        }
    }, [notificationPermission]);

    const addWinkToOutbox = useCallback((wink: Omit<Wink, 'id' | 'timestamp'>) => {
        // Fix: Use firebase.firestore.Timestamp from compat library.
        const newWink = { ...wink, id: `wink-${Date.now()}`, timestamp: firebase.firestore.Timestamp.now() };
        setOutbox(prev => [newWink, ...prev]);
        showLocalNotification(
            `A new Wink for ${wink.recipient} is ready.`,
            "Click here to view it in your outbox or add it to your home screen."
        , 'newWink');
    }, [showLocalNotification]);

    const addNudgeToOutbox = useCallback((nudge: Omit<Nudge, 'id' | 'timestamp'>) => {
        // Fix: Use firebase.firestore.Timestamp from compat library.
        const newNudge = { ...nudge, id: `nudge-${Date.now()}`, timestamp: firebase.firestore.Timestamp.now() };
        setOutbox(prev => [newNudge, ...prev]);
        showLocalNotification(
            `A new Nudge for ${nudge.recipient} has been sent.`,
            "Click to view or add WinkDrops to your home screen for easier access."
        , 'newNudge');
    }, [showLocalNotification]);
    
    // Nudge Scheduling Logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            let hasChanged = false;

            const updatedNudges = scheduledNudges.flatMap(sn => {
                const sendAt = sn.sendAt.toDate();
                if (sendAt <= now) {
                    hasChanged = true;
                    // Pass the base nudge object, not the full scheduled nudge
                    addNudgeToOutbox(sn.nudge);

                    if (sn.recurrence === 'none') {
                        return []; // Remove from list
                    } else {
                        const nextSendAt = new Date(sendAt);
                        switch(sn.recurrence) {
                            case 'daily': nextSendAt.setDate(nextSendAt.getDate() + 1); break;
                            case 'weekly': nextSendAt.setDate(nextSendAt.getDate() + 7); break;
                            case 'monthly': nextSendAt.setMonth(nextSendAt.getMonth() + 1); break;
                        }
                        // Fix: Use firebase.firestore.Timestamp from compat library.
                        return [{ ...sn, sendAt: firebase.firestore.Timestamp.fromDate(nextSendAt) }];
                    }
                }
                return [sn]; // Keep in list
            });

            if (hasChanged) {
                setScheduledNudges(updatedNudges);
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [scheduledNudges, addNudgeToOutbox]);


    const addScheduledNudge = useCallback((nudge: Omit<Nudge, 'id' | 'timestamp'>, sendAt: Date, recurrence: ScheduledNudge['recurrence']) => {
        const newScheduledNudge: ScheduledNudge = {
            id: `sched-${Date.now()}`,
            // Fix: Use firebase.firestore.Timestamp from compat library.
            nudge: { ...nudge, id: `nudge-sched-${Date.now()}`, timestamp: firebase.firestore.Timestamp.fromDate(sendAt) },
            sendAt: firebase.firestore.Timestamp.fromDate(sendAt),
            recurrence,
        };
        setScheduledNudges(prev => [...prev, newScheduledNudge]);
        showLocalNotification('Nudge Scheduled!', `Your nudge for ${nudge.recipient} will be sent on ${sendAt.toLocaleDateString()}.`, 'newNudge');
    }, [showLocalNotification]);

    const deleteScheduledNudge = useCallback((id: string) => {
        setScheduledNudges(prev => prev.filter(sn => sn.id !== id));
    }, []);

    const handleCommunityWinkReaction = useCallback((winkId: string, reactionType: ReactionType) => {
        const outboxWink = outbox.find(item => item.id === winkId);
        
        setCommunityWinks(winks => winks.map(wink => {
            if (wink.id === winkId) {
                // If this community wink matches one in our outbox, simulate the original sender getting a notification.
                if (outboxWink && outboxWink.type === 'Wink') {
                    showLocalNotification('Your Wink was seen!', `Someone reacted to your Wink for ${outboxWink.recipient}.`, 'communityReaction');
                }
                const newReactions = { ...(wink.reactions || {}) };
                newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
                return { ...wink, reactions: newReactions };
            }
            return wink;
        }));
    }, [showLocalNotification, outbox]);

    const addCommunityExperience = useCallback((experience: Omit<CommunityExperience, 'id'| 'timestamp'>) => {
        // Fix: Use firebase.firestore.Timestamp from compat library.
        const newExperience = { ...experience, id: `exp-${Date.now()}`, timestamp: firebase.firestore.Timestamp.now() };
        setCommunityExperiences(prev => [newExperience, ...prev]);
    }, []);

    const markItemAsRead = useCallback((itemId: string) => {
        const markAsRead = (items: InboxItem[]) => items.map(item => item.id === itemId ? { ...item, isRead: true } : item);
        setInbox(prev => markAsRead(prev));
        setOutbox(prev => markAsRead(prev));
    }, []);

    const handleDeleteItem = useCallback((itemId: string) => {
        setInbox(prev => prev.filter(item => item.id !== itemId));
        setOutbox(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const handleDeleteContact = useCallback((contactId: string) => {
        setContacts(prev => prev.filter(c => c.id !== contactId));
    }, []);

    const handleToggleBlockContact = useCallback((contactId: string, isBlocked: boolean) => {
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isBlocked } : c));
    }, []);

    const handleAddContacts = useCallback((newContacts: Omit<Contact, 'id'>[]) => {
        setContacts(prevContacts => {
            const existingContacts = new Set(prevContacts.map(c => `${c.name}-${c.handle}`));
            const uniqueNewContacts = newContacts
                .filter(nc => !existingContacts.has(`${nc.name}-${nc.handle}`))
                .map((nc, index) => ({ ...nc, id: `contact-${Date.now()}-${index}` }));
            return [...prevContacts, ...uniqueNewContacts];
        });
    }, []);

    const handleEditContact = useCallback((updatedContact: Contact) => {
        setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    }, []);

    /**
     * A centralized helper to apply updates to a Wink, whether it's in the inbox or outbox.
     * @param winkId The ID of the Wink to update.
     * @param updateFn A function that takes the current Wink and returns the updated Wink.
     */
    const updateWinkInCollections = useCallback((
        winkId: string,
        updateFn: (wink: Wink) => Wink
    ) => {
        const applyUpdate = (items: InboxItem[]) =>
            items.map(item => {
                if (item.id === winkId && item.type === 'Wink') {
                    return updateFn(item as Wink);
                }
                return item;
            });
    
        setInbox(prev => applyUpdate(prev));
        setOutbox(prev => applyUpdate(prev));
    }, []);

    const handleSendSecondOpinionRequests = useCallback((winkId: string, contacts: Contact[]) => {
        const wink = [...inbox, ...outbox].find(item => item.id === winkId && item.type === 'Wink') as Wink | undefined;
    
        if (!wink) return;
    
        const requests: SecondOpinionRequest[] = contacts.map(contact => ({
            id: `sor-${winkId}-${contact.id}-${Date.now()}`,
            type: 'SecondOpinionRequest',
            winkId: wink!.id,
            originalRecipientName: wink!.recipient,
            winkObservables: wink!.observables,
            // Fix: Use firebase.firestore.Timestamp from compat library.
            timestamp: firebase.firestore.Timestamp.now(),
            isRead: false,
        }));
        
        setInbox(prev => [...requests, ...prev]);
        
        updateWinkInCollections(winkId, (currentWink) => ({
            ...currentWink,
            secondOpinion: {
                agreements: currentWink.secondOpinion?.agreements || 0,
                disagreements: currentWink.secondOpinion?.disagreements || 0,
                totalRequests: (currentWink.secondOpinion?.totalRequests || 0) + contacts.length,
                respondedIds: currentWink.secondOpinion?.respondedIds || []
            }
        }));

        showLocalNotification('New Second Opinion Request', `Your opinion is requested for a Wink about ${wink.recipient}.`, 'secondOpinionRequest');
    }, [inbox, outbox, showLocalNotification, updateWinkInCollections]);

    const handleSecondOpinionResponse = useCallback((requestId: string, winkId: string, response: 'agree' | 'disagree') => {
        markItemAsRead(requestId);

        updateWinkInCollections(winkId, (currentWink) => {
            const so = currentWink.secondOpinion;
            if (so && !so.respondedIds.includes(requestId)) {
                return {
                    ...currentWink,
                    secondOpinion: {
                        ...so,
                        agreements: so.agreements + (response === 'agree' ? 1 : 0),
                        disagreements: so.disagreements + (response === 'disagree' ? 1 : 0),
                        respondedIds: [...so.respondedIds, requestId],
                    }
                };
            }
            return currentWink;
        });
    }, [markItemAsRead, updateWinkInCollections]);
    
    const handleAddWinkUpdate = useCallback((winkId: string, updateTexts: string[]) => {
        let recipientName = 'Unknown';
        setOutbox(prev => prev.map(item => {
            if (item.id === winkId && item.type === 'Wink') {
                recipientName = item.recipient;
                // Fix: Use firebase.firestore.Timestamp from compat library.
                const newUpdates = updateTexts.map(text => ({ text, timestamp: firebase.firestore.Timestamp.now() }));
                const existingUpdates = item.updates || [];
                return {
                    ...item,
                    updates: [...existingUpdates, ...newUpdates]
                };
            }
            return item;
        }));
        showLocalNotification(
            'Positive Update Received',
            `Someone has noticed positive changes regarding a past Wink for ${recipientName}.`,
            'winkUpdate'
        );
    }, [showLocalNotification]);

    // Forum and Follower logic
    const handleFollow = useCallback((type: 'forum' | 'user', id: string) => {
        if (type === 'forum') {
            setFollowedForums(prev => [...new Set([...prev, id])]);
        } else {
            setFollowedUsers(prev => [...new Set([...prev, id])]);
        }
    }, []);

    const handleUnfollow = useCallback((type: 'forum' | 'user', id: string) => {
        if (type === 'forum') {
            setFollowedForums(prev => prev.filter(item => item !== id));
        } else {
            setFollowedUsers(prev => prev.filter(item => item !== id));
        }
    }, []);

    const handleAddForumMessage = useCallback((forumId: string, message: Omit<ForumMessage, 'id' | 'timestamp'>) => {
        // Fix: Use firebase.firestore.Timestamp from compat library.
        const newMessage = { ...message, id: `msg-${Date.now()}`, timestamp: firebase.firestore.Timestamp.now() };
        setForums(prev => ({
            ...prev,
            [forumId]: [...(prev[forumId] || []), newMessage]
        }));
        
        // Simulate notifications
        if (followedForums.includes(forumId)) {
            showLocalNotification('New Forum Message', `Someone posted in the "${forumId}" forum.`, 'newForumMessage');
        }
        if (followedUsers.includes(message.userId)) {
             showLocalNotification('New Post by Followed User', `${message.userName} posted in the "${forumId}" forum.`, 'newForumMessage');
        }

    }, [followedForums, followedUsers, showLocalNotification]);


    const handleAcceptTerms = () => {
        window.localStorage.setItem('winkdrops_terms_accepted', 'true');
        setHasAcceptedTerms(true);
    };

    const handleCompleteOnboarding = () => {
        window.localStorage.setItem('winkdrops_onboarding_completed', 'true');
        setHasCompletedOnboarding(true);
    };
    
    const handleLogout = () => {
        // Fix: Use compat syntax for signOut.
        auth.signOut().catch(error => console.error('Logout Error:', error));
    };

    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-brand-bg">
                <div className="w-12 h-12 border-4 border-brand-primary-300 border-t-brand-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (!user) {
        return <LandingPage />;
    }
    
    if (!hasAcceptedTerms) {
        return <TermsGate onAccept={handleAcceptTerms} />;
    }

    if (!hasCompletedOnboarding) {
        return <OnboardingFlow onComplete={handleCompleteOnboarding} />;
    }

    return (
        <Dashboard
            currentPage={currentPage}
            navigate={setCurrentPage}
            onLogout={handleLogout}
            inbox={inbox}
            outbox={outbox}
            communityWinks={communityWinks}
            communityExperiences={communityExperiences}
            contacts={contacts}
            addWinkToOutbox={addWinkToOutbox}
            addNudgeToOutbox={addNudgeToOutbox}
            handleCommunityWinkReaction={handleCommunityWinkReaction}
            addCommunityExperience={addCommunityExperience}
            notificationPermission={notificationPermission}
            notificationSettings={notificationSettings}
            updateNotificationSettings={updateNotificationSettings}
            isSubscribed={isSubscribed}
            isSubscriptionLoading={isSubscriptionLoading}
            onSubscribe={handleNotificationSubscribe}
            markItemAsRead={markItemAsRead}
            handleSendSecondOpinionRequests={handleSendSecondOpinionRequests}
            handleSecondOpinionResponse={handleSecondOpinionResponse}
            handleDeleteItem={handleDeleteItem}
            onDeleteContact={handleDeleteContact}
            onToggleBlockContact={handleToggleBlockContact}
            onAddContacts={handleAddContacts}
            onEditContact={handleEditContact}
            onAddWinkUpdate={handleAddWinkUpdate}
            forums={forums}
            followedForums={followedForums}
            followedUsers={followedUsers}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onAddForumMessage={handleAddForumMessage}
            scheduledNudges={scheduledNudges}
            onAddScheduledNudge={addScheduledNudge}
            onDeleteScheduledNudge={deleteScheduledNudge}
        />
    );
};