import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAlbums, createAlbum, AlbumInfo } from '@/lib/api';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<AlbumInfo[]>([]);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const albumsData = await getAlbums();
      setAlbums(albumsData);
    } catch (error) {
      console.error('Failed to load albums:', error);
      setError('Failed to load albums. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAlbumName.trim()) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      const newAlbum = await createAlbum(newAlbumName);
      setAlbums(prev => [...prev, newAlbum]);
      setNewAlbumName('');
      setSuccess('Album created successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to create album:', error);
      setError('Failed to create album. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Albums</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card h-full">
            <h2 className="text-xl font-semibold mb-6">Your Albums</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading albums...</div>
              </div>
            ) : albums.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                <p className="text-lg font-medium text-gray-700">No albums yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create your first album to organize your media
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {albums.map((album) => (
                  <div key={album.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">{album.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {album.mediaCount} media items
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          href={`/search?albumId=${album.id}`}
                          className="text-sm btn btn-secondary py-1 px-3"
                        >
                          Browse
                        </Link>
                        <Link
                          href={`/upload?albumId=${album.id}`}
                          className="text-sm btn btn-secondary py-1 px-3"
                        >
                          Upload
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Create New Album</h2>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label htmlFor="album-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Album Name
                </label>
                <input
                  type="text"
                  id="album-name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Enter album name"
                  className="input w-full"
                  disabled={isCreating}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isCreating || !newAlbumName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Album'}
              </button>
            </form>
          </div>
          
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Album Tips</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create albums for different projects or themes
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upload similar content to the same album for better search results
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add detailed metadata to improve search accuracy
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use natural language to search within albums
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}