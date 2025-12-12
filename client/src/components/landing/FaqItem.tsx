interface FaqItemProps {
    question: string;
    answer: string;
}

export function FaqItem({ question, answer }: FaqItemProps) {
    return (
        <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">{question}</h3>
            <p className="text-gray-400">{answer}</p>
        </div>
    );
}
