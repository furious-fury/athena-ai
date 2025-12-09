import { useState } from "react";
import Header from "./Header";
import {
    LayoutDashboard,
    Bot,
    CandlestickChart,
    Wallet,
    Settings,
    Menu,
    X
} from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
    activeTab?: string;
    setActiveTab?: (tab: 'dashboard' | 'agents' | 'markets' | 'wallet' | 'settings') => void;
}

function Layout({ children, activeTab = 'dashboard', setActiveTab }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'agents', label: 'Agents', icon: Bot },
        { id: 'markets', label: 'Markets', icon: CandlestickChart },
        { id: 'wallet', label: 'Wallet', icon: Wallet },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleTabClick = (id: string) => {
        setActiveTab?.(id as any);
        setIsMobileMenuOpen(false); // Close menu on selection
    };

    return (
        <div className="flex h-screen bg-main text-text-primary font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-panel flex flex-col transition-transform duration-300 ease-in-out border-r border-white/5
                md:relative md:translate-x-0 md:flex
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-purple-500/20' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold bg-linear-to-b from-accent to-purple-500 bg-clip-text text-transparent">
                        Athena AI
                    </h1>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-white'}`} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(58,123,255,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header */}
                <header className="p-5 bg-panel/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden md:block">
                            <h2 className="text-lg font-semibold text-text-primary capitalize">
                                {activeTab}
                            </h2>
                        </div>
                        {/* Mobile Title if sidebar is closed/hidden */}
                        <div className="md:hidden">
                            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
                                Athena
                            </h2>
                        </div>
                    </div>
                    <div>
                        <Header /> {/* Reuse existing Header component for Wallet Button */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-main p-4 md:p-6 scroll-smooth w-full">
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Layout;