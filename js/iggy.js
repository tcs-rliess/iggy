(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctDateRange, FctNumber, FctSelect, FctString, IGGY, MainView, Results,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MainView = require("./views/main");

Facets = require("./models/backbone_sub");

FctString = require("./models/facet_string");

FctArray = require("./models/facet_array");

FctSelect = require("./models/facet_select");

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
      case "select":
        return new FctSelect(facet);
      case "array":
        return new FctSelect(facet);
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



},{"./models/backbone_sub":2,"./models/facet_array":3,"./models/facet_daterange":5,"./models/facet_number":6,"./models/facet_select":7,"./models/facet_string":8,"./models/results":9,"./views/main":26}],2:[function(require,module,exports){

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



},{"../views/facets/subarray":22,"./facet_string":8}],4:[function(require,module,exports){
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



},{"../views/facets/base":20}],5:[function(require,module,exports){
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



},{"../views/facets/daterange":21,"./facet_base":4}],6:[function(require,module,exports){
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
      min: null,
      max: null,
      step: 1,
      value: 50
    });
  };

  return FctNumber;

})(require("./facet_base"));

module.exports = FctNumber;



},{"../views/facets/subnumber":23,"./facet_base":4}],7:[function(require,module,exports){
var FctSelect,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctSelect = (function(superClass) {
  extend(FctSelect, superClass);

  function FctSelect() {
    this.defaults = bind(this.defaults, this);
    return FctSelect.__super__.constructor.apply(this, arguments);
  }

  FctSelect.prototype.SubView = require("../views/facets/subselect");

  FctSelect.prototype.defaults = function() {
    return $.extend(FctSelect.__super__.defaults.apply(this, arguments), {
      options: []
    });
  };

  return FctSelect;

})(require("./facet_base"));

module.exports = FctSelect;



},{"../views/facets/subselect":24,"./facet_base":4}],8:[function(require,module,exports){
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



},{"../views/facets/substring":25,"./facet_base":4}],9:[function(require,module,exports){
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
      attr.value = _modify(attr.value, options._facet);
    }
    return attr;
  };

  return IggyResults;

})(Backbone.Collection);

module.exports = IggyResults;



},{}],10:[function(require,module,exports){
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



},{"./backbone_sub":2}],11:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"daterange-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":30}],12:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, operators, undefined) {
if ( operators && operators.length)
{
buf.push("<div class=\"operator\"><select" + (jade.attr("id", "" + (cid) + "op", true, false)) + ">");
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

buf.push("</select></div>");
}
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"number-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"operators" in locals_for_with?locals_for_with.operators:typeof operators!=="undefined"?operators:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":30}],13:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, multiple, options, undefined) {
buf.push("<select" + (jade.attr("id", cid, true, false)) + " multiple=\"multiple\" class=\"select-inp\">");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select>");
if ( multiple)
{
buf.push("<span class=\"btn btn-xs btn-success select-check fa fa-check\"></span>");
}}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"multiple" in locals_for_with?locals_for_with.multiple:typeof multiple!=="undefined"?multiple:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":30}],14:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":30}],15:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (activeIdx, custom, list, query, undefined) {
var add = 0;
if ( custom && query)
{
add = 1;
buf.push("<li><a data-id=\"_custom\" data-idx=\"-1\"" + (jade.cls([{active:0 === activeIdx}], [true])) + "><i>\"" + (((jade_interp = query) == null ? '' : jade_interp)) + "\"</i></a></li>");
}
if ( list.length)
{
// iterate list
;(function(){
  var $$obj = list;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<li><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:(idx + add) === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:(idx + add) === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

}
else if ( !custom)
{
buf.push("<li><a class=\"emptyres\">no result for \"" + (jade.escape((jade_interp = query) == null ? '' : jade_interp)) + "\"</a></li>");
}}.call(this,"activeIdx" in locals_for_with?locals_for_with.activeIdx:typeof activeIdx!=="undefined"?activeIdx:undefined,"custom" in locals_for_with?locals_for_with.custom:typeof custom!=="undefined"?custom:undefined,"list" in locals_for_with?locals_for_with.list:typeof list!=="undefined"?list:undefined,"query" in locals_for_with?locals_for_with.query:typeof query!=="undefined"?query:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":30}],16:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"string-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":30}],17:[function(require,module,exports){
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
},{"jade/runtime":30}],18:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");;return buf.join("");
};
},{"jade/runtime":30}],19:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13
};



},{}],20:[function(require,module,exports){
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
    this._checkSelectEmpty = bind(this._checkSelectEmpty, this);
    this.getSelectModel = bind(this.getSelectModel, this);
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.close = bind(this.close, this);
    this.render = bind(this.render, this);
    this._getInpSelector = bind(this._getInpSelector, this);
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
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
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

  FacetSubsBase.prototype._getInpSelector = function() {
    return "input#" + this.cid;
  };

  FacetSubsBase.prototype.render = function() {
    this.$el.html(this.template(this.getTemplateData()));
    this.$inp = this.$el.find(this._getInpSelector());
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

  FacetSubsBase.prototype._checkSelectEmpty = function(_val) {
    console.log("_checkSelectEmpty", _val, _.isEmpty(_val));
    if (_.isEmpty(_val) && !_.isNumber(_val) && !_.isBoolean(_val)) {
      this.close();
      return true;
    }
    return false;
  };

  FacetSubsBase.prototype.select = function() {
    var _ModelConst, _model, _val;
    _val = this.getValue();
    if (this._checkSelectEmpty(_val)) {
      return;
    }
    _ModelConst = this.getSelectModel();
    _model = new _ModelConst({
      value: _val,
      custom: true
    });
    this.result.add(_model);
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsBase;

})(Backbone.View);

module.exports = FacetSubsBase;



},{"../../models/subresults":10,"../../utils/keycodes":19}],21:[function(require,module,exports){
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



},{"../../tmpls/daterange.jade":11,"../../utils/keycodes":19,"./base":20}],22:[function(require,module,exports){
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

})(require("./base"));

