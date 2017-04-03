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

  IGGY.prototype.jQuery = jQuery;

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
if ( searchButton != undefined && searchButton.template != undefined && searchButton.template.length >= 0)
{
buf.push("<button" + (jade.cls(['search-btn',searchButton.cssclass,{"search-btn-pullright":searchButton.pullright}], [null,true,true])) + ">" + (null == (jade_interp = searchButton.template) ? "" : jade_interp) + "</button>");
}
buf.push("<button class=\"add-facet-btn fa fa-plus\"></button>");}.call(this,"searchButton" in locals_for_with?locals_for_with.searchButton:typeof searchButton!=="undefined"?searchButton:undefined));;return buf.join("");
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
    var ref, ref1;
    this.sub = options.sub;
    this.jQuery = ((ref = this.sub) != null ? ref.jQuery : void 0) || (options != null ? (ref1 = options.main) != null ? ref1.jQuery : void 0 : void 0);
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
    this.select(evnt);
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
      _opts = this.jQuery.extend(true, {}, this.model.get("opts"), this.forcedDateRangeOpts());
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
    this.select = bind(this.select, this);
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

  FacetSubString.prototype.select = function(evnt) {
    var _val;
    _val = this.getValue();
    this.set(_val, evnt);
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

  MainView.prototype.template = require("../tmpls/wrapper.jade");

  MainView.prototype.events = {
    "mousedown .search-btn": "_onSearch",
    "click .search-btn": "_onSearch",
    "focus .search-btn": "_onFocusSearch",
    "mousedown .add-facet-btn": "_addFacet",
    "click": "_addFacet"
  };

  function MainView(options) {
    var ref;
    if (options == null) {
      options = {};
    }
    this._outerClick = bind(this._outerClick, this);
    this._onFocusSearch = bind(this._onFocusSearch, this);
    this.__onSearch = bind(this.__onSearch, this);
    this.focusSearch = bind(this.focusSearch, this);
    this._nextFacet = bind(this._nextFacet, this);
    this.openLastFacet = bind(this.openLastFacet, this);
    this._keyListen = bind(this._keyListen, this);
    this._outerClickListen = bind(this._outerClickListen, this);
    this._onClosed = bind(this._onClosed, this);
    this._onOpened = bind(this._onOpened, this);
    this.appendFacetEl = bind(this.appendFacetEl, this);
    this.addFacet = bind(this.addFacet, this);
    this.genSub = bind(this.genSub, this);
    this.setFacet = bind(this.setFacet, this);
    this.remFacet = bind(this.remFacet, this);
    this.exit = bind(this.exit, this);
    this._addFacet = bind(this._addFacet, this);
    this.render = bind(this.render, this);
    this.templateData = bind(this.templateData, this);
    this.initialize = bind(this.initialize, this);
    this.searchButton = options != null ? options.searchButton : void 0;
    this._onSearch = _.debounce(this.__onSearch, ((ref = this.searchButton) != null ? ref.debounce : void 0) || 300, {
      trailing: false,
      leading: true
    });
    MainView.__super__.constructor.apply(this, arguments);
    return;
  }

  MainView.prototype.initialize = function(options) {
    var _cl, _fnSort, _valueFacets, fct, i, len, ref, ref1;
    this.main = options.main;
    this.jQuery = this.main.jQuery;
    this.idx = options.idx;
    this.results = options.results;
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
        _self._nextFacet(evnt, this);
      }
    });
    subview.eventsAttached = true;
    this.appendFacetEl(subview.render(initialAdd));
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
    this.appendFacetEl(this.selectview.render());
    this.selectview.focus();
  };

  MainView.prototype.appendFacetEl = function(el) {
    (this.$searchBtn || this.$addBtn).before(el);
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
        var $tgrt, ref, ref1, ref2, ref3;
        $tgrt = $(evnt.target);
        if (evnt.keyCode === KEYCODES.ENTER && $tgrt.is(".add-facet-btn")) {
          if (evnt != null) {
            evnt.preventDefault();
          }
          if (evnt != null) {
            evnt.stopPropagation();
          }
          setTimeout(function() {
            return _this.addFacet();
          }, 0);
        }
        if (evnt.keyCode === KEYCODES.TAB || (ref = evnt.keyCode, indexOf.call(KEYCODES.TAB, ref) >= 0)) {
          if ((_this.$searchBtn != null) && $tgrt.is(".add-facet-btn") && (evnt != null ? evnt.shiftKey : void 0)) {
            if (evnt != null) {
              evnt.preventDefault();
            }
            if (evnt != null) {
              evnt.stopPropagation();
            }
            _this.TMopenAddFacet = setTimeout(function() {
              return _this.focusSearch();
            }, 0);
            return;
          }
          if ((_this.$searchBtn == null) && ((ref1 = _this.selectview) != null ? ref1.isOpen : void 0)) {
            if (evnt != null ? evnt.shiftKey : void 0) {
              if (evnt != null) {
                evnt.preventDefault();
              }
              if (evnt != null) {
                evnt.stopPropagation();
              }
              _this.openLastFacet();
            } else {
              _this.selectview.close();
            }
            return;
          }
          if ((_this.$searchBtn != null) && $tgrt.is(".search-btn") && (evnt != null ? evnt.shiftKey : void 0)) {
            if (evnt != null) {
              evnt.preventDefault();
            }
            if (evnt != null) {
              evnt.stopPropagation();
            }
            _this.openLastFacet();
            return;
          }
          if ((_this.$searchBtn == null) && $tgrt.is(".add-facet-btn") && (evnt != null ? evnt.shiftKey : void 0)) {
            if (evnt != null) {
              evnt.preventDefault();
            }
            if (evnt != null) {
              evnt.stopPropagation();
            }
            _this.openLastFacet();
            return;
          }
          if ((_this.$searchBtn != null) && ((ref2 = _this.selectview) != null ? ref2.isOpen : void 0)) {
            if (evnt != null ? evnt.shiftKey : void 0) {
              if (evnt != null) {
                evnt.preventDefault();
              }
              if (evnt != null) {
                evnt.stopPropagation();
              }
              _this.focusSearch();
            } else {
              setTimeout(function() {
                var ref3;
                return (ref3 = _this.selectview) != null ? ref3.close() : void 0;
              }, 0);
            }
          }
          _this.trigger("escape", evnt, _this._nextFacet);
          return;
        }
        if (evnt.keyCode === KEYCODES.ESC || (ref3 = evnt.keyCode, indexOf.call(KEYCODES.ESC, ref3) >= 0)) {
          _this.exit();
          _this.trigger("escape", evnt);
          return;
        }
      };
    })(this));
  };

  MainView.prototype.openLastFacet = function() {
    var _prevId, ref, ref1, ref2;
    _prevId = (ref = this.$addBtn) != null ? (ref1 = ref.prevAll(".sub")) != null ? (ref2 = ref1.first()) != null ? ref2.data("fctid") : void 0 : void 0 : void 0;
    if (_prevId != null) {
      setTimeout((function(_this) {
        return function() {
          var ref3;
          return (ref3 = _this.facets[_prevId]) != null ? ref3.reopen() : void 0;
        };
      })(this), 0);
    }
  };

  MainView.prototype._nextFacet = function(evnt, subView) {
    var _next, _nextFn, _nextId, ref;
    _nextFn = (evnt != null ? evnt.shiftKey : void 0) ? "prev" : "next";
    _next = (ref = subView.$el) != null ? typeof ref[_nextFn] === "function" ? ref[_nextFn]() : void 0 : void 0;
    if (_next.hasClass("search-btn")) {
      if (_nextFn === "prev") {
        this.openLastFacet();
      } else if (this.$searchBtn != null) {
        this.focusSearch();
      }
      return;
    }
    _nextId = _next != null ? _next.data("fctid") : void 0;
    if (_nextId != null) {
      if (evnt != null) {
        evnt.preventDefault();
      }
      if (evnt != null) {
        evnt.stopPropagation();
      }
      setTimeout((function(_this) {
        return function() {
          var ref1;
          return (ref1 = _this.facets[_nextId]) != null ? ref1.reopen() : void 0;
        };
      })(this), 0);
      return;
    }
    if ((this.$searchBtn != null) && _nextFn === "next") {
      this.focusSearch();
    }
    if ((this.$searchBtn == null) && _nextFn === "next") {
      this.$addBtn.focus();
      this.addFacet();
    }
  };

  MainView.prototype.focusSearch = function() {
    if (this.$searchBtn != null) {
      this.$searchBtn.focus();
    }
  };

  MainView.prototype.__onSearch = function(evnt) {
    if ((evnt.type === "click" && evnt.clientX === 0 && evnt.clientY === 0) || evnt.type === "mousedown") {
      this.trigger("escape", evnt);
      setTimeout((function(_this) {
        return function() {
          if (evnt != null) {
            evnt.preventDefault();
          }
          evnt.stopPropagation();
          _this.exit();
          _this.trigger("searchbutton", _this.searchButton.event);
        };
      })(this), 0);
      return;
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
    this.jQuery = this.parent.jQuery;
    this.$el.data("fctid", this.model.id);
    this.parent.on("escape", (function(_this) {
      return function(evnt, cb) {
        var ref;
        if (_this._isOpen && ((ref = _this.selectview) != null ? ref._onTabAction(evnt) : void 0) && (cb != null)) {
          cb(evnt, _this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL21haW4uY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvYmFja2JvbmVfc3ViLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2Jhc2UuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9yYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0cy5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3JhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXIuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL3N1YnN0cmluZy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL3N1Yi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0Y29sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsc0hBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVDs7QUFDWCxNQUFBLEdBQVMsT0FBQSxDQUFTLGlCQUFUOztBQUNULFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFTLDBCQUFUOztBQUNm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QWlCOzs7O0FDVGpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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LENBQUE7O1NBRVcsQ0FBRSxLQUFiLENBQUE7O0lBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztFQUpOOzs7O0dBbkxlLFFBQVEsQ0FBQzs7QUE2TC9CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDN0xqQjs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldHNcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdFNlbGVjdCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc2VsZWN0XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3RSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfcmFuZ2VcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcbkZjdEV2ZW50ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9ldmVudFwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbklHR1lfSURYID0gMVxuXG5jbGFzcyBJR0dZIGV4dGVuZHMgQmFja2JvbmUuRXZlbnRzXG5cdCQ6IGpRdWVyeVxuXHRqUXVlcnk6IGpRdWVyeVxuXHRjb25zdHJ1Y3RvcjogKCBlbCwgZmFjZXRzID0gW10sIG9wdGlvbnMgPSB7fSApLT5cblx0XHRfLmV4dGVuZCBALCBCYWNrYm9uZS5FdmVudHNcblx0XHRAX2luaXRFcnJvcnMoKVxuXHRcdFxuXHRcdCMgaW5pdCBlbGVtZW50XG5cdFx0QCRlbCA9IEBfcHJlcGFyZUVsKCBlbCApXG5cdFx0QGVsID0gQCRlbFswXVxuXHRcdEAkZWwuZGF0YSggXCJpZ2d5XCIsIEAgKVxuXG5cdFx0IyBpbml0IGZhY2V0c1xuXHRcdEBmYWNldHMgPSBAX3ByZXBhcmVGYWNldHMoIGZhY2V0cywgb3B0aW9ucyApXG5cdFx0QHJlc3VsdHMgPSBuZXcgUmVzdWx0cyggbnVsbCwgb3B0aW9ucyApXG5cblx0XHRAcmVzdWx0cy5vbiBcImFkZFwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwicmVtb3ZlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJjaGFuZ2VcIiwgQHRyaWdnZXJDaGFuZ2VcblxuXHRcdEB2aWV3ID0gbmV3IE1haW5WaWV3KCBtYWluOiBALCBlbDogQCRlbCwgY29sbGVjdGlvbjogQGZhY2V0cywgcmVzdWx0czogQHJlc3VsdHMsIHNlYXJjaEJ1dHRvbjogb3B0aW9ucy5zZWFyY2hCdXR0b24sIGlkeDogSUdHWV9JRFgrKyApXG5cdFx0XG5cdFx0QHZpZXcub24gXCJzZWFyY2hidXR0b25cIiwgQHRyaWdnZXJFdmVudFxuXG5cdFx0QG5vbkVtcHR5UmVzdWx0cyA9IEByZXN1bHRzLnN1YiggQF9maWx0ZXJFbXB0eSApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cywgb3B0aW9ucz17fSApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQsIF9pZHggaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X2ZjdC5faWR4ID0gX2lkeFxuXHRcdFx0X3JldC5wdXNoIF9mY3Rcblx0XHRcblx0XHRyZXR1cm4gbmV3IEZhY2V0cyggX3JldCwgb3B0aW9ucyApXG5cblx0X2NyZWF0ZUZhY2V0OiAoIGZhY2V0ICktPlxuXHRcdHN3aXRjaCBmYWNldC50eXBlLnRvTG93ZXJDYXNlKClcblx0XHRcdHdoZW4gXCJzdHJpbmdcIiB0aGVuIHJldHVybiBuZXcgRmN0U3RyaW5nKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwic2VsZWN0XCIgdGhlbiByZXR1cm4gbmV3IEZjdFNlbGVjdCggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImFycmF5XCIgdGhlbiByZXR1cm4gbmV3IEZjdEFycmF5KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwibnVtYmVyXCIgdGhlbiByZXR1cm4gbmV3IEZjdE51bWJlciggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcInJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdFJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZGF0ZXJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdERhdGVSYW5nZSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImV2ZW50XCIgdGhlbiByZXR1cm4gbmV3IEZjdEV2ZW50KCBmYWNldCwgbWFpbjogQCApXG5cblx0YWRkRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0aWYgbm90IEBmYWNldHM/XG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRAZmFjZXRzLmFkZCggX2ZjdCApXG5cdFx0cmV0dXJuIEBcblxuXHRfZXJyb3I6ICggdHlwZSwgZGF0YSA9IHt9ICk9PlxuXHRcdGlmIEBlcnJvcnNbIHR5cGUgXT9cblx0XHRcdF9tc2cgPSBAZXJyb3JzWyB0eXBlIF0oIGRhdGEgKVxuXHRcdGVsc2Vcblx0XHRcdF9tc2cgPSBcIi1cIlxuXHRcdF9lcnIgPSBuZXcgRXJyb3IoKVxuXHRcdF9lcnIubmFtZSA9IHR5cGVcblx0XHRfZXJyLm1lc3NhZ2UgPSBfbXNnXG5cdFx0cmV0dXJuIF9lcnJcblxuXHRfZmlsdGVyRW1wdHk6ICggbW9kZWwgKT0+XG5cdFx0X3YgPSBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgbm90IF92P1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0aWYgX3YubGVuZ3RoIDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRnZXRRdWVyeTogPT5cblx0XHRyZXR1cm4gQG5vbkVtcHR5UmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEB0cmlnZ2VyKCBcImNoYW5nZVwiLCBAbm9uRW1wdHlSZXN1bHRzIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXHRcblx0dHJpZ2dlckV2ZW50OiAoIGV2ZW50TmFtZSApPT5cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHRyaWdnZXIoIGV2ZW50TmFtZSwgQG5vbkVtcHR5UmVzdWx0cyApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XHRcblx0X2luaXRFcnJvcnM6ID0+XG5cdFx0QGVycm9ycyA9IHt9XG5cdFx0Zm9yIF9rLCBfdG1wbCBvZiBARVJST1JTKClcblx0XHRcdEBlcnJvcnNbIF9rIF0gPSBfLnRlbXBsYXRlKCBfdG1wbCApXG5cdFx0cmV0dXJuXG5cblx0RVJST1JTOiAtPlxuXHRcdFwiRUlOVkFMSURFTFNUUklOR1wiOiBcIklmIHlvdSBkZWZpbmUgYSBgZWxgIGFzIFN0cmluZyBpdCBoYXMgdG8gYmUgYSB2YWxpZCBzZWxlY3RvciBmb3IgYW4gZXhpc3RpbmcgRE9NIGVsZW1lbnQuXCJcblx0XHRcIkVFTVBUWUVMU1RSSU5HXCI6IFwiVGhlIGBlbGAgYXMgc3RyaW5nIGNhbiBub3QgYmUgZW1wdHkuXCJcblx0XHRcIkVFTVBUWUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGFuIGVtcHR5IGNvbGxlY3Rpb24uXCJcblx0XHRcIkVTSVpFRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYSByZXN1bHQgb2Ygb25lIGVsLlwiXG5cdFx0XCJFSU5WQUxJREVMVFlQRVwiOiBcIlRoZSBgZWxgIGNhbiBvbmx5IGJlIGEgc2VsZWN0b3Igc3RyaW5nLCBkb20gZWxlbWVudCBvciBqUXVlcnkgY29sbGVjdGlvblwiXG5cdFx0XCJFTUlTU0lOR0VMXCI6IFwiUGxlYXNlIGRlZmluZSBhIHRhcmdldCBgZWxgXCJcblxubW9kdWxlLmV4cG9ydHMgPSBJR0dZXG4iLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKVxuXHRcblx0IyBvciBieSBPYmplY3Rcblx0c3ViQ29sbE8gPSBwYXJlbnRDb2xsLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyBvciBieSBOdW1iZXJcblx0c3ViQ29sbE4gPSBwYXJlbnRDb2xsLnN1YiggMTMgKVxuXHRcblx0IyBvciBieSBGdW5jdGlvblxuXHRzdWJDb2xsRiA9IHBhcmVudENvbGwuc3ViKCAoKCBtb2RlbCApLT4gaWYgbW9kZWwuZ2V0KCBcImFnZVwiICkgPiAyMyApIClcblx0XG5cdCMgc3ViY29sbGVjdGlvbiBvZiBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBX08gPSBzdWJDb2xsQS5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBGb3IgdGhpcyBhIGByZXNldGAgd2lsbCBiZSBmaXJlZCBvbiB0aGUgc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQSA9IHN1YkNvbGxBLnVwZGF0ZVN1YkZpbHRlciggeyBuYW1lOiBcIkJhclwiLCBhZ2U6IDQyIH0gKVxuIyMjXG5cbmNsYXNzIEJhY2tib25lU3ViIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHQjIyNcblx0IyMgc3ViXG5cdFxuXHRgY29sbGVjdGlvbi5zdWIoIGZpbHRlciApYFxuXHRcblx0R2VuZXJhdGUgYSBzdWItY29sbGVjdGlvbiBieSBhIGZpbHRlci5cblx0VGhlIG1vZGVscyB3aWxsIGJlIGRpc3RyaWJ1dGVkIHdpdGhpbiBhbGwgaW52b2x2ZWQgY29sbGVjdGlvbnMgdW5kZXIgY29uc2lkZXJhdGlvbiBvZiB0aGUgZmlsdGVyLlxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBDb2xsZWN0aW9uIH0gQSBTdWItQ29sbGVjdGlvbiBiYXNlZCBvbiB0aGUgZmlsdGVyXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0c3ViOiAoIGZpbHRlciApPT5cblx0XHRAc3ViQ29sbHMgb3I9IFtdXG5cdFx0Zm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKVxuXG5cdFx0IyBmaWx0ZXIgdGhlIGNvbGxlY3Rpb25cblx0XHRfbW9kZWxzID0gQGZpbHRlciBmbkZpbHRlclxuXHRcdCMgY3JlYXRlIHRoZSBzdWJjb2xsZWN0aW9uXG5cdFx0X3N1YiA9IG5ldyBAY29uc3RydWN0b3IoIF9tb2RlbHMsIEBfc3ViQ29sbGVjdGlvbk9wdGlvbnMoKSApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cdFxuXHQjIyNcblx0IyMgX3N1YkNvbGxlY3Rpb25PcHRpb25zXG5cdFxuXHRgY29sbGVjdGlvbi5fc3ViQ29sbGVjdGlvbk9wdGlvbnMoKWBcblx0XG5cdE92ZXJ3cml0YWJsZSBtZXRob2QgdG8gc2V0IHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGZvciBzdWIgY29sbGVjdGlvbnNcblx0XG5cdEByZXR1cm4geyBPYmplY3QgfSBUaGUgb3B0aW9ucyBvYmplY3Rcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X3N1YkNvbGxlY3Rpb25PcHRpb25zOiA9PlxuXHRcdF9vcHRzID1cblx0XHRcdGNvbXBhcmF0b3I6IEBjb21wYXJhdG9yXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICktPlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWJcbiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBhdHRycywgb3B0aW9ucyApLT5cblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRkZWZhdWx0czogLT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cdFx0c29ydDogMFxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2VcbiIsImNsYXNzIEZjdERhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdHM6IHt9XG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZVxuIiwiY2xhc3MgRmN0RXZlbnQgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogbnVsbFxuXHRvbmx5RXhlYzogdHJ1ZVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFxuXHRleGVjOiAoICk9PlxuXHRcdEBtYWluLnRyaWdnZXIoIEBnZXQoIFwiZXZlbnRcIiApLCBAdG9KU09OKCkgKVxuXHRcdHJldHVyblxubW9kdWxlLmV4cG9ydHMgPSBGY3RFdmVudFxuIiwiY2xhc3MgRmN0TnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1Ym51bWJlclwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyXG4iLCJjbGFzcyBGY3RSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0UmFuZ2VcbiIsImNsYXNzIEZjdFNlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzZWxlY3RcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCggc3VwZXIsIHtcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XHR3YWl0Rm9yQXN5bmM6IHRydWVcblx0XHR9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFNlbGVjdFxuIiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmdcbiIsInNvcnRDb2xsID0gcmVxdWlyZSggXCJzb3J0Y29sbFwiIClcblxuZm5HZXQgPSAoIGVsLCBrZXkgKS0+XG5cdHJldHVybiBlbC5nZXQoIGtleSApXG5cbmNsYXNzIElnZ3lGYWNldHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRcblx0Y29uc3RydWN0b3I6ICggbW9kZWxzLCBvcHRpb25zPXt9ICktPlxuXHRcdGlmIG5vdCBvcHRpb25zLmNvbXBhcmF0b3I/XG5cdFx0XHRfZm9yd2FyZCA9IHN3aXRjaCBvcHRpb25zLmRpclxuXHRcdFx0XHR3aGVuIFwiYXNjXCIgdGhlbiB0cnVlXG5cdFx0XHRcdHdoZW4gXCJkZXNjXCIgdGhlbiBmYWxzZVxuXHRcdFx0XHRlbHNlIHRydWVcblx0XHRcdFxuXHRcdFx0b3B0aW9ucy5jb21wYXJhdG9yID0gc29ydENvbGwoIFsgXCJzb3J0XCIgXS5jb25jYXQoIG9wdGlvbnMuc29ydGJ5IG9yIFwibmFtZVwiICksIHsgc29ydDogZmFsc2UsIFwiP1wiOiBfZm9yd2FyZCB9LCBmbkdldCApXG5cdFx0cmV0dXJuIHN1cGVyKCBtb2RlbHMsIG9wdGlvbnMgKVxuXHRcblx0X3N1YkNvbGxlY2N0aW9uT3B0aW9uczogPT5cblx0XHRvcHQgPSBzdXBlclxuXHRcdG9wdC5kaXIgPSBpZiBAZm9yd2FyZCB0aGVuIFwiYXNjXCIgZWxzZSBcImRlc2NcIlxuXHRcdHJldHVybiBvcHRcblx0XG5cdG1vZGVsSWQ6IChhdHRycyktPlxuXHRcdHJldHVybiBhdHRycy5uYW1lXG5cdFx0XG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lGYWNldHNcbiIsImNsYXNzIElnZ3lSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0ZGVmYXVsdHM6XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IG51bGxcblx0XHR2YWx1ZTogbnVsbFxuXG5jbGFzcyBJZ2d5UmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdGluaXRpYWxpemU6ICggbWRscywgb3B0cyApPT5cblx0XHRpZiBvcHRzLm1vZGlmeUtleT8ubGVuZ3RoXG5cdFx0XHRAbW9kaWZ5S2V5ID0gb3B0cy5tb2RpZnlLZXlcblx0XHRyZXR1cm5cblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfa2V5ID0gb3B0aW9ucy5fZmFjZXQuZ2V0KCBcIm1vZGlmeUtleVwiICkgb3IgQG1vZGlmeUtleSBvciBcInZhbHVlXCJcblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyWyBfa2V5IF0gPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBvcHRpb25zLl9mYWNldCwgYXR0ciApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0c1xuIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHNcbiIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGN1c3RvbSwgaWQsIHR4dCkge1xuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHR4dCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJidG4td3JwXFxcIj48aVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwicm0tcmVzdWx0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT5cIik7XG5pZiAoIGN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImVkaXQtcmVzdWx0LWJ0biBmYSBmYS1wZW5jaWxcXFwiPjwvaT5cIik7XG59XG5idWYucHVzaChcIjwvc3Bhbj5cIik7fS5jYWxsKHRoaXMsXCJjdXN0b21cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1c3RvbTp0eXBlb2YgY3VzdG9tIT09XCJ1bmRlZmluZWRcIj9jdXN0b206dW5kZWZpbmVkLFwiaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmlkOnR5cGVvZiBpZCE9PVwidW5kZWZpbmVkXCI/aWQ6dW5kZWZpbmVkLFwidHh0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50eHQ6dHlwZW9mIHR4dCE9PVwidW5kZWZpbmVkXCI/dHh0OnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwiZGF0ZXJhbmdlLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG9wZXJhdG9yLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmlmICggb3BlcmF0b3JzICYmIG9wZXJhdG9ycy5sZW5ndGgpXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcIm9wZXJhdG9yXFxcIj48c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJvcFwiLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgdmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJvcGVyYXRvclwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3I6dHlwZW9mIG9wZXJhdG9yIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcjp1bmRlZmluZWQsXCJvcGVyYXRvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yczp0eXBlb2Ygb3BlcmF0b3JzIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicmFuZ2VpbnBcXFwiPlwiKTtcbnZhciBfdmFscyA9IHZhbHVlID8gdmFsdWUgOiBbXVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl9mcm9tXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS1mcm9tXFxcIi8+PHNwYW4gY2xhc3M9XFxcInNlcGFyYXRvclxcXCI+LTwvc3Bhbj48aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl90b1wiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzFdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtdG9cXFwiLz48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbjtyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgbXVsdGlwbGUsIG9wdGlvbkdyb3Vwcywgb3B0aW9ucywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuaWYgKCBvcHRpb25Hcm91cHMpXG57XG4vLyBpdGVyYXRlIG9wdGlvbkdyb3Vwc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25Hcm91cHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBnbmFtZSA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZ25hbWUgPCAkJGw7IGduYW1lKyspIHtcbiAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBnbmFtZSBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlXG57XG4vLyBpdGVyYXRlIG9wdGlvbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9ucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+XCIpO1xuaWYgKCBtdWx0aXBsZSlcbntcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcImJ0biBidG4teHMgYnRuLXN1Y2Nlc3Mgc2VsZWN0LWNoZWNrIGZhIGZhLWNoZWNrXFxcIj48L3NwYW4+XCIpO1xufX0uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm11bHRpcGxlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5tdWx0aXBsZTp0eXBlb2YgbXVsdGlwbGUhPT1cInVuZGVmaW5lZFwiP211bHRpcGxlOnVuZGVmaW5lZCxcIm9wdGlvbkdyb3Vwc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uR3JvdXBzOnR5cGVvZiBvcHRpb25Hcm91cHMhPT1cInVuZGVmaW5lZFwiP29wdGlvbkdyb3Vwczp1bmRlZmluZWQsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIGlucHZhbCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgaW5wdmFsLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwiaW5wdmFsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pbnB2YWw6dHlwZW9mIGlucHZhbCE9PVwidW5kZWZpbmVkXCI/aW5wdmFsOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHBpbm5lZCwgc2VsZWN0ZWQsIHVuZGVmaW5lZCkge1xuaWYgKCAhcGlubmVkKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2Rpdj5cIik7XG59XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJzdWJsYWJlbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPjxzcGFuIGNsYXNzPVxcXCJ0eHRcXFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48aSBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9pPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxpIGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+PC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3QgY2xvc2VkXFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJsb2FkZXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jb2cgZmEtc3BpblxcXCI+PC9pPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInBpbm5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgucGlubmVkOnR5cGVvZiBwaW5uZWQhPT1cInVuZGVmaW5lZFwiP3Bpbm5lZDp1bmRlZmluZWQsXCJzZWxlY3RlZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VsZWN0ZWQ6dHlwZW9mIHNlbGVjdGVkIT09XCJ1bmRlZmluZWRcIj9zZWxlY3RlZDp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoc2VhcmNoQnV0dG9uKSB7XG5pZiAoIHNlYXJjaEJ1dHRvbiAhPSB1bmRlZmluZWQgJiYgc2VhcmNoQnV0dG9uLnRlbXBsYXRlICE9IHVuZGVmaW5lZCAmJiBzZWFyY2hCdXR0b24udGVtcGxhdGUubGVuZ3RoID49IDApXG57XG5idWYucHVzaChcIjxidXR0b25cIiArIChqYWRlLmNscyhbJ3NlYXJjaC1idG4nLHNlYXJjaEJ1dHRvbi5jc3NjbGFzcyx7XCJzZWFyY2gtYnRuLXB1bGxyaWdodFwiOnNlYXJjaEJ1dHRvbi5wdWxscmlnaHR9XSwgW251bGwsdHJ1ZSx0cnVlXSkpICsgXCI+XCIgKyAobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBzZWFyY2hCdXR0b24udGVtcGxhdGUpID8gXCJcIiA6IGphZGVfaW50ZXJwKSArIFwiPC9idXR0b24+XCIpO1xufVxuYnVmLnB1c2goXCI8YnV0dG9uIGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGZhIGZhLXBsdXNcXFwiPjwvYnV0dG9uPlwiKTt9LmNhbGwodGhpcyxcInNlYXJjaEJ1dHRvblwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VhcmNoQnV0dG9uOnR5cGVvZiBzZWFyY2hCdXR0b24hPT1cInVuZGVmaW5lZFwiP3NlYXJjaEJ1dHRvbjp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9XG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTNcblx0XCJUQUJcIjogOVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHJlc3VsdFRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGVcIiApXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzdWIgPSBvcHRpb25zLnN1YlxuXHRcdEBqUXVlcnkgPSBAc3ViPy5qUXVlcnkgb3Igb3B0aW9ucz8ubWFpbj8ualF1ZXJ5XG5cdFx0QHJlc3VsdCA9IG5ldyBTdWJSZXN1bHRzKClcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblxuXHRmb2N1czogPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAZm9jdXNlZCA9IHRydWVcblx0XHRAJGlucC5mb2N1cygpXG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIlwiXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGJsID0gbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0aWYgX2xibD8gYW5kIF9sYmwgaXNudCBcIlwiXG5cdFx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdGlmIF9saXN0Lmxlbmd0aFxuXHRcdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFx0cmV0dXJuIFwiXCJcblx0XHRcblx0XHRcblx0b3BlbjogPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcIm9wZW5cIiApXG5cdFx0QGlzT3BlbiA9IHRydWVcblx0XHRAdHJpZ2dlciggXCJvcGVuZWRcIiApXG5cdFx0cmV0dXJuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcblx0X29uS2V5OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC5rZXlDb2RlIGlzIEtFWUNPREVTLlRBQiBvciBldm50LmtleUNvZGUgaW4gS0VZQ09ERVMuVEFCXG5cdFx0XHRAX29uVGFiQWN0aW9uKCBldm50IClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcdFxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0ID1cblx0XHRcdGNpZDogQGNpZFxuXHRcdFx0I3RhYl9pbmRleDogKCAoIEBtb2RlbD8uX2lkeCAqIDEwICkgb3IgMSApICsgKCAoIEBzdWI/LnBhcmVudD8uaWR4IG9yIDEgKSAqIDEwMDAgKVxuXHRcdFx0dmFsdWU6IEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKVxuXHRcdHJldHVybiByZXRcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfVwiXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEByZW5kZXIoKVxuXHRcdHBWaWV3Py5vcGVuKClcblx0XHRyZXR1cm5cblx0XG5cdHJlbmRlcjogKCBpbml0aWFsQWRkICk9PlxuXHRcdF90bXBsID0gQHRlbXBsYXRlKCAgQGdldFRlbXBsYXRlRGF0YSgpIClcblx0XHRAJGVsLmh0bWwoIF90bXBsIClcblx0XHRpZiBub3QgaW5pdGlhbEFkZFxuXHRcdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QCRpbnAgPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoKSApXG5cdFx0IyQoIGRvY3VtZW50ICkub24gQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBfaGFzVGFiTGlzdGVuZXIoIHRydWUgKVxuXHRcdHJldHVyblxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleWRvd25cIlxuXHRcdFxuXHRfaGFzVGFiTGlzdGVuZXI6IC0+XG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdEBzZWxlY3QoIGV2bnQgKVxuXHRcdHJldHVybiB0cnVlXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRAZm9jdXNlZCA9IGZhbHNlXG5cdFx0IyQoIGRvY3VtZW50ICkub2ZmIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCBmYWxzZSApXG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEBpc09wZW4gPSBmYWxzZVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCBAcmVzdWx0LCBldm50IClcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcblx0aXNSZXN1bHRFbXB0eTogKCByZXMgKT0+XG5cdFx0aWYgcmVzPy52YWx1ZT9cblx0XHRcdHJldHVybiBAaXNSZXN1bHRFbXB0eSggcmVzLnZhbHVlIClcblx0XHRcblx0XHRpZiBub3QgcmVzP1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRpZiByZXMgaXMgXCJcIlxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRpZiBfLmlzQXJyYXkoIHJlcyApIGFuZCByZXMubGVuZ3RoIDw9IDBcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRnZXRSZXNWYWx1ZTogPT5cblx0XHRyZXMgPSBAcmVzdWx0Py5maXJzdCgpPy50b0pTT04oKVxuXHRcdFxuXHRcdHJldHVybiByZXM/LnZhbHVlIG9yIFwiXCJcblx0XHRcblx0aXNFcXVhbEN1cnJlbnQ6ICggdmFsID0gQGdldFZhbHVlKCkgKT0+XG5cdFx0cnYgPSBAZ2V0UmVzVmFsdWUoKVxuXHRcdGlmIHJ2IGlzIHZhbFxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0cmV0dXJuIEAkaW5wLnZhbCgpXG5cblx0Z2V0U2VsZWN0TW9kZWw6IC0+XG5cdFx0cmV0dXJuIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cblx0X2NoZWNrU2VsZWN0RW1wdHk6ICggX3ZhbCwgZXZudCApPT5cblx0XHQjZGVidWdnZXJcblx0XHQjIGlmIEBpc0VxdWFsQ3VycmVudCggX3ZhbCApXG5cdFx0IyBcdEBjbG9zZSgpXG5cdFx0IyBcdHJldHVybiB0cnVlXG5cdFx0XHRcblx0XHRpZiBfLmlzRW1wdHkoIF92YWwgKSBhbmQgbm90IF8uaXNOdW1iZXIoIF92YWwgKSBhbmQgbm90IF8uaXNCb29sZWFuKCBfdmFsICkjIGFuZCBub3QgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRAY2xvc2UoIGV2bnQgKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHQjcmV0dXJuIGlmIEBfY2hlY2tTZWxlY3RFbXB0eSggX3ZhbCwgZXZudCApXG5cdFx0QHNldCggX3ZhbCwgZXZudCApXG5cdFx0cmV0dXJuXG5cblx0c2V0OiAoIHZhbCwgZXZudCApPT5cblx0XHRfbW9kZWwgPSBAcmVzdWx0LmZpcnN0KClcblx0XHRpZiBub3QgX21vZGVsP1xuXHRcdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogdmFsIClcblx0XHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdGVsc2Vcblx0XHRcdF9tb2RlbC5zZXQoIHZhbHVlOiB2YWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCwgZXZudCApXG5cdFx0QGNsb3NlKCBldm50IClcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0Jhc2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzRGF0ZVJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2RhdGVyYW5nZS5qYWRlXCIgKVxuXG5cdGZvcmNlZERhdGVSYW5nZU9wdHM6ID0+XG5cdFx0X29wdHMgPVxuXHRcdFx0b3BlbnM6IFwicmlnaHRcIlxuXHRcdFx0XG5cdFx0aWYgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKVxuXHRcdFx0X29wdHMubG9jYWxlID1cblx0XHRcdFx0Zm9ybWF0OiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0XG5cdFx0aWYgQG1vZGVsLmdldChcInZhbHVlXCIpP1swXT9cblx0XHRcdEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKT9bMV0/XG5cdFx0XHRpZiBfLmlzTnVtYmVyKCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMF0gKVxuXHRcdFx0XHRfc2QgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVswXSApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9zZCA9IG1vbWVudCggQG1vZGVsLmdldChcInZhbHVlXCIpWzBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdGlmIF9zZC5pc1ZhbGlkKClcblx0XHRcdFx0X29wdHMuc3RhcnREYXRlID0gX3NkLl9kXG5cblx0XHRpZiBAbW9kZWwuZ2V0KFwidmFsdWVcIik/WzFdP1xuXHRcdFx0aWYgXy5pc051bWJlciggQG1vZGVsLmdldChcInZhbHVlXCIpWzFdIClcblx0XHRcdFx0X2VkID0gbW9tZW50KCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMV0gKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfZWQgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVsxXSwgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKSApXG5cdFx0XHRpZiBfZWQuaXNWYWxpZCgpXG5cdFx0XHRcdF9vcHRzLmVuZERhdGUgPSBfZWQuX2Rcblx0XHRyZXR1cm4gX29wdHNcblxuXHRldmVudHM6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHRpZiBub3QgQGRhdGVyYW5nZXBpY2tlcj9cblx0XHRcdF9vcHRzID0gQGpRdWVyeS5leHRlbmQoIHRydWUsIHt9LCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCBAZm9yY2VkRGF0ZVJhbmdlT3B0cygpIClcblx0XHRcdEAkaW5wLmRhdGVyYW5nZXBpY2tlciggX29wdHMsIEBfZGF0ZVJldHVybiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyID0gQCRpbnAuZGF0YSggXCJkYXRlcmFuZ2VwaWNrZXJcIiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lcj8uYWRkQ2xhc3MoIFwiZGF0ZXJhbmdlLWlnZ3lcIiApXG5cdFx0XHRcblx0XHRcdCMgcHJldmVudCBmcm9tIGhhbmRsaWNoIHRoZSBvdXRlcmNsaWNrIGV4aXQgZnJvbSBNYWluVmlld1xuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5jb250YWluZXIub24gXCJjbGlja1wiLCAoIGV2bnQgKS0+XG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5lbGVtZW50ID0gQCRpbnBcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0XHRcblx0XHRAJGlucC5vbiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub24oIFwiaGlkZS5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0Y2xvc2U6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5vZmYoIFwiY2FuY2VsLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdEAkaW5wLm9mZiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVyblxuXG5cdHJlbW92ZTogPT5cblx0XHRAZGF0ZXJhbmdlcGlja2VyPy5yZW1vdmUoKVxuXHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBudWxsXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0XG5cdFx0aWYgXy5pc051bWJlciggX3Jlcy52YWx1ZVsgMCBdIClcblx0XHRcdF9zdGFydERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDAgXSApXG5cdFx0ZWxzZVxuXHRcdFx0X3N0YXJ0RGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMCBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdFxuXHRcdGlmIF9yZXMudmFsdWVbIDEgXT9cblx0XHRcdGlmIF8uaXNOdW1iZXIoIF9yZXMudmFsdWVbIDEgXSApXG5cdFx0XHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfZW5kRGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMSBdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblxuXHRcdF90aW1lID0gQG1vZGVsLmdldCggXCJvcHRzXCIgKS50aW1lUGlja2VyXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0aWYgQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKT9cblx0XHRcdF9mcm10ID0gQG1vZGVsLmdldCggXCJkYXRlZm9ybWF0XCIgKVxuXHRcdGVsc2UgaWYgX3RpbWVcblx0XHRcdF9mcm10ID0gXCJMTExMXCJcblx0XHRlbHNlXG5cdFx0XHRfZnJtdCA9IFwiTExcIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCBfZnJtdCApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggX2ZybXQgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9kYXRlUmV0dXJuOiAoIEBzdGFydERhdGUsIEBlbmREYXRlICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwidmFsdWVcIiwgQGdldFZhbHVlKCBmYWxzZSApIClcblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ICggcHJlZGVmID0gdHJ1ZSApPT5cblx0XHRpZiBwcmVkZWZcblx0XHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFx0aWYgX3ByZWRlZlZhbD9cblx0XHRcdFx0aWYgbm90IF8uaXNBcnJheSggX3ByZWRlZlZhbCApXG5cdFx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0XHRbIEBzdGFydERhdGUsIEBlbmREYXRlIF0gPSBfcHJlZGVmVmFsXG5cdFx0XHRcdHJldHVybiBfcHJlZGVmVmFsXG5cdFx0X291dCA9IFsgQHN0YXJ0RGF0ZS52YWx1ZU9mKCkgXVxuXHRcdF9vdXQucHVzaCBAZW5kRGF0ZS52YWx1ZU9mKCkgaWYgQGVuZERhdGU/XG5cdFx0cmV0dXJuIF9vdXRcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzRGF0ZVJhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbm5lYXJlc3QgPSAobiwgdiktPlxuXHRuID0gbiAvIHZcblx0biA9IE1hdGgucm91bmQobikgKiB2XG5cdHJldHVybiBuXG5cdFxucHJlY2lzaW9uID0gKG4sIGRwKS0+XG5cdGRwID0gTWF0aC5wb3coMTAsIGRwKVxuXHRuID0gbiAqIGRwXG5cdG4gPSBNYXRoLnJvdW5kKG4pXG5cdG4gPSBuIC8gZHBcblx0cmV0dXJuIG5cblxuY2xhc3MgRmFjZXROdW1iZXJCYXNlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHNldE51bWJlciA9IF8udGhyb3R0bGUoIEBfc2V0TnVtYmVyLCAzMDAsIHtsZWFkaW5nOiBmYWxzZSwgdHJhaWxpbmc6IGZhbHNlfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblxuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRfJGVsID0gJCggZXZudC5jdXJyZW50VGFyZ2V0IClcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92LCBfJGVsIClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSwgZWwgPSBAJGlucCApPT5cblx0XHRfdiA9IGVsLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdF92ID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRlbHNlXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdFx0QF9zZXROdW1iZXIoIF92ICsgY2hhbmdlLCBlbCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0XG5cdFx0X2l2ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cdFx0aWYgaXNOYU4oIF9pdiApXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0XG5cdFx0cmV0dXJuIEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YgKVxuXG5cdF9zZXROdW1iZXI6ICggX3YsIGVsID0gQCRpbnAgKT0+XG5cdFx0aWYgaXNOYU4oIF92IClcblx0XHRcdCNAJGlucC52YWwoXCJcIilcblx0XHRcdHJldHVyblxuXG5cdFx0X2N1cnIgPSBlbC52YWwoKVxuXG5cdFx0X3YgPSBAdmFsdWVCeURlZmluaXRpb24oIF92KVxuXHRcdGlmIF9jdXJyICE9IF92LnRvU3RyaW5nKClcblx0XHRcdGVsLnZhbCggX3YgKVxuXHRcdHJldHVyblxuXG5cdHZhbHVlQnlEZWZpbml0aW9uOiAoIF92YWx1ZSApLT5cblx0XHRtYXggPSBAbW9kZWwuZ2V0KCBcIm1heFwiIClcblx0XHRtaW4gPSBAbW9kZWwuZ2V0KCBcIm1pblwiIClcblx0XHRzdGVwID0gQG1vZGVsLmdldCggXCJzdGVwXCIgKVxuXHRcdFxuXHRcdCMgZml4IHJldmVyc2VkIG1pbi9tYXggc2V0dGluZ1xuXHRcdGlmIG1pbiA+IG1heFxuXHRcdFx0X3RtcCA9IG1pblxuXHRcdFx0bWluID0gbWF4XG5cdFx0XHRtYXggPSBfdG1wXG5cdFx0XG5cdFx0IyBvbiBleHhlZGRpbmcgdGhlIGxpbWl0cyB1c2UgdGhlIGxpbWl0XG5cdFx0aWYgbWluPyBhbmQgX3ZhbHVlIDwgbWluXG5cdFx0XHRyZXR1cm4gbWluXG5cdFx0aWYgbWF4PyBhbmQgX3ZhbHVlID4gbWF4XG5cdFx0XHRyZXR1cm4gbWF4XG5cblx0XHQjIHNlYXJjaCB0aGUgbmVhcmVzdCBfdmFsdWUgdG8gdGhlIHN0ZXBcblx0XHRpZiBzdGVwIGlzbnQgMVxuXHRcdFx0X3ZhbHVlID0gbmVhcmVzdCggX3ZhbHVlLCBzdGVwIClcblx0XHRcblx0XHQjIGNhbGMgdGhlIHByZWNpc2lvbiBieSBzdGVwXG5cdFx0X3ByZWNpc2lvbiA9IE1hdGgubWF4KCAwLCBNYXRoLmNlaWwoIE1hdGgubG9nKCAxL3N0ZXAgKSAvIE1hdGgubG9nKCAxMCApICkgKVxuXHRcdGlmIF9wcmVjaXNpb24gPiAwXG5cdFx0XHRfdmFsdWUgPSBwcmVjaXNpb24oIF92YWx1ZSwgX3ByZWNpc2lvbiApXG5cdFx0ZWxzZVxuXHRcdFx0X3ZhbHVlID0gTWF0aC5yb3VuZCggX3ZhbHVlIClcblx0XHRcdFxuXHRcdHJldHVybiBfdmFsdWVcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0TnVtYmVyQmFzZVxuIiwiU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFN0cmluZ09wdGlvbiBleHRlbmRzIFN1YlJlc3VsdHMucHJvdG90eXBlLm1vZGVsXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgU3RyaW5nT3B0aW9ucyBleHRlbmRzIFN1YlJlc3VsdHNcblx0bW9kZWw6IFN0cmluZ09wdGlvblxuXG5cbmNsYXNzIEFycmF5T3B0aW9uIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggXCJuYW1lXCIgKSBvciBcIi1cIlxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJ2YWx1ZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuY2xhc3MgQXJyYXlPcHRpb25zIGV4dGVuZHMgcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQXJyYXlPcHRpb25cblxuY2xhc3MgRmFjZXRTdWJBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi4vc2VsZWN0b3JcIiApXG5cdFxuXHR0ZW1wbGF0ZVJlc0xpOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL2FycmF5X3Jlc3VsdGxpLmphZGVcIiApXG5cdFxuXHRvcHREZWZhdWx0OlxuXHRcdGxhYmVsOiBcIi1cIlxuXHRcdHZhbHVlOiBcIi1cIlxuXG5cdHNlbGVjdENvdW50OiAwXG5cblx0b3B0Q29sbDogU3RyaW5nT3B0aW9uc1xuXHRcblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApP1xuXHRcdFx0QHNlbGVjdENvdW50ID0gb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApXG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKT9cblx0XHRcdG9wdGlvbnMuY3VzdG9tID0gQm9vbGVhbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSApXG5cdFx0XHRcblx0XHRAY29sbGVjdGlvbiA9IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdFxuXHRcdGlmIG5vdCBvcHRpb25zLmN1c3RvbSBhbmQgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdEBzZWxlY3RDb3VudCA9IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0XG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdFxuXHRcdEByZXN1bHQub24gXCJyZW1vdmVcIiwgKCBtZGwsIGNvbGwgKT0+XG5cdFx0XHRpZiBjb2xsLmxlbmd0aFxuXHRcdFx0XHRvcHRpb25zLnN1Yi5yZW5kZXJSZXN1bHQoKVxuXHRcdFx0QHNlYXJjaGNvbGwuYWRkKCBtZGwgKVxuXHRcdFx0QHRyaWdnZXIoIFwicmVtb3ZlZFwiLCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRpbml0aWFsaXplOiA9PlxuXHRcdEBlZGl0TW9kZSA9IGZhbHNlXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciBpbnB1dCMje0BjaWR9XCIgXSA9IFwiY2xvc2VcIlxuXHRcdHJldHVybiBfZXZudHNcblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0IyBjaGVjayBpZiB0aGUgY2xvc2UgaXMgaW5pdGllZCBmcm9tIHRoZSBlZGl0IG1vZGVcblx0XHRfZGVsU3ViID0gZmFsc2Vcblx0XHRpZiBAZWRpdE1vZGVcblx0XHRcdF9kZWxTdWIgPSB0cnVlXG5cdFx0XHRcblx0XHRAZWRpdE1vZGUgPSBmYWxzZVxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QGZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0cmV0dXJuIHN1cGVyXG5cdFx0XG5cdFx0aWYgX2RlbFN1YiBhbmQgQHJlc3VsdC5sZW5ndGggPD0gMFxuXHRcdFx0QHN1Yi5kZWwoKVxuXHRcdHJldHVybiBzdXBlclxuXHRcblx0cm1SZXM6ICggZXZudCApPT5cblx0XHRpZiBldm50Py50YXJnZXQ/XG5cdFx0XHRfaWQgPSAkKCBldm50LnRhcmdldCApPy5kYXRhKCBcImlkXCIgKVxuXHRcdGVsc2UgaWYgZXZudD9cblx0XHRcdF9pZCA9IGV2bnRcblx0XHRfbWRsID0gQHJlc3VsdC5nZXQoIF9pZCApXG5cdFx0aWYgX21kbD9cblx0XHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdFx0aWYgX21kbD8uZ2V0KCBcImN1c3RvbVwiIClcblx0XHRcdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBfaWQgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRlZGl0UmVzOiAoIGV2bnQgKT0+XG5cdFx0QGVkaXRNb2RlID0gdHJ1ZVxuXHRcdF9pZCA9ICQoIGV2bnQudGFyZ2V0ICk/LmRhdGEoIFwiaWRcIiApXG5cdFx0X3YgPSBAX2VkaXR2YWwgPSBAcmVzdWx0LmdldCggX2lkICkuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFxuXHRcdEByZXN1bHQucmVtb3ZlKCBfaWQgKVxuXHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggX2lkIClcblx0XHRAc3ViLnJlb3BlbigpXG5cdFx0XG5cdFx0QHNlYXJjaChfdilcblx0XHRyZXR1cm5cblx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IHN1cGVyXG5cdFx0aWYgQF9lZGl0dmFsPy5sZW5ndGhcblx0XHRcdF9kYXRhLmlucHZhbCA9IEBfZWRpdHZhbFxuXHRcdFx0QF9lZGl0dmFsID0gbnVsbFxuXHRcdHJldHVybiBfZGF0YVxuXHRcblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIEB0ZW1wbGF0ZVJlc0xpKCB0eHQ6IG1vZGVsLmdldExhYmVsKCksIGlkOiBtb2RlbC5pZCwgY3VzdG9tOiBtb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSAgKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XHRcblx0c2VsZWN0OiA9PlxuXHRcdGlmIEBsb2FkaW5nXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF92YWxzID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRpZiBfdmFscz8gYW5kIG5vdCBfLmlzQXJyYXkoIF92YWxzIClcblx0XHRcdF92YWxzID0gWyBfdmFscyBdXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0Zm9yIF92YWwgaW4gKCBpZiBAc2VsZWN0Q291bnQgPD0gMCB0aGVuIF92YWxzIGVsc2UgX3ZhbHNbLi4uQHNlbGVjdENvdW50XSApXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0XG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHQjIGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0IyBcdF9pZCA9IEByZXN1bHQubGFzdCgpPy5pZFxuXHRcdFx0IyBcdEBybVJlcyggX2lkIClcblx0XHRcdHN1cGVyXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRzZWFyY2hDb250ZW50ID0gQCRpbnAudmFsKClcblx0XHRpZiBzZWFyY2hDb250ZW50Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RBY3RpdmUoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdEBsb2FkaW5nID0gdHJ1ZVxuXHRcdFx0X2NvbGwgPSBuZXcgQG9wdENvbGwoIFtdIClcblx0XHRcdFxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QCRlbC5wYXJlbnQoKS5hZGRDbGFzcyggXCJsb2FkaW5nXCIgKVxuXHRcdFx0XHRvcHRpb25zIEByZXN1bHQsIEBtb2RlbCwgKCBhT3B0cyApPT5cblx0XHRcdFx0XHRmb3IgX29wdCwgaWR4IGluIGFPcHRzXG5cdFx0XHRcdFx0XHRhT3B0c1tpZHhdID0gXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgX29wdCwgeyBjdXN0b206IGZhbHNlIH0gKVxuXHRcdFx0XHRcdF9jb2xsLmFkZCggYU9wdHMgKVxuXHRcdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0XHRAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzKCBcImxvYWRpbmdcIiApXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XG5cdFx0XHQsIDAgKVxuXHRcdFx0cmV0dXJuIF9jb2xsXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3Qob3B0KVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIG5ldyBAb3B0Q29sbCggX29wdHMgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheVxuIiwiY2xhc3MgRmFjZXRTdWJzTnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkZWxPcCA9IEAkZWwuZmluZCggXCIub3BlcmF0b3JcIiApXG5cdFx0XHRAZWxPcCA9IEAkZWxPcC5nZXQoMClcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEBzZWxlY3QyT3AgPSBAJGlucE9wLnNlbGVjdDIoIHsgd2lkdGg6IFwiYXV0b1wiIH0gKS5kYXRhKCBcInNlbGVjdDJcIiApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiXCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdFxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdFx0QCRpbnBPcC5yZW1vdmUoKVxuXHRcdFx0QCRpbnBPcCA9IG51bGxcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfcG9zT3BXcnAgPSAtMVxuXHRcdGlmIGV2bnQ/LnJlbGF0ZWRUYXJnZXRcblx0XHRcdF9wb3NPcFdycCA9IEBlbE9wPy5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudD8ucmVsYXRlZFRhcmdldCApXG5cdFx0XHRpZiBfcG9zT3BXcnAgaXMgMjBcblx0XHRcdFx0cmV0dXJuXG5cdFx0aWYgZXZudD8udHlwZSBpcyBcImZvY3Vzb3V0XCIgYW5kIF9wb3NPcFdycCBpc250IDIwXG5cdFx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRcdGlmIF92YWw/XG5cdFx0XHRcdEBzZXQoIF92YWwsIGV2bnQgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBldm50Py5yZWxhdGVkVGFyZ2V0P1xuXHRcdFx0X3Bvc1dycCA9IEBlbC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudD8ucmVsYXRlZFRhcmdldCApXG5cdFx0XHRpZiBub3QgKCBfcG9zV3JwIGlzIDAgb3IgX3Bvc1dycCAtIDE2ID49IDAgKVxuXHRcdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdHJldHVyblxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBPcD8uZ2V0KDApIClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAbW9kZWwuc2V0KCB7IG9wZXJhdG9yOiBAJGlucE9wLnZhbCgpIH0gKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXG5cdF9vcFNlbGVjdGVkOiA9PlxuXHRcdEBzZWxlY3RlZE9QID0gdHJ1ZVxuXHRcdEBmb2N1cygpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0aWYgQCRpbnBPcD8gYW5kIG5vdCBAc2VsZWN0ZWRPUFxuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0XHRyZXR1cm5cblx0XHRzdXBlclxuXHRcdEAkaW5wLnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQuZmlyc3QoKT8uZ2V0KCBcInZhbHVlXCIgKVxuXHRcdF9vbGRPcCA9IEByZXN1bHQuZmlyc3QoKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFsIClcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpLmh0bWwoIEByZW5kZXJSZXN1bHQoIHRydWUgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgeyBvcGVyYXRvcnM6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKSwgb3BlcmF0b3I6IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JcIiApfSApXG5cblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cblx0XHRpZiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0aWYgQCRpbnAuaXMoIGV2bnQudGFyZ2V0ICkgYW5kIGV2bnQuc2hpZnRLZXlcblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0QCRpbnBPcC5mb2N1cygpXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XG5cdFx0XHRpZiAoIEBzZWxlY3QyT3AuJHNlbGVjdGlvbi5pcyggZXZudC50YXJnZXQgKSBvciBldm50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoIFwic2VsZWN0Mi1zZWFyY2hfX2ZpZWxkXCIgKSApIGFuZCBub3QgZXZudC5zaGlmdEtleVxuXHRcdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRAJGlucC5mb2N1cygpLnNlbGVjdCgpXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRcdFxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCggZXZudCApXG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD8gb3IgQG1vZGVsLmdldCggXCJvcGVyYXRvclwiICk/XG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0XHRcdG9wZXJhdG9yOiBAJGlucE9wPy52YWwoKSBvciBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRyZXR1cm4gX3JldFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNOdW1iZXJcbiIsImNsYXNzIEZhY2V0U3Vic1JhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yYW5nZS5qYWRlXCIgKVxuXG5cdF9nZXRJbnBTZWxlY3RvcjogKCBleHQgPSBcIl9mcm9tXCIgKT0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfSN7ZXh0fVwiXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwic2VsZWN0XCJcblx0XHRcIm1vdXNlZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJjbGlja1NlbFwiXG5cdFx0XCJtb3VzZWRvd24gI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiY2xpY2tTZWxcIlxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCJcIlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0cmV0dXJuIFwiPGxpPlwiICtfcmVzLnZhbHVlLmpvaW4oIFwiIC0gXCIgKSArIFwiPC9saT5cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wVG8gPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5zZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcblx0Y2xpY2tTZWw6ICggZXZudCApPT5cblx0XHRldm50LmN1cnJlbnRUYXJnZXQuZm9jdXMoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQuZmlyc3QoKS5nZXQoIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRpZiBldm50PyBhbmQgKCBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wLmdldCgwKSBvciBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wVG8uZ2V0KDApIClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XG5cdFx0I2lmIEAkaW5wLmlzKCBldm50LnRhcmdldCApIGFuZCBub3QgZXZudC5zaGlmdEtleVxuXHRcdFx0XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGNsb3NlOiA9PlxuXHRcdHRyeVxuXHRcdFx0QCQoIFwiLnJhbmdlaW5wXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHRfcmV0ID1cblx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdkZyb20gPSBzdXBlclxuXHRcdF92ID0gQCRpbnBUby52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdF92VG8gPSBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRcdHJldHVybiBbIF92RnJvbSwgX3ZUbyBdXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRcblx0XHRpZiBAJGlucC5pcyggZXZudC50YXJnZXQgKSBhbmQgbm90IGV2bnQuc2hpZnRLZXlcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0QCRpbnBUby5mb2N1cygpLnNlbGVjdCgpXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0XHRpZiBAJGlucFRvLmlzKCBldm50LnRhcmdldCApIGFuZCBldm50LnNoaWZ0S2V5XG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdEAkaW5wLmZvY3VzKCkuc2VsZWN0KClcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0aWYgX3ZhbD8ubGVuZ3RoID49IDJcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XG5cdFx0IyByZXR1cm4gZmFsc2UgdG8gcHJldmVudCBqdW1wIHRvIG5leHQgZmFjZXRcblx0XHRyZXR1cm4gdHJ1ZVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNSYW5nZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc2VsZWN0LmphZGVcIiApXG5cblx0Zm9yY2VkTW9kdWxlT3B0czp7fVxuXHQjXHRtdWx0aXBsZTogdHJ1ZVxuXG5cdGRlZmF1bHRNb2R1bGVPcHRzOlxuXHRcdCNtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxXG5cdFx0d2lkdGg6IFwiYXV0b1wiXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cdFxuXHRpbml0aWFsaXplOiAtPlxuXHRcdEBjb252ZXJ0VmFsdWVUb0ludCA9IEBfY2hlY2tJbnRWYWx1ZSggQG1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSB7fVxuXHRcdF9ldm50c1sgXCJjbGljayAuc2VsZWN0LWNoZWNrXCIgXSA9IFwic2VsZWN0XCIgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcInNlbGVjdCMje0BjaWR9XCJcblx0XHRcblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRAX2luaXRTZWxlY3QyKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdCMgcHJldmVudCBmcm9tIGFzeW5jIGxpc3RlbmluZyBvbiBtYW51YWwgYWNjZXNzXG5cdFx0QG1vZGVsLnNldCggXCJ3YWl0Rm9yQXN5bmNcIiwgZmFsc2UgKVxuXHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdEBzZWxlY3QyLiRjb250YWluZXIuc2hvdygpXG5cdFx0QHNlbGVjdDIub3BlbigpXG5cdFx0I2Vsc2Vcblx0XHRcdCNAJGlucC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdGlmIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gKCBAcmVzdWx0IG9yIFtdKS5sZW5ndGggPj0gQHNlbGVjdENvdW50XG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0IyBzZXQgdGhlIGN1cnJlbnQgdmFsdWVzXG5cdFx0X29sZFZhbHMgPSBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFscyApXG5cdFx0XG5cdFx0IyByZXNldCByZXN1bHRzIGFuZCBzZWxlY3QyXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKVxuXHRcdEBzZWxlY3QyLiRjb250YWluZXIub2ZmKClcblx0XHRAc2VsZWN0Mi5kZXN0cm95KClcblx0XHRAcmVzdWx0LnJlc2V0KClcblx0XHRAc2VsZWN0MiA9IG51bGxcblx0XHRcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0X2NoZWNrSW50VmFsdWU6ICggX29wdHMgPSBbXSApPT5cblx0XHRpZiBub3QgX29wdHMgb3Igbm90IF9vcHRzLmxlbmd0aFxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0Zm9yIF92IGluIF9vcHRzXG5cdFx0XHRpZiBfdi52YWx1ZT8gYW5kIF8uaXNTdHJpbmcoIF92LnZhbHVlIClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBfdi5pZD8gYW5kIF8uaXNTdHJpbmcoIF92LmlkIClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBfdj8gYW5kIF8uaXNTdHJpbmcoIF92IClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblx0XHRyZXR1cm4gdHJ1ZVxuXG5cdF9pbml0U2VsZWN0MjogPT5cblx0XHRcblx0XHRpZiBub3QgQHNlbGVjdDI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQGRlZmF1bHRNb2R1bGVPcHRzLCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSBvciBmYWxzZSB9LCBAZm9yY2VkTW9kdWxlT3B0cyApXG5cdFx0XHRAJGlucC5zZWxlY3QyKCBfb3B0cyApXG5cdFx0XHRAc2VsZWN0MiA9IEAkaW5wLmRhdGEoIFwic2VsZWN0MlwiIClcblx0XHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdFx0XHRAJGlucC5vbiBcInNlbGVjdDI6c2VsZWN0IHNlbGVjdDI6Y2xvc2VcIiwgQHNlbGVjdFxuXHRcdFx0XG5cdFx0XHRpZiBub3QgQHNlbGVjdDIuX2V2ZW50c0FkZGVkXG5cdFx0XHRcdEBzZWxlY3QyLl9ldmVudHNBZGRlZCA9IHRydWVcblx0XHRcdFx0IyBhZnRlciBsb2FkaW5nIHRyeSB0byBzZXQgdGhlIGN1cnNvciBmb2N1c1xuXHRcdFx0XHRAc2VsZWN0Mi5vbiBcInJlc3VsdHM6YWxsXCIsICggcmVzdWx0cyApPT5cblx0XHRcdFx0XHRAY29udmVydFZhbHVlVG9JbnQgPSBAX2NoZWNrSW50VmFsdWUoIHJlc3VsdHM/LmRhdGE/LnJlc3VsdHMgKVxuXHRcdFx0XHRcdEBzZWxlY3QyLnNlbGVjdGlvbj8uJHNlYXJjaD8uZm9jdXM/KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XG5cdFx0XHRcdCMgbGlzdGVuIHRvIGFzeW5jIHJlc3VsdCBjaGFuZ2VzIGFuZCBzZXQgdGhlIHNlbGVjdGlvblxuXHRcdFx0XHRAc2VsZWN0Mi5kYXRhQWRhcHRlci5jdXJyZW50ICggcmVzdWx0cyApPT5cblx0XHRcdFx0XHRpZiBAbW9kZWwuZ2V0KCBcIndhaXRGb3JBc3luY1wiIClcblx0XHRcdFx0XHRcdF9kYXRhID0gW11cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Zm9yIHJlc3VsdCBpbiByZXN1bHRzXG5cdFx0XHRcdFx0XHRcdF9kYXRhLnB1c2ggQF9jb252ZXJ0VmFsdWUoIHJlc3VsdCApXG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0IyBzZWxlY3QgdGhlIGFjdGl2ZS9wcmVkZWZpbmVkIHJlc3VsdHNcblx0XHRcdFx0XHRcdEBfc2VsZWN0KCBfZGF0YSApXG5cdFx0XHRcdFx0XHRAY2xvc2UoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFxuXHRcdFx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLm9uIFwiY2xpY2tcIiwgQF9zZWwyb3BlblxuXHRcdFx0XHRAc2VsZWN0Mi4kZWxlbWVudC5oaWRlKClcblx0XHRcdFx0QHNlbGVjdDIuJHNlbGVjdGlvbi5vbiBcImZvY3Vzb3V0XCIsICggZXZudCApPT5cblx0XHRcdFx0XHRAVE1mb2N1c091dCA9IHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdCwgMTUwIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XG5cdFx0XHRcdEBzZWxlY3QyLiRzZWxlY3Rpb24ub24gXCJmb2N1c2luXCIsICggZXZudCApPT5cblx0XHRcdFx0XHRjbGVhclRpbWVvdXQoIEBUTWZvY3VzT3V0ICkgaWYgQFRNZm9jdXNPdXQ/XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0IyQoIGRvY3VtZW50ICkub24gQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuIEBzZWxlY3QyXG5cblx0X3NlbDJvcGVuOiAoIGV2bnQgKS0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0cmVtb3ZlOiA9PlxuXHRcdCNAJGlucC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdF9kYXRhID0gXy5leHRlbmQoIHt9LCBzdXBlciwgeyBtdWx0aXBsZTogQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiICksIG9wdGlvbnM6IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggQG1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApIH0gKVxuXHRcdGlmIF9kYXRhLnZhbHVlPyBhbmQgXy5pc0FycmF5KCBfZGF0YS52YWx1ZSApXG5cdFx0XHRmb3IgX3YsIF9pZHggaW4gX2RhdGEudmFsdWVcblx0XHRcdFx0X2RhdGEudmFsdWVbIF9pZHggXSA9IGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIF92ICkgZWxzZSBfdi50b1N0cmluZygpXG5cdFx0ZWxzZSBpZiBfZGF0YS52YWx1ZT9cblx0XHRcdF9kYXRhLnZhbHVlID0gWyBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfZGF0YS52YWx1ZSApIGVsc2UgX2RhdGEudmFsdWUudG9TdHJpbmcoKSBdXG5cdFx0XG5cdFx0aWYgX2RhdGEudmFsdWU/XG5cdFx0XHRfdmxpc3QgPSBfLnBsdWNrKCBfZGF0YS5vcHRpb25zLCBcInZhbHVlXCIgKVxuXHRcdFx0Zm9yIF92IGluIF9kYXRhLnZhbHVlIHdoZW4gX3Ygbm90IGluIF92bGlzdFxuXHRcdFx0XHRfZGF0YS5vcHRpb25zLnB1c2ggeyB2YWx1ZTogKCBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfdiApIGVsc2UgX3YudG9TdHJpbmcoKSApLCBsYWJlbDogX3YsIGdyb3VwOiB1bmRlZmluZWQgfVxuXHRcdFxuXHRcdF9ncm91cHMgPSBfLmdyb3VwQnkoIF9kYXRhLm9wdGlvbnMsIFwiZ3JvdXBcIiApXG5cdFx0aWYgXy5jb21wYWN0KCBfLmtleXMoIF9ncm91cHMgb3Ige30gKSApLmxlbmd0aCA+IDFcblx0XHRcdF9kYXRhLm9wdGlvbkdyb3VwcyA9IF9ncm91cHNcblx0XHRyZXR1cm4gX2RhdGFcblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogKCBjcmVhdGUgKT0+XG5cdFx0aWYgY3JlYXRlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gQG1vZGVsLmdldChcIm11bHRpcGxlXCIpXG5cdFxuXHRfaGFzVGFiRXZlbnQ6IC0+XG5cdFx0cmV0dXJuIFwia2V5dXBcIlxuXHRcdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdmFscyA9IFtdXG5cdFx0Zm9yIGRhdGEgaW4gQF9pbml0U2VsZWN0MigpPy5kYXRhKCkgb3IgW11cblx0XHRcdFxuXHRcdFx0X3ZhbHMucHVzaCggQF9jb252ZXJ0VmFsdWUoIGRhdGEgKSApXG5cdFx0cmV0dXJuIF92YWxzXG5cdFxuXHRfY29udmVydFZhbHVlOiAoIGRhdGEgKT0+XG5cdFx0X2RhdGEgPSB7fVxuXHRcdGlmIEBjb252ZXJ0VmFsdWVUb0ludFxuXHRcdFx0X2RhdGEudmFsdWUgPSBwYXJzZUZsb2F0KCBkYXRhLmlkIClcblx0XHRlbHNlXG5cdFx0XHRfZGF0YS52YWx1ZSA9IGRhdGEuaWRcblx0XHRpZiBkYXRhLnRleHQ/XG5cdFx0XHRpZiBkYXRhLnRleHQgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdFx0X2RhdGEubGFiZWwgPSBkYXRhLnRleHQuaHRtbCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9kYXRhLmxhYmVsID0gZGF0YS50ZXh0XG5cdFx0XHRcblx0XHRyZXR1cm4gX2RhdGFcblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdHJldHVybiBvcHRpb25zKCBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24gKVxuXG5cdFx0X29wdHMgPSBbXVxuXHRcdGZvciBvcHQgaW4gb3B0aW9uc1xuXHRcdFx0aWYgXy5pc1N0cmluZyggb3B0ICkgb3IgXy5pc051bWJlciggb3B0IClcblx0XHRcdFx0X29wdHMucHVzaCB7IHZhbHVlOiAoIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIG9wdCApIGVsc2Ugb3B0LnRvU3RyaW5nKCkgKSwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCBvcHQgKVxuXHRcdFx0XHRvcHQudmFsdWUgPSBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBvcHQudmFsdWUgKSBlbHNlIG9wdC52YWx1ZS50b1N0cmluZygpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gX29wdHNcblxuXHR1bnNlbGVjdDogKCBldm50ICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdGlmIEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgQHNlbGVjdDI/XG5cdFx0XHQjQHNlbGVjdDI/LmRlc3Ryb3koKVxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5oaWRlKClcblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRAJCggXCIuc2VsZWN0LWNoZWNrXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpIGlmIGV2bnQ/LnN0b3BQcm9wYWdhdGlvblxuXHRcdF92YWxzID0gQGdldFZhbHVlKClcblx0XHRpZiBub3QgX3ZhbHM/Lmxlbmd0aFxuXHRcdFx0IyBJc3N1ZSM0OSBpZiBub3RoaW5nIHdhcyBzZWxlY3RlZCBjbG9zZSB0aGUgc2VsZWN0LXZpZXcgYW5kIHJlbW92ZSB0aGUgd2hvbGUgZmFjZXRcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRpZiBub3QgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRcdEBzdWIuZGVsKClcblx0XHRcdHJldHVyblxuXHRcdEBfc2VsZWN0KCBfdmFscyApXG5cblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcblx0X3NlbGVjdDogKCBfdmFscyApPT5cblx0XHRAbW9kZWwuc2V0KCBcIndhaXRGb3JBc3luY1wiLCBmYWxzZSApXG5cdFx0TW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0Zm9yIF92YWwgaW4gX3ZhbHNcblx0XHRcdEByZXN1bHQuYWRkKCBuZXcgTW9kZWxDb25zdCggX3ZhbCApIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAcmVzdWx0IClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNTZWxlY3RcbiIsImNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3N0cmluZy5qYWRlXCIgKVxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRzdXBlclxuXHRcdHRyeVxuXHRcdFx0QCRpbnA/LnJlbW92ZT8oKVxuXHRcdHJldHVyblxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdF9vbGRWYWwgPSBAcmVzdWx0Py5maXJzdCgpPy5nZXQoIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0I3JldHVybiBpZiBAX2NoZWNrU2VsZWN0RW1wdHkoIF92YWwsIGV2bnQgKVxuXHRcdEBzZXQoIF92YWwsIGV2bnQgKVxuXHRcdHJldHVyblxuXHRcblx0Zm9jdXM6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5zZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJTdHJpbmdcbiIsIlN1YlZpZXcgPSByZXF1aXJlKCBcIi4vc3ViXCIgKVxuU2VsZWN0b3JWaWV3ID0gcmVxdWlyZSggXCIuL3NlbGVjdG9yXCIgKVxuXG5LRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIE1haW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy93cmFwcGVyLmphZGVcIiApXG5cblx0ZXZlbnRzOlxuXHRcdFwibW91c2Vkb3duIC5zZWFyY2gtYnRuXCI6IFwiX29uU2VhcmNoXCJcblx0XHRcImNsaWNrIC5zZWFyY2gtYnRuXCI6IFwiX29uU2VhcmNoXCJcblx0XHRcImZvY3VzIC5zZWFyY2gtYnRuXCI6IFwiX29uRm9jdXNTZWFyY2hcIlxuXHRcdFwibW91c2Vkb3duIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblx0XG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnM9e30gKS0+XG5cdFx0QHNlYXJjaEJ1dHRvbiA9IG9wdGlvbnM/LnNlYXJjaEJ1dHRvblxuXHRcdFxuXHRcdEBfb25TZWFyY2ggPSBfLmRlYm91bmNlKCBAX19vblNlYXJjaCwgKCBAc2VhcmNoQnV0dG9uPy5kZWJvdW5jZSBvciAzMDAgKSwgeyB0cmFpbGluZzogZmFsc2UsIGxlYWRpbmc6IHRydWUgfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRcblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdEBqUXVlcnkgPSBAbWFpbi5qUXVlcnlcblx0XHRAaWR4ID0gb3B0aW9ucy5pZHhcblx0XHRAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXHRcdFxuXHRcdEBmYWNldHMgPSB7fVxuXHRcdFxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cdFx0XG5cdFx0X2NsID0gXCJpZ2d5IGNsZWFyZml4XCJcblx0XHRpZiBAZWwuY2xhc3NOYW1lPy5sZW5ndGhcblx0XHRcdF9jbCA9IFwiIFwiICsgX2NsXG5cdFx0QGVsLmNsYXNzTmFtZSArPSBfY2xcblx0XHRAcmVuZGVyKClcblx0XHRAX291dGVyQ2xpY2tMaXN0ZW4oKVxuXHRcdEBfa2V5TGlzdGVuKClcblx0XHRcblx0XHRfdmFsdWVGYWNldHMgPSBAY29sbGVjdGlvbi5maWx0ZXIoICggZmN0ICktPnJldHVybiBmY3Q/LmdldCggXCJ2YWx1ZVwiICk/IG9yIGZjdD8uZ2V0KCBcInBpbm5lZFwiICkgKVxuXHRcdFxuXHRcdF9mblNvcnQgPSAoIGtleSApLT5cblx0XHRcdHJldHVybiAoIHYxLCB2MiApLT5cblx0XHRcdFx0aWYgdjFbIGtleSBdID4gdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIDFcblx0XHRcdFx0aWYgdjFbIGtleSBdIDwgdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHRcdHJldHVybiAwXG5cdFx0XG5cdFx0Zm9yIGZjdCBpbiBfdmFsdWVGYWNldHMuc29ydCggX2ZuU29ydCggXCJfaWR4XCIgKSApXG5cdFx0XHRAZ2VuU3ViKCBmY3QsIGZhbHNlLCB0cnVlIClcblx0XHRcblx0XHRAY29sbGVjdGlvbi5vbiBcImFkZFwiLCA9PlxuXHRcdFx0QCRhZGRCdG4uc2hvdygpXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0X2FjdGl2ZSA9IEBjb2xsZWN0aW9uLmZpbHRlciggKCBmY3QgKS0+cmV0dXJuIGZjdD8uZ2V0KCBcImFjdGl2ZVwiICkgYW5kIGZjdD8uZ2V0KCBcInBpbm5lZFwiICkgKVxuXHRcdFx0aWYgX2FjdGl2ZS5sZW5ndGhcblx0XHRcdFx0dmlldyA9IEBmYWNldHNbIF9hY3RpdmVbIDAgXS5pZCBdXG5cdFx0XHRcdCNAc3VidmlldyA9IHZpZXdcblx0XHRcdFx0dmlldz8ucmVvcGVuKClcblx0XHRcdFx0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCAwIClcblx0XHRcblx0XHRyZXR1cm5cblx0XG5cdHRlbXBsYXRlRGF0YTogPT5cblx0XHRfcmV0ID1cblx0XHRcdHRhYl9pbmRleDogKCAoICggQGlkeCBvciAxICkgKyAxICkgKiAxMDAwICkgLSAxMFxuXHRcdGlmICBAc2VhcmNoQnV0dG9uP1xuXHRcdFx0X3JldC5zZWFyY2hCdXR0b24gPVxuXHRcdFx0XHR0ZW1wbGF0ZTogQHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSBvciBcIlwiXG5cdFx0XHRcdGV2ZW50OiBAc2VhcmNoQnV0dG9uLmV2ZW50IG9yIFwic2VhcmNoXCJcblx0XHRcdFx0cHVsbHJpZ2h0OiBAc2VhcmNoQnV0dG9uLnB1bGxyaWdodCBvciBmYWxzZVxuXHRcdFx0XHRjc3NjbGFzczogQHNlYXJjaEJ1dHRvbi5jc3NjbGFzcyBvciBcImJ0biBidG4tcHJpbWFyeSBmYSBmYS1zZWFyY2hcIlxuXHRcdFxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRyZW5kZXI6ID0+XG5cdFx0X3RwbERhdGEgPSBAdGVtcGxhdGVEYXRhKClcblx0XHRAJGVsLmh0bWwoIEB0ZW1wbGF0ZSggX3RwbERhdGEgKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRpZiBfdHBsRGF0YS5zZWFyY2hCdXR0b24/XG5cdFx0XHRAJHNlYXJjaEJ0biA9IEAkKCBcIi5zZWFyY2gtYnRuXCIgKVxuXHRcdHJldHVyblxuXG5cdF9hZGRGYWNldDogKCBldm50ICk9PlxuXHRcdEBUTW9wZW5BZGRGYWNldCA9IHNldFRpbWVvdXQoID0+XG5cdFx0XHRAYWRkRmFjZXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblxuXHRleGl0OiAoIG5leHRBZGQgPSB0cnVlICk9PlxuXHRcdGlmIEBzdWJ2aWV3XG5cdFx0XHRAc3Vidmlldy5jbG9zZSgpXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIG5leHRBZGRcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHQjY29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTRUxFQ1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuY2xvc2UoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW1GYWNldDogKCBmYWNldE0gKT0+XG5cdFx0QHJlc3VsdHMucmVtb3ZlKCBmYWNldE0uZ2V0KCBcIm5hbWVcIiApIClcblx0XHRyZXR1cm5cblxuXHRzZXRGYWNldDogKCBmYWNldE0sIGRhdGEgKT0+XG5cdFx0QGNvbGxlY3Rpb24ucmVtb3ZlKCBmYWNldE0gKVxuXG5cdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggZGF0YSwgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDogZmFjZXRNIH0gKVxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdEAkYWRkQnRuLmhpZGUoKVxuXHRcdHJldHVyblxuXG5cdGdlblN1YjogKCBmYWNldE0sIGFkZEFmdGVyID0gdHJ1ZSwgaW5pdGlhbEFkZD1mYWxzZSApPT5cblx0XHRzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBwYXJlbnQ6IEAgKVxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzLCBldm50ICk9PlxuXHRcdFx0aWYgc3Vidmlldz8ubW9kZWw/LmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNzdWJ2aWV3Lm9mZigpXG5cdFx0XHRzdWJ2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0QGFkZEZhY2V0KCkgaWYgYWRkQWZ0ZXIgYW5kIGV2bnQ/LnR5cGUgaXNudCBcImZvY3Vzb3V0XCJcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJyZW9wZW5cIiwgPT5cblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF9zZWxmID0gQFxuXHRcdHN1YnZpZXcub24gXCJzZWxlY3RlZFwiLCAoIGZhY2V0TSwgZGF0YSwgZXZudCApLT5cblx0XHRcdCNjb25zb2xlLmxvZyBcInN1YnZpZXcgLSBzZWxlY3RlZFwiLCBkYXRhLCBAaXNSZXN1bHRFbXB0eSggZGF0YSApXG5cdFx0XHRfc2VsZi5zZXRGYWNldCggZmFjZXRNLCBkYXRhIClcblx0XHRcdGlmICggbm90IEBzZWxlY3R2aWV3Ll9pc0Z1bGw/IG9yIEBzZWxlY3R2aWV3Ll9pc0Z1bGwoKSApIGFuZCBldm50Py50eXBlIGlzbnQgXCJmb2N1c291dFwiXG5cdFx0XHRcdF9zZWxmLl9uZXh0RmFjZXQoIGV2bnQsIEAgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0c3Vidmlldy5ldmVudHNBdHRhY2hlZCA9IHRydWVcblx0XHRcblx0XHRAYXBwZW5kRmFjZXRFbCggc3Vidmlldy5yZW5kZXIoIGluaXRpYWxBZGQgKSApXG5cdFx0QGZhY2V0c1sgZmFjZXRNLmlkIF0gPSBzdWJ2aWV3XG5cdFx0cmV0dXJuIHN1YnZpZXdcblxuXHRhZGRGYWNldDogPT5cblx0XHQjY29uc29sZS5lcnJvciBcImFkZEZhY2V0XCIsIEBzZWxlY3R2aWV3PywgQHN1YnZpZXc/XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU0VMRUNUIEVYSVNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU1VCIEVYSVNUXCJcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdCNyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSwgbWFpbjogQCApXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcIm9wZW5lZFwiLCA9PlxuXHRcdFx0QF9vbk9wZW5lZCgpXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdEBfb25DbG9zZWQoKVxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU0VMRUNUIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRpZiBub3QgcmVzdWx0cz8ubGVuZ3RoIGFuZCBAc3Vidmlldz9cblx0XHRcdFx0I0BzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNLCBkYXRhLCBldm50ICk9PlxuXHRcdFx0ZmFjZXRNLnNldCggXCJ2YWx1ZVwiLCBudWxsIClcblx0XHRcdEBzdWJ2aWV3ID0gQGdlblN1YiggZmFjZXRNIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXHRcdFx0cmV0dXJuXG5cdFxuXHRcdCNAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAYXBwZW5kRmFjZXRFbCggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRyZXR1cm5cblx0XG5cdGFwcGVuZEZhY2V0RWw6ICggZWwgKT0+XG5cdFx0KCBAJHNlYXJjaEJ0biBvciBAJGFkZEJ0biApLmJlZm9yZSggZWwgKVxuXHRcdHJldHVyblxuXHRcblx0X29uT3BlbmVkOiA9PlxuXHRcdEAkYWRkQnRuPy5oaWRlKClcblx0XHRyZXR1cm5cblx0XG5cdF9vbkNsb3NlZDogPT5cblx0XHRAJGFkZEJ0bj8uc2hvdygpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb3V0ZXJDbGlja0xpc3RlbjogPT5cblx0XHRqUXVlcnkoIGRvY3VtZW50ICkub24gXCJjbGlja1wiLCBAX291dGVyQ2xpY2tcblx0XHRyZXR1cm5cblx0XG5cdFx0XG5cdF9rZXlMaXN0ZW46ID0+XG5cdFx0alF1ZXJ5KCBkb2N1bWVudCApLm9uIFwia2V5ZG93blwiLCAoIGV2bnQgKT0+XG5cdFx0XHQkdGdydCA9ICQoIGV2bnQudGFyZ2V0IClcblx0XHRcdFxuXHRcdFx0aWYgZXZudC5rZXlDb2RlIGlzIEtFWUNPREVTLkVOVEVSIGFuZCAkdGdydC5pcyggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRcdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRcdEBhZGRGYWNldCgpXG5cdFx0XHRcdCwgMCApXG5cdFx0XHRcdFxuXHRcdFx0aWYgZXZudC5rZXlDb2RlIGlzIEtFWUNPREVTLlRBQiBvciBldm50LmtleUNvZGUgaW4gS0VZQ09ERVMuVEFCXG5cdFx0XHRcdCNldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFxuXHRcdFx0XHRpZiBAJHNlYXJjaEJ0bj8gYW5kICR0Z3J0LmlzKCBcIi5hZGQtZmFjZXQtYnRuXCIgKSBhbmQgZXZudD8uc2hpZnRLZXlcblx0XHRcdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0XHRAVE1vcGVuQWRkRmFjZXQgPSBzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRcdFx0QGZvY3VzU2VhcmNoKClcblx0XHRcdFx0XHQsIDAgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcblx0XHRcdFx0IyBjYXNlIG9ubHkgdGhlIGZhY2V0IHNlbGVjdG9yIGlzIG9wZW5cblx0XHRcdFx0aWYgbm90IEAkc2VhcmNoQnRuPyBhbmQgQHNlbGVjdHZpZXc/LmlzT3BlblxuXHRcdFx0XHRcdGlmIGV2bnQ/LnNoaWZ0S2V5XG5cdFx0XHRcdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdFx0QG9wZW5MYXN0RmFjZXQoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0XHRpZiBAJHNlYXJjaEJ0bj8gYW5kICR0Z3J0LmlzKCBcIi5zZWFyY2gtYnRuXCIgKSBhbmQgZXZudD8uc2hpZnRLZXlcblx0XHRcdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0XHRAb3Blbkxhc3RGYWNldCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XG5cdFx0XHRcdGlmIG5vdCBAJHNlYXJjaEJ0bj8gYW5kICR0Z3J0LmlzKCBcIi5hZGQtZmFjZXQtYnRuXCIgKSBhbmQgZXZudD8uc2hpZnRLZXlcblx0XHRcdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0XHRAb3Blbkxhc3RGYWNldCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFxuXHRcdFx0XHRpZiBAJHNlYXJjaEJ0bj8gYW5kIEBzZWxlY3R2aWV3Py5pc09wZW5cblx0XHRcdFx0XHRpZiBldm50Py5zaGlmdEtleVxuXHRcdFx0XHRcdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0XHRcdEBmb2N1c1NlYXJjaCgpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0XHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdFx0XHRcdCwgMCApXG5cdFx0XHRcdFx0XHQjcmV0dXJuXG5cdFx0XHRcdFxuXHRcdFx0XHQjIG90aGVyd2lzZSB0cmlnZ2VyIGVzY2FwZSBldmVudCBhbmQgbGlzdGVuIGZvciB0aGUgcmVzcG9uc2Ugb2YgdGhlIG9wZW4gZmFjZXRcblx0XHRcdFx0QHRyaWdnZXIgXCJlc2NhcGVcIiwgZXZudCwgQF9uZXh0RmFjZXRcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRVNDIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdFx0QGV4aXQoKVxuXHRcdFx0XHRAdHJpZ2dlciggXCJlc2NhcGVcIiwgZXZudCApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XHQjIGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0IyBcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRvcGVuTGFzdEZhY2V0OiA9PlxuXHRcdF9wcmV2SWQgPSBAJGFkZEJ0bj8ucHJldkFsbCggXCIuc3ViXCIgKT8uZmlyc3QoKT8uZGF0YSggXCJmY3RpZFwiIClcblx0XHRpZiBfcHJldklkP1xuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QGZhY2V0c1sgX3ByZXZJZCBdPy5yZW9wZW4oKVxuXHRcdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XG5cdF9uZXh0RmFjZXQ6ICggZXZudCwgc3ViVmlldyApPT5cblx0XHRfbmV4dEZuID0gaWYgZXZudD8uc2hpZnRLZXkgdGhlbiBcInByZXZcIiBlbHNlIFwibmV4dFwiXG5cdFx0X25leHQgPSBzdWJWaWV3LiRlbD9bIF9uZXh0Rm4gXT8oKVxuXG5cdFx0aWYgX25leHQuaGFzQ2xhc3MoIFwic2VhcmNoLWJ0blwiIClcblx0XHRcdGlmIF9uZXh0Rm4gaXMgXCJwcmV2XCJcblx0XHRcdFx0QG9wZW5MYXN0RmFjZXQoKVxuXHRcdFx0ZWxzZSBpZiBAJHNlYXJjaEJ0bj9cblx0XHRcdFx0QGZvY3VzU2VhcmNoKClcblx0XHRcdHJldHVyblxuXG5cdFx0X25leHRJZCA9IF9uZXh0Py5kYXRhKCBcImZjdGlkXCIgKVxuXHRcdGlmIF9uZXh0SWQ/XG5cdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QGZhY2V0c1sgX25leHRJZCBdPy5yZW9wZW4oKVxuXHRcdFx0LCAwIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEAkc2VhcmNoQnRuPyBhbmQgX25leHRGbiBpcyBcIm5leHRcIlxuXHRcdFx0QGZvY3VzU2VhcmNoKClcblx0XHRpZiBub3QgQCRzZWFyY2hCdG4/IGFuZCBfbmV4dEZuIGlzIFwibmV4dFwiXG5cdFx0XHRAJGFkZEJ0bi5mb2N1cygpXG5cdFx0XHRAYWRkRmFjZXQoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRmb2N1c1NlYXJjaDogPT5cblx0XHRpZiBAJHNlYXJjaEJ0bj9cblx0XHRcdEAkc2VhcmNoQnRuLmZvY3VzKClcblx0XHRyZXR1cm5cblx0XHRcblx0X19vblNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmICggZXZudC50eXBlIGlzIFwiY2xpY2tcIiBhbmQgZXZudC5jbGllbnRYIGlzIDAgYW5kIGV2bnQuY2xpZW50WSBpcyAwICkgb3IgZXZudC50eXBlIGlzIFwibW91c2Vkb3duXCJcblx0XHRcdEB0cmlnZ2VyKCBcImVzY2FwZVwiLCBldm50IClcblx0XHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRAZXhpdCgpXG5cdFx0XHRcdEB0cmlnZ2VyKCBcInNlYXJjaGJ1dHRvblwiLCBAc2VhcmNoQnV0dG9uLmV2ZW50IClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHQsIDAgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25Gb2N1c1NlYXJjaDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAc2VsZWN0dmlldz8uY2xvc2U/KClcblx0XHRyZXR1cm5cblx0XHRcblx0X291dGVyQ2xpY2s6ICggZXZudCApPT5cblx0XHRjbGVhclRpbWVvdXQoIEBUTW9wZW5BZGRGYWNldCApIGlmIEBUTW9wZW5BZGRGYWNldD9cblx0XHRfcG9zV3JwID0gQGVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBldm50LnRhcmdldCApXG5cdFx0aWYgbm90ICggX3Bvc1dycCBpcyAwIG9yIF9wb3NXcnAgLSAxNiA+PSAwIClcblx0XHRcdEBleGl0KCBmYWxzZSApXG5cdFx0cmV0dXJuXG5cdFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW5WaWV3XG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIFNlbGVjdG9yVmlldyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldHMvYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3IuamFkZVwiIClcblx0dGVtcGxhdGVFbDogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3RvcmxpLmphZGVcIiApXG5cdHNlbGVjdENvdW50OiAxXG5cblx0Y2xhc3NOYW1lOiA9PlxuXHRcdGNscyA9IFsgXCJhZGQtZmFjZXRcIiBdXG5cdFx0aWYgQGN1c3RvbVxuXHRcdFx0Y2xzLnB1c2ggXCJjdXN0b21cIlxuXHRcdHJldHVybiBjbHMuam9pbiggXCIgXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRcIm1vdXNlZG93biBhXCI6IFwiX29uQ2xpY2tcIlxuXHRcdFwiZm9jdXMgaW5wdXQjI3tAY2lkfVwiOiBcIm9wZW5cIlxuXHRcdCNcImJsdXIgaW5wdXQjI3tAY2lkfVwiOiBcImNsb3NlXCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBjdXN0b20gPSBvcHRpb25zLmN1c3RvbSBvciBmYWxzZVxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QGN1cnJRdWVyeSA9IFwiXCJcblx0XHRcblx0XHRpZiBvcHRpb25zLm1haW4/XG5cdFx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdFxuXHRcdHN1cGVyKCBvcHRpb25zIClcblx0XHRyZXR1cm5cblx0XHRcblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdHN1cGVyXG5cdFx0QHNlYXJjaGNvbGwgPSBAY29sbGVjdGlvbi5zdWIoIC0+dHJ1ZSApXG5cdFx0QHJlc3VsdCA9IG5ldyBAY29sbGVjdGlvbi5jb25zdHJ1Y3RvcigpXG5cdFx0XG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJhZGRcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQHJlbmRlclJlcyApXG5cdFx0QGxpc3RlblRvKCBAc2VhcmNoY29sbCwgXCJyZW1vdmVcIiwgQGNoZWNrT3B0aW9uc0VtcHR5IClcblx0XHRcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIF8uZXh0ZW5kKCBzdXBlciwgY3VzdG9tOiBAY3VzdG9tIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGxpc3QgPSBAJGVsLmZpbmQoIFwiIyN7QGNpZH10eXBlbGlzdFwiIClcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm4gQGVsXG5cblx0cmVuZGVyUmVzOiA9PlxuXHRcdEAkbGlzdC5lbXB0eSgpXG5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHNlYXJjaGNvbGwubW9kZWxzIHdoZW4gbm90IG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRfbGJsID0gbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0X3RtcGwgPSBtb2RlbC5nZXQoIFwibGFiZWx0ZW1wbGF0ZVwiIClcblx0XHRcdGlmIF90bXBsP1xuXHRcdFx0XHRfbGJsID0gX3RtcGwucmVwbGFjZSggXCJ7e2xhYmVsfX1cIiwgX2xibCApXG5cdFx0XHRcdFxuXHRcdFx0X2lkID0gbW9kZWwuaWRcblx0XHRcdF9jc3NjbGFzcyA9IG1vZGVsLmdldCggXCJjc3NjbGFzc1wiIClcblx0XHRcdGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCA+IDFcblx0XHRcdFx0X2xibCA9IF9sYmwucmVwbGFjZSggbmV3IFJlZ0V4cCggQGN1cnJRdWVyeSwgXCJnaVwiICksICgoIHN0ciApLT5yZXR1cm4gXCI8Yj4je3N0cn08L2I+XCIgKSApXG5cdFx0XHRfbGlzdC5wdXNoIGxhYmVsOiBfbGJsLCBpZDogX2lkLCBjc3NjbGFzczogX2Nzc2NsYXNzXG5cdFx0I2lmIF9saXN0Lmxlbmd0aFxuXHRcdEAkbGlzdC5hcHBlbmQoIEB0ZW1wbGF0ZUVsKFxuXHRcdFx0bGlzdDogX2xpc3QsXG5cdFx0XHRxdWVyeTogQGN1cnJRdWVyeSxcblx0XHRcdGFjdGl2ZUlkeDogQGFjdGl2ZUlkeCxcblx0XHRcdGN1c3RvbTogQGN1c3RvbVxuXHRcdCkgKVxuXG5cdFx0QF9jaGVja1Njcm9sbCgpXG5cdFx0XG5cdFx0cmV0dXJuIEAkbGlzdFxuXG5cdF9zY3JvbGxUaWxsOiAxOThcblx0X2NoZWNrU2Nyb2xsOiA9PlxuXHRcdF9oZWlnaHQgPSBAJGxpc3QuaGVpZ2h0KClcblx0XHRpZiBfaGVpZ2h0ID4gMFxuXHRcdFx0QHNjcm9sbEhlbHBlciggX2hlaWdodCApXG5cdFx0XHRyZXR1cm5cblxuXHRcdCMgZXhpdCB0aGUgdGhlIGNhbGwgc3RhY2sgdG8gY2hlY2sgaGVpZ2h0IGFmdGVyIHRoZSBtb2R1bGUgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGRvbVxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBAJGxpc3QuaGVpZ2h0KCkgKVxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cblx0c2Nyb2xsSGVscGVyOiAoIGhlaWdodCApPT5cblx0XHRpZiBoZWlnaHQgPj0gQF9zY3JvbGxUaWxsXG5cdFx0XHRAc2Nyb2xsaW5nID0gdHJ1ZVxuXHRcdGVsc2Vcblx0XHRcdEBzY3JvbGxpbmcgPSBmYWxzZVxuXHRcdHJldHVyblxuXG5cdGNoZWNrT3B0aW9uc0VtcHR5OiA9PlxuXHRcdCNpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gMFxuXHRcdCNcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0X29uQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRfaWQgPSBAJCggZXZudC5jdXJyZW50VGFyZ2V0ICkuZGF0YSggXCJpZFwiIClcblx0XHRpZiBub3QgX2lkP1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfaWQgKVxuXHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRAc2VsZWN0ZWQoIF9tZGwgKVxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0X2lzRnVsbDogPT5cblx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRpZiBAbWFpbj9cblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0QG1haW4uZm9jdXNTZWFyY2goKVxuXHRcdGVsc2Vcblx0XHRcdHN1cGVyKCBldmVudCApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdGVkOiAoIG1kbCApPT5cblx0XHRpZiBub3QgQG1haW4/IGFuZCBAX2lzRnVsbCgpXG5cdFx0XHRfaWQgPSBAcmVzdWx0Lmxhc3QoKT8uaWRcblx0XHRcdEBybVJlcyggX2lkIClcblx0XHRcdFxuXHRcdHRyeVxuXHRcdFx0aWYgbWRsLm9ubHlFeGVjP1xuXHRcdFx0XHRtZGw/LmV4ZWM/KClcblx0XHRcdFx0cmV0dXJuXG5cdFx0Y2F0Y2ggX2VyclxuXHRcdFx0dHJ5XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIIC0gQ2xhc3M6I3sgQGNvbnN0cnVjdG9yLm5hbWUgfSAtIGFjdGl2ZUlkeDoje0BhY3RpdmVJZHh9IC0gY29sbGVjdGlvbjoje0pTT04uc3RyaW5naWZ5KCBAY29sbGVjdGlvbi50b0pTT04oKSl9XCJcblx0XHRcdGNhdGNoIF9lcnJlcnJcblx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyMzogQ0FUQ0hcIlxuXHRcdFxuXHRcdGlmIG1kbD9cblx0XHRcdEBzZWFyY2hjb2xsLnJlbW92ZSggbWRsIClcblx0XHRcdEByZXN1bHQuYWRkKCBtZGwgKVxuXHRcdFx0QHRyaWdnZXIgXCJzZWxlY3RlZFwiLCBtZGxcblx0XHRcblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRfZWwgPSBAJGlucC5nZXQoMClcblx0XHRcblx0XHRfZWwuc2VsZWN0aW9uU3RhcnQgPSBfZWwuc2VsZWN0aW9uRW5kID0gX2VsLnZhbHVlLmxlbmd0aFxuXHRcdHJldHVyblxuXHRcblx0b3BlbjogPT5cblx0XHQjY29uc29sZS5sb2cgXCJzZWxlY3RvciBvcGVuXCJcblx0XHRAdHJpZ2dlciggXCJvcGVuZWRcIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0c2VhcmNoOiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8udHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QG1vdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAbW92ZSggZmFsc2UgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdEFjdGl2ZSggdHJ1ZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBfLmlzU3RyaW5nKCBldm50IClcblx0XHRcdF9xID0gZXZudFxuXHRcdGVsc2Vcblx0XHRcdF9xID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKClcblx0XHRpZiBfcSBpcyBAY3VyclF1ZXJ5XG5cdFx0XHRyZXR1cm5cblxuXHRcdEBjdXJyUXVlcnkgPSBfcVxuXG5cdFx0QHNlYXJjaGNvbGwudXBkYXRlU3ViRmlsdGVyKCAoIG1kbCApPT5cblx0XHRcdGlmIEByZXN1bHQuZ2V0KCBtZGwuaWQgKT9cblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBub3QgX3E/Lmxlbmd0aFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0X21hdGNoID0gbWRsLm1hdGNoKCBfcSApXG5cdFx0XHRyZXR1cm4gX21hdGNoXG5cdFx0LCBmYWxzZSApXG5cblxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuXG5cblx0bW92ZTogKCB1cCA9IGZhbHNlICk9PlxuXHRcdF9saXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhXCIgKVxuXHRcblx0XHRfY3VzdG9tRWxlbWVudENoYW5nZSA9IGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCB0aGVuIDAgZWxzZSAxXG5cdFx0X3RvcCA9IDBcblx0XHRpZiB1cFxuXHRcdFx0aWYgKCBAYWN0aXZlSWR4IC0gMSApIDwgX3RvcFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4IC0gMVxuXHRcdGVsc2Vcblx0XHRcdGlmIEBzZWFyY2hjb2xsLmxlbmd0aCAtIF9jdXN0b21FbGVtZW50Q2hhbmdlIDw9IEBhY3RpdmVJZHhcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDFcblxuXHRcdFxuXHRcdEAkKCBfbGlzdFsgQGFjdGl2ZUlkeCBdICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXHRcdF8kZWxuZXcgPSBAJCggX2xpc3RbIF9uZXdpZHggXSApLmFkZENsYXNzKCBcImFjdGl2ZVwiIClcblxuXHRcdGlmIEBzY3JvbGxpbmdcblx0XHRcdF9lbEggPSBfJGVsbmV3Lm91dGVySGVpZ2h0KClcblx0XHRcdF9wb3MgPSBfZWxIICogKCBfbmV3aWR4ICsgMSApXG5cdFx0XHRfJGxpc3QgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0XCIgKVxuXHRcdFx0X3Njcm9sbFQgPSBfJGxpc3Quc2Nyb2xsVG9wKClcblx0XHRcdGlmIF9wb3MgPiBfc2Nyb2xsVCArIEBfc2Nyb2xsVGlsbFxuXHRcdFx0XHRfJGxpc3Quc2Nyb2xsVG9wKCBfcG9zIC0gQF9zY3JvbGxUaWxsIClcblx0XHRcdGVsc2UgaWYgX3BvcyA8IF9zY3JvbGxUICsgX2VsSFxuXHRcdFx0XHRfJGxpc3Quc2Nyb2xsVG9wKCBfcG9zIC0gX2VsSCApXG5cblx0XHRAYWN0aXZlSWR4ID0gX25ld2lkeFxuXHRcdHJldHVyblxuXG5cdHNlbGVjdDo9PlxuXHRcdHJldHVyblxuXG5cdHNlbGVjdEFjdGl2ZTogKCBpc0VudGVyRXZlbnQ9ZmFsc2UgKT0+XG5cdFx0aWYgbm90IEBtYWluPyBhbmQgQF9pc0Z1bGwoKVxuXHRcdFx0X2lkID0gQHJlc3VsdC5sYXN0KCk/LmlkXG5cdFx0XHRAcm1SZXMoIF9pZCApXG5cdFx0XHRcdFxuXHRcdF9zZWwgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGEuYWN0aXZlXCIgKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApLmRhdGEoKVxuXHRcdFx0XG5cdFx0X3NlYXJjaCA9IEAkaW5wLnZhbCgpXG5cdFx0XG5cdFx0aWYgIG5vdCBfc2VsPyBhbmQgQHNlbGVjdENvdW50IGlzbnQgMSBhbmQgaXNFbnRlckV2ZW50IGFuZCBub3QgX3NlYXJjaD8ubGVuZ3RoXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRpZiBub3QgX3NlbD9cblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0aWYgX3NlbD8uaWR4ID49IDAgYW5kIEBzZWFyY2hjb2xsLmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBAY29sbGVjdGlvbi5nZXQoIF9zZWwuaWQgKSApXG5cdFx0ZWxzZSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlICkgKVxuXHRcdFx0QCRpbnAudmFsKCBcIlwiIClcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclZpZXdcbiIsImNsYXNzIFZpZXdTdWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3N1Yi5qYWRlXCIgKVxuXHRjbGFzc05hbWU6ID0+XG5cdFx0X3N0ZCA9IFwic3ViXCJcblx0XHRfdHlwZSA9IEBtb2RlbC5nZXQoIFwidHlwZVwiIClcblx0XHRpZiBfdHlwZT9cblx0XHRcdF9zdGQgKz0gXCIgc3ViLXR5cGUtXCIgKyBfdHlwZVxuXHRcdFxuXHRcdF9uYW1lID0gQG1vZGVsLmdldCggXCJuYW1lXCIgKVxuXHRcdGlmIF9uYW1lP1xuXHRcdFx0X3N0ZCArPSBcIiBzdWItbmFtZS1cIiArIF9uYW1lXG5cdFx0cmV0dXJuIF9zdGRcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdEByZXN1bHQgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpXG5cdFx0I0AkZWwub24gXCJjbGlja1wiLCBAcmVvcGVuXG5cdFx0QHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cdFx0QGpRdWVyeSA9IEBwYXJlbnQualF1ZXJ5XG5cdFx0XG5cdFx0QCRlbC5kYXRhKCBcImZjdGlkXCIsIEBtb2RlbC5pZCApXG5cdFx0XG5cdFx0QHBhcmVudC5vbiBcImVzY2FwZVwiLCAoIGV2bnQsIGNiICk9PlxuXHRcdFx0aWYgQF9pc09wZW4gYW5kIEBzZWxlY3R2aWV3Py5fb25UYWJBY3Rpb24oIGV2bnQgKSBhbmQgY2I/XG5cdFx0XHRcdGNiKCBldm50LCBAIClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGV2ZW50czpcblx0XHRcIm1vdXNlZG93blwiOiBcInJlb3BlblwiXG5cdFx0XCJtb3VzZWRvd24gLnJtLWZhY2V0LWJ0blwiOiBcImRlbFwiXG5cdFx0XG5cblx0cmVuZGVyOiAoIGluaXRpYWxBZGQgKT0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHR0cnlcblx0XHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRjYXRjaCBfZXJyXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjQ6IENBVENIIC0gQ2xhc3M6I3sgQGNvbnN0cnVjdG9yLm5hbWUgfSAtIG1vZGVsOiN7SlNPTi5zdHJpbmdpZnkoQG1vZGVsLnRvSlNPTigpKX0gLSByZXN1bHQ6I3tKU09OLnN0cmluZ2lmeSggQHJlc3VsdC50b0pTT04oKSl9XCJcblx0XHRcdFx0Y2F0Y2ggX2VycmVyclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjQ6IENBVENIXCJcblx0XHRcblx0XHRAJGVsLmh0bWwgQHRlbXBsYXRlXG5cdFx0XHRsYWJlbDogQG1vZGVsLmdldExhYmVsKClcblx0XHRcdHNlbGVjdGVkOiBfbGlzdFxuXHRcdFx0dHlwZTogQG1vZGVsLmdldCggXCJ0eXBlXCIgKVxuXHRcdFx0bmFtZTogQG1vZGVsLmdldCggXCJuYW1lXCIgKVxuXHRcdFx0cGlubmVkOiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiICkgb3IgZmFsc2Vcblx0XHRcdFx0XG5cdFx0QCRzdWIgPSBAJCggXCIuc3Vic2VsZWN0XCIgKVxuXHRcdEAkcmVzdWx0cyA9IEAkKCBcIi5zdWJyZXN1bHRzXCIgKVxuXG5cdFx0QGdlbmVyYXRlU3ViKCBpbml0aWFsQWRkIClcblx0XHRyZXR1cm4gQGVsXG5cdFxuXHRyZW9wZW46ICggZXZudCApPT5cblx0XHRpZiBAX2lzT3BlblxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgZXZudD8gYW5kICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLnJtLXJlc3VsdC1idG5cIiApIGFuZCBAc2VsZWN0dmlldz8ucm1SZXM/XG5cdFx0XHRAc2VsZWN0dmlldy5ybVJlcyggZXZudCApXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgZXZudD8gYW5kICQoIGV2bnQudGFyZ2V0ICkuaXMoIFwiLmVkaXQtcmVzdWx0LWJ0blwiICkgYW5kIEBzZWxlY3R2aWV3Py5lZGl0UmVzP1xuXHRcdFx0QHNlbGVjdHZpZXcuZWRpdFJlcyggZXZudCApXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IEBfaXNPcGVuIGFuZCBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3LnJlb3BlbiggQCApXG5cdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHRyaWdnZXIoIFwicmVvcGVuXCIgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRkZWw6ICggZXZudCApPT5cblx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAc2VsZWN0dmlldz8ucmVtb3ZlKClcblx0XHRAcGFyZW50ID0gbnVsbFxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCwgZXZudCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsLCB7IG1lcmdlOiB0cnVlIH0gKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpLCBldm50IClcblx0XHRyZXR1cm5cblx0XG5cdHJlbW92ZWQ6ICggb3B0TWRsLCBldm50ICApPT5cblx0XHRAcmVzdWx0LnJlbW92ZSggb3B0TWRsIClcblx0XHRAcmVuZGVyUmVzdWx0KClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSwgZXZudCApXG5cdFx0XG5cdFx0IyByZW1vdmUgZmFjZXQgaWYgY29udGVudCBsZW5ndGggb3IgdGhlIGZhY2V0IGlzIGluIGVkaXRNb2RlXG5cdFx0aWYgQHJlc3VsdC5sZW5ndGggPD0gMCBhbmQgbm90IEBzZWxlY3R2aWV3LmVkaXRNb2RlXG5cdFx0XHRAZGVsKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRyZXR1cm5cblxuXHRpc09wZW46ID0+XG5cdFx0cmV0dXJuIEBzZWxlY3R2aWV3P1xuXG5cdGZvY3VzOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdEBvcGVuKClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8ub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRnZW5lcmF0ZVN1YjogKCBpbml0aWFsQWRkICk9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRyZXR1cm4gQHNlbGVjdHZpZXdcblx0XHRcdFxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IEBtb2RlbC5TdWJWaWV3KCBzdWI6IEAsIG1vZGVsOiBAbW9kZWwsIGVsOiBAJHN1YiApXG5cdFx0QGF0dGFjaFN1YkV2ZW50cygpXG5cdFx0XHRcblx0XHRAJGVsLmFwcGVuZCggQHNlbGVjdHZpZXcucmVuZGVyKCBpbml0aWFsQWRkICkgKVxuXHRcdGlmIEBtb2RlbD8uZ2V0KCBcInZhbHVlXCIgKT9cblx0XHRcdEBzZWxlY3R2aWV3LnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGF0dGFjaFN1YkV2ZW50czogPT5cblx0XHRpZiBub3QgQHNlbGVjdHZpZXcuc3ViRXZlbnRzQXR0YWNoZWRcblx0XHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0LCBldm50ICk9PlxuXHRcdFx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0XHRcdGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHQjQHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgcmVzdWx0LCBldm50IClcblx0XHRcdFx0QHJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHRcdHJldHVyblxuXG5cdFx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggbWRsLCBldm50ICk9PlxuXHRcdFx0XHRpZiBtZGxcblx0XHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCwgZXZudCApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XHRAc2VsZWN0dmlldy5vbiBcInJlbW92ZWRcIiwgKCBtZGwgKT0+XG5cdFx0XHRcdGlmIG1kbFxuXHRcdFx0XHRcdEByZW1vdmVkKCBtZGwgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdFx0QHNlbGVjdHZpZXcuc3ViRXZlbnRzQXR0YWNoZWQgPSB0cnVlXG5cdFx0cmV0dXJuXG5cdFxuXHRpc1Jlc3VsdEVtcHR5OiAoIGlucCApPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdHJldHVybiBAc2VsZWN0dmlldy5pc1Jlc3VsdEVtcHR5KCBpbnAgKVxuXHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QGdlbmVyYXRlU3ViKClcblxuXHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0QF9pc09wZW4gPSB0cnVlXG5cdFx0XG5cdFx0IyBAcGFyZW50LnN1YnZpZXcgPSBAXG5cdFx0IyBAcGFyZW50LnNlbGVjdHZpZXcgPSBAc2VsZWN0dmlld1xuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdTdWJcbiIsIiIsIihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLmphZGUgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xuICB2YXIgYmMgPSBiWydjbGFzcyddO1xuXG4gIGlmIChhYyB8fCBiYykge1xuICAgIGFjID0gYWMgfHwgW107XG4gICAgYmMgPSBiYyB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XG59XG5cbi8qKlxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpIDpcbiAgICAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKHZhbCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHZhbFtrZXldOyB9KSA6XG4gICAgW3ZhbF0pLmZpbHRlcihudWxscykuam9pbignICcpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuc3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5tYXAoZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgIH0pLmpvaW4oJzsnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgIHZhbCA9IGV4cG9ydHMuc3R5bGUodmFsKTtcbiAgfVxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh2YWwpLmluZGV4T2YoJyYnKSAhPT0gLTEpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgJyArXG4gICAgICAgICAgICAgICAgICAgJ3dpbGwgYmUgZXNjYXBlZCB0byBgJmFtcDtgJyk7XG4gICAgfTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgJ0lTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGphZGVfZW5jb2RlX2h0bWxfcnVsZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7J1xufTtcbnZhciBqYWRlX21hdGNoX2h0bWwgPSAvWyY8PlwiXS9nO1xuXG5mdW5jdGlvbiBqYWRlX2VuY29kZV9jaGFyKGMpIHtcbiAgcmV0dXJuIGphZGVfZW5jb2RlX2h0bWxfcnVsZXNbY10gfHwgYztcbn1cblxuZXhwb3J0cy5lc2NhcGUgPSBqYWRlX2VzY2FwZTtcbmZ1bmN0aW9uIGphZGVfZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpLnJlcGxhY2UoamFkZV9tYXRjaF9odG1sLCBqYWRlX2VuY29kZV9jaGFyKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuXG5leHBvcnRzLkRlYnVnSXRlbSA9IGZ1bmN0aW9uIERlYnVnSXRlbShsaW5lbm8sIGZpbGVuYW1lKSB7XG4gIHRoaXMubGluZW5vID0gbGluZW5vO1xuICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG59XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfZ2V0S2V5LCBpc0FycmF5LCB0b1N0cmluZztcblxuICB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG4gIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgX2dldEtleSA9IGZ1bmN0aW9uKGVsLCBrZXkpIHtcbiAgICByZXR1cm4gZWxba2V5XTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleXMsIGZvcndhcmQsIGdldEtleSkge1xuICAgIHZhciBmbnNvcnQsIHJlZjtcbiAgICBpZiAoZm9yd2FyZCA9PSBudWxsKSB7XG4gICAgICBmb3J3YXJkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGdldEtleSA9PSBudWxsKSB7XG4gICAgICBnZXRLZXkgPSBfZ2V0S2V5O1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXkoa2V5cykpIHtcbiAgICAgIGtleXMgPSBba2V5c107XG4gICAgfVxuICAgIGZuc29ydCA9IGZ1bmN0aW9uKGZvcndhcmQsIGtleSwgbmV4dGtleXMpIHtcbiAgICAgIHZhciBfZndyZCwgX2ssIG5leHRTb3J0LCByZWY7XG4gICAgICBpZiAobmV4dGtleXMgIT0gbnVsbCA/IG5leHRrZXlzLmxlbmd0aCA6IHZvaWQgMCkge1xuICAgICAgICBfayA9IChyZWYgPSBuZXh0a2V5cy5zcGxpY2UoMCwgMSkpICE9IG51bGwgPyByZWZbMF0gOiB2b2lkIDA7XG4gICAgICAgIGlmIChfayAhPSBudWxsKSB7XG4gICAgICAgICAgbmV4dFNvcnQgPSBmbnNvcnQoZm9yd2FyZCwgX2ssIG5leHRrZXlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgX2Z3cmQgPSAoZm9yd2FyZFtrZXldICE9IG51bGwgPyBmb3J3YXJkW2tleV0gOiAoZm9yd2FyZFtcIj9cIl0gIT0gbnVsbCA/IGZvcndhcmRbXCI/XCJdIDogZm9yd2FyZCkpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVsQSwgZWxCKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIF9hID0gZ2V0S2V5KGVsQSwga2V5KTtcbiAgICAgICAgX2IgPSBnZXRLZXkoZWxCLCBrZXkpO1xuICAgICAgICBpZiAoX2EgPCBfYikge1xuICAgICAgICAgIGlmIChfZndyZCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoX2EgPiBfYikge1xuICAgICAgICAgIGlmIChfZndyZCkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoX2EgPT09IF9iKSB7XG4gICAgICAgICAgaWYgKG5leHRTb3J0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0U29ydChlbEEsIGVsQik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBmbnNvcnQoZm9yd2FyZCwgKHJlZiA9IGtleXMuc3BsaWNlKDAsIDEpKSAhPSBudWxsID8gcmVmWzBdIDogdm9pZCAwLCBrZXlzKTtcbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
