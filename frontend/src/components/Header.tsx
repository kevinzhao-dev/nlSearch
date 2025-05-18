import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              nlSearch
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/" className="text-gray-900 hover:text-primary-600">
                Home
              </Link>
              <Link href="/search" className="text-gray-900 hover:text-primary-600">
                Search
              </Link>
              <Link href="/upload" className="text-gray-900 hover:text-primary-600">
                Upload
              </Link>
              <Link href="/albums" className="text-gray-900 hover:text-primary-600">
                Albums
              </Link>
            </nav>
          </div>
          
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-900 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container py-2 space-y-1">
            <Link href="/" className="block px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md">
              Home
            </Link>
            <Link href="/search" className="block px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md">
              Search
            </Link>
            <Link href="/upload" className="block px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md">
              Upload
            </Link>
            <Link href="/albums" className="block px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md">
              Albums
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}