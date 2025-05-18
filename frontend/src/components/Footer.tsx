export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} nlSearch. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0">
            <a
              href="https://github.com/yourusername/nlSearch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary-600"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}