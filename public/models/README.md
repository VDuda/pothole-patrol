# Pothole Detection Model

This directory should contain the ONNX model for pothole detection.

## Recommended Model: Pothole-Finetuned-YoloV8
We recommend using the fine-tuned model by **cazzz307**.

**How to get it:**
1.  Visit the Hugging Face model page: [https://huggingface.co/cazzz307/Pothole-Finetuned-YoloV8](https://huggingface.co/cazzz307/Pothole-Finetuned-YoloV8)
2.  Login and accept the access terms (it is a gated model).
3.  Go to "Files and versions".
4.  Download `best.onnx` (if available) OR download `best.pt`.
5.  **If you downloaded `best.pt`**: You need to convert it to ONNX.
    *   Install Ultralytics: `pip install ultralytics`
    *   Run: `yolo export model=best.pt format=onnx`
6.  Rename the resulting file to **`pothole.onnx`**.
7.  Place it in this directory (`public/models/pothole.onnx`).

## Fallback: Generic YOLOv8n
If you cannot access the specific pothole model, you can use a standard YOLOv8n model to test the pipeline (it will detect objects like people/cars instead of potholes).
1.  Download `yolov8n.onnx` from [Ultralytics Assets](https://github.com/ultralytics/assets/releases).
2.  Rename to `pothole.onnx` and place here.

## Application Logic
The application automatically detects the number of classes:
*   **1 Class (Custom Model):** All detections are labeled "pothole".
*   **80 Classes (Standard Model):** Class 0 (Person) is mapped to "pothole" for testing purposes (edit `src/lib/ai-model.ts` to change this).
