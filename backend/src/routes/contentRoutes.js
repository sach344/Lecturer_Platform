const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middlewares/auth');
const {
  createContent,
  listContent,
  getContent,
  updateContent,
  deleteContent,
  toggleBookmark,
  getGroups,
} = require('../controllers/contentController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|gif|webp/i;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.test(ext));
  },
});

router.use(auth);

router.get('/', listContent);
router.get('/groups', getGroups);
router.get('/:id', getContent);
router.post('/', upload.array('files', 5), createContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);
router.patch('/:id/bookmark', toggleBookmark);

module.exports = router;
