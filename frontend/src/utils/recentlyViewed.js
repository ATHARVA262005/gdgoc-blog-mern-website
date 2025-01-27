const MAX_RECENT_BLOGS = 50; // Maximum number of blogs to keep in history

export const addToRecentlyViewed = (blogId) => {
  try {
    if (!blogId) {
      console.warn('Attempted to add undefined blogId to recently viewed');
      return;
    }

    console.log('Adding blog to recently viewed:', blogId); // Debug log

    let recentlyViewed = [];
    let recentlyViewedTimes = {};

    // Load existing data
    try {
      recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewedBlogs') || '[]');
      recentlyViewedTimes = JSON.parse(localStorage.getItem('recentlyViewedTimes') || '{}');
    } catch (e) {
      console.error('Error parsing existing localStorage data:', e);
    }

    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(id => id !== blogId);
    
    // Add to beginning of array
    recentlyViewed.unshift(blogId);
    
    // Update timestamp
    recentlyViewedTimes[blogId] = new Date().toISOString();
    
    // Limit the number of stored blogs
    if (recentlyViewed.length > MAX_RECENT_BLOGS) {
      const removedIds = recentlyViewed.slice(MAX_RECENT_BLOGS);
      recentlyViewed = recentlyViewed.slice(0, MAX_RECENT_BLOGS);
      removedIds.forEach(id => delete recentlyViewedTimes[id]);
    }
    
    // Save to localStorage
    localStorage.setItem('recentlyViewedBlogs', JSON.stringify(recentlyViewed));
    localStorage.setItem('recentlyViewedTimes', JSON.stringify(recentlyViewedTimes));

    console.log('Successfully saved to localStorage'); // Debug log
  } catch (error) {
    console.error('Error updating recently viewed blogs:', error);
  }
};

export const getVisitedTime = (blogId) => {
  try {
    const times = JSON.parse(localStorage.getItem('recentlyViewedTimes') || '{}');
    const visitTime = new Date(times[blogId]);
    const now = new Date();
    const diffMinutes = Math.floor((now - visitTime) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} days ago`;
    }
  } catch {
    return 'Recently';
  }
};
