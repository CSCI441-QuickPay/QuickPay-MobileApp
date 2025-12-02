// models/ExternalServiceLogModel.ts
import { supabase } from '@/config/supabaseConfig';

export type ServiceName = 'plaid' | 'stripe' | 'clerk' | 'firebase' | 'supabase' | 'other';
export type ServiceAction = 'link_bank' | 'create_payment' | 'auth' | 'sync' | 'webhook' | 'other';
export type ServiceStatus = 'success' | 'failure' | 'pending';

export interface ExternalServiceLog {
  id?: string;
  userId?: string;
  serviceName: ServiceName;
  action: ServiceAction;
  status: ServiceStatus;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  createdAt?: Date;
}

interface DBServiceLog {
  id: string;
  user_id?: string;
  service_name: string;
  action: string;
  status: string;
  request_data?: any;
  response_data?: any;
  error_message?: string;
  created_at: string;
}

export default class ExternalServiceLogModel {
  private static toServiceLog(dbLog: DBServiceLog): ExternalServiceLog {
    return {
      id: dbLog.id,
      userId: dbLog.user_id,
      serviceName: dbLog.service_name as ServiceName,
      action: dbLog.action as ServiceAction,
      status: dbLog.status as ServiceStatus,
      requestData: dbLog.request_data,
      responseData: dbLog.response_data,
      errorMessage: dbLog.error_message,
      createdAt: new Date(dbLog.created_at),
    };
  }

  static async create(logData: Omit<ExternalServiceLog, 'id' | 'createdAt'>): Promise<ExternalServiceLog> {
    try {
      const { data, error } = await supabase
        .from('external_service_logs')
        .insert({
          user_id: logData.userId,
          service_name: logData.serviceName,
          action: logData.action,
          status: logData.status,
          request_data: logData.requestData,
          response_data: logData.responseData,
          error_message: logData.errorMessage,
        })
        .select()
        .single();

      if (error) throw error;
      return this.toServiceLog(data as DBServiceLog);
    } catch (err) {
      console.error('L Error creating service log:', err);
      throw err;
    }
  }

  static async get(id: string): Promise<ExternalServiceLog | null> {
    try {
      const { data, error } = await supabase
        .from('external_service_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.toServiceLog(data as DBServiceLog);
    } catch (err) {
      console.error('L Error fetching service log:', err);
      throw err;
    }
  }

  static async getByUserId(userId: string, limit: number = 50): Promise<ExternalServiceLog[]> {
    try {
      const { data, error } = await supabase
        .from('external_service_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as DBServiceLog[]).map(this.toServiceLog);
    } catch (err) {
      console.error('L Error fetching service logs:', err);
      throw err;
    }
  }

  static async getByService(serviceName: ServiceName, limit: number = 100): Promise<ExternalServiceLog[]> {
    try {
      const { data, error } = await supabase
        .from('external_service_logs')
        .select('*')
        .eq('service_name', serviceName)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as DBServiceLog[]).map(this.toServiceLog);
    } catch (err) {
      console.error('L Error fetching service logs by service:', err);
      throw err;
    }
  }

  static async getFailures(userId?: string, limit: number = 50): Promise<ExternalServiceLog[]> {
    try {
      let query = supabase
        .from('external_service_logs')
        .select('*')
        .eq('status', 'failure')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as DBServiceLog[]).map(this.toServiceLog);
    } catch (err) {
      console.error('L Error fetching failed service logs:', err);
      throw err;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('external_service_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('L Error deleting service log:', err);
      throw err;
    }
  }

  static async deleteOlderThan(days: number): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { error } = await supabase
        .from('external_service_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (err) {
      console.error('L Error deleting old service logs:', err);
      throw err;
    }
  }

  // Helper method to log API calls
  static async logAPICall(
    userId: string | undefined,
    serviceName: ServiceName,
    action: ServiceAction,
    requestData: any,
    response: any,
    isSuccess: boolean
  ): Promise<void> {
    try {
      await this.create({
        userId,
        serviceName,
        action,
        status: isSuccess ? 'success' : 'failure',
        requestData,
        responseData: isSuccess ? response : undefined,
        errorMessage: !isSuccess ? (response?.message || 'Unknown error') : undefined,
      });
    } catch (err) {
      // Don't throw errors from logging - just log to console
      console.error('Failed to log API call:', err);
    }
  }
}
