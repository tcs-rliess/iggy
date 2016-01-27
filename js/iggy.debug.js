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
    var _fct, _ret, facet, i, len;
    if (options == null) {
      options = {};
    }
    _ret = [];
    for (i = 0, len = facets.length; i < len; i++) {
      facet = facets[i];
      if ((_fct = this._createFacet(facet)) != null) {
        _ret.push(_fct);
      }
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
    var _data, _groups, _v, _vlist, i, len, ref;
    _data = _.extend({}, FacetSubsSelect.__super__.getTemplateData.apply(this, arguments), {
      multiple: this.model.get("multiple"),
      options: this._createOptionCollection(this.model.get("options"))
    });
    if ((_data.value != null) && !_.isArray(_data.value)) {
      _data.value = [this.convertValueToInt ? _data.value : _data.value.toString()];
    }
    if (_data.value != null) {
      _vlist = _.pluck(_data.options, "value");
      ref = _data.value;
      for (i = 0, len = ref.length; i < len; i++) {
        _v = ref[i];
        if (indexOf.call(_vlist, _v) < 0) {
          _data.options.push({
            value: (this.convertValueToInt ? _v : _v.toString()),
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
          value: (this.convertValueToInt ? opt : opt.toString()),
          label: opt,
          group: null
        });
      } else if (_.isObject(opt)) {
        opt.value = this.convertValueToInt ? opt.value : opt.value.toString();
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3JhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvZmFjZXRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9zdWJyZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvdG1wbHMvYXJyYXlfcmVzdWx0bGkuamFkZSIsIl9zcmMvanMvdG1wbHMvZGF0ZXJhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL251bWJlci5qYWRlIiwiX3NyYy9qcy90bXBscy9yYW5nZS5qYWRlIiwiX3NyYy9qcy90bXBscy9yZXN1bHRfYmFzZS5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3QuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3IuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0b3JsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9zdHJpbmcuamFkZSIsIl9zcmMvanMvdG1wbHMvc3ViLmphZGUiLCJfc3JjL2pzL3RtcGxzL3dyYXBwZXIuamFkZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3V0aWxzL2tleWNvZGVzLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL251bWJlcl9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VibnVtYmVyLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmcuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9zdWIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9qYWRlL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDRHQUFBO0VBQUE7Ozs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLGNBQVQ7O0FBQ1gsTUFBQSxHQUFTLE9BQUEsQ0FBUyxpQkFBVDs7QUFDVCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsU0FBQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVDs7QUFDWixTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsWUFBQSxHQUFlLE9BQUEsQ0FBUywwQkFBVDs7QUFDZixRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLE9BQUEsR0FBVSxPQUFBLENBQVMsa0JBQVQ7O0FBRUo7OztpQkFDTCxDQUFBLEdBQUc7O0VBQ1UsY0FBRSxFQUFGLEVBQU0sTUFBTixFQUFtQixPQUFuQjs7TUFBTSxTQUFTOzs7TUFBSSxVQUFVOzs7Ozs7Ozs7SUFDekMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksUUFBUSxDQUFDLE1BQXJCO0lBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQUdBLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBYSxFQUFiO0lBQ1AsSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUE7SUFDWCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxNQUFYLEVBQW1CLElBQW5CO0lBR0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsY0FBRCxDQUFpQixNQUFqQixFQUF5QixPQUF6QjtJQUNWLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxPQUFBLENBQVMsSUFBVCxFQUFlLE9BQWY7SUFFZixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxLQUFaLEVBQW1CLElBQUMsQ0FBQSxhQUFwQjtJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFFBQVosRUFBc0IsSUFBQyxDQUFBLGFBQXZCO0lBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksUUFBWixFQUFzQixJQUFDLENBQUEsYUFBdkI7SUFFQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsUUFBQSxDQUFVO01BQUEsRUFBQSxFQUFJLElBQUMsQ0FBQSxHQUFMO01BQVUsVUFBQSxFQUFZLElBQUMsQ0FBQSxNQUF2QjtNQUErQixPQUFBLEVBQVMsSUFBQyxDQUFBLE9BQXpDO0tBQVY7QUFDWjtFQWxCWTs7aUJBb0JiLFVBQUEsR0FBWSxTQUFFLEVBQUY7QUFFWCxRQUFBO0lBQUEsSUFBTyxVQUFQO0FBQ0MsWUFBTSxJQUFDLENBQUEsTUFBRCxDQUFTLFlBQVQsRUFEUDs7SUFHQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksRUFBWixDQUFIO01BQ0MsSUFBRyxDQUFJLEVBQUUsQ0FBQyxNQUFWO0FBQ0MsY0FBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGdCQUFULEVBRFA7O01BR0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxDQUFELENBQUksRUFBSjtNQUNQLElBQUcsaUJBQUksSUFBSSxDQUFFLGdCQUFiO0FBQ0MsY0FBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGtCQUFULEVBRFA7O0FBR0EsYUFBTyxLQVJSOztJQVVBLElBQUcsRUFBQSxZQUFjLE1BQWpCO01BQ0MsSUFBRyxDQUFJLEVBQUUsQ0FBQyxNQUFWO0FBQ0MsY0FBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGdCQUFULEVBRFA7O01BSUEsSUFBRyxFQUFFLENBQUMsTUFBSCxHQUFZLENBQWY7QUFDQyxjQUFNLElBQUMsQ0FBQSxNQUFELENBQVMsZUFBVCxFQURQOztBQUdBLGFBQU8sR0FSUjs7SUFVQSxJQUFHLEVBQUEsWUFBYyxPQUFqQjtBQUNDLGFBQU8sSUFBQyxDQUFBLENBQUQsQ0FBSSxFQUFKLEVBRFI7O0FBR0EsVUFBTSxJQUFDLENBQUEsTUFBRCxDQUFTLGdCQUFUO0VBNUJLOztpQkFnQ1osY0FBQSxHQUFnQixTQUFFLE1BQUYsRUFBVSxPQUFWO0FBQ2YsUUFBQTs7TUFEeUIsVUFBUTs7SUFDakMsSUFBQSxHQUFPO0FBQ1AsU0FBQSx3Q0FBQTs7VUFBeUI7UUFDeEIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWOztBQUREO0FBR0EsV0FBVyxJQUFBLE1BQUEsQ0FBUSxJQUFSLEVBQWMsT0FBZDtFQUxJOztpQkFPaEIsWUFBQSxHQUFjLFNBQUUsS0FBRjtBQUNiLFlBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFYLENBQUEsQ0FBUDtBQUFBLFdBQ00sUUFETjtBQUNvQixlQUFXLElBQUEsU0FBQSxDQUFXLEtBQVgsRUFBa0I7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUFsQjtBQUQvQixXQUVNLFFBRk47QUFFb0IsZUFBVyxJQUFBLFNBQUEsQ0FBVyxLQUFYLEVBQWtCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBbEI7QUFGL0IsV0FHTSxPQUhOO0FBR21CLGVBQVcsSUFBQSxRQUFBLENBQVUsS0FBVixFQUFpQjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQWpCO0FBSDlCLFdBSU0sUUFKTjtBQUlvQixlQUFXLElBQUEsU0FBQSxDQUFXLEtBQVgsRUFBa0I7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUFsQjtBQUovQixXQUtNLE9BTE47QUFLbUIsZUFBVyxJQUFBLFFBQUEsQ0FBVSxLQUFWLEVBQWlCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBakI7QUFMOUIsV0FNTSxXQU5OO0FBTXVCLGVBQVcsSUFBQSxZQUFBLENBQWMsS0FBZCxFQUFxQjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQXJCO0FBTmxDLFdBT00sT0FQTjtBQU9tQixlQUFXLElBQUEsUUFBQSxDQUFVLEtBQVYsRUFBaUI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUFqQjtBQVA5QjtFQURhOztpQkFVZCxRQUFBLEdBQVUsU0FBRSxLQUFGO0FBQ1QsUUFBQTtJQUFBLElBQU8sbUJBQVA7QUFDQyxhQUREOztJQUVBLElBQUcseUNBQUg7TUFDQyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBYSxJQUFiLEVBREQ7O0FBRUEsV0FBTztFQUxFOztpQkFPVixNQUFBLEdBQVEsU0FBRSxJQUFGLEVBQVEsSUFBUjtBQUNQLFFBQUE7O01BRGUsT0FBTzs7SUFDdEIsSUFBRyx5QkFBSDtNQUNDLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBUSxDQUFBLElBQUEsQ0FBVCxDQUFpQixJQUFqQixFQURSO0tBQUEsTUFBQTtNQUdDLElBQUEsR0FBTyxJQUhSOztJQUlBLElBQUEsR0FBVyxJQUFBLEtBQUEsQ0FBQTtJQUNYLElBQUksQ0FBQyxJQUFMLEdBQVk7SUFDWixJQUFJLENBQUMsT0FBTCxHQUFlO0FBQ2YsV0FBTztFQVJBOztpQkFVUixRQUFBLEdBQVUsU0FBQTtBQUNULFdBQU8sSUFBQyxDQUFBO0VBREM7O2lCQUdWLGFBQUEsR0FBZSxTQUFBO0lBQ2QsSUFBQyxDQUFBLE9BQUQsQ0FBVSxRQUFWLEVBQW9CLElBQUMsQ0FBQSxPQUFyQjtFQURjOztpQkFJZixXQUFBLEdBQWEsU0FBQTtBQUNaLFFBQUE7SUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1Y7QUFBQSxTQUFBLFNBQUE7O01BQ0MsSUFBQyxDQUFBLE1BQVEsQ0FBQSxFQUFBLENBQVQsR0FBZ0IsQ0FBQyxDQUFDLFFBQUYsQ0FBWSxLQUFaO0FBRGpCO0VBRlk7O2lCQU1iLE1BQUEsR0FBUSxTQUFBO1dBQ1A7TUFBQSxrQkFBQSxFQUFvQiwyRkFBcEI7TUFDQSxnQkFBQSxFQUFrQixzQ0FEbEI7TUFFQSxnQkFBQSxFQUFrQiwyREFGbEI7TUFHQSxlQUFBLEVBQWlCLDBEQUhqQjtNQUlBLGdCQUFBLEVBQWtCLDBFQUpsQjtNQUtBLFlBQUEsRUFBYyw2QkFMZDs7RUFETzs7OztHQXJHVSxRQUFRLENBQUM7O0FBNkc1QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7QUN4SGpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUEsV0FBQTtFQUFBOzs7OztBQXdCTTs7Ozs7Ozs7Ozs7QUFDTDs7Ozs7Ozs7Ozs7Ozs7O3dCQWNBLEdBQUEsR0FBSyxTQUFFLE1BQUY7QUFDSixRQUFBO0lBQUEsSUFBQyxDQUFBLGFBQUQsSUFBQyxDQUFBLFdBQWE7SUFDZCxRQUFBLEdBQVcsSUFBQyxDQUFBLGtCQUFELENBQXFCLE1BQXJCO0lBR1gsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUjtJQUVWLElBQUEsR0FBVyxJQUFBLElBQUMsQ0FBQSxXQUFELENBQWMsT0FBZCxFQUF1QixJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUF2QjtJQUVYLElBQUksQ0FBQyxVQUFMLEdBQWtCO0lBQ2xCLElBQUksQ0FBQyxTQUFMLEdBQWlCO0lBS2pCLElBQUMsQ0FBQSxFQUFELENBQUksUUFBSixFQUFjLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGO0FBQ3JCLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBWSxFQUFaO01BQ1IsS0FBQSxHQUFRO01BQ1IsSUFBRyxLQUFBLElBQVUsQ0FBSSxLQUFqQjtRQUNDLElBQUMsQ0FBQSxNQUFELENBQVMsRUFBVCxFQUREO09BQUEsTUFFSyxJQUFHLENBQUksS0FBSixJQUFjLEtBQWpCO1FBQ0osSUFBQyxDQUFBLEdBQUQsQ0FBTSxFQUFOLEVBREk7O0lBTGdCLENBQVIsRUFRWixJQVJZLENBQWQ7SUFXQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBZSxDQUFDLENBQUMsSUFBRixDQUFRLFNBQUUsRUFBRjtNQUN0QixJQUFDLENBQUEsR0FBRCxDQUFNLEVBQU47SUFEc0IsQ0FBUixFQUdiLElBSGEsQ0FBZjtJQU1BLElBQUMsQ0FBQSxFQUFELENBQUksS0FBSixFQUFXLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGO01BQ2xCLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBWSxFQUFaLENBQUg7UUFDQyxJQUFDLENBQUEsR0FBRCxDQUFNLEVBQU4sRUFERDs7SUFEa0IsQ0FBUixFQUlULElBSlMsQ0FBWDtJQU9BLElBQUksQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFrQixDQUFDLENBQUMsSUFBRixDQUFRLFNBQUUsRUFBRixHQUFBLENBQVIsRUFHaEIsSUFIZ0IsQ0FBbEI7SUFNQSxJQUFDLENBQUEsRUFBRCxDQUFJLFFBQUosRUFBYyxDQUFDLENBQUMsSUFBRixDQUFRLFNBQUUsRUFBRjtNQUNyQixJQUFDLENBQUEsTUFBRCxDQUFTLEVBQVQ7SUFEcUIsQ0FBUixFQUdaLElBSFksQ0FBZDtJQU1BLElBQUMsQ0FBQSxFQUFELENBQUksT0FBSixFQUFhLENBQUMsQ0FBQyxJQUFGLENBQVEsU0FBRSxFQUFGO01BQ3BCLElBQUMsQ0FBQSxlQUFELENBQUE7SUFEb0IsQ0FBUixFQUdYLElBSFcsQ0FBYjtJQU1BLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFnQixJQUFoQjtBQUVBLFdBQU87RUEzREg7OztBQTZETDs7Ozs7Ozs7Ozs7O3dCQVdBLHNCQUFBLEdBQXdCLFNBQUE7QUFDdkIsV0FBTztFQURnQjs7O0FBR3hCOzs7Ozs7Ozs7Ozs7Ozt3QkFhQSxlQUFBLEdBQWlCLFNBQUUsTUFBRixFQUFVLE9BQVY7QUFDaEIsUUFBQTs7TUFEMEIsVUFBVTs7SUFDcEMsSUFBRyx1QkFBSDtNQUdDLElBQThDLGNBQTlDO1FBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsa0JBQUQsQ0FBcUIsTUFBckIsRUFBYjs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW9CLElBQUMsQ0FBQSxTQUFyQjtNQUdWLElBQUcsT0FBSDtRQUNDLElBQUMsQ0FBQSxLQUFELENBQVEsT0FBUjtBQUNBLGVBQU8sS0FGUjs7TUFJQSxNQUFBLEdBQVMsQ0FBQyxDQUFDLEtBQUYsQ0FBUyxPQUFULEVBQWtCLEtBQWxCO01BQ1QsT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVMsSUFBQyxDQUFBLE1BQVYsRUFBa0IsS0FBbEI7QUFDVjtBQUFBLFdBQUEscUNBQUE7O1FBQ0MsSUFBQyxDQUFBLE1BQUQsQ0FBUyxHQUFUO0FBREQ7TUFHQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLFVBQUYsQ0FBYyxNQUFkLEVBQXNCLE9BQXRCO0FBQ1YsV0FBQSwyQ0FBQTs7bUJBQXdCLEdBQUcsQ0FBQyxHQUFKLEVBQUEsYUFBVyxPQUFYLEVBQUEsSUFBQTtVQUN2QixJQUFDLENBQUEsR0FBRCxDQUFNLEdBQU47O0FBREQsT0FsQkQ7O0FBcUJBLFdBQU87RUF0QlM7OztBQXlCakI7Ozs7Ozs7Ozs7Ozs7O3dCQWFBLGtCQUFBLEdBQW9CLFNBQUUsTUFBRjtBQUVuQixRQUFBO0lBQUEsSUFBRyxDQUFDLENBQUMsVUFBRixDQUFjLE1BQWQsQ0FBSDtNQUNDLFFBQUEsR0FBVyxPQURaO0tBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVcsTUFBWCxDQUFIO01BQ0osUUFBQSxHQUFXLFNBQUUsRUFBRjtBQUNWLFlBQUE7cUJBQUEsRUFBRSxDQUFDLEVBQUgsRUFBQSxhQUFTLE1BQVQsRUFBQSxHQUFBO01BRFUsRUFEUDtLQUFBLE1BR0EsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFZLE1BQVosQ0FBQSxJQUF3QixDQUFDLENBQUMsUUFBRixDQUFZLE1BQVosQ0FBM0I7TUFDSixRQUFBLEdBQVcsU0FBRSxFQUFGO2VBQ1YsRUFBRSxDQUFDLEVBQUgsS0FBUztNQURDLEVBRFA7S0FBQSxNQUFBO01BSUosUUFBQSxHQUFXLFNBQUUsRUFBRjtBQUNWLFlBQUE7QUFBQSxhQUFBLGFBQUE7O1VBQ0MsSUFBRyxFQUFFLENBQUMsR0FBSCxDQUFRLEdBQVIsQ0FBQSxLQUFtQixHQUF0QjtBQUNDLG1CQUFPLE1BRFI7O0FBREQ7QUFHQSxlQUFPO01BSkcsRUFKUDs7QUFVTCxXQUFPO0VBakJZOzs7O0dBN0lLLFFBQVEsQ0FBQzs7QUFnS25DLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDeExqQixJQUFBLFFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7cUJBQ0wsT0FBQSxHQUFTLE9BQUEsQ0FBUywwQkFBVDs7OztHQURhLE9BQUEsQ0FBUyxnQkFBVDs7QUFJdkIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNKakIsSUFBQSxTQUFBO0VBQUE7Ozs7QUFBTTs7O3NCQUNMLFdBQUEsR0FBYTs7c0JBQ2IsT0FBQSxHQUFTLE9BQUEsQ0FBUyxzQkFBVDs7RUFFSSxtQkFBRSxLQUFGLEVBQVMsT0FBVDs7O0lBQ1osSUFBQyxDQUFBLElBQUQsR0FBUSxPQUFPLENBQUM7SUFDaEIsNENBQUEsU0FBQTtBQUNBO0VBSFk7O3NCQUtiLFFBQUEsR0FBVSxTQUFBO1dBQ1Q7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLElBQUEsRUFBTSxNQUROO01BRUEsS0FBQSxFQUFPLGFBRlA7O0VBRFM7O3NCQUtWLFFBQUEsR0FBVSxTQUFBO0FBQ1QsV0FBTyxJQUFDLENBQUEsR0FBRCxDQUFNLE9BQU47RUFERTs7c0JBR1YsS0FBQSxHQUFPLFNBQUUsSUFBRjtBQUNOLFFBQUE7SUFBQSxFQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBTSxNQUFOLENBQUEsR0FBaUIsR0FBakIsR0FBdUIsSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOO0lBQzdCLEtBQUEsR0FBUSxFQUFFLENBQUMsV0FBSCxDQUFBLENBQWdCLENBQUMsT0FBakIsQ0FBMEIsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUExQjtBQUNSLFdBQU8sS0FBQSxJQUFTO0VBSFY7O3NCQUtQLFVBQUEsR0FBWSxTQUFFLEdBQUY7QUFDWCxXQUFPLEdBQUcsQ0FBQztFQURBOzs7O0dBdEJXLFFBQVEsQ0FBQzs7QUF5QmpDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDekJqQixJQUFBLFlBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozt5QkFDTCxPQUFBLEdBQVMsT0FBQSxDQUFTLDJCQUFUOzt5QkFDVCxRQUFBLEdBQVUsU0FBQTtBQUNULFdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyw0Q0FBQSxTQUFBLENBQVQsRUFDTjtNQUFBLElBQUEsRUFBTSxFQUFOO01BQ0EsS0FBQSxFQUFPLElBRFA7S0FETTtFQURFOzs7O0dBRmdCLE9BQUEsQ0FBUyxjQUFUOztBQU8zQixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1BqQixJQUFBLFFBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7cUJBQ0wsT0FBQSxHQUFTOztxQkFDVCxRQUFBLEdBQVU7O3FCQUNWLFFBQUEsR0FBVSxTQUFBO0FBQ1QsV0FBTyxDQUFDLENBQUMsTUFBRixDQUFTLHdDQUFBLFNBQUEsQ0FBVCxFQUNOO01BQUEsT0FBQSxFQUFTLEVBQVQ7S0FETTtFQURFOztxQkFJVixJQUFBLEdBQU0sU0FBQTtJQUNMLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFlLElBQUMsQ0FBQSxHQUFELENBQU0sT0FBTixDQUFmLEVBQWdDLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBaEM7RUFESzs7OztHQVBnQixPQUFBLENBQVMsY0FBVDs7QUFVdkIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNWakIsSUFBQSxTQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7c0JBQ0wsT0FBQSxHQUFTLE9BQUEsQ0FBUywyQkFBVDs7c0JBQ1QsUUFBQSxHQUFVLFNBQUE7QUFDVCxXQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMseUNBQUEsU0FBQSxDQUFULEVBQ047TUFBQSxHQUFBLEVBQUssSUFBTDtNQUNBLEdBQUEsRUFBSyxJQURMO01BRUEsSUFBQSxFQUFNLENBRk47TUFHQSxLQUFBLEVBQU8sSUFIUDtLQURNO0VBREU7Ozs7R0FGYSxPQUFBLENBQVMsY0FBVDs7QUFTeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNUakIsSUFBQSxRQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7cUJBQ0wsT0FBQSxHQUFTLE9BQUEsQ0FBUywwQkFBVDs7cUJBQ1QsUUFBQSxHQUFVLFNBQUE7QUFDVCxXQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMsd0NBQUEsU0FBQSxDQUFULEVBQ047TUFBQSxHQUFBLEVBQUssSUFBTDtNQUNBLEdBQUEsRUFBSyxJQURMO01BRUEsSUFBQSxFQUFNLENBRk47TUFHQSxLQUFBLEVBQU8sSUFIUDtLQURNO0VBREU7Ozs7R0FGWSxPQUFBLENBQVMsY0FBVDs7QUFTdkIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNUakIsSUFBQSxTQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7c0JBQ0wsT0FBQSxHQUFTLE9BQUEsQ0FBUywyQkFBVDs7c0JBQ1QsUUFBQSxHQUFVLFNBQUE7QUFDVCxXQUFPLENBQUMsQ0FBQyxNQUFGLENBQVUseUNBQUEsU0FBQSxDQUFWLEVBQWlCO01BQ3ZCLE9BQUEsRUFBUyxFQURjO01BRXZCLFlBQUEsRUFBYyxJQUZTO0tBQWpCO0VBREU7Ozs7R0FGYSxPQUFBLENBQVMsY0FBVDs7QUFReEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNSakIsSUFBQSxTQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7c0JBQ0wsT0FBQSxHQUFTLE9BQUEsQ0FBUywyQkFBVDs7c0JBQ1QsUUFBQSxHQUFVLFNBQUE7QUFDVCxXQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMseUNBQUEsU0FBQSxDQUFULEVBQ047TUFBQSxPQUFBLEVBQVMsRUFBVDtLQURNO0VBREU7Ozs7R0FGYSxPQUFBLENBQVMsY0FBVDs7QUFNeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNOakIsSUFBQSxVQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7O3VCQUNMLFVBQUEsR0FBWSxTQUFFLE1BQUYsRUFBVSxPQUFWOztNQUFVLFVBQVE7O0lBQzdCLElBQUMsQ0FBQSxPQUFEO0FBQVcsY0FBTyxPQUFPLENBQUMsR0FBZjtBQUFBLGFBQ0wsS0FESztpQkFDTTtBQUROLGFBRUwsTUFGSztpQkFFTztBQUZQO2lCQUdMO0FBSEs7O0FBSVgsV0FBTyw0Q0FBQSxTQUFBO0VBTEk7O3VCQU9aLHNCQUFBLEdBQXdCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLEdBQUEsR0FBTSx3REFBQSxTQUFBO0lBQ04sR0FBRyxDQUFDLEdBQUosR0FBYSxJQUFDLENBQUEsT0FBSixHQUFpQixLQUFqQixHQUE0QjtBQUN0QyxXQUFPO0VBSGdCOzt1QkFLeEIsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUNSLFdBQU8sS0FBSyxDQUFDO0VBREw7O3VCQUdULFVBQUEsR0FBWSxTQUFFLE1BQUYsRUFBVSxNQUFWO0FBQ1gsUUFBQTtJQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsR0FBUCxDQUFZLE1BQVosQ0FBQSxJQUF3QjtJQUM5QixHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQVAsQ0FBWSxNQUFaLENBQUEsSUFBd0I7SUFDOUIsSUFBRyxHQUFBLEdBQU0sR0FBVDtNQUNRLElBQUcsSUFBQyxDQUFBLE9BQUo7ZUFBaUIsQ0FBQyxFQUFsQjtPQUFBLE1BQUE7ZUFBeUIsRUFBekI7T0FEUjtLQUFBLE1BRUssSUFBRyxHQUFBLEdBQU0sR0FBVDtNQUNHLElBQUcsSUFBQyxDQUFBLE9BQUo7ZUFBaUIsRUFBakI7T0FBQSxNQUFBO2VBQXdCLENBQUMsRUFBekI7T0FESDtLQUFBLE1BQUE7TUFHSixHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQVAsQ0FBWSxNQUFaO01BQ04sR0FBQSxHQUFNLE1BQU0sQ0FBQyxHQUFQLENBQVksTUFBWjtNQUNOLElBQUcsYUFBQSxJQUFTLGFBQVo7UUFDQyxJQUFHLEdBQUEsR0FBTSxHQUFUO1VBQ1EsSUFBRyxJQUFDLENBQUEsT0FBSjttQkFBaUIsRUFBakI7V0FBQSxNQUFBO21CQUF3QixDQUFDLEVBQXpCO1dBRFI7U0FBQSxNQUVLLElBQUcsR0FBQSxHQUFNLEdBQVQ7VUFDRyxJQUFHLElBQUMsQ0FBQSxPQUFKO21CQUFpQixDQUFDLEVBQWxCO1dBQUEsTUFBQTttQkFBeUIsRUFBekI7V0FESDtTQUhOO09BTEk7O0FBVUwsV0FBTztFQWZJOzs7O0dBaEJZLE9BQUEsQ0FBUyxnQkFBVDs7QUFpQ3pCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDakNqQixJQUFBLHVCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozt1QkFDTCxXQUFBLEdBQWE7O3VCQUNiLFFBQUEsR0FDQztJQUFBLElBQUEsRUFBTSxRQUFOO0lBQ0EsSUFBQSxFQUFNLElBRE47SUFFQSxLQUFBLEVBQU8sSUFGUDs7Ozs7R0FIdUIsUUFBUSxDQUFDOztBQU81Qjs7Ozs7Ozs7O3dCQUNMLEtBQUEsR0FBTzs7d0JBQ1AsVUFBQSxHQUFZLFNBQUUsSUFBRixFQUFRLElBQVI7QUFDWCxRQUFBO0lBQUEsd0NBQWlCLENBQUUsZUFBbkI7TUFDQyxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksQ0FBQyxVQURuQjs7RUFEVzs7d0JBSVosS0FBQSxHQUFPLFNBQUUsSUFBRixFQUFRLE9BQVI7QUFDTixRQUFBO0lBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBZixDQUFvQixXQUFwQixDQUFBLElBQXFDLElBQUMsQ0FBQSxTQUF0QyxJQUFtRDtJQUMxRCxPQUFBLHVDQUF3QixDQUFFLEdBQWhCLENBQXFCLFFBQXJCO0lBQ1YsSUFBRyxpQkFBQSxJQUFhLENBQUMsQ0FBQyxVQUFGLENBQWMsT0FBZCxDQUFoQjtNQUNDLElBQU0sQ0FBQSxJQUFBLENBQU4sR0FBZSxPQUFBLENBQVMsSUFBSSxDQUFDLEtBQWQsRUFBcUIsT0FBTyxDQUFDLE1BQTdCLEVBQXFDLElBQXJDLEVBRGhCOztBQUVBLFdBQU87RUFMRDs7OztHQU5rQixRQUFRLENBQUM7O0FBYW5DLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDcEJqQixJQUFBLHVCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7dUJBQ0wsV0FBQSxHQUFhOzt1QkFDYixRQUFBLEdBQVUsU0FBQTtBQUNULFdBQU8sSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOLENBQUEsSUFBbUIsSUFBQyxDQUFBLEdBQUQsQ0FBTSxJQUFDLENBQUEsV0FBUCxDQUFuQixJQUEyQztFQUR6Qzs7OztHQUZjLFFBQVEsQ0FBQzs7QUFNNUI7Ozs7Ozs7d0JBQ0wsS0FBQSxHQUFPOzs7O0dBRGtCLE9BQUEsQ0FBUyxnQkFBVDs7QUFHMUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNUakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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VztFQUpOOzs7O0dBM0llLFFBQVEsQ0FBQzs7QUFrSi9CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDbEpqQjs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1haW5WaWV3ID0gcmVxdWlyZSggXCIuL3ZpZXdzL21haW5cIiApXG5GYWNldHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0c1wiIClcbkZjdFN0cmluZyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc3RyaW5nXCIgKVxuRmN0QXJyYXkgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2FycmF5XCIgKVxuRmN0U2VsZWN0ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zZWxlY3RcIiApXG5GY3ROdW1iZXIgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X251bWJlclwiIClcbkZjdFJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9yYW5nZVwiIClcbkZjdERhdGVSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlXCIgKVxuRmN0RXZlbnQgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2V2ZW50XCIgKVxuUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvcmVzdWx0c1wiIClcblxuY2xhc3MgSUdHWSBleHRlbmRzIEJhY2tib25lLkV2ZW50c1xuXHQkOiBqUXVlcnlcblx0Y29uc3RydWN0b3I6ICggZWwsIGZhY2V0cyA9IFtdLCBvcHRpb25zID0ge30gKS0+XG5cdFx0Xy5leHRlbmQgQCwgQmFja2JvbmUuRXZlbnRzXG5cdFx0QF9pbml0RXJyb3JzKClcblx0XHRcblx0XHQjIGluaXQgZWxlbWVudFxuXHRcdEAkZWwgPSBAX3ByZXBhcmVFbCggZWwgKVxuXHRcdEBlbCA9IEAkZWxbMF1cblx0XHRAJGVsLmRhdGEoIFwiaWdneVwiLCBAIClcblxuXHRcdCMgaW5pdCBmYWNldHNcblx0XHRAZmFjZXRzID0gQF9wcmVwYXJlRmFjZXRzKCBmYWNldHMsIG9wdGlvbnMgKVxuXHRcdEByZXN1bHRzID0gbmV3IFJlc3VsdHMoIG51bGwsIG9wdGlvbnMgKVxuXG5cdFx0QHJlc3VsdHMub24gXCJhZGRcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcInJlbW92ZVwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwiY2hhbmdlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cblx0XHRAdmlldyA9IG5ldyBNYWluVmlldyggZWw6IEAkZWwsIGNvbGxlY3Rpb246IEBmYWNldHMsIHJlc3VsdHM6IEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUVsOiAoIGVsICk9PlxuXG5cdFx0aWYgbm90IGVsP1xuXHRcdFx0dGhyb3cgQF9lcnJvciggXCJFTUlTU0lOR0VMXCIgKVxuXG5cdFx0aWYgXy5pc1N0cmluZyggZWwgKVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMU1RSSU5HXCIgKVxuXG5cdFx0XHRfJGVsID0gQCQoIGVsIClcblx0XHRcdGlmIG5vdCBfJGVsPy5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMU1RSSU5HXCIgKVxuXG5cdFx0XHRyZXR1cm4gXyRlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTEpRVUVSWVwiIClcblxuXHRcdFx0IyBUT0RPIGhhbmRsZSBtdWx0aXBsZSBqUXVlcnkgZWxlbWVudHMgdG8gSUdHWSBpbnN0YW5jZXNcblx0XHRcdGlmIGVsLmxlbmd0aCA+IDFcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFU0laRUVMSlFVRVJZXCIgKVxuXG5cdFx0XHRyZXR1cm4gZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgRWxlbWVudFxuXHRcdFx0cmV0dXJuIEAkKCBlbCApXG5cblx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxUWVBFXCIgKVxuXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVGYWNldHM6ICggZmFjZXRzLCBvcHRpb25zPXt9ICk9PlxuXHRcdF9yZXQgPSBbXVxuXHRcdGZvciBmYWNldCBpbiBmYWNldHMgd2hlbiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRfcmV0LnB1c2ggX2ZjdFxuXHRcdFxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0LCBvcHRpb25zIClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKS0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJzZWxlY3RcIiB0aGVuIHJldHVybiBuZXcgRmN0U2VsZWN0KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwicmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0UmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJkYXRlcmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0RGF0ZVJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZXZlbnRcIiB0aGVuIHJldHVybiBuZXcgRmN0RXZlbnQoIGZhY2V0LCBtYWluOiBAIClcblxuXHRhZGRGYWNldDogKCBmYWNldCApPT5cblx0XHRpZiBub3QgQGZhY2V0cz9cblx0XHRcdHJldHVyblxuXHRcdGlmICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdEBmYWNldHMuYWRkKCBfZmN0IClcblx0XHRyZXR1cm4gQFxuXG5cdF9lcnJvcjogKCB0eXBlLCBkYXRhID0ge30gKT0+XG5cdFx0aWYgQGVycm9yc1sgdHlwZSBdP1xuXHRcdFx0X21zZyA9IEBlcnJvcnNbIHR5cGUgXSggZGF0YSApXG5cdFx0ZWxzZVxuXHRcdFx0X21zZyA9IFwiLVwiXG5cdFx0X2VyciA9IG5ldyBFcnJvcigpXG5cdFx0X2Vyci5uYW1lID0gdHlwZVxuXHRcdF9lcnIubWVzc2FnZSA9IF9tc2dcblx0XHRyZXR1cm4gX2VyclxuXG5cdGdldFF1ZXJ5OiA9PlxuXHRcdHJldHVybiBAcmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0QHRyaWdnZXIoIFwiY2hhbmdlXCIsIEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfaW5pdEVycm9yczogPT5cblx0XHRAZXJyb3JzID0ge31cblx0XHRmb3IgX2ssIF90bXBsIG9mIEBFUlJPUlMoKVxuXHRcdFx0QGVycm9yc1sgX2sgXSA9IF8udGVtcGxhdGUoIF90bXBsIClcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6IC0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1lcbiIsIiMjI1xuRVhBTVBMRSBVU0FHRVxuXG5cdHBhcmVudENvbGwgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbi5TdWIoKVxuXHRcblx0IyBieSBBcnJheVxuXHRzdWJDb2xsQSA9IHBhcmVudENvbGwuc3ViKCBbIDEsIDIsIDMgXSApXG5cdFxuXHQjIG9yIGJ5IE9iamVjdFxuXHRzdWJDb2xsTyA9IHBhcmVudENvbGwuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscywgQF9zdWJDb2xsZWNjdGlvbk9wdGlvbnMoKSApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cdFxuXHQjIyNcblx0IyMgX3N1YkNvbGxlY2N0aW9uT3B0aW9uc1xuXHRcblx0YGNvbGxlY3Rpb24uX3N1YkNvbGxlY2N0aW9uT3B0aW9ucygpYFxuXHRcblx0T3ZlcndyaXRhYmxlIG1ldGhvZCB0byBzZXQgdGhlIGNvbnN0cnVjdG9yIG9wdGlvbnMgZm9yIHN1YiBjb2xsZWN0aW9uc1xuXHRcblx0QHJldHVybiB7IE9iamVjdCB9IFRoZSBvcHRpb25zIG9iamVjdFxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfc3ViQ29sbGVjY3Rpb25PcHRpb25zOiA9PlxuXHRcdHJldHVybiB7fVxuXG5cdCMjI1xuXHQjIyB1cGRhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLnVwZGF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRNZXRob2QgdG8gdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBUaGVuIGFsbCBtb2RlbHMgd2lsbCBiZSByZXNldGUgYnkgdGhlIG5ldyBmaWx0ZXIuIFNvIHlvdSBoYXZlIHRvIGxpc3RlbiB0byB0ZWggcmVzZXQgZXZlbnRcblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgU2VsZiB9IGl0c2VsZlxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHVwZGF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIsIGFzUmVzZXQgPSB0cnVlICk9PlxuXHRcdGlmIEBfcGFyZW50Q29sP1xuXG5cdFx0XHQjIHNldCB0aGUgbmV3IGZpbHRlciBtZXRob2Rcblx0XHRcdEBfZm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKSBpZiBmaWx0ZXI/XG5cblx0XHRcdF9tb2RlbHMgPSBAX3BhcmVudENvbC5maWx0ZXIoIEBfZm5GaWx0ZXIgKVxuXG5cdFx0XHQjIHJlc2V0IHRoZSBjb2xsZWN0aW9uIHdpdGggdGhlIG5ldyBtb2RlbHNcblx0XHRcdGlmIGFzUmVzZXRcblx0XHRcdFx0QHJlc2V0KCBfbW9kZWxzIClcblx0XHRcdFx0cmV0dXJuIEBcblxuXHRcdFx0bmV3aWRzID0gXy5wbHVjayggX21vZGVscywgXCJjaWRcIiApXG5cdFx0XHRjdXJyaWRzID0gXy5wbHVjayggQG1vZGVscywgXCJjaWRcIiApXG5cdFx0XHRmb3IgcmlkIGluIF8uZGlmZmVyZW5jZSggY3VycmlkcywgbmV3aWRzIClcblx0XHRcdFx0QHJlbW92ZSggcmlkIClcblx0XHRcdFx0XG5cdFx0XHRfYWRkSWRzID0gXy5kaWZmZXJlbmNlKCBuZXdpZHMsIGN1cnJpZHMgKVxuXHRcdFx0Zm9yIG1kbCBpbiBfbW9kZWxzIHdoZW4gbWRsLmNpZCBpbiBfYWRkSWRzXG5cdFx0XHRcdEBhZGQoIG1kbCApXG5cblx0XHRyZXR1cm4gQFxuXG5cblx0IyMjXG5cdCMjIF9nZW5lcmF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24uX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdEludGVybmFsIG1ldGhvZCB0aCBjb252ZXJ0IGEgZmlsdGVyIGFyZ3VtZW50IHRvIGEgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IEZ1bmN0aW9uIH0gVGhlIGdlbmVyYXRlZCBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X2dlbmVyYXRlU3ViRmlsdGVyOiAoIGZpbHRlciApLT5cblx0XHQjIGNvbnN0cnVjdCB0aGUgZmlsdGVyIGZ1bmN0aW9uXG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNBcnJheSggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0X20uaWQgaW4gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzU3RyaW5nKCBmaWx0ZXIgKSBvciBfLmlzTnVtYmVyKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpcyBmaWx0ZXJcblx0XHRlbHNlXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdGZvciBfbm0sIF92bCBvZiBmaWx0ZXJcblx0XHRcdFx0XHRpZiBfbS5nZXQoIF9ubSApIGlzbnQgX3ZsXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdHJldHVybiBmbkZpbHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lU3ViXG4iLCJjbGFzcyBGY3RBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9zdHJpbmdcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YmFycmF5XCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0QXJyYXlcbiIsImNsYXNzIEZhY2V0QmFzZSBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9iYXNlXCIgKVxuXHRcblx0Y29uc3RydWN0b3I6ICggYXR0cnMsIG9wdGlvbnMgKS0+XG5cdFx0QG1haW4gPSBvcHRpb25zLm1haW5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0ZGVmYXVsdHM6IC0+XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IFwibmFtZVwiXG5cdFx0bGFiZWw6IFwiRGVzY3JpcHRpb25cIlxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2VcbiIsImNsYXNzIEZjdERhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdHM6IHt9XG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZVxuIiwiY2xhc3MgRmN0RXZlbnQgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogbnVsbFxuXHRvbmx5RXhlYzogdHJ1ZVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFxuXHRleGVjOiAoICk9PlxuXHRcdEBtYWluLnRyaWdnZXIoIEBnZXQoIFwiZXZlbnRcIiApLCBAdG9KU09OKCkgKVxuXHRcdHJldHVyblxubW9kdWxlLmV4cG9ydHMgPSBGY3RFdmVudFxuIiwiY2xhc3MgRmN0TnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1Ym51bWJlclwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyXG4iLCJjbGFzcyBGY3RSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0UmFuZ2VcbiIsImNsYXNzIEZjdFNlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzZWxlY3RcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCggc3VwZXIsIHtcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XHR3YWl0Rm9yQXN5bmM6IHRydWVcblx0XHR9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFNlbGVjdFxuIiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmdcbiIsImNsYXNzIElnZ3lGYWNldHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRpbml0aWFsaXplOiAoIG1vZGVscywgb3B0aW9ucz17fSApLT5cblx0XHRAZm9yd2FyZCA9IHN3aXRjaCBvcHRpb25zLmRpclxuXHRcdFx0d2hlbiBcImFzY1wiIHRoZW4gdHJ1ZVxuXHRcdFx0d2hlbiBcImRlc2NcIiB0aGVuIGZhbHNlXG5cdFx0XHRlbHNlIHRydWVcblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdF9zdWJDb2xsZWNjdGlvbk9wdGlvbnM6ID0+XG5cdFx0b3B0ID0gc3VwZXJcblx0XHRvcHQuZGlyID0gaWYgQGZvcndhcmQgdGhlbiBcImFzY1wiIGVsc2UgXCJkZXNjXCJcblx0XHRyZXR1cm4gb3B0XG5cdFxuXHRtb2RlbElkOiAoYXR0cnMpLT5cblx0XHRyZXR1cm4gYXR0cnMubmFtZVxuXHRcdFxuXHRjb21wYXJhdG9yOiAoIGZhY2V0QSwgZmFjZXRCICk9PlxuXHRcdF9zQSA9IGZhY2V0QS5nZXQoIFwic29ydFwiICkgb3IgMFxuXHRcdF9zQiA9IGZhY2V0Qi5nZXQoIFwic29ydFwiICkgb3IgMFxuXHRcdGlmIF9zQSA+IF9zQlxuXHRcdFx0cmV0dXJuIGlmIEBmb3J3YXJkIHRoZW4gLTEgZWxzZSAxXG5cdFx0ZWxzZSBpZiBfc0EgPCBfc0Jcblx0XHRcdHJldHVybiBpZiBAZm9yd2FyZCB0aGVuIDEgZWxzZSAtMVxuXHRcdGVsc2Vcblx0XHRcdF9uQSA9IGZhY2V0QS5nZXQoIFwibmFtZVwiIClcblx0XHRcdF9uQiA9IGZhY2V0Qi5nZXQoIFwibmFtZVwiIClcblx0XHRcdGlmIF9uQT8gYW5kIF9uQj9cblx0XHRcdFx0aWYgX25BID4gX25CXG5cdFx0XHRcdFx0cmV0dXJuIGlmIEBmb3J3YXJkIHRoZW4gMSBlbHNlIC0xXG5cdFx0XHRcdGVsc2UgaWYgX25BIDwgX25CXG5cdFx0XHRcdFx0cmV0dXJuIGlmIEBmb3J3YXJkIHRoZW4gLTEgZWxzZSAxXG5cdFx0cmV0dXJuIDBcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5RmFjZXRzXG4iLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBudWxsXG5cdFx0dmFsdWU6IG51bGxcblxuY2xhc3MgSWdneVJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdGluaXRpYWxpemU6ICggbWRscywgb3B0cyApPT5cblx0XHRpZiBvcHRzLm1vZGlmeUtleT8ubGVuZ3RoXG5cdFx0XHRAbW9kaWZ5S2V5ID0gb3B0cy5tb2RpZnlLZXlcblx0XHRyZXR1cm5cblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfa2V5ID0gb3B0aW9ucy5fZmFjZXQuZ2V0KCBcIm1vZGlmeUtleVwiICkgb3IgQG1vZGlmeUtleSBvciBcInZhbHVlXCJcblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyWyBfa2V5IF0gPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBvcHRpb25zLl9mYWNldCwgYXR0ciApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0c1xuIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiLVwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzXG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChpZCwgdHh0KSB7XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJ0eHRcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gdHh0KSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInJtLXJlc3VsdC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+XCIpO30uY2FsbCh0aGlzLFwiaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmlkOnR5cGVvZiBpZCE9PVwidW5kZWZpbmVkXCI/aWQ6dW5kZWZpbmVkLFwidHh0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50eHQ6dHlwZW9mIHR4dCE9PVwidW5kZWZpbmVkXCI/dHh0OnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwiZGF0ZXJhbmdlLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG9wZXJhdG9yLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmlmICggb3BlcmF0b3JzICYmIG9wZXJhdG9ycy5sZW5ndGgpXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcIm9wZXJhdG9yXFxcIj48c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJvcFwiLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgdmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJvcGVyYXRvclwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3I6dHlwZW9mIG9wZXJhdG9yIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcjp1bmRlZmluZWQsXCJvcGVyYXRvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yczp0eXBlb2Ygb3BlcmF0b3JzIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicmFuZ2VpbnBcXFwiPlwiKTtcbnZhciBfdmFscyA9IHZhbHVlID8gdmFsdWUgOiBbXVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl9mcm9tXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS1mcm9tXFxcIi8+PHNwYW4gY2xhc3M9XFxcInNlcGFyYXRvclxcXCI+LTwvc3Bhbj48aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl90b1wiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzFdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtdG9cXFwiLz48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbjtyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgbXVsdGlwbGUsIG9wdGlvbkdyb3Vwcywgb3B0aW9ucywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuaWYgKCBvcHRpb25Hcm91cHMpXG57XG4vLyBpdGVyYXRlIG9wdGlvbkdyb3Vwc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25Hcm91cHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBnbmFtZSA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZ25hbWUgPCAkJGw7IGduYW1lKyspIHtcbiAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBnbmFtZSBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlXG57XG4vLyBpdGVyYXRlIG9wdGlvbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9ucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+XCIpO1xuaWYgKCBtdWx0aXBsZSlcbntcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcImJ0biBidG4teHMgYnRuLXN1Y2Nlc3Mgc2VsZWN0LWNoZWNrIGZhIGZhLWNoZWNrXFxcIj48L3NwYW4+XCIpO1xufX0uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm11bHRpcGxlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5tdWx0aXBsZTp0eXBlb2YgbXVsdGlwbGUhPT1cInVuZGVmaW5lZFwiP211bHRpcGxlOnVuZGVmaW5lZCxcIm9wdGlvbkdyb3Vwc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uR3JvdXBzOnR5cGVvZiBvcHRpb25Hcm91cHMhPT1cInVuZGVmaW5lZFwiP29wdGlvbkdyb3Vwczp1bmRlZmluZWQsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoYWN0aXZlSWR4LCBjdXN0b20sIGxpc3QsIHF1ZXJ5LCB1bmRlZmluZWQpIHtcbnZhciBhZGQgPSAwO1xuaWYgKCBjdXN0b20gJiYgcXVlcnkpXG57XG5hZGQgPSAxO1xuYnVmLnB1c2goXCI8bGk+PGEgZGF0YS1pZD1cXFwiX2N1c3RvbVxcXCIgZGF0YS1pZHg9XFxcIi0xXFxcIlwiICsgKGphZGUuY2xzKFt7YWN0aXZlOjAgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPjxpPlxcXCJcIiArICgoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2k+PC9hPjwvbGk+XCIpO1xufVxuaWYgKCBsaXN0Lmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgbGlzdFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBsaXN0O1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaVwiICsgKGphZGUuY2xzKFtlbC5jc3NjbGFzc10sIFt0cnVlXSkpICsgXCI+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTooaWR4ICsgYWRkKSA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+XCIgKyAoKChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI8L2E+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaVwiICsgKGphZGUuY2xzKFtlbC5jc3NjbGFzc10sIFt0cnVlXSkpICsgXCI+PGFcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGVsLmlkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcImRhdGEtaWR4XCIsIGlkeCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmNscyhbe2FjdGl2ZTooaWR4ICsgYWRkKSA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+XCIgKyAoKChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI8L2E+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmVsc2UgaWYgKCAhY3VzdG9tKVxue1xuYnVmLnB1c2goXCI8bGk+PGEgY2xhc3M9XFxcImVtcHR5cmVzXFxcIj5ubyByZXN1bHQgZm9yIFxcXCJcIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBxdWVyeSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXFxcIjwvYT48L2xpPlwiKTtcbn19LmNhbGwodGhpcyxcImFjdGl2ZUlkeFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguYWN0aXZlSWR4OnR5cGVvZiBhY3RpdmVJZHghPT1cInVuZGVmaW5lZFwiP2FjdGl2ZUlkeDp1bmRlZmluZWQsXCJjdXN0b21cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1c3RvbTp0eXBlb2YgY3VzdG9tIT09XCJ1bmRlZmluZWRcIj9jdXN0b206dW5kZWZpbmVkLFwibGlzdFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubGlzdDp0eXBlb2YgbGlzdCE9PVwidW5kZWZpbmVkXCI/bGlzdDp1bmRlZmluZWQsXCJxdWVyeVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgucXVlcnk6dHlwZW9mIHF1ZXJ5IT09XCJ1bmRlZmluZWRcIj9xdWVyeTp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgdmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwic3RyaW5nLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChsYWJlbCwgc2VsZWN0ZWQsIHVuZGVmaW5lZCkge1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2Rpdj48c3BhbiBjbGFzcz1cXFwic3VibGFiZWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI6PC9zcGFuPjx1bCBjbGFzcz1cXFwic3VicmVzdWx0c1xcXCI+XCIpO1xuaWYgKCBzZWxlY3RlZCAmJiBzZWxlY3RlZC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIHNlbGVjdGVkXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHNlbGVjdGVkO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT48c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGkgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxzcGFuIGNsYXNzPVxcXCJ0eHRcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48aSBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9pPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PGRpdiBjbGFzcz1cXFwic3Vic2VsZWN0XFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJsb2FkZXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jb2cgZmEtc3BpblxcXCI+PC9pPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInNlbGVjdGVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWxlY3RlZDp0eXBlb2Ygc2VsZWN0ZWQhPT1cInVuZGVmaW5lZFwiP3NlbGVjdGVkOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGZhIGZhLXBsdXNcXFwiPjwvZGl2PlwiKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9XG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTNcblx0XCJUQUJcIjogOVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHJlc3VsdFRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGVcIiApXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzdWIgPSBvcHRpb25zLnN1YlxuXHRcdEByZXN1bHQgPSBuZXcgU3ViUmVzdWx0cygpXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCI8bGk+PC9saT5cIlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cblx0XHRyZXR1cm4gXCI8bGk+XCIgKyBfbGlzdC5qb2luKCBcIjwvbGk+PGxpPlwiICkgKyBcIjwvbGk+XCJcblx0XHRcblx0b3BlbjogPT5cblx0XHRAJGVsLmFkZENsYXNzKCBcIm9wZW5cIiApXG5cdFx0QGlzT3BlbiA9IHRydWVcblx0XHRAdHJpZ2dlciggXCJvcGVuZWRcIiApXG5cdFx0cmV0dXJuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcblx0X29uS2V5OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC5rZXlDb2RlIGlzIEtFWUNPREVTLlRBQiBvciBldm50LmtleUNvZGUgaW4gS0VZQ09ERVMuVEFCXG5cdFx0XHRAX29uVGFiQWN0aW9uKCBldm50IClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcdFxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0Y2lkOiBAY2lkXG5cdFx0dmFsdWU6IEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKVxuXG5cdF9nZXRJbnBTZWxlY3RvcjogPT5cblx0XHRyZXR1cm4gXCJpbnB1dCMje0BjaWR9XCJcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcIm9wZW5cIiApXG5cdFx0QHJlbmRlcigpXG5cdFx0cFZpZXcub3BlbigpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW5kZXI6ID0+XG5cdFx0X3RtcGwgPSBAdGVtcGxhdGUoICBAZ2V0VGVtcGxhdGVEYXRhKCkgKVxuXHRcdEAkZWwuaHRtbCggX3RtcGwgKVxuXHRcdEAkaW5wID0gQCRlbC5maW5kKCBAX2dldElucFNlbGVjdG9yKCkgKVxuXHRcdCQoIGRvY3VtZW50ICkub24gQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBfaGFzVGFiTGlzdGVuZXIoIHRydWUgKVxuXHRcdHJldHVyblxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleWRvd25cIlxuXHRcdFxuXHRfaGFzVGFiTGlzdGVuZXI6IC0+XG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdCQoIGRvY3VtZW50ICkub2ZmIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCBmYWxzZSApXG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEBpc09wZW4gPSBmYWxzZVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCBAcmVzdWx0IClcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdHJldHVybiBAJGlucC52YWwoKVxuXG5cdGdldFNlbGVjdE1vZGVsOiAtPlxuXHRcdHJldHVybiBTdWJSZXN1bHRzLnByb3RvdHlwZS5tb2RlbFxuXG5cdF9jaGVja1NlbGVjdEVtcHR5OiAoIF92YWwgKT0+XG5cdFx0aWYgXy5pc0VtcHR5KCBfdmFsICkgYW5kIG5vdCBfLmlzTnVtYmVyKCBfdmFsICkgYW5kIG5vdCBfLmlzQm9vbGVhbiggX3ZhbCApXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIGlmIEBfY2hlY2tTZWxlY3RFbXB0eSggX3ZhbCApXG5cdFx0QHNldCggX3ZhbCApXG5cdFx0cmV0dXJuXG5cblx0c2V0OiAoIHZhbCApPT5cblx0XHRfbW9kZWwgPSBAcmVzdWx0LmZpcnN0KClcblx0XHRpZiBub3QgX21vZGVsP1xuXHRcdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogdmFsIClcblx0XHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdGVsc2Vcblx0XHRcdF9tb2RlbC5zZXQoIHZhbHVlOiB2YWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0Jhc2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzRGF0ZVJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2RhdGVyYW5nZS5qYWRlXCIgKVxuXG5cdGZvcmNlZERhdGVSYW5nZU9wdHM6ID0+XG5cdFx0b3BlbnM6IFwicmlnaHRcIlxuXG5cdGV2ZW50czogPT5cblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdGlmIG5vdCBAZGF0ZXJhbmdlcGlja2VyP1xuXHRcdFx0X29wdHMgPSBfLmV4dGVuZCgge30sIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIEBmb3JjZWREYXRlUmFuZ2VPcHRzKCkgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblx0XHRcdFxuXHRcdFx0IyBwcmV2ZW50IGZyb20gaGFuZGxpY2ggdGhlIG91dGVyY2xpY2sgZXhpdCBmcm9tIE1haW5WaWV3XG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lci5vbiBcImNsaWNrXCIsICggZXZudCApLT5cblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRlbHNlXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmVsZW1lbnQgPSBAJGlucFxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5zaG93KClcblx0XHRcdFxuXHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRAJGlucC5vbiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRjbG9zZTogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wLm9mZiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub2ZmKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0cmV0dXJuXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0QGRhdGVyYW5nZXBpY2tlciA9IG51bGxcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblxuXHRcdF9zdGFydERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDAgXSApXG5cdFx0X2VuZERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDEgXSApIGlmIF9yZXMudmFsdWVbIDEgXT9cblxuXHRcdF90aW1lID0gQG1vZGVsLmdldCggXCJvcHRzXCIgKS50aW1lUGlja2VyXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3N0YXJ0RGF0ZS5mb3JtYXQoICggaWYgX3RpbWUgdGhlbiBcIkxMTExcIiBlbHNlIFwiTExcIiApIClcblxuXHRcdGlmIF9lbmREYXRlP1xuXHRcdFx0X3MgKz0gXCIgLSBcIlxuXHRcdFx0X3MgKz0gX2VuZERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRfcyArPSBcIjwvbGk+XCJcblxuXHRcdHJldHVybiBfc1xuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QG1vZGVsLnNldCggXCJ2YWx1ZVwiLCBAZ2V0VmFsdWUoIGZhbHNlICkgKVxuXHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRWYWx1ZTogKCBwcmVkZWYgPSB0cnVlICk9PlxuXHRcdGlmIHByZWRlZlxuXHRcdFx0X3ByZWRlZlZhbCA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0XHRpZiBfcHJlZGVmVmFsP1xuXHRcdFx0XHRpZiBub3QgXy5pc0FycmF5KCBfcHJlZGVmVmFsIClcblx0XHRcdFx0XHRfcHJlZGVmVmFsID0gIFsgX3ByZWRlZlZhbCBdXG5cdFx0XHRcdFsgQHN0YXJ0RGF0ZSwgQGVuZERhdGUgXSA9IF9wcmVkZWZWYWxcblx0XHRcdFx0cmV0dXJuIF9wcmVkZWZWYWxcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldE51bWJlckJhc2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAc2V0TnVtYmVyID0gXy50aHJvdHRsZSggQF9zZXROdW1iZXIsIDMwMCwge2xlYWRpbmc6IGZhbHNlLCB0cmFpbGluZzogZmFsc2V9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdF8kZWwgPSAkKCBldm50LmN1cnJlbnRUYXJnZXQgKVxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICksIF8kZWwgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSAqIC0xLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleXVwXCJcblx0XHRcdF92ID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnJlcGxhY2UoIC9bXlxcZF0/W14tXFxkXSsvZywgXCJcIiApXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXHRcdFx0IFxuXHRcdFx0QHNldE51bWJlciggX3YsIF8kZWwgKVxuXHRcdHJldHVyblxuXG5cdGNyZW1lbnQ6ICggY2hhbmdlLCBlbCA9IEAkaW5wICk9PlxuXHRcdF92ID0gZWwudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0X3YgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0XHRAX3NldE51bWJlciggX3YgKyBjaGFuZ2UsIGVsIClcblx0XHRyZXR1cm5cblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0cmV0dXJuIHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdF9zZXROdW1iZXI6ICggX3YsIGVsID0gQCRpbnAgKT0+XG5cdFx0aWYgaXNOYU4oIF92IClcblx0XHRcdCNAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X2N1cnIgPSBlbC52YWwoKVxuXG5cdFx0X3YgPSBAdmFsdWVCeURlZmluaXRpb24oIF92KVxuXHRcdGlmIF9jdXJyICE9IF92LnRvU3RyaW5nKClcblx0XHRcdGVsLnZhbCggX3YgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSApLT5cblx0XHRtYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRtaW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRzdGVwID0gQG1vZGVsLmdldCggXCJzdGVwXCIgKVxuXHRcdFxuXHRcdCMgZml4IHJldmVyc2VkIG1pbi9tYXggc2V0dGluZ1xuXHRcdGlmIG1pbiA+IG1heFxuXHRcdFx0X3RtcCA9IG1pblxuXHRcdFx0bWluID0gbWF4XG5cdFx0XHRtYXggPSBfdG1wXG5cdFx0XG5cdFx0IyBvbiBleHhlZGRpbmcgdGhlIGxpbWl0cyB1c2UgdGhlIGxpbWl0XG5cdFx0aWYgbWluPyBhbmQgX3ZhbHVlIDwgbWluXG5cdFx0XHRyZXR1cm4gbWluXG5cdFx0aWYgbWF4PyBhbmQgX3ZhbHVlID4gbWF4XG5cdFx0XHRyZXR1cm4gbWF4XG5cblx0XHQjIHNlYXJjaCB0aGUgbmVhcmVzdCBfdmFsdWUgdG8gdGhlIHN0ZXBcblx0XHRpZiBzdGVwIGlzbnQgMVxuXHRcdFx0X3ZhbHVlID0gbmVhcmVzdCggX3ZhbHVlLCBzdGVwIClcblx0XHRcblx0XHQjIGNhbGMgdGhlIHByZWNpc2lvbiBieSBzdGVwXG5cdFx0X3ByZWNpc2lvbiA9IE1hdGgubWF4KCAwLCBNYXRoLmNlaWwoIE1hdGgubG9nKCAxL3N0ZXAgKSAvIE1hdGgubG9nKCAxMCApICkgKVxuXHRcdGlmIF9wcmVjaXNpb24gPiAwXG5cdFx0XHRfdmFsdWUgPSBwcmVjaXNpb24oIF92YWx1ZSwgX3ByZWNpc2lvbiApXG5cdFx0ZWxzZVxuXHRcdFx0X3ZhbHVlID0gTWF0aC5yb3VuZCggX3ZhbHVlIClcblx0XHRcdFxuXHRcdHJldHVybiBfdmFsdWVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0TnVtYmVyQmFzZVxuIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5cbmNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgQXJyYXlPcHRpb25zIGV4dGVuZHMgcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQXJyYXlPcHRpb25cblxuY2xhc3MgRmFjZXRTdWJBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdFxuXHR0ZW1wbGF0ZVJlc0xpOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2FycmF5X3Jlc3VsdGxpLmphZGVcIiApXG5cdFxuXHRvcHREZWZhdWx0OlxuXHRcdGxhYmVsOiBcIi1cIlxuXHRcdHZhbHVlOiBcIi1cIlxuXG5cdHNlbGVjdENvdW50OiAwXG5cblx0b3B0Q29sbDogU3RyaW5nT3B0aW9uc1xuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHN1cGVyXG5cdFx0I2lmIG5vdCBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdF9ldm50c1sgXCJibHVyIGlucHV0IyN7QGNpZH1cIiBdID0gXCJjbG9zZVwiXG5cdFx0cmV0dXJuIF9ldm50c1xuXHRcblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAbG9hZGluZ1xuXHRcdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBmb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdHJtUmVzOiAoIGV2bnQgKT0+XG5cdFx0X2lkID0gJCggZXZudC50YXJnZXQgKT8uZGF0YSggXCJpZFwiIClcblx0XHRAcmVzdWx0LnJlbW92ZSggX2lkIClcblx0XHRyZXR1cm5cblx0XG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCI8bGk+PC9saT5cIlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBAdGVtcGxhdGVSZXNMaSggdHh0OiBtb2RlbC5nZXRMYWJlbCgpLCBpZDogbW9kZWwuaWQgKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRpZiBvcHRpb25zLm1vZGVsLmdldCggXCJjb3VudFwiICk/XG5cdFx0XHRAc2VsZWN0Q291bnQgPSBvcHRpb25zLm1vZGVsLmdldCggXCJjb3VudFwiIClcblx0XHRvcHRpb25zLmN1c3RvbSA9IHRydWVcblx0XHRpZiBvcHRpb25zLm1vZGVsLmdldCggXCJjdXN0b21cIiApP1xuXHRcdFx0b3B0aW9ucy5jdXN0b20gPSBCb29sZWFuKCBvcHRpb25zLm1vZGVsLmdldCggXCJjdXN0b21cIiApIClcblx0XHRcdFxuXHRcdEBjb2xsZWN0aW9uID0gQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBvcHRpb25zLm1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0XG5cdFx0aWYgbm90IG9wdGlvbnMuY3VzdG9tIGFuZCBAc2VsZWN0Q291bnQgPD0gMFxuXHRcdFx0QHNlbGVjdENvdW50ID0gQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0XG5cdFx0QHJlc3VsdC5vbiBcInJlbW92ZVwiLCAoIG1kbCwgY29sbCApPT5cblx0XHRcdGlmIGNvbGwubGVuZ3RoXG5cdFx0XHRcdG9wdGlvbnMuc3ViLnJlbmRlclJlc3VsdCgpXG5cdFx0XHRAc2VhcmNoY29sbC5hZGQoIG1kbCApXG5cdFx0XHRAdHJpZ2dlciggXCJyZW1vdmVkXCIsIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XHRcblx0c2VsZWN0OiA9PlxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF92YWxzID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBfdmFscz8gYW5kIG5vdCBfLmlzQXJyYXkoIF92YWxzIClcblx0XHRcdF92YWxzID0gWyBfdmFscyBdXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0Zm9yIF92YWwgaW4gKCBpZiBAc2VsZWN0Q291bnQgPD0gMCB0aGVuIF92YWxzIGVsc2UgX3ZhbHNbLi4uQHNlbGVjdENvdW50XSApXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRzZWFyY2hDb250ZW50ID0gQCRpbnAudmFsKClcblx0XHRpZiBzZWFyY2hDb250ZW50Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RBY3RpdmUoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XHRcblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0QGxvYWRpbmcgPSB0cnVlXG5cdFx0XHRfY29sbCA9IG5ldyBAb3B0Q29sbCggW10gKVxuXHRcdFx0XG5cdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRAJGVsLnBhcmVudCgpLmFkZENsYXNzKCBcImxvYWRpbmdcIiApXG5cdFx0XHRcdG9wdGlvbnMgQHJlc3VsdCwgQG1vZGVsLCAoIGFPcHRzICk9PlxuXHRcdFx0XHRcdGZvciBfb3B0LCBpZHggaW4gYU9wdHNcblx0XHRcdFx0XHRcdGFPcHRzW2lkeF0gPSBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBfb3B0LCB7IGN1c3RvbTogZmFsc2UgfSApXG5cdFx0XHRcdFx0X2NvbGwuYWRkKCBhT3B0cyApXG5cdFx0XHRcdFx0QGxvYWRpbmcgPSBmYWxzZVxuXHRcdFx0XHRcdEAkZWwucGFyZW50KCkucmVtb3ZlQ2xhc3MoIFwibG9hZGluZ1wiIClcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcblx0XHRcdCwgMCApXG5cdFx0XHRyZXR1cm4gX2NvbGxcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0IH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdChvcHQpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gbmV3IEBvcHRDb2xsKCBfb3B0cyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YkFycmF5XG4iLCJjbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL251bWJlci5qYWRlXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIiBdID0gXCJzZWxlY3RcIlxuXHRcdHJldHVybiBfZXZudHNcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0QCRpbnBPcCA9IEAkZWwuZmluZCggXCJzZWxlY3QjI3tAY2lkfW9wXCIgKVxuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCB7IHdpZHRoOiBcImF1dG9cIiB9IClcblx0XHRcdEAkaW5wT3Aub24oIFwic2VsZWN0MjpjbG9zZVwiLCBAX29wU2VsZWN0ZWQgKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCI8bGk+PC9saT5cIlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9yZXMub3BlcmF0b3IgKyBcIiBcIiBpZiBfcmVzLm9wZXJhdG9yP1xuXHRcdF9zICs9IF9yZXMudmFsdWVcblx0XHRfcyArPSBcIjwvbGk+XCJcblxuXHRcdHJldHVybiBfc1xuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdFx0QCRpbnBPcC5yZW1vdmUoKVxuXHRcdFx0QCRpbnBPcCA9IG51bGxcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRpZiBldm50Py5yZWxhdGVkVGFyZ2V0P1xuXHRcdFx0X3Bvc1dycCA9IEBlbC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudD8ucmVsYXRlZFRhcmdldCApXG5cdFx0XHRpZiBub3QgKCBfcG9zV3JwIGlzIDAgb3IgX3Bvc1dycCAtIDE2ID49IDAgKVxuXHRcdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdHJldHVyblxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBPcD8uZ2V0KDApIClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAbW9kZWwuc2V0KCB7IG9wZXJhdG9yOiBAJGlucE9wLnZhbCgpIH0gKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXG5cdF9vcFNlbGVjdGVkOiA9PlxuXHRcdEBzZWxlY3RlZE9QID0gdHJ1ZVxuXHRcdEBmb2N1cygpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0aWYgQCRpbnBPcD8gYW5kIG5vdCBAc2VsZWN0ZWRPUFxuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdF9vbGRWYWwgPSBAcmVzdWx0LmZpcnN0KCkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdF9vbGRPcCA9IEByZXN1bHQuZmlyc3QoKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgeyBvcGVyYXRvcnM6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKSwgb3BlcmF0b3I6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JcIiApfSApXG5cblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGlmIG5vdCBpc05hTiggX3ZhbCApXG5cdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0X3JldCA9XG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdFx0XHRvcGVyYXRvcjogQCRpbnBPcC52YWwoKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRyZXR1cm4gX3JldFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNOdW1iZXJcbiIsImNsYXNzIEZhY2V0U3Vic1JhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yYW5nZS5qYWRlXCIgKVxuXG5cdF9nZXRJbnBTZWxlY3RvcjogKCBleHQgPSBcIl9mcm9tXCIgKT0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfSN7ZXh0fVwiXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwic2VsZWN0XCJcblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdHJldHVybiBcIjxsaT5cIiArX3Jlcy52YWx1ZS5qb2luKCBcIiAtIFwiICkgKyBcIjwvbGk+XCJcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucFRvID0gQCRlbC5maW5kKCBAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICkgKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdF9vbGRWYWwgPSBAcmVzdWx0LmZpcnN0KCkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8gYW5kICggZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucC5nZXQoMCkgb3IgZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucFRvLmdldCgwKSApXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Y2xvc2U6ID0+XG5cdFx0dHJ5XG5cdFx0XHRAJCggXCIucmFuZ2VpbnBcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdF9yZXQgPVxuXHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92RnJvbSA9IHN1cGVyXG5cdFx0X3YgPSBAJGlucFRvLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0X3ZUbyA9IHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdFx0cmV0dXJuIFsgX3ZGcm9tLCBfdlRvIF1cblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIF92YWw/Lmxlbmd0aCA+PSAyXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNSYW5nZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc2VsZWN0LmphZGVcIiApXG5cblx0Zm9yY2VkTW9kdWxlT3B0czp7fVxuXHQjXHRtdWx0aXBsZTogdHJ1ZVxuXG5cdGRlZmF1bHRNb2R1bGVPcHRzOlxuXHRcdCNtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxXG5cdFx0d2lkdGg6IFwiYXV0b1wiXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cdFxuXHRpbml0aWFsaXplOiAtPlxuXHRcdEBjb252ZXJ0VmFsdWVUb0ludCA9IEBfY2hlY2tJbnRWYWx1ZSggQG1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSB7fVxuXHRcdF9ldm50c1sgXCJjbGljayAuc2VsZWN0LWNoZWNrXCIgXSA9IFwic2VsZWN0XCIgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcInNlbGVjdCMje0BjaWR9XCJcblx0XHRcblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0I0BfaW5pdFNlbGVjdDIoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0IyBwcmV2ZW50IGZyb20gYXN5bmMgbGlzdGVuaW5nIG9uIG1hbnVhbCBhY2Nlc3Ncblx0XHRAbW9kZWwuc2V0KCBcIndhaXRGb3JBc3luY1wiLCBmYWxzZSApXG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5zaG93KClcblx0XHRAc2VsZWN0Mi5vcGVuKClcblx0XHQjZWxzZVxuXHRcdFx0I0AkaW5wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHQjIHNldCB0aGUgY3VycmVudCB2YWx1ZXNcblx0XHRfb2xkVmFscyA9IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWxzIClcblx0XHRcblx0XHQjIHJlc2V0IHJlc3VsdHMgYW5kIHNlbGVjdDJcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vZmYoKVxuXHRcdEBzZWxlY3QyLmRlc3Ryb3koKVxuXHRcdEByZXN1bHQucmVzZXQoKVxuXHRcdEBzZWxlY3QyID0gbnVsbFxuXHRcdFxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRfY2hlY2tJbnRWYWx1ZTogKCBfb3B0cyA9IFtdICk9PlxuXHRcdGlmIG5vdCBfb3B0cyBvciBub3QgX29wdHMubGVuZ3RoXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRmb3IgX3YgaW4gX29wdHNcblx0XHRcdGlmIF92LnZhbHVlPyBhbmQgXy5pc1N0cmluZyggX3YudmFsdWUgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92LmlkPyBhbmQgXy5pc1N0cmluZyggX3YuaWQgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92PyBhbmQgXy5pc1N0cmluZyggX3YgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXHRcdHJldHVybiB0cnVlXG5cblx0X2luaXRTZWxlY3QyOiA9PlxuXHRcdFxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIG9yIGZhbHNlIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3RcIiwgQHNlbGVjdFxuXHRcdFx0XG5cdFx0XHQjIGFmdGVyIGxvYWRpbmcgdHJ5IHRvIHNldCB0aGUgY3Vyc29yIGZvY3VzXG5cdFx0XHRAc2VsZWN0Mi5vbiBcInJlc3VsdHM6YWxsXCIsICggcmVzdWx0cyApPT5cblx0XHRcdFx0QGNvbnZlcnRWYWx1ZVRvSW50ID0gQF9jaGVja0ludFZhbHVlKCByZXN1bHRzPy5kYXRhPy5yZXN1bHRzIClcblx0XHRcdFx0QHNlbGVjdDIuc2VsZWN0aW9uPy4kc2VhcmNoPy5mb2N1cz8oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdFx0IyBsaXN0ZW4gdG8gYXN5bmMgcmVzdWx0IGNoYW5nZXMgYW5kIHNldCB0aGUgc2VsZWN0aW9uXG5cdFx0XHRAc2VsZWN0Mi5kYXRhQWRhcHRlci5jdXJyZW50ICggcmVzdWx0cyApPT5cblx0XHRcdFx0aWYgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRcdFx0X2RhdGEgPSBbXVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGZvciByZXN1bHQgaW4gcmVzdWx0c1xuXHRcdFx0XHRcdFx0X2RhdGEucHVzaCBAX2NvbnZlcnRWYWx1ZSggcmVzdWx0IClcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdCMgc2VsZWN0IHRoZSBhY3RpdmUvcHJlZGVmaW5lZCByZXN1bHRzXG5cdFx0XHRcdFx0QF9zZWxlY3QoIF9kYXRhIClcblx0XHRcdFx0XHRAY2xvc2UoKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XG5cdFx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLm9uIFwiY2xpY2tcIiwgQF9zZWwyb3BlblxuXHRcdFx0QHNlbGVjdDIuJGVsZW1lbnQuaGlkZSgpXG5cdFx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBAc2VsZWN0MlxuXG5cdF9zZWwyb3BlbjogKCBldm50ICktPlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdHJlbW92ZTogPT5cblx0XHQjQCRpbnAuc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IF8uZXh0ZW5kKCB7fSwgc3VwZXIsIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApLCBvcHRpb25zOiBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKSB9IClcblx0XHRpZiBfZGF0YS52YWx1ZT8gYW5kIG5vdCBfLmlzQXJyYXkoIF9kYXRhLnZhbHVlIClcblx0XHRcdF9kYXRhLnZhbHVlID0gWyBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBfZGF0YS52YWx1ZSBlbHNlIF9kYXRhLnZhbHVlLnRvU3RyaW5nKCkgXVxuXHRcdFx0XG5cdFx0aWYgX2RhdGEudmFsdWU/XG5cdFx0XHRfdmxpc3QgPSBfLnBsdWNrKCBfZGF0YS5vcHRpb25zLCBcInZhbHVlXCIgKVxuXHRcdFx0Zm9yIF92IGluIF9kYXRhLnZhbHVlIHdoZW4gX3Ygbm90IGluIF92bGlzdFxuXHRcdFx0XHRfZGF0YS5vcHRpb25zLnB1c2ggeyB2YWx1ZTogKCBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBfdiBlbHNlIF92LnRvU3RyaW5nKCkgKSwgbGFiZWw6IF92LCBncm91cDogdW5kZWZpbmVkIH1cblx0XHRcblx0XHRfZ3JvdXBzID0gXy5ncm91cEJ5KCBfZGF0YS5vcHRpb25zLCBcImdyb3VwXCIgKVxuXHRcdGlmIF8uY29tcGFjdCggXy5rZXlzKCBfZ3JvdXBzIG9yIHt9ICkgKS5sZW5ndGggPiAxXG5cdFx0XHRfZGF0YS5vcHRpb25Hcm91cHMgPSBfZ3JvdXBzXG5cdFx0cmV0dXJuIF9kYXRhXG5cdFxuXHRfaGFzVGFiTGlzdGVuZXI6ICggY3JlYXRlICk9PlxuXHRcdGlmIGNyZWF0ZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIEBtb2RlbC5nZXQoXCJtdWx0aXBsZVwiKVxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleXVwXCJcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ZhbHMgPSBbXVxuXHRcdGZvciBkYXRhIGluIEBfaW5pdFNlbGVjdDIoKT8uZGF0YSgpIG9yIFtdXG5cdFx0XHRcblx0XHRcdF92YWxzLnB1c2goIEBfY29udmVydFZhbHVlKCBkYXRhICkgKVxuXHRcdHJldHVybiBfdmFsc1xuXHRcblx0X2NvbnZlcnRWYWx1ZTogKCBkYXRhICk9PlxuXHRcdF9kYXRhID0ge31cblx0XHRpZiBAY29udmVydFZhbHVlVG9JbnQgXG5cdFx0XHRfZGF0YS52YWx1ZSA9IHBhcnNlRmxvYXQoIGRhdGEuaWQgKVxuXHRcdGVsc2Vcblx0XHRcdF9kYXRhLnZhbHVlID0gZGF0YS5pZFxuXHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0IGlmIGRhdGEudGV4dD9cblx0XHRyZXR1cm4gX2RhdGFcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiAoIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIG9wdCBlbHNlIG9wdC50b1N0cmluZygpICksIGxhYmVsOiBvcHQsIGdyb3VwOiBudWxsIH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdCggb3B0IClcblx0XHRcdFx0b3B0LnZhbHVlID0gaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gb3B0LnZhbHVlIGVsc2Ugb3B0LnZhbHVlLnRvU3RyaW5nKClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKVxuXHRcdHJldHVybiBfb3B0c1xuXG5cdHVuc2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0QHJlc3VsdC5yZW1vdmUoIGV2bnQucGFyYW1zPy5kYXRhPy5pZCApXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0aWYgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0Mj9cblx0XHRcdCNAc2VsZWN0Mj8uZGVzdHJveSgpXG5cdFx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLmhpZGUoKVxuXHRcdEAkaW5wPy5yZW1vdmUoKVxuXHRcdEAkKCBcIi5zZWxlY3QtY2hlY2tcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKCkgaWYgZXZudD8uc3RvcFByb3BhZ2F0aW9uXG5cdFx0X3ZhbHMgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QF9zZWxlY3QoIF92YWxzIClcblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfc2VsZWN0OiAoIF92YWxzICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwid2FpdEZvckFzeW5jXCIsIGZhbHNlIClcblx0XHRNb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRmb3IgX3ZhbCBpbiBfdmFsc1xuXHRcdFx0QHJlc3VsdC5hZGQoIG5ldyBNb2RlbENvbnN0KCBfdmFsICkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1NlbGVjdFxuIiwiY2xhc3MgRmFjZXRTdWJTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc3RyaW5nLmphZGVcIiApXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdHN1cGVyXG5cdFx0dHJ5XG5cdFx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZ1xuIiwiU3ViVmlldyA9IHJlcXVpcmUoIFwiLi9zdWJcIiApXG5TZWxlY3RvclZpZXcgPSByZXF1aXJlKCBcIi4vc2VsZWN0b3JcIiApXG5cbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgTWFpblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3dyYXBwZXIuamFkZVwiIClcblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAuYWRkLWZhY2V0LWJ0blwiOiBcIl9hZGRGYWNldFwiXG5cdFx0XCJjbGlja1wiOiBcIl9hZGRGYWNldFwiXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdFxuXHRcdEByZXN1bHRzID0gb3B0aW9ucy5yZXN1bHRzXG5cblx0XHRAY29sbGVjdGlvbi5vbiBcImlnZ3k6cmVtXCIsIEByZW1GYWNldFxuXHRcdFxuXHRcdF9jbCA9IFwiaWdneSBjbGVhcmZpeFwiXG5cdFx0aWYgQGVsLmNsYXNzTmFtZT8ubGVuZ3RoXG5cdFx0XHRfY2wgPSBcIiBcIiArIF9jbFxuXHRcdEBlbC5jbGFzc05hbWUgKz0gX2NsXG5cdFx0QHJlbmRlcigpXG5cdFx0JCggZG9jdW1lbnQgKS5vbiBcImtleXVwXCIsIEBfb25LZXlcblx0XHRAX291dGVyQ2xpY2tMaXN0ZW4oKVxuXHRcdFxuXHRcdGZvciBmY3QgaW4gQGNvbGxlY3Rpb24uZmlsdGVyKCAoIGZjdCApLT5yZXR1cm4gZmN0Py5nZXQoIFwidmFsdWVcIiApPyApXG5cdFx0XHRzdWJ2aWV3ID0gQGdlblN1YiggZmN0LCBmYWxzZSApXG5cdFx0XG5cdFx0QGNvbGxlY3Rpb24ub24gXCJhZGRcIiwgPT5cblx0XHRcdEAkYWRkQnRuLnNob3coKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCkgKVxuXHRcdEAkYWRkQnRuID0gQCQoIFwiLmFkZC1mYWNldC1idG5cIiApXG5cdFx0cmV0dXJuXG5cblx0X2FkZEZhY2V0OiAoIGV2bnQgKT0+XG5cdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRVNDIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdEBleGl0KClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0ZXhpdDogKCBuZXh0QWRkID0gdHJ1ZSApPT5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBuZXh0QWRkXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVtRmFjZXQ6ICggZmFjZXRNICk9PlxuXHRcdEByZXN1bHRzLnJlbW92ZSggZmFjZXRNLmdldCggXCJuYW1lXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0c2V0RmFjZXQ6ICggZmFjZXRNLCBkYXRhICk9PlxuXHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdEByZXN1bHRzLmFkZCggXy5leHRlbmQoIGRhdGEsIHsgbmFtZTogZmFjZXRNLmdldCggXCJuYW1lXCIgKSwgdHlwZTogZmFjZXRNLmdldCggXCJ0eXBlXCIgKSB9ICksIHsgbWVyZ2U6IHRydWUsIHBhcnNlOiB0cnVlLCBfZmFjZXQ6IGZhY2V0TSB9IClcblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRAJGFkZEJ0bi5oaWRlKClcblx0XHRyZXR1cm5cblxuXHRnZW5TdWI6ICggZmFjZXRNLCBhZGRBZnRlciA9IHRydWUgKT0+XG5cdFx0c3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgcGFyZW50OiBAIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNzdWJ2aWV3Lm9mZigpXG5cdFx0XHRzdWJ2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0QGFkZEZhY2V0KCkgaWYgYWRkQWZ0ZXJcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJyZW9wZW5cIiwgPT5cblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdHN1YnZpZXcub24oIFwic2VsZWN0ZWRcIiwgQHNldEZhY2V0IClcblx0XHRcblx0XHRAJGFkZEJ0bi5iZWZvcmUoIHN1YnZpZXcucmVuZGVyKCkgKVxuXHRcdHJldHVybiBzdWJ2aWV3XG5cblx0YWRkRmFjZXQ6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU0VMRUNUIEVYSVNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU1VCIEVYSVNUXCJcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIEVNUFRZIENPTExcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBTZWxlY3RvclZpZXcoIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBjdXN0b206IGZhbHNlIClcblxuXHRcdEAkYWRkQnRuLmJlZm9yZSggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNFTEVDVCBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdCNAc3Vidmlldy5vZmYoKVxuXHRcdFx0XHRAc3Vidmlldy5yZW1vdmUoKVxuXHRcdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIGZhY2V0TSApPT5cblx0XHRcdGZhY2V0TS5zZXQoIFwidmFsdWVcIiwgbnVsbCApXG5cdFx0XHRAc3VidmlldyA9IEBnZW5TdWIoIGZhY2V0TSApXG5cdFx0XHRAc3Vidmlldy5vcGVuKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0X291dGVyQ2xpY2tMaXN0ZW46ID0+XG5cdFx0alF1ZXJ5KCBkb2N1bWVudCApLm9uIFwiY2xpY2tcIiwgQF9vdXRlckNsaWNrXG5cdFx0cmV0dXJuXG5cblx0X291dGVyQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0X3Bvc1dycCA9IEBlbC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudC50YXJnZXQgKVxuXHRcdGlmIG5vdCAoIF9wb3NXcnAgaXMgMCBvciBfcG9zV3JwIC0gMTYgPj0gMCApXG5cdFx0XHRAZXhpdCggZmFsc2UgKVxuXHRcdHJldHVyblxuXHRcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluVmlld1xuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTZWxlY3RvclZpZXcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRzL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9yLmphZGVcIiApXG5cdHRlbXBsYXRlRWw6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3JsaS5qYWRlXCIgKVxuXHRzZWxlY3RDb3VudDogMVxuXG5cdGNsYXNzTmFtZTogPT5cblx0XHRjbHMgPSBbIFwiYWRkLWZhY2V0XCIgXVxuXHRcdGlmIEBjdXN0b21cblx0XHRcdGNscy5wdXNoIFwiY3VzdG9tXCJcblx0XHRyZXR1cm4gY2xzLmpvaW4oIFwiIFwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJtb3VzZWRvd24gYVwiOiBcIl9vbkNsaWNrXCJcblx0XHRcImZvY3VzIGlucHV0IyN7QGNpZH1cIjogXCJvcGVuXCJcblx0XHQjXCJibHVyIGlucHV0IyN7QGNpZH1cIjogXCJjbG9zZVwiXG5cdFx0XCJrZXlkb3duIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAY3VzdG9tID0gIG9wdGlvbnMuY3VzdG9tIG9yIGZhbHNlXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRAY3VyclF1ZXJ5ID0gXCJcIlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAc2VhcmNoY29sbCA9IEBjb2xsZWN0aW9uLnN1YiggLT50cnVlIClcblx0XHRAcmVzdWx0ID0gbmV3IEBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yKClcblx0XHRcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfdG1wbCA9IG1vZGVsLmdldCggXCJsYWJlbHRlbXBsYXRlXCIgKVxuXHRcdFx0aWYgX3RtcGw/XG5cdFx0XHRcdF9sYmwgPSBfdG1wbC5yZXBsYWNlKCBcInt7bGFiZWx9fVwiLCBfbGJsIClcblx0XHRcdFx0XG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXHRcdFx0X2Nzc2NsYXNzID0gbW9kZWwuZ2V0KCBcImNzc2NsYXNzXCIgKVxuXHRcdFx0aWYgQGN1cnJRdWVyeT8ubGVuZ3RoID4gMVxuXHRcdFx0XHRfbGJsID0gX2xibC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBAY3VyclF1ZXJ5LCBcImdpXCIgKSwgKCggc3RyICktPnJldHVybiBcIjxiPiN7c3RyfTwvYj5cIiApIClcblx0XHRcdF9saXN0LnB1c2ggbGFiZWw6IF9sYmwsIGlkOiBfaWQsIGNzc2NsYXNzOiBfY3NzY2xhc3Ncblx0XHRAJGxpc3QuYXBwZW5kKCBAdGVtcGxhdGVFbCggbGlzdDogX2xpc3QsIHF1ZXJ5OiBAY3VyclF1ZXJ5LCBhY3RpdmVJZHg6IEBhY3RpdmVJZHgsIGN1c3RvbTogQGN1c3RvbSApIClcblxuXHRcdEBfY2hlY2tTY3JvbGwoKVxuXHRcdFxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRfc2Nyb2xsVGlsbDogMTk4XG5cdF9jaGVja1Njcm9sbDogPT5cblx0XHRfaGVpZ2h0ID0gQCRsaXN0LmhlaWdodCgpXG5cdFx0aWYgX2hlaWdodCA+IDBcblx0XHRcdEBzY3JvbGxIZWxwZXIoIF9oZWlnaHQgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGV4aXQgdGhlIHRoZSBjYWxsIHN0YWNrIHRvIGNoZWNrIGhlaWdodCBhZnRlciB0aGUgbW9kdWxlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBkb21cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHNjcm9sbEhlbHBlciggQCRsaXN0LmhlaWdodCgpIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXG5cdHNjcm9sbEhlbHBlcjogKCBoZWlnaHQgKT0+XG5cdFx0aWYgaGVpZ2h0ID49IEBfc2Nyb2xsVGlsbFxuXHRcdFx0QHNjcm9sbGluZyA9IHRydWVcblx0XHRlbHNlXG5cdFx0XHRAc2Nyb2xsaW5nID0gZmFsc2Vcblx0XHRyZXR1cm5cblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0aWYgbm90IF9pZD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX2lkIClcblx0XHRpZiBub3QgX21kbD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0QHNlbGVjdGVkKCBfbWRsIClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdHNlbGVjdGVkOiAoIG1kbCApPT5cblx0XHR0cnlcblx0XHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdFx0bWRsPy5leGVjPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdGNhdGNoIF9lcnJcblx0XHRcdHRyeVxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBhY3RpdmVJZHg6I3tAYWN0aXZlSWR4fSAtIGNvbGxlY3Rpb246I3tKU09OLnN0cmluZ2lmeSggQGNvbGxlY3Rpb24udG9KU09OKCkpfVwiXG5cdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIXCJcblx0XHRcblx0XHRpZiBtZGw/XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIG1kbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogPT5cblx0XHRAJGlucC5mb2N1cygpXG5cdFx0cmV0dXJuXG5cblx0c2VhcmNoOiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAbW92ZSggdHJ1ZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBtb3ZlKCBmYWxzZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0QWN0aXZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdHJldHVyblxuXG5cdFx0X3EgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKVxuXHRcdGlmIF9xIGlzIEBjdXJyUXVlcnlcblx0XHRcdHJldHVyblxuXG5cdFx0QGN1cnJRdWVyeSA9IF9xXG5cblx0XHRAc2VhcmNoY29sbC51cGRhdGVTdWJGaWx0ZXIoICggbWRsICk9PlxuXHRcdFx0aWYgQHJlc3VsdC5nZXQoIG1kbC5pZCApP1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIG5vdCBfcT8ubGVuZ3RoXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRfbWF0Y2ggPSBtZGwubWF0Y2goIF9xIClcblx0XHRcdHJldHVybiBfbWF0Y2hcblx0XHQsIGZhbHNlIClcblxuXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm5cblxuXHRtb3ZlOiAoIHVwID0gZmFsc2UgKT0+XG5cdFx0X2xpc3QgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGFcIiApXG5cdFxuXHRcdF9jdXN0b21FbGVtZW50Q2hhbmdlID0gaWYgQGN1cnJRdWVyeT8ubGVuZ3RoIHRoZW4gMCBlbHNlIDFcblx0XHRfdG9wID0gMFxuXHRcdGlmIHVwXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxXG5cdFx0ZWxzZVxuXHRcdFx0aWYgQHNlYXJjaGNvbGwubGVuZ3RoIC0gX2N1c3RvbUVsZW1lbnRDaGFuZ2UgPD0gQGFjdGl2ZUlkeFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4ICsgMVxuXG5cdFx0XG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0XyRlbG5ldyA9IEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0aWYgQHNjcm9sbGluZ1xuXHRcdFx0X2VsSCA9IF8kZWxuZXcub3V0ZXJIZWlnaHQoKVxuXHRcdFx0X3BvcyA9IF9lbEggKiAoIF9uZXdpZHggKyAxIClcblx0XHRcdF8kbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3RcIiApXG5cdFx0XHRfc2Nyb2xsVCA9IF8kbGlzdC5zY3JvbGxUb3AoKVxuXHRcdFx0aWYgX3BvcyA+IF9zY3JvbGxUICsgQF9zY3JvbGxUaWxsXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBAX3Njcm9sbFRpbGwgKVxuXHRcdFx0ZWxzZSBpZiBfcG9zIDwgX3Njcm9sbFQgKyBfZWxIXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBfZWxIIClcblxuXHRcdEBhY3RpdmVJZHggPSBfbmV3aWR4XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0Oj0+XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0QWN0aXZlOiAoIGlzRW50ZXJFdmVudD1mYWxzZSApPT5cblx0XHRcblx0XHRfc2VsID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhLmFjdGl2ZVwiICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKS5kYXRhKClcblx0XHRcdFxuXHRcdF9zZWFyY2ggPSBAJGlucC52YWwoKVxuXHRcdFxuXHRcdGlmICBub3QgX3NlbD8gYW5kIEBzZWxlY3RDb3VudCBpc250IDEgYW5kIGlzRW50ZXJFdmVudCBhbmQgbm90IF9zZWFyY2g/Lmxlbmd0aFxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IF9zZWw/XG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdGlmIF9zZWw/LmlkeCA+PSAwIGFuZCBAc2VhcmNoY29sbC5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggQGNvbGxlY3Rpb24uZ2V0KCBfc2VsLmlkICkgKVxuXHRcdGVsc2UgaWYgQGN1cnJRdWVyeT8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IEBjdXJyUXVlcnksIGN1c3RvbTogdHJ1ZSApIClcblx0XHRcdEAkaW5wLnZhbCggXCJcIiApXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3XG4iLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiA9PlxuXHRcdF9zdGQgPSBcInN1YlwiXG5cdFx0X3R5cGUgPSBAbW9kZWwuZ2V0KCBcInR5cGVcIiApXG5cdFx0aWYgX3R5cGU/XG5cdFx0XHRfc3RkICs9IFwiIHN1Yi10eXBlLVwiICsgX3R5cGVcblx0XHRcblx0XHRfbmFtZSA9IEBtb2RlbC5nZXQoIFwibmFtZVwiIClcblx0XHRpZiBfbmFtZT9cblx0XHRcdF9zdGQgKz0gXCIgc3ViLW5hbWUtXCIgKyBfbmFtZVxuXHRcdHJldHVybiBfc3RkXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdEAkZWwub24gXCJjbGlja1wiLCBAcmVvcGVuXG5cdFx0QHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOlxuXHRcdFwiY2xpY2sgLnJtLWZhY2V0LWJ0blwiOiBcImRlbFwiXG5cblx0cmVuZGVyOiAoIG9wdE1kbCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdHRyeVxuXHRcdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblx0XHRcdGNhdGNoIF9lcnJcblx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0ggLSBDbGFzczojeyBAY29uc3RydWN0b3IubmFtZSB9IC0gbW9kZWw6I3tKU09OLnN0cmluZ2lmeShAbW9kZWwudG9KU09OKCkpfSAtIHJlc3VsdDoje0pTT04uc3RyaW5naWZ5KCBAcmVzdWx0LnRvSlNPTigpKX1cIlxuXHRcdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0hcIlxuXHRcdFxuXHRcdEAkZWwuaHRtbCBAdGVtcGxhdGUoIGxhYmVsOiBAbW9kZWwuZ2V0TGFiZWwoKSwgc2VsZWN0ZWQ6IF9saXN0LCB0eXBlOiBAbW9kZWwuZ2V0KCBcInR5cGVcIiApLCBuYW1lOiBAbW9kZWwuZ2V0KCBcIm5hbWVcIiApIClcblx0XHRAJHN1YiA9IEAkKCBcIi5zdWJzZWxlY3RcIiApXG5cdFx0QCRyZXN1bHRzID0gQCQoIFwiLnN1YnJlc3VsdHNcIiApXG5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXHRcdHJldHVybiBAZWxcblx0XG5cdHJlb3BlbjogKCBldm50ICk9PlxuXHRcdGlmICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLnJtLXJlc3VsdC1idG5cIiApIGFuZCBAc2VsZWN0dmlldz8ucm1SZXM/XG5cdFx0XHRAc2VsZWN0dmlldy5ybVJlcyggZXZudCApXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdGlmIG5vdCBAX2lzT3BlbiBhbmQgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldy5yZW9wZW4oIEAgKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAdHJpZ2dlciggXCJyZW9wZW5cIiApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGRlbDogKCBldm50ICk9PlxuXHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdEBjb2xsZWN0aW9uLnRyaWdnZXIoIFwiaWdneTpyZW1cIiwgQG1vZGVsIClcblx0XHRAY29sbGVjdGlvbi5hZGQoIEBtb2RlbCApXG5cdFx0QHJlbW92ZSgpXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIgKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHJlbW92ZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0QHNlbGVjdHZpZXc/LnJlbW92ZSgpXG5cdFx0QHBhcmVudCA9IG51bGxcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRzZWxlY3RlZDogKCBvcHRNZGwgKT0+XG5cdFx0QHJlc3VsdC5hZGQoIG9wdE1kbCwgeyBtZXJnZTogdHJ1ZSB9IClcblx0XHRAcmVuZGVyUmVzdWx0KClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW1vdmVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LnJlbW92ZSggb3B0TWRsIClcblx0XHRAcmVuZGVyUmVzdWx0KClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0aWYgQHJlc3VsdC5sZW5ndGggPD0gMFxuXHRcdFx0QGRlbCgpXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdEAkcmVzdWx0cy5odG1sKCBAc2VsZWN0dmlldy5yZW5kZXJSZXN1bHQoKSApXG5cdFx0cmV0dXJuXG5cblx0aXNPcGVuOiA9PlxuXHRcdHJldHVybiBAc2VsZWN0dmlldz9cblxuXHRmb2N1czogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHRAb3BlbigpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldz8uY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cblx0Z2VuZXJhdGVTdWI6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAYXR0YWNoU3ViRXZlbnRzKClcblx0XHRcdHJldHVybiBAc2VsZWN0dmlld1xuXHRcdFx0XG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgQG1vZGVsLlN1YlZpZXcoIHN1YjogQCwgbW9kZWw6IEBtb2RlbCwgZWw6IEAkc3ViIClcblx0XHRAYXR0YWNoU3ViRXZlbnRzKClcblx0XHRcdFxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApP1xuXHRcdFx0QHNlbGVjdHZpZXcuc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XHRcblx0YXR0YWNoU3ViRXZlbnRzOiA9PlxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0ICk9PlxuXHRcdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdFx0I0BzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCApXG5cdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRAc2VsZWN0dmlldy5vbiBcInJlbW92ZWRcIiwgKCBtZGwgKT0+XG5cdFx0XHRpZiBtZGxcblx0XHRcdFx0QHJlbW92ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0b3BlbjogPT5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXG5cdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRAX2lzT3BlbiA9IHRydWVcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U3ViXG4iLG51bGwsIihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLmphZGUgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xuICB2YXIgYmMgPSBiWydjbGFzcyddO1xuXG4gIGlmIChhYyB8fCBiYykge1xuICAgIGFjID0gYWMgfHwgW107XG4gICAgYmMgPSBiYyB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XG59XG5cbi8qKlxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpIDpcbiAgICAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKHZhbCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHZhbFtrZXldOyB9KSA6XG4gICAgW3ZhbF0pLmZpbHRlcihudWxscykuam9pbignICcpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuc3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5tYXAoZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgIH0pLmpvaW4oJzsnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgIHZhbCA9IGV4cG9ydHMuc3R5bGUodmFsKTtcbiAgfVxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh2YWwpLmluZGV4T2YoJyYnKSAhPT0gLTEpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgJyArXG4gICAgICAgICAgICAgICAgICAgJ3dpbGwgYmUgZXNjYXBlZCB0byBgJmFtcDtgJyk7XG4gICAgfTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgJ0lTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGphZGVfZW5jb2RlX2h0bWxfcnVsZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7J1xufTtcbnZhciBqYWRlX21hdGNoX2h0bWwgPSAvWyY8PlwiXS9nO1xuXG5mdW5jdGlvbiBqYWRlX2VuY29kZV9jaGFyKGMpIHtcbiAgcmV0dXJuIGphZGVfZW5jb2RlX2h0bWxfcnVsZXNbY10gfHwgYztcbn1cblxuZXhwb3J0cy5lc2NhcGUgPSBqYWRlX2VzY2FwZTtcbmZ1bmN0aW9uIGphZGVfZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpLnJlcGxhY2UoamFkZV9tYXRjaF9odG1sLCBqYWRlX2VuY29kZV9jaGFyKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuXG5leHBvcnRzLkRlYnVnSXRlbSA9IGZ1bmN0aW9uIERlYnVnSXRlbShsaW5lbm8sIGZpbGVuYW1lKSB7XG4gIHRoaXMubGluZW5vID0gbGluZW5vO1xuICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG59XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiXX0=
