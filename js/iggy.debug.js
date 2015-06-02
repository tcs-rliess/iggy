(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctDateRange, FctEvent, FctNumber, FctRange, FctSelect, FctString, IGGY, MainView, Results,
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

FctEvent = require("./models/facet_event");

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
    this._initErrors = bind(this._initErrors, this);
    this.triggerChange = bind(this.triggerChange, this);
    this.getQuery = bind(this.getQuery, this);
    this._error = bind(this._error, this);
    this.addFacet = bind(this.addFacet, this);
    this._prepareFacets = bind(this._prepareFacets, this);
    this._prepareEl = bind(this._prepareEl, this);
    _.extend(this, Backbone.Events);
    this._initErrors();
    this.$el = this._prepareEl(el);
    this.el = this.$el[0];
    this.$el.data("iggy", this);
    this.facets = this._prepareFacets(facets);
    this.results = new Results(null, options);
    this.results.on("add", this.triggerChange);
    this.results.on("remove", this.triggerChange);
    this.results.on("change", this.triggerChange);
    this.view = new MainView({
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
        return new FctString(facet, {
          main: this
        });
      case "select":
        return new FctSelect(facet, {
          main: this
        });
      case "array":
        return new FctArray(facet, {
          main: this
        });
      case "number":
        return new FctNumber(facet, {
          main: this
        });
      case "range":
        return new FctRange(facet, {
          main: this
        });
      case "daterange":
        return new FctDateRange(facet, {
          main: this
        });
      case "event":
        return new FctEvent(facet, {
          main: this
        });
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



},{"./models/backbone_sub":2,"./models/facet_array":3,"./models/facet_daterange":5,"./models/facet_event":6,"./models/facet_number":7,"./models/facet_range":8,"./models/facet_select":9,"./models/facet_string":10,"./models/results":11,"./views/main":32}],2:[function(require,module,exports){

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
      fnFilter = function(_m) {
        var ref;
        return ref = _m.id, indexOf.call(filter, ref) >= 0;
      };
    } else if (_.isString(filter) || _.isNumber(filter)) {
      fnFilter = function(_m) {
        return _m.id === filter;
      };
    } else {
      fnFilter = function(_m) {
        var _nm, _vl;
        for (_nm in filter) {
          _vl = filter[_nm];
          if (_m.get(_nm) !== _vl) {
            return false;
          }
        }
        return true;
      };
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



},{"../views/facets/subarray":27,"./facet_string":10}],4:[function(require,module,exports){
var FacetBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetBase = (function(superClass) {
  extend(FacetBase, superClass);

  FacetBase.prototype.idAttribute = "name";

  FacetBase.prototype.SubView = require("../views/facets/base");

  function FacetBase(attrs, options) {
    this.match = bind(this.match, this);
    this.getLabel = bind(this.getLabel, this);
    this.main = options.main;
    FacetBase.__super__.constructor.apply(this, arguments);
    return;
  }

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



},{"../views/facets/base":24}],5:[function(require,module,exports){
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



},{"../views/facets/daterange":25,"./facet_base":4}],6:[function(require,module,exports){
var FctEvent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctEvent = (function(superClass) {
  extend(FctEvent, superClass);

  function FctEvent() {
    this.exec = bind(this.exec, this);
    this.defaults = bind(this.defaults, this);
    return FctEvent.__super__.constructor.apply(this, arguments);
  }

  FctEvent.prototype.SubView = null;

  FctEvent.prototype.onlyExec = true;

  FctEvent.prototype.defaults = function() {
    return $.extend(FctEvent.__super__.defaults.apply(this, arguments), {
      options: []
    });
  };

  FctEvent.prototype.exec = function() {
    this.main.trigger(this.get("event"), this.toJSON());
  };

  return FctEvent;

})(require("./facet_base"));

module.exports = FctEvent;



},{"./facet_base":4}],7:[function(require,module,exports){
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



},{"../views/facets/subnumber":28,"./facet_base":4}],8:[function(require,module,exports){
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



},{"../views/facets/subrange":29,"./facet_base":4}],9:[function(require,module,exports){
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



},{"../views/facets/subselect":30,"./facet_base":4}],10:[function(require,module,exports){
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



},{"../views/facets/substring":31,"./facet_base":4}],11:[function(require,module,exports){
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
    this.initialize = bind(this.initialize, this);
    return IggyResults.__super__.constructor.apply(this, arguments);
  }

  IggyResults.prototype.model = IggyResult;

  IggyResults.prototype.initialize = function(mdls, opts) {
    var ref;
    if ((ref = opts.modifyKey) != null ? ref.length : void 0) {
      this.modifyKey = opts.modifyKey;
    }
  };

  IggyResults.prototype.parse = function(attr, options) {
    var _key, _modify, ref;
    _key = options._facet.get("modifyKey") || this.modifyKey || "value";
    _modify = (ref = options._facet) != null ? ref.get("modify") : void 0;
    if ((_modify != null) && _.isFunction(_modify)) {
      attr[_key] = _modify(attr.value, options._facet, attr);
    }
    return attr;
  };

  return IggyResults;

})(Backbone.Collection);

module.exports = IggyResults;



},{}],12:[function(require,module,exports){
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



},{"./backbone_sub":2}],13:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"daterange-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":36}],14:[function(require,module,exports){
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
},{"jade/runtime":36}],15:[function(require,module,exports){
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
},{"jade/runtime":36}],16:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

