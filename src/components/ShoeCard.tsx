import React from 'react';
import { Shoe } from '@/types/shoe';
import { Heart, Target, Rocket, Flame, Leaf, Mountain } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'Daily Trainer': <Target className="w-5 h-5" />,
  'Race Day/Carbon': <Rocket className="w-5 h-5" />,
  'Tempo/Interval': <Flame className="w-5 h-5" />,
  'Recovery': <Leaf className="w-5 h-5" />,
  'Trail': <Mountain className="w-5 h-5" />,
};

function ProgressBar({ label, score, color }: { label: string; score: number; color: string }) {
  const percentage = Math.min(100, Math.max(0, (score / 5) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-zinc-400 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-zinc-200 font-bold">{score.toFixed(1)} / 5.0</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ShoeImage({ shoe, className = "" }: { shoe: Shoe; className?: string }) {
  let src = shoe.image;
  if (!src) src = '/images/placeholder.jpg';
  else if (!src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
  
  return (
    <img
      src={src}
      className={`object-contain flex-shrink-0 ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjcyNzJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNTE1MTU0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
      }}
      alt={shoe.model}
    />
  );
}

export function ShoeCard({
  shoe,
  score,
  rank,
  expanded,
  onToggle,
  onLike,
}: {
  shoe: Shoe;
  score?: number;
  rank?: number;
  expanded: boolean;
  onToggle: () => void;
  onLike: () => void;
}) {
  return (
    <div
      style={rank ? { animationDelay: `${(rank % 10) * 0.1}s` } : {}}
      className={`group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer animate-fade-up hover:border-zinc-600 ${
        expanded ? "ring-1 ring-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "hover:shadow-xl hover:-translate-y-1"
      }`}
      onClick={onToggle}
    >
      <div className="relative bg-zinc-950 p-6 flex items-center justify-center h-56 overflow-hidden">
        {rank !== undefined && rank <= 3 && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-cyan-900/20 to-transparent" />
        )}
        
        {rank && (
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-md tracking-wider">
            RANK {rank}
          </div>
        )}
        {score !== undefined && (
          <div className="absolute top-3 right-3 bg-zinc-800 border border-zinc-700 text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wider">
            SCORE {score.toFixed(0)}
          </div>
        )}
        <ShoeImage shoe={shoe} className="w-full max-h-40 drop-shadow-lg transition-transform duration-500 group-hover:scale-105" />
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div>
            <div className="text-xs text-zinc-500 font-semibold tracking-wide uppercase mb-0.5">{shoe.brand}</div>
            <h3 className="font-extrabold text-lg text-zinc-100 leading-tight">
              {shoe.model}
            </h3>
          </div>
          <span className="shrink-0 flex items-center justify-center px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md font-medium">
            {TYPE_ICONS[shoe.type] ? React.cloneElement(TYPE_ICONS[shoe.type] as React.ReactElement<any>, { className: "w-4 h-4" }) : <Target className="w-4 h-4" />}
          </span>
        </div>
        <p className="text-sm text-zinc-400 line-clamp-2 mt-2 leading-relaxed h-10">{shoe.one_liner}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs px-2 py-1 rounded text-zinc-400 bg-black border border-zinc-800 hidden sm:inline-block">⭐ {shoe.rating}</span>
          <span className="text-xs px-2 py-1 rounded text-zinc-400 bg-black border border-zinc-800">${shoe.price_usd}</span>
          <span className="text-xs px-2 py-1 rounded text-zinc-400 bg-black border border-zinc-800">{shoe.weight_g}g</span>
          <span className="text-xs px-2 py-1 rounded text-cyan-400 bg-black border border-cyan-900/50">{shoe.release_year}</span>
        </div>

        <div className="mt-4 flex items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className="group flex flex-row items-center gap-1.5 p-1 -ml-1"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-zinc-900 group-hover:fill-rose-500 transition-all duration-300 transform group-hover:scale-125" />
              <span className="text-xs font-bold text-zinc-500 group-hover:text-rose-400">{shoe.likes}</span>
            </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96 opacity-100 mt-5 pt-5 border-t border-zinc-800' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-5">
            <div><span className="text-zinc-600">Drop</span> <span className="text-zinc-200 ml-1 font-medium">{shoe.drop_mm}mm</span></div>
            <div><span className="text-zinc-600">Stack</span> <span className="text-zinc-200 ml-1 font-medium">{shoe.stack_height_mm}mm</span></div>
            <div><span className="text-zinc-600">Reviews</span> <span className="text-zinc-200 ml-1 font-medium">{shoe.review_count?.toLocaleString()}</span></div>
            <div><span className="text-zinc-600">Updated</span> <span className="text-zinc-200 ml-1 font-medium">{shoe.updated}</span></div>
          </div>
          <div className="space-y-4">
            <ProgressBar label="Pace" score={shoe.pace_score} color="from-rose-500 to-orange-500" />
            <ProgressBar label="Cushion" score={shoe.cushion_score} color="from-cyan-400 to-blue-500" />
            <ProgressBar label="Mileage" score={shoe.mileage_score} color="from-emerald-400 to-teal-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
