import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import exifParser from 'exif-parser';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';

class ImageProcessor {
    constructor(config) {
        this.config = config;
        this.tileSize = config.tileSize || 512;
    }
    
    /**
     * Extract GPS data from image EXIF
     */
    async extractGpsData(imagePath) {
        try {
            const imageBuffer = await fs.readFile(imagePath);
            const parser = exifParser.create(imageBuffer);
            const result = parser.parse();
            
            let latitude = null;
            let longitude = null;
            
            if (result.tags && result.tags.GPSLatitude && result.tags.GPSLongitude) {
                latitude = result.tags.GPSLatitude;
                longitude = result.tags.GPSLongitude;
                
                // Handle GPS reference directions
                if (result.tags.GPSLatitudeRef === 'S') {
                    latitude = -latitude;
                }
                if (result.tags.GPSLongitudeRef === 'W') {
                    longitude = -longitude;
                }
            }
            
            return {
                latitude,
                longitude,
                hasGps: latitude !== null && longitude !== null,
                exifData: result.tags || {}
            };
            
        } catch (error) {
            console.warn(`Could not extract GPS data from ${imagePath}:`, error.message);
            return {
                latitude: null,
                longitude: null,
                hasGps: false,
                exifData: {}
            };
        }
    }
    
    /**
     * Tile large image into smaller chunks with metadata
     */
    async tileImageWithMapping(imagePath, outputFolder, metadataFile = 'tile_metadata.csv') {
        console.log(`Tiling image: ${imagePath}`);
        
        // Get image metadata
        const imageInfo = await sharp(imagePath).metadata();
        const { width, height } = imageInfo;
        
        console.log(`Image dimensions: ${width}x${height}`);
        
        const tilesInfo = [];
        const metadataPath = path.join(outputFolder, metadataFile);
        
        // Prepare CSV writer
        const csvWriter = createObjectCsvWriter({
            path: metadataPath,
            header: [
                { id: 'tile_name', title: 'tile_name' },
                { id: 'x_start', title: 'x_start' },
                { id: 'y_start', title: 'y_start' },
                { id: 'width', title: 'width' },
                { id: 'height', title: 'height' }
            ]
        });
        
        // Generate tiles
        for (let y = 0; y < height; y += this.tileSize) {
            for (let x = 0; x < width; x += this.tileSize) {
                const right = Math.min(x + this.tileSize, width);
                const lower = Math.min(y + this.tileSize, height);
                const tileWidth = right - x;
                const tileHeight = lower - y;
                
                const tileName = `tile_${x}_${y}.jpg`;
                const tilePath = path.join(outputFolder, tileName);
                
                // Extract and save tile
                await sharp(imagePath)
                    .extract({
                        left: x,
                        top: y,
                        width: tileWidth,
                        height: tileHeight
                    })
                    .jpeg({ quality: 95 })
                    .toFile(tilePath);
                
                const tileInfo = {
                    tile_name: tileName,
                    x_start: x,
                    y_start: y,
                    width: tileWidth,
                    height: tileHeight
                };
                
                tilesInfo.push(tileInfo);
            }
        }
        
        // Write metadata CSV
        await csvWriter.writeRecords(tilesInfo);
        
        console.log(`Created ${tilesInfo.length} tiles with metadata saved to ${metadataPath}`);
        return tilesInfo;
    }
    
    /**
     * Restitch tiles back into full image
     */
    async restitchTiles(metadataCsv, annotatedDir, savePath) {
        console.log(`Restitching tiles from: ${annotatedDir}`);
        
        // Read metadata
        const tiles = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(metadataCsv)
                .pipe(csv())
                .on('data', (row) => {
                    tiles.push({
                        tile_name: row.tile_name,
                        x_start: parseInt(row.x_start),
                        y_start: parseInt(row.y_start),
                        width: parseInt(row.width),
                        height: parseInt(row.height)
                    });
                })
                .on('end', async () => {
                    try {
                        // Calculate canvas size
                        const maxX = Math.max(...tiles.map(t => t.x_start + t.width));
                        const maxY = Math.max(...tiles.map(t => t.y_start + t.height));
                        
                        console.log(`Canvas size: ${maxX}x${maxY}`);
                        
                        // Create canvas
                        const canvas = sharp({
                            create: {
                                width: maxX,
                                height: maxY,
                                channels: 3,
                                background: { r: 0, g: 0, b: 0 }
                            }
                        });
                        
                        // Prepare composite operations
                        const compositeOps = [];
                        
                        for (const tile of tiles) {
                            const tilePath = path.join(annotatedDir, tile.tile_name);
                            
                            if (await fs.pathExists(tilePath)) {
                                compositeOps.push({
                                    input: tilePath,
                                    left: tile.x_start,
                                    top: tile.y_start
                                });
                            } else {
                                console.warn(`Tile not found: ${tilePath}`);
                            }
                        }
                        
                        // Composite and save
                        await canvas
                            .composite(compositeOps)
                            .jpeg({ quality: 95 })
                            .toFile(savePath);
                        
                        console.log(`Restitched image saved to: ${savePath}`);
                        resolve(savePath);
                        
                    } catch (error) {
                        console.error('Error restitching tiles:', error);
                        reject(error);
                    }
                })
                .on('error', reject);
        });
    }
    
    /**
     * Resize image while maintaining aspect ratio
     */
    async resizeImage(imagePath, outputPath, maxWidth = 1920, maxHeight = 1080) {
        try {
            const info = await sharp(imagePath)
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 90 })
                .toFile(outputPath);
            
            return {
                width: info.width,
                height: info.height,
                size: info.size
            };
        } catch (error) {
            throw new Error(`Failed to resize image: ${error.message}`);
        }
    }
    
    /**
     * Get image information
     */
    async getImageInfo(imagePath) {
        try {
            const metadata = await sharp(imagePath).metadata();
            const stats = await fs.stat(imagePath);
            
            return {
                filename: path.basename(imagePath),
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: stats.size,
                density: metadata.density,
                hasAlpha: metadata.hasAlpha,
                channels: metadata.channels,
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (error) {
            throw new Error(`Failed to get image info: ${error.message}`);
        }
    }
    
    /**
     * Validate image file
     */
    async validateImage(imagePath) {
        try {
            const metadata = await sharp(imagePath).metadata();
            
            const validFormats = ['jpeg', 'jpg', 'png'];
            const isValidFormat = validFormats.includes(metadata.format.toLowerCase());
            
            const hasValidDimensions = metadata.width > 0 && metadata.height > 0;
            const isSizeReasonable = metadata.width <= 20000 && metadata.height <= 20000;
            
            return {
                isValid: isValidFormat && hasValidDimensions && isSizeReasonable,
                format: metadata.format,
                width: metadata.width,
                height: metadata.height,
                errors: []
                    .concat(!isValidFormat ? ['Invalid format'] : [])
                    .concat(!hasValidDimensions ? ['Invalid dimensions'] : [])
                    .concat(!isSizeReasonable ? ['Image too large'] : [])
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [`Failed to read image: ${error.message}`]
            };
        }
    }
}

export default ImageProcessor;
