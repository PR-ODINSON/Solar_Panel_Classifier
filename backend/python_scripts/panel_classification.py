
import sys
import os
import cv2
import json
import torch
import numpy as np
from PIL import Image as PILImage, ImageDraw, ImageFont
from torchvision import transforms
from torchvision.models import resnet50
from pathlib import Path

def get_class_color(label):
    """Get color for each classification class"""
    colors = {
        "Clean": (0, 255, 0),      # Green
        "Dusty": (0, 165, 255),    # Orange  
        "Bird-drop": (0, 255, 255), # Yellow
        "Physical-Damage": (0, 0, 255)  # Red
    }
    return colors.get(label, (128, 128, 128))  # Gray for unknown

def draw_enhanced_annotation(img, x1, y1, x2, y2, label, confidence):
    """Draw enhanced bounding box with label and confidence"""
    color = get_class_color(label)
    
    # Draw thicker bounding box
    thickness = max(2, int((x2 - x1) / 100))
    cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
    
    # Prepare label text
    conf_text = f"{confidence:.2f}"
    label_text = f"{label}"
    
    # Calculate text size and position
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = min(0.7, (x2 - x1) / 200)
    text_thickness = max(1, int(font_scale * 2))
    
    # Get text size for background rectangle
    (label_w, label_h), _ = cv2.getTextSize(label_text, font, font_scale, text_thickness)
    (conf_w, conf_h), _ = cv2.getTextSize(conf_text, font, font_scale * 0.8, text_thickness)
    
    # Position label above the box, or inside if not enough space
    label_y = y1 - 10 if y1 > 30 else y1 + 25
    
    # Draw background rectangle for label
    bg_x1 = x1
    bg_y1 = label_y - label_h - 5
    bg_x2 = x1 + max(label_w, conf_w) + 10
    bg_y2 = label_y + 5
    
    # Ensure background stays within image bounds
    bg_y1 = max(0, bg_y1)
    bg_y2 = min(img.shape[0], bg_y2)
    bg_x2 = min(img.shape[1], bg_x2)
    
    # Draw semi-transparent background
    overlay = img.copy()
    cv2.rectangle(overlay, (bg_x1, bg_y1), (bg_x2, bg_y2), color, -1)
    alpha = 0.7
    cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
    
    # Draw text
    cv2.putText(img, label_text, (x1 + 5, label_y - 2), font, font_scale, (255, 255, 255), text_thickness)
    cv2.putText(img, conf_text, (x1 + 5, label_y + conf_h + 3), font, font_scale * 0.8, (255, 255, 255), text_thickness)
    
    # Add small corner indicators for better visibility
    corner_size = min(10, (x2 - x1) // 10)
    cv2.rectangle(img, (x1, y1), (x1 + corner_size, y1 + corner_size), color, -1)
    cv2.rectangle(img, (x2 - corner_size, y1), (x2, y1 + corner_size), color, -1)
    cv2.rectangle(img, (x1, y2 - corner_size), (x1 + corner_size, y2), color, -1)
    cv2.rectangle(img, (x2 - corner_size, y2 - corner_size), (x2, y2), color, -1)

def add_summary_overlay(img, tile_results):
    """Add summary information overlay to the image"""
    if not tile_results:
        return
    
    # Count classifications
    class_counts = {}
    total_panels = len(tile_results)
    
    for result in tile_results:
        label = result['classification']
        class_counts[label] = class_counts.get(label, 0) + 1
    
    # Prepare summary text
    summary_lines = [f"Total Panels: {total_panels}"]
    for label, count in class_counts.items():
        percentage = (count / total_panels) * 100
        summary_lines.append(f"{label}: {count} ({percentage:.1f}%)")
    
    # Draw summary box in top-right corner
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    thickness = 2
    
    # Calculate text dimensions
    text_height = 25
    max_width = 0
    for line in summary_lines:
        (w, h), _ = cv2.getTextSize(line, font, font_scale, thickness)
        max_width = max(max_width, w)
    
    # Position and size of summary box
    box_padding = 10
    box_width = max_width + 2 * box_padding
    box_height = len(summary_lines) * text_height + 2 * box_padding
    
    box_x = img.shape[1] - box_width - 20
    box_y = 20
    
    # Draw semi-transparent background
    overlay = img.copy()
    cv2.rectangle(overlay, (box_x, box_y), (box_x + box_width, box_y + box_height), (0, 0, 0), -1)
    alpha = 0.7
    cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
    
    # Draw border
    cv2.rectangle(img, (box_x, box_y), (box_x + box_width, box_y + box_height), (255, 255, 255), 2)
    
    # Draw text
    for i, line in enumerate(summary_lines):
        y_pos = box_y + box_padding + (i + 1) * text_height
        color = (255, 255, 255) if i == 0 else get_class_color(line.split(':')[0])
        cv2.putText(img, line, (box_x + box_padding, y_pos), font, font_scale, color, thickness)

def main():
    if len(sys.argv) != 5:
        print("Usage: python panel_classification.py <classifier_path> <tile_dir> <boxes_dir> <annotated_dir>")
        sys.exit(1)
    
    classifier_path = sys.argv[1]
    tile_dir = sys.argv[2]
    boxes_dir = sys.argv[3]
    annotated_dir = sys.argv[4]
    
    # Setup device and transforms
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3)
    ])
    
    # Load classifier
    class_names = ["Bird-drop", "Clean", "Dusty", "Physical-Damage"]
    model = resnet50()
    model.fc = torch.nn.Linear(model.fc.in_features, len(class_names))
    model.load_state_dict(torch.load(classifier_path, map_location="cpu"), strict=False)
    model.eval()
    model.to(device)
    
    classification_results = []
    
    # Process ALL tiles, not just those with detections
    all_tiles = set()
    for fname in os.listdir(tile_dir):
        if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            all_tiles.add(fname)
    
    for tile_name in sorted(all_tiles):
        tile_path = os.path.join(tile_dir, tile_name)
        img = cv2.imread(tile_path)
        if img is None:
            continue
        
        # Check if this tile has detection boxes
        json_file = tile_name.replace(".jpg", ".json").replace(".jpeg", ".json").replace(".png", ".json")
        boxes_file = os.path.join(boxes_dir, json_file)
        
        boxes = []
        if os.path.exists(boxes_file):
            with open(boxes_file, "r") as f:
                boxes = json.load(f)
        
        rgb = img[:, :, ::-1]
        tile_results = []
        
        # Process detections if any exist
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box)
            crop = rgb[y1:y2, x1:x2]
            
            if crop.shape[0] < 20 or crop.shape[1] < 20:
                continue
                
            tensor = transform(PILImage.fromarray(crop)).unsqueeze(0).to(device)
            
            with torch.no_grad():
                pred = model(tensor)
                confidence = torch.softmax(pred, dim=1)
                max_conf = torch.max(confidence).item()
                label = class_names[torch.argmax(pred, dim=1).item()]

            # Draw enhanced annotations
            draw_enhanced_annotation(img, x1, y1, x2, y2, label, max_conf)
            
            tile_results.append({
                'panel_id': f"{tile_name}_{i}",
                'classification': label,
                'confidence': max_conf,
                'bbox': [x1, y1, x2, y2]
            })

        # Add summary overlay to the tile if there are detections
        if tile_results:
            add_summary_overlay(img, tile_results)
        
        # ALWAYS save the tile image (even if no detections) to prevent missing tiles
        cv2.imwrite(os.path.join(annotated_dir, tile_name), img, [cv2.IMWRITE_JPEG_QUALITY, 95])
        
        # Add results to global list
        if tile_results:
            classification_results.extend(tile_results)
    
    # Return results as JSON
    print(json.dumps(classification_results))

if __name__ == "__main__":
    main()
