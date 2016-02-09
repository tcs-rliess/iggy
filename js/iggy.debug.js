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
    this.facets = this._prepareFacets(facets, options);
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

  IGGY.prototype._prepareFacets = function(facets, options) {
    var _fct, _idx, _ret, facet, i, len;
    if (options == null) {
      options = {};
    }
    _ret = [];
    for (_idx = i = 0, len = facets.length; i < len; _idx = ++i) {
      facet = facets[_idx];
      if (!((_fct = this._createFacet(facet)) != null)) {
        continue;
      }
      _fct._idx = _idx;
      _ret.push(_fct);
    }
    return new Facets(_ret, options);
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


},{"./models/facet_array":3,"./models/facet_daterange":5,"./models/facet_event":6,"./models/facet_number":7,"./models/facet_range":8,"./models/facet_select":9,"./models/facet_string":10,"./models/facets":11,"./models/results":12,"./views/main":34}],2:[function(require,module,exports){

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
    this._subCollecctionOptions = bind(this._subCollecctionOptions, this);
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
    _sub = new this.constructor(_models, this._subCollecctionOptions());
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
  	## _subCollecctionOptions
  	
  	`collection._subCollecctionOptions()`
  	
  	Overwritable method to set the constructor options for sub collections
  	
  	@return { Object } The options object
  	
  	@api private
   */

  BackboneSub.prototype._subCollecctionOptions = function() {
    return {};
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


},{"../views/facets/subarray":29,"./facet_string":10}],4:[function(require,module,exports){
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


},{"../views/facets/base":26}],5:[function(require,module,exports){
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


},{"../views/facets/daterange":27,"./facet_base":4}],6:[function(require,module,exports){
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


},{"../views/facets/subnumber":30,"./facet_base":4}],8:[function(require,module,exports){
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


},{"../views/facets/subrange":31,"./facet_base":4}],9:[function(require,module,exports){
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
      options: [],
      waitForAsync: true
    });
  };

  return FctSelect;

})(require("./facet_base"));

module.exports = FctSelect;


},{"../views/facets/subselect":32,"./facet_base":4}],10:[function(require,module,exports){
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


},{"../views/facets/substring":33,"./facet_base":4}],11:[function(require,module,exports){
var IggyFacets,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IggyFacets = (function(superClass) {
  extend(IggyFacets, superClass);

  function IggyFacets() {
    this.comparator = bind(this.comparator, this);
    this._subCollecctionOptions = bind(this._subCollecctionOptions, this);
    return IggyFacets.__super__.constructor.apply(this, arguments);
  }

  IggyFacets.prototype.initialize = function(models, options) {
    if (options == null) {
      options = {};
    }
    this.forward = (function() {
      switch (options.dir) {
        case "asc":
          return true;
        case "desc":
          return false;
        default:
          return true;
      }
    })();
    return IggyFacets.__super__.initialize.apply(this, arguments);
  };

  IggyFacets.prototype._subCollecctionOptions = function() {
    var opt;
    opt = IggyFacets.__super__._subCollecctionOptions.apply(this, arguments);
    opt.dir = this.forward ? "asc" : "desc";
    return opt;
  };

  IggyFacets.prototype.modelId = function(attrs) {
    return attrs.name;
  };

  IggyFacets.prototype.comparator = function(facetA, facetB) {
    var _nA, _nB, _sA, _sB;
    _sA = facetA.get("sort") || 0;
    _sB = facetB.get("sort") || 0;
    if (_sA > _sB) {
      if (this.forward) {
        return -1;
      } else {
        return 1;
      }
    } else if (_sA < _sB) {
      if (this.forward) {
        return 1;
      } else {
        return -1;
      }
    } else {
      _nA = facetA.get("name");
      _nB = facetB.get("name");
      if ((_nA != null) && (_nB != null)) {
        if (_nA > _nB) {
          if (this.forward) {
            return 1;
          } else {
            return -1;
          }
        } else if (_nA < _nB) {
          if (this.forward) {
            return -1;
          } else {
            return 1;
          }
        }
      }
    }
    return 0;
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
;var locals_for_with = (locals || {});(function (id, txt) {
buf.push("<span class=\"txt\">" + (jade.escape(null == (jade_interp = txt) ? "" : jade_interp)) + "</span><i" + (jade.attr("data-id", id, true, false)) + " class=\"rm-result-btn fa fa-remove\"></i>");}.call(this,"id" in locals_for_with?locals_for_with.id:typeof id!=="undefined"?id:undefined,"txt" in locals_for_with?locals_for_with.txt:typeof txt!=="undefined"?txt:undefined));;return buf.join("");
};
},{"jade/runtime":38}],15:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"daterange-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":38}],16:[function(require,module,exports){
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
},{"jade/runtime":38}],17:[function(require,module,exports){
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
},{"jade/runtime":38}],18:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

