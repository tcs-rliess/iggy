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
    this.triggerEvent = bind(this.triggerEvent, this);
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
      main: this,
      el: this.$el,
      collection: this.facets,
      results: this.results,
      searchButton: options.searchButton || {}
    });
    this.view.on("searchbutton", this.triggerEvent);
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

  IGGY.prototype.triggerEvent = function(eventName) {
    this.trigger(eventName, this.results);
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
    this._subCollectionOptions = bind(this._subCollectionOptions, this);
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
    _sub = new this.constructor(_models, this._subCollectionOptions());
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
  	## _subCollectionOptions
  	
  	`collection._subCollectionOptions()`
  	
  	Overwritable method to set the constructor options for sub collections
  	
  	@return { Object } The options object
  	
  	@api private
   */

  BackboneSub.prototype._subCollectionOptions = function() {
    var _opts;
    _opts = {
      comparator: this.comparator
    };
    return _opts;
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
      label: "Description",
      sort: 0
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
var IggyFacets, fnGet, sortColl,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

sortColl = require("sortcoll");

fnGet = function(el, key) {
  return el.get(key);
};

IggyFacets = (function(superClass) {
  extend(IggyFacets, superClass);

  function IggyFacets(models, options) {
    var _forward;
    if (options == null) {
      options = {};
    }
    this._subCollecctionOptions = bind(this._subCollecctionOptions, this);
    if (options.comparator == null) {
      _forward = (function() {
        switch (options.dir) {
          case "asc":
            return true;
          case "desc":
            return false;
          default:
            return true;
        }
      })();
      options.comparator = sortColl(["sort"].concat(options.sortby || "name"), {
        sort: false,
        "?": _forward
      }, fnGet);
    }
    return IggyFacets.__super__.constructor.call(this, models, options);
  }

  IggyFacets.prototype._subCollecctionOptions = function() {
    var opt;
    opt = IggyFacets.__super__._subCollecctionOptions.apply(this, arguments);
    opt.dir = this.forward ? "asc" : "desc";
    return opt;
  };

  IggyFacets.prototype.modelId = function(attrs) {
    return attrs.name;
  };

  return IggyFacets;

})(require("./backbone_sub"));

module.exports = IggyFacets;


},{"./backbone_sub":2,"sortcoll":39}],12:[function(require,module,exports){
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
    return this.get("label") || this.get(this.idAttribute) || "";
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
;var locals_for_with = (locals || {});(function (custom, id, txt) {
buf.push("<span class=\"txt\">" + (jade.escape(null == (jade_interp = txt) ? "" : jade_interp)) + "</span><span class=\"btn-wrp\"><i" + (jade.attr("data-id", id, true, false)) + " class=\"rm-result-btn fa fa-remove\"></i>");
if ( custom)
{
buf.push("<i" + (jade.attr("data-id", id, true, false)) + " class=\"edit-result-btn fa fa-pencil\"></i>");
}
buf.push("</span>");}.call(this,"custom" in locals_for_with?locals_for_with.custom:typeof custom!=="undefined"?custom:undefined,"id" in locals_for_with?locals_for_with.id:typeof id!=="undefined"?id:undefined,"txt" in locals_for_with?locals_for_with.txt:typeof txt!=="undefined"?txt:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (cid, inpval) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", inpval, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"inpval" in locals_for_with?locals_for_with.inpval:typeof inpval!=="undefined"?inpval:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (label, pinned, selected, undefined) {
if ( !pinned)
{
buf.push("<div class=\"rm-facet-btn fa fa-remove\"></div>");
}
buf.push("<span class=\"sublabel\">" + (jade.escape((jade_interp = label) == null ? '' : jade_interp)) + ":</span><ul class=\"subresults\">");
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
buf.push("</ul><div class=\"subselect\"></div><div class=\"loader\"><i class=\"fa fa-cog fa-spin\"></i></div>");}.call(this,"label" in locals_for_with?locals_for_with.label:typeof label!=="undefined"?label:undefined,"pinned" in locals_for_with?locals_for_with.pinned:typeof pinned!=="undefined"?pinned:undefined,"selected" in locals_for_with?locals_for_with.selected:typeof selected!=="undefined"?selected:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":38}],24:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (searchButton) {
buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");
if ( searchButton != undefined && searchButton.template != undefined && searchButton.template.length)
{
buf.push("<button" + (jade.cls(['search-btn',searchButton.cssclass,{"search-btn-pullright":searchButton.pullright}], [null,true,true])) + ">" + (null == (jade_interp = searchButton.template) ? "" : jade_interp) + "</button>");
}}.call(this,"searchButton" in locals_for_with?locals_for_with.searchButton:typeof searchButton!=="undefined"?searchButton:undefined));;return buf.join("");
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
    var _lbl, _list, i, idx, len, model, ref;
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
      _lbl = model.getLabel();
      if ((_lbl != null) && _lbl !== "") {
        _list.push(model.getLabel());
      }
    }
    if (_list.length) {
      return "<li>" + _list.join("</li><li>") + "</li>";
    }
    return "";
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
    var ref, ret;
    ret = {
      cid: this.cid,
      value: (ref = this.model) != null ? ref.get("value") : void 0
    };
    return ret;
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
    if (_.isEmpty(_val) && !_.isNumber(_val) && !_.isBoolean(_val) && !this.model.get("pinned")) {
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
    var _ed, _opts, _sd, ref, ref1;
    _opts = {
      opens: "right"
    };
    if (this.model.get("dateformat")) {
      _opts.locale = {
        format: this.model.get("dateformat")
      };
    }
    if (((ref = this.model.get("value")) != null ? ref[0] : void 0) != null) {
      _sd = moment(this.model.get("value")[0], this.model.get("dateformat"));
      if (_sd.isValid()) {
        _opts.startDate = _sd._d;
      }
    }
    if (((ref1 = this.model.get("value")) != null ? ref1[1] : void 0) != null) {
      _ed = moment(this.model.get("value")[1], this.model.get("dateformat"));
      if (_ed.isValid()) {
        _opts.endDate = _ed._d;
      }
    }
    return _opts;
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
    var _endDate, _frmt, _res, _s, _startDate, _time;
    _res = this.getResults();
    if (_.isNumber(_res.value[0])) {
      _startDate = moment(_res.value[0]);
    } else {
      _startDate = moment(_res.value[0], this.model.get("dateformat"));
    }
    if (_res.value[1] != null) {
      if (_.isNumber(_res.value[1])) {
        _endDate = moment(_res.value[1]);
      } else {
        _endDate = moment(_res.value[1], this.model.get("dateformat"));
      }
    }
    _time = this.model.get("opts").timePicker;
    _s = "<li>";
    if (this.model.get("dateformat") != null) {
      _frmt = this.model.get("dateformat");
    } else if (_time) {
      _frmt = "LLLL";
    } else {
      _frmt = "LL";
    }
    _s += _startDate.format(_frmt);
    if (_endDate != null) {
      _s += " - ";
      _s += _endDate.format(_frmt);
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

  FacetSubArray.prototype.initialize = function() {
    this.editMode = false;
    return FacetSubArray.__super__.initialize.apply(this, arguments);
  };

  FacetSubArray.prototype.events = function() {
    var _evnts;
    _evnts = FacetSubArray.__super__.events.apply(this, arguments);
    _evnts["blur input#" + this.cid] = "close";
    return _evnts;
  };

  FacetSubArray.prototype.close = function(evnt) {
    var _delSub, ref;
    _delSub = false;
    if (this.editMode) {
      _delSub = true;
    }
    this.editMode = false;
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
    if ((ref = this.model) != null ? ref.get("pinned") : void 0) {
      return FacetSubArray.__super__.close.apply(this, arguments);
    }
    if (_delSub && this.result.length <= 0) {
      this.sub.del();
    }
    return FacetSubArray.__super__.close.apply(this, arguments);
  };

  FacetSubArray.prototype.rmRes = function(evnt) {
    var _id, _mdl, ref;
    if ((evnt != null ? evnt.target : void 0) != null) {
      _id = (ref = $(evnt.target)) != null ? ref.data("id") : void 0;
    } else if (evnt != null) {
      _id = evnt;
    }
    _mdl = this.result.get(_id);
    if (_mdl != null) {
      this.result.remove(_id);
      if (_mdl != null ? _mdl.get("custom") : void 0) {
        this.searchcoll.remove(_id);
      }
    }
  };

  FacetSubArray.prototype.editRes = function(evnt) {
    var _id, _v, ref;
    this.editMode = true;
    _id = (ref = $(evnt.target)) != null ? ref.data("id") : void 0;
    _v = this._editval = this.result.get(_id).get("value");
    this.result.remove(_id);
    this.searchcoll.remove(_id);
    this.sub.reopen();
    this.search(_v);
  };

  FacetSubArray.prototype.getTemplateData = function() {
    var _data, ref;
    _data = FacetSubArray.__super__.getTemplateData.apply(this, arguments);
    if ((ref = this._editval) != null ? ref.length : void 0) {
      _data.inpval = this._editval;
      this._editval = null;
    }
    return _data;
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
        id: model.id,
        custom: model.get("custom")
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
    this.getTemplateData = bind(this.getTemplateData, this);
    this.editRes = bind(this.editRes, this);
    this.rmRes = bind(this.rmRes, this);
    this.close = bind(this.close, this);
    this.events = bind(this.events, this);
    this.initialize = bind(this.initialize, this);
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
    var _id, ref;
    if (this._isFull()) {
      if (this.model.get("pinned")) {
        _id = (ref = this.result.last()) != null ? ref.id : void 0;
        this.rmRes(_id);
        FacetSubArray.__super__.reopen.apply(this, arguments);
      }
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
    } catch (error) {}
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
    if (this.model.get("pinned")) {
      this._initSelect2();
    }
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
        this.$inp.on("select2:select select2:close", this.select);
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
      if (data.text instanceof jQuery) {
        _data.label = data.text.html();
      } else {
        _data.label = data.text;
      }
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
      if (!this.model.get("waitForAsync")) {
        this.sub.del();
      }
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
    } catch (error) {}
  };

  FacetSubString.prototype.reopen = function(pView) {
    var _oldVal, ref, ref1;
    _oldVal = (ref = this.result) != null ? (ref1 = ref.first()) != null ? ref1.get("value") : void 0 : void 0;
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
    this._onFocusSearch = bind(this._onFocusSearch, this);
    this._onSearch = bind(this._onSearch, this);
    this.focusSearch = bind(this.focusSearch, this);
    this._outerClickListen = bind(this._outerClickListen, this);
    this._onClosed = bind(this._onClosed, this);
    this._onOpened = bind(this._onOpened, this);
    this.addFacet = bind(this.addFacet, this);
    this.genSub = bind(this.genSub, this);
    this.setFacet = bind(this.setFacet, this);
    this.remFacet = bind(this.remFacet, this);
    this.exit = bind(this.exit, this);
    this._onKey = bind(this._onKey, this);
    this._addFacet = bind(this._addFacet, this);
    this.render = bind(this.render, this);
    this.templateData = bind(this.templateData, this);
    this.initialize = bind(this.initialize, this);
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.template = require("../tmpls/wrapper.jade");

  MainView.prototype.events = {
    "click .search-btn": "_onSearch",
    "focus .search-btn": "_onFocusSearch",
    "click .add-facet-btn": "_addFacet",
    "click": "_addFacet"
  };

  MainView.prototype.initialize = function(options) {
    var _cl, _fnSort, _valueFacets, fct, i, len, ref, ref1;
    this.main = options.main;
    this.results = options.results;
    this.searchButton = options.searchButton;
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
      return ((fct != null ? fct.get("value") : void 0) != null) || (fct != null ? fct.get("pinned") : void 0);
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
      this.genSub(fct, false);
    }
    this.collection.on("add", (function(_this) {
      return function() {
        _this.$addBtn.show();
      };
    })(this));
  };

  MainView.prototype.templateData = function() {
    var _ret;
    _ret = {
      searchButton: {
        template: this.searchButton.template || "",
        event: this.searchButton.event || "search",
        pullright: this.searchButton.pullright || false,
        cssclass: this.searchButton.cssclass
      }
    };
    return _ret;
  };

  MainView.prototype.render = function() {
    var ref;
    this.$el.html(this.template(this.templateData()));
    this.$addBtn = this.$(".add-facet-btn");
    if ((ref = this.searchButton.template) != null ? ref.length : void 0) {
      this.$searchBtn = this.$(".search-btn");
    }
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
        var ref;
        if (subview != null ? (ref = subview.model) != null ? ref.get("pinned") : void 0 : void 0) {
          return;
        }
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
      custom: false,
      main: this
    });
    this.selectview.on("opened", (function(_this) {
      return function() {
        _this._onOpened();
      };
    })(this));
    this.selectview.on("closed", (function(_this) {
      return function(results) {
        _this._onClosed();
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
    this.$addBtn.before(this.selectview.render());
    this.selectview.focus();
  };

  MainView.prototype._onOpened = function() {
    var ref;
    if ((ref = this.$addBtn) != null) {
      ref.hide();
    }
  };

  MainView.prototype._onClosed = function() {
    var ref;
    if ((ref = this.$addBtn) != null) {
      ref.show();
    }
  };

  MainView.prototype._outerClickListen = function() {
    jQuery(document).on("click", this._outerClick);
  };

  MainView.prototype.focusSearch = function() {
    if (this.$searchBtn != null) {
      this.$searchBtn.focus();
    }
  };

  MainView.prototype._onSearch = function(evnt) {
    evnt.stopPropagation();
    this.exit();
    this.trigger("searchbutton", this.searchButton.event);
  };

  MainView.prototype._onFocusSearch = function(evnt) {
    var ref;
    evnt.stopPropagation();
    if ((ref = this.selectview) != null) {
      if (typeof ref.close === "function") {
        ref.close();
      }
    }
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
    this.open = bind(this.open, this);
    this.focus = bind(this.focus, this);
    this.selected = bind(this.selected, this);
    this._onTabAction = bind(this._onTabAction, this);
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
    if (options.main != null) {
      this.main = options.main;
    }
    SelectorView.__super__.constructor.call(this, options);
    return;
  }

  SelectorView.prototype.initialize = function(options) {
    SelectorView.__super__.initialize.apply(this, arguments);
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

  SelectorView.prototype._onTabAction = function(evnt) {
    if (this.main != null) {
      evnt.preventDefault();
      evnt.stopPropagation();
      this.main.focusSearch();
    } else {
      SelectorView.__super__._onTabAction.call(this, event);
    }
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
    } catch (error) {
      _err = error;
      try {
        console.error("Issue #23: CATCH - Class:" + this.constructor.name + " - activeIdx:" + this.activeIdx + " - collection:" + (JSON.stringify(this.collection.toJSON())));
      } catch (error) {
        _errerr = error;
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
    var _el;
    this.$inp.focus();
    _el = this.$inp.get(0);
    _el.selectionStart = _el.selectionEnd = _el.value.length;
  };

  SelectorView.prototype.open = function() {
    this.trigger("opened");
    return SelectorView.__super__.open.apply(this, arguments);
  };

  SelectorView.prototype.search = function(evnt) {
    var _q;
    if ((evnt != null ? evnt.type : void 0) === "keydown") {
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
    if (_.isString(evnt)) {
      _q = evnt;
    } else {
      _q = evnt.currentTarget.value.toLowerCase();
    }
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
    var _err, _errerr, _list, i, idx, len, model, ref;
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
        } catch (error) {
          _errerr = error;
          console.error("Issue #24: CATCH");
        }
      }
    }
    this.$el.html(this.template({
      label: this.model.getLabel(),
      selected: _list,
      type: this.model.get("type"),
      name: this.model.get("name"),
      pinned: this.model.get("pinned") || false
    }));
    this.$sub = this.$(".subselect");
    this.$results = this.$(".subresults");
    this.generateSub();
    return this.el;
  };

  ViewSub.prototype.reopen = function(evnt) {
    var ref, ref1;
    if ((evnt != null) && $(evnt.target).is(".rm-result-btn") && (((ref = this.selectview) != null ? ref.rmRes : void 0) != null)) {
      this.selectview.rmRes(evnt);
      evnt.preventDefault();
      evnt.stopPropagation();
      return;
    }
    if ((evnt != null) && $(evnt.target).is(".edit-result-btn") && (((ref1 = this.selectview) != null ? ref1.editRes : void 0) != null)) {
      this.selectview.editRes(evnt);
      evnt.preventDefault();
      evnt.stopPropagation();
      return;
    }
    if (!this._isOpen && (this.selectview != null)) {
      this.selectview.reopen(this);
    }
    if (evnt != null) {
      evnt.preventDefault();
    }
    if (evnt != null) {
      evnt.stopPropagation();
    }
    this.trigger("reopen");
  };

  ViewSub.prototype.del = function(evnt) {
    if (this.model.get("pinned")) {
      return;
    }
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
    if (this.result.length <= 0 && !this.selectview.editMode) {
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
        if (_this.model.get("pinned")) {
          return;
        }
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

},{"fs":37}],39:[function(require,module,exports){
(function() {
  var _getKey, isArray, toString;

  toString = {}.toString;

  isArray = Array.isArray || function(arr) {
    return toString.call(arr) === '[object Array]';
  };

  _getKey = function(el, key) {
    return el[key];
  };

  module.exports = function(keys, forward, getKey) {
    var fnsort, ref;
    if (forward == null) {
      forward = true;
    }
    if (getKey == null) {
      getKey = _getKey;
    }
    if (!isArray(keys)) {
      keys = [keys];
    }
    fnsort = function(forward, key, nextkeys) {
      var _fwrd, _k, nextSort, ref;
      if (nextkeys != null ? nextkeys.length : void 0) {
        _k = (ref = nextkeys.splice(0, 1)) != null ? ref[0] : void 0;
        if (_k != null) {
          nextSort = fnsort(forward, _k, nextkeys);
        }
      }
      _fwrd = (forward[key] != null ? forward[key] : (forward["?"] != null ? forward["?"] : forward));
      return function(elA, elB) {
        var _a, _b;
        _a = getKey(elA, key);
        _b = getKey(elB, key);
        if (_a < _b) {
          if (_fwrd) {
            return -1;
          } else {
            return 1;
          }
        } else if (_a > _b) {
          if (_fwrd) {
            return 1;
          } else {
            return -1;
          }
        } else if (_a === _b) {
          if (nextSort != null) {
            return nextSort(elA, elB);
          } else {
            return 0;
          }
        }
      };
    };
    return fnsort(forward, (ref = keys.splice(0, 1)) != null ? ref[0] : void 0, keys);
  };

}).call(this);

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL21haW4uY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvYmFja2JvbmVfc3ViLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2Jhc2UuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9yYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0cy5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3JhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXIuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL3N1YnN0cmluZy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL3N1Yi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0Y29sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsNEdBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVDs7QUFDWCxNQUFBLEdBQVMsT0FBQSxDQUFTLGlCQUFUOztBQUNULFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFTLDBCQUFUOztBQUNm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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTWFpblZpZXcgPSByZXF1aXJlKCBcIi4vdmlld3MvbWFpblwiIClcbkZhY2V0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRzXCIgKVxuRmN0U3RyaW5nID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zdHJpbmdcIiApXG5GY3RBcnJheSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfYXJyYXlcIiApXG5GY3RTZWxlY3QgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3NlbGVjdFwiIClcbkZjdE51bWJlciA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfbnVtYmVyXCIgKVxuRmN0UmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3JhbmdlXCIgKVxuRmN0RGF0ZVJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9kYXRlcmFuZ2VcIiApXG5GY3RFdmVudCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfZXZlbnRcIiApXG5SZXN1bHRzID0gcmVxdWlyZSggXCIuL21vZGVscy9yZXN1bHRzXCIgKVxuXG5jbGFzcyBJR0dZIGV4dGVuZHMgQmFja2JvbmUuRXZlbnRzXG5cdCQ6IGpRdWVyeVxuXHRjb25zdHJ1Y3RvcjogKCBlbCwgZmFjZXRzID0gW10sIG9wdGlvbnMgPSB7fSApLT5cblx0XHRfLmV4dGVuZCBALCBCYWNrYm9uZS5FdmVudHNcblx0XHRAX2luaXRFcnJvcnMoKVxuXHRcdFxuXHRcdCMgaW5pdCBlbGVtZW50XG5cdFx0QCRlbCA9IEBfcHJlcGFyZUVsKCBlbCApXG5cdFx0QGVsID0gQCRlbFswXVxuXHRcdEAkZWwuZGF0YSggXCJpZ2d5XCIsIEAgKVxuXG5cdFx0IyBpbml0IGZhY2V0c1xuXHRcdEBmYWNldHMgPSBAX3ByZXBhcmVGYWNldHMoIGZhY2V0cywgb3B0aW9ucyApXG5cdFx0QHJlc3VsdHMgPSBuZXcgUmVzdWx0cyggbnVsbCwgb3B0aW9ucyApXG5cblx0XHRAcmVzdWx0cy5vbiBcImFkZFwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwicmVtb3ZlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJjaGFuZ2VcIiwgQHRyaWdnZXJDaGFuZ2VcblxuXHRcdEB2aWV3ID0gbmV3IE1haW5WaWV3KCBtYWluOiBALCBlbDogQCRlbCwgY29sbGVjdGlvbjogQGZhY2V0cywgcmVzdWx0czogQHJlc3VsdHMsIHNlYXJjaEJ1dHRvbjogb3B0aW9ucy5zZWFyY2hCdXR0b24gb3Ige30gKVxuXHRcdFxuXHRcdEB2aWV3Lm9uIFwic2VhcmNoYnV0dG9uXCIsIEB0cmlnZ2VyRXZlbnRcblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUVsOiAoIGVsICk9PlxuXG5cdFx0aWYgbm90IGVsP1xuXHRcdFx0dGhyb3cgQF9lcnJvciggXCJFTUlTU0lOR0VMXCIgKVxuXG5cdFx0aWYgXy5pc1N0cmluZyggZWwgKVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMU1RSSU5HXCIgKVxuXG5cdFx0XHRfJGVsID0gQCQoIGVsIClcblx0XHRcdGlmIG5vdCBfJGVsPy5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMU1RSSU5HXCIgKVxuXG5cdFx0XHRyZXR1cm4gXyRlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTEpRVUVSWVwiIClcblxuXHRcdFx0IyBUT0RPIGhhbmRsZSBtdWx0aXBsZSBqUXVlcnkgZWxlbWVudHMgdG8gSUdHWSBpbnN0YW5jZXNcblx0XHRcdGlmIGVsLmxlbmd0aCA+IDFcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFU0laRUVMSlFVRVJZXCIgKVxuXG5cdFx0XHRyZXR1cm4gZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgRWxlbWVudFxuXHRcdFx0cmV0dXJuIEAkKCBlbCApXG5cblx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxUWVBFXCIgKVxuXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVGYWNldHM6ICggZmFjZXRzLCBvcHRpb25zPXt9ICk9PlxuXHRcdF9yZXQgPSBbXVxuXHRcdGZvciBmYWNldCwgX2lkeCBpbiBmYWNldHMgd2hlbiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRfZmN0Ll9pZHggPSBfaWR4XG5cdFx0XHRfcmV0LnB1c2ggX2ZjdFxuXHRcdFxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0LCBvcHRpb25zIClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKS0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJzZWxlY3RcIiB0aGVuIHJldHVybiBuZXcgRmN0U2VsZWN0KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwicmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0UmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJkYXRlcmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0RGF0ZVJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZXZlbnRcIiB0aGVuIHJldHVybiBuZXcgRmN0RXZlbnQoIGZhY2V0LCBtYWluOiBAIClcblxuXHRhZGRGYWNldDogKCBmYWNldCApPT5cblx0XHRpZiBub3QgQGZhY2V0cz9cblx0XHRcdHJldHVyblxuXHRcdGlmICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdEBmYWNldHMuYWRkKCBfZmN0IClcblx0XHRyZXR1cm4gQFxuXG5cdF9lcnJvcjogKCB0eXBlLCBkYXRhID0ge30gKT0+XG5cdFx0aWYgQGVycm9yc1sgdHlwZSBdP1xuXHRcdFx0X21zZyA9IEBlcnJvcnNbIHR5cGUgXSggZGF0YSApXG5cdFx0ZWxzZVxuXHRcdFx0X21zZyA9IFwiLVwiXG5cdFx0X2VyciA9IG5ldyBFcnJvcigpXG5cdFx0X2Vyci5uYW1lID0gdHlwZVxuXHRcdF9lcnIubWVzc2FnZSA9IF9tc2dcblx0XHRyZXR1cm4gX2VyclxuXG5cdGdldFF1ZXJ5OiA9PlxuXHRcdHJldHVybiBAcmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0QHRyaWdnZXIoIFwiY2hhbmdlXCIsIEByZXN1bHRzIClcblx0XHRyZXR1cm5cblx0XG5cdHRyaWdnZXJFdmVudDogKCBldmVudE5hbWUgKT0+XG5cdFx0QHRyaWdnZXIoIGV2ZW50TmFtZSwgQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfaW5pdEVycm9yczogPT5cblx0XHRAZXJyb3JzID0ge31cblx0XHRmb3IgX2ssIF90bXBsIG9mIEBFUlJPUlMoKVxuXHRcdFx0QGVycm9yc1sgX2sgXSA9IF8udGVtcGxhdGUoIF90bXBsIClcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6IC0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1lcbiIsIiMjI1xuRVhBTVBMRSBVU0FHRVxuXG5cdHBhcmVudENvbGwgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbi5TdWIoKVxuXHRcblx0IyBieSBBcnJheVxuXHRzdWJDb2xsQSA9IHBhcmVudENvbGwuc3ViKCBbIDEsIDIsIDMgXSApXG5cdFxuXHQjIG9yIGJ5IE9iamVjdFxuXHRzdWJDb2xsTyA9IHBhcmVudENvbGwuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscywgQF9zdWJDb2xsZWN0aW9uT3B0aW9ucygpIClcblxuXHRcdF9zdWIuX3BhcmVudENvbCA9IEBcblx0XHRfc3ViLl9mbkZpbHRlciA9IGZuRmlsdGVyXG5cblx0XHQjIGFkZCBldmVudCBoYW5kbGVycyB0byBkaXN0cmlidXRlIHRoZSBtb2RlbHMgdGhyb3VnaCB0aGUgc3ViIGNvbGxlY3Rpb25zIHRyZWVcblxuXHRcdCMgcmVjaGVjayB0aGUgbW9kZWwgYWdhaW5zdCB0aGUgZmlsdGVyIG9uIGNoYW5nZVxuXHRcdEBvbiBcImNoYW5nZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHR0b0FkZCA9IEBfZm5GaWx0ZXIoIF9tIClcblx0XHRcdGFkZGVkID0gQGdldCggX20gKT9cblx0XHRcdGlmIGFkZGVkIGFuZCBub3QgdG9BZGRcblx0XHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0ZWxzZSBpZiBub3QgYWRkZWQgYW5kIHRvQWRkXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBiYXNlIGNvbGxlY3Rpb24gb24gYWRkIHRvIHN1YlxuXHRcdF9zdWIub24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gc3ViIGNvbGxlY3Rpb24gb24gYWRkIHRvIGJhc2UgaWYgaXQgbWF0Y2hlcyB0aGUgZmlsdGVyXG5cdFx0QG9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdGlmIEBfZm5GaWx0ZXIoIF9tIClcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRfc3ViLm9uIFwicmVtb3ZlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdCNAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0QG9uIFwicmVtb3ZlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0QG9uIFwicmVzZXRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHVwZGF0ZVN1YkZpbHRlcigpXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBzdG9yZSB0aGUgc3ViY29sbGVjdGlvbiB1bmRlciB0aGUgY3VycmVudCBjb2xsZWN0aW9uXG5cdFx0QHN1YkNvbGxzLnB1c2goIF9zdWIgKVxuXG5cdFx0cmV0dXJuIF9zdWJcblx0XG5cdCMjI1xuXHQjIyBfc3ViQ29sbGVjdGlvbk9wdGlvbnNcblx0XG5cdGBjb2xsZWN0aW9uLl9zdWJDb2xsZWN0aW9uT3B0aW9ucygpYFxuXHRcblx0T3ZlcndyaXRhYmxlIG1ldGhvZCB0byBzZXQgdGhlIGNvbnN0cnVjdG9yIG9wdGlvbnMgZm9yIHN1YiBjb2xsZWN0aW9uc1xuXHRcblx0QHJldHVybiB7IE9iamVjdCB9IFRoZSBvcHRpb25zIG9iamVjdFxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfc3ViQ29sbGVjdGlvbk9wdGlvbnM6ID0+XG5cdFx0X29wdHMgPVxuXHRcdFx0Y29tcGFyYXRvcjogQGNvbXBhcmF0b3Jcblx0XHRyZXR1cm4gX29wdHNcblxuXHQjIyNcblx0IyMgdXBkYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi51cGRhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0TWV0aG9kIHRvIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gVGhlbiBhbGwgbW9kZWxzIHdpbGwgYmUgcmVzZXRlIGJ5IHRoZSBuZXcgZmlsdGVyLiBTbyB5b3UgaGF2ZSB0byBsaXN0ZW4gdG8gdGVoIHJlc2V0IGV2ZW50XG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IFNlbGYgfSBpdHNlbGZcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHR1cGRhdGVTdWJGaWx0ZXI6ICggZmlsdGVyLCBhc1Jlc2V0ID0gdHJ1ZSApPT5cblx0XHRpZiBAX3BhcmVudENvbD9cblxuXHRcdFx0IyBzZXQgdGhlIG5ldyBmaWx0ZXIgbWV0aG9kXG5cdFx0XHRAX2ZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyICkgaWYgZmlsdGVyP1xuXG5cdFx0XHRfbW9kZWxzID0gQF9wYXJlbnRDb2wuZmlsdGVyKCBAX2ZuRmlsdGVyIClcblxuXHRcdFx0IyByZXNldCB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBuZXcgbW9kZWxzXG5cdFx0XHRpZiBhc1Jlc2V0XG5cdFx0XHRcdEByZXNldCggX21vZGVscyApXG5cdFx0XHRcdHJldHVybiBAXG5cblx0XHRcdG5ld2lkcyA9IF8ucGx1Y2soIF9tb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Y3VycmlkcyA9IF8ucGx1Y2soIEBtb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Zm9yIHJpZCBpbiBfLmRpZmZlcmVuY2UoIGN1cnJpZHMsIG5ld2lkcyApXG5cdFx0XHRcdEByZW1vdmUoIHJpZCApXG5cdFx0XHRcdFxuXHRcdFx0X2FkZElkcyA9IF8uZGlmZmVyZW5jZSggbmV3aWRzLCBjdXJyaWRzIClcblx0XHRcdGZvciBtZGwgaW4gX21vZGVscyB3aGVuIG1kbC5jaWQgaW4gX2FkZElkc1xuXHRcdFx0XHRAYWRkKCBtZGwgKVxuXG5cdFx0cmV0dXJuIEBcblxuXG5cdCMjI1xuXHQjIyBfZ2VuZXJhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLl9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRJbnRlcm5hbCBtZXRob2QgdGggY29udmVydCBhIGZpbHRlciBhcmd1bWVudCB0byBhIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBGdW5jdGlvbiB9IFRoZSBnZW5lcmF0ZWQgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAYXBpIHByaXZhdGVcblx0IyMjXG5cdF9nZW5lcmF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIgKS0+XG5cdFx0IyBjb25zdHJ1Y3QgdGhlIGZpbHRlciBmdW5jdGlvblxuXHRcdGlmIF8uaXNGdW5jdGlvbiggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzQXJyYXkoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGluIGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc1N0cmluZyggZmlsdGVyICkgb3IgXy5pc051bWJlciggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0X20uaWQgaXMgZmlsdGVyXG5cdFx0ZWxzZVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRmb3IgX25tLCBfdmwgb2YgZmlsdGVyXG5cdFx0XHRcdFx0aWYgX20uZ2V0KCBfbm0gKSBpc250IF92bFxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRyZXR1cm4gZm5GaWx0ZXJcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZVN1YlxuIiwiY2xhc3MgRmN0QXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfc3RyaW5nXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheVwiIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEFycmF5XG4iLCJjbGFzcyBGYWNldEJhc2UgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvYmFzZVwiIClcblx0XG5cdGNvbnN0cnVjdG9yOiAoIGF0dHJzLCBvcHRpb25zICktPlxuXHRcdEBtYWluID0gb3B0aW9ucy5tYWluXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGRlZmF1bHRzOiAtPlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBcIm5hbWVcIlxuXHRcdGxhYmVsOiBcIkRlc2NyaXB0aW9uXCJcblx0XHRzb3J0OiAwXG5cblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcIm5hbWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cblx0Y29tcGFyYXRvcjogKCBtZGwgKS0+XG5cdFx0cmV0dXJuIG1kbC5pZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0QmFzZVxuIiwiY2xhc3MgRmN0RGF0ZVJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2RhdGVyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0czoge31cblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0RGF0ZVJhbmdlXG4iLCJjbGFzcyBGY3RFdmVudCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiBudWxsXG5cdG9ubHlFeGVjOiB0cnVlXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XG5cdGV4ZWM6ICggKT0+XG5cdFx0QG1haW4udHJpZ2dlciggQGdldCggXCJldmVudFwiICksIEB0b0pTT04oKSApXG5cdFx0cmV0dXJuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEV2ZW50XG4iLCJjbGFzcyBGY3ROdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VibnVtYmVyXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3ROdW1iZXJcbiIsImNsYXNzIEZjdFJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RSYW5nZVxuIiwiY2xhc3MgRmN0U2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnNlbGVjdFwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kKCBzdXBlciwge1xuXHRcdFx0b3B0aW9uczogW11cblx0XHRcdHdhaXRGb3JBc3luYzogdHJ1ZVxuXHRcdH0pXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U2VsZWN0XG4iLCJjbGFzcyBGY3RTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic3RyaW5nXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRpb25zOiBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFN0cmluZ1xuIiwic29ydENvbGwgPSByZXF1aXJlKCBcInNvcnRjb2xsXCIgKVxuXG5mbkdldCA9ICggZWwsIGtleSApLT5cblx0cmV0dXJuIGVsLmdldCgga2V5IClcblxuY2xhc3MgSWdneUZhY2V0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBtb2RlbHMsIG9wdGlvbnM9e30gKS0+XG5cdFx0aWYgbm90IG9wdGlvbnMuY29tcGFyYXRvcj9cblx0XHRcdF9mb3J3YXJkID0gc3dpdGNoIG9wdGlvbnMuZGlyXG5cdFx0XHRcdHdoZW4gXCJhc2NcIiB0aGVuIHRydWVcblx0XHRcdFx0d2hlbiBcImRlc2NcIiB0aGVuIGZhbHNlXG5cdFx0XHRcdGVsc2UgdHJ1ZVxuXHRcdFx0XG5cdFx0XHRvcHRpb25zLmNvbXBhcmF0b3IgPSBzb3J0Q29sbCggWyBcInNvcnRcIiBdLmNvbmNhdCggb3B0aW9ucy5zb3J0Ynkgb3IgXCJuYW1lXCIgKSwgeyBzb3J0OiBmYWxzZSwgXCI/XCI6IF9mb3J3YXJkIH0sIGZuR2V0IClcblx0XHRyZXR1cm4gc3VwZXIoIG1vZGVscywgb3B0aW9ucyApXG5cdFxuXHRfc3ViQ29sbGVjY3Rpb25PcHRpb25zOiA9PlxuXHRcdG9wdCA9IHN1cGVyXG5cdFx0b3B0LmRpciA9IGlmIEBmb3J3YXJkIHRoZW4gXCJhc2NcIiBlbHNlIFwiZGVzY1wiXG5cdFx0cmV0dXJuIG9wdFxuXHRcblx0bW9kZWxJZDogKGF0dHJzKS0+XG5cdFx0cmV0dXJuIGF0dHJzLm5hbWVcblx0XHRcbm1vZHVsZS5leHBvcnRzID0gSWdneUZhY2V0c1xuIiwiY2xhc3MgSWdneVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRkZWZhdWx0czpcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogbnVsbFxuXHRcdHZhbHVlOiBudWxsXG5cbmNsYXNzIElnZ3lSZXN1bHRzIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHRtb2RlbDogSWdneVJlc3VsdFxuXHRpbml0aWFsaXplOiAoIG1kbHMsIG9wdHMgKT0+XG5cdFx0aWYgb3B0cy5tb2RpZnlLZXk/Lmxlbmd0aFxuXHRcdFx0QG1vZGlmeUtleSA9IG9wdHMubW9kaWZ5S2V5XG5cdFx0cmV0dXJuXG5cdHBhcnNlOiAoIGF0dHIsIG9wdGlvbnMgKT0+XG5cdFx0X2tleSA9IG9wdGlvbnMuX2ZhY2V0LmdldCggXCJtb2RpZnlLZXlcIiApIG9yIEBtb2RpZnlLZXkgb3IgXCJ2YWx1ZVwiXG5cdFx0X21vZGlmeSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwibW9kaWZ5XCIgKVxuXHRcdGlmIF9tb2RpZnk/IGFuZCBfLmlzRnVuY3Rpb24oIF9tb2RpZnkgKVxuXHRcdFx0YXR0clsgX2tleSBdID0gX21vZGlmeSggYXR0ci52YWx1ZSwgb3B0aW9ucy5fZmFjZXQsIGF0dHIgKVxuXHRcdHJldHVybiBhdHRyXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneVJlc3VsdHNcbiIsImNsYXNzIEJhc2VSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBAaWRBdHRyaWJ1dGUgKSBvciBcIlwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzXG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjdXN0b20sIGlkLCB0eHQpIHtcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0eHQpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiYnRuLXdycFxcXCI+PGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInJtLXJlc3VsdC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+XCIpO1xuaWYgKCBjdXN0b20pXG57XG5idWYucHVzaChcIjxpXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJlZGl0LXJlc3VsdC1idG4gZmEgZmEtcGVuY2lsXFxcIj48L2k+XCIpO1xufVxuYnVmLnB1c2goXCI8L3NwYW4+XCIpO30uY2FsbCh0aGlzLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImlkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pZDp0eXBlb2YgaWQhPT1cInVuZGVmaW5lZFwiP2lkOnVuZGVmaW5lZCxcInR4dFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudHh0OnR5cGVvZiB0eHQhPT1cInVuZGVmaW5lZFwiP3R4dDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvciwgb3BlcmF0b3JzLCB1bmRlZmluZWQsIHZhbHVlKSB7XG5pZiAoIG9wZXJhdG9ycyAmJiBvcGVyYXRvcnMubGVuZ3RoKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+PHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiKTtcbi8vIGl0ZXJhdGUgb3BlcmF0b3JzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wZXJhdG9ycztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yOnR5cGVvZiBvcGVyYXRvciE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3I6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJhbmdlaW5wXFxcIj5cIik7XG52YXIgX3ZhbHMgPSB2YWx1ZSA/IHZhbHVlIDogW11cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfZnJvbVwiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzBdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtZnJvbVxcXCIvPjxzcGFuIGNsYXNzPVxcXCJzZXBhcmF0b3JcXFwiPi08L3NwYW4+PGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfdG9cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1sxXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLXRvXFxcIi8+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG47cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG11bHRpcGxlLCBvcHRpb25Hcm91cHMsIG9wdGlvbnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIG11bHRpcGxlPVxcXCJtdWx0aXBsZVxcXCIgY2xhc3M9XFxcInNlbGVjdC1pbnBcXFwiPlwiKTtcbmlmICggb3B0aW9uR3JvdXBzKVxue1xuLy8gaXRlcmF0ZSBvcHRpb25Hcm91cHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9uR3JvdXBzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgZ25hbWUgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGduYW1lIDwgJCRsOyBnbmFtZSsrKSB7XG4gICAgICB2YXIgb3B0cyA9ICQkb2JqW2duYW1lXTtcblxuYnVmLnB1c2goXCI8b3B0Z3JvdXBcIiArIChqYWRlLmF0dHIoXCJsYWJlbFwiLCBnbmFtZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPjwvb3B0Z3JvdXA+XCIpO1xuLy8gaXRlcmF0ZSBvcHRzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgZ25hbWUgaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZVxue1xuLy8gaXRlcmF0ZSBvcHRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbmlmICggbXVsdGlwbGUpXG57XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJidG4gYnRuLXhzIGJ0bi1zdWNjZXNzIHNlbGVjdC1jaGVjayBmYSBmYS1jaGVja1xcXCI+PC9zcGFuPlwiKTtcbn19LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJtdWx0aXBsZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubXVsdGlwbGU6dHlwZW9mIG11bHRpcGxlIT09XCJ1bmRlZmluZWRcIj9tdWx0aXBsZTp1bmRlZmluZWQsXCJvcHRpb25Hcm91cHNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbkdyb3Vwczp0eXBlb2Ygb3B0aW9uR3JvdXBzIT09XCJ1bmRlZmluZWRcIj9vcHRpb25Hcm91cHM6dW5kZWZpbmVkLFwib3B0aW9uc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uczp0eXBlb2Ygb3B0aW9ucyE9PVwidW5kZWZpbmVkXCI/b3B0aW9uczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBpbnB2YWwpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGlucHZhbCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzZWxlY3Rvci1pbnBcXFwiLz48dWxcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcInR5cGVsaXN0XCIsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHlwZWxpc3RcXFwiPjwvdWw+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcImlucHZhbFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguaW5wdmFsOnR5cGVvZiBpbnB2YWwhPT1cInVuZGVmaW5lZFwiP2lucHZhbDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChhY3RpdmVJZHgsIGN1c3RvbSwgbGlzdCwgcXVlcnksIHVuZGVmaW5lZCkge1xudmFyIGFkZCA9IDA7XG5pZiAoIGN1c3RvbSAmJiBxdWVyeSlcbntcbmFkZCA9IDE7XG5idWYucHVzaChcIjxsaT48YSBkYXRhLWlkPVxcXCJfY3VzdG9tXFxcIiBkYXRhLWlkeD1cXFwiLTFcXFwiXCIgKyAoamFkZS5jbHMoW3thY3RpdmU6MCA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+PGk+XFxcIlwiICsgKCgoamFkZV9pbnRlcnAgPSBxdWVyeSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXFxcIjwvaT48L2E+PC9saT5cIik7XG59XG5pZiAoIGxpc3QubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBsaXN0XG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IGxpc3Q7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZSBpZiAoICFjdXN0b20pXG57XG5idWYucHVzaChcIjxsaT48YSBjbGFzcz1cXFwiZW1wdHlyZXNcXFwiPm5vIHJlc3VsdCBmb3IgXFxcIlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9hPjwvbGk+XCIpO1xufX0uY2FsbCh0aGlzLFwiYWN0aXZlSWR4XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5hY3RpdmVJZHg6dHlwZW9mIGFjdGl2ZUlkeCE9PVwidW5kZWZpbmVkXCI/YWN0aXZlSWR4OnVuZGVmaW5lZCxcImN1c3RvbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY3VzdG9tOnR5cGVvZiBjdXN0b20hPT1cInVuZGVmaW5lZFwiP2N1c3RvbTp1bmRlZmluZWQsXCJsaXN0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5saXN0OnR5cGVvZiBsaXN0IT09XCJ1bmRlZmluZWRcIj9saXN0OnVuZGVmaW5lZCxcInF1ZXJ5XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5xdWVyeTp0eXBlb2YgcXVlcnkhPT1cInVuZGVmaW5lZFwiP3F1ZXJ5OnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzdHJpbmctaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBwaW5uZWQsIHNlbGVjdGVkLCB1bmRlZmluZWQpIHtcbmlmICggIXBpbm5lZClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwic3VibGFiZWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI6PC9zcGFuPjx1bCBjbGFzcz1cXFwic3VicmVzdWx0c1xcXCI+XCIpO1xuaWYgKCBzZWxlY3RlZCAmJiBzZWxlY3RlZC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIHNlbGVjdGVkXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHNlbGVjdGVkO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT48c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGkgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxzcGFuIGNsYXNzPVxcXCJ0eHRcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48aSBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9pPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PGRpdiBjbGFzcz1cXFwic3Vic2VsZWN0XFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJsb2FkZXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jb2cgZmEtc3BpblxcXCI+PC9pPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInBpbm5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgucGlubmVkOnR5cGVvZiBwaW5uZWQhPT1cInVuZGVmaW5lZFwiP3Bpbm5lZDp1bmRlZmluZWQsXCJzZWxlY3RlZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VsZWN0ZWQ6dHlwZW9mIHNlbGVjdGVkIT09XCJ1bmRlZmluZWRcIj9zZWxlY3RlZDp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoc2VhcmNoQnV0dG9uKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImFkZC1mYWNldC1idG4gZmEgZmEtcGx1c1xcXCI+PC9kaXY+XCIpO1xuaWYgKCBzZWFyY2hCdXR0b24gIT0gdW5kZWZpbmVkICYmIHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSAhPSB1bmRlZmluZWQgJiYgc2VhcmNoQnV0dG9uLnRlbXBsYXRlLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPGJ1dHRvblwiICsgKGphZGUuY2xzKFsnc2VhcmNoLWJ0bicsc2VhcmNoQnV0dG9uLmNzc2NsYXNzLHtcInNlYXJjaC1idG4tcHVsbHJpZ2h0XCI6c2VhcmNoQnV0dG9uLnB1bGxyaWdodH1dLCBbbnVsbCx0cnVlLHRydWVdKSkgKyBcIj5cIiArIChudWxsID09IChqYWRlX2ludGVycCA9IHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApICsgXCI8L2J1dHRvbj5cIik7XG59fS5jYWxsKHRoaXMsXCJzZWFyY2hCdXR0b25cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnNlYXJjaEJ1dHRvbjp0eXBlb2Ygc2VhcmNoQnV0dG9uIT09XCJ1bmRlZmluZWRcIj9zZWFyY2hCdXR0b246dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPVxuXHRcIkxFRlRcIjogMzdcblx0XCJSSUdIVFwiOiAzOVxuXHRcIlVQXCI6IDM4XG5cdFwiRE9XTlwiOiA0MFxuXHRcIkVTQ1wiOiBbIDIyOSwgMjcgXVxuXHRcIkVOVEVSXCI6IDEzXG5cdFwiVEFCXCI6IDlcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNCYXNlIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHRyZXN1bHRUZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yZXN1bHRfYmFzZS5qYWRlXCIgKVxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAc3ViID0gb3B0aW9ucy5zdWJcblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRpZiBfbGJsPyBhbmQgX2xibCBpc250IFwiXCJcblx0XHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0aWYgX2xpc3QubGVuZ3RoXG5cdFx0XHRyZXR1cm4gXCI8bGk+XCIgKyBfbGlzdC5qb2luKCBcIjwvbGk+PGxpPlwiICkgKyBcIjwvbGk+XCJcblx0XHRyZXR1cm4gXCJcIlxuXHRcdFxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuVEFCIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5UQUJcblx0XHRcdEBfb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXQgPSBcblx0XHRcdGNpZDogQGNpZFxuXHRcdFx0dmFsdWU6IEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKVxuXHRcdHJldHVybiByZXRcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfVwiXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEByZW5kZXIoKVxuXHRcdHBWaWV3Lm9wZW4oKVxuXHRcdHJldHVyblxuXHRcblx0cmVuZGVyOiA9PlxuXHRcdF90bXBsID0gQHRlbXBsYXRlKCAgQGdldFRlbXBsYXRlRGF0YSgpIClcblx0XHRAJGVsLmh0bWwoIF90bXBsIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvcigpIClcblx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCB0cnVlIClcblx0XHRyZXR1cm5cblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXlkb3duXCJcblx0XHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHQkKCBkb2N1bWVudCApLm9mZiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggZmFsc2UgKVxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwib3BlblwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAaXNPcGVuID0gZmFsc2Vcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQGdldFZhbHVlKClcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogLT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRfY2hlY2tTZWxlY3RFbXB0eTogKCBfdmFsICk9PlxuXHRcdGlmIF8uaXNFbXB0eSggX3ZhbCApIGFuZCBub3QgXy5pc051bWJlciggX3ZhbCApIGFuZCBub3QgXy5pc0Jvb2xlYW4oIF92YWwgKSBhbmQgbm90IEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0OiA9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBpZiBAX2NoZWNrU2VsZWN0RW1wdHkoIF92YWwgKVxuXHRcdEBzZXQoIF92YWwgKVxuXHRcdHJldHVyblxuXG5cdHNldDogKCB2YWwgKT0+XG5cdFx0X21vZGVsID0gQHJlc3VsdC5maXJzdCgpXG5cdFx0aWYgbm90IF9tb2RlbD9cblx0XHRcdF9Nb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IHZhbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRlbHNlXG5cdFx0XHRfbW9kZWwuc2V0KCB2YWx1ZTogdmFsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNCYXNlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0RhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9kYXRlcmFuZ2UuamFkZVwiIClcblxuXHRmb3JjZWREYXRlUmFuZ2VPcHRzOiA9PlxuXHRcdF9vcHRzID1cblx0XHRcdG9wZW5zOiBcInJpZ2h0XCJcblx0XHRcdFxuXHRcdGlmIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiIClcblx0XHRcdF9vcHRzLmxvY2FsZSA9XG5cdFx0XHRcdGZvcm1hdDogQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKVxuXHRcdFxuXHRcdGlmIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKT9bMF0/XG5cdFx0XHRfc2QgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVswXSwgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKSApXG5cdFx0XHRpZiBfc2QuaXNWYWxpZCgpXG5cdFx0XHRcdF9vcHRzLnN0YXJ0RGF0ZSA9IF9zZC5fZFxuXG5cdFx0aWYgQG1vZGVsLmdldChcInZhbHVlXCIpP1sxXT9cblx0XHRcdF9lZCA9IG1vbWVudCggQG1vZGVsLmdldChcInZhbHVlXCIpWzFdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdGlmIF9lZC5pc1ZhbGlkKClcblx0XHRcdFx0X29wdHMuZW5kRGF0ZSA9IF9lZC5fZFxuXHRcdHJldHVybiBfb3B0c1xuXG5cdGV2ZW50czogPT5cblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdGlmIG5vdCBAZGF0ZXJhbmdlcGlja2VyP1xuXHRcdFx0X29wdHMgPSBfLmV4dGVuZCgge30sIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIEBmb3JjZWREYXRlUmFuZ2VPcHRzKCkgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblx0XHRcdFxuXHRcdFx0IyBwcmV2ZW50IGZyb20gaGFuZGxpY2ggdGhlIG91dGVyY2xpY2sgZXhpdCBmcm9tIE1haW5WaWV3XG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lci5vbiBcImNsaWNrXCIsICggZXZudCApLT5cblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRlbHNlXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmVsZW1lbnQgPSBAJGlucFxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5zaG93KClcblx0XHRcdFxuXHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRAJGlucC5vbiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRjbG9zZTogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wLm9mZiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub2ZmKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0cmV0dXJuXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0QGRhdGVyYW5nZXBpY2tlciA9IG51bGxcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRcblx0XHRpZiBfLmlzTnVtYmVyKCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdFx0X3N0YXJ0RGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMCBdIClcblx0XHRlbHNlXG5cdFx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXHRcdFx0XG5cdFx0aWYgX3Jlcy52YWx1ZVsgMSBdP1xuXHRcdFx0aWYgXy5pc051bWJlciggX3Jlcy52YWx1ZVsgMSBdIClcblx0XHRcdFx0X2VuZERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDEgXSApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXG5cdFx0X3RpbWUgPSBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLnRpbWVQaWNrZXJcblxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApP1xuXHRcdFx0X2ZybXQgPSBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0ZWxzZSBpZiBfdGltZVxuXHRcdFx0X2ZybXQgPSBcIkxMTExcIlxuXHRcdGVsc2Vcblx0XHRcdF9mcm10ID0gXCJMTFwiXG5cdFx0X3MgKz0gX3N0YXJ0RGF0ZS5mb3JtYXQoIF9mcm10IClcblxuXHRcdGlmIF9lbmREYXRlP1xuXHRcdFx0X3MgKz0gXCIgLSBcIlxuXHRcdFx0X3MgKz0gX2VuZERhdGUuZm9ybWF0KCBfZnJtdCApXG5cblx0XHRfcyArPSBcIjwvbGk+XCJcblxuXHRcdHJldHVybiBfc1xuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QG1vZGVsLnNldCggXCJ2YWx1ZVwiLCBAZ2V0VmFsdWUoIGZhbHNlICkgKVxuXHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRWYWx1ZTogKCBwcmVkZWYgPSB0cnVlICk9PlxuXHRcdGlmIHByZWRlZlxuXHRcdFx0X3ByZWRlZlZhbCA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0XHRpZiBfcHJlZGVmVmFsP1xuXHRcdFx0XHRpZiBub3QgXy5pc0FycmF5KCBfcHJlZGVmVmFsIClcblx0XHRcdFx0XHRfcHJlZGVmVmFsID0gIFsgX3ByZWRlZlZhbCBdXG5cdFx0XHRcdFsgQHN0YXJ0RGF0ZSwgQGVuZERhdGUgXSA9IF9wcmVkZWZWYWxcblx0XHRcdFx0cmV0dXJuIF9wcmVkZWZWYWxcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldE51bWJlckJhc2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAc2V0TnVtYmVyID0gXy50aHJvdHRsZSggQF9zZXROdW1iZXIsIDMwMCwge2xlYWRpbmc6IGZhbHNlLCB0cmFpbGluZzogZmFsc2V9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdF8kZWwgPSAkKCBldm50LmN1cnJlbnRUYXJnZXQgKVxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICksIF8kZWwgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSAqIC0xLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleXVwXCJcblx0XHRcdF92ID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnJlcGxhY2UoIC9bXlxcZF0/W14tXFxkXSsvZywgXCJcIiApXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXHRcdFx0IFxuXHRcdFx0QHNldE51bWJlciggX3YsIF8kZWwgKVxuXHRcdHJldHVyblxuXG5cdGNyZW1lbnQ6ICggY2hhbmdlLCBlbCA9IEAkaW5wICk9PlxuXHRcdF92ID0gZWwudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0X3YgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0XHRAX3NldE51bWJlciggX3YgKyBjaGFuZ2UsIGVsIClcblx0XHRyZXR1cm5cblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0cmV0dXJuIHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdF9zZXROdW1iZXI6ICggX3YsIGVsID0gQCRpbnAgKT0+XG5cdFx0aWYgaXNOYU4oIF92IClcblx0XHRcdCNAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X2N1cnIgPSBlbC52YWwoKVxuXG5cdFx0X3YgPSBAdmFsdWVCeURlZmluaXRpb24oIF92KVxuXHRcdGlmIF9jdXJyICE9IF92LnRvU3RyaW5nKClcblx0XHRcdGVsLnZhbCggX3YgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSApLT5cblx0XHRtYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRtaW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRzdGVwID0gQG1vZGVsLmdldCggXCJzdGVwXCIgKVxuXHRcdFxuXHRcdCMgZml4IHJldmVyc2VkIG1pbi9tYXggc2V0dGluZ1xuXHRcdGlmIG1pbiA+IG1heFxuXHRcdFx0X3RtcCA9IG1pblxuXHRcdFx0bWluID0gbWF4XG5cdFx0XHRtYXggPSBfdG1wXG5cdFx0XG5cdFx0IyBvbiBleHhlZGRpbmcgdGhlIGxpbWl0cyB1c2UgdGhlIGxpbWl0XG5cdFx0aWYgbWluPyBhbmQgX3ZhbHVlIDwgbWluXG5cdFx0XHRyZXR1cm4gbWluXG5cdFx0aWYgbWF4PyBhbmQgX3ZhbHVlID4gbWF4XG5cdFx0XHRyZXR1cm4gbWF4XG5cblx0XHQjIHNlYXJjaCB0aGUgbmVhcmVzdCBfdmFsdWUgdG8gdGhlIHN0ZXBcblx0XHRpZiBzdGVwIGlzbnQgMVxuXHRcdFx0X3ZhbHVlID0gbmVhcmVzdCggX3ZhbHVlLCBzdGVwIClcblx0XHRcblx0XHQjIGNhbGMgdGhlIHByZWNpc2lvbiBieSBzdGVwXG5cdFx0X3ByZWNpc2lvbiA9IE1hdGgubWF4KCAwLCBNYXRoLmNlaWwoIE1hdGgubG9nKCAxL3N0ZXAgKSAvIE1hdGgubG9nKCAxMCApICkgKVxuXHRcdGlmIF9wcmVjaXNpb24gPiAwXG5cdFx0XHRfdmFsdWUgPSBwcmVjaXNpb24oIF92YWx1ZSwgX3ByZWNpc2lvbiApXG5cdFx0ZWxzZVxuXHRcdFx0X3ZhbHVlID0gTWF0aC5yb3VuZCggX3ZhbHVlIClcblx0XHRcdFxuXHRcdHJldHVybiBfdmFsdWVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0TnVtYmVyQmFzZVxuIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5cbmNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgQXJyYXlPcHRpb25zIGV4dGVuZHMgcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQXJyYXlPcHRpb25cblxuY2xhc3MgRmFjZXRTdWJBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdFxuXHR0ZW1wbGF0ZVJlc0xpOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2FycmF5X3Jlc3VsdGxpLmphZGVcIiApXG5cdFxuXHRvcHREZWZhdWx0OlxuXHRcdGxhYmVsOiBcIi1cIlxuXHRcdHZhbHVlOiBcIi1cIlxuXG5cdHNlbGVjdENvdW50OiAwXG5cblx0b3B0Q29sbDogU3RyaW5nT3B0aW9uc1xuXHRcdFxuXHRpbml0aWFsaXplOiA9PlxuXHRcdEBlZGl0TW9kZSA9IGZhbHNlXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciBpbnB1dCMje0BjaWR9XCIgXSA9IFwiY2xvc2VcIlxuXHRcdHJldHVybiBfZXZudHNcblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0IyBjaGVjayBpZiB0aGUgY2xvc2UgaXMgaW5pdGllZCBmcm9tIHRoZSBlZGl0IG1vZGVcblx0XHRfZGVsU3ViID0gZmFsc2Vcblx0XHRpZiBAZWRpdE1vZGVcblx0XHRcdF9kZWxTdWIgPSB0cnVlXG5cdFx0XHRcblx0XHRAZWRpdE1vZGUgPSBmYWxzZVxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QGZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdFx0aWYgX2RlbFN1YiBhbmQgQHJlc3VsdC5sZW5ndGggPD0gMFxuXHRcdFx0QHN1Yi5kZWwoKVxuXHRcdHJldHVybiBzdXBlclxuXHRcblx0cm1SZXM6ICggZXZudCApPT5cblx0XHRpZiBldm50Py50YXJnZXQ/XG5cdFx0XHRfaWQgPSAkKCBldm50LnRhcmdldCApPy5kYXRhKCBcImlkXCIgKVxuXHRcdGVsc2UgaWYgZXZudD9cblx0XHRcdF9pZCA9IGV2bnRcblx0XHRfbWRsID0gQHJlc3VsdC5nZXQoIF9pZCApXG5cdFx0aWYgX21kbD9cblx0XHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdFx0aWYgX21kbD8uZ2V0KCBcImN1c3RvbVwiIClcblx0XHRcdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBfaWQgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRlZGl0UmVzOiAoIGV2bnQgKT0+XG5cdFx0QGVkaXRNb2RlID0gdHJ1ZVxuXHRcdF9pZCA9ICQoIGV2bnQudGFyZ2V0ICk/LmRhdGEoIFwiaWRcIiApXG5cdFx0X3YgPSBAX2VkaXR2YWwgPSBAcmVzdWx0LmdldCggX2lkICkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFxuXHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggX2lkIClcblx0XHRAc3ViLnJlb3BlbigpXG5cdFx0XG5cdFx0QHNlYXJjaChfdilcblx0XHRyZXR1cm5cblx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IHN1cGVyXG5cdFx0aWYgQF9lZGl0dmFsPy5sZW5ndGhcblx0XHRcdF9kYXRhLmlucHZhbCA9IEBfZWRpdHZhbFxuXHRcdFx0QF9lZGl0dmFsID0gbnVsbFxuXHRcdHJldHVybiBfZGF0YVxuXHRcblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIEB0ZW1wbGF0ZVJlc0xpKCB0eHQ6IG1vZGVsLmdldExhYmVsKCksIGlkOiBtb2RlbC5pZCwgY3VzdG9tOiBtb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSAgKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRpZiBvcHRpb25zLm1vZGVsLmdldCggXCJjb3VudFwiICk/XG5cdFx0XHRAc2VsZWN0Q291bnQgPSBvcHRpb25zLm1vZGVsLmdldCggXCJjb3VudFwiIClcblx0XHRvcHRpb25zLmN1c3RvbSA9IHRydWVcblx0XHRpZiBvcHRpb25zLm1vZGVsLmdldCggXCJjdXN0b21cIiApP1xuXHRcdFx0b3B0aW9ucy5jdXN0b20gPSBCb29sZWFuKCBvcHRpb25zLm1vZGVsLmdldCggXCJjdXN0b21cIiApIClcblx0XHRcdFxuXHRcdEBjb2xsZWN0aW9uID0gQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBvcHRpb25zLm1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0XG5cdFx0aWYgbm90IG9wdGlvbnMuY3VzdG9tIGFuZCBAc2VsZWN0Q291bnQgPD0gMFxuXHRcdFx0QHNlbGVjdENvdW50ID0gQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0XG5cdFx0QHJlc3VsdC5vbiBcInJlbW92ZVwiLCAoIG1kbCwgY29sbCApPT5cblx0XHRcdGlmIGNvbGwubGVuZ3RoXG5cdFx0XHRcdG9wdGlvbnMuc3ViLnJlbmRlclJlc3VsdCgpXG5cdFx0XHRAc2VhcmNoY29sbC5hZGQoIG1kbCApXG5cdFx0XHRAdHJpZ2dlciggXCJyZW1vdmVkXCIsIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XHRcblx0c2VsZWN0OiA9PlxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF92YWxzID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBfdmFscz8gYW5kIG5vdCBfLmlzQXJyYXkoIF92YWxzIClcblx0XHRcdF92YWxzID0gWyBfdmFscyBdXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0Zm9yIF92YWwgaW4gKCBpZiBAc2VsZWN0Q291bnQgPD0gMCB0aGVuIF92YWxzIGVsc2UgX3ZhbHNbLi4uQHNlbGVjdENvdW50XSApXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0XG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdFx0X2lkID0gQHJlc3VsdC5sYXN0KCk/LmlkXG5cdFx0XHRcdEBybVJlcyggX2lkIClcblx0XHRcdFx0c3VwZXJcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdHNlYXJjaENvbnRlbnQgPSBAJGlucC52YWwoKVxuXHRcdGlmIHNlYXJjaENvbnRlbnQ/Lmxlbmd0aFxuXHRcdFx0QHNlbGVjdEFjdGl2ZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRAbG9hZGluZyA9IHRydWVcblx0XHRcdF9jb2xsID0gbmV3IEBvcHRDb2xsKCBbXSApXG5cdFx0XHRcblx0XHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdEAkZWwucGFyZW50KCkuYWRkQ2xhc3MoIFwibG9hZGluZ1wiIClcblx0XHRcdFx0b3B0aW9ucyBAcmVzdWx0LCBAbW9kZWwsICggYU9wdHMgKT0+XG5cdFx0XHRcdFx0Zm9yIF9vcHQsIGlkeCBpbiBhT3B0c1xuXHRcdFx0XHRcdFx0YU9wdHNbaWR4XSA9IF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIF9vcHQsIHsgY3VzdG9tOiBmYWxzZSB9IClcblx0XHRcdFx0XHRfY29sbC5hZGQoIGFPcHRzIClcblx0XHRcdFx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0XHRcdFx0QCRlbC5wYXJlbnQoKS5yZW1vdmVDbGFzcyggXCJsb2FkaW5nXCIgKVxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFxuXHRcdFx0LCAwIClcblx0XHRcdHJldHVybiBfY29sbFxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiBvcHQsIGxhYmVsOiBvcHQgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KG9wdClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKVxuXHRcdHJldHVybiBuZXcgQG9wdENvbGwoIF9vcHRzIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3ViQXJyYXlcbiIsImNsYXNzIEZhY2V0U3Vic051bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvbnVtYmVyLmphZGVcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHN1cGVyXG5cdFx0I2lmIG5vdCBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdF9ldm50c1sgXCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiIF0gPSBcInNlbGVjdFwiXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdGlmIEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0XHRAJGlucE9wID0gQCRlbC5maW5kKCBcInNlbGVjdCMje0BjaWR9b3BcIiApXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIHsgd2lkdGg6IFwiYXV0b1wiIH0gKVxuXHRcdFx0QCRpbnBPcC5vbiggXCJzZWxlY3QyOmNsb3NlXCIsIEBfb3BTZWxlY3RlZCApXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0XHRAJGlucE9wLnJlbW92ZSgpXG5cdFx0XHRAJGlucE9wID0gbnVsbFxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/LnJlbGF0ZWRUYXJnZXQ/XG5cdFx0XHRfcG9zV3JwID0gQGVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBldm50Py5yZWxhdGVkVGFyZ2V0IClcblx0XHRcdGlmIG5vdCAoIF9wb3NXcnAgaXMgMCBvciBfcG9zV3JwIC0gMTYgPj0gMCApXG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuXG5cdFx0aWYgZXZudD8gYW5kICggZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucC5nZXQoMCkgb3IgZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucE9wPy5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdEBtb2RlbC5zZXQoIHsgb3BlcmF0b3I6IEAkaW5wT3AudmFsKCkgfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cblx0X29wU2VsZWN0ZWQ6ID0+XG5cdFx0QHNlbGVjdGVkT1AgPSB0cnVlXG5cdFx0QGZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRpZiBAJGlucE9wPyBhbmQgbm90IEBzZWxlY3RlZE9QXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQuZmlyc3QoKS5nZXQoIFwidmFsdWVcIiApXG5cdFx0X29sZE9wID0gQHJlc3VsdC5maXJzdCgpXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCB7IG9wZXJhdG9yczogQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApLCBvcGVyYXRvcjogQG1vZGVsLmdldCggXCJvcGVyYXRvclwiICl9IClcblxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0aWYgbm90IGlzTmFOKCBfdmFsIClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0XHRcdG9wZXJhdG9yOiBAJGlucE9wLnZhbCgpXG5cdFx0ZWxzZVxuXHRcdFx0X3JldCA9XG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic051bWJlclxuIiwiY2xhc3MgRmFjZXRTdWJzUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3JhbmdlLmphZGVcIiApXG5cblx0X2dldElucFNlbGVjdG9yOiAoIGV4dCA9IFwiX2Zyb21cIiApPT5cblx0XHRyZXR1cm4gXCJpbnB1dCMje0BjaWR9I3tleHR9XCJcblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJzZWxlY3RcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJzZWxlY3RcIlxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCI8bGk+PC9saT5cIlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0cmV0dXJuIFwiPGxpPlwiICtfcmVzLnZhbHVlLmpvaW4oIFwiIC0gXCIgKSArIFwiPC9saT5cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wVG8gPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQuZmlyc3QoKS5nZXQoIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRpZiBldm50PyBhbmQgKCBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wLmdldCgwKSBvciBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wVG8uZ2V0KDApIClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRjbG9zZTogPT5cblx0XHR0cnlcblx0XHRcdEAkKCBcIi5yYW5nZWlucFwiICkucmVtb3ZlKClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0X3JldCA9XG5cdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRyZXR1cm4gX3JldFxuXHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ZGcm9tID0gc3VwZXJcblx0XHRfdiA9IEAkaW5wVG8udmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHRfdlRvID0gcGFyc2VJbnQoIEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YpLCAxMCApXG5cblx0XHRyZXR1cm4gWyBfdkZyb20sIF92VG8gXVxuXHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0aWYgX3ZhbD8ubGVuZ3RoID49IDJcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1JhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic1NlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zZWxlY3QuamFkZVwiIClcblxuXHRmb3JjZWRNb2R1bGVPcHRzOnt9XG5cdCNcdG11bHRpcGxlOiB0cnVlXG5cblx0ZGVmYXVsdE1vZHVsZU9wdHM6XG5cdFx0I21heGltdW1TZWxlY3Rpb25MZW5ndGg6IDFcblx0XHR3aWR0aDogXCJhdXRvXCJcblx0XHRtdWx0aXBsZTogZmFsc2Vcblx0XG5cdGluaXRpYWxpemU6IC0+XG5cdFx0QGNvbnZlcnRWYWx1ZVRvSW50ID0gQF9jaGVja0ludFZhbHVlKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHt9XG5cdFx0X2V2bnRzWyBcImNsaWNrIC5zZWxlY3QtY2hlY2tcIiBdID0gXCJzZWxlY3RcIiBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBfZXZudHNcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwic2VsZWN0IyN7QGNpZH1cIlxuXHRcdFxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0IyBwcmV2ZW50IGZyb20gYXN5bmMgbGlzdGVuaW5nIG9uIG1hbnVhbCBhY2Nlc3Ncblx0XHRAbW9kZWwuc2V0KCBcIndhaXRGb3JBc3luY1wiLCBmYWxzZSApXG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5zaG93KClcblx0XHRAc2VsZWN0Mi5vcGVuKClcblx0XHQjZWxzZVxuXHRcdFx0I0AkaW5wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHQjIHNldCB0aGUgY3VycmVudCB2YWx1ZXNcblx0XHRfb2xkVmFscyA9IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWxzIClcblx0XHRcblx0XHQjIHJlc2V0IHJlc3VsdHMgYW5kIHNlbGVjdDJcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vZmYoKVxuXHRcdEBzZWxlY3QyLmRlc3Ryb3koKVxuXHRcdEByZXN1bHQucmVzZXQoKVxuXHRcdEBzZWxlY3QyID0gbnVsbFxuXHRcdFxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRfY2hlY2tJbnRWYWx1ZTogKCBfb3B0cyA9IFtdICk9PlxuXHRcdGlmIG5vdCBfb3B0cyBvciBub3QgX29wdHMubGVuZ3RoXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRmb3IgX3YgaW4gX29wdHNcblx0XHRcdGlmIF92LnZhbHVlPyBhbmQgXy5pc1N0cmluZyggX3YudmFsdWUgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92LmlkPyBhbmQgXy5pc1N0cmluZyggX3YuaWQgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92PyBhbmQgXy5pc1N0cmluZyggX3YgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXHRcdHJldHVybiB0cnVlXG5cblx0X2luaXRTZWxlY3QyOiA9PlxuXHRcdFxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIG9yIGZhbHNlIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3Qgc2VsZWN0MjpjbG9zZVwiLCBAc2VsZWN0XG5cdFx0XHRcblx0XHRcdCMgYWZ0ZXIgbG9hZGluZyB0cnkgdG8gc2V0IHRoZSBjdXJzb3IgZm9jdXNcblx0XHRcdEBzZWxlY3QyLm9uIFwicmVzdWx0czphbGxcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0XHRAY29udmVydFZhbHVlVG9JbnQgPSBAX2NoZWNrSW50VmFsdWUoIHJlc3VsdHM/LmRhdGE/LnJlc3VsdHMgKVxuXHRcdFx0XHRAc2VsZWN0Mi5zZWxlY3Rpb24/LiRzZWFyY2g/LmZvY3VzPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XHQjIGxpc3RlbiB0byBhc3luYyByZXN1bHQgY2hhbmdlcyBhbmQgc2V0IHRoZSBzZWxlY3Rpb25cblx0XHRcdEBzZWxlY3QyLmRhdGFBZGFwdGVyLmN1cnJlbnQgKCByZXN1bHRzICk9PlxuXHRcdFx0XHRpZiBAbW9kZWwuZ2V0KCBcIndhaXRGb3JBc3luY1wiIClcblx0XHRcdFx0XHRfZGF0YSA9IFtdXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yIHJlc3VsdCBpbiByZXN1bHRzXG5cdFx0XHRcdFx0XHRfZGF0YS5wdXNoIEBfY29udmVydFZhbHVlKCByZXN1bHQgKVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0IyBzZWxlY3QgdGhlIGFjdGl2ZS9wcmVkZWZpbmVkIHJlc3VsdHNcblx0XHRcdFx0XHRAX3NlbGVjdCggX2RhdGEgKVxuXHRcdFx0XHRcdEBjbG9zZSgpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcblx0XHRcdEBzZWxlY3QyLiRjb250YWluZXIub24gXCJjbGlja1wiLCBAX3NlbDJvcGVuXG5cdFx0XHRAc2VsZWN0Mi4kZWxlbWVudC5oaWRlKClcblx0XHRcdCQoIGRvY3VtZW50ICkub24gQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuIEBzZWxlY3QyXG5cblx0X3NlbDJvcGVuOiAoIGV2bnQgKS0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0cmVtb3ZlOiA9PlxuXHRcdCNAJGlucC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdF9kYXRhID0gXy5leHRlbmQoIHt9LCBzdXBlciwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICksIG9wdGlvbnM6IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggQG1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApIH0gKVxuXHRcdGlmIF9kYXRhLnZhbHVlPyBhbmQgXy5pc0FycmF5KCBfZGF0YS52YWx1ZSApXG5cdFx0XHRmb3IgX3YsIF9pZHggaW4gX2RhdGEudmFsdWVcblx0XHRcdFx0X2RhdGEudmFsdWVbIF9pZHggXSA9IGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIF92ICkgZWxzZSBfdi50b1N0cmluZygpXG5cdFx0ZWxzZSBpZiBfZGF0YS52YWx1ZT9cblx0XHRcdF9kYXRhLnZhbHVlID0gWyBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfZGF0YS52YWx1ZSApIGVsc2UgX2RhdGEudmFsdWUudG9TdHJpbmcoKSBdXG5cdFx0XG5cdFx0aWYgX2RhdGEudmFsdWU/XG5cdFx0XHRfdmxpc3QgPSBfLnBsdWNrKCBfZGF0YS5vcHRpb25zLCBcInZhbHVlXCIgKVxuXHRcdFx0Zm9yIF92IGluIF9kYXRhLnZhbHVlIHdoZW4gX3Ygbm90IGluIF92bGlzdFxuXHRcdFx0XHRfZGF0YS5vcHRpb25zLnB1c2ggeyB2YWx1ZTogKCBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfdiApIGVsc2UgX3YudG9TdHJpbmcoKSApLCBsYWJlbDogX3YsIGdyb3VwOiB1bmRlZmluZWQgfVxuXHRcdFxuXHRcdF9ncm91cHMgPSBfLmdyb3VwQnkoIF9kYXRhLm9wdGlvbnMsIFwiZ3JvdXBcIiApXG5cdFx0aWYgXy5jb21wYWN0KCBfLmtleXMoIF9ncm91cHMgb3Ige30gKSApLmxlbmd0aCA+IDFcblx0XHRcdF9kYXRhLm9wdGlvbkdyb3VwcyA9IF9ncm91cHNcblx0XHRyZXR1cm4gX2RhdGFcblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogKCBjcmVhdGUgKT0+XG5cdFx0aWYgY3JlYXRlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gQG1vZGVsLmdldChcIm11bHRpcGxlXCIpXG5cdFxuXHRfaGFzVGFiRXZlbnQ6IC0+XG5cdFx0cmV0dXJuIFwia2V5dXBcIlxuXHRcdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdmFscyA9IFtdXG5cdFx0Zm9yIGRhdGEgaW4gQF9pbml0U2VsZWN0MigpPy5kYXRhKCkgb3IgW11cblx0XHRcdFxuXHRcdFx0X3ZhbHMucHVzaCggQF9jb252ZXJ0VmFsdWUoIGRhdGEgKSApXG5cdFx0cmV0dXJuIF92YWxzXG5cdFxuXHRfY29udmVydFZhbHVlOiAoIGRhdGEgKT0+XG5cdFx0X2RhdGEgPSB7fVxuXHRcdGlmIEBjb252ZXJ0VmFsdWVUb0ludFxuXHRcdFx0X2RhdGEudmFsdWUgPSBwYXJzZUZsb2F0KCBkYXRhLmlkIClcblx0XHRlbHNlXG5cdFx0XHRfZGF0YS52YWx1ZSA9IGRhdGEuaWRcblx0XHRpZiBkYXRhLnRleHQ/XG5cdFx0XHRpZiBkYXRhLnRleHQgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdFx0X2RhdGEubGFiZWwgPSBkYXRhLnRleHQuaHRtbCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0XG5cdFx0XHRcblx0XHRyZXR1cm4gX2RhdGFcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiAoIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIG9wdCApIGVsc2Ugb3B0LnRvU3RyaW5nKCkgKSwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCBvcHQgKVxuXHRcdFx0XHRvcHQudmFsdWUgPSBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBvcHQudmFsdWUgKSBlbHNlIG9wdC52YWx1ZS50b1N0cmluZygpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gX29wdHNcblxuXHR1bnNlbGVjdDogKCBldm50ICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdGlmIEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgQHNlbGVjdDI/XG5cdFx0XHQjQHNlbGVjdDI/LmRlc3Ryb3koKVxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5oaWRlKClcblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRAJCggXCIuc2VsZWN0LWNoZWNrXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpIGlmIGV2bnQ/LnN0b3BQcm9wYWdhdGlvblxuXHRcdF92YWxzID0gQGdldFZhbHVlKClcblx0XHRpZiBub3QgX3ZhbHM/Lmxlbmd0aFxuXHRcdFx0IyBJc3N1ZSM0OSBpZiBub3RoaW5nIHdhcyBzZWxlY3RlZCBjbG9zZSB0aGUgc2VsZWN0LXZpZXcgYW5kIHJlbW92ZSB0aGUgd2hvbGUgZmFjZXRcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRpZiBub3QgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRcdEBzdWIuZGVsKClcblx0XHRcdHJldHVyblxuXHRcdEBfc2VsZWN0KCBfdmFscyApXG5cblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcblx0X3NlbGVjdDogKCBfdmFscyApPT5cblx0XHRAbW9kZWwuc2V0KCBcIndhaXRGb3JBc3luY1wiLCBmYWxzZSApXG5cdFx0TW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0Zm9yIF92YWwgaW4gX3ZhbHNcblx0XHRcdEByZXN1bHQuYWRkKCBuZXcgTW9kZWxDb25zdCggX3ZhbCApIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAcmVzdWx0IClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNTZWxlY3RcbiIsImNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3N0cmluZy5qYWRlXCIgKVxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRzdXBlclxuXHRcdHRyeVxuXHRcdFx0QCRpbnA/LnJlbW92ZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQ/LmZpcnN0KCk/LmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZ1xuIiwiU3ViVmlldyA9IHJlcXVpcmUoIFwiLi9zdWJcIiApXG5TZWxlY3RvclZpZXcgPSByZXF1aXJlKCBcIi4vc2VsZWN0b3JcIiApXG5cbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgTWFpblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3dyYXBwZXIuamFkZVwiIClcblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAuc2VhcmNoLWJ0blwiOiBcIl9vblNlYXJjaFwiXG5cdFx0XCJmb2N1cyAuc2VhcmNoLWJ0blwiOiBcIl9vbkZvY3VzU2VhcmNoXCJcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0XG5cdFx0QG1haW4gPSBvcHRpb25zLm1haW5cblx0XHRAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXHRcdEBzZWFyY2hCdXR0b24gPSBvcHRpb25zLnNlYXJjaEJ1dHRvblxuXG5cdFx0QGNvbGxlY3Rpb24ub24gXCJpZ2d5OnJlbVwiLCBAcmVtRmFjZXRcblx0XHRcblx0XHRfY2wgPSBcImlnZ3kgY2xlYXJmaXhcIlxuXHRcdGlmIEBlbC5jbGFzc05hbWU/Lmxlbmd0aFxuXHRcdFx0X2NsID0gXCIgXCIgKyBfY2xcblx0XHRAZWwuY2xhc3NOYW1lICs9IF9jbFxuXHRcdEByZW5kZXIoKVxuXHRcdCQoIGRvY3VtZW50ICkub24gXCJrZXl1cFwiLCBAX29uS2V5XG5cdFx0QF9vdXRlckNsaWNrTGlzdGVuKClcblx0XHRcblx0XHRfdmFsdWVGYWNldHMgPSBAY29sbGVjdGlvbi5maWx0ZXIoICggZmN0ICktPnJldHVybiBmY3Q/LmdldCggXCJ2YWx1ZVwiICk/IG9yIGZjdD8uZ2V0KCBcInBpbm5lZFwiICkgKVxuXHRcdFxuXHRcdF9mblNvcnQgPSAoIGtleSApLT5cblx0XHRcdHJldHVybiAoIHYxLCB2MiApLT5cblx0XHRcdFx0aWYgdjFbIGtleSBdID4gdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIDFcblx0XHRcdFx0aWYgdjFbIGtleSBdIDwgdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHRcdHJldHVybiAwXG5cdFx0XG5cdFx0Zm9yIGZjdCBpbiBfdmFsdWVGYWNldHMuc29ydCggX2ZuU29ydCggXCJfaWR4XCIgKSApXG5cdFx0XHRAZ2VuU3ViKCBmY3QsIGZhbHNlIClcblx0XHRcblx0XHRAY29sbGVjdGlvbi5vbiBcImFkZFwiLCA9PlxuXHRcdFx0QCRhZGRCdG4uc2hvdygpXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRyZXR1cm5cblx0XG5cdHRlbXBsYXRlRGF0YTogPT5cblx0XHRfcmV0ID1cblx0XHRcdHNlYXJjaEJ1dHRvbjpcblx0XHRcdFx0dGVtcGxhdGU6IEBzZWFyY2hCdXR0b24udGVtcGxhdGUgb3IgXCJcIlxuXHRcdFx0XHRldmVudDogQHNlYXJjaEJ1dHRvbi5ldmVudCBvciBcInNlYXJjaFwiXG5cdFx0XHRcdHB1bGxyaWdodDogQHNlYXJjaEJ1dHRvbi5wdWxscmlnaHQgb3IgZmFsc2Vcblx0XHRcdFx0Y3NzY2xhc3M6IEBzZWFyY2hCdXR0b24uY3NzY2xhc3Ncblx0XHRcblx0XHRyZXR1cm4gX3JldFxuXHRcblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCBAdGVtcGxhdGVEYXRhKCkgKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRpZiBAc2VhcmNoQnV0dG9uLnRlbXBsYXRlPy5sZW5ndGhcblx0XHRcdEAkc2VhcmNoQnRuID0gQCQoIFwiLnNlYXJjaC1idG5cIiApXG5cdFx0cmV0dXJuXG5cblx0X2FkZEZhY2V0OiAoIGV2bnQgKT0+XG5cdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRVNDIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdEBleGl0KClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0ZXhpdDogKCBuZXh0QWRkID0gdHJ1ZSApPT5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBuZXh0QWRkXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVtRmFjZXQ6ICggZmFjZXRNICk9PlxuXHRcdEByZXN1bHRzLnJlbW92ZSggZmFjZXRNLmdldCggXCJuYW1lXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0c2V0RmFjZXQ6ICggZmFjZXRNLCBkYXRhICk9PlxuXHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdEByZXN1bHRzLmFkZCggXy5leHRlbmQoIGRhdGEsIHsgbmFtZTogZmFjZXRNLmdldCggXCJuYW1lXCIgKSwgdHlwZTogZmFjZXRNLmdldCggXCJ0eXBlXCIgKSB9ICksIHsgbWVyZ2U6IHRydWUsIHBhcnNlOiB0cnVlLCBfZmFjZXQ6IGZhY2V0TSB9IClcblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRAJGFkZEJ0bi5oaWRlKClcblx0XHRyZXR1cm5cblxuXHRnZW5TdWI6ICggZmFjZXRNLCBhZGRBZnRlciA9IHRydWUgKT0+XG5cdFx0c3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgcGFyZW50OiBAIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdGlmIHN1YnZpZXc/Lm1vZGVsPy5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNzdWJ2aWV3Lm9mZigpXG5cdFx0XHRzdWJ2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0QGFkZEZhY2V0KCkgaWYgYWRkQWZ0ZXJcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJyZW9wZW5cIiwgPT5cblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdHN1YnZpZXcub24oIFwic2VsZWN0ZWRcIiwgQHNldEZhY2V0IClcblx0XHRcblx0XHRAJGFkZEJ0bi5iZWZvcmUoIHN1YnZpZXcucmVuZGVyKCkgKVxuXHRcdHJldHVybiBzdWJ2aWV3XG5cblx0YWRkRmFjZXQ6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU0VMRUNUIEVYSVNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU1VCIEVYSVNUXCJcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIEVNUFRZIENPTExcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBTZWxlY3RvclZpZXcoIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBjdXN0b206IGZhbHNlLCBtYWluOiBAIClcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwib3BlbmVkXCIsID0+XG5cdFx0XHRAX29uT3BlbmVkKClcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0QF9vbkNsb3NlZCgpXG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpXG5cdFx0XHRAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdGlmIG5vdCByZXN1bHRzPy5sZW5ndGggYW5kIEBzdWJ2aWV3P1xuXHRcdFx0XHQjQHN1YnZpZXcub2ZmKClcblx0XHRcdFx0QHN1YnZpZXcucmVtb3ZlKClcblx0XHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0gKT0+XG5cdFx0XHRmYWNldE0uc2V0KCBcInZhbHVlXCIsIG51bGwgKVxuXHRcdFx0QHN1YnZpZXcgPSBAZ2VuU3ViKCBmYWNldE0gKVxuXHRcdFx0QHN1YnZpZXcub3BlbigpXG5cdFx0XHRyZXR1cm5cblx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXHRcdHJldHVyblxuXHRcblx0X29uT3BlbmVkOiA9PlxuXHRcdEAkYWRkQnRuPy5oaWRlKClcblx0XHRyZXR1cm5cblx0XG5cdF9vbkNsb3NlZDogPT5cblx0XHRAJGFkZEJ0bj8uc2hvdygpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb3V0ZXJDbGlja0xpc3RlbjogPT5cblx0XHRqUXVlcnkoIGRvY3VtZW50ICkub24gXCJjbGlja1wiLCBAX291dGVyQ2xpY2tcblx0XHRyZXR1cm5cblx0XG5cdGZvY3VzU2VhcmNoOiA9PlxuXHRcdGlmIEAkc2VhcmNoQnRuP1xuXHRcdFx0QCRzZWFyY2hCdG4uZm9jdXMoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfb25TZWFyY2g6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QGV4aXQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlYXJjaGJ1dHRvblwiLCBAc2VhcmNoQnV0dG9uLmV2ZW50IClcblx0XHRyZXR1cm5cblx0XG5cdF9vbkZvY3VzU2VhcmNoOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEBzZWxlY3R2aWV3Py5jbG9zZT8oKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfb3V0ZXJDbGljazogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRfcG9zV3JwID0gQGVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBldm50LnRhcmdldCApXG5cdFx0aWYgbm90ICggX3Bvc1dycCBpcyAwIG9yIF9wb3NXcnAgLSAxNiA+PSAwIClcblx0XHRcdEBleGl0KCBmYWxzZSApXG5cdFx0cmV0dXJuXG5cdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5WaWV3XG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFNlbGVjdG9yVmlldyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldHMvYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3IuamFkZVwiIClcblx0dGVtcGxhdGVFbDogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3RvcmxpLmphZGVcIiApXG5cdHNlbGVjdENvdW50OiAxXG5cblx0Y2xhc3NOYW1lOiA9PlxuXHRcdGNscyA9IFsgXCJhZGQtZmFjZXRcIiBdXG5cdFx0aWYgQGN1c3RvbVxuXHRcdFx0Y2xzLnB1c2ggXCJjdXN0b21cIlxuXHRcdHJldHVybiBjbHMuam9pbiggXCIgXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRcIm1vdXNlZG93biBhXCI6IFwiX29uQ2xpY2tcIlxuXHRcdFwiZm9jdXMgaW5wdXQjI3tAY2lkfVwiOiBcIm9wZW5cIlxuXHRcdCNcImJsdXIgaW5wdXQjI3tAY2lkfVwiOiBcImNsb3NlXCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBjdXN0b20gPSBvcHRpb25zLmN1c3RvbSBvciBmYWxzZVxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QGN1cnJRdWVyeSA9IFwiXCJcblx0XHRcblx0XHRpZiBvcHRpb25zLm1haW4/XG5cdFx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdFxuXHRcdHN1cGVyKCBvcHRpb25zIClcblx0XHRyZXR1cm5cblx0XHRcblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdHN1cGVyXG5cdFx0QHNlYXJjaGNvbGwgPSBAY29sbGVjdGlvbi5zdWIoIC0+dHJ1ZSApXG5cdFx0QHJlc3VsdCA9IG5ldyBAY29sbGVjdGlvbi5jb25zdHJ1Y3RvcigpXG5cdFx0XG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJhZGRcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQGNoZWNrT3B0aW9uc0VtcHR5IClcblx0XHRcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgY3VzdG9tOiBAY3VzdG9tIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGxpc3QgPSBAJGVsLmZpbmQoIFwiIyN7QGNpZH10eXBlbGlzdFwiIClcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm4gQGVsXG5cblx0cmVuZGVyUmVzOiA9PlxuXHRcdEAkbGlzdC5lbXB0eSgpXG5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHNlYXJjaGNvbGwubW9kZWxzXG5cdFx0XHRfbGJsID0gbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0X3RtcGwgPSBtb2RlbC5nZXQoIFwibGFiZWx0ZW1wbGF0ZVwiIClcblx0XHRcdGlmIF90bXBsP1xuXHRcdFx0XHRfbGJsID0gX3RtcGwucmVwbGFjZSggXCJ7e2xhYmVsfX1cIiwgX2xibCApXG5cdFx0XHRcdFxuXHRcdFx0X2lkID0gbW9kZWwuaWRcblx0XHRcdF9jc3NjbGFzcyA9IG1vZGVsLmdldCggXCJjc3NjbGFzc1wiIClcblx0XHRcdGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCA+IDFcblx0XHRcdFx0X2xibCA9IF9sYmwucmVwbGFjZSggbmV3IFJlZ0V4cCggQGN1cnJRdWVyeSwgXCJnaVwiICksICgoIHN0ciApLT5yZXR1cm4gXCI8Yj4je3N0cn08L2I+XCIgKSApXG5cdFx0XHRfbGlzdC5wdXNoIGxhYmVsOiBfbGJsLCBpZDogX2lkLCBjc3NjbGFzczogX2Nzc2NsYXNzXG5cdFx0I2lmIF9saXN0Lmxlbmd0aFxuXHRcdEAkbGlzdC5hcHBlbmQoIEB0ZW1wbGF0ZUVsKFxuXHRcdFx0bGlzdDogX2xpc3QsXG5cdFx0XHRxdWVyeTogQGN1cnJRdWVyeSxcblx0XHRcdGFjdGl2ZUlkeDogQGFjdGl2ZUlkeCxcblx0XHRcdGN1c3RvbTogQGN1c3RvbVxuXHRcdCkgKVxuXG5cdFx0QF9jaGVja1Njcm9sbCgpXG5cdFx0XG5cdFx0cmV0dXJuIEAkbGlzdFxuXG5cdF9zY3JvbGxUaWxsOiAxOThcblx0X2NoZWNrU2Nyb2xsOiA9PlxuXHRcdF9oZWlnaHQgPSBAJGxpc3QuaGVpZ2h0KClcblx0XHRpZiBfaGVpZ2h0ID4gMFxuXHRcdFx0QHNjcm9sbEhlbHBlciggX2hlaWdodCApXG5cdFx0XHRyZXR1cm5cblxuXHRcdCMgZXhpdCB0aGUgdGhlIGNhbGwgc3RhY2sgdG8gY2hlY2sgaGVpZ2h0IGFmdGVyIHRoZSBtb2R1bGUgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGRvbVxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBAJGxpc3QuaGVpZ2h0KCkgKVxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cblx0c2Nyb2xsSGVscGVyOiAoIGhlaWdodCApPT5cblx0XHRpZiBoZWlnaHQgPj0gQF9zY3JvbGxUaWxsXG5cdFx0XHRAc2Nyb2xsaW5nID0gdHJ1ZVxuXHRcdGVsc2Vcblx0XHRcdEBzY3JvbGxpbmcgPSBmYWxzZVxuXHRcdHJldHVyblxuXG5cdGNoZWNrT3B0aW9uc0VtcHR5OiA9PlxuXHRcdCNpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gMFxuXHRcdCNcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0X29uQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRfaWQgPSBAJCggZXZudC5jdXJyZW50VGFyZ2V0ICkuZGF0YSggXCJpZFwiIClcblx0XHRpZiBub3QgX2lkP1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfaWQgKVxuXHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRAc2VsZWN0ZWQoIF9tZGwgKVxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0X2lzRnVsbDogPT5cblx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRpZiBAbWFpbj9cblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QG1haW4uZm9jdXNTZWFyY2goKVxuXHRcdGVsc2Vcblx0XHRcdHN1cGVyKCBldmVudCApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdGVkOiAoIG1kbCApPT5cblx0XHR0cnlcblx0XHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdFx0bWRsPy5leGVjPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdGNhdGNoIF9lcnJcblx0XHRcdHRyeVxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBhY3RpdmVJZHg6I3tAYWN0aXZlSWR4fSAtIGNvbGxlY3Rpb246I3tKU09OLnN0cmluZ2lmeSggQGNvbGxlY3Rpb24udG9KU09OKCkpfVwiXG5cdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIXCJcblx0XHRcblx0XHRpZiBtZGw/XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIG1kbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogPT5cblx0XHRAJGlucC5mb2N1cygpXG5cdFx0X2VsID0gQCRpbnAuZ2V0KDApXG5cdFx0XG5cdFx0X2VsLnNlbGVjdGlvblN0YXJ0ID0gX2VsLnNlbGVjdGlvbkVuZCA9IF9lbC52YWx1ZS5sZW5ndGhcblx0XHRyZXR1cm5cblx0XG5cdG9wZW46ID0+XG5cdFx0I2NvbnNvbGUubG9nIFwic2VsZWN0b3Igb3BlblwiXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3RBY3RpdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgXy5pc1N0cmluZyggZXZudCApXG5cdFx0XHRfcSA9IGV2bnRcblx0XHRlbHNlXG5cdFx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKT0+XG5cdFx0XHRpZiBAcmVzdWx0LmdldCggbWRsLmlkICk/XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgbm90IF9xPy5sZW5ndGhcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdF9tYXRjaCA9IG1kbC5tYXRjaCggX3EgKVxuXHRcdFx0cmV0dXJuIF9tYXRjaFxuXHRcdCwgZmFsc2UgKVxuXG5cblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblx0XG5cdFx0X2N1c3RvbUVsZW1lbnRDaGFuZ2UgPSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGggdGhlbiAwIGVsc2UgMVxuXHRcdF90b3AgPSAwXG5cdFx0aWYgdXBcblx0XHRcdGlmICggQGFjdGl2ZUlkeCAtIDEgKSA8IF90b3Bcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCAtIDFcblx0XHRlbHNlXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggLSBfY3VzdG9tRWxlbWVudENoYW5nZSA8PSBAYWN0aXZlSWR4XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggKyAxXG5cblx0XHRcblx0XHRAJCggX2xpc3RbIEBhY3RpdmVJZHggXSApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiIClcblx0XHRfJGVsbmV3ID0gQCQoIF9saXN0WyBfbmV3aWR4IF0gKS5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG5cblx0XHRpZiBAc2Nyb2xsaW5nXG5cdFx0XHRfZWxIID0gXyRlbG5ldy5vdXRlckhlaWdodCgpXG5cdFx0XHRfcG9zID0gX2VsSCAqICggX25ld2lkeCArIDEgKVxuXHRcdFx0XyRsaXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdFwiIClcblx0XHRcdF9zY3JvbGxUID0gXyRsaXN0LnNjcm9sbFRvcCgpXG5cdFx0XHRpZiBfcG9zID4gX3Njcm9sbFQgKyBAX3Njcm9sbFRpbGxcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIEBfc2Nyb2xsVGlsbCApXG5cdFx0XHRlbHNlIGlmIF9wb3MgPCBfc2Nyb2xsVCArIF9lbEhcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIF9lbEggKVxuXG5cdFx0QGFjdGl2ZUlkeCA9IF9uZXdpZHhcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6PT5cblx0XHRyZXR1cm5cblxuXHRzZWxlY3RBY3RpdmU6ICggaXNFbnRlckV2ZW50PWZhbHNlICk9PlxuXHRcdFxuXHRcdF9zZWwgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGEuYWN0aXZlXCIgKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApLmRhdGEoKVxuXHRcdFx0XG5cdFx0X3NlYXJjaCA9IEAkaW5wLnZhbCgpXG5cdFx0XG5cdFx0aWYgIG5vdCBfc2VsPyBhbmQgQHNlbGVjdENvdW50IGlzbnQgMSBhbmQgaXNFbnRlckV2ZW50IGFuZCBub3QgX3NlYXJjaD8ubGVuZ3RoXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRpZiBub3QgX3NlbD9cblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0aWYgX3NlbD8uaWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBAY29sbGVjdGlvbi5nZXQoIF9zZWwuaWQgKSApXG5cdFx0ZWxzZSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlICkgKVxuXHRcdFx0QCRpbnAudmFsKCBcIlwiIClcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclZpZXdcbiIsImNsYXNzIFZpZXdTdWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3N1Yi5qYWRlXCIgKVxuXHRjbGFzc05hbWU6ID0+XG5cdFx0X3N0ZCA9IFwic3ViXCJcblx0XHRfdHlwZSA9IEBtb2RlbC5nZXQoIFwidHlwZVwiIClcblx0XHRpZiBfdHlwZT9cblx0XHRcdF9zdGQgKz0gXCIgc3ViLXR5cGUtXCIgKyBfdHlwZVxuXHRcdFxuXHRcdF9uYW1lID0gQG1vZGVsLmdldCggXCJuYW1lXCIgKVxuXHRcdGlmIF9uYW1lP1xuXHRcdFx0X3N0ZCArPSBcIiBzdWItbmFtZS1cIiArIF9uYW1lXG5cdFx0cmV0dXJuIF9zdGRcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdEByZXN1bHQgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpXG5cdFx0QCRlbC5vbiBcImNsaWNrXCIsIEByZW9wZW5cblx0XHRAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblx0XHRyZXR1cm5cblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblxuXHRyZW5kZXI6ICggb3B0TWRsICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0dHJ5XG5cdFx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0Y2F0Y2ggX2VyclxuXHRcdFx0XHR0cnlcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBtb2RlbDoje0pTT04uc3RyaW5naWZ5KEBtb2RlbC50b0pTT04oKSl9IC0gcmVzdWx0OiN7SlNPTi5zdHJpbmdpZnkoIEByZXN1bHQudG9KU09OKCkpfVwiXG5cdFx0XHRcdGNhdGNoIF9lcnJlcnJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSFwiXG5cdFx0XG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZVxuXHRcdFx0bGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRzZWxlY3RlZDogX2xpc3Rcblx0XHRcdHR5cGU6IEBtb2RlbC5nZXQoIFwidHlwZVwiIClcblx0XHRcdG5hbWU6IEBtb2RlbC5nZXQoIFwibmFtZVwiIClcblx0XHRcdHBpbm5lZDogQG1vZGVsLmdldCggXCJwaW5uZWRcIiApIG9yIGZhbHNlXG5cdFx0XHRcdFxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cdFx0cmV0dXJuIEBlbFxuXHRcblx0cmVvcGVuOiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8gYW5kICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLnJtLXJlc3VsdC1idG5cIiApIGFuZCBAc2VsZWN0dmlldz8ucm1SZXM/XG5cdFx0XHRAc2VsZWN0dmlldy5ybVJlcyggZXZudCApXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgZXZudD8gYW5kICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLmVkaXQtcmVzdWx0LWJ0blwiICkgYW5kIEBzZWxlY3R2aWV3Py5lZGl0UmVzP1xuXHRcdFx0QHNlbGVjdHZpZXcuZWRpdFJlcyggZXZudCApXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IEBfaXNPcGVuIGFuZCBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3LnJlb3BlbiggQCApXG5cdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHRyaWdnZXIoIFwicmVvcGVuXCIgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRkZWw6ICggZXZudCApPT5cblx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAc2VsZWN0dmlldz8ucmVtb3ZlKClcblx0XHRAcGFyZW50ID0gbnVsbFxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsLCB7IG1lcmdlOiB0cnVlIH0gKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRyZXR1cm5cblx0XG5cdHJlbW92ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBvcHRNZGwgKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRcblx0XHQjIHJlbW92ZSBmYWNldCBpZiBjb250ZW50IGxlbmd0aCBvciB0aGUgZmFjZXQgaXMgaW4gZWRpdE1vZGVcblx0XHRpZiBAcmVzdWx0Lmxlbmd0aCA8PSAwIGFuZCBub3QgQHNlbGVjdHZpZXcuZWRpdE1vZGVcblx0XHRcdEBkZWwoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRAJHJlc3VsdHMuaHRtbCggQHNlbGVjdHZpZXcucmVuZGVyUmVzdWx0KCkgKVxuXHRcdHJldHVyblxuXG5cdGlzT3BlbjogPT5cblx0XHRyZXR1cm4gQHNlbGVjdHZpZXc/XG5cblx0Zm9jdXM6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QG9wZW4oKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGdlbmVyYXRlU3ViOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRyZXR1cm4gQHNlbGVjdHZpZXdcblx0XHRcdFxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IEBtb2RlbC5TdWJWaWV3KCBzdWI6IEAsIG1vZGVsOiBAbW9kZWwsIGVsOiBAJHN1YiApXG5cdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRcblx0XHRAJGVsLmFwcGVuZCggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdGlmIEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKT9cblx0XHRcdEBzZWxlY3R2aWV3LnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGF0dGFjaFN1YkV2ZW50czogPT5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRcdGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdCNAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdCNAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCByZXN1bHQgKVxuXHRcdFx0QHJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBtZGwgKT0+XG5cdFx0XHRpZiBtZGxcblx0XHRcdFx0QHNlbGVjdGVkKCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0QHNlbGVjdHZpZXcub24gXCJyZW1vdmVkXCIsICggbWRsICk9PlxuXHRcdFx0aWYgbWRsXG5cdFx0XHRcdEByZW1vdmVkKCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QGdlbmVyYXRlU3ViKClcblxuXHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0QF9pc09wZW4gPSB0cnVlXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1N1YlxuIiwiIiwiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuamFkZSA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgamFkZV9lbmNvZGVfaHRtbF9ydWxlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnXG59O1xudmFyIGphZGVfbWF0Y2hfaHRtbCA9IC9bJjw+XCJdL2c7XG5cbmZ1bmN0aW9uIGphZGVfZW5jb2RlX2NoYXIoYykge1xuICByZXR1cm4gamFkZV9lbmNvZGVfaHRtbF9ydWxlc1tjXSB8fCBjO1xufVxuXG5leHBvcnRzLmVzY2FwZSA9IGphZGVfZXNjYXBlO1xuZnVuY3Rpb24gamFkZV9lc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbCkucmVwbGFjZShqYWRlX21hdGNoX2h0bWwsIGphZGVfZW5jb2RlX2NoYXIpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbmV4cG9ydHMuRGVidWdJdGVtID0gZnVuY3Rpb24gRGVidWdJdGVtKGxpbmVubywgZmlsZW5hbWUpIHtcbiAgdGhpcy5saW5lbm8gPSBsaW5lbm87XG4gIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbn1cblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9nZXRLZXksIGlzQXJyYXksIHRvU3RyaW5nO1xuXG4gIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbiAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24oYXJyKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICBfZ2V0S2V5ID0gZnVuY3Rpb24oZWwsIGtleSkge1xuICAgIHJldHVybiBlbFtrZXldO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5cywgZm9yd2FyZCwgZ2V0S2V5KSB7XG4gICAgdmFyIGZuc29ydCwgcmVmO1xuICAgIGlmIChmb3J3YXJkID09IG51bGwpIHtcbiAgICAgIGZvcndhcmQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoZ2V0S2V5ID09IG51bGwpIHtcbiAgICAgIGdldEtleSA9IF9nZXRLZXk7XG4gICAgfVxuICAgIGlmICghaXNBcnJheShrZXlzKSkge1xuICAgICAga2V5cyA9IFtrZXlzXTtcbiAgICB9XG4gICAgZm5zb3J0ID0gZnVuY3Rpb24oZm9yd2FyZCwga2V5LCBuZXh0a2V5cykge1xuICAgICAgdmFyIF9md3JkLCBfaywgbmV4dFNvcnQsIHJlZjtcbiAgICAgIGlmIChuZXh0a2V5cyAhPSBudWxsID8gbmV4dGtleXMubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgIF9rID0gKHJlZiA9IG5leHRrZXlzLnNwbGljZSgwLCAxKSkgIT0gbnVsbCA/IHJlZlswXSA6IHZvaWQgMDtcbiAgICAgICAgaWYgKF9rICE9IG51bGwpIHtcbiAgICAgICAgICBuZXh0U29ydCA9IGZuc29ydChmb3J3YXJkLCBfaywgbmV4dGtleXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBfZndyZCA9IChmb3J3YXJkW2tleV0gIT0gbnVsbCA/IGZvcndhcmRba2V5XSA6IChmb3J3YXJkW1wiP1wiXSAhPSBudWxsID8gZm9yd2FyZFtcIj9cIl0gOiBmb3J3YXJkKSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWxBLCBlbEIpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgX2EgPSBnZXRLZXkoZWxBLCBrZXkpO1xuICAgICAgICBfYiA9IGdldEtleShlbEIsIGtleSk7XG4gICAgICAgIGlmIChfYSA8IF9iKSB7XG4gICAgICAgICAgaWYgKF9md3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfYSA+IF9iKSB7XG4gICAgICAgICAgaWYgKF9md3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfYSA9PT0gX2IpIHtcbiAgICAgICAgICBpZiAobmV4dFNvcnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRTb3J0KGVsQSwgZWxCKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIGZuc29ydChmb3J3YXJkLCAocmVmID0ga2V5cy5zcGxpY2UoMCwgMSkpICE9IG51bGwgPyByZWZbMF0gOiB2b2lkIDAsIGtleXMpO1xuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
