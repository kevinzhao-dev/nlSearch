import { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  async function search() {
    const response = await fetch('http://localhost:50051/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    setResults(data.results);
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">nlSearch</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2"
        placeholder="Search images or videos..."
      />
      <button onClick={search} className="ml-2 px-4 py-2 bg-blue-500 text-white">
        Search
      </button>
      <ul>
        {results.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
