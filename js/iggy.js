(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctDateRange, FctNumber, FctRange, FctSelect, FctString, IGGY, MainView, Results,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MainView = require("./views/main");

Facets = require("./models/backbone_sub");

FctString = require("./models/facet_string");

FctArray = require("./models/facet_array");

FctSelect = require("./models/facet_select");

FctNumber = require("./models/facet_number");

FctRange = require("./models/facet_range");

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
        return new FctArray(facet);
      case "number":
        return new FctNumber(facet);
      case "range":
        return new FctRange(facet);
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



},{"./models/backbone_sub":2,"./models/facet_array":3,"./models/facet_daterange":5,"./models/facet_number":6,"./models/facet_range":7,"./models/facet_select":8,"./models/facet_string":9,"./models/results":10,"./views/main":31}],2:[function(require,module,exports){

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



},{"../views/facets/subarray":26,"./facet_string":9}],4:[function(require,module,exports){
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



},{"../views/facets/base":23}],5:[function(require,module,exports){
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
      value: null
    });
  };

  return FctDateRange;

})(require("./facet_base"));

module.exports = FctDateRange;



},{"../views/facets/daterange":24,"./facet_base":4}],6:[function(require,module,exports){
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
      value: null
    });
  };

  return FctNumber;

})(require("./facet_base"));

