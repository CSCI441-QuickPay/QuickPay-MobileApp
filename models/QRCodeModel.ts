// models/QRCodeModel.ts
import { supabase } from '@/config/supabaseConfig';

export interface QRCode {
  id?: string;
  userId: string;
  qrData: string;
  qrType: 'payment' | 'receive' | 'group_expense';
  amount?: number;
  description?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DBQRCode {
  id: string;
  user_id: string;
  qr_data: string;
  qr_type: string;
  amount?: number;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export default class QRCodeModel {
  /** Convert database row to QRCode object */
  private static toQRCode(dbQRCode: DBQRCode): QRCode {
    return {
      id: dbQRCode.id,
      userId: dbQRCode.user_id,
      qrData: dbQRCode.qr_data,
      qrType: dbQRCode.qr_type as 'payment' | 'receive' | 'group_expense',
      amount: dbQRCode.amount,
      description: dbQRCode.description,
      isActive: dbQRCode.is_active,
      expiresAt: dbQRCode.expires_at ? new Date(dbQRCode.expires_at) : undefined,
      createdAt: new Date(dbQRCode.created_at),
      updatedAt: new Date(dbQRCode.updated_at),
    };
  }

  /** Convert QRCode object to database row */
  private static toDBQRCode(qrCode: QRCode): Partial<DBQRCode> {
    return {
      user_id: qrCode.userId,
      qr_data: qrCode.qrData,
      qr_type: qrCode.qrType,
      amount: qrCode.amount,
      description: qrCode.description,
      is_active: qrCode.isActive,
      expires_at: qrCode.expiresAt?.toISOString(),
    };
  }

  /**
   * Create a new QR code
   */
  static async create(qrCode: QRCode): Promise<QRCode> {
    const dbQRCode = this.toDBQRCode(qrCode);

    const { data, error } = await supabase
      .from('qr_codes')
      .insert(dbQRCode)
      .select()
      .single();

    if (error) {
      console.error('Error creating QR code:', error);
      throw new Error(`Failed to create QR code: ${error.message}`);
    }

    return this.toQRCode(data);
  }

  /**
   * Get QR code by ID
   */
  static async getById(id: string): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching QR code:', error);
      throw new Error(`Failed to fetch QR code: ${error.message}`);
    }

    return this.toQRCode(data);
  }

  /**
   * Get all QR codes for a user
   */
  static async getByUserId(userId: string): Promise<QRCode[]> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QR codes for user:', error);
      throw new Error(`Failed to fetch QR codes: ${error.message}`);
    }

    return data.map(this.toQRCode);
  }

  /**
   * Get active QR codes for a user
   */
  static async getActiveByUserId(userId: string): Promise<QRCode[]> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active QR codes:', error);
      throw new Error(`Failed to fetch active QR codes: ${error.message}`);
    }

    return data.map(this.toQRCode);
  }

  /**
   * Update QR code
   */
  static async update(id: string, updates: Partial<QRCode>): Promise<QRCode> {
    const dbUpdates = this.toDBQRCode(updates as QRCode);

    const { data, error } = await supabase
      .from('qr_codes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating QR code:', error);
      throw new Error(`Failed to update QR code: ${error.message}`);
    }

    return this.toQRCode(data);
  }

  /**
   * Deactivate QR code
   */
  static async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('qr_codes')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating QR code:', error);
      throw new Error(`Failed to deactivate QR code: ${error.message}`);
    }
  }

  /**
   * Delete QR code
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting QR code:', error);
      throw new Error(`Failed to delete QR code: ${error.message}`);
    }
  }

  /**
   * Generate QR data for a payment
   */
  static generatePaymentQRData(
    accountNumber: string,
    amount?: number,
    description?: string
  ): string {
    const data = {
      type: 'quickpay_payment',
      accountNumber,
      amount,
      description,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(data);
  }

  /**
   * Parse QR data from scanned code
   */
  static parseQRData(qrData: string): {
    type: string;
    accountNumber: string;
    amount?: number;
    description?: string;
  } | null {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type === 'quickpay_payment' && parsed.accountNumber) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  }
}
