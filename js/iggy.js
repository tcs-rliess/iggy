(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctDateRange, FctNumber, FctString, IGGY, MainView, Results,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MainView = require("./views/main");

Facets = require("./models/backbone_sub");

FctString = require("./models/facet_string");

FctArray = require("./models/facet_array");

FctNumber = require("./models/facet_number");

FctDateRange = require("./models/facet_daterange");

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
      case "daterange":
        return new FctDateRange(facet);
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



},{"./models/backbone_sub":2,"./models/facet_array":3,"./models/facet_daterange":5,"./models/facet_number":6,"./models/facet_string":7,"./models/results":8,"./views/main":22}],2:[function(require,module,exports){

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



},{"../views/facets/subarray":19,"./facet_string":7}],4:[function(require,module,exports){
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
    return mdl.id;
  };

  return FacetBase;

})(Backbone.Model);

module.exports = FacetBase;



},{"../views/facets/base":17}],5:[function(require,module,exports){
var FctDateRange,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctDateRange = (function(superClass) {
  extend(FctDateRange, superClass);

  function FctDateRange() {
    this.defaults = bind(this.defaults, this);
    return FctDateRange.__super__.constructor.apply(this, arguments);
  }

  FctDateRange.prototype.SubView = require("../views/facets/daterange");

  FctDateRange.prototype.defaults = function() {
    return $.extend(FctDateRange.__super__.defaults.apply(this, arguments), {
      opts: {},
      value: []
    });
  };

  return FctDateRange;

})(require("./facet_base"));

module.exports = FctDateRange;



},{"../views/facets/daterange":18,"./facet_base":4}],6:[function(require,module,exports){
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



},{"../views/facets/subnumber":20,"./facet_base":4}],7:[function(require,module,exports){
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



},{"../views/facets/substring":21,"./facet_base":4}],8:[function(require,module,exports){
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
    var _modify, _name, _type, ref, ref1, ref2;
    _modify = (ref = options._facet) != null ? ref.get("modify") : void 0;
    _name = (ref1 = options._facet) != null ? ref1.get("name") : void 0;
    _type = (ref2 = options._facet) != null ? ref2.get("type") : void 0;
    if ((_modify != null) && _.isFunction(_modify)) {
      attr.value = _modify(attr.value, _name, _type);
    }
    return attr;
  };

  return IggyResults;

})(Backbone.Collection);

