import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { uploadMedia, getAlbums, AlbumInfo, createAlbum } from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [albums, setAlbums] = useState<AlbumInfo[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>(undefined);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [metadata, setMetadata] = useState('');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load albums on initial render
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const albumsData = await getAlbums();
        setAlbums(albumsData);
      } catch (error) {
        console.error('Failed to load albums:', error);
        setError('Failed to load albums. Please refresh the page.');
      }
    };
    
    loadAlbums();
  }, []);

  // File dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for only images and videos
    const mediaFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    setFiles(prev => [...prev, ...mediaFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxSize: 30 * 1024 * 1024, // 30MB limit
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    
    setIsCreatingAlbum(true);
    setError(null);
    
    try {
      const newAlbum = await createAlbum(newAlbumName);
      setAlbums(prev => [...prev, newAlbum]);
      setSelectedAlbumId(newAlbum.id);
      setNewAlbumName('');
      setSuccess('Album created successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to create album:', error);
      setError('Failed to create album. Please try again.');
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    setUploadedCount(0);
    
    let metadataObj = {};
    if (metadata.trim()) {
      try {
        metadataObj = JSON.parse(metadata);
      } catch (e) {
        setError('Invalid metadata JSON. Please correct and try again.');
        setIsUploading(false);
        return;
      }
    }
    
    const totalFiles = files.length;
    let successCount = 0;
    
    for (let i = 0; i < totalFiles; i++) {
      try {
        await uploadMedia(files[i], selectedAlbumId, metadataObj);
        successCount++;
      } catch (error) {
        console.error(`Failed to upload file ${files[i].name}:`, error);
      }
      
      setUploadedCount(i + 1);
      setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }
    
    if (successCount === totalFiles) {
      setSuccess(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}.`);
      setFiles([]);
    } else if (successCount > 0) {
      setSuccess(`Uploaded ${successCount} of ${totalFiles} file${totalFiles !== 1 ? 's' : ''}.`);
      setError(`Failed to upload ${totalFiles - successCount} file${totalFiles - successCount !== 1 ? 's' : ''}.`);
      
      // Keep only the failed files
      setFiles(prev => prev.slice(successCount));
    } else {
      setError('All uploads failed. Please try again.');
    }
    
    setIsUploading(false);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Media</h1>
      
      <div className="card mb-8">
        <div className="space-y-6">
          {/* Album selection section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Album</h2>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="md:w-1/2">
                <label htmlFor="album-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Choose an Album (Optional)
                </label>
                <select
                  id="album-select"
                  value={selectedAlbumId || ''}
                  onChange={(e) => setSelectedAlbumId(e.target.value || undefined)}
                  className="input w-full"
                  disabled={isUploading}
                >
                  <option value="">No Album</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.name} ({album.mediaCount})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:w-1/2">
                <label htmlFor="new-album" className="block text-sm font-medium text-gray-700 mb-1">
                  Create New Album
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="new-album"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="New album name"
                    className="input flex-grow"
                    disabled={isCreatingAlbum || isUploading}
                  />
                  <button
                    type="button"
                    onClick={handleCreateAlbum}
                    className="ml-4 btn btn-secondary"
                    disabled={isCreatingAlbum || isUploading || !newAlbumName.trim()}
                  >
                    {isCreatingAlbum ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dropzone section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Files</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive
                    ? 'Drop files here...'
                    : 'Drag & drop files here, or click to select files'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports images (JPG, PNG, etc.) and videos (MP4, etc.) up to 30MB
                </p>
              </div>
            </div>
          </div>
          
          {/* File list section */}
          {files.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selected Files ({files.length})</h2>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{file.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{file.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-900"
                              disabled={isUploading}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Metadata section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Add Metadata (Optional)</h2>
            <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-1">
              JSON Metadata
            </label>
            <textarea
              id="metadata"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder='{"tags": ["vacation", "beach"], "location": "Hawaii"}'
              className="input w-full h-32 font-mono"
              disabled={isUploading}
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              Enter valid JSON to be stored with all uploaded files
            </p>
          </div>
          
          {/* Progress and buttons */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Uploading {uploadedCount} of {files.length}...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
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
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setMetadata('');
              }}
              className="btn btn-secondary"
              disabled={isUploading || files.length === 0}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}