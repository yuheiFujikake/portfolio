export default class WebGLController {
  constructor() {
    this.canvasName = "#js-webgl";
  }

  init() {
    // サイズを指定
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector(this.canvasName),
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(0, 0, +1000);

    // メッシュを作成
    const box = this.creatMesh(scene);
    scene.add(box);

    // lightの設定
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    scene.fog = new THREE.Fog(0x000000, 50, 2000);


    this.animation(box, scene, camera, renderer)
    this.resize(camera, renderer);
  }

  creatMesh(scene) {
    const line = 10;
    const size = 30;
    const margin = 15;
    const start = size + margin;
    const center = (size * line + margin * (line - 1)) / 2;

    const boxSize = {
      x: line,
      y: line,
      z: line,
    };

    const position = {
      x: 0,
      y: 0,
      z: 0,
    };

    var geometry = new THREE.Geometry();
    var meshItem = new THREE.Mesh(new THREE.CubeGeometry(size, size, size, 1, 1, 1));

    const total = boxSize.x * boxSize.y * boxSize.z;
    for (let i = 0; i < total; i++) {
      let x = position.x * start - center;
      let y = position.y * start - center;
      let z = position.z * start - center;
      meshItem.position.set(x, y, z);
      THREE.GeometryUtils.merge(geometry, meshItem);
      position.x++;
      if (position.x >= boxSize.x) {
        position.x = 0;
        position.y++;
        if (position.y >= boxSize.y) {
          position.y = 0;
          position.z++;
          if (position.z >= boxSize.z) {
            position.z = 0;
          }
        }
      }
    }
    var material = new THREE.MeshBasicMaterial({color: "0xdcdcdc"});
    return new THREE.Mesh(geometry, material);
  }

  animation(box, scene, camera, renderer) {
    box.rotation.y += 0.01;
    box.rotation.x -= 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(()=> {
      this.animation(box, scene, camera, renderer)
    });
  }

  resize(camera, renderer) {
    $(window).on('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  }
}