module.exports = FctNumber;



},{"../views/facets/subnumber":27,"./facet_base":4}],7:[function(require,module,exports){
var FctRange,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctRange = (function(superClass) {
  extend(FctRange, superClass);

  function FctRange() {
    this.defaults = bind(this.defaults, this);
    return FctRange.__super__.constructor.apply(this, arguments);
  }

  FctRange.prototype.SubView = require("../views/facets/subrange");

  FctRange.prototype.defaults = function() {
    return $.extend(FctRange.__super__.defaults.apply(this, arguments), {
      min: null,
      max: null,
      step: 1,
      value: null
    });
  };

  return FctRange;

})(require("./facet_base"));

module.exports = FctRange;



},{"../views/facets/subrange":28,"./facet_base":4}],8:[function(require,module,exports){
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



},{"../views/facets/subselect":29,"./facet_base":4}],9:[function(require,module,exports){
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



},{"../views/facets/substring":30,"./facet_base":4}],10:[function(require,module,exports){
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



},{}],11:[function(require,module,exports){
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



},{"./backbone_sub":2}],12:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"daterange-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":35}],13:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, operator, operators, undefined, value) {
if ( operators && operators.length)
{
buf.push("<div class=\"operator\"><select" + (jade.attr("id", "" + (cid) + "op", true, false)) + ">");
// iterate operators
;(function(){
  var $$obj = operators;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var op = $$obj[idx];

buf.push("<option" + (jade.attr("value", op, true, false)) + (jade.attr("selected", ( operator == op ), true, false)) + ">" + (jade.escape(null == (jade_interp = op) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var op = $$obj[idx];

buf.push("<option" + (jade.attr("value", op, true, false)) + (jade.attr("selected", ( operator == op ), true, false)) + ">" + (jade.escape(null == (jade_interp = op) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div>");
}
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", value, true, false)) + " class=\"number-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"operator" in locals_for_with?locals_for_with.operator:typeof operator!=="undefined"?operator:undefined,"operators" in locals_for_with?locals_for_with.operators:typeof operators!=="undefined"?operators:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":35}],14:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<div class=\"rangeinp\">");
var _vals = value ? value : []
buf.push("<input" + (jade.attr("id", "" + (cid) + "_from", true, false)) + (jade.attr("value", _vals[0], true, false)) + " class=\"number-inp range-from\"/><span class=\"separator\">-</span><input" + (jade.attr("id", "" + (cid) + "_to", true, false)) + (jade.attr("value", _vals[0], true, false)) + " class=\"number-inp range-to\"/></div>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":35}],15:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

;return buf.join("");
};
},{"jade/runtime":35}],16:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, multiple, options, undefined, value) {
buf.push("<select" + (jade.attr("id", cid, true, false)) + " multiple=\"multiple\" class=\"select-inp\">");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select>");
if ( multiple)
{
buf.push("<span class=\"btn btn-xs btn-success select-check fa fa-check\"></span>");
}}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"multiple" in locals_for_with?locals_for_with.multiple:typeof multiple!=="undefined"?multiple:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":35}],17:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":35}],18:[function(require,module,exports){
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
},{"jade/runtime":35}],19:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", value, true, false)) + " class=\"string-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":35}],20:[function(require,module,exports){
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
},{"jade/runtime":35}],21:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");;return buf.join("");
};
},{"jade/runtime":35}],22:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13
};



},{}],23:[function(require,module,exports){
var FacetSubsBase, KEYCODES, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../../utils/keycodes");

SubResults = require("../../models/subresults");

FacetSubsBase = (function(superClass) {
  extend(FacetSubsBase, superClass);

  function FacetSubsBase() {
    this.set = bind(this.set, this);
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

  FacetSubsBase.prototype.resultTemplate = require("../../tmpls/result_base.jade");

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
    var ref;
    return {
      cid: this.cid,
      value: (ref = this.model) != null ? ref.get("value") : void 0
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
    if (_.isEmpty(_val) && !_.isNumber(_val) && !_.isBoolean(_val)) {
      this.close();
      return true;
    }
    return false;
  };

  FacetSubsBase.prototype.select = function() {
    var _val;
    _val = this.getValue();
    if (this._checkSelectEmpty(_val)) {
      return;
    }
    this.set(_val);
  };

  FacetSubsBase.prototype.set = function(val) {
    var _ModelConst, _model;
    _ModelConst = this.getSelectModel();
    _model = new _ModelConst({
      value: val
    });
    this.result.add(_model);
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsBase;

})(Backbone.View);

module.exports = FacetSubsBase;



},{"../../models/subresults":11,"../../tmpls/result_base.jade":15,"../../utils/keycodes":22}],24:[function(require,module,exports){
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
    var _endDate, _res, _s, _startDate, _time;
    _res = this.getResults();
    _startDate = moment(_res.value[0]);
    if (_res.value[1] != null) {
      _endDate = moment(_res.value[1]);
    }
    _time = this.model.get("opts").timePicker;
    _s = "<li>";
    _s += _startDate.format((_time ? "LLLL" : "LL"));
    if (_endDate != null) {
      _s += " - ";
      _s += _endDate.format((_time ? "LLLL" : "LL"));
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
    var _out, _predefVal;
    _predefVal = this.model.get("value");
    if (_predefVal != null) {
      if (!_.isArray(_predefVal)) {
        _predefVal = [_predefVal];
      }
      this.startDate = _predefVal[0], this.endDate = _predefVal[1];
      return _predefVal;
    }
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



},{"../../tmpls/daterange.jade":12,"../../utils/keycodes":22,"./base":23}],25:[function(require,module,exports){
var FacetNumberBase, KEYCODES, nearest, precision,
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

FacetNumberBase = (function(superClass) {
  extend(FacetNumberBase, superClass);

  function FacetNumberBase() {
    this._setNumber = bind(this._setNumber, this);
    this.getValue = bind(this.getValue, this);
    this.crement = bind(this.crement, this);
    this.input = bind(this.input, this);
    this.events = bind(this.events, this);
    this.setNumber = _.throttle(this._setNumber, 300, {
      leading: false,
      trailing: false
    });
    FacetNumberBase.__super__.constructor.apply(this, arguments);
    return;
  }

  FacetNumberBase.prototype.events = function() {
    var _evnts, obj;
    _evnts = (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj
    );
    return _evnts;
  };

  FacetNumberBase.prototype.input = function(evnt) {
    var _$el, _v;
    _$el = $(evnt.currentTarget);
    if (evnt.type === "keydown") {
      switch (evnt.keyCode) {
        case KEYCODES.UP:
          this.crement(this.model.get("step"), _$el);
          return;
        case KEYCODES.DOWN:
          this.crement(this.model.get("step") * -1, _$el);
          return;
        case KEYCODES.ENTER:
          this.select();
          return;
      }
    }
    if (evnt.type === "keyup") {
      _v = evnt.currentTarget.value.replace(/[^\d]?[^-\d]+/g, "");
      _v = parseInt(_v, 10);
      this.setNumber(_v, _$el);
    }
  };

  FacetNumberBase.prototype.crement = function(change, el) {
    var _v;
    if (el == null) {
      el = this.$inp;
    }
    _v = el.val();
    if (!(_v != null ? _v.length : void 0)) {
      _v = this.model.get("value");
    } else {
      _v = parseInt(_v, 10);
    }
    this._setNumber(_v + change, el);
  };

  FacetNumberBase.prototype.getValue = function() {
    var _v;
    _v = this.$inp.val();
    if (!(_v != null ? _v.length : void 0)) {
      return null;
    }
    return parseInt(this.valueByDefinition(_v), 10);
  };

  FacetNumberBase.prototype._setNumber = function(_v, el) {
    var _curr;
    if (el == null) {
      el = this.$inp;
    }
    if (isNaN(_v)) {
      return;
    }
    _curr = el.val();
    _v = this.valueByDefinition(_v);
    if (_curr !== _v.toString()) {
      el.val(_v);
    }
  };

  FacetNumberBase.prototype.valueByDefinition = function(_value) {
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

  return FacetNumberBase;

})(require("./base"));

module.exports = FacetNumberBase;



},{"../../utils/keycodes":22,"./base":23}],26:[function(require,module,exports){
var ArrayOption, ArrayOptions, FacetSubArray, StringOption, StringOptions, SubResults,
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

  FacetSubArray.prototype.optDefault = {
    name: "-",
    value: "-",
    group: null
  };

  FacetSubArray.prototype.multiSelect = true;

  FacetSubArray.prototype.optColl = StringOptions;

  function FacetSubArray(options) {
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this.getResults = bind(this.getResults, this);
    this.select = bind(this.select, this);
    options.custom = true;
    this.collection = this._createOptionCollection(options.model.get("options"));
    FacetSubArray.__super__.constructor.call(this, options);
    return;
  }

  FacetSubArray.prototype.select = function() {
    var _mdl, _val, _vals, i, len;
    _vals = this.model.get("value");
    if ((_vals != null) && !_.isArray(_vals)) {
      _vals = [_vals];
    }
    for (i = 0, len = _vals.length; i < len; i++) {
      _val = _vals[i];
      _mdl = this.collection.get(_val);
      if (_mdl == null) {
        _mdl = new this.collection.model({
          value: _val,
          custom: true
        });
      }
      this.selected(_mdl);
    }
    this.close();
  };

  FacetSubArray.prototype.getResults = function() {
    return {
      value: this.result.pluck("value")
    };
  };

  FacetSubArray.prototype._createOptionCollection = function(options) {
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

  return FacetSubArray;

})(require("../selector"));

module.exports = FacetSubArray;



},{"../../models/backbone_sub":2,"../../models/subresults":11,"../selector":32}],27:[function(require,module,exports){
var FacetSubsNumber,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubsNumber = (function(superClass) {
  extend(FacetSubsNumber, superClass);

  function FacetSubsNumber() {
    this.getResults = bind(this.getResults, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.focus = bind(this.focus, this);
    this._opSelected = bind(this._opSelected, this);
    this.close = bind(this.close, this);
    this.renderResult = bind(this.renderResult, this);
    this.render = bind(this.render, this);
    this.events = bind(this.events, this);
    return FacetSubsNumber.__super__.constructor.apply(this, arguments);
  }

  FacetSubsNumber.prototype.template = require("../../tmpls/number.jade");

  FacetSubsNumber.prototype.events = function() {
    var _evnts, ref;
    _evnts = FacetSubsNumber.__super__.events.apply(this, arguments);
    if (!((ref = this.model.get("operators")) != null ? ref.length : void 0)) {
      _evnts["blur " + (this._getInpSelector())] = "select";
    }
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
      operators: this.model.get("operators"),
      operator: this.model.get("operator")
    });
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

  return FacetSubsNumber;

})(require("./number_base"));

module.exports = FacetSubsNumber;



},{"../../tmpls/number.jade":13,"./number_base":25}],28:[function(require,module,exports){
var FacetSubsRange,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubsRange = (function(superClass) {
  extend(FacetSubsRange, superClass);

  function FacetSubsRange() {
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.close = bind(this.close, this);
    this.focus = bind(this.focus, this);
    this.render = bind(this.render, this);
    this.renderResult = bind(this.renderResult, this);
    this.events = bind(this.events, this);
    this._getInpSelector = bind(this._getInpSelector, this);
    return FacetSubsRange.__super__.constructor.apply(this, arguments);
  }

  FacetSubsRange.prototype.template = require("../../tmpls/range.jade");

  FacetSubsRange.prototype._getInpSelector = function(ext) {
    if (ext == null) {
      ext = "_from";
    }
    return "input#" + this.cid + ext;
  };

  FacetSubsRange.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj["keyup " + (this._getInpSelector("_to"))] = "input",
      obj["keydown " + (this._getInpSelector("_to"))] = "input",
      obj
    );
  };

  FacetSubsRange.prototype.renderResult = function() {
    var _res;
    _res = this.getResults();
    return "<li>" + _res.value.join(" - ") + "</li>";
  };

  FacetSubsRange.prototype.render = function() {
    FacetSubsRange.__super__.render.apply(this, arguments);
    this.$inpTo = this.$el.find(this._getInpSelector("_to"));
  };

  FacetSubsRange.prototype.focus = function(inp) {
    if (inp == null) {
      inp = false;
    }
    FacetSubsRange.__super__.focus.apply(this, arguments);
  };

  FacetSubsRange.prototype.close = function() {
    this.$(".rangeinp").remove();
    FacetSubsRange.__super__.close.apply(this, arguments);
  };

  FacetSubsRange.prototype.getResults = function() {
    var _ret;
    _ret = {
      value: this.getValue()
    };
    return _ret;
  };

  FacetSubsRange.prototype.getValue = function() {
    var _v, _vFrom, _vTo;
    _vFrom = FacetSubsRange.__super__.getValue.apply(this, arguments);
    _v = this.$inpTo.val();
    if (!(_v != null ? _v.length : void 0)) {
      return null;
    }
    _vTo = parseInt(this.valueByDefinition(_v), 10);
    return [_vFrom, _vTo];
  };

  return FacetSubsRange;

})(require("./number_base"));

module.exports = FacetSubsRange;



},{"../../tmpls/range.jade":14,"./number_base":25}],29:[function(require,module,exports){
var FacetSubsSelect, KEYCODES,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
    evnt.stopPropagation();
    return false;
  };

  FacetSubsSelect.prototype.remove = function() {
    return FacetSubsSelect.__super__.remove.apply(this, arguments);
  };

  FacetSubsSelect.prototype.getTemplateData = function() {
    var _data, _v, i, len, ref;
    _data = _.extend({}, FacetSubsSelect.__super__.getTemplateData.apply(this, arguments), {
      multiple: this.model.get("multiple"),
      options: this._createOptionCollection(this.model.get("options"))
    });
    if ((_data.value != null) && !_.isArray(_data.value)) {
      _data.value = [_data.value];
    }
    if (_data.value != null) {
      ref = _data.value;
      for (i = 0, len = ref.length; i < len; i++) {
        _v = ref[i];
        if (indexOf.call(_.pluck(_data.options, "value"), _v) < 0) {
          _data.options.push({
            value: _v,
            label: _v,
            group: null
          });
        }
      }
    }
    return _data;
  };

  FacetSubsSelect.prototype.getValue = function() {
    return this.$inp.val();
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
    var ref, ref1;
    this.result.remove((ref = evnt.params) != null ? (ref1 = ref.data) != null ? ref1.id : void 0 : void 0);
  };

  FacetSubsSelect.prototype.close = function() {
    var ref, ref1;
    if ((ref = this.select2) != null) {
      ref.destroy();
    }
    if ((ref1 = this.$inp) != null) {
      ref1.remove();
    }
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



},{"../../tmpls/select.jade":16,"../../utils/keycodes":22,"./base":23}],30:[function(require,module,exports){
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
    var ref;
    if ((ref = this.$inp) != null) {
      ref.remove();
    }
    FacetSubString.__super__.close.apply(this, arguments);
  };

  return FacetSubString;

})(require("./base"));

