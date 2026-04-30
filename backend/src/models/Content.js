const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url: String,
  filename: String,
  mimeType: String,
  size: Number,
}, { _id: false });

const contentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: {
    type: String,
    enum: ['GK', 'DSA', 'Hindi', 'Paper 1', 'Paper 2', 'System Design'],
    required: true,
  },
  type: {
    type: String,
    enum: ['note', 'question', 'file'],
    required: true,
  },
  // For GK/Hindi: category like "Awards", "Sports"
  category: { type: String, trim: true },
  // For DSA: folder like "Arrays", "Trees"
  folder: { type: String, trim: true },
  // For Paper1/Paper2: section like "COA", "OS"
  section: { type: String, trim: true },

  title: { type: String, required: true, trim: true },
  body: { type: String, default: '' }, // Rich text HTML
  questionLink: { type: String, trim: true },
  videoLink: { type: String, trim: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', ''], default: '' },
  tags: [{ type: String, trim: true }],
  bookmarked: { type: Boolean, default: false },
  files: [fileSchema],
}, { timestamps: true });

// Text index for search
contentSchema.index({
  title: 'text',
  body: 'text',
  tags: 'text',
  category: 'text',
  folder: 'text',
});

module.exports = mongoose.model('Content', contentSchema);
