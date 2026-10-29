import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { ConnectionRequest, ConnectionRequestStatus, Profile, Listing } from '../../types/database';
import { ListingsService } from './listingsService';

const LOCAL_STORAGE_KEY_REQUESTS = 'pairly_dev_connection_requests';

export class RequestsService {
  private static getLocalRequests(): ConnectionRequest[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_REQUESTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveLocalRequests(list: ConnectionRequest[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY_REQUESTS, JSON.stringify(list));
  }

  /**
   * Submits a connection request to another user.
   */
  static async sendRequest(params: {
    requesterId: string;
    requesterProfile?: Profile;
    recipientId: string;
    recipientProfile?: Profile;
    listingId?: string | null;
    listing?: Listing | null;
    message?: string | null;
  }): Promise<ConnectionRequest> {
    if (params.requesterId === params.recipientId) {
      throw new Error('You cannot send a connection request to yourself.');
    }

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      // 1. Check for duplicate pending requests in either direction
      const { data: existing } = await (supabase.from('connection_requests') as any)
        .select('id, status')
        .or(
          `and(requester_id.eq.${params.requesterId},recipient_id.eq.${params.recipientId}),and(requester_id.eq.${params.recipientId},recipient_id.eq.${params.requesterId})`
        )
        .eq('status', 'pending');

      if (existing && existing.length > 0) {
        throw new Error('A pending connection request already exists between you two.');
      }

      const { data, error } = await (supabase.from('connection_requests') as any)
        .insert({
          requester_id: params.requesterId,
          recipient_id: params.recipientId,
          listing_id: params.listingId || null,
          message: params.message || null,
          status: 'pending',
        })
        .select('*, requester:profiles!connection_requests_requester_id_fkey(*), recipient:profiles!connection_requests_recipient_id_fkey(*), listing:listings(*)')
        .single();

      if (error) throw new Error(error.message);
      return data as ConnectionRequest;
    }

    // Local Preview Storage fallback
    const list = this.getLocalRequests();
    const duplicate = list.find(
      (r) =>
        r.status === 'pending' &&
        ((r.requester_id === params.requesterId && r.recipient_id === params.recipientId) ||
          (r.requester_id === params.recipientId && r.recipient_id === params.requesterId))
    );

    if (duplicate) {
      throw new Error('A pending connection request already exists between you two.');
    }

    const newReq: ConnectionRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      requester_id: params.requesterId,
      recipient_id: params.recipientId,
      listing_id: params.listingId || null,
      message: params.message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requester: params.requesterProfile,
      recipient: params.recipientProfile,
      listing: params.listing || undefined,
    };

