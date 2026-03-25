export type {
  MarketAnalysisRequest,
  MarketIntelReport,
  DimensionScore,
  CompetitiveInsight,
  UXRecommendation,
  MarketSignal,
  MarketImprovement,
  CategoryBenchmark,
} from './MarketIntelligence';

export {
  CATEGORY_BENCHMARKS,
  buildMarketAnalysisPrompt,
  getScoreLabel,
  getScoreColor,
  generateMockAnalysis,
} from './MarketIntelligence';
