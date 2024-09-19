import { Injectable } from '@angular/core';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

@Injectable({
  providedIn: 'root',
})
export class AIService {
  faceDetector: FaceDetector | undefined;

  constructor() {
    this.loadAIModels();
  }

  async loadAIModels() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        // 'assets/ml-models/wasm',
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
      );
      this.faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `../../../assets/ml-models/blaze_face_short_range.tflite`,
          // delegate: 'GPU',
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.2,
      });
      // face detector
    } catch (error) {
      console.log('Error in loading AI models', error);
      this.faceDetector = undefined;
    }
  }
}
