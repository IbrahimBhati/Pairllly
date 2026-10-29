import { getSupabase } from '../supabase/client';
import { getSupabaseEnv } from '../supabase/env';
import type { Review, Profile } from '../../types/database';

const LOCAL_KEY_REVIEWS = 'pairly_dev_reviews';

export class ReviewsService {
  private static getLocalReviews(): Review[] {
    const raw = localStorage.getItem(LOCAL_KEY_REVIEWS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveLocalReviews(list: Review[]): void {
    localStorage.setItem(LOCAL_KEY_REVIEWS, JSON.stringify(list));
  }

  /**
   * Submits a review for a completed exchange.
   */
  static async submitReview(params: {
    exchangeId: string;
    reviewerId: string;
    reviewerProfile?: Profile;
    revieweeId: string;
    revieweeProfile?: Profile;
    rating: number;
    feedback: string;
  }): Promise<Review> {
    if (params.reviewerId === params.revieweeId) {
      throw new Error('You cannot review yourself.');
    }
    if (params.rating < 1 || params.rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars.');
    }
    const cleanFeedback = params.feedback.trim();
    if (cleanFeedback.length < 5) {
      throw new Error('Please provide constructive feedback (at least 5 characters).');
    }

    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('reviews') as any)
        .insert({
          exchange_id: params.exchangeId,
          reviewer_id: params.reviewerId,
          reviewee_id: params.revieweeId,
          rating: params.rating,
          feedback: cleanFeedback,
        })
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*), reviewee:profiles!reviews_reviewee_id_fkey(*)')
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already submitted a review for this exchange.');
        }
        throw new Error(error.message);
      }
      return data as Review;
    }

    // Local Preview Storage fallback
    const list = this.getLocalReviews();
    const existing = list.find(
      (r) => r.exchange_id === params.exchangeId && r.reviewer_id === params.reviewerId
    );
    if (existing) {
      throw new Error('You have already submitted a review for this exchange.');
    }

    const newRev: Review = {
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      exchange_id: params.exchangeId,
      reviewer_id: params.reviewerId,
      reviewee_id: params.revieweeId,
      rating: params.rating,
      feedback: cleanFeedback,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reviewer: params.reviewerProfile,
      reviewee: params.revieweeProfile,
    };

    list.unshift(newRev);
    this.saveLocalReviews(list);
    return newRev;
  }

  /**
   * Retrieves all reviews written for a user (reviews received).
   */
  static async getReviewsForUser(userId: string): Promise<Review[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('reviews') as any)
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as Review[];
    }

    const list = this.getLocalReviews();
    return list.filter((r) => r.reviewee_id === userId);
  }

  /**
   * Retrieves all reviews for a specific exchange.
   */
  static async getReviewsForExchange(exchangeId: string): Promise<Review[]> {
    const supabase = getSupabase();
    const env = getSupabaseEnv();

    if (supabase && env.isConfigured) {
      const { data, error } = await (supabase.from('reviews') as any)
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
        .eq('exchange_id', exchangeId);

      if (error) throw new Error(error.message);
      return (data || []) as Review[];
    }

    const list = this.getLocalReviews();
    return list.filter((r) => r.exchange_id === exchangeId);
  }
}
