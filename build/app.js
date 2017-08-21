"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var fromFacebook = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        "use strict";

        var render, fbPhoto;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        render = new Rendering();
                        _context.next = 3;
                        return ImageLoader.fromFacebook();

                    case 3:
                        fbPhoto = _context.sent;

                        console.log(fbPhoto);

                    case 5:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function fromFacebook() {
        return _ref.apply(this, arguments);
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

                            // loadFBProfileImage(response.id);
                        });
                    } else {
                        console.log("User cancelled login or did not fully authorize.");
                        reject("User cancelled login or did not fully authorize.");
                    }
                });
            });
        }
    }]);

    return ImageLoader;
}();

var Rendering = function () {
    function Rendering() {
        _classCallCheck(this, Rendering);

        this.canvas = $('#fb-img').get(0);
        this.ctx = this.canvas.getContext('2d');
    }

    _createClass(Rendering, [{
        key: "reset",
        value: function reset() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }, {
        key: "drawImage",
        value: function drawImage(frame) {
            this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
        }
    }, {
        key: "drawLogo",
        value: function drawLogo() {
            var _this = this;

            ImageLoader.fromURL("assets/hackoverlay.png").then(function (overlayImage) {
                _this.ctx.globalCompositeOperation = "overlay";
                _this.ctx.globalCompositeOperation = "soft-light";
                _this.ctx.fillStyle = "#362487";
                _this.ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
                _this.ctx.drawImage(overlayImage, 0, 0, _this.canvas.width, _this.canvas.height);
            });
        }
    }, {
        key: "toDataURL",
        value: function toDataURL() {
            return this.canvas.toDataURL('image/png');
        }
    }]);

    return Rendering;
}();

$("#facebook-init").click(function () {
    "use strict";

    fromFacebook();
});

// $("#facebook-init").click(el => {
//     let render = new Rendering();
//
//     ImageLoader
//         .fromFacebook()
//         .then(frame => {
//             render.reset();
//             render.drawImage(frame);
//             render.drawLogo();
//
//             $("#download").attr("href", render.toDataURL());
//             $('#placeholder').fadeOut();
//         });
// });

window.onload = function () {};

/*
async function loadFBProfileImage(fbid) {
    let loadeds = [false, false];
    let canvas = $('#fb-img').get(0);
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "soft-light";

    const frame = await ImageLoader.fromURL("http://graph.facebook.com/" + fbid + "/picture?width=320&height=320");

    $('#placeholder').fadeOut();
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#362487";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (loadeds[1]) {
        let imgData = canvas.toDataURL('image/png');
        $("#download").attr("href", imgData);
    }
    else {
        loadeds[0] = true;
    }

    const overlayImage = await ImageLoader.fromURL("assets/hackoverlay.png");

    ctx.globalCompositeOperation = "overlay";
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    if (loadeds[0]) {
        let img = canvas.toDataURL('image/png');
        $("#download").attr("href", img);
    }
    else {
        loadeds[1] = true;
    }
}
*/

/*
function processNewImage() {
	let canvas = $('#fb-img').get(0);
	let ctx = canvas.getContext('2d');

	ctx.globalCompositeOperation = 'soft-light';
	let hack_img = $('#hack-overlay').get(0);
	ctx.drawImage(hack_img,0,0);
	$('#download').on('click', function(){
		this.href = canvas.toDataURL();
	});
}*/
//# sourceMappingURL=app.js.map