# AI Models Directory

## YOLOv8n Pothole Detection Model

Place your trained YOLOv8n ONNX model here as `pothole.onnx`.

### Model Requirements
- **Format**: ONNX (Open Neural Network Exchange)
- **Architecture**: YOLOv8n (Nano variant for fast inference)
- **Input**: 640x640 RGB image
- **Output**: Bounding boxes with confidence scores
- **Classes**: Pothole detection

### Getting the Model

#### Option 1: Use Pre-trained Model
Download a pre-trained pothole detection model from:
- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [Roboflow Universe](https://universe.roboflow.com/)

#### Option 2: Train Your Own
1. Collect pothole images
2. Annotate with bounding boxes
3. Train using Ultralytics YOLOv8:
   ```bash
   pip install ultralytics
   yolo train model=yolov8n.pt data=pothole.yaml epochs=100
   yolo export model=runs/detect/train/weights/best.pt format=onnx
   ```

#### Option 3: Use Demo Model (For Testing)
For hackathon testing, you can use a general object detection model:
```bash
# Download YOLOv8n ONNX
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx -O pothole.onnx
```

### File Structure
```
public/
└── models/
    ├── README.md (this file)
    └── pothole.onnx (your model - not included in git)
```

**Note**: The model file is gitignored to keep the repository size small. Each developer needs to add their own model file.
