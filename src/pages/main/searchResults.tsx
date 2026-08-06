// src/pages/SearchResults.tsx
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../lib/fetchwithAuth";

interface SearchResultItem {
  id: number;
  type: "animal" | "task" | "user";
  title: string;
  subtitle?: string;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);

    fetchWithAuth(`/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      signal: controller.signal,
    })
      .then((res) => setResults(res?.data ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  return (
    <div className="pt-24 px-6 font-poppins">
      <h1 className="text-xl font-semibold text-darkText mb-4">
        Résultats pour « {query} »
      </h1>

      {loading && <p className="text-gray-400 text-sm">Recherche...</p>}

      {!loading && results.length === 0 && query && (
        <p className="text-gray-400 text-sm">Aucun résultat trouvé.</p>
      )}

      <div className="space-y-2">
        {results.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
          >
            <p className="text-sm font-medium text-darkText">{item.title}</p>
            {item.subtitle && (
              <p className="text-xs text-gray-400">{item.subtitle}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;