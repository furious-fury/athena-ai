import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { shortenText } from "@/utils"

function Positions({ markets, isLoading, isError }: { markets: any, isLoading: boolean, isError: boolean }) {
    return (
        <div className="w-2/5 mx-auto outline-1 outline-muted-foreground rounded-sm p-8 text-muted-foreground">
            <h1 className='text-2xl font-bold text-muted-foreground text-center mb-8'>Positions</h1>
            <Tabs defaultValue="gpt5">
                <TabsList className="w-full gap-x-5 bg-slate-300/20 rounded-sm">
                    <TabsTrigger value="gpt5" className="data-[state=active]:bg-white/10 text-white">GPT-5</TabsTrigger>
                    <TabsTrigger value="grok4" className="data-[state=active]:bg-white/10 text-white">Grok-4</TabsTrigger>
                    <TabsTrigger value="claude" className="data-[state=active]:bg-white/10 text-white">Claude</TabsTrigger>
                </TabsList>
                <TabsContent value='gpt5'>
                    <div className='mx-auto p-5'>
                        <ul>
                            {
                                isLoading ? (
                                    <li>Loading...</li>
                                ) : isError ? (
                                    <li>Error loading markets</li>
                                ) : markets?.slice(0, 3)?.map((market: any) => (
                                    <li key={market.id} className="my-3 border-b-2 border-muted-foreground">
                                        <h3 className="text-xl font-bold">{market.question}</h3>
                                        <p className="text-sm">{shortenText(market.description, 100)}</p>
                                        <div className="position flex justify-between items-center flex-wrap gap-2 p-2 ">
                                            <div className="">
                                                <p className="text-xs">AVG ENTRY / MARK</p>
                                                <p className="font-bold text-base">$0.265 / $0.965</p>
                                            </div>
                                            <div className="">
                                                <p className="text-xs">UNREALIZED PNL</p>
                                                <p className="font-bold text-base text-green-500">+$400 (+300%)</p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </TabsContent>
                <TabsContent value='grok4'>
                    <div className='mx-auto p-5'>
                        <ul>
                            {
                                isLoading ? (
                                    <li>Loading...</li>
                                ) : isError ? (
                                    <li>Error loading markets</li>
                                ) : markets?.slice(0, 3)?.map((market: any) => (
                                    <li key={market.id} className="my-3 border-b-2 border-muted-foreground">
                                        <h3 className="text-xl font-bold">{market.question}</h3>
                                        <p className="text-sm">{shortenText(market.description, 100)}</p>
                                        <div className="position flex justify-between items-center flex-wrap gap-2 p-2 ">
                                            <div className="">
                                                <p className="text-xs">AVG ENTRY / MARK</p>
                                                <p className="font-bold text-base">$0.265 / $0.965</p>
                                            </div>
                                            <div className="">
                                                <p className="text-xs">UNREALIZED PNL</p>
                                                <p className="font-bold text-base text-green-500">+$400 (+300%)</p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </TabsContent>
                <TabsContent value='claude'>
                    <div className=' mx-auto p-5'>
                        <div className="w-full">
                            <ul>
                                {
                                    isLoading ? (
                                        <li>Loading...</li>
                                    ) : isError ? (
                                        <li>Error loading markets</li>
                                    ) : markets?.slice(0, 3)?.map((market: any) => (
                                        <li key={market.id} className="my-3 border-b-2 border-muted-foreground">
                                            <h3 className="text-xl font-bold">{market.question}</h3>
                                            <p className="text-sm">{shortenText(market.description, 100)}</p>
                                            <div className="position flex justify-between items-center flex-wrap gap-2 p-2 ">
                                                <div className="">
                                                    <p className="text-xs">AVG ENTRY / MARK</p>
                                                    <p className="font-bold text-base">$0.265 / $0.965</p>
                                                </div>
                                                <div className="">
                                                    <p className="text-xs">UNREALIZED PNL</p>
                                                    <p className="font-bold text-base text-green-500">+$400 (+300%)</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Positions