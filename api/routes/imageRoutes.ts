import { Router } from 'express';
import multer from 'multer';
import { convertImageToSvg } from '../controllers/imageController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/convert-to-svg', upload.single('image'), convertImageToSvg);
// router.post('/convert-to-svg', upload.single('image'), convertImageToFlatSvg);
// router.post('/convert-to-svg', upload.single('image'), convertFlattenedImageToSvg);

export default router;
