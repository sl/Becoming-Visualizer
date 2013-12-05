var main = new Main();
document.addEventListener("keydown", function(e) {
	if (e.keyCode === 49) {
		main.paused = 1;
	} else if (e.keyCode === 50) {
		main.paused = 2;
	} else if (e.keyCode === 27) {
		if (main.paused !== 0) {
			main.paused = 0;
			for (var i = 0; i < main.bubbles.length; ++i) {
				main.bubbles[i].highlighted = 0;
			}
		}
	}
}, true);
var uploadFileButton = document.getElementById('uploadFile');
uploadFileButton.addEventListener('change', uploadImage, false);
function Main() {
	this.canvas = document.querySelector('canvas');
	this.context = this.canvas.getContext('2d');
	this.lastTime = +new Date();
	this.bubbles = [];
	this.allLinks = [];
	this.lastZ = 0;
	this.paused = 0;
	this.mouse = new Mouse(this.canvas);
	this.step = function() {
		var time = +new Date();
		var deltaTime = time - main.lastTime;
		main.lastTime = time;
		main.canvas.width = window.innerWidth;
		main.canvas.height = window.innerHeight;
		if (main.paused === 0) {
			for (var i = 0; i < main.bubbles.length; ++i) {
				main.bubbles[i].step(deltaTime);
			}
		} else {
			//Determine which bubble is being highlighted
			var underCursor = [];
			for (var i = 0; i < main.bubbles.length; ++i) {
				var dist = Math.sqrt(Math.pow(main.mouse.y - main.bubbles[i].y, 2) + Math.pow(main.mouse.x - main.bubbles[i].x, 2));
				if (dist <= main.bubbles[i].radius) {
					underCursor.push(main.bubbles[i]);
				} else {
					main.bubbles[i].highlighted = 0;
				}
			}
			if (underCursor.length > 0) {
				underCursor.sort(function(a, b) {
					return a.z - b.z;
				});
				underCursor[0].highlighted = main.paused;
			}
			for (var i = 1; i < underCursor.length; ++i) {
				underCursor[i].highlighted = 0;
			}
		}
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
	this.vx = 0;
	this.vy = 0;
	this.z = main.lastZ++;
	this.radius = 40;
	this.highlighted = 0;
	this.render = function(c) {
		c.save();
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		c.closePath();
		c.clip();
		c.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
		c.strokeStyle = '#444';
		if (this.highlighted === 1) {
			c.strokeStyle = 'rgb(0, 255, 0)';
		} else if (this.highlighted === 2) {
			c.strokeStyle = 'rgb(255, 0, 0)';
		}
		c.lineWidth = this.highlighted === 0 ? 4 : 6;
		c.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2, true);
		c.stroke();
		c.restore();
	}
	this.step = function(deltaTime) {
		var spacingConst = 10;
		var angle = Math.atan2(this.y - main.canvas.height / 2, this.x - main.canvas.width / 2);
		var dist = Math.sqrt(Math.pow(this.y - main.canvas.height / 2, 2) + Math.pow(this.x - main.canvas.width / 2, 2));
		this.applyForce(-Math.cos(angle) * .02 * deltaTime, -Math.sin(angle) * .02 * deltaTime);
		if (dist > 1) {
			this.applyForce(Math.cos(angle) * spacingConst / dist, Math.sin(angle) * spacingConst / dist);
		}
		for (var i = 0; i < main.bubbles.length; ++i) {
			if (main.bubbles[i] !== this) {
				var repel = Math.atan2(this.y - main.bubbles[i].y, this.x - main.bubbles[i].x);
				var distance = Math.sqrt(Math.pow(this.y - main.bubbles[i].y, 2) + Math.pow(this.x - main.bubbles[i].x, 2));
				if (distance < this.radius / 3) {
					continue;
				}
				this.applyForce((Math.cos(repel) * spacingConst) / Math.pow(distance, 1), (Math.sin(repel) * spacingConst) / Math.pow(distance, 1));
			}
		}
		this.x += this.vx;
		this.y += this.vy;
		this.vx -= this.vx / 100;
		this.vy -= this.vy / 100;

	}
	this.applyForce = function(x, y) {
		this.vx += x;
		this.vy += y;
	}
	main.bubbles.push(this);
}

function Mouse(canvas) {
	this.x = 0;
	this.y = 0;
    canvas.addEventListener('mousemove', function(evt) {
    	var mousePos = getMousePosition(canvas, evt);
    	main.mouse.x = mousePos.x;
    	main.mouse.y = mousePos.y;
    }, false);
}

function getMousePosition(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function start() {
	for (var i = 0; i < main.bubbles.length; ++i) {
		main.bubbles[i].x = main.canvas.width / 2;
		main.bubbles[i].y = main.canvas.height / 2;
		var angle = Math.random() * 2 * Math.PI;
		var velocity = Math.random() * 6 + 2;
		main.bubbles[i].vx = Math.sin(angle) * velocity;
		main.bubbles[i].vy = Math.cos(angle) * velocity;
	}
}

function uploadImageClick() {
	document.getElementById('uploadFile').click();
}

function uploadImage(e) {
	console.log('Attempting to upload image');
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

