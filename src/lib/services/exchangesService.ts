import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { Exchange, ConnectionRequest } from '../../types/database';
import { GamificationService } from './gamificationService';

const LOCAL_KEY_EXCHANGES = 'pairly_dev_exchanges';

export class ExchangesService {
  private static getLocalExchanges(): Exchange[] {
    const raw = localStorage.getItem(LOCAL_KEY_EXCHANGES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveLocalExchanges(list: Exchange[]): void {
    localStorage.setItem(LOCAL_KEY_EXCHANGES, JSON.stringify(list));
  }

  /**
   * Retrieves all exchanges for the user.
   */
  static async getExchanges(userId: string): Promise<Exchange[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('exchanges') as any)
        .select(`
          *,
          connection_request:connection_requests(
            *,
            requester:profiles!connection_requests_requester_id_fkey(*),
            recipient:profiles!connection_requests_recipient_id_fkey(*),
            listing:listings(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return ((data || []) as Exchange[]).filter(
        (e) =>
          e.connection_request &&
          (e.connection_request.requester_id === userId || e.connection_request.recipient_id === userId)
      );
    }

    const list = this.getLocalExchanges();
    return list.filter(
      (e) =>
        e.connection_request &&
        (e.connection_request.requester_id === userId || e.connection_request.recipient_id === userId)
    );
  }

  /**
   * Retrieves single exchange by ID with access verification.
   */
  static async getExchangeById(exchangeId: string, userId: string): Promise<Exchange | null> {
    const list = await this.getExchanges(userId);
    return list.find((e) => e.id === exchangeId) || null;
  }

  /**
   * Atomically registers participant's completion confirmation.
   * If both confirm, marks exchange as completed and triggers points + badge awards.
   */
  static async confirmCompletion(exchangeId: string, userId: string): Promise<{ bothConfirmed: boolean }> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.rpc as any)('confirm_exchange_completion', {
        p_exchange_id: exchangeId,
      });

      if (error) throw new Error(error.message);
      return { bothConfirmed: data.both_confirmed };
    }

    // Local Preview Storage fallback
    const list = this.getLocalExchanges();
    const exch = list.find((e) => e.id === exchangeId);
    if (!exch || !exch.connection_request) {
      throw new Error('Exchange record not found');
    }

    const isRequester = exch.connection_request.requester_id === userId;
    const isRecipient = exch.connection_request.recipient_id === userId;

    if (!isRequester && !isRecipient) {
      throw new Error('Only exchange participants may confirm completion');
    }

    const now = new Date().toISOString();
    if (isRequester) {
      exch.requester_confirmed_at = exch.requester_confirmed_at || now;
    }
    if (isRecipient) {
      exch.recipient_confirmed_at = exch.recipient_confirmed_at || now;
    }
    exch.updated_at = now;

    let bothConfirmed = false;
    if (exch.requester_confirmed_at && exch.recipient_confirmed_at) {
      exch.status = 'completed';
      exch.completed_at = now;
      bothConfirmed = true;

      // Award points & badges locally
      await GamificationService.recordExchangeCompletion(
        exch.connection_request.requester_id,
        exch.id
      );
      await GamificationService.recordExchangeCompletion(
        exch.connection_request.recipient_id,
        exch.id
      );
    }

    this.saveLocalExchanges(list);
    return { bothConfirmed };
  }
}
