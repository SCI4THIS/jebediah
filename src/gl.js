var gl;
var canvas_id;

let resize = function ()
{
  let el = document.getElementById(canvas_id);
  el.width = window.innerWidth;
  el.height = window.innerHeight;
  gl.viewport(0,0,el.width,el.height);
  display();
}

let display = function()
{
  gl.clearColor(0.5, 0.5, 0.5, 0);
  gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT);
}

let init_gl = function(id)
{
  canvas_id   = id;
  let options = { alpha: false };
  let el      = document.getElementById(id);
  try { gl = el.getContext("webgl", options) } catch (e) { }
  try { gl = gl || canvas.getContext("experimental-webgl", options); } catch(e) { }
  if (gl == null) {
    console.log("couldn't create GL instance");
    return;
  }
  window.onresize = resize;
  resize();
}

module.exports.gl      = gl;
module.exports.init_gl = init_gl;
module.exports.display = display;
