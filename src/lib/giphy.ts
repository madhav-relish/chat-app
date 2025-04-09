// GIPHY API service
// Using direct API calls instead of SDK to allow 18+ content

// You'll need to get an API key from https://developers.giphy.com/
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'YOUR_API_KEY';
const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs';

export interface GiphyGif {
  id: string;
  title: string;
  url: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
    downsized: {
      url: string;
      width: string;
      height: string;
    };
  };
}

export interface GiphySearchResponse {
  data: GiphyGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
  meta: {
    status: number;
    msg: string;
    response_id: string;
  };
}

/**
 * Search for GIFs on GIPHY
 * @param query Search query
 * @param limit Number of results to return (default: 20)
 * @param offset Pagination offset (default: 0)
 * @param rating Content rating (default: 'r' to allow adult content)
 */
export async function searchGifs(
  query: string,
  limit: number = 20,
  offset: number = 0,
  rating: 'g' | 'pg' | 'pg-13' | 'r' = 'r'
): Promise<GiphySearchResponse> {
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    q: query,
    limit: limit.toString(),
    offset: offset.toString(),
    rating: rating,
    lang: 'en',
  });

  const response = await fetch(`${GIPHY_API_URL}/search?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`GIPHY API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get trending GIFs
 * @param limit Number of results to return (default: 20)
 * @param offset Pagination offset (default: 0)
 * @param rating Content rating (default: 'r' to allow adult content)
 */
export async function getTrendingGifs(
  limit: number = 20,
  offset: number = 0,
  rating: 'g' | 'pg' | 'pg-13' | 'r' = 'r'
): Promise<GiphySearchResponse> {
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    limit: limit.toString(),
    offset: offset.toString(),
    rating: rating,
  });

  const response = await fetch(`${GIPHY_API_URL}/trending?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`GIPHY API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a random GIF
 * @param tag Tag to limit random results
 * @param rating Content rating (default: 'r' to allow adult content)
 */
export async function getRandomGif(
  tag?: string,
  rating: 'g' | 'pg' | 'pg-13' | 'r' = 'r'
): Promise<{ data: GiphyGif }> {
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    rating: rating,
  });

  if (tag) {
    params.append('tag', tag);
  }

  const response = await fetch(`${GIPHY_API_URL}/random?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`GIPHY API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
