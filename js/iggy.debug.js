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
    console.log(this.nonEmptyResults);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL21haW4uY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvYmFja2JvbmVfc3ViLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2Jhc2UuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9yYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0cy5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3JhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXIuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL3N1YnN0cmluZy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL3N1Yi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0Y29sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsc0hBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVDs7QUFDWCxNQUFBLEdBQVMsT0FBQSxDQUFTLGlCQUFUOztBQUNULFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFTLDBCQUFUOztBQUNmLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBQ1gsT0FBQSxHQUFVLE9BQUEsQ0FBUyxrQkFBVDs7QUFFVixRQUFBLEdBQVc7O0FBRUw7OztpQkFDTCxDQUFBLEdBQUc7O0VBQ1UsY0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1haW5WaWV3ID0gcmVxdWlyZSggXCIuL3ZpZXdzL21haW5cIiApXG5GYWNldHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0c1wiIClcbkZjdFN0cmluZyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc3RyaW5nXCIgKVxuRmN0QXJyYXkgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2FycmF5XCIgKVxuRmN0U2VsZWN0ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zZWxlY3RcIiApXG5GY3ROdW1iZXIgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X251bWJlclwiIClcbkZjdFJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9yYW5nZVwiIClcbkZjdERhdGVSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlXCIgKVxuRmN0RXZlbnQgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2V2ZW50XCIgKVxuUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvcmVzdWx0c1wiIClcblxuSUdHWV9JRFggPSAxXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzLCBvcHRpb25zIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKCBudWxsLCBvcHRpb25zIClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0QHZpZXcgPSBuZXcgTWFpblZpZXcoIG1haW46IEAsIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cywgc2VhcmNoQnV0dG9uOiBvcHRpb25zLnNlYXJjaEJ1dHRvbiwgaWR4OiBJR0dZX0lEWCsrIClcblx0XHRcblx0XHRAdmlldy5vbiBcInNlYXJjaGJ1dHRvblwiLCBAdHJpZ2dlckV2ZW50XG5cblx0XHRAbm9uRW1wdHlSZXN1bHRzID0gQHJlc3VsdHMuc3ViKCBAX2ZpbHRlckVtcHR5IClcblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUVsOiAoIGVsICk9PlxuXG5cdFx0aWYgbm90IGVsP1xuXHRcdFx0dGhyb3cgQF9lcnJvciggXCJFTUlTU0lOR0VMXCIgKVxuXG5cdFx0aWYgXy5pc1N0cmluZyggZWwgKVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMU1RSSU5HXCIgKVxuXG5cdFx0XHRfJGVsID0gQCQoIGVsIClcblx0XHRcdGlmIG5vdCBfJGVsPy5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMU1RSSU5HXCIgKVxuXG5cdFx0XHRyZXR1cm4gXyRlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTEpRVUVSWVwiIClcblxuXHRcdFx0IyBUT0RPIGhhbmRsZSBtdWx0aXBsZSBqUXVlcnkgZWxlbWVudHMgdG8gSUdHWSBpbnN0YW5jZXNcblx0XHRcdGlmIGVsLmxlbmd0aCA+IDFcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFU0laRUVMSlFVRVJZXCIgKVxuXG5cdFx0XHRyZXR1cm4gZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgRWxlbWVudFxuXHRcdFx0cmV0dXJuIEAkKCBlbCApXG5cblx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxUWVBFXCIgKVxuXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVGYWNldHM6ICggZmFjZXRzLCBvcHRpb25zPXt9ICk9PlxuXHRcdF9yZXQgPSBbXVxuXHRcdGZvciBmYWNldCwgX2lkeCBpbiBmYWNldHMgd2hlbiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRfZmN0Ll9pZHggPSBfaWR4XG5cdFx0XHRfcmV0LnB1c2ggX2ZjdFxuXHRcdFxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0LCBvcHRpb25zIClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKS0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJzZWxlY3RcIiB0aGVuIHJldHVybiBuZXcgRmN0U2VsZWN0KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwicmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0UmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJkYXRlcmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0RGF0ZVJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZXZlbnRcIiB0aGVuIHJldHVybiBuZXcgRmN0RXZlbnQoIGZhY2V0LCBtYWluOiBAIClcblxuXHRhZGRGYWNldDogKCBmYWNldCApPT5cblx0XHRpZiBub3QgQGZhY2V0cz9cblx0XHRcdHJldHVyblxuXHRcdGlmICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdEBmYWNldHMuYWRkKCBfZmN0IClcblx0XHRyZXR1cm4gQFxuXG5cdF9lcnJvcjogKCB0eXBlLCBkYXRhID0ge30gKT0+XG5cdFx0aWYgQGVycm9yc1sgdHlwZSBdP1xuXHRcdFx0X21zZyA9IEBlcnJvcnNbIHR5cGUgXSggZGF0YSApXG5cdFx0ZWxzZVxuXHRcdFx0X21zZyA9IFwiLVwiXG5cdFx0X2VyciA9IG5ldyBFcnJvcigpXG5cdFx0X2Vyci5uYW1lID0gdHlwZVxuXHRcdF9lcnIubWVzc2FnZSA9IF9tc2dcblx0XHRyZXR1cm4gX2VyclxuXG5cdF9maWx0ZXJFbXB0eTogKCBtb2RlbCApPT5cblx0XHRfdiA9IG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBub3QgX3Y/XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRpZiBfdi5sZW5ndGggPD0gMFxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdGdldFF1ZXJ5OiA9PlxuXHRcdHJldHVybiBAbm9uRW1wdHlSZXN1bHRzXG5cblx0dHJpZ2dlckNoYW5nZTogPT5cblx0XHRjb25zb2xlLmxvZyBAbm9uRW1wdHlSZXN1bHRzXG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEB0cmlnZ2VyKCBcImNoYW5nZVwiLCBAbm9uRW1wdHlSZXN1bHRzIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXHRcblx0dHJpZ2dlckV2ZW50OiAoIGV2ZW50TmFtZSApPT5cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHRyaWdnZXIoIGV2ZW50TmFtZSwgQG5vbkVtcHR5UmVzdWx0cyApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XHRcblx0X2luaXRFcnJvcnM6ID0+XG5cdFx0QGVycm9ycyA9IHt9XG5cdFx0Zm9yIF9rLCBfdG1wbCBvZiBARVJST1JTKClcblx0XHRcdEBlcnJvcnNbIF9rIF0gPSBfLnRlbXBsYXRlKCBfdG1wbCApXG5cdFx0cmV0dXJuXG5cblx0RVJST1JTOiAtPlxuXHRcdFwiRUlOVkFMSURFTFNUUklOR1wiOiBcIklmIHlvdSBkZWZpbmUgYSBgZWxgIGFzIFN0cmluZyBpdCBoYXMgdG8gYmUgYSB2YWxpZCBzZWxlY3RvciBmb3IgYW4gZXhpc3RpbmcgRE9NIGVsZW1lbnQuXCJcblx0XHRcIkVFTVBUWUVMU1RSSU5HXCI6IFwiVGhlIGBlbGAgYXMgc3RyaW5nIGNhbiBub3QgYmUgZW1wdHkuXCJcblx0XHRcIkVFTVBUWUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGFuIGVtcHR5IGNvbGxlY3Rpb24uXCJcblx0XHRcIkVTSVpFRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYSByZXN1bHQgb2Ygb25lIGVsLlwiXG5cdFx0XCJFSU5WQUxJREVMVFlQRVwiOiBcIlRoZSBgZWxgIGNhbiBvbmx5IGJlIGEgc2VsZWN0b3Igc3RyaW5nLCBkb20gZWxlbWVudCBvciBqUXVlcnkgY29sbGVjdGlvblwiXG5cdFx0XCJFTUlTU0lOR0VMXCI6IFwiUGxlYXNlIGRlZmluZSBhIHRhcmdldCBgZWxgXCJcblxubW9kdWxlLmV4cG9ydHMgPSBJR0dZXG4iLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKVxuXHRcblx0IyBvciBieSBPYmplY3Rcblx0c3ViQ29sbE8gPSBwYXJlbnRDb2xsLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyBvciBieSBOdW1iZXJcblx0c3ViQ29sbE4gPSBwYXJlbnRDb2xsLnN1YiggMTMgKVxuXHRcblx0IyBvciBieSBGdW5jdGlvblxuXHRzdWJDb2xsRiA9IHBhcmVudENvbGwuc3ViKCAoKCBtb2RlbCApLT4gaWYgbW9kZWwuZ2V0KCBcImFnZVwiICkgPiAyMyApIClcblx0XG5cdCMgc3ViY29sbGVjdGlvbiBvZiBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBX08gPSBzdWJDb2xsQS5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBGb3IgdGhpcyBhIGByZXNldGAgd2lsbCBiZSBmaXJlZCBvbiB0aGUgc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQSA9IHN1YkNvbGxBLnVwZGF0ZVN1YkZpbHRlciggeyBuYW1lOiBcIkJhclwiLCBhZ2U6IDQyIH0gKVxuIyMjXG5cbmNsYXNzIEJhY2tib25lU3ViIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHQjIyNcblx0IyMgc3ViXG5cdFxuXHRgY29sbGVjdGlvbi5zdWIoIGZpbHRlciApYFxuXHRcblx0R2VuZXJhdGUgYSBzdWItY29sbGVjdGlvbiBieSBhIGZpbHRlci5cblx0VGhlIG1vZGVscyB3aWxsIGJlIGRpc3RyaWJ1dGVkIHdpdGhpbiBhbGwgaW52b2x2ZWQgY29sbGVjdGlvbnMgdW5kZXIgY29uc2lkZXJhdGlvbiBvZiB0aGUgZmlsdGVyLlxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBDb2xsZWN0aW9uIH0gQSBTdWItQ29sbGVjdGlvbiBiYXNlZCBvbiB0aGUgZmlsdGVyXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0c3ViOiAoIGZpbHRlciApPT5cblx0XHRAc3ViQ29sbHMgb3I9IFtdXG5cdFx0Zm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKVxuXG5cdFx0IyBmaWx0ZXIgdGhlIGNvbGxlY3Rpb25cblx0XHRfbW9kZWxzID0gQGZpbHRlciBmbkZpbHRlclxuXHRcdCMgY3JlYXRlIHRoZSBzdWJjb2xsZWN0aW9uXG5cdFx0X3N1YiA9IG5ldyBAY29uc3RydWN0b3IoIF9tb2RlbHMsIEBfc3ViQ29sbGVjdGlvbk9wdGlvbnMoKSApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cdFxuXHQjIyNcblx0IyMgX3N1YkNvbGxlY3Rpb25PcHRpb25zXG5cdFxuXHRgY29sbGVjdGlvbi5fc3ViQ29sbGVjdGlvbk9wdGlvbnMoKWBcblx0XG5cdE92ZXJ3cml0YWJsZSBtZXRob2QgdG8gc2V0IHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGZvciBzdWIgY29sbGVjdGlvbnNcblx0XG5cdEByZXR1cm4geyBPYmplY3QgfSBUaGUgb3B0aW9ucyBvYmplY3Rcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X3N1YkNvbGxlY3Rpb25PcHRpb25zOiA9PlxuXHRcdF9vcHRzID1cblx0XHRcdGNvbXBhcmF0b3I6IEBjb21wYXJhdG9yXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICktPlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWJcbiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBhdHRycywgb3B0aW9ucyApLT5cblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRkZWZhdWx0czogLT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cdFx0c29ydDogMFxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2VcbiIsImNsYXNzIEZjdERhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdHM6IHt9XG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZVxuIiwiY2xhc3MgRmN0RXZlbnQgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogbnVsbFxuXHRvbmx5RXhlYzogdHJ1ZVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFxuXHRleGVjOiAoICk9PlxuXHRcdEBtYWluLnRyaWdnZXIoIEBnZXQoIFwiZXZlbnRcIiApLCBAdG9KU09OKCkgKVxuXHRcdHJldHVyblxubW9kdWxlLmV4cG9ydHMgPSBGY3RFdmVudFxuIiwiY2xhc3MgRmN0TnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1Ym51bWJlclwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyXG4iLCJjbGFzcyBGY3RSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0UmFuZ2VcbiIsImNsYXNzIEZjdFNlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzZWxlY3RcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCggc3VwZXIsIHtcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XHR3YWl0Rm9yQXN5bmM6IHRydWVcblx0XHR9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFNlbGVjdFxuIiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmdcbiIsInNvcnRDb2xsID0gcmVxdWlyZSggXCJzb3J0Y29sbFwiIClcblxuZm5HZXQgPSAoIGVsLCBrZXkgKS0+XG5cdHJldHVybiBlbC5nZXQoIGtleSApXG5cbmNsYXNzIElnZ3lGYWNldHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRcblx0Y29uc3RydWN0b3I6ICggbW9kZWxzLCBvcHRpb25zPXt9ICktPlxuXHRcdGlmIG5vdCBvcHRpb25zLmNvbXBhcmF0b3I/XG5cdFx0XHRfZm9yd2FyZCA9IHN3aXRjaCBvcHRpb25zLmRpclxuXHRcdFx0XHR3aGVuIFwiYXNjXCIgdGhlbiB0cnVlXG5cdFx0XHRcdHdoZW4gXCJkZXNjXCIgdGhlbiBmYWxzZVxuXHRcdFx0XHRlbHNlIHRydWVcblx0XHRcdFxuXHRcdFx0b3B0aW9ucy5jb21wYXJhdG9yID0gc29ydENvbGwoIFsgXCJzb3J0XCIgXS5jb25jYXQoIG9wdGlvbnMuc29ydGJ5IG9yIFwibmFtZVwiICksIHsgc29ydDogZmFsc2UsIFwiP1wiOiBfZm9yd2FyZCB9LCBmbkdldCApXG5cdFx0cmV0dXJuIHN1cGVyKCBtb2RlbHMsIG9wdGlvbnMgKVxuXHRcblx0X3N1YkNvbGxlY2N0aW9uT3B0aW9uczogPT5cblx0XHRvcHQgPSBzdXBlclxuXHRcdG9wdC5kaXIgPSBpZiBAZm9yd2FyZCB0aGVuIFwiYXNjXCIgZWxzZSBcImRlc2NcIlxuXHRcdHJldHVybiBvcHRcblx0XG5cdG1vZGVsSWQ6IChhdHRycyktPlxuXHRcdHJldHVybiBhdHRycy5uYW1lXG5cdFx0XG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lGYWNldHNcbiIsImNsYXNzIElnZ3lSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0ZGVmYXVsdHM6XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IG51bGxcblx0XHR2YWx1ZTogbnVsbFxuXG5jbGFzcyBJZ2d5UmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdGluaXRpYWxpemU6ICggbWRscywgb3B0cyApPT5cblx0XHRpZiBvcHRzLm1vZGlmeUtleT8ubGVuZ3RoXG5cdFx0XHRAbW9kaWZ5S2V5ID0gb3B0cy5tb2RpZnlLZXlcblx0XHRyZXR1cm5cblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfa2V5ID0gb3B0aW9ucy5fZmFjZXQuZ2V0KCBcIm1vZGlmeUtleVwiICkgb3IgQG1vZGlmeUtleSBvciBcInZhbHVlXCJcblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyWyBfa2V5IF0gPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBvcHRpb25zLl9mYWNldCwgYXR0ciApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0c1xuIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHNcbiIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGN1c3RvbSwgaWQsIHR4dCkge1xuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHR4dCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJidG4td3JwXFxcIj48aVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwicm0tcmVzdWx0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT5cIik7XG5pZiAoIGN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImVkaXQtcmVzdWx0LWJ0biBmYSBmYS1wZW5jaWxcXFwiPjwvaT5cIik7XG59XG5idWYucHVzaChcIjwvc3Bhbj5cIik7fS5jYWxsKHRoaXMsXCJjdXN0b21cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1c3RvbTp0eXBlb2YgY3VzdG9tIT09XCJ1bmRlZmluZWRcIj9jdXN0b206dW5kZWZpbmVkLFwiaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmlkOnR5cGVvZiBpZCE9PVwidW5kZWZpbmVkXCI/aWQ6dW5kZWZpbmVkLFwidHh0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50eHQ6dHlwZW9mIHR4dCE9PVwidW5kZWZpbmVkXCI/dHh0OnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwiZGF0ZXJhbmdlLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG9wZXJhdG9yLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmlmICggb3BlcmF0b3JzICYmIG9wZXJhdG9ycy5sZW5ndGgpXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcIm9wZXJhdG9yXFxcIj48c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJvcFwiLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgdmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJvcGVyYXRvclwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3I6dHlwZW9mIG9wZXJhdG9yIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcjp1bmRlZmluZWQsXCJvcGVyYXRvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yczp0eXBlb2Ygb3BlcmF0b3JzIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicmFuZ2VpbnBcXFwiPlwiKTtcbnZhciBfdmFscyA9IHZhbHVlID8gdmFsdWUgOiBbXVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl9mcm9tXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS1mcm9tXFxcIi8+PHNwYW4gY2xhc3M9XFxcInNlcGFyYXRvclxcXCI+LTwvc3Bhbj48aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl90b1wiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzFdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtdG9cXFwiLz48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbjtyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgbXVsdGlwbGUsIG9wdGlvbkdyb3Vwcywgb3B0aW9ucywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuaWYgKCBvcHRpb25Hcm91cHMpXG57XG4vLyBpdGVyYXRlIG9wdGlvbkdyb3Vwc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25Hcm91cHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBnbmFtZSA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZ25hbWUgPCAkJGw7IGduYW1lKyspIHtcbiAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBnbmFtZSBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlXG57XG4vLyBpdGVyYXRlIG9wdGlvbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9ucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+XCIpO1xuaWYgKCBtdWx0aXBsZSlcbntcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcImJ0biBidG4teHMgYnRuLXN1Y2Nlc3Mgc2VsZWN0LWNoZWNrIGZhIGZhLWNoZWNrXFxcIj48L3NwYW4+XCIpO1xufX0uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm11bHRpcGxlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5tdWx0aXBsZTp0eXBlb2YgbXVsdGlwbGUhPT1cInVuZGVmaW5lZFwiP211bHRpcGxlOnVuZGVmaW5lZCxcIm9wdGlvbkdyb3Vwc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uR3JvdXBzOnR5cGVvZiBvcHRpb25Hcm91cHMhPT1cInVuZGVmaW5lZFwiP29wdGlvbkdyb3Vwczp1bmRlZmluZWQsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIGlucHZhbCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgaW5wdmFsLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwiaW5wdmFsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pbnB2YWw6dHlwZW9mIGlucHZhbCE9PVwidW5kZWZpbmVkXCI/aW5wdmFsOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHBpbm5lZCwgc2VsZWN0ZWQsIHVuZGVmaW5lZCkge1xuaWYgKCAhcGlubmVkKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2Rpdj5cIik7XG59XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJzdWJsYWJlbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxzcGFuIGNsYXNzPVxcXCJ0eHRcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48aSBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9pPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxpIGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3QgY2xvc2VkXFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJsb2FkZXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jb2cgZmEtc3BpblxcXCI+PC9pPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInBpbm5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgucGlubmVkOnR5cGVvZiBwaW5uZWQhPT1cInVuZGVmaW5lZFwiP3Bpbm5lZDp1bmRlZmluZWQsXCJzZWxlY3RlZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VsZWN0ZWQ6dHlwZW9mIHNlbGVjdGVkIT09XCJ1bmRlZmluZWRcIj9zZWxlY3RlZDp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoc2VhcmNoQnV0dG9uKSB7XG5idWYucHVzaChcIjxidXR0b24gY2xhc3M9XFxcImFkZC1mYWNldC1idG4gZmEgZmEtcGx1c1xcXCI+PC9idXR0b24+XCIpO1xuaWYgKCBzZWFyY2hCdXR0b24gIT0gdW5kZWZpbmVkICYmIHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSAhPSB1bmRlZmluZWQgJiYgc2VhcmNoQnV0dG9uLnRlbXBsYXRlLmxlbmd0aCA+PSAwKVxue1xuYnVmLnB1c2goXCI8YnV0dG9uXCIgKyAoamFkZS5jbHMoWydzZWFyY2gtYnRuJyxzZWFyY2hCdXR0b24uY3NzY2xhc3Mse1wic2VhcmNoLWJ0bi1wdWxscmlnaHRcIjpzZWFyY2hCdXR0b24ucHVsbHJpZ2h0fV0sIFtudWxsLHRydWUsdHJ1ZV0pKSArIFwiPlwiICsgKG51bGwgPT0gKGphZGVfaW50ZXJwID0gc2VhcmNoQnV0dG9uLnRlbXBsYXRlKSA/IFwiXCIgOiBqYWRlX2ludGVycCkgKyBcIjwvYnV0dG9uPlwiKTtcbn19LmNhbGwodGhpcyxcInNlYXJjaEJ1dHRvblwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VhcmNoQnV0dG9uOnR5cGVvZiBzZWFyY2hCdXR0b24hPT1cInVuZGVmaW5lZFwiP3NlYXJjaEJ1dHRvbjp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9XG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTNcblx0XCJUQUJcIjogOVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHJlc3VsdFRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGVcIiApXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzdWIgPSBvcHRpb25zLnN1YlxuXHRcdEByZXN1bHQgPSBuZXcgU3ViUmVzdWx0cygpXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGZvY3VzZWQgPSB0cnVlXG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCJcIlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdGlmIF9sYmw/IGFuZCBfbGJsIGlzbnQgXCJcIlxuXHRcdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblx0XHRpZiBfbGlzdC5sZW5ndGhcblx0XHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdHJldHVybiBcIlwiXG5cdFx0XG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEBpc09wZW4gPSB0cnVlXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVyblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5UQUIgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLlRBQlxuXHRcdFx0QF9vblRhYkFjdGlvbiggZXZudCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldCA9XG5cdFx0XHRjaWQ6IEBjaWRcblx0XHRcdCN0YWJfaW5kZXg6ICggKCBAbW9kZWw/Ll9pZHggKiAxMCApIG9yIDEgKSArICggKCBAc3ViPy5wYXJlbnQ/LmlkeCBvciAxICkgKiAxMDAwIClcblx0XHRcdHZhbHVlOiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiIClcblx0XHRyZXR1cm4gcmV0XG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH1cIlxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAcmVuZGVyKClcblx0XHRwVmlldz8ub3BlbigpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW5kZXI6ICggaW5pdGlhbEFkZCApPT5cblx0XHRfdG1wbCA9IEB0ZW1wbGF0ZSggIEBnZXRUZW1wbGF0ZURhdGEoKSApXG5cdFx0QCRlbC5odG1sKCBfdG1wbCApXG5cdFx0aWYgbm90IGluaXRpYWxBZGRcblx0XHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEAkaW5wID0gQCRlbC5maW5kKCBAX2dldElucFNlbGVjdG9yKCkgKVxuXHRcdCMkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCB0cnVlIClcblx0XHRyZXR1cm5cblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXlkb3duXCJcblx0XHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuIHRydWVcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdEBmb2N1c2VkID0gZmFsc2Vcblx0XHQjJCggZG9jdW1lbnQgKS5vZmYgQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBfaGFzVGFiTGlzdGVuZXIoIGZhbHNlIClcblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcIm9wZW5cIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGlzT3BlbiA9IGZhbHNlXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6IC0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0X2NoZWNrU2VsZWN0RW1wdHk6ICggX3ZhbCApPT5cblx0XHRpZiBfLmlzRW1wdHkoIF92YWwgKSBhbmQgbm90IF8uaXNOdW1iZXIoIF92YWwgKSBhbmQgbm90IF8uaXNCb29sZWFuKCBfdmFsICkgYW5kIG5vdCBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHNlbGVjdDogPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRyZXR1cm4gaWYgQF9jaGVja1NlbGVjdEVtcHR5KCBfdmFsIClcblx0XHRAc2V0KCBfdmFsIClcblx0XHRyZXR1cm5cblxuXHRzZXQ6ICggdmFsICk9PlxuXHRcdF9tb2RlbCA9IEByZXN1bHQuZmlyc3QoKVxuXHRcdGlmIG5vdCBfbW9kZWw/XG5cdFx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiB2YWwgKVxuXHRcdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0ZWxzZVxuXHRcdFx0X21vZGVsLnNldCggdmFsdWU6IHZhbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzQmFzZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNEYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvZGF0ZXJhbmdlLmphZGVcIiApXG5cblx0Zm9yY2VkRGF0ZVJhbmdlT3B0czogPT5cblx0XHRfb3B0cyA9XG5cdFx0XHRvcGVuczogXCJyaWdodFwiXG5cdFx0XHRcblx0XHRpZiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0XHRfb3B0cy5sb2NhbGUgPVxuXHRcdFx0XHRmb3JtYXQ6IEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiIClcblx0XHRcblx0XHRpZiBAbW9kZWwuZ2V0KFwidmFsdWVcIik/WzBdP1xuXHRcdFx0X3NkID0gbW9tZW50KCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXHRcdFx0aWYgX3NkLmlzVmFsaWQoKVxuXHRcdFx0XHRfb3B0cy5zdGFydERhdGUgPSBfc2QuX2RcblxuXHRcdGlmIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKT9bMV0/XG5cdFx0XHRfZWQgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVsxXSwgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKSApXG5cdFx0XHRpZiBfZWQuaXNWYWxpZCgpXG5cdFx0XHRcdF9vcHRzLmVuZERhdGUgPSBfZWQuX2Rcblx0XHRyZXR1cm4gX29wdHNcblxuXHRldmVudHM6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHRpZiBub3QgQGRhdGVyYW5nZXBpY2tlcj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCBAZm9yY2VkRGF0ZVJhbmdlT3B0cygpIClcblx0XHRcdEAkaW5wLmRhdGVyYW5nZXBpY2tlciggX29wdHMsIEBfZGF0ZVJldHVybiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyID0gQCRpbnAuZGF0YSggXCJkYXRlcmFuZ2VwaWNrZXJcIiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lcj8uYWRkQ2xhc3MoIFwiZGF0ZXJhbmdlLWlnZ3lcIiApXG5cdFx0XHRcblx0XHRcdCMgcHJldmVudCBmcm9tIGhhbmRsaWNoIHRoZSBvdXRlcmNsaWNrIGV4aXQgZnJvbSBNYWluVmlld1xuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5jb250YWluZXIub24gXCJjbGlja1wiLCAoIGV2bnQgKS0+XG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5lbGVtZW50ID0gQCRpbnBcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0XHRcblx0XHRAJGlucC5vbiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub24oIFwiaGlkZS5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0Y2xvc2U6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5vZmYoIFwiY2FuY2VsLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdEAkaW5wLm9mZiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVyblxuXG5cdHJlbW92ZTogPT5cblx0XHRAZGF0ZXJhbmdlcGlja2VyPy5yZW1vdmUoKVxuXHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBudWxsXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0XG5cdFx0aWYgXy5pc051bWJlciggX3Jlcy52YWx1ZVsgMCBdIClcblx0XHRcdF9zdGFydERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDAgXSApXG5cdFx0ZWxzZVxuXHRcdFx0X3N0YXJ0RGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMCBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdFxuXHRcdGlmIF9yZXMudmFsdWVbIDEgXT9cblx0XHRcdGlmIF8uaXNOdW1iZXIoIF9yZXMudmFsdWVbIDEgXSApXG5cdFx0XHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfZW5kRGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMSBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblxuXHRcdF90aW1lID0gQG1vZGVsLmdldCggXCJvcHRzXCIgKS50aW1lUGlja2VyXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0aWYgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKT9cblx0XHRcdF9mcm10ID0gQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKVxuXHRcdGVsc2UgaWYgX3RpbWVcblx0XHRcdF9mcm10ID0gXCJMTExMXCJcblx0XHRlbHNlXG5cdFx0XHRfZnJtdCA9IFwiTExcIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCBfZnJtdCApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggX2ZybXQgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9kYXRlUmV0dXJuOiAoIEBzdGFydERhdGUsIEBlbmREYXRlICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwidmFsdWVcIiwgQGdldFZhbHVlKCBmYWxzZSApIClcblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ICggcHJlZGVmID0gdHJ1ZSApPT5cblx0XHRpZiBwcmVkZWZcblx0XHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFx0aWYgX3ByZWRlZlZhbD9cblx0XHRcdFx0aWYgbm90IF8uaXNBcnJheSggX3ByZWRlZlZhbCApXG5cdFx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0XHRbIEBzdGFydERhdGUsIEBlbmREYXRlIF0gPSBfcHJlZGVmVmFsXG5cdFx0XHRcdHJldHVybiBfcHJlZGVmVmFsXG5cdFx0X291dCA9IFsgQHN0YXJ0RGF0ZS52YWx1ZU9mKCkgXVxuXHRcdF9vdXQucHVzaCBAZW5kRGF0ZS52YWx1ZU9mKCkgaWYgQGVuZERhdGU/XG5cdFx0cmV0dXJuIF9vdXRcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzRGF0ZVJhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbm5lYXJlc3QgPSAobiwgdiktPlxuXHRuID0gbiAvIHZcblx0biA9IE1hdGgucm91bmQobikgKiB2XG5cdHJldHVybiBuXG5cdFxucHJlY2lzaW9uID0gKG4sIGRwKS0+XG5cdGRwID0gTWF0aC5wb3coMTAsIGRwKVxuXHRuID0gbiAqIGRwXG5cdG4gPSBNYXRoLnJvdW5kKG4pXG5cdG4gPSBuIC8gZHBcblx0cmV0dXJuIG5cblxuY2xhc3MgRmFjZXROdW1iZXJCYXNlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHNldE51bWJlciA9IF8udGhyb3R0bGUoIEBfc2V0TnVtYmVyLCAzMDAsIHtsZWFkaW5nOiBmYWxzZSwgdHJhaWxpbmc6IGZhbHNlfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblxuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRfJGVsID0gJCggZXZudC5jdXJyZW50VGFyZ2V0IClcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92LCBfJGVsIClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSwgZWwgPSBAJGlucCApPT5cblx0XHRfdiA9IGVsLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdF92ID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRlbHNlXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdFx0QF9zZXROdW1iZXIoIF92ICsgY2hhbmdlLCBlbCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdHJldHVybiBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRfc2V0TnVtYmVyOiAoIF92LCBlbCA9IEAkaW5wICk9PlxuXHRcdGlmIGlzTmFOKCBfdiApXG5cdFx0XHQjQCRpbnAudmFsKFwiXCIpXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9jdXJyID0gZWwudmFsKClcblxuXHRcdF92ID0gQHZhbHVlQnlEZWZpbml0aW9uKCBfdilcblx0XHRpZiBfY3VyciAhPSBfdi50b1N0cmluZygpXG5cdFx0XHRlbC52YWwoIF92IClcblx0XHRyZXR1cm5cblxuXHR2YWx1ZUJ5RGVmaW5pdGlvbjogKCBfdmFsdWUgKS0+XG5cdFx0bWF4ID0gQG1vZGVsLmdldCggXCJtYXhcIiApXG5cdFx0bWluID0gQG1vZGVsLmdldCggXCJtaW5cIiApXG5cdFx0c3RlcCA9IEBtb2RlbC5nZXQoIFwic3RlcFwiIClcblx0XHRcblx0XHQjIGZpeCByZXZlcnNlZCBtaW4vbWF4IHNldHRpbmdcblx0XHRpZiBtaW4gPiBtYXhcblx0XHRcdF90bXAgPSBtaW5cblx0XHRcdG1pbiA9IG1heFxuXHRcdFx0bWF4ID0gX3RtcFxuXHRcdFxuXHRcdCMgb24gZXh4ZWRkaW5nIHRoZSBsaW1pdHMgdXNlIHRoZSBsaW1pdFxuXHRcdGlmIG1pbj8gYW5kIF92YWx1ZSA8IG1pblxuXHRcdFx0cmV0dXJuIG1pblxuXHRcdGlmIG1heD8gYW5kIF92YWx1ZSA+IG1heFxuXHRcdFx0cmV0dXJuIG1heFxuXG5cdFx0IyBzZWFyY2ggdGhlIG5lYXJlc3QgX3ZhbHVlIHRvIHRoZSBzdGVwXG5cdFx0aWYgc3RlcCBpc250IDFcblx0XHRcdF92YWx1ZSA9IG5lYXJlc3QoIF92YWx1ZSwgc3RlcCApXG5cdFx0XG5cdFx0IyBjYWxjIHRoZSBwcmVjaXNpb24gYnkgc3RlcFxuXHRcdF9wcmVjaXNpb24gPSBNYXRoLm1heCggMCwgTWF0aC5jZWlsKCBNYXRoLmxvZyggMS9zdGVwICkgLyBNYXRoLmxvZyggMTAgKSApIClcblx0XHRpZiBfcHJlY2lzaW9uID4gMFxuXHRcdFx0X3ZhbHVlID0gcHJlY2lzaW9uKCBfdmFsdWUsIF9wcmVjaXNpb24gKVxuXHRcdGVsc2Vcblx0XHRcdF92YWx1ZSA9IE1hdGgucm91bmQoIF92YWx1ZSApXG5cdFx0XHRcblx0XHRyZXR1cm4gX3ZhbHVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldE51bWJlckJhc2VcbiIsIlN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTdHJpbmdPcHRpb24gZXh0ZW5kcyBTdWJSZXN1bHRzLnByb3RvdHlwZS5tb2RlbFxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIFN0cmluZ09wdGlvbnMgZXh0ZW5kcyBTdWJSZXN1bHRzXG5cdG1vZGVsOiBTdHJpbmdPcHRpb25cblxuXG5jbGFzcyBBcnJheU9wdGlvbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIFwibmFtZVwiICkgb3IgXCItXCJcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIEFycmF5T3B0aW9ucyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEFycmF5T3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViQXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4uL3NlbGVjdG9yXCIgKVxuXHRcblx0dGVtcGxhdGVSZXNMaTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlXCIgKVxuXHRcblx0b3B0RGVmYXVsdDpcblx0XHRsYWJlbDogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblxuXHRzZWxlY3RDb3VudDogMFxuXG5cdG9wdENvbGw6IFN0cmluZ09wdGlvbnNcblx0XG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0QGxvYWRpbmcgPSBmYWxzZVxuXHRcdGlmIG9wdGlvbnMubW9kZWwuZ2V0KCBcImNvdW50XCIgKT9cblx0XHRcdEBzZWxlY3RDb3VudCA9IG9wdGlvbnMubW9kZWwuZ2V0KCBcImNvdW50XCIgKVxuXHRcdG9wdGlvbnMuY3VzdG9tID0gdHJ1ZVxuXHRcdGlmIG9wdGlvbnMubW9kZWwuZ2V0KCBcImN1c3RvbVwiICk/XG5cdFx0XHRvcHRpb25zLmN1c3RvbSA9IEJvb2xlYW4oIG9wdGlvbnMubW9kZWwuZ2V0KCBcImN1c3RvbVwiICkgKVxuXHRcdFx0XG5cdFx0QGNvbGxlY3Rpb24gPSBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIG9wdGlvbnMubW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRcblx0XHRpZiBub3Qgb3B0aW9ucy5jdXN0b20gYW5kIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRAc2VsZWN0Q291bnQgPSBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdFxuXHRcdHN1cGVyKCBvcHRpb25zIClcblx0XHRcblx0XHRAcmVzdWx0Lm9uIFwicmVtb3ZlXCIsICggbWRsLCBjb2xsICk9PlxuXHRcdFx0aWYgY29sbC5sZW5ndGhcblx0XHRcdFx0b3B0aW9ucy5zdWIucmVuZGVyUmVzdWx0KClcblx0XHRcdEBzZWFyY2hjb2xsLmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyKCBcInJlbW92ZWRcIiwgbWRsIClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAZWRpdE1vZGUgPSBmYWxzZVxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgaW5wdXQjI3tAY2lkfVwiIF0gPSBcImNsb3NlXCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cdFxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdCMgY2hlY2sgaWYgdGhlIGNsb3NlIGlzIGluaXRpZWQgZnJvbSB0aGUgZWRpdCBtb2RlXG5cdFx0X2RlbFN1YiA9IGZhbHNlXG5cdFx0aWYgQGVkaXRNb2RlXG5cdFx0XHRfZGVsU3ViID0gdHJ1ZVxuXHRcdFx0XG5cdFx0QGVkaXRNb2RlID0gZmFsc2Vcblx0XHRpZiBAbG9hZGluZ1xuXHRcdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBmb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBtb2RlbD8uZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRcdGlmIF9kZWxTdWIgYW5kIEByZXN1bHQubGVuZ3RoIDw9IDBcblx0XHRcdEBzdWIuZGVsKClcblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdHJtUmVzOiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8udGFyZ2V0P1xuXHRcdFx0X2lkID0gJCggZXZudC50YXJnZXQgKT8uZGF0YSggXCJpZFwiIClcblx0XHRlbHNlIGlmIGV2bnQ/XG5cdFx0XHRfaWQgPSBldm50XG5cdFx0X21kbCA9IEByZXN1bHQuZ2V0KCBfaWQgKVxuXHRcdGlmIF9tZGw/XG5cdFx0XHRAcmVzdWx0LnJlbW92ZSggX2lkIClcblx0XHRcdGlmIF9tZGw/LmdldCggXCJjdXN0b21cIiApXG5cdFx0XHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggX2lkIClcblx0XHRyZXR1cm5cblx0XHRcblx0ZWRpdFJlczogKCBldm50ICk9PlxuXHRcdEBlZGl0TW9kZSA9IHRydWVcblx0XHRfaWQgPSAkKCBldm50LnRhcmdldCApPy5kYXRhKCBcImlkXCIgKVxuXHRcdF92ID0gQF9lZGl0dmFsID0gQHJlc3VsdC5nZXQoIF9pZCApLmdldCggXCJ2YWx1ZVwiIClcblx0XHRcblx0XHRAcmVzdWx0LnJlbW92ZSggX2lkIClcblx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIF9pZCApXG5cdFx0QHN1Yi5yZW9wZW4oKVxuXHRcdFxuXHRcdEBzZWFyY2goX3YpXG5cdFx0cmV0dXJuXG5cdFxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0X2RhdGEgPSBzdXBlclxuXHRcdGlmIEBfZWRpdHZhbD8ubGVuZ3RoXG5cdFx0XHRfZGF0YS5pbnB2YWwgPSBAX2VkaXR2YWxcblx0XHRcdEBfZWRpdHZhbCA9IG51bGxcblx0XHRyZXR1cm4gX2RhdGFcblx0XG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCI8bGk+PC9saT5cIlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBAdGVtcGxhdGVSZXNMaSggdHh0OiBtb2RlbC5nZXRMYWJlbCgpLCBpZDogbW9kZWwuaWQsIGN1c3RvbTogbW9kZWwuZ2V0KCBcImN1c3RvbVwiICkgIClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdGlmIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gKCBAcmVzdWx0IG9yIFtdKS5sZW5ndGggPj0gQHNlbGVjdENvdW50XG5cdFx0XG5cdHNlbGVjdDogPT5cblx0XHRpZiBAbG9hZGluZ1xuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfdmFscyA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgX3ZhbHM/IGFuZCBub3QgXy5pc0FycmF5KCBfdmFscyApXG5cdFx0XHRfdmFscyA9IFsgX3ZhbHMgXVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGZvciBfdmFsIGluICggaWYgQHNlbGVjdENvdW50IDw9IDAgdGhlbiBfdmFscyBlbHNlIF92YWxzWy4uLkBzZWxlY3RDb3VudF0gKVxuXHRcdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX3ZhbCApXG5cdFx0XHRpZiBub3QgX21kbD9cblx0XHRcdFx0X21kbCA9IG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IF92YWwsIGN1c3RvbTogdHJ1ZSApXG5cdFx0XHRAc2VsZWN0ZWQoIF9tZGwgKVxuXHRcdFxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0IyBpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdCMgXHRfaWQgPSBAcmVzdWx0Lmxhc3QoKT8uaWRcblx0XHRcdCMgXHRAcm1SZXMoIF9pZCApXG5cdFx0XHRzdXBlclxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0c2VhcmNoQ29udGVudCA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgc2VhcmNoQ29udGVudD8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0QWN0aXZlKClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRAbG9hZGluZyA9IHRydWVcblx0XHRcdF9jb2xsID0gbmV3IEBvcHRDb2xsKCBbXSApXG5cdFx0XHRcblx0XHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdEAkZWwucGFyZW50KCkuYWRkQ2xhc3MoIFwibG9hZGluZ1wiIClcblx0XHRcdFx0b3B0aW9ucyBAcmVzdWx0LCBAbW9kZWwsICggYU9wdHMgKT0+XG5cdFx0XHRcdFx0Zm9yIF9vcHQsIGlkeCBpbiBhT3B0c1xuXHRcdFx0XHRcdFx0YU9wdHNbaWR4XSA9IF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIF9vcHQsIHsgY3VzdG9tOiBmYWxzZSB9IClcblx0XHRcdFx0XHRfY29sbC5hZGQoIGFPcHRzIClcblx0XHRcdFx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0XHRcdFx0QCRlbC5wYXJlbnQoKS5yZW1vdmVDbGFzcyggXCJsb2FkaW5nXCIgKVxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFxuXHRcdFx0LCAwIClcblx0XHRcdHJldHVybiBfY29sbFxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiBvcHQsIGxhYmVsOiBvcHQgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KG9wdClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKVxuXHRcdHJldHVybiBuZXcgQG9wdENvbGwoIF9vcHRzIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3ViQXJyYXlcbiIsImNsYXNzIEZhY2V0U3Vic051bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvbnVtYmVyLmphZGVcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHN1cGVyXG5cdFx0I2lmIG5vdCBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdF9ldm50c1sgXCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiIF0gPSBcInNlbGVjdFwiXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdGlmIEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0XHRAJGlucE9wID0gQCRlbC5maW5kKCBcInNlbGVjdCMje0BjaWR9b3BcIiApXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIHsgd2lkdGg6IFwiYXV0b1wiIH0gKVxuXHRcdFx0QCRpbnBPcC5vbiggXCJzZWxlY3QyOmNsb3NlXCIsIEBfb3BTZWxlY3RlZCApXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0XHRAJGlucE9wLnJlbW92ZSgpXG5cdFx0XHRAJGlucE9wID0gbnVsbFxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/LnJlbGF0ZWRUYXJnZXQ/XG5cdFx0XHRfcG9zV3JwID0gQGVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBldm50Py5yZWxhdGVkVGFyZ2V0IClcblx0XHRcdGlmIG5vdCAoIF9wb3NXcnAgaXMgMCBvciBfcG9zV3JwIC0gMTYgPj0gMCApXG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuXG5cdFx0aWYgZXZudD8gYW5kICggZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucC5nZXQoMCkgb3IgZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucE9wPy5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdEBtb2RlbC5zZXQoIHsgb3BlcmF0b3I6IEAkaW5wT3AudmFsKCkgfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cblx0X29wU2VsZWN0ZWQ6ID0+XG5cdFx0QHNlbGVjdGVkT1AgPSB0cnVlXG5cdFx0QGZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRpZiBAJGlucE9wPyBhbmQgbm90IEBzZWxlY3RlZE9QXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQuZmlyc3QoKS5nZXQoIFwidmFsdWVcIiApXG5cdFx0X29sZE9wID0gQHJlc3VsdC5maXJzdCgpXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCB7IG9wZXJhdG9yczogQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApLCBvcGVyYXRvcjogQG1vZGVsLmdldCggXCJvcGVyYXRvclwiICl9IClcblxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0aWYgbm90IGlzTmFOKCBfdmFsIClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3AudmFsKClcblx0XHRlbHNlXG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyXG4iLCJjbGFzcyBGYWNldFN1YnNSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmFuZ2UuamFkZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ICggZXh0ID0gXCJfZnJvbVwiICk9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH0je2V4dH1cIlxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcInNlbGVjdFwiXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRyZXR1cm4gXCI8bGk+XCIgK19yZXMudmFsdWUuam9pbiggXCIgLSBcIiApICsgXCI8L2xpPlwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRpbnBUbyA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBUby5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGNsb3NlOiA9PlxuXHRcdHRyeVxuXHRcdFx0QCQoIFwiLnJhbmdlaW5wXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHRfcmV0ID1cblx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdkZyb20gPSBzdXBlclxuXHRcdF92ID0gQCRpbnBUby52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdF92VG8gPSBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRcdHJldHVybiBbIF92RnJvbSwgX3ZUbyBdXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRpZiBAJGlucC5pcyggZXZudC50YXJnZXQgKSBhbmQgbm90IGV2bnQuc2hpZnRLZXlcblx0XHRcdEAkaW5wVG8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XG5cdFx0aWYgQCRpbnBUby5pcyggZXZudC50YXJnZXQgKSBhbmQgZXZudC5zaGlmdEtleVxuXHRcdFx0QCRpbnAuZm9jdXMoKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRpZiBfdmFsPy5sZW5ndGggPj0gMlxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAc2VsZWN0KClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcblx0XHQjIHJldHVybiBmYWxzZSB0byBwcmV2ZW50IGp1bXAgdG8gbmV4dCBmYWNldFxuXHRcdHJldHVybiB0cnVlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1JhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic1NlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zZWxlY3QuamFkZVwiIClcblxuXHRmb3JjZWRNb2R1bGVPcHRzOnt9XG5cdCNcdG11bHRpcGxlOiB0cnVlXG5cblx0ZGVmYXVsdE1vZHVsZU9wdHM6XG5cdFx0I21heGltdW1TZWxlY3Rpb25MZW5ndGg6IDFcblx0XHR3aWR0aDogXCJhdXRvXCJcblx0XHRtdWx0aXBsZTogZmFsc2Vcblx0XG5cdGluaXRpYWxpemU6IC0+XG5cdFx0QGNvbnZlcnRWYWx1ZVRvSW50ID0gQF9jaGVja0ludFZhbHVlKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHt9XG5cdFx0X2V2bnRzWyBcImNsaWNrIC5zZWxlY3QtY2hlY2tcIiBdID0gXCJzZWxlY3RcIiBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBfZXZudHNcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwic2VsZWN0IyN7QGNpZH1cIlxuXHRcdFxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0IyBwcmV2ZW50IGZyb20gYXN5bmMgbGlzdGVuaW5nIG9uIG1hbnVhbCBhY2Nlc3Ncblx0XHRAbW9kZWwuc2V0KCBcIndhaXRGb3JBc3luY1wiLCBmYWxzZSApXG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5zaG93KClcblx0XHRAc2VsZWN0Mi5vcGVuKClcblx0XHQjZWxzZVxuXHRcdFx0I0AkaW5wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHQjIHNldCB0aGUgY3VycmVudCB2YWx1ZXNcblx0XHRfb2xkVmFscyA9IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWxzIClcblx0XHRcblx0XHQjIHJlc2V0IHJlc3VsdHMgYW5kIHNlbGVjdDJcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vZmYoKVxuXHRcdEBzZWxlY3QyLmRlc3Ryb3koKVxuXHRcdEByZXN1bHQucmVzZXQoKVxuXHRcdEBzZWxlY3QyID0gbnVsbFxuXHRcdFxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRfY2hlY2tJbnRWYWx1ZTogKCBfb3B0cyA9IFtdICk9PlxuXHRcdGlmIG5vdCBfb3B0cyBvciBub3QgX29wdHMubGVuZ3RoXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRmb3IgX3YgaW4gX29wdHNcblx0XHRcdGlmIF92LnZhbHVlPyBhbmQgXy5pc1N0cmluZyggX3YudmFsdWUgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92LmlkPyBhbmQgXy5pc1N0cmluZyggX3YuaWQgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92PyBhbmQgXy5pc1N0cmluZyggX3YgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXHRcdHJldHVybiB0cnVlXG5cblx0X2luaXRTZWxlY3QyOiA9PlxuXHRcdFxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIG9yIGZhbHNlIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3Qgc2VsZWN0MjpjbG9zZVwiLCBAc2VsZWN0XG5cdFx0XHRcblx0XHRcdCMgYWZ0ZXIgbG9hZGluZyB0cnkgdG8gc2V0IHRoZSBjdXJzb3IgZm9jdXNcblx0XHRcdEBzZWxlY3QyLm9uIFwicmVzdWx0czphbGxcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0XHRAY29udmVydFZhbHVlVG9JbnQgPSBAX2NoZWNrSW50VmFsdWUoIHJlc3VsdHM/LmRhdGE/LnJlc3VsdHMgKVxuXHRcdFx0XHRAc2VsZWN0Mi5zZWxlY3Rpb24/LiRzZWFyY2g/LmZvY3VzPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XHQjIGxpc3RlbiB0byBhc3luYyByZXN1bHQgY2hhbmdlcyBhbmQgc2V0IHRoZSBzZWxlY3Rpb25cblx0XHRcdEBzZWxlY3QyLmRhdGFBZGFwdGVyLmN1cnJlbnQgKCByZXN1bHRzICk9PlxuXHRcdFx0XHRpZiBAbW9kZWwuZ2V0KCBcIndhaXRGb3JBc3luY1wiIClcblx0XHRcdFx0XHRfZGF0YSA9IFtdXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yIHJlc3VsdCBpbiByZXN1bHRzXG5cdFx0XHRcdFx0XHRfZGF0YS5wdXNoIEBfY29udmVydFZhbHVlKCByZXN1bHQgKVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0IyBzZWxlY3QgdGhlIGFjdGl2ZS9wcmVkZWZpbmVkIHJlc3VsdHNcblx0XHRcdFx0XHRAX3NlbGVjdCggX2RhdGEgKVxuXHRcdFx0XHRcdEBjbG9zZSgpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcblx0XHRcdEBzZWxlY3QyLiRjb250YWluZXIub24gXCJjbGlja1wiLCBAX3NlbDJvcGVuXG5cdFx0XHRAc2VsZWN0Mi4kZWxlbWVudC5oaWRlKClcblx0XHRcdCMkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBAc2VsZWN0MlxuXG5cdF9zZWwyb3BlbjogKCBldm50ICktPlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdHJlbW92ZTogPT5cblx0XHQjQCRpbnAuc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IF8uZXh0ZW5kKCB7fSwgc3VwZXIsIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApLCBvcHRpb25zOiBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKSB9IClcblx0XHRpZiBfZGF0YS52YWx1ZT8gYW5kIF8uaXNBcnJheSggX2RhdGEudmFsdWUgKVxuXHRcdFx0Zm9yIF92LCBfaWR4IGluIF9kYXRhLnZhbHVlXG5cdFx0XHRcdF9kYXRhLnZhbHVlWyBfaWR4IF0gPSBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfdiApIGVsc2UgX3YudG9TdHJpbmcoKVxuXHRcdGVsc2UgaWYgX2RhdGEudmFsdWU/XG5cdFx0XHRfZGF0YS52YWx1ZSA9IFsgaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX2RhdGEudmFsdWUgKSBlbHNlIF9kYXRhLnZhbHVlLnRvU3RyaW5nKCkgXVxuXHRcdFxuXHRcdGlmIF9kYXRhLnZhbHVlP1xuXHRcdFx0X3ZsaXN0ID0gXy5wbHVjayggX2RhdGEub3B0aW9ucywgXCJ2YWx1ZVwiIClcblx0XHRcdGZvciBfdiBpbiBfZGF0YS52YWx1ZSB3aGVuIF92IG5vdCBpbiBfdmxpc3Rcblx0XHRcdFx0X2RhdGEub3B0aW9ucy5wdXNoIHsgdmFsdWU6ICggaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX3YgKSBlbHNlIF92LnRvU3RyaW5nKCkgKSwgbGFiZWw6IF92LCBncm91cDogdW5kZWZpbmVkIH1cblx0XHRcblx0XHRfZ3JvdXBzID0gXy5ncm91cEJ5KCBfZGF0YS5vcHRpb25zLCBcImdyb3VwXCIgKVxuXHRcdGlmIF8uY29tcGFjdCggXy5rZXlzKCBfZ3JvdXBzIG9yIHt9ICkgKS5sZW5ndGggPiAxXG5cdFx0XHRfZGF0YS5vcHRpb25Hcm91cHMgPSBfZ3JvdXBzXG5cdFx0cmV0dXJuIF9kYXRhXG5cdFxuXHRfaGFzVGFiTGlzdGVuZXI6ICggY3JlYXRlICk9PlxuXHRcdGlmIGNyZWF0ZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIEBtb2RlbC5nZXQoXCJtdWx0aXBsZVwiKVxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleXVwXCJcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ZhbHMgPSBbXVxuXHRcdGZvciBkYXRhIGluIEBfaW5pdFNlbGVjdDIoKT8uZGF0YSgpIG9yIFtdXG5cdFx0XHRcblx0XHRcdF92YWxzLnB1c2goIEBfY29udmVydFZhbHVlKCBkYXRhICkgKVxuXHRcdHJldHVybiBfdmFsc1xuXHRcblx0X2NvbnZlcnRWYWx1ZTogKCBkYXRhICk9PlxuXHRcdF9kYXRhID0ge31cblx0XHRpZiBAY29udmVydFZhbHVlVG9JbnRcblx0XHRcdF9kYXRhLnZhbHVlID0gcGFyc2VGbG9hdCggZGF0YS5pZCApXG5cdFx0ZWxzZVxuXHRcdFx0X2RhdGEudmFsdWUgPSBkYXRhLmlkXG5cdFx0aWYgZGF0YS50ZXh0P1xuXHRcdFx0aWYgZGF0YS50ZXh0IGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0Lmh0bWwoKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfZGF0YS5sYWJlbCA9IGRhdGEudGV4dFxuXHRcdFx0XG5cdFx0cmV0dXJuIF9kYXRhXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogKCBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBvcHQgKSBlbHNlIG9wdC50b1N0cmluZygpICksIGxhYmVsOiBvcHQsIGdyb3VwOiBudWxsIH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdCggb3B0IClcblx0XHRcdFx0b3B0LnZhbHVlID0gaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggb3B0LnZhbHVlICkgZWxzZSBvcHQudmFsdWUudG9TdHJpbmcoKVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0dW5zZWxlY3Q6ICggZXZudCApPT5cblx0XHRAcmVzdWx0LnJlbW92ZSggZXZudC5wYXJhbXM/LmRhdGE/LmlkIClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRpZiBAbW9kZWwuZ2V0KCBcIndhaXRGb3JBc3luY1wiIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEBzZWxlY3QyP1xuXHRcdFx0I0BzZWxlY3QyPy5kZXN0cm95KClcblx0XHRcdEBzZWxlY3QyLiRjb250YWluZXIuaGlkZSgpXG5cdFx0QCRpbnA/LnJlbW92ZSgpXG5cdFx0QCQoIFwiLnNlbGVjdC1jaGVja1wiICkucmVtb3ZlKClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKSBpZiBldm50Py5zdG9wUHJvcGFnYXRpb25cblx0XHRfdmFscyA9IEBnZXRWYWx1ZSgpXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdCMgSXNzdWUjNDkgaWYgbm90aGluZyB3YXMgc2VsZWN0ZWQgY2xvc2UgdGhlIHNlbGVjdC12aWV3IGFuZCByZW1vdmUgdGhlIHdob2xlIGZhY2V0XG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0XHRAc3ViLmRlbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRAX3NlbGVjdCggX3ZhbHMgKVxuXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdF9zZWxlY3Q6ICggX3ZhbHMgKT0+XG5cdFx0QG1vZGVsLnNldCggXCJ3YWl0Rm9yQXN5bmNcIiwgZmFsc2UgKVxuXHRcdE1vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdGZvciBfdmFsIGluIF92YWxzXG5cdFx0XHRAcmVzdWx0LmFkZCggbmV3IE1vZGVsQ29uc3QoIF92YWwgKSApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzU2VsZWN0XG4iLCJjbGFzcyBGYWNldFN1YlN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zdHJpbmcuamFkZVwiIClcblx0XG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJzZWxlY3RcIlxuXG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0c3VwZXJcblx0XHR0cnlcblx0XHRcdEAkaW5wPy5yZW1vdmU/KClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdD8uZmlyc3QoKT8uZ2V0KCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3ViU3RyaW5nXG4iLCJTdWJWaWV3ID0gcmVxdWlyZSggXCIuL3N1YlwiIClcblNlbGVjdG9yVmlldyA9IHJlcXVpcmUoIFwiLi9zZWxlY3RvclwiIClcblxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBNYWluVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvd3JhcHBlci5qYWRlXCIgKVxuXG5cdGV2ZW50czpcblx0XHRcIm1vdXNlZG93biAuc2VhcmNoLWJ0blwiOiBcIl9vblNlYXJjaFwiXG5cdFx0XCJmb2N1cyAuc2VhcmNoLWJ0blwiOiBcIl9vbkZvY3VzU2VhcmNoXCJcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0XG5cdFx0QG1haW4gPSBvcHRpb25zLm1haW5cblx0XHRAaWR4ID0gb3B0aW9ucy5pZHhcblx0XHRAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXHRcdEBzZWFyY2hCdXR0b24gPSBvcHRpb25zLnNlYXJjaEJ1dHRvblxuXHRcdFxuXHRcdEBmYWNldHMgPSB7fVxuXHRcdFxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cdFx0XG5cdFx0X2NsID0gXCJpZ2d5IGNsZWFyZml4XCJcblx0XHRpZiBAZWwuY2xhc3NOYW1lPy5sZW5ndGhcblx0XHRcdF9jbCA9IFwiIFwiICsgX2NsXG5cdFx0QGVsLmNsYXNzTmFtZSArPSBfY2xcblx0XHRAcmVuZGVyKClcblx0XHRAX291dGVyQ2xpY2tMaXN0ZW4oKVxuXHRcdEBfa2V5TGlzdGVuKClcblx0XHRcblx0XHRfdmFsdWVGYWNldHMgPSBAY29sbGVjdGlvbi5maWx0ZXIoICggZmN0ICktPnJldHVybiBmY3Q/LmdldCggXCJ2YWx1ZVwiICk/IG9yIGZjdD8uZ2V0KCBcInBpbm5lZFwiICkgKVxuXHRcdFxuXHRcdF9mblNvcnQgPSAoIGtleSApLT5cblx0XHRcdHJldHVybiAoIHYxLCB2MiApLT5cblx0XHRcdFx0aWYgdjFbIGtleSBdID4gdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIDFcblx0XHRcdFx0aWYgdjFbIGtleSBdIDwgdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHRcdHJldHVybiAwXG5cdFx0XG5cdFx0Zm9yIGZjdCBpbiBfdmFsdWVGYWNldHMuc29ydCggX2ZuU29ydCggXCJfaWR4XCIgKSApXG5cdFx0XHRAZ2VuU3ViKCBmY3QsIGZhbHNlLCB0cnVlIClcblx0XHRcblx0XHRAY29sbGVjdGlvbi5vbiBcImFkZFwiLCA9PlxuXHRcdFx0QCRhZGRCdG4uc2hvdygpXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0X2FjdGl2ZSA9IEBjb2xsZWN0aW9uLmZpbHRlciggKCBmY3QgKS0+cmV0dXJuIGZjdD8uZ2V0KCBcImFjdGl2ZVwiICkgYW5kIGZjdD8uZ2V0KCBcInBpbm5lZFwiICkgKVxuXHRcdFx0aWYgX2FjdGl2ZS5sZW5ndGhcblx0XHRcdFx0dmlldyA9IEBmYWNldHNbIF9hY3RpdmVbIDAgXS5pZCBdXG5cdFx0XHRcdCNAc3VidmlldyA9IHZpZXdcblx0XHRcdFx0dmlldz8ucmVvcGVuKClcblx0XHRcdFx0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCAwIClcblx0XHRcblx0XHRyZXR1cm5cblx0XG5cdHRlbXBsYXRlRGF0YTogPT5cblx0XHRfcmV0ID1cblx0XHRcdHRhYl9pbmRleDogKCAoICggQGlkeCBvciAxICkgKyAxICkgKiAxMDAwICkgLSAxMFxuXHRcdGlmICBAc2VhcmNoQnV0dG9uP1xuXHRcdFx0X3JldC5zZWFyY2hCdXR0b24gPVxuXHRcdFx0XHR0ZW1wbGF0ZTogQHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSBvciBcIlwiXG5cdFx0XHRcdGV2ZW50OiBAc2VhcmNoQnV0dG9uLmV2ZW50IG9yIFwic2VhcmNoXCJcblx0XHRcdFx0cHVsbHJpZ2h0OiBAc2VhcmNoQnV0dG9uLnB1bGxyaWdodCBvciBmYWxzZVxuXHRcdFx0XHRjc3NjbGFzczogQHNlYXJjaEJ1dHRvbi5jc3NjbGFzcyBvciBcImJ0biBidG4tcHJpbWFyeSBmYSBmYS1zZWFyY2hcIlxuXHRcdFxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRyZW5kZXI6ID0+XG5cdFx0X3RwbERhdGEgPSBAdGVtcGxhdGVEYXRhKClcblx0XHRAJGVsLmh0bWwoIEB0ZW1wbGF0ZSggX3RwbERhdGEgKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRpZiBfdHBsRGF0YS5zZWFyY2hCdXR0b24/XG5cdFx0XHRAJHNlYXJjaEJ0biA9IEAkKCBcIi5zZWFyY2gtYnRuXCIgKVxuXHRcdHJldHVyblxuXG5cdF9hZGRGYWNldDogKCBldm50ICk9PlxuXHRcdEBhZGRGYWNldCgpXG5cdFx0cmV0dXJuXG5cblx0ZXhpdDogKCBuZXh0QWRkID0gdHJ1ZSApPT5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBuZXh0QWRkXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVtRmFjZXQ6ICggZmFjZXRNICk9PlxuXHRcdEByZXN1bHRzLnJlbW92ZSggZmFjZXRNLmdldCggXCJuYW1lXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0c2V0RmFjZXQ6ICggZmFjZXRNLCBkYXRhICk9PlxuXHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdEByZXN1bHRzLmFkZCggXy5leHRlbmQoIGRhdGEsIHsgbmFtZTogZmFjZXRNLmdldCggXCJuYW1lXCIgKSwgdHlwZTogZmFjZXRNLmdldCggXCJ0eXBlXCIgKSB9ICksIHsgbWVyZ2U6IHRydWUsIHBhcnNlOiB0cnVlLCBfZmFjZXQ6IGZhY2V0TSB9IClcblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRAJGFkZEJ0bi5oaWRlKClcblx0XHRyZXR1cm5cblxuXHRnZW5TdWI6ICggZmFjZXRNLCBhZGRBZnRlciA9IHRydWUsIGluaXRpYWxBZGQ9ZmFsc2UgKT0+XG5cdFx0c3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgcGFyZW50OiBAIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcImdlblN1YiAtIGNsb3NlZFwiLCByZXN1bHRzLCBzdWJ2aWV3Lm1vZGVsLmlkXG5cdFx0XHRpZiBzdWJ2aWV3Py5tb2RlbD8uZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1VCIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0I3N1YnZpZXcub2ZmKClcblx0XHRcdHN1YnZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBhZGRBZnRlclxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0c3Vidmlldy5vbiBcInJlb3BlblwiLCA9PlxuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0X3NlbGYgPSBAXG5cdFx0c3Vidmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNLCBkYXRhICktPlxuXHRcdFx0I2NvbnNvbGUubG9nIFwic3VidmlldyAtIHNlbGVjdGVkXCIsIEBcblx0XHRcdF9zZWxmLnNldEZhY2V0KCBmYWNldE0sIGRhdGEgKVxuXHRcdFx0aWYgbm90IEBzZWxlY3R2aWV3Ll9pc0Z1bGw/IG9yIEBzZWxlY3R2aWV3Ll9pc0Z1bGwoKVxuXHRcdFx0XHRfc2VsZi5fbmV4dEZhY2V0KCBudWxsLCBAIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdEAkYWRkQnRuLmJlZm9yZSggc3Vidmlldy5yZW5kZXIoIGluaXRpYWxBZGQgKSApXG5cdFx0QGZhY2V0c1sgZmFjZXRNLmlkIF0gPSBzdWJ2aWV3XG5cdFx0cmV0dXJuIHN1YnZpZXdcblxuXHRhZGRGYWNldDogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBTRUxFQ1QgRVhJU1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBAc3Vidmlldz9cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBTVUIgRVhJU1RcIlxuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgRU1QVFkgQ09MTFwiXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IFNlbGVjdG9yVmlldyggY29sbGVjdGlvbjogQGNvbGxlY3Rpb24sIGN1c3RvbTogZmFsc2UsIG1haW46IEAgKVxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJvcGVuZWRcIiwgPT5cblx0XHRcdEBfb25PcGVuZWQoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHRAX29uQ2xvc2VkKClcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNFTEVDVCBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdCNAc3Vidmlldy5vZmYoKVxuXHRcdFx0XHRAc3Vidmlldy5yZW1vdmUoKVxuXHRcdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIGZhY2V0TSApPT5cblx0XHRcdGZhY2V0TS5zZXQoIFwidmFsdWVcIiwgbnVsbCApXG5cdFx0XHRAc3VidmlldyA9IEBnZW5TdWIoIGZhY2V0TSApXG5cdFx0XHRAc3Vidmlldy5vcGVuKClcblx0XHRcdHJldHVyblxuXHRcblx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25PcGVuZWQ6ID0+XG5cdFx0QCRhZGRCdG4/LmhpZGUoKVxuXHRcdHJldHVyblxuXHRcblx0X29uQ2xvc2VkOiA9PlxuXHRcdEAkYWRkQnRuPy5zaG93KClcblx0XHRyZXR1cm5cblx0XG5cdF9vdXRlckNsaWNrTGlzdGVuOiA9PlxuXHRcdGpRdWVyeSggZG9jdW1lbnQgKS5vbiBcImNsaWNrXCIsIEBfb3V0ZXJDbGlja1xuXHRcdHJldHVyblxuXHRcblx0X2tleUxpc3RlbjogPT5cblx0XHRqUXVlcnkoIGRvY3VtZW50ICkub24gXCJrZXlkb3duXCIsICggZXZudCApPT5cblx0XHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5UQUIgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLlRBQlxuXHRcdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XG5cdFx0XHRcdGlmICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLnNlYXJjaC1idG5cIiApXG5cdFx0XHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0XHRcdEBhZGRGYWNldCgpXG5cdFx0XHRcdFx0LCAwIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcblx0XHRcdFx0IyBjYXNlIG9ubHkgdGhlIGZhY2V0IHNlbGVjdG9yIGlzIG9wZW5cblx0XHRcdFx0aWYgQHNlbGVjdHZpZXc/LmlzT3BlblxuXHRcdFx0XHRcdGlmIGV2bnQ/LnNoaWZ0S2V5XG5cdFx0XHRcdFx0XHRfcHJldklkID0gQCRhZGRCdG4/LnByZXZBbGwoIFwiLnN1YlwiICk/LmZpcnN0KCk/LmRhdGEoIFwiZmN0aWRcIiApXG5cdFx0XHRcdFx0XHRpZiBfcHJldklkP1xuXHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRcdFx0XHRcdEBmYWNldHNbIF9wcmV2SWQgXT8ucmVvcGVuKClcblx0XHRcdFx0XHRcdFx0LCAwIClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRAc2VsZWN0dmlldy5jbG9zZSgpXG5cdFx0XHRcdFx0XHRAZm9jdXNTZWFyY2goKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdCMgb3RoZXJ3aXNlIHRyaWdnZXIgZXNjYXBlIGV2ZW50IGFuZCBsaXN0ZW4gZm9yIHRoZSByZXNwb25zZSBvZiB0aGUgb3BlbiBmYWNldFxuXHRcdFx0XHRAdHJpZ2dlciBcImVzY2FwZVwiLCBldm50LCBAX25leHRGYWNldFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5FU0Mgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0XHRAZXhpdCgpXG5cdFx0XHRcdEB0cmlnZ2VyKCBcImVzY2FwZVwiLCBldm50IClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdF9uZXh0RmFjZXQ6ICggZXZudCwgc3ViVmlldyApPT5cblx0XHRfbmV4dEZuID0gaWYgZXZudD8uc2hpZnRLZXkgdGhlbiBcInByZXZcIiBlbHNlIFwibmV4dFwiXG5cdFx0X25leHQgPSBzdWJWaWV3LiRlbD9bIF9uZXh0Rm4gXT8oKVxuXHRcdFxuXHRcdGlmIF9uZXh0Lmhhc0NsYXNzKCBcImFkZC1mYWNldC1idG5cIiApXG5cdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRAYWRkRmFjZXQoKVxuXHRcdFx0LCAwIClcblx0XHRcdHJldHVyblxuXHRcdF9uZXh0SWQgPSBfbmV4dD8uZGF0YSggXCJmY3RpZFwiIClcblx0XHRpZiBfbmV4dElkP1xuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QGZhY2V0c1sgX25leHRJZCBdPy5yZW9wZW4oKVxuXHRcdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XHRcblx0Zm9jdXNTZWFyY2g6ID0+XG5cdFx0aWYgQCRzZWFyY2hCdG4/XG5cdFx0XHRAJHNlYXJjaEJ0bi5mb2N1cygpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdF9vblNlYXJjaDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAZXhpdCgpXG5cdFx0QHRyaWdnZXIoIFwic2VhcmNoYnV0dG9uXCIsIEBzZWFyY2hCdXR0b24uZXZlbnQgKVxuXHRcdHJldHVyblxuXHRcblx0X29uRm9jdXNTZWFyY2g6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdHZpZXc/LmNsb3NlPygpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdF9vdXRlckNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdF9wb3NXcnAgPSBAZWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGV2bnQudGFyZ2V0IClcblx0XHRpZiBub3QgKCBfcG9zV3JwIGlzIDAgb3IgX3Bvc1dycCAtIDE2ID49IDAgKVxuXHRcdFx0QGV4aXQoIGZhbHNlIClcblx0XHRyZXR1cm5cblx0XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblZpZXdcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU2VsZWN0b3JWaWV3IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0cy9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3Rvci5qYWRlXCIgKVxuXHR0ZW1wbGF0ZUVsOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9ybGkuamFkZVwiIClcblx0c2VsZWN0Q291bnQ6IDFcblxuXHRjbGFzc05hbWU6ID0+XG5cdFx0Y2xzID0gWyBcImFkZC1mYWNldFwiIF1cblx0XHRpZiBAY3VzdG9tXG5cdFx0XHRjbHMucHVzaCBcImN1c3RvbVwiXG5cdFx0cmV0dXJuIGNscy5qb2luKCBcIiBcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwibW91c2Vkb3duIGFcIjogXCJfb25DbGlja1wiXG5cdFx0XCJmb2N1cyBpbnB1dCMje0BjaWR9XCI6IFwib3BlblwiXG5cdFx0I1wiYmx1ciBpbnB1dCMje0BjaWR9XCI6IFwiY2xvc2VcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblx0XHRcImtleXVwIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0QGN1c3RvbSA9IG9wdGlvbnMuY3VzdG9tIG9yIGZhbHNlXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRAY3VyclF1ZXJ5ID0gXCJcIlxuXHRcdFxuXHRcdGlmIG9wdGlvbnMubWFpbj9cblx0XHRcdEBtYWluID0gb3B0aW9ucy5tYWluXG5cdFx0XG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0c3VwZXJcblx0XHRAc2VhcmNoY29sbCA9IEBjb2xsZWN0aW9uLnN1YiggLT50cnVlIClcblx0XHRAcmVzdWx0ID0gbmV3IEBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yKClcblx0XHRcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHMgd2hlbiBub3QgbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfdG1wbCA9IG1vZGVsLmdldCggXCJsYWJlbHRlbXBsYXRlXCIgKVxuXHRcdFx0aWYgX3RtcGw/XG5cdFx0XHRcdF9sYmwgPSBfdG1wbC5yZXBsYWNlKCBcInt7bGFiZWx9fVwiLCBfbGJsIClcblx0XHRcdFx0XG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXHRcdFx0X2Nzc2NsYXNzID0gbW9kZWwuZ2V0KCBcImNzc2NsYXNzXCIgKVxuXHRcdFx0aWYgQGN1cnJRdWVyeT8ubGVuZ3RoID4gMVxuXHRcdFx0XHRfbGJsID0gX2xibC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBAY3VyclF1ZXJ5LCBcImdpXCIgKSwgKCggc3RyICktPnJldHVybiBcIjxiPiN7c3RyfTwvYj5cIiApIClcblx0XHRcdF9saXN0LnB1c2ggbGFiZWw6IF9sYmwsIGlkOiBfaWQsIGNzc2NsYXNzOiBfY3NzY2xhc3Ncblx0XHQjaWYgX2xpc3QubGVuZ3RoXG5cdFx0QCRsaXN0LmFwcGVuZCggQHRlbXBsYXRlRWwoXG5cdFx0XHRsaXN0OiBfbGlzdCxcblx0XHRcdHF1ZXJ5OiBAY3VyclF1ZXJ5LFxuXHRcdFx0YWN0aXZlSWR4OiBAYWN0aXZlSWR4LFxuXHRcdFx0Y3VzdG9tOiBAY3VzdG9tXG5cdFx0KSApXG5cblx0XHRAX2NoZWNrU2Nyb2xsKClcblx0XHRcblx0XHRyZXR1cm4gQCRsaXN0XG5cblx0X3Njcm9sbFRpbGw6IDE5OFxuXHRfY2hlY2tTY3JvbGw6ID0+XG5cdFx0X2hlaWdodCA9IEAkbGlzdC5oZWlnaHQoKVxuXHRcdGlmIF9oZWlnaHQgPiAwXG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBfaGVpZ2h0IClcblx0XHRcdHJldHVyblxuXG5cdFx0IyBleGl0IHRoZSB0aGUgY2FsbCBzdGFjayB0byBjaGVjayBoZWlnaHQgYWZ0ZXIgdGhlIG1vZHVsZSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgZG9tXG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEBzY3JvbGxIZWxwZXIoIEAkbGlzdC5oZWlnaHQoKSApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblxuXHRzY3JvbGxIZWxwZXI6ICggaGVpZ2h0ICk9PlxuXHRcdGlmIGhlaWdodCA+PSBAX3Njcm9sbFRpbGxcblx0XHRcdEBzY3JvbGxpbmcgPSB0cnVlXG5cdFx0ZWxzZVxuXHRcdFx0QHNjcm9sbGluZyA9IGZhbHNlXG5cdFx0cmV0dXJuXG5cblx0Y2hlY2tPcHRpb25zRW1wdHk6ID0+XG5cdFx0I2lmIEBzZWFyY2hjb2xsLmxlbmd0aCA8PSAwXG5cdFx0I1x0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRfb25DbGljazogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblxuXHRcdF9pZCA9IEAkKCBldm50LmN1cnJlbnRUYXJnZXQgKS5kYXRhKCBcImlkXCIgKVxuXHRcdGlmIG5vdCBfaWQ/XG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF9tZGwgPSBAY29sbGVjdGlvbi5nZXQoIF9pZCApXG5cdFx0aWYgbm90IF9tZGw/XG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGlmIEBtYWluP1xuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAbWFpbi5mb2N1c1NlYXJjaCgpXG5cdFx0ZWxzZVxuXHRcdFx0c3VwZXIoIGV2ZW50IClcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0ZWQ6ICggbWRsICk9PlxuXHRcdGlmIG5vdCBAbWFpbj8gYW5kIEBfaXNGdWxsKClcblx0XHRcdF9pZCA9IEByZXN1bHQubGFzdCgpPy5pZFxuXHRcdFx0QHJtUmVzKCBfaWQgKVxuXHRcdFx0XG5cdFx0dHJ5XG5cdFx0XHRpZiBtZGwub25seUV4ZWM/XG5cdFx0XHRcdG1kbD8uZXhlYz8oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRjYXRjaCBfZXJyXG5cdFx0XHR0cnlcblx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyMzogQ0FUQ0ggLSBDbGFzczojeyBAY29uc3RydWN0b3IubmFtZSB9IC0gYWN0aXZlSWR4OiN7QGFjdGl2ZUlkeH0gLSBjb2xsZWN0aW9uOiN7SlNPTi5zdHJpbmdpZnkoIEBjb2xsZWN0aW9uLnRvSlNPTigpKX1cIlxuXHRcdFx0Y2F0Y2ggX2VycmVyclxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSFwiXG5cdFx0XG5cdFx0aWYgbWRsP1xuXHRcdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBtZGwgKVxuXHRcdFx0QHJlc3VsdC5hZGQoIG1kbCApXG5cdFx0XHRAdHJpZ2dlciBcInNlbGVjdGVkXCIsIG1kbFxuXHRcdFxuXHRcdGlmIEBfaXNGdWxsKClcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdF9lbCA9IEAkaW5wLmdldCgwKVxuXHRcdFxuXHRcdF9lbC5zZWxlY3Rpb25TdGFydCA9IF9lbC5zZWxlY3Rpb25FbmQgPSBfZWwudmFsdWUubGVuZ3RoXG5cdFx0cmV0dXJuXG5cdFxuXHRvcGVuOiA9PlxuXHRcdCNjb25zb2xlLmxvZyBcInNlbGVjdG9yIG9wZW5cIlxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50Py50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAbW92ZSggdHJ1ZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBtb3ZlKCBmYWxzZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0QWN0aXZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIF8uaXNTdHJpbmcoIGV2bnQgKVxuXHRcdFx0X3EgPSBldm50XG5cdFx0ZWxzZVxuXHRcdFx0X3EgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKVxuXHRcdGlmIF9xIGlzIEBjdXJyUXVlcnlcblx0XHRcdHJldHVyblxuXG5cdFx0QGN1cnJRdWVyeSA9IF9xXG5cblx0XHRAc2VhcmNoY29sbC51cGRhdGVTdWJGaWx0ZXIoICggbWRsICk9PlxuXHRcdFx0aWYgQHJlc3VsdC5nZXQoIG1kbC5pZCApP1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIG5vdCBfcT8ubGVuZ3RoXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRfbWF0Y2ggPSBtZGwubWF0Y2goIF9xIClcblx0XHRcdHJldHVybiBfbWF0Y2hcblx0XHQsIGZhbHNlIClcblxuXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm5cblxuXHRtb3ZlOiAoIHVwID0gZmFsc2UgKT0+XG5cdFx0X2xpc3QgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGFcIiApXG5cdFxuXHRcdF9jdXN0b21FbGVtZW50Q2hhbmdlID0gaWYgQGN1cnJRdWVyeT8ubGVuZ3RoIHRoZW4gMCBlbHNlIDFcblx0XHRfdG9wID0gMFxuXHRcdGlmIHVwXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxXG5cdFx0ZWxzZVxuXHRcdFx0aWYgQHNlYXJjaGNvbGwubGVuZ3RoIC0gX2N1c3RvbUVsZW1lbnRDaGFuZ2UgPD0gQGFjdGl2ZUlkeFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4ICsgMVxuXG5cdFx0XG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0XyRlbG5ldyA9IEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0aWYgQHNjcm9sbGluZ1xuXHRcdFx0X2VsSCA9IF8kZWxuZXcub3V0ZXJIZWlnaHQoKVxuXHRcdFx0X3BvcyA9IF9lbEggKiAoIF9uZXdpZHggKyAxIClcblx0XHRcdF8kbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3RcIiApXG5cdFx0XHRfc2Nyb2xsVCA9IF8kbGlzdC5zY3JvbGxUb3AoKVxuXHRcdFx0aWYgX3BvcyA+IF9zY3JvbGxUICsgQF9zY3JvbGxUaWxsXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBAX3Njcm9sbFRpbGwgKVxuXHRcdFx0ZWxzZSBpZiBfcG9zIDwgX3Njcm9sbFQgKyBfZWxIXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBfZWxIIClcblxuXHRcdEBhY3RpdmVJZHggPSBfbmV3aWR4XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0Oj0+XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0QWN0aXZlOiAoIGlzRW50ZXJFdmVudD1mYWxzZSApPT5cblx0XHRpZiBub3QgQG1haW4/IGFuZCBAX2lzRnVsbCgpXG5cdFx0XHRfaWQgPSBAcmVzdWx0Lmxhc3QoKT8uaWRcblx0XHRcdEBybVJlcyggX2lkIClcblx0XHRcdFx0XG5cdFx0X3NlbCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYS5hY3RpdmVcIiApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiICkuZGF0YSgpXG5cdFx0XHRcblx0XHRfc2VhcmNoID0gQCRpbnAudmFsKClcblx0XHRcblx0XHRpZiAgbm90IF9zZWw/IGFuZCBAc2VsZWN0Q291bnQgaXNudCAxIGFuZCBpc0VudGVyRXZlbnQgYW5kIG5vdCBfc2VhcmNoPy5sZW5ndGhcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIG5vdCBfc2VsP1xuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRpZiBfc2VsPy5pZHggPj0gMCBhbmQgQHNlYXJjaGNvbGwubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIEBjb2xsZWN0aW9uLmdldCggX3NlbC5pZCApIClcblx0XHRlbHNlIGlmIEBjdXJyUXVlcnk/Lmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBAY3VyclF1ZXJ5LCBjdXN0b206IHRydWUgKSApXG5cdFx0XHRAJGlucC52YWwoIFwiXCIgKVxuXHRcdGVsc2Vcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdG9yVmlld1xuIiwiY2xhc3MgVmlld1N1YiBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc3ViLmphZGVcIiApXG5cdGNsYXNzTmFtZTogPT5cblx0XHRfc3RkID0gXCJzdWJcIlxuXHRcdF90eXBlID0gQG1vZGVsLmdldCggXCJ0eXBlXCIgKVxuXHRcdGlmIF90eXBlP1xuXHRcdFx0X3N0ZCArPSBcIiBzdWItdHlwZS1cIiArIF90eXBlXG5cdFx0XG5cdFx0X25hbWUgPSBAbW9kZWwuZ2V0KCBcIm5hbWVcIiApXG5cdFx0aWYgX25hbWU/XG5cdFx0XHRfc3RkICs9IFwiIHN1Yi1uYW1lLVwiICsgX25hbWVcblx0XHRyZXR1cm4gX3N0ZFxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0QHJlc3VsdCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKClcblx0XHRAJGVsLm9uIFwiY2xpY2tcIiwgQHJlb3BlblxuXHRcdEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXHRcdFxuXHRcdEAkZWwuZGF0YSggXCJmY3RpZFwiLCBAbW9kZWwuaWQgKVxuXHRcdFxuXHRcdEBwYXJlbnQub24gXCJlc2NhcGVcIiwgKCBldm50LCBjYiApPT5cblx0XHRcdGlmIEBfaXNPcGVuXG5cdFx0XHRcdGlmIEBzZWxlY3R2aWV3Py5fb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0XHRcdGNiKCBldm50LCBAICkgaWYgY2I/XG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblxuXHRyZW5kZXI6ICggaW5pdGlhbEFkZCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdHRyeVxuXHRcdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblx0XHRcdGNhdGNoIF9lcnJcblx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0ggLSBDbGFzczojeyBAY29uc3RydWN0b3IubmFtZSB9IC0gbW9kZWw6I3tKU09OLnN0cmluZ2lmeShAbW9kZWwudG9KU09OKCkpfSAtIHJlc3VsdDoje0pTT04uc3RyaW5naWZ5KCBAcmVzdWx0LnRvSlNPTigpKX1cIlxuXHRcdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0hcIlxuXHRcdFxuXHRcdEAkZWwuaHRtbCBAdGVtcGxhdGVcblx0XHRcdGxhYmVsOiBAbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0c2VsZWN0ZWQ6IF9saXN0XG5cdFx0XHR0eXBlOiBAbW9kZWwuZ2V0KCBcInR5cGVcIiApXG5cdFx0XHRuYW1lOiBAbW9kZWwuZ2V0KCBcIm5hbWVcIiApXG5cdFx0XHRwaW5uZWQ6IEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKSBvciBmYWxzZVxuXHRcdFx0XHRcblx0XHRAJHN1YiA9IEAkKCBcIi5zdWJzZWxlY3RcIiApXG5cdFx0QCRyZXN1bHRzID0gQCQoIFwiLnN1YnJlc3VsdHNcIiApXG5cblx0XHRAZ2VuZXJhdGVTdWIoIGluaXRpYWxBZGQgKVxuXHRcdHJldHVybiBAZWxcblx0XG5cdHJlb3BlbjogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/IGFuZCAkKCBldm50LnRhcmdldCApLmlzKCBcIi5ybS1yZXN1bHQtYnRuXCIgKSBhbmQgQHNlbGVjdHZpZXc/LnJtUmVzP1xuXHRcdFx0QHNlbGVjdHZpZXcucm1SZXMoIGV2bnQgKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIGV2bnQ/IGFuZCAkKCBldm50LnRhcmdldCApLmlzKCBcIi5lZGl0LXJlc3VsdC1idG5cIiApIGFuZCBAc2VsZWN0dmlldz8uZWRpdFJlcz9cblx0XHRcdEBzZWxlY3R2aWV3LmVkaXRSZXMoIGV2bnQgKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIG5vdCBAX2lzT3BlbiBhbmQgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldy5yZW9wZW4oIEAgKVxuXHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEB0cmlnZ2VyKCBcInJlb3BlblwiIClcblx0XHRyZXR1cm5cblx0XHRcblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0aWYgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdEBjb2xsZWN0aW9uLnRyaWdnZXIoIFwiaWdneTpyZW1cIiwgQG1vZGVsIClcblx0XHRAY29sbGVjdGlvbi5hZGQoIEBtb2RlbCApXG5cdFx0QHJlbW92ZSgpXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIgKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHJlbW92ZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0QHNlbGVjdHZpZXc/LnJlbW92ZSgpXG5cdFx0QHBhcmVudCA9IG51bGxcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRzZWxlY3RlZDogKCBvcHRNZGwgKT0+XG5cdFx0QHJlc3VsdC5hZGQoIG9wdE1kbCwgeyBtZXJnZTogdHJ1ZSB9IClcblx0XHRAcmVuZGVyUmVzdWx0KClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW1vdmVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LnJlbW92ZSggb3B0TWRsIClcblx0XHRAcmVuZGVyUmVzdWx0KClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0XG5cdFx0IyByZW1vdmUgZmFjZXQgaWYgY29udGVudCBsZW5ndGggb3IgdGhlIGZhY2V0IGlzIGluIGVkaXRNb2RlXG5cdFx0aWYgQHJlc3VsdC5sZW5ndGggPD0gMCBhbmQgbm90IEBzZWxlY3R2aWV3LmVkaXRNb2RlXG5cdFx0XHRAZGVsKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRyZXR1cm5cblxuXHRpc09wZW46ID0+XG5cdFx0cmV0dXJuIEBzZWxlY3R2aWV3P1xuXG5cdGZvY3VzOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdEBvcGVuKClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8ub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRnZW5lcmF0ZVN1YjogKCBpbml0aWFsQWRkICk9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRyZXR1cm4gQHNlbGVjdHZpZXdcblx0XHRcdFxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IEBtb2RlbC5TdWJWaWV3KCBzdWI6IEAsIG1vZGVsOiBAbW9kZWwsIGVsOiBAJHN1YiApXG5cdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRcblx0XHRAJGVsLmFwcGVuZCggQHNlbGVjdHZpZXcucmVuZGVyKCBpbml0aWFsQWRkICkgKVxuXHRcdGlmIEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKT9cblx0XHRcdEBzZWxlY3R2aWV3LnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGF0dGFjaFN1YkV2ZW50czogPT5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlN1YiBjbG9zZWRcIiwgQHNlbGVjdHZpZXcubW9kZWwuaWRcblx0XHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRcdFxuXHRcdFx0aWYgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0I0BzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCApXG5cdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRAc2VsZWN0dmlldy5vbiBcInJlbW92ZWRcIiwgKCBtZGwgKT0+XG5cdFx0XHRpZiBtZGxcblx0XHRcdFx0QHJlbW92ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0b3BlbjogPT5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXG5cdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRAX2lzT3BlbiA9IHRydWVcblx0XHRcblx0XHQjIEBwYXJlbnQuc3VidmlldyA9IEBcblx0XHQjIEBwYXJlbnQuc2VsZWN0dmlldyA9IEBzZWxlY3R2aWV3XG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1N1YlxuIiwiIiwiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuamFkZSA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgamFkZV9lbmNvZGVfaHRtbF9ydWxlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnXG59O1xudmFyIGphZGVfbWF0Y2hfaHRtbCA9IC9bJjw+XCJdL2c7XG5cbmZ1bmN0aW9uIGphZGVfZW5jb2RlX2NoYXIoYykge1xuICByZXR1cm4gamFkZV9lbmNvZGVfaHRtbF9ydWxlc1tjXSB8fCBjO1xufVxuXG5leHBvcnRzLmVzY2FwZSA9IGphZGVfZXNjYXBlO1xuZnVuY3Rpb24gamFkZV9lc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbCkucmVwbGFjZShqYWRlX21hdGNoX2h0bWwsIGphZGVfZW5jb2RlX2NoYXIpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbmV4cG9ydHMuRGVidWdJdGVtID0gZnVuY3Rpb24gRGVidWdJdGVtKGxpbmVubywgZmlsZW5hbWUpIHtcbiAgdGhpcy5saW5lbm8gPSBsaW5lbm87XG4gIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbn1cblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9nZXRLZXksIGlzQXJyYXksIHRvU3RyaW5nO1xuXG4gIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbiAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24oYXJyKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICBfZ2V0S2V5ID0gZnVuY3Rpb24oZWwsIGtleSkge1xuICAgIHJldHVybiBlbFtrZXldO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5cywgZm9yd2FyZCwgZ2V0S2V5KSB7XG4gICAgdmFyIGZuc29ydCwgcmVmO1xuICAgIGlmIChmb3J3YXJkID09IG51bGwpIHtcbiAgICAgIGZvcndhcmQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoZ2V0S2V5ID09IG51bGwpIHtcbiAgICAgIGdldEtleSA9IF9nZXRLZXk7XG4gICAgfVxuICAgIGlmICghaXNBcnJheShrZXlzKSkge1xuICAgICAga2V5cyA9IFtrZXlzXTtcbiAgICB9XG4gICAgZm5zb3J0ID0gZnVuY3Rpb24oZm9yd2FyZCwga2V5LCBuZXh0a2V5cykge1xuICAgICAgdmFyIF9md3JkLCBfaywgbmV4dFNvcnQsIHJlZjtcbiAgICAgIGlmIChuZXh0a2V5cyAhPSBudWxsID8gbmV4dGtleXMubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgIF9rID0gKHJlZiA9IG5leHRrZXlzLnNwbGljZSgwLCAxKSkgIT0gbnVsbCA/IHJlZlswXSA6IHZvaWQgMDtcbiAgICAgICAgaWYgKF9rICE9IG51bGwpIHtcbiAgICAgICAgICBuZXh0U29ydCA9IGZuc29ydChmb3J3YXJkLCBfaywgbmV4dGtleXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBfZndyZCA9IChmb3J3YXJkW2tleV0gIT0gbnVsbCA/IGZvcndhcmRba2V5XSA6IChmb3J3YXJkW1wiP1wiXSAhPSBudWxsID8gZm9yd2FyZFtcIj9cIl0gOiBmb3J3YXJkKSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWxBLCBlbEIpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgX2EgPSBnZXRLZXkoZWxBLCBrZXkpO1xuICAgICAgICBfYiA9IGdldEtleShlbEIsIGtleSk7XG4gICAgICAgIGlmIChfYSA8IF9iKSB7XG4gICAgICAgICAgaWYgKF9md3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfYSA+IF9iKSB7XG4gICAgICAgICAgaWYgKF9md3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfYSA9PT0gX2IpIHtcbiAgICAgICAgICBpZiAobmV4dFNvcnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRTb3J0KGVsQSwgZWxCKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIGZuc29ydChmb3J3YXJkLCAocmVmID0ga2V5cy5zcGxpY2UoMCwgMSkpICE9IG51bGwgPyByZWZbMF0gOiB2b2lkIDAsIGtleXMpO1xuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
