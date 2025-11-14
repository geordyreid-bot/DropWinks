import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
    Inbox as InboxIcon, Send, Users, Activity, LogOut, ArrowRight, UserPlus, Eye, Heart, Brain, Apple, Droplets, Check, Loader2, AlertTriangle, ChevronLeft, X, Twitter, Instagram, Smartphone, Ghost, Search, ClipboardCheck, ChevronDown, SendHorizontal, Quote, Home, Link, PlusCircle, Bell, BellOff, Share2, ChevronRight, ThumbsUp, ThumbsDown, ShieldCheck, Settings, Trash2, Ban, Sparkles, ChevronUp, Gift, Music4, HelpCircle, Contact as ContactIcon, Mail, Pencil, Feather, LogIn, Star
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';


// --- START: WD-main/constants.ts ---
const CATEGORIES = ['Physical', 'Mental', 'Nutritional', 'Hygiene', 'Social', 'Behavioral'];

const REACTIONS = [
    { id: 'support', text: 'Sending support', icon: 'heart' },
    { id: 'thinking', text: 'Thinking of you', icon: 'brain' },
    { id: 'seen', text: 'You are seen', icon: 'eye' },
];

const COUNTRY_CODES = [
    { code: '+1', name: 'USA/CAN' },
    { code: '+7', name: 'Russia' },
    { code: '+20', name: 'Egypt' },
    { code: '+27', name: 'South Africa' },
    { code: '+33', name: 'France' },
    { code: '+34', name: 'Spain' },
    { code: '+39', name: 'Italy' },
    { code: '+44', name: 'UK' },
    { code: '+49', name: 'Germany' },
    { code: '+52', name: 'Mexico' },
    { code: '+55', name: 'Brazil' },
    { code: '+61', name: 'Australia' },
    { code: '+81', name: 'Japan' },
    { code: '+86', name: 'China' },
    { code: '+91', name: 'India' },
].sort((a, b) => a.name.localeCompare(b.name));

