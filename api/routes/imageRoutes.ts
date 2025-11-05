import { Router } from 'express';
import multer from 'multer';
import { removeImageBackground, convertImageToSvg, tryBGRemove } from '../controllers/imageController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// router.post('/remove-background', upload.single('image'), removeImageBackground);
router.post('/remove-background', upload.single('image'), tryBGRemove);
router.post('/convert-to-svg', upload.single('image'), convertImageToSvg);

export default router;
