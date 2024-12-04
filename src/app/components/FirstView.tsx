"use client";
import { FC, useEffect } from "react";
import { gsap } from "gsap";
import { createNoise2D } from "simplex-noise";
import alea from "alea";
import * as PIXI from "pixi.js";
import imgAbout from "../../../public/About.png";
/**
 * パーティクルクラス。
 * scaleXとscaleYを制御したいためだけに用意したクラスです。
 */
class Dot extends PIXI.Sprite {
  constructor(texture: PIXI.Texture<PIXI.TextureSource>) {
    super(texture);
  }
  get scaleX() {
    return this.scale.x;
  }
  set scaleX(value) {
    this.scale.x = value;
  }
  get scaleY() {
    return this.scale.y;
  }
  set scaleY(value) {
    this.scale.y = value;
  }
  offsetIndex = -1;
}

export const FristView: FC = () => {
  let app: PIXI.Application, container: PIXI.Container;
  const dots: Dot[] = [];

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (app) return;
    // PIXIのアプリケーションを作成する
    app = new PIXI.Application();
    await app.init({
      antialias: true,
      resizeTo: window,
      backgroundColor: 0x000000,
      resolution: devicePixelRatio,
    });
    document.body.appendChild(app.canvas);

    // コンテナの作成
    container = new PIXI.Container();
    app.stage.addChild(container);
    await spriteSetUp();
    // リサイズ処理
    window.addEventListener("resize", resize);
    resize();
  };

  // 画像を表示
  const spriteSetUp = async () => {
    // 画像を読み込む
    const prng = alea("seed");
    const noise2D = createNoise2D(prng);
    const image = new Image();
    image.src = imgAbout.src;
    await image.decode();
    const DOT_SIZE = 2;
    const imageW = image.width;
    const imageH = image.height;
    const lengthW = imageW / DOT_SIZE;
    const lengthH = imageH / DOT_SIZE;
    const texture = PIXI.Texture.from(image);

    const canvas = document.createElement("canvas");
    if (!canvas) throw new Error("canvas要素の取得に失敗しました");
    canvas.width = imageW;
    canvas.height = imageH;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("context取得失敗");
    context.drawImage(image, 0, 0);

    // ----------------------------------------------
    // パーティクルの生成
    // ----------------------------------------------
    const boxRange = lengthW * lengthH;
    for (let i = 0; i < boxRange; i++) {
      const x = (i % lengthW) * DOT_SIZE;
      const y = Math.floor(i / lengthW) * DOT_SIZE;

      const dotData = context.getImageData(x + Math.floor(DOT_SIZE / 2), y + Math.floor(DOT_SIZE / 2), 1, 1);
      // 透過チャンネルを取得
      const alpha = dotData.data[3];
      // 透明だったらスプライトは作らないようにする
      if (alpha === 0) continue;
      const texture2 = new PIXI.Texture({
        source: texture._source,
        frame: new PIXI.Rectangle(x, y, DOT_SIZE, DOT_SIZE),
      });

      const dot = new Dot(texture2);
      dot.anchor.set(0.5);
      dot.x = x - imageW / 2;
      dot.y = y - imageH / 2;
      dot.offsetIndex = i;
      container.addChild(dot);
      dots.push(dot);
    }
    // ----------------------------------------------
    // モーションの実装
    // ----------------------------------------------
    // GSAPのタイムラインを作成（各トゥイーンを集約管理するため）
    const tl = gsap.timeline({
      repeat: -1,
    });

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      const index = dot.offsetIndex;

      const nx = (index % lengthW) / lengthW;
      const ny = Math.floor(index / lengthW) / lengthH;
      // 乗算は周期と考えてもらえばOK。
      const px = noise2D(nx * 4, ny * 3);
      const py = noise2D(nx * 3, ny * 2);

      // 水平方向に遅延させるけど、ちょっとばらしている。
      const baseDelay = (dot.offsetIndex % lengthW) * 0.001 + Math.random() * 0.2;

      const perlinAmpX = 1500 * (nx * 2 + 1);
      const perlinAmpY = 500 * (nx * 2 + 1);
      const randomAmp = 10 * (nx * 2 + 1);

      const scale = nx * 3 + 1;

      tl.from(
        dot,
        {
          x: "-=" + (perlinAmpX * px + randomAmp * (Math.random() - 0.5)),
          y: "-=" + (perlinAmpY * py + randomAmp * (Math.random() - 0.5)),
          alpha: 0,
          scaleX: scale,
          scaleY: scale,
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
          scaleX: scale,
          scaleY: scale,
          duration: 2.5,
          ease: "expo.out",
        },
        ">2"
      );
    }

    tl.fromTo(container.scale, { x: 0.4, y: 0.4 }, { x: 0.5, y: 0.5, duration: 5, ease: "none" }, 0);
  };

  // リサイズ処理
  const resize = () => {
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
  };

  return <></>;
};
