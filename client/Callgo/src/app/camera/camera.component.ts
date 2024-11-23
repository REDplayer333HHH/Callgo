import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
	constructor(private apiService: ApiService) {}

	ngOnInit() {
		this.canvas = document.createElement('canvas'); // Hidden canvas for capturing video frames
	}

  	camIsOn = false;
  	videoElement!: HTMLVideoElement;

	timer: any;
	canvas!: HTMLCanvasElement;
	postVideoBuffer: string[] = [];

	reconstructedFrames: string[] = [];
	frameInterval: any;

  	// Toggle camera on/off
	camera(videoElement: HTMLVideoElement): void {
    	this.videoElement = videoElement;

    	navigator.mediaDevices.getUserMedia({ video: true, audio: false })
			.then((stream) => {
				if (this.camIsOn) {
					videoElement.srcObject = null;
					this.camIsOn = false;
					this.stopSending();
				} else {
					this.camIsOn = true;
					videoElement.srcObject = stream;
					videoElement.play();
					this.startSending();
				}
			})
			.catch((err) => {
				console.error('Error accessing the camera', err);
			});
  	}

	// Start capturing and sending video data
	startSending(): void {
		this.timer = setInterval(() => {
		if (this.videoElement) {
			// Capture current frame as a base64 string
			this.canvas.width = this.videoElement.videoWidth;
			this.canvas.height = this.videoElement.videoHeight;
			const context = this.canvas.getContext('2d');
			context?.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

			const frame = this.canvas.toDataURL('image/jpeg'); // Capture frame as Base64
			this.postVideoBuffer.push(frame);

			// Send the buffered frames to the backend
			if (this.postVideoBuffer.length > 0) {
				this.apiService.postVideo('video', { video: this.postVideoBuffer.join('') }).subscribe({
					next: (response) => console.log('Video chunk uploaded:', response),
					error: (error) => console.error('Error uploading video chunk:', error),
				});

				// Clear buffer after sending
				this.postVideoBuffer = [];
			}
		}
		}, 2000); // Capture and send every 2 seconds
	}

	// Stop capturing and sending video data
	stopSending(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	reconstructVideo(): void {
		this.apiService.getVideo('video').subscribe({
			next: (frames: string[]) => {
			this.reconstructedFrames = frames;
			this.displayReconstructedVideo();
			},
			error: (error) => console.error('Error fetching video:', error),
		});
	}

	displayReconstructedVideo(): void {
		let frameIndex = 0;
	
		// Play the frames as a video using an interval
		this.frameInterval = setInterval(() => {
			const frameImage = document.getElementById('reconstructedFrame') as HTMLImageElement;
			if (frameImage && this.reconstructedFrames.length > 0) {
				frameImage.src = this.reconstructedFrames[frameIndex];
				frameIndex = (frameIndex + 1) % this.reconstructedFrames.length; // Loop through frames
			}
		}, 100); // 10 FPS
	}

	stopReconstructedVideo(): void {
		if (this.frameInterval) {
			clearInterval(this.frameInterval);
			this.frameInterval = null;
		}
	}
}
