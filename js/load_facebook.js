window.fbAsyncInit = function() {
FB.init({
  appId      : '745324348933960',
  xfbml      : true,
  version    : 'v2.4'
});
};

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "https://connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function facebookLogin() {
	FB.login(function(response) {
		if (response.authResponse) {
			FB.api('/me', function(response) {
				var fbid = response.id;
				loadFBProfileImage(fbid);
			});
		} else {
			console.log('User cancelled login or did not fully authorize.');
		}
	});
}

function loadFBProfileImage(fbid) {
  var loadeds = [false, false]
	var canvas = $('#fb-img').get(0);
	var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "soft-light"
  var image = new Image();
  image.crossOrigin = "Anonymous"
  image.src = "http://graph.facebook.com/" + fbid + "/picture?width=500&height=500";
  image.onload = function() {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#362487";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (loadeds[1]) {
      var img = canvas.toDataURL('image/png');
      $("#download").attr("href", img)
    }
    else {
      loadeds[0] = true;
    }
  }
  var newimage = new Image();
  newimage.src = 'http://localhost/hackoverlay.png'
  newimage.onload = function () {
    ctx.globalCompositeOperation = "overlay"
    ctx.drawImage(newimage, 0, 0, canvas.width, canvas.height)
    if (loadeds[0]) {
      var img = canvas.toDataURL('image/png');
      $("#download").attr("href", img)
    }
    else {
      loadeds[1] = true;
    }
  }
}
/*
function processNewImage() {
	var canvas = $('#fb-img').get(0);
	var ctx = canvas.getContext('2d');

	ctx.globalCompositeOperation = 'soft-light';
	var hack_img = $('#hack-overlay').get(0);
	ctx.drawImage(hack_img,0,0);
	$('#download').on('click', function(){
		this.href = canvas.toDataURL();
	});
}*/
