(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctNumber, FctString, IGGY, MainView, Results,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MainView = require("./views/main");

Facets = require("./models/backbone_sub");

FctString = require("./models/facet_string");

FctArray = require("./models/facet_array");

FctNumber = require("./models/facet_number");

Results = require("./models/results");

IGGY = (function(superClass) {
  extend(IGGY, superClass);

  IGGY.prototype.$ = jQuery;

  function IGGY(el, facets, options) {
    if (facets == null) {
      facets = [];
    }
    if (options == null) {
      options = {};
    }
    this.ERRORS = bind(this.ERRORS, this);
    this._initErrors = bind(this._initErrors, this);
    this.triggerChange = bind(this.triggerChange, this);
    this.getQuery = bind(this.getQuery, this);
    this._error = bind(this._error, this);
    this.addFacet = bind(this.addFacet, this);
    this._createFacet = bind(this._createFacet, this);
    this._prepareFacets = bind(this._prepareFacets, this);
    this._prepareEl = bind(this._prepareEl, this);
    _.extend(this, Backbone.Events);
    this._initErrors();
    this.$el = this._prepareEl(el);
    this.el = this.$el[0];
    this.$el.data("iggy", this);
    this.facets = this._prepareFacets(facets);
    this.results = new Results();
    this.results.on("add", this.triggerChange);
    this.results.on("remove", this.triggerChange);
    this.results.on("change", this.triggerChange);
    new MainView({
      el: this.$el,
      collection: this.facets,
      results: this.results
    });
    return;
  }

  IGGY.prototype._prepareEl = function(el) {
    var _$el;
    if (el == null) {
      throw this._error("EMISSINGEL");
    }
    if (_.isString(el)) {
      if (!el.length) {
        throw this._error("EEMPTYELSTRING");
      }
      _$el = this.$(el);
      if (!(_$el != null ? _$el.length : void 0)) {
        throw this._error("EINVALIDELSTRING");
      }
      return _$el;
    }
    if (el instanceof jQuery) {
      if (!el.length) {
        throw this._error("EEMPTYELJQUERY");
      }
      if (el.length > 1) {
        throw this._error("ESIZEELJQUERY");
      }
      return el;
    }
    if (el instanceof Element) {
      return this.$(el);
    }
    throw this._error("EINVALIDELTYPE");
  };

  IGGY.prototype._prepareFacets = function(facets) {
    var _fct, _ret, facet, i, len;
    _ret = [];
    for (i = 0, len = facets.length; i < len; i++) {
      facet = facets[i];
      if ((_fct = this._createFacet(facet)) != null) {
        _ret.push(_fct);
      }
    }
    return new Facets(_ret);
  };

  IGGY.prototype._createFacet = function(facet) {
    switch (facet.type.toLowerCase()) {
      case "string":
        return new FctString(facet);
      case "array":
        return new FctArray(facet);
      case "number":
        return new FctNumber(facet);
    }
  };

  IGGY.prototype.addFacet = function(facet) {
    var _fct;
    if (this.facets == null) {
      return;
    }
    if ((_fct = this._createFacet(facet)) != null) {
      this.facets.add(_fct);
    }
    return this;
  };

  IGGY.prototype._error = function(type, data) {
    var _err, _msg;
    if (data == null) {
      data = {};
    }
    if (this.errors[type] != null) {
      _msg = this.errors[type](data);
    } else {
      _msg = "-";
    }
    _err = new Error();
    _err.name = type;
    _err.message = _msg;
    return _err;
  };

  IGGY.prototype.getQuery = function() {
    return this.results;
  };

  IGGY.prototype.triggerChange = function() {
    this.trigger("change", this.results);
  };

  IGGY.prototype._initErrors = function() {
    var _k, _tmpl, ref;
    this.errors = {};
    ref = this.ERRORS();
    for (_k in ref) {
      _tmpl = ref[_k];
      this.errors[_k] = _.template(_tmpl);
    }
  };

  IGGY.prototype.ERRORS = function() {
    return {
      "EINVALIDELSTRING": "If you define a `el` as String it has to be a valid selector for an existing DOM element.",
      "EEMPTYELSTRING": "The `el` as string can not be empty.",
      "EEMPTYELJQUERY": "The `el` as jOuery object can not be an empty collection.",
      "ESIZEELJQUERY": "The `el` as jOuery object can not be a result of one el.",
      "EINVALIDELTYPE": "The `el` can only be a selector string, dom element or jQuery collection",
      "EMISSINGEL": "Please define a target `el`"
    };
  };

  return IGGY;

})(Backbone.Events);

module.exports = IGGY;



},{"./models/backbone_sub":2,"./models/facet_array":3,"./models/facet_number":5,"./models/facet_string":6,"./models/results":7,"./views/main":19}],2:[function(require,module,exports){

/*
EXAMPLE USAGE

	parentColl = new Backbone.Collection.Sub()
	
	 * by Array
	subCollA = parentColl.sub( [ 1, 2, 3 ] ) 
	
	 * or by Object
	subCollO = parentColl.sub( { name: "Foo", age: 42 } ) 
	
	 * or by Number
	subCollN = parentColl.sub( 13 )
	
	 * or by Function
	subCollF = parentColl.sub( (( model )-> if model.get( "age" ) > 23 ) )
	
	 * subcollection of subcollection
	subCollA_O = subCollA.sub( { name: "Foo", age: 42 } )
	
	 * update the filter of a subcollection. For this a `reset` will be fired on the subcollection
	subCollA = subCollA.updateSubFilter( { name: "Bar", age: 42 } )
 */
var BackboneSub,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BackboneSub = (function(superClass) {
  extend(BackboneSub, superClass);

  function BackboneSub() {
    this._generateSubFilter = bind(this._generateSubFilter, this);
    this.updateSubFilter = bind(this.updateSubFilter, this);
    this.sub = bind(this.sub, this);
    return BackboneSub.__super__.constructor.apply(this, arguments);
  }


  /*
  	## sub
  	
  	`collection.sub( filter )`
  	
  	Generate a sub-collection by a filter.
  	The models will be distributed within all involved collections under consideration of the filter.
  	
  	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters.
  	
  	@return { Collection } A Sub-Collection based on the filter
  	
  	@api public
   */

  BackboneSub.prototype.sub = function(filter) {
    var _models, _sub, fnFilter;
    this.subColls || (this.subColls = []);
    fnFilter = this._generateSubFilter(filter);
    _models = this.filter(fnFilter);
    _sub = new this.constructor(_models);
    _sub._parentCol = this;
    _sub._fnFilter = fnFilter;
    this.on("change", _.bind(function(_m) {
      var added, toAdd;
      toAdd = this._fnFilter(_m);
      added = this.get(_m) != null;
      if (added && !toAdd) {
        this.remove(_m);
      } else if (!added && toAdd) {
        this.add(_m);
      }
    }, _sub));
    _sub.on("add", _.bind(function(_m) {
      this.add(_m);
    }, this));
    this.on("add", _.bind(function(_m) {
      if (this._fnFilter(_m)) {
        this.add(_m);
      }
    }, _sub));
    _sub.on("remove", _.bind(function(_m) {}, this));
    this.on("remove", _.bind(function(_m) {
      this.remove(_m);
    }, _sub));
    this.on("reset", _.bind(function(_m) {
      this.updateSubFilter();
    }, _sub));
    this.subColls.push(_sub);
    return _sub;
  };


  /*
  	## updateSubFilter
  	
  	`collection.updateSubFilter( filter )`
  	
  	Method to update the filter of a subcollection. Then all models will be resete by the new filter. So you have to listen to teh reset event
  	
  	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters. 
  	
  	@return { Self } itself
  	
  	@api public
   */

  BackboneSub.prototype.updateSubFilter = function(filter, asReset) {
    var _addIds, _models, currids, i, j, len, len1, mdl, newids, ref, ref1, rid;
    if (asReset == null) {
      asReset = true;
    }
    if (this._parentCol != null) {
      if (filter != null) {
        this._fnFilter = this._generateSubFilter(filter);
      }
      _models = this._parentCol.filter(this._fnFilter);
      if (asReset) {
        this.reset(_models);
        return this;
      }
      newids = _.pluck(_models, "cid");
      currids = _.pluck(this.models, "cid");
      ref = _.difference(currids, newids);
      for (i = 0, len = ref.length; i < len; i++) {
        rid = ref[i];
        this.remove(rid);
      }
      _addIds = _.difference(newids, currids);
      for (j = 0, len1 = _models.length; j < len1; j++) {
        mdl = _models[j];
        if (ref1 = mdl.cid, indexOf.call(_addIds, ref1) >= 0) {
          this.add(mdl);
        }
      }
    }
    return this;
  };


  /*
  	## _generateSubFilter
  	
  	`collection._generateSubFilter( filter )`
  	
  	Internal method th convert a filter argument to a filter function
  	
  	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters. 
  	
  	@return { Function } The generated filter function 
  	
  	@api private
   */

  BackboneSub.prototype._generateSubFilter = function(filter) {
    var fnFilter;
    if (_.isFunction(filter)) {
      fnFilter = filter;
    } else if (_.isArray(filter)) {
      fnFilter = (function(_this) {
        return function(_m) {
          var ref;
          return ref = _m.id, indexOf.call(filter, ref) >= 0;
        };
      })(this);
    } else if (_.isString(filter) || _.isNumber(filter)) {
      fnFilter = (function(_this) {
        return function(_m) {
          return _m.id === filter;
        };
      })(this);
    } else {
      fnFilter = (function(_this) {
        return function(_m) {
          var _nm, _vl;
          for (_nm in filter) {
            _vl = filter[_nm];
            if (_m.get(_nm) !== _vl) {
              return false;
            }
          }
          return true;
        };
      })(this);
    }
    return fnFilter;
  };

  return BackboneSub;

})(Backbone.Collection);

module.exports = BackboneSub;



},{}],3:[function(require,module,exports){
var FctArray,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctArray = (function(superClass) {
  extend(FctArray, superClass);

  function FctArray() {
    return FctArray.__super__.constructor.apply(this, arguments);
  }

  FctArray.prototype.SubView = require("../views/facets/subarray");

  return FctArray;

})(require("./facet_string"));

module.exports = FctArray;



},{"../views/facets/subarray":16,"./facet_string":6}],4:[function(require,module,exports){
var FacetBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetBase = (function(superClass) {
  extend(FacetBase, superClass);

  function FacetBase() {
    this.match = bind(this.match, this);
    this.getLabel = bind(this.getLabel, this);
    this.defaults = bind(this.defaults, this);
    return FacetBase.__super__.constructor.apply(this, arguments);
  }

  FacetBase.prototype.idAttribute = "name";

  FacetBase.prototype.SubView = require("../views/facets/base");

  FacetBase.prototype.defaults = function() {
    return {
      type: "string",
      name: "name",
      label: "Description"
    };
  };

  FacetBase.prototype.getLabel = function() {
    return this.get("label");
  };

  FacetBase.prototype.match = function(crit) {
    var _s, found;
    _s = this.get("name") + " " + this.get("label");
    found = _s.toLowerCase().indexOf(crit.toLowerCase());
    return found >= 0;
  };

  FacetBase.prototype.comparator = function(mdl) {
    console.log("comparator", mdl);
    return mdl.id;
  };

  return FacetBase;

})(Backbone.Model);

module.exports = FacetBase;



},{"../views/facets/base":15}],5:[function(require,module,exports){
var FctNumber,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctNumber = (function(superClass) {
  extend(FctNumber, superClass);

  function FctNumber() {
    this.defaults = bind(this.defaults, this);
    return FctNumber.__super__.constructor.apply(this, arguments);
  }

  FctNumber.prototype.SubView = require("../views/facets/subnumber");

  FctNumber.prototype.defaults = function() {
    return $.extend(FctNumber.__super__.defaults.apply(this, arguments), {
      min: 0,
      max: 100,
      step: 1,
      value: 50
    });
  };

  return FctNumber;

})(require("./facet_base"));

module.exports = FctNumber;



},{"../views/facets/subnumber":17,"./facet_base":4}],6:[function(require,module,exports){
var FctString,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctString = (function(superClass) {
  extend(FctString, superClass);

  function FctString() {
    this.defaults = bind(this.defaults, this);
    return FctString.__super__.constructor.apply(this, arguments);
  }

  FctString.prototype.SubView = require("../views/facets/substring");

  FctString.prototype.defaults = function() {
    return $.extend(FctString.__super__.defaults.apply(this, arguments), {
      options: []
    });
  };

  return FctString;

})(require("./facet_base"));

module.exports = FctString;



},{"../views/facets/substring":18,"./facet_base":4}],7:[function(require,module,exports){
var IggyResult, IggyResults,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

IggyResult = (function(superClass) {
  extend(IggyResult, superClass);

  function IggyResult() {
    return IggyResult.__super__.constructor.apply(this, arguments);
  }

  IggyResult.prototype.idAttribute = "name";

  IggyResult.prototype.defaults = {
    type: "string",
    name: null,
    value: null
  };

  return IggyResult;

})(Backbone.Model);

IggyResults = (function(superClass) {
  extend(IggyResults, superClass);

  function IggyResults() {
    this.parse = bind(this.parse, this);
    return IggyResults.__super__.constructor.apply(this, arguments);
  }

  IggyResults.prototype.model = IggyResult;

  IggyResults.prototype.parse = function(attr, options) {
    var _modify, ref;
    _modify = (ref = options._facet) != null ? ref.get("modify") : void 0;
    if ((_modify != null) && _.isFunction(_modify)) {
      attr.value = _modify(attr.value);
    }
    return attr;
  };

  return IggyResults;

})(Backbone.Collection);

module.exports = IggyResults;



},{}],8:[function(require,module,exports){
var BaseResult, BaseResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseResult = (function(superClass) {
  extend(BaseResult, superClass);

  function BaseResult() {
    this.getLabel = bind(this.getLabel, this);
    return BaseResult.__super__.constructor.apply(this, arguments);
  }

  BaseResult.prototype.idAttribute = "value";

  BaseResult.prototype.getLabel = function() {
    return this.get("label") || this.get(this.idAttribute) || "-";
  };

  return BaseResult;

})(Backbone.Model);

BaseResults = (function(superClass) {
  extend(BaseResults, superClass);

  function BaseResults() {
    return BaseResults.__super__.constructor.apply(this, arguments);
  }

  BaseResults.prototype.model = BaseResult;

  return BaseResults;

})(require("./backbone_sub"));

module.exports = BaseResults;



},{"./backbone_sub":2}],9:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, operators, undefined) {
if ( operators && operators.length)
{
buf.push("<select" + (jade.attr("id", "" + (cid) + "op", true, false)) + " class=\"operator\">");
// iterate operators
;(function(){
  var $$obj = operators;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var op = $$obj[idx];

buf.push("<option" + (jade.attr("value", op, true, false)) + ">" + (jade.escape(null == (jade_interp = op) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var op = $$obj[idx];

buf.push("<option" + (jade.attr("value", op, true, false)) + ">" + (jade.escape(null == (jade_interp = op) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select>");
}
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"number-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"operators" in locals_for_with?locals_for_with.operators:typeof operators!=="undefined"?operators:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":23}],10:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":23}],11:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (activeIdx, custom, list, query, undefined) {
if ( list.length)
{
// iterate list
;(function(){
  var $$obj = list;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<li><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:idx === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:idx === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

}
else if ( !custom)
{
buf.push("<li><a class=\"emptyres\">no result for \"" + (jade.escape((jade_interp = query) == null ? '' : jade_interp)) + "\"</a></li>");
}}.call(this,"activeIdx" in locals_for_with?locals_for_with.activeIdx:typeof activeIdx!=="undefined"?activeIdx:undefined,"custom" in locals_for_with?locals_for_with.custom:typeof custom!=="undefined"?custom:undefined,"list" in locals_for_with?locals_for_with.list:typeof list!=="undefined"?list:undefined,"query" in locals_for_with?locals_for_with.query:typeof query!=="undefined"?query:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":23}],12:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (label, selected, undefined) {
buf.push("<div class=\"rm-facet-btn btn btn-default btn-xs\">X</div><span>" + (jade.escape((jade_interp = label) == null ? '' : jade_interp)) + ":</span><ul class=\"subresults\">");
if ( selected && selected.length)
{
// iterate selected
;(function(){
  var $$obj = selected;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<li>" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li>" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</li>");
    }

  }
}).call(this);

}
buf.push("</ul><div class=\"subselect\"></div>");}.call(this,"label" in locals_for_with?locals_for_with.label:typeof label!=="undefined"?label:undefined,"selected" in locals_for_with?locals_for_with.selected:typeof selected!=="undefined"?selected:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":23}],13:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn btn btn-default btn-sm\">+</div>");;return buf.join("");
};
},{"jade/runtime":23}],14:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13
};



},{}],15:[function(require,module,exports){
var FacetSubsBase, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubResults = require("../../models/subresults");

FacetSubsBase = (function(superClass) {
  extend(FacetSubsBase, superClass);

  function FacetSubsBase() {
    this.select = bind(this.select, this);
    this.getSelectModel = bind(this.getSelectModel, this);
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.close = bind(this.close, this);
    this.render = bind(this.render, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.open = bind(this.open, this);
    this.renderResult = bind(this.renderResult, this);
    this.focus = bind(this.focus, this);
    this.initialize = bind(this.initialize, this);
    return FacetSubsBase.__super__.constructor.apply(this, arguments);
  }

  FacetSubsBase.prototype.initialize = function() {
    this.result = new SubResults();
  };

  FacetSubsBase.prototype.focus = function() {
    this.$inp.focus();
  };

  FacetSubsBase.prototype.renderResult = function() {
    var _list, i, idx, len, model, ref;
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _list.push(model.getLabel());
    }
    return "<li>" + _list.join("</li><li>") + "</li>";
  };

  FacetSubsBase.prototype.open = function() {
    this.$el.addClass("open");
    this.isOpen = true;
    this.trigger("opened");
  };

  FacetSubsBase.prototype.getTemplateData = function() {
    return {
      cid: this.cid
    };
  };

  FacetSubsBase.prototype.render = function() {
    this.$el.html(this.template(this.getTemplateData()));
    this.$inp = this.$el.find("input#" + this.cid);
  };

  FacetSubsBase.prototype.close = function(evnt) {
    this.$el.removeClass("open");
    this.$el.addClass("closed");
    this.isOpen = false;
    this.trigger("closed", this.result);
  };

  FacetSubsBase.prototype.getResults = function() {
    return {
      value: this.getValue()
    };
  };

  FacetSubsBase.prototype.getValue = function() {
    return this.$inp.val();
  };

  FacetSubsBase.prototype.getSelectModel = function() {
    return SubResults.prototype.model;
  };

  FacetSubsBase.prototype.select = function() {
    var _ModelConst, _model;
    _ModelConst = this.getSelectModel();
    _model = new _ModelConst({
      value: this.getValue(),
      custom: true
    });
    this.result.add(_model);
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsBase;

})(Backbone.View);

module.exports = FacetSubsBase;



},{"../../models/subresults":8}],16:[function(require,module,exports){
var ArrayOption, ArrayOptions, FacetSubArray,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ArrayOption = (function(superClass) {
  extend(ArrayOption, superClass);

  function ArrayOption() {
    this.match = bind(this.match, this);
    this.getLabel = bind(this.getLabel, this);
    return ArrayOption.__super__.constructor.apply(this, arguments);
  }

  ArrayOption.prototype.idAttribute = "value";

  ArrayOption.prototype.getLabel = function() {
    return this.get("label") || this.get("name") || "-";
  };

  ArrayOption.prototype.match = function(crit) {
    var _s, found;
    _s = this.get("value") + " " + this.get("label");
    found = _s.toLowerCase().indexOf(crit.toLowerCase());
    return found >= 0;
  };

  return ArrayOption;

})(Backbone.Model);

ArrayOptions = (function(superClass) {
  extend(ArrayOptions, superClass);

  function ArrayOptions() {
    return ArrayOptions.__super__.constructor.apply(this, arguments);
  }

  ArrayOptions.prototype.model = ArrayOption;

  return ArrayOptions;

})(require("../../models/backbone_sub"));

FacetSubArray = (function(superClass) {
  extend(FacetSubArray, superClass);

  function FacetSubArray() {
    this.getResults = bind(this.getResults, this);
    return FacetSubArray.__super__.constructor.apply(this, arguments);
  }

  FacetSubArray.prototype.multiSelect = true;

  FacetSubArray.prototype.getResults = function() {
    return {
      value: this.result.pluck("value")
    };
  };

  return FacetSubArray;

})(require("./substring"));

module.exports = FacetSubArray;



},{"../../models/backbone_sub":2,"./substring":18}],17:[function(require,module,exports){
var FacetSubsNumber, KEYCODES, nearest, precision,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../../utils/keycodes");

nearest = function(n, v) {
  n = n / v;
  n = Math.round(n) * v;
  return n;
};

precision = function(n, dp) {
  dp = Math.pow(10, dp);
  n = n * dp;
  n = Math.round(n);
  n = n / dp;
  return n;
};

FacetSubsNumber = (function(superClass) {
  extend(FacetSubsNumber, superClass);

  function FacetSubsNumber() {
    this.setNumber = bind(this.setNumber, this);
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.crement = bind(this.crement, this);
    this.input = bind(this.input, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.focus = bind(this.focus, this);
    this.switchFocus = bind(this.switchFocus, this);
    this.renderResult = bind(this.renderResult, this);
    this.render = bind(this.render, this);
    this.events = bind(this.events, this);
    return FacetSubsNumber.__super__.constructor.apply(this, arguments);
  }

  FacetSubsNumber.prototype.template = require("../../tmpls/number.jade");

  FacetSubsNumber.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup input#" + this.cid] = "input",
      obj["keydown input#" + this.cid] = "input",
      obj["change select#" + this.cid + "op"] = "switchFocus",
      obj
    );
  };

  FacetSubsNumber.prototype.render = function() {
    var ref;
    FacetSubsNumber.__super__.render.apply(this, arguments);
    if ((ref = this.model.get("operators")) != null ? ref.length : void 0) {
      this.$inpOp = this.$el.find("select#" + this.cid + "op");
    }
  };

  FacetSubsNumber.prototype.renderResult = function() {
    var _res, _s;
    _res = this.getResults();
    _s = "<li>";
    if (_res.operator != null) {
      _s += _res.operator + " ";
    }
    _s += _res.value;
    _s += "</li>";
    return _s;
  };

  FacetSubsNumber.prototype.switchFocus = function(type) {
    if (type == null) {
      type = "in";
    }
    if (type === "op") {
      this.focus();
    } else {
      this.focus(true);
    }
  };

  FacetSubsNumber.prototype.focus = function(inp) {
    if (inp == null) {
      inp = false;
    }
    if (inp || (this.$inpOp == null)) {
      FacetSubsNumber.__super__.focus.apply(this, arguments);
      return;
    }
    this.$inpOp.focus();
  };

  FacetSubsNumber.prototype.getTemplateData = function() {
    return _.extend(FacetSubsNumber.__super__.getTemplateData.apply(this, arguments), {
      operators: this.model.get("operators")
    });
  };

  FacetSubsNumber.prototype.input = function(evnt) {
    var _v;
    if (evnt.type === "keydown") {
      console.log("EVNT", evnt.keyCode);
      switch (evnt.keyCode) {
        case KEYCODES.UP:
          this.crement(this.model.get("step"));
          return;
        case KEYCODES.DOWN:
          this.crement(this.model.get("step") * -1);
          return;
        case KEYCODES.RIGHT:
          this.switchFocus("in");
          return;
        case KEYCODES.LEFT:
          this.switchFocus("op");
          return;
        case KEYCODES.ENTER:
          this.select();
          return;
      }
    }
    if (evnt.type === "keyup") {
      _v = evnt.currentTarget.value.replace(/\D/gi, "");
      _v = parseInt(_v, 10);
      this.setNumber(_v);
    }
  };

  FacetSubsNumber.prototype.crement = function(change) {
    var _v;
    _v = this.$inp.val();
    if (!(_v != null ? _v.length : void 0)) {
      _v = this.model.get("value");
    } else {
      _v = parseInt(_v, 10);
    }
    this.setNumber(_v + change);
  };

  FacetSubsNumber.prototype.getResults = function() {
    var _ret;
    if (this.$inpOp != null) {
      _ret = {
        value: this.getValue(),
        operator: this.$inpOp.val()
      };
    } else {
      _ret = {
        value: this.getValue()
      };
    }
    return _ret;
  };

  FacetSubsNumber.prototype.getValue = function() {
    var _v;
    _v = this.$inp.val();
    return parseInt(_v, 10);
  };

  FacetSubsNumber.prototype.setNumber = function(_v) {
    var _max, _min, _step;
    if (isNaN(_v)) {
      this.$inp.val("");
      return;
    }
    _max = this.model.get("max");
    _min = this.model.get("min");
    _step = this.model.get("step");
    this.$inp.val(this.valueByDefinition(_v, _min, _max, _step));
  };

  FacetSubsNumber.prototype.valueByDefinition = function(_value, min, max, step) {
    var _precision, _tmp;
    if (min > max) {
      _tmp = min;
      min = max;
      max = _tmp;
    }
    if (_value < min) {
      return min;
    }
    if (_value > max) {
      return max;
    }
    if (step !== 1) {
      _value = nearest(_value, step);
    }
    _precision = Math.max(0, Math.ceil(Math.log(1 / step) / Math.log(10)));
    if (_precision > 0) {
      _value = precision(_value, _precision);
    } else {
      _value = Math.round(_value);
    }
    return _value;
  };

  return FacetSubsNumber;

})(require("./base"));

module.exports = FacetSubsNumber;



},{"../../tmpls/number.jade":9,"../../utils/keycodes":14,"./base":15}],18:[function(require,module,exports){
var FacetSubString, StringOption, StringOptions, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubResults = require("../../models/subresults");

StringOption = (function(superClass) {
  extend(StringOption, superClass);

  function StringOption() {
    this.match = bind(this.match, this);
    return StringOption.__super__.constructor.apply(this, arguments);
  }

  StringOption.prototype.match = function(crit) {
    var _s, found;
    _s = this.get("value") + " " + this.get("label");
    found = _s.toLowerCase().indexOf(crit.toLowerCase());
    return found >= 0;
  };

  return StringOption;

})(SubResults.prototype.model);

StringOptions = (function(superClass) {
  extend(StringOptions, superClass);

  function StringOptions() {
    return StringOptions.__super__.constructor.apply(this, arguments);
  }

  StringOptions.prototype.model = StringOption;

  return StringOptions;

})(SubResults);

FacetSubString = (function(superClass) {
  extend(FacetSubString, superClass);

  FacetSubString.prototype.optDefault = {
    name: "-",
    value: "-",
    group: null
  };

  FacetSubString.prototype.optColl = StringOptions;

  function FacetSubString(options) {
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this.getResults = bind(this.getResults, this);
    options.custom = true;
    this.collection = this._createOptionCollection(options.model.get("options"));
    FacetSubString.__super__.constructor.call(this, options);
    return;
  }

  FacetSubString.prototype.getResults = function() {
    var ref;
    return {
      value: (ref = this.result.first()) != null ? ref.id : void 0
    };
  };

  FacetSubString.prototype._createOptionCollection = function(options) {
    var _opts, i, len, opt;
    if (_.isFunction(options)) {
      return options(this._createOptionCollection);
    }
    _opts = [];
    for (i = 0, len = options.length; i < len; i++) {
      opt = options[i];
      if (_.isString(opt) || _.isNumber(opt)) {
        _opts.push({
          value: opt,
          label: opt,
          group: null
        });
      } else if (_.isObject()) {
        _opts.push(_.extend({}, this.optDefault, opt));
      }
    }
    return new this.optColl(_opts);
  };

  return FacetSubString;

})(require("../selector"));

module.exports = FacetSubString;



},{"../../models/subresults":8,"../selector":20}],19:[function(require,module,exports){
var KEYCODES, MainView, SelectorView, SubView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

SubView = require("./sub");

SelectorView = require("./selector");

KEYCODES = require("../utils/keycodes");

MainView = (function(superClass) {
  extend(MainView, superClass);

  function MainView() {
    this.addFacet = bind(this.addFacet, this);
    this.remFacet = bind(this.remFacet, this);
    this.exit = bind(this.exit, this);
    this._onKey = bind(this._onKey, this);
    this._addFacet = bind(this._addFacet, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.template = require("../tmpls/wrapper.jade");

  MainView.prototype.className = "iggy clearfix";

  MainView.prototype.events = {
    "click .add-facet-btn": "_addFacet",
    "click": "_addFacet"
  };

  MainView.prototype.initialize = function(options) {
    this.results = options.results;
    this.collection.on("iggy:rem", this.remFacet);
    this.el.className += this.className;
    this.render();
    $(document).on("keyup", this._onKey);
  };

  MainView.prototype.render = function() {
    this.$el.html(this.template());
  };

  MainView.prototype._addFacet = function(evnt) {
    this.addFacet();
  };

  MainView.prototype._onKey = function(evnt) {
    var ref;
    if (ref = evnt.keyCode, indexOf.call(KEYCODES.ESC, ref) >= 0) {
      this.exit();
      return;
    }
  };

  MainView.prototype.exit = function() {
    if (this.selectview) {
      this.selectview.remove();
      this.selectview = null;
    }
    if (this.subview) {
      this.subview.remove();
      this.subview = null;
    }
  };

  MainView.prototype.remFacet = function(facetM) {
    this.results.remove(facetM.get("name"));
  };

  MainView.prototype.addFacet = function() {
    if (this.selectview != null) {
      this.selectview.focus();
      return;
    }
    if (this.subview != null) {
      this.subview.focus();
      return;
    }
    if (!this.collection.length) {
      return;
    }
    this.selectview = new SelectorView({
      collection: this.collection,
      custom: false
    });
    this.$el.append(this.selectview.render());
    this.selectview.focus();
    this.selectview.on("closed", (function(_this) {
      return function(results) {
        _this.selectview.off();
        _this.selectview.remove();
        _this.selectview = null;
      };
    })(this));
    this.selectview.on("selected", (function(_this) {
      return function(facetM) {
        _this.subview = new SubView({
          model: facetM,
          collection: _this.collection
        });
        _this.$el.append(_this.subview.render());
        _this.subview.open();
        _this.subview.on("closed", function(results) {
          _this.subview.off();
          if (!(results != null ? results.length : void 0)) {
            _this.subview.remove();
          }
          _this.subview = null;
        });
        _this.subview.on("selected", function(facetM, results) {
          _this.collection.remove(facetM);
          _this.results.add(_.extend(results, {
            name: facetM.get("name"),
            type: facetM.get("type")
          }), {
            merge: true,
            parse: true,
            _facet: facetM
          });
        });
      };
    })(this));
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;



},{"../tmpls/wrapper.jade":13,"../utils/keycodes":14,"./selector":20,"./sub":21}],20:[function(require,module,exports){
var KEYCODES, SelectorView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../utils/keycodes");

SelectorView = (function(superClass) {
  extend(SelectorView, superClass);

  SelectorView.prototype.template = require("../tmpls/selector.jade");

  SelectorView.prototype.templateEl = require("../tmpls/selectorli.jade");

  SelectorView.prototype.multiSelect = false;

  SelectorView.prototype.className = function() {
    var cls;
    cls = ["add-facet"];
    if (this.custom) {
      cls.push("custom");
    }
    return cls.join(" ");
  };

  SelectorView.prototype.events = function() {
    var obj;
    return (
      obj = {
        "mousedown a": "_onClick"
      },
      obj["focus input#" + this.cid] = "open",
      obj["blur input#" + this.cid] = "close",
      obj["keydown input#" + this.cid] = "search",
      obj["keyup input#" + this.cid] = "search",
      obj
    );
  };

  function SelectorView(options) {
    this.select = bind(this.select, this);
    this.move = bind(this.move, this);
    this.search = bind(this.search, this);
    this.focus = bind(this.focus, this);
    this.selected = bind(this.selected, this);
    this._onClick = bind(this._onClick, this);
    this.checkOptionsEmpty = bind(this.checkOptionsEmpty, this);
    this.renderRes = bind(this.renderRes, this);
    this.render = bind(this.render, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.initialize = bind(this.initialize, this);
    this.events = bind(this.events, this);
    this.className = bind(this.className, this);
    this.custom = options.custom || false;
    this.activeIdx = this.custom ? -1 : 0;
    this.currQuery = "";
    SelectorView.__super__.constructor.apply(this, arguments);
    return;
  }

  SelectorView.prototype.initialize = function(options) {
    this.searchcoll = this.collection.sub(function() {
      return true;
    });
    this.result = new this.collection.constructor();
    this.on("selected", (function(_this) {
      return function(result) {
        _this.searchcoll.remove(result);
        _this.result.add(result);
      };
    })(this));
    this.listenTo(this.searchcoll, "remove", this.renderRes);
    this.listenTo(this.searchcoll, "remove", this.checkOptionsEmpty);
  };

  SelectorView.prototype.getTemplateData = function() {
    return _.extend(SelectorView.__super__.getTemplateData.apply(this, arguments), {
      custom: this.custom
    });
  };

  SelectorView.prototype.render = function() {
    SelectorView.__super__.render.apply(this, arguments);
    this.$list = this.$el.find("#" + this.cid + "typelist");
    this.renderRes();
    return this.el;
  };

  SelectorView.prototype.renderRes = function() {
    var _id, _lbl, _list, i, idx, len, model, ref, ref1;
    this.$list.empty();
    _list = [];
    ref = this.searchcoll.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _lbl = model.getLabel();
      _id = model.id;
      if (((ref1 = this.currQuery) != null ? ref1.length : void 0) > 1) {
        _lbl = _lbl.replace(new RegExp(this.currQuery, "gi"), (function(str) {
          return "<b>" + str + "</b>";
        }));
      }
      _list.push({
        label: _lbl,
        id: _id
      });
    }
    this.$list.append(this.templateEl({
      list: _list,
      query: this.currQuery,
      activeIdx: this.activeIdx,
      custom: this.custom
    }));
    return this.$list;
  };

  SelectorView.prototype.checkOptionsEmpty = function() {};

  SelectorView.prototype._onClick = function(evnt) {
    var _id;
    evnt.stopPropagation();
    evnt.preventDefault();
    _id = this.$(evnt.currentTarget).data("id");
    this.trigger("selected", this.collection.get(_id));
    if (!this.multiSelect) {
      this.close();
    }
    return false;
  };

  SelectorView.prototype.selected = function() {};

  SelectorView.prototype.focus = function() {
    this.$inp.focus();
  };

  SelectorView.prototype.search = function(evnt) {
    var _q;
    if (evnt.type === "keydown") {
      switch (evnt.keyCode) {
        case KEYCODES.UP:
          this.move(true);
          return;
        case KEYCODES.DOWN:
          this.move(false);
          return;
        case KEYCODES.ENTER:
          this.select();
          return;
      }
      return;
    }
    _q = evnt.currentTarget.value.toLowerCase();
    if (_q === this.currQuery) {
      return;
    }
    this.currQuery = _q;
    this.searchcoll.updateSubFilter(function(mdl) {
      var _match;
      if (!(_q != null ? _q.length : void 0)) {
        return true;
      }
      _match = mdl.match(_q);
      return _match;
    }, false);
    this.renderRes();
  };

  SelectorView.prototype.move = function(up) {
    var _list, _newidx, _top;
    if (up == null) {
      up = false;
    }
    _top = (this.custom ? -1 : 0);
    if (up) {
      if ((this.activeIdx - 1) < _top) {
        return;
      }
      _newidx = this.activeIdx - 1;
    } else {
      if (this.searchcoll.length <= this.activeIdx + 1) {
        return;
      }
      _newidx = this.activeIdx + 1;
    }
    _list = this.$el.find(".typelist a");
    this.$(_list[this.activeIdx]).removeClass("active");
    this.$(_list[_newidx]).addClass("active");
    this.activeIdx = _newidx;
  };

  SelectorView.prototype.select = function() {
    if (this.activeIdx >= 0 && this.searchcoll.length) {
      this.trigger("selected", this.collection.at(this.activeIdx));
    } else {
      this.trigger("selected", new this.collection.model({
        value: this.currQuery,
        custom: true
      }));
    }
    if (!this.multiSelect) {
      this.close();
    }
  };

  return SelectorView;

})(require("./facets/base"));

module.exports = SelectorView;



},{"../tmpls/selector.jade":10,"../tmpls/selectorli.jade":11,"../utils/keycodes":14,"./facets/base":15}],21:[function(require,module,exports){
var ViewSub,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewSub = (function(superClass) {
  extend(ViewSub, superClass);

  function ViewSub() {
    this.open = bind(this.open, this);
    this.focus = bind(this.focus, this);
    this.isOpen = bind(this.isOpen, this);
    this.selected = bind(this.selected, this);
    this.del = bind(this.del, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    return ViewSub.__super__.constructor.apply(this, arguments);
  }

  ViewSub.prototype.template = require("../tmpls/sub.jade");

  ViewSub.prototype.className = "sub";

  ViewSub.prototype.initialize = function() {
    this.result = new Backbone.Collection();
  };

  ViewSub.prototype.events = {
    "click .rm-facet-btn": "del"
  };

  ViewSub.prototype.render = function(optMdl) {
    var _list, i, idx, len, model, ref;
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _list.push(model.getLabel());
    }
    this.$el.html(this.template({
      label: this.model.getLabel(),
      selected: _list
    }));
    this.$sub = this.$(".subselect");
    this.$results = this.$(".subresults");
    return this.el;
  };

  ViewSub.prototype.del = function(evnt) {
    evnt.stopPropagation();
    evnt.preventDefault();
    this.collection.trigger("iggy:rem", this.model);
    this.collection.add(this.model);
    this.remove();
    return false;
  };

  ViewSub.prototype.selected = function(optMdl) {
    this.result.add(optMdl);
    this.$results.html(this.selectview.renderResult());
    this.trigger("selected", this.model, this.selectview.getResults());
  };

  ViewSub.prototype.isOpen = function() {
    return this.selectview != null;
  };

  ViewSub.prototype.focus = function() {
    var ref;
    if (this.selectview != null) {
      if ((ref = this.selectview) != null) {
        ref.focus();
      }
      return;
    }
    this.open();
  };

  ViewSub.prototype.open = function() {
    this.selectview = new this.model.SubView({
      model: this.model,
      el: this.$sub
    });
    this.$el.append(this.selectview.render());
    this.selectview.focus();
    this.selectview.on("closed", (function(_this) {
      return function(result) {
        _this.selectview.off();
        if (!result.length) {
          _this.selectview.remove();
        }
        _this.trigger("closed", result);
        if (!result.length) {
          _this.remove();
        }
      };
    })(this));
    this.selectview.on("selected", (function(_this) {
      return function(mdl) {
        if (mdl) {
          _this.selected(mdl);
        }
      };
    })(this));
  };

  return ViewSub;

})(Backbone.View);

module.exports = ViewSub;



},{"../tmpls/sub.jade":12}],22:[function(require,module,exports){

},{}],23:[function(require,module,exports){
(function (global){
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return (Array.isArray(val) ? val.map(joinClasses) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(nulls).join(' ');
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};


exports.style = function (val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return val;
  }
};
/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if (key === 'style') {
    val = exports.style(val);
  }
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    if (JSON.stringify(val).indexOf('&') !== -1) {
      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
                   'will be escaped to `&amp;`');
    };
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will eliminate the double quotes around dates in ' +
                   'ISO form after 2.0.0');
    }
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"fs":22}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvcmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvc3VicmVzdWx0cy5jb2ZmZWUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N1Yi5qYWRlIiwiX3NyYy9qcy90bXBscy93cmFwcGVyLmphZGUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3ViYXJyYXkuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1Ym51bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc3ViLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvamFkZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwrREFBQTtFQUFBOzs2QkFBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLGNBQVQsQ0FBWCxDQUFBOztBQUFBLE1BQ0EsR0FBUyxPQUFBLENBQVMsdUJBQVQsQ0FEVCxDQUFBOztBQUFBLFNBRUEsR0FBWSxPQUFBLENBQVMsdUJBQVQsQ0FGWixDQUFBOztBQUFBLFFBR0EsR0FBVyxPQUFBLENBQVMsc0JBQVQsQ0FIWCxDQUFBOztBQUFBLFNBSUEsR0FBWSxPQUFBLENBQVMsdUJBQVQsQ0FKWixDQUFBOztBQUFBLE9BS0EsR0FBVSxPQUFBLENBQVMsa0JBQVQsQ0FMVixDQUFBOztBQUFBO0FBUUMsMEJBQUEs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aUJBQUE7O0dBRHFCLFFBQVEsQ0FBQyxLQUEvQixDQUFBOztBQUFBLE1BaUVNLENBQUMsT0FBUCxHQUFpQixPQWpFakIsQ0FBQTs7Ozs7QUNBQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTWFpblZpZXcgPSByZXF1aXJlKCBcIi4vdmlld3MvbWFpblwiIClcbkZhY2V0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuRmN0U3RyaW5nID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zdHJpbmdcIiApXG5GY3RBcnJheSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfYXJyYXlcIiApXG5GY3ROdW1iZXIgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X251bWJlclwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0bmV3IE1haW5WaWV3KCBlbDogQCRlbCwgY29sbGVjdGlvbjogQGZhY2V0cywgcmVzdWx0czogQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRWw6ICggZWwgKT0+XG5cblx0XHRpZiBub3QgZWw/XG5cdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVNSVNTSU5HRUxcIiApXG5cblx0XHRpZiBfLmlzU3RyaW5nKCBlbCApXG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxTVFJJTkdcIiApXG5cblx0XHRcdF8kZWwgPSBAJCggZWwgKVxuXHRcdFx0aWYgbm90IF8kZWw/Lmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxTVFJJTkdcIiApXG5cblx0XHRcdHJldHVybiBfJGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIGpRdWVyeVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMSlFVRVJZXCIgKVxuXG5cdFx0XHQjIFRPRE8gaGFuZGxlIG11bHRpcGxlIGpRdWVyeSBlbGVtZW50cyB0byBJR0dZIGluc3RhbmNlc1xuXHRcdFx0aWYgZWwubGVuZ3RoID4gMVxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVTSVpFRUxKUVVFUllcIiApXG5cblx0XHRcdHJldHVybiBlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBFbGVtZW50XG5cdFx0XHRyZXR1cm4gQCQoIGVsIClcblxuXHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFRZUEVcIiApXG5cblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUZhY2V0czogKCBmYWNldHMgKT0+XG5cdFx0X3JldCA9IFtdXG5cdFx0Zm9yIGZhY2V0IGluIGZhY2V0cyB3aGVuICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdF9yZXQucHVzaCBfZmN0XG5cblx0XHRyZXR1cm4gbmV3IEZhY2V0cyggX3JldCApXG5cblx0X2NyZWF0ZUZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdHN3aXRjaCBmYWNldC50eXBlLnRvTG93ZXJDYXNlKClcblx0XHRcdHdoZW4gXCJzdHJpbmdcIiB0aGVuIHJldHVybiBuZXcgRmN0U3RyaW5nKCBmYWNldCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCApXG5cblx0YWRkRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0aWYgbm90IEBmYWNldHM/XG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRAZmFjZXRzLmFkZCggX2ZjdCApXG5cdFx0cmV0dXJuIEBcblxuXHRfZXJyb3I6ICggdHlwZSwgZGF0YSA9IHt9ICk9PlxuXHRcdGlmIEBlcnJvcnNbIHR5cGUgXT9cblx0XHRcdF9tc2cgPSBAZXJyb3JzWyB0eXBlIF0oIGRhdGEgKVxuXHRcdGVsc2Vcblx0XHRcdF9tc2cgPSBcIi1cIlxuXHRcdF9lcnIgPSBuZXcgRXJyb3IoKVxuXHRcdF9lcnIubmFtZSA9IHR5cGVcblx0XHRfZXJyLm1lc3NhZ2UgPSBfbXNnXG5cdFx0cmV0dXJuIF9lcnJcblxuXHRnZXRRdWVyeTogPT5cblx0XHRyZXR1cm4gQHJlc3VsdHNcblxuXHR0cmlnZ2VyQ2hhbmdlOiA9PlxuXHRcdEB0cmlnZ2VyKCBcImNoYW5nZVwiLCBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X2luaXRFcnJvcnM6ID0+XG5cdFx0QGVycm9ycyA9IHt9XG5cdFx0Zm9yIF9rLCBfdG1wbCBvZiBARVJST1JTKClcblx0XHRcdEBlcnJvcnNbIF9rIF0gPSBfLnRlbXBsYXRlKCBfdG1wbCApIFxuXHRcdHJldHVyblxuXG5cdEVSUk9SUzogPT5cblx0XHRcIkVJTlZBTElERUxTVFJJTkdcIjogXCJJZiB5b3UgZGVmaW5lIGEgYGVsYCBhcyBTdHJpbmcgaXQgaGFzIHRvIGJlIGEgdmFsaWQgc2VsZWN0b3IgZm9yIGFuIGV4aXN0aW5nIERPTSBlbGVtZW50LlwiXG5cdFx0XCJFRU1QVFlFTFNUUklOR1wiOiBcIlRoZSBgZWxgIGFzIHN0cmluZyBjYW4gbm90IGJlIGVtcHR5LlwiXG5cdFx0XCJFRU1QVFlFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhbiBlbXB0eSBjb2xsZWN0aW9uLlwiXG5cdFx0XCJFU0laRUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGEgcmVzdWx0IG9mIG9uZSBlbC5cIlxuXHRcdFwiRUlOVkFMSURFTFRZUEVcIjogXCJUaGUgYGVsYCBjYW4gb25seSBiZSBhIHNlbGVjdG9yIHN0cmluZywgZG9tIGVsZW1lbnQgb3IgalF1ZXJ5IGNvbGxlY3Rpb25cIlxuXHRcdFwiRU1JU1NJTkdFTFwiOiBcIlBsZWFzZSBkZWZpbmUgYSB0YXJnZXQgYGVsYFwiXG5cbm1vZHVsZS5leHBvcnRzID0gSUdHWSIsIiMjI1xuRVhBTVBMRSBVU0FHRVxuXG5cdHBhcmVudENvbGwgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbi5TdWIoKVxuXHRcblx0IyBieSBBcnJheVxuXHRzdWJDb2xsQSA9IHBhcmVudENvbGwuc3ViKCBbIDEsIDIsIDMgXSApIFxuXHRcblx0IyBvciBieSBPYmplY3Rcblx0c3ViQ29sbE8gPSBwYXJlbnRDb2xsLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKSBcblx0XG5cdCMgb3IgYnkgTnVtYmVyXG5cdHN1YkNvbGxOID0gcGFyZW50Q29sbC5zdWIoIDEzIClcblx0XG5cdCMgb3IgYnkgRnVuY3Rpb25cblx0c3ViQ29sbEYgPSBwYXJlbnRDb2xsLnN1YiggKCggbW9kZWwgKS0+IGlmIG1vZGVsLmdldCggXCJhZ2VcIiApID4gMjMgKSApXG5cdFxuXHQjIHN1YmNvbGxlY3Rpb24gb2Ygc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQV9PID0gc3ViQ29sbEEuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gRm9yIHRoaXMgYSBgcmVzZXRgIHdpbGwgYmUgZmlyZWQgb24gdGhlIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEEgPSBzdWJDb2xsQS51cGRhdGVTdWJGaWx0ZXIoIHsgbmFtZTogXCJCYXJcIiwgYWdlOiA0MiB9IClcbiMjI1xuXG5jbGFzcyBCYWNrYm9uZVN1YiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0IyMjXG5cdCMjIHN1YlxuXHRcblx0YGNvbGxlY3Rpb24uc3ViKCBmaWx0ZXIgKWBcblx0XG5cdEdlbmVyYXRlIGEgc3ViLWNvbGxlY3Rpb24gYnkgYSBmaWx0ZXIuXG5cdFRoZSBtb2RlbHMgd2lsbCBiZSBkaXN0cmlidXRlZCB3aXRoaW4gYWxsIGludm9sdmVkIGNvbGxlY3Rpb25zIHVuZGVyIGNvbnNpZGVyYXRpb24gb2YgdGhlIGZpbHRlci5cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgQ29sbGVjdGlvbiB9IEEgU3ViLUNvbGxlY3Rpb24gYmFzZWQgb24gdGhlIGZpbHRlclxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHN1YjogKCBmaWx0ZXIgKT0+XG5cdFx0QHN1YkNvbGxzIG9yPSBbXVxuXHRcdGZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClcblxuXHRcdCMgZmlsdGVyIHRoZSBjb2xsZWN0aW9uXG5cdFx0X21vZGVscyA9IEBmaWx0ZXIgZm5GaWx0ZXJcblx0XHQjIGNyZWF0ZSB0aGUgc3ViY29sbGVjdGlvblxuXHRcdF9zdWIgPSBuZXcgQGNvbnN0cnVjdG9yKCBfbW9kZWxzIClcblxuXHRcdF9zdWIuX3BhcmVudENvbCA9IEBcblx0XHRfc3ViLl9mbkZpbHRlciA9IGZuRmlsdGVyXG5cblx0XHQjIGFkZCBldmVudCBoYW5kbGVycyB0byBkaXN0cmlidXRlIHRoZSBtb2RlbHMgdGhyb3VnaCB0aGUgc3ViIGNvbGxlY3Rpb25zIHRyZWVcblxuXHRcdCMgcmVjaGVjayB0aGUgbW9kZWwgYWdhaW5zdCB0aGUgZmlsdGVyIG9uIGNoYW5nZVxuXHRcdEBvbiBcImNoYW5nZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHR0b0FkZCA9IEBfZm5GaWx0ZXIoIF9tICkgXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy4gXG5cdFxuXHRAcmV0dXJuIHsgU2VsZiB9IGl0c2VsZlxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHVwZGF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIsIGFzUmVzZXQgPSB0cnVlICk9PlxuXHRcdGlmIEBfcGFyZW50Q29sP1xuXG5cdFx0XHQjIHNldCB0aGUgbmV3IGZpbHRlciBtZXRob2Rcblx0XHRcdEBfZm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKSBpZiBmaWx0ZXI/XG5cblx0XHRcdF9tb2RlbHMgPSBAX3BhcmVudENvbC5maWx0ZXIoIEBfZm5GaWx0ZXIgKVxuXG5cdFx0XHQjIHJlc2V0IHRoZSBjb2xsZWN0aW9uIHdpdGggdGhlIG5ldyBtb2RlbHNcblx0XHRcdGlmIGFzUmVzZXRcblx0XHRcdFx0QHJlc2V0KCBfbW9kZWxzIClcblx0XHRcdFx0cmV0dXJuIEBcblxuXHRcdFx0bmV3aWRzID0gXy5wbHVjayggX21vZGVscywgXCJjaWRcIiApXG5cdFx0XHRjdXJyaWRzID0gXy5wbHVjayggQG1vZGVscywgXCJjaWRcIiApXG5cdFx0XHRmb3IgcmlkIGluIF8uZGlmZmVyZW5jZSggY3VycmlkcywgbmV3aWRzIClcblx0XHRcdFx0QHJlbW92ZSggcmlkIClcblx0XHRcdFx0XG5cdFx0XHRfYWRkSWRzID0gXy5kaWZmZXJlbmNlKCBuZXdpZHMsIGN1cnJpZHMgKVxuXHRcdFx0Zm9yIG1kbCBpbiBfbW9kZWxzIHdoZW4gbWRsLmNpZCBpbiBfYWRkSWRzXG5cdFx0XHRcdEBhZGQoIG1kbCApXG5cblx0XHRyZXR1cm4gQFxuXG5cblx0IyMjXG5cdCMjIF9nZW5lcmF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24uX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdEludGVybmFsIG1ldGhvZCB0aCBjb252ZXJ0IGEgZmlsdGVyIGFyZ3VtZW50IHRvIGEgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLiBcblx0XG5cdEByZXR1cm4geyBGdW5jdGlvbiB9IFRoZSBnZW5lcmF0ZWQgZmlsdGVyIGZ1bmN0aW9uIFxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICk9PlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICk9PlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKT0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApPT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWIiLCJjbGFzcyBGY3RBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9zdHJpbmdcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YmFycmF5XCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0QXJyYXlcbiIsImNsYXNzIEZhY2V0QmFzZSBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9iYXNlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcIm5hbWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cblx0Y29tcGFyYXRvcjogKCBtZGwgKS0+XG5cdFx0Y29uc29sZS5sb2cgXCJjb21wYXJhdG9yXCIsIG1kbFxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2UiLCJjbGFzcyBGY3ROdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VibnVtYmVyXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0bWluOiAwXG5cdFx0XHRtYXg6IDEwMFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IDUwXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyIiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLCBcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nIiwiY2xhc3MgSWdneVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRkZWZhdWx0czogXG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IG51bGxcblx0XHR2YWx1ZTogbnVsbFxuXG5jbGFzcyBJZ2d5UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0bW9kZWw6IElnZ3lSZXN1bHRcblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyLnZhbHVlID0gX21vZGlmeSggYXR0ci52YWx1ZSApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0cyIsImNsYXNzIEJhc2VSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBAaWRBdHRyaWJ1dGUgKSBvciBcIi1cIlxuXG5cbmNsYXNzIEJhc2VSZXN1bHRzIGV4dGVuZHMgcmVxdWlyZSggXCIuL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEJhc2VSZXN1bHRcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlUmVzdWx0cyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgb3BlcmF0b3JzLCB1bmRlZmluZWQpIHtcbmlmICggb3BlcmF0b3JzICYmIG9wZXJhdG9ycy5sZW5ndGgpXG57XG5idWYucHVzaChcIjxzZWxlY3RcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIm9wXCIsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwib3BlcmF0b3JcXFwiPlwiKTtcbi8vIGl0ZXJhdGUgb3BlcmF0b3JzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wZXJhdG9ycztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3NlbGVjdD5cIik7XG59XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm9wZXJhdG9yc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3JzOnR5cGVvZiBvcGVyYXRvcnMhPT1cInVuZGVmaW5lZFwiP29wZXJhdG9yczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzZWxlY3Rvci1pbnBcXFwiLz48dWxcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcInR5cGVsaXN0XCIsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHlwZWxpc3RcXFwiPjwvdWw+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG5pZiAoIGxpc3QubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBsaXN0XG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IGxpc3Q7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6aWR4ID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6aWR4ID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZSBpZiAoICFjdXN0b20pXG57XG5idWYucHVzaChcIjxsaT48YSBjbGFzcz1cXFwiZW1wdHlyZXNcXFwiPm5vIHJlc3VsdCBmb3IgXFxcIlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9hPjwvbGk+XCIpO1xufX0uY2FsbCh0aGlzLFwiYWN0aXZlSWR4XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5hY3RpdmVJZHg6dHlwZW9mIGFjdGl2ZUlkeCE9PVwidW5kZWZpbmVkXCI/YWN0aXZlSWR4OnVuZGVmaW5lZCxcImN1c3RvbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY3VzdG9tOnR5cGVvZiBjdXN0b20hPT1cInVuZGVmaW5lZFwiP2N1c3RvbTp1bmRlZmluZWQsXCJsaXN0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5saXN0OnR5cGVvZiBsaXN0IT09XCJ1bmRlZmluZWRcIj9saXN0OnVuZGVmaW5lZCxcInF1ZXJ5XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5xdWVyeTp0eXBlb2YgcXVlcnkhPT1cInVuZGVmaW5lZFwiP3F1ZXJ5OnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChsYWJlbCwgc2VsZWN0ZWQsIHVuZGVmaW5lZCkge1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJybS1mYWNldC1idG4gYnRuIGJ0bi1kZWZhdWx0IGJ0bi14c1xcXCI+WDwvZGl2PjxzcGFuPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI6PC9zcGFuPjx1bCBjbGFzcz1cXFwic3VicmVzdWx0c1xcXCI+XCIpO1xuaWYgKCBzZWxlY3RlZCAmJiBzZWxlY3RlZC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIHNlbGVjdGVkXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHNlbGVjdGVkO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PGRpdiBjbGFzcz1cXFwic3Vic2VsZWN0XFxcIj48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJsYWJlbFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubGFiZWw6dHlwZW9mIGxhYmVsIT09XCJ1bmRlZmluZWRcIj9sYWJlbDp1bmRlZmluZWQsXCJzZWxlY3RlZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VsZWN0ZWQ6dHlwZW9mIHNlbGVjdGVkIT09XCJ1bmRlZmluZWRcIj9zZWxlY3RlZDp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwiYWRkLWZhY2V0LWJ0biBidG4gYnRuLWRlZmF1bHQgYnRuLXNtXFxcIj4rPC9kaXY+XCIpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gXG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTMiLCJTdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgRmFjZXRTdWJzQmFzZSBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0Y2lkOiBAY2lkXHRcdFxuXG5cdHJlbmRlcjogPT5cblx0XHRAJGVsLmh0bWwoIEB0ZW1wbGF0ZSggQGdldFRlbXBsYXRlRGF0YSgpICkgKVxuXHRcdEAkaW5wID0gQCRlbC5maW5kKCBcImlucHV0IyN7QGNpZH1cIiApXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcIm9wZW5cIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGlzT3BlbiA9IGZhbHNlXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6ID0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0c2VsZWN0OiA9PlxuXHRcdF9Nb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiBAZ2V0VmFsdWUoKSwgY3VzdG9tOiB0cnVlIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzQmFzZSIsImNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuXG5jbGFzcyBBcnJheU9wdGlvbnMgZXh0ZW5kcyByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBBcnJheU9wdGlvblxuXG5jbGFzcyBGYWNldFN1YkFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL3N1YnN0cmluZ1wiIClcblx0bXVsdGlTZWxlY3Q6IHRydWVcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheSIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvbnVtYmVyLmphZGVcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcImlucHV0XCJcblx0XHRcImNoYW5nZSBzZWxlY3QjI3tAY2lkfW9wXCI6IFwic3dpdGNoRm9jdXNcIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdGlmIEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0XHRAJGlucE9wID0gQCRlbC5maW5kKCBcInNlbGVjdCMje0BjaWR9b3BcIiApXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0c3dpdGNoRm9jdXM6ICggdHlwZT1cImluXCIgKT0+XG5cdFx0aWYgdHlwZSBpcyBcIm9wXCJcblx0XHRcdEBmb2N1cygpXG5cdFx0ZWxzZVxuXHRcdFx0QGZvY3VzKCB0cnVlIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHQjY29uc29sZS5sb2cgXCJmb2N1c1wiLCBpbnAgb3Igbm90IEAkaW5wT3A/LCBpbnAsIG5vdCBAJGlucE9wPywgQCRpbnBPcFxuXHRcdGlmIGlucCBvciBub3QgQCRpbnBPcD9cblx0XHRcdHN1cGVyXG5cdFx0XHRyZXR1cm5cblx0XHRAJGlucE9wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgeyBvcGVyYXRvcnM6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKSB9IClcblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0Y29uc29sZS5sb2cgXCJFVk5UXCIsIGV2bnQua2V5Q29kZVxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSAqIC0xIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5SSUdIVFxuXHRcdFx0XHRcdEBzd2l0Y2hGb2N1cyggXCJpblwiIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5MRUZUXG5cdFx0XHRcdFx0QHN3aXRjaEZvY3VzKCBcIm9wXCIgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5dXBcIlxuXHRcdFx0X3YgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUucmVwbGFjZSggL1xcRC9naSwgXCJcIiApXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXHRcdFx0IFxuXHRcdFx0QHNldE51bWJlciggX3YgKVxuXHRcdHJldHVyblxuXG5cdGNyZW1lbnQ6ICggY2hhbmdlICk9PlxuXHRcdF92ID0gQCRpbnAudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0X3YgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0XHRAc2V0TnVtYmVyKCBfdiArIGNoYW5nZSApXG5cblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRfcmV0ID0gXG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdFx0XHRvcGVyYXRvcjogQCRpbnBPcC52YWwoKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPSBcblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0cmV0dXJuIHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdHNldE51bWJlcjogKCBfdiApPT5cblx0XHRpZiBpc05hTiggX3YgKVxuXHRcdFx0QCRpbnAudmFsKFwiXCIpXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9tYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRfbWluID0gQG1vZGVsLmdldCggXCJtaW5cIiApXG5cdFx0X3N0ZXAgPSBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApXG5cblx0XHRAJGlucC52YWwoIEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YsIF9taW4sIF9tYXgsIF9zdGVwICkgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSwgbWluLCBtYXgsIHN0ZXAgKS0+XG5cdFx0IyBmaXggcmV2ZXJzZWQgbWluL21heCBzZXR0aW5nXG5cdFx0aWYgbWluID4gbWF4XG5cdFx0XHRfdG1wID0gbWluXG5cdFx0XHRtaW4gPSBtYXhcblx0XHRcdG1heCA9IF90bXBcblx0XHRcblx0XHQjIG9uIGV4eGVkZGluZyB0aGUgbGltaXRzIHVzZSB0aGUgbGltaXRcblx0XHRpZiBfdmFsdWUgPCBtaW5cblx0XHRcdHJldHVybiBtaW5cblx0XHRpZiBfdmFsdWUgPiBtYXhcblx0XHRcdHJldHVybiBtYXhcblxuXHRcdCMgc2VhcmNoIHRoZSBuZWFyZXN0IF92YWx1ZSB0byB0aGUgc3RlcFxuXHRcdGlmIHN0ZXAgaXNudCAxXG5cdFx0XHRfdmFsdWUgPSBuZWFyZXN0KCBfdmFsdWUsIHN0ZXAgKVxuXHRcdFxuXHRcdCMgY2FsYyB0aGUgcHJlY2lzaW9uIGJ5IHN0ZXBcblx0XHRfcHJlY2lzaW9uID0gTWF0aC5tYXgoIDAsIE1hdGguY2VpbCggTWF0aC5sb2coIDEvc3RlcCApIC8gTWF0aC5sb2coIDEwICkgKSApXG5cdFx0aWYgX3ByZWNpc2lvbiA+IDBcblx0XHRcdF92YWx1ZSA9IHByZWNpc2lvbiggX3ZhbHVlLCBfcHJlY2lzaW9uIClcblx0XHRlbHNlXG5cdFx0XHRfdmFsdWUgPSBNYXRoLnJvdW5kKCBfdmFsdWUgKVxuXHRcdFx0XG5cdFx0cmV0dXJuIF92YWx1ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5jbGFzcyBGYWNldFN1YlN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdG9wdERlZmF1bHQ6IFxuXHRcdG5hbWU6IFwiLVwiXG5cdFx0dmFsdWU6IFwiLVwiXG5cdFx0Z3JvdXA6IG51bGxcblxuXHRvcHRDb2xsOiBTdHJpbmdPcHRpb25zXG5cblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdG9wdGlvbnMuY3VzdG9tID0gdHJ1ZVxuXHRcdEBjb2xsZWN0aW9uID0gQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBvcHRpb25zLm1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQuZmlyc3QoKT8uaWRcblxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0LCBncm91cDogbnVsbCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3QoICApXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0ICk7XG5cblx0XHRyZXR1cm4gbmV3IEBvcHRDb2xsKCBfb3B0cyApXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJTdHJpbmciLCJTdWJWaWV3ID0gcmVxdWlyZSggXCIuL3N1YlwiIClcblNlbGVjdG9yVmlldyA9IHJlcXVpcmUoIFwiLi9zZWxlY3RvclwiIClcblxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBNYWluVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvd3JhcHBlci5qYWRlXCIgKVxuXHRjbGFzc05hbWU6IFwiaWdneSBjbGVhcmZpeFwiXG5cblx0ZXZlbnRzOiBcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcblxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cblx0XHRAZWwuY2xhc3NOYW1lICs9IEBjbGFzc05hbWVcblx0XHRAcmVuZGVyKClcblx0XHQkKCBkb2N1bWVudCApLm9uIFwia2V5dXBcIiwgQF9vbktleVxuXHRcdHJldHVyblxuXG5cdHJlbmRlcjogPT5cblx0XHRAJGVsLmh0bWwoIEB0ZW1wbGF0ZSgpIClcblx0XHRyZXR1cm5cblxuXHRfYWRkRmFjZXQ6ICggZXZudCApPT5cblx0XHRAYWRkRmFjZXQoKVxuXHRcdHJldHVyblxuXG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdEBleGl0KClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0ZXhpdDogPT5cblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0aWYgQHN1YnZpZXdcblx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRyZXR1cm5cblxuXHRyZW1GYWNldDogKCBmYWNldE0gKT0+XG5cdFx0QHJlc3VsdHMucmVtb3ZlKCBmYWNldE0uZ2V0KCBcIm5hbWVcIiApIClcblx0XHRyZXR1cm5cblxuXHRhZGRGYWNldDogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHRAc3Vidmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSApXG5cblx0XHRAJGVsLmFwcGVuZCggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0gKT0+XG5cblx0XHRcdEBzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uIClcblx0XHRcdEAkZWwuYXBwZW5kKCBAc3Vidmlldy5yZW5kZXIoKSApXG5cdFx0XHRAc3Vidmlldy5vcGVuKClcblxuXHRcdFx0QHN1YnZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0XHRAc3Vidmlldy5vZmYoKVxuXHRcdFx0XHRAc3Vidmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0XHRyZXR1cm4gXG5cblx0XHRcdEBzdWJ2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0sIHJlc3VsdHMgKT0+XG5cdFx0XHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdFx0XHRAcmVzdWx0cy5hZGQoIF8uZXh0ZW5kKCByZXN1bHRzLCB7IG5hbWU6IGZhY2V0TS5nZXQoIFwibmFtZVwiICksIHR5cGU6IGZhY2V0TS5nZXQoIFwidHlwZVwiICkgfSApLCB7IG1lcmdlOiB0cnVlLCBwYXJzZTogdHJ1ZSwgX2ZhY2V0OmZhY2V0TSB9IClcblx0XHRcdFx0I0BzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdCNAc3VidmlldyA9IG51bGxcblxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5WaWV3IiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTZWxlY3RvclZpZXcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRzL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9yLmphZGVcIiApXG5cdHRlbXBsYXRlRWw6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3JsaS5qYWRlXCIgKVxuXHRtdWx0aVNlbGVjdDogZmFsc2VcblxuXHRjbGFzc05hbWU6ID0+XG5cdFx0Y2xzID0gWyBcImFkZC1mYWNldFwiIF1cblx0XHRpZiBAY3VzdG9tXG5cdFx0XHRjbHMucHVzaCBcImN1c3RvbVwiXG5cdFx0cmV0dXJuIGNscy5qb2luKCBcIiBcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwibW91c2Vkb3duIGFcIjogXCJfb25DbGlja1wiXG5cdFx0XCJmb2N1cyBpbnB1dCMje0BjaWR9XCI6IFwib3BlblwiXG5cdFx0XCJibHVyIGlucHV0IyN7QGNpZH1cIjogXCJjbG9zZVwiXG5cdFx0XCJrZXlkb3duIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAY3VzdG9tID0gIG9wdGlvbnMuY3VzdG9tIG9yIGZhbHNlXG5cdFx0QGFjdGl2ZUlkeCA9IGlmIEBjdXN0b20gdGhlbiAtMSBlbHNlIDBcblx0XHRAY3VyclF1ZXJ5ID0gXCJcIlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAc2VhcmNoY29sbCA9IEBjb2xsZWN0aW9uLnN1YiggLT50cnVlIClcblx0XHRAcmVzdWx0ID0gbmV3IEBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yKClcblx0XHRAb24gXCJzZWxlY3RlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggcmVzdWx0IClcblx0XHRcdEByZXN1bHQuYWRkKCByZXN1bHQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0I0BsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwiYWRkXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEBjaGVja09wdGlvbnNFbXB0eSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIGN1c3RvbTogQGN1c3RvbSApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRsaXN0ID0gQCRlbC5maW5kKCBcIiMje0BjaWR9dHlwZWxpc3RcIiApXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdHJlbmRlclJlczogPT5cblx0XHRAJGxpc3QuZW1wdHkoKVxuXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEBzZWFyY2hjb2xsLm1vZGVsc1xuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdF9pZCA9IG1vZGVsLmlkXG5cblx0XHRcdGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCA+IDFcblx0XHRcdFx0X2xibCA9IF9sYmwucmVwbGFjZSggbmV3IFJlZ0V4cCggQGN1cnJRdWVyeSwgXCJnaVwiICksICgoIHN0ciApLT5yZXR1cm4gXCI8Yj4je3N0cn08L2I+XCIgKSApXG5cdFx0XHRfbGlzdC5wdXNoIGxhYmVsOiBfbGJsLCBpZDogX2lkXG5cdFx0QCRsaXN0LmFwcGVuZCggQHRlbXBsYXRlRWwoIGxpc3Q6IF9saXN0LCBxdWVyeTogQGN1cnJRdWVyeSwgYWN0aXZlSWR4OiBAYWN0aXZlSWR4LCBjdXN0b206IEBjdXN0b20gKSApXG5cdFx0cmV0dXJuIEAkbGlzdFxuXG5cdGNoZWNrT3B0aW9uc0VtcHR5OiA9PlxuXHRcdCNpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gMFxuXHRcdCNcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0X29uQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRfaWQgPSBAJCggZXZudC5jdXJyZW50VGFyZ2V0ICkuZGF0YSggXCJpZFwiIClcblx0XHRAdHJpZ2dlciBcInNlbGVjdGVkXCIsIEBjb2xsZWN0aW9uLmdldCggX2lkIClcblx0XHRpZiBub3QgQG11bHRpU2VsZWN0XG5cdFx0XHRAY2xvc2UoKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cblx0c2VsZWN0ZWQ6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QG1vdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAbW92ZSggZmFsc2UgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblxuXHRcdCNAc2VhcmNoLlxuXHRcdF9xID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKClcblx0XHRpZiBfcSBpcyBAY3VyclF1ZXJ5XG5cdFx0XHRyZXR1cm5cblxuXHRcdEBjdXJyUXVlcnkgPSBfcVxuXG5cdFx0QHNlYXJjaGNvbGwudXBkYXRlU3ViRmlsdGVyKCAoIG1kbCApLT5cblx0XHRcdGlmIG5vdCBfcT8ubGVuZ3RoXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRfbWF0Y2ggPSBtZGwubWF0Y2goIF9xIClcblx0XHRcdHJldHVybiBfbWF0Y2hcblx0XHQsIGZhbHNlIClcblxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfdG9wID0gKCBpZiBAY3VzdG9tIHRoZW4gLTEgZWxzZSAwIClcblx0XHRpZiB1cCBcblx0XHRcdGlmICggQGFjdGl2ZUlkeCAtIDEgKSA8IF90b3Bcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCAtIDEgXG5cdFx0ZWxzZSBcblx0XHRcdGlmIEBzZWFyY2hjb2xsLmxlbmd0aCA8PSBAYWN0aXZlSWR4ICsgMVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4ICsgMSBcblxuXHRcdF9saXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhXCIgKVxuXG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0QCQoIF9saXN0WyBfbmV3aWR4IF0gKS5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG5cblx0XHRAYWN0aXZlSWR4ID0gX25ld2lkeFxuXHRcdFxuXHRcdHJldHVyblxuXG5cdHNlbGVjdDogPT5cblx0XHRpZiBAYWN0aXZlSWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBAY29sbGVjdGlvbi5hdCggQGFjdGl2ZUlkeCApXG5cdFx0ZWxzZVxuXHRcdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBAY3VyclF1ZXJ5LCBjdXN0b206IHRydWUgKVxuXG5cdFx0aWYgbm90IEBtdWx0aVNlbGVjdFxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclZpZXciLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiBcInN1YlwiXG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogXG5cdFx0XCJjbGljayAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblxuXHRyZW5kZXI6ICggb3B0TWRsICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cblx0XHRAJGVsLmh0bWwgQHRlbXBsYXRlKCBsYWJlbDogQG1vZGVsLmdldExhYmVsKCksIHNlbGVjdGVkOiBfbGlzdCApXG5cdFx0QCRzdWIgPSBAJCggXCIuc3Vic2VsZWN0XCIgKVxuXHRcdEAkcmVzdWx0cyA9IEAkKCBcIi5zdWJyZXN1bHRzXCIgKVxuXHRcdHJldHVybiBAZWxcblxuXHRkZWw6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRzZWxlY3RlZDogKCBvcHRNZGwgKT0+XG5cdFx0QHJlc3VsdC5hZGQoIG9wdE1kbCApXG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0cmV0dXJuXG5cblx0aXNPcGVuOiA9PlxuXHRcdHJldHVybiBAc2VsZWN0dmlldz9cblxuXHRmb2N1czogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHRAb3BlbigpXG5cdFx0cmV0dXJuXG5cblx0b3BlbjogPT5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBAbW9kZWwuU3ViVmlldyggbW9kZWw6IEBtb2RlbCwgZWw6IEAkc3ViIClcblxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHQgKT0+XG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdCNAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCByZXN1bHQgKVxuXHRcdFx0QHJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBtZGwgKT0+XG5cdFx0XHRpZiBtZGxcblx0XHRcdFx0QHNlbGVjdGVkKCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1N1YiIsbnVsbCwiIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoW10sZSk7ZWxzZXt2YXIgZjtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P2Y9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Zj1nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJihmPXNlbGYpLGYuamFkZT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmVzY2FwZSA9IGZ1bmN0aW9uIGVzY2FwZShodG1sKXtcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiXX0=
