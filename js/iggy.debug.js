(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctDateRange, FctEvent, FctNumber, FctRange, FctSelect, FctString, IGGY, MainView, Results,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MainView = require("./views/main");

Facets = require("./models/facets");

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


},{"./models/facet_array":3,"./models/facet_daterange":5,"./models/facet_event":6,"./models/facet_number":7,"./models/facet_range":8,"./models/facet_select":9,"./models/facet_string":10,"./models/facets":11,"./models/results":12,"./views/main":33}],2:[function(require,module,exports){

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


},{"../views/facets/subarray":28,"./facet_string":10}],4:[function(require,module,exports){
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


},{"../views/facets/base":25}],5:[function(require,module,exports){
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


},{"../views/facets/daterange":26,"./facet_base":4}],6:[function(require,module,exports){
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


},{"../views/facets/subnumber":29,"./facet_base":4}],8:[function(require,module,exports){
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


},{"../views/facets/subrange":30,"./facet_base":4}],9:[function(require,module,exports){
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


},{"../views/facets/subselect":31,"./facet_base":4}],10:[function(require,module,exports){
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


},{"../views/facets/substring":32,"./facet_base":4}],11:[function(require,module,exports){
var IggyFacets,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IggyFacets = (function(superClass) {
  extend(IggyFacets, superClass);

  function IggyFacets() {
    return IggyFacets.__super__.constructor.apply(this, arguments);
  }

  IggyFacets.prototype.modelId = function(attrs) {
    return attrs.name;
  };

  return IggyFacets;

})(require("./backbone_sub"));

module.exports = IggyFacets;


},{"./backbone_sub":2}],12:[function(require,module,exports){
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


},{}],13:[function(require,module,exports){
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


},{"./backbone_sub":2}],14:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"daterange-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":37}],15:[function(require,module,exports){
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
},{"jade/runtime":37}],16:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<div class=\"rangeinp\">");
var _vals = value ? value : []
buf.push("<input" + (jade.attr("id", "" + (cid) + "_from", true, false)) + (jade.attr("value", _vals[0], true, false)) + " class=\"number-inp range-from\"/><span class=\"separator\">-</span><input" + (jade.attr("id", "" + (cid) + "_to", true, false)) + (jade.attr("value", _vals[1], true, false)) + " class=\"number-inp range-to\"/></div>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":37}],17:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

