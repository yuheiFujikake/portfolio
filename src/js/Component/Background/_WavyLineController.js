export default class WavyLineController {
  constructor(color) {
    this.$window = $(window);
    this.canvas = null;
    this.context = null;
    this.centerPointY = 0;
    this.color = color || 'rgb(0, 255, 195)';
    this.wave = 100;
    this.interval = 1000;
    this.speed = 5;
    this.degree = 0;
  }

  _getCenterPointY() {
    return this.$window.height() / 2;
  }

  _draw(width, height) {
    this.centerPointY = this._getCenterPointY();
    this.context.clearRect(0, 0, width, height);
    this.context.beginPath();
    this.context.moveTo(0, -this.wave * Math.sin(((2 * Math.PI) / this.interval) * this.degree) + this.centerPointY);

    for (let x = 1; x <= this.canvas.width; x += 1) {
      let y = -this.wave * Math.sin(((2 * Math.PI) / this.interval) * ((this.degree) + x));
      this.context.lineTo(x , y + this.canvas.height / 2);
    }

    this.context.stroke();
    this.context.closePath();
    this.degree += this.speed;
  }

  init() {
    this.canvas = document.getElementById('js-wavy_line');
    if ( !this.canvas || !this.canvas.getContext ) { return false; }
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerPointY = this._getCenterPointY();
    this.context = this.canvas.getContext('2d');
    this.context.shadowBlur = 5;
    this.context.shadowColor = this.color;
    this.context.lineWidth = 1;
    this.context.lineJoin = "round";
    this.context.strokeStyle = this.color;
    this.animation();
  }

  animation() {
    requestAnimationFrame(()=> {
      this._draw(window.innerWidth, window.innerHeight);
      this.animation();
    });
  }
  
}
