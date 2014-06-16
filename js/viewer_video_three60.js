App.component('viewer.media.videoThree60');
var PAN_VELOCITY = 0.05;

var transformation;
var prevCenter;
var scale0;

var applyTransformation = function () {
	App.three60.pan(transformation);
	App.three60.zoom(transformation.scale);
};

var reset = function () {
	scale0 = 1;
	transformation = {
		scale: 1,
		x: 0,
		y: 0
	};
	applyTransformation();
};

var listeners = {
	hammer: {
		pinch: function (e) {
			var scale = scale0 * e.gesture.scale;
			transformation.scale = scale;
			applyTransformation();
		},
		transformend: function () {
			scale0 = transformation.scale;
		},
		tap: reset,
		dragstart: function (e) {
			prevCenter = e.gesture.center;
		},
		drag: function (e) {
			var dx = e.gesture.center.pageX - prevCenter.pageX;
			var dy = e.gesture.center.pageY - prevCenter.pageY;
			prevCenter = e.gesture.center;
			transformation.x = -dx * PAN_VELOCITY;
			transformation.y = -dy * PAN_VELOCITY;
			applyTransformation();
		}
	},
	mousewheel: function (e) {
		e.preventDefault();
		var chg = 1 + (e.originalEvent.deltaY < 0 ? 0.1:-0.1);
		var scale = transformation.scale * chg;
		transformation.scale = scale;
		applyTransformation();
	}
};

var initControls = function () {
	_.each(listeners.hammer, function (v, k) {
		$('#three60').hammer({'prevent_default': true}).on(k, v);
	});
	$('#three60').on('mousewheel', listeners.mousewheel);
};


var init = function (opts) {
	App.three60.init({
		size: 1,
		fov: 96,
		width: opts.$target.width(),
		height: opts.$target.height(),
		camerasPerView: 1,
		videoURL: opts.videoURL, //test.vid
		target: opts.$target[0],
		callback: function () {
			reset();

			initControls();
		}
	});
};
