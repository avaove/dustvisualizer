import {
  BoxBufferGeometry,
  ShaderMaterial,
  Mesh,
  Uniform,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
} from "three";
// import random from "random";
// import positions from "./data/positions";
// import logdust from "./data/reddening";
// import reddening from "./data/logdust.txt";
// import positions2 from "./data/positions.txt";
import colormap from "colormap";
import * as fs from "fs";

function spherical2cart(r, theta, phi) {
  const x = r * Math.sin(theta) * Math.cos(phi);
  const y = r * Math.sin(theta) * Math.sin(phi);
  const z = r * Math.cos(theta);
  const pos = [x, y, z];
  return pos;
}

let fragmentShader = `
varying vec3 vColor;

  void main(){
    vec3 color = vColor;
    gl_FragColor = vec4(color, 1.);
  }
`;

let vertexShader = `
#define PI 3.14159265359
uniform float uScale;
attribute vec4 aCurve;

attribute vec3 aColor;
varying vec3 vColor;
  vec3 getCurvePosition(float progress, float radius, float offset){

    vec3 pos = vec3(0.);

    pos.x += progress; //cos(progress *PI *8.) * radius ;
    pos.y += radius; //sin(progress *PI *8. ) * radius + sin(progress * PI *2.) * 30.;

    pos.z += offset; //progress *200. - 200./2. + offset;
    return pos;
  }
  void main(){
    vec3 transformed = position.xyz;

    // 2. Extract values from attribute
    //float aSpeed = aCurve.w;
    float aRadius = aCurve.x;
    float aZOffset = aCurve.z;
    float aProgress = aCurve.y;

    // 3. Get position and add it to the final position
    vec3 curvePosition = getCurvePosition(aProgress, aRadius, aZOffset);
    //transformed *= aProgress; //1.- abs(aProgress - 0.5) *2.;
    transformed *= 0.25;
    transformed += curvePosition;

    gl_Position = projectionMatrix* modelViewMatrix * vec4(transformed, 1.);

    vColor = aColor;
  }
`;

// path to files like true_logdust, predicted_logdust, predicted_A -> single column
// create a mapper that maps true, logdust to a certain array

let logdust = fs
  .readFileSync("./js/data/true_logdust.txt", { encoding: "utf-8" })
  .split("\n");
logdust = logdust.map(function (x) {
  return parseFloat(x);
});
console.log("LOGDUST LOADED HERE", logdust.length, logdust[0]);

let pred_A = fs
  .readFileSync("./js/data/pred_A.txt", { encoding: "utf-8" })
  .split("\n");
pred_A = pred_A.map(function (x) {
  return parseFloat(x);
});

// test
// pred_A = dataLoader("./src/data/pred_A.txt");

const maxdust = 1.5; //Math.max.apply(Math, logdust); // 3.0; //Math.max(logdust); //2.7400595230247995;
const mindust = -1.5; //Math.min.apply(Math, logdust); //Math.min(logdust);
const maxA = 3.5; //Math.max.apply(Math, pred_A);
const minA = -0.5; // Math.min.apply(Math, pred_A);

console.log(pred_A.length, pred_A[1]);

// console.log(logdust.length);

let positionsUnformatted = fs
  .readFileSync("./js/data/xgrid.txt", { encoding: "utf-8" })
  .split("\n");
let positions = [];
positionsUnformatted.forEach(function (item, i) {
  let pos = item.split(",");
  positions.push(
    pos.map(function (x) {
      return parseFloat(x);
    })
  );
});
console.log("here 2", positions[10]);
console.log("hereee", logdust[10]);

function radialDistance(x, y, z) {
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

// var positions = positionsUnformatted.map(function (x) {
//   let singlpos = [];
//   x.split(",").map(function (x) {
//     singlpos.push(parseFloat(x));
//   });
//   console.log(singlpos);
//   return parseFloat(singlpos);
// });
// console.log(positions.length, positions);

let plasmaColors = colormap({
  colormap: "plasma",
  nshades: 60,
  format: "rba",
  alpha: 1,
});

function normalize(val, min, max) {
  //   console.log((val - min) / (max - min));
  return (val - min) / (max - min);
}

let baseCube = new BoxBufferGeometry(1, 1, 1);

export class Spheres extends Mesh {
  constructor(config, posOffset) {
    super();
    this.config = config;
    this.posOffset = posOffset;
    this.uniforms = {
      uScale: new Uniform(config.scale),
    };
    let material = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: this.uniforms,
    });
    this.material = material;
  }
  init(options) {
    let instancedGeometry = new InstancedBufferGeometry().copy(baseCube);

    this.uniforms.uScale.value = this.config.scale;
    let aCurve = [];
    let aColor = [];

    // TODO NEXT only push what's necessary to aCurve
    // TODO NEXT based on r from dat.gui only add ones that are within bound
    for (let i = 0; i < positions.length; i++) {
      let radius = positions[i][0]; //random.float(30, 40);
      let progress = positions[i][1]; //random.float();
      let offset = positions[i][2]; // random.float(-5, 5);
      let radialDist = radialDistance(radius, progress, offset);
      //   console.log(radialDist);
      if (radialDist < options.radialDistance) {
        // console.log(radialDist, radius, progress, offset);
        aCurve.push(radius);
        aCurve.push(progress);
        aCurve.push(offset);
        // aCurve.push(0); // todo: try to fix this??

        var colorInd;
        switch (options.colorMaps) {
          case "integrated dust":
            colorInd = Math.floor(
              normalize(pred_A[i], minA, maxA) * plasmaColors.length
            );
            break;
          case "non integrated dust":
            colorInd = Math.floor(
              normalize(logdust[i], mindust, maxdust) * plasmaColors.length
            );
            break;
          case "sigma":
            colorInd = Math.floor(
              normalize(pred_A[i], minA, maxA) * plasmaColors.length
            );
            break;
        }
        // var colorInd = Math.floor(
        //   normalize(pred_A[i], mindust, maxdust) * plasmaColors.length
        // );
        if (colorInd >= plasmaColors.length) {
          colorInd = plasmaColors.length - 1;
        }
        let vx, vy, vz;
        if (plasmaColors[colorInd] !== undefined) {
          vx = normalize(plasmaColors[colorInd][0], 0, 255);
          vy = normalize(plasmaColors[colorInd][1], 0, 255);
          vz = normalize(plasmaColors[colorInd][2], 0, 255);
        }

        //   let color = this.colors[Math.floor(Math.random() * this.colors.length)];
        aColor.push(vx, vy, vz);
      }
    }

    instancedGeometry.addAttribute(
      "aCurve",
      new InstancedBufferAttribute(new Float32Array(aCurve), 3, false)
    );
    instancedGeometry.addAttribute(
      "aColor",
      new InstancedBufferAttribute(new Float32Array(aColor), 3, false)
    );
    instancedGeometry.maxInstancedCount = 20127;

    this.geometry = instancedGeometry;
  }
  clean() {
    this.geometry.dispose();
  }
  dispose() {
    this.geometry.dispose();
    baseGeometry.dispose();
    this.material.dispose();
  }
}
