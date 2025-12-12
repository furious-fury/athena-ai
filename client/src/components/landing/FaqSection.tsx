import { FaqItem } from './FaqItem';

export function FaqSection() {
    return (
        <section className="py-24 bg-black/20 border-t border-white/5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-400">Common questions about trading with Athena AI.</p>
                </div>

                <div className="space-y-4">
                    <FaqItem
                        question="Is my fund safe?"
                        answer="Yes. Athena is non-custodial. We never hold your funds. You deposit directly into your own smart contract wallet that only you control."
                    />
                    <FaqItem
                        question="How do the agents work?"
                        answer="Agents monitor news and market data 24/7. When they detect a high-confidence opportunity, they execute a trade within your set risk limits."
                    />
                    <FaqItem
                        question="Can I customize the strategies?"
                        answer="Currently in Beta, you can select from pre-defined agent personas (Conservative, Aggressive, etc.) or create your semi-custom agent. Full custom scripting is coming in Phase 2."
                    />
                    <FaqItem
                        question="What markets are supported?"
                        answer="We currently support all prediction markets on Polymarket. Future updates will include other prediction platforms."
                    />
                </div>
            </div>
        </section>
    );
}
