"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var facebookInit = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var render, profilePicture, logo, cornerRect;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        render = new Rendering();
                        _context.next = 3;
                        return ImageLoader.fromFacebook();

                    case 3:
                        profilePicture = _context.sent;
                        _context.next = 6;
                        return ImageLoader.fromURL("assets/hackoverlay.png");

                    case 6:
                        logo = _context.sent;
                        cornerRect = Rect.fromPercents(render.canvas.width, render.canvas.height, 0.75, 0.02, 0.22, 0.22); // top right corner

                        render.drawImage(profilePicture);
                        render.redBlueFilter(1.023, 40);
                        render.drawImage(logo, { globalCompositeOperation: "soft-light", rect: cornerRect });

                        $("#download").attr("href", render.toDataURL());

                        $('#placeholder').fadeOut();
                        $('#load-buttons').fadeOut();

                        // Rerun function if the user toggles their faction
                        $("input[name=faction]").off("change").change(facebookInit);

                    case 15:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function facebookInit() {
        return _ref3.apply(this, arguments);
    };
}();

var webcamInit = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var video, render, logo, cornerRect, frameLoop;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        frameLoop = function frameLoop() {
                            render.clear();
                            render.drawImage(video);
                            render.redBlueFilter(1.023, 40);
                            render.drawImage(logo, { globalCompositeOperation: "soft-light", rect: cornerRect });

                            requestAnimationFrame(frameLoop);
                        };

                        _context2.next = 3;
                        return ImageLoader.fromWebcam();

                    case 3:
                        video = _context2.sent;
                        render = new Rendering();
                        _context2.next = 7;
                        return ImageLoader.fromURL("assets/hackoverlay.png");

                    case 7:
                        logo = _context2.sent;
                        cornerRect = Rect.fromPercents(render.canvas.width, render.canvas.height, 0.75, 0.02, 0.22, 0.22); // top right corner

                        // TODO: Test downloading image on mobile
                        $("#download").mouseenter(function () {
                            $("#download").attr("href", render.toDataURL());
                        });

                        requestAnimationFrame(frameLoop);

                        $("#placeholder").fadeOut();
                        $("#load-buttons").fadeOut();

                    case 13:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function webcamInit() {
        return _ref4.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var ImageLoader = function () {
    function ImageLoader() {
        _classCallCheck(this, ImageLoader);
    }

    _createClass(ImageLoader, null, [{
        key: "fromURL",
        value: function fromURL(url) {
            return new Promise(function (resolve, reject) {
                var image = new Image();
                image.crossOrigin = "Anonymous";
                image.src = url;
                image.onload = function () {
                    return resolve(image);
                };
            });
        }
    }, {
        key: "fromFacebook",
        value: function fromFacebook() {
            return new Promise(function (resolve, reject) {
                FB.login(function (response) {
                    if (response.authResponse) {
                        FB.api('/me', function (response) {
                            ImageLoader.fromURL("http://graph.facebook.com/" + response.id + "/picture?width=320&height=320").then(resolve);
                        });
                    } else {
                        console.log("User cancelled login or did not fully authorize.");
                        reject("User cancelled login or did not fully authorize.");
                    }
                });
            });
        }
    }, {
        key: "fromWebcam",
        value: function fromWebcam() {
            return new Promise(function (resolve, reject) {
                navigator.getUserMedia({ video: true, audio: false }, function (stream) {
                    var video = document.createElement('video');
                    video.setAttribute("autoplay", true);
                    video.src = window.URL.createObjectURL(stream);
                    video.addEventListener('loadedmetadata', function () {
                        return resolve(video);
                    });
                }, function (e) {
                    console.error('Webcam permissions request rejected!', e);
                    reject(e);
                });
            });
        }
    }]);

    return ImageLoader;
}();

var Rect = function () {
    function Rect(x, y, width, height) {
        _classCallCheck(this, Rect);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    _createClass(Rect, null, [{
        key: "fromPercents",
        value: function fromPercents(containerWidth, containerHeight, xPctTl, yPctTl, widthPct, heightPct) {
            var xTl = Math.floor(xPctTl * containerWidth);
            var yTl = Math.floor(yPctTl * containerHeight);
            var width = Math.floor(widthPct * containerWidth);
            var height = Math.floor(heightPct * containerHeight);
            return new Rect(xTl, yTl, width, height);
        }
    }, {
        key: "fromContainerOffsets",
        value: function fromContainerOffsets(containerWidth, containerHeight, xPctTl, yPctTl, xPctBr, yPctBr) {
            var xTl = Math.floor(xPctTl * containerWidth);
            var yTl = Math.floor(yPctTl * containerHeight);
            var width = Math.floor(xPctBr * containerWidth - xTl);
            var height = Math.floor(yPctBr * containerHeight - yTl);
            return new Rect(xTl, yTl, width, height);
        }
    }]);

    return Rect;
}();

var Util = {
    c1: document.createElement("canvas"),
    c2: document.createElement("canvas"),

    rescale: function rescale(imageData, fx, fy) {
        // Rescale image by fx, fy from the top left corner. Retains original size.
        var ctx1 = this.c1.getContext("2d");
        var ctx2 = this.c2.getContext("2d");

        this.c1.width = imageData.width;
        this.c1.height = imageData.height;
        ctx1.putImageData(imageData, 0, 0);

        this.c2.width = fx * imageData.width;
        this.c2.height = fy * imageData.height;
        ctx2.scale(fx, fy);
        ctx2.drawImage(this.c1, 0, 0);

        return ctx2.getImageData(0, 0, imageData.width, imageData.height);
    }
};

var Rendering = function () {
    function Rendering() {
        _classCallCheck(this, Rendering);

        this.canvas = document.getElementById("fb-img");
        this.ctx = this.canvas.getContext('2d');
        this.defaultRect = new Rect(0, 0, this.canvas.width, this.canvas.height);

        // For the red/blue filter
        var length = this.canvas.width * this.canvas.height * 4;
        this.red = new ImageData(new Uint8ClampedArray(length), this.canvas.width, this.canvas.height);
        this.blue = new ImageData(new Uint8ClampedArray(length), this.canvas.width, this.canvas.height);
        this.blended = new ImageData(new Uint8ClampedArray(length), this.canvas.width, this.canvas.height);

        this.clear();
    }

    _createClass(Rendering, [{
        key: "clear",
        value: function clear() {
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }, {
        key: "drawImage",
        value: function drawImage(image) {
            var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                _ref$rect = _ref.rect,
                rect = _ref$rect === undefined ? this.defaultRect : _ref$rect,
                _ref$globalCompositeO = _ref.globalCompositeOperation,
                globalCompositeOperation = _ref$globalCompositeO === undefined ? "overlay" : _ref$globalCompositeO;

            this.ctx.globalCompositeOperation = globalCompositeOperation;
            var x = rect.x,
                y = rect.y,
                width = rect.width,
                height = rect.height;


            this.ctx.drawImage(image, x, y, width, height);
        }
    }, {
        key: "fillRect",
        value: function fillRect() {
            var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref2$color = _ref2.color,
                color = _ref2$color === undefined ? "#FF585D" : _ref2$color,
                _ref2$rect = _ref2.rect,
                rect = _ref2$rect === undefined ? this.defaultRect : _ref2$rect,
                _ref2$globalComposite = _ref2.globalCompositeOperation,
                globalCompositeOperation = _ref2$globalComposite === undefined ? "overlay" : _ref2$globalComposite;

            this.ctx.globalCompositeOperation = globalCompositeOperation;
            var x = rect.x,
                y = rect.y,
                width = rect.width,
                height = rect.height;


            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, width, height);
        }
    }, {
        key: "redBlueFilter",
        value: function redBlueFilter(redScale, clipLower) {
            var image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

            for (var i = 0; i < image.data.length; i += 4) {
                var grayValue = (image.data[i] + image.data[i + 1] + image.data[i + 2]) / 765.0; // divide by 255 * 3

                // Red grad map
                this.red.data[i] = 37 * (1 - grayValue) + 255 * grayValue;
                this.red.data[i + 1] = 44 * (1 - grayValue) + 88 * grayValue;
                this.red.data[i + 2] = 55 * (1 - grayValue) + 93 * grayValue;
                this.red.data[i + 3] = 255;

                // Blue grad map
                this.blue.data[i] = 37 * (1 - grayValue) + 116 * grayValue;
                this.blue.data[i + 1] = 44 * (1 - grayValue) + 209 * grayValue;
                this.blue.data[i + 2] = 55 * (1 - grayValue) + 234 * grayValue;
            }

            // Resize red map
            this.red = Util.rescale(this.red, redScale, redScale);

            // Blend maps by lightening + clip colors to clipLower
            for (var _i = 0; _i < this.blended.data.length; _i += 4) {
                this.blended.data[_i] = Math.max(this.red.data[_i], this.blue.data[_i], clipLower);
                this.blended.data[_i + 1] = Math.max(this.red.data[_i + 1], this.blue.data[_i + 1], clipLower);
                this.blended.data[_i + 2] = Math.max(this.red.data[_i + 2], this.blue.data[_i + 2], clipLower);
                this.blended.data[_i + 3] = 255; // Set alpha to 255
            }

            // Copy result to canvas
            this.ctx.putImageData(this.blended, 0, 0);
        }
    }, {
        key: "toDataURL",
        value: function toDataURL() {
            return this.canvas.toDataURL('image/png');
        }
    }]);

    return Rendering;
}();

document.getElementById('facebook-init').onclick = facebookInit;
document.getElementById('webcam-init').onclick = webcamInit;
//# sourceMappingURL=main.js.map