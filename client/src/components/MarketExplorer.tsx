import { useState } from "react";
import { useGetMarkets } from "../lib/index";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function MarketExplorer() {
    // Fetch top 100 markets
    const { data: markets, isLoading } = useGetMarkets(100);
    const [filterText, setFilterText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("VOLUME_DESC");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Extract unique categories for filter
    const categories = ["ALL", ...Array.from(new Set(markets?.map((m: any) => m.category || "Uncategorized"))).sort()] as string[];

    // 1. Filter
    const filteredMarkets = markets?.filter((m: any) => {
        const matchesSearch = m.question.toLowerCase().includes(filterText.toLowerCase());
        const matchesCategory = categoryFilter === "ALL" || m.category === categoryFilter;
        return matchesSearch && matchesCategory;
    }) || [];

    // 2. Sort
    const sortedMarkets = [...filteredMarkets].sort((a: any, b: any) => {
        if (sortBy === "VOLUME_DESC") return Number(b.volume) - Number(a.volume);
        if (sortBy === "PROB_DESC") return Number(b.probability) - Number(a.probability);
        if (sortBy === "PROB_ASC") return Number(a.probability) - Number(b.probability);
        return 0;
    });

    // 3. Paginate
    const totalPages = Math.ceil(sortedMarkets.length / ITEMS_PER_PAGE);
    const paginatedMarkets = sortedMarkets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Market Explorer</h2>
                    <p className="text-text-secondary text-sm">Discover and analyze active prediction markets.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search markets..."
                            className="bg-panel border-transparent pl-9 text-white focus-visible:ring-1 focus-visible:ring-primary placeholder:text-gray-600"
                            value={filterText}
                            onChange={(e) => {
                                setFilterText(e.target.value);
                                setCurrentPage(1); // Reset to page 1 on search
                            }}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-[160px] bg-panel border-transparent rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat} className="bg-panel text-white">
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-[180px] bg-panel border-transparent rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="VOLUME_DESC" className="bg-panel text-white">🔥 Highest Volume</option>
                        <option value="PROB_DESC" className="bg-panel text-white">📈 High Probability</option>
                        <option value="PROB_ASC" className="bg-panel text-white">📉 Low Probability</option>
                    </select>
                </div>
            </div>

            <Card className="bg-panel p-3 border-transparent overflow-hidden shadow-none">
                <Table>
                    <TableHeader className="bg-transparent">
                        <TableRow className="border-b border-white/5 hover:bg-transparent">
                            <TableHead className="w-[80px] text-white/60 font-bold uppercase tracking-wider text-base border-r border-white/5">Image</TableHead>
                            <TableHead className="min-w-[300px] text-white/60 font-bold uppercase tracking-wider text-base border-r border-white/5">Market Question</TableHead>
                            <TableHead className="text-white/60 font-bold uppercase tracking-wider text-base border-r border-white/5">Category</TableHead>
                            <TableHead className="text-right text-white/60 font-bold uppercase tracking-wider text-base border-r border-white/5">Volume (24h)</TableHead>
                            <TableHead className="text-right text-white/60 font-bold uppercase tracking-wider text-base border-r border-white/5">Probability</TableHead>
                            <TableHead className="text-right text-white/60 font-bold uppercase tracking-wider text-base">End Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={6} className="h-24 text-center text-text-secondary">
                                    Loading markets...
                                </TableCell>
                            </TableRow>
                        ) : paginatedMarkets.length > 0 ? (
                            paginatedMarkets.map((market: any) => (
                                <TableRow key={market.id} className="border-none even:bg-white/5 hover:bg-white/10 transition-colors">
                                    <TableCell className="border-r border-white/5">
                                        <img
                                            src={market.image}
                                            alt="Market"
                                            className="w-10 h-10 rounded-md object-cover bg-gray-800"
                                            onError={(e) => (e.currentTarget.src = "https://polymarket.com/images/fallback.png")}
                                        />
                                    </TableCell>
                                    <TableCell className="border-r border-white/5">
                                        <p className="font-medium text-white line-clamp-2 text-base" title={market.question}>
                                            {market.question}
                                        </p>
                                    </TableCell>
                                    <TableCell className="border-r border-white/5">
                                        <span className="px-2 py-1 rounded text-xs bg-accent/10 text-accent font-bold uppercase tracking-wider">
                                            {market.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-gray-300 font-medium border-r border-white/5">
                                        ${Number(market.volume).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </TableCell>
                                    <TableCell className="text-right border-r border-white/5">
                                        <span className="font-bold text-green-400 text-lg">
                                            {(Number(market.probability) * 100).toFixed(0)}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-text-secondary text-xs font-mono">
                                        {market.endDate ? new Date(market.endDate).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-text-secondary">
                                    No markets found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                {/* Pagination Controls */}
                {!isLoading && sortedMarkets.length > 0 && (
                    <div className="flex justify-center items-center mt-6 gap-2">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-black/20 text-white rounded hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            First
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-black/20 text-white rounded hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Previous
                        </button>

                        <div className="flex gap-1">
                            {(() => {
                                let startPage = Math.max(1, currentPage - 4);
                                const endPage = Math.min(totalPages, startPage + 9);

                                if (endPage - startPage < 9) {
                                    startPage = Math.max(1, endPage - 9);
                                }

                                return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-8 h-8 rounded text-xs font-medium transition-colors ${currentPage === page
                                            ? "bg-primary text-white"
                                            : "bg-black/20 text-text-secondary hover:bg-black/30 hover:text-white"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ));
                            })()}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-black/20 text-white rounded hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-black/20 text-white rounded hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Last
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
}
