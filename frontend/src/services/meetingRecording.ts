import { ApiService, BotResponse, BotStatusResponse, DownloadUrlsResponse } from './api';
import { useToastStore } from '../stores/toastStore';

export interface RecordingBot {
  id: string;
  meetingUrl: string;
  botName: string;
  status: 'joining' | 'recording' | 'done' | 'fatal';
  createdAt: Date;
  videoUrl?: string;
  transcriptUrl?: string;
}

export class MeetingRecordingService {
  private static bots: Map<string, RecordingBot> = new Map();
  private static statusCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private static initialized = false;

  // Initialize service and clean up old bots
  static initialize(): void {
    if (this.initialized) return;

    console.log('🔧 Initializing MeetingRecordingService...');

    // Clean up any existing intervals
    this.statusCheckIntervals.forEach((interval, botId) => {
      console.log(`🧹 Cleaning up polling for bot: ${botId}`);
      clearInterval(interval);
    });

    // Clear all stored data
    this.statusCheckIntervals.clear();
    this.bots.clear();

    this.initialized = true;
    console.log('✅ MeetingRecordingService initialized');
  }

  // Clean up all active monitoring
  static cleanup(): void {
    console.log('🧹 Cleaning up MeetingRecordingService...');

    this.statusCheckIntervals.forEach((interval, botId) => {
      console.log(`🧹 Stopping polling for bot: ${botId}`);
      clearInterval(interval);
    });

    this.statusCheckIntervals.clear();
    this.bots.clear();
    this.initialized = false;

    console.log('✅ MeetingRecordingService cleaned up');
  }

  // Create a new recording bot
  static async createRecordingBot(
    meetingUrl: string,
    botName: string = 'Lemur AI Bot',
    apiKey: string
  ): Promise<RecordingBot> {
    // Initialize service if not already done
    this.initialize();

    try {
      const response: BotResponse = await ApiService.createBot(meetingUrl, botName, apiKey);
      
      const bot: RecordingBot = {
        id: response.bot_id,
        meetingUrl,
        botName,
        status: response.status as RecordingBot['status'],
        createdAt: new Date(response.created_at),
      };

      // Store bot locally
      this.bots.set(bot.id, bot);

      // Start status monitoring
      this.startStatusMonitoring(bot.id);

      // Show success toast
      const toast = useToastStore.getState();
      toast.success(
        'Recording Bot Created',
        `${botName} is joining the meeting and will start recording shortly.`
      );

      return bot;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Create Recording Bot',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Get bot status
  static async getBotStatus(botId: string): Promise<RecordingBot | null> {
    try {
      const response: BotStatusResponse = await ApiService.getBotStatus(botId);

      // If bot not found, remove from local storage and return null
      if (response.status === 'not_found') {
        this.bots.delete(botId);
        this.stopStatusMonitoring(botId);
        return null;
      }

      const bot = this.bots.get(botId);
      if (bot) {
        bot.status = response.status as RecordingBot['status'];
        this.bots.set(botId, bot);
      }

      return bot || null;
    } catch (error: any) {
      console.error(`Failed to get status for bot ${botId}:`, error);
      return null;
    }
  }

  // Get download URLs when recording is complete
  static async getDownloadUrls(botId: string): Promise<{ videoUrl?: string; transcriptUrl?: string } | null> {
    try {
      const response: DownloadUrlsResponse = await ApiService.getDownloadUrls(botId);
      
      const bot = this.bots.get(botId);
      if (bot) {
        bot.videoUrl = response.video_url;
        bot.transcriptUrl = response.transcript_url;
        bot.status = response.status as RecordingBot['status'];
        this.bots.set(botId, bot);
      }

      return {
        videoUrl: response.video_url,
        transcriptUrl: response.transcript_url,
      };
    } catch (error: any) {
      console.error(`Failed to get download URLs for bot ${botId}:`, error);
      return null;
    }
  }

  // Start monitoring bot status
  private static startStatusMonitoring(botId: string): void {
    // Clear existing interval if any
    const existingInterval = this.statusCheckIntervals.get(botId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Check status every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response: BotStatusResponse = await ApiService.getBotStatus(botId);
        const bot = this.bots.get(botId);

        if (bot) {
          // Update bot status
          bot.status = response.status as RecordingBot['status'];
          this.bots.set(botId, bot);

          // If recording is done, get download URLs and stop monitoring
          if (bot.status === 'done') {
            await this.getDownloadUrls(botId);
            this.stopStatusMonitoring(botId);

            const toast = useToastStore.getState();
            toast.success(
              'Recording Complete',
              `${bot.botName} has finished recording. Download links are now available.`
            );
          }
          // If bot failed, stop monitoring and show error
          else if (bot.status === 'fatal') {
            this.stopStatusMonitoring(botId);

            const toast = useToastStore.getState();
            toast.error(
              'Recording Failed',
              `${bot.botName} encountered an error and could not complete the recording.`
            );
          }
          // If bot not found, stop monitoring (bot was removed or doesn't exist)
          else if (response.status === 'not_found') {
            this.stopStatusMonitoring(botId);
            this.bots.delete(botId); // Remove from local storage

            console.log(`Bot ${botId} not found, stopped monitoring`);
          }
        }
      } catch (error) {
        // If we get an error, stop monitoring this bot
        console.error(`Error checking status for bot ${botId}:`, error);
        this.stopStatusMonitoring(botId);
      }
    }, 30000); // 30 seconds

    this.statusCheckIntervals.set(botId, interval);
  }

  // Stop monitoring bot status
  static stopStatusMonitoring(botId: string): void {
    const interval = this.statusCheckIntervals.get(botId);
    if (interval) {
      console.log(`🛑 Stopping status monitoring for bot: ${botId}`);
      clearInterval(interval);
      this.statusCheckIntervals.delete(botId);
    }
  }

  // Force stop monitoring for a specific bot and remove it
  static forceStopBot(botId: string): void {
    console.log(`🛑 Force stopping bot: ${botId}`);
    this.stopStatusMonitoring(botId);
    this.bots.delete(botId);
  }

  // Get all active polling intervals (for debugging)
  static getActivePolling(): string[] {
    return Array.from(this.statusCheckIntervals.keys());
  }

  // Remove bot from tracking
  static async removeBot(botId: string): Promise<void> {
    try {
      await ApiService.removeBot(botId);
      this.bots.delete(botId);
      this.stopStatusMonitoring(botId);
      
      const toast = useToastStore.getState();
      toast.info('Bot Removed', 'Recording bot has been removed from tracking.');
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Remove Bot',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Get all active bots
  static getAllBots(): RecordingBot[] {
    // Initialize service if not already done
    this.initialize();
    return Array.from(this.bots.values());
  }

  // Get bot by ID
  static getBot(botId: string): RecordingBot | undefined {
    return this.bots.get(botId);
  }


}

export default MeetingRecordingService;
