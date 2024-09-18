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
} from '@angular/core';

import * as cropro from 'cropro';
import * as markerjs2 from 'markerjs2';

// import { AIService } from "src/app/services/ai-service/ai-service.service";

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss',
})
export class ImageEditorComponent implements OnInit {
  ngOnInit() {}
  constructor() {}
}
