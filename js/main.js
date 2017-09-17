navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;



class ImageLoader {
    static fromURL(url) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = url;
            image.onload = () => resolve(image);
        });
    }

    static fromFacebook(width=320, height=320) {
        return new Promise((resolve, reject) => {
            FB.login(function (response) {
                if (response.authResponse) {
                    FB.api('/me', function (response) {
                        ImageLoader
                            .fromURL("http://graph.facebook.com/" + response.id + "/picture?width=" + width + "&height=" + width)
                            .then(resolve);
                    });
                } else {
                    console.log("User cancelled login or did not fully authorize.");
                    reject("User cancelled login or did not fully authorize.")
                }
            });
        });
    }

    static fromWebcam() {
        return new Promise((resolve, reject) => {
            navigator.getUserMedia({ video: true, audio: false }, stream => {
                let video = document.createElement('video');
                video.setAttribute("autoplay", true);
                video.src = window.URL.createObjectURL(stream);
                video.addEventListener('loadedmetadata', () => resolve(video));
            }, e => {
                console.error('Webcam permissions request rejected!', e);
                reject(e);
            });
        });
    }
}

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static fromPercents(containerWidth, containerHeight, xPctTl, yPctTl, widthPct, heightPct) {
        const xTl = Math.floor(xPctTl * containerWidth);
        const yTl = Math.floor(yPctTl * containerHeight);
        const width = Math.floor(widthPct * containerWidth);
        const height = Math.floor(heightPct * containerHeight);
        return new Rect(xTl, yTl, width, height)
    }

    static fromContainerOffsets(containerWidth, containerHeight, xPctTl, yPctTl, xPctBr, yPctBr) {
        const xTl = Math.floor(xPctTl * containerWidth);
        const yTl = Math.floor(yPctTl * containerHeight);
        const width = Math.floor(xPctBr * containerWidth - xTl);
        const height = Math.floor(yPctBr * containerHeight - yTl);
        return new Rect(xTl, yTl, width, height);
    }
}

let Util = {
    c1: document.createElement("canvas"),
    c2: document.createElement("canvas"),

    rescale: function(imageData, fx, fy) {
        // Rescale image by fx, fy from the top left corner. Retains original size.
        let ctx1 = this.c1.getContext("2d");
        let ctx2 = this.c2.getContext("2d");

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

class Rendering {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width;
        this.canvas.style.height = height;

        this.ctx = this.canvas.getContext('2d');
        this.defaultRect = new Rect(0, 0, this.canvas.width, this.canvas.height);

        // For the red/blue filter
        let length = this.canvas.width * this.canvas.height * 4;
        this.red = new ImageData(new Uint8ClampedArray(length), this.canvas.width, this.canvas.height);
        this.blue = new ImageData(new Uint8ClampedArray(length), this.canvas.width, this.canvas.height);
        this.blended = new ImageData(new Uint8ClampedArray(length), this.canvas.width, this.canvas.height);

        this.clear();
    }

    clear() {
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawImage(image, {
        rect = this.defaultRect,
        globalCompositeOperation = "overlay"
    } = {}) {
        this.ctx.globalCompositeOperation = globalCompositeOperation;
        const {x, y, width, height} = rect;

        this.ctx.drawImage(image, x, y, width, height);
    }

    fillRect({
        color = "#FF585D",
        rect = this.defaultRect,
        globalCompositeOperation = "overlay"
    } = {}) {
        this.ctx.globalCompositeOperation = globalCompositeOperation;
        const {x, y, width, height} = rect;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    redBlueFilter(redScale, clipLower) {
        let image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < image.data.length; i += 4) {
            let grayValue = (image.data[i] + image.data[i + 1] + image.data[i + 2]) / 765.0;  // divide by 255 * 3

            // Red grad map
            this.red.data[i    ] = 37 * (1 - grayValue) + 255 * grayValue;
            this.red.data[i + 1] = 44 * (1 - grayValue) +  88 * grayValue;
            this.red.data[i + 2] = 55 * (1 - grayValue) +  93 * grayValue;
            this.red.data[i + 3] = 255;

            // Blue grad map
            this.blue.data[i    ] = 37 * (1 - grayValue) + 116 * grayValue;
            this.blue.data[i + 1] = 44 * (1 - grayValue) + 209 * grayValue;
            this.blue.data[i + 2] = 55 * (1 - grayValue) + 234 * grayValue;
        }

        // Resize red map
        this.red = Util.rescale(this.red, redScale, redScale);

        // Blend maps by lightening + clip colors to clipLower
        for (let i = 0; i < this.blended.data.length; i += 4) {
            this.blended.data[i    ] = Math.max(this.red.data[i    ], this.blue.data[i    ], clipLower);
            this.blended.data[i + 1] = Math.max(this.red.data[i + 1], this.blue.data[i + 1], clipLower);
            this.blended.data[i + 2] = Math.max(this.red.data[i + 2], this.blue.data[i + 2], clipLower);
            this.blended.data[i + 3] = 255;  // Set alpha to 255
        }

        // Copy result to canvas
        this.ctx.putImageData(this.blended, 0, 0);
    }

    addVignette(gaussianImage) {
        // let w = this.canvas.width;
        // let h = this.canvas.height;
        // let outerRadius = w * .5;
        // let innerRadius = w * .2;
        // let grd = this.ctx.createRadialGradient(w / 2, h / 2, innerRadius, w / 2, h / 2, outerRadius);
        // // light blue
        // grd.addColorStop(0, 'rgba(0,0,0,0)');
        // // dark blue
        // grd.addColorStop(1, 'rgba(0,0,0,' + alpha + ')');
        // this.ctx.fillStyle = grd;
        // this.ctx.fill();
        let rect = Rect.fromPercents(this.canvas.width, this.canvas.height, -.1125, -.1125, 1.25, 1.25);
        this.drawImage(gaussianImage, {globalCompositeOperation: "", rect: rect});
    }

    toDataURL() {
        return this.canvas.toDataURL('image/png');
    }
}

function setTimer(cb, seconds) {
    $("#timer h1").text(seconds);

    if (secondbottoms > 0) {
        setTimeout(() => setTimer(cb, seconds - 1), 1000);
    } else {
        cb();
    }
}

function shareCanvas(imageDataURL) {
    $("#shareModal .image").attr("src", imageDataURL);
    $("#shareModal")
        .modal("show");
    $("#download").attr("href", imageDataURL);
}

async function facebookInit() {
    let canvas = document.getElementById("fb-img");
    let render = new Rendering(canvas, 320, 320);

    const profilePicture = await ImageLoader.fromFacebook();

    const logo = await ImageLoader.fromURL("assets/hackoverlay.png");
    const cornerRect = Rect.fromPercents(
        render.canvas.width,
        render.canvas.height,
        0.75, 0.02,
        0.22, 0.22); // top right corner
    const gaussianImage = await ImageLoader.fromURL("assets/gaussian-darker-medium.png");

    render.drawImage(profilePicture);
    render.redBlueFilter(1.023, 40);
    render.addVignette(gaussianImage);
    render.drawImage(logo, {globalCompositeOperation: "overlay", rect: cornerRect});

    $("#placeholder").fadeOut();
    $("#load-buttons").fadeOut();

    $("#capture-now").click(() => shareCanvas(render.toDataURL()));
    $("#capture-now").fadeIn();

    // Rerun function if the user toggles their faction
    $("input[name=faction]").off("change").change(facebookInit);
}

async function webcamInit() {
    let video = await ImageLoader.fromWebcam();

    let canvas = document.getElementById("fb-img");
    let render = new Rendering(canvas, 440, 320);

    const logo = await ImageLoader.fromURL("assets/hackoverlay.png");
    const cornerRect = new Rect(440 - 90, 10, 80, 80); // top right corner
    const gaussianImage = await ImageLoader.fromURL("assets/gaussian-darker-medium.png");

    function frameLoop() {
        render.clear();
        render.drawImage(video);
        render.redBlueFilter(1.023, 0);
        // render.fillRect({color: "rgb(200, 200, 200)", globalCompositeOperation: "soft-light"});
        render.addVignette(gaussianImage);
        render.drawImage(logo, {globalCompositeOperation: "overlay", rect: cornerRect});

        requestAnimationFrame(frameLoop);
    }

    $("#text").css("margin-top", 0);

    $("#placeholder").fadeOut();
    $("#load-buttons").fadeOut();

    $("#capture-now").click(() => shareCanvas(render.toDataURL()));

    $("#capture-10").click(() => {
        $("#timer").fadeIn();
        setTimer(() => {
            $("#timer").fadeOut();
            shareCanvas(render.toDataURL());
        }, 10);
    });
    $("#capture-buttons a").fadeIn();

    requestAnimationFrame(frameLoop);
}

document.getElementById('facebook-init').onclick = facebookInit;
document.getElementById('webcam-init').onclick = webcamInit;

$("document").ready(function() {
    $('.ui.modal').modal();
});