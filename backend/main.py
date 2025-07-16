import os
import cv2
import csv
import json
import shutil
import zipfile
import numpy as np
import torch
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from PIL import Image, Image as PILImage
from ultralytics import YOLO
from torchvision import transforms
from torchvision.models import resnet50
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL.ExifTags import TAGS, GPSTAGS

app = FastAPI(title="Solar Panel Classification API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
TILE_SIZE = 512
TILE_DIR = "temp_tiles"
ANNOTATED_DIR = "temp_annotated"
BOXES_DIR = "temp_boxes"
CLASSIFIER_PATH = "../resnet50_pv_classifier.pth"
YOLO_MODEL_PATH = "../runs/detect/train_yolo_v8_new_dataset4/weights/best.pt"
CLASS_NAMES = ["Bird-drop", "Clean", "Dusty", "Physical-Damage"]

# Setup directories
for directory in [UPLOAD_DIR, OUTPUT_DIR, TILE_DIR, ANNOTATED_DIR, BOXES_DIR]:
    os.makedirs(directory, exist_ok=True)

# Setup transforms and models
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3)
])
Image.MAX_IMAGE_PIXELS = None

# Mount static files
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

def get_exif_data(image):
    exif_data = {}
    info = image._getexif()
    if not info:
        return None
    for tag, value in info.items():
        decoded = TAGS.get(tag, tag)
        if decoded == "GPSInfo":
            gps_data = {}
            for t in value:
                sub_decoded = GPSTAGS.get(t, t)
                gps_data[sub_decoded] = value[t]
            exif_data[decoded] = gps_data
        else:
            exif_data[decoded] = value
    return exif_data

def convert_to_degrees(value):
    d, m, s = value
    return float(d) + float(m)/60 + float(s)/3600

def get_lat_lon(exif_data):
    if not exif_data or "GPSInfo" not in exif_data:
        return None, None
    gps_info = exif_data["GPSInfo"]
    lat = convert_to_degrees(gps_info["GPSLatitude"])
    lon = convert_to_degrees(gps_info["GPSLongitude"])
    if gps_info.get("GPSLatitudeRef") == "S":
        lat = -lat
    if gps_info.get("GPSLongitudeRef") == "W":
        lon = -lon
    return lat, lon
