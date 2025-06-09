import React, { useState } from 'react';
import { FileText, Sparkles, Download, Send, DollarSign, Calendar, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Modal } from './Modal';
import { useToastStore } from '../stores/toastStore';
import { cn } from '../utils/cn';

interface ProposalData {
  projectTitle: string;
  clientName: string;
  executiveSummary: string;
  scope: string[];
  timeline: {
    phase: string;
    duration: string;
    deliverables: string[];
  }[];
  team: {
    role: string;
    allocation: string;
    rate: string;
  }[];
  pricing: {
    category: string;
    description: string;
    amount: number;
  }[];
  totalAmount: number;
  terms: string[];
  similarProjects: {
    name: string;
    industry: string;
    outcome: string;
    relevance: string;
  }[];
}

interface ProposalGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId?: string;
}

export const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({
  isOpen,
  onClose,
  meetingId,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'scope' | 'timeline' | 'pricing'>('overview');
  const { success, info } = useToastStore();

  const generateProposal = async () => {
    setIsGenerating(true);
    info('AI Processing', 'Analyzing meeting data and generating tailored proposal...');

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 4000));

    const mockProposal: ProposalData = {
      projectTitle: "Salesforce CRM Integration & Automation Platform",
      clientName: "TechCorp Solutions",
      executiveSummary: "This proposal outlines a comprehensive Salesforce CRM integration solution that will streamline TechCorp's sales processes, eliminate manual data entry, and provide real-time visibility across all customer touchpoints. Based on our discussion, this solution will reduce operational overhead by 40% and improve sales team efficiency by 60%.",
      scope: [
        "Complete Salesforce API integration with existing systems",
        "Custom field mapping for 15+ business objects",
        "Real-time bidirectional data synchronization",
        "OAuth 2.0 security implementation",
        "Custom dashboard and reporting suite",
        "Data migration from legacy systems",
        "User training and documentation",
        "6 months of post-launch support"
      ],
      timeline: [
        {
          phase: "Discovery & Planning",
          duration: "2 weeks",
          deliverables: ["Technical requirements document", "System architecture design", "Project plan"]
        },
        {
          phase: "Development & Integration",
          duration: "8 weeks",
          deliverables: ["API integration", "Custom field mapping", "Security implementation", "Testing"]
        },
        {
          phase: "Testing & Deployment",
          duration: "2 weeks",
          deliverables: ["User acceptance testing", "Production deployment", "Performance optimization"]
        },
        {
          phase: "Training & Support",
          duration: "2 weeks",
          deliverables: ["User training sessions", "Documentation", "Knowledge transfer"]
        }
      ],
      team: [
        { role: "Senior Developer", allocation: "100%", rate: "$150/hr" },
        { role: "Salesforce Specialist", allocation: "75%", rate: "$175/hr" },
        { role: "Project Manager", allocation: "50%", rate: "$125/hr" },
        { role: "QA Engineer", allocation: "50%", rate: "$100/hr" }
      ],
      pricing: [
        { category: "Development", description: "Core integration development", amount: 45000 },
        { category: "Testing & QA", description: "Comprehensive testing suite", amount: 8000 },
        { category: "Training", description: "User training and documentation", amount: 5000 },
        { category: "Support", description: "6 months post-launch support", amount: 12000 }
      ],
      totalAmount: 70000,
      terms: [
        "30% payment upon contract signing",
        "40% payment at development milestone completion",
        "30% payment upon final delivery and acceptance",
        "Net 30 payment terms",
        "6 months warranty on all deliverables",
        "Change requests subject to additional cost approval"
      ],
      similarProjects: [
        {
          name: "FinanceFlow CRM Integration",
          industry: "Financial Services",
          outcome: "Reduced data entry time by 75%, improved lead conversion by 35%",
          relevance: "Similar Salesforce integration scope and complexity"
        },
        {
          name: "MedTech Sales Automation",
          industry: "Healthcare Technology",
          outcome: "Streamlined sales process, 50% faster quote generation",
          relevance: "Comparable team size and timeline requirements"
        }
      ]
    };

    setProposal(mockProposal);
    setIsGenerating(false);
    success('Proposal Generated', 'AI has created a tailored proposal based on your meeting insights!');
  };

  const exportProposal = () => {
    info('Exporting Proposal', 'Preparing professional proposal document...');
    setTimeout(() => {
      success('Export Ready', 'Proposal has been exported as PDF with your branding.');
    }, 2000);
  };

  const sendProposal = () => {
    info('Sending Proposal', 'Preparing personalized email with proposal attachment...');
    setTimeout(() => {
      success('Proposal Sent', 'Proposal has been sent to the client with tracking enabled.');
    }, 1500);
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'scope', label: 'Scope', icon: Target },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Proposal Generator"
      size="xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="flex flex-col h-[80vh]">
        {!proposal ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-primary-900/30">
                <Sparkles className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
                Generate AI-Powered Proposal
              </h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                Our AI will analyze your meeting notes, past projects, and client requirements to create a tailored proposal with accurate pricing and timeline estimates.
              </p>
              <Button
                onClick={generateProposal}
                disabled={isGenerating}
                leftIcon={<Sparkles className="h-5 w-5" />}
                size="lg"
              >
                {isGenerating ? 'Generating Proposal...' : 'Generate Proposal'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-dark-200 dark:border-dark-700">
              <div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                  {proposal.projectTitle}
                </h3>
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  For {proposal.clientName} • Total: ${proposal.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportProposal}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  onClick={sendProposal}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Send to Client
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-200 dark:border-dark-700 mt-4">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                      activeSection === section.id
                        ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                        : 'text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-dark-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Executive Summary</h4>
                    <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
                      {proposal.executiveSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Similar Projects</h4>
                    <div className="space-y-3">
                      {proposal.similarProjects.map((project, index) => (
                        <div key={index} className="border border-dark-200 rounded-lg p-4 dark:border-dark-700">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-dark-900 dark:text-dark-50">{project.name}</h5>
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded dark:bg-primary-900/30 dark:text-primary-300">
                              {project.industry}
                            </span>
                          </div>
                          <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">{project.outcome}</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">{project.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'scope' && (
                <div>
                  <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4">Project Scope</h4>
                  <ul className="space-y-3">
                    {proposal.scope.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 dark:bg-primary-900/30 dark:text-primary-300">
                          {index + 1}
                        </span>
                        <span className="text-sm text-dark-600 dark:text-dark-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSection === 'timeline' && (
                <div>
                  <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4">Project Timeline</h4>
                  <div className="space-y-4">
                    {proposal.timeline.map((phase, index) => (
                      <div key={index} className="border border-dark-200 rounded-lg p-4 dark:border-dark-700">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-dark-900 dark:text-dark-50">{phase.phase}</h5>
                          <span className="text-sm bg-accent-100 text-accent-700 px-2 py-1 rounded dark:bg-accent-900/30 dark:text-accent-300">
                            {phase.duration}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {phase.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="text-sm text-dark-600 dark:text-dark-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'pricing' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4">Pricing Breakdown</h4>
                    <div className="space-y-3">
                      {proposal.pricing.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-dark-200 rounded-lg dark:border-dark-700">
                          <div>
                            <h5 className="font-medium text-dark-900 dark:text-dark-50">{item.category}</h5>
                            <p className="text-sm text-dark-600 dark:text-dark-400">{item.description}</p>
                          </div>
                          <span className="font-semibold text-dark-900 dark:text-dark-50">
                            ${item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border-2 border-primary-200 dark:bg-primary-900/20 dark:border-primary-700">
                        <span className="font-semibold text-dark-900 dark:text-dark-50">Total Project Cost</span>
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                          ${proposal.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Payment Terms</h4>
                    <ul className="space-y-2">
                      {proposal.terms.map((term, index) => (
                        <li key={index} className="text-sm text-dark-600 dark:text-dark-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-success-500 rounded-full mt-2"></span>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
