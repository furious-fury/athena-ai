import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Globe, Coins, DollarSign, Activity, Bitcoin } from 'lucide-react';
import { TickerCard } from '../components/landing/TickerCard';
import { TrustSection } from '../components/landing/TrustSection';
import { SolutionsSection } from '../components/landing/SolutionsSection';
import { RoadmapSection } from '../components/landing/RoadmapSection';
import { FaqSection } from '../components/landing/FaqSection';
import { FadeIn } from '../components/FadeIn';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-main text-white font-sans selection:bg-accent/30 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/5 bg-main/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4">
                    <a href="#" className="w-1/3 md:w-1/5">
                        <img src="logo.png" alt="" />
                    </a>
                    <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                        <button
                            onClick={() => navigate('/trade')}
                            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-hidden focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2 text-center mr-2 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Launch App
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-visible">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
                    <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] opacity-30" />
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <FadeIn delay={0.1}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            AI-Powered Agentic Trading Platform
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                            Autonomous Trading <br />
                            <span className=" bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">Driven by Intelligence.</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 leading-relaxed">
                            Deploy AI agents that analyze real-time news, execute trades on Polymarket, and manage risk 24/7.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <div className="flex justify-center mb-24">
                            <button
                                onClick={() => navigate('/trade')}
                                className="relative group px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-bold transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Trading Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        </div>
                    </FadeIn>

                    {/* Floating 3D Elements (Visual Decoration) */}
                    <FadeIn delay={0.6} direction="left" className="absolute top-[20%] left-[5%] animate-bounce duration-3000 opacity-60 hidden xl:block z-0">
                        <div className="w-24 h-24 bg-linear-to-br from-blue-500/20 to-transparent backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center transform rotate-12">
                            <Bot className="w-12 h-12 text-blue-400" />
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.7} direction="right" className="absolute bottom-[20%] right-[10%] animate-bounce duration-4000 opacity-60 hidden xl:block z-0">
                        <div className="w-20 h-20 bg-linear-to-br from-purple-500/20 to-transparent backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center transform -rotate-12">
                            <DollarSign className="w-10 h-10 text-purple-400" />
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.8} direction="right" className="absolute top-[40%] right-[15%] animate-bounce duration-5000 opacity-50 hidden xl:block z-0">
                        <div className="w-16 h-16 bg-linear-to-br from-orange-500/20 to-transparent backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center transform rotate-6">
                            <Bitcoin className="w-8 h-8 text-orange-400" />
                        </div>
                    </FadeIn>

                    {/* Overlapping Stats/Ticker Cards */}
                    <FadeIn delay={0.5}>
                        <div className="relative md:-mb-36 z-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto transform translate-y-12">
                            <TickerCard
                                icon={<Coins className="text-yellow-400" />}
                                label="Total Volume"
                                value="$12.5M+"
                                trend="+14% this week"
                            />
                            <TickerCard
                                icon={<Activity className="text-green-400" />}
                                label="Active Agents"
                                value="1,240"
                                trend="Live Now"
                            />
                            <TickerCard
                                icon={<Globe className="text-blue-400" />}
                                label="Markets Scanned"
                                value="450+"
                                trend="Polymarket & More"
                            />
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* News Sources Ticker (Brand Authority) */}
            <FadeIn delay={0.2}>
                <section className="py-10 mt-32 border-y border-white/5 bg-black/20 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 text-center mb-6">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Trusted Data Sources</p>
                    </div>
                    <div className="relative flex overflow-x-hidden group">
                        <div className="animate-marquee whitespace-nowrap flex space-x-12 items-center">
                            {["Bloomberg", "Reuters", "CoinDesk", "TechCrunch", "The Verge", "CNBC", "Decrypt", "The Block", "Bitcoin Magazine", "Wired", "Ars Technica", "Politico", "Al Jazeera", "NYT Politics"].map((source) => (
                                <span key={source} className="text-xl font-bold text-gray-700 mx-4 uppercase tracking-widest">{source}</span>
                            ))}
                        </div>
                        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex space-x-12 items-center">
                            {["Bloomberg", "Reuters", "CoinDesk", "TechCrunch", "The Verge", "CNBC", "Decrypt", "The Block", "Bitcoin Magazine", "Wired", "Ars Technica", "Politico", "Al Jazeera", "NYT Politics"].map((source) => (
                                <span key={source} className="text-xl font-bold text-gray-700 mx-4 uppercase tracking-widest">{source}</span>
                            ))}
                        </div>
                    </div>
                </section>
            </FadeIn>

            <FadeIn>
                <TrustSection />
            </FadeIn>

            <FadeIn>
                <SolutionsSection />
            </FadeIn>

            <FadeIn>
                <RoadmapSection />
            </FadeIn>

            <FadeIn>
                <FaqSection />
            </FadeIn>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 bg-black/40">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Athena AI. All rights reserved.</p>
                    <div className="mt-4 flex justify-center gap-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="https://x.com/AthennaAI" target="_blank" className="hover:text-white transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
