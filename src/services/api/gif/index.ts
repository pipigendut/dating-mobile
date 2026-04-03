import { GifProvider, GifProviderType, Gif } from './types';
import { klipyProvider } from './klipy_provider';

class GifService {
  private providers: Map<GifProviderType, GifProvider> = new Map();
  private activeProvider: GifProviderType = 'klipy';

  constructor() {
    this.providers.set('klipy', klipyProvider);
    // Future providers can be added here
    // this.providers.set('giphy', giphyProvider);
  }

  setProvider(type: GifProviderType) {
    if (this.providers.has(type)) {
      this.activeProvider = type;
    }
  }

  getProvider(type?: GifProviderType): GifProvider {
    const provider = this.providers.get(type || this.activeProvider);
    if (!provider) {
      throw new Error(`Provider ${type || this.activeProvider} not found`);
    }
    return provider;
  }

  async search(query: string, limit?: number, offset?: number): Promise<Gif[]> {
    return this.getProvider().search(query, limit, offset);
  }

  async getTrending(limit?: number, offset?: number): Promise<Gif[]> {
    return this.getProvider().getTrending(limit, offset);
  }
}

export const gifService = new GifService();
