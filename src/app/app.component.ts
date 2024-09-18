import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  uploadedImage: File | null = null;
  isEditorModalOpen = false;

  // Trigger the hidden file input
  onUploadClick(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLElement;
    fileInput.click();
    this.isEditorModalOpen = true;
  }

  // Save the uploaded file in the component variable
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedImage = input.files[0];
      this.convertFileToBase64(this.uploadedImage).then((base64: string) => {
        console.log('Base64:', base64);
      });
    }
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
