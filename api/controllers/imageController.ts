import { Request, Response } from 'express';
import {
    vectorize, ColorMode,
    Hierarchical,
    PathSimplifyMode
} from '@neplex/vectorizer';

const options = {
    // --- Your Color Settings ---
    colorPrecision: 1, // Lower this to reduce colors
    colorMode: ColorMode.Color,

    // --- Other Customizations ---
    filterSpeckle: 4,
    spliceThreshold: 45,
    cornerThreshold: 60,
    hierarchical: Hierarchical.Stacked,
    mode: PathSimplifyMode.Spline,
    pathPrecision: 5,

    // --- REQUIRED Properties (that were missing) ---

    /**
     * Threshold for separating layers, likely based on color difference.
     */
    layerDifference: 15,

    /**
     * A threshold related to the length of path segments during simplification.
     */
    lengthThreshold: 4,

    /**
     * The number of iterations for the path optimization algorithm.
     */
    maxIterations: 10
};

export const convertImageToSvg = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded.');
    }

    try {
        const inputBuffer = req.file.buffer;

        // Vectorizer expects a file path or a buffer
        const svgString = await vectorize(inputBuffer, options);

        res.set('Content-Type', 'image/svg+xml');
        res.send(svgString);
    } catch (error) {
        console.error('Error converting image to SVG:', error);
        res.status(500).send('Error converting image to SVG.');
    }
};
