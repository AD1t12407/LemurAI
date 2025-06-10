import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '../types';
import { clients as initialClients } from '../data/clients';
import { ApiService, Client as APIClient, SubClient as APISubClient, FileUploadResponse } from '../services/api';

interface ClientStore {
  // Legacy clients (for backward compatibility)
  clients: Client[];

  // Production API clients (Centralized Brain)
  apiClients: APIClient[];
  subClients: Record<string, APISubClient[]>;
  clientFiles: Record<string, FileUploadResponse[]>;

  // State management
  isLoading: boolean;
  error: string | null;

  // Legacy Actions (for backward compatibility)
  addClient: (client: Client) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  getClient: (clientId: string) => Client | undefined;
  initializeClients: () => void;

  // Production API Actions (Centralized Brain)
  createAPIClient: (name: string, description?: string) => Promise<APIClient>;
  fetchAPIClients: () => Promise<void>;
  updateAPIClient: (clientId: string, updates: { name?: string; description?: string }) => Promise<APIClient>;
  deleteAPIClient: (clientId: string) => Promise<void>;

  // Sub-Client Management
  createSubClient: (clientId: string, name: string, description?: string, contactEmail?: string, contactName?: string) => Promise<APISubClient>;
  fetchSubClients: (clientId: string) => Promise<void>;
  updateSubClient: (clientId: string, subClientId: string, updates: Partial<APISubClient>) => Promise<APISubClient>;
  deleteSubClient: (clientId: string, subClientId: string) => Promise<void>;

  // File Management (Knowledge Base)
  uploadFile: (clientId: string, file: File, subClientId?: string) => Promise<FileUploadResponse>;
  fetchFiles: (clientId?: string, subClientId?: string) => Promise<void>;
  searchKnowledge: (clientId: string, query: string, subClientId?: string, nResults?: number) => Promise<any>;

  // AI-Powered Content Generation
  generateFollowUp: (clientId: string, prompt: string, recipientName: string, senderName: string, subClientId?: string) => Promise<string>;
  generateProposal: (clientId: string, prompt: string, subClientId?: string) => Promise<string>;
  generateSummary: (clientId: string, prompt: string, subClientId?: string) => Promise<string>;
  generateActionItems: (clientId: string, prompt: string, subClientId?: string) => Promise<string>;
  generateCustomContent: (clientId: string, prompt: string, contentType: string, subClientId?: string, additionalInstructions?: string) => Promise<string>;

  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      // Legacy clients
      clients: [],

      // Production API clients
      apiClients: [],
      subClients: {},
      clientFiles: {},

      // State
      isLoading: false,
      error: null,

