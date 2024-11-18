import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent implements OnInit {

	constructor() {}

	ngOnInit() {

	}

	camIsOn = false;

	camera(videoElement: HTMLVideoElement): void {
		navigator.mediaDevices.getUserMedia({ video: true, audio: false })
			.then((stream) => {
				if(this.camIsOn){
					videoElement.srcObject = null;
					this.camIsOn = false;
				} else {
					this.camIsOn = true;
					videoElement.srcObject = stream;
					videoElement.play();
				}
			})
			.catch((err) => {
				console.error('Error accessing the camera', err);
			});
	}
}