const OBSERVABLES = [
    // Physical
    { id: 'p1', text: 'Looks unusually tired or fatigued', category: 'Physical', keywords: ['sleepy', 'exhausted', 'drained', 'lethargic', 'low energy', 'weary'] },
    { id: 'p2', text: 'Complaining of frequent headaches or migraines', category: 'Physical', keywords: ['head', 'pain', 'sore', 'migraine', 'head hurting'] },
    { id: 'p3', text: 'Noticeable weight loss or gain', category: 'Physical', keywords: ['thin', 'heavy', 'eating', 'diet', 'clothes fit', 'body change'] },
    { id: 'p4', text: 'Persistent cough or cold symptoms', category: 'Physical', keywords: ['sick', 'ill', 'coughing', 'sneezing', 'sniffles', 'under the weather'] },
    { id: 'p5', text: 'Skin issues (acne, rashes, paleness)', category: 'Physical', keywords: ['pale', 'pimples', 'itchy', 'complexion', 'breakout', 'hives'] },
    { id: 'p6', text: 'Changes in sleep patterns (insomnia or oversleeping)', category: 'Physical', keywords: ['can\'t sleep', 'sleeping too much', 'insomniac', 'nightmares', 'restless'] },
    { id: 'p7', text: 'Complaining of muscle aches or joint pain', category: 'Physical', keywords: ['sore', 'stiff', 'body pain', 'achy', 'arthritis'] },
    { id: 'p8', text: 'Shaking or trembling', category: 'Physical', keywords: ['shaky', 'tremors', 'jittery', 'unsteady hands'] },
    { id: 'p9', text: 'Digestive issues (stomach pain, nausea)', category: 'Physical', keywords: ['stomachache', 'sick to stomach', 'vomiting', 'guts', 'indigestion'] },
    { id: 'p10', text: 'Seems to have less energy than usual', category: 'Physical', keywords: ['lethargic', 'drained', 'slow', 'unmotivated', 'no drive'] },
    { id: 'p11', text: 'Neglecting physical injuries', category: 'Physical', keywords: ['cut', 'bruise', 'sprain', 'not taking care', 'untreated wound'] },
    { id: 'p12', text: 'Dizziness or lightheadedness', category: 'Physical', keywords: ['faint', 'woozy', 'unsteady', 'vertigo'] },
    { id: 'p13', text: 'Unexplained bruises or marks', category: 'Physical', keywords: ['black and blue', 'scratches', 'injury', 'marks on body'] },
    { id: 'p14', text: 'Clenched jaw or grinding teeth', category: 'Physical', keywords: ['bruxism', 'tense', 'stressed', 'sore jaw'] },
    { id: 'p15', text: 'Changes in coordination or balance', category: 'Physical', keywords: ['clumsy', 'unsteady', 'tripping', 'falling'] },
    { id: 'p16', text: 'Glassy or bloodshot eyes', category: 'Physical', keywords: ['red eyes', 'stoned', 'high', 'crying', 'glazed over'] },
    { id: 'p17', text: 'Frequent complaints of feeling unwell without specific cause', category: 'Physical', keywords: ['always sick', 'malaise', 'vague illness', 'feeling off'] },
    { id: 'p18', text: 'Slurred speech or difficulty speaking', category: 'Physical', keywords: ['mumbling', 'incoherent', 'trouble talking'] },
    { id: 'p19', text: 'Noticeable change in posture (e.g., hunched over)', category: 'Physical', keywords: ['slumped', 'stooped', 'bad posture', 'hunching'] },
    { id: 'p20', text: 'Appears restless or fidgety', category: 'Physical', keywords: ['can\'t sit still', 'fidgeting', 'agitated', 'antsy', 'pacing'] },
    { id: 'p21', text: 'Dark circles under eyes', category: 'Physical', keywords: ['bags under eyes', 'not sleeping', 'exhausted look', 'raccoon eyes'] },
    { id: 'p22', text: 'Frequent sighing or yawning', category: 'Physical', keywords: ['exasperated', 'bored', 'tired sigh', 'breath'] },


    // Mental
    { id: 'm1', text: 'Seems more withdrawn or isolated', category: 'Mental', keywords: ['lonely', 'distant', 'alone', 'hiding', 'shut in'] },
    { id: 'm2', text: 'Expresses feelings of hopelessness or worthlessness', category: 'Mental', keywords: ['no future', 'I suck', 'pointless', 'useless', 'despair'] },
    { id: 'm3', text: 'Appears unusually anxious, worried, or on-edge', category: 'Mental', keywords: ['stress', 'scared', 'panicked', 'nervous', 'anxiety'] },
    { id: 'm4', text: 'Irritable, agitated, or has frequent mood swings', category: 'Mental', keywords: ['angry', 'snapping', 'moody', 'short temper', 'volatile'] },
    { id: 'm5', text: 'Lost interest in hobbies or activities they once enjoyed', category: 'Mental', keywords: ['anhedonia', 'not fun anymore', 'bored', 'apathetic'] },
    { id: 'm6', text: 'Difficulty concentrating or making decisions', category: 'Mental', keywords: ['can\'t focus', 'indecisive', 'scattered', 'brain fog'] },
    { id: 'm7', text: 'Seems unusually forgetful or confused', category: 'Mental', keywords: ['memory loss', 'disoriented', 'absent-minded'] },
    { id: 'm8', text: 'Expresses excessive guilt or self-blame', category: 'Mental', keywords: ['my fault', 'ashamed', 'regret', 'self-critical'] },
    { id: 'm9', text: 'Talks about death or suicide', category: 'Mental', keywords: ['not wanting to be here', 'ending it', 'dying', 'suicidal ideation'] },
    { id: 'm10', text: 'Seems detached from reality or paranoid', category: 'Mental', keywords: ['delusional', 'suspicious', 'not making sense', 'paranoia'] },
    { id: 'm11', text: 'Appears emotionally numb or flat', category: 'Mental', keywords: ['empty', 'no feelings', 'blank', 'monotone', 'emotionless'] },
    { id: 'm12', text: 'Frequent crying spells', category: 'Mental', keywords: ['cries easily', 'tearful', 'sobbing', 'emotional'] },
    { id: 'm13', text: 'Seems overly critical of self or others', category: 'Mental', keywords: ['perfectionist', 'judgmental', 'negative', 'harsh'] },
    { id: 'm14', text: 'Difficulty handling stress or minor problems', category: 'Mental', keywords: ['overwhelmed', 'can\'t cope', 'breaks down', 'fragile'] },
    { id: 'm15', text: 'Rapid, pressured speech or racing thoughts', category: 'Mental', keywords: ['manic', 'can\'t stop talking', 'fast', 'flight of ideas'] },
    { id: 'm16', text: 'Extreme highs and lows in mood', category: 'Mental', keywords: ['bipolar', 'volatile', 'unpredictable', 'manic-depressive'] },
    { id: 'm17', text: 'Expresses bizarre or irrational ideas', category: 'Mental', keywords: ['strange thoughts', 'conspiracy theories', 'magical thinking'] },
    { id: 'm18', text: 'Seems to be experiencing panic attacks', category: 'Mental', keywords: ['hyperventilating', 'can\'t breathe', 'terror', 'anxiety attack'] },
    { id: 'm19', text: 'Negative self-talk is more frequent', category: 'Mental', keywords: ['I\'m stupid', 'I\'m a failure', 'self-deprecating', 'inner critic'] },
    { id: 'm20', text: 'Constantly seeking reassurance', category: 'Mental', keywords: ['is this okay?', 'do you hate me?', 'needy', 'insecure'] },
    { id: 'm21', text: 'Overly defensive or sensitive to criticism', category: 'Mental', keywords: ['touchy', 'can\'t take a joke', 'brittle', 'reactive'] },
    { id: 'm22', text: 'Catastrophizing small issues', category: 'Mental', keywords: ['worst-case scenario', 'making a big deal', 'overreacting', 'dramatic'] },

    // Nutritional
    { id: 'n1', text: 'Frequently skips meals', category: 'Nutritional', keywords: ['not eating', 'fasting', 'no appetite', 'forgets to eat'] },
    { id: 'n2', text: 'Eating significantly more or less than usual', category: 'Nutritional', keywords: ['appetite change', 'binging', 'starving', 'overeating'] },
    { id: 'n3', text: 'Relies heavily on processed, fast, or sugary food', category: 'Nutritional', keywords: ['junk food', 'unhealthy', 'takeout', 'poor diet'] },
    { id: 'n4', text: 'Appears dehydrated or drinks little water', category: 'Nutritional', keywords: ['thirsty', 'dry lips', 'dark urine', 'not hydrating'] },
    { id: 'n5', text: 'Unusual cravings or food aversions', category: 'Nutritional', keywords: ['picky eater', 'hates food', 'craves sugar'] },
    { id: 'n6', text: 'Obsessive calorie counting or food tracking', category: 'Nutritional', keywords: ['diet app', 'food obsession', 'orthorexia', 'measuring food'] },
    { id: 'n7', text: 'Expresses guilt or shame about eating', category: 'Nutritional', keywords: ['bad food', 'cheating on diet', 'food guilt', 'body image'] },
    { id: 'n8', text: 'Hoarding food', category: 'Nutritional', keywords: ['hiding snacks', 'stockpiling', 'secret eating'] },
    { id: 'n9', text: 'Evidence of binging or purging (e.g., frequent trips to the bathroom after meals)', category: 'Nutritional', keywords: ['bulimia', 'vomiting', 'laxatives', 'throwing up'] },
    { id: 'n10', text: 'Dramatic changes in diet (e.g., sudden veganism, cutting out entire food groups)', category: 'Nutritional', keywords: ['restrictive eating', 'crash diet', 'fad diet'] },
    { id: 'n11', text: 'Expresses fear of certain foods or gaining weight', category: 'Nutritional', keywords: ['anorexia', 'fat phobia', 'food fear'] },
    { id: 'n12', text: 'Consuming excessive amounts of caffeine or energy drinks', category: 'Nutritional', keywords: ['coffee', 'red bull', 'monster', 'wired', 'stimulants'] },
    { id: 'n13', text: 'Cooking elaborate meals for others but not eating them', category: 'Nutritional', keywords: ['control', 'feeding others', 'proxy control'] },
    { id: 'n14', text: 'Avoiding social situations that involve food', category: 'Nutritional', keywords: ['won\'t go to dinner', 'restaurant anxiety', 'eating in public'] },


    // Hygiene
    { id: 'h1', text: 'Decline in personal grooming (showering, brushing teeth)', category: 'Hygiene', keywords: ['not bathing', 'unclean', 'dirty', 'bad hygiene'] },
    { id: 'h2', text: 'Body odor is more noticeable than usual', category: 'Hygiene', keywords: ['smelly', 'B.O.', 'unwashed', 'odor'] },
    { id: 'h3', text: 'Wearing unclean clothes repeatedly', category: 'Hygiene', keywords: ['dirty clothes', 'stained', 'messy', 'same outfit'] },
    { id: 'h4', text: 'Messy or unkempt living space', category: 'Hygiene', keywords: ['hoarding', 'dirty house', 'clutter', 'squalor'] },
    { id: 'h5', text: 'Neglecting oral hygiene', category: 'Hygiene', keywords: ['bad breath', 'not brushing', 'halitosis'] },
    { id: 'h6', text: 'Unkempt hair or nails', category: 'Hygiene', keywords: ['messy hair', 'dirty fingernails', 'greasy hair'] },
    { id: 'h7', text: 'Letting mail, trash, or dishes pile up', category: 'Hygiene', keywords: ['mess', 'chores', 'neglect', 'undone tasks'] },
    { id: 'h8', text: 'Neglecting pet care or hygiene', category: 'Hygiene', keywords: ['animal neglect', 'dirty litter box', 'unfed pet'] },

    // Social
    { id: 's1', text: 'Avoiding social gatherings or events', category: 'Social', keywords: ['hermit', 'isolation', 'doesn\'t go out', 'cancels plans'] },
    { id: 's2', text: 'Less communicative (fewer texts, calls)', category: 'Social', keywords: ['ghosting', 'not replying', 'silent', 'unresponsive'] },
    { id: 's3', text: 'Cancelling plans at the last minute frequently', category: 'Social', keywords: ['flaky', 'bailing', 'unreliable', 'makes excuses'] },
    { id: 's4', text: 'Seems distant or disconnected during conversations', category: 'Social', keywords: ['zoned out', 'not listening', 'preoccupied', 'distracted'] },
    { id: 's5', text: 'Conflict with friends, family, or coworkers', category: 'Social', keywords: ['fighting', 'arguing', 'drama', 'disagreements'] },
    { id: 's6', text: 'Spending excessive time alone', category: 'Social', keywords: ['isolating', 'loner', 'shut-in', 'hermit mode'] },
    { id: 's7', text: 'Oversharing or inappropriate social media posts', category: 'Social', keywords: ['TMI', 'vaguebooking', 'cringey posts', 'trauma dumping'] },
    { id: 's8', text: 'Difficulty maintaining relationships', category: 'Social', keywords: ['breakups', 'losing friends', 'strained relations'] },
    { id: 's9', text: 'Seems to have a "social mask" on, appearing cheerful but seeming insincere', category: 'Social', keywords: ['fake smile', 'hiding feelings', 'pretending', 'people pleasing'] },
    { id: 's10', text: 'Drastically changing friend groups', category: 'Social', keywords: ['new friends', 'ditching old friends', 'no loyalty'] },
    { id: 's11', text: 'Seems overly dependent on a partner or friend', category: 'Social', keywords: ['clingy', 'codependent', 'needy', 'insecure attachment'] },
    { id: 's12', text: 'Picks fights or is overly argumentative', category: 'Social', keywords: ['combative', 'hostile', 'looking for a fight', 'antagonistic'] },
    { id: 's13', text: 'Stops responding to messages for long periods', category: 'Social', keywords: ['MIA', 'going dark', 'unresponsive', 'leaving on read'] },
    { id: 's14', text: 'Seems lonely even when in a group', category: 'Social', keywords: ['alone in a crowd', 'disconnected', 'alienated'] },

    // Behavioral
    { id: 'b1', text: 'Increased use of alcohol, tobacco, or other substances', category: 'Behavioral', keywords: ['drinking more', 'smoking', 'drugs', 'getting high', 'substance abuse'] },
    { id: 'b2', text: 'Engaging in risky or impulsive behaviors', category: 'Behavioral', keywords: ['reckless', 'unsafe sex', 'thrill-seeking', 'dangerous'] },
    { id: 'b3', text: 'Neglecting responsibilities (work, school, home)', category: 'Behavioral', keywords: ['slacking', 'missing deadlines', 'unreliable', 'procrastination'] },
    { id: 'b4', text: 'Procrastinating more than usual', category: 'Behavioral', keywords: ['putting things off', 'unmotivated', 'lazy', 'avoidance'] },
    { id: 'b5', text: 'Changes in spending habits (overspending or hoarding money)', category: 'Behavioral', keywords: ['broke', 'shopping addiction', 'frugal', 'financial issues'] },
    { id: 'b6', text: 'Compulsive behaviors (e.g., excessive shopping, gaming, gambling)', category: 'Behavioral', keywords: ['addiction', 'can\'t stop', 'obsessed', 'compulsion'] },
    { id: 'b7', text: 'Appears secretive or dishonest', category: 'Behavioral', keywords: ['lying', 'hiding things', 'deceptive', 'shady'] },
    { id: 'b8', text: 'Abandoning long-term goals or plans', category: 'Behavioral', keywords: ['giving up', 'no ambition', 'dropping out'] },
    { id: 'b9', text: 'Increased carelessness or accident-proneness', category: 'Behavioral', keywords: ['clumsy', 'getting hurt', 'not paying attention'] },
    { id: 'b10', text: 'Selling possessions of value', category: 'Behavioral', keywords: ['pawning things', 'needs money', 'desperate'] },
    { id: 'b11', text: 'Violating rules or laws', category: 'Behavioral', keywords: ['delinquency', 'getting in trouble', 'illegal'] },
    { id: 'b12', text: 'Expressing intense boredom or emptiness', category: 'Behavioral', keywords: ['nothing matters', 'ennui', 'apathy', 'numb'] },
    { id: 'b13', text: 'Dominates conversations or talks excessively', category: 'Behavioral', keywords: ['talks a lot', 'interrupts', 'monologue', 'overtalking', 'non-stop talking'] },
    { id: 'b14', text: 'Frequently changes topics or seems unable to focus on one task', category: 'Behavioral', keywords: ['scatterbrained', 'distracted', 'lacks follow-through', 'unfocused', 'can\'t concentrate'] },
    { id: 'b15', text: 'Seems unaware of or indifferent to social cues', category: 'Behavioral', keywords: ['awkward', 'misses hints', 'socially unaware', 'doesn\'t get it', 'poor social skills'] },
    { id: 'b16', text: 'Exaggerates achievements or seems to have an inflated sense of self-importance', category: 'Behavioral', keywords: ['bragging', 'arrogant', 'grandiose', 'narcissistic traits', 'show-off'] },
    { id: 'b17', text: 'Seems to have a pattern of unstable or intense relationships', category: 'Behavioral', keywords: ['drama', 'chaotic relationships', 'push-pull', 'idealize devalue', 'stormy relationships'] },
    { id: 'b18', text: 'Acts overly dramatic or seeks to be the center of attention', category: 'Behavioral', keywords: ['attention-seeking', 'theatrical', 'histrionic traits', 'needs validation', 'drama queen'] },
    { id: 'b19', text: 'Seems overly suspicious or distrustful of others without reason', category: 'Behavioral', keywords: ['paranoid', 'thinks people are against them', 'mistrustful', 'conspiratorial', 'suspicious'] },
    { id: 'b20', text: 'Has a rigid need for order, perfectionism that interferes with tasks', category: 'Behavioral', keywords: ['perfectionist', 'OCPD traits', 'inflexible', 'control freak', 'micromanaging'] },
    { id: 'b21', text: 'Avoids occupational activities that involve significant interpersonal contact', category: 'Behavioral', keywords: ['avoids teamwork', 'socially anxious at work', 'fears criticism', 'avoids meetings'] },
    { id: 'b22', text: 'Shows a reckless disregard for the safety of self or others', category: 'Behavioral', keywords: ['dangerous', 'impulsive', 'no fear', 'risk-taker', 'antisocial'] },
];

