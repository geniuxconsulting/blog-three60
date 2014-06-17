(function(context) {
	var PAN_VELOCITY = 0.005;

	// hold previous touch  center. Important for calculating the delta movement values
	var prevCenter;

	// hammer and normal event listeners
	var listeners = {
		hammer: {
			tap: function() {
				three60.zoom(1);
			},
			dragstart: function(e) {
				prevCenter = e.gesture.center;
			},
			drag: function(e) {
				var dx = e.gesture.center.pageX - prevCenter.pageX;
				var dy = e.gesture.center.pageY - prevCenter.pageY;
				prevCenter = e.gesture.center;

				three60.pan({
					x: -dx * PAN_VELOCITY,
					y: -dy * PAN_VELOCITY
				});
			}
		},
		mousewheel: function(e) {
			var chg = 1 + (e.originalEvent.deltaY < 0 ? 0.1 : -0.1);
			var newZoom = three60.getZoom() * chg;
			three60.zoom(newZoom);
		}
	};

	// assign initial listeners
	var initControls = function() {
		$.each(listeners.hammer, function(k, v) {
			$('#three60').hammer({
				'prevent_default': true
			}).on(k, v);
		});
		$('#three60').on('mousewheel', listeners.mousewheel);
	};

	context.init = function(opts) {
		three60.init({
			fov: 96,
			width: opts.$target.width(),
			height: opts.$target.height(),
			videoURL: opts.videoURL,
			target: opts.$target[0],
			callback: function() {
				initControls();
			}
		});
	};
})(window);
