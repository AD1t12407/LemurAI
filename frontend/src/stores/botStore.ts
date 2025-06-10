import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiService, BotResponse, BotStatusResponse, DownloadUrlsResponse } from '../services/api';

export interface Bot {
  bot_id: string;
  status: string;
  meeting_url: string;
  bot_name: string;
  created_at: string;
  message?: string;
  status_changes?: Array<any>;
  video_url?: string;
  audio_url?: string;
  transcript_url?: string;
  chat_messages_url?: string;
}

interface BotStore {
  bots: Bot[];
  activeBots: Bot[];
  isLoading: boolean;
  error: string | null;

  // Bot Management Actions
  createBot: (meetingUrl: string, botName: string) => Promise<Bot>;
  getBotStatus: (botId: string) => Promise<BotStatusResponse>;
  getDownloadUrls: (botId: string) => Promise<DownloadUrlsResponse>;
  removeBot: (botId: string) => Promise<void>;
  listActiveBots: () => Promise<void>;
  cleanupOldBots: () => Promise<void>;
  
  // Real-time monitoring
  monitorBot: (botId: string, onStatusChange?: (status: string) => void) => void;
  stopMonitoring: (botId: string) => void;
  
  // Utility methods
  getBotById: (botId: string) => Bot | undefined;
  updateBotStatus: (botId: string, status: string, additionalData?: Partial<Bot>) => void;
  clearError: () => void;
}

// Store for monitoring intervals
const monitoringIntervals: Record<string, NodeJS.Timeout> = {};

export const useBotStore = create<BotStore>()(
  persist(
    (set, get) => ({
      bots: [],
      activeBots: [],
      isLoading: false,
      error: null,

      createBot: async (meetingUrl: string, botName: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ApiService.createBot(meetingUrl, botName);
          const newBot: Bot = {
            bot_id: response.bot_id,
            status: response.status,
            meeting_url: response.meeting_url,
            bot_name: response.bot_name,
            created_at: response.created_at,
            message: response.message
          };
          
          set((state) => ({
            bots: [...state.bots, newBot],
            activeBots: [...state.activeBots, newBot],
            isLoading: false
          }));
          
          // Start monitoring the new bot
          get().monitorBot(newBot.bot_id);
          
          return newBot;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      getBotStatus: async (botId: string) => {
        try {
          const statusResponse = await ApiService.getBotStatus(botId);
          
          // Update bot in store
          get().updateBotStatus(botId, statusResponse.status, {
            meeting_url: statusResponse.meeting_url,
            bot_name: statusResponse.bot_name,
            status_changes: statusResponse.status_changes
          });
          
          return statusResponse;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      getDownloadUrls: async (botId: string) => {
        try {
          const downloadResponse = await ApiService.getDownloadUrls(botId);
          
          // Update bot with download URLs
          get().updateBotStatus(botId, downloadResponse.status, {
            video_url: downloadResponse.video_url,
            audio_url: downloadResponse.audio_url,
            transcript_url: downloadResponse.transcript_url,
            chat_messages_url: downloadResponse.chat_messages_url
          });
          
          return downloadResponse;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      removeBot: async (botId: string) => {
        set({ isLoading: true, error: null });
        try {
          await ApiService.removeBot(botId);
          
          // Stop monitoring
          get().stopMonitoring(botId);
          
          // Remove from store
          set((state) => ({
            bots: state.bots.filter(bot => bot.bot_id !== botId),
            activeBots: state.activeBots.filter(bot => bot.bot_id !== botId),
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      listActiveBots: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ApiService.listActiveBots();
          const activeBots = response.active_bots || [];
          
          set({
            activeBots: activeBots.map((bot: any) => ({
              bot_id: bot.bot_id,
              status: bot.status,
              meeting_url: bot.meeting_url,
              bot_name: bot.bot_name,
              created_at: bot.created_at
            })),
            isLoading: false
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      cleanupOldBots: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await ApiService.cleanupOldBots();
          
          // Refresh active bots list
          await get().listActiveBots();
          
          set({ isLoading: false });
          return response;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      monitorBot: (botId: string, onStatusChange?: (status: string) => void) => {
        // Clear existing monitoring for this bot
        get().stopMonitoring(botId);
        
        // Start new monitoring
        const interval = setInterval(async () => {
          try {
            const statusResponse = await get().getBotStatus(botId);
            
            if (onStatusChange) {
              onStatusChange(statusResponse.status);
            }
            
            // Stop monitoring if bot is done
            if (['done', 'failed', 'fatal'].includes(statusResponse.status)) {
              get().stopMonitoring(botId);
              
              // Try to get download URLs if done
              if (statusResponse.status === 'done') {
                try {
                  await get().getDownloadUrls(botId);
                } catch (error) {
                  console.warn('Failed to get download URLs:', error);
                }
              }
            }
          } catch (error) {
            console.warn('Bot monitoring error:', error);
          }
        }, 10000); // Check every 10 seconds
        
        monitoringIntervals[botId] = interval;
      },

      stopMonitoring: (botId: string) => {
        if (monitoringIntervals[botId]) {
          clearInterval(monitoringIntervals[botId]);
          delete monitoringIntervals[botId];
        }
      },

      getBotById: (botId: string) => {
        const state = get();
        return state.bots.find(bot => bot.bot_id === botId) || 
               state.activeBots.find(bot => bot.bot_id === botId);
      },

      updateBotStatus: (botId: string, status: string, additionalData?: Partial<Bot>) => {
        set((state) => ({
          bots: state.bots.map(bot => 
            bot.bot_id === botId 
              ? { ...bot, status, ...additionalData }
              : bot
          ),
          activeBots: state.activeBots.map(bot => 
            bot.bot_id === botId 
              ? { ...bot, status, ...additionalData }
              : bot
          )
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'bot-storage',
      version: 1,
      partialize: (state) => ({
        // Only persist bots, not loading states
        bots: state.bots,
        activeBots: state.activeBots,
      }),
    }
  )
);

// Cleanup monitoring intervals on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    Object.values(monitoringIntervals).forEach(interval => {
      clearInterval(interval);
    });
  });
}
