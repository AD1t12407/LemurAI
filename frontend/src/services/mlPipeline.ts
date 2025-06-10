import { ApiService } from './api';

// Types for ML Pipeline
export interface MLClient {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MLSubClient {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  contact_email?: string;
  contact_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MLFile {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  client_id: string;
  sub_client_id?: string;
  processed: boolean;
  extracted_text?: string;
  chunks_stored?: number;
  created_at: string;
}

export interface AIGenerationRequest {
  prompt: string;
  content_type: 'email' | 'summary' | 'action_items' | 'proposal' | 'scope_of_work';
  client_id: string;
  sub_client_id?: string;
  recipient_name?: string;
  sender_name?: string;
  additional_instructions?: string;
}

export interface AIGenerationResponse {
  id: string;
  content: string;
  content_type: string;
  prompt: string;
  client_id: string;
  sub_client_id?: string;
  context_used: string;
  created_at: string;
}

export interface KnowledgeSearchRequest {
  query: string;
  client_id: string;
  sub_client_id?: string;
  n_results?: number;
}

export interface KnowledgeSearchResponse {
  results: Array<{
    text: string;
    metadata: Record<string, any>;
    score: number;
  }>;
  query: string;
  total_results: number;
}

/**
 * ML Pipeline API Service
 * Handles all AI-powered business intelligence features
 */
export class MLPipelineService {
  
  // ============================================================================
  // CLIENT MANAGEMENT (Centralized Brain per Company)
  // ============================================================================
  
  /**
   * Create a new client organization (company's centralized brain)
   */
  static async createClient(name: string, description?: string): Promise<MLClient> {
    const response = await ApiService.post('/clients', {
      name,
      description
    });
    return response.data;
  }

  /**
   * Get all clients for the current user (all company brains)
   */
  static async getClients(): Promise<MLClient[]> {
    const response = await ApiService.get('/clients');
    return response.data;
  }

  /**
   * Create a sub-client (project/department within company)
   */
  static async createSubClient(
    clientId: string,
    name: string,
    description?: string,
    contactEmail?: string,
    contactName?: string
  ): Promise<MLSubClient> {
    const response = await ApiService.post(`/clients/${clientId}/sub-clients`, {
      name,
      description,
      contact_email: contactEmail,
      contact_name: contactName
    });
    return response.data;
  }

  /**
   * Get sub-clients for a client
   */
  static async getSubClients(clientId: string): Promise<MLSubClient[]> {
    const response = await ApiService.get(`/clients/${clientId}/sub-clients`);
    return response.data;
  }

  // ============================================================================
  // KNOWLEDGE BASE MANAGEMENT
  // ============================================================================

  /**
   * Upload and process a file (adds to centralized brain)
   */
  static async uploadFile(
    clientId: string,
    file: File,
    subClientId?: string
  ): Promise<MLFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (subClientId) {
      formData.append('sub_client_id', subClientId);
    }

    const response = await ApiService.post(`/clients/${clientId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Search the knowledge base (query the centralized brain)
   */
  static async searchKnowledge(request: KnowledgeSearchRequest): Promise<KnowledgeSearchResponse> {
    const response = await ApiService.post('/knowledge/search', request);
    return response.data;
  }

  // ============================================================================
  // AI CONTENT GENERATION (Smart Follow-ups & Proposals)
  // ============================================================================

  /**
   * Generate AI content using company knowledge
   */
  static async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const response = await ApiService.post('/llm/generate', request);
    return response.data;
  }

  /**
   * Generate personalized follow-up email
   */
  static async generateFollowUpEmail(
    clientId: string,
    meetingNotes: string,
    recipientName: string,
    senderName: string,
    subClientId?: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      prompt: `Generate a personalized follow-up email based on this meeting: ${meetingNotes}`,
      content_type: 'email',
      client_id: clientId,
      sub_client_id: subClientId,
      recipient_name: recipientName,
      sender_name: senderName,
      additional_instructions: 'Use past project history and successful patterns from our company knowledge base'
    });
  }

  /**
   * Generate scope of work document
   */
  static async generateScopeOfWork(
    clientId: string,
    projectRequirements: string,
    subClientId?: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      prompt: `Create a detailed scope of work based on these requirements: ${projectRequirements}`,
      content_type: 'scope_of_work',
      client_id: clientId,
      sub_client_id: subClientId,
      additional_instructions: 'Reference similar successful projects from our company history'
    });
  }

  /**
   * Generate proposal draft
   */
  static async generateProposal(
    clientId: string,
    projectDetails: string,
    subClientId?: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      prompt: `Create a compelling proposal based on: ${projectDetails}`,
      content_type: 'proposal',
      client_id: clientId,
      sub_client_id: subClientId,
      additional_instructions: 'Include relevant case studies and proven methodologies from our past work'
    });
  }

  /**
   * Generate meeting summary with action items
   */
  static async generateMeetingSummary(
    clientId: string,
    meetingTranscript: string,
    subClientId?: string
  ): Promise<AIGenerationResponse> {
    return this.generateContent({
      prompt: `Summarize this meeting and extract action items: ${meetingTranscript}`,
      content_type: 'summary',
      client_id: clientId,
      sub_client_id: subClientId,
      additional_instructions: 'Focus on business outcomes and next steps'
    });
  }

  // ============================================================================
  // CENTRALIZED BRAIN QUERIES
  // ============================================================================

  /**
   * Get company-wide knowledge for AI context
   */
  static async getCompanyKnowledge(clientId: string): Promise<KnowledgeSearchResponse> {
    return this.searchKnowledge({
      query: 'successful projects, case studies, methodologies, best practices',
      client_id: clientId,
      n_results: 10
    });
  }

  /**
   * Get similar past projects for reference
   */
  static async getSimilarProjects(
    clientId: string,
    projectDescription: string
  ): Promise<KnowledgeSearchResponse> {
    return this.searchKnowledge({
      query: `similar projects: ${projectDescription}`,
      client_id: clientId,
      n_results: 5
    });
  }

  /**
   * Get client-specific communication patterns
   */
  static async getCommunicationPatterns(
    clientId: string,
    subClientId?: string
  ): Promise<KnowledgeSearchResponse> {
    return this.searchKnowledge({
      query: 'successful emails, communication style, client preferences',
      client_id: clientId,
      sub_client_id: subClientId,
      n_results: 5
    });
  }
}
