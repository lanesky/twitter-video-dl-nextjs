'use client';

import { useState } from "react";
// import Image from "next/image";

export default function Home() {
  const [tweetUrl, setTweetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get video URL');
      }

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = data.videoUrl;
      a.download = 'twitter-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center">
          Twitter Video Downloader
        </h1>
        
        <div className="w-full space-y-4">
          <input
            type="text"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            placeholder="Paste Twitter video URL here..."
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={handleDownload}
            disabled={loading || !tweetUrl}
            className={`w-full p-4 rounded-lg text-white font-semibold
              ${loading || !tweetUrl 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {loading ? 'Downloading...' : 'Download Video'}
          </button>
          
          {error && (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Enter a Twitter/X post URL containing a video to download it.</p>
        </div>
      </main>
    </div>
  );
}
