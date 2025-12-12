
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-main flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-8 relative">
                <h1 className="text-9xl font-black text-white/5">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold bg-linear-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                        Lost in Space?
                    </span>
                </div>
            </div>

            <p className="text-gray-400 max-w-md mb-8 text-lg">
                The page you are looking for doesn't exist or has been moved to another dimension.
            </p>

            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-blue-600 rounded-full font-medium transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-1"
            >
                <Home size={20} />
                Return Home
            </button>
        </div>
    );
}

export default NotFound;
