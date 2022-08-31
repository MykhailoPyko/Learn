onepagescroll("div.pages");

function onepagescroll(selector, options) {
  var pages = [];
  var currentPage = 1;
  var isPageChanging = false;
  var keyUp = { 38: 1, 33: 1 };
  var keyDown = { 40: 1, 34: 1 };

  var def = {
    pageContainer: "section",
    animationType: "ease-in-out",
    animationTime: 1000,
    infinite: false,
    pagination: true,
    keyboard: true,
    direction: "vertical",
  };

  var setting = extend({}, def, options);

  /* initialization */
  function init() {
    window.addEventListener("wheel", onScrollEventHandler);

    css(document.querySelector(selector), {
      transition:
        "transform " + setting.animationTime + "ms " + setting.animationType,
    });

    //allow keyboard input
    if (setting.keyboard) {
      addEventListener("keydown", function (e) {
        if (keyUp[e.keyCode]) changePage(1, pages.length, -1);
        else if (keyDown[e.keyCode]) changePage(pages.length, 1, 1);
      });
    }

    document.querySelector(selector).classList.add("ops-container");

    detectTransitionEnd() &&
      document
        .querySelector(selector)
        .addEventListener(detectTransitionEnd(), function () {
          isPageChanging = false;
        });

    var bullet_list_container = null;
    /* create navigation bullets */
    if (setting.pagination) {
      bullet_list_container = document.createElement("ul");
      bullet_list_container.classList.add("ops-navigation");
    }

    var index = 1;
    [].forEach.call(
      document.querySelectorAll(selector + " > " + setting.pageContainer),
      function (obj) {
        if (setting.pagination) {
          var bullet_list = document.createElement("li");
          var bullet = document.createElement("a");
          bullet.setAttribute("data-targetindex", index);
          bullet.href = "#";
          bullet_list.appendChild(bullet);
          bullet_list_container.appendChild(bullet_list);
        }

        obj.classList.add("ops-page");

        if (setting.direction == "horizontal") {
          css(obj, {
            left: (index - 1) * 100 + "%",
            position: "absolute",
          });
        }

        pages.push(obj);
        obj.setAttribute("data-pageindex", index++);
      }
    );

    if (setting.pagination) {
      document.body.appendChild(bullet_list_container);
      document
        .querySelector('a[data-targetindex="' + currentPage + '"]')
        .classList.add("active");
    }
  }

  /* wheel event handler */
  function onScrollEventHandler(e) {
    if (e.wheelDelta > 0) changePage(1, pages.length, -1);
    else changePage(pages.length, 1, 1);
  }

  /* dected transitions completion for block duplicated scrolling */
  function detectTransitionEnd() {
    var t;
    var el = document.createElement("fakeelement");
    var transitions = {
      transition: "transitionend",
      OTransition: "oTransitionEnd",
      MozTransition: "transitionend",
      WebkitTransition: "webkitTransitionEnd",
    };

    for (t in transitions) if (el.style[t] !== undefined) return transitions[t];
    return true;
  }

  /* css setter */
  function css(obj, styles) {
    for (var _style in styles)
      if (obj.style[_style] !== undefined) obj.style[_style] = styles[_style];
  }

  /* extend function for user customization */
  function extend() {
    for (var i = 1; i < arguments.length; i++)
      for (var key in arguments[i])
        if (arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  }

  //function for page transition
  function changePage(compare, edge, increase) {
    if (isPageChanging) return;

    if (currentPage == compare) {
      if (setting.infinite) currentPage = edge;
      else return;
    } else {
      currentPage += increase;
    }

    if (setting.animationTime) isPageChanging = true;

    if (setting.pagination) {
      document
        .querySelector("a.active[data-targetindex]")
        .classList.remove("active");
      document
        .querySelector('a[data-targetindex="' + currentPage + '"]')
        .classList.add("active");
    }
    if (setting.direction == "vertical") {
      css(document.querySelector(selector), {
        transform: "translate3d(0," + -(currentPage - 1) * 100 + "%,0)",
      });
    } else if (setting.direction == "horizontal") {
      css(document.querySelector(selector), {
        transform: "translate3d(" + -(currentPage - 1) * 100 + "%,0,0)",
      });
    }
  }

  /* swipe */
  var fpos = 0;
  var lpos = 0;
  var _n = 90;

  //bind touch
  document.addEventListener("touchstart", function (e) {
    e.preventDefault();
    if (
      e.type == "touchstart" ||
      e.type == "touchmove" ||
      e.type == "touchend" ||
      e.type == "touchcancel"
    ) {
      var touch = e.touches[0] || e.changedTouches[0];
      if (setting.direction == "vertical") fpos = touch.pageY;
      else if (setting.direction == "horizontal") fpos = touch.pageX;
    }
  });

  document.addEventListener("touchend", function (e) {
    e.preventDefault();

    if (
      e.type == "touchstart" ||
      e.type == "touchmove" ||
      e.type == "touchend" ||
      e.type == "touchcancel"
    ) {
      var touch = e.touches[0] || e.changedTouches[0];
      if (setting.direction == "vertical") lpos = touch.pageY;
      else if (setting.direction == "horizontal") lpos = touch.pageX;
    }
    if (fpos + _n < lpos) changePage(1, pages.length, -1);
    else if (fpos > lpos + _n) changePage(pages.length, 1, 1);
  });

  /* check documents ready statement and do init() */
  if (document.readyState === "complete") init();
  else window.addEventListener("onload", init(), false);
}

(function () {
  var pi = Math.PI;
  var pi2 = 2 * Math.PI;

  this.Waves = function (holder, options) {
    var Waves = this;

    Waves.options = extend(options || {}, {
      resize: false,
      rotation: 45,
      waves: 5,
      width: 100,
      hue: [11, 14],
      amplitude: 0.5,
      background: true,
      preload: true,
      speed: [0.004, 0.008],
      debug: false,
      fps: false,
    });

    Waves.waves = [];

    Waves.holder = document.querySelector(holder);
    Waves.canvas = document.createElement("canvas");
    Waves.ctx = Waves.canvas.getContext("2d");
    Waves.holder.appendChild(Waves.canvas);

    Waves.hue = Waves.options.hue[0];
    Waves.hueFw = true;
    Waves.stats = new Stats();

    Waves.resize();
    Waves.init(Waves.options.preload);

    if (Waves.options.resize)
      window.addEventListener(
        "resize",
        function () {
          Waves.resize();
        },
        false
      );
  };

  Waves.prototype.init = function (preload) {
    var Waves = this;
    var options = Waves.options;

    for (var i = 0; i < options.waves; i++) Waves.waves[i] = new Wave(Waves);

    if (preload) Waves.preload();
  };

  Waves.prototype.preload = function () {
    var Waves = this;
    var options = Waves.options;

    for (var i = 0; i < options.waves; i++) {
      Waves.updateColor();
      for (var j = 0; j < options.width; j++) {
        Waves.waves[i].update();
      }
    }
  };

  Waves.prototype.render = function () {
    var Waves = this;
    var ctx = Waves.ctx;
    var options = Waves.options;

    Waves.updateColor();
    Waves.clear();

    if (Waves.options.debug) {
      ctx.beginPath();
      ctx.strokeStyle = "#f00";
      ctx.arc(Waves.centerX, Waves.centerY, Waves.radius, 0, pi2);
      ctx.stroke();
    }

    if (Waves.options.background) {
      Waves.background();
    }

    each(Waves.waves, function (wave, i) {
      wave.update();
      wave.draw();
    });
  };

  Waves.prototype.animate = function () {
    var Waves = this;

    Waves.render();

    if (Waves.options.fps) {
      Waves.stats.log();
      Waves.ctx.font = "12px Arial";
      Waves.ctx.fillStyle = "#fff";
      Waves.ctx.fillText(Waves.stats.fps() + " FPS", 10, 22);
    }

    window.requestAnimationFrame(Waves.animate.bind(Waves));
  };

  Waves.prototype.clear = function () {
    var Waves = this;
    Waves.ctx.clearRect(0, 0, Waves.width, Waves.height);
  };

  Waves.prototype.background = function () {
    var Waves = this;
    var ctx = Waves.ctx;

    var gradient = Waves.ctx.createLinearGradient(0, 0, 0, Waves.height);
    gradient.addColorStop(0, "#000");
    gradient.addColorStop(1, Waves.color);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, Waves.width, Waves.height);
  };

  Waves.prototype.resize = function () {
    var Waves = this;
    var width = Waves.holder.offsetWidth;
    var height = Waves.holder.offsetHeight;
    Waves.scale = window.devicePixelRatio || 1;
    Waves.width = width * Waves.scale;
    Waves.height = height * Waves.scale;
    Waves.canvas.width = Waves.width;
    Waves.canvas.height = Waves.height;
    Waves.canvas.style.width = width + "px";
    Waves.canvas.style.height = height + "px";
    Waves.radius =
      Math.sqrt(Math.pow(Waves.width, 2) + Math.pow(Waves.height, 2)) / 2;
    Waves.centerX = Waves.width / 2;
    Waves.centerY = Waves.height / 2;
    //Waves.radius /= 2; // REMOVE FOR FULLSREEN
  };

  Waves.prototype.updateColor = function () {
    var Waves = this;

    Waves.hue += Waves.hueFw ? 0.01 : -0.01;

    if (Waves.hue > Waves.options.hue[1] && Waves.hueFw) {
      Waves.hue = Waves.options.hue[1];
      Waves.Waves = false;
    } else if (Waves.hue < Waves.options.hue[0] && !Waves.hueFw) {
      Waves.hue = Waves.options.hue[0];
      Waves.Waves = true;
    }

    var a = Math.floor(127 * Math.sin(0.3 * Waves.hue + 0) + 128);
    var b = Math.floor(127 * Math.sin(0.3 * Waves.hue + 2) + 128);
    var c = Math.floor(127 * Math.sin(0.3 * Waves.hue + 4) + 128);

    Waves.color = "rgba(" + a + "," + b + "," + c + ", 0.1)";
  };

  function Wave(Waves) {
    var Wave = this;
    var speed = Waves.options.speed;

    Wave.Waves = Waves;
    Wave.Lines = [];

    Wave.angle = [rnd(pi2), rnd(pi2), rnd(pi2), rnd(pi2)];

    Wave.speed = [
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
    ];

    return Wave;
  }

  Wave.prototype.update = function () {
    var Wave = this;
    var Lines = Wave.Lines;
    var color = Wave.Waves.color;

    Lines.push(new Line(Wave, color));

    if (Lines.length > Wave.Waves.options.width) {
      Lines.shift();
    }
  };

  Wave.prototype.draw = function () {
    var Wave = this;
    var Waves = Wave.Waves;

    var ctx = Waves.ctx;
    var radius = Waves.radius;
    var radius3 = radius / 3;
    var x = Waves.centerX;
    var y = Waves.centerY;
    var rotation = dtr(Waves.options.rotation);
    var amplitude = Waves.options.amplitude;
    var debug = Waves.options.debug;

    var Lines = Wave.Lines;

    each(Lines, function (line, i) {
      if (debug && i > 0) return;

      var angle = line.angle;

      var x1 = x - radius * Math.cos(angle[0] * amplitude + rotation);
      var y1 = y - radius * Math.sin(angle[0] * amplitude + rotation);
      var x2 = x + radius * Math.cos(angle[3] * amplitude + rotation);
      var y2 = y + radius * Math.sin(angle[3] * amplitude + rotation);
      var cpx1 = x - radius3 * Math.cos(angle[1] * amplitude * 2);
      var cpy1 = y - radius3 * Math.sin(angle[1] * amplitude * 2);
      var cpx2 = x + radius3 * Math.cos(angle[2] * amplitude * 2);
      var cpy2 = y + radius3 * Math.sin(angle[2] * amplitude * 2);

      ctx.strokeStyle = debug ? "#fff" : line.color;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      ctx.stroke();

      if (debug) {
        ctx.strokeStyle = "#fff";
        ctx.globalAlpha = 0.3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cpx1, cpy1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(cpx2, cpy2);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }
    });
  };

  function Line(Wave, color) {
    var Line = this;

    var angle = Wave.angle;
    var speed = Wave.speed;

    Line.angle = [
      Math.sin((angle[0] += speed[0])),
      Math.sin((angle[1] += speed[1])),
      Math.sin((angle[2] += speed[2])),
      Math.sin((angle[3] += speed[3])),
    ];

    Line.color = color;
  }

  function Stats() {
    this.data = [];
  }

  Stats.prototype.time = function () {
    return (performance || Date).now();
  };

  Stats.prototype.log = function () {
    if (!this.last) {
      this.last = this.time();
      return 0;
    }

    this.new = this.time();
    this.delta = this.new - this.last;
    this.last = this.new;

    this.data.push(this.delta);
    if (this.data.length > 10) this.data.shift();
  };

  Stats.prototype.fps = function () {
    var fps = 0;
    each(this.data, function (data, i) {
      fps += data;
    });

    return Math.round(1000 / (fps / this.data.length));
  };

  function each(items, callback) {
    for (var i = 0; i < items.length; i++) {
      callback(items[i], i);
    }
  }

  function extend(options, defaults) {
    for (var key in options)
      if (defaults.hasOwnProperty(key)) defaults[key] = options[key];
    return defaults;
  }

  function dtr(deg) {
    return (deg * pi) / 180;
  }

  function rtd(rad) {
    return (rad * 180) / pi;
  }

  function diagonal_angle(w, h) {
    var a = Math.atan2(h, w) * 1.27325;
    return a;
  }

  function rnd(a, b) {
    if (arguments.length == 1) return Math.random() * a;
    return a + Math.random() * (b - a);
  }

  function rnd_sign() {
    return Math.random() > 0.5 ? 1 : -1;
  }
})();

var waves = new Waves("#holder", {
  fps: false,
  waves: 3,
  width: 120,
  hue: [13, 15],
  rotation: 75,
  speed: [0.003, 0.003],
});

// resize: false,
// rotation: 45,
// waves: 5,
// width: 100,
// hue: [11, 14],
// amplitude: 0.5,
// background: true,
// preload: true,
// speed: [0.004, 0.008],
// debug: false,
// fps: false,

waves.animate();
