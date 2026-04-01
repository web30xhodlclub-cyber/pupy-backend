/**
 * Supabase 配置与初始化
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabaseClient: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('缺少SUPABASE_URL或SUPABASE_ANON_KEY环境变量');
}

/**
 * 初始化Supabase客户端
 */
export async function initializeSupabase(): Promise<void> {
  try {
    // 常规客户端（带有RLS）
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    // 管理员客户端（绕过RLS）
    if (SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
        },
      });
    }

    console.log('✅ Supabase 客户端初始化成功');
  } catch (error) {
    console.error('❌ Supabase 初始化失败:', error);
    throw error;
  }
}

/**
 * 获取Supabase客户端
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase 未初始化。请先调用 initializeSupabase()');
  }
  return supabaseClient;
}

/**
 * 获取Supabase管理员客户端
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase 管理员客户端未初始化');
  }
  return supabaseAdmin;
}

/**
 * 数据库查询帮手类
 */
export class Database {
  private client: SupabaseClient;

  constructor(isAdmin: boolean = false) {
    this.client = isAdmin ? getSupabaseAdmin() : getSupabase();
  }

  /**
   * 从表中查询数据
   */
  async select<T = any>(table: string, options?: any) {
    let query = this.client.from(table).select('*');
    
    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query = (query as any).eq(key, value);
      }
    }

    if (options?.limit) {
      query = (query as any).limit(options.limit);
    }

    if (options?.offset) {
      query = (query as any).range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const result = await query;
    
    if (result.error) {
      throw new Error(`查询失败: ${result.error.message}`);
    }

    return result.data as T[];
  }

  /**
   * 插入单行
   */
  async insert<T = any>(table: string, data: T) {
    const result = await this.client
      .from(table)
      .insert([data])
      .select();

    if (result.error) {
      throw new Error(`插入失败: ${result.error.message}`);
    }

    return result.data?.[0] as T;
  }

  /**
   * 更新单行
   */
  async update<T = any>(table: string, id: string, data: Partial<T>) {
    const result = await this.client
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    if (result.error) {
      throw new Error(`更新失败: ${result.error.message}`);
    }

    return result.data?.[0] as T;
  }

  /**
   * 删除单行
   */
  async delete(table: string, id: string) {
    const result = await this.client
      .from(table)
      .delete()
      .eq('id', id);

    if (result.error) {
      throw new Error(`删除失败: ${result.error.message}`);
    }
  }

  /**
   * 执行原始查询
   */
  async sql<T = any>(query: string, params?: any[]) {
    const result = await this.client.rpc('exec_sql', { query, params });
    
    if (result.error) {
      throw new Error(`SQL执行失败: ${result.error.message}`);
    }

    return result.data as T[];
  }
}

export default getSupabase;
