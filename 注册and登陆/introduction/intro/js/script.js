// 定义公共配置
const commonConfig = {
    loop: true,
    centerSlide: 'true',
    fade: 'true',
    grabCursor: 'true',
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    }
  };
  
  // 定义一些可能会更改的值
  const slidesPerViewDesktop = 3;
  const slidesPerViewTablet = 2;
  const slidesPerViewMobile = 1;
  const spaceBetweenSlides = 25;
  
  // 合并配置
  const finalConfig = {
    ...commonConfig,
    slidesPerView: slidesPerViewDesktop,
    spaceBetween: spaceBetweenSlides,
    breakpoints: {
      0: {
        slidesPerView: slidesPerViewMobile,
      },
      520: {
        slidesPerView: slidesPerViewTablet,
      },
      950: {
        slidesPerView: slidesPerViewDesktop,
      },
    },
  };
  
  // 创建 swiper 实例
  var swiper = new Swiper(".slide-content", finalConfig);