/*!
 * stuQuery
 */
(function (b) {
  var f = {};
  function d(h) {
    this.stuquery = "1.0.26";
    this.getBy = function (q, p) {
      var o, l, n;
      o = -1;
      var j = [];
      if (p.indexOf(":eq") > 0) {
        l = p.replace(/(.*)\:eq\(([0-9]+)\)/, "$1 $2").split(" ");
        p = l[0];
        o = parseInt(l[1]);
      }
      if (p[0] == ".") {
        h = q.getElementsByClassName(p.substr(1));
      } else {
        if (p[0] == "#") {
          h = q.getElementById(p.substr(1));
        } else {
          h = q.getElementsByTagName(p);
        }
      }
      if (!h) {
        h = [];
      }
      if (h.nodeName && h.nodeName == "SELECT") {
        j.push(h);
      } else {
        if (typeof h.length !== "number") {
          h = [h];
        }
        for (n = 0; n < h.length; n++) {
          j.push(h[n]);
        }
        if (o >= 0 && j.length > 0) {
          if (o < j.length) {
            j = [j[o]];
          } else {
            j = [];
          }
        }
      }
      return j;
    };
    this.matchSelector = function (l, k) {
      if (k[0] == ".") {
        k = k.substr(1);
        for (var j = 0; j < l.classList.length; j++) {
          if (l.classList[j] == k) {
            return true;
          }
        }
      } else {
        if (k[0] == "#") {
          if (l.id == k.substr(1)) {
            return true;
          }
        } else {
          if (l.tagName == k.toUpperCase()) {
            return true;
          }
        }
      }
      return false;
    };
    if (typeof h === "string") {
      this.e = this.querySelector(document, h);
    } else {
      if (typeof h === "object") {
        this.e = typeof h.length == "number" ? h : [h];
      }
    }
    for (var i in this.e) {
      if (this.e[i]) {
        this[i] = this.e[i];
      }
    }
    this.length = this.e ? this.e.length : 0;
    return this;
  }
  d.prototype.querySelector = function (m, h) {
    var s = [];
    var q, r, p, n, l, o;
    if (h.indexOf(":eq") >= 0) {
      q = h.split(" ");
      for (p = 0; p < q.length; p++) {
        if (p == 0) {
          o = this.getBy(m, q[p]);
        } else {
          r = [];
          for (n = 0; n < o.length; n++) {
            r = r.concat(this.getBy(o[n], q[p]));
          }
          o = r.splice(0);
        }
      }
    } else {
      o = m.querySelectorAll(h);
    }
    for (l = 0; l < o.length; l++) {
      s.push(o[l]);
    }
    return s;
  };
  d.prototype.ready = function (h) {
    if (/in/.test(document.readyState)) {
      setTimeout("S(document).ready(" + h + ")", 9);
    } else {
      h();
    }
  };
  d.prototype.html = function (j) {
    if (typeof j === "number") {
      j = "" + j;
    }
    if (typeof j !== "string" && this.length == 1) {
      return this[0].innerHTML;
    }
    if (typeof j === "string") {
      for (var h = 0; h < this.length; h++) {
        this[h].innerHTML = j;
      }
    }
    return this;
  };
  d.prototype.append = function (j) {
    if (!j && this.length == 1) {
      return this[0].innerHTML;
    }
    if (j) {
      for (var h = 0; h < this.length; h++) {
        var k = document.createElement("template");
        k.innerHTML = j;
        var l = typeof k.content === "undefined" ? k : k.content;
        if (l.childNodes.length > 0) {
          while (l.childNodes.length > 0) {
            this[h].appendChild(l.childNodes[0]);
          }
        } else {
          this[h].append(j);
        }
      }
    }
    return this;
  };
  d.prototype.prepend = function (l) {
    var k, h, n, m;
    if (!l && this.length == 1) {
      return this[0].innerHTML;
    }
    for (k = 0; k < this.length; k++) {
      n = document.createElement("div");
      n.innerHTML = l;
      m = n.childNodes;
      for (h = m.length - 1; h >= 0; h--) {
        this[k].insertBefore(m[h], this[k].firstChild);
      }
    }
    return this;
  };
  d.prototype.before = function (l) {
    var k, n, m, h;
    for (k = 0; k < this.length; k++) {
      n = document.createElement("div");
      n.innerHTML = l;
      m = n.childNodes;
      for (h = 0; h < m.length; h++) {
        this[k].parentNode.insertBefore(m[h], this[k]);
      }
    }
    return this;
  };
  d.prototype.after = function (j) {
    for (var h = 0; h < this.length; h++) {
      this[h].insertAdjacentHTML("afterend", j);
    }
    return this;
  };
  function g(h, k) {
    if (h && h.length > 0) {
      for (var j = 0; j < h.length; j++) {
        if (h[j].node == k) {
          return { success: true, match: j };
        }
      }
    }
    return { success: false };
  }
  function e(l, j, i, h, k) {
    if (!f[j]) {
      f[j] = [];
    }
    f[j].push({ node: l, fn: i, fn2: h, data: k });
  }
  function a(i) {
    if (f[i.type]) {
      var h = g(f[i.type], i.currentTarget);
      if (h.success) {
        if (h.match.data) {
          i.data = f[i.type][h.match].data;
        }
        return { fn: f[i.type][h.match].fn, data: i };
      }
    }
    return function () {
      return { fn: "" };
    };
  }
  d.prototype.off = function (k) {
    if (typeof Element.prototype.removeEventListener !== "function") {
      Element.prototype.removeEventListener = function (q, n) {
        if (!oListeners.hasOwnProperty(q)) {
          return;
        }
        var m = oListeners[q];
        for (var i = -1, l = 0; l < m.aEls.length; l++) {
          if (m.aEls[l] === this) {
            i = l;
            break;
          }
        }
        if (i === -1) {
          return;
        }
        for (var p = 0, o = m.aEvts[i]; p < o.length; p++) {
          if (o[p] === n) {
            o.splice(p, 1);
          }
        }
      };
    }
    for (var j = 0; j < this.length; j++) {
      var h = g(f[k], this.e[j]);
      if (h.success) {
        this[j].removeEventListener(k, f[k][h.match].fn2, false);
        f[k].splice(h.match, 1);
      }
    }
    return this;
  };
  d.prototype.on = function (m, o, k) {
    var j = (m || window.event).split(/ /);
    if (typeof o === "function" && !k) {
      k = o;
      o = "";
    }
    if (typeof k !== "function") {
      return this;
    }
    if (this.length > 0) {
      var p = this;
      var n;
      for (var l = 0; l < j.length; l++) {
        m = j[l];
        n = function (i) {
          var q = a({
            currentTarget: this,
            type: m,
            data: o,
            originalEvent: i,
            preventDefault: function () {
              if (i.preventDefault) {
                i.preventDefault();
              }
            },
            stopPropagation: function () {
              if (i.stopImmediatePropagation) {
                i.stopImmediatePropagation();
              }
              if (i.stopPropagation) {
                i.stopPropagation();
              }
              if (i.cancelBubble != null) {
                i.cancelBubble = true;
              }
            },
          });
          if (typeof q.fn === "function") {
            return q.fn.call(p, q.data);
          }
        };
        for (var h = 0; h < this.length; h++) {
          e(this[h], m, k, n, o);
          if (this[h].addEventListener) {
            this[h].addEventListener(m, n, false);
          } else {
            if (this[h].attachEvent) {
              this[h].attachEvent(m, n);
            }
          }
        }
      }
    }
    return this;
  };
  d.prototype.trigger = function (m, n) {
    var l;
    var j = m.split(/ /);
    for (var k = 0; k < j.length; k++) {
      if (document.createEvent) {
        l = document.createEvent("HTMLEvents");
        l.initEvent(n || j[k], true, true);
      } else {
        l = document.createEventObject();
        l.eventType = n || j[k];
      }
      l.eventName = m;
      for (var h = 0; h < this.length; h++) {
        if (document.createEvent) {
          this[h].dispatchEvent(l);
        } else {
          this[h].fireEvent("on" + l.eventType, l);
        }
      }
    }
    return this;
  };
  d.prototype.focus = function () {
    if (this.length == 1) {
      this[0].focus();
    }
    return this;
  };
  d.prototype.blur = function () {
    if (this.length == 1) {
      this[0].blur();
    }
    return this;
  };
  d.prototype.remove = function () {
    if (this.length < 1) {
      return this;
    }
    for (var h = this.length - 1; h >= 0; h--) {
      if (!this[h]) {
        return;
      }
      if (typeof this[h].remove === "function") {
        this[h].remove();
      } else {
        if (typeof this[h].parentElement.removeChild === "function") {
          this[h].parentElement.removeChild(this[h]);
        }
      }
    }
    return this;
  };
  d.prototype.hasClass = function (j) {
    var h = true;
    for (var k = 0; k < this.length; k++) {
      if (!this[k].className.match(new RegExp("(\\s|^)" + j + "(\\s|$)"))) {
        h = false;
      }
    }
    return h;
  };
  d.prototype.toggleClass = function (h) {
    for (var j = 0; j < this.length; j++) {
      if (this[j].className.match(new RegExp("(\\s|^)" + h + "(\\s|$)"))) {
        this[j].className = this[j].className
          .replace(new RegExp("(\\s|^)" + h + "(\\s|$)", "g"), " ")
          .replace(/ $/, "");
      } else {
        this[j].className = (this[j].className + " " + h).replace(/^ /, "");
      }
    }
    return this;
  };
  d.prototype.addClass = function (h) {
    for (var j = 0; j < this.length; j++) {
      if (!this[j].className.match(new RegExp("(\\s|^)" + h + "(\\s|$)"))) {
        this[j].className = (this[j].className + " " + h).replace(/^ /, "");
      }
    }
    return this;
  };
  d.prototype.removeClass = function (h) {
    for (var j = 0; j < this.length; j++) {
      while (this[j].className.match(new RegExp("(\\s|^)" + h + "(\\s|$)"))) {
        this[j].className = this[j].className
          .replace(new RegExp("(\\s|^)" + h + "(\\s|$)", "g"), " ")
          .replace(/ $/, "")
          .replace(/^ /, "");
      }
    }
    return this;
  };
  d.prototype.css = function (l) {
    var q, k, o;
    if (this.length == 1 && typeof l === "string") {
      q = window.getComputedStyle(this[0]);
      return q[l];
    }
    for (k = 0; k < this.length; k++) {
      q = {};
      var h = this[k].getAttribute("style");
      if (h) {
        var p = this[k].getAttribute("style").split(";");
        for (var n = 0; n < p.length; n++) {
          var j = p[n].split(":");
          if (j.length == 2) {
            q[j[0]] = j[1];
          }
        }
      }
      if (typeof l === "object") {
        for (o in l) {
          if (typeof l[o] !== "undefined") {
            q[o] = l[o];
          }
        }
        var m = "";
        for (o in q) {
          if (typeof q[o] !== "undefined") {
            if (m) {
              m += ";";
            }
            if (q[o]) {
              m += o + ":" + q[o];
            }
          }
        }
        this[k].setAttribute("style", m);
      }
    }
    return this;
  };
  d.prototype.parent = function () {
    var j = [];
    for (var h = 0; h < this.length; h++) {
      j.push(this[h].parentElement);
    }
    return S(j);
  };
  d.prototype.children = function (l) {
    var j;
    if (typeof l === "string") {
      var h = [];
      for (j = 0; j < this.length; j++) {
        for (var k = 0; k < this[j].children.length; k++) {
          if (this.matchSelector(this[j].children[k], l)) {
            h.push(this[j].children[k]);
          }
        }
      }
      return S(h);
    } else {
      for (j = 0; j < this.length; j++) {
        this[j] = this[j].children.length > l ? this[j].children[l] : this[j];
      }
      return this;
    }
  };
  d.prototype.find = function (j) {
    var h = [];
    for (var k = 0; k < this.length; k++) {
      h = h.concat(this.querySelector(this[k], j));
    }
    return S(h);
  };
  function c(p, h, q, k) {
    var o = [];
    for (var n = 0; n < p.length; n++) {
      o.push(p[n].getAttribute(h));
      var m = false;
      for (var l in k) {
        if (typeof q === k[l]) {
          m = true;
        }
      }
      if (m) {
        if (q) {
          p[n].setAttribute(h, q);
        } else {
          p[n].removeAttribute(h);
        }
      }
    }
    if (o.length == 1) {
      o = o[0];
    }
    if (typeof q === "undefined") {
      return o;
    } else {
      return p;
    }
  }
  d.prototype.attr = function (h, i) {
    return c(this, h, i, ["string", "number"]);
  };
  d.prototype.prop = function (h, i) {
    return c(this, h, i, ["boolean"]);
  };
  d.prototype.clone = function () {
    var h = document.createElement("div");
    h.appendChild(this[0].cloneNode(true));
    return h.innerHTML;
  };
  d.prototype.replaceWith = function (k) {
    var h;
    var l = S(this.e);
    for (var j = 0; j < this.length; j++) {
      h = document.createElement("div");
      h.innerHTML = k;
      l[j] = h.cloneNode(true);
      this[j].parentNode.replaceChild(l[j], this[j]);
    }
    return l;
  };
  d.prototype.width = function () {
    if (this.length > 1) {
      return;
    }
    return this[0].offsetWidth;
  };
  d.prototype.height = function () {
    if (this.length > 1) {
      return;
    }
    return this[0].offsetHeight;
  };
  d.prototype.outerWidth = function () {
    if (this.length > 1) {
      return;
    }
    var h = getComputedStyle(this[0]);
    return (
      this[0].offsetWidth + parseInt(h.marginLeft) + parseInt(h.marginRight)
    );
  };
  d.prototype.outerHeight = function () {
    if (this.length > 1) {
      return;
    }
    var h = getComputedStyle(this[0]);
    return (
      this[0].offsetHeight + parseInt(h.marginTop) + parseInt(h.marginBottom)
    );
  };
  d.prototype.offset = function () {
    var h = this[0].getBoundingClientRect();
    return {
      top: h.top + document.body.scrollTop,
      left: h.left + document.body.scrollLeft,
    };
  };
  d.prototype.position = function () {
    if (this.length > 1) {
      return;
    }
    return { left: this[0].offsetLeft, top: this[0].offsetTop };
  };
  d.prototype.ajax = function (i, s) {
    if (typeof i !== "string") {
      return false;
    }
    if (!s) {
      s = {};
    }
    var l = "",
      o = "";
    var q, r;
    if (i.indexOf("?") > 0) {
      r = i.split("?");
      if (r.length) {
        i = r[0];
        o = r[1];
      }
    }
    if (s.dataType == "jsonp") {
      l = "fn_" + new Date().getTime();
      window[l] = function (t) {
        if (typeof s.success === "function") {
          s.success.call(s["this"] ? s["this"] : this, t, s);
        }
      };
    }
    if (typeof s.cache === "boolean" && !s.cache) {
      o += (o ? "&" : "") + new Date().valueOf();
    }
    if (l) {
      o += (o ? "&" : "") + "callback=" + l;
    }
    if (s.data) {
      o += (o ? "&" : "") + s.data;
    }
    if (s.method == "POST") {
      s.url = i;
    } else {
      s.url = i + (o ? "?" + o : "");
    }
    if (s.dataType == "jsonp") {
      var p = document.createElement("script");
      p.src = s.url;
      document.body.appendChild(p);
      return this;
    }
    q = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject("Microsoft.XMLHTTP");
    q.addEventListener("load", window[l] || j);
    q.addEventListener("error", n);
    q.addEventListener("progress", h);
    var k = "responseType" in q;
    if (s.beforeSend) {
      q = s.beforeSend.call(s["this"] ? s["this"] : this, q, s);
    }
    function j(t) {
      s.header = q.getAllResponseHeaders();
      var u;
      if (q.status == 200 || q.status == 201 || q.status == 202) {
        u = q.response;
        if (q.responseType == "" || q.responseType == "text") {
          u = q.responseText;
        }
        if (s.dataType == "json") {
          try {
            if (typeof u === "string") {
              u = JSON.parse(
                u
                  .replace(/[\n\r]/g, "\\n")
                  .replace(/^([^\(]+)\((.*)\)([^\)]*)$/, function (z, y, x, A) {
                    return y == l ? x : "";
                  })
                  .replace(/\\n/g, "\n")
              );
            }
          } catch (w) {
            n(w);
          }
        }
        if (s.dataType == "script") {
          var v = document.createElement("script");
          v.setAttribute("type", "text/javascript");
          v.innerHTML = u;
          document.head.appendChild(v);
        }
        s.statusText = "success";
        if (typeof s.success === "function") {
          s.success.call(s["this"] ? s["this"] : this, u, s);
        }
      } else {
        s.statusText = "error";
        n(t);
      }
      if (typeof s.complete === "function") {
        s.complete.call(s["this"] ? s["this"] : this, u, s);
      }
    }
    function n(t) {
      if (typeof s.error === "function") {
        s.error.call(s["this"] ? s["this"] : this, t, s);
      }
    }
    function h(t) {
      if (typeof s.progress === "function") {
        s.progress.call(s["this"] ? s["this"] : this, t, s);
      }
    }
    if (k && s.dataType) {
      try {
        q.responseType = s.dataType;
      } catch (m) {
        n(m);
      }
    }
    try {
      q.open(s.method || "GET", s.url, true);
    } catch (m) {
      n(m);
    }
    if (s.method == "POST") {
      q.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    try {
      q.send(s.method == "POST" ? o : null);
    } catch (m) {
      n(m);
    }
    return this;
  };
  d.prototype.loadJSON = function (i, j, h) {
    if (!h) {
      h = {};
    }
    h.dataType = "json";
    h.complete = j;
    this.ajax(i, h);
    return this;
  };
  b.stuQuery = d;
  b.S = function (h) {
    return new d(h);
  };
})(window || this);
