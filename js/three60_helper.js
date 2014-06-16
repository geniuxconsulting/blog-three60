var DEFAULT_OPTIONS = {
	// the URL of the video to be loaded (must be in same domain or from CORS enabled server)
	videoURL: undefined,
	// the target element where to put the canvas
	target: undefined,
	// number of screens to simulate
	size: 1,
	// the horizontal FOV of a projection
	fov: 90.0,
	// in how many fustrums should a projection be split
	camerasPerView: 1,
	// called when initialization is complete
	callback: function () { console.log('three60 initialized'); }
};

var options;

// howmany h & v tiles does the sphere have
var SPHERE_QUALITY = 32;
// the radius of the sphere
var SPHERE_RADIUS = 1024;
// near & far planes
var NEAR = 10, FAR = 10000;

var PAN_VELOCITY = 0.01;

var H_ROT_AX = new three60.THREE.Vector3(0,1,0);
var V_ROT_AX = new three60.THREE.Vector3(0,0,1);

var INITIALIZED = false;

var movieScreen=null, camera;

// array of screen elements
var scene=null, renderer=null, videoTexture=null;

// custom global variables
var video=null, stats=null;
var useCanvas=false, videoImage=null, videoImageContext=null;

var rotateAroundWorldAxis = function (object, axis, radians) {
	// http://stackoverflow.com/questions/11060734/how-to-rotate-a-3d-object-on-axis-three-js
	var rotWorldMatrix = new three60.THREE.Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

	rotWorldMatrix.multiply(object.matrix);

	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
};

var init3D = function () {
	video.play();
	video.currentTime=0;
	if (useCanvas) {
		videoImageContext = videoImage.getContext('2d');
		// flip the canvas (watching sphere from inside)
		videoImageContext.translate(videoImage.width, 0);
		videoImageContext.scale(-1, 1);
		// background color if no video present
		videoImageContext.fillStyle = '#000000';
		videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);
		videoTexture = new three60.THREE.Texture(videoImage);
	} else {
		videoTexture = new three60.THREE.Texture(video);
		// flipX https://github.com/jeromeetienne/tquery/blob/master/plugins/webrtcio/olddemo/index.html
		videoTexture.repeat.set(-1, 1);
		videoTexture.offset.set( 1, 0);
	}
	videoTexture.minFilter = three60.THREE.LinearFilter;
	videoTexture.magFilter = three60.THREE.LinearFilter;

	var movieMaterial = new three60.THREE.MeshBasicMaterial({
		map: videoTexture,
		overdraw: true,
		blending: three60.THREE.NoBlending,
		shading: three60.THREE.NoShading,
		fog: false,
		side:three60.THREE.BackSide
	});
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	var movieGeometry = new three60.THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_QUALITY, SPHERE_QUALITY);
	movieGeometry.dynamic = true;
	movieScreen = new three60.THREE.Mesh(movieGeometry, movieMaterial);
	movieScreen.position.set(0,0,0);
	scene.add(movieScreen);
	INITIALIZED = true;
};

var setFOV = function (fov) {
	var hfov = fov / options.camerasPerView;
	var ASPECT = options.width/ options.height;
	var vfov = (2.0 * Math.atan(Math.tan(hfov * Math.PI/180.0 / 2.0) / ASPECT)) * 180.0/Math.PI;

	camera.fov = vfov;
	camera.updateProjectionMatrix();
	var deg = 0;
	// console.log(deg);
	deg *= Math.PI / 180;
	var lat = new three60.THREE.Vector3(Math.cos(deg), 0, Math.sin(deg));
	camera.lookAt(lat);
};


var initCam = function () {
	var ASPECT = options.width / options.height;
	// CAMERA
	camera = new three60.THREE.PerspectiveCamera(35, ASPECT, NEAR, FAR);
	camera.position.set(0, 0, 0);
	scene.add(camera);
	setFOV(options.fov);
};

function render() {
	if (!INITIALIZED) { return; }
	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		if (useCanvas) {
			videoImageContext.drawImage(video, 0, 0, videoImage.width, videoImage.height);
		}
		if (videoTexture) {
			videoTexture.needsUpdate = true;
		}
	}
	renderer.render(scene, camera);
	stats.update();
}

var animate = function () {
	if (!INITIALIZED) { return; }
	requestAnimationFrame(animate);
	render();
};

var destroy = function () {
	// console.log('destroy 3d');
	try {
		INITIALIZED = false;
		movieScreen = null;
		_.each(cameras, function (cam){
			cam = null;
		});
		cameras = [];
		scene = null;
		renderer = null;
		videoTexture = null;
		if (video) {
			video.pause();
			video.src='';
			video.load();
		}
		stats = null;
		if (useCanvas) {
			videoImage = null;
			videoImageContext = null;
		}
	} catch (e) {

	}
};

// FUNCTIONS
var init = function (opts) {
	destroy();
	// console.log('init 3d');
	options = _.extend(
		{},
		DEFAULT_OPTIONS,
		{
			width: window.innerWidth,
			height: window.innerHeight
		},
		opts);

	// RENDERER
	if (three60.Detector.webgl) {
		renderer = new three60.THREE.WebGLRenderer({antialias: false});
	} else {
		renderer = new three60.THREE.CanvasRenderer();
		// console.log('No WebGL support');
	}
	renderer.setSize(options.width, options.height);
	options.target.appendChild(renderer.domElement);
	scene = new three60.THREE.Scene();

	initCam();

	// EVENTS
	// STATS
	stats = new three60.Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	options.target.appendChild(stats.domElement);

	///////////
	// VIDEO //
	///////////

	// create the video element
	video = document.createElement('video');
	App.three60.video = video;
	video.volume = 1;
	video.loop = true;
	video.src = options.videoURL;
	video.oncanplay = function () {
		useCanvas = video.videoWidth > 3000;
		if (useCanvas) {
			// console.log('Using canvas for texture');
			videoImage = document.createElement('canvas');
			videoImage.width = options.videoWidth || video.videoWidth;
			videoImage.height = options.videoHeight || video.videoHeight;
		}

		video.oncanplay = undefined;

		options.callback();

		init3D();
		animate();
	};
	video.load(); // must call after setting/changing source
};

App.component('three60').expose({
	pan: function (delta) {
		if (!INITIALIZED) {return;}
		var dx = delta.x * PAN_VELOCITY;
		var dy = delta.y * PAN_VELOCITY;

		rotateAroundWorldAxis(movieScreen, V_ROT_AX, dy);
		movieScreen.rotateOnAxis(H_ROT_AX, dx);
	},
	zoom: function (zoom) {
		var fov = options.fov / zoom;
		fov = Math.max(10, Math.min(170, fov));
		setFOV(fov);
	},
	resetRotation: function () {
		if (!INITIALIZED) {return;}

	},
	destroy: destroy,
	init: init
});
