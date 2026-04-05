"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Shoe, UserPreferences, SHOE_TYPES, TYPE_LABELS, resolveImagePath } from "@/types/shoe";
import { recommendShoes } from "@/lib/recommender";
import { ShoeCard } from "@/components/ShoeCard";
import { 
  Infinity, Target, Rocket, Flame, Leaf, Mountain,
  Zap, Scale, Cloud, Footprints, Activity, 
  SignalLow, SignalMedium, SignalHigh,
  Coins, Banknote, Crown, Sparkles, ChevronDown, Heart, Calendar, Archive, Search
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'Daily Trainer': <Target className="w-5 h-5" />,
  'Race Day/Carbon': <Rocket className="w-5 h-5" />,
  'Tempo/Interval': <Flame className="w-5 h-5" />,
  'Recovery': <Leaf className="w-5 h-5" />,
  'Trail': <Mountain className="w-5 h-5" />,
};

export default function Home() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<{ shoe: Shoe; score: number }[]>([]);
  const [expandedShoe, setExpandedShoe] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const [prefs, setPrefs] = useState<UserPreferences>({
    shoeType: "any",
    cushion: "any",
    pace: "any",
    mileage: "any",
    releaseYear: "any",
    useCase: "",
  });

  useEffect(() => {
    fetch("/api/shoes")
      .then((r) => r.json())
      .then((data) => {
        const withLikes = data.map((shoe: Shoe) => ({ ...shoe, likes: shoe.likes || 0 }));
        setShoes(withLikes);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load shoes:", e);
        setLoading(false);
      });
  }, []);

  const handleLike = async (id: number) => {
    // 1. Optimistic UI Update
    setShoes(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1 } : s));
    
    // 2. LocalStorage to mark as liked for minimal UI feedback
    const likedStr = localStorage.getItem('likedShoes') || '[]';
    const liked = JSON.parse(likedStr);
    if (!liked.includes(id)) {
      liked.push(id);
      localStorage.setItem('likedShoes', JSON.stringify(liked));
    }
    
    // 3. API Call
    try {
      await fetch(`/api/shoes/${id}/like`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to like', e);
    }
  };

  const filteredResults = useMemo(() => {
    const recs = recommendShoes(shoes, prefs);
    return showAll ? recs : recs.slice(0, 9);
  }, [shoes, prefs, showAll]);

  const handleRecommend = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setResults(filteredResults);
    setStep(1);
    setShowAll(false);
  };

  const handleReset = () => {
    setPrefs({
      shoeType: "any",
      cushion: "any",
      pace: "any",
      mileage: "any",
      releaseYear: "any",
      useCase: "",
    });
    setStep(0);
    setResults([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="text-6xl mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">⚡</div>
        <p className="text-zinc-400 font-medium tracking-widest uppercase text-sm animate-pulse">Initializing Core...</p>
      </div>
    );
  }

  // Step 0: Preference Form
  if (step === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-80 transition-opacity">
              CoreFit.
            </a>
            <span className="text-zinc-600 font-bold hidden sm:inline">|</span>
            <span className="font-semibold text-zinc-200 hidden sm:inline">AI Matcher</span>
          </div>
          <div className="flex gap-6 items-center">
            <a href="/" className="text-sm font-bold text-white transition-colors">AI Match</a>
            <a href="/explore" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"><Search className="w-3 h-3"/> Explore</a>
          </div>
        </header>
        
        <main className="max-w-3xl mx-auto px-4 py-12 relative z-10 animate-fade-up">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Unleash Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">True Pace</span>
            </h1>
            <p className="text-zinc-400 text-lg">완벽한 러닝화를 찾기 위한 여정을 시작하세요.</p>
          </div>

          <div className="space-y-8">
            <QuestionCard title="러닝화의 주요 용도는 무엇인가요?" step="01">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <OptionButton label="전부" icon={<Infinity className="w-8 h-8" />} selected={prefs.shoeType === "any"} onClick={() => setPrefs({ ...prefs, shoeType: "any" })} />
                {SHOE_TYPES.map((t) => (
                  <OptionButton
                    key={t}
                    label={TYPE_LABELS[t] || t}
                    icon={TYPE_ICONS[t] ? React.cloneElement(TYPE_ICONS[t] as React.ReactElement<any>, { className: "w-8 h-8" }) : <Target className="w-8 h-8" />}
                    selected={prefs.shoeType === t}
                    onClick={() => setPrefs({ ...prefs, shoeType: t })}
                  />
                ))}
              </div>
            </QuestionCard>

            <QuestionCard title="선호하는 쿠션 감각은?" step="02">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <OptionButton label="상관없음" icon={<Infinity className="w-8 h-8" />} selected={prefs.cushion === "any"} onClick={() => setPrefs({ ...prefs, cushion: "any" })} />
                <OptionButton label="단단/반발력" icon={<Zap className="w-8 h-8" />} selected={prefs.cushion === "low"} onClick={() => setPrefs({ ...prefs, cushion: "low" })} />
                <OptionButton label="밸런스" icon={<Scale className="w-8 h-8" />} selected={prefs.cushion === "medium"} onClick={() => setPrefs({ ...prefs, cushion: "medium" })} />
                <OptionButton label="풍부/푹신" icon={<Cloud className="w-8 h-8" />} selected={prefs.cushion === "high"} onClick={() => setPrefs({ ...prefs, cushion: "high" })} />
              </div>
            </QuestionCard>

            <QuestionCard title="보통 달리는 페이스는?" step="03">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <OptionButton label="상관없음" icon={<Infinity className="w-8 h-8" />} selected={prefs.pace === "any"} onClick={() => setPrefs({ ...prefs, pace: "any" })} />
                <OptionButton label="6:30 이상" icon={<Footprints className="w-8 h-8" />} selected={prefs.pace === "casual"} onClick={() => setPrefs({ ...prefs, pace: "casual" })} />
                <OptionButton label="5:00-6:30" icon={<Activity className="w-8 h-8" />} selected={prefs.pace === "moderate"} onClick={() => setPrefs({ ...prefs, pace: "moderate" })} />
                <OptionButton label="5:00 미만" icon={<Flame className="w-8 h-8" />} selected={prefs.pace === "fast"} onClick={() => setPrefs({ ...prefs, pace: "fast" })} />
              </div>
            </QuestionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <QuestionCard title="월간 주행 거리는?" step="04" compact>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <OptionButton label="상관없음" icon={<Infinity className="w-8 h-8" />} selected={prefs.mileage === "any"} onClick={() => setPrefs({ ...prefs, mileage: "any" })} />
                  <OptionButton label="50km 미만" icon={<SignalLow className="w-8 h-8" />} selected={prefs.mileage === "low"} onClick={() => setPrefs({ ...prefs, mileage: "low" })} />
                  <OptionButton label="50-150km" icon={<SignalMedium className="w-8 h-8" />} selected={prefs.mileage === "medium"} onClick={() => setPrefs({ ...prefs, mileage: "medium" })} />
                  <OptionButton label="150km 이상" icon={<SignalHigh className="w-8 h-8" />} selected={prefs.mileage === "high"} onClick={() => setPrefs({ ...prefs, mileage: "high" })} />
                </div>
              </QuestionCard>

              <QuestionCard title="출시 연도 선호도?" step="05" compact>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  <OptionButton label="상관없음" icon={<Infinity className="w-8 h-8" />} selected={prefs.releaseYear === "any"} onClick={() => setPrefs({ ...prefs, releaseYear: "any" })} />
                  <OptionButton label="2026~" icon={<Calendar className="w-8 h-8" />} selected={prefs.releaseYear === "2026"} onClick={() => setPrefs({ ...prefs, releaseYear: "2026" })} />
                  <OptionButton label="2025~" icon={<Calendar className="w-8 h-8" />} selected={prefs.releaseYear === "2025"} onClick={() => setPrefs({ ...prefs, releaseYear: "2025" })} />
                  <OptionButton label="2024~" icon={<Calendar className="w-8 h-8" />} selected={prefs.releaseYear === "2024"} onClick={() => setPrefs({ ...prefs, releaseYear: "2024" })} />
                </div>
              </QuestionCard>
            </div>

            <div className="pt-8 flex justify-center">
              <button
                onClick={handleRecommend}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold tracking-wide text-white transition-all duration-200 bg-zinc-900 border border-cyan-500 rounded-full hover:bg-zinc-800 hover:scale-[1.02] active:scale-95"
              >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-cyan-500 pointer-events-none"></span>
                <span className="relative flex items-center gap-2 text-lg">
                  <Sparkles className="w-6 h-6 text-cyan-400" /> 결과 보기 ({shoes.length}종 데이터 기반)
                </span>
              </button>
            </div>
          </div>
        </main>
        <Footer count={shoes.length} />
      </div>
    );
  }

  // Step 1: Results
  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="fixed top-0 left-[-20%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-10 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">매칭 결과</h2>
            <p className="text-zinc-400 mt-1">
              {showAll ? `전체 ${filteredResults.length}개 모델` : `Top ${Math.min(filteredResults.length, 9)} 컬렉션`}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-white px-5 py-2.5 rounded-full transition-all border border-zinc-800 hover:border-zinc-700 text-sm font-medium"
          >
            <span aria-hidden="true">&#8592;</span> 프로필 재설정
          </button>
        </div>

        {/* Top Pick */}
        {filteredResults.length > 0 && (
          <div className="mb-12 animate-fade-up">
            <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-cyan-400 via-violet-500 to-zinc-900 pulse-glow">
              <div className="absolute -top-4 left-8 bg-black border border-cyan-400 text-cyan-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(34,211,238,0.5)] z-20">
                ⭐ Ultimate Match
              </div>
              <div className="glass-panel rounded-[23px] p-6 lg:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div className="relative flex items-center justify-center bg-zinc-900/50 rounded-2xl p-8 aspect-video lg:aspect-square overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <ShoeImage shoe={filteredResults[0].shoe} className="w-full max-h-[300px] drop-shadow-2xl z-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">{filteredResults[0].shoe.brand}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span className="text-xs flex gap-1.5 items-center font-bold px-2.5 py-1 bg-zinc-800 text-cyan-400 rounded-md uppercase border border-cyan-500/30">
                        {TYPE_ICONS[filteredResults[0].shoe.type] || <Target className="w-3.5 h-3.5" />} {filteredResults[0].shoe.type}
                      </span>
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                      {filteredResults[0].shoe.model}
                    </h3>
                    <p className="text-zinc-300 text-lg mb-8 leading-relaxed font-light">
                      "{filteredResults[0].shoe.one_liner}"
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-8">
                      <MetricBadge label="Rating" value={`⭐ ${filteredResults[0].shoe.rating}`} />
                      <MetricBadge label="Price" value={`$${filteredResults[0].shoe.price_usd}`} />
                      <MetricBadge label="Weight" value={`${filteredResults[0].shoe.weight_g}g`} />
                      <MetricBadge label="Drop" value={`${filteredResults[0].shoe.drop_mm}mm`} />
                    </div>

                    <div className="mb-8 pl-1">
                      <button 
                        onClick={() => handleLike(filteredResults[0].shoe.id)}
                        className="group flex flex-row items-center gap-2"
                      >
                        <Heart className="w-6 h-6 text-rose-500 fill-zinc-900 group-hover:fill-rose-500 transition-all duration-300 transform group-hover:scale-125 group-active:scale-95" />
                        <span className="text-sm font-bold text-zinc-400 group-hover:text-rose-400">{filteredResults[0].shoe.likes} Likes</span>
                      </button>
                    </div>

                    <div className="space-y-5 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
                      <ProgressBar label="Speed / Pace" score={filteredResults[0].shoe.pace_score} color="from-rose-500 to-orange-500" />
                      <ProgressBar label="Cushion" score={filteredResults[0].shoe.cushion_score} color="from-cyan-400 to-blue-500" />
                      <ProgressBar label="Durability" score={filteredResults[0].shoe.mileage_score} color="from-emerald-400 to-teal-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.slice(showAll ? 9 : 0).map((result, idx) => (
            <ShoeCard
              key={result.shoe.model + result.shoe.brand}
              shoe={result.shoe}
              score={result.score}
              rank={idx + (showAll ? 10 : 1)}
              expanded={expandedShoe === result.shoe.model + result.shoe.brand}
              onLike={() => handleLike(result.shoe.id)}
              onToggle={() =>
                setExpandedShoe(
                  expandedShoe === result.shoe.model + result.shoe.brand
                    ? null
                    : result.shoe.model + result.shoe.brand
                )
              }
            />
          ))}
        </div>

        {/* Show More */}
        {filteredResults.length > 9 && !showAll && (
          <div className="text-center mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => setShowAll(true)}
              className="group flex items-center justify-center gap-2 mx-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-8 py-3.5 rounded-full transition-all font-medium border border-zinc-800 hover:border-zinc-700"
            >
              나머지 {filteredResults.length - 9}개 모델 로드하기
              <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-1 text-zinc-500" />
            </button>
          </div>
        )}

        {filteredResults.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-3xl animate-fade-up">
            <div className="text-5xl mb-6">🏜️</div>
            <h3 className="text-2xl font-bold text-white mb-2">조건에 맞는 모델이 없습니다</h3>
            <p className="text-zinc-400 mb-8">필터를 조금 더 완화해 보시는 건 어떨까요?</p>
            <button
              onClick={handleReset}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-full transition-colors font-semibold"
            >
              조건 재설정
            </button>
          </div>
        )}
      </main>

      <Footer count={shoes.length} />
    </div>
  );
}

