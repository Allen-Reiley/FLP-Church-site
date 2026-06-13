import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Play, Pause, Volume2, Calendar, User, Clock, 
  ArrowRight, Sparkles, X, ChevronRight, Filter, Check, 
  MapPin, Heart, ArrowLeft, VolumeX, SkipBack, SkipForward,
  BookOpen, Compass, Award, ExternalLink, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERMONS, ELDERS, NEWS_ITEMS, INVOLVEMENTS } from './data';
import { Sermon, Elder, NewsItem, Involvement } from './types';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'archive'>('home');
  
  // Sermons Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const sermonsPerPage = 3;

  // Audio Player State
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedAiTopic, setSelectedAiTopic] = useState<string>('Hope');
  const [customRequest, setCustomRequest] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Involvement Modal State
  const [selectedVolunteer, setSelectedVolunteer] = useState<Involvement | null>(null);
  const [volunteerForm, setVolunteerForm] = useState({ name: '', email: '', message: '' });
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false);

  // Give / Donation Modal State
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [giveStep, setGiveStep] = useState(1);
  const [giveAmount, setGiveAmount] = useState('50');
  const [customGiveAmount, setCustomGiveAmount] = useState('');
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Helper arrays for filters
  const speakers = Array.from(new Set(SERMONS.map(s => s.speaker)));
  const seriesList = Array.from(new Set(SERMONS.map(s => s.series)));

  // Sync scroll on tab click
  const scrollToSection = (id: string) => {
    setActiveTab('home');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Audio effect management
  useEffect(() => {
    if (activeSermon) {
      if (audioRef.current) {
        audioRef.current.src = activeSermon.audioUrl;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      }
    }
  }, [activeSermon]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle playing audio events
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      let newTime = audioRef.current.currentTime + amount;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSpeakerToggle = (speaker: string) => {
    if (selectedSpeakers.includes(speaker)) {
      setSelectedSpeakers(selectedSpeakers.filter(s => s !== speaker));
    } else {
      setSelectedSpeakers([...selectedSpeakers, speaker]);
    }
    setCurrentPage(1);
  };

  const handleSeriesToggle = (series: string) => {
    if (selectedSeries.includes(series)) {
      setSelectedSeries(selectedSeries.filter(s => s !== series));
    } else {
      setSelectedSeries([...selectedSeries, series]);
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSpeakers([]);
    setSelectedSeries([]);
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Filter and Sort Sermons
  const filteredSermons = SERMONS.filter(sermon => {
    const matchesSearch = 
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.series.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpeaker = 
      selectedSpeakers.length === 0 || selectedSpeakers.includes(sermon.speaker);
    
    const matchesSeries = 
      selectedSeries.length === 0 || selectedSeries.includes(sermon.series);

    return matchesSearch && matchesSpeaker && matchesSeries;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'duration') {
      const getSecs = (durStr: string) => {
        const [m, s] = durStr.split(':').map(Number);
        return m * 60 + s;
      };
      return getSecs(b.duration) - getSecs(a.duration);
    }
    return 0;
  });

  // Pagination bounds
  const idxOfLastSermon = currentPage * sermonsPerPage;
  const idxOfFirstSermon = idxOfLastSermon - sermonsPerPage;
  const currentSermons = filteredSermons.slice(idxOfFirstSermon, idxOfLastSermon);
  const totalPages = Math.ceil(filteredSermons.length / sermonsPerPage);

  const startPlayingSermon = (sermon: Sermon) => {
    setActiveSermon(sermon);
    setIsPlaying(true);
  };

  // Submit AI pastor request
  const submitAiRequest = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const res = await fetch('/api/generate-faith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedAiTopic,
          prayerRequest: customRequest
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate. Our servers are experiencing deep growth, please try again.');
      }

      const data = await res.json();
      setAiResponse(data.text);
    } catch (err: any) {
      setAiError(err.message || 'Something went wrong while connecting with the digital grove.');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle volunteering signup
  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerSubmitted(true);
    setTimeout(() => {
      // Reset
      setSelectedVolunteer(null);
      setVolunteerSubmitted(false);
      setVolunteerForm({ name: '', email: '', message: '' });
    }, 3000);
  };

  // Handle tithing/giving flow
  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationSuccess(true);
    setTimeout(() => {
      setIsGiveModalOpen(false);
      setDonationSuccess(false);
      setGiveStep(1);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans transition-colors duration-300">
      
      {/* BACKGROUND GRAPHIC LOOPS */}
      <audio 
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onLoadedMetadata}
        onEnded={onAudioEnded}
      />

      {/* CHURCH BAR / NAVIGATION */}
      <header id="nav-header" className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => { setActiveTab('home'); }} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shadow-sm">
              <img 
                src="https://lh3.googleusercontent.com/aida/AP1WRLvfrEYHPi4elnnkMCPC2Iuvt4A5lVENQ_yrKUZuEuWa57jtV89ie4DREk6vRvq0FGxvx-DA_V-So3tgOPQzo0iWQ-uz6b7ZXnWbnVM19vkKQnhRbj8INcULajTzMySJPQpgo1vL-FEXVyfGtGyJGVE4KaPRNkCbpuJGdeSZcOhVRi_f8fQhKiQaZkcio3koaODm647sHoLtuRMBXgaWQU5izasdOFY-2Dnv_J3q6Pn-kqXDnRqKPqnJAiM" 
                alt="FLP Church Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-primary">FLP Church</span>
              <p className="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase">Front Line People</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('our-vision')} 
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors hover:cursor-pointer"
            >
              Our Vision
            </button>
            <button 
              onClick={() => scrollToSection('our-story')} 
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors hover:cursor-pointer"
            >
              Meetings
            </button>
            <button 
              onClick={() => scrollToSection('our-elders')} 
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors hover:cursor-pointer"
            >
              Elders
            </button>
            <button 
              onClick={() => scrollToSection('get-involved')} 
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors hover:cursor-pointer"
            >
              Involvement
            </button>
            <button 
              onClick={() => scrollToSection('latest-news')} 
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors hover:cursor-pointer"
            >
              Latest News
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setActiveTab(activeTab === 'home' ? 'archive' : 'home');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border flex items-center space-x-2 ${
                activeTab === 'archive'
                  ? 'bg-primary text-white border-primary shadow-sm hover:bg-primary/95'
                  : 'bg-surface-container-low text-primary border-outline-variant hover:bg-surface-container'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{activeTab === 'archive' ? 'Return Home' : 'Sermon Archive'}</span>
            </button>

            <button 
              onClick={() => setIsGiveModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 transition-all shadow-sm flex items-center space-x-1 border border-secondary/20"
            >
              <Heart className="w-4 h-4 fill-on-secondary-container/10" />
              <span>Give</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            
            /* VIEW 1: COMMUNITY HUB (HOME) */
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-20 pb-24"
            >
              {/* HERO SECTION */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
                <div className="relative rounded-3xl overflow-hidden bg-surface-container-low border border-surface-container shadow-sm min-h-[500px] flex items-center">
                  
                  {/* Hero Background Image overlay */}
                  <div className="absolute inset-0">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgifnEJgVnb2hD_2fZD4AnmsApp4JD8zKGfbwuq5bYIfVX1icUSDFoFtcB3hfgYI0N9uuMCNtMsw4pViavbw-gVweUawr5QdRz8lmeI7ZCtUyQgZQUvH3x8cNKui9ZwT9NPf97roP6MM26SefKwA4eeq_S8j11DweXuSSJwaHNJPnFp6WrlXXy7Z2wPhnEMajfEAJJI3mPNvB9-sCOUbgf3Vq1mmkMf-ptDaS31t7cIKXGP-tfmhxQjkoWUIAX3qQMBOSTGfCT87c" 
                      alt="Majestic Grove Forest" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover brightness-[0.7]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/70 to-transparent" />
                  </div>

                  {/* Hero Content text */}
                  <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-12 text-white space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase font-semibold border border-primary/20">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Welcome to FLP Church</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-white font-sans">
                      Front Line <br />
                      <span className="text-amber-400">People Church</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-stone-200 font-light leading-relaxed">
                      An organic community portal built for spiritual clarity, deep roots, and breathable optimism.
                    </p>

                    {/* Bullet Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="flex items-center space-x-2 bg-stone-900/40 backdrop-blur-sm border border-stone-700/30 rounded-xl px-3 py-2 text-stone-200">
                        <span className="text-lg">🌳</span>
                        <span className="text-xs font-semibold font-sans">Rooted In Truth</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-stone-900/40 backdrop-blur-sm border border-stone-700/30 rounded-xl px-3 py-2 text-stone-200">
                        <span className="text-lg">🕊️</span>
                        <span className="text-xs font-semibold font-sans">Spirit Guided</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-stone-900/40 backdrop-blur-sm border border-stone-700/30 rounded-xl px-3 py-2 text-stone-200">
                        <span className="text-lg">🌱</span>
                        <span className="text-xs font-semibold font-sans">Grove Fellowship</span>
                      </div>
                    </div>

                    {/* Call to Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      
                      {/* Explore Audio button */}
                      <button 
                        onClick={() => setActiveTab('archive')}
                        className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold tracking-wider text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 hover:cursor-pointer"
                      >
                        <span>Listen to Sermons</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* AI Blessing Generator button */}
                      <button 
                        onClick={() => setIsAiModalOpen(true)}
                        className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium text-sm transition-all border border-white/20 hover:border-white/40 flex items-center justify-center space-x-2 hover:cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Pastoral AI Guidance</span>
                      </button>

                    </div>
                  </div>
                </div>
              </section>

              {/* OUR VISION SECTION */}
              <section id="our-vision" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left: Text & Values */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="border-l-4 border-primary pl-4">
                      <p className="text-xs font-mono tracking-widest text-primary uppercase font-bold">The Canopy & Canopy</p>
                      <h2 className="text-3xl font-bold tracking-tight text-on-surface">Our Vision</h2>
                    </div>

                    <p className="text-lg text-on-surface-variant font-light leading-relaxed">
                      At FLP Church, we exist to cultivate a vibrant, resilient grove of believers. We believe in organic growth—spiritual maturity that isn't forced, but nurtured.
                    </p>

                    <p className="text-base text-on-surface-variant leading-relaxed">
                      Our vision is built on the pursuit of <span className="font-semibold text-primary">deep theological roots</span>, communal warmth within our <span className="font-semibold text-secondary">branch canopy</span>, and spreading a joyful, <span className="font-semibold text-primary">breathable optimism</span> to the city around us.
                    </p>

                    {/* Liturgical core principles bento-style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container/60 hover:border-outline-variant transition-all space-y-2">
                        <span className="text-xl">🌳</span>
                        <h4 className="font-bold text-on-surface text-sm">Deep Root Alignment</h4>
                        <p className="text-xs text-on-surface-variant">Finding structural grounding in Scripture, tradition, and honest query.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container/60 hover:border-outline-variant transition-all space-y-2">
                        <span className="text-xl">🌤️</span>
                        <h4 className="font-bold text-on-surface text-sm">Breathable Optimism</h4>
                        <p className="text-xs text-on-surface-variant">Infusing hard seasons with grace, joyful hope, and communal reassurance.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container/60 hover:border-outline-variant transition-all space-y-2">
                        <span className="text-xl">🤝</span>
                        <h4 className="font-bold text-on-surface text-sm">Relational Canopy</h4>
                        <p className="text-xs text-on-surface-variant">Gathering underneath a safe shadow of friendship, vulnerability, and mutual encouragement.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container/60 hover:border-outline-variant transition-all space-y-2">
                        <span className="text-xl">🙌</span>
                        <h4 className="font-bold text-on-surface text-sm">Living Worship</h4>
                        <p className="text-xs text-on-surface-variant">Praising clearly, sharing meals organically, and doing local justice.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Vision Calm Beach Sunset Image */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-md group">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAePF285WGa3_Of9nAwJNq_0N_KVcVMPXSBjOnH9ddiGFll0EwGMQR2knhOg4QEHATbHIYBJhDFKvn2qjdBQoWjJUhM_1GIdiAW20dIoN_dpgRODOWk3dXF-nShcB7RzBS3SKOtkrA9FfWtYzkP-5_rPorJtDdsJjJkdmzF_Uiex3_Q0ebo0YM9A6JwTxBWz6cZuOuqKOds3jYp4C69I6WYHnmlk-eUuiQAnQfr0iDoKfwGmyNyymg0g95SanTeA03iRI88JOGueqM" 
                        alt="Calm Beach Sunset" 
                        referrerPolicy="no-referrer"
                        className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex items-end p-6">
                        <div className="text-white space-y-1">
                          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">Cultivating Clarity</p>
                          <h3 className="text-xl font-bold font-sans">A Haven of Divine Calm</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* MEETINGS & STORY SECTION */}
              <section id="our-story" className="bg-surface-container-low py-16 scroll-mt-24 border-y border-surface-container">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left side beach clearing image */}
                    <div className="lg:col-span-5 order-2 lg:order-1">
                      <div className="relative rounded-3xl overflow-hidden shadow-md group">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWNwtjbq8CEnz8QSKrWK7ks3tULzhIKqrXqloDdDYp-_Lj8Fnn25Zz38rmr0KDO-gKuE-Iulu1E2EQSRJhtQycCYuwSMz0LTTKoHEbz-AMPBOQqpEVsV1plpgiWCKe36O527gC3N6xn9-HSv0P7gU6P90ZjTC7BQ02e-mMyxc_LEGuAGKFxA86DyeqOly76tBUB4QGHqZ2X6j8WELXfQ0HvuLNibS3ot9WQ2dqrXwW8T0kEzmTMbO78sJvBmPPVrgJren10ib06G8" 
                          alt="Forest Clearing" 
                          referrerPolicy="no-referrer"
                          className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex items-end p-6">
                          <div className="text-white space-y-1">
                            <p className="text-xs font-mono uppercase tracking-widest text-amber-400">Weekly Gatherings</p>
                            <h3 className="text-xl font-bold font-sans">Sundays at 10:00 AM</h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side Text */}
                    <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                      <div className="border-l-4 border-secondary pl-4">
                        <p className="text-xs font-mono tracking-widest text-secondary uppercase font-bold text-on-secondary-container">Deep Legacy</p>
                        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Our Story & Gatherings</h2>
                      </div>

                      <p className="text-base text-on-surface-variant leading-relaxed">
                        Planted over a decade ago, Front Line People Church began with a simple gathering in a clean living room. Hungry for genuine expression and deep connection, a few families committed to water spiritual seeds together. 
                      </p>

                      <blockquote className="p-4 rounded-xl border border-outline-variant bg-surface-container-high/40 text-on-surface-variant italic text-sm">
                        "Over the years our branches expanded, reaching into the neighborhood with mutual love. Today, our grove stands tall—a community where organic optimism flows and roots go deep."
                      </blockquote>

                      {/* Meetup Logistics */}
                      <div className="pt-2 space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-secondary/10 text-secondary mt-1">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-on-surface text-sm">Weekly Civic Pavilion Meeting</h5>
                            <p className="text-xs text-on-surface-variant">The Lakeside Grove Pavilion, every Sunday morning starting with coffee.</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-secondary/10 text-secondary mt-1">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-on-surface text-sm">10:00 AM Liturgy & Meal</h5>
                            <p className="text-xs text-on-surface-variant">Praise, sermon discourse, and a shared lunch under our collective canopy subsequent to service.</p>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </section>

              {/* OUR ELDERS SECTION (Hexagons gold frame!) */}
              <section id="our-elders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
                  <p className="text-xs font-mono tracking-widest text-primary uppercase font-bold">Shepherding The Grove</p>
                  <h2 className="text-3xl font-bold tracking-tight text-on-surface">Our Elders</h2>
                  <p className="text-sm text-on-surface-variant">
                    Leadership at FLP Church is collaborative and relational, shepherded by elders dedicated to guiding spiritual roots.
                  </p>
                </div>

                {/* Grid with hexagon avatars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-6">
                  {ELDERS.map((elder) => (
                    <div 
                      key={elder.name} 
                      className="flex flex-col items-center text-center space-y-4 group"
                    >
                      {/* Hexagon Wrapper with Border */}
                      <div className="relative w-48 h-52 flex items-center justify-center">
                        {/* Hex Background Gold Outline */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-primary-container to-secondary hex-clip opacity-90 group-hover:scale-105 transition-transform duration-300 pointer-events-none" />
                        
                        {/* Inner Hex with Image */}
                        <div className="absolute inset-[3px] bg-surface-container hex-clip overflow-hidden">
                          <img 
                            src={elder.imageUrl} 
                            alt={elder.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-center space-x-1.5">
                          <h4 className="font-bold text-on-surface tracking-tight text-lg">{elder.name}</h4>
                          {elder.isLead && (
                            <span className="text-[9px] font-mono font-bold bg-primary-container/23 text-primary-container px-2 py-0.5 rounded-full border border-primary-container/20">Lead</span>
                          )}
                        </div>
                        <p className="text-xs font-mono tracking-wider uppercase text-on-surface-variant">{elder.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* GET INVOLVED (MINISTRIES / VOLUNTEER ACTIONS) */}
              <section id="get-involved" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="bg-surface-container p-8 sm:p-12 rounded-3xl border border-surface-container-highest/80 space-y-8">
                  <div className="max-w-2xl">
                    <p className="text-xs font-mono tracking-widest text-primary uppercase font-bold">Watering One Another</p>
                    <h2 className="text-3xl font-bold tracking-tight text-on-surface mt-1">Get Involved</h2>
                    <p className="text-sm text-on-surface-variant mt-2">
                      Our church thrives when everyone helps tend the field. Find your area of comfort, and click to sign up to volunteer directly.
                    </p>
                  </div>

                  {/* Ministy Bento Grid cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {INVOLVEMENTS.map((inv) => (
                      <div 
                        key={inv.id} 
                        className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high hover:border-outline-variant hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <span className="font-mono text-xs font-bold text-secondary uppercase bg-secondary/10 px-2.5 py-1 rounded-lg inline-block">
                            {inv.id === 'inv-1' ? 'Volunteer' : inv.id === 'inv-2' ? 'Hospitality' : inv.id === 'inv-3' ? 'Child Care' : 'Creative'}
                          </span>
                          <h4 className="font-bold text-on-surface text-base leading-snug">{inv.title}</h4>
                          <p className="text-xs leading-relaxed text-on-surface-variant">{inv.description}</p>
                        </div>

                        <button 
                          onClick={() => setSelectedVolunteer(inv)}
                          className="mt-6 w-full py-2.5 rounded-xl border border-outline-variant hover:border-primary text-xs font-semibold text-primary hover:bg-primary/5 transition-all outline-none hover:cursor-pointer"
                        >
                          Sign Up Today
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* LATEST NEWS & EVENTS SECTION */}
              <section id="latest-news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-surface-container-high pb-4 mb-8">
                  <div className="space-y-2">
                    <p className="text-xs font-mono tracking-widest text-primary uppercase font-bold">Harvest Journal</p>
                    <h2 className="text-3xl font-bold tracking-tight text-on-surface">Latest News & Announcements</h2>
                  </div>
                  <p className="text-sm text-on-surface-variant max-w-sm mt-2 md:mt-0">
                    Keep up to date with picnics, course schedules, and retreat signups in our local community.
                  </p>
                </div>

                {/* News Items Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Side: 2 featured news cards (Picnic & Foundations) */}
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {NEWS_ITEMS.slice(0, 2).map((news) => (
                      <div 
                        key={news.id} 
                        className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-surface-container-high hover:border-outline-variant transition-all hover:shadow-sm"
                      >
                        {/* Image */}
                        <div className="h-48 relative overflow-hidden bg-surface-container">
                          {news.imageUrl ? (
                            <img 
                              src={news.imageUrl} 
                              alt={news.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary-container/20 flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-secondary" />
                            </div>
                          )}
                          <span className="absolute top-4 left-4 text-[10px] font-mono tracking-widest uppercase bg-stone-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                            {news.category}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-3">
                          <div className="flex items-center space-x-1.5 text-xs text-on-surface-variant font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{news.date}</span>
                          </div>
                          <h3 className="text-lg font-bold tracking-tight text-on-surface leading-tight hover:text-primary transition-colors cursor-pointer">
                            {news.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {news.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Side: List layout of rest news */}
                  <div className="lg:col-span-4 bg-surface-container-low border border-surface-container p-6 rounded-3xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-on-surface-variant border-b border-surface-container-high pb-2 block">
                        Quick Mentions
                      </span>

                      <div className="space-y-5 divide-y divide-surface-container-high mt-2">
                        {NEWS_ITEMS.slice(2).map((item) => (
                          <div key={item.id} className="pt-4 first:pt-0 space-y-1 group">
                            <span className="text-[9px] font-mono tracking-wider uppercase text-secondary font-bold block">
                              {item.category} • {item.date}
                            </span>
                            <h4 className="text-sm font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors cursor-pointer">
                              {item.title}
                            </h4>
                            <p className="text-xs text-on-surface-variant font-light line-clamp-2 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => alert("All newsletters and bulletins have been beautifully compiled! To receive these weekly via your local mailing lists, simply join our sign-up sheets at the Pavilion.")}
                      className="mt-6 w-full py-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-container-high text-xs font-semibold text-on-surface-variant border border-outline-variant/50 transition-all hover:cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span>Join Church Newsletter</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </section>

            </motion.div>
          ) : (
            
            /* VIEW 2: AUDIO ARCHIVE */
            <motion.div
              key="archive-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
            >
              
              {/* Back button and headline */}
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-surface-container-high pb-4">
                <div className="space-y-4">
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary hover:text-primary-container transition-all group hover:cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Sanctuary Hub</span>
                  </button>

                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-on-surface">Audio Archive</h1>
                    <p className="text-sm text-on-surface-variant">
                      Dive into a library of Sunday liturgy reflections, theological courses, and special lectures.
                    </p>
                  </div>
                </div>

                {/* Dynamic sorting metrics */}
                <div className="flex items-center space-x-2 mt-4 md:mt-0 font-sans">
                  <span className="text-xs text-on-surface-variant">Sort:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e: any) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="text-xs font-semibold bg-surface-container text-on-surface rounded-xl px-3 py-2 border border-surface-container-high outline-none transition-all focus:border-outline cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="duration">Longest Duration</option>
                  </select>
                </div>
              </div>

              {/* CORE SEARCH & DATABASE FILTER LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side filters (Desktop Sidebar, Card layout on mobile) */}
                <aside className="lg:col-span-3 bg-surface-container-low border border-surface-container p-6 rounded-3xl space-y-6">
                  
                  {/* Headline & Clear */}
                  <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center space-x-1.5">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Search & Filter</span>
                    </span>
                    {(searchQuery || selectedSpeakers.length > 0 || selectedSeries.length > 0) && (
                      <button 
                        onClick={clearAllFilters}
                        className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Filter Option 1: Keyword Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface">Keyword</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Title, speaker, series..."
                        className="w-full text-xs bg-surface-container-lowest border border-surface-container-high rounded-xl pl-9 pr-4 py-2.5 outline-none font-medium focus:border-outline transition-all"
                      />
                    </div>
                  </div>

                  {/* Filter Option 2: Speakers Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface block">Sunday Speaker</label>
                    <div className="space-y-2">
                      {speakers.map((sp) => (
                        <label key={sp} className="flex items-center space-x-3 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedSpeakers.includes(sp)}
                            onChange={() => handleSpeakerToggle(sp)}
                            className="rounded text-primary border-outline-variant focus:ring-primary w-4 h-4"
                          />
                          <span>{sp}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filter Option 3: Biblical Series Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface block">Sermon Series</label>
                    <div className="space-y-2">
                      {seriesList.map((ser) => (
                        <label key={ser} className="flex items-center space-x-3 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={selectedSeries.includes(ser)}
                            onChange={() => handleSeriesToggle(ser)}
                            className="rounded text-primary border-outline-variant focus:ring-primary w-4 h-4"
                          />
                          <span>{ser}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/15 mt-2 space-y-1.5">
                    <h5 className="text-xs font-bold text-primary">Need Inspiration?</h5>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">
                      Enter a verse or concept you heard in the chapel, and let the keyword search locate past weeks dynamically.
                    </p>
                  </div>
                </aside>

                {/* Right side Grid sermons and Pagination */}
                <div className="lg:col-span-9 space-y-6">
                  
                  {/* Grid list container */}
                  {currentSermons.length === 0 ? (
                    <div className="bg-surface-container-low p-12 text-center rounded-3xl border border-dashed border-outline-variant flex flex-col items-center justify-center space-y-3">
                      <div className="text-4xl text-on-surface-variant">😔</div>
                      <h4 className="font-bold text-on-surface">No sermons match this filter</h4>
                      <p className="text-xs text-on-surface-variant max-w-sm">
                        Try adjusting your keyword, choosing another speaker, or resetting the filter fields.
                      </p>
                      <button 
                        onClick={clearAllFilters}
                        className="py-2 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-all mt-2 cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentSermons.map((sermon) => {
                        const isActive = activeSermon?.id === sermon.id;
                        return (
                          <div 
                            key={sermon.id} 
                            style={{ id: `card-${sermon.id}` }}
                            className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-sm ${
                              isActive 
                                ? 'bg-amber-500/10 border-amber-500/30' 
                                : 'bg-surface-container-lowest border-surface-container-high hover:border-outline-variant'
                            }`}
                          >
                            {/* Left: Metadata & Wave decoration */}
                            <div className="flex items-start sm:items-center space-x-4 flex-grow">
                              
                              {/* Audio Image Or Wave Placeholder */}
                              <div className="w-14 h-14 rounded-2xl bg-surface-container flex-shrink-0 overflow-hidden relative flex items-center justify-center border border-surface-container-highest">
                                {sermon.imageUrl !== 'graphic_eq' ? (
                                  <img 
                                    src={sermon.imageUrl} 
                                    alt={sermon.title} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  /* CUSTOM EQ GRAPHIC PLACEHOLDER (Screenshot 3 style!) */
                                  <div className="space-y-0.5 flex flex-col justify-center items-center w-full h-full bg-primary/10">
                                    <div className="flex items-end justify-center space-x-0.5 h-6">
                                      <span className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '50%', animationDelay: '0.1s' }} />
                                      <span className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '90%', animationDelay: '0.3s' }} />
                                      <span className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '30%', animationDelay: '0.5s' }} />
                                      <span className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '70%', animationDelay: '0.2s' }} />
                                      <span className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
                                    </div>
                                    <span className="text-[7px] font-mono tracking-widest uppercase text-primary font-bold">WAVE</span>
                                  </div>
                                )}
                              </div>

                              {/* Title description */}
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-stone-500 bg-surface-container px-2 py-0.5 rounded-full">
                                    {sermon.series}
                                  </span>
                                </div>
                                <h3 className="font-bold text-on-surface leading-snug text-base sm:text-lg">
                                  {sermon.title}
                                </h3>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant font-light">
                                  <span className="flex items-center space-x-1">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{sermon.speaker}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{sermon.date}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{sermon.duration}</span>
                                  </span>
                                </div>
                              </div>

                            </div>

                            {/* Right Action buttons */}
                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                              
                              <button 
                                onClick={() => startPlayingSermon(sermon)}
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                  isActive && isPlaying 
                                    ? 'bg-amber-500 text-stone-900 hover:bg-amber-400' 
                                    : 'bg-primary text-white hover:bg-primary/95'
                                } hover:cursor-pointer`}
                              >
                                {isActive && isPlaying ? (
                                  <Pause className="w-5 h-5 fill-stone-900" />
                                ) : (
                                  <Play className="w-5 h-5 fill-white ml-0.5" />
                                )}
                              </button>

                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination controller */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-surface-container-high pt-5">
                      <span className="text-xs text-on-surface-variant font-light">
                        Showing sermon {idxOfFirstSermon + 1} to {Math.min(idxOfLastSermon, filteredSermons.length)} of {filteredSermons.length} rows
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className={`w-9 h-9 rounded-xl border border-surface-container-high flex items-center justify-center transition-all ${
                            currentPage === 1 
                              ? 'text-on-surface-variant/40 border-surface-container bg-surface-container-low/20' 
                              : 'text-on-surface hover:bg-surface-container hover:cursor-pointer'
                          }`}
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`w-9 h-9 rounded-xl text-xs font-semibold border transition-all ${
                              currentPage === idx + 1 
                                ? 'bg-primary border-primary text-white' 
                                : 'text-on-surface border-surface-container-high hover:bg-surface-container hover:cursor-pointer'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}

                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className={`w-9 h-9 rounded-xl border border-surface-container-high flex items-center justify-center transition-all ${
                            currentPage === totalPages 
                              ? 'text-on-surface-variant/40 border-surface-container bg-surface-container-low/20' 
                              : 'text-on-surface hover:bg-surface-container hover:cursor-pointer'
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* CHURCH FOOTER BRAND */}
      <footer className="bg-surface-container-lowest border-t border-surface-container px-4 py-12 text-on-surface-variant">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLvfrEYHPi4elnnkMCPC2Iuvt4A5lVENQ_yrKUZuEuWa57jtV89ie4DREk6vRvq0FGxvx-DA_V-So3tgOPQzo0iWQ-uz6b7ZXnWbnVM19vkKQnhRbj8INcULajTzMySJPQpgo1vL-FEXVyfGtGyJGVE4KaPRNkCbpuJGdeSZcOhVRi_f8fQhKiQaZkcio3koaODm647sHoLtuRMBXgaWQU5izasdOFY-2Dnv_J3q6Pn-kqXDnRqKPqnJAiM" 
                  alt="FLP Church Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-on-surface text-base">FLP Church</span>
            </div>
            
            <p className="text-xs text-on-surface-variant font-light leading-relaxed">
              We gather as a living grove to grow in depth and shine breathable optimism in our neighborhood. Join us by the shoreline or Civic Pavilion every Sunday.
            </p>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">Sanctuary</h5>
              <div className="flex flex-col space-y-1.5 text-xs text-on-surface-variant font-light">
                <button onClick={() => scrollToSection('our-vision')} className="text-left hover:text-primary transition-colors hover:cursor-pointer">Our Vision</button>
                <button onClick={() => scrollToSection('our-story')} className="text-left hover:text-primary transition-colors hover:cursor-pointer">Meetings & Liturgy</button>
                <button onClick={() => scrollToSection('our-elders')} className="text-left hover:text-primary transition-colors hover:cursor-pointer">Leadership Elders</button>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-mono text-[9px] font-bold uppercase tracking-widest text-secondary">Connection</h5>
              <div className="flex flex-col space-y-1.5 text-xs text-on-surface-variant font-light">
                <button onClick={() => scrollToSection('get-involved')} className="text-left hover:text-secondary transition-colors hover:cursor-pointer">Watering Ministries</button>
                <button onClick={() => scrollToSection('latest-news')} className="text-left hover:text-secondary transition-colors hover:cursor-pointer">Bulletin Board</button>
                <button onClick={() => setActiveTab('archive')} className="text-left hover:text-secondary transition-colors hover:cursor-pointer">Audio Database</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 text-left md:text-right space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-on-surface-variant block pb-1 border-b border-surface-container-high md:border-none">
              Sundays at 10:00 AM
            </span>
            <p className="text-xs font-semibold text-on-surface">The Lakeside Pavilion</p>
            <p className="text-[11px] text-on-surface-variant font-light">Civic Center Grove Shelter, Sector IV</p>
            <p className="text-[10px] text-stone-400 pt-1 font-mono">© 2026 Front Line People Church</p>
          </div>

        </div>
      </footer>

      {/* STICKY AUDIO PLAYBACK PLAYER CONTROLLER BAR */}
      <AnimatePresence>
        {activeSermon && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, type: 'tween' }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t border-stone-800 text-white shadow-xl px-4 py-3 pb-safe"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Left Side: Sermon info details */}
              <div className="flex items-center space-x-3 w-full md:w-[30%]">
                <div className="w-11 h-11 rounded-xl bg-stone-800 flex-shrink-0 overflow-hidden border border-stone-700/55 relative flex items-center justify-center">
                  {activeSermon.imageUrl !== 'graphic_eq' ? (
                    <img 
                      src={activeSermon.imageUrl} 
                      alt={activeSermon.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="space-y-0.5 flex flex-col justify-center items-center w-full h-full bg-amber-500/10">
                      <div className="flex items-end justify-center space-x-0.5 h-5">
                        <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.1s' }} />
                        <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '0.3s' }} />
                        <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: '20%', animationDelay: '0.5s' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-grow">
                  <h4 className="font-bold text-sm tracking-tight truncate text-white">
                    {activeSermon.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-light truncate">
                    {activeSermon.speaker} • <span className="text-amber-400 font-semibold">{activeSermon.series}</span>
                  </p>
                </div>
              </div>

              {/* Middle: Seek timeline and controls */}
              <div className="flex flex-col items-center gap-1 w-full md:w-[45%]">
                <div className="flex items-center space-x-4">
                  
                  {/* Skip backwards 15s */}
                  <button 
                    onClick={() => skipTime(-15)}
                    className="p-1 text-stone-400 hover:text-white transition-all cursor-pointer"
                    title="Rewind 15 seconds"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  {/* PlayPause toggle */}
                  <button 
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-white text-stone-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-stone-900" /> : <Play className="w-4 h-4 fill-stone-900 ml-0.5" />}
                  </button>

                  {/* Skip forwards 15s */}
                  <button 
                    onClick={() => skipTime(15)}
                    className="p-1 text-stone-400 hover:text-white transition-all cursor-pointer"
                    title="Skip 15 seconds"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                </div>

                {/* Progress bar scrub timeline */}
                <div className="flex items-center space-x-2 w-full text-[10px] font-mono text-stone-400">
                  <span>{formatTime(currentTime)}</span>
                  <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:bg-stone-600 outline-none"
                  />
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Side: Volume adjustment and close */}
              <div className="flex items-center justify-end space-x-3 w-full md:w-[25%]">
                <div className="flex items-center space-x-1.5 bg-stone-800/60 px-3 py-1.5 rounded-xl">
                  {/* Speaker trigger */}
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="text-stone-400 hover:text-white cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      setVolume(vol);
                      if (audioRef.current) {
                        audioRef.current.volume = vol;
                      }
                      if (isMuted && vol > 0) setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* Stop & close bar */}
                <button 
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveSermon(null);
                    setCurrentTime(0);
                  }}
                  className="p-1.5 rounded-lg hover:bg-stone-800/80 text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
                  title="Close Sermon Player"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI PASTORAL REFLECTION SLIDER DIALOG MODAL */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            {/* Dialog Panel box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-surface-container-lowest max-w-lg w-full rounded-3xl border border-surface-container-high shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-container-high pb-4 mb-5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                  <div>
                    <h3 className="font-bold text-on-surface text-base">Pastoral Reflection Guidance</h3>
                    <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">FLP Church AI companion</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable container content */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  In seasons where we need spiritual clarity, our scripture guide can help offer pastoral words, scriptural passages, and structured blessings.
                </p>

                {/* Preconfigured Topics */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface">Choose Guidance Vibe</label>
                  <div className="flex flex-wrap gap-2">
                    {['Hope', 'Guidance', 'Peace', 'Strength', 'Gratitude', 'Spiritual Vitality'].map((topic) => (
                      <button 
                        key={topic}
                        onClick={() => { setSelectedAiTopic(topic); setCustomRequest(''); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:cursor-pointer ${
                          selectedAiTopic === topic && !customRequest
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-surface-container text-on-surface-variant border-surface-container-high hover:bg-surface-container-high'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom prayer textbox */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                    <label>Or input custom heart details / prayer needs</label>
                    <span className="text-[10px] text-on-surface-variant font-normal">Optional</span>
                  </div>
                  <textarea 
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    placeholder="E.g., I am feeling anxious about job interviews next week..."
                    rows={2}
                    className="w-full text-xs bg-surface-container border border-surface-container-high rounded-2xl p-3 outline-none font-medium focus:border-outline focus:bg-surface-container-lowest transition-all"
                  />
                </div>

                {/* Actions submit buttons */}
                <button 
                  disabled={aiLoading}
                  onClick={submitAiRequest}
                  className={`w-full py-3 rounded-2xl font-bold tracking-wide text-xs transition-all flex items-center justify-center space-x-2 select-none hover:cursor-pointer ${
                    aiLoading 
                      ? 'bg-surface-container-highest text-on-surface-variant/40 border border-surface-container-high cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primary/95 border border-primary shadow-sm'
                  }`}
                >
                  {aiLoading ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <span className="text-xs">Sifting Scripture Grove...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Generate Scriptural Comfort</span>
                    </>
                  )}
                </button>

                {/* Display Error if any */}
                {aiError && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-primary border border-amber-500/20 text-xs leading-relaxed">
                    {aiError}
                  </div>
                )}

                {/* Render generated pastoral response output */}
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-amber-500/5 text-on-surface leading-loose text-xs border border-amber-500/15 relative space-y-4 shadow-inner"
                  >
                    <span className="absolute top-3 right-3 text-[10px] font-mono tracking-widest font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">Reflected</span>
                    
                    {/* Render paragraphs correctly */}
                    <div className="whitespace-pre-line font-light text-on-surface-variant leading-relaxed">
                      {aiResponse}
                    </div>

                    <div className="border-t border-amber-500/10 pt-3 flex items-center justify-between text-[10px] font-mono font-bold text-primary">
                      <span>FLP PASTORY OFFICE</span>
                      <span>PASTOR CO-PILOT</span>
                    </div>
                  </motion.div>
                )}

              </div>
              
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* DETAILED INTERACTIVE SIGN-UP TO VOLUNTEER DIALOG */}
      <AnimatePresence>
        {selectedVolunteer && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVolunteer(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-surface-container-lowest max-w-md w-full rounded-3xl border border-surface-container-high shadow-2xl p-6"
            >
              
              <div className="flex items-center justify-between border-b border-surface-container-high pb-4 mb-5">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Ministry Joining Intake</h3>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">{selectedVolunteer.title}</p>
                </div>

                <button 
                  onClick={() => setSelectedVolunteer(null)}
                  className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {volunteerSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <span className="text-4xl text-emerald-500">🎉</span>
                  <h4 className="font-bold text-on-surface">Thank you! Welcome aboard</h4>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                    We've registered your hand! Titus or an activity team leader will contact you in a few days with logistics details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={volunteerForm.name}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full text-xs bg-surface-container border border-surface-container-high rounded-xl p-3 outline-none focus:border-outline focus:bg-surface-container-lowest"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={volunteerForm.email}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full text-xs bg-surface-container border border-surface-container-high rounded-xl p-3 outline-none focus:border-outline focus:bg-surface-container-lowest"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Spiritual Interests</label>
                    <textarea 
                      value={volunteerForm.message}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, message: e.target.value })}
                      placeholder="Tell us why you want to water this team, or past background experiences..."
                      rows={3}
                      className="w-full text-xs bg-surface-container border border-surface-container-high rounded-xl p-3 outline-none focus:border-outline focus:bg-surface-container-lowest"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-secondary text-white font-bold text-xs hover:bg-secondary/95 transition-all outline-none hover:cursor-pointer"
                  >
                    Commit My Help
                  </button>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE DONATION / TITHES GIVING DIALOG */}
      <AnimatePresence>
        {isGiveModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGiveModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.18 }}
              className="relative bg-surface-container-lowest max-w-md w-full rounded-3xl border border-surface-container-high shadow-2xl p-6"
            >
              
              <div className="flex items-center justify-between border-b border-surface-container-high pb-4 mb-5">
                <div>
                  <h3 className="font-bold text-on-surface text-base">Tithing & Stream Support</h3>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">FLP Church Stewardship</p>
                </div>

                <button 
                  onClick={() => setIsGiveModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {donationSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <span className="text-4xl">🙏💖</span>
                  <h4 className="font-bold text-on-surface">Thank you! Transaction Completed</h4>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                    Your generous support of ${customGiveAmount || giveAmount} has been processed successfully. Your support helps expand our canopy and audio recordings!
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Supporting FLP Church aids us with lakeside platform fees, audio engineering equipment, and picnic blankets for hospitality.
                  </p>

                  {giveStep === 1 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        {['15', '50', '100', '250'].map((amount) => (
                          <button 
                            key={amount}
                            onClick={() => { setGiveAmount(amount); setCustomGiveAmount(''); }}
                            className={`py-3.5 rounded-xl text-sm font-bold border transition-all hover:cursor-pointer ${
                              giveAmount === amount && !customGiveAmount 
                                ? 'bg-primary border-primary text-white' 
                                : 'bg-surface-container border-surface-container-high text-on-surface hover:bg-surface-container-high'
                            }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface">Or custom contribution amount ($)</label>
                        <input 
                          type="number" 
                          placeholder="Other amount"
                          value={customGiveAmount}
                          onChange={(e) => { setCustomGiveAmount(e.target.value); setGiveAmount(''); }}
                          className="w-full text-xs bg-surface-container border border-surface-container-high rounded-xl p-3 outline-none focus:border-outline focus:bg-surface-container-lowest"
                        />
                      </div>

                      <button 
                        onClick={() => setGiveStep(2)}
                        className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary/95 transition-all outline-none"
                      >
                        Proceed to payment details
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDonationSubmit} className="space-y-4">
                      
                      <div className="bg-surface-container p-3 rounded-xl border border-surface-container-highest/80 flex justify-between items-center text-xs">
                        <span className="text-on-surface-variant font-light">Supporting:</span>
                        <span className="font-bold text-primary">${customGiveAmount || giveAmount} USD</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface">Cardholder Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Your name"
                          className="w-full text-xs bg-surface-container border border-surface-container-high rounded-xl p-3 outline-none focus:border-outline focus:bg-surface-container-lowest"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-bold text-on-surface">Card Number</label>
                          <input 
                            type="text" 
                            required
                            placeholder="4000 1234 5678 9010"
                            className="w-full text-xs bg-surface-container border border-surface-container-high rounded-xl p-3 outline-none focus:border-outline focus:bg-surface-container-lowest text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-on-surface">CVC</label>
                          <input 
                            type="text" 
                            required
                            placeholder="123"
                            maxLength={3}
                            className="w-full text-xs bg-surface-container border border-surface-container-high rounded-xl p-3 outline-none focus:border-outline focus:bg-surface-container-lowest text-center"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          type="button"
                          onClick={() => setGiveStep(1)}
                          className="py-3 px-4 rounded-2xl border border-outline-variant text-xs font-semibold hover:bg-surface-container-high transition-all"
                        >
                          Modify $
                        </button>
                        <button 
                          type="submit"
                          className="flex-grow py-3 rounded-2xl bg-secondary text-white font-bold text-xs hover:bg-secondary/95 transition-all outline-none"
                        >
                          Submit Tithe Offer
                        </button>
                      </div>

                    </form>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
