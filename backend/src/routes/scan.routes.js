import express from 'express';
import multer from 'multer';
import path from 'path';
import { scanPlant, getScanHistory } from '../controllers/scan.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `scan-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

router.use(authMiddleware);
router.get('/', getScanHistory);
router.post('/', upload.single('image'), scanPlant);

export { router };
export default router;
