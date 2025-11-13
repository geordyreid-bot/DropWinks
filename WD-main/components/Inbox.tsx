import React, { useState, useRef, useEffect } from 'react';
import { InboxItem, Wink, Nudge, SecondOpinionRequest, Contact, Page } from '../types';
import { Icon } from './ui/Icon';
import { WinkDetailView } from './WinkDetailView';
import { SecondOpinionRequestView } from './SecondOpinionRequestView';
import { Modal } from './ui/Modal';
import { Timestamp } from 'firebase/firestore';

interface InboxProps {
    items: InboxItem[];
    title: 'Inbox' | 'Outbox';
    contacts: Contact[];
    onRead?: (itemId: string) => void;
    onSendSecondOpinion: (winkId: string, contacts: Contact[]) => void;
    onRespondSecondOpinion: (requestId: string, winkId: string, response: 'agree' | 'disagree') => void;
    handleDeleteItem: (itemId: string) => void;
    navigate: (page: Page) => void;
}

const formatDisplayDate = (date: Timestamp): string => {
    const jsDate = date.toDate();
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - jsDate.getTime()) / 1000);
    
    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)}h ago`;
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
    
    const diffDays = Math.round((today.getTime() - itemDate.getTime()) / 86400000);

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return jsDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


const ItemCard: React.FC<{ 
    item: InboxItem; 
    contacts: Contact[];
    onRead?: (itemId: string) => void; 
    onSendSecondOpinion: (winkId: string, contacts: Contact[]) => void;
    onRespondSecondOpinion: (requestId: string, winkId: string, response: 'agree' | 'disagree') => void;
    title: string; 
    handleDeleteItem: (itemId: string) => void;
    navigate: (page: Page) => void;
}> = ({ item, contacts, onRead, onSendSecondOpinion, onRespondSecondOpinion, title, handleDeleteItem, navigate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded && cardRef.current) {
            // Use nearest to avoid scrolling if the item is already fully visible.
            cardRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }, [isExpanded]);
    
    const isClickable = item.type === 'Wink' || item.type === 'SecondOpinionRequest';

    const getCardContent = () => {
        switch (item.type) {
            case 'Wink':
                return { 
                    icon: 'eye' as const, 
                    bgColor: 'bg-brand-primary-100', 
                    textColor: 'text-brand-primary-600',
                    titleText: `A Wink for ${item.recipient}`,
                    subtitle: `Concerns about: ${item.observables.length} observation(s)`
                };
            case 'Nudge':
                 return { 
                    icon: 'heart' as const, 
                    bgColor: 'bg-brand-secondary-100', 
                    textColor: 'text-brand-secondary-600',
                    titleText: `A Nudge for ${item.recipient}`,
                    subtitle: item.message
                };
            case 'SecondOpinionRequest':
                 return { 
                    icon: 'share' as const, 
                    bgColor: 'bg-amber-100', 
                    textColor: 'text-amber-600',
                    titleText: `Opinion Request`,
                    subtitle: `Feedback requested for ${item.originalRecipientName}`
                };
        }
    };

    const confirmDeletion = () => {
        handleDeleteItem(item.id);
        setIsDeleteModalOpen(false);
    };

    const deleteModal = (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" size="sm">
            <div>
                <p className="text-brand-text-secondary mb-4">
                    Are you sure you want to delete this {item.type}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-4 py-2 text-sm font-semibold bg-brand-surface text-brand-text-secondary border border-brand-secondary-200 rounded-lg hover:bg-brand-secondary-100 interactive-scale"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDeletion}
                        className="px-4 py-2 text-sm font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center gap-2 interactive-scale"
                    >
                        <Icon name="trash" className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
    
    const cardContent = getCardContent();
    
    if (isExpanded) {
        return (
            <div ref={cardRef} className="bg-brand-surface p-4 sm:p-6 rounded-2xl shadow-xl border border-brand-secondary-200/50 animate-fade-in-up">
                {deleteModal}
                <div className="relative mb-8">
                    <button onClick={() => setIsExpanded(false)} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-secondary-100 transition-colors">
                        <Icon name="chevronLeft" className="w-6 h-6 text-brand-text-secondary" />
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-center text-brand-text-primary">{cardContent.titleText}</h2>
                </div>
                {item.type === 'Wink' && <WinkDetailView wink={item} isOutbox={title === 'Outbox'} onSendSecondOpinion={onSendSecondOpinion} contacts={contacts} navigate={navigate} />}
                {item.type === 'SecondOpinionRequest' && <SecondOpinionRequestView request={item} onResponse={onRespondSecondOpinion} />}
                <div className="mt-8 pt-6 border-t border-dashed border-brand-secondary-300">
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 py-2.5 px-4 rounded-lg transition-colors interactive-scale"
                    >
                        <Icon name="trash" className="w-4 h-4" />
                        Delete this {item.type}
                    </button>
                </div>
            </div>
        );
    }
    
    const handleClick = () => {
        if (isClickable) {
            if (title === 'Inbox') {
              onRead?.(item.id);
            }
            setIsExpanded(true);
        }
    };

    return (
        <div 
            ref={cardRef}
            onClick={handleClick}
            className={`bg-brand-surface p-5 sm:p-6 rounded-2xl shadow-lg border border-brand-secondary-200/30 flex items-start gap-4 transition-all duration-300 relative ${isClickable ? 'cursor-pointer hover:shadow-xl hover:border-brand-primary-300 transform hover:-translate-y-1 interactive-scale' : ''}`}
        >
            {deleteModal}
            {!item.isRead && title === 'Inbox' && <div className="w-2.5 h-2.5 bg-brand-primary-500 rounded-full mt-2.5 flex-shrink-0 animate-pulse"></div>}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${cardContent.bgColor} ${cardContent.textColor}`}>
                <Icon name={cardContent.icon} className="w-6 h-6" />
            </div>
            <div className="flex-grow min-w-0 pr-8">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                        <h3 className="font-bold text-brand-text-primary text-lg truncate">{cardContent.titleText}</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 truncate">{cardContent.subtitle}</p>
                    </div>
                    <p className="text-sm text-brand-text-secondary/80 flex-shrink-0 pt-1 font-medium">{formatDisplayDate(item.timestamp)}</p>
                </div>
            </div>
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                }}
                className="absolute top-3 right-3 p-2 rounded-full text-brand-secondary-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                aria-label={`Delete ${item.type}`}
            >
                <Icon name="trash" className="w-4 h-4" />
            </button>
        </div>
    );
}

