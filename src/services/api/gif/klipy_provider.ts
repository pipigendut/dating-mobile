import apiClient from '../../../lib/api';
import { Gif, GifProvider } from './types';

export class KlipyProvider implements GifProvider {
  name = 'klipy';

  async search(query: string, limit: number = 20, offset: number = 0): Promise<Gif[]> {
    try {
      const response = await apiClient.get<Gif[]>('/chat/gifs/search', {
        params: { q: query, limit, offset },
      });
      return response.data || [];
    } catch (error) {
      console.error('Klipy search error:', error);
      return [];
    }
  }

  async getTrending(limit: number = 20, offset: number = 0): Promise<Gif[]> {
    try {
      const response = await apiClient.get<Gif[]>('/chat/gifs/trending', {
        params: { limit, offset },
      });
      return response.data || [];
    } catch (error) {
      console.error('Klipy trending error:', error);
      return [];
    }
  }
}

export const klipyProvider = new KlipyProvider();
