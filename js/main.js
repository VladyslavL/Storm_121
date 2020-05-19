document.addEventListener('DOMContentLoaded', function(){
  // Init HLS
  var player = document.querySelector('.hero__video'),
      playerHasDataSrc = false;
  if(player.hasAttribute('data-src')){
    playerHasDataSrc = true;
  }

  if(playerHasDataSrc){
    if(!Hls.isSupported() && window.MSInputMethodContext) {
      console.log('flash')
      player.classList.add('video-js')
      player.classList.add('vjs-default-skin')
      var videojsPlayer = videojs(player, {
        fluid: true
      });
    }
  
    var initHLS = function(){
      if(Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(player.getAttribute('data-src'));
        hls.attachMedia(player);
        // hls.config.debug = true;
     }else{
       player.src = player.getAttribute('data-src');
       console.log('no hls');
       if(window.MSInputMethodContext) {
         videojsPlayer.src(
           {
             src: player.src
           }
         );
       }
      }
    }
  }


  var videoWatcher = function(){
    player.addEventListener('playing', function(){
      player.classList.remove('paused');
      player.classList.add('playing');
    }, false);
    player.addEventListener('play', function(){
      player.classList.remove('paused');
      player.classList.add('playing');
    }, false);

    player.addEventListener('pause', function(){
      if (this.seeking) return false;
      player.classList.remove('playing');
      player.classList.add('paused');
    }, false);
  }

  // Determining which one method we will use
  var clickEventType = ((document.ontouchstart!==null)?'click':'touchstart');
  console.log(clickEventType)

  if(playerHasDataSrc){
    initHLS();
  }
  videoWatcher();

  if(document.querySelector('.carousel') !== null){
    // Init carousel
    var carousel = tns({
      "container": '.carousel',
      "items": 1,
      "gutter": 0,
      "controls": false,
      "mouseDrag": true,
      "loop": false,
      "responsive": {
        "576": {
          "items": 2,
          "gutter": 10
        },
        "768": {
          "items": 3,
          "gutter": 20
        }
      },
    });
  
    // // Disabling click event triggering on carousel dragging/swiping
    var isSliding = false;
    carousel.events.on('touchMove', function() {
        isSliding = true;
    });
    carousel.events.on('touchEnd', function() {
        isSliding = false;
    });
    carousel.events.on('dragMove', function() {
      isSliding = true;
    });
    carousel.events.on('dragEnd', function() {
        isSliding = false;
    });
  
    var slides = document.querySelectorAll(".carousel__slide");
      for( i=0; i < slides.length; i++){
        slides[i].addEventListener('click', function() {
          if (isSliding) {
            event.stopPropagation();
            event.preventDefault();
            return false;
          }
          if(this.hasAttribute('data-src')){
            player.setAttribute('data-src', this.getAttribute('data-src'));
            document.querySelector('.topbar').scrollIntoView({behavior: 'smooth'})
            if(Hls.isSupported()) {
              initHLS();
            }
            player.play();
            if (videojsPlayer !== undefined){
              videojsPlayer.play();
            }
          }
        });
      }
  }

  // Scroll the page on .scroll_down click
  if(document.querySelector('.scroll_down') !== null){
    document.querySelector('.scroll_down').addEventListener(clickEventType, function () {
      document.querySelector('.content').scrollIntoView({behavior: 'smooth'})
    });
  }


  // Play video on .hero__play click
  if(document.querySelector('.hero__play') !== null){
    document.querySelector('.hero__play').addEventListener('click', function () {
      player.play();
      if (videojsPlayer !== undefined){
        videojsPlayer.play();
      }
    });
  }

  // function for Ajax POST
  function postAjax(url, data, success) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

    xhr.send(params);
    return xhr;
  }

  var buttons = document.querySelectorAll("a");
  for( i=0; i < buttons.length; i++){
    buttons[i].addEventListener('click', function() {
      postAjax(document.querySelector('html').getAttribute('data-register-event'), 
              JSON.stringify({ 
                event: 'A_CLICK',
                originalUrl: window.location.href,
                lpid: document.querySelector('html').getAttribute('data-page-id'),
                href: this.href,
                title: this.title
              }), 
              function(data){ console.log(data); }
      );
      
    });

  }

  player.addEventListener('play', function(){
    if (this.seeking || this.currentTime >= 0.1) return;

    postAjax(document.querySelector('html').getAttribute('data-register-event'), 
            JSON.stringify({ 
              event: 'VID_PLAY',
              originalUrl: window.location.href,
              lpid: document.querySelector('html').getAttribute('data-page-id')
            }), 
            function(data){ console.log(data); }
    );
  }, false);

  player.addEventListener('ended', function(){
    postAjax(document.querySelector('html').getAttribute('data-register-event'), 
            JSON.stringify({ 
              event: 'VID_WATCHED',
              originalUrl: window.location.href,
              lpid: document.querySelector('html').getAttribute('data-page-id')
            }), 
            function(data){ console.log(data); }
    );
  }, false);
});