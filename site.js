var main = new Main();
var uploadFileButton = document.getElementById('uploadFile');
uploadFileButton.addEventListener('change', uploadImage, false);
function Main() {
	this.canvas = document.querySelector('canvas');
	this.context = this.canvas.getContext('2d');
	this.lastTime = +new Date();
	this.bubbles = [];
	this.lastZ = 0;
	this.step = function() {
		var time = +new Date();
		var deltaTime = time - main.lastTime;
		main.lastTime = time;
		main.canvas.width = window.innerWidth;
		main.canvas.height = window.innerHeight;
		main.render(main.context);
	}
	this.render = function(c) {
		c.webkitImageSmoothingEnabled=true;
		main.bubbles.sort(function(a, b) {
			return a.z - b.z;
		});
		for (var i = 0; i < main.bubbles.length; ++i) {
			main.bubbles[i].render(c);
		}
	}
	this.timerId = setInterval(this.step, 10);
}

function Bubble(image) {
	this.image = image;
	this.x = main.canvas.width / 2;
	this.y = main.canvas.height / 2;
	this.z = main.lastZ++;
	this.radius = 40;
	this.render = function(c) {
		c.save();
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		c.closePath();
		c.clip();
		c.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
		c.strokeStyle = '#444';
		c.lineWidth = 4;
		c.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2, true);
		c.stroke();
		c.restore();
	}
	main.bubbles.push(this);
}

function uploadImageClick() {
	document.getElementById('uploadFile').click();
}

function uploadImage(e) {
	var reader = new FileReader();
	reader.onload = function(event) {
		var img = new Image();
		img.onload = function() {
			new Bubble(img);
			console.log('Image uploaded');
		}
		img.source = event.target.result;
	}
	reader.readAsDataURL(e.target.files[0]);
}

function linkImage() {
	console.log('starting linking image');
	var url = prompt('Enter the URL of the image to upload', 'http://');
	if (url === null || url === undefined || url === '') {
		console.log('Invalid image url!');
		return;
	}
	console.log('attempting to upload image from url: ' + url);
	var urlSplit = url.split('.');
	var extension = urlSplit[urlSplit.length - 1];
	if (extension !== 'jpg' && extension !== 'png' && extension !== 'gif') {
		alert('Invalid image format! Valid formats include jpg, png, and gif.');
	}
	var img = new Image();
	img.onload = function() {
		new Bubble(img);
		console.log('Image linked');
	}
	img.src = url;
}

