import React, { useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Upload, Save, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('draft');
  const [imageUrl, setImageUrl] = useState('');
  const [validatingImage, setValidatingImage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Add this useEffect to check font loading
  React.useEffect(() => {
    document.fonts.ready.then(() => {
      const fonts = document.fonts;
      console.log('Loaded fonts:', 
        Array.from(fonts).map(font => ({
          family: font.family,
          loaded: font.status === 'loaded'
        }))
      );
    });
  }, []);

  const defaultCategories = [
    'Web Development',
    'Mobile Development',
    'DevOps & Cloud',
    'Data Science & AI',
    'Programming Languages',
    'Software Architecture',
    'Cybersecurity',
    'System Design',
    'Other'
  ];

  const [categories, setCategories] = useState(defaultCategories);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 
          'font': [
            'GoogleSansDisplay-Regular',
            'GoogleSansDisplay-Bold',
            'Roboto',
            'Inter'
          ] 
        }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, 
         { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'align', 'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditorChange = useCallback((content) => {
    setContent(content);
  }, []);

  // Replace validateImageUrl with a simpler frontend validation
  const validateImageUrl = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setImagePreview(url);
        setFeaturedImage(url);
        setError('');
        resolve(true);
      };
      img.onerror = () => {
        setError('Invalid image URL. Please provide a valid direct image link.');
        setImagePreview('');
        setFeaturedImage(null);
        reject(false);
      };
      img.src = url;
    });
  };

  // Update handleSubmit to properly handle blog creation
  const handleSubmit = async (newStatus) => {
    setStatus(newStatus);
    setLoading(true);
    
    if (!title || !content || !featuredImage) {
      setError('Title, content and featured image are required');
      setLoading(false);
      return;
    }

    try {
      const blogData = {
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        featuredImage: featuredImage,
        status: newStatus
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(blogData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create blog');
      }

      setShowNotification(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 mb-8 lg:mb-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:size-20" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <Save size={16} className="inline-block mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Save</span> Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Publishing...' : (
                <>
                  <Send size={16} className="inline-block mr-1 sm:mr-2" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Blog Form */}
        <form className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-lg sm:text-xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-600 focus:ring-0 bg-transparent"
            />
          </div>

          {/* Featured Image URL Input */}
          <div className="border-2 border-dashed rounded-xl p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste image URL here..."
                  />
                  <button
                    type="button"
                    onClick={() => validateImageUrl(imageUrl)}
                    disabled={validatingImage || !imageUrl}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Preview
                  </button>
                </div>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-[200px] sm:max-h-[300px] mx-auto rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImagePreview('');
                      setFeaturedImage(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quill Editor */}
          <div className="bg-white border rounded-lg">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              className="h-[300px] sm:h-[400px]"
              placeholder="Write your blog content here..."
            />
          </div>

          {/* Category and Tags Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. react, javascript, web"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto bg-red-100 text-red-800 py-2 px-4 rounded-lg shadow text-sm">
          {error}
          <button
            className="ml-2 text-sm text-red-800 hover:opacity-75"
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}
      {showNotification && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto py-2 px-4 rounded-lg shadow text-sm ${
          status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status === 'published' ? 'Post Published!' : 'Post Saved as Draft'}
          <button
            className={`ml-2 text-sm hover:opacity-75 ${
              status === 'published' 
                ? 'text-green-800' 
                : 'text-yellow-800'
            }`}
            onClick={() => {
              setShowNotification(false);
              navigate('/admin/dashboard');
            }}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default NewBlog;
