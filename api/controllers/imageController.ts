import { Request, Response } from 'express';
import {
    vectorize, ColorMode,
    Hierarchical,
    PathSimplifyMode
} from '@neplex/vectorizer';
import axios from "axios";
// import { Client } from "@gradio/client"
const rawToken = process.env.HUGGING_FACE_TOKEN || '';
if (!rawToken) {
    throw new Error("HUGGING_FACE_TOKEN environment variable is not set.");
}
const HUGGING_FACE_TOKEN = rawToken.startsWith("hf_") ? rawToken : `hf_${rawToken}`;



export const removeImageBackground = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded.');
    }

    try {
        const inputBuffer = req.file.buffer as Buffer;

        const response = await axios.post("https://api-inference.huggingface.co/models/briaai/RMBG-2.0", inputBuffer, {
            headers: {
                "Authorization": `Bearer ${HUGGING_FACE_TOKEN}`,
                "Content-Type": "application/octet-stream",
            },
        });

        if (response.status !== 200) {
            const errorBody = response.data;
            throw new Error(`Hugging Face API error: ${response.status} - ${errorBody}`);
        }

        const backgroundlessImageBuffer = response.data;

        // No need for sharp if the API returns a PNG directly
        res.setHeader('Content-Type', 'image/png');
        res.send(backgroundlessImageBuffer);
    } catch (error) {
        console.error('Error removing background:', error);
        res.status(500).send(`Error processing image background removal: ${(error as Error).message}`);
    }
};


export const tryBGRemove = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded.');
    }

    const { Client } = await import("@gradio/client");
    console.log('HUGGING_FACE_TOKEN:', HUGGING_FACE_TOKEN);


    try {
        const inputBuffer = req.file.buffer;
        const imageBlob = new Blob([new Uint8Array(inputBuffer)], { type: req.file.mimetype });

        // const client = await Client.connect("briaai/BRIA-RMBG-2.0");
        const client = await Client.connect("briaai/BRIA-RMBG-2.0", { token: HUGGING_FACE_TOKEN as 'hf_${string}' })

        const result: any = await client.predict("/image", {
            image: imageBlob,
        });

        // Assuming result.data[0] contains the base64 encoded image or a direct image buffer
        // The structure of result.data might vary based on the Gradio app's output
        if (result.data && Array.isArray(result.data) && result.data.length > 0 && result.data[0].url) {
            const imageUrl = result.data[0].url;
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            if (imageResponse.status !== 200) {
                throw new Error(`Failed to fetch image from Gradio URL: ${imageResponse.status} - ${imageResponse.statusText}`);
            }

            const imageBuffer = imageResponse.data;
            res.setHeader('Content-Type', 'image/webp'); // Assuming webp as per the error log
            res.send(imageBuffer);
        }
        else {
            return res.status(200).json({ data: result.data[result.data.length - 1] })
            console.error('Unexpected Gradio client response data format:', result.data[result.data.length - 1]);
            res.status(500).send('Error: Unexpected image data format from Gradio client.');
        }

    } catch (error) {
        console.error('Error with Gradio background removal:', error);
        res.status(500).send(`Error processing image background removal with Gradio: ${(error as Error).message}`);
    }
}




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
