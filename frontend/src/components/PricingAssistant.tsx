import React, { useState } from 'react';
import { DollarSign, TrendingUp, BarChart3, Calculator, Lightbulb, Target, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { useToastStore } from '../stores/toastStore';
import { cn } from '../utils/cn';

interface SimilarProject {
  id: string;
  name: string;
  industry: string;
  scope: string[];
  duration: string;
  teamSize: number;
  totalCost: number;
  hourlyRate: number;
  complexity: 'low' | 'medium' | 'high';
  outcome: string;
  similarity: number;
}

interface PricingRecommendation {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  confidence: number;
  factors: {
    complexity: number;
    timeline: number;
    teamSize: number;
    marketRate: number;
  };
  breakdown: {
    development: number;
    testing: number;
    projectManagement: number;
    documentation: number;
    support: number;
  };
  risks: string[];
  opportunities: string[];
}

interface PricingAssistantProps {
  className?: string;
  projectScope?: string[];
  estimatedHours?: number;
}

export const PricingAssistant: React.FC<PricingAssistantProps> = ({
  className,
  projectScope = [],
  estimatedHours = 0,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [similarProjects] = useState<SimilarProject[]>([
    {
      id: '1',
      name: 'FinanceFlow CRM Integration',
      industry: 'Financial Services',
      scope: ['Salesforce API integration', 'Custom dashboards', 'Data migration', 'User training'],
      duration: '3 months',
      teamSize: 4,
      totalCost: 75000,
      hourlyRate: 150,
      complexity: 'high',
      outcome: '75% efficiency improvement, 35% lead conversion increase',
      similarity: 92
    },
    {
      id: '2',
      name: 'MedTech Sales Automation',
      industry: 'Healthcare Technology',
      scope: ['CRM integration', 'Workflow automation', 'Reporting suite'],
      duration: '2.5 months',
      teamSize: 3,
      totalCost: 55000,
      hourlyRate: 140,
      complexity: 'medium',
      outcome: '50% faster quote generation, streamlined sales process',
      similarity: 87
    },
    {
      id: '3',
      name: 'RetailPro System Integration',
      industry: 'Retail',
      scope: ['Multi-platform integration', 'Real-time sync', 'Custom APIs'],
      duration: '4 months',
      teamSize: 5,
      totalCost: 95000,
      hourlyRate: 145,
      complexity: 'high',
      outcome: 'Unified data platform, 60% reduction in manual processes',
      similarity: 78
    }
  ]);

  const { success, info } = useToastStore();

  const analyzePricing = async () => {
    setIsAnalyzing(true);
    info('AI Analysis', 'Analyzing similar projects and market rates...');

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockRecommendation: PricingRecommendation = {
      suggestedPrice: 70000,
      priceRange: { min: 60000, max: 80000 },
      confidence: 89,
      factors: {
        complexity: 85,
        timeline: 75,
        teamSize: 80,
        marketRate: 92
      },
      breakdown: {
        development: 45000,
        testing: 8000,
        projectManagement: 7000,
        documentation: 5000,
        support: 5000
      },
      risks: [
        'Scope creep potential due to complex integrations',
        'Third-party API limitations may impact timeline',
        'Client system compatibility unknowns'
      ],
      opportunities: [
        'Potential for additional modules and features',
        'Long-term maintenance contract opportunity',
        'Referral potential in similar industry'
      ]
    };

    setRecommendation(mockRecommendation);
    setIsAnalyzing(false);
    success('Analysis Complete', 'Pricing recommendation generated based on similar projects!');
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900/30';
      case 'medium':
        return 'text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900/30';
      case 'high':
        return 'text-error-600 bg-error-100 dark:text-error-400 dark:bg-error-900/30';
      default:
        return 'text-dark-600 bg-dark-100 dark:text-dark-400 dark:bg-dark-800';
    }
  };

  return (
    <div className={cn('bg-white rounded-xl border border-dark-200 shadow-sm dark:bg-dark-900 dark:border-dark-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-900 dark:text-dark-50">AI Pricing Assistant</h3>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Smart pricing based on similar projects and market data
            </p>
          </div>
        </div>
        
        <Button
          onClick={analyzePricing}
          disabled={isAnalyzing}
          leftIcon={<Calculator className="h-4 w-4" />}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Pricing'}
        </Button>
      </div>

      <div className="p-6">
        {!recommendation ? (
          <div className="space-y-6">
            {/* Similar Projects */}
            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4">Similar Projects</h4>
              <div className="space-y-3">
                {similarProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    className="border border-dark-200 rounded-lg p-4 dark:border-dark-700"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-dark-900 dark:text-dark-50">{project.name}</h5>
                        <p className="text-sm text-dark-600 dark:text-dark-400">{project.industry}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getComplexityColor(project.complexity))}>
                          {project.complexity}
                        </span>
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {project.similarity}% match
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-dark-500 dark:text-dark-400">Duration:</span>
                        <p className="font-medium text-dark-900 dark:text-dark-50">{project.duration}</p>
                      </div>
                      <div>
                        <span className="text-dark-500 dark:text-dark-400">Team Size:</span>
                        <p className="font-medium text-dark-900 dark:text-dark-50">{project.teamSize} people</p>
                      </div>
                      <div>
                        <span className="text-dark-500 dark:text-dark-400">Total Cost:</span>
                        <p className="font-medium text-dark-900 dark:text-dark-50">${project.totalCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-dark-500 dark:text-dark-400">Avg Rate:</span>
                        <p className="font-medium text-dark-900 dark:text-dark-50">${project.hourlyRate}/hr</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-dark-600 dark:text-dark-400">{project.outcome}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center py-8">
              <Calculator className="mx-auto h-12 w-12 text-dark-400 dark:text-dark-600 mb-4" />
              <p className="text-dark-600 dark:text-dark-400">
                Click "Analyze Pricing" to get AI-powered pricing recommendations based on similar projects
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pricing Recommendation */}
            <div className="bg-primary-50 rounded-lg p-6 dark:bg-primary-900/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-dark-900 dark:text-dark-50">Recommended Pricing</h4>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success-500" />
                  <span className="text-sm font-medium text-success-600 dark:text-success-400">
                    {recommendation.confidence}% confidence
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-dark-600 dark:text-dark-400">Suggested Price</p>
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    ${recommendation.suggestedPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-dark-600 dark:text-dark-400">Price Range</p>
                  <p className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                    ${recommendation.priceRange.min.toLocaleString()} - ${recommendation.priceRange.max.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-dark-600 dark:text-dark-400">Market Position</p>
                  <p className="text-lg font-semibold text-accent-600 dark:text-accent-400">Competitive</p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4">Cost Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(recommendation.breakdown).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg dark:bg-dark-800">
                    <span className="font-medium text-dark-900 dark:text-dark-50 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-semibold text-dark-900 dark:text-dark-50">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Pricing Factors
                </h4>
                <div className="space-y-3">
                  {Object.entries(recommendation.factors).map(([factor, score]) => (
                    <div key={factor}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-600 dark:text-dark-400 capitalize">
                          {factor.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium text-dark-900 dark:text-dark-50">{score}%</span>
                      </div>
                      <div className="w-full bg-dark-200 rounded-full h-2 dark:bg-dark-700">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-error-700 dark:text-error-400 mb-2">Risks</h5>
                    <ul className="space-y-1">
                      {recommendation.risks.map((risk, index) => (
                        <li key={index} className="text-sm text-dark-600 dark:text-dark-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-error-500 rounded-full mt-2 flex-shrink-0"></span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-success-700 dark:text-success-400 mb-2">Opportunities</h5>
                    <ul className="space-y-1">
                      {recommendation.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm text-dark-600 dark:text-dark-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-success-500 rounded-full mt-2 flex-shrink-0"></span>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setRecommendation(null)}
              >
                Analyze Different Project
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