const MOCK_FORUMS = {
    "Burnout": [
        { id: 'b1', userId: 'user_scarlet_cat', userName: 'ScarletCat', text: "I feel so drained all the time. Just... empty. Anyone else?", timestamp: new Date(Date.now() - 3600000 * 2), avatarColor: 'bg-red-200' },
        { id: 'b2', userId: 'user_azure_dog', userName: 'AzureDog', text: "Yes. It feels like nothing I do matters at work anymore. I used to love my job.", timestamp: new Date(Date.now() - 3600000 * 1.5), avatarColor: 'bg-sky-200' },
        { id: 'b3', userId: 'user_emerald_owl', userName: 'EmeraldOwl', text: "Same. I'm so irritable with my family and I hate it. I just have no energy left for them.", timestamp: new Date(Date.now() - 3600000 * 1), avatarColor: 'bg-emerald-200' },
        { id: 'b4', userId: 'user_amber_fox', userName: 'AmberFox', text: "For anyone struggling, taking a real break (not just a weekend) helped me a little. It's hard but necessary.", timestamp: new Date(Date.now() - 3600000 * 0.5), avatarColor: 'bg-amber-200' },
    ],
    "Depression": [
        { id: 'd1', userId: 'user_indigo_ray', userName: 'IndigoRay', text: "Does anyone else have days where just getting out of bed feels impossible? It's not about being tired, it's... heavy.", timestamp: new Date(Date.now() - 86400000 * 1), avatarColor: 'bg-indigo-200' },
        { id: 'd2', userId: 'user_rose_finch', userName: 'RoseFinch', text: "All the time. And then the guilt for not being 'productive' makes it even worse. It's a vicious cycle.", timestamp: new Date(Date.now() - 3600000 * 18), avatarColor: 'bg-rose-200' },
        { id: 'd3', userId: 'user_slate_mole', userName: 'SlateMole', text: "Losing interest in things I used to love is the hardest part for me. Everything feels gray.", timestamp: new Date(Date.now() - 3600000 * 10), avatarColor: 'bg-slate-200' },
    ],
    "Anxiety": [
        { id: 'a1', userId: 'user_teal_turtle', userName: 'TealTurtle', text: "My heart races for no reason. It's so frustrating. Does anyone have tips for calming down in the moment?", timestamp: new Date(Date.now() - 3600000 * 5), avatarColor: 'bg-teal-200' },
        { id: 'a2', userId: 'user_fuchsia_frog', userName: 'FuchsiaFrog', text: "The 5-4-3-2-1 grounding technique sometimes helps me. 5 things you can see, 4 you can touch, etc. It brings me back to the present.", timestamp: new Date(Date.now() - 3600000 * 4), avatarColor: 'bg-fuchsia-200' },
    ],
    "Stress": [],
    "Grief": [],
    "ADHD": []
};

