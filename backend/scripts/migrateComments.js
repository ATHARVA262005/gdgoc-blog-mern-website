const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Comment = require('../models/Comment');

async function migrateComments() {
  try {
    const blogs = await Blog.find({ 'comments.0': { $exists: true } });
    
    for (const blog of blogs) {
      for (const oldComment of blog.comments) {
        // Create new comment document
        const newComment = new Comment({
          user: oldComment.user,
          blog: blog._id,
          content: oldComment.content,
          likes: oldComment.likes,
          likeCount: oldComment.likeCount,
          createdAt: oldComment.createdAt
        });
        
        await newComment.save();
        
        // Update user's comments array
        await User.findByIdAndUpdate(oldComment.user, {
          $push: { comments: newComment._id }
        });
        
        // Update blog's comments array
        blog.comments = blog.comments.filter(c => c._id !== oldComment._id);
        blog.comments.push(newComment._id);
      }
      await blog.save();
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateComments();