module.exports = FacetSubString;



},{"../../tmpls/string.jade":19,"./base":23}],31:[function(require,module,exports){
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
    this.genSub = bind(this.genSub, this);
    this.setFacet = bind(this.setFacet, this);
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
    var fct, i, len, ref, subview;
    this.results = options.results;
    this.collection.on("iggy:rem", this.remFacet);
    this.el.className += this.className;
    this.render();
    $(document).on("keyup", this._onKey);
    ref = this.collection.filter(function(fct) {
      return (fct != null ? fct.get("value") : void 0) != null;
    });
    for (i = 0, len = ref.length; i < len; i++) {
      fct = ref[i];
      subview = this.genSub(fct);
    }
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
      this.subview.close();
      this.subview = null;
    }
  };

  MainView.prototype.remFacet = function(facetM) {
    this.results.remove(facetM.get("name"));
  };

  MainView.prototype.setFacet = function(facetM, data) {
    this.collection.remove(facetM);
    this.results.add(_.extend(data, {
      name: facetM.get("name"),
      type: facetM.get("type")
    }), {
      merge: true,
      parse: true,
      _facet: facetM
    });
  };

  MainView.prototype.genSub = function(facetM) {
    var subview;
    subview = new SubView({
      model: facetM,
      collection: this.collection
    });
    subview.on("closed", (function(_this) {
      return function(results) {
        subview.off();
        if (!(results != null ? results.length : void 0)) {
          subview.remove();
        }
        _this.subview = null;
      };
    })(this));
    subview.on("selected", this.setFacet);
    this.$addBtn.before(subview.render());
    return subview;
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
        facetM.set("value", null);
        _this.subview = _this.genSub(facetM);
        _this.subview.open();
      };
    })(this));
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;



},{"../tmpls/wrapper.jade":21,"../utils/keycodes":22,"./selector":32,"./sub":33}],32:[function(require,module,exports){
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
    this.selectActive = bind(this.selectActive, this);
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
    this.selected(this.collection.get(_id));
    if (!this.multiSelect) {
      this.close();
    }
    return false;
  };

  SelectorView.prototype.selected = function(mdl) {
    this.searchcoll.remove(mdl);
    this.result.add(mdl);
    this.trigger("selected", mdl);
  };

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
          this.selectActive();
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

  SelectorView.prototype.select = function() {};

  SelectorView.prototype.selectActive = function() {
    var _sel, ref;
    _sel = this.$el.find(".typelist a.active").removeClass("active").data();
    this.activeIdx = 0;
    if ((_sel != null ? _sel.idx : void 0) >= 0 && this.searchcoll.length) {
      this.selected(this.collection.get(_sel.id));
    } else if ((ref = this.currQuery) != null ? ref.length : void 0) {
      this.selected(new this.collection.model({
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



},{"../tmpls/selector.jade":17,"../tmpls/selectorli.jade":18,"../utils/keycodes":22,"./facets/base":23}],33:[function(require,module,exports){
var ViewSub,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewSub = (function(superClass) {
  extend(ViewSub, superClass);

  function ViewSub() {
    this.open = bind(this.open, this);
    this.generateSub = bind(this.generateSub, this);
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
    this.generateSub();
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

  ViewSub.prototype.generateSub = function() {
    var ref;
    if (this.selectview != null) {
      return this.selectview;
    }
    this.selectview = new this.model.SubView({
      model: this.model,
      el: this.$sub
    });
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
    this.$el.append(this.selectview.render());
    if (((ref = this.model) != null ? ref.get("value") : void 0) != null) {
      this.selectview.select();
    }
  };

  ViewSub.prototype.open = function() {
    this.generateSub();
    this.selectview.focus();
  };

  return ViewSub;

})(Backbone.View);

module.exports = ViewSub;



},{"../tmpls/sub.jade":20}],34:[function(require,module,exports){

},{}],35:[function(require,module,exports){
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

},{"fs":34}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRfcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3NlbGVjdC5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL21vZGVscy9zdWJyZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvdG1wbHMvZGF0ZXJhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9yYW5nZS5qYWRlIiwiX3NyYy9qcy90bXBscy9yZXN1bHRfYmFzZS5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3QuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3IuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3JsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9zdHJpbmcuamFkZSIsIl9zcmMvanMvdG1wbHMvc3ViLmphZGUiLCJfc3JjL2pzL3RtcGxzL3dyYXBwZXIuamFkZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL3V0aWxzL2tleWNvZGVzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL251bWJlcl9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VibnVtYmVyLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvcHJvamVjdHMvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9wcm9qZWN0cy9pZ2d5L19zcmMvanMvdmlld3MvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL3Byb2plY3RzL2lnZ3kvX3NyYy9qcy92aWV3cy9zdWIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9qYWRlL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGtHQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVCxDQUFYLENBQUE7O0FBQUEsTUFDQSxHQUFTLE9BQUEsQ0FBUyx1QkFBVCxDQURULENBQUE7O0FBQUEsU0FFQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUZaLENBQUE7O0FBQUEsUUFHQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVCxDQUhYLENBQUE7O0FBQUEsU0FJQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUpaLENBQUE7O0FBQUEsU0FLQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVCxDQUxaLENBQUE7O0FBQUEsUUFNQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVCxDQU5YLENBQUE7O0FBQUEsWUFPQSxHQUFlLE9BQUEsQ0FBUywwQkFBVCxDQVBmLENBQUE7O0FBQUEsT0FRQSxHQUFVLE9BQUEsQ0FBUyxrQkFBVCxDQVJWLENBQUE7O0FBQUE7QUFXQywwQkFBQSxDQUFBOztBQUFBLGlCQUFBLENBQUEsR0FBRyxNQUFILENBQUE7O0FBQ2EsRUFBQSxjQUFFLEVBQUYsRUFBTSxNQUFOLEVBQW1CLE9BQW5CLEdBQUE7O01BQU0sU0FBUztLQUMzQjs7TUFEK0IsVUFBVTtL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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkEsTUFBTSxDQUFDLE9BQVAsR0FDQztBQUFBLEVBQUEsTUFBQSxFQUFRLEVBQVI7QUFBQSxFQUNBLE9BQUEsRUFBUyxFQURUO0FBQUEsRUFFQSxJQUFBLEVBQU0sRUFGTjtBQUFBLEVBR0EsTUFBQSxFQUFRLEVBSFI7QUFBQSxFQUlBLEtBQUEsRUFBTyxDQUFFLEdBQUYs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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1haW5WaWV3ID0gcmVxdWlyZSggXCIuL3ZpZXdzL21haW5cIiApXG5GYWNldHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcbkZjdFN0cmluZyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc3RyaW5nXCIgKVxuRmN0QXJyYXkgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2FycmF5XCIgKVxuRmN0U2VsZWN0ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zZWxlY3RcIiApXG5GY3ROdW1iZXIgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X251bWJlclwiIClcbkZjdFJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9yYW5nZVwiIClcbkZjdERhdGVSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlXCIgKVxuUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvcmVzdWx0c1wiIClcblxuY2xhc3MgSUdHWSBleHRlbmRzIEJhY2tib25lLkV2ZW50c1xuXHQkOiBqUXVlcnlcblx0Y29uc3RydWN0b3I6ICggZWwsIGZhY2V0cyA9IFtdLCBvcHRpb25zID0ge30gKS0+XG5cdFx0Xy5leHRlbmQgQCwgQmFja2JvbmUuRXZlbnRzXG5cdFx0QF9pbml0RXJyb3JzKClcblx0XHRcblx0XHQjIGluaXQgZWxlbWVudFxuXHRcdEAkZWwgPSBAX3ByZXBhcmVFbCggZWwgKVxuXHRcdEBlbCA9IEAkZWxbMF1cblx0XHRAJGVsLmRhdGEoIFwiaWdneVwiLCBAIClcblxuXHRcdCMgaW5pdCBmYWNldHNcblx0XHRAZmFjZXRzID0gQF9wcmVwYXJlRmFjZXRzKCBmYWNldHMgKVxuXHRcdEByZXN1bHRzID0gbmV3IFJlc3VsdHMoKVxuXG5cdFx0QHJlc3VsdHMub24gXCJhZGRcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcInJlbW92ZVwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwiY2hhbmdlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cblx0XHRuZXcgTWFpblZpZXcoIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cyApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQgaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X3JldC5wdXNoIF9mY3RcblxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0IClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJzZWxlY3RcIiB0aGVuIHJldHVybiBuZXcgRmN0U2VsZWN0KCBmYWNldCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCApXG5cdFx0XHR3aGVuIFwicmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0UmFuZ2UoIGZhY2V0IClcblx0XHRcdHdoZW4gXCJkYXRlcmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0RGF0ZVJhbmdlKCBmYWNldCApXG5cblx0YWRkRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0aWYgbm90IEBmYWNldHM/XG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRAZmFjZXRzLmFkZCggX2ZjdCApXG5cdFx0cmV0dXJuIEBcblxuXHRfZXJyb3I6ICggdHlwZSwgZGF0YSA9IHt9ICk9PlxuXHRcdGlmIEBlcnJvcnNbIHR5cGUgXT9cblx0XHRcdF9tc2cgPSBAZXJyb3JzWyB0eXBlIF0oIGRhdGEgKVxuXHRcdGVsc2Vcblx0XHRcdF9tc2cgPSBcIi1cIlxuXHRcdF9lcnIgPSBuZXcgRXJyb3IoKVxuXHRcdF9lcnIubmFtZSA9IHR5cGVcblx0XHRfZXJyLm1lc3NhZ2UgPSBfbXNnXG5cdFx0cmV0dXJuIF9lcnJcblxuXHRnZXRRdWVyeTogPT5cblx0XHRyZXR1cm4gQHJlc3VsdHNcblxuXHR0cmlnZ2VyQ2hhbmdlOiA9PlxuXHRcdEB0cmlnZ2VyKCBcImNoYW5nZVwiLCBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X2luaXRFcnJvcnM6ID0+XG5cdFx0QGVycm9ycyA9IHt9XG5cdFx0Zm9yIF9rLCBfdG1wbCBvZiBARVJST1JTKClcblx0XHRcdEBlcnJvcnNbIF9rIF0gPSBfLnRlbXBsYXRlKCBfdG1wbCApIFxuXHRcdHJldHVyblxuXG5cdEVSUk9SUzogPT5cblx0XHRcIkVJTlZBTElERUxTVFJJTkdcIjogXCJJZiB5b3UgZGVmaW5lIGEgYGVsYCBhcyBTdHJpbmcgaXQgaGFzIHRvIGJlIGEgdmFsaWQgc2VsZWN0b3IgZm9yIGFuIGV4aXN0aW5nIERPTSBlbGVtZW50LlwiXG5cdFx0XCJFRU1QVFlFTFNUUklOR1wiOiBcIlRoZSBgZWxgIGFzIHN0cmluZyBjYW4gbm90IGJlIGVtcHR5LlwiXG5cdFx0XCJFRU1QVFlFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhbiBlbXB0eSBjb2xsZWN0aW9uLlwiXG5cdFx0XCJFU0laRUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGEgcmVzdWx0IG9mIG9uZSBlbC5cIlxuXHRcdFwiRUlOVkFMSURFTFRZUEVcIjogXCJUaGUgYGVsYCBjYW4gb25seSBiZSBhIHNlbGVjdG9yIHN0cmluZywgZG9tIGVsZW1lbnQgb3IgalF1ZXJ5IGNvbGxlY3Rpb25cIlxuXHRcdFwiRU1JU1NJTkdFTFwiOiBcIlBsZWFzZSBkZWZpbmUgYSB0YXJnZXQgYGVsYFwiXG5cbm1vZHVsZS5leHBvcnRzID0gSUdHWSIsIiMjI1xuRVhBTVBMRSBVU0FHRVxuXG5cdHBhcmVudENvbGwgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbi5TdWIoKVxuXHRcblx0IyBieSBBcnJheVxuXHRzdWJDb2xsQSA9IHBhcmVudENvbGwuc3ViKCBbIDEsIDIsIDMgXSApIFxuXHRcblx0IyBvciBieSBPYmplY3Rcblx0c3ViQ29sbE8gPSBwYXJlbnRDb2xsLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKSBcblx0XG5cdCMgb3IgYnkgTnVtYmVyXG5cdHN1YkNvbGxOID0gcGFyZW50Q29sbC5zdWIoIDEzIClcblx0XG5cdCMgb3IgYnkgRnVuY3Rpb25cblx0c3ViQ29sbEYgPSBwYXJlbnRDb2xsLnN1YiggKCggbW9kZWwgKS0+IGlmIG1vZGVsLmdldCggXCJhZ2VcIiApID4gMjMgKSApXG5cdFxuXHQjIHN1YmNvbGxlY3Rpb24gb2Ygc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQV9PID0gc3ViQ29sbEEuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gRm9yIHRoaXMgYSBgcmVzZXRgIHdpbGwgYmUgZmlyZWQgb24gdGhlIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEEgPSBzdWJDb2xsQS51cGRhdGVTdWJGaWx0ZXIoIHsgbmFtZTogXCJCYXJcIiwgYWdlOiA0MiB9IClcbiMjI1xuXG5jbGFzcyBCYWNrYm9uZVN1YiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0IyMjXG5cdCMjIHN1YlxuXHRcblx0YGNvbGxlY3Rpb24uc3ViKCBmaWx0ZXIgKWBcblx0XG5cdEdlbmVyYXRlIGEgc3ViLWNvbGxlY3Rpb24gYnkgYSBmaWx0ZXIuXG5cdFRoZSBtb2RlbHMgd2lsbCBiZSBkaXN0cmlidXRlZCB3aXRoaW4gYWxsIGludm9sdmVkIGNvbGxlY3Rpb25zIHVuZGVyIGNvbnNpZGVyYXRpb24gb2YgdGhlIGZpbHRlci5cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgQ29sbGVjdGlvbiB9IEEgU3ViLUNvbGxlY3Rpb24gYmFzZWQgb24gdGhlIGZpbHRlclxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHN1YjogKCBmaWx0ZXIgKT0+XG5cdFx0QHN1YkNvbGxzIG9yPSBbXVxuXHRcdGZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClcblxuXHRcdCMgZmlsdGVyIHRoZSBjb2xsZWN0aW9uXG5cdFx0X21vZGVscyA9IEBmaWx0ZXIgZm5GaWx0ZXJcblx0XHQjIGNyZWF0ZSB0aGUgc3ViY29sbGVjdGlvblxuXHRcdF9zdWIgPSBuZXcgQGNvbnN0cnVjdG9yKCBfbW9kZWxzIClcblxuXHRcdF9zdWIuX3BhcmVudENvbCA9IEBcblx0XHRfc3ViLl9mbkZpbHRlciA9IGZuRmlsdGVyXG5cblx0XHQjIGFkZCBldmVudCBoYW5kbGVycyB0byBkaXN0cmlidXRlIHRoZSBtb2RlbHMgdGhyb3VnaCB0aGUgc3ViIGNvbGxlY3Rpb25zIHRyZWVcblxuXHRcdCMgcmVjaGVjayB0aGUgbW9kZWwgYWdhaW5zdCB0aGUgZmlsdGVyIG9uIGNoYW5nZVxuXHRcdEBvbiBcImNoYW5nZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHR0b0FkZCA9IEBfZm5GaWx0ZXIoIF9tICkgXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy4gXG5cdFxuXHRAcmV0dXJuIHsgU2VsZiB9IGl0c2VsZlxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHVwZGF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIsIGFzUmVzZXQgPSB0cnVlICk9PlxuXHRcdGlmIEBfcGFyZW50Q29sP1xuXG5cdFx0XHQjIHNldCB0aGUgbmV3IGZpbHRlciBtZXRob2Rcblx0XHRcdEBfZm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKSBpZiBmaWx0ZXI/XG5cblx0XHRcdF9tb2RlbHMgPSBAX3BhcmVudENvbC5maWx0ZXIoIEBfZm5GaWx0ZXIgKVxuXG5cdFx0XHQjIHJlc2V0IHRoZSBjb2xsZWN0aW9uIHdpdGggdGhlIG5ldyBtb2RlbHNcblx0XHRcdGlmIGFzUmVzZXRcblx0XHRcdFx0QHJlc2V0KCBfbW9kZWxzIClcblx0XHRcdFx0cmV0dXJuIEBcblxuXHRcdFx0bmV3aWRzID0gXy5wbHVjayggX21vZGVscywgXCJjaWRcIiApXG5cdFx0XHRjdXJyaWRzID0gXy5wbHVjayggQG1vZGVscywgXCJjaWRcIiApXG5cdFx0XHRmb3IgcmlkIGluIF8uZGlmZmVyZW5jZSggY3VycmlkcywgbmV3aWRzIClcblx0XHRcdFx0QHJlbW92ZSggcmlkIClcblx0XHRcdFx0XG5cdFx0XHRfYWRkSWRzID0gXy5kaWZmZXJlbmNlKCBuZXdpZHMsIGN1cnJpZHMgKVxuXHRcdFx0Zm9yIG1kbCBpbiBfbW9kZWxzIHdoZW4gbWRsLmNpZCBpbiBfYWRkSWRzXG5cdFx0XHRcdEBhZGQoIG1kbCApXG5cblx0XHRyZXR1cm4gQFxuXG5cblx0IyMjXG5cdCMjIF9nZW5lcmF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24uX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdEludGVybmFsIG1ldGhvZCB0aCBjb252ZXJ0IGEgZmlsdGVyIGFyZ3VtZW50IHRvIGEgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLiBcblx0XG5cdEByZXR1cm4geyBGdW5jdGlvbiB9IFRoZSBnZW5lcmF0ZWQgZmlsdGVyIGZ1bmN0aW9uIFxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICk9PlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICk9PlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKT0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApPT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWIiLCJjbGFzcyBGY3RBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9zdHJpbmdcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YmFycmF5XCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0QXJyYXlcbiIsImNsYXNzIEZhY2V0QmFzZSBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9iYXNlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcIm5hbWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cblx0Y29tcGFyYXRvcjogKCBtZGwgKS0+XG5cdFx0cmV0dXJuIG1kbC5pZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0QmFzZSIsImNsYXNzIEZjdERhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRvcHRzOiB7fVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3REYXRlUmFuZ2UiLCJjbGFzcyBGY3ROdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VibnVtYmVyXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsIFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyIiwiY2xhc3MgRmN0UmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VicmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RSYW5nZSIsImNsYXNzIEZjdFNlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzZWxlY3RcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRvcHRpb25zOiBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFNlbGVjdCIsImNsYXNzIEZjdFN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmdcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlciwgXG5cdFx0XHRvcHRpb25zOiBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFN0cmluZyIsImNsYXNzIElnZ3lSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0ZGVmYXVsdHM6IFxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBudWxsXG5cdFx0dmFsdWU6IG51bGxcblxuY2xhc3MgSWdneVJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdHBhcnNlOiAoIGF0dHIsIG9wdGlvbnMgKT0+XG5cdFx0X21vZGlmeSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwibW9kaWZ5XCIgKVxuXHRcdF9uYW1lID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJuYW1lXCIgKVxuXHRcdF90eXBlID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJ0eXBlXCIgKVxuXHRcdGlmIF9tb2RpZnk/IGFuZCBfLmlzRnVuY3Rpb24oIF9tb2RpZnkgKVxuXHRcdFx0YXR0ci52YWx1ZSA9IF9tb2RpZnkoIGF0dHIudmFsdWUsIG9wdGlvbnMuX2ZhY2V0IClcblx0XHRyZXR1cm4gYXR0clxuXG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lSZXN1bHRzIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiLVwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzIiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJkYXRlcmFuZ2UtaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgb3BlcmF0b3IsIG9wZXJhdG9ycywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuaWYgKCBvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwib3BlcmF0b3JcXFwiPjxzZWxlY3RcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIm9wXCIsIHRydWUsIGZhbHNlKSkgKyBcIj5cIik7XG4vLyBpdGVyYXRlIG9wZXJhdG9yc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcGVyYXRvcnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggb3BlcmF0b3IgPT0gb3AgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggb3BlcmF0b3IgPT0gb3AgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3NlbGVjdD48L2Rpdj5cIik7XG59XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm9wZXJhdG9yXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcjp0eXBlb2Ygb3BlcmF0b3IhPT1cInVuZGVmaW5lZFwiP29wZXJhdG9yOnVuZGVmaW5lZCxcIm9wZXJhdG9yc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3JzOnR5cGVvZiBvcGVyYXRvcnMhPT1cInVuZGVmaW5lZFwiP29wZXJhdG9yczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJyYW5nZWlucFxcXCI+XCIpO1xudmFyIF92YWxzID0gdmFsdWUgPyB2YWx1ZSA6IFtdXG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwiX2Zyb21cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1swXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLWZyb21cXFwiLz48c3BhbiBjbGFzcz1cXFwic2VwYXJhdG9yXFxcIj4tPC9zcGFuPjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwiX3RvXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS10b1xcXCIvPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuO3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBtdWx0aXBsZSwgb3B0aW9ucywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcHRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbmlmICggbXVsdGlwbGUpXG57XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJidG4gYnRuLXhzIGJ0bi1zdWNjZXNzIHNlbGVjdC1jaGVjayBmYSBmYS1jaGVja1xcXCI+PC9zcGFuPlwiKTtcbn19LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJtdWx0aXBsZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubXVsdGlwbGU6dHlwZW9mIG11bHRpcGxlIT09XCJ1bmRlZmluZWRcIj9tdWx0aXBsZTp1bmRlZmluZWQsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYWN0aXZlSWR4LCBjdXN0b20sIGxpc3QsIHF1ZXJ5LCB1bmRlZmluZWQpIHtcbnZhciBhZGQgPSAwO1xuaWYgKCBjdXN0b20gJiYgcXVlcnkpXG57XG5hZGQgPSAxO1xuYnVmLnB1c2goXCI8bGk+PGEgZGF0YS1pZD1cXFwiX2N1c3RvbVxcXCIgZGF0YS1pZHg9XFxcIi0xXFxcIlwiICsgKGphZGUuY2xzKFt7YWN0aXZlOjAgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPjxpPlxcXCJcIiArICgoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2k+PC9hPjwvbGk+XCIpO1xufVxuaWYgKCBsaXN0Lmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgbGlzdFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBsaXN0O1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHNlbGVjdGVkLCB1bmRlZmluZWQpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9kaXY+PHNwYW4gY2xhc3M9XFxcInN1YmxhYmVsXFxcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBsYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiOjwvc3Bhbj48dWwgY2xhc3M9XFxcInN1YnJlc3VsdHNcXFwiPlwiKTtcbmlmICggc2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBzZWxlY3RlZFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzZWxlY3RlZDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjxkaXYgY2xhc3M9XFxcInN1YnNlbGVjdFxcXCI+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwibGFiZWxcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxhYmVsOnR5cGVvZiBsYWJlbCE9PVwidW5kZWZpbmVkXCI/bGFiZWw6dW5kZWZpbmVkLFwic2VsZWN0ZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnNlbGVjdGVkOnR5cGVvZiBzZWxlY3RlZCE9PVwidW5kZWZpbmVkXCI/c2VsZWN0ZWQ6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImFkZC1mYWNldC1idG4gZmEgZmEtcGx1c1xcXCI+PC9kaXY+XCIpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gXG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTMiLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5TdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgRmFjZXRTdWJzQmFzZSBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0cmVzdWx0VGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmVzdWx0X2Jhc2UuamFkZVwiIClcblxuXHRpbml0aWFsaXplOiA9PlxuXHRcdEByZXN1bHQgPSBuZXcgU3ViUmVzdWx0cygpXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEBpc09wZW4gPSB0cnVlXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVyblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0Y2lkOiBAY2lkXHRcblx0XHR2YWx1ZTogQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApXHRcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfVwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCBAZ2V0VGVtcGxhdGVEYXRhKCkgKSApXG5cdFx0QCRpbnAgPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoKSApXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcIm9wZW5cIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGlzT3BlbiA9IGZhbHNlXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6ID0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0X2NoZWNrU2VsZWN0RW1wdHk6ICggX3ZhbCApPT5cblx0XHRpZiBfLmlzRW1wdHkoIF92YWwgKSBhbmQgbm90IF8uaXNOdW1iZXIoIF92YWwgKSBhbmQgbm90IF8uaXNCb29sZWFuKCBfdmFsIClcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHNlbGVjdDogPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRyZXR1cm4gaWYgQF9jaGVja1NlbGVjdEVtcHR5KCBfdmFsIClcblx0XHRAc2V0KCBfdmFsIClcblx0XHRyZXR1cm5cblxuXHRzZXQ6ICggdmFsICk9PlxuXHRcdF9Nb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiB2YWwgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0Jhc2UiLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0RhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9kYXRlcmFuZ2UuamFkZVwiIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRmb3JjZWREYXRlUmFuZ2VPcHRzOlxuXHRcdG9wZW5zOiBcInJpZ2h0XCJcblxuXHRldmVudHM6ID0+IFxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0aWYgbm90IEBkYXRlcmFuZ2VwaWNrZXI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgQGZvcmNlZERhdGVSYW5nZU9wdHMgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRcdEAkaW5wLm9uKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblxuXHRcdGVsc2Vcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKSBpZiBfcmVzLnZhbHVlWyAxIF0/XG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRfZGF0ZVJldHVybjogKCBAc3RhcnREYXRlLCBAZW5kRGF0ZSApPT5cblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ByZWRlZlZhbCA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgX3ByZWRlZlZhbD9cblx0XHRcdGlmIG5vdCBfLmlzQXJyYXkoIF9wcmVkZWZWYWwgKVxuXHRcdFx0XHRfcHJlZGVmVmFsID0gIFsgX3ByZWRlZlZhbCBdXG5cdFx0XHRbIEBzdGFydERhdGUsIEBlbmREYXRlIF0gPSBfcHJlZGVmVmFsXG5cdFx0XHRyZXR1cm4gX3ByZWRlZlZhbCBcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2UiLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbm5lYXJlc3QgPSAobiwgdiktPlxuXHRuID0gbiAvIHZcblx0biA9IE1hdGgucm91bmQobikgKiB2XG5cdHJldHVybiBuXG5cdFxucHJlY2lzaW9uID0gKG4sIGRwKS0+XG5cdGRwID0gTWF0aC5wb3coMTAsIGRwKVxuXHRuID0gbiAqIGRwXG5cdG4gPSBNYXRoLnJvdW5kKG4pXG5cdG4gPSBuIC8gZHBcblx0cmV0dXJuIG5cblxuY2xhc3MgRmFjZXROdW1iZXJCYXNlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHNldE51bWJlciA9IF8udGhyb3R0bGUoIEBfc2V0TnVtYmVyLCAzMDAsIHtsZWFkaW5nOiBmYWxzZSwgdHJhaWxpbmc6IGZhbHNlfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gXG5cdFx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRfJGVsID0gJCggZXZudC5jdXJyZW50VGFyZ2V0IClcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92LCBfJGVsIClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSwgZWwgPSBAJGlucCApPT5cblx0XHRfdiA9IGVsLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdF92ID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRlbHNlXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdFx0QF9zZXROdW1iZXIoIF92ICsgY2hhbmdlLCBlbCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdHJldHVybiBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRfc2V0TnVtYmVyOiAoIF92LCBlbCA9IEAkaW5wICk9PlxuXHRcdGlmIGlzTmFOKCBfdiApXG5cdFx0XHQjQCRpbnAudmFsKFwiXCIpXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9jdXJyID0gZWwudmFsKClcblxuXHRcdF92ID0gQHZhbHVlQnlEZWZpbml0aW9uKCBfdilcblx0XHRpZiBfY3VyciAhPSBfdi50b1N0cmluZygpXG5cdFx0XHRlbC52YWwoIF92IClcblx0XHRyZXR1cm5cblxuXHR2YWx1ZUJ5RGVmaW5pdGlvbjogKCBfdmFsdWUgKS0+XG5cdFx0bWF4ID0gQG1vZGVsLmdldCggXCJtYXhcIiApXG5cdFx0bWluID0gQG1vZGVsLmdldCggXCJtaW5cIiApXG5cdFx0c3RlcCA9IEBtb2RlbC5nZXQoIFwic3RlcFwiIClcblx0XHRcblx0XHQjIGZpeCByZXZlcnNlZCBtaW4vbWF4IHNldHRpbmdcblx0XHRpZiBtaW4gPiBtYXhcblx0XHRcdF90bXAgPSBtaW5cblx0XHRcdG1pbiA9IG1heFxuXHRcdFx0bWF4ID0gX3RtcFxuXHRcdFxuXHRcdCMgb24gZXh4ZWRkaW5nIHRoZSBsaW1pdHMgdXNlIHRoZSBsaW1pdFxuXHRcdGlmIG1pbj8gYW5kIF92YWx1ZSA8IG1pblxuXHRcdFx0cmV0dXJuIG1pblxuXHRcdGlmIG1heD8gYW5kIF92YWx1ZSA+IG1heFxuXHRcdFx0cmV0dXJuIG1heFxuXG5cdFx0IyBzZWFyY2ggdGhlIG5lYXJlc3QgX3ZhbHVlIHRvIHRoZSBzdGVwXG5cdFx0aWYgc3RlcCBpc250IDFcblx0XHRcdF92YWx1ZSA9IG5lYXJlc3QoIF92YWx1ZSwgc3RlcCApXG5cdFx0XG5cdFx0IyBjYWxjIHRoZSBwcmVjaXNpb24gYnkgc3RlcFxuXHRcdF9wcmVjaXNpb24gPSBNYXRoLm1heCggMCwgTWF0aC5jZWlsKCBNYXRoLmxvZyggMS9zdGVwICkgLyBNYXRoLmxvZyggMTAgKSApIClcblx0XHRpZiBfcHJlY2lzaW9uID4gMFxuXHRcdFx0X3ZhbHVlID0gcHJlY2lzaW9uKCBfdmFsdWUsIF9wcmVjaXNpb24gKVxuXHRcdGVsc2Vcblx0XHRcdF92YWx1ZSA9IE1hdGgucm91bmQoIF92YWx1ZSApXG5cdFx0XHRcblx0XHRyZXR1cm4gX3ZhbHVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldE51bWJlckJhc2UiLCJTdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgU3RyaW5nT3B0aW9uIGV4dGVuZHMgU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBTdHJpbmdPcHRpb25zIGV4dGVuZHMgU3ViUmVzdWx0c1xuXHRtb2RlbDogU3RyaW5nT3B0aW9uXG5cblxuY2xhc3MgQXJyYXlPcHRpb24gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBcIm5hbWVcIiApIG9yIFwiLVwiXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBBcnJheU9wdGlvbnMgZXh0ZW5kcyByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBBcnJheU9wdGlvblxuXG5jbGFzcyBGYWNldFN1YkFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuLi9zZWxlY3RvclwiIClcblx0b3B0RGVmYXVsdDogXG5cdFx0bmFtZTogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblx0XHRncm91cDogbnVsbFxuXG5cdG11bHRpU2VsZWN0OiB0cnVlXG5cblx0b3B0Q29sbDogU3RyaW5nT3B0aW9uc1xuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0QGNvbGxlY3Rpb24gPSBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIG9wdGlvbnMubW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0OiA9PlxuXHRcdF92YWxzID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBfdmFscz8gYW5kIG5vdCBfLmlzQXJyYXkoIF92YWxzIClcblx0XHRcdF92YWxzID0gWyBfdmFscyBdXG5cblx0XHRmb3IgX3ZhbCBpbiBfdmFsc1xuXHRcdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX3ZhbCApXG5cdFx0XHRpZiBub3QgX21kbD9cblx0XHRcdFx0X21kbCA9IG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IF92YWwsIGN1c3RvbTogdHJ1ZSApXG5cdFx0XHRAc2VsZWN0ZWQoIF9tZGwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuIFxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0cmV0dXJuIG9wdGlvbnMoIEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiApXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCAgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApO1xuXG5cdFx0cmV0dXJuIG5ldyBAb3B0Q29sbCggX29wdHMgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheSIsImNsYXNzIEZhY2V0U3Vic051bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvbnVtYmVyLmphZGVcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHN1cGVyXG5cdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0XHRfZXZudHNbIFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIiBdID0gXCJzZWxlY3RcIlxuXHRcdHJldHVybiBfZXZudHNcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0QCRpbnBPcCA9IEAkZWwuZmluZCggXCJzZWxlY3QjI3tAY2lkfW9wXCIgKVxuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCB7IHdpZHRoOiBcImF1dG9cIiB9IClcblx0XHRcdEAkaW5wT3Aub24oIFwic2VsZWN0MjpjbG9zZVwiLCBAX29wU2VsZWN0ZWQgKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRcdEAkaW5wT3AucmVtb3ZlKClcblx0XHRcdEAkaW5wT3AgPSBudWxsXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRfb3BTZWxlY3RlZDogPT5cblx0XHRAc2VsZWN0ZWRPUCA9IHRydWVcblx0XHRAZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdGlmIEAkaW5wT3A/IGFuZCBub3QgQHNlbGVjdGVkT1Bcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgeyBvcGVyYXRvcnM6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKSwgb3BlcmF0b3I6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JcIiApfSApXG5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRfcmV0ID0gXG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdFx0XHRvcGVyYXRvcjogQCRpbnBPcC52YWwoKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPSBcblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyIiwiY2xhc3MgRmFjZXRTdWJzUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3JhbmdlLmphZGVcIiApXG5cblx0X2dldElucFNlbGVjdG9yOiAoIGV4dCA9IFwiX2Zyb21cIiApPT5cblx0XHRyZXR1cm4gXCJpbnB1dCMje0BjaWR9I3tleHR9XCJcblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdHJldHVybiBcIjxsaT5cIiArX3Jlcy52YWx1ZS5qb2luKCBcIiAtIFwiICkgKyBcIjwvbGk+XCIgXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRpbnBUbyA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdEAkKCBcIi5yYW5nZWlucFwiICkucmVtb3ZlKClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0X3JldCA9IFxuXHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdkZyb20gPSBzdXBlclxuXHRcdF92ID0gQCRpbnBUby52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdF92VG8gPSBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRcdHJldHVybiBbIF92RnJvbSwgX3ZUbyBdXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1JhbmdlIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc2VsZWN0LmphZGVcIiApXG5cblx0Zm9yY2VkTW9kdWxlT3B0czp7fVxuXHQjXHRtdWx0aXBsZTogdHJ1ZVxuXG5cdGRlZmF1bHRNb2R1bGVPcHRzOlxuXHRcdCNtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxXG5cdFx0d2lkdGg6IFwiYXV0b1wiXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cblx0ZXZlbnRzOiA9PiBcblx0XHRfZXZudHMgPSB7fVxuXHRcdF9ldm50c1sgXCJjbGljayAuc2VsZWN0LWNoZWNrXCIgXSA9IFwic2VsZWN0XCIgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcInNlbGVjdCMje0BjaWR9XCJcblxuXHRmb2N1czogKCk9PlxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3RcIiwgQHNlbGVjdFxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdEBzZWxlY3QyLm9wZW4oKVxuXHRcdCNlbHNlXG5cdFx0XHQjQCRpbnAuc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdF9zZWwyb3BlbjogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRyZW1vdmU6ID0+XG5cdFx0I0AkaW5wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0X2RhdGEgPSBfLmV4dGVuZCgge30sIHN1cGVyLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSwgb3B0aW9uczogQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApICkgfSApXG5cdFx0aWYgX2RhdGEudmFsdWU/IGFuZCBub3QgXy5pc0FycmF5KCBfZGF0YS52YWx1ZSApXG5cdFx0XHRfZGF0YS52YWx1ZSA9IFsgX2RhdGEudmFsdWUgXVxuXG5cdFx0aWYgX2RhdGEudmFsdWU/XG5cdFx0XHRmb3IgX3YgaW4gX2RhdGEudmFsdWUgd2hlbiBfdiBub3QgaW4gXy5wbHVjayggX2RhdGEub3B0aW9ucywgXCJ2YWx1ZVwiIClcblx0XHRcdFx0X2RhdGEub3B0aW9ucy5wdXNoIHsgdmFsdWU6IF92LCBsYWJlbDogX3YsIGdyb3VwOiBudWxsIH1cblx0XHRcdFx0XG5cdFx0cmV0dXJuIF9kYXRhXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0LCBncm91cDogbnVsbCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3QoICApXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0ICk7XG5cblx0XHRyZXR1cm4gX29wdHNcblxuXHR1bnNlbGVjdDogKCBldm50ICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdEBzZWxlY3QyPy5kZXN0cm95KClcblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRAJCggXCIuc2VsZWN0LWNoZWNrXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0aWYgbm90IF92YWw/XG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IF92YWwgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1NlbGVjdCIsImNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3N0cmluZy5qYWRlXCIgKVxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRzdXBlclxuXHRcdHJldHVyblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZyIsIlN1YlZpZXcgPSByZXF1aXJlKCBcIi4vc3ViXCIgKVxuU2VsZWN0b3JWaWV3ID0gcmVxdWlyZSggXCIuL3NlbGVjdG9yXCIgKVxuXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIE1haW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy93cmFwcGVyLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJpZ2d5IGNsZWFyZml4XCJcblxuXHRldmVudHM6IFxuXHRcdFwiY2xpY2sgLmFkZC1mYWNldC1idG5cIjogXCJfYWRkRmFjZXRcIlxuXHRcdFwiY2xpY2tcIjogXCJfYWRkRmFjZXRcIlxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXG5cdFx0QGNvbGxlY3Rpb24ub24gXCJpZ2d5OnJlbVwiLCBAcmVtRmFjZXRcblxuXHRcdEBlbC5jbGFzc05hbWUgKz0gQGNsYXNzTmFtZVxuXHRcdEByZW5kZXIoKVxuXHRcdCQoIGRvY3VtZW50ICkub24gXCJrZXl1cFwiLCBAX29uS2V5XG5cblx0XHRmb3IgZmN0IGluIEBjb2xsZWN0aW9uLmZpbHRlciggKCBmY3QgKS0+cmV0dXJuIGZjdD8uZ2V0KCBcInZhbHVlXCIgKT8gKVxuXHRcdFx0c3VidmlldyA9IEBnZW5TdWIoIGZjdCApXG5cdFx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW5kZXI6ID0+XG5cdFx0QCRlbC5odG1sKCBAdGVtcGxhdGUoKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRyZXR1cm5cblxuXHRfYWRkRmFjZXQ6ICggZXZudCApPT5cblx0XHRAYWRkRmFjZXQoKVxuXHRcdHJldHVyblxuXG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdEBleGl0KClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0ZXhpdDogPT5cblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0aWYgQHN1YnZpZXdcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdHJldHVyblxuXG5cdHJlbUZhY2V0OiAoIGZhY2V0TSApPT5cblx0XHRAcmVzdWx0cy5yZW1vdmUoIGZhY2V0TS5nZXQoIFwibmFtZVwiICkgKVxuXHRcdHJldHVyblxuXG5cdHNldEZhY2V0OiAoIGZhY2V0TSwgZGF0YSApPT5cblx0XHRAY29sbGVjdGlvbi5yZW1vdmUoIGZhY2V0TSApXG5cblx0XHRAcmVzdWx0cy5hZGQoIF8uZXh0ZW5kKCBkYXRhLCB7IG5hbWU6IGZhY2V0TS5nZXQoIFwibmFtZVwiICksIHR5cGU6IGZhY2V0TS5nZXQoIFwidHlwZVwiICkgfSApLCB7IG1lcmdlOiB0cnVlLCBwYXJzZTogdHJ1ZSwgX2ZhY2V0OiBmYWNldE0gfSApXG5cdFx0cmV0dXJuXG5cblx0Z2VuU3ViOiAoIGZhY2V0TSApPT5cblx0XHRzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdHN1YnZpZXcub2ZmKClcblx0XHRcdHN1YnZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRyZXR1cm4gXG5cblx0XHRzdWJ2aWV3Lm9uKCBcInNlbGVjdGVkXCIsIEBzZXRGYWNldCApXG5cdFx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBzdWJ2aWV3LnJlbmRlcigpIClcblx0XHRyZXR1cm4gc3Vidmlld1xuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNFTEVDVCBFWElTVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBzdWJ2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNVQiBFWElTVFwiXG5cdFx0XHRAc3Vidmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSApXG5cblx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdEBzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNICk9PlxuXHRcdFx0ZmFjZXRNLnNldCggXCJ2YWx1ZVwiLCBudWxsIClcblx0XHRcdEBzdWJ2aWV3ID0gQGdlblN1YiggZmFjZXRNIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblZpZXciLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFNlbGVjdG9yVmlldyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldHMvYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3IuamFkZVwiIClcblx0dGVtcGxhdGVFbDogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3RvcmxpLmphZGVcIiApXG5cdG11bHRpU2VsZWN0OiBmYWxzZVxuXG5cdGNsYXNzTmFtZTogPT5cblx0XHRjbHMgPSBbIFwiYWRkLWZhY2V0XCIgXVxuXHRcdGlmIEBjdXN0b21cblx0XHRcdGNscy5wdXNoIFwiY3VzdG9tXCJcblx0XHRyZXR1cm4gY2xzLmpvaW4oIFwiIFwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJtb3VzZWRvd24gYVwiOiBcIl9vbkNsaWNrXCJcblx0XHRcImZvY3VzIGlucHV0IyN7QGNpZH1cIjogXCJvcGVuXCJcblx0XHRcImJsdXIgaW5wdXQjI3tAY2lkfVwiOiBcImNsb3NlXCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBjdXN0b20gPSAgb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzZWFyY2hjb2xsID0gQGNvbGxlY3Rpb24uc3ViKCAtPnRydWUgKVxuXHRcdEByZXN1bHQgPSBuZXcgQGNvbGxlY3Rpb24uY29uc3RydWN0b3IoKVxuXHRcdFxuXHRcdCNAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXG5cdFx0XHRpZiBAY3VyclF1ZXJ5Py5sZW5ndGggPiAxXG5cdFx0XHRcdF9sYmwgPSBfbGJsLnJlcGxhY2UoIG5ldyBSZWdFeHAoIEBjdXJyUXVlcnksIFwiZ2lcIiApLCAoKCBzdHIgKS0+cmV0dXJuIFwiPGI+I3tzdHJ9PC9iPlwiICkgKVxuXHRcdFx0X2xpc3QucHVzaCBsYWJlbDogX2xibCwgaWQ6IF9pZFxuXHRcdEAkbGlzdC5hcHBlbmQoIEB0ZW1wbGF0ZUVsKCBsaXN0OiBfbGlzdCwgcXVlcnk6IEBjdXJyUXVlcnksIGFjdGl2ZUlkeDogQGFjdGl2ZUlkeCwgY3VzdG9tOiBAY3VzdG9tICkgKVxuXG5cdFx0QF9jaGVja1Njcm9sbCgpXG5cdFx0XG5cdFx0cmV0dXJuIEAkbGlzdFxuXG5cdF9zY3JvbGxUaWxsOiAxOThcblx0X2NoZWNrU2Nyb2xsOiA9PlxuXHRcdF9oZWlnaHQgPSBAJGxpc3QuaGVpZ2h0KClcblx0XHRpZiBfaGVpZ2h0ID4gMFxuXHRcdFx0QHNjcm9sbEhlbHBlciggX2hlaWdodCApXG5cdFx0XHRyZXR1cm5cblxuXHRcdCMgZXhpdCB0aGUgdGhlIGNhbGwgc3RhY2sgdG8gY2hlY2sgaGVpZ2h0IGFmdGVyIHRoZSBtb2R1bGUgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGRvbVxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBAJGxpc3QuaGVpZ2h0KCkgKVxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cblx0c2Nyb2xsSGVscGVyOiAoIGhlaWdodCApPT5cblx0XHRpZiBoZWlnaHQgPj0gQF9zY3JvbGxUaWxsXG5cdFx0XHRAc2Nyb2xsaW5nID0gdHJ1ZVxuXHRcdGVsc2Vcblx0XHRcdEBzY3JvbGxpbmcgPSBmYWxzZVxuXHRcdHJldHVyblxuXG5cdGNoZWNrT3B0aW9uc0VtcHR5OiA9PlxuXHRcdCNpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gMFxuXHRcdCNcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0X29uQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRfaWQgPSBAJCggZXZudC5jdXJyZW50VGFyZ2V0ICkuZGF0YSggXCJpZFwiIClcblx0XHRAc2VsZWN0ZWQoIEBjb2xsZWN0aW9uLmdldCggX2lkICkgKVxuXHRcdGlmIG5vdCBAbXVsdGlTZWxlY3Rcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0ZWQ6ICggbWRsICk9PlxuXHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggbWRsIClcblx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRAdHJpZ2dlciBcInNlbGVjdGVkXCIsIG1kbFxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3RBY3RpdmUoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cblx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKT0+XG5cdFx0XHRpZiBAcmVzdWx0LmdldCggbWRsLmlkICk/XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgbm90IF9xPy5sZW5ndGhcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdF9tYXRjaCA9IG1kbC5tYXRjaCggX3EgKVxuXHRcdFx0cmV0dXJuIF9tYXRjaFxuXHRcdCwgZmFsc2UgKVxuXG5cblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblxuXHRcdF90b3AgPSAwXG5cdFx0aWYgdXAgXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxIFxuXHRcdGVsc2UgXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggLSAxIDw9IEBhY3RpdmVJZHhcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDFcblxuXG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0XyRlbG5ldyA9IEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0aWYgQHNjcm9sbGluZ1xuXHRcdFx0X2VsSCA9IF8kZWxuZXcub3V0ZXJIZWlnaHQoKVxuXHRcdFx0X3BvcyA9IF9lbEggKiAoIF9uZXdpZHggKyAxIClcblx0XHRcdF8kbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3RcIiApXG5cdFx0XHRfc2Nyb2xsVCA9IF8kbGlzdC5zY3JvbGxUb3AoKVxuXHRcdFx0aWYgX3BvcyA+IF9zY3JvbGxUICsgQF9zY3JvbGxUaWxsXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBAX3Njcm9sbFRpbGwgKVxuXHRcdFx0ZWxzZSBpZiBfcG9zIDwgX3Njcm9sbFQgKyBfZWxIXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBfZWxIIClcblxuXHRcdEBhY3RpdmVJZHggPSBfbmV3aWR4XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0Oj0+XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0QWN0aXZlOiA9PlxuXHRcdF9zZWwgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGEuYWN0aXZlXCIgKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApLmRhdGEoKVxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0aWYgX3NlbD8uaWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBAY29sbGVjdGlvbi5nZXQoIF9zZWwuaWQgKSApXG5cdFx0ZWxzZSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlICkgKVxuXHRcdFx0QCRpbnAudmFsKCBcIlwiIClcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAbXVsdGlTZWxlY3Rcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3IiwiY2xhc3MgVmlld1N1YiBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc3ViLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJzdWJcIlxuXG5cdGluaXRpYWxpemU6ID0+XG5cdFx0QHJlc3VsdCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKClcblx0XHRyZXR1cm5cblxuXHRldmVudHM6IFxuXHRcdFwiY2xpY2sgLnJtLWZhY2V0LWJ0blwiOiBcImRlbFwiXG5cblx0cmVuZGVyOiAoIG9wdE1kbCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZSggbGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpLCBzZWxlY3RlZDogX2xpc3QgKVxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdGRlbDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRAY29sbGVjdGlvbi50cmlnZ2VyKCBcImlnZ3k6cmVtXCIsIEBtb2RlbCApXG5cdFx0QGNvbGxlY3Rpb24uYWRkKCBAbW9kZWwgKVxuXHRcdEByZW1vdmUoKVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiIClcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRyZW1vdmU6ID0+XG5cdFx0QHNlbGVjdHZpZXc/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0c2VsZWN0ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQuYWRkKCBvcHRNZGwgKVxuXHRcdEAkcmVzdWx0cy5odG1sKCBAc2VsZWN0dmlldy5yZW5kZXJSZXN1bHQoKSApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQG1vZGVsLCBAc2VsZWN0dmlldy5nZXRSZXN1bHRzKCkgKVxuXHRcdHJldHVyblxuXG5cdGlzT3BlbjogPT5cblx0XHRyZXR1cm4gQHNlbGVjdHZpZXc/XG5cblx0Zm9jdXM6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QG9wZW4oKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGdlbmVyYXRlU3ViOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0cmV0dXJuIEBzZWxlY3R2aWV3XG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBAbW9kZWwuU3ViVmlldyggbW9kZWw6IEBtb2RlbCwgZWw6IEAkc3ViIClcblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCApXG5cdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApP1xuXHRcdFx0QHNlbGVjdHZpZXcuc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRvcGVuOiA9PlxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1N1YiIsbnVsbCwiIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoW10sZSk7ZWxzZXt2YXIgZjtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P2Y9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Zj1nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJihmPXNlbGYpLGYuamFkZT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmVzY2FwZSA9IGZ1bmN0aW9uIGVzY2FwZShodG1sKXtcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiXX0=
