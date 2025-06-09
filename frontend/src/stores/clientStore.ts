import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '../types';
import { clients as initialClients } from '../data/clients';

interface ClientStore {
  clients: Client[];
  
  // Actions
  addClient: (client: Client) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  getClient: (clientId: string) => Client | undefined;
  initializeClients: () => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

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
      },
    }),
    {
      name: 'client-storage',
      version: 1,
    }
  )
);
