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

  const validateImageUrl = async (url) => {
    try {
      setValidatingImage(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Invalid image URL');
      const contentType = response.headers.get('content-type');
      if (!contentType.startsWith('image/')) throw new Error('URL is not an image');
      setImagePreview(url);
      setFeaturedImage(url);
      setError('');
    } catch (error) {
      setError('Invalid image URL. Please provide a valid direct image link.');
      setImagePreview('');
      setFeaturedImage(null);
    } finally {
      setValidatingImage(false);
    }
  };

  const handleSubmit = async (newStatus) => {
    setStatus(newStatus);
    setLoading(true);
    if (!featuredImage) {
      setError('Featured image is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          title,
          content,
          category,
          tags: tags.split(',').map(tag => tag.trim()),
          featuredImage,
          status: newStatus
        })
      });

      if (!response.ok) throw new Error('Failed to create blog');

      setShowNotification(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <Save size={20} className="inline-block mr-2" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Publishing...' : <><Send size={20} className="inline-block mr-2" />Publish</>}
            </button>
          </div>
        </div>

        {/* Blog Form */}
        <form className="space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              className="w-full px-4 py-3 text-xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-600 focus:ring-0 bg-transparent"
            />
          </div>

          {/* Featured Image URL Input */}
          <div className="border-2 border-dashed rounded-xl p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter direct image URL"
                  />
                  <button
                    type="button"
                    onClick={() => validateImageUrl(imageUrl)}
                    disabled={validatingImage || !imageUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {validatingImage ? 'Validating...' : 'Validate'}
                  </button>
                </div>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-[300px] mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImagePreview('');
                      setFeaturedImage(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Updated Quill Editor */}
          <div className="bg-white border rounded-lg">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              className="h-[400px]"
              placeholder="Write your blog content here..."
            />
          </div>

          {/* Updated Category and Tags Section */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </form>
      </div>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 text-red-800 py-2 px-4 rounded-lg shadow">
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
        <div className={`fixed top-4 right-4 py-2 px-4 rounded-lg shadow ${
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
