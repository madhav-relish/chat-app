'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchGifs, getTrendingGifs, type GiphyGif } from '~/lib/giphy';
import { Input } from './input';
import { Button } from './button';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '~/lib/utils';

interface GifPickerProps {
  onSelect: (gif: GiphyGif) => void;
  onClose: () => void;
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load trending GIFs on initial render
  useEffect(() => {
    const loadTrending = async () => {
      try {
        setLoading(true);
        const response = await getTrendingGifs(20, 0, 'r');
        setGifs(response.data);
      } catch (err) {
        setError('Failed to load trending GIFs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setOffset(0);
      const response = await searchGifs(query, 20, 0, 'r');
      setGifs(response.data);
    } catch (err) {
      setError('Failed to search GIFs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load more GIFs when scrolling to bottom
  const loadMore = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const newOffset = offset + 20;
      const response = query.trim()
        ? await searchGifs(query, 20, newOffset, 'r')
        : await getTrendingGifs(20, newOffset, 'r');
      
      setGifs((prevGifs) => [...prevGifs, ...response.data]);
      setOffset(newOffset);
    } catch (err) {
      setError('Failed to load more GIFs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll to load more
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Select a GIF</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Search GIFs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        <div
          ref={containerRef}
          className="grid h-[400px] grid-cols-2 gap-2 overflow-y-auto"
          onScroll={handleScroll}
        >
          {gifs.map((gif) => (
            <div
              key={gif.id}
              className="cursor-pointer overflow-hidden rounded-md h-28 hover:opacity-80"
              onClick={() => onSelect(gif)}
            >
              <img
                src={gif.images.fixed_height.url}
                alt={gif.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}

          {loading && (
            <div className="col-span-2 flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          )}

          {!loading && gifs.length === 0 && (
            <div className="col-span-2 py-8 text-center text-gray-500">
              No GIFs found. Try a different search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
