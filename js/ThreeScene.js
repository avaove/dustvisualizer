import "./../styles.css";
import { WebGLRenderer, PerspectiveCamera, Scene, Clock } from "three";

let mouseX = 0,
  mouseY = 0;
const fov = 14;
const width = 0.3;

let windowWidth, windowHeight;

function scale(number, inMin, inMax, outMin, outMax) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function spherical2cart(r, theta, phi) {
  const x = r * Math.sin(theta) * Math.cos(phi);
  const y = r * Math.sin(theta) * Math.sin(phi);
  const z = r * Math.cos(theta);
  const pos = [x, y, z];
  return pos;
}

function makeView(left, bottom, height, eye, up) {
  let view = {};
  view.left = left;
  view.bottom = bottom;
  view.width = width;
  view.height = height;
  view.eye = eye;
  view.up = up;
  view.fov = fov;
  view.updateCamera = function (camera, scene, mouseX, mouseY) {
    const pos = spherical2cart(
      110,
      scale(mouseX, -windowWidth / 2, windowWidth / 2, 0, Math.PI * 3),
      scale(mouseY, -windowHeight / 2, windowHeight / 2, 0, Math.PI * 3)
    );
    camera.position.x = pos[0]; //mouseY * 0.05;
    camera.position.y = pos[1]; //
    camera.position.z = pos[2]; //
    camera.lookAt(scene.position);
  };
  return view;
}
// mouseX is theta
// mouseY is phi

const views = [
  makeView(1 / 2 - width, 0, 1.0, [0, 15, 0], [1, 0, 0]),
  makeView(1 / 2, 0, 1.0, [0, 30, 0], [1, 0, 0]),
];

export class BasicThreeDemo {
  constructor(container) {
    this.container = container;
    this.renderer = new WebGLRenderer({
      antialias: true,
      stencil: false,
    });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
    this.renderer.setPixelRatio(Math.max(1.5, window.devicePixelRatio));

    container.append(this.renderer.domElement);

    // adding cameras for each view
    for (let ii = 0; ii < views.length; ++ii) {
      const view = views[ii];
      const camera = new PerspectiveCamera(
        view.fov,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.fromArray(view.eye);
      camera.up.fromArray(view.up);
      view.camera = camera;
    }
    this.scene = new Scene();

    this.clock = new Clock();
    this.assets = {};
    this.disposed = false;
    this.tick = this.tick.bind(this);
    this.init = this.init.bind(this);
    this.setSize = this.setSize.bind(this);
  }
  onDocumentMouseMove(event) {
    if (!this.moveOn) {
      // FIXME fix the orientation of sphere
      // FIXME  arrow switches between views
      // FIXME bring in predicted data
      mouseX = event.clientX - windowWidth / 2;
      mouseY = event.clientY - windowHeight / 2;
    }
  }

  onClickEvent(e) {
    console.log("hellow");
  }

  // todo: when clicked rotate, when clicked again do not rotate
  init() {
    // document.addEventListener("mousemove", this.onDocumentMouseMove); // TODO
    document.addEventListener("click", this.onClickEvent); // TODO
    this.tick();
  }
  setSize(width, height, updateStyle) {
    this.renderer.setSize(width, height, false);
  }
  onResize() {}
  dispose() {
    this.disposed = true;
  }

  updateSize() {
    if (
      windowWidth != window.innerWidth ||
      windowHeight != window.innerHeight
    ) {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;

      this.renderer.setSize(windowWidth, windowHeight);
    }
  }

  render() {
    this.updateSize();
    // todo: render with all cameras
    for (let ii = 0; ii < views.length; ++ii) {
      const view = views[ii];
      const camera = view.camera;

      view.updateCamera(camera, this.scene, mouseX, mouseY);

      const left = Math.floor(windowWidth * view.left);
      const bottom = Math.floor(windowHeight * view.bottom);
      const width = Math.floor(windowWidth * view.width);
      const height = Math.floor(windowHeight * view.height);

      this.renderer.setViewport(left, bottom, width, height);
      this.renderer.setScissor(left, bottom, width, height);
      this.renderer.setScissorTest(true);
      //   this.renderer.setClearColor(view.background);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      this.renderer.render(this.scene, camera);
    }
  }
  tick() {
    if (this.disposed) return;
    // this.stats.begin();
    // this.update();
    this.render();
    this.stats.end();
    requestAnimationFrame(this.tick);
  }
}

// todo https://jsfiddle.net/n6u6asza/1205/
