import { Component, model, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImageEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  uploadedImage: File | null = null;
  isEditorOpen = model(false);
  imgSrc = model('');

  // Trigger the hidden file input
  onUploadClick(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLElement;
    fileInput.click();
  }

  // Save the uploaded file in the component variable
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedImage = input.files[0];
      this.convertFileToBase64(this.uploadedImage).then((base64: string) => {
        this.imgSrc.update((val) => (val = base64));
        this.isEditorOpen.update((val) => (val = true));
      });
    }
    input.value = '';
    this.uploadedImage = null;
  }

  // Convert file to base64
  convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };
}
