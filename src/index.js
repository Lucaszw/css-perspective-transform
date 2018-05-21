window.decomp = decomp = require('poly-decomp');

require('./pathseg');

const $ = require('jquery');
const d3 = require('d3');
const yo = require('yo-yo');
const _ = require('lodash');
const Key = require('keyboard-shortcut');
const vkeys = require('vkeys');

window.d3 = d3;
window.yo = yo;
window._ = _;
window.$ = $;
window.Key = Key;
window.vkeys = vkeys;


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

const Init = (element) => {
    let svg = loadSvg();
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    _.each(svg.querySelectorAll("[data-channels]"), (path) => {
      // path.__defineGetter__("active",function() {
      //   return this._active == true
      // });
      // path.__defineSetter__("active",function(_active) {
      //   this._active = _active;
      //   if (_active == true) this.style.fill = GREEN;
      //   if (_active != true) this.style.fill = BLUE;
      // });

      Object.defineProperty(path, 'active', {
        get: function() {return this._active == true},
        set: function(_active) {
          this._active = _active;
          if (_active == true) this.style.fill = GREEN;
          if (_active != true) this.style.fill = BLUE;
        }
      });

      path.addEventListener("click", (e) => {
        let active = path.active;
        console.log({active});
        path.active = !path.active;

        console.log({fill: path.style.fill})
        console.log(path.style.fill == BLUE, path.style.fill, BLUE);
      });
    });

    element.innerHTML = '';
    element.appendChild(svg);

    // svg.setAttrib
    // svg.style.width = "100%";
    // svg.style.height = "100%";

    // svg.addEventListener("click", (e) => {
    //   console.log("Svg element clicked!");
    //   console.log({e});
    // })
}

module.exports = Init;
