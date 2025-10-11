"use client";

import React, { useState, useEffect } from 'react';
import { Play, ArrowUpRight, Paperclip, Sparkles, ChevronRight, Menu, User, Plus, Minus } from 'lucide-react';
import { FaDiscord } from "react-icons/fa";
import { Component as AnimatedBackground } from '../open-ai-codex-animated-background';
import ChatInputLight from '@/components/ui/chat-input-light';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import EndlessTools from './EndlessTools';
import localFont from "next/font/local";

const epilogue = localFont({
  src: [
    {
      path: "../../../public/fonts/Epilogue-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Epilogue-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

// Image placeholders - Replace these with your actual image URLs
const images = {
  alephCard: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80',
  tribecaFestival: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
  lionsgatePartner: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
  alephVideo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
  lonelyPoster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
  herdPoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
  retrievalPoster: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&q=80',
  nyPoster: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
  vedePoster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  madonna: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  danStreit: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80',
  toolProduction: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
  gen4Card: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
  generalWorldModels: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  homepageHero: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  aiffLogo: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
  telescopeMag: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
  marsAndSiv: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80',
};

// Partner logos as text for now - replace with actual SVG/image imports
const partnerLogos = [
  { name: 'Lionsgate', logo: 'LIONSGATE' },
  { name: 'HBO', logo: 'HBO' },
  { name: 'A24', logo: 'A24' },
  { name: 'ILM', logo: 'ILM' },
  { name: 'Vice', logo: 'VICE' },
  { name: 'Tribeca', logo: 'TRIBECA' },
];

export default function RunwayLandingPage({ isEarlyAccess = false }: { isEarlyAccess?: boolean }) {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  const { user, loading, signOut } = useAuth();

  const faqData = [
    {
      question: "How does Surbee ensure response quality?",
      answer: "We watch how people answer, not what they answer. Bots and speedrunners have patterns. Real, thoughtful humans don't. Our AI spots the difference in seconds and filters out the junk automatically."
    },
    {
      question: "What is the Credit Network and how does it work?",
      answer: "Think of it like a favor exchange. You help others by answering their surveys thoughtfully, you earn credits. Then you use those credits to get your own surveys answered by people who actually care. Everyone wins, and the quality stays high."
    },
    {
      question: "Can I use Surbee for academic research?",
      answer: "Absolutely! We built this specifically because academic surveys need to be bulletproof. Our AI helps you avoid leading questions and confusing wording, plus our quality checks make sure you're getting real data, not garbage. Perfect for thesis work, research papers, or any study where accuracy matters."
    },
    {
      question: "How is Surbee different from other survey platforms?",
      answer: "Most survey platforms are basically spam factories. They care about quantity, not quality. We're the opposite. We'd rather give you 100 thoughtful responses than 1000 rushed ones. Plus our AI actually helps you write better questions instead of just collecting whatever you throw at people."
    },
    {
      question: "What happens to my data and survey responses?",
      answer: "Your data is yours, full stop. We encrypt everything, never sell your info to anyone, and you can download or delete everything whenever you want. We're not in the data-selling business. We're in the good-surveys business."
    },
    {
      question: "Is there a free version of Surbee?",
      answer: "Yep! Start for free, no credit card needed. You get access to our AI question helper, basic quality filtering, and can collect your first responses without paying anything. Once you're hooked (and you will be), you can upgrade for more features and higher limits."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-white ${epilogue.variable}`} style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
      {/* Navigation Bar */}
      <nav className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-8 py-2 h-[88px] flex items-center">
          <div className="flex justify-between items-center w-full">
            {/* Logo */}
            <div className="flex items-center">
              <img src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" alt="Surbee" className="h-16" />
            </div>
            
            {/* Navigation Links - Centered */}
            <div className="hidden md:flex items-center justify-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/about" className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                About
              </Link>
              <Link href="/pricing" className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                Pricing
              </Link>
              <Link href="/students" className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                For Students
              </Link>
              <Link href="/changelog" className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                Changelog
              </Link>
              <a href="https://discord.gg/krs577Qxqr" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                <FaDiscord className="w-4 h-4 text-gray-500" />
                Community
              </a>
            </div>
            
            {/* Authentication Section */}
            <div className="flex items-center ml-auto">
              {loading ? (
                <div className="px-4 py-2 border border-black text-black rounded-full" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                  Loading...
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full" style={{
                    fontFamily: 'var(--font-epilogue), sans-serif',
                    fontSize: "14px",
                    color: "#666"
                  }}>
                    <div className="bg-blue-500 w-3 h-3 rounded-full" />
                    <span className="text-sm" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                      {user.email}
                    </span>
                  </div>
                  <Link href={isEarlyAccess ? "/earlyaccess" : "/dashboard"} className="px-3 py-1.5 bg-black text-white rounded-full hover:bg-black/80 transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                    {isEarlyAccess ? "Get Early Access" : "Dashboard"}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="px-4 py-2 text-black hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-3 py-1.5 bg-black text-white rounded-full hover:bg-black/80 transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2">
              <Menu className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Animated Background - Full Hero Section */}
        <div className="absolute top-0 left-8 right-8 bottom-40 rounded-lg overflow-hidden">
          <AnimatedBackground />
        </div>
        
        {/* Content Overlay */}
        <div className="absolute top-0 left-0 right-0 bottom-40 z-10 flex items-center justify-center">
          <div className="w-full max-w-4xl px-8">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-12 border border-white/20 w-full text-center">
            <h1 className="text-5xl text-center mb-4 tracking-tight text-white" style={{ fontFamily: 'var(--font-epilogue), serif', fontWeight: 200 }}>
              {isEarlyAccess ? (
                <span className="inline-flex items-end gap-2">
                  Get Early Access to Surbee
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/30 mb-1" style={{ fontFamily: 'var(--font-epilogue), sans-serif', fontSize: '12px' }}>
                    beta
                  </span>
                </span>
              ) : "What do you want to create?"}
            </h1>
            <p className="text-center text-white/90 mb-8" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
              {isEarlyAccess ? "Join the waitlist and be among the first to experience the future of surveys." : "Start generating with a simple conversation."}
            </p>
            
            {/* Chat Input or Waitlist Form */}
            <div className="max-w-2xl mx-auto">
              {isEarlyAccess ? (
                <>
                  {/* Waitlist Form */}
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/50"
                      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
                    />
                    <button className="px-6 py-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors font-medium whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                      Join Waitlist
                    </button>
                  </div>
                  
                  <p className="text-xs text-white/70 text-center mt-6" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                    Be the first to know when Surbee launches. We'll never spam you.
                  </p>
                </>
              ) : (
                <>
                  <ChatInputLight
                    onSendMessage={(message, images) => {
                      if (!message && (!images || images.length === 0)) return;
                      
                      // Check if user is logged in
                      if (!user) {
                        // Redirect to login page first
                        window.location.href = '/login';
                        return;
                      }
                      
                      // User is logged in, proceed to create survey
                      try { sessionStorage.setItem('surbee_initial_prompt', message || ''); } catch {}
                      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                      const url = new URL(window.location.origin + `/project/${projectId}`);
                      // Carry images to project page via session storage (avoid long URLs)
                      if (images && images.length) {
                        try { sessionStorage.setItem('surbee_initial_images', JSON.stringify(images.slice(0, 10))); } catch {}
                      }
                      window.location.href = url.toString();
                    }}
                    placeholder="Describe your survey idea..."
                    style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
                    className=""
                    theme="white"
                  />
                  
                  {/* Suggestion Pills */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="text-left p-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors h-12 flex items-center cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="bg-white text-black text-xs px-2 py-1 rounded" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>New</span>
                        <p className="text-sm text-white/90" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Lyra is now available</p>
                      </div>
                    </button>
                    <button className="text-left p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors h-12 flex items-center cursor-pointer">
                      <p className="text-sm text-white/90" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Create a customer satisfaction survey</p>
                    </button>
                    <button className="text-left p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors h-12 flex items-center cursor-pointer">
                      <p className="text-sm text-white/90" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Design a market research questionnaire</p>
                    </button>
                    <button className="text-left p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors h-12 flex items-center cursor-pointer">
                      <p className="text-sm text-white/90" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Build an employee feedback form</p>
                    </button>
                  </div>
                  
                  <p className="text-xs text-white/70 text-center mt-6" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                    By sending a message, you agree to our{' '}
                    <Link href="/terms" className="underline">Terms of Use</Link> and acknowledge that you have read and understand our{' '}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>

      <EndlessTools />

      {/* Technology Section */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-black text-center mb-6 tracking-tight" style={{ fontFamily: 'PP Editorial, serif', fontSize: '72px', fontWeight: 200 }}>
            The New Era for Surveys
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-epilogue), sans-serif', fontSize: '16px' }}>
          Let's be honest: surveys suck. They're boring, people rush through them, and half the time you can't trust the results. 
          We built Surbee because we were tired of bad data ruining good decisions.
          </p>
          

          {/* Video Preview */}
          <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-20">
            <img src={images.alephVideo} alt="Runway Aleph" className="w-full h-full object-cover" />
            <button className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 backdrop-blur-sm px-8 py-3 rounded-full flex items-center gap-3 hover:bg-black/40 transition-colors">
                <Play className="w-4 h-4 text-white fill-white" />
                <span className="text-white" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Play</span>
              </div>
            </button>
          </div>

          {/* News Grid - Hidden but kept for later use */}
          {/* <div>
            <h3 className="text-3xl mb-8 tracking-tight" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>News</h3>
            <div className="grid grid-cols-3 gap-8">
              {[
                { image: images.alephCard, title: 'Introducing Runway Aleph', category: 'Research', date: 'July 26, 2025' },
                { image: images.tribecaFestival, title: 'Exploring the Future of Filmmaking with Tribeca Festival 2024', category: 'News', date: 'May 11, 2024' },
                { image: images.lionsgatePartner, title: 'Runway Partners with Lionsgate', category: 'News', date: 'September 19, 2024' },
              ].map((item, idx) => (
                <a href="#" key={idx} className="group">
                  <div className="aspect-video bg-gray-200 rounded overflow-hidden mb-4">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h4 className="text-xl mb-2 group-hover:opacity-70 transition-opacity">{item.title}</h4>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>{item.category} / {item.date}</p>
                </a>
              ))}
            </div>
          </div> */}
        </div>
      </section>

      {/* PhD-Grade Survey Builder Section */}
      <section className="py-28 bg-black text-white rounded-t-lg mx-4">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4 tracking-tight" style={{ fontFamily: 'PP Editorial, serif', fontSize: '72px', fontWeight: 200 }}>PhD-Grade Questionnaires</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8" style={{ fontFamily: 'var(--font-epilogue), sans-serif', fontSize: '16px' }}>
              You don't need a research degree to write great surveys. Our AI helps you craft questions that actually make sense to real people. 
              No jargon, no confusion, just clear communication.
            </p>
            <Link href={user ? "/dashboard" : "/login"} className="inline-block px-6 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
              Try Surbee Free
            </Link>
          </div>

          {/* Survey Builder Demo */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-16">
            <img src={images.alephVideo} alt="Survey Builder Interface" className="w-full h-full object-cover" />
            <button className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 backdrop-blur-sm px-8 py-3 rounded-full flex items-center gap-3 hover:bg-black/40 transition-colors">
                <Play className="w-4 h-4 text-white fill-white" />
                <span className="text-white" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Watch Demo</span>
              </div>
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-8">
            {[
              { 
                title: 'Smart Question Generation', 
                description: 'Our AI catches the awkward wording and bias before your respondents do.',
                image: images.lonelyPoster 
              },
              { 
                title: 'Adaptive Logic', 
                description: 'Your survey adapts to each person\'s answers, like a real conversation.',
                image: images.herdPoster 
              },
              { 
                title: 'Real-time Preview', 
                description: 'Test drive your survey before sending it out and see what works and what doesn\'t.',
                image: images.retrievalPoster 
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-4">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl mb-2" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>{feature.title}</h3>
                <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accuracy Checker Section */}
      <section className="py-28 bg-black text-white border-t border-zinc-900 mx-4">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-xs uppercase tracking-wider mb-4 text-gray-400" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Accuracy Checker</p>
          <h2 className="mb-4 tracking-tight whitespace-nowrap" style={{ fontFamily: 'PP Editorial, serif', fontSize: '72px', fontWeight: 200 }}>
            Data You Can Actually Trust
          </h2>
          <p className="text-gray-400 max-w-2xl mb-8" style={{ fontFamily: 'var(--font-epilogue), sans-serif', fontSize: '18px' }}>
            We catch the speedrunners, the bots, and the people just clicking randomly for rewards. 
            Every response gets vetted, so you only see the real, thoughtful answers from actual humans who care.
          </p>
          <button className="px-6 py-2 border border-white rounded-full hover:bg-white hover:text-black transition-colors mb-12" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
            See How It Works
          </button>

          <div className="grid grid-cols-3 gap-8">
            {[
              { 
                image: images.alephCard, 
                title: 'Response Time Analysis', 
                description: 'Spots people who blast through surveys in 30 seconds flat.',
                metric: '99.2% accuracy' 
              },
              { 
                image: images.gen4Card, 
                title: 'Pattern Detection', 
                description: 'Catches the "all 5s" crowd and random clickers before they mess up your data.',
                metric: '15x faster' 
              },
              { 
                image: images.generalWorldModels, 
                title: 'Quality Score', 
                description: 'Every answer gets graded so only the thoughtful ones make it through.',
                metric: '98% reliability' 
              },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="aspect-video bg-gray-800 rounded overflow-hidden mb-4 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-4 right-4 bg-green-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    {item.metric}
                  </div>
                </div>
                <h4 className="text-xl mb-2 group-hover:opacity-70 transition-opacity">{item.title}</h4>
                <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Network Section */}
      <section className="py-28 bg-black text-white border-t border-zinc-900 mx-4 mb-4 rounded-b-lg">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="mb-8">
              <span className="text-2xl font-light tracking-wider whitespace-nowrap" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>CREDIT NETWORK</span>
            </div>
            <h2 className="text-7xl mb-16 tracking-tight leading-tight whitespace-nowrap" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
              Community-Powered Distribution
            </h2>
          </div>

          <div className="relative mb-20">
            <div className="aspect-video bg-gray-800 rounded overflow-hidden">
              <img src={images.homepageHero} alt="Credit Network Visualization" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </div>

          <p className="text-3xl text-center max-w-4xl mx-auto mb-12 leading-relaxed" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
            Here's the deal: answer surveys thoughtfully, earn credits. Use those credits to get your own surveys answered 
            by people who actually give a damn. No bots, no click farms, just real people helping each other out.
          </p>

          <div className="text-center mb-20">
            <Link href={user ? "/dashboard" : "/login"} className="inline-block px-6 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
              Join Credit Network
            </Link>
          </div>

          <h3 className="text-2xl mb-8" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>How It Works</h3>
          <div className="grid grid-cols-3 gap-8">
            {[
              { 
                image: images.aiffLogo, 
                title: 'Earn Credits', 
                description: 'Take your time answering others\' surveys and get rewarded for real, thoughtful responses.',
                icon: '+'
              },
              { 
                image: images.telescopeMag, 
                title: 'Spend Credits', 
                description: 'Spend your earned credits to get quality people answering your own surveys.',
                icon: '→'
              },
              { 
                image: images.marsAndSiv, 
                title: 'Quality Guaranteed', 
                description: 'Everyone\'s verified, every response is checked. No gaming the system.',
                icon: '✓'
              },
            ].map((item, idx) => (
              <div key={idx} className="group text-center">
                <div className="aspect-video bg-gray-800 rounded overflow-hidden mb-4 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                      {item.icon}
                    </div>
                  </div>
                </div>
                <h4 className="text-xl mb-2 group-hover:opacity-70 transition-opacity">{item.title}</h4>
                <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Success Stories Section - Hidden but kept for potential future use */}
      {/* 
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl text-center mb-6 tracking-tight leading-tight text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
            How the world's top researchers<br />are using Surbee.
          </h2>
          
          <div className="text-center mb-16">
            <button className="px-6 py-2 border border-black rounded-full hover:bg-black hover:text-white transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
              More Research Stories
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-16">
            {[
              { 
                image: images.madonna, 
                title: "How Stanford researchers collected 10,000 quality responses in 48 hours",
                category: 'Academic Research',
                institution: 'Stanford University'
              },
              { 
                image: images.danStreit, 
                title: 'How Netflix validated new content ideas with 99% response accuracy',
                category: 'Market Research',
                institution: 'Netflix Research'
              },
              { 
                image: images.toolProduction, 
                title: 'How Johns Hopkins ensured data integrity in clinical trials',
                category: 'Healthcare Studies',
                institution: 'Johns Hopkins Medicine'
              },
            ].map((item, idx) => (
              <a href="#" key={idx} className="group">
                <div className="aspect-video bg-gray-200 rounded overflow-hidden mb-4">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>{item.category}</p>
                <p className="text-xs text-blue-600 mb-2 font-semibold" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>{item.institution}</p>
                <h4 className="text-xl leading-snug group-hover:opacity-70 transition-opacity">{item.title}</h4>
              </a>
            ))}
          </div>

        </div>
      </section>
      */}

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-6 tracking-tight text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-epilogue), sans-serif', fontSize: '16px' }}>
              Everything you need to know about Surbee and how it works.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  className="w-full flex justify-between items-center py-6 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-xl text-black pr-4" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFaqIndex === index ? (
                      <Minus className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-700 leading-relaxed pr-8" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
              Still have questions?
            </p>
            <a href="https://discord.gg/krs577Qxqr" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-black text-white rounded-full hover:bg-black/80 transition-colors" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
              Join Our Community
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Footer Links */}
          <div className="grid grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Product</h4>
              <ul className="space-y-2" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee Lyra</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee Cipher</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Credit Network</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Resources</h4>
              <ul className="space-y-2" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Education</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Students</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Researchers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Legal</h4>
              <ul className="space-y-2" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">GDPR</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>Follow Us</h4>
              <ul className="space-y-2" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">X / Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">LinkedIn</a></li>
                <li><a href="https://discord.gg/krs577Qxqr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">Discord</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Reddit</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" alt="Surbee" className="h-20" />
            </div>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>
              © 2025 Surbee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}