export interface Gif {
  id: string;
  url: string;
  preview: string;
  width?: number;
  height?: number;
  provider: string;
}

export interface GifProvider {
  name: string;
  search(query: string, limit?: number, offset?: number): Promise<Gif[]>;
  getTrending(limit?: number, offset?: number): Promise<Gif[]>;
}

export type GifProviderType = 'klipy' | 'giphy' | 'tenor';
