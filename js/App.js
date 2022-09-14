import "./../styles.css";
import {
  LineBasicMaterial,
  Vector3,
  BufferGeometry,
  Line,
  ConeGeometry,
  Mesh,
  MeshBasicMaterial,
  AxesHelper,
  Color,
} from "three";
import { BasicThreeDemo } from "./ThreeScene";
import { Spheres } from "./spheres";
// import { LineOfSight } from "./LineOfSight";
import Stats from "stats.js";
import { GUI } from "dat.gui";

// TODO NEXT
// json object of x,y,z and their reddenings/residual for each plot seperatel - can easily get r
// load the all the jsons only once when app loaded and create a 3D object for everything
// restart the app if the r in dat.gui is updated display them if they are within the range r
// do this for a single map for now

// TODO NEXT
// sort the x,y,z positions so they range from smallest r to biggest r
// sort the reddening/sigma/residual values the same order
// normalize r range between 0 and 1 - remmeber to take into account the fact that they are cubes not spheres
// display only portion of the array like half if r is 0.5

// TODO NEXT store the results as consts here
// TODO NEXT laod the arrays in the App constro

// TODO

const coneAng = 0.349066;

let options = {
  theta: 0,
  phi: 0,
  radialDistance: 3.0,
  focusOnLOS: true,
  colorMaps: "integrated dust",
};

function spherical2cart(r, theta, phi) {
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  const pos = [x, y, z];
  console.log(pos);
  return pos;
}

function getLineOfSightImgTitle(r, x, y, z) {
  const ret =
    "./data/losPlots/" +
    (x / r).toFixed(2) +
    "i_" +
    (y / r).toFixed(2) +
    "j_" +
    (z / r).toFixed(2) +
    "k.png";

  console.log(ret);
  return ret; ///0.87i_0.00j_0.50k.849a139b.pn
}

export class App extends BasicThreeDemo {
  constructor(container, config) {
    super(container);
    this.config = config;
    // this.camera.position.z = 50;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.text = new Text(this);
    this.topSpheres = new Spheres(config, -50);

    this.bottomSpheres = new Spheres(config, 50);
    this.leftSpheres = new Spheres(config, 0);
    // this.los = new LineOfSight(100, options.theta, options.phi);
    // NEW LOS
    this.losMaterial = new LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 7,
    });
    this.points = [];
    this.points.push(new Vector3(0, 0, 0));
    this.points.push(new Vector3(100, 0, 0)); // initially add LOS over the x axis
    this.losGeometry = new BufferGeometry().setFromPoints(this.points);
    this.losLine = new Line(this.losGeometry, this.losMaterial);
    this.h = this.points[0].distanceTo(this.points[1]);
    this.g = new ConeGeometry(2, this.h);
    this.g.translate(0, this.h * 0.5, 0); // base to 0
    this.g.rotateX(Math.PI * 0.5); // align along Z-axis
    this.m = new MeshBasicMaterial({ opacity: 0.5 }); // or any other material
    this.o = new Mesh(this.g, this.m);
    this.o.position.copy(this.points[0]);
    this.o.lookAt(this.points[1]);
    // NEW LOS
    this.scene.background = new Color("black");

    this.restart = this.restart.bind(this);
    this.axesHelper = new AxesHelper(5);

    // setting up dat.gui
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
    this.gui = new GUI();

    // setting up gui
    // TODO: every 20 degrees -> 0.349066 radians
    this.gui.add(options, "radialDistance", 0, 5.0, 0.1).onChange((val) => {
      console.log("changing roughness", val);
      this.restart();
    });
    // NEW: theta range in rad (0, PI) changes every 2PI/10=PI/5 degrees
    // FIXME fix the range of phi and theta

    // TODO NOTE: x is green axis, blue is z I think?? so it's inverted
    this.gui
      .add(options, "theta", -Math.PI, Math.PI, coneAng)
      .onChange((val) => {
        console.log("changing theta", val);
        this.restart();
      });
    this.gui.add(options, "phi", 0, Math.PI, coneAng).onChange((val) => {
      console.log("changing phi", val);
      // todo: change the los image path -> call the image updater instead of restarting each time
      this.restart();
    });
    this.gui
      .add(options, "colorMaps", [
        "integrated dust",
        "non integrated dust",
        "sigma",
      ])
      .onChange((val) => {
        console.log("changing colormap", val);
        // todo: change the los image path -> call the image updater instead of restarting each time
        this.restart();
      });
  }
  restart() {
    this.topSpheres.clean();
    this.bottomSpheres.clean();
    // this.leftSpheres.clean();
    // this.losGeometry.dispose();
    this.scene.remove(this.losLine);
    this.scene.remove(this.o);
    // this.los.clean();
    this.topSpheres.init(options);
    this.bottomSpheres.init(options);
    this.leftSpheres.init(options);

    // NEW LOS init
    var cartPos = spherical2cart(10, options.theta, options.phi);
    this.points[1] = new Vector3(cartPos[0], cartPos[1], cartPos[2]);
    console.log(
      "THIS ONE",
      document.getElementById("los").src,
      getLineOfSightImgTitle(10, cartPos[0], cartPos[1], cartPos[2])
    );
    document.getElementById("los").src = getLineOfSightImgTitle(
      10,
      cartPos[0],
      cartPos[1],
      cartPos[2]
    );
    document.getElementById("los").alt = getLineOfSightImgTitle(
      10,
      cartPos[0],
      cartPos[1],
      cartPos[2]
    );

    // points.push(new Vector3(10, 0, 0));
    this.losGeometry = new BufferGeometry().setFromPoints(this.points);
    this.losLine = new Line(this.losGeometry, this.losMaterial);
    this.scene.add(this.losLine);
    this.h = this.points[0].distanceTo(this.points[1]) - 3;
    this.g = new ConeGeometry(1, this.h, 10, 10, true);
    this.g.translate(0, -this.h * 0.5, 0); // base to 0
    this.g.rotateX(-Math.PI * 0.5); // align along Z-axis
    this.m = new MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.6,
      transparent: true,
    }); // or any other material
    this.o = new Mesh(this.g, this.m);
    // TODO: figure out how to add outlines to the cone
    this.o.position.copy(this.points[0]);
    this.o.lookAt(this.points[1]);
    this.scene.add(this.o);
    // NEW LOS
  }
  dispose() {
    this.disposed = true;
    this.scene.dispose();
  }

  init() {
    // FIXME make sure that these multiple spheres instances are necessary
    this.topSpheres.init(options);
    this.bottomSpheres.init(options);
    // this.los.init(options);
    this.leftSpheres.init(options); // TODO this is sending the radial distance to the objects
    this.scene.add(this.bottomSpheres);
    this.scene.add(this.topSpheres);
    this.scene.add(this.leftSpheres);
    this.scene.add(this.axesHelper);
    console.log("ADDED LINE");
    // this.scene.add(this.losLine);

    // three js thinks object is outside the frustum
    this.bottomSpheres.frustumCulled = false;
    this.leftSpheres.frustumCulled = false;
    this.topSpheres.frustumCulled = false;

    this.stats.begin();
    this.tick();
    document.addEventListener("mousemove", this.onDocumentMouseMove); // TODO
  }
}
