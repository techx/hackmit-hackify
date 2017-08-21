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

$("#facebook-init").click(async (el) => {
    let render = new Rendering();

    const profilePicture = await ImageLoader.fromFacebook();
    render.drawImage(profilePicture);

    const logo = await ImageLoader.fromURL("assets/hackoverlay.png");
    // const cornerRect = Rect.fromPercents(render.canvas.width, render.canvas.height, 0.75, 0.75, 0.2, 0.2);
    render.drawImage(logo, {globalCompositeOperation: "overlay"});
    render.fillRect({globalCompositeOperation: "soft-light"});

    $("#download").attr("href", render.toDataURL());
    $('#placeholder').fadeOut();
});
