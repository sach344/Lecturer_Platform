const Content = require('../models/Content');

exports.createContent = async (req, res) => {
  try {
    const files = (req.files || []).map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
    }));

    const body = { ...req.body };
    // Parse tags if sent as string
    if (typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const doc = await Content.create({ ...body, files, user: req.user.id });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listContent = async (req, res) => {
  try {
    const { module, type, category, folder, section, q, bookmarked, limit = 100, skip = 0 } = req.query;
    const filter = { user: req.user.id };

    if (module) filter.module = module;
    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (folder) filter.folder = { $regex: folder, $options: 'i' };
    if (section) filter.section = { $regex: section, $options: 'i' };
    if (bookmarked === 'true') filter.bookmarked = true;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { category: { $regex: q, $options: 'i' } },
        { folder: { $regex: q, $options: 'i' } },
      ];
    }

    const docs = await Content.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));
    const total = await Content.countDocuments(filter);
    res.json({ docs, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getContent = async (req, res) => {
  try {
    const doc = await Content.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    const doc = await Content.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const doc = await Content.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const doc = await Content.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.bookmarked = !doc.bookmarked;
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unique categories/folders/sections for a module
exports.getGroups = async (req, res) => {
  try {
    const { module, groupBy = 'category' } = req.query;
    const filter = { user: req.user.id };
    if (module) filter.module = module;

    const result = await Content.distinct(groupBy, filter);
    res.json(result.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
