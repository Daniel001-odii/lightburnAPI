import { Router } from 'express';
import multer from 'multer';
import { convertImageToSvg, SVGPathToStroke } from '../controllers/imageController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/convert-to-svg', upload.single('image'), convertImageToSvg);

router.post('/convert-to-stroke', upload.single('image'), SVGPathToStroke);
// router.post('/convert-to-svg', upload.single('image'), convertImageToFlatSvg);
// router.post('/convert-to-svg', upload.single('image'), convertFlattenedImageToSvg);

export default router;
