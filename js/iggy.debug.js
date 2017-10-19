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
      buttonsFirst: options.buttonsFirst || false,
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
buf.push("<span class=\"txt\">" + (jade.escape(null == (jade_interp = txt) ? "" : jade_interp)) + "</span><span class=\"btn-wrp\"><i" + (jade.attr("data-id", id, true, false)) + " class=\"rm-result-btn fa fa-times\"></i>");
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
buf.push("<i class=\"rm-facet-btn fa fa-times\"></i>");
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

buf.push("<li><span class=\"txt\">" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</span><i class=\"rm-facet-btn fa fa-times\"></i></li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li><span class=\"txt\">" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</span><i class=\"rm-facet-btn fa fa-times\"></i></li>");
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
buf.push("<button class=\"add-facet-btn\"><i class=\"fa fa-plus\"></i></button>");}.call(this,"searchButton" in locals_for_with?locals_for_with.searchButton:typeof searchButton!=="undefined"?searchButton:undefined));;return buf.join("");
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
    this.openFirstFacet = bind(this.openFirstFacet, this);
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
    this.buttonsFirst = (options != null ? options.buttonsFirst : void 0) || false;
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
        template: this.searchButton.template || "<i class=\"fa fa-search\"></i>",
        event: this.searchButton.event || "search",
        pullright: this.searchButton.pullright || false,
        cssclass: this.searchButton.cssclass || "btn btn-primary"
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
    if (this.buttonsFirst) {
      this.$el.append(el);
    } else {
      (this.$searchBtn || this.$addBtn).before(el);
    }
  };

  MainView.prototype._onOpened = function() {
    var ref;
    if (!this.buttonsFirst) {
      if ((ref = this.$addBtn) != null) {
        ref.hide();
      }
    }
  };

  MainView.prototype._onClosed = function() {
    var ref;
    if (!this.buttonsFirst) {
      if ((ref = this.$addBtn) != null) {
        ref.show();
      }
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
        if (evnt.keyCode === KEYCODES.ENTER && _this.$addBtn.is($tgrt)) {
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
          if ((_this.$searchBtn != null) && _this.$addBtn.is($tgrt) && (evnt != null ? evnt.shiftKey : void 0)) {
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
          if (_this.$addBtn.is($tgrt) && !(evnt != null ? evnt.shiftKey : void 0) && _this.buttonsFirst) {
            _this.openFirstFacet();
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
          if ((_this.$searchBtn != null) && _this.$searchBtn.is($tgrt) && (evnt != null ? evnt.shiftKey : void 0) && !_this.buttonsFirst) {
            if (evnt != null) {
              evnt.preventDefault();
            }
            if (evnt != null) {
              evnt.stopPropagation();
            }
            _this.openLastFacet();
            return;
          }
          if ((_this.$searchBtn == null) && _this.$addBtn.is($tgrt) && (evnt != null ? evnt.shiftKey : void 0)) {
            if (!_this.buttonsFirst) {
              if (evnt != null) {
                evnt.preventDefault();
              }
              if (evnt != null) {
                evnt.stopPropagation();
              }
              _this.openLastFacet();
              return;
            }
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
                return _this.selectview.close();
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
    var _id, ref, ref1, ref2;
    _id = (ref = this.$addBtn) != null ? (ref1 = ref.prevAll(".sub")) != null ? (ref2 = ref1.first()) != null ? ref2.data("fctid") : void 0 : void 0 : void 0;
    if (_id != null) {
      setTimeout((function(_this) {
        return function() {
          var ref3;
          return (ref3 = _this.facets[_id]) != null ? ref3.reopen() : void 0;
        };
      })(this), 0);
    }
  };

  MainView.prototype.openFirstFacet = function() {
    var _id, ref, ref1;
    _id = (ref = this.$el.find(".sub")) != null ? (ref1 = ref.first()) != null ? ref1.data("fctid") : void 0 : void 0;
    if (_id != null) {
      setTimeout((function(_this) {
        return function() {
          var ref2;
          return (ref2 = _this.facets[_id]) != null ? ref2.reopen() : void 0;
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
      if (!this.buttonsFirst) {
        this.focusSearch();
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL21haW4uY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvYmFja2JvbmVfc3ViLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2Jhc2UuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9yYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0cy5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3JhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXIuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL3N1YnN0cmluZy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL3N1Yi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0Y29sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsc0hBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVDs7QUFDWCxNQUFBLEdBQVMsT0FBQSxDQUFTLGlCQUFUOztBQUNULFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFTLDBCQUFUOztBQUNm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QURrQixPQUFBLENBQVMsZ0JBQVQ7O0FBRzFCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDVGpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBLE1BQU0sQ0FBQyxPQUFQLEdBQ0M7RUFBQSxNQUFBLEVBQVEsRUFBUjtFQUNBLE9BQUEsRUFBUyxFQURUO0VBRUEsSUFBQSxFQUFNLEVBRk47RUFHQSxNQUFBLEVBQVEsRUFIUjtFQUlBLEtBQUEsRUFBTyxDQUFFLEdBQUYsRUFBTyxFQUFQLENBSlA7RUFLQSxPQUFBLEVBQVMsRUFMVDtFQU1BLEtBQUEsRUFBTyxDQU5QOzs7OztBQ0RELElBQUEsbUNBQUE7RUFBQTs7Ozs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLFVBQUEsR0FBYSxPQUFBLENBQVMseUJBQVQ7O0FBRVA7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBQ0wsY0FBQSxHQUFnQixPQUFBLENBQVMsOEJBQVQ7OzBCQUVoQixVQUFBLEdBQVksU0FBRSxPQUFGO0FBQ1gsUUFBQTtJQUFBLElBQUMsQ0FBQSxHQUFELEdBQU8sT0FBTyxDQUFDO0lBQ2YsSUFBQyxDQUFBLE1BQUQsa0NBQWMsQ0FBRSxnQkFBTiwyREFBNkIsQ0FBRTtJQUN6QyxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsVUFBQSxDQUFBO0VBSEg7OzBCQU1aLE1BQUEsR0FBUSxTQUFBO0FBQ1AsUUFBQTtXQUFBO1lBQUEsRUFBQTtVQUFBLFFBQUEsR0FBUSxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBRCxLQUF1QixPQUEvQjtVQUNBLFVBQUEsR0FBVSxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBRCxLQUF1QixPQURqQzs7O0VBRE87OzBCQUlSLEtBQUEsR0FBTyxTQUFBO0lBQ04sSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWtCLFFBQWxCO0lBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBO0VBSE07OzBCQU1QLFlBQUEsR0FBYyxTQUFFLFdBQUY7QUFDYixRQUFBOztNQURlLGNBQWM7O0lBQzdCLElBQUcsV0FBSDtBQUNDLGFBQU8sR0FEUjs7SUFFQSxLQUFBLEdBQVE7QUFDUjtBQUFBLFNBQUEsaURBQUE7O01BQ0MsSUFBQSxHQUFPLEtBQUssQ0FBQyxRQUFOLENBQUE7TUFDUCxJQUFHLGNBQUEsSUFBVSxJQUFBLEtBQVUsRUFBdkI7UUFDQyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBWCxFQUREOztBQUZEO0lBSUEsSUFBRyxLQUFLLENBQUMsTUFBVDtBQUNDLGFBQU8sTUFBQSxHQUFTLEtBQUssQ0FBQyxJQUFOLENBQVksV0FBWixDQUFULEdBQXFDLFFBRDdDOztBQUVBLFdBQU87RUFWTTs7MEJBYWQsSUFBQSxHQUFNLFNBQUE7SUFDTCxJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBa0IsUUFBbEI7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBZSxNQUFmO0lBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxPQUFELENBQVUsUUFBVjtFQUpLOzswQkFPTixLQUFBLEdBQU8sU0FBRSxJQUFGO0lBQ04sSUFBRyxJQUFJLENBQUMsSUFBTCxLQUFhLFNBQWhCO0FBQ0MsY0FBTyxJQUFJLENBQUMsT0FBWjtBQUFBLGFBQ00sUUFBUSxDQUFDLEtBRGY7VUFFRSxJQUFDLENBQUEsTUFBRCxDQUFBO0FBRkYsT0FERDs7RUFETTs7MEJBT1AsTUFBQSxHQUFRLFNBQUUsSUFBRjtBQUNQLFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxPQUFMLEtBQWdCLFFBQVEsQ0FBQyxHQUF6QixJQUFnQyxPQUFBLElBQUksQ0FBQyxPQUFMLEVBQUEsYUFBZ0IsUUFBUSxDQUFDLEdBQXpCLEVBQUEsR0FBQSxNQUFBLENBQW5DO01BQ0MsSUFBQyxDQUFBLFlBQUQsQ0FBZSxJQUFmO0FBQ0EsYUFGRDs7RUFETzs7MEJBTVIsZUFBQSxHQUFpQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxHQUFBLEdBQ0M7TUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLEdBQU47TUFFQSxLQUFBLGtDQUFhLENBQUUsR0FBUixDQUFhLE9BQWIsVUFGUDs7QUFHRCxXQUFPO0VBTFM7OzBCQU9qQixlQUFBLEdBQWlCLFNBQUE7QUFDaEIsV0FBTyxRQUFBLEdBQVMsSUFBQyxDQUFBO0VBREQ7OzBCQUdqQixNQUFBLEdBQVEsU0FBRSxLQUFGO0lBQ1AsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWtCLFFBQWxCO0lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWUsTUFBZjtJQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7O01BQ0EsS0FBSyxDQUFFLElBQVAsQ0FBQTs7RUFKTzs7MEJBT1IsTUFBQSxHQUFRLFNBQUUsVUFBRjtBQUNQLFFBQUE7SUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBWSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQVo7SUFDUixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxLQUFYO0lBQ0EsSUFBRyxDQUFJLFVBQVA7TUFDQyxJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBa0IsUUFBbEIsRUFERDs7SUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFXLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBWDtFQUxEOzswQkFTUixZQUFBLEdBQWMsU0FBQTtBQUNiLFdBQU87RUFETTs7MEJBR2QsZUFBQSxHQUFpQixTQUFBO0FBQ2hCLFdBQU87RUFEUzs7MEJBR2pCLFlBQUEsR0FBYyxTQUFFLElBQUY7SUFDYixJQUFDLENBQUEsTUFBRCxDQUFTLElBQVQ7QUFDQSxXQUFPO0VBRk07OzBCQUlkLEtBQUEsR0FBTyxTQUFFLElBQUY7SUFDTixJQUFDLENBQUEsT0FBRCxHQUFXO0lBRVgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWtCLE1BQWxCO0lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWUsUUFBZjtJQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsT0FBRCxDQUFVLFFBQVYsRUFBb0IsSUFBQyxDQUFBLE1BQXJCLEVBQTZCLElBQTdCO0VBTk07OzBCQVNQLFVBQUEsR0FBWSxTQUFBO1dBQ1g7TUFBQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFQOztFQURXOzswQkFHWixhQUFBLEdBQWUsU0FBRSxHQUFGO0lBQ2QsSUFBRywwQ0FBSDtBQUNDLGFBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBZ0IsR0FBRyxDQUFDLEtBQXBCLEVBRFI7O0lBR0EsSUFBTyxXQUFQO0FBQ0MsYUFBTyxLQURSOztJQUVBLElBQUcsR0FBQSxLQUFPLEVBQVY7QUFDQyxhQUFPLEtBRFI7O0lBRUEsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFXLEdBQVgsQ0FBQSxJQUFxQixHQUFHLENBQUMsTUFBSixJQUFjLENBQXRDO0FBQ0MsYUFBTyxLQURSOztBQUdBLFdBQU87RUFYTzs7MEJBYWYsV0FBQSxHQUFhLFNBQUE7QUFDWixRQUFBO0lBQUEsR0FBQSxvRUFBc0IsQ0FBRSxNQUFsQixDQUFBO0FBRU4sMEJBQU8sR0FBRyxDQUFFLGVBQUwsSUFBYztFQUhUOzswQkFLYixjQUFBLEdBQWdCLFNBQUUsR0FBRjtBQUNmLFFBQUE7O01BRGlCLE1BQU0sSUFBQyxDQUFBLFFBQUQsQ0FBQTs7SUFDdkIsRUFBQSxHQUFLLElBQUMsQ0FBQSxXQUFELENBQUE7SUFDTCxJQUFHLEVBQUEsS0FBTSxHQUFUO0FBQ0MsYUFBTyxLQURSOztBQUVBLFdBQU87RUFKUTs7MEJBTWhCLFFBQUEsR0FBVSxTQUFBO0FBQ1QsV0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtFQURFOzswQkFHVixjQUFBLEdBQWdCLFNBQUE7QUFDZixXQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUM7RUFEYjs7MEJBR2hCLGlCQUFBLEdBQW1CLFNBQUUsSUFBRixFQUFRLElBQVI7SUFNbEIsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFXLElBQVgsQ0FBQSxJQUFzQixDQUFJLENBQUMsQ0FBQyxRQUFGLENBQVksSUFBWixDQUExQixJQUFpRCxDQUFJLENBQUMsQ0FBQyxTQUFGLENBQWEsSUFBYixDQUF4RDtNQUNDLElBQUMsQ0FBQSxLQUFELENBQVEsSUFBUjtBQUNBLGFBQU8sS0FGUjs7QUFHQSxXQUFPO0VBVFc7OzBCQVduQixNQUFBLEdBQVEsU0FBRSxJQUFGO0FBQ1AsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBRCxDQUFBO0lBRVAsSUFBQyxDQUFBLEdBQUQsQ0FBTSxJQUFOLEVBQVksSUFBWjtFQUhPOzswQkFNUixHQUFBLEdBQUssU0FBRSxHQUFGLEVBQU8sSUFBUDtBQUNKLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQUE7SUFDVCxJQUFPLGNBQVA7TUFDQyxXQUFBLEdBQWMsSUFBQyxDQUFBLGNBQUQsQ0FBQTtNQUNkLE1BQUEsR0FBYSxJQUFBLFdBQUEsQ0FBYTtRQUFBLEtBQUEsRUFBTyxHQUFQO09BQWI7TUFDYixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBYSxNQUFiLEVBSEQ7S0FBQSxNQUFBO01BS0MsTUFBTSxDQUFDLEdBQVAsQ0FBWTtRQUFBLEtBQUEsRUFBTyxHQUFQO09BQVosRUFMRDs7SUFNQSxJQUFDLENBQUEsT0FBRCxDQUFVLFVBQVYsRUFBc0IsTUFBdEIsRUFBOEIsSUFBOUI7SUFDQSxJQUFDLENBQUEsS0FBRCxDQUFRLElBQVI7RUFUSTs7OztHQW5Kc0IsUUFBUSxDQUFDOztBQWdLckMsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNuS2pCLElBQUEsNEJBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsc0JBQVQ7O0FBRUw7Ozs7Ozs7Ozs7Ozs7Ozs7OytCQUNMLFFBQUEsR0FBVSxPQUFBLENBQVMsNEJBQVQ7OytCQUVWLG1CQUFBLEdBQXFCLFNBQUE7QUFDcEIsUUFBQTtJQUFBLEtBQUEsR0FDQztNQUFBLEtBQUEsRUFBTyxPQUFQOztJQUVELElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksWUFBWixDQUFIO01BQ0MsS0FBSyxDQUFDLE1BQU4sR0FDQztRQUFBLE1BQUEsRUFBUSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxZQUFaLENBQVI7UUFGRjs7SUFJQSxJQUFHLG1FQUFIO01BQ0M7TUFDQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsT0FBWCxDQUFvQixDQUFBLENBQUEsQ0FBaEMsQ0FBSDtRQUNDLEdBQUEsR0FBTSxNQUFBLENBQVEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsT0FBWCxDQUFvQixDQUFBLENBQUEsQ0FBNUIsRUFEUDtPQUFBLE1BQUE7UUFHQyxHQUFBLEdBQU0sTUFBQSxDQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBb0IsQ0FBQSxDQUFBLENBQTVCLEVBQWdDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFlBQVosQ0FBaEMsRUFIUDs7TUFJQSxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBSDtRQUNDLEtBQUssQ0FBQyxTQUFOLEdBQWtCLEdBQUcsQ0FBQyxHQUR2QjtPQU5EOztJQVNBLElBQUcscUVBQUg7TUFDQyxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsT0FBWCxDQUFvQixDQUFBLENBQUEsQ0FBaEMsQ0FBSDtRQUNDLEdBQUEsR0FBTSxNQUFBLENBQVEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsT0FBWCxDQUFvQixDQUFBLENBQUEsQ0FBNUIsRUFEUDtPQUFBLE1BQUE7UUFHQyxHQUFBLEdBQU0sTUFBQSxDQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBb0IsQ0FBQSxDQUFBLENBQTVCLEVBQWdDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFlBQVosQ0FBaEMsRUFIUDs7TUFJQSxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBSDtRQUNDLEtBQUssQ0FBQyxPQUFOLEdBQWdCLEdBQUcsQ0FBQyxHQURyQjtPQUxEOztBQU9BLFdBQU87RUF4QmE7OytCQTBCckIsTUFBQSxHQUFRLFNBQUEsR0FBQTs7K0JBR1IsS0FBQSxHQUFPLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBTyw0QkFBUDtNQUNDLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZ0IsSUFBaEIsRUFBc0IsRUFBdEIsRUFBMEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksTUFBWixDQUExQixFQUFnRCxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUFoRDtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsZUFBTixDQUF1QixLQUF2QixFQUE4QixJQUFDLENBQUEsV0FBL0I7TUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBWSxpQkFBWjs7V0FDTyxDQUFFLFFBQTVCLENBQXNDLGdCQUF0Qzs7TUFHQSxJQUFDLENBQUEsZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUEzQixDQUE4QixPQUE5QixFQUF1QyxTQUFFLElBQUY7UUFDdEMsSUFBSSxDQUFDLGVBQUwsQ0FBQTtBQUNBLGVBQU87TUFGK0IsQ0FBdkMsRUFQRDtLQUFBLE1BQUE7TUFXQyxJQUFDLENBQUEsZUFBZSxDQUFDLE9BQWpCLEdBQTJCLElBQUMsQ0FBQTtNQUM1QixJQUFDLENBQUEsZUFBZSxDQUFDLElBQWpCLENBQUEsRUFaRDs7SUFjQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBVSx3QkFBVixFQUFvQyxJQUFDLENBQUEsS0FBckM7SUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBVSxzQkFBVixFQUFrQyxJQUFDLENBQUEsS0FBbkM7QUFDQSxXQUFPLCtDQUFBLFNBQUE7RUFqQkQ7OytCQW1CUCxLQUFBLEdBQU8sU0FBQTtJQUNOLCtDQUFBLFNBQUE7SUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVyx3QkFBWCxFQUFxQyxJQUFDLENBQUEsS0FBdEM7SUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVyxzQkFBWCxFQUFtQyxJQUFDLENBQUEsS0FBcEM7RUFITTs7K0JBTVAsTUFBQSxHQUFRLFNBQUE7QUFDUCxRQUFBOztTQUFnQixDQUFFLE1BQWxCLENBQUE7O0lBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUI7QUFDbkIsV0FBTyxnREFBQSxTQUFBO0VBSEE7OytCQUtSLFlBQUEsR0FBYyxTQUFBO0FBQ2IsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsVUFBRCxDQUFBO0lBRVAsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFZLElBQUksQ0FBQyxLQUFPLENBQUEsQ0FBQSxDQUF4QixDQUFIO01BQ0MsVUFBQSxHQUFhLE1BQUEsQ0FBUSxJQUFJLENBQUMsS0FBTyxDQUFBLENBQUEsQ0FBcEIsRUFEZDtLQUFBLE1BQUE7TUFHQyxVQUFBLEdBQWEsTUFBQSxDQUFRLElBQUksQ0FBQyxLQUFPLENBQUEsQ0FBQSxDQUFwQixFQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxZQUFaLENBQXpCLEVBSGQ7O0lBS0EsSUFBRyxxQkFBSDtNQUNDLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBWSxJQUFJLENBQUMsS0FBTyxDQUFBLENBQUEsQ0FBeEIsQ0FBSDtRQUNDLFFBQUEsR0FBVyxNQUFBLENBQVEsSUFBSSxDQUFDLEtBQU8sQ0FBQSxDQUFBLENBQXBCLEVBRFo7T0FBQSxNQUFBO1FBR0MsUUFBQSxHQUFXLE1BQUEsQ0FBUSxJQUFJLENBQUMsS0FBTyxDQUFBLENBQUEsQ0FBcEIsRUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksWUFBWixDQUF6QixFQUhaO09BREQ7O0lBTUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLE1BQVosQ0FBb0IsQ0FBQztJQUU3QixFQUFBLEdBQUs7SUFDTCxJQUFHLG9DQUFIO01BQ0MsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFlBQVosRUFEVDtLQUFBLE1BRUssSUFBRyxLQUFIO01BQ0osS0FBQSxHQUFRLE9BREo7S0FBQSxNQUFBO01BR0osS0FBQSxHQUFRLEtBSEo7O0lBSUwsRUFBQSxJQUFNLFVBQVUsQ0FBQyxNQUFYLENBQW1CLEtBQW5CO0lBRU4sSUFBRyxnQkFBSDtNQUNDLEVBQUEsSUFBTTtNQUNOLEVBQUEsSUFBTSxRQUFRLENBQUMsTUFBVCxDQUFpQixLQUFqQixFQUZQOztJQUlBLEVBQUEsSUFBTTtBQUVOLFdBQU87RUEvQk07OytCQWlDZCxlQUFBLEdBQWlCLFNBQUE7QUFDaEIsV0FBTztFQURTOzsrQkFHakIsV0FBQSxHQUFhLFNBQUUsU0FBRixFQUFjLE9BQWQ7SUFBRSxJQUFDLENBQUEsWUFBRDtJQUFZLElBQUMsQ0FBQSxVQUFEO0lBQzFCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLE9BQVosRUFBcUIsSUFBQyxDQUFBLFFBQUQsQ0FBVyxLQUFYLENBQXJCO0lBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtFQUZZOzsrQkFLYixlQUFBLEdBQWlCLFNBQUE7QUFDaEIsV0FBTyx5REFBQSxTQUFBO0VBRFM7OytCQUdqQixRQUFBLEdBQVUsU0FBRSxNQUFGO0FBQ1QsUUFBQTs7TUFEVyxTQUFTOztJQUNwQixJQUFHLE1BQUg7TUFDQyxVQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksT0FBWjtNQUNiLElBQUcsa0JBQUg7UUFDQyxJQUFHLENBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVyxVQUFYLENBQVA7VUFDQyxVQUFBLEdBQWMsQ0FBRSxVQUFGLEVBRGY7O1FBRUUsSUFBQyxDQUFBLHlCQUFILEVBQWMsSUFBQyxDQUFBO0FBQ2YsZUFBTyxXQUpSO09BRkQ7O0lBT0EsSUFBQSxHQUFPLENBQUUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUEsQ0FBRjtJQUNQLElBQWdDLG9CQUFoQztNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsQ0FBVixFQUFBOztBQUNBLFdBQU87RUFWRTs7K0JBWVYsTUFBQSxHQUFRLFNBQUE7QUFDUCxRQUFBO0lBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxjQUFELENBQUE7SUFDZCxNQUFBLEdBQWEsSUFBQSxXQUFBLENBQWE7TUFBQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFQO0tBQWI7SUFDYixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBYSxNQUFiO0lBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBVSxVQUFWLEVBQXNCLE1BQXRCO0lBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtFQUxPOzs7O0dBdEh3QixPQUFBLENBQVMsUUFBVDs7QUE4SGpDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDaElqQixJQUFBLDZDQUFBO0VBQUE7Ozs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUVYLE9BQUEsR0FBVSxTQUFDLENBQUQsRUFBSSxDQUFKO0VBQ1QsQ0FBQSxHQUFJLENBQUEsR0FBSTtFQUNSLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBQSxHQUFnQjtBQUNwQixTQUFPO0FBSEU7O0FBS1YsU0FBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLEVBQUo7RUFDWCxFQUFBLEdBQUssSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULEVBQWEsRUFBYjtFQUNMLENBQUEsR0FBSSxDQUFBLEdBQUk7RUFDUixDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYO0VBQ0osQ0FBQSxHQUFJLENBQUEsR0FBSTtBQUNSLFNBQU87QUFMSTs7QUFPTjs7O0VBRVEseUJBQUE7Ozs7OztJQUNaLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQyxDQUFDLFFBQUYsQ0FBWSxJQUFDLENBQUEsVUFBYixFQUF5QixHQUF6QixFQUE4QjtNQUFDLE9BQUEsRUFBUyxLQUFWO01BQWlCLFFBQUEsRUFBVSxLQUEzQjtLQUE5QjtJQUNiLGtEQUFBLFNBQUE7QUFDQTtFQUhZOzs0QkFLYixNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7V0FBQTtZQUFBLEVBQUE7VUFBQSxRQUFBLEdBQVEsQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUQsS0FBdUIsT0FBL0I7VUFDQSxVQUFBLEdBQVUsQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUQsS0FBdUIsT0FEakM7OztFQURPOzs0QkFNUixLQUFBLEdBQU8sU0FBRSxJQUFGO0FBQ04sUUFBQTtJQUFBLElBQUEsR0FBTyxDQUFBLENBQUcsSUFBSSxDQUFDLGFBQVI7SUFDUCxJQUFHLElBQUksQ0FBQyxJQUFMLEtBQWEsU0FBaEI7QUFDQyxjQUFPLElBQUksQ0FBQyxPQUFaO0FBQUEsYUFDTSxRQUFRLENBQUMsRUFEZjtVQUVFLElBQUMsQ0FBQSxPQUFELENBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksTUFBWixDQUFWLEVBQWdDLElBQWhDO0FBQ0E7QUFIRixhQUlNLFFBQVEsQ0FBQyxJQUpmO1VBS0UsSUFBQyxDQUFBLE9BQUQsQ0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxNQUFaLENBQUEsR0FBdUIsQ0FBQyxDQUFsQyxFQUFxQyxJQUFyQztBQUNBO0FBTkYsYUFPTSxRQUFRLENBQUMsS0FQZjtVQVFFLElBQUMsQ0FBQSxNQUFELENBQUE7QUFDQTtBQVRGLE9BREQ7O0lBWUEsSUFBRyxJQUFJLENBQUMsSUFBTCxLQUFhLE9BQWhCO01BQ0MsRUFBQSxHQUFLLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQXpCLENBQWtDLGdCQUFsQyxFQUFvRCxFQUFwRDtNQUNMLEVBQUEsR0FBSyxRQUFBLENBQVUsRUFBVixFQUFjLEVBQWQ7TUFFTCxJQUFDLENBQUEsU0FBRCxDQUFZLEVBQVosRUFBZ0IsSUFBaEIsRUFKRDs7RUFkTTs7NEJBcUJQLE9BQUEsR0FBUyxTQUFFLE1BQUYsRUFBVSxFQUFWO0FBQ1IsUUFBQTs7TUFEa0IsS0FBSyxJQUFDLENBQUE7O0lBQ3hCLEVBQUEsR0FBSyxFQUFFLENBQUMsR0FBSCxDQUFBO0lBQ0wsSUFBRyxlQUFJLEVBQUUsQ0FBRSxnQkFBWDtNQUNDLEVBQUEsR0FBSyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxPQUFaLEVBRE47S0FBQSxNQUFBO01BR0MsRUFBQSxHQUFLLFFBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZCxFQUhOOztJQUtBLElBQUMsQ0FBQSxVQUFELENBQWEsRUFBQSxHQUFLLE1BQWxCLEVBQTBCLEVBQTFCO0VBUFE7OzRCQVVULFFBQUEsR0FBVSxTQUFBO0FBQ1QsUUFBQTtJQUFBLEVBQUEsR0FBSyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtJQUNMLElBQUcsZUFBSSxFQUFFLENBQUUsZ0JBQVg7QUFDQyxhQUFPLEtBRFI7O0lBR0EsR0FBQSxHQUFNLFFBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZDtJQUNOLElBQUcsS0FBQSxDQUFPLEdBQVAsQ0FBSDtBQUNDLGFBQU8sS0FEUjs7QUFHQSxXQUFPLElBQUMsQ0FBQSxpQkFBRCxDQUFvQixFQUFwQjtFQVRFOzs0QkFXVixVQUFBLEdBQVksU0FBRSxFQUFGLEVBQU0sRUFBTjtBQUNYLFFBQUE7O01BRGlCLEtBQUssSUFBQyxDQUFBOztJQUN2QixJQUFHLEtBQUEsQ0FBTyxFQUFQLENBQUg7QUFFQyxhQUZEOztJQUlBLEtBQUEsR0FBUSxFQUFFLENBQUMsR0FBSCxDQUFBO0lBRVIsRUFBQSxHQUFLLElBQUMsQ0FBQSxpQkFBRCxDQUFvQixFQUFwQjtJQUNMLElBQUcsS0FBQSxLQUFTLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBWjtNQUNDLEVBQUUsQ0FBQyxHQUFILENBQVEsRUFBUixFQUREOztFQVJXOzs0QkFZWixpQkFBQSxHQUFtQixTQUFFLE1BQUY7QUFDbEIsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxLQUFaO0lBQ04sR0FBQSxHQUFNLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLEtBQVo7SUFDTixJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksTUFBWjtJQUdQLElBQUcsR0FBQSxHQUFNLEdBQVQ7TUFDQyxJQUFBLEdBQU87TUFDUCxHQUFBLEdBQU07TUFDTixHQUFBLEdBQU0sS0FIUDs7SUFNQSxJQUFHLGFBQUEsSUFBUyxNQUFBLEdBQVMsR0FBckI7QUFDQyxhQUFPLElBRFI7O0lBRUEsSUFBRyxhQUFBLElBQVMsTUFBQSxHQUFTLEdBQXJCO0FBQ0MsYUFBTyxJQURSOztJQUlBLElBQUcsSUFBQSxLQUFVLENBQWI7TUFDQyxNQUFBLEdBQVMsT0FBQSxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFEVjs7SUFJQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBVSxDQUFWLEVBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxDQUFVLENBQUEsR0FBRSxJQUFaLENBQUEsR0FBcUIsSUFBSSxDQUFDLEdBQUwsQ0FBVSxFQUFWLENBQWhDLENBQWI7SUFDYixJQUFHLFVBQUEsR0FBYSxDQUFoQjtNQUNDLE1BQUEsR0FBUyxTQUFBLENBQVcsTUFBWCxFQUFtQixVQUFuQixFQURWO0tBQUEsTUFBQTtNQUdDLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFZLE1BQVosRUFIVjs7QUFLQSxXQUFPO0VBNUJXOzs7O0dBbkVVLE9BQUEsQ0FBUyxRQUFUOztBQWtHOUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNoSGpCLElBQUEsMkZBQUE7RUFBQTs7OztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVMseUJBQVQ7O0FBQ2IsUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFFTDs7Ozs7Ozs7eUJBQ0wsS0FBQSxHQUFPLFNBQUUsSUFBRjtBQUNOLFFBQUE7SUFBQSxFQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOLENBQUEsR0FBa0IsR0FBbEIsR0FBd0IsSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOO0lBQzlCLEtBQUEsR0FBUSxFQUFFLENBQUMsV0FBSCxDQUFBLENBQWdCLENBQUMsT0FBakIsQ0FBMEIsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUExQjtBQUNSLFdBQU8sS0FBQSxJQUFTO0VBSFY7Ozs7R0FEbUIsVUFBVSxDQUFDLFNBQVMsQ0FBQzs7QUFNMUM7Ozs7Ozs7MEJBQ0wsS0FBQSxHQUFPOzs7O0dBRG9COztBQUl0Qjs7Ozs7Ozs7O3dCQUNMLFdBQUEsR0FBYTs7d0JBQ2IsUUFBQSxHQUFVLFNBQUE7QUFDVCxXQUFPLElBQUMsQ0FBQSxHQUFELENBQU0sT0FBTixDQUFBLElBQW1CLElBQUMsQ0FBQSxHQUFELENBQU0sTUFBTixDQUFuQixJQUFxQztFQURuQzs7d0JBR1YsS0FBQSxHQUFPLFNBQUUsSUFBRjtBQUNOLFFBQUE7SUFBQSxFQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOLENBQUEsR0FBa0IsR0FBbEIsR0FBd0IsSUFBQyxDQUFBLEdBQUQsQ0FBTSxPQUFOO0lBQzlCLEtBQUEsR0FBUSxFQUFFLENBQUMsV0FBSCxDQUFBLENBQWdCLENBQUMsT0FBakIsQ0FBMEIsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUExQjtBQUNSLFdBQU8sS0FBQSxJQUFTO0VBSFY7Ozs7R0FMa0IsUUFBUSxDQUFDOztBQVU3Qjs7Ozs7Ozt5QkFDTCxLQUFBLEdBQU87Ozs7R0FEbUIsT0FBQSxDQUFTLDJCQUFUOztBQUdyQjs7OzBCQUVMLGFBQUEsR0FBZSxPQUFBLENBQVMsaUNBQVQ7OzBCQUVmLFVBQUEsR0FDQztJQUFBLEtBQUEsRUFBTyxHQUFQO0lBQ0EsS0FBQSxFQUFPLEdBRFA7OzswQkFHRCxXQUFBLEdBQWE7OzBCQUViLE9BQUEsR0FBUzs7RUFFSSx1QkFBRSxPQUFGOzs7Ozs7Ozs7Ozs7OztJQUNaLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFHLGtDQUFIO01BQ0MsSUFBQyxDQUFBLFdBQUQsR0FBZSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQWQsQ0FBbUIsT0FBbkIsRUFEaEI7O0lBRUEsT0FBTyxDQUFDLE1BQVIsR0FBaUI7SUFDakIsSUFBRyxtQ0FBSDtNQUNDLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLE9BQUEsQ0FBUyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQWQsQ0FBbUIsUUFBbkIsQ0FBVCxFQURsQjs7SUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSx1QkFBRCxDQUEwQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQWQsQ0FBbUIsU0FBbkIsQ0FBMUI7SUFFZCxJQUFHLENBQUksT0FBTyxDQUFDLE1BQVosSUFBdUIsSUFBQyxDQUFBLFdBQUQsSUFBZ0IsQ0FBMUM7TUFDQyxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FENUI7O0lBR0EsK0NBQU8sT0FBUDtJQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFXLFFBQVgsRUFBcUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFFLEdBQUYsRUFBTyxJQUFQO1FBQ3BCLElBQUcsSUFBSSxDQUFDLE1BQVI7VUFDQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVosQ0FBQSxFQUREOztRQUVBLEtBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFpQixHQUFqQjtRQUNBLEtBQUMsQ0FBQSxPQUFELENBQVUsU0FBVixFQUFxQixHQUFyQjtNQUpvQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7QUFNQTtFQXJCWTs7MEJBdUJiLFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLFFBQUQsR0FBWTtBQUNaLFdBQU8sK0NBQUEsU0FBQTtFQUZJOzswQkFJWixNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxNQUFBLEdBQVMsMkNBQUEsU0FBQTtJQUVULE1BQVEsQ0FBQSxhQUFBLEdBQWMsSUFBQyxDQUFBLEdBQWYsQ0FBUixHQUFpQztBQUNqQyxXQUFPO0VBSkE7OzBCQU1SLEtBQUEsR0FBTyxTQUFFLElBQUY7QUFFTixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBQ1YsSUFBRyxJQUFDLENBQUEsUUFBSjtNQUNDLE9BQUEsR0FBVSxLQURYOztJQUdBLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFHLElBQUMsQ0FBQSxPQUFKOztRQUNDLElBQUksQ0FBRSxjQUFOLENBQUE7OztRQUNBLElBQUksQ0FBRSxlQUFOLENBQUE7O01BQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtBQUNBLGFBSkQ7O0lBTUEsb0NBQVMsQ0FBRSxHQUFSLENBQWEsUUFBYixVQUFIO0FBQ0MsYUFBTywwQ0FBQSxTQUFBLEVBRFI7O0lBR0EsSUFBRyxPQUFBLElBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLElBQWtCLENBQWpDO01BQ0MsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQUEsRUFERDs7QUFFQSxXQUFPLDBDQUFBLFNBQUE7RUFsQkQ7OzBCQW9CUCxLQUFBLEdBQU8sU0FBRSxJQUFGO0FBQ04sUUFBQTtJQUFBLElBQUcsNkNBQUg7TUFDQyxHQUFBLHVDQUFzQixDQUFFLElBQWxCLENBQXdCLElBQXhCLFdBRFA7S0FBQSxNQUVLLElBQUcsWUFBSDtNQUNKLEdBQUEsR0FBTSxLQURGOztJQUVMLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBYSxHQUFiO0lBQ1AsSUFBRyxZQUFIO01BQ0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWdCLEdBQWhCO01BQ0EsbUJBQUcsSUFBSSxDQUFFLEdBQU4sQ0FBVyxRQUFYLFVBQUg7UUFDQyxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBb0IsR0FBcEIsRUFERDtPQUZEOztFQU5NOzswQkFZUCxPQUFBLEdBQVMsU0FBRSxJQUFGO0FBQ1IsUUFBQTtJQUFBLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixHQUFBLHVDQUFzQixDQUFFLElBQWxCLENBQXdCLElBQXhCO0lBQ04sRUFBQSxHQUFLLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWEsR0FBYixDQUFrQixDQUFDLEdBQW5CLENBQXdCLE9BQXhCO0lBRWpCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFnQixHQUFoQjtJQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFvQixHQUFwQjtJQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFBO0lBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxFQUFSO0VBVFE7OzBCQVlULGVBQUEsR0FBaUIsU0FBQTtBQUNoQixRQUFBO0lBQUEsS0FBQSxHQUFRLG9EQUFBLFNBQUE7SUFDUix1Q0FBWSxDQUFFLGVBQWQ7TUFDQyxLQUFLLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQTtNQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZLEtBRmI7O0FBR0EsV0FBTztFQUxTOzswQkFPakIsWUFBQSxHQUFjLFNBQUUsV0FBRjtBQUNiLFFBQUE7O01BRGUsY0FBYzs7SUFDN0IsSUFBRyxXQUFIO0FBQ0MsYUFBTyxZQURSOztJQUVBLEtBQUEsR0FBUTtBQUNSO0FBQUEsU0FBQSxpREFBQTs7TUFDQyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUMsQ0FBQSxhQUFELENBQWdCO1FBQUEsR0FBQSxFQUFLLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBTDtRQUF1QixFQUFBLEVBQUksS0FBSyxDQUFDLEVBQWpDO1FBQXFDLE1BQUEsRUFBUSxLQUFLLENBQUMsR0FBTixDQUFXLFFBQVgsQ0FBN0M7T0FBaEIsQ0FBWDtBQUREO0FBR0EsV0FBTyxNQUFBLEdBQVMsS0FBSyxDQUFDLElBQU4sQ0FBWSxXQUFaLENBQVQsR0FBcUM7RUFQL0I7OzBCQVVkLE9BQUEsR0FBUyxTQUFBO0lBQ1IsSUFBRyxJQUFDLENBQUEsV0FBRCxJQUFnQixDQUFuQjtBQUNDLGFBQU8sTUFEUjs7QUFFQSxXQUFPLENBQUUsSUFBQyxDQUFBLE1BQUQsSUFBVyxFQUFiLENBQWdCLENBQUMsTUFBakIsSUFBMkIsSUFBQyxDQUFBO0VBSDNCOzswQkFLVCxNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFKO0FBQ0MsYUFERDs7SUFHQSxJQUFHLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBSDtBQUNDLGFBREQ7O0lBR0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLE9BQVo7SUFDUixJQUFHLGVBQUEsSUFBVyxDQUFJLENBQUMsQ0FBQyxPQUFGLENBQVcsS0FBWCxDQUFsQjtNQUNDLEtBQUEsR0FBUSxDQUFFLEtBQUYsRUFEVDs7SUFFQSxJQUFHLGtCQUFJLEtBQUssQ0FBRSxnQkFBZDtBQUNDLGFBREQ7O0FBR0E7QUFBQSxTQUFBLHFDQUFBOztNQUNDLElBQUEsR0FBTyxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBaUIsSUFBakI7TUFDUCxJQUFPLFlBQVA7UUFDQyxJQUFBLEdBQVcsSUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBbUI7VUFBQSxLQUFBLEVBQU8sSUFBUDtVQUFhLE1BQUEsRUFBUSxJQUFyQjtTQUFuQixFQURaOztNQUVBLElBQUMsQ0FBQSxRQUFELENBQVcsSUFBWDtBQUpEO0lBTUEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtFQW5CTzs7MEJBc0JSLE1BQUEsR0FBUSxTQUFFLEtBQUY7SUFDUCxJQUFHLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBSDtNQUlDLDJDQUFBLFNBQUE7QUFDQSxhQUxEOztJQU1BLDJDQUFBLFNBQUE7RUFQTzs7MEJBVVIsVUFBQSxHQUFZLFNBQUE7V0FDWDtNQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBZSxPQUFmLENBQVA7O0VBRFc7OzBCQUdaLFlBQUEsR0FBYyxTQUFFLElBQUY7QUFDYixRQUFBO0lBQUEsSUFBSSxDQUFDLGNBQUwsQ0FBQTtJQUNBLElBQUksQ0FBQyxlQUFMLENBQUE7SUFDQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO0lBQ2hCLDRCQUFHLGFBQWEsQ0FBRSxlQUFsQjtNQUNDLElBQUMsQ0FBQSxZQUFELENBQUE7QUFDQSxhQUFPLEtBRlI7O0lBR0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtBQUNBLFdBQU87RUFSTTs7MEJBVWQsdUJBQUEsR0FBeUIsU0FBRSxPQUFGO0FBQ3hCLFFBQUE7SUFBQSxJQUFHLENBQUMsQ0FBQyxVQUFGLENBQWMsT0FBZCxDQUFIO01BQ0MsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLEtBQUEsR0FBWSxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVUsRUFBVjtNQUVaLFVBQUEsQ0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDWCxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF3QixTQUF4QjtpQkFDQSxPQUFBLENBQVEsS0FBQyxDQUFBLE1BQVQsRUFBaUIsS0FBQyxDQUFBLEtBQWxCLEVBQXlCLFNBQUUsS0FBRjtBQUN4QixnQkFBQTtBQUFBLGlCQUFBLG1EQUFBOztjQUNDLEtBQU0sQ0FBQSxHQUFBLENBQU4sR0FBYSxDQUFDLENBQUMsTUFBRixDQUFVLEVBQVYsRUFBYyxLQUFDLENBQUEsVUFBZixFQUEyQixJQUEzQixFQUFpQztnQkFBRSxNQUFBLEVBQVEsS0FBVjtlQUFqQztBQURkO1lBRUEsS0FBSyxDQUFDLEdBQU4sQ0FBVyxLQUFYO1lBQ0EsS0FBQyxDQUFBLE9BQUQsR0FBVztZQUNYLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxXQUFkLENBQTJCLFNBQTNCO1lBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQU53QixDQUF6QjtRQUZXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBV0UsQ0FYRjtBQVlBLGFBQU8sTUFoQlI7O0lBa0JBLEtBQUEsR0FBUTtBQUNSLFNBQUEseUNBQUE7O01BQ0MsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFZLEdBQVosQ0FBQSxJQUFxQixDQUFDLENBQUMsUUFBRixDQUFZLEdBQVosQ0FBeEI7UUFDQyxLQUFLLENBQUMsSUFBTixDQUFXO1VBQUUsS0FBQSxFQUFPLEdBQVQ7VUFBYyxLQUFBLEVBQU8sR0FBckI7U0FBWCxFQUREO09BQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBWCxDQUFIO1FBQ0osS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLENBQUMsTUFBRixDQUFVLEVBQVYsRUFBYyxJQUFDLENBQUEsVUFBZixFQUEyQixHQUEzQixDQUFYLEVBREk7O0FBSE47QUFLQSxXQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBVSxLQUFWO0VBekJhOzs7O0dBNUpFLE9BQUEsQ0FBUyxhQUFUOztBQXdMNUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUNsTmpCLElBQUEsZUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFDTCxRQUFBLEdBQVUsT0FBQSxDQUFTLHlCQUFUOzs0QkFFVixNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxNQUFBLEdBQVMsNkNBQUEsU0FBQTtJQUVULE1BQVEsQ0FBQSxPQUFBLEdBQU8sQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUQsQ0FBUCxDQUFSLEdBQXlDO0FBQ3pDLFdBQU87RUFKQTs7NEJBTVIsTUFBQSxHQUFRLFNBQUE7QUFDUCxRQUFBO0lBQUEsNkNBQUEsU0FBQTtJQUNBLHFEQUE0QixDQUFFLGVBQTlCO01BQ0MsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxXQUFYO01BQ1QsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxDQUFYO01BQ1IsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxTQUFBLEdBQVUsSUFBQyxDQUFBLEdBQVgsR0FBZSxJQUExQjtNQUNWLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWlCO1FBQUUsS0FBQSxFQUFPLE1BQVQ7T0FBakIsQ0FBb0MsQ0FBQyxJQUFyQyxDQUEyQyxTQUEzQztNQUNiLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFZLGVBQVosRUFBNkIsSUFBQyxDQUFBLFdBQTlCLEVBTEQ7O0VBRk87OzRCQVVSLFlBQUEsR0FBYyxTQUFFLFdBQUY7QUFDYixRQUFBOztNQURlLGNBQWM7O0lBQzdCLElBQUcsV0FBSDtBQUNDLGFBQU8sR0FEUjs7SUFFQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUVQLEVBQUEsR0FBSztJQUNMLElBQTZCLHFCQUE3QjtNQUFBLEVBQUEsSUFBTSxJQUFJLENBQUMsUUFBTCxHQUFnQixJQUF0Qjs7SUFDQSxFQUFBLElBQU0sSUFBSSxDQUFDO0lBQ1gsRUFBQSxJQUFNO0FBRU4sV0FBTztFQVZNOzs0QkFZZCxLQUFBLEdBQU8sU0FBRSxJQUFGO0lBQ04sSUFBRyxtQkFBSDtNQUNDLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFpQixTQUFqQjtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUhYOztJQUlBLDRDQUFBLFNBQUE7RUFMTTs7NEJBUVAsTUFBQSxHQUFRLFNBQUUsSUFBRjtBQUNQLFFBQUE7SUFBQSxTQUFBLEdBQVksQ0FBQztJQUNiLG1CQUFHLElBQUksQ0FBRSxzQkFBVDtNQUNDLFNBQUEsa0NBQWlCLENBQUUsdUJBQVAsZ0JBQWdDLElBQUksQ0FBRSxzQkFBdEM7TUFDWixJQUFHLFNBQUEsS0FBYSxFQUFoQjtBQUNDLGVBREQ7T0FGRDs7SUFJQSxvQkFBRyxJQUFJLENBQUUsY0FBTixLQUFjLFVBQWQsSUFBNkIsU0FBQSxLQUFlLEVBQS9DO01BQ0MsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFELENBQUE7TUFDUCxJQUFHLFlBQUg7UUFDQyxJQUFDLENBQUEsR0FBRCxDQUFNLElBQU4sRUFBWSxJQUFaO0FBQ0EsZUFGRDs7TUFHQSxJQUFDLENBQUEsS0FBRCxDQUFBO0FBQ0EsYUFORDs7SUFPQSxJQUFHLG9EQUFIO01BQ0MsT0FBQSxHQUFVLElBQUMsQ0FBQSxFQUFFLENBQUMsdUJBQUosZ0JBQTZCLElBQUksQ0FBRSxzQkFBbkM7TUFDVixJQUFHLENBQUksQ0FBRSxPQUFBLEtBQVcsQ0FBWCxJQUFnQixPQUFBLEdBQVUsRUFBVixJQUFnQixDQUFsQyxDQUFQO1FBQ0MsSUFBSSxDQUFDLGVBQUwsQ0FBQTtBQUNBLGVBRkQ7T0FGRDs7SUFLQSxJQUFHLGNBQUEsSUFBVSxpQkFBRSxJQUFJLENBQUUsdUJBQU4sS0FBdUIsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUF2QixvQkFBdUMsSUFBSSxDQUFFLHVCQUFOLHlDQUE4QixDQUFFLEdBQVQsQ0FBYSxDQUFiLFdBQWhFLENBQWI7TUFDQyxJQUFJLENBQUMsZUFBTCxDQUFBO0FBQ0EsYUFGRDs7SUFHQSxJQUFHLG1CQUFIO01BQ0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVk7UUFBRSxRQUFBLEVBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQUEsQ0FBWjtPQUFaLEVBREQ7O0lBRUEsNkNBQUEsU0FBQTtFQXZCTzs7NEJBMkJSLFdBQUEsR0FBYSxTQUFBO0lBQ1osSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLElBQUMsQ0FBQSxLQUFELENBQUE7RUFGWTs7NEJBS2IsS0FBQSxHQUFPLFNBQUUsR0FBRjs7TUFBRSxNQUFNOztJQUNkLElBQUcscUJBQUEsSUFBYSxDQUFJLElBQUMsQ0FBQSxVQUFyQjtNQUNDLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFpQixNQUFqQjtBQUNBLGFBRkQ7O0lBR0EsNENBQUEsU0FBQTtJQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBO0VBTE07OzRCQVFQLE1BQUEsR0FBUSxTQUFFLEtBQUY7QUFDUCxRQUFBO0lBQUEsT0FBQSw0Q0FBeUIsQ0FBRSxHQUFqQixDQUFzQixPQUF0QjtJQUNWLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQTtJQUNULElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZO01BQUEsS0FBQSxFQUFPLE9BQVA7S0FBWjtJQUNBLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBZixDQUFBLENBQXNCLENBQUMsSUFBdkIsQ0FBNkIsSUFBQyxDQUFBLFlBQUQsQ0FBZSxJQUFmLENBQTdCO0lBQ0EsNkNBQUEsU0FBQTtFQUxPOzs0QkFRUixlQUFBLEdBQWlCLFNBQUE7QUFDaEIsV0FBTyxDQUFDLENBQUMsTUFBRixDQUFVLHNEQUFBLFNBQUEsQ0FBVixFQUFpQjtNQUFFLFNBQUEsRUFBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxXQUFaLENBQWI7TUFBd0MsUUFBQSxFQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFVBQVosQ0FBbEQ7S0FBakI7RUFEUzs7NEJBR2pCLFlBQUEsR0FBYyxTQUFFLElBQUY7QUFFYixRQUFBO0lBQUEscURBQTRCLENBQUUsZUFBOUI7TUFDQyxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFVLElBQUksQ0FBQyxNQUFmLENBQUEsSUFBNEIsSUFBSSxDQUFDLFFBQXBDO1FBQ0MsSUFBSSxDQUFDLGVBQUwsQ0FBQTtRQUNBLElBQUksQ0FBQyxjQUFMLENBQUE7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQTtBQUNBLGVBQU8sTUFKUjs7TUFNQSxJQUFHLENBQUUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBdEIsQ0FBMEIsSUFBSSxDQUFDLE1BQS9CLENBQUEsSUFBMkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBdEIsQ0FBZ0MsdUJBQWhDLENBQTdDLENBQUEsSUFBNkcsQ0FBSSxJQUFJLENBQUMsUUFBekg7UUFDQyxJQUFJLENBQUMsZUFBTCxDQUFBO1FBQ0EsSUFBSSxDQUFDLGNBQUwsQ0FBQTtRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBLENBQWEsQ0FBQyxNQUFkLENBQUE7QUFDQSxlQUFPLE1BSlI7T0FQRDs7SUFhQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBQTtJQUNQLElBQUksQ0FBQyxjQUFMLENBQUE7SUFDQSxJQUFJLENBQUMsZUFBTCxDQUFBO0lBQ0EsSUFBRyxDQUFJLEtBQUEsQ0FBTyxJQUFQLENBQVA7TUFDQyxJQUFDLENBQUEsTUFBRCxDQUFTLElBQVQsRUFERDs7QUFFQSxXQUFPO0VBcEJNOzs0QkFzQmQsVUFBQSxHQUFZLFNBQUE7QUFDWCxRQUFBO0lBQUEsSUFBRyxxQkFBQSxJQUFZLG9DQUFmO01BQ0MsSUFBQSxHQUNDO1FBQUEsS0FBQSxFQUFPLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBUDtRQUNBLFFBQUEsb0NBQWlCLENBQUUsR0FBVCxDQUFBLFdBQUEsSUFBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksVUFBWixDQUQ1QjtRQUZGO0tBQUEsTUFBQTtNQUtDLElBQUEsR0FDQztRQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVA7UUFORjs7QUFPQSxXQUFPO0VBUkk7Ozs7R0FoSGlCLE9BQUEsQ0FBUyxlQUFUOztBQTRIOUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUM1SGpCLElBQUEsY0FBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBQ0wsUUFBQSxHQUFVLE9BQUEsQ0FBUyx3QkFBVDs7MkJBRVYsZUFBQSxHQUFpQixTQUFFLEdBQUY7O01BQUUsTUFBTTs7QUFDeEIsV0FBTyxRQUFBLEdBQVMsSUFBQyxDQUFBLEdBQVYsR0FBZ0I7RUFEUDs7MkJBR2pCLE1BQUEsR0FBUSxTQUFBO0FBQ1AsUUFBQTtXQUFBO1lBQUEsRUFBQTtVQUFBLFFBQUEsR0FBUSxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBRCxLQUF1QixPQUEvQjtVQUNBLFVBQUEsR0FBVSxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBRCxLQUF1QixPQURqQztVQUVBLFFBQUEsR0FBUSxDQUFDLElBQUMsQ0FBQSxlQUFELENBQWtCLEtBQWxCLENBQUQsS0FBOEIsT0FGdEM7VUFHQSxVQUFBLEdBQVUsQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFrQixLQUFsQixDQUFELEtBQThCLE9BSHhDO1VBSUEsT0FBQSxHQUFPLENBQUMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFELEtBQXVCLFFBSjlCO1VBS0EsT0FBQSxHQUFPLENBQUMsSUFBQyxDQUFBLGVBQUQsQ0FBa0IsS0FBbEIsQ0FBRCxLQUE4QixRQUxyQztVQU1BLFlBQUEsR0FBWSxDQUFDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBRCxLQUF1QixVQU5uQztVQU9BLFlBQUEsR0FBWSxDQUFDLElBQUMsQ0FBQSxlQUFELENBQWtCLEtBQWxCLENBQUQsS0FBOEIsVUFQMUM7OztFQURPOzsyQkFVUixZQUFBLEdBQWMsU0FBRSxXQUFGO0FBQ2IsUUFBQTs7TUFEZSxjQUFjOztJQUM3QixJQUFHLFdBQUg7QUFDQyxhQUFPLEdBRFI7O0lBRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFELENBQUE7QUFDUCxXQUFPLE1BQUEsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVgsQ0FBaUIsS0FBakIsQ0FBUixHQUFtQztFQUo3Qjs7MkJBTWQsTUFBQSxHQUFRLFNBQUE7SUFDUCw0Q0FBQSxTQUFBO0lBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxJQUFDLENBQUEsZUFBRCxDQUFrQixLQUFsQixDQUFYO0VBRkg7OzJCQUtSLEtBQUEsR0FBTyxTQUFFLEdBQUY7O01BQUUsTUFBTTs7SUFDZCwyQ0FBQSxTQUFBO0lBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7RUFGTTs7MkJBS1AsUUFBQSxHQUFVLFNBQUUsSUFBRjtJQUNULElBQUksQ0FBQyxhQUFhLENBQUMsS0FBbkIsQ0FBQTtFQURTOzsyQkFJVixNQUFBLEdBQVEsU0FBRSxLQUFGO0FBQ1AsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQSxDQUFlLENBQUMsR0FBaEIsQ0FBcUIsT0FBckI7SUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWTtNQUFBLEtBQUEsRUFBTyxPQUFQO0tBQVo7SUFDQSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWYsQ0FBQSxDQUFzQixDQUFDLElBQXZCLENBQTZCLElBQUMsQ0FBQSxZQUFELENBQWUsSUFBZixDQUE3QjtJQUNBLDRDQUFBLFNBQUE7RUFKTzs7MkJBT1IsTUFBQSxHQUFRLFNBQUUsSUFBRjtJQUNQLElBQUcsY0FBQSxJQUFVLGlCQUFFLElBQUksQ0FBRSx1QkFBTixLQUF1QixJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQXZCLG9CQUF1QyxJQUFJLENBQUUsdUJBQU4sS0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksQ0FBWixDQUFoRSxDQUFiO01BQ0MsSUFBSSxDQUFDLGVBQUwsQ0FBQTtBQUNBLGFBRkQ7O0lBT0EsNENBQUEsU0FBQTtFQVJPOzsyQkFXUixLQUFBLEdBQU8sU0FBQTtBQUNOO01BQ0MsSUFBQyxDQUFBLENBQUQsQ0FBSSxXQUFKLENBQWlCLENBQUMsTUFBbEIsQ0FBQSxFQUREO0tBQUE7SUFFQSwyQ0FBQSxTQUFBO0VBSE07OzJCQU1QLFVBQUEsR0FBWSxTQUFBO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FDQztNQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVA7O0FBQ0QsV0FBTztFQUhJOzsyQkFLWixRQUFBLEdBQVUsU0FBQTtBQUNULFFBQUE7SUFBQSxNQUFBLEdBQVMsOENBQUEsU0FBQTtJQUNULEVBQUEsR0FBSyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBQTtJQUNMLElBQUcsZUFBSSxFQUFFLENBQUUsZ0JBQVg7QUFDQyxhQUFPLEtBRFI7O0lBRUEsSUFBQSxHQUFPLFFBQUEsQ0FBVSxJQUFDLENBQUEsaUJBQUQsQ0FBb0IsRUFBcEIsQ0FBVixFQUFtQyxFQUFuQztBQUVQLFdBQU8sQ0FBRSxNQUFGLEVBQVUsSUFBVjtFQVBFOzsyQkFTVixZQUFBLEdBQWMsU0FBRSxJQUFGO0FBRWIsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVUsSUFBSSxDQUFDLE1BQWYsQ0FBQSxJQUE0QixDQUFJLElBQUksQ0FBQyxRQUF4QztNQUNDLElBQUksQ0FBQyxlQUFMLENBQUE7TUFDQSxJQUFJLENBQUMsY0FBTCxDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQUEsQ0FBZSxDQUFDLE1BQWhCLENBQUE7QUFDQSxhQUFPLE1BSlI7O0lBTUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBWSxJQUFJLENBQUMsTUFBakIsQ0FBQSxJQUE4QixJQUFJLENBQUMsUUFBdEM7TUFDQyxJQUFJLENBQUMsZUFBTCxDQUFBO01BQ0EsSUFBSSxDQUFDLGNBQUwsQ0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBLENBQWEsQ0FBQyxNQUFkLENBQUE7QUFDQSxhQUFPLE1BSlI7O0lBTUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFELENBQUE7SUFDUCxvQkFBRyxJQUFJLENBQUUsZ0JBQU4sSUFBZ0IsQ0FBbkI7TUFDQyxJQUFJLENBQUMsY0FBTCxDQUFBO01BQ0EsSUFBSSxDQUFDLGVBQUwsQ0FBQTtNQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7QUFDQSxhQUFPLEtBSlI7O0FBT0EsV0FBTztFQXRCTTs7OztHQTFFYyxPQUFBLENBQVMsZUFBVDs7QUFvRzdCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDcEdqQixJQUFBLHlCQUFBO0VBQUE7Ozs7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFFTDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBQ0wsUUFBQSxHQUFVLE9BQUEsQ0FBUyx5QkFBVDs7NEJBRVYsZ0JBQUEsR0FBaUI7OzRCQUdqQixpQkFBQSxHQUVDO0lBQUEsS0FBQSxFQUFPLE1BQVA7SUFDQSxRQUFBLEVBQVUsS0FEVjs7OzRCQUdELFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUMsQ0FBQSxjQUFELENBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFNBQVosQ0FBakI7SUFDckIsaURBQUEsU0FBQTtFQUZXOzs0QkFLWixNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxJQUE4QyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxVQUFaLENBQTlDO01BQUEsTUFBUSxDQUFBLHFCQUFBLENBQVIsR0FBa0MsU0FBbEM7O0FBQ0EsV0FBTztFQUhBOzs0QkFLUixlQUFBLEdBQWlCLFNBQUE7QUFDaEIsV0FBTyxTQUFBLEdBQVUsSUFBQyxDQUFBO0VBREY7OzRCQUdqQixNQUFBLEdBQVEsU0FBQTtJQUNQLDZDQUFBLFNBQUE7SUFDQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFFBQVosQ0FBSDtNQUNDLElBQUMsQ0FBQSxZQUFELENBQUEsRUFERDs7RUFGTzs7NEJBTVIsS0FBQSxHQUFPLFNBQUE7SUFFTixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxjQUFaLEVBQTRCLEtBQTVCO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQXBCLENBQUE7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQTtBQUdBLFdBQU8sNENBQUEsU0FBQTtFQVJEOzs0QkFVUCxPQUFBLEdBQVMsU0FBQTtJQUNSLElBQUcsSUFBQyxDQUFBLFdBQUQsSUFBZ0IsQ0FBbkI7QUFDQyxhQUFPLE1BRFI7O0FBRUEsV0FBTyxDQUFFLElBQUMsQ0FBQSxNQUFELElBQVcsRUFBYixDQUFnQixDQUFDLE1BQWpCLElBQTJCLElBQUMsQ0FBQTtFQUgzQjs7NEJBS1QsTUFBQSxHQUFRLFNBQUUsS0FBRjtBQUNQLFFBQUE7SUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBSDtBQUNDLGFBREQ7O0lBR0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFlLE9BQWY7SUFDWCxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWTtNQUFBLEtBQUEsRUFBTyxRQUFQO0tBQVo7SUFHQSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWYsQ0FBQTtJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQXBCLENBQUE7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBO0lBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztBQUVYLFdBQU8sNkNBQUEsU0FBQTtFQWRBOzs0QkFnQlIsY0FBQSxHQUFnQixTQUFFLEtBQUY7QUFDZixRQUFBOztNQURpQixRQUFROztJQUN6QixJQUFHLENBQUksS0FBSixJQUFhLENBQUksS0FBSyxDQUFDLE1BQTFCO0FBQ0MsYUFBTyxNQURSOztBQUVBLFNBQUEsdUNBQUE7O01BQ0MsSUFBRyxrQkFBQSxJQUFjLENBQUMsQ0FBQyxRQUFGLENBQVksRUFBRSxDQUFDLEtBQWYsQ0FBakI7QUFDQyxlQUFPLE1BRFI7O01BRUEsSUFBRyxlQUFBLElBQVcsQ0FBQyxDQUFDLFFBQUYsQ0FBWSxFQUFFLENBQUMsRUFBZixDQUFkO0FBQ0MsZUFBTyxNQURSOztNQUVBLElBQUcsWUFBQSxJQUFRLENBQUMsQ0FBQyxRQUFGLENBQVksRUFBWixDQUFYO0FBQ0MsZUFBTyxNQURSOztBQUxEO0FBUUEsV0FBTztFQVhROzs0QkFhaEIsWUFBQSxHQUFjLFNBQUE7QUFFYixRQUFBO0lBQUEsSUFBTyxvQkFBUDtNQUNDLEtBQUEsR0FBUSxDQUFDLENBQUMsTUFBRixDQUFVLEVBQVYsRUFBYyxJQUFDLENBQUEsaUJBQWYsRUFBa0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksTUFBWixDQUFsQyxFQUF3RDtRQUFFLFFBQUEsRUFBVSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxVQUFaLENBQUEsSUFBNEIsS0FBeEM7T0FBeEQsRUFBeUcsSUFBQyxDQUFBLGdCQUExRztNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFlLEtBQWY7TUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFZLFNBQVo7TUFDWCxJQUFHLENBQUksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksVUFBWixDQUFQO1FBQ0MsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsOEJBQVQsRUFBeUMsSUFBQyxDQUFBLE1BQTFDLEVBREQ7O01BR0EsSUFBRyxDQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBaEI7UUFDQyxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsR0FBd0I7UUFFeEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksYUFBWixFQUEyQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFFLE9BQUY7QUFDMUIsZ0JBQUE7WUFBQSxLQUFDLENBQUEsaUJBQUQsR0FBcUIsS0FBQyxDQUFBLGNBQUQscURBQThCLENBQUUseUJBQWhDOzs7O3NCQUNNLENBQUU7Ozs7VUFGSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0I7UUFNQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFyQixDQUE2QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFFLE9BQUY7QUFDNUIsZ0JBQUE7WUFBQSxJQUFHLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLGNBQVosQ0FBSDtjQUNDLEtBQUEsR0FBUTtBQUVSLG1CQUFBLHlDQUFBOztnQkFDQyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUMsQ0FBQSxhQUFELENBQWdCLE1BQWhCLENBQVg7QUFERDtjQUlBLEtBQUMsQ0FBQSxPQUFELENBQVUsS0FBVjtjQUNBLEtBQUMsQ0FBQSxLQUFELENBQUEsRUFSRDs7VUFENEI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO1FBWUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBcEIsQ0FBdUIsT0FBdkIsRUFBZ0MsSUFBQyxDQUFBLFNBQWpDO1FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBbEIsQ0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQXBCLENBQXVCLFVBQXZCLEVBQW1DLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUUsSUFBRjtZQUNsQyxLQUFDLENBQUEsVUFBRCxHQUFjLFVBQUEsQ0FBWSxTQUFBO2NBQ3pCLEtBQUMsQ0FBQSxNQUFELENBQUE7WUFEeUIsQ0FBWixFQUdaLEdBSFk7VUFEb0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5DO1FBT0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBcEIsQ0FBdUIsU0FBdkIsRUFBa0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBRSxJQUFGO1lBQ2pDLElBQStCLHdCQUEvQjtjQUFBLFlBQUEsQ0FBYyxLQUFDLENBQUEsVUFBZixFQUFBOztVQURpQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUE5QkQ7T0FQRDs7QUEyQ0EsV0FBTyxJQUFDLENBQUE7RUE3Q0s7OzRCQStDZCxTQUFBLEdBQVcsU0FBRSxJQUFGO0lBQ1YsSUFBSSxDQUFDLGVBQUwsQ0FBQTtBQUNBLFdBQU87RUFGRzs7NEJBSVgsTUFBQSxHQUFRLFNBQUE7QUFFUCxXQUFPLDZDQUFBLFNBQUE7RUFGQTs7NEJBSVIsZUFBQSxHQUFpQixTQUFBO0FBQ2hCLFFBQUE7SUFBQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLE1BQUYsQ0FBVSxFQUFWLEVBQWMsc0RBQUEsU0FBQSxDQUFkLEVBQXFCO01BQUUsUUFBQSxFQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFVBQVosQ0FBWjtNQUFzQyxPQUFBLEVBQVMsSUFBQyxDQUFBLHVCQUFELENBQTBCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLFNBQVosQ0FBMUIsQ0FBL0M7S0FBckI7SUFDUixJQUFHLHFCQUFBLElBQWlCLENBQUMsQ0FBQyxPQUFGLENBQVcsS0FBSyxDQUFDLEtBQWpCLENBQXBCO0FBQ0M7QUFBQSxXQUFBLG1EQUFBOztRQUNDLEtBQUssQ0FBQyxLQUFPLENBQUEsSUFBQSxDQUFiLEdBQXlCLElBQUMsQ0FBQSxpQkFBSixHQUEyQixVQUFBLENBQVksRUFBWixDQUEzQixHQUFpRCxFQUFFLENBQUMsUUFBSCxDQUFBO0FBRHhFLE9BREQ7S0FBQSxNQUdLLElBQUcsbUJBQUg7TUFDSixLQUFLLENBQUMsS0FBTixHQUFjLENBQUssSUFBQyxDQUFBLGlCQUFKLEdBQTJCLFVBQUEsQ0FBWSxLQUFLLENBQUMsS0FBbEIsQ0FBM0IsR0FBMEQsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFaLENBQUEsQ0FBNUQsRUFEVjs7SUFHTCxJQUFHLG1CQUFIO01BQ0MsTUFBQSxHQUFTLENBQUMsQ0FBQyxLQUFGLENBQVMsS0FBSyxDQUFDLE9BQWYsRUFBd0IsT0FBeEI7QUFDVDtBQUFBLFdBQUEsd0NBQUE7O1lBQTJCLGFBQVUsTUFBVixFQUFBLEVBQUE7VUFDMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFkLENBQW1CO1lBQUUsS0FBQSxFQUFPLENBQUssSUFBQyxDQUFBLGlCQUFKLEdBQTJCLFVBQUEsQ0FBWSxFQUFaLENBQTNCLEdBQWlELEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBbkQsQ0FBVDtZQUE2RSxLQUFBLEVBQU8sRUFBcEY7WUFBd0YsS0FBQSxFQUFPLE1BQS9GO1dBQW5COztBQURELE9BRkQ7O0lBS0EsT0FBQSxHQUFVLENBQUMsQ0FBQyxPQUFGLENBQVcsS0FBSyxDQUFDLE9BQWpCLEVBQTBCLE9BQTFCO0lBQ1YsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFXLENBQUMsQ0FBQyxJQUFGLENBQVEsT0FBQSxJQUFXLEVBQW5CLENBQVgsQ0FBb0MsQ0FBQyxNQUFyQyxHQUE4QyxDQUFqRDtNQUNDLEtBQUssQ0FBQyxZQUFOLEdBQXFCLFFBRHRCOztBQUVBLFdBQU87RUFoQlM7OzRCQWtCakIsZUFBQSxHQUFpQixTQUFFLE1BQUY7SUFDaEIsSUFBRyxNQUFIO0FBQ0MsYUFBTyxNQURSOztBQUVBLFdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWDtFQUhTOzs0QkFLakIsWUFBQSxHQUFjLFNBQUE7QUFDYixXQUFPO0VBRE07OzRCQUdkLFFBQUEsR0FBVSxTQUFBO0FBQ1QsUUFBQTtJQUFBLEtBQUEsR0FBUTtBQUNSO0FBQUEsU0FBQSxzQ0FBQTs7TUFFQyxLQUFLLENBQUMsSUFBTixDQUFZLElBQUMsQ0FBQSxhQUFELENBQWdCLElBQWhCLENBQVo7QUFGRDtBQUdBLFdBQU87RUFMRTs7NEJBT1YsYUFBQSxHQUFlLFNBQUUsSUFBRjtBQUNkLFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixJQUFHLElBQUMsQ0FBQSxpQkFBSjtNQUNDLEtBQUssQ0FBQyxLQUFOLEdBQWMsVUFBQSxDQUFZLElBQUksQ0FBQyxFQUFqQixFQURmO0tBQUEsTUFBQTtNQUdDLEtBQUssQ0FBQyxLQUFOLEdBQWMsSUFBSSxDQUFDLEdBSHBCOztJQUlBLElBQUcsaUJBQUg7TUFDQyxJQUFHLElBQUksQ0FBQyxJQUFMLFlBQXFCLE1BQXhCO1FBQ0MsS0FBSyxDQUFDLEtBQU4sR0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQVYsQ0FBQSxFQURmO09BQUEsTUFBQTtRQUdDLEtBQUssQ0FBQyxLQUFOLEdBQWMsSUFBSSxDQUFDLEtBSHBCO09BREQ7O0FBTUEsV0FBTztFQVpPOzs0QkFjZixVQUFBLEdBQVksU0FBQTtXQUNYO01BQUEsS0FBQSxFQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFlLE9BQWYsQ0FBUDs7RUFEVzs7NEJBR1osdUJBQUEsR0FBeUIsU0FBRSxPQUFGO0FBQ3hCLFFBQUE7SUFBQSxJQUFHLENBQUMsQ0FBQyxVQUFGLENBQWMsT0FBZCxDQUFIO0FBQ0MsYUFBTyxPQUFBLENBQVMsSUFBQyxDQUFBLHVCQUFWLEVBRFI7O0lBR0EsS0FBQSxHQUFRO0FBQ1IsU0FBQSx5Q0FBQTs7TUFDQyxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksR0FBWixDQUFBLElBQXFCLENBQUMsQ0FBQyxRQUFGLENBQVksR0FBWixDQUF4QjtRQUNDLEtBQUssQ0FBQyxJQUFOLENBQVc7VUFBRSxLQUFBLEVBQU8sQ0FBSyxJQUFDLENBQUEsaUJBQUosR0FBMkIsVUFBQSxDQUFZLEdBQVosQ0FBM0IsR0FBa0QsR0FBRyxDQUFDLFFBQUosQ0FBQSxDQUFwRCxDQUFUO1VBQStFLEtBQUEsRUFBTyxHQUF0RjtVQUEyRixLQUFBLEVBQU8sSUFBbEc7U0FBWCxFQUREO09BQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVksR0FBWixDQUFIO1FBQ0osR0FBRyxDQUFDLEtBQUosR0FBZSxJQUFDLENBQUEsaUJBQUosR0FBMkIsVUFBQSxDQUFZLEdBQUcsQ0FBQyxLQUFoQixDQUEzQixHQUF3RCxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVYsQ0FBQTtRQUNwRSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsQ0FBQyxNQUFGLENBQVUsRUFBVixFQUFjLElBQUMsQ0FBQSxVQUFmLEVBQTJCLEdBQTNCLENBQVgsRUFGSTs7QUFITjtBQU1BLFdBQU87RUFYaUI7OzRCQWF6QixRQUFBLEdBQVUsU0FBRSxJQUFGO0FBQ1QsUUFBQTtJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUiwrREFBaUMsQ0FBRSxvQkFBbkM7RUFEUzs7NEJBSVYsS0FBQSxHQUFPLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxjQUFaLENBQUg7QUFDQyxhQUREOztJQUdBLElBQUcsb0JBQUg7TUFFQyxJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFwQixDQUFBLEVBRkQ7OztTQUdLLENBQUUsTUFBUCxDQUFBOztJQUNBLElBQUMsQ0FBQSxDQUFELENBQUksZUFBSixDQUFxQixDQUFDLE1BQXRCLENBQUE7SUFDQSw0Q0FBQSxTQUFBO0VBVE07OzRCQVlQLE1BQUEsR0FBUSxTQUFFLElBQUY7QUFDUCxRQUFBO0lBQUEsbUJBQTBCLElBQUksQ0FBRSx3QkFBaEM7TUFBQSxJQUFJLENBQUMsZUFBTCxDQUFBLEVBQUE7O0lBQ0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxRQUFELENBQUE7SUFDUixJQUFHLGtCQUFJLEtBQUssQ0FBRSxnQkFBZDtNQUVDLElBQUMsQ0FBQSxLQUFELENBQUE7TUFDQSxJQUFHLENBQUksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksY0FBWixDQUFQO1FBQ0MsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQUEsRUFERDs7QUFFQSxhQUxEOztJQU1BLElBQUMsQ0FBQSxPQUFELENBQVUsS0FBVjtJQUVBLElBQUMsQ0FBQSxLQUFELENBQUE7RUFYTzs7NEJBY1IsT0FBQSxHQUFTLFNBQUUsS0FBRjtBQUNSLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxjQUFaLEVBQTRCLEtBQTVCO0lBQ0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxjQUFELENBQUE7QUFDYixTQUFBLHVDQUFBOztNQUNDLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFpQixJQUFBLFVBQUEsQ0FBWSxJQUFaLENBQWpCO0FBREQ7SUFFQSxJQUFDLENBQUEsT0FBRCxDQUFVLFVBQVYsRUFBc0IsSUFBQyxDQUFBLE1BQXZCO0VBTFE7Ozs7R0E5Tm9CLE9BQUEsQ0FBUyxRQUFUOztBQXNPOUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUN4T2pCLElBQUEsY0FBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7OzsyQkFDTCxRQUFBLEdBQVUsT0FBQSxDQUFTLHlCQUFUOzsyQkFFVixNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7V0FBQTtZQUFBLEVBQUE7VUFBQSxRQUFBLEdBQVEsQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUQsS0FBdUIsT0FBL0I7VUFDQSxVQUFBLEdBQVUsQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUQsS0FBdUIsT0FEakM7VUFFQSxPQUFBLEdBQU8sQ0FBQyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUQsS0FBdUIsUUFGOUI7OztFQURPOzsyQkFLUixLQUFBLEdBQU8sU0FBRSxJQUFGO0FBQ04sUUFBQTtJQUFBLDJDQUFBLFNBQUE7QUFDQTs7O2FBQ00sQ0FBRTs7T0FEUjtLQUFBO0VBRk07OzJCQU1QLE1BQUEsR0FBUSxTQUFFLEtBQUY7QUFDUCxRQUFBO0lBQUEsT0FBQSxvRUFBMEIsQ0FBRSxHQUFsQixDQUF1QixPQUF2QjtJQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZO01BQUEsS0FBQSxFQUFPLE9BQVA7S0FBWjtJQUNBLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBZixDQUFBLENBQXNCLENBQUMsSUFBdkIsQ0FBNkIsSUFBQyxDQUFBLFlBQUQsQ0FBZSxJQUFmLENBQTdCO0lBQ0EsNENBQUEsU0FBQTtFQUpPOzsyQkFPUixNQUFBLEdBQVEsU0FBRSxJQUFGO0FBQ1AsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBRCxDQUFBO0lBRVAsSUFBQyxDQUFBLEdBQUQsQ0FBTSxJQUFOLEVBQVksSUFBWjtFQUhPOzsyQkFNUixLQUFBLEdBQU8sU0FBQTtJQUNOLDJDQUFBLFNBQUE7SUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQTtFQUZNOzs7O0dBM0JxQixPQUFBLENBQVMsUUFBVDs7QUFnQzdCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDaENqQixJQUFBLHlDQUFBO0VBQUE7Ozs7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUyxPQUFUOztBQUNWLFlBQUEsR0FBZSxPQUFBLENBQVMsWUFBVDs7QUFFZixRQUFBLEdBQVcsT0FBQSxDQUFTLG1CQUFUOztBQUVMOzs7cUJBQ0wsUUFBQSxHQUFVLE9BQUEsQ0FBUyx1QkFBVDs7cUJBRVYsTUFBQSxHQUNDO0lBQUEsdUJBQUEsRUFBeUIsV0FBekI7SUFDQSxtQkFBQSxFQUFxQixXQURyQjtJQUVBLG1CQUFBLEVBQXFCLGdCQUZyQjtJQUdBLDBCQUFBLEVBQTRCLFdBSDVCO0lBSUEsT0FBQSxFQUFTLFdBSlQ7OztFQU1ZLGtCQUFFLE9BQUY7QUFDWixRQUFBOztNQURjLFVBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQ3RCLElBQUMsQ0FBQSxZQUFELHFCQUFnQixPQUFPLENBQUU7SUFDekIsSUFBQyxDQUFBLFlBQUQsc0JBQWdCLE9BQU8sQ0FBRSxzQkFBVCxJQUF5QjtJQUV6QyxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxRQUFGLENBQVksSUFBQyxDQUFBLFVBQWIsMENBQXdDLENBQUUsa0JBQWYsSUFBMkIsR0FBdEQsRUFBNkQ7TUFBRSxRQUFBLEVBQVUsS0FBWjtNQUFtQixPQUFBLEVBQVMsSUFBNUI7S0FBN0Q7SUFDYiwyQ0FBQSxTQUFBO0FBQ0E7RUFOWTs7cUJBUWIsVUFBQSxHQUFZLFNBQUUsT0FBRjtBQUVYLFFBQUE7SUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQztJQUNoQixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFDaEIsSUFBQyxDQUFBLEdBQUQsR0FBTyxPQUFPLENBQUM7SUFDZixJQUFDLENBQUEsT0FBRCxHQUFXLE9BQU8sQ0FBQztJQUVuQixJQUFDLENBQUEsTUFBRCxHQUFVO0lBRVYsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsVUFBZixFQUEyQixJQUFDLENBQUEsUUFBNUI7SUFFQSxHQUFBLEdBQU07SUFDTiwyQ0FBZ0IsQ0FBRSxlQUFsQjtNQUNDLEdBQUEsR0FBTSxHQUFBLEdBQU0sSUFEYjs7SUFFQSxJQUFDLENBQUEsRUFBRSxDQUFDLFNBQUosSUFBaUI7SUFDakIsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUVBLFlBQUEsR0FBZSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBb0IsU0FBRSxHQUFGO0FBQVMsYUFBTyxtREFBQSxtQkFBd0IsR0FBRyxDQUFFLEdBQUwsQ0FBVSxRQUFWO0lBQXhDLENBQXBCO0lBRWYsT0FBQSxHQUFVLFNBQUUsR0FBRjtBQUNULGFBQU8sU0FBRSxFQUFGLEVBQU0sRUFBTjtRQUNOLElBQUcsRUFBSSxDQUFBLEdBQUEsQ0FBSixHQUFZLEVBQUksQ0FBQSxHQUFBLENBQW5CO0FBQ0MsaUJBQU8sRUFEUjs7UUFFQSxJQUFHLEVBQUksQ0FBQSxHQUFBLENBQUosR0FBWSxFQUFJLENBQUEsR0FBQSxDQUFuQjtBQUNDLGlCQUFPLENBQUMsRUFEVDs7QUFFQSxlQUFPO01BTEQ7SUFERTtBQVFWO0FBQUEsU0FBQSxzQ0FBQTs7TUFDQyxJQUFDLENBQUEsTUFBRCxDQUFTLEdBQVQsRUFBYyxLQUFkLEVBQXFCLElBQXJCO0FBREQ7SUFHQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxLQUFmLEVBQXNCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtRQUNyQixLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQTtNQURxQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFJQSxVQUFBLENBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO0FBQ1gsWUFBQTtRQUFBLE9BQUEsR0FBVSxLQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBb0IsU0FBRSxHQUFGO0FBQVMsZ0NBQU8sR0FBRyxDQUFFLEdBQUwsQ0FBVSxRQUFWLFdBQUEsbUJBQXlCLEdBQUcsQ0FBRSxHQUFMLENBQVUsUUFBVjtRQUF6QyxDQUFwQjtRQUNWLElBQUcsT0FBTyxDQUFDLE1BQVg7VUFDQyxJQUFBLEdBQU8sS0FBQyxDQUFBLE1BQVEsQ0FBQSxPQUFTLENBQUEsQ0FBQSxDQUFHLENBQUMsRUFBYjs7WUFFaEIsSUFBSSxDQUFFLE1BQU4sQ0FBQTs7O1lBQ0EsSUFBSSxDQUFFLEtBQU4sQ0FBQTtXQUpEOztNQUZXO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBUUUsQ0FSRjtFQXBDVzs7cUJBZ0RaLFlBQUEsR0FBYyxTQUFBO0FBQ2IsUUFBQTtJQUFBLElBQUEsR0FDQztNQUFBLFNBQUEsRUFBVyxDQUFFLENBQUUsQ0FBRSxJQUFDLENBQUEsR0FBRCxJQUFRLENBQVYsQ0FBQSxHQUFnQixDQUFsQixDQUFBLEdBQXdCLElBQTFCLENBQUEsR0FBbUMsRUFBOUM7O0lBQ0QsSUFBSSx5QkFBSjtNQUNDLElBQUksQ0FBQyxZQUFMLEdBQ0M7UUFBQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFlBQVksQ0FBQyxRQUFkLElBQTBCLGdDQUFwQztRQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsSUFBdUIsUUFEOUI7UUFFQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFlBQVksQ0FBQyxTQUFkLElBQTJCLEtBRnRDO1FBR0EsUUFBQSxFQUFVLElBQUMsQ0FBQSxZQUFZLENBQUMsUUFBZCxJQUEwQixpQkFIcEM7UUFGRjs7QUFPQSxXQUFPO0VBVk07O3FCQVlkLE1BQUEsR0FBUSxTQUFBO0FBQ1AsUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFBO0lBQ1gsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVyxRQUFYLENBQVg7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxDQUFELENBQUksZ0JBQUo7SUFDWCxJQUFHLDZCQUFIO01BQ0MsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsQ0FBRCxDQUFJLGFBQUosRUFEZjs7RUFKTzs7cUJBUVIsU0FBQSxHQUFXLFNBQUUsSUFBRjtJQUNWLElBQUMsQ0FBQSxjQUFELEdBQWtCLFVBQUEsQ0FBWSxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDN0IsS0FBQyxDQUFBLFFBQUQsQ0FBQTtNQUQ2QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWixFQUdoQixDQUhnQjtFQURSOztxQkFPWCxJQUFBLEdBQU0sU0FBRSxPQUFGOztNQUFFLFVBQVU7O0lBQ2pCLElBQUcsSUFBQyxDQUFBLE9BQUo7TUFDQyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFlLE9BQWY7UUFBQSxJQUFDLENBQUEsUUFBRCxDQUFBLEVBQUE7O0FBQ0EsYUFKRDs7SUFNQSxJQUFHLElBQUMsQ0FBQSxVQUFKO01BRUMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUE7TUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBSGY7O0VBUEs7O3FCQWVOLFFBQUEsR0FBVSxTQUFFLE1BQUY7SUFDVCxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBaUIsTUFBTSxDQUFDLEdBQVAsQ0FBWSxNQUFaLENBQWpCO0VBRFM7O3FCQUlWLFFBQUEsR0FBVSxTQUFFLE1BQUYsRUFBVSxJQUFWO0lBQ1QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW9CLE1BQXBCO0lBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWMsQ0FBQyxDQUFDLE1BQUYsQ0FBVSxJQUFWLEVBQWdCO01BQUUsSUFBQSxFQUFNLE1BQU0sQ0FBQyxHQUFQLENBQVksTUFBWixDQUFSO01BQThCLElBQUEsRUFBTSxNQUFNLENBQUMsR0FBUCxDQUFZLE1BQVosQ0FBcEM7S0FBaEIsQ0FBZCxFQUE0RjtNQUFFLEtBQUEsRUFBTyxJQUFUO01BQWUsS0FBQSxFQUFPLElBQXRCO01BQTRCLE1BQUEsRUFBUSxNQUFwQztLQUE1RjtJQUNBLElBQUcsQ0FBSSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQW5CO01BQ0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUEsRUFERDs7RUFKUzs7cUJBUVYsTUFBQSxHQUFRLFNBQUUsTUFBRixFQUFVLFFBQVYsRUFBMkIsVUFBM0I7QUFDUCxRQUFBOztNQURpQixXQUFXOzs7TUFBTSxhQUFXOztJQUM3QyxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVM7TUFBQSxLQUFBLEVBQU8sTUFBUDtNQUFlLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFBNUI7TUFBd0MsTUFBQSxFQUFRLElBQWhEO0tBQVQ7SUFFZCxPQUFPLENBQUMsRUFBUixDQUFXLFFBQVgsRUFBcUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFFLE9BQUYsRUFBVyxJQUFYO0FBQ3BCLFlBQUE7UUFBQSx5REFBaUIsQ0FBRSxHQUFoQixDQUFxQixRQUFyQixtQkFBSDtVQUNDLEtBQUMsQ0FBQSxPQUFELEdBQVc7QUFDWCxpQkFGRDs7UUFLQSxJQUFvQixvQkFBSSxPQUFPLENBQUUsZ0JBQWpDO1VBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBQSxFQUFBOztRQUNBLEtBQUMsQ0FBQSxPQUFELEdBQVc7UUFDWCxJQUFlLFFBQUEsb0JBQWEsSUFBSSxDQUFFLGNBQU4sS0FBZ0IsVUFBNUM7VUFBQSxLQUFDLENBQUEsUUFBRCxDQUFBLEVBQUE7O01BUm9CO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtJQVdBLE9BQU8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFxQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7QUFDcEIsWUFBQTs7YUFBVyxDQUFFLEtBQWIsQ0FBQTs7TUFEb0I7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO0lBSUEsS0FBQSxHQUFRO0lBQ1IsT0FBTyxDQUFDLEVBQVIsQ0FBVyxVQUFYLEVBQXVCLFNBQUUsTUFBRixFQUFVLElBQVYsRUFBZ0IsSUFBaEI7TUFFdEIsS0FBSyxDQUFDLFFBQU4sQ0FBZ0IsTUFBaEIsRUFBd0IsSUFBeEI7TUFDQSxJQUFHLENBQU0saUNBQUosSUFBNEIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBOUIsQ0FBQSxvQkFBMEQsSUFBSSxDQUFFLGNBQU4sS0FBZ0IsVUFBN0U7UUFDQyxLQUFLLENBQUMsVUFBTixDQUFrQixJQUFsQixFQUF3QixJQUF4QixFQUREOztJQUhzQixDQUF2QjtJQU9BLE9BQU8sQ0FBQyxjQUFSLEdBQXlCO0lBRXpCLElBQUMsQ0FBQSxhQUFELENBQWdCLE9BQU8sQ0FBQyxNQUFSLENBQWdCLFVBQWhCLENBQWhCO0lBQ0EsSUFBQyxDQUFBLE1BQVEsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUFULEdBQXVCO0FBQ3ZCLFdBQU87RUE5QkE7O3FCQWdDUixRQUFBLEdBQVUsU0FBQTtJQUVULElBQUcsdUJBQUg7TUFFQyxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBQTtBQUNBLGFBSEQ7O0lBS0EsSUFBRyxvQkFBSDtNQUVDLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFBLEVBRkQ7O0lBS0EsSUFBRyxDQUFJLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBbkI7QUFFQyxhQUZEOztJQUlBLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsWUFBQSxDQUFjO01BQUEsVUFBQSxFQUFZLElBQUMsQ0FBQSxVQUFiO01BQXlCLE1BQUEsRUFBUSxLQUFqQztNQUF3QyxJQUFBLEVBQU0sSUFBOUM7S0FBZDtJQUVsQixJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxRQUFmLEVBQXlCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtRQUN4QixLQUFDLENBQUEsU0FBRCxDQUFBO01BRHdCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtJQUlBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLFFBQWYsRUFBeUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFFLE9BQUY7UUFDeEIsS0FBQyxDQUFBLFNBQUQsQ0FBQTtRQUdBLEtBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFBO1FBQ0EsS0FBQyxDQUFBLFVBQUQsR0FBYztRQUNkLElBQUcsb0JBQUksT0FBTyxDQUFFLGdCQUFiLElBQXdCLHVCQUEzQjtVQUVDLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO1VBQ0EsS0FBQyxDQUFBLE9BQUQsR0FBVyxLQUhaOztNQU53QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFZQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxVQUFmLEVBQTJCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBRSxNQUFGLEVBQVUsSUFBVixFQUFnQixJQUFoQjtRQUMxQixNQUFNLENBQUMsR0FBUCxDQUFZLE9BQVosRUFBcUIsSUFBckI7UUFDQSxLQUFDLENBQUEsT0FBRCxHQUFXLEtBQUMsQ0FBQSxNQUFELENBQVMsTUFBVDtRQUNYLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO01BSDBCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQjtJQU9BLElBQUMsQ0FBQSxhQUFELENBQWdCLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFBLENBQWhCO0lBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUE7RUExQ1M7O3FCQTZDVixhQUFBLEdBQWUsU0FBRSxFQUFGO0lBQ2QsSUFBRyxJQUFDLENBQUEsWUFBSjtNQUNDLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFhLEVBQWIsRUFERDtLQUFBLE1BQUE7TUFHQyxDQUFFLElBQUMsQ0FBQSxVQUFELElBQWUsSUFBQyxDQUFBLE9BQWxCLENBQTJCLENBQUMsTUFBNUIsQ0FBb0MsRUFBcEMsRUFIRDs7RUFEYzs7cUJBT2YsU0FBQSxHQUFXLFNBQUE7QUFFVixRQUFBO0lBQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxZQUFSOztXQUNTLENBQUUsSUFBVixDQUFBO09BREQ7O0VBRlU7O3FCQU1YLFNBQUEsR0FBVyxTQUFBO0FBRVYsUUFBQTtJQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsWUFBUjs7V0FDUyxDQUFFLElBQVYsQ0FBQTtPQUREOztFQUZVOztxQkFNWCxpQkFBQSxHQUFtQixTQUFBO0lBQ2xCLE1BQUEsQ0FBUSxRQUFSLENBQWtCLENBQUMsRUFBbkIsQ0FBc0IsT0FBdEIsRUFBK0IsSUFBQyxDQUFBLFdBQWhDO0VBRGtCOztxQkFLbkIsVUFBQSxHQUFZLFNBQUE7SUFDWCxNQUFBLENBQVEsUUFBUixDQUFrQixDQUFDLEVBQW5CLENBQXNCLFNBQXRCLEVBQWlDLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBRSxJQUFGO0FBQ2hDLFlBQUE7UUFBQSxLQUFBLEdBQVEsQ0FBQSxDQUFHLElBQUksQ0FBQyxNQUFSO1FBRVIsSUFBRyxJQUFJLENBQUMsT0FBTCxLQUFnQixRQUFRLENBQUMsS0FBekIsSUFBbUMsS0FBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQWEsS0FBYixDQUF0Qzs7WUFDQyxJQUFJLENBQUUsY0FBTixDQUFBOzs7WUFDQSxJQUFJLENBQUUsZUFBTixDQUFBOztVQUNBLFVBQUEsQ0FBWSxTQUFBO21CQUNYLEtBQUMsQ0FBQSxRQUFELENBQUE7VUFEVyxDQUFaLEVBRUUsQ0FGRixFQUhEOztRQU9BLElBQUcsSUFBSSxDQUFDLE9BQUwsS0FBZ0IsUUFBUSxDQUFDLEdBQXpCLElBQWdDLE9BQUEsSUFBSSxDQUFDLE9BQUwsRUFBQSxhQUFnQixRQUFRLENBQUMsR0FBekIsRUFBQSxHQUFBLE1BQUEsQ0FBbkM7VUFJQyxJQUFHLDBCQUFBLElBQWlCLEtBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFhLEtBQWIsQ0FBakIsb0JBQTBDLElBQUksQ0FBRSxrQkFBbkQ7O2NBQ0MsSUFBSSxDQUFFLGNBQU4sQ0FBQTs7O2NBQ0EsSUFBSSxDQUFFLGVBQU4sQ0FBQTs7WUFDQSxLQUFDLENBQUEsY0FBRCxHQUFrQixVQUFBLENBQVksU0FBQTtxQkFDN0IsS0FBQyxDQUFBLFdBQUQsQ0FBQTtZQUQ2QixDQUFaLEVBRWhCLENBRmdCO0FBR2xCLG1CQU5EOztVQVFBLElBQUcsS0FBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQWEsS0FBYixDQUFBLElBQXlCLGlCQUFJLElBQUksQ0FBRSxrQkFBbkMsSUFBZ0QsS0FBQyxDQUFBLFlBQXBEO1lBQ0MsS0FBQyxDQUFBLGNBQUQsQ0FBQSxFQUREOztVQUlBLElBQU8sMEJBQUosNkNBQWdDLENBQUUsZ0JBQXJDO1lBQ0MsbUJBQUcsSUFBSSxDQUFFLGlCQUFUOztnQkFDQyxJQUFJLENBQUUsY0FBTixDQUFBOzs7Z0JBQ0EsSUFBSSxDQUFFLGVBQU4sQ0FBQTs7Y0FDQSxLQUFDLENBQUEsYUFBRCxDQUFBLEVBSEQ7YUFBQSxNQUFBO2NBS0MsS0FBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUEsRUFMRDs7QUFNQSxtQkFQRDs7VUFTQSxJQUFHLDBCQUFBLElBQWlCLEtBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFnQixLQUFoQixDQUFqQixvQkFBNkMsSUFBSSxDQUFFLGtCQUFuRCxJQUFnRSxDQUFJLEtBQUMsQ0FBQSxZQUF4RTs7Y0FFQyxJQUFJLENBQUUsY0FBTixDQUFBOzs7Y0FDQSxJQUFJLENBQUUsZUFBTixDQUFBOztZQUNBLEtBQUMsQ0FBQSxhQUFELENBQUE7QUFDQSxtQkFMRDs7VUFPQSxJQUFPLDBCQUFKLElBQXFCLEtBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFhLEtBQWIsQ0FBckIsb0JBQThDLElBQUksQ0FBRSxrQkFBdkQ7WUFDQyxJQUFHLENBQUksS0FBQyxDQUFBLFlBQVI7O2dCQUNDLElBQUksQ0FBRSxjQUFOLENBQUE7OztnQkFDQSxJQUFJLENBQUUsZUFBTixDQUFBOztjQUNBLEtBQUMsQ0FBQSxhQUFELENBQUE7QUFDQSxxQkFKRDthQUREOztVQU9BLElBQUcsMEJBQUEsNkNBQTRCLENBQUUsZ0JBQWpDO1lBQ0MsbUJBQUcsSUFBSSxDQUFFLGlCQUFUOztnQkFDQyxJQUFJLENBQUUsY0FBTixDQUFBOzs7Z0JBQ0EsSUFBSSxDQUFFLGVBQU4sQ0FBQTs7Y0FDQSxLQUFDLENBQUEsV0FBRCxDQUFBLEVBSEQ7YUFBQSxNQUFBO2NBS0MsVUFBQSxDQUFZLFNBQUE7dUJBQ1gsS0FBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUE7Y0FEVyxDQUFaLEVBRUUsQ0FGRixFQUxEO2FBREQ7O1VBWUEsS0FBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLElBQW5CLEVBQXlCLEtBQUMsQ0FBQSxVQUExQjtBQUNBLGlCQXBERDs7UUFxREEsSUFBRyxJQUFJLENBQUMsT0FBTCxLQUFnQixRQUFRLENBQUMsR0FBekIsSUFBZ0MsUUFBQSxJQUFJLENBQUMsT0FBTCxFQUFBLGFBQWdCLFFBQVEsQ0FBQyxHQUF6QixFQUFBLElBQUEsTUFBQSxDQUFuQztVQUNDLEtBQUMsQ0FBQSxJQUFELENBQUE7VUFDQSxLQUFDLENBQUEsT0FBRCxDQUFVLFFBQVYsRUFBb0IsSUFBcEI7QUFDQSxpQkFIRDs7TUEvRGdDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQztFQURXOztxQkEwRVosYUFBQSxHQUFlLFNBQUE7QUFDZCxRQUFBO0lBQUEsR0FBQSw2R0FBMEMsQ0FBRSxJQUF0QyxDQUE0QyxPQUE1QztJQUNOLElBQUcsV0FBSDtNQUNDLFVBQUEsQ0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDWCxjQUFBOzBEQUFjLENBQUUsTUFBaEIsQ0FBQTtRQURXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBRUUsQ0FGRixFQUREOztFQUZjOztxQkFRZixjQUFBLEdBQWdCLFNBQUE7QUFDZixRQUFBO0lBQUEsR0FBQSw4RUFBa0MsQ0FBRSxJQUE5QixDQUFvQyxPQUFwQztJQUNOLElBQUcsV0FBSDtNQUNDLFVBQUEsQ0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDWCxjQUFBOzBEQUFjLENBQUUsTUFBaEIsQ0FBQTtRQURXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBRUUsQ0FGRixFQUREOztFQUZlOztxQkFRaEIsVUFBQSxHQUFZLFNBQUUsSUFBRixFQUFRLE9BQVI7QUFFWCxRQUFBO0lBQUEsT0FBQSxtQkFBYSxJQUFJLENBQUUsa0JBQVQsR0FBdUIsTUFBdkIsR0FBbUM7SUFDN0MsS0FBQSx5RUFBc0IsQ0FBQSxPQUFBO0lBRXRCLElBQUcsS0FBSyxDQUFDLFFBQU4sQ0FBZ0IsWUFBaEIsQ0FBSDtNQUNDLElBQUcsT0FBQSxLQUFXLE1BQWQ7UUFDQyxJQUFDLENBQUEsYUFBRCxDQUFBLEVBREQ7T0FBQSxNQUVLLElBQUcsdUJBQUg7UUFDSixJQUFDLENBQUEsV0FBRCxDQUFBLEVBREk7O0FBRUwsYUFMRDs7SUFPQSxPQUFBLG1CQUFVLEtBQUssQ0FBRSxJQUFQLENBQWEsT0FBYjtJQUVWLElBQUcsZUFBSDs7UUFDQyxJQUFJLENBQUUsY0FBTixDQUFBOzs7UUFDQSxJQUFJLENBQUUsZUFBTixDQUFBOztNQUNBLFVBQUEsQ0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDWCxjQUFBOzhEQUFrQixDQUFFLE1BQXBCLENBQUE7UUFEVztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWixFQUVFLENBRkY7QUFHQSxhQU5EOztJQVNBLElBQUcseUJBQUEsSUFBaUIsT0FBQSxLQUFXLE1BQS9CO01BQ0MsSUFBRyxDQUFJLElBQUMsQ0FBQSxZQUFSO1FBQ0MsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQUREO09BREQ7O0lBR0EsSUFBTyx5QkFBSixJQUFxQixPQUFBLEtBQVcsTUFBbkM7TUFDQyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQUEsRUFGRDs7RUExQlc7O3FCQStCWixXQUFBLEdBQWEsU0FBQTtJQUNaLElBQUcsdUJBQUg7TUFDQyxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBQSxFQUREOztFQURZOztxQkFLYixVQUFBLEdBQVksU0FBRSxJQUFGO0lBQ1gsSUFBRyxDQUFFLElBQUksQ0FBQyxJQUFMLEtBQWEsT0FBYixJQUF5QixJQUFJLENBQUMsT0FBTCxLQUFnQixDQUF6QyxJQUErQyxJQUFJLENBQUMsT0FBTCxLQUFnQixDQUFqRSxDQUFBLElBQXdFLElBQUksQ0FBQyxJQUFMLEtBQWEsV0FBeEY7TUFDQyxJQUFDLENBQUEsT0FBRCxDQUFVLFFBQVYsRUFBb0IsSUFBcEI7TUFDQSxVQUFBLENBQVksQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBOztZQUNYLElBQUksQ0FBRSxjQUFOLENBQUE7O1VBQ0EsSUFBSSxDQUFDLGVBQUwsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxJQUFELENBQUE7VUFDQSxLQUFDLENBQUEsT0FBRCxDQUFVLGNBQVYsRUFBMEIsS0FBQyxDQUFBLFlBQVksQ0FBQyxLQUF4QztRQUpXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLEVBTUUsQ0FORjtBQU9BLGFBVEQ7O0VBRFc7O3FCQWFaLGNBQUEsR0FBZ0IsU0FBRSxJQUFGO0FBQ2YsUUFBQTtJQUFBLElBQUksQ0FBQyxlQUFMLENBQUE7OztXQUNXLENBQUU7OztFQUZFOztxQkFLaEIsV0FBQSxHQUFhLFNBQUUsSUFBRjtBQUNaLFFBQUE7SUFBQSxJQUFtQywyQkFBbkM7TUFBQSxZQUFBLENBQWMsSUFBQyxDQUFBLGNBQWYsRUFBQTs7SUFDQSxPQUFBLEdBQVUsSUFBQyxDQUFBLEVBQUUsQ0FBQyx1QkFBSixDQUE2QixJQUFJLENBQUMsTUFBbEM7SUFDVixJQUFHLENBQUksQ0FBRSxPQUFBLEtBQVcsQ0FBWCxJQUFnQixPQUFBLEdBQVUsRUFBVixJQUFnQixDQUFsQyxDQUFQO01BQ0MsSUFBQyxDQUFBLElBQUQsQ0FBTyxLQUFQLEVBREQ7O0VBSFk7Ozs7R0E3V1MsUUFBUSxDQUFDOztBQXFYaEMsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUMxWGpCLElBQUEsc0JBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsbUJBQVQ7O0FBRUw7Ozt5QkFDTCxRQUFBLEdBQVUsT0FBQSxDQUFTLHdCQUFUOzt5QkFDVixVQUFBLEdBQVksT0FBQSxDQUFTLDBCQUFUOzt5QkFDWixXQUFBLEdBQWE7O3lCQUViLFNBQUEsR0FBVyxTQUFBO0FBQ1YsUUFBQTtJQUFBLEdBQUEsR0FBTSxDQUFFLFdBQUY7SUFDTixJQUFHLElBQUMsQ0FBQSxNQUFKO01BQ0MsR0FBRyxDQUFDLElBQUosQ0FBUyxRQUFULEVBREQ7O0FBRUEsV0FBTyxHQUFHLENBQUMsSUFBSixDQUFVLEdBQVY7RUFKRzs7eUJBTVgsTUFBQSxHQUFRLFNBQUE7QUFDUCxRQUFBO1dBQUE7WUFBQTtRQUFBLGFBQUEsRUFBZSxVQUFmO09BQUE7VUFDQSxjQUFBLEdBQWUsSUFBQyxDQUFBLE9BQU8sTUFEdkI7VUFHQSxnQkFBQSxHQUFpQixJQUFDLENBQUEsT0FBTyxRQUh6QjtVQUlBLGNBQUEsR0FBZSxJQUFDLENBQUEsT0FBTyxRQUp2Qjs7O0VBRE87O0VBT0ssc0JBQUUsT0FBRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFDWixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQyxNQUFSLElBQWtCO0lBQzVCLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsU0FBRCxHQUFhO0lBRWIsSUFBRyxvQkFBSDtNQUNDLElBQUMsQ0FBQSxJQUFELEdBQVEsT0FBTyxDQUFDLEtBRGpCOztJQUdBLDhDQUFPLE9BQVA7QUFDQTtFQVRZOzt5QkFXYixVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1gsOENBQUEsU0FBQTtJQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWlCLFNBQUE7YUFBRTtJQUFGLENBQWpCO0lBQ2QsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUFBO0lBRWQsSUFBQyxDQUFBLFFBQUQsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixLQUF4QixFQUErQixJQUFDLENBQUEsU0FBaEM7SUFDQSxJQUFDLENBQUEsUUFBRCxDQUFXLElBQUMsQ0FBQSxVQUFaLEVBQXdCLFFBQXhCLEVBQWtDLElBQUMsQ0FBQSxTQUFuQztJQUNBLElBQUMsQ0FBQSxRQUFELENBQVcsSUFBQyxDQUFBLFVBQVosRUFBd0IsUUFBeEIsRUFBa0MsSUFBQyxDQUFBLGlCQUFuQztFQVBXOzt5QkFXWixlQUFBLEdBQWlCLFNBQUE7QUFDaEIsV0FBTyxDQUFDLENBQUMsTUFBRixDQUFVLG1EQUFBLFNBQUEsQ0FBVixFQUFpQjtNQUFBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFBVDtLQUFqQjtFQURTOzt5QkFHakIsTUFBQSxHQUFRLFNBQUE7SUFDUCwwQ0FBQSxTQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxHQUFBLEdBQUksSUFBQyxDQUFBLEdBQUwsR0FBUyxVQUFwQjtJQUNULElBQUMsQ0FBQSxTQUFELENBQUE7QUFDQSxXQUFPLElBQUMsQ0FBQTtFQUpEOzt5QkFNUixTQUFBLEdBQVcsU0FBQTtBQUNWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtJQUVBLEtBQUEsR0FBUTtBQUNSO0FBQUEsU0FBQSxpREFBQTs7WUFBMEMsQ0FBSSxLQUFLLENBQUMsR0FBTixDQUFXLFFBQVg7OztNQUM3QyxJQUFBLEdBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBQTtNQUNQLEtBQUEsR0FBUSxLQUFLLENBQUMsR0FBTixDQUFXLGVBQVg7TUFDUixJQUFHLGFBQUg7UUFDQyxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBZSxXQUFmLEVBQTRCLElBQTVCLEVBRFI7O01BR0EsR0FBQSxHQUFNLEtBQUssQ0FBQztNQUNaLFNBQUEsR0FBWSxLQUFLLENBQUMsR0FBTixDQUFXLFVBQVg7TUFDWiwyQ0FBYSxDQUFFLGdCQUFaLEdBQXFCLENBQXhCO1FBQ0MsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWtCLElBQUEsTUFBQSxDQUFRLElBQUMsQ0FBQSxTQUFULEVBQW9CLElBQXBCLENBQWxCLEVBQThDLENBQUMsU0FBRSxHQUFGO0FBQVMsaUJBQU8sS0FBQSxHQUFNLEdBQU4sR0FBVTtRQUExQixDQUFELENBQTlDLEVBRFI7O01BRUEsS0FBSyxDQUFDLElBQU4sQ0FBVztRQUFBLEtBQUEsRUFBTyxJQUFQO1FBQWEsRUFBQSxFQUFJLEdBQWpCO1FBQXNCLFFBQUEsRUFBVSxTQUFoQztPQUFYO0FBVkQ7SUFZQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBZSxJQUFDLENBQUEsVUFBRCxDQUNkO01BQUEsSUFBQSxFQUFNLEtBQU47TUFDQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFNBRFI7TUFFQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFNBRlo7TUFHQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BSFQ7S0FEYyxDQUFmO0lBT0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtBQUVBLFdBQU8sSUFBQyxDQUFBO0VBekJFOzt5QkEyQlgsV0FBQSxHQUFhOzt5QkFDYixZQUFBLEdBQWMsU0FBQTtBQUNiLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUE7SUFDVixJQUFHLE9BQUEsR0FBVSxDQUFiO01BQ0MsSUFBQyxDQUFBLFlBQUQsQ0FBZSxPQUFmO0FBQ0EsYUFGRDs7SUFLQSxVQUFBLENBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQ1gsS0FBQyxDQUFBLFlBQUQsQ0FBZSxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFmO01BRFc7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVosRUFFRSxDQUZGO0VBUGE7O3lCQVlkLFlBQUEsR0FBYyxTQUFFLE1BQUY7SUFDYixJQUFHLE1BQUEsSUFBVSxJQUFDLENBQUEsV0FBZDtNQUNDLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FEZDtLQUFBLE1BQUE7TUFHQyxJQUFDLENBQUEsU0FBRCxHQUFhLE1BSGQ7O0VBRGE7O3lCQU9kLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTs7eUJBS25CLFFBQUEsR0FBVSxTQUFFLElBQUY7QUFDVCxRQUFBO0lBQUEsSUFBSSxDQUFDLGVBQUwsQ0FBQTtJQUNBLElBQUksQ0FBQyxjQUFMLENBQUE7SUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLENBQUQsQ0FBSSxJQUFJLENBQUMsYUFBVCxDQUF3QixDQUFDLElBQXpCLENBQStCLElBQS9CO0lBQ04sSUFBTyxXQUFQO0FBQ0MsYUFERDs7SUFHQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWlCLEdBQWpCO0lBQ1AsSUFBTyxZQUFQO0FBQ0MsYUFERDs7SUFHQSxJQUFDLENBQUEsUUFBRCxDQUFXLElBQVg7QUFDQSxXQUFPO0VBYkU7O3lCQWVWLE9BQUEsR0FBUyxTQUFBO0FBQ1IsV0FBTztFQURDOzt5QkFHVCxZQUFBLEdBQWMsU0FBRSxJQUFGO0lBQ2IsSUFBRyxpQkFBSDtNQUNDLElBQUksQ0FBQyxjQUFMLENBQUE7TUFDQSxJQUFJLENBQUMsZUFBTCxDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFOLENBQUEsRUFIRDtLQUFBLE1BQUE7TUFLQywrQ0FBTyxLQUFQLEVBTEQ7O0VBRGE7O3lCQVNkLFFBQUEsR0FBVSxTQUFFLEdBQUY7QUFDVCxRQUFBO0lBQUEsSUFBTyxtQkFBSixJQUFlLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBbEI7TUFDQyxHQUFBLDJDQUFvQixDQUFFO01BQ3RCLElBQUMsQ0FBQSxLQUFELENBQVEsR0FBUixFQUZEOztBQUlBO01BQ0MsSUFBRyxvQkFBSDs7O1lBQ0MsR0FBRyxDQUFFOzs7QUFDTCxlQUZEO09BREQ7S0FBQSxhQUFBO01BSU07QUFDTDtRQUNDLE9BQU8sQ0FBQyxLQUFSLENBQWMsMkJBQUEsR0FBNkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUExQyxHQUFnRCxlQUFoRCxHQUErRCxJQUFDLENBQUEsU0FBaEUsR0FBMEUsZ0JBQTFFLEdBQXlGLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZ0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUEsQ0FBaEIsQ0FBRCxDQUF2RyxFQUREO09BQUEsYUFBQTtRQUVNO1FBQ0wsT0FBTyxDQUFDLEtBQVIsQ0FBYyxrQkFBZCxFQUhEO09BTEQ7O0lBVUEsSUFBRyxXQUFIO01BQ0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW9CLEdBQXBCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWEsR0FBYjtNQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVCxFQUFxQixHQUFyQixFQUhEOztJQUtBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFIO01BQ0MsSUFBQyxDQUFBLEtBQUQsQ0FBQSxFQUREOztFQXBCUzs7eUJBd0JWLEtBQUEsR0FBTyxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBO0lBQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLENBQVY7SUFFTixHQUFHLENBQUMsY0FBSixHQUFxQixHQUFHLENBQUMsWUFBSixHQUFtQixHQUFHLENBQUMsS0FBSyxDQUFDO0VBSjVDOzt5QkFPUCxJQUFBLEdBQU0sU0FBQTtJQUVMLElBQUMsQ0FBQSxPQUFELENBQVUsUUFBVjtBQUNBLFdBQU8sd0NBQUEsU0FBQTtFQUhGOzt5QkFLTixNQUFBLEdBQVEsU0FBRSxJQUFGO0FBQ1AsUUFBQTtJQUFBLG9CQUFHLElBQUksQ0FBRSxjQUFOLEtBQWMsU0FBakI7QUFDQyxjQUFPLElBQUksQ0FBQyxPQUFaO0FBQUEsYUFDTSxRQUFRLENBQUMsRUFEZjtVQUVFLElBQUMsQ0FBQSxJQUFELENBQU8sSUFBUDtBQUNBO0FBSEYsYUFJTSxRQUFRLENBQUMsSUFKZjtVQUtFLElBQUMsQ0FBQSxJQUFELENBQU8sS0FBUDtBQUNBO0FBTkYsYUFPTSxRQUFRLENBQUMsS0FQZjtVQVFFLElBQUMsQ0FBQSxZQUFELENBQWUsSUFBZjtBQUNBO0FBVEY7QUFVQSxhQVhEOztJQWFBLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBWSxJQUFaLENBQUg7TUFDQyxFQUFBLEdBQUssS0FETjtLQUFBLE1BQUE7TUFHQyxFQUFBLEdBQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBekIsQ0FBQSxFQUhOOztJQUlBLElBQUcsRUFBQSxLQUFNLElBQUMsQ0FBQSxTQUFWO0FBQ0MsYUFERDs7SUFHQSxJQUFDLENBQUEsU0FBRCxHQUFhO0lBRWIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxlQUFaLENBQTZCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBRSxHQUFGO0FBQzVCLFlBQUE7UUFBQSxJQUFHLGdDQUFIO0FBQ0MsaUJBQU8sTUFEUjs7UUFFQSxJQUFHLGVBQUksRUFBRSxDQUFFLGdCQUFYO0FBQ0MsaUJBQU8sS0FEUjs7UUFFQSxNQUFBLEdBQVMsR0FBRyxDQUFDLEtBQUosQ0FBVyxFQUFYO0FBQ1QsZUFBTztNQU5xQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsRUFPRSxLQVBGO0lBVUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUNiLElBQUMsQ0FBQSxTQUFELENBQUE7RUFsQ087O3lCQXFDUixJQUFBLEdBQU0sU0FBRSxFQUFGO0FBQ0wsUUFBQTs7TUFETyxLQUFLOztJQUNaLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxhQUFYO0lBRVIsb0JBQUEsd0NBQW9DLENBQUUsZ0JBQWYsR0FBMkIsQ0FBM0IsR0FBa0M7SUFDekQsSUFBQSxHQUFPO0lBQ1AsSUFBRyxFQUFIO01BQ0MsSUFBRyxDQUFFLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBZixDQUFBLEdBQXFCLElBQXhCO0FBQ0MsZUFERDs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUh4QjtLQUFBLE1BQUE7TUFLQyxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixHQUFxQixvQkFBckIsSUFBNkMsSUFBQyxDQUFBLFNBQWpEO0FBQ0MsZUFERDs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQVB4Qjs7SUFVQSxJQUFDLENBQUEsQ0FBRCxDQUFJLEtBQU8sQ0FBQSxJQUFDLENBQUEsU0FBRCxDQUFYLENBQXlCLENBQUMsV0FBMUIsQ0FBdUMsUUFBdkM7SUFDQSxPQUFBLEdBQVUsSUFBQyxDQUFBLENBQUQsQ0FBSSxLQUFPLENBQUEsT0FBQSxDQUFYLENBQXNCLENBQUMsUUFBdkIsQ0FBaUMsUUFBakM7SUFFVixJQUFHLElBQUMsQ0FBQSxTQUFKO01BQ0MsSUFBQSxHQUFPLE9BQU8sQ0FBQyxXQUFSLENBQUE7TUFDUCxJQUFBLEdBQU8sSUFBQSxHQUFPLENBQUUsT0FBQSxHQUFVLENBQVo7TUFDZCxNQUFBLEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVcsV0FBWDtNQUNULFFBQUEsR0FBVyxNQUFNLENBQUMsU0FBUCxDQUFBO01BQ1gsSUFBRyxJQUFBLEdBQU8sUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUF0QjtRQUNDLE1BQU0sQ0FBQyxTQUFQLENBQWtCLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBMUIsRUFERDtPQUFBLE1BRUssSUFBRyxJQUFBLEdBQU8sUUFBQSxHQUFXLElBQXJCO1FBQ0osTUFBTSxDQUFDLFNBQVAsQ0FBa0IsSUFBQSxHQUFPLElBQXpCLEVBREk7T0FQTjs7SUFVQSxJQUFDLENBQUEsU0FBRCxHQUFhO0VBNUJSOzt5QkErQk4sTUFBQSxHQUFPLFNBQUEsR0FBQTs7eUJBR1AsWUFBQSxHQUFjLFNBQUUsWUFBRjtBQUNiLFFBQUE7O01BRGUsZUFBYTs7SUFDNUIsSUFBTyxtQkFBSixJQUFlLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBbEI7TUFDQyxHQUFBLDJDQUFvQixDQUFFO01BQ3RCLElBQUMsQ0FBQSxLQUFELENBQVEsR0FBUixFQUZEOztJQUlBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVyxvQkFBWCxDQUFpQyxDQUFDLFdBQWxDLENBQStDLFFBQS9DLENBQXlELENBQUMsSUFBMUQsQ0FBQTtJQUVQLE9BQUEsR0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtJQUVWLElBQVEsY0FBSixJQUFjLElBQUMsQ0FBQSxXQUFELEtBQWtCLENBQWhDLElBQXNDLFlBQXRDLElBQXVELG9CQUFJLE9BQU8sQ0FBRSxnQkFBeEU7TUFDQyxJQUFDLENBQUEsS0FBRCxDQUFBO0FBQ0EsYUFGRDs7SUFJQSxJQUFPLFlBQVA7QUFDQyxhQUREOztJQUdBLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixvQkFBRyxJQUFJLENBQUUsYUFBTixJQUFhLENBQWIsSUFBbUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFsQztNQUNDLElBQUMsQ0FBQSxRQUFELENBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWlCLElBQUksQ0FBQyxFQUF0QixDQUFYLEVBREQ7S0FBQSxNQUVLLDBDQUFhLENBQUUsZUFBZjtNQUNKLElBQUMsQ0FBQSxRQUFELENBQWUsSUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBbUI7UUFBQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFNBQVI7UUFBbUIsTUFBQSxFQUFRLElBQTNCO09BQW5CLENBQWY7TUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVyxFQUFYLEVBRkk7S0FBQSxNQUFBO0FBSUosYUFKSTs7RUFuQlE7Ozs7R0EzT1ksT0FBQSxDQUFTLGVBQVQ7O0FBcVEzQixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ3ZRakIsSUFBQSxPQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBQ0wsUUFBQSxHQUFVLE9BQUEsQ0FBUyxtQkFBVDs7b0JBQ1YsU0FBQSxHQUFXLFNBQUE7QUFDVixRQUFBO0lBQUEsSUFBQSxHQUFPO0lBQ1AsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLE1BQVo7SUFDUixJQUFHLGFBQUg7TUFDQyxJQUFBLElBQVEsWUFBQSxHQUFlLE1BRHhCOztJQUdBLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxNQUFaO0lBQ1IsSUFBRyxhQUFIO01BQ0MsSUFBQSxJQUFRLFlBQUEsR0FBZSxNQUR4Qjs7QUFFQSxXQUFPO0VBVEc7O29CQVdYLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXO0lBQ1gsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLFFBQVEsQ0FBQyxVQUFULENBQUE7SUFFZCxJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUM7SUFFbEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVcsT0FBWCxFQUFvQixJQUFDLENBQUEsS0FBSyxDQUFDLEVBQTNCO0lBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFxQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUUsSUFBRixFQUFRLEVBQVI7QUFDcEIsWUFBQTtRQUFBLElBQUcsS0FBQyxDQUFBLE9BQUQsMkNBQXdCLENBQUUsWUFBYixDQUEyQixJQUEzQixXQUFiLElBQW1ELFlBQXREO1VBQ0MsRUFBQSxDQUFJLElBQUosRUFBVSxLQUFWLEVBREQ7O01BRG9CO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtFQVRXOztvQkFlWixNQUFBLEdBQ0M7SUFBQSxXQUFBLEVBQWEsUUFBYjtJQUNBLHlCQUFBLEVBQTJCLEtBRDNCOzs7b0JBSUQsTUFBQSxHQUFRLFNBQUUsVUFBRjtBQUNQLFFBQUE7SUFBQSxLQUFBLEdBQVE7QUFDUjtBQUFBLFNBQUEsaURBQUE7O0FBQ0M7UUFDQyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBWCxFQUREO09BQUEsYUFBQTtRQUVNO0FBQ0w7VUFDQyxPQUFPLENBQUMsS0FBUixDQUFjLDJCQUFBLEdBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBMUMsR0FBZ0QsV0FBaEQsR0FBMEQsQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQWYsQ0FBRCxDQUExRCxHQUEyRixZQUEzRixHQUFzRyxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBLENBQWhCLENBQUQsQ0FBcEgsRUFERDtTQUFBLGFBQUE7VUFFTTtVQUNMLE9BQU8sQ0FBQyxLQUFSLENBQWMsa0JBQWQsRUFIRDtTQUhEOztBQUREO0lBU0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLFFBQUQsQ0FDVDtNQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBQSxDQUFQO01BQ0EsUUFBQSxFQUFVLEtBRFY7TUFFQSxJQUFBLEVBQU0sSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksTUFBWixDQUZOO01BR0EsSUFBQSxFQUFNLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFZLE1BQVosQ0FITjtNQUlBLE1BQUEsRUFBUSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxRQUFaLENBQUEsSUFBMEIsS0FKbEM7S0FEUyxDQUFWO0lBT0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsQ0FBRCxDQUFJLFlBQUo7SUFDUixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxDQUFELENBQUksYUFBSjtJQUVaLElBQUMsQ0FBQSxXQUFELENBQWMsVUFBZDtBQUNBLFdBQU8sSUFBQyxDQUFBO0VBdEJEOztvQkF3QlIsTUFBQSxHQUFRLFNBQUUsSUFBRjtBQUNQLFFBQUE7SUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFKO0FBQ0MsYUFERDs7SUFFQSxJQUFHLGNBQUEsSUFBVSxDQUFBLENBQUcsSUFBSSxDQUFDLE1BQVIsQ0FBZ0IsQ0FBQyxFQUFqQixDQUFxQixnQkFBckIsQ0FBVixJQUFzRCxnRUFBekQ7TUFDQyxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBbUIsSUFBbkI7TUFDQSxJQUFJLENBQUMsY0FBTCxDQUFBO01BQ0EsSUFBSSxDQUFDLGVBQUwsQ0FBQTtBQUNBLGFBSkQ7O0lBTUEsSUFBRyxjQUFBLElBQVUsQ0FBQSxDQUFHLElBQUksQ0FBQyxNQUFSLENBQWdCLENBQUMsRUFBakIsQ0FBcUIsa0JBQXJCLENBQVYsSUFBd0Qsb0VBQTNEO01BQ0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQXFCLElBQXJCO01BQ0EsSUFBSSxDQUFDLGNBQUwsQ0FBQTtNQUNBLElBQUksQ0FBQyxlQUFMLENBQUE7QUFDQSxhQUpEOztJQU1BLElBQUcsQ0FBSSxJQUFDLENBQUEsT0FBTCxJQUFpQix5QkFBcEI7TUFDQyxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBb0IsSUFBcEIsRUFERDs7O01BRUEsSUFBSSxDQUFFLGNBQU4sQ0FBQTs7O01BQ0EsSUFBSSxDQUFFLGVBQU4sQ0FBQTs7SUFDQSxJQUFDLENBQUEsT0FBRCxDQUFVLFFBQVY7RUFuQk87O29CQXNCUixHQUFBLEdBQUssU0FBRSxJQUFGO0lBQ0osSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBWSxRQUFaLENBQUg7QUFDQyxhQUREOzs7TUFHQSxJQUFJLENBQUUsZUFBTixDQUFBOzs7TUFDQSxJQUFJLENBQUUsY0FBTixDQUFBOztJQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFxQixVQUFyQixFQUFpQyxJQUFDLENBQUEsS0FBbEM7SUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBaUIsSUFBQyxDQUFBLEtBQWxCO0lBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxPQUFELENBQVUsUUFBVjtBQUNBLFdBQU87RUFWSDs7b0JBWUwsTUFBQSxHQUFRLFNBQUE7QUFDUCxRQUFBO0lBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVzs7U0FDQSxDQUFFLE1BQWIsQ0FBQTs7SUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0FBQ1YsV0FBTyxxQ0FBQSxTQUFBO0VBSkE7O29CQU1SLFFBQUEsR0FBVSxTQUFFLE1BQUYsRUFBVSxJQUFWO0lBQ1QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQWEsTUFBYixFQUFxQjtNQUFFLEtBQUEsRUFBTyxJQUFUO0tBQXJCO0lBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxPQUFELENBQVUsVUFBVixFQUFzQixJQUFDLENBQUEsS0FBdkIsRUFBOEIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLENBQUEsQ0FBOUIsRUFBd0QsSUFBeEQ7RUFIUzs7b0JBTVYsT0FBQSxHQUFTLFNBQUUsTUFBRixFQUFVLElBQVY7SUFDUixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZ0IsTUFBaEI7SUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBVSxVQUFWLEVBQXNCLElBQUMsQ0FBQSxLQUF2QixFQUE4QixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVosQ0FBQSxDQUE5QixFQUF3RCxJQUF4RDtJQUdBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLElBQWtCLENBQWxCLElBQXdCLENBQUksSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUEzQztNQUNDLElBQUMsQ0FBQSxHQUFELENBQUEsRUFERDs7RUFOUTs7b0JBVVQsWUFBQSxHQUFjLFNBQUE7SUFDYixJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZ0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxZQUFaLENBQUEsQ0FBaEI7RUFEYTs7b0JBSWQsTUFBQSxHQUFRLFNBQUE7QUFDUCxXQUFPO0VBREE7O29CQUdSLEtBQUEsR0FBTyxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUcsdUJBQUg7O1dBQ1ksQ0FBRSxLQUFiLENBQUE7O0FBQ0EsYUFGRDs7SUFHQSxJQUFDLENBQUEsSUFBRCxDQUFBO0VBSk07O29CQU9QLEtBQUEsR0FBTyxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFHLHVCQUFIOztXQUNZLENBQUUsR0FBYixDQUFBOzs7WUFDVyxDQUFFLEtBQWIsQ0FBQTs7QUFDQSxhQUhEOztFQUZNOztvQkFRUCxXQUFBLEdBQWEsU0FBRSxVQUFGO0FBQ1osUUFBQTtJQUFBLElBQUcsdUJBQUg7TUFDQyxJQUFDLENBQUEsZUFBRCxDQUFBO0FBQ0EsYUFBTyxJQUFDLENBQUEsV0FGVDs7SUFJQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFnQjtNQUFBLEdBQUEsRUFBSyxJQUFMO01BQVEsS0FBQSxFQUFPLElBQUMsQ0FBQSxLQUFoQjtNQUF1QixFQUFBLEVBQUksSUFBQyxDQUFBLElBQTVCO0tBQWhCO0lBQ2xCLElBQUMsQ0FBQSxlQUFELENBQUE7SUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBYSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBb0IsVUFBcEIsQ0FBYjtJQUNBLElBQUcsZ0VBQUg7TUFDQyxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQSxFQUREOztFQVRZOztvQkFhYixlQUFBLEdBQWlCLFNBQUE7SUFDaEIsSUFBRyxDQUFJLElBQUMsQ0FBQSxVQUFVLENBQUMsaUJBQW5CO01BQ0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsUUFBZixFQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUUsTUFBRixFQUFVLElBQVY7VUFDeEIsS0FBQyxDQUFBLE9BQUQsR0FBVztVQUNYLElBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVksUUFBWixDQUFIO0FBQ0MsbUJBREQ7O1VBR0EsSUFBd0IsQ0FBSSxNQUFNLENBQUMsTUFBbkM7WUFBQSxLQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQSxFQUFBOztVQUVBLEtBQUMsQ0FBQSxPQUFELENBQVUsUUFBVixFQUFvQixNQUFwQixFQUE0QixJQUE1QjtVQUNBLElBQWEsQ0FBSSxNQUFNLENBQUMsTUFBeEI7WUFBQSxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUE7O1FBUndCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtNQVdBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLFVBQWYsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFFLEdBQUYsRUFBTyxJQUFQO1VBQzFCLElBQUcsR0FBSDtZQUNDLEtBQUMsQ0FBQSxRQUFELENBQVcsR0FBWCxFQUFnQixJQUFoQixFQUREOztRQUQwQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0I7TUFLQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxTQUFmLEVBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBRSxHQUFGO1VBQ3pCLElBQUcsR0FBSDtZQUNDLEtBQUMsQ0FBQSxPQUFELENBQVUsR0FBVixFQUREOztRQUR5QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUI7TUFLQSxJQUFDLENBQUEsVUFBVSxDQUFDLGlCQUFaLEdBQWdDLEtBdEJqQzs7RUFEZ0I7O29CQTBCakIsYUFBQSxHQUFlLFNBQUUsR0FBRjtJQUNkLElBQUcsdUJBQUg7QUFDQyxhQUFPLElBQUMsQ0FBQSxVQUFVLENBQUMsYUFBWixDQUEyQixHQUEzQixFQURSOztBQUVBLFdBQU87RUFITzs7b0JBS2YsSUFBQSxHQUFNLFNBQUE7QUFDTCxRQUFBO0lBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQTs7U0FFVyxDQUFFLEtBQWIsQ0FBQTs7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXO0VBSk47Ozs7R0FuTGUsUUFBUSxDQUFDOztBQTZML0IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUM3TGpCOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1haW5WaWV3ID0gcmVxdWlyZSggXCIuL3ZpZXdzL21haW5cIiApXG5GYWNldHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0c1wiIClcbkZjdFN0cmluZyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc3RyaW5nXCIgKVxuRmN0QXJyYXkgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2FycmF5XCIgKVxuRmN0U2VsZWN0ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zZWxlY3RcIiApXG5GY3ROdW1iZXIgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X251bWJlclwiIClcbkZjdFJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9yYW5nZVwiIClcbkZjdERhdGVSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlXCIgKVxuRmN0RXZlbnQgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2V2ZW50XCIgKVxuUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvcmVzdWx0c1wiIClcblxuSUdHWV9JRFggPSAxXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGpRdWVyeTogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzLCBvcHRpb25zIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKCBudWxsLCBvcHRpb25zIClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0QHZpZXcgPSBuZXcgTWFpblZpZXcoIHsgbWFpbjogQCwgZWw6IEAkZWwsIGNvbGxlY3Rpb246IEBmYWNldHMsIHJlc3VsdHM6IEByZXN1bHRzLCBidXR0b25zRmlyc3Q6ICggb3B0aW9ucy5idXR0b25zRmlyc3Qgb3IgZmFsc2UgKSwgc2VhcmNoQnV0dG9uOiBvcHRpb25zLnNlYXJjaEJ1dHRvbiwgaWR4OiBJR0dZX0lEWCsrIH0gKVxuXHRcdFxuXHRcdEB2aWV3Lm9uIFwic2VhcmNoYnV0dG9uXCIsIEB0cmlnZ2VyRXZlbnRcblxuXHRcdEBub25FbXB0eVJlc3VsdHMgPSBAcmVzdWx0cy5zdWIoIEBfZmlsdGVyRW1wdHkgKVxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRWw6ICggZWwgKT0+XG5cblx0XHRpZiBub3QgZWw/XG5cdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVNSVNTSU5HRUxcIiApXG5cblx0XHRpZiBfLmlzU3RyaW5nKCBlbCApXG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxTVFJJTkdcIiApXG5cblx0XHRcdF8kZWwgPSBAJCggZWwgKVxuXHRcdFx0aWYgbm90IF8kZWw/Lmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxTVFJJTkdcIiApXG5cblx0XHRcdHJldHVybiBfJGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIGpRdWVyeVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMSlFVRVJZXCIgKVxuXG5cdFx0XHQjIFRPRE8gaGFuZGxlIG11bHRpcGxlIGpRdWVyeSBlbGVtZW50cyB0byBJR0dZIGluc3RhbmNlc1xuXHRcdFx0aWYgZWwubGVuZ3RoID4gMVxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVTSVpFRUxKUVVFUllcIiApXG5cblx0XHRcdHJldHVybiBlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBFbGVtZW50XG5cdFx0XHRyZXR1cm4gQCQoIGVsIClcblxuXHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFRZUEVcIiApXG5cblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUZhY2V0czogKCBmYWNldHMsIG9wdGlvbnM9e30gKT0+XG5cdFx0X3JldCA9IFtdXG5cdFx0Zm9yIGZhY2V0LCBfaWR4IGluIGZhY2V0cyB3aGVuICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdF9mY3QuX2lkeCA9IF9pZHhcblx0XHRcdF9yZXQucHVzaCBfZmN0XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBGYWNldHMoIF9yZXQsIG9wdGlvbnMgKVxuXG5cdF9jcmVhdGVGYWNldDogKCBmYWNldCApLT5cblx0XHRzd2l0Y2ggZmFjZXQudHlwZS50b0xvd2VyQ2FzZSgpXG5cdFx0XHR3aGVuIFwic3RyaW5nXCIgdGhlbiByZXR1cm4gbmV3IEZjdFN0cmluZyggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcInNlbGVjdFwiIHRoZW4gcmV0dXJuIG5ldyBGY3RTZWxlY3QoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJhcnJheVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RBcnJheSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcIm51bWJlclwiIHRoZW4gcmV0dXJuIG5ldyBGY3ROdW1iZXIoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJyYW5nZVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RSYW5nZSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImRhdGVyYW5nZVwiIHRoZW4gcmV0dXJuIG5ldyBGY3REYXRlUmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJldmVudFwiIHRoZW4gcmV0dXJuIG5ldyBGY3RFdmVudCggZmFjZXQsIG1haW46IEAgKVxuXG5cdGFkZEZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdGlmIG5vdCBAZmFjZXRzP1xuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0QGZhY2V0cy5hZGQoIF9mY3QgKVxuXHRcdHJldHVybiBAXG5cblx0X2Vycm9yOiAoIHR5cGUsIGRhdGEgPSB7fSApPT5cblx0XHRpZiBAZXJyb3JzWyB0eXBlIF0/XG5cdFx0XHRfbXNnID0gQGVycm9yc1sgdHlwZSBdKCBkYXRhIClcblx0XHRlbHNlXG5cdFx0XHRfbXNnID0gXCItXCJcblx0XHRfZXJyID0gbmV3IEVycm9yKClcblx0XHRfZXJyLm5hbWUgPSB0eXBlXG5cdFx0X2Vyci5tZXNzYWdlID0gX21zZ1xuXHRcdHJldHVybiBfZXJyXG5cblx0X2ZpbHRlckVtcHR5OiAoIG1vZGVsICk9PlxuXHRcdF92ID0gbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIG5vdCBfdj9cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdGlmIF92Lmxlbmd0aCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0XHRyZXR1cm4gdHJ1ZVxuXHRcblx0Z2V0UXVlcnk6ID0+XG5cdFx0cmV0dXJuIEBub25FbXB0eVJlc3VsdHNcblxuXHR0cmlnZ2VyQ2hhbmdlOiA9PlxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRAdHJpZ2dlciggXCJjaGFuZ2VcIiwgQG5vbkVtcHR5UmVzdWx0cyApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XG5cdHRyaWdnZXJFdmVudDogKCBldmVudE5hbWUgKT0+XG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEB0cmlnZ2VyKCBldmVudE5hbWUsIEBub25FbXB0eVJlc3VsdHMgKVxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdF9pbml0RXJyb3JzOiA9PlxuXHRcdEBlcnJvcnMgPSB7fVxuXHRcdGZvciBfaywgX3RtcGwgb2YgQEVSUk9SUygpXG5cdFx0XHRAZXJyb3JzWyBfayBdID0gXy50ZW1wbGF0ZSggX3RtcGwgKVxuXHRcdHJldHVyblxuXG5cdEVSUk9SUzogLT5cblx0XHRcIkVJTlZBTElERUxTVFJJTkdcIjogXCJJZiB5b3UgZGVmaW5lIGEgYGVsYCBhcyBTdHJpbmcgaXQgaGFzIHRvIGJlIGEgdmFsaWQgc2VsZWN0b3IgZm9yIGFuIGV4aXN0aW5nIERPTSBlbGVtZW50LlwiXG5cdFx0XCJFRU1QVFlFTFNUUklOR1wiOiBcIlRoZSBgZWxgIGFzIHN0cmluZyBjYW4gbm90IGJlIGVtcHR5LlwiXG5cdFx0XCJFRU1QVFlFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhbiBlbXB0eSBjb2xsZWN0aW9uLlwiXG5cdFx0XCJFU0laRUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGEgcmVzdWx0IG9mIG9uZSBlbC5cIlxuXHRcdFwiRUlOVkFMSURFTFRZUEVcIjogXCJUaGUgYGVsYCBjYW4gb25seSBiZSBhIHNlbGVjdG9yIHN0cmluZywgZG9tIGVsZW1lbnQgb3IgalF1ZXJ5IGNvbGxlY3Rpb25cIlxuXHRcdFwiRU1JU1NJTkdFTFwiOiBcIlBsZWFzZSBkZWZpbmUgYSB0YXJnZXQgYGVsYFwiXG5cbm1vZHVsZS5leHBvcnRzID0gSUdHWVxuIiwiIyMjXG5FWEFNUExFIFVTQUdFXG5cblx0cGFyZW50Q29sbCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uLlN1YigpXG5cdFxuXHQjIGJ5IEFycmF5XG5cdHN1YkNvbGxBID0gcGFyZW50Q29sbC5zdWIoIFsgMSwgMiwgMyBdIClcblx0XG5cdCMgb3IgYnkgT2JqZWN0XG5cdHN1YkNvbGxPID0gcGFyZW50Q29sbC5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgb3IgYnkgTnVtYmVyXG5cdHN1YkNvbGxOID0gcGFyZW50Q29sbC5zdWIoIDEzIClcblx0XG5cdCMgb3IgYnkgRnVuY3Rpb25cblx0c3ViQ29sbEYgPSBwYXJlbnRDb2xsLnN1YiggKCggbW9kZWwgKS0+IGlmIG1vZGVsLmdldCggXCJhZ2VcIiApID4gMjMgKSApXG5cdFxuXHQjIHN1YmNvbGxlY3Rpb24gb2Ygc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQV9PID0gc3ViQ29sbEEuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gRm9yIHRoaXMgYSBgcmVzZXRgIHdpbGwgYmUgZmlyZWQgb24gdGhlIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEEgPSBzdWJDb2xsQS51cGRhdGVTdWJGaWx0ZXIoIHsgbmFtZTogXCJCYXJcIiwgYWdlOiA0MiB9IClcbiMjI1xuXG5jbGFzcyBCYWNrYm9uZVN1YiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0IyMjXG5cdCMjIHN1YlxuXHRcblx0YGNvbGxlY3Rpb24uc3ViKCBmaWx0ZXIgKWBcblx0XG5cdEdlbmVyYXRlIGEgc3ViLWNvbGxlY3Rpb24gYnkgYSBmaWx0ZXIuXG5cdFRoZSBtb2RlbHMgd2lsbCBiZSBkaXN0cmlidXRlZCB3aXRoaW4gYWxsIGludm9sdmVkIGNvbGxlY3Rpb25zIHVuZGVyIGNvbnNpZGVyYXRpb24gb2YgdGhlIGZpbHRlci5cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgQ29sbGVjdGlvbiB9IEEgU3ViLUNvbGxlY3Rpb24gYmFzZWQgb24gdGhlIGZpbHRlclxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHN1YjogKCBmaWx0ZXIgKT0+XG5cdFx0QHN1YkNvbGxzIG9yPSBbXVxuXHRcdGZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClcblxuXHRcdCMgZmlsdGVyIHRoZSBjb2xsZWN0aW9uXG5cdFx0X21vZGVscyA9IEBmaWx0ZXIgZm5GaWx0ZXJcblx0XHQjIGNyZWF0ZSB0aGUgc3ViY29sbGVjdGlvblxuXHRcdF9zdWIgPSBuZXcgQGNvbnN0cnVjdG9yKCBfbW9kZWxzLCBAX3N1YkNvbGxlY3Rpb25PcHRpb25zKCkgKVxuXG5cdFx0X3N1Yi5fcGFyZW50Q29sID0gQFxuXHRcdF9zdWIuX2ZuRmlsdGVyID0gZm5GaWx0ZXJcblxuXHRcdCMgYWRkIGV2ZW50IGhhbmRsZXJzIHRvIGRpc3RyaWJ1dGUgdGhlIG1vZGVscyB0aHJvdWdoIHRoZSBzdWIgY29sbGVjdGlvbnMgdHJlZVxuXG5cdFx0IyByZWNoZWNrIHRoZSBtb2RlbCBhZ2FpbnN0IHRoZSBmaWx0ZXIgb24gY2hhbmdlXG5cdFx0QG9uIFwiY2hhbmdlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdHRvQWRkID0gQF9mbkZpbHRlciggX20gKVxuXHRcdFx0YWRkZWQgPSBAZ2V0KCBfbSApP1xuXHRcdFx0aWYgYWRkZWQgYW5kIG5vdCB0b0FkZFxuXHRcdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRlbHNlIGlmIG5vdCBhZGRlZCBhbmQgdG9BZGRcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIGJhc2UgY29sbGVjdGlvbiBvbiBhZGQgdG8gc3ViXG5cdFx0X3N1Yi5vbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBzdWIgY29sbGVjdGlvbiBvbiBhZGQgdG8gYmFzZSBpZiBpdCBtYXRjaGVzIHRoZSBmaWx0ZXJcblx0XHRAb24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0aWYgQF9mbkZpbHRlciggX20gKVxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdF9zdWIub24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0I0ByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZW1vdmVcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRAb24gXCJyZXNldFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAdXBkYXRlU3ViRmlsdGVyKClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHN0b3JlIHRoZSBzdWJjb2xsZWN0aW9uIHVuZGVyIHRoZSBjdXJyZW50IGNvbGxlY3Rpb25cblx0XHRAc3ViQ29sbHMucHVzaCggX3N1YiApXG5cblx0XHRyZXR1cm4gX3N1YlxuXHRcblx0IyMjXG5cdCMjIF9zdWJDb2xsZWN0aW9uT3B0aW9uc1xuXHRcblx0YGNvbGxlY3Rpb24uX3N1YkNvbGxlY3Rpb25PcHRpb25zKClgXG5cdFxuXHRPdmVyd3JpdGFibGUgbWV0aG9kIHRvIHNldCB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBmb3Igc3ViIGNvbGxlY3Rpb25zXG5cdFxuXHRAcmV0dXJuIHsgT2JqZWN0IH0gVGhlIG9wdGlvbnMgb2JqZWN0XG5cdFxuXHRAYXBpIHByaXZhdGVcblx0IyMjXG5cdF9zdWJDb2xsZWN0aW9uT3B0aW9uczogPT5cblx0XHRfb3B0cyA9XG5cdFx0XHRjb21wYXJhdG9yOiBAY29tcGFyYXRvclxuXHRcdHJldHVybiBfb3B0c1xuXG5cdCMjI1xuXHQjIyB1cGRhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLnVwZGF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRNZXRob2QgdG8gdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBUaGVuIGFsbCBtb2RlbHMgd2lsbCBiZSByZXNldGUgYnkgdGhlIG5ldyBmaWx0ZXIuIFNvIHlvdSBoYXZlIHRvIGxpc3RlbiB0byB0ZWggcmVzZXQgZXZlbnRcblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgU2VsZiB9IGl0c2VsZlxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHVwZGF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIsIGFzUmVzZXQgPSB0cnVlICk9PlxuXHRcdGlmIEBfcGFyZW50Q29sP1xuXG5cdFx0XHQjIHNldCB0aGUgbmV3IGZpbHRlciBtZXRob2Rcblx0XHRcdEBfZm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKSBpZiBmaWx0ZXI/XG5cblx0XHRcdF9tb2RlbHMgPSBAX3BhcmVudENvbC5maWx0ZXIoIEBfZm5GaWx0ZXIgKVxuXG5cdFx0XHQjIHJlc2V0IHRoZSBjb2xsZWN0aW9uIHdpdGggdGhlIG5ldyBtb2RlbHNcblx0XHRcdGlmIGFzUmVzZXRcblx0XHRcdFx0QHJlc2V0KCBfbW9kZWxzIClcblx0XHRcdFx0cmV0dXJuIEBcblxuXHRcdFx0bmV3aWRzID0gXy5wbHVjayggX21vZGVscywgXCJjaWRcIiApXG5cdFx0XHRjdXJyaWRzID0gXy5wbHVjayggQG1vZGVscywgXCJjaWRcIiApXG5cdFx0XHRmb3IgcmlkIGluIF8uZGlmZmVyZW5jZSggY3VycmlkcywgbmV3aWRzIClcblx0XHRcdFx0QHJlbW92ZSggcmlkIClcblx0XHRcdFx0XG5cdFx0XHRfYWRkSWRzID0gXy5kaWZmZXJlbmNlKCBuZXdpZHMsIGN1cnJpZHMgKVxuXHRcdFx0Zm9yIG1kbCBpbiBfbW9kZWxzIHdoZW4gbWRsLmNpZCBpbiBfYWRkSWRzXG5cdFx0XHRcdEBhZGQoIG1kbCApXG5cblx0XHRyZXR1cm4gQFxuXG5cblx0IyMjXG5cdCMjIF9nZW5lcmF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24uX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdEludGVybmFsIG1ldGhvZCB0aCBjb252ZXJ0IGEgZmlsdGVyIGFyZ3VtZW50IHRvIGEgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IEZ1bmN0aW9uIH0gVGhlIGdlbmVyYXRlZCBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X2dlbmVyYXRlU3ViRmlsdGVyOiAoIGZpbHRlciApLT5cblx0XHQjIGNvbnN0cnVjdCB0aGUgZmlsdGVyIGZ1bmN0aW9uXG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNBcnJheSggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0X20uaWQgaW4gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzU3RyaW5nKCBmaWx0ZXIgKSBvciBfLmlzTnVtYmVyKCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpcyBmaWx0ZXJcblx0XHRlbHNlXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdGZvciBfbm0sIF92bCBvZiBmaWx0ZXJcblx0XHRcdFx0XHRpZiBfbS5nZXQoIF9ubSApIGlzbnQgX3ZsXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdHJldHVybiBmbkZpbHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lU3ViXG4iLCJjbGFzcyBGY3RBcnJheSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9zdHJpbmdcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YmFycmF5XCIgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0QXJyYXlcbiIsImNsYXNzIEZhY2V0QmFzZSBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcIm5hbWVcIlxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9iYXNlXCIgKVxuXHRcblx0Y29uc3RydWN0b3I6ICggYXR0cnMsIG9wdGlvbnMgKS0+XG5cdFx0QG1haW4gPSBvcHRpb25zLm1haW5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0ZGVmYXVsdHM6IC0+XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IFwibmFtZVwiXG5cdFx0bGFiZWw6IFwiRGVzY3JpcHRpb25cIlxuXHRcdHNvcnQ6IDBcblxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiIClcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwibmFtZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuXHRjb21wYXJhdG9yOiAoIG1kbCApLT5cblx0XHRyZXR1cm4gbWRsLmlkXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRCYXNlXG4iLCJjbGFzcyBGY3REYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvZGF0ZXJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRzOiB7fVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3REYXRlUmFuZ2VcbiIsImNsYXNzIEZjdEV2ZW50IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IG51bGxcblx0b25seUV4ZWM6IHRydWVcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblx0XHRcblx0ZXhlYzogKCApPT5cblx0XHRAbWFpbi50cmlnZ2VyKCBAZ2V0KCBcImV2ZW50XCIgKSwgQHRvSlNPTigpIClcblx0XHRyZXR1cm5cbm1vZHVsZS5leHBvcnRzID0gRmN0RXZlbnRcbiIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdE51bWJlclxuIiwiY2xhc3MgRmN0UmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VicmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFJhbmdlXG4iLCJjbGFzcyBGY3RTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic2VsZWN0XCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQoIHN1cGVyLCB7XG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFx0d2FpdEZvckFzeW5jOiB0cnVlXG5cdFx0fSlcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTZWxlY3RcbiIsImNsYXNzIEZjdFN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmdcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nXG4iLCJzb3J0Q29sbCA9IHJlcXVpcmUoIFwic29ydGNvbGxcIiApXG5cbmZuR2V0ID0gKCBlbCwga2V5ICktPlxuXHRyZXR1cm4gZWwuZ2V0KCBrZXkgKVxuXG5jbGFzcyBJZ2d5RmFjZXRzIGV4dGVuZHMgcmVxdWlyZSggXCIuL2JhY2tib25lX3N1YlwiIClcblx0XG5cdGNvbnN0cnVjdG9yOiAoIG1vZGVscywgb3B0aW9ucz17fSApLT5cblx0XHRpZiBub3Qgb3B0aW9ucy5jb21wYXJhdG9yP1xuXHRcdFx0X2ZvcndhcmQgPSBzd2l0Y2ggb3B0aW9ucy5kaXJcblx0XHRcdFx0d2hlbiBcImFzY1wiIHRoZW4gdHJ1ZVxuXHRcdFx0XHR3aGVuIFwiZGVzY1wiIHRoZW4gZmFsc2Vcblx0XHRcdFx0ZWxzZSB0cnVlXG5cdFx0XHRcblx0XHRcdG9wdGlvbnMuY29tcGFyYXRvciA9IHNvcnRDb2xsKCBbIFwic29ydFwiIF0uY29uY2F0KCBvcHRpb25zLnNvcnRieSBvciBcIm5hbWVcIiApLCB7IHNvcnQ6IGZhbHNlLCBcIj9cIjogX2ZvcndhcmQgfSwgZm5HZXQgKVxuXHRcdHJldHVybiBzdXBlciggbW9kZWxzLCBvcHRpb25zIClcblx0XG5cdF9zdWJDb2xsZWNjdGlvbk9wdGlvbnM6ID0+XG5cdFx0b3B0ID0gc3VwZXJcblx0XHRvcHQuZGlyID0gaWYgQGZvcndhcmQgdGhlbiBcImFzY1wiIGVsc2UgXCJkZXNjXCJcblx0XHRyZXR1cm4gb3B0XG5cdFxuXHRtb2RlbElkOiAoYXR0cnMpLT5cblx0XHRyZXR1cm4gYXR0cnMubmFtZVxuXHRcdFxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5RmFjZXRzXG4iLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBudWxsXG5cdFx0dmFsdWU6IG51bGxcblxuY2xhc3MgSWdneVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogSWdneVJlc3VsdFxuXHRpbml0aWFsaXplOiAoIG1kbHMsIG9wdHMgKT0+XG5cdFx0aWYgb3B0cy5tb2RpZnlLZXk/Lmxlbmd0aFxuXHRcdFx0QG1vZGlmeUtleSA9IG9wdHMubW9kaWZ5S2V5XG5cdFx0cmV0dXJuXG5cdHBhcnNlOiAoIGF0dHIsIG9wdGlvbnMgKT0+XG5cdFx0X2tleSA9IG9wdGlvbnMuX2ZhY2V0LmdldCggXCJtb2RpZnlLZXlcIiApIG9yIEBtb2RpZnlLZXkgb3IgXCJ2YWx1ZVwiXG5cdFx0X21vZGlmeSA9IG9wdGlvbnMuX2ZhY2V0Py5nZXQoIFwibW9kaWZ5XCIgKVxuXHRcdGlmIF9tb2RpZnk/IGFuZCBfLmlzRnVuY3Rpb24oIF9tb2RpZnkgKVxuXHRcdFx0YXR0clsgX2tleSBdID0gX21vZGlmeSggYXR0ci52YWx1ZSwgb3B0aW9ucy5fZmFjZXQsIGF0dHIgKVxuXHRcdHJldHVybiBhdHRyXG5cbm1vZHVsZS5leHBvcnRzID0gSWdneVJlc3VsdHNcbiIsImNsYXNzIEJhc2VSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBAaWRBdHRyaWJ1dGUgKSBvciBcIlwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzXG4iLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjdXN0b20sIGlkLCB0eHQpIHtcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSB0eHQpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvc3Bhbj48c3BhbiBjbGFzcz1cXFwiYnRuLXdycFxcXCI+PGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInJtLXJlc3VsdC1idG4gZmEgZmEtdGltZXNcXFwiPjwvaT5cIik7XG5pZiAoIGN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImVkaXQtcmVzdWx0LWJ0biBmYSBmYS1wZW5jaWxcXFwiPjwvaT5cIik7XG59XG5idWYucHVzaChcIjwvc3Bhbj5cIik7fS5jYWxsKHRoaXMsXCJjdXN0b21cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1c3RvbTp0eXBlb2YgY3VzdG9tIT09XCJ1bmRlZmluZWRcIj9jdXN0b206dW5kZWZpbmVkLFwiaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmlkOnR5cGVvZiBpZCE9PVwidW5kZWZpbmVkXCI/aWQ6dW5kZWZpbmVkLFwidHh0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50eHQ6dHlwZW9mIHR4dCE9PVwidW5kZWZpbmVkXCI/dHh0OnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwiZGF0ZXJhbmdlLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG9wZXJhdG9yLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmlmICggb3BlcmF0b3JzICYmIG9wZXJhdG9ycy5sZW5ndGgpXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcIm9wZXJhdG9yXFxcIj48c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJvcFwiLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgdmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJvcGVyYXRvclwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3I6dHlwZW9mIG9wZXJhdG9yIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcjp1bmRlZmluZWQsXCJvcGVyYXRvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yczp0eXBlb2Ygb3BlcmF0b3JzIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicmFuZ2VpbnBcXFwiPlwiKTtcbnZhciBfdmFscyA9IHZhbHVlID8gdmFsdWUgOiBbXVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl9mcm9tXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS1mcm9tXFxcIi8+PHNwYW4gY2xhc3M9XFxcInNlcGFyYXRvclxcXCI+LTwvc3Bhbj48aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl90b1wiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzFdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtdG9cXFwiLz48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbjtyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgbXVsdGlwbGUsIG9wdGlvbkdyb3Vwcywgb3B0aW9ucywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuaWYgKCBvcHRpb25Hcm91cHMpXG57XG4vLyBpdGVyYXRlIG9wdGlvbkdyb3Vwc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25Hcm91cHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBnbmFtZSA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZ25hbWUgPCAkJGw7IGduYW1lKyspIHtcbiAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBnbmFtZSBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlXG57XG4vLyBpdGVyYXRlIG9wdGlvbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9ucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+XCIpO1xuaWYgKCBtdWx0aXBsZSlcbntcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcImJ0biBidG4teHMgYnRuLXN1Y2Nlc3Mgc2VsZWN0LWNoZWNrIGZhIGZhLWNoZWNrXFxcIj48L3NwYW4+XCIpO1xufX0uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm11bHRpcGxlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5tdWx0aXBsZTp0eXBlb2YgbXVsdGlwbGUhPT1cInVuZGVmaW5lZFwiP211bHRpcGxlOnVuZGVmaW5lZCxcIm9wdGlvbkdyb3Vwc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uR3JvdXBzOnR5cGVvZiBvcHRpb25Hcm91cHMhPT1cInVuZGVmaW5lZFwiP29wdGlvbkdyb3Vwczp1bmRlZmluZWQsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIGlucHZhbCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgaW5wdmFsLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwiaW5wdmFsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pbnB2YWw6dHlwZW9mIGlucHZhbCE9PVwidW5kZWZpbmVkXCI/aW5wdmFsOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHBpbm5lZCwgc2VsZWN0ZWQsIHVuZGVmaW5lZCkge1xuaWYgKCAhcGlubmVkKVxue1xuYnVmLnB1c2goXCI8aSBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXRpbWVzXFxcIj48L2k+XCIpO1xufVxuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwic3VibGFiZWxcXFwiPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGxhYmVsKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI6PC9zcGFuPjx1bCBjbGFzcz1cXFwic3VicmVzdWx0c1xcXCI+XCIpO1xuaWYgKCBzZWxlY3RlZCAmJiBzZWxlY3RlZC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIHNlbGVjdGVkXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHNlbGVjdGVkO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT48c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGkgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS10aW1lc1xcXCI+PC9pPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxpIGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtdGltZXNcXFwiPjwvaT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjxkaXYgY2xhc3M9XFxcInN1YnNlbGVjdCBjbG9zZWRcXFwiPjwvZGl2PjxkaXYgY2xhc3M9XFxcImxvYWRlclxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNvZyBmYS1zcGluXFxcIj48L2k+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwibGFiZWxcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxhYmVsOnR5cGVvZiBsYWJlbCE9PVwidW5kZWZpbmVkXCI/bGFiZWw6dW5kZWZpbmVkLFwicGlubmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5waW5uZWQ6dHlwZW9mIHBpbm5lZCE9PVwidW5kZWZpbmVkXCI/cGlubmVkOnVuZGVmaW5lZCxcInNlbGVjdGVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWxlY3RlZDp0eXBlb2Ygc2VsZWN0ZWQhPT1cInVuZGVmaW5lZFwiP3NlbGVjdGVkOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChzZWFyY2hCdXR0b24pIHtcbmlmICggc2VhcmNoQnV0dG9uICE9IHVuZGVmaW5lZCAmJiBzZWFyY2hCdXR0b24udGVtcGxhdGUgIT0gdW5kZWZpbmVkICYmIHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZS5sZW5ndGggPj0gMClcbntcbmJ1Zi5wdXNoKFwiPGJ1dHRvblwiICsgKGphZGUuY2xzKFsnc2VhcmNoLWJ0bicsc2VhcmNoQnV0dG9uLmNzc2NsYXNzLHtcInNlYXJjaC1idG4tcHVsbHJpZ2h0XCI6c2VhcmNoQnV0dG9uLnB1bGxyaWdodH1dLCBbbnVsbCx0cnVlLHRydWVdKSkgKyBcIj5cIiArIChudWxsID09IChqYWRlX2ludGVycCA9IHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSkgPyBcIlwiIDogamFkZV9pbnRlcnApICsgXCI8L2J1dHRvbj5cIik7XG59XG5idWYucHVzaChcIjxidXR0b24gY2xhc3M9XFxcImFkZC1mYWNldC1idG5cXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1wbHVzXFxcIj48L2k+PC9idXR0b24+XCIpO30uY2FsbCh0aGlzLFwic2VhcmNoQnV0dG9uXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWFyY2hCdXR0b246dHlwZW9mIHNlYXJjaEJ1dHRvbiE9PVwidW5kZWZpbmVkXCI/c2VhcmNoQnV0dG9uOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsIm1vZHVsZS5leHBvcnRzID1cblx0XCJMRUZUXCI6IDM3XG5cdFwiUklHSFRcIjogMzlcblx0XCJVUFwiOiAzOFxuXHRcIkRPV05cIjogNDBcblx0XCJFU0NcIjogWyAyMjksIDI3IF1cblx0XCJFTlRFUlwiOiAxM1xuXHRcIlRBQlwiOiA5XG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5TdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgRmFjZXRTdWJzQmFzZSBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0cmVzdWx0VGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmVzdWx0X2Jhc2UuamFkZVwiIClcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHN1YiA9IG9wdGlvbnMuc3ViXG5cdFx0QGpRdWVyeSA9IEBzdWI/LmpRdWVyeSBvciBvcHRpb25zPy5tYWluPy5qUXVlcnlcblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEBmb2N1c2VkID0gdHJ1ZVxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiXCJcblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRpZiBfbGJsPyBhbmQgX2xibCBpc250IFwiXCJcblx0XHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0aWYgX2xpc3QubGVuZ3RoXG5cdFx0XHRyZXR1cm4gXCI8bGk+XCIgKyBfbGlzdC5qb2luKCBcIjwvbGk+PGxpPlwiICkgKyBcIjwvbGk+XCJcblx0XHRyZXR1cm4gXCJcIlxuXHRcdFxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuVEFCIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5UQUJcblx0XHRcdEBfb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXQgPVxuXHRcdFx0Y2lkOiBAY2lkXG5cdFx0XHQjdGFiX2luZGV4OiAoICggQG1vZGVsPy5faWR4ICogMTAgKSBvciAxICkgKyAoICggQHN1Yj8ucGFyZW50Py5pZHggb3IgMSApICogMTAwMCApXG5cdFx0XHR2YWx1ZTogQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApXG5cdFx0cmV0dXJuIHJldFxuXG5cdF9nZXRJbnBTZWxlY3RvcjogPT5cblx0XHRyZXR1cm4gXCJpbnB1dCMje0BjaWR9XCJcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcIm9wZW5cIiApXG5cdFx0QHJlbmRlcigpXG5cdFx0cFZpZXc/Lm9wZW4oKVxuXHRcdHJldHVyblxuXHRcblx0cmVuZGVyOiAoIGluaXRpYWxBZGQgKT0+XG5cdFx0X3RtcGwgPSBAdGVtcGxhdGUoICBAZ2V0VGVtcGxhdGVEYXRhKCkgKVxuXHRcdEAkZWwuaHRtbCggX3RtcGwgKVxuXHRcdGlmIG5vdCBpbml0aWFsQWRkXG5cdFx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvcigpIClcblx0XHQjJCggZG9jdW1lbnQgKS5vbiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggdHJ1ZSApXG5cdFx0cmV0dXJuXG5cdFxuXHRfaGFzVGFiRXZlbnQ6IC0+XG5cdFx0cmV0dXJuIFwia2V5ZG93blwiXG5cdFx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gdHJ1ZVxuXHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0QHNlbGVjdCggZXZudCApXG5cdFx0cmV0dXJuIHRydWVcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdEBmb2N1c2VkID0gZmFsc2Vcblx0XHQjJCggZG9jdW1lbnQgKS5vZmYgQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBfaGFzVGFiTGlzdGVuZXIoIGZhbHNlIClcblx0XHRAJGVsLnJlbW92ZUNsYXNzKCBcIm9wZW5cIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QGlzT3BlbiA9IGZhbHNlXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIEByZXN1bHQsIGV2bnQgKVxuXHRcdHJldHVyblxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFxuXHRpc1Jlc3VsdEVtcHR5OiAoIHJlcyApPT5cblx0XHRpZiByZXM/LnZhbHVlP1xuXHRcdFx0cmV0dXJuIEBpc1Jlc3VsdEVtcHR5KCByZXMudmFsdWUgKVxuXHRcdFxuXHRcdGlmIG5vdCByZXM/XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdGlmIHJlcyBpcyBcIlwiXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdGlmIF8uaXNBcnJheSggcmVzICkgYW5kIHJlcy5sZW5ndGggPD0gMFxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdGdldFJlc1ZhbHVlOiA9PlxuXHRcdHJlcyA9IEByZXN1bHQ/LmZpcnN0KCk/LnRvSlNPTigpXG5cdFx0XG5cdFx0cmV0dXJuIHJlcz8udmFsdWUgb3IgXCJcIlxuXHRcdFxuXHRpc0VxdWFsQ3VycmVudDogKCB2YWwgPSBAZ2V0VmFsdWUoKSApPT5cblx0XHRydiA9IEBnZXRSZXNWYWx1ZSgpXG5cdFx0aWYgcnYgaXMgdmFsXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdHJldHVybiBmYWxzZVxuXHRcdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogLT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRfY2hlY2tTZWxlY3RFbXB0eTogKCBfdmFsLCBldm50ICk9PlxuXHRcdCNkZWJ1Z2dlclxuXHRcdCMgaWYgQGlzRXF1YWxDdXJyZW50KCBfdmFsIClcblx0XHQjIFx0QGNsb3NlKClcblx0XHQjIFx0cmV0dXJuIHRydWVcblx0XHRcdFxuXHRcdGlmIF8uaXNFbXB0eSggX3ZhbCApIGFuZCBub3QgXy5pc051bWJlciggX3ZhbCApIGFuZCBub3QgXy5pc0Jvb2xlYW4oIF92YWwgKSMgYW5kIG5vdCBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdEBjbG9zZSggZXZudCApXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdCNyZXR1cm4gaWYgQF9jaGVja1NlbGVjdEVtcHR5KCBfdmFsLCBldm50IClcblx0XHRAc2V0KCBfdmFsLCBldm50IClcblx0XHRyZXR1cm5cblxuXHRzZXQ6ICggdmFsLCBldm50ICk9PlxuXHRcdF9tb2RlbCA9IEByZXN1bHQuZmlyc3QoKVxuXHRcdGlmIG5vdCBfbW9kZWw/XG5cdFx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiB2YWwgKVxuXHRcdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0ZWxzZVxuXHRcdFx0X21vZGVsLnNldCggdmFsdWU6IHZhbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsLCBldm50IClcblx0XHRAY2xvc2UoIGV2bnQgKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzQmFzZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNEYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvZGF0ZXJhbmdlLmphZGVcIiApXG5cblx0Zm9yY2VkRGF0ZVJhbmdlT3B0czogPT5cblx0XHRfb3B0cyA9XG5cdFx0XHRvcGVuczogXCJyaWdodFwiXG5cdFx0XHRcblx0XHRpZiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0XHRfb3B0cy5sb2NhbGUgPVxuXHRcdFx0XHRmb3JtYXQ6IEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiIClcblx0XHRcblx0XHRpZiBAbW9kZWwuZ2V0KFwidmFsdWVcIik/WzBdP1xuXHRcdFx0QG1vZGVsLmdldChcInZhbHVlXCIpP1sxXT9cblx0XHRcdGlmIF8uaXNOdW1iZXIoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVswXSApXG5cdFx0XHRcdF9zZCA9IG1vbWVudCggQG1vZGVsLmdldChcInZhbHVlXCIpWzBdIClcblx0XHRcdGVsc2Vcblx0XHRcdFx0X3NkID0gbW9tZW50KCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXHRcdFx0aWYgX3NkLmlzVmFsaWQoKVxuXHRcdFx0XHRfb3B0cy5zdGFydERhdGUgPSBfc2QuX2RcblxuXHRcdGlmIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKT9bMV0/XG5cdFx0XHRpZiBfLmlzTnVtYmVyKCBAbW9kZWwuZ2V0KFwidmFsdWVcIilbMV0gKVxuXHRcdFx0XHRfZWQgPSBtb21lbnQoIEBtb2RlbC5nZXQoXCJ2YWx1ZVwiKVsxXSApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9lZCA9IG1vbWVudCggQG1vZGVsLmdldChcInZhbHVlXCIpWzFdLCBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApIClcblx0XHRcdGlmIF9lZC5pc1ZhbGlkKClcblx0XHRcdFx0X29wdHMuZW5kRGF0ZSA9IF9lZC5fZFxuXHRcdHJldHVybiBfb3B0c1xuXG5cdGV2ZW50czogPT5cblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdGlmIG5vdCBAZGF0ZXJhbmdlcGlja2VyP1xuXHRcdFx0X29wdHMgPSBAalF1ZXJ5LmV4dGVuZCggdHJ1ZSwge30sIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIEBmb3JjZWREYXRlUmFuZ2VPcHRzKCkgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblx0XHRcdFxuXHRcdFx0IyBwcmV2ZW50IGZyb20gaGFuZGxpY2ggdGhlIG91dGVyY2xpY2sgZXhpdCBmcm9tIE1haW5WaWV3XG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lci5vbiBcImNsaWNrXCIsICggZXZudCApLT5cblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRlbHNlXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmVsZW1lbnQgPSBAJGlucFxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5zaG93KClcblx0XHRcdFxuXHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRAJGlucC5vbiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRjbG9zZTogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wLm9mZiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub2ZmKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0cmV0dXJuXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0QGRhdGVyYW5nZXBpY2tlciA9IG51bGxcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRcblx0XHRpZiBfLmlzTnVtYmVyKCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdFx0X3N0YXJ0RGF0ZSA9IG1vbWVudCggX3Jlcy52YWx1ZVsgMCBdIClcblx0XHRlbHNlXG5cdFx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXHRcdFx0XG5cdFx0aWYgX3Jlcy52YWx1ZVsgMSBdP1xuXHRcdFx0aWYgXy5pc051bWJlciggX3Jlcy52YWx1ZVsgMSBdIClcblx0XHRcdFx0X2VuZERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDEgXSApXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0sIEBtb2RlbC5nZXQoIFwiZGF0ZWZvcm1hdFwiICkgKVxuXG5cdFx0X3RpbWUgPSBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLnRpbWVQaWNrZXJcblxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApP1xuXHRcdFx0X2ZybXQgPSBAbW9kZWwuZ2V0KCBcImRhdGVmb3JtYXRcIiApXG5cdFx0ZWxzZSBpZiBfdGltZVxuXHRcdFx0X2ZybXQgPSBcIkxMTExcIlxuXHRcdGVsc2Vcblx0XHRcdF9mcm10ID0gXCJMTFwiXG5cdFx0X3MgKz0gX3N0YXJ0RGF0ZS5mb3JtYXQoIF9mcm10IClcblxuXHRcdGlmIF9lbmREYXRlP1xuXHRcdFx0X3MgKz0gXCIgLSBcIlxuXHRcdFx0X3MgKz0gX2VuZERhdGUuZm9ybWF0KCBfZnJtdCApXG5cblx0XHRfcyArPSBcIjwvbGk+XCJcblxuXHRcdHJldHVybiBfc1xuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiBmYWxzZVxuXHRcblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QG1vZGVsLnNldCggXCJ2YWx1ZVwiLCBAZ2V0VmFsdWUoIGZhbHNlICkgKVxuXHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRWYWx1ZTogKCBwcmVkZWYgPSB0cnVlICk9PlxuXHRcdGlmIHByZWRlZlxuXHRcdFx0X3ByZWRlZlZhbCA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0XHRpZiBfcHJlZGVmVmFsP1xuXHRcdFx0XHRpZiBub3QgXy5pc0FycmF5KCBfcHJlZGVmVmFsIClcblx0XHRcdFx0XHRfcHJlZGVmVmFsID0gIFsgX3ByZWRlZlZhbCBdXG5cdFx0XHRcdFsgQHN0YXJ0RGF0ZSwgQGVuZERhdGUgXSA9IF9wcmVkZWZWYWxcblx0XHRcdFx0cmV0dXJuIF9wcmVkZWZWYWxcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldE51bWJlckJhc2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAc2V0TnVtYmVyID0gXy50aHJvdHRsZSggQF9zZXROdW1iZXIsIDMwMCwge2xlYWRpbmc6IGZhbHNlLCB0cmFpbGluZzogZmFsc2V9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdF8kZWwgPSAkKCBldm50LmN1cnJlbnRUYXJnZXQgKVxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICksIF8kZWwgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSAqIC0xLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5FTlRFUlxuXHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleXVwXCJcblx0XHRcdF92ID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnJlcGxhY2UoIC9bXlxcZF0/W14tXFxkXSsvZywgXCJcIiApXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXHRcdFx0IFxuXHRcdFx0QHNldE51bWJlciggX3YsIF8kZWwgKVxuXHRcdHJldHVyblxuXG5cdGNyZW1lbnQ6ICggY2hhbmdlLCBlbCA9IEAkaW5wICk9PlxuXHRcdF92ID0gZWwudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0X3YgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGVsc2Vcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cblx0XHRAX3NldE51bWJlciggX3YgKyBjaGFuZ2UsIGVsIClcblx0XHRyZXR1cm5cblxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdiA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0XHRcblx0XHRfaXYgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRpZiBpc05hTiggX2l2IClcblx0XHRcdHJldHVybiBudWxsXG5cdFx0XHRcblx0XHRyZXR1cm4gQHZhbHVlQnlEZWZpbml0aW9uKCBfdiApXG5cblx0X3NldE51bWJlcjogKCBfdiwgZWwgPSBAJGlucCApPT5cblx0XHRpZiBpc05hTiggX3YgKVxuXHRcdFx0I0AkaW5wLnZhbChcIlwiKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRfY3VyciA9IGVsLnZhbCgpXG5cblx0XHRfdiA9IEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YpXG5cdFx0aWYgX2N1cnIgIT0gX3YudG9TdHJpbmcoKVxuXHRcdFx0ZWwudmFsKCBfdiApXG5cdFx0cmV0dXJuXG5cblx0dmFsdWVCeURlZmluaXRpb246ICggX3ZhbHVlICktPlxuXHRcdG1heCA9IEBtb2RlbC5nZXQoIFwibWF4XCIgKVxuXHRcdG1pbiA9IEBtb2RlbC5nZXQoIFwibWluXCIgKVxuXHRcdHN0ZXAgPSBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApXG5cdFx0XG5cdFx0IyBmaXggcmV2ZXJzZWQgbWluL21heCBzZXR0aW5nXG5cdFx0aWYgbWluID4gbWF4XG5cdFx0XHRfdG1wID0gbWluXG5cdFx0XHRtaW4gPSBtYXhcblx0XHRcdG1heCA9IF90bXBcblx0XHRcblx0XHQjIG9uIGV4eGVkZGluZyB0aGUgbGltaXRzIHVzZSB0aGUgbGltaXRcblx0XHRpZiBtaW4/IGFuZCBfdmFsdWUgPCBtaW5cblx0XHRcdHJldHVybiBtaW5cblx0XHRpZiBtYXg/IGFuZCBfdmFsdWUgPiBtYXhcblx0XHRcdHJldHVybiBtYXhcblxuXHRcdCMgc2VhcmNoIHRoZSBuZWFyZXN0IF92YWx1ZSB0byB0aGUgc3RlcFxuXHRcdGlmIHN0ZXAgaXNudCAxXG5cdFx0XHRfdmFsdWUgPSBuZWFyZXN0KCBfdmFsdWUsIHN0ZXAgKVxuXHRcdFxuXHRcdCMgY2FsYyB0aGUgcHJlY2lzaW9uIGJ5IHN0ZXBcblx0XHRfcHJlY2lzaW9uID0gTWF0aC5tYXgoIDAsIE1hdGguY2VpbCggTWF0aC5sb2coIDEvc3RlcCApIC8gTWF0aC5sb2coIDEwICkgKSApXG5cdFx0aWYgX3ByZWNpc2lvbiA+IDBcblx0XHRcdF92YWx1ZSA9IHByZWNpc2lvbiggX3ZhbHVlLCBfcHJlY2lzaW9uIClcblx0XHRlbHNlXG5cdFx0XHRfdmFsdWUgPSBNYXRoLnJvdW5kKCBfdmFsdWUgKVxuXHRcdFx0XG5cdFx0cmV0dXJuIF92YWx1ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXROdW1iZXJCYXNlXG4iLCJTdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU3RyaW5nT3B0aW9uIGV4dGVuZHMgU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBTdHJpbmdPcHRpb25zIGV4dGVuZHMgU3ViUmVzdWx0c1xuXHRtb2RlbDogU3RyaW5nT3B0aW9uXG5cblxuY2xhc3MgQXJyYXlPcHRpb24gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBcIm5hbWVcIiApIG9yIFwiLVwiXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBBcnJheU9wdGlvbnMgZXh0ZW5kcyByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBBcnJheU9wdGlvblxuXG5jbGFzcyBGYWNldFN1YkFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuLi9zZWxlY3RvclwiIClcblx0XG5cdHRlbXBsYXRlUmVzTGk6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvYXJyYXlfcmVzdWx0bGkuamFkZVwiIClcblx0XG5cdG9wdERlZmF1bHQ6XG5cdFx0bGFiZWw6IFwiLVwiXG5cdFx0dmFsdWU6IFwiLVwiXG5cblx0c2VsZWN0Q291bnQ6IDBcblxuXHRvcHRDb2xsOiBTdHJpbmdPcHRpb25zXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRpZiBvcHRpb25zLm1vZGVsLmdldCggXCJjb3VudFwiICk/XG5cdFx0XHRAc2VsZWN0Q291bnQgPSBvcHRpb25zLm1vZGVsLmdldCggXCJjb3VudFwiIClcblx0XHRvcHRpb25zLmN1c3RvbSA9IHRydWVcblx0XHRpZiBvcHRpb25zLm1vZGVsLmdldCggXCJjdXN0b21cIiApP1xuXHRcdFx0b3B0aW9ucy5jdXN0b20gPSBCb29sZWFuKCBvcHRpb25zLm1vZGVsLmdldCggXCJjdXN0b21cIiApIClcblx0XHRcdFxuXHRcdEBjb2xsZWN0aW9uID0gQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBvcHRpb25zLm1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0XG5cdFx0aWYgbm90IG9wdGlvbnMuY3VzdG9tIGFuZCBAc2VsZWN0Q291bnQgPD0gMFxuXHRcdFx0QHNlbGVjdENvdW50ID0gQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0XG5cdFx0QHJlc3VsdC5vbiBcInJlbW92ZVwiLCAoIG1kbCwgY29sbCApPT5cblx0XHRcdGlmIGNvbGwubGVuZ3RoXG5cdFx0XHRcdG9wdGlvbnMuc3ViLnJlbmRlclJlc3VsdCgpXG5cdFx0XHRAc2VhcmNoY29sbC5hZGQoIG1kbCApXG5cdFx0XHRAdHJpZ2dlciggXCJyZW1vdmVkXCIsIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdGluaXRpYWxpemU6ID0+XG5cdFx0QGVkaXRNb2RlID0gZmFsc2Vcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHN1cGVyXG5cdFx0I2lmIG5vdCBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdF9ldm50c1sgXCJibHVyIGlucHV0IyN7QGNpZH1cIiBdID0gXCJjbG9zZVwiXG5cdFx0cmV0dXJuIF9ldm50c1xuXHRcblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHQjIGNoZWNrIGlmIHRoZSBjbG9zZSBpcyBpbml0aWVkIGZyb20gdGhlIGVkaXQgbW9kZVxuXHRcdF9kZWxTdWIgPSBmYWxzZVxuXHRcdGlmIEBlZGl0TW9kZVxuXHRcdFx0X2RlbFN1YiA9IHRydWVcblx0XHRcdFxuXHRcdEBlZGl0TW9kZSA9IGZhbHNlXG5cdFx0aWYgQGxvYWRpbmdcblx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRpZiBAbW9kZWw/LmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0XHRpZiBfZGVsU3ViIGFuZCBAcmVzdWx0Lmxlbmd0aCA8PSAwXG5cdFx0XHRAc3ViLmRlbCgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFxuXHRybVJlczogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/LnRhcmdldD9cblx0XHRcdF9pZCA9ICQoIGV2bnQudGFyZ2V0ICk/LmRhdGEoIFwiaWRcIiApXG5cdFx0ZWxzZSBpZiBldm50P1xuXHRcdFx0X2lkID0gZXZudFxuXHRcdF9tZGwgPSBAcmVzdWx0LmdldCggX2lkIClcblx0XHRpZiBfbWRsP1xuXHRcdFx0QHJlc3VsdC5yZW1vdmUoIF9pZCApXG5cdFx0XHRpZiBfbWRsPy5nZXQoIFwiY3VzdG9tXCIgKVxuXHRcdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIF9pZCApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGVkaXRSZXM6ICggZXZudCApPT5cblx0XHRAZWRpdE1vZGUgPSB0cnVlXG5cdFx0X2lkID0gJCggZXZudC50YXJnZXQgKT8uZGF0YSggXCJpZFwiIClcblx0XHRfdiA9IEBfZWRpdHZhbCA9IEByZXN1bHQuZ2V0KCBfaWQgKS5nZXQoIFwidmFsdWVcIiApXG5cdFx0XG5cdFx0QHJlc3VsdC5yZW1vdmUoIF9pZCApXG5cdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBfaWQgKVxuXHRcdEBzdWIucmVvcGVuKClcblx0XHRcblx0XHRAc2VhcmNoKF92KVxuXHRcdHJldHVyblxuXHRcblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdF9kYXRhID0gc3VwZXJcblx0XHRpZiBAX2VkaXR2YWw/Lmxlbmd0aFxuXHRcdFx0X2RhdGEuaW5wdmFsID0gQF9lZGl0dmFsXG5cdFx0XHRAX2VkaXR2YWwgPSBudWxsXG5cdFx0cmV0dXJuIF9kYXRhXG5cdFxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggQHRlbXBsYXRlUmVzTGkoIHR4dDogbW9kZWwuZ2V0TGFiZWwoKSwgaWQ6IG1vZGVsLmlkLCBjdXN0b206IG1vZGVsLmdldCggXCJjdXN0b21cIiApICApXG5cblx0XHRyZXR1cm4gXCI8bGk+XCIgKyBfbGlzdC5qb2luKCBcIjwvbGk+PGxpPlwiICkgKyBcIjwvbGk+XCJcblxuXHRcblx0X2lzRnVsbDogPT5cblx0XHRpZiBAc2VsZWN0Q291bnQgPD0gMFxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuICggQHJlc3VsdCBvciBbXSkubGVuZ3RoID49IEBzZWxlY3RDb3VudFxuXHRcdFxuXHRzZWxlY3Q6ID0+XG5cdFx0aWYgQGxvYWRpbmdcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEBfaXNGdWxsKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0X3ZhbHMgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIF92YWxzPyBhbmQgbm90IF8uaXNBcnJheSggX3ZhbHMgKVxuXHRcdFx0X3ZhbHMgPSBbIF92YWxzIF1cblx0XHRpZiBub3QgX3ZhbHM/Lmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRmb3IgX3ZhbCBpbiAoIGlmIEBzZWxlY3RDb3VudCA8PSAwIHRoZW4gX3ZhbHMgZWxzZSBfdmFsc1suLi5Ac2VsZWN0Q291bnRdIClcblx0XHRcdF9tZGwgPSBAY29sbGVjdGlvbi5nZXQoIF92YWwgKVxuXHRcdFx0aWYgbm90IF9tZGw/XG5cdFx0XHRcdF9tZGwgPSBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBfdmFsLCBjdXN0b206IHRydWUgKVxuXHRcdFx0QHNlbGVjdGVkKCBfbWRsIClcblx0XHRcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcblx0cmVvcGVuOiAoIHBWaWV3ICk9PlxuXHRcdGlmIEBfaXNGdWxsKClcblx0XHRcdCMgaWYgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHQjIFx0X2lkID0gQHJlc3VsdC5sYXN0KCk/LmlkXG5cdFx0XHQjIFx0QHJtUmVzKCBfaWQgKVxuXHRcdFx0c3VwZXJcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdHNlYXJjaENvbnRlbnQgPSBAJGlucC52YWwoKVxuXHRcdGlmIHNlYXJjaENvbnRlbnQ/Lmxlbmd0aFxuXHRcdFx0QHNlbGVjdEFjdGl2ZSgpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuIHRydWVcblx0XHRcblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0QGxvYWRpbmcgPSB0cnVlXG5cdFx0XHRfY29sbCA9IG5ldyBAb3B0Q29sbCggW10gKVxuXHRcdFx0XG5cdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRAJGVsLnBhcmVudCgpLmFkZENsYXNzKCBcImxvYWRpbmdcIiApXG5cdFx0XHRcdG9wdGlvbnMgQHJlc3VsdCwgQG1vZGVsLCAoIGFPcHRzICk9PlxuXHRcdFx0XHRcdGZvciBfb3B0LCBpZHggaW4gYU9wdHNcblx0XHRcdFx0XHRcdGFPcHRzW2lkeF0gPSBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBfb3B0LCB7IGN1c3RvbTogZmFsc2UgfSApXG5cdFx0XHRcdFx0X2NvbGwuYWRkKCBhT3B0cyApXG5cdFx0XHRcdFx0QGxvYWRpbmcgPSBmYWxzZVxuXHRcdFx0XHRcdEAkZWwucGFyZW50KCkucmVtb3ZlQ2xhc3MoIFwibG9hZGluZ1wiIClcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcblx0XHRcdCwgMCApXG5cdFx0XHRyZXR1cm4gX2NvbGxcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0IH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdChvcHQpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gbmV3IEBvcHRDb2xsKCBfb3B0cyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YkFycmF5XG4iLCJjbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL251bWJlci5qYWRlXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIiBdID0gXCJzZWxlY3RcIlxuXHRcdHJldHVybiBfZXZudHNcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0QCRlbE9wID0gQCRlbC5maW5kKCBcIi5vcGVyYXRvclwiIClcblx0XHRcdEBlbE9wID0gQCRlbE9wLmdldCgwKVxuXHRcdFx0QCRpbnBPcCA9IEAkZWwuZmluZCggXCJzZWxlY3QjI3tAY2lkfW9wXCIgKVxuXHRcdFx0QHNlbGVjdDJPcCA9IEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApLmRhdGEoIFwic2VsZWN0MlwiIClcblx0XHRcdEAkaW5wT3Aub24oIFwic2VsZWN0MjpjbG9zZVwiLCBAX29wU2VsZWN0ZWQgKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCJcIlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0XG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9yZXMub3BlcmF0b3IgKyBcIiBcIiBpZiBfcmVzLm9wZXJhdG9yP1xuXHRcdF9zICs9IF9yZXMudmFsdWVcblx0XHRfcyArPSBcIjwvbGk+XCJcblxuXHRcdHJldHVybiBfc1xuXHRcblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0XHRAJGlucE9wLnJlbW92ZSgpXG5cdFx0XHRAJGlucE9wID0gbnVsbFxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdF9wb3NPcFdycCA9IC0xXG5cdFx0aWYgZXZudD8ucmVsYXRlZFRhcmdldFxuXHRcdFx0X3Bvc09wV3JwID0gQGVsT3A/LmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBldm50Py5yZWxhdGVkVGFyZ2V0IClcblx0XHRcdGlmIF9wb3NPcFdycCBpcyAyMFxuXHRcdFx0XHRyZXR1cm5cblx0XHRpZiBldm50Py50eXBlIGlzIFwiZm9jdXNvdXRcIiBhbmQgX3Bvc09wV3JwIGlzbnQgMjBcblx0XHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdFx0aWYgX3ZhbD9cblx0XHRcdFx0QHNldCggX3ZhbCwgZXZudCApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdGlmIGV2bnQ/LnJlbGF0ZWRUYXJnZXQ/XG5cdFx0XHRfcG9zV3JwID0gQGVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBldm50Py5yZWxhdGVkVGFyZ2V0IClcblx0XHRcdGlmIG5vdCAoIF9wb3NXcnAgaXMgMCBvciBfcG9zV3JwIC0gMTYgPj0gMCApXG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuXG5cdFx0aWYgZXZudD8gYW5kICggZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucC5nZXQoMCkgb3IgZXZudD8ucmVsYXRlZFRhcmdldCBpcyBAJGlucE9wPy5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdEBtb2RlbC5zZXQoIHsgb3BlcmF0b3I6IEAkaW5wT3AudmFsKCkgfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cblx0X29wU2VsZWN0ZWQ6ID0+XG5cdFx0QHNlbGVjdGVkT1AgPSB0cnVlXG5cdFx0QGZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRpZiBAJGlucE9wPyBhbmQgbm90IEBzZWxlY3RlZE9QXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0QCRpbnAuc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpPy5nZXQoIFwidmFsdWVcIiApXG5cdFx0X29sZE9wID0gQHJlc3VsdC5maXJzdCgpXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWwgKVxuXHRcdHBWaWV3LiRyZXN1bHRzLmVtcHR5KCkuaHRtbCggQHJlbmRlclJlc3VsdCggdHJ1ZSApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCB7IG9wZXJhdG9yczogQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApLCBvcGVyYXRvcjogQG1vZGVsLmdldCggXCJvcGVyYXRvclwiICl9IClcblxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblxuXHRcdGlmIEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0XHRpZiBAJGlucC5pcyggZXZudC50YXJnZXQgKSBhbmQgZXZudC5zaGlmdEtleVxuXHRcdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRAJGlucE9wLmZvY3VzKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblx0XHRcdGlmICggQHNlbGVjdDJPcC4kc2VsZWN0aW9uLmlzKCBldm50LnRhcmdldCApIG9yIGV2bnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyggXCJzZWxlY3QyLXNlYXJjaF9fZmllbGRcIiApICkgYW5kIG5vdCBldm50LnNoaWZ0S2V5XG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdEAkaW5wLmZvY3VzKCkuc2VsZWN0KClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdFx0XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGlmIG5vdCBpc05hTiggX3ZhbCApXG5cdFx0XHRAc2VsZWN0KCBldm50IClcblx0XHRyZXR1cm4gdHJ1ZVxuXHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHRpZiBAJGlucE9wPyBvciBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKT9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3A/LnZhbCgpIG9yIEBtb2RlbC5nZXQoIFwib3BlcmF0b3JcIiApXG5cdFx0ZWxzZVxuXHRcdFx0X3JldCA9XG5cdFx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic051bWJlclxuIiwiY2xhc3MgRmFjZXRTdWJzUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3JhbmdlLmphZGVcIiApXG5cblx0X2dldElucFNlbGVjdG9yOiAoIGV4dCA9IFwiX2Zyb21cIiApPT5cblx0XHRyZXR1cm4gXCJpbnB1dCMje0BjaWR9I3tleHR9XCJcblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJzZWxlY3RcIlxuXHRcdFwiYmx1ciAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJzZWxlY3RcIlxuXHRcdFwibW91c2Vkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImNsaWNrU2VsXCJcblx0XHRcIm1vdXNlZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJjbGlja1NlbFwiXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIlwiXG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRyZXR1cm4gXCI8bGk+XCIgK19yZXMudmFsdWUuam9pbiggXCIgLSBcIiApICsgXCI8L2xpPlwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRpbnBUbyA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wLnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRjbGlja1NlbDogKCBldm50ICk9PlxuXHRcdGV2bnQuY3VycmVudFRhcmdldC5mb2N1cygpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBUby5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRcblx0XHQjaWYgQCRpbnAuaXMoIGV2bnQudGFyZ2V0ICkgYW5kIG5vdCBldm50LnNoaWZ0S2V5XG5cdFx0XHRcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0Y2xvc2U6ID0+XG5cdFx0dHJ5XG5cdFx0XHRAJCggXCIucmFuZ2VpbnBcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdF9yZXQgPVxuXHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92RnJvbSA9IHN1cGVyXG5cdFx0X3YgPSBAJGlucFRvLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0X3ZUbyA9IHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdFx0cmV0dXJuIFsgX3ZGcm9tLCBfdlRvIF1cblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdFxuXHRcdGlmIEAkaW5wLmlzKCBldm50LnRhcmdldCApIGFuZCBub3QgZXZudC5zaGlmdEtleVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRAJGlucFRvLmZvY3VzKCkuc2VsZWN0KClcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFxuXHRcdGlmIEAkaW5wVG8uaXMoIGV2bnQudGFyZ2V0ICkgYW5kIGV2bnQuc2hpZnRLZXlcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0QCRpbnAuZm9jdXMoKS5zZWxlY3QoKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRpZiBfdmFsPy5sZW5ndGggPj0gMlxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAc2VsZWN0KClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcblx0XHQjIHJldHVybiBmYWxzZSB0byBwcmV2ZW50IGp1bXAgdG8gbmV4dCBmYWNldFxuXHRcdHJldHVybiB0cnVlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1JhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic1NlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9zZWxlY3QuamFkZVwiIClcblxuXHRmb3JjZWRNb2R1bGVPcHRzOnt9XG5cdCNcdG11bHRpcGxlOiB0cnVlXG5cblx0ZGVmYXVsdE1vZHVsZU9wdHM6XG5cdFx0I21heGltdW1TZWxlY3Rpb25MZW5ndGg6IDFcblx0XHR3aWR0aDogXCJhdXRvXCJcblx0XHRtdWx0aXBsZTogZmFsc2Vcblx0XG5cdGluaXRpYWxpemU6IC0+XG5cdFx0QGNvbnZlcnRWYWx1ZVRvSW50ID0gQF9jaGVja0ludFZhbHVlKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHt9XG5cdFx0X2V2bnRzWyBcImNsaWNrIC5zZWxlY3QtY2hlY2tcIiBdID0gXCJzZWxlY3RcIiBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBfZXZudHNcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwic2VsZWN0IyN7QGNpZH1cIlxuXHRcdFxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRpZiBAbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0IyBwcmV2ZW50IGZyb20gYXN5bmMgbGlzdGVuaW5nIG9uIG1hbnVhbCBhY2Nlc3Ncblx0XHRAbW9kZWwuc2V0KCBcIndhaXRGb3JBc3luY1wiLCBmYWxzZSApXG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5zaG93KClcblx0XHRAc2VsZWN0Mi5vcGVuKClcblx0XHQjZWxzZVxuXHRcdFx0I0AkaW5wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0aWYgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiAoIEByZXN1bHQgb3IgW10pLmxlbmd0aCA+PSBAc2VsZWN0Q291bnRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRpZiBAX2lzRnVsbCgpXG5cdFx0XHRyZXR1cm5cblx0XHQjIHNldCB0aGUgY3VycmVudCB2YWx1ZXNcblx0XHRfb2xkVmFscyA9IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cdFx0QG1vZGVsLnNldCggdmFsdWU6IF9vbGRWYWxzIClcblx0XHRcblx0XHQjIHJlc2V0IHJlc3VsdHMgYW5kIHNlbGVjdDJcblx0XHRwVmlldy4kcmVzdWx0cy5lbXB0eSgpXG5cdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vZmYoKVxuXHRcdEBzZWxlY3QyLmRlc3Ryb3koKVxuXHRcdEByZXN1bHQucmVzZXQoKVxuXHRcdEBzZWxlY3QyID0gbnVsbFxuXHRcdFxuXHRcdHJldHVybiBzdXBlclxuXHRcdFxuXHRfY2hlY2tJbnRWYWx1ZTogKCBfb3B0cyA9IFtdICk9PlxuXHRcdGlmIG5vdCBfb3B0cyBvciBub3QgX29wdHMubGVuZ3RoXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRmb3IgX3YgaW4gX29wdHNcblx0XHRcdGlmIF92LnZhbHVlPyBhbmQgXy5pc1N0cmluZyggX3YudmFsdWUgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92LmlkPyBhbmQgXy5pc1N0cmluZyggX3YuaWQgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIF92PyBhbmQgXy5pc1N0cmluZyggX3YgKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFxuXHRcdHJldHVybiB0cnVlXG5cblx0X2luaXRTZWxlY3QyOiA9PlxuXHRcdFxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIG9yIGZhbHNlIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3Qgc2VsZWN0MjpjbG9zZVwiLCBAc2VsZWN0XG5cdFx0XHRcblx0XHRcdGlmIG5vdCBAc2VsZWN0Mi5fZXZlbnRzQWRkZWRcblx0XHRcdFx0QHNlbGVjdDIuX2V2ZW50c0FkZGVkID0gdHJ1ZVxuXHRcdFx0XHQjIGFmdGVyIGxvYWRpbmcgdHJ5IHRvIHNldCB0aGUgY3Vyc29yIGZvY3VzXG5cdFx0XHRcdEBzZWxlY3QyLm9uIFwicmVzdWx0czphbGxcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0XHRcdEBjb252ZXJ0VmFsdWVUb0ludCA9IEBfY2hlY2tJbnRWYWx1ZSggcmVzdWx0cz8uZGF0YT8ucmVzdWx0cyApXG5cdFx0XHRcdFx0QHNlbGVjdDIuc2VsZWN0aW9uPy4kc2VhcmNoPy5mb2N1cz8oKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcblx0XHRcdFx0IyBsaXN0ZW4gdG8gYXN5bmMgcmVzdWx0IGNoYW5nZXMgYW5kIHNldCB0aGUgc2VsZWN0aW9uXG5cdFx0XHRcdEBzZWxlY3QyLmRhdGFBZGFwdGVyLmN1cnJlbnQgKCByZXN1bHRzICk9PlxuXHRcdFx0XHRcdGlmIEBtb2RlbC5nZXQoIFwid2FpdEZvckFzeW5jXCIgKVxuXHRcdFx0XHRcdFx0X2RhdGEgPSBbXVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRmb3IgcmVzdWx0IGluIHJlc3VsdHNcblx0XHRcdFx0XHRcdFx0X2RhdGEucHVzaCBAX2NvbnZlcnRWYWx1ZSggcmVzdWx0IClcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHQjIHNlbGVjdCB0aGUgYWN0aXZlL3ByZWRlZmluZWQgcmVzdWx0c1xuXHRcdFx0XHRcdFx0QF9zZWxlY3QoIF9kYXRhIClcblx0XHRcdFx0XHRcdEBjbG9zZSgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XG5cdFx0XHRcdEBzZWxlY3QyLiRjb250YWluZXIub24gXCJjbGlja1wiLCBAX3NlbDJvcGVuXG5cdFx0XHRcdEBzZWxlY3QyLiRlbGVtZW50LmhpZGUoKVxuXHRcdFx0XHRAc2VsZWN0Mi4kc2VsZWN0aW9uLm9uIFwiZm9jdXNvdXRcIiwgKCBldm50ICk9PlxuXHRcdFx0XHRcdEBUTWZvY3VzT3V0ID0gc2V0VGltZW91dCggPT5cblx0XHRcdFx0XHRcdEBzZWxlY3QoKVxuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0LCAxNTAgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcblx0XHRcdFx0QHNlbGVjdDIuJHNlbGVjdGlvbi5vbiBcImZvY3VzaW5cIiwgKCBldm50ICk9PlxuXHRcdFx0XHRcdGNsZWFyVGltZW91dCggQFRNZm9jdXNPdXQgKSBpZiBAVE1mb2N1c091dD9cblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdFx0XG5cdFx0XHQjJCggZG9jdW1lbnQgKS5vbiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm4gQHNlbGVjdDJcblxuXHRfc2VsMm9wZW46ICggZXZudCApLT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRyZW1vdmU6ID0+XG5cdFx0I0AkaW5wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0X2RhdGEgPSBfLmV4dGVuZCgge30sIHN1cGVyLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSwgb3B0aW9uczogQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApICkgfSApXG5cdFx0aWYgX2RhdGEudmFsdWU/IGFuZCBfLmlzQXJyYXkoIF9kYXRhLnZhbHVlIClcblx0XHRcdGZvciBfdiwgX2lkeCBpbiBfZGF0YS52YWx1ZVxuXHRcdFx0XHRfZGF0YS52YWx1ZVsgX2lkeCBdID0gaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX3YgKSBlbHNlIF92LnRvU3RyaW5nKClcblx0XHRlbHNlIGlmIF9kYXRhLnZhbHVlP1xuXHRcdFx0X2RhdGEudmFsdWUgPSBbIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIF9kYXRhLnZhbHVlICkgZWxzZSBfZGF0YS52YWx1ZS50b1N0cmluZygpIF1cblx0XHRcblx0XHRpZiBfZGF0YS52YWx1ZT9cblx0XHRcdF92bGlzdCA9IF8ucGx1Y2soIF9kYXRhLm9wdGlvbnMsIFwidmFsdWVcIiApXG5cdFx0XHRmb3IgX3YgaW4gX2RhdGEudmFsdWUgd2hlbiBfdiBub3QgaW4gX3ZsaXN0XG5cdFx0XHRcdF9kYXRhLm9wdGlvbnMucHVzaCB7IHZhbHVlOiAoIGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIF92ICkgZWxzZSBfdi50b1N0cmluZygpICksIGxhYmVsOiBfdiwgZ3JvdXA6IHVuZGVmaW5lZCB9XG5cdFx0XG5cdFx0X2dyb3VwcyA9IF8uZ3JvdXBCeSggX2RhdGEub3B0aW9ucywgXCJncm91cFwiIClcblx0XHRpZiBfLmNvbXBhY3QoIF8ua2V5cyggX2dyb3VwcyBvciB7fSApICkubGVuZ3RoID4gMVxuXHRcdFx0X2RhdGEub3B0aW9uR3JvdXBzID0gX2dyb3Vwc1xuXHRcdHJldHVybiBfZGF0YVxuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAoIGNyZWF0ZSApPT5cblx0XHRpZiBjcmVhdGVcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiBAbW9kZWwuZ2V0KFwibXVsdGlwbGVcIilcblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXl1cFwiXG5cdFx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92YWxzID0gW11cblx0XHRmb3IgZGF0YSBpbiBAX2luaXRTZWxlY3QyKCk/LmRhdGEoKSBvciBbXVxuXHRcdFx0XG5cdFx0XHRfdmFscy5wdXNoKCBAX2NvbnZlcnRWYWx1ZSggZGF0YSApIClcblx0XHRyZXR1cm4gX3ZhbHNcblx0XG5cdF9jb252ZXJ0VmFsdWU6ICggZGF0YSApPT5cblx0XHRfZGF0YSA9IHt9XG5cdFx0aWYgQGNvbnZlcnRWYWx1ZVRvSW50XG5cdFx0XHRfZGF0YS52YWx1ZSA9IHBhcnNlRmxvYXQoIGRhdGEuaWQgKVxuXHRcdGVsc2Vcblx0XHRcdF9kYXRhLnZhbHVlID0gZGF0YS5pZFxuXHRcdGlmIGRhdGEudGV4dD9cblx0XHRcdGlmIGRhdGEudGV4dCBpbnN0YW5jZW9mIGpRdWVyeVxuXHRcdFx0XHRfZGF0YS5sYWJlbCA9IGRhdGEudGV4dC5odG1sKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0X2RhdGEubGFiZWwgPSBkYXRhLnRleHRcblx0XHRcdFxuXHRcdHJldHVybiBfZGF0YVxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0cmV0dXJuIG9wdGlvbnMoIEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiApXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6ICggaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggb3B0ICkgZWxzZSBvcHQudG9TdHJpbmcoKSApLCBsYWJlbDogb3B0LCBncm91cDogbnVsbCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3QoIG9wdCApXG5cdFx0XHRcdG9wdC52YWx1ZSA9IGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIG9wdC52YWx1ZSApIGVsc2Ugb3B0LnZhbHVlLnRvU3RyaW5nKClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKVxuXHRcdHJldHVybiBfb3B0c1xuXG5cdHVuc2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0QHJlc3VsdC5yZW1vdmUoIGV2bnQucGFyYW1zPy5kYXRhPy5pZCApXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0aWYgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0Mj9cblx0XHRcdCNAc2VsZWN0Mj8uZGVzdHJveSgpXG5cdFx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLmhpZGUoKVxuXHRcdEAkaW5wPy5yZW1vdmUoKVxuXHRcdEAkKCBcIi5zZWxlY3QtY2hlY2tcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKCkgaWYgZXZudD8uc3RvcFByb3BhZ2F0aW9uXG5cdFx0X3ZhbHMgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHQjIElzc3VlIzQ5IGlmIG5vdGhpbmcgd2FzIHNlbGVjdGVkIGNsb3NlIHRoZSBzZWxlY3QtdmlldyBhbmQgcmVtb3ZlIHRoZSB3aG9sZSBmYWNldFxuXHRcdFx0QGNsb3NlKClcblx0XHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIndhaXRGb3JBc3luY1wiIClcblx0XHRcdFx0QHN1Yi5kZWwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QF9zZWxlY3QoIF92YWxzIClcblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfc2VsZWN0OiAoIF92YWxzICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwid2FpdEZvckFzeW5jXCIsIGZhbHNlIClcblx0XHRNb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRmb3IgX3ZhbCBpbiBfdmFsc1xuXHRcdFx0QHJlc3VsdC5hZGQoIG5ldyBNb2RlbENvbnN0KCBfdmFsICkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1NlbGVjdFxuIiwiY2xhc3MgRmFjZXRTdWJTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc3RyaW5nLmphZGVcIiApXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdHN1cGVyXG5cdFx0dHJ5XG5cdFx0XHRAJGlucD8ucmVtb3ZlPygpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0X29sZFZhbCA9IEByZXN1bHQ/LmZpcnN0KCk/LmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHQjcmV0dXJuIGlmIEBfY2hlY2tTZWxlY3RFbXB0eSggX3ZhbCwgZXZudCApXG5cdFx0QHNldCggX3ZhbCwgZXZudCApXG5cdFx0cmV0dXJuXG5cdFxuXHRmb2N1czogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wLnNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZ1xuIiwiU3ViVmlldyA9IHJlcXVpcmUoIFwiLi9zdWJcIiApXG5TZWxlY3RvclZpZXcgPSByZXF1aXJlKCBcIi4vc2VsZWN0b3JcIiApXG5cbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgTWFpblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3dyYXBwZXIuamFkZVwiIClcblxuXHRldmVudHM6XG5cdFx0XCJtb3VzZWRvd24gLnNlYXJjaC1idG5cIjogXCJfb25TZWFyY2hcIlxuXHRcdFwiY2xpY2sgLnNlYXJjaC1idG5cIjogXCJfb25TZWFyY2hcIlxuXHRcdFwiZm9jdXMgLnNlYXJjaC1idG5cIjogXCJfb25Gb2N1c1NlYXJjaFwiXG5cdFx0XCJtb3VzZWRvd24gLmFkZC1mYWNldC1idG5cIjogXCJfYWRkRmFjZXRcIlxuXHRcdFwiY2xpY2tcIjogXCJfYWRkRmFjZXRcIlxuXHRcblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucz17fSApLT5cblx0XHRAc2VhcmNoQnV0dG9uID0gb3B0aW9ucz8uc2VhcmNoQnV0dG9uXG5cdFx0QGJ1dHRvbnNGaXJzdCA9IG9wdGlvbnM/LmJ1dHRvbnNGaXJzdCBvciBmYWxzZVxuXHRcdFxuXHRcdEBfb25TZWFyY2ggPSBfLmRlYm91bmNlKCBAX19vblNlYXJjaCwgKCBAc2VhcmNoQnV0dG9uPy5kZWJvdW5jZSBvciAzMDAgKSwgeyB0cmFpbGluZzogZmFsc2UsIGxlYWRpbmc6IHRydWUgfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRcblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdEBqUXVlcnkgPSBAbWFpbi5qUXVlcnlcblx0XHRAaWR4ID0gb3B0aW9ucy5pZHhcblx0XHRAcmVzdWx0cyA9IG9wdGlvbnMucmVzdWx0c1xuXHRcdFxuXHRcdEBmYWNldHMgPSB7fVxuXHRcdFxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cdFx0XG5cdFx0X2NsID0gXCJpZ2d5IGNsZWFyZml4XCJcblx0XHRpZiBAZWwuY2xhc3NOYW1lPy5sZW5ndGhcblx0XHRcdF9jbCA9IFwiIFwiICsgX2NsXG5cdFx0QGVsLmNsYXNzTmFtZSArPSBfY2xcblx0XHRAcmVuZGVyKClcblx0XHRAX291dGVyQ2xpY2tMaXN0ZW4oKVxuXHRcdEBfa2V5TGlzdGVuKClcblx0XHRcblx0XHRfdmFsdWVGYWNldHMgPSBAY29sbGVjdGlvbi5maWx0ZXIoICggZmN0ICktPnJldHVybiBmY3Q/LmdldCggXCJ2YWx1ZVwiICk/IG9yIGZjdD8uZ2V0KCBcInBpbm5lZFwiICkgKVxuXHRcdFxuXHRcdF9mblNvcnQgPSAoIGtleSApLT5cblx0XHRcdHJldHVybiAoIHYxLCB2MiApLT5cblx0XHRcdFx0aWYgdjFbIGtleSBdID4gdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIDFcblx0XHRcdFx0aWYgdjFbIGtleSBdIDwgdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHRcdHJldHVybiAwXG5cdFx0XG5cdFx0Zm9yIGZjdCBpbiBfdmFsdWVGYWNldHMuc29ydCggX2ZuU29ydCggXCJfaWR4XCIgKSApXG5cdFx0XHRAZ2VuU3ViKCBmY3QsIGZhbHNlLCB0cnVlIClcblx0XHRcblx0XHRAY29sbGVjdGlvbi5vbiBcImFkZFwiLCA9PlxuXHRcdFx0QCRhZGRCdG4uc2hvdygpXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0X2FjdGl2ZSA9IEBjb2xsZWN0aW9uLmZpbHRlciggKCBmY3QgKS0+cmV0dXJuIGZjdD8uZ2V0KCBcImFjdGl2ZVwiICkgYW5kIGZjdD8uZ2V0KCBcInBpbm5lZFwiICkgKVxuXHRcdFx0aWYgX2FjdGl2ZS5sZW5ndGhcblx0XHRcdFx0dmlldyA9IEBmYWNldHNbIF9hY3RpdmVbIDAgXS5pZCBdXG5cdFx0XHRcdCNAc3VidmlldyA9IHZpZXdcblx0XHRcdFx0dmlldz8ucmVvcGVuKClcblx0XHRcdFx0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCAwIClcblx0XHRcblx0XHRyZXR1cm5cblx0XG5cdHRlbXBsYXRlRGF0YTogPT5cblx0XHRfcmV0ID1cblx0XHRcdHRhYl9pbmRleDogKCAoICggQGlkeCBvciAxICkgKyAxICkgKiAxMDAwICkgLSAxMFxuXHRcdGlmICBAc2VhcmNoQnV0dG9uP1xuXHRcdFx0X3JldC5zZWFyY2hCdXR0b24gPVxuXHRcdFx0XHR0ZW1wbGF0ZTogQHNlYXJjaEJ1dHRvbi50ZW1wbGF0ZSBvciBcIjxpIGNsYXNzPVxcXCJmYSBmYS1zZWFyY2hcXFwiPjwvaT5cIlxuXHRcdFx0XHRldmVudDogQHNlYXJjaEJ1dHRvbi5ldmVudCBvciBcInNlYXJjaFwiXG5cdFx0XHRcdHB1bGxyaWdodDogQHNlYXJjaEJ1dHRvbi5wdWxscmlnaHQgb3IgZmFsc2Vcblx0XHRcdFx0Y3NzY2xhc3M6IEBzZWFyY2hCdXR0b24uY3NzY2xhc3Mgb3IgXCJidG4gYnRuLXByaW1hcnlcIlxuXHRcdFxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRyZW5kZXI6ID0+XG5cdFx0X3RwbERhdGEgPSBAdGVtcGxhdGVEYXRhKClcblx0XHRAJGVsLmh0bWwoIEB0ZW1wbGF0ZSggX3RwbERhdGEgKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRpZiBfdHBsRGF0YS5zZWFyY2hCdXR0b24/XG5cdFx0XHRAJHNlYXJjaEJ0biA9IEAkKCBcIi5zZWFyY2gtYnRuXCIgKVxuXHRcdHJldHVyblxuXG5cdF9hZGRGYWNldDogKCBldm50ICk9PlxuXHRcdEBUTW9wZW5BZGRGYWNldCA9IHNldFRpbWVvdXQoID0+XG5cdFx0XHRAYWRkRmFjZXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblxuXHRleGl0OiAoIG5leHRBZGQgPSB0cnVlICk9PlxuXHRcdGlmIEBzdWJ2aWV3XG5cdFx0XHRAc3Vidmlldy5jbG9zZSgpXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIG5leHRBZGRcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHQjY29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTRUxFQ1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuY2xvc2UoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW1GYWNldDogKCBmYWNldE0gKT0+XG5cdFx0QHJlc3VsdHMucmVtb3ZlKCBmYWNldE0uZ2V0KCBcIm5hbWVcIiApIClcblx0XHRyZXR1cm5cblxuXHRzZXRGYWNldDogKCBmYWNldE0sIGRhdGEgKT0+XG5cdFx0QGNvbGxlY3Rpb24ucmVtb3ZlKCBmYWNldE0gKVxuXG5cdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggZGF0YSwgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDogZmFjZXRNIH0gKVxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdEAkYWRkQnRuLmhpZGUoKVxuXHRcdHJldHVyblxuXG5cdGdlblN1YjogKCBmYWNldE0sIGFkZEFmdGVyID0gdHJ1ZSwgaW5pdGlhbEFkZD1mYWxzZSApPT5cblx0XHRzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBwYXJlbnQ6IEAgKVxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzLCBldm50ICk9PlxuXHRcdFx0aWYgc3Vidmlldz8ubW9kZWw/LmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNzdWJ2aWV3Lm9mZigpXG5cdFx0XHRzdWJ2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0QGFkZEZhY2V0KCkgaWYgYWRkQWZ0ZXIgYW5kIGV2bnQ/LnR5cGUgaXNudCBcImZvY3Vzb3V0XCJcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJyZW9wZW5cIiwgPT5cblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF9zZWxmID0gQFxuXHRcdHN1YnZpZXcub24gXCJzZWxlY3RlZFwiLCAoIGZhY2V0TSwgZGF0YSwgZXZudCApLT5cblx0XHRcdCNjb25zb2xlLmxvZyBcInN1YnZpZXcgLSBzZWxlY3RlZFwiLCBkYXRhLCBAaXNSZXN1bHRFbXB0eSggZGF0YSApXG5cdFx0XHRfc2VsZi5zZXRGYWNldCggZmFjZXRNLCBkYXRhIClcblx0XHRcdGlmICggbm90IEBzZWxlY3R2aWV3Ll9pc0Z1bGw/IG9yIEBzZWxlY3R2aWV3Ll9pc0Z1bGwoKSApIGFuZCBldm50Py50eXBlIGlzbnQgXCJmb2N1c291dFwiXG5cdFx0XHRcdF9zZWxmLl9uZXh0RmFjZXQoIGV2bnQsIEAgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0c3Vidmlldy5ldmVudHNBdHRhY2hlZCA9IHRydWVcblx0XHRcblx0XHRAYXBwZW5kRmFjZXRFbCggc3Vidmlldy5yZW5kZXIoIGluaXRpYWxBZGQgKSApXG5cdFx0QGZhY2V0c1sgZmFjZXRNLmlkIF0gPSBzdWJ2aWV3XG5cdFx0cmV0dXJuIHN1YnZpZXdcblxuXHRhZGRGYWNldDogPT5cblx0XHQjY29uc29sZS5lcnJvciBcImFkZEZhY2V0XCIsIEBzZWxlY3R2aWV3PywgQHN1YnZpZXc/XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU0VMRUNUIEVYSVNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU1VCIEVYSVNUXCJcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdCNyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSwgbWFpbjogQCApXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcIm9wZW5lZFwiLCA9PlxuXHRcdFx0QF9vbk9wZW5lZCgpXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdEBfb25DbG9zZWQoKVxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU0VMRUNUIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRpZiBub3QgcmVzdWx0cz8ubGVuZ3RoIGFuZCBAc3Vidmlldz9cblx0XHRcdFx0I0BzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNLCBkYXRhLCBldm50ICk9PlxuXHRcdFx0ZmFjZXRNLnNldCggXCJ2YWx1ZVwiLCBudWxsIClcblx0XHRcdEBzdWJ2aWV3ID0gQGdlblN1YiggZmFjZXRNIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXHRcdFx0cmV0dXJuXG5cdFxuXHRcdCNAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAYXBwZW5kRmFjZXRFbCggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRyZXR1cm5cblx0XG5cdGFwcGVuZEZhY2V0RWw6ICggZWwgKT0+XG5cdFx0aWYgQGJ1dHRvbnNGaXJzdFxuXHRcdFx0QCRlbC5hcHBlbmQoIGVsIClcblx0XHRlbHNlXG5cdFx0XHQoIEAkc2VhcmNoQnRuIG9yIEAkYWRkQnRuICkuYmVmb3JlKCBlbCApXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25PcGVuZWQ6ID0+XG5cdFx0IyBkbyBub3QgaGlkZS9zaG93IGlmIHRoZSBidXR0b25zIGFyZSBiZWZvcmUgdGhlIHJlc3VsdHNcblx0XHRpZiBub3QgQGJ1dHRvbnNGaXJzdFxuXHRcdFx0QCRhZGRCdG4/LmhpZGUoKVxuXHRcdHJldHVyblxuXHRcblx0X29uQ2xvc2VkOiA9PlxuXHRcdCMgZG8gbm90IGhpZGUvc2hvdyBpZiB0aGUgYnV0dG9ucyBhcmUgYmVmb3JlIHRoZSByZXN1bHRzXG5cdFx0aWYgbm90IEBidXR0b25zRmlyc3Rcblx0XHRcdEAkYWRkQnRuPy5zaG93KClcblx0XHRyZXR1cm5cblx0XG5cdF9vdXRlckNsaWNrTGlzdGVuOiA9PlxuXHRcdGpRdWVyeSggZG9jdW1lbnQgKS5vbiBcImNsaWNrXCIsIEBfb3V0ZXJDbGlja1xuXHRcdHJldHVyblxuXHRcblx0XHRcblx0X2tleUxpc3RlbjogPT5cblx0XHRqUXVlcnkoIGRvY3VtZW50ICkub24gXCJrZXlkb3duXCIsICggZXZudCApPT5cblx0XHRcdCR0Z3J0ID0gJCggZXZudC50YXJnZXQgKVxuXHRcdFx0XG5cdFx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRU5URVIgYW5kIEAkYWRkQnRuLmlzKCAkdGdydCApXG5cdFx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0XHRAYWRkRmFjZXQoKVxuXHRcdFx0XHQsIDAgKVxuXHRcdFx0XHRcblx0XHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5UQUIgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLlRBQlxuXHRcdFx0XHQjY29uc29sZS5sb2coJ2tleScsICR0Z3J0LCBldm50Py5zaGlmdEtleSwgQHNlbGVjdHZpZXc/LmlzT3Blbilcblx0XHRcdFx0I2V2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XG5cdFx0XHRcdGlmIEAkc2VhcmNoQnRuPyBhbmQgQCRhZGRCdG4uaXMoICR0Z3J0ICkgYW5kIGV2bnQ/LnNoaWZ0S2V5XG5cdFx0XHRcdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0QFRNb3BlbkFkZEZhY2V0ID0gc2V0VGltZW91dCggPT5cblx0XHRcdFx0XHRcdEBmb2N1c1NlYXJjaCgpXG5cdFx0XHRcdFx0LCAwIClcblx0XHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0XHRpZiBAJGFkZEJ0bi5pcyggJHRncnQgKSBhbmQgbm90IGV2bnQ/LnNoaWZ0S2V5IGFuZCBAYnV0dG9uc0ZpcnN0XG5cdFx0XHRcdFx0QG9wZW5GaXJzdEZhY2V0KClcblxuXHRcdFx0XHQjIGNhc2Ugb25seSB0aGUgZmFjZXQgc2VsZWN0b3IgaXMgb3BlblxuXHRcdFx0XHRpZiBub3QgQCRzZWFyY2hCdG4/IGFuZCBAc2VsZWN0dmlldz8uaXNPcGVuXG5cdFx0XHRcdFx0aWYgZXZudD8uc2hpZnRLZXlcblx0XHRcdFx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0XHRAb3Blbkxhc3RGYWNldCgpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0QHNlbGVjdHZpZXcuY2xvc2UoKVxuXHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdGlmIEAkc2VhcmNoQnRuPyBhbmQgQCRzZWFyY2hCdG4uaXMoICR0Z3J0ICkgYW5kIGV2bnQ/LnNoaWZ0S2V5IGFuZCBub3QgQGJ1dHRvbnNGaXJzdFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdEBvcGVuTGFzdEZhY2V0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcblx0XHRcdFx0aWYgbm90IEAkc2VhcmNoQnRuPyBhbmQgQCRhZGRCdG4uaXMoICR0Z3J0ICkgYW5kIGV2bnQ/LnNoaWZ0S2V5XG5cdFx0XHRcdFx0aWYgbm90IEBidXR0b25zRmlyc3Rcblx0XHRcdFx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0XHRAb3Blbkxhc3RGYWNldCgpXG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XG5cdFx0XHRcdGlmIEAkc2VhcmNoQnRuPyBhbmQgQHNlbGVjdHZpZXc/LmlzT3BlblxuXHRcdFx0XHRcdGlmIGV2bnQ/LnNoaWZ0S2V5XG5cdFx0XHRcdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdFx0QGZvY3VzU2VhcmNoKClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRcdFx0XHRAc2VsZWN0dmlldy5jbG9zZSgpXG5cdFx0XHRcdFx0XHQsIDAgKVxuXHRcdFx0XHRcdFx0I3JldHVyblxuXHRcdFx0XHRcblx0XHRcdFx0IyBvdGhlcndpc2UgdHJpZ2dlciBlc2NhcGUgZXZlbnQgYW5kIGxpc3RlbiBmb3IgdGhlIHJlc3BvbnNlIG9mIHRoZSBvcGVuIGZhY2V0XG5cdFx0XHRcdEB0cmlnZ2VyIFwiZXNjYXBlXCIsIGV2bnQsIEBfbmV4dEZhY2V0XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0aWYgZXZudC5rZXlDb2RlIGlzIEtFWUNPREVTLkVTQyBvciBldm50LmtleUNvZGUgaW4gS0VZQ09ERVMuRVNDXG5cdFx0XHRcdEBleGl0KClcblx0XHRcdFx0QHRyaWdnZXIoIFwiZXNjYXBlXCIsIGV2bnQgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdFx0IyBpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRU5URVJcblx0XHRcdCMgXHRyZXR1cm5cblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0b3Blbkxhc3RGYWNldDogPT5cblx0XHRfaWQgPSBAJGFkZEJ0bj8ucHJldkFsbCggXCIuc3ViXCIgKT8uZmlyc3QoKT8uZGF0YSggXCJmY3RpZFwiIClcblx0XHRpZiBfaWQ/XG5cdFx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0XHRAZmFjZXRzWyBfaWQgXT8ucmVvcGVuKClcblx0XHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cblx0b3BlbkZpcnN0RmFjZXQ6ID0+XG5cdFx0X2lkID0gQCRlbC5maW5kKCBcIi5zdWJcIiApPy5maXJzdCgpPy5kYXRhKCBcImZjdGlkXCIgKVxuXHRcdGlmIF9pZD9cblx0XHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRcdEBmYWNldHNbIF9pZCBdPy5yZW9wZW4oKVxuXHRcdFx0LCAwIClcblx0XHRyZXR1cm5cblx0XG5cdF9uZXh0RmFjZXQ6ICggZXZudCwgc3ViVmlldyApPT5cblx0XHQjIGNvbnNvbGUubG9nKCdfbmV4dEZhY2V0JywgZXZudClcblx0XHRfbmV4dEZuID0gaWYgZXZudD8uc2hpZnRLZXkgdGhlbiBcInByZXZcIiBlbHNlIFwibmV4dFwiXG5cdFx0X25leHQgPSBzdWJWaWV3LiRlbD9bIF9uZXh0Rm4gXT8oKVxuXG5cdFx0aWYgX25leHQuaGFzQ2xhc3MoIFwic2VhcmNoLWJ0blwiIClcblx0XHRcdGlmIF9uZXh0Rm4gaXMgXCJwcmV2XCJcblx0XHRcdFx0QG9wZW5MYXN0RmFjZXQoKVxuXHRcdFx0ZWxzZSBpZiBAJHNlYXJjaEJ0bj9cblx0XHRcdFx0QGZvY3VzU2VhcmNoKClcblx0XHRcdHJldHVyblxuXG5cdFx0X25leHRJZCA9IF9uZXh0Py5kYXRhKCBcImZjdGlkXCIgKVxuXHRcdCMgY29uc29sZS5sb2coJ19uZXh0SWQnLCBfbmV4dElkKVxuXHRcdGlmIF9uZXh0SWQ/XG5cdFx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QGZhY2V0c1sgX25leHRJZCBdPy5yZW9wZW4oKVxuXHRcdFx0LCAwIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdCMgY29uc29sZS5sb2coJ2NoZWNrIGRpcicsIF9uZXh0Rm4pXG5cdFx0aWYgQCRzZWFyY2hCdG4/IGFuZCBfbmV4dEZuIGlzIFwibmV4dFwiXG5cdFx0XHRpZiBub3QgQGJ1dHRvbnNGaXJzdFxuXHRcdFx0XHRAZm9jdXNTZWFyY2goKVxuXHRcdGlmIG5vdCBAJHNlYXJjaEJ0bj8gYW5kIF9uZXh0Rm4gaXMgXCJuZXh0XCJcblx0XHRcdEAkYWRkQnRuLmZvY3VzKClcblx0XHRcdEBhZGRGYWNldCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGZvY3VzU2VhcmNoOiA9PlxuXHRcdGlmIEAkc2VhcmNoQnRuP1xuXHRcdFx0QCRzZWFyY2hCdG4uZm9jdXMoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfX29uU2VhcmNoOiAoIGV2bnQgKT0+XG5cdFx0aWYgKCBldm50LnR5cGUgaXMgXCJjbGlja1wiIGFuZCBldm50LmNsaWVudFggaXMgMCBhbmQgZXZudC5jbGllbnRZIGlzIDAgKSBvciBldm50LnR5cGUgaXMgXCJtb3VzZWRvd25cIlxuXHRcdFx0QHRyaWdnZXIoIFwiZXNjYXBlXCIsIGV2bnQgKVxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0ZXZudD8ucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdEBleGl0KClcblx0XHRcdFx0QHRyaWdnZXIoIFwic2VhcmNoYnV0dG9uXCIsIEBzZWFyY2hCdXR0b24uZXZlbnQgKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdCwgMCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XG5cdF9vbkZvY3VzU2VhcmNoOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEBzZWxlY3R2aWV3Py5jbG9zZT8oKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfb3V0ZXJDbGljazogKCBldm50ICk9PlxuXHRcdGNsZWFyVGltZW91dCggQFRNb3BlbkFkZEZhY2V0ICkgaWYgQFRNb3BlbkFkZEZhY2V0P1xuXHRcdF9wb3NXcnAgPSBAZWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGV2bnQudGFyZ2V0IClcblx0XHRpZiBub3QgKCBfcG9zV3JwIGlzIDAgb3IgX3Bvc1dycCAtIDE2ID49IDAgKVxuXHRcdFx0QGV4aXQoIGZhbHNlIClcblx0XHRyZXR1cm5cblx0XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblZpZXdcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU2VsZWN0b3JWaWV3IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0cy9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3Rvci5qYWRlXCIgKVxuXHR0ZW1wbGF0ZUVsOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9ybGkuamFkZVwiIClcblx0c2VsZWN0Q291bnQ6IDFcblxuXHRjbGFzc05hbWU6ID0+XG5cdFx0Y2xzID0gWyBcImFkZC1mYWNldFwiIF1cblx0XHRpZiBAY3VzdG9tXG5cdFx0XHRjbHMucHVzaCBcImN1c3RvbVwiXG5cdFx0cmV0dXJuIGNscy5qb2luKCBcIiBcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwibW91c2Vkb3duIGFcIjogXCJfb25DbGlja1wiXG5cdFx0XCJmb2N1cyBpbnB1dCMje0BjaWR9XCI6IFwib3BlblwiXG5cdFx0I1wiYmx1ciBpbnB1dCMje0BjaWR9XCI6IFwiY2xvc2VcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblx0XHRcImtleXVwIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0QGN1c3RvbSA9IG9wdGlvbnMuY3VzdG9tIG9yIGZhbHNlXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRAY3VyclF1ZXJ5ID0gXCJcIlxuXHRcdFxuXHRcdGlmIG9wdGlvbnMubWFpbj9cblx0XHRcdEBtYWluID0gb3B0aW9ucy5tYWluXG5cdFx0XG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0c3VwZXJcblx0XHRAc2VhcmNoY29sbCA9IEBjb2xsZWN0aW9uLnN1YiggLT50cnVlIClcblx0XHRAcmVzdWx0ID0gbmV3IEBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yKClcblx0XHRcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHMgd2hlbiBub3QgbW9kZWwuZ2V0KCBcInBpbm5lZFwiIClcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfdG1wbCA9IG1vZGVsLmdldCggXCJsYWJlbHRlbXBsYXRlXCIgKVxuXHRcdFx0aWYgX3RtcGw/XG5cdFx0XHRcdF9sYmwgPSBfdG1wbC5yZXBsYWNlKCBcInt7bGFiZWx9fVwiLCBfbGJsIClcblx0XHRcdFx0XG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXHRcdFx0X2Nzc2NsYXNzID0gbW9kZWwuZ2V0KCBcImNzc2NsYXNzXCIgKVxuXHRcdFx0aWYgQGN1cnJRdWVyeT8ubGVuZ3RoID4gMVxuXHRcdFx0XHRfbGJsID0gX2xibC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBAY3VyclF1ZXJ5LCBcImdpXCIgKSwgKCggc3RyICktPnJldHVybiBcIjxiPiN7c3RyfTwvYj5cIiApIClcblx0XHRcdF9saXN0LnB1c2ggbGFiZWw6IF9sYmwsIGlkOiBfaWQsIGNzc2NsYXNzOiBfY3NzY2xhc3Ncblx0XHQjaWYgX2xpc3QubGVuZ3RoXG5cdFx0QCRsaXN0LmFwcGVuZCggQHRlbXBsYXRlRWwoXG5cdFx0XHRsaXN0OiBfbGlzdCxcblx0XHRcdHF1ZXJ5OiBAY3VyclF1ZXJ5LFxuXHRcdFx0YWN0aXZlSWR4OiBAYWN0aXZlSWR4LFxuXHRcdFx0Y3VzdG9tOiBAY3VzdG9tXG5cdFx0KSApXG5cblx0XHRAX2NoZWNrU2Nyb2xsKClcblx0XHRcblx0XHRyZXR1cm4gQCRsaXN0XG5cblx0X3Njcm9sbFRpbGw6IDE5OFxuXHRfY2hlY2tTY3JvbGw6ID0+XG5cdFx0X2hlaWdodCA9IEAkbGlzdC5oZWlnaHQoKVxuXHRcdGlmIF9oZWlnaHQgPiAwXG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBfaGVpZ2h0IClcblx0XHRcdHJldHVyblxuXG5cdFx0IyBleGl0IHRoZSB0aGUgY2FsbCBzdGFjayB0byBjaGVjayBoZWlnaHQgYWZ0ZXIgdGhlIG1vZHVsZSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgZG9tXG5cdFx0c2V0VGltZW91dCggPT5cblx0XHRcdEBzY3JvbGxIZWxwZXIoIEAkbGlzdC5oZWlnaHQoKSApXG5cdFx0LCAwIClcblx0XHRyZXR1cm5cblxuXHRzY3JvbGxIZWxwZXI6ICggaGVpZ2h0ICk9PlxuXHRcdGlmIGhlaWdodCA+PSBAX3Njcm9sbFRpbGxcblx0XHRcdEBzY3JvbGxpbmcgPSB0cnVlXG5cdFx0ZWxzZVxuXHRcdFx0QHNjcm9sbGluZyA9IGZhbHNlXG5cdFx0cmV0dXJuXG5cblx0Y2hlY2tPcHRpb25zRW1wdHk6ID0+XG5cdFx0I2lmIEBzZWFyY2hjb2xsLmxlbmd0aCA8PSAwXG5cdFx0I1x0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRfb25DbGljazogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblxuXHRcdF9pZCA9IEAkKCBldm50LmN1cnJlbnRUYXJnZXQgKS5kYXRhKCBcImlkXCIgKVxuXHRcdGlmIG5vdCBfaWQ/XG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdF9tZGwgPSBAY29sbGVjdGlvbi5nZXQoIF9pZCApXG5cdFx0aWYgbm90IF9tZGw/XG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdHJldHVybiB0cnVlXG5cdFx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGlmIEBtYWluP1xuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAbWFpbi5mb2N1c1NlYXJjaCgpXG5cdFx0ZWxzZVxuXHRcdFx0c3VwZXIoIGV2ZW50IClcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0ZWQ6ICggbWRsICk9PlxuXHRcdGlmIG5vdCBAbWFpbj8gYW5kIEBfaXNGdWxsKClcblx0XHRcdF9pZCA9IEByZXN1bHQubGFzdCgpPy5pZFxuXHRcdFx0QHJtUmVzKCBfaWQgKVxuXHRcdFx0XG5cdFx0dHJ5XG5cdFx0XHRpZiBtZGwub25seUV4ZWM/XG5cdFx0XHRcdG1kbD8uZXhlYz8oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRjYXRjaCBfZXJyXG5cdFx0XHR0cnlcblx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyMzogQ0FUQ0ggLSBDbGFzczojeyBAY29uc3RydWN0b3IubmFtZSB9IC0gYWN0aXZlSWR4OiN7QGFjdGl2ZUlkeH0gLSBjb2xsZWN0aW9uOiN7SlNPTi5zdHJpbmdpZnkoIEBjb2xsZWN0aW9uLnRvSlNPTigpKX1cIlxuXHRcdFx0Y2F0Y2ggX2VycmVyclxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSFwiXG5cdFx0XG5cdFx0aWYgbWRsP1xuXHRcdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBtZGwgKVxuXHRcdFx0QHJlc3VsdC5hZGQoIG1kbCApXG5cdFx0XHRAdHJpZ2dlciBcInNlbGVjdGVkXCIsIG1kbFxuXHRcdFxuXHRcdGlmIEBfaXNGdWxsKClcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdF9lbCA9IEAkaW5wLmdldCgwKVxuXHRcdFxuXHRcdF9lbC5zZWxlY3Rpb25TdGFydCA9IF9lbC5zZWxlY3Rpb25FbmQgPSBfZWwudmFsdWUubGVuZ3RoXG5cdFx0cmV0dXJuXG5cdFxuXHRvcGVuOiA9PlxuXHRcdCNjb25zb2xlLmxvZyBcInNlbGVjdG9yIG9wZW5cIlxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50Py50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAbW92ZSggdHJ1ZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBtb3ZlKCBmYWxzZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0QWN0aXZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIF8uaXNTdHJpbmcoIGV2bnQgKVxuXHRcdFx0X3EgPSBldm50XG5cdFx0ZWxzZVxuXHRcdFx0X3EgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKVxuXHRcdGlmIF9xIGlzIEBjdXJyUXVlcnlcblx0XHRcdHJldHVyblxuXG5cdFx0QGN1cnJRdWVyeSA9IF9xXG5cblx0XHRAc2VhcmNoY29sbC51cGRhdGVTdWJGaWx0ZXIoICggbWRsICk9PlxuXHRcdFx0aWYgQHJlc3VsdC5nZXQoIG1kbC5pZCApP1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIG5vdCBfcT8ubGVuZ3RoXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRfbWF0Y2ggPSBtZGwubWF0Y2goIF9xIClcblx0XHRcdHJldHVybiBfbWF0Y2hcblx0XHQsIGZhbHNlIClcblxuXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm5cblxuXHRtb3ZlOiAoIHVwID0gZmFsc2UgKT0+XG5cdFx0X2xpc3QgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGFcIiApXG5cdFxuXHRcdF9jdXN0b21FbGVtZW50Q2hhbmdlID0gaWYgQGN1cnJRdWVyeT8ubGVuZ3RoIHRoZW4gMCBlbHNlIDFcblx0XHRfdG9wID0gMFxuXHRcdGlmIHVwXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxXG5cdFx0ZWxzZVxuXHRcdFx0aWYgQHNlYXJjaGNvbGwubGVuZ3RoIC0gX2N1c3RvbUVsZW1lbnRDaGFuZ2UgPD0gQGFjdGl2ZUlkeFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4ICsgMVxuXG5cdFx0XG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0XyRlbG5ldyA9IEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0aWYgQHNjcm9sbGluZ1xuXHRcdFx0X2VsSCA9IF8kZWxuZXcub3V0ZXJIZWlnaHQoKVxuXHRcdFx0X3BvcyA9IF9lbEggKiAoIF9uZXdpZHggKyAxIClcblx0XHRcdF8kbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3RcIiApXG5cdFx0XHRfc2Nyb2xsVCA9IF8kbGlzdC5zY3JvbGxUb3AoKVxuXHRcdFx0aWYgX3BvcyA+IF9zY3JvbGxUICsgQF9zY3JvbGxUaWxsXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBAX3Njcm9sbFRpbGwgKVxuXHRcdFx0ZWxzZSBpZiBfcG9zIDwgX3Njcm9sbFQgKyBfZWxIXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBfZWxIIClcblxuXHRcdEBhY3RpdmVJZHggPSBfbmV3aWR4XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0Oj0+XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0QWN0aXZlOiAoIGlzRW50ZXJFdmVudD1mYWxzZSApPT5cblx0XHRpZiBub3QgQG1haW4/IGFuZCBAX2lzRnVsbCgpXG5cdFx0XHRfaWQgPSBAcmVzdWx0Lmxhc3QoKT8uaWRcblx0XHRcdEBybVJlcyggX2lkIClcblx0XHRcdFx0XG5cdFx0X3NlbCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYS5hY3RpdmVcIiApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiICkuZGF0YSgpXG5cdFx0XHRcblx0XHRfc2VhcmNoID0gQCRpbnAudmFsKClcblx0XHRcblx0XHRpZiAgbm90IF9zZWw/IGFuZCBAc2VsZWN0Q291bnQgaXNudCAxIGFuZCBpc0VudGVyRXZlbnQgYW5kIG5vdCBfc2VhcmNoPy5sZW5ndGhcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIG5vdCBfc2VsP1xuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRpZiBfc2VsPy5pZHggPj0gMCBhbmQgQHNlYXJjaGNvbGwubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIEBjb2xsZWN0aW9uLmdldCggX3NlbC5pZCApIClcblx0XHRlbHNlIGlmIEBjdXJyUXVlcnk/Lmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBAY3VyclF1ZXJ5LCBjdXN0b206IHRydWUgKSApXG5cdFx0XHRAJGlucC52YWwoIFwiXCIgKVxuXHRcdGVsc2Vcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdG9yVmlld1xuIiwiY2xhc3MgVmlld1N1YiBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc3ViLmphZGVcIiApXG5cdGNsYXNzTmFtZTogPT5cblx0XHRfc3RkID0gXCJzdWJcIlxuXHRcdF90eXBlID0gQG1vZGVsLmdldCggXCJ0eXBlXCIgKVxuXHRcdGlmIF90eXBlP1xuXHRcdFx0X3N0ZCArPSBcIiBzdWItdHlwZS1cIiArIF90eXBlXG5cdFx0XG5cdFx0X25hbWUgPSBAbW9kZWwuZ2V0KCBcIm5hbWVcIiApXG5cdFx0aWYgX25hbWU/XG5cdFx0XHRfc3RkICs9IFwiIHN1Yi1uYW1lLVwiICsgX25hbWVcblx0XHRyZXR1cm4gX3N0ZFxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0QHJlc3VsdCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKClcblx0XHQjQCRlbC5vbiBcImNsaWNrXCIsIEByZW9wZW5cblx0XHRAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblx0XHRAalF1ZXJ5ID0gQHBhcmVudC5qUXVlcnlcblx0XHRcblx0XHRAJGVsLmRhdGEoIFwiZmN0aWRcIiwgQG1vZGVsLmlkIClcblx0XHRcblx0XHRAcGFyZW50Lm9uIFwiZXNjYXBlXCIsICggZXZudCwgY2IgKT0+XG5cdFx0XHRpZiBAX2lzT3BlbiBhbmQgQHNlbGVjdHZpZXc/Ll9vblRhYkFjdGlvbiggZXZudCApIGFuZCBjYj9cblx0XHRcdFx0Y2IoIGV2bnQsIEAgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOlxuXHRcdFwibW91c2Vkb3duXCI6IFwicmVvcGVuXCJcblx0XHRcIm1vdXNlZG93biAucm0tZmFjZXQtYnRuXCI6IFwiZGVsXCJcblx0XHRcblxuXHRyZW5kZXI6ICggaW5pdGlhbEFkZCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdHRyeVxuXHRcdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblx0XHRcdGNhdGNoIF9lcnJcblx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0ggLSBDbGFzczojeyBAY29uc3RydWN0b3IubmFtZSB9IC0gbW9kZWw6I3tKU09OLnN0cmluZ2lmeShAbW9kZWwudG9KU09OKCkpfSAtIHJlc3VsdDoje0pTT04uc3RyaW5naWZ5KCBAcmVzdWx0LnRvSlNPTigpKX1cIlxuXHRcdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0hcIlxuXHRcdFxuXHRcdEAkZWwuaHRtbCBAdGVtcGxhdGVcblx0XHRcdGxhYmVsOiBAbW9kZWwuZ2V0TGFiZWwoKVxuXHRcdFx0c2VsZWN0ZWQ6IF9saXN0XG5cdFx0XHR0eXBlOiBAbW9kZWwuZ2V0KCBcInR5cGVcIiApXG5cdFx0XHRuYW1lOiBAbW9kZWwuZ2V0KCBcIm5hbWVcIiApXG5cdFx0XHRwaW5uZWQ6IEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKSBvciBmYWxzZVxuXHRcdFx0XHRcblx0XHRAJHN1YiA9IEAkKCBcIi5zdWJzZWxlY3RcIiApXG5cdFx0QCRyZXN1bHRzID0gQCQoIFwiLnN1YnJlc3VsdHNcIiApXG5cblx0XHRAZ2VuZXJhdGVTdWIoIGluaXRpYWxBZGQgKVxuXHRcdHJldHVybiBAZWxcblx0XG5cdHJlb3BlbjogKCBldm50ICk9PlxuXHRcdGlmIEBfaXNPcGVuXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBldm50PyBhbmQgJCggZXZudC50YXJnZXQgKS5pcyggXCIucm0tcmVzdWx0LWJ0blwiICkgYW5kIEBzZWxlY3R2aWV3Py5ybVJlcz9cblx0XHRcdEBzZWxlY3R2aWV3LnJtUmVzKCBldm50IClcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRpZiBldm50PyBhbmQgJCggZXZudC50YXJnZXQgKS5pcyggXCIuZWRpdC1yZXN1bHQtYnRuXCIgKSBhbmQgQHNlbGVjdHZpZXc/LmVkaXRSZXM/XG5cdFx0XHRAc2VsZWN0dmlldy5lZGl0UmVzKCBldm50IClcblx0XHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRpZiBub3QgQF9pc09wZW4gYW5kIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXcucmVvcGVuKCBAIClcblx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAdHJpZ2dlciggXCJyZW9wZW5cIiApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGRlbDogKCBldm50ICk9PlxuXHRcdGlmIEBtb2RlbC5nZXQoIFwicGlubmVkXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRAY29sbGVjdGlvbi50cmlnZ2VyKCBcImlnZ3k6cmVtXCIsIEBtb2RlbCApXG5cdFx0QGNvbGxlY3Rpb24uYWRkKCBAbW9kZWwgKVxuXHRcdEByZW1vdmUoKVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiIClcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRyZW1vdmU6ID0+XG5cdFx0QF9pc09wZW4gPSBmYWxzZVxuXHRcdEBzZWxlY3R2aWV3Py5yZW1vdmUoKVxuXHRcdEBwYXJlbnQgPSBudWxsXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0c2VsZWN0ZWQ6ICggb3B0TWRsLCBldm50ICk9PlxuXHRcdEByZXN1bHQuYWRkKCBvcHRNZGwsIHsgbWVyZ2U6IHRydWUgfSApXG5cdFx0QHJlbmRlclJlc3VsdCgpXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQG1vZGVsLCBAc2VsZWN0dmlldy5nZXRSZXN1bHRzKCksIGV2bnQgKVxuXHRcdHJldHVyblxuXHRcblx0cmVtb3ZlZDogKCBvcHRNZGwsIGV2bnQgICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBvcHRNZGwgKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpLCBldm50IClcblx0XHRcblx0XHQjIHJlbW92ZSBmYWNldCBpZiBjb250ZW50IGxlbmd0aCBvciB0aGUgZmFjZXQgaXMgaW4gZWRpdE1vZGVcblx0XHRpZiBAcmVzdWx0Lmxlbmd0aCA8PSAwIGFuZCBub3QgQHNlbGVjdHZpZXcuZWRpdE1vZGVcblx0XHRcdEBkZWwoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRAJHJlc3VsdHMuaHRtbCggQHNlbGVjdHZpZXcucmVuZGVyUmVzdWx0KCkgKVxuXHRcdHJldHVyblxuXG5cdGlzT3BlbjogPT5cblx0XHRyZXR1cm4gQHNlbGVjdHZpZXc/XG5cblx0Zm9jdXM6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QG9wZW4oKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGdlbmVyYXRlU3ViOiAoIGluaXRpYWxBZGQgKT0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAYXR0YWNoU3ViRXZlbnRzKClcblx0XHRcdHJldHVybiBAc2VsZWN0dmlld1xuXHRcdFx0XG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgQG1vZGVsLlN1YlZpZXcoIHN1YjogQCwgbW9kZWw6IEBtb2RlbCwgZWw6IEAkc3ViIClcblx0XHRAYXR0YWNoU3ViRXZlbnRzKClcblx0XHRcdFxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoIGluaXRpYWxBZGQgKSApXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApP1xuXHRcdFx0QHNlbGVjdHZpZXcuc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XHRcblx0YXR0YWNoU3ViRXZlbnRzOiA9PlxuXHRcdGlmIG5vdCBAc2VsZWN0dmlldy5zdWJFdmVudHNBdHRhY2hlZFxuXHRcdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHQsIGV2bnQgKT0+XG5cdFx0XHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRcdFx0aWYgQG1vZGVsLmdldCggXCJwaW5uZWRcIiApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdCNAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0XHQjQHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCByZXN1bHQsIGV2bnQgKVxuXHRcdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBtZGwsIGV2bnQgKT0+XG5cdFx0XHRcdGlmIG1kbFxuXHRcdFx0XHRcdEBzZWxlY3RlZCggbWRsLCBldm50IClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRcdEBzZWxlY3R2aWV3Lm9uIFwicmVtb3ZlZFwiLCAoIG1kbCApPT5cblx0XHRcdFx0aWYgbWRsXG5cdFx0XHRcdFx0QHJlbW92ZWQoIG1kbCApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0XHRAc2VsZWN0dmlldy5zdWJFdmVudHNBdHRhY2hlZCA9IHRydWVcblx0XHRyZXR1cm5cblx0XG5cdGlzUmVzdWx0RW1wdHk6ICggaW5wICk9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0cmV0dXJuIEBzZWxlY3R2aWV3LmlzUmVzdWx0RW1wdHkoIGlucCApXG5cdFx0cmV0dXJuIHRydWVcblx0XHRcblx0b3BlbjogPT5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXG5cdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRAX2lzT3BlbiA9IHRydWVcblx0XHRcblx0XHQjIEBwYXJlbnQuc3VidmlldyA9IEBcblx0XHQjIEBwYXJlbnQuc2VsZWN0dmlldyA9IEBzZWxlY3R2aWV3XG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1N1YlxuIiwiIiwiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuamFkZSA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgamFkZV9lbmNvZGVfaHRtbF9ydWxlcyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnXG59O1xudmFyIGphZGVfbWF0Y2hfaHRtbCA9IC9bJjw+XCJdL2c7XG5cbmZ1bmN0aW9uIGphZGVfZW5jb2RlX2NoYXIoYykge1xuICByZXR1cm4gamFkZV9lbmNvZGVfaHRtbF9ydWxlc1tjXSB8fCBjO1xufVxuXG5leHBvcnRzLmVzY2FwZSA9IGphZGVfZXNjYXBlO1xuZnVuY3Rpb24gamFkZV9lc2NhcGUoaHRtbCl7XG4gIHZhciByZXN1bHQgPSBTdHJpbmcoaHRtbCkucmVwbGFjZShqYWRlX21hdGNoX2h0bWwsIGphZGVfZW5jb2RlX2NoYXIpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbmV4cG9ydHMuRGVidWdJdGVtID0gZnVuY3Rpb24gRGVidWdJdGVtKGxpbmVubywgZmlsZW5hbWUpIHtcbiAgdGhpcy5saW5lbm8gPSBsaW5lbm87XG4gIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbn1cblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9nZXRLZXksIGlzQXJyYXksIHRvU3RyaW5nO1xuXG4gIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbiAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24oYXJyKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICBfZ2V0S2V5ID0gZnVuY3Rpb24oZWwsIGtleSkge1xuICAgIHJldHVybiBlbFtrZXldO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5cywgZm9yd2FyZCwgZ2V0S2V5KSB7XG4gICAgdmFyIGZuc29ydCwgcmVmO1xuICAgIGlmIChmb3J3YXJkID09IG51bGwpIHtcbiAgICAgIGZvcndhcmQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoZ2V0S2V5ID09IG51bGwpIHtcbiAgICAgIGdldEtleSA9IF9nZXRLZXk7XG4gICAgfVxuICAgIGlmICghaXNBcnJheShrZXlzKSkge1xuICAgICAga2V5cyA9IFtrZXlzXTtcbiAgICB9XG4gICAgZm5zb3J0ID0gZnVuY3Rpb24oZm9yd2FyZCwga2V5LCBuZXh0a2V5cykge1xuICAgICAgdmFyIF9md3JkLCBfaywgbmV4dFNvcnQsIHJlZjtcbiAgICAgIGlmIChuZXh0a2V5cyAhPSBudWxsID8gbmV4dGtleXMubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgIF9rID0gKHJlZiA9IG5leHRrZXlzLnNwbGljZSgwLCAxKSkgIT0gbnVsbCA/IHJlZlswXSA6IHZvaWQgMDtcbiAgICAgICAgaWYgKF9rICE9IG51bGwpIHtcbiAgICAgICAgICBuZXh0U29ydCA9IGZuc29ydChmb3J3YXJkLCBfaywgbmV4dGtleXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBfZndyZCA9IChmb3J3YXJkW2tleV0gIT0gbnVsbCA/IGZvcndhcmRba2V5XSA6IChmb3J3YXJkW1wiP1wiXSAhPSBudWxsID8gZm9yd2FyZFtcIj9cIl0gOiBmb3J3YXJkKSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWxBLCBlbEIpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgX2EgPSBnZXRLZXkoZWxBLCBrZXkpO1xuICAgICAgICBfYiA9IGdldEtleShlbEIsIGtleSk7XG4gICAgICAgIGlmIChfYSA8IF9iKSB7XG4gICAgICAgICAgaWYgKF9md3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfYSA+IF9iKSB7XG4gICAgICAgICAgaWYgKF9md3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfYSA9PT0gX2IpIHtcbiAgICAgICAgICBpZiAobmV4dFNvcnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRTb3J0KGVsQSwgZWxCKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIGZuc29ydChmb3J3YXJkLCAocmVmID0ga2V5cy5zcGxpY2UoMCwgMSkpICE9IG51bGwgPyByZWZbMF0gOiB2b2lkIDAsIGtleXMpO1xuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
