import React from 'react';
import { LucideProps, Inbox, Send, Users, Activity, LogOut, ArrowRight, UserPlus, Eye, Heart, Brain, Apple, Droplets, Check, Loader2, AlertTriangle, ChevronLeft, X, Twitter, Instagram, Smartphone, Ghost, Search, ClipboardCheck, ChevronDown, SendHorizontal, Quote, Home, Link, PlusCircle, Bell, BellOff, Share2, ChevronRight, ThumbsUp, ThumbsDown, ShieldCheck, Settings, Trash2, Ban, Sparkles, ChevronUp, Gift, Music4, HelpCircle, Contact, Mail, Pencil, Feather, LogIn, Star } from 'lucide-react';

export const icons = {
  inbox: Inbox,
  send: Send,
  users: Users,
  activity: Activity,
  logout: LogOut,
  arrowRight: ArrowRight,
  userPlus: UserPlus,
  eye: Eye,
  heart: Heart,
  brain: Brain,
  apple: Apple,
  droplets: Droplets,
  check: Check,
  loader: Loader2,
  warning: AlertTriangle,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  x: X,
  twitter: Twitter,
  instagram: Instagram,
  smartphone: Smartphone,
  ghost: Ghost,
  search: Search,
  nudge: Feather,
  clipboardCheck: ClipboardCheck,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  sendHorizontal: SendHorizontal,
  quote: Quote,
  home: Home,
  link: Link,
  plusCircle: PlusCircle,
  bell: Bell,
  bellOff: BellOff,
  share: Share2,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  shieldCheck: ShieldCheck,
  settings: Settings,
  trash: Trash2,
  ban: Ban,
  sparkles: Sparkles,
  gift: Gift,
  tiktok: Music4,
  helpCircle: HelpCircle,
  contact: Contact,
  mail: Mail,
  pencil: Pencil,
  logIn: LogIn,
  star: Star,
};

type IconProps = LucideProps & {
  name: keyof typeof icons;
};

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name];
  return <LucideIcon {...props} />;
};
