// ============================================================
// ILMS REAL-TIME SERVICE
// WebSocket subscriptions for live data updates
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type SubscriptionCallback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

// Store active channels for cleanup
const activeChannels: Map<string, RealtimeChannel> = new Map();

// ============================================================
// DIVISION SUBMISSION SUBSCRIPTIONS
// ============================================================

const DIVISION_TABLES = [
  'survey_submissions',
  'planning_submissions',
  'ilg_submissions',
  'state_submissions',
  'titles_submissions',
  'customer_submissions',
  'legal_cases',
  'audit_findings',
  'corporate_matters',
  'system_submissions',
] as const;

export type DivisionTable = typeof DIVISION_TABLES[number];

/**
 * Subscribe to changes on a specific division table
 */
export function subscribeToDivision(
  table: DivisionTable,
  callback: SubscriptionCallback
): (() => void) | null {
  if (!isSupabaseConfigured()) return null;

  const channelName = `division-${table}`;

  // Clean up existing channel if any
  if (activeChannels.has(channelName)) {
    activeChannels.get(channelName)?.unsubscribe();
    activeChannels.delete(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      callback
    )
    .subscribe();

  activeChannels.set(channelName, channel);

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

/**
 * Subscribe to all division tables at once
 */
export function subscribeToAllDivisions(
  callback: (table: DivisionTable, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): (() => void) | null {
  if (!isSupabaseConfigured()) return null;

  const unsubscribeFunctions: (() => void)[] = [];

  for (const table of DIVISION_TABLES) {
    const unsubscribe = subscribeToDivision(table, (payload) => {
      callback(table, payload);
    });
    if (unsubscribe) {
      unsubscribeFunctions.push(unsubscribe);
    }
  }

  // Return combined unsubscribe function
  return () => {
    for (const unsubscribe of unsubscribeFunctions) {
      unsubscribe();
    }
  };
}

// ============================================================
// EXECUTIVE ALERTS SUBSCRIPTION
// ============================================================

/**
 * Subscribe to executive alerts
 */
export function subscribeToAlerts(callback: SubscriptionCallback): (() => void) | null {
  if (!isSupabaseConfigured()) return null;

  const channelName = 'exec-alerts';

  if (activeChannels.has(channelName)) {
    activeChannels.get(channelName)?.unsubscribe();
    activeChannels.delete(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'exec_alerts',
      },
      callback
    )
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

// ============================================================
// EXECUTIVE DIRECTIVES SUBSCRIPTION
// ============================================================

/**
 * Subscribe to executive directives
 */
export function subscribeToDirectives(callback: SubscriptionCallback): (() => void) | null {
  if (!isSupabaseConfigured()) return null;

  const channelName = 'exec-directives';

  if (activeChannels.has(channelName)) {
    activeChannels.get(channelName)?.unsubscribe();
    activeChannels.delete(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'exec_directives',
      },
      callback
    )
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

// ============================================================
// INTER-DIVISION REQUESTS SUBSCRIPTION
// ============================================================

/**
 * Subscribe to inter-division requests
 */
export function subscribeToInterDivisionRequests(callback: SubscriptionCallback): (() => void) | null {
  if (!isSupabaseConfigured()) return null;

  const channelName = 'exec-interdivision';

  if (activeChannels.has(channelName)) {
    activeChannels.get(channelName)?.unsubscribe();
    activeChannels.delete(channelName);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'exec_interdivision_requests',
      },
      callback
    )
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

// ============================================================
// COMBINED EXECUTIVE SUBSCRIPTION
// ============================================================

export interface ExecutiveRealtimeCallbacks {
  onAlert?: SubscriptionCallback;
  onDirective?: SubscriptionCallback;
  onInterDivision?: SubscriptionCallback;
  onDivisionChange?: (table: DivisionTable, payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

/**
 * Subscribe to all executive-relevant tables
 */
export function subscribeToExecutiveDashboard(
  callbacks: ExecutiveRealtimeCallbacks
): (() => void) | null {
  if (!isSupabaseConfigured()) return null;

  const unsubscribeFunctions: (() => void)[] = [];

  if (callbacks.onAlert) {
    const unsub = subscribeToAlerts(callbacks.onAlert);
    if (unsub) unsubscribeFunctions.push(unsub);
  }

  if (callbacks.onDirective) {
    const unsub = subscribeToDirectives(callbacks.onDirective);
    if (unsub) unsubscribeFunctions.push(unsub);
  }

  if (callbacks.onInterDivision) {
    const unsub = subscribeToInterDivisionRequests(callbacks.onInterDivision);
    if (unsub) unsubscribeFunctions.push(unsub);
  }

  if (callbacks.onDivisionChange) {
    const unsub = subscribeToAllDivisions(callbacks.onDivisionChange);
    if (unsub) unsubscribeFunctions.push(unsub);
  }

  return () => {
    for (const unsubscribe of unsubscribeFunctions) {
      unsubscribe();
    }
  };
}

// ============================================================
// CLEANUP
// ============================================================

/**
 * Unsubscribe from all active channels
 */
export function unsubscribeAll(): void {
  for (const [, channel] of activeChannels) {
    channel.unsubscribe();
  }
  activeChannels.clear();
}

/**
 * Get count of active subscriptions
 */
export function getActiveSubscriptionCount(): number {
  return activeChannels.size;
}
