window.decomp = decomp = require('poly-decomp');

require('./pathseg');

const $ = require('jquery');
const d3 = require('d3');
const Matter = require('matter-js');
const yo = require('yo-yo');
const _ = require('lodash');
const Key = require('keyboard-shortcut');

window.d3 = d3;
window.yo = yo;
window.Matter = Matter;
window._ = _;
window.$ = $;
window.Key = Key;

const loadSvg = () => {
  xhr = new XMLHttpRequest();
  xhr.open("GET","/dropbot.svg",false);
  // Following line is just to be on the safe side;
  // not needed if your server delivers SVG with correct MIME type
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");

  let documentElement = xhr.responseXML.documentElement;
  return documentElement;
}

const Init = (element) => {

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Body = Matter.Body,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Svg = Matter.Svg,
        Vertices = Matter.Vertices;

    // create an engine
    var engine = Engine.create();

    // create a renderer
    var render = Render.create({
        element: element,
        engine: engine,
        options: {
          wireframes: false
        }
    });

    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
    var vertexSets = [],
        color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

    let svg = loadSvg();

    let parts = _.map(svg.querySelectorAll("path"), (path,i) => {
      const vertices = Svg.pathToVertices(path, 30);
      return Body.create({
          position: Vertices.centre(vertices),
          vertices: vertices,
          isStatic: true,
          render: {
            fillStyle: "red"
          }
      });
    });

    let body = Body.create({parts, isStatic: true});

    World.add(engine.world, body);

    // run the engine
    Engine.run(engine);

    // run the renderer
    Render.run(render);

    // Scale Model to match canvas dimension
    let sx = _.get(render, 'bounds.max.x') / _.get(body, 'bounds.max.x');
    let sy = _.get(render, 'bounds.max.y') / _.get(body, 'bounds.max.y');
    Body.scale(body, sx, sy);

    // Translate model to center of canvas
    let getCenter = (b) => {
      let x = (_.get(b, 'max.x') - _.get(b, 'min.x'))/2 + _.get(b, 'min.x');
      let y = (_.get(b, 'max.y') - _.get(b, 'min.y'))/2 + _.get(b, 'min.y');
      return {x, y};
    };

    let center1 = getCenter(render.bounds);
    let center2 = getCenter(body.bounds);
    Body.translate(body, {x: center1.x - center2.x, y: center1.y - center2.y});

    render.canvas.style.width = "100%";
    render.canvas.style.height = "100%";
    render.canvas.style.background = "none";
}

module.exports = Init;