;return buf.join("");
};
},{"jade/runtime":37}],18:[function(require,module,exports){
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
},{"jade/runtime":37}],19:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":37}],20:[function(require,module,exports){
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
},{"jade/runtime":37}],21:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", value, true, false)) + " class=\"string-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":37}],22:[function(require,module,exports){
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
},{"jade/runtime":37}],23:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");;return buf.join("");
};
},{"jade/runtime":37}],24:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13,
  "TAB": 9
};


},{}],25:[function(require,module,exports){
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
    this.reopen = bind(this.reopen, this);
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

  FacetSubsBase.prototype.initialize = function(options) {
    this.sub = options.sub;
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

  FacetSubsBase.prototype.renderResult = function(renderEmpty) {
    var _list, i, idx, len, model, ref;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "<li></li>";
    }
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

  FacetSubsBase.prototype.reopen = function(pView) {
    this.$el.removeClass("closed");
    this.$el.addClass("open");
    this.render();
    pView.open();
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
    _model = this.result.first();
    if (_model == null) {
      _ModelConst = this.getSelectModel();
      _model = new _ModelConst({
        value: val
      });
      this.result.add(_model);
    } else {
      _model.set({
        value: val
      });
    }
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsBase;

})(Backbone.View);

module.exports = FacetSubsBase;


},{"../../models/subresults":13,"../../tmpls/result_base.jade":17,"../../utils/keycodes":24}],26:[function(require,module,exports){
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


},{"../../tmpls/daterange.jade":14,"../../utils/keycodes":24,"./base":25}],27:[function(require,module,exports){
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
    var obj;
    return (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj
    );
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


},{"../../utils/keycodes":24,"./base":25}],28:[function(require,module,exports){
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

  FacetSubArray.prototype.selectCount = 0;

  FacetSubArray.prototype.optColl = StringOptions;

  FacetSubArray.prototype.events = function() {
    var _evnts;
    _evnts = FacetSubArray.__super__.events.apply(this, arguments);
    _evnts["blur input#" + this.cid] = "close";
    return _evnts;
  };

  function FacetSubArray(options) {
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this._onTabAction = bind(this._onTabAction, this);
    this.getResults = bind(this.getResults, this);
    this.reopen = bind(this.reopen, this);
    this.select = bind(this.select, this);
    this._isFull = bind(this._isFull, this);
    this.events = bind(this.events, this);
    if (options.model.get("count") != null) {
      this.selectCount = options.model.get("count");
    }
    options.custom = true;
    if (options.model.get("custom") != null) {
      options.custom = Boolean(options.model.get("custom"));
    }
    this.collection = this._createOptionCollection(options.model.get("options"));
    if (!options.custom && this.selectCount <= 0) {
      this.selectCount = this.collection.length;
    }
    FacetSubArray.__super__.constructor.call(this, options);
    return;
  }

  FacetSubArray.prototype._isFull = function() {
    if (this.selectCount <= 0) {
      return false;
    }
    return (this.result || []).length >= this.selectCount;
  };

  FacetSubArray.prototype.select = function() {
    var _mdl, _val, _vals, i, len, ref;
    _vals = this.model.get("value");
    if ((_vals != null) && !_.isArray(_vals)) {
      _vals = [_vals];
    }
    ref = (this.selectCount <= 0 ? _vals : _vals.slice(0, this.selectCount));
    for (i = 0, len = ref.length; i < len; i++) {
      _val = ref[i];
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

  FacetSubArray.prototype.reopen = function(pView) {
    if (this._isFull()) {
      return;
    }
    FacetSubArray.__super__.reopen.apply(this, arguments);
  };

  FacetSubArray.prototype.getResults = function() {
    return {
      value: this.result.pluck("value")
    };
  };

  FacetSubArray.prototype._onTabAction = function(evnt) {
    var searchContent;
    evnt.preventDefault();
    evnt.stopPropagation();
    searchContent = this.$inp.val();
    if (searchContent != null ? searchContent.length : void 0) {
      this.selectActive();
      return;
    }
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


},{"../../models/backbone_sub":2,"../../models/subresults":13,"../../utils/keycodes":24,"../selector":34}],29:[function(require,module,exports){
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
    this.reopen = bind(this.reopen, this);
    this.focus = bind(this.focus, this);
    this._opSelected = bind(this._opSelected, this);
    this.select = bind(this.select, this);
    this.close = bind(this.close, this);
    this.renderResult = bind(this.renderResult, this);
    this.render = bind(this.render, this);
    this.events = bind(this.events, this);
    return FacetSubsNumber.__super__.constructor.apply(this, arguments);
  }

  FacetSubsNumber.prototype.template = require("../../tmpls/number.jade");

  FacetSubsNumber.prototype.events = function() {
    var _evnts;
    _evnts = FacetSubsNumber.__super__.events.apply(this, arguments);
    _evnts["blur " + (this._getInpSelector())] = "select";
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

  FacetSubsNumber.prototype.renderResult = function(renderEmpty) {
    var _res, _s;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "<li></li>";
    }
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

  FacetSubsNumber.prototype.select = function(evnt) {
    var _posWrp, ref;
    if ((evnt != null ? evnt.relatedTarget : void 0) != null) {
      _posWrp = this.el.compareDocumentPosition(evnt != null ? evnt.relatedTarget : void 0);
      if (!(_posWrp === 0 || _posWrp - 16 >= 0)) {
        evnt.stopPropagation();
        return;
      }
    }
    if ((evnt != null) && ((evnt != null ? evnt.relatedTarget : void 0) === this.$inp.get(0) || (evnt != null ? evnt.relatedTarget : void 0) === ((ref = this.$inpOp) != null ? ref.get(0) : void 0))) {
      evnt.stopPropagation();
      return;
    }
    if (this.$inpOp != null) {
      this.model.set({
        operator: this.$inpOp.val()
      });
    }
    FacetSubsNumber.__super__.select.apply(this, arguments);
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

  FacetSubsNumber.prototype.reopen = function(pView) {
    var _oldOp, _oldVal;
    _oldVal = this.result.first().get("value");
    _oldOp = this.result.first();
    this.model.set({
      value: _oldVal
    });
    pView.$results.empty().html(this.renderResult(true));
    FacetSubsNumber.__super__.reopen.apply(this, arguments);
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


},{"../../tmpls/number.jade":15,"./number_base":27}],30:[function(require,module,exports){
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
    this.select = bind(this.select, this);
    this.reopen = bind(this.reopen, this);
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
      obj["blur " + (this._getInpSelector())] = "select",
      obj["blur " + (this._getInpSelector("_to"))] = "select",
      obj
    );
  };

  FacetSubsRange.prototype.renderResult = function(renderEmpty) {
    var _res;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "<li></li>";
    }
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

  FacetSubsRange.prototype.reopen = function(pView) {
    var _oldVal;
    _oldVal = this.result.first().get("value");
    this.model.set({
      value: _oldVal
    });
    pView.$results.empty().html(this.renderResult(true));
    FacetSubsRange.__super__.reopen.apply(this, arguments);
  };

  FacetSubsRange.prototype.select = function(evnt) {
    if ((evnt != null) && ((evnt != null ? evnt.relatedTarget : void 0) === this.$inp.get(0) || (evnt != null ? evnt.relatedTarget : void 0) === this.$inpTo.get(0))) {
      evnt.stopPropagation();
      return;
    }
    FacetSubsRange.__super__.select.apply(this, arguments);
  };

  FacetSubsRange.prototype.close = function() {
    try {
      this.$(".rangeinp").remove();
    } catch (_error) {}
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


},{"../../tmpls/range.jade":16,"./number_base":27}],31:[function(require,module,exports){
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
    this.reopen = bind(this.reopen, this);
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

  FacetSubsSelect.prototype.reopen = function(pView) {};

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
      this.select2.$element.hide();
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
    if (evnt != null ? evnt.stopPropagation : void 0) {
      evnt.stopPropagation();
    }
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


},{"../../tmpls/select.jade":18,"../../utils/keycodes":24,"./base":25}],32:[function(require,module,exports){
var FacetSubString,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubString = (function(superClass) {
  extend(FacetSubString, superClass);

  function FacetSubString() {
    this.reopen = bind(this.reopen, this);
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

  FacetSubString.prototype.reopen = function(pView) {
    var _oldVal;
    _oldVal = this.result.first().get("value");
    this.model.set({
      value: _oldVal
    });
    pView.$results.empty().html(this.renderResult(true));
    FacetSubString.__super__.reopen.apply(this, arguments);
  };

  return FacetSubString;

})(require("./base"));

module.exports = FacetSubString;


},{"../../tmpls/string.jade":21,"./base":25}],33:[function(require,module,exports){
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
    this._outerClick = bind(this._outerClick, this);
    this._outerClickListen = bind(this._outerClickListen, this);
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

  MainView.prototype.events = {
    "click .add-facet-btn": "_addFacet",
    "click": "_addFacet"
  };

  MainView.prototype.initialize = function(options) {
    var _cl, fct, i, len, ref, ref1, subview;
    this.results = options.results;
    this.collection.on("iggy:rem", this.remFacet);
    _cl = "iggy clearfix";
    if ((ref = this.el.className) != null ? ref.length : void 0) {
      _cl = " " + _cl;
    }
    this.el.className += _cl;
    this.render();
    $(document).on("keyup", this._onKey);
    this._outerClickListen();
    ref1 = this.collection.filter(function(fct) {
      return (fct != null ? fct.get("value") : void 0) != null;
    });
    for (i = 0, len = ref1.length; i < len; i++) {
      fct = ref1[i];
      subview = this.genSub(fct, false);
    }
    this.collection.on("add", (function(_this) {
      return function() {
        _this.$addBtn.show();
      };
    })(this));
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

  MainView.prototype.exit = function(nextAdd) {
    if (nextAdd == null) {
      nextAdd = true;
    }
    if (this.subview) {
      this.subview.close();
      this.subview = null;
      if (nextAdd) {
        this.addFacet();
      }
    }
    if (this.selectview) {
      this.selectview.close();
      this.selectview = null;
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
    if (!this.collection.length) {
      this.$addBtn.hide();
    }
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
        if (!(results != null ? results.length : void 0)) {
          subview.remove();
        }
        _this.subview = null;
        if (addAfter) {
          _this.addFacet();
        }
      };
    })(this));
    subview.on("reopen", (function(_this) {
      return function() {
        var ref;
        if ((ref = _this.selectview) != null) {
          ref.close();
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
      this.subview.close();
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
        _this.selectview.remove();
        _this.selectview = null;
        if (!(results != null ? results.length : void 0) && (_this.subview != null)) {
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

  MainView.prototype._outerClickListen = function() {
    jQuery(document).on("click", this._outerClick);
  };

  MainView.prototype._outerClick = function(evnt) {
    var _posWrp;
    evnt.stopPropagation();
    _posWrp = this.el.compareDocumentPosition(evnt.target);
    if (!(_posWrp === 0 || _posWrp - 16 >= 0)) {
      this.exit(false);
    }
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;


},{"../tmpls/wrapper.jade":23,"../utils/keycodes":24,"./selector":34,"./sub":35}],34:[function(require,module,exports){
var KEYCODES, SelectorView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../utils/keycodes");

SelectorView = (function(superClass) {
  extend(SelectorView, superClass);

  SelectorView.prototype.template = require("../tmpls/selector.jade");

  SelectorView.prototype.templateEl = require("../tmpls/selectorli.jade");

  SelectorView.prototype.selectCount = 1;

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
    this._isFull = bind(this._isFull, this);
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
    this.listenTo(this.searchcoll, "add", this.renderRes);
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
    var _id, _mdl;
    evnt.stopPropagation();
    evnt.preventDefault();
    _id = this.$(evnt.currentTarget).data("id");
    if (_id == null) {
      return;
    }
    _mdl = this.collection.get(_id);
    if (_mdl == null) {
      return;
    }
    this.selected(_mdl);
    if (this._isFull()) {
      this.close();
    }
    return false;
  };

  SelectorView.prototype._isFull = function() {
    return true;
  };

  SelectorView.prototype.selected = function(mdl) {
    var _err, _errerr;
    try {
      if (mdl.onlyExec != null) {
        if (mdl != null) {
          if (typeof mdl.exec === "function") {
            mdl.exec();
          }
        }
        return;
      }
    } catch (_error) {
      _err = _error;
      try {
        console.error("Issue #23: CATCH - Class:" + this.constructor.name + " - activeIdx:" + this.activeIdx + " - collection:" + (JSON.stringify(this.collection.toJSON())));
      } catch (_error) {
        _errerr = _error;
        console.error("Issue #23: CATCH");
      }
    }
    if (mdl != null) {
      this.searchcoll.remove(mdl);
      this.result.add(mdl);
      this.trigger("selected", mdl);
    }
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
          this.selectActive(true);
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
    var _$elnew, _$list, _customElementChange, _elH, _list, _newidx, _pos, _scrollT, _top, ref;
    if (up == null) {
      up = false;
    }
    _list = this.$el.find(".typelist a");
    _customElementChange = ((ref = this.currQuery) != null ? ref.length : void 0) ? 0 : 1;
    _top = 0;
    if (up) {
      if ((this.activeIdx - 1) < _top) {
        return;
      }
      _newidx = this.activeIdx - 1;
    } else {
      if (this.searchcoll.length - _customElementChange <= this.activeIdx) {
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

  SelectorView.prototype.selectActive = function(isEnterEvent) {
    var _search, _sel, ref;
    if (isEnterEvent == null) {
      isEnterEvent = false;
    }
    _sel = this.$el.find(".typelist a.active").removeClass("active").data();
    _search = this.$inp.val();
    if ((_sel == null) && this.selectCount !== 1 && isEnterEvent && !(_search != null ? _search.length : void 0)) {
      this.close();
      return;
    }
    if (_sel == null) {
      return;
    }
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
    if (this._isFull()) {
      this.close();
    }
  };

  return SelectorView;

})(require("./facets/base"));

module.exports = SelectorView;


},{"../tmpls/selector.jade":19,"../tmpls/selectorli.jade":20,"../utils/keycodes":24,"./facets/base":25}],35:[function(require,module,exports){
var ViewSub,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewSub = (function(superClass) {
  extend(ViewSub, superClass);

  function ViewSub() {
    this.open = bind(this.open, this);
    this.attachSubEvents = bind(this.attachSubEvents, this);
    this.generateSub = bind(this.generateSub, this);
    this.close = bind(this.close, this);
    this.focus = bind(this.focus, this);
    this.isOpen = bind(this.isOpen, this);
    this.selected = bind(this.selected, this);
    this.remove = bind(this.remove, this);
    this.del = bind(this.del, this);
    this.reopen = bind(this.reopen, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    return ViewSub.__super__.constructor.apply(this, arguments);
  }

  ViewSub.prototype.template = require("../tmpls/sub.jade");

  ViewSub.prototype.className = "sub";

  ViewSub.prototype.initialize = function() {
    this._isOpen = false;
    this.result = new Backbone.Collection();
    this.$el.on("click", this.reopen);
  };

  ViewSub.prototype.events = {
    "click .rm-facet-btn": "del"
  };

  ViewSub.prototype.render = function(optMdl) {
    var _err, _errerr, _list, i, idx, len, model, ref;
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      try {
        _list.push(model.getLabel());
      } catch (_error) {
        _err = _error;
        try {
          console.error("Issue #24: CATCH - Class:" + this.constructor.name + " - model:" + (JSON.stringify(this.model.toJSON())) + " - result:" + (JSON.stringify(this.result.toJSON())));
        } catch (_error) {
          _errerr = _error;
          console.error("Issue #24: CATCH");
        }
      }
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

  ViewSub.prototype.reopen = function(evnt) {
    if (!this._isOpen && (this.selectview != null)) {
      this.selectview.reopen(this);
    }
    evnt.preventDefault();
    evnt.stopPropagation();
    this.trigger("reopen");
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
    this._isOpen = false;
    if ((ref = this.selectview) != null) {
      ref.remove();
    }
    return ViewSub.__super__.remove.apply(this, arguments);
  };

  ViewSub.prototype.selected = function(optMdl) {
    this.result.add(optMdl, {
      merge: true
    });
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
    this._isOpen = false;
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
      this.attachSubEvents();
      return this.selectview;
    }
    this.selectview = new this.model.SubView({
      sub: this,
      model: this.model,
      el: this.$sub
    });
    this.attachSubEvents();
    this.$el.append(this.selectview.render());
    if (((ref = this.model) != null ? ref.get("value") : void 0) != null) {
      this.selectview.select();
    }
  };

  ViewSub.prototype.attachSubEvents = function() {
    this.selectview.on("closed", (function(_this) {
      return function(result) {
        _this._isOpen = false;
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

  ViewSub.prototype.open = function() {
    var ref;
    this.generateSub();
    if ((ref = this.selectview) != null) {
      ref.focus();
    }
    this._isOpen = true;
  };

  return ViewSub;

})(Backbone.View);

module.exports = ViewSub;


},{"../tmpls/sub.jade":22}],36:[function(require,module,exports){

},{}],37:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;

function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(jade_match_html, jade_encode_char);
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

exports.DebugItem = function DebugItem(lineno, filename) {
  this.lineno = lineno;
  this.filename = filename;
}

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"fs":36}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3JhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9zdWJyZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvdG1wbHMvZGF0ZXJhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9yYW5nZS5qYWRlIiwiX3NyYy9qcy90bXBscy9yZXN1bHRfYmFzZS5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3QuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3IuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3JsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9zdHJpbmcuamFkZSIsIl9zcmMvanMvdG1wbHMvc3ViLmphZGUiLCJfc3JjL2pzL3RtcGxzL3dyYXBwZXIuamFkZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3V0aWxzL2tleWNvZGVzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL251bWJlcl9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VibnVtYmVyLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zdWIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9qYWRlL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDRHQUFBO0VBQUE7Ozs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLGNBQVQ7O0FBQ1gsTUFBQSxHQUFTLE9BQUEsQ0FBUyxpQkFBVDs7QUFDVCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsU0FBQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVDs7QUFDWixTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsWUFBQSxHQUFlLE9BQUEsQ0FBUywwQkFBVDs7QUFDZixRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLE9BQUEsR0FBVSxPQUFBLENBQVMsa0JBQVQ7O0FBRUo7OztpQkFDTCxDQUFBLEdBQUc7O0VBQ1UsY0FBRSxFQUFGLEVBQU0sTUFBTixFQUFtQixPQUFuQjs7TUFBTSxTQUFTOzs7TUFBSSxVQUFVOzs7Ozs7Ozs7SUFDekMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJ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QUFBLEdBQU87Ozs7R0FEa0IsT0FBQSxDQUFTLGdCQUFUOztBQUcxQixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1RqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQSxNQUFNLENBQUMsT0FBUCxHQUNDO0VBQUEsTUFBQSxFQUFRLEVBQVI7RUFDQSxPQUFBLEVBQVMsRUFEVDtFQUVBLElBQUEsRUFBTSxFQUZOO0VBR0EsTUFBQSxFQUFRLEVBSFI7RUFJQSxLQUFBLEVBQU8sQ0FBRSxHQUFGLEVBQU8sRUFBUCxDQUpQO0VBS0EsT0FBQSxFQUFTLEVBTFQ7RUFNQSxLQUFBLEVBQU8sQ0FOUDs7Ozs7QUNERCxJQUFBLG1DQUFBO0VBQUE7Ozs7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxVQUFBLEdBQWEsT0FBQSxDQUFTLHlCQUFUOztBQUVQOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQUNMLGNBQUEsR0FBZ0IsT0FBQSxD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldHNcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdFNlbGVjdCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc2VsZWN0XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3RSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfcmFuZ2VcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcbkZjdEV2ZW50ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9ldmVudFwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKCBudWxsLCBvcHRpb25zIClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0QHZpZXcgPSBuZXcgTWFpblZpZXcoIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cyApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQgaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X3JldC5wdXNoIF9mY3RcblxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0IClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKS0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJzZWxlY3RcIiB0aGVuIHJldHVybiBuZXcgRmN0U2VsZWN0KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwicmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0UmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJkYXRlcmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0RGF0ZVJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZXZlbnRcIiB0aGVuIHJldHVybiBuZXcgRmN0RXZlbnQoIGZhY2V0LCBtYWluOiBAIClcblxuXHRhZGRGYWNldDogKCBmYWNldCApPT5cblx0XHRpZiBub3QgQGZhY2V0cz9cblx0XHRcdHJldHVyblxuXHRcdGlmICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdEBmYWNldHMuYWRkKCBfZmN0IClcblx0XHRyZXR1cm4gQFxuXG5cdF9lcnJvcjogKCB0eXBlLCBkYXRhID0ge30gKT0+XG5cdFx0aWYgQGVycm9yc1sgdHlwZSBdP1xuXHRcdFx0X21zZyA9IEBlcnJvcnNbIHR5cGUgXSggZGF0YSApXG5cdFx0ZWxzZVxuXHRcdFx0X21zZyA9IFwiLVwiXG5cdFx0X2VyciA9IG5ldyBFcnJvcigpXG5cdFx0X2Vyci5uYW1lID0gdHlwZVxuXHRcdF9lcnIubWVzc2FnZSA9IF9tc2dcblx0XHRyZXR1cm4gX2VyclxuXG5cdGdldFF1ZXJ5OiA9PlxuXHRcdHJldHVybiBAcmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0QHRyaWdnZXIoIFwiY2hhbmdlXCIsIEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfaW5pdEVycm9yczogPT5cblx0XHRAZXJyb3JzID0ge31cblx0XHRmb3IgX2ssIF90bXBsIG9mIEBFUlJPUlMoKVxuXHRcdFx0QGVycm9yc1sgX2sgXSA9IF8udGVtcGxhdGUoIF90bXBsIClcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6IC0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1lcbiIsIiMjI1xuRVhBTVBMRSBVU0FHRVxuXG5cdHBhcmVudENvbGwgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbi5TdWIoKVxuXHRcblx0IyBieSBBcnJheVxuXHRzdWJDb2xsQSA9IHBhcmVudENvbGwuc3ViKCBbIDEsIDIsIDMgXSApXG5cdFxuXHQjIG9yIGJ5IE9iamVjdFxuXHRzdWJDb2xsTyA9IHBhcmVudENvbGwuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscyApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICktPlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWJcbiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBhdHRycywgb3B0aW9ucyApLT5cblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRkZWZhdWx0czogLT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcIm5hbWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cblx0Y29tcGFyYXRvcjogKCBtZGwgKS0+XG5cdFx0cmV0dXJuIG1kbC5pZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0QmFzZVxuIiwiY2xhc3MgRmN0RGF0ZVJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2RhdGVyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0czoge31cblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0RGF0ZVJhbmdlXG4iLCJjbGFzcyBGY3RFdmVudCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiBudWxsXG5cdG9ubHlFeGVjOiB0cnVlXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XG5cdGV4ZWM6ICggKT0+XG5cdFx0QG1haW4udHJpZ2dlciggQGdldCggXCJldmVudFwiICksIEB0b0pTT04oKSApXG5cdFx0cmV0dXJuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEV2ZW50XG4iLCJjbGFzcyBGY3ROdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VibnVtYmVyXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3ROdW1iZXJcbiIsImNsYXNzIEZjdFJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RSYW5nZVxuIiwiY2xhc3MgRmN0U2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnNlbGVjdFwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTZWxlY3RcbiIsImNsYXNzIEZjdFN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmdcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nXG4iLCJjbGFzcyBJZ2d5RmFjZXRzIGV4dGVuZHMgcmVxdWlyZSggXCIuL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWxJZDogKGF0dHJzKS0+XG5cdFx0cmV0dXJuIGF0dHJzLm5hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5RmFjZXRzXG4iLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBudWxsXG5cdFx0dmFsdWU6IG51bGxcblxuY2xhc3MgSWdneVJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdGluaXRpYWxpemU6ICggbWRscywgb3B0cyApPT5cblx0XHRpZiBvcHRzLm1vZGlmeUtleT8ubGVuZ3RoXG5cdFx0XHRAbW9kaWZ5S2V5ID0gb3B0cy5tb2RpZnlLZXlcblx0XHRyZXR1cm5cblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfa2V5ID0gb3B0aW9ucy5fZmFjZXQuZ2V0KCBcIm1vZGlmeUtleVwiICkgb3IgQG1vZGlmeUtleSBvciBcInZhbHVlXCJcblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyWyBfa2V5IF0gPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBvcHRpb25zLl9mYWNldCwgYXR0ciApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0c1xuIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiLVwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzXG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvciwgb3BlcmF0b3JzLCB1bmRlZmluZWQsIHZhbHVlKSB7XG5pZiAoIG9wZXJhdG9ycyAmJiBvcGVyYXRvcnMubGVuZ3RoKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+PHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiKTtcbi8vIGl0ZXJhdGUgb3BlcmF0b3JzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wZXJhdG9ycztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yOnR5cGVvZiBvcGVyYXRvciE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3I6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJhbmdlaW5wXFxcIj5cIik7XG52YXIgX3ZhbHMgPSB2YWx1ZSA/IHZhbHVlIDogW11cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfZnJvbVwiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzBdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtZnJvbVxcXCIvPjxzcGFuIGNsYXNzPVxcXCJzZXBhcmF0b3JcXFwiPi08L3NwYW4+PGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfdG9cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1sxXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLXRvXFxcIi8+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG47cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG11bHRpcGxlLCBvcHRpb25Hcm91cHMsIG9wdGlvbnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIG11bHRpcGxlPVxcXCJtdWx0aXBsZVxcXCIgY2xhc3M9XFxcInNlbGVjdC1pbnBcXFwiPlwiKTtcbmlmICggb3B0aW9uR3JvdXBzKVxue1xuLy8gaXRlcmF0ZSBvcHRpb25Hcm91cHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9uR3JvdXBzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgZ25hbWUgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGduYW1lIDwgJCRsOyBnbmFtZSsrKSB7XG4gICAgICB2YXIgb3B0cyA9ICQkb2JqW2duYW1lXTtcblxuYnVmLnB1c2goXCI8b3B0Z3JvdXBcIiArIChqYWRlLmF0dHIoXCJsYWJlbFwiLCBnbmFtZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPjwvb3B0Z3JvdXA+XCIpO1xuLy8gaXRlcmF0ZSBvcHRzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgZ25hbWUgaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZVxue1xuLy8gaXRlcmF0ZSBvcHRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbmlmICggbXVsdGlwbGUpXG57XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJidG4gYnRuLXhzIGJ0bi1zdWNjZXNzIHNlbGVjdC1jaGVjayBmYSBmYS1jaGVja1xcXCI+PC9zcGFuPlwiKTtcbn19LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJtdWx0aXBsZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubXVsdGlwbGU6dHlwZW9mIG11bHRpcGxlIT09XCJ1bmRlZmluZWRcIj9tdWx0aXBsZTp1bmRlZmluZWQsXCJvcHRpb25Hcm91cHNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbkdyb3Vwczp0eXBlb2Ygb3B0aW9uR3JvdXBzIT09XCJ1bmRlZmluZWRcIj9vcHRpb25Hcm91cHM6dW5kZWZpbmVkLFwib3B0aW9uc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uczp0eXBlb2Ygb3B0aW9ucyE9PVwidW5kZWZpbmVkXCI/b3B0aW9uczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzZWxlY3Rvci1pbnBcXFwiLz48dWxcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcInR5cGVsaXN0XCIsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHlwZWxpc3RcXFwiPjwvdWw+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHNlbGVjdGVkLCB1bmRlZmluZWQpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9kaXY+PHNwYW4gY2xhc3M9XFxcInN1YmxhYmVsXFxcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBsYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiOjwvc3Bhbj48dWwgY2xhc3M9XFxcInN1YnJlc3VsdHNcXFwiPlwiKTtcbmlmICggc2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBzZWxlY3RlZFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzZWxlY3RlZDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjxkaXYgY2xhc3M9XFxcInN1YnNlbGVjdFxcXCI+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwibGFiZWxcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxhYmVsOnR5cGVvZiBsYWJlbCE9PVwidW5kZWZpbmVkXCI/bGFiZWw6dW5kZWZpbmVkLFwic2VsZWN0ZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnNlbGVjdGVkOnR5cGVvZiBzZWxlY3RlZCE9PVwidW5kZWZpbmVkXCI/c2VsZWN0ZWQ6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImFkZC1mYWNldC1idG4gZmEgZmEtcGx1c1xcXCI+PC9kaXY+XCIpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsIm1vZHVsZS5leHBvcnRzID1cblx0XCJMRUZUXCI6IDM3XG5cdFwiUklHSFRcIjogMzlcblx0XCJVUFwiOiAzOFxuXHRcIkRPV05cIjogNDBcblx0XCJFU0NcIjogWyAyMjksIDI3IF1cblx0XCJFTlRFUlwiOiAxM1xuXHRcIlRBQlwiOiA5XG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5TdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgRmFjZXRTdWJzQmFzZSBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0cmVzdWx0VGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmVzdWx0X2Jhc2UuamFkZVwiIClcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHN1YiA9IG9wdGlvbnMuc3ViXG5cdFx0QHJlc3VsdCA9IG5ldyBTdWJSZXN1bHRzKClcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblxuXHRmb2N1czogPT5cblx0XHRAJGlucC5mb2N1cygpXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuVEFCIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5UQUJcblx0XHRcdEBfb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRjaWQ6IEBjaWRcblx0XHR2YWx1ZTogQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH1cIlxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAcmVuZGVyKClcblx0XHRwVmlldy5vcGVuKClcblx0XHRyZXR1cm5cblx0XG5cdHJlbmRlcjogPT5cblx0XHRfdG1wbCA9IEB0ZW1wbGF0ZSggIEBnZXRUZW1wbGF0ZURhdGEoKSApXG5cdFx0QCRlbC5odG1sKCBfdG1wbCApXG5cdFx0QCRpbnAgPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoKSApXG5cdFx0JCggZG9jdW1lbnQgKS5vbiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggdHJ1ZSApXG5cdFx0cmV0dXJuXG5cdFxuXHRfaGFzVGFiRXZlbnQ6IC0+XG5cdFx0cmV0dXJuIFwia2V5ZG93blwiXG5cdFx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gdHJ1ZVxuXHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0JCggZG9jdW1lbnQgKS5vZmYgQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBfaGFzVGFiTGlzdGVuZXIoIGZhbHNlIClcblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcIm9wZW5cIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGlzT3BlbiA9IGZhbHNlXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6IC0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0X2NoZWNrU2VsZWN0RW1wdHk6ICggX3ZhbCApPT5cblx0XHRpZiBfLmlzRW1wdHkoIF92YWwgKSBhbmQgbm90IF8uaXNOdW1iZXIoIF92YWwgKSBhbmQgbm90IF8uaXNCb29sZWFuKCBfdmFsIClcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHNlbGVjdDogPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRyZXR1cm4gaWYgQF9jaGVja1NlbGVjdEVtcHR5KCBfdmFsIClcblx0XHRAc2V0KCBfdmFsIClcblx0XHRyZXR1cm5cblxuXHRzZXQ6ICggdmFsICk9PlxuXHRcdF9tb2RlbCA9IEByZXN1bHQuZmlyc3QoKVxuXHRcdGlmIG5vdCBfbW9kZWw/XG5cdFx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiB2YWwgKVxuXHRcdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0ZWxzZVxuXHRcdFx0X21vZGVsLnNldCggdmFsdWU6IHZhbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzQmFzZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNEYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvZGF0ZXJhbmdlLmphZGVcIiApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Zm9yY2VkRGF0ZVJhbmdlT3B0czpcblx0XHRvcGVuczogXCJyaWdodFwiXG5cblx0ZXZlbnRzOiA9PlxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0aWYgbm90IEBkYXRlcmFuZ2VwaWNrZXI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgQGZvcmNlZERhdGVSYW5nZU9wdHMgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRcdEAkaW5wLm9uKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblxuXHRcdGVsc2Vcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKSBpZiBfcmVzLnZhbHVlWyAxIF0/XG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIF9wcmVkZWZWYWw/XG5cdFx0XHRpZiBub3QgXy5pc0FycmF5KCBfcHJlZGVmVmFsIClcblx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0WyBAc3RhcnREYXRlLCBAZW5kRGF0ZSBdID0gX3ByZWRlZlZhbFxuXHRcdFx0cmV0dXJuIF9wcmVkZWZWYWxcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldE51bWJlckJhc2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAc2V0TnVtYmVyID0gXy50aHJvdHRsZSggQF9zZXROdW1iZXIsIDMwMCwge2xlYWRpbmc6IGZhbHNlLCB0cmFpbGluZzogZmFsc2V9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdF8kZWwgPSAkKCBldm50LmN1cnJlbnRUYXJnZXQgKVxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICksIF8kZWwgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSAqIC0xLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleXVwXCJcblx0XHRcdF92ID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnJlcGxhY2UoIC9bXlxcZF0/W14tXFxkXSsvZywgXCJcIiApXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXHRcdFx0IFxuXHRcdFx0QHNldE51bWJlciggX3YsIF8kZWwgKVxuXHRcdHJldHVyblxuXG5cdGNyZW1lbnQ6ICggY2hhbmdlLCBlbCA9IEAkaW5wICk9PlxuXHRcdF92ID0gZWwudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0X3YgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0XHRAX3NldE51bWJlciggX3YgKyBjaGFuZ2UsIGVsIClcblx0XHRyZXR1cm5cblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0cmV0dXJuIHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdF9zZXROdW1iZXI6ICggX3YsIGVsID0gQCRpbnAgKT0+XG5cdFx0aWYgaXNOYU4oIF92IClcblx0XHRcdCNAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X2N1cnIgPSBlbC52YWwoKVxuXG5cdFx0X3YgPSBAdmFsdWVCeURlZmluaXRpb24oIF92KVxuXHRcdGlmIF9jdXJyICE9IF92LnRvU3RyaW5nKClcblx0XHRcdGVsLnZhbCggX3YgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSApLT5cblx0XHRtYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRtaW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRzdGVwID0gQG1vZGVsLmdldCggXCJzdGVwXCIgKVxuXHRcdFxuXHRcdCMgZml4IHJldmVyc2VkIG1pbi9tYXggc2V0dGluZ1xuXHRcdGlmIG1pbiA+IG1heFxuXHRcdFx0X3RtcCA9IG1pblxuXHRcdFx0bWluID0gbWF4XG5cdFx0XHRtYXggPSBfdG1wXG5cdFx0XG5cdFx0IyBvbiBleHhlZGRpbmcgdGhlIGxpbWl0cyB1c2UgdGhlIGxpbWl0XG5cdFx0aWYgbWluPyBhbmQgX3ZhbHVlIDwgbWluXG5cdFx0XHRyZXR1cm4gbWluXG5cdFx0aWYgbWF4PyBhbmQgX3ZhbHVlID4gbWF4XG5cdFx0XHRyZXR1cm4gbWF4XG5cblx0XHQjIHNlYXJjaCB0aGUgbmVhcmVzdCBfdmFsdWUgdG8gdGhlIHN0ZXBcblx0XHRpZiBzdGVwIGlzbnQgMVxuXHRcdFx0X3ZhbHVlID0gbmVhcmVzdCggX3ZhbHVlLCBzdGVwIClcblx0XHRcblx0XHQjIGNhbGMgdGhlIHByZWNpc2lvbiBieSBzdGVwXG5cdFx0X3ByZWNpc2lvbiA9IE1hdGgubWF4KCAwLCBNYXRoLmNlaWwoIE1hdGgubG9nKCAxL3N0ZXAgKSAvIE1hdGgubG9nKCAxMCApICkgKVxuXHRcdGlmIF9wcmVjaXNpb24gPiAwXG5cdFx0XHRfdmFsdWUgPSBwcmVjaXNpb24oIF92YWx1ZSwgX3ByZWNpc2lvbiApXG5cdFx0ZWxzZVxuXHRcdFx0X3ZhbHVlID0gTWF0aC5yb3VuZCggX3ZhbHVlIClcblx0XHRcdFxuXHRcdHJldHVybiBfdmFsdWVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0TnVtYmVyQmFzZVxuIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5cbmNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgQXJyYXlPcHRpb25zIGV4dGVuZHMgcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQXJyYXlPcHRpb25cblxuY2xhc3MgRmFjZXRTdWJBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdG9wdERlZmF1bHQ6XG5cdFx0bGFiZWw6IFwiLVwiXG5cdFx0dmFsdWU6IFwiLVwiXG5cblx0c2VsZWN0Q291bnQ6IDBcblxuXHRvcHRDb2xsOiBTdHJpbmdPcHRpb25zXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgaW5wdXQjI3tAY2lkfVwiIF0gPSBcImNsb3NlXCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdGlmIG9wdGlvbnMubW9kZWwuZ2V0KCBcImNvdW50XCIgKT9cblx0XHRcdEBzZWxlY3RDb3VudCA9IG9wdGlvbnMubW9kZWwuZ2V0KCBcImNvdW50XCIgKVxuXHRcdG9wdGlvbnMuY3VzdG9tID0gdHJ1ZVxuXHRcdGlmIG9wdGlvbnMubW9kZWwuZ2V0KCBcImN1c3RvbVwiICk/XG5cdFx0XHRvcHRpb25zLmN1c3RvbSA9IEJvb2xlYW4oIG9wdGlvbnMubW9kZWwuZ2V0KCBcImN1c3RvbVwiICkgKVxuXHRcdFx0XG5cdFx0QGNvbGxlY3Rpb24gPSBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIG9wdGlvbnMubW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRcblx0XHRpZiBub3Qgb3B0aW9ucy5jdXN0b20gYW5kIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRAc2VsZWN0Q291bnQgPSBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdFxuXHRcdHN1cGVyKCBvcHRpb25zIClcblx0XHRyZXR1cm5cblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XHRcblx0c2VsZWN0OiA9PlxuXHRcdF92YWxzID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBfdmFscz8gYW5kIG5vdCBfLmlzQXJyYXkoIF92YWxzIClcblx0XHRcdF92YWxzID0gWyBfdmFscyBdXG5cdFx0Zm9yIF92YWwgaW4gKCBpZiBAc2VsZWN0Q291bnQgPD0gMCB0aGVuIF92YWxzIGVsc2UgX3ZhbHNbLi4uQHNlbGVjdENvdW50XSApXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRzZWFyY2hDb250ZW50ID0gQCRpbnAudmFsKClcblx0XHRpZiBzZWFyY2hDb250ZW50Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RBY3RpdmUoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XHRcblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0cmV0dXJuIG9wdGlvbnMoIEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiApXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3Qob3B0KVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIG5ldyBAb3B0Q29sbCggX29wdHMgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheVxuIiwiY2xhc3MgRmFjZXRTdWJzTnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRcdEAkaW5wT3AucmVtb3ZlKClcblx0XHRcdEAkaW5wT3AgPSBudWxsXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8ucmVsYXRlZFRhcmdldD9cblx0XHRcdF9wb3NXcnAgPSBAZWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgKVxuXHRcdFx0aWYgbm90ICggX3Bvc1dycCBpcyAwIG9yIF9wb3NXcnAgLSAxNiA+PSAwIClcblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRpZiBldm50PyBhbmQgKCBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wLmdldCgwKSBvciBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wT3A/LmdldCgwKSApXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QG1vZGVsLnNldCggeyBvcGVyYXRvcjogQCRpbnBPcC52YWwoKSB9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblxuXHRfb3BTZWxlY3RlZDogPT5cblx0XHRAc2VsZWN0ZWRPUCA9IHRydWVcblx0XHRAZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdGlmIEAkaW5wT3A/IGFuZCBub3QgQHNlbGVjdGVkT1Bcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRfb2xkT3AgPSBAcmVzdWx0LmZpcnN0KClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICksIG9wZXJhdG9yOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKX0gKVxuXG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3AudmFsKClcblx0XHRlbHNlXG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyXG4iLCJjbGFzcyBGYWNldFN1YnNSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmFuZ2UuamFkZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ICggZXh0ID0gXCJfZnJvbVwiICk9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH0je2V4dH1cIlxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcInNlbGVjdFwiXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRyZXR1cm4gXCI8bGk+XCIgK19yZXMudmFsdWUuam9pbiggXCIgLSBcIiApICsgXCI8L2xpPlwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRpbnBUbyA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBUby5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGNsb3NlOiA9PlxuXHRcdHRyeVxuXHRcdFx0QCQoIFwiLnJhbmdlaW5wXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHRfcmV0ID1cblx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdkZyb20gPSBzdXBlclxuXHRcdF92ID0gQCRpbnBUby52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdF92VG8gPSBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRcdHJldHVybiBbIF92RnJvbSwgX3ZUbyBdXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRpZiBfdmFsPy5sZW5ndGggPj0gMlxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzU2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3NlbGVjdC5qYWRlXCIgKVxuXG5cdGZvcmNlZE1vZHVsZU9wdHM6e31cblx0I1x0bXVsdGlwbGU6IHRydWVcblxuXHRkZWZhdWx0TW9kdWxlT3B0czpcblx0XHQjbWF4aW11bVNlbGVjdGlvbkxlbmd0aDogMVxuXHRcdHdpZHRoOiBcImF1dG9cIlxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSB7fVxuXHRcdF9ldm50c1sgXCJjbGljayAuc2VsZWN0LWNoZWNrXCIgXSA9IFwic2VsZWN0XCIgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcInNlbGVjdCMje0BjaWR9XCJcblx0XHRcblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHRAX2luaXRTZWxlY3QyKClcblx0XHRAc2VsZWN0Mi5vcGVuKClcblx0XHQjZWxzZVxuXHRcdFx0I0AkaW5wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRyZXR1cm5cblxuXHRfaW5pdFNlbGVjdDI6ID0+XG5cdFx0aWYgbm90IEBzZWxlY3QyP1xuXHRcdFx0X29wdHMgPSBfLmV4dGVuZCgge30sIEBkZWZhdWx0TW9kdWxlT3B0cywgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICkgfSwgQGZvcmNlZE1vZHVsZU9wdHMgKVxuXHRcdFx0QCRpbnAuc2VsZWN0MiggX29wdHMgKVxuXHRcdFx0QHNlbGVjdDIgPSBAJGlucC5kYXRhKCBcInNlbGVjdDJcIiApXG5cdFx0XHRpZiBub3QgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRcdFx0QCRpbnAub24gXCJzZWxlY3QyOnNlbGVjdFwiLCBAc2VsZWN0XG5cdFx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLm9uIFwiY2xpY2tcIiwgQF9zZWwyb3BlblxuXHRcdFx0QHNlbGVjdDIuJGVsZW1lbnQuaGlkZSgpXG5cdFx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVyblxuXG5cdF9zZWwyb3BlbjogKCBldm50ICktPlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdHJlbW92ZTogPT5cblx0XHQjQCRpbnAuc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IF8uZXh0ZW5kKCB7fSwgc3VwZXIsIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApLCBvcHRpb25zOiBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKSB9IClcblx0XHRpZiBfZGF0YS52YWx1ZT8gYW5kIG5vdCBfLmlzQXJyYXkoIF9kYXRhLnZhbHVlIClcblx0XHRcdF9kYXRhLnZhbHVlID0gWyBfZGF0YS52YWx1ZSBdXG5cblx0XHRpZiBfZGF0YS52YWx1ZT9cblx0XHRcdGZvciBfdiBpbiBfZGF0YS52YWx1ZSB3aGVuIF92IG5vdCBpbiBfLnBsdWNrKCBfZGF0YS5vcHRpb25zLCBcInZhbHVlXCIgKVxuXHRcdFx0XHRfZGF0YS5vcHRpb25zLnB1c2ggeyB2YWx1ZTogX3YsIGxhYmVsOiBfdiwgZ3JvdXA6IG51bGwgfVxuXHRcdFxuXHRcdF9ncm91cHMgPSBfLmdyb3VwQnkoIF9kYXRhLm9wdGlvbnMsIFwiZ3JvdXBcIiApXG5cdFx0aWYgXy5jb21wYWN0KCBfLmtleXMoIF9ncm91cHMgb3Ige30gKSApLmxlbmd0aCA+IDFcblx0XHRcdF9kYXRhLm9wdGlvbkdyb3VwcyA9IF9ncm91cHNcblx0XHRyZXR1cm4gX2RhdGFcblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogKCBjcmVhdGUgKT0+XG5cdFx0aWYgY3JlYXRlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gQG1vZGVsLmdldChcIm11bHRpcGxlXCIpXG5cdFxuXHRfaGFzVGFiRXZlbnQ6IC0+XG5cdFx0cmV0dXJuIFwia2V5dXBcIlxuXHRcdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdmFscyA9IFtdXG5cdFx0Zm9yIGRhdGEgaW4gQHNlbGVjdDI/LmRhdGEoKSBvciBbXVxuXHRcdFx0X2RhdGEgPSB7fVxuXHRcdFx0X2RhdGEudmFsdWUgPSBkYXRhLmlkXG5cdFx0XHRfZGF0YS5sYWJlbCA9IGRhdGEudGV4dCBpZiBkYXRhLnRleHQ/XG5cdFx0XHRfdmFscy5wdXNoKCBfZGF0YSApXG5cdFx0cmV0dXJuIF92YWxzXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0LCBncm91cDogbnVsbCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3QoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblxuXHRcdHJldHVybiBfb3B0c1xuXG5cdHVuc2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0QHJlc3VsdC5yZW1vdmUoIGV2bnQucGFyYW1zPy5kYXRhPy5pZCApXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0QHNlbGVjdDI/LmRlc3Ryb3koKVxuXHRcdEAkaW5wPy5yZW1vdmUoKVxuXHRcdEAkKCBcIi5zZWxlY3QtY2hlY2tcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKCkgaWYgZXZudD8uc3RvcFByb3BhZ2F0aW9uXG5cdFx0X3ZhbHMgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0TW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0Zm9yIF92YWwgaW4gX3ZhbHNcblx0XHRcdEByZXN1bHQuYWRkKCBuZXcgTW9kZWxDb25zdCggX3ZhbCApIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAcmVzdWx0IClcblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzU2VsZWN0XG4iLCJjbGFzcyBGYWNldFN1YlN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zdHJpbmcuamFkZVwiIClcblx0XG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJzZWxlY3RcIlxuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0c3VwZXJcblx0XHR0cnlcblx0XHRcdEAkaW5wPy5yZW1vdmUoKVxuXHRcdHJldHVyblxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdF9vbGRWYWwgPSBAcmVzdWx0LmZpcnN0KCkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3ViU3RyaW5nXG4iLCJTdWJWaWV3ID0gcmVxdWlyZSggXCIuL3N1YlwiIClcblNlbGVjdG9yVmlldyA9IHJlcXVpcmUoIFwiLi9zZWxlY3RvclwiIClcblxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBNYWluVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvd3JhcHBlci5qYWRlXCIgKVxuXG5cdGV2ZW50czpcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0XG5cdFx0QHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcblxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cdFx0XG5cdFx0X2NsID0gXCJpZ2d5IGNsZWFyZml4XCJcblx0XHRpZiBAZWwuY2xhc3NOYW1lPy5sZW5ndGhcblx0XHRcdF9jbCA9IFwiIFwiICsgX2NsXG5cdFx0QGVsLmNsYXNzTmFtZSArPSBfY2xcblx0XHRAcmVuZGVyKClcblx0XHQkKCBkb2N1bWVudCApLm9uIFwia2V5dXBcIiwgQF9vbktleVxuXHRcdEBfb3V0ZXJDbGlja0xpc3RlbigpXG5cdFx0XG5cdFx0Zm9yIGZjdCBpbiBAY29sbGVjdGlvbi5maWx0ZXIoICggZmN0ICktPnJldHVybiBmY3Q/LmdldCggXCJ2YWx1ZVwiICk/IClcblx0XHRcdHN1YnZpZXcgPSBAZ2VuU3ViKCBmY3QsIGZhbHNlIClcblx0XHRcblx0XHRAY29sbGVjdGlvbi5vbiBcImFkZFwiLCA9PlxuXHRcdFx0QCRhZGRCdG4uc2hvdygpXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW5kZXI6ID0+XG5cdFx0QCRlbC5odG1sKCBAdGVtcGxhdGUoKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRyZXR1cm5cblxuXHRfYWRkRmFjZXQ6ICggZXZudCApPT5cblx0XHRAYWRkRmFjZXQoKVxuXHRcdHJldHVyblxuXG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5FU0Mgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0QGV4aXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRleGl0OiAoIG5leHRBZGQgPSB0cnVlICk9PlxuXHRcdGlmIEBzdWJ2aWV3XG5cdFx0XHRAc3Vidmlldy5jbG9zZSgpXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIG5leHRBZGRcblx0XHRcblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVtRmFjZXQ6ICggZmFjZXRNICk9PlxuXHRcdEByZXN1bHRzLnJlbW92ZSggZmFjZXRNLmdldCggXCJuYW1lXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0c2V0RmFjZXQ6ICggZmFjZXRNLCBkYXRhICk9PlxuXHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdEByZXN1bHRzLmFkZCggXy5leHRlbmQoIGRhdGEsIHsgbmFtZTogZmFjZXRNLmdldCggXCJuYW1lXCIgKSwgdHlwZTogZmFjZXRNLmdldCggXCJ0eXBlXCIgKSB9ICksIHsgbWVyZ2U6IHRydWUsIHBhcnNlOiB0cnVlLCBfZmFjZXQ6IGZhY2V0TSB9IClcblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRAJGFkZEJ0bi5oaWRlKClcblx0XHRyZXR1cm5cblxuXHRnZW5TdWI6ICggZmFjZXRNLCBhZGRBZnRlciA9IHRydWUgKT0+XG5cdFx0c3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiApXG5cdFx0XG5cdFx0c3Vidmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVUIgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHQjc3Vidmlldy5vZmYoKVxuXHRcdFx0c3Vidmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIGFkZEFmdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwicmVvcGVuXCIsID0+XG5cdFx0XHRAc2VsZWN0dmlldz8uY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRzdWJ2aWV3Lm9uKCBcInNlbGVjdGVkXCIsIEBzZXRGYWNldCApXG5cdFx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBzdWJ2aWV3LnJlbmRlcigpIClcblx0XHRyZXR1cm4gc3Vidmlld1xuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNFTEVDVCBFWElTVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBzdWJ2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNVQiBFWElTVFwiXG5cdFx0XHRAc3Vidmlldy5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSApXG5cblx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpXG5cdFx0XHRAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdGlmIG5vdCByZXN1bHRzPy5sZW5ndGggYW5kIEBzdWJ2aWV3P1xuXHRcdFx0XHQjQHN1YnZpZXcub2ZmKClcblx0XHRcdFx0QHN1YnZpZXcucmVtb3ZlKClcblx0XHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0gKT0+XG5cdFx0XHRmYWNldE0uc2V0KCBcInZhbHVlXCIsIG51bGwgKVxuXHRcdFx0QHN1YnZpZXcgPSBAZ2VuU3ViKCBmYWNldE0gKVxuXHRcdFx0QHN1YnZpZXcub3BlbigpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdF9vdXRlckNsaWNrTGlzdGVuOiA9PlxuXHRcdGpRdWVyeSggZG9jdW1lbnQgKS5vbiBcImNsaWNrXCIsIEBfb3V0ZXJDbGlja1xuXHRcdHJldHVyblxuXG5cdF9vdXRlckNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdF9wb3NXcnAgPSBAZWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGV2bnQudGFyZ2V0IClcblx0XHRpZiBub3QgKCBfcG9zV3JwIGlzIDAgb3IgX3Bvc1dycCAtIDE2ID49IDAgKVxuXHRcdFx0QGV4aXQoIGZhbHNlIClcblx0XHRyZXR1cm5cblx0XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblZpZXdcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU2VsZWN0b3JWaWV3IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0cy9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3Rvci5qYWRlXCIgKVxuXHR0ZW1wbGF0ZUVsOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9ybGkuamFkZVwiIClcblx0c2VsZWN0Q291bnQ6IDFcblxuXHRjbGFzc05hbWU6ID0+XG5cdFx0Y2xzID0gWyBcImFkZC1mYWNldFwiIF1cblx0XHRpZiBAY3VzdG9tXG5cdFx0XHRjbHMucHVzaCBcImN1c3RvbVwiXG5cdFx0cmV0dXJuIGNscy5qb2luKCBcIiBcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwibW91c2Vkb3duIGFcIjogXCJfb25DbGlja1wiXG5cdFx0XCJmb2N1cyBpbnB1dCMje0BjaWR9XCI6IFwib3BlblwiXG5cdFx0I1wiYmx1ciBpbnB1dCMje0BjaWR9XCI6IFwiY2xvc2VcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblx0XHRcImtleXVwIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0QGN1c3RvbSA9ICBvcHRpb25zLmN1c3RvbSBvciBmYWxzZVxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QGN1cnJRdWVyeSA9IFwiXCJcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHNlYXJjaGNvbGwgPSBAY29sbGVjdGlvbi5zdWIoIC0+dHJ1ZSApXG5cdFx0QHJlc3VsdCA9IG5ldyBAY29sbGVjdGlvbi5jb25zdHJ1Y3RvcigpXG5cdFx0XG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJhZGRcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQGNoZWNrT3B0aW9uc0VtcHR5IClcblx0XHRcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgY3VzdG9tOiBAY3VzdG9tIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGxpc3QgPSBAJGVsLmZpbmQoIFwiIyN7QGNpZH10eXBlbGlzdFwiIClcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm4gQGVsXG5cblx0cmVuZGVyUmVzOiA9PlxuXHRcdEAkbGlzdC5lbXB0eSgpXG5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHNlYXJjaGNvbGwubW9kZWxzXG5cdFx0XHRfbGJsID0gbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0X2lkID0gbW9kZWwuaWRcblx0XHRcdF9jc3NjbGFzcyA9IG1vZGVsLmdldCggXCJjc3NjbGFzc1wiIClcblx0XHRcdGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCA+IDFcblx0XHRcdFx0X2xibCA9IF9sYmwucmVwbGFjZSggbmV3IFJlZ0V4cCggQGN1cnJRdWVyeSwgXCJnaVwiICksICgoIHN0ciApLT5yZXR1cm4gXCI8Yj4je3N0cn08L2I+XCIgKSApXG5cdFx0XHRfbGlzdC5wdXNoIGxhYmVsOiBfbGJsLCBpZDogX2lkLCBjc3NjbGFzczogX2Nzc2NsYXNzXG5cdFx0QCRsaXN0LmFwcGVuZCggQHRlbXBsYXRlRWwoIGxpc3Q6IF9saXN0LCBxdWVyeTogQGN1cnJRdWVyeSwgYWN0aXZlSWR4OiBAYWN0aXZlSWR4LCBjdXN0b206IEBjdXN0b20gKSApXG5cblx0XHRAX2NoZWNrU2Nyb2xsKClcblx0XHRcblx0XHRyZXR1cm4gQCRsaXN0XG5cblx0X3Njcm9sbFRpbGw6IDE5OFxuXHRfY2hlY2tTY3JvbGw6ID0+XG5cdFx0X2hlaWdodCA9IEAkbGlzdC5oZWlnaHQoKVxuXHRcdGlmIF9oZWlnaHQgPiAwXG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBfaGVpZ2h0IClcblx0XHRcdHJldHVyblxuXG5cdFx0IyBleGl0IHRoZSB0aGUgY2FsbCBzdGFjayB0byBjaGVjayBoZWlnaHQgYWZ0ZXIgdGhlIG1vZHVsZSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgZG9tXG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEBzY3JvbGxIZWxwZXIoIEAkbGlzdC5oZWlnaHQoKSApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblxuXHRzY3JvbGxIZWxwZXI6ICggaGVpZ2h0ICk9PlxuXHRcdGlmIGhlaWdodCA+PSBAX3Njcm9sbFRpbGxcblx0XHRcdEBzY3JvbGxpbmcgPSB0cnVlXG5cdFx0ZWxzZVxuXHRcdFx0QHNjcm9sbGluZyA9IGZhbHNlXG5cdFx0cmV0dXJuXG5cblx0Y2hlY2tPcHRpb25zRW1wdHk6ID0+XG5cdFx0I2lmIEBzZWFyY2hjb2xsLmxlbmd0aCA8PSAwXG5cdFx0I1x0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRfb25DbGljazogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblxuXHRcdF9pZCA9IEAkKCBldm50LmN1cnJlbnRUYXJnZXQgKS5kYXRhKCBcImlkXCIgKVxuXHRcdGlmIG5vdCBfaWQ/XG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF9tZGwgPSBAY29sbGVjdGlvbi5nZXQoIF9pZCApXG5cdFx0aWYgbm90IF9tZGw/XG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdHNlbGVjdGVkOiAoIG1kbCApPT5cblx0XHR0cnlcblx0XHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdFx0bWRsPy5leGVjPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdGNhdGNoIF9lcnJcblx0XHRcdHRyeVxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBhY3RpdmVJZHg6I3tAYWN0aXZlSWR4fSAtIGNvbGxlY3Rpb246I3tKU09OLnN0cmluZ2lmeSggQGNvbGxlY3Rpb24udG9KU09OKCkpfVwiXG5cdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIXCJcblx0XHRcblx0XHRpZiBtZGw/XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIG1kbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QG1vdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAbW92ZSggZmFsc2UgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdEFjdGl2ZSggdHJ1ZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9xID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKClcblx0XHRpZiBfcSBpcyBAY3VyclF1ZXJ5XG5cdFx0XHRyZXR1cm5cblxuXHRcdEBjdXJyUXVlcnkgPSBfcVxuXG5cdFx0QHNlYXJjaGNvbGwudXBkYXRlU3ViRmlsdGVyKCAoIG1kbCApPT5cblx0XHRcdGlmIEByZXN1bHQuZ2V0KCBtZGwuaWQgKT9cblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBub3QgX3E/Lmxlbmd0aFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0X21hdGNoID0gbWRsLm1hdGNoKCBfcSApXG5cdFx0XHRyZXR1cm4gX21hdGNoXG5cdFx0LCBmYWxzZSApXG5cblxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuXG5cblx0bW92ZTogKCB1cCA9IGZhbHNlICk9PlxuXHRcdF9saXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhXCIgKVxuXHRcblx0XHRfY3VzdG9tRWxlbWVudENoYW5nZSA9IGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCB0aGVuIDAgZWxzZSAxXG5cdFx0X3RvcCA9IDBcblx0XHRpZiB1cFxuXHRcdFx0aWYgKCBAYWN0aXZlSWR4IC0gMSApIDwgX3RvcFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4IC0gMVxuXHRcdGVsc2Vcblx0XHRcdGlmIEBzZWFyY2hjb2xsLmxlbmd0aCAtIF9jdXN0b21FbGVtZW50Q2hhbmdlIDw9IEBhY3RpdmVJZHhcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDFcblxuXHRcdFxuXHRcdEAkKCBfbGlzdFsgQGFjdGl2ZUlkeCBdICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXHRcdF8kZWxuZXcgPSBAJCggX2xpc3RbIF9uZXdpZHggXSApLmFkZENsYXNzKCBcImFjdGl2ZVwiIClcblxuXHRcdGlmIEBzY3JvbGxpbmdcblx0XHRcdF9lbEggPSBfJGVsbmV3Lm91dGVySGVpZ2h0KClcblx0XHRcdF9wb3MgPSBfZWxIICogKCBfbmV3aWR4ICsgMSApXG5cdFx0XHRfJGxpc3QgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0XCIgKVxuXHRcdFx0X3Njcm9sbFQgPSBfJGxpc3Quc2Nyb2xsVG9wKClcblx0XHRcdGlmIF9wb3MgPiBfc2Nyb2xsVCArIEBfc2Nyb2xsVGlsbFxuXHRcdFx0XHRfJGxpc3Quc2Nyb2xsVG9wKCBfcG9zIC0gQF9zY3JvbGxUaWxsIClcblx0XHRcdGVsc2UgaWYgX3BvcyA8IF9zY3JvbGxUICsgX2VsSFxuXHRcdFx0XHRfJGxpc3Quc2Nyb2xsVG9wKCBfcG9zIC0gX2VsSCApXG5cblx0XHRAYWN0aXZlSWR4ID0gX25ld2lkeFxuXHRcdHJldHVyblxuXG5cdHNlbGVjdDo9PlxuXHRcdHJldHVyblxuXG5cdHNlbGVjdEFjdGl2ZTogKCBpc0VudGVyRXZlbnQ9ZmFsc2UgKT0+XG5cdFx0XG5cdFx0X3NlbCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYS5hY3RpdmVcIiApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiICkuZGF0YSgpXG5cdFx0XHRcblx0XHRfc2VhcmNoID0gQCRpbnAudmFsKClcblx0XHRcblx0XHRpZiAgbm90IF9zZWw/IGFuZCBAc2VsZWN0Q291bnQgaXNudCAxIGFuZCBpc0VudGVyRXZlbnQgYW5kIG5vdCBfc2VhcmNoPy5sZW5ndGhcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIG5vdCBfc2VsP1xuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRpZiBfc2VsPy5pZHggPj0gMCBhbmQgQHNlYXJjaGNvbGwubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIEBjb2xsZWN0aW9uLmdldCggX3NlbC5pZCApIClcblx0XHRlbHNlIGlmIEBjdXJyUXVlcnk/Lmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBAY3VyclF1ZXJ5LCBjdXN0b206IHRydWUgKSApXG5cdFx0XHRAJGlucC52YWwoIFwiXCIgKVxuXHRcdGVsc2Vcblx0XHRcdHJldHVyblxuXHRcblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdG9yVmlld1xuIiwiY2xhc3MgVmlld1N1YiBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc3ViLmphZGVcIiApXG5cdGNsYXNzTmFtZTogXCJzdWJcIlxuXG5cdGluaXRpYWxpemU6ID0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdEByZXN1bHQgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpXG5cdFx0QCRlbC5vbiBcImNsaWNrXCIsIEByZW9wZW5cblx0XHRyZXR1cm5cblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblxuXHRyZW5kZXI6ICggb3B0TWRsICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0dHJ5XG5cdFx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0Y2F0Y2ggX2VyclxuXHRcdFx0XHR0cnlcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBtb2RlbDoje0pTT04uc3RyaW5naWZ5KEBtb2RlbC50b0pTT04oKSl9IC0gcmVzdWx0OiN7SlNPTi5zdHJpbmdpZnkoIEByZXN1bHQudG9KU09OKCkpfVwiXG5cdFx0XHRcdGNhdGNoIF9lcnJlcnJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSFwiXG5cdFx0XG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZSggbGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpLCBzZWxlY3RlZDogX2xpc3QgKVxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cdFx0cmV0dXJuIEBlbFxuXHRcblx0cmVvcGVuOiAoIGV2bnQgKT0+XG5cdFx0aWYgbm90IEBfaXNPcGVuIGFuZCBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3LnJlb3BlbiggQCApXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEB0cmlnZ2VyKCBcInJlb3BlblwiIClcblx0XHRyZXR1cm5cblx0XHRcblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdEBjb2xsZWN0aW9uLnRyaWdnZXIoIFwiaWdneTpyZW1cIiwgQG1vZGVsIClcblx0XHRAY29sbGVjdGlvbi5hZGQoIEBtb2RlbCApXG5cdFx0QHJlbW92ZSgpXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIgKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHJlbW92ZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0QHNlbGVjdHZpZXc/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0c2VsZWN0ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQuYWRkKCBvcHRNZGwsIHsgbWVyZ2U6IHRydWUgfSApXG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0cmV0dXJuXG5cblx0aXNPcGVuOiA9PlxuXHRcdHJldHVybiBAc2VsZWN0dmlldz9cblxuXHRmb2N1czogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHRAb3BlbigpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGdlbmVyYXRlU3ViOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRyZXR1cm4gQHNlbGVjdHZpZXdcblx0XHRcdFxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IEBtb2RlbC5TdWJWaWV3KCBzdWI6IEAsIG1vZGVsOiBAbW9kZWwsIGVsOiBAJHN1YiApXG5cdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRcblx0XHRAJGVsLmFwcGVuZCggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdGlmIEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKT9cblx0XHRcdEBzZWxlY3R2aWV3LnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGF0dGFjaFN1YkV2ZW50czogPT5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCApXG5cdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0b3BlbjogPT5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXG5cdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRAX2lzT3BlbiA9IHRydWVcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U3ViXG4iLG51bGwsIihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLmphZGUgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xuICB2YXIgYmMgPSBiWydjbGFzcyddO1xuXG4gIGlmIChhYyB8fCBiYykge1xuICAgIGFjID0gYWMgfHwgW107XG4gICAgYmMgPSBiYyB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XG59XG5cbi8qKlxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpIDpcbiAgICAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKHZhbCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHZhbFtrZXldOyB9KSA6XG4gICAgW3ZhbF0pLmZpbHRlcihudWxscykuam9pbignICcpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuc3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5tYXAoZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgIH0pLmpvaW4oJzsnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgIHZhbCA9IGV4cG9ydHMuc3R5bGUodmFsKTtcbiAgfVxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh2YWwpLmluZGV4T2YoJyYnKSAhPT0gLTEpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgJyArXG4gICAgICAgICAgICAgICAgICAgJ3dpbGwgYmUgZXNjYXBlZCB0byBgJmFtcDtgJyk7XG4gICAgfTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgJ0lTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGphZGVfZW5jb2RlX2h0bWxfcnVsZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7J1xufTtcbnZhciBqYWRlX21hdGNoX2h0bWwgPSAvWyY8PlwiXS9nO1xuXG5mdW5jdGlvbiBqYWRlX2VuY29kZV9jaGFyKGMpIHtcbiAgcmV0dXJuIGphZGVfZW5jb2RlX2h0bWxfcnVsZXNbY10gfHwgYztcbn1cblxuZXhwb3J0cy5lc2NhcGUgPSBqYWRlX2VzY2FwZTtcbmZ1bmN0aW9uIGphZGVfZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpLnJlcGxhY2UoamFkZV9tYXRjaF9odG1sLCBqYWRlX2VuY29kZV9jaGFyKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuXG5leHBvcnRzLkRlYnVnSXRlbSA9IGZ1bmN0aW9uIERlYnVnSXRlbShsaW5lbm8sIGZpbGVuYW1lKSB7XG4gIHRoaXMubGluZW5vID0gbGluZW5vO1xuICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG59XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiXX0=
