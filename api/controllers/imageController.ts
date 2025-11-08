import { Request, Response } from 'express';
import sharp from "sharp";
import {
    vectorize, ColorMode,
    Hierarchical,
    PathSimplifyMode
} from '@neplex/vectorizer';
import { DOMParser, XMLSerializer } from "xmldom";


// ORIGINAL WORKING CONFIG, DO NOT DELETEß
/* const options = {
  colorMode: ColorMode.Color,
  colorPrecision: 4,                 // Fewer colors for more distinct grouping
  hierarchical: Hierarchical.Stacked,

  pathPrecision: 6,                  // Enough detail but fewer nodes
  filterSpeckle: 2,                  // Remove small noise specks
  spliceThreshold: 15,               // Merge nearby regions with similar color
  cornerThreshold: 90,               // Moderate curve smoothing
  mode: PathSimplifyMode.Spline,     // Bézier smoothing for natural curves

  layerDifference: 10,               // Reasonable grouping tolerance
  lengthThreshold: 3,                // Skip ultra-short path segments
  maxIterations: 5,                  // Smooth, optimized shapes
}; */

const options = {
    colorMode: ColorMode.Color,
    colorPrecision: 4,                 // Fewer colors for more distinct grouping
    hierarchical: Hierarchical.Stacked,

    pathPrecision: 6,                  // Enough detail but fewer nodes
    filterSpeckle: 2,                  // Remove small noise specks
    spliceThreshold: 15,               // Merge nearby regions with similar color
    cornerThreshold: 90,               // Moderate curve smoothing
    mode: PathSimplifyMode.Spline,     // Bézier smoothing for natural curves

    layerDifference: 10,               // Reasonable grouping tolerance
    lengthThreshold: 3,                // Skip ultra-short path segments
    maxIterations: 5,                  // Smooth, optimized shapes
};


export const convertImageToSvg = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded.');
    }

    try {
        const inputBuffer = req.file.buffer;

        // Check if the uploaded file is an SVG
        if (req.file.mimetype === 'image/svg+xml') {
            const svgString = inputBuffer.toString('utf8');
            // const strokeSVG = convertFillsToStrokes(svgString, "#000000", 3);
            const strokeSVG = convertFillsToStrokes(svgString, "#000000", 16);
            res.set('Content-Type', 'image/svg+xml');
            return res.send(strokeSVG);
        }

        // Vectorizer expects a file path or a buffer
        const svgString = await vectorize(inputBuffer, options);

        // const strokeSVG = convertFillsToStrokes(svgString, "#000000", 3);

        res.set('Content-Type', 'image/svg+xml');
        res.send(svgString);
        // res.status(200).json({ strokedSVG: strokeSVG, filledSVG: svgString })
    } catch (error) {
        console.error('Error converting image to SVG:', error);
        res.status(500).send('Error converting image to SVG.');
    }
};

/**
 * Converts all fills in the SVG to strokes only,
 * removes gradients, and deletes the first <path> (likely bounding box).
 */
export function convertFillsToStrokes(
    svgString: string,
    strokeColor = "#000000",
    strokeWidth = 1
  ) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
  
    // --- 1️⃣ Remove the first <path> element (bounding box or background) ---
    const paths = doc.getElementsByTagName("path");
    if (paths.length > 0) {
      const firstPath = paths.item(0);
      firstPath?.parentNode?.removeChild(firstPath);
    }
  
    // --- 2️⃣ Process remaining elements ---
    const allElements = doc.getElementsByTagName("*");
    for (const el of Array.from(allElements)) {
      // Remove all fills
      if (el.hasAttribute("fill")) {
        el.removeAttribute("fill");
      }
  
      // Remove gradient fills or style attributes that imply fill
      const style = el.getAttribute("style");
      if (style && style.includes("fill:")) {
        const cleanedStyle = style
          .replace(/fill:[^;]+;?/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (cleanedStyle) {
          el.setAttribute("style", cleanedStyle);
        } else {
          el.removeAttribute("style");
        }
      }
  
      // Apply stroke-only styling
      el.setAttribute("stroke", strokeColor);
      el.setAttribute("stroke-width", strokeWidth.toString());
      el.setAttribute("fill", "none");
    }
  
    // --- 3️⃣ Optionally remove empty <defs> or <style> sections ---
    const defs = doc.getElementsByTagName("defs");
    for (const def of Array.from(defs)) {
      def.parentNode?.removeChild(def);
    }
  
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }


  export const SVGPathToStroke = async (req: Request, res: Response) =>{
    const { svgString } = req.body;
    if(!svgString){
      return res.status(400).json({ message: "svgString is required "})
    }

   

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
  
    // --- 1️⃣ Remove the first <path> element (bounding box or background) ---
    const paths = doc.getElementsByTagName("path");
    if (paths.length > 0) {
      const firstPath = paths.item(0);
      firstPath?.parentNode?.removeChild(firstPath);
    }

    const svgStroke = convertFillsToStrokes(svgString, "#000000", 3);

    res.set('Content-Type', 'image/svg+xml');
    res.send(svgStroke);
  }