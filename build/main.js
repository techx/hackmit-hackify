"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var facebookInit = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var render, profilePicture, color, logo;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        render = new Rendering();
                        _context.next = 3;
                        return ImageLoader.fromFacebook();

                    case 3:
                        profilePicture = _context.sent;

                        render.drawImage(profilePicture);

                        color = $("input[name=faction]:checked").val();

                        // const cornerRect = Rect.fromPercents(render.canvas.width, render.canvas.height, 0.75, 0.75, 0.2, 0.2);

                        _context.next = 8;
                        return ImageLoader.fromURL("assets/hackoverlay.png");

                    case 8:
                        logo = _context.sent;

                        render.drawImage(logo, { globalCompositeOperation: "overlay" });
                        render.fillRect({ color: color, globalCompositeOperation: "color" });
                        // render.fillRect({color: "#1897ea", globalCompositeOperation: "color"});
                        // render.fillRect({color: "#FF585D", globalCompositeOperation: "color"});

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
        var video, logo, render, frameLoop;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        frameLoop = function frameLoop() {
                            var color = $("input[name=faction]:checked").val();

                            render.clear();
                            render.drawImage(video);
                            render.drawImage(logo, { globalCompositeOperation: "overlay" });
                            render.fillRect({ color: color, globalCompositeOperation: "color" });

                            $("#download").attr("href", render.toDataURL());
                            requestAnimationFrame(frameLoop);
                        };

                        _context2.next = 3;
                        return ImageLoader.fromWebcam();

                    case 3:
                        video = _context2.sent;
                        _context2.next = 6;
                        return ImageLoader.fromURL("assets/hackoverlay.png");

                    case 6:
                        logo = _context2.sent;
                        render = new Rendering();


                        requestAnimationFrame(frameLoop);
                        $('#placeholder').fadeOut();
                        $('#load-buttons').fadeOut();

                    case 11:
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

var Rendering = function () {
    function Rendering() {
        _classCallCheck(this, Rendering);

        this.canvas = $('#fb-img').get(0);
        this.ctx = this.canvas.getContext('2d');
        this.defaultRect = new Rect(0, 0, this.canvas.width, this.canvas.height);
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
        key: "toDataURL",
        value: function toDataURL() {
            return this.canvas.toDataURL('image/png');
        }
    }]);

    return Rendering;
}();

$("#facebook-init").click(facebookInit);
$('#webcam-init').click(webcamInit);
//# sourceMappingURL=main.js.map