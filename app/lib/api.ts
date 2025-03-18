/**
 * Basic API client for handling frontend-to-backend requests
 */

export const api = {
  /**
   * Generic GET request
   */
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Generic POST request
   */
  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Chat API
   */
  chat: {
    send: async (message: string) => {
      return api.post('/api/chat', { message });
    },
    getByChatId: async (chatId: string) => {
      return api.get(`/api/chat/${chatId}`);
    },
  },

  /**
   * Enhancer API
   */
  enhancer: {
    enhance: async (code: string) => {
      return api.post('/api/enhancer', { code });
    },
  },
};
