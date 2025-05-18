import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search',
        query: { q: searchQuery },
      });
    }
  };

  return (
    <div className="container py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Search Images & Videos with{' '}
          <span className="text-primary-600">Natural Language</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Discover your visual content using semantic search powered by AI
        </p>
        
        <div className="mt-10">
          <form onSubmit={handleSearch} className="flex w-full max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe what you're looking for..."
              className="flex-grow input text-lg"
              aria-label="Search query"
            />
            <button
              type="submit"
              className="ml-4 btn btn-primary"
              disabled={!searchQuery.trim()}
            >
              Search
            </button>
          </form>
        </div>
        
        <div className="mt-8 flex justify-center space-x-6">
          <Link href="/upload" className="btn btn-secondary">
            Upload Media
          </Link>
          <Link href="/albums" className="btn btn-secondary">
            Browse Albums
          </Link>
        </div>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-primary-600 flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center">Upload Content</h3>
            <p className="mt-2 text-gray-600 text-center">
              Upload your images and videos to create a searchable collection
            </p>
          </div>
          
          <div className="card">
            <div className="text-primary-600 flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center">Organize Albums</h3>
            <p className="mt-2 text-gray-600 text-center">
              Create albums to keep your media organized by theme or project
            </p>
          </div>
          
          <div className="card">
            <div className="text-primary-600 flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center">Natural Search</h3>
            <p className="mt-2 text-gray-600 text-center">
              Search by description using natural language to find matching content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}