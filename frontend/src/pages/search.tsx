import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { textSearch, mediaSearch, getAlbums, MediaResult, AlbumInfo } from '@/lib/api';

export default function SearchPage() {
  const router = useRouter();
  const { q: initialQuery, albumId: initialAlbumId } = router.query;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>(undefined);
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [albums, setAlbums] = useState<AlbumInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize search query from URL params
  useEffect(() => {
    if (typeof initialQuery === 'string') {
      setSearchQuery(initialQuery);
      handleTextSearch(initialQuery);
    }
    
    if (typeof initialAlbumId === 'string') {
      setSelectedAlbumId(initialAlbumId);
    }
    
    // Load albums
    const loadAlbums = async () => {
      try {
        const albumsData = await getAlbums();
        setAlbums(albumsData);
      } catch (error) {
        console.error('Failed to load albums:', error);
      }
    };
    
    loadAlbums();
  }, [initialQuery, initialAlbumId]);

  const handleTextSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await textSearch(query, 20, selectedAlbumId);
      setResults(response.results || []);
      
      // Update URL without page reload
      router.push(
        {
          pathname: '/search',
          query: { 
            q: query,
            ...(selectedAlbumId && { albumId: selectedAlbumId })
          },
        },
        undefined,
        { shallow: true }
      );
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async () => {
    if (!searchFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mediaSearch(searchFile, 20, selectedAlbumId);
      setResults(response.results || []);
    } catch (error) {
      console.error('Image search error:', error);
      setError('Failed to perform image search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSearchFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchFile) {
      handleImageSearch();
    } else {
      handleTextSearch();
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Search Media</h1>
      
      <div className="card mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
              Text Search
            </label>
            <div className="flex">
              <input
                id="search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe what you're looking for..."
                className="flex-grow input"
              />
              <button
                type="submit"
                className="ml-4 btn btn-primary"
                disabled={isLoading || (!searchQuery.trim() && !searchFile)}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-grow">
              <label htmlFor="search-file" className="block text-sm font-medium text-gray-700 mb-1">
                Search by Image
              </label>
              <input
                id="search-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            
            <div className="md:w-1/3">
              <label htmlFor="album-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Album (Optional)
              </label>
              <select
                id="album-select"
                value={selectedAlbumId || ''}
                onChange={(e) => setSelectedAlbumId(e.target.value || undefined)}
                className="input w-full"
              >
                <option value="">All Albums</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name} ({album.mediaCount})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {results.length > 0
            ? `Search Results (${results.length})`
            : isLoading
            ? 'Searching...'
            : 'No results to display'}
        </h2>
        
        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((result) => (
              <div key={result.mediaId} className="overflow-hidden rounded-lg shadow bg-white">
                <div className="h-48 relative">
                  {result.mediaType?.includes('video') ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Image
                        src={result.thumbnailUrl || result.url}
                        alt={`Result ${result.mediaId}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-md mb-2">
                        {result.mediaType?.split('/')[0] || 'media'}
                      </span>
                      <div className="text-sm text-gray-500">
                        Score: {result.score.toFixed(2)}
                      </div>
                    </div>
                    
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}