"use client";
import { FC, useEffect, useRef } from "react";
import { Application, Container, Rectangle, Sprite, SpriteOptions, Texture } from "pixi.js";
import imgAbout from "../assets/About.png";
import gsap from "gsap";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";

class Dot extends Sprite {
  private _offsetIndex: number = 0;

  public get offsetIndex(): number {
    return this._offsetIndex;
  }
  public set offsetIndex(v: number) {
    this._offsetIndex = v;
  }

  constructor(options?: SpriteOptions | Texture) {
    super(options);
  }
}

class FristViewCanvas {
  private app: Application = new Application();
  private container: Container = new Container();
  private dots: Dot[] = [];
  private root: HTMLDivElement;
  private imageSrc: string;
  private image: HTMLImageElement = new Image();
  private imageW: number = 0;
  private imageH: number = 0;
  private DOT_SIZE = 2;
  private context: CanvasRenderingContext2D | null = null;
  private noise: NoiseFunction2D = createNoise2D();
  constructor(root: HTMLDivElement | null, imageSrc: string) {
    if (!root) throw new Error("root dom がありません");
    this.root = root;
    this.imageSrc = imageSrc;
  }

  async setup() {
    await this.setupImage();
    await this.setupPixi();
    this.convertParticleSprite();
    this.setupPosition();
    this.setupMotion();
    window.addEventListener("resize", () => this.setupPosition());
  }

  private async setupImage() {
    this.image.src = this.imageSrc;
    await this.image.decode();
    // 画像のサイズを算出
    this.imageW = this.image.width;
    this.imageH = this.image.height;
    // 画像をメモリ上のcanvasに転写。ピクセル値を取得するため
    const canvas = document.createElement("canvas");
    canvas.width = this.imageW;
    canvas.height = this.imageH;
    this.context = canvas.getContext("2d", { willReadFrequently: true });
    if (!this.context) throw new Error("2d contextがありません");
    this.context.drawImage(this.image, 0, 0);
  }

  private async setupPixi() {
    await this.app.init({
      antialias: true,
      resizeTo: window,
      autoDensity: true,
      backgroundColor: 0x000000,
      resolution: devicePixelRatio,
    });
    this.root.appendChild(this.app.canvas);
    this.container = new Container();
    this.app.stage.addChild(this.container);
  }

  private convertParticleSprite() {
    if (!this.context) throw new Error("2D contextがありません。");
    const texture = Texture.from(this.image);
    for (let i = 0; i < this.imageW * this.imageH; i++) {
      // カウンタ変数 i から x, y を算出
      const x = (i % this.imageW) * this.DOT_SIZE;
      const y = Math.floor(i / this.imageW) * this.DOT_SIZE;

      // x,y座標の画素情報を取得
      const dotData = this.context.getImageData(x + Math.floor(this.DOT_SIZE / 2), y + Math.floor(this.DOT_SIZE / 2), 1, 1);
      const alpha = dotData.data[3];
      if (alpha === 0) continue;

      // パーティクルを生成
      const texture2 = new Texture({
        source: texture._source,
        frame: new Rectangle(x, y, this.DOT_SIZE, this.DOT_SIZE),
      });
      const dot = new Dot(texture2);
      dot.anchor.set(0.5);
      dot.x = x;
      dot.y = y;
      dot.offsetIndex = i;
      this.container.addChild(dot);
      this.dots.push(dot);
    }
  }

  private setupMotion() {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    this.dots.forEach((dot) => {
      const index = dot.offsetIndex;

      // XとYを正規化 (Normalize X and Y)
      // nx は左辺を基準に 0.0〜1.0の値をとる
      const nx = (index % this.imageW) / this.imageW;
      // ny は上辺を基準に 0.0〜1.0の値をとる
      const ny = Math.floor(index / this.imageW) / this.imageH;

      // パーリンノイズでパーティクルの移動座標を決める。
      // パーリンノイズだと連続性が生まれるので、波打つ表現になる。
      // 乗算は周期と考えてもらえばOK。
      const px = this.noise(nx * 4, ny * 3);
      const py = this.noise(nx * 3, ny * 2);

      // 水平方向に遅延させるけど、ちょっとばらしている。
      const baseDelay = (dot.offsetIndex % this.imageW) * 0.001 + Math.random() * 0.2;
      const perlinAmpX = 1500 * (nx * 2 + 1);
      const perlinAmpY = 500 * (nx * 2 + 1);
      const randomAmp = 10 * (nx * 2 + 1);
      tl.from(
        dot,
        {
          x: "-=" + (perlinAmpX * px + randomAmp * (Math.random() - 0.5)),
          y: "-=" + (perlinAmpY * py + randomAmp * (Math.random() - 0.5)),
          alpha: 0,
          duration: 2,
          ease: "expo.inOut",
        },
        baseDelay
      ).to(
        dot,
        {
          x: "+=" + (perlinAmpX * px + randomAmp * (Math.random() - 0.5)),
          y: "+=" + (perlinAmpY * py + randomAmp * (Math.random() - 0.5)),
          alpha: 0,
          duration: 2.5,
          ease: "expo.out",
        },
        ">2"
      );
    });
    tl.add(() => {}, "+=0.3");
  }

  private setupPosition() {
    // コンテナを画面中央に設定する
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    // コンテナを画面中央に設定する
    this.container.pivot.x = this.container.width / 2;
    this.container.pivot.y = this.container.height / 2;
  }
}

export const FristView: FC = () => {
  const rootDom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    new FristViewCanvas(rootDom.current, imgAbout.src).setup();
  });
  return <div className="mainCanvasWrap" ref={rootDom}></div>;
};
