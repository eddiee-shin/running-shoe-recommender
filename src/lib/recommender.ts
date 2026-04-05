import { Shoe, UserPreferences } from '@/types/shoe';

/**
 * 추천 알고리즘:
 * 1. 용도(type) 필터 - 필수 매칭
 * 2. 쿠션/페이스/마일리지 점수 근접도 기반 가중 스코어링
 * 3. 예산 필터 적용
 * 4. 종합 점수로 정렬
 */
export function recommendShoes(
  shoes: Shoe[],
  prefs: UserPreferences
): { shoe: Shoe; score: number; breakdown: string[] }[] {
  let results: { shoe: Shoe; score: number; breakdown: string[] }[] = [];
  
  for (const shoe of shoes) {
    if (!shoe.type) continue;
    
    let score = 0;
    const breakdown: string[] = [];
    
    // 1. 용도 매칭 (가중치 40%)
    if (prefs.shoeType === 'any') {
      const typeBonus = 0.7;
      score += typeBonus * 40;
    } else if (shoe.type === prefs.shoeType) {
      score += 1.0 * 40;
      breakdown.push(`용도 정확 매칭 (+40)`);
    } else {
      // 완전히 다른 용도는 낮은 점수만
      continue;
    }
    
    // 2. 쿠션 점수 근접도 (가중치 20%)
    const cushionMap: Record<string, { ideal: number; spread: number }> = {
      'low':   { ideal: 2, spread: 1.5 },
      'medium': { ideal: 3, spread: 1.5 },
      'high':  { ideal: 5, spread: 1.5 },
      'any':   { ideal: 0, spread: 0 },
    };
    const cushionPref = cushionMap[prefs.cushion];
    if (cushionPref.ideal > 0) {
      const diff = Math.abs(shoe.cushion_score - cushionPref.ideal);
      const cushionScore = Math.max(0, 1 - diff / 4);
      score += cushionScore * 20;
      if (cushionScore > 0.6) breakdown.push(`쿠션 근접 (+${(cushionScore * 20).toFixed(0)})`);
    }
    
    // 3. 페이스 점수 근접도 (가중치 15%)
    const paceMap: Record<string, number> = {
      'casual': 2,
      'moderate': 3,
      'fast': 5,
    };
    if (prefs.pace !== 'any' && paceMap[prefs.pace]) {
      const idealPace = paceMap[prefs.pace];
      const diff = Math.abs(shoe.pace_score - idealPace);
      const paceScore = Math.max(0, 1 - diff / 3);
      score += paceScore * 15;
      if (paceScore > 0.5) breakdown.push(`페이스 근접 (+${(paceScore * 15).toFixed(0)})`);
    }
    
    // 4. 마일리지 점수 근접도 (가중치 10%)
    const mileageMap: Record<string, number> = {
      'low': 2,
      'medium': 3,
      'high': 5,
    };
    if (prefs.mileage !== 'any' && mileageMap[prefs.mileage]) {
      const idealMileage = mileageMap[prefs.mileage];
      const diff = Math.abs(shoe.mileage_score - idealMileage);
      const mileageScore = Math.max(0, 1 - diff / 4);
      score += mileageScore * 10;
    }
    
    // 5. 평점 기반 보너스 (가중치 10%)
    score += (shoe.rating / 5) * 10;
    
    // 6. 리뷰 수 기반 신뢰도 보너스 (가중치 5%)
    const reviewBonus = Math.min(shoe.review_count / 3000, 1);
    score += reviewBonus * 5;
    
    // 7. 예산 필터
    const budgetThresholds: Record<string, number> = {
      'budget': 150,
      'mid': 200,
      'premium': 999,
    };
    if (prefs.budget !== 'any' && budgetThresholds[prefs.budget]) {
      const maxPrice = budgetThresholds[prefs.budget];
      if (shoe.price_usd > maxPrice) continue;
      // 예산 내 저렴한 것 보너스
      const priceRatio = 1 - (shoe.price_usd / maxPrice);
      score += priceRatio * 5;
      breakdown.push(`예산 내 ($${shoe.price_usd})`);
    }

    // 8. 출시 연도(최신) 보너스 (가중치 10%)
    if (prefs.releaseYear !== 'any') {
        const targetYear = parseInt(prefs.releaseYear, 10);
        if (shoe.release_year >= targetYear) {
            score += 10;
            breakdown.push(`${targetYear}년형 이상 매칭 +10`);
        }
    }
    
    results.push({ shoe, score, breakdown });
  }
  
  // 점수 기준 내림차순 정렬
  results.sort((a, b) => b.score - a.score);
  
  return results;
}