export const Inbox: React.FC<InboxProps> = ({ items, title, contacts, onRead, onSendSecondOpinion, onRespondSecondOpinion, handleDeleteItem, navigate }) => {
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    const sortedItems = [...items].sort((a, b) => {
        const timeA = a.timestamp.toMillis();
        const timeB = b.timestamp.toMillis();
        if (sortOrder === 'newest') {
            return timeB - timeA;
        } else {
            return timeA - timeB;
        }
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-brand-text-primary">{title}</h1>
                {items.length > 1 && (
                    <button 
                        onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                        className="text-sm font-semibold text-brand-text-secondary hover:text-brand-text-primary bg-brand-surface px-4 py-2 rounded-lg border border-brand-secondary-200 shadow-sm interactive-scale"
                    >
                        Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                    </button>
                )}
            </div>
            {sortedItems.length > 0 ? (
                <div className="space-y-5">
                    {sortedItems.map((item, index) => 
                        <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                             <ItemCard 
                                item={item} 
                                contacts={contacts}
                                onRead={onRead} 
                                onSendSecondOpinion={onSendSecondOpinion}
                                onRespondSecondOpinion={onRespondSecondOpinion}
                                title={title} 
                                handleDeleteItem={handleDeleteItem}
                                navigate={navigate}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-brand-surface rounded-2xl border border-brand-secondary-200 shadow-lg">
                    <Icon name="inbox" className="w-16 h-16 text-brand-secondary-300 mx-auto" />
                    <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">It's quiet in here</h2>
                    <p className="text-brand-text-secondary mt-2">You have no items in your {title.toLowerCase()}.</p>
                </div>
            )}
        </div>
    );
};
