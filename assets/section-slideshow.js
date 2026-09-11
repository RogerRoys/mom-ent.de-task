class HeroSlideshow {
    constructor(element) {
        this.element = element;
        this.swiper = null; // Initialize swiper property
        this.init();

        // Event listener for Shopify block select
        window.addEventListener('shopify:block:select', e => {
            const selectedSlideIndex = +e.target.dataset.index;
            if (this.swiper) {
                this.swiper.slideTo(selectedSlideIndex, 600);
            }
        });
    }

    init() {
        window.addEventListener("load", () => {
            this.mountSlider();
        });
    }

    mountSlider() {
        const swiperContainer = this.element;
        
        const speed = swiperContainer.dataset.speed ? parseInt(swiperContainer.dataset.speed) : 50;
        const interval = swiperContainer.dataset.interval ? parseInt(swiperContainer.dataset.interval) : 2000;
        const autoplay = swiperContainer.dataset.autoplay === "true";
        const effect = swiperContainer.dataset.effect ? swiperContainer.dataset.effect : "fade"; // Default to fade if not specified

        const swiperConfig = {
            spaceBetween: 0,
            rewind: false,
            loop: true,
            effect: effect,
            speed: speed,
            pagination: {
              el: '.swiper-pagination',
            },          
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            }, 
            on: {
              activeIndexChange: function () {
                    resetAnimations(true);
                },
              slideChangeTransitionStart: function () {
                    PlayPauseVideos(true);
                },
              slideChangeTransitionEnd: function () {
                    resetAnimations(true);
                },
                init: function () {
                    resetAnimations(true);
                    PlayPauseVideos(true);
                    PlayPauseSlideshow(true);
                }
            }          
        };

        if (autoplay) {
            swiperConfig.autoplay = {
                delay: interval,
                disableOnInteraction: false,
            };
        }

        this.swiper = new Swiper(swiperContainer, swiperConfig);
    }
}

// Apply the HeroSlideshow behavior to all div elements with the class 'mySwiper'
document.addEventListener('DOMContentLoaded', () => {
    const swipers = document.querySelectorAll('div.mySwiper');
    swipers.forEach(swiper => {
        new HeroSlideshow(swiper);
    });
});

function resetAnimations() {
    // Select all slide containers
    let activeSlides = document.querySelectorAll('.swiper-slide--image:not(.swiper-slide-visible .swiper-slide--image)');

    // Loop through each slide and reset the animation if paused
    activeSlides.forEach(slide => {
        const img = slide.querySelector('img');
        if (img && getComputedStyle(img).animationPlayState === 'paused') {
            resetAnimation(slide);
        }
    });
}

function resetAnimation(element) {
    // Get the current animation class from the slide element
    let currentClass = getAnimationClass(element);

    if (currentClass) {
        // Temporarily remove the animation class
        element.classList.remove(currentClass);
        
        // Trigger reflow to remove the animation
        void element.offsetWidth; // Forces reflow to reset animation
        
        // Re-add the animation class to restart the animation
        element.classList.add(currentClass);
    }
}


function getAnimationClass(element) {
    // List of possible animation classes
    const animationClasses = [
        'image-animation-pan-left',
        'image-animation-pan-right',
        'image-animation-pan-up',
        'image-animation-pan-down',
        'image-animation-zoom-in',
        'image-animation-zoom-out',
    ];

    return animationClasses.find(className => element.classList.contains(className));
}

function PlayPauseVideos() {
    let allVideos = document.querySelectorAll('.swiper-slide--video video');

    allVideos.forEach(video => {
        let slide = video.closest('.swiper-slide');
        let isActiveSlide = slide.classList.contains('swiper-slide-visible') || slide.classList.contains('swiper-slide-active') || slide.classList.contains('swiper-slide-duplicate-active');
        
        if (isActiveSlide) {
            // Play the video immediately if the slide is active
            if (video.paused) {
                video.play();
            }
        } else {
            // Delay the pause by 1s if the slide is not active
            if (!video.paused) {
                setTimeout(() => {
                    video.pause();
                }, 1000); // 1 second delay
            }
        }
    });
}

function PlayPauseSlideshow() {
  const sliders = document.querySelectorAll('.swiper');

  sliders.forEach(swiperEl => {
    const toggleBtn = swiperEl.closest('.section')?.querySelector('.swiper-autoplay-toggle');
    if (!toggleBtn || !swiperEl.swiper) return;

    const swiper = swiperEl.swiper;

    toggleBtn.addEventListener('click', () => {
      if (swiper.autoplay.running) {
        swiper.autoplay.stop();
        toggleBtn.classList.remove('button-visual-status-pause');
        toggleBtn.classList.add('button-visual-status-play');
        //toggleBtn.setAttribute('aria-pressed', 'true');
      } else {
        swiper.autoplay.start();
        //toggleBtn.textContent = 'Pause';
        toggleBtn.classList.add('button-visual-status-pause');
        toggleBtn.classList.remove('button-visual-status-play');
        //toggleBtn.setAttribute('aria-pressed', 'false');
      }
    });
  });
}