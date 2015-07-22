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
    ref1 = this.collection.filter(function(fct) {
      return (fct != null ? fct.get("value") : void 0) != null;
    });
    for (i = 0, len = ref1.length; i < len; i++) {
      fct = ref1[i];
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
    if (!this.multiSelect) {
      this.close();
    }
    return false;
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
    if ((_sel == null) && this.multiSelect && isEnterEvent && !(_search != null ? _search.length : void 0)) {
      this.close();
      return;
    }
    if (_sel == null) {
      return;
    }
    this.activeIdx = 0;
    if ((_sel != null ? _sel.idx : void 0) >= 0 && this.searchcoll.length) {
      console.log("got", this.collection.get(_sel.id), this.collection, _sel.id);
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

},{"fs":35}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3JhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvcmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvc3VicmVzdWx0cy5jb2ZmZWUiLCJfc3JjL2pzL3RtcGxzL2RhdGVyYW5nZS5qYWRlIiwiX3NyYy9qcy90bXBscy9udW1iZXIuamFkZSIsIl9zcmMvanMvdG1wbHMvcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvcmVzdWx0X2Jhc2UuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0LmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdG9yLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdG9ybGkuamFkZSIsIl9zcmMvanMvdG1wbHMvc3RyaW5nLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N1Yi5qYWRlIiwiX3NyYy9qcy90bXBscy93cmFwcGVyLmphZGUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvZGF0ZXJhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3ViYXJyYXkuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1Ym51bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1YnNlbGVjdC5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc3ViLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvamFkZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSw0R0FBQTtFQUFBOzs7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUyxjQUFUOztBQUNYLE1BQUEsR0FBUyxPQUFBLENBQVMsdUJBQVQ7O0FBQ1QsU0FBQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVDs7QUFDWixRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osU0FBQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVDs7QUFDWixRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLFlBQUEsR0FBZSxPQUFBLENBQVMsMEJBQVQ7O0FBQ2YsUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxPQUFBLEdBQVUsT0FBQSxDQUFTLGtCQUFUOztBQUVKOzs7aUJBQ0wsQ0FBQSxHQUFHOztFQUNVLGNBQUUsRUFBRixFQUFNLE1BQU4sRUFBbUIsT0FBbkI7O01BQU0sU0FBUzs7O01BQUksVUFBVTs7Ozs7Ozs7O0lBQ3pDLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxF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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1haW5WaWV3ID0gcmVxdWlyZSggXCIuL3ZpZXdzL21haW5cIiApXG5GYWNldHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcbkZjdFN0cmluZyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc3RyaW5nXCIgKVxuRmN0QXJyYXkgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2FycmF5XCIgKVxuRmN0U2VsZWN0ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9zZWxlY3RcIiApXG5GY3ROdW1iZXIgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X251bWJlclwiIClcbkZjdFJhbmdlID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9yYW5nZVwiIClcbkZjdERhdGVSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlXCIgKVxuRmN0RXZlbnQgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2V2ZW50XCIgKVxuUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvcmVzdWx0c1wiIClcblxuY2xhc3MgSUdHWSBleHRlbmRzIEJhY2tib25lLkV2ZW50c1xuXHQkOiBqUXVlcnlcblx0Y29uc3RydWN0b3I6ICggZWwsIGZhY2V0cyA9IFtdLCBvcHRpb25zID0ge30gKS0+XG5cdFx0Xy5leHRlbmQgQCwgQmFja2JvbmUuRXZlbnRzXG5cdFx0QF9pbml0RXJyb3JzKClcblx0XHRcblx0XHQjIGluaXQgZWxlbWVudFxuXHRcdEAkZWwgPSBAX3ByZXBhcmVFbCggZWwgKVxuXHRcdEBlbCA9IEAkZWxbMF1cblx0XHRAJGVsLmRhdGEoIFwiaWdneVwiLCBAIClcblxuXHRcdCMgaW5pdCBmYWNldHNcblx0XHRAZmFjZXRzID0gQF9wcmVwYXJlRmFjZXRzKCBmYWNldHMgKVxuXHRcdEByZXN1bHRzID0gbmV3IFJlc3VsdHMoIG51bGwsIG9wdGlvbnMgKVxuXG5cdFx0QHJlc3VsdHMub24gXCJhZGRcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcInJlbW92ZVwiLCBAdHJpZ2dlckNoYW5nZVxuXHRcdEByZXN1bHRzLm9uIFwiY2hhbmdlXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cblx0XHRAdmlldyA9IG5ldyBNYWluVmlldyggZWw6IEAkZWwsIGNvbGxlY3Rpb246IEBmYWNldHMsIHJlc3VsdHM6IEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfcHJlcGFyZUVsOiAoIGVsICk9PlxuXG5cdFx0aWYgbm90IGVsP1xuXHRcdFx0dGhyb3cgQF9lcnJvciggXCJFTUlTU0lOR0VMXCIgKVxuXG5cdFx0aWYgXy5pc1N0cmluZyggZWwgKVxuXHRcdFx0aWYgbm90IGVsLmxlbmd0aFxuXHRcdFx0XHR0aHJvdyBAX2Vycm9yKCBcIkVFTVBUWUVMU1RSSU5HXCIgKVxuXG5cdFx0XHRfJGVsID0gQCQoIGVsIClcblx0XHRcdGlmIG5vdCBfJGVsPy5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMU1RSSU5HXCIgKVxuXG5cdFx0XHRyZXR1cm4gXyRlbFxuXG5cdFx0aWYgZWwgaW5zdGFuY2VvZiBqUXVlcnlcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTEpRVUVSWVwiIClcblxuXHRcdFx0IyBUT0RPIGhhbmRsZSBtdWx0aXBsZSBqUXVlcnkgZWxlbWVudHMgdG8gSUdHWSBpbnN0YW5jZXNcblx0XHRcdGlmIGVsLmxlbmd0aCA+IDFcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFU0laRUVMSlFVRVJZXCIgKVxuXG5cdFx0XHRyZXR1cm4gZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgRWxlbWVudFxuXHRcdFx0cmV0dXJuIEAkKCBlbCApXG5cblx0XHR0aHJvdyBAX2Vycm9yKCBcIkVJTlZBTElERUxUWVBFXCIgKVxuXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVGYWNldHM6ICggZmFjZXRzICk9PlxuXHRcdF9yZXQgPSBbXVxuXHRcdGZvciBmYWNldCBpbiBmYWNldHMgd2hlbiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRfcmV0LnB1c2ggX2ZjdFxuXG5cdFx0cmV0dXJuIG5ldyBGYWNldHMoIF9yZXQgKVxuXG5cdF9jcmVhdGVGYWNldDogKCBmYWNldCApLT5cblx0XHRzd2l0Y2ggZmFjZXQudHlwZS50b0xvd2VyQ2FzZSgpXG5cdFx0XHR3aGVuIFwic3RyaW5nXCIgdGhlbiByZXR1cm4gbmV3IEZjdFN0cmluZyggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcInNlbGVjdFwiIHRoZW4gcmV0dXJuIG5ldyBGY3RTZWxlY3QoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJhcnJheVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RBcnJheSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcIm51bWJlclwiIHRoZW4gcmV0dXJuIG5ldyBGY3ROdW1iZXIoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJyYW5nZVwiIHRoZW4gcmV0dXJuIG5ldyBGY3RSYW5nZSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImRhdGVyYW5nZVwiIHRoZW4gcmV0dXJuIG5ldyBGY3REYXRlUmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJldmVudFwiIHRoZW4gcmV0dXJuIG5ldyBGY3RFdmVudCggZmFjZXQsIG1haW46IEAgKVxuXG5cdGFkZEZhY2V0OiAoIGZhY2V0ICk9PlxuXHRcdGlmIG5vdCBAZmFjZXRzP1xuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0QGZhY2V0cy5hZGQoIF9mY3QgKVxuXHRcdHJldHVybiBAXG5cblx0X2Vycm9yOiAoIHR5cGUsIGRhdGEgPSB7fSApPT5cblx0XHRpZiBAZXJyb3JzWyB0eXBlIF0/XG5cdFx0XHRfbXNnID0gQGVycm9yc1sgdHlwZSBdKCBkYXRhIClcblx0XHRlbHNlXG5cdFx0XHRfbXNnID0gXCItXCJcblx0XHRfZXJyID0gbmV3IEVycm9yKClcblx0XHRfZXJyLm5hbWUgPSB0eXBlXG5cdFx0X2Vyci5tZXNzYWdlID0gX21zZ1xuXHRcdHJldHVybiBfZXJyXG5cblx0Z2V0UXVlcnk6ID0+XG5cdFx0cmV0dXJuIEByZXN1bHRzXG5cblx0dHJpZ2dlckNoYW5nZTogPT5cblx0XHRAdHJpZ2dlciggXCJjaGFuZ2VcIiwgQHJlc3VsdHMgKVxuXHRcdHJldHVyblxuXG5cdF9pbml0RXJyb3JzOiA9PlxuXHRcdEBlcnJvcnMgPSB7fVxuXHRcdGZvciBfaywgX3RtcGwgb2YgQEVSUk9SUygpXG5cdFx0XHRAZXJyb3JzWyBfayBdID0gXy50ZW1wbGF0ZSggX3RtcGwgKVxuXHRcdHJldHVyblxuXG5cdEVSUk9SUzogLT5cblx0XHRcIkVJTlZBTElERUxTVFJJTkdcIjogXCJJZiB5b3UgZGVmaW5lIGEgYGVsYCBhcyBTdHJpbmcgaXQgaGFzIHRvIGJlIGEgdmFsaWQgc2VsZWN0b3IgZm9yIGFuIGV4aXN0aW5nIERPTSBlbGVtZW50LlwiXG5cdFx0XCJFRU1QVFlFTFNUUklOR1wiOiBcIlRoZSBgZWxgIGFzIHN0cmluZyBjYW4gbm90IGJlIGVtcHR5LlwiXG5cdFx0XCJFRU1QVFlFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhbiBlbXB0eSBjb2xsZWN0aW9uLlwiXG5cdFx0XCJFU0laRUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGEgcmVzdWx0IG9mIG9uZSBlbC5cIlxuXHRcdFwiRUlOVkFMSURFTFRZUEVcIjogXCJUaGUgYGVsYCBjYW4gb25seSBiZSBhIHNlbGVjdG9yIHN0cmluZywgZG9tIGVsZW1lbnQgb3IgalF1ZXJ5IGNvbGxlY3Rpb25cIlxuXHRcdFwiRU1JU1NJTkdFTFwiOiBcIlBsZWFzZSBkZWZpbmUgYSB0YXJnZXQgYGVsYFwiXG5cbm1vZHVsZS5leHBvcnRzID0gSUdHWVxuIiwiIyMjXG5FWEFNUExFIFVTQUdFXG5cblx0cGFyZW50Q29sbCA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uLlN1YigpXG5cdFxuXHQjIGJ5IEFycmF5XG5cdHN1YkNvbGxBID0gcGFyZW50Q29sbC5zdWIoIFsgMSwgMiwgMyBdIClcblx0XG5cdCMgb3IgYnkgT2JqZWN0XG5cdHN1YkNvbGxPID0gcGFyZW50Q29sbC5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgb3IgYnkgTnVtYmVyXG5cdHN1YkNvbGxOID0gcGFyZW50Q29sbC5zdWIoIDEzIClcblx0XG5cdCMgb3IgYnkgRnVuY3Rpb25cblx0c3ViQ29sbEYgPSBwYXJlbnRDb2xsLnN1YiggKCggbW9kZWwgKS0+IGlmIG1vZGVsLmdldCggXCJhZ2VcIiApID4gMjMgKSApXG5cdFxuXHQjIHN1YmNvbGxlY3Rpb24gb2Ygc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQV9PID0gc3ViQ29sbEEuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gRm9yIHRoaXMgYSBgcmVzZXRgIHdpbGwgYmUgZmlyZWQgb24gdGhlIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEEgPSBzdWJDb2xsQS51cGRhdGVTdWJGaWx0ZXIoIHsgbmFtZTogXCJCYXJcIiwgYWdlOiA0MiB9IClcbiMjI1xuXG5jbGFzcyBCYWNrYm9uZVN1YiBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0IyMjXG5cdCMjIHN1YlxuXHRcblx0YGNvbGxlY3Rpb24uc3ViKCBmaWx0ZXIgKWBcblx0XG5cdEdlbmVyYXRlIGEgc3ViLWNvbGxlY3Rpb24gYnkgYSBmaWx0ZXIuXG5cdFRoZSBtb2RlbHMgd2lsbCBiZSBkaXN0cmlidXRlZCB3aXRoaW4gYWxsIGludm9sdmVkIGNvbGxlY3Rpb25zIHVuZGVyIGNvbnNpZGVyYXRpb24gb2YgdGhlIGZpbHRlci5cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgQ29sbGVjdGlvbiB9IEEgU3ViLUNvbGxlY3Rpb24gYmFzZWQgb24gdGhlIGZpbHRlclxuXHRcblx0QGFwaSBwdWJsaWNcblx0IyMjXG5cdHN1YjogKCBmaWx0ZXIgKT0+XG5cdFx0QHN1YkNvbGxzIG9yPSBbXVxuXHRcdGZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClcblxuXHRcdCMgZmlsdGVyIHRoZSBjb2xsZWN0aW9uXG5cdFx0X21vZGVscyA9IEBmaWx0ZXIgZm5GaWx0ZXJcblx0XHQjIGNyZWF0ZSB0aGUgc3ViY29sbGVjdGlvblxuXHRcdF9zdWIgPSBuZXcgQGNvbnN0cnVjdG9yKCBfbW9kZWxzIClcblxuXHRcdF9zdWIuX3BhcmVudENvbCA9IEBcblx0XHRfc3ViLl9mbkZpbHRlciA9IGZuRmlsdGVyXG5cblx0XHQjIGFkZCBldmVudCBoYW5kbGVycyB0byBkaXN0cmlidXRlIHRoZSBtb2RlbHMgdGhyb3VnaCB0aGUgc3ViIGNvbGxlY3Rpb25zIHRyZWVcblxuXHRcdCMgcmVjaGVjayB0aGUgbW9kZWwgYWdhaW5zdCB0aGUgZmlsdGVyIG9uIGNoYW5nZVxuXHRcdEBvbiBcImNoYW5nZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHR0b0FkZCA9IEBfZm5GaWx0ZXIoIF9tIClcblx0XHRcdGFkZGVkID0gQGdldCggX20gKT9cblx0XHRcdGlmIGFkZGVkIGFuZCBub3QgdG9BZGRcblx0XHRcdFx0QHJlbW92ZSggX20gKVxuXHRcdFx0ZWxzZSBpZiBub3QgYWRkZWQgYW5kIHRvQWRkXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIGFkZCBtb2RlbCB0byBiYXNlIGNvbGxlY3Rpb24gb24gYWRkIHRvIHN1YlxuXHRcdF9zdWIub24gXCJhZGRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gc3ViIGNvbGxlY3Rpb24gb24gYWRkIHRvIGJhc2UgaWYgaXQgbWF0Y2hlcyB0aGUgZmlsdGVyXG5cdFx0QG9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdGlmIEBfZm5GaWx0ZXIoIF9tIClcblx0XHRcdFx0QGFkZCggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgcmVtb3ZlIG1vZGVsIGZyb20gYmFzZSBjb2xsZWN0aW9uIG9uIHJlbW92ZSBvZiBzdWJcblx0XHRfc3ViLm9uIFwicmVtb3ZlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdCNAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIEApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0QG9uIFwicmVtb3ZlXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0QG9uIFwicmVzZXRcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0QHVwZGF0ZVN1YkZpbHRlcigpXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBzdG9yZSB0aGUgc3ViY29sbGVjdGlvbiB1bmRlciB0aGUgY3VycmVudCBjb2xsZWN0aW9uXG5cdFx0QHN1YkNvbGxzLnB1c2goIF9zdWIgKVxuXG5cdFx0cmV0dXJuIF9zdWJcblxuXHQjIyNcblx0IyMgdXBkYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi51cGRhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0TWV0aG9kIHRvIHVwZGF0ZSB0aGUgZmlsdGVyIG9mIGEgc3ViY29sbGVjdGlvbi4gVGhlbiBhbGwgbW9kZWxzIHdpbGwgYmUgcmVzZXRlIGJ5IHRoZSBuZXcgZmlsdGVyLiBTbyB5b3UgaGF2ZSB0byBsaXN0ZW4gdG8gdGVoIHJlc2V0IGV2ZW50XG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IFNlbGYgfSBpdHNlbGZcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHR1cGRhdGVTdWJGaWx0ZXI6ICggZmlsdGVyLCBhc1Jlc2V0ID0gdHJ1ZSApPT5cblx0XHRpZiBAX3BhcmVudENvbD9cblxuXHRcdFx0IyBzZXQgdGhlIG5ldyBmaWx0ZXIgbWV0aG9kXG5cdFx0XHRAX2ZuRmlsdGVyID0gQF9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyICkgaWYgZmlsdGVyP1xuXG5cdFx0XHRfbW9kZWxzID0gQF9wYXJlbnRDb2wuZmlsdGVyKCBAX2ZuRmlsdGVyIClcblxuXHRcdFx0IyByZXNldCB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBuZXcgbW9kZWxzXG5cdFx0XHRpZiBhc1Jlc2V0XG5cdFx0XHRcdEByZXNldCggX21vZGVscyApXG5cdFx0XHRcdHJldHVybiBAXG5cblx0XHRcdG5ld2lkcyA9IF8ucGx1Y2soIF9tb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Y3VycmlkcyA9IF8ucGx1Y2soIEBtb2RlbHMsIFwiY2lkXCIgKVxuXHRcdFx0Zm9yIHJpZCBpbiBfLmRpZmZlcmVuY2UoIGN1cnJpZHMsIG5ld2lkcyApXG5cdFx0XHRcdEByZW1vdmUoIHJpZCApXG5cdFx0XHRcdFxuXHRcdFx0X2FkZElkcyA9IF8uZGlmZmVyZW5jZSggbmV3aWRzLCBjdXJyaWRzIClcblx0XHRcdGZvciBtZGwgaW4gX21vZGVscyB3aGVuIG1kbC5jaWQgaW4gX2FkZElkc1xuXHRcdFx0XHRAYWRkKCBtZGwgKVxuXG5cdFx0cmV0dXJuIEBcblxuXG5cdCMjI1xuXHQjIyBfZ2VuZXJhdGVTdWJGaWx0ZXJcblx0XG5cdGBjb2xsZWN0aW9uLl9nZW5lcmF0ZVN1YkZpbHRlciggZmlsdGVyIClgXG5cdFxuXHRJbnRlcm5hbCBtZXRob2QgdGggY29udmVydCBhIGZpbHRlciBhcmd1bWVudCB0byBhIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBGdW5jdGlvbiB9IFRoZSBnZW5lcmF0ZWQgZmlsdGVyIGZ1bmN0aW9uXG5cdFxuXHRAYXBpIHByaXZhdGVcblx0IyMjXG5cdF9nZW5lcmF0ZVN1YkZpbHRlcjogKCBmaWx0ZXIgKS0+XG5cdFx0IyBjb25zdHJ1Y3QgdGhlIGZpbHRlciBmdW5jdGlvblxuXHRcdGlmIF8uaXNGdW5jdGlvbiggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gZmlsdGVyXG5cdFx0ZWxzZSBpZiBfLmlzQXJyYXkoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGluIGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc1N0cmluZyggZmlsdGVyICkgb3IgXy5pc051bWJlciggZmlsdGVyIClcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0X20uaWQgaXMgZmlsdGVyXG5cdFx0ZWxzZVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRmb3IgX25tLCBfdmwgb2YgZmlsdGVyXG5cdFx0XHRcdFx0aWYgX20uZ2V0KCBfbm0gKSBpc250IF92bFxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cblx0XHRyZXR1cm4gZm5GaWx0ZXJcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZVN1YlxuIiwiY2xhc3MgRmN0QXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfc3RyaW5nXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheVwiIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEFycmF5XG4iLCJjbGFzcyBGYWNldEJhc2UgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvYmFzZVwiIClcblx0XG5cdGNvbnN0cnVjdG9yOiAoIGF0dHJzLCBvcHRpb25zICktPlxuXHRcdEBtYWluID0gb3B0aW9ucy5tYWluXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGRlZmF1bHRzOiAtPlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBcIm5hbWVcIlxuXHRcdGxhYmVsOiBcIkRlc2NyaXB0aW9uXCJcblxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiIClcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwibmFtZVwiICkgKyBcIiBcIiArIEBnZXQoIFwibGFiZWxcIiApXG5cdFx0Zm91bmQgPSBfcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIGNyaXQudG9Mb3dlckNhc2UoKSApXG5cdFx0cmV0dXJuIGZvdW5kID49IDBcblxuXHRjb21wYXJhdG9yOiAoIG1kbCApLT5cblx0XHRyZXR1cm4gbWRsLmlkXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRCYXNlXG4iLCJjbGFzcyBGY3REYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvZGF0ZXJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRzOiB7fVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3REYXRlUmFuZ2VcbiIsImNsYXNzIEZjdEV2ZW50IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IG51bGxcblx0b25seUV4ZWM6IHRydWVcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblx0XHRcblx0ZXhlYzogKCApPT5cblx0XHRAbWFpbi50cmlnZ2VyKCBAZ2V0KCBcImV2ZW50XCIgKSwgQHRvSlNPTigpIClcblx0XHRyZXR1cm5cbm1vZHVsZS5leHBvcnRzID0gRmN0RXZlbnRcbiIsImNsYXNzIEZjdE51bWJlciBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXJcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdE51bWJlclxuIiwiY2xhc3MgRmN0UmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VicmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG1pbjogbnVsbFxuXHRcdFx0bWF4OiBudWxsXG5cdFx0XHRzdGVwOiAxXG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFJhbmdlXG4iLCJjbGFzcyBGY3RTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3Vic2VsZWN0XCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRpb25zOiBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFNlbGVjdFxuIiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmdcbiIsImNsYXNzIElnZ3lSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0ZGVmYXVsdHM6XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IG51bGxcblx0XHR2YWx1ZTogbnVsbFxuXG5jbGFzcyBJZ2d5UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0bW9kZWw6IElnZ3lSZXN1bHRcblx0aW5pdGlhbGl6ZTogKCBtZGxzLCBvcHRzICk9PlxuXHRcdGlmIG9wdHMubW9kaWZ5S2V5Py5sZW5ndGhcblx0XHRcdEBtb2RpZnlLZXkgPSBvcHRzLm1vZGlmeUtleVxuXHRcdHJldHVyblxuXHRwYXJzZTogKCBhdHRyLCBvcHRpb25zICk9PlxuXHRcdF9rZXkgPSBvcHRpb25zLl9mYWNldC5nZXQoIFwibW9kaWZ5S2V5XCIgKSBvciBAbW9kaWZ5S2V5IG9yIFwidmFsdWVcIlxuXHRcdF9tb2RpZnkgPSBvcHRpb25zLl9mYWNldD8uZ2V0KCBcIm1vZGlmeVwiIClcblx0XHRpZiBfbW9kaWZ5PyBhbmQgXy5pc0Z1bmN0aW9uKCBfbW9kaWZ5IClcblx0XHRcdGF0dHJbIF9rZXkgXSA9IF9tb2RpZnkoIGF0dHIudmFsdWUsIG9wdGlvbnMuX2ZhY2V0LCBhdHRyIClcblx0XHRyZXR1cm4gYXR0clxuXG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lSZXN1bHRzXG4iLCJjbGFzcyBCYXNlUmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggQGlkQXR0cmlidXRlICkgb3IgXCItXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHMiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImRhdGVyYW5nZS1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBvcGVyYXRvciwgb3BlcmF0b3JzLCB1bmRlZmluZWQsIHZhbHVlKSB7XG5pZiAoIG9wZXJhdG9ycyAmJiBvcGVyYXRvcnMubGVuZ3RoKVxue1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJvcGVyYXRvclxcXCI+PHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwib3BcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiKTtcbi8vIGl0ZXJhdGUgb3BlcmF0b3JzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wZXJhdG9ycztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgb3AsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCBvcGVyYXRvciA9PSBvcCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBvcCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5idWYucHVzaChcIjwvc2VsZWN0PjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwib3BlcmF0b3JcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yOnR5cGVvZiBvcGVyYXRvciE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3I6dW5kZWZpbmVkLFwib3BlcmF0b3JzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcnM6dHlwZW9mIG9wZXJhdG9ycyE9PVwidW5kZWZpbmVkXCI/b3BlcmF0b3JzOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJhbmdlaW5wXFxcIj5cIik7XG52YXIgX3ZhbHMgPSB2YWx1ZSA/IHZhbHVlIDogW11cbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfZnJvbVwiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzBdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtZnJvbVxcXCIvPjxzcGFuIGNsYXNzPVxcXCJzZXBhcmF0b3JcXFwiPi08L3NwYW4+PGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJfdG9cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1swXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLXRvXFxcIi8+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG47cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG11bHRpcGxlLCBvcHRpb25Hcm91cHMsIG9wdGlvbnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPHNlbGVjdFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIG11bHRpcGxlPVxcXCJtdWx0aXBsZVxcXCIgY2xhc3M9XFxcInNlbGVjdC1pbnBcXFwiPlwiKTtcbmlmICggb3B0aW9uR3JvdXBzKVxue1xuLy8gaXRlcmF0ZSBvcHRpb25Hcm91cHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9uR3JvdXBzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgZ25hbWUgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGduYW1lIDwgJCRsOyBnbmFtZSsrKSB7XG4gICAgICB2YXIgb3B0cyA9ICQkb2JqW2duYW1lXTtcblxuYnVmLnB1c2goXCI8b3B0Z3JvdXBcIiArIChqYWRlLmF0dHIoXCJsYWJlbFwiLCBnbmFtZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPjwvb3B0Z3JvdXA+XCIpO1xuLy8gaXRlcmF0ZSBvcHRzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgZ25hbWUgaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZVxue1xuLy8gaXRlcmF0ZSBvcHRpb25zXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5idWYucHVzaChcIjwvc2VsZWN0PlwiKTtcbmlmICggbXVsdGlwbGUpXG57XG5idWYucHVzaChcIjxzcGFuIGNsYXNzPVxcXCJidG4gYnRuLXhzIGJ0bi1zdWNjZXNzIHNlbGVjdC1jaGVjayBmYSBmYS1jaGVja1xcXCI+PC9zcGFuPlwiKTtcbn19LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJtdWx0aXBsZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubXVsdGlwbGU6dHlwZW9mIG11bHRpcGxlIT09XCJ1bmRlZmluZWRcIj9tdWx0aXBsZTp1bmRlZmluZWQsXCJvcHRpb25Hcm91cHNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbkdyb3Vwczp0eXBlb2Ygb3B0aW9uR3JvdXBzIT09XCJ1bmRlZmluZWRcIj9vcHRpb25Hcm91cHM6dW5kZWZpbmVkLFwib3B0aW9uc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uczp0eXBlb2Ygb3B0aW9ucyE9PVwidW5kZWZpbmVkXCI/b3B0aW9uczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzZWxlY3Rvci1pbnBcXFwiLz48dWxcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcInR5cGVsaXN0XCIsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwidHlwZWxpc3RcXFwiPjwvdWw+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHNlbGVjdGVkLCB1bmRlZmluZWQpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9kaXY+PHNwYW4gY2xhc3M9XFxcInN1YmxhYmVsXFxcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBsYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiOjwvc3Bhbj48dWwgY2xhc3M9XFxcInN1YnJlc3VsdHNcXFwiPlwiKTtcbmlmICggc2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBzZWxlY3RlZFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzZWxlY3RlZDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjxkaXYgY2xhc3M9XFxcInN1YnNlbGVjdFxcXCI+PC9kaXY+XCIpO30uY2FsbCh0aGlzLFwibGFiZWxcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxhYmVsOnR5cGVvZiBsYWJlbCE9PVwidW5kZWZpbmVkXCI/bGFiZWw6dW5kZWZpbmVkLFwic2VsZWN0ZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnNlbGVjdGVkOnR5cGVvZiBzZWxlY3RlZCE9PVwidW5kZWZpbmVkXCI/c2VsZWN0ZWQ6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuXG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcImFkZC1mYWNldC1idG4gZmEgZmEtcGx1c1xcXCI+PC9kaXY+XCIpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsIm1vZHVsZS5leHBvcnRzID1cblx0XCJMRUZUXCI6IDM3XG5cdFwiUklHSFRcIjogMzlcblx0XCJVUFwiOiAzOFxuXHRcIkRPV05cIjogNDBcblx0XCJFU0NcIjogWyAyMjksIDI3IF1cblx0XCJFTlRFUlwiOiAxM1xuXHRcIlRBQlwiOiA5XG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5TdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcblxuY2xhc3MgRmFjZXRTdWJzQmFzZSBleHRlbmRzIEJhY2tib25lLlZpZXdcblx0cmVzdWx0VGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmVzdWx0X2Jhc2UuamFkZVwiIClcblxuXHRpbml0aWFsaXplOiA9PlxuXHRcdEByZXN1bHQgPSBuZXcgU3ViUmVzdWx0cygpXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHJlbmRlclJlc3VsdDogPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEBpc09wZW4gPSB0cnVlXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVyblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5UQUIgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLlRBQlxuXHRcdFx0QF9vblRhYkFjdGlvbiggZXZudCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdGNpZDogQGNpZFxuXHRcdHZhbHVlOiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfVwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdF90bXBsID0gQHRlbXBsYXRlKCBAZ2V0VGVtcGxhdGVEYXRhKCkgKVxuXHRcdEAkZWwuaHRtbCggX3RtcGwgKVxuXHRcdEAkaW5wID0gQCRlbC5maW5kKCBAX2dldElucFNlbGVjdG9yKCkgKVxuXHRcdCQoIGRvY3VtZW50ICkub24gQF9oYXNUYWJFdmVudCgpLCBAX29uS2V5IGlmIEBfaGFzVGFiTGlzdGVuZXIoIHRydWUgKVxuXHRcdHJldHVyblxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleWRvd25cIlxuXHRcdFxuXHRfaGFzVGFiTGlzdGVuZXI6IC0+XG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdCQoIGRvY3VtZW50ICkub2ZmIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCBmYWxzZSApXG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwiY2xvc2VkXCIgKVxuXHRcdEBpc09wZW4gPSBmYWxzZVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiLCBAcmVzdWx0IClcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdHJldHVybiBAJGlucC52YWwoKVxuXG5cdGdldFNlbGVjdE1vZGVsOiAtPlxuXHRcdHJldHVybiBTdWJSZXN1bHRzLnByb3RvdHlwZS5tb2RlbFxuXG5cdF9jaGVja1NlbGVjdEVtcHR5OiAoIF92YWwgKT0+XG5cdFx0aWYgXy5pc0VtcHR5KCBfdmFsICkgYW5kIG5vdCBfLmlzTnVtYmVyKCBfdmFsICkgYW5kIG5vdCBfLmlzQm9vbGVhbiggX3ZhbCApXG5cdFx0XHRAY2xvc2UoKVxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X3ZhbCA9IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIGlmIEBfY2hlY2tTZWxlY3RFbXB0eSggX3ZhbCApXG5cdFx0QHNldCggX3ZhbCApXG5cdFx0cmV0dXJuXG5cblx0c2V0OiAoIHZhbCApPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogdmFsIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNCYXNlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0RhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9kYXRlcmFuZ2UuamFkZVwiIClcblxuXHRyZW5kZXI6ID0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRmb3JjZWREYXRlUmFuZ2VPcHRzOlxuXHRcdG9wZW5zOiBcInJpZ2h0XCJcblxuXHRldmVudHM6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHRpZiBub3QgQGRhdGVyYW5nZXBpY2tlcj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCBAZm9yY2VkRGF0ZVJhbmdlT3B0cyApXG5cdFx0XHRAJGlucC5kYXRlcmFuZ2VwaWNrZXIoIF9vcHRzLCBAX2RhdGVSZXR1cm4gKVxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlciA9IEAkaW5wLmRhdGEoIFwiZGF0ZXJhbmdlcGlja2VyXCIgKVxuXHRcdFx0QCRpbnAub24oIFwiY2FuY2VsLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdFx0QCRpbnAub24oIFwiaGlkZS5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5jb250YWluZXI/LmFkZENsYXNzKCBcImRhdGVyYW5nZS1pZ2d5XCIgKVxuXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5zaG93KClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRyZW1vdmU6ID0+XG5cdFx0QGRhdGVyYW5nZXBpY2tlcj8ucmVtb3ZlKClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblxuXHRcdF9zdGFydERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDAgXSApXG5cdFx0X2VuZERhdGUgPSBtb21lbnQoIF9yZXMudmFsdWVbIDEgXSApIGlmIF9yZXMudmFsdWVbIDEgXT9cblxuXHRcdF90aW1lID0gQG1vZGVsLmdldCggXCJvcHRzXCIgKS50aW1lUGlja2VyXG5cblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3N0YXJ0RGF0ZS5mb3JtYXQoICggaWYgX3RpbWUgdGhlbiBcIkxMTExcIiBlbHNlIFwiTExcIiApIClcblxuXHRcdGlmIF9lbmREYXRlP1xuXHRcdFx0X3MgKz0gXCIgLSBcIlxuXHRcdFx0X3MgKz0gX2VuZERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRfcyArPSBcIjwvbGk+XCJcblxuXHRcdHJldHVybiBfc1xuXHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiBmYWxzZVxuXHRcdFxuXHRfZGF0ZVJldHVybjogKCBAc3RhcnREYXRlLCBAZW5kRGF0ZSApPT5cblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ByZWRlZlZhbCA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgX3ByZWRlZlZhbD9cblx0XHRcdGlmIG5vdCBfLmlzQXJyYXkoIF9wcmVkZWZWYWwgKVxuXHRcdFx0XHRfcHJlZGVmVmFsID0gIFsgX3ByZWRlZlZhbCBdXG5cdFx0XHRbIEBzdGFydERhdGUsIEBlbmREYXRlIF0gPSBfcHJlZGVmVmFsXG5cdFx0XHRyZXR1cm4gX3ByZWRlZlZhbFxuXHRcdF9vdXQgPSBbIEBzdGFydERhdGUudmFsdWVPZigpIF1cblx0XHRfb3V0LnB1c2ggQGVuZERhdGUudmFsdWVPZigpIGlmIEBlbmREYXRlP1xuXHRcdHJldHVybiBfb3V0XG5cblx0c2VsZWN0OiA9PlxuXHRcdF9Nb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRfbW9kZWwgPSBuZXcgX01vZGVsQ29uc3QoIHZhbHVlOiBAZ2V0VmFsdWUoKSApXG5cdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic0RhdGVSYW5nZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5uZWFyZXN0ID0gKG4sIHYpLT5cblx0biA9IG4gLyB2XG5cdG4gPSBNYXRoLnJvdW5kKG4pICogdlxuXHRyZXR1cm4gblxuXHRcbnByZWNpc2lvbiA9IChuLCBkcCktPlxuXHRkcCA9IE1hdGgucG93KDEwLCBkcClcblx0biA9IG4gKiBkcFxuXHRuID0gTWF0aC5yb3VuZChuKVxuXHRuID0gbiAvIGRwXG5cdHJldHVybiBuXG5cbmNsYXNzIEZhY2V0TnVtYmVyQmFzZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBzZXROdW1iZXIgPSBfLnRocm90dGxlKCBAX3NldE51bWJlciwgMzAwLCB7bGVhZGluZzogZmFsc2UsIHRyYWlsaW5nOiBmYWxzZX0gKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9XG5cdFx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRfJGVsID0gJCggZXZudC5jdXJyZW50VGFyZ2V0IClcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92LCBfJGVsIClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSwgZWwgPSBAJGlucCApPT5cblx0XHRfdiA9IGVsLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdF92ID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRlbHNlXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdFx0QF9zZXROdW1iZXIoIF92ICsgY2hhbmdlLCBlbCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdHJldHVybiBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRfc2V0TnVtYmVyOiAoIF92LCBlbCA9IEAkaW5wICk9PlxuXHRcdGlmIGlzTmFOKCBfdiApXG5cdFx0XHQjQCRpbnAudmFsKFwiXCIpXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9jdXJyID0gZWwudmFsKClcblxuXHRcdF92ID0gQHZhbHVlQnlEZWZpbml0aW9uKCBfdilcblx0XHRpZiBfY3VyciAhPSBfdi50b1N0cmluZygpXG5cdFx0XHRlbC52YWwoIF92IClcblx0XHRyZXR1cm5cblxuXHR2YWx1ZUJ5RGVmaW5pdGlvbjogKCBfdmFsdWUgKS0+XG5cdFx0bWF4ID0gQG1vZGVsLmdldCggXCJtYXhcIiApXG5cdFx0bWluID0gQG1vZGVsLmdldCggXCJtaW5cIiApXG5cdFx0c3RlcCA9IEBtb2RlbC5nZXQoIFwic3RlcFwiIClcblx0XHRcblx0XHQjIGZpeCByZXZlcnNlZCBtaW4vbWF4IHNldHRpbmdcblx0XHRpZiBtaW4gPiBtYXhcblx0XHRcdF90bXAgPSBtaW5cblx0XHRcdG1pbiA9IG1heFxuXHRcdFx0bWF4ID0gX3RtcFxuXHRcdFxuXHRcdCMgb24gZXh4ZWRkaW5nIHRoZSBsaW1pdHMgdXNlIHRoZSBsaW1pdFxuXHRcdGlmIG1pbj8gYW5kIF92YWx1ZSA8IG1pblxuXHRcdFx0cmV0dXJuIG1pblxuXHRcdGlmIG1heD8gYW5kIF92YWx1ZSA+IG1heFxuXHRcdFx0cmV0dXJuIG1heFxuXG5cdFx0IyBzZWFyY2ggdGhlIG5lYXJlc3QgX3ZhbHVlIHRvIHRoZSBzdGVwXG5cdFx0aWYgc3RlcCBpc250IDFcblx0XHRcdF92YWx1ZSA9IG5lYXJlc3QoIF92YWx1ZSwgc3RlcCApXG5cdFx0XG5cdFx0IyBjYWxjIHRoZSBwcmVjaXNpb24gYnkgc3RlcFxuXHRcdF9wcmVjaXNpb24gPSBNYXRoLm1heCggMCwgTWF0aC5jZWlsKCBNYXRoLmxvZyggMS9zdGVwICkgLyBNYXRoLmxvZyggMTAgKSApIClcblx0XHRpZiBfcHJlY2lzaW9uID4gMFxuXHRcdFx0X3ZhbHVlID0gcHJlY2lzaW9uKCBfdmFsdWUsIF9wcmVjaXNpb24gKVxuXHRcdGVsc2Vcblx0XHRcdF92YWx1ZSA9IE1hdGgucm91bmQoIF92YWx1ZSApXG5cdFx0XHRcblx0XHRyZXR1cm4gX3ZhbHVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldE51bWJlckJhc2VcbiIsIlN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTdHJpbmdPcHRpb24gZXh0ZW5kcyBTdWJSZXN1bHRzLnByb3RvdHlwZS5tb2RlbFxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIFN0cmluZ09wdGlvbnMgZXh0ZW5kcyBTdWJSZXN1bHRzXG5cdG1vZGVsOiBTdHJpbmdPcHRpb25cblxuXG5jbGFzcyBBcnJheU9wdGlvbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIFwibmFtZVwiICkgb3IgXCItXCJcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIEFycmF5T3B0aW9ucyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEFycmF5T3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViQXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4uL3NlbGVjdG9yXCIgKVxuXHRvcHREZWZhdWx0OlxuXHRcdGxhYmVsOiBcIi1cIlxuXHRcdHZhbHVlOiBcIi1cIlxuXG5cdG11bHRpU2VsZWN0OiB0cnVlXG5cblx0b3B0Q29sbDogU3RyaW5nT3B0aW9uc1xuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0QGNvbGxlY3Rpb24gPSBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIG9wdGlvbnMubW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApIClcblx0XHRzdXBlciggb3B0aW9ucyApXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogPT5cblx0XHRfdmFscyA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgX3ZhbHM/IGFuZCBub3QgXy5pc0FycmF5KCBfdmFscyApXG5cdFx0XHRfdmFscyA9IFsgX3ZhbHMgXVxuXHRcdFx0XG5cdFx0Zm9yIF92YWwgaW4gX3ZhbHNcblx0XHRcdF9tZGwgPSBAY29sbGVjdGlvbi5nZXQoIF92YWwgKVxuXHRcdFx0aWYgbm90IF9tZGw/XG5cdFx0XHRcdF9tZGwgPSBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBfdmFsLCBjdXN0b206IHRydWUgKVxuXHRcdFx0QHNlbGVjdGVkKCBfbWRsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdHZhbHVlOiBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXHRcblx0X29uVGFiQWN0aW9uOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdHNlYXJjaENvbnRlbnQgPSBAJGlucC52YWwoKVxuXHRcdGlmIHNlYXJjaENvbnRlbnQ/Lmxlbmd0aFxuXHRcdFx0QHNlbGVjdEFjdGl2ZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0IH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdChvcHQpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gbmV3IEBvcHRDb2xsKCBfb3B0cyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YkFycmF5XG4iLCJjbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL251bWJlci5qYWRlXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0XHRAJGlucE9wLnJlbW92ZSgpXG5cdFx0XHRAJGlucE9wID0gbnVsbFxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0X29wU2VsZWN0ZWQ6ID0+XG5cdFx0QHNlbGVjdGVkT1AgPSB0cnVlXG5cdFx0QGZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRpZiBAJGlucE9wPyBhbmQgbm90IEBzZWxlY3RlZE9QXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICksIG9wZXJhdG9yOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKX0gKVxuXG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3AudmFsKClcblx0XHRlbHNlXG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyXG4iLCJjbGFzcyBGYWNldFN1YnNSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmFuZ2UuamFkZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ICggZXh0ID0gXCJfZnJvbVwiICk9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH0je2V4dH1cIlxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0cmV0dXJuIFwiPGxpPlwiICtfcmVzLnZhbHVlLmpvaW4oIFwiIC0gXCIgKSArIFwiPC9saT5cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wVG8gPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAJCggXCIucmFuZ2VpbnBcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdF9yZXQgPVxuXHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92RnJvbSA9IHN1cGVyXG5cdFx0X3YgPSBAJGlucFRvLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0X3ZUbyA9IHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdFx0cmV0dXJuIFsgX3ZGcm9tLCBfdlRvIF1cblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIF92YWw/Lmxlbmd0aCA+PSAyXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNSYW5nZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc2VsZWN0LmphZGVcIiApXG5cblx0Zm9yY2VkTW9kdWxlT3B0czp7fVxuXHQjXHRtdWx0aXBsZTogdHJ1ZVxuXG5cdGRlZmF1bHRNb2R1bGVPcHRzOlxuXHRcdCNtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxXG5cdFx0d2lkdGg6IFwiYXV0b1wiXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHt9XG5cdFx0X2V2bnRzWyBcImNsaWNrIC5zZWxlY3QtY2hlY2tcIiBdID0gXCJzZWxlY3RcIiBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBfZXZudHNcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwic2VsZWN0IyN7QGNpZH1cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0QHNlbGVjdDIub3BlbigpXG5cdFx0I2Vsc2Vcblx0XHRcdCNAJGlucC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0X2luaXRTZWxlY3QyOiA9PlxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3RcIiwgQHNlbGVjdFxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdEBzZWxlY3QyLiRlbGVtZW50LmhpZGUoKVxuXHRcdFx0JCggZG9jdW1lbnQgKS5vbiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm5cblxuXHRfc2VsMm9wZW46ICggZXZudCApLT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRyZW1vdmU6ID0+XG5cdFx0I0AkaW5wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0X2RhdGEgPSBfLmV4dGVuZCgge30sIHN1cGVyLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSwgb3B0aW9uczogQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApICkgfSApXG5cdFx0aWYgX2RhdGEudmFsdWU/IGFuZCBub3QgXy5pc0FycmF5KCBfZGF0YS52YWx1ZSApXG5cdFx0XHRfZGF0YS52YWx1ZSA9IFsgX2RhdGEudmFsdWUgXVxuXG5cdFx0aWYgX2RhdGEudmFsdWU/XG5cdFx0XHRmb3IgX3YgaW4gX2RhdGEudmFsdWUgd2hlbiBfdiBub3QgaW4gXy5wbHVjayggX2RhdGEub3B0aW9ucywgXCJ2YWx1ZVwiIClcblx0XHRcdFx0X2RhdGEub3B0aW9ucy5wdXNoIHsgdmFsdWU6IF92LCBsYWJlbDogX3YsIGdyb3VwOiBudWxsIH1cblx0XHRcblx0XHRfZ3JvdXBzID0gXy5ncm91cEJ5KCBfZGF0YS5vcHRpb25zLCBcImdyb3VwXCIgKVxuXHRcdGlmIF8uY29tcGFjdCggXy5rZXlzKCBfZ3JvdXBzIG9yIHt9ICkgKS5sZW5ndGggPiAxXG5cdFx0XHRfZGF0YS5vcHRpb25Hcm91cHMgPSBfZ3JvdXBzXG5cdFx0cmV0dXJuIF9kYXRhXG5cdFxuXHRfaGFzVGFiTGlzdGVuZXI6ICggY3JlYXRlICk9PlxuXHRcdGlmIGNyZWF0ZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIEBtb2RlbC5nZXQoXCJtdWx0aXBsZVwiKVxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleXVwXCJcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ZhbHMgPSBbXVxuXHRcdGZvciBkYXRhIGluIEBzZWxlY3QyPy5kYXRhKCkgb3IgW11cblx0XHRcdF9kYXRhID0ge31cblx0XHRcdF9kYXRhLnZhbHVlID0gZGF0YS5pZFxuXHRcdFx0X2RhdGEubGFiZWwgPSBkYXRhLnRleHQgaWYgZGF0YS50ZXh0P1xuXHRcdFx0X3ZhbHMucHVzaCggX2RhdGEgKVxuXHRcdHJldHVybiBfdmFsc1xuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0cmV0dXJuIG9wdGlvbnMoIEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiApXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cblx0XHRyZXR1cm4gX29wdHNcblxuXHR1bnNlbGVjdDogKCBldm50ICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdEBzZWxlY3QyPy5kZXN0cm95KClcblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRAJCggXCIuc2VsZWN0LWNoZWNrXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfdmFscyA9IEBnZXRWYWx1ZSgpXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRNb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRmb3IgX3ZhbCBpbiBfdmFsc1xuXHRcdFx0QHJlc3VsdC5hZGQoIG5ldyBNb2RlbENvbnN0KCBfdmFsICkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEByZXN1bHQgKVxuXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNTZWxlY3RcbiIsImNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3N0cmluZy5qYWRlXCIgKVxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRzdXBlclxuXHRcdHRyeVxuXHRcdFx0QCRpbnA/LnJlbW92ZSgpXG5cdFx0cmV0dXJuXG5cdFx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZ1xuIiwiU3ViVmlldyA9IHJlcXVpcmUoIFwiLi9zdWJcIiApXG5TZWxlY3RvclZpZXcgPSByZXF1aXJlKCBcIi4vc2VsZWN0b3JcIiApXG5cbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgTWFpblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3dyYXBwZXIuamFkZVwiIClcblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAuYWRkLWZhY2V0LWJ0blwiOiBcIl9hZGRGYWNldFwiXG5cdFx0XCJjbGlja1wiOiBcIl9hZGRGYWNldFwiXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdFxuXHRcdEByZXN1bHRzID0gb3B0aW9ucy5yZXN1bHRzXG5cblx0XHRAY29sbGVjdGlvbi5vbiBcImlnZ3k6cmVtXCIsIEByZW1GYWNldFxuXHRcdFxuXHRcdF9jbCA9IFwiaWdneSBjbGVhcmZpeFwiXG5cdFx0aWYgQGVsLmNsYXNzTmFtZT8ubGVuZ3RoXG5cdFx0XHRfY2wgPSBcIiBcIiArIF9jbFxuXHRcdEBlbC5jbGFzc05hbWUgKz0gX2NsXG5cdFx0XG5cdFx0QHJlbmRlcigpXG5cdFx0JCggZG9jdW1lbnQgKS5vbiBcImtleXVwXCIsIEBfb25LZXlcblxuXHRcdGZvciBmY3QgaW4gQGNvbGxlY3Rpb24uZmlsdGVyKCAoIGZjdCApLT5yZXR1cm4gZmN0Py5nZXQoIFwidmFsdWVcIiApPyApXG5cdFx0XHRzdWJ2aWV3ID0gQGdlblN1YiggZmN0LCBmYWxzZSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCkgKVxuXHRcdEAkYWRkQnRuID0gQCQoIFwiLmFkZC1mYWNldC1idG5cIiApXG5cdFx0cmV0dXJuXG5cblx0X2FkZEZhY2V0OiAoIGV2bnQgKT0+XG5cdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRVNDIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdEBleGl0KClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0ZXhpdDogPT5cblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0aWYgQHN1YnZpZXdcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRyZW1GYWNldDogKCBmYWNldE0gKT0+XG5cdFx0QHJlc3VsdHMucmVtb3ZlKCBmYWNldE0uZ2V0KCBcIm5hbWVcIiApIClcblx0XHRyZXR1cm5cblxuXHRzZXRGYWNldDogKCBmYWNldE0sIGRhdGEgKT0+XG5cdFx0QGNvbGxlY3Rpb24ucmVtb3ZlKCBmYWNldE0gKVxuXG5cdFx0QHJlc3VsdHMuYWRkKCBfLmV4dGVuZCggZGF0YSwgeyBuYW1lOiBmYWNldE0uZ2V0KCBcIm5hbWVcIiApLCB0eXBlOiBmYWNldE0uZ2V0KCBcInR5cGVcIiApIH0gKSwgeyBtZXJnZTogdHJ1ZSwgcGFyc2U6IHRydWUsIF9mYWNldDogZmFjZXRNIH0gKVxuXHRcdHJldHVyblxuXG5cdGdlblN1YjogKCBmYWNldE0sIGFkZEFmdGVyID0gdHJ1ZSApPT5cblx0XHRzdWJ2aWV3ID0gbmV3IFN1YlZpZXcoIG1vZGVsOiBmYWNldE0sIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdHN1YnZpZXcub2ZmKClcblx0XHRcdHN1YnZpZXcucmVtb3ZlKCkgaWYgbm90IHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBhZGRBZnRlclxuXHRcdFx0cmV0dXJuXG5cblx0XHRzdWJ2aWV3Lm9uKCBcInNlbGVjdGVkXCIsIEBzZXRGYWNldCApXG5cdFx0XG5cdFx0QCRhZGRCdG4uYmVmb3JlKCBzdWJ2aWV3LnJlbmRlcigpIClcblx0XHRyZXR1cm4gc3Vidmlld1xuXG5cdGFkZEZhY2V0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNFTEVDVCBFWElTVFwiXG5cdFx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIEBzdWJ2aWV3P1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIFNVQiBFWElTVFwiXG5cdFx0XHRAc3Vidmlldy5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAY29sbGVjdGlvbi5sZW5ndGhcblx0XHRcdCNjb25zb2xlLmxvZyBcIlNUT1AgQCBFTVBUWSBDT0xMXCJcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcgPSBuZXcgU2VsZWN0b3JWaWV3KCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgY3VzdG9tOiBmYWxzZSApXG5cblx0XHRAJGFkZEJ0bi5iZWZvcmUoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRAc2VsZWN0dmlldy5mb2N1cygpXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdHMgKT0+XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTRUxFQ1QgVklFVyBDTE9TRURcIiwgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdEBzdWJ2aWV3Lm9mZigpXG5cdFx0XHRcdEBzdWJ2aWV3LnJlbW92ZSgpXG5cdFx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggZmFjZXRNICk9PlxuXHRcdFx0ZmFjZXRNLnNldCggXCJ2YWx1ZVwiLCBudWxsIClcblx0XHRcdEBzdWJ2aWV3ID0gQGdlblN1YiggZmFjZXRNIClcblx0XHRcdEBzdWJ2aWV3Lm9wZW4oKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFpblZpZXdcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU2VsZWN0b3JWaWV3IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0cy9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zZWxlY3Rvci5qYWRlXCIgKVxuXHR0ZW1wbGF0ZUVsOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9ybGkuamFkZVwiIClcblx0bXVsdGlTZWxlY3Q6IGZhbHNlXG5cblx0Y2xhc3NOYW1lOiA9PlxuXHRcdGNscyA9IFsgXCJhZGQtZmFjZXRcIiBdXG5cdFx0aWYgQGN1c3RvbVxuXHRcdFx0Y2xzLnB1c2ggXCJjdXN0b21cIlxuXHRcdHJldHVybiBjbHMuam9pbiggXCIgXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRcIm1vdXNlZG93biBhXCI6IFwiX29uQ2xpY2tcIlxuXHRcdFwiZm9jdXMgaW5wdXQjI3tAY2lkfVwiOiBcIm9wZW5cIlxuXHRcdCNcImJsdXIgaW5wdXQjI3tAY2lkfVwiOiBcImNsb3NlXCJcblx0XHRcImtleWRvd24gaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cdFx0XCJrZXl1cCBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdEBjdXN0b20gPSAgb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBzZWFyY2hjb2xsID0gQGNvbGxlY3Rpb24uc3ViKCAtPnRydWUgKVxuXHRcdEByZXN1bHQgPSBuZXcgQGNvbGxlY3Rpb24uY29uc3RydWN0b3IoKVxuXHRcdFxuXHRcdCNAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXHRcdFx0X2Nzc2NsYXNzID0gbW9kZWwuZ2V0KCBcImNzc2NsYXNzXCIgKVxuXHRcdFx0aWYgQGN1cnJRdWVyeT8ubGVuZ3RoID4gMVxuXHRcdFx0XHRfbGJsID0gX2xibC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBAY3VyclF1ZXJ5LCBcImdpXCIgKSwgKCggc3RyICktPnJldHVybiBcIjxiPiN7c3RyfTwvYj5cIiApIClcblx0XHRcdF9saXN0LnB1c2ggbGFiZWw6IF9sYmwsIGlkOiBfaWQsIGNzc2NsYXNzOiBfY3NzY2xhc3Ncblx0XHRAJGxpc3QuYXBwZW5kKCBAdGVtcGxhdGVFbCggbGlzdDogX2xpc3QsIHF1ZXJ5OiBAY3VyclF1ZXJ5LCBhY3RpdmVJZHg6IEBhY3RpdmVJZHgsIGN1c3RvbTogQGN1c3RvbSApIClcblxuXHRcdEBfY2hlY2tTY3JvbGwoKVxuXHRcdFxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRfc2Nyb2xsVGlsbDogMTk4XG5cdF9jaGVja1Njcm9sbDogPT5cblx0XHRfaGVpZ2h0ID0gQCRsaXN0LmhlaWdodCgpXG5cdFx0aWYgX2hlaWdodCA+IDBcblx0XHRcdEBzY3JvbGxIZWxwZXIoIF9oZWlnaHQgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGV4aXQgdGhlIHRoZSBjYWxsIHN0YWNrIHRvIGNoZWNrIGhlaWdodCBhZnRlciB0aGUgbW9kdWxlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBkb21cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHNjcm9sbEhlbHBlciggQCRsaXN0LmhlaWdodCgpIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXG5cdHNjcm9sbEhlbHBlcjogKCBoZWlnaHQgKT0+XG5cdFx0aWYgaGVpZ2h0ID49IEBfc2Nyb2xsVGlsbFxuXHRcdFx0QHNjcm9sbGluZyA9IHRydWVcblx0XHRlbHNlXG5cdFx0XHRAc2Nyb2xsaW5nID0gZmFsc2Vcblx0XHRyZXR1cm5cblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0aWYgbm90IF9pZD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX2lkIClcblx0XHRpZiBub3QgX21kbD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0QHNlbGVjdGVkKCBfbWRsIClcblx0XHRpZiBub3QgQG11bHRpU2VsZWN0XG5cdFx0XHRAY2xvc2UoKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHNlbGVjdGVkOiAoIG1kbCApPT5cblx0XHR0cnlcblx0XHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdFx0bWRsPy5leGVjPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdGNhdGNoIF9lcnJcblx0XHRcdHRyeVxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBhY3RpdmVJZHg6I3tAYWN0aXZlSWR4fSAtIGNvbGxlY3Rpb246I3tKU09OLnN0cmluZ2lmeSggQGNvbGxlY3Rpb24udG9KU09OKCkpfVwiXG5cdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIXCJcblx0XHRcblx0XHRpZiBtZGw/XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIG1kbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QG1vdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAbW92ZSggZmFsc2UgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdEFjdGl2ZSggdHJ1ZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9xID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKClcblx0XHRpZiBfcSBpcyBAY3VyclF1ZXJ5XG5cdFx0XHRyZXR1cm5cblxuXHRcdEBjdXJyUXVlcnkgPSBfcVxuXG5cdFx0QHNlYXJjaGNvbGwudXBkYXRlU3ViRmlsdGVyKCAoIG1kbCApPT5cblx0XHRcdGlmIEByZXN1bHQuZ2V0KCBtZGwuaWQgKT9cblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBub3QgX3E/Lmxlbmd0aFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0X21hdGNoID0gbWRsLm1hdGNoKCBfcSApXG5cdFx0XHRyZXR1cm4gX21hdGNoXG5cdFx0LCBmYWxzZSApXG5cblxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuXG5cblx0bW92ZTogKCB1cCA9IGZhbHNlICk9PlxuXHRcdF9saXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhXCIgKVxuXHRcblx0XHRfY3VzdG9tRWxlbWVudENoYW5nZSA9IGlmIEBjdXJyUXVlcnk/Lmxlbmd0aCB0aGVuIDAgZWxzZSAxXG5cdFx0X3RvcCA9IDBcblx0XHRpZiB1cFxuXHRcdFx0aWYgKCBAYWN0aXZlSWR4IC0gMSApIDwgX3RvcFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4IC0gMVxuXHRcdGVsc2Vcblx0XHRcdGlmIEBzZWFyY2hjb2xsLmxlbmd0aCAtIF9jdXN0b21FbGVtZW50Q2hhbmdlIDw9IEBhY3RpdmVJZHhcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRfbmV3aWR4ID0gQGFjdGl2ZUlkeCArIDFcblxuXHRcdFxuXHRcdEAkKCBfbGlzdFsgQGFjdGl2ZUlkeCBdICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXHRcdF8kZWxuZXcgPSBAJCggX2xpc3RbIF9uZXdpZHggXSApLmFkZENsYXNzKCBcImFjdGl2ZVwiIClcblxuXHRcdGlmIEBzY3JvbGxpbmdcblx0XHRcdF9lbEggPSBfJGVsbmV3Lm91dGVySGVpZ2h0KClcblx0XHRcdF9wb3MgPSBfZWxIICogKCBfbmV3aWR4ICsgMSApXG5cdFx0XHRfJGxpc3QgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0XCIgKVxuXHRcdFx0X3Njcm9sbFQgPSBfJGxpc3Quc2Nyb2xsVG9wKClcblx0XHRcdGlmIF9wb3MgPiBfc2Nyb2xsVCArIEBfc2Nyb2xsVGlsbFxuXHRcdFx0XHRfJGxpc3Quc2Nyb2xsVG9wKCBfcG9zIC0gQF9zY3JvbGxUaWxsIClcblx0XHRcdGVsc2UgaWYgX3BvcyA8IF9zY3JvbGxUICsgX2VsSFxuXHRcdFx0XHRfJGxpc3Quc2Nyb2xsVG9wKCBfcG9zIC0gX2VsSCApXG5cblx0XHRAYWN0aXZlSWR4ID0gX25ld2lkeFxuXHRcdHJldHVyblxuXG5cdHNlbGVjdDo9PlxuXHRcdHJldHVyblxuXG5cdHNlbGVjdEFjdGl2ZTogKCBpc0VudGVyRXZlbnQ9ZmFsc2UgKT0+XG5cdFx0XG5cdFx0X3NlbCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYS5hY3RpdmVcIiApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiICkuZGF0YSgpXG5cdFx0XHRcblx0XHRfc2VhcmNoID0gQCRpbnAudmFsKClcblx0XHRcblx0XHRpZiAgbm90IF9zZWw/IGFuZCBAbXVsdGlTZWxlY3QgYW5kIGlzRW50ZXJFdmVudCBhbmQgbm90IF9zZWFyY2g/Lmxlbmd0aFxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IF9zZWw/XG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdGlmIF9zZWw/LmlkeCA+PSAwIGFuZCBAc2VhcmNoY29sbC5sZW5ndGhcblx0XHRcdGNvbnNvbGUubG9nIFwiZ290XCIsIEBjb2xsZWN0aW9uLmdldCggX3NlbC5pZCApLCBAY29sbGVjdGlvbiwgX3NlbC5pZFxuXHRcdFx0QHNlbGVjdGVkKCBAY29sbGVjdGlvbi5nZXQoIF9zZWwuaWQgKSApXG5cdFx0ZWxzZSBpZiBAY3VyclF1ZXJ5Py5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogQGN1cnJRdWVyeSwgY3VzdG9tOiB0cnVlICkgKVxuXHRcdFx0QCRpbnAudmFsKCBcIlwiIClcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm5cblxuXHRcdGlmIG5vdCBAbXVsdGlTZWxlY3Rcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3XG4iLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiBcInN1YlwiXG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czpcblx0XHRcImNsaWNrIC5ybS1mYWNldC1idG5cIjogXCJkZWxcIlxuXG5cdHJlbmRlcjogKCBvcHRNZGwgKT0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHR0cnlcblx0XHRcdFx0X2xpc3QucHVzaCBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRjYXRjaCBfZXJyXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjQ6IENBVENIIC0gQ2xhc3M6I3sgQGNvbnN0cnVjdG9yLm5hbWUgfSAtIG1vZGVsOiN7SlNPTi5zdHJpbmdpZnkoQG1vZGVsLnRvSlNPTigpKX0gLSByZXN1bHQ6I3tKU09OLnN0cmluZ2lmeSggQHJlc3VsdC50b0pTT04oKSl9XCJcblx0XHRcdFx0Y2F0Y2ggX2VycmVyclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjQ6IENBVENIXCJcblx0XHRcblx0XHRAJGVsLmh0bWwgQHRlbXBsYXRlKCBsYWJlbDogQG1vZGVsLmdldExhYmVsKCksIHNlbGVjdGVkOiBfbGlzdCApXG5cdFx0QCRzdWIgPSBAJCggXCIuc3Vic2VsZWN0XCIgKVxuXHRcdEAkcmVzdWx0cyA9IEAkKCBcIi5zdWJyZXN1bHRzXCIgKVxuXG5cdFx0QGdlbmVyYXRlU3ViKClcblx0XHRyZXR1cm4gQGVsXG5cblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdEBjb2xsZWN0aW9uLnRyaWdnZXIoIFwiaWdneTpyZW1cIiwgQG1vZGVsIClcblx0XHRAY29sbGVjdGlvbi5hZGQoIEBtb2RlbCApXG5cdFx0QHJlbW92ZSgpXG5cdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIgKVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdHJlbW92ZTogPT5cblx0XHRAc2VsZWN0dmlldz8ucmVtb3ZlKClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRzZWxlY3RlZDogKCBvcHRNZGwgKT0+XG5cdFx0QHJlc3VsdC5hZGQoIG9wdE1kbCApXG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBAbW9kZWwsIEBzZWxlY3R2aWV3LmdldFJlc3VsdHMoKSApXG5cdFx0cmV0dXJuXG5cblx0aXNPcGVuOiA9PlxuXHRcdHJldHVybiBAc2VsZWN0dmlldz9cblxuXHRmb2N1czogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0XHRyZXR1cm5cblx0XHRAb3BlbigpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8uY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cblx0Z2VuZXJhdGVTdWI6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRyZXR1cm4gQHNlbGVjdHZpZXdcblx0XHRcdFxuXHRcdEBzZWxlY3R2aWV3ID0gbmV3IEBtb2RlbC5TdWJWaWV3KCBtb2RlbDogQG1vZGVsLCBlbDogQCRzdWIgKVxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0ICk9PlxuXHRcdFx0QHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgcmVzdWx0IClcblx0XHRcdEByZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggbWRsICk9PlxuXHRcdFx0aWYgbWRsXG5cdFx0XHRcdEBzZWxlY3RlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0QCRlbC5hcHBlbmQoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRpZiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiICk/XG5cdFx0XHRAc2VsZWN0dmlldy5zZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cdG9wZW46ID0+XG5cdFx0QGdlbmVyYXRlU3ViKClcblxuXHRcdEBzZWxlY3R2aWV3Py5mb2N1cygpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1N1YlxuIixudWxsLCIoZnVuY3Rpb24oZil7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZigpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGYpfWVsc2V7dmFyIGc7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe2c9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe2c9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtnPXNlbGZ9ZWxzZXtnPXRoaXN9Zy5qYWRlID0gZigpfX0pKGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIGF0dHJzID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGF0dHJzID0gbWVyZ2UoYXR0cnMsIGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcbiAgdmFyIGJjID0gYlsnY2xhc3MnXTtcblxuICBpZiAoYWMgfHwgYmMpIHtcbiAgICBhYyA9IGFjIHx8IFtdO1xuICAgIGJjID0gYmMgfHwgW107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShiYykpIGJjID0gW2JjXTtcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xuICB9XG5cbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbnVsbHModmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xufVxuXG4vKipcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmpvaW5DbGFzc2VzID0gam9pbkNsYXNzZXM7XG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKSA6XG4gICAgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JykgPyBPYmplY3Qua2V5cyh2YWwpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB2YWxba2V5XTsgfSkgOlxuICAgIFt2YWxdKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xuICB2YXIgYnVmID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufTtcblxuXG5leHBvcnRzLnN0eWxlID0gZnVuY3Rpb24gKHZhbCkge1xuICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbCkubWFwKGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgcmV0dXJuIHN0eWxlICsgJzonICsgdmFsW3N0eWxlXTtcbiAgICB9KS5qb2luKCc7Jyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XG4gIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICB2YWwgPSBleHBvcnRzLnN0eWxlKHZhbCk7XG4gIH1cbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodmFsKS5pbmRleE9mKCcmJykgIT09IC0xKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1NpbmNlIEphZGUgMi4wLjAsIGFtcGVyc2FuZHMgKGAmYCkgaW4gZGF0YSBhdHRyaWJ1dGVzICcgK1xuICAgICAgICAgICAgICAgICAgICd3aWxsIGJlIGVzY2FwZWQgdG8gYCZhbXA7YCcpO1xuICAgIH07XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBlbGltaW5hdGUgdGhlIGRvdWJsZSBxdW90ZXMgYXJvdW5kIGRhdGVzIGluICcgK1xuICAgICAgICAgICAgICAgICAgICdJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIHN0cmluZ2lmeSBkYXRlcyBpbiBJU08gZm9ybSBhZnRlciAyLjAuMCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYnVmID0gW107XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG4gIGlmIChrZXlzLmxlbmd0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBqYWRlX2VuY29kZV9odG1sX3J1bGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90Oydcbn07XG52YXIgamFkZV9tYXRjaF9odG1sID0gL1smPD5cIl0vZztcblxuZnVuY3Rpb24gamFkZV9lbmNvZGVfY2hhcihjKSB7XG4gIHJldHVybiBqYWRlX2VuY29kZV9odG1sX3J1bGVzW2NdIHx8IGM7XG59XG5cbmV4cG9ydHMuZXNjYXBlID0gamFkZV9lc2NhcGU7XG5mdW5jdGlvbiBqYWRlX2VzY2FwZShodG1sKXtcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKS5yZXBsYWNlKGphZGVfbWF0Y2hfaHRtbCwgamFkZV9lbmNvZGVfY2hhcik7XG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0aHJvdyhlcnIsIG51bGwsIGxpbmVubylcbiAgfVxuICB2YXIgY29udGV4dCA9IDNcbiAgICAsIGxpbmVzID0gc3RyLnNwbGl0KCdcXG4nKVxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcblxuICAvLyBFcnJvciBjb250ZXh0XG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xuICAgIHZhciBjdXJyID0gaSArIHN0YXJ0ICsgMTtcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxuICAgICAgKyBjdXJyXG4gICAgICArICd8ICdcbiAgICAgICsgbGluZTtcbiAgfSkuam9pbignXFxuJyk7XG5cbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcbiAgZXJyLm1lc3NhZ2UgPSAoZmlsZW5hbWUgfHwgJ0phZGUnKSArICc6JyArIGxpbmVub1xuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcbiAgdGhyb3cgZXJyO1xufTtcblxuZXhwb3J0cy5EZWJ1Z0l0ZW0gPSBmdW5jdGlvbiBEZWJ1Z0l0ZW0obGluZW5vLCBmaWxlbmFtZSkge1xuICB0aGlzLmxpbmVubyA9IGxpbmVubztcbiAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xufVxuXG59LHtcImZzXCI6Mn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XX0se30sWzFdKSgxKVxufSk7Il19