const findObservableById = (id) => {
    const observable = OBSERVABLES.find(o => o.id === id);
    if (!observable) {
        throw new Error(`[Mock Data Error] Observable with id "${id}" not found.`);
    }
    return observable;
};

const AI_GENERATED_CONTENT_MOCK = {
    disclaimer: "This is not a diagnosis. The information provided is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you are in crisis, please call 988 or your local emergency services.",
    possibleConditions: [
        { name: "Burnout", likelihood: "high", description: "A state of emotional, physical, and mental exhaustion caused by excessive and prolonged stress. It occurs when you feel overwhelmed, emotionally drained, and unable to meet constant demands." },
        { name: "Depression", likelihood: "medium", description: "A mood disorder that causes a persistent feeling of sadness and loss of interest. It affects how you feel, think and behave and can lead to a variety of emotional and physical problems." }
    ],
    resources: [
        { title: "Article: Understanding Burnout", type: "article", description: "Learn the signs, causes, and coping mechanisms for workplace and life burnout." },
        { title: "Mindful Breathing Exercise", type: "product", description: "A 5-minute guided audio exercise to help calm an anxious mind." },
        { title: "Local Therapy Clinic", type: "clinic", description: "Find certified professionals for in-person or virtual sessions." },
        { title: "Depression Support Group", type: "support group", description: "Connect with others who understand what you're going through." },
        { title: "BetterHelp Online Counseling", type: "product", description: "Access licensed therapists from the comfort of your home." }
    ]
};