;return buf.join("");
};
},{"jade/runtime":36}],17:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, multiple, optionGroups, options, undefined, value) {
buf.push("<select" + (jade.attr("id", cid, true, false)) + " multiple=\"multiple\" class=\"select-inp\">");
if ( optionGroups)
{
// iterate optionGroups
;(function(){
  var $$obj = optionGroups;
  if ('number' == typeof $$obj.length) {

    for (var gname = 0, $$l = $$obj.length; gname < $$l; gname++) {
      var opts = $$obj[gname];

buf.push("<optgroup" + (jade.attr("label", gname, true, false)) + "></optgroup>");
// iterate opts
;(function(){
  var $$obj = opts;
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

    }

  } else {
    var $$l = 0;
    for (var gname in $$obj) {
      $$l++;      var opts = $$obj[gname];

buf.push("<optgroup" + (jade.attr("label", gname, true, false)) + "></optgroup>");
// iterate opts
;(function(){
  var $$obj = opts;
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

    }

  }
}).call(this);

}
else
{
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

}
buf.push("</select>");
if ( multiple)
{
buf.push("<span class=\"btn btn-xs btn-success select-check fa fa-check\"></span>");
}}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"multiple" in locals_for_with?locals_for_with.multiple:typeof multiple!=="undefined"?multiple:undefined,"optionGroups" in locals_for_with?locals_for_with.optionGroups:typeof optionGroups!=="undefined"?optionGroups:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":36}],18:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":36}],19:[function(require,module,exports){
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

buf.push("<li" + (jade.cls([el.cssclass], [true])) + "><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:(idx + add) === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li" + (jade.cls([el.cssclass], [true])) + "><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:(idx + add) === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

}
else if ( !custom)
{
buf.push("<li><a class=\"emptyres\">no result for \"" + (jade.escape((jade_interp = query) == null ? '' : jade_interp)) + "\"</a></li>");
}}.call(this,"activeIdx" in locals_for_with?locals_for_with.activeIdx:typeof activeIdx!=="undefined"?activeIdx:undefined,"custom" in locals_for_with?locals_for_with.custom:typeof custom!=="undefined"?custom:undefined,"list" in locals_for_with?locals_for_with.list:typeof list!=="undefined"?list:undefined,"query" in locals_for_with?locals_for_with.query:typeof query!=="undefined"?query:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":36}],20:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", value, true, false)) + " class=\"string-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":36}],21:[function(require,module,exports){
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
},{"jade/runtime":36}],22:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");;return buf.join("");
};
},{"jade/runtime":36}],23:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13,
  "TAB": 9
};



},{}],24:[function(require,module,exports){
var FacetSubsBase, KEYCODES, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KEYCODES = require("../../utils/keycodes");

SubResults = require("../../models/subresults");

FacetSubsBase = (function(superClass) {
  extend(FacetSubsBase, superClass);

  function FacetSubsBase() {
    this.set = bind(this.set, this);
    this.select = bind(this.select, this);
    this._checkSelectEmpty = bind(this._checkSelectEmpty, this);
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.close = bind(this.close, this);
    this._onTabAction = bind(this._onTabAction, this);
    this.render = bind(this.render, this);
    this._getInpSelector = bind(this._getInpSelector, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this._onKey = bind(this._onKey, this);
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

  FacetSubsBase.prototype._onKey = function(evnt) {
    var ref;
    if (evnt.keyCode === KEYCODES.TAB || (ref = evnt.keyCode, indexOf.call(KEYCODES.TAB, ref) >= 0)) {
      this._onTabAction(evnt);
      return;
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
    var _tmpl;
    _tmpl = this.template(this.getTemplateData());
    this.$el.html(_tmpl);
    this.$inp = this.$el.find(this._getInpSelector());
    if (this._hasTabListener(true)) {
      $(document).on(this._hasTabEvent(), this._onKey);
    }
  };

  FacetSubsBase.prototype._hasTabEvent = function() {
    return "keydown";
  };

  FacetSubsBase.prototype._hasTabListener = function() {
    return true;
  };

  FacetSubsBase.prototype._onTabAction = function(evnt) {
    evnt.preventDefault();
    evnt.stopPropagation();
    this.select();
  };

  FacetSubsBase.prototype.close = function(evnt) {
    if (this._hasTabListener(false)) {
      $(document).off(this._hasTabEvent(), this._onKey);
    }
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



},{"../../models/subresults":12,"../../tmpls/result_base.jade":16,"../../utils/keycodes":23}],25:[function(require,module,exports){
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

  FacetSubsDateRange.prototype._hasTabListener = function() {
    return false;
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



},{"../../tmpls/daterange.jade":13,"../../utils/keycodes":23,"./base":24}],26:[function(require,module,exports){
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



},{"../../utils/keycodes":23,"./base":24}],27:[function(require,module,exports){
var ArrayOption, ArrayOptions, FacetSubArray, KEYCODES, StringOption, StringOptions, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubResults = require("../../models/subresults");

KEYCODES = require("../../utils/keycodes");

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
    label: "-",
    value: "-"
  };

  FacetSubArray.prototype.multiSelect = true;

  FacetSubArray.prototype.optColl = StringOptions;

  function FacetSubArray(options) {
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this._onTabAction = bind(this._onTabAction, this);
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

  FacetSubArray.prototype._onTabAction = function(evnt) {
    evnt.preventDefault();
    evnt.stopPropagation();
    this.close();
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
          label: opt
        });
      } else if (_.isObject(opt)) {
        _opts.push(_.extend({}, this.optDefault, opt));
      }
    }
    return new this.optColl(_opts);
  };

  return FacetSubArray;

})(require("../selector"));

module.exports = FacetSubArray;



},{"../../models/backbone_sub":2,"../../models/subresults":12,"../../utils/keycodes":23,"../selector":33}],28:[function(require,module,exports){
var FacetSubsNumber,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubsNumber = (function(superClass) {
  extend(FacetSubsNumber, superClass);

  function FacetSubsNumber() {
    this.getResults = bind(this.getResults, this);
    this._onTabAction = bind(this._onTabAction, this);
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

  FacetSubsNumber.prototype._onTabAction = function(evnt) {
    var _val;
    _val = this.getValue();
    evnt.preventDefault();
    evnt.stopPropagation();
    if (!isNaN(_val)) {
      this.select();
    }
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



},{"../../tmpls/number.jade":14,"./number_base":26}],29:[function(require,module,exports){
var FacetSubsRange,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubsRange = (function(superClass) {
  extend(FacetSubsRange, superClass);

  function FacetSubsRange() {
    this._onTabAction = bind(this._onTabAction, this);
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

  FacetSubsRange.prototype._onTabAction = function(evnt) {
    var _val;
    _val = this.getValue();
    if ((_val != null ? _val.length : void 0) >= 2) {
      evnt.preventDefault();
      evnt.stopPropagation();
      this.select();
    }
  };

  return FacetSubsRange;

})(require("./number_base"));

module.exports = FacetSubsRange;



},{"../../tmpls/range.jade":15,"./number_base":26}],30:[function(require,module,exports){
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
    this._hasTabListener = bind(this._hasTabListener, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.remove = bind(this.remove, this);
    this._initSelect2 = bind(this._initSelect2, this);
    this.focus = bind(this.focus, this);
    this.render = bind(this.render, this);
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

  FacetSubsSelect.prototype.render = function() {
    FacetSubsSelect.__super__.render.apply(this, arguments);
    this._initSelect2();
  };

  FacetSubsSelect.prototype.focus = function() {
    this._initSelect2();
    this.select2.open();
    return FacetSubsSelect.__super__.focus.apply(this, arguments);
  };

  FacetSubsSelect.prototype._initSelect2 = function() {
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
      if (this.model.get("multiple")) {
        $(document).on(this._hasTabEvent(), this._onKey);
      }
    }
  };

  FacetSubsSelect.prototype._sel2open = function(evnt) {
    evnt.stopPropagation();
    return false;
  };

  FacetSubsSelect.prototype.remove = function() {
    return FacetSubsSelect.__super__.remove.apply(this, arguments);
  };

  FacetSubsSelect.prototype.getTemplateData = function() {
    var _data, _groups, _v, i, len, ref;
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
    _groups = _.groupBy(_data.options, "group");
    if (_.compact(_.keys(_groups || {})).length > 1) {
      _data.optionGroups = _groups;
    }
    return _data;
  };

  FacetSubsSelect.prototype._hasTabListener = function(create) {
    if (create) {
      return false;
    }
    return this.model.get("multiple");
  };

  FacetSubsSelect.prototype._hasTabEvent = function() {
    return "keyup";
  };

  FacetSubsSelect.prototype.getValue = function() {
    var _data, _vals, data, i, len, ref, ref1;
    _vals = [];
    ref1 = ((ref = this.select2) != null ? ref.data() : void 0) || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      data = ref1[i];
      _data = {};
      _data.value = data.id;
      if (data.text != null) {
        _data.label = data.text;
      }
      _vals.push(_data);
    }
    return _vals;
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
      } else if (_.isObject(opt)) {
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
    var ModelConst, _val, _vals, i, len;
    _vals = this.getValue();
    if (!(_vals != null ? _vals.length : void 0)) {
      this.close();
      return;
    }
    ModelConst = this.getSelectModel();
    for (i = 0, len = _vals.length; i < len; i++) {
      _val = _vals[i];
      this.result.add(new ModelConst(_val));
    }
    this.trigger("selected", this.result);
    this.close();
  };

  return FacetSubsSelect;

})(require("./base"));

module.exports = FacetSubsSelect;



},{"../../tmpls/select.jade":17,"../../utils/keycodes":23,"./base":24}],31:[function(require,module,exports){
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
    FacetSubString.__super__.close.apply(this, arguments);
    try {
      if ((ref = this.$inp) != null) {
        ref.remove();
      }
    } catch (_error) {}
  };

  return FacetSubString;

})(require("./base"));

module.exports = FacetSubString;



},{"../../tmpls/string.jade":20,"./base":24}],32:[function(require,module,exports){
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
      subview = this.genSub(fct, false);
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
    if (evnt.keyCode === KEYCODES.ESC || (ref = evnt.keyCode, indexOf.call(KEYCODES.ESC, ref) >= 0)) {
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
      this.addFacet();
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

  MainView.prototype.genSub = function(facetM, addAfter) {
    var subview;
    if (addAfter == null) {
      addAfter = true;
    }
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
        if (addAfter) {
          _this.addFacet();
        }
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



},{"../tmpls/wrapper.jade":22,"../utils/keycodes":23,"./selector":33,"./sub":34}],33:[function(require,module,exports){
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
    var _cssclass, _id, _lbl, _list, i, idx, len, model, ref, ref1;
    this.$list.empty();
    _list = [];
    ref = this.searchcoll.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _lbl = model.getLabel();
      _id = model.id;
      _cssclass = model.get("cssclass");
      console.log("model", _cssclass);
      if (((ref1 = this.currQuery) != null ? ref1.length : void 0) > 1) {
        _lbl = _lbl.replace(new RegExp(this.currQuery, "gi"), (function(str) {
          return "<b>" + str + "</b>";
        }));
      }
      _list.push({
        label: _lbl,
        id: _id,
        cssclass: _cssclass
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
    if (mdl.onlyExec != null) {
      if (mdl != null) {
        if (typeof mdl.exec === "function") {
          mdl.exec();
        }
      }
      return;
    }
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



},{"../tmpls/selector.jade":18,"../tmpls/selectorli.jade":19,"../utils/keycodes":23,"./facets/base":24}],34:[function(require,module,exports){
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
    var ref;
    this.generateSub();
    if ((ref = this.selectview) != null) {
      ref.focus();
    }
  };

  return ViewSub;

})(Backbone.View);

module.exports = ViewSub;



},{"../tmpls/sub.jade":21}],35:[function(require,module,exports){

},{}],36:[function(require,module,exports){
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

},{"fs":35}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3JhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvcmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvc3VicmVzdWx0cy5jb2ZmZWUiLCJfc3JjL2pzL3RtcGxzL2RhdGVyYW5nZS5qYWRlIiwiX3NyYy9qcy90bXBscy9udW1iZXIuamFkZSIsIl9zcmMvanMvdG1wbHMvcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvcmVzdWx0X2Jhc2UuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0LmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdG9yLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdG9ybGkuamFkZSIsIl9zcmMvanMvdG1wbHMvc3RyaW5nLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N1Yi5qYWRlIiwiX3NyYy9qcy90bXBscy93cmFwcGVyLmphZGUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvZGF0ZXJhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3ViYXJyYXkuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1Ym51bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1YnNlbGVjdC5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc3ViLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvamFkZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSw0R0FBQTtFQUFBOzs2QkFBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLGNBQVQsQ0FBWCxDQUFBOztBQUFBLE1BQ0EsR0FBUyxPQUFBLENBQVMsdUJBQVQsQ0FEVCxDQUFBOztBQUFBLFNBRUEsR0FBWSxPQUFBLENBQVMsdUJBQVQsQ0FGWixDQUFBOztBQUFBLFFBR0EsR0FBVyxPQUFBLENBQVMsc0JBQVQsQ0FIWCxDQUFBOztBQUFBLFNBSUEsR0FBWSxPQUFBLENBQVMsdUJBQVQsQ0FKWixDQUFBOztBQUFBLFNBS0EsR0FBWSxPQUFBLENBQVMsdUJBQVQsQ0FMWixDQUFBOztBQUFBLFFBTUEsR0FBVyxPQUFBLENBQVMsc0JBQVQsQ0FOWCxDQUFBOztBQUFBLFlBT0EsR0FBZSxPQUFBLENBQVMsMEJBQVQsQ0FQZixDQUFBOztBQUFBLFFBUUEsR0FBVyxPQUFBLENBQVMsc0JBQVQsQ0FSWCxDQUFBOztBQUFBLE9BU0EsR0FBVSxPQUFBLENBQVMsa0JBQVQsQ0FUVixDQUFBOztBQUFBO0FBWUMsMEJBQUEsQ0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdFNlbGVjdCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc2VsZWN0XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3RSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfcmFuZ2VcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcbkZjdEV2ZW50ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9ldmVudFwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKCBudWxsLCBvcHRpb25zIClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0QHZpZXcgPSBuZXcgTWFpblZpZXcoIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cyApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQgaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X3JldC5wdXNoIF9mY3RcblxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0IClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKS0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJzZWxlY3RcIiB0aGVuIHJldHVybiBuZXcgRmN0U2VsZWN0KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwicmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0UmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJkYXRlcmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0RGF0ZVJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZXZlbnRcIiB0aGVuIHJldHVybiBuZXcgRmN0RXZlbnQoIGZhY2V0LCBtYWluOiBAIClcblxuXHRhZGRGYWNldDogKCBmYWNldCApPT5cblx0XHRpZiBub3QgQGZhY2V0cz9cblx0XHRcdHJldHVyblxuXHRcdGlmICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdEBmYWNldHMuYWRkKCBfZmN0IClcblx0XHRyZXR1cm4gQFxuXG5cdF9lcnJvcjogKCB0eXBlLCBkYXRhID0ge30gKT0+XG5cdFx0aWYgQGVycm9yc1sgdHlwZSBdP1xuXHRcdFx0X21zZyA9IEBlcnJvcnNbIHR5cGUgXSggZGF0YSApXG5cdFx0ZWxzZVxuXHRcdFx0X21zZyA9IFwiLVwiXG5cdFx0X2VyciA9IG5ldyBFcnJvcigpXG5cdFx0X2Vyci5uYW1lID0gdHlwZVxuXHRcdF9lcnIubWVzc2FnZSA9IF9tc2dcblx0XHRyZXR1cm4gX2VyclxuXG5cdGdldFF1ZXJ5OiA9PlxuXHRcdHJldHVybiBAcmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0QHRyaWdnZXIoIFwiY2hhbmdlXCIsIEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfaW5pdEVycm9yczogPT5cblx0XHRAZXJyb3JzID0ge31cblx0XHRmb3IgX2ssIF90bXBsIG9mIEBFUlJPUlMoKVxuXHRcdFx0QGVycm9yc1sgX2sgXSA9IF8udGVtcGxhdGUoIF90bXBsIClcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6IC0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1lcbiIsIiMjI1xuRVhBTVBMRSBVU0FHRVxuXG5cdHBhcmVudENvbGwgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbi5TdWIoKVxuXHRcblx0IyBieSBBcnJheVxuXHRzdWJDb2xsQSA9IHBhcmVudENvbGwuc3ViKCBbIDEsIDIsIDMgXSApXG5cdFxuXHQjIG9yIGJ5IE9iamVjdFxuXHRzdWJDb2xsTyA9IHBhcmVudENvbGwuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscyApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICktPlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWJcbiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBhdHRycywgb3B0aW9ucyApLT5cblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRkZWZhdWx0czogLT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcIm5hbWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cblx0Y29tcGFyYXRvcjogKCBtZGwgKS0+XG5cdFx0cmV0dXJuIG1kbC5pZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0QmFzZVxuIiwiY2xhc3MgRmN0RGF0ZVJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2RhdGVyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0czoge31cblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0RGF0ZVJhbmdlXG4iLCJjbGFzcyBGY3RFdmVudCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiBudWxsXG5cdG9ubHlFeGVjOiB0cnVlXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XG5cdGV4ZWM6ICggKT0+XG5cdFx0QG1haW4udHJpZ2dlciggQGdldCggXCJldmVudFwiICksIEB0b0pTT04oKSApXG5cdFx0cmV0dXJuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEV2ZW50XG4iLCJjbGFzcyBGY3ROdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VibnVtYmVyXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3ROdW1iZXJcbiIsImNsYXNzIEZjdFJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RSYW5nZVxuIiwiY2xhc3MgRmN0U2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnNlbGVjdFwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTZWxlY3RcbiIsImNsYXNzIEZjdFN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmdcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nXG4iLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBudWxsXG5cdFx0dmFsdWU6IG51bGxcblxuY2xhc3MgSWdneVJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdGluaXRpYWxpemU6ICggbWRscywgb3B0cyApPT5cblx0XHRpZiBvcHRzLm1vZGlmeUtleT8ubGVuZ3RoXG5cdFx0XHRAbW9kaWZ5S2V5ID0gb3B0cy5tb2RpZnlLZXlcblx0XHRyZXR1cm5cblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfa2V5ID0gb3B0aW9ucy5fZmFjZXQuZ2V0KCBcIm1vZGlmeUtleVwiICkgb3IgQG1vZGlmeUtleSBvciBcInZhbHVlXCJcblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyWyBfa2V5IF0gPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBvcHRpb25zLl9mYWNldCwgYXR0ciApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0c1xuIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiLVwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzIiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJkYXRlcmFuZ2UtaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgb3BlcmF0b3IsIG9wZXJhdG9ycywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuaWYgKCBvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwib3BlcmF0b3JcXFwiPjxzZWxlY3RcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIm9wXCIsIHRydWUsIGZhbHNlKSkgKyBcIj5cIik7XG4vLyBpdGVyYXRlIG9wZXJhdG9yc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcGVyYXRvcnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggb3BlcmF0b3IgPT0gb3AgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggb3BlcmF0b3IgPT0gb3AgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3NlbGVjdD48L2Rpdj5cIik7XG59XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm9wZXJhdG9yXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcjp0eXBlb2Ygb3BlcmF0b3IhPT1cInVuZGVmaW5lZFwiP29wZXJhdG9yOnVuZGVmaW5lZCxcIm9wZXJhdG9yc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3JzOnR5cGVvZiBvcGVyYXRvcnMhPT1cInVuZGVmaW5lZFwiP29wZXJhdG9yczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJyYW5nZWlucFxcXCI+XCIpO1xudmFyIF92YWxzID0gdmFsdWUgPyB2YWx1ZSA6IFtdXG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwiX2Zyb21cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1swXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLWZyb21cXFwiLz48c3BhbiBjbGFzcz1cXFwic2VwYXJhdG9yXFxcIj4tPC9zcGFuPjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwiX3RvXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS10b1xcXCIvPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuO3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBtdWx0aXBsZSwgb3B0aW9uR3JvdXBzLCBvcHRpb25zLCB1bmRlZmluZWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxzZWxlY3RcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBtdWx0aXBsZT1cXFwibXVsdGlwbGVcXFwiIGNsYXNzPVxcXCJzZWxlY3QtaW5wXFxcIj5cIik7XG5pZiAoIG9wdGlvbkdyb3Vwcylcbntcbi8vIGl0ZXJhdGUgb3B0aW9uR3JvdXBzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbkdyb3VwcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGduYW1lID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBnbmFtZSA8ICQkbDsgZ25hbWUrKykge1xuICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGduYW1lIGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3B0cyA9ICQkb2JqW2duYW1lXTtcblxuYnVmLnB1c2goXCI8b3B0Z3JvdXBcIiArIChqYWRlLmF0dHIoXCJsYWJlbFwiLCBnbmFtZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPjwvb3B0Z3JvdXA+XCIpO1xuLy8gaXRlcmF0ZSBvcHRzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmVsc2Vcbntcbi8vIGl0ZXJhdGUgb3B0aW9uc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3NlbGVjdD5cIik7XG5pZiAoIG11bHRpcGxlKVxue1xuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwiYnRuIGJ0bi14cyBidG4tc3VjY2VzcyBzZWxlY3QtY2hlY2sgZmEgZmEtY2hlY2tcXFwiPjwvc3Bhbj5cIik7XG59fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwibXVsdGlwbGVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm11bHRpcGxlOnR5cGVvZiBtdWx0aXBsZSE9PVwidW5kZWZpbmVkXCI/bXVsdGlwbGU6dW5kZWZpbmVkLFwib3B0aW9uR3JvdXBzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25Hcm91cHM6dHlwZW9mIG9wdGlvbkdyb3VwcyE9PVwidW5kZWZpbmVkXCI/b3B0aW9uR3JvdXBzOnVuZGVmaW5lZCxcIm9wdGlvbnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbnM6dHlwZW9mIG9wdGlvbnMhPT1cInVuZGVmaW5lZFwiP29wdGlvbnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwic2VsZWN0b3ItaW5wXFxcIi8+PHVsXCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJ0eXBlbGlzdFwiLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInR5cGVsaXN0XFxcIj48L3VsPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChhY3RpdmVJZHgsIGN1c3RvbSwgbGlzdCwgcXVlcnksIHVuZGVmaW5lZCkge1xudmFyIGFkZCA9IDA7XG5pZiAoIGN1c3RvbSAmJiBxdWVyeSlcbntcbmFkZCA9IDE7XG5idWYucHVzaChcIjxsaT48YSBkYXRhLWlkPVxcXCJfY3VzdG9tXFxcIiBkYXRhLWlkeD1cXFwiLTFcXFwiXCIgKyAoamFkZS5jbHMoW3thY3RpdmU6MCA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+PGk+XFxcIlwiICsgKCgoamFkZV9pbnRlcnAgPSBxdWVyeSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXFxcIjwvaT48L2E+PC9saT5cIik7XG59XG5pZiAoIGxpc3QubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBsaXN0XG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IGxpc3Q7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZSBpZiAoICFjdXN0b20pXG57XG5idWYucHVzaChcIjxsaT48YSBjbGFzcz1cXFwiZW1wdHlyZXNcXFwiPm5vIHJlc3VsdCBmb3IgXFxcIlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9hPjwvbGk+XCIpO1xufX0uY2FsbCh0aGlzLFwiYWN0aXZlSWR4XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5hY3RpdmVJZHg6dHlwZW9mIGFjdGl2ZUlkeCE9PVwidW5kZWZpbmVkXCI/YWN0aXZlSWR4OnVuZGVmaW5lZCxcImN1c3RvbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY3VzdG9tOnR5cGVvZiBjdXN0b20hPT1cInVuZGVmaW5lZFwiP2N1c3RvbTp1bmRlZmluZWQsXCJsaXN0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5saXN0OnR5cGVvZiBsaXN0IT09XCJ1bmRlZmluZWRcIj9saXN0OnVuZGVmaW5lZCxcInF1ZXJ5XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5xdWVyeTp0eXBlb2YgcXVlcnkhPT1cInVuZGVmaW5lZFwiP3F1ZXJ5OnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzdHJpbmctaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBzZWxlY3RlZCwgdW5kZWZpbmVkKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJzdWJsYWJlbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3RcXFwiPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInNlbGVjdGVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWxlY3RlZDp0eXBlb2Ygc2VsZWN0ZWQhPT1cInVuZGVmaW5lZFwiP3NlbGVjdGVkOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGZhIGZhLXBsdXNcXFwiPjwvZGl2PlwiKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9XG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTNcblx0XCJUQUJcIjogOVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHJlc3VsdFRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGVcIiApXG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuVEFCIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5UQUJcblx0XHRcdEBfb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRjaWQ6IEBjaWRcblx0XHR2YWx1ZTogQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH1cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRfdG1wbCA9IEB0ZW1wbGF0ZSggQGdldFRlbXBsYXRlRGF0YSgpIClcblx0XHRAJGVsLmh0bWwoIF90bXBsIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvcigpIClcblx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCB0cnVlIClcblx0XHRyZXR1cm5cblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXlkb3duXCJcblx0XHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHQkKCBkb2N1bWVudCApLm9mZiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggZmFsc2UgKVxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwib3BlblwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAaXNPcGVuID0gZmFsc2Vcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQGdldFZhbHVlKClcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogLT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRfY2hlY2tTZWxlY3RFbXB0eTogKCBfdmFsICk9PlxuXHRcdGlmIF8uaXNFbXB0eSggX3ZhbCApIGFuZCBub3QgXy5pc051bWJlciggX3ZhbCApIGFuZCBub3QgXy5pc0Jvb2xlYW4oIF92YWwgKVxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0OiA9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBpZiBAX2NoZWNrU2VsZWN0RW1wdHkoIF92YWwgKVxuXHRcdEBzZXQoIF92YWwgKVxuXHRcdHJldHVyblxuXG5cdHNldDogKCB2YWwgKT0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IHZhbCApXG5cdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzQmFzZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNEYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvZGF0ZXJhbmdlLmphZGVcIiApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Zm9yY2VkRGF0ZVJhbmdlT3B0czpcblx0XHRvcGVuczogXCJyaWdodFwiXG5cblx0ZXZlbnRzOiA9PlxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0aWYgbm90IEBkYXRlcmFuZ2VwaWNrZXI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgQGZvcmNlZERhdGVSYW5nZU9wdHMgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRcdEAkaW5wLm9uKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblxuXHRcdGVsc2Vcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKSBpZiBfcmVzLnZhbHVlWyAxIF0/XG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIF9wcmVkZWZWYWw/XG5cdFx0XHRpZiBub3QgXy5pc0FycmF5KCBfcHJlZGVmVmFsIClcblx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0WyBAc3RhcnREYXRlLCBAZW5kRGF0ZSBdID0gX3ByZWRlZlZhbFxuXHRcdFx0cmV0dXJuIF9wcmVkZWZWYWxcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldE51bWJlckJhc2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAc2V0TnVtYmVyID0gXy50aHJvdHRsZSggQF9zZXROdW1iZXIsIDMwMCwge2xlYWRpbmc6IGZhbHNlLCB0cmFpbGluZzogZmFsc2V9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPVxuXHRcdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdHJldHVybiBfZXZudHNcblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0XyRlbCA9ICQoIGV2bnQuY3VycmVudFRhcmdldCApXG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApICogLTEsIF8kZWwgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5dXBcIlxuXHRcdFx0X3YgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUucmVwbGFjZSggL1teXFxkXT9bXi1cXGRdKy9nLCBcIlwiIClcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cdFx0XHQgXG5cdFx0XHRAc2V0TnVtYmVyKCBfdiwgXyRlbCApXG5cdFx0cmV0dXJuXG5cblx0Y3JlbWVudDogKCBjaGFuZ2UsIGVsID0gQCRpbnAgKT0+XG5cdFx0X3YgPSBlbC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRfdiA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0ZWxzZVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblxuXHRcdEBfc2V0TnVtYmVyKCBfdiArIGNoYW5nZSwgZWwgKVxuXHRcdHJldHVyblxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF92ID0gQCRpbnAudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHRyZXR1cm4gcGFyc2VJbnQoIEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YpLCAxMCApXG5cblx0X3NldE51bWJlcjogKCBfdiwgZWwgPSBAJGlucCApPT5cblx0XHRpZiBpc05hTiggX3YgKVxuXHRcdFx0I0AkaW5wLnZhbChcIlwiKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRfY3VyciA9IGVsLnZhbCgpXG5cblx0XHRfdiA9IEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YpXG5cdFx0aWYgX2N1cnIgIT0gX3YudG9TdHJpbmcoKVxuXHRcdFx0ZWwudmFsKCBfdiApXG5cdFx0cmV0dXJuXG5cblx0dmFsdWVCeURlZmluaXRpb246ICggX3ZhbHVlICktPlxuXHRcdG1heCA9IEBtb2RlbC5nZXQoIFwibWF4XCIgKVxuXHRcdG1pbiA9IEBtb2RlbC5nZXQoIFwibWluXCIgKVxuXHRcdHN0ZXAgPSBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApXG5cdFx0XG5cdFx0IyBmaXggcmV2ZXJzZWQgbWluL21heCBzZXR0aW5nXG5cdFx0aWYgbWluID4gbWF4XG5cdFx0XHRfdG1wID0gbWluXG5cdFx0XHRtaW4gPSBtYXhcblx0XHRcdG1heCA9IF90bXBcblx0XHRcblx0XHQjIG9uIGV4eGVkZGluZyB0aGUgbGltaXRzIHVzZSB0aGUgbGltaXRcblx0XHRpZiBtaW4/IGFuZCBfdmFsdWUgPCBtaW5cblx0XHRcdHJldHVybiBtaW5cblx0XHRpZiBtYXg/IGFuZCBfdmFsdWUgPiBtYXhcblx0XHRcdHJldHVybiBtYXhcblxuXHRcdCMgc2VhcmNoIHRoZSBuZWFyZXN0IF92YWx1ZSB0byB0aGUgc3RlcFxuXHRcdGlmIHN0ZXAgaXNudCAxXG5cdFx0XHRfdmFsdWUgPSBuZWFyZXN0KCBfdmFsdWUsIHN0ZXAgKVxuXHRcdFxuXHRcdCMgY2FsYyB0aGUgcHJlY2lzaW9uIGJ5IHN0ZXBcblx0XHRfcHJlY2lzaW9uID0gTWF0aC5tYXgoIDAsIE1hdGguY2VpbCggTWF0aC5sb2coIDEvc3RlcCApIC8gTWF0aC5sb2coIDEwICkgKSApXG5cdFx0aWYgX3ByZWNpc2lvbiA+IDBcblx0XHRcdF92YWx1ZSA9IHByZWNpc2lvbiggX3ZhbHVlLCBfcHJlY2lzaW9uIClcblx0XHRlbHNlXG5cdFx0XHRfdmFsdWUgPSBNYXRoLnJvdW5kKCBfdmFsdWUgKVxuXHRcdFx0XG5cdFx0cmV0dXJuIF92YWx1ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXROdW1iZXJCYXNlXG4iLCJTdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU3RyaW5nT3B0aW9uIGV4dGVuZHMgU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBTdHJpbmdPcHRpb25zIGV4dGVuZHMgU3ViUmVzdWx0c1xuXHRtb2RlbDogU3RyaW5nT3B0aW9uXG5cblxuY2xhc3MgQXJyYXlPcHRpb24gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBcIm5hbWVcIiApIG9yIFwiLVwiXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBBcnJheU9wdGlvbnMgZXh0ZW5kcyByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBBcnJheU9wdGlvblxuXG5jbGFzcyBGYWNldFN1YkFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuLi9zZWxlY3RvclwiIClcblx0b3B0RGVmYXVsdDpcblx0XHRsYWJlbDogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblxuXHRtdWx0aVNlbGVjdDogdHJ1ZVxuXG5cdG9wdENvbGw6IFN0cmluZ09wdGlvbnNcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdG9wdGlvbnMuY3VzdG9tID0gdHJ1ZVxuXHRcdEBjb2xsZWN0aW9uID0gQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBvcHRpb25zLm1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ID0+XG5cdFx0X3ZhbHMgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIF92YWxzPyBhbmQgbm90IF8uaXNBcnJheSggX3ZhbHMgKVxuXHRcdFx0X3ZhbHMgPSBbIF92YWxzIF1cblx0XHRcdFxuXHRcdGZvciBfdmFsIGluIF92YWxzXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0IH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdChvcHQpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gbmV3IEBvcHRDb2xsKCBfb3B0cyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YkFycmF5XG4iLCJjbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL251bWJlci5qYWRlXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0XHRAJGlucE9wLnJlbW92ZSgpXG5cdFx0XHRAJGlucE9wID0gbnVsbFxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0X29wU2VsZWN0ZWQ6ID0+XG5cdFx0QHNlbGVjdGVkT1AgPSB0cnVlXG5cdFx0QGZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRpZiBAJGlucE9wPyBhbmQgbm90IEBzZWxlY3RlZE9QXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICksIG9wZXJhdG9yOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKX0gKVxuXG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3AudmFsKClcblx0XHRlbHNlXG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyXG4iLCJjbGFzcyBGYWNldFN1YnNSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmFuZ2UuamFkZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ICggZXh0ID0gXCJfZnJvbVwiICk9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH0je2V4dH1cIlxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0cmV0dXJuIFwiPGxpPlwiICtfcmVzLnZhbHVlLmpvaW4oIFwiIC0gXCIgKSArIFwiPC9saT5cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wVG8gPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAJCggXCIucmFuZ2VpbnBcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdF9yZXQgPVxuXHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92RnJvbSA9IHN1cGVyXG5cdFx0X3YgPSBAJGlucFRvLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0X3ZUbyA9IHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdFx0cmV0dXJuIFsgX3ZGcm9tLCBfdlRvIF1cblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIF92YWw/Lmxlbmd0aCA+PSAyXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNSYW5nZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc2VsZWN0LmphZGVcIiApXG5cblx0Zm9yY2VkTW9kdWxlT3B0czp7fVxuXHQjXHRtdWx0aXBsZTogdHJ1ZVxuXG5cdGRlZmF1bHRNb2R1bGVPcHRzOlxuXHRcdCNtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxXG5cdFx0d2lkdGg6IFwiYXV0b1wiXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHt9XG5cdFx0X2V2bnRzWyBcImNsaWNrIC5zZWxlY3QtY2hlY2tcIiBdID0gXCJzZWxlY3RcIiBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBfZXZudHNcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwic2VsZWN0IyN7QGNpZH1cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0QHNlbGVjdDIub3BlbigpXG5cdFx0I2Vsc2Vcblx0XHRcdCNAJGlucC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0X2luaXRTZWxlY3QyOiA9PlxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3RcIiwgQHNlbGVjdFxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdCQoIGRvY3VtZW50ICkub24gQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuXG5cblx0X3NlbDJvcGVuOiAoIGV2bnQgKS0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0cmVtb3ZlOiA9PlxuXHRcdCNAJGlucC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdF9kYXRhID0gXy5leHRlbmQoIHt9LCBzdXBlciwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICksIG9wdGlvbnM6IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggQG1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApIH0gKVxuXHRcdGlmIF9kYXRhLnZhbHVlPyBhbmQgbm90IF8uaXNBcnJheSggX2RhdGEudmFsdWUgKVxuXHRcdFx0X2RhdGEudmFsdWUgPSBbIF9kYXRhLnZhbHVlIF1cblxuXHRcdGlmIF9kYXRhLnZhbHVlP1xuXHRcdFx0Zm9yIF92IGluIF9kYXRhLnZhbHVlIHdoZW4gX3Ygbm90IGluIF8ucGx1Y2soIF9kYXRhLm9wdGlvbnMsIFwidmFsdWVcIiApXG5cdFx0XHRcdF9kYXRhLm9wdGlvbnMucHVzaCB7IHZhbHVlOiBfdiwgbGFiZWw6IF92LCBncm91cDogbnVsbCB9XG5cdFx0XG5cdFx0X2dyb3VwcyA9IF8uZ3JvdXBCeSggX2RhdGEub3B0aW9ucywgXCJncm91cFwiIClcblx0XHRpZiBfLmNvbXBhY3QoIF8ua2V5cyggX2dyb3VwcyBvciB7fSApICkubGVuZ3RoID4gMVxuXHRcdFx0X2RhdGEub3B0aW9uR3JvdXBzID0gX2dyb3Vwc1xuXHRcdHJldHVybiBfZGF0YVxuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAoIGNyZWF0ZSApPT5cblx0XHRpZiBjcmVhdGVcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiBAbW9kZWwuZ2V0KFwibXVsdGlwbGVcIilcblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXl1cFwiXG5cdFx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92YWxzID0gW11cblx0XHRmb3IgZGF0YSBpbiBAc2VsZWN0Mj8uZGF0YSgpIG9yIFtdXG5cdFx0XHRfZGF0YSA9IHt9XG5cdFx0XHRfZGF0YS52YWx1ZSA9IGRhdGEuaWRcblx0XHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0IGlmIGRhdGEudGV4dD9cblx0XHRcdF92YWxzLnB1c2goIF9kYXRhIClcblx0XHRyZXR1cm4gX3ZhbHNcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiBvcHQsIGxhYmVsOiBvcHQsIGdyb3VwOiBudWxsIH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdCggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKVxuXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0dW5zZWxlY3Q6ICggZXZudCApPT5cblx0XHRAcmVzdWx0LnJlbW92ZSggZXZudC5wYXJhbXM/LmRhdGE/LmlkIClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAc2VsZWN0Mj8uZGVzdHJveSgpXG5cdFx0QCRpbnA/LnJlbW92ZSgpXG5cdFx0QCQoIFwiLnNlbGVjdC1jaGVja1wiICkucmVtb3ZlKClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0X3ZhbHMgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0TW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0Zm9yIF92YWwgaW4gX3ZhbHNcblx0XHRcdEByZXN1bHQuYWRkKCBuZXcgTW9kZWxDb25zdCggX3ZhbCApIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAcmVzdWx0IClcblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzU2VsZWN0XG4iLCJjbGFzcyBGYWNldFN1YlN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zdHJpbmcuamFkZVwiIClcblx0XG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJzZWxlY3RcIlxuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0c3VwZXJcblx0XHR0cnlcblx0XHRcdEAkaW5wPy5yZW1vdmUoKVxuXHRcdHJldHVyblxuXHRcdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJTdHJpbmdcbiIsIlN1YlZpZXcgPSByZXF1aXJlKCBcIi4vc3ViXCIgKVxuU2VsZWN0b3JWaWV3ID0gcmVxdWlyZSggXCIuL3NlbGVjdG9yXCIgKVxuXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIE1haW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy93cmFwcGVyLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJpZ2d5IGNsZWFyZml4XCJcblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAuYWRkLWZhY2V0LWJ0blwiOiBcIl9hZGRGYWNldFwiXG5cdFx0XCJjbGlja1wiOiBcIl9hZGRGYWNldFwiXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEByZXN1bHRzID0gb3B0aW9ucy5yZXN1bHRzXG5cblx0XHRAY29sbGVjdGlvbi5vbiBcImlnZ3k6cmVtXCIsIEByZW1GYWNldFxuXG5cdFx0QGVsLmNsYXNzTmFtZSArPSBAY2xhc3NOYW1lXG5cdFx0QHJlbmRlcigpXG5cdFx0JCggZG9jdW1lbnQgKS5vbiBcImtleXVwXCIsIEBfb25LZXlcblxuXHRcdGZvciBmY3QgaW4gQGNvbGxlY3Rpb24uZmlsdGVyKCAoIGZjdCApLT5yZXR1cm4gZmN0Py5nZXQoIFwidmFsdWVcIiApPyApXG5cdFx0XHRzdWJ2aWV3ID0gQGdlblN1YiggZmN0LCBmYWxzZSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCkgKVxuXHRcdEAkYWRkQnRuID0gQCQoIFwiLmFkZC1mYWNldC1idG5cIiApXG5cdFx0cmV0dXJuXG5cblx0X2FkZEZhY2V0OiAoIGV2bnQgKT0+XG5cdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRVNDIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdEBleGl0KClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0ZXhpdDogPT5cblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0aWYgQHN1YnZpZXdcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRyZW1GYWNldDogKCBmYWNldE0gKT0+XG5cdFx0QHJlc3VsdHMucmVtb3ZlKCBmYWNldE0uZ2V0KCBcIm5hbWVcIiApIClcblx0XHRyZXR1cm5cblxuXHRzZXRGYWNldDogKCBmYWNldE0sIGRhdGEgKT0+XG5cdFx0QGNvbGxlY3Rpb24ucmVtb3ZlKCBmYWNldE0gKVxuXG5cdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggZGF0YSwgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDogZmFjZXRNIH0gKVxuXHRcdHJldHVyblxuXG5cdGdlblN1YjogKCBmYWNldE0sIGFkZEFmdGVyID0gdHJ1ZSApPT5cblx0XHRzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdHN1YnZpZXcub2ZmKClcblx0XHRcdHN1YnZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBhZGRBZnRlclxuXHRcdFx0cmV0dXJuXG5cblx0XHRzdWJ2aWV3Lm9uKCBcInNlbGVjdGVkXCIsIEBzZXRGYWNldCApXG5cdFx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBzdWJ2aWV3LnJlbmRlcigpIClcblx0XHRyZXR1cm4gc3Vidmlld1xuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNFTEVDVCBFWElTVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBzdWJ2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNVQiBFWElTVFwiXG5cdFx0XHRAc3Vidmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSApXG5cblx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdEBzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNICk9PlxuXHRcdFx0ZmFjZXRNLnNldCggXCJ2YWx1ZVwiLCBudWxsIClcblx0XHRcdEBzdWJ2aWV3ID0gQGdlblN1YiggZmFjZXRNIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblZpZXdcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU2VsZWN0b3JWaWV3IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0cy9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3Rvci5qYWRlXCIgKVxuXHR0ZW1wbGF0ZUVsOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9ybGkuamFkZVwiIClcblx0bXVsdGlTZWxlY3Q6IGZhbHNlXG5cblx0Y2xhc3NOYW1lOiA9PlxuXHRcdGNscyA9IFsgXCJhZGQtZmFjZXRcIiBdXG5cdFx0aWYgQGN1c3RvbVxuXHRcdFx0Y2xzLnB1c2ggXCJjdXN0b21cIlxuXHRcdHJldHVybiBjbHMuam9pbiggXCIgXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRcIm1vdXNlZG93biBhXCI6IFwiX29uQ2xpY2tcIlxuXHRcdFwiZm9jdXMgaW5wdXQjI3tAY2lkfVwiOiBcIm9wZW5cIlxuXHRcdCNcImJsdXIgaW5wdXQjI3tAY2lkfVwiOiBcImNsb3NlXCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBjdXN0b20gPSAgb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzZWFyY2hjb2xsID0gQGNvbGxlY3Rpb24uc3ViKCAtPnRydWUgKVxuXHRcdEByZXN1bHQgPSBuZXcgQGNvbGxlY3Rpb24uY29uc3RydWN0b3IoKVxuXHRcdFxuXHRcdCNAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXHRcdFx0X2Nzc2NsYXNzID0gbW9kZWwuZ2V0KCBcImNzc2NsYXNzXCIgKVxuXHRcdFx0Y29uc29sZS5sb2cgXCJtb2RlbFwiLF9jc3NjbGFzc1xuXHRcdFx0aWYgQGN1cnJRdWVyeT8ubGVuZ3RoID4gMVxuXHRcdFx0XHRfbGJsID0gX2xibC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBAY3VyclF1ZXJ5LCBcImdpXCIgKSwgKCggc3RyICktPnJldHVybiBcIjxiPiN7c3RyfTwvYj5cIiApIClcblx0XHRcdF9saXN0LnB1c2ggbGFiZWw6IF9sYmwsIGlkOiBfaWQsIGNzc2NsYXNzOiBfY3NzY2xhc3Ncblx0XHRAJGxpc3QuYXBwZW5kKCBAdGVtcGxhdGVFbCggbGlzdDogX2xpc3QsIHF1ZXJ5OiBAY3VyclF1ZXJ5LCBhY3RpdmVJZHg6IEBhY3RpdmVJZHgsIGN1c3RvbTogQGN1c3RvbSApIClcblxuXHRcdEBfY2hlY2tTY3JvbGwoKVxuXHRcdFxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRfc2Nyb2xsVGlsbDogMTk4XG5cdF9jaGVja1Njcm9sbDogPT5cblx0XHRfaGVpZ2h0ID0gQCRsaXN0LmhlaWdodCgpXG5cdFx0aWYgX2hlaWdodCA+IDBcblx0XHRcdEBzY3JvbGxIZWxwZXIoIF9oZWlnaHQgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGV4aXQgdGhlIHRoZSBjYWxsIHN0YWNrIHRvIGNoZWNrIGhlaWdodCBhZnRlciB0aGUgbW9kdWxlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBkb21cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHNjcm9sbEhlbHBlciggQCRsaXN0LmhlaWdodCgpIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXG5cdHNjcm9sbEhlbHBlcjogKCBoZWlnaHQgKT0+XG5cdFx0aWYgaGVpZ2h0ID49IEBfc2Nyb2xsVGlsbFxuXHRcdFx0QHNjcm9sbGluZyA9IHRydWVcblx0XHRlbHNlXG5cdFx0XHRAc2Nyb2xsaW5nID0gZmFsc2Vcblx0XHRyZXR1cm5cblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0QHNlbGVjdGVkKCBAY29sbGVjdGlvbi5nZXQoIF9pZCApIClcblx0XHRpZiBub3QgQG11bHRpU2VsZWN0XG5cdFx0XHRAY2xvc2UoKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHNlbGVjdGVkOiAoIG1kbCApPT5cblx0XHRpZiBtZGwub25seUV4ZWM/XG5cdFx0XHRtZGw/LmV4ZWM/KClcblx0XHRcdHJldHVyblxuXHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggbWRsIClcblx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRAdHJpZ2dlciBcInNlbGVjdGVkXCIsIG1kbFxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3RBY3RpdmUoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cblx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKT0+XG5cdFx0XHRpZiBAcmVzdWx0LmdldCggbWRsLmlkICk/XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgbm90IF9xPy5sZW5ndGhcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdF9tYXRjaCA9IG1kbC5tYXRjaCggX3EgKVxuXHRcdFx0cmV0dXJuIF9tYXRjaFxuXHRcdCwgZmFsc2UgKVxuXG5cblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblxuXHRcdF90b3AgPSAwXG5cdFx0aWYgdXBcblx0XHRcdGlmICggQGFjdGl2ZUlkeCAtIDEgKSA8IF90b3Bcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCAtIDFcblx0XHRlbHNlXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggLSAxIDw9IEBhY3RpdmVJZHhcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDFcblxuXG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0XyRlbG5ldyA9IEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0aWYgQHNjcm9sbGluZ1xuXHRcdFx0X2VsSCA9IF8kZWxuZXcub3V0ZXJIZWlnaHQoKVxuXHRcdFx0X3BvcyA9IF9lbEggKiAoIF9uZXdpZHggKyAxIClcblx0XHRcdF8kbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3RcIiApXG5cdFx0XHRfc2Nyb2xsVCA9IF8kbGlzdC5zY3JvbGxUb3AoKVxuXHRcdFx0aWYgX3BvcyA+IF9zY3JvbGxUICsgQF9zY3JvbGxUaWxsXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBAX3Njcm9sbFRpbGwgKVxuXHRcdFx0ZWxzZSBpZiBfcG9zIDwgX3Njcm9sbFQgKyBfZWxIXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBfZWxIIClcblxuXHRcdEBhY3RpdmVJZHggPSBfbmV3aWR4XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0Oj0+XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0QWN0aXZlOiA9PlxuXHRcdF9zZWwgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGEuYWN0aXZlXCIgKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApLmRhdGEoKVxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0aWYgX3NlbD8uaWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBAY29sbGVjdGlvbi5nZXQoIF9zZWwuaWQgKSApXG5cdFx0ZWxzZSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlICkgKVxuXHRcdFx0QCRpbnAudmFsKCBcIlwiIClcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAbXVsdGlTZWxlY3Rcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3XG4iLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiBcInN1YlwiXG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czpcblx0XHRcImNsaWNrIC5ybS1mYWNldC1idG5cIjogXCJkZWxcIlxuXG5cdHJlbmRlcjogKCBvcHRNZGwgKT0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblxuXHRcdEAkZWwuaHRtbCBAdGVtcGxhdGUoIGxhYmVsOiBAbW9kZWwuZ2V0TGFiZWwoKSwgc2VsZWN0ZWQ6IF9saXN0IClcblx0XHRAJHN1YiA9IEAkKCBcIi5zdWJzZWxlY3RcIiApXG5cdFx0QCRyZXN1bHRzID0gQCQoIFwiLnN1YnJlc3VsdHNcIiApXG5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXHRcdHJldHVybiBAZWxcblxuXHRkZWw6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBzZWxlY3R2aWV3Py5yZW1vdmUoKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsIClcblx0XHRAJHJlc3VsdHMuaHRtbCggQHNlbGVjdHZpZXcucmVuZGVyUmVzdWx0KCkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRyZXR1cm5cblxuXHRpc09wZW46ID0+XG5cdFx0cmV0dXJuIEBzZWxlY3R2aWV3P1xuXG5cdGZvY3VzOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdEBvcGVuKClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRnZW5lcmF0ZVN1YjogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdHJldHVybiBAc2VsZWN0dmlld1xuXHRcdFx0XG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgQG1vZGVsLlN1YlZpZXcoIG1vZGVsOiBAbW9kZWwsIGVsOiBAJHN1YiApXG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHQgKT0+XG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdCNAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCByZXN1bHQgKVxuXHRcdFx0QHJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBtZGwgKT0+XG5cdFx0XHRpZiBtZGxcblx0XHRcdFx0QHNlbGVjdGVkKCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRAJGVsLmFwcGVuZCggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdGlmIEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKT9cblx0XHRcdEBzZWxlY3R2aWV3LnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0b3BlbjogPT5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXG5cdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U3ViXG4iLG51bGwsIiFmdW5jdGlvbihlKXtpZihcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSltb2R1bGUuZXhwb3J0cz1lKCk7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKFtdLGUpO2Vsc2V7dmFyIGY7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz9mPXdpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2Y9Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmJiYoZj1zZWxmKSxmLmphZGU9ZSgpfX0oZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xuICB2YXIgYmMgPSBiWydjbGFzcyddO1xuXG4gIGlmIChhYyB8fCBiYykge1xuICAgIGFjID0gYWMgfHwgW107XG4gICAgYmMgPSBiYyB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XG59XG5cbi8qKlxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpIDpcbiAgICAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKHZhbCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHZhbFtrZXldOyB9KSA6XG4gICAgW3ZhbF0pLmZpbHRlcihudWxscykuam9pbignICcpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuc3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5tYXAoZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgIH0pLmpvaW4oJzsnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgIHZhbCA9IGV4cG9ydHMuc3R5bGUodmFsKTtcbiAgfVxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh2YWwpLmluZGV4T2YoJyYnKSAhPT0gLTEpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgJyArXG4gICAgICAgICAgICAgICAgICAgJ3dpbGwgYmUgZXNjYXBlZCB0byBgJmFtcDtgJyk7XG4gICAgfTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgJ0lTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuXG59LHtcImZzXCI6Mn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XX0se30sWzFdKSgxKVxufSk7Il19
