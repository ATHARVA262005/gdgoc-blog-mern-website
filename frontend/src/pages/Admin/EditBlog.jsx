import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Upload, Save, Send, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

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

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('draft');

  // Editor configuration
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
    clipboard: { matchVisual: false }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'align', 'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background'
  ];

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/admin/blogs/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
  
        const data = await response.json();
        if (data.success && data.blog) {
          const blog = data.blog;
          setTitle(blog.title || '');
          setContent(blog.content || '');
          setCategory(blog.category || '');
          setTags(Array.isArray(blog.tags) ? blog.tags.join(', ') : '');
          setStatus(blog.status || 'draft');
          setImagePreview(blog.featuredImage || '');
          setFeaturedImage(blog.featuredImage || '');
        } else {
          throw new Error(data.message || 'Blog data not found');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError(error.message || 'Error fetching blog');
        // Show error for 3 seconds before redirecting
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (id) {
      fetchBlog();
    }
  }, [id, navigate]);

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

  const handleSubmit = (e) => {
    e.preventDefault(); // Just prevent form submission
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsSaving(true);
    try {
      const blogData = {
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        featuredImage: featuredImage,
        status: newStatus
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(blogData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update blog');
      }

      const data = await response.json();
      if (data.success) {
        setStatus(newStatus);
        setShowNotification(true);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xl text-gray-600">
          <Loader className="animate-spin" size={24} />
          Loading blog...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => handleUpdateStatus('draft')}
              disabled={isSaving}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                status === 'draft' 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'border border-gray-300 hover:border-gray-400'
              }`}
            >
              <Save size={20} />
              Save as Draft
            </button>
            <button
              onClick={() => handleUpdateStatus('published')}
              disabled={isSaving}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                status === 'published'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send size={20} />
              {isSaving ? 'Saving...' : 'Publish'}
            </button>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              className="w-full px-4 py-3 text-xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-600 focus:ring-0 bg-transparent"
            />
          </div>

          {/* Featured Image */}
          <div className="border-2 border-dashed rounded-xl p-4 text-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[300px] mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedImage(null);
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload className="mx-auto mb-2" size={24} />
                <span className="text-gray-600">
                  Upload Featured Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Rich Text Editor */}
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

          {/* Category and Tags */}
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
    </div>
  );
};

export default EditBlog;
