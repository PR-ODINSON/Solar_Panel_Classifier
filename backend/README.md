# Solar Panel Classification Backend (Node.js)

A Node.js backend for automated solar panel defect detection and classification using computer vision and machine learning.

## Features

- **Image Processing**: Automated tiling of large solar panel images
- **YOLO Detection**: Solar panel detection using YOLO v8 model
- **Classification**: Panel condition classification (Clean, Dusty, Bird-drop, Physical-Damage)
- **GPS Extraction**: Extract GPS coordinates from image EXIF data
- **Excel Reports**: Comprehensive inspection reports with multiple worksheets
- **RESTful API**: Easy integration with frontend applications

## Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Image Processing**: Sharp, Jimp
- **Reports**: ExcelJS
- **ML Processing**: Python scripts with PyTorch, YOLO
- **File Handling**: Multer, fs-extra

## Prerequisites

1. **Node.js 16+**: Download from [nodejs.org](https://nodejs.org/)
2. **Python 3.7+**: Required for ML model inference
3. **Python Dependencies**: Install from `requirements.txt`

```bash
pip install -r requirements.txt
```

## Installation

1. **Install Node.js dependencies**:
```bash
npm install
```

2. **Ensure ML models are available**:
   - `resnet50_pv_classifier.pth` (ResNet-50 classifier)
   - `runs/detect/train_yolo_v8_new_dataset4/weights/best.pt` (YOLO model)

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using the Startup Script
```bash
node start.js
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and model availability.

### Process Images
```
POST /process-upload
Content-Type: multipart/form-data
```
Upload and process solar panel images.

**Parameters**:
- `files`: Array of image files (JPEG, PNG)

**Response**:
```json
{
  "results": [
    {
      "filename": "panel_image.jpg",
      "success": true,
      "annotated_image": "/outputs/panel_image_annotated.jpg",
      "excel_report": "/outputs/panel_image_report.xlsx",
      "summary": {
        "total_panels": 45,
        "class_distribution": {
          "Clean": 30,
          "Dusty": 10,
          "Bird-drop": 3,
          "Physical-Damage": 2
        }
      },
      "gps_latitude": 40.7128,
      "gps_longitude": -74.0060
    }
  ]
}
```

### Download Files
```
GET /download/:filename
```
Download generated reports and annotated images.

### List Output Files
```
GET /outputs
```
Get list of all generated files.

### Cleanup
```
POST /cleanup
```
Clean up temporary processing files.

## File Structure

```
backend/
├── server.js                 # Main Express server
├── start.js                 # Startup script with checks
├── package.json             # Node.js dependencies
├── services/
│   ├── SolarPanelProcessor.js    # Main processing pipeline
│   ├── ImageProcessor.js         # Image tiling and GPS extraction
│   └── ReportGenerator.js        # Excel report generation
├── python_scripts/          # Python ML scripts
│   ├── yolo_detection.py    # YOLO detection script
│   └── panel_classification.py  # Panel classification script
├── uploads/                 # Uploaded images
├── outputs/                 # Generated reports and images
├── temp_tiles/             # Temporary image tiles
├── temp_annotated/         # Temporary annotated tiles
└── temp_boxes/             # Temporary detection boxes
```

## Processing Pipeline

1. **Image Upload**: Receive and validate image files
2. **GPS Extraction**: Extract GPS coordinates from EXIF data
3. **Image Tiling**: Split large images into manageable tiles
4. **YOLO Detection**: Detect solar panels in each tile
5. **Classification**: Classify panel conditions using ResNet
6. **Annotation**: Draw bounding boxes and labels on tiles
7. **Restitching**: Reconstruct full annotated image
8. **Report Generation**: Create comprehensive Excel reports

## Configuration

### Environment Variables

- `PORT`: Server port (default: 8000)
- `NODE_ENV`: Environment mode (development/production)

### Model Paths

Models are automatically detected in the project structure:
- ResNet Classifier: `../resnet50_pv_classifier.pth`
- YOLO Model: `../runs/detect/train_yolo_v8_new_dataset4/weights/best.pt`

## Error Handling

The backend includes comprehensive error handling:

- **File Validation**: Checks file types and sizes
- **Model Availability**: Verifies ML models before processing
- **Processing Errors**: Graceful handling of ML processing failures
- **Resource Cleanup**: Automatic cleanup of temporary files

## Performance Considerations

- **Large Images**: Automatically tiled for efficient processing
- **Memory Management**: Temporary files cleaned up after processing
- **Parallel Processing**: Multiple images can be processed simultaneously
- **Resource Limits**: 100MB file size limit per upload

## Troubleshooting

### Common Issues

1. **Python not found**: Ensure Python is in your system PATH
2. **Model files missing**: Check that ML model files are in correct locations
3. **Permission errors**: Ensure write permissions for temp directories
4. **Memory issues**: Monitor memory usage with large images

### Logs

Server logs provide detailed information about:
- Processing pipeline stages
- Error messages and stack traces
- Performance metrics
- File operations

## Migration from Python Backend

This Node.js backend maintains 100% API compatibility with the original Python FastAPI backend:

- **Same endpoints**: All original API endpoints preserved
- **Same response format**: Identical JSON response structure
- **Same features**: All processing capabilities maintained
- **Enhanced performance**: Improved file handling and concurrent processing

## Development

### Adding New Features

1. **Image Processing**: Extend `ImageProcessor.js`
2. **ML Models**: Add new Python scripts in `python_scripts/`
3. **Reports**: Enhance `ReportGenerator.js`
4. **API Endpoints**: Add routes to `server.js`

### Testing

```bash
npm test
```

## License

This project is licensed under the MIT License.
