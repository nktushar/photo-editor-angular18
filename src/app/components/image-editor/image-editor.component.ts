import {
  Input,
  input,
  model,
  effect,
  inject,
  OnInit,
  Output,
  Component,
  EventEmitter,
  signal,
} from '@angular/core';

import * as cropro from 'cropro';
import * as markerjs2 from 'markerjs2';
import { AIService } from '../../services/ai-service/ai-service.service';

// import { AIService } from "src/app/services/ai-service/ai-service.service";

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss',
})
export class ImageEditorComponent implements OnInit {
  imgList = model<any[]>([]);
  isEditorOpen = model<boolean>(false);
  imgSrc = input('');

  public cropArea: any;
  public markerArea: any;
  public sampleImage: any;
  public selectedMenu: string = '';
  public menuItems = {
    FD: 'FD',
    UNDO: 'UNDO',
    REDO: 'REDO',
    TEXT: 'TEXT',
    DRAW: 'DRAW',
    CROP: 'CROP',
  };

  previousImg = '';
  public redoStack: string[] = [];
  public undoStack: string[] = [];

  constructor(public aiService: AIService) {}

  ngOnInit() {
    this.redoStack = [];
    this.undoStack = [];
    this.selectedMenu = '';
    this.sampleImage = document.getElementById('sampleImg');

    // Ensure the sampleImage is available
    if (!this.sampleImage) {
      console.error('Sample image element not found!');
      return;
    }

    this.cropArea = new cropro.CropArea(this.sampleImage);
    this.markerArea = new markerjs2.MarkerArea(this.sampleImage);

    this.markerArea?.addEventListener(
      'render',
      (event: any) => (this.sampleImage.src = event.dataUrl)
    );

    this.cropArea?.addRenderEventListener(
      (imgURL: any) => (this.sampleImage.src = imgURL)
    );

    setTimeout(() => {
      this.markerArea.uiStyleSettings.canvasBackgroundColor = '#2d2d2d';
      this.markerArea.uiStyleSettings.hideToolbar = true;
      this.cropArea.styles.settings.canvasBackgroundColor = '#2d2d2d';
      this.cropArea.styles.settings.hideTopToolbar = true;
    }, 100);
  }

  async doUndo() {
    if (this.undoStack.length) {
      const prevImg = this.undoStack.pop();
      this.redoStack.push(this.sampleImage.src);
      this.sampleImage.src = prevImg;
    }
  }

  async doRedo() {
    if (this.redoStack.length) {
      const prevImg = this.redoStack.pop();
      this.undoStack.push(this.sampleImage.src);
      this.sampleImage.src = prevImg;
    }
  }

  async addText() {
    this.selectedMenu = this.menuItems.TEXT;
    await this.markerArea?.show();
    this.markerArea?.createNewMarker(markerjs2.TextMarker);
  }

  async startFreeHand() {
    this.selectedMenu = this.menuItems.DRAW;
    await this.markerArea?.show();
    this.markerArea?.createNewMarker(markerjs2.FreehandMarker);
  }

  async runAI() {
    this.selectedMenu = this.menuItems.FD;
    this.addCanvas();
  }

  addCanvas() {
    try {
      let canvas = document.createElement('canvas') as HTMLCanvasElement;
      const imgCanvas = document.getElementById('Imgcanvas');
      if (imgCanvas) {
        imgCanvas.appendChild(canvas);
      }
      canvas.height = this.sampleImage.height;
      canvas.width = this.sampleImage.width;

      var img = new Image();
      let that = this;
      var ctx = canvas.getContext('2d');

      img.addEventListener('load', async (e) => {
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          that.aiService.loadAIModels();
          setTimeout(async () => {
            if (that.aiService.faceDetector) {
              let detect = await that.aiService.faceDetector.detect(canvas);
              that.displayImageDetections(detect.detections, canvas, ctx);
            }
          }, 100);
        }
      });
      img.src = this.sampleImage.src;
    } catch (error) {
      console.log(error);
      this.closeEditor();
    }
  }

  displayImageDetections(detections: any, canvas: HTMLCanvasElement, ctx: any) {
    try {
      this.previousImg = this.sampleImage.src;
      if (detections.length) {
        for (let detection of detections) {
          var width = detection.boundingBox.width; // x-coordinate of the top-left corner of the area to blur
          var height = detection.boundingBox.height; // y-coordinate of the top-left corner of the area to blur
          var x = detection.boundingBox.originX; // width of the area to blur
          var y = detection.boundingBox.originY; // height of the area to blur
          // Blur the specified area
          this.drawRectangle(
            ctx,
            x,
            y,
            width,
            height,
            'rgba(80, 80, 80, 0.98)'
          );
        }
        this.sampleImage.src = canvas.toDataURL('image/jpeg', '0.1');
        canvas.remove();
      } else {
        if (
          confirm(
            'Could not detect any faces. Do you want to blur the face manually?'
          )
        ) {
          this.startFreeHand();
        } else {
          this.selectedMenu = '';
        }
        canvas.remove();
      }
    } catch (error) {
      console.log(error);
      this.closeEditor();
    }
  }

  drawRectangle(
    context: any,
    x: any,
    y: any,
    width: any,
    height: any,
    color: any
  ) {
    try {
      context.beginPath();
      context.rect(x, y, width, height);
      context.fillStyle = color;
      context.filter = 'blur(10px)';
      context.fill();
      context.closePath();
    } catch (error) {
      console.log(error);
      this.closeEditor();
    }
  }

  async doCrop() {
    this.selectedMenu = this.menuItems.CROP;
    this.cropArea?.show();
  }

  async closeEditor() {
    if (
      [this.menuItems.TEXT, this.menuItems.DRAW].includes(this.selectedMenu)
    ) {
      this.markerArea?.isOpen && (await this.markerArea?.close());
      this.selectedMenu = '';
    } else if ([this.menuItems.FD].includes(this.selectedMenu)) {
      this.sampleImage.src = this.previousImg;
      this.selectedMenu = '';
    } else if ([this.menuItems.CROP].includes(this.selectedMenu)) {
      this.cropArea?.isOpen && (await this.cropArea?.close());
      this.selectedMenu = '';
    } else {
      this.isEditorOpen.update((val) => (val = false));
    }
  }

  async exportImg() {
    if (
      [this.menuItems.TEXT, this.menuItems.DRAW].includes(this.selectedMenu)
    ) {
      this.undoStack.push(this.sampleImage.src);
      this.markerArea?.isOpen && (await this.markerArea?.startRenderAndClose());
      this.selectedMenu = '';
    } else if ([this.menuItems.CROP].includes(this.selectedMenu)) {
      this.undoStack.push(this.sampleImage.src);
      this.cropArea?.isOpen && (await this.cropArea?.startRenderAndClose());
      this.selectedMenu = '';
    } else if ([this.menuItems.FD].includes(this.selectedMenu)) {
      this.undoStack.push(this.previousImg);
      this.selectedMenu = '';
    } else {
      if (this.imgSrc()) {
        console.log('Sample Image:', this.sampleImage.src);
      }

      this.isEditorOpen.update((val) => (val = false));
    }
  }
}
