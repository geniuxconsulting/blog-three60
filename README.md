# three60 `public/js/three60.js`

This is a sample project supporting the [blog post about 360 video player](http://www.geniuxconsulting.de/360-video-play…in-the-browser/)

The module creates a controllable (pan / zoom) 3D video viewer.

## Methods

### *init(options)*

Initializes the module, which consists of:
* creating a WebGl-enabled canvas
* loading the video
* starting the rendering loop, that basically starts the player

#### *options* is an object with the following properties

* height: the height of the destination video output `default: 0`
* width: the width of the destination video output `default: 0`
* videoURL: the URL of the video to be loaded (must be in same domain or from CORS enabled server) `default:  undefined`
* target: the target element where to put the canvas `default:  undefined`
* fov: the horizontal FOV of a projection `default:  90.0`
* minFOV: the minimum FOV (maximum zoom) > 0 `default:  30`
* maxFOV: the maximum FOV angle (minimum zoom) < 180 `default:  120`
* callback: called when initialization is complete `default:  loggingMethod`

### *pan(delta)*

The method recieves a delta object that specify how much relative panning should be applied and then it rotates the textured sphere accordingly
* along the world's vertical axis (for panning left / right)
* around its own horizontal (y) axis (for panning up / down)

### *zoom(zoom)*

Simply changes the FOV of the camera and also makes sure that the values are capped
unlike the pan method the zoom parameter here represents the absoulte value and not the delta (change)
returns true if zoom has been changed

### *getZoom()*

Returns the current zoom value

### *getVideo()*

Returns the video object to give the possibility of controlling it to external methods


## Dependencies

The module depends on the following libraries, which can all be found in the `/public/js/lib` directory.

* three.min.js
* stats.js (threejs module)
* detector.js (threejs module)


# Working with the project

This small project was made using [`meteorjs`](http://www.meteor.com) - because it needs a server to serve the video.

Follow the stps below to try it out locally:

* Install meteor by running: `curl https://install.meteor.com/ | sh` (Linux / OSX)
* Clone the repo: `git clone git@github.com:geniuxconsulting/blog-three60.git`
* `cd blog-three60`
* run `meteor`

If you are on Windows, or just want to take a look at a working example, you can play around with it in Google Chrome's console at the [github.io page of the project](geniuxconsulting.github.com/blog-three60)
