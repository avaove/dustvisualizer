import { App } from "./App.js";
// import debounce from "debounce";

// const App = require("./App.js");

let config = {
  // instances per thingy
  nInstances: 1000,
  useCube: true,
  scale: 1,
};

// 27,000 60fps
// 58,000 30fps
// also consider that the spheres have a lot fo vertices
const container = document.getElementById("app");
const myApp = new App(container, config); // todo add the positions of the LOS (theta, r), radial distance to the App constructor
myApp.init();

// FIXME NOW
// todo: change config so that the data displayed can change between variable sigma, A and constant sigma
// todo add labels and colorbars
// todo fix the rotation phi and theta
// todo fix the los phi and theta

// let less = document.getElementById("less");
// let more = document.getElementById("more");
// let evenLess = document.getElementById("even-less");
// let evenMore = document.getElementById("even-more");
// let countEle = document.getElementById("count");
// let switchEle = document.getElementById("switch");

// let restart = debounce(myApp.restart, 400);

// countEle.innerText = config.nInstances * 2;
// let addInstances = (count) => {
//   config.nInstances += count;
//   console.log("adding...");
//   config.nInstances = Math.max(500, config.nInstances);
//   countEle.innerText = config.nInstances * 2;
//   let scale = 1 - Math.min(1, (config.nInstances - 500) / 50000) * 0.8;
//   config.scale = scale;
//   restart();
// };
// let handleLess = () => {
//   addInstances(-500);
// };

// let handleEvenLess = () => {
//   addInstances(-2000);
// };
// let handleMore = () => {
//   addInstances(500);
// };
// let handleEvenMore = () => {
//   addInstances(2000);
// };

// let handleSwitch = () => {
//   config.useCube = !config.useCube;
//   if (config.useCube) {
//     switchEle.innerText = "Use Spheres";
//   } else {
//     switchEle.innerText = "Use Cubes";
//   }
//   restart();
// };
// switchEle.addEventListener("click", handleSwitch);

// less.addEventListener("click", handleLess);
// more.addEventListener("click", handleMore);
// evenLess.addEventListener("click", handleEvenLess);
// evenMore.addEventListener("click", handleEvenMore);
// if (module && module.hot) {
//   // module.hot.accept((a, b) => {
//   //   // For some reason having this function here makes dat gui work correctly
//   //   // when using hot module replacement
//   // });
//   module.hot.dispose(() => {
//     less.removeEventListener("click", handleLess);
//     more.removeEventListener("click", handleMore);
//     evenLess.removeEventListener("click", handleEvenLess);
//     evenMore.removeEventListener("click", handleEvenMore);
//     switchEle.removeEventListener("click", handleSwitch);
//     if (myApp) myApp.dispose();
//   });
// }