      // Utility actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      addClient: (client) => {
        set((state) => ({
          clients: [...state.clients, {
            ...client,
            createdAt: new Date(),
            updatedAt: new Date()
          }],
        }));
      },

      updateClient: (clientId, updates) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId 
              ? { ...client, ...updates, updatedAt: new Date() } 
              : client
          ),
        }));
      },

      deleteClient: (clientId) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== clientId),
        }));
      },

      getClient: (clientId) => {
        const state = get();
        return state.clients.find((client) => client.id === clientId);
      },

      initializeClients: () => {
        const state = get();
        if (state.clients.length === 0) {
          set({ clients: initialClients });
        }
        // Also fetch API clients from backend
        get().fetchAPIClients().catch(console.error);
      },

      // ============================================================================
      // PRODUCTION API ACTIONS (Centralized Brain)
      // ============================================================================

      createAPIClient: async (name: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
          const apiClient = await ApiService.createClient({ name, description });
          set((state) => ({
            apiClients: [...state.apiClients, apiClient],
            isLoading: false
          }));
          return apiClient;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to create client';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchAPIClients: async () => {
        set({ isLoading: true, error: null });
        try {
          const apiClients = await ApiService.getClients();
          set({ apiClients, isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch clients';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateAPIClient: async (clientId: string, updates: { name?: string; description?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const updatedClient = await ApiService.updateClient(clientId, updates);
          set((state) => ({
            apiClients: state.apiClients.map(client =>
              client.id === clientId ? updatedClient : client
            ),
            isLoading: false
          }));
          return updatedClient;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to update client';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteAPIClient: async (clientId: string) => {
        set({ isLoading: true, error: null });
        try {
          await ApiService.deleteClient(clientId);
          set((state) => {
            const newSubClients = { ...state.subClients };
            const newClientFiles = { ...state.clientFiles };
            delete newSubClients[clientId];
            delete newClientFiles[clientId];
            
            return {
              apiClients: state.apiClients.filter(client => client.id !== clientId),
              subClients: newSubClients,
              clientFiles: newClientFiles,
              isLoading: false
            };
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to delete client';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Sub-Client Management
      createSubClient: async (clientId: string, name: string, description?: string, contactEmail?: string, contactName?: string) => {
        set({ isLoading: true, error: null });
        try {
          const subClient = await ApiService.createSubClient(clientId, { 
            name, 
            description, 
            contact_email: contactEmail, 
            contact_name: contactName 
          });
          set((state) => ({
            subClients: {
              ...state.subClients,
              [clientId]: [...(state.subClients[clientId] || []), subClient]
            },
            isLoading: false
          }));
          return subClient;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to create sub-client';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchSubClients: async (clientId: string) => {
        set({ isLoading: true, error: null });
        try {
          const subClients = await ApiService.getSubClients(clientId);
          set((state) => ({
            subClients: {
              ...state.subClients,
              [clientId]: subClients
            },
            isLoading: false
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch sub-clients';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateSubClient: async (clientId: string, subClientId: string, updates: Partial<APISubClient>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedSubClient = await ApiService.updateSubClient(clientId, subClientId, updates);
          set((state) => ({
            subClients: {
              ...state.subClients,
              [clientId]: state.subClients[clientId]?.map(sc =>
                sc.id === subClientId ? updatedSubClient : sc
              ) || []
            },
            isLoading: false
          }));
          return updatedSubClient;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to update sub-client';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteSubClient: async (clientId: string, subClientId: string) => {
        set({ isLoading: true, error: null });
        try {
          await ApiService.deleteSubClient(clientId, subClientId);
          set((state) => ({
            subClients: {
              ...state.subClients,
              [clientId]: state.subClients[clientId]?.filter(sc => sc.id !== subClientId) || []
            },
            isLoading: false
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to delete sub-client';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // File Management (Knowledge Base)
      uploadFile: async (clientId: string, file: File, subClientId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const uploadedFile = await ApiService.uploadFile(file, clientId, subClientId);
          set((state) => ({
            clientFiles: {
              ...state.clientFiles,
              [clientId]: [...(state.clientFiles[clientId] || []), uploadedFile]
            },
            isLoading: false
          }));
          return uploadedFile;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to upload file';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchFiles: async (clientId?: string, subClientId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const files = await ApiService.getFiles(clientId, subClientId);
          if (clientId) {
            set((state) => ({
              clientFiles: {
                ...state.clientFiles,
                [clientId]: files
              },
              isLoading: false
            }));
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch files';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      searchKnowledge: async (clientId: string, query: string, subClientId?: string, nResults: number = 5) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ApiService.searchKnowledge({
            query,
            client_id: clientId,
            sub_client_id: subClientId,
            n_results: nResults
          });
          set({ isLoading: false });
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to search knowledge';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // ============================================================================
      // AI-POWERED CONTENT GENERATION (Smart Follow-ups & Proposals)
      // ============================================================================

      generateFollowUp: async (clientId: string, prompt: string, recipientName: string, senderName: string, subClientId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ApiService.generateEmail({
            prompt,
            content_type: 'email',
            client_id: clientId,
            sub_client_id: subClientId,
            recipient_name: recipientName,
            sender_name: senderName
          });
          set({ isLoading: false });
          return result.content;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to generate follow-up';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      generateProposal: async (clientId: string, prompt: string, subClientId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ApiService.generateContent({
            prompt,
            content_type: 'proposal',
            client_id: clientId,
            sub_client_id: subClientId
          });
          set({ isLoading: false });
          return result.content;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to generate proposal';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      generateSummary: async (clientId: string, prompt: string, subClientId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ApiService.generateSummary({
            prompt,
            content_type: 'summary',
            client_id: clientId,
            sub_client_id: subClientId
          });
          set({ isLoading: false });
          return result.content;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to generate summary';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      generateActionItems: async (clientId: string, prompt: string, subClientId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ApiService.generateActionItems({
            prompt,
            content_type: 'action_items',
            client_id: clientId,
            sub_client_id: subClientId
          });
          set({ isLoading: false });
          return result.content;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to generate action items';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      generateCustomContent: async (clientId: string, prompt: string, contentType: string, subClientId?: string, additionalInstructions?: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await ApiService.generateContent({
            prompt,
            content_type: contentType,
            client_id: clientId,
            sub_client_id: subClientId,
            additional_instructions: additionalInstructions
          });
          set({ isLoading: false });
          return result.content;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to generate custom content';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'client-storage',
      version: 3,
      partialize: (state) => ({
        // Only persist non-sensitive data
        clients: state.clients,
        apiClients: state.apiClients,
        // Don't persist files and sub-clients (fetch fresh from API)
      }),
    }
  )
);