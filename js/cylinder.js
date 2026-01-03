class Cylinder {
  constructor() {
    this.title = document.querySelector('.cylinder__title');
    this.textWrapper = document.querySelector('.cylinder__text__wrapper');
    this.textItems = document.querySelectorAll('.cylinder__text__item');
    this.wrapper = document.querySelector('.cylinder__wrapper');
    this.init();
  }

  init() {
    if (!this.title || !this.textWrapper) return;
    this.calculatePositions();
    this.createScrollTrigger();
  }

  calculatePositions() {
    const offset = 0.6;
    const radius = Math.min(window.innerWidth, window.innerHeight) * offset;
    const spacing = 180 / this.textItems.length;

    this.textItems.forEach((item, index) => {
      const angle = (index * spacing * Math.PI) / 180;
      const rotationAngle = index * -spacing;

      const x = 0;
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      item.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotationAngle}deg)`;
    });
  }

  createScrollTrigger() {
    const update = () => {
      const scrollTop = this.wrapper.scrollTop;
      const maxScroll = this.wrapper.scrollHeight - this.wrapper.clientHeight;
      const rotation = -80 + (scrollTop / maxScroll) * 350;
      this.textWrapper.style.transform = `rotateX(${rotation}deg)`;
    };
    this.wrapper.addEventListener('scroll', update);
    update();
  }

  resize() {
    this.calculatePositions();
  }
}
