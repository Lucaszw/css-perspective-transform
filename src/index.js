window.decomp = decomp = require('poly-decomp');

require('./pathseg');

const $ = require('jquery');
const d3 = require('d3');
const yo = require('yo-yo');
const _ = require('lodash');
const Key = require('keyboard-shortcut');
const vkeys = require('vkeys');
const {toPoints} = require('svg-points');
const svgIntersections = require('svg-intersections');

window.d3 = d3;
window.yo = yo;
window._ = _;
window.$ = $;
window.Key = Key;
window.vkeys = vkeys;
window.toPoints = toPoints;
window.svgIntersections = svgIntersections;

let shiftDown;
document.addEventListener("keydown", (e) => {
  if (e.key == "Shift") shiftDown = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key == "Shift") shiftDown = false;
});

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

const GREEN = "rgb(0,255,0)";
const BLUE = "rgb(0,0,255)";
const RED = "rgb(255,0,0)";
const DISTANCE = 10000;

const Init = (element) => {
    let svg = loadSvg();
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    let paths = svg.querySelectorAll("[data-channels]");

    const Ray = (x1,y1,x2,y2) => {
      return svgIntersections.shape("line", { x1, y1, x2, y2 });
    }

    const castRay = (ray) => {
      let collisions = [];
      _.each(paths, (p) => {p.active = false});
      _.each(paths, (path) => {
        let shape = path.svgIntersections;
        var intersection = svgIntersections.intersect(ray,shape);
        if (intersection.points.length > 0) {
          collisions.push({path, intersection});
        }
      });
      return collisions;
    };

    document.addEventListener("keyup", (e) => {
      let path = _.find(paths, "selected");
      let bbox = path.getBBox();
      let x1,y1,x2,y2;

      if (e.code == "ArrowUp") {
        x1 = bbox.x + bbox.width/2;
        y1 = bbox.y + bbox.height/2;
        x2 = bbox.x + bbox.width/2;
        y2 = y1 - DISTANCE;
      }

      if (e.code == "ArrowDown") {
        x1 = bbox.x + bbox.width/2;
        y1 = bbox.y + bbox.height/2;
        x2 = bbox.x + bbox.width/2;
        y2 = y1 + DISTANCE;
      }

      if (e.code == "ArrowLeft") {
        x1 = bbox.x + bbox.width/2;
        y1 = bbox.y + bbox.height/2;
        x2 = x1 - DISTANCE;
        y2 = bbox.y + bbox.height/2;
      }

      if (e.code == "ArrowRight") {
        x1 = bbox.x + bbox.width/2;
        y1 = bbox.y + bbox.height/2;
        x2 = x1 + DISTANCE;
        y2 = bbox.y + bbox.height/2;
      }

      let ray = Ray(x1,y1,x2,y2);
      let collisions = castRay(ray);

      _.map(collisions, (collision) => {
        collision.path.style.fill = "purple";
      });

    });

    _.each(paths, (path) => {

      // svgIntersections.shape("path", {d: temp1.path.getAttribute("d")})
      const d = path.getAttribute("d");
      path.svgIntersections = svgIntersections.shape("path", {d});

      Object.defineProperty(path, 'active', {
        get: function() {return this._active == true},
        set: function(_active) {
          this._active = _active;
          if (_active == true) this.style.fill = GREEN;
          if (_active != true) this.style.fill = BLUE;
        }
      });

      Object.defineProperty(path, 'selected', {
        get: function() {return this._selected == true},
        set: function(_selected) {
          // Unselect all other paths:
          _.each(paths, (p) => {
            p._selected = false;
            p.style.stroke = "";
          });

          this._selected = _selected;
          if (_selected == true) this.style.stroke = RED;
        }
      });

      path.addEventListener("click", (e) => {
        let active = path.active;
        path.active = !path.active;
        if (shiftDown == true) path.selected = true;
      });

    });

    element.innerHTML = '';
    element.appendChild(svg);
}

module.exports = Init;
