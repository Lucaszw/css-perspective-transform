window.decomp = decomp = require('poly-decomp');

require('./pathseg');

const $ = require('jquery');
const d3 = require('d3');
const Matter = require('matter-js');
const yo = require('yo-yo');
const _ = require('lodash');
const Key = require('keyboard-shortcut');
const vkeys = require('vkeys');

window.d3 = d3;
window.yo = yo;
window.Matter = Matter;
window._ = _;
window.$ = $;
window.Key = Key;
window.vkeys = vkeys;

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Svg = Matter.Svg,
    Vertices = Matter.Vertices,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events,
    Vector = Matter.Vector,
    Query = Matter.Query;


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
      const mean = Vertices.mean(vertices);
      const center = Vertices.centre(vertices);
      return Body.create({
          position: Vertices.centre(vertices),
          vertices: vertices,
          isStatic: true,
          render: {
            fillStyle: "rgb(16, 159, 179)",
            strokeStyle: "black",
            lineWidth: 1
          },
          label: `fluxel${i}`
      });
    });
    console.log({parts});

    let body = Body.create({parts, isStatic: true});

    var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
       mouse: mouse,
       constraint: {
           angularStiffness: 0,
           render: {
               visible: false
           }
       }
    });

    World.add(engine.world, body);

    document.addEventListener("mousedown", (e) => {
      inverse = prevTransform.transformInverse(e.pageX, e.pageY);
      x = inverse[0];
      y = inverse[1];
      console.log({x, y});
    });


    element.addEventListener("mousedown", (e) => {
      let elementBox = element.getBoundingClientRect();
      let renderSize = render.options;

      // console.log({e});
      // let x = (e.clientX/elementBox.width)*renderSize.width;
      // let y = (e.clientY/elementBox.height)*renderSize.height;

      let x = (e.offsetX/elementBox.width)*renderSize.width;
      let y = (e.offsetY/elementBox.height)*renderSize.height;

      if (prevTransform) {
        // inverse = prevTransform.transformInverse(e.pageX, e.pageY);
        // x = inverse[0];
        // y = inverse[1];
        // console.log({inverse});
      }

      // Transform to original coordinates

      // console.log({x,y});

      _.each(parts, (part, i) => {
        if (!_.includes(part.label , "fluxel")) return;
        let b = part.bounds;
        if( b.min.x <= x && x <= b.max.x && b.min.y <= y && y <= b.max.y ) {
          // Body.set(part, "render.fillStyle", "rgb(0, 0, 255)");
          part.render.fillStyle = "rgb(0, 0, 255)";
          // console.log(part.label);
        }
      });
    });

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
