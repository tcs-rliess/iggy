(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctDateRange, FctEvent, FctNumber, FctRange, FctSelect, FctString, IGGY, IGGY_IDX, MainView, Results,
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

IGGY_IDX = 1;

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
    this._filterEmpty = bind(this._filterEmpty, this);
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
      searchButton: options.searchButton,
      idx: IGGY_IDX++
    });
    this.view.on("searchbutton", this.triggerEvent);
    this.nonEmptyResults = this.results.sub(this._filterEmpty);
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

  IGGY.prototype._filterEmpty = function(model) {
    var _v;
    _v = model.get("value");
    if (_v == null) {
      return false;
    }
    if (_v.length <= 0) {
      return false;
    }
    return true;
  };

  IGGY.prototype.getQuery = function() {
    return this.nonEmptyResults;
  };

  IGGY.prototype.triggerChange = function() {
    setTimeout((function(_this) {
      return function() {
        return _this.trigger("change", _this.nonEmptyResults);
      };
    })(this), 0);
  };

  IGGY.prototype.triggerEvent = function(eventName) {
    setTimeout((function(_this) {
      return function() {
        return _this.trigger(eventName, _this.nonEmptyResults);
      };
    })(this), 0);
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

})(require("./backbone_sub"));

module.exports = IggyResults;


},{"./backbone_sub":2}],13:[function(require,module,exports){
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
buf.push("</ul><div class=\"subselect closed\"></div><div class=\"loader\"><i class=\"fa fa-cog fa-spin\"></i></div>");}.call(this,"label" in locals_for_with?locals_for_with.label:typeof label!=="undefined"?label:undefined,"pinned" in locals_for_with?locals_for_with.pinned:typeof pinned!=="undefined"?pinned:undefined,"selected" in locals_for_with?locals_for_with.selected:typeof selected!=="undefined"?selected:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":38}],24:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (searchButton) {
buf.push("<button class=\"add-facet-btn fa fa-plus\"></button>");
if ( searchButton != undefined && searchButton.template != undefined && searchButton.template.length >= 0)
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
    this.$el.removeClass("closed");
    this.focused = true;
    this.$inp.focus();
  };

  FacetSubsBase.prototype.renderResult = function(renderEmpty) {
    var _lbl, _list, i, idx, len, model, ref;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "";
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
    this.$el.removeClass("closed");
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
    if (pView != null) {
      pView.open();
    }
  };

  FacetSubsBase.prototype.render = function(initialAdd) {
    var _tmpl;
    _tmpl = this.template(this.getTemplateData());
    this.$el.html(_tmpl);
    if (!initialAdd) {
      this.$el.removeClass("closed");
    }
    this.$inp = this.$el.find(this._getInpSelector());
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
    return true;
  };

  FacetSubsBase.prototype.close = function(evnt) {
    this.focused = false;
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
    var _ed, _opts, _sd, ref, ref1, ref2;
    _opts = {
      opens: "right"
    };
    if (this.model.get("dateformat")) {
      _opts.locale = {
        format: this.model.get("dateformat")
      };
    }
    if (((ref = this.model.get("value")) != null ? ref[0] : void 0) != null) {
      ((ref1 = this.model.get("value")) != null ? ref1[1] : void 0) != null;
      if (_.isNumber(this.model.get("value")[0])) {
        _sd = moment(this.model.get("value")[0]);
      } else {
        _sd = moment(this.model.get("value")[0], this.model.get("dateformat"));
      }
      if (_sd.isValid()) {
        _opts.startDate = _sd._d;
      }
    }
    if (((ref2 = this.model.get("value")) != null ? ref2[1] : void 0) != null) {
      if (_.isNumber(this.model.get("value")[1])) {
        _ed = moment(this.model.get("value")[1]);
      } else {
        _ed = moment(this.model.get("value")[1], this.model.get("dateformat"));
      }
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
    if (this._isFull()) {
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
      FacetSubArray.__super__.reopen.apply(this, arguments);
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
      return true;
    }
    this.close();
    return true;
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
    return true;
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
    if (this.$inp.is(evnt.target) && !evnt.shiftKey) {
      this.$inpTo.focus();
      return false;
    }
    if (this.$inpTo.is(evnt.target) && evnt.shiftKey) {
      this.$inp.focus();
      return false;
    }
    _val = this.getValue();
    if ((_val != null ? _val.length : void 0) >= 2) {
      evnt.preventDefault();
      evnt.stopPropagation();
      this.select();
      return true;
    }
    return true;
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
        if (typeof ref.remove === "function") {
          ref.remove();
        }
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
    this._nextFacet = bind(this._nextFacet, this);
    this._keyListen = bind(this._keyListen, this);
    this._outerClickListen = bind(this._outerClickListen, this);
    this._onClosed = bind(this._onClosed, this);
    this._onOpened = bind(this._onOpened, this);
    this.addFacet = bind(this.addFacet, this);
    this.genSub = bind(this.genSub, this);
    this.setFacet = bind(this.setFacet, this);
    this.remFacet = bind(this.remFacet, this);
    this.exit = bind(this.exit, this);
    this._addFacet = bind(this._addFacet, this);
    this.render = bind(this.render, this);
    this.templateData = bind(this.templateData, this);
    this.initialize = bind(this.initialize, this);
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.template = require("../tmpls/wrapper.jade");

  MainView.prototype.events = {
    "mousedown .search-btn": "_onSearch",
    "focus .search-btn": "_onFocusSearch",
    "click .add-facet-btn": "_addFacet",
    "click": "_addFacet"
  };

  MainView.prototype.initialize = function(options) {
    var _cl, _fnSort, _valueFacets, fct, i, len, ref, ref1;
    this.main = options.main;
    this.idx = options.idx;
    this.results = options.results;
    this.searchButton = options.searchButton;
    this.facets = {};
    this.collection.on("iggy:rem", this.remFacet);
    _cl = "iggy clearfix";
    if ((ref = this.el.className) != null ? ref.length : void 0) {
      _cl = " " + _cl;
    }
    this.el.className += _cl;
    this.render();
    this._outerClickListen();
    this._keyListen();
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
      this.genSub(fct, false, true);
    }
    this.collection.on("add", (function(_this) {
      return function() {
        _this.$addBtn.show();
      };
    })(this));
    setTimeout((function(_this) {
      return function() {
        var _active, view;
        _active = _this.collection.filter(function(fct) {
          return (fct != null ? fct.get("active") : void 0) && (fct != null ? fct.get("pinned") : void 0);
        });
        if (_active.length) {
          view = _this.facets[_active[0].id];
          if (view != null) {
            view.reopen();
          }
          if (view != null) {
            view.focus();
          }
        }
      };
    })(this), 0);
  };

  MainView.prototype.templateData = function() {
    var _ret;
    _ret = {
      tab_index: (((this.idx || 1) + 1) * 1000) - 10
    };
    if (this.searchButton != null) {
      _ret.searchButton = {
        template: this.searchButton.template || "",
        event: this.searchButton.event || "search",
        pullright: this.searchButton.pullright || false,
        cssclass: this.searchButton.cssclass || "btn btn-primary fa fa-search"
      };
    }
    return _ret;
  };

  MainView.prototype.render = function() {
    var _tplData;
    _tplData = this.templateData();
    this.$el.html(this.template(_tplData));
    this.$addBtn = this.$(".add-facet-btn");
    if (_tplData.searchButton != null) {
      this.$searchBtn = this.$(".search-btn");
    }
  };

  MainView.prototype._addFacet = function(evnt) {
    this.addFacet();
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

  MainView.prototype.genSub = function(facetM, addAfter, initialAdd) {
    var _self, subview;
    if (addAfter == null) {
      addAfter = true;
    }
    if (initialAdd == null) {
      initialAdd = false;
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
          _this.subview = null;
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
    _self = this;
    subview.on("selected", function(facetM, data) {
      _self.setFacet(facetM, data);
      if ((this.selectview._isFull == null) || this.selectview._isFull()) {
        _self._nextFacet(null, this);
      }
    });
    this.$addBtn.before(subview.render(initialAdd));
    this.facets[facetM.id] = subview;
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

  MainView.prototype._keyListen = function() {
    jQuery(document).on("keydown", (function(_this) {
      return function(evnt) {
        var _prevId, ref, ref1, ref2, ref3, ref4, ref5;
        if (evnt.keyCode === KEYCODES.TAB || (ref = evnt.keyCode, indexOf.call(KEYCODES.TAB, ref) >= 0)) {
          evnt.preventDefault();
          if ($(evnt.target).is(".search-btn")) {
            setTimeout(function() {
              return _this.addFacet();
            }, 0);
            return;
          }
          if ((ref1 = _this.selectview) != null ? ref1.isOpen : void 0) {
            if (evnt != null ? evnt.shiftKey : void 0) {
              _prevId = (ref2 = _this.$addBtn) != null ? (ref3 = ref2.prevAll(".sub")) != null ? (ref4 = ref3.first()) != null ? ref4.data("fctid") : void 0 : void 0 : void 0;
              if (_prevId != null) {
                setTimeout(function() {
                  var ref5;
                  return (ref5 = _this.facets[_prevId]) != null ? ref5.reopen() : void 0;
                }, 0);
              }
            } else {
              _this.selectview.close();
              _this.focusSearch();
            }
            return;
          }
          _this.trigger("escape", evnt, _this._nextFacet);
          return;
        }
        if (evnt.keyCode === KEYCODES.ESC || (ref5 = evnt.keyCode, indexOf.call(KEYCODES.ESC, ref5) >= 0)) {
          _this.exit();
          _this.trigger("escape", evnt);
          return;
        }
      };
    })(this));
  };

  MainView.prototype._nextFacet = function(evnt, subView) {
    var _next, _nextFn, _nextId, ref;
    _nextFn = (evnt != null ? evnt.shiftKey : void 0) ? "prev" : "next";
    _next = (ref = subView.$el) != null ? typeof ref[_nextFn] === "function" ? ref[_nextFn]() : void 0 : void 0;
    if (_next.hasClass("add-facet-btn")) {
      setTimeout((function(_this) {
        return function() {
          return _this.addFacet();
        };
      })(this), 0);
      return;
    }
    _nextId = _next != null ? _next.data("fctid") : void 0;
    if (_nextId != null) {
      setTimeout((function(_this) {
        return function() {
          var ref1;
          return (ref1 = _this.facets[_nextId]) != null ? ref1.reopen() : void 0;
        };
      })(this), 0);
    }
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
      if (!(!model.get("pinned"))) {
        continue;
      }
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
    var _err, _errerr, _id, ref;
    if ((this.main == null) && this._isFull()) {
      _id = (ref = this.result.last()) != null ? ref.id : void 0;
      this.rmRes(_id);
    }
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
    var _id, _search, _sel, ref, ref1;
    if (isEnterEvent == null) {
      isEnterEvent = false;
    }
    if ((this.main == null) && this._isFull()) {
      _id = (ref = this.result.last()) != null ? ref.id : void 0;
      this.rmRes(_id);
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
    } else if ((ref1 = this.currQuery) != null ? ref1.length : void 0) {
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
    this.$el.data("fctid", this.model.id);
    this.parent.on("escape", (function(_this) {
      return function(evnt, cb) {
        var ref;
        if (_this._isOpen) {
          if ((ref = _this.selectview) != null ? ref._onTabAction(evnt) : void 0) {
            if (cb != null) {
              cb(evnt, _this);
            }
          }
        }
      };
    })(this));
  };

  ViewSub.prototype.events = {
    "click .rm-facet-btn": "del"
  };

  ViewSub.prototype.render = function(initialAdd) {
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
    this.generateSub(initialAdd);
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

  ViewSub.prototype.generateSub = function(initialAdd) {
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
    this.$el.append(this.selectview.render(initialAdd));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL21haW4uY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvYmFja2JvbmVfc3ViLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2Jhc2UuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9yYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0cy5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3JhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXIuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL3N1YnN0cmluZy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL3N1Yi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0Y29sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsc0hBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVDs7QUFDWCxNQUFBLEdBQVMsT0FBQSxDQUFTLGlCQUFUOztBQUNULFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFTLDBCQUFUOztBQUNmLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsT0FBQSxHQUFVLE9BQUEsQ0FBUyxrQkFBVDs7QUFFVixRQUFBLEdBQVc7O0FBRUw7OztpQkFDTCxDQUFBLEdBQUc7O0VBQ1UsY0FB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QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0wsUUFBQTtJQUFBLElBQUMsQ0FBQSxXQUFELENBQUE7O1NBRVcsQ0FBRSxLQUFiLENBQUE7O0lBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztFQUpOOzs7O0dBektlLFFBQVEsQ0FBQzs7QUFtTC9CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDbkxqQjs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldHNcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdFNlbGVjdCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc2VsZWN0XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3RSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfcmFuZ2VcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcbkZjdEV2ZW50ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9ldmVudFwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbklHR1lfSURYID0gMVxuXG5jbGFzcyBJR0dZIGV4dGVuZHMgQmFja2JvbmUuRXZlbnRzXG5cdCQ6IGpRdWVyeVxuXHRjb25zdHJ1Y3RvcjogKCBlbCwgZmFjZXRzID0gW10sIG9wdGlvbnMgPSB7fSApLT5cblx0XHRfLmV4dGVuZCBALCBCYWNrYm9uZS5FdmVudHNcblx0XHRAX2luaXRFcnJvcnMoKVxuXHRcdFxuXHRcdCMgaW5pdCBlbGVtZW50XG5cdFx0QCRlbCA9IEBfcHJlcGFyZUVsKCBlbCApXG5cdFx0QGVsID0gQCRlbFswXVxuXHRcdEAkZWwuZGF0YSggXCJpZ2d5XCIsIEAgKVxuXG5cdFx0IyBpbml0IGZhY2V0c1xuXHRcdEBmYWNldHMgPSBAX3ByZXBhcmVGYWNldHMoIGZhY2V0cywgb3B0aW9ucyApXG5cdFx0QHJlc3VsdHMgPSBuZXcgUmVzdWx0cyggbnVsbCwgb3B0aW9ucyApXG5cblx0XHRAcmVzdWx0cy5vbiBcImFkZFwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwicmVtb3ZlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJjaGFuZ2VcIiwgQHRyaWdnZXJDaGFuZ2VcblxuXHRcdEB2aWV3ID0gbmV3IE1haW5WaWV3KCBtYWluOiBALCBlbDogQCRlbCwgY29sbGVjdGlvbjogQGZhY2V0cywgcmVzdWx0czogQHJlc3VsdHMsIHNlYXJjaEJ1dHRvbjogb3B0aW9ucy5zZWFyY2hCdXR0b24sIGlkeDogSUdHWV9JRFgrKyApXG5cdFx0XG5cdFx0QHZpZXcub24gXCJzZWFyY2hidXR0b25cIiwgQHRyaWdnZXJFdmVudFxuXG5cdFx0QG5vbkVtcHR5UmVzdWx0cyA9IEByZXN1bHRzLnN1YiggQF9maWx0ZXJFbXB0eSApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cywgb3B0aW9ucz17fSApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQsIF9pZHggaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X2ZjdC5faWR4ID0gX2lkeFxuXHRcdFx0X3JldC5wdXNoIF9mY3Rcblx0XHRcblx0XHRyZXR1cm4gbmV3IEZhY2V0cyggX3JldCwgb3B0aW9ucyApXG5cblx0X2NyZWF0ZUZhY2V0OiAoIGZhY2V0ICktPlxuXHRcdHN3aXRjaCBmYWNldC50eXBlLnRvTG93ZXJDYXNlKClcblx0XHRcdHdoZW4gXCJzdHJpbmdcIiB0aGVuIHJldHVybiBuZXcgRmN0U3RyaW5nKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwic2VsZWN0XCIgdGhlbiByZXR1cm4gbmV3IEZjdFNlbGVjdCggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImFycmF5XCIgdGhlbiByZXR1cm4gbmV3IEZjdEFycmF5KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwibnVtYmVyXCIgdGhlbiByZXR1cm4gbmV3IEZjdE51bWJlciggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcInJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdFJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZGF0ZXJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdERhdGVSYW5nZSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImV2ZW50XCIgdGhlbiByZXR1cm4gbmV3IEZjdEV2ZW50KCBmYWNldCwgbWFpbjogQCApXG5cblx0YWRkRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0aWYgbm90IEBmYWNldHM/XG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRAZmFjZXRzLmFkZCggX2ZjdCApXG5cdFx0cmV0dXJuIEBcblxuXHRfZXJyb3I6ICggdHlwZSwgZGF0YSA9IHt9ICk9PlxuXHRcdGlmIEBlcnJvcnNbIHR5cGUgXT9cblx0XHRcdF9tc2cgPSBAZXJyb3JzWyB0eXBlIF0oIGRhdGEgKVxuXHRcdGVsc2Vcblx0XHRcdF9tc2cgPSBcIi1cIlxuXHRcdF9lcnIgPSBuZXcgRXJyb3IoKVxuXHRcdF9lcnIubmFtZSA9IHR5cGVcblx0XHRfZXJyLm1lc3NhZ2UgPSBfbXNnXG5cdFx0cmV0dXJuIF9lcnJcblxuXHRfZmlsdGVyRW1wdHk6ICggbW9kZWwgKT0+XG5cdFx0X3YgPSBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgbm90IF92P1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0aWYgX3YubGVuZ3RoIDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRnZXRRdWVyeTogPT5cblx0XHRyZXR1cm4gQG5vbkVtcHR5UmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEB0cmlnZ2VyKCBcImNoYW5nZVwiLCBAbm9uRW1wdHlSZXN1bHRzIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXHRcblx0dHJpZ2dlckV2ZW50OiAoIGV2ZW50TmFtZSApPT5cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHRyaWdnZXIoIGV2ZW50TmFtZSwgQG5vbkVtcHR5UmVzdWx0cyApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XHRcblx0X2luaXRFcnJvcnM6ID0+XG5cdFx0QGVycm9ycyA9IHt9XG5cdFx0Zm9yIF9rLCBfdG1wbCBvZiBARVJST1JTKClcblx0XHRcdEBlcnJvcnNbIF9rIF0gPSBfLnRlbXBsYXRlKCBfdG1wbCApXG5cdFx0cmV0dXJuXG5cblx0RVJST1JTOiAtPlxuXHRcdFwiRUlOVkFMSURFTFNUUklOR1wiOiBcIklmIHlvdSBkZWZpbmUgYSBgZWxgIGFzIFN0cmluZyBpdCBoYXMgdG8gYmUgYSB2YWxpZCBzZWxlY3RvciBmb3IgYW4gZXhpc3RpbmcgRE9NIGVsZW1lbnQuXCJcblx0XHRcIkVFTVBUWUVMU1RSSU5HXCI6IFwiVGhlIGBlbGAgYXMgc3RyaW5nIGNhbiBub3QgYmUgZW1wdHkuXCJcblx0XHRcIkVFTVBUWUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGFuIGVtcHR5IGNvbGxlY3Rpb24uXCJcblx0XHRcIkVTSVpFRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYSByZXN1bHQgb2Ygb25lIGVsLlwiXG5cdFx0XCJFSU5WQUxJREVMVFlQRVwiOiBcIlRoZSBgZWxgIGNhbiBvbmx5IGJlIGEgc2VsZWN0b3Igc3RyaW5nLCBkb20gZWxlbWVudCBvciBqUXVlcnkgY29sbGVjdGlvblwiXG5cdFx0XCJFTUlTU0lOR0VMXCI6IFwiUGxlYXNlIGRlZmluZSBhIHRhcmdldCBgZWxgXCJcblxubW9kdWxlLmV4cG9ydHMgPSBJR0dZXG4iLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKVxuXHRcblx0IyBvciBieSBPYmplY3Rcblx0c3ViQ29sbE8gPSBwYXJlbnRDb2xsLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyBvciBieSBOdW1iZXJcblx0c3ViQ29sbE4gPSBwYXJlbnRDb2xsLnN1YiggMTMgKVxuXHRcblx0IyBvciBieSBGdW5jdGlvblxuXHRzdWJDb2xsRiA9IHBhcmVudENvbGwuc3ViKCAoKCBtb2RlbCApLT4gaWYgbW9kZWwuZ2V0KCBcImFnZVwiICkgPiAyMyApIClcblx0XG5cdCMgc3ViY29sbGVjdGlvbiBvZiBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBX08gPSBzdWJDb2xsQS5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBGb3IgdGhpcyBhIGByZXNldGAgd2lsbCBiZSBmaXJlZCBvbiB0aGUgc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQSA9IHN1YkNvbGxBLnVwZGF0ZVN1YkZpbHRlciggeyBuYW1lOiBcIkJhclwiLCBhZ2U6IDQyIH0gKVxuIyMjXG5cbmNsYXNzIEJhY2tib25lU3ViIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHQjIyNcblx0IyMgc3ViXG5cdFxuXHRgY29sbGVjdGlvbi5zdWIoIGZpbHRlciApYFxuXHRcblx0R2VuZXJhdGUgYSBzdWItY29sbGVjdGlvbiBieSBhIGZpbHRlci5cblx0VGhlIG1vZGVscyB3aWxsIGJlIGRpc3RyaWJ1dGVkIHdpdGhpbiBhbGwgaW52b2x2ZWQgY29sbGVjdGlvbnMgdW5kZXIgY29uc2lkZXJhdGlvbiBvZiB0aGUgZmlsdGVyLlxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBDb2xsZWN0aW9uIH0gQSBTdWItQ29sbGVjdGlvbiBiYXNlZCBvbiB0aGUgZmlsdGVyXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0c3ViOiAoIGZpbHRlciApPT5cblx0XHRAc3ViQ29sbHMgb3I9IFtdXG5cdFx0Zm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKVxuXG5cdFx0IyBmaWx0ZXIgdGhlIGNvbGxlY3Rpb25cblx0XHRfbW9kZWxzID0gQGZpbHRlciBmbkZpbHRlclxuXHRcdCMgY3JlYXRlIHRoZSBzdWJjb2xsZWN0aW9uXG5cdFx0X3N1YiA9IG5ldyBAY29uc3RydWN0b3IoIF9tb2RlbHMsIEBfc3ViQ29sbGVjdGlvbk9wdGlvbnMoKSApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cdFxuXHQjIyNcblx0IyMgX3N1YkNvbGxlY3Rpb25PcHRpb25zXG5cdFxuXHRgY29sbGVjdGlvbi5fc3ViQ29sbGVjdGlvbk9wdGlvbnMoKWBcblx0XG5cdE92ZXJ3cml0YWJsZSBtZXRob2QgdG8gc2V0IHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGZvciBzdWIgY29sbGVjdGlvbnNcblx0XG5cdEByZXR1cm4geyBPYmplY3QgfSBUaGUgb3B0aW9ucyBvYmplY3Rcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X3N1YkNvbGxlY3Rpb25PcHRpb25zOiA9PlxuXHRcdF9vcHRzID1cblx0XHRcdGNvbXBhcmF0b3I6IEBjb21wYXJhdG9yXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICktPlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWJcbiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBhdHRycywgb3B0aW9ucyApLT5cblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRkZWZhdWx0czogLT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cdFx0c29ydDogMFxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2VcbiIsImNsYXNzIEZjdERhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdHM6IHt9XG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZVxuIiwiY2xhc3MgRmN0RXZlbnQgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogbnVsbFxuXHRvbmx5RXhlYzogdHJ1ZVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFxuXHRleGVjOiAoICk9PlxuXHRcdEBtYWluLnRyaWdnZXIoIEBnZXQoIFwiZXZlbnRcIiApLCBAdG9KU09OKCkgKVxuXHRcdHJldHVyblxubW9kdWxlLmV4cG9ydHMgPSBGY3RFdmVudFxuIiwiY2xhc3MgRmN0TnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1Ym51bWJlclwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyXG4iLCJjbGFzcyBGY3RSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0UmFuZ2VcbiIsImNsYXNzIEZjdFNlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzZWxlY3RcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCggc3VwZXIsIHtcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XHR3YWl0Rm9yQXN5bmM6IHRydWVcblx0XHR9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFNlbGVjdFxuIiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmdcbiIsInNvcnRDb2xsID0gcmVxdWlyZSggXCJzb3J0Y29sbFwiIClcblxuZm5HZXQgPSAoIGVsLCBrZXkgKS0+XG5cdHJldHVybiBlbC5nZXQoIGtleSApXG5cbmNsYXNzIElnZ3lGYWNldHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRcblx0Y29uc3RydWN0b3I6ICggbW9kZWxzLCBvcHRpb25zPXt9ICktPlxuXHRcdGlmIG5vdCBvcHRpb25zLmNvbXBhcmF0b3I/XG5cdFx0XHRfZm9yd2FyZCA9IHN3aXRjaCBvcHRpb25zLmRpclxuXHRcdFx0XHR3aGVuIFwiYXNjXCIgdGhlbiB0cnVlXG5cdFx0XHRcdHdoZW4gXCJkZXNjXCIgdGhlbiBmYWxzZVxuXHRcdFx0XHRlbHNlIHRydWVcblx0XHRcdFxuXHRcdFx0b3B0aW9ucy5jb21wYXJhdG9yID0gc29ydENvbGwoIFsgXCJzb3J0XCIgXS5jb25jYXQoIG9wdGlvbnMuc29ydGJ5IG9yIFwibmFtZVwiICksIHsgc29ydDogZmFsc2UsIFwiP1wiOiBfZm9yd2FyZCB9LCBmbkdldCApXG5cdFx0cmV0dXJuIHN1cGVyKCBtb2RlbHMsIG9wdGlvbnMgKVxuXHRcblx0X3N1YkNvbGxlY2N0aW9uT3B0aW9uczogPT5cblx0XHRvcHQgPSBzdXBlclxuXHRcdG9wdC5kaXIgPSBpZiBAZm9yd2FyZCB0aGVuIFwiYXNjXCIgZWxzZSBcImRlc2NcIlxuXHRcdHJldHVybiBvcHRcblx0XG5cdG1vZGVsSWQ6IChhdHRycyktPlxuXHRcdHJldHVybiBhdHRycy5uYW1lXG5cdFx0XG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lGYWNldHNcbiIsImNsYXNzIElnZ3lSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0ZGVmYXVsdHM6XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IG51bGxcblx0XHR2YWx1ZTogbnVsbFxuXG5jbGFzcyBJZ2d5UmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdGluaXRpYWxpemU6ICggbWRscywgb3B0cyApPT5cblx0XHRpZiBvcHRzLm1vZGlmeUtleT8ubGVuZ3RoXG5cdFx0XHRAbW9kaWZ5S2V5ID0gb3B0cy5tb2RpZnlLZXlcblx0XHRyZXR1cm5cblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfa2V5ID0gb3B0aW9ucy5fZmFjZXQuZ2V0KCBcIm1vZGlmeUtleVwiICkgb3IgQG1vZGlmeUtleSBvciBcInZhbHVlXCJcblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyWyBfa2V5IF0gPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBvcHRpb25zLl9mYWNldCwgYXR0ciApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0c1xuIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHNcbiIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGN1c3RvbSwgaWQsIHR4dCkge1xuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHR4dCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJidG4td3JwXFxcIj48aVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwicm0tcmVzdWx0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT5cIik7XG5pZiAoIGN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImVkaXQtcmVzdWx0LWJ0biBmYSBmYS1wZW5jaWxcXFwiPjwvaT5cIik7XG59XG5idWYucHVzaChcIjwvc3Bhbj5cIik7fS5jYWxsKHRoaXMsXCJjdXN0b21cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1c3RvbTp0eXBlb2YgY3VzdG9tIT09XCJ1bmRlZmluZWRcIj9jdXN0b206dW5kZWZpbmVkLFwiaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmlkOnR5cGVvZiBpZCE9PVwidW5kZWZpbmVkXCI/aWQ6dW5kZWZpbmVkLFwidHh0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50eHQ6dHlwZW9mIHR4dCE9PVwidW5kZWZpbmVkXCI/dHh0OnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwiZGF0ZXJhbmdlLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG9wZXJhdG9yLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmlmICggb3BlcmF0b3JzICYmIG9wZXJhdG9ycy5sZW5ndGgpXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcIm9wZXJhdG9yXFxcIj48c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJvcFwiLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgdmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJvcGVyYXRvclwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3I6dHlwZW9mIG9wZXJhdG9yIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcjp1bmRlZmluZWQsXCJvcGVyYXRvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yczp0eXBlb2Ygb3BlcmF0b3JzIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicmFuZ2VpbnBcXFwiPlwiKTtcbnZhciBfdmFscyA9IHZhbHVlID8gdmFsdWUgOiBbXVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl9mcm9tXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS1mcm9tXFxcIi8+PHNwYW4gY2xhc3M9XFxcInNlcGFyYXRvclxcXCI+LTwvc3Bhbj48aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl90b1wiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzFdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtdG9cXFwiLz48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbjtyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgbXVsdGlwbGUsIG9wdGlvbkdyb3Vwcywgb3B0aW9ucywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuaWYgKCBvcHRpb25Hcm91cHMpXG57XG4vLyBpdGVyYXRlIG9wdGlvbkdyb3Vwc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25Hcm91cHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBnbmFtZSA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZ25hbWUgPCAkJGw7IGduYW1lKyspIHtcbiAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBnbmFtZSBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlXG57XG4vLyBpdGVyYXRlIG9wdGlvbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9ucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+XCIpO1xuaWYgKCBtdWx0aXBsZSlcbntcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcImJ0biBidG4teHMgYnRuLXN1Y2Nlc3Mgc2VsZWN0LWNoZWNrIGZhIGZhLWNoZWNrXFxcIj48L3NwYW4+XCIpO1xufX0uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm11bHRpcGxlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5tdWx0aXBsZTp0eXBlb2YgbXVsdGlwbGUhPT1cInVuZGVmaW5lZFwiP211bHRpcGxlOnVuZGVmaW5lZCxcIm9wdGlvbkdyb3Vwc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uR3JvdXBzOnR5cGVvZiBvcHRpb25Hcm91cHMhPT1cInVuZGVmaW5lZFwiP29wdGlvbkdyb3Vwczp1bmRlZmluZWQsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIGlucHZhbCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgaW5wdmFsLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwiaW5wdmFsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pbnB2YWw6dHlwZW9mIGlucHZhbCE9PVwidW5kZWZpbmVkXCI/aW5wdmFsOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHBpbm5lZCwgc2VsZWN0ZWQsIHVuZGVmaW5lZCkge1xuaWYgKCAhcGlubmVkKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2Rpdj5cIik7XG59XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJzdWJsYWJlbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxzcGFuIGNsYXNzPVxcXCJ0eHRcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48aSBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9pPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxpIGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3QgY2xvc2VkXFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJsb2FkZXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jb2cgZmEtc3BpblxcXCI+PC9pPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInBpbm5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgucGlubmVkOnR5cGVvZiBwaW5uZWQhPT1cInVuZGVmaW5lZFwiP3Bpbm5lZDp1bmRlZmluZWQsXCJzZWxlY3RlZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VsZWN0ZWQ6dHlwZW9mIHNlbGVjdGVkIT09XCJ1bmRlZmluZWRcIj9zZWxlY3RlZDp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoc2VhcmNoQnV0dG9uKSB7XG5idWYucHVzaChcIjxidXR0b24gY2xhc3M9XFxcImFkZC1mYWNldC1idG4gZmEgZmEtcGx1c1xcXCI+PC9idXR0b24+XCIpO1xuaWYgKCBzZWFyY2hCdXR0b24gIT0gdW5kZWZpbmVkICYmIHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSAhPSB1bmRlZmluZWQgJiYgc2VhcmNoQnV0dG9uLnRlbXBsYXRlLmxlbmd0aCA+PSAwKVxue1xuYnVmLnB1c2goXCI8YnV0dG9uXCIgKyAoamFkZS5jbHMoWydzZWFyY2gtYnRuJyxzZWFyY2hCdXR0b24uY3NzY2xhc3Mse1wic2VhcmNoLWJ0bi1wdWxscmlnaHRcIjpzZWFyY2hCdXR0b24ucHVsbHJpZ2h0fV0sIFtudWxsLHRydWUsdHJ1ZV0pKSArIFwiPlwiICsgKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc2VhcmNoQnV0dG9uLnRlbXBsYXRlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkgKyBcIjwvYnV0dG9uPlwiKTtcbn19LmNhbGwodGhpcyxcInNlYXJjaEJ1dHRvblwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VhcmNoQnV0dG9uOnR5cGVvZiBzZWFyY2hCdXR0b24hPT1cInVuZGVmaW5lZFwiP3NlYXJjaEJ1dHRvbjp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9XG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTNcblx0XCJUQUJcIjogOVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHJlc3VsdFRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGVcIiApXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzdWIgPSBvcHRpb25zLnN1YlxuXHRcdEByZXN1bHQgPSBuZXcgU3ViUmVzdWx0cygpXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGZvY3VzZWQgPSB0cnVlXG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCJcIlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdGlmIF9sYmw/IGFuZCBfbGJsIGlzbnQgXCJcIlxuXHRcdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblx0XHRpZiBfbGlzdC5sZW5ndGhcblx0XHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdHJldHVybiBcIlwiXG5cdFx0XG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEBpc09wZW4gPSB0cnVlXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVyblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5UQUIgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLlRBQlxuXHRcdFx0QF9vblRhYkFjdGlvbiggZXZudCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldCA9XG5cdFx0XHRjaWQ6IEBjaWRcblx0XHRcdCN0YWJfaW5kZXg6ICggKCBAbW9kZWw/Ll9pZHggKiAxMCApIG9yIDEgKSArICggKCBAc3ViPy5wYXJlbnQ/LmlkeCBvciAxICkgKiAxMDAwIClcblx0XHRcdHZhbHVlOiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiIClcblx0XHRyZXR1cm4gcmV0XG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH1cIlxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAcmVuZGVyKClcblx0XHRwVmlldz8ub3BlbigpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW5kZXI6ICggaW5pdGlhbEFkZCApPT5cblx0XHRfdG1wbCA9IEB0ZW1wbGF0ZSggIEBnZXRUZW1wbGF0ZURhdGEoKSApXG5cdFx0QCRlbC5odG1sKCBfdG1wbCApXG5cdFx0aWYgbm90IGluaXRpYWxBZGRcblx0XHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEAkaW5wID0gQCRlbC5maW5kKCBAX2dldElucFNlbGVjdG9yKCkgKVxuXHRcdCMkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCB0cnVlIClcblx0XHRyZXR1cm5cblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXlkb3duXCJcblx0XHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuIHRydWVcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdEBmb2N1c2VkID0gZmFsc2Vcblx0XHQjJCggZG9jdW1lbnQgKS5vZmYgQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBfaGFzVGFiTGlzdGVuZXIoIGZhbHNlIClcblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcIm9wZW5cIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGlzT3BlbiA9IGZhbHNlXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6IC0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0X2NoZWNrU2VsZWN0RW1wdHk6ICggX3ZhbCApPT5cblx0XHRpZiBfLmlzRW1wdHkoIF92YWwgKSBhbmQgbm90IF8uaXNOdW1iZXIoIF92YWwgKSBhbmQgbm90IF8uaXNCb29sZWFuKCBfdmFsICkgYW5kIG5vdCBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHNlbGVjdDogPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRyZXR1cm4gaWYgQF9jaGVja1NlbGVjdEVtcHR5KCBfdmFsIClcblx0XHRAc2V0KCBfdmFsIClcblx0XHRyZXR1cm5cblxuXHRzZXQ6ICggdmFsICk9PlxuXHRcdF9tb2RlbCA9IEByZXN1bHQuZmlyc3QoKVxuXHRcdGlmIG5vdCBfbW9kZWw/XG5cdFx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiB2YWwgKVxuXHRcdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0ZWxzZVxuXHRcdFx0X21vZGVsLnNldCggdmFsdWU6IHZhbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzQmFzZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNEYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvZGF0ZXJhbmdlLmphZGVcIiApXG5cblx0Zm9yY2VkRGF0ZVJhbmdlT3B0czogPT5cblx0XHRfb3B0cyA9XG5cdFx0XHRvcGVuczogXCJyaWdodFwiXG5cdFx0XHRcblx0XHRpZiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0XHRfb3B0cy5sb2NhbGUgPVxuXHRcdFx0XHRmb3JtYXQ6IEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiIClcblx0XHRcblx0XHRpZiBAbW9kZWwuZ2V0KFwidmFsdWVcIik/WzBdP1xuXHRcdFx0QG1vZGVsLmdldChcInZhbHVlXCIpP1sxXT9cblx0XHRcdGlmIF8uaXNOdW1iZXIoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVswXSApXG5cdFx0XHRcdF9zZCA9IG1vbWVudCggQG1vZGVsLmdldChcInZhbHVlXCIpWzBdIClcblx0XHRcdGVsc2Vcblx0XHRcdFx0X3NkID0gbW9tZW50KCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXHRcdFx0aWYgX3NkLmlzVmFsaWQoKVxuXHRcdFx0XHRfb3B0cy5zdGFydERhdGUgPSBfc2QuX2RcblxuXHRcdGlmIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKT9bMV0/XG5cdFx0XHRpZiBfLmlzTnVtYmVyKCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMV0gKVxuXHRcdFx0XHRfZWQgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVsxXSApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9lZCA9IG1vbWVudCggQG1vZGVsLmdldChcInZhbHVlXCIpWzFdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdGlmIF9lZC5pc1ZhbGlkKClcblx0XHRcdFx0X29wdHMuZW5kRGF0ZSA9IF9lZC5fZFxuXHRcdHJldHVybiBfb3B0c1xuXG5cdGV2ZW50czogPT5cblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdGlmIG5vdCBAZGF0ZXJhbmdlcGlja2VyP1xuXHRcdFx0X29wdHMgPSBfLmV4dGVuZCgge30sIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIEBmb3JjZWREYXRlUmFuZ2VPcHRzKCkgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblx0XHRcdFxuXHRcdFx0IyBwcmV2ZW50IGZyb20gaGFuZGxpY2ggdGhlIG91dGVyY2xpY2sgZXhpdCBmcm9tIE1haW5WaWV3XG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lci5vbiBcImNsaWNrXCIsICggZXZudCApLT5cblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRlbHNlXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmVsZW1lbnQgPSBAJGlucFxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5zaG93KClcblx0XHRcdFxuXHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRAJGlucC5vbiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRjbG9zZTogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wLm9mZiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub2ZmKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0cmV0dXJuXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0QGRhdGVyYW5nZXBpY2tlciA9IG51bGxcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRcblx0XHRpZiBfLmlzTnVtYmVyKCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdFx0X3N0YXJ0RGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMCBdIClcblx0XHRlbHNlXG5cdFx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXHRcdFx0XG5cdFx0aWYgX3Jlcy52YWx1ZVsgMSBdP1xuXHRcdFx0aWYgXy5pc051bWJlciggX3Jlcy52YWx1ZVsgMSBdIClcblx0XHRcdFx0X2VuZERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDEgXSApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXG5cdFx0X3RpbWUgPSBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLnRpbWVQaWNrZXJcblxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApP1xuXHRcdFx0X2ZybXQgPSBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0ZWxzZSBpZiBfdGltZVxuXHRcdFx0X2ZybXQgPSBcIkxMTExcIlxuXHRcdGVsc2Vcblx0XHRcdF9mcm10ID0gXCJMTFwiXG5cdFx0X3MgKz0gX3N0YXJ0RGF0ZS5mb3JtYXQoIF9mcm10IClcblxuXHRcdGlmIF9lbmREYXRlP1xuXHRcdFx0X3MgKz0gXCIgLSBcIlxuXHRcdFx0X3MgKz0gX2VuZERhdGUuZm9ybWF0KCBfZnJtdCApXG5cblx0XHRfcyArPSBcIjwvbGk+XCJcblxuXHRcdHJldHVybiBfc1xuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QG1vZGVsLnNldCggXCJ2YWx1ZVwiLCBAZ2V0VmFsdWUoIGZhbHNlICkgKVxuXHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRWYWx1ZTogKCBwcmVkZWYgPSB0cnVlICk9PlxuXHRcdGlmIHByZWRlZlxuXHRcdFx0X3ByZWRlZlZhbCA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0XHRpZiBfcHJlZGVmVmFsP1xuXHRcdFx0XHRpZiBub3QgXy5pc0FycmF5KCBfcHJlZGVmVmFsIClcblx0XHRcdFx0XHRfcHJlZGVmVmFsID0gIFsgX3ByZWRlZlZhbCBdXG5cdFx0XHRcdFsgQHN0YXJ0RGF0ZSwgQGVuZERhdGUgXSA9IF9wcmVkZWZWYWxcblx0XHRcdFx0cmV0dXJuIF9wcmVkZWZWYWxcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldE51bWJlckJhc2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAc2V0TnVtYmVyID0gXy50aHJvdHRsZSggQF9zZXROdW1iZXIsIDMwMCwge2xlYWRpbmc6IGZhbHNlLCB0cmFpbGluZzogZmFsc2V9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdF8kZWwgPSAkKCBldm50LmN1cnJlbnRUYXJnZXQgKVxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICksIF8kZWwgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSAqIC0xLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleXVwXCJcblx0XHRcdF92ID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnJlcGxhY2UoIC9bXlxcZF0/W14tXFxkXSsvZywgXCJcIiApXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXHRcdFx0IFxuXHRcdFx0QHNldE51bWJlciggX3YsIF8kZWwgKVxuXHRcdHJldHVyblxuXG5cdGNyZW1lbnQ6ICggY2hhbmdlLCBlbCA9IEAkaW5wICk9PlxuXHRcdF92ID0gZWwudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0X3YgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0XHRAX3NldE51bWJlciggX3YgKyBjaGFuZ2UsIGVsIClcblx0XHRyZXR1cm5cblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0cmV0dXJuIHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdF9zZXROdW1iZXI6ICggX3YsIGVsID0gQCRpbnAgKT0+XG5cdFx0aWYgaXNOYU4oIF92IClcblx0XHRcdCNAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X2N1cnIgPSBlbC52YWwoKVxuXG5cdFx0X3YgPSBAdmFsdWVCeURlZmluaXRpb24oIF92KVxuXHRcdGlmIF9jdXJyICE9IF92LnRvU3RyaW5nKClcblx0XHRcdGVsLnZhbCggX3YgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSApLT5cblx0XHRtYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRtaW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRzdGVwID0gQG1vZGVsLmdldCggXCJzdGVwXCIgKVxuXHRcdFxuXHRcdCMgZml4IHJldmVyc2VkIG1pbi9tYXggc2V0dGluZ1xuXHRcdGlmIG1pbiA+IG1heFxuXHRcdFx0X3RtcCA9IG1pblxuXHRcdFx0bWluID0gbWF4XG5cdFx0XHRtYXggPSBfdG1wXG5cdFx0XG5cdFx0IyBvbiBleHhlZGRpbmcgdGhlIGxpbWl0cyB1c2UgdGhlIGxpbWl0XG5cdFx0aWYgbWluPyBhbmQgX3ZhbHVlIDwgbWluXG5cdFx0XHRyZXR1cm4gbWluXG5cdFx0aWYgbWF4PyBhbmQgX3ZhbHVlID4gbWF4XG5cdFx0XHRyZXR1cm4gbWF4XG5cblx0XHQjIHNlYXJjaCB0aGUgbmVhcmVzdCBfdmFsdWUgdG8gdGhlIHN0ZXBcblx0XHRpZiBzdGVwIGlzbnQgMVxuXHRcdFx0X3ZhbHVlID0gbmVhcmVzdCggX3ZhbHVlLCBzdGVwIClcblx0XHRcblx0XHQjIGNhbGMgdGhlIHByZWNpc2lvbiBieSBzdGVwXG5cdFx0X3ByZWNpc2lvbiA9IE1hdGgubWF4KCAwLCBNYXRoLmNlaWwoIE1hdGgubG9nKCAxL3N0ZXAgKSAvIE1hdGgubG9nKCAxMCApICkgKVxuXHRcdGlmIF9wcmVjaXNpb24gPiAwXG5cdFx0XHRfdmFsdWUgPSBwcmVjaXNpb24oIF92YWx1ZSwgX3ByZWNpc2lvbiApXG5cdFx0ZWxzZVxuXHRcdFx0X3ZhbHVlID0gTWF0aC5yb3VuZCggX3ZhbHVlIClcblx0XHRcdFxuXHRcdHJldHVybiBfdmFsdWVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0TnVtYmVyQmFzZVxuIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5cbmNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgQXJyYXlPcHRpb25zIGV4dGVuZHMgcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQXJyYXlPcHRpb25cblxuY2xhc3MgRmFjZXRTdWJBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdFxuXHR0ZW1wbGF0ZVJlc0xpOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2FycmF5X3Jlc3VsdGxpLmphZGVcIiApXG5cdFxuXHRvcHREZWZhdWx0OlxuXHRcdGxhYmVsOiBcIi1cIlxuXHRcdHZhbHVlOiBcIi1cIlxuXG5cdHNlbGVjdENvdW50OiAwXG5cblx0b3B0Q29sbDogU3RyaW5nT3B0aW9uc1xuXHRcblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApP1xuXHRcdFx0QHNlbGVjdENvdW50ID0gb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApXG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKT9cblx0XHRcdG9wdGlvbnMuY3VzdG9tID0gQm9vbGVhbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSApXG5cdFx0XHRcblx0XHRAY29sbGVjdGlvbiA9IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdFxuXHRcdGlmIG5vdCBvcHRpb25zLmN1c3RvbSBhbmQgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdEBzZWxlY3RDb3VudCA9IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0XG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdFxuXHRcdEByZXN1bHQub24gXCJyZW1vdmVcIiwgKCBtZGwsIGNvbGwgKT0+XG5cdFx0XHRpZiBjb2xsLmxlbmd0aFxuXHRcdFx0XHRvcHRpb25zLnN1Yi5yZW5kZXJSZXN1bHQoKVxuXHRcdFx0QHNlYXJjaGNvbGwuYWRkKCBtZGwgKVxuXHRcdFx0QHRyaWdnZXIoIFwicmVtb3ZlZFwiLCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRpbml0aWFsaXplOiA9PlxuXHRcdEBlZGl0TW9kZSA9IGZhbHNlXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciBpbnB1dCMje0BjaWR9XCIgXSA9IFwiY2xvc2VcIlxuXHRcdHJldHVybiBfZXZudHNcblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0IyBjaGVjayBpZiB0aGUgY2xvc2UgaXMgaW5pdGllZCBmcm9tIHRoZSBlZGl0IG1vZGVcblx0XHRfZGVsU3ViID0gZmFsc2Vcblx0XHRpZiBAZWRpdE1vZGVcblx0XHRcdF9kZWxTdWIgPSB0cnVlXG5cdFx0XHRcblx0XHRAZWRpdE1vZGUgPSBmYWxzZVxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QGZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdFx0aWYgX2RlbFN1YiBhbmQgQHJlc3VsdC5sZW5ndGggPD0gMFxuXHRcdFx0QHN1Yi5kZWwoKVxuXHRcdHJldHVybiBzdXBlclxuXHRcblx0cm1SZXM6ICggZXZudCApPT5cblx0XHRpZiBldm50Py50YXJnZXQ/XG5cdFx0XHRfaWQgPSAkKCBldm50LnRhcmdldCApPy5kYXRhKCBcImlkXCIgKVxuXHRcdGVsc2UgaWYgZXZudD9cblx0XHRcdF9pZCA9IGV2bnRcblx0XHRfbWRsID0gQHJlc3VsdC5nZXQoIF9pZCApXG5cdFx0aWYgX21kbD9cblx0XHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdFx0aWYgX21kbD8uZ2V0KCBcImN1c3RvbVwiIClcblx0XHRcdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBfaWQgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRlZGl0UmVzOiAoIGV2bnQgKT0+XG5cdFx0QGVkaXRNb2RlID0gdHJ1ZVxuXHRcdF9pZCA9ICQoIGV2bnQudGFyZ2V0ICk/LmRhdGEoIFwiaWRcIiApXG5cdFx0X3YgPSBAX2VkaXR2YWwgPSBAcmVzdWx0LmdldCggX2lkICkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFxuXHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggX2lkIClcblx0XHRAc3ViLnJlb3BlbigpXG5cdFx0XG5cdFx0QHNlYXJjaChfdilcblx0XHRyZXR1cm5cblx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IHN1cGVyXG5cdFx0aWYgQF9lZGl0dmFsPy5sZW5ndGhcblx0XHRcdF9kYXRhLmlucHZhbCA9IEBfZWRpdHZhbFxuXHRcdFx0QF9lZGl0dmFsID0gbnVsbFxuXHRcdHJldHVybiBfZGF0YVxuXHRcblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIEB0ZW1wbGF0ZVJlc0xpKCB0eHQ6IG1vZGVsLmdldExhYmVsKCksIGlkOiBtb2RlbC5pZCwgY3VzdG9tOiBtb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSAgKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XHRcblx0c2VsZWN0OiA9PlxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF92YWxzID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBfdmFscz8gYW5kIG5vdCBfLmlzQXJyYXkoIF92YWxzIClcblx0XHRcdF92YWxzID0gWyBfdmFscyBdXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0Zm9yIF92YWwgaW4gKCBpZiBAc2VsZWN0Q291bnQgPD0gMCB0aGVuIF92YWxzIGVsc2UgX3ZhbHNbLi4uQHNlbGVjdENvdW50XSApXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0XG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHQjIGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0IyBcdF9pZCA9IEByZXN1bHQubGFzdCgpPy5pZFxuXHRcdFx0IyBcdEBybVJlcyggX2lkIClcblx0XHRcdHN1cGVyXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRzZWFyY2hDb250ZW50ID0gQCRpbnAudmFsKClcblx0XHRpZiBzZWFyY2hDb250ZW50Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RBY3RpdmUoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdEBsb2FkaW5nID0gdHJ1ZVxuXHRcdFx0X2NvbGwgPSBuZXcgQG9wdENvbGwoIFtdIClcblx0XHRcdFxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QCRlbC5wYXJlbnQoKS5hZGRDbGFzcyggXCJsb2FkaW5nXCIgKVxuXHRcdFx0XHRvcHRpb25zIEByZXN1bHQsIEBtb2RlbCwgKCBhT3B0cyApPT5cblx0XHRcdFx0XHRmb3IgX29wdCwgaWR4IGluIGFPcHRzXG5cdFx0XHRcdFx0XHRhT3B0c1tpZHhdID0gXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgX29wdCwgeyBjdXN0b206IGZhbHNlIH0gKVxuXHRcdFx0XHRcdF9jb2xsLmFkZCggYU9wdHMgKVxuXHRcdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0XHRAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzKCBcImxvYWRpbmdcIiApXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XG5cdFx0XHQsIDAgKVxuXHRcdFx0cmV0dXJuIF9jb2xsXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3Qob3B0KVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIG5ldyBAb3B0Q29sbCggX29wdHMgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheVxuIiwiY2xhc3MgRmFjZXRTdWJzTnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRcdEAkaW5wT3AucmVtb3ZlKClcblx0XHRcdEAkaW5wT3AgPSBudWxsXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8ucmVsYXRlZFRhcmdldD9cblx0XHRcdF9wb3NXcnAgPSBAZWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgKVxuXHRcdFx0aWYgbm90ICggX3Bvc1dycCBpcyAwIG9yIF9wb3NXcnAgLSAxNiA+PSAwIClcblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRpZiBldm50PyBhbmQgKCBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wLmdldCgwKSBvciBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wT3A/LmdldCgwKSApXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QG1vZGVsLnNldCggeyBvcGVyYXRvcjogQCRpbnBPcC52YWwoKSB9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblxuXHRfb3BTZWxlY3RlZDogPT5cblx0XHRAc2VsZWN0ZWRPUCA9IHRydWVcblx0XHRAZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdGlmIEAkaW5wT3A/IGFuZCBub3QgQHNlbGVjdGVkT1Bcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRfb2xkT3AgPSBAcmVzdWx0LmZpcnN0KClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICksIG9wZXJhdG9yOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKX0gKVxuXG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuIHRydWVcblx0XHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0X3JldCA9XG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdFx0XHRvcGVyYXRvcjogQCRpbnBPcC52YWwoKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRyZXR1cm4gX3JldFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNOdW1iZXJcbiIsImNsYXNzIEZhY2V0U3Vic1JhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yYW5nZS5qYWRlXCIgKVxuXG5cdF9nZXRJbnBTZWxlY3RvcjogKCBleHQgPSBcIl9mcm9tXCIgKT0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfSN7ZXh0fVwiXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwic2VsZWN0XCJcblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdHJldHVybiBcIjxsaT5cIiArX3Jlcy52YWx1ZS5qb2luKCBcIiAtIFwiICkgKyBcIjwvbGk+XCJcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucFRvID0gQCRlbC5maW5kKCBAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICkgKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdF9vbGRWYWwgPSBAcmVzdWx0LmZpcnN0KCkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8gYW5kICggZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucC5nZXQoMCkgb3IgZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucFRvLmdldCgwKSApXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Y2xvc2U6ID0+XG5cdFx0dHJ5XG5cdFx0XHRAJCggXCIucmFuZ2VpbnBcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdF9yZXQgPVxuXHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92RnJvbSA9IHN1cGVyXG5cdFx0X3YgPSBAJGlucFRvLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0X3ZUbyA9IHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdFx0cmV0dXJuIFsgX3ZGcm9tLCBfdlRvIF1cblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGlmIEAkaW5wLmlzKCBldm50LnRhcmdldCApIGFuZCBub3QgZXZudC5zaGlmdEtleVxuXHRcdFx0QCRpbnBUby5mb2N1cygpXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0XHRpZiBAJGlucFRvLmlzKCBldm50LnRhcmdldCApIGFuZCBldm50LnNoaWZ0S2V5XG5cdFx0XHRAJGlucC5mb2N1cygpXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIF92YWw/Lmxlbmd0aCA+PSAyXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFxuXHRcdCMgcmV0dXJuIGZhbHNlIHRvIHByZXZlbnQganVtcCB0byBuZXh0IGZhY2V0XG5cdFx0cmV0dXJuIHRydWVcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzU2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3NlbGVjdC5qYWRlXCIgKVxuXG5cdGZvcmNlZE1vZHVsZU9wdHM6e31cblx0I1x0bXVsdGlwbGU6IHRydWVcblxuXHRkZWZhdWx0TW9kdWxlT3B0czpcblx0XHQjbWF4aW11bVNlbGVjdGlvbkxlbmd0aDogMVxuXHRcdHdpZHRoOiBcImF1dG9cIlxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHRcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAY29udmVydFZhbHVlVG9JbnQgPSBAX2NoZWNrSW50VmFsdWUoIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0ge31cblx0XHRfZXZudHNbIFwiY2xpY2sgLnNlbGVjdC1jaGVja1wiIF0gPSBcInNlbGVjdFwiIGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cdF9nZXRJbnBTZWxlY3RvcjogPT5cblx0XHRyZXR1cm4gXCJzZWxlY3QjI3tAY2lkfVwiXG5cdFx0XG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHQjIHByZXZlbnQgZnJvbSBhc3luYyBsaXN0ZW5pbmcgb24gbWFudWFsIGFjY2Vzc1xuXHRcdEBtb2RlbC5zZXQoIFwid2FpdEZvckFzeW5jXCIsIGZhbHNlIClcblx0XHRAX2luaXRTZWxlY3QyKClcblx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLnNob3coKVxuXHRcdEBzZWxlY3QyLm9wZW4oKVxuXHRcdCNlbHNlXG5cdFx0XHQjQCRpbnAuc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdHJldHVybiBzdXBlclxuXHRcblx0X2lzRnVsbDogPT5cblx0XHRpZiBAc2VsZWN0Q291bnQgPD0gMFxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuICggQHJlc3VsdCBvciBbXSkubGVuZ3RoID49IEBzZWxlY3RDb3VudFxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdGlmIEBfaXNGdWxsKClcblx0XHRcdHJldHVyblxuXHRcdCMgc2V0IHRoZSBjdXJyZW50IHZhbHVlc1xuXHRcdF9vbGRWYWxzID0gQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbHMgKVxuXHRcdFxuXHRcdCMgcmVzZXQgcmVzdWx0cyBhbmQgc2VsZWN0MlxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KClcblx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLm9mZigpXG5cdFx0QHNlbGVjdDIuZGVzdHJveSgpXG5cdFx0QHJlc3VsdC5yZXNldCgpXG5cdFx0QHNlbGVjdDIgPSBudWxsXG5cdFx0XG5cdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdF9jaGVja0ludFZhbHVlOiAoIF9vcHRzID0gW10gKT0+XG5cdFx0aWYgbm90IF9vcHRzIG9yIG5vdCBfb3B0cy5sZW5ndGhcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdGZvciBfdiBpbiBfb3B0c1xuXHRcdFx0aWYgX3YudmFsdWU/IGFuZCBfLmlzU3RyaW5nKCBfdi52YWx1ZSApXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgX3YuaWQ/IGFuZCBfLmlzU3RyaW5nKCBfdi5pZCApXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgX3Y/IGFuZCBfLmlzU3RyaW5nKCBfdiApXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XG5cdFx0cmV0dXJuIHRydWVcblxuXHRfaW5pdFNlbGVjdDI6ID0+XG5cdFx0XG5cdFx0aWYgbm90IEBzZWxlY3QyP1xuXHRcdFx0X29wdHMgPSBfLmV4dGVuZCgge30sIEBkZWZhdWx0TW9kdWxlT3B0cywgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICkgb3IgZmFsc2UgfSwgQGZvcmNlZE1vZHVsZU9wdHMgKVxuXHRcdFx0QCRpbnAuc2VsZWN0MiggX29wdHMgKVxuXHRcdFx0QHNlbGVjdDIgPSBAJGlucC5kYXRhKCBcInNlbGVjdDJcIiApXG5cdFx0XHRpZiBub3QgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRcdFx0QCRpbnAub24gXCJzZWxlY3QyOnNlbGVjdCBzZWxlY3QyOmNsb3NlXCIsIEBzZWxlY3Rcblx0XHRcdFxuXHRcdFx0IyBhZnRlciBsb2FkaW5nIHRyeSB0byBzZXQgdGhlIGN1cnNvciBmb2N1c1xuXHRcdFx0QHNlbGVjdDIub24gXCJyZXN1bHRzOmFsbFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdEBjb252ZXJ0VmFsdWVUb0ludCA9IEBfY2hlY2tJbnRWYWx1ZSggcmVzdWx0cz8uZGF0YT8ucmVzdWx0cyApXG5cdFx0XHRcdEBzZWxlY3QyLnNlbGVjdGlvbj8uJHNlYXJjaD8uZm9jdXM/KClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRcdCMgbGlzdGVuIHRvIGFzeW5jIHJlc3VsdCBjaGFuZ2VzIGFuZCBzZXQgdGhlIHNlbGVjdGlvblxuXHRcdFx0QHNlbGVjdDIuZGF0YUFkYXB0ZXIuY3VycmVudCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdGlmIEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0XHRcdF9kYXRhID0gW11cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgcmVzdWx0IGluIHJlc3VsdHNcblx0XHRcdFx0XHRcdF9kYXRhLnB1c2ggQF9jb252ZXJ0VmFsdWUoIHJlc3VsdCApXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHQjIHNlbGVjdCB0aGUgYWN0aXZlL3ByZWRlZmluZWQgcmVzdWx0c1xuXHRcdFx0XHRcdEBfc2VsZWN0KCBfZGF0YSApXG5cdFx0XHRcdFx0QGNsb3NlKClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdEBzZWxlY3QyLiRlbGVtZW50LmhpZGUoKVxuXHRcdFx0IyQoIGRvY3VtZW50ICkub24gQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuIEBzZWxlY3QyXG5cblx0X3NlbDJvcGVuOiAoIGV2bnQgKS0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0cmVtb3ZlOiA9PlxuXHRcdCNAJGlucC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdF9kYXRhID0gXy5leHRlbmQoIHt9LCBzdXBlciwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICksIG9wdGlvbnM6IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggQG1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApIH0gKVxuXHRcdGlmIF9kYXRhLnZhbHVlPyBhbmQgXy5pc0FycmF5KCBfZGF0YS52YWx1ZSApXG5cdFx0XHRmb3IgX3YsIF9pZHggaW4gX2RhdGEudmFsdWVcblx0XHRcdFx0X2RhdGEudmFsdWVbIF9pZHggXSA9IGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIF92ICkgZWxzZSBfdi50b1N0cmluZygpXG5cdFx0ZWxzZSBpZiBfZGF0YS52YWx1ZT9cblx0XHRcdF9kYXRhLnZhbHVlID0gWyBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfZGF0YS52YWx1ZSApIGVsc2UgX2RhdGEudmFsdWUudG9TdHJpbmcoKSBdXG5cdFx0XG5cdFx0aWYgX2RhdGEudmFsdWU/XG5cdFx0XHRfdmxpc3QgPSBfLnBsdWNrKCBfZGF0YS5vcHRpb25zLCBcInZhbHVlXCIgKVxuXHRcdFx0Zm9yIF92IGluIF9kYXRhLnZhbHVlIHdoZW4gX3Ygbm90IGluIF92bGlzdFxuXHRcdFx0XHRfZGF0YS5vcHRpb25zLnB1c2ggeyB2YWx1ZTogKCBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfdiApIGVsc2UgX3YudG9TdHJpbmcoKSApLCBsYWJlbDogX3YsIGdyb3VwOiB1bmRlZmluZWQgfVxuXHRcdFxuXHRcdF9ncm91cHMgPSBfLmdyb3VwQnkoIF9kYXRhLm9wdGlvbnMsIFwiZ3JvdXBcIiApXG5cdFx0aWYgXy5jb21wYWN0KCBfLmtleXMoIF9ncm91cHMgb3Ige30gKSApLmxlbmd0aCA+IDFcblx0XHRcdF9kYXRhLm9wdGlvbkdyb3VwcyA9IF9ncm91cHNcblx0XHRyZXR1cm4gX2RhdGFcblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogKCBjcmVhdGUgKT0+XG5cdFx0aWYgY3JlYXRlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gQG1vZGVsLmdldChcIm11bHRpcGxlXCIpXG5cdFxuXHRfaGFzVGFiRXZlbnQ6IC0+XG5cdFx0cmV0dXJuIFwia2V5dXBcIlxuXHRcdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdmFscyA9IFtdXG5cdFx0Zm9yIGRhdGEgaW4gQF9pbml0U2VsZWN0MigpPy5kYXRhKCkgb3IgW11cblx0XHRcdFxuXHRcdFx0X3ZhbHMucHVzaCggQF9jb252ZXJ0VmFsdWUoIGRhdGEgKSApXG5cdFx0cmV0dXJuIF92YWxzXG5cdFxuXHRfY29udmVydFZhbHVlOiAoIGRhdGEgKT0+XG5cdFx0X2RhdGEgPSB7fVxuXHRcdGlmIEBjb252ZXJ0VmFsdWVUb0ludFxuXHRcdFx0X2RhdGEudmFsdWUgPSBwYXJzZUZsb2F0KCBkYXRhLmlkIClcblx0XHRlbHNlXG5cdFx0XHRfZGF0YS52YWx1ZSA9IGRhdGEuaWRcblx0XHRpZiBkYXRhLnRleHQ/XG5cdFx0XHRpZiBkYXRhLnRleHQgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdFx0X2RhdGEubGFiZWwgPSBkYXRhLnRleHQuaHRtbCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0XG5cdFx0XHRcblx0XHRyZXR1cm4gX2RhdGFcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiAoIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIG9wdCApIGVsc2Ugb3B0LnRvU3RyaW5nKCkgKSwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCBvcHQgKVxuXHRcdFx0XHRvcHQudmFsdWUgPSBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBvcHQudmFsdWUgKSBlbHNlIG9wdC52YWx1ZS50b1N0cmluZygpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gX29wdHNcblxuXHR1bnNlbGVjdDogKCBldm50ICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdGlmIEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgQHNlbGVjdDI/XG5cdFx0XHQjQHNlbGVjdDI/LmRlc3Ryb3koKVxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5oaWRlKClcblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRAJCggXCIuc2VsZWN0LWNoZWNrXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpIGlmIGV2bnQ/LnN0b3BQcm9wYWdhdGlvblxuXHRcdF92YWxzID0gQGdldFZhbHVlKClcblx0XHRpZiBub3QgX3ZhbHM/Lmxlbmd0aFxuXHRcdFx0IyBJc3N1ZSM0OSBpZiBub3RoaW5nIHdhcyBzZWxlY3RlZCBjbG9zZSB0aGUgc2VsZWN0LXZpZXcgYW5kIHJlbW92ZSB0aGUgd2hvbGUgZmFjZXRcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRpZiBub3QgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRcdEBzdWIuZGVsKClcblx0XHRcdHJldHVyblxuXHRcdEBfc2VsZWN0KCBfdmFscyApXG5cblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcblx0X3NlbGVjdDogKCBfdmFscyApPT5cblx0XHRAbW9kZWwuc2V0KCBcIndhaXRGb3JBc3luY1wiLCBmYWxzZSApXG5cdFx0TW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0Zm9yIF92YWwgaW4gX3ZhbHNcblx0XHRcdEByZXN1bHQuYWRkKCBuZXcgTW9kZWxDb25zdCggX3ZhbCApIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAcmVzdWx0IClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNTZWxlY3RcbiIsImNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3N0cmluZy5qYWRlXCIgKVxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRzdXBlclxuXHRcdHRyeVxuXHRcdFx0QCRpbnA/LnJlbW92ZT8oKVxuXHRcdHJldHVyblxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdF9vbGRWYWwgPSBAcmVzdWx0Py5maXJzdCgpPy5nZXQoIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJTdHJpbmdcbiIsIlN1YlZpZXcgPSByZXF1aXJlKCBcIi4vc3ViXCIgKVxuU2VsZWN0b3JWaWV3ID0gcmVxdWlyZSggXCIuL3NlbGVjdG9yXCIgKVxuXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIE1haW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy93cmFwcGVyLmphZGVcIiApXG5cblx0ZXZlbnRzOlxuXHRcdFwibW91c2Vkb3duIC5zZWFyY2gtYnRuXCI6IFwiX29uU2VhcmNoXCJcblx0XHRcImZvY3VzIC5zZWFyY2gtYnRuXCI6IFwiX29uRm9jdXNTZWFyY2hcIlxuXHRcdFwiY2xpY2sgLmFkZC1mYWNldC1idG5cIjogXCJfYWRkRmFjZXRcIlxuXHRcdFwiY2xpY2tcIjogXCJfYWRkRmFjZXRcIlxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRcblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdEBpZHggPSBvcHRpb25zLmlkeFxuXHRcdEByZXN1bHRzID0gb3B0aW9ucy5yZXN1bHRzXG5cdFx0QHNlYXJjaEJ1dHRvbiA9IG9wdGlvbnMuc2VhcmNoQnV0dG9uXG5cdFx0XG5cdFx0QGZhY2V0cyA9IHt9XG5cdFx0XG5cdFx0QGNvbGxlY3Rpb24ub24gXCJpZ2d5OnJlbVwiLCBAcmVtRmFjZXRcblx0XHRcblx0XHRfY2wgPSBcImlnZ3kgY2xlYXJmaXhcIlxuXHRcdGlmIEBlbC5jbGFzc05hbWU/Lmxlbmd0aFxuXHRcdFx0X2NsID0gXCIgXCIgKyBfY2xcblx0XHRAZWwuY2xhc3NOYW1lICs9IF9jbFxuXHRcdEByZW5kZXIoKVxuXHRcdEBfb3V0ZXJDbGlja0xpc3RlbigpXG5cdFx0QF9rZXlMaXN0ZW4oKVxuXHRcdFxuXHRcdF92YWx1ZUZhY2V0cyA9IEBjb2xsZWN0aW9uLmZpbHRlciggKCBmY3QgKS0+cmV0dXJuIGZjdD8uZ2V0KCBcInZhbHVlXCIgKT8gb3IgZmN0Py5nZXQoIFwicGlubmVkXCIgKSApXG5cdFx0XG5cdFx0X2ZuU29ydCA9ICgga2V5ICktPlxuXHRcdFx0cmV0dXJuICggdjEsIHYyICktPlxuXHRcdFx0XHRpZiB2MVsga2V5IF0gPiB2Mlsga2V5IF1cblx0XHRcdFx0XHRyZXR1cm4gMVxuXHRcdFx0XHRpZiB2MVsga2V5IF0gPCB2Mlsga2V5IF1cblx0XHRcdFx0XHRyZXR1cm4gLTFcblx0XHRcdFx0cmV0dXJuIDBcblx0XHRcblx0XHRmb3IgZmN0IGluIF92YWx1ZUZhY2V0cy5zb3J0KCBfZm5Tb3J0KCBcIl9pZHhcIiApIClcblx0XHRcdEBnZW5TdWIoIGZjdCwgZmFsc2UsIHRydWUgKVxuXHRcdFxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiYWRkXCIsID0+XG5cdFx0XHRAJGFkZEJ0bi5zaG93KClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRfYWN0aXZlID0gQGNvbGxlY3Rpb24uZmlsdGVyKCAoIGZjdCApLT5yZXR1cm4gZmN0Py5nZXQoIFwiYWN0aXZlXCIgKSBhbmQgZmN0Py5nZXQoIFwicGlubmVkXCIgKSApXG5cdFx0XHRpZiBfYWN0aXZlLmxlbmd0aFxuXHRcdFx0XHR2aWV3ID0gQGZhY2V0c1sgX2FjdGl2ZVsgMCBdLmlkIF1cblx0XHRcdFx0I0BzdWJ2aWV3ID0gdmlld1xuXHRcdFx0XHR2aWV3Py5yZW9wZW4oKVxuXHRcdFx0XHR2aWV3Py5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHQsIDAgKVxuXHRcdFxuXHRcdHJldHVyblxuXHRcblx0dGVtcGxhdGVEYXRhOiA9PlxuXHRcdF9yZXQgPVxuXHRcdFx0dGFiX2luZGV4OiAoICggKCBAaWR4IG9yIDEgKSArIDEgKSAqIDEwMDAgKSAtIDEwXG5cdFx0aWYgIEBzZWFyY2hCdXR0b24/XG5cdFx0XHRfcmV0LnNlYXJjaEJ1dHRvbiA9XG5cdFx0XHRcdHRlbXBsYXRlOiBAc2VhcmNoQnV0dG9uLnRlbXBsYXRlIG9yIFwiXCJcblx0XHRcdFx0ZXZlbnQ6IEBzZWFyY2hCdXR0b24uZXZlbnQgb3IgXCJzZWFyY2hcIlxuXHRcdFx0XHRwdWxscmlnaHQ6IEBzZWFyY2hCdXR0b24ucHVsbHJpZ2h0IG9yIGZhbHNlXG5cdFx0XHRcdGNzc2NsYXNzOiBAc2VhcmNoQnV0dG9uLmNzc2NsYXNzIG9yIFwiYnRuIGJ0bi1wcmltYXJ5IGZhIGZhLXNlYXJjaFwiXG5cdFx0XG5cdFx0cmV0dXJuIF9yZXRcblx0XG5cdHJlbmRlcjogPT5cblx0XHRfdHBsRGF0YSA9IEB0ZW1wbGF0ZURhdGEoKVxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCBfdHBsRGF0YSApIClcblx0XHRAJGFkZEJ0biA9IEAkKCBcIi5hZGQtZmFjZXQtYnRuXCIgKVxuXHRcdGlmIF90cGxEYXRhLnNlYXJjaEJ1dHRvbj9cblx0XHRcdEAkc2VhcmNoQnRuID0gQCQoIFwiLnNlYXJjaC1idG5cIiApXG5cdFx0cmV0dXJuXG5cblx0X2FkZEZhY2V0OiAoIGV2bnQgKT0+XG5cdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRleGl0OiAoIG5leHRBZGQgPSB0cnVlICk9PlxuXHRcdGlmIEBzdWJ2aWV3XG5cdFx0XHRAc3Vidmlldy5jbG9zZSgpXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIG5leHRBZGRcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHQjY29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTRUxFQ1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuY2xvc2UoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW1GYWNldDogKCBmYWNldE0gKT0+XG5cdFx0QHJlc3VsdHMucmVtb3ZlKCBmYWNldE0uZ2V0KCBcIm5hbWVcIiApIClcblx0XHRyZXR1cm5cblxuXHRzZXRGYWNldDogKCBmYWNldE0sIGRhdGEgKT0+XG5cdFx0QGNvbGxlY3Rpb24ucmVtb3ZlKCBmYWNldE0gKVxuXG5cdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggZGF0YSwgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDogZmFjZXRNIH0gKVxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdEAkYWRkQnRuLmhpZGUoKVxuXHRcdHJldHVyblxuXG5cdGdlblN1YjogKCBmYWNldE0sIGFkZEFmdGVyID0gdHJ1ZSwgaW5pdGlhbEFkZD1mYWxzZSApPT5cblx0XHRzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBwYXJlbnQ6IEAgKVxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiZ2VuU3ViIC0gY2xvc2VkXCIsIHJlc3VsdHMsIHN1YnZpZXcubW9kZWwuaWRcblx0XHRcdGlmIHN1YnZpZXc/Lm1vZGVsPy5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVUIgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHQjc3Vidmlldy5vZmYoKVxuXHRcdFx0c3Vidmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIGFkZEFmdGVyXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwicmVvcGVuXCIsID0+XG5cdFx0XHRAc2VsZWN0dmlldz8uY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfc2VsZiA9IEBcblx0XHRzdWJ2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0sIGRhdGEgKS0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJzdWJ2aWV3IC0gc2VsZWN0ZWRcIiwgQFxuXHRcdFx0X3NlbGYuc2V0RmFjZXQoIGZhY2V0TSwgZGF0YSApXG5cdFx0XHRpZiBub3QgQHNlbGVjdHZpZXcuX2lzRnVsbD8gb3IgQHNlbGVjdHZpZXcuX2lzRnVsbCgpXG5cdFx0XHRcdF9zZWxmLl9uZXh0RmFjZXQoIG51bGwsIEAgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBzdWJ2aWV3LnJlbmRlciggaW5pdGlhbEFkZCApIClcblx0XHRAZmFjZXRzWyBmYWNldE0uaWQgXSA9IHN1YnZpZXdcblx0XHRyZXR1cm4gc3Vidmlld1xuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNFTEVDVCBFWElTVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBzdWJ2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNVQiBFWElTVFwiXG5cdFx0XHRAc3Vidmlldy5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSwgbWFpbjogQCApXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcIm9wZW5lZFwiLCA9PlxuXHRcdFx0QF9vbk9wZW5lZCgpXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdEBfb25DbG9zZWQoKVxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU0VMRUNUIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRpZiBub3QgcmVzdWx0cz8ubGVuZ3RoIGFuZCBAc3Vidmlldz9cblx0XHRcdFx0I0BzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNICk9PlxuXHRcdFx0ZmFjZXRNLnNldCggXCJ2YWx1ZVwiLCBudWxsIClcblx0XHRcdEBzdWJ2aWV3ID0gQGdlblN1YiggZmFjZXRNIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXHRcdFx0cmV0dXJuXG5cdFxuXHRcdEAkYWRkQnRuLmJlZm9yZSggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRyZXR1cm5cblx0XG5cdF9vbk9wZW5lZDogPT5cblx0XHRAJGFkZEJ0bj8uaGlkZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25DbG9zZWQ6ID0+XG5cdFx0QCRhZGRCdG4/LnNob3coKVxuXHRcdHJldHVyblxuXHRcblx0X291dGVyQ2xpY2tMaXN0ZW46ID0+XG5cdFx0alF1ZXJ5KCBkb2N1bWVudCApLm9uIFwiY2xpY2tcIiwgQF9vdXRlckNsaWNrXG5cdFx0cmV0dXJuXG5cdFxuXHRfa2V5TGlzdGVuOiA9PlxuXHRcdGpRdWVyeSggZG9jdW1lbnQgKS5vbiBcImtleWRvd25cIiwgKCBldm50ICk9PlxuXHRcdFx0aWYgZXZudC5rZXlDb2RlIGlzIEtFWUNPREVTLlRBQiBvciBldm50LmtleUNvZGUgaW4gS0VZQ09ERVMuVEFCXG5cdFx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgJCggZXZudC50YXJnZXQgKS5pcyggXCIuc2VhcmNoLWJ0blwiIClcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRcdFx0QGFkZEZhY2V0KClcblx0XHRcdFx0XHQsIDAgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFxuXHRcdFx0XHQjIGNhc2Ugb25seSB0aGUgZmFjZXQgc2VsZWN0b3IgaXMgb3BlblxuXHRcdFx0XHRpZiBAc2VsZWN0dmlldz8uaXNPcGVuXG5cdFx0XHRcdFx0aWYgZXZudD8uc2hpZnRLZXlcblx0XHRcdFx0XHRcdF9wcmV2SWQgPSBAJGFkZEJ0bj8ucHJldkFsbCggXCIuc3ViXCIgKT8uZmlyc3QoKT8uZGF0YSggXCJmY3RpZFwiIClcblx0XHRcdFx0XHRcdGlmIF9wcmV2SWQ/XG5cdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdFx0XHRcdFx0QGZhY2V0c1sgX3ByZXZJZCBdPy5yZW9wZW4oKVxuXHRcdFx0XHRcdFx0XHQsIDAgKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdFx0XHRcdEBmb2N1c1NlYXJjaCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdFx0IyBvdGhlcndpc2UgdHJpZ2dlciBlc2NhcGUgZXZlbnQgYW5kIGxpc3RlbiBmb3IgdGhlIHJlc3BvbnNlIG9mIHRoZSBvcGVuIGZhY2V0XG5cdFx0XHRcdEB0cmlnZ2VyIFwiZXNjYXBlXCIsIGV2bnQsIEBfbmV4dEZhY2V0XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0aWYgZXZudC5rZXlDb2RlIGlzIEtFWUNPREVTLkVTQyBvciBldm50LmtleUNvZGUgaW4gS0VZQ09ERVMuRVNDXG5cdFx0XHRcdEBleGl0KClcblx0XHRcdFx0QHRyaWdnZXIoIFwiZXNjYXBlXCIsIGV2bnQgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0X25leHRGYWNldDogKCBldm50LCBzdWJWaWV3ICk9PlxuXHRcdF9uZXh0Rm4gPSBpZiBldm50Py5zaGlmdEtleSB0aGVuIFwicHJldlwiIGVsc2UgXCJuZXh0XCJcblx0XHRfbmV4dCA9IHN1YlZpZXcuJGVsP1sgX25leHRGbiBdPygpXG5cdFx0XG5cdFx0aWYgX25leHQuaGFzQ2xhc3MoIFwiYWRkLWZhY2V0LWJ0blwiIClcblx0XHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdEBhZGRGYWNldCgpXG5cdFx0XHQsIDAgKVxuXHRcdFx0cmV0dXJuXG5cdFx0X25leHRJZCA9IF9uZXh0Py5kYXRhKCBcImZjdGlkXCIgKVxuXHRcdGlmIF9uZXh0SWQ/XG5cdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRAZmFjZXRzWyBfbmV4dElkIF0/LnJlb3BlbigpXG5cdFx0XHQsIDAgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRmb2N1c1NlYXJjaDogPT5cblx0XHRpZiBAJHNlYXJjaEJ0bj9cblx0XHRcdEAkc2VhcmNoQnRuLmZvY3VzKClcblx0XHRyZXR1cm5cblx0XHRcblx0X29uU2VhcmNoOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEBleGl0KClcblx0XHRAdHJpZ2dlciggXCJzZWFyY2hidXR0b25cIiwgQHNlYXJjaEJ1dHRvbi5ldmVudCApXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25Gb2N1c1NlYXJjaDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAc2VsZWN0dmlldz8uY2xvc2U/KClcblx0XHRyZXR1cm5cblx0XHRcblx0X291dGVyQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0X3Bvc1dycCA9IEBlbC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudC50YXJnZXQgKVxuXHRcdGlmIG5vdCAoIF9wb3NXcnAgaXMgMCBvciBfcG9zV3JwIC0gMTYgPj0gMCApXG5cdFx0XHRAZXhpdCggZmFsc2UgKVxuXHRcdHJldHVyblxuXHRcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluVmlld1xuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTZWxlY3RvclZpZXcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRzL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9yLmphZGVcIiApXG5cdHRlbXBsYXRlRWw6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3JsaS5qYWRlXCIgKVxuXHRzZWxlY3RDb3VudDogMVxuXG5cdGNsYXNzTmFtZTogPT5cblx0XHRjbHMgPSBbIFwiYWRkLWZhY2V0XCIgXVxuXHRcdGlmIEBjdXN0b21cblx0XHRcdGNscy5wdXNoIFwiY3VzdG9tXCJcblx0XHRyZXR1cm4gY2xzLmpvaW4oIFwiIFwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJtb3VzZWRvd24gYVwiOiBcIl9vbkNsaWNrXCJcblx0XHRcImZvY3VzIGlucHV0IyN7QGNpZH1cIjogXCJvcGVuXCJcblx0XHQjXCJibHVyIGlucHV0IyN7QGNpZH1cIjogXCJjbG9zZVwiXG5cdFx0XCJrZXlkb3duIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAY3VzdG9tID0gb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0XG5cdFx0aWYgb3B0aW9ucy5tYWluP1xuXHRcdFx0QG1haW4gPSBvcHRpb25zLm1haW5cblx0XHRcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRzdXBlclxuXHRcdEBzZWFyY2hjb2xsID0gQGNvbGxlY3Rpb24uc3ViKCAtPnRydWUgKVxuXHRcdEByZXN1bHQgPSBuZXcgQGNvbGxlY3Rpb24uY29uc3RydWN0b3IoKVxuXHRcdFxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwiYWRkXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEBjaGVja09wdGlvbnNFbXB0eSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIGN1c3RvbTogQGN1c3RvbSApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRsaXN0ID0gQCRlbC5maW5kKCBcIiMje0BjaWR9dHlwZWxpc3RcIiApXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdHJlbmRlclJlczogPT5cblx0XHRAJGxpc3QuZW1wdHkoKVxuXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEBzZWFyY2hjb2xsLm1vZGVscyB3aGVuIG5vdCBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdF90bXBsID0gbW9kZWwuZ2V0KCBcImxhYmVsdGVtcGxhdGVcIiApXG5cdFx0XHRpZiBfdG1wbD9cblx0XHRcdFx0X2xibCA9IF90bXBsLnJlcGxhY2UoIFwie3tsYWJlbH19XCIsIF9sYmwgKVxuXHRcdFx0XHRcblx0XHRcdF9pZCA9IG1vZGVsLmlkXG5cdFx0XHRfY3NzY2xhc3MgPSBtb2RlbC5nZXQoIFwiY3NzY2xhc3NcIiApXG5cdFx0XHRpZiBAY3VyclF1ZXJ5Py5sZW5ndGggPiAxXG5cdFx0XHRcdF9sYmwgPSBfbGJsLnJlcGxhY2UoIG5ldyBSZWdFeHAoIEBjdXJyUXVlcnksIFwiZ2lcIiApLCAoKCBzdHIgKS0+cmV0dXJuIFwiPGI+I3tzdHJ9PC9iPlwiICkgKVxuXHRcdFx0X2xpc3QucHVzaCBsYWJlbDogX2xibCwgaWQ6IF9pZCwgY3NzY2xhc3M6IF9jc3NjbGFzc1xuXHRcdCNpZiBfbGlzdC5sZW5ndGhcblx0XHRAJGxpc3QuYXBwZW5kKCBAdGVtcGxhdGVFbChcblx0XHRcdGxpc3Q6IF9saXN0LFxuXHRcdFx0cXVlcnk6IEBjdXJyUXVlcnksXG5cdFx0XHRhY3RpdmVJZHg6IEBhY3RpdmVJZHgsXG5cdFx0XHRjdXN0b206IEBjdXN0b21cblx0XHQpIClcblxuXHRcdEBfY2hlY2tTY3JvbGwoKVxuXHRcdFxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRfc2Nyb2xsVGlsbDogMTk4XG5cdF9jaGVja1Njcm9sbDogPT5cblx0XHRfaGVpZ2h0ID0gQCRsaXN0LmhlaWdodCgpXG5cdFx0aWYgX2hlaWdodCA+IDBcblx0XHRcdEBzY3JvbGxIZWxwZXIoIF9oZWlnaHQgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGV4aXQgdGhlIHRoZSBjYWxsIHN0YWNrIHRvIGNoZWNrIGhlaWdodCBhZnRlciB0aGUgbW9kdWxlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBkb21cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHNjcm9sbEhlbHBlciggQCRsaXN0LmhlaWdodCgpIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXG5cdHNjcm9sbEhlbHBlcjogKCBoZWlnaHQgKT0+XG5cdFx0aWYgaGVpZ2h0ID49IEBfc2Nyb2xsVGlsbFxuXHRcdFx0QHNjcm9sbGluZyA9IHRydWVcblx0XHRlbHNlXG5cdFx0XHRAc2Nyb2xsaW5nID0gZmFsc2Vcblx0XHRyZXR1cm5cblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0aWYgbm90IF9pZD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX2lkIClcblx0XHRpZiBub3QgX21kbD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0QHNlbGVjdGVkKCBfbWRsIClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0cmV0dXJuIHRydWVcblx0XHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0aWYgQG1haW4/XG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBtYWluLmZvY3VzU2VhcmNoKClcblx0XHRlbHNlXG5cdFx0XHRzdXBlciggZXZlbnQgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3RlZDogKCBtZGwgKT0+XG5cdFx0aWYgbm90IEBtYWluPyBhbmQgQF9pc0Z1bGwoKVxuXHRcdFx0X2lkID0gQHJlc3VsdC5sYXN0KCk/LmlkXG5cdFx0XHRAcm1SZXMoIF9pZCApXG5cdFx0XHRcblx0XHR0cnlcblx0XHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdFx0bWRsPy5leGVjPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdGNhdGNoIF9lcnJcblx0XHRcdHRyeVxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBhY3RpdmVJZHg6I3tAYWN0aXZlSWR4fSAtIGNvbGxlY3Rpb246I3tKU09OLnN0cmluZ2lmeSggQGNvbGxlY3Rpb24udG9KU09OKCkpfVwiXG5cdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIXCJcblx0XHRcblx0XHRpZiBtZGw/XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIG1kbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogPT5cblx0XHRAJGlucC5mb2N1cygpXG5cdFx0X2VsID0gQCRpbnAuZ2V0KDApXG5cdFx0XG5cdFx0X2VsLnNlbGVjdGlvblN0YXJ0ID0gX2VsLnNlbGVjdGlvbkVuZCA9IF9lbC52YWx1ZS5sZW5ndGhcblx0XHRyZXR1cm5cblx0XG5cdG9wZW46ID0+XG5cdFx0I2NvbnNvbGUubG9nIFwic2VsZWN0b3Igb3BlblwiXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3RBY3RpdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgXy5pc1N0cmluZyggZXZudCApXG5cdFx0XHRfcSA9IGV2bnRcblx0XHRlbHNlXG5cdFx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKT0+XG5cdFx0XHRpZiBAcmVzdWx0LmdldCggbWRsLmlkICk/XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgbm90IF9xPy5sZW5ndGhcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdF9tYXRjaCA9IG1kbC5tYXRjaCggX3EgKVxuXHRcdFx0cmV0dXJuIF9tYXRjaFxuXHRcdCwgZmFsc2UgKVxuXG5cblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblx0XG5cdFx0X2N1c3RvbUVsZW1lbnRDaGFuZ2UgPSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGggdGhlbiAwIGVsc2UgMVxuXHRcdF90b3AgPSAwXG5cdFx0aWYgdXBcblx0XHRcdGlmICggQGFjdGl2ZUlkeCAtIDEgKSA8IF90b3Bcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCAtIDFcblx0XHRlbHNlXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggLSBfY3VzdG9tRWxlbWVudENoYW5nZSA8PSBAYWN0aXZlSWR4XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggKyAxXG5cblx0XHRcblx0XHRAJCggX2xpc3RbIEBhY3RpdmVJZHggXSApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiIClcblx0XHRfJGVsbmV3ID0gQCQoIF9saXN0WyBfbmV3aWR4IF0gKS5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG5cblx0XHRpZiBAc2Nyb2xsaW5nXG5cdFx0XHRfZWxIID0gXyRlbG5ldy5vdXRlckhlaWdodCgpXG5cdFx0XHRfcG9zID0gX2VsSCAqICggX25ld2lkeCArIDEgKVxuXHRcdFx0XyRsaXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdFwiIClcblx0XHRcdF9zY3JvbGxUID0gXyRsaXN0LnNjcm9sbFRvcCgpXG5cdFx0XHRpZiBfcG9zID4gX3Njcm9sbFQgKyBAX3Njcm9sbFRpbGxcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIEBfc2Nyb2xsVGlsbCApXG5cdFx0XHRlbHNlIGlmIF9wb3MgPCBfc2Nyb2xsVCArIF9lbEhcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIF9lbEggKVxuXG5cdFx0QGFjdGl2ZUlkeCA9IF9uZXdpZHhcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6PT5cblx0XHRyZXR1cm5cblxuXHRzZWxlY3RBY3RpdmU6ICggaXNFbnRlckV2ZW50PWZhbHNlICk9PlxuXHRcdGlmIG5vdCBAbWFpbj8gYW5kIEBfaXNGdWxsKClcblx0XHRcdF9pZCA9IEByZXN1bHQubGFzdCgpPy5pZFxuXHRcdFx0QHJtUmVzKCBfaWQgKVxuXHRcdFx0XHRcblx0XHRfc2VsID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhLmFjdGl2ZVwiICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKS5kYXRhKClcblx0XHRcdFxuXHRcdF9zZWFyY2ggPSBAJGlucC52YWwoKVxuXHRcdFxuXHRcdGlmICBub3QgX3NlbD8gYW5kIEBzZWxlY3RDb3VudCBpc250IDEgYW5kIGlzRW50ZXJFdmVudCBhbmQgbm90IF9zZWFyY2g/Lmxlbmd0aFxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IF9zZWw/XG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdGlmIF9zZWw/LmlkeCA+PSAwIGFuZCBAc2VhcmNoY29sbC5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggQGNvbGxlY3Rpb24uZ2V0KCBfc2VsLmlkICkgKVxuXHRcdGVsc2UgaWYgQGN1cnJRdWVyeT8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IEBjdXJyUXVlcnksIGN1c3RvbTogdHJ1ZSApIClcblx0XHRcdEAkaW5wLnZhbCggXCJcIiApXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3XG4iLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiA9PlxuXHRcdF9zdGQgPSBcInN1YlwiXG5cdFx0X3R5cGUgPSBAbW9kZWwuZ2V0KCBcInR5cGVcIiApXG5cdFx0aWYgX3R5cGU/XG5cdFx0XHRfc3RkICs9IFwiIHN1Yi10eXBlLVwiICsgX3R5cGVcblx0XHRcblx0XHRfbmFtZSA9IEBtb2RlbC5nZXQoIFwibmFtZVwiIClcblx0XHRpZiBfbmFtZT9cblx0XHRcdF9zdGQgKz0gXCIgc3ViLW5hbWUtXCIgKyBfbmFtZVxuXHRcdHJldHVybiBfc3RkXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdEAkZWwub24gXCJjbGlja1wiLCBAcmVvcGVuXG5cdFx0QHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cdFx0XG5cdFx0QCRlbC5kYXRhKCBcImZjdGlkXCIsIEBtb2RlbC5pZCApXG5cdFx0XG5cdFx0QHBhcmVudC5vbiBcImVzY2FwZVwiLCAoIGV2bnQsIGNiICk9PlxuXHRcdFx0aWYgQF9pc09wZW5cblx0XHRcdFx0aWYgQHNlbGVjdHZpZXc/Ll9vblRhYkFjdGlvbiggZXZudCApXG5cdFx0XHRcdFx0Y2IoIGV2bnQsIEAgKSBpZiBjYj9cblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGV2ZW50czpcblx0XHRcImNsaWNrIC5ybS1mYWNldC1idG5cIjogXCJkZWxcIlxuXG5cdHJlbmRlcjogKCBpbml0aWFsQWRkICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0dHJ5XG5cdFx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0Y2F0Y2ggX2VyclxuXHRcdFx0XHR0cnlcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBtb2RlbDoje0pTT04uc3RyaW5naWZ5KEBtb2RlbC50b0pTT04oKSl9IC0gcmVzdWx0OiN7SlNPTi5zdHJpbmdpZnkoIEByZXN1bHQudG9KU09OKCkpfVwiXG5cdFx0XHRcdGNhdGNoIF9lcnJlcnJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSFwiXG5cdFx0XG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZVxuXHRcdFx0bGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRzZWxlY3RlZDogX2xpc3Rcblx0XHRcdHR5cGU6IEBtb2RlbC5nZXQoIFwidHlwZVwiIClcblx0XHRcdG5hbWU6IEBtb2RlbC5nZXQoIFwibmFtZVwiIClcblx0XHRcdHBpbm5lZDogQG1vZGVsLmdldCggXCJwaW5uZWRcIiApIG9yIGZhbHNlXG5cdFx0XHRcdFxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblxuXHRcdEBnZW5lcmF0ZVN1YiggaW5pdGlhbEFkZCApXG5cdFx0cmV0dXJuIEBlbFxuXHRcblx0cmVvcGVuOiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8gYW5kICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLnJtLXJlc3VsdC1idG5cIiApIGFuZCBAc2VsZWN0dmlldz8ucm1SZXM/XG5cdFx0XHRAc2VsZWN0dmlldy5ybVJlcyggZXZudCApXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgZXZudD8gYW5kICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLmVkaXQtcmVzdWx0LWJ0blwiICkgYW5kIEBzZWxlY3R2aWV3Py5lZGl0UmVzP1xuXHRcdFx0QHNlbGVjdHZpZXcuZWRpdFJlcyggZXZudCApXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IEBfaXNPcGVuIGFuZCBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3LnJlb3BlbiggQCApXG5cdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHRyaWdnZXIoIFwicmVvcGVuXCIgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRkZWw6ICggZXZudCApPT5cblx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAc2VsZWN0dmlldz8ucmVtb3ZlKClcblx0XHRAcGFyZW50ID0gbnVsbFxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsLCB7IG1lcmdlOiB0cnVlIH0gKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRyZXR1cm5cblx0XG5cdHJlbW92ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBvcHRNZGwgKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRcblx0XHQjIHJlbW92ZSBmYWNldCBpZiBjb250ZW50IGxlbmd0aCBvciB0aGUgZmFjZXQgaXMgaW4gZWRpdE1vZGVcblx0XHRpZiBAcmVzdWx0Lmxlbmd0aCA8PSAwIGFuZCBub3QgQHNlbGVjdHZpZXcuZWRpdE1vZGVcblx0XHRcdEBkZWwoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRAJHJlc3VsdHMuaHRtbCggQHNlbGVjdHZpZXcucmVuZGVyUmVzdWx0KCkgKVxuXHRcdHJldHVyblxuXG5cdGlzT3BlbjogPT5cblx0XHRyZXR1cm4gQHNlbGVjdHZpZXc/XG5cblx0Zm9jdXM6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QG9wZW4oKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGdlbmVyYXRlU3ViOiAoIGluaXRpYWxBZGQgKT0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAYXR0YWNoU3ViRXZlbnRzKClcblx0XHRcdHJldHVybiBAc2VsZWN0dmlld1xuXHRcdFx0XG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgQG1vZGVsLlN1YlZpZXcoIHN1YjogQCwgbW9kZWw6IEBtb2RlbCwgZWw6IEAkc3ViIClcblx0XHRAYXR0YWNoU3ViRXZlbnRzKClcblx0XHRcdFxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoIGluaXRpYWxBZGQgKSApXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApP1xuXHRcdFx0QHNlbGVjdHZpZXcuc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XHRcblx0YXR0YWNoU3ViRXZlbnRzOiA9PlxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0ICk9PlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU3ViIGNsb3NlZFwiLCBAc2VsZWN0dmlldy5tb2RlbC5pZFxuXHRcdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdFx0XG5cdFx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHQjQHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgcmVzdWx0IClcblx0XHRcdEByZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggbWRsICk9PlxuXHRcdFx0aWYgbWRsXG5cdFx0XHRcdEBzZWxlY3RlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwicmVtb3ZlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAcmVtb3ZlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cblx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdEBfaXNPcGVuID0gdHJ1ZVxuXHRcdFxuXHRcdCMgQHBhcmVudC5zdWJ2aWV3ID0gQFxuXHRcdCMgQHBhcmVudC5zZWxlY3R2aWV3ID0gQHNlbGVjdHZpZXdcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U3ViXG4iLCIiLCIoZnVuY3Rpb24oZil7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZigpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGYpfWVsc2V7dmFyIGc7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe2c9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe2c9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtnPXNlbGZ9ZWxzZXtnPXRoaXN9Zy5qYWRlID0gZigpfX0pKGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIGF0dHJzID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcblxuICBpZiAoYWMgfHwgYmMpIHtcbiAgICBhYyA9IGFjIHx8IFtdO1xuICAgIGJjID0gYmMgfHwgW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xuICB9XG5cbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbnVsbHModmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xufVxuXG4vKipcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKSA6XG4gICAgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JykgPyBPYmplY3Qua2V5cyh2YWwpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB2YWxba2V5XTsgfSkgOlxuICAgIFt2YWxdKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xuICB2YXIgYnVmID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufTtcblxuXG5leHBvcnRzLnN0eWxlID0gZnVuY3Rpb24gKHZhbCkge1xuICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbCkubWFwKGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgcmV0dXJuIHN0eWxlICsgJzonICsgdmFsW3N0eWxlXTtcbiAgICB9KS5qb2luKCc7Jyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XG4gIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICB2YWwgPSBleHBvcnRzLnN0eWxlKHZhbCk7XG4gIH1cbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodmFsKS5pbmRleE9mKCcmJykgIT09IC0xKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1NpbmNlIEphZGUgMi4wLjAsIGFtcGVyc2FuZHMgKGAmYCkgaW4gZGF0YSBhdHRyaWJ1dGVzICcgK1xuICAgICAgICAgICAgICAgICAgICd3aWxsIGJlIGVzY2FwZWQgdG8gYCZhbXA7YCcpO1xuICAgIH07XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBlbGltaW5hdGUgdGhlIGRvdWJsZSBxdW90ZXMgYXJvdW5kIGRhdGVzIGluICcgK1xuICAgICAgICAgICAgICAgICAgICdJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYnVmID0gW107XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG4gIGlmIChrZXlzLmxlbmd0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBqYWRlX2VuY29kZV9odG1sX3J1bGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90Oydcbn07XG52YXIgamFkZV9tYXRjaF9odG1sID0gL1smPD5cIl0vZztcblxuZnVuY3Rpb24gamFkZV9lbmNvZGVfY2hhcihjKSB7XG4gIHJldHVybiBqYWRlX2VuY29kZV9odG1sX3J1bGVzW2NdIHx8IGM7XG59XG5cbmV4cG9ydHMuZXNjYXBlID0gamFkZV9lc2NhcGU7XG5mdW5jdGlvbiBqYWRlX2VzY2FwZShodG1sKXtcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKS5yZXBsYWNlKGphZGVfbWF0Y2hfaHRtbCwgamFkZV9lbmNvZGVfY2hhcik7XG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcbiAgfVxuICB2YXIgY29udGV4dCA9IDNcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcblxuICAvLyBFcnJvciBjb250ZXh0XG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxuICAgICAgKyBjdXJyXG4gICAgICArICd8ICdcbiAgICAgICsgbGluZTtcbiAgfSkuam9pbignXFxuJyk7XG5cbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcbiAgdGhyb3cgZXJyO1xufTtcblxuZXhwb3J0cy5EZWJ1Z0l0ZW0gPSBmdW5jdGlvbiBEZWJ1Z0l0ZW0obGluZW5vLCBmaWxlbmFtZSkge1xuICB0aGlzLmxpbmVubyA9IGxpbmVubztcbiAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xufVxuXG59LHtcImZzXCI6Mn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XX0se30sWzFdKSgxKVxufSk7IiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX2dldEtleSwgaXNBcnJheSwgdG9TdHJpbmc7XG5cbiAgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxuICBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIF9nZXRLZXkgPSBmdW5jdGlvbihlbCwga2V5KSB7XG4gICAgcmV0dXJuIGVsW2tleV07XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXlzLCBmb3J3YXJkLCBnZXRLZXkpIHtcbiAgICB2YXIgZm5zb3J0LCByZWY7XG4gICAgaWYgKGZvcndhcmQgPT0gbnVsbCkge1xuICAgICAgZm9yd2FyZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChnZXRLZXkgPT0gbnVsbCkge1xuICAgICAgZ2V0S2V5ID0gX2dldEtleTtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5KGtleXMpKSB7XG4gICAgICBrZXlzID0gW2tleXNdO1xuICAgIH1cbiAgICBmbnNvcnQgPSBmdW5jdGlvbihmb3J3YXJkLCBrZXksIG5leHRrZXlzKSB7XG4gICAgICB2YXIgX2Z3cmQsIF9rLCBuZXh0U29ydCwgcmVmO1xuICAgICAgaWYgKG5leHRrZXlzICE9IG51bGwgPyBuZXh0a2V5cy5sZW5ndGggOiB2b2lkIDApIHtcbiAgICAgICAgX2sgPSAocmVmID0gbmV4dGtleXMuc3BsaWNlKDAsIDEpKSAhPSBudWxsID8gcmVmWzBdIDogdm9pZCAwO1xuICAgICAgICBpZiAoX2sgIT0gbnVsbCkge1xuICAgICAgICAgIG5leHRTb3J0ID0gZm5zb3J0KGZvcndhcmQsIF9rLCBuZXh0a2V5cyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9md3JkID0gKGZvcndhcmRba2V5XSAhPSBudWxsID8gZm9yd2FyZFtrZXldIDogKGZvcndhcmRbXCI/XCJdICE9IG51bGwgPyBmb3J3YXJkW1wiP1wiXSA6IGZvcndhcmQpKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlbEEsIGVsQikge1xuICAgICAgICB2YXIgX2EsIF9iO1xuICAgICAgICBfYSA9IGdldEtleShlbEEsIGtleSk7XG4gICAgICAgIF9iID0gZ2V0S2V5KGVsQiwga2V5KTtcbiAgICAgICAgaWYgKF9hIDwgX2IpIHtcbiAgICAgICAgICBpZiAoX2Z3cmQpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF9hID4gX2IpIHtcbiAgICAgICAgICBpZiAoX2Z3cmQpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF9hID09PSBfYikge1xuICAgICAgICAgIGlmIChuZXh0U29ydCAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dFNvcnQoZWxBLCBlbEIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgICByZXR1cm4gZm5zb3J0KGZvcndhcmQsIChyZWYgPSBrZXlzLnNwbGljZSgwLCAxKSkgIT0gbnVsbCA/IHJlZlswXSA6IHZvaWQgMCwga2V5cyk7XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