;return buf.join("");
};
},{"jade/runtime":38}],19:[function(require,module,exports){
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
},{"jade/runtime":38}],20:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":38}],21:[function(require,module,exports){
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
},{"jade/runtime":38}],22:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", value, true, false)) + " class=\"string-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":38}],23:[function(require,module,exports){
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

buf.push("<li><span class=\"txt\">" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</span><i class=\"rm-facet-btn fa fa-remove\"></i></li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li><span class=\"txt\">" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</span><i class=\"rm-facet-btn fa fa-remove\"></i></li>");
    }

  }
}).call(this);

}
buf.push("</ul><div class=\"subselect\"></div><div class=\"loader\"><i class=\"fa fa-cog fa-spin\"></i></div>");}.call(this,"label" in locals_for_with?locals_for_with.label:typeof label!=="undefined"?label:undefined,"selected" in locals_for_with?locals_for_with.selected:typeof selected!=="undefined"?selected:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":38}],24:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");;return buf.join("");
};
},{"jade/runtime":38}],25:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13,
  "TAB": 9
};


},{}],26:[function(require,module,exports){
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


},{"../../models/subresults":13,"../../tmpls/result_base.jade":18,"../../utils/keycodes":25}],27:[function(require,module,exports){
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
    this.close = bind(this.close, this);
    this.focus = bind(this.focus, this);
    this.events = bind(this.events, this);
    this.forcedDateRangeOpts = bind(this.forcedDateRangeOpts, this);
    return FacetSubsDateRange.__super__.constructor.apply(this, arguments);
  }

  FacetSubsDateRange.prototype.template = require("../../tmpls/daterange.jade");

  FacetSubsDateRange.prototype.forcedDateRangeOpts = function() {
    return {
      opens: "right"
    };
  };

  FacetSubsDateRange.prototype.events = function() {};

  FacetSubsDateRange.prototype.focus = function() {
    var _opts, ref;
    if (this.daterangepicker == null) {
      _opts = _.extend({}, this.model.get("opts"), this.forcedDateRangeOpts());
      this.$inp.daterangepicker(_opts, this._dateReturn);
      this.daterangepicker = this.$inp.data("daterangepicker");
      if ((ref = this.daterangepicker.container) != null) {
        ref.addClass("daterange-iggy");
      }
      this.daterangepicker.container.on("click", function(evnt) {
        evnt.stopPropagation();
        return false;
      });
    } else {
      this.daterangepicker.element = this.$inp;
      this.daterangepicker.show();
    }
    this.$inp.on("cancel.daterangepicker", this.close);
    this.$inp.on("hide.daterangepicker", this.close);
    return FacetSubsDateRange.__super__.focus.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.close = function() {
    FacetSubsDateRange.__super__.close.apply(this, arguments);
    this.$inp.off("cancel.daterangepicker", this.close);
    this.$inp.off("hide.daterangepicker", this.close);
  };

  FacetSubsDateRange.prototype.remove = function() {
    var ref;
    if ((ref = this.daterangepicker) != null) {
      ref.remove();
    }
    this.daterangepicker = null;
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
    this.model.set("value", this.getValue(false));
    this.select();
  };

  FacetSubsDateRange.prototype.getTemplateData = function() {
    return FacetSubsDateRange.__super__.getTemplateData.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.getValue = function(predef) {
    var _out, _predefVal;
    if (predef == null) {
      predef = true;
    }
    if (predef) {
      _predefVal = this.model.get("value");
      if (_predefVal != null) {
        if (!_.isArray(_predefVal)) {
          _predefVal = [_predefVal];
        }
        this.startDate = _predefVal[0], this.endDate = _predefVal[1];
        return _predefVal;
      }
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


},{"../../tmpls/daterange.jade":15,"../../utils/keycodes":25,"./base":26}],28:[function(require,module,exports){
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


},{"../../utils/keycodes":25,"./base":26}],29:[function(require,module,exports){
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

  FacetSubArray.prototype.templateResLi = require("../../tmpls/array_resultli.jade");

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

  FacetSubArray.prototype.close = function(evnt) {
    if (this.loading) {
      if (evnt != null) {
        evnt.preventDefault();
      }
      if (evnt != null) {
        evnt.stopPropagation();
      }
      this.focus();
      return;
    }
    return FacetSubArray.__super__.close.apply(this, arguments);
  };

  FacetSubArray.prototype.rmRes = function(evnt) {
    var _id, ref;
    _id = (ref = $(evnt.target)) != null ? ref.data("id") : void 0;
    this.result.remove(_id);
  };

  FacetSubArray.prototype.renderResult = function(renderEmpty) {
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
      _list.push(this.templateResLi({
        txt: model.getLabel(),
        id: model.id
      }));
    }
    return "<li>" + _list.join("</li><li>") + "</li>";
  };

  function FacetSubArray(options) {
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this._onTabAction = bind(this._onTabAction, this);
    this.getResults = bind(this.getResults, this);
    this.reopen = bind(this.reopen, this);
    this.select = bind(this.select, this);
    this._isFull = bind(this._isFull, this);
    this.renderResult = bind(this.renderResult, this);
    this.rmRes = bind(this.rmRes, this);
    this.close = bind(this.close, this);
    this.events = bind(this.events, this);
    this.loading = false;
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
    this.result.on("remove", (function(_this) {
      return function(mdl, coll) {
        if (coll.length) {
          options.sub.renderResult();
        }
        _this.searchcoll.add(mdl);
        _this.trigger("removed", mdl);
      };
    })(this));
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
    if (this.loading) {
      return;
    }
    _vals = this.model.get("value");
    if ((_vals != null) && !_.isArray(_vals)) {
      _vals = [_vals];
    }
    if (!(_vals != null ? _vals.length : void 0)) {
      return;
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
    var _coll, _opts, i, len, opt;
    if (_.isFunction(options)) {
      this.loading = true;
      _coll = new this.optColl([]);
      setTimeout((function(_this) {
        return function() {
          _this.$el.parent().addClass("loading");
          return options(_this.result, _this.model, function(aOpts) {
            var _opt, i, idx, len;
            for (idx = i = 0, len = aOpts.length; i < len; idx = ++i) {
              _opt = aOpts[idx];
              aOpts[idx] = _.extend({}, _this.optDefault, _opt, {
                custom: false
              });
            }
            _coll.add(aOpts);
            _this.loading = false;
            _this.$el.parent().removeClass("loading");
            _this.select();
          });
        };
      })(this), 0);
      return _coll;
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


},{"../../models/backbone_sub":2,"../../models/subresults":13,"../../tmpls/array_resultli.jade":14,"../../utils/keycodes":25,"../selector":35}],30:[function(require,module,exports){
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


},{"../../tmpls/number.jade":16,"./number_base":28}],31:[function(require,module,exports){
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
    } catch (undefined) {}
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


},{"../../tmpls/range.jade":17,"./number_base":28}],32:[function(require,module,exports){
var FacetSubsSelect, KEYCODES,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KEYCODES = require("../../utils/keycodes");

FacetSubsSelect = (function(superClass) {
  extend(FacetSubsSelect, superClass);

  function FacetSubsSelect() {
    this._select = bind(this._select, this);
    this.select = bind(this.select, this);
    this.close = bind(this.close, this);
    this.unselect = bind(this.unselect, this);
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this.getResults = bind(this.getResults, this);
    this._convertValue = bind(this._convertValue, this);
    this.getValue = bind(this.getValue, this);
    this._hasTabListener = bind(this._hasTabListener, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.remove = bind(this.remove, this);
    this._initSelect2 = bind(this._initSelect2, this);
    this._checkIntValue = bind(this._checkIntValue, this);
    this.reopen = bind(this.reopen, this);
    this._isFull = bind(this._isFull, this);
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

  FacetSubsSelect.prototype.initialize = function() {
    this.convertValueToInt = this._checkIntValue(this.model.get("options"));
    FacetSubsSelect.__super__.initialize.apply(this, arguments);
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
  };

  FacetSubsSelect.prototype.focus = function() {
    this.model.set("waitForAsync", false);
    this._initSelect2();
    this.select2.$container.show();
    this.select2.open();
    return FacetSubsSelect.__super__.focus.apply(this, arguments);
  };

  FacetSubsSelect.prototype._isFull = function() {
    if (this.selectCount <= 0) {
      return false;
    }
    return (this.result || []).length >= this.selectCount;
  };

  FacetSubsSelect.prototype.reopen = function(pView) {
    var _oldVals;
    if (this._isFull()) {
      return;
    }
    _oldVals = this.result.pluck("value");
    this.model.set({
      value: _oldVals
    });
    pView.$results.empty();
    this.select2.$container.off();
    this.select2.destroy();
    this.result.reset();
    this.select2 = null;
    return FacetSubsSelect.__super__.reopen.apply(this, arguments);
  };

  FacetSubsSelect.prototype._checkIntValue = function(_opts) {
    var _v, i, len;
    if (_opts == null) {
      _opts = [];
    }
    if (!_opts || !_opts.length) {
      return false;
    }
    for (i = 0, len = _opts.length; i < len; i++) {
      _v = _opts[i];
      if ((_v.value != null) && _.isString(_v.value)) {
        return false;
      }
      if ((_v.id != null) && _.isString(_v.id)) {
        return false;
      }
      if ((_v != null) && _.isString(_v)) {
        return false;
      }
    }
    return true;
  };

  FacetSubsSelect.prototype._initSelect2 = function() {
    var _opts;
    if (this.select2 == null) {
      _opts = _.extend({}, this.defaultModuleOpts, this.model.get("opts"), {
        multiple: this.model.get("multiple") || false
      }, this.forcedModuleOpts);
      this.$inp.select2(_opts);
      this.select2 = this.$inp.data("select2");
      if (!this.model.get("multiple")) {
        this.$inp.on("select2:select", this.select);
      }
      this.select2.on("results:all", (function(_this) {
        return function(results) {
          var ref, ref1, ref2;
          _this.convertValueToInt = _this._checkIntValue(results != null ? (ref = results.data) != null ? ref.results : void 0 : void 0);
          if ((ref1 = _this.select2.selection) != null) {
            if ((ref2 = ref1.$search) != null) {
              if (typeof ref2.focus === "function") {
                ref2.focus();
              }
            }
          }
        };
      })(this));
      this.select2.dataAdapter.current((function(_this) {
        return function(results) {
          var _data, i, len, result;
          if (_this.model.get("waitForAsync")) {
            _data = [];
            for (i = 0, len = results.length; i < len; i++) {
              result = results[i];
              _data.push(_this._convertValue(result));
            }
            _this._select(_data);
            _this.close();
          }
        };
      })(this));
      this.select2.$container.on("click", this._sel2open);
      this.select2.$element.hide();
      if (this.model.get("multiple")) {
        $(document).on(this._hasTabEvent(), this._onKey);
      }
    }
    return this.select2;
  };

  FacetSubsSelect.prototype._sel2open = function(evnt) {
    evnt.stopPropagation();
    return false;
  };

  FacetSubsSelect.prototype.remove = function() {
    return FacetSubsSelect.__super__.remove.apply(this, arguments);
  };

  FacetSubsSelect.prototype.getTemplateData = function() {
    var _data, _groups, _idx, _v, _vlist, i, j, len, len1, ref, ref1;
    _data = _.extend({}, FacetSubsSelect.__super__.getTemplateData.apply(this, arguments), {
      multiple: this.model.get("multiple"),
      options: this._createOptionCollection(this.model.get("options"))
    });
    if ((_data.value != null) && _.isArray(_data.value)) {
      ref = _data.value;
      for (_idx = i = 0, len = ref.length; i < len; _idx = ++i) {
        _v = ref[_idx];
        _data.value[_idx] = this.convertValueToInt ? parseFloat(_v) : _v.toString();
      }
    } else if (_data.value != null) {
      _data.value = [this.convertValueToInt ? parseFloat(_data.value) : _data.value.toString()];
    }
    if (_data.value != null) {
      _vlist = _.pluck(_data.options, "value");
      ref1 = _data.value;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        _v = ref1[j];
        if (indexOf.call(_vlist, _v) < 0) {
          _data.options.push({
            value: (this.convertValueToInt ? parseFloat(_v) : _v.toString()),
            label: _v,
            group: void 0
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
    var _vals, data, i, len, ref, ref1;
    _vals = [];
    ref1 = ((ref = this._initSelect2()) != null ? ref.data() : void 0) || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      data = ref1[i];
      _vals.push(this._convertValue(data));
    }
    return _vals;
  };

  FacetSubsSelect.prototype._convertValue = function(data) {
    var _data;
    _data = {};
    if (this.convertValueToInt) {
      _data.value = parseFloat(data.id);
    } else {
      _data.value = data.id;
    }
    if (data.text != null) {
      _data.label = data.text;
    }
    return _data;
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
          value: (this.convertValueToInt ? parseFloat(opt) : opt.toString()),
          label: opt,
          group: null
        });
      } else if (_.isObject(opt)) {
        opt.value = this.convertValueToInt ? parseFloat(opt.value) : opt.value.toString();
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
    var ref;
    if (this.model.get("waitForAsync")) {
      return;
    }
    if (this.select2 != null) {
      this.select2.$container.hide();
    }
    if ((ref = this.$inp) != null) {
      ref.remove();
    }
    this.$(".select-check").remove();
    FacetSubsSelect.__super__.close.apply(this, arguments);
  };

  FacetSubsSelect.prototype.select = function(evnt) {
    var _vals;
    if (evnt != null ? evnt.stopPropagation : void 0) {
      evnt.stopPropagation();
    }
    _vals = this.getValue();
    if (!(_vals != null ? _vals.length : void 0)) {
      this.close();
      this.sub.del();
      return;
    }
    this._select(_vals);
    this.close();
  };

  FacetSubsSelect.prototype._select = function(_vals) {
    var ModelConst, _val, i, len;
    this.model.set("waitForAsync", false);
    ModelConst = this.getSelectModel();
    for (i = 0, len = _vals.length; i < len; i++) {
      _val = _vals[i];
      this.result.add(new ModelConst(_val));
    }
    this.trigger("selected", this.result);
  };

  return FacetSubsSelect;

})(require("./base"));

module.exports = FacetSubsSelect;


},{"../../tmpls/select.jade":19,"../../utils/keycodes":25,"./base":26}],33:[function(require,module,exports){
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
    } catch (undefined) {}
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


},{"../../tmpls/string.jade":22,"./base":26}],34:[function(require,module,exports){
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
    var _cl, _fnSort, _valueFacets, fct, i, len, ref, ref1, subview;
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
    _valueFacets = this.collection.filter(function(fct) {
      return (fct != null ? fct.get("value") : void 0) != null;
    });
    _fnSort = function(key) {
      return function(v1, v2) {
        if (v1[key] > v2[key]) {
          return 1;
        }
        if (v1[key] < v2[key]) {
          return -1;
        }
        return 0;
      };
    };
    ref1 = _valueFacets.sort(_fnSort("_idx"));
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
      return;
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
      collection: this.collection,
      parent: this
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


},{"../tmpls/wrapper.jade":24,"../utils/keycodes":25,"./selector":35,"./sub":36}],35:[function(require,module,exports){
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
    var _cssclass, _id, _lbl, _list, _tmpl, i, idx, len, model, ref, ref1;
    this.$list.empty();
    _list = [];
    ref = this.searchcoll.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _lbl = model.getLabel();
      _tmpl = model.get("labeltemplate");
      if (_tmpl != null) {
        _lbl = _tmpl.replace("{{label}}", _lbl);
      }
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
    return false;
  };

  SelectorView.prototype._isFull = function() {
    return true;
  };

  SelectorView.prototype.selected = function(mdl) {
    var _err, _errerr, error, error1;
    try {
      if (mdl.onlyExec != null) {
        if (mdl != null) {
          if (typeof mdl.exec === "function") {
            mdl.exec();
          }
        }
        return;
      }
    } catch (error) {
      _err = error;
      try {
        console.error("Issue #23: CATCH - Class:" + this.constructor.name + " - activeIdx:" + this.activeIdx + " - collection:" + (JSON.stringify(this.collection.toJSON())));
      } catch (error1) {
        _errerr = error1;
        console.error("Issue #23: CATCH");
      }
    }
    if (mdl != null) {
      this.searchcoll.remove(mdl);
      this.result.add(mdl);
      this.trigger("selected", mdl);
    }
    if (this._isFull()) {
      this.close();
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
  };

  return SelectorView;

})(require("./facets/base"));

module.exports = SelectorView;


},{"../tmpls/selector.jade":20,"../tmpls/selectorli.jade":21,"../utils/keycodes":25,"./facets/base":26}],36:[function(require,module,exports){
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
    this.renderResult = bind(this.renderResult, this);
    this.removed = bind(this.removed, this);
    this.selected = bind(this.selected, this);
    this.remove = bind(this.remove, this);
    this.del = bind(this.del, this);
    this.reopen = bind(this.reopen, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    this.className = bind(this.className, this);
    return ViewSub.__super__.constructor.apply(this, arguments);
  }

  ViewSub.prototype.template = require("../tmpls/sub.jade");

  ViewSub.prototype.className = function() {
    var _name, _std, _type;
    _std = "sub";
    _type = this.model.get("type");
    if (_type != null) {
      _std += " sub-type-" + _type;
    }
    _name = this.model.get("name");
    if (_name != null) {
      _std += " sub-name-" + _name;
    }
    return _std;
  };

  ViewSub.prototype.initialize = function(options) {
    this._isOpen = false;
    this.result = new Backbone.Collection();
    this.$el.on("click", this.reopen);
    this.parent = options.parent;
  };

  ViewSub.prototype.events = {
    "click .rm-facet-btn": "del"
  };

  ViewSub.prototype.render = function(optMdl) {
    var _err, _errerr, _list, error, error1, i, idx, len, model, ref;
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      try {
        _list.push(model.getLabel());
      } catch (error) {
        _err = error;
        try {
          console.error("Issue #24: CATCH - Class:" + this.constructor.name + " - model:" + (JSON.stringify(this.model.toJSON())) + " - result:" + (JSON.stringify(this.result.toJSON())));
        } catch (error1) {
          _errerr = error1;
          console.error("Issue #24: CATCH");
        }
      }
    }
    this.$el.html(this.template({
      label: this.model.getLabel(),
      selected: _list,
      type: this.model.get("type"),
      name: this.model.get("name")
    }));
    this.$sub = this.$(".subselect");
    this.$results = this.$(".subresults");
    this.generateSub();
    return this.el;
  };

  ViewSub.prototype.reopen = function(evnt) {
    var ref;
    if ($(evnt.target).is(".rm-result-btn") && (((ref = this.selectview) != null ? ref.rmRes : void 0) != null)) {
      this.selectview.rmRes(evnt);
      evnt.preventDefault();
      evnt.stopPropagation();
      return;
    }
    if (!this._isOpen && (this.selectview != null)) {
      this.selectview.reopen(this);
    }
    evnt.preventDefault();
    evnt.stopPropagation();
    this.trigger("reopen");
  };

  ViewSub.prototype.del = function(evnt) {
    if (evnt != null) {
      evnt.stopPropagation();
    }
    if (evnt != null) {
      evnt.preventDefault();
    }
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
    this.parent = null;
    return ViewSub.__super__.remove.apply(this, arguments);
  };

  ViewSub.prototype.selected = function(optMdl) {
    this.result.add(optMdl, {
      merge: true
    });
    this.renderResult();
    this.trigger("selected", this.model, this.selectview.getResults());
  };

  ViewSub.prototype.removed = function(optMdl) {
    this.result.remove(optMdl);
    this.renderResult();
    this.trigger("selected", this.model, this.selectview.getResults());
    if (this.result.length <= 0) {
      this.del();
    }
  };

  ViewSub.prototype.renderResult = function() {
    this.$results.html(this.selectview.renderResult());
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
    var ref, ref1;
    this._isOpen = false;
    if (this.selectview != null) {
      if ((ref = this.selectview) != null) {
        ref.off();
      }
      if ((ref1 = this.selectview) != null) {
        ref1.close();
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
    this.selectview.on("removed", (function(_this) {
      return function(mdl) {
        if (mdl) {
          _this.removed(mdl);
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


},{"../tmpls/sub.jade":23}],37:[function(require,module,exports){

},{}],38:[function(require,module,exports){
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

},{"fs":37}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3JhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9zdWJyZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvdG1wbHMvYXJyYXlfcmVzdWx0bGkuamFkZSIsIl9zcmMvanMvdG1wbHMvZGF0ZXJhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9yYW5nZS5qYWRlIiwiX3NyYy9qcy90bXBscy9yZXN1bHRfYmFzZS5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3QuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3IuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3JsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9zdHJpbmcuamFkZSIsIl9zcmMvanMvdG1wbHMvc3ViLmphZGUiLCJfc3JjL2pzL3RtcGxzL3dyYXBwZXIuamFkZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3V0aWxzL2tleWNvZGVzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL251bWJlcl9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VibnVtYmVyLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zdWIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9qYWRlL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDRHQUFBO0VBQUE7Ozs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLGNBQVQ7O0FBQ1gsTUFBQSxHQUFTLE9BQUEsQ0FBUyxpQkFBVDs7QUFDVCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsU0FBQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVDs7QUFDWixTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsWUFBQSxHQUFlLE9BQUEsQ0FBUywwQkFBVDs7QUFDZixRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLE9BQUEsR0FBVSxPQUFBLENBQVMsa0JBQVQ7O0FBRUo7OztpQkFDTCxDQUFBLEdBQUc7O0VBQ1UsY0FBRSxFQUFGLEVBQU0sTUFBTixFQUFtQixPQUFuQjs7TUFBTSxTQUFTOzs7TUFBSSxVQUFVOzs7Ozs7Ozs7SUFDekMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksUUFBUSxDQUFDLE1BQXJCO0lBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQUdBLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBYSxFQUFiO0lBQ1AsSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUE7SUFDWCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxNQUFYLEVBQW1CLElBQW5CO0lBR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsY0FBRCxDQUFpQixNQUFqQixFQUF5QixPQUF6QjtJQUNWLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxPQUFBLENBQVMsSUFBVCxFQUFlLE9BQWY7SUFFZixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxLQUFaLEVBQW1CLElBQUMsQ0FBQSxhQUFwQjtJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFFBQVosRUFBc0IsSUFBQyxDQUFBLGFBQXZCO0lBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksUUFBWixFQUFzQixJQUFDLENBQUEsYUFBdkI7SUFFQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsUUFBQSxDQUFVO01BQUEsRUFBQSxFQUFJLElBQUMsQ0FBQSxHQUFMO01BQVUsVUFBQSxFQUFZLElBQUMsQ0FBQSxNQUF2QjtNQUErQixPQUFBLEVBQVMsSUFBQyxDQUFBLE9BQXpDO0tBQVY7QUFDWjtFQWxCWTs7aUJBb0JiLFVBQUEsR0FBWSxTQUFFLEVBQUY7QUFFWCxRQUFBO0lBQUEsSUFBTyxVQUFQO0FBQ0MsWUFBTSxJQUFDLENBQUEsTUFBRCxDQUFTLFlBQVQsRUFEUDs7SUFHQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksRUFBWixDQUFIO01BQ0MsSUFBRyxDQUFJLEVBQUUsQ0FBQyxNQUFWO0FBQ0MsY0FBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGdCQUFULEVBRFA7O01BR0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxDQUFELENBQUksRUFBSjtNQUNQLElBQUcsaUJBQUksSUFBSSxDQUFFLGdCQUFiO0FBQ0MsY0FBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGtCQUFULEVBRFA7O0FBR0EsYUFBTyxLQVJSOztJQVVBLElBQUcsRUFBQSxZQUFjLE1BQWpCO01BQ0MsSUFBRyxDQUFJLEVBQUUsQ0FBQyxNQUFWO0FBQ0MsY0FBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGdCQUFULEVBRFA7O01BSUEsSUFBRyxFQUFFLENBQUMsTUFBSCxHQUFZLENBQWY7QUFDQyxjQUFNLElBQUMsQ0FBQSxNQUFELENBQVMsZUFBVCxFQURQOztBQUdBLGFBQU8sR0FSUjs7SUFVQSxJQUFHLEVBQUEsWUFBYyxPQUFqQjtBQUNDLGFBQU8sSUFBQyxDQUFBLENBQUQsQ0FBSSxFQUFKLEVBRFI7O0FBR0EsVUFBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGdCQUFUO0VBNUJLOztpQkFnQ1osY0FBQSxHQUFnQixTQUFFLE1BQUYsRUFBVSxPQUFWO0FBQ2YsUUFBQTs7TUFEeUIsVUFBUTs7SUFDakMsSUFBQSxHQUFPO0FBQ1AsU0FBQSxzREFBQTs7WUFBK0I7OztNQUM5QixJQUFJLENBQUMsSUFBTCxHQUFZO01BQ1osSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO0FBRkQ7QUFJQSxXQUFXLElBQUEsTUFBQSxDQUFRLElBQVIsRUFBYyxPQUFkO0VBTkk7O2lCQVFoQixZQUFBLEdBQWMsU0FBRSxLQUFGO0FBQ2IsWUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVgsQ0FBQSxDQUFQO0FBQUEsV0FDTSxRQUROO0FBQ29CLGVBQVcsSUFBQSxTQUFBLENBQVcsS0FBWCxFQUFrQjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQWxCO0FBRC9CLFdBRU0sUUFGTjtBQUVvQixlQUFXLElBQUEsU0FBQSxDQUFXLEtBQVgsRUFBa0I7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUFsQjtBQUYvQixXQUdNLE9BSE47QUFHbUIsZUFBVyxJQUFBLFFBQUEsQ0FBVSxLQUFWLEVBQWlCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBakI7QUFIOUIsV0FJTSxRQUpOO0FBSW9CLGVBQVcsSUFBQSxTQUFBLENBQVcsS0FBWCxFQUFrQjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQWxCO0FBSi9CLFdBS00sT0FMTjtBQUttQixlQUFXLElBQUEsUUFBQSxDQUFVLEtBQVYsRUFBaUI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUFqQjtBQUw5QixXQU1NLFdBTk47QUFNdUIsZUFBVyxJQUFBLFlBQUEsQ0FBYyxLQUFkLEVBQXFCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBckI7QUFObEMsV0FPTSxPQVBOO0FBT21CLGVBQVcsSUFBQSxRQUFBLENBQVUsS0FBVixFQUFpQjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQWpCO0FBUDlCO0VBRGE7O2lCQVVkLFFBQUEsR0FBVSxTQUFFLEtBQUY7QUFDVCxRQUFBO0lBQUEsSUFBTyxtQkFBUDtBQUNDLGFBREQ7O0lBRUEsSUFBRyx5Q0FBSDtNQUNDLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFhLElBQWIsRUFERDs7QUFFQSxXQUFPO0VBTEU7O2lCQU9WLE1BQUEsR0FBUSxTQUFFLElBQUYsRUFBUSxJQUFSO0FBQ1AsUUFBQTs7TUFEZSxPQUFPOztJQUN0QixJQUFHLHlCQUFIO01BQ0MsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFRLENBQUEsSUFBQSxDQUFULENBQWlCLElBQWpCLEVBRFI7S0FBQSxNQUFBO01BR0MsSUFBQSxHQUFPLElBSFI7O0lBSUEsSUFBQSxHQUFXLElBQUEsS0FBQSxDQUFBO0lBQ1gsSUFBSSxDQUFDLElBQUwsR0FBWTtJQUNaLElBQUksQ0FBQyxPQUFMLEdBQWU7QUFDZixXQUFPO0VBUkE7O2lCQVVSLFFBQUEsR0FBVSxTQUFBO0FBQ1QsV0FBTyxJQUFDLENBQUE7RUFEQzs7aUJBR1YsYUFBQSxHQUFlLFNBQUE7SUFDZCxJQUFDLENBQUEsT0FBRCxDQUFVLFFBQVYsRUFBb0IsSUFBQyxDQUFBLE9BQXJCO0VBRGM7O2lCQUlmLFdBQUEsR0FBYSxTQUFBO0FBQ1osUUFBQTtJQUFBLElBQUMsQ0FBQSxNQUFELEdBQVU7QUFDVjtBQUFBLFNBQUEsU0FBQTs7TUFDQyxJQUFDLENBQUEsTUFBUSxDQUFBLEVBQUEsQ0FBVCxHQUFnQixDQUFDLENBQUMsUUFBRixDQUFZLEtBQVo7QUFEakI7RUFGWTs7aUJBTWIsTUFBQSxHQUFRLFNBQUE7V0FDUDtNQUFBLGtCQUFBLEVBQW9CLDJGQUFwQjtNQUNBLGdCQUFBLEVBQWtCLHNDQURsQjtNQUVBLGdCQUFBLEVBQWtCLDJEQUZsQjtNQUdBLGVBQUEsRUFBaUIsMERBSGpCO01BSUEsZ0JBQUEsRUFBa0IsMEVBSmxCO01BS0EsWUFBQSxFQUFjLDZCQUxkOztFQURPOzs7O0dBdEdVLFFBQVEsQ0FBQzs7QUE4RzVCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7OztBQ3pIakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBQSxXQUFBO0VBQUE7Ozs7O0FBd0JNOzs7Ozs7Ozs7OztBQUNMOzs7Ozs7Ozs7Ozs7Ozs7d0JBY0EsR0FBQSxHQUFLLFNBQUUsTUFBRjtBQUNKLFFBQUE7SUFBQSxJQUFDLENBQUEsYUFBRCxJQUFDLENBQUEsV0FBYTtJQUNkLFFBQUEsR0FBVyxJQUFDLENBQUEsa0JBQUQsQ0FBcUIsTUFBckI7SUFHWCxPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSO0lBRVYsSUFBQSxHQUFXLElBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYyxPQUFkLEVBQXVCLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQXZCO0lBRVgsSUFBSSxDQUFDLFVBQUwsR0FBa0I7SUFDbEIsSUFBSSxDQUFDLFNBQUwsR0FBaUI7SUFLakIsSUFBQyxDQUFBLEVBQUQsQ0FBSSxRQUFKLEVBQWMsQ0FBQyxDQUFDLElBQUYsQ0FBUSxTQUFFLEVBQUY7QUFDckIsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsU0FBRCxDQUFZLEVBQVo7TUFDUixLQUFBLEdBQVE7TUFDUixJQUFHLEtBQUEsSUFBVSxDQUFJLEtBQWpCO1FBQ0MsSUFBQyxDQUFBLE1BQUQsQ0FBUyxFQUFULEVBREQ7T0FBQSxNQUVLLElBQUcsQ0FBSSxLQUFKLElBQWMsS0FBakI7UUFDSixJQUFDLENBQUEsR0FBRCxDQUFNLEVBQU4sRUFESTs7SUFMZ0IsQ0FBUixFQVFaLElBUlksQ0FBZDtJQVdBLElBQUksQ0FBQyxFQUFMLENBQVEsS0FBUixFQUFlLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGO01BQ3RCLElBQUMsQ0FBQSxHQUFELENBQU0sRUFBTjtJQURzQixDQUFSLEVBR2IsSUFIYSxDQUFmO0lBTUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxLQUFKLEVBQVcsQ0FBQyxDQUFDLElBQUYsQ0FBUSxTQUFFLEVBQUY7TUFDbEIsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFZLEVBQVosQ0FBSDtRQUNDLElBQUMsQ0FBQSxHQUFELENBQU0sRUFBTixFQUREOztJQURrQixDQUFSLEVBSVQsSUFKUyxDQUFYO0lBT0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWtCLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGLEdBQUEsQ0FBUixFQUdoQixJQUhnQixDQUFsQjtJQU1BLElBQUMsQ0FBQSxFQUFELENBQUksUUFBSixFQUFjLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGO01BQ3JCLElBQUMsQ0FBQSxNQUFELENBQVMsRUFBVDtJQURxQixDQUFSLEVBR1osSUFIWSxDQUFkO0lBTUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxPQUFKLEVBQWEsQ0FBQyxDQUFDLElBQUYsQ0FBUSxTQUFFLEVBQUY7TUFDcEIsSUFBQyxDQUFBLGVBQUQsQ0FBQTtJQURvQixDQUFSLEVBR1gsSUFIVyxDQUFiO0lBTUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWdCLElBQWhCO0FBRUEsV0FBTztFQTNESDs7O0FBNkRMOzs7Ozs7Ozs7Ozs7d0JBV0Esc0JBQUEsR0FBd0IsU0FBQTtBQUN2QixXQUFPO0VBRGdCOzs7QUFHeEI7Ozs7Ozs7Ozs7Ozs7O3dCQWFBLGVBQUEsR0FBaUIsU0FBRSxNQUFGLEVBQVUsT0FBVjtBQUNoQixRQUFBOztNQUQwQixVQUFVOztJQUNwQyxJQUFHLHVCQUFIO01BR0MsSUFBOEMsY0FBOUM7UUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxrQkFBRCxDQUFxQixNQUFyQixFQUFiOztNQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBb0IsSUFBQyxDQUFBLFNBQXJCO01BR1YsSUFBRyxPQUFIO1FBQ0MsSUFBQyxDQUFBLEtBQUQsQ0FBUSxPQUFSO0FBQ0EsZUFBTyxLQUZSOztNQUlBLE1BQUEsR0FBUyxDQUFDLENBQUMsS0FBRixDQUFTLE9BQVQsRUFBa0IsS0FBbEI7TUFDVCxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUyxJQUFDLENBQUEsTUFBVixFQUFrQixLQUFsQjtBQUNWO0FBQUEsV0FBQSxxQ0FBQTs7UUFDQyxJQUFDLENBQUEsTUFBRCxDQUFTLEdBQVQ7QUFERDtNQUdBLE9BQUEsR0FBVSxDQUFDLENBQUMsVUFBRixDQUFjLE1BQWQsRUFBc0IsT0FBdEI7QUFDVixXQUFBLDJDQUFBOzttQkFBd0IsR0FBRyxDQUFDLEdBQUosRUFBQSxhQUFXLE9BQVgsRUFBQSxJQUFBO1VBQ3ZCLElBQUMsQ0FBQSxHQUFELENBQU0sR0FBTjs7QUFERCxPQWxCRDs7QUFxQkEsV0FBTztFQXRCUzs7O0FBeUJqQjs7Ozs7Ozs7Ozs7Ozs7d0JBYUEsa0JBQUEsR0FBb0IsU0FBRSxNQUFGO0FBRW5CLFFBQUE7SUFBQSxJQUFHLENBQUMsQ0FBQyxVQUFGLENBQWMsTUFBZCxDQUFIO01BQ0MsUUFBQSxHQUFXLE9BRFo7S0FBQSxNQUVLLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVyxNQUFYLENBQUg7TUFDSixRQUFBLEdBQVcsU0FBRSxFQUFGO0FBQ1YsWUFBQTtxQkFBQSxFQUFFLENBQUMsRUFBSCxFQUFBLGFBQVMsTUFBVCxFQUFBLEdBQUE7TUFEVSxFQURQO0tBQUEsTUFHQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksTUFBWixDQUFBLElBQXdCLENBQUMsQ0FBQyxRQUFGLENBQVksTUFBWixDQUEzQjtNQUNKLFFBQUEsR0FBVyxTQUFFLEVBQUY7ZUFDVixFQUFFLENBQUMsRUFBSCxLQUFTO01BREMsRUFEUDtLQUFBLE1BQUE7TUFJSixRQUFBLEdBQVcsU0FBRSxFQUFGO0FBQ1YsWUFBQTtBQUFBLGFBQUEsYUFBQTs7VUFDQyxJQUFHLEVBQUUsQ0FBQyxHQUFILENBQVEsR0FBUixDQUFBLEtBQW1CLEdBQXRCO0FBQ0MsbUJBQU8sTUFEUjs7QUFERDtBQUdBLGVBQU87TUFKRyxFQUpQOztBQVVMLFdBQU87RUFqQlk7Ozs7R0E3SUssUUFBUSxDQUFDOztBQWdLbkMsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUN4TGpCLElBQUEsUUFBQTtFQUFBOzs7QUFBTTs7Ozs7OztxQkFDTCxPQUFBLEdBQVMsT0FBQSxDQUFTLDBCQUFUOzs7O0dBRGEsT0FBQSxDQUFTLGdCQUFUOztBQUl2QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ0pqQixJQUFBLFNBQUE7RUFBQTs7OztBQUFNOzs7c0JBQ0wsV0FBQSxHQUFhOztzQkFDYixPQUFBLEdBQVMsT0FBQSxDQUFTLHNCQUFUOztFQUVJLG1CQUFFLEtBQUYsRUFBUyxPQUFUOzs7SUFDWixJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQztJQUNoQiw0Q0FBQSxTQUFBO0FBQ0E7RUFIWTs7c0JBS2IsUUFBQSxHQUFVLFNBQUE7V0FDVDtNQUFBLElBQUEsRUFBTSxRQUFOO01BQ0EsSUFBQSxFQUFNLE1BRE47TUFFQSxLQUFBLEVBQU8sYUFGUDs7RUFEUzs7c0JBS1YsUUFBQSxHQUFVLFNBQUE7QUFDVCxXQUFPLElBQUMsQ0FBQSxHQUFELENBQU0sT0FBTjtFQURFOztzQkFHVixLQUFBLEdBQU8sU0FBRSxJQUFGO0FBQ04sUUFBQTtJQUFBLEVBQUEsR0FBTSxJQUFDLENBQUEsR0FBRCxDQUFNLE1BQU4sQ0FBQSxHQUFpQixHQUFqQixHQUF1QixJQUFDLENBQUEsR0FBRCxDQUFNLE9BQU47SUFDN0IsS0FBQSxHQUFRLEVBQUUsQ0FBQyxXQUFILENBQUEsQ0FBZ0IsQ0FBQyxPQUFqQixDQUEwQixJQUFJLENBQUMsV0FBTCxDQUFBLENBQTFCO0FBQ1IsV0FBTyxLQUFBLElBQVM7RUFIVjs7c0JBS1AsVUFBQSxHQUFZLFNBQUUsR0FBRjtBQUNYLFdBQU8sR0FBRyxDQUFDO0VBREE7Ozs7R0F0QlcsUUFBUSxDQUFDOztBQXlCakMsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUN6QmpCLElBQUEsWUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O3lCQUNMLE9BQUEsR0FBUyxPQUFBLENBQVMsMkJBQVQ7O3lCQUNULFFBQUEsR0FBVSxTQUFBO0FBQ1QsV0FBTyxDQUFDLENBQUMsTUFBRixDQUFTLDRDQUFBLFNBQUEsQ0FBVCxFQUNOO01BQUEsSUFBQSxFQUFNLEVBQU47TUFDQSxLQUFBLEVBQU8sSUFEUDtLQURNO0VBREU7Ozs7R0FGZ0IsT0FBQSxDQUFTLGNBQVQ7O0FBTzNCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDUGpCLElBQUEsUUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OztxQkFDTCxPQUFBLEdBQVM7O3FCQUNULFFBQUEsR0FBVTs7cUJBQ1YsUUFBQSxHQUFVLFNBQUE7QUFDVCxXQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMsd0NBQUEsU0FBQSxDQUFULEVBQ047TUFBQSxPQUFBLEVBQVMsRUFBVDtLQURNO0VBREU7O3FCQUlWLElBQUEsR0FBTSxTQUFBO0lBQ0wsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQWUsSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOLENBQWYsRUFBZ0MsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFoQztFQURLOzs7O0dBUGdCLE9BQUEsQ0FBUyxjQUFUOztBQVV2QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1ZqQixJQUFBLFNBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztzQkFDTCxPQUFBLEdBQVMsT0FBQSxDQUFTLDJCQUFUOztzQkFDVCxRQUFBLEdBQVUsU0FBQTtBQUNULFdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyx5Q0FBQSxTQUFBLENBQVQsRUFDTjtNQUFBLEdBQUEsRUFBSyxJQUFMO01BQ0EsR0FBQSxFQUFLLElBREw7TUFFQSxJQUFBLEVBQU0sQ0FGTjtNQUdBLEtBQUEsRUFBTyxJQUhQO0tBRE07RUFERTs7OztHQUZhLE9BQUEsQ0FBUyxjQUFUOztBQVN4QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1RqQixJQUFBLFFBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztxQkFDTCxPQUFBLEdBQVMsT0FBQSxDQUFTLDBCQUFUOztxQkFDVCxRQUFBLEdBQVUsU0FBQTtBQUNULFdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyx3Q0FBQSxTQUFBLENBQVQsRUFDTjtNQUFBLEdBQUEsRUFBSyxJQUFMO01BQ0EsR0FBQSxFQUFLLElBREw7TUFFQSxJQUFBLEVBQU0sQ0FGTjtNQUdBLEtBQUEsRUFBTyxJQUhQO0tBRE07RUFERTs7OztHQUZZLE9BQUEsQ0FBUyxjQUFUOztBQVN2QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1RqQixJQUFBLFNBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztzQkFDTCxPQUFBLEdBQVMsT0FBQSxDQUFTLDJCQUFUOztzQkFDVCxRQUFBLEdBQVUsU0FBQTtBQUNULFdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBVSx5Q0FBQSxTQUFBLENBQVYsRUFBaUI7TUFDdkIsT0FBQSxFQUFTLEVBRGM7TUFFdkIsWUFBQSxFQUFjLElBRlM7S0FBakI7RUFERTs7OztHQUZhLE9BQUEsQ0FBUyxjQUFUOztBQVF4QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1JqQixJQUFBLFNBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztzQkFDTCxPQUFBLEdBQVMsT0FBQSxDQUFTLDJCQUFUOztzQkFDVCxRQUFBLEdBQVUsU0FBQTtBQUNULFdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyx5Q0FBQSxTQUFBLENBQVQsRUFDTjtNQUFBLE9BQUEsRUFBUyxFQUFUO0tBRE07RUFERTs7OztHQUZhLE9BQUEsQ0FBUyxjQUFUOztBQU14QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ05qQixJQUFBLFVBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7dUJBQ0wsVUFBQSxHQUFZLFNBQUUsTUFBRixFQUFVLE9BQVY7O01BQVUsVUFBUTs7SUFDN0IsSUFBQyxDQUFBLE9BQUQ7QUFBVyxjQUFPLE9BQU8sQ0FBQyxHQUFmO0FBQUEsYUFDTCxLQURLO2lCQUNNO0FBRE4sYUFFTCxNQUZLO2lCQUVPO0FBRlA7aUJBR0w7QUFISzs7QUFJWCxXQUFPLDRDQUFBLFNBQUE7RUFMSTs7dUJBT1osc0JBQUEsR0FBd0IsU0FBQTtBQUN2QixRQUFBO0lBQUEsR0FBQSxHQUFNLHdEQUFBLFNBQUE7SUFDTixHQUFHLENBQUMsR0FBSixHQUFhLElBQUMsQ0FBQSxPQUFKLEdBQWlCLEtBQWpCLEdBQTRCO0FBQ3RDLFdBQU87RUFIZ0I7O3VCQUt4QixPQUFBLEdBQVMsU0FBQyxLQUFEO0FBQ1IsV0FBTyxLQUFLLENBQUM7RUFETDs7dUJBR1QsVUFBQSxHQUFZLFNBQUUsTUFBRixFQUFVLE1BQVY7QUFDWCxRQUFBO0lBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxHQUFQLENBQVksTUFBWixDQUFBLElBQXdCO0lBQzlCLEdBQUEsR0FBTSxNQUFNLENBQUMsR0FBUCxDQUFZLE1BQVosQ0FBQSxJQUF3QjtJQUM5QixJQUFHLEdBQUEsR0FBTSxHQUFUO01BQ1EsSUFBRyxJQUFDLENBQUEsT0FBSjtlQUFpQixDQUFDLEVBQWxCO09BQUEsTUFBQTtlQUF5QixFQUF6QjtPQURSO0tBQUEsTUFFSyxJQUFHLEdBQUEsR0FBTSxHQUFUO01BQ0csSUFBRyxJQUFDLENBQUEsT0FBSjtlQUFpQixFQUFqQjtPQUFBLE1BQUE7ZUFBd0IsQ0FBQyxFQUF6QjtPQURIO0tBQUEsTUFBQTtNQUdKLEdBQUEsR0FBTSxNQUFNLENBQUMsR0FBUCxDQUFZLE1BQVo7TUFDTixHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQVAsQ0FBWSxNQUFaO01BQ04sSUFBRyxhQUFBLElBQVMsYUFBWjtRQUNDLElBQUcsR0FBQSxHQUFNLEdBQVQ7VUFDUSxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixFQUFqQjtXQUFBLE1BQUE7bUJBQXdCLENBQUMsRUFBekI7V0FEUjtTQUFBLE1BRUssSUFBRyxHQUFBLEdBQU0sR0FBVDtVQUNHLElBQUcsSUFBQyxDQUFBLE9BQUo7bUJBQWlCLENBQUMsRUFBbEI7V0FBQSxNQUFBO21CQUF5QixFQUF6QjtXQURIO1NBSE47T0FMSTs7QUFVTCxXQUFPO0VBZkk7Ozs7R0FoQlksT0FBQSxDQUFTLGdCQUFUOztBQWlDekIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNqQ2pCLElBQUEsdUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7O3VCQUNMLFdBQUEsR0FBYTs7dUJBQ2IsUUFBQSxHQUNDO0lBQUEsSUFBQSxFQUFNLFFBQU47SUFDQSxJQUFBLEVBQU0sSUFETjtJQUVBLEtBQUEsRUFBTyxJQUZQOzs7OztHQUh1QixRQUFRLENBQUM7O0FBTzVCOzs7Ozs7Ozs7d0JBQ0wsS0FBQSxHQUFPOzt3QkFDUCxVQUFBLEdBQVksU0FBRSxJQUFGLEVBQVEsSUFBUjtBQUNYLFFBQUE7SUFBQSx3Q0FBaUIsQ0FBRSxlQUFuQjtNQUNDLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDLFVBRG5COztFQURXOzt3QkFJWixLQUFBLEdBQU8sU0FBRSxJQUFGLEVBQVEsT0FBUjtBQUNOLFFBQUE7SUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFmLENBQW9CLFdBQXBCLENBQUEsSUFBcUMsSUFBQyxDQUFBLFNBQXRDLElBQW1EO0lBQzFELE9BQUEsdUNBQXdCLENBQUUsR0FBaEIsQ0FBcUIsUUFBckI7SUFDVixJQUFHLGlCQUFBLElBQWEsQ0FBQyxDQUFDLFVBQUYsQ0FBYyxPQUFkLENBQWhCO01BQ0MsSUFBTSxDQUFBLElBQUEsQ0FBTixHQUFlLE9BQUEsQ0FBUyxJQUFJLENBQUMsS0FBZCxFQUFxQixPQUFPLENBQUMsTUFBN0IsRUFBcUMsSUFBckMsRUFEaEI7O0FBRUEsV0FBTztFQUxEOzs7O0dBTmtCLFFBQVEsQ0FBQzs7QUFhbkMsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNwQmpCLElBQUEsdUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozt1QkFDTCxXQUFBLEdBQWE7O3VCQUNiLFFBQUEsR0FBVSxTQUFBO0FBQ1QsV0FBTyxJQUFDLENBQUEsR0FBRCxDQUFNLE9BQU4sQ0FBQSxJQUFtQixJQUFDLENBQUEsR0FBRCxDQUFNLElBQUMsQ0FBQSxXQUFQLENBQW5CLElBQTJDO0VBRHpDOzs7O0dBRmMsUUFBUSxDQUFDOztBQU01Qjs7Ozs7Ozt3QkFDTCxLQUFBLEdBQU87Ozs7R0FEa0IsT0FBQSxDQUFTLGdCQUFUOztBQUcxQixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1RqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldHNcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdFNlbGVjdCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc2VsZWN0XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3RSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfcmFuZ2VcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcbkZjdEV2ZW50ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9ldmVudFwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzLCBvcHRpb25zIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKCBudWxsLCBvcHRpb25zIClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0QHZpZXcgPSBuZXcgTWFpblZpZXcoIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cywgb3B0aW9ucz17fSApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQsIF9pZHggaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X2ZjdC5faWR4ID0gX2lkeFxuXHRcdFx0X3JldC5wdXNoIF9mY3Rcblx0XHRcblx0XHRyZXR1cm4gbmV3IEZhY2V0cyggX3JldCwgb3B0aW9ucyApXG5cblx0X2NyZWF0ZUZhY2V0OiAoIGZhY2V0ICktPlxuXHRcdHN3aXRjaCBmYWNldC50eXBlLnRvTG93ZXJDYXNlKClcblx0XHRcdHdoZW4gXCJzdHJpbmdcIiB0aGVuIHJldHVybiBuZXcgRmN0U3RyaW5nKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwic2VsZWN0XCIgdGhlbiByZXR1cm4gbmV3IEZjdFNlbGVjdCggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImFycmF5XCIgdGhlbiByZXR1cm4gbmV3IEZjdEFycmF5KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwibnVtYmVyXCIgdGhlbiByZXR1cm4gbmV3IEZjdE51bWJlciggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcInJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdFJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZGF0ZXJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdERhdGVSYW5nZSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImV2ZW50XCIgdGhlbiByZXR1cm4gbmV3IEZjdEV2ZW50KCBmYWNldCwgbWFpbjogQCApXG5cblx0YWRkRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0aWYgbm90IEBmYWNldHM/XG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRAZmFjZXRzLmFkZCggX2ZjdCApXG5cdFx0cmV0dXJuIEBcblxuXHRfZXJyb3I6ICggdHlwZSwgZGF0YSA9IHt9ICk9PlxuXHRcdGlmIEBlcnJvcnNbIHR5cGUgXT9cblx0XHRcdF9tc2cgPSBAZXJyb3JzWyB0eXBlIF0oIGRhdGEgKVxuXHRcdGVsc2Vcblx0XHRcdF9tc2cgPSBcIi1cIlxuXHRcdF9lcnIgPSBuZXcgRXJyb3IoKVxuXHRcdF9lcnIubmFtZSA9IHR5cGVcblx0XHRfZXJyLm1lc3NhZ2UgPSBfbXNnXG5cdFx0cmV0dXJuIF9lcnJcblxuXHRnZXRRdWVyeTogPT5cblx0XHRyZXR1cm4gQHJlc3VsdHNcblxuXHR0cmlnZ2VyQ2hhbmdlOiA9PlxuXHRcdEB0cmlnZ2VyKCBcImNoYW5nZVwiLCBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X2luaXRFcnJvcnM6ID0+XG5cdFx0QGVycm9ycyA9IHt9XG5cdFx0Zm9yIF9rLCBfdG1wbCBvZiBARVJST1JTKClcblx0XHRcdEBlcnJvcnNbIF9rIF0gPSBfLnRlbXBsYXRlKCBfdG1wbCApXG5cdFx0cmV0dXJuXG5cblx0RVJST1JTOiAtPlxuXHRcdFwiRUlOVkFMSURFTFNUUklOR1wiOiBcIklmIHlvdSBkZWZpbmUgYSBgZWxgIGFzIFN0cmluZyBpdCBoYXMgdG8gYmUgYSB2YWxpZCBzZWxlY3RvciBmb3IgYW4gZXhpc3RpbmcgRE9NIGVsZW1lbnQuXCJcblx0XHRcIkVFTVBUWUVMU1RSSU5HXCI6IFwiVGhlIGBlbGAgYXMgc3RyaW5nIGNhbiBub3QgYmUgZW1wdHkuXCJcblx0XHRcIkVFTVBUWUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGFuIGVtcHR5IGNvbGxlY3Rpb24uXCJcblx0XHRcIkVTSVpFRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYSByZXN1bHQgb2Ygb25lIGVsLlwiXG5cdFx0XCJFSU5WQUxJREVMVFlQRVwiOiBcIlRoZSBgZWxgIGNhbiBvbmx5IGJlIGEgc2VsZWN0b3Igc3RyaW5nLCBkb20gZWxlbWVudCBvciBqUXVlcnkgY29sbGVjdGlvblwiXG5cdFx0XCJFTUlTU0lOR0VMXCI6IFwiUGxlYXNlIGRlZmluZSBhIHRhcmdldCBgZWxgXCJcblxubW9kdWxlLmV4cG9ydHMgPSBJR0dZXG4iLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKVxuXHRcblx0IyBvciBieSBPYmplY3Rcblx0c3ViQ29sbE8gPSBwYXJlbnRDb2xsLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyBvciBieSBOdW1iZXJcblx0c3ViQ29sbE4gPSBwYXJlbnRDb2xsLnN1YiggMTMgKVxuXHRcblx0IyBvciBieSBGdW5jdGlvblxuXHRzdWJDb2xsRiA9IHBhcmVudENvbGwuc3ViKCAoKCBtb2RlbCApLT4gaWYgbW9kZWwuZ2V0KCBcImFnZVwiICkgPiAyMyApIClcblx0XG5cdCMgc3ViY29sbGVjdGlvbiBvZiBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBX08gPSBzdWJDb2xsQS5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBGb3IgdGhpcyBhIGByZXNldGAgd2lsbCBiZSBmaXJlZCBvbiB0aGUgc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQSA9IHN1YkNvbGxBLnVwZGF0ZVN1YkZpbHRlciggeyBuYW1lOiBcIkJhclwiLCBhZ2U6IDQyIH0gKVxuIyMjXG5cbmNsYXNzIEJhY2tib25lU3ViIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHQjIyNcblx0IyMgc3ViXG5cdFxuXHRgY29sbGVjdGlvbi5zdWIoIGZpbHRlciApYFxuXHRcblx0R2VuZXJhdGUgYSBzdWItY29sbGVjdGlvbiBieSBhIGZpbHRlci5cblx0VGhlIG1vZGVscyB3aWxsIGJlIGRpc3RyaWJ1dGVkIHdpdGhpbiBhbGwgaW52b2x2ZWQgY29sbGVjdGlvbnMgdW5kZXIgY29uc2lkZXJhdGlvbiBvZiB0aGUgZmlsdGVyLlxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBDb2xsZWN0aW9uIH0gQSBTdWItQ29sbGVjdGlvbiBiYXNlZCBvbiB0aGUgZmlsdGVyXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0c3ViOiAoIGZpbHRlciApPT5cblx0XHRAc3ViQ29sbHMgb3I9IFtdXG5cdFx0Zm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKVxuXG5cdFx0IyBmaWx0ZXIgdGhlIGNvbGxlY3Rpb25cblx0XHRfbW9kZWxzID0gQGZpbHRlciBmbkZpbHRlclxuXHRcdCMgY3JlYXRlIHRoZSBzdWJjb2xsZWN0aW9uXG5cdFx0X3N1YiA9IG5ldyBAY29uc3RydWN0b3IoIF9tb2RlbHMsIEBfc3ViQ29sbGVjY3Rpb25PcHRpb25zKCkgKVxuXG5cdFx0X3N1Yi5fcGFyZW50Q29sID0gQFxuXHRcdF9zdWIuX2ZuRmlsdGVyID0gZm5GaWx0ZXJcblxuXHRcdCMgYWRkIGV2ZW50IGhhbmRsZXJzIHRvIGRpc3RyaWJ1dGUgdGhlIG1vZGVscyB0aHJvdWdoIHRoZSBzdWIgY29sbGVjdGlvbnMgdHJlZVxuXG5cdFx0IyByZWNoZWNrIHRoZSBtb2RlbCBhZ2FpbnN0IHRoZSBmaWx0ZXIgb24gY2hhbmdlXG5cdFx0QG9uIFwiY2hhbmdlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdHRvQWRkID0gQF9mbkZpbHRlciggX20gKVxuXHRcdFx0YWRkZWQgPSBAZ2V0KCBfbSApP1xuXHRcdFx0aWYgYWRkZWQgYW5kIG5vdCB0b0FkZFxuXHRcdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRlbHNlIGlmIG5vdCBhZGRlZCBhbmQgdG9BZGRcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIGJhc2UgY29sbGVjdGlvbiBvbiBhZGQgdG8gc3ViXG5cdFx0X3N1Yi5vbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBzdWIgY29sbGVjdGlvbiBvbiBhZGQgdG8gYmFzZSBpZiBpdCBtYXRjaGVzIHRoZSBmaWx0ZXJcblx0XHRAb24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0aWYgQF9mbkZpbHRlciggX20gKVxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdF9zdWIub24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0I0ByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZXNldFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAdXBkYXRlU3ViRmlsdGVyKClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHN0b3JlIHRoZSBzdWJjb2xsZWN0aW9uIHVuZGVyIHRoZSBjdXJyZW50IGNvbGxlY3Rpb25cblx0XHRAc3ViQ29sbHMucHVzaCggX3N1YiApXG5cblx0XHRyZXR1cm4gX3N1YlxuXHRcblx0IyMjXG5cdCMjIF9zdWJDb2xsZWNjdGlvbk9wdGlvbnNcblx0XG5cdGBjb2xsZWN0aW9uLl9zdWJDb2xsZWNjdGlvbk9wdGlvbnMoKWBcblx0XG5cdE92ZXJ3cml0YWJsZSBtZXRob2QgdG8gc2V0IHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGZvciBzdWIgY29sbGVjdGlvbnNcblx0XG5cdEByZXR1cm4geyBPYmplY3QgfSBUaGUgb3B0aW9ucyBvYmplY3Rcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X3N1YkNvbGxlY2N0aW9uT3B0aW9uczogPT5cblx0XHRyZXR1cm4ge31cblxuXHQjIyNcblx0IyMgdXBkYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi51cGRhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0TWV0aG9kIHRvIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gVGhlbiBhbGwgbW9kZWxzIHdpbGwgYmUgcmVzZXRlIGJ5IHRoZSBuZXcgZmlsdGVyLiBTbyB5b3UgaGF2ZSB0byBsaXN0ZW4gdG8gdGVoIHJlc2V0IGV2ZW50XG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IFNlbGYgfSBpdHNlbGZcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHR1cGRhdGVTdWJGaWx0ZXI6ICggZmlsdGVyLCBhc1Jlc2V0ID0gdHJ1ZSApPT5cblx0XHRpZiBAX3BhcmVudENvbD9cblxuXHRcdFx0IyBzZXQgdGhlIG5ldyBmaWx0ZXIgbWV0aG9kXG5cdFx0XHRAX2ZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyICkgaWYgZmlsdGVyP1xuXG5cdFx0XHRfbW9kZWxzID0gQF9wYXJlbnRDb2wuZmlsdGVyKCBAX2ZuRmlsdGVyIClcblxuXHRcdFx0IyByZXNldCB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBuZXcgbW9kZWxzXG5cdFx0XHRpZiBhc1Jlc2V0XG5cdFx0XHRcdEByZXNldCggX21vZGVscyApXG5cdFx0XHRcdHJldHVybiBAXG5cblx0XHRcdG5ld2lkcyA9IF8ucGx1Y2soIF9tb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Y3VycmlkcyA9IF8ucGx1Y2soIEBtb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Zm9yIHJpZCBpbiBfLmRpZmZlcmVuY2UoIGN1cnJpZHMsIG5ld2lkcyApXG5cdFx0XHRcdEByZW1vdmUoIHJpZCApXG5cdFx0XHRcdFxuXHRcdFx0X2FkZElkcyA9IF8uZGlmZmVyZW5jZSggbmV3aWRzLCBjdXJyaWRzIClcblx0XHRcdGZvciBtZGwgaW4gX21vZGVscyB3aGVuIG1kbC5jaWQgaW4gX2FkZElkc1xuXHRcdFx0XHRAYWRkKCBtZGwgKVxuXG5cdFx0cmV0dXJuIEBcblxuXG5cdCMjI1xuXHQjIyBfZ2VuZXJhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLl9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRJbnRlcm5hbCBtZXRob2QgdGggY29udmVydCBhIGZpbHRlciBhcmd1bWVudCB0byBhIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBGdW5jdGlvbiB9IFRoZSBnZW5lcmF0ZWQgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAYXBpIHByaXZhdGVcblx0IyMjXG5cdF9nZW5lcmF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIgKS0+XG5cdFx0IyBjb25zdHJ1Y3QgdGhlIGZpbHRlciBmdW5jdGlvblxuXHRcdGlmIF8uaXNGdW5jdGlvbiggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzQXJyYXkoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGluIGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc1N0cmluZyggZmlsdGVyICkgb3IgXy5pc051bWJlciggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0X20uaWQgaXMgZmlsdGVyXG5cdFx0ZWxzZVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRmb3IgX25tLCBfdmwgb2YgZmlsdGVyXG5cdFx0XHRcdFx0aWYgX20uZ2V0KCBfbm0gKSBpc250IF92bFxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRyZXR1cm4gZm5GaWx0ZXJcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZVN1YlxuIiwiY2xhc3MgRmN0QXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfc3RyaW5nXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheVwiIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEFycmF5XG4iLCJjbGFzcyBGYWNldEJhc2UgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvYmFzZVwiIClcblx0XG5cdGNvbnN0cnVjdG9yOiAoIGF0dHJzLCBvcHRpb25zICktPlxuXHRcdEBtYWluID0gb3B0aW9ucy5tYWluXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGRlZmF1bHRzOiAtPlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBcIm5hbWVcIlxuXHRcdGxhYmVsOiBcIkRlc2NyaXB0aW9uXCJcblxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiIClcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwibmFtZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuXHRjb21wYXJhdG9yOiAoIG1kbCApLT5cblx0XHRyZXR1cm4gbWRsLmlkXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRCYXNlXG4iLCJjbGFzcyBGY3REYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvZGF0ZXJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRzOiB7fVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3REYXRlUmFuZ2VcbiIsImNsYXNzIEZjdEV2ZW50IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IG51bGxcblx0b25seUV4ZWM6IHRydWVcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblx0XHRcblx0ZXhlYzogKCApPT5cblx0XHRAbWFpbi50cmlnZ2VyKCBAZ2V0KCBcImV2ZW50XCIgKSwgQHRvSlNPTigpIClcblx0XHRyZXR1cm5cbm1vZHVsZS5leHBvcnRzID0gRmN0RXZlbnRcbiIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdE51bWJlclxuIiwiY2xhc3MgRmN0UmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VicmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFJhbmdlXG4iLCJjbGFzcyBGY3RTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic2VsZWN0XCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQoIHN1cGVyLCB7XG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFx0d2FpdEZvckFzeW5jOiB0cnVlXG5cdFx0fSlcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTZWxlY3RcbiIsImNsYXNzIEZjdFN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmdcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nXG4iLCJjbGFzcyBJZ2d5RmFjZXRzIGV4dGVuZHMgcmVxdWlyZSggXCIuL2JhY2tib25lX3N1YlwiIClcblx0aW5pdGlhbGl6ZTogKCBtb2RlbHMsIG9wdGlvbnM9e30gKS0+XG5cdFx0QGZvcndhcmQgPSBzd2l0Y2ggb3B0aW9ucy5kaXJcblx0XHRcdHdoZW4gXCJhc2NcIiB0aGVuIHRydWVcblx0XHRcdHdoZW4gXCJkZXNjXCIgdGhlbiBmYWxzZVxuXHRcdFx0ZWxzZSB0cnVlXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFxuXHRfc3ViQ29sbGVjY3Rpb25PcHRpb25zOiA9PlxuXHRcdG9wdCA9IHN1cGVyXG5cdFx0b3B0LmRpciA9IGlmIEBmb3J3YXJkIHRoZW4gXCJhc2NcIiBlbHNlIFwiZGVzY1wiXG5cdFx0cmV0dXJuIG9wdFxuXHRcblx0bW9kZWxJZDogKGF0dHJzKS0+XG5cdFx0cmV0dXJuIGF0dHJzLm5hbWVcblx0XHRcblx0Y29tcGFyYXRvcjogKCBmYWNldEEsIGZhY2V0QiApPT5cblx0XHRfc0EgPSBmYWNldEEuZ2V0KCBcInNvcnRcIiApIG9yIDBcblx0XHRfc0IgPSBmYWNldEIuZ2V0KCBcInNvcnRcIiApIG9yIDBcblx0XHRpZiBfc0EgPiBfc0Jcblx0XHRcdHJldHVybiBpZiBAZm9yd2FyZCB0aGVuIC0xIGVsc2UgMVxuXHRcdGVsc2UgaWYgX3NBIDwgX3NCXG5cdFx0XHRyZXR1cm4gaWYgQGZvcndhcmQgdGhlbiAxIGVsc2UgLTFcblx0XHRlbHNlXG5cdFx0XHRfbkEgPSBmYWNldEEuZ2V0KCBcIm5hbWVcIiApXG5cdFx0XHRfbkIgPSBmYWNldEIuZ2V0KCBcIm5hbWVcIiApXG5cdFx0XHRpZiBfbkE/IGFuZCBfbkI/XG5cdFx0XHRcdGlmIF9uQSA+IF9uQlxuXHRcdFx0XHRcdHJldHVybiBpZiBAZm9yd2FyZCB0aGVuIDEgZWxzZSAtMVxuXHRcdFx0XHRlbHNlIGlmIF9uQSA8IF9uQlxuXHRcdFx0XHRcdHJldHVybiBpZiBAZm9yd2FyZCB0aGVuIC0xIGVsc2UgMVxuXHRcdHJldHVybiAwXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneUZhY2V0c1xuIiwiY2xhc3MgSWdneVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRkZWZhdWx0czpcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogbnVsbFxuXHRcdHZhbHVlOiBudWxsXG5cbmNsYXNzIElnZ3lSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHRtb2RlbDogSWdneVJlc3VsdFxuXHRpbml0aWFsaXplOiAoIG1kbHMsIG9wdHMgKT0+XG5cdFx0aWYgb3B0cy5tb2RpZnlLZXk/Lmxlbmd0aFxuXHRcdFx0QG1vZGlmeUtleSA9IG9wdHMubW9kaWZ5S2V5XG5cdFx0cmV0dXJuXG5cdHBhcnNlOiAoIGF0dHIsIG9wdGlvbnMgKT0+XG5cdFx0X2tleSA9IG9wdGlvbnMuX2ZhY2V0LmdldCggXCJtb2RpZnlLZXlcIiApIG9yIEBtb2RpZnlLZXkgb3IgXCJ2YWx1ZVwiXG5cdFx0X21vZGlmeSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwibW9kaWZ5XCIgKVxuXHRcdGlmIF9tb2RpZnk/IGFuZCBfLmlzRnVuY3Rpb24oIF9tb2RpZnkgKVxuXHRcdFx0YXR0clsgX2tleSBdID0gX21vZGlmeSggYXR0ci52YWx1ZSwgb3B0aW9ucy5fZmFjZXQsIGF0dHIgKVxuXHRcdHJldHVybiBhdHRyXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneVJlc3VsdHNcbiIsImNsYXNzIEJhc2VSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBAaWRBdHRyaWJ1dGUgKSBvciBcIi1cIlxuXG5cbmNsYXNzIEJhc2VSZXN1bHRzIGV4dGVuZHMgcmVxdWlyZSggXCIuL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEJhc2VSZXN1bHRcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlUmVzdWx0c1xuIiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoaWQsIHR4dCkge1xuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHR4dCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxpXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJybS1yZXN1bHQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9pPlwiKTt9LmNhbGwodGhpcyxcImlkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pZDp0eXBlb2YgaWQhPT1cInVuZGVmaW5lZFwiP2lkOnVuZGVmaW5lZCxcInR4dFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudHh0OnR5cGVvZiB0eHQhPT1cInVuZGVmaW5lZFwiP3R4dDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvciwgb3BlcmF0b3JzLCB1bmRlZmluZWQsIHZhbHVlKSB7XG5pZiAoIG9wZXJhdG9ycyAmJiBvcGVyYXRvcnMubGVuZ3RoKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+PHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiKTtcbi8vIGl0ZXJhdGUgb3BlcmF0b3JzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wZXJhdG9ycztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yOnR5cGVvZiBvcGVyYXRvciE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3I6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJhbmdlaW5wXFxcIj5cIik7XG52YXIgX3ZhbHMgPSB2YWx1ZSA/IHZhbHVlIDogW11cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfZnJvbVwiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzBdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtZnJvbVxcXCIvPjxzcGFuIGNsYXNzPVxcXCJzZXBhcmF0b3JcXFwiPi08L3NwYW4+PGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfdG9cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1sxXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLXRvXFxcIi8+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG47cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG11bHRpcGxlLCBvcHRpb25Hcm91cHMsIG9wdGlvbnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIG11bHRpcGxlPVxcXCJtdWx0aXBsZVxcXCIgY2xhc3M9XFxcInNlbGVjdC1pbnBcXFwiPlwiKTtcbmlmICggb3B0aW9uR3JvdXBzKVxue1xuLy8gaXRlcmF0ZSBvcHRpb25Hcm91cHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9uR3JvdXBzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgZ25hbWUgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGduYW1lIDwgJCRsOyBnbmFtZSsrKSB7XG4gICAgICB2YXIgb3B0cyA9ICQkb2JqW2duYW1lXTtcblxuYnVmLnB1c2goXCI8b3B0Z3JvdXBcIiArIChqYWRlLmF0dHIoXCJsYWJlbFwiLCBnbmFtZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPjwvb3B0Z3JvdXA+XCIpO1xuLy8gaXRlcmF0ZSBvcHRzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgZ25hbWUgaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZVxue1xuLy8gaXRlcmF0ZSBvcHRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbmlmICggbXVsdGlwbGUpXG57XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJidG4gYnRuLXhzIGJ0bi1zdWNjZXNzIHNlbGVjdC1jaGVjayBmYSBmYS1jaGVja1xcXCI+PC9zcGFuPlwiKTtcbn19LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJtdWx0aXBsZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubXVsdGlwbGU6dHlwZW9mIG11bHRpcGxlIT09XCJ1bmRlZmluZWRcIj9tdWx0aXBsZTp1bmRlZmluZWQsXCJvcHRpb25Hcm91cHNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbkdyb3Vwczp0eXBlb2Ygb3B0aW9uR3JvdXBzIT09XCJ1bmRlZmluZWRcIj9vcHRpb25Hcm91cHM6dW5kZWZpbmVkLFwib3B0aW9uc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uczp0eXBlb2Ygb3B0aW9ucyE9PVwidW5kZWZpbmVkXCI/b3B0aW9uczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzZWxlY3Rvci1pbnBcXFwiLz48dWxcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcInR5cGVsaXN0XCIsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHlwZWxpc3RcXFwiPjwvdWw+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHNlbGVjdGVkLCB1bmRlZmluZWQpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9kaXY+PHNwYW4gY2xhc3M9XFxcInN1YmxhYmVsXFxcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBsYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiOjwvc3Bhbj48dWwgY2xhc3M9XFxcInN1YnJlc3VsdHNcXFwiPlwiKTtcbmlmICggc2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBzZWxlY3RlZFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzZWxlY3RlZDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxpIGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT48c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGkgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjxkaXYgY2xhc3M9XFxcInN1YnNlbGVjdFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1cXFwibG9hZGVyXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY29nIGZhLXNwaW5cXFwiPjwvaT48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJsYWJlbFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubGFiZWw6dHlwZW9mIGxhYmVsIT09XCJ1bmRlZmluZWRcIj9sYWJlbDp1bmRlZmluZWQsXCJzZWxlY3RlZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VsZWN0ZWQ6dHlwZW9mIHNlbGVjdGVkIT09XCJ1bmRlZmluZWRcIj9zZWxlY3RlZDp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwiYWRkLWZhY2V0LWJ0biBmYSBmYS1wbHVzXFxcIj48L2Rpdj5cIik7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPVxuXHRcIkxFRlRcIjogMzdcblx0XCJSSUdIVFwiOiAzOVxuXHRcIlVQXCI6IDM4XG5cdFwiRE9XTlwiOiA0MFxuXHRcIkVTQ1wiOiBbIDIyOSwgMjcgXVxuXHRcIkVOVEVSXCI6IDEzXG5cdFwiVEFCXCI6IDlcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNCYXNlIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHRyZXN1bHRUZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yZXN1bHRfYmFzZS5qYWRlXCIgKVxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAc3ViID0gb3B0aW9ucy5zdWJcblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEBpc09wZW4gPSB0cnVlXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVyblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5UQUIgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLlRBQlxuXHRcdFx0QF9vblRhYkFjdGlvbiggZXZudCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdGNpZDogQGNpZFxuXHRcdHZhbHVlOiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfVwiXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEByZW5kZXIoKVxuXHRcdHBWaWV3Lm9wZW4oKVxuXHRcdHJldHVyblxuXHRcblx0cmVuZGVyOiA9PlxuXHRcdF90bXBsID0gQHRlbXBsYXRlKCAgQGdldFRlbXBsYXRlRGF0YSgpIClcblx0XHRAJGVsLmh0bWwoIF90bXBsIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvcigpIClcblx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCB0cnVlIClcblx0XHRyZXR1cm5cblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXlkb3duXCJcblx0XHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHQkKCBkb2N1bWVudCApLm9mZiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggZmFsc2UgKVxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwib3BlblwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAaXNPcGVuID0gZmFsc2Vcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQGdldFZhbHVlKClcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogLT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRfY2hlY2tTZWxlY3RFbXB0eTogKCBfdmFsICk9PlxuXHRcdGlmIF8uaXNFbXB0eSggX3ZhbCApIGFuZCBub3QgXy5pc051bWJlciggX3ZhbCApIGFuZCBub3QgXy5pc0Jvb2xlYW4oIF92YWwgKVxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0OiA9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBpZiBAX2NoZWNrU2VsZWN0RW1wdHkoIF92YWwgKVxuXHRcdEBzZXQoIF92YWwgKVxuXHRcdHJldHVyblxuXG5cdHNldDogKCB2YWwgKT0+XG5cdFx0X21vZGVsID0gQHJlc3VsdC5maXJzdCgpXG5cdFx0aWYgbm90IF9tb2RlbD9cblx0XHRcdF9Nb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IHZhbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRlbHNlXG5cdFx0XHRfbW9kZWwuc2V0KCB2YWx1ZTogdmFsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNCYXNlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0RhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9kYXRlcmFuZ2UuamFkZVwiIClcblxuXHRmb3JjZWREYXRlUmFuZ2VPcHRzOiA9PlxuXHRcdG9wZW5zOiBcInJpZ2h0XCJcblxuXHRldmVudHM6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHRpZiBub3QgQGRhdGVyYW5nZXBpY2tlcj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCBAZm9yY2VkRGF0ZVJhbmdlT3B0cygpIClcblx0XHRcdEAkaW5wLmRhdGVyYW5nZXBpY2tlciggX29wdHMsIEBfZGF0ZVJldHVybiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyID0gQCRpbnAuZGF0YSggXCJkYXRlcmFuZ2VwaWNrZXJcIiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lcj8uYWRkQ2xhc3MoIFwiZGF0ZXJhbmdlLWlnZ3lcIiApXG5cdFx0XHRcblx0XHRcdCMgcHJldmVudCBmcm9tIGhhbmRsaWNoIHRoZSBvdXRlcmNsaWNrIGV4aXQgZnJvbSBNYWluVmlld1xuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5jb250YWluZXIub24gXCJjbGlja1wiLCAoIGV2bnQgKS0+XG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5lbGVtZW50ID0gQCRpbnBcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0XHRcblx0XHRAJGlucC5vbiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub24oIFwiaGlkZS5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0Y2xvc2U6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5vZmYoIFwiY2FuY2VsLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdEAkaW5wLm9mZiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVyblxuXG5cdHJlbW92ZTogPT5cblx0XHRAZGF0ZXJhbmdlcGlja2VyPy5yZW1vdmUoKVxuXHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBudWxsXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKSBpZiBfcmVzLnZhbHVlWyAxIF0/XG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9kYXRlUmV0dXJuOiAoIEBzdGFydERhdGUsIEBlbmREYXRlICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwidmFsdWVcIiwgQGdldFZhbHVlKCBmYWxzZSApIClcblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ICggcHJlZGVmID0gdHJ1ZSApPT5cblx0XHRpZiBwcmVkZWZcblx0XHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFx0aWYgX3ByZWRlZlZhbD9cblx0XHRcdFx0aWYgbm90IF8uaXNBcnJheSggX3ByZWRlZlZhbCApXG5cdFx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0XHRbIEBzdGFydERhdGUsIEBlbmREYXRlIF0gPSBfcHJlZGVmVmFsXG5cdFx0XHRcdHJldHVybiBfcHJlZGVmVmFsXG5cdFx0X291dCA9IFsgQHN0YXJ0RGF0ZS52YWx1ZU9mKCkgXVxuXHRcdF9vdXQucHVzaCBAZW5kRGF0ZS52YWx1ZU9mKCkgaWYgQGVuZERhdGU/XG5cdFx0cmV0dXJuIF9vdXRcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzRGF0ZVJhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbm5lYXJlc3QgPSAobiwgdiktPlxuXHRuID0gbiAvIHZcblx0biA9IE1hdGgucm91bmQobikgKiB2XG5cdHJldHVybiBuXG5cdFxucHJlY2lzaW9uID0gKG4sIGRwKS0+XG5cdGRwID0gTWF0aC5wb3coMTAsIGRwKVxuXHRuID0gbiAqIGRwXG5cdG4gPSBNYXRoLnJvdW5kKG4pXG5cdG4gPSBuIC8gZHBcblx0cmV0dXJuIG5cblxuY2xhc3MgRmFjZXROdW1iZXJCYXNlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHNldE51bWJlciA9IF8udGhyb3R0bGUoIEBfc2V0TnVtYmVyLCAzMDAsIHtsZWFkaW5nOiBmYWxzZSwgdHJhaWxpbmc6IGZhbHNlfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblxuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRfJGVsID0gJCggZXZudC5jdXJyZW50VGFyZ2V0IClcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92LCBfJGVsIClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSwgZWwgPSBAJGlucCApPT5cblx0XHRfdiA9IGVsLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdF92ID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRlbHNlXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdFx0QF9zZXROdW1iZXIoIF92ICsgY2hhbmdlLCBlbCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdHJldHVybiBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRfc2V0TnVtYmVyOiAoIF92LCBlbCA9IEAkaW5wICk9PlxuXHRcdGlmIGlzTmFOKCBfdiApXG5cdFx0XHQjQCRpbnAudmFsKFwiXCIpXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9jdXJyID0gZWwudmFsKClcblxuXHRcdF92ID0gQHZhbHVlQnlEZWZpbml0aW9uKCBfdilcblx0XHRpZiBfY3VyciAhPSBfdi50b1N0cmluZygpXG5cdFx0XHRlbC52YWwoIF92IClcblx0XHRyZXR1cm5cblxuXHR2YWx1ZUJ5RGVmaW5pdGlvbjogKCBfdmFsdWUgKS0+XG5cdFx0bWF4ID0gQG1vZGVsLmdldCggXCJtYXhcIiApXG5cdFx0bWluID0gQG1vZGVsLmdldCggXCJtaW5cIiApXG5cdFx0c3RlcCA9IEBtb2RlbC5nZXQoIFwic3RlcFwiIClcblx0XHRcblx0XHQjIGZpeCByZXZlcnNlZCBtaW4vbWF4IHNldHRpbmdcblx0XHRpZiBtaW4gPiBtYXhcblx0XHRcdF90bXAgPSBtaW5cblx0XHRcdG1pbiA9IG1heFxuXHRcdFx0bWF4ID0gX3RtcFxuXHRcdFxuXHRcdCMgb24gZXh4ZWRkaW5nIHRoZSBsaW1pdHMgdXNlIHRoZSBsaW1pdFxuXHRcdGlmIG1pbj8gYW5kIF92YWx1ZSA8IG1pblxuXHRcdFx0cmV0dXJuIG1pblxuXHRcdGlmIG1heD8gYW5kIF92YWx1ZSA+IG1heFxuXHRcdFx0cmV0dXJuIG1heFxuXG5cdFx0IyBzZWFyY2ggdGhlIG5lYXJlc3QgX3ZhbHVlIHRvIHRoZSBzdGVwXG5cdFx0aWYgc3RlcCBpc250IDFcblx0XHRcdF92YWx1ZSA9IG5lYXJlc3QoIF92YWx1ZSwgc3RlcCApXG5cdFx0XG5cdFx0IyBjYWxjIHRoZSBwcmVjaXNpb24gYnkgc3RlcFxuXHRcdF9wcmVjaXNpb24gPSBNYXRoLm1heCggMCwgTWF0aC5jZWlsKCBNYXRoLmxvZyggMS9zdGVwICkgLyBNYXRoLmxvZyggMTAgKSApIClcblx0XHRpZiBfcHJlY2lzaW9uID4gMFxuXHRcdFx0X3ZhbHVlID0gcHJlY2lzaW9uKCBfdmFsdWUsIF9wcmVjaXNpb24gKVxuXHRcdGVsc2Vcblx0XHRcdF92YWx1ZSA9IE1hdGgucm91bmQoIF92YWx1ZSApXG5cdFx0XHRcblx0XHRyZXR1cm4gX3ZhbHVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldE51bWJlckJhc2VcbiIsIlN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTdHJpbmdPcHRpb24gZXh0ZW5kcyBTdWJSZXN1bHRzLnByb3RvdHlwZS5tb2RlbFxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIFN0cmluZ09wdGlvbnMgZXh0ZW5kcyBTdWJSZXN1bHRzXG5cdG1vZGVsOiBTdHJpbmdPcHRpb25cblxuXG5jbGFzcyBBcnJheU9wdGlvbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIFwibmFtZVwiICkgb3IgXCItXCJcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIEFycmF5T3B0aW9ucyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEFycmF5T3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViQXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4uL3NlbGVjdG9yXCIgKVxuXHRcblx0dGVtcGxhdGVSZXNMaTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlXCIgKVxuXHRcblx0b3B0RGVmYXVsdDpcblx0XHRsYWJlbDogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblxuXHRzZWxlY3RDb3VudDogMFxuXG5cdG9wdENvbGw6IFN0cmluZ09wdGlvbnNcblx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciBpbnB1dCMje0BjaWR9XCIgXSA9IFwiY2xvc2VcIlxuXHRcdHJldHVybiBfZXZudHNcblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0aWYgQGxvYWRpbmdcblx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFxuXHRybVJlczogKCBldm50ICk9PlxuXHRcdF9pZCA9ICQoIGV2bnQudGFyZ2V0ICk/LmRhdGEoIFwiaWRcIiApXG5cdFx0QHJlc3VsdC5yZW1vdmUoIF9pZCApXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggQHRlbXBsYXRlUmVzTGkoIHR4dDogbW9kZWwuZ2V0TGFiZWwoKSwgaWQ6IG1vZGVsLmlkIClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApP1xuXHRcdFx0QHNlbGVjdENvdW50ID0gb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApXG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKT9cblx0XHRcdG9wdGlvbnMuY3VzdG9tID0gQm9vbGVhbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSApXG5cdFx0XHRcblx0XHRAY29sbGVjdGlvbiA9IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdFxuXHRcdGlmIG5vdCBvcHRpb25zLmN1c3RvbSBhbmQgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdEBzZWxlY3RDb3VudCA9IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0XG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdFxuXHRcdEByZXN1bHQub24gXCJyZW1vdmVcIiwgKCBtZGwsIGNvbGwgKT0+XG5cdFx0XHRpZiBjb2xsLmxlbmd0aFxuXHRcdFx0XHRvcHRpb25zLnN1Yi5yZW5kZXJSZXN1bHQoKVxuXHRcdFx0QHNlYXJjaGNvbGwuYWRkKCBtZGwgKVxuXHRcdFx0QHRyaWdnZXIoIFwicmVtb3ZlZFwiLCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdGlmIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gKCBAcmVzdWx0IG9yIFtdKS5sZW5ndGggPj0gQHNlbGVjdENvdW50XG5cdFx0XG5cdHNlbGVjdDogPT5cblx0XHRpZiBAbG9hZGluZ1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfdmFscyA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgX3ZhbHM/IGFuZCBub3QgXy5pc0FycmF5KCBfdmFscyApXG5cdFx0XHRfdmFscyA9IFsgX3ZhbHMgXVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGZvciBfdmFsIGluICggaWYgQHNlbGVjdENvdW50IDw9IDAgdGhlbiBfdmFscyBlbHNlIF92YWxzWy4uLkBzZWxlY3RDb3VudF0gKVxuXHRcdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX3ZhbCApXG5cdFx0XHRpZiBub3QgX21kbD9cblx0XHRcdFx0X21kbCA9IG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IF92YWwsIGN1c3RvbTogdHJ1ZSApXG5cdFx0XHRAc2VsZWN0ZWQoIF9tZGwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0c2VhcmNoQ29udGVudCA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgc2VhcmNoQ29udGVudD8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0QWN0aXZlKClcblx0XHRcdHJldHVyblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdEBsb2FkaW5nID0gdHJ1ZVxuXHRcdFx0X2NvbGwgPSBuZXcgQG9wdENvbGwoIFtdIClcblx0XHRcdFxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QCRlbC5wYXJlbnQoKS5hZGRDbGFzcyggXCJsb2FkaW5nXCIgKVxuXHRcdFx0XHRvcHRpb25zIEByZXN1bHQsIEBtb2RlbCwgKCBhT3B0cyApPT5cblx0XHRcdFx0XHRmb3IgX29wdCwgaWR4IGluIGFPcHRzXG5cdFx0XHRcdFx0XHRhT3B0c1tpZHhdID0gXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgX29wdCwgeyBjdXN0b206IGZhbHNlIH0gKVxuXHRcdFx0XHRcdF9jb2xsLmFkZCggYU9wdHMgKVxuXHRcdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0XHRAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzKCBcImxvYWRpbmdcIiApXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XG5cdFx0XHQsIDAgKVxuXHRcdFx0cmV0dXJuIF9jb2xsXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3Qob3B0KVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIG5ldyBAb3B0Q29sbCggX29wdHMgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheVxuIiwiY2xhc3MgRmFjZXRTdWJzTnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRcdEAkaW5wT3AucmVtb3ZlKClcblx0XHRcdEAkaW5wT3AgPSBudWxsXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8ucmVsYXRlZFRhcmdldD9cblx0XHRcdF9wb3NXcnAgPSBAZWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgKVxuXHRcdFx0aWYgbm90ICggX3Bvc1dycCBpcyAwIG9yIF9wb3NXcnAgLSAxNiA+PSAwIClcblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRpZiBldm50PyBhbmQgKCBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wLmdldCgwKSBvciBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wT3A/LmdldCgwKSApXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QG1vZGVsLnNldCggeyBvcGVyYXRvcjogQCRpbnBPcC52YWwoKSB9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblxuXHRfb3BTZWxlY3RlZDogPT5cblx0XHRAc2VsZWN0ZWRPUCA9IHRydWVcblx0XHRAZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdGlmIEAkaW5wT3A/IGFuZCBub3QgQHNlbGVjdGVkT1Bcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRfb2xkT3AgPSBAcmVzdWx0LmZpcnN0KClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICksIG9wZXJhdG9yOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKX0gKVxuXG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3AudmFsKClcblx0XHRlbHNlXG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyXG4iLCJjbGFzcyBGYWNldFN1YnNSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmFuZ2UuamFkZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ICggZXh0ID0gXCJfZnJvbVwiICk9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH0je2V4dH1cIlxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcInNlbGVjdFwiXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRyZXR1cm4gXCI8bGk+XCIgK19yZXMudmFsdWUuam9pbiggXCIgLSBcIiApICsgXCI8L2xpPlwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRpbnBUbyA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBUby5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGNsb3NlOiA9PlxuXHRcdHRyeVxuXHRcdFx0QCQoIFwiLnJhbmdlaW5wXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHRfcmV0ID1cblx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdkZyb20gPSBzdXBlclxuXHRcdF92ID0gQCRpbnBUby52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdF92VG8gPSBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRcdHJldHVybiBbIF92RnJvbSwgX3ZUbyBdXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRpZiBfdmFsPy5sZW5ndGggPj0gMlxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzU2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3NlbGVjdC5qYWRlXCIgKVxuXG5cdGZvcmNlZE1vZHVsZU9wdHM6e31cblx0I1x0bXVsdGlwbGU6IHRydWVcblxuXHRkZWZhdWx0TW9kdWxlT3B0czpcblx0XHQjbWF4aW11bVNlbGVjdGlvbkxlbmd0aDogMVxuXHRcdHdpZHRoOiBcImF1dG9cIlxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHRcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAY29udmVydFZhbHVlVG9JbnQgPSBAX2NoZWNrSW50VmFsdWUoIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0ge31cblx0XHRfZXZudHNbIFwiY2xpY2sgLnNlbGVjdC1jaGVja1wiIF0gPSBcInNlbGVjdFwiIGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cdF9nZXRJbnBTZWxlY3RvcjogPT5cblx0XHRyZXR1cm4gXCJzZWxlY3QjI3tAY2lkfVwiXG5cdFx0XG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdCNAX2luaXRTZWxlY3QyKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdCMgcHJldmVudCBmcm9tIGFzeW5jIGxpc3RlbmluZyBvbiBtYW51YWwgYWNjZXNzXG5cdFx0QG1vZGVsLnNldCggXCJ3YWl0Rm9yQXN5bmNcIiwgZmFsc2UgKVxuXHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdEBzZWxlY3QyLiRjb250YWluZXIuc2hvdygpXG5cdFx0QHNlbGVjdDIub3BlbigpXG5cdFx0I2Vsc2Vcblx0XHRcdCNAJGlucC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdGlmIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gKCBAcmVzdWx0IG9yIFtdKS5sZW5ndGggPj0gQHNlbGVjdENvdW50XG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0IyBzZXQgdGhlIGN1cnJlbnQgdmFsdWVzXG5cdFx0X29sZFZhbHMgPSBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFscyApXG5cdFx0XG5cdFx0IyByZXNldCByZXN1bHRzIGFuZCBzZWxlY3QyXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKVxuXHRcdEBzZWxlY3QyLiRjb250YWluZXIub2ZmKClcblx0XHRAc2VsZWN0Mi5kZXN0cm95KClcblx0XHRAcmVzdWx0LnJlc2V0KClcblx0XHRAc2VsZWN0MiA9IG51bGxcblx0XHRcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0X2NoZWNrSW50VmFsdWU6ICggX29wdHMgPSBbXSApPT5cblx0XHRpZiBub3QgX29wdHMgb3Igbm90IF9vcHRzLmxlbmd0aFxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0Zm9yIF92IGluIF9vcHRzXG5cdFx0XHRpZiBfdi52YWx1ZT8gYW5kIF8uaXNTdHJpbmcoIF92LnZhbHVlIClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBfdi5pZD8gYW5kIF8uaXNTdHJpbmcoIF92LmlkIClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBfdj8gYW5kIF8uaXNTdHJpbmcoIF92IClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblx0XHRyZXR1cm4gdHJ1ZVxuXG5cdF9pbml0U2VsZWN0MjogPT5cblx0XHRcblx0XHRpZiBub3QgQHNlbGVjdDI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQGRlZmF1bHRNb2R1bGVPcHRzLCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSBvciBmYWxzZSB9LCBAZm9yY2VkTW9kdWxlT3B0cyApXG5cdFx0XHRAJGlucC5zZWxlY3QyKCBfb3B0cyApXG5cdFx0XHRAc2VsZWN0MiA9IEAkaW5wLmRhdGEoIFwic2VsZWN0MlwiIClcblx0XHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdFx0XHRAJGlucC5vbiBcInNlbGVjdDI6c2VsZWN0XCIsIEBzZWxlY3Rcblx0XHRcdFxuXHRcdFx0IyBhZnRlciBsb2FkaW5nIHRyeSB0byBzZXQgdGhlIGN1cnNvciBmb2N1c1xuXHRcdFx0QHNlbGVjdDIub24gXCJyZXN1bHRzOmFsbFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdEBjb252ZXJ0VmFsdWVUb0ludCA9IEBfY2hlY2tJbnRWYWx1ZSggcmVzdWx0cz8uZGF0YT8ucmVzdWx0cyApXG5cdFx0XHRcdEBzZWxlY3QyLnNlbGVjdGlvbj8uJHNlYXJjaD8uZm9jdXM/KClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRcdCMgbGlzdGVuIHRvIGFzeW5jIHJlc3VsdCBjaGFuZ2VzIGFuZCBzZXQgdGhlIHNlbGVjdGlvblxuXHRcdFx0QHNlbGVjdDIuZGF0YUFkYXB0ZXIuY3VycmVudCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdGlmIEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0XHRcdF9kYXRhID0gW11cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgcmVzdWx0IGluIHJlc3VsdHNcblx0XHRcdFx0XHRcdF9kYXRhLnB1c2ggQF9jb252ZXJ0VmFsdWUoIHJlc3VsdCApXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHQjIHNlbGVjdCB0aGUgYWN0aXZlL3ByZWRlZmluZWQgcmVzdWx0c1xuXHRcdFx0XHRcdEBfc2VsZWN0KCBfZGF0YSApXG5cdFx0XHRcdFx0QGNsb3NlKClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdEBzZWxlY3QyLiRlbGVtZW50LmhpZGUoKVxuXHRcdFx0JCggZG9jdW1lbnQgKS5vbiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm4gQHNlbGVjdDJcblxuXHRfc2VsMm9wZW46ICggZXZudCApLT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRyZW1vdmU6ID0+XG5cdFx0I0AkaW5wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0X2RhdGEgPSBfLmV4dGVuZCgge30sIHN1cGVyLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSwgb3B0aW9uczogQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApICkgfSApXG5cdFx0aWYgX2RhdGEudmFsdWU/IGFuZCBfLmlzQXJyYXkoIF9kYXRhLnZhbHVlIClcblx0XHRcdGZvciBfdiwgX2lkeCBpbiBfZGF0YS52YWx1ZVxuXHRcdFx0XHRfZGF0YS52YWx1ZVsgX2lkeCBdID0gaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX3YgKSBlbHNlIF92LnRvU3RyaW5nKClcblx0XHRlbHNlIGlmIF9kYXRhLnZhbHVlP1xuXHRcdFx0X2RhdGEudmFsdWUgPSBbIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIF9kYXRhLnZhbHVlICkgZWxzZSBfZGF0YS52YWx1ZS50b1N0cmluZygpIF1cblx0XHRcblx0XHRpZiBfZGF0YS52YWx1ZT9cblx0XHRcdF92bGlzdCA9IF8ucGx1Y2soIF9kYXRhLm9wdGlvbnMsIFwidmFsdWVcIiApXG5cdFx0XHRmb3IgX3YgaW4gX2RhdGEudmFsdWUgd2hlbiBfdiBub3QgaW4gX3ZsaXN0XG5cdFx0XHRcdF9kYXRhLm9wdGlvbnMucHVzaCB7IHZhbHVlOiAoIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIF92ICkgZWxzZSBfdi50b1N0cmluZygpICksIGxhYmVsOiBfdiwgZ3JvdXA6IHVuZGVmaW5lZCB9XG5cdFx0XG5cdFx0X2dyb3VwcyA9IF8uZ3JvdXBCeSggX2RhdGEub3B0aW9ucywgXCJncm91cFwiIClcblx0XHRpZiBfLmNvbXBhY3QoIF8ua2V5cyggX2dyb3VwcyBvciB7fSApICkubGVuZ3RoID4gMVxuXHRcdFx0X2RhdGEub3B0aW9uR3JvdXBzID0gX2dyb3Vwc1xuXHRcdHJldHVybiBfZGF0YVxuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAoIGNyZWF0ZSApPT5cblx0XHRpZiBjcmVhdGVcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiBAbW9kZWwuZ2V0KFwibXVsdGlwbGVcIilcblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXl1cFwiXG5cdFx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92YWxzID0gW11cblx0XHRmb3IgZGF0YSBpbiBAX2luaXRTZWxlY3QyKCk/LmRhdGEoKSBvciBbXVxuXHRcdFx0XG5cdFx0XHRfdmFscy5wdXNoKCBAX2NvbnZlcnRWYWx1ZSggZGF0YSApIClcblx0XHRyZXR1cm4gX3ZhbHNcblx0XG5cdF9jb252ZXJ0VmFsdWU6ICggZGF0YSApPT5cblx0XHRfZGF0YSA9IHt9XG5cdFx0aWYgQGNvbnZlcnRWYWx1ZVRvSW50XG5cdFx0XHRfZGF0YS52YWx1ZSA9IHBhcnNlRmxvYXQoIGRhdGEuaWQgKVxuXHRcdGVsc2Vcblx0XHRcdF9kYXRhLnZhbHVlID0gZGF0YS5pZFxuXHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0IGlmIGRhdGEudGV4dD9cblx0XHRyZXR1cm4gX2RhdGFcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiAoIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIG9wdCApIGVsc2Ugb3B0LnRvU3RyaW5nKCkgKSwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCBvcHQgKVxuXHRcdFx0XHRvcHQudmFsdWUgPSBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBvcHQudmFsdWUgKSBlbHNlIG9wdC52YWx1ZS50b1N0cmluZygpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gX29wdHNcblxuXHR1bnNlbGVjdDogKCBldm50ICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdGlmIEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgQHNlbGVjdDI/XG5cdFx0XHQjQHNlbGVjdDI/LmRlc3Ryb3koKVxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5oaWRlKClcblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRAJCggXCIuc2VsZWN0LWNoZWNrXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpIGlmIGV2bnQ/LnN0b3BQcm9wYWdhdGlvblxuXHRcdF92YWxzID0gQGdldFZhbHVlKClcblx0XHRpZiBub3QgX3ZhbHM/Lmxlbmd0aFxuXHRcdFx0IyBJc3N1ZSM0OSBpZiBub3RoaW5nIHdhcyBzZWxlY3RlZCBjbG9zZSB0aGUgc2VsZWN0LXZpZXcgYW5kIHJlbW92ZSB0aGUgd2hvbGUgZmFjZXRcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRAc3ViLmRlbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRAX3NlbGVjdCggX3ZhbHMgKVxuXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdF9zZWxlY3Q6ICggX3ZhbHMgKT0+XG5cdFx0QG1vZGVsLnNldCggXCJ3YWl0Rm9yQXN5bmNcIiwgZmFsc2UgKVxuXHRcdE1vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdGZvciBfdmFsIGluIF92YWxzXG5cdFx0XHRAcmVzdWx0LmFkZCggbmV3IE1vZGVsQ29uc3QoIF92YWwgKSApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzU2VsZWN0XG4iLCJjbGFzcyBGYWNldFN1YlN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zdHJpbmcuamFkZVwiIClcblx0XG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJzZWxlY3RcIlxuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0c3VwZXJcblx0XHR0cnlcblx0XHRcdEAkaW5wPy5yZW1vdmUoKVxuXHRcdHJldHVyblxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdF9vbGRWYWwgPSBAcmVzdWx0LmZpcnN0KCkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3ViU3RyaW5nXG4iLCJTdWJWaWV3ID0gcmVxdWlyZSggXCIuL3N1YlwiIClcblNlbGVjdG9yVmlldyA9IHJlcXVpcmUoIFwiLi9zZWxlY3RvclwiIClcblxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBNYWluVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvd3JhcHBlci5qYWRlXCIgKVxuXG5cdGV2ZW50czpcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0XG5cdFx0QHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcblxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cdFx0XG5cdFx0X2NsID0gXCJpZ2d5IGNsZWFyZml4XCJcblx0XHRpZiBAZWwuY2xhc3NOYW1lPy5sZW5ndGhcblx0XHRcdF9jbCA9IFwiIFwiICsgX2NsXG5cdFx0QGVsLmNsYXNzTmFtZSArPSBfY2xcblx0XHRAcmVuZGVyKClcblx0XHQkKCBkb2N1bWVudCApLm9uIFwia2V5dXBcIiwgQF9vbktleVxuXHRcdEBfb3V0ZXJDbGlja0xpc3RlbigpXG5cdFx0XG5cdFx0X3ZhbHVlRmFjZXRzID0gQGNvbGxlY3Rpb24uZmlsdGVyKCAoIGZjdCApLT5yZXR1cm4gZmN0Py5nZXQoIFwidmFsdWVcIiApPyApXG5cdFx0XG5cdFx0X2ZuU29ydCA9ICgga2V5ICktPlxuXHRcdFx0cmV0dXJuICggdjEsIHYyICktPlxuXHRcdFx0XHRpZiB2MVsga2V5IF0gPiB2Mlsga2V5IF1cblx0XHRcdFx0XHRyZXR1cm4gMVxuXHRcdFx0XHRpZiB2MVsga2V5IF0gPCB2Mlsga2V5IF1cblx0XHRcdFx0XHRyZXR1cm4gLTFcblx0XHRcdFx0cmV0dXJuIDBcblx0XHRcblx0XHRmb3IgZmN0IGluIF92YWx1ZUZhY2V0cy5zb3J0KCBfZm5Tb3J0KCBcIl9pZHhcIiApIClcblx0XHRcdHN1YnZpZXcgPSBAZ2VuU3ViKCBmY3QsIGZhbHNlIClcblx0XHRcblx0XHRAY29sbGVjdGlvbi5vbiBcImFkZFwiLCA9PlxuXHRcdFx0QCRhZGRCdG4uc2hvdygpXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW5kZXI6ID0+XG5cdFx0QCRlbC5odG1sKCBAdGVtcGxhdGUoKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRyZXR1cm5cblxuXHRfYWRkRmFjZXQ6ICggZXZudCApPT5cblx0XHRAYWRkRmFjZXQoKVxuXHRcdHJldHVyblxuXG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5FU0Mgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0QGV4aXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRleGl0OiAoIG5leHRBZGQgPSB0cnVlICk9PlxuXHRcdGlmIEBzdWJ2aWV3XG5cdFx0XHRAc3Vidmlldy5jbG9zZSgpXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIG5leHRBZGRcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHQjY29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTRUxFQ1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuY2xvc2UoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW1GYWNldDogKCBmYWNldE0gKT0+XG5cdFx0QHJlc3VsdHMucmVtb3ZlKCBmYWNldE0uZ2V0KCBcIm5hbWVcIiApIClcblx0XHRyZXR1cm5cblxuXHRzZXRGYWNldDogKCBmYWNldE0sIGRhdGEgKT0+XG5cdFx0QGNvbGxlY3Rpb24ucmVtb3ZlKCBmYWNldE0gKVxuXG5cdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggZGF0YSwgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDogZmFjZXRNIH0gKVxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdEAkYWRkQnRuLmhpZGUoKVxuXHRcdHJldHVyblxuXG5cdGdlblN1YjogKCBmYWNldE0sIGFkZEFmdGVyID0gdHJ1ZSApPT5cblx0XHRzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBwYXJlbnQ6IEAgKVxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1VCIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0I3N1YnZpZXcub2ZmKClcblx0XHRcdHN1YnZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBhZGRBZnRlclxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0c3Vidmlldy5vbiBcInJlb3BlblwiLCA9PlxuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0c3Vidmlldy5vbiggXCJzZWxlY3RlZFwiLCBAc2V0RmFjZXQgKVxuXHRcdFxuXHRcdEAkYWRkQnRuLmJlZm9yZSggc3Vidmlldy5yZW5kZXIoKSApXG5cdFx0cmV0dXJuIHN1YnZpZXdcblxuXHRhZGRGYWNldDogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBTRUxFQ1QgRVhJU1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBAc3Vidmlldz9cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBTVUIgRVhJU1RcIlxuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgRU1QVFkgQ09MTFwiXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IFNlbGVjdG9yVmlldyggY29sbGVjdGlvbjogQGNvbGxlY3Rpb24sIGN1c3RvbTogZmFsc2UgKVxuXG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXHRcdFxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU0VMRUNUIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRpZiBub3QgcmVzdWx0cz8ubGVuZ3RoIGFuZCBAc3Vidmlldz9cblx0XHRcdFx0I0BzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNICk9PlxuXHRcdFx0ZmFjZXRNLnNldCggXCJ2YWx1ZVwiLCBudWxsIClcblx0XHRcdEBzdWJ2aWV3ID0gQGdlblN1YiggZmFjZXRNIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRfb3V0ZXJDbGlja0xpc3RlbjogPT5cblx0XHRqUXVlcnkoIGRvY3VtZW50ICkub24gXCJjbGlja1wiLCBAX291dGVyQ2xpY2tcblx0XHRyZXR1cm5cblxuXHRfb3V0ZXJDbGljazogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRfcG9zV3JwID0gQGVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBldm50LnRhcmdldCApXG5cdFx0aWYgbm90ICggX3Bvc1dycCBpcyAwIG9yIF9wb3NXcnAgLSAxNiA+PSAwIClcblx0XHRcdEBleGl0KCBmYWxzZSApXG5cdFx0cmV0dXJuXG5cdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5WaWV3XG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFNlbGVjdG9yVmlldyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldHMvYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3IuamFkZVwiIClcblx0dGVtcGxhdGVFbDogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3RvcmxpLmphZGVcIiApXG5cdHNlbGVjdENvdW50OiAxXG5cblx0Y2xhc3NOYW1lOiA9PlxuXHRcdGNscyA9IFsgXCJhZGQtZmFjZXRcIiBdXG5cdFx0aWYgQGN1c3RvbVxuXHRcdFx0Y2xzLnB1c2ggXCJjdXN0b21cIlxuXHRcdHJldHVybiBjbHMuam9pbiggXCIgXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRcIm1vdXNlZG93biBhXCI6IFwiX29uQ2xpY2tcIlxuXHRcdFwiZm9jdXMgaW5wdXQjI3tAY2lkfVwiOiBcIm9wZW5cIlxuXHRcdCNcImJsdXIgaW5wdXQjI3tAY2lkfVwiOiBcImNsb3NlXCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBjdXN0b20gPSAgb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzZWFyY2hjb2xsID0gQGNvbGxlY3Rpb24uc3ViKCAtPnRydWUgKVxuXHRcdEByZXN1bHQgPSBuZXcgQGNvbGxlY3Rpb24uY29uc3RydWN0b3IoKVxuXHRcdFxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwiYWRkXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEBjaGVja09wdGlvbnNFbXB0eSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIGN1c3RvbTogQGN1c3RvbSApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRsaXN0ID0gQCRlbC5maW5kKCBcIiMje0BjaWR9dHlwZWxpc3RcIiApXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdHJlbmRlclJlczogPT5cblx0XHRAJGxpc3QuZW1wdHkoKVxuXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEBzZWFyY2hjb2xsLm1vZGVsc1xuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdF90bXBsID0gbW9kZWwuZ2V0KCBcImxhYmVsdGVtcGxhdGVcIiApXG5cdFx0XHRpZiBfdG1wbD9cblx0XHRcdFx0X2xibCA9IF90bXBsLnJlcGxhY2UoIFwie3tsYWJlbH19XCIsIF9sYmwgKVxuXHRcdFx0XHRcblx0XHRcdF9pZCA9IG1vZGVsLmlkXG5cdFx0XHRfY3NzY2xhc3MgPSBtb2RlbC5nZXQoIFwiY3NzY2xhc3NcIiApXG5cdFx0XHRpZiBAY3VyclF1ZXJ5Py5sZW5ndGggPiAxXG5cdFx0XHRcdF9sYmwgPSBfbGJsLnJlcGxhY2UoIG5ldyBSZWdFeHAoIEBjdXJyUXVlcnksIFwiZ2lcIiApLCAoKCBzdHIgKS0+cmV0dXJuIFwiPGI+I3tzdHJ9PC9iPlwiICkgKVxuXHRcdFx0X2xpc3QucHVzaCBsYWJlbDogX2xibCwgaWQ6IF9pZCwgY3NzY2xhc3M6IF9jc3NjbGFzc1xuXHRcdEAkbGlzdC5hcHBlbmQoIEB0ZW1wbGF0ZUVsKCBsaXN0OiBfbGlzdCwgcXVlcnk6IEBjdXJyUXVlcnksIGFjdGl2ZUlkeDogQGFjdGl2ZUlkeCwgY3VzdG9tOiBAY3VzdG9tICkgKVxuXG5cdFx0QF9jaGVja1Njcm9sbCgpXG5cdFx0XG5cdFx0cmV0dXJuIEAkbGlzdFxuXG5cdF9zY3JvbGxUaWxsOiAxOThcblx0X2NoZWNrU2Nyb2xsOiA9PlxuXHRcdF9oZWlnaHQgPSBAJGxpc3QuaGVpZ2h0KClcblx0XHRpZiBfaGVpZ2h0ID4gMFxuXHRcdFx0QHNjcm9sbEhlbHBlciggX2hlaWdodCApXG5cdFx0XHRyZXR1cm5cblxuXHRcdCMgZXhpdCB0aGUgdGhlIGNhbGwgc3RhY2sgdG8gY2hlY2sgaGVpZ2h0IGFmdGVyIHRoZSBtb2R1bGUgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGRvbVxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBAJGxpc3QuaGVpZ2h0KCkgKVxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cblx0c2Nyb2xsSGVscGVyOiAoIGhlaWdodCApPT5cblx0XHRpZiBoZWlnaHQgPj0gQF9zY3JvbGxUaWxsXG5cdFx0XHRAc2Nyb2xsaW5nID0gdHJ1ZVxuXHRcdGVsc2Vcblx0XHRcdEBzY3JvbGxpbmcgPSBmYWxzZVxuXHRcdHJldHVyblxuXG5cdGNoZWNrT3B0aW9uc0VtcHR5OiA9PlxuXHRcdCNpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gMFxuXHRcdCNcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0X29uQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRfaWQgPSBAJCggZXZudC5jdXJyZW50VGFyZ2V0ICkuZGF0YSggXCJpZFwiIClcblx0XHRpZiBub3QgX2lkP1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfaWQgKVxuXHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRAc2VsZWN0ZWQoIF9tZGwgKVxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0X2lzRnVsbDogPT5cblx0XHRyZXR1cm4gdHJ1ZVxuXHRcblx0c2VsZWN0ZWQ6ICggbWRsICk9PlxuXHRcdHRyeVxuXHRcdFx0aWYgbWRsLm9ubHlFeGVjP1xuXHRcdFx0XHRtZGw/LmV4ZWM/KClcblx0XHRcdFx0cmV0dXJuXG5cdFx0Y2F0Y2ggX2VyclxuXHRcdFx0dHJ5XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIIC0gQ2xhc3M6I3sgQGNvbnN0cnVjdG9yLm5hbWUgfSAtIGFjdGl2ZUlkeDoje0BhY3RpdmVJZHh9IC0gY29sbGVjdGlvbjoje0pTT04uc3RyaW5naWZ5KCBAY29sbGVjdGlvbi50b0pTT04oKSl9XCJcblx0XHRcdGNhdGNoIF9lcnJlcnJcblx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyMzogQ0FUQ0hcIlxuXHRcdFxuXHRcdGlmIG1kbD9cblx0XHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggbWRsIClcblx0XHRcdEByZXN1bHQuYWRkKCBtZGwgKVxuXHRcdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBtZGxcblx0XHRcblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3RBY3RpdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cblx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKT0+XG5cdFx0XHRpZiBAcmVzdWx0LmdldCggbWRsLmlkICk/XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgbm90IF9xPy5sZW5ndGhcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdF9tYXRjaCA9IG1kbC5tYXRjaCggX3EgKVxuXHRcdFx0cmV0dXJuIF9tYXRjaFxuXHRcdCwgZmFsc2UgKVxuXG5cblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblx0XG5cdFx0X2N1c3RvbUVsZW1lbnRDaGFuZ2UgPSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGggdGhlbiAwIGVsc2UgMVxuXHRcdF90b3AgPSAwXG5cdFx0aWYgdXBcblx0XHRcdGlmICggQGFjdGl2ZUlkeCAtIDEgKSA8IF90b3Bcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCAtIDFcblx0XHRlbHNlXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggLSBfY3VzdG9tRWxlbWVudENoYW5nZSA8PSBAYWN0aXZlSWR4XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggKyAxXG5cblx0XHRcblx0XHRAJCggX2xpc3RbIEBhY3RpdmVJZHggXSApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiIClcblx0XHRfJGVsbmV3ID0gQCQoIF9saXN0WyBfbmV3aWR4IF0gKS5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG5cblx0XHRpZiBAc2Nyb2xsaW5nXG5cdFx0XHRfZWxIID0gXyRlbG5ldy5vdXRlckhlaWdodCgpXG5cdFx0XHRfcG9zID0gX2VsSCAqICggX25ld2lkeCArIDEgKVxuXHRcdFx0XyRsaXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdFwiIClcblx0XHRcdF9zY3JvbGxUID0gXyRsaXN0LnNjcm9sbFRvcCgpXG5cdFx0XHRpZiBfcG9zID4gX3Njcm9sbFQgKyBAX3Njcm9sbFRpbGxcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIEBfc2Nyb2xsVGlsbCApXG5cdFx0XHRlbHNlIGlmIF9wb3MgPCBfc2Nyb2xsVCArIF9lbEhcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIF9lbEggKVxuXG5cdFx0QGFjdGl2ZUlkeCA9IF9uZXdpZHhcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6PT5cblx0XHRyZXR1cm5cblxuXHRzZWxlY3RBY3RpdmU6ICggaXNFbnRlckV2ZW50PWZhbHNlICk9PlxuXHRcdFxuXHRcdF9zZWwgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGEuYWN0aXZlXCIgKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApLmRhdGEoKVxuXHRcdFx0XG5cdFx0X3NlYXJjaCA9IEAkaW5wLnZhbCgpXG5cdFx0XG5cdFx0aWYgIG5vdCBfc2VsPyBhbmQgQHNlbGVjdENvdW50IGlzbnQgMSBhbmQgaXNFbnRlckV2ZW50IGFuZCBub3QgX3NlYXJjaD8ubGVuZ3RoXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRpZiBub3QgX3NlbD9cblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0aWYgX3NlbD8uaWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBAY29sbGVjdGlvbi5nZXQoIF9zZWwuaWQgKSApXG5cdFx0ZWxzZSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlICkgKVxuXHRcdFx0QCRpbnAudmFsKCBcIlwiIClcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclZpZXdcbiIsImNsYXNzIFZpZXdTdWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3N1Yi5qYWRlXCIgKVxuXHRjbGFzc05hbWU6ID0+XG5cdFx0X3N0ZCA9IFwic3ViXCJcblx0XHRfdHlwZSA9IEBtb2RlbC5nZXQoIFwidHlwZVwiIClcblx0XHRpZiBfdHlwZT9cblx0XHRcdF9zdGQgKz0gXCIgc3ViLXR5cGUtXCIgKyBfdHlwZVxuXHRcdFxuXHRcdF9uYW1lID0gQG1vZGVsLmdldCggXCJuYW1lXCIgKVxuXHRcdGlmIF9uYW1lP1xuXHRcdFx0X3N0ZCArPSBcIiBzdWItbmFtZS1cIiArIF9uYW1lXG5cdFx0cmV0dXJuIF9zdGRcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdEByZXN1bHQgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpXG5cdFx0QCRlbC5vbiBcImNsaWNrXCIsIEByZW9wZW5cblx0XHRAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblx0XHRyZXR1cm5cblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblxuXHRyZW5kZXI6ICggb3B0TWRsICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0dHJ5XG5cdFx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0Y2F0Y2ggX2VyclxuXHRcdFx0XHR0cnlcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBtb2RlbDoje0pTT04uc3RyaW5naWZ5KEBtb2RlbC50b0pTT04oKSl9IC0gcmVzdWx0OiN7SlNPTi5zdHJpbmdpZnkoIEByZXN1bHQudG9KU09OKCkpfVwiXG5cdFx0XHRcdGNhdGNoIF9lcnJlcnJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSFwiXG5cdFx0XG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZSggbGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpLCBzZWxlY3RlZDogX2xpc3QsIHR5cGU6IEBtb2RlbC5nZXQoIFwidHlwZVwiICksIG5hbWU6IEBtb2RlbC5nZXQoIFwibmFtZVwiICkgKVxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cdFx0cmV0dXJuIEBlbFxuXHRcblx0cmVvcGVuOiAoIGV2bnQgKT0+XG5cdFx0aWYgJCggZXZudC50YXJnZXQgKS5pcyggXCIucm0tcmVzdWx0LWJ0blwiICkgYW5kIEBzZWxlY3R2aWV3Py5ybVJlcz9cblx0XHRcdEBzZWxlY3R2aWV3LnJtUmVzKCBldm50IClcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgbm90IEBfaXNPcGVuIGFuZCBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3LnJlb3BlbiggQCApXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEB0cmlnZ2VyKCBcInJlb3BlblwiIClcblx0XHRyZXR1cm5cblx0XHRcblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAc2VsZWN0dmlldz8ucmVtb3ZlKClcblx0XHRAcGFyZW50ID0gbnVsbFxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsLCB7IG1lcmdlOiB0cnVlIH0gKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRyZXR1cm5cblx0XG5cdHJlbW92ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBvcHRNZGwgKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRpZiBAcmVzdWx0Lmxlbmd0aCA8PSAwXG5cdFx0XHRAZGVsKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRyZXR1cm5cblxuXHRpc09wZW46ID0+XG5cdFx0cmV0dXJuIEBzZWxlY3R2aWV3P1xuXG5cdGZvY3VzOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdEBvcGVuKClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8ub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRnZW5lcmF0ZVN1YjogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBhdHRhY2hTdWJFdmVudHMoKVxuXHRcdFx0cmV0dXJuIEBzZWxlY3R2aWV3XG5cdFx0XHRcblx0XHRAc2VsZWN0dmlldyA9IG5ldyBAbW9kZWwuU3ViVmlldyggc3ViOiBALCBtb2RlbDogQG1vZGVsLCBlbDogQCRzdWIgKVxuXHRcdEBhdHRhY2hTdWJFdmVudHMoKVxuXHRcdFx0XG5cdFx0QCRlbC5hcHBlbmQoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRpZiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiICk/XG5cdFx0XHRAc2VsZWN0dmlldy5zZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRhdHRhY2hTdWJFdmVudHM6ID0+XG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHQgKT0+XG5cdFx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0XHQjQHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgcmVzdWx0IClcblx0XHRcdEByZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggbWRsICk9PlxuXHRcdFx0aWYgbWRsXG5cdFx0XHRcdEBzZWxlY3RlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwicmVtb3ZlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAcmVtb3ZlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cblx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdEBfaXNPcGVuID0gdHJ1ZVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdTdWJcbiIsbnVsbCwiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuamFkZSA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgamFkZV9lbmNvZGVfaHRtbF9ydWxlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnXG59O1xudmFyIGphZGVfbWF0Y2hfaHRtbCA9IC9bJjw+XCJdL2c7XG5cbmZ1bmN0aW9uIGphZGVfZW5jb2RlX2NoYXIoYykge1xuICByZXR1cm4gamFkZV9lbmNvZGVfaHRtbF9ydWxlc1tjXSB8fCBjO1xufVxuXG5leHBvcnRzLmVzY2FwZSA9IGphZGVfZXNjYXBlO1xuZnVuY3Rpb24gamFkZV9lc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbCkucmVwbGFjZShqYWRlX21hdGNoX2h0bWwsIGphZGVfZW5jb2RlX2NoYXIpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbmV4cG9ydHMuRGVidWdJdGVtID0gZnVuY3Rpb24gRGVidWdJdGVtKGxpbmVubywgZmlsZW5hbWUpIHtcbiAgdGhpcy5saW5lbm8gPSBsaW5lbm87XG4gIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbn1cblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyJdfQ==
