"use client";

import { useState, useEffect, useMemo } from "react";
import { Shoe, UserPreferences, SHOE_TYPES, TYPE_EMOJIS, TYPE_LABELS, resolveImagePath } from "@/types/shoe";
import { recommendShoes } from "@/lib/recommender";

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
    budget: "any",
    useCase: "",
  });

  useEffect(() => {
    fetch("/data/shoes.json")
      .then((r) => r.json())
      .then((data) => {
        setShoes(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load shoes:", e);
        setLoading(false);
      });
  }, []);

  const filteredResults = useMemo(() => {
    const recs = recommendShoes(shoes, prefs);
    return showAll ? recs : recs.slice(0, 9);
  }, [shoes, prefs, showAll]);

  const handleRecommend = () => {
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
      budget: "any",
      useCase: "",
    });
    setStep(0);
    setResults([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👟</div>
          <p className="text-xl text-gray-600">러닝화 로딩 중...</p>
        </div>
      </div>
    );
  }

  // Step 0: Preference Form
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">나에게 맞는 러닝화 찾기</h2>
          <p className="text-gray-600 mb-8">몇 가지 질문에 답하면 최적의 러닝화를 추천해드려요.</p>

          <div className="space-y-6">
            {/* 용도 */}
            <QuestionCard title="1. 무슨 용도로 찾으세요?" required>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <OptionButton
                  label="전부"
                  emoji="👟"
                  selected={prefs.shoeType === "any"}
                  onClick={() => setPrefs({ ...prefs, shoeType: "any" })}
                />
                {SHOE_TYPES.map((t) => (
                  <OptionButton
                    key={t}
                    label={TYPE_LABELS[t] || t}
                    emoji={TYPE_EMOJIS[t] || ""}
                    selected={prefs.shoeType === t}
                    onClick={() => setPrefs({ ...prefs, shoeType: t })}
                  />
                ))}
              </div>
            </QuestionCard>

            {/* 쿠션 */}
            <QuestionCard title="2. 쿠션 선호도는?">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <OptionButton label="전체" emoji="🤷" selected={prefs.cushion === "any"} onClick={() => setPrefs({ ...prefs, cushion: "any" })} />
                <OptionButton label="단단함" emoji="🪨" selected={prefs.cushion === "low"} onClick={() => setPrefs({ ...prefs, cushion: "low" })} />
                <OptionButton label="보통" emoji="⚖️" selected={prefs.cushion === "medium"} onClick={() => setPrefs({ ...prefs, cushion: "medium" })} />
                <OptionButton label="푹신함" emoji="☁️" selected={prefs.cushion === "high"} onClick={() => setPrefs({ ...prefs, cushion: "high" })} />
              </div>
            </QuestionCard>

            {/* 페이스 */}
            <QuestionCard title="3. 달리는 페이스는?">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <OptionButton label="전체" emoji="🤷" selected={prefs.pace === "any"} onClick={() => setPrefs({ ...prefs, pace: "any" })} />
                <OptionButton label="조깅" emoji="🚶" selected={prefs.pace === "casual"} onClick={() => setPrefs({ ...prefs, pace: "casual" })} />
                <OptionButton label="보통" emoji="🏃" selected={prefs.pace === "moderate"} onClick={() => setPrefs({ ...prefs, pace: "moderate" })} />
                <OptionButton label="빠름" emoji="⚡" selected={prefs.pace === "fast"} onClick={() => setPrefs({ ...prefs, pace: "fast" })} />
              </div>
            </QuestionCard>

            {/* 주행거리 */}
            <QuestionCard title="4. 월간 주행 거리는?">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <OptionButton label="전체" emoji="🤷" selected={prefs.mileage === "any"} onClick={() => setPrefs({ ...prefs, mileage: "any" })} />
                <OptionButton label="적음" emoji="📉" selected={prefs.mileage === "low"} onClick={() => setPrefs({ ...prefs, mileage: "low" })} />
                <OptionButton label="보통" emoji="📊" selected={prefs.mileage === "medium"} onClick={() => setPrefs({ ...prefs, mileage: "medium" })} />
                <OptionButton label="많음" emoji="📈" selected={prefs.mileage === "high"} onClick={() => setPrefs({ ...prefs, mileage: "high" })} />
              </div>
            </QuestionCard>

            {/* 예산 */}
            <QuestionCard title="5. 예산은?">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <OptionButton label="전체" emoji="🤷" selected={prefs.budget === "any"} onClick={() => setPrefs({ ...prefs, budget: "any" })} />
                <OptionButton label="$150 이하" emoji="💰" selected={prefs.budget === "budget"} onClick={() => setPrefs({ ...prefs, budget: "budget" })} />
                <OptionButton label="$200 이하" emoji="💵" selected={prefs.budget === "mid"} onClick={() => setPrefs({ ...prefs, budget: "mid" })} />
                <OptionButton label="상관 없음" emoji="💎" selected={prefs.budget === "premium"} onClick={() => setPrefs({ ...prefs, budget: "premium" })} />
              </div>
            </QuestionCard>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleRecommend}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all text-lg shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                👟 내 러닝화 찾기 ({shoes.length}종 중에서)
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center py-8 text-gray-400 text-sm">
          <p>Powered by OpenClaw · {shoes.length} shoes in database</p>
        </footer>
      </div>
    );
  }

  // Step 1: Results
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">추천 결과</h2>
            <p className="text-gray-600 mt-1">
              {showAll ? `${filteredResults.length}개 전체` : `Top ${Math.min(filteredResults.length, 9)} / ${filteredResults.length}개`}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all"
          >
            ← 다시 선택
          </button>
        </div>

        {/* Top Pick */}
        {filteredResults.length > 0 && (
          <div className="mb-8 animate-fade-up">
            <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-md">
              <div className="absolute -top-3 left-6 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                🏆 Top Pick
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-2">
                <div className="flex items-center justify-center bg-white rounded-xl p-4 aspect-square">
                  <ShoeImage shoe={filteredResults[0].shoe} className="max-h-48" />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {filteredResults[0].shoe.brand} {filteredResults[0].shoe.model}
                  </h3>
                  <p className="text-gray-600 mt-1">{filteredResults[0].shoe.one_liner}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge>{TYPE_EMOJIS[filteredResults[0].shoe.type]} {filteredResults[0].shoe.type}</Badge>
                    <Badge>⭐ {filteredResults[0].shoe.rating}</Badge>
                    <Badge>💲 ${filteredResults[0].shoe.price_usd}</Badge>
                    <Badge>🪶 {filteredResults[0].shoe.weight_g}g</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <StatCard label="페이스" score={filteredResults[0].shoe.pace_score} />
                    <StatCard label="쿠션" score={filteredResults[0].shoe.cushion_score} />
                    <StatCard label="내구성" score={filteredResults[0].shoe.mileage_score} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.slice(showAll ? 9 : 0).map((result, idx) => (
            <ShoeCard
              key={result.shoe.model + result.shoe.brand}
              shoe={result.shoe}
              score={result.score}
              rank={idx + (showAll ? 10 : 1)}
              expanded={expandedShoe === result.shoe.model + result.shoe.brand}
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
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all font-medium"
            >
              나머지 {filteredResults.length - 9}개 lebih 보기 ↓
            </button>
          </div>
        )}

        {filteredResults.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😅</div>
            <p className="text-xl text-gray-600">조건에 맞는 러닝화가 없어요.</p>
            <button
              onClick={handleReset}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              조건 다시 선택
            </button>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>Powered by OpenClaw · {shoes.length} shoes in database</p>
      </footer>
    </div>
  );
}

// Components

function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👟</span>
          <span className="font-bold text-lg text-gray-900">FindMyShoe</span>
        </div>
        <div className="text-sm text-gray-500">러닝화 추천 서비스</div>
      </div>
    </header>
  );
}