module.exports = IggyResults;



},{}],9:[function(require,module,exports){
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



},{"./backbone_sub":2}],10:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"daterange-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":26}],11:[function(require,module,exports){
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
},{"jade/runtime":26}],12:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":26}],13:[function(require,module,exports){
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
},{"jade/runtime":26}],14:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (label, selected, undefined) {
buf.push("<div class=\"rm-facet-btn fa fa-remove\"></div><span class=\"sublabel\">" + (jade.escape((jade_interp = label) == null ? '' : jade_interp)) + ":</span><ul class=\"subresults\">");
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
},{"jade/runtime":26}],15:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");;return buf.join("");
};
},{"jade/runtime":26}],16:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13
};



},{}],17:[function(require,module,exports){
var FacetSubsBase, KEYCODES, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../../utils/keycodes");

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
    this.input = bind(this.input, this);
    this.open = bind(this.open, this);
    this.renderResult = bind(this.renderResult, this);
    this.focus = bind(this.focus, this);
    this.events = bind(this.events, this);
    this.initialize = bind(this.initialize, this);
    return FacetSubsBase.__super__.constructor.apply(this, arguments);
  }

  FacetSubsBase.prototype.initialize = function() {
    this.result = new SubResults();
  };

  FacetSubsBase.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup input#" + this.cid] = "input",
      obj["keydown input#" + this.cid] = "input",
      obj
    );
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

  FacetSubsBase.prototype.input = function(evnt) {
    if (evnt.type === "keydown") {
      switch (evnt.keyCode) {
        case KEYCODES.ENTER:
          this.select();
      }
    }
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



},{"../../models/subresults":9,"../../utils/keycodes":16}],18:[function(require,module,exports){
var FacetSubsDateRange, KEYCODES,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../../utils/keycodes");

FacetSubsDateRange = (function(superClass) {
  extend(FacetSubsDateRange, superClass);

  function FacetSubsDateRange() {
    this.select = bind(this.select, this);
    this.getValue = bind(this.getValue, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this._dateReturn = bind(this._dateReturn, this);
    this.renderResult = bind(this.renderResult, this);
    this.remove = bind(this.remove, this);
    this.focus = bind(this.focus, this);
    this.events = bind(this.events, this);
    this.render = bind(this.render, this);
    return FacetSubsDateRange.__super__.constructor.apply(this, arguments);
  }

  FacetSubsDateRange.prototype.template = require("../../tmpls/daterange.jade");

  FacetSubsDateRange.prototype.render = function() {
    FacetSubsDateRange.__super__.render.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.forcedDateRangeOpts = {
    opens: "right"
  };

  FacetSubsDateRange.prototype.events = function() {};

  FacetSubsDateRange.prototype.focus = function() {
    var _opts, ref;
    if (this.daterangepicker == null) {
      _opts = _.extend({}, this.model.get("opts"), this.forcedDateRangeOpts);
      this.$inp.daterangepicker(_opts, this._dateReturn);
      this.daterangepicker = this.$inp.data("daterangepicker");
      this.$inp.on("cancel.daterangepicker", this.close);
      this.$inp.on("hide.daterangepicker", this.close);
      if ((ref = this.daterangepicker.container) != null) {
        ref.addClass("daterange-iggy");
      }
    } else {
      this.daterangepicker.show();
    }
    return FacetSubsDateRange.__super__.focus.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.remove = function() {
    var ref;
    if ((ref = this.daterangepicker) != null) {
      ref.remove();
    }
    return FacetSubsDateRange.__super__.remove.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.renderResult = function() {
    var _res, _s, _time;
    _res = this.getResults();
    _time = this.model.get("opts").timePicker;
    _s = "<li>";
    _s += this.startDate.format((_time ? "LLLL" : "LL"));
    if (this.endDate != null) {
      _s += " - ";
      _s += this.endDate.format((_time ? "LLLL" : "LL"));
    }
    _s += "</li>";
    return _s;
  };

  FacetSubsDateRange.prototype._dateReturn = function(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.select();
  };

  FacetSubsDateRange.prototype.getTemplateData = function() {
    return FacetSubsDateRange.__super__.getTemplateData.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.getValue = function() {
    var _out;
    _out = [this.startDate.valueOf()];
    if (this.endDate != null) {
      _out.push(this.endDate.valueOf());
    }
    return _out;
  };

  FacetSubsDateRange.prototype.select = function() {
    var _ModelConst, _model;
    _ModelConst = this.getSelectModel();
    _model = new _ModelConst({
      value: this.getValue()
    });
    this.result.add(_model);
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsDateRange;

})(require("./base"));

module.exports = FacetSubsDateRange;



},{"../../tmpls/daterange.jade":10,"../../utils/keycodes":16,"./base":17}],19:[function(require,module,exports){
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



},{"../../models/backbone_sub":2,"./substring":21}],20:[function(require,module,exports){
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



},{"../../tmpls/number.jade":11,"../../utils/keycodes":16,"./base":17}],21:[function(require,module,exports){
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



},{"../../models/subresults":9,"../selector":23}],22:[function(require,module,exports){
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
    this.$addBtn = this.$(".add-facet-btn");
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
    this.$addBtn.before(this.selectview.render());
    this.selectview.focus();
    this.selectview.on("closed", (function(_this) {
      return function(results) {
        _this.selectview.off();
        _this.selectview.remove();
        _this.selectview = null;
        if (!(results != null ? results.length : void 0) && (_this.subview != null)) {
          _this.subview.off();
          _this.subview.remove();
          _this.subview = null;
        }
      };
    })(this));
    this.selectview.on("selected", (function(_this) {
      return function(facetM) {
        _this.subview = new SubView({
          model: facetM,
          collection: _this.collection
        });
        _this.$addBtn.before(_this.subview.render());
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



},{"../tmpls/wrapper.jade":15,"../utils/keycodes":16,"./selector":23,"./sub":24}],23:[function(require,module,exports){
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



},{"../tmpls/selector.jade":12,"../tmpls/selectorli.jade":13,"../utils/keycodes":16,"./facets/base":17}],24:[function(require,module,exports){
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
    this.remove = bind(this.remove, this);
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
    this.trigger("closed");
    return false;
  };

  ViewSub.prototype.remove = function() {
    var ref;
    if ((ref = this.selectview) != null) {
      ref.remove();
    }
    return ViewSub.__super__.remove.apply(this, arguments);
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



},{"../tmpls/sub.jade":14}],25:[function(require,module,exports){

},{}],26:[function(require,module,exports){
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

},{"fs":25}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9zdWJyZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvdG1wbHMvZGF0ZXJhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N1Yi5qYWRlIiwiX3NyYy9qcy90bXBscy93cmFwcGVyLmphZGUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvZGF0ZXJhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VibnVtYmVyLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zdWIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9qYWRlL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDZFQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVCxDQUFYLENBQUE7O0FBQUEsTUFDQSxHQUFTLE9BQUEsQ0FBUyx1QkFBVCxDQURULENBQUE7O0FBQUEsU0FFQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUZaLENBQUE7O0FBQUEsUUFHQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVCxDQUhYLENBQUE7O0FBQUEsU0FJQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUpaLENBQUE7O0FBQUEsWUFLQSxHQUFlLE9BQUEsQ0FBUywwQkFBVCxDQUxmLENBQUE7O0FBQUEsT0FNQSxHQUFVLE9BQUEsQ0FBUyxrQkFBVCxDQU5WLENBQUE7O0FBQUE7QUFTQywwQkFBQSxDQUFBOztBQUFBLGlCQUFBLENBQUEsR0FBRyxNQUFILENBQUE7O0FBQ2EsRUFBQSxjQUFFLEVBQUYsRUFBTSxNQUFOLEVBQW1CLE9BQW5CLEdBQUE7O01BQU0sU0FBUztLQUMzQjs7TUFEK0IsVUFBVTtLQUN6QztBQUFBLHlDQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksUUFBUSxDQUFDLE1BQXJCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBYSxFQUFiLENBSlAsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FMWCxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxNQUFYLEVBQW1CLElBQW5CLENBTkEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsY0FBRCxDQUFpQixNQUFqQixDQVRWLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxPQUFBLENBQUEsQ0FWZixDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxLQUFaLEVBQW1CLElBQUMsQ0FBQSxhQUFwQixDQVpBLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFFBQVosRUFBc0IsSUFBQyxDQUFBLGFBQXZCLENBYkEsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksUUFBWixFQUFzQixJQUFDLENBQUEsYUFBdkIsQ0FkQSxDQUFBO0FBQUEsSUFnQkksSUFBQSxRQUFBLENBQVU7QUFBQSxNQUFBLEVBQUEsRUFBSSxJQUFDLENBQUEsR0FBTDtBQUFBLE1BQVUsVUFBQSxFQUFZLElBQUMsQ0FBQSxNQUF2QjtBQUFBLE1BQStCLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FBekM7S0FBVixDQWhCSixDQUFBO0FBaUJBLFVBQUEsQ0FsQlk7RUFBQSxDQURiOztBQUFBLGlCQXFCQSxVQUFBLEdBQVksU0FBRSxFQUFGLEdBQUE7QUFFWCxRQUFBLElBQUE7QUFBQSxJQUFBLElBQU8sVUFBUDtBQUNDLFlBQU0sSUFBQyxDQUFBLE1BQUQsQ0FBUyxZQUFULENBQU4sQ0FERDtLQUFBO0FBR0EsSUFBQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksRUFBWixDQUFIO0FBQ0MsTUFBQSxJQUFHLENBQUEsRUFBTSxDQUFDLE1BQVY7QUFDQyxjQUFNLElBQUMsQ0FBQSxNQUFELENBQVMsZ0JBQVQsQ0FBTixDQUREO09BQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxJQUFDLENBQUEsQ0FBRCxDQUFJLEVBQUosQ0FIUCxDQUFBO0FBSUEsTUFBQSxJQUFHLENBQUEsZ0JBQUksSUFBSSxDQUFFLGdCQUFiO0FBQ0MsY0FBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGtCQUFULENBQU4sQ0FERDtPQUpBO0FBT0EsYUFBTyxJQUFQLENBUkQ7S0FIQTtBQWFBLElBQUEsSUFBRyxFQUFBLFlBQWMsTUFBakI7QUFDQyxNQUFBLElBQUcsQ0FBQSxFQUFNLENBQUMsTUFBVjtBQUNDLGNBQU0sSUFBQyxDQUFBLE1BQUQsQ0FBUyxnQkFBVCxDQUFOLENBREQ7T0FBQTtBQUlBLE1BQUEsSUFBRyxFQUFFLENBQUMsTUFBSCxHQUFZLENBQWY7QUFDQyxjQUFNLElBQUMsQ0FBQSxNQUFELENBQVMsZUFBVCxDQUFOLENBREQ7T0FKQTtBQU9BLGFBQU8sRUFBUCxDQVJEO0tBYkE7QUF1QkEsSUFBQSxJQUFHLEVBQUEsWUFBYyxPQUFqQjtBQUNDLGFBQU8sSUFBQyxDQUFBLENBQUQsQ0FBSSxFQUFKLENBQVAsQ0FERDtLQXZCQTtBQTBCQSxVQUFNLElBQUMsQ0FBQSxNQUFELENBQVMsZ0JBQVQsQ0FBTixDQTVCVztFQUFBLENBckJaLENBQUE7O0FBQUEsaUJBcURBLGNBQUEsR0FBZ0IsU0FBRSxNQUFGLEdBQUE7QUFDZixRQUFBLHlCQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sRUFBUCxDQUFBO0FBQ0EsU0FBQSx3Q0FBQTt3QkFBQTtVQUF5QjtBQUN4QixRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixDQUFBO09BREQ7QUFBQSxLQURBO0FBSUEsV0FBVyxJQUFBLE1BQUEsQ0FBUSxJQUFSLENBQVgsQ0FMZTtFQUFBLENBckRoQixDQUFBOztBQUFBLGlCQTREQSxZQUFBLEdBQWMsU0FBRSxLQUFGLEdBQUE7QUFDYixZQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBWCxDQUFBLENBQVA7QUFBQSxXQUNNLFFBRE47QUFDb0IsZUFBVyxJQUFBLFNBQUEsQ0FBVyxLQUFYLENBQVgsQ0FEcEI7QUFBQSxXQUVNLE9BRk47QUFFbUIsZUFBVyxJQUFBLFFBQUEsQ0FBVSxLQUFWLENBQVgsQ0FGbkI7QUFBQSxXQUdNLFFBSE47QUFHb0IsZUFBVyxJQUFBLFNBQUEsQ0FBVyxLQUFYLENBQVgsQ0FIcEI7QUFBQSxXQUlNLFdBSk47QUFJdUIsZUFBVyxJQUFBLFlBQUEsQ0FBYyxLQUFkLENBQVgsQ0FKdkI7QUFBQSxLQURhO0VBQUEsQ0E1RGQsQ0FBQTs7QUFBQSxpQkFtRUEsUUFBQSxHQUFVLFNBQUUsS0FBRixHQUFBO0FBQ1QsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFPLG1CQUFQO0FBQ0MsWUFBQSxDQUREO0tBQUE7QUFFQSxJQUFBLElBQUcseUNBQUg7QUFDQyxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFhLElBQWIsQ0FBQSxDQUREO0tBRkE7QUFJQSxXQUFPLElBQVAsQ0FMUztFQUFBLENBbkVWLENBQUE7O0FBQUEsaUJBMEVBLE1BQUEsR0FBUSxTQUFFLElBQUYsRUFBUSxJQUFSLEdBQUE7QUFDUCxRQUFBLFVBQUE7O01BRGUsT0FBTztLQUN0QjtBQUFBLElBQUEsSUFBRyx5QkFBSDtBQUNDLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFRLENBQUEsSUFBQSxDQUFULENBQWlCLElBQWpCLENBQVAsQ0FERDtLQUFBLE1BQUE7QUFHQyxNQUFBLElBQUEsR0FBTyxHQUFQLENBSEQ7S0FBQTtBQUFBLElBSUEsSUFBQSxHQUFXLElBQUEsS0FBQSxDQUFBLENBSlgsQ0FBQTtBQUFBLElBS0EsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUxaLENBQUE7QUFBQSxJQU1BLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFOZixDQUFBO0FBT0EsV0FBTyxJQUFQLENBUk87RUFBQSxDQTFFUixDQUFBOztBQUFBLGlCQW9GQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1QsV0FBTyxJQUFDLENBQUEsT0FBUixDQURTO0VBQUEsQ0FwRlYsQ0FBQTs7QUFBQSxpQkF1RkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNkLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBVSxRQUFWLEVBQW9CLElBQUMsQ0FBQSxPQUFyQixDQUFBLENBRGM7RUFBQSxDQXZGZixDQUFBOztBQUFBLGlCQTJGQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1osUUFBQSxjQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQVYsQ0FBQTtBQUNBO0FBQUEsU0FBQSxTQUFBO3NCQUFBO0FBQ0MsTUFBQSxJQUFDLENBQUEsTUFBUSxDQUFBLEVBQUEsQ0FBVCxHQUFnQixDQUFDLENBQUMsUUFBRixDQUFZLEtBQVosQ0FBaEIsQ0FERDtBQUFBLEtBRlk7RUFBQSxDQTNGYixDQUFBOztBQUFBLGlCQWlHQSxNQUFBLEdBQVEsU0FBQSxHQUFBO1dBQ1A7QUFBQSxNQUFBLGtCQUFBLEVBQW9CLDJGQUFwQjtBQUFBLE1BQ0EsZ0JBQUEsRUFBa0Isc0NBRGxCO0FBQUEsTUFFQSxnQkFBQSxFQUFrQiwyREFGbEI7QUFBQSxNQUdBLGVBQUEsRUFBaUIsMERBSGpCO0FBQUEsTUFJQSxnQkFBQSxFQUFrQiwwRUFKbEI7QUFBQSxNQUtBLFlBQUEsRUFBYyw2QkFMZDtNQURPO0VBQUEsQ0FqR1IsQ0FBQTs7Y0FBQTs7R0FEa0IsUUFBUSxDQUFDLE9BUjVCLENBQUE7O0FBQUEsTUFrSE0sQ0FBQyxPQUFQLEdBQWlCLElBbEhqQixDQUFBOzs7OztBQ0FBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FBQTtBQUFBLElBQUEsV0FBQTtFQUFBOzs7cUpBQUE7O0FBQUE7QUF5QkMsaUNBQUEsQ0FBQTs7Ozs7OztHQUFBOztBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSx3QkFjQSxHQUFBLEdBQUssU0FBRSxNQUFGLEdBQUE7QUFDSixRQUFBLHVCQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsYUFBRCxJQUFDLENBQUEsV0FBYSxHQUFkLENBQUE7QUFBQSxJQUNBLFFBQUEsR0FBVyxJQUFDLENBQUEsa0JBQUQsQ0FBcUIsTUFBckIsQ0FEWCxDQUFBO0FBQUEsSUFJQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLENBSlYsQ0FBQTtBQUFBLElBTUEsSUFBQSxHQUFXLElBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYyxPQUFkLENBTlgsQ0FBQTtBQUFBLElBUUEsSUFBSSxDQUFDLFVBQUwsR0FBa0IsSUFSbEIsQ0FBQTtBQUFBLElBU0EsSUFBSSxDQUFDLFNBQUwsR0FBaUIsUUFUakIsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLEVBQUQsQ0FBSSxRQUFKLEVBQWMsQ0FBQyxDQUFDLElBQUYsQ0FBUSxTQUFFLEVBQUYsR0FBQTtBQUNyQixVQUFBLFlBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsU0FBRCxDQUFZLEVBQVosQ0FBUixDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsb0JBRFIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxLQUFBLElBQVUsQ0FBQSxLQUFiO0FBQ0MsUUFBQSxJQUFDLENBQUEsTUFBRCxDQUFTLEVBQVQsQ0FBQSxDQUREO09BQUEsTUFFSyxJQUFHLENBQUEsS0FBQSxJQUFjLEtBQWpCO0FBQ0osUUFBQSxJQUFDLENBQUEsR0FBRCxDQUFNLEVBQU4sQ0FBQSxDQURJO09BTGdCO0lBQUEsQ0FBUixFQVFaLElBUlksQ0FBZCxDQWRBLENBQUE7QUFBQSxJQXlCQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBZSxDQUFDLENBQUMsSUFBRixDQUFRLFNBQUUsRUFBRixHQUFBO0FBQ3RCLE1BQUEsSUFBQyxDQUFBLEdBQUQsQ0FBTSxFQUFOLENBQUEsQ0FEc0I7SUFBQSxDQUFSLEVBR2IsSUFIYSxDQUFmLENBekJBLENBQUE7QUFBQSxJQStCQSxJQUFDLENBQUEsRUFBRCxDQUFJLEtBQUosRUFBVyxDQUFDLENBQUMsSUFBRixDQUFRLFNBQUUsRUFBRixHQUFBO0FBQ2xCLE1BQUEsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFZLEVBQVosQ0FBSDtBQUNDLFFBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBTSxFQUFOLENBQUEsQ0FERDtPQURrQjtJQUFBLENBQVIsRUFJVCxJQUpTLENBQVgsQ0EvQkEsQ0FBQTtBQUFBLElBc0NBLElBQUksQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFrQixDQUFDLENBQUMsSUFBRixDQUFRLFNBQUUsRUFBRixHQUFBLENBQVIsRUFHaEIsSUFIZ0IsQ0FBbEIsQ0F0Q0EsQ0FBQTtBQUFBLElBNENBLElBQUMsQ0FBQSxFQUFELENBQUksUUFBSixFQUFjLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGLEdBQUE7QUFDckIsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFTLEVBQVQsQ0FBQSxDQURxQjtJQUFBLENBQVIsRUFHWixJQUhZLENBQWQsQ0E1Q0EsQ0FBQTtBQUFBLElBa0RBLElBQUMsQ0FBQSxFQUFELENBQUksT0FBSixFQUFhLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGLEdBQUE7QUFDcEIsTUFBQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsQ0FEb0I7SUFBQSxDQUFSLEVBR1gsSUFIVyxDQUFiLENBbERBLENBQUE7QUFBQSxJQXdEQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZ0IsSUFBaEIsQ0F4REEsQ0FBQTtBQTBEQSxXQUFPLElBQVAsQ0EzREk7RUFBQSxDQWRMLENBQUE7O0FBMkVBO0FBQUE7Ozs7Ozs7Ozs7OztLQTNFQTs7QUFBQSx3QkF3RkEsZUFBQSxHQUFpQixTQUFFLE1BQUYsRUFBVSxPQUFWLEdBQUE7QUFDaEIsUUFBQSx1RUFBQTs7TUFEMEIsVUFBVTtLQUNwQztBQUFBLElBQUEsSUFBRyx1QkFBSDtBQUdDLE1BQUEsSUFBOEMsY0FBOUM7QUFBQSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLGtCQUFELENBQXFCLE1BQXJCLENBQWIsQ0FBQTtPQUFBO0FBQUEsTUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW9CLElBQUMsQ0FBQSxTQUFyQixDQUZWLENBQUE7QUFLQSxNQUFBLElBQUcsT0FBSDtBQUNDLFFBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBUSxPQUFSLENBQUEsQ0FBQTtBQUNBLGVBQU8sSUFBUCxDQUZEO09BTEE7QUFBQSxNQVNBLE1BQUEsR0FBUyxDQUFDLENBQUMsS0FBRixDQUFTLE9BQVQsRUFBa0IsS0FBbEIsQ0FUVCxDQUFBO0FBQUEsTUFVQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUyxJQUFDLENBQUEsTUFBVixFQUFrQixLQUFsQixDQVZWLENBQUE7QUFXQTtBQUFBLFdBQUEscUNBQUE7cUJBQUE7QUFDQyxRQUFBLElBQUMsQ0FBQSxNQUFELENBQVMsR0FBVCxDQUFBLENBREQ7QUFBQSxPQVhBO0FBQUEsTUFjQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLFVBQUYsQ0FBYyxNQUFkLEVBQXNCLE9BQXRCLENBZFYsQ0FBQTtBQWVBLFdBQUEsMkNBQUE7eUJBQUE7bUJBQXdCLEdBQUcsQ0FBQyxHQUFKLEVBQUEsYUFBVyxPQUFYLEVBQUEsSUFBQTtBQUN2QixVQUFBLElBQUMsQ0FBQSxHQUFELENBQU0sR0FBTixDQUFBO1NBREQ7QUFBQSxPQWxCRDtLQUFBO0FBcUJBLFdBQU8sSUFBUCxDQXRCZ0I7RUFBQSxDQXhGakIsQ0FBQTs7QUFpSEE7QUFBQTs7Ozs7Ozs7Ozs7O0tBakhBOztBQUFBLHdCQThIQSxrQkFBQSxHQUFvQixTQUFFLE1BQUYsR0FBQTtBQUVuQixRQUFBLFFBQUE7QUFBQSxJQUFBLElBQUcsQ0FBQyxDQUFDLFVBQUYsQ0FBYyxNQUFkLENBQUg7QUFDQyxNQUFBLFFBQUEsR0FBVyxNQUFYLENBREQ7S0FBQSxNQUVLLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVyxNQUFYLENBQUg7QUFDSixNQUFBLFFBQUEsR0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxFQUFGLEdBQUE7QUFDVixjQUFBLEdBQUE7dUJBQUEsRUFBRSxDQUFDLEVBQUgsRUFBQSxhQUFTLE1BQVQsRUFBQSxHQUFBLE9BRFU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBREk7S0FBQSxNQUdBLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBWSxNQUFaLENBQUEsSUFBd0IsQ0FBQyxDQUFDLFFBQUYsQ0FBWSxNQUFaLENBQTNCO0FBQ0osTUFBQSxRQUFBLEdBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsRUFBRixHQUFBO2lCQUNWLEVBQUUsQ0FBQyxFQUFILEtBQVMsT0FEQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FESTtLQUFBLE1BQUE7QUFJSixNQUFBLFFBQUEsR0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxFQUFGLEdBQUE7QUFDVixjQUFBLFFBQUE7QUFBQSxlQUFBLGFBQUE7OEJBQUE7QUFDQyxZQUFBLElBQUcsRUFBRSxDQUFDLEdBQUgsQ0FBUSxHQUFSLENBQUEsS0FBbUIsR0FBdEI7QUFDQyxxQkFBTyxLQUFQLENBREQ7YUFERDtBQUFBLFdBQUE7QUFHQSxpQkFBTyxJQUFQLENBSlU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBSkk7S0FMTDtBQWVBLFdBQU8sUUFBUCxDQWpCbUI7RUFBQSxDQTlIcEIsQ0FBQTs7cUJBQUE7O0dBRHlCLFFBQVEsQ0FBQyxXQXhCbkMsQ0FBQTs7QUFBQSxNQTBLTSxDQUFDLE9BQVAsR0FBaUIsV0ExS2pCLENBQUE7Ozs7O0FDQUEsSUFBQSxRQUFBO0VBQUE7NkJBQUE7O0FBQUE7QUFDQyw4QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEscUJBQUEsT0FBQSxHQUFTLE9BQUEsQ0FBUywwQkFBVCxDQUFULENBQUE7O2tCQUFBOztHQURzQixPQUFBLENBQVMsZ0JBQVQsRUFBdkIsQ0FBQTs7QUFBQSxNQUlNLENBQUMsT0FBUCxHQUFpQixRQUpqQixDQUFBOzs7OztBQ0FBLElBQUEsU0FBQTtFQUFBOzs2QkFBQTs7QUFBQTtBQUNDLCtCQUFBLENBQUE7Ozs7Ozs7R0FBQTs7QUFBQSxzQkFBQSxXQUFBLEdBQWEsTUFBYixDQUFBOztBQUFBLHNCQUNBLE9BQUEsR0FBUyxPQUFBLENBQVMsc0JBQVQsQ0FEVCxDQUFBOztBQUFBLHNCQUVBLFFBQUEsR0FBVSxTQUFBLEdBQUE7V0FDVDtBQUFBLE1BQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxNQUNBLElBQUEsRUFBTSxNQUROO0FBQUEsTUFFQSxLQUFBLEVBQU8sYUFGUDtNQURTO0VBQUEsQ0FGVixDQUFBOztBQUFBLHNCQU9BLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDVCxXQUFPLElBQUMsQ0FBQSxHQUFELENBQU0sT0FBTixDQUFQLENBRFM7RUFBQSxDQVBWLENBQUE7O0FBQUEsc0JBVUEsS0FBQSxHQUFPLFNBQUUsSUFBRixHQUFBO0FBQ04sUUFBQSxTQUFBO0FBQUEsSUFBQSxFQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBTSxNQUFOLENBQUEsR0FBaUIsR0FBakIsR0FBdUIsSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOLENBQTdCLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxFQUFFLENBQUMsV0FBSCxDQUFBLENBQWdCLENBQUMsT0FBakIsQ0FBMEIsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUExQixDQURSLENBQUE7QUFFQSxXQUFPLEtBQUEsSUFBUyxDQUFoQixDQUhNO0VBQUEsQ0FWUCxDQUFBOztBQUFBLHNCQWVBLFVBQUEsR0FBWSxTQUFFLEdBQUYsR0FBQTtBQUNYLFdBQU8sR0FBRyxDQUFDLEVBQVgsQ0FEVztFQUFBLENBZlosQ0FBQTs7bUJBQUE7O0dBRHVCLFFBQVEsQ0FBQyxNQUFqQyxDQUFBOztBQUFBLE1BbUJNLENBQUMsT0FBUCxHQUFpQixTQW5CakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLFlBQUE7RUFBQTs7NkJBQUE7O0FBQUE7QUFDQyxrQ0FBQSxDQUFBOzs7OztHQUFBOztBQUFBLHlCQUFBLE9BQUEsR0FBUyxPQUFBLENBQVMsMkJBQVQsQ0FBVCxDQUFBOztBQUFBLHlCQUNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDVCxXQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMsNENBQUEsU0FBQSxDQUFULEVBQ047QUFBQSxNQUFBLElBQUEsRUFBTSxFQUFOO0FBQUEsTUFDQSxLQUFBLEVBQU8sRUFEUDtLQURNLENBQVAsQ0FEUztFQUFBLENBRFYsQ0FBQTs7c0JBQUE7O0dBRDBCLE9BQUEsQ0FBUyxjQUFULEVBQTNCLENBQUE7O0FBQUEsTUFPTSxDQUFDLE9BQVAsR0FBaUIsWUFQakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLFNBQUE7RUFBQTs7NkJBQUE7O0FBQUE7QUFDQywrQkFBQSxDQUFBOzs7OztHQUFBOztBQUFBLHNCQUFBLE9BQUEsR0FBUyxPQUFBLENBQVMsMkJBQVQsQ0FBVCxDQUFBOztBQUFBLHNCQUNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDVCxXQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMseUNBQUEsU0FBQSxDQUFULEVBQ047QUFBQSxNQUFBLEdBQUEsRUFBSyxDQUFMO0FBQUEsTUFDQSxHQUFBLEVBQUssR0FETDtBQUFBLE1BRUEsSUFBQSxFQUFNLENBRk47QUFBQSxNQUdBLEtBQUEsRUFBTyxFQUhQO0tBRE0sQ0FBUCxDQURTO0VBQUEsQ0FEVixDQUFBOzttQkFBQTs7R0FEdUIsT0FBQSxDQUFTLGNBQVQsRUFBeEIsQ0FBQTs7QUFBQSxNQVNNLENBQUMsT0FBUCxHQUFpQixTQVRqQixDQUFBOzs7OztBQ0FBLElBQUEsU0FBQTtFQUFBOzs2QkFBQTs7QUFBQTtBQUNDLCtCQUFBLENBQUE7Ozs7O0dBQUE7O0FBQUEsc0JBQUEsT0FBQSxHQUFTLE9BQUEsQ0FBUywyQkFBVCxDQUFULENBQUE7O0FBQUEsc0JBQ0EsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNULFdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyx5Q0FBQSxTQUFBLENBQVQsRUFDTjtBQUFBLE1BQUEsT0FBQSxFQUFTLEVBQVQ7S0FETSxDQUFQLENBRFM7RUFBQSxDQURWLENBQUE7O21CQUFBOztHQUR1QixPQUFBLENBQVMsY0FBVCxFQUF4QixDQUFBOztBQUFBLE1BTU0sQ0FBQyxPQUFQLEdBQWlCLFNBTmpCLENBQUE7Ozs7O0FDQUEsSUFBQSx1QkFBQTtFQUFBOztrRkFBQTs7QUFBQTtBQUNDLGdDQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSx1QkFBQSxXQUFBLEdBQWEsTUFBYixDQUFBOztBQUFBLHVCQUNBLFFBQUEsR0FDQztBQUFBLElBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxJQUNBLElBQUEsRUFBTSxJQUROO0FBQUEsSUFFQSxLQUFBLEVBQU8sSUFGUDtHQUZELENBQUE7O29CQUFBOztHQUR3QixRQUFRLENBQUMsTUFBbEMsQ0FBQTs7QUFBQTtBQVFDLGlDQUFBLENBQUE7Ozs7O0dBQUE7O0FBQUEsd0JBQUEsS0FBQSxHQUFPLFVBQVAsQ0FBQTs7QUFBQSx3QkFDQSxLQUFBLEdBQU8sU0FBRSxJQUFGLEVBQVEsT0FBUixHQUFBO0FBQ04sUUFBQSxzQ0FBQTtBQUFBLElBQUEsT0FBQSx1Q0FBd0IsQ0FBRSxHQUFoQixDQUFxQixRQUFyQixVQUFWLENBQUE7QUFBQSxJQUNBLEtBQUEseUNBQXNCLENBQUUsR0FBaEIsQ0FBcUIsTUFBckIsVUFEUixDQUFBO0FBQUEsSUFFQSxLQUFBLHlDQUFzQixDQUFFLEdBQWhCLENBQXFCLE1BQXJCLFVBRlIsQ0FBQTtBQUdBLElBQUEsSUFBRyxpQkFBQSxJQUFhLENBQUMsQ0FBQyxVQUFGLENBQWMsT0FBZCxDQUFoQjtBQUNDLE1BQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxPQUFBLENBQVMsSUFBSSxDQUFDLEtBQWQsRUFBcUIsS0FBckIsRUFBNEIsS0FBNUIsQ0FBYixDQUREO0tBSEE7QUFLQSxXQUFPLElBQVAsQ0FOTTtFQUFBLENBRFAsQ0FBQTs7cUJBQUE7O0dBRHlCLFFBQVEsQ0FBQyxXQVBuQyxDQUFBOztBQUFBLE1BaUJNLENBQUMsT0FBUCxHQUFpQixXQWpCakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLHVCQUFBO0VBQUE7OzZCQUFBOztBQUFBO0FBQ0MsZ0NBQUEsQ0FBQTs7Ozs7R0FBQTs7QUFBQSx1QkFBQSxXQUFBLEdBQWEsT0FBYixDQUFBOztBQUFBLHVCQUNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDVCxXQUFPLElBQUMsQ0FBQSxHQUFELENBQU0sT0FBTixDQUFBLElBQW1CLElBQUMsQ0FBQSxHQUFELENBQU0sSUFBQyxDQUFBLFdBQVAsQ0FBbkIsSUFBMkMsR0FBbEQsQ0FEUztFQUFBLENBRFYsQ0FBQTs7b0JBQUE7O0dBRHdCLFFBQVEsQ0FBQyxNQUFsQyxDQUFBOztBQUFBO0FBT0MsaUNBQUEsQ0FBQTs7OztHQUFBOztBQUFBLHdCQUFBLEtBQUEsR0FBTyxVQUFQLENBQUE7O3FCQUFBOztHQUR5QixPQUFBLENBQVMsZ0JBQVQsRUFOMUIsQ0FBQTs7QUFBQSxNQVNNLENBQUMsT0FBUCxHQUFpQixXQVRqQixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0M7QUFBQSxFQUFBLE1BQUEsRUFBUSxFQUFSO0FBQUEsRUFDQSxPQUFBLEVBQVMsRUFEVDtBQUFBLEVBRUEsSUFBQSxFQUFNLEVBRk47QUFBQSxFQUdBLE1BQUEsRUFB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1haW5WaWV3ID0gcmVxdWlyZSggXCIuL3ZpZXdzL21haW5cIiApXG5GYWNldHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcbkZjdFN0cmluZyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc3RyaW5nXCIgKVxuRmN0QXJyYXkgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2FycmF5XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0bmV3IE1haW5WaWV3KCBlbDogQCRlbCwgY29sbGVjdGlvbjogQGZhY2V0cywgcmVzdWx0czogQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRWw6ICggZWwgKT0+XG5cblx0XHRpZiBub3QgZWw/XG5cdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVNSVNTSU5HRUxcIiApXG5cblx0XHRpZiBfLmlzU3RyaW5nKCBlbCApXG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxTVFJJTkdcIiApXG5cblx0XHRcdF8kZWwgPSBAJCggZWwgKVxuXHRcdFx0aWYgbm90IF8kZWw/Lmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxTVFJJTkdcIiApXG5cblx0XHRcdHJldHVybiBfJGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIGpRdWVyeVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMSlFVRVJZXCIgKVxuXG5cdFx0XHQjIFRPRE8gaGFuZGxlIG11bHRpcGxlIGpRdWVyeSBlbGVtZW50cyB0byBJR0dZIGluc3RhbmNlc1xuXHRcdFx0aWYgZWwubGVuZ3RoID4gMVxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVTSVpFRUxKUVVFUllcIiApXG5cblx0XHRcdHJldHVybiBlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBFbGVtZW50XG5cdFx0XHRyZXR1cm4gQCQoIGVsIClcblxuXHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFRZUEVcIiApXG5cblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUZhY2V0czogKCBmYWNldHMgKT0+XG5cdFx0X3JldCA9IFtdXG5cdFx0Zm9yIGZhY2V0IGluIGZhY2V0cyB3aGVuICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdF9yZXQucHVzaCBfZmN0XG5cblx0XHRyZXR1cm4gbmV3IEZhY2V0cyggX3JldCApXG5cblx0X2NyZWF0ZUZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdHN3aXRjaCBmYWNldC50eXBlLnRvTG93ZXJDYXNlKClcblx0XHRcdHdoZW4gXCJzdHJpbmdcIiB0aGVuIHJldHVybiBuZXcgRmN0U3RyaW5nKCBmYWNldCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCApXG5cdFx0XHR3aGVuIFwiZGF0ZXJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdERhdGVSYW5nZSggZmFjZXQgKVxuXG5cdGFkZEZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdGlmIG5vdCBAZmFjZXRzP1xuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0QGZhY2V0cy5hZGQoIF9mY3QgKVxuXHRcdHJldHVybiBAXG5cblx0X2Vycm9yOiAoIHR5cGUsIGRhdGEgPSB7fSApPT5cblx0XHRpZiBAZXJyb3JzWyB0eXBlIF0/XG5cdFx0XHRfbXNnID0gQGVycm9yc1sgdHlwZSBdKCBkYXRhIClcblx0XHRlbHNlXG5cdFx0XHRfbXNnID0gXCItXCJcblx0XHRfZXJyID0gbmV3IEVycm9yKClcblx0XHRfZXJyLm5hbWUgPSB0eXBlXG5cdFx0X2Vyci5tZXNzYWdlID0gX21zZ1xuXHRcdHJldHVybiBfZXJyXG5cblx0Z2V0UXVlcnk6ID0+XG5cdFx0cmV0dXJuIEByZXN1bHRzXG5cblx0dHJpZ2dlckNoYW5nZTogPT5cblx0XHRAdHJpZ2dlciggXCJjaGFuZ2VcIiwgQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXG5cdF9pbml0RXJyb3JzOiA9PlxuXHRcdEBlcnJvcnMgPSB7fVxuXHRcdGZvciBfaywgX3RtcGwgb2YgQEVSUk9SUygpXG5cdFx0XHRAZXJyb3JzWyBfayBdID0gXy50ZW1wbGF0ZSggX3RtcGwgKSBcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6ID0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1kiLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKSBcblx0XG5cdCMgb3IgYnkgT2JqZWN0XG5cdHN1YkNvbGxPID0gcGFyZW50Q29sbC5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9ICkgXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscyApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApIFxuXHRcdFx0YWRkZWQgPSBAZ2V0KCBfbSApP1xuXHRcdFx0aWYgYWRkZWQgYW5kIG5vdCB0b0FkZFxuXHRcdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRlbHNlIGlmIG5vdCBhZGRlZCBhbmQgdG9BZGRcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIGJhc2UgY29sbGVjdGlvbiBvbiBhZGQgdG8gc3ViXG5cdFx0X3N1Yi5vbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBzdWIgY29sbGVjdGlvbiBvbiBhZGQgdG8gYmFzZSBpZiBpdCBtYXRjaGVzIHRoZSBmaWx0ZXJcblx0XHRAb24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0aWYgQF9mbkZpbHRlciggX20gKVxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdF9zdWIub24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0I0ByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZXNldFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAdXBkYXRlU3ViRmlsdGVyKClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHN0b3JlIHRoZSBzdWJjb2xsZWN0aW9uIHVuZGVyIHRoZSBjdXJyZW50IGNvbGxlY3Rpb25cblx0XHRAc3ViQ29sbHMucHVzaCggX3N1YiApXG5cblx0XHRyZXR1cm4gX3N1YlxuXG5cdCMjI1xuXHQjIyB1cGRhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLnVwZGF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRNZXRob2QgdG8gdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBUaGVuIGFsbCBtb2RlbHMgd2lsbCBiZSByZXNldGUgYnkgdGhlIG5ldyBmaWx0ZXIuIFNvIHlvdSBoYXZlIHRvIGxpc3RlbiB0byB0ZWggcmVzZXQgZXZlbnRcblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuIFxuXHRcblx0QHJldHVybiB7IFNlbGYgfSBpdHNlbGZcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHR1cGRhdGVTdWJGaWx0ZXI6ICggZmlsdGVyLCBhc1Jlc2V0ID0gdHJ1ZSApPT5cblx0XHRpZiBAX3BhcmVudENvbD9cblxuXHRcdFx0IyBzZXQgdGhlIG5ldyBmaWx0ZXIgbWV0aG9kXG5cdFx0XHRAX2ZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyICkgaWYgZmlsdGVyP1xuXG5cdFx0XHRfbW9kZWxzID0gQF9wYXJlbnRDb2wuZmlsdGVyKCBAX2ZuRmlsdGVyIClcblxuXHRcdFx0IyByZXNldCB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBuZXcgbW9kZWxzXG5cdFx0XHRpZiBhc1Jlc2V0XG5cdFx0XHRcdEByZXNldCggX21vZGVscyApXG5cdFx0XHRcdHJldHVybiBAXG5cblx0XHRcdG5ld2lkcyA9IF8ucGx1Y2soIF9tb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Y3VycmlkcyA9IF8ucGx1Y2soIEBtb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Zm9yIHJpZCBpbiBfLmRpZmZlcmVuY2UoIGN1cnJpZHMsIG5ld2lkcyApXG5cdFx0XHRcdEByZW1vdmUoIHJpZCApXG5cdFx0XHRcdFxuXHRcdFx0X2FkZElkcyA9IF8uZGlmZmVyZW5jZSggbmV3aWRzLCBjdXJyaWRzIClcblx0XHRcdGZvciBtZGwgaW4gX21vZGVscyB3aGVuIG1kbC5jaWQgaW4gX2FkZElkc1xuXHRcdFx0XHRAYWRkKCBtZGwgKVxuXG5cdFx0cmV0dXJuIEBcblxuXG5cdCMjI1xuXHQjIyBfZ2VuZXJhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLl9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRJbnRlcm5hbCBtZXRob2QgdGggY29udmVydCBhIGZpbHRlciBhcmd1bWVudCB0byBhIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy4gXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvbiBcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X2dlbmVyYXRlU3ViRmlsdGVyOiAoIGZpbHRlciApPT5cblx0XHQjIGNvbnN0cnVjdCB0aGUgZmlsdGVyIGZ1bmN0aW9uXG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNBcnJheSggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApPT5cblx0XHRcdFx0X20uaWQgaW4gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzU3RyaW5nKCBmaWx0ZXIgKSBvciBfLmlzTnVtYmVyKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICk9PlxuXHRcdFx0XHRfbS5pZCBpcyBmaWx0ZXJcblx0XHRlbHNlXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKT0+XG5cdFx0XHRcdGZvciBfbm0sIF92bCBvZiBmaWx0ZXJcblx0XHRcdFx0XHRpZiBfbS5nZXQoIF9ubSApIGlzbnQgX3ZsXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdHJldHVybiBmbkZpbHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lU3ViIiwiY2xhc3MgRmN0QXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfc3RyaW5nXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheVwiIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEFycmF5XG4iLCJjbGFzcyBGYWNldEJhc2UgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvYmFzZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IFwibmFtZVwiXG5cdFx0bGFiZWw6IFwiRGVzY3JpcHRpb25cIlxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2UiLCJjbGFzcyBGY3REYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvZGF0ZXJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0b3B0czoge31cblx0XHRcdHZhbHVlOiBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZSIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRtaW46IDBcblx0XHRcdG1heDogMTAwXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogNTBcblxubW9kdWxlLmV4cG9ydHMgPSBGY3ROdW1iZXIiLCJjbGFzcyBGY3RTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic3RyaW5nXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmciLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOiBcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogbnVsbFxuXHRcdHZhbHVlOiBudWxsXG5cbmNsYXNzIElnZ3lSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHRtb2RlbDogSWdneVJlc3VsdFxuXHRwYXJzZTogKCBhdHRyLCBvcHRpb25zICk9PlxuXHRcdF9tb2RpZnkgPSBvcHRpb25zLl9mYWNldD8uZ2V0KCBcIm1vZGlmeVwiIClcblx0XHRfbmFtZSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwibmFtZVwiIClcblx0XHRfdHlwZSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwidHlwZVwiIClcblx0XHRpZiBfbW9kaWZ5PyBhbmQgXy5pc0Z1bmN0aW9uKCBfbW9kaWZ5IClcblx0XHRcdGF0dHIudmFsdWUgPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBfbmFtZSwgX3R5cGUgKVxuXHRcdHJldHVybiBhdHRyXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneVJlc3VsdHMiLCJjbGFzcyBCYXNlUmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggQGlkQXR0cmlidXRlICkgb3IgXCItXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHMiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCkge1xuaWYgKCBvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYWN0aXZlSWR4LCBjdXN0b20sIGxpc3QsIHF1ZXJ5LCB1bmRlZmluZWQpIHtcbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTppZHggPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTppZHggPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBzZWxlY3RlZCwgdW5kZWZpbmVkKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJzdWJsYWJlbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3RcXFwiPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInNlbGVjdGVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWxlY3RlZDp0eXBlb2Ygc2VsZWN0ZWQhPT1cInVuZGVmaW5lZFwiP3NlbGVjdGVkOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGZhIGZhLXBsdXNcXFwiPjwvZGl2PlwiKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFxuXHRcIkxFRlRcIjogMzdcblx0XCJSSUdIVFwiOiAzOVxuXHRcIlVQXCI6IDM4XG5cdFwiRE9XTlwiOiA0MFxuXHRcIkVTQ1wiOiBbIDIyOSwgMjcgXVxuXHRcIkVOVEVSXCI6IDEzIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdGluaXRpYWxpemU6ID0+XG5cdFx0QHJlc3VsdCA9IG5ldyBTdWJSZXN1bHRzKClcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdGNpZDogQGNpZFx0XHRcblxuXHRyZW5kZXI6ID0+XG5cdFx0QCRlbC5odG1sKCBAdGVtcGxhdGUoIEBnZXRUZW1wbGF0ZURhdGEoKSApIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggXCJpbnB1dCMje0BjaWR9XCIgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEBpc09wZW4gPSBmYWxzZVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCBAcmVzdWx0IClcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdHJldHVybiBAJGlucC52YWwoKVxuXG5cdGdldFNlbGVjdE1vZGVsOiA9PlxuXHRcdHJldHVybiBTdWJSZXN1bHRzLnByb3RvdHlwZS5tb2RlbFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCksIGN1c3RvbTogdHJ1ZSApXG5cdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0Jhc2UiLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0RhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9kYXRlcmFuZ2UuamFkZVwiIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRmb3JjZWREYXRlUmFuZ2VPcHRzOlxuXHRcdG9wZW5zOiBcInJpZ2h0XCJcblxuXHRldmVudHM6ID0+IFxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0aWYgbm90IEBkYXRlcmFuZ2VwaWNrZXI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgQGZvcmNlZERhdGVSYW5nZU9wdHMgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRcdEAkaW5wLm9uKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblxuXHRcdGVsc2Vcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IEBzdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBAZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IEBlbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRfZGF0ZVJldHVybjogKCBAc3RhcnREYXRlLCBAZW5kRGF0ZSApPT5cblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X291dCA9IFsgQHN0YXJ0RGF0ZS52YWx1ZU9mKCkgXVxuXHRcdF9vdXQucHVzaCBAZW5kRGF0ZS52YWx1ZU9mKCkgaWYgQGVuZERhdGU/XG5cdFx0cmV0dXJuIF9vdXRcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzRGF0ZVJhbmdlIiwiY2xhc3MgQXJyYXlPcHRpb24gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBcIm5hbWVcIiApIG9yIFwiLVwiXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cbmNsYXNzIEFycmF5T3B0aW9ucyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEFycmF5T3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViQXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vc3Vic3RyaW5nXCIgKVxuXHRtdWx0aVNlbGVjdDogdHJ1ZVxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YkFycmF5IiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5uZWFyZXN0ID0gKG4sIHYpLT5cblx0biA9IG4gLyB2XG5cdG4gPSBNYXRoLnJvdW5kKG4pICogdlxuXHRyZXR1cm4gblxuXHRcbnByZWNpc2lvbiA9IChuLCBkcCktPlxuXHRkcCA9IE1hdGgucG93KDEwLCBkcClcblx0biA9IG4gKiBkcFxuXHRuID0gTWF0aC5yb3VuZChuKVxuXHRuID0gbiAvIGRwXG5cdHJldHVybiBuXG5cbmNsYXNzIEZhY2V0U3Vic051bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwiaW5wdXRcIlxuXHRcdFwiY2hhbmdlIHNlbGVjdCMje0BjaWR9b3BcIjogXCJzd2l0Y2hGb2N1c1wiXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRzd2l0Y2hGb2N1czogKCB0eXBlPVwiaW5cIiApPT5cblx0XHRpZiB0eXBlIGlzIFwib3BcIlxuXHRcdFx0QGZvY3VzKClcblx0XHRlbHNlXG5cdFx0XHRAZm9jdXMoIHRydWUgKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdCNjb25zb2xlLmxvZyBcImZvY3VzXCIsIGlucCBvciBub3QgQCRpbnBPcD8sIGlucCwgbm90IEAkaW5wT3A/LCBAJGlucE9wXG5cdFx0aWYgaW5wIG9yIG5vdCBAJGlucE9wP1xuXHRcdFx0c3VwZXJcblx0XHRcdHJldHVyblxuXHRcdEAkaW5wT3AuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCB7IG9wZXJhdG9yczogQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApIH0gKVxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApICogLTEgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlJJR0hUXG5cdFx0XHRcdFx0QHN3aXRjaEZvY3VzKCBcImluXCIgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkxFRlRcblx0XHRcdFx0XHRAc3dpdGNoRm9jdXMoIFwib3BcIiApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvXFxEL2dpLCBcIlwiIClcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cdFx0XHQgXG5cdFx0XHRAc2V0TnVtYmVyKCBfdiApXG5cdFx0cmV0dXJuXG5cblx0Y3JlbWVudDogKCBjaGFuZ2UgKT0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRfdiA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0ZWxzZVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblxuXHRcdEBzZXROdW1iZXIoIF92ICsgY2hhbmdlIClcblxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPSBcblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0XHRcdG9wZXJhdG9yOiBAJGlucE9wLnZhbCgpXG5cdFx0ZWxzZVxuXHRcdFx0X3JldCA9IFxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRyZXR1cm4gX3JldFxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF92ID0gQCRpbnAudmFsKClcblx0XHRyZXR1cm4gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0c2V0TnVtYmVyOiAoIF92ICk9PlxuXHRcdGlmIGlzTmFOKCBfdiApXG5cdFx0XHRAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X21heCA9IEBtb2RlbC5nZXQoIFwibWF4XCIgKVxuXHRcdF9taW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRfc3RlcCA9IEBtb2RlbC5nZXQoIFwic3RlcFwiIClcblxuXHRcdEAkaW5wLnZhbCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiwgX21pbiwgX21heCwgX3N0ZXAgKSApXG5cdFx0cmV0dXJuXG5cblx0dmFsdWVCeURlZmluaXRpb246ICggX3ZhbHVlLCBtaW4sIG1heCwgc3RlcCApLT5cblx0XHQjIGZpeCByZXZlcnNlZCBtaW4vbWF4IHNldHRpbmdcblx0XHRpZiBtaW4gPiBtYXhcblx0XHRcdF90bXAgPSBtaW5cblx0XHRcdG1pbiA9IG1heFxuXHRcdFx0bWF4ID0gX3RtcFxuXHRcdFxuXHRcdCMgb24gZXh4ZWRkaW5nIHRoZSBsaW1pdHMgdXNlIHRoZSBsaW1pdFxuXHRcdGlmIF92YWx1ZSA8IG1pblxuXHRcdFx0cmV0dXJuIG1pblxuXHRcdGlmIF92YWx1ZSA+IG1heFxuXHRcdFx0cmV0dXJuIG1heFxuXG5cdFx0IyBzZWFyY2ggdGhlIG5lYXJlc3QgX3ZhbHVlIHRvIHRoZSBzdGVwXG5cdFx0aWYgc3RlcCBpc250IDFcblx0XHRcdF92YWx1ZSA9IG5lYXJlc3QoIF92YWx1ZSwgc3RlcCApXG5cdFx0XG5cdFx0IyBjYWxjIHRoZSBwcmVjaXNpb24gYnkgc3RlcFxuXHRcdF9wcmVjaXNpb24gPSBNYXRoLm1heCggMCwgTWF0aC5jZWlsKCBNYXRoLmxvZyggMS9zdGVwICkgLyBNYXRoLmxvZyggMTAgKSApIClcblx0XHRpZiBfcHJlY2lzaW9uID4gMFxuXHRcdFx0X3ZhbHVlID0gcHJlY2lzaW9uKCBfdmFsdWUsIF9wcmVjaXNpb24gKVxuXHRcdGVsc2Vcblx0XHRcdF92YWx1ZSA9IE1hdGgucm91bmQoIF92YWx1ZSApXG5cdFx0XHRcblx0XHRyZXR1cm4gX3ZhbHVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNOdW1iZXIiLCJTdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgU3RyaW5nT3B0aW9uIGV4dGVuZHMgU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBTdHJpbmdPcHRpb25zIGV4dGVuZHMgU3ViUmVzdWx0c1xuXHRtb2RlbDogU3RyaW5nT3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuLi9zZWxlY3RvclwiIClcblx0b3B0RGVmYXVsdDogXG5cdFx0bmFtZTogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblx0XHRncm91cDogbnVsbFxuXG5cdG9wdENvbGw6IFN0cmluZ09wdGlvbnNcblxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0QGNvbGxlY3Rpb24gPSBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIG9wdGlvbnMubW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5maXJzdCgpPy5pZFxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiBvcHQsIGxhYmVsOiBvcHQsIGdyb3VwOiBudWxsIH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdCggIClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKTtcblxuXHRcdHJldHVybiBuZXcgQG9wdENvbGwoIF9vcHRzIClcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZyIsIlN1YlZpZXcgPSByZXF1aXJlKCBcIi4vc3ViXCIgKVxuU2VsZWN0b3JWaWV3ID0gcmVxdWlyZSggXCIuL3NlbGVjdG9yXCIgKVxuXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIE1haW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy93cmFwcGVyLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJpZ2d5IGNsZWFyZml4XCJcblxuXHRldmVudHM6IFxuXHRcdFwiY2xpY2sgLmFkZC1mYWNldC1idG5cIjogXCJfYWRkRmFjZXRcIlxuXHRcdFwiY2xpY2tcIjogXCJfYWRkRmFjZXRcIlxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXG5cdFx0QGNvbGxlY3Rpb24ub24gXCJpZ2d5OnJlbVwiLCBAcmVtRmFjZXRcblxuXHRcdEBlbC5jbGFzc05hbWUgKz0gQGNsYXNzTmFtZVxuXHRcdEByZW5kZXIoKVxuXHRcdCQoIGRvY3VtZW50ICkub24gXCJrZXl1cFwiLCBAX29uS2V5XG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCkgKVxuXHRcdEAkYWRkQnRuID0gQCQoIFwiLmFkZC1mYWNldC1idG5cIiApXG5cdFx0cmV0dXJuXG5cblx0X2FkZEZhY2V0OiAoIGV2bnQgKT0+XG5cdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaW4gS0VZQ09ERVMuRVNDXG5cdFx0XHRAZXhpdCgpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdGV4aXQ6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXdcblx0XHRcdCNjb25zb2xlLmxvZyBcIk1BSU4gUkVNT1ZFIFNFTEVDVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU1VCXCIsIEBzdWJ2aWV3XG5cdFx0XHRAc3Vidmlldy5yZW1vdmUoKVxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0cmV0dXJuXG5cblx0cmVtRmFjZXQ6ICggZmFjZXRNICk9PlxuXHRcdEByZXN1bHRzLnJlbW92ZSggZmFjZXRNLmdldCggXCJuYW1lXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0YWRkRmFjZXQ6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU0VMRUNUIEVYSVNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU1VCIEVYSVNUXCJcblx0XHRcdEBzdWJ2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIEVNUFRZIENPTExcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBTZWxlY3RvclZpZXcoIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBjdXN0b206IGZhbHNlIClcblxuXHRcdEAkYWRkQnRuLmJlZm9yZSggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNFTEVDVCBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRpZiBub3QgcmVzdWx0cz8ubGVuZ3RoIGFuZCBAc3Vidmlldz9cblx0XHRcdFx0QHN1YnZpZXcub2ZmKClcblx0XHRcdFx0QHN1YnZpZXcucmVtb3ZlKClcblx0XHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0gKT0+XG5cblx0XHRcdEBzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uIClcblx0XHRcdEAkYWRkQnRuLmJlZm9yZSggQHN1YnZpZXcucmVuZGVyKCkgKVxuXHRcdFx0QHN1YnZpZXcub3BlbigpXG5cblx0XHRcdEBzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdFx0I2NvbnNvbGUubG9nIFwiU1VCIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0XHRAc3Vidmlldy5vZmYoKVxuXHRcdFx0XHRAc3Vidmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0XHRyZXR1cm4gXG5cblx0XHRcdEBzdWJ2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0sIHJlc3VsdHMgKT0+XG5cdFx0XHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdFx0XHRAcmVzdWx0cy5hZGQoIF8uZXh0ZW5kKCByZXN1bHRzLCB7IG5hbWU6IGZhY2V0TS5nZXQoIFwibmFtZVwiICksIHR5cGU6IGZhY2V0TS5nZXQoIFwidHlwZVwiICkgfSApLCB7IG1lcmdlOiB0cnVlLCBwYXJzZTogdHJ1ZSwgX2ZhY2V0OmZhY2V0TSB9IClcblx0XHRcdFx0I0BzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdCNAc3VidmlldyA9IG51bGxcblxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5WaWV3IiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTZWxlY3RvclZpZXcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRzL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9yLmphZGVcIiApXG5cdHRlbXBsYXRlRWw6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3JsaS5qYWRlXCIgKVxuXHRtdWx0aVNlbGVjdDogZmFsc2VcblxuXHRjbGFzc05hbWU6ID0+XG5cdFx0Y2xzID0gWyBcImFkZC1mYWNldFwiIF1cblx0XHRpZiBAY3VzdG9tXG5cdFx0XHRjbHMucHVzaCBcImN1c3RvbVwiXG5cdFx0cmV0dXJuIGNscy5qb2luKCBcIiBcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwibW91c2Vkb3duIGFcIjogXCJfb25DbGlja1wiXG5cdFx0XCJmb2N1cyBpbnB1dCMje0BjaWR9XCI6IFwib3BlblwiXG5cdFx0XCJibHVyIGlucHV0IyN7QGNpZH1cIjogXCJjbG9zZVwiXG5cdFx0XCJrZXlkb3duIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAY3VzdG9tID0gIG9wdGlvbnMuY3VzdG9tIG9yIGZhbHNlXG5cdFx0QGFjdGl2ZUlkeCA9IGlmIEBjdXN0b20gdGhlbiAtMSBlbHNlIDBcblx0XHRAY3VyclF1ZXJ5ID0gXCJcIlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAc2VhcmNoY29sbCA9IEBjb2xsZWN0aW9uLnN1YiggLT50cnVlIClcblx0XHRAcmVzdWx0ID0gbmV3IEBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yKClcblx0XHRAb24gXCJzZWxlY3RlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggcmVzdWx0IClcblx0XHRcdEByZXN1bHQuYWRkKCByZXN1bHQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0I0BsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwiYWRkXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEBjaGVja09wdGlvbnNFbXB0eSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIGN1c3RvbTogQGN1c3RvbSApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRsaXN0ID0gQCRlbC5maW5kKCBcIiMje0BjaWR9dHlwZWxpc3RcIiApXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdHJlbmRlclJlczogPT5cblx0XHRAJGxpc3QuZW1wdHkoKVxuXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEBzZWFyY2hjb2xsLm1vZGVsc1xuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdF9pZCA9IG1vZGVsLmlkXG5cblx0XHRcdGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCA+IDFcblx0XHRcdFx0X2xibCA9IF9sYmwucmVwbGFjZSggbmV3IFJlZ0V4cCggQGN1cnJRdWVyeSwgXCJnaVwiICksICgoIHN0ciApLT5yZXR1cm4gXCI8Yj4je3N0cn08L2I+XCIgKSApXG5cdFx0XHRfbGlzdC5wdXNoIGxhYmVsOiBfbGJsLCBpZDogX2lkXG5cdFx0QCRsaXN0LmFwcGVuZCggQHRlbXBsYXRlRWwoIGxpc3Q6IF9saXN0LCBxdWVyeTogQGN1cnJRdWVyeSwgYWN0aXZlSWR4OiBAYWN0aXZlSWR4LCBjdXN0b206IEBjdXN0b20gKSApXG5cdFx0cmV0dXJuIEAkbGlzdFxuXG5cdGNoZWNrT3B0aW9uc0VtcHR5OiA9PlxuXHRcdCNpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gMFxuXHRcdCNcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0X29uQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRfaWQgPSBAJCggZXZudC5jdXJyZW50VGFyZ2V0ICkuZGF0YSggXCJpZFwiIClcblx0XHRAdHJpZ2dlciBcInNlbGVjdGVkXCIsIEBjb2xsZWN0aW9uLmdldCggX2lkIClcblx0XHRpZiBub3QgQG11bHRpU2VsZWN0XG5cdFx0XHRAY2xvc2UoKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cblx0c2VsZWN0ZWQ6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QG1vdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAbW92ZSggZmFsc2UgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblxuXHRcdCNAc2VhcmNoLlxuXHRcdF9xID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKClcblx0XHRpZiBfcSBpcyBAY3VyclF1ZXJ5XG5cdFx0XHRyZXR1cm5cblxuXHRcdEBjdXJyUXVlcnkgPSBfcVxuXG5cdFx0QHNlYXJjaGNvbGwudXBkYXRlU3ViRmlsdGVyKCAoIG1kbCApLT5cblx0XHRcdGlmIG5vdCBfcT8ubGVuZ3RoXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRfbWF0Y2ggPSBtZGwubWF0Y2goIF9xIClcblx0XHRcdHJldHVybiBfbWF0Y2hcblx0XHQsIGZhbHNlIClcblxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfdG9wID0gKCBpZiBAY3VzdG9tIHRoZW4gLTEgZWxzZSAwIClcblx0XHRpZiB1cCBcblx0XHRcdGlmICggQGFjdGl2ZUlkeCAtIDEgKSA8IF90b3Bcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCAtIDEgXG5cdFx0ZWxzZSBcblx0XHRcdGlmIEBzZWFyY2hjb2xsLmxlbmd0aCA8PSBAYWN0aXZlSWR4ICsgMVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4ICsgMSBcblxuXHRcdF9saXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhXCIgKVxuXG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0QCQoIF9saXN0WyBfbmV3aWR4IF0gKS5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG5cblx0XHRAYWN0aXZlSWR4ID0gX25ld2lkeFxuXHRcdFxuXHRcdHJldHVyblxuXG5cdHNlbGVjdDogPT5cblx0XHRpZiBAYWN0aXZlSWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBAY29sbGVjdGlvbi5hdCggQGFjdGl2ZUlkeCApXG5cdFx0ZWxzZVxuXHRcdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBAY3VyclF1ZXJ5LCBjdXN0b206IHRydWUgKVxuXG5cdFx0aWYgbm90IEBtdWx0aVNlbGVjdFxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclZpZXciLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiBcInN1YlwiXG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogXG5cdFx0XCJjbGljayAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblxuXHRyZW5kZXI6ICggb3B0TWRsICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cblx0XHRAJGVsLmh0bWwgQHRlbXBsYXRlKCBsYWJlbDogQG1vZGVsLmdldExhYmVsKCksIHNlbGVjdGVkOiBfbGlzdCApXG5cdFx0QCRzdWIgPSBAJCggXCIuc3Vic2VsZWN0XCIgKVxuXHRcdEAkcmVzdWx0cyA9IEAkKCBcIi5zdWJyZXN1bHRzXCIgKVxuXHRcdHJldHVybiBAZWxcblxuXHRkZWw6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBzZWxlY3R2aWV3Py5yZW1vdmUoKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsIClcblx0XHRAJHJlc3VsdHMuaHRtbCggQHNlbGVjdHZpZXcucmVuZGVyUmVzdWx0KCkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRyZXR1cm5cblxuXHRpc09wZW46ID0+XG5cdFx0cmV0dXJuIEBzZWxlY3R2aWV3P1xuXG5cdGZvY3VzOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdEBvcGVuKClcblx0XHRyZXR1cm5cblxuXHRvcGVuOiA9PlxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IEBtb2RlbC5TdWJWaWV3KCBtb2RlbDogQG1vZGVsLCBlbDogQCRzdWIgKVxuXG5cdFx0QCRlbC5hcHBlbmQoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCApXG5cdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U3ViIixudWxsLCIhZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSxlKTtlbHNle3ZhciBmO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/Zj13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9mPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKGY9c2VsZiksZi5qYWRlPWUoKX19KGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIGF0dHJzID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcblxuICBpZiAoYWMgfHwgYmMpIHtcbiAgICBhYyA9IGFjIHx8IFtdO1xuICAgIGJjID0gYmMgfHwgW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xuICB9XG5cbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbnVsbHModmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xufVxuXG4vKipcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKSA6XG4gICAgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JykgPyBPYmplY3Qua2V5cyh2YWwpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB2YWxba2V5XTsgfSkgOlxuICAgIFt2YWxdKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xuICB2YXIgYnVmID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufTtcblxuXG5leHBvcnRzLnN0eWxlID0gZnVuY3Rpb24gKHZhbCkge1xuICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbCkubWFwKGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgcmV0dXJuIHN0eWxlICsgJzonICsgdmFsW3N0eWxlXTtcbiAgICB9KS5qb2luKCc7Jyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XG4gIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICB2YWwgPSBleHBvcnRzLnN0eWxlKHZhbCk7XG4gIH1cbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodmFsKS5pbmRleE9mKCcmJykgIT09IC0xKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1NpbmNlIEphZGUgMi4wLjAsIGFtcGVyc2FuZHMgKGAmYCkgaW4gZGF0YSBhdHRyaWJ1dGVzICcgK1xuICAgICAgICAgICAgICAgICAgICd3aWxsIGJlIGVzY2FwZWQgdG8gYCZhbXA7YCcpO1xuICAgIH07XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBlbGltaW5hdGUgdGhlIGRvdWJsZSBxdW90ZXMgYXJvdW5kIGRhdGVzIGluICcgK1xuICAgICAgICAgICAgICAgICAgICdJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYnVmID0gW107XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG4gIGlmIChrZXlzLmxlbmd0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcbiAgfVxuICB2YXIgY29udGV4dCA9IDNcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcblxuICAvLyBFcnJvciBjb250ZXh0XG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxuICAgICAgKyBjdXJyXG4gICAgICArICd8ICdcbiAgICAgICsgbGluZTtcbiAgfSkuam9pbignXFxuJyk7XG5cbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcbiAgdGhyb3cgZXJyO1xufTtcblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyJdfQ==
