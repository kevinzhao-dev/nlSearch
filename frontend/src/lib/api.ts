import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API interface types
export interface MediaResult {
  mediaId: string;
  score: number;
  mediaType: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: string;
}

export interface SearchResponse {
  results: MediaResult[];
  totalResults: number;
  truncated: boolean;
}

export interface AlbumInfo {
  id: string;
  name: string;
  mediaCount: number;
}

export interface ServerInfo {
  version: string;
  totalMediaCount: number;
  albums: AlbumInfo[];
  supportedTypes: string[];
}

// API functions
export async function textSearch(query: string, maxResults: number = 20, albumId?: string): Promise<SearchResponse> {
  const response = await apiClient.post('/search', {
    query,
    maxResults,
    albumId,
  });
  return response.data;
}

export async function uploadMedia(
  file: File,
  albumId?: string,
  metadata?: Record<string, any>
): Promise<{ mediaId: string }> {
  const formData = new FormData();
  formData.append('media', file);
  
  if (albumId) {
    formData.append('albumId', albumId);
  }
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }
  
  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

export async function mediaSearch(
  file: File,
  maxResults: number = 20,
  albumId?: string
): Promise<SearchResponse> {
  const formData = new FormData();
  formData.append('media', file);
  formData.append('maxResults', maxResults.toString());
  
  if (albumId) {
    formData.append('albumId', albumId);
  }
  
  const response = await apiClient.post('/media-search', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

export async function getServerInfo(): Promise<ServerInfo> {
  const response = await apiClient.get('/info');
  return response.data;
}

export async function getAlbums(): Promise<AlbumInfo[]> {
  const info = await getServerInfo();
  return info.albums;
}

export async function createAlbum(name: string): Promise<AlbumInfo> {
  const response = await apiClient.post('/albums', { name });
  return response.data;
}

export default {
  textSearch,
  uploadMedia,
  mediaSearch,
  getServerInfo,
  getAlbums,
  createAlbum,
};