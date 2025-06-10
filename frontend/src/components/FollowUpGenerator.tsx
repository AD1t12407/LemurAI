import React, { useState } from 'react';
import { Mail, Sparkles, Send, Copy, Edit, Clock, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Modal } from './Modal';
import { useToastStore } from '../stores/toastStore';
import { copyToClipboard } from '../utils/button-actions';
import { cn } from '../utils/cn';

interface EmailTemplate {
  id: string;
  type: 'thank_you' | 'proposal_follow_up' | 'next_steps' | 'technical_follow_up';
  subject: string;
  content: string;
  tone: 'professional' | 'friendly' | 'formal';
  personalization: {
    clientName: string;
    projectDetails: string[];
    nextActions: string[];
    caseStudies: string[];
  };
}

interface FollowUpGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId?: string;
  attendees?: { name: string; email: string }[];
}

export const FollowUpGenerator: React.FC<FollowUpGeneratorProps> = ({
  isOpen,
  onClose,
  meetingId,
  attendees = [],
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('thank_you');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<EmailTemplate | null>(null);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'formal'>('professional');
  const { success, info } = useToastStore();

  const emailTypes = [
    {
      id: 'thank_you',
      label: 'Thank You & Summary',
      description: 'Express gratitude and summarize key discussion points',
      icon: '🙏'
    },
    {
      id: 'proposal_follow_up',
      label: 'Proposal Follow-up',
      description: 'Send proposal with relevant case studies and next steps',
      icon: '📋'
    },
    {
      id: 'next_steps',
      label: 'Next Steps',
      description: 'Outline action items and schedule follow-up meetings',
      icon: '📅'
    },
    {
      id: 'technical_follow_up',
      label: 'Technical Details',
      description: 'Share technical documentation and requirements',
      icon: '⚙️'
    }
  ];

  const generateEmail = async () => {
    setIsGenerating(true);
    info('AI Processing', 'Generating personalized follow-up email based on meeting context...');

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockEmail: EmailTemplate = {
      id: '1',
      type: selectedTemplate as any,
      subject: getSubjectByType(selectedTemplate),
      content: getContentByType(selectedTemplate, selectedTone),
      tone: selectedTone,
      personalization: {
        clientName: 'TechCorp Solutions',
        projectDetails: [
          'Salesforce CRM integration with existing systems',
          'Real-time data synchronization requirements',
          'Custom dashboard and reporting needs',
          'Team training and documentation'
        ],
        nextActions: [
          'Technical requirements document delivery by Friday',
          'Follow-up call with IT team next Tuesday',
          'Proposal draft review and feedback',
          'Contract terms discussion'
        ],
        caseStudies: [
          'FinanceFlow CRM Integration - 75% efficiency improvement',
          'MedTech Sales Automation - 50% faster quote generation'
        ]
      }
    };

    setGeneratedEmail(mockEmail);
    setIsGenerating(false);
    success('Email Generated', 'Personalized follow-up email created with relevant case studies!');
  };

  const sendEmail = () => {
    info('Sending Email', 'Preparing to send personalized follow-up email...');
    setTimeout(() => {
      success('Email Sent', 'Follow-up email sent successfully with tracking enabled.');
    }, 1500);
  };

  const getSubjectByType = (type: string) => {
    switch (type) {
      case 'thank_you':
        return 'Thank you for today\'s meeting - Next steps for your Salesforce integration';
      case 'proposal_follow_up':
        return 'Proposal: Salesforce CRM Integration for TechCorp Solutions';
      case 'next_steps':
        return 'Action items and next steps from our meeting';
      case 'technical_follow_up':
        return 'Technical documentation and requirements for your CRM project';
      default:
        return 'Follow-up from our meeting';
    }
  };

  const getContentByType = (type: string, tone: string) => {
    const greeting = tone === 'formal' ? 'Dear' : tone === 'friendly' ? 'Hi' : 'Hello';
    
    switch (type) {
      case 'thank_you':
        return `${greeting} Sarah,

Thank you for taking the time to meet with us today to discuss TechCorp's Salesforce integration needs. I really appreciated the detailed overview of your current systems and the challenges you're facing with manual data entry.

Key points from our discussion:
• Your team processes 500+ leads monthly with significant manual overhead
• Integration with existing Salesforce setup is the top priority
• Timeline goal of 3 months aligns well with our availability
• Budget range of $50K-$75K fits our proposed solution scope

Based on our conversation, I'm confident our team can deliver exactly what you need. We've successfully completed similar projects for companies like FinanceFlow (75% efficiency improvement) and MedTech (50% faster quote generation).

Next steps:
• I'll send over the technical requirements document by Friday
• Let's schedule a follow-up call with your IT team for next Tuesday
• I'll prepare a detailed proposal with timeline and pricing

Looking forward to partnering with TechCorp on this exciting project!

Best regards,
[Your Name]`;

      case 'proposal_follow_up':
        return `${greeting} Sarah,

As promised, I'm attaching our detailed proposal for the Salesforce CRM integration project we discussed.

The proposal includes:
• Complete project scope and deliverables
• 3-month timeline with key milestones
• Team structure and expertise
• Investment breakdown: $70,000 total
• Similar project case studies and outcomes

Highlights from relevant projects:
• FinanceFlow: Reduced data entry time by 75%, improved lead conversion by 35%
• MedTech: Streamlined sales process, 50% faster quote generation

The proposed solution will address all the pain points we discussed:
✓ Eliminate manual data entry between systems
✓ Real-time synchronization across all touchpoints
✓ Custom dashboards for better visibility
✓ Comprehensive team training and documentation

I'm available for any questions or to discuss the proposal in detail. Would you like to schedule a call this week to review everything together?

Best regards,
[Your Name]`;

      default:
        return `${greeting} Sarah,

Thank you for the productive meeting today. Here's a summary of our discussion and the agreed next steps:

[Content would be generated based on meeting type and context]

Best regards,
[Your Name]`;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Follow-up Email Generator"
      size="lg"
    >
      <div className="space-y-6">
        {!generatedEmail ? (
          <>
            {/* Email Type Selection */}
            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Email Type</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emailTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTemplate(type.id)}
                    className={cn(
                      'p-4 border rounded-lg text-left transition-all',
                      selectedTemplate === type.id
                        ? 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                        : 'border-dark-200 hover:border-dark-300 dark:border-dark-700 dark:hover:border-dark-600'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h5 className="font-medium text-dark-900 dark:text-dark-50">{type.label}</h5>
                        <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Email Tone</h4>
              <div className="flex gap-3">
                {['professional', 'friendly', 'formal'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone as any)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      selectedTone === tone
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'bg-dark-100 text-dark-700 hover:bg-dark-200 dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-dark-700'
                    )}
                  >
                    {tone ? (tone.charAt(0).toUpperCase() + tone.slice(1)) : 'Unknown'}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients */}
            {attendees.length > 0 && (
              <div>
                <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-3">Recipients</h4>
                <div className="space-y-2">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg dark:bg-dark-800">
                      <User className="h-4 w-4 text-dark-500" />
                      <div>
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50">{attendee.name}</p>
                        <p className="text-xs text-dark-600 dark:text-dark-400">{attendee.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={generateEmail}
                disabled={isGenerating}
                leftIcon={<Sparkles className="h-5 w-5" />}
                size="lg"
              >
                {isGenerating ? 'Generating Email...' : 'Generate Follow-up Email'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Generated Email */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-dark-900 dark:text-dark-50">Generated Email</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedEmail.content, 'Email content')}
                    leftIcon={<Copy className="h-4 w-4" />}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="h-4 w-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={sendEmail}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Send Email
                  </Button>
                </div>
              </div>

              <div className="border border-dark-200 rounded-lg dark:border-dark-700">
                <div className="p-4 border-b border-dark-200 bg-dark-50 dark:border-dark-700 dark:bg-dark-800">
                  <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                    <Mail className="h-4 w-4" />
                    <span>Subject: {generatedEmail.subject}</span>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-sm text-dark-700 dark:text-dark-300 font-sans">
                    {generatedEmail.content}
                  </pre>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedEmail(null)}
                >
                  Generate New Email
                </Button>
                <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                  <Clock className="h-4 w-4" />
                  <span>Personalized with meeting context and case studies</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