class SolarPanelProcessor:
    def __init__(self):
        self.yolo_model = None
        self.classifier_model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    def load_models(self):
        """Load YOLO and ResNet models"""
        if self.yolo_model is None:
            self.yolo_model = YOLO(YOLO_MODEL_PATH)
            
        if self.classifier_model is None:
            self.classifier_model = resnet50()
            self.classifier_model.fc = torch.nn.Linear(
                self.classifier_model.fc.in_features, len(CLASS_NAMES)
            )
            self.classifier_model.load_state_dict(
                torch.load(CLASSIFIER_PATH, map_location="cpu"), strict=False
            )
            self.classifier_model.eval()
            self.classifier_model.to(self.device)

    def clear_directories(self, *dirs):
        """Clear temporary directories"""
        for folder in dirs:
            if os.path.exists(folder):
                shutil.rmtree(folder)
            os.makedirs(folder)

    def tile_image_with_mapping(self, image_path, output_folder, metadata_file="tile_metadata.csv"):
        """Tile large image into smaller chunks"""
        img = Image.open(image_path)
        width, height = img.size
        metadata_path = os.path.join(output_folder, metadata_file)
        
        tiles_info = []
        with open(metadata_path, mode='w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['tile_name', 'x_start', 'y_start', 'width', 'height'])
            
            for y in range(0, height, TILE_SIZE):
                for x in range(0, width, TILE_SIZE):
                    right = min(x + TILE_SIZE, width)
                    lower = min(y + TILE_SIZE, height)
                    tile = img.crop((x, y, right, lower)).convert("RGB")
                    tile_name = f"tile_{x}_{y}.jpg"
                    tile.save(os.path.join(output_folder, tile_name))
                    
                    tile_info = {
                        'tile_name': tile_name,
                        'x_start': x,
                        'y_start': y,
                        'width': right - x,
                        'height': lower - y
                    }
                    tiles_info.append(tile_info)
                    writer.writerow([tile_name, x, y, right - x, lower - y])
                    
        return tiles_info

    def is_likely_panel(self, crop):
        """Filter to identify likely solar panels"""
        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        brightness = np.mean(hsv[:, :, 2])
        saturation = np.mean(hsv[:, :, 1])
        avg_rgb = np.mean(crop, axis=(0, 1)).mean()
        return (40 < brightness < 180) and (30 < saturation < 140) and (30 < avg_rgb < 180)

    def run_yolo_and_store_boxes(self):
        """Run YOLO detection and store bounding boxes"""
        detection_results = []
        
        for fname in sorted(os.listdir(TILE_DIR)):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
                
            tile_path = os.path.join(TILE_DIR, fname)
            img = cv2.imread(tile_path)
            if img is None:
                continue

            results = self.yolo_model(img, conf=0.75, iou=0.84)[0]
            valid_boxes = []
            
            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                crop = img[max(0, y1):min(img.shape[0], y2), max(0, x1):min(img.shape[1], x2)]
                
                if crop.shape[0] < 20 or crop.shape[1] < 20 or not self.is_likely_panel(crop):
                    continue
                    
                valid_boxes.append([x1, y1, x2, y2])

            if valid_boxes:
                with open(os.path.join(BOXES_DIR, fname.replace(".jpg", ".json")), "w") as f:
                    json.dump(valid_boxes, f)
                    
                detection_results.append({
                    'tile': fname,
                    'detections': len(valid_boxes)
                })

            cv2.imwrite(os.path.join(ANNOTATED_DIR, fname), img)
            
        return detection_results

    def classify_detected_panels(self):
        """Classify detected solar panels using ResNet"""
        classification_results = []
        
        for json_file in sorted(os.listdir(BOXES_DIR)):
            if not json_file.endswith(".json"):
                continue

            tile_name = json_file.replace(".json", ".jpg")
            tile_path = os.path.join(ANNOTATED_DIR, tile_name)
            
            with open(os.path.join(BOXES_DIR, json_file), "r") as f:
                boxes = json.load(f)

            img = cv2.imread(tile_path)
            rgb = img[:, :, ::-1]
            
            tile_results = []
            
            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = map(int, box)
                crop = rgb[y1:y2, x1:x2]
                
                if crop.shape[0] < 20 or crop.shape[1] < 20:
                    continue
                    
                tensor = transform(PILImage.fromarray(crop)).unsqueeze(0).to(self.device)
                
                with torch.no_grad():
                    pred = self.classifier_model(tensor)
                    confidence = torch.softmax(pred, dim=1)
                    max_conf = torch.max(confidence).item()
                    label = CLASS_NAMES[torch.argmax(pred, dim=1).item()]

                color = (0, 255, 0) if label == "Clean" else (0, 0, 255)
                center_x = x1 + (x2 - x1) // 2
                center_y = y1 + (y2 - y1) // 2
                
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                cv2.putText(img, f"{label} ({max_conf:.2f})", (center_x - 30, center_y), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
                
                tile_results.append({
                    'panel_id': f"{tile_name}_{i}",
                    'classification': label,
                    'confidence': max_conf,
                    'bbox': [x1, y1, x2, y2]
                })

            cv2.imwrite(tile_path, img)
            
            if tile_results:
                classification_results.extend(tile_results)
                
        return classification_results

    def restitch_tiles(self, metadata_csv, annotated_dir, save_path):
        """Restitch tiles back into full image"""
        df = pd.read_csv(metadata_csv)
        full_width = df['x_start'].max() + df['width'].max()
        full_height = df['y_start'].max() + df['height'].max()
        canvas = np.zeros((full_height, full_width, 3), dtype=np.uint8)

        for _, row in df.iterrows():
            tile_path = os.path.join(annotated_dir, row['tile_name'])
            tile = cv2.imread(tile_path)
            if tile is None:
                continue
            x, y = int(row['x_start']), int(row['y_start'])
            canvas[y:y+tile.shape[0], x:x+tile.shape[1]] = tile

        cv2.imwrite(save_path, canvas)

    def generate_excel_report(self, classification_results, image_name, output_path):
        """Generate Excel report with classification results"""
        # Create summary statistics
        total_panels = len(classification_results)
        class_counts = {}
        for class_name in CLASS_NAMES:
            class_counts[class_name] = len([r for r in classification_results if r['classification'] == class_name])
        
        # Create detailed results DataFrame
        detailed_df = pd.DataFrame(classification_results)
        
        # Create summary DataFrame
        summary_data = {
            'Metric': ['Total Panels Detected'] + [f'{cls} Panels' for cls in CLASS_NAMES] + ['Processing Date'],
            'Value': [total_panels] + [class_counts[cls] for cls in CLASS_NAMES] + [datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
        }
        summary_df = pd.DataFrame(summary_data)
        
        # Write to Excel with multiple sheets
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            detailed_df.to_excel(writer, sheet_name='Detailed Results', index=False)
            
        return {
            'total_panels': total_panels,
            'class_distribution': class_counts,
            'file_path': output_path
        }

    def process_image(self, image_path, image_name):
        """Main processing pipeline"""
        # Clear temporary directories
        self.clear_directories(TILE_DIR, BOXES_DIR, ANNOTATED_DIR)
        
        # Load models
        self.load_models()
        
        # Generate output paths
        base_name = os.path.splitext(image_name)[0]
        output_image_path = os.path.join(OUTPUT_DIR, f"{base_name}_annotated.jpg")
        excel_path = os.path.join(OUTPUT_DIR, f"{base_name}_report.xlsx")
        metadata_csv = os.path.join(TILE_DIR, "tile_metadata.csv")
        
        # Extract GPS data
        img = Image.open(image_path)
        exif = get_exif_data(img)
        latitude, longitude = get_lat_lon(exif)

        try:
            # Run pipeline
            tiles_info = self.tile_image_with_mapping(image_path, TILE_DIR)
            detection_results = self.run_yolo_and_store_boxes()
            classification_results = self.classify_detected_panels()
            self.restitch_tiles(metadata_csv, ANNOTATED_DIR, output_image_path)
            
            # Generate Excel report
            excel_report = self.generate_excel_report(classification_results, image_name, excel_path)
            
            return {
                'success': True,
                'annotated_image': f"/outputs/{os.path.basename(output_image_path)}",
                'excel_report': f"/outputs/{os.path.basename(excel_path)}",
                'summary': excel_report,
                'detailed_results': classification_results,
                'gps_latitude': latitude,
                'gps_longitude': longitude
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

# Initialize processor
processor = SolarPanelProcessor()

@app.post("/process-upload")
async def process_upload(files: List[UploadFile] = File(...)):
    """Process uploaded images or folders"""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    results = []
    
    for file in files:
        if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
            
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process image
        try:
            result = processor.process_image(file_path, file.filename)
            results.append({
                'filename': file.filename,
                **result
            })
        except Exception as e:
            results.append({
                'filename': file.filename,
                'success': False,
                'error': str(e)
            })
    
    return {'results': results}

@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download generated files"""
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models_loaded": processor.yolo_model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 