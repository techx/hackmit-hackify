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

    static fromFacebook() {
        return new Promise((resolve, reject) => {
            FB.login(function (response) {
                if (response.authResponse) {
                    FB.api('/me', function (response) {
                        ImageLoader
                            .fromURL("http://graph.facebook.com/" + response.id + "/picture?width=320&height=320")
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

class Rendering {
    constructor() {
        this.canvas = $('#fb-img').get(0);
        this.ctx = this.canvas.getContext('2d');
        this.defaultRect = new Rect(0, 0, this.canvas.width, this.canvas.height);
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

    toDataURL() {
        return this.canvas.toDataURL('image/png');
    }
}

async function facebookInit() {
    let render = new Rendering();

    const profilePicture = await ImageLoader.fromFacebook();
    render.drawImage(profilePicture);

    const color = $("input[name=faction]:checked").val();

    // const cornerRect = Rect.fromPercents(render.canvas.width, render.canvas.height, 0.75, 0.75, 0.2, 0.2);
    const logo = await ImageLoader.fromURL("assets/hackoverlay.png");
    render.drawImage(logo, {globalCompositeOperation: "overlay"});
    render.fillRect({color: color, globalCompositeOperation: "color"});

    $("#download").attr("href", render.toDataURL());
    $('#placeholder').fadeOut();
    $('#load-buttons').fadeOut();

    // Rerun function if the user toggles their faction
    $("input[name=faction]").off("change").change(facebookInit);
}

async function webcamInit() {
    let video = await ImageLoader.fromWebcam();
    const logo = await ImageLoader.fromURL("assets/hackoverlay.png");

    let render = new Rendering();
    function frameLoop() {
        const color = $("input[name=faction]:checked").val();

        render.clear();
        render.drawImage(video);
        render.drawImage(logo, {globalCompositeOperation: "overlay"});
        render.fillRect({color: color, globalCompositeOperation: "color"});

        $("#download").attr("href", render.toDataURL());
        requestAnimationFrame(frameLoop);
    }

    requestAnimationFrame(frameLoop);
    $('#placeholder').fadeOut();
    $('#load-buttons').fadeOut();
}

$("#facebook-init").click(facebookInit);
$('#webcam-init').click(webcamInit);