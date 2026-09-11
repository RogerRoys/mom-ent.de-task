// Hide controls and add click event listener to all video elements
document.querySelectorAll('.product-video-not-autoplay video').forEach(function(media) {
  // Hide controls
  //media.controls = false;

  // Click event listener for video playback
  media.addEventListener('click', function() {
    // Play or pause the current media
    var playButton = media.parentElement.querySelector('.product-video-central-play-button');
    
    if (media.paused || media.ended) {
      //media.play();
      playButton.classList.add('hidden');
      //media.controls = true;
    } else {
      //media.pause();
      //media.controls = false;
      playButton.classList.remove('hidden');
    }
  });
});

// Hide controls and add click event listener to all video elements
document.querySelectorAll('.product-video-is-autoplay video').forEach(function(media) {

  // Click event listener for video playback
  media.addEventListener('click', function() {
    if (media.paused || media.ended) {
      media.play();
    } else {
      media.pause();
    }
  });
});