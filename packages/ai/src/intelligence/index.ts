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

// Brand Intelligence
export type {
  BrandTestRequest,
  NameAnalysis,
  NameConflict,
  TaglineAnalysis,
  BrandTestReport,
  GeneratedName,
  GeneratedTagline,
  BrandPersona,
} from './BrandIntelligence';

export {
  BRAND_PERSONAS,
  buildBrandTestPrompt,
  generateMockBrandTest,
  getNameScoreLabel,
  getNameScoreColor,
} from './BrandIntelligence';
