import React, { useState } from 'react';
import { Bot, FileText, Download, Copy, Sparkles, Brain, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { useToastStore } from '../stores/toastStore';
import { copyToClipboard } from '../utils/button-actions';
import { cn } from '../utils/cn';

interface AINotesData {
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  nextSteps: string[];
  attendeeInsights: {
    name: string;
    role: string;
    keyContributions: string[];
    concerns: string[];
  }[];
  businessValue: string;
  riskFactors: string[];
}

interface AINotesPanelProps {
  meetingId: string;
  isRecording?: boolean;
  className?: string;
}

export const AINotesPanel: React.FC<AINotesPanelProps> = ({
  meetingId,
  isRecording = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'insights'>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const { success, info } = useToastStore();

  // Mock AI-generated notes data
  const aiNotes: AINotesData = {
    keyPoints: [
      "Client needs a complete CRM integration with their existing Salesforce setup",
      "Budget range discussed: $50K-$75K for initial implementation",
      "Timeline: 3-month delivery window with 2-week buffer",
      "Team size: 3-4 developers plus 1 project manager",
      "Client has existing API documentation and test environment ready"
    ],
    actionItems: [
      "Send project proposal and timeline by Friday",
      "Schedule follow-up meeting with stakeholders next week",
      "Prepare detailed project roadmap and milestones",
      "Review client's current business processes",
      "Draft initial scope of work document"
    ],
    decisions: [
      "Agreed on phased implementation approach",
      "Client will provide necessary business requirements",
      "Weekly progress meetings scheduled for Fridays",
      "Payment terms: 30% upfront, 40% at milestone, 30% completion"
    ],
    nextSteps: [
      "Business requirements discovery session",
      "Scope of work draft delivery",
      "Contract negotiation and signing",
      "Project kickoff meeting"
    ],
    attendeeInsights: [
      {
        name: "Sarah Johnson",
        role: "CTO",
        keyContributions: ["Strategic direction and priorities", "Business requirements clarification"],
        concerns: ["Data security compliance", "Implementation timeline feasibility"]
      },
      {
        name: "Mike Chen",
        role: "Project Manager",
        keyContributions: ["Timeline planning", "Resource allocation"],
        concerns: ["Team availability", "Scope creep prevention"]
      }
    ],
    businessValue: "This integration will reduce manual data entry by 80%, improve sales team efficiency by 40%, and provide real-time visibility into customer interactions across all touchpoints.",
    riskFactors: [
      "Timeline may be impacted by client's internal approval processes",
      "Budget constraints could affect scope of deliverables",
      "Resource availability during peak business periods",
      "Change management and user adoption challenges"
    ]
  };

  const generateNotes = async () => {
    setIsGenerating(true);
    info('AI Processing', 'Analyzing meeting content and generating insights...');
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    success('Notes Generated', 'AI has analyzed the meeting and extracted key insights!');
  };

  const exportNotes = () => {
    info('Exporting Notes', 'Preparing comprehensive meeting notes for download...');
    // Simulate export
    setTimeout(() => {
      success('Export Ready', 'Meeting notes have been exported as PDF.');
    }, 1500);
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'insights', label: 'Insights', icon: Brain },
  ];

  return (
    <div className={cn('bg-white rounded-xl border border-dark-200 shadow-sm dark:bg-dark-900 dark:border-dark-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-900 dark:text-dark-50">AI Meeting Notes</h3>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              {isRecording ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-error-500 rounded-full animate-pulse"></span>
                  Recording and analyzing...
                </span>
              ) : (
                'Smart insights from your meeting'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isGenerating && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(aiNotes, null, 2), 'Meeting notes')}
                leftIcon={<Copy className="h-4 w-4" />}
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportNotes}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={generateNotes}
            disabled={isGenerating}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-200 dark:border-dark-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-dark-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Key Points</h4>
              <ul className="space-y-2">
                {aiNotes.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-400">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Decisions Made</h4>
              <ul className="space-y-2">
                {aiNotes.decisions.map((decision, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-400">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full mt-2 flex-shrink-0"></span>
                    {decision}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Next Steps</h4>
              <ul className="space-y-2">
                {aiNotes.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-400">
                    <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mt-2 flex-shrink-0"></span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Business Value</h4>
              <p className="text-sm text-dark-600 dark:text-dark-400 bg-primary-50 p-4 rounded-lg dark:bg-primary-900/20">
                {aiNotes.businessValue}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Attendee Insights</h4>
              <div className="space-y-4">
                {aiNotes.attendeeInsights.map((attendee, index) => (
                  <div key={index} className="border border-dark-200 rounded-lg p-4 dark:border-dark-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center dark:bg-primary-900/30">
                        <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h5 className="font-medium text-dark-900 dark:text-dark-50">{attendee.name}</h5>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{attendee.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h6 className="font-medium text-dark-700 dark:text-dark-300 mb-2">Key Contributions</h6>
                        <ul className="space-y-1">
                          {attendee.keyContributions.map((contribution, idx) => (
                            <li key={idx} className="text-dark-600 dark:text-dark-400">• {contribution}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-dark-700 dark:text-dark-300 mb-2">Concerns</h6>
                        <ul className="space-y-1">
                          {attendee.concerns.map((concern, idx) => (
                            <li key={idx} className="text-dark-600 dark:text-dark-400">• {concern}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Risk Factors</h4>
              <ul className="space-y-2">
                {aiNotes.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-400">
                    <span className="w-1.5 h-1.5 bg-warning-500 rounded-full mt-2 flex-shrink-0"></span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};