const MOCK_CONTACTS = [];

const MOCK_WINK_TEMPLATE = {
    id: 'wink-template-1', type: 'Wink', recipient: 'a friend',
    observables: [
        findObservableById('m1'),
        findObservableById('s1'),
        findObservableById('b3'),
    ],
    aiContent: AI_GENERATED_CONTENT_MOCK,
    timestamp: new Date(Date.now() - 86400000 * 2),
    isRead: true,
};

const MOCK_INBOX = [];

const MOCK_OUTBOX = [];

const MOCK_COMMUNITY_EXPERIENCES = [
    { id: 'exp1', text: "Getting a Wink was a turning point. It made me realize I wasn't hiding my struggles as well as I thought, but also that someone cared enough to reach out. It gave me the courage to talk to a professional.", timestamp: new Date(Date.now() - 86400000 * 1) },
    { id: 'exp2', text: "I was so anxious about a friend, and WinkDrop let me break the ice without making things awkward. They actually brought it up to me later (not knowing it was me) and we had a real conversation. So grateful for this tool.", timestamp: new Date(Date.now() - 86400000 * 3) }
];

const MOCK_COMMUNITY_LOCATIONS = [
    'California, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, Australia', 'Paris, France', 'Toronto, Canada', 'Berlin, Germany'
];

