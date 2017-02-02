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
    this.isEqualCurrent = bind(this.isEqualCurrent, this);
    this.getResValue = bind(this.getResValue, this);
    this.isResultEmpty = bind(this.isResultEmpty, this);
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
    this.trigger("closed", this.result, evnt);
  };

  FacetSubsBase.prototype.getResults = function() {
    return {
      value: this.getValue()
    };
  };

  FacetSubsBase.prototype.isResultEmpty = function(res) {
    if ((res != null ? res.value : void 0) != null) {
      return this.isResultEmpty(res.value);
    }
    if (res == null) {
      return true;
    }
    if (res === "") {
      return true;
    }
    if (_.isArray(res) && res.length <= 0) {
      return true;
    }
    return false;
  };

  FacetSubsBase.prototype.getResValue = function() {
    var ref, ref1, res;
    res = (ref = this.result) != null ? (ref1 = ref.first()) != null ? ref1.toJSON() : void 0 : void 0;
    return (res != null ? res.value : void 0) || "";
  };

  FacetSubsBase.prototype.isEqualCurrent = function(val) {
    var rv;
    if (val == null) {
      val = this.getValue();
    }
    rv = this.getResValue();
    if (rv === val) {
      return true;
    }
    return false;
  };

  FacetSubsBase.prototype.getValue = function() {
    return this.$inp.val();
  };

  FacetSubsBase.prototype.getSelectModel = function() {
    return SubResults.prototype.model;
  };

  FacetSubsBase.prototype._checkSelectEmpty = function(_val, evnt) {
    if (_.isEmpty(_val) && !_.isNumber(_val) && !_.isBoolean(_val)) {
      this.close(evnt);
      return true;
    }
    return false;
  };

  FacetSubsBase.prototype.select = function(evnt) {
    var _val;
    _val = this.getValue();
    this.set(_val, evnt);
  };

  FacetSubsBase.prototype.set = function(val, evnt) {
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
    this.trigger("selected", _model, evnt);
    this.close(evnt);
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
    var _iv, _v;
    _v = this.$inp.val();
    if (!(_v != null ? _v.length : void 0)) {
      return null;
    }
    _iv = parseInt(_v, 10);
    if (isNaN(_iv)) {
      return null;
    }
    return this.valueByDefinition(_v);
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
      this.$elOp = this.$el.find(".operator");
      this.elOp = this.$elOp.get(0);
      this.$inpOp = this.$el.find("select#" + this.cid + "op");
      this.select2Op = this.$inpOp.select2({
        width: "auto"
      }).data("select2");
      this.$inpOp.on("select2:close", this._opSelected);
    }
  };

  FacetSubsNumber.prototype.renderResult = function(renderEmpty) {
    var _res, _s;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "";
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
    var _posOpWrp, _posWrp, _val, ref, ref1;
    _posOpWrp = -1;
    if (evnt != null ? evnt.relatedTarget : void 0) {
      _posOpWrp = (ref = this.elOp) != null ? ref.compareDocumentPosition(evnt != null ? evnt.relatedTarget : void 0) : void 0;
      if (_posOpWrp === 20) {
        return;
      }
    }
    if ((evnt != null ? evnt.type : void 0) === "focusout" && _posOpWrp !== 20) {
      _val = this.getValue();
      if (_val != null) {
        this.set(_val, evnt);
        return;
      }
      this.close();
      return;
    }
    if ((evnt != null ? evnt.relatedTarget : void 0) != null) {
      _posWrp = this.el.compareDocumentPosition(evnt != null ? evnt.relatedTarget : void 0);
      if (!(_posWrp === 0 || _posWrp - 16 >= 0)) {
        evnt.stopPropagation();
        return;
      }
    }
    if ((evnt != null) && ((evnt != null ? evnt.relatedTarget : void 0) === this.$inp.get(0) || (evnt != null ? evnt.relatedTarget : void 0) === ((ref1 = this.$inpOp) != null ? ref1.get(0) : void 0))) {
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
    this.$inp.select();
  };

  FacetSubsNumber.prototype.reopen = function(pView) {
    var _oldOp, _oldVal, ref;
    _oldVal = (ref = this.result.first()) != null ? ref.get("value") : void 0;
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
    var _val, ref;
    if ((ref = this.model.get("operators")) != null ? ref.length : void 0) {
      if (this.$inp.is(evnt.target) && evnt.shiftKey) {
        evnt.stopPropagation();
        evnt.preventDefault();
        this.$inpOp.focus();
        return false;
      }
      if ((this.select2Op.$selection.is(evnt.target) || evnt.target.classList.contains("select2-search__field")) && !evnt.shiftKey) {
        evnt.stopPropagation();
        evnt.preventDefault();
        this.$inp.focus().select();
        return false;
      }
    }
    _val = this.getValue();
    evnt.preventDefault();
    evnt.stopPropagation();
    if (!isNaN(_val)) {
      this.select(evnt);
    }
    return true;
  };

  FacetSubsNumber.prototype.getResults = function() {
    var _ret, ref;
    if ((this.$inpOp != null) || (this.model.get("operator") != null)) {
      _ret = {
        value: this.getValue(),
        operator: ((ref = this.$inpOp) != null ? ref.val() : void 0) || this.model.get("operator")
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
    this.clickSel = bind(this.clickSel, this);
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
      obj["mousedown " + (this._getInpSelector())] = "clickSel",
      obj["mousedown " + (this._getInpSelector("_to"))] = "clickSel",
      obj
    );
  };

  FacetSubsRange.prototype.renderResult = function(renderEmpty) {
    var _res;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "";
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
    this.$inp.select();
  };

  FacetSubsRange.prototype.clickSel = function(evnt) {
    evnt.currentTarget.focus();
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
      evnt.stopPropagation();
      evnt.preventDefault();
      this.$inpTo.focus().select();
      console.log("focus next");
      return false;
    }
    if (this.$inpTo.is(evnt.target) && evnt.shiftKey) {
      evnt.stopPropagation();
      evnt.preventDefault();
      this.$inp.focus().select();
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
      if (!this.select2._eventsAdded) {
        this.select2._eventsAdded = true;
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
        this.select2.$selection.on("focusout", (function(_this) {
          return function(evnt) {
            _this.TMfocusOut = setTimeout(function() {
              _this.select();
            }, 150);
          };
        })(this));
        this.select2.$selection.on("focusin", (function(_this) {
          return function(evnt) {
            if (_this.TMfocusOut != null) {
              clearTimeout(_this.TMfocusOut);
            }
          };
        })(this));
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
    this.focus = bind(this.focus, this);
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

  FacetSubString.prototype.focus = function() {
    FacetSubString.__super__.focus.apply(this, arguments);
    this.$inp.select();
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
    "click .search-btn": "_onSearch",
    "focus .search-btn": "_onFocusSearch",
    "mousedown .add-facet-btn": "_addFacet",
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
    this.TMopenAddFacet = setTimeout((function(_this) {
      return function() {
        _this.addFacet();
      };
    })(this), 0);
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
      return function(results, evnt) {
        var ref;
        if (subview != null ? (ref = subview.model) != null ? ref.get("pinned") : void 0 : void 0) {
          _this.subview = null;
          return;
        }
        if (!(results != null ? results.length : void 0)) {
          subview.remove();
        }
        _this.subview = null;
        if (addAfter && (evnt != null ? evnt.type : void 0) !== "focusout") {
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
    subview.on("selected", function(facetM, data, evnt) {
      _self.setFacet(facetM, data);
      if (((this.selectview._isFull == null) || this.selectview._isFull()) && (evnt != null ? evnt.type : void 0) !== "focusout") {
        _self._nextFacet(null, this);
      }
    });
    subview.eventsAttached = true;
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
      return function(facetM, data, evnt) {
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
          if ($(evnt.target).is(".search-btn") && (evnt != null ? evnt.shiftKey : void 0)) {
            if (evnt != null) {
              evnt.preventDefault();
            }
            if (evnt != null) {
              evnt.stopPropagation();
            }
            _this.TMopenAddFacet = setTimeout(function() {
              return _this.addFacet();
            }, 0);
            return;
          }
          if ((ref1 = _this.selectview) != null ? ref1.isOpen : void 0) {
            if (evnt != null) {
              evnt.preventDefault();
            }
            if (evnt != null) {
              evnt.stopPropagation();
            }
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
      if (evnt != null) {
        evnt.preventDefault();
      }
      if (evnt != null) {
        evnt.stopPropagation();
      }
      setTimeout((function(_this) {
        return function() {
          return _this.addFacet();
        };
      })(this), 0);
      return;
    }
    _nextId = _next != null ? _next.data("fctid") : void 0;
    if (_nextId != null) {
      if (evnt != null) {
        evnt.preventDefault();
      }
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
    if ((evnt.type === "click" && evnt.detail === 0) || evnt.type === "mousedown") {
      if (evnt != null) {
        evnt.preventDefault();
      }
      evnt.stopPropagation();
      this.exit();
      this.trigger("searchbutton", this.searchButton.event);
    }
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
    if (this.TMopenAddFacet != null) {
      clearTimeout(this.TMopenAddFacet);
    }
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
    this.isResultEmpty = bind(this.isResultEmpty, this);
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
    "mousedown": "reopen",
    "mousedown .rm-facet-btn": "del"
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
    if (this._isOpen) {
      return;
    }
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

  ViewSub.prototype.selected = function(optMdl, evnt) {
    this.result.add(optMdl, {
      merge: true
    });
    this.renderResult();
    this.trigger("selected", this.model, this.selectview.getResults(), evnt);
  };

  ViewSub.prototype.removed = function(optMdl, evnt) {
    this.result.remove(optMdl);
    this.renderResult();
    this.trigger("selected", this.model, this.selectview.getResults(), evnt);
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
    if (!this.selectview.subEventsAttached) {
      this.selectview.on("closed", (function(_this) {
        return function(result, evnt) {
          _this._isOpen = false;
          if (_this.model.get("pinned")) {
            return;
          }
          if (!result.length) {
            _this.selectview.remove();
          }
          _this.trigger("closed", result, evnt);
          if (!result.length) {
            _this.remove();
          }
        };
      })(this));
      this.selectview.on("selected", (function(_this) {
        return function(mdl, evnt) {
          if (mdl) {
            _this.selected(mdl, evnt);
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
      this.selectview.subEventsAttached = true;
    }
  };

  ViewSub.prototype.isResultEmpty = function(inp) {
    if (this.selectview != null) {
      return this.selectview.isResultEmpty(inp);
    }
    return true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL21haW4uY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvYmFja2JvbmVfc3ViLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2Jhc2UuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9yYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0cy5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3JhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXIuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL3N1YnN0cmluZy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL3N1Yi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0Y29sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsc0hBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVDs7QUFDWCxNQUFBLEdBQVMsT0FBQSxDQUFTLGlCQUFUOztBQUNULFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFTLDBCQUFUOztBQUNm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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQSxNQUFNLENBQUMsT0FBUCxHQUNDO0VBQUEsTUFBQSxFQUFRLEVBQVI7RUFDQSxPQUFBLEVBQVMsRUFEVDtFQUVBLElBQUEsRUFBTSxFQUZOO0VBR0EsTUFBQSxFQUFRLEVBSFI7RUFJQSxLQUFBLEVBQU8sQ0FBRSxHQUFGLEVBQU8sRUFBUCxDQUpQO0VBS0EsT0FBQSxFQUFTLEVBTFQ7RUFNQSxLQUFBLEVBQU8sQ0FOUDs7Ozs7QUNERCxJQUFBLG1DQUFBO0VBQUE7Ozs7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxVQUFBLEdBQWEsT0FBQSxDQUFTLHlCQUFUOztBQUVQOzs7Ozs7Ozs7Ozs7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTWFpblZpZXcgPSByZXF1aXJlKCBcIi4vdmlld3MvbWFpblwiIClcbkZhY2V0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRzXCIgKVxuRmN0U3RyaW5nID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zdHJpbmdcIiApXG5GY3RBcnJheSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfYXJyYXlcIiApXG5GY3RTZWxlY3QgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3NlbGVjdFwiIClcbkZjdE51bWJlciA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfbnVtYmVyXCIgKVxuRmN0UmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3JhbmdlXCIgKVxuRmN0RGF0ZVJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9kYXRlcmFuZ2VcIiApXG5GY3RFdmVudCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfZXZlbnRcIiApXG5SZXN1bHRzID0gcmVxdWlyZSggXCIuL21vZGVscy9yZXN1bHRzXCIgKVxuXG5JR0dZX0lEWCA9IDFcblxuY2xhc3MgSUdHWSBleHRlbmRzIEJhY2tib25lLkV2ZW50c1xuXHQkOiBqUXVlcnlcblx0Y29uc3RydWN0b3I6ICggZWwsIGZhY2V0cyA9IFtdLCBvcHRpb25zID0ge30gKS0+XG5cdFx0Xy5leHRlbmQgQCwgQmFja2JvbmUuRXZlbnRzXG5cdFx0QF9pbml0RXJyb3JzKClcblx0XHRcblx0XHQjIGluaXQgZWxlbWVudFxuXHRcdEAkZWwgPSBAX3ByZXBhcmVFbCggZWwgKVxuXHRcdEBlbCA9IEAkZWxbMF1cblx0XHRAJGVsLmRhdGEoIFwiaWdneVwiLCBAIClcblxuXHRcdCMgaW5pdCBmYWNldHNcblx0XHRAZmFjZXRzID0gQF9wcmVwYXJlRmFjZXRzKCBmYWNldHMsIG9wdGlvbnMgKVxuXHRcdEByZXN1bHRzID0gbmV3IFJlc3VsdHMoIG51bGwsIG9wdGlvbnMgKVxuXG5cdFx0QHJlc3VsdHMub24gXCJhZGRcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcInJlbW92ZVwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwiY2hhbmdlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cblx0XHRAdmlldyA9IG5ldyBNYWluVmlldyggbWFpbjogQCwgZWw6IEAkZWwsIGNvbGxlY3Rpb246IEBmYWNldHMsIHJlc3VsdHM6IEByZXN1bHRzLCBzZWFyY2hCdXR0b246IG9wdGlvbnMuc2VhcmNoQnV0dG9uLCBpZHg6IElHR1lfSURYKysgKVxuXHRcdFxuXHRcdEB2aWV3Lm9uIFwic2VhcmNoYnV0dG9uXCIsIEB0cmlnZ2VyRXZlbnRcblxuXHRcdEBub25FbXB0eVJlc3VsdHMgPSBAcmVzdWx0cy5zdWIoIEBfZmlsdGVyRW1wdHkgKVxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRWw6ICggZWwgKT0+XG5cblx0XHRpZiBub3QgZWw/XG5cdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVNSVNTSU5HRUxcIiApXG5cblx0XHRpZiBfLmlzU3RyaW5nKCBlbCApXG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxTVFJJTkdcIiApXG5cblx0XHRcdF8kZWwgPSBAJCggZWwgKVxuXHRcdFx0aWYgbm90IF8kZWw/Lmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxTVFJJTkdcIiApXG5cblx0XHRcdHJldHVybiBfJGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIGpRdWVyeVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMSlFVRVJZXCIgKVxuXG5cdFx0XHQjIFRPRE8gaGFuZGxlIG11bHRpcGxlIGpRdWVyeSBlbGVtZW50cyB0byBJR0dZIGluc3RhbmNlc1xuXHRcdFx0aWYgZWwubGVuZ3RoID4gMVxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVTSVpFRUxKUVVFUllcIiApXG5cblx0XHRcdHJldHVybiBlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBFbGVtZW50XG5cdFx0XHRyZXR1cm4gQCQoIGVsIClcblxuXHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFRZUEVcIiApXG5cblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUZhY2V0czogKCBmYWNldHMsIG9wdGlvbnM9e30gKT0+XG5cdFx0X3JldCA9IFtdXG5cdFx0Zm9yIGZhY2V0LCBfaWR4IGluIGZhY2V0cyB3aGVuICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdF9mY3QuX2lkeCA9IF9pZHhcblx0XHRcdF9yZXQucHVzaCBfZmN0XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBGYWNldHMoIF9yZXQsIG9wdGlvbnMgKVxuXG5cdF9jcmVhdGVGYWNldDogKCBmYWNldCApLT5cblx0XHRzd2l0Y2ggZmFjZXQudHlwZS50b0xvd2VyQ2FzZSgpXG5cdFx0XHR3aGVuIFwic3RyaW5nXCIgdGhlbiByZXR1cm4gbmV3IEZjdFN0cmluZyggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcInNlbGVjdFwiIHRoZW4gcmV0dXJuIG5ldyBGY3RTZWxlY3QoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJhcnJheVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RBcnJheSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcIm51bWJlclwiIHRoZW4gcmV0dXJuIG5ldyBGY3ROdW1iZXIoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJyYW5nZVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RSYW5nZSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImRhdGVyYW5nZVwiIHRoZW4gcmV0dXJuIG5ldyBGY3REYXRlUmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJldmVudFwiIHRoZW4gcmV0dXJuIG5ldyBGY3RFdmVudCggZmFjZXQsIG1haW46IEAgKVxuXG5cdGFkZEZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdGlmIG5vdCBAZmFjZXRzP1xuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0QGZhY2V0cy5hZGQoIF9mY3QgKVxuXHRcdHJldHVybiBAXG5cblx0X2Vycm9yOiAoIHR5cGUsIGRhdGEgPSB7fSApPT5cblx0XHRpZiBAZXJyb3JzWyB0eXBlIF0/XG5cdFx0XHRfbXNnID0gQGVycm9yc1sgdHlwZSBdKCBkYXRhIClcblx0XHRlbHNlXG5cdFx0XHRfbXNnID0gXCItXCJcblx0XHRfZXJyID0gbmV3IEVycm9yKClcblx0XHRfZXJyLm5hbWUgPSB0eXBlXG5cdFx0X2Vyci5tZXNzYWdlID0gX21zZ1xuXHRcdHJldHVybiBfZXJyXG5cblx0X2ZpbHRlckVtcHR5OiAoIG1vZGVsICk9PlxuXHRcdF92ID0gbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIG5vdCBfdj9cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdGlmIF92Lmxlbmd0aCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0XHRyZXR1cm4gdHJ1ZVxuXHRcblx0Z2V0UXVlcnk6ID0+XG5cdFx0cmV0dXJuIEBub25FbXB0eVJlc3VsdHNcblxuXHR0cmlnZ2VyQ2hhbmdlOiA9PlxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRAdHJpZ2dlciggXCJjaGFuZ2VcIiwgQG5vbkVtcHR5UmVzdWx0cyApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XG5cdHRyaWdnZXJFdmVudDogKCBldmVudE5hbWUgKT0+XG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEB0cmlnZ2VyKCBldmVudE5hbWUsIEBub25FbXB0eVJlc3VsdHMgKVxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdF9pbml0RXJyb3JzOiA9PlxuXHRcdEBlcnJvcnMgPSB7fVxuXHRcdGZvciBfaywgX3RtcGwgb2YgQEVSUk9SUygpXG5cdFx0XHRAZXJyb3JzWyBfayBdID0gXy50ZW1wbGF0ZSggX3RtcGwgKVxuXHRcdHJldHVyblxuXG5cdEVSUk9SUzogLT5cblx0XHRcIkVJTlZBTElERUxTVFJJTkdcIjogXCJJZiB5b3UgZGVmaW5lIGEgYGVsYCBhcyBTdHJpbmcgaXQgaGFzIHRvIGJlIGEgdmFsaWQgc2VsZWN0b3IgZm9yIGFuIGV4aXN0aW5nIERPTSBlbGVtZW50LlwiXG5cdFx0XCJFRU1QVFlFTFNUUklOR1wiOiBcIlRoZSBgZWxgIGFzIHN0cmluZyBjYW4gbm90IGJlIGVtcHR5LlwiXG5cdFx0XCJFRU1QVFlFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhbiBlbXB0eSBjb2xsZWN0aW9uLlwiXG5cdFx0XCJFU0laRUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGEgcmVzdWx0IG9mIG9uZSBlbC5cIlxuXHRcdFwiRUlOVkFMSURFTFRZUEVcIjogXCJUaGUgYGVsYCBjYW4gb25seSBiZSBhIHNlbGVjdG9yIHN0cmluZywgZG9tIGVsZW1lbnQgb3IgalF1ZXJ5IGNvbGxlY3Rpb25cIlxuXHRcdFwiRU1JU1NJTkdFTFwiOiBcIlBsZWFzZSBkZWZpbmUgYSB0YXJnZXQgYGVsYFwiXG5cbm1vZHVsZS5leHBvcnRzID0gSUdHWVxuIiwiIyMjXG5FWEFNUExFIFVTQUdFXG5cblx0cGFyZW50Q29sbCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uLlN1YigpXG5cdFxuXHQjIGJ5IEFycmF5XG5cdHN1YkNvbGxBID0gcGFyZW50Q29sbC5zdWIoIFsgMSwgMiwgMyBdIClcblx0XG5cdCMgb3IgYnkgT2JqZWN0XG5cdHN1YkNvbGxPID0gcGFyZW50Q29sbC5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgb3IgYnkgTnVtYmVyXG5cdHN1YkNvbGxOID0gcGFyZW50Q29sbC5zdWIoIDEzIClcblx0XG5cdCMgb3IgYnkgRnVuY3Rpb25cblx0c3ViQ29sbEYgPSBwYXJlbnRDb2xsLnN1YiggKCggbW9kZWwgKS0+IGlmIG1vZGVsLmdldCggXCJhZ2VcIiApID4gMjMgKSApXG5cdFxuXHQjIHN1YmNvbGxlY3Rpb24gb2Ygc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQV9PID0gc3ViQ29sbEEuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gRm9yIHRoaXMgYSBgcmVzZXRgIHdpbGwgYmUgZmlyZWQgb24gdGhlIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEEgPSBzdWJDb2xsQS51cGRhdGVTdWJGaWx0ZXIoIHsgbmFtZTogXCJCYXJcIiwgYWdlOiA0MiB9IClcbiMjI1xuXG5jbGFzcyBCYWNrYm9uZVN1YiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0IyMjXG5cdCMjIHN1YlxuXHRcblx0YGNvbGxlY3Rpb24uc3ViKCBmaWx0ZXIgKWBcblx0XG5cdEdlbmVyYXRlIGEgc3ViLWNvbGxlY3Rpb24gYnkgYSBmaWx0ZXIuXG5cdFRoZSBtb2RlbHMgd2lsbCBiZSBkaXN0cmlidXRlZCB3aXRoaW4gYWxsIGludm9sdmVkIGNvbGxlY3Rpb25zIHVuZGVyIGNvbnNpZGVyYXRpb24gb2YgdGhlIGZpbHRlci5cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgQ29sbGVjdGlvbiB9IEEgU3ViLUNvbGxlY3Rpb24gYmFzZWQgb24gdGhlIGZpbHRlclxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHN1YjogKCBmaWx0ZXIgKT0+XG5cdFx0QHN1YkNvbGxzIG9yPSBbXVxuXHRcdGZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClcblxuXHRcdCMgZmlsdGVyIHRoZSBjb2xsZWN0aW9uXG5cdFx0X21vZGVscyA9IEBmaWx0ZXIgZm5GaWx0ZXJcblx0XHQjIGNyZWF0ZSB0aGUgc3ViY29sbGVjdGlvblxuXHRcdF9zdWIgPSBuZXcgQGNvbnN0cnVjdG9yKCBfbW9kZWxzLCBAX3N1YkNvbGxlY3Rpb25PcHRpb25zKCkgKVxuXG5cdFx0X3N1Yi5fcGFyZW50Q29sID0gQFxuXHRcdF9zdWIuX2ZuRmlsdGVyID0gZm5GaWx0ZXJcblxuXHRcdCMgYWRkIGV2ZW50IGhhbmRsZXJzIHRvIGRpc3RyaWJ1dGUgdGhlIG1vZGVscyB0aHJvdWdoIHRoZSBzdWIgY29sbGVjdGlvbnMgdHJlZVxuXG5cdFx0IyByZWNoZWNrIHRoZSBtb2RlbCBhZ2FpbnN0IHRoZSBmaWx0ZXIgb24gY2hhbmdlXG5cdFx0QG9uIFwiY2hhbmdlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdHRvQWRkID0gQF9mbkZpbHRlciggX20gKVxuXHRcdFx0YWRkZWQgPSBAZ2V0KCBfbSApP1xuXHRcdFx0aWYgYWRkZWQgYW5kIG5vdCB0b0FkZFxuXHRcdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRlbHNlIGlmIG5vdCBhZGRlZCBhbmQgdG9BZGRcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIGJhc2UgY29sbGVjdGlvbiBvbiBhZGQgdG8gc3ViXG5cdFx0X3N1Yi5vbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBzdWIgY29sbGVjdGlvbiBvbiBhZGQgdG8gYmFzZSBpZiBpdCBtYXRjaGVzIHRoZSBmaWx0ZXJcblx0XHRAb24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0aWYgQF9mbkZpbHRlciggX20gKVxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdF9zdWIub24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0I0ByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZXNldFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAdXBkYXRlU3ViRmlsdGVyKClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHN0b3JlIHRoZSBzdWJjb2xsZWN0aW9uIHVuZGVyIHRoZSBjdXJyZW50IGNvbGxlY3Rpb25cblx0XHRAc3ViQ29sbHMucHVzaCggX3N1YiApXG5cblx0XHRyZXR1cm4gX3N1YlxuXHRcblx0IyMjXG5cdCMjIF9zdWJDb2xsZWN0aW9uT3B0aW9uc1xuXHRcblx0YGNvbGxlY3Rpb24uX3N1YkNvbGxlY3Rpb25PcHRpb25zKClgXG5cdFxuXHRPdmVyd3JpdGFibGUgbWV0aG9kIHRvIHNldCB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBmb3Igc3ViIGNvbGxlY3Rpb25zXG5cdFxuXHRAcmV0dXJuIHsgT2JqZWN0IH0gVGhlIG9wdGlvbnMgb2JqZWN0XG5cdFxuXHRAYXBpIHByaXZhdGVcblx0IyMjXG5cdF9zdWJDb2xsZWN0aW9uT3B0aW9uczogPT5cblx0XHRfb3B0cyA9XG5cdFx0XHRjb21wYXJhdG9yOiBAY29tcGFyYXRvclxuXHRcdHJldHVybiBfb3B0c1xuXG5cdCMjI1xuXHQjIyB1cGRhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLnVwZGF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRNZXRob2QgdG8gdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBUaGVuIGFsbCBtb2RlbHMgd2lsbCBiZSByZXNldGUgYnkgdGhlIG5ldyBmaWx0ZXIuIFNvIHlvdSBoYXZlIHRvIGxpc3RlbiB0byB0ZWggcmVzZXQgZXZlbnRcblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgU2VsZiB9IGl0c2VsZlxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHVwZGF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIsIGFzUmVzZXQgPSB0cnVlICk9PlxuXHRcdGlmIEBfcGFyZW50Q29sP1xuXG5cdFx0XHQjIHNldCB0aGUgbmV3IGZpbHRlciBtZXRob2Rcblx0XHRcdEBfZm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKSBpZiBmaWx0ZXI/XG5cblx0XHRcdF9tb2RlbHMgPSBAX3BhcmVudENvbC5maWx0ZXIoIEBfZm5GaWx0ZXIgKVxuXG5cdFx0XHQjIHJlc2V0IHRoZSBjb2xsZWN0aW9uIHdpdGggdGhlIG5ldyBtb2RlbHNcblx0XHRcdGlmIGFzUmVzZXRcblx0XHRcdFx0QHJlc2V0KCBfbW9kZWxzIClcblx0XHRcdFx0cmV0dXJuIEBcblxuXHRcdFx0bmV3aWRzID0gXy5wbHVjayggX21vZGVscywgXCJjaWRcIiApXG5cdFx0XHRjdXJyaWRzID0gXy5wbHVjayggQG1vZGVscywgXCJjaWRcIiApXG5cdFx0XHRmb3IgcmlkIGluIF8uZGlmZmVyZW5jZSggY3VycmlkcywgbmV3aWRzIClcblx0XHRcdFx0QHJlbW92ZSggcmlkIClcblx0XHRcdFx0XG5cdFx0XHRfYWRkSWRzID0gXy5kaWZmZXJlbmNlKCBuZXdpZHMsIGN1cnJpZHMgKVxuXHRcdFx0Zm9yIG1kbCBpbiBfbW9kZWxzIHdoZW4gbWRsLmNpZCBpbiBfYWRkSWRzXG5cdFx0XHRcdEBhZGQoIG1kbCApXG5cblx0XHRyZXR1cm4gQFxuXG5cblx0IyMjXG5cdCMjIF9nZW5lcmF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24uX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdEludGVybmFsIG1ldGhvZCB0aCBjb252ZXJ0IGEgZmlsdGVyIGFyZ3VtZW50IHRvIGEgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IEZ1bmN0aW9uIH0gVGhlIGdlbmVyYXRlZCBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X2dlbmVyYXRlU3ViRmlsdGVyOiAoIGZpbHRlciApLT5cblx0XHQjIGNvbnN0cnVjdCB0aGUgZmlsdGVyIGZ1bmN0aW9uXG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNBcnJheSggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0X20uaWQgaW4gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzU3RyaW5nKCBmaWx0ZXIgKSBvciBfLmlzTnVtYmVyKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpcyBmaWx0ZXJcblx0XHRlbHNlXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdGZvciBfbm0sIF92bCBvZiBmaWx0ZXJcblx0XHRcdFx0XHRpZiBfbS5nZXQoIF9ubSApIGlzbnQgX3ZsXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdHJldHVybiBmbkZpbHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lU3ViXG4iLCJjbGFzcyBGY3RBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9zdHJpbmdcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YmFycmF5XCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0QXJyYXlcbiIsImNsYXNzIEZhY2V0QmFzZSBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9iYXNlXCIgKVxuXHRcblx0Y29uc3RydWN0b3I6ICggYXR0cnMsIG9wdGlvbnMgKS0+XG5cdFx0QG1haW4gPSBvcHRpb25zLm1haW5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0ZGVmYXVsdHM6IC0+XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IFwibmFtZVwiXG5cdFx0bGFiZWw6IFwiRGVzY3JpcHRpb25cIlxuXHRcdHNvcnQ6IDBcblxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiIClcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwibmFtZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuXHRjb21wYXJhdG9yOiAoIG1kbCApLT5cblx0XHRyZXR1cm4gbWRsLmlkXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRCYXNlXG4iLCJjbGFzcyBGY3REYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvZGF0ZXJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRzOiB7fVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3REYXRlUmFuZ2VcbiIsImNsYXNzIEZjdEV2ZW50IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IG51bGxcblx0b25seUV4ZWM6IHRydWVcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblx0XHRcblx0ZXhlYzogKCApPT5cblx0XHRAbWFpbi50cmlnZ2VyKCBAZ2V0KCBcImV2ZW50XCIgKSwgQHRvSlNPTigpIClcblx0XHRyZXR1cm5cbm1vZHVsZS5leHBvcnRzID0gRmN0RXZlbnRcbiIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdE51bWJlclxuIiwiY2xhc3MgRmN0UmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VicmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFJhbmdlXG4iLCJjbGFzcyBGY3RTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic2VsZWN0XCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQoIHN1cGVyLCB7XG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFx0d2FpdEZvckFzeW5jOiB0cnVlXG5cdFx0fSlcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTZWxlY3RcbiIsImNsYXNzIEZjdFN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmdcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nXG4iLCJzb3J0Q29sbCA9IHJlcXVpcmUoIFwic29ydGNvbGxcIiApXG5cbmZuR2V0ID0gKCBlbCwga2V5ICktPlxuXHRyZXR1cm4gZWwuZ2V0KCBrZXkgKVxuXG5jbGFzcyBJZ2d5RmFjZXRzIGV4dGVuZHMgcmVxdWlyZSggXCIuL2JhY2tib25lX3N1YlwiIClcblx0XG5cdGNvbnN0cnVjdG9yOiAoIG1vZGVscywgb3B0aW9ucz17fSApLT5cblx0XHRpZiBub3Qgb3B0aW9ucy5jb21wYXJhdG9yP1xuXHRcdFx0X2ZvcndhcmQgPSBzd2l0Y2ggb3B0aW9ucy5kaXJcblx0XHRcdFx0d2hlbiBcImFzY1wiIHRoZW4gdHJ1ZVxuXHRcdFx0XHR3aGVuIFwiZGVzY1wiIHRoZW4gZmFsc2Vcblx0XHRcdFx0ZWxzZSB0cnVlXG5cdFx0XHRcblx0XHRcdG9wdGlvbnMuY29tcGFyYXRvciA9IHNvcnRDb2xsKCBbIFwic29ydFwiIF0uY29uY2F0KCBvcHRpb25zLnNvcnRieSBvciBcIm5hbWVcIiApLCB7IHNvcnQ6IGZhbHNlLCBcIj9cIjogX2ZvcndhcmQgfSwgZm5HZXQgKVxuXHRcdHJldHVybiBzdXBlciggbW9kZWxzLCBvcHRpb25zIClcblx0XG5cdF9zdWJDb2xsZWNjdGlvbk9wdGlvbnM6ID0+XG5cdFx0b3B0ID0gc3VwZXJcblx0XHRvcHQuZGlyID0gaWYgQGZvcndhcmQgdGhlbiBcImFzY1wiIGVsc2UgXCJkZXNjXCJcblx0XHRyZXR1cm4gb3B0XG5cdFxuXHRtb2RlbElkOiAoYXR0cnMpLT5cblx0XHRyZXR1cm4gYXR0cnMubmFtZVxuXHRcdFxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5RmFjZXRzXG4iLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBudWxsXG5cdFx0dmFsdWU6IG51bGxcblxuY2xhc3MgSWdneVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogSWdneVJlc3VsdFxuXHRpbml0aWFsaXplOiAoIG1kbHMsIG9wdHMgKT0+XG5cdFx0aWYgb3B0cy5tb2RpZnlLZXk/Lmxlbmd0aFxuXHRcdFx0QG1vZGlmeUtleSA9IG9wdHMubW9kaWZ5S2V5XG5cdFx0cmV0dXJuXG5cdHBhcnNlOiAoIGF0dHIsIG9wdGlvbnMgKT0+XG5cdFx0X2tleSA9IG9wdGlvbnMuX2ZhY2V0LmdldCggXCJtb2RpZnlLZXlcIiApIG9yIEBtb2RpZnlLZXkgb3IgXCJ2YWx1ZVwiXG5cdFx0X21vZGlmeSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwibW9kaWZ5XCIgKVxuXHRcdGlmIF9tb2RpZnk/IGFuZCBfLmlzRnVuY3Rpb24oIF9tb2RpZnkgKVxuXHRcdFx0YXR0clsgX2tleSBdID0gX21vZGlmeSggYXR0ci52YWx1ZSwgb3B0aW9ucy5fZmFjZXQsIGF0dHIgKVxuXHRcdHJldHVybiBhdHRyXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneVJlc3VsdHNcbiIsImNsYXNzIEJhc2VSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBAaWRBdHRyaWJ1dGUgKSBvciBcIlwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzXG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjdXN0b20sIGlkLCB0eHQpIHtcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0eHQpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiYnRuLXdycFxcXCI+PGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInJtLXJlc3VsdC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+XCIpO1xuaWYgKCBjdXN0b20pXG57XG5idWYucHVzaChcIjxpXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJlZGl0LXJlc3VsdC1idG4gZmEgZmEtcGVuY2lsXFxcIj48L2k+XCIpO1xufVxuYnVmLnB1c2goXCI8L3NwYW4+XCIpO30uY2FsbCh0aGlzLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImlkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pZDp0eXBlb2YgaWQhPT1cInVuZGVmaW5lZFwiP2lkOnVuZGVmaW5lZCxcInR4dFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudHh0OnR5cGVvZiB0eHQhPT1cInVuZGVmaW5lZFwiP3R4dDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvciwgb3BlcmF0b3JzLCB1bmRlZmluZWQsIHZhbHVlKSB7XG5pZiAoIG9wZXJhdG9ycyAmJiBvcGVyYXRvcnMubGVuZ3RoKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+PHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiKTtcbi8vIGl0ZXJhdGUgb3BlcmF0b3JzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wZXJhdG9ycztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yOnR5cGVvZiBvcGVyYXRvciE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3I6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJhbmdlaW5wXFxcIj5cIik7XG52YXIgX3ZhbHMgPSB2YWx1ZSA/IHZhbHVlIDogW11cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfZnJvbVwiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzBdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtZnJvbVxcXCIvPjxzcGFuIGNsYXNzPVxcXCJzZXBhcmF0b3JcXFwiPi08L3NwYW4+PGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfdG9cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1sxXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLXRvXFxcIi8+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG47cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG11bHRpcGxlLCBvcHRpb25Hcm91cHMsIG9wdGlvbnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIG11bHRpcGxlPVxcXCJtdWx0aXBsZVxcXCIgY2xhc3M9XFxcInNlbGVjdC1pbnBcXFwiPlwiKTtcbmlmICggb3B0aW9uR3JvdXBzKVxue1xuLy8gaXRlcmF0ZSBvcHRpb25Hcm91cHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9uR3JvdXBzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgZ25hbWUgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGduYW1lIDwgJCRsOyBnbmFtZSsrKSB7XG4gICAgICB2YXIgb3B0cyA9ICQkb2JqW2duYW1lXTtcblxuYnVmLnB1c2goXCI8b3B0Z3JvdXBcIiArIChqYWRlLmF0dHIoXCJsYWJlbFwiLCBnbmFtZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPjwvb3B0Z3JvdXA+XCIpO1xuLy8gaXRlcmF0ZSBvcHRzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgZ25hbWUgaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZVxue1xuLy8gaXRlcmF0ZSBvcHRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbmlmICggbXVsdGlwbGUpXG57XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJidG4gYnRuLXhzIGJ0bi1zdWNjZXNzIHNlbGVjdC1jaGVjayBmYSBmYS1jaGVja1xcXCI+PC9zcGFuPlwiKTtcbn19LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJtdWx0aXBsZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubXVsdGlwbGU6dHlwZW9mIG11bHRpcGxlIT09XCJ1bmRlZmluZWRcIj9tdWx0aXBsZTp1bmRlZmluZWQsXCJvcHRpb25Hcm91cHNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbkdyb3Vwczp0eXBlb2Ygb3B0aW9uR3JvdXBzIT09XCJ1bmRlZmluZWRcIj9vcHRpb25Hcm91cHM6dW5kZWZpbmVkLFwib3B0aW9uc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uczp0eXBlb2Ygb3B0aW9ucyE9PVwidW5kZWZpbmVkXCI/b3B0aW9uczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBpbnB2YWwpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGlucHZhbCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzZWxlY3Rvci1pbnBcXFwiLz48dWxcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcInR5cGVsaXN0XCIsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHlwZWxpc3RcXFwiPjwvdWw+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcImlucHZhbFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguaW5wdmFsOnR5cGVvZiBpbnB2YWwhPT1cInVuZGVmaW5lZFwiP2lucHZhbDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChhY3RpdmVJZHgsIGN1c3RvbSwgbGlzdCwgcXVlcnksIHVuZGVmaW5lZCkge1xudmFyIGFkZCA9IDA7XG5pZiAoIGN1c3RvbSAmJiBxdWVyeSlcbntcbmFkZCA9IDE7XG5idWYucHVzaChcIjxsaT48YSBkYXRhLWlkPVxcXCJfY3VzdG9tXFxcIiBkYXRhLWlkeD1cXFwiLTFcXFwiXCIgKyAoamFkZS5jbHMoW3thY3RpdmU6MCA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+PGk+XFxcIlwiICsgKCgoamFkZV9pbnRlcnAgPSBxdWVyeSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXFxcIjwvaT48L2E+PC9saT5cIik7XG59XG5pZiAoIGxpc3QubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBsaXN0XG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IGxpc3Q7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZSBpZiAoICFjdXN0b20pXG57XG5idWYucHVzaChcIjxsaT48YSBjbGFzcz1cXFwiZW1wdHlyZXNcXFwiPm5vIHJlc3VsdCBmb3IgXFxcIlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9hPjwvbGk+XCIpO1xufX0uY2FsbCh0aGlzLFwiYWN0aXZlSWR4XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5hY3RpdmVJZHg6dHlwZW9mIGFjdGl2ZUlkeCE9PVwidW5kZWZpbmVkXCI/YWN0aXZlSWR4OnVuZGVmaW5lZCxcImN1c3RvbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY3VzdG9tOnR5cGVvZiBjdXN0b20hPT1cInVuZGVmaW5lZFwiP2N1c3RvbTp1bmRlZmluZWQsXCJsaXN0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5saXN0OnR5cGVvZiBsaXN0IT09XCJ1bmRlZmluZWRcIj9saXN0OnVuZGVmaW5lZCxcInF1ZXJ5XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5xdWVyeTp0eXBlb2YgcXVlcnkhPT1cInVuZGVmaW5lZFwiP3F1ZXJ5OnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzdHJpbmctaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBwaW5uZWQsIHNlbGVjdGVkLCB1bmRlZmluZWQpIHtcbmlmICggIXBpbm5lZClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwic3VibGFiZWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI6PC9zcGFuPjx1bCBjbGFzcz1cXFwic3VicmVzdWx0c1xcXCI+XCIpO1xuaWYgKCBzZWxlY3RlZCAmJiBzZWxlY3RlZC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIHNlbGVjdGVkXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHNlbGVjdGVkO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT48c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGkgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxzcGFuIGNsYXNzPVxcXCJ0eHRcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48aSBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9pPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvdWw+PGRpdiBjbGFzcz1cXFwic3Vic2VsZWN0IGNsb3NlZFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1cXFwibG9hZGVyXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY29nIGZhLXNwaW5cXFwiPjwvaT48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJsYWJlbFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubGFiZWw6dHlwZW9mIGxhYmVsIT09XCJ1bmRlZmluZWRcIj9sYWJlbDp1bmRlZmluZWQsXCJwaW5uZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnBpbm5lZDp0eXBlb2YgcGlubmVkIT09XCJ1bmRlZmluZWRcIj9waW5uZWQ6dW5kZWZpbmVkLFwic2VsZWN0ZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnNlbGVjdGVkOnR5cGVvZiBzZWxlY3RlZCE9PVwidW5kZWZpbmVkXCI/c2VsZWN0ZWQ6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKHNlYXJjaEJ1dHRvbikge1xuYnVmLnB1c2goXCI8YnV0dG9uIGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGZhIGZhLXBsdXNcXFwiPjwvYnV0dG9uPlwiKTtcbmlmICggc2VhcmNoQnV0dG9uICE9IHVuZGVmaW5lZCAmJiBzZWFyY2hCdXR0b24udGVtcGxhdGUgIT0gdW5kZWZpbmVkICYmIHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZS5sZW5ndGggPj0gMClcbntcbmJ1Zi5wdXNoKFwiPGJ1dHRvblwiICsgKGphZGUuY2xzKFsnc2VhcmNoLWJ0bicsc2VhcmNoQnV0dG9uLmNzc2NsYXNzLHtcInNlYXJjaC1idG4tcHVsbHJpZ2h0XCI6c2VhcmNoQnV0dG9uLnB1bGxyaWdodH1dLCBbbnVsbCx0cnVlLHRydWVdKSkgKyBcIj5cIiArIChudWxsID09IChqYWRlX2ludGVycCA9IHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApICsgXCI8L2J1dHRvbj5cIik7XG59fS5jYWxsKHRoaXMsXCJzZWFyY2hCdXR0b25cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnNlYXJjaEJ1dHRvbjp0eXBlb2Ygc2VhcmNoQnV0dG9uIT09XCJ1bmRlZmluZWRcIj9zZWFyY2hCdXR0b246dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPVxuXHRcIkxFRlRcIjogMzdcblx0XCJSSUdIVFwiOiAzOVxuXHRcIlVQXCI6IDM4XG5cdFwiRE9XTlwiOiA0MFxuXHRcIkVTQ1wiOiBbIDIyOSwgMjcgXVxuXHRcIkVOVEVSXCI6IDEzXG5cdFwiVEFCXCI6IDlcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNCYXNlIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHRyZXN1bHRUZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yZXN1bHRfYmFzZS5qYWRlXCIgKVxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAc3ViID0gb3B0aW9ucy5zdWJcblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEBmb2N1c2VkID0gdHJ1ZVxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiXCJcblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRpZiBfbGJsPyBhbmQgX2xibCBpc250IFwiXCJcblx0XHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0aWYgX2xpc3QubGVuZ3RoXG5cdFx0XHRyZXR1cm4gXCI8bGk+XCIgKyBfbGlzdC5qb2luKCBcIjwvbGk+PGxpPlwiICkgKyBcIjwvbGk+XCJcblx0XHRyZXR1cm4gXCJcIlxuXHRcdFxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuVEFCIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5UQUJcblx0XHRcdEBfb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXQgPVxuXHRcdFx0Y2lkOiBAY2lkXG5cdFx0XHQjdGFiX2luZGV4OiAoICggQG1vZGVsPy5faWR4ICogMTAgKSBvciAxICkgKyAoICggQHN1Yj8ucGFyZW50Py5pZHggb3IgMSApICogMTAwMCApXG5cdFx0XHR2YWx1ZTogQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApXG5cdFx0cmV0dXJuIHJldFxuXG5cdF9nZXRJbnBTZWxlY3RvcjogPT5cblx0XHRyZXR1cm4gXCJpbnB1dCMje0BjaWR9XCJcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcIm9wZW5cIiApXG5cdFx0QHJlbmRlcigpXG5cdFx0cFZpZXc/Lm9wZW4oKVxuXHRcdHJldHVyblxuXHRcblx0cmVuZGVyOiAoIGluaXRpYWxBZGQgKT0+XG5cdFx0X3RtcGwgPSBAdGVtcGxhdGUoICBAZ2V0VGVtcGxhdGVEYXRhKCkgKVxuXHRcdEAkZWwuaHRtbCggX3RtcGwgKVxuXHRcdGlmIG5vdCBpbml0aWFsQWRkXG5cdFx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvcigpIClcblx0XHQjJCggZG9jdW1lbnQgKS5vbiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggdHJ1ZSApXG5cdFx0cmV0dXJuXG5cdFxuXHRfaGFzVGFiRXZlbnQ6IC0+XG5cdFx0cmV0dXJuIFwia2V5ZG93blwiXG5cdFx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gdHJ1ZVxuXHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEBzZWxlY3QoKVxuXHRcdHJldHVybiB0cnVlXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRAZm9jdXNlZCA9IGZhbHNlXG5cdFx0IyQoIGRvY3VtZW50ICkub2ZmIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCBmYWxzZSApXG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEBpc09wZW4gPSBmYWxzZVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCBAcmVzdWx0LCBldm50IClcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcblx0aXNSZXN1bHRFbXB0eTogKCByZXMgKT0+XG5cdFx0aWYgcmVzPy52YWx1ZT9cblx0XHRcdHJldHVybiBAaXNSZXN1bHRFbXB0eSggcmVzLnZhbHVlIClcblx0XHRcblx0XHRpZiBub3QgcmVzP1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRpZiByZXMgaXMgXCJcIlxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRpZiBfLmlzQXJyYXkoIHJlcyApIGFuZCByZXMubGVuZ3RoIDw9IDBcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRnZXRSZXNWYWx1ZTogPT5cblx0XHRyZXMgPSBAcmVzdWx0Py5maXJzdCgpPy50b0pTT04oKVxuXHRcdFxuXHRcdHJldHVybiByZXM/LnZhbHVlIG9yIFwiXCJcblx0XHRcblx0aXNFcXVhbEN1cnJlbnQ6ICggdmFsID0gQGdldFZhbHVlKCkgKT0+XG5cdFx0cnYgPSBAZ2V0UmVzVmFsdWUoKVxuXHRcdGlmIHJ2IGlzIHZhbFxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6IC0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0X2NoZWNrU2VsZWN0RW1wdHk6ICggX3ZhbCwgZXZudCApPT5cblx0XHQjZGVidWdnZXJcblx0XHQjIGlmIEBpc0VxdWFsQ3VycmVudCggX3ZhbCApXG5cdFx0IyBcdEBjbG9zZSgpXG5cdFx0IyBcdHJldHVybiB0cnVlXG5cdFx0XHRcblx0XHRpZiBfLmlzRW1wdHkoIF92YWwgKSBhbmQgbm90IF8uaXNOdW1iZXIoIF92YWwgKSBhbmQgbm90IF8uaXNCb29sZWFuKCBfdmFsICkjIGFuZCBub3QgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRAY2xvc2UoIGV2bnQgKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHQjcmV0dXJuIGlmIEBfY2hlY2tTZWxlY3RFbXB0eSggX3ZhbCwgZXZudCApXG5cdFx0QHNldCggX3ZhbCwgZXZudCApXG5cdFx0cmV0dXJuXG5cblx0c2V0OiAoIHZhbCwgZXZudCApPT5cblx0XHRfbW9kZWwgPSBAcmVzdWx0LmZpcnN0KClcblx0XHRpZiBub3QgX21vZGVsP1xuXHRcdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogdmFsIClcblx0XHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdGVsc2Vcblx0XHRcdF9tb2RlbC5zZXQoIHZhbHVlOiB2YWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCwgZXZudCApXG5cdFx0QGNsb3NlKCBldm50IClcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0Jhc2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzRGF0ZVJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2RhdGVyYW5nZS5qYWRlXCIgKVxuXG5cdGZvcmNlZERhdGVSYW5nZU9wdHM6ID0+XG5cdFx0X29wdHMgPVxuXHRcdFx0b3BlbnM6IFwicmlnaHRcIlxuXHRcdFx0XG5cdFx0aWYgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKVxuXHRcdFx0X29wdHMubG9jYWxlID1cblx0XHRcdFx0Zm9ybWF0OiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0XG5cdFx0aWYgQG1vZGVsLmdldChcInZhbHVlXCIpP1swXT9cblx0XHRcdEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKT9bMV0/XG5cdFx0XHRpZiBfLmlzTnVtYmVyKCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMF0gKVxuXHRcdFx0XHRfc2QgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVswXSApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9zZCA9IG1vbWVudCggQG1vZGVsLmdldChcInZhbHVlXCIpWzBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdGlmIF9zZC5pc1ZhbGlkKClcblx0XHRcdFx0X29wdHMuc3RhcnREYXRlID0gX3NkLl9kXG5cblx0XHRpZiBAbW9kZWwuZ2V0KFwidmFsdWVcIik/WzFdP1xuXHRcdFx0aWYgXy5pc051bWJlciggQG1vZGVsLmdldChcInZhbHVlXCIpWzFdIClcblx0XHRcdFx0X2VkID0gbW9tZW50KCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMV0gKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfZWQgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVsxXSwgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKSApXG5cdFx0XHRpZiBfZWQuaXNWYWxpZCgpXG5cdFx0XHRcdF9vcHRzLmVuZERhdGUgPSBfZWQuX2Rcblx0XHRyZXR1cm4gX29wdHNcblxuXHRldmVudHM6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHRpZiBub3QgQGRhdGVyYW5nZXBpY2tlcj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCBAZm9yY2VkRGF0ZVJhbmdlT3B0cygpIClcblx0XHRcdEAkaW5wLmRhdGVyYW5nZXBpY2tlciggX29wdHMsIEBfZGF0ZVJldHVybiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyID0gQCRpbnAuZGF0YSggXCJkYXRlcmFuZ2VwaWNrZXJcIiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lcj8uYWRkQ2xhc3MoIFwiZGF0ZXJhbmdlLWlnZ3lcIiApXG5cdFx0XHRcblx0XHRcdCMgcHJldmVudCBmcm9tIGhhbmRsaWNoIHRoZSBvdXRlcmNsaWNrIGV4aXQgZnJvbSBNYWluVmlld1xuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5jb250YWluZXIub24gXCJjbGlja1wiLCAoIGV2bnQgKS0+XG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5lbGVtZW50ID0gQCRpbnBcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0XHRcblx0XHRAJGlucC5vbiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub24oIFwiaGlkZS5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0Y2xvc2U6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5vZmYoIFwiY2FuY2VsLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdEAkaW5wLm9mZiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVyblxuXG5cdHJlbW92ZTogPT5cblx0XHRAZGF0ZXJhbmdlcGlja2VyPy5yZW1vdmUoKVxuXHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBudWxsXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0XG5cdFx0aWYgXy5pc051bWJlciggX3Jlcy52YWx1ZVsgMCBdIClcblx0XHRcdF9zdGFydERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDAgXSApXG5cdFx0ZWxzZVxuXHRcdFx0X3N0YXJ0RGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMCBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdFxuXHRcdGlmIF9yZXMudmFsdWVbIDEgXT9cblx0XHRcdGlmIF8uaXNOdW1iZXIoIF9yZXMudmFsdWVbIDEgXSApXG5cdFx0XHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfZW5kRGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMSBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblxuXHRcdF90aW1lID0gQG1vZGVsLmdldCggXCJvcHRzXCIgKS50aW1lUGlja2VyXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0aWYgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKT9cblx0XHRcdF9mcm10ID0gQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKVxuXHRcdGVsc2UgaWYgX3RpbWVcblx0XHRcdF9mcm10ID0gXCJMTExMXCJcblx0XHRlbHNlXG5cdFx0XHRfZnJtdCA9IFwiTExcIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCBfZnJtdCApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggX2ZybXQgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9kYXRlUmV0dXJuOiAoIEBzdGFydERhdGUsIEBlbmREYXRlICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwidmFsdWVcIiwgQGdldFZhbHVlKCBmYWxzZSApIClcblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ICggcHJlZGVmID0gdHJ1ZSApPT5cblx0XHRpZiBwcmVkZWZcblx0XHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFx0aWYgX3ByZWRlZlZhbD9cblx0XHRcdFx0aWYgbm90IF8uaXNBcnJheSggX3ByZWRlZlZhbCApXG5cdFx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0XHRbIEBzdGFydERhdGUsIEBlbmREYXRlIF0gPSBfcHJlZGVmVmFsXG5cdFx0XHRcdHJldHVybiBfcHJlZGVmVmFsXG5cdFx0X291dCA9IFsgQHN0YXJ0RGF0ZS52YWx1ZU9mKCkgXVxuXHRcdF9vdXQucHVzaCBAZW5kRGF0ZS52YWx1ZU9mKCkgaWYgQGVuZERhdGU/XG5cdFx0cmV0dXJuIF9vdXRcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzRGF0ZVJhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbm5lYXJlc3QgPSAobiwgdiktPlxuXHRuID0gbiAvIHZcblx0biA9IE1hdGgucm91bmQobikgKiB2XG5cdHJldHVybiBuXG5cdFxucHJlY2lzaW9uID0gKG4sIGRwKS0+XG5cdGRwID0gTWF0aC5wb3coMTAsIGRwKVxuXHRuID0gbiAqIGRwXG5cdG4gPSBNYXRoLnJvdW5kKG4pXG5cdG4gPSBuIC8gZHBcblx0cmV0dXJuIG5cblxuY2xhc3MgRmFjZXROdW1iZXJCYXNlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHNldE51bWJlciA9IF8udGhyb3R0bGUoIEBfc2V0TnVtYmVyLCAzMDAsIHtsZWFkaW5nOiBmYWxzZSwgdHJhaWxpbmc6IGZhbHNlfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblxuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRfJGVsID0gJCggZXZudC5jdXJyZW50VGFyZ2V0IClcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92LCBfJGVsIClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSwgZWwgPSBAJGlucCApPT5cblx0XHRfdiA9IGVsLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdF92ID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRlbHNlXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdFx0QF9zZXROdW1iZXIoIF92ICsgY2hhbmdlLCBlbCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0XG5cdFx0X2l2ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cdFx0aWYgaXNOYU4oIF9pdiApXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0XG5cdFx0cmV0dXJuIEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YgKVxuXG5cdF9zZXROdW1iZXI6ICggX3YsIGVsID0gQCRpbnAgKT0+XG5cdFx0aWYgaXNOYU4oIF92IClcblx0XHRcdCNAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X2N1cnIgPSBlbC52YWwoKVxuXG5cdFx0X3YgPSBAdmFsdWVCeURlZmluaXRpb24oIF92KVxuXHRcdGlmIF9jdXJyICE9IF92LnRvU3RyaW5nKClcblx0XHRcdGVsLnZhbCggX3YgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSApLT5cblx0XHRtYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRtaW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRzdGVwID0gQG1vZGVsLmdldCggXCJzdGVwXCIgKVxuXHRcdFxuXHRcdCMgZml4IHJldmVyc2VkIG1pbi9tYXggc2V0dGluZ1xuXHRcdGlmIG1pbiA+IG1heFxuXHRcdFx0X3RtcCA9IG1pblxuXHRcdFx0bWluID0gbWF4XG5cdFx0XHRtYXggPSBfdG1wXG5cdFx0XG5cdFx0IyBvbiBleHhlZGRpbmcgdGhlIGxpbWl0cyB1c2UgdGhlIGxpbWl0XG5cdFx0aWYgbWluPyBhbmQgX3ZhbHVlIDwgbWluXG5cdFx0XHRyZXR1cm4gbWluXG5cdFx0aWYgbWF4PyBhbmQgX3ZhbHVlID4gbWF4XG5cdFx0XHRyZXR1cm4gbWF4XG5cblx0XHQjIHNlYXJjaCB0aGUgbmVhcmVzdCBfdmFsdWUgdG8gdGhlIHN0ZXBcblx0XHRpZiBzdGVwIGlzbnQgMVxuXHRcdFx0X3ZhbHVlID0gbmVhcmVzdCggX3ZhbHVlLCBzdGVwIClcblx0XHRcblx0XHQjIGNhbGMgdGhlIHByZWNpc2lvbiBieSBzdGVwXG5cdFx0X3ByZWNpc2lvbiA9IE1hdGgubWF4KCAwLCBNYXRoLmNlaWwoIE1hdGgubG9nKCAxL3N0ZXAgKSAvIE1hdGgubG9nKCAxMCApICkgKVxuXHRcdGlmIF9wcmVjaXNpb24gPiAwXG5cdFx0XHRfdmFsdWUgPSBwcmVjaXNpb24oIF92YWx1ZSwgX3ByZWNpc2lvbiApXG5cdFx0ZWxzZVxuXHRcdFx0X3ZhbHVlID0gTWF0aC5yb3VuZCggX3ZhbHVlIClcblx0XHRcdFxuXHRcdHJldHVybiBfdmFsdWVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0TnVtYmVyQmFzZVxuIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5cbmNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgQXJyYXlPcHRpb25zIGV4dGVuZHMgcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQXJyYXlPcHRpb25cblxuY2xhc3MgRmFjZXRTdWJBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdFxuXHR0ZW1wbGF0ZVJlc0xpOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2FycmF5X3Jlc3VsdGxpLmphZGVcIiApXG5cdFxuXHRvcHREZWZhdWx0OlxuXHRcdGxhYmVsOiBcIi1cIlxuXHRcdHZhbHVlOiBcIi1cIlxuXG5cdHNlbGVjdENvdW50OiAwXG5cblx0b3B0Q29sbDogU3RyaW5nT3B0aW9uc1xuXHRcblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApP1xuXHRcdFx0QHNlbGVjdENvdW50ID0gb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApXG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKT9cblx0XHRcdG9wdGlvbnMuY3VzdG9tID0gQm9vbGVhbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSApXG5cdFx0XHRcblx0XHRAY29sbGVjdGlvbiA9IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdFxuXHRcdGlmIG5vdCBvcHRpb25zLmN1c3RvbSBhbmQgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdEBzZWxlY3RDb3VudCA9IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0XG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdFxuXHRcdEByZXN1bHQub24gXCJyZW1vdmVcIiwgKCBtZGwsIGNvbGwgKT0+XG5cdFx0XHRpZiBjb2xsLmxlbmd0aFxuXHRcdFx0XHRvcHRpb25zLnN1Yi5yZW5kZXJSZXN1bHQoKVxuXHRcdFx0QHNlYXJjaGNvbGwuYWRkKCBtZGwgKVxuXHRcdFx0QHRyaWdnZXIoIFwicmVtb3ZlZFwiLCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRpbml0aWFsaXplOiA9PlxuXHRcdEBlZGl0TW9kZSA9IGZhbHNlXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciBpbnB1dCMje0BjaWR9XCIgXSA9IFwiY2xvc2VcIlxuXHRcdHJldHVybiBfZXZudHNcblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0IyBjaGVjayBpZiB0aGUgY2xvc2UgaXMgaW5pdGllZCBmcm9tIHRoZSBlZGl0IG1vZGVcblx0XHRfZGVsU3ViID0gZmFsc2Vcblx0XHRpZiBAZWRpdE1vZGVcblx0XHRcdF9kZWxTdWIgPSB0cnVlXG5cdFx0XHRcblx0XHRAZWRpdE1vZGUgPSBmYWxzZVxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QGZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdFx0aWYgX2RlbFN1YiBhbmQgQHJlc3VsdC5sZW5ndGggPD0gMFxuXHRcdFx0QHN1Yi5kZWwoKVxuXHRcdHJldHVybiBzdXBlclxuXHRcblx0cm1SZXM6ICggZXZudCApPT5cblx0XHRpZiBldm50Py50YXJnZXQ/XG5cdFx0XHRfaWQgPSAkKCBldm50LnRhcmdldCApPy5kYXRhKCBcImlkXCIgKVxuXHRcdGVsc2UgaWYgZXZudD9cblx0XHRcdF9pZCA9IGV2bnRcblx0XHRfbWRsID0gQHJlc3VsdC5nZXQoIF9pZCApXG5cdFx0aWYgX21kbD9cblx0XHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdFx0aWYgX21kbD8uZ2V0KCBcImN1c3RvbVwiIClcblx0XHRcdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBfaWQgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRlZGl0UmVzOiAoIGV2bnQgKT0+XG5cdFx0QGVkaXRNb2RlID0gdHJ1ZVxuXHRcdF9pZCA9ICQoIGV2bnQudGFyZ2V0ICk/LmRhdGEoIFwiaWRcIiApXG5cdFx0X3YgPSBAX2VkaXR2YWwgPSBAcmVzdWx0LmdldCggX2lkICkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFxuXHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggX2lkIClcblx0XHRAc3ViLnJlb3BlbigpXG5cdFx0XG5cdFx0QHNlYXJjaChfdilcblx0XHRyZXR1cm5cblx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IHN1cGVyXG5cdFx0aWYgQF9lZGl0dmFsPy5sZW5ndGhcblx0XHRcdF9kYXRhLmlucHZhbCA9IEBfZWRpdHZhbFxuXHRcdFx0QF9lZGl0dmFsID0gbnVsbFxuXHRcdHJldHVybiBfZGF0YVxuXHRcblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIEB0ZW1wbGF0ZVJlc0xpKCB0eHQ6IG1vZGVsLmdldExhYmVsKCksIGlkOiBtb2RlbC5pZCwgY3VzdG9tOiBtb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSAgKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XHRcblx0c2VsZWN0OiA9PlxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF92YWxzID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBfdmFscz8gYW5kIG5vdCBfLmlzQXJyYXkoIF92YWxzIClcblx0XHRcdF92YWxzID0gWyBfdmFscyBdXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0Zm9yIF92YWwgaW4gKCBpZiBAc2VsZWN0Q291bnQgPD0gMCB0aGVuIF92YWxzIGVsc2UgX3ZhbHNbLi4uQHNlbGVjdENvdW50XSApXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0XG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHQjIGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0IyBcdF9pZCA9IEByZXN1bHQubGFzdCgpPy5pZFxuXHRcdFx0IyBcdEBybVJlcyggX2lkIClcblx0XHRcdHN1cGVyXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRzZWFyY2hDb250ZW50ID0gQCRpbnAudmFsKClcblx0XHRpZiBzZWFyY2hDb250ZW50Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RBY3RpdmUoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdEBsb2FkaW5nID0gdHJ1ZVxuXHRcdFx0X2NvbGwgPSBuZXcgQG9wdENvbGwoIFtdIClcblx0XHRcdFxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QCRlbC5wYXJlbnQoKS5hZGRDbGFzcyggXCJsb2FkaW5nXCIgKVxuXHRcdFx0XHRvcHRpb25zIEByZXN1bHQsIEBtb2RlbCwgKCBhT3B0cyApPT5cblx0XHRcdFx0XHRmb3IgX29wdCwgaWR4IGluIGFPcHRzXG5cdFx0XHRcdFx0XHRhT3B0c1tpZHhdID0gXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgX29wdCwgeyBjdXN0b206IGZhbHNlIH0gKVxuXHRcdFx0XHRcdF9jb2xsLmFkZCggYU9wdHMgKVxuXHRcdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0XHRAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzKCBcImxvYWRpbmdcIiApXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XG5cdFx0XHQsIDAgKVxuXHRcdFx0cmV0dXJuIF9jb2xsXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3Qob3B0KVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIG5ldyBAb3B0Q29sbCggX29wdHMgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheVxuIiwiY2xhc3MgRmFjZXRTdWJzTnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkZWxPcCA9IEAkZWwuZmluZCggXCIub3BlcmF0b3JcIiApXG5cdFx0XHRAZWxPcCA9IEAkZWxPcC5nZXQoMClcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEBzZWxlY3QyT3AgPSBAJGlucE9wLnNlbGVjdDIoIHsgd2lkdGg6IFwiYXV0b1wiIH0gKS5kYXRhKCBcInNlbGVjdDJcIiApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiXCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdFxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdFx0QCRpbnBPcC5yZW1vdmUoKVxuXHRcdFx0QCRpbnBPcCA9IG51bGxcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfcG9zT3BXcnAgPSAtMVxuXHRcdGlmIGV2bnQ/LnJlbGF0ZWRUYXJnZXRcblx0XHRcdF9wb3NPcFdycCA9IEBlbE9wPy5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudD8ucmVsYXRlZFRhcmdldCApXG5cdFx0XHRpZiBfcG9zT3BXcnAgaXMgMjBcblx0XHRcdFx0cmV0dXJuXG5cdFx0aWYgZXZudD8udHlwZSBpcyBcImZvY3Vzb3V0XCIgYW5kIF9wb3NPcFdycCBpc250IDIwXG5cdFx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRcdGlmIF92YWw/XG5cdFx0XHRcdEBzZXQoIF92YWwsIGV2bnQgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBldm50Py5yZWxhdGVkVGFyZ2V0P1xuXHRcdFx0X3Bvc1dycCA9IEBlbC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudD8ucmVsYXRlZFRhcmdldCApXG5cdFx0XHRpZiBub3QgKCBfcG9zV3JwIGlzIDAgb3IgX3Bvc1dycCAtIDE2ID49IDAgKVxuXHRcdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdHJldHVyblxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBPcD8uZ2V0KDApIClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAbW9kZWwuc2V0KCB7IG9wZXJhdG9yOiBAJGlucE9wLnZhbCgpIH0gKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXG5cdF9vcFNlbGVjdGVkOiA9PlxuXHRcdEBzZWxlY3RlZE9QID0gdHJ1ZVxuXHRcdEBmb2N1cygpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0aWYgQCRpbnBPcD8gYW5kIG5vdCBAc2VsZWN0ZWRPUFxuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdEAkaW5wLnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQuZmlyc3QoKT8uZ2V0KCBcInZhbHVlXCIgKVxuXHRcdF9vbGRPcCA9IEByZXN1bHQuZmlyc3QoKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgeyBvcGVyYXRvcnM6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKSwgb3BlcmF0b3I6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JcIiApfSApXG5cblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cblx0XHRpZiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0aWYgQCRpbnAuaXMoIGV2bnQudGFyZ2V0ICkgYW5kIGV2bnQuc2hpZnRLZXlcblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0QCRpbnBPcC5mb2N1cygpXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XG5cdFx0XHRpZiAoIEBzZWxlY3QyT3AuJHNlbGVjdGlvbi5pcyggZXZudC50YXJnZXQgKSBvciBldm50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoIFwic2VsZWN0Mi1zZWFyY2hfX2ZpZWxkXCIgKSApIGFuZCBub3QgZXZudC5zaGlmdEtleVxuXHRcdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRAJGlucC5mb2N1cygpLnNlbGVjdCgpXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRcdFxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCggZXZudCApXG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD8gb3IgQG1vZGVsLmdldCggXCJvcGVyYXRvclwiICk/XG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0XHRcdG9wZXJhdG9yOiBAJGlucE9wPy52YWwoKSBvciBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRyZXR1cm4gX3JldFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNOdW1iZXJcbiIsImNsYXNzIEZhY2V0U3Vic1JhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yYW5nZS5qYWRlXCIgKVxuXG5cdF9nZXRJbnBTZWxlY3RvcjogKCBleHQgPSBcIl9mcm9tXCIgKT0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfSN7ZXh0fVwiXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwic2VsZWN0XCJcblx0XHRcIm1vdXNlZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJjbGlja1NlbFwiXG5cdFx0XCJtb3VzZWRvd24gI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiY2xpY2tTZWxcIlxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCJcIlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0cmV0dXJuIFwiPGxpPlwiICtfcmVzLnZhbHVlLmpvaW4oIFwiIC0gXCIgKSArIFwiPC9saT5cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wVG8gPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5zZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcblx0Y2xpY2tTZWw6ICggZXZudCApPT5cblx0XHRldm50LmN1cnJlbnRUYXJnZXQuZm9jdXMoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQuZmlyc3QoKS5nZXQoIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRpZiBldm50PyBhbmQgKCBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wLmdldCgwKSBvciBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wVG8uZ2V0KDApIClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XG5cdFx0I2lmIEAkaW5wLmlzKCBldm50LnRhcmdldCApIGFuZCBub3QgZXZudC5zaGlmdEtleVxuXHRcdFx0XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGNsb3NlOiA9PlxuXHRcdHRyeVxuXHRcdFx0QCQoIFwiLnJhbmdlaW5wXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHRfcmV0ID1cblx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdkZyb20gPSBzdXBlclxuXHRcdF92ID0gQCRpbnBUby52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdF92VG8gPSBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRcdHJldHVybiBbIF92RnJvbSwgX3ZUbyBdXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRcblx0XHRpZiBAJGlucC5pcyggZXZudC50YXJnZXQgKSBhbmQgbm90IGV2bnQuc2hpZnRLZXlcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0QCRpbnBUby5mb2N1cygpLnNlbGVjdCgpXG5cdFx0XHRjb25zb2xlLmxvZyBcImZvY3VzIG5leHRcIlxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XG5cdFx0aWYgQCRpbnBUby5pcyggZXZudC50YXJnZXQgKSBhbmQgZXZudC5zaGlmdEtleVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRAJGlucC5mb2N1cygpLnNlbGVjdCgpXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIF92YWw/Lmxlbmd0aCA+PSAyXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFxuXHRcdCMgcmV0dXJuIGZhbHNlIHRvIHByZXZlbnQganVtcCB0byBuZXh0IGZhY2V0XG5cdFx0cmV0dXJuIHRydWVcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzU2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3NlbGVjdC5qYWRlXCIgKVxuXG5cdGZvcmNlZE1vZHVsZU9wdHM6e31cblx0I1x0bXVsdGlwbGU6IHRydWVcblxuXHRkZWZhdWx0TW9kdWxlT3B0czpcblx0XHQjbWF4aW11bVNlbGVjdGlvbkxlbmd0aDogMVxuXHRcdHdpZHRoOiBcImF1dG9cIlxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHRcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAY29udmVydFZhbHVlVG9JbnQgPSBAX2NoZWNrSW50VmFsdWUoIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0ge31cblx0XHRfZXZudHNbIFwiY2xpY2sgLnNlbGVjdC1jaGVja1wiIF0gPSBcInNlbGVjdFwiIGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cdF9nZXRJbnBTZWxlY3RvcjogPT5cblx0XHRyZXR1cm4gXCJzZWxlY3QjI3tAY2lkfVwiXG5cdFx0XG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHQjIHByZXZlbnQgZnJvbSBhc3luYyBsaXN0ZW5pbmcgb24gbWFudWFsIGFjY2Vzc1xuXHRcdEBtb2RlbC5zZXQoIFwid2FpdEZvckFzeW5jXCIsIGZhbHNlIClcblx0XHRAX2luaXRTZWxlY3QyKClcblx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLnNob3coKVxuXHRcdEBzZWxlY3QyLm9wZW4oKVxuXHRcdCNlbHNlXG5cdFx0XHQjQCRpbnAuc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdHJldHVybiBzdXBlclxuXHRcblx0X2lzRnVsbDogPT5cblx0XHRpZiBAc2VsZWN0Q291bnQgPD0gMFxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuICggQHJlc3VsdCBvciBbXSkubGVuZ3RoID49IEBzZWxlY3RDb3VudFxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdGlmIEBfaXNGdWxsKClcblx0XHRcdHJldHVyblxuXHRcdCMgc2V0IHRoZSBjdXJyZW50IHZhbHVlc1xuXHRcdF9vbGRWYWxzID0gQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbHMgKVxuXHRcdFxuXHRcdCMgcmVzZXQgcmVzdWx0cyBhbmQgc2VsZWN0MlxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KClcblx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLm9mZigpXG5cdFx0QHNlbGVjdDIuZGVzdHJveSgpXG5cdFx0QHJlc3VsdC5yZXNldCgpXG5cdFx0QHNlbGVjdDIgPSBudWxsXG5cdFx0XG5cdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdF9jaGVja0ludFZhbHVlOiAoIF9vcHRzID0gW10gKT0+XG5cdFx0aWYgbm90IF9vcHRzIG9yIG5vdCBfb3B0cy5sZW5ndGhcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdGZvciBfdiBpbiBfb3B0c1xuXHRcdFx0aWYgX3YudmFsdWU/IGFuZCBfLmlzU3RyaW5nKCBfdi52YWx1ZSApXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgX3YuaWQ/IGFuZCBfLmlzU3RyaW5nKCBfdi5pZCApXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgX3Y/IGFuZCBfLmlzU3RyaW5nKCBfdiApXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XG5cdFx0cmV0dXJuIHRydWVcblxuXHRfaW5pdFNlbGVjdDI6ID0+XG5cdFx0XG5cdFx0aWYgbm90IEBzZWxlY3QyP1xuXHRcdFx0X29wdHMgPSBfLmV4dGVuZCgge30sIEBkZWZhdWx0TW9kdWxlT3B0cywgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICkgb3IgZmFsc2UgfSwgQGZvcmNlZE1vZHVsZU9wdHMgKVxuXHRcdFx0QCRpbnAuc2VsZWN0MiggX29wdHMgKVxuXHRcdFx0QHNlbGVjdDIgPSBAJGlucC5kYXRhKCBcInNlbGVjdDJcIiApXG5cdFx0XHRpZiBub3QgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRcdFx0QCRpbnAub24gXCJzZWxlY3QyOnNlbGVjdCBzZWxlY3QyOmNsb3NlXCIsIEBzZWxlY3Rcblx0XHRcdFxuXHRcdFx0aWYgbm90IEBzZWxlY3QyLl9ldmVudHNBZGRlZFxuXHRcdFx0XHRAc2VsZWN0Mi5fZXZlbnRzQWRkZWQgPSB0cnVlXG5cdFx0XHRcdCMgYWZ0ZXIgbG9hZGluZyB0cnkgdG8gc2V0IHRoZSBjdXJzb3IgZm9jdXNcblx0XHRcdFx0QHNlbGVjdDIub24gXCJyZXN1bHRzOmFsbFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdFx0QGNvbnZlcnRWYWx1ZVRvSW50ID0gQF9jaGVja0ludFZhbHVlKCByZXN1bHRzPy5kYXRhPy5yZXN1bHRzIClcblx0XHRcdFx0XHRAc2VsZWN0Mi5zZWxlY3Rpb24/LiRzZWFyY2g/LmZvY3VzPygpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFxuXHRcdFx0XHQjIGxpc3RlbiB0byBhc3luYyByZXN1bHQgY2hhbmdlcyBhbmQgc2V0IHRoZSBzZWxlY3Rpb25cblx0XHRcdFx0QHNlbGVjdDIuZGF0YUFkYXB0ZXIuY3VycmVudCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRcdFx0aWYgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRcdFx0XHRfZGF0YSA9IFtdXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGZvciByZXN1bHQgaW4gcmVzdWx0c1xuXHRcdFx0XHRcdFx0XHRfZGF0YS5wdXNoIEBfY29udmVydFZhbHVlKCByZXN1bHQgKVxuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdCMgc2VsZWN0IHRoZSBhY3RpdmUvcHJlZGVmaW5lZCByZXN1bHRzXG5cdFx0XHRcdFx0XHRAX3NlbGVjdCggX2RhdGEgKVxuXHRcdFx0XHRcdFx0QGNsb3NlKClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcblx0XHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdFx0QHNlbGVjdDIuJGVsZW1lbnQuaGlkZSgpXG5cdFx0XHRcdEBzZWxlY3QyLiRzZWxlY3Rpb24ub24gXCJmb2N1c291dFwiLCAoIGV2bnQgKT0+XG5cdFx0XHRcdFx0QFRNZm9jdXNPdXQgPSBzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHQsIDE1MCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFxuXHRcdFx0XHRAc2VsZWN0Mi4kc2VsZWN0aW9uLm9uIFwiZm9jdXNpblwiLCAoIGV2bnQgKT0+XG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KCBAVE1mb2N1c091dCApIGlmIEBUTWZvY3VzT3V0P1xuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XHRcblx0XHRcdCMkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBAc2VsZWN0MlxuXG5cdF9zZWwyb3BlbjogKCBldm50ICktPlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdHJlbW92ZTogPT5cblx0XHQjQCRpbnAuc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IF8uZXh0ZW5kKCB7fSwgc3VwZXIsIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApLCBvcHRpb25zOiBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKSB9IClcblx0XHRpZiBfZGF0YS52YWx1ZT8gYW5kIF8uaXNBcnJheSggX2RhdGEudmFsdWUgKVxuXHRcdFx0Zm9yIF92LCBfaWR4IGluIF9kYXRhLnZhbHVlXG5cdFx0XHRcdF9kYXRhLnZhbHVlWyBfaWR4IF0gPSBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfdiApIGVsc2UgX3YudG9TdHJpbmcoKVxuXHRcdGVsc2UgaWYgX2RhdGEudmFsdWU/XG5cdFx0XHRfZGF0YS52YWx1ZSA9IFsgaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX2RhdGEudmFsdWUgKSBlbHNlIF9kYXRhLnZhbHVlLnRvU3RyaW5nKCkgXVxuXHRcdFxuXHRcdGlmIF9kYXRhLnZhbHVlP1xuXHRcdFx0X3ZsaXN0ID0gXy5wbHVjayggX2RhdGEub3B0aW9ucywgXCJ2YWx1ZVwiIClcblx0XHRcdGZvciBfdiBpbiBfZGF0YS52YWx1ZSB3aGVuIF92IG5vdCBpbiBfdmxpc3Rcblx0XHRcdFx0X2RhdGEub3B0aW9ucy5wdXNoIHsgdmFsdWU6ICggaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX3YgKSBlbHNlIF92LnRvU3RyaW5nKCkgKSwgbGFiZWw6IF92LCBncm91cDogdW5kZWZpbmVkIH1cblx0XHRcblx0XHRfZ3JvdXBzID0gXy5ncm91cEJ5KCBfZGF0YS5vcHRpb25zLCBcImdyb3VwXCIgKVxuXHRcdGlmIF8uY29tcGFjdCggXy5rZXlzKCBfZ3JvdXBzIG9yIHt9ICkgKS5sZW5ndGggPiAxXG5cdFx0XHRfZGF0YS5vcHRpb25Hcm91cHMgPSBfZ3JvdXBzXG5cdFx0cmV0dXJuIF9kYXRhXG5cdFxuXHRfaGFzVGFiTGlzdGVuZXI6ICggY3JlYXRlICk9PlxuXHRcdGlmIGNyZWF0ZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIEBtb2RlbC5nZXQoXCJtdWx0aXBsZVwiKVxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleXVwXCJcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ZhbHMgPSBbXVxuXHRcdGZvciBkYXRhIGluIEBfaW5pdFNlbGVjdDIoKT8uZGF0YSgpIG9yIFtdXG5cdFx0XHRcblx0XHRcdF92YWxzLnB1c2goIEBfY29udmVydFZhbHVlKCBkYXRhICkgKVxuXHRcdHJldHVybiBfdmFsc1xuXHRcblx0X2NvbnZlcnRWYWx1ZTogKCBkYXRhICk9PlxuXHRcdF9kYXRhID0ge31cblx0XHRpZiBAY29udmVydFZhbHVlVG9JbnRcblx0XHRcdF9kYXRhLnZhbHVlID0gcGFyc2VGbG9hdCggZGF0YS5pZCApXG5cdFx0ZWxzZVxuXHRcdFx0X2RhdGEudmFsdWUgPSBkYXRhLmlkXG5cdFx0aWYgZGF0YS50ZXh0P1xuXHRcdFx0aWYgZGF0YS50ZXh0IGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0Lmh0bWwoKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfZGF0YS5sYWJlbCA9IGRhdGEudGV4dFxuXHRcdFx0XG5cdFx0cmV0dXJuIF9kYXRhXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogKCBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBvcHQgKSBlbHNlIG9wdC50b1N0cmluZygpICksIGxhYmVsOiBvcHQsIGdyb3VwOiBudWxsIH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdCggb3B0IClcblx0XHRcdFx0b3B0LnZhbHVlID0gaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggb3B0LnZhbHVlICkgZWxzZSBvcHQudmFsdWUudG9TdHJpbmcoKVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0dW5zZWxlY3Q6ICggZXZudCApPT5cblx0XHRAcmVzdWx0LnJlbW92ZSggZXZudC5wYXJhbXM/LmRhdGE/LmlkIClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRpZiBAbW9kZWwuZ2V0KCBcIndhaXRGb3JBc3luY1wiIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEBzZWxlY3QyP1xuXHRcdFx0I0BzZWxlY3QyPy5kZXN0cm95KClcblx0XHRcdEBzZWxlY3QyLiRjb250YWluZXIuaGlkZSgpXG5cdFx0QCRpbnA/LnJlbW92ZSgpXG5cdFx0QCQoIFwiLnNlbGVjdC1jaGVja1wiICkucmVtb3ZlKClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKSBpZiBldm50Py5zdG9wUHJvcGFnYXRpb25cblx0XHRfdmFscyA9IEBnZXRWYWx1ZSgpXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdCMgSXNzdWUjNDkgaWYgbm90aGluZyB3YXMgc2VsZWN0ZWQgY2xvc2UgdGhlIHNlbGVjdC12aWV3IGFuZCByZW1vdmUgdGhlIHdob2xlIGZhY2V0XG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0XHRAc3ViLmRlbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRAX3NlbGVjdCggX3ZhbHMgKVxuXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdF9zZWxlY3Q6ICggX3ZhbHMgKT0+XG5cdFx0QG1vZGVsLnNldCggXCJ3YWl0Rm9yQXN5bmNcIiwgZmFsc2UgKVxuXHRcdE1vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdGZvciBfdmFsIGluIF92YWxzXG5cdFx0XHRAcmVzdWx0LmFkZCggbmV3IE1vZGVsQ29uc3QoIF92YWwgKSApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzU2VsZWN0XG4iLCJjbGFzcyBGYWNldFN1YlN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zdHJpbmcuamFkZVwiIClcblx0XG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJzZWxlY3RcIlxuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0c3VwZXJcblx0XHR0cnlcblx0XHRcdEAkaW5wPy5yZW1vdmU/KClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdD8uZmlyc3QoKT8uZ2V0KCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGZvY3VzOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRpbnAuc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3ViU3RyaW5nXG4iLCJTdWJWaWV3ID0gcmVxdWlyZSggXCIuL3N1YlwiIClcblNlbGVjdG9yVmlldyA9IHJlcXVpcmUoIFwiLi9zZWxlY3RvclwiIClcblxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBNYWluVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvd3JhcHBlci5qYWRlXCIgKVxuXG5cdGV2ZW50czpcblx0XHRcIm1vdXNlZG93biAuc2VhcmNoLWJ0blwiOiBcIl9vblNlYXJjaFwiXG5cdFx0XCJjbGljayAuc2VhcmNoLWJ0blwiOiBcIl9vblNlYXJjaFwiXG5cdFx0XCJmb2N1cyAuc2VhcmNoLWJ0blwiOiBcIl9vbkZvY3VzU2VhcmNoXCJcblx0XHRcIm1vdXNlZG93biAuYWRkLWZhY2V0LWJ0blwiOiBcIl9hZGRGYWNldFwiXG5cdFx0XCJjbGlja1wiOiBcIl9hZGRGYWNldFwiXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdFxuXHRcdEBtYWluID0gb3B0aW9ucy5tYWluXG5cdFx0QGlkeCA9IG9wdGlvbnMuaWR4XG5cdFx0QHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcblx0XHRAc2VhcmNoQnV0dG9uID0gb3B0aW9ucy5zZWFyY2hCdXR0b25cblx0XHRcblx0XHRAZmFjZXRzID0ge31cblx0XHRcblx0XHRAY29sbGVjdGlvbi5vbiBcImlnZ3k6cmVtXCIsIEByZW1GYWNldFxuXHRcdFxuXHRcdF9jbCA9IFwiaWdneSBjbGVhcmZpeFwiXG5cdFx0aWYgQGVsLmNsYXNzTmFtZT8ubGVuZ3RoXG5cdFx0XHRfY2wgPSBcIiBcIiArIF9jbFxuXHRcdEBlbC5jbGFzc05hbWUgKz0gX2NsXG5cdFx0QHJlbmRlcigpXG5cdFx0QF9vdXRlckNsaWNrTGlzdGVuKClcblx0XHRAX2tleUxpc3RlbigpXG5cdFx0XG5cdFx0X3ZhbHVlRmFjZXRzID0gQGNvbGxlY3Rpb24uZmlsdGVyKCAoIGZjdCApLT5yZXR1cm4gZmN0Py5nZXQoIFwidmFsdWVcIiApPyBvciBmY3Q/LmdldCggXCJwaW5uZWRcIiApIClcblx0XHRcblx0XHRfZm5Tb3J0ID0gKCBrZXkgKS0+XG5cdFx0XHRyZXR1cm4gKCB2MSwgdjIgKS0+XG5cdFx0XHRcdGlmIHYxWyBrZXkgXSA+IHYyWyBrZXkgXVxuXHRcdFx0XHRcdHJldHVybiAxXG5cdFx0XHRcdGlmIHYxWyBrZXkgXSA8IHYyWyBrZXkgXVxuXHRcdFx0XHRcdHJldHVybiAtMVxuXHRcdFx0XHRyZXR1cm4gMFxuXHRcdFxuXHRcdGZvciBmY3QgaW4gX3ZhbHVlRmFjZXRzLnNvcnQoIF9mblNvcnQoIFwiX2lkeFwiICkgKVxuXHRcdFx0QGdlblN1YiggZmN0LCBmYWxzZSwgdHJ1ZSApXG5cdFx0XG5cdFx0QGNvbGxlY3Rpb24ub24gXCJhZGRcIiwgPT5cblx0XHRcdEAkYWRkQnRuLnNob3coKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdF9hY3RpdmUgPSBAY29sbGVjdGlvbi5maWx0ZXIoICggZmN0ICktPnJldHVybiBmY3Q/LmdldCggXCJhY3RpdmVcIiApIGFuZCBmY3Q/LmdldCggXCJwaW5uZWRcIiApIClcblx0XHRcdGlmIF9hY3RpdmUubGVuZ3RoXG5cdFx0XHRcdHZpZXcgPSBAZmFjZXRzWyBfYWN0aXZlWyAwIF0uaWQgXVxuXHRcdFx0XHQjQHN1YnZpZXcgPSB2aWV3XG5cdFx0XHRcdHZpZXc/LnJlb3BlbigpXG5cdFx0XHRcdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdCwgMCApXG5cdFx0XG5cdFx0cmV0dXJuXG5cdFxuXHR0ZW1wbGF0ZURhdGE6ID0+XG5cdFx0X3JldCA9XG5cdFx0XHR0YWJfaW5kZXg6ICggKCAoIEBpZHggb3IgMSApICsgMSApICogMTAwMCApIC0gMTBcblx0XHRpZiAgQHNlYXJjaEJ1dHRvbj9cblx0XHRcdF9yZXQuc2VhcmNoQnV0dG9uID1cblx0XHRcdFx0dGVtcGxhdGU6IEBzZWFyY2hCdXR0b24udGVtcGxhdGUgb3IgXCJcIlxuXHRcdFx0XHRldmVudDogQHNlYXJjaEJ1dHRvbi5ldmVudCBvciBcInNlYXJjaFwiXG5cdFx0XHRcdHB1bGxyaWdodDogQHNlYXJjaEJ1dHRvbi5wdWxscmlnaHQgb3IgZmFsc2Vcblx0XHRcdFx0Y3NzY2xhc3M6IEBzZWFyY2hCdXR0b24uY3NzY2xhc3Mgb3IgXCJidG4gYnRuLXByaW1hcnkgZmEgZmEtc2VhcmNoXCJcblx0XHRcblx0XHRyZXR1cm4gX3JldFxuXHRcblx0cmVuZGVyOiA9PlxuXHRcdF90cGxEYXRhID0gQHRlbXBsYXRlRGF0YSgpXG5cdFx0QCRlbC5odG1sKCBAdGVtcGxhdGUoIF90cGxEYXRhICkgKVxuXHRcdEAkYWRkQnRuID0gQCQoIFwiLmFkZC1mYWNldC1idG5cIiApXG5cdFx0aWYgX3RwbERhdGEuc2VhcmNoQnV0dG9uP1xuXHRcdFx0QCRzZWFyY2hCdG4gPSBAJCggXCIuc2VhcmNoLWJ0blwiIClcblx0XHRyZXR1cm5cblxuXHRfYWRkRmFjZXQ6ICggZXZudCApPT5cblx0XHRAVE1vcGVuQWRkRmFjZXQgPSBzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QGFkZEZhY2V0KClcblx0XHRcdHJldHVyblxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cblx0ZXhpdDogKCBuZXh0QWRkID0gdHJ1ZSApPT5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBuZXh0QWRkXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVtRmFjZXQ6ICggZmFjZXRNICk9PlxuXHRcdEByZXN1bHRzLnJlbW92ZSggZmFjZXRNLmdldCggXCJuYW1lXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0c2V0RmFjZXQ6ICggZmFjZXRNLCBkYXRhICk9PlxuXHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdEByZXN1bHRzLmFkZCggXy5leHRlbmQoIGRhdGEsIHsgbmFtZTogZmFjZXRNLmdldCggXCJuYW1lXCIgKSwgdHlwZTogZmFjZXRNLmdldCggXCJ0eXBlXCIgKSB9ICksIHsgbWVyZ2U6IHRydWUsIHBhcnNlOiB0cnVlLCBfZmFjZXQ6IGZhY2V0TSB9IClcblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRAJGFkZEJ0bi5oaWRlKClcblx0XHRyZXR1cm5cblxuXHRnZW5TdWI6ICggZmFjZXRNLCBhZGRBZnRlciA9IHRydWUsIGluaXRpYWxBZGQ9ZmFsc2UgKT0+XG5cdFx0c3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgcGFyZW50OiBAIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cywgZXZudCApPT5cblx0XHRcdGlmIHN1YnZpZXc/Lm1vZGVsPy5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVUIgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHQjc3Vidmlldy5vZmYoKVxuXHRcdFx0c3Vidmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIGFkZEFmdGVyIGFuZCBldm50Py50eXBlIGlzbnQgXCJmb2N1c291dFwiXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwicmVvcGVuXCIsID0+XG5cdFx0XHRAc2VsZWN0dmlldz8uY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfc2VsZiA9IEBcblx0XHRzdWJ2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0sIGRhdGEsIGV2bnQgKS0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJzdWJ2aWV3IC0gc2VsZWN0ZWRcIiwgZGF0YSwgQGlzUmVzdWx0RW1wdHkoIGRhdGEgKVxuXHRcdFx0X3NlbGYuc2V0RmFjZXQoIGZhY2V0TSwgZGF0YSApXG5cdFx0XHRpZiAoIG5vdCBAc2VsZWN0dmlldy5faXNGdWxsPyBvciBAc2VsZWN0dmlldy5faXNGdWxsKCkgKSBhbmQgZXZudD8udHlwZSBpc250IFwiZm9jdXNvdXRcIlxuXHRcdFx0XHRfc2VsZi5fbmV4dEZhY2V0KCBudWxsLCBAIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdHN1YnZpZXcuZXZlbnRzQXR0YWNoZWQgPSB0cnVlXG5cdFx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBzdWJ2aWV3LnJlbmRlciggaW5pdGlhbEFkZCApIClcblx0XHRAZmFjZXRzWyBmYWNldE0uaWQgXSA9IHN1YnZpZXdcblx0XHRyZXR1cm4gc3Vidmlld1xuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdCNjb25zb2xlLmVycm9yIFwiYWRkRmFjZXRcIiwgQHNlbGVjdHZpZXc/LCBAc3Vidmlldz9cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBTRUxFQ1QgRVhJU1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBAc3Vidmlldz9cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBTVUIgRVhJU1RcIlxuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0I3JldHVyblxuXG5cdFx0aWYgbm90IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIEVNUFRZIENPTExcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBTZWxlY3RvclZpZXcoIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBjdXN0b206IGZhbHNlLCBtYWluOiBAIClcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwib3BlbmVkXCIsID0+XG5cdFx0XHRAX29uT3BlbmVkKClcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0QF9vbkNsb3NlZCgpXG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpXG5cdFx0XHRAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdGlmIG5vdCByZXN1bHRzPy5sZW5ndGggYW5kIEBzdWJ2aWV3P1xuXHRcdFx0XHQjQHN1YnZpZXcub2ZmKClcblx0XHRcdFx0QHN1YnZpZXcucmVtb3ZlKClcblx0XHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0sIGRhdGEsIGV2bnQgKT0+XG5cdFx0XHRmYWNldE0uc2V0KCBcInZhbHVlXCIsIG51bGwgKVxuXHRcdFx0QHN1YnZpZXcgPSBAZ2VuU3ViKCBmYWNldE0gKVxuXHRcdFx0QHN1YnZpZXcub3BlbigpXG5cdFx0XHRyZXR1cm5cblx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXHRcdHJldHVyblxuXHRcblx0X29uT3BlbmVkOiA9PlxuXHRcdEAkYWRkQnRuPy5oaWRlKClcblx0XHRyZXR1cm5cblx0XG5cdF9vbkNsb3NlZDogPT5cblx0XHRAJGFkZEJ0bj8uc2hvdygpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb3V0ZXJDbGlja0xpc3RlbjogPT5cblx0XHRqUXVlcnkoIGRvY3VtZW50ICkub24gXCJjbGlja1wiLCBAX291dGVyQ2xpY2tcblx0XHRyZXR1cm5cblx0XG5cdF9rZXlMaXN0ZW46ID0+XG5cdFx0alF1ZXJ5KCBkb2N1bWVudCApLm9uIFwia2V5ZG93blwiLCAoIGV2bnQgKT0+XG5cdFx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuVEFCIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5UQUJcblx0XHRcdFx0I2V2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XG5cdFx0XHRcdGlmICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLnNlYXJjaC1idG5cIiApIGFuZCBldm50Py5zaGlmdEtleVxuXHRcdFx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdEBUTW9wZW5BZGRGYWNldCA9c2V0VGltZW91dCggPT5cblx0XHRcdFx0XHRcdEBhZGRGYWNldCgpXG5cdFx0XHRcdFx0LCAwIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcblx0XHRcdFx0IyBjYXNlIG9ubHkgdGhlIGZhY2V0IHNlbGVjdG9yIGlzIG9wZW5cblx0XHRcdFx0aWYgQHNlbGVjdHZpZXc/LmlzT3BlblxuXHRcdFx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdGlmIGV2bnQ/LnNoaWZ0S2V5XG5cdFx0XHRcdFx0XHRfcHJldklkID0gQCRhZGRCdG4/LnByZXZBbGwoIFwiLnN1YlwiICk/LmZpcnN0KCk/LmRhdGEoIFwiZmN0aWRcIiApXG5cdFx0XHRcdFx0XHRpZiBfcHJldklkP1xuXHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRcdFx0XHRcdEBmYWNldHNbIF9wcmV2SWQgXT8ucmVvcGVuKClcblx0XHRcdFx0XHRcdFx0LCAwIClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRAc2VsZWN0dmlldy5jbG9zZSgpXG5cdFx0XHRcdFx0XHRAZm9jdXNTZWFyY2goKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdCMgb3RoZXJ3aXNlIHRyaWdnZXIgZXNjYXBlIGV2ZW50IGFuZCBsaXN0ZW4gZm9yIHRoZSByZXNwb25zZSBvZiB0aGUgb3BlbiBmYWNldFxuXHRcdFx0XHRAdHJpZ2dlciBcImVzY2FwZVwiLCBldm50LCBAX25leHRGYWNldFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5FU0Mgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0XHRAZXhpdCgpXG5cdFx0XHRcdEB0cmlnZ2VyKCBcImVzY2FwZVwiLCBldm50IClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdF9uZXh0RmFjZXQ6ICggZXZudCwgc3ViVmlldyApPT5cblx0XHRfbmV4dEZuID0gaWYgZXZudD8uc2hpZnRLZXkgdGhlbiBcInByZXZcIiBlbHNlIFwibmV4dFwiXG5cdFx0X25leHQgPSBzdWJWaWV3LiRlbD9bIF9uZXh0Rm4gXT8oKVxuXHRcdFxuXHRcdGlmIF9uZXh0Lmhhc0NsYXNzKCBcImFkZC1mYWNldC1idG5cIiApXG5cdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QGFkZEZhY2V0KClcblx0XHRcdCwgMCApXG5cdFx0XHRyZXR1cm5cblx0XHRfbmV4dElkID0gX25leHQ/LmRhdGEoIFwiZmN0aWRcIiApXG5cdFx0aWYgX25leHRJZD9cblx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdEBmYWNldHNbIF9uZXh0SWQgXT8ucmVvcGVuKClcblx0XHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGZvY3VzU2VhcmNoOiA9PlxuXHRcdGlmIEAkc2VhcmNoQnRuP1xuXHRcdFx0QCRzZWFyY2hCdG4uZm9jdXMoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfb25TZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiAoIGV2bnQudHlwZSBpcyBcImNsaWNrXCIgYW5kIGV2bnQuZGV0YWlsIGlzIDAgKSBvciBldm50LnR5cGUgaXMgXCJtb3VzZWRvd25cIlxuXHRcdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QGV4aXQoKVxuXHRcdFx0QHRyaWdnZXIoIFwic2VhcmNoYnV0dG9uXCIsIEBzZWFyY2hCdXR0b24uZXZlbnQgKVxuXHRcdHJldHVyblxuXHRcblx0X29uRm9jdXNTZWFyY2g6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdHZpZXc/LmNsb3NlPygpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdF9vdXRlckNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0Y2xlYXJUaW1lb3V0KCBAVE1vcGVuQWRkRmFjZXQgKSBpZiBAVE1vcGVuQWRkRmFjZXQ/XG5cdFx0X3Bvc1dycCA9IEBlbC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudC50YXJnZXQgKVxuXHRcdGlmIG5vdCAoIF9wb3NXcnAgaXMgMCBvciBfcG9zV3JwIC0gMTYgPj0gMCApXG5cdFx0XHRAZXhpdCggZmFsc2UgKVxuXHRcdHJldHVyblxuXHRcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluVmlld1xuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTZWxlY3RvclZpZXcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRzL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9yLmphZGVcIiApXG5cdHRlbXBsYXRlRWw6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3JsaS5qYWRlXCIgKVxuXHRzZWxlY3RDb3VudDogMVxuXG5cdGNsYXNzTmFtZTogPT5cblx0XHRjbHMgPSBbIFwiYWRkLWZhY2V0XCIgXVxuXHRcdGlmIEBjdXN0b21cblx0XHRcdGNscy5wdXNoIFwiY3VzdG9tXCJcblx0XHRyZXR1cm4gY2xzLmpvaW4oIFwiIFwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJtb3VzZWRvd24gYVwiOiBcIl9vbkNsaWNrXCJcblx0XHRcImZvY3VzIGlucHV0IyN7QGNpZH1cIjogXCJvcGVuXCJcblx0XHQjXCJibHVyIGlucHV0IyN7QGNpZH1cIjogXCJjbG9zZVwiXG5cdFx0XCJrZXlkb3duIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAY3VzdG9tID0gb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0XG5cdFx0aWYgb3B0aW9ucy5tYWluP1xuXHRcdFx0QG1haW4gPSBvcHRpb25zLm1haW5cblx0XHRcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRzdXBlclxuXHRcdEBzZWFyY2hjb2xsID0gQGNvbGxlY3Rpb24uc3ViKCAtPnRydWUgKVxuXHRcdEByZXN1bHQgPSBuZXcgQGNvbGxlY3Rpb24uY29uc3RydWN0b3IoKVxuXHRcdFxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwiYWRkXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEBjaGVja09wdGlvbnNFbXB0eSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIGN1c3RvbTogQGN1c3RvbSApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRsaXN0ID0gQCRlbC5maW5kKCBcIiMje0BjaWR9dHlwZWxpc3RcIiApXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdHJlbmRlclJlczogPT5cblx0XHRAJGxpc3QuZW1wdHkoKVxuXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEBzZWFyY2hjb2xsLm1vZGVscyB3aGVuIG5vdCBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdF90bXBsID0gbW9kZWwuZ2V0KCBcImxhYmVsdGVtcGxhdGVcIiApXG5cdFx0XHRpZiBfdG1wbD9cblx0XHRcdFx0X2xibCA9IF90bXBsLnJlcGxhY2UoIFwie3tsYWJlbH19XCIsIF9sYmwgKVxuXHRcdFx0XHRcblx0XHRcdF9pZCA9IG1vZGVsLmlkXG5cdFx0XHRfY3NzY2xhc3MgPSBtb2RlbC5nZXQoIFwiY3NzY2xhc3NcIiApXG5cdFx0XHRpZiBAY3VyclF1ZXJ5Py5sZW5ndGggPiAxXG5cdFx0XHRcdF9sYmwgPSBfbGJsLnJlcGxhY2UoIG5ldyBSZWdFeHAoIEBjdXJyUXVlcnksIFwiZ2lcIiApLCAoKCBzdHIgKS0+cmV0dXJuIFwiPGI+I3tzdHJ9PC9iPlwiICkgKVxuXHRcdFx0X2xpc3QucHVzaCBsYWJlbDogX2xibCwgaWQ6IF9pZCwgY3NzY2xhc3M6IF9jc3NjbGFzc1xuXHRcdCNpZiBfbGlzdC5sZW5ndGhcblx0XHRAJGxpc3QuYXBwZW5kKCBAdGVtcGxhdGVFbChcblx0XHRcdGxpc3Q6IF9saXN0LFxuXHRcdFx0cXVlcnk6IEBjdXJyUXVlcnksXG5cdFx0XHRhY3RpdmVJZHg6IEBhY3RpdmVJZHgsXG5cdFx0XHRjdXN0b206IEBjdXN0b21cblx0XHQpIClcblxuXHRcdEBfY2hlY2tTY3JvbGwoKVxuXHRcdFxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRfc2Nyb2xsVGlsbDogMTk4XG5cdF9jaGVja1Njcm9sbDogPT5cblx0XHRfaGVpZ2h0ID0gQCRsaXN0LmhlaWdodCgpXG5cdFx0aWYgX2hlaWdodCA+IDBcblx0XHRcdEBzY3JvbGxIZWxwZXIoIF9oZWlnaHQgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGV4aXQgdGhlIHRoZSBjYWxsIHN0YWNrIHRvIGNoZWNrIGhlaWdodCBhZnRlciB0aGUgbW9kdWxlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBkb21cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHNjcm9sbEhlbHBlciggQCRsaXN0LmhlaWdodCgpIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXG5cdHNjcm9sbEhlbHBlcjogKCBoZWlnaHQgKT0+XG5cdFx0aWYgaGVpZ2h0ID49IEBfc2Nyb2xsVGlsbFxuXHRcdFx0QHNjcm9sbGluZyA9IHRydWVcblx0XHRlbHNlXG5cdFx0XHRAc2Nyb2xsaW5nID0gZmFsc2Vcblx0XHRyZXR1cm5cblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0aWYgbm90IF9pZD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX2lkIClcblx0XHRpZiBub3QgX21kbD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0QHNlbGVjdGVkKCBfbWRsIClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0cmV0dXJuIHRydWVcblx0XHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0aWYgQG1haW4/XG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBtYWluLmZvY3VzU2VhcmNoKClcblx0XHRlbHNlXG5cdFx0XHRzdXBlciggZXZlbnQgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3RlZDogKCBtZGwgKT0+XG5cdFx0aWYgbm90IEBtYWluPyBhbmQgQF9pc0Z1bGwoKVxuXHRcdFx0X2lkID0gQHJlc3VsdC5sYXN0KCk/LmlkXG5cdFx0XHRAcm1SZXMoIF9pZCApXG5cdFx0XHRcblx0XHR0cnlcblx0XHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdFx0bWRsPy5leGVjPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdGNhdGNoIF9lcnJcblx0XHRcdHRyeVxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBhY3RpdmVJZHg6I3tAYWN0aXZlSWR4fSAtIGNvbGxlY3Rpb246I3tKU09OLnN0cmluZ2lmeSggQGNvbGxlY3Rpb24udG9KU09OKCkpfVwiXG5cdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIXCJcblx0XHRcblx0XHRpZiBtZGw/XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIG1kbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogPT5cblx0XHRAJGlucC5mb2N1cygpXG5cdFx0X2VsID0gQCRpbnAuZ2V0KDApXG5cdFx0XG5cdFx0X2VsLnNlbGVjdGlvblN0YXJ0ID0gX2VsLnNlbGVjdGlvbkVuZCA9IF9lbC52YWx1ZS5sZW5ndGhcblx0XHRyZXR1cm5cblx0XG5cdG9wZW46ID0+XG5cdFx0I2NvbnNvbGUubG9nIFwic2VsZWN0b3Igb3BlblwiXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBtb3ZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QG1vdmUoIGZhbHNlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3RBY3RpdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgXy5pc1N0cmluZyggZXZudCApXG5cdFx0XHRfcSA9IGV2bnRcblx0XHRlbHNlXG5cdFx0XHRfcSA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpXG5cdFx0aWYgX3EgaXMgQGN1cnJRdWVyeVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAY3VyclF1ZXJ5ID0gX3FcblxuXHRcdEBzZWFyY2hjb2xsLnVwZGF0ZVN1YkZpbHRlciggKCBtZGwgKT0+XG5cdFx0XHRpZiBAcmVzdWx0LmdldCggbWRsLmlkICk/XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0aWYgbm90IF9xPy5sZW5ndGhcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdF9tYXRjaCA9IG1kbC5tYXRjaCggX3EgKVxuXHRcdFx0cmV0dXJuIF9tYXRjaFxuXHRcdCwgZmFsc2UgKVxuXG5cblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVyblxuXG5cdG1vdmU6ICggdXAgPSBmYWxzZSApPT5cblx0XHRfbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYVwiIClcblx0XG5cdFx0X2N1c3RvbUVsZW1lbnRDaGFuZ2UgPSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGggdGhlbiAwIGVsc2UgMVxuXHRcdF90b3AgPSAwXG5cdFx0aWYgdXBcblx0XHRcdGlmICggQGFjdGl2ZUlkeCAtIDEgKSA8IF90b3Bcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCAtIDFcblx0XHRlbHNlXG5cdFx0XHRpZiBAc2VhcmNoY29sbC5sZW5ndGggLSBfY3VzdG9tRWxlbWVudENoYW5nZSA8PSBAYWN0aXZlSWR4XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggKyAxXG5cblx0XHRcblx0XHRAJCggX2xpc3RbIEBhY3RpdmVJZHggXSApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiIClcblx0XHRfJGVsbmV3ID0gQCQoIF9saXN0WyBfbmV3aWR4IF0gKS5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG5cblx0XHRpZiBAc2Nyb2xsaW5nXG5cdFx0XHRfZWxIID0gXyRlbG5ldy5vdXRlckhlaWdodCgpXG5cdFx0XHRfcG9zID0gX2VsSCAqICggX25ld2lkeCArIDEgKVxuXHRcdFx0XyRsaXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdFwiIClcblx0XHRcdF9zY3JvbGxUID0gXyRsaXN0LnNjcm9sbFRvcCgpXG5cdFx0XHRpZiBfcG9zID4gX3Njcm9sbFQgKyBAX3Njcm9sbFRpbGxcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIEBfc2Nyb2xsVGlsbCApXG5cdFx0XHRlbHNlIGlmIF9wb3MgPCBfc2Nyb2xsVCArIF9lbEhcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIF9lbEggKVxuXG5cdFx0QGFjdGl2ZUlkeCA9IF9uZXdpZHhcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6PT5cblx0XHRyZXR1cm5cblxuXHRzZWxlY3RBY3RpdmU6ICggaXNFbnRlckV2ZW50PWZhbHNlICk9PlxuXHRcdGlmIG5vdCBAbWFpbj8gYW5kIEBfaXNGdWxsKClcblx0XHRcdF9pZCA9IEByZXN1bHQubGFzdCgpPy5pZFxuXHRcdFx0QHJtUmVzKCBfaWQgKVxuXHRcdFx0XHRcblx0XHRfc2VsID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhLmFjdGl2ZVwiICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKS5kYXRhKClcblx0XHRcdFxuXHRcdF9zZWFyY2ggPSBAJGlucC52YWwoKVxuXHRcdFxuXHRcdGlmICBub3QgX3NlbD8gYW5kIEBzZWxlY3RDb3VudCBpc250IDEgYW5kIGlzRW50ZXJFdmVudCBhbmQgbm90IF9zZWFyY2g/Lmxlbmd0aFxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IF9zZWw/XG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdGlmIF9zZWw/LmlkeCA+PSAwIGFuZCBAc2VhcmNoY29sbC5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggQGNvbGxlY3Rpb24uZ2V0KCBfc2VsLmlkICkgKVxuXHRcdGVsc2UgaWYgQGN1cnJRdWVyeT8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IEBjdXJyUXVlcnksIGN1c3RvbTogdHJ1ZSApIClcblx0XHRcdEAkaW5wLnZhbCggXCJcIiApXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3XG4iLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiA9PlxuXHRcdF9zdGQgPSBcInN1YlwiXG5cdFx0X3R5cGUgPSBAbW9kZWwuZ2V0KCBcInR5cGVcIiApXG5cdFx0aWYgX3R5cGU/XG5cdFx0XHRfc3RkICs9IFwiIHN1Yi10eXBlLVwiICsgX3R5cGVcblx0XHRcblx0XHRfbmFtZSA9IEBtb2RlbC5nZXQoIFwibmFtZVwiIClcblx0XHRpZiBfbmFtZT9cblx0XHRcdF9zdGQgKz0gXCIgc3ViLW5hbWUtXCIgKyBfbmFtZVxuXHRcdHJldHVybiBfc3RkXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdCNAJGVsLm9uIFwiY2xpY2tcIiwgQHJlb3BlblxuXHRcdEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXHRcdFxuXHRcdEAkZWwuZGF0YSggXCJmY3RpZFwiLCBAbW9kZWwuaWQgKVxuXHRcdFxuXHRcdEBwYXJlbnQub24gXCJlc2NhcGVcIiwgKCBldm50LCBjYiApPT5cblx0XHRcdGlmIEBfaXNPcGVuXG5cdFx0XHRcdGlmIEBzZWxlY3R2aWV3Py5fb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0XHRcdGNiKCBldm50LCBAICkgaWYgY2I/XG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRldmVudHM6XG5cdFx0XCJtb3VzZWRvd25cIjogXCJyZW9wZW5cIlxuXHRcdFwibW91c2Vkb3duIC5ybS1mYWNldC1idG5cIjogXCJkZWxcIlxuXHRcdFxuXG5cdHJlbmRlcjogKCBpbml0aWFsQWRkICk9PlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0dHJ5XG5cdFx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0Y2F0Y2ggX2VyclxuXHRcdFx0XHR0cnlcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBtb2RlbDoje0pTT04uc3RyaW5naWZ5KEBtb2RlbC50b0pTT04oKSl9IC0gcmVzdWx0OiN7SlNPTi5zdHJpbmdpZnkoIEByZXN1bHQudG9KU09OKCkpfVwiXG5cdFx0XHRcdGNhdGNoIF9lcnJlcnJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzI0OiBDQVRDSFwiXG5cdFx0XG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZVxuXHRcdFx0bGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRzZWxlY3RlZDogX2xpc3Rcblx0XHRcdHR5cGU6IEBtb2RlbC5nZXQoIFwidHlwZVwiIClcblx0XHRcdG5hbWU6IEBtb2RlbC5nZXQoIFwibmFtZVwiIClcblx0XHRcdHBpbm5lZDogQG1vZGVsLmdldCggXCJwaW5uZWRcIiApIG9yIGZhbHNlXG5cdFx0XHRcdFxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblxuXHRcdEBnZW5lcmF0ZVN1YiggaW5pdGlhbEFkZCApXG5cdFx0cmV0dXJuIEBlbFxuXHRcblx0cmVvcGVuOiAoIGV2bnQgKT0+XG5cdFx0aWYgQF9pc09wZW5cblx0XHRcdHJldHVyblxuXHRcdGlmIGV2bnQ/IGFuZCAkKCBldm50LnRhcmdldCApLmlzKCBcIi5ybS1yZXN1bHQtYnRuXCIgKSBhbmQgQHNlbGVjdHZpZXc/LnJtUmVzP1xuXHRcdFx0QHNlbGVjdHZpZXcucm1SZXMoIGV2bnQgKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIGV2bnQ/IGFuZCAkKCBldm50LnRhcmdldCApLmlzKCBcIi5lZGl0LXJlc3VsdC1idG5cIiApIGFuZCBAc2VsZWN0dmlldz8uZWRpdFJlcz9cblx0XHRcdEBzZWxlY3R2aWV3LmVkaXRSZXMoIGV2bnQgKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIG5vdCBAX2lzT3BlbiBhbmQgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldy5yZW9wZW4oIEAgKVxuXHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEB0cmlnZ2VyKCBcInJlb3BlblwiIClcblx0XHRyZXR1cm5cblx0XHRcblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0aWYgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdEBjb2xsZWN0aW9uLnRyaWdnZXIoIFwiaWdneTpyZW1cIiwgQG1vZGVsIClcblx0XHRAY29sbGVjdGlvbi5hZGQoIEBtb2RlbCApXG5cdFx0QHJlbW92ZSgpXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIgKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHJlbW92ZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0QHNlbGVjdHZpZXc/LnJlbW92ZSgpXG5cdFx0QHBhcmVudCA9IG51bGxcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRzZWxlY3RlZDogKCBvcHRNZGwsIGV2bnQgKT0+XG5cdFx0QHJlc3VsdC5hZGQoIG9wdE1kbCwgeyBtZXJnZTogdHJ1ZSB9IClcblx0XHRAcmVuZGVyUmVzdWx0KClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSwgZXZudCApXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW1vdmVkOiAoIG9wdE1kbCwgZXZudCAgKT0+XG5cdFx0QHJlc3VsdC5yZW1vdmUoIG9wdE1kbCApXG5cdFx0QHJlbmRlclJlc3VsdCgpXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQG1vZGVsLCBAc2VsZWN0dmlldy5nZXRSZXN1bHRzKCksIGV2bnQgKVxuXHRcdFxuXHRcdCMgcmVtb3ZlIGZhY2V0IGlmIGNvbnRlbnQgbGVuZ3RoIG9yIHRoZSBmYWNldCBpcyBpbiBlZGl0TW9kZVxuXHRcdGlmIEByZXN1bHQubGVuZ3RoIDw9IDAgYW5kIG5vdCBAc2VsZWN0dmlldy5lZGl0TW9kZVxuXHRcdFx0QGRlbCgpXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdEAkcmVzdWx0cy5odG1sKCBAc2VsZWN0dmlldy5yZW5kZXJSZXN1bHQoKSApXG5cdFx0cmV0dXJuXG5cblx0aXNPcGVuOiA9PlxuXHRcdHJldHVybiBAc2VsZWN0dmlldz9cblxuXHRmb2N1czogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHRAb3BlbigpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldz8uY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cblx0Z2VuZXJhdGVTdWI6ICggaW5pdGlhbEFkZCApPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBhdHRhY2hTdWJFdmVudHMoKVxuXHRcdFx0cmV0dXJuIEBzZWxlY3R2aWV3XG5cdFx0XHRcblx0XHRAc2VsZWN0dmlldyA9IG5ldyBAbW9kZWwuU3ViVmlldyggc3ViOiBALCBtb2RlbDogQG1vZGVsLCBlbDogQCRzdWIgKVxuXHRcdEBhdHRhY2hTdWJFdmVudHMoKVxuXHRcdFx0XG5cdFx0QCRlbC5hcHBlbmQoIEBzZWxlY3R2aWV3LnJlbmRlciggaW5pdGlhbEFkZCApIClcblx0XHRpZiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiICk/XG5cdFx0XHRAc2VsZWN0dmlldy5zZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRhdHRhY2hTdWJFdmVudHM6ID0+XG5cdFx0aWYgbm90IEBzZWxlY3R2aWV3LnN1YkV2ZW50c0F0dGFjaGVkXG5cdFx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCwgZXZudCApPT5cblx0XHRcdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdFx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0I0BzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHRcdCNAc2VsZWN0dmlldyA9IG51bGxcblx0XHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCwgZXZudCApXG5cdFx0XHRcdEByZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCwgZXZudCApPT5cblx0XHRcdFx0aWYgbWRsXG5cdFx0XHRcdFx0QHNlbGVjdGVkKCBtZGwsIGV2bnQgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdFx0QHNlbGVjdHZpZXcub24gXCJyZW1vdmVkXCIsICggbWRsICk9PlxuXHRcdFx0XHRpZiBtZGxcblx0XHRcdFx0XHRAcmVtb3ZlZCggbWRsIClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRcdEBzZWxlY3R2aWV3LnN1YkV2ZW50c0F0dGFjaGVkID0gdHJ1ZVxuXHRcdHJldHVyblxuXHRcblx0aXNSZXN1bHRFbXB0eTogKCBpbnAgKT0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRyZXR1cm4gQHNlbGVjdHZpZXcuaXNSZXN1bHRFbXB0eSggaW5wIClcblx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cblx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdEBfaXNPcGVuID0gdHJ1ZVxuXHRcdFxuXHRcdCMgQHBhcmVudC5zdWJ2aWV3ID0gQFxuXHRcdCMgQHBhcmVudC5zZWxlY3R2aWV3ID0gQHNlbGVjdHZpZXdcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U3ViXG4iLCIiLCIoZnVuY3Rpb24oZil7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZigpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGYpfWVsc2V7dmFyIGc7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe2c9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe2c9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtnPXNlbGZ9ZWxzZXtnPXRoaXN9Zy5qYWRlID0gZigpfX0pKGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIGF0dHJzID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcblxuICBpZiAoYWMgfHwgYmMpIHtcbiAgICBhYyA9IGFjIHx8IFtdO1xuICAgIGJjID0gYmMgfHwgW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xuICB9XG5cbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbnVsbHModmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xufVxuXG4vKipcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKSA6XG4gICAgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JykgPyBPYmplY3Qua2V5cyh2YWwpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB2YWxba2V5XTsgfSkgOlxuICAgIFt2YWxdKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xuICB2YXIgYnVmID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufTtcblxuXG5leHBvcnRzLnN0eWxlID0gZnVuY3Rpb24gKHZhbCkge1xuICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbCkubWFwKGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgcmV0dXJuIHN0eWxlICsgJzonICsgdmFsW3N0eWxlXTtcbiAgICB9KS5qb2luKCc7Jyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XG4gIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICB2YWwgPSBleHBvcnRzLnN0eWxlKHZhbCk7XG4gIH1cbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodmFsKS5pbmRleE9mKCcmJykgIT09IC0xKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1NpbmNlIEphZGUgMi4wLjAsIGFtcGVyc2FuZHMgKGAmYCkgaW4gZGF0YSBhdHRyaWJ1dGVzICcgK1xuICAgICAgICAgICAgICAgICAgICd3aWxsIGJlIGVzY2FwZWQgdG8gYCZhbXA7YCcpO1xuICAgIH07XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBlbGltaW5hdGUgdGhlIGRvdWJsZSBxdW90ZXMgYXJvdW5kIGRhdGVzIGluICcgK1xuICAgICAgICAgICAgICAgICAgICdJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYnVmID0gW107XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG4gIGlmIChrZXlzLmxlbmd0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBqYWRlX2VuY29kZV9odG1sX3J1bGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90Oydcbn07XG52YXIgamFkZV9tYXRjaF9odG1sID0gL1smPD5cIl0vZztcblxuZnVuY3Rpb24gamFkZV9lbmNvZGVfY2hhcihjKSB7XG4gIHJldHVybiBqYWRlX2VuY29kZV9odG1sX3J1bGVzW2NdIHx8IGM7XG59XG5cbmV4cG9ydHMuZXNjYXBlID0gamFkZV9lc2NhcGU7XG5mdW5jdGlvbiBqYWRlX2VzY2FwZShodG1sKXtcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKS5yZXBsYWNlKGphZGVfbWF0Y2hfaHRtbCwgamFkZV9lbmNvZGVfY2hhcik7XG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcbiAgfVxuICB2YXIgY29udGV4dCA9IDNcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcblxuICAvLyBFcnJvciBjb250ZXh0XG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxuICAgICAgKyBjdXJyXG4gICAgICArICd8ICdcbiAgICAgICsgbGluZTtcbiAgfSkuam9pbignXFxuJyk7XG5cbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcbiAgdGhyb3cgZXJyO1xufTtcblxuZXhwb3J0cy5EZWJ1Z0l0ZW0gPSBmdW5jdGlvbiBEZWJ1Z0l0ZW0obGluZW5vLCBmaWxlbmFtZSkge1xuICB0aGlzLmxpbmVubyA9IGxpbmVubztcbiAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xufVxuXG59LHtcImZzXCI6Mn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XX0se30sWzFdKSgxKVxufSk7IiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX2dldEtleSwgaXNBcnJheSwgdG9TdHJpbmc7XG5cbiAgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxuICBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIF9nZXRLZXkgPSBmdW5jdGlvbihlbCwga2V5KSB7XG4gICAgcmV0dXJuIGVsW2tleV07XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXlzLCBmb3J3YXJkLCBnZXRLZXkpIHtcbiAgICB2YXIgZm5zb3J0LCByZWY7XG4gICAgaWYgKGZvcndhcmQgPT0gbnVsbCkge1xuICAgICAgZm9yd2FyZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChnZXRLZXkgPT0gbnVsbCkge1xuICAgICAgZ2V0S2V5ID0gX2dldEtleTtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5KGtleXMpKSB7XG4gICAgICBrZXlzID0gW2tleXNdO1xuICAgIH1cbiAgICBmbnNvcnQgPSBmdW5jdGlvbihmb3J3YXJkLCBrZXksIG5leHRrZXlzKSB7XG4gICAgICB2YXIgX2Z3cmQsIF9rLCBuZXh0U29ydCwgcmVmO1xuICAgICAgaWYgKG5leHRrZXlzICE9IG51bGwgPyBuZXh0a2V5cy5sZW5ndGggOiB2b2lkIDApIHtcbiAgICAgICAgX2sgPSAocmVmID0gbmV4dGtleXMuc3BsaWNlKDAsIDEpKSAhPSBudWxsID8gcmVmWzBdIDogdm9pZCAwO1xuICAgICAgICBpZiAoX2sgIT0gbnVsbCkge1xuICAgICAgICAgIG5leHRTb3J0ID0gZm5zb3J0KGZvcndhcmQsIF9rLCBuZXh0a2V5cyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9md3JkID0gKGZvcndhcmRba2V5XSAhPSBudWxsID8gZm9yd2FyZFtrZXldIDogKGZvcndhcmRbXCI/XCJdICE9IG51bGwgPyBmb3J3YXJkW1wiP1wiXSA6IGZvcndhcmQpKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlbEEsIGVsQikge1xuICAgICAgICB2YXIgX2EsIF9iO1xuICAgICAgICBfYSA9IGdldEtleShlbEEsIGtleSk7XG4gICAgICAgIF9iID0gZ2V0S2V5KGVsQiwga2V5KTtcbiAgICAgICAgaWYgKF9hIDwgX2IpIHtcbiAgICAgICAgICBpZiAoX2Z3cmQpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF9hID4gX2IpIHtcbiAgICAgICAgICBpZiAoX2Z3cmQpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF9hID09PSBfYikge1xuICAgICAgICAgIGlmIChuZXh0U29ydCAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dFNvcnQoZWxBLCBlbEIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgICByZXR1cm4gZm5zb3J0KGZvcndhcmQsIChyZWYgPSBrZXlzLnNwbGljZSgwLCAxKSkgIT0gbnVsbCA/IHJlZlswXSA6IHZvaWQgMCwga2V5cyk7XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
