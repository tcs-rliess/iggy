/*
 * IGGY 0.0.18 ( 2015-07-22 )
 * http://mpneuried.github.io/iggy/
 *
 * Released under the MIT license
 * https://github.com/mpneuried/iggy/blob/master/LICENSE
*/
!function(a) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = a(); else if ("function" == typeof define && define.amd) define([], a); else {
        var b;
        b = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, 
        b.IGGY = a();
    }
}(function() {
    var a;
    return function b(a, c, d) {
        function e(g, h) {
            if (!c[g]) {
                if (!a[g]) {
                    var i = "function" == typeof require && require;
                    if (!h && i) return i(g, !0);
                    if (f) return f(g, !0);
                    var j = new Error("Cannot find module '" + g + "'");
                    throw j.code = "MODULE_NOT_FOUND", j;
                }
                var k = c[g] = {
                    exports: {}
                };
                a[g][0].call(k.exports, function(b) {
                    var c = a[g][1][b];
                    return e(c ? c : b);
                }, k, k.exports, b, a, c, d);
            }
            return c[g].exports;
        }
        for (var f = "function" == typeof require && require, g = 0; g < d.length; g++) e(d[g]);
        return e;
    }({
        1: [ function(a, b, c) {
            var d, e, f, g, h, i, j, k, l, m, n, o = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, p = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) q.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, q = {}.hasOwnProperty;
            m = a("./views/main"), d = a("./models/facets"), k = a("./models/facet_string"), 
            e = a("./models/facet_array"), j = a("./models/facet_select"), h = a("./models/facet_number"), 
            i = a("./models/facet_range"), f = a("./models/facet_daterange"), g = a("./models/facet_event"), 
            n = a("./models/results"), l = function(a) {
                function b(a, b, c) {
                    null == b && (b = []), null == c && (c = {}), this._initErrors = o(this._initErrors, this), 
                    this.triggerChange = o(this.triggerChange, this), this.getQuery = o(this.getQuery, this), 
                    this._error = o(this._error, this), this.addFacet = o(this.addFacet, this), this._prepareFacets = o(this._prepareFacets, this), 
                    this._prepareEl = o(this._prepareEl, this), _.extend(this, Backbone.Events), this._initErrors(), 
                    this.$el = this._prepareEl(a), this.el = this.$el[0], this.$el.data("iggy", this), 
                    this.facets = this._prepareFacets(b), this.results = new n(null, c), this.results.on("add", this.triggerChange), 
                    this.results.on("remove", this.triggerChange), this.results.on("change", this.triggerChange), 
                    this.view = new m({
                        el: this.$el,
                        collection: this.facets,
                        results: this.results
                    });
                }
                return p(b, a), b.prototype.$ = jQuery, b.prototype._prepareEl = function(a) {
                    var b;
                    if (null == a) throw this._error("EMISSINGEL");
                    if (_.isString(a)) {
                        if (!a.length) throw this._error("EEMPTYELSTRING");
                        if (b = this.$(a), !(null != b ? b.length : void 0)) throw this._error("EINVALIDELSTRING");
                        return b;
                    }
                    if (a instanceof jQuery) {
                        if (!a.length) throw this._error("EEMPTYELJQUERY");
                        if (a.length > 1) throw this._error("ESIZEELJQUERY");
                        return a;
                    }
                    if (a instanceof Element) return this.$(a);
                    throw this._error("EINVALIDELTYPE");
                }, b.prototype._prepareFacets = function(a) {
                    var b, c, e, f, g;
                    for (c = [], f = 0, g = a.length; g > f; f++) e = a[f], null != (b = this._createFacet(e)) && c.push(b);
                    return new d(c);
                }, b.prototype._createFacet = function(a) {
                    switch (a.type.toLowerCase()) {
                      case "string":
                        return new k(a, {
                            main: this
                        });

                      case "select":
                        return new j(a, {
                            main: this
                        });

                      case "array":
                        return new e(a, {
                            main: this
                        });

                      case "number":
                        return new h(a, {
                            main: this
                        });

                      case "range":
                        return new i(a, {
                            main: this
                        });

                      case "daterange":
                        return new f(a, {
                            main: this
                        });

                      case "event":
                        return new g(a, {
                            main: this
                        });
                    }
                }, b.prototype.addFacet = function(a) {
                    var b;
                    if (null != this.facets) return null != (b = this._createFacet(a)) && this.facets.add(b), 
                    this;
                }, b.prototype._error = function(a, b) {
                    var c, d;
                    return null == b && (b = {}), d = null != this.errors[a] ? this.errors[a](b) : "-", 
                    c = new Error(), c.name = a, c.message = d, c;
                }, b.prototype.getQuery = function() {
                    return this.results;
                }, b.prototype.triggerChange = function() {
                    this.trigger("change", this.results);
                }, b.prototype._initErrors = function() {
                    var a, b, c;
                    this.errors = {}, c = this.ERRORS();
                    for (a in c) b = c[a], this.errors[a] = _.template(b);
                }, b.prototype.ERRORS = function() {
                    return {
                        EINVALIDELSTRING: "If you define a `el` as String it has to be a valid selector for an existing DOM element.",
                        EEMPTYELSTRING: "The `el` as string can not be empty.",
                        EEMPTYELJQUERY: "The `el` as jOuery object can not be an empty collection.",
                        ESIZEELJQUERY: "The `el` as jOuery object can not be a result of one el.",
                        EINVALIDELTYPE: "The `el` can only be a selector string, dom element or jQuery collection",
                        EMISSINGEL: "Please define a target `el`"
                    };
                }, b;
            }(Backbone.Events), b.exports = l;
        }, {
            "./models/facet_array": 3,
            "./models/facet_daterange": 5,
            "./models/facet_event": 6,
            "./models/facet_number": 7,
            "./models/facet_range": 8,
            "./models/facet_select": 9,
            "./models/facet_string": 10,
            "./models/facets": 11,
            "./models/results": 12,
            "./views/main": 33
        } ],
        2: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty, h = [].indexOf || function(a) {
                for (var b = 0, c = this.length; c > b; b++) if (b in this && this[b] === a) return b;
                return -1;
            };
            d = function(a) {
                function b() {
                    return this.updateSubFilter = e(this.updateSubFilter, this), this.sub = e(this.sub, this), 
                    b.__super__.constructor.apply(this, arguments);
                }
                return f(b, a), b.prototype.sub = function(a) {
                    var b, c, d;
                    return this.subColls || (this.subColls = []), d = this._generateSubFilter(a), b = this.filter(d), 
                    c = new this.constructor(b), c._parentCol = this, c._fnFilter = d, this.on("change", _.bind(function(a) {
                        var b, c;
                        c = this._fnFilter(a), b = null != this.get(a), b && !c ? this.remove(a) : !b && c && this.add(a);
                    }, c)), c.on("add", _.bind(function(a) {
                        this.add(a);
                    }, this)), this.on("add", _.bind(function(a) {
                        this._fnFilter(a) && this.add(a);
                    }, c)), c.on("remove", _.bind(function(a) {}, this)), this.on("remove", _.bind(function(a) {
                        this.remove(a);
                    }, c)), this.on("reset", _.bind(function(a) {
                        this.updateSubFilter();
                    }, c)), this.subColls.push(c), c;
                }, b.prototype.updateSubFilter = function(a, b) {
                    var c, d, e, f, g, i, j, k, l, m, n, o;
                    if (null == b && (b = !0), null != this._parentCol) {
                        if (null != a && (this._fnFilter = this._generateSubFilter(a)), d = this._parentCol.filter(this._fnFilter), 
                        b) return this.reset(d), this;
                        for (l = _.pluck(d, "cid"), e = _.pluck(this.models, "cid"), m = _.difference(e, l), 
                        f = 0, i = m.length; i > f; f++) o = m[f], this.remove(o);
                        for (c = _.difference(l, e), g = 0, j = d.length; j > g; g++) k = d[g], n = k.cid, 
                        h.call(c, n) >= 0 && this.add(k);
                    }
                    return this;
                }, b.prototype._generateSubFilter = function(a) {
                    var b;
                    return b = _.isFunction(a) ? a : _.isArray(a) ? function(b) {
                        var c;
                        return c = b.id, h.call(a, c) >= 0;
                    } : _.isString(a) || _.isNumber(a) ? function(b) {
                        return b.id === a;
                    } : function(b) {
                        var c, d;
                        for (c in a) if (d = a[c], b.get(c) !== d) return !1;
                        return !0;
                    };
                }, b;
            }(Backbone.Collection), b.exports = d;
        }, {} ],
        3: [ function(a, b, c) {
            var d, e = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) f.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, f = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return c.__super__.constructor.apply(this, arguments);
                }
                return e(c, b), c.prototype.SubView = a("../views/facets/subarray"), c;
            }(a("./facet_string")), b.exports = d;
        }, {
            "../views/facets/subarray": 28,
            "./facet_string": 10
        } ],
        4: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c(a, b) {
                    this.match = e(this.match, this), this.getLabel = e(this.getLabel, this), this.main = b.main, 
                    c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.idAttribute = "name", c.prototype.SubView = a("../views/facets/base"), 
                c.prototype.defaults = function() {
                    return {
                        type: "string",
                        name: "name",
                        label: "Description"
                    };
                }, c.prototype.getLabel = function() {
                    return this.get("label");
                }, c.prototype.match = function(a) {
                    var b, c;
                    return b = this.get("name") + " " + this.get("label"), c = b.toLowerCase().indexOf(a.toLowerCase()), 
                    c >= 0;
                }, c.prototype.comparator = function(a) {
                    return a.id;
                }, c;
            }(Backbone.Model), b.exports = d;
        }, {
            "../views/facets/base": 25
        } ],
        5: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.defaults = e(this.defaults, this), c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.SubView = a("../views/facets/daterange"), c.prototype.defaults = function() {
                    return $.extend(c.__super__.defaults.apply(this, arguments), {
                        opts: {},
                        value: null
                    });
                }, c;
            }(a("./facet_base")), b.exports = d;
        }, {
            "../views/facets/daterange": 26,
            "./facet_base": 4
        } ],
        6: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(a) {
                function b() {
                    return this.exec = e(this.exec, this), this.defaults = e(this.defaults, this), b.__super__.constructor.apply(this, arguments);
                }
                return f(b, a), b.prototype.SubView = null, b.prototype.onlyExec = !0, b.prototype.defaults = function() {
                    return $.extend(b.__super__.defaults.apply(this, arguments), {
                        options: []
                    });
                }, b.prototype.exec = function() {
                    this.main.trigger(this.get("event"), this.toJSON());
                }, b;
            }(a("./facet_base")), b.exports = d;
        }, {
            "./facet_base": 4
        } ],
        7: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.defaults = e(this.defaults, this), c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.SubView = a("../views/facets/subnumber"), c.prototype.defaults = function() {
                    return $.extend(c.__super__.defaults.apply(this, arguments), {
                        min: null,
                        max: null,
                        step: 1,
                        value: null
                    });
                }, c;
            }(a("./facet_base")), b.exports = d;
        }, {
            "../views/facets/subnumber": 29,
            "./facet_base": 4
        } ],
        8: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.defaults = e(this.defaults, this), c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.SubView = a("../views/facets/subrange"), c.prototype.defaults = function() {
                    return $.extend(c.__super__.defaults.apply(this, arguments), {
                        min: null,
                        max: null,
                        step: 1,
                        value: null
                    });
                }, c;
            }(a("./facet_base")), b.exports = d;
        }, {
            "../views/facets/subrange": 30,
            "./facet_base": 4
        } ],
        9: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.defaults = e(this.defaults, this), c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.SubView = a("../views/facets/subselect"), c.prototype.defaults = function() {
                    return $.extend(c.__super__.defaults.apply(this, arguments), {
                        options: []
                    });
                }, c;
            }(a("./facet_base")), b.exports = d;
        }, {
            "../views/facets/subselect": 31,
            "./facet_base": 4
        } ],
        10: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.defaults = e(this.defaults, this), c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.SubView = a("../views/facets/substring"), c.prototype.defaults = function() {
                    return $.extend(c.__super__.defaults.apply(this, arguments), {
                        options: []
                    });
                }, c;
            }(a("./facet_base")), b.exports = d;
        }, {
            "../views/facets/substring": 32,
            "./facet_base": 4
        } ],
        11: [ function(a, b, c) {
            var d, e = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) f.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, f = {}.hasOwnProperty;
            d = function(a) {
                function b() {
                    return b.__super__.constructor.apply(this, arguments);
                }
                return e(b, a), b.prototype.modelId = function(a) {
                    return a.name;
                }, b;
            }(a("./backbone_sub")), b.exports = d;
        }, {
            "./backbone_sub": 2
        } ],
        12: [ function(a, b, c) {
            var d, e, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty, h = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            };
            d = function(a) {
                function b() {
                    return b.__super__.constructor.apply(this, arguments);
                }
                return f(b, a), b.prototype.idAttribute = "name", b.prototype.defaults = {
                    type: "string",
                    name: null,
                    value: null
                }, b;
            }(Backbone.Model), e = function(a) {
                function b() {
                    return this.parse = h(this.parse, this), this.initialize = h(this.initialize, this), 
                    b.__super__.constructor.apply(this, arguments);
                }
                return f(b, a), b.prototype.model = d, b.prototype.initialize = function(a, b) {
                    var c;
                    (null != (c = b.modifyKey) ? c.length : void 0) && (this.modifyKey = b.modifyKey);
                }, b.prototype.parse = function(a, b) {
                    var c, d, e;
                    return c = b._facet.get("modifyKey") || this.modifyKey || "value", d = null != (e = b._facet) ? e.get("modify") : void 0, 
                    null != d && _.isFunction(d) && (a[c] = d(a.value, b._facet, a)), a;
                }, b;
            }(Backbone.Collection), b.exports = e;
        }, {} ],
        13: [ function(a, b, c) {
            var d, e, f = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, g = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) h.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, h = {}.hasOwnProperty;
            d = function(a) {
                function b() {
                    return this.getLabel = f(this.getLabel, this), b.__super__.constructor.apply(this, arguments);
                }
                return g(b, a), b.prototype.idAttribute = "value", b.prototype.getLabel = function() {
                    return this.get("label") || this.get(this.idAttribute) || "-";
                }, b;
            }(Backbone.Model), e = function(a) {
                function b() {
                    return b.__super__.constructor.apply(this, arguments);
                }
                return g(b, a), b.prototype.model = d, b;
            }(a("./backbone_sub")), b.exports = e;
        }, {
            "./backbone_sub": 2
        } ],
        14: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b = [], c = a || {};
                return function(a) {
                    b.push("<input" + d.attr("id", a, !0, !1) + ' class="daterange-inp"/>');
                }.call(this, "cid" in c ? c.cid : "undefined" != typeof cid ? cid : void 0), b.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        15: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b, c = [], e = a || {};
                return function(a, e, f, g, h) {
                    f && f.length && (c.push('<div class="operator"><select' + d.attr("id", "" + a + "op", !0, !1) + ">"), 
                    function() {
                        var a = f;
                        if ("number" == typeof a.length) for (var g = 0, h = a.length; h > g; g++) {
                            var i = a[g];
                            c.push("<option" + d.attr("value", i, !0, !1) + d.attr("selected", e == i, !0, !1) + ">" + d.escape(null == (b = i) ? "" : b) + "</option>");
                        } else {
                            var h = 0;
                            for (var g in a) {
                                h++;
                                var i = a[g];
                                c.push("<option" + d.attr("value", i, !0, !1) + d.attr("selected", e == i, !0, !1) + ">" + d.escape(null == (b = i) ? "" : b) + "</option>");
                            }
                        }
                    }.call(this), c.push("</select></div>")), c.push("<input" + d.attr("id", a, !0, !1) + d.attr("value", h, !0, !1) + ' class="number-inp"/>');
                }.call(this, "cid" in e ? e.cid : "undefined" != typeof cid ? cid : void 0, "operator" in e ? e.operator : "undefined" != typeof operator ? operator : void 0, "operators" in e ? e.operators : "undefined" != typeof operators ? operators : void 0, "undefined" in e ? e.undefined : void 0, "value" in e ? e.value : "undefined" != typeof value ? value : void 0), 
                c.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        16: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b = [], c = a || {};
                return function(a, c) {
                    b.push('<div class="rangeinp">');
                    var e = c ? c : [];
                    b.push("<input" + d.attr("id", "" + a + "_from", !0, !1) + d.attr("value", e[0], !0, !1) + ' class="number-inp range-from"/><span class="separator">-</span><input' + d.attr("id", "" + a + "_to", !0, !1) + d.attr("value", e[0], !0, !1) + ' class="number-inp range-to"/></div>');
                }.call(this, "cid" in c ? c.cid : "undefined" != typeof cid ? cid : void 0, "value" in c ? c.value : "undefined" != typeof value ? value : void 0), 
                b.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        17: [ function(a, b, c) {
            a("jade/runtime");
            b.exports = function(a) {
                var b = [];
                return b.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        18: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b, c = [], e = a || {};
                return function(a, e, f, g, h, i) {
                    c.push("<select" + d.attr("id", a, !0, !1) + ' multiple="multiple" class="select-inp">'), 
                    f ? function() {
                        var a = f;
                        if ("number" == typeof a.length) for (var e = 0, g = a.length; g > e; e++) {
                            var h = a[e];
                            c.push("<optgroup" + d.attr("label", e, !0, !1) + "></optgroup>"), function() {
                                var a = h;
                                if ("number" == typeof a.length) for (var e = 0, f = a.length; f > e; e++) {
                                    var g = a[e];
                                    c.push("<option" + d.attr("value", g.value, !0, !1) + d.attr("selected", i && i.indexOf(g.value) >= 0, !0, !1) + ">" + d.escape(null == (b = g.label) ? "" : b) + "</option>");
                                } else {
                                    var f = 0;
                                    for (var e in a) {
                                        f++;
                                        var g = a[e];
                                        c.push("<option" + d.attr("value", g.value, !0, !1) + d.attr("selected", i && i.indexOf(g.value) >= 0, !0, !1) + ">" + d.escape(null == (b = g.label) ? "" : b) + "</option>");
                                    }
                                }
                            }.call(this);
                        } else {
                            var g = 0;
                            for (var e in a) {
                                g++;
                                var h = a[e];
                                c.push("<optgroup" + d.attr("label", e, !0, !1) + "></optgroup>"), function() {
                                    var a = h;
                                    if ("number" == typeof a.length) for (var e = 0, f = a.length; f > e; e++) {
                                        var g = a[e];
                                        c.push("<option" + d.attr("value", g.value, !0, !1) + d.attr("selected", i && i.indexOf(g.value) >= 0, !0, !1) + ">" + d.escape(null == (b = g.label) ? "" : b) + "</option>");
                                    } else {
                                        var f = 0;
                                        for (var e in a) {
                                            f++;
                                            var g = a[e];
                                            c.push("<option" + d.attr("value", g.value, !0, !1) + d.attr("selected", i && i.indexOf(g.value) >= 0, !0, !1) + ">" + d.escape(null == (b = g.label) ? "" : b) + "</option>");
                                        }
                                    }
                                }.call(this);
                            }
                        }
                    }.call(this) : function() {
                        var a = g;
                        if ("number" == typeof a.length) for (var e = 0, f = a.length; f > e; e++) {
                            var h = a[e];
                            c.push("<option" + d.attr("value", h.value, !0, !1) + d.attr("selected", i && i.indexOf(h.value) >= 0, !0, !1) + ">" + d.escape(null == (b = h.label) ? "" : b) + "</option>");
                        } else {
                            var f = 0;
                            for (var e in a) {
                                f++;
                                var h = a[e];
                                c.push("<option" + d.attr("value", h.value, !0, !1) + d.attr("selected", i && i.indexOf(h.value) >= 0, !0, !1) + ">" + d.escape(null == (b = h.label) ? "" : b) + "</option>");
                            }
                        }
                    }.call(this), c.push("</select>"), e && c.push('<span class="btn btn-xs btn-success select-check fa fa-check"></span>');
                }.call(this, "cid" in e ? e.cid : "undefined" != typeof cid ? cid : void 0, "multiple" in e ? e.multiple : "undefined" != typeof multiple ? multiple : void 0, "optionGroups" in e ? e.optionGroups : "undefined" != typeof optionGroups ? optionGroups : void 0, "options" in e ? e.options : "undefined" != typeof options ? options : void 0, "undefined" in e ? e.undefined : void 0, "value" in e ? e.value : "undefined" != typeof value ? value : void 0), 
                c.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        19: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b = [], c = a || {};
                return function(a) {
                    b.push("<input" + d.attr("id", a, !0, !1) + ' class="selector-inp"/><ul' + d.attr("id", "" + a + "typelist", !0, !1) + ' class="typelist"></ul>');
                }.call(this, "cid" in c ? c.cid : "undefined" != typeof cid ? cid : void 0), b.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        20: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b, c = [], e = a || {};
                return function(a, e, f, g, h) {
                    var i = 0;
                    e && g && (i = 1, c.push('<li><a data-id="_custom" data-idx="-1"' + d.cls([ {
                        active: 0 === a
                    } ], [ !0 ]) + '><i>"' + (null == (b = g) ? "" : b) + '"</i></a></li>')), f.length ? function() {
                        var e = f;
                        if ("number" == typeof e.length) for (var g = 0, h = e.length; h > g; g++) {
                            var j = e[g];
                            c.push("<li" + d.cls([ j.cssclass ], [ !0 ]) + "><a" + d.attr("data-id", j.id, !0, !1) + d.attr("data-idx", g, !0, !1) + d.cls([ {
                                active: g + i === a
                            } ], [ !0 ]) + ">" + (null == (b = j.label) ? "" : b) + "</a></li>");
                        } else {
                            var h = 0;
                            for (var g in e) {
                                h++;
                                var j = e[g];
                                c.push("<li" + d.cls([ j.cssclass ], [ !0 ]) + "><a" + d.attr("data-id", j.id, !0, !1) + d.attr("data-idx", g, !0, !1) + d.cls([ {
                                    active: g + i === a
                                } ], [ !0 ]) + ">" + (null == (b = j.label) ? "" : b) + "</a></li>");
                            }
                        }
                    }.call(this) : e || c.push('<li><a class="emptyres">no result for "' + d.escape(null == (b = g) ? "" : b) + '"</a></li>');
                }.call(this, "activeIdx" in e ? e.activeIdx : "undefined" != typeof activeIdx ? activeIdx : void 0, "custom" in e ? e.custom : "undefined" != typeof custom ? custom : void 0, "list" in e ? e.list : "undefined" != typeof list ? list : void 0, "query" in e ? e.query : "undefined" != typeof query ? query : void 0, "undefined" in e ? e.undefined : void 0), 
                c.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        21: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b = [], c = a || {};
                return function(a, c) {
                    b.push("<input" + d.attr("id", a, !0, !1) + d.attr("value", c, !0, !1) + ' class="string-inp"/>');
                }.call(this, "cid" in c ? c.cid : "undefined" != typeof cid ? cid : void 0, "value" in c ? c.value : "undefined" != typeof value ? value : void 0), 
                b.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        22: [ function(a, b, c) {
            var d = a("jade/runtime");
            b.exports = function(a) {
                var b, c = [], e = a || {};
                return function(a, e, f) {
                    c.push('<div class="rm-facet-btn fa fa-remove"></div><span class="sublabel">' + d.escape(null == (b = a) ? "" : b) + ':</span><ul class="subresults">'), 
                    e && e.length && function() {
                        var a = e;
                        if ("number" == typeof a.length) for (var f = 0, g = a.length; g > f; f++) {
                            var h = a[f];
                            c.push("<li>" + d.escape(null == (b = h) ? "" : b) + "</li>");
                        } else {
                            var g = 0;
                            for (var f in a) {
                                g++;
                                var h = a[f];
                                c.push("<li>" + d.escape(null == (b = h) ? "" : b) + "</li>");
                            }
                        }
                    }.call(this), c.push('</ul><div class="subselect"></div>');
                }.call(this, "label" in e ? e.label : "undefined" != typeof label ? label : void 0, "selected" in e ? e.selected : "undefined" != typeof selected ? selected : void 0, "undefined" in e ? e.undefined : void 0), 
                c.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        23: [ function(a, b, c) {
            a("jade/runtime");
            b.exports = function(a) {
                var b = [];
                return b.push('<div class="add-facet-btn fa fa-plus"></div>'), b.join("");
            };
        }, {
            "jade/runtime": 37
        } ],
        24: [ function(a, b, c) {
            b.exports = {
                LEFT: 37,
                RIGHT: 39,
                UP: 38,
                DOWN: 40,
                ESC: [ 229, 27 ],
                ENTER: 13,
                TAB: 9
            };
        }, {} ],
        25: [ function(a, b, c) {
            var d, e, f, g = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, h = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) i.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, i = {}.hasOwnProperty, j = [].indexOf || function(a) {
                for (var b = 0, c = this.length; c > b; b++) if (b in this && this[b] === a) return b;
                return -1;
            };
            e = a("../../utils/keycodes"), f = a("../../models/subresults"), d = function(b) {
                function c() {
                    return this.set = g(this.set, this), this.select = g(this.select, this), this._checkSelectEmpty = g(this._checkSelectEmpty, this), 
                    this.getValue = g(this.getValue, this), this.getResults = g(this.getResults, this), 
                    this.close = g(this.close, this), this._onTabAction = g(this._onTabAction, this), 
                    this.render = g(this.render, this), this._getInpSelector = g(this._getInpSelector, this), 
                    this.getTemplateData = g(this.getTemplateData, this), this._onKey = g(this._onKey, this), 
                    this.input = g(this.input, this), this.open = g(this.open, this), this.renderResult = g(this.renderResult, this), 
                    this.focus = g(this.focus, this), this.events = g(this.events, this), this.initialize = g(this.initialize, this), 
                    c.__super__.constructor.apply(this, arguments);
                }
                return h(c, b), c.prototype.resultTemplate = a("../../tmpls/result_base.jade"), 
                c.prototype.initialize = function() {
                    this.result = new f();
                }, c.prototype.events = function() {
                    var a;
                    return a = {}, a["keyup " + this._getInpSelector()] = "input", a["keydown " + this._getInpSelector()] = "input", 
                    a;
                }, c.prototype.focus = function() {
                    this.$inp.focus();
                }, c.prototype.renderResult = function() {
                    var a, b, c, d, e, f;
                    for (a = [], f = this.result.models, c = b = 0, d = f.length; d > b; c = ++b) e = f[c], 
                    a.push(e.getLabel());
                    return "<li>" + a.join("</li><li>") + "</li>";
                }, c.prototype.open = function() {
                    this.$el.addClass("open"), this.isOpen = !0, this.trigger("opened");
                }, c.prototype.input = function(a) {
                    if ("keydown" === a.type) switch (a.keyCode) {
                      case e.ENTER:
                        this.select();
                    }
                }, c.prototype._onKey = function(a) {
                    var b;
                    return a.keyCode === e.TAB || (b = a.keyCode, j.call(e.TAB, b) >= 0) ? void this._onTabAction(a) : void 0;
                }, c.prototype.getTemplateData = function() {
                    var a;
                    return {
                        cid: this.cid,
                        value: null != (a = this.model) ? a.get("value") : void 0
                    };
                }, c.prototype._getInpSelector = function() {
                    return "input#" + this.cid;
                }, c.prototype.render = function() {
                    var a;
                    a = this.template(this.getTemplateData()), this.$el.html(a), this.$inp = this.$el.find(this._getInpSelector()), 
                    this._hasTabListener(!0) && $(document).on(this._hasTabEvent(), this._onKey);
                }, c.prototype._hasTabEvent = function() {
                    return "keydown";
                }, c.prototype._hasTabListener = function() {
                    return !0;
                }, c.prototype._onTabAction = function(a) {
                    a.preventDefault(), a.stopPropagation(), this.select();
                }, c.prototype.close = function(a) {
                    this._hasTabListener(!1) && $(document).off(this._hasTabEvent(), this._onKey), this.$el.removeClass("open"), 
                    this.$el.addClass("closed"), this.isOpen = !1, this.trigger("closed", this.result);
                }, c.prototype.getResults = function() {
                    return {
                        value: this.getValue()
                    };
                }, c.prototype.getValue = function() {
                    return this.$inp.val();
                }, c.prototype.getSelectModel = function() {
                    return f.prototype.model;
                }, c.prototype._checkSelectEmpty = function(a) {
                    return !_.isEmpty(a) || _.isNumber(a) || _.isBoolean(a) ? !1 : (this.close(), !0);
                }, c.prototype.select = function() {
                    var a;
                    a = this.getValue(), this._checkSelectEmpty(a) || this.set(a);
                }, c.prototype.set = function(a) {
                    var b, c;
                    b = this.getSelectModel(), c = new b({
                        value: a
                    }), this.result.add(c), this.trigger("selected", c), this.close();
                }, c;
            }(Backbone.View), b.exports = d;
        }, {
            "../../models/subresults": 13,
            "../../tmpls/result_base.jade": 17,
            "../../utils/keycodes": 24
        } ],
        26: [ function(a, b, c) {
            var d, e, f = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, g = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) h.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, h = {}.hasOwnProperty;
            e = a("../../utils/keycodes"), d = function(b) {
                function c() {
                    return this.select = f(this.select, this), this.getValue = f(this.getValue, this), 
                    this.getTemplateData = f(this.getTemplateData, this), this._dateReturn = f(this._dateReturn, this), 
                    this.renderResult = f(this.renderResult, this), this.remove = f(this.remove, this), 
                    this.focus = f(this.focus, this), this.events = f(this.events, this), this.render = f(this.render, this), 
                    c.__super__.constructor.apply(this, arguments);
                }
                return g(c, b), c.prototype.template = a("../../tmpls/daterange.jade"), c.prototype.render = function() {
                    c.__super__.render.apply(this, arguments);
                }, c.prototype.forcedDateRangeOpts = {
                    opens: "right"
                }, c.prototype.events = function() {}, c.prototype.focus = function() {
                    var a, b;
                    return null == this.daterangepicker ? (a = _.extend({}, this.model.get("opts"), this.forcedDateRangeOpts), 
                    this.$inp.daterangepicker(a, this._dateReturn), this.daterangepicker = this.$inp.data("daterangepicker"), 
                    this.$inp.on("cancel.daterangepicker", this.close), this.$inp.on("hide.daterangepicker", this.close), 
                    null != (b = this.daterangepicker.container) && b.addClass("daterange-iggy")) : this.daterangepicker.show(), 
                    c.__super__.focus.apply(this, arguments);
                }, c.prototype.remove = function() {
                    var a;
                    return null != (a = this.daterangepicker) && a.remove(), c.__super__.remove.apply(this, arguments);
                }, c.prototype.renderResult = function() {
                    var a, b, c, d, e;
                    return b = this.getResults(), d = moment(b.value[0]), null != b.value[1] && (a = moment(b.value[1])), 
                    e = this.model.get("opts").timePicker, c = "<li>", c += d.format(e ? "LLLL" : "LL"), 
                    null != a && (c += " - ", c += a.format(e ? "LLLL" : "LL")), c += "</li>";
                }, c.prototype._hasTabListener = function() {
                    return !1;
                }, c.prototype._dateReturn = function(a, b) {
                    this.startDate = a, this.endDate = b, this.select();
                }, c.prototype.getTemplateData = function() {
                    return c.__super__.getTemplateData.apply(this, arguments);
                }, c.prototype.getValue = function() {
                    var a, b;
                    return b = this.model.get("value"), null != b ? (_.isArray(b) || (b = [ b ]), this.startDate = b[0], 
                    this.endDate = b[1], b) : (a = [ this.startDate.valueOf() ], null != this.endDate && a.push(this.endDate.valueOf()), 
                    a);
                }, c.prototype.select = function() {
                    var a, b;
                    a = this.getSelectModel(), b = new a({
                        value: this.getValue()
                    }), this.result.add(b), this.trigger("selected", b), this.close();
                }, c;
            }(a("./base")), b.exports = d;
        }, {
            "../../tmpls/daterange.jade": 14,
            "../../utils/keycodes": 24,
            "./base": 25
        } ],
        27: [ function(a, b, c) {
            var d, e, f, g, h = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, i = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) j.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, j = {}.hasOwnProperty;
            e = a("../../utils/keycodes"), f = function(a, b) {
                return a /= b, a = Math.round(a) * b;
            }, g = function(a, b) {
                return b = Math.pow(10, b), a *= b, a = Math.round(a), a /= b;
            }, d = function(a) {
                function b() {
                    this._setNumber = h(this._setNumber, this), this.getValue = h(this.getValue, this), 
                    this.crement = h(this.crement, this), this.input = h(this.input, this), this.events = h(this.events, this), 
                    this.setNumber = _.throttle(this._setNumber, 300, {
                        leading: !1,
                        trailing: !1
                    }), b.__super__.constructor.apply(this, arguments);
                }
                return i(b, a), b.prototype.events = function() {
                    var a, b;
                    return b = {}, b["keyup " + this._getInpSelector()] = "input", b["keydown " + this._getInpSelector()] = "input", 
                    a = b, a;
                }, b.prototype.input = function(a) {
                    var b, c;
                    if (b = $(a.currentTarget), "keydown" === a.type) switch (a.keyCode) {
                      case e.UP:
                        return void this.crement(this.model.get("step"), b);

                      case e.DOWN:
                        return void this.crement(-1 * this.model.get("step"), b);

                      case e.ENTER:
                        return void this.select();
                    }
                    "keyup" === a.type && (c = a.currentTarget.value.replace(/[^\d]?[^-\d]+/g, ""), 
                    c = parseInt(c, 10), this.setNumber(c, b));
                }, b.prototype.crement = function(a, b) {
                    var c;
                    null == b && (b = this.$inp), c = b.val(), c = (null != c ? c.length : void 0) ? parseInt(c, 10) : this.model.get("value"), 
                    this._setNumber(c + a, b);
                }, b.prototype.getValue = function() {
                    var a;
                    return a = this.$inp.val(), (null != a ? a.length : void 0) ? parseInt(this.valueByDefinition(a), 10) : null;
                }, b.prototype._setNumber = function(a, b) {
                    var c;
                    null == b && (b = this.$inp), isNaN(a) || (c = b.val(), a = this.valueByDefinition(a), 
                    c !== a.toString() && b.val(a));
                }, b.prototype.valueByDefinition = function(a) {
                    var b, c, d, e, h;
                    return d = this.model.get("max"), e = this.model.get("min"), h = this.model.get("step"), 
                    e > d && (c = e, e = d, d = c), null != e && e > a ? e : null != d && a > d ? d : (1 !== h && (a = f(a, h)), 
                    b = Math.max(0, Math.ceil(Math.log(1 / h) / Math.log(10))), a = b > 0 ? g(a, b) : Math.round(a));
                }, b;
            }(a("./base")), b.exports = d;
        }, {
            "../../utils/keycodes": 24,
            "./base": 25
        } ],
        28: [ function(a, b, c) {
            var d, e, f, g, h, i, j, k = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, l = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) m.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, m = {}.hasOwnProperty;
            j = a("../../models/subresults"), g = a("../../utils/keycodes"), h = function(a) {
                function b() {
                    return this.match = k(this.match, this), b.__super__.constructor.apply(this, arguments);
                }
                return l(b, a), b.prototype.match = function(a) {
                    var b, c;
                    return b = this.get("value") + " " + this.get("label"), c = b.toLowerCase().indexOf(a.toLowerCase()), 
                    c >= 0;
                }, b;
            }(j.prototype.model), i = function(a) {
                function b() {
                    return b.__super__.constructor.apply(this, arguments);
                }
                return l(b, a), b.prototype.model = h, b;
            }(j), d = function(a) {
                function b() {
                    return this.match = k(this.match, this), this.getLabel = k(this.getLabel, this), 
                    b.__super__.constructor.apply(this, arguments);
                }
                return l(b, a), b.prototype.idAttribute = "value", b.prototype.getLabel = function() {
                    return this.get("label") || this.get("name") || "-";
                }, b.prototype.match = function(a) {
                    var b, c;
                    return b = this.get("value") + " " + this.get("label"), c = b.toLowerCase().indexOf(a.toLowerCase()), 
                    c >= 0;
                }, b;
            }(Backbone.Model), e = function(a) {
                function b() {
                    return b.__super__.constructor.apply(this, arguments);
                }
                return l(b, a), b.prototype.model = d, b;
            }(a("../../models/backbone_sub")), f = function(a) {
                function b(a) {
                    this._createOptionCollection = k(this._createOptionCollection, this), this._onTabAction = k(this._onTabAction, this), 
                    this.getResults = k(this.getResults, this), this.select = k(this.select, this), 
                    a.custom = !0, this.collection = this._createOptionCollection(a.model.get("options")), 
                    b.__super__.constructor.call(this, a);
                }
                return l(b, a), b.prototype.optDefault = {
                    label: "-",
                    value: "-"
                }, b.prototype.multiSelect = !0, b.prototype.optColl = i, b.prototype.select = function() {
                    var a, b, c, d, e;
                    for (c = this.model.get("value"), null == c || _.isArray(c) || (c = [ c ]), d = 0, 
                    e = c.length; e > d; d++) b = c[d], a = this.collection.get(b), null == a && (a = new this.collection.model({
                        value: b,
                        custom: !0
                    })), this.selected(a);
                    this.close();
                }, b.prototype.getResults = function() {
                    return {
                        value: this.result.pluck("value")
                    };
                }, b.prototype._onTabAction = function(a) {
                    var b;
                    return a.preventDefault(), a.stopPropagation(), b = this.$inp.val(), (null != b ? b.length : void 0) ? void this.selectActive() : void this.close();
                }, b.prototype._createOptionCollection = function(a) {
                    var b, c, d, e;
                    if (_.isFunction(a)) return a(this._createOptionCollection);
                    for (b = [], c = 0, d = a.length; d > c; c++) e = a[c], _.isString(e) || _.isNumber(e) ? b.push({
                        value: e,
                        label: e
                    }) : _.isObject(e) && b.push(_.extend({}, this.optDefault, e));
                    return new this.optColl(b);
                }, b;
            }(a("../selector")), b.exports = f;
        }, {
            "../../models/backbone_sub": 2,
            "../../models/subresults": 13,
            "../../utils/keycodes": 24,
            "../selector": 34
        } ],
        29: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.getResults = e(this.getResults, this), this._onTabAction = e(this._onTabAction, this), 
                    this.getTemplateData = e(this.getTemplateData, this), this.focus = e(this.focus, this), 
                    this._opSelected = e(this._opSelected, this), this.close = e(this.close, this), 
                    this.renderResult = e(this.renderResult, this), this.render = e(this.render, this), 
                    this.events = e(this.events, this), c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.template = a("../../tmpls/number.jade"), c.prototype.events = function() {
                    var a, b;
                    return a = c.__super__.events.apply(this, arguments), (null != (b = this.model.get("operators")) ? b.length : void 0) || (a["blur " + this._getInpSelector()] = "select"), 
                    a;
                }, c.prototype.render = function() {
                    var a;
                    c.__super__.render.apply(this, arguments), (null != (a = this.model.get("operators")) ? a.length : void 0) && (this.$inpOp = this.$el.find("select#" + this.cid + "op"), 
                    this.$inpOp.select2({
                        width: "auto"
                    }), this.$inpOp.on("select2:close", this._opSelected));
                }, c.prototype.renderResult = function() {
                    var a, b;
                    return a = this.getResults(), b = "<li>", null != a.operator && (b += a.operator + " "), 
                    b += a.value, b += "</li>";
                }, c.prototype.close = function(a) {
                    null != this.$inpOp && (this.$inpOp.select2("destroy"), this.$inpOp.remove(), this.$inpOp = null), 
                    c.__super__.close.apply(this, arguments);
                }, c.prototype._opSelected = function() {
                    this.selectedOP = !0, this.focus();
                }, c.prototype.focus = function(a) {
                    return null == a && (a = !1), null == this.$inpOp || this.selectedOP ? void c.__super__.focus.apply(this, arguments) : void this.$inpOp.select2("open");
                }, c.prototype.getTemplateData = function() {
                    return _.extend(c.__super__.getTemplateData.apply(this, arguments), {
                        operators: this.model.get("operators"),
                        operator: this.model.get("operator")
                    });
                }, c.prototype._onTabAction = function(a) {
                    var b;
                    b = this.getValue(), a.preventDefault(), a.stopPropagation(), isNaN(b) || this.select();
                }, c.prototype.getResults = function() {
                    var a;
                    return a = null != this.$inpOp ? {
                        value: this.getValue(),
                        operator: this.$inpOp.val()
                    } : {
                        value: this.getValue()
                    };
                }, c;
            }(a("./number_base")), b.exports = d;
        }, {
            "../../tmpls/number.jade": 15,
            "./number_base": 27
        } ],
        30: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this._onTabAction = e(this._onTabAction, this), this.getValue = e(this.getValue, this), 
                    this.getResults = e(this.getResults, this), this.close = e(this.close, this), this.focus = e(this.focus, this), 
                    this.render = e(this.render, this), this.renderResult = e(this.renderResult, this), 
                    this.events = e(this.events, this), this._getInpSelector = e(this._getInpSelector, this), 
                    c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.template = a("../../tmpls/range.jade"), c.prototype._getInpSelector = function(a) {
                    return null == a && (a = "_from"), "input#" + this.cid + a;
                }, c.prototype.events = function() {
                    var a;
                    return a = {}, a["keyup " + this._getInpSelector()] = "input", a["keydown " + this._getInpSelector()] = "input", 
                    a["keyup " + this._getInpSelector("_to")] = "input", a["keydown " + this._getInpSelector("_to")] = "input", 
                    a;
                }, c.prototype.renderResult = function() {
                    var a;
                    return a = this.getResults(), "<li>" + a.value.join(" - ") + "</li>";
                }, c.prototype.render = function() {
                    c.__super__.render.apply(this, arguments), this.$inpTo = this.$el.find(this._getInpSelector("_to"));
                }, c.prototype.focus = function(a) {
                    null == a && (a = !1), c.__super__.focus.apply(this, arguments);
                }, c.prototype.close = function() {
                    this.$(".rangeinp").remove(), c.__super__.close.apply(this, arguments);
                }, c.prototype.getResults = function() {
                    var a;
                    return a = {
                        value: this.getValue()
                    };
                }, c.prototype.getValue = function() {
                    var a, b, d;
                    return b = c.__super__.getValue.apply(this, arguments), a = this.$inpTo.val(), (null != a ? a.length : void 0) ? (d = parseInt(this.valueByDefinition(a), 10), 
                    [ b, d ]) : null;
                }, c.prototype._onTabAction = function(a) {
                    var b;
                    b = this.getValue(), (null != b ? b.length : void 0) >= 2 && (a.preventDefault(), 
                    a.stopPropagation(), this.select());
                }, c;
            }(a("./number_base")), b.exports = d;
        }, {
            "../../tmpls/range.jade": 16,
            "./number_base": 27
        } ],
        31: [ function(a, b, c) {
            var d, e, f = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, g = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) h.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, h = {}.hasOwnProperty, i = [].indexOf || function(a) {
                for (var b = 0, c = this.length; c > b; b++) if (b in this && this[b] === a) return b;
                return -1;
            };
            e = a("../../utils/keycodes"), d = function(b) {
                function c() {
                    return this.select = f(this.select, this), this.close = f(this.close, this), this.unselect = f(this.unselect, this), 
                    this._createOptionCollection = f(this._createOptionCollection, this), this.getResults = f(this.getResults, this), 
                    this.getValue = f(this.getValue, this), this._hasTabListener = f(this._hasTabListener, this), 
                    this.getTemplateData = f(this.getTemplateData, this), this.remove = f(this.remove, this), 
                    this._initSelect2 = f(this._initSelect2, this), this.focus = f(this.focus, this), 
                    this.render = f(this.render, this), this._getInpSelector = f(this._getInpSelector, this), 
                    this.events = f(this.events, this), c.__super__.constructor.apply(this, arguments);
                }
                return g(c, b), c.prototype.template = a("../../tmpls/select.jade"), c.prototype.forcedModuleOpts = {}, 
                c.prototype.defaultModuleOpts = {
                    width: "auto",
                    multiple: !1
                }, c.prototype.events = function() {
                    var a;
                    return a = {}, this.model.get("multiple") && (a["click .select-check"] = "select"), 
                    a;
                }, c.prototype._getInpSelector = function() {
                    return "select#" + this.cid;
                }, c.prototype.render = function() {
                    c.__super__.render.apply(this, arguments), this._initSelect2();
                }, c.prototype.focus = function() {
                    return this._initSelect2(), this.select2.open(), c.__super__.focus.apply(this, arguments);
                }, c.prototype._initSelect2 = function() {
                    var a;
                    null == this.select2 && (a = _.extend({}, this.defaultModuleOpts, this.model.get("opts"), {
                        multiple: this.model.get("multiple")
                    }, this.forcedModuleOpts), this.$inp.select2(a), this.select2 = this.$inp.data("select2"), 
                    this.model.get("multiple") || this.$inp.on("select2:select", this.select), this.select2.$container.on("click", this._sel2open), 
                    this.select2.$element.hide(), this.model.get("multiple") && $(document).on(this._hasTabEvent(), this._onKey));
                }, c.prototype._sel2open = function(a) {
                    return a.stopPropagation(), !1;
                }, c.prototype.remove = function() {
                    return c.__super__.remove.apply(this, arguments);
                }, c.prototype.getTemplateData = function() {
                    var a, b, d, e, f, g;
                    if (a = _.extend({}, c.__super__.getTemplateData.apply(this, arguments), {
                        multiple: this.model.get("multiple"),
                        options: this._createOptionCollection(this.model.get("options"))
                    }), null == a.value || _.isArray(a.value) || (a.value = [ a.value ]), null != a.value) for (g = a.value, 
                    e = 0, f = g.length; f > e; e++) d = g[e], i.call(_.pluck(a.options, "value"), d) < 0 && a.options.push({
                        value: d,
                        label: d,
                        group: null
                    });
                    return b = _.groupBy(a.options, "group"), _.compact(_.keys(b || {})).length > 1 && (a.optionGroups = b), 
                    a;
                }, c.prototype._hasTabListener = function(a) {
                    return a ? !1 : this.model.get("multiple");
                }, c.prototype._hasTabEvent = function() {
                    return "keyup";
                }, c.prototype.getValue = function() {
                    var a, b, c, d, e, f, g;
                    for (b = [], g = (null != (f = this.select2) ? f.data() : void 0) || [], d = 0, 
                    e = g.length; e > d; d++) c = g[d], a = {}, a.value = c.id, null != c.text && (a.label = c.text), 
                    b.push(a);
                    return b;
                }, c.prototype.getResults = function() {
                    return {
                        value: this.result.pluck("value")
                    };
                }, c.prototype._createOptionCollection = function(a) {
                    var b, c, d, e;
                    if (_.isFunction(a)) return a(this._createOptionCollection);
                    for (b = [], c = 0, d = a.length; d > c; c++) e = a[c], _.isString(e) || _.isNumber(e) ? b.push({
                        value: e,
                        label: e,
                        group: null
                    }) : _.isObject(e) && b.push(_.extend({}, this.optDefault, e));
                    return b;
                }, c.prototype.unselect = function(a) {
                    var b, c;
                    this.result.remove(null != (b = a.params) && null != (c = b.data) ? c.id : void 0);
                }, c.prototype.close = function() {
                    var a, b;
                    null != (a = this.select2) && a.destroy(), null != (b = this.$inp) && b.remove(), 
                    this.$(".select-check").remove(), c.__super__.close.apply(this, arguments);
                }, c.prototype.select = function(a) {
                    var b, c, d, e, f;
                    if (d = this.getValue(), !(null != d ? d.length : void 0)) return void this.close();
                    for (b = this.getSelectModel(), e = 0, f = d.length; f > e; e++) c = d[e], this.result.add(new b(c));
                    this.trigger("selected", this.result), this.close();
                }, c;
            }(a("./base")), b.exports = d;
        }, {
            "../../tmpls/select.jade": 18,
            "../../utils/keycodes": 24,
            "./base": 25
        } ],
        32: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.close = e(this.close, this), this.events = e(this.events, this), c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.template = a("../../tmpls/string.jade"), c.prototype.events = function() {
                    var a;
                    return a = {}, a["keyup " + this._getInpSelector()] = "input", a["keydown " + this._getInpSelector()] = "input", 
                    a["blur " + this._getInpSelector()] = "select", a;
                }, c.prototype.close = function(a) {
                    var b;
                    c.__super__.close.apply(this, arguments);
                    try {
                        null != (b = this.$inp) && b.remove();
                    } catch (d) {}
                }, c;
            }(a("./base")), b.exports = d;
        }, {
            "../../tmpls/string.jade": 21,
            "./base": 25
        } ],
        33: [ function(a, b, c) {
            var d, e, f, g, h = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, i = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) j.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, j = {}.hasOwnProperty, k = [].indexOf || function(a) {
                for (var b = 0, c = this.length; c > b; b++) if (b in this && this[b] === a) return b;
                return -1;
            };
            g = a("./sub"), f = a("./selector"), d = a("../utils/keycodes"), e = function(b) {
                function c() {
                    return this.addFacet = h(this.addFacet, this), this.genSub = h(this.genSub, this), 
                    this.setFacet = h(this.setFacet, this), this.remFacet = h(this.remFacet, this), 
                    this.exit = h(this.exit, this), this._onKey = h(this._onKey, this), this._addFacet = h(this._addFacet, this), 
                    this.render = h(this.render, this), this.initialize = h(this.initialize, this), 
                    c.__super__.constructor.apply(this, arguments);
                }
                return i(c, b), c.prototype.template = a("../tmpls/wrapper.jade"), c.prototype.events = {
                    "click .add-facet-btn": "_addFacet",
                    click: "_addFacet"
                }, c.prototype.initialize = function(a) {
                    var b, c, d, e, f, g, h;
                    for (this.results = a.results, this.collection.on("iggy:rem", this.remFacet), b = "iggy clearfix", 
                    (null != (f = this.el.className) ? f.length : void 0) && (b = " " + b), this.el.className += b, 
                    this.render(), $(document).on("keyup", this._onKey), g = this.collection.filter(function(a) {
                        return null != (null != a ? a.get("value") : void 0);
                    }), d = 0, e = g.length; e > d; d++) c = g[d], h = this.genSub(c, !1);
                }, c.prototype.render = function() {
                    this.$el.html(this.template()), this.$addBtn = this.$(".add-facet-btn");
                }, c.prototype._addFacet = function(a) {
                    this.addFacet();
                }, c.prototype._onKey = function(a) {
                    var b;
                    return a.keyCode === d.ESC || (b = a.keyCode, k.call(d.ESC, b) >= 0) ? void this.exit() : void 0;
                }, c.prototype.exit = function() {
                    this.selectview && (this.selectview.close(), this.selectview = null), this.subview && (this.subview.close(), 
                    this.subview = null, this.addFacet());
                }, c.prototype.remFacet = function(a) {
                    this.results.remove(a.get("name"));
                }, c.prototype.setFacet = function(a, b) {
                    this.collection.remove(a), this.results.add(_.extend(b, {
                        name: a.get("name"),
                        type: a.get("type")
                    }), {
                        merge: !0,
                        parse: !0,
                        _facet: a
                    });
                }, c.prototype.genSub = function(a, b) {
                    var c;
                    return null == b && (b = !0), c = new g({
                        model: a,
                        collection: this.collection
                    }), c.on("closed", function(a) {
                        return function(d) {
                            c.off(), (null != d ? d.length : void 0) || c.remove(), a.subview = null, b && a.addFacet();
                        };
                    }(this)), c.on("selected", this.setFacet), this.$addBtn.before(c.render()), c;
                }, c.prototype.addFacet = function() {
                    return null != this.selectview ? void this.selectview.focus() : null != this.subview ? void this.subview.focus() : void (this.collection.length && (this.selectview = new f({
                        collection: this.collection,
                        custom: !1
                    }), this.$addBtn.before(this.selectview.render()), this.selectview.focus(), this.selectview.on("closed", function(a) {
                        return function(b) {
                            a.selectview.off(), a.selectview.remove(), a.selectview = null, (null != b ? b.length : void 0) || null == a.subview || (a.subview.off(), 
                            a.subview.remove(), a.subview = null);
                        };
                    }(this)), this.selectview.on("selected", function(a) {
                        return function(b) {
                            b.set("value", null), a.subview = a.genSub(b), a.subview.open();
                        };
                    }(this))));
                }, c;
            }(Backbone.View), b.exports = e;
        }, {
            "../tmpls/wrapper.jade": 23,
            "../utils/keycodes": 24,
            "./selector": 34,
            "./sub": 35
        } ],
        34: [ function(a, b, c) {
            var d, e, f = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, g = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) h.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, h = {}.hasOwnProperty;
            d = a("../utils/keycodes"), e = function(b) {
                function c(a) {
                    this.selectActive = f(this.selectActive, this), this.select = f(this.select, this), 
                    this.move = f(this.move, this), this.search = f(this.search, this), this.focus = f(this.focus, this), 
                    this.selected = f(this.selected, this), this._onClick = f(this._onClick, this), 
                    this.checkOptionsEmpty = f(this.checkOptionsEmpty, this), this.scrollHelper = f(this.scrollHelper, this), 
                    this._checkScroll = f(this._checkScroll, this), this.renderRes = f(this.renderRes, this), 
                    this.render = f(this.render, this), this.getTemplateData = f(this.getTemplateData, this), 
                    this.initialize = f(this.initialize, this), this.events = f(this.events, this), 
                    this.className = f(this.className, this), this.custom = a.custom || !1, this.activeIdx = 0, 
                    this.currQuery = "", c.__super__.constructor.apply(this, arguments);
                }
                return g(c, b), c.prototype.template = a("../tmpls/selector.jade"), c.prototype.templateEl = a("../tmpls/selectorli.jade"), 
                c.prototype.multiSelect = !1, c.prototype.className = function() {
                    var a;
                    return a = [ "add-facet" ], this.custom && a.push("custom"), a.join(" ");
                }, c.prototype.events = function() {
                    var a;
                    return a = {
                        "mousedown a": "_onClick"
                    }, a["focus input#" + this.cid] = "open", a["keydown input#" + this.cid] = "search", 
                    a["keyup input#" + this.cid] = "search", a;
                }, c.prototype.initialize = function(a) {
                    this.searchcoll = this.collection.sub(function() {
                        return !0;
                    }), this.result = new this.collection.constructor(), this.listenTo(this.searchcoll, "remove", this.renderRes), 
                    this.listenTo(this.searchcoll, "remove", this.checkOptionsEmpty);
                }, c.prototype.getTemplateData = function() {
                    return _.extend(c.__super__.getTemplateData.apply(this, arguments), {
                        custom: this.custom
                    });
                }, c.prototype.render = function() {
                    return c.__super__.render.apply(this, arguments), this.$list = this.$el.find("#" + this.cid + "typelist"), 
                    this.renderRes(), this.el;
                }, c.prototype.renderRes = function() {
                    var a, b, c, d, e, f, g, h, i, j;
                    for (this.$list.empty(), d = [], i = this.searchcoll.models, f = e = 0, g = i.length; g > e; f = ++e) h = i[f], 
                    c = h.getLabel(), b = h.id, a = h.get("cssclass"), (null != (j = this.currQuery) ? j.length : void 0) > 1 && (c = c.replace(new RegExp(this.currQuery, "gi"), function(a) {
                        return "<b>" + a + "</b>";
                    })), d.push({
                        label: c,
                        id: b,
                        cssclass: a
                    });
                    return this.$list.append(this.templateEl({
                        list: d,
                        query: this.currQuery,
                        activeIdx: this.activeIdx,
                        custom: this.custom
                    })), this._checkScroll(), this.$list;
                }, c.prototype._scrollTill = 198, c.prototype._checkScroll = function() {
                    var a;
                    return a = this.$list.height(), a > 0 ? void this.scrollHelper(a) : void setTimeout(function(a) {
                        return function() {
                            return a.scrollHelper(a.$list.height());
                        };
                    }(this), 0);
                }, c.prototype.scrollHelper = function(a) {
                    a >= this._scrollTill ? this.scrolling = !0 : this.scrolling = !1;
                }, c.prototype.checkOptionsEmpty = function() {}, c.prototype._onClick = function(a) {
                    var b, c;
                    return a.stopPropagation(), a.preventDefault(), b = this.$(a.currentTarget).data("id"), 
                    null != b && (c = this.collection.get(b), null != c) ? (this.selected(c), this.multiSelect || this.close(), 
                    !1) : void 0;
                }, c.prototype.selected = function(a) {
                    var b, c;
                    try {
                        if (null != a.onlyExec) return void (null != a && "function" == typeof a.exec && a.exec());
                    } catch (d) {
                        b = d;
                        try {
                            console.error("Issue #23: CATCH - Class:" + this.constructor.name + " - activeIdx:" + this.activeIdx + " - collection:" + JSON.stringify(this.collection.toJSON()));
                        } catch (d) {
                            c = d, console.error("Issue #23: CATCH");
                        }
                    }
                    null != a && (this.searchcoll.remove(a), this.result.add(a), this.trigger("selected", a));
                }, c.prototype.focus = function() {
                    this.$inp.focus();
                }, c.prototype.search = function(a) {
                    var b;
                    if ("keydown" !== a.type) b = a.currentTarget.value.toLowerCase(), b !== this.currQuery && (this.currQuery = b, 
                    this.searchcoll.updateSubFilter(function(a) {
                        return function(c) {
                            var d;
                            return null != a.result.get(c.id) ? !1 : (null != b ? b.length : void 0) ? d = c.match(b) : !0;
                        };
                    }(this), !1), this.activeIdx = 0, this.renderRes()); else switch (a.keyCode) {
                      case d.UP:
                        return void this.move(!0);

                      case d.DOWN:
                        return void this.move(!1);

                      case d.ENTER:
                        return void this.selectActive(!0);
                    }
                }, c.prototype.move = function(a) {
                    var b, c, d, e, f, g, h, i, j, k;
                    if (null == a && (a = !1), f = this.$el.find(".typelist a"), d = (null != (k = this.currQuery) ? k.length : void 0) ? 0 : 1, 
                    j = 0, a) {
                        if (this.activeIdx - 1 < j) return;
                        g = this.activeIdx - 1;
                    } else {
                        if (this.searchcoll.length - d <= this.activeIdx) return;
                        g = this.activeIdx + 1;
                    }
                    this.$(f[this.activeIdx]).removeClass("active"), b = this.$(f[g]).addClass("active"), 
                    this.scrolling && (e = b.outerHeight(), h = e * (g + 1), c = this.$el.find(".typelist"), 
                    i = c.scrollTop(), h > i + this._scrollTill ? c.scrollTop(h - this._scrollTill) : i + e > h && c.scrollTop(h - e)), 
                    this.activeIdx = g;
                }, c.prototype.select = function() {}, c.prototype.selectActive = function(a) {
                    var b, c, d;
                    if (null == a && (a = !1), c = this.$el.find(".typelist a.active").removeClass("active").data(), 
                    b = this.$inp.val(), null == c && this.multiSelect && a && !(null != b ? b.length : void 0)) return void this.close();
                    if (null != c) {
                        if (this.activeIdx = 0, (null != c ? c.idx : void 0) >= 0 && this.searchcoll.length) console.log("got", this.collection.get(c.id), this.collection, c.id), 
                        this.selected(this.collection.get(c.id)); else {
                            if (null != (d = this.currQuery) ? !d.length : !0) return;
                            this.selected(new this.collection.model({
                                value: this.currQuery,
                                custom: !0
                            })), this.$inp.val("");
                        }
                        this.multiSelect || this.close();
                    }
                }, c;
            }(a("./facets/base")), b.exports = e;
        }, {
            "../tmpls/selector.jade": 19,
            "../tmpls/selectorli.jade": 20,
            "../utils/keycodes": 24,
            "./facets/base": 25
        } ],
        35: [ function(a, b, c) {
            var d, e = function(a, b) {
                return function() {
                    return a.apply(b, arguments);
                };
            }, f = function(a, b) {
                function c() {
                    this.constructor = a;
                }
                for (var d in b) g.call(b, d) && (a[d] = b[d]);
                return c.prototype = b.prototype, a.prototype = new c(), a.__super__ = b.prototype, 
                a;
            }, g = {}.hasOwnProperty;
            d = function(b) {
                function c() {
                    return this.open = e(this.open, this), this.generateSub = e(this.generateSub, this), 
                    this.close = e(this.close, this), this.focus = e(this.focus, this), this.isOpen = e(this.isOpen, this), 
                    this.selected = e(this.selected, this), this.remove = e(this.remove, this), this.del = e(this.del, this), 
                    this.render = e(this.render, this), this.initialize = e(this.initialize, this), 
                    c.__super__.constructor.apply(this, arguments);
                }
                return f(c, b), c.prototype.template = a("../tmpls/sub.jade"), c.prototype.className = "sub", 
                c.prototype.initialize = function() {
                    this.result = new Backbone.Collection();
                }, c.prototype.events = {
                    "click .rm-facet-btn": "del"
                }, c.prototype.render = function(a) {
                    var b, c, d, e, f, g, h, i;
                    for (d = [], i = this.result.models, f = e = 0, g = i.length; g > e; f = ++e) {
                        h = i[f];
                        try {
                            d.push(h.getLabel());
                        } catch (j) {
                            b = j;
                            try {
                                console.error("Issue #24: CATCH - Class:" + this.constructor.name + " - model:" + JSON.stringify(this.model.toJSON()) + " - result:" + JSON.stringify(this.result.toJSON()));
                            } catch (j) {
                                c = j, console.error("Issue #24: CATCH");
                            }
                        }
                    }
                    return this.$el.html(this.template({
                        label: this.model.getLabel(),
                        selected: d
                    })), this.$sub = this.$(".subselect"), this.$results = this.$(".subresults"), this.generateSub(), 
                    this.el;
                }, c.prototype.del = function(a) {
                    return a.stopPropagation(), a.preventDefault(), this.collection.trigger("iggy:rem", this.model), 
                    this.collection.add(this.model), this.remove(), this.trigger("closed"), !1;
                }, c.prototype.remove = function() {
                    var a;
                    return null != (a = this.selectview) && a.remove(), c.__super__.remove.apply(this, arguments);
                }, c.prototype.selected = function(a) {
                    this.result.add(a), this.$results.html(this.selectview.renderResult()), this.trigger("selected", this.model, this.selectview.getResults());
                }, c.prototype.isOpen = function() {
                    return null != this.selectview;
                }, c.prototype.focus = function() {
                    var a;
                    return null != this.selectview ? void (null != (a = this.selectview) && a.focus()) : void this.open();
                }, c.prototype.close = function() {
                    var a;
                    return null != this.selectview ? void (null != (a = this.selectview) && a.close()) : void 0;
                }, c.prototype.generateSub = function() {
                    var a;
                    return null != this.selectview ? this.selectview : (this.selectview = new this.model.SubView({
                        model: this.model,
                        el: this.$sub
                    }), this.selectview.on("closed", function(a) {
                        return function(b) {
                            a.selectview.off(), b.length || a.selectview.remove(), a.trigger("closed", b), b.length || a.remove();
                        };
                    }(this)), this.selectview.on("selected", function(a) {
                        return function(b) {
                            b && a.selected(b);
                        };
                    }(this)), this.$el.append(this.selectview.render()), void (null != (null != (a = this.model) ? a.get("value") : void 0) && this.selectview.select()));
                }, c.prototype.open = function() {
                    var a;
                    this.generateSub(), null != (a = this.selectview) && a.focus();
                }, c;
            }(Backbone.View), b.exports = d;
        }, {
            "../tmpls/sub.jade": 22
        } ],
        36: [ function(a, b, c) {}, {} ],
        37: [ function(b, c, d) {
            (function(e) {
                !function(b) {
                    if ("object" == typeof d && "undefined" != typeof c) c.exports = b(); else if ("function" == typeof a && a.amd) a([], b); else {
                        var f;
                        f = "undefined" != typeof window ? window : "undefined" != typeof e ? e : "undefined" != typeof self ? self : this, 
                        f.jade = b();
                    }
                }(function() {
                    return function a(c, d, e) {
                        function f(h, i) {
                            if (!d[h]) {
                                if (!c[h]) {
                                    var j = "function" == typeof b && b;
                                    if (!i && j) return j(h, !0);
                                    if (g) return g(h, !0);
                                    var k = new Error("Cannot find module '" + h + "'");
                                    throw k.code = "MODULE_NOT_FOUND", k;
                                }
                                var l = d[h] = {
                                    exports: {}
                                };
                                c[h][0].call(l.exports, function(a) {
                                    var b = c[h][1][a];
                                    return f(b ? b : a);
                                }, l, l.exports, a, c, d, e);
                            }
                            return d[h].exports;
                        }
                        for (var g = "function" == typeof b && b, h = 0; h < e.length; h++) f(e[h]);
                        return f;
                    }({
                        1: [ function(a, b, c) {
                            "use strict";
                            function d(a) {
                                return null != a && "" !== a;
                            }
                            function e(a) {
                                return (Array.isArray(a) ? a.map(e) : a && "object" == typeof a ? Object.keys(a).filter(function(b) {
                                    return a[b];
                                }) : [ a ]).filter(d).join(" ");
                            }
                            function f(a) {
                                return h[a] || a;
                            }
                            function g(a) {
                                var b = String(a).replace(i, f);
                                return b === "" + a ? a : b;
                            }
                            c.merge = function j(a, b) {
                                if (1 === arguments.length) {
                                    for (var c = a[0], e = 1; e < a.length; e++) c = j(c, a[e]);
                                    return c;
                                }
                                var f = a["class"], g = b["class"];
                                (f || g) && (f = f || [], g = g || [], Array.isArray(f) || (f = [ f ]), Array.isArray(g) || (g = [ g ]), 
                                a["class"] = f.concat(g).filter(d));
                                for (var h in b) "class" != h && (a[h] = b[h]);
                                return a;
                            }, c.joinClasses = e, c.cls = function(a, b) {
                                for (var d = [], f = 0; f < a.length; f++) b && b[f] ? d.push(c.escape(e([ a[f] ]))) : d.push(e(a[f]));
                                var g = e(d);
                                return g.length ? ' class="' + g + '"' : "";
                            }, c.style = function(a) {
                                return a && "object" == typeof a ? Object.keys(a).map(function(b) {
                                    return b + ":" + a[b];
                                }).join(";") : a;
                            }, c.attr = function(a, b, d, e) {
                                return "style" === a && (b = c.style(b)), "boolean" == typeof b || null == b ? b ? " " + (e ? a : a + '="' + a + '"') : "" : 0 == a.indexOf("data") && "string" != typeof b ? (-1 !== JSON.stringify(b).indexOf("&") && console.warn("Since Jade 2.0.0, ampersands (`&`) in data attributes will be escaped to `&amp;`"), 
                                b && "function" == typeof b.toISOString && console.warn("Jade will eliminate the double quotes around dates in ISO form after 2.0.0"), 
                                " " + a + "='" + JSON.stringify(b).replace(/'/g, "&apos;") + "'") : d ? (b && "function" == typeof b.toISOString && console.warn("Jade will stringify dates in ISO form after 2.0.0"), 
                                " " + a + '="' + c.escape(b) + '"') : (b && "function" == typeof b.toISOString && console.warn("Jade will stringify dates in ISO form after 2.0.0"), 
                                " " + a + '="' + b + '"');
                            }, c.attrs = function(a, b) {
                                var d = [], f = Object.keys(a);
                                if (f.length) for (var g = 0; g < f.length; ++g) {
                                    var h = f[g], i = a[h];
                                    "class" == h ? (i = e(i)) && d.push(" " + h + '="' + i + '"') : d.push(c.attr(h, i, !1, b));
                                }
                                return d.join("");
                            };
                            var h = {
                                "&": "&amp;",
                                "<": "&lt;",
                                ">": "&gt;",
                                '"': "&quot;"
                            }, i = /[&<>"]/g;
                            c.escape = g, c.rethrow = function k(b, c, d, e) {
                                if (!(b instanceof Error)) throw b;
                                if (!("undefined" == typeof window && c || e)) throw b.message += " on line " + d, 
                                b;
                                try {
                                    e = e || a("fs").readFileSync(c, "utf8");
                                } catch (f) {
                                    k(b, null, d);
                                }
                                var g = 3, h = e.split("\n"), i = Math.max(d - g, 0), j = Math.min(h.length, d + g), g = h.slice(i, j).map(function(a, b) {
                                    var c = b + i + 1;
                                    return (c == d ? "  > " : "    ") + c + "| " + a;
                                }).join("\n");
                                throw b.path = c, b.message = (c || "Jade") + ":" + d + "\n" + g + "\n\n" + b.message, 
                                b;
                            }, c.DebugItem = function(a, b) {
                                this.lineno = a, this.filename = b;
                            };
                        }, {
                            fs: 2
                        } ],
                        2: [ function(a, b, c) {}, {} ]
                    }, {}, [ 1 ])(1);
                });
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {
            fs: 36
        } ]
    }, {}, [ 1 ])(1);
});