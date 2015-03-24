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
buf.push("<div class=\"rm-facet-btn glyphicon glyphicon-remove\"></div><span class=\"sublabel\">" + (jade.escape((jade_interp = label) == null ? '' : jade_interp)) + ":</span><ul class=\"subresults\">");
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

buf.push("<div class=\"add-facet-btn glyphicon glyphicon-plus\"></div>");;return buf.join("");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9zdWJyZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvdG1wbHMvZGF0ZXJhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N1Yi5qYWRlIiwiX3NyYy9qcy90bXBscy93cmFwcGVyLmphZGUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvZGF0ZXJhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VibnVtYmVyLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zdWIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9qYWRlL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDZFQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVCxDQUFYLENBQUE7O0FBQUEsTUFDQSxHQUFTLE9BQUEsQ0FBUyx1QkFBVCxDQURULENBQUE7O0FBQUEs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R0FBTyxVQUFQLENBQUE7O3FCQUFBOztHQUR5QixPQUFBLENBQVMsZ0JBQVQsRUFOMUIsQ0FBQTs7QUFBQSxNQVNNLENBQUMsT0FBUCxHQUFpQixXQVRqQixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0M7QUFBQSxFQUFBLE1BQUEsRUFBUSxFQUFSO0FBQUEsRUFDQSxPQUFBLEVBQVMsRUFEVDtBQUFBLEVBRUEsSUFBQSxFQUFNLEVBRk47QUFBQSxFQUdBLE1BQUEsRUFB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1haW5WaWV3ID0gcmVxdWlyZSggXCIuL3ZpZXdzL21haW5cIiApXG5GYWNldHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcbkZjdFN0cmluZyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc3RyaW5nXCIgKVxuRmN0QXJyYXkgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2FycmF5XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0bmV3IE1haW5WaWV3KCBlbDogQCRlbCwgY29sbGVjdGlvbjogQGZhY2V0cywgcmVzdWx0czogQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRWw6ICggZWwgKT0+XG5cblx0XHRpZiBub3QgZWw/XG5cdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVNSVNTSU5HRUxcIiApXG5cblx0XHRpZiBfLmlzU3RyaW5nKCBlbCApXG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxTVFJJTkdcIiApXG5cblx0XHRcdF8kZWwgPSBAJCggZWwgKVxuXHRcdFx0aWYgbm90IF8kZWw/Lmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxTVFJJTkdcIiApXG5cblx0XHRcdHJldHVybiBfJGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIGpRdWVyeVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMSlFVRVJZXCIgKVxuXG5cdFx0XHQjIFRPRE8gaGFuZGxlIG11bHRpcGxlIGpRdWVyeSBlbGVtZW50cyB0byBJR0dZIGluc3RhbmNlc1xuXHRcdFx0aWYgZWwubGVuZ3RoID4gMVxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVTSVpFRUxKUVVFUllcIiApXG5cblx0XHRcdHJldHVybiBlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBFbGVtZW50XG5cdFx0XHRyZXR1cm4gQCQoIGVsIClcblxuXHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFRZUEVcIiApXG5cblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUZhY2V0czogKCBmYWNldHMgKT0+XG5cdFx0X3JldCA9IFtdXG5cdFx0Zm9yIGZhY2V0IGluIGZhY2V0cyB3aGVuICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdF9yZXQucHVzaCBfZmN0XG5cblx0XHRyZXR1cm4gbmV3IEZhY2V0cyggX3JldCApXG5cblx0X2NyZWF0ZUZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdHN3aXRjaCBmYWNldC50eXBlLnRvTG93ZXJDYXNlKClcblx0XHRcdHdoZW4gXCJzdHJpbmdcIiB0aGVuIHJldHVybiBuZXcgRmN0U3RyaW5nKCBmYWNldCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCApXG5cdFx0XHR3aGVuIFwiZGF0ZXJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdERhdGVSYW5nZSggZmFjZXQgKVxuXG5cdGFkZEZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdGlmIG5vdCBAZmFjZXRzP1xuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0QGZhY2V0cy5hZGQoIF9mY3QgKVxuXHRcdHJldHVybiBAXG5cblx0X2Vycm9yOiAoIHR5cGUsIGRhdGEgPSB7fSApPT5cblx0XHRpZiBAZXJyb3JzWyB0eXBlIF0/XG5cdFx0XHRfbXNnID0gQGVycm9yc1sgdHlwZSBdKCBkYXRhIClcblx0XHRlbHNlXG5cdFx0XHRfbXNnID0gXCItXCJcblx0XHRfZXJyID0gbmV3IEVycm9yKClcblx0XHRfZXJyLm5hbWUgPSB0eXBlXG5cdFx0X2Vyci5tZXNzYWdlID0gX21zZ1xuXHRcdHJldHVybiBfZXJyXG5cblx0Z2V0UXVlcnk6ID0+XG5cdFx0cmV0dXJuIEByZXN1bHRzXG5cblx0dHJpZ2dlckNoYW5nZTogPT5cblx0XHRAdHJpZ2dlciggXCJjaGFuZ2VcIiwgQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXG5cdF9pbml0RXJyb3JzOiA9PlxuXHRcdEBlcnJvcnMgPSB7fVxuXHRcdGZvciBfaywgX3RtcGwgb2YgQEVSUk9SUygpXG5cdFx0XHRAZXJyb3JzWyBfayBdID0gXy50ZW1wbGF0ZSggX3RtcGwgKSBcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6ID0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1kiLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKSBcblx0XG5cdCMgb3IgYnkgT2JqZWN0XG5cdHN1YkNvbGxPID0gcGFyZW50Q29sbC5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9ICkgXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscyApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApIFxuXHRcdFx0YWRkZWQgPSBAZ2V0KCBfbSApP1xuXHRcdFx0aWYgYWRkZWQgYW5kIG5vdCB0b0FkZFxuXHRcdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRlbHNlIGlmIG5vdCBhZGRlZCBhbmQgdG9BZGRcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIGJhc2UgY29sbGVjdGlvbiBvbiBhZGQgdG8gc3ViXG5cdFx0X3N1Yi5vbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBzdWIgY29sbGVjdGlvbiBvbiBhZGQgdG8gYmFzZSBpZiBpdCBtYXRjaGVzIHRoZSBmaWx0ZXJcblx0XHRAb24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0aWYgQF9mbkZpbHRlciggX20gKVxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdF9zdWIub24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0I0ByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZXNldFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAdXBkYXRlU3ViRmlsdGVyKClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHN0b3JlIHRoZSBzdWJjb2xsZWN0aW9uIHVuZGVyIHRoZSBjdXJyZW50IGNvbGxlY3Rpb25cblx0XHRAc3ViQ29sbHMucHVzaCggX3N1YiApXG5cblx0XHRyZXR1cm4gX3N1YlxuXG5cdCMjI1xuXHQjIyB1cGRhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLnVwZGF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRNZXRob2QgdG8gdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBUaGVuIGFsbCBtb2RlbHMgd2lsbCBiZSByZXNldGUgYnkgdGhlIG5ldyBmaWx0ZXIuIFNvIHlvdSBoYXZlIHRvIGxpc3RlbiB0byB0ZWggcmVzZXQgZXZlbnRcblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuIFxuXHRcblx0QHJldHVybiB7IFNlbGYgfSBpdHNlbGZcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHR1cGRhdGVTdWJGaWx0ZXI6ICggZmlsdGVyLCBhc1Jlc2V0ID0gdHJ1ZSApPT5cblx0XHRpZiBAX3BhcmVudENvbD9cblxuXHRcdFx0IyBzZXQgdGhlIG5ldyBmaWx0ZXIgbWV0aG9kXG5cdFx0XHRAX2ZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyICkgaWYgZmlsdGVyP1xuXG5cdFx0XHRfbW9kZWxzID0gQF9wYXJlbnRDb2wuZmlsdGVyKCBAX2ZuRmlsdGVyIClcblxuXHRcdFx0IyByZXNldCB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBuZXcgbW9kZWxzXG5cdFx0XHRpZiBhc1Jlc2V0XG5cdFx0XHRcdEByZXNldCggX21vZGVscyApXG5cdFx0XHRcdHJldHVybiBAXG5cblx0XHRcdG5ld2lkcyA9IF8ucGx1Y2soIF9tb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Y3VycmlkcyA9IF8ucGx1Y2soIEBtb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Zm9yIHJpZCBpbiBfLmRpZmZlcmVuY2UoIGN1cnJpZHMsIG5ld2lkcyApXG5cdFx0XHRcdEByZW1vdmUoIHJpZCApXG5cdFx0XHRcdFxuXHRcdFx0X2FkZElkcyA9IF8uZGlmZmVyZW5jZSggbmV3aWRzLCBjdXJyaWRzIClcblx0XHRcdGZvciBtZGwgaW4gX21vZGVscyB3aGVuIG1kbC5jaWQgaW4gX2FkZElkc1xuXHRcdFx0XHRAYWRkKCBtZGwgKVxuXG5cdFx0cmV0dXJuIEBcblxuXG5cdCMjI1xuXHQjIyBfZ2VuZXJhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLl9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRJbnRlcm5hbCBtZXRob2QgdGggY29udmVydCBhIGZpbHRlciBhcmd1bWVudCB0byBhIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy4gXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvbiBcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X2dlbmVyYXRlU3ViRmlsdGVyOiAoIGZpbHRlciApPT5cblx0XHQjIGNvbnN0cnVjdCB0aGUgZmlsdGVyIGZ1bmN0aW9uXG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNBcnJheSggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApPT5cblx0XHRcdFx0X20uaWQgaW4gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzU3RyaW5nKCBmaWx0ZXIgKSBvciBfLmlzTnVtYmVyKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICk9PlxuXHRcdFx0XHRfbS5pZCBpcyBmaWx0ZXJcblx0XHRlbHNlXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKT0+XG5cdFx0XHRcdGZvciBfbm0sIF92bCBvZiBmaWx0ZXJcblx0XHRcdFx0XHRpZiBfbS5nZXQoIF9ubSApIGlzbnQgX3ZsXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdHJldHVybiBmbkZpbHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lU3ViIiwiY2xhc3MgRmN0QXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfc3RyaW5nXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheVwiIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEFycmF5XG4iLCJjbGFzcyBGYWNldEJhc2UgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvYmFzZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IFwibmFtZVwiXG5cdFx0bGFiZWw6IFwiRGVzY3JpcHRpb25cIlxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2UiLCJjbGFzcyBGY3REYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvZGF0ZXJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0b3B0czoge31cblx0XHRcdHZhbHVlOiBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZSIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRtaW46IDBcblx0XHRcdG1heDogMTAwXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogNTBcblxubW9kdWxlLmV4cG9ydHMgPSBGY3ROdW1iZXIiLCJjbGFzcyBGY3RTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic3RyaW5nXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmciLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOiBcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogbnVsbFxuXHRcdHZhbHVlOiBudWxsXG5cbmNsYXNzIElnZ3lSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHRtb2RlbDogSWdneVJlc3VsdFxuXHRwYXJzZTogKCBhdHRyLCBvcHRpb25zICk9PlxuXHRcdF9tb2RpZnkgPSBvcHRpb25zLl9mYWNldD8uZ2V0KCBcIm1vZGlmeVwiIClcblx0XHRfbmFtZSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwibmFtZVwiIClcblx0XHRfdHlwZSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwidHlwZVwiIClcblx0XHRpZiBfbW9kaWZ5PyBhbmQgXy5pc0Z1bmN0aW9uKCBfbW9kaWZ5IClcblx0XHRcdGF0dHIudmFsdWUgPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBfbmFtZSwgX3R5cGUgKVxuXHRcdHJldHVybiBhdHRyXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneVJlc3VsdHMiLCJjbGFzcyBCYXNlUmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggQGlkQXR0cmlidXRlICkgb3IgXCItXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHMiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCkge1xuaWYgKCBvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYWN0aXZlSWR4LCBjdXN0b20sIGxpc3QsIHF1ZXJ5LCB1bmRlZmluZWQpIHtcbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTppZHggPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTppZHggPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBzZWxlY3RlZCwgdW5kZWZpbmVkKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVxcXCI+PC9kaXY+PHNwYW4gY2xhc3M9XFxcInN1YmxhYmVsXFxcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBsYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiOjwvc3Bhbj48dWwgY2xhc3M9XFxcInN1YnJlc3VsdHNcXFwiPlwiKTtcbmlmICggc2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBzZWxlY3RlZFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzZWxlY3RlZDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjxkaXYgY2xhc3M9XFxcInN1YnNlbGVjdFxcXCI+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwibGFiZWxcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxhYmVsOnR5cGVvZiBsYWJlbCE9PVwidW5kZWZpbmVkXCI/bGFiZWw6dW5kZWZpbmVkLFwic2VsZWN0ZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnNlbGVjdGVkOnR5cGVvZiBzZWxlY3RlZCE9PVwidW5kZWZpbmVkXCI/c2VsZWN0ZWQ6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImFkZC1mYWNldC1idG4gZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIj48L2Rpdj5cIik7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBcblx0XCJMRUZUXCI6IDM3XG5cdFwiUklHSFRcIjogMzlcblx0XCJVUFwiOiAzOFxuXHRcIkRPV05cIjogNDBcblx0XCJFU0NcIjogWyAyMjksIDI3IF1cblx0XCJFTlRFUlwiOiAxMyIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNCYXNlIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHRpbml0aWFsaXplOiA9PlxuXHRcdEByZXN1bHQgPSBuZXcgU3ViUmVzdWx0cygpXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcImlucHV0XCJcblxuXHRmb2N1czogPT5cblx0XHRAJGlucC5mb2N1cygpXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cblx0XHRyZXR1cm4gXCI8bGk+XCIgKyBfbGlzdC5qb2luKCBcIjwvbGk+PGxpPlwiICkgKyBcIjwvbGk+XCJcblx0XHRcblx0b3BlbjogPT5cblx0XHRAJGVsLmFkZENsYXNzKCBcIm9wZW5cIiApXG5cdFx0QGlzT3BlbiA9IHRydWVcblx0XHRAdHJpZ2dlciggXCJvcGVuZWRcIiApXG5cdFx0cmV0dXJuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRjaWQ6IEBjaWRcdFx0XG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCBAZ2V0VGVtcGxhdGVEYXRhKCkgKSApXG5cdFx0QCRpbnAgPSBAJGVsLmZpbmQoIFwiaW5wdXQjI3tAY2lkfVwiIClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwib3BlblwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAaXNPcGVuID0gZmFsc2Vcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQGdldFZhbHVlKClcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogPT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpLCBjdXN0b206IHRydWUgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNCYXNlIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNEYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvZGF0ZXJhbmdlLmphZGVcIiApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Zm9yY2VkRGF0ZVJhbmdlT3B0czpcblx0XHRvcGVuczogXCJyaWdodFwiXG5cblx0ZXZlbnRzOiA9PiBcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdGlmIG5vdCBAZGF0ZXJhbmdlcGlja2VyP1xuXHRcdFx0X29wdHMgPSBfLmV4dGVuZCgge30sIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIEBmb3JjZWREYXRlUmFuZ2VPcHRzIClcblx0XHRcdEAkaW5wLmRhdGVyYW5nZXBpY2tlciggX29wdHMsIEBfZGF0ZVJldHVybiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyID0gQCRpbnAuZGF0YSggXCJkYXRlcmFuZ2VwaWNrZXJcIiApXG5cdFx0XHRAJGlucC5vbiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0XHRAJGlucC5vbiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lcj8uYWRkQ2xhc3MoIFwiZGF0ZXJhbmdlLWlnZ3lcIiApXG5cblx0XHRlbHNlXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLnNob3coKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHJlbW92ZTogPT5cblx0XHRAZGF0ZXJhbmdlcGlja2VyPy5yZW1vdmUoKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXG5cdFx0X3RpbWUgPSBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLnRpbWVQaWNrZXJcblxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBAc3RhcnREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0aWYgQGVuZERhdGU/XG5cdFx0XHRfcyArPSBcIiAtIFwiXG5cdFx0XHRfcyArPSBAZW5kRGF0ZS5mb3JtYXQoICggaWYgX3RpbWUgdGhlbiBcIkxMTExcIiBlbHNlIFwiTExcIiApIClcblxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF9vdXQgPSBbIEBzdGFydERhdGUudmFsdWVPZigpIF1cblx0XHRfb3V0LnB1c2ggQGVuZERhdGUudmFsdWVPZigpIGlmIEBlbmREYXRlP1xuXHRcdHJldHVybiBfb3V0XG5cblx0c2VsZWN0OiA9PlxuXHRcdF9Nb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiBAZ2V0VmFsdWUoKSApXG5cdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0RhdGVSYW5nZSIsImNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuXG5jbGFzcyBBcnJheU9wdGlvbnMgZXh0ZW5kcyByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBBcnJheU9wdGlvblxuXG5jbGFzcyBGYWNldFN1YkFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL3N1YnN0cmluZ1wiIClcblx0bXVsdGlTZWxlY3Q6IHRydWVcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheSIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvbnVtYmVyLmphZGVcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcImlucHV0XCJcblx0XHRcImNoYW5nZSBzZWxlY3QjI3tAY2lkfW9wXCI6IFwic3dpdGNoRm9jdXNcIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdGlmIEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0XHRAJGlucE9wID0gQCRlbC5maW5kKCBcInNlbGVjdCMje0BjaWR9b3BcIiApXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0c3dpdGNoRm9jdXM6ICggdHlwZT1cImluXCIgKT0+XG5cdFx0aWYgdHlwZSBpcyBcIm9wXCJcblx0XHRcdEBmb2N1cygpXG5cdFx0ZWxzZVxuXHRcdFx0QGZvY3VzKCB0cnVlIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHQjY29uc29sZS5sb2cgXCJmb2N1c1wiLCBpbnAgb3Igbm90IEAkaW5wT3A/LCBpbnAsIG5vdCBAJGlucE9wPywgQCRpbnBPcFxuXHRcdGlmIGlucCBvciBub3QgQCRpbnBPcD9cblx0XHRcdHN1cGVyXG5cdFx0XHRyZXR1cm5cblx0XHRAJGlucE9wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgeyBvcGVyYXRvcnM6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKSB9IClcblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSAqIC0xIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5SSUdIVFxuXHRcdFx0XHRcdEBzd2l0Y2hGb2N1cyggXCJpblwiIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5MRUZUXG5cdFx0XHRcdFx0QHN3aXRjaEZvY3VzKCBcIm9wXCIgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5dXBcIlxuXHRcdFx0X3YgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUucmVwbGFjZSggL1xcRC9naSwgXCJcIiApXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXHRcdFx0IFxuXHRcdFx0QHNldE51bWJlciggX3YgKVxuXHRcdHJldHVyblxuXG5cdGNyZW1lbnQ6ICggY2hhbmdlICk9PlxuXHRcdF92ID0gQCRpbnAudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0X3YgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0XHRAc2V0TnVtYmVyKCBfdiArIGNoYW5nZSApXG5cblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRfcmV0ID0gXG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdFx0XHRvcGVyYXRvcjogQCRpbnBPcC52YWwoKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPSBcblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0cmV0dXJuIHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdHNldE51bWJlcjogKCBfdiApPT5cblx0XHRpZiBpc05hTiggX3YgKVxuXHRcdFx0QCRpbnAudmFsKFwiXCIpXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9tYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRfbWluID0gQG1vZGVsLmdldCggXCJtaW5cIiApXG5cdFx0X3N0ZXAgPSBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApXG5cblx0XHRAJGlucC52YWwoIEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YsIF9taW4sIF9tYXgsIF9zdGVwICkgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSwgbWluLCBtYXgsIHN0ZXAgKS0+XG5cdFx0IyBmaXggcmV2ZXJzZWQgbWluL21heCBzZXR0aW5nXG5cdFx0aWYgbWluID4gbWF4XG5cdFx0XHRfdG1wID0gbWluXG5cdFx0XHRtaW4gPSBtYXhcblx0XHRcdG1heCA9IF90bXBcblx0XHRcblx0XHQjIG9uIGV4eGVkZGluZyB0aGUgbGltaXRzIHVzZSB0aGUgbGltaXRcblx0XHRpZiBfdmFsdWUgPCBtaW5cblx0XHRcdHJldHVybiBtaW5cblx0XHRpZiBfdmFsdWUgPiBtYXhcblx0XHRcdHJldHVybiBtYXhcblxuXHRcdCMgc2VhcmNoIHRoZSBuZWFyZXN0IF92YWx1ZSB0byB0aGUgc3RlcFxuXHRcdGlmIHN0ZXAgaXNudCAxXG5cdFx0XHRfdmFsdWUgPSBuZWFyZXN0KCBfdmFsdWUsIHN0ZXAgKVxuXHRcdFxuXHRcdCMgY2FsYyB0aGUgcHJlY2lzaW9uIGJ5IHN0ZXBcblx0XHRfcHJlY2lzaW9uID0gTWF0aC5tYXgoIDAsIE1hdGguY2VpbCggTWF0aC5sb2coIDEvc3RlcCApIC8gTWF0aC5sb2coIDEwICkgKSApXG5cdFx0aWYgX3ByZWNpc2lvbiA+IDBcblx0XHRcdF92YWx1ZSA9IHByZWNpc2lvbiggX3ZhbHVlLCBfcHJlY2lzaW9uIClcblx0XHRlbHNlXG5cdFx0XHRfdmFsdWUgPSBNYXRoLnJvdW5kKCBfdmFsdWUgKVxuXHRcdFx0XG5cdFx0cmV0dXJuIF92YWx1ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5jbGFzcyBGYWNldFN1YlN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdG9wdERlZmF1bHQ6IFxuXHRcdG5hbWU6IFwiLVwiXG5cdFx0dmFsdWU6IFwiLVwiXG5cdFx0Z3JvdXA6IG51bGxcblxuXHRvcHRDb2xsOiBTdHJpbmdPcHRpb25zXG5cblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdG9wdGlvbnMuY3VzdG9tID0gdHJ1ZVxuXHRcdEBjb2xsZWN0aW9uID0gQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBvcHRpb25zLm1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQuZmlyc3QoKT8uaWRcblxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0LCBncm91cDogbnVsbCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3QoICApXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0ICk7XG5cblx0XHRyZXR1cm4gbmV3IEBvcHRDb2xsKCBfb3B0cyApXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJTdHJpbmciLCJTdWJWaWV3ID0gcmVxdWlyZSggXCIuL3N1YlwiIClcblNlbGVjdG9yVmlldyA9IHJlcXVpcmUoIFwiLi9zZWxlY3RvclwiIClcblxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBNYWluVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvd3JhcHBlci5qYWRlXCIgKVxuXHRjbGFzc05hbWU6IFwiaWdneSBjbGVhcmZpeFwiXG5cblx0ZXZlbnRzOiBcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcblxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cblx0XHRAZWwuY2xhc3NOYW1lICs9IEBjbGFzc05hbWVcblx0XHRAcmVuZGVyKClcblx0XHQkKCBkb2N1bWVudCApLm9uIFwia2V5dXBcIiwgQF9vbktleVxuXHRcdHJldHVyblxuXG5cdHJlbmRlcjogPT5cblx0XHRAJGVsLmh0bWwoIEB0ZW1wbGF0ZSgpIClcblx0XHRAJGFkZEJ0biA9IEAkKCBcIi5hZGQtZmFjZXQtYnRuXCIgKVxuXHRcdHJldHVyblxuXG5cdF9hZGRGYWNldDogKCBldm50ICk9PlxuXHRcdEBhZGRGYWNldCgpXG5cdFx0cmV0dXJuXG5cblx0X29uS2V5OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0QGV4aXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRleGl0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHQjY29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTRUxFQ1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0aWYgQHN1YnZpZXdcblx0XHRcdCNjb25zb2xlLmxvZyBcIk1BSU4gUkVNT1ZFIFNVQlwiLCBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcucmVtb3ZlKClcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdHJldHVyblxuXG5cdHJlbUZhY2V0OiAoIGZhY2V0TSApPT5cblx0XHRAcmVzdWx0cy5yZW1vdmUoIGZhY2V0TS5nZXQoIFwibmFtZVwiICkgKVxuXHRcdHJldHVyblxuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNFTEVDVCBFWElTVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBzdWJ2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNVQiBFWElTVFwiXG5cdFx0XHRAc3Vidmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSApXG5cblx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdEBzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNICk9PlxuXG5cdFx0XHRAc3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiApXG5cdFx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzdWJ2aWV3LnJlbmRlcigpIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXG5cdFx0XHRAc3Vidmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdFx0QHN1YnZpZXcub2ZmKClcblx0XHRcdFx0QHN1YnZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdFx0cmV0dXJuIFxuXG5cdFx0XHRAc3Vidmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNLCByZXN1bHRzICk9PlxuXHRcdFx0XHRAY29sbGVjdGlvbi5yZW1vdmUoIGZhY2V0TSApXG5cblx0XHRcdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggcmVzdWx0cywgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDpmYWNldE0gfSApXG5cdFx0XHRcdCNAc3Vidmlldy5vZmYoKVxuXHRcdFx0XHQjQHN1YnZpZXcgPSBudWxsXG5cblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBNYWluVmlldyIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU2VsZWN0b3JWaWV3IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0cy9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3Rvci5qYWRlXCIgKVxuXHR0ZW1wbGF0ZUVsOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9ybGkuamFkZVwiIClcblx0bXVsdGlTZWxlY3Q6IGZhbHNlXG5cblx0Y2xhc3NOYW1lOiA9PlxuXHRcdGNscyA9IFsgXCJhZGQtZmFjZXRcIiBdXG5cdFx0aWYgQGN1c3RvbVxuXHRcdFx0Y2xzLnB1c2ggXCJjdXN0b21cIlxuXHRcdHJldHVybiBjbHMuam9pbiggXCIgXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRcIm1vdXNlZG93biBhXCI6IFwiX29uQ2xpY2tcIlxuXHRcdFwiZm9jdXMgaW5wdXQjI3tAY2lkfVwiOiBcIm9wZW5cIlxuXHRcdFwiYmx1ciBpbnB1dCMje0BjaWR9XCI6IFwiY2xvc2VcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblx0XHRcImtleXVwIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0QGN1c3RvbSA9ICBvcHRpb25zLmN1c3RvbSBvciBmYWxzZVxuXHRcdEBhY3RpdmVJZHggPSBpZiBAY3VzdG9tIHRoZW4gLTEgZWxzZSAwXG5cdFx0QGN1cnJRdWVyeSA9IFwiXCJcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHNlYXJjaGNvbGwgPSBAY29sbGVjdGlvbi5zdWIoIC0+dHJ1ZSApXG5cdFx0QHJlc3VsdCA9IG5ldyBAY29sbGVjdGlvbi5jb25zdHJ1Y3RvcigpXG5cdFx0QG9uIFwic2VsZWN0ZWRcIiwgKCByZXN1bHQgKT0+XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIHJlc3VsdCApXG5cdFx0XHRAcmVzdWx0LmFkZCggcmVzdWx0IClcblx0XHRcdHJldHVyblxuXHRcdCNAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXG5cdFx0XHRpZiBAY3VyclF1ZXJ5Py5sZW5ndGggPiAxXG5cdFx0XHRcdF9sYmwgPSBfbGJsLnJlcGxhY2UoIG5ldyBSZWdFeHAoIEBjdXJyUXVlcnksIFwiZ2lcIiApLCAoKCBzdHIgKS0+cmV0dXJuIFwiPGI+I3tzdHJ9PC9iPlwiICkgKVxuXHRcdFx0X2xpc3QucHVzaCBsYWJlbDogX2xibCwgaWQ6IF9pZFxuXHRcdEAkbGlzdC5hcHBlbmQoIEB0ZW1wbGF0ZUVsKCBsaXN0OiBfbGlzdCwgcXVlcnk6IEBjdXJyUXVlcnksIGFjdGl2ZUlkeDogQGFjdGl2ZUlkeCwgY3VzdG9tOiBAY3VzdG9tICkgKVxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBAY29sbGVjdGlvbi5nZXQoIF9pZCApXG5cdFx0aWYgbm90IEBtdWx0aVNlbGVjdFxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm4gZmFsc2VcblxuXG5cdHNlbGVjdGVkOiA9PlxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cblx0XHQjQHNlYXJjaC5cblx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKS0+XG5cdFx0XHRpZiBub3QgX3E/Lmxlbmd0aFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0X21hdGNoID0gbWRsLm1hdGNoKCBfcSApXG5cdFx0XHRyZXR1cm4gX21hdGNoXG5cdFx0LCBmYWxzZSApXG5cblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm5cblxuXHRtb3ZlOiAoIHVwID0gZmFsc2UgKT0+XG5cdFx0X3RvcCA9ICggaWYgQGN1c3RvbSB0aGVuIC0xIGVsc2UgMCApXG5cdFx0aWYgdXAgXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxIFxuXHRcdGVsc2UgXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gQGFjdGl2ZUlkeCArIDFcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDEgXG5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblxuXHRcdEAkKCBfbGlzdFsgQGFjdGl2ZUlkeCBdICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXHRcdEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0QGFjdGl2ZUlkeCA9IF9uZXdpZHhcblx0XHRcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6ID0+XG5cdFx0aWYgQGFjdGl2ZUlkeCA+PSAwIGFuZCBAc2VhcmNoY29sbC5sZW5ndGhcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgQGNvbGxlY3Rpb24uYXQoIEBhY3RpdmVJZHggKVxuXHRcdGVsc2Vcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlIClcblxuXHRcdGlmIG5vdCBAbXVsdGlTZWxlY3Rcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3IiwiY2xhc3MgVmlld1N1YiBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc3ViLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJzdWJcIlxuXG5cdGluaXRpYWxpemU6ID0+XG5cdFx0QHJlc3VsdCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKClcblx0XHRyZXR1cm5cblxuXHRldmVudHM6IFxuXHRcdFwiY2xpY2sgLnJtLWZhY2V0LWJ0blwiOiBcImRlbFwiXG5cblx0cmVuZGVyOiAoIG9wdE1kbCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZSggbGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpLCBzZWxlY3RlZDogX2xpc3QgKVxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblx0XHRyZXR1cm4gQGVsXG5cblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdEBjb2xsZWN0aW9uLnRyaWdnZXIoIFwiaWdneTpyZW1cIiwgQG1vZGVsIClcblx0XHRAY29sbGVjdGlvbi5hZGQoIEBtb2RlbCApXG5cdFx0QHJlbW92ZSgpXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIgKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHJlbW92ZTogPT5cblx0XHRAc2VsZWN0dmlldz8ucmVtb3ZlKClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRzZWxlY3RlZDogKCBvcHRNZGwgKT0+XG5cdFx0QHJlc3VsdC5hZGQoIG9wdE1kbCApXG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0cmV0dXJuXG5cblx0aXNPcGVuOiA9PlxuXHRcdHJldHVybiBAc2VsZWN0dmlldz9cblxuXHRmb2N1czogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHRAb3BlbigpXG5cdFx0cmV0dXJuXG5cblx0b3BlbjogPT5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBAbW9kZWwuU3ViVmlldyggbW9kZWw6IEBtb2RlbCwgZWw6IEAkc3ViIClcblxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHQgKT0+XG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdCNAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCByZXN1bHQgKVxuXHRcdFx0QHJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBtZGwgKT0+XG5cdFx0XHRpZiBtZGxcblx0XHRcdFx0QHNlbGVjdGVkKCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1N1YiIsbnVsbCwiIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoW10sZSk7ZWxzZXt2YXIgZjtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P2Y9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Zj1nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJihmPXNlbGYpLGYuamFkZT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmVzY2FwZSA9IGZ1bmN0aW9uIGVzY2FwZShodG1sKXtcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiXX0=