const MOCK_COMMUNITY_WINKS = [
    { ...MOCK_WINK_TEMPLATE, id: 'cw-0', senderLocation: 'New York, USA', reactions: { support: 12, seen: 5, thinking: 8 } },
    ...MOCK_COMMUNITY_LOCATIONS.map((location, index) => ({
        ...MOCK_WINK_TEMPLATE,
        id: `cw-${index + 1}`,
        senderLocation: location,
        observables: [
            OBSERVABLES[Math.floor(Math.random() * OBSERVABLES.length)],
            OBSERVABLES[Math.floor(Math.random() * OBSERVABLES.length)],
        ],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 5), // within last 5 days
        reactions: {
            support: Math.floor(Math.random() * 20),
            thinking: Math.floor(Math.random() * 15),
            seen: Math.floor(Math.random() * 10)
        }
    }))
];

const MOCK_SOCIAL_POSTS = [
    {
        platform: 'X',
        content: 'Just got an anonymous WinkDrop. Whoever sent it, thank you. It means more than you know. A good reminder to check in with your people. 🙏 #thanksanonymous #mentalhealth',
        timestamp: new Date(Date.now() - 3600000 * 6), // 6 hours ago
        user: { name: 'User123', handle: '@anon_user', avatar: 'generic' },
        likes: 152,
        comments: 18,
    },
    {
        platform: 'Instagram',
        content: 'It’s okay to not be okay. Someone reminded me of that today without even saying a word. Grateful for the silent support out there. We all need it sometimes. #thanksanonymous #youareseen #winkdrops',
        timestamp: new Date(Date.now() - 86400000 * 1.5), // 1.5 days ago
        user: { name: 'CreativeSoul', handle: '@creative_soul', avatar: 'generic' },
        likes: 1280,
        comments: 94,
    },
    {
        platform: 'TikTok',
        content: 'I never thought an anonymous message could make me cry in a good way. The resources were actually helpful. #thanksanonymous #selfcare #itgetsbetter',
        timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
        user: { name: 'PositiveVibes', handle: '@positivevibesonly', avatar: 'generic' },
        likes: 25400,
        comments: 782,
    },
];

// --- (The rest of the bundled and transpiled code from all components will be here) ---
// --- This would be thousands of lines of JavaScript. ---


// --- Entry Point ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

if ('history' in window && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null, React.createElement(App, null))
);