    list.unshift(newReq);
    this.saveLocalRequests(list);
    return newReq;
  }

  /**
   * Retrieves all requests sent by user.
   */
  static async getSentRequests(userId: string): Promise<ConnectionRequest[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('connection_requests') as any)
        .select('*, recipient:profiles!connection_requests_recipient_id_fkey(*), listing:listings(*)')
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as ConnectionRequest[];
    }

    const list = this.getLocalRequests();
    return list.filter((r) => r.requester_id === userId);
  }

  /**
   * Retrieves all requests received by user.
   */
  static async getReceivedRequests(userId: string): Promise<ConnectionRequest[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('connection_requests') as any)
        .select('*, requester:profiles!connection_requests_requester_id_fkey(*), listing:listings(*)')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as ConnectionRequest[];
    }

    const list = this.getLocalRequests();
    return list.filter((r) => r.recipient_id === userId);
  }

  /**
   * Cancels a pending request (by requester).
   */
  static async cancelRequest(requestId: string, userId: string): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.from('connection_requests') as any)
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('requester_id', userId)
        .eq('status', 'pending');

      if (error) throw new Error(error.message);
      return;
    }

    const list = this.getLocalRequests();
    const req = list.find((r) => r.id === requestId && r.requester_id === userId);
    if (!req) throw new Error('Request not found or unauthorized');
    if (req.status !== 'pending') throw new Error(`Cannot cancel request with status: ${req.status}`);

    req.status = 'cancelled';
    req.updated_at = new Date().toISOString();
    this.saveLocalRequests(list);
  }

  /**
   * Rejects a pending request (by recipient).
   */
  static async rejectRequest(requestId: string, userId: string): Promise<void> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { error } = await (supabase.from('connection_requests') as any)
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('recipient_id', userId)
        .eq('status', 'pending');

      if (error) throw new Error(error.message);
      return;
    }

    const list = this.getLocalRequests();
    const req = list.find((r) => r.id === requestId && r.recipient_id === userId);
    if (!req) throw new Error('Request not found or unauthorized');
    if (req.status !== 'pending') throw new Error(`Cannot reject request with status: ${req.status}`);

    req.status = 'rejected';
    req.updated_at = new Date().toISOString();
    this.saveLocalRequests(list);
  }

  /**
   * Atomically accepts request, transitions status, and initializes conversation + exchange.
   */
  static async acceptRequest(requestId: string, userId: string): Promise<{ conversationId: string }> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.rpc as any)('accept_connection_request', {
        p_request_id: requestId,
      });

      if (error) throw new Error(error.message);

      // Also create corresponding exchange record if not existing
      await (supabase.from('exchanges') as any).upsert({
        connection_request_id: requestId,
        status: 'in_progress',
      });

      return { conversationId: data.conversation_id };
    }

    // Local Preview Storage fallback
    const list = this.getLocalRequests();
    const req = list.find((r) => r.id === requestId && r.recipient_id === userId);
    if (!req) throw new Error('Request not found or unauthorized');
    if (req.status !== 'pending') throw new Error(`Cannot accept request in status: ${req.status}`);

    req.status = 'accepted';
    req.updated_at = new Date().toISOString();
    this.saveLocalRequests(list);

    // Create Conversation in local preview storage
    const LOCAL_KEY_CONVS = 'pairly_dev_conversations';
    const convsRaw = localStorage.getItem(LOCAL_KEY_CONVS);
    const convs = convsRaw ? JSON.parse(convsRaw) : [];

    const convId = 'conv-' + Math.random().toString(36).substring(2, 9);
    const newConv = {
      id: convId,
      connection_request_id: requestId,
      participant_one_id: req.requester_id,
      participant_two_id: req.recipient_id,
      created_at: new Date().toISOString(),
      last_message_at: req.message ? new Date().toISOString() : null,
      participant_one: req.requester,
      participant_two: req.recipient,
    };
    convs.unshift(newConv);
    localStorage.setItem(LOCAL_KEY_CONVS, JSON.stringify(convs));

    // If request had message, save as first message
    if (req.message) {
      const LOCAL_KEY_MSGS = 'pairly_dev_messages_' + convId;
      const msgs = [
        {
          id: 'msg-' + Math.random().toString(36).substring(2, 9),
          conversation_id: convId,
          sender_id: req.requester_id,
          content: req.message,
          created_at: new Date().toISOString(),
          read_at: null,
          sender: req.requester,
        },
      ];
      localStorage.setItem(LOCAL_KEY_MSGS, JSON.stringify(msgs));
    }

    // Initialize local Exchange record
    const LOCAL_KEY_EXCHANGES = 'pairly_dev_exchanges';
    const exchsRaw = localStorage.getItem(LOCAL_KEY_EXCHANGES);
    const exchs = exchsRaw ? JSON.parse(exchsRaw) : [];
    exchs.unshift({
      id: 'exch-' + Math.random().toString(36).substring(2, 9),
      connection_request_id: requestId,
      status: 'in_progress',
      requester_confirmed_at: null,
      recipient_confirmed_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      connection_request: req,
    });
    localStorage.setItem(LOCAL_KEY_EXCHANGES, JSON.stringify(exchs));

    return { conversationId: convId };
  }
}
