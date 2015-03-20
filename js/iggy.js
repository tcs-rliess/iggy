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
  hasProp = {}.hasOwnProperty;

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
    return IggyResults.__super__.constructor.apply(this, arguments);
  }

  IggyResults.prototype.model = IggyResult;

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
            merge: true
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy9tb2RlbHMvcmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy9tb2RlbHMvc3VicmVzdWx0cy5jb2ZmZWUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N1Yi5qYWRlIiwiX3NyYy9qcy90bXBscy93cmFwcGVyLmphZGUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3ViYXJyYXkuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1Ym51bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvdmlld3Mvc2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvdmlld3Mvc3ViLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvamFkZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwrREFBQTtFQUFBOzs2QkFBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLGNBQVQsQ0FBWCxDQUFBOztBQUFBLE1BQ0EsR0FBUyxPQUFBLENBQVMsdUJBQVQsQ0FEVCxDQUFBOztBQUFBLFNBRUEsR0FBWSxPQUFBLENBQVMsdUJBQVQsQ0FGWixDQUFBOztBQUFBLFFBR0EsR0FBVyxPQUFBLENBQVMsc0JBQVQsQ0FIWCxDQUFBOztBQUFBLFNBSUEsR0FBWSxPQUFBLENBQVMsdUJBQVQsQ0FKWixDQUFBOztBQUFBLE9BS0EsR0FBVSxPQUFBLENBQVMsa0JBQVQsQ0FMVixDQUFBOztBQUFBO0FBUUMsMEJBQUEs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QUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkEsTUFBTSxDQUFDLE9BQVAsR0FDQztBQUFBLEVBQUEsTUFBQSxFQUFRLEVBQVI7QUFBQSxFQUNBLE9BQUEsRUFBUyxFQURUO0FBQUEsRUFFQSxJQUFBLEVBQU0sRUFGTjtBQUFBLEVBR0EsTUFBQSxFQUFRLEVBSFI7QUFBQSxFQUlBLEtBQUEsRUFBTyxDQUFFLEdBQUYsRUFBTyxFQUFQLENBSlA7QUFBQSxFQUtBLE9BQUEsRUFBUyxFQUxUO0NBREQsQ0FBQTs7Ozs7QUNBQSxJQUFBLHlCQUFBO0VBQUE7OzZCQUFBOztBQUFBLFVBQUEsR0FBYSxP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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdE51bWJlciA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfbnVtYmVyXCIgKVxuUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvcmVzdWx0c1wiIClcblxuY2xhc3MgSUdHWSBleHRlbmRzIEJhY2tib25lLkV2ZW50c1xuXHQkOiBqUXVlcnlcblx0Y29uc3RydWN0b3I6ICggZWwsIGZhY2V0cyA9IFtdLCBvcHRpb25zID0ge30gKS0+XG5cdFx0Xy5leHRlbmQgQCwgQmFja2JvbmUuRXZlbnRzXG5cdFx0QF9pbml0RXJyb3JzKClcblx0XHRcblx0XHQjIGluaXQgZWxlbWVudFxuXHRcdEAkZWwgPSBAX3ByZXBhcmVFbCggZWwgKVxuXHRcdEBlbCA9IEAkZWxbMF1cblx0XHRAJGVsLmRhdGEoIFwiaWdneVwiLCBAIClcblxuXHRcdCMgaW5pdCBmYWNldHNcblx0XHRAZmFjZXRzID0gQF9wcmVwYXJlRmFjZXRzKCBmYWNldHMgKVxuXHRcdEByZXN1bHRzID0gbmV3IFJlc3VsdHMoKVxuXG5cdFx0QHJlc3VsdHMub24gXCJhZGRcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcInJlbW92ZVwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwiY2hhbmdlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cblx0XHRuZXcgTWFpblZpZXcoIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cyApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQgaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X3JldC5wdXNoIF9mY3RcblxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0IClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJhcnJheVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RBcnJheSggZmFjZXQgKVxuXHRcdFx0d2hlbiBcIm51bWJlclwiIHRoZW4gcmV0dXJuIG5ldyBGY3ROdW1iZXIoIGZhY2V0IClcblxuXHRhZGRGYWNldDogKCBmYWNldCApPT5cblx0XHRpZiBub3QgQGZhY2V0cz9cblx0XHRcdHJldHVyblxuXHRcdGlmICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdEBmYWNldHMuYWRkKCBfZmN0IClcblx0XHRyZXR1cm4gQFxuXG5cdF9lcnJvcjogKCB0eXBlLCBkYXRhID0ge30gKT0+XG5cdFx0aWYgQGVycm9yc1sgdHlwZSBdP1xuXHRcdFx0X21zZyA9IEBlcnJvcnNbIHR5cGUgXSggZGF0YSApXG5cdFx0ZWxzZVxuXHRcdFx0X21zZyA9IFwiLVwiXG5cdFx0X2VyciA9IG5ldyBFcnJvcigpXG5cdFx0X2Vyci5uYW1lID0gdHlwZVxuXHRcdF9lcnIubWVzc2FnZSA9IF9tc2dcblx0XHRyZXR1cm4gX2VyclxuXG5cdGdldFF1ZXJ5OiA9PlxuXHRcdHJldHVybiBAcmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0QHRyaWdnZXIoIFwiY2hhbmdlXCIsIEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfaW5pdEVycm9yczogPT5cblx0XHRAZXJyb3JzID0ge31cblx0XHRmb3IgX2ssIF90bXBsIG9mIEBFUlJPUlMoKVxuXHRcdFx0QGVycm9yc1sgX2sgXSA9IF8udGVtcGxhdGUoIF90bXBsICkgXG5cdFx0cmV0dXJuXG5cblx0RVJST1JTOiA9PlxuXHRcdFwiRUlOVkFMSURFTFNUUklOR1wiOiBcIklmIHlvdSBkZWZpbmUgYSBgZWxgIGFzIFN0cmluZyBpdCBoYXMgdG8gYmUgYSB2YWxpZCBzZWxlY3RvciBmb3IgYW4gZXhpc3RpbmcgRE9NIGVsZW1lbnQuXCJcblx0XHRcIkVFTVBUWUVMU1RSSU5HXCI6IFwiVGhlIGBlbGAgYXMgc3RyaW5nIGNhbiBub3QgYmUgZW1wdHkuXCJcblx0XHRcIkVFTVBUWUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGFuIGVtcHR5IGNvbGxlY3Rpb24uXCJcblx0XHRcIkVTSVpFRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYSByZXN1bHQgb2Ygb25lIGVsLlwiXG5cdFx0XCJFSU5WQUxJREVMVFlQRVwiOiBcIlRoZSBgZWxgIGNhbiBvbmx5IGJlIGEgc2VsZWN0b3Igc3RyaW5nLCBkb20gZWxlbWVudCBvciBqUXVlcnkgY29sbGVjdGlvblwiXG5cdFx0XCJFTUlTU0lOR0VMXCI6IFwiUGxlYXNlIGRlZmluZSBhIHRhcmdldCBgZWxgXCJcblxubW9kdWxlLmV4cG9ydHMgPSBJR0dZIiwiIyMjXG5FWEFNUExFIFVTQUdFXG5cblx0cGFyZW50Q29sbCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uLlN1YigpXG5cdFxuXHQjIGJ5IEFycmF5XG5cdHN1YkNvbGxBID0gcGFyZW50Q29sbC5zdWIoIFsgMSwgMiwgMyBdICkgXG5cdFxuXHQjIG9yIGJ5IE9iamVjdFxuXHRzdWJDb2xsTyA9IHBhcmVudENvbGwuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApIFxuXHRcblx0IyBvciBieSBOdW1iZXJcblx0c3ViQ29sbE4gPSBwYXJlbnRDb2xsLnN1YiggMTMgKVxuXHRcblx0IyBvciBieSBGdW5jdGlvblxuXHRzdWJDb2xsRiA9IHBhcmVudENvbGwuc3ViKCAoKCBtb2RlbCApLT4gaWYgbW9kZWwuZ2V0KCBcImFnZVwiICkgPiAyMyApIClcblx0XG5cdCMgc3ViY29sbGVjdGlvbiBvZiBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBX08gPSBzdWJDb2xsQS5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBGb3IgdGhpcyBhIGByZXNldGAgd2lsbCBiZSBmaXJlZCBvbiB0aGUgc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQSA9IHN1YkNvbGxBLnVwZGF0ZVN1YkZpbHRlciggeyBuYW1lOiBcIkJhclwiLCBhZ2U6IDQyIH0gKVxuIyMjXG5cbmNsYXNzIEJhY2tib25lU3ViIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHQjIyNcblx0IyMgc3ViXG5cdFxuXHRgY29sbGVjdGlvbi5zdWIoIGZpbHRlciApYFxuXHRcblx0R2VuZXJhdGUgYSBzdWItY29sbGVjdGlvbiBieSBhIGZpbHRlci5cblx0VGhlIG1vZGVscyB3aWxsIGJlIGRpc3RyaWJ1dGVkIHdpdGhpbiBhbGwgaW52b2x2ZWQgY29sbGVjdGlvbnMgdW5kZXIgY29uc2lkZXJhdGlvbiBvZiB0aGUgZmlsdGVyLlxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBDb2xsZWN0aW9uIH0gQSBTdWItQ29sbGVjdGlvbiBiYXNlZCBvbiB0aGUgZmlsdGVyXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0c3ViOiAoIGZpbHRlciApPT5cblx0XHRAc3ViQ29sbHMgb3I9IFtdXG5cdFx0Zm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKVxuXG5cdFx0IyBmaWx0ZXIgdGhlIGNvbGxlY3Rpb25cblx0XHRfbW9kZWxzID0gQGZpbHRlciBmbkZpbHRlclxuXHRcdCMgY3JlYXRlIHRoZSBzdWJjb2xsZWN0aW9uXG5cdFx0X3N1YiA9IG5ldyBAY29uc3RydWN0b3IoIF9tb2RlbHMgKVxuXG5cdFx0X3N1Yi5fcGFyZW50Q29sID0gQFxuXHRcdF9zdWIuX2ZuRmlsdGVyID0gZm5GaWx0ZXJcblxuXHRcdCMgYWRkIGV2ZW50IGhhbmRsZXJzIHRvIGRpc3RyaWJ1dGUgdGhlIG1vZGVscyB0aHJvdWdoIHRoZSBzdWIgY29sbGVjdGlvbnMgdHJlZVxuXG5cdFx0IyByZWNoZWNrIHRoZSBtb2RlbCBhZ2FpbnN0IHRoZSBmaWx0ZXIgb24gY2hhbmdlXG5cdFx0QG9uIFwiY2hhbmdlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdHRvQWRkID0gQF9mbkZpbHRlciggX20gKSBcblx0XHRcdGFkZGVkID0gQGdldCggX20gKT9cblx0XHRcdGlmIGFkZGVkIGFuZCBub3QgdG9BZGRcblx0XHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0ZWxzZSBpZiBub3QgYWRkZWQgYW5kIHRvQWRkXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBiYXNlIGNvbGxlY3Rpb24gb24gYWRkIHRvIHN1YlxuXHRcdF9zdWIub24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gc3ViIGNvbGxlY3Rpb24gb24gYWRkIHRvIGJhc2UgaWYgaXQgbWF0Y2hlcyB0aGUgZmlsdGVyXG5cdFx0QG9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdGlmIEBfZm5GaWx0ZXIoIF9tIClcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRfc3ViLm9uIFwicmVtb3ZlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdCNAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0QG9uIFwicmVtb3ZlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0QG9uIFwicmVzZXRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHVwZGF0ZVN1YkZpbHRlcigpXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBzdG9yZSB0aGUgc3ViY29sbGVjdGlvbiB1bmRlciB0aGUgY3VycmVudCBjb2xsZWN0aW9uXG5cdFx0QHN1YkNvbGxzLnB1c2goIF9zdWIgKVxuXG5cdFx0cmV0dXJuIF9zdWJcblxuXHQjIyNcblx0IyMgdXBkYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi51cGRhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0TWV0aG9kIHRvIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gVGhlbiBhbGwgbW9kZWxzIHdpbGwgYmUgcmVzZXRlIGJ5IHRoZSBuZXcgZmlsdGVyLiBTbyB5b3UgaGF2ZSB0byBsaXN0ZW4gdG8gdGVoIHJlc2V0IGV2ZW50XG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLiBcblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuIFxuXHRcblx0QHJldHVybiB7IEZ1bmN0aW9uIH0gVGhlIGdlbmVyYXRlZCBmaWx0ZXIgZnVuY3Rpb24gXG5cdFxuXHRAYXBpIHByaXZhdGVcblx0IyMjXG5cdF9nZW5lcmF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIgKT0+XG5cdFx0IyBjb25zdHJ1Y3QgdGhlIGZpbHRlciBmdW5jdGlvblxuXHRcdGlmIF8uaXNGdW5jdGlvbiggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzQXJyYXkoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKT0+XG5cdFx0XHRcdF9tLmlkIGluIGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc1N0cmluZyggZmlsdGVyICkgb3IgXy5pc051bWJlciggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApPT5cblx0XHRcdFx0X20uaWQgaXMgZmlsdGVyXG5cdFx0ZWxzZVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICk9PlxuXHRcdFx0XHRmb3IgX25tLCBfdmwgb2YgZmlsdGVyXG5cdFx0XHRcdFx0aWYgX20uZ2V0KCBfbm0gKSBpc250IF92bFxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRyZXR1cm4gZm5GaWx0ZXJcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZVN1YiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBcIm5hbWVcIlxuXHRcdGxhYmVsOiBcIkRlc2NyaXB0aW9uXCJcblxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiIClcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwibmFtZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuXHRjb21wYXJhdG9yOiAoIG1kbCApLT5cblx0XHRjb25zb2xlLmxvZyBcImNvbXBhcmF0b3JcIiwgbWRsXG5cdFx0cmV0dXJuIG1kbC5pZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0QmFzZSIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRtaW46IDBcblx0XHRcdG1heDogMTAwXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogNTBcblxubW9kdWxlLmV4cG9ydHMgPSBGY3ROdW1iZXIiLCJjbGFzcyBGY3RTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic3RyaW5nXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmciLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOiBcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogbnVsbFxuXHRcdHZhbHVlOiBudWxsXG5cbmNsYXNzIElnZ3lSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHRtb2RlbDogSWdneVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lSZXN1bHRzIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiLVwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzIiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCkge1xuaWYgKCBvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYWN0aXZlSWR4LCBjdXN0b20sIGxpc3QsIHF1ZXJ5LCB1bmRlZmluZWQpIHtcbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTppZHggPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTppZHggPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBzZWxlY3RlZCwgdW5kZWZpbmVkKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBidG4gYnRuLWRlZmF1bHQgYnRuLXhzXFxcIj5YPC9kaXY+PHNwYW4+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3RcXFwiPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInNlbGVjdGVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWxlY3RlZDp0eXBlb2Ygc2VsZWN0ZWQhPT1cInVuZGVmaW5lZFwiP3NlbGVjdGVkOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGJ0biBidG4tZGVmYXVsdCBidG4tc21cXFwiPis8L2Rpdj5cIik7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBcblx0XCJMRUZUXCI6IDM3XG5cdFwiUklHSFRcIjogMzlcblx0XCJVUFwiOiAzOFxuXHRcIkRPV05cIjogNDBcblx0XCJFU0NcIjogWyAyMjksIDI3IF1cblx0XCJFTlRFUlwiOiAxMyIsIlN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNCYXNlIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHRpbml0aWFsaXplOiA9PlxuXHRcdEByZXN1bHQgPSBuZXcgU3ViUmVzdWx0cygpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEBpc09wZW4gPSB0cnVlXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRjaWQ6IEBjaWRcdFx0XG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCBAZ2V0VGVtcGxhdGVEYXRhKCkgKSApXG5cdFx0QCRpbnAgPSBAJGVsLmZpbmQoIFwiaW5wdXQjI3tAY2lkfVwiIClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwib3BlblwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAaXNPcGVuID0gZmFsc2Vcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQGdldFZhbHVlKClcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogPT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpLCBjdXN0b206IHRydWUgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNCYXNlIiwiY2xhc3MgQXJyYXlPcHRpb24gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBcIm5hbWVcIiApIG9yIFwiLVwiXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cbmNsYXNzIEFycmF5T3B0aW9ucyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEFycmF5T3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViQXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vc3Vic3RyaW5nXCIgKVxuXHRtdWx0aVNlbGVjdDogdHJ1ZVxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YkFycmF5IiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5uZWFyZXN0ID0gKG4sIHYpLT5cblx0biA9IG4gLyB2XG5cdG4gPSBNYXRoLnJvdW5kKG4pICogdlxuXHRyZXR1cm4gblxuXHRcbnByZWNpc2lvbiA9IChuLCBkcCktPlxuXHRkcCA9IE1hdGgucG93KDEwLCBkcClcblx0biA9IG4gKiBkcFxuXHRuID0gTWF0aC5yb3VuZChuKVxuXHRuID0gbiAvIGRwXG5cdHJldHVybiBuXG5cbmNsYXNzIEZhY2V0U3Vic051bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwiaW5wdXRcIlxuXHRcdFwiY2hhbmdlIHNlbGVjdCMje0BjaWR9b3BcIjogXCJzd2l0Y2hGb2N1c1wiXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRzd2l0Y2hGb2N1czogKCB0eXBlPVwiaW5cIiApPT5cblx0XHRpZiB0eXBlIGlzIFwib3BcIlxuXHRcdFx0QGZvY3VzKClcblx0XHRlbHNlXG5cdFx0XHRAZm9jdXMoIHRydWUgKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdCNjb25zb2xlLmxvZyBcImZvY3VzXCIsIGlucCBvciBub3QgQCRpbnBPcD8sIGlucCwgbm90IEAkaW5wT3A/LCBAJGlucE9wXG5cdFx0aWYgaW5wIG9yIG5vdCBAJGlucE9wP1xuXHRcdFx0c3VwZXJcblx0XHRcdHJldHVyblxuXHRcdEAkaW5wT3AuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCB7IG9wZXJhdG9yczogQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApIH0gKVxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRjb25zb2xlLmxvZyBcIkVWTlRcIiwgZXZudC5rZXlDb2RlXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApICogLTEgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlJJR0hUXG5cdFx0XHRcdFx0QHN3aXRjaEZvY3VzKCBcImluXCIgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkxFRlRcblx0XHRcdFx0XHRAc3dpdGNoRm9jdXMoIFwib3BcIiApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvXFxEL2dpLCBcIlwiIClcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cdFx0XHQgXG5cdFx0XHRAc2V0TnVtYmVyKCBfdiApXG5cdFx0cmV0dXJuXG5cblx0Y3JlbWVudDogKCBjaGFuZ2UgKT0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRfdiA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0ZWxzZVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblxuXHRcdEBzZXROdW1iZXIoIF92ICsgY2hhbmdlIClcblxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPSBcblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0XHRcdG9wZXJhdG9yOiBAJGlucE9wLnZhbCgpXG5cdFx0ZWxzZVxuXHRcdFx0X3JldCA9IFxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRyZXR1cm4gX3JldFxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF92ID0gQCRpbnAudmFsKClcblx0XHRyZXR1cm4gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0c2V0TnVtYmVyOiAoIF92ICk9PlxuXHRcdGlmIGlzTmFOKCBfdiApXG5cdFx0XHRAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X21heCA9IEBtb2RlbC5nZXQoIFwibWF4XCIgKVxuXHRcdF9taW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRfc3RlcCA9IEBtb2RlbC5nZXQoIFwic3RlcFwiIClcblxuXHRcdEAkaW5wLnZhbCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiwgX21pbiwgX21heCwgX3N0ZXAgKSApXG5cdFx0cmV0dXJuXG5cblx0dmFsdWVCeURlZmluaXRpb246ICggX3ZhbHVlLCBtaW4sIG1heCwgc3RlcCApLT5cblx0XHQjIGZpeCByZXZlcnNlZCBtaW4vbWF4IHNldHRpbmdcblx0XHRpZiBtaW4gPiBtYXhcblx0XHRcdF90bXAgPSBtaW5cblx0XHRcdG1pbiA9IG1heFxuXHRcdFx0bWF4ID0gX3RtcFxuXHRcdFxuXHRcdCMgb24gZXh4ZWRkaW5nIHRoZSBsaW1pdHMgdXNlIHRoZSBsaW1pdFxuXHRcdGlmIF92YWx1ZSA8IG1pblxuXHRcdFx0cmV0dXJuIG1pblxuXHRcdGlmIF92YWx1ZSA+IG1heFxuXHRcdFx0cmV0dXJuIG1heFxuXG5cdFx0IyBzZWFyY2ggdGhlIG5lYXJlc3QgX3ZhbHVlIHRvIHRoZSBzdGVwXG5cdFx0aWYgc3RlcCBpc250IDFcblx0XHRcdF92YWx1ZSA9IG5lYXJlc3QoIF92YWx1ZSwgc3RlcCApXG5cdFx0XG5cdFx0IyBjYWxjIHRoZSBwcmVjaXNpb24gYnkgc3RlcFxuXHRcdF9wcmVjaXNpb24gPSBNYXRoLm1heCggMCwgTWF0aC5jZWlsKCBNYXRoLmxvZyggMS9zdGVwICkgLyBNYXRoLmxvZyggMTAgKSApIClcblx0XHRpZiBfcHJlY2lzaW9uID4gMFxuXHRcdFx0X3ZhbHVlID0gcHJlY2lzaW9uKCBfdmFsdWUsIF9wcmVjaXNpb24gKVxuXHRcdGVsc2Vcblx0XHRcdF92YWx1ZSA9IE1hdGgucm91bmQoIF92YWx1ZSApXG5cdFx0XHRcblx0XHRyZXR1cm4gX3ZhbHVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNOdW1iZXIiLCJTdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgU3RyaW5nT3B0aW9uIGV4dGVuZHMgU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBTdHJpbmdPcHRpb25zIGV4dGVuZHMgU3ViUmVzdWx0c1xuXHRtb2RlbDogU3RyaW5nT3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuLi9zZWxlY3RvclwiIClcblx0b3B0RGVmYXVsdDogXG5cdFx0bmFtZTogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblx0XHRncm91cDogbnVsbFxuXG5cdG9wdENvbGw6IFN0cmluZ09wdGlvbnNcblxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0QGNvbGxlY3Rpb24gPSBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIG9wdGlvbnMubW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5maXJzdCgpPy5pZFxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiBvcHQsIGxhYmVsOiBvcHQsIGdyb3VwOiBudWxsIH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdCggIClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKTtcblxuXHRcdHJldHVybiBuZXcgQG9wdENvbGwoIF9vcHRzIClcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZyIsIlN1YlZpZXcgPSByZXF1aXJlKCBcIi4vc3ViXCIgKVxuU2VsZWN0b3JWaWV3ID0gcmVxdWlyZSggXCIuL3NlbGVjdG9yXCIgKVxuXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIE1haW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy93cmFwcGVyLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJpZ2d5IGNsZWFyZml4XCJcblxuXHRldmVudHM6IFxuXHRcdFwiY2xpY2sgLmFkZC1mYWNldC1idG5cIjogXCJfYWRkRmFjZXRcIlxuXHRcdFwiY2xpY2tcIjogXCJfYWRkRmFjZXRcIlxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXG5cdFx0QGNvbGxlY3Rpb24ub24gXCJpZ2d5OnJlbVwiLCBAcmVtRmFjZXRcblxuXHRcdEBlbC5jbGFzc05hbWUgKz0gQGNsYXNzTmFtZVxuXHRcdEByZW5kZXIoKVxuXHRcdCQoIGRvY3VtZW50ICkub24gXCJrZXl1cFwiLCBAX29uS2V5XG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCkgKVxuXHRcdHJldHVyblxuXG5cdF9hZGRGYWNldDogKCBldm50ICk9PlxuXHRcdEBhZGRGYWNldCgpXG5cdFx0cmV0dXJuXG5cblx0X29uS2V5OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0QGV4aXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRleGl0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcucmVtb3ZlKClcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdHJldHVyblxuXG5cdHJlbUZhY2V0OiAoIGZhY2V0TSApPT5cblx0XHRAcmVzdWx0cy5yZW1vdmUoIGZhY2V0TS5nZXQoIFwibmFtZVwiICkgKVxuXHRcdHJldHVyblxuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBAc3Vidmlldz9cblx0XHRcdEBzdWJ2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBTZWxlY3RvclZpZXcoIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBjdXN0b206IGZhbHNlIClcblxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0QHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpXG5cdFx0XHRAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIGZhY2V0TSApPT5cblxuXHRcdFx0QHN1YnZpZXcgPSBuZXcgU3ViVmlldyggbW9kZWw6IGZhY2V0TSwgY29sbGVjdGlvbjogQGNvbGxlY3Rpb24gKVxuXHRcdFx0QCRlbC5hcHBlbmQoIEBzdWJ2aWV3LnJlbmRlcigpIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXG5cdFx0XHRAc3Vidmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdEBzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRcdHJldHVybiBcblxuXHRcdFx0QHN1YnZpZXcub24gXCJzZWxlY3RlZFwiLCAoIGZhY2V0TSwgcmVzdWx0cyApPT5cblx0XHRcdFx0QGNvbGxlY3Rpb24ucmVtb3ZlKCBmYWNldE0gKVxuXG5cdFx0XHRcdEByZXN1bHRzLmFkZCggXy5leHRlbmQoIHJlc3VsdHMsIHsgbmFtZTogZmFjZXRNLmdldCggXCJuYW1lXCIgKSwgdHlwZTogZmFjZXRNLmdldCggXCJ0eXBlXCIgKSB9ICksIHsgbWVyZ2U6IHRydWUgfSApXG5cdFx0XHRcdCNAc3Vidmlldy5vZmYoKVxuXHRcdFx0XHQjQHN1YnZpZXcgPSBudWxsXG5cblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBNYWluVmlldyIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU2VsZWN0b3JWaWV3IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0cy9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3Rvci5qYWRlXCIgKVxuXHR0ZW1wbGF0ZUVsOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9ybGkuamFkZVwiIClcblx0bXVsdGlTZWxlY3Q6IGZhbHNlXG5cblx0Y2xhc3NOYW1lOiA9PlxuXHRcdGNscyA9IFsgXCJhZGQtZmFjZXRcIiBdXG5cdFx0aWYgQGN1c3RvbVxuXHRcdFx0Y2xzLnB1c2ggXCJjdXN0b21cIlxuXHRcdHJldHVybiBjbHMuam9pbiggXCIgXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRcIm1vdXNlZG93biBhXCI6IFwiX29uQ2xpY2tcIlxuXHRcdFwiZm9jdXMgaW5wdXQjI3tAY2lkfVwiOiBcIm9wZW5cIlxuXHRcdFwiYmx1ciBpbnB1dCMje0BjaWR9XCI6IFwiY2xvc2VcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblx0XHRcImtleXVwIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0QGN1c3RvbSA9ICBvcHRpb25zLmN1c3RvbSBvciBmYWxzZVxuXHRcdEBhY3RpdmVJZHggPSBpZiBAY3VzdG9tIHRoZW4gLTEgZWxzZSAwXG5cdFx0QGN1cnJRdWVyeSA9IFwiXCJcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHNlYXJjaGNvbGwgPSBAY29sbGVjdGlvbi5zdWIoIC0+dHJ1ZSApXG5cdFx0QHJlc3VsdCA9IG5ldyBAY29sbGVjdGlvbi5jb25zdHJ1Y3RvcigpXG5cdFx0QG9uIFwic2VsZWN0ZWRcIiwgKCByZXN1bHQgKT0+XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIHJlc3VsdCApXG5cdFx0XHRAcmVzdWx0LmFkZCggcmVzdWx0IClcblx0XHRcdHJldHVyblxuXHRcdCNAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXG5cdFx0XHRpZiBAY3VyclF1ZXJ5Py5sZW5ndGggPiAxXG5cdFx0XHRcdF9sYmwgPSBfbGJsLnJlcGxhY2UoIG5ldyBSZWdFeHAoIEBjdXJyUXVlcnksIFwiZ2lcIiApLCAoKCBzdHIgKS0+cmV0dXJuIFwiPGI+I3tzdHJ9PC9iPlwiICkgKVxuXHRcdFx0X2xpc3QucHVzaCBsYWJlbDogX2xibCwgaWQ6IF9pZFxuXHRcdEAkbGlzdC5hcHBlbmQoIEB0ZW1wbGF0ZUVsKCBsaXN0OiBfbGlzdCwgcXVlcnk6IEBjdXJyUXVlcnksIGFjdGl2ZUlkeDogQGFjdGl2ZUlkeCwgY3VzdG9tOiBAY3VzdG9tICkgKVxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBAY29sbGVjdGlvbi5nZXQoIF9pZCApXG5cdFx0aWYgbm90IEBtdWx0aVNlbGVjdFxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm4gZmFsc2VcblxuXG5cdHNlbGVjdGVkOiA9PlxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cblx0XHQjQHNlYXJjaC5cblx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKS0+XG5cdFx0XHRpZiBub3QgX3E/Lmxlbmd0aFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0X21hdGNoID0gbWRsLm1hdGNoKCBfcSApXG5cdFx0XHRyZXR1cm4gX21hdGNoXG5cdFx0LCBmYWxzZSApXG5cblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm5cblxuXHRtb3ZlOiAoIHVwID0gZmFsc2UgKT0+XG5cdFx0X3RvcCA9ICggaWYgQGN1c3RvbSB0aGVuIC0xIGVsc2UgMCApXG5cdFx0aWYgdXAgXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxIFxuXHRcdGVsc2UgXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gQGFjdGl2ZUlkeCArIDFcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDEgXG5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblxuXHRcdEAkKCBfbGlzdFsgQGFjdGl2ZUlkeCBdICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXHRcdEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0QGFjdGl2ZUlkeCA9IF9uZXdpZHhcblx0XHRcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6ID0+XG5cdFx0aWYgQGFjdGl2ZUlkeCA+PSAwIGFuZCBAc2VhcmNoY29sbC5sZW5ndGhcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgQGNvbGxlY3Rpb24uYXQoIEBhY3RpdmVJZHggKVxuXHRcdGVsc2Vcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlIClcblxuXHRcdGlmIG5vdCBAbXVsdGlTZWxlY3Rcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3IiwiY2xhc3MgVmlld1N1YiBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc3ViLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJzdWJcIlxuXG5cdGluaXRpYWxpemU6ID0+XG5cdFx0QHJlc3VsdCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKClcblx0XHRyZXR1cm5cblxuXHRldmVudHM6IFxuXHRcdFwiY2xpY2sgLnJtLWZhY2V0LWJ0blwiOiBcImRlbFwiXG5cblx0cmVuZGVyOiAoIG9wdE1kbCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZSggbGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpLCBzZWxlY3RlZDogX2xpc3QgKVxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblx0XHRyZXR1cm4gQGVsXG5cblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdEBjb2xsZWN0aW9uLnRyaWdnZXIoIFwiaWdneTpyZW1cIiwgQG1vZGVsIClcblx0XHRAY29sbGVjdGlvbi5hZGQoIEBtb2RlbCApXG5cdFx0QHJlbW92ZSgpXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQuYWRkKCBvcHRNZGwgKVxuXHRcdEAkcmVzdWx0cy5odG1sKCBAc2VsZWN0dmlldy5yZW5kZXJSZXN1bHQoKSApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQG1vZGVsLCBAc2VsZWN0dmlldy5nZXRSZXN1bHRzKCkgKVxuXHRcdHJldHVyblxuXG5cdGlzT3BlbjogPT5cblx0XHRyZXR1cm4gQHNlbGVjdHZpZXc/XG5cblx0Zm9jdXM6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QG9wZW4oKVxuXHRcdHJldHVyblxuXG5cdG9wZW46ID0+XG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgQG1vZGVsLlN1YlZpZXcoIG1vZGVsOiBAbW9kZWwsIGVsOiBAJHN1YiApXG5cblx0XHRAJGVsLmFwcGVuZCggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0ICk9PlxuXHRcdFx0QHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgcmVzdWx0IClcblx0XHRcdEByZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggbWRsICk9PlxuXHRcdFx0aWYgbWRsXG5cdFx0XHRcdEBzZWxlY3RlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdTdWIiLG51bGwsIiFmdW5jdGlvbihlKXtpZihcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSltb2R1bGUuZXhwb3J0cz1lKCk7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKFtdLGUpO2Vsc2V7dmFyIGY7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz9mPXdpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2Y9Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmJiYoZj1zZWxmKSxmLmphZGU9ZSgpfX0oZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xuICB2YXIgYmMgPSBiWydjbGFzcyddO1xuXG4gIGlmIChhYyB8fCBiYykge1xuICAgIGFjID0gYWMgfHwgW107XG4gICAgYmMgPSBiYyB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XG59XG5cbi8qKlxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpIDpcbiAgICAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKHZhbCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHZhbFtrZXldOyB9KSA6XG4gICAgW3ZhbF0pLmZpbHRlcihudWxscykuam9pbignICcpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuc3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5tYXAoZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgIH0pLmpvaW4oJzsnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgIHZhbCA9IGV4cG9ydHMuc3R5bGUodmFsKTtcbiAgfVxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh2YWwpLmluZGV4T2YoJyYnKSAhPT0gLTEpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgJyArXG4gICAgICAgICAgICAgICAgICAgJ3dpbGwgYmUgZXNjYXBlZCB0byBgJmFtcDtgJyk7XG4gICAgfTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgJ0lTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuXG59LHtcImZzXCI6Mn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XX0se30sWzFdKSgxKVxufSk7Il19