function QuestionCard({ title, children, required }: { title: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      {children}
    </div>
  );
}

function OptionButton({
  label,
  emoji,
  selected,
  onClick,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
        selected
          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="text-xl mb-1">{emoji}</div>
      <div>{label}</div>
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {children}
    </span>
  );
}

function StatCard({ label, score }: { label: string; score: number }) {
  const fullStars = score;
  const emptyStars = 5 - fullStars;
  return (
    <div className="bg-white/60 rounded-lg p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-yellow-500 text-sm">
        {"⭐".repeat(fullStars)}
        {"☆".repeat(emptyStars)}
      </div>
    </div>
  );
}

function ShoeImage({ shoe, className = "" }: { shoe: Shoe; className?: string }) {
  const src = resolveImagePath(shoe.image);
  return (
    <img
      src={src}
      alt={shoe.model}
      className={`object-contain ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function ShoeCard({
  shoe,
  score,
  rank,
  expanded,
  onToggle,
}: {
  shoe: Shoe;
  score: number;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all cursor-pointer hover:shadow-md ${
        expanded ? "ring-2 ring-blue-300" : ""
      }`}
      onClick={onToggle}
    >
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center h-48">
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
          #{rank}
        </div>
        <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full">
          {score.toFixed(0)}점
        </div>
        <ShoeImage shoe={shoe} className="max-h-40" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900">
            {shoe.brand} {shoe.model}
          </h3>
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
            {TYPE_EMOJIS[shoe.type]} {shoe.type}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{shoe.one_liner}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge>⭐ {shoe.rating}</Badge>
          <Badge>${shoe.price_usd}</Badge>
          <Badge>🪶 {shoe.weight_g}g</Badge>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-up">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">드롭: <span className="text-gray-900 font-medium">{shoe.drop_mm}mm</span></div>
              <div className="text-gray-500">스택높이: <span className="text-gray-900 font-medium">{shoe.stack_height_mm}mm</span></div>
              <div className="text-gray-500">리뷰: <span className="text-gray-900 font-medium">{shoe.review_count.toLocaleString()}개</span></div>
              <div className="text-gray-500">업데이트: <span className="text-gray-900 font-medium">{shoe.updated}</span></div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">상세 점수</div>
              <div className="flex gap-1">
                <StatCard label="페이스" score={shoe.pace_score} />
                <StatCard label="쿠션" score={shoe.cushion_score} />
                <StatCard label="내구성" score={shoe.mileage_score} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
