import React, { useState, useEffect } from 'react';
import { getBookmarkedBlogs } from '../services/blogService';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await getBookmarkedBlogs();
        if (response.success) {
          setBookmarks(response.bookmarks);
        }
      } catch (err) {
        setError('Failed to fetch bookmarks');
        console.error('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (loading) return <div>Loading bookmarks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookmarks</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map(blog => (
          <BookmarkCard key={blog._id} blog={blog} />
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
