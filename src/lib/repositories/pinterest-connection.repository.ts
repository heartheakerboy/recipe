import {
  PinterestConnection,
  PinterestConnectionPublic,
} from '../types/pinterest-connection';

declare global {
  var __FLAVORNEST_PINTEREST_CONNECTION__: PinterestConnection | undefined;
}

function maskSecretToken(token: string): string {
  if (!token || token.length < 8) return '••••••••';
  const prefix = token.slice(0, 5);
  const suffix = token.slice(-4);
  return `${prefix}...${suffix}`;
}

export class PinterestConnectionRepository {
  private getStore(): PinterestConnection | null {
    if (!global.__FLAVORNEST_PINTEREST_CONNECTION__) {
      // Check if environment token is provided as initial fallback
      const envToken = process.env.PINTEREST_ACCESS_TOKEN;
      if (envToken) {
        global.__FLAVORNEST_PINTEREST_CONNECTION__ = {
          id: 'conn_env_default',
          accountIdentifier: 'flavornest_official',
          accountUsername: 'FlavorNest Recipes',
          accessToken: envToken,
          scopes: ['boards:read', 'pins:read', 'pins:write'],
          status: 'connected',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        return null;
      }
    }
    return global.__FLAVORNEST_PINTEREST_CONNECTION__;
  }

  // SERVER-SIDE ONLY: Never expose return value to client
  async getConnection(): Promise<PinterestConnection | null> {
    return this.getStore();
  }

  // CLIENT-SAFE: Redacts raw accessToken & refreshToken
  async getPublicConnection(): Promise<PinterestConnectionPublic | null> {
    const conn = this.getStore();
    if (!conn || conn.status === 'disconnected') {
      return null;
    }

    const now = new Date();
    const isExpired = conn.tokenExpiresAt ? new Date(conn.tokenExpiresAt) < now : false;

    return {
      id: conn.id,
      accountIdentifier: conn.accountIdentifier,
      accountUsername: conn.accountUsername,
      tokenExpiresAt: conn.tokenExpiresAt,
      scopes: conn.scopes,
      status: isExpired ? 'expired' : conn.status,
      isTokenValid: !isExpired && conn.status === 'connected',
      maskedToken: maskSecretToken(conn.accessToken),
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    };
  }

  async saveConnection(
    data: Omit<PinterestConnection, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PinterestConnection> {
    const now = new Date().toISOString();
    const existing = this.getStore();
    const connection: PinterestConnection = {
      ...data,
      id: existing?.id || `conn_${Date.now()}`,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    global.__FLAVORNEST_PINTEREST_CONNECTION__ = connection;
    return connection;
  }

  async disconnect(): Promise<void> {
    if (global.__FLAVORNEST_PINTEREST_CONNECTION__) {
      global.__FLAVORNEST_PINTEREST_CONNECTION__.status = 'disconnected';
      global.__FLAVORNEST_PINTEREST_CONNECTION__.accessToken = '';
      global.__FLAVORNEST_PINTEREST_CONNECTION__.refreshToken = undefined;
      global.__FLAVORNEST_PINTEREST_CONNECTION__.updatedAt = new Date().toISOString();
    }
  }
}

export const pinterestConnectionRepository = new PinterestConnectionRepository();
