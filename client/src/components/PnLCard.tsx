import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PnLCardProps {
    data: {
        marketTitle: string;
        outcome: string;
        pnl: number;
        pnlPercent: number; // e.g. 1789.56
        bought: number;
        position: number;
        side?: string;
    };
}

export function PnLCard({ data }: PnLCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const downloadImage = useCallback(async () => {
        if (!cardRef.current) return;
        try {
            // First attempt: try capturing everything including fonts
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            triggerDownload(dataUrl);
        } catch (err) {
            console.error("Failed to generate image with fonts, retrying without...", err);
            try {
                // Second attempt: skip fonts if CORS/SecurityError occurs
                const dataUrl = await toPng(cardRef.current, {
                    cacheBust: true,
                    pixelRatio: 2,
                    skipFonts: true
                });
                triggerDownload(dataUrl);
            } catch (retryErr) {
                console.error("Failed to generate image fallback", retryErr);
                alert("Failed to generate image. Please checking your browser console.");
            }
        }
    }, [cardRef]);

    const triggerDownload = (dataUrl: string) => {
        const link = document.createElement("a");
        link.download = `athena-pnl-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    };

    const isProfit = data.pnl >= 0;
    const pnlSign = isProfit ? "+" : "";
    const pnlColor = isProfit ? "text-[#00FF00]" : "text-red-500";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-white hover:bg-blue-500/20">
                    <Share2 size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none shadow-none max-w-2xl w-full p-0 flex flex-col items-center">
                <DialogTitle className="sr-only">PnL Card</DialogTitle>
                <DialogDescription className="sr-only">
                    Shareable card showing your Profit and Loss for {data.marketTitle}
                </DialogDescription>
                {/* Close Button */}
                <DialogClose className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm cursor-pointer hover:shadow-lg">
                    <X size={20} />
                </DialogClose>

                {/* Visual Card Container */}
                <div
                    ref={cardRef}
                    className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10"
                >
                    {/* Background Image */}
                    <img
                        src="/spartan-background.png"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-linear-to-r from-blue-900/80 via-blue-900/40 to-transparent mix-blend-multiply" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20" />

                    {/* Content Layer */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between font-orbitron z-10">
                        {/* Top Row: Logo */}
                        <div className="flex justify-end">
                            <img src="/athena-logo.jpg" alt="Athena Logo" className="h-12 w-auto rounded-full border-2 border-white/20 shadow-lg" />
                        </div>

                        {/* Middle: Main PnL */}
                        <div className="mt-8 relative">
                            {/* Glass strip behind number */}
                            <div className="absolute -left-8 right-0 top-1/2 -translate-y-1/2 h-24 bg-blue-500/30 backdrop-blur-md border-y border-white/10" />

                            <div className="relative pl-6 flex items-center gap-4">
                                <div className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,255,0,0.5)] flex items-center gap-2">
                                    <span className="text-3xl opacity-80">$</span>
                                    <span className={pnlColor}>
                                        {pnlSign}{data.pnl.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Stats Grid */}
                        <div className="mt-auto grid grid-cols-2 gap-x-12 gap-y-2 text-white/90">
                            {/* Left Col */}
                            <div>
                                <div className="text-lg font-bold tracking-widest text-white/70 uppercase mb-1">PNL</div>
                                <div className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                                    {pnlSign}{data.pnlPercent.toFixed(2)}%
                                </div>
                            </div>

                            {/* Right Col / Details */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center border-b border-white/20 pb-1 mb-1">
                                    <span className="font-bold tracking-widest text-white/70 uppercase text-sm">BOUGHT</span>
                                    <span className="font-mono text-xl text-white">$ {data.bought.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold tracking-widest text-white/70 uppercase text-sm">POSITION</span>
                                    <span className="font-mono text-xl text-white">$ {data.position.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Context */}
                        <div className="absolute bottom-4 left-8 text-xs text-white/40 uppercase tracking-widest max-w-[60%] truncate">
                            {data.marketTitle} • {data.outcome}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-4">
                    <Button onClick={downloadImage} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 rounded-full px-6 shadow-lg shadow-blue-500/20">
                        <Download size={18} /> Download Image
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