// Components

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 glass-panel border-b-0 border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg outline outline-1 outline-cyan-500/50 bg-black flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <span className="text-xl leading-none">⚡</span>
          </div>
          <span className="font-extrabold text-lg text-white tracking-wide">CORE<span className="text-cyan-400 font-light">FIT</span></span>
        </div>
        <div className="hidden sm:block text-xs font-medium tracking-widest text-zinc-500 uppercase border border-zinc-800 px-3 py-1 rounded-full bg-black/50">
          Recommender Engine v2.0
        </div>
      </div>
    </header>
  );
}

function Footer({ count }: { count: number }) {
  return (
    <footer className="text-center py-10 mt-10 border-t border-zinc-900 relative z-10">
      <p className="text-zinc-600 text-xs font-mono tracking-wider uppercase">
        Engineered by OpenClaw // {count} Models Indexed
      </p>
    </footer>
  );
}

function QuestionCard({ title, step, children, compact }: { title: string; step: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors duration-300">
      <div className="absolute top-0 right-0 p-4 text-zinc-800 font-extrabold text-6xl opacity-20 pointer-events-none select-none transition-transform group-hover:scale-110">
        {step}
      </div>
      <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
        {title}
      </h3>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border transition-all duration-300 font-medium overflow-hidden ${
        selected
          ? "border-cyan-500 bg-cyan-950/30 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800"
      }`}
    >
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-50" />
      )}
      <div className={`transition-transform duration-300 ${selected ? 'scale-110 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'opacity-70 group-hover:opacity-100'}`}>
        {icon}
      </div>
      <div className="relative z-10 text-sm tracking-wide">{label}</div>
    </button>
  );
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-sm font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">{value}</span>
    </div>
  );
}

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
  const src = resolveImagePath(shoe.image);
  return (
    <img
      src={src}
      key={src}
      className={`object-contain flex-shrink-0 ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjcyNzJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNTE1MTU0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
      }}
      alt={shoe.model}
    />
  );
}
