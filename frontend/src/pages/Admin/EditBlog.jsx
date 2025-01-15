import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Upload, Save, Send, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const defaultCategories = [
  'Development',
  'Artificial Intelligence',
  'UI/UX Design',
  'DevOps',
  'Cloud Computing',
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Cybersecurity',
  'Blockchain',
  'Data Science',
  'Frontend',
  'Backend',
  'Full Stack',
  'Programming Languages',
  'Software Architecture',
  'Best Practices',
  'Tutorials',
  'Career Growth',
  'Tech News'
];

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);

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
        // Replace with actual API call
        const response = await fetch(`/api/blogs/${id}`);
        const blog = await response.json();
        
        setTitle(blog.title);
        setContent(blog.content);
        setCategory(blog.category);
        setTags(blog.tags.join(', '));
        setStatus(blog.status);
        setIsFeatured(blog.isFeatured);
        setImagePreview(blog.featuredImage);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching blog:', error);
        // Show error notification
        navigate('/admin/dashboard');
      }
    };

    fetchBlog();
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

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())));
      formData.append('status', status);
      formData.append('isFeatured', isFeatured);
      if (featuredImage) {
        formData.append('featuredImage', featuredImage);
      }

      // Replace with your API endpoint
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update blog');

      // Show success notification
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating blog:', error);
      // Show error notification
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
              onClick={() => setStatus('draft')}
              disabled={isSaving}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400
                ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={20} />
              Save Draft
            </button>
            <button
              onClick={() => setStatus('published')}
              disabled={isSaving}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700
                ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send size={20} />
              {isSaving ? 'Saving...' : 'Update & Publish'}
            </button>
          </div>
        </div>

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

          {/* Featured Post Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <h3 className="font-medium text-gray-900">Featured Post</h3>
              <p className="text-sm text-gray-500">
                Featured posts appear prominently on the home page (600x400 thumbnail)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                ${isFeatured ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isFeatured ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
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
                {isFeatured && (
                  <div className="mt-2 text-sm text-gray-500">
                    Recommended size for featured posts: 600x400 pixels
                  </div>
                )}
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload className="mx-auto mb-2" size={24} />
                <span className="text-gray-600">
                  Upload Featured Image
                  {isFeatured && " (Recommended: 600x400px)"}
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
              {showNewCategoryInput ? (
                <div className="space-y-2">
                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(false)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.sort().map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add New Category
                  </button>
                </div>
              )}
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
