// @ts-nocheck

function F(r) {
  this.content = r;
}
F.prototype = {
  constructor: F,
  find: function (r) {
    for (let e = 0; e < this.content.length; e += 2) if (this.content[e] === r) return e;
    return -1;
  },
  get: function (r) {
    var e = this.find(r);
    return e == -1 ? void 0 : this.content[e + 1];
  },
  update: function (r, e, t) {
    var n = t && t != r ? this.remove(t) : this,
      i = n.find(r),
      s = [...n.content];
    return i == -1 ? s.push(t || r, e) : ((s[i + 1] = e), t && (s[i] = t)), new F(s);
  },
  remove: function (r) {
    var e = this.find(r);
    if (e == -1) return this;
    var t = [...this.content];
    return t.splice(e, 2), new F(t);
  },
  addToStart: function (r, e) {
    return new F([r, e].concat(this.remove(r).content));
  },
  addToEnd: function (r, e) {
    var t = [...this.remove(r).content];
    return t.push(r, e), new F(t);
  },
  addBefore: function (r, e, t) {
    var n = this.remove(e),
      i = [...n.content],
      s = n.find(r);
    return i.splice(s == -1 ? i.length : s, 0, e, t), new F(i);
  },
  forEach: function (r) {
    for (let e = 0; e < this.content.length; e += 2) r(this.content[e], this.content[e + 1]);
  },
  prepend: function (r) {
    return (r = F.from(r)), r.size ? new F(r.content.concat(this.subtract(r).content)) : this;
  },
  append: function (r) {
    return (r = F.from(r)), r.size ? new F(this.subtract(r).content.concat(r.content)) : this;
  },
  subtract: function (r) {
    var e = this;
    r = F.from(r);
    for (let t = 0; t < r.content.length; t += 2) e = e.remove(r.content[t]);
    return e;
  },
  toObject: function () {
    var r = {};
    return (
      this.forEach(function (e, t) {
        r[e] = t;
      }),
      r
    );
  },
  get size() {
    return this.content.length >> 1;
  },
};
F.from = function (r) {
  if (r instanceof F) return r;
  let e = [];
  if (r) for (let t in r) e.push(t, r[t]);
  return new F(e);
};
function fi(r, e, t) {
  for (let n = 0; ; n++) {
    if (n == r.childCount || n == e.childCount) return r.childCount == e.childCount ? null : t;
    let i = r.child(n),
      s = e.child(n);
    if (i == s) {
      t += i.nodeSize;
      continue;
    }
    if (!i.sameMarkup(s)) return t;
    if (i.isText && i.text != s.text) {
      for (let o = 0; i.text[o] == s.text[o]; o++) t++;
      return t;
    }
    if (i.content.size > 0 || s.content.size > 0) {
      let o = fi(i.content, s.content, t + 1);
      if (o != undefined) return o;
    }
    t += i.nodeSize;
  }
}
function di(r, e, t, n) {
  for (let i = r.childCount, s = e.childCount; ; ) {
    if (i == 0 || s == 0)
      return i == s
        ? null
        : {
            a: t,
            b: n,
          };
    let o = r.child(--i),
      l = e.child(--s),
      a = o.nodeSize;
    if (o == l) {
      (t -= a), (n -= a);
      continue;
    }
    if (!o.sameMarkup(l))
      return {
        a: t,
        b: n,
      };
    if (o.isText && o.text != l.text) {
      let c = 0,
        f = Math.min(o.text.length, l.text.length);
      for (; c < f && o.text[o.text.length - c - 1] == l.text[l.text.length - c - 1]; )
        c++, t--, n--;
      return {
        a: t,
        b: n,
      };
    }
    if (o.content.size > 0 || l.content.size > 0) {
      let c = di(o.content, l.content, t - 1, n - 1);
      if (c) return c;
    }
    (t -= a), (n -= a);
  }
}
class k {
  constructor(e, t) {
    if (((this.content = e), (this.size = t || 0), t == undefined))
      for (let n = 0; n < e.length; n++) this.size += e[n].nodeSize;
  }

  nodesBetween(e, t, n, i = 0, s) {
    for (let o = 0, l = 0; l < t; o++) {
      let a = this.content[o],
        c = l + a.nodeSize;
      if (c > e && n(a, i + l, s || null, o) !== !1 && a.content.size > 0) {
        let f = l + 1;
        a.nodesBetween(Math.max(0, e - f), Math.min(a.content.size, t - f), n, i + f);
      }
      l = c;
    }
  }

  descendants(e) {
    this.nodesBetween(0, this.size, e);
  }

  textBetween(e, t, n, i) {
    let s = '',
      o = !0;
    return (
      this.nodesBetween(
        e,
        t,
        (l, a) => {
          let c = l.isText
            ? l.text.slice(Math.max(e, a) - a, t - a)
            : l.isLeaf
            ? i
              ? typeof i == 'function'
                ? i(l)
                : i
              : l.type.spec.leafText
              ? l.type.spec.leafText(l)
              : ''
            : '';
          l.isBlock && ((l.isLeaf && c) || l.isTextblock) && n && (o ? (o = !1) : (s += n)),
            (s += c);
        },
        0,
      ),
      s
    );
  }

  append(e) {
    if (e.size === 0) return this;
    if (!this.size) return e;
    let t = this.lastChild,
      n = e.firstChild,
      i = [...this.content],
      s = 0;
    for (
      t.isText && t.sameMarkup(n) && ((i[i.length - 1] = t.withText(t.text + n.text)), (s = 1));
      s < e.content.length;
      s++
    )
      i.push(e.content[s]);
    return new k(i, this.size + e.size);
  }

  cut(e, t = this.size) {
    if (e == 0 && t == this.size) return this;
    let n = [],
      i = 0;
    if (t > e)
      for (let s = 0, o = 0; o < t; s++) {
        let l = this.content[s],
          a = o + l.nodeSize;
        a > e &&
          ((o < e || a > t) &&
            (l.isText
              ? (l = l.cut(Math.max(0, e - o), Math.min(l.text.length, t - o)))
              : (l = l.cut(Math.max(0, e - o - 1), Math.min(l.content.size, t - o - 1)))),
          n.push(l),
          (i += l.nodeSize)),
          (o = a);
      }
    return new k(n, i);
  }

  cutByIndex(e, t) {
    return e == t
      ? k.empty
      : e == 0 && t == this.content.length
      ? this
      : new k(this.content.slice(e, t));
  }

  replaceChild(e, t) {
    let n = this.content[e];
    if (n == t) return this;
    let i = [...this.content],
      s = this.size + t.nodeSize - n.nodeSize;
    return (i[e] = t), new k(i, s);
  }

  addToStart(e) {
    return new k([e].concat(this.content), this.size + e.nodeSize);
  }

  addToEnd(e) {
    return new k(this.content.concat(e), this.size + e.nodeSize);
  }

  eq(e) {
    if (this.content.length != e.content.length) return !1;
    for (let t = 0; t < this.content.length; t++) if (!this.content[t].eq(e.content[t])) return !1;
    return !0;
  }

  get firstChild() {
    return this.content.length > 0 ? this.content[0] : null;
  }

  get lastChild() {
    return this.content.length > 0 ? this.content.at(-1) : null;
  }

  get childCount() {
    return this.content.length;
  }

  child(e) {
    let t = this.content[e];
    if (!t) throw new RangeError('Index ' + e + ' out of range for ' + this);
    return t;
  }

  maybeChild(e) {
    return this.content[e] || null;
  }

  forEach(e) {
    for (let t = 0, n = 0; t < this.content.length; t++) {
      let i = this.content[t];
      e(i, n, t), (n += i.nodeSize);
    }
  }

  findDiffStart(e, t = 0) {
    return fi(this, e, t);
  }

  findDiffEnd(e, t = this.size, n = e.size) {
    return di(this, e, t, n);
  }

  findIndex(e, t = -1) {
    if (e == 0) return St(0, e);
    if (e == this.size) return St(this.content.length, e);
    if (e > this.size || e < 0) throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let n = 0, i = 0; ; n++) {
      let s = this.child(n),
        o = i + s.nodeSize;
      if (o >= e) return o == e || t > 0 ? St(n + 1, o) : St(n, i);
      i = o;
    }
  }

  toString() {
    return '<' + this.toStringInner() + '>';
  }

  toStringInner() {
    return this.content.join(', ');
  }

  toJSON() {
    return this.content.length > 0 ? this.content.map((e) => e.toJSON()) : null;
  }

  static fromJSON(e, t) {
    if (!t) return k.empty;
    if (!Array.isArray(t)) throw new RangeError('Invalid input for Fragment.fromJSON');
    return new k(t.map(e.nodeFromJSON));
  }

  static fromArray(e) {
    if (e.length === 0) return k.empty;
    let t;
    let n = 0;
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      (n += s.nodeSize),
        i && s.isText && e[i - 1].sameMarkup(s)
          ? (t || (t = e.slice(0, i)), (t[t.length - 1] = s.withText(t.at(-1).text + s.text)))
          : t && t.push(s);
    }
    return new k(t || e, n);
  }

  static from(e) {
    if (!e) return k.empty;
    if (e instanceof k) return e;
    if (Array.isArray(e)) return this.fromArray(e);
    if (e.attrs) return new k([e], e.nodeSize);
    throw new RangeError(
      'Can not convert ' +
        e +
        ' to a Fragment' +
        (e.nodesBetween ? ' (looks like multiple versions of prosemirror-model were loaded)' : ''),
    );
  }
}
k.empty = new k([], 0);
const sn = {
  index: 0,
  offset: 0,
};
function St(r, e) {
  return (sn.index = r), (sn.offset = e), sn;
}
function Dt(r, e) {
  if (r === e) return !0;
  if (!(r && typeof r === 'object') || !(e && typeof e === 'object')) return !1;
  const t = Array.isArray(r);
  if (Array.isArray(e) != t) return !1;
  if (t) {
    if (r.length != e.length) return !1;
    for (let n = 0; n < r.length; n++) if (!Dt(r[n], e[n])) return !1;
  } else {
    for (const n in r) if (!(n in e) || !Dt(r[n], e[n])) return !1;
    for (const n in e) if (!(n in r)) return !1;
  }
  return !0;
}
const D = class Mn {
  constructor(e, t) {
    (this.type = e), (this.attrs = t);
  }
  addToSet(e) {
    let t,
      n = !1;
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      if (this.eq(s)) return e;
      if (this.type.excludes(s.type)) t || (t = e.slice(0, i));
      else {
        if (s.type.excludes(this.type)) return e;
        !n && s.type.rank > this.type.rank && (t || (t = e.slice(0, i)), t.push(this), (n = !0)),
          t && t.push(s);
      }
    }
    return t || (t = e.slice()), n || t.push(this), t;
  }
  removeFromSet(e) {
    for (let t = 0; t < e.length; t++)
      if (this.eq(e[t])) return e.slice(0, t).concat(e.slice(t + 1));
    return e;
  }
  isInSet(e) {
    for (let t = 0; t < e.length; t++) if (this.eq(e[t])) return !0;
    return !1;
  }
  eq(e) {
    return this == e || (this.type == e.type && Dt(this.attrs, e.attrs));
  }
  toJSON() {
    let e = {
      type: this.type.name,
    };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return e;
  }
  static fromJSON(e, t) {
    if (!t) throw new RangeError('Invalid input for Mark.fromJSON');
    let n = e.marks[t.type];
    if (!n) throw new RangeError(`There is no mark type ${t.type} in this schema`);
    let i = n.create(t.attrs);
    return n.checkAttrs(i.attrs), i;
  }
  static sameSet(e, t) {
    if (e == t) return !0;
    if (e.length != t.length) return !1;
    for (let n = 0; n < e.length; n++) if (!e[n].eq(t[n])) return !1;
    return !0;
  }
  static setFrom(e) {
    if (!e || (Array.isArray(e) && e.length == 0)) return Mn.none;
    if (e instanceof Mn) return [e];
    let t = e.slice();
    return t.sort((n, i) => n.type.rank - i.type.rank), t;
  }
};
D.none = [];
class At extends Error {}
class b {
  constructor(e, t, n) {
    (this.content = e), (this.openStart = t), (this.openEnd = n);
  }

  get size() {
    return this.content.size - this.openStart - this.openEnd;
  }

  insertAt(e, t) {
    let n = hi(this.content, e + this.openStart, t);
    return n && new b(n, this.openStart, this.openEnd);
  }

  removeBetween(e, t) {
    return new b(
      ui(this.content, e + this.openStart, t + this.openStart),
      this.openStart,
      this.openEnd,
    );
  }

  eq(e) {
    return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
  }

  toString() {
    return this.content + '(' + this.openStart + ',' + this.openEnd + ')';
  }

  toJSON() {
    if (this.content.size === 0) return null;
    let e = {
      content: this.content.toJSON(),
    };
    return (
      this.openStart > 0 && (e.openStart = this.openStart),
      this.openEnd > 0 && (e.openEnd = this.openEnd),
      e
    );
  }

  static fromJSON(e, t) {
    if (!t) return b.empty;
    let n = t.openStart || 0,
      i = t.openEnd || 0;
    if (typeof n !== 'number' || typeof i !== 'number')
      throw new RangeError('Invalid input for Slice.fromJSON');
    return new b(k.fromJSON(e, t.content), n, i);
  }

  static maxOpen(e, t = !0) {
    let n = 0,
      i = 0;
    for (let s = e.firstChild; s && !s.isLeaf && (t || !s.type.spec.isolating); s = s.firstChild)
      n++;
    for (let s = e.lastChild; s && !s.isLeaf && (t || !s.type.spec.isolating); s = s.lastChild) i++;
    return new b(e, n, i);
  }
}
b.empty = new b(k.empty, 0, 0);
function ui(r, e, t) {
  const { index: n, offset: i } = r.findIndex(e),
    s = r.maybeChild(n),
    { index: o, offset: l } = r.findIndex(t);
  if (i == e || s.isText) {
    if (l != t && !r.child(o).isText) throw new RangeError('Removing non-flat range');
    return r.cut(0, e).append(r.cut(t));
  }
  if (n != o) throw new RangeError('Removing non-flat range');
  return r.replaceChild(n, s.copy(ui(s.content, e - i - 1, t - i - 1)));
}
function hi(r, e, t, n) {
  const { index: i, offset: s } = r.findIndex(e),
    o = r.maybeChild(i);
  if (s == e || o.isText) return r.cut(0, e).append(t).append(r.cut(e));
  const l = hi(o.content, e - s - 1, t);
  return l && r.replaceChild(i, o.copy(l));
}
function Js(r, e, t) {
  if (t.openStart > r.depth) throw new At('Inserted content deeper than insertion position');
  if (r.depth - t.openStart != e.depth - t.openEnd) throw new At('Inconsistent open depths');
  return pi(r, e, t, 0);
}
function pi(r, e, t, n) {
  const i = r.index(n),
    s = r.node(n);
  if (i == e.index(n) && n < r.depth - t.openStart) {
    let o = pi(r, e, t, n + 1);
    return s.copy(s.content.replaceChild(i, o));
  } else if (t.content.size > 0)
    if (!t.openStart && !t.openEnd && r.depth == n && e.depth == n) {
      let o = r.parent,
        l = o.content;
      return Re(o, l.cut(0, r.parentOffset).append(t.content).append(l.cut(e.parentOffset)));
    } else {
      let { start: o, end: l } = Ws(t, r);
      return Re(s, gi(r, o, l, e, n));
    }
  else return Re(s, It(r, e, n));
}
function mi(r, e) {
  if (!e.type.compatibleContent(r.type))
    throw new At('Cannot join ' + e.type.name + ' onto ' + r.type.name);
}
function Cn(r, e, t) {
  const n = r.node(t);
  return mi(n, e.node(t)), n;
}
function ve(r, e) {
  const t = e.length - 1;
  t >= 0 && r.isText && r.sameMarkup(e[t]) ? (e[t] = r.withText(e[t].text + r.text)) : e.push(r);
}
function it(r, e, t, n) {
  let i = (e || r).node(t);
  let s = 0;
  let o = e ? e.index(t) : i.childCount;
  r && ((s = r.index(t)), r.depth > t ? s++ : r.textOffset && (ve(r.nodeAfter, n), s++));
  for (let l = s; l < o; l++) ve(i.child(l), n);
  e && e.depth == t && e.textOffset && ve(e.nodeBefore, n);
}
function Re(r, e) {
  return r.type.checkContent(e), r.copy(e);
}
function gi(r, e, t, n, i) {
  const s = r.depth > i && Cn(r, e, i + 1),
    o = n.depth > i && Cn(t, n, i + 1),
    l = [];
  return (
    it(null, r, i, l),
    s && o && e.index(i) == t.index(i)
      ? (mi(s, o), ve(Re(s, gi(r, e, t, n, i + 1)), l))
      : (s && ve(Re(s, It(r, e, i + 1)), l), it(e, t, i, l), o && ve(Re(o, It(t, n, i + 1)), l)),
    it(n, null, i, l),
    new k(l)
  );
}
function It(r, e, t) {
  const n = [];
  if ((it(null, r, t, n), r.depth > t)) {
    let i = Cn(r, e, t + 1);
    ve(Re(i, It(r, e, t + 1)), n);
  }
  return it(e, null, t, n), new k(n);
}
function Ws(r, e) {
  let t = e.depth - r.openStart;
  let i = e.node(t).copy(r.content);
  for (let s = t - 1; s >= 0; s--) i = e.node(s).copy(k.from(i));
  return {
    start: i.resolveNoCache(r.openStart + t),
    end: i.resolveNoCache(i.content.size - r.openEnd - t),
  };
}
class ct {
  constructor(e, t, n) {
    (this.pos = e), (this.path = t), (this.parentOffset = n), (this.depth = t.length / 3 - 1);
  }

  resolveDepth(e) {
    return e == undefined ? this.depth : e < 0 ? this.depth + e : e;
  }

  get parent() {
    return this.node(this.depth);
  }

  get doc() {
    return this.node(0);
  }

  node(e) {
    return this.path[this.resolveDepth(e) * 3];
  }

  index(e) {
    return this.path[this.resolveDepth(e) * 3 + 1];
  }

  indexAfter(e) {
    return (
      (e = this.resolveDepth(e)), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1)
    );
  }

  start(e) {
    return (e = this.resolveDepth(e)), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
  }

  end(e) {
    return (e = this.resolveDepth(e)), this.start(e) + this.node(e).content.size;
  }

  before(e) {
    if (((e = this.resolveDepth(e)), !e))
      throw new RangeError('There is no position before the top-level node');
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
  }

  after(e) {
    if (((e = this.resolveDepth(e)), !e))
      throw new RangeError('There is no position after the top-level node');
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
  }

  get textOffset() {
    return this.pos - this.path.at(-1);
  }

  get nodeAfter() {
    let e = this.parent,
      t = this.index(this.depth);
    if (t == e.childCount) return null;
    let n = this.pos - this.path.at(-1),
      i = e.child(t);
    return n ? e.child(t).cut(n) : i;
  }

  get nodeBefore() {
    let e = this.index(this.depth),
      t = this.pos - this.path.at(-1);
    return t ? this.parent.child(e).cut(0, t) : e == 0 ? null : this.parent.child(e - 1);
  }

  posAtIndex(e, t) {
    t = this.resolveDepth(t);
    let n = this.path[t * 3],
      i = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
    for (let s = 0; s < e; s++) i += n.child(s).nodeSize;
    return i;
  }

  marks() {
    let e = this.parent,
      t = this.index();
    if (e.content.size === 0) return D.none;
    if (this.textOffset) return e.child(t).marks;
    let n = e.maybeChild(t - 1),
      i = e.maybeChild(t);
    if (!n) {
      let l = n;
      (n = i), (i = l);
    }
    let s = n.marks;
    for (let o = 0; o < s.length; o++)
      s[o].type.spec.inclusive === !1 &&
        (!i || !s[o].isInSet(i.marks)) &&
        (s = s[o--].removeFromSet(s));
    return s;
  }

  marksAcross(e) {
    let t = this.parent.maybeChild(this.index());
    if (!t || !t.isInline) return null;
    let n = t.marks,
      i = e.parent.maybeChild(e.index());
    for (let s = 0; s < n.length; s++)
      n[s].type.spec.inclusive === !1 &&
        (!i || !n[s].isInSet(i.marks)) &&
        (n = n[s--].removeFromSet(n));
    return n;
  }

  sharedDepth(e) {
    for (let t = this.depth; t > 0; t--) if (this.start(t) <= e && this.end(t) >= e) return t;
    return 0;
  }

  blockRange(e = this, t) {
    if (e.pos < this.pos) return e.blockRange(this);
    for (let n = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); n >= 0; n--)
      if (e.pos <= this.end(n) && (!t || t(this.node(n)))) return new vt(this, e, n);
    return null;
  }

  sameParent(e) {
    return this.pos - this.parentOffset == e.pos - e.parentOffset;
  }

  max(e) {
    return e.pos > this.pos ? e : this;
  }

  min(e) {
    return e.pos < this.pos ? e : this;
  }

  toString() {
    let e = '';
    for (let t = 1; t <= this.depth; t++)
      e += (e ? '/' : '') + this.node(t).type.name + '_' + this.index(t - 1);
    return e + ':' + this.parentOffset;
  }

  static resolve(e, t) {
    if (!(t >= 0 && t <= e.content.size)) throw new RangeError('Position ' + t + ' out of range');
    let n = [],
      i = 0,
      s = t;
    for (let o = e; ; ) {
      let { index: l, offset: a } = o.content.findIndex(s),
        c = s - a;
      if ((n.push(o, l, i + a), !c || ((o = o.child(l)), o.isText))) break;
      (s = c - 1), (i += a + 1);
    }
    return new ct(t, n, s);
  }

  static resolveCached(e, t) {
    let n = sr.get(e);
    if (n)
      for (let s = 0; s < n.elts.length; s++) {
        let o = n.elts[s];
        if (o.pos == t) return o;
      }
    else sr.set(e, (n = new js()));
    let i = (n.elts[n.i] = ct.resolve(e, t));
    return (n.i = (n.i + 1) % qs), i;
  }
}
class js {
  constructor() {
    (this.elts = []), (this.i = 0);
  }
}
const qs = 12,
  sr = new WeakMap();
class vt {
  constructor(e, t, n) {
    (this.$from = e), (this.$to = t), (this.depth = n);
  }

  get start() {
    return this.$from.before(this.depth + 1);
  }

  get end() {
    return this.$to.after(this.depth + 1);
  }

  get parent() {
    return this.$from.node(this.depth);
  }

  get startIndex() {
    return this.$from.index(this.depth);
  }

  get endIndex() {
    return this.$to.indexAfter(this.depth);
  }
}
const Ks = Object.create(null);
const ye = class wn {
  constructor(e, t, n, i = D.none) {
    (this.type = e), (this.attrs = t), (this.marks = i), (this.content = n || k.empty);
  }
  get nodeSize() {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }
  get childCount() {
    return this.content.childCount;
  }
  child(e) {
    return this.content.child(e);
  }
  maybeChild(e) {
    return this.content.maybeChild(e);
  }
  forEach(e) {
    this.content.forEach(e);
  }
  nodesBetween(e, t, n, i = 0) {
    this.content.nodesBetween(e, t, n, i, this);
  }
  descendants(e) {
    this.nodesBetween(0, this.content.size, e);
  }
  get textContent() {
    return this.isLeaf && this.type.spec.leafText
      ? this.type.spec.leafText(this)
      : this.textBetween(0, this.content.size, '');
  }
  textBetween(e, t, n, i) {
    return this.content.textBetween(e, t, n, i);
  }
  get firstChild() {
    return this.content.firstChild;
  }
  get lastChild() {
    return this.content.lastChild;
  }
  eq(e) {
    return this == e || (this.sameMarkup(e) && this.content.eq(e.content));
  }
  sameMarkup(e) {
    return this.hasMarkup(e.type, e.attrs, e.marks);
  }
  hasMarkup(e, t, n) {
    return (
      this.type == e &&
      Dt(this.attrs, t || e.defaultAttrs || Ks) &&
      D.sameSet(this.marks, n || D.none)
    );
  }
  copy(e = null) {
    return e == this.content ? this : new wn(this.type, this.attrs, e, this.marks);
  }
  mark(e) {
    return e == this.marks ? this : new wn(this.type, this.attrs, this.content, e);
  }
  cut(e, t = this.content.size) {
    return e == 0 && t == this.content.size ? this : this.copy(this.content.cut(e, t));
  }
  slice(e, t = this.content.size, n = !1) {
    if (e == t) return b.empty;
    let i = this.resolve(e),
      s = this.resolve(t),
      o = n ? 0 : i.sharedDepth(t),
      l = i.start(o),
      c = i.node(o).content.cut(i.pos - l, s.pos - l);
    return new b(c, i.depth - o, s.depth - o);
  }
  replace(e, t, n) {
    return Js(this.resolve(e), this.resolve(t), n);
  }
  nodeAt(e) {
    for (let t = this; ; ) {
      let { index: n, offset: i } = t.content.findIndex(e);
      if (((t = t.maybeChild(n)), !t)) return null;
      if (i == e || t.isText) return t;
      e -= i + 1;
    }
  }
  childAfter(e) {
    let { index: t, offset: n } = this.content.findIndex(e);
    return {
      node: this.content.maybeChild(t),
      index: t,
      offset: n,
    };
  }
  childBefore(e) {
    if (e == 0)
      return {
        node: null,
        index: 0,
        offset: 0,
      };
    let { index: t, offset: n } = this.content.findIndex(e);
    if (n < e)
      return {
        node: this.content.child(t),
        index: t,
        offset: n,
      };
    let i = this.content.child(t - 1);
    return {
      node: i,
      index: t - 1,
      offset: n - i.nodeSize,
    };
  }
  resolve(e) {
    return ct.resolveCached(this, e);
  }
  resolveNoCache(e) {
    return ct.resolve(this, e);
  }
  rangeHasMark(e, t, n) {
    let i = !1;
    return t > e && this.nodesBetween(e, t, (s) => (n.isInSet(s.marks) && (i = !0), !i)), i;
  }
  get isBlock() {
    return this.type.isBlock;
  }
  get isTextblock() {
    return this.type.isTextblock;
  }
  get inlineContent() {
    return this.type.inlineContent;
  }
  get isInline() {
    return this.type.isInline;
  }
  get isText() {
    return this.type.isText;
  }
  get isLeaf() {
    return this.type.isLeaf;
  }
  get isAtom() {
    return this.type.isAtom;
  }
  toString() {
    if (this.type.spec.toDebugString) return this.type.spec.toDebugString(this);
    let e = this.type.name;
    return this.content.size && (e += '(' + this.content.toStringInner() + ')'), yi(this.marks, e);
  }
  contentMatchAt(e) {
    let t = this.type.contentMatch.matchFragment(this.content, 0, e);
    if (!t) throw new Error('Called contentMatchAt on a node with invalid content');
    return t;
  }
  canReplace(e, t, n = k.empty, i = 0, s = n.childCount) {
    let o = this.contentMatchAt(e).matchFragment(n, i, s),
      l = o && o.matchFragment(this.content, t);
    if (!l || !l.validEnd) return !1;
    for (let a = i; a < s; a++) if (!this.type.allowsMarks(n.child(a).marks)) return !1;
    return !0;
  }
  canReplaceWith(e, t, n, i) {
    if (i && !this.type.allowsMarks(i)) return !1;
    let s = this.contentMatchAt(e).matchType(n),
      o = s && s.matchFragment(this.content, t);
    return o ? o.validEnd : !1;
  }
  canAppend(e) {
    return e.content.size
      ? this.canReplace(this.childCount, this.childCount, e.content)
      : this.type.compatibleContent(e.type);
  }
  check() {
    this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
    let e = D.none;
    for (let t = 0; t < this.marks.length; t++) {
      let n = this.marks[t];
      n.type.checkAttrs(n.attrs), (e = n.addToSet(e));
    }
    if (!D.sameSet(e, this.marks))
      throw new RangeError(
        `Invalid collection of marks for node ${this.type.name}: ${this.marks.map(
          (t) => t.type.name,
        )}`,
      );
    this.content.forEach((t) => t.check());
  }
  toJSON() {
    let e = {
      type: this.type.name,
    };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return (
      this.content.size && (e.content = this.content.toJSON()),
      this.marks.length && (e.marks = this.marks.map((t) => t.toJSON())),
      e
    );
  }
  static fromJSON(e, t) {
    if (!t) throw new RangeError('Invalid input for Node.fromJSON');
    let n;
    if (t.marks) {
      if (!Array.isArray(t.marks)) throw new RangeError('Invalid mark data for Node.fromJSON');
      n = t.marks.map(e.markFromJSON);
    }
    if (t.type == 'text') {
      if (typeof t.text != 'string') throw new RangeError('Invalid text node in JSON');
      return e.text(t.text, n);
    }
    let i = k.fromJSON(e, t.content),
      s = e.nodeType(t.type).create(t.attrs, i, n);
    return s.type.checkAttrs(s.attrs), s;
  }
};
ye.prototype.text = void 0;
class Rt extends ye {
  constructor(e, t, n, i) {
    if ((super(e, t, null, i), !n)) throw new RangeError('Empty text nodes are not allowed');
    this.text = n;
  }

  toString() {
    return this.type.spec.toDebugString
      ? this.type.spec.toDebugString(this)
      : yi(this.marks, JSON.stringify(this.text));
  }

  get textContent() {
    return this.text;
  }

  textBetween(e, t) {
    return this.text.slice(e, t);
  }

  get nodeSize() {
    return this.text.length;
  }

  mark(e) {
    return e == this.marks ? this : new Rt(this.type, this.attrs, this.text, e);
  }

  withText(e) {
    return e == this.text ? this : new Rt(this.type, this.attrs, e, this.marks);
  }

  cut(e = 0, t = this.text.length) {
    return e == 0 && t == this.text.length ? this : this.withText(this.text.slice(e, t));
  }

  eq(e) {
    return this.sameMarkup(e) && this.text == e.text;
  }

  toJSON() {
    let e = super.toJSON();
    return (e.text = this.text), e;
  }
}
function yi(r, e) {
  for (let t = r.length - 1; t >= 0; t--) e = r[t].type.name + '(' + e + ')';
  return e;
}
class ze {
  constructor(e) {
    (this.validEnd = e), (this.next = []), (this.wrapCache = []);
  }

  static parse(e, t) {
    let n = new Hs(e, t);
    if (n.next == undefined) return ze.empty;
    let i = ki(n);
    n.next && n.err('Unexpected trailing text');
    let s = Qs(Zs(i));
    return eo(s, n), s;
  }

  matchType(e) {
    for (let t = 0; t < this.next.length; t++) if (this.next[t].type == e) return this.next[t].next;
    return null;
  }

  matchFragment(e, t = 0, n = e.childCount) {
    let i = this;
    for (let s = t; i && s < n; s++) i = i.matchType(e.child(s).type);
    return i;
  }

  get inlineContent() {
    return this.next.length > 0 && this.next[0].type.isInline;
  }

  get defaultType() {
    for (let e = 0; e < this.next.length; e++) {
      let { type: t } = this.next[e];
      if (!(t.isText || t.hasRequiredAttrs())) return t;
    }
    return null;
  }

  compatible(e) {
    for (let t = 0; t < this.next.length; t++)
      for (let n = 0; n < e.next.length; n++) if (this.next[t].type == e.next[n].type) return !0;
    return !1;
  }

  fillBefore(e, t = !1, n = 0) {
    let i = [this];
    function s(o, l) {
      let a = o.matchFragment(e, n);
      if (a && (!t || a.validEnd)) return k.from(l.map((c) => c.createAndFill()));
      for (let c = 0; c < o.next.length; c++) {
        let { type: f, next: d } = o.next[c];
        if (!(f.isText || f.hasRequiredAttrs()) && !i.includes(d)) {
          i.push(d);
          let u = s(d, l.concat(f));
          if (u) return u;
        }
      }
      return null;
    }
    return s(this, []);
  }

  findWrapping(e) {
    for (let n = 0; n < this.wrapCache.length; n += 2)
      if (this.wrapCache[n] == e) return this.wrapCache[n + 1];
    let t = this.computeWrapping(e);
    return this.wrapCache.push(e, t), t;
  }

  computeWrapping(e) {
    let t = Object.create(null),
      n = [
        {
          match: this,
          type: null,
          via: null,
        },
      ];
    for (; n.length > 0; ) {
      let i = n.shift(),
        s = i.match;
      if (s.matchType(e)) {
        let o = [];
        for (let l = i; l.type; l = l.via) o.push(l.type);
        return o.reverse();
      }
      for (let o = 0; o < s.next.length; o++) {
        let { type: l, next: a } = s.next[o];
        !l.isLeaf &&
          !l.hasRequiredAttrs() &&
          !(l.name in t) &&
          (!i.type || a.validEnd) &&
          (n.push({
            match: l.contentMatch,
            type: l,
            via: i,
          }),
          (t[l.name] = !0));
      }
    }
    return null;
  }

  get edgeCount() {
    return this.next.length;
  }

  edge(e) {
    if (e >= this.next.length) throw new RangeError(`There's no ${e}th edge in this content match`);
    return this.next[e];
  }

  toString() {
    let e = [];
    function t(n) {
      e.push(n);
      for (let i = 0; i < n.next.length; i++) e.indexOf(n.next[i].next) == -1 && t(n.next[i].next);
    }
    return (
      t(this),
      e.map((n, i) => {
        let s = i + (n.validEnd ? '*' : ' ') + ' ';
        for (let o = 0; o < n.next.length; o++)
          s += (o ? ', ' : '') + n.next[o].type.name + '->' + e.indexOf(n.next[o].next);
        return s;
      }).join(`
`)
    );
  }
}
ze.empty = new ze(!0);
class Hs {
  constructor(e, t) {
    (this.string = e),
      (this.nodeTypes = t),
      (this.inline = null),
      (this.pos = 0),
      (this.tokens = e.split(/\s*(?=\b|\W|$)/)),
      this.tokens.at(-1) == '' && this.tokens.pop(),
      this.tokens[0] == '' && this.tokens.shift();
  }

  get next() {
    return this.tokens[this.pos];
  }

  eat(e) {
    return this.next == e && (this.pos++ || !0);
  }

  err(e) {
    throw new SyntaxError(e + " (in content expression '" + this.string + "')");
  }
}
function ki(r) {
  const e = [];
  do e.push(Us(r));
  while (r.eat('|'));
  return e.length == 1
    ? e[0]
    : {
        type: 'choice',
        exprs: e,
      };
}
function Us(r) {
  const e = [];
  do e.push(Gs(r));
  while (r.next && r.next != ')' && r.next != '|');
  return e.length == 1
    ? e[0]
    : {
        type: 'seq',
        exprs: e,
      };
}
function Gs(r) {
  let e = _s(r);
  for (;;)
    if (r.eat('+'))
      e = {
        type: 'plus',
        expr: e,
      };
    else if (r.eat('*'))
      e = {
        type: 'star',
        expr: e,
      };
    else if (r.eat('?'))
      e = {
        type: 'opt',
        expr: e,
      };
    else if (r.eat('{')) e = Ys(r, e);
    else break;
  return e;
}
function or(r) {
  /\D/.test(r.next) && r.err("Expected number, got '" + r.next + "'");
  const e = Number(r.next);
  return r.pos++, e;
}
function Ys(r, e) {
  let t = or(r);
  let n = t;
  return (
    r.eat(',') && (r.next == '}' ? (n = -1) : (n = or(r))),
    r.eat('}') || r.err('Unclosed braced range'),
    {
      type: 'range',
      min: t,
      max: n,
      expr: e,
    }
  );
}
function Xs(r, e) {
  const t = r.nodeTypes,
    n = t[e];
  if (n) return [n];
  const i = [];
  for (const s in t) {
    let o = t[s];
    o.groups.indexOf(e) > -1 && i.push(o);
  }
  return i.length === 0 && r.err("No node type or group '" + e + "' found"), i;
}
function _s(r) {
  if (r.eat('(')) {
    let e = ki(r);
    return r.eat(')') || r.err('Missing closing paren'), e;
  } else if (/\W/.test(r.next)) r.err("Unexpected token '" + r.next + "'");
  else {
    let e = Xs(r, r.next).map(
      (t) => (
        r.inline == undefined
          ? (r.inline = t.isInline)
          : r.inline != t.isInline && r.err('Mixing inline and block content'),
        {
          type: 'name',
          value: t,
        }
      ),
    );
    return (
      r.pos++,
      e.length == 1
        ? e[0]
        : {
            type: 'choice',
            exprs: e,
          }
    );
  }
}
function Zs(r) {
  const e = [[]];
  return i(s(r, 0), t()), e;
  function t() {
    return e.push([]) - 1;
  }
  function n(o, l, a) {
    let c = {
      term: a,
      to: l,
    };
    return e[o].push(c), c;
  }
  function i(o, l) {
    o.forEach((a) => (a.to = l));
  }
  function s(o, l) {
    if (o.type == 'choice') return o.exprs.reduce((a, c) => a.concat(s(c, l)), []);
    if (o.type == 'seq')
      for (let a = 0; ; a++) {
        let c = s(o.exprs[a], l);
        if (a == o.exprs.length - 1) return c;
        i(c, (l = t()));
      }
    else if (o.type == 'star') {
      let a = t();
      return n(l, a), i(s(o.expr, a), a), [n(a)];
    } else if (o.type == 'plus') {
      let a = t();
      return i(s(o.expr, l), a), i(s(o.expr, a), a), [n(a)];
    } else {
      if (o.type == 'opt') return [n(l)].concat(s(o.expr, l));
      if (o.type == 'range') {
        let a = l;
        for (let c = 0; c < o.min; c++) {
          let f = t();
          i(s(o.expr, a), f), (a = f);
        }
        if (o.max == -1) i(s(o.expr, a), a);
        else
          for (let c = o.min; c < o.max; c++) {
            let f = t();
            n(a, f), i(s(o.expr, a), f), (a = f);
          }
        return [n(a)];
      } else {
        if (o.type == 'name') return [n(l, void 0, o.value)];
        throw new Error('Unknown expr type');
      }
    }
  }
}
function bi(r, e) {
  return e - r;
}
function lr(r, e) {
  const t = [];
  return n(e), t.sort(bi);
  function n(i) {
    let s = r[i];
    if (s.length == 1 && !s[0].term) return n(s[0].to);
    t.push(i);
    for (let { term: l, to: a } of s) {
      !l && !t.includes(a) && n(a);
    }
  }
}
function Qs(r) {
  const e = Object.create(null);
  return t(lr(r, 0));
  function t(n) {
    let i = [];
    n.forEach((o) => {
      r[o].forEach(({ term: l, to: a }) => {
        if (!l) return;
        let c;
        for (let f = 0; f < i.length; f++) i[f][0] == l && (c = i[f][1]);
        lr(r, a).forEach((f) => {
          c || i.push([l, (c = [])]), c.indexOf(f) == -1 && c.push(f);
        });
      });
    });
    let s = (e[n.join(',')] = new ze(n.includes(r.length - 1)));
    for (const element of i) {
      let l = element[1].sort(bi);
      s.next.push({
        type: element[0],
        next: e[l.join(',')] || t(l),
      });
    }
    return s;
  }
}
function eo(r, e) {
  for (let t = 0, n = [r]; t < n.length; t++) {
    let i = n[t],
      s = !i.validEnd,
      o = [];
    for (let l = 0; l < i.next.length; l++) {
      let { type: a, next: c } = i.next[l];
      o.push(a.name),
        s && !(a.isText || a.hasRequiredAttrs()) && (s = !1),
        n.indexOf(c) == -1 && n.push(c);
    }
    s &&
      e.err(
        'Only non-generatable nodes (' +
          o.join(', ') +
          ') in a required position (see https://prosemirror.net/docs/guide/#generatable)',
      );
  }
}
function xi(r) {
  const e = Object.create(null);
  for (const t in r) {
    let n = r[t];
    if (!n.hasDefault) return null;
    e[t] = n.default;
  }
  return e;
}
function Si(r, e) {
  const t = Object.create(null);
  for (const n in r) {
    let i = e && e[n];
    if (i === void 0) {
      let s = r[n];
      if (s.hasDefault) i = s.default;
      else throw new RangeError('No value supplied for attribute ' + n);
    }
    t[n] = i;
  }
  return t;
}
function Mi(r, e, t, n) {
  for (const i in e)
    if (!(i in r)) throw new RangeError(`Unsupported attribute ${i} for ${t} of type ${i}`);
  for (const i in r) {
    let s = r[i];
    s.validate && s.validate(e[i]);
  }
}
function Ci(r) {
  const e = Object.create(null);
  if (r) for (const t in r) e[t] = new no(r[t]);
  return e;
}
const ar = class wi {
  constructor(e, t, n) {
    (this.name = e),
      (this.schema = t),
      (this.spec = n),
      (this.markSet = null),
      (this.groups = n.group ? n.group.split(' ') : []),
      (this.attrs = Ci(n.attrs)),
      (this.defaultAttrs = xi(this.attrs)),
      (this.contentMatch = null),
      (this.inlineContent = null),
      (this.isBlock = !(n.inline || e == 'text')),
      (this.isText = e == 'text');
  }
  get isInline() {
    return !this.isBlock;
  }
  get isTextblock() {
    return this.isBlock && this.inlineContent;
  }
  get isLeaf() {
    return this.contentMatch == ze.empty;
  }
  get isAtom() {
    return this.isLeaf || !!this.spec.atom;
  }
  get whitespace() {
    return this.spec.whitespace || (this.spec.code ? 'pre' : 'normal');
  }
  hasRequiredAttrs() {
    for (let e in this.attrs) if (this.attrs[e].isRequired) return !0;
    return !1;
  }
  compatibleContent(e) {
    return this == e || this.contentMatch.compatible(e.contentMatch);
  }
  computeAttrs(e) {
    return !e && this.defaultAttrs ? this.defaultAttrs : Si(this.attrs, e);
  }
  create(e = null, t, n) {
    if (this.isText) throw new Error("NodeType.create can't construct text nodes");
    return new ye(this, this.computeAttrs(e), k.from(t), D.setFrom(n));
  }
  createChecked(e = null, t, n) {
    return (
      (t = k.from(t)), this.checkContent(t), new ye(this, this.computeAttrs(e), t, D.setFrom(n))
    );
  }
  createAndFill(e = null, t, n) {
    if (((e = this.computeAttrs(e)), (t = k.from(t)), t.size)) {
      let o = this.contentMatch.fillBefore(t);
      if (!o) return null;
      t = o.append(t);
    }
    let i = this.contentMatch.matchFragment(t),
      s = i && i.fillBefore(k.empty, !0);
    return s ? new ye(this, e, t.append(s), D.setFrom(n)) : null;
  }
  validContent(e) {
    let t = this.contentMatch.matchFragment(e);
    if (!t || !t.validEnd) return !1;
    for (let n = 0; n < e.childCount; n++) if (!this.allowsMarks(e.child(n).marks)) return !1;
    return !0;
  }
  checkContent(e) {
    if (!this.validContent(e))
      throw new RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
  }
  checkAttrs(e) {
    Mi(this.attrs, e, 'node', this.name);
  }
  allowsMarkType(e) {
    return this.markSet == null || this.markSet.indexOf(e) > -1;
  }
  allowsMarks(e) {
    if (this.markSet == null) return !0;
    for (let t = 0; t < e.length; t++) if (!this.allowsMarkType(e[t].type)) return !1;
    return !0;
  }
  allowedMarks(e) {
    if (this.markSet == null) return e;
    let t;
    for (let n = 0; n < e.length; n++)
      this.allowsMarkType(e[n].type) ? t && t.push(e[n]) : t || (t = e.slice(0, n));
    return t ? (t.length ? t : D.none) : e;
  }
  static compile(e, t) {
    let n = Object.create(null);
    e.forEach((s, o) => (n[s] = new wi(s, t, o)));
    let i = t.spec.topNode || 'doc';
    if (!n[i]) throw new RangeError("Schema is missing its top node type ('" + i + "')");
    if (!n.text) throw new RangeError("Every schema needs a 'text' type");
    for (let s in n.text.attrs)
      throw new RangeError('The text node type should not have attributes');
    return n;
  }
};
function to(r) {
  const e = r.split('|');
  return (t) => {
    let n = t === null ? 'null' : typeof t;
    if (!e.includes(n)) throw new RangeError(`Expected value of type ${e}, got ${n}`);
  };
}
class no {
  constructor(e) {
    (this.hasDefault = Object.prototype.hasOwnProperty.call(e, 'default')),
      (this.default = e.default),
      (this.validate = typeof e.validate === 'string' ? to(e.validate) : e.validate);
  }

  get isRequired() {
    return !this.hasDefault;
  }
}
class qt {
  constructor(e, t, n, i) {
    (this.name = e),
      (this.rank = t),
      (this.schema = n),
      (this.spec = i),
      (this.attrs = Ci(i.attrs)),
      (this.excluded = null);
    let s = xi(this.attrs);
    this.instance = s ? new D(this, s) : null;
  }

  create(e = null) {
    return !e && this.instance ? this.instance : new D(this, Si(this.attrs, e));
  }

  static compile(e, t) {
    let n = Object.create(null),
      i = 0;
    return e.forEach((s, o) => (n[s] = new qt(s, i++, t, o))), n;
  }

  removeFromSet(e) {
    for (let t = 0; t < e.length; t++)
      e[t].type == this && ((e = e.slice(0, t).concat(e.slice(t + 1))), t--);
    return e;
  }

  isInSet(e) {
    for (let t = 0; t < e.length; t++) if (e[t].type == this) return e[t];
  }

  checkAttrs(e) {
    Mi(this.attrs, e, 'mark', this.name);
  }

  excludes(e) {
    return this.excluded.includes(e);
  }
}
class Oi {
  constructor(e) {
    (this.linebreakReplacement = null), (this.cached = Object.create(null));
    let t = (this.spec = {});
    for (const i in e) t[i] = e[i];
    (t.nodes = F.from(e.nodes)),
      (t.marks = F.from(e.marks || {})),
      (this.nodes = ar.compile(this.spec.nodes, this)),
      (this.marks = qt.compile(this.spec.marks, this));
    let n = Object.create(null);
    for (const i in this.nodes) {
      if (i in this.marks) throw new RangeError(i + ' can not be both a node and a mark');
      let s = this.nodes[i],
        o = s.spec.content || '',
        l = s.spec.marks;
      if (
        ((s.contentMatch = n[o] || (n[o] = ze.parse(o, this.nodes))),
        (s.inlineContent = s.contentMatch.inlineContent),
        s.spec.linebreakReplacement)
      ) {
        if (this.linebreakReplacement) throw new RangeError('Multiple linebreak nodes defined');
        if (!s.isInline || !s.isLeaf)
          throw new RangeError('Linebreak replacement nodes must be inline leaf nodes');
        this.linebreakReplacement = s;
      }
      s.markSet =
        l == '_' ? null : l ? cr(this, l.split(' ')) : l == '' || !s.inlineContent ? [] : null;
    }
    for (const i in this.marks) {
      let s = this.marks[i],
        o = s.spec.excludes;
      s.excluded = o == undefined ? [s] : o == '' ? [] : cr(this, o.split(' '));
    }
    (this.nodeFromJSON = this.nodeFromJSON.bind(this)),
      (this.markFromJSON = this.markFromJSON.bind(this)),
      (this.topNodeType = this.nodes[this.spec.topNode || 'doc']),
      (this.cached.wrappings = Object.create(null));
  }

  node(e, t = null, n, i) {
    if (typeof e === 'string') e = this.nodeType(e);
    else if (e instanceof ar) {
      if (e.schema != this)
        throw new RangeError('Node type from different schema used (' + e.name + ')');
    } else throw new RangeError('Invalid node type: ' + e);
    return e.createChecked(t, n, i);
  }

  text(e, t) {
    let n = this.nodes.text;
    return new Rt(n, n.defaultAttrs, e, D.setFrom(t));
  }

  mark(e, t) {
    return typeof e === 'string' && (e = this.marks[e]), e.create(t);
  }

  nodeFromJSON(e) {
    return ye.fromJSON(this, e);
  }

  markFromJSON(e) {
    return D.fromJSON(this, e);
  }

  nodeType(e) {
    let t = this.nodes[e];
    console.log(this.nodes);

    if (!t) throw new RangeError('Unknown node type: ' + e);
    return t;
  }
}
function cr(r, e) {
  const t = [];
  for (let i of e) {
    let s = r.marks[i],
      o = s;
    if (s) t.push(s);
    else
      for (let l in r.marks) {
        let a = r.marks[l];
        (i == '_' || (a.spec.group && a.spec.group.split(' ').indexOf(i) > -1)) && t.push((o = a));
      }
    if (!o) throw new SyntaxError("Unknown mark type: '" + i + "'");
  }
  return t;
}
function ro(r) {
  return r.tag != undefined;
}
function io(r) {
  return r.style != undefined;
}
class Ge {
  constructor(e, t) {
    (this.schema = e), (this.rules = t), (this.tags = []), (this.styles = []);
    let n = (this.matchedStyles = []);
    t.forEach((i) => {
      if (ro(i)) this.tags.push(i);
      else if (io(i)) {
        let s = /[^=]*/.exec(i.style)[0];
        n.indexOf(s) < 0 && n.push(s), this.styles.push(i);
      }
    }),
      (this.normalizeLists = !this.tags.some((i) => {
        if (!/^(ul|ol)\b/.test(i.tag) || !i.node) return !1;
        let s = e.nodes[i.node];
        return s.contentMatch.matchType(s);
      }));
  }

  parse(e, t = {}) {
    let n = new dr(this, t, !1);
    return n.addAll(e, t.from, t.to), n.finish();
  }

  parseSlice(e, t = {}) {
    let n = new dr(this, t, !0);
    return n.addAll(e, t.from, t.to), b.maxOpen(n.finish());
  }

  matchTag(e, t, n) {
    for (let i = n ? this.tags.indexOf(n) + 1 : 0; i < this.tags.length; i++) {
      let s = this.tags[i];
      if (
        lo(e, s.tag) &&
        (s.namespace === void 0 || e.namespaceURI == s.namespace) &&
        (!s.context || t.matchesContext(s.context))
      ) {
        if (s.getAttrs) {
          let o = s.getAttrs(e);
          if (o === !1) continue;
          s.attrs = o || void 0;
        }
        return s;
      }
    }
  }

  matchStyle(e, t, n, i) {
    for (let s = i ? this.styles.indexOf(i) + 1 : 0; s < this.styles.length; s++) {
      let o = this.styles[s],
        l = o.style;
      if (
        !(
          l.indexOf(e) != 0 ||
          (o.context && !n.matchesContext(o.context)) ||
          (l.length > e.length && (l.charCodeAt(e.length) != 61 || l.slice(e.length + 1) != t))
        )
      ) {
        if (o.getAttrs) {
          let a = o.getAttrs(t);
          if (a === !1) continue;
          o.attrs = a || void 0;
        }
        return o;
      }
    }
  }

  static schemaRules(e) {
    let t = [];
    function n(i) {
      let s = i.priority == undefined ? 50 : i.priority,
        o = 0;
      for (; o < t.length; o++) {
        let l = t[o];
        if ((l.priority == undefined ? 50 : l.priority) < s) break;
      }
      t.splice(o, 0, i);
    }
    for (const i in e.marks) {
      let s = e.marks[i].spec.parseDOM;
      s &&
        s.forEach((o) => {
          n((o = ur(o))), o.mark || o.ignore || o.clearMark || (o.mark = i);
        });
    }
    for (const i in e.nodes) {
      let s = e.nodes[i].spec.parseDOM;
      s &&
        s.forEach((o) => {
          n((o = ur(o))), o.node || o.ignore || o.mark || (o.node = i);
        });
    }
    return t;
  }

  static fromSchema(e) {
    return e.cached.domParser || (e.cached.domParser = new Ge(e, Ge.schemaRules(e)));
  }
}
const Ni = {
    address: !0,
    article: !0,
    aside: !0,
    blockquote: !0,
    canvas: !0,
    dd: !0,
    div: !0,
    dl: !0,
    fieldset: !0,
    figcaption: !0,
    figure: !0,
    footer: !0,
    form: !0,
    h1: !0,
    h2: !0,
    h3: !0,
    h4: !0,
    h5: !0,
    h6: !0,
    header: !0,
    hgroup: !0,
    hr: !0,
    li: !0,
    noscript: !0,
    ol: !0,
    output: !0,
    p: !0,
    pre: !0,
    section: !0,
    table: !0,
    tfoot: !0,
    ul: !0,
  },
  so = {
    head: !0,
    noscript: !0,
    object: !0,
    script: !0,
    style: !0,
    title: !0,
  },
  Ti = {
    ol: !0,
    ul: !0,
  },
  Pt = 1,
  Bt = 2,
  st = 4;
function fr(r, e, t) {
  return e == null
    ? r && r.whitespace == 'pre'
      ? Pt | Bt
      : t & ~st
    : (e ? Pt : 0) | (e === 'full' ? Bt : 0);
}
class Mt {
  constructor(e, t, n, i, s, o, l) {
    (this.type = e),
      (this.attrs = t),
      (this.marks = n),
      (this.pendingMarks = i),
      (this.solid = s),
      (this.options = l),
      (this.content = []),
      (this.activeMarks = D.none),
      (this.stashMarks = []),
      (this.match = o || (l & st ? null : e.contentMatch));
  }

  findWrapping(e) {
    if (!this.match) {
      if (!this.type) return [];
      let t = this.type.contentMatch.fillBefore(k.from(e));
      if (t) this.match = this.type.contentMatch.matchFragment(t);
      else {
        let n = this.type.contentMatch;
        let i;
        return (i = n.findWrapping(e.type)) ? ((this.match = n), i) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }

  finish(e) {
    if (!(this.options & Pt)) {
      let n = this.content.at(-1),
        i;
      if (n && n.isText && (i = /[\t\n\u000c\r ]+$/.exec(n.text))) {
        let s = n;
        n.text.length == i[0].length
          ? this.content.pop()
          : (this.content[this.content.length - 1] = s.withText(
              s.text.slice(0, s.text.length - i[0].length),
            ));
      }
    }
    let t = k.from(this.content);
    return (
      !e && this.match && (t = t.append(this.match.fillBefore(k.empty, !0))),
      this.type ? this.type.create(this.attrs, t, this.marks) : t
    );
  }

  popFromStashMark(e) {
    for (let t = this.stashMarks.length - 1; t >= 0; t--)
      if (e.eq(this.stashMarks[t])) return this.stashMarks.splice(t, 1)[0];
  }

  applyPending(e) {
    for (let t = 0, n = this.pendingMarks; t < n.length; t++) {
      let i = n[t];
      (this.type ? this.type.allowsMarkType(i.type) : ao(i.type, e)) &&
        !i.isInSet(this.activeMarks) &&
        ((this.activeMarks = i.addToSet(this.activeMarks)),
        (this.pendingMarks = i.removeFromSet(this.pendingMarks)));
    }
  }

  inlineContext(e) {
    return this.type
      ? this.type.inlineContent
      : this.content.length > 0
      ? this.content[0].isInline
      : e.parentNode && !Ni.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class dr {
  constructor(e, t, n) {
    (this.parser = e), (this.options = t), (this.isOpen = n), (this.open = 0);
    let i = t.topNode;
    let s;
    let o = fr(null, t.preserveWhitespace, 0) | (n ? st : 0);
    i
      ? (s = new Mt(i.type, i.attrs, D.none, D.none, !0, t.topMatch || i.type.contentMatch, o))
      : n
      ? (s = new Mt(null, null, D.none, D.none, !0, null, o))
      : (s = new Mt(e.schema.topNodeType, null, D.none, D.none, !0, null, o)),
      (this.nodes = [s]),
      (this.find = t.findPositions),
      (this.needsBlock = !1);
  }

  get top() {
    return this.nodes[this.open];
  }

  addDOM(e) {
    e.nodeType == 3 ? this.addTextNode(e) : e.nodeType == 1 && this.addElement(e);
  }

  withStyleRules(e, t) {
    let n = e.style;
    if (!n || n.length === 0) return t();
    let i = this.readStyles(e.style);
    if (!i) return;
    let [s, o] = i,
      l = this.top;
    for (let a = 0; a < o.length; a++) this.removePendingMark(o[a], l);
    for (let a = 0; a < s.length; a++) this.addPendingMark(s[a]);
    t();
    for (let a = 0; a < s.length; a++) this.removePendingMark(s[a], l);
    for (let a = 0; a < o.length; a++) this.addPendingMark(o[a]);
  }

  addTextNode(e) {
    let t = e.nodeValue,
      n = this.top;
    if (n.options & Bt || n.inlineContext(e) || /[^\t\n\u000c\r ]/.test(t)) {
      if (n.options & Pt)
        n.options & Bt
          ? (t = t.replaceAll(
              /\r\n?/g,
              `
`,
            ))
          : (t = t.replaceAll(/\r?\n|\r/g, ' '));
      else if (
        ((t = t.replaceAll(/[\t\n\u000c\r ]+/g, ' ')),
        /^[ \t\r\n\u000c]/.test(t) && this.open == this.nodes.length - 1)
      ) {
        let i = n.content.at(-1),
          s = e.previousSibling;
        (!i || (s && s.nodeName == 'BR') || (i.isText && /[\t\n\u000c\r ]$/.test(i.text))) &&
          (t = t.slice(1));
      }
      t && this.insertNode(this.parser.schema.text(t)), this.findInText(e);
    } else this.findInside(e);
  }

  addElement(e, t) {
    let n = e.nodeName.toLowerCase();
    let i;
    Ti.hasOwnProperty(n) && this.parser.normalizeLists && oo(e);
    let s =
      (this.options.ruleFromNode && this.options.ruleFromNode(e)) ||
      (i = this.parser.matchTag(e, this, t));
    if (s ? s.ignore : so.hasOwnProperty(n)) this.findInside(e), this.ignoreFallback(e);
    else if (!s || s.skip || s.closeParent) {
      s && s.closeParent
        ? (this.open = Math.max(0, this.open - 1))
        : s && s.skip.nodeType && (e = s.skip);
      let o;
      let l = this.top;
      let a = this.needsBlock;
      if (Ni.hasOwnProperty(n))
        l.content.length && l.content[0].isInline && this.open && (this.open--, (l = this.top)),
          (o = !0),
          l.type || (this.needsBlock = !0);
      else if (!e.firstChild) {
        this.leafFallback(e);
        return;
      }
      s && s.skip ? this.addAll(e) : this.withStyleRules(e, () => this.addAll(e)),
        o && this.sync(l),
        (this.needsBlock = a);
    } else
      this.withStyleRules(e, () => {
        this.addElementByRule(e, s, s.consuming === !1 ? i : void 0);
      });
  }

  leafFallback(e) {
    e.nodeName == 'BR' &&
      this.top.type &&
      this.top.type.inlineContent &&
      this.addTextNode(
        e.ownerDocument.createTextNode(`
`),
      );
  }

  ignoreFallback(e) {
    e.nodeName == 'BR' &&
      (!this.top.type || !this.top.type.inlineContent) &&
      this.findPlace(this.parser.schema.text('-'));
  }

  readStyles(e) {
    let t = D.none,
      n = D.none;
    if (e.length > 0)
      for (let i = 0; i < this.parser.matchedStyles.length; i++) {
        let s = this.parser.matchedStyles[i],
          o = e.getPropertyValue(s);
        if (o)
          for (let l = void 0; ; ) {
            let a = this.parser.matchStyle(s, o, this, l);
            if (!a) break;
            if (a.ignore) return null;
            if (
              (a.clearMark
                ? this.top.pendingMarks.concat(this.top.activeMarks).forEach((c) => {
                    a.clearMark(c) && (n = c.addToSet(n));
                  })
                : (t = this.parser.schema.marks[a.mark].create(a.attrs).addToSet(t)),
              a.consuming === !1)
            )
              l = a;
            else break;
          }
      }
    return [t, n];
  }

  addElementByRule(e, t, n) {
    let i, s, o;
    t.node
      ? ((s = this.parser.schema.nodes[t.node]),
        s.isLeaf
          ? this.insertNode(s.create(t.attrs)) || this.leafFallback(e)
          : (i = this.enter(s, t.attrs || null, t.preserveWhitespace)))
      : ((o = this.parser.schema.marks[t.mark].create(t.attrs)), this.addPendingMark(o));
    let l = this.top;
    if (s && s.isLeaf) this.findInside(e);
    else if (n) this.addElement(e, n);
    else if (t.getContent)
      this.findInside(e), t.getContent(e, this.parser.schema).forEach((a) => this.insertNode(a));
    else {
      let a = e;
      typeof t.contentElement === 'string'
        ? (a = e.querySelector(t.contentElement))
        : typeof t.contentElement == 'function'
        ? (a = t.contentElement(e))
        : t.contentElement && (a = t.contentElement),
        this.findAround(e, a, !0),
        this.addAll(a);
    }
    i && this.sync(l) && this.open--, o && this.removePendingMark(o, l);
  }

  addAll(e, t, n) {
    let i = t || 0;
    for (
      let s = t ? e.childNodes[t] : e.firstChild, o = n == undefined ? null : e.childNodes[n];
      s != o;
      s = s.nextSibling, ++i
    )
      this.findAtPoint(e, i), this.addDOM(s);
    this.findAtPoint(e, i);
  }

  findPlace(e) {
    let t, n;
    for (let i = this.open; i >= 0; i--) {
      let s = this.nodes[i],
        o = s.findWrapping(e);
      if ((o && (!t || t.length > o.length) && ((t = o), (n = s), !o.length)) || s.solid) break;
    }
    if (!t) return !1;
    this.sync(n);
    for (let i = 0; i < t.length; i++) this.enterInner(t[i], null, !1);
    return !0;
  }

  insertNode(e) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let t = this.textblockFromContext();
      t && this.enterInner(t);
    }
    if (this.findPlace(e)) {
      this.closeExtra();
      let t = this.top;
      t.applyPending(e.type), t.match && (t.match = t.match.matchType(e.type));
      let n = t.activeMarks;
      for (let i = 0; i < e.marks.length; i++)
        (!t.type || t.type.allowsMarkType(e.marks[i].type)) && (n = e.marks[i].addToSet(n));
      return t.content.push(e.mark(n)), !0;
    }
    return !1;
  }

  enter(e, t, n) {
    let i = this.findPlace(e.create(t));
    return i && this.enterInner(e, t, !0, n), i;
  }

  enterInner(e, t = null, n = !1, i) {
    this.closeExtra();
    let s = this.top;
    s.applyPending(e), (s.match = s.match && s.match.matchType(e));
    let o = fr(e, i, s.options);
    s.options & st && s.content.length === 0 && (o |= st),
      this.nodes.push(new Mt(e, t, s.activeMarks, s.pendingMarks, n, null, o)),
      this.open++;
  }

  closeExtra(e = !1) {
    let t = this.nodes.length - 1;
    if (t > this.open) {
      for (; t > this.open; t--) this.nodes[t - 1].content.push(this.nodes[t].finish(e));
      this.nodes.length = this.open + 1;
    }
  }

  finish() {
    return (
      (this.open = 0),
      this.closeExtra(this.isOpen),
      this.nodes[0].finish(this.isOpen || this.options.topOpen)
    );
  }

  sync(e) {
    for (let t = this.open; t >= 0; t--) if (this.nodes[t] == e) return (this.open = t), !0;
    return !1;
  }

  get currentPos() {
    this.closeExtra();
    let e = 0;
    for (let t = this.open; t >= 0; t--) {
      let n = this.nodes[t].content;
      for (let i = n.length - 1; i >= 0; i--) e += n[i].nodeSize;
      t && e++;
    }
    return e;
  }

  findAtPoint(e, t) {
    if (this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].node == e && this.find[n].offset == t && (this.find[n].pos = this.currentPos);
  }

  findInside(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].pos == undefined &&
          e.nodeType == 1 &&
          e.contains(this.find[t].node) &&
          (this.find[t].pos = this.currentPos);
  }

  findAround(e, t, n) {
    if (e != t && this.find)
      for (let i = 0; i < this.find.length; i++)
        this.find[i].pos == undefined &&
          e.nodeType == 1 &&
          e.contains(this.find[i].node) &&
          t.compareDocumentPosition(this.find[i].node) & (n ? 2 : 4) &&
          (this.find[i].pos = this.currentPos);
  }

  findInText(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].node == e &&
          (this.find[t].pos = this.currentPos - (e.nodeValue.length - this.find[t].offset));
  }

  matchesContext(e) {
    if (e.includes('|')) return e.split(/\s*\|\s*/).some(this.matchesContext, this);
    let t = e.split('/'),
      n = this.options.context,
      i = !this.isOpen && (!n || n.parent.type == this.nodes[0].type),
      s = -(n ? n.depth + 1 : 0) + (i ? 0 : 1),
      o = (l, a) => {
        for (; l >= 0; l--) {
          let c = t[l];
          if (c == '') {
            if (l == t.length - 1 || l == 0) continue;
            for (; a >= s; a--) if (o(l - 1, a)) return !0;
            return !1;
          } else {
            let f =
              a > 0 || (a == 0 && i) ? this.nodes[a].type : n && a >= s ? n.node(a - s).type : null;
            if (!f || (f.name != c && !f.groups.includes(c))) return !1;
            a--;
          }
        }
        return !0;
      };
    return o(t.length - 1, this.open);
  }

  textblockFromContext() {
    let e = this.options.context;
    if (e)
      for (let t = e.depth; t >= 0; t--) {
        let n = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
        if (n && n.isTextblock && n.defaultAttrs) return n;
      }
    for (const t in this.parser.schema.nodes) {
      let n = this.parser.schema.nodes[t];
      if (n.isTextblock && n.defaultAttrs) return n;
    }
  }

  addPendingMark(e) {
    let t = co(e, this.top.pendingMarks);
    t && this.top.stashMarks.push(t), (this.top.pendingMarks = e.addToSet(this.top.pendingMarks));
  }

  removePendingMark(e, t) {
    for (let n = this.open; n >= 0; n--) {
      let i = this.nodes[n];
      if (i.pendingMarks.lastIndexOf(e) > -1) i.pendingMarks = e.removeFromSet(i.pendingMarks);
      else {
        i.activeMarks = e.removeFromSet(i.activeMarks);
        let o = i.popFromStashMark(e);
        o && i.type && i.type.allowsMarkType(o.type) && (i.activeMarks = o.addToSet(i.activeMarks));
      }
      if (i == t) break;
    }
  }
}
function oo(r) {
  for (let e = r.firstChild, t = null; e; e = e.nextSibling) {
    let n = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    n && Ti.hasOwnProperty(n) && t
      ? (t.appendChild(e), (e = t))
      : n == 'li'
      ? (t = e)
      : n && (t = null);
  }
}
function lo(r, e) {
  return (r.matches || r.msMatchesSelector || r.webkitMatchesSelector || r.mozMatchesSelector).call(
    r,
    e,
  );
}
function ur(r) {
  const e = {};
  for (const t in r) e[t] = r[t];
  return e;
}
function ao(r, e) {
  const t = e.schema.nodes;
  for (const n in t) {
    let i = t[n];
    if (!i.allowsMarkType(r)) continue;
    let s = [],
      o = (l) => {
        s.push(l);
        for (let a = 0; a < l.edgeCount; a++) {
          let { type: c, next: f } = l.edge(a);
          if (c == e || (!s.includes(f) && o(f))) return !0;
        }
      };
    if (o(i.contentMatch)) return !0;
  }
}
function co(r, e) {
  for (let t = 0; t < e.length; t++) if (r.eq(e[t])) return e[t];
}
class Le {
  constructor(e, t) {
    (this.nodes = e), (this.marks = t);
  }

  serializeFragment(e, t = {}, n) {
    n || (n = on(t).createDocumentFragment());
    let i = n,
      s = [];
    return (
      e.forEach((o) => {
        if (s.length > 0 || o.marks.length > 0) {
          let l = 0,
            a = 0;
          for (; l < s.length && a < o.marks.length; ) {
            let c = o.marks[a];
            if (!this.marks[c.type.name]) {
              a++;
              continue;
            }
            if (!c.eq(s[l][0]) || c.type.spec.spanning === !1) break;
            l++, a++;
          }
          for (; l < s.length; ) i = s.pop()[1];
          for (; a < o.marks.length; ) {
            let c = o.marks[a++],
              f = this.serializeMark(c, o.isInline, t);
            f && (s.push([c, i]), i.appendChild(f.dom), (i = f.contentDOM || f.dom));
          }
        }
        i.append(this.serializeNodeInner(o, t));
      }),
      n
    );
  }

  serializeNodeInner(e, t) {
    let { dom: n, contentDOM: i } = Nt(on(t), this.nodes[e.type.name](e), null, e.attrs);
    if (i) {
      if (e.isLeaf) throw new RangeError('Content hole not allowed in a leaf node spec');
      this.serializeFragment(e.content, t, i);
    }
    return n;
  }

  serializeNode(e, t = {}) {
    let n = this.serializeNodeInner(e, t);
    for (let i = e.marks.length - 1; i >= 0; i--) {
      let s = this.serializeMark(e.marks[i], e.isInline, t);
      s && ((s.contentDOM || s.dom).appendChild(n), (n = s.dom));
    }
    return n;
  }

  serializeMark(e, t, n = {}) {
    let i = this.marks[e.type.name];
    return i && Nt(on(n), i(e, t), null, e.attrs);
  }

  static renderSpec(e, t, n = null) {
    return Nt(e, t, n);
  }

  static fromSchema(e) {
    return (
      e.cached.domSerializer ||
      (e.cached.domSerializer = new Le(this.nodesFromSchema(e), this.marksFromSchema(e)))
    );
  }

  static nodesFromSchema(e) {
    let t = hr(e.nodes);
    return t.text || (t.text = (n) => n.text), t;
  }

  static marksFromSchema(e) {
    return hr(e.marks);
  }
}
function hr(r) {
  const e = {};
  for (const t in r) {
    let n = r[t].spec.toDOM;
    n && (e[t] = n);
  }
  return e;
}
function on(r) {
  return r.document || window.document;
}
const pr = new WeakMap();
function fo(r) {
  let e = pr.get(r);
  return e === void 0 && pr.set(r, (e = uo(r))), e;
}
function uo(r) {
  let e = null;
  function t(n) {
    if (n && typeof n === 'object')
      if (Array.isArray(n))
        if (typeof n[0] === 'string') e || (e = []), e.push(n);
        else for (let i = 0; i < n.length; i++) t(n[i]);
      else for (const i in n) t(n[i]);
  }
  return t(r), e;
}
function Nt(r, e, t, n) {
  if (typeof e === 'string')
    return {
      dom: r.createTextNode(e),
    };
  if (e.nodeType != undefined)
    return {
      dom: e,
    };
  if (e.dom && e.dom.nodeType != undefined) return e;
  let i = e[0];
  let s;
  if (typeof i !== 'string') throw new RangeError('Invalid array passed to renderSpec');
  if (n && (s = fo(n)) && s.includes(e))
    throw new RangeError(
      'Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.',
    );
  const o = i.indexOf(' ');
  o > 0 && ((t = i.slice(0, o)), (i = i.slice(o + 1)));
  let l;
  let a = t ? r.createElementNS(t, i) : r.createElement(i);
  let c = e[1];
  let f = 1;
  if (c && typeof c === 'object' && c.nodeType == undefined && !Array.isArray(c)) {
    f = 2;
    for (const d in c)
      if (c[d] != undefined) {
        let u = d.indexOf(' ');
        u > 0 ? a.setAttributeNS(d.slice(0, u), d.slice(u + 1), c[d]) : a.setAttribute(d, c[d]);
      }
  }
  for (let d = f; d < e.length; d++) {
    let u = e[d];
    if (u === 0) {
      if (d < e.length - 1 || d > f)
        throw new RangeError('Content hole must be the only child of its parent node');
      return {
        dom: a,
        contentDOM: a,
      };
    } else {
      let { dom: p, contentDOM: h } = Nt(r, u, t, n);
      if ((a.appendChild(p), h)) {
        if (l) throw new RangeError('Multiple content holes');
        l = h;
      }
    }
  }
  return {
    dom: a,
    contentDOM: l,
  };
}
const Ei = 65_535,
  Di = Math.pow(2, 16);
function ho(r, e) {
  return r + e * Di;
}
function mr(r) {
  return r & Ei;
}
function po(r) {
  return (r - (r & Ei)) / Di;
}
const Ai = 1,
  Ii = 2,
  Tt = 4,
  vi = 8;
class On {
  constructor(e, t, n) {
    (this.pos = e), (this.delInfo = t), (this.recover = n);
  }

  get deleted() {
    return (this.delInfo & vi) > 0;
  }

  get deletedBefore() {
    return (this.delInfo & (Ai | Tt)) > 0;
  }

  get deletedAfter() {
    return (this.delInfo & (Ii | Tt)) > 0;
  }

  get deletedAcross() {
    return (this.delInfo & Tt) > 0;
  }
}
class G {
  constructor(e, t = !1) {
    if (((this.ranges = e), (this.inverted = t), !e.length && G.empty)) return G.empty;
  }

  recover(e) {
    let t = 0,
      n = mr(e);
    if (!this.inverted)
      for (let i = 0; i < n; i++) t += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
    return this.ranges[n * 3] + t + po(e);
  }

  mapResult(e, t = 1) {
    return this._map(e, t, !1);
  }

  map(e, t = 1) {
    return this._map(e, t, !0);
  }

  _map(e, t, n) {
    let i = 0,
      s = this.inverted ? 2 : 1,
      o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? i : 0);
      if (a > e) break;
      let c = this.ranges[l + s],
        f = this.ranges[l + o],
        d = a + c;
      if (e <= d) {
        let u = c ? (e == a ? -1 : e == d ? 1 : t) : t,
          p = a + i + (u < 0 ? 0 : f);
        if (n) return p;
        let h = e == (t < 0 ? a : d) ? null : ho(l / 3, e - a),
          m = e == a ? Ii : e == d ? Ai : Tt;
        return (t < 0 ? e != a : e != d) && (m |= vi), new On(p, m, h);
      }
      i += f - c;
    }
    return n ? e + i : new On(e + i, 0, null);
  }

  touches(e, t) {
    let n = 0,
      i = mr(t),
      s = this.inverted ? 2 : 1,
      o = this.inverted ? 1 : 2;
    for (let l = 0; l < this.ranges.length; l += 3) {
      let a = this.ranges[l] - (this.inverted ? n : 0);
      if (a > e) break;
      let c = this.ranges[l + s],
        f = a + c;
      if (e <= f && l == i * 3) return !0;
      n += this.ranges[l + o] - c;
    }
    return !1;
  }

  forEach(e) {
    let t = this.inverted ? 2 : 1,
      n = this.inverted ? 1 : 2;
    for (let i = 0, s = 0; i < this.ranges.length; i += 3) {
      let o = this.ranges[i],
        l = o - (this.inverted ? s : 0),
        a = o + (this.inverted ? 0 : s),
        c = this.ranges[i + t],
        f = this.ranges[i + n];
      e(l, l + c, a, a + f), (s += f - c);
    }
  }

  invert() {
    return new G(this.ranges, !this.inverted);
  }

  toString() {
    return (this.inverted ? '-' : '') + JSON.stringify(this.ranges);
  }

  static offset(e) {
    return e == 0 ? G.empty : new G(e < 0 ? [0, -e, 0] : [0, 0, e]);
  }
}
G.empty = new G([]);
class ot {
  constructor(e = [], t, n = 0, i = e.length) {
    (this.maps = e), (this.mirror = t), (this.from = n), (this.to = i);
  }

  slice(e = 0, t = this.maps.length) {
    return new ot(this.maps, this.mirror, e, t);
  }

  copy() {
    return new ot([...this.maps], this.mirror && [...this.mirror], this.from, this.to);
  }

  appendMap(e, t) {
    (this.to = this.maps.push(e)), t != undefined && this.setMirror(this.maps.length - 1, t);
  }

  appendMapping(e) {
    for (let t = 0, n = this.maps.length; t < e.maps.length; t++) {
      let i = e.getMirror(t);
      this.appendMap(e.maps[t], i != undefined && i < t ? n + i : void 0);
    }
  }

  getMirror(e) {
    if (this.mirror) {
      for (let t = 0; t < this.mirror.length; t++)
        if (this.mirror[t] == e) return this.mirror[t + (t % 2 ? -1 : 1)];
    }
  }

  setMirror(e, t) {
    this.mirror || (this.mirror = []), this.mirror.push(e, t);
  }

  appendMappingInverted(e) {
    for (let t = e.maps.length - 1, n = this.maps.length + e.maps.length; t >= 0; t--) {
      let i = e.getMirror(t);
      this.appendMap(e.maps[t].invert(), i != undefined && i > t ? n - i - 1 : void 0);
    }
  }

  invert() {
    let e = new ot();
    return e.appendMappingInverted(this), e;
  }

  map(e, t = 1) {
    if (this.mirror) return this._map(e, t, !0);
    for (let n = this.from; n < this.to; n++) e = this.maps[n].map(e, t);
    return e;
  }

  mapResult(e, t = 1) {
    return this._map(e, t, !1);
  }

  _map(e, t, n) {
    let i = 0;
    for (let s = this.from; s < this.to; s++) {
      let o = this.maps[s],
        l = o.mapResult(e, t);
      if (l.recover != undefined) {
        let a = this.getMirror(s);
        if (a != undefined && a > s && a < this.to) {
          (s = a), (e = this.maps[a].recover(l.recover));
          continue;
        }
      }
      (i |= l.delInfo), (e = l.pos);
    }
    return n ? e : new On(e, i, null);
  }
}
const ln = Object.create(null);
class W {
  getMap() {
    return G.empty;
  }

  merge(e) {
    return null;
  }

  static fromJSON(e, t) {
    if (!t || !t.stepType) throw new RangeError('Invalid input for Step.fromJSON');
    let n = ln[t.stepType];
    if (!n) throw new RangeError(`No step type ${t.stepType} defined`);
    return n.fromJSON(e, t);
  }

  static jsonID(e, t) {
    if (e in ln) throw new RangeError('Duplicate use of step JSON ID ' + e);
    return (ln[e] = t), (t.prototype.jsonID = e), t;
  }
}
class v {
  constructor(e, t) {
    (this.doc = e), (this.failed = t);
  }

  static ok(e) {
    return new v(e, null);
  }

  static fail(e) {
    return new v(null, e);
  }

  static fromReplace(e, t, n, i) {
    try {
      return v.ok(e.replace(t, n, i));
    } catch (error) {
      if (error instanceof At) return v.fail(error.message);
      throw error;
    }
  }
}
function jn(r, e, t) {
  const n = [];
  for (let i = 0; i < r.childCount; i++) {
    let s = r.child(i);
    s.content.size && (s = s.copy(jn(s.content, e, s))), s.isInline && (s = e(s, t, i)), n.push(s);
  }
  return k.fromArray(n);
}
class pe extends W {
  constructor(e, t, n) {
    super(), (this.from = e), (this.to = t), (this.mark = n);
  }

  apply(e) {
    let t = e.slice(this.from, this.to),
      n = e.resolve(this.from),
      i = n.node(n.sharedDepth(this.to)),
      s = new b(
        jn(
          t.content,
          (o, l) =>
            !o.isAtom || !l.type.allowsMarkType(this.mark.type)
              ? o
              : o.mark(this.mark.addToSet(o.marks)),
          i,
        ),
        t.openStart,
        t.openEnd,
      );
    return v.fromReplace(e, this.from, this.to, s);
  }

  invert() {
    return new re(this.from, this.to, this.mark);
  }

  map(e) {
    let t = e.mapResult(this.from, 1),
      n = e.mapResult(this.to, -1);
    return (t.deleted && n.deleted) || t.pos >= n.pos ? null : new pe(t.pos, n.pos, this.mark);
  }

  merge(e) {
    return e instanceof pe && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from
      ? new pe(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark)
      : null;
  }

  toJSON() {
    return {
      stepType: 'addMark',
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to,
    };
  }

  static fromJSON(e, t) {
    if (typeof t.from !== 'number' || typeof t.to !== 'number')
      throw new RangeError('Invalid input for AddMarkStep.fromJSON');
    return new pe(t.from, t.to, e.markFromJSON(t.mark));
  }
}
W.jsonID('addMark', pe);
class re extends W {
  constructor(e, t, n) {
    super(), (this.from = e), (this.to = t), (this.mark = n);
  }

  apply(e) {
    let t = e.slice(this.from, this.to),
      n = new b(
        jn(t.content, (i) => i.mark(this.mark.removeFromSet(i.marks)), e),
        t.openStart,
        t.openEnd,
      );
    return v.fromReplace(e, this.from, this.to, n);
  }

  invert() {
    return new pe(this.from, this.to, this.mark);
  }

  map(e) {
    let t = e.mapResult(this.from, 1),
      n = e.mapResult(this.to, -1);
    return (t.deleted && n.deleted) || t.pos >= n.pos ? null : new re(t.pos, n.pos, this.mark);
  }

  merge(e) {
    return e instanceof re && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from
      ? new re(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark)
      : null;
  }

  toJSON() {
    return {
      stepType: 'removeMark',
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to,
    };
  }

  static fromJSON(e, t) {
    if (typeof t.from !== 'number' || typeof t.to !== 'number')
      throw new RangeError('Invalid input for RemoveMarkStep.fromJSON');
    return new re(t.from, t.to, e.markFromJSON(t.mark));
  }
}
W.jsonID('removeMark', re);
class me extends W {
  constructor(e, t) {
    super(), (this.pos = e), (this.mark = t);
  }

  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t) return v.fail("No node at mark step's position");
    let n = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
    return v.fromReplace(e, this.pos, this.pos + 1, new b(k.from(n), 0, t.isLeaf ? 0 : 1));
  }

  invert(e) {
    let t = e.nodeAt(this.pos);
    if (t) {
      let n = this.mark.addToSet(t.marks);
      if (n.length == t.marks.length) {
        for (let i = 0; i < t.marks.length; i++)
          if (!t.marks[i].isInSet(n)) return new me(this.pos, t.marks[i]);
        return new me(this.pos, this.mark);
      }
    }
    return new Ye(this.pos, this.mark);
  }

  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new me(t.pos, this.mark);
  }

  toJSON() {
    return {
      stepType: 'addNodeMark',
      pos: this.pos,
      mark: this.mark.toJSON(),
    };
  }

  static fromJSON(e, t) {
    if (typeof t.pos !== 'number')
      throw new RangeError('Invalid input for AddNodeMarkStep.fromJSON');
    return new me(t.pos, e.markFromJSON(t.mark));
  }
}
W.jsonID('addNodeMark', me);
class Ye extends W {
  constructor(e, t) {
    super(), (this.pos = e), (this.mark = t);
  }

  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t) return v.fail("No node at mark step's position");
    let n = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
    return v.fromReplace(e, this.pos, this.pos + 1, new b(k.from(n), 0, t.isLeaf ? 0 : 1));
  }

  invert(e) {
    let t = e.nodeAt(this.pos);
    return !t || !this.mark.isInSet(t.marks) ? this : new me(this.pos, this.mark);
  }

  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new Ye(t.pos, this.mark);
  }

  toJSON() {
    return {
      stepType: 'removeNodeMark',
      pos: this.pos,
      mark: this.mark.toJSON(),
    };
  }

  static fromJSON(e, t) {
    if (typeof t.pos !== 'number')
      throw new RangeError('Invalid input for RemoveNodeMarkStep.fromJSON');
    return new Ye(t.pos, e.markFromJSON(t.mark));
  }
}
W.jsonID('removeNodeMark', Ye);
class P extends W {
  constructor(e, t, n, i = !1) {
    super(), (this.from = e), (this.to = t), (this.slice = n), (this.structure = i);
  }

  apply(e) {
    return this.structure && Nn(e, this.from, this.to)
      ? v.fail('Structure replace would overwrite content')
      : v.fromReplace(e, this.from, this.to, this.slice);
  }

  getMap() {
    return new G([this.from, this.to - this.from, this.slice.size]);
  }

  invert(e) {
    return new P(this.from, this.from + this.slice.size, e.slice(this.from, this.to));
  }

  map(e) {
    let t = e.mapResult(this.from, 1),
      n = e.mapResult(this.to, -1);
    return t.deletedAcross && n.deletedAcross
      ? null
      : new P(t.pos, Math.max(t.pos, n.pos), this.slice);
  }

  merge(e) {
    if (!(e instanceof P) || e.structure || this.structure) return null;
    if (this.from + this.slice.size == e.from && !this.slice.openEnd && !e.slice.openStart) {
      let t =
        this.slice.size + e.slice.size == 0
          ? b.empty
          : new b(
              this.slice.content.append(e.slice.content),
              this.slice.openStart,
              e.slice.openEnd,
            );
      return new P(this.from, this.to + (e.to - e.from), t, this.structure);
    } else if (e.to == this.from && !this.slice.openStart && !e.slice.openEnd) {
      let t =
        this.slice.size + e.slice.size == 0
          ? b.empty
          : new b(
              e.slice.content.append(this.slice.content),
              e.slice.openStart,
              this.slice.openEnd,
            );
      return new P(e.from, this.to, t, this.structure);
    } else return null;
  }

  toJSON() {
    let e = {
      stepType: 'replace',
      from: this.from,
      to: this.to,
    };
    return (
      this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e
    );
  }

  static fromJSON(e, t) {
    if (typeof t.from !== 'number' || typeof t.to !== 'number')
      throw new RangeError('Invalid input for ReplaceStep.fromJSON');
    return new P(t.from, t.to, b.fromJSON(e, t.slice), !!t.structure);
  }
}
W.jsonID('replace', P);
class B extends W {
  constructor(e, t, n, i, s, o, l = !1) {
    super(),
      (this.from = e),
      (this.to = t),
      (this.gapFrom = n),
      (this.gapTo = i),
      (this.slice = s),
      (this.insert = o),
      (this.structure = l);
  }

  apply(e) {
    if (this.structure && (Nn(e, this.from, this.gapFrom) || Nn(e, this.gapTo, this.to)))
      return v.fail('Structure gap-replace would overwrite content');
    let t = e.slice(this.gapFrom, this.gapTo);
    if (t.openStart || t.openEnd) return v.fail('Gap is not a flat range');
    let n = this.slice.insertAt(this.insert, t.content);
    return n ? v.fromReplace(e, this.from, this.to, n) : v.fail('Content does not fit in gap');
  }

  getMap() {
    return new G([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert,
    ]);
  }

  invert(e) {
    let t = this.gapTo - this.gapFrom;
    return new B(
      this.from,
      this.from + this.slice.size + t,
      this.from + this.insert,
      this.from + this.insert + t,
      e.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from),
      this.gapFrom - this.from,
      this.structure,
    );
  }

  map(e) {
    let t = e.mapResult(this.from, 1),
      n = e.mapResult(this.to, -1),
      i = this.from == this.gapFrom ? t.pos : e.map(this.gapFrom, -1),
      s = this.to == this.gapTo ? n.pos : e.map(this.gapTo, 1);
    return (t.deletedAcross && n.deletedAcross) || i < t.pos || s > n.pos
      ? null
      : new B(t.pos, n.pos, i, s, this.slice, this.insert, this.structure);
  }

  toJSON() {
    let e = {
      stepType: 'replaceAround',
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert,
    };
    return (
      this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e
    );
  }

  static fromJSON(e, t) {
    if (
      typeof t.from !== 'number' ||
      typeof t.to !== 'number' ||
      typeof t.gapFrom !== 'number' ||
      typeof t.gapTo !== 'number' ||
      typeof t.insert !== 'number'
    )
      throw new RangeError('Invalid input for ReplaceAroundStep.fromJSON');
    return new B(t.from, t.to, t.gapFrom, t.gapTo, b.fromJSON(e, t.slice), t.insert, !!t.structure);
  }
}
W.jsonID('replaceAround', B);
function Nn(r, e, t) {
  let n = r.resolve(e);
  let i = t - e;
  let s = n.depth;
  for (; i > 0 && s > 0 && n.indexAfter(s) == n.node(s).childCount; ) s--, i--;
  if (i > 0) {
    let o = n.node(s).maybeChild(n.indexAfter(s));
    for (; i > 0; ) {
      if (!o || o.isLeaf) return !0;
      (o = o.firstChild), i--;
    }
  }
  return !1;
}
function mo(r, e, t, n) {
  let i = [];
  let s = [];
  let o;
  let l;
  r.doc.nodesBetween(e, t, (a, c, f) => {
    if (!a.isInline) return;
    let d = a.marks;
    if (!n.isInSet(d) && f.type.allowsMarkType(n.type)) {
      let u = Math.max(c, e),
        p = Math.min(c + a.nodeSize, t),
        h = n.addToSet(d);
      for (let m = 0; m < d.length; m++)
        d[m].isInSet(h) ||
          (o && o.to == u && o.mark.eq(d[m]) ? (o.to = p) : i.push((o = new re(u, p, d[m]))));
      l && l.to == u ? (l.to = p) : s.push((l = new pe(u, p, n)));
    }
  }),
    i.forEach((a) => r.step(a)),
    s.forEach((a) => r.step(a));
}
function go(r, e, t, n) {
  let i = [];
  let s = 0;
  r.doc.nodesBetween(e, t, (o, l) => {
    if (!o.isInline) return;
    s++;
    let a = null;
    if (n instanceof qt) {
      let c = o.marks;
      let f;
      for (; (f = n.isInSet(c)); ) (a || (a = [])).push(f), (c = f.removeFromSet(c));
    } else n ? n.isInSet(o.marks) && (a = [n]) : (a = o.marks);
    if (a && a.length > 0) {
      let c = Math.min(l + o.nodeSize, t);
      for (let d of a) {
        let u;
        for (let h of i) {
          h.step == s - 1 && d.eq(h.style) && (u = h);
        }
        u
          ? ((u.to = c), (u.step = s))
          : i.push({
              style: d,
              from: Math.max(l, e),
              to: c,
              step: s,
            });
      }
    }
  }),
    i.forEach((o) => r.step(new re(o.from, o.to, o.style)));
}
function Ri(r, e, t, n = t.contentMatch, i = !0) {
  let s = r.doc.nodeAt(e);
  let o = [];
  let l = e + 1;
  for (let a = 0; a < s.childCount; a++) {
    let c = s.child(a),
      f = l + c.nodeSize,
      d = n.matchType(c.type);
    if (d) {
      n = d;
      for (let u = 0; u < c.marks.length; u++)
        t.allowsMarkType(c.marks[u].type) || r.step(new re(l, f, c.marks[u]));
      if (i && c.isText && t.whitespace != 'pre') {
        let u,
          p = /\r?\n|\r/g,
          h;
        for (; (u = p.exec(c.text)); )
          h || (h = new b(k.from(t.schema.text(' ', t.allowedMarks(c.marks))), 0, 0)),
            o.push(new P(l + u.index, l + u.index + u[0].length, h));
      }
    } else {
      o.push(new P(l, f, b.empty));
    }
    l = f;
  }
  if (!n.validEnd) {
    let a = n.fillBefore(k.empty, !0);
    r.replace(l, l, new b(a, 0, 0));
  }
  for (let a = o.length - 1; a >= 0; a--) r.step(o[a]);
}
function yo(r, e, t) {
  return (e == 0 || r.canReplace(e, r.childCount)) && (t == r.childCount || r.canReplace(0, t));
}
function Qe(r) {
  const t = r.parent.content.cutByIndex(r.startIndex, r.endIndex);
  for (let n = r.depth; ; --n) {
    let i = r.$from.node(n),
      s = r.$from.index(n),
      o = r.$to.indexAfter(n);
    if (n < r.depth && i.canReplace(s, o, t)) return n;
    if (n == 0 || i.type.spec.isolating || !yo(i, s, o)) break;
  }
  return null;
}
function ko(r, e, t) {
  let { $from: n, $to: i, depth: s } = e;
  let o = n.before(s + 1);
  let l = i.after(s + 1);
  let a = o;
  let c = l;
  let f = k.empty;
  let d = 0;
  for (let h = s, m = !1; h > t; h--)
    m || n.index(h) > 0 ? ((m = !0), (f = k.from(n.node(h).copy(f))), d++) : a--;
  let u = k.empty;
  let p = 0;
  for (let h = s, m = !1; h > t; h--)
    m || i.after(h + 1) < i.end(h) ? ((m = !0), (u = k.from(i.node(h).copy(u))), p++) : c++;
  r.step(new B(a, c, o, l, new b(f.append(u), d, p), f.size - d, !0));
}
function qn(r, e, t = null, n = r) {
  const i = bo(r, e),
    s = i && xo(n, e);
  return s
    ? i
        .map(gr)
        .concat({
          type: e,
          attrs: t,
        })
        .concat(s.map(gr))
    : null;
}
function gr(r) {
  return {
    type: r,
    attrs: null,
  };
}
function bo(r, e) {
  let { parent: t, startIndex: n, endIndex: i } = r;
  let s = t.contentMatchAt(n).findWrapping(e);
  if (!s) return null;
  const o = s.length ? s[0] : e;
  return t.canReplaceWith(n, i, o) ? s : null;
}
function xo(r, e) {
  let { parent: t, startIndex: n, endIndex: i } = r;
  let s = t.child(n);
  let o = e.contentMatch.findWrapping(s.type);
  if (!o) return null;
  let a = (o.length > 0 ? o.at(-1) : e).contentMatch;
  for (let c = n; a && c < i; c++) a = a.matchType(t.child(c).type);
  return !a || !a.validEnd ? null : o;
}
function So(r, e, t) {
  let n = k.empty;
  for (let o = t.length - 1; o >= 0; o--) {
    if (n.size > 0) {
      let l = t[o].type.contentMatch.matchFragment(n);
      if (!l || !l.validEnd)
        throw new RangeError(
          'Wrapper type given to Transform.wrap does not form valid content of its parent wrapper',
        );
    }
    n = k.from(t[o].type.create(t[o].attrs, n));
  }
  const i = e.start,
    s = e.end;
  r.step(new B(i, s, i, s, new b(n, 0, 0), t.length, !0));
}
function Mo(r, e, t, n, i) {
  if (!n.isTextblock) throw new RangeError('Type given to setBlockType should be a textblock');
  const s = r.steps.length;
  r.doc.nodesBetween(e, t, (o, l) => {
    if (o.isTextblock && !o.hasMarkup(n, i) && Oo(r.doc, r.mapping.slice(s).map(l), n)) {
      let a = null;
      if (n.schema.linebreakReplacement) {
        let u = n.whitespace == 'pre',
          p = !!n.contentMatch.matchType(n.schema.linebreakReplacement);
        u && !p ? (a = !1) : !u && p && (a = !0);
      }
      a === !1 && wo(r, o, l, s), Ri(r, r.mapping.slice(s).map(l, 1), n, void 0, a === null);
      let c = r.mapping.slice(s),
        f = c.map(l, 1),
        d = c.map(l + o.nodeSize, 1);
      return (
        r.step(new B(f, d, f + 1, d - 1, new b(k.from(n.create(i, null, o.marks)), 0, 0), 1, !0)),
        a === !0 && Co(r, o, l, s),
        !1
      );
    }
  });
}
function Co(r, e, t, n) {
  for (const [s, i] of e.entries()) {
    if (i.isText) {
      let o,
        l = /\r?\n|\r/g;
      for (; (o = l.exec(i.text)); ) {
        let a = r.mapping.slice(n).map(t + 1 + s + o.index);
        r.replaceWith(a, a + 1, e.type.schema.linebreakReplacement.create());
      }
    }
  }
}
function wo(r, e, t, n) {
  for (const [s, i] of e.entries()) {
    if (i.type == i.type.schema.linebreakReplacement) {
      let o = r.mapping.slice(n).map(t + 1 + s);
      r.replaceWith(
        o,
        o + 1,
        e.type.schema.text(`
`),
      );
    }
  }
}
function Oo(r, e, t) {
  const n = r.resolve(e),
    i = n.index();
  return n.parent.canReplaceWith(i, i + 1, t);
}
function No(r, e, t, n, i) {
  const s = r.doc.nodeAt(e);
  if (!s) throw new RangeError('No node at given position');
  t || (t = s.type);
  const o = t.create(n, null, i || s.marks);
  if (s.isLeaf) return r.replaceWith(e, e + s.nodeSize, o);
  if (!t.validContent(s.content)) throw new RangeError('Invalid content for node type ' + t.name);
  r.step(new B(e, e + s.nodeSize, e + 1, e + s.nodeSize - 1, new b(k.from(o), 0, 0), 1, !0));
}
function Ke(r, e, t = 1, n) {
  const i = r.resolve(e),
    s = i.depth - t,
    o = (n && n[n.length - 1]) || i.parent;
  if (
    s < 0 ||
    i.parent.type.spec.isolating ||
    !i.parent.canReplace(i.index(), i.parent.childCount) ||
    !o.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount))
  )
    return !1;
  for (let c = i.depth - 1, f = t - 2; c > s; c--, f--) {
    let d = i.node(c),
      u = i.index(c);
    if (d.type.spec.isolating) return !1;
    let p = d.content.cutByIndex(u, d.childCount),
      h = n && n[f + 1];
    h && (p = p.replaceChild(0, h.type.create(h.attrs)));
    let m = (n && n[f]) || d;
    if (!d.canReplace(u + 1, d.childCount) || !m.type.validContent(p)) return !1;
  }
  const l = i.indexAfter(s),
    a = n && n[0];
  return i.node(s).canReplaceWith(l, l, a ? a.type : i.node(s + 1).type);
}
function To(r, e, t = 1, n) {
  let i = r.doc.resolve(e);
  let s = k.empty;
  let o = k.empty;
  for (let l = i.depth, a = i.depth - t, c = t - 1; l > a; l--, c--) {
    s = k.from(i.node(l).copy(s));
    let f = n && n[c];
    o = k.from(f ? f.type.create(f.attrs, o) : i.node(l).copy(o));
  }
  r.step(new P(e, e, new b(s.append(o), t, t), !0));
}
function Me(r, e) {
  const t = r.resolve(e),
    n = t.index();
  return Pi(t.nodeBefore, t.nodeAfter) && t.parent.canReplace(n, n + 1);
}
function Pi(r, e) {
  return !!(r && e && !r.isLeaf && r.canAppend(e));
}
function Kt(r, e, t = -1) {
  const n = r.resolve(e);
  for (let i = n.depth; ; i--) {
    let s;
    let o;
    let l = n.index(i);
    if (
      (i == n.depth
        ? ((s = n.nodeBefore), (o = n.nodeAfter))
        : t > 0
        ? ((s = n.node(i + 1)), l++, (o = n.node(i).maybeChild(l)))
        : ((s = n.node(i).maybeChild(l - 1)), (o = n.node(i + 1))),
      s && !s.isTextblock && Pi(s, o) && n.node(i).canReplace(l, l + 1))
    )
      return e;
    if (i == 0) break;
    e = t < 0 ? n.before(i) : n.after(i);
  }
}
function Eo(r, e, t) {
  const n = new P(e - t, e + t, b.empty, !0);
  r.step(n);
}
function Do(r, e, t) {
  const n = r.resolve(e);
  if (n.parent.canReplaceWith(n.index(), n.index(), t)) return e;
  if (n.parentOffset == 0)
    for (let i = n.depth - 1; i >= 0; i--) {
      let s = n.index(i);
      if (n.node(i).canReplaceWith(s, s, t)) return n.before(i + 1);
      if (s > 0) return null;
    }
  if (n.parentOffset == n.parent.content.size)
    for (let i = n.depth - 1; i >= 0; i--) {
      let s = n.indexAfter(i);
      if (n.node(i).canReplaceWith(s, s, t)) return n.after(i + 1);
      if (s < n.node(i).childCount) return null;
    }
  return null;
}
function Ao(r, e, t) {
  const n = r.resolve(e);
  if (t.content.size === 0) return e;
  let i = t.content;
  for (let s = 0; s < t.openStart; s++) i = i.firstChild.content;
  for (let s = 1; s <= (t.openStart == 0 && t.size > 0 ? 2 : 1); s++)
    for (let o = n.depth; o >= 0; o--) {
      let l = o == n.depth ? 0 : n.pos <= (n.start(o + 1) + n.end(o + 1)) / 2 ? -1 : 1,
        a = n.index(o) + (l > 0 ? 1 : 0),
        c = n.node(o),
        f = !1;
      if (s == 1) f = c.canReplace(a, a, i);
      else {
        let d = c.contentMatchAt(a).findWrapping(i.firstChild.type);
        f = d && c.canReplaceWith(a, a, d[0]);
      }
      if (f) return l == 0 ? n.pos : l < 0 ? n.before(o + 1) : n.after(o + 1);
    }
  return null;
}
function Ht(r, e, t = e, n = b.empty) {
  if (e == t && n.size === 0) return null;
  const i = r.resolve(e),
    s = r.resolve(t);
  return Bi(i, s, n) ? new P(e, t, n) : new Io(i, s, n).fit();
}
function Bi(r, e, t) {
  return (
    !t.openStart &&
    !t.openEnd &&
    r.start() == e.start() &&
    r.parent.canReplace(r.index(), e.index(), t.content)
  );
}
class Io {
  constructor(e, t, n) {
    (this.$from = e),
      (this.$to = t),
      (this.unplaced = n),
      (this.frontier = []),
      (this.placed = k.empty);
    for (let i = 0; i <= e.depth; i++) {
      let s = e.node(i);
      this.frontier.push({
        type: s.type,
        match: s.contentMatchAt(e.indexAfter(i)),
      });
    }
    for (let i = e.depth; i > 0; i--) this.placed = k.from(e.node(i).copy(this.placed));
  }

  get depth() {
    return this.frontier.length - 1;
  }

  fit() {
    for (; this.unplaced.size > 0; ) {
      let c = this.findFittable();
      c ? this.placeNodes(c) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(),
      t = this.placed.size - this.depth - this.$from.depth,
      n = this.$from,
      i = this.close(e < 0 ? this.$to : n.doc.resolve(e));
    if (!i) return null;
    let s = this.placed,
      o = n.depth,
      l = i.depth;
    for (; o && l && s.childCount == 1; ) (s = s.firstChild.content), o--, l--;
    let a = new b(s, o, l);
    return e > -1
      ? new B(n.pos, e, this.$to.pos, this.$to.end(), a, t)
      : a.size > 0 || n.pos != this.$to.pos
      ? new P(n.pos, i.pos, a)
      : null;
  }

  findFittable() {
    let e = this.unplaced.openStart;
    for (let t = this.unplaced.content, n = 0, i = this.unplaced.openEnd; n < e; n++) {
      let s = t.firstChild;
      if ((t.childCount > 1 && (i = 0), s.type.spec.isolating && i <= n)) {
        e = n;
        break;
      }
      t = s.content;
    }
    for (let t = 1; t <= 2; t++)
      for (let n = t == 1 ? e : this.unplaced.openStart; n >= 0; n--) {
        let i;
        let s = null;
        n
          ? ((s = an(this.unplaced.content, n - 1).firstChild), (i = s.content))
          : (i = this.unplaced.content);
        let o = i.firstChild;
        for (let l = this.depth; l >= 0; l--) {
          let { type: a, match: c } = this.frontier[l];
          let f;
          let d = null;
          if (
            t == 1 &&
            (o
              ? c.matchType(o.type) || (d = c.fillBefore(k.from(o), !1))
              : s && a.compatibleContent(s.type))
          )
            return {
              sliceDepth: n,
              frontierDepth: l,
              parent: s,
              inject: d,
            };
          if (t == 2 && o && (f = c.findWrapping(o.type)))
            return {
              sliceDepth: n,
              frontierDepth: l,
              parent: s,
              wrap: f,
            };
          if (s && c.matchType(s.type)) break;
        }
      }
  }

  openMore() {
    let { content: e, openStart: t, openEnd: n } = this.unplaced,
      i = an(e, t);
    return !i.childCount || i.firstChild.isLeaf
      ? !1
      : ((this.unplaced = new b(e, t + 1, Math.max(n, i.size + t >= e.size - n ? t + 1 : 0))), !0);
  }

  dropNode() {
    let { content: e, openStart: t, openEnd: n } = this.unplaced,
      i = an(e, t);
    if (i.childCount <= 1 && t > 0) {
      let s = e.size - t <= t + i.size;
      this.unplaced = new b(tt(e, t - 1, 1), t - 1, s ? t - 1 : n);
    } else this.unplaced = new b(tt(e, t, 1), t, n);
  }

  placeNodes({ sliceDepth: e, frontierDepth: t, parent: n, inject: i, wrap: s }) {
    for (; this.depth > t; ) this.closeFrontierNode();
    if (s) for (let m = 0; m < s.length; m++) this.openFrontierNode(s[m]);
    let o = this.unplaced,
      l = n ? n.content : o.content,
      a = o.openStart - e,
      c = 0,
      f = [],
      { match: d, type: u } = this.frontier[t];
    if (i) {
      for (let m = 0; m < i.childCount; m++) f.push(i.child(m));
      d = d.matchFragment(i);
    }
    let p = l.size + e - (o.content.size - o.openEnd);
    for (; c < l.childCount; ) {
      let m = l.child(c),
        g = d.matchType(m.type);
      if (!g) break;
      c++,
        (c > 1 || a == 0 || m.content.size) &&
          ((d = g),
          f.push(zi(m.mark(u.allowedMarks(m.marks)), c == 1 ? a : 0, c == l.childCount ? p : -1)));
    }
    let h = c == l.childCount;
    h || (p = -1),
      (this.placed = nt(this.placed, t, k.from(f))),
      (this.frontier[t].match = d),
      h &&
        p < 0 &&
        n &&
        n.type == this.frontier[this.depth].type &&
        this.frontier.length > 1 &&
        this.closeFrontierNode();
    for (let m = 0, g = l; m < p; m++) {
      let y = g.lastChild;
      this.frontier.push({
        type: y.type,
        match: y.contentMatchAt(y.childCount),
      }),
        (g = y.content);
    }
    this.unplaced = h
      ? e == 0
        ? b.empty
        : new b(tt(o.content, e - 1, 1), e - 1, p < 0 ? o.openEnd : e - 1)
      : new b(tt(o.content, e, c), o.openStart, o.openEnd);
  }

  mustMoveInline() {
    if (!this.$to.parent.isTextblock) return -1;
    let e = this.frontier[this.depth];
    let t;
    if (
      !e.type.isTextblock ||
      !cn(this.$to, this.$to.depth, e.type, e.match, !1) ||
      (this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth)
    )
      return -1;
    let { depth: n } = this.$to,
      i = this.$to.after(n);
    for (; n > 1 && i == this.$to.end(--n); ) ++i;
    return i;
  }

  findCloseLevel(e) {
    e: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
      let { match: n, type: i } = this.frontier[t],
        s = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)),
        o = cn(e, t, i, n, s);
      if (o) {
        for (let l = t - 1; l >= 0; l--) {
          let { match: a, type: c } = this.frontier[l],
            f = cn(e, l, c, a, !0);
          if (!f || f.childCount) continue e;
        }
        return {
          depth: t,
          fit: o,
          move: s ? e.doc.resolve(e.after(t + 1)) : e,
        };
      }
    }
  }

  close(e) {
    let t = this.findCloseLevel(e);
    if (!t) return null;
    for (; this.depth > t.depth; ) this.closeFrontierNode();
    t.fit.childCount && (this.placed = nt(this.placed, t.depth, t.fit)), (e = t.move);
    for (let n = t.depth + 1; n <= e.depth; n++) {
      let i = e.node(n),
        s = i.type.contentMatch.fillBefore(i.content, !0, e.index(n));
      this.openFrontierNode(i.type, i.attrs, s);
    }
    return e;
  }

  openFrontierNode(e, t = null, n) {
    let i = this.frontier[this.depth];
    (i.match = i.match.matchType(e)),
      (this.placed = nt(this.placed, this.depth, k.from(e.create(t, n)))),
      this.frontier.push({
        type: e,
        match: e.contentMatch,
      });
  }

  closeFrontierNode() {
    let t = this.frontier.pop().match.fillBefore(k.empty, !0);
    t.childCount && (this.placed = nt(this.placed, this.frontier.length, t));
  }
}
function tt(r, e, t) {
  return e == 0
    ? r.cutByIndex(t, r.childCount)
    : r.replaceChild(0, r.firstChild.copy(tt(r.firstChild.content, e - 1, t)));
}
function nt(r, e, t) {
  return e == 0
    ? r.append(t)
    : r.replaceChild(r.childCount - 1, r.lastChild.copy(nt(r.lastChild.content, e - 1, t)));
}
function an(r, e) {
  for (let t = 0; t < e; t++) r = r.firstChild.content;
  return r;
}
function zi(r, e, t) {
  if (e <= 0) return r;
  let n = r.content;
  return (
    e > 1 && (n = n.replaceChild(0, zi(n.firstChild, e - 1, n.childCount == 1 ? t - 1 : 0))),
    e > 0 &&
      ((n = r.type.contentMatch.fillBefore(n).append(n)),
      t <= 0 && (n = n.append(r.type.contentMatch.matchFragment(n).fillBefore(k.empty, !0)))),
    r.copy(n)
  );
}
function cn(r, e, t, n, i) {
  const s = r.node(e),
    o = i ? r.indexAfter(e) : r.index(e);
  if (o == s.childCount && !t.compatibleContent(s.type)) return null;
  const l = n.fillBefore(s.content, !0, o);
  return l && !vo(t, s.content, o) ? l : null;
}
function vo(r, e, t) {
  for (let n = t; n < e.childCount; n++) if (!r.allowsMarks(e.child(n).marks)) return !0;
  return !1;
}
function Ro(r) {
  return r.spec.defining || r.spec.definingForContent;
}
function Po(r, e, t, n) {
  if (n.size === 0) return r.deleteRange(e, t);
  const i = r.doc.resolve(e),
    s = r.doc.resolve(t);
  if (Bi(i, s, n)) return r.step(new P(e, t, n));
  const o = Vi(i, r.doc.resolve(t));
  o.at(-1) == 0 && o.pop();
  let l = -(i.depth + 1);
  o.unshift(l);
  for (let u = i.depth, p = i.pos - 1; u > 0; u--, p--) {
    let h = i.node(u).type.spec;
    if (h.defining || h.definingAsContext || h.isolating) break;
    o.indexOf(u) > -1 ? (l = u) : i.before(u) == p && o.splice(1, 0, -u);
  }
  let a = o.indexOf(l);
  let c = [];
  let f = n.openStart;
  for (let u = n.content, p = 0; ; p++) {
    let h = u.firstChild;
    if ((c.push(h), p == n.openStart)) break;
    u = h.content;
  }
  for (let u = f - 1; u >= 0; u--) {
    let p = c[u],
      h = Ro(p.type);
    if (h && !p.sameMarkup(i.node(Math.abs(l) - 1))) f = u;
    else if (h || !p.type.isTextblock) break;
  }
  for (let u = n.openStart; u >= 0; u--) {
    let p = (u + f + 1) % (n.openStart + 1),
      h = c[p];
    if (h)
      for (let m = 0; m < o.length; m++) {
        let g = o[(m + a) % o.length],
          y = !0;
        g < 0 && ((y = !1), (g = -g));
        let M = i.node(g - 1),
          N = i.index(g - 1);
        if (M.canReplaceWith(N, N, h.type, h.marks))
          return r.replace(
            i.before(g),
            y ? s.after(g) : t,
            new b(Fi(n.content, 0, n.openStart, p), p, n.openEnd),
          );
      }
  }
  const d = r.steps.length;
  for (let u = o.length - 1; u >= 0 && (r.replace(e, t, n), !(r.steps.length > d)); u--) {
    let p = o[u];
    p < 0 || ((e = i.before(p)), (t = s.after(p)));
  }
}
function Fi(r, e, t, n, i) {
  if (e < t) {
    let s = r.firstChild;
    r = r.replaceChild(0, s.copy(Fi(s.content, e + 1, t, n, s)));
  }
  if (e > n) {
    let s = i.contentMatchAt(0),
      o = s.fillBefore(r).append(r);
    r = o.append(s.matchFragment(o).fillBefore(k.empty, !0));
  }
  return r;
}
function Bo(r, e, t, n) {
  if (!n.isInline && e == t && r.doc.resolve(e).parent.content.size > 0) {
    let i = Do(r.doc, e, n.type);
    i != undefined && (e = t = i);
  }
  r.replaceRange(e, t, new b(k.from(n), 0, 0));
}
function zo(r, e, t) {
  const n = r.doc.resolve(e),
    i = r.doc.resolve(t),
    s = Vi(n, i);
  for (let o = 0; o < s.length; o++) {
    let l = s[o],
      a = o == s.length - 1;
    if ((a && l == 0) || n.node(l).type.contentMatch.validEnd)
      return r.delete(n.start(l), i.end(l));
    if (l > 0 && (a || n.node(l - 1).canReplace(n.index(l - 1), i.indexAfter(l - 1))))
      return r.delete(n.before(l), i.after(l));
  }
  for (let o = 1; o <= n.depth && o <= i.depth; o++)
    if (e - n.start(o) == n.depth - o && t > n.end(o) && i.end(o) - t != i.depth - o)
      return r.delete(n.before(o), t);
  r.delete(e, t);
}
function Vi(r, e) {
  const t = [],
    n = Math.min(r.depth, e.depth);
  for (let i = n; i >= 0; i--) {
    let s = r.start(i);
    if (
      s < r.pos - (r.depth - i) ||
      e.end(i) > e.pos + (e.depth - i) ||
      r.node(i).type.spec.isolating ||
      e.node(i).type.spec.isolating
    )
      break;
    (s == e.start(i) ||
      (i == r.depth &&
        i == e.depth &&
        r.parent.inlineContent &&
        e.parent.inlineContent &&
        i &&
        e.start(i - 1) == s - 1)) &&
      t.push(i);
  }
  return t;
}
class He extends W {
  constructor(e, t, n) {
    super(), (this.pos = e), (this.attr = t), (this.value = n);
  }

  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t) return v.fail("No node at attribute step's position");
    let n = Object.create(null);
    for (const s in t.attrs) n[s] = t.attrs[s];
    n[this.attr] = this.value;
    let i = t.type.create(n, null, t.marks);
    return v.fromReplace(e, this.pos, this.pos + 1, new b(k.from(i), 0, t.isLeaf ? 0 : 1));
  }

  getMap() {
    return G.empty;
  }

  invert(e) {
    return new He(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }

  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new He(t.pos, this.attr, this.value);
  }

  toJSON() {
    return {
      stepType: 'attr',
      pos: this.pos,
      attr: this.attr,
      value: this.value,
    };
  }

  static fromJSON(e, t) {
    if (typeof t.pos !== 'number' || typeof t.attr !== 'string')
      throw new RangeError('Invalid input for AttrStep.fromJSON');
    return new He(t.pos, t.attr, t.value);
  }
}
W.jsonID('attr', He);
class ft extends W {
  constructor(e, t) {
    super(), (this.attr = e), (this.value = t);
  }

  apply(e) {
    let t = Object.create(null);
    for (const i in e.attrs) t[i] = e.attrs[i];
    t[this.attr] = this.value;
    let n = e.type.create(t, e.content, e.marks);
    return v.ok(n);
  }

  getMap() {
    return G.empty;
  }

  invert(e) {
    return new ft(this.attr, e.attrs[this.attr]);
  }

  map(e) {
    return this;
  }

  toJSON() {
    return {
      stepType: 'docAttr',
      attr: this.attr,
      value: this.value,
    };
  }

  static fromJSON(e, t) {
    if (typeof t.attr !== 'string') throw new RangeError('Invalid input for DocAttrStep.fromJSON');
    return new ft(t.attr, t.value);
  }
}
W.jsonID('docAttr', ft);
let Xe = class extends Error {};
Xe = function r(e) {
  const t = Error.call(this, e);
  return (t.__proto__ = r.prototype), t;
};
Xe.prototype = Object.create(Error.prototype);
Xe.prototype.constructor = Xe;
Xe.prototype.name = 'TransformError';
class Li {
  constructor(e) {
    (this.doc = e), (this.steps = []), (this.docs = []), (this.mapping = new ot());
  }

  get before() {
    return this.docs.length > 0 ? this.docs[0] : this.doc;
  }

  step(e) {
    let t = this.maybeStep(e);
    if (t.failed) throw new Xe(t.failed);
    return this;
  }

  maybeStep(e) {
    let t = e.apply(this.doc);
    return t.failed || this.addStep(e, t.doc), t;
  }

  get docChanged() {
    return this.steps.length > 0;
  }

  addStep(e, t) {
    this.docs.push(this.doc),
      this.steps.push(e),
      this.mapping.appendMap(e.getMap()),
      (this.doc = t);
  }

  replace(e, t = e, n = b.empty) {
    let i = Ht(this.doc, e, t, n);
    return i && this.step(i), this;
  }

  replaceWith(e, t, n) {
    return this.replace(e, t, new b(k.from(n), 0, 0));
  }

  delete(e, t) {
    return this.replace(e, t, b.empty);
  }

  insert(e, t) {
    return this.replaceWith(e, e, t);
  }

  replaceRange(e, t, n) {
    return Po(this, e, t, n), this;
  }

  replaceRangeWith(e, t, n) {
    return Bo(this, e, t, n), this;
  }

  deleteRange(e, t) {
    return zo(this, e, t), this;
  }

  lift(e, t) {
    return ko(this, e, t), this;
  }

  join(e, t = 1) {
    return Eo(this, e, t), this;
  }

  wrap(e, t) {
    return So(this, e, t), this;
  }

  setBlockType(e, t = e, n, i = null) {
    return Mo(this, e, t, n, i), this;
  }

  setNodeMarkup(e, t, n = null, i) {
    return No(this, e, t, n, i), this;
  }

  setNodeAttribute(e, t, n) {
    return this.step(new He(e, t, n)), this;
  }

  setDocAttribute(e, t) {
    return this.step(new ft(e, t)), this;
  }

  addNodeMark(e, t) {
    return this.step(new me(e, t)), this;
  }

  removeNodeMark(e, t) {
    if (!(t instanceof D)) {
      let n = this.doc.nodeAt(e);
      if (!n) throw new RangeError('No node at position ' + e);
      if (((t = t.isInSet(n.marks)), !t)) return this;
    }
    return this.step(new Ye(e, t)), this;
  }

  split(e, t = 1, n) {
    return To(this, e, t, n), this;
  }

  addMark(e, t, n) {
    return mo(this, e, t, n), this;
  }

  removeMark(e, t, n) {
    return go(this, e, t, n), this;
  }

  clearIncompatible(e, t, n) {
    return Ri(this, e, t, n), this;
  }
}
const fn = Object.create(null);
class O {
  constructor(e, t, n) {
    (this.$anchor = e), (this.$head = t), (this.ranges = n || [new Fo(e.min(t), e.max(t))]);
  }

  get anchor() {
    return this.$anchor.pos;
  }

  get head() {
    return this.$head.pos;
  }

  get from() {
    return this.$from.pos;
  }

  get to() {
    return this.$to.pos;
  }

  get $from() {
    return this.ranges[0].$from;
  }

  get $to() {
    return this.ranges[0].$to;
  }

  get empty() {
    let e = this.ranges;
    for (let t = 0; t < e.length; t++) if (e[t].$from.pos != e[t].$to.pos) return !1;
    return !0;
  }

  content() {
    return this.$from.doc.slice(this.from, this.to, !0);
  }

  replace(e, t = b.empty) {
    let n = t.content.lastChild,
      i = null;
    for (let l = 0; l < t.openEnd; l++) (i = n), (n = n.lastChild);
    let s = e.steps.length,
      o = this.ranges;
    for (let [l, { $from: a, $to: c }] of o.entries()) {
      let f = e.mapping.slice(s);
      e.replaceRange(f.map(a.pos), f.map(c.pos), l ? b.empty : t),
        l == 0 && br(e, s, (n ? n.isInline : i && i.isTextblock) ? -1 : 1);
    }
  }

  replaceWith(e, t) {
    let n = e.steps.length,
      i = this.ranges;
    for (let [s, { $from: o, $to: l }] of i.entries()) {
      let a = e.mapping.slice(n),
        c = a.map(o.pos),
        f = a.map(l.pos);
      s ? e.deleteRange(c, f) : (e.replaceRangeWith(c, f, t), br(e, n, t.isInline ? -1 : 1));
    }
  }

  static findFrom(e, t, n = !1) {
    let i = e.parent.inlineContent ? new w(e) : We(e.node(0), e.parent, e.pos, e.index(), t, n);
    if (i) return i;
    for (let s = e.depth - 1; s >= 0; s--) {
      let o =
        t < 0
          ? We(e.node(0), e.node(s), e.before(s + 1), e.index(s), t, n)
          : We(e.node(0), e.node(s), e.after(s + 1), e.index(s) + 1, t, n);
      if (o) return o;
    }
    return null;
  }

  static near(e, t = 1) {
    return this.findFrom(e, t) || this.findFrom(e, -t) || new Q(e.node(0));
  }

  static atStart(e) {
    return We(e, e, 0, 0, 1) || new Q(e);
  }

  static atEnd(e) {
    return We(e, e, e.content.size, e.childCount, -1) || new Q(e);
  }

  static fromJSON(e, t) {
    if (!t || !t.type) throw new RangeError('Invalid input for Selection.fromJSON');
    let n = fn[t.type];
    if (!n) throw new RangeError(`No selection type ${t.type} defined`);
    return n.fromJSON(e, t);
  }

  static jsonID(e, t) {
    if (e in fn) throw new RangeError('Duplicate use of selection JSON ID ' + e);
    return (fn[e] = t), (t.prototype.jsonID = e), t;
  }

  getBookmark() {
    return w.between(this.$anchor, this.$head).getBookmark();
  }
}
O.prototype.visible = !0;
class Fo {
  constructor(e, t) {
    (this.$from = e), (this.$to = t);
  }
}
let yr = !1;
function kr(r) {
  !yr &&
    !r.parent.inlineContent &&
    ((yr = !0),
    console.warn(
      'TextSelection endpoint not pointing into a node with inline content (' +
        r.parent.type.name +
        ')',
    ));
}
class w extends O {
  constructor(e, t = e) {
    kr(e), kr(t), super(e, t);
  }

  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }

  map(e, t) {
    let n = e.resolve(t.map(this.head));
    if (!n.parent.inlineContent) return O.near(n);
    let i = e.resolve(t.map(this.anchor));
    return new w(i.parent.inlineContent ? i : n, n);
  }

  replace(e, t = b.empty) {
    if ((super.replace(e, t), t == b.empty)) {
      let n = this.$from.marksAcross(this.$to);
      n && e.ensureMarks(n);
    }
  }

  eq(e) {
    return e instanceof w && e.anchor == this.anchor && e.head == this.head;
  }

  getBookmark() {
    return new Ut(this.anchor, this.head);
  }

  toJSON() {
    return {
      type: 'text',
      anchor: this.anchor,
      head: this.head,
    };
  }

  static fromJSON(e, t) {
    if (typeof t.anchor !== 'number' || typeof t.head !== 'number')
      throw new RangeError('Invalid input for TextSelection.fromJSON');
    return new w(e.resolve(t.anchor), e.resolve(t.head));
  }

  static create(e, t, n = t) {
    let i = e.resolve(t);
    return new this(i, n == t ? i : e.resolve(n));
  }

  static between(e, t, n) {
    let i = e.pos - t.pos;
    if (((!n || i) && (n = i >= 0 ? 1 : -1), !t.parent.inlineContent)) {
      let s = O.findFrom(t, n, !0) || O.findFrom(t, -n, !0);
      if (s) t = s.$head;
      else return O.near(t, n);
    }
    return (
      e.parent.inlineContent ||
        (i == 0
          ? (e = t)
          : ((e = (O.findFrom(e, -n, !0) || O.findFrom(e, n, !0)).$anchor),
            e.pos < t.pos != i < 0 && (e = t))),
      new w(e, t)
    );
  }
}
O.jsonID('text', w);
class Ut {
  constructor(e, t) {
    (this.anchor = e), (this.head = t);
  }

  map(e) {
    return new Ut(e.map(this.anchor), e.map(this.head));
  }

  resolve(e) {
    return w.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class S extends O {
  constructor(e) {
    let t = e.nodeAfter,
      n = e.node(0).resolve(e.pos + t.nodeSize);
    super(e, n), (this.node = t);
  }

  map(e, t) {
    let { deleted: n, pos: i } = t.mapResult(this.anchor),
      s = e.resolve(i);
    return n ? O.near(s) : new S(s);
  }

  content() {
    return new b(k.from(this.node), 0, 0);
  }

  eq(e) {
    return e instanceof S && e.anchor == this.anchor;
  }

  toJSON() {
    return {
      type: 'node',
      anchor: this.anchor,
    };
  }

  getBookmark() {
    return new Kn(this.anchor);
  }

  static fromJSON(e, t) {
    if (typeof t.anchor !== 'number')
      throw new RangeError('Invalid input for NodeSelection.fromJSON');
    return new S(e.resolve(t.anchor));
  }

  static create(e, t) {
    return new S(e.resolve(t));
  }

  static isSelectable(e) {
    return !e.isText && e.type.spec.selectable !== !1;
  }
}
S.prototype.visible = !1;
O.jsonID('node', S);
class Kn {
  constructor(e) {
    this.anchor = e;
  }

  map(e) {
    let { deleted: t, pos: n } = e.mapResult(this.anchor);
    return t ? new Ut(n, n) : new Kn(n);
  }

  resolve(e) {
    let t = e.resolve(this.anchor),
      n = t.nodeAfter;
    return n && S.isSelectable(n) ? new S(t) : O.near(t);
  }
}
class Q extends O {
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }

  replace(e, t = b.empty) {
    if (t == b.empty) {
      e.delete(0, e.doc.content.size);
      let n = O.atStart(e.doc);
      n.eq(e.selection) || e.setSelection(n);
    } else super.replace(e, t);
  }

  toJSON() {
    return {
      type: 'all',
    };
  }

  static fromJSON(e) {
    return new Q(e);
  }

  map(e) {
    return new Q(e);
  }

  eq(e) {
    return e instanceof Q;
  }

  getBookmark() {
    return Vo;
  }
}
O.jsonID('all', Q);
const Vo = {
  map() {
    return this;
  },
  resolve(r) {
    return new Q(r);
  },
};
function We(r, e, t, n, i, s = !1) {
  if (e.inlineContent) return w.create(r, t);
  for (let o = n - (i > 0 ? 0 : 1); i > 0 ? o < e.childCount : o >= 0; o += i) {
    let l = e.child(o);
    if (l.isAtom) {
      if (!s && S.isSelectable(l)) return S.create(r, t - (i < 0 ? l.nodeSize : 0));
    } else {
      let a = We(r, l, t + i, i < 0 ? l.childCount : 0, i, s);
      if (a) return a;
    }
    t += l.nodeSize * i;
  }
  return null;
}
function br(r, e, t) {
  const n = r.steps.length - 1;
  if (n < e) return;
  const i = r.steps[n];
  if (!(i instanceof P || i instanceof B)) return;
  let s = r.mapping.maps[n];
  let o;
  s.forEach((l, a, c, f) => {
    o == undefined && (o = f);
  }),
    r.setSelection(O.near(r.doc.resolve(o), t));
}
const xr = 1,
  Ct = 2,
  Sr = 4;
class Lo extends Li {
  constructor(e) {
    super(e.doc),
      (this.curSelectionFor = 0),
      (this.updated = 0),
      (this.meta = Object.create(null)),
      (this.time = Date.now()),
      (this.curSelection = e.selection),
      (this.storedMarks = e.storedMarks);
  }

  get selection() {
    return (
      this.curSelectionFor < this.steps.length &&
        ((this.curSelection = this.curSelection.map(
          this.doc,
          this.mapping.slice(this.curSelectionFor),
        )),
        (this.curSelectionFor = this.steps.length)),
      this.curSelection
    );
  }

  setSelection(e) {
    if (e.$from.doc != this.doc)
      throw new RangeError('Selection passed to setSelection must point at the current document');
    return (
      (this.curSelection = e),
      (this.curSelectionFor = this.steps.length),
      (this.updated = (this.updated | xr) & ~Ct),
      (this.storedMarks = null),
      this
    );
  }

  get selectionSet() {
    return (this.updated & xr) > 0;
  }

  setStoredMarks(e) {
    return (this.storedMarks = e), (this.updated |= Ct), this;
  }

  ensureMarks(e) {
    return (
      D.sameSet(this.storedMarks || this.selection.$from.marks(), e) || this.setStoredMarks(e), this
    );
  }

  addStoredMark(e) {
    return this.ensureMarks(e.addToSet(this.storedMarks || this.selection.$head.marks()));
  }

  removeStoredMark(e) {
    return this.ensureMarks(e.removeFromSet(this.storedMarks || this.selection.$head.marks()));
  }

  get storedMarksSet() {
    return (this.updated & Ct) > 0;
  }

  addStep(e, t) {
    super.addStep(e, t), (this.updated = this.updated & ~Ct), (this.storedMarks = null);
  }

  setTime(e) {
    return (this.time = e), this;
  }

  replaceSelection(e) {
    return this.selection.replace(this, e), this;
  }

  replaceSelectionWith(e, t = !0) {
    let n = this.selection;
    return (
      t &&
        (e = e.mark(
          this.storedMarks || (n.empty ? n.$from.marks() : n.$from.marksAcross(n.$to) || D.none),
        )),
      n.replaceWith(this, e),
      this
    );
  }

  deleteSelection() {
    return this.selection.replace(this), this;
  }

  insertText(e, t, n) {
    let i = this.doc.type.schema;
    if (t == undefined)
      return e ? this.replaceSelectionWith(i.text(e), !0) : this.deleteSelection();
    {
      if ((n == undefined && (n = t), (n = n ?? t), !e)) return this.deleteRange(t, n);
      let s = this.storedMarks;
      if (!s) {
        let o = this.doc.resolve(t);
        s = n == t ? o.marks() : o.marksAcross(this.doc.resolve(n));
      }
      return (
        this.replaceRangeWith(t, n, i.text(e, s)),
        this.selection.empty || this.setSelection(O.near(this.selection.$to)),
        this
      );
    }
  }

  setMeta(e, t) {
    return (this.meta[typeof e === 'string' ? e : e.key] = t), this;
  }

  getMeta(e) {
    return this.meta[typeof e === 'string' ? e : e.key];
  }

  get isGeneric() {
    for (const e in this.meta) return !1;
    return !0;
  }

  scrollIntoView() {
    return (this.updated |= Sr), this;
  }

  get scrolledIntoView() {
    return (this.updated & Sr) > 0;
  }
}
function Mr(r, e) {
  return !e || !r ? r : r.bind(e);
}
class rt {
  constructor(e, t, n) {
    (this.name = e), (this.init = Mr(t.init, n)), (this.apply = Mr(t.apply, n));
  }
}
const $o = [
  new rt('doc', {
    init(r) {
      return r.doc || r.schema.topNodeType.createAndFill();
    },
    apply(r) {
      return r.doc;
    },
  }),
  new rt('selection', {
    init(r, e) {
      return r.selection || O.atStart(e.doc);
    },
    apply(r) {
      return r.selection;
    },
  }),
  new rt('storedMarks', {
    init(r) {
      return r.storedMarks || null;
    },
    apply(r, e, t, n) {
      return n.selection.$cursor ? r.storedMarks : null;
    },
  }),
  new rt('scrollToSelection', {
    init() {
      return 0;
    },
    apply(r, e) {
      return r.scrolledIntoView ? e + 1 : e;
    },
  }),
];
class dn {
  constructor(e, t) {
    (this.schema = e),
      (this.plugins = []),
      (this.pluginsByKey = Object.create(null)),
      (this.fields = [...$o]),
      t &&
        t.forEach((n) => {
          if (this.pluginsByKey[n.key])
            throw new RangeError('Adding different instances of a keyed plugin (' + n.key + ')');
          this.plugins.push(n),
            (this.pluginsByKey[n.key] = n),
            n.spec.state && this.fields.push(new rt(n.key, n.spec.state, n));
        });
  }
}
class qe {
  constructor(e) {
    this.config = e;
  }

  get schema() {
    return this.config.schema;
  }

  get plugins() {
    return this.config.plugins;
  }

  apply(e) {
    return this.applyTransaction(e).state;
  }

  filterTransaction(e, t = -1) {
    for (let n = 0; n < this.config.plugins.length; n++)
      if (n != t) {
        let i = this.config.plugins[n];
        if (i.spec.filterTransaction && !i.spec.filterTransaction.call(i, e, this)) return !1;
      }
    return !0;
  }

  applyTransaction(e) {
    if (!this.filterTransaction(e))
      return {
        state: this,
        transactions: [],
      };
    let t = [e],
      n = this.applyInner(e),
      i = null;
    for (;;) {
      let s = !1;
      for (let o = 0; o < this.config.plugins.length; o++) {
        let l = this.config.plugins[o];
        if (l.spec.appendTransaction) {
          let a = i ? i[o].n : 0,
            c = i ? i[o].state : this,
            f = a < t.length && l.spec.appendTransaction.call(l, a ? t.slice(a) : t, c, n);
          if (f && n.filterTransaction(f, o)) {
            if ((f.setMeta('appendedTransaction', e), !i)) {
              i = [];
              for (let d = 0; d < this.config.plugins.length; d++)
                i.push(
                  d < o
                    ? {
                        state: n,
                        n: t.length,
                      }
                    : {
                        state: this,
                        n: 0,
                      },
                );
            }
            t.push(f), (n = n.applyInner(f)), (s = !0);
          }
          i &&
            (i[o] = {
              state: n,
              n: t.length,
            });
        }
      }
      if (!s)
        return {
          state: n,
          transactions: t,
        };
    }
  }

  applyInner(e) {
    if (!e.before.eq(this.doc)) throw new RangeError('Applying a mismatched transaction');
    let t = new qe(this.config),
      n = this.config.fields;
    for (let s of n) {
      t[s.name] = s.apply(e, this[s.name], this, t);
    }
    return t;
  }

  get tr() {
    return new Lo(this);
  }

  static create(e) {
    let t = new dn(e.doc ? e.doc.type.schema : e.schema, e.plugins),
      n = new qe(t);
    for (let i = 0; i < t.fields.length; i++) n[t.fields[i].name] = t.fields[i].init(e, n);
    return n;
  }

  reconfigure(e) {
    let t = new dn(this.schema, e.plugins),
      n = t.fields,
      i = new qe(t);
    for (const element of n) {
      let o = element.name;
      i[o] = this.hasOwnProperty(o) ? this[o] : element.init(e, i);
    }
    return i;
  }

  toJSON(e) {
    let t = {
      doc: this.doc.toJSON(),
      selection: this.selection.toJSON(),
    };
    if (
      (this.storedMarks && (t.storedMarks = this.storedMarks.map((n) => n.toJSON())),
      e && typeof e === 'object')
    )
      for (const n in e) {
        if (n == 'doc' || n == 'selection')
          throw new RangeError('The JSON fields `doc` and `selection` are reserved');
        let i = e[n],
          s = i.spec.state;
        s && s.toJSON && (t[n] = s.toJSON.call(i, this[i.key]));
      }
    return t;
  }

  static fromJSON(e, t, n) {
    if (!t) throw new RangeError('Invalid input for EditorState.fromJSON');
    if (!e.schema) throw new RangeError("Required config field 'schema' missing");
    let i = new dn(e.schema, e.plugins),
      s = new qe(i);
    return (
      i.fields.forEach((o) => {
        if (o.name == 'doc') s.doc = ye.fromJSON(e.schema, t.doc);
        else if (o.name == 'selection') s.selection = O.fromJSON(s.doc, t.selection);
        else if (o.name == 'storedMarks')
          t.storedMarks && (s.storedMarks = t.storedMarks.map(e.schema.markFromJSON));
        else {
          if (n)
            for (const l in n) {
              let a = n[l],
                c = a.spec.state;
              if (
                a.key == o.name &&
                c &&
                c.fromJSON &&
                Object.prototype.hasOwnProperty.call(t, l)
              ) {
                s[o.name] = c.fromJSON.call(a, e, t[l], s);
                return;
              }
            }
          s[o.name] = o.init(e, s);
        }
      }),
      s
    );
  }
}
function $i(r, e, t) {
  for (const n in r) {
    let i = r[n];
    i instanceof Function ? (i = i.bind(e)) : n == 'handleDOMEvents' && (i = $i(i, e, {})),
      (t[n] = i);
  }
  return t;
}
class Ce {
  constructor(e) {
    (this.spec = e),
      (this.props = {}),
      e.props && $i(e.props, this, this.props),
      (this.key = e.key ? e.key.key : Ji('plugin'));
  }

  getState(e) {
    return e[this.key];
  }
}
const un = Object.create(null);
function Ji(r) {
  return r in un ? r + '$' + ++un[r] : ((un[r] = 0), r + '$');
}
class gt {
  constructor(e = 'key') {
    this.key = Ji(e);
  }

  get(e) {
    return e.config.pluginsByKey[this.key];
  }

  getState(e) {
    return e[this.key];
  }
}
const V = function (r) {
    for (let e = 0; ; e++) {
      if (((r = r.previousSibling), !r)) return e;
    }
  },
  dt = function (r) {
    let e = r.assignedSlot || r.parentNode;
    return e && e.nodeType == 11 ? e.host : e;
  };
let Tn = null;
const le = function (r, e, t) {
    let n = Tn || (Tn = document.createRange());
    return n.setEnd(r, t ?? r.nodeValue.length), n.setStart(r, e || 0), n;
  },
  Jo = function () {
    Tn = null;
  },
  Fe = function (r, e, t, n) {
    return t && (Cr(r, e, t, n, -1) || Cr(r, e, t, n, 1));
  },
  Wo = /^(img|br|input|textarea|hr)$/i;
function Cr(r, e, t, n, i) {
  for (;;) {
    if (r == t && e == n) return !0;
    if (e == (i < 0 ? 0 : ne(r))) {
      let s = r.parentNode;
      if (!s || s.nodeType != 1 || yt(r) || Wo.test(r.nodeName) || r.contentEditable == 'false')
        return !1;
      (e = V(r) + (i < 0 ? 0 : 1)), (r = s);
    } else if (r.nodeType == 1) {
      if (((r = r.childNodes[e + (i < 0 ? -1 : 0)]), r.contentEditable == 'false')) return !1;
      e = i < 0 ? ne(r) : 0;
    } else return !1;
  }
}
function ne(r) {
  return r.nodeType == 3 ? r.nodeValue.length : r.childNodes.length;
}
function jo(r, e) {
  for (;;) {
    if (r.nodeType == 3 && e) return r;
    if (r.nodeType == 1 && e > 0) {
      if (r.contentEditable == 'false') return null;
      (r = r.childNodes[e - 1]), (e = ne(r));
    } else if (r.parentNode && !yt(r)) (e = V(r)), (r = r.parentNode);
    else return null;
  }
}
function qo(r, e) {
  for (;;) {
    if (r.nodeType == 3 && e < r.nodeValue.length) return r;
    if (r.nodeType == 1 && e < r.childNodes.length) {
      if (r.contentEditable == 'false') return null;
      (r = r.childNodes[e]), (e = 0);
    } else if (r.parentNode && !yt(r)) (e = V(r) + 1), (r = r.parentNode);
    else return null;
  }
}
function Ko(r, e, t) {
  for (let n = e == 0, i = e == ne(r); n || i; ) {
    if (r == t) return !0;
    let s = V(r);
    if (((r = r.parentNode), !r)) return !1;
    (n = n && s == 0), (i = i && s == ne(r));
  }
}
function yt(r) {
  let e;
  for (let t = r; t && !(e = t.pmViewDesc); t = t.parentNode);
  return e && e.node && e.node.isBlock && (e.dom == r || e.contentDOM == r);
}
const Gt = function (r) {
  return r.focusNode && Fe(r.focusNode, r.focusOffset, r.anchorNode, r.anchorOffset);
};
function Ne(r, e) {
  const t = document.createEvent('Event');
  return t.initEvent('keydown', !0, !0), (t.keyCode = r), (t.key = t.code = e), t;
}
function Ho(r) {
  let e = r.activeElement;
  for (; e && e.shadowRoot; ) e = e.shadowRoot.activeElement;
  return e;
}
function Uo(r, e, t) {
  if (r.caretPositionFromPoint)
    try {
      let n = r.caretPositionFromPoint(e, t);
      if (n)
        return {
          node: n.offsetNode,
          offset: n.offset,
        };
    } catch {}
  if (r.caretRangeFromPoint) {
    let n = r.caretRangeFromPoint(e, t);
    if (n)
      return {
        node: n.startContainer,
        offset: n.startOffset,
      };
  }
}
const ie = typeof navigator < 'u' ? navigator : null,
  wr = typeof document < 'u' ? document : null,
  we = (ie && ie.userAgent) || '',
  En = /Edge\/(\d+)/.exec(we),
  Wi = /MSIE \d/.exec(we),
  Dn = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(we),
  U = !!(Wi || Dn || En),
  ke = Wi ? document.documentMode : Dn ? +Dn[1] : En ? +En[1] : 0,
  ee = !U && /gecko\/(\d+)/i.test(we);
ee && +(/Firefox\/(\d+)/.exec(we) || [0, 0])[1];
const An = !U && /Chrome\/(\d+)/.exec(we),
  j = !!An,
  Go = An ? +An[1] : 0,
  q = !U && !!ie && /Apple Computer/.test(ie.vendor),
  _e = q && (/Mobile\/\w+/.test(we) || (!!ie && ie.maxTouchPoints > 2)),
  Y = _e || (ie ? /Mac/.test(ie.platform) : !1),
  Yo = ie ? /Win/.test(ie.platform) : !1,
  _ = /Android \d/.test(we),
  kt = !!wr && 'webkitFontSmoothing' in wr.documentElement.style,
  Xo = kt ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function _o(r) {
  const e = r.defaultView && r.defaultView.visualViewport;
  return e
    ? {
        left: 0,
        right: e.width,
        top: 0,
        bottom: e.height,
      }
    : {
        left: 0,
        right: r.documentElement.clientWidth,
        top: 0,
        bottom: r.documentElement.clientHeight,
      };
}
function oe(r, e) {
  return typeof r === 'number' ? r : r[e];
}
function Zo(r) {
  const e = r.getBoundingClientRect(),
    t = e.width / r.offsetWidth || 1,
    n = e.height / r.offsetHeight || 1;
  return {
    left: e.left,
    right: e.left + r.clientWidth * t,
    top: e.top,
    bottom: e.top + r.clientHeight * n,
  };
}
function Or(r, e, t) {
  const n = r.someProp('scrollThreshold') || 0,
    i = r.someProp('scrollMargin') || 5,
    s = r.dom.ownerDocument;
  for (let o = t || r.dom; o; o = dt(o)) {
    if (o.nodeType != 1) continue;
    let l = o,
      a = l == s.body,
      c = a ? _o(s) : Zo(l),
      f = 0,
      d = 0;
    if (
      (e.top < c.top + oe(n, 'top')
        ? (d = -(c.top - e.top + oe(i, 'top')))
        : e.bottom > c.bottom - oe(n, 'bottom') &&
          (d =
            e.bottom - e.top > c.bottom - c.top
              ? e.top + oe(i, 'top') - c.top
              : e.bottom - c.bottom + oe(i, 'bottom')),
      e.left < c.left + oe(n, 'left')
        ? (f = -(c.left - e.left + oe(i, 'left')))
        : e.right > c.right - oe(n, 'right') && (f = e.right - c.right + oe(i, 'right')),
      f || d)
    )
      if (a) s.defaultView.scrollBy(f, d);
      else {
        let u = l.scrollLeft,
          p = l.scrollTop;
        d && (l.scrollTop += d), f && (l.scrollLeft += f);
        let h = l.scrollLeft - u,
          m = l.scrollTop - p;
        e = {
          left: e.left - h,
          top: e.top - m,
          right: e.right - h,
          bottom: e.bottom - m,
        };
      }
    if (a || /^(fixed|sticky)$/.test(getComputedStyle(o).position)) break;
  }
}
function Qo(r) {
  let e = r.dom.getBoundingClientRect();
  let t = Math.max(0, e.top);
  let n;
  let i;
  for (let s = (e.left + e.right) / 2, o = t + 1; o < Math.min(innerHeight, e.bottom); o += 5) {
    let l = r.root.elementFromPoint(s, o);
    if (!l || l == r.dom || !r.dom.contains(l)) continue;
    let a = l.getBoundingClientRect();
    if (a.top >= t - 20) {
      (n = l), (i = a.top);
      break;
    }
  }
  return {
    refDOM: n,
    refTop: i,
    stack: ji(r.dom),
  };
}
function ji(r) {
  const e = [],
    t = r.ownerDocument;
  for (
    let n = r;
    n &&
    (e.push({
      dom: n,
      top: n.scrollTop,
      left: n.scrollLeft,
    }),
    r != t);
    n = dt(n)
  );
  return e;
}
function el({ refDOM: r, refTop: e, stack: t }) {
  const n = r ? r.getBoundingClientRect().top : 0;
  qi(t, n == 0 ? 0 : n - e);
}
function qi(r, e) {
  for (let { dom: n, top: i, left: s } of r) {
    n.scrollTop != i + e && (n.scrollTop = i + e), n.scrollLeft != s && (n.scrollLeft = s);
  }
}
let $e = null;
function tl(r) {
  if (r.setActive) return r.setActive();
  if ($e) return r.focus($e);
  const e = ji(r);
  r.focus(
    $e == undefined
      ? {
          get preventScroll() {
            return (
              ($e = {
                preventScroll: !0,
              }),
              !0
            );
          },
        }
      : void 0,
  ),
    $e || (($e = !1), qi(e, 0));
}
function Ki(r, e) {
  let t;
  let n = 2e8;
  let i;
  let s = 0;
  let o = e.top;
  let l = e.top;
  let a;
  let c;
  for (let f = r.firstChild, d = 0; f; f = f.nextSibling, d++) {
    let u;
    if (f.nodeType == 1) u = f.getClientRects();
    else if (f.nodeType == 3) u = le(f).getClientRects();
    else continue;
    for (let h of u) {
      if (h.top <= o && h.bottom >= l) {
        (o = Math.max(h.bottom, o)), (l = Math.min(h.top, l));
        let m = h.left > e.left ? h.left - e.left : h.right < e.left ? e.left - h.right : 0;
        if (m < n) {
          (t = f),
            (n = m),
            (i =
              m && t.nodeType == 3
                ? {
                    left: h.right < e.left ? h.right : h.left,
                    top: e.top,
                  }
                : e),
            f.nodeType == 1 && m && (s = d + (e.left >= (h.left + h.right) / 2 ? 1 : 0));
          continue;
        }
      } else
        h.top > e.top &&
          !a &&
          h.left <= e.left &&
          h.right >= e.left &&
          ((a = f),
          (c = {
            left: Math.max(h.left, Math.min(h.right, e.left)),
            top: h.top,
          }));
      !t &&
        ((e.left >= h.right && e.top >= h.top) || (e.left >= h.left && e.top >= h.bottom)) &&
        (s = d + 1);
    }
  }
  return (
    !t && a && ((t = a), (i = c), (n = 0)),
    t && t.nodeType == 3
      ? nl(t, i)
      : !t || (n && t.nodeType == 1)
      ? {
          node: r,
          offset: s,
        }
      : Ki(t, i)
  );
}
function nl(r, e) {
  const t = r.nodeValue.length,
    n = document.createRange();
  for (let i = 0; i < t; i++) {
    n.setEnd(r, i + 1), n.setStart(r, i);
    let s = de(n, 1);
    if (s.top != s.bottom && Hn(e, s))
      return {
        node: r,
        offset: i + (e.left >= (s.left + s.right) / 2 ? 1 : 0),
      };
  }
  return {
    node: r,
    offset: 0,
  };
}
function Hn(r, e) {
  return (
    r.left >= e.left - 1 && r.left <= e.right + 1 && r.top >= e.top - 1 && r.top <= e.bottom + 1
  );
}
function rl(r, e) {
  const t = r.parentNode;
  return t && /^li$/i.test(t.nodeName) && e.left < r.getBoundingClientRect().left ? t : r;
}
function il(r, e, t) {
  let { node: n, offset: i } = Ki(e, t);
  let s = -1;
  if (n.nodeType == 1 && !n.firstChild) {
    let o = n.getBoundingClientRect();
    s = o.left != o.right && t.left > (o.left + o.right) / 2 ? 1 : -1;
  }
  return r.docView.posFromDOM(n, i, s);
}
function sl(r, e, t, n) {
  let i = -1;
  for (let s = e, o = !1; s != r.dom; ) {
    let l = r.docView.nearestDesc(s, !0);
    if (!l) return null;
    if (l.dom.nodeType == 1 && ((l.node.isBlock && l.parent) || !l.contentDOM)) {
      let a = l.dom.getBoundingClientRect();
      if (
        (l.node.isBlock &&
          l.parent &&
          ((!o && a.left > n.left) || a.top > n.top
            ? (i = l.posBefore)
            : ((!o && a.right < n.left) || a.bottom < n.top) && (i = l.posAfter),
          (o = !0)),
        !l.contentDOM && i < 0 && !l.node.isText)
      )
        return (l.node.isBlock ? n.top < (a.top + a.bottom) / 2 : n.left < (a.left + a.right) / 2)
          ? l.posBefore
          : l.posAfter;
    }
    s = l.dom.parentNode;
  }
  return i > -1 ? i : r.docView.posFromDOM(e, t, -1);
}
function Hi(r, e, t) {
  const n = r.childNodes.length;
  if (n && t.top < t.bottom)
    for (
      let i = Math.max(
          0,
          Math.min(n - 1, Math.floor((n * (e.top - t.top)) / (t.bottom - t.top)) - 2),
        ),
        s = i;
      ;

    ) {
      let o = r.childNodes[s];
      if (o.nodeType == 1) {
        let l = o.getClientRects();
        for (let c of l) {
          if (Hn(e, c)) return Hi(o, e, c);
        }
      }
      if ((s = (s + 1) % n) == i) break;
    }
  return r;
}
function ol(r, e) {
  let t = r.dom.ownerDocument;
  let n;
  let i = 0;
  let s = Uo(t, e.left, e.top);
  s && ({ node: n, offset: i } = s);
  let o = (r.root.elementFromPoint ? r.root : t).elementFromPoint(e.left, e.top);
  let l;
  if (!o || !r.dom.contains(o.nodeType == 1 ? o : o.parentNode)) {
    let c = r.dom.getBoundingClientRect();
    if (!Hn(e, c) || ((o = Hi(r.dom, e, c)), !o)) return null;
  }
  if (q) for (let c = o; n && c; c = dt(c)) c.draggable && (n = void 0);
  if (((o = rl(o, e)), n)) {
    if (
      ee &&
      n.nodeType == 1 &&
      ((i = Math.min(i, n.childNodes.length)), i < n.childNodes.length)
    ) {
      let f = n.childNodes[i];
      let d;
      f.nodeName == 'IMG' &&
        (d = f.getBoundingClientRect()).right <= e.left &&
        d.bottom > e.top &&
        i++;
    }
    let c;
    kt &&
      i &&
      n.nodeType == 1 &&
      (c = n.childNodes[i - 1]).nodeType == 1 &&
      c.contentEditable == 'false' &&
      c.getBoundingClientRect().top >= e.top &&
      i--,
      n == r.dom &&
      i == n.childNodes.length - 1 &&
      n.lastChild.nodeType == 1 &&
      e.top > n.lastChild.getBoundingClientRect().bottom
        ? (l = r.state.doc.content.size)
        : (i == 0 || n.nodeType != 1 || n.childNodes[i - 1].nodeName != 'BR') &&
          (l = sl(r, n, i, e));
  }
  l == undefined && (l = il(r, o, e));
  const a = r.docView.nearestDesc(o, !0);
  return {
    pos: l,
    inside: a ? a.posAtStart - a.border : -1,
  };
}
function Nr(r) {
  return r.top < r.bottom || r.left < r.right;
}
function de(r, e) {
  const t = r.getClientRects();
  if (t.length > 0) {
    let n = t[e < 0 ? 0 : t.length - 1];
    if (Nr(n)) return n;
  }
  return Array.prototype.find.call(t, Nr) || r.getBoundingClientRect();
}
const ll = /[\u0590-\u05f4\u0600-\u08ac]/;
function Ui(r, e, t) {
  const { node: n, offset: i, atom: s } = r.docView.domFromPos(e, t < 0 ? -1 : 1),
    o = kt || ee;
  if (n.nodeType == 3)
    if (o && (ll.test(n.nodeValue) || (t < 0 ? !i : i == n.nodeValue.length))) {
      let a = de(le(n, i, i), t);
      if (ee && i && /\s/.test(n.nodeValue[i - 1]) && i < n.nodeValue.length) {
        let c = de(le(n, i - 1, i - 1), -1);
        if (c.top == a.top) {
          let f = de(le(n, i, i + 1), -1);
          if (f.top != a.top) return et(f, f.left < c.left);
        }
      }
      return a;
    } else {
      let a = i,
        c = i,
        f = t < 0 ? 1 : -1;
      return (
        t < 0 && !i
          ? (c++, (f = -1))
          : t >= 0 && i == n.nodeValue.length
          ? (a--, (f = 1))
          : t < 0
          ? a--
          : c++,
        et(de(le(n, a, c), f), f < 0)
      );
    }
  if (!r.state.doc.resolve(e - (s || 0)).parent.inlineContent) {
    if (s == undefined && i && (t < 0 || i == ne(n))) {
      let a = n.childNodes[i - 1];
      if (a.nodeType == 1) return hn(a.getBoundingClientRect(), !1);
    }
    if (s == undefined && i < ne(n)) {
      let a = n.childNodes[i];
      if (a.nodeType == 1) return hn(a.getBoundingClientRect(), !0);
    }
    return hn(n.getBoundingClientRect(), t >= 0);
  }
  if (s == undefined && i && (t < 0 || i == ne(n))) {
    let a = n.childNodes[i - 1],
      c =
        a.nodeType == 3
          ? le(a, ne(a) - (o ? 0 : 1))
          : a.nodeType == 1 && (a.nodeName != 'BR' || !a.nextSibling)
          ? a
          : null;
    if (c) return et(de(c, 1), !1);
  }
  if (s == undefined && i < ne(n)) {
    let a = n.childNodes[i];
    for (; a.pmViewDesc && a.pmViewDesc.ignoreForCoords; ) a = a.nextSibling;
    let c = a ? (a.nodeType == 3 ? le(a, 0, o ? 0 : 1) : a.nodeType == 1 ? a : null) : null;
    if (c) return et(de(c, -1), !0);
  }
  return et(de(n.nodeType == 3 ? le(n) : n, -t), t >= 0);
}
function et(r, e) {
  if (r.width == 0) return r;
  const t = e ? r.left : r.right;
  return {
    top: r.top,
    bottom: r.bottom,
    left: t,
    right: t,
  };
}
function hn(r, e) {
  if (r.height == 0) return r;
  const t = e ? r.top : r.bottom;
  return {
    top: t,
    bottom: t,
    left: r.left,
    right: r.right,
  };
}
function Gi(r, e, t) {
  const n = r.state,
    i = r.root.activeElement;
  n != e && r.updateState(e), i != r.dom && r.focus();
  try {
    return t();
  } finally {
    n != e && r.updateState(n), i != r.dom && i && i.focus();
  }
}
function al(r, e, t) {
  const n = e.selection,
    i = t == 'up' ? n.$from : n.$to;
  return Gi(r, e, () => {
    let { node: s } = r.docView.domFromPos(i.pos, t == 'up' ? -1 : 1);
    for (;;) {
      let l = r.docView.nearestDesc(s, !0);
      if (!l) break;
      if (l.node.isBlock) {
        s = l.contentDOM || l.dom;
        break;
      }
      s = l.dom.parentNode;
    }
    let o = Ui(r, i.pos, 1);
    for (let l = s.firstChild; l; l = l.nextSibling) {
      let a;
      if (l.nodeType == 1) a = l.getClientRects();
      else if (l.nodeType == 3) a = le(l, 0, l.nodeValue.length).getClientRects();
      else continue;
      for (let f of a) {
        if (
          f.bottom > f.top + 1 &&
          (t == 'up'
            ? o.top - f.top > (f.bottom - o.top) * 2
            : f.bottom - o.bottom > (o.bottom - f.top) * 2)
        )
          return !1;
      }
    }
    return !0;
  });
}
const cl = /[\u0590-\u08AC]/;
function fl(r, e, t) {
  const { $head: n } = e.selection;
  if (!n.parent.isTextblock) return !1;
  const i = n.parentOffset,
    s = !i,
    o = i == n.parent.content.size,
    l = r.domSelection();
  return !cl.test(n.parent.textContent) || !l.modify
    ? t == 'left' || t == 'backward'
      ? s
      : o
    : Gi(r, e, () => {
        let {
            focusNode: a,
            focusOffset: c,
            anchorNode: f,
            anchorOffset: d,
          } = r.domSelectionRange(),
          u = l.caretBidiLevel;
        l.modify('move', t, 'character');
        let p = n.depth ? r.docView.domAfterPos(n.before()) : r.dom,
          { focusNode: h, focusOffset: m } = r.domSelectionRange(),
          g = (h && !p.contains(h.nodeType == 1 ? h : h.parentNode)) || (a == h && c == m);
        try {
          l.collapse(f, d), a && (a != f || c != d) && l.extend && l.extend(a, c);
        } catch {}
        return u != undefined && (l.caretBidiLevel = u), g;
      });
}
let Tr = null,
  Er = null,
  Dr = !1;
function dl(r, e, t) {
  return Tr == e && Er == t
    ? Dr
    : ((Tr = e), (Er = t), (Dr = t == 'up' || t == 'down' ? al(r, e, t) : fl(r, e, t)));
}
const X = 0,
  Ar = 1,
  Ee = 2,
  se = 3;
class bt {
  constructor(e, t, n, i) {
    (this.parent = e),
      (this.children = t),
      (this.dom = n),
      (this.contentDOM = i),
      (this.dirty = X),
      (n.pmViewDesc = this);
  }

  matchesWidget(e) {
    return !1;
  }

  matchesMark(e) {
    return !1;
  }

  matchesNode(e, t, n) {
    return !1;
  }

  matchesHack(e) {
    return !1;
  }

  parseRule() {
    return null;
  }

  stopEvent(e) {
    return !1;
  }

  get size() {
    let e = 0;
    for (let t = 0; t < this.children.length; t++) e += this.children[t].size;
    return e;
  }

  get border() {
    return 0;
  }

  destroy() {
    (this.parent = void 0), this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
    for (let e = 0; e < this.children.length; e++) this.children[e].destroy();
  }

  posBeforeChild(e) {
    for (let t = 0, n = this.posAtStart; ; t++) {
      let i = this.children[t];
      if (i == e) return n;
      n += i.size;
    }
  }

  get posBefore() {
    return this.parent.posBeforeChild(this);
  }

  get posAtStart() {
    return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
  }

  get posAfter() {
    return this.posBefore + this.size;
  }

  get posAtEnd() {
    return this.posAtStart + this.size - 2 * this.border;
  }

  localPosFromDOM(e, t, n) {
    if (this.contentDOM && this.contentDOM.contains(e.nodeType == 1 ? e : e.parentNode))
      if (n < 0) {
        let s, o;
        if (e == this.contentDOM) s = e.childNodes[t - 1];
        else {
          for (; e.parentNode != this.contentDOM; ) e = e.parentNode;
          s = e.previousSibling;
        }
        for (; s && !((o = s.pmViewDesc) && o.parent == this); ) s = s.previousSibling;
        return s ? this.posBeforeChild(o) + o.size : this.posAtStart;
      } else {
        let s, o;
        if (e == this.contentDOM) s = e.childNodes[t];
        else {
          for (; e.parentNode != this.contentDOM; ) e = e.parentNode;
          s = e.nextSibling;
        }
        for (; s && !((o = s.pmViewDesc) && o.parent == this); ) s = s.nextSibling;
        return s ? this.posBeforeChild(o) : this.posAtEnd;
      }
    let i;
    if (e == this.dom && this.contentDOM) i = t > V(this.contentDOM);
    else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM))
      i = e.compareDocumentPosition(this.contentDOM) & 2;
    else if (this.dom.firstChild) {
      if (t == 0)
        for (let s = e; ; s = s.parentNode) {
          if (s == this.dom) {
            i = !1;
            break;
          }
          if (s.previousSibling) break;
        }
      if (i == undefined && t == e.childNodes.length)
        for (let s = e; ; s = s.parentNode) {
          if (s == this.dom) {
            i = !0;
            break;
          }
          if (s.nextSibling) break;
        }
    }
    return i ?? n > 0 ? this.posAtEnd : this.posAtStart;
  }

  nearestDesc(e, t = !1) {
    for (let n = !0, i = e; i; i = i.parentNode) {
      let s = this.getDesc(i);
      let o;
      if (s && (!t || s.node))
        if (
          n &&
          (o = s.nodeDOM) &&
          !(o.nodeType == 1 ? o.contains(e.nodeType == 1 ? e : e.parentNode) : o == e)
        )
          n = !1;
        else return s;
    }
  }

  getDesc(e) {
    let t = e.pmViewDesc;
    for (let n = t; n; n = n.parent) if (n == this) return t;
  }

  posFromDOM(e, t, n) {
    for (let i = e; i; i = i.parentNode) {
      let s = this.getDesc(i);
      if (s) return s.localPosFromDOM(e, t, n);
    }
    return -1;
  }

  descAt(e) {
    for (let t = 0, n = 0; t < this.children.length; t++) {
      let i = this.children[t],
        s = n + i.size;
      if (n == e && s != n) {
        for (; !i.border && i.children.length > 0; ) i = i.children[0];
        return i;
      }
      if (e < s) return i.descAt(e - n - i.border);
      n = s;
    }
  }

  domFromPos(e, t) {
    if (!this.contentDOM)
      return {
        node: this.dom,
        offset: 0,
        atom: e + 1,
      };
    let n = 0,
      i = 0;
    for (let s = 0; n < this.children.length; n++) {
      let o = this.children[n],
        l = s + o.size;
      if (l > e || o instanceof Xi) {
        i = e - s;
        break;
      }
      s = l;
    }
    if (i) return this.children[n].domFromPos(i - this.children[n].border, t);
    for (let s; n && (s = this.children[n - 1]).size === 0 && s instanceof Yi && s.side >= 0; n--);
    if (t <= 0) {
      let s;
      let o = !0;
      for (
        ;
        (s = n ? this.children[n - 1] : null), !(!s || s.dom.parentNode == this.contentDOM);
        n--, o = !1
      );
      return s && t && o && !s.border && !s.domAtom
        ? s.domFromPos(s.size, t)
        : {
            node: this.contentDOM,
            offset: s ? V(s.dom) + 1 : 0,
          };
    } else {
      let s;
      let o = !0;
      for (
        ;
        (s = n < this.children.length ? this.children[n] : null),
          !(!s || s.dom.parentNode == this.contentDOM);
        n++, o = !1
      );
      return s && o && !s.border && !s.domAtom
        ? s.domFromPos(0, t)
        : {
            node: this.contentDOM,
            offset: s ? V(s.dom) : this.contentDOM.childNodes.length,
          };
    }
  }

  parseRange(e, t, n = 0) {
    if (this.children.length === 0)
      return {
        node: this.contentDOM,
        from: e,
        to: t,
        fromOffset: 0,
        toOffset: this.contentDOM.childNodes.length,
      };
    let i = -1,
      s = -1;
    for (let o = n, l = 0; ; l++) {
      let a = this.children[l],
        c = o + a.size;
      if (i == -1 && e <= c) {
        let f = o + a.border;
        if (
          e >= f &&
          t <= c - a.border &&
          a.node &&
          a.contentDOM &&
          this.contentDOM.contains(a.contentDOM)
        )
          return a.parseRange(e, t, f);
        e = o;
        for (let d = l; d > 0; d--) {
          let u = this.children[d - 1];
          if (u.size > 0 && u.dom.parentNode == this.contentDOM && !u.emptyChildAt(1)) {
            i = V(u.dom) + 1;
            break;
          }
          e -= u.size;
        }
        i == -1 && (i = 0);
      }
      if (i > -1 && (c > t || l == this.children.length - 1)) {
        t = c;
        for (let f = l + 1; f < this.children.length; f++) {
          let d = this.children[f];
          if (d.size > 0 && d.dom.parentNode == this.contentDOM && !d.emptyChildAt(-1)) {
            s = V(d.dom);
            break;
          }
          t += d.size;
        }
        s == -1 && (s = this.contentDOM.childNodes.length);
        break;
      }
      o = c;
    }
    return {
      node: this.contentDOM,
      from: e,
      to: t,
      fromOffset: i,
      toOffset: s,
    };
  }

  emptyChildAt(e) {
    if (this.border || !this.contentDOM || this.children.length === 0) return !1;
    let t = this.children[e < 0 ? 0 : this.children.length - 1];
    return t.size === 0 || t.emptyChildAt(e);
  }

  domAfterPos(e) {
    let { node: t, offset: n } = this.domFromPos(e, 0);
    if (t.nodeType != 1 || n == t.childNodes.length) throw new RangeError('No node after pos ' + e);
    return t.childNodes[n];
  }

  setSelection(e, t, n, i = !1) {
    let s = Math.min(e, t),
      o = Math.max(e, t);
    for (let u = 0, p = 0; u < this.children.length; u++) {
      let h = this.children[u],
        m = p + h.size;
      if (s > p && o < m) return h.setSelection(e - p - h.border, t - p - h.border, n, i);
      p = m;
    }
    let l = this.domFromPos(e, e ? -1 : 1),
      a = t == e ? l : this.domFromPos(t, t ? -1 : 1),
      c = n.getSelection(),
      f = !1;
    if ((ee || q) && e == t) {
      let { node: u, offset: p } = l;
      if (u.nodeType == 3) {
        if (
          ((f = !!(
            p &&
            u.nodeValue[p - 1] ==
              `
`
          )),
          f && p == u.nodeValue.length)
        )
          for (let h = u, m; h; h = h.parentNode) {
            if ((m = h.nextSibling)) {
              m.nodeName == 'BR' &&
                (l = a =
                  {
                    node: m.parentNode,
                    offset: V(m) + 1,
                  });
              break;
            }
            let g = h.pmViewDesc;
            if (g && g.node && g.node.isBlock) break;
          }
      } else {
        let h = u.childNodes[p - 1];
        f = h && (h.nodeName == 'BR' || h.contentEditable == 'false');
      }
    }
    if (ee && c.focusNode && c.focusNode != a.node && c.focusNode.nodeType == 1) {
      let u = c.focusNode.childNodes[c.focusOffset];
      u && u.contentEditable == 'false' && (i = !0);
    }
    if (
      !(i || (f && q)) &&
      Fe(l.node, l.offset, c.anchorNode, c.anchorOffset) &&
      Fe(a.node, a.offset, c.focusNode, c.focusOffset)
    )
      return;
    let d = !1;
    if ((c.extend || e == t) && !f) {
      c.collapse(l.node, l.offset);
      try {
        e != t && c.extend(a.node, a.offset), (d = !0);
      } catch {}
    }
    if (!d) {
      if (e > t) {
        let p = l;
        (l = a), (a = p);
      }
      let u = document.createRange();
      u.setEnd(a.node, a.offset), u.setStart(l.node, l.offset), c.removeAllRanges(), c.addRange(u);
    }
  }

  ignoreMutation(e) {
    return !this.contentDOM && e.type != 'selection';
  }

  get contentLost() {
    return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
  }

  markDirty(e, t) {
    for (let n = 0, i = 0; i < this.children.length; i++) {
      let s = this.children[i],
        o = n + s.size;
      if (n == o ? e <= o && t >= n : e < o && t > n) {
        let l = n + s.border,
          a = o - s.border;
        if (e >= l && t <= a) {
          (this.dirty = e == n || t == o ? Ee : Ar),
            e == l && t == a && (s.contentLost || s.dom.parentNode != this.contentDOM)
              ? (s.dirty = se)
              : s.markDirty(e - l, t - l);
          return;
        } else
          s.dirty =
            s.dom == s.contentDOM && s.dom.parentNode == this.contentDOM && s.children.length === 0
              ? Ee
              : se;
      }
      n = o;
    }
    this.dirty = Ee;
  }

  markParentsDirty() {
    let e = 1;
    for (let t = this.parent; t; t = t.parent, e++) {
      let n = e == 1 ? Ee : Ar;
      t.dirty < n && (t.dirty = n);
    }
  }

  get domAtom() {
    return !1;
  }

  get ignoreForCoords() {
    return !1;
  }

  isText(e) {
    return !1;
  }
}
class Yi extends bt {
  constructor(e, t, n, i) {
    let s;
    let o = t.type.toDOM;
    if (
      (typeof o === 'function' &&
        (o = o(n, () => {
          if (!s) return i;
          if (s.parent) return s.parent.posBeforeChild(s);
        })),
      !t.type.spec.raw)
    ) {
      if (o.nodeType != 1) {
        let l = document.createElement('span');
        l.appendChild(o), (o = l);
      }
      (o.contentEditable = 'false'), o.classList.add('ProseMirror-widget');
    }
    super(e, [], o, null), (this.widget = t), (this.widget = t), (s = this);
  }

  matchesWidget(e) {
    return this.dirty == X && e.type.eq(this.widget.type);
  }

  parseRule() {
    return {
      ignore: !0,
    };
  }

  stopEvent(e) {
    let t = this.widget.spec.stopEvent;
    return t ? t(e) : !1;
  }

  ignoreMutation(e) {
    return e.type != 'selection' || this.widget.spec.ignoreSelection;
  }

  destroy() {
    this.widget.type.destroy(this.dom), super.destroy();
  }

  get domAtom() {
    return !0;
  }

  get side() {
    return this.widget.type.side;
  }
}
class ul extends bt {
  constructor(e, t, n, i) {
    super(e, [], t, null), (this.textDOM = n), (this.text = i);
  }

  get size() {
    return this.text.length;
  }

  localPosFromDOM(e, t) {
    return e == this.textDOM ? this.posAtStart + t : this.posAtStart + (t ? this.size : 0);
  }

  domFromPos(e) {
    return {
      node: this.textDOM,
      offset: e,
    };
  }

  ignoreMutation(e) {
    return e.type === 'characterData' && e.target.nodeValue == e.oldValue;
  }
}
class Ve extends bt {
  constructor(e, t, n, i) {
    super(e, [], n, i), (this.mark = t);
  }

  static create(e, t, n, i) {
    let s = i.nodeViews[t.type.name],
      o = s && s(t, i, n);
    return (
      (!o || !o.dom) && (o = Le.renderSpec(document, t.type.spec.toDOM(t, n))),
      new Ve(e, t, o.dom, o.contentDOM || o.dom)
    );
  }

  parseRule() {
    return this.dirty & se || this.mark.type.spec.reparseInView
      ? null
      : {
          mark: this.mark.type.name,
          attrs: this.mark.attrs,
          contentElement: this.contentDOM,
        };
  }

  matchesMark(e) {
    return this.dirty != se && this.mark.eq(e);
  }

  markDirty(e, t) {
    if ((super.markDirty(e, t), this.dirty != X)) {
      let n = this.parent;
      for (; !n.node; ) n = n.parent;
      n.dirty < this.dirty && (n.dirty = this.dirty), (this.dirty = X);
    }
  }

  slice(e, t, n) {
    let i = Ve.create(this.parent, this.mark, !0, n),
      s = this.children,
      o = this.size;
    t < o && (s = Rn(s, t, o, n)), e > 0 && (s = Rn(s, 0, e, n));
    for (let l = 0; l < s.length; l++) s[l].parent = i;
    return (i.children = s), i;
  }
}
class be extends bt {
  constructor(e, t, n, i, s, o, l, a, c) {
    super(e, [], s, o),
      (this.node = t),
      (this.outerDeco = n),
      (this.innerDeco = i),
      (this.nodeDOM = l);
  }

  static create(e, t, n, i, s, o) {
    let l = s.nodeViews[t.type.name];
    let a;
    let c =
      l &&
      l(
        t,
        s,
        () => {
          if (!a) return o;
          if (a.parent) return a.parent.posBeforeChild(a);
        },
        n,
        i,
      );
    let f = c && c.dom;
    let d = c && c.contentDOM;
    if (t.isText) {
      if (!f) f = document.createTextNode(t.text);
      else if (f.nodeType != 3) throw new RangeError('Text must be rendered as a DOM text node');
    } else f || ({ dom: f, contentDOM: d } = Le.renderSpec(document, t.type.spec.toDOM(t)));
    !d &&
      !t.isText &&
      f.nodeName != 'BR' &&
      (f.hasAttribute('contenteditable') || (f.contentEditable = 'false'),
      t.type.spec.draggable && (f.draggable = !0));
    let u = f;
    return (
      (f = Qi(f, n, t)),
      c
        ? (a = new hl(e, t, n, i, f, d || null, u, c, s, o + 1))
        : t.isText
        ? new Yt(e, t, n, i, f, u, s)
        : new be(e, t, n, i, f, d || null, u, s, o + 1)
    );
  }

  parseRule() {
    if (this.node.type.spec.reparseInView) return null;
    let e = {
      node: this.node.type.name,
      attrs: this.node.attrs,
    };
    if ((this.node.type.whitespace == 'pre' && (e.preserveWhitespace = 'full'), !this.contentDOM))
      e.getContent = () => this.node.content;
    else if (this.contentLost) {
      for (let t = this.children.length - 1; t >= 0; t--) {
        let n = this.children[t];
        if (this.dom.contains(n.dom.parentNode)) {
          e.contentElement = n.dom.parentNode;
          break;
        }
      }
      e.contentElement || (e.getContent = () => k.empty);
    } else {
      e.contentElement = this.contentDOM;
    }
    return e;
  }

  matchesNode(e, t, n) {
    return this.dirty == X && e.eq(this.node) && vn(t, this.outerDeco) && n.eq(this.innerDeco);
  }

  get size() {
    return this.node.nodeSize;
  }

  get border() {
    return this.node.isLeaf ? 0 : 1;
  }

  updateChildren(e, t) {
    let n = this.node.inlineContent,
      i = t,
      s = e.composing ? this.localCompositionInfo(e, t) : null,
      o = s && s.pos > -1 ? s : null,
      l = s && s.pos < 0,
      a = new ml(this, o && o.node, e);
    kl(
      this.node,
      this.innerDeco,
      (c, f, d) => {
        c.spec.marks
          ? a.syncToMarks(c.spec.marks, n, e)
          : c.type.side >= 0 &&
            !d &&
            a.syncToMarks(f == this.node.childCount ? D.none : this.node.child(f).marks, n, e),
          a.placeWidget(c, e, i);
      },
      (c, f, d, u) => {
        a.syncToMarks(c.marks, n, e);
        let p;
        a.findNodeMatch(c, f, d, u) ||
          (l &&
            e.state.selection.from > i &&
            e.state.selection.to < i + c.nodeSize &&
            (p = a.findIndexWithChild(s.node)) > -1 &&
            a.updateNodeAt(c, f, d, p, e)) ||
          a.updateNextNode(c, f, d, e, u, i) ||
          a.addNode(c, f, d, e, i),
          (i += c.nodeSize);
      },
    ),
      a.syncToMarks([], n, e),
      this.node.isTextblock && a.addTextblockHacks(),
      a.destroyRest(),
      (a.changed || this.dirty == Ee) &&
        (o && this.protectLocalComposition(e, o),
        _i(this.contentDOM, this.children, e),
        _e && bl(this.dom));
  }

  localCompositionInfo(e, t) {
    let { from: n, to: i } = e.state.selection;
    if (!(e.state.selection instanceof w) || n < t || i > t + this.node.content.size) return null;
    let s = e.input.compositionNode;
    if (!s || !this.dom.contains(s.parentNode)) return null;
    if (this.node.inlineContent) {
      let o = s.nodeValue,
        l = xl(this.node.content, o, n - t, i - t);
      return l < 0
        ? null
        : {
            node: s,
            pos: l,
            text: o,
          };
    } else
      return {
        node: s,
        pos: -1,
        text: '',
      };
  }

  protectLocalComposition(e, { node: t, pos: n, text: i }) {
    if (this.getDesc(t)) return;
    let s = t;
    for (; s.parentNode != this.contentDOM; s = s.parentNode) {
      for (; s.previousSibling; ) s.parentNode.removeChild(s.previousSibling);
      for (; s.nextSibling; ) s.parentNode.removeChild(s.nextSibling);
      s.pmViewDesc && (s.pmViewDesc = void 0);
    }
    let o = new ul(this, s, t, i);
    e.input.compositionNodes.push(o), (this.children = Rn(this.children, n, n + i.length, e, o));
  }

  update(e, t, n, i) {
    return this.dirty == se || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, t, n, i), !0);
  }

  updateInner(e, t, n, i) {
    this.updateOuterDeco(t),
      (this.node = e),
      (this.innerDeco = n),
      this.contentDOM && this.updateChildren(i, this.posAtStart),
      (this.dirty = X);
  }

  updateOuterDeco(e) {
    if (vn(e, this.outerDeco)) return;
    let t = this.nodeDOM.nodeType != 1,
      n = this.dom;
    (this.dom = Zi(this.dom, this.nodeDOM, In(this.outerDeco, this.node, t), In(e, this.node, t))),
      this.dom != n && ((n.pmViewDesc = void 0), (this.dom.pmViewDesc = this)),
      (this.outerDeco = e);
  }

  selectNode() {
    this.nodeDOM.nodeType == 1 && this.nodeDOM.classList.add('ProseMirror-selectednode'),
      (this.contentDOM || !this.node.type.spec.draggable) && (this.dom.draggable = !0);
  }

  deselectNode() {
    this.nodeDOM.nodeType == 1 &&
      (this.nodeDOM.classList.remove('ProseMirror-selectednode'),
      (this.contentDOM || !this.node.type.spec.draggable) && this.dom.removeAttribute('draggable'));
  }

  get domAtom() {
    return this.node.isAtom;
  }
}
function Ir(r, e, t, n, i) {
  Qi(n, e, r);
  const s = new be(void 0, r, e, t, n, n, n, i, 0);
  return s.contentDOM && s.updateChildren(i, 0), s;
}
class Yt extends be {
  constructor(e, t, n, i, s, o, l) {
    super(e, t, n, i, s, null, o, l, 0);
  }

  parseRule() {
    let e = this.nodeDOM.parentNode;
    for (; e && e != this.dom && !e.pmIsDeco; ) e = e.parentNode;
    return {
      skip: e || !0,
    };
  }

  update(e, t, n, i) {
    return this.dirty == se || (this.dirty != X && !this.inParent()) || !e.sameMarkup(this.node)
      ? !1
      : (this.updateOuterDeco(t),
        (this.dirty != X || e.text != this.node.text) &&
          e.text != this.nodeDOM.nodeValue &&
          ((this.nodeDOM.nodeValue = e.text),
          i.trackWrites == this.nodeDOM && (i.trackWrites = null)),
        (this.node = e),
        (this.dirty = X),
        !0);
  }

  inParent() {
    let e = this.parent.contentDOM;
    for (let t = this.nodeDOM; t; t = t.parentNode) if (t == e) return !0;
    return !1;
  }

  domFromPos(e) {
    return {
      node: this.nodeDOM,
      offset: e,
    };
  }

  localPosFromDOM(e, t, n) {
    return e == this.nodeDOM
      ? this.posAtStart + Math.min(t, this.node.text.length)
      : super.localPosFromDOM(e, t, n);
  }

  ignoreMutation(e) {
    return e.type != 'characterData' && e.type != 'selection';
  }

  slice(e, t, n) {
    let i = this.node.cut(e, t),
      s = document.createTextNode(i.text);
    return new Yt(this.parent, i, this.outerDeco, this.innerDeco, s, s, n);
  }

  markDirty(e, t) {
    super.markDirty(e, t),
      this.dom != this.nodeDOM &&
        (e == 0 || t == this.nodeDOM.nodeValue.length) &&
        (this.dirty = se);
  }

  get domAtom() {
    return !1;
  }

  isText(e) {
    return this.node.text == e;
  }
}
class Xi extends bt {
  parseRule() {
    return {
      ignore: !0,
    };
  }

  matchesHack(e) {
    return this.dirty == X && this.dom.nodeName == e;
  }

  get domAtom() {
    return !0;
  }

  get ignoreForCoords() {
    return this.dom.nodeName == 'IMG';
  }
}
class hl extends be {
  constructor(e, t, n, i, s, o, l, a, c, f) {
    super(e, t, n, i, s, o, l, c, f), (this.spec = a);
  }

  update(e, t, n, i) {
    if (this.dirty == se) return !1;
    if (this.spec.update) {
      let s = this.spec.update(e, t, n);
      return s && this.updateInner(e, t, n, i), s;
    } else return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, t, n, i);
  }

  selectNode() {
    this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
  }

  deselectNode() {
    this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
  }

  setSelection(e, t, n, i) {
    this.spec.setSelection ? this.spec.setSelection(e, t, n) : super.setSelection(e, t, n, i);
  }

  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }

  stopEvent(e) {
    return this.spec.stopEvent ? this.spec.stopEvent(e) : !1;
  }

  ignoreMutation(e) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
  }
}
function _i(r, e, t) {
  let n = r.firstChild;
  let i = !1;
  for (let o of e) {
    let l = o.dom;
    if (l.parentNode == r) {
      for (; l != n; ) (n = vr(n)), (i = !0);
      n = n.nextSibling;
    } else (i = !0), r.insertBefore(l, n);
    if (o instanceof Ve) {
      let a = n ? n.previousSibling : r.lastChild;
      _i(o.contentDOM, o.children, t), (n = a ? a.nextSibling : r.firstChild);
    }
  }
  for (; n; ) (n = vr(n)), (i = !0);
  i && t.trackWrites == r && (t.trackWrites = null);
}
const lt = function (r) {
  r && (this.nodeName = r);
};
lt.prototype = Object.create(null);
const De = [new lt()];
function In(r, e, t) {
  if (r.length === 0) return De;
  let n = t ? De[0] : new lt();
  let i = [n];
  for (const element of r) {
    let o = element.type.attrs;
    if (o) {
      o.nodeName && i.push((n = new lt(o.nodeName)));
      for (const l in o) {
        let a = o[l];
        a != undefined &&
          (t && i.length == 1 && i.push((n = new lt(e.isInline ? 'span' : 'div'))),
          l == 'class'
            ? (n.class = (n.class ? n.class + ' ' : '') + a)
            : l == 'style'
            ? (n.style = (n.style ? n.style + ';' : '') + a)
            : l != 'nodeName' && (n[l] = a));
      }
    }
  }
  return i;
}
function Zi(r, e, t, n) {
  if (t == De && n == De) return e;
  let i = e;
  for (let [s, o] of n.entries()) {
    let l = t[s];
    if (s) {
      let a;
      (l &&
        l.nodeName == o.nodeName &&
        i != r &&
        (a = i.parentNode) &&
        a.nodeName.toLowerCase() == o.nodeName) ||
        ((a = document.createElement(o.nodeName)),
        (a.pmIsDeco = !0),
        a.appendChild(i),
        (l = De[0])),
        (i = a);
    }
    pl(i, l || De[0], o);
  }
  return i;
}
function pl(r, e, t) {
  for (const n in e)
    n != 'class' && n != 'style' && n != 'nodeName' && !(n in t) && r.removeAttribute(n);
  for (const n in t)
    n != 'class' && n != 'style' && n != 'nodeName' && t[n] != e[n] && r.setAttribute(n, t[n]);
  if (e.class != t.class) {
    let n = e.class ? e.class.split(' ').filter(Boolean) : [],
      i = t.class ? t.class.split(' ').filter(Boolean) : [];
    for (let s = 0; s < n.length; s++) i.indexOf(n[s]) == -1 && r.classList.remove(n[s]);
    for (let s = 0; s < i.length; s++) n.indexOf(i[s]) == -1 && r.classList.add(i[s]);
    r.classList.length == 0 && r.removeAttribute('class');
  }
  if (e.style != t.style) {
    if (e.style) {
      let n = /\s*([\w\-\u00a1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g,
        i;
      for (; (i = n.exec(e.style)); ) r.style.removeProperty(i[1]);
    }
    t.style && (r.style.cssText += t.style);
  }
}
function Qi(r, e, t) {
  return Zi(r, r, De, In(e, t, r.nodeType != 1));
}
function vn(r, e) {
  if (r.length != e.length) return !1;
  for (let t = 0; t < r.length; t++) if (!r[t].type.eq(e[t].type)) return !1;
  return !0;
}
function vr(r) {
  const e = r.nextSibling;
  return r.parentNode.removeChild(r), e;
}
class ml {
  constructor(e, t, n) {
    (this.lock = t),
      (this.view = n),
      (this.index = 0),
      (this.stack = []),
      (this.changed = !1),
      (this.top = e),
      (this.preMatch = gl(e.node.content, e));
  }

  destroyBetween(e, t) {
    if (e != t) {
      for (let n = e; n < t; n++) this.top.children[n].destroy();
      this.top.children.splice(e, t - e), (this.changed = !0);
    }
  }

  destroyRest() {
    this.destroyBetween(this.index, this.top.children.length);
  }

  syncToMarks(e, t, n) {
    let i = 0,
      s = this.stack.length >> 1,
      o = Math.min(s, e.length);
    for (
      ;
      i < o &&
      (i == s - 1 ? this.top : this.stack[(i + 1) << 1]).matchesMark(e[i]) &&
      e[i].type.spec.spanning !== !1;

    )
      i++;
    for (; i < s; )
      this.destroyRest(),
        (this.top.dirty = X),
        (this.index = this.stack.pop()),
        (this.top = this.stack.pop()),
        s--;
    for (; s < e.length; ) {
      this.stack.push(this.top, this.index + 1);
      let l = -1;
      for (let a = this.index; a < Math.min(this.index + 3, this.top.children.length); a++) {
        let c = this.top.children[a];
        if (c.matchesMark(e[s]) && !this.isLocked(c.dom)) {
          l = a;
          break;
        }
      }
      if (l > -1)
        l > this.index && ((this.changed = !0), this.destroyBetween(this.index, l)),
          (this.top = this.top.children[this.index]);
      else {
        let a = Ve.create(this.top, e[s], t, n);
        this.top.children.splice(this.index, 0, a), (this.top = a), (this.changed = !0);
      }
      (this.index = 0), s++;
    }
  }

  findNodeMatch(e, t, n, i) {
    let s = -1;
    let o;
    if (
      i >= this.preMatch.index &&
      (o = this.preMatch.matches[i - this.preMatch.index]).parent == this.top &&
      o.matchesNode(e, t, n)
    )
      s = this.top.children.indexOf(o, this.index);
    else
      for (let l = this.index, a = Math.min(this.top.children.length, l + 5); l < a; l++) {
        let c = this.top.children[l];
        if (c.matchesNode(e, t, n) && !this.preMatch.matched.has(c)) {
          s = l;
          break;
        }
      }
    return s < 0 ? !1 : (this.destroyBetween(this.index, s), this.index++, !0);
  }

  updateNodeAt(e, t, n, i, s) {
    let o = this.top.children[i];
    return (
      o.dirty == se && o.dom == o.contentDOM && (o.dirty = Ee),
      o.update(e, t, n, s) ? (this.destroyBetween(this.index, i), this.index++, !0) : !1
    );
  }

  findIndexWithChild(e) {
    for (;;) {
      let t = e.parentNode;
      if (!t) return -1;
      if (t == this.top.contentDOM) {
        let n = e.pmViewDesc;
        if (n) {
          for (let i = this.index; i < this.top.children.length; i++)
            if (this.top.children[i] == n) return i;
        }
        return -1;
      }
      e = t;
    }
  }

  updateNextNode(e, t, n, i, s, o) {
    for (let l = this.index; l < this.top.children.length; l++) {
      let a = this.top.children[l];
      if (a instanceof be) {
        let c = this.preMatch.matched.get(a);
        if (c != undefined && c != s) return !1;
        let f = a.dom;
        let d;
        let u =
          this.isLocked(f) &&
          !(
            e.isText &&
            a.node &&
            a.node.isText &&
            a.nodeDOM.nodeValue == e.text &&
            a.dirty != se &&
            vn(t, a.outerDeco)
          );
        if (!u && a.update(e, t, n, i))
          return (
            this.destroyBetween(this.index, l), a.dom != f && (this.changed = !0), this.index++, !0
          );
        if (!u && (d = this.recreateWrapper(a, e, t, n, i, o)))
          return (
            (this.top.children[this.index] = d),
            d.contentDOM && ((d.dirty = Ee), d.updateChildren(i, o + 1), (d.dirty = X)),
            (this.changed = !0),
            this.index++,
            !0
          );
        break;
      }
    }
    return !1;
  }

  recreateWrapper(e, t, n, i, s, o) {
    if (e.dirty || t.isAtom || e.children.length === 0 || !e.node.content.eq(t.content))
      return null;
    let l = be.create(this.top, t, n, i, s, o);
    if (l.contentDOM) {
      (l.children = e.children), (e.children = []);
      for (const a of l.children) a.parent = l;
    }
    return e.destroy(), l;
  }

  addNode(e, t, n, i, s) {
    let o = be.create(this.top, e, t, n, i, s);
    o.contentDOM && o.updateChildren(i, s + 1),
      this.top.children.splice(this.index++, 0, o),
      (this.changed = !0);
  }

  placeWidget(e, t, n) {
    let i = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (i && i.matchesWidget(e) && (e == i.widget || !i.widget.type.toDOM.parentNode)) this.index++;
    else {
      let s = new Yi(this.top, e, t, n);
      this.top.children.splice(this.index++, 0, s), (this.changed = !0);
    }
  }

  addTextblockHacks() {
    let e = this.top.children[this.index - 1],
      t = this.top;
    for (; e instanceof Ve; ) (t = e), (e = t.children.at(-1));
    (!e ||
      !(e instanceof Yt) ||
      /\n$/.test(e.node.text) ||
      (this.view.requiresGeckoHackNode && /\s$/.test(e.node.text))) &&
      ((q || j) && e && e.dom.contentEditable == 'false' && this.addHackNode('IMG', t),
      this.addHackNode('BR', this.top));
  }

  addHackNode(e, t) {
    if (t == this.top && this.index < t.children.length && t.children[this.index].matchesHack(e))
      this.index++;
    else {
      let n = document.createElement(e);
      e == 'IMG' && ((n.className = 'ProseMirror-separator'), (n.alt = '')),
        e == 'BR' && (n.className = 'ProseMirror-trailingBreak');
      let i = new Xi(this.top, [], n, null);
      t == this.top ? t.children.splice(this.index++, 0, i) : t.children.push(i),
        (this.changed = !0);
    }
  }

  isLocked(e) {
    return this.lock && (e == this.lock || (e.nodeType == 1 && e.contains(this.lock.parentNode)));
  }
}
function gl(r, e) {
  let t = e;
  let n = t.children.length;
  let i = r.childCount;
  let s = new Map();
  let o = [];
  e: for (; i > 0; ) {
    let l;
    for (;;)
      if (n) {
        let c = t.children[n - 1];
        if (c instanceof Ve) (t = c), (n = c.children.length);
        else {
          (l = c), n--;
          break;
        }
      } else {
        if (t == e) break e;
        (n = t.parent.children.indexOf(t)), (t = t.parent);
      }
    let a = l.node;
    if (a) {
      if (a != r.child(i - 1)) break;
      --i, s.set(l, i), o.push(l);
    }
  }
  return {
    index: i,
    matched: s,
    matches: o.reverse(),
  };
}
function yl(r, e) {
  return r.type.side - e.type.side;
}
function kl(r, e, t, n) {
  let i = e.locals(r);
  let s = 0;
  if (i.length === 0) {
    for (let c = 0; c < r.childCount; c++) {
      let f = r.child(c);
      n(f, i, e.forChild(s, f), c), (s += f.nodeSize);
    }
    return;
  }
  let o = 0;
  let l = [];
  let a = null;
  for (let c = 0; ; ) {
    let f, d;
    for (; o < i.length && i[o].to == s; ) {
      let g = i[o++];
      g.widget && (f ? (d || (d = [f])).push(g) : (f = g));
    }
    if (f)
      if (d) {
        d.sort(yl);
        for (let g = 0; g < d.length; g++) t(d[g], c, !!a);
      } else t(f, c, !!a);
    let u, p;
    if (a) (p = -1), (u = a), (a = null);
    else if (c < r.childCount) (p = c), (u = r.child(c++));
    else break;
    for (let g = 0; g < l.length; g++) l[g].to <= s && l.splice(g--, 1);
    for (; o < i.length && i[o].from <= s && i[o].to > s; ) l.push(i[o++]);
    let h = s + u.nodeSize;
    if (u.isText) {
      let g = h;
      o < i.length && i[o].from < g && (g = i[o].from);
      for (let y = 0; y < l.length; y++) l[y].to < g && (g = l[y].to);
      g < h && ((a = u.cut(g - s)), (u = u.cut(0, g - s)), (h = g), (p = -1));
    } else for (; o < i.length && i[o].to < h; ) o++;
    let m = u.isInline && !u.isLeaf ? l.filter((g) => !g.inline) : [...l];
    n(u, m, e.forChild(s, u), p), (s = h);
  }
}
function bl(r) {
  if (r.nodeName == 'UL' || r.nodeName == 'OL') {
    let e = r.style.cssText;
    (r.style.cssText = e + '; list-style: square !important'),
      window.getComputedStyle(r).listStyle,
      (r.style.cssText = e);
  }
}
function xl(r, e, t, n) {
  for (let i = 0, s = 0; i < r.childCount && s <= n; ) {
    let o = r.child(i++),
      l = s;
    if (((s += o.nodeSize), !o.isText)) continue;
    let a = o.text;
    for (; i < r.childCount; ) {
      let c = r.child(i++);
      if (((s += c.nodeSize), !c.isText)) break;
      a += c.text;
    }
    if (s >= t) {
      if (s >= n && a.slice(n - e.length - l, n - l) == e) return n - e.length;
      let c = l < n ? a.lastIndexOf(e, n - l - 1) : -1;
      if (c >= 0 && c + e.length + l >= t) return l + c;
      if (t == n && a.length >= n + e.length - l && a.slice(n - l, n - l + e.length) == e) return n;
    }
  }
  return -1;
}
function Rn(r, e, t, n, i) {
  const s = [];
  for (let o = 0, l = 0; o < r.length; o++) {
    let a = r[o],
      c = l,
      f = (l += a.size);
    c >= t || f <= e
      ? s.push(a)
      : (c < e && s.push(a.slice(0, e - c, n)),
        i && (s.push(i), (i = void 0)),
        f > t && s.push(a.slice(t - c, a.size, n)));
  }
  return s;
}
function Un(r, e = null) {
  const t = r.domSelectionRange(),
    n = r.state.doc;
  if (!t.focusNode) return null;
  let i = r.docView.nearestDesc(t.focusNode);
  let s = i && i.size == 0;
  let o = r.docView.posFromDOM(t.focusNode, t.focusOffset, 1);
  if (o < 0) return null;
  let l = n.resolve(o);
  let a;
  let c;
  if (Gt(t)) {
    for (a = l; i && !i.node; ) i = i.parent;
    let f = i.node;
    if (
      i &&
      f.isAtom &&
      S.isSelectable(f) &&
      i.parent &&
      !(f.isInline && Ko(t.focusNode, t.focusOffset, i.dom))
    ) {
      let d = i.posBefore;
      c = new S(o == d ? l : n.resolve(d));
    }
  } else {
    let f = r.docView.posFromDOM(t.anchorNode, t.anchorOffset, 1);
    if (f < 0) return null;
    a = n.resolve(f);
  }
  if (!c) {
    let f = e == 'pointer' || (r.state.selection.head < l.pos && !s) ? 1 : -1;
    c = Gn(r, a, l, f);
  }
  return c;
}
function es(r) {
  return r.editable
    ? r.hasFocus()
    : ns(r) && document.activeElement && document.activeElement.contains(r.dom);
}
function ae(r, e = !1) {
  const t = r.state.selection;
  if ((ts(r, t), !!es(r))) {
    if (!e && r.input.mouseDown && r.input.mouseDown.allowDefault && j) {
      let n = r.domSelectionRange(),
        i = r.domObserver.currentSelection;
      if (
        n.anchorNode &&
        i.anchorNode &&
        Fe(n.anchorNode, n.anchorOffset, i.anchorNode, i.anchorOffset)
      ) {
        (r.input.mouseDown.delayedSelectionSync = !0), r.domObserver.setCurSelection();
        return;
      }
    }
    if ((r.domObserver.disconnectSelection(), r.cursorWrapper)) Ml(r);
    else {
      let { anchor: n, head: i } = t;
      let s;
      let o;
      Rr &&
        !(t instanceof w) &&
        (t.$from.parent.inlineContent || (s = Pr(r, t.from)),
        !t.empty && !t.$from.parent.inlineContent && (o = Pr(r, t.to))),
        r.docView.setSelection(n, i, r.root, e),
        Rr && (s && Br(s), o && Br(o)),
        t.visible
          ? r.dom.classList.remove('ProseMirror-hideselection')
          : (r.dom.classList.add('ProseMirror-hideselection'),
            'onselectionchange' in document && Sl(r));
    }
    r.domObserver.setCurSelection(), r.domObserver.connectSelection();
  }
}
const Rr = q || (j && Go < 63);
function Pr(r, e) {
  const { node: t, offset: n } = r.docView.domFromPos(e, 0),
    i = n < t.childNodes.length ? t.childNodes[n] : null,
    s = n ? t.childNodes[n - 1] : null;
  if (q && i && i.contentEditable == 'false') return pn(i);
  if ((!i || i.contentEditable == 'false') && (!s || s.contentEditable == 'false')) {
    if (i) return pn(i);
    if (s) return pn(s);
  }
}
function pn(r) {
  return (
    (r.contentEditable = 'true'), q && r.draggable && ((r.draggable = !1), (r.wasDraggable = !0)), r
  );
}
function Br(r) {
  (r.contentEditable = 'false'), r.wasDraggable && ((r.draggable = !0), (r.wasDraggable = null));
}
function Sl(r) {
  const e = r.dom.ownerDocument;
  e.removeEventListener('selectionchange', r.input.hideSelectionGuard);
  const t = r.domSelectionRange(),
    n = t.anchorNode,
    i = t.anchorOffset;
  e.addEventListener(
    'selectionchange',
    (r.input.hideSelectionGuard = () => {
      (t.anchorNode != n || t.anchorOffset != i) &&
        (e.removeEventListener('selectionchange', r.input.hideSelectionGuard),
        setTimeout(() => {
          (!es(r) || r.state.selection.visible) &&
            r.dom.classList.remove('ProseMirror-hideselection');
        }, 20));
    }),
  );
}
function Ml(r) {
  const e = r.domSelection(),
    t = document.createRange(),
    n = r.cursorWrapper.dom,
    i = n.nodeName == 'IMG';
  i ? t.setEnd(n.parentNode, V(n) + 1) : t.setEnd(n, 0),
    t.collapse(!1),
    e.removeAllRanges(),
    e.addRange(t),
    !i && !r.state.selection.visible && U && ke <= 11 && ((n.disabled = !0), (n.disabled = !1));
}
function ts(r, e) {
  if (e instanceof S) {
    let t = r.docView.descAt(e.from);
    t != r.lastSelectedViewDesc && (zr(r), t && t.selectNode(), (r.lastSelectedViewDesc = t));
  } else zr(r);
}
function zr(r) {
  r.lastSelectedViewDesc &&
    (r.lastSelectedViewDesc.parent && r.lastSelectedViewDesc.deselectNode(),
    (r.lastSelectedViewDesc = void 0));
}
function Gn(r, e, t, n) {
  return r.someProp('createSelectionBetween', (i) => i(r, e, t)) || w.between(e, t, n);
}
function Fr(r) {
  return r.editable && !r.hasFocus() ? !1 : ns(r);
}
function ns(r) {
  const e = r.domSelectionRange();
  if (!e.anchorNode) return !1;
  try {
    return (
      r.dom.contains(e.anchorNode.nodeType == 3 ? e.anchorNode.parentNode : e.anchorNode) &&
      (r.editable ||
        r.dom.contains(e.focusNode.nodeType == 3 ? e.focusNode.parentNode : e.focusNode))
    );
  } catch {
    return !1;
  }
}
function Cl(r) {
  const e = r.docView.domFromPos(r.state.selection.anchor, 0),
    t = r.domSelectionRange();
  return Fe(e.node, e.offset, t.anchorNode, t.anchorOffset);
}
function Pn(r, e) {
  const { $anchor: t, $head: n } = r.selection,
    i = e > 0 ? t.max(n) : t.min(n),
    s = i.parent.inlineContent
      ? i.depth
        ? r.doc.resolve(e > 0 ? i.after() : i.before())
        : null
      : i;
  return s && O.findFrom(s, e);
}
function ue(r, e) {
  return r.dispatch(r.state.tr.setSelection(e).scrollIntoView()), !0;
}
function Vr(r, e, t) {
  const n = r.state.selection;
  if (n instanceof w)
    if (t.includes('s')) {
      let { $head: i } = n,
        s = i.textOffset ? null : e < 0 ? i.nodeBefore : i.nodeAfter;
      if (!s || s.isText || !s.isLeaf) return !1;
      let o = r.state.doc.resolve(i.pos + s.nodeSize * (e < 0 ? -1 : 1));
      return ue(r, new w(n.$anchor, o));
    } else if (n.empty) {
      if (r.endOfTextblock(e > 0 ? 'forward' : 'backward')) {
        let i = Pn(r.state, e);
        return i && i instanceof S ? ue(r, i) : !1;
      } else if (!(Y && t.includes('m'))) {
        let i = n.$head;
        let s = i.textOffset ? null : e < 0 ? i.nodeBefore : i.nodeAfter;
        let o;
        if (!s || s.isText) return !1;
        let l = e < 0 ? i.pos - s.nodeSize : i.pos;
        return s.isAtom || ((o = r.docView.descAt(l)) && !o.contentDOM)
          ? S.isSelectable(s)
            ? ue(r, new S(e < 0 ? r.state.doc.resolve(i.pos - s.nodeSize) : i))
            : kt
            ? ue(r, new w(r.state.doc.resolve(e < 0 ? l : l + s.nodeSize)))
            : !1
          : !1;
      }
    } else return !1;
  else {
    if (n instanceof S && n.node.isInline) return ue(r, new w(e > 0 ? n.$to : n.$from));
    {
      let i = Pn(r.state, e);
      return i ? ue(r, i) : !1;
    }
  }
}
function zt(r) {
  return r.nodeType == 3 ? r.nodeValue.length : r.childNodes.length;
}
function at(r, e) {
  const t = r.pmViewDesc;
  return t && t.size === 0 && (e < 0 || r.nextSibling || r.nodeName != 'BR');
}
function Je(r, e) {
  return e < 0 ? wl(r) : Ol(r);
}
function wl(r) {
  let e = r.domSelectionRange();
  let t = e.focusNode;
  let n = e.focusOffset;
  if (!t) return;
  let i;
  let s;
  let o = !1;
  for (ee && t.nodeType == 1 && n < zt(t) && at(t.childNodes[n], -1) && (o = !0); ; )
    if (n > 0) {
      if (t.nodeType != 1) break;
      {
        let l = t.childNodes[n - 1];
        if (at(l, -1)) (i = t), (s = --n);
        else if (l.nodeType == 3) (t = l), (n = t.nodeValue.length);
        else break;
      }
    } else {
      if (rs(t)) break;
      {
        let l = t.previousSibling;
        for (; l && at(l, -1); ) (i = t.parentNode), (s = V(l)), (l = l.previousSibling);
        if (l) (t = l), (n = zt(t));
        else {
          if (((t = t.parentNode), t == r.dom)) break;
          n = 0;
        }
      }
    }
  o ? Bn(r, t, n) : i && Bn(r, i, s);
}
function Ol(r) {
  let e = r.domSelectionRange();
  let t = e.focusNode;
  let n = e.focusOffset;
  if (!t) return;
  let i = zt(t);
  let s;
  let o;
  for (;;)
    if (n < i) {
      if (t.nodeType != 1) break;
      let l = t.childNodes[n];
      if (at(l, 1)) (s = t), (o = ++n);
      else break;
    } else {
      if (rs(t)) break;
      {
        let l = t.nextSibling;
        for (; l && at(l, 1); ) (s = l.parentNode), (o = V(l) + 1), (l = l.nextSibling);
        if (l) (t = l), (n = 0), (i = zt(t));
        else {
          if (((t = t.parentNode), t == r.dom)) break;
          n = i = 0;
        }
      }
    }
  s && Bn(r, s, o);
}
function rs(r) {
  const e = r.pmViewDesc;
  return e && e.node && e.node.isBlock;
}
function Nl(r, e) {
  for (; r && e == r.childNodes.length && !yt(r); ) (e = V(r) + 1), (r = r.parentNode);
  for (; r && e < r.childNodes.length; ) {
    let t = r.childNodes[e];
    if (t.nodeType == 3) return t;
    if (t.nodeType == 1 && t.contentEditable == 'false') break;
    (r = t), (e = 0);
  }
}
function Tl(r, e) {
  for (; r && !e && !yt(r); ) (e = V(r)), (r = r.parentNode);
  for (; r && e; ) {
    let t = r.childNodes[e - 1];
    if (t.nodeType == 3) return t;
    if (t.nodeType == 1 && t.contentEditable == 'false') break;
    (r = t), (e = r.childNodes.length);
  }
}
function Bn(r, e, t) {
  if (e.nodeType != 3) {
    let s, o;
    (o = Nl(e, t)) ? ((e = o), (t = 0)) : (s = Tl(e, t)) && ((e = s), (t = s.nodeValue.length));
  }
  const n = r.domSelection();
  if (Gt(n)) {
    let s = document.createRange();
    s.setEnd(e, t), s.setStart(e, t), n.removeAllRanges(), n.addRange(s);
  } else n.extend && n.extend(e, t);
  r.domObserver.setCurSelection();
  const { state: i } = r;
  setTimeout(() => {
    r.state == i && ae(r);
  }, 50);
}
function Lr(r, e) {
  const t = r.state.doc.resolve(e);
  if (!(j || Yo) && t.parent.inlineContent) {
    let i = r.coordsAtPos(e);
    if (e > t.start()) {
      let s = r.coordsAtPos(e - 1),
        o = (s.top + s.bottom) / 2;
      if (o > i.top && o < i.bottom && Math.abs(s.left - i.left) > 1)
        return s.left < i.left ? 'ltr' : 'rtl';
    }
    if (e < t.end()) {
      let s = r.coordsAtPos(e + 1),
        o = (s.top + s.bottom) / 2;
      if (o > i.top && o < i.bottom && Math.abs(s.left - i.left) > 1)
        return s.left > i.left ? 'ltr' : 'rtl';
    }
  }
  return getComputedStyle(r.dom).direction == 'rtl' ? 'rtl' : 'ltr';
}
function $r(r, e, t) {
  const n = r.state.selection;
  if ((n instanceof w && !n.empty) || t.includes('s') || (Y && t.includes('m'))) return !1;
  const { $from: i, $to: s } = n;
  if (!i.parent.inlineContent || r.endOfTextblock(e < 0 ? 'up' : 'down')) {
    let o = Pn(r.state, e);
    if (o && o instanceof S) return ue(r, o);
  }
  if (!i.parent.inlineContent) {
    let o = e < 0 ? i : s,
      l = n instanceof Q ? O.near(o, e) : O.findFrom(o, e);
    return l ? ue(r, l) : !1;
  }
  return !1;
}
function Jr(r, e) {
  if (!(r.state.selection instanceof w)) return !0;
  const { $head: t, $anchor: n, empty: i } = r.state.selection;
  if (!t.sameParent(n)) return !0;
  if (!i) return !1;
  if (r.endOfTextblock(e > 0 ? 'forward' : 'backward')) return !0;
  const s = !t.textOffset && (e < 0 ? t.nodeBefore : t.nodeAfter);
  if (s && !s.isText) {
    let o = r.state.tr;
    return (
      e < 0 ? o.delete(t.pos - s.nodeSize, t.pos) : o.delete(t.pos, t.pos + s.nodeSize),
      r.dispatch(o),
      !0
    );
  }
  return !1;
}
function Wr(r, e, t) {
  r.domObserver.stop(), (e.contentEditable = t), r.domObserver.start();
}
function El(r) {
  if (!q || r.state.selection.$head.parentOffset > 0) return !1;
  const { focusNode: e, focusOffset: t } = r.domSelectionRange();
  if (e && e.nodeType == 1 && t == 0 && e.firstChild && e.firstChild.contentEditable == 'false') {
    let n = e.firstChild;
    Wr(r, n, 'true'), setTimeout(() => Wr(r, n, 'false'), 20);
  }
  return !1;
}
function Dl(r) {
  let e = '';
  return (
    r.ctrlKey && (e += 'c'),
    r.metaKey && (e += 'm'),
    r.altKey && (e += 'a'),
    r.shiftKey && (e += 's'),
    e
  );
}
function Al(r, e) {
  const t = e.keyCode,
    n = Dl(e);
  if (t == 8 || (Y && t == 72 && n == 'c')) return Jr(r, -1) || Je(r, -1);
  if ((t == 46 && !e.shiftKey) || (Y && t == 68 && n == 'c')) return Jr(r, 1) || Je(r, 1);
  if (t == 13 || t == 27) return !0;
  if (t == 37 || (Y && t == 66 && n == 'c')) {
    let i = t == 37 ? (Lr(r, r.state.selection.from) == 'ltr' ? -1 : 1) : -1;
    return Vr(r, i, n) || Je(r, i);
  } else if (t == 39 || (Y && t == 70 && n == 'c')) {
    let i = t == 39 ? (Lr(r, r.state.selection.from) == 'ltr' ? 1 : -1) : 1;
    return Vr(r, i, n) || Je(r, i);
  } else {
    if (t == 38 || (Y && t == 80 && n == 'c')) return $r(r, -1, n) || Je(r, -1);
    if (t == 40 || (Y && t == 78 && n == 'c')) return El(r) || $r(r, 1, n) || Je(r, 1);
    if (n == (Y ? 'm' : 'c') && (t == 66 || t == 73 || t == 89 || t == 90)) return !0;
  }
  return !1;
}
function is(r, e) {
  r.someProp('transformCopied', (p) => {
    e = p(e, r);
  });
  let t = [];
  let { content: n, openStart: i, openEnd: s } = e;
  for (; i > 1 && s > 1 && n.childCount == 1 && n.firstChild.childCount == 1; ) {
    i--, s--;
    let p = n.firstChild;
    t.push(p.type.name, p.attrs == p.type.defaultAttrs ? null : p.attrs), (n = p.content);
  }
  const o = r.someProp('clipboardSerializer') || Le.fromSchema(r.state.schema),
    l = ds(),
    a = l.createElement('div');
  a.append(
    o.serializeFragment(n, {
      document: l,
    }),
  );
  let c: any = a.firstChild;
  let f;
  let d = 0;
  for (; c && c.nodeType == 1 && (f = fs[c.nodeName.toLowerCase()]); ) {
    for (let p = f.length - 1; p >= 0; p--) {
      let h = l.createElement(f[p]);
      for (; a.firstChild; ) h.append(a.firstChild);
      a.appendChild(h), d++;
    }
    c = a.firstChild;
  }
  //@ts-ignore
  if (c && c.nodeType == 1) {
    c.dataset.pmSlice = `${i} ${s}${d ? ` -${d}` : ''} ${JSON.stringify(t)}`;
    const u =
      r.someProp('clipboardTextSerializer', (p) => p(e, r)) ||
      e.content.textBetween(
        0,
        e.content.size,
        `

  `,
      );
  }
  return {
    dom: a,
    text: u,
    slice: e,
  };
}
function ss(r, e, t, n, i) {
  let s = i.parent.type.spec.code;
  let o;
  let l;
  if (!t && !e) return null;
  const a = e && (n || s || !t);
  if (a) {
    if (
      (r.someProp('transformPastedText', (u) => {
        e = u(e, s || n, r);
      }),
      s)
    )
      return e
        ? new b(
            k.from(
              r.state.schema.text(
                e.replaceAll(
                  /\r\n?/g,
                  `
`,
                ),
              ),
            ),
            0,
            0,
          )
        : b.empty;
    let d = r.someProp('clipboardTextParser', (u) => u(e, i, n, r));
    if (d) l = d;
    else {
      let u = i.marks(),
        { schema: p } = r.state,
        h = Le.fromSchema(p);
      (o = document.createElement('div')),
        e.split(/(?:\r\n?|\n)+/).forEach((m) => {
          let g = o.appendChild(document.createElement('p'));
          m && g.appendChild(h.serializeNode(p.text(m, u)));
        });
    }
  } else
    r.someProp('transformPastedHTML', (d) => {
      t = d(t, r);
    }),
      (o = Rl(t)),
      kt && Pl(o);
  const c = o && o.querySelector('[data-pm-slice]'),
    f = c && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(c.getAttribute('data-pm-slice') || '');
  if (f && f[3])
    for (let d = +f[3]; d > 0; d--) {
      let u = o.firstChild;
      for (; u && u.nodeType != 1; ) u = u.nextSibling;
      if (!u) break;
      o = u;
    }
  if (
    (l ||
      (l = (
        r.someProp('clipboardParser') ||
        r.someProp('domParser') ||
        Ge.fromSchema(r.state.schema)
      ).parseSlice(o, {
        preserveWhitespace: !!(a || f),
        context: i,
        ruleFromNode(u) {
          return u.nodeName == 'BR' &&
            !u.nextSibling &&
            u.parentNode &&
            !Il.test(u.parentNode.nodeName)
            ? {
                ignore: !0,
              }
            : null;
        },
      })),
    f)
  )
    l = Bl(jr(l, +f[1], +f[2]), f[4]);
  else if (((l = b.maxOpen(vl(l.content, i), !0)), l.openStart || l.openEnd)) {
    let d = 0,
      u = 0;
    for (
      let p = l.content.firstChild;
      d < l.openStart && !p.type.spec.isolating;
      d++, p = p.firstChild
    );
    for (
      let p = l.content.lastChild;
      u < l.openEnd && !p.type.spec.isolating;
      u++, p = p.lastChild
    );
    l = jr(l, d, u);
  }
  return (
    r.someProp('transformPasted', (d) => {
      l = d(l, r);
    }),
    l
  );
}
const Il =
  /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function vl(r, e) {
  if (r.childCount < 2) return r;
  for (let t = e.depth; t >= 0; t--) {
    let i = e.node(t).contentMatchAt(e.index(t));
    let s;
    let o = [];
    if (
      (r.forEach((l) => {
        if (!o) return;
        let a = i.findWrapping(l.type);
        let c;
        if (!a) return (o = null);
        if ((c = o.length && s.length && as(a, s, l, o.at(-1), 0))) o[o.length - 1] = c;
        else {
          o.length && (o[o.length - 1] = cs(o.at(-1), s.length));
          let f = ls(l, a);
          o.push(f), (i = i.matchType(f.type)), (s = a);
        }
      }),
      o)
    )
      return k.from(o);
  }
  return r;
}
function ls(r, e, t = 0) {
  for (let n = e.length - 1; n >= t; n--) r = e[n].create(null, k.from(r));
  return r;
}
function as(r, e, t, n, i) {
  if (i < r.length && i < e.length && r[i] == e[i]) {
    let s = as(r, e, t, n.lastChild, i + 1);
    if (s) return n.copy(n.content.replaceChild(n.childCount - 1, s));
    if (n.contentMatchAt(n.childCount).matchType(i == r.length - 1 ? t.type : r[i + 1]))
      return n.copy(n.content.append(k.from(ls(t, r, i + 1))));
  }
}
function cs(r, e) {
  if (e == 0) return r;
  const t = r.content.replaceChild(r.childCount - 1, cs(r.lastChild, e - 1)),
    n = r.contentMatchAt(r.childCount).fillBefore(k.empty, !0);
  return r.copy(t.append(n));
}
function zn(r, e, t, n, i, s) {
  let o = e < 0 ? r.firstChild : r.lastChild;
  let l = o.content;
  return (
    r.childCount > 1 && (s = 0),
    i < n - 1 && (l = zn(l, e, t, n, i + 1, s)),
    i >= t &&
      (l =
        e < 0
          ? o
              .contentMatchAt(0)
              .fillBefore(l, s <= i)
              .append(l)
          : l.append(o.contentMatchAt(o.childCount).fillBefore(k.empty, !0))),
    r.replaceChild(e < 0 ? 0 : r.childCount - 1, o.copy(l))
  );
}
function jr(r, e, t) {
  return (
    e < r.openStart && (r = new b(zn(r.content, -1, e, r.openStart, 0, r.openEnd), e, r.openEnd)),
    t < r.openEnd && (r = new b(zn(r.content, 1, t, r.openEnd, 0, 0), r.openStart, t)),
    r
  );
}
const fs = {
  thead: ['table'],
  tbody: ['table'],
  tfoot: ['table'],
  caption: ['table'],
  colgroup: ['table'],
  col: ['table', 'colgroup'],
  tr: ['table', 'tbody'],
  td: ['table', 'tbody', 'tr'],
  th: ['table', 'tbody', 'tr'],
};
let qr = null;
function ds() {
  return qr || (qr = document.implementation.createHTMLDocument('title'));
}
function Rl(r) {
  const e = /^(\s*<meta [^>]*>)*/.exec(r);
  e && (r = r.slice(e[0].length));
  let t = ds().createElement('div');
  let n = /<([a-z][^>\s]+)/i.exec(r);
  let i;
  if (
    ((i = n && fs[n[1].toLowerCase()]) &&
      (r =
        i.map((s) => '<' + s + '>').join('') +
        r +
        i
          .map((s) => '</' + s + '>')
          .reverse()
          .join('')),
    (t.innerHTML = r),
    i)
  )
    for (let s = 0; s < i.length; s++) t = t.querySelector(i[s]) || t;
  return t;
}
function Pl(r) {
  const e = r.querySelectorAll(j ? 'span:not([class]):not([style])' : 'span.Apple-converted-space');
  for (let n of e) {
    n.childNodes.length == 1 &&
      n.textContent == ' ' &&
      n.parentNode &&
      n.parentNode.replaceChild(r.ownerDocument.createTextNode(' '), n);
  }
}
function Bl(r, e) {
  if (r.size === 0) return r;
  let t = r.content.firstChild.type.schema;
  let n;
  try {
    n = JSON.parse(e);
  } catch {
    return r;
  }
  let { content: i, openStart: s, openEnd: o } = r;
  for (let l = n.length - 2; l >= 0; l -= 2) {
    let a = t.nodes[n[l]];
    if (!a || a.hasRequiredAttrs()) break;
    (i = k.from(a.create(n[l + 1], i))), s++, o++;
  }
  return new b(i, s, o);
}
const K = {},
  H = {},
  zl = {
    touchstart: !0,
    touchmove: !0,
  };
class Fl {
  constructor() {
    (this.shiftKey = !1),
      (this.mouseDown = null),
      (this.lastKeyCode = null),
      (this.lastKeyCodeTime = 0),
      (this.lastClick = {
        time: 0,
        x: 0,
        y: 0,
        type: '',
      }),
      (this.lastSelectionOrigin = null),
      (this.lastSelectionTime = 0),
      (this.lastIOSEnter = 0),
      (this.lastIOSEnterFallbackTimeout = -1),
      (this.lastFocus = 0),
      (this.lastTouch = 0),
      (this.lastAndroidDelete = 0),
      (this.composing = !1),
      (this.compositionNode = null),
      (this.composingTimeout = -1),
      (this.compositionNodes = []),
      (this.compositionEndedAt = -2e8),
      (this.compositionID = 1),
      (this.compositionPendingChanges = 0),
      (this.domChangeCount = 0),
      (this.eventHandlers = Object.create(null)),
      (this.hideSelectionGuard = null);
  }
}
function Vl(r) {
  for (const e in K) {
    let t = K[e];
    r.dom.addEventListener(
      e,
      (r.input.eventHandlers[e] = (n) => {
        $l(r, n) && !Yn(r, n) && (r.editable || !(n.type in H)) && t(r, n);
      }),
      zl[e]
        ? {
            passive: !0,
          }
        : void 0,
    );
  }
  q && r.dom.addEventListener('input', () => null), Fn(r);
}
function ge(r, e) {
  (r.input.lastSelectionOrigin = e), (r.input.lastSelectionTime = Date.now());
}
function Ll(r) {
  r.domObserver.stop();
  for (const e in r.input.eventHandlers) r.dom.removeEventListener(e, r.input.eventHandlers[e]);
  clearTimeout(r.input.composingTimeout), clearTimeout(r.input.lastIOSEnterFallbackTimeout);
}
function Fn(r) {
  r.someProp('handleDOMEvents', (e) => {
    for (const t in e)
      r.input.eventHandlers[t] ||
        r.dom.addEventListener(t, (r.input.eventHandlers[t] = (n) => Yn(r, n)));
  });
}
function Yn(r, e) {
  return r.someProp('handleDOMEvents', (t) => {
    let n = t[e.type];
    return n ? n(r, e) || e.defaultPrevented : !1;
  });
}
function $l(r, e) {
  if (!e.bubbles) return !0;
  if (e.defaultPrevented) return !1;
  for (let t = e.target; t != r.dom; t = t.parentNode)
    if (!t || t.nodeType == 11 || (t.pmViewDesc && t.pmViewDesc.stopEvent(e))) return !1;
  return !0;
}
function Jl(r, e) {
  !Yn(r, e) && K[e.type] && (r.editable || !(e.type in H)) && K[e.type](r, e);
}
H.keydown = (r, e) => {
  const t = e;
  if (
    ((r.input.shiftKey = t.keyCode == 16 || t.shiftKey),
    !hs(r, t) &&
      ((r.input.lastKeyCode = t.keyCode),
      (r.input.lastKeyCodeTime = Date.now()),
      !(_ && j && t.keyCode == 13)))
  )
    if (
      (t.keyCode != 229 && r.domObserver.forceFlush(),
      _e && t.keyCode == 13 && !t.ctrlKey && !t.altKey && !t.metaKey)
    ) {
      let n = Date.now();
      (r.input.lastIOSEnter = n),
        (r.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
          r.input.lastIOSEnter == n &&
            (r.someProp('handleKeyDown', (i) => i(r, Ne(13, 'Enter'))), (r.input.lastIOSEnter = 0));
        }, 200));
    } else
      r.someProp('handleKeyDown', (n) => n(r, t)) || Al(r, t) ? t.preventDefault() : ge(r, 'key');
};
H.keyup = (r, e) => {
  e.keyCode == 16 && (r.input.shiftKey = !1);
};
H.keypress = (r, e) => {
  const t = e;
  if (hs(r, t) || !t.charCode || (t.ctrlKey && !t.altKey) || (Y && t.metaKey)) return;
  if (r.someProp('handleKeyPress', (i) => i(r, t))) {
    t.preventDefault();
    return;
  }
  const n = r.state.selection;
  if (!(n instanceof w) || !n.$from.sameParent(n.$to)) {
    let i = String.fromCharCode(t.charCode);
    !/[\n\r]/.test(i) &&
      !r.someProp('handleTextInput', (s) => s(r, n.$from.pos, n.$to.pos, i)) &&
      r.dispatch(r.state.tr.insertText(i).scrollIntoView()),
      t.preventDefault();
  }
};
function Xt(r) {
  return {
    left: r.clientX,
    top: r.clientY,
  };
}
function Wl(r, e) {
  const t = e.x - r.clientX,
    n = e.y - r.clientY;
  return t * t + n * n < 100;
}
function Xn(r, e, t, n, i) {
  if (n == -1) return !1;
  const s = r.state.doc.resolve(n);
  for (let o = s.depth + 1; o > 0; o--)
    if (
      r.someProp(e, (l) =>
        o > s.depth
          ? l(r, t, s.nodeAfter, s.before(o), i, !0)
          : l(r, t, s.node(o), s.before(o), i, !1),
      )
    )
      return !0;
  return !1;
}
function Ue(r, e, t) {
  r.focused || r.focus();
  const n = r.state.tr.setSelection(e);
  n.setMeta('pointer', !0), r.dispatch(n);
}
function jl(r, e) {
  if (e == -1) return !1;
  const t = r.state.doc.resolve(e),
    n = t.nodeAfter;
  return n && n.isAtom && S.isSelectable(n) ? (Ue(r, new S(t)), !0) : !1;
}
function ql(r, e) {
  if (e == -1) return !1;
  let t = r.state.selection;
  let n;
  let i;
  t instanceof S && (n = t.node);
  const s = r.state.doc.resolve(e);
  for (let o = s.depth + 1; o > 0; o--) {
    let l = o > s.depth ? s.nodeAfter : s.node(o);
    if (S.isSelectable(l)) {
      n && t.$from.depth > 0 && o >= t.$from.depth && s.before(t.$from.depth + 1) == t.$from.pos
        ? (i = s.before(t.$from.depth))
        : (i = s.before(o));
      break;
    }
  }
  return i == null ? !1 : (Ue(r, S.create(r.state.doc, i)), !0);
}
function Kl(r, e, t, n, i) {
  return (
    Xn(r, 'handleClickOn', e, t, n) ||
    r.someProp('handleClick', (s) => s(r, e, n)) ||
    (i ? ql(r, t) : jl(r, t))
  );
}
function Hl(r, e, t, n) {
  return (
    Xn(r, 'handleDoubleClickOn', e, t, n) || r.someProp('handleDoubleClick', (i) => i(r, e, n))
  );
}
function Ul(r, e, t, n) {
  return (
    Xn(r, 'handleTripleClickOn', e, t, n) ||
    r.someProp('handleTripleClick', (i) => i(r, e, n)) ||
    Gl(r, t, n)
  );
}
function Gl(r, e, t) {
  if (t.button != 0) return !1;
  const n = r.state.doc;
  if (e == -1) return n.inlineContent ? (Ue(r, w.create(n, 0, n.content.size)), !0) : !1;
  const i = n.resolve(e);
  for (let s = i.depth + 1; s > 0; s--) {
    let o = s > i.depth ? i.nodeAfter : i.node(s),
      l = i.before(s);
    if (o.inlineContent) Ue(r, w.create(n, l + 1, l + 1 + o.content.size));
    else if (S.isSelectable(o)) Ue(r, S.create(n, l));
    else continue;
    return !0;
  }
}
function _n(r) {
  return Ft(r);
}
const us = Y ? 'metaKey' : 'ctrlKey';
K.mousedown = (r, e) => {
  const t = e;
  r.input.shiftKey = t.shiftKey;
  let n = _n(r);
  let i = Date.now();
  let s = 'singleClick';
  i - r.input.lastClick.time < 500 &&
    Wl(t, r.input.lastClick) &&
    !t[us] &&
    (r.input.lastClick.type == 'singleClick'
      ? (s = 'doubleClick')
      : r.input.lastClick.type == 'doubleClick' && (s = 'tripleClick')),
    (r.input.lastClick = {
      time: i,
      x: t.clientX,
      y: t.clientY,
      type: s,
    });
  const o = r.posAtCoords(Xt(t));
  o &&
    (s == 'singleClick'
      ? (r.input.mouseDown && r.input.mouseDown.done(), (r.input.mouseDown = new Yl(r, o, t, !!n)))
      : (s == 'doubleClick' ? Hl : Ul)(r, o.pos, o.inside, t)
      ? t.preventDefault()
      : ge(r, 'pointer'));
};
class Yl {
  constructor(e, t, n, i) {
    (this.view = e),
      (this.pos = t),
      (this.event = n),
      (this.flushed = i),
      (this.delayedSelectionSync = !1),
      (this.mightDrag = null),
      (this.startDoc = e.state.doc),
      (this.selectNode = !!n[us]),
      (this.allowDefault = n.shiftKey);
    let s, o;
    if (t.inside > -1) (s = e.state.doc.nodeAt(t.inside)), (o = t.inside);
    else {
      let f = e.state.doc.resolve(t.pos);
      (s = f.parent), (o = f.depth ? f.before() : 0);
    }
    const l = i ? null : n.target,
      a = l ? e.docView.nearestDesc(l, !0) : null;
    this.target = a && a.dom.nodeType == 1 ? a.dom : null;
    let { selection: c } = e.state;
    ((n.button == 0 && s.type.spec.draggable && s.type.spec.selectable !== !1) ||
      (c instanceof S && c.from <= o && c.to > o)) &&
      (this.mightDrag = {
        node: s,
        pos: o,
        addAttr: !!(this.target && !this.target.draggable),
        setUneditable: !!(this.target && ee && !this.target.hasAttribute('contentEditable')),
      }),
      this.target &&
        this.mightDrag &&
        (this.mightDrag.addAttr || this.mightDrag.setUneditable) &&
        (this.view.domObserver.stop(),
        this.mightDrag.addAttr && (this.target.draggable = !0),
        this.mightDrag.setUneditable &&
          setTimeout(() => {
            this.view.input.mouseDown == this &&
              this.target.setAttribute('contentEditable', 'false');
          }, 20),
        this.view.domObserver.start()),
      e.root.addEventListener('mouseup', (this.up = this.up.bind(this))),
      e.root.addEventListener('mousemove', (this.move = this.move.bind(this))),
      ge(e, 'pointer');
  }

  done() {
    this.view.root.removeEventListener('mouseup', this.up),
      this.view.root.removeEventListener('mousemove', this.move),
      this.mightDrag &&
        this.target &&
        (this.view.domObserver.stop(),
        this.mightDrag.addAttr && this.target.removeAttribute('draggable'),
        this.mightDrag.setUneditable && this.target.removeAttribute('contentEditable'),
        this.view.domObserver.start()),
      this.delayedSelectionSync && setTimeout(() => ae(this.view)),
      (this.view.input.mouseDown = null);
  }

  up(e) {
    if ((this.done(), !this.view.dom.contains(e.target))) return;
    let t = this.pos;
    this.view.state.doc != this.startDoc && (t = this.view.posAtCoords(Xt(e))),
      this.updateAllowDefault(e),
      this.allowDefault || !t
        ? ge(this.view, 'pointer')
        : Kl(this.view, t.pos, t.inside, e, this.selectNode)
        ? e.preventDefault()
        : e.button == 0 &&
          (this.flushed ||
            (q && this.mightDrag && !this.mightDrag.node.isAtom) ||
            (j &&
              !this.view.state.selection.visible &&
              Math.min(
                Math.abs(t.pos - this.view.state.selection.from),
                Math.abs(t.pos - this.view.state.selection.to),
              ) <= 2))
        ? (Ue(this.view, O.near(this.view.state.doc.resolve(t.pos))), e.preventDefault())
        : ge(this.view, 'pointer');
  }

  move(e) {
    this.updateAllowDefault(e), ge(this.view, 'pointer'), e.buttons == 0 && this.done();
  }

  updateAllowDefault(e) {
    !this.allowDefault &&
      (Math.abs(this.event.x - e.clientX) > 4 || Math.abs(this.event.y - e.clientY) > 4) &&
      (this.allowDefault = !0);
  }
}
K.touchstart = (r) => {
  (r.input.lastTouch = Date.now()), _n(r), ge(r, 'pointer');
};
K.touchmove = (r) => {
  (r.input.lastTouch = Date.now()), ge(r, 'pointer');
};
K.contextmenu = (r) => _n(r);
function hs(r, e) {
  return r.composing
    ? !0
    : q && Math.abs(e.timeStamp - r.input.compositionEndedAt) < 500
    ? ((r.input.compositionEndedAt = -2e8), !0)
    : !1;
}
const Xl = _ ? 5e3 : -1;
H.compositionstart = H.compositionupdate = (r) => {
  if (!r.composing) {
    r.domObserver.flush();
    let { state: e } = r,
      t = e.selection.$from;
    if (
      e.selection.empty &&
      (e.storedMarks ||
        (!t.textOffset &&
          t.parentOffset &&
          t.nodeBefore.marks.some((n) => n.type.spec.inclusive === !1)))
    )
      (r.markCursor = r.state.storedMarks || t.marks()), Ft(r, !0), (r.markCursor = null);
    else if (
      (Ft(r),
      ee && e.selection.empty && t.parentOffset && !t.textOffset && t.nodeBefore.marks.length)
    ) {
      let n = r.domSelectionRange();
      for (let i = n.focusNode, s = n.focusOffset; i && i.nodeType == 1 && s != 0; ) {
        let o = s < 0 ? i.lastChild : i.childNodes[s - 1];
        if (!o) break;
        if (o.nodeType == 3) {
          r.domSelection().collapse(o, o.nodeValue.length);
          break;
        } else (i = o), (s = -1);
      }
    }
    r.input.composing = !0;
  }
  ps(r, Xl);
};
H.compositionend = (r, e) => {
  r.composing &&
    ((r.input.composing = !1),
    (r.input.compositionEndedAt = e.timeStamp),
    (r.input.compositionPendingChanges =
      r.domObserver.pendingRecords().length > 0 ? r.input.compositionID : 0),
    (r.input.compositionNode = null),
    r.input.compositionPendingChanges && Promise.resolve().then(() => r.domObserver.flush()),
    r.input.compositionID++,
    ps(r, 20));
};
function ps(r, e) {
  clearTimeout(r.input.composingTimeout),
    e > -1 && (r.input.composingTimeout = setTimeout(() => Ft(r), e));
}
function ms(r) {
  for (
    r.composing && ((r.input.composing = !1), (r.input.compositionEndedAt = Zl()));
    r.input.compositionNodes.length > 0;

  )
    r.input.compositionNodes.pop().markParentsDirty();
}
function _l(r) {
  const e = r.domSelectionRange();
  if (!e.focusNode) return null;
  const t = jo(e.focusNode, e.focusOffset),
    n = qo(e.focusNode, e.focusOffset);
  if (t && n && t != n) {
    let i = n.pmViewDesc,
      s = r.domObserver.lastChangedTextNode;
    if (t == s || n == s) return s;
    if (!i || !i.isText(n.nodeValue)) return n;
    if (r.input.compositionNode == n) {
      let o = t.pmViewDesc;
      if (!(!o || !o.isText(t.nodeValue))) return n;
    }
  }
  return t || n;
}
function Zl() {
  const r = document.createEvent('Event');
  return r.initEvent('event', !0, !0), r.timeStamp;
}
function Ft(r, e = !1) {
  if (!(_ && r.domObserver.flushingSoon >= 0)) {
    if ((r.domObserver.forceFlush(), ms(r), e || (r.docView && r.docView.dirty))) {
      let t = Un(r);
      return (
        t && !t.eq(r.state.selection)
          ? r.dispatch(r.state.tr.setSelection(t))
          : r.updateState(r.state),
        !0
      );
    }
    return !1;
  }
}
function Ql(r, e) {
  if (!r.dom.parentNode) return;
  const t = r.dom.parentNode.appendChild(document.createElement('div'));
  t.appendChild(e), (t.style.cssText = 'position: fixed; left: -10000px; top: 10px');
  const n = getSelection(),
    i = document.createRange();
  i.selectNodeContents(e),
    r.dom.blur(),
    n.removeAllRanges(),
    n.addRange(i),
    setTimeout(() => {
      t.parentNode && t.parentNode.removeChild(t), r.focus();
    }, 50);
}
const ut = (U && ke < 15) || (_e && Xo < 604);
K.copy = H.cut = (r, e) => {
  const t = e,
    n = r.state.selection,
    i = t.type == 'cut';
  if (n.empty) return;
  const s = ut ? null : t.clipboardData,
    o = n.content(),
    { dom: l, text: a } = is(r, o);
  s
    ? (t.preventDefault(),
      s.clearData(),
      s.setData('text/html', l.innerHTML),
      s.setData('text/plain', a))
    : Ql(r, l),
    i && r.dispatch(r.state.tr.deleteSelection().scrollIntoView().setMeta('uiEvent', 'cut'));
};
function ea(r) {
  return r.openStart == 0 && r.openEnd == 0 && r.content.childCount == 1
    ? r.content.firstChild
    : null;
}
function ta(r, e) {
  if (!r.dom.parentNode) return;
  const t = r.input.shiftKey || r.state.selection.$from.parent.type.spec.code,
    n = r.dom.parentNode.appendChild(document.createElement(t ? 'textarea' : 'div'));
  t || (n.contentEditable = 'true'),
    (n.style.cssText = 'position: fixed; left: -10000px; top: 10px'),
    n.focus();
  const i = r.input.shiftKey && r.input.lastKeyCode != 45;
  setTimeout(() => {
    r.focus(),
      n.parentNode && n.parentNode.removeChild(n),
      t ? ht(r, n.value, null, i, e) : ht(r, n.textContent, n.innerHTML, i, e);
  }, 50);
}
function ht(r, e, t, n, i) {
  const s = ss(r, e, t, n, r.state.selection.$from);
  if (r.someProp('handlePaste', (a) => a(r, i, s || b.empty))) return !0;
  if (!s) return !1;
  const o = ea(s),
    l = o ? r.state.tr.replaceSelectionWith(o, n) : r.state.tr.replaceSelection(s);
  return r.dispatch(l.scrollIntoView().setMeta('paste', !0).setMeta('uiEvent', 'paste')), !0;
}
function gs(r) {
  const e = r.getData('text/plain') || r.getData('Text');
  if (e) return e;
  const t = r.getData('text/uri-list');
  return t ? t.replaceAll(/\r?\n/g, ' ') : '';
}
H.paste = (r, e) => {
  const t = e;
  if (r.composing && !_) return;
  const n = ut ? null : t.clipboardData,
    i = r.input.shiftKey && r.input.lastKeyCode != 45;
  n && ht(r, gs(n), n.getData('text/html'), i, t) ? t.preventDefault() : ta(r, t);
};
class ys {
  constructor(e, t, n) {
    (this.slice = e), (this.move = t), (this.node = n);
  }
}
const ks = Y ? 'altKey' : 'ctrlKey';
K.dragstart = (r, e) => {
  const t = e,
    n = r.input.mouseDown;
  if ((n && n.done(), !t.dataTransfer)) return;
  let i = r.state.selection;
  let s = i.empty ? null : r.posAtCoords(Xt(t));
  let o;
  if (!(s && s.pos >= i.from && s.pos <= (i instanceof S ? i.to - 1 : i.to))) {
    if (n && n.mightDrag) o = S.create(r.state.doc, n.mightDrag.pos);
    else if (t.target && t.target.nodeType == 1) {
      let d = r.docView.nearestDesc(t.target, !0);
      d && d.node.type.spec.draggable && d != r.docView && (o = S.create(r.state.doc, d.posBefore));
    }
  }
  const l = (o || r.state.selection).content(),
    { dom: a, text: c, slice: f } = is(r, l);
  t.dataTransfer.clearData(),
    t.dataTransfer.setData(ut ? 'Text' : 'text/html', a.innerHTML),
    (t.dataTransfer.effectAllowed = 'copyMove'),
    ut || t.dataTransfer.setData('text/plain', c),
    (r.dragging = new ys(f, !t[ks], o));
};
K.dragend = (r) => {
  const e = r.dragging;
  window.setTimeout(() => {
    r.dragging == e && (r.dragging = null);
  }, 50);
};
H.dragover = H.dragenter = (r, e) => e.preventDefault();
H.drop = (r, e) => {
  const t = e,
    n = r.dragging;
  if (((r.dragging = null), !t.dataTransfer)) return;
  const i = r.posAtCoords(Xt(t));
  if (!i) return;
  let s = r.state.doc.resolve(i.pos);
  let o = n && n.slice;
  o
    ? r.someProp('transformPasted', (h) => {
        o = h(o, r);
      })
    : (o = ss(r, gs(t.dataTransfer), ut ? null : t.dataTransfer.getData('text/html'), !1, s));
  const l = !!(n && !t[ks]);
  if (r.someProp('handleDrop', (h) => h(r, t, o || b.empty, l))) {
    t.preventDefault();
    return;
  }
  if (!o) return;
  t.preventDefault();
  let a = o ? Ao(r.state.doc, s.pos, o) : s.pos;
  a == undefined && (a = s.pos);
  const c = r.state.tr;
  if (l) {
    let { node: h } = n;
    h ? h.replace(c) : c.deleteSelection();
  }
  const f = c.mapping.map(a),
    d = o.openStart == 0 && o.openEnd == 0 && o.content.childCount == 1,
    u = c.doc;
  if ((d ? c.replaceRangeWith(f, f, o.content.firstChild) : c.replaceRange(f, f, o), c.doc.eq(u)))
    return;
  const p = c.doc.resolve(f);
  if (
    d &&
    S.isSelectable(o.content.firstChild) &&
    p.nodeAfter &&
    p.nodeAfter.sameMarkup(o.content.firstChild)
  )
    c.setSelection(new S(p));
  else {
    let h = c.mapping.map(a);
    c.mapping.maps.at(-1).forEach((m, g, y, M) => (h = M)),
      c.setSelection(Gn(r, p, c.doc.resolve(h)));
  }
  r.focus(), r.dispatch(c.setMeta('uiEvent', 'drop'));
};
K.focus = (r) => {
  (r.input.lastFocus = Date.now()),
    r.focused ||
      (r.domObserver.stop(),
      r.dom.classList.add('ProseMirror-focused'),
      r.domObserver.start(),
      (r.focused = !0),
      setTimeout(() => {
        r.docView &&
          r.hasFocus() &&
          !r.domObserver.currentSelection.eq(r.domSelectionRange()) &&
          ae(r);
      }, 20));
};
K.blur = (r, e) => {
  const t = e;
  r.focused &&
    (r.domObserver.stop(),
    r.dom.classList.remove('ProseMirror-focused'),
    r.domObserver.start(),
    t.relatedTarget && r.dom.contains(t.relatedTarget) && r.domObserver.currentSelection.clear(),
    (r.focused = !1));
};
K.beforeinput = (r, e) => {
  if (j && _ && e.inputType == 'deleteContentBackward') {
    r.domObserver.flushSoon();
    let { domChangeCount: n } = r.input;
    setTimeout(() => {
      if (
        r.input.domChangeCount != n ||
        (r.dom.blur(), r.focus(), r.someProp('handleKeyDown', (s) => s(r, Ne(8, 'Backspace'))))
      )
        return;
      let { $cursor: i } = r.state.selection;
      i && i.pos > 0 && r.dispatch(r.state.tr.delete(i.pos - 1, i.pos).scrollIntoView());
    }, 50);
  }
};
for (const r in H) {
  K[r] = H[r];
}
function pt(r, e) {
  if (r == e) return !0;
  for (const t in r) if (r[t] !== e[t]) return !1;
  for (const t in e) if (!(t in r)) return !1;
  return !0;
}
class Vt {
  constructor(e, t) {
    (this.toDOM = e), (this.spec = t || Pe), (this.side = this.spec.side || 0);
  }

  map(e, t, n, i) {
    let { pos: s, deleted: o } = e.mapResult(t.from + i, this.side < 0 ? -1 : 1);
    return o ? null : new Z(s - n, s - n, this);
  }

  valid() {
    return !0;
  }

  eq(e) {
    return (
      this == e ||
      (e instanceof Vt &&
        ((this.spec.key && this.spec.key == e.spec.key) ||
          (this.toDOM == e.toDOM && pt(this.spec, e.spec))))
    );
  }

  destroy(e) {
    this.spec.destroy && this.spec.destroy(e);
  }
}
class xe {
  constructor(e, t) {
    (this.attrs = e), (this.spec = t || Pe);
  }

  map(e, t, n, i) {
    let s = e.map(t.from + i, this.spec.inclusiveStart ? -1 : 1) - n,
      o = e.map(t.to + i, this.spec.inclusiveEnd ? 1 : -1) - n;
    return s >= o ? null : new Z(s, o, this);
  }

  valid(e, t) {
    return t.from < t.to;
  }

  eq(e) {
    return this == e || (e instanceof xe && pt(this.attrs, e.attrs) && pt(this.spec, e.spec));
  }

  static is(e) {
    return e.type instanceof xe;
  }

  destroy() {}
}
class Zn {
  constructor(e, t) {
    (this.attrs = e), (this.spec = t || Pe);
  }

  map(e, t, n, i) {
    let s = e.mapResult(t.from + i, 1);
    if (s.deleted) return null;
    let o = e.mapResult(t.to + i, -1);
    return o.deleted || o.pos <= s.pos ? null : new Z(s.pos - n, o.pos - n, this);
  }

  valid(e, t) {
    let { index: n, offset: i } = e.content.findIndex(t.from);
    let s;
    return i == t.from && !(s = e.child(n)).isText && i + s.nodeSize == t.to;
  }

  eq(e) {
    return this == e || (e instanceof Zn && pt(this.attrs, e.attrs) && pt(this.spec, e.spec));
  }

  destroy() {}
}
class Z {
  constructor(e, t, n) {
    (this.from = e), (this.to = t), (this.type = n);
  }

  copy(e, t) {
    return new Z(e, t, this.type);
  }

  eq(e, t = 0) {
    return this.type.eq(e.type) && this.from + t == e.from && this.to + t == e.to;
  }

  map(e, t, n) {
    return this.type.map(e, this, t, n);
  }

  static widget(e, t, n) {
    return new Z(e, e, new Vt(t, n));
  }

  static inline(e, t, n, i) {
    return new Z(e, t, new xe(n, i));
  }

  static node(e, t, n, i) {
    return new Z(e, t, new Zn(n, i));
  }

  get spec() {
    return this.type.spec;
  }

  get inline() {
    return this.type instanceof xe;
  }

  get widget() {
    return this.type instanceof Vt;
  }
}
const je = [],
  Pe = {};
class R {
  constructor(e, t) {
    (this.local = e.length > 0 ? e : je), (this.children = t.length > 0 ? t : je);
  }

  static create(e, t) {
    return t.length > 0 ? Lt(t, e, 0, Pe) : J;
  }

  find(e, t, n) {
    let i = [];
    return this.findInner(e ?? 0, t ?? 1e9, i, 0, n), i;
  }

  findInner(e, t, n, i, s) {
    for (let o = 0; o < this.local.length; o++) {
      let l = this.local[o];
      l.from <= t && l.to >= e && (!s || s(l.spec)) && n.push(l.copy(l.from + i, l.to + i));
    }
    for (let o = 0; o < this.children.length; o += 3)
      if (this.children[o] < t && this.children[o + 1] > e) {
        let l = this.children[o] + 1;
        this.children[o + 2].findInner(e - l, t - l, n, i + l, s);
      }
  }

  map(e, t, n) {
    return this == J || e.maps.length === 0 ? this : this.mapInner(e, t, 0, 0, n || Pe);
  }

  mapInner(e, t, n, i, s) {
    let o;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l].map(e, n, i);
      a && a.type.valid(t, a)
        ? (o || (o = [])).push(a)
        : s.onRemove && s.onRemove(this.local[l].spec);
    }
    return this.children.length > 0
      ? na(this.children, o || [], e, t, n, i, s)
      : o
      ? new R(o.sort(Be), je)
      : J;
  }

  add(e, t) {
    return t.length > 0 ? (this == J ? R.create(e, t) : this.addInner(e, t, 0)) : this;
  }

  addInner(e, t, n) {
    let i;
    let s = 0;
    e.forEach((l, a) => {
      let c = a + n;
      let f;
      if ((f = xs(t, l, c))) {
        for (i || (i = [...this.children]); s < i.length && i[s] < a; ) s += 3;
        i[s] == a
          ? (i[s + 2] = i[s + 2].addInner(l, f, c + 1))
          : i.splice(s, 0, a, a + l.nodeSize, Lt(f, l, c + 1, Pe)),
          (s += 3);
      }
    });
    let o = bs(s ? Ss(t) : t, -n);
    for (let l = 0; l < o.length; l++) o[l].type.valid(e, o[l]) || o.splice(l--, 1);
    return new R(o.length > 0 ? this.local.concat(o).sort(Be) : this.local, i || this.children);
  }

  remove(e) {
    return e.length === 0 || this == J ? this : this.removeInner(e, 0);
  }

  removeInner(e, t) {
    let n = this.children,
      i = this.local;
    for (let s = 0; s < n.length; s += 3) {
      let o;
      let l = n[s] + t;
      let a = n[s + 1] + t;
      for (let f = 0, d; f < e.length; f++)
        (d = e[f]) && d.from > l && d.to < a && ((e[f] = null), (o || (o = [])).push(d));
      if (!o) continue;
      n == this.children && (n = [...this.children]);
      let c = n[s + 2].removeInner(o, l + 1);
      c == J ? (n.splice(s, 3), (s -= 3)) : (n[s + 2] = c);
    }
    if (i.length > 0) {
      for (let s = 0, o; s < e.length; s++)
        if ((o = e[s]))
          for (let l = 0; l < i.length; l++)
            i[l].eq(o, t) && (i == this.local && (i = [...this.local]), i.splice(l--, 1));
    }
    return n == this.children && i == this.local
      ? this
      : i.length > 0 || n.length > 0
      ? new R(i, n)
      : J;
  }

  forChild(e, t) {
    if (this == J) return this;
    if (t.isLeaf) return R.empty;
    let n, i;
    for (let l = 0; l < this.children.length; l += 3)
      if (this.children[l] >= e) {
        this.children[l] == e && (n = this.children[l + 2]);
        break;
      }
    let s = e + 1,
      o = s + t.content.size;
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l];
      if (a.from < o && a.to > s && a.type instanceof xe) {
        let c = Math.max(s, a.from) - s,
          f = Math.min(o, a.to) - s;
        c < f && (i || (i = [])).push(a.copy(c, f));
      }
    }
    if (i) {
      let l = new R(i.sort(Be), je);
      return n ? new he([l, n]) : l;
    }
    return n || J;
  }

  eq(e) {
    if (this == e) return !0;
    if (
      !(e instanceof R) ||
      this.local.length != e.local.length ||
      this.children.length != e.children.length
    )
      return !1;
    for (let t = 0; t < this.local.length; t++) if (!this.local[t].eq(e.local[t])) return !1;
    for (let t = 0; t < this.children.length; t += 3)
      if (
        this.children[t] != e.children[t] ||
        this.children[t + 1] != e.children[t + 1] ||
        !this.children[t + 2].eq(e.children[t + 2])
      )
        return !1;
    return !0;
  }

  locals(e) {
    console.log({
      e,
    });

    return Qn(this.localsInner(e));
  }

  localsInner(e) {
    if (this == J) return je;
    if (e.inlineContent || !this.local.some(xe.is)) return this.local;
    let t = [];
    for (let n = 0; n < this.local.length; n++)
      this.local[n].type instanceof xe || t.push(this.local[n]);
    return t;
  }
}
R.empty = new R([], []);
R.removeOverlap = Qn;
const J = R.empty;
class he {
  constructor(e) {
    this.members = e;
  }

  map(e, t) {
    const n = this.members.map((i) => i.map(e, t, Pe));
    return he.from(n);
  }

  forChild(e, t) {
    if (t.isLeaf) return R.empty;
    let n = [];
    for (let i = 0; i < this.members.length; i++) {
      let s = this.members[i].forChild(e, t);
      s != J && (s instanceof he ? (n = n.concat(s.members)) : n.push(s));
    }
    return he.from(n);
  }

  eq(e) {
    if (!(e instanceof he) || e.members.length != this.members.length) return !1;
    for (let t = 0; t < this.members.length; t++) if (!this.members[t].eq(e.members[t])) return !1;
    return !0;
  }

  locals(e) {
    let t;
    let n = !0;
    for (let i = 0; i < this.members.length; i++) {
      let s = this.members[i].localsInner(e);
      if (s.length > 0)
        if (t) {
          n && ((t = t.slice()), (n = !1));
          for (let o = 0; o < s.length; o++) t.push(s[o]);
        } else {
          t = s;
        }
    }
    return t ? Qn(n ? t : t.sort(Be)) : je;
  }

  static from(e) {
    switch (e.length) {
      case 0: {
        return J;
      }
      case 1: {
        return e[0];
      }
      default: {
        return new he(
          e.every((t) => t instanceof R)
            ? e
            : e.reduce((t, n) => t.concat(n instanceof R ? n : n.members), []),
        );
      }
    }
  }
}
function na(r, e, t, n, i, s, o) {
  const l = r.slice();
  for (let c = 0, f = s; c < t.maps.length; c++) {
    let d = 0;
    t.maps[c].forEach((u, p, h, m) => {
      let g = m - h - (p - u);
      for (let y = 0; y < l.length; y += 3) {
        let M = l[y + 1];
        if (M < 0 || u > M + f - d) continue;
        let N = l[y] + f - d;
        p >= N ? (l[y + 1] = u <= N ? -2 : -1) : u >= f && g && ((l[y] += g), (l[y + 1] += g));
      }
      d += g;
    }),
      (f = t.maps[c].map(f, -1));
  }
  let a = !1;
  for (let c = 0; c < l.length; c += 3)
    if (l[c + 1] < 0) {
      if (l[c + 1] == -2) {
        (a = !0), (l[c + 1] = -1);
        continue;
      }
      let f = t.map(r[c] + s),
        d = f - i;
      if (d < 0 || d >= n.content.size) {
        a = !0;
        continue;
      }
      let u = t.map(r[c + 1] + s, -1),
        p = u - i,
        { index: h, offset: m } = n.content.findIndex(d),
        g = n.maybeChild(h);
      if (g && m == d && m + g.nodeSize == p) {
        let y = l[c + 2].mapInner(t, g, f + 1, r[c] + s + 1, o);
        y == J ? ((l[c + 1] = -2), (a = !0)) : ((l[c] = d), (l[c + 1] = p), (l[c + 2] = y));
      } else a = !0;
    }
  if (a) {
    let c = ra(l, r, e, t, i, s, o),
      f = Lt(c, n, 0, o);
    e = f.local;
    for (let d = 0; d < l.length; d += 3) l[d + 1] < 0 && (l.splice(d, 3), (d -= 3));
    for (let d = 0, u = 0; d < f.children.length; d += 3) {
      let p = f.children[d];
      for (; u < l.length && l[u] < p; ) u += 3;
      l.splice(u, 0, f.children[d], f.children[d + 1], f.children[d + 2]);
    }
  }
  return new R(e.sort(Be), l);
}
function bs(r, e) {
  if (!e || r.length === 0) return r;
  const t = [];
  for (let i of r) {
    t.push(new Z(i.from + e, i.to + e, i.type));
  }
  return t;
}
function ra(r, e, t, n, i, s, o) {
  function l(a, c) {
    for (let f = 0; f < a.local.length; f++) {
      let d = a.local[f].map(n, i, c);
      d ? t.push(d) : o.onRemove && o.onRemove(a.local[f].spec);
    }
    for (let f = 0; f < a.children.length; f += 3) l(a.children[f + 2], a.children[f] + c + 1);
  }
  for (let a = 0; a < r.length; a += 3) r[a + 1] == -1 && l(r[a + 2], e[a] + s + 1);
  return t;
}
function xs(r, e, t) {
  if (e.isLeaf) return null;
  let n = t + e.nodeSize;
  let i = null;
  for (let s = 0, o; s < r.length; s++)
    (o = r[s]) && o.from > t && o.to < n && ((i || (i = [])).push(o), (r[s] = null));
  return i;
}
function Ss(r) {
  const e = [];
  for (let t = 0; t < r.length; t++) r[t] != undefined && e.push(r[t]);
  return e;
}
function Lt(r, e, t, n) {
  let i = [];
  let s = !1;

  const entries = Array.isArray(e) ? e.entries() : Object.entries(e);
  for (const [a, l] of entries) {
    let c = xs(r, l, a + t);
    if (c) {
      s = !0;
      let f = Lt(c, l, t + a + 1, n);
      f != J && i.push(a, a + l.nodeSize, f);
    }
  }

  const o = bs(s ? Ss(r) : r, -t).sort(Be);
  for (let l = 0; l < o.length; l++)
    o[l].type.valid(e, o[l]) || (n.onRemove && n.onRemove(o[l].spec), o.splice(l--, 1));
  return o.length > 0 || i.length > 0 ? new R(o, i) : J;
}
function Be(r, e) {
  return r.from - e.from || r.to - e.to;
}
function Qn(r) {
  let e = r;
  for (let t = 0; t < e.length - 1; t++) {
    let n = e[t];
    if (n.from != n.to)
      for (let i = t + 1; i < e.length; i++) {
        let s = e[i];
        if (s.from == n.from) {
          s.to != n.to &&
            (e == r && (e = [...r]),
            (e[i] = s.copy(s.from, n.to)),
            Kr(e, i + 1, s.copy(n.to, s.to)));
          continue;
        } else {
          s.from < n.to &&
            (e == r && (e = [...r]),
            (e[t] = n.copy(n.from, s.from)),
            Kr(e, i, n.copy(s.from, n.to)));
          break;
        }
      }
  }
  return e;
}
function Kr(r, e, t) {
  for (; e < r.length && Be(t, r[e]) > 0; ) e++;
  r.splice(e, 0, t);
}
function mn(r) {
  const e = [];
  return (
    r.someProp('decorations', (t) => {
      let n = t(r.state);
      n && n != J && e.push(n);
    }),
    r.cursorWrapper && e.push(R.create(r.state.doc, [r.cursorWrapper.deco])),
    he.from(e)
  );
}
const ia = {
    childList: !0,
    characterData: !0,
    characterDataOldValue: !0,
    attributes: !0,
    attributeOldValue: !0,
    subtree: !0,
  },
  sa = U && ke <= 11;
class oa {
  constructor() {
    (this.anchorNode = null),
      (this.anchorOffset = 0),
      (this.focusNode = null),
      (this.focusOffset = 0);
  }

  set(e) {
    (this.anchorNode = e.anchorNode),
      (this.anchorOffset = e.anchorOffset),
      (this.focusNode = e.focusNode),
      (this.focusOffset = e.focusOffset);
  }

  clear() {
    this.anchorNode = this.focusNode = null;
  }

  eq(e) {
    return (
      e.anchorNode == this.anchorNode &&
      e.anchorOffset == this.anchorOffset &&
      e.focusNode == this.focusNode &&
      e.focusOffset == this.focusOffset
    );
  }
}
class la {
  constructor(e, t) {
    (this.view = e),
      (this.handleDOMChange = t),
      (this.queue = []),
      (this.flushingSoon = -1),
      (this.observer = null),
      (this.currentSelection = new oa()),
      (this.onCharData = null),
      (this.suppressingSelectionUpdates = !1),
      (this.lastChangedTextNode = null),
      (this.observer =
        window.MutationObserver &&
        new window.MutationObserver((n) => {
          for (let i = 0; i < n.length; i++) this.queue.push(n[i]);
          U &&
          ke <= 11 &&
          n.some(
            (i) =>
              (i.type == 'childList' && i.removedNodes.length) ||
              (i.type == 'characterData' && i.oldValue.length > i.target.nodeValue.length),
          )
            ? this.flushSoon()
            : this.flush();
        })),
      sa &&
        (this.onCharData = (n) => {
          this.queue.push({
            target: n.target,
            type: 'characterData',
            oldValue: n.prevValue,
          }),
            this.flushSoon();
        }),
      (this.onSelectionChange = this.onSelectionChange.bind(this));
  }

  flushSoon() {
    this.flushingSoon < 0 &&
      (this.flushingSoon = window.setTimeout(() => {
        (this.flushingSoon = -1), this.flush();
      }, 20));
  }

  forceFlush() {
    this.flushingSoon > -1 &&
      (window.clearTimeout(this.flushingSoon), (this.flushingSoon = -1), this.flush());
  }

  start() {
    this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, ia)),
      this.onCharData &&
        this.view.dom.addEventListener('DOMCharacterDataModified', this.onCharData),
      this.connectSelection();
  }

  stop() {
    if (this.observer) {
      let e = this.observer.takeRecords();
      if (e.length > 0) {
        for (let t = 0; t < e.length; t++) this.queue.push(e[t]);
        window.setTimeout(() => this.flush(), 20);
      }
      this.observer.disconnect();
    }
    this.onCharData &&
      this.view.dom.removeEventListener('DOMCharacterDataModified', this.onCharData),
      this.disconnectSelection();
  }

  connectSelection() {
    this.view.dom.ownerDocument.addEventListener('selectionchange', this.onSelectionChange);
  }

  disconnectSelection() {
    this.view.dom.ownerDocument.removeEventListener('selectionchange', this.onSelectionChange);
  }

  suppressSelectionUpdates() {
    (this.suppressingSelectionUpdates = !0),
      setTimeout(() => (this.suppressingSelectionUpdates = !1), 50);
  }

  onSelectionChange() {
    if (Fr(this.view)) {
      if (this.suppressingSelectionUpdates) return ae(this.view);
      if (U && ke <= 11 && !this.view.state.selection.empty) {
        let e = this.view.domSelectionRange();
        if (e.focusNode && Fe(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset))
          return this.flushSoon();
      }
      this.flush();
    }
  }

  setCurSelection() {
    this.currentSelection.set(this.view.domSelectionRange());
  }

  ignoreSelectionChange(e) {
    if (!e.focusNode) return !0;
    let t = new Set(),
      n;
    for (let s = e.focusNode; s; s = dt(s)) t.add(s);
    for (let s = e.anchorNode; s; s = dt(s))
      if (t.has(s)) {
        n = s;
        break;
      }
    let i = n && this.view.docView.nearestDesc(n);
    if (
      i &&
      i.ignoreMutation({
        type: 'selection',
        target: n.nodeType == 3 ? n.parentNode : n,
      })
    )
      return this.setCurSelection(), !0;
  }

  pendingRecords() {
    if (this.observer) for (const e of this.observer.takeRecords()) this.queue.push(e);
    return this.queue;
  }

  flush() {
    let { view: e } = this;
    if (!e.docView || this.flushingSoon > -1) return;
    let t = this.pendingRecords();
    t.length && (this.queue = []);
    let n = e.domSelectionRange(),
      i =
        !this.suppressingSelectionUpdates &&
        !this.currentSelection.eq(n) &&
        Fr(e) &&
        !this.ignoreSelectionChange(n),
      s = -1,
      o = -1,
      l = !1,
      a = [];
    if (e.editable)
      for (const element of t) {
        let d = this.registerMutation(element, a);
        d &&
          ((s = s < 0 ? d.from : Math.min(d.from, s)),
          (o = o < 0 ? d.to : Math.max(d.to, o)),
          d.typeOver && (l = !0));
      }
    if (ee && a.length > 0) {
      let f = a.filter((d) => d.nodeName == 'BR');
      if (f.length == 2) {
        let [d, u] = f;
        d.parentNode && d.parentNode.parentNode == u.parentNode ? u.remove() : d.remove();
      } else {
        let { focusNode: d } = this.currentSelection;
        for (const u of f) {
          let p = u.parentNode;
          p && p.nodeName == 'LI' && (!d || fa(e, d) != p) && u.remove();
        }
      }
    }
    let c = null;
    s < 0 &&
    i &&
    e.input.lastFocus > Date.now() - 200 &&
    Math.max(e.input.lastTouch, e.input.lastClick.time) < Date.now() - 300 &&
    Gt(n) &&
    (c = Un(e)) &&
    c.eq(O.near(e.state.doc.resolve(0), 1))
      ? ((e.input.lastFocus = 0), ae(e), this.currentSelection.set(n), e.scrollToSelection())
      : (s > -1 || i) &&
        (s > -1 && (e.docView.markDirty(s, o), aa(e)),
        this.handleDOMChange(s, o, l, a),
        e.docView && e.docView.dirty
          ? e.updateState(e.state)
          : this.currentSelection.eq(n) || ae(e),
        this.currentSelection.set(n));
  }

  registerMutation(e, t) {
    if (t.includes(e.target)) return null;
    let n = this.view.docView.nearestDesc(e.target);
    if (
      (e.type == 'attributes' &&
        (n == this.view.docView ||
          e.attributeName == 'contenteditable' ||
          (e.attributeName == 'style' && !e.oldValue && !e.target.getAttribute('style')))) ||
      !n ||
      n.ignoreMutation(e)
    )
      return null;
    if (e.type == 'childList') {
      for (let f = 0; f < e.addedNodes.length; f++) {
        let d = e.addedNodes[f];
        t.push(d), d.nodeType == 3 && (this.lastChangedTextNode = d);
      }
      if (n.contentDOM && n.contentDOM != n.dom && !n.contentDOM.contains(e.target))
        return {
          from: n.posBefore,
          to: n.posAfter,
        };
      let i = e.previousSibling,
        s = e.nextSibling;
      if (U && ke <= 11 && e.addedNodes.length > 0)
        for (let f = 0; f < e.addedNodes.length; f++) {
          let { previousSibling: d, nextSibling: u } = e.addedNodes[f];
          (!d || Array.prototype.indexOf.call(e.addedNodes, d) < 0) && (i = d),
            (!u || Array.prototype.indexOf.call(e.addedNodes, u) < 0) && (s = u);
        }
      let o = i && i.parentNode == e.target ? V(i) + 1 : 0,
        l = n.localPosFromDOM(e.target, o, -1),
        a = s && s.parentNode == e.target ? V(s) : e.target.childNodes.length,
        c = n.localPosFromDOM(e.target, a, 1);
      return {
        from: l,
        to: c,
      };
    } else
      return e.type == 'attributes'
        ? {
            from: n.posAtStart - n.border,
            to: n.posAtEnd + n.border,
          }
        : ((this.lastChangedTextNode = e.target),
          {
            from: n.posAtStart,
            to: n.posAtEnd,
            typeOver: e.target.nodeValue == e.oldValue,
          });
  }
}
let Hr = new WeakMap(),
  Ur = !1;
function aa(r) {
  if (
    !Hr.has(r) &&
    (Hr.set(r, null), ['normal', 'nowrap', 'pre-line'].includes(getComputedStyle(r.dom).whiteSpace))
  ) {
    if (((r.requiresGeckoHackNode = ee), Ur)) return;
    console.warn(
      "ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package.",
    ),
      (Ur = !0);
  }
}
function Gr(r, e) {
  let t = e.startContainer;
  let n = e.startOffset;
  let i = e.endContainer;
  let s = e.endOffset;
  let o = r.domAtPos(r.state.selection.anchor);
  return (
    Fe(o.node, o.offset, i, s) && ([t, n, i, s] = [i, s, t, n]),
    {
      anchorNode: t,
      anchorOffset: n,
      focusNode: i,
      focusOffset: s,
    }
  );
}
function ca(r, e) {
  if (e.getComposedRanges) {
    let i = e.getComposedRanges(r.root)[0];
    if (i) return Gr(r, i);
  }
  let t;
  function n(i) {
    i.preventDefault(), i.stopImmediatePropagation(), (t = i.getTargetRanges()[0]);
  }
  return (
    r.dom.addEventListener('beforeinput', n, !0),
    document.execCommand('indent'),
    r.dom.removeEventListener('beforeinput', n, !0),
    t ? Gr(r, t) : null
  );
}
function fa(r, e) {
  for (let t = e.parentNode; t && t != r.dom; t = t.parentNode) {
    let n = r.docView.nearestDesc(t, !0);
    if (n && n.node.isBlock) return t;
  }
  return null;
}
function da(r, e, t) {
  let { node: n, fromOffset: i, toOffset: s, from: o, to: l } = r.docView.parseRange(e, t);
  let a = r.domSelectionRange();
  let c;
  let f = a.anchorNode;
  if (
    (f &&
      r.dom.contains(f.nodeType == 1 ? f : f.parentNode) &&
      ((c = [
        {
          node: f,
          offset: a.anchorOffset,
        },
      ]),
      Gt(a) ||
        c.push({
          node: a.focusNode,
          offset: a.focusOffset,
        })),
    j && r.input.lastKeyCode === 8)
  )
    for (let g = s; g > i; g--) {
      let y = n.childNodes[g - 1],
        M = y.pmViewDesc;
      if (y.nodeName == 'BR' && !M) {
        s = g;
        break;
      }
      if (!M || M.size > 0) break;
    }
  let d = r.state.doc;
  let u = r.someProp('domParser') || Ge.fromSchema(r.state.schema);
  let p = d.resolve(o);
  let h = null;
  let m = u.parse(n, {
    topNode: p.parent,
    topMatch: p.parent.contentMatchAt(p.index()),
    topOpen: !0,
    from: i,
    to: s,
    preserveWhitespace: p.parent.type.whitespace == 'pre' ? 'full' : !0,
    findPositions: c,
    ruleFromNode: ua,
    context: p,
  });
  if (c && c[0].pos != undefined) {
    let g = c[0].pos,
      y = c[1] && c[1].pos;
    y == undefined && (y = g),
      (h = {
        anchor: g + o,
        head: y + o,
      });
  }
  return {
    doc: m,
    sel: h,
    from: o,
    to: l,
  };
}
function ua(r) {
  const e = r.pmViewDesc;
  if (e) return e.parseRule();
  if (r.nodeName == 'BR' && r.parentNode) {
    if (q && /^(ul|ol)$/i.test(r.parentNode.nodeName)) {
      let t = document.createElement('div');
      return (
        t.appendChild(document.createElement('li')),
        {
          skip: t,
        }
      );
    } else if (r.parentNode.lastChild == r || (q && /^(tr|table)$/i.test(r.parentNode.nodeName)))
      return {
        ignore: !0,
      };
  } else if (r.nodeName == 'IMG' && r.getAttribute('mark-placeholder'))
    return {
      ignore: !0,
    };
  return null;
}
const ha =
  /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function pa(r, e, t, n, i) {
  const s = r.input.compositionPendingChanges || (r.composing ? r.input.compositionID : 0);
  if (((r.input.compositionPendingChanges = 0), e < 0)) {
    let T = r.input.lastSelectionTime > Date.now() - 50 ? r.input.lastSelectionOrigin : null,
      fe = Un(r, T);
    if (fe && !r.state.selection.eq(fe)) {
      if (
        j &&
        _ &&
        r.input.lastKeyCode === 13 &&
        Date.now() - 100 < r.input.lastKeyCodeTime &&
        r.someProp('handleKeyDown', ($s) => $s(r, Ne(13, 'Enter')))
      )
        return;
      let xt = r.state.tr.setSelection(fe);
      T == 'pointer' ? xt.setMeta('pointer', !0) : T == 'key' && xt.scrollIntoView(),
        s && xt.setMeta('composition', s),
        r.dispatch(xt);
    }
    return;
  }
  const o = r.state.doc.resolve(e),
    l = o.sharedDepth(t);
  (e = o.before(l + 1)), (t = r.state.doc.resolve(t).after(l + 1));
  let a = r.state.selection;
  let c = da(r, e, t);
  let f = r.state.doc;
  let d = f.slice(c.from, c.to);
  let u;
  let p;
  r.input.lastKeyCode === 8 && Date.now() - 100 < r.input.lastKeyCodeTime
    ? ((u = r.state.selection.to), (p = 'end'))
    : ((u = r.state.selection.from), (p = 'start')),
    (r.input.lastKeyCode = null);
  let h = ya(d.content, c.doc.content, c.from, u, p);
  if (
    ((_e && r.input.lastIOSEnter > Date.now() - 225) || _) &&
    i.some((T) => T.nodeType == 1 && !ha.test(T.nodeName)) &&
    (!h || h.endA >= h.endB) &&
    r.someProp('handleKeyDown', (T) => T(r, Ne(13, 'Enter')))
  ) {
    r.input.lastIOSEnter = 0;
    return;
  }
  if (!h)
    if (
      n &&
      a instanceof w &&
      !a.empty &&
      a.$head.sameParent(a.$anchor) &&
      !r.composing &&
      !(c.sel && c.sel.anchor != c.sel.head)
    )
      h = {
        start: a.from,
        endA: a.to,
        endB: a.to,
      };
    else {
      if (c.sel) {
        let T = Yr(r, r.state.doc, c.sel);
        if (T && !T.eq(r.state.selection)) {
          let fe = r.state.tr.setSelection(T);
          s && fe.setMeta('composition', s), r.dispatch(fe);
        }
      }
      return;
    }
  r.input.domChangeCount++,
    r.state.selection.from < r.state.selection.to &&
      h.start == h.endB &&
      r.state.selection instanceof w &&
      (h.start > r.state.selection.from &&
      h.start <= r.state.selection.from + 2 &&
      r.state.selection.from >= c.from
        ? (h.start = r.state.selection.from)
        : h.endA < r.state.selection.to &&
          h.endA >= r.state.selection.to - 2 &&
          r.state.selection.to <= c.to &&
          ((h.endB += r.state.selection.to - h.endA), (h.endA = r.state.selection.to))),
    U &&
      ke <= 11 &&
      h.endB == h.start + 1 &&
      h.endA == h.start &&
      h.start > c.from &&
      c.doc.textBetween(h.start - c.from - 1, h.start - c.from + 1) == '  ' &&
      (h.start--, h.endA--, h.endB--);
  let m = c.doc.resolveNoCache(h.start - c.from);
  let g = c.doc.resolveNoCache(h.endB - c.from);
  let y = f.resolve(h.start);
  let M = m.sameParent(g) && m.parent.inlineContent && y.end() >= h.endA;
  let N;
  if (
    ((_e &&
      r.input.lastIOSEnter > Date.now() - 225 &&
      (!M || i.some((T) => T.nodeName == 'DIV' || T.nodeName == 'P'))) ||
      (!M &&
        m.pos < c.doc.content.size &&
        !m.sameParent(g) &&
        (N = O.findFrom(c.doc.resolve(m.pos + 1), 1, !0)) &&
        N.head == g.pos)) &&
    r.someProp('handleKeyDown', (T) => T(r, Ne(13, 'Enter')))
  ) {
    r.input.lastIOSEnter = 0;
    return;
  }
  if (
    r.state.selection.anchor > h.start &&
    ga(f, h.start, h.endA, m, g) &&
    r.someProp('handleKeyDown', (T) => T(r, Ne(8, 'Backspace')))
  ) {
    _ && j && r.domObserver.suppressSelectionUpdates();
    return;
  }
  j && _ && h.endB == h.start && (r.input.lastAndroidDelete = Date.now()),
    _ &&
      !M &&
      m.start() != g.start() &&
      g.parentOffset == 0 &&
      m.depth == g.depth &&
      c.sel &&
      c.sel.anchor == c.sel.head &&
      c.sel.head == h.endA &&
      ((h.endB -= 2),
      (g = c.doc.resolveNoCache(h.endB - c.from)),
      setTimeout(() => {
        r.someProp('handleKeyDown', function (T) {
          return T(r, Ne(13, 'Enter'));
        });
      }, 20));
  let A = h.start;
  let I = h.endA;
  let E;
  let $;
  let te;
  if (M) {
    if (m.pos == g.pos)
      U &&
        ke <= 11 &&
        m.parentOffset == 0 &&
        (r.domObserver.suppressSelectionUpdates(), setTimeout(() => ae(r), 20)),
        (E = r.state.tr.delete(A, I)),
        ($ = f.resolve(h.start).marksAcross(f.resolve(h.endA)));
    else if (
      h.endA == h.endB &&
      (te = ma(
        m.parent.content.cut(m.parentOffset, g.parentOffset),
        y.parent.content.cut(y.parentOffset, h.endA - y.start()),
      ))
    )
      (E = r.state.tr), te.type == 'add' ? E.addMark(A, I, te.mark) : E.removeMark(A, I, te.mark);
    else if (m.parent.child(m.index()).isText && m.index() == g.index() - (g.textOffset ? 0 : 1)) {
      let T = m.parent.textBetween(m.parentOffset, g.parentOffset);
      if (r.someProp('handleTextInput', (fe) => fe(r, A, I, T))) return;
      E = r.state.tr.insertText(T, A, I);
    }
  }
  if (
    (E || (E = r.state.tr.replace(A, I, c.doc.slice(h.start - c.from, h.endB - c.from))), c.sel)
  ) {
    let T = Yr(r, E.doc, c.sel);
    T &&
      !(
        (j &&
          _ &&
          r.composing &&
          T.empty &&
          (h.start != h.endB || r.input.lastAndroidDelete < Date.now() - 100) &&
          (T.head == A || T.head == E.mapping.map(I) - 1)) ||
        (U && T.empty && T.head == A)
      ) &&
      E.setSelection(T);
  }
  $ && E.ensureMarks($), s && E.setMeta('composition', s), r.dispatch(E.scrollIntoView());
}
function Yr(r, e, t) {
  return Math.max(t.anchor, t.head) > e.content.size
    ? null
    : Gn(r, e.resolve(t.anchor), e.resolve(t.head));
}
function ma(r, e) {
  let t = r.firstChild.marks;
  let n = e.firstChild.marks;
  let i = t;
  let s = n;
  let o;
  let l;
  let a;
  for (let f = 0; f < n.length; f++) i = n[f].removeFromSet(i);
  for (let f = 0; f < t.length; f++) s = t[f].removeFromSet(s);
  if (i.length == 1 && s.length === 0)
    (l = i[0]), (o = 'add'), (a = (f) => f.mark(l.addToSet(f.marks)));
  else if (i.length === 0 && s.length == 1)
    (l = s[0]), (o = 'remove'), (a = (f) => f.mark(l.removeFromSet(f.marks)));
  else return null;
  const c = [];
  for (let f = 0; f < e.childCount; f++) c.push(a(e.child(f)));
  if (k.from(c).eq(r))
    return {
      mark: l,
      type: o,
    };
}
function ga(r, e, t, n, i) {
  if (t - e <= i.pos - n.pos || gn(n, !0, !1) < i.pos) return !1;
  const s = r.resolve(e);
  if (!n.parent.isTextblock) {
    let l = s.nodeAfter;
    return l != undefined && t == e + l.nodeSize;
  }
  if (s.parentOffset < s.parent.content.size || !s.parent.isTextblock) return !1;
  const o = r.resolve(gn(s, !0, !0));
  return !o.parent.isTextblock || o.pos > t || gn(o, !0, !1) < t
    ? !1
    : n.parent.content.cut(n.parentOffset).eq(o.parent.content);
}
function gn(r, e, t) {
  let n = r.depth;
  let i = e ? r.end() : r.pos;
  for (; n > 0 && (e || r.indexAfter(n) == r.node(n).childCount); ) n--, i++, (e = !1);
  if (t) {
    let s = r.node(n).maybeChild(r.indexAfter(n));
    for (; s && !s.isLeaf; ) (s = s.firstChild), i++;
  }
  return i;
}
function ya(r, e, t, n, i) {
  let s = r.findDiffStart(e, t);
  if (s == undefined) return null;
  let { a: o, b: l } = r.findDiffEnd(e, t + r.size, t + e.size);
  if (i == 'end') {
    let a = Math.max(0, s - Math.min(o, l));
    n -= o + a - s;
  }
  if (o < s && r.size < e.size) {
    let a = n <= s && n >= o ? s - n : 0;
    (s -= a),
      s && s < e.size && Xr(e.textBetween(s - 1, s + 1)) && (s += a ? 1 : -1),
      (l = s + (l - o)),
      (o = s);
  } else if (l < s) {
    let a = n <= s && n >= l ? s - n : 0;
    (s -= a),
      s && s < r.size && Xr(r.textBetween(s - 1, s + 1)) && (s += a ? 1 : -1),
      (o = s + (o - l)),
      (l = s);
  }
  return {
    start: s,
    endA: o,
    endB: l,
  };
}
function Xr(r) {
  if (r.length != 2) return !1;
  const e = r.charCodeAt(0),
    t = r.charCodeAt(1);
  return e >= 56_320 && e <= 57_343 && t >= 55_296 && t <= 56_319;
}
class ka {
  constructor(e, t) {
    (this._root = null),
      (this.focused = !1),
      (this.trackWrites = null),
      (this.mounted = !1),
      (this.markCursor = null),
      (this.cursorWrapper = null),
      (this.lastSelectedViewDesc = void 0),
      (this.input = new Fl()),
      (this.prevDirectPlugins = []),
      (this.pluginViews = []),
      (this.requiresGeckoHackNode = !1),
      (this.dragging = null),
      (this._props = t),
      (this.state = t.state),
      (this.directPlugins = t.plugins || []),
      this.directPlugins.forEach(ti),
      (this.dispatch = this.dispatch.bind(this)),
      (this.dom = (e && e.mount) || document.createElement('div')),
      e &&
        (e.appendChild
          ? e.appendChild(this.dom)
          : typeof e == 'function'
          ? e(this.dom)
          : e.mount && (this.mounted = !0)),
      (this.editable = Qr(this)),
      Zr(this),
      (this.nodeViews = ei(this)),
      (this.docView = Ir(this.state.doc, _r(this), mn(this), this.dom, this)),
      (this.domObserver = new la(this, (n, i, s, o) => pa(this, n, i, s, o))),
      this.domObserver.start(),
      Vl(this),
      this.updatePluginViews();
  }

  get composing() {
    return this.input.composing;
  }

  get props() {
    if (this._props.state != this.state) {
      let e = this._props;
      this._props = {};
      for (const t in e) this._props[t] = e[t];
      this._props.state = this.state;
    }
    return this._props;
  }

  update(e) {
    e.handleDOMEvents != this._props.handleDOMEvents && Fn(this);
    let t = this._props;
    (this._props = e),
      e.plugins && (e.plugins.forEach(ti), (this.directPlugins = e.plugins)),
      this.updateStateInner(e.state, t);
  }

  setProps(e) {
    let t = {};
    for (const n in this._props) t[n] = this._props[n];
    t.state = this.state;
    for (const n in e) t[n] = e[n];
    this.update(t);
  }

  updateState(e) {
    this.updateStateInner(e, this._props);
  }

  updateStateInner(e, t) {
    var n;
    let i = this.state,
      s = !1,
      o = !1;
    e.storedMarks && this.composing && (ms(this), (o = !0)), (this.state = e);
    let l = i.plugins != e.plugins || this._props.plugins != t.plugins;
    if (l || this._props.plugins != t.plugins || this._props.nodeViews != t.nodeViews) {
      let p = ei(this);
      xa(p, this.nodeViews) && ((this.nodeViews = p), (s = !0));
    }
    (l || t.handleDOMEvents != this._props.handleDOMEvents) && Fn(this),
      (this.editable = Qr(this)),
      Zr(this);
    let a = mn(this),
      c = _r(this),
      f =
        i.plugins != e.plugins && !i.doc.eq(e.doc)
          ? 'reset'
          : e.scrollToSelection > i.scrollToSelection
          ? 'to selection'
          : 'preserve',
      d = s || !this.docView.matchesNode(e.doc, c, a);
    (d || !e.selection.eq(i.selection)) && (o = !0);
    let u = f == 'preserve' && o && this.dom.style.overflowAnchor == undefined && Qo(this);
    if (o) {
      this.domObserver.stop();
      let p =
        d &&
        (U || j) &&
        !this.composing &&
        !i.selection.empty &&
        !e.selection.empty &&
        ba(i.selection, e.selection);
      if (d) {
        let h = j ? (this.trackWrites = this.domSelectionRange().focusNode) : null;
        this.composing && (this.input.compositionNode = _l(this)),
          (s || !this.docView.update(e.doc, c, a, this)) &&
            (this.docView.updateOuterDeco(c),
            this.docView.destroy(),
            (this.docView = Ir(e.doc, c, a, this.dom, this))),
          h && !this.trackWrites && (p = !0);
      }
      p ||
      !(
        this.input.mouseDown &&
        this.domObserver.currentSelection.eq(this.domSelectionRange()) &&
        Cl(this)
      )
        ? ae(this, p)
        : (ts(this, e.selection), this.domObserver.setCurSelection()),
        this.domObserver.start();
    }
    this.updatePluginViews(i),
      !((n = this.dragging) === null || n === void 0) &&
        n.node &&
        !i.doc.eq(e.doc) &&
        this.updateDraggedNode(this.dragging, i),
      f == 'reset'
        ? (this.dom.scrollTop = 0)
        : f == 'to selection'
        ? this.scrollToSelection()
        : u && el(u);
  }

  scrollToSelection() {
    let e = this.domSelectionRange().focusNode;
    if (!this.someProp('handleScrollToSelection', (t) => t(this)))
      if (this.state.selection instanceof S) {
        let t = this.docView.domAfterPos(this.state.selection.from);
        t.nodeType == 1 && Or(this, t.getBoundingClientRect(), e);
      } else Or(this, this.coordsAtPos(this.state.selection.head, 1), e);
  }

  destroyPluginViews() {
    let e;
    for (; (e = this.pluginViews.pop()); ) e.destroy && e.destroy();
  }

  updatePluginViews(e) {
    if (!e || e.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
      (this.prevDirectPlugins = this.directPlugins), this.destroyPluginViews();
      for (let t = 0; t < this.directPlugins.length; t++) {
        let n = this.directPlugins[t];
        n.spec.view && this.pluginViews.push(n.spec.view(this));
      }
      for (let t = 0; t < this.state.plugins.length; t++) {
        let n = this.state.plugins[t];
        n.spec.view && this.pluginViews.push(n.spec.view(this));
      }
    } else
      for (let t = 0; t < this.pluginViews.length; t++) {
        let n = this.pluginViews[t];
        n.update && n.update(this, e);
      }
  }

  updateDraggedNode(e, t) {
    let n = e.node,
      i = -1;
    if (this.state.doc.nodeAt(n.from) == n.node) i = n.from;
    else {
      let s = n.from + (this.state.doc.content.size - t.doc.content.size);
      (s > 0 && this.state.doc.nodeAt(s)) == n.node && (i = s);
    }
    this.dragging = new ys(e.slice, e.move, i < 0 ? void 0 : S.create(this.state.doc, i));
  }

  someProp(e, t) {
    let n = this._props && this._props[e];
    let i;
    if (n != undefined && (i = t ? t(n) : n)) return i;
    for (let o = 0; o < this.directPlugins.length; o++) {
      let l = this.directPlugins[o].props[e];
      if (l != undefined && (i = t ? t(l) : l)) return i;
    }
    let s = this.state.plugins;
    if (s)
      for (const element of s) {
        let l = element.props[e];
        if (l != undefined && (i = t ? t(l) : l)) return i;
      }
  }

  hasFocus() {
    if (U) {
      let e = this.root.activeElement;
      if (e == this.dom) return !0;
      if (!e || !this.dom.contains(e)) return !1;
      for (; e && this.dom != e && this.dom.contains(e); ) {
        if (e.contentEditable == 'false') return !1;
        e = e.parentElement;
      }
      return !0;
    }
    return this.root.activeElement == this.dom;
  }

  focus() {
    this.domObserver.stop(), this.editable && tl(this.dom), ae(this), this.domObserver.start();
  }

  get root() {
    let e = this._root;
    if (e == undefined) {
      for (let t = this.dom.parentNode; t; t = t.parentNode)
        if (t.nodeType == 9 || (t.nodeType == 11 && t.host))
          return (
            t.getSelection ||
              (Object.getPrototypeOf(t).getSelection = () => t.ownerDocument.getSelection()),
            (this._root = t)
          );
    }
    return e || document;
  }

  updateRoot() {
    this._root = null;
  }

  posAtCoords(e) {
    return ol(this, e);
  }

  coordsAtPos(e, t = 1) {
    return Ui(this, e, t);
  }

  domAtPos(e, t = 0) {
    return this.docView.domFromPos(e, t);
  }

  nodeDOM(e) {
    let t = this.docView.descAt(e);
    return t ? t.nodeDOM : null;
  }

  posAtDOM(e, t, n = -1) {
    let i = this.docView.posFromDOM(e, t, n);
    if (i == undefined) throw new RangeError('DOM position not inside the editor');
    return i;
  }

  endOfTextblock(e, t) {
    return dl(this, t || this.state, e);
  }

  pasteHTML(e, t) {
    return ht(this, '', e, !1, t || new ClipboardEvent('paste'));
  }

  pasteText(e, t) {
    return ht(this, e, null, !0, t || new ClipboardEvent('paste'));
  }

  destroy() {
    this.docView &&
      (Ll(this),
      this.destroyPluginViews(),
      this.mounted
        ? (this.docView.update(this.state.doc, [], mn(this), this), (this.dom.textContent = ''))
        : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom),
      this.docView.destroy(),
      (this.docView = null),
      Jo());
  }

  get isDestroyed() {
    return this.docView == undefined;
  }

  dispatchEvent(e) {
    return Jl(this, e);
  }

  dispatch(e) {
    let t = this._props.dispatchTransaction;
    t ? t.call(this, e) : this.updateState(this.state.apply(e));
  }

  domSelectionRange() {
    let e = this.domSelection();
    return (
      (q && this.root.nodeType === 11 && Ho(this.dom.ownerDocument) == this.dom && ca(this, e)) || e
    );
  }

  domSelection() {
    return this.root.getSelection();
  }
}
function _r(r) {
  const e = Object.create(null);
  return (
    (e.class = 'ProseMirror'),
    (e.contenteditable = String(r.editable)),
    r.someProp('attributes', (t) => {
      if ((typeof t === 'function' && (t = t(r.state)), t))
        for (const n in t)
          n == 'class'
            ? (e.class += ' ' + t[n])
            : n == 'style'
            ? (e.style = (e.style ? e.style + ';' : '') + t[n])
            : !e[n] && n != 'contenteditable' && n != 'nodeName' && (e[n] = String(t[n]));
    }),
    e.translate || (e.translate = 'no'),
    [Z.node(0, r.state.doc.content.size, e)]
  );
}
function Zr(r) {
  if (r.markCursor) {
    let e = document.createElement('img');
    (e.className = 'ProseMirror-separator'),
      e.setAttribute('mark-placeholder', 'true'),
      e.setAttribute('alt', ''),
      (r.cursorWrapper = {
        dom: e,
        deco: Z.widget(r.state.selection.head, e, {
          raw: !0,
          marks: r.markCursor,
        }),
      });
  } else r.cursorWrapper = null;
}
function Qr(r) {
  return !r.someProp('editable', (e) => e(r.state) === !1);
}
function ba(r, e) {
  const t = Math.min(r.$anchor.sharedDepth(r.head), e.$anchor.sharedDepth(e.head));
  return r.$anchor.start(t) != e.$anchor.start(t);
}
function ei(r) {
  const e = Object.create(null);
  function t(n) {
    for (const i in n) Object.prototype.hasOwnProperty.call(e, i) || (e[i] = n[i]);
  }
  return r.someProp('nodeViews', t), r.someProp('markViews', t), e;
}
function xa(r, e) {
  let t = 0;
  let n = 0;
  for (const i in r) {
    if (r[i] != e[i]) return !0;
    t++;
  }
  for (const i in e) n++;
  return t != n;
}
function ti(r) {
  if (r.spec.state || r.spec.filterTransaction || r.spec.appendTransaction)
    throw new RangeError('Plugins passed directly to the view must not have a state component');
}
let Se = {
    8: 'Backspace',
    9: 'Tab',
    10: 'Enter',
    12: 'NumLock',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    44: 'PrintScreen',
    45: 'Insert',
    46: 'Delete',
    59: ';',
    61: '=',
    91: 'Meta',
    92: 'Meta',
    106: '*',
    107: '+',
    108: ',',
    109: '-',
    110: '.',
    111: '/',
    144: 'NumLock',
    145: 'ScrollLock',
    160: 'Shift',
    161: 'Shift',
    162: 'Control',
    163: 'Control',
    164: 'Alt',
    165: 'Alt',
    173: '-',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: "'",
  },
  $t = {
    48: ')',
    49: '!',
    50: '@',
    51: '#',
    52: '$',
    53: '%',
    54: '^',
    55: '&',
    56: '*',
    57: '(',
    59: ':',
    61: '+',
    173: '_',
    186: ':',
    187: '+',
    188: '<',
    189: '_',
    190: '>',
    191: '?',
    192: '~',
    219: '{',
    220: '|',
    221: '}',
    222: '"',
  },
  Sa = typeof navigator < 'u' && /Mac/.test(navigator.platform),
  Ma =
    typeof navigator < 'u' &&
    /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var L = 0; L < 10; L++) {
  Se[48 + L] = Se[96 + L] = String(L);
}
for (var L = 1; L <= 24; L++) {
  Se[L + 111] = 'F' + L;
}
for (var L = 65; L <= 90; L++) {
  (Se[L] = String.fromCharCode(L + 32)), ($t[L] = String.fromCharCode(L));
}
for (let yn in Se) {
  $t.hasOwnProperty(yn) || ($t[yn] = Se[yn]);
}
function Ca(r) {
  let e =
    (Sa && r.metaKey && r.shiftKey && !r.ctrlKey && !r.altKey) ||
    (Ma && r.shiftKey && r.key && r.key.length == 1) ||
    r.key == 'Unidentified';
  var t = (!e && r.key) || (r.shiftKey ? $t : Se)[r.keyCode] || r.key || 'Unidentified';
  return (
    t == 'Esc' && (t = 'Escape'),
    t == 'Del' && (t = 'Delete'),
    t == 'Left' && (t = 'ArrowLeft'),
    t == 'Up' && (t = 'ArrowUp'),
    t == 'Right' && (t = 'ArrowRight'),
    t == 'Down' && (t = 'ArrowDown'),
    t
  );
}
const wa = typeof navigator < 'u' ? /Mac|iP(hone|[ao]d)/.test(navigator.platform) : !1;
function Oa(r) {
  let e = r.split(/-(?!$)/);
  let t = e.at(-1);
  t == 'Space' && (t = ' ');
  let n, i, s, o;
  for (let l = 0; l < e.length - 1; l++) {
    let a = e[l];
    if (/^(cmd|meta|m)$/i.test(a)) o = !0;
    else if (/^a(lt)?$/i.test(a)) n = !0;
    else if (/^(c|ctrl|control)$/i.test(a)) i = !0;
    else if (/^s(hift)?$/i.test(a)) s = !0;
    else if (/^mod$/i.test(a)) wa ? (o = !0) : (i = !0);
    else throw new Error('Unrecognized modifier name: ' + a);
  }
  return (
    n && (t = 'Alt-' + t),
    i && (t = 'Ctrl-' + t),
    o && (t = 'Meta-' + t),
    s && (t = 'Shift-' + t),
    t
  );
}
function Na(r) {
  const e = Object.create(null);
  for (const t in r) e[Oa(t)] = r[t];
  return e;
}
function kn(r, e, t = !0) {
  return (
    e.altKey && (r = 'Alt-' + r),
    e.ctrlKey && (r = 'Ctrl-' + r),
    e.metaKey && (r = 'Meta-' + r),
    t && e.shiftKey && (r = 'Shift-' + r),
    r
  );
}
function Ta(r) {
  return new Ce({
    props: {
      handleKeyDown: Ea(r),
    },
  });
}
function Ea(r) {
  const e = Na(r);
  return function (t, n) {
    let i = Ca(n);
    let s;
    let o = e[kn(i, n)];
    if (o && o(t.state, t.dispatch, t)) return !0;
    if (i.length == 1 && i != ' ') {
      if (n.shiftKey) {
        let l = e[kn(i, n, !1)];
        if (l && l(t.state, t.dispatch, t)) return !0;
      }
      if (
        (n.shiftKey || n.altKey || n.metaKey || i.charCodeAt(0) > 127) &&
        (s = Se[n.keyCode]) &&
        s != i
      ) {
        let l = e[kn(s, n)];
        if (l && l(t.state, t.dispatch, t)) return !0;
      }
    }
    return !1;
  };
}
const Da = (r, e) =>
  r.selection.empty ? !1 : (e && e(r.tr.deleteSelection().scrollIntoView()), !0);
function Ms(r, e) {
  const { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock('backward', r) : t.parentOffset > 0) ? null : t;
}
const Aa = (r, e, t) => {
    let n = Ms(r, t);
    if (!n) {
      return !1;
    }
    let i = er(n);
    if (!i) {
      const o = n.blockRange(),
        l = o && Qe(o);
      return l == undefined ? !1 : (e && e(r.tr.lift(o, l).scrollIntoView()), !0);
    }
    let s = i.nodeBefore;
    if (!s.type.spec.isolating && Ns(r, i, e)) {
      return !0;
    }
    if (n.parent.content.size === 0 && (Ze(s, 'end') || S.isSelectable(s))) {
      const o = Ht(r.doc, n.before(), n.after(), b.empty);
      if (o && o.slice.size < o.to - o.from) {
        if (e) {
          let l = r.tr.step(o);
          l.setSelection(
            Ze(s, 'end')
              ? O.findFrom(l.doc.resolve(l.mapping.map(i.pos, -1)), -1)
              : S.create(l.doc, i.pos - s.nodeSize),
          ),
            e(l.scrollIntoView());
        }
        return !0;
      }
    }
    return s.isAtom && i.depth == n.depth - 1
      ? (e && e(r.tr.delete(i.pos - s.nodeSize, i.pos).scrollIntoView()), !0)
      : !1;
  },
  Ia = (r, e, t) => {
    let n = Ms(r, t);
    if (!n) {
      return !1;
    }
    let i = er(n);
    return i ? Cs(r, i, e) : !1;
  },
  va = (r, e, t) => {
    let n = ws(r, t);
    if (!n) {
      return !1;
    }
    let i = tr(n);
    return i ? Cs(r, i, e) : !1;
  };
function Cs(r, e, t) {
  let n = e.nodeBefore;
  let i = n;
  let s = e.pos - 1;
  for (; !i.isTextblock; s--) {
    if (i.type.spec.isolating) return !1;
    let f = i.lastChild;
    if (!f) return !1;
    i = f;
  }
  let o = e.nodeAfter;
  let l = o;
  let a = e.pos + 1;
  for (; !l.isTextblock; a++) {
    if (l.type.spec.isolating) return !1;
    let f = l.firstChild;
    if (!f) return !1;
    l = f;
  }
  const c = Ht(r.doc, s, a, b.empty);
  if (!c || c.from != s || (c instanceof P && c.slice.size >= a - s)) return !1;
  if (t) {
    let f = r.tr.step(c);
    f.setSelection(w.create(f.doc, s)), t(f.scrollIntoView());
  }
  return !0;
}
function Ze(r, e, t = !1) {
  for (let n = r; n; n = e == 'start' ? n.firstChild : n.lastChild) {
    if (n.isTextblock) return !0;
    if (t && n.childCount != 1) return !1;
  }
  return !1;
}
const Ra = (r, e, t) => {
  let { $head: n, empty: i } = r.selection;
  let s = n;
  if (!i) return !1;
  if (n.parent.isTextblock) {
    if (t ? !t.endOfTextblock('backward', r) : n.parentOffset > 0) return !1;
    s = er(n);
  }
  const o = s && s.nodeBefore;
  return !o || !S.isSelectable(o)
    ? !1
    : (e && e(r.tr.setSelection(S.create(r.doc, s.pos - o.nodeSize)).scrollIntoView()), !0);
};
function er(r) {
  if (!r.parent.type.spec.isolating)
    for (let e = r.depth - 1; e >= 0; e--) {
      if (r.index(e) > 0) return r.doc.resolve(r.before(e + 1));
      if (r.node(e).type.spec.isolating) break;
    }
  return null;
}
function ws(r, e) {
  const { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock('forward', r) : t.parentOffset < t.parent.content.size)
    ? null
    : t;
}
const Pa = (r, e, t) => {
    let n = ws(r, t);
    if (!n) {
      return !1;
    }
    let i = tr(n);
    if (!i) {
      return !1;
    }
    let s = i.nodeAfter;
    if (Ns(r, i, e)) {
      return !0;
    }
    if (n.parent.content.size === 0 && (Ze(s, 'start') || S.isSelectable(s))) {
      const o = Ht(r.doc, n.before(), n.after(), b.empty);
      if (o && o.slice.size < o.to - o.from) {
        if (e) {
          let l = r.tr.step(o);
          l.setSelection(
            Ze(s, 'start')
              ? O.findFrom(l.doc.resolve(l.mapping.map(i.pos)), 1)
              : S.create(l.doc, l.mapping.map(i.pos)),
          ),
            e(l.scrollIntoView());
        }
        return !0;
      }
    }
    return s.isAtom && i.depth == n.depth - 1
      ? (e && e(r.tr.delete(i.pos, i.pos + s.nodeSize).scrollIntoView()), !0)
      : !1;
  },
  Ba = (r, e, t) => {
    let { $head: n, empty: i } = r.selection,
      s = n;
    if (!i) {
      return !1;
    }
    if (n.parent.isTextblock) {
      if (t ? !t.endOfTextblock('forward', r) : n.parentOffset < n.parent.content.size) return !1;
      s = tr(n);
    }
    let o = s && s.nodeAfter;
    return !o || !S.isSelectable(o)
      ? !1
      : (e && e(r.tr.setSelection(S.create(r.doc, s.pos)).scrollIntoView()), !0);
  };
function tr(r) {
  if (!r.parent.type.spec.isolating)
    for (let e = r.depth - 1; e >= 0; e--) {
      let t = r.node(e);
      if (r.index(e) + 1 < t.childCount) return r.doc.resolve(r.after(e + 1));
      if (t.type.spec.isolating) break;
    }
  return null;
}
const za = (r, e) => {
    let t = r.selection;
    let n = t instanceof S;
    let i;
    if (n) {
      if (t.node.isTextblock || !Me(r.doc, t.from)) return !1;
      i = t.from;
    } else if (((i = Kt(r.doc, t.from, -1)), i == undefined)) {
      return !1;
    }
    if (e) {
      const s = r.tr.join(i);
      n && s.setSelection(S.create(s.doc, i - r.doc.resolve(i).nodeBefore.nodeSize)),
        e(s.scrollIntoView());
    }
    return !0;
  },
  Fa = (r, e) => {
    let t = r.selection;
    let n;
    if (t instanceof S) {
      if (t.node.isTextblock || !Me(r.doc, t.to)) return !1;
      n = t.to;
    } else if (((n = Kt(r.doc, t.to, 1)), n == undefined)) {
      return !1;
    }
    return e && e(r.tr.join(n).scrollIntoView()), !0;
  },
  Va = (r, e) => {
    let { $from: t, $to: n } = r.selection,
      i = t.blockRange(n),
      s = i && Qe(i);
    return s == undefined ? !1 : (e && e(r.tr.lift(i, s).scrollIntoView()), !0);
  },
  La = (r, e) => {
    let { $head: t, $anchor: n } = r.selection;
    return !t.parent.type.spec.code || !t.sameParent(n)
      ? !1
      : (e &&
          e(
            r.tr
              .insertText(
                `
`,
              )
              .scrollIntoView(),
          ),
        !0);
  };
function Os(r) {
  for (let e = 0; e < r.edgeCount; e++) {
    let { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs()) return t;
  }
  return null;
}
const $a = (r, e) => {
    let { $head: t, $anchor: n } = r.selection;
    if (!t.parent.type.spec.code || !t.sameParent(n)) {
      return !1;
    }
    let i = t.node(-1),
      s = t.indexAfter(-1),
      o = Os(i.contentMatchAt(s));
    if (!o || !i.canReplaceWith(s, s, o)) {
      return !1;
    }
    if (e) {
      const l = t.after(),
        a = r.tr.replaceWith(l, l, o.createAndFill());
      a.setSelection(O.near(a.doc.resolve(l), 1)), e(a.scrollIntoView());
    }
    return !0;
  },
  Ja = (r, e) => {
    let t = r.selection,
      { $from: n, $to: i } = t;
    if (t instanceof Q || n.parent.inlineContent || i.parent.inlineContent) {
      return !1;
    }
    let s = Os(i.parent.contentMatchAt(i.indexAfter()));
    if (!s || !s.isTextblock) {
      return !1;
    }
    if (e) {
      const o = (!n.parentOffset && i.index() < i.parent.childCount ? n : i).pos,
        l = r.tr.insert(o, s.createAndFill());
      l.setSelection(w.create(l.doc, o + 1)), e(l.scrollIntoView());
    }
    return !0;
  },
  Wa = (r, e) => {
    let { $cursor: t } = r.selection;
    if (!t || t.parent.content.size > 0) {
      return !1;
    }
    if (t.depth > 1 && t.after() != t.end(-1)) {
      const s = t.before();
      if (Ke(r.doc, s)) return e && e(r.tr.split(s).scrollIntoView()), !0;
    }
    let n = t.blockRange(),
      i = n && Qe(n);
    return i == undefined ? !1 : (e && e(r.tr.lift(n, i).scrollIntoView()), !0);
  },
  ja = (r, e) => {
    let { $from: t, to: n } = r.selection;
    let i;
    let s = t.sharedDepth(n);
    return s == 0 ? !1 : ((i = t.before(s)), e && e(r.tr.setSelection(S.create(r.doc, i))), !0);
  };
function qa(r, e, t) {
  const n = e.nodeBefore,
    i = e.nodeAfter,
    s = e.index();
  return !n || !i || !n.type.compatibleContent(i.type)
    ? !1
    : n.content.size === 0 && e.parent.canReplace(s - 1, s)
    ? (t && t(r.tr.delete(e.pos - n.nodeSize, e.pos).scrollIntoView()), !0)
    : !e.parent.canReplace(s, s + 1) || !(i.isTextblock || Me(r.doc, e.pos))
    ? !1
    : (t &&
        t(
          r.tr
            .clearIncompatible(e.pos, n.type, n.contentMatchAt(n.childCount))
            .join(e.pos)
            .scrollIntoView(),
        ),
      !0);
}
function Ns(r, e, t) {
  let n = e.nodeBefore;
  let i = e.nodeAfter;
  let s;
  let o;
  if (n.type.spec.isolating || i.type.spec.isolating) return !1;
  if (qa(r, e, t)) return !0;
  const l = e.parent.canReplace(e.index(), e.index() + 1);
  if (
    l &&
    (s = (o = n.contentMatchAt(n.childCount)).findWrapping(i.type)) &&
    o.matchType(s[0] || i.type).validEnd
  ) {
    if (t) {
      let d = e.pos + i.nodeSize,
        u = k.empty;
      for (let m = s.length - 1; m >= 0; m--) u = k.from(s[m].create(null, u));
      u = k.from(n.copy(u));
      let p = r.tr.step(new B(e.pos - 1, d, e.pos, d, new b(u, 1, 0), s.length, !0)),
        h = d + 2 * s.length;
      Me(p.doc, h) && p.join(h), t(p.scrollIntoView());
    }
    return !0;
  }
  const a = O.findFrom(e, 1),
    c = a && a.$from.blockRange(a.$to),
    f = c && Qe(c);
  if (f != undefined && f >= e.depth) return t && t(r.tr.lift(c, f).scrollIntoView()), !0;
  if (l && Ze(i, 'start', !0) && Ze(n, 'end')) {
    let d = n,
      u = [];
    for (; u.push(d), !d.isTextblock; ) d = d.lastChild;
    let p = i,
      h = 1;
    for (; !p.isTextblock; p = p.firstChild) h++;
    if (d.canReplace(d.childCount, d.childCount, p.content)) {
      if (t) {
        let m = k.empty;
        for (let y = u.length - 1; y >= 0; y--) m = k.from(u[y].copy(m));
        let g = r.tr.step(
          new B(
            e.pos - u.length,
            e.pos + i.nodeSize,
            e.pos + h,
            e.pos + i.nodeSize - h,
            new b(m, u.length, 0),
            0,
            !0,
          ),
        );
        t(g.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function Ts(r) {
  return function (e, t) {
    let n = e.selection,
      i = r < 0 ? n.$from : n.$to,
      s = i.depth;
    for (; i.node(s).isInline; ) {
      if (!s) return !1;
      s--;
    }
    return i.node(s).isTextblock
      ? (t && t(e.tr.setSelection(w.create(e.doc, r < 0 ? i.start(s) : i.end(s)))), !0)
      : !1;
  };
}
const Ka = Ts(-1),
  Ha = Ts(1);
function Ua(r, e = null) {
  return function (t, n) {
    let { $from: i, $to: s } = t.selection,
      o = i.blockRange(s),
      l = o && qn(o, r, e);
    return l ? (n && n(t.tr.wrap(o, l).scrollIntoView()), !0) : !1;
  };
}
function ni(r, e = null) {
  return function (t, n) {
    let i = !1;
    for (let s = 0; s < t.selection.ranges.length && !i; s++) {
      let {
        $from: { pos: o },
        $to: { pos: l },
      } = t.selection.ranges[s];
      t.doc.nodesBetween(o, l, (a, c) => {
        if (i) return !1;
        if (!(!a.isTextblock || a.hasMarkup(r, e)))
          if (a.type == r) i = !0;
          else {
            let f = t.doc.resolve(c),
              d = f.index();
            i = f.parent.canReplaceWith(d, d + 1, r);
          }
      });
    }
    if (!i) return !1;
    if (n) {
      let s = t.tr;
      for (let o = 0; o < t.selection.ranges.length; o++) {
        let {
          $from: { pos: l },
          $to: { pos: a },
        } = t.selection.ranges[o];
        s.setBlockType(l, a, r, e);
      }
      n(s.scrollIntoView());
    }
    return !0;
  };
}
typeof navigator < 'u'
  ? /Mac|iP(hone|[ao]d)/.test(navigator.platform)
  : typeof os < 'u' && os.platform && os.platform() == 'darwin';
function Ga(r, e = null) {
  return function (t, n) {
    let { $from: i, $to: s } = t.selection,
      o = i.blockRange(s),
      l = !1,
      a = o;
    if (!o) return !1;
    if (o.depth >= 2 && i.node(o.depth - 1).type.compatibleContent(r) && o.startIndex == 0) {
      if (i.index(o.depth - 1) == 0) return !1;
      let f = t.doc.resolve(o.start - 2);
      (a = new vt(f, f, o.depth)),
        o.endIndex < o.parent.childCount && (o = new vt(i, t.doc.resolve(s.end(o.depth)), o.depth)),
        (l = !0);
    }
    let c = qn(a, r, e, o);
    return c ? (n && n(Ya(t.tr, o, c, l, r).scrollIntoView()), !0) : !1;
  };
}
function Ya(r, e, t, n, i) {
  let s = k.empty;
  for (let f = t.length - 1; f >= 0; f--) s = k.from(t[f].type.create(t[f].attrs, s));
  r.step(new B(e.start - (n ? 2 : 0), e.end, e.start, e.end, new b(s, 0, 0), t.length, !0));
  let o = 0;
  for (let f = 0; f < t.length; f++) t[f].type == i && (o = f + 1);
  let l = t.length - o;
  let a = e.start + t.length - (n ? 2 : 0);
  let c = e.parent;
  for (let f = e.startIndex, d = e.endIndex, u = !0; f < d; f++, u = !1)
    !u && Ke(r.doc, a, l) && (r.split(a, l), (a += 2 * l)), (a += c.child(f).nodeSize);
  return r;
}
function Xa(r) {
  return function (e, t) {
    let { $from: n, $to: i } = e.selection,
      s = n.blockRange(i, (o) => o.childCount > 0 && o.firstChild.type == r);
    return s ? (t ? (n.node(s.depth - 1).type == r ? _a(e, t, r, s) : Za(e, t, s)) : !0) : !1;
  };
}
function _a(r, e, t, n) {
  const i = r.tr,
    s = n.end,
    o = n.$to.end(n.depth);
  s < o &&
    (i.step(new B(s - 1, o, s, o, new b(k.from(t.create(null, n.parent.copy())), 1, 0), 1, !0)),
    (n = new vt(i.doc.resolve(n.$from.pos), i.doc.resolve(o), n.depth)));
  const l = Qe(n);
  if (l == undefined) return !1;
  i.lift(n, l);
  const a = i.mapping.map(s, -1) - 1;
  return Me(i.doc, a) && i.join(a), e(i.scrollIntoView()), !0;
}
function Za(r, e, t) {
  const n = r.tr,
    i = t.parent;
  for (let p = t.end, h = t.endIndex - 1, m = t.startIndex; h > m; h--)
    (p -= i.child(h).nodeSize), n.delete(p - 1, p + 1);
  const s = n.doc.resolve(t.start),
    o = s.nodeAfter;
  if (n.mapping.map(t.end) != t.start + s.nodeAfter.nodeSize) return !1;
  const l = t.startIndex == 0,
    a = t.endIndex == i.childCount,
    c = s.node(-1),
    f = s.index(-1);
  if (!c.canReplace(f + (l ? 0 : 1), f + 1, o.content.append(a ? k.empty : k.from(i)))) return !1;
  const d = s.pos,
    u = d + o.nodeSize;
  return (
    n.step(
      new B(
        d - (l ? 1 : 0),
        u + (a ? 1 : 0),
        d + 1,
        u - 1,
        new b(
          (l ? k.empty : k.from(i.copy(k.empty))).append(a ? k.empty : k.from(i.copy(k.empty))),
          l ? 0 : 1,
          a ? 0 : 1,
        ),
        l ? 0 : 1,
      ),
    ),
    e(n.scrollIntoView()),
    !0
  );
}
function Qa(r) {
  return function (e, t) {
    let { $from: n, $to: i } = e.selection,
      s = n.blockRange(i, (c) => c.childCount > 0 && c.firstChild.type == r);
    if (!s) return !1;
    let o = s.startIndex;
    if (o == 0) return !1;
    let l = s.parent,
      a = l.child(o - 1);
    if (a.type != r) return !1;
    if (t) {
      let c = a.lastChild && a.lastChild.type == l.type,
        f = k.from(c ? r.create() : null),
        d = new b(k.from(r.create(null, k.from(l.type.create(null, f)))), c ? 3 : 1, 0),
        u = s.start,
        p = s.end;
      t(e.tr.step(new B(u - (c ? 3 : 1), p, u, p, d, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function _t(r) {
  const { state: e, transaction: t } = r;
  let { selection: n } = t;
  let { doc: i } = t;
  let { storedMarks: s } = t;
  return {
    ...e,
    apply: e.apply.bind(e),
    applyTransaction: e.applyTransaction.bind(e),
    plugins: e.plugins,
    schema: e.schema,
    reconfigure: e.reconfigure.bind(e),
    toJSON: e.toJSON.bind(e),
    get storedMarks() {
      return s;
    },
    get selection() {
      return n;
    },
    get doc() {
      return i;
    },
    get tr() {
      return (n = t.selection), (i = t.doc), (s = t.storedMarks), t;
    },
  };
}
class Zt {
  constructor(e) {
    (this.editor = e.editor),
      (this.rawCommands = this.editor.extensionManager.commands),
      (this.customState = e.state);
  }

  get hasCustomState() {
    return !!this.customState;
  }

  get state() {
    return this.customState || this.editor.state;
  }

  get commands() {
    const { rawCommands: e, editor: t, state: n } = this,
      { view: i } = t,
      { tr: s } = n,
      o = this.buildProps(s);
    return Object.fromEntries(
      Object.entries(e).map(([l, a]) => [
        l,
        (...f) => {
          const d = a(...f)(o);
          return !s.getMeta('preventDispatch') && !this.hasCustomState && i.dispatch(s), d;
        },
      ]),
    );
  }

  get chain() {
    return () => this.createChain();
  }

  get can() {
    return () => this.createCan();
  }

  createChain(e, t = !0) {
    const { rawCommands: n, editor: i, state: s } = this,
      { view: o } = i,
      l = [],
      a = !!e,
      c = e || s.tr,
      f = () => (
        !a && t && !c.getMeta('preventDispatch') && !this.hasCustomState && o.dispatch(c),
        l.every((u) => u === !0)
      ),
      d = {
        ...Object.fromEntries(
          Object.entries(n).map(([u, p]) => [
            u,
            (...m) => {
              const g = this.buildProps(c, t),
                y = p(...m)(g);
              return l.push(y), d;
            },
          ]),
        ),
        run: f,
      };
    return d;
  }

  createCan(e) {
    const { rawCommands: t, state: n } = this,
      i = !1,
      s = e || n.tr,
      o = this.buildProps(s, i);
    return {
      ...Object.fromEntries(
        Object.entries(t).map(([a, c]) => [
          a,
          (...f) =>
            c(...f)({
              ...o,
              dispatch: void 0,
            }),
        ]),
      ),
      chain: () => this.createChain(s, i),
    };
  }

  buildProps(e, t = !0) {
    const { rawCommands: n, editor: i, state: s } = this,
      { view: o } = i,
      l = {
        tr: e,
        editor: i,
        view: o,
        state: _t({
          state: s,
          transaction: e,
        }),
        dispatch: t ? () => {} : void 0,
        chain: () => this.createChain(e, t),
        can: () => this.createCan(e),
        get commands() {
          return Object.fromEntries(Object.entries(n).map(([a, c]) => [a, (...f) => c(...f)(l)]));
        },
      };
    return l;
  }
}
class ec {
  constructor() {
    this.callbacks = {};
  }

  on(e, t) {
    return this.callbacks[e] || (this.callbacks[e] = []), this.callbacks[e].push(t), this;
  }

  emit(e, ...t) {
    const n = this.callbacks[e];
    return n && n.forEach((i) => i.apply(this, t)), this;
  }

  off(e, t) {
    const n = this.callbacks[e];
    return (
      n && (t ? (this.callbacks[e] = n.filter((i) => i !== t)) : delete this.callbacks[e]), this
    );
  }

  removeAllListeners() {
    this.callbacks = {};
  }
}
function x(r, e, t) {
  return r.config[e] === void 0 && r.parent
    ? x(r.parent, e, t)
    : typeof r.config[e] == 'function'
    ? r.config[e].bind({
        ...t,
        parent: r.parent ? x(r.parent, e, t) : null,
      })
    : r.config[e];
}
function Qt(r) {
  const e = r.filter((i) => i.type === 'extension');
  const t = r.filter((i) => i.type === 'node');
  const n = r.filter((i) => i.type === 'mark');
  return {
    baseExtensions: e,
    nodeExtensions: t,
    markExtensions: n,
  };
}
function Es(r) {
  const e = [];
  const { nodeExtensions: t, markExtensions: n } = Qt(r);
  const i = [...t, ...n];
  const s = {
    default: null,
    rendered: !0,
    renderHTML: null,
    parseHTML: null,
    keepOnSplit: !0,
    isRequired: !1,
  };
  return (
    r.forEach((o) => {
      const l = {
          name: o.name,
          options: o.options,
          storage: o.storage,
          extensions: i,
        },
        a = x(o, 'addGlobalAttributes', l);
      if (!a) return;
      a().forEach((f) => {
        f.types.forEach((d) => {
          Object.entries(f.attributes).forEach(([u, p]) => {
            e.push({
              type: d,
              name: u,
              attribute: {
                ...s,
                ...p,
              },
            });
          });
        });
      });
    }),
    i.forEach((o) => {
      const l = {
          name: o.name,
          options: o.options,
          storage: o.storage,
        },
        a = x(o, 'addAttributes', l);
      if (!a) return;
      const c = a();
      Object.entries(c).forEach(([f, d]) => {
        const u = {
          ...s,
          ...d,
        };
        typeof (u == undefined ? void 0 : u.default) === 'function' && (u.default = u.default()),
          u != undefined &&
            u.isRequired &&
            (u == undefined ? void 0 : u.default) === void 0 &&
            delete u.default,
          e.push({
            type: o.name,
            name: f,
            attribute: u,
          });
      });
    }),
    e
  );
}
function z(r, e) {
  if (typeof r === 'string') {
    if (!e.nodes[r])
      throw new Error(`There is no node type named '${r}'. Maybe you forgot to add the extension?`);
    return e.nodes[r];
  }
  return r;
}
function tc(...r) {
  return r
    .filter((e) => !!e)
    .reduce((e, t) => {
      const n = {
        ...e,
      };
      return (
        Object.entries(t).forEach(([i, s]) => {
          if (!n[i]) {
            n[i] = s;
            return;
          }
          if (i === 'class') {
            const l = s ? s.split(' ') : [],
              a = n[i] ? n[i].split(' ') : [],
              c = l.filter((f) => !a.includes(f));
            n[i] = [...a, ...c].join(' ');
          } else i === 'style' ? (n[i] = [n[i], s].join('; ')) : (n[i] = s);
        }),
        n
      );
    }, {});
}
function Vn(r, e) {
  return e
    .filter((t) => t.attribute.rendered)
    .map((t) =>
      t.attribute.renderHTML
        ? t.attribute.renderHTML(r.attrs) || {}
        : {
            [t.name]: r.attrs[t.name],
          },
    )
    .reduce((t, n) => tc(t, n), {});
}
function Ds(r) {
  return typeof r === 'function';
}
function C(r, e = void 0, ...t) {
  return Ds(r) ? (e ? r.bind(e)(...t) : r(...t)) : r;
}
function nc(r = {}) {
  return Object.keys(r).length === 0 && r.constructor === Object;
}
function rc(r) {
  return typeof r !== 'string'
    ? r
    : /^[+-]?(?:\d*\.)?\d+$/.test(r)
    ? Number(r)
    : r === 'true'
    ? !0
    : r === 'false'
    ? !1
    : r;
}
function ri(r, e) {
  return 'style' in r
    ? r
    : {
        ...r,
        getAttrs: (t) => {
          const n = r.getAttrs ? r.getAttrs(t) : r.attrs;
          if (n === !1) return !1;
          const i = e.reduce((s, o) => {
            const l = o.attribute.parseHTML ? o.attribute.parseHTML(t) : rc(t.getAttribute(o.name));
            return l == undefined
              ? s
              : {
                  ...s,
                  [o.name]: l,
                };
          }, {});
          return {
            ...n,
            ...i,
          };
        },
      };
}
function ii(r) {
  return Object.fromEntries(
    Object.entries(r).filter(([e, t]) => (e === 'attrs' && nc(t) ? !1 : t != undefined)),
  );
}
function As(r, e) {
  let t;
  const n = Es(r);
  const { nodeExtensions: i, markExtensions: s } = Qt(r);
  const o = (t = i.find((c) => x(c, 'topNode'))) === null || t === void 0 ? void 0 : t.name;
  const l = Object.fromEntries(
    i.map((c) => {
      const f = n.filter((y) => y.type === c.name),
        d = {
          name: c.name,
          options: c.options,
          storage: c.storage,
          editor: e,
        },
        u = r.reduce((y, M) => {
          const N = x(M, 'extendNodeSchema', d);
          return {
            ...y,
            ...(N ? N(c) : {}),
          };
        }, {}),
        p = ii({
          ...u,
          content: C(x(c, 'content', d)),
          marks: C(x(c, 'marks', d)),
          group: C(x(c, 'group', d)),
          inline: C(x(c, 'inline', d)),
          atom: C(x(c, 'atom', d)),
          selectable: C(x(c, 'selectable', d)),
          draggable: C(x(c, 'draggable', d)),
          code: C(x(c, 'code', d)),
          whitespace: C(x(c, 'whitespace', d)),
          defining: C(x(c, 'defining', d)),
          isolating: C(x(c, 'isolating', d)),
          attrs: Object.fromEntries(
            f.map((y) => {
              var M;
              return [
                y.name,
                {
                  default:
                    (M = y == null ? void 0 : y.attribute) === null || M === void 0
                      ? void 0
                      : M.default,
                },
              ];
            }),
          ),
        }),
        h = C(x(c, 'parseHTML', d));
      h && (p.parseDOM = h.map((y) => ri(y, f)));
      const m = x(c, 'renderHTML', d);
      m &&
        (p.toDOM = (y) =>
          m({
            node: y,
            HTMLAttributes: Vn(y, f),
          }));
      const g = x(c, 'renderText', d);
      return g && (p.toText = g), [c.name, p];
    }),
  );
  const a = Object.fromEntries(
    s.map((c) => {
      const f = n.filter((g) => g.type === c.name);
      const d = {
        name: c.name,
        options: c.options,
        storage: c.storage,
        editor: e,
      };
      const u = r.reduce((g, y) => {
        const M = x(y, 'extendMarkSchema', d);
        return {
          ...g,
          ...(M ? M(c) : {}),
        };
      }, {});
      const p = ii({
        ...u,
        inclusive: C(x(c, 'inclusive', d)),
        excludes: C(x(c, 'excludes', d)),
        group: C(x(c, 'group', d)),
        spanning: C(x(c, 'spanning', d)),
        code: C(x(c, 'code', d)),
        attrs: Object.fromEntries(
          f.map((g) => {
            var y;
            return [
              g.name,
              {
                default:
                  (y = g == null ? void 0 : g.attribute) === null || y === void 0
                    ? void 0
                    : y.default,
              },
            ];
          }),
        ),
      });
      const h = C(x(c, 'parseHTML', d));
      h && (p.parseDOM = h.map((g) => ri(g, f)));
      const m = x(c, 'renderHTML', d);
      return (
        m &&
          (p.toDOM = (g) =>
            m({
              mark: g,
              HTMLAttributes: Vn(g, f),
            })),
        [c.name, p]
      );
    }),
  );
  return new Oi({
    topNode: o,
    nodes: l,
    marks: a,
  });
}
function bn(r, e) {
  return e.nodes[r] || e.marks[r] || null;
}
function si(r, e) {
  return Array.isArray(e) ? e.some((t) => (typeof t === 'string' ? t : t.name) === r.name) : e;
}
const ic = (r, e = 500) => {
  let t = '';
  const n = r.parentOffset;
  return (
    r.parent.nodesBetween(Math.max(0, n - e), n, (i, s, o, l) => {
      var a, c;
      const f =
        ((c = (a = i.type.spec).toText) === null || c === void 0
          ? void 0
          : c.call(a, {
              node: i,
              pos: s,
              parent: o,
              index: l,
            })) ||
        i.textContent ||
        '%leaf%';
      t += f.slice(0, Math.max(0, n - s));
    }),
    t
  );
};
function nr(r) {
  return Object.prototype.toString.call(r) === '[object RegExp]';
}
class en {
  constructor(e) {
    (this.find = e.find), (this.handler = e.handler);
  }
}
const sc = (r, e) => {
  if (nr(e)) return e.exec(r);
  const t = e(r);
  if (!t) return null;
  const n = [t.text];
  return (
    (n.index = t.index),
    (n.input = r),
    (n.data = t.data),
    t.replaceWith &&
      (t.text.includes(t.replaceWith) ||
        console.warn(
          '[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".',
        ),
      n.push(t.replaceWith)),
    n
  );
};
function wt(r) {
  let e;
  const { editor: t, from: n, to: i, text: s, rules: o, plugin: l } = r;
  const { view: a } = t;
  if (a.composing) return !1;
  const c = a.state.doc.resolve(n);
  if (
    c.parent.type.spec.code ||
    (!((e = c.nodeBefore || c.nodeAfter) === null || e === void 0) &&
      e.marks.find((u) => u.type.spec.code))
  )
    return !1;
  let f = !1;
  const d = ic(c) + s;
  return (
    o.forEach((u) => {
      if (f) return;
      const p = sc(d, u.find);
      if (!p) return;
      const h = a.state.tr,
        m = _t({
          state: a.state,
          transaction: h,
        }),
        g = {
          from: n - (p[0].length - s.length),
          to: i,
        },
        {
          commands: y,
          chain: M,
          can: N,
        } = new Zt({
          editor: t,
          state: m,
        });
      u.handler({
        state: m,
        range: g,
        match: p,
        commands: y,
        chain: M,
        can: N,
      }) === null ||
        h.steps.length === 0 ||
        (h.setMeta(l, {
          transform: h,
          from: n,
          to: i,
          text: s,
        }),
        a.dispatch(h),
        (f = !0));
    }),
    f
  );
}
function oc(r) {
  const { editor: e, rules: t } = r;
  const n = new Ce({
    state: {
      init() {
        return null;
      },
      apply(i, s) {
        const o = i.getMeta(n);
        if (o) return o;
        const l = i.getMeta('applyInputRules');
        return (
          !!l &&
            setTimeout(() => {
              const { from: c, text: f } = l,
                d = c + f.length;
              wt({
                editor: e,
                from: c,
                to: d,
                text: f,
                rules: t,
                plugin: n,
              });
            }),
          i.selectionSet || i.docChanged ? null : s
        );
      },
    },
    props: {
      handleTextInput(i, s, o, l) {
        return wt({
          editor: e,
          from: s,
          to: o,
          text: l,
          rules: t,
          plugin: n,
        });
      },
      handleDOMEvents: {
        compositionend: (i) => (
          setTimeout(() => {
            const { $cursor: s } = i.state.selection;
            s &&
              wt({
                editor: e,
                from: s.pos,
                to: s.pos,
                text: '',
                rules: t,
                plugin: n,
              });
          }),
          !1
        ),
      },
      handleKeyDown(i, s) {
        if (s.key !== 'Enter') return !1;
        const { $cursor: o } = i.state.selection;
        return o
          ? wt({
              editor: e,
              from: o.pos,
              to: o.pos,
              text: `
`,
              rules: t,
              plugin: n,
            })
          : !1;
      },
    },
    isInputRules: !0,
  });
  return n;
}
function lc(r) {
  return typeof r === 'number';
}
class ac {
  constructor(e) {
    (this.find = e.find), (this.handler = e.handler);
  }
}
const cc = (r, e, t) => {
  if (nr(e)) return [...r.matchAll(e)];
  const n = e(r, t);
  return n
    ? n.map((i) => {
        const s = [i.text];
        return (
          (s.index = i.index),
          (s.input = r),
          (s.data = i.data),
          i.replaceWith &&
            (i.text.includes(i.replaceWith) ||
              console.warn(
                '[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".',
              ),
            s.push(i.replaceWith)),
          s
        );
      })
    : [];
};
function fc(r) {
  const { editor: e, state: t, from: n, to: i, rule: s, pasteEvent: o, dropEvent: l } = r;
  const {
    commands: a,
    chain: c,
    can: f,
  } = new Zt({
    editor: e,
    state: t,
  });
  const d = [];
  return (
    t.doc.nodesBetween(n, i, (p, h) => {
      if (!p.isTextblock || p.type.spec.code) return;
      const m = Math.max(n, h),
        g = Math.min(i, h + p.content.size),
        y = p.textBetween(m - h, g - h, void 0, '￼');
      cc(y, s.find, o).forEach((N) => {
        if (N.index === void 0) return;
        const A = m + N.index + 1,
          I = A + N[0].length,
          E = {
            from: t.tr.mapping.map(A),
            to: t.tr.mapping.map(I),
          },
          $ = s.handler({
            state: t,
            range: E,
            match: N,
            commands: a,
            chain: c,
            can: f,
            pasteEvent: o,
            dropEvent: l,
          });
        d.push($);
      });
    }),
    d.every((p) => p !== null)
  );
}
const dc = (r) => {
  let e;
  const t = new ClipboardEvent('paste', {
    clipboardData: new DataTransfer(),
  });
  return (e = t.clipboardData) === null || e === void 0 || e.setData('text/html', r), t;
};
function uc(r) {
  const { editor: e, rules: t } = r;
  let n = null;
  let i = !1;
  let s = !1;
  let o = typeof ClipboardEvent < 'u' ? new ClipboardEvent('paste') : null;
  let l = typeof DragEvent < 'u' ? new DragEvent('drop') : null;
  const a = ({ state: f, from: d, to: u, rule: p, pasteEvt: h }) => {
    const m = f.tr,
      g = _t({
        state: f,
        transaction: m,
      });
    if (
      !(
        !fc({
          editor: e,
          state: g,
          from: Math.max(d - 1, 0),
          to: u.b - 1,
          rule: p,
          pasteEvent: h,
          dropEvent: l,
        }) || m.steps.length === 0
      )
    )
      return (
        (l = typeof DragEvent < 'u' ? new DragEvent('drop') : null),
        (o = typeof ClipboardEvent < 'u' ? new ClipboardEvent('paste') : null),
        m
      );
  };
  return t.map(
    (f) =>
      new Ce({
        view(d) {
          const u = (p) => {
            var h;
            n =
              !((h = d.dom.parentElement) === null || h === void 0) && h.contains(p.target)
                ? d.dom.parentElement
                : null;
          };
          return (
            window.addEventListener('dragstart', u),
            {
              destroy() {
                window.removeEventListener('dragstart', u);
              },
            }
          );
        },
        props: {
          handleDOMEvents: {
            drop: (d, u) => ((s = n === d.dom.parentElement), (l = u), !1),
            paste: (d, u) => {
              var p;
              const h =
                (p = u.clipboardData) === null || p === void 0 ? void 0 : p.getData('text/html');
              return (o = u), (i = !!(h != undefined && h.includes('data-pm-slice'))), !1;
            },
          },
        },
        appendTransaction: (d, u, p) => {
          const h = d[0],
            m = h.getMeta('uiEvent') === 'paste' && !i,
            g = h.getMeta('uiEvent') === 'drop' && !s,
            y = h.getMeta('applyPasteRules'),
            M = !!y;
          if (!m && !g && !M) return;
          if (M) {
            const { from: I, text: E } = y,
              $ = I + E.length,
              te = dc(E);
            return a({
              rule: f,
              state: p,
              from: I,
              to: {
                b: $,
              },
              pasteEvt: te,
            });
          }
          const N = u.doc.content.findDiffStart(p.doc.content),
            A = u.doc.content.findDiffEnd(p.doc.content);
          if (!(!lc(N) || !A || N === A.b))
            return a({
              rule: f,
              state: p,
              from: N,
              to: A,
              pasteEvt: o,
            });
        },
      }),
  );
}
function hc(r) {
  const e = r.filter((t, n) => r.indexOf(t) !== n);
  return [...new Set(e)];
}
class Ae {
  constructor(e, t) {
    (this.splittableMarks = []),
      (this.editor = t),
      (this.extensions = Ae.resolve(e)),
      (this.schema = As(this.extensions, t)),
      this.setupExtensions();
  }

  static resolve(e) {
    const t = Ae.sort(Ae.flatten(e)),
      n = hc(t.map((i) => i.name));
    return (
      n.length &&
        console.warn(
          `[tiptap warn]: Duplicate extension names found: [${n
            .map((i) => `'${i}'`)
            .join(', ')}]. This can lead to issues.`,
        ),
      t
    );
  }

  static flatten(e) {
    return e
      .map((t) => {
        const n = {
            name: t.name,
            options: t.options,
            storage: t.storage,
          },
          i = x(t, 'addExtensions', n);
        return i ? [t, ...this.flatten(i())] : t;
      })
      .flat(10);
  }

  static sort(e) {
    return e.sort((n, i) => {
      const s = x(n, 'priority') || 100,
        o = x(i, 'priority') || 100;
      return s > o ? -1 : s < o ? 1 : 0;
    });
  }

  get commands() {
    return this.extensions.reduce((e, t) => {
      const n = {
          name: t.name,
          options: t.options,
          storage: t.storage,
          editor: this.editor,
          type: bn(t.name, this.schema),
        },
        i = x(t, 'addCommands', n);
      return i
        ? {
            ...e,
            ...i(),
          }
        : e;
    }, {});
  }

  get plugins() {
    const { editor: e } = this,
      t = Ae.sort([...this.extensions].reverse()),
      n = [],
      i = [],
      s = t.flatMap((o) => {
        const l = {
            name: o.name,
            options: o.options,
            storage: o.storage,
            editor: e,
            type: bn(o.name, this.schema),
          },
          a = [],
          c = x(o, 'addKeyboardShortcuts', l);
        let f = {};
        if (
          (o.type === 'mark' &&
            x(o, 'exitable', l) &&
            (f.ArrowRight = () =>
              jt.handleExit({
                editor: e,
                mark: o,
              })),
          c)
        ) {
          const m = Object.fromEntries(
            Object.entries(c()).map(([g, y]) => [
              g,
              () =>
                y({
                  editor: e,
                }),
            ]),
          );
          f = {
            ...f,
            ...m,
          };
        }
        const d = Ta(f);
        a.push(d);
        const u = x(o, 'addInputRules', l);
        si(o, e.options.enableInputRules) && u && n.push(...u());
        const p = x(o, 'addPasteRules', l);
        si(o, e.options.enablePasteRules) && p && i.push(...p());
        const h = x(o, 'addProseMirrorPlugins', l);
        if (h) {
          const m = h();
          a.push(...m);
        }
        return a;
      });
    return [
      oc({
        editor: e,
        rules: n,
      }),
      ...uc({
        editor: e,
        rules: i,
      }),
      ...s,
    ];
  }

  get attributes() {
    return Es(this.extensions);
  }

  get nodeViews() {
    const { editor: e } = this,
      { nodeExtensions: t } = Qt(this.extensions);
    return Object.fromEntries(
      t
        .filter((n) => !!x(n, 'addNodeView'))
        .map((n) => {
          const i = this.attributes.filter((a) => a.type === n.name),
            s = {
              name: n.name,
              options: n.options,
              storage: n.storage,
              editor: e,
              type: z(n.name, this.schema),
            },
            o = x(n, 'addNodeView', s);
          if (!o) return [];
          const l = (a, c, f, d) => {
            const u = Vn(a, i);
            return o()({
              editor: e,
              node: a,
              getPos: f,
              decorations: d,
              HTMLAttributes: u,
              extension: n,
            });
          };
          return [n.name, l];
        }),
    );
  }

  setupExtensions() {
    this.extensions.forEach((e) => {
      var t;
      this.editor.extensionStorage[e.name] = e.storage;
      const n = {
        name: e.name,
        options: e.options,
        storage: e.storage,
        editor: this.editor,
        type: bn(e.name, this.schema),
      };
      e.type === 'mark' &&
        (!((t = C(x(e, 'keepOnSplit', n))) !== null && t !== void 0) || t) &&
        this.splittableMarks.push(e.name);
      const i = x(e, 'onBeforeCreate', n),
        s = x(e, 'onCreate', n),
        o = x(e, 'onUpdate', n),
        l = x(e, 'onSelectionUpdate', n),
        a = x(e, 'onTransaction', n),
        c = x(e, 'onFocus', n),
        f = x(e, 'onBlur', n),
        d = x(e, 'onDestroy', n);
      i && this.editor.on('beforeCreate', i),
        s && this.editor.on('create', s),
        o && this.editor.on('update', o),
        l && this.editor.on('selectionUpdate', l),
        a && this.editor.on('transaction', a),
        c && this.editor.on('focus', c),
        f && this.editor.on('blur', f),
        d && this.editor.on('destroy', d);
    });
  }
}
function pc(r) {
  return Object.prototype.toString.call(r).slice(8, -1);
}
function Ot(r) {
  return pc(r) === 'Object'
    ? r.constructor === Object && Object.getPrototypeOf(r) === Object.prototype
    : !1;
}
function tn(r, e) {
  const t = {
    ...r,
  };
  return (
    Ot(r) &&
      Ot(e) &&
      Object.keys(e).forEach((n) => {
        Ot(e[n]) && Ot(r[n]) ? (t[n] = tn(r[n], e[n])) : (t[n] = e[n]);
      }),
    t
  );
}
class ce {
  constructor(e = {}) {
    (this.type = 'extension'),
      (this.name = 'extension'),
      (this.parent = null),
      (this.child = null),
      (this.config = {
        name: this.name,
        defaultOptions: {},
      }),
      (this.config = {
        ...this.config,
        ...e,
      }),
      (this.name = this.config.name),
      e.defaultOptions &&
        Object.keys(e.defaultOptions).length > 0 &&
        console.warn(
          `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`,
        ),
      (this.options = this.config.defaultOptions),
      this.config.addOptions &&
        (this.options = C(
          x(this, 'addOptions', {
            name: this.name,
          }),
        )),
      (this.storage =
        C(
          x(this, 'addStorage', {
            name: this.name,
            options: this.options,
          }),
        ) || {});
  }

  static create(e = {}) {
    return new ce(e);
  }

  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => tn(this.options, e),
    });
    return (t.name = this.name), (t.parent = this.parent), t;
  }

  extend(e = {}) {
    const t = new ce({
      ...this.config,
      ...e,
    });
    return (
      (t.parent = this),
      (this.child = t),
      (t.name = e.name ? e.name : t.parent.name),
      e.defaultOptions &&
        Object.keys(e.defaultOptions).length > 0 &&
        console.warn(
          `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`,
        ),
      (t.options = C(
        x(t, 'addOptions', {
          name: t.name,
        }),
      )),
      (t.storage = C(
        x(t, 'addStorage', {
          name: t.name,
          options: t.options,
        }),
      )),
      t
    );
  }
}
function Is(r, e, t) {
  const { from: n, to: i } = e;
  const {
    blockSeparator: s = `

`,
    textSerializers: o = {},
  } = t || {};
  let l = '';
  return (
    r.nodesBetween(n, i, (a, c, f, d) => {
      var u;
      a.isBlock && c > n && (l += s);
      const p = o == undefined ? void 0 : o[a.type.name];
      if (p)
        return (
          f &&
            (l += p({
              node: a,
              pos: c,
              parent: f,
              index: d,
              range: e,
            })),
          !1
        );
      a.isText &&
        (l +=
          (u = a == undefined ? void 0 : a.text) === null || u === void 0
            ? void 0
            : u.slice(Math.max(n, c) - c, i - c));
    }),
    l
  );
}
function vs(r) {
  return Object.fromEntries(
    Object.entries(r.nodes)
      .filter(([, e]) => e.spec.toText)
      .map(([e, t]) => [e, t.spec.toText]),
  );
}
const mc = ce.create({
    name: 'clipboardTextSerializer',
    addOptions() {
      return {
        blockSeparator: void 0,
      };
    },
    addProseMirrorPlugins() {
      return [
        new Ce({
          key: new gt('clipboardTextSerializer'),
          props: {
            clipboardTextSerializer: () => {
              const { editor: r } = this,
                { state: e, schema: t } = r,
                { doc: n, selection: i } = e,
                { ranges: s } = i,
                o = Math.min(...s.map((f) => f.$from.pos)),
                l = Math.max(...s.map((f) => f.$to.pos)),
                a = vs(t);
              return Is(
                n,
                {
                  from: o,
                  to: l,
                },
                {
                  ...(this.options.blockSeparator === void 0
                    ? {}
                    : {
                        blockSeparator: this.options.blockSeparator,
                      }),
                  textSerializers: a,
                },
              );
            },
          },
        }),
      ];
    },
  }),
  gc =
    () =>
    ({ editor: r, view: e }) => (
      requestAnimationFrame(() => {
        var t;
        r.isDestroyed ||
          (e.dom.blur(),
          (t = window == undefined ? void 0 : window.getSelection()) === null ||
            t === void 0 ||
            t.removeAllRanges());
      }),
      !0
    ),
  yc =
    (r = !1) =>
    ({ commands: e }) =>
      e.setContent('', r),
  kc =
    () =>
    ({ state: r, tr: e, dispatch: t }) => {
      const { selection: n } = e,
        { ranges: i } = n;
      return (
        t &&
          i.forEach(({ $from: s, $to: o }) => {
            r.doc.nodesBetween(s.pos, o.pos, (l, a) => {
              if (l.type.isText) return;
              const { doc: c, mapping: f } = e,
                d = c.resolve(f.map(a)),
                u = c.resolve(f.map(a + l.nodeSize)),
                p = d.blockRange(u);
              if (!p) return;
              const h = Qe(p);
              if (l.type.isTextblock) {
                const { defaultType: m } = d.parent.contentMatchAt(d.index());
                e.setNodeMarkup(p.start, m);
              }
              (h || h === 0) && e.lift(p, h);
            });
          }),
        !0
      );
    },
  bc = (r) => (e) => r(e),
  xc =
    () =>
    ({ state: r, dispatch: e }) =>
      Ja(r, e),
  Sc =
    (r, e) =>
    ({ editor: t, tr: n }) => {
      const { state: i } = t,
        s = i.doc.slice(r.from, r.to);
      n.deleteRange(r.from, r.to);
      const o = n.mapping.map(e);
      return n.insert(o, s.content), n.setSelection(new w(n.doc.resolve(o - 1))), !0;
    },
  Mc =
    () =>
    ({ tr: r, dispatch: e }) => {
      const { selection: t } = r,
        n = t.$anchor.node();
      if (n.content.size > 0) {
        return !1;
      }
      const i = r.selection.$anchor;
      for (let s = i.depth; s > 0; s -= 1) {
        if (i.node(s).type === n.type) {
          if (e) {
            const l = i.before(s),
              a = i.after(s);
            r.delete(l, a).scrollIntoView();
          }
          return !0;
        }
      }
      return !1;
    },
  Cc =
    (r) =>
    ({ tr: e, state: t, dispatch: n }) => {
      const i = z(r, t.schema),
        s = e.selection.$anchor;
      for (let o = s.depth; o > 0; o -= 1) {
        if (s.node(o).type === i) {
          if (n) {
            const a = s.before(o),
              c = s.after(o);
            e.delete(a, c).scrollIntoView();
          }
          return !0;
        }
      }
      return !1;
    },
  wc =
    (r) =>
    ({ tr: e, dispatch: t }) => {
      const { from: n, to: i } = r;
      return t && e.delete(n, i), !0;
    },
  Oc =
    () =>
    ({ state: r, dispatch: e }) =>
      Da(r, e),
  Nc =
    () =>
    ({ commands: r }) =>
      r.keyboardShortcut('Enter'),
  Tc =
    () =>
    ({ state: r, dispatch: e }) =>
      $a(r, e);
function Jt(
  r,
  e,
  t = {
    strict: !0,
  },
) {
  const n = Object.keys(e);
  return n.length > 0
    ? n.every((i) => (t.strict ? e[i] === r[i] : nr(e[i]) ? e[i].test(r[i]) : e[i] === r[i]))
    : !0;
}
function Ln(r, e, t = {}) {
  return r.find((n) => n.type === e && Jt(n.attrs, t));
}
function Ec(r, e, t = {}) {
  return !!Ln(r, e, t);
}
function rr(r, e, t = {}) {
  if (!r || !e) return;
  let n = r.parent.childAfter(r.parentOffset);
  if (
    (r.parentOffset === n.offset && n.offset !== 0 && (n = r.parent.childBefore(r.parentOffset)),
    !n.node)
  )
    return;
  const i = Ln([...n.node.marks], e, t);
  if (!i) return;
  let s = n.index;
  let o = r.start() + n.offset;
  let l = s + 1;
  let a = o + n.node.nodeSize;
  for (Ln([...n.node.marks], e, t); s > 0 && i.isInSet(r.parent.child(s - 1).marks); )
    (s -= 1), (o -= r.parent.child(s).nodeSize);
  for (; l < r.parent.childCount && Ec([...r.parent.child(l).marks], e, t); )
    (a += r.parent.child(l).nodeSize), (l += 1);
  return {
    from: o,
    to: a,
  };
}
function Oe(r, e) {
  if (typeof r === 'string') {
    if (!e.marks[r])
      throw new Error(`There is no mark type named '${r}'. Maybe you forgot to add the extension?`);
    return e.marks[r];
  }
  return r;
}
const Dc =
    (r, e = {}) =>
    ({ tr: t, state: n, dispatch: i }) => {
      const s = Oe(r, n.schema),
        { doc: o, selection: l } = t,
        { $from: a, from: c, to: f } = l;
      if (i) {
        const d = rr(a, s, e);
        if (d && d.from <= c && d.to >= f) {
          const u = w.create(o, d.from, d.to);
          t.setSelection(u);
        }
      }
      return !0;
    },
  Ac = (r) => (e) => {
    const t = typeof r === 'function' ? r(e) : r;
    for (let n = 0; n < t.length; n += 1) {
      if (t[n](e)) return !0;
    }
    return !1;
  };
function Rs(r) {
  return r instanceof w;
}
function Ie(r = 0, e = 0, t = 0) {
  return Math.min(Math.max(r, e), t);
}
function Ps(r, e = null) {
  if (!e) return null;
  const t = O.atStart(r);
  const n = O.atEnd(r);
  if (e === 'start' || e === !0) return t;
  if (e === 'end') return n;
  const i = t.from;
  const s = n.to;
  return e === 'all'
    ? w.create(r, Ie(0, i, s), Ie(r.content.size, i, s))
    : w.create(r, Ie(e, i, s), Ie(e, i, s));
}
function nn() {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
      navigator.platform,
    ) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}
const Ic =
    (r = null, e = {}) =>
    ({ editor: t, view: n, tr: i, dispatch: s }) => {
      e = {
        scrollIntoView: !0,
        ...e,
      };
      const o = () => {
        nn() && n.dom.focus(),
          requestAnimationFrame(() => {
            t.isDestroyed ||
              (n.focus(), e != undefined && e.scrollIntoView && t.commands.scrollIntoView());
          });
      };
      if ((n.hasFocus() && r === null) || r === !1) {
        return !0;
      }
      if (s && r === null && !Rs(t.state.selection)) {
        return o(), !0;
      }
      const l = Ps(i.doc, r) || t.state.selection,
        a = t.state.selection.eq(l);
      return (
        s && (a || i.setSelection(l), a && i.storedMarks && i.setStoredMarks(i.storedMarks), o()),
        !0
      );
    },
  vc = (r, e) => (t) =>
    r.every((n, i) =>
      e(n, {
        ...t,
        index: i,
      }),
    ),
  Rc =
    (r, e) =>
    ({ tr: t, commands: n }) =>
      n.insertContentAt(
        {
          from: t.selection.from,
          to: t.selection.to,
        },
        r,
        e,
      ),
  Bs = (r) => {
    const e = r.childNodes;
    for (let t = e.length - 1; t >= 0; t -= 1) {
      const n = e[t];
      n.nodeType === 3 && n.nodeValue && /^(\n\s\s|\n)$/.test(n.nodeValue)
        ? r.removeChild(n)
        : n.nodeType === 1 && Bs(n);
    }
    return r;
  };
function oi(r) {
  const e = `<body>${r}</body>`;
  const t = new window.DOMParser().parseFromString(e, 'text/html').body;
  return Bs(t);
}
function Wt(r, e, t) {
  t = {
    slice: !0,
    parseOptions: {},
    ...t,
  };
  const n = typeof r === 'object' && r !== null;
  const i = typeof r === 'string';
  if (n)
    try {
      return Array.isArray(r) && r.length > 0
        ? k.fromArray(r.map((o) => e.nodeFromJSON(o)))
        : e.nodeFromJSON(r);
    } catch (error) {
      if (t.errorOnInvalidContent)
        throw new Error('[tiptap error]: Invalid JSON content', {
          cause: error,
        });
      return (
        console.warn('[tiptap warn]: Invalid content.', 'Passed value:', r, 'Error:', error),
        Wt('', e, t)
      );
    }
  if (i) {
    let s = e,
      o = !1,
      l = '';
    t.errorOnInvalidContent &&
      (s = new Oi({
        topNode: e.spec.topNode,
        marks: e.spec.marks,
        nodes: e.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: 'inline*',
            group: 'block',
            parseDOM: [
              {
                tag: '*',
                getAttrs: (f) => ((o = !0), (l = typeof f === 'string' ? f : f.outerHTML), null),
              },
            ],
          },
        }),
      }));
    const a = Ge.fromSchema(s),
      c = t.slice ? a.parseSlice(oi(r), t.parseOptions).content : a.parse(oi(r), t.parseOptions);
    if (t.errorOnInvalidContent && o)
      throw new Error('[tiptap error]: Invalid HTML content', {
        cause: new Error(`Invalid element found: ${l}`),
      });
    return c;
  }
  return Wt('', e, t);
}
function Pc(r, e, t) {
  const n = r.steps.length - 1;
  if (n < e) return;
  const i = r.steps[n];
  if (!(i instanceof P || i instanceof B)) return;
  const s = r.mapping.maps[n];
  let o = 0;
  s.forEach((l, a, c, f) => {
    o === 0 && (o = f);
  }),
    r.setSelection(O.near(r.doc.resolve(o), t));
}
const Bc = (r) => !('type' in r),
  zc =
    (r, e, t) =>
    ({ tr: n, dispatch: i, editor: s }) => {
      var o;
      if (i) {
        t = {
          parseOptions: {},
          updateSelection: !0,
          applyInputRules: !1,
          applyPasteRules: !1,
          ...t,
        };
        let l;
        try {
          l = Wt(e, s.schema, {
            parseOptions: {
              preserveWhitespace: 'full',
              ...t.parseOptions,
            },
            errorOnInvalidContent:
              (o = t.errorOnInvalidContent) !== null && o !== void 0
                ? o
                : s.options.enableContentCheck,
          });
        } catch {
          return !1;
        }
        let { from: a, to: c } =
          typeof r === 'number'
            ? {
                from: r,
                to: r,
              }
            : {
                from: r.from,
                to: r.to,
              };
        let f = !0;
        let d = !0;
        if (
          ((Bc(l) ? l : [l]).forEach((h) => {
            h.check(), (f = f ? h.isText && h.marks.length === 0 : !1), (d = d ? h.isBlock : !1);
          }),
          a === c && d)
        ) {
          const { parent: h } = n.doc.resolve(a);
          h.isTextblock && !h.type.spec.code && !h.childCount && ((a -= 1), (c += 1));
        }
        let p;
        f
          ? (Array.isArray(e)
              ? (p = e.map((h) => h.text || '').join(''))
              : typeof e == 'object' && e && e.text
              ? (p = e.text)
              : (p = e),
            n.insertText(p, a, c))
          : ((p = l), n.replaceWith(a, c, p)),
          t.updateSelection && Pc(n, n.steps.length - 1, -1),
          t.applyInputRules &&
            n.setMeta('applyInputRules', {
              from: a,
              text: p,
            }),
          t.applyPasteRules &&
            n.setMeta('applyPasteRules', {
              from: a,
              text: p,
            });
      }
      return !0;
    },
  Fc =
    () =>
    ({ state: r, dispatch: e }) =>
      za(r, e),
  Vc =
    () =>
    ({ state: r, dispatch: e }) =>
      Fa(r, e),
  Lc =
    () =>
    ({ state: r, dispatch: e }) =>
      Aa(r, e),
  $c =
    () =>
    ({ state: r, dispatch: e }) =>
      Pa(r, e),
  Jc =
    () =>
    ({ state: r, dispatch: e, tr: t }) => {
      try {
        const n = Kt(r.doc, r.selection.$from.pos, -1);
        return n == undefined ? !1 : (t.join(n, 2), e && e(t), !0);
      } catch {
        return !1;
      }
    },
  Wc =
    () =>
    ({ state: r, dispatch: e, tr: t }) => {
      try {
        const n = Kt(r.doc, r.selection.$from.pos, 1);
        return n == undefined ? !1 : (t.join(n, 2), e && e(t), !0);
      } catch {
        return !1;
      }
    },
  jc =
    () =>
    ({ state: r, dispatch: e }) =>
      Ia(r, e),
  qc =
    () =>
    ({ state: r, dispatch: e }) =>
      va(r, e);
function zs() {
  return typeof navigator < 'u' ? /Mac/.test(navigator.platform) : !1;
}
function Kc(r) {
  const e = r.split(/-(?!$)/);
  let t = e.at(-1);
  t === 'Space' && (t = ' ');
  let n, i, s, o;
  for (let l = 0; l < e.length - 1; l += 1) {
    const a = e[l];
    if (/^(cmd|meta|m)$/i.test(a)) o = !0;
    else if (/^a(lt)?$/i.test(a)) n = !0;
    else if (/^(c|ctrl|control)$/i.test(a)) i = !0;
    else if (/^s(hift)?$/i.test(a)) s = !0;
    else if (/^mod$/i.test(a)) nn() || zs() ? (o = !0) : (i = !0);
    else throw new Error(`Unrecognized modifier name: ${a}`);
  }
  return (
    n && (t = `Alt-${t}`),
    i && (t = `Ctrl-${t}`),
    o && (t = `Meta-${t}`),
    s && (t = `Shift-${t}`),
    t
  );
}
const Hc =
  (r) =>
  ({ editor: e, view: t, tr: n, dispatch: i }) => {
    const s = Kc(r).split(/-(?!$)/);
    const o = s.find((c) => !['Alt', 'Ctrl', 'Meta', 'Shift'].includes(c));
    const l = new KeyboardEvent('keydown', {
      key: o === 'Space' ? ' ' : o,
      altKey: s.includes('Alt'),
      ctrlKey: s.includes('Ctrl'),
      metaKey: s.includes('Meta'),
      shiftKey: s.includes('Shift'),
      bubbles: !0,
      cancelable: !0,
    });
    const a = e.captureTransaction(() => {
      t.someProp('handleKeyDown', (c) => c(t, l));
    });
    return (
      a == undefined ||
        a.steps.forEach((c) => {
          const f = c.map(n.mapping);
          f && i && n.maybeStep(f);
        }),
      !0
    );
  };
function mt(r, e, t = {}) {
  const { from: n, to: i, empty: s } = r.selection;
  const o = e ? z(e, r.schema) : null;
  const l = [];
  r.doc.nodesBetween(n, i, (d, u) => {
    if (d.isText) return;
    const p = Math.max(n, u),
      h = Math.min(i, u + d.nodeSize);
    l.push({
      node: d,
      from: p,
      to: h,
    });
  });
  const a = i - n;
  const c = l
    .filter((d) => (o ? o.name === d.node.type.name : !0))
    .filter((d) =>
      Jt(d.node.attrs, t, {
        strict: !1,
      }),
    );
  return s ? c.length > 0 : c.reduce((d, u) => d + u.to - u.from, 0) >= a;
}
const Uc =
    (r, e = {}) =>
    ({ state: t, dispatch: n }) => {
      const i = z(r, t.schema);
      return mt(t, i, e) ? Va(t, n) : !1;
    },
  Gc =
    () =>
    ({ state: r, dispatch: e }) =>
      Wa(r, e),
  Yc =
    (r) =>
    ({ state: e, dispatch: t }) => {
      const n = z(r, e.schema);
      return Xa(n)(e, t);
    },
  Xc =
    () =>
    ({ state: r, dispatch: e }) =>
      La(r, e);
function rn(r, e) {
  return e.nodes[r] ? 'node' : e.marks[r] ? 'mark' : null;
}
function li(r, e) {
  const t = typeof e === 'string' ? [e] : e;
  return Object.keys(r).reduce((n, i) => (t.includes(i) || (n[i] = r[i]), n), {});
}
const _c =
    (r, e) =>
    ({ tr: t, state: n, dispatch: i }) => {
      let s = null,
        o = null;
      const l = rn(typeof r === 'string' ? r : r.name, n.schema);
      return l
        ? (l === 'node' && (s = z(r, n.schema)),
          l === 'mark' && (o = Oe(r, n.schema)),
          i &&
            t.selection.ranges.forEach((a) => {
              n.doc.nodesBetween(a.$from.pos, a.$to.pos, (c, f) => {
                s && s === c.type && t.setNodeMarkup(f, void 0, li(c.attrs, e)),
                  o &&
                    c.marks.length &&
                    c.marks.forEach((d) => {
                      o === d.type && t.addMark(f, f + c.nodeSize, o.create(li(d.attrs, e)));
                    });
              });
            }),
          !0)
        : !1;
    },
  Zc =
    () =>
    ({ tr: r, dispatch: e }) => (e && r.scrollIntoView(), !0),
  Qc =
    () =>
    ({ tr: r, commands: e }) =>
      e.setTextSelection({
        from: 0,
        to: r.doc.content.size,
      }),
  ef =
    () =>
    ({ state: r, dispatch: e }) =>
      Ra(r, e),
  tf =
    () =>
    ({ state: r, dispatch: e }) =>
      Ba(r, e),
  nf =
    () =>
    ({ state: r, dispatch: e }) =>
      ja(r, e),
  rf =
    () =>
    ({ state: r, dispatch: e }) =>
      Ha(r, e),
  sf =
    () =>
    ({ state: r, dispatch: e }) =>
      Ka(r, e);
function $n(r, e, t = {}, n = {}) {
  return Wt(r, e, {
    slice: !1,
    parseOptions: t,
    errorOnInvalidContent: n.errorOnInvalidContent,
  });
}
const of =
  (r, e = !1, t = {}, n = {}) =>
  ({ editor: i, tr: s, dispatch: o, commands: l }) => {
    let a, c;
    const { doc: f } = s;
    if (t.preserveWhitespace !== 'full') {
      const d = $n(r, i.schema, t, {
        errorOnInvalidContent:
          (a = n.errorOnInvalidContent) !== null && a !== void 0 ? a : i.options.enableContentCheck,
      });
      return o && s.replaceWith(0, f.content.size, d).setMeta('preventUpdate', !e), !0;
    }
    return (
      o && s.setMeta('preventUpdate', !e),
      l.insertContentAt(
        {
          from: 0,
          to: f.content.size,
        },
        r,
        {
          parseOptions: t,
          errorOnInvalidContent:
            (c = n.errorOnInvalidContent) !== null && c !== void 0
              ? c
              : i.options.enableContentCheck,
        },
      )
    );
  };
function Fs(r, e) {
  const t = Oe(e, r.schema);
  const { from: n, to: i, empty: s } = r.selection;
  const o = [];
  s
    ? (r.storedMarks && o.push(...r.storedMarks), o.push(...r.selection.$head.marks()))
    : r.doc.nodesBetween(n, i, (a) => {
        o.push(...a.marks);
      });
  const l = o.find((a) => a.type.name === t.name);
  return l
    ? {
        ...l.attrs,
      }
    : {};
}
function Hf(r, e) {
  const t = new Li(r);
  return (
    e.forEach((n) => {
      n.steps.forEach((i) => {
        t.step(i);
      });
    }),
    t
  );
}
function lf(r) {
  for (let e = 0; e < r.edgeCount; e += 1) {
    const { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs()) return t;
  }
  return null;
}
function Uf(r, e) {
  const t = [];
  return (
    r.descendants((n, i) => {
      e(n) &&
        t.push({
          node: n,
          pos: i,
        });
    }),
    t
  );
}
function Gf(r, e, t) {
  const n = [];
  return (
    r.nodesBetween(e.from, e.to, (i, s) => {
      t(i) &&
        n.push({
          node: i,
          pos: s,
        });
    }),
    n
  );
}
function af(r, e) {
  for (let t = r.depth; t > 0; t -= 1) {
    const n = r.node(t);
    if (e(n))
      return {
        pos: t > 0 ? r.before(t) : 0,
        start: r.start(t),
        depth: t,
        node: n,
      };
  }
}
function ir(r) {
  return (e) => af(e.$from, r);
}
function Vs(r, e) {
  const t = Le.fromSchema(e).serializeFragment(r);
  const i = document.implementation.createHTMLDocument().createElement('div');
  return i.appendChild(t), i.innerHTML;
}
function cf(r, e) {
  const t = Ae.resolve(r);
  return As(t, e);
}
function Yf(r, e) {
  const t = cf(e);
  const n = ye.fromJSON(t, r);
  return Vs(n.content, t);
}
function ff(r, e) {
  const t = {
    from: 0,
    to: r.content.size,
  };
  return Is(r, t, e);
}
function df(r, e) {
  const t = z(e, r.schema);
  const { from: n, to: i } = r.selection;
  const s = [];
  r.doc.nodesBetween(n, i, (l) => {
    s.push(l);
  });
  const o = s.reverse().find((l) => l.type.name === t.name);
  return o
    ? {
        ...o.attrs,
      }
    : {};
}
function uf(r, e) {
  const t = rn(typeof e === 'string' ? e : e.name, r.schema);
  return t === 'node' ? df(r, e) : t === 'mark' ? Fs(r, e) : {};
}
function hf(r, e = JSON.stringify) {
  const t = {};
  return r.filter((n) => {
    const i = e(n);
    return Object.prototype.hasOwnProperty.call(t, i) ? !1 : (t[i] = !0);
  });
}
function pf(r) {
  const e = hf(r);
  return e.length === 1
    ? e
    : e.filter(
        (t, n) =>
          !e
            .filter((s, o) => o !== n)
            .some(
              (s) =>
                t.oldRange.from >= s.oldRange.from &&
                t.oldRange.to <= s.oldRange.to &&
                t.newRange.from >= s.newRange.from &&
                t.newRange.to <= s.newRange.to,
            ),
      );
}
function Xf(r) {
  const { mapping: e, steps: t } = r;
  const n = [];
  return (
    e.maps.forEach((i, s) => {
      const o = [];
      if (i.ranges.length > 0)
        i.forEach((l, a) => {
          o.push({
            from: l,
            to: a,
          });
        });
      else {
        const { from: l, to: a } = t[s];
        if (l === void 0 || a === void 0) return;
        o.push({
          from: l,
          to: a,
        });
      }
      o.forEach(({ from: l, to: a }) => {
        const c = e.slice(s).map(l, -1),
          f = e.slice(s).map(a),
          d = e.invert().map(c, -1),
          u = e.invert().map(f);
        n.push({
          oldRange: {
            from: d,
            to: u,
          },
          newRange: {
            from: c,
            to: f,
          },
        });
      });
    }),
    pf(n)
  );
}
function mf(r, e = 0) {
  const n = r.type === r.type.schema.topNodeType ? 0 : 1;
  const i = e;
  const s = i + r.nodeSize;
  const o = r.marks.map((c) => {
    const f = {
      type: c.type.name,
    };
    return (
      Object.keys(c.attrs).length &&
        (f.attrs = {
          ...c.attrs,
        }),
      f
    );
  });
  const l = {
    ...r.attrs,
  };
  const a = {
    type: r.type.name,
    from: i,
    to: s,
  };
  return (
    Object.keys(l).length && (a.attrs = l),
    o.length && (a.marks = o),
    r.content.childCount &&
      ((a.content = []),
      r.forEach((c, f) => {
        var d;
        (d = a.content) === null || d === void 0 || d.push(mf(c, e + f + n));
      })),
    r.text && (a.text = r.text),
    a
  );
}
function Ls(r, e, t) {
  const n = [];
  return (
    r === e
      ? t
          .resolve(r)
          .marks()
          .forEach((i) => {
            const s = t.resolve(r - 1),
              o = rr(s, i.type);
            o &&
              n.push({
                mark: i,
                ...o,
              });
          })
      : t.nodesBetween(r, e, (i, s) => {
          !i ||
            (i == undefined ? void 0 : i.nodeSize) === void 0 ||
            n.push(
              ...i.marks.map((o) => ({
                from: s,
                to: s + i.nodeSize,
                mark: o,
              })),
            );
        }),
    n
  );
}
function Et(r, e, t) {
  return Object.fromEntries(
    Object.entries(t).filter(([n]) => {
      const i = r.find((s) => s.type === e && s.name === n);
      return i ? i.attribute.keepOnSplit : !1;
    }),
  );
}
function Jn(r, e, t = {}) {
  const { empty: n, ranges: i } = r.selection;
  const s = e ? Oe(e, r.schema) : null;
  if (n)
    return !!(r.storedMarks || r.selection.$from.marks())
      .filter((d) => (s ? s.name === d.type.name : !0))
      .find((d) =>
        Jt(d.attrs, t, {
          strict: !1,
        }),
      );
  let o = 0;
  const l = [];
  if (
    (i.forEach(({ $from: d, $to: u }) => {
      const p = d.pos,
        h = u.pos;
      r.doc.nodesBetween(p, h, (m, g) => {
        if (!m.isText && m.marks.length === 0) return;
        const y = Math.max(p, g),
          M = Math.min(h, g + m.nodeSize),
          N = M - y;
        (o += N),
          l.push(
            ...m.marks.map((A) => ({
              mark: A,
              from: y,
              to: M,
            })),
          );
      });
    }),
    o === 0)
  )
    return !1;
  const a = l
    .filter((d) => (s ? s.name === d.mark.type.name : !0))
    .filter((d) =>
      Jt(d.mark.attrs, t, {
        strict: !1,
      }),
    )
    .reduce((d, u) => d + u.to - u.from, 0);
  const c = l
    .filter((d) => (s ? d.mark.type !== s && d.mark.type.excludes(s) : !0))
    .reduce((d, u) => d + u.to - u.from, 0);
  return (a > 0 ? a + c : a) >= o;
}
function gf(r, e, t = {}) {
  if (!e) return mt(r, null, t) || Jn(r, null, t);
  const n = rn(e, r.schema);
  return n === 'node' ? mt(r, e, t) : n === 'mark' ? Jn(r, e, t) : !1;
}
function ai(r, e) {
  const { nodeExtensions: t } = Qt(e);
  const n = t.find((o) => o.name === r);
  if (!n) return !1;
  const i = {
    name: n.name,
    options: n.options,
    storage: n.storage,
  };
  const s = C(x(n, 'group', i));
  return typeof s !== 'string' ? !1 : s.split(' ').includes('list');
}
function yf(r) {
  const e = r.type.createAndFill();
  return e ? r.eq(e) : !1;
}
function _f(r) {
  return r instanceof S;
}
function kf(r, e, t) {
  let n;
  const { selection: i } = e;
  let s = null;
  if ((Rs(i) && (s = i.$cursor), s)) {
    const l = (n = r.storedMarks) !== null && n !== void 0 ? n : s.marks();
    return !!t.isInSet(l) || !l.some((a) => a.type.excludes(t));
  }
  const { ranges: o } = i;
  return o.some(({ $from: l, $to: a }) => {
    let c = l.depth === 0 ? r.doc.inlineContent && r.doc.type.allowsMarkType(t) : !1;
    return (
      r.doc.nodesBetween(l.pos, a.pos, (f, d, u) => {
        if (c) return !1;
        if (f.isInline) {
          const p = !u || u.type.allowsMarkType(t),
            h = !!t.isInSet(f.marks) || !f.marks.some((m) => m.type.excludes(t));
          c = p && h;
        }
        return !c;
      }),
      c
    );
  });
}
const bf =
    (r, e = {}) =>
    ({ tr: t, state: n, dispatch: i }) => {
      const { selection: s } = t,
        { empty: o, ranges: l } = s,
        a = Oe(r, n.schema);
      if (i) {
        if (o) {
          const c = Fs(n, a);
          t.addStoredMark(
            a.create({
              ...c,
              ...e,
            }),
          );
        } else
          l.forEach((c) => {
            const f = c.$from.pos,
              d = c.$to.pos;
            n.doc.nodesBetween(f, d, (u, p) => {
              const h = Math.max(p, f),
                m = Math.min(p + u.nodeSize, d);
              u.marks.find((y) => y.type === a)
                ? u.marks.forEach((y) => {
                    a === y.type &&
                      t.addMark(
                        h,
                        m,
                        a.create({
                          ...y.attrs,
                          ...e,
                        }),
                      );
                  })
                : t.addMark(h, m, a.create(e));
            });
          });
      }
      return kf(n, t, a);
    },
  xf =
    (r, e) =>
    ({ tr: t }) => (t.setMeta(r, e), !0),
  Sf =
    (r, e = {}) =>
    ({ state: t, dispatch: n, chain: i }) => {
      const s = z(r, t.schema);
      return s.isTextblock
        ? i()
            .command(({ commands: o }) => (ni(s, e)(t) ? !0 : o.clearNodes()))
            .command(({ state: o }) => ni(s, e)(o, n))
            .run()
        : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'),
          !1);
    },
  Mf =
    (r) =>
    ({ tr: e, dispatch: t }) => {
      if (t) {
        const { doc: n } = e;
        const i = Ie(r, 0, n.content.size);
        const s = S.create(n, i);
        e.setSelection(s);
      }
      return !0;
    },
  Cf =
    (r) =>
    ({ tr: e, dispatch: t }) => {
      if (t) {
        const { doc: n } = e;
        const { from: i, to: s } =
          typeof r == 'number'
            ? {
                from: r,
                to: r,
              }
            : r;
        const o = w.atStart(n).from;
        const l = w.atEnd(n).to;
        const a = Ie(i, o, l);
        const c = Ie(s, o, l);
        const f = w.create(n, a, c);
        e.setSelection(f);
      }
      return !0;
    },
  wf =
    (r) =>
    ({ state: e, dispatch: t }) => {
      const n = z(r, e.schema);
      return Qa(n)(e, t);
    };
function ci(r, e) {
  const t = r.storedMarks || (r.selection.$to.parentOffset && r.selection.$from.marks());
  if (t) {
    const n = t.filter((i) => (e == undefined ? void 0 : e.includes(i.type.name)));
    r.tr.ensureMarks(n);
  }
}
const Of =
    ({ keepMarks: r = !0 } = {}) =>
    ({ tr: e, state: t, dispatch: n, editor: i }) => {
      const { selection: s, doc: o } = e,
        { $from: l, $to: a } = s,
        c = i.extensionManager.attributes,
        f = Et(c, l.node().type.name, l.node().attrs);
      if (s instanceof S && s.node.isBlock) {
        return !l.parentOffset || !Ke(o, l.pos)
          ? !1
          : (n && (r && ci(t, i.extensionManager.splittableMarks), e.split(l.pos).scrollIntoView()),
            !0);
      }
      if (!l.parent.isBlock) {
        return !1;
      }
      if (n) {
        const d = a.parentOffset === a.parent.content.size;
        s instanceof w && e.deleteSelection();
        const u = l.depth === 0 ? void 0 : lf(l.node(-1).contentMatchAt(l.indexAfter(-1)));
        let p =
          d && u
            ? [
                {
                  type: u,
                  attrs: f,
                },
              ]
            : void 0;
        let h = Ke(e.doc, e.mapping.map(l.pos), 1, p);
        if (
          (!p &&
            !h &&
            Ke(
              e.doc,
              e.mapping.map(l.pos),
              1,
              u
                ? [
                    {
                      type: u,
                    },
                  ]
                : void 0,
            ) &&
            ((h = !0),
            (p = u
              ? [
                  {
                    type: u,
                    attrs: f,
                  },
                ]
              : void 0)),
          h &&
            (e.split(e.mapping.map(l.pos), 1, p),
            u && !d && !l.parentOffset && l.parent.type !== u))
        ) {
          const m = e.mapping.map(l.before()),
            g = e.doc.resolve(m);
          l.node(-1).canReplaceWith(g.index(), g.index() + 1, u) &&
            e.setNodeMarkup(e.mapping.map(l.before()), u);
        }
        r && ci(t, i.extensionManager.splittableMarks), e.scrollIntoView();
      }
      return !0;
    },
  Nf =
    (r) =>
    ({ tr: e, state: t, dispatch: n, editor: i }) => {
      var s;
      const o = z(r, t.schema),
        { $from: l, $to: a } = t.selection,
        c = t.selection.node;
      if ((c && c.isBlock) || l.depth < 2 || !l.sameParent(a)) {
        return !1;
      }
      const f = l.node(-1);
      if (f.type !== o) {
        return !1;
      }
      const d = i.extensionManager.attributes;
      if (l.parent.content.size === 0 && l.node(-1).childCount === l.indexAfter(-1)) {
        if (l.depth === 2 || l.node(-3).type !== o || l.index(-2) !== l.node(-2).childCount - 1)
          return !1;
        if (n) {
          let g = k.empty;
          const y = l.index(-1) ? 1 : l.index(-2) ? 2 : 3;
          for (let $ = l.depth - y; $ >= l.depth - 3; $ -= 1) g = k.from(l.node($).copy(g));
          const M =
              l.indexAfter(-1) < l.node(-2).childCount
                ? 1
                : l.indexAfter(-2) < l.node(-3).childCount
                ? 2
                : 3,
            N = Et(d, l.node().type.name, l.node().attrs),
            A =
              ((s = o.contentMatch.defaultType) === null || s === void 0
                ? void 0
                : s.createAndFill(N)) || void 0;
          g = g.append(k.from(o.createAndFill(null, A) || void 0));
          const I = l.before(l.depth - (y - 1));
          e.replace(I, l.after(-M), new b(g, 4 - y, 0));
          let E = -1;
          e.doc.nodesBetween(I, e.doc.content.size, ($, te) => {
            if (E > -1) return !1;
            $.isTextblock && $.content.size === 0 && (E = te + 1);
          }),
            E > -1 && e.setSelection(w.near(e.doc.resolve(E))),
            e.scrollIntoView();
        }
        return !0;
      }
      const u = a.pos === l.end() ? f.contentMatchAt(0).defaultType : null,
        p = Et(d, f.type.name, f.attrs),
        h = Et(d, l.node().type.name, l.node().attrs);
      e.delete(l.pos, a.pos);
      const m = u
        ? [
            {
              type: o,
              attrs: p,
            },
            {
              type: u,
              attrs: h,
            },
          ]
        : [
            {
              type: o,
              attrs: p,
            },
          ];
      if (!Ke(e.doc, l.pos, 2)) {
        return !1;
      }
      if (n) {
        const { selection: g, storedMarks: y } = t;
        const { splittableMarks: M } = i.extensionManager;
        const N = y || (g.$to.parentOffset && g.$from.marks());
        if ((e.split(l.pos, 2, m).scrollIntoView(), !N || !n)) return !0;
        const A = N.filter((I) => M.includes(I.type.name));
        e.ensureMarks(A);
      }
      return !0;
    },
  xn = (r, e) => {
    const t = ir((o) => o.type === e)(r.selection);
    if (!t) {
      return !0;
    }
    const n = r.doc.resolve(Math.max(0, t.pos - 1)).before(t.depth);
    if (n === void 0) {
      return !0;
    }
    const i = r.doc.nodeAt(n);
    return (
      t.node.type === (i == undefined ? void 0 : i.type) && Me(r.doc, t.pos) && r.join(t.pos), !0
    );
  },
  Sn = (r, e) => {
    const t = ir((o) => o.type === e)(r.selection);
    if (!t) {
      return !0;
    }
    const n = r.doc.resolve(t.start).after(t.depth);
    if (n === void 0) {
      return !0;
    }
    const i = r.doc.nodeAt(n);
    return t.node.type === (i == undefined ? void 0 : i.type) && Me(r.doc, n) && r.join(n), !0;
  },
  Tf =
    (r, e, t, n = {}) =>
    ({ editor: i, tr: s, state: o, dispatch: l, chain: a, commands: c, can: f }) => {
      const { extensions: d, splittableMarks: u } = i.extensionManager,
        p = z(r, o.schema),
        h = z(e, o.schema),
        { selection: m, storedMarks: g } = o,
        { $from: y, $to: M } = m,
        N = y.blockRange(M),
        A = g || (m.$to.parentOffset && m.$from.marks());
      if (!N) {
        return !1;
      }
      const I = ir((E) => ai(E.type.name, d))(m);
      if (N.depth >= 1 && I && N.depth - I.depth <= 1) {
        if (I.node.type === p) return c.liftListItem(h);
        if (ai(I.node.type.name, d) && p.validContent(I.node.content) && l)
          return a()
            .command(() => (s.setNodeMarkup(I.pos, p), !0))
            .command(() => xn(s, p))
            .command(() => Sn(s, p))
            .run();
      }
      return !t || !A || !l
        ? a()
            .command(() => (f().wrapInList(p, n) ? !0 : c.clearNodes()))
            .wrapInList(p, n)
            .command(() => xn(s, p))
            .command(() => Sn(s, p))
            .run()
        : a()
            .command(() => {
              const E = f().wrapInList(p, n);
              const $ = A.filter((te) => u.includes(te.type.name));
              return s.ensureMarks($), E ? !0 : c.clearNodes();
            })
            .wrapInList(p, n)
            .command(() => xn(s, p))
            .command(() => Sn(s, p))
            .run();
    },
  Ef =
    (r, e = {}, t = {}) =>
    ({ state: n, commands: i }) => {
      const { extendEmptyMarkRange: s = !1 } = t,
        o = Oe(r, n.schema);
      return Jn(n, o, e)
        ? i.unsetMark(o, {
            extendEmptyMarkRange: s,
          })
        : i.setMark(o, e);
    },
  Df =
    (r, e, t = {}) =>
    ({ state: n, commands: i }) => {
      const s = z(r, n.schema),
        o = z(e, n.schema);
      return mt(n, s, t) ? i.setNode(o) : i.setNode(s, t);
    },
  Af =
    (r, e = {}) =>
    ({ state: t, commands: n }) => {
      const i = z(r, t.schema);
      return mt(t, i, e) ? n.lift(i) : n.wrapIn(i, e);
    },
  If =
    () =>
    ({ state: r, dispatch: e }) => {
      const t = r.plugins;
      for (const i of t) {
        let s;
        if (i.spec.isInputRules && (s = i.getState(r))) {
          if (e) {
            const o = r.tr,
              l = s.transform;
            for (let a = l.steps.length - 1; a >= 0; a -= 1) o.step(l.steps[a].invert(l.docs[a]));
            if (s.text) {
              const a = o.doc.resolve(s.from).marks();
              o.replaceWith(s.from, s.to, r.schema.text(s.text, a));
            } else o.delete(s.from, s.to);
          }
          return !0;
        }
      }
      return !1;
    },
  vf =
    () =>
    ({ tr: r, dispatch: e }) => {
      const { selection: t } = r,
        { empty: n, ranges: i } = t;
      return (
        n ||
          (e &&
            i.forEach((s) => {
              r.removeMark(s.$from.pos, s.$to.pos);
            })),
        !0
      );
    },
  Rf =
    (r, e = {}) =>
    ({ tr: t, state: n, dispatch: i }) => {
      var s;
      const { extendEmptyMarkRange: o = !1 } = e,
        { selection: l } = t,
        a = Oe(r, n.schema),
        { $from: c, empty: f, ranges: d } = l;
      if (!i) {
        return !0;
      }
      if (f && o) {
        let { from: u, to: p } = l;
        const h =
          (s = c.marks().find((g) => g.type === a)) === null || s === void 0 ? void 0 : s.attrs;
        const m = rr(c, a, h);
        m && ((u = m.from), (p = m.to)), t.removeMark(u, p, a);
      } else {
        d.forEach((u) => {
          t.removeMark(u.$from.pos, u.$to.pos, a);
        });
      }
      return t.removeStoredMark(a), !0;
    },
  Pf =
    (r, e = {}) =>
    ({ tr: t, state: n, dispatch: i }) => {
      let s = null,
        o = null;
      const l = rn(typeof r === 'string' ? r : r.name, n.schema);
      return l
        ? (l === 'node' && (s = z(r, n.schema)),
          l === 'mark' && (o = Oe(r, n.schema)),
          i &&
            t.selection.ranges.forEach((a) => {
              const c = a.$from.pos;
              const f = a.$to.pos;
              n.doc.nodesBetween(c, f, (d, u) => {
                s &&
                  s === d.type &&
                  t.setNodeMarkup(u, void 0, {
                    ...d.attrs,
                    ...e,
                  }),
                  o &&
                    d.marks.length &&
                    d.marks.forEach((p) => {
                      if (o === p.type) {
                        const h = Math.max(u, c),
                          m = Math.min(u + d.nodeSize, f);
                        t.addMark(
                          h,
                          m,
                          o.create({
                            ...p.attrs,
                            ...e,
                          }),
                        );
                      }
                    });
              });
            }),
          !0)
        : !1;
    },
  Bf =
    (r, e = {}) =>
    ({ state: t, dispatch: n }) => {
      const i = z(r, t.schema);
      return Ua(i, e)(t, n);
    },
  zf =
    (r, e = {}) =>
    ({ state: t, dispatch: n }) => {
      const i = z(r, t.schema);
      return Ga(i, e)(t, n);
    };
let Ff = Object.freeze({
  __proto__: null,
  blur: gc,
  clearContent: yc,
  clearNodes: kc,
  command: bc,
  createParagraphNear: xc,
  cut: Sc,
  deleteCurrentNode: Mc,
  deleteNode: Cc,
  deleteRange: wc,
  deleteSelection: Oc,
  enter: Nc,
  exitCode: Tc,
  extendMarkRange: Dc,
  first: Ac,
  focus: Ic,
  forEach: vc,
  insertContent: Rc,
  insertContentAt: zc,
  joinBackward: Lc,
  joinDown: Vc,
  joinForward: $c,
  joinItemBackward: Jc,
  joinItemForward: Wc,
  joinTextblockBackward: jc,
  joinTextblockForward: qc,
  joinUp: Fc,
  keyboardShortcut: Hc,
  lift: Uc,
  liftEmptyBlock: Gc,
  liftListItem: Yc,
  newlineInCode: Xc,
  resetAttributes: _c,
  scrollIntoView: Zc,
  selectAll: Qc,
  selectNodeBackward: ef,
  selectNodeForward: tf,
  selectParentNode: nf,
  selectTextblockEnd: rf,
  selectTextblockStart: sf,
  setContent: of,
  setMark: bf,
  setMeta: xf,
  setNode: Sf,
  setNodeSelection: Mf,
  setTextSelection: Cf,
  sinkListItem: wf,
  splitBlock: Of,
  splitListItem: Nf,
  toggleList: Tf,
  toggleMark: Ef,
  toggleNode: Df,
  toggleWrap: Af,
  undoInputRule: If,
  unsetAllMarks: vf,
  unsetMark: Rf,
  updateAttributes: Pf,
  wrapIn: Bf,
  wrapInList: zf,
});
const Vf = ce.create({
    name: 'commands',
    addCommands() {
      return {
        ...Ff,
      };
    },
  }),
  Lf = ce.create({
    name: 'editable',
    addProseMirrorPlugins() {
      return [
        new Ce({
          key: new gt('editable'),
          props: {
            editable: () => this.editor.options.editable,
          },
        }),
      ];
    },
  }),
  $f = ce.create({
    name: 'focusEvents',
    addProseMirrorPlugins() {
      const { editor: r } = this;
      return [
        new Ce({
          key: new gt('focusEvents'),
          props: {
            handleDOMEvents: {
              focus: (e, t) => {
                r.isFocused = !0;
                const n = r.state.tr
                  .setMeta('focus', {
                    event: t,
                  })
                  .setMeta('addToHistory', !1);
                return e.dispatch(n), !1;
              },
              blur: (e, t) => {
                r.isFocused = !1;
                const n = r.state.tr
                  .setMeta('blur', {
                    event: t,
                  })
                  .setMeta('addToHistory', !1);
                return e.dispatch(n), !1;
              },
            },
          },
        }),
      ];
    },
  }),
  Jf = ce.create({
    name: 'keymap',
    addKeyboardShortcuts() {
      const r = () =>
        this.editor.commands.first(({ commands: o }) => [
          () => o.undoInputRule(),
          () =>
            o.command(({ tr: l }) => {
              const { selection: a, doc: c } = l;
              const { empty: f, $anchor: d } = a;
              const { pos: u, parent: p } = d;
              const h = d.parent.isTextblock && u > 0 ? l.doc.resolve(u - 1) : d;
              const m = h.parent.type.spec.isolating;
              const g = d.pos - d.parentOffset;
              const y = m && h.parent.childCount === 1 ? g === d.pos : O.atStart(c).from === u;
              return !f ||
                !p.type.isTextblock ||
                p.textContent.length > 0 ||
                !y ||
                (y && d.parent.type.name === 'paragraph')
                ? !1
                : o.clearNodes();
            }),
          () => o.deleteSelection(),
          () => o.joinBackward(),
          () => o.selectNodeBackward(),
        ]);
      const e = () =>
        this.editor.commands.first(({ commands: o }) => [
          () => o.deleteSelection(),
          () => o.deleteCurrentNode(),
          () => o.joinForward(),
          () => o.selectNodeForward(),
        ]);
      const n = {
        Enter: () =>
          this.editor.commands.first(({ commands: o }) => [
            () => o.newlineInCode(),
            () => o.createParagraphNear(),
            () => o.liftEmptyBlock(),
            () => o.splitBlock(),
          ]),
        'Mod-Enter': () => this.editor.commands.exitCode(),
        Backspace: r,
        'Mod-Backspace': r,
        'Shift-Backspace': r,
        Delete: e,
        'Mod-Delete': e,
        'Mod-a': () => this.editor.commands.selectAll(),
      };
      const i = {
        ...n,
      };
      const s = {
        ...n,
        'Ctrl-h': r,
        'Alt-Backspace': r,
        'Ctrl-d': e,
        'Ctrl-Alt-Backspace': e,
        'Alt-Delete': e,
        'Alt-d': e,
        'Ctrl-a': () => this.editor.commands.selectTextblockStart(),
        'Ctrl-e': () => this.editor.commands.selectTextblockEnd(),
      };
      return nn() || zs() ? s : i;
    },
    addProseMirrorPlugins() {
      return [
        new Ce({
          key: new gt('clearDocument'),
          appendTransaction: (r, e, t) => {
            if (!(r.some((h) => h.docChanged) && !e.doc.eq(t.doc))) return;
            const { empty: i, from: s, to: o } = e.selection,
              l = O.atStart(e.doc).from,
              a = O.atEnd(e.doc).to;
            if (
              i ||
              !(s === l && o === a) ||
              t.doc.textBetween(0, t.doc.content.size, ' ', ' ').length > 0
            )
              return;
            const d = t.tr,
              u = _t({
                state: t,
                transaction: d,
              }),
              { commands: p } = new Zt({
                editor: this.editor,
                state: u,
              });
            if ((p.clearNodes(), !!d.steps.length)) return d;
          },
        }),
      ];
    },
  }),
  Wf = ce.create({
    name: 'tabindex',
    addProseMirrorPlugins() {
      return [
        new Ce({
          key: new gt('tabindex'),
          props: {
            attributes: () =>
              this.editor.isEditable
                ? {
                    tabindex: '0',
                  }
                : {},
          },
        }),
      ];
    },
  });
class Te {
  get name() {
    return this.node.type.name;
  }

  constructor(e, t, n = !1, i = null) {
    (this.currentNode = null),
      (this.actualDepth = null),
      (this.isBlock = n),
      (this.resolvedPos = e),
      (this.editor = t),
      (this.currentNode = i);
  }

  get node() {
    return this.currentNode || this.resolvedPos.node();
  }

  get element() {
    return this.editor.view.domAtPos(this.pos).node;
  }

  get depth() {
    var e;
    return (e = this.actualDepth) !== null && e !== void 0 ? e : this.resolvedPos.depth;
  }

  get pos() {
    return this.resolvedPos.pos;
  }

  get content() {
    return this.node.content;
  }

  set content(e) {
    let t = this.from,
      n = this.to;
    if (this.isBlock) {
      if (this.content.size === 0) {
        console.error(
          `You can’t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`,
        );
        return;
      }
      (t = this.from + 1), (n = this.to - 1);
    }
    this.editor.commands.insertContentAt(
      {
        from: t,
        to: n,
      },
      e,
    );
  }

  get attributes() {
    return this.node.attrs;
  }

  get textContent() {
    return this.node.textContent;
  }

  get size() {
    return this.node.nodeSize;
  }

  get from() {
    return this.isBlock ? this.pos : this.resolvedPos.start(this.resolvedPos.depth);
  }

  get range() {
    return {
      from: this.from,
      to: this.to,
    };
  }

  get to() {
    return this.isBlock
      ? this.pos + this.size
      : this.resolvedPos.end(this.resolvedPos.depth) + (this.node.isText ? 0 : 1);
  }

  get parent() {
    if (this.depth === 0) return null;
    const e = this.resolvedPos.start(this.resolvedPos.depth - 1),
      t = this.resolvedPos.doc.resolve(e);
    return new Te(t, this.editor);
  }

  get before() {
    let e = this.resolvedPos.doc.resolve(this.from - (this.isBlock ? 1 : 2));
    return (
      e.depth !== this.depth && (e = this.resolvedPos.doc.resolve(this.from - 3)),
      new Te(e, this.editor)
    );
  }

  get after() {
    let e = this.resolvedPos.doc.resolve(this.to + (this.isBlock ? 2 : 1));
    return (
      e.depth !== this.depth && (e = this.resolvedPos.doc.resolve(this.to + 3)),
      new Te(e, this.editor)
    );
  }

  get children() {
    const e = [];
    return (
      this.node.content.forEach((t, n) => {
        const i = t.isBlock && !t.isTextblock,
          s = this.pos + n + 1,
          o = this.resolvedPos.doc.resolve(s);
        if (!i && o.depth <= this.depth) return;
        const l = new Te(o, this.editor, i, i ? t : null);
        i && (l.actualDepth = this.depth + 1), e.push(new Te(o, this.editor, i, i ? t : null));
      }),
      e
    );
  }

  get firstChild() {
    return this.children[0] || null;
  }

  get lastChild() {
    const e = this.children;
    return e.at(-1) || null;
  }

  closest(e, t = {}) {
    let n = null,
      i = this.parent;
    for (; i && !n; ) {
      if (i.node.type.name === e)
        if (Object.keys(t).length > 0) {
          const s = i.node.attrs,
            o = Object.keys(t);
          for (const a of o) {
            if (s[a] !== t[a]) break;
          }
        } else n = i;
      i = i.parent;
    }
    return n;
  }

  querySelector(e, t = {}) {
    return this.querySelectorAll(e, t, !0)[0] || null;
  }

  querySelectorAll(e, t = {}, n = !1) {
    let i = [];
    if (!this.children || this.children.length === 0) return i;
    const s = Object.keys(t);
    return (
      this.children.forEach((o) => {
        (n && i.length > 0) ||
          (o.node.type.name === e && s.every((a) => t[a] === o.node.attrs[a]) && i.push(o),
          !(n && i.length > 0) && (i = i.concat(o.querySelectorAll(e, t, n))));
      }),
      i
    );
  }

  setAttribute(e) {
    const t = this.editor.state.selection;
    this.editor
      .chain()
      .setTextSelection(this.from)
      .updateAttributes(this.node.type.name, e)
      .setTextSelection(t.from)
      .run();
  }
}
const jf = `.ProseMirror {
position: relative;
}

.ProseMirror {
word-wrap: break-word;
white-space: pre-wrap;
white-space: break-spaces;
-webkit-font-variant-ligatures: none;
font-variant-ligatures: none;
font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror [contenteditable="false"] {
white-space: normal;
}

.ProseMirror [contenteditable="false"] [contenteditable="true"] {
white-space: pre-wrap;
}

.ProseMirror pre {
white-space: pre-wrap;
}

img.ProseMirror-separator {
display: inline !important;
border: none !important;
margin: 0 !important;
width: 1px !important;
height: 1px !important;
}

.ProseMirror-gapcursor {
display: none;
pointer-events: none;
position: absolute;
margin: 0;
}

.ProseMirror-gapcursor:after {
content: "";
display: block;
position: absolute;
top: -2px;
width: 20px;
border-top: 1px solid black;
animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes ProseMirror-cursor-blink {
to {
  visibility: hidden;
}
}

.ProseMirror-hideselection *::selection {
background: transparent;
}

.ProseMirror-hideselection *::-moz-selection {
background: transparent;
}

.ProseMirror-hideselection * {
caret-color: transparent;
}

.ProseMirror-focused .ProseMirror-gapcursor {
display: block;
}

.tippy-box[data-animation=fade][data-state=hidden] {
opacity: 0
}`;
function qf(r, e, t) {
  const n = document.querySelector(`style[data-tiptap-style${t ? `-${t}` : ''}]`);
  if (n !== null) return n;
  const i = document.createElement('style');
  return (
    e && i.setAttribute('nonce', e),
    i.setAttribute(`data-tiptap-style${t ? `-${t}` : ''}`, ''),
    (i.innerHTML = r),
    document.querySelectorAll('head')[0].appendChild(i),
    i
  );
}
const Zf = class extends ec {
  constructor(e = {}) {
    super(),
      (this.isFocused = !1),
      (this.extensionStorage = {}),
      (this.options = {
        element: document.createElement('div'),
        content: '',
        injectCSS: !0,
        injectNonce: void 0,
        extensions: [],
        autofocus: !1,
        editable: !0,
        editorProps: {},
        parseOptions: {},
        coreExtensionOptions: {},
        enableInputRules: !0,
        enablePasteRules: !0,
        enableCoreExtensions: !0,
        enableContentCheck: !1,
        onBeforeCreate: () => null,
        onCreate: () => null,
        onUpdate: () => null,
        onSelectionUpdate: () => null,
        onTransaction: () => null,
        onFocus: () => null,
        onBlur: () => null,
        onDestroy: () => null,
        onContentError: ({ error: t }) => {
          throw t;
        },
      }),
      (this.isCapturingTransaction = !1),
      (this.capturedTransaction = null),
      this.setOptions(e),
      this.createExtensionManager(),
      this.createCommandManager(),
      this.createSchema(),
      this.on('beforeCreate', this.options.onBeforeCreate),
      this.emit('beforeCreate', {
        editor: this,
      }),
      this.on('contentError', this.options.onContentError),
      this.createView(),
      this.injectCSS(),
      this.on('create', this.options.onCreate),
      this.on('update', this.options.onUpdate),
      this.on('selectionUpdate', this.options.onSelectionUpdate),
      this.on('transaction', this.options.onTransaction),
      this.on('focus', this.options.onFocus),
      this.on('blur', this.options.onBlur),
      this.on('destroy', this.options.onDestroy),
      window.setTimeout(() => {
        this.isDestroyed ||
          (this.commands.focus(this.options.autofocus),
          this.emit('create', {
            editor: this,
          }));
      }, 0);
  }
  get storage() {
    return this.extensionStorage;
  }
  get commands() {
    return this.commandManager.commands;
  }
  chain() {
    return this.commandManager.chain();
  }
  can() {
    return this.commandManager.can();
  }
  injectCSS() {
    this.options.injectCSS && document && (this.css = qf(jf, this.options.injectNonce));
  }
  setOptions(e = {}) {
    (this.options = {
      ...this.options,
      ...e,
    }),
      !(!this.view || !this.state || this.isDestroyed) &&
        (this.options.editorProps && this.view.setProps(this.options.editorProps),
        this.view.updateState(this.state));
  }
  setEditable(e, t = !0) {
    this.setOptions({
      editable: e,
    }),
      t &&
        this.emit('update', {
          editor: this,
          transaction: this.state.tr,
        });
  }
  get isEditable() {
    return this.options.editable && this.view && this.view.editable;
  }
  get state() {
    return this.view.state;
  }
  registerPlugin(e, t) {
    const n = Ds(t) ? t(e, [...this.state.plugins]) : [...this.state.plugins, e],
      i = this.state.reconfigure({
        plugins: n,
      });
    this.view.updateState(i);
  }
  unregisterPlugin(e) {
    if (this.isDestroyed) return;
    const t = typeof e == 'string' ? `${e}$` : e.key,
      n = this.state.reconfigure({
        plugins: this.state.plugins.filter((i) => !i.key.startsWith(t)),
      });
    this.view.updateState(n);
  }
  createExtensionManager() {
    var e, t;
    const i = [
      ...(this.options.enableCoreExtensions
        ? [
            Lf,
            mc.configure({
              blockSeparator:
                (t =
                  (e = this.options.coreExtensionOptions) === null || e === void 0
                    ? void 0
                    : e.clipboardTextSerializer) === null || t === void 0
                  ? void 0
                  : t.blockSeparator,
            }),
            Vf,
            $f,
            Jf,
            Wf,
          ]
        : []),
      ...this.options.extensions,
    ].filter((s) => ['extension', 'node', 'mark'].includes(s == null ? void 0 : s.type));
    this.extensionManager = new Ae(i, this);
  }
  createCommandManager() {
    this.commandManager = new Zt({
      editor: this,
    });
  }
  createSchema() {
    this.schema = this.extensionManager.schema;
  }
  createView() {
    let e;
    try {
      e = $n(this.options.content, this.schema, this.options.parseOptions, {
        errorOnInvalidContent: this.options.enableContentCheck,
      });
    } catch (s) {
      if (
        !(s instanceof Error) ||
        !['[tiptap error]: Invalid JSON content', '[tiptap error]: Invalid HTML content'].includes(
          s.message,
        )
      )
        throw s;
      this.emit('contentError', {
        editor: this,
        error: s,
        disableCollaboration: () => {
          (this.options.extensions = this.options.extensions.filter(
            (o) => o.name !== 'collaboration',
          )),
            this.createExtensionManager();
        },
      }),
        (e = $n(this.options.content, this.schema, this.options.parseOptions, {
          errorOnInvalidContent: !1,
        }));
    }
    const t = Ps(e, this.options.autofocus);
    this.view = new ka(this.options.element, {
      ...this.options.editorProps,
      dispatchTransaction: this.dispatchTransaction.bind(this),
      state: qe.create({
        doc: e,
        selection: t || void 0,
      }),
    });
    const n = this.state.reconfigure({
      plugins: this.extensionManager.plugins,
    });
    this.view.updateState(n), this.createNodeViews(), this.prependClass();
    const i = this.view.dom;
    i.editor = this;
  }
  createNodeViews() {
    this.view.setProps({
      nodeViews: this.extensionManager.nodeViews,
    });
  }
  prependClass() {
    this.view.dom.className = `tiptap ${this.view.dom.className}`;
  }
  captureTransaction(e) {
    (this.isCapturingTransaction = !0), e(), (this.isCapturingTransaction = !1);
    const t = this.capturedTransaction;
    return (this.capturedTransaction = null), t;
  }
  dispatchTransaction(e) {
    if (this.view.isDestroyed) return;
    if (this.isCapturingTransaction) {
      if (!this.capturedTransaction) {
        this.capturedTransaction = e;
        return;
      }
      e.steps.forEach((o) => {
        var l;
        return (l = this.capturedTransaction) === null || l === void 0 ? void 0 : l.step(o);
      });
      return;
    }
    const t = this.state.apply(e),
      n = !this.state.selection.eq(t.selection);
    this.view.updateState(t),
      this.emit('transaction', {
        editor: this,
        transaction: e,
      }),
      n &&
        this.emit('selectionUpdate', {
          editor: this,
          transaction: e,
        });
    const i = e.getMeta('focus'),
      s = e.getMeta('blur');
    i &&
      this.emit('focus', {
        editor: this,
        event: i.event,
        transaction: e,
      }),
      s &&
        this.emit('blur', {
          editor: this,
          event: s.event,
          transaction: e,
        }),
      !(!e.docChanged || e.getMeta('preventUpdate')) &&
        this.emit('update', {
          editor: this,
          transaction: e,
        });
  }
  getAttributes(e) {
    return uf(this.state, e);
  }
  isActive(e, t) {
    const n = typeof e == 'string' ? e : null,
      i = typeof e == 'string' ? t : e;
    return gf(this.state, n, i);
  }
  getJSON() {
    return this.state.doc.toJSON();
  }
  getHTML() {
    return Vs(this.state.doc.content, this.schema);
  }
  getText(e) {
    const {
      blockSeparator: t = `

`,
      textSerializers: n = {},
    } = e || {};
    return ff(this.state.doc, {
      blockSeparator: t,
      textSerializers: {
        ...vs(this.schema),
        ...n,
      },
    });
  }
  get isEmpty() {
    return yf(this.state.doc);
  }
  getCharacterCount() {
    return (
      console.warn(
        '[tiptap warn]: "editor.getCharacterCount()" is deprecated. Please use "editor.storage.characterCount.characters()" instead.',
      ),
      this.state.doc.content.size - 2
    );
  }
  destroy() {
    this.emit('destroy'), this.view && this.view.destroy(), this.removeAllListeners();
  }
  get isDestroyed() {
    var e;
    return !(!((e = this.view) === null || e === void 0) && e.docView);
  }
  $node(e, t) {
    var n;
    return ((n = this.$doc) === null || n === void 0 ? void 0 : n.querySelector(e, t)) || null;
  }
  $nodes(e, t) {
    var n;
    return ((n = this.$doc) === null || n === void 0 ? void 0 : n.querySelectorAll(e, t)) || null;
  }
  $pos(e) {
    const t = this.state.doc.resolve(e);
    return new Te(t, this);
  }
  get $doc() {
    return this.$pos(0);
  }
};
function ed(r) {
  return new en({
    find: r.find,
    handler: ({ state: e, range: t, match: n }) => {
      const i = C(r.getAttributes, void 0, n);
      if (i === !1 || i === null) return null;
      const { tr: s } = e,
        o = n.at(-1),
        l = n[0];
      if (o) {
        const a = l.search(/\S/),
          c = t.from + l.indexOf(o),
          f = c + o.length;
        if (
          Ls(t.from, t.to, e.doc)
            .filter((p) => p.mark.type.excluded.find((m) => m === r.type && m !== p.mark.type))
            .filter((p) => p.to > c).length > 0
        )
          return null;
        f < t.to && s.delete(f, t.to), c > t.from && s.delete(t.from + a, c);
        const u = t.from + a + o.length;
        s.addMark(t.from + a, u, r.type.create(i || {})), s.removeStoredMark(r.type);
      }
    },
  });
}
function td(r) {
  return new en({
    find: r.find,
    handler: ({ state: e, range: t, match: n }) => {
      const i = C(r.getAttributes, void 0, n) || {},
        { tr: s } = e,
        o = t.from;
      let l = t.to;
      const a = r.type.create(i);
      if (n[1]) {
        const c = n[0].lastIndexOf(n[1]);
        let f = o + c;
        f > l ? (f = l) : (l = f + n[1].length);
        const d = n[0].at(-1);
        s.insertText(d, o + n[0].length - 1), s.replaceWith(f, l, a);
      } else if (n[0]) {
        const c = r.type.isInline ? o : o - 1;
        s.insert(c, r.type.create(i)).delete(s.mapping.map(o), s.mapping.map(l));
      }
      s.scrollIntoView();
    },
  });
}
function nd(r) {
  return new en({
    find: r.find,
    handler: ({ state: e, range: t, match: n }) => {
      const i = e.doc.resolve(t.from),
        s = C(r.getAttributes, void 0, n) || {};
      if (!i.node(-1).canReplaceWith(i.index(-1), i.indexAfter(-1), r.type)) return null;
      e.tr.delete(t.from, t.to).setBlockType(t.from, t.from, r.type, s);
    },
  });
}
function rd(r) {
  return new en({
    find: r.find,
    handler: ({ state: e, range: t, match: n, chain: i }) => {
      const s = C(r.getAttributes, void 0, n) || {},
        o = e.tr.delete(t.from, t.to),
        a = o.doc.resolve(t.from).blockRange(),
        c = a && qn(a, r.type, s);
      if (!c) return null;
      if ((o.wrap(a, c), r.keepMarks && r.editor)) {
        const { selection: d, storedMarks: u } = e,
          { splittableMarks: p } = r.editor.extensionManager,
          h = u || (d.$to.parentOffset && d.$from.marks());
        if (h) {
          const m = h.filter((g) => p.includes(g.type.name));
          o.ensureMarks(m);
        }
      }
      if (r.keepAttributes) {
        const d =
          r.type.name === 'bulletList' || r.type.name === 'orderedList' ? 'listItem' : 'taskList';
        i().updateAttributes(d, s).run();
      }
      const f = o.doc.resolve(t.from - 1).nodeBefore;
      f &&
        f.type === r.type &&
        Me(o.doc, t.from - 1) &&
        (!r.joinPredicate || r.joinPredicate(n, f)) &&
        o.join(t.from - 1);
    },
  });
}
class jt {
  constructor(e = {}) {
    (this.type = 'mark'),
      (this.name = 'mark'),
      (this.parent = null),
      (this.child = null),
      (this.config = {
        name: this.name,
        defaultOptions: {},
      }),
      (this.config = {
        ...this.config,
        ...e,
      }),
      (this.name = this.config.name),
      e.defaultOptions &&
        Object.keys(e.defaultOptions).length > 0 &&
        console.warn(
          `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`,
        ),
      (this.options = this.config.defaultOptions),
      this.config.addOptions &&
        (this.options = C(
          x(this, 'addOptions', {
            name: this.name,
          }),
        )),
      (this.storage =
        C(
          x(this, 'addStorage', {
            name: this.name,
            options: this.options,
          }),
        ) || {});
  }

  static create(e = {}) {
    return new jt(e);
  }

  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => tn(this.options, e),
    });
    return (t.name = this.name), (t.parent = this.parent), t;
  }

  extend(e = {}) {
    const t = new jt(e);
    return (
      (t.parent = this),
      (this.child = t),
      (t.name = e.name ? e.name : t.parent.name),
      e.defaultOptions &&
        Object.keys(e.defaultOptions).length > 0 &&
        console.warn(
          `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`,
        ),
      (t.options = C(
        x(t, 'addOptions', {
          name: t.name,
        }),
      )),
      (t.storage = C(
        x(t, 'addStorage', {
          name: t.name,
          options: t.options,
        }),
      )),
      t
    );
  }

  static handleExit({ editor: e, mark: t }) {
    const { tr: n } = e.state,
      i = e.state.selection.$from;
    if (i.pos === i.end()) {
      const o = i.marks();
      if (!o.find((c) => (c == null ? void 0 : c.type.name) === t.name)) return !1;
      const a = o.find((c) => (c == undefined ? void 0 : c.type.name) === t.name);
      return a && n.removeStoredMark(a), n.insertText(' ', i.pos), e.view.dispatch(n), !0;
    }
    return !1;
  }
}
class Wn {
  constructor(e = {}) {
    (this.type = 'node'),
      (this.name = 'node'),
      (this.parent = null),
      (this.child = null),
      (this.config = {
        name: this.name,
        defaultOptions: {},
      }),
      (this.config = {
        ...this.config,
        ...e,
      }),
      (this.name = this.config.name),
      e.defaultOptions &&
        Object.keys(e.defaultOptions).length > 0 &&
        console.warn(
          `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`,
        ),
      (this.options = this.config.defaultOptions),
      this.config.addOptions &&
        (this.options = C(
          x(this, 'addOptions', {
            name: this.name,
          }),
        )),
      (this.storage =
        C(
          x(this, 'addStorage', {
            name: this.name,
            options: this.options,
          }),
        ) || {});
  }

  static create(e = {}) {
    return new Wn(e);
  }

  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => tn(this.options, e),
    });
    return (t.name = this.name), (t.parent = this.parent), t;
  }

  extend(e = {}) {
    const t = new Wn(e);
    return (
      (t.parent = this),
      (this.child = t),
      (t.name = e.name ? e.name : t.parent.name),
      e.defaultOptions &&
        Object.keys(e.defaultOptions).length > 0 &&
        console.warn(
          `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`,
        ),
      (t.options = C(
        x(t, 'addOptions', {
          name: t.name,
        }),
      )),
      (t.storage = C(
        x(t, 'addStorage', {
          name: t.name,
          options: t.options,
        }),
      )),
      t
    );
  }
}
function Kf() {
  return navigator.platform === 'Android' || /android/i.test(navigator.userAgent);
}
class id {
  constructor(e, t, n) {
    (this.isDragging = !1),
      (this.component = e),
      (this.editor = t.editor),
      (this.options = {
        stopEvent: null,
        ignoreMutation: null,
        ...n,
      }),
      (this.extension = t.extension),
      (this.node = t.node),
      (this.decorations = t.decorations),
      (this.getPos = t.getPos),
      this.mount();
  }

  mount() {}
  get dom() {
    return this.editor.view.dom;
  }

  get contentDOM() {
    return null;
  }

  onDragStart(e) {
    var t, n, i, s, o, l, a;
    const { view: c } = this.editor,
      f = e.target,
      d =
        f.nodeType === 3
          ? (t = f.parentElement) === null || t === void 0
            ? void 0
            : t.closest('[data-drag-handle]')
          : f.closest('[data-drag-handle]');
    if (!this.dom || (!((n = this.contentDOM) === null || n === void 0) && n.contains(f)) || !d)
      return;
    let u = 0,
      p = 0;
    if (this.dom !== d) {
      const g = this.dom.getBoundingClientRect(),
        y = d.getBoundingClientRect(),
        M =
          (i = e.offsetX) !== null && i !== void 0
            ? i
            : (s = e.nativeEvent) === null || s === void 0
            ? void 0
            : s.offsetX,
        N =
          (o = e.offsetY) !== null && o !== void 0
            ? o
            : (l = e.nativeEvent) === null || l === void 0
            ? void 0
            : l.offsetY;
      (u = y.x - g.x + M), (p = y.y - g.y + N);
    }
    (a = e.dataTransfer) === null || a === void 0 || a.setDragImage(this.dom, u, p);
    const h = S.create(c.state.doc, this.getPos()),
      m = c.state.tr.setSelection(h);
    c.dispatch(m);
  }

  stopEvent(e) {
    var t;
    if (!this.dom) return !1;
    if (typeof this.options.stopEvent === 'function')
      return this.options.stopEvent({
        event: e,
      });
    const n = e.target;
    if (
      !(
        this.dom.contains(n) &&
        !(!((t = this.contentDOM) === null || t === void 0) && t.contains(n))
      )
    )
      return !1;
    const s = e.type.startsWith('drag'),
      o = e.type === 'drop';
    if (
      (['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(n.tagName) || n.isContentEditable) &&
      !o &&
      !s
    )
      return !0;
    const { isEditable: a } = this.editor,
      { isDragging: c } = this,
      f = !!this.node.type.spec.draggable,
      d = S.isSelectable(this.node),
      u = e.type === 'copy',
      p = e.type === 'paste',
      h = e.type === 'cut',
      m = e.type === 'mousedown';
    if ((!f && d && s && e.preventDefault(), f && s && !c)) return e.preventDefault(), !1;
    if (f && a && !c && m) {
      const g = n.closest('[data-drag-handle]');
      g &&
        (this.dom === g || this.dom.contains(g)) &&
        ((this.isDragging = !0),
        document.addEventListener(
          'dragend',
          () => {
            this.isDragging = !1;
          },
          {
            once: !0,
          },
        ),
        document.addEventListener(
          'drop',
          () => {
            this.isDragging = !1;
          },
          {
            once: !0,
          },
        ),
        document.addEventListener(
          'mouseup',
          () => {
            this.isDragging = !1;
          },
          {
            once: !0,
          },
        ));
    }
    return !(c || o || u || p || h || (m && d));
  }

  ignoreMutation(e) {
    return !this.dom || !this.contentDOM
      ? !0
      : typeof this.options.ignoreMutation == 'function'
      ? this.options.ignoreMutation({
          mutation: e,
        })
      : this.node.isLeaf || this.node.isAtom
      ? !0
      : e.type === 'selection' ||
        (this.dom.contains(e.target) &&
          e.type === 'childList' &&
          (nn() || Kf()) &&
          this.editor.isFocused &&
          [...Array.from(e.addedNodes), ...Array.from(e.removedNodes)].every(
            (n) => n.isContentEditable,
          ))
      ? !1
      : this.contentDOM === e.target && e.type === 'attributes'
      ? !0
      : !this.contentDOM.contains(e.target);
  }

  updateAttributes(e) {
    this.editor.commands.command(({ tr: t }) => {
      const n = this.getPos();
      return (
        t.setNodeMarkup(n, void 0, {
          ...this.node.attrs,
          ...e,
        }),
        !0
      );
    });
  }

  deleteNode() {
    const e = this.getPos(),
      t = e + this.node.nodeSize;
    this.editor.commands.deleteRange({
      from: e,
      to: t,
    });
  }
}
function sd(r) {
  return new ac({
    find: r.find,
    handler: ({ state: e, range: t, match: n, pasteEvent: i }) => {
      const s = C(r.getAttributes, void 0, n, i);
      if (s === !1 || s === null) return null;
      const { tr: o } = e,
        l = n.at(-1),
        a = n[0];
      let c = t.to;
      if (l) {
        const f = a.search(/\S/),
          d = t.from + a.indexOf(l),
          u = d + l.length;
        if (
          Ls(t.from, t.to, e.doc)
            .filter((h) => h.mark.type.excluded.find((g) => g === r.type && g !== h.mark.type))
            .filter((h) => h.to > d).length > 0
        )
          return null;
        u < t.to && o.delete(u, t.to),
          d > t.from && o.delete(t.from + f, d),
          (c = t.from + f + l.length),
          o.addMark(t.from + f, c, r.type.create(s || {})),
          o.removeStoredMark(r.type);
      }
    },
  });
}
function od(r) {
  return r.replaceAll(/[$()*+./?[\\\]^{|}-]/g, '\\$&');
}
export {
  en as $,
  Ie as A,
  B,
  qf as C,
  R as D,
  Zf as E,
  k as F,
  yf as G,
  Wt as H,
  Vs as I,
  Li as J,
  af as K,
  cf as L,
  jt as M,
  id as N,
  Qe as O,
  Ce as P,
  Q,
  P as R,
  b as S,
  w as T,
  Uf as U,
  Hf as V,
  Xf as W,
  ir as X,
  lf as Y,
  gf as Z,
  od as _,
  Z as a,
  ac as a0,
  Ls as a1,
  uf as a2,
  ce as b,
  gt as c,
  ye as d,
  Wn as e,
  ed as f,
  mf as g,
  sd as h,
  Fs as i,
  Ao as j,
  O as k,
  Ea as l,
  tc as m,
  S as n,
  C as o,
  x as p,
  ot as q,
  _f as r,
  td as s,
  nd as t,
  Fo as u,
  vt as v,
  rd as w,
  Gf as x,
  Yf as y,
  Le as z,
};
