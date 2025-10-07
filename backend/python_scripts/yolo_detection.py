
import sys
import os
import cv2
import json
import numpy as np
from ultralytics import YOLO
from pathlib import Path

def is_likely_panel(crop):
    """Filter to identify likely solar panels"""
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    brightness = np.mean(hsv[:, :, 2])
    saturation = np.mean(hsv[:, :, 1])
    avg_rgb = np.mean(crop, axis=(0, 1)).mean()
    return (40 < brightness < 180) and (30 < saturation < 140) and (30 < avg_rgb < 180)

def main():
    if len(sys.argv) != 4:
        print("Usage: python yolo_detection.py <model_path> <tile_dir> <boxes_dir>")
        sys.exit(1)
    
    model_path = sys.argv[1]
    tile_dir = sys.argv[2]
    boxes_dir = sys.argv[3]
    
    # Load YOLO model
    model = YOLO(model_path)
    
    results = []
    
    for fname in sorted(os.listdir(tile_dir)):
        if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
            
        tile_path = os.path.join(tile_dir, fname)
        img = cv2.imread(tile_path)
        if img is None:
            continue

        # Run YOLO detection
        detections = model(img, conf=0.75, iou=0.84)[0]
        valid_boxes = []
        
        for box in detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            crop = img[max(0, y1):min(img.shape[0], y2), max(0, x1):min(img.shape[1], x2)]
            
            if crop.shape[0] < 20 or crop.shape[1] < 20 or not is_likely_panel(crop):
                continue
                
            valid_boxes.append([x1, y1, x2, y2])

        if valid_boxes:
            # Save boxes to JSON
            boxes_file = os.path.join(boxes_dir, fname.replace(".jpg", ".json"))
            with open(boxes_file, "w") as f:
                json.dump(valid_boxes, f)
                
            results.append({
                'tile': fname,
                'detections': len(valid_boxes)
            })
    
    # Return results as JSON
    print(json.dumps(results))

if __name__ == "__main__":
    main()