module.exports = FacetSubArray;



},{"../../models/backbone_sub":2,"./base":20}],23:[function(require,module,exports){
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

  FacetSubsNumber.prototype.template = require("../../tmpls/number.jade");

  function FacetSubsNumber() {
    this._setNumber = bind(this._setNumber, this);
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.crement = bind(this.crement, this);
    this.input = bind(this.input, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.focus = bind(this.focus, this);
    this._opSelected = bind(this._opSelected, this);
    this.close = bind(this.close, this);
    this.renderResult = bind(this.renderResult, this);
    this.render = bind(this.render, this);
    this.events = bind(this.events, this);
    this.setNumber = _.throttle(this._setNumber, 300, {
      leading: false
    });
    FacetSubsNumber.__super__.constructor.apply(this, arguments);
    return;
  }

  FacetSubsNumber.prototype.events = function() {
    var _evnts, obj;
    _evnts = (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj["blur " + (this._getInpSelector())] = "select",
      obj
    );
    return _evnts;
  };

  FacetSubsNumber.prototype.render = function() {
    var ref;
    FacetSubsNumber.__super__.render.apply(this, arguments);
    if ((ref = this.model.get("operators")) != null ? ref.length : void 0) {
      this.$inpOp = this.$el.find("select#" + this.cid + "op");
      this.$inpOp.select2({
        width: "auto"
      });
      this.$inpOp.on("select2:close", this._opSelected);
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

  FacetSubsNumber.prototype.close = function(evnt) {
    if (this.$inpOp != null) {
      this.$inpOp.select2("destroy");
      this.$inpOp.remove();
      this.$inpOp = null;
    }
    FacetSubsNumber.__super__.close.apply(this, arguments);
  };

  FacetSubsNumber.prototype._opSelected = function() {
    this.selectedOP = true;
    this.focus();
  };

  FacetSubsNumber.prototype.focus = function(inp) {
    if (inp == null) {
      inp = false;
    }
    if ((this.$inpOp != null) && !this.selectedOP) {
      this.$inpOp.select2("open");
      return;
    }
    FacetSubsNumber.__super__.focus.apply(this, arguments);
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
        case KEYCODES.ENTER:
          this.select();
          return;
      }
    }
    if (evnt.type === "keyup") {
      _v = evnt.currentTarget.value.replace(/[^\d]?[^-\d]+/g, "");
      _v = parseInt(_v, 10);
      this.setNumber(_v);
    }
  };

  FacetSubsNumber.prototype.crement = function(change) {
    var _v;
    console.log("crement", change);
    _v = this.$inp.val();
    if (!(_v != null ? _v.length : void 0)) {
      _v = this.model.get("value");
    } else {
      _v = parseInt(_v, 10);
    }
    this._setNumber(_v + change);
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
    return parseInt(this.valueByDefinition(_v), 10);
  };

  FacetSubsNumber.prototype._setNumber = function(_v) {
    var _curr;
    if (isNaN(_v)) {
      return;
    }
    _curr = this.$inp.val();
    _v = this.valueByDefinition(_v);
    if (_curr !== _v.toString()) {
      this.$inp.val(_v);
    }
  };

  FacetSubsNumber.prototype.valueByDefinition = function(_value) {
    var _precision, _tmp, max, min, step;
    max = this.model.get("max");
    min = this.model.get("min");
    step = this.model.get("step");
    if (min > max) {
      _tmp = min;
      min = max;
      max = _tmp;
    }
    if ((min != null) && _value < min) {
      console.log(min);
      return min;
    }
    if ((max != null) && _value > max) {
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



},{"../../tmpls/number.jade":12,"../../utils/keycodes":19,"./base":20}],24:[function(require,module,exports){
var FacetSubsSelect, KEYCODES,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../../utils/keycodes");

FacetSubsSelect = (function(superClass) {
  extend(FacetSubsSelect, superClass);

  function FacetSubsSelect() {
    this.select = bind(this.select, this);
    this.close = bind(this.close, this);
    this.unselect = bind(this.unselect, this);
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this.getResults = bind(this.getResults, this);
    this.getValue = bind(this.getValue, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.remove = bind(this.remove, this);
    this._sel2open = bind(this._sel2open, this);
    this.focus = bind(this.focus, this);
    this._getInpSelector = bind(this._getInpSelector, this);
    this.events = bind(this.events, this);
    return FacetSubsSelect.__super__.constructor.apply(this, arguments);
  }

  FacetSubsSelect.prototype.template = require("../../tmpls/select.jade");

  FacetSubsSelect.prototype.forcedModuleOpts = {};

  FacetSubsSelect.prototype.defaultModuleOpts = {
    width: "auto",
    multiple: false
  };

  FacetSubsSelect.prototype.events = function() {
    var _evnts;
    _evnts = {};
    if (this.model.get("multiple")) {
      _evnts["click .select-check"] = "select";
    }
    console.log(_evnts);
    return _evnts;
  };

  FacetSubsSelect.prototype._getInpSelector = function() {
    return "select#" + this.cid;
  };

  FacetSubsSelect.prototype.focus = function() {
    var _opts;
    if (this.select2 == null) {
      _opts = _.extend({}, this.defaultModuleOpts, this.model.get("opts"), {
        multiple: this.model.get("multiple")
      }, this.forcedModuleOpts);
      this.$inp.select2(_opts);
      this.select2 = this.$inp.data("select2");
      if (!this.model.get("multiple")) {
        this.$inp.on("select2:select", this.select);
      }
      this.select2.$container.on("click", this._sel2open);
      this.select2.open();
    }
    return FacetSubsSelect.__super__.focus.apply(this, arguments);
  };

  FacetSubsSelect.prototype._sel2open = function(evnt) {
    console.log(evnt);
    evnt.stopPropagation();
    return false;
  };

  FacetSubsSelect.prototype.remove = function() {
    return FacetSubsSelect.__super__.remove.apply(this, arguments);
  };

  FacetSubsSelect.prototype.getTemplateData = function() {
    var _data;
    _data = _.extend({}, FacetSubsSelect.__super__.getTemplateData.apply(this, arguments), {
      multiple: this.model.get("multiple"),
      options: this._createOptionCollection(this.model.get("options"))
    });
    return _data;
  };

  FacetSubsSelect.prototype.getValue = function() {
    return this.select2.val();
  };

  FacetSubsSelect.prototype.getResults = function() {
    return {
      value: this.result.pluck("value")
    };
  };

  FacetSubsSelect.prototype._createOptionCollection = function(options) {
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
    return _opts;
  };

  FacetSubsSelect.prototype.unselect = function(evnt) {
    var ref, ref1, ref2, ref3;
    console.log("unselect", (ref = evnt.params) != null ? (ref1 = ref.data) != null ? ref1.id : void 0 : void 0);
    this.result.remove((ref2 = evnt.params) != null ? (ref3 = ref2.data) != null ? ref3.id : void 0 : void 0);
    console.log(this.result.toJSON());
  };

  FacetSubsSelect.prototype.close = function() {
    this.select2.destroy();
    this.$inp.remove();
    this.$(".select-check").remove();
    FacetSubsSelect.__super__.close.apply(this, arguments);
  };

  FacetSubsSelect.prototype.select = function(evnt) {
    var _ModelConst, _model, _val;
    _val = this.getValue();
    if (_val == null) {
      this.close();
      return;
    }
    _ModelConst = this.getSelectModel();
    _model = new _ModelConst({
      value: _val
    });
    this.result.add(_model);
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsSelect;

})(require("./base"));

module.exports = FacetSubsSelect;



},{"../../tmpls/select.jade":13,"../../utils/keycodes":19,"./base":20}],25:[function(require,module,exports){
var FacetSubString,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubString = (function(superClass) {
  extend(FacetSubString, superClass);

  function FacetSubString() {
    this.close = bind(this.close, this);
    this.events = bind(this.events, this);
    return FacetSubString.__super__.constructor.apply(this, arguments);
  }

  FacetSubString.prototype.template = require("../../tmpls/string.jade");

  FacetSubString.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj["blur " + (this._getInpSelector())] = "select",
      obj
    );
  };

  FacetSubString.prototype.close = function(evnt) {
    this.$inp.remove();
    FacetSubString.__super__.close.apply(this, arguments);
  };

  return FacetSubString;

})(require("./base"));

module.exports = FacetSubString;



},{"../../tmpls/string.jade":16,"./base":20}],26:[function(require,module,exports){
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
      this.selectview.close();
      this.selectview = null;
    }
    if (this.subview) {
      console.log("MAIN REMOVE SUB", this.subview);
      this.subview.close();
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



},{"../tmpls/wrapper.jade":18,"../utils/keycodes":19,"./selector":27,"./sub":28}],27:[function(require,module,exports){
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
    this.scrollHelper = bind(this.scrollHelper, this);
    this._checkScroll = bind(this._checkScroll, this);
    this.renderRes = bind(this.renderRes, this);
    this.render = bind(this.render, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.initialize = bind(this.initialize, this);
    this.events = bind(this.events, this);
    this.className = bind(this.className, this);
    this.custom = options.custom || false;
    this.activeIdx = 0;
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
    this._checkScroll();
    return this.$list;
  };

  SelectorView.prototype._scrollTill = 198;

  SelectorView.prototype._checkScroll = function() {
    var _height;
    _height = this.$list.height();
    if (_height > 0) {
      this.scrollHelper(_height);
      return;
    }
    setTimeout((function(_this) {
      return function() {
        return _this.scrollHelper(_this.$list.height());
      };
    })(this), 0);
  };

  SelectorView.prototype.scrollHelper = function(height) {
    if (height >= this._scrollTill) {
      this.scrolling = true;
    } else {
      this.scrolling = false;
    }
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
    this.searchcoll.updateSubFilter((function(_this) {
      return function(mdl) {
        var _match;
        if (_this.result.get(mdl.id) != null) {
          return false;
        }
        if (!(_q != null ? _q.length : void 0)) {
          return true;
        }
        _match = mdl.match(_q);
        return _match;
      };
    })(this), false);
    this.activeIdx = 0;
    this.renderRes();
  };

  SelectorView.prototype.move = function(up) {
    var _$elnew, _$list, _elH, _list, _newidx, _pos, _scrollT, _top;
    if (up == null) {
      up = false;
    }
    _list = this.$el.find(".typelist a");
    _top = 0;
    if (up) {
      if ((this.activeIdx - 1) < _top) {
        return;
      }
      _newidx = this.activeIdx - 1;
    } else {
      if (this.searchcoll.length - 1 <= this.activeIdx) {
        return;
      }
      _newidx = this.activeIdx + 1;
    }
    this.$(_list[this.activeIdx]).removeClass("active");
    _$elnew = this.$(_list[_newidx]).addClass("active");
    if (this.scrolling) {
      _elH = _$elnew.outerHeight();
      _pos = _elH * (_newidx + 1);
      _$list = this.$el.find(".typelist");
      _scrollT = _$list.scrollTop();
      if (_pos > _scrollT + this._scrollTill) {
        _$list.scrollTop(_pos - this._scrollTill);
      } else if (_pos < _scrollT + _elH) {
        _$list.scrollTop(_pos - _elH);
      }
    }
    this.activeIdx = _newidx;
  };

  SelectorView.prototype.select = function() {
    var _sel, ref;
    _sel = this.$el.find(".typelist a.active").removeClass("active").data();
    this.activeIdx = 0;
    if ((_sel != null ? _sel.idx : void 0) >= 0 && this.searchcoll.length) {
      this.trigger("selected", this.collection.get(_sel.id));
    } else if ((ref = this.currQuery) != null ? ref.length : void 0) {
      this.trigger("selected", new this.collection.model({
        value: this.currQuery,
        custom: true
      }));
      this.$inp.val("");
    } else {
      return;
    }
    if (!this.multiSelect) {
      this.close();
    }
  };

  return SelectorView;

})(require("./facets/base"));

module.exports = SelectorView;



},{"../tmpls/selector.jade":14,"../tmpls/selectorli.jade":15,"../utils/keycodes":19,"./facets/base":20}],28:[function(require,module,exports){
var ViewSub,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewSub = (function(superClass) {
  extend(ViewSub, superClass);

  function ViewSub() {
    this.open = bind(this.open, this);
    this.close = bind(this.close, this);
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

  ViewSub.prototype.close = function() {
    var ref;
    if (this.selectview != null) {
      if ((ref = this.selectview) != null) {
        ref.close();
      }
      return;
    }
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



},{"../tmpls/sub.jade":17}],29:[function(require,module,exports){

},{}],30:[function(require,module,exports){
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

},{"fs":29}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRfc2VsZWN0LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9zdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL3Jlc3VsdHMuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdXRpbHMva2V5Y29kZXMuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL2Jhc2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3ViYXJyYXkuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1Ym51bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zdWIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9qYWRlL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLHdGQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVCxDQUFYLENBQUE7O0FBQUEsTUFDQSxHQUFTLE9BQUEsQ0FBUyx1QkFBVCxDQURULENBQUE7O0FBQUEsU0FFQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUZaLENBQUE7O0FBQUEsUUFHQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVCxDQUhYLENBQUE7O0FBQUEsU0FJQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUpaLENBQUE7O0FBQUEsU0FLQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUxaLENBQUE7O0FBQUEsWUFNQSxHQUFlLE9BQUEsQ0FBUywwQkFBVCxDQU5mLENBQUE7O0FBQUEsT0FPQSxHQUFVLE9BQUEsQ0FBUyxrQkFBVCxDQVBWLENBQUE7O0FBQUE7QUFVQywwQkFBQSxDQUFBOztBQUFBLGlCQUFBLENBQUEsR0FBRyxNQUFILENBQUE7O0FBQ2EsRUFBQSxjQUFFLEVBQUYsRUFBTSxNQUFOLEVBQW1CLE9BQW5CLEdBQUE7O01BQU0sU0FBUztLQUMzQjs7TUFEK0IsVUFBVTtLQUN6QztBQUFBLHlDQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksUUFBUSxDQUFDLE1BQXJCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBYSxFQUFiLENBSlAsQ0FBQTtB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0M7QUFBQSxFQUFBLE1BQUEsRUFBUSxFQUFSO0FBQUEsRUFDQSxPQUFBLEVBQVMsRUFEVDtBQUFBLEVBRUEsSUFBQSxFQUFNLEVBRk47QUFBQSxFQUdBLE1BQUEsRUFBUSxFQUhSO0FBQUEsRUFJQSxL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QSxDQUFBLElBQUEsQ0FBM0IsQ0FiQSxDQURLO0VBQUEsQ0F2RE4sQ0FBQTs7aUJBQUE7O0dBRHFCLFFBQVEsQ0FBQyxLQUEvQixDQUFBOztBQUFBLE1BNEVNLENBQUMsT0FBUCxHQUFpQixPQTVFakIsQ0FBQTs7Ozs7QUNBQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTWFpblZpZXcgPSByZXF1aXJlKCBcIi4vdmlld3MvbWFpblwiIClcbkZhY2V0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuRmN0U3RyaW5nID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zdHJpbmdcIiApXG5GY3RBcnJheSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfYXJyYXlcIiApXG5GY3RTZWxlY3QgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3NlbGVjdFwiIClcbkZjdE51bWJlciA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfbnVtYmVyXCIgKVxuRmN0RGF0ZVJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9kYXRlcmFuZ2VcIiApXG5SZXN1bHRzID0gcmVxdWlyZSggXCIuL21vZGVscy9yZXN1bHRzXCIgKVxuXG5jbGFzcyBJR0dZIGV4dGVuZHMgQmFja2JvbmUuRXZlbnRzXG5cdCQ6IGpRdWVyeVxuXHRjb25zdHJ1Y3RvcjogKCBlbCwgZmFjZXRzID0gW10sIG9wdGlvbnMgPSB7fSApLT5cblx0XHRfLmV4dGVuZCBALCBCYWNrYm9uZS5FdmVudHNcblx0XHRAX2luaXRFcnJvcnMoKVxuXHRcdFxuXHRcdCMgaW5pdCBlbGVtZW50XG5cdFx0QCRlbCA9IEBfcHJlcGFyZUVsKCBlbCApXG5cdFx0QGVsID0gQCRlbFswXVxuXHRcdEAkZWwuZGF0YSggXCJpZ2d5XCIsIEAgKVxuXG5cdFx0IyBpbml0IGZhY2V0c1xuXHRcdEBmYWNldHMgPSBAX3ByZXBhcmVGYWNldHMoIGZhY2V0cyApXG5cdFx0QHJlc3VsdHMgPSBuZXcgUmVzdWx0cygpXG5cblx0XHRAcmVzdWx0cy5vbiBcImFkZFwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwicmVtb3ZlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJjaGFuZ2VcIiwgQHRyaWdnZXJDaGFuZ2VcblxuXHRcdG5ldyBNYWluVmlldyggZWw6IEAkZWwsIGNvbGxlY3Rpb246IEBmYWNldHMsIHJlc3VsdHM6IEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUVsOiAoIGVsICk9PlxuXG5cdFx0aWYgbm90IGVsP1xuXHRcdFx0dGhyb3cgQF9lcnJvciggXCJFTUlTU0lOR0VMXCIgKVxuXG5cdFx0aWYgXy5pc1N0cmluZyggZWwgKVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMU1RSSU5HXCIgKVxuXG5cdFx0XHRfJGVsID0gQCQoIGVsIClcblx0XHRcdGlmIG5vdCBfJGVsPy5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMU1RSSU5HXCIgKVxuXG5cdFx0XHRyZXR1cm4gXyRlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTEpRVUVSWVwiIClcblxuXHRcdFx0IyBUT0RPIGhhbmRsZSBtdWx0aXBsZSBqUXVlcnkgZWxlbWVudHMgdG8gSUdHWSBpbnN0YW5jZXNcblx0XHRcdGlmIGVsLmxlbmd0aCA+IDFcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFU0laRUVMSlFVRVJZXCIgKVxuXG5cdFx0XHRyZXR1cm4gZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgRWxlbWVudFxuXHRcdFx0cmV0dXJuIEAkKCBlbCApXG5cblx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxUWVBFXCIgKVxuXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVGYWNldHM6ICggZmFjZXRzICk9PlxuXHRcdF9yZXQgPSBbXVxuXHRcdGZvciBmYWNldCBpbiBmYWNldHMgd2hlbiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRfcmV0LnB1c2ggX2ZjdFxuXG5cdFx0cmV0dXJuIG5ldyBGYWNldHMoIF9yZXQgKVxuXG5cdF9jcmVhdGVGYWNldDogKCBmYWNldCApPT5cblx0XHRzd2l0Y2ggZmFjZXQudHlwZS50b0xvd2VyQ2FzZSgpXG5cdFx0XHR3aGVuIFwic3RyaW5nXCIgdGhlbiByZXR1cm4gbmV3IEZjdFN0cmluZyggZmFjZXQgKVxuXHRcdFx0d2hlbiBcInNlbGVjdFwiIHRoZW4gcmV0dXJuIG5ldyBGY3RTZWxlY3QoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJhcnJheVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RTZWxlY3QoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCApXG5cdFx0XHR3aGVuIFwiZGF0ZXJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdERhdGVSYW5nZSggZmFjZXQgKVxuXG5cdGFkZEZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdGlmIG5vdCBAZmFjZXRzP1xuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0QGZhY2V0cy5hZGQoIF9mY3QgKVxuXHRcdHJldHVybiBAXG5cblx0X2Vycm9yOiAoIHR5cGUsIGRhdGEgPSB7fSApPT5cblx0XHRpZiBAZXJyb3JzWyB0eXBlIF0/XG5cdFx0XHRfbXNnID0gQGVycm9yc1sgdHlwZSBdKCBkYXRhIClcblx0XHRlbHNlXG5cdFx0XHRfbXNnID0gXCItXCJcblx0XHRfZXJyID0gbmV3IEVycm9yKClcblx0XHRfZXJyLm5hbWUgPSB0eXBlXG5cdFx0X2Vyci5tZXNzYWdlID0gX21zZ1xuXHRcdHJldHVybiBfZXJyXG5cblx0Z2V0UXVlcnk6ID0+XG5cdFx0cmV0dXJuIEByZXN1bHRzXG5cblx0dHJpZ2dlckNoYW5nZTogPT5cblx0XHRAdHJpZ2dlciggXCJjaGFuZ2VcIiwgQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXG5cdF9pbml0RXJyb3JzOiA9PlxuXHRcdEBlcnJvcnMgPSB7fVxuXHRcdGZvciBfaywgX3RtcGwgb2YgQEVSUk9SUygpXG5cdFx0XHRAZXJyb3JzWyBfayBdID0gXy50ZW1wbGF0ZSggX3RtcGwgKSBcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6ID0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1kiLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKSBcblx0XG5cdCMgb3IgYnkgT2JqZWN0XG5cdHN1YkNvbGxPID0gcGFyZW50Q29sbC5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9ICkgXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscyApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApIFxuXHRcdFx0YWRkZWQgPSBAZ2V0KCBfbSApP1xuXHRcdFx0aWYgYWRkZWQgYW5kIG5vdCB0b0FkZFxuXHRcdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRlbHNlIGlmIG5vdCBhZGRlZCBhbmQgdG9BZGRcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIGJhc2UgY29sbGVjdGlvbiBvbiBhZGQgdG8gc3ViXG5cdFx0X3N1Yi5vbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBzdWIgY29sbGVjdGlvbiBvbiBhZGQgdG8gYmFzZSBpZiBpdCBtYXRjaGVzIHRoZSBmaWx0ZXJcblx0XHRAb24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0aWYgQF9mbkZpbHRlciggX20gKVxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdF9zdWIub24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0I0ByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZXNldFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAdXBkYXRlU3ViRmlsdGVyKClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHN0b3JlIHRoZSBzdWJjb2xsZWN0aW9uIHVuZGVyIHRoZSBjdXJyZW50IGNvbGxlY3Rpb25cblx0XHRAc3ViQ29sbHMucHVzaCggX3N1YiApXG5cblx0XHRyZXR1cm4gX3N1YlxuXG5cdCMjI1xuXHQjIyB1cGRhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLnVwZGF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRNZXRob2QgdG8gdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBUaGVuIGFsbCBtb2RlbHMgd2lsbCBiZSByZXNldGUgYnkgdGhlIG5ldyBmaWx0ZXIuIFNvIHlvdSBoYXZlIHRvIGxpc3RlbiB0byB0ZWggcmVzZXQgZXZlbnRcblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuIFxuXHRcblx0QHJldHVybiB7IFNlbGYgfSBpdHNlbGZcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHR1cGRhdGVTdWJGaWx0ZXI6ICggZmlsdGVyLCBhc1Jlc2V0ID0gdHJ1ZSApPT5cblx0XHRpZiBAX3BhcmVudENvbD9cblxuXHRcdFx0IyBzZXQgdGhlIG5ldyBmaWx0ZXIgbWV0aG9kXG5cdFx0XHRAX2ZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyICkgaWYgZmlsdGVyP1xuXG5cdFx0XHRfbW9kZWxzID0gQF9wYXJlbnRDb2wuZmlsdGVyKCBAX2ZuRmlsdGVyIClcblxuXHRcdFx0IyByZXNldCB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBuZXcgbW9kZWxzXG5cdFx0XHRpZiBhc1Jlc2V0XG5cdFx0XHRcdEByZXNldCggX21vZGVscyApXG5cdFx0XHRcdHJldHVybiBAXG5cblx0XHRcdG5ld2lkcyA9IF8ucGx1Y2soIF9tb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Y3VycmlkcyA9IF8ucGx1Y2soIEBtb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Zm9yIHJpZCBpbiBfLmRpZmZlcmVuY2UoIGN1cnJpZHMsIG5ld2lkcyApXG5cdFx0XHRcdEByZW1vdmUoIHJpZCApXG5cdFx0XHRcdFxuXHRcdFx0X2FkZElkcyA9IF8uZGlmZmVyZW5jZSggbmV3aWRzLCBjdXJyaWRzIClcblx0XHRcdGZvciBtZGwgaW4gX21vZGVscyB3aGVuIG1kbC5jaWQgaW4gX2FkZElkc1xuXHRcdFx0XHRAYWRkKCBtZGwgKVxuXG5cdFx0cmV0dXJuIEBcblxuXG5cdCMjI1xuXHQjIyBfZ2VuZXJhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLl9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRJbnRlcm5hbCBtZXRob2QgdGggY29udmVydCBhIGZpbHRlciBhcmd1bWVudCB0byBhIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy4gXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvbiBcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X2dlbmVyYXRlU3ViRmlsdGVyOiAoIGZpbHRlciApPT5cblx0XHQjIGNvbnN0cnVjdCB0aGUgZmlsdGVyIGZ1bmN0aW9uXG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNBcnJheSggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApPT5cblx0XHRcdFx0X20uaWQgaW4gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzU3RyaW5nKCBmaWx0ZXIgKSBvciBfLmlzTnVtYmVyKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICk9PlxuXHRcdFx0XHRfbS5pZCBpcyBmaWx0ZXJcblx0XHRlbHNlXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKT0+XG5cdFx0XHRcdGZvciBfbm0sIF92bCBvZiBmaWx0ZXJcblx0XHRcdFx0XHRpZiBfbS5nZXQoIF9ubSApIGlzbnQgX3ZsXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdHJldHVybiBmbkZpbHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lU3ViIiwiY2xhc3MgRmN0QXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfc3RyaW5nXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheVwiIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEFycmF5XG4iLCJjbGFzcyBGYWNldEJhc2UgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvYmFzZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IFwibmFtZVwiXG5cdFx0bGFiZWw6IFwiRGVzY3JpcHRpb25cIlxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2UiLCJjbGFzcyBGY3REYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvZGF0ZXJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0b3B0czoge31cblx0XHRcdHZhbHVlOiBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZSIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IDUwXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyIiwiY2xhc3MgRmN0U2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnNlbGVjdFwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLCBcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U2VsZWN0IiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLCBcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nIiwiY2xhc3MgSWdneVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRkZWZhdWx0czogXG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IG51bGxcblx0XHR2YWx1ZTogbnVsbFxuXG5jbGFzcyBJZ2d5UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0bW9kZWw6IElnZ3lSZXN1bHRcblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0X25hbWUgPSBvcHRpb25zLl9mYWNldD8uZ2V0KCBcIm5hbWVcIiApXG5cdFx0X3R5cGUgPSBvcHRpb25zLl9mYWNldD8uZ2V0KCBcInR5cGVcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyLnZhbHVlID0gX21vZGlmeSggYXR0ci52YWx1ZSwgb3B0aW9ucy5fZmFjZXQgKVxuXHRcdHJldHVybiBhdHRyXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneVJlc3VsdHMiLCJjbGFzcyBCYXNlUmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggQGlkQXR0cmlidXRlICkgb3IgXCItXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHMiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCkge1xuaWYgKCBvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwib3BlcmF0b3JcXFwiPjxzZWxlY3RcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIm9wXCIsIHRydWUsIGZhbHNlKSkgKyBcIj5cIik7XG4vLyBpdGVyYXRlIG9wZXJhdG9yc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcGVyYXRvcnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJvcGVyYXRvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yczp0eXBlb2Ygb3BlcmF0b3JzIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgbXVsdGlwbGUsIG9wdGlvbnMsIHVuZGVmaW5lZCkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcHRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+XCIpO1xuaWYgKCBtdWx0aXBsZSlcbntcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcImJ0biBidG4teHMgYnRuLXN1Y2Nlc3Mgc2VsZWN0LWNoZWNrIGZhIGZhLWNoZWNrXFxcIj48L3NwYW4+XCIpO1xufX0uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm11bHRpcGxlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5tdWx0aXBsZTp0eXBlb2YgbXVsdGlwbGUhPT1cInVuZGVmaW5lZFwiP211bHRpcGxlOnVuZGVmaW5lZCxcIm9wdGlvbnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbnM6dHlwZW9mIG9wdGlvbnMhPT1cInVuZGVmaW5lZFwiP29wdGlvbnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwic2VsZWN0b3ItaW5wXFxcIi8+PHVsXCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJ0eXBlbGlzdFwiLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInR5cGVsaXN0XFxcIj48L3VsPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChhY3RpdmVJZHgsIGN1c3RvbSwgbGlzdCwgcXVlcnksIHVuZGVmaW5lZCkge1xudmFyIGFkZCA9IDA7XG5pZiAoIGN1c3RvbSAmJiBxdWVyeSlcbntcbmFkZCA9IDE7XG5idWYucHVzaChcIjxsaT48YSBkYXRhLWlkPVxcXCJfY3VzdG9tXFxcIiBkYXRhLWlkeD1cXFwiLTFcXFwiXCIgKyAoamFkZS5jbHMoW3thY3RpdmU6MCA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+PGk+XFxcIlwiICsgKCgoamFkZV9pbnRlcnAgPSBxdWVyeSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXFxcIjwvaT48L2E+PC9saT5cIik7XG59XG5pZiAoIGxpc3QubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBsaXN0XG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IGxpc3Q7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTooaWR4ICsgYWRkKSA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+XCIgKyAoKChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI8L2E+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmVsc2UgaWYgKCAhY3VzdG9tKVxue1xuYnVmLnB1c2goXCI8bGk+PGEgY2xhc3M9XFxcImVtcHR5cmVzXFxcIj5ubyByZXN1bHQgZm9yIFxcXCJcIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBxdWVyeSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXFxcIjwvYT48L2xpPlwiKTtcbn19LmNhbGwodGhpcyxcImFjdGl2ZUlkeFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguYWN0aXZlSWR4OnR5cGVvZiBhY3RpdmVJZHghPT1cInVuZGVmaW5lZFwiP2FjdGl2ZUlkeDp1bmRlZmluZWQsXCJjdXN0b21cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1c3RvbTp0eXBlb2YgY3VzdG9tIT09XCJ1bmRlZmluZWRcIj9jdXN0b206dW5kZWZpbmVkLFwibGlzdFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubGlzdDp0eXBlb2YgbGlzdCE9PVwidW5kZWZpbmVkXCI/bGlzdDp1bmRlZmluZWQsXCJxdWVyeVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgucXVlcnk6dHlwZW9mIHF1ZXJ5IT09XCJ1bmRlZmluZWRcIj9xdWVyeTp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzdHJpbmctaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBzZWxlY3RlZCwgdW5kZWZpbmVkKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJzdWJsYWJlbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3RcXFwiPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInNlbGVjdGVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWxlY3RlZDp0eXBlb2Ygc2VsZWN0ZWQhPT1cInVuZGVmaW5lZFwiP3NlbGVjdGVkOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGZhIGZhLXBsdXNcXFwiPjwvZGl2PlwiKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFxuXHRcIkxFRlRcIjogMzdcblx0XCJSSUdIVFwiOiAzOVxuXHRcIlVQXCI6IDM4XG5cdFwiRE9XTlwiOiA0MFxuXHRcIkVTQ1wiOiBbIDIyOSwgMjcgXVxuXHRcIkVOVEVSXCI6IDEzIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdGNpZDogQGNpZFx0XHRcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfVwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCBAZ2V0VGVtcGxhdGVEYXRhKCkgKSApXG5cdFx0QCRpbnAgPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoKSApXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcIm9wZW5cIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGlzT3BlbiA9IGZhbHNlXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6ID0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0X2NoZWNrU2VsZWN0RW1wdHk6ICggX3ZhbCApPT5cblx0XHRjb25zb2xlLmxvZyBcIl9jaGVja1NlbGVjdEVtcHR5XCIsIF92YWwsIF8uaXNFbXB0eSggX3ZhbCApXG5cdFx0aWYgXy5pc0VtcHR5KCBfdmFsICkgYW5kIG5vdCBfLmlzTnVtYmVyKCBfdmFsICkgYW5kIG5vdCBfLmlzQm9vbGVhbiggX3ZhbCApXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIGlmIEBfY2hlY2tTZWxlY3RFbXB0eSggX3ZhbCApXG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IF92YWwsIGN1c3RvbTogdHJ1ZSApXG5cdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0Jhc2UiLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0RhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9kYXRlcmFuZ2UuamFkZVwiIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRmb3JjZWREYXRlUmFuZ2VPcHRzOlxuXHRcdG9wZW5zOiBcInJpZ2h0XCJcblxuXHRldmVudHM6ID0+IFxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0aWYgbm90IEBkYXRlcmFuZ2VwaWNrZXI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgQGZvcmNlZERhdGVSYW5nZU9wdHMgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRcdEAkaW5wLm9uKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblxuXHRcdGVsc2Vcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IEBzdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBAZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IEBlbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRfZGF0ZVJldHVybjogKCBAc3RhcnREYXRlLCBAZW5kRGF0ZSApPT5cblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X291dCA9IFsgQHN0YXJ0RGF0ZS52YWx1ZU9mKCkgXVxuXHRcdF9vdXQucHVzaCBAZW5kRGF0ZS52YWx1ZU9mKCkgaWYgQGVuZERhdGU/XG5cdFx0cmV0dXJuIF9vdXRcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzRGF0ZVJhbmdlIiwiY2xhc3MgQXJyYXlPcHRpb24gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBcIm5hbWVcIiApIG9yIFwiLVwiXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cbmNsYXNzIEFycmF5T3B0aW9ucyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEFycmF5T3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViQXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0bXVsdGlTZWxlY3Q6IHRydWVcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheSIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvbnVtYmVyLmphZGVcIiApXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHNldE51bWJlciA9IF8udGhyb3R0bGUoIEBfc2V0TnVtYmVyLCAzMDAsIHtsZWFkaW5nOiBmYWxzZX0gKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IFxuXHRcdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdGlmIEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0XHRAJGlucE9wID0gQCRlbC5maW5kKCBcInNlbGVjdCMje0BjaWR9b3BcIiApXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIHsgd2lkdGg6IFwiYXV0b1wiIH0gKVxuXHRcdFx0QCRpbnBPcC5vbiggXCJzZWxlY3QyOmNsb3NlXCIsIEBfb3BTZWxlY3RlZCApXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0XHRAJGlucE9wLnJlbW92ZSgpXG5cdFx0XHRAJGlucE9wID0gbnVsbFxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0X29wU2VsZWN0ZWQ6ID0+XG5cdFx0QHNlbGVjdGVkT1AgPSB0cnVlXG5cdFx0QGZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRpZiBAJGlucE9wPyBhbmQgbm90IEBzZWxlY3RlZE9QXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICkgfSApXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92IClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSApPT5cblx0XHRjb25zb2xlLmxvZyBcImNyZW1lbnRcIiwgY2hhbmdlXG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRfdiA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0ZWxzZVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblxuXHRcdEBfc2V0TnVtYmVyKCBfdiArIGNoYW5nZSApXG5cblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRfcmV0ID0gXG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdFx0XHRvcGVyYXRvcjogQCRpbnBPcC52YWwoKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPSBcblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0cmV0dXJuIHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdF9zZXROdW1iZXI6ICggX3YgKT0+XG5cdFx0aWYgaXNOYU4oIF92IClcblx0XHRcdCNAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X2N1cnIgPSBAJGlucC52YWwoKVxuXG5cdFx0X3YgPSBAdmFsdWVCeURlZmluaXRpb24oIF92KVxuXHRcdGlmIF9jdXJyICE9IF92LnRvU3RyaW5nKClcblx0XHRcdEAkaW5wLnZhbCggX3YgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSApLT5cblx0XHRtYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRtaW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRzdGVwID0gQG1vZGVsLmdldCggXCJzdGVwXCIgKVxuXHRcdFxuXHRcdCMgZml4IHJldmVyc2VkIG1pbi9tYXggc2V0dGluZ1xuXHRcdGlmIG1pbiA+IG1heFxuXHRcdFx0X3RtcCA9IG1pblxuXHRcdFx0bWluID0gbWF4XG5cdFx0XHRtYXggPSBfdG1wXG5cdFx0XG5cdFx0IyBvbiBleHhlZGRpbmcgdGhlIGxpbWl0cyB1c2UgdGhlIGxpbWl0XG5cdFx0aWYgbWluPyBhbmQgX3ZhbHVlIDwgbWluXG5cdFx0XHRjb25zb2xlLmxvZyBtaW5cblx0XHRcdHJldHVybiBtaW5cblx0XHRpZiBtYXg/IGFuZCBfdmFsdWUgPiBtYXhcblx0XHRcdHJldHVybiBtYXhcblxuXHRcdCMgc2VhcmNoIHRoZSBuZWFyZXN0IF92YWx1ZSB0byB0aGUgc3RlcFxuXHRcdGlmIHN0ZXAgaXNudCAxXG5cdFx0XHRfdmFsdWUgPSBuZWFyZXN0KCBfdmFsdWUsIHN0ZXAgKVxuXHRcdFxuXHRcdCMgY2FsYyB0aGUgcHJlY2lzaW9uIGJ5IHN0ZXBcblx0XHRfcHJlY2lzaW9uID0gTWF0aC5tYXgoIDAsIE1hdGguY2VpbCggTWF0aC5sb2coIDEvc3RlcCApIC8gTWF0aC5sb2coIDEwICkgKSApXG5cdFx0aWYgX3ByZWNpc2lvbiA+IDBcblx0XHRcdF92YWx1ZSA9IHByZWNpc2lvbiggX3ZhbHVlLCBfcHJlY2lzaW9uIClcblx0XHRlbHNlXG5cdFx0XHRfdmFsdWUgPSBNYXRoLnJvdW5kKCBfdmFsdWUgKVxuXHRcdFx0XG5cdFx0cmV0dXJuIF92YWx1ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc2VsZWN0LmphZGVcIiApXG5cblx0Zm9yY2VkTW9kdWxlT3B0czp7fVxuXHQjXHRtdWx0aXBsZTogdHJ1ZVxuXG5cdGRlZmF1bHRNb2R1bGVPcHRzOlxuXHRcdCNtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxXG5cdFx0d2lkdGg6IFwiYXV0b1wiXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cblx0ZXZlbnRzOiA9PiBcblx0XHRfZXZudHMgPSB7fVxuXHRcdF9ldm50c1sgXCJjbGljayAuc2VsZWN0LWNoZWNrXCIgXSA9IFwic2VsZWN0XCIgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRjb25zb2xlLmxvZyBfZXZudHNcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcInNlbGVjdCMje0BjaWR9XCJcblxuXHRmb2N1czogKCk9PlxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3RcIiwgQHNlbGVjdFxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdEBzZWxlY3QyLm9wZW4oKVxuXHRcdCNlbHNlXG5cdFx0XHQjQCRpbnAuc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdF9zZWwyb3BlbjogKCBldm50ICk9PlxuXHRcdGNvbnNvbGUubG9nIGV2bnRcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdCNAJGlucC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdF9kYXRhID0gXy5leHRlbmQoIHt9LCBzdXBlciwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICksIG9wdGlvbnM6IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggQG1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApIH0gKVxuXHRcdHJldHVybiBfZGF0YVxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdHJldHVybiBAc2VsZWN0Mi52YWwoKVxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0cmV0dXJuIG9wdGlvbnMoIEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiApXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCAgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApO1xuXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0dW5zZWxlY3Q6ICggZXZudCApPT5cblx0XHRjb25zb2xlLmxvZyBcInVuc2VsZWN0XCIsIGV2bnQucGFyYW1zPy5kYXRhPy5pZFxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdGNvbnNvbGUubG9nIEByZXN1bHQudG9KU09OKClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAc2VsZWN0Mi5kZXN0cm95KClcblx0XHRAJGlucC5yZW1vdmUoKVxuXHRcdEAkKCBcIi5zZWxlY3QtY2hlY2tcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRpZiBub3QgX3ZhbD9cblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogX3ZhbCApXG5cdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzU2VsZWN0IiwiY2xhc3MgRmFjZXRTdWJTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc3RyaW5nLmphZGVcIiApXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdEAkaW5wLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJTdHJpbmciLCJTdWJWaWV3ID0gcmVxdWlyZSggXCIuL3N1YlwiIClcblNlbGVjdG9yVmlldyA9IHJlcXVpcmUoIFwiLi9zZWxlY3RvclwiIClcblxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBNYWluVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvd3JhcHBlci5qYWRlXCIgKVxuXHRjbGFzc05hbWU6IFwiaWdneSBjbGVhcmZpeFwiXG5cblx0ZXZlbnRzOiBcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcblxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cblx0XHRAZWwuY2xhc3NOYW1lICs9IEBjbGFzc05hbWVcblx0XHRAcmVuZGVyKClcblx0XHQkKCBkb2N1bWVudCApLm9uIFwia2V5dXBcIiwgQF9vbktleVxuXHRcdHJldHVyblxuXG5cdHJlbmRlcjogPT5cblx0XHRAJGVsLmh0bWwoIEB0ZW1wbGF0ZSgpIClcblx0XHRAJGFkZEJ0biA9IEAkKCBcIi5hZGQtZmFjZXQtYnRuXCIgKVxuXHRcdHJldHVyblxuXG5cdF9hZGRGYWNldDogKCBldm50ICk9PlxuXHRcdEBhZGRGYWNldCgpXG5cdFx0cmV0dXJuXG5cblx0X29uS2V5OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0QGV4aXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRleGl0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHQjY29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTRUxFQ1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuY2xvc2UoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0Y29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTVUJcIiwgQHN1YnZpZXdcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdHJldHVyblxuXG5cdHJlbUZhY2V0OiAoIGZhY2V0TSApPT5cblx0XHRAcmVzdWx0cy5yZW1vdmUoIGZhY2V0TS5nZXQoIFwibmFtZVwiICkgKVxuXHRcdHJldHVyblxuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNFTEVDVCBFWElTVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBzdWJ2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNVQiBFWElTVFwiXG5cdFx0XHRAc3Vidmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSApXG5cblx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdEBzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNICk9PlxuXG5cdFx0XHRAc3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiApXG5cdFx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzdWJ2aWV3LnJlbmRlcigpIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXG5cdFx0XHRAc3Vidmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdFx0QHN1YnZpZXcub2ZmKClcblx0XHRcdFx0QHN1YnZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdFx0cmV0dXJuIFxuXG5cdFx0XHRAc3Vidmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNLCByZXN1bHRzICk9PlxuXHRcdFx0XHRAY29sbGVjdGlvbi5yZW1vdmUoIGZhY2V0TSApXG5cblx0XHRcdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggcmVzdWx0cywgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDogZmFjZXRNIH0gKVxuXHRcdFx0XHQjQHN1YnZpZXcub2ZmKClcblx0XHRcdFx0I0BzdWJ2aWV3ID0gbnVsbFxuXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblZpZXciLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFNlbGVjdG9yVmlldyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldHMvYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3IuamFkZVwiIClcblx0dGVtcGxhdGVFbDogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3RvcmxpLmphZGVcIiApXG5cdG11bHRpU2VsZWN0OiBmYWxzZVxuXG5cdGNsYXNzTmFtZTogPT5cblx0XHRjbHMgPSBbIFwiYWRkLWZhY2V0XCIgXVxuXHRcdGlmIEBjdXN0b21cblx0XHRcdGNscy5wdXNoIFwiY3VzdG9tXCJcblx0XHRyZXR1cm4gY2xzLmpvaW4oIFwiIFwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJtb3VzZWRvd24gYVwiOiBcIl9vbkNsaWNrXCJcblx0XHRcImZvY3VzIGlucHV0IyN7QGNpZH1cIjogXCJvcGVuXCJcblx0XHRcImJsdXIgaW5wdXQjI3tAY2lkfVwiOiBcImNsb3NlXCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBjdXN0b20gPSAgb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzZWFyY2hjb2xsID0gQGNvbGxlY3Rpb24uc3ViKCAtPnRydWUgKVxuXHRcdEByZXN1bHQgPSBuZXcgQGNvbGxlY3Rpb24uY29uc3RydWN0b3IoKVxuXHRcdEBvbiBcInNlbGVjdGVkXCIsICggcmVzdWx0ICk9PlxuXHRcdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCByZXN1bHQgKVxuXHRcdFx0QHJlc3VsdC5hZGQoIHJlc3VsdCApXG5cdFx0XHRyZXR1cm5cblx0XHQjQGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJhZGRcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQGNoZWNrT3B0aW9uc0VtcHR5IClcblx0XHRcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgY3VzdG9tOiBAY3VzdG9tIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGxpc3QgPSBAJGVsLmZpbmQoIFwiIyN7QGNpZH10eXBlbGlzdFwiIClcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm4gQGVsXG5cblx0cmVuZGVyUmVzOiA9PlxuXHRcdEAkbGlzdC5lbXB0eSgpXG5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHNlYXJjaGNvbGwubW9kZWxzXG5cdFx0XHRfbGJsID0gbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0X2lkID0gbW9kZWwuaWRcblxuXHRcdFx0aWYgQGN1cnJRdWVyeT8ubGVuZ3RoID4gMVxuXHRcdFx0XHRfbGJsID0gX2xibC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBAY3VyclF1ZXJ5LCBcImdpXCIgKSwgKCggc3RyICktPnJldHVybiBcIjxiPiN7c3RyfTwvYj5cIiApIClcblx0XHRcdF9saXN0LnB1c2ggbGFiZWw6IF9sYmwsIGlkOiBfaWRcblx0XHRAJGxpc3QuYXBwZW5kKCBAdGVtcGxhdGVFbCggbGlzdDogX2xpc3QsIHF1ZXJ5OiBAY3VyclF1ZXJ5LCBhY3RpdmVJZHg6IEBhY3RpdmVJZHgsIGN1c3RvbTogQGN1c3RvbSApIClcblxuXHRcdEBfY2hlY2tTY3JvbGwoKVxuXHRcdFxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRfc2Nyb2xsVGlsbDogMTk4XG5cdF9jaGVja1Njcm9sbDogPT5cblx0XHRfaGVpZ2h0ID0gQCRsaXN0LmhlaWdodCgpXG5cdFx0aWYgX2hlaWdodCA+IDBcblx0XHRcdEBzY3JvbGxIZWxwZXIoIF9oZWlnaHQgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGV4aXQgdGhlIHRoZSBjYWxsIHN0YWNrIHRvIGNoZWNrIGhlaWdodCBhZnRlciB0aGUgbW9kdWxlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBkb21cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHNjcm9sbEhlbHBlciggQCRsaXN0LmhlaWdodCgpIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXG5cdHNjcm9sbEhlbHBlcjogKCBoZWlnaHQgKT0+XG5cdFx0aWYgaGVpZ2h0ID49IEBfc2Nyb2xsVGlsbFxuXHRcdFx0QHNjcm9sbGluZyA9IHRydWVcblx0XHRlbHNlXG5cdFx0XHRAc2Nyb2xsaW5nID0gZmFsc2Vcblx0XHRyZXR1cm5cblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBAY29sbGVjdGlvbi5nZXQoIF9pZCApXG5cdFx0aWYgbm90IEBtdWx0aVNlbGVjdFxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm4gZmFsc2VcblxuXG5cdHNlbGVjdGVkOiA9PlxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cblx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKT0+XG5cdFx0XHRpZiBAcmVzdWx0LmdldCggbWRsLmlkICk/XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgbm90IF9xPy5sZW5ndGhcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdF9tYXRjaCA9IG1kbC5tYXRjaCggX3EgKVxuXHRcdFx0cmV0dXJuIF9tYXRjaFxuXHRcdCwgZmFsc2UgKVxuXG5cblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblxuXHRcdF90b3AgPSAwXG5cdFx0aWYgdXAgXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxIFxuXHRcdGVsc2UgXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggLSAxIDw9IEBhY3RpdmVJZHhcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDFcblxuXG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0XyRlbG5ldyA9IEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0aWYgQHNjcm9sbGluZ1xuXHRcdFx0X2VsSCA9IF8kZWxuZXcub3V0ZXJIZWlnaHQoKVxuXHRcdFx0X3BvcyA9IF9lbEggKiAoIF9uZXdpZHggKyAxIClcblx0XHRcdF8kbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3RcIiApXG5cdFx0XHRfc2Nyb2xsVCA9IF8kbGlzdC5zY3JvbGxUb3AoKVxuXHRcdFx0aWYgX3BvcyA+IF9zY3JvbGxUICsgQF9zY3JvbGxUaWxsXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBAX3Njcm9sbFRpbGwgKVxuXHRcdFx0ZWxzZSBpZiBfcG9zIDwgX3Njcm9sbFQgKyBfZWxIXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBfZWxIIClcblxuXHRcdEBhY3RpdmVJZHggPSBfbmV3aWR4XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0OiA9PlxuXHRcdF9zZWwgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGEuYWN0aXZlXCIgKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApLmRhdGEoKVxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0aWYgX3NlbD8uaWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBAY29sbGVjdGlvbi5nZXQoIF9zZWwuaWQgKVxuXHRcdGVsc2UgaWYgQGN1cnJRdWVyeT8ubGVuZ3RoXG5cdFx0XHRAdHJpZ2dlciBcInNlbGVjdGVkXCIsIG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IEBjdXJyUXVlcnksIGN1c3RvbTogdHJ1ZSApXG5cdFx0XHRAJGlucC52YWwoIFwiXCIgKVxuXHRcdGVsc2Vcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBtdWx0aVNlbGVjdFxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclZpZXciLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiBcInN1YlwiXG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogXG5cdFx0XCJjbGljayAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblxuXHRyZW5kZXI6ICggb3B0TWRsICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cblx0XHRAJGVsLmh0bWwgQHRlbXBsYXRlKCBsYWJlbDogQG1vZGVsLmdldExhYmVsKCksIHNlbGVjdGVkOiBfbGlzdCApXG5cdFx0QCRzdWIgPSBAJCggXCIuc3Vic2VsZWN0XCIgKVxuXHRcdEAkcmVzdWx0cyA9IEAkKCBcIi5zdWJyZXN1bHRzXCIgKVxuXHRcdHJldHVybiBAZWxcblxuXHRkZWw6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBzZWxlY3R2aWV3Py5yZW1vdmUoKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsIClcblx0XHRAJHJlc3VsdHMuaHRtbCggQHNlbGVjdHZpZXcucmVuZGVyUmVzdWx0KCkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRyZXR1cm5cblxuXHRpc09wZW46ID0+XG5cdFx0cmV0dXJuIEBzZWxlY3R2aWV3P1xuXG5cdGZvY3VzOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdEBvcGVuKClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRvcGVuOiA9PlxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IEBtb2RlbC5TdWJWaWV3KCBtb2RlbDogQG1vZGVsLCBlbDogQCRzdWIgKVxuXG5cdFx0QCRlbC5hcHBlbmQoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCApXG5cdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U3ViIixudWxsLCIhZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSxlKTtlbHNle3ZhciBmO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/Zj13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9mPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKGY9c2VsZiksZi5qYWRlPWUoKX19KGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIGF0dHJzID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcblxuICBpZiAoYWMgfHwgYmMpIHtcbiAgICBhYyA9IGFjIHx8IFtdO1xuICAgIGJjID0gYmMgfHwgW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xuICB9XG5cbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbnVsbHModmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xufVxuXG4vKipcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKSA6XG4gICAgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JykgPyBPYmplY3Qua2V5cyh2YWwpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB2YWxba2V5XTsgfSkgOlxuICAgIFt2YWxdKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xuICB2YXIgYnVmID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufTtcblxuXG5leHBvcnRzLnN0eWxlID0gZnVuY3Rpb24gKHZhbCkge1xuICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbCkubWFwKGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgcmV0dXJuIHN0eWxlICsgJzonICsgdmFsW3N0eWxlXTtcbiAgICB9KS5qb2luKCc7Jyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XG4gIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICB2YWwgPSBleHBvcnRzLnN0eWxlKHZhbCk7XG4gIH1cbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodmFsKS5pbmRleE9mKCcmJykgIT09IC0xKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1NpbmNlIEphZGUgMi4wLjAsIGFtcGVyc2FuZHMgKGAmYCkgaW4gZGF0YSBhdHRyaWJ1dGVzICcgK1xuICAgICAgICAgICAgICAgICAgICd3aWxsIGJlIGVzY2FwZWQgdG8gYCZhbXA7YCcpO1xuICAgIH07XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBlbGltaW5hdGUgdGhlIGRvdWJsZSBxdW90ZXMgYXJvdW5kIGRhdGVzIGluICcgK1xuICAgICAgICAgICAgICAgICAgICdJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYnVmID0gW107XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG4gIGlmIChrZXlzLmxlbmd0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcbiAgfVxuICB2YXIgY29udGV4dCA9IDNcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcblxuICAvLyBFcnJvciBjb250ZXh0XG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxuICAgICAgKyBjdXJyXG4gICAgICArICd8ICdcbiAgICAgICsgbGluZTtcbiAgfSkuam9pbignXFxuJyk7XG5cbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcbiAgdGhyb3cgZXJyO1xufTtcblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyJdfQ==
