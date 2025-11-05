import { Router } from 'express';
import multer from 'multer';
import { convertImageToSvg } from '../controllers/imageController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/convert-to-svg', upload.single('image'), convertImageToSvg);

export default router;
