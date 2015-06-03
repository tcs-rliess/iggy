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
    evnt.preventDefault();
    evnt.stopPropagation();
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

  MainView.prototype.className = "iggy clearfix";

  MainView.prototype.events = {
    "click .add-facet-btn": "_addFacet",
    "click": "_addFacet"
  };

  MainView.prototype.initialize = function(options) {
    var fct, i, len, ref, subview;
    this.results = options.results;
    this.collection.on("iggy:rem", this.remFacet);
    this.el.className += this.className;
    this.render();
    $(document).on("keyup", this._onKey);
    ref = this.collection.filter(function(fct) {
      return (fct != null ? fct.get("value") : void 0) != null;
    });
    for (i = 0, len = ref.length; i < len; i++) {
      fct = ref[i];
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
      console.log("model", _cssclass);
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
    var _id;
    evnt.stopPropagation();
    evnt.preventDefault();
    _id = this.$(evnt.currentTarget).data("id");
    this.selected(this.collection.get(_id));
    if (!this.multiSelect) {
      this.close();
    }
    return false;
  };

  SelectorView.prototype.selected = function(mdl) {
    if (mdl.onlyExec != null) {
      if (mdl != null) {
        if (typeof mdl.exec === "function") {
          mdl.exec();
        }
      }
      return;
    }
    this.searchcoll.remove(mdl);
    this.result.add(mdl);
    this.trigger("selected", mdl);
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
          this.selectActive();
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
    var _$elnew, _$list, _elH, _list, _newidx, _pos, _scrollT, _top;
    if (up == null) {
      up = false;
    }
    _list = this.$el.find(".typelist a");
    _top = 0;
    if (up) {
      if ((this.activeIdx - 1) < _top) {
        return;
      }
      _newidx = this.activeIdx - 1;
    } else {
      if (this.searchcoll.length - 1 <= this.activeIdx) {
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

  SelectorView.prototype.selectActive = function() {
    var _sel, ref;
    _sel = this.$el.find(".typelist a.active").removeClass("active").data();
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
    var _list, i, idx, len, model, ref;
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _list.push(model.getLabel());
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

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9iYWNrYm9uZV9zdWIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9iYXNlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9kYXRlcmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9udW1iZXIuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3JhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvbW9kZWxzL2ZhY2V0X3N0cmluZy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvcmVzdWx0cy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy9tb2RlbHMvc3VicmVzdWx0cy5jb2ZmZWUiLCJfc3JjL2pzL3RtcGxzL2RhdGVyYW5nZS5qYWRlIiwiX3NyYy9qcy90bXBscy9udW1iZXIuamFkZSIsIl9zcmMvanMvdG1wbHMvcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvcmVzdWx0X2Jhc2UuamFkZSIsIl9zcmMvanMvdG1wbHMvc2VsZWN0LmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdG9yLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdG9ybGkuamFkZSIsIl9zcmMvanMvdG1wbHMvc3RyaW5nLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N1Yi5qYWRlIiwiX3NyYy9qcy90bXBscy93cmFwcGVyLmphZGUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvZGF0ZXJhbmdlLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3ViYXJyYXkuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1Ym51bWJlci5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3MvZmFjZXRzL3N1YnNlbGVjdC5jb2ZmZWUiLCIvVXNlcnMvbWF0aGlhc3BldGVyL1Byb2pla3RlL2lnZ3kvX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic3RyaW5nLmNvZmZlZSIsIi9Vc2Vycy9tYXRoaWFzcGV0ZXIvUHJvamVrdGUvaWdneS9fc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL21hdGhpYXNwZXRlci9Qcm9qZWt0ZS9pZ2d5L19zcmMvanMvdmlld3Mvc3ViLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvamFkZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSw0R0FBQTtFQUFBOzs7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUyxjQUFUOztBQUNYLE1BQUEsR0FBUyxPQUFBLENBQVMsdUJBQVQ7O0FBQ1QsU0FBQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVDs7QUFDWixRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osU0FBQSxHQUFZLE9BQUEsQ0FBUyx1QkFBVDs7QUFDWixRQUFBLEdBQVcsT0FBQSxDQUFTLHNCQUFUOztBQUNYLFlBQUEsR0FBZSxPQUFBLENBQVMsMEJBQVQ7O0FBQ2YsUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxPQUFBLEdBQVUsT0FBQSxDQUFTLGtCQUFUOztBQUVKOzs7aUJBQ0wsQ0FBQSxHQUFHOztFQUNVLGNBQUUsRUFBRixFQUFNLE1BQU4sRUFBbUIsT0FBbkI7O01BQU0sU0FBUzs7O01BQUksVUFBVTs7Ozs7Ozs7O0lBQ3pDLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxF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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdFNlbGVjdCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc2VsZWN0XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3RSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfcmFuZ2VcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcbkZjdEV2ZW50ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9ldmVudFwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKCBudWxsLCBvcHRpb25zIClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0QHZpZXcgPSBuZXcgTWFpblZpZXcoIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cyApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQgaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X3JldC5wdXNoIF9mY3RcblxuXHRcdHJldHVybiBuZXcgRmFjZXRzKCBfcmV0IClcblxuXHRfY3JlYXRlRmFjZXQ6ICggZmFjZXQgKS0+XG5cdFx0c3dpdGNoIGZhY2V0LnR5cGUudG9Mb3dlckNhc2UoKVxuXHRcdFx0d2hlbiBcInN0cmluZ1wiIHRoZW4gcmV0dXJuIG5ldyBGY3RTdHJpbmcoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJzZWxlY3RcIiB0aGVuIHJldHVybiBuZXcgRmN0U2VsZWN0KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiYXJyYXlcIiB0aGVuIHJldHVybiBuZXcgRmN0QXJyYXkoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJudW1iZXJcIiB0aGVuIHJldHVybiBuZXcgRmN0TnVtYmVyKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwicmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0UmFuZ2UoIGZhY2V0LCBtYWluOiBAIClcblx0XHRcdHdoZW4gXCJkYXRlcmFuZ2VcIiB0aGVuIHJldHVybiBuZXcgRmN0RGF0ZVJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZXZlbnRcIiB0aGVuIHJldHVybiBuZXcgRmN0RXZlbnQoIGZhY2V0LCBtYWluOiBAIClcblxuXHRhZGRGYWNldDogKCBmYWNldCApPT5cblx0XHRpZiBub3QgQGZhY2V0cz9cblx0XHRcdHJldHVyblxuXHRcdGlmICggX2ZjdCA9IEBfY3JlYXRlRmFjZXQoIGZhY2V0ICkgKT9cblx0XHRcdEBmYWNldHMuYWRkKCBfZmN0IClcblx0XHRyZXR1cm4gQFxuXG5cdF9lcnJvcjogKCB0eXBlLCBkYXRhID0ge30gKT0+XG5cdFx0aWYgQGVycm9yc1sgdHlwZSBdP1xuXHRcdFx0X21zZyA9IEBlcnJvcnNbIHR5cGUgXSggZGF0YSApXG5cdFx0ZWxzZVxuXHRcdFx0X21zZyA9IFwiLVwiXG5cdFx0X2VyciA9IG5ldyBFcnJvcigpXG5cdFx0X2Vyci5uYW1lID0gdHlwZVxuXHRcdF9lcnIubWVzc2FnZSA9IF9tc2dcblx0XHRyZXR1cm4gX2VyclxuXG5cdGdldFF1ZXJ5OiA9PlxuXHRcdHJldHVybiBAcmVzdWx0c1xuXG5cdHRyaWdnZXJDaGFuZ2U6ID0+XG5cdFx0QHRyaWdnZXIoIFwiY2hhbmdlXCIsIEByZXN1bHRzIClcblx0XHRyZXR1cm5cblxuXHRfaW5pdEVycm9yczogPT5cblx0XHRAZXJyb3JzID0ge31cblx0XHRmb3IgX2ssIF90bXBsIG9mIEBFUlJPUlMoKVxuXHRcdFx0QGVycm9yc1sgX2sgXSA9IF8udGVtcGxhdGUoIF90bXBsIClcblx0XHRyZXR1cm5cblxuXHRFUlJPUlM6IC0+XG5cdFx0XCJFSU5WQUxJREVMU1RSSU5HXCI6IFwiSWYgeW91IGRlZmluZSBhIGBlbGAgYXMgU3RyaW5nIGl0IGhhcyB0byBiZSBhIHZhbGlkIHNlbGVjdG9yIGZvciBhbiBleGlzdGluZyBET00gZWxlbWVudC5cIlxuXHRcdFwiRUVNUFRZRUxTVFJJTkdcIjogXCJUaGUgYGVsYCBhcyBzdHJpbmcgY2FuIG5vdCBiZSBlbXB0eS5cIlxuXHRcdFwiRUVNUFRZRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYW4gZW1wdHkgY29sbGVjdGlvbi5cIlxuXHRcdFwiRVNJWkVFTEpRVUVSWVwiOiBcIlRoZSBgZWxgIGFzIGpPdWVyeSBvYmplY3QgY2FuIG5vdCBiZSBhIHJlc3VsdCBvZiBvbmUgZWwuXCJcblx0XHRcIkVJTlZBTElERUxUWVBFXCI6IFwiVGhlIGBlbGAgY2FuIG9ubHkgYmUgYSBzZWxlY3RvciBzdHJpbmcsIGRvbSBlbGVtZW50IG9yIGpRdWVyeSBjb2xsZWN0aW9uXCJcblx0XHRcIkVNSVNTSU5HRUxcIjogXCJQbGVhc2UgZGVmaW5lIGEgdGFyZ2V0IGBlbGBcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IElHR1lcbiIsIiMjI1xuRVhBTVBMRSBVU0FHRVxuXG5cdHBhcmVudENvbGwgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbi5TdWIoKVxuXHRcblx0IyBieSBBcnJheVxuXHRzdWJDb2xsQSA9IHBhcmVudENvbGwuc3ViKCBbIDEsIDIsIDMgXSApXG5cdFxuXHQjIG9yIGJ5IE9iamVjdFxuXHRzdWJDb2xsTyA9IHBhcmVudENvbGwuc3ViKCB7IG5hbWU6IFwiRm9vXCIsIGFnZTogNDIgfSApXG5cdFxuXHQjIG9yIGJ5IE51bWJlclxuXHRzdWJDb2xsTiA9IHBhcmVudENvbGwuc3ViKCAxMyApXG5cdFxuXHQjIG9yIGJ5IEZ1bmN0aW9uXG5cdHN1YkNvbGxGID0gcGFyZW50Q29sbC5zdWIoICgoIG1vZGVsICktPiBpZiBtb2RlbC5nZXQoIFwiYWdlXCIgKSA+IDIzICkgKVxuXHRcblx0IyBzdWJjb2xsZWN0aW9uIG9mIHN1YmNvbGxlY3Rpb25cblx0c3ViQ29sbEFfTyA9IHN1YkNvbGxBLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIEZvciB0aGlzIGEgYHJlc2V0YCB3aWxsIGJlIGZpcmVkIG9uIHRoZSBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBID0gc3ViQ29sbEEudXBkYXRlU3ViRmlsdGVyKCB7IG5hbWU6IFwiQmFyXCIsIGFnZTogNDIgfSApXG4jIyNcblxuY2xhc3MgQmFja2JvbmVTdWIgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdCMjI1xuXHQjIyBzdWJcblx0XG5cdGBjb2xsZWN0aW9uLnN1YiggZmlsdGVyIClgXG5cdFxuXHRHZW5lcmF0ZSBhIHN1Yi1jb2xsZWN0aW9uIGJ5IGEgZmlsdGVyLlxuXHRUaGUgbW9kZWxzIHdpbGwgYmUgZGlzdHJpYnV0ZWQgd2l0aGluIGFsbCBpbnZvbHZlZCBjb2xsZWN0aW9ucyB1bmRlciBjb25zaWRlcmF0aW9uIG9mIHRoZSBmaWx0ZXIuXG5cdFxuXHRAcGFyYW0geyBGdW5jdGlvbnxBcnJheXxTdHJpbmd8TnVtYmVyfE9iamVjdCB9IGZpbHRlciBUaGUgZmlsdGVyIHRvIHJlZHVjZSB0aGUgY3VycmVudCBjb2xsZWN0aW9uLiBDYW4gYmUgYSBmdW5jdGlvbiBsaWtlIHVuZGVyc2NvcmUgYF8uZmlsdGVyYCBvciBhbiBhcnJheSBvZiBpZHMsIGEgc2luZ2xlIGlkIGFzIHN0cmluZyBvciBudW1iZXIgb3IgYSBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5pbmdzIGtleSB2YWx1ZSBmaWx0ZXJzLlxuXHRcblx0QHJldHVybiB7IENvbGxlY3Rpb24gfSBBIFN1Yi1Db2xsZWN0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXJcblx0XG5cdEBhcGkgcHVibGljXG5cdCMjI1xuXHRzdWI6ICggZmlsdGVyICk9PlxuXHRcdEBzdWJDb2xscyBvcj0gW11cblx0XHRmbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApXG5cblx0XHQjIGZpbHRlciB0aGUgY29sbGVjdGlvblxuXHRcdF9tb2RlbHMgPSBAZmlsdGVyIGZuRmlsdGVyXG5cdFx0IyBjcmVhdGUgdGhlIHN1YmNvbGxlY3Rpb25cblx0XHRfc3ViID0gbmV3IEBjb25zdHJ1Y3RvciggX21vZGVscyApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICktPlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWJcbiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBhdHRycywgb3B0aW9ucyApLT5cblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRkZWZhdWx0czogLT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcIm5hbWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cblx0Y29tcGFyYXRvcjogKCBtZGwgKS0+XG5cdFx0cmV0dXJuIG1kbC5pZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0QmFzZVxuIiwiY2xhc3MgRmN0RGF0ZVJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2RhdGVyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0czoge31cblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0RGF0ZVJhbmdlXG4iLCJjbGFzcyBGY3RFdmVudCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiBudWxsXG5cdG9ubHlFeGVjOiB0cnVlXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XG5cdGV4ZWM6ICggKT0+XG5cdFx0QG1haW4udHJpZ2dlciggQGdldCggXCJldmVudFwiICksIEB0b0pTT04oKSApXG5cdFx0cmV0dXJuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdEV2ZW50XG4iLCJjbGFzcyBGY3ROdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3VibnVtYmVyXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3ROdW1iZXJcbiIsImNsYXNzIEZjdFJhbmdlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnJhbmdlXCIgKVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRtaW46IG51bGxcblx0XHRcdG1heDogbnVsbFxuXHRcdFx0c3RlcDogMVxuXHRcdFx0dmFsdWU6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBGY3RSYW5nZVxuIiwiY2xhc3MgRmN0U2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnNlbGVjdFwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTZWxlY3RcbiIsImNsYXNzIEZjdFN0cmluZyBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzdHJpbmdcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdGlvbnM6IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0U3RyaW5nXG4iLCJjbGFzcyBJZ2d5UmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdGRlZmF1bHRzOlxuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRuYW1lOiBudWxsXG5cdFx0dmFsdWU6IG51bGxcblxuY2xhc3MgSWdneVJlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cdG1vZGVsOiBJZ2d5UmVzdWx0XG5cdGluaXRpYWxpemU6ICggbWRscywgb3B0cyApPT5cblx0XHRpZiBvcHRzLm1vZGlmeUtleT8ubGVuZ3RoXG5cdFx0XHRAbW9kaWZ5S2V5ID0gb3B0cy5tb2RpZnlLZXlcblx0XHRyZXR1cm5cblx0cGFyc2U6ICggYXR0ciwgb3B0aW9ucyApPT5cblx0XHRfa2V5ID0gb3B0aW9ucy5fZmFjZXQuZ2V0KCBcIm1vZGlmeUtleVwiICkgb3IgQG1vZGlmeUtleSBvciBcInZhbHVlXCJcblx0XHRfbW9kaWZ5ID0gb3B0aW9ucy5fZmFjZXQ/LmdldCggXCJtb2RpZnlcIiApXG5cdFx0aWYgX21vZGlmeT8gYW5kIF8uaXNGdW5jdGlvbiggX21vZGlmeSApXG5cdFx0XHRhdHRyWyBfa2V5IF0gPSBfbW9kaWZ5KCBhdHRyLnZhbHVlLCBvcHRpb25zLl9mYWNldCwgYXR0ciApXG5cdFx0cmV0dXJuIGF0dHJcblxubW9kdWxlLmV4cG9ydHMgPSBJZ2d5UmVzdWx0c1xuIiwiY2xhc3MgQmFzZVJlc3VsdCBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIEBpZEF0dHJpYnV0ZSApIG9yIFwiLVwiXG5cblxuY2xhc3MgQmFzZVJlc3VsdHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRtb2RlbDogQmFzZVJlc3VsdFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VSZXN1bHRzIiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJkYXRlcmFuZ2UtaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgb3BlcmF0b3IsIG9wZXJhdG9ycywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuaWYgKCBvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwib3BlcmF0b3JcXFwiPjxzZWxlY3RcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIm9wXCIsIHRydWUsIGZhbHNlKSkgKyBcIj5cIik7XG4vLyBpdGVyYXRlIG9wZXJhdG9yc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcGVyYXRvcnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggb3BlcmF0b3IgPT0gb3AgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBvcCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIG9wLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggb3BlcmF0b3IgPT0gb3AgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gb3ApID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3NlbGVjdD48L2Rpdj5cIik7XG59XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm9wZXJhdG9yXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcGVyYXRvcjp0eXBlb2Ygb3BlcmF0b3IhPT1cInVuZGVmaW5lZFwiP29wZXJhdG9yOnVuZGVmaW5lZCxcIm9wZXJhdG9yc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3JzOnR5cGVvZiBvcGVyYXRvcnMhPT1cInVuZGVmaW5lZFwiP29wZXJhdG9yczp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJyYW5nZWlucFxcXCI+XCIpO1xudmFyIF92YWxzID0gdmFsdWUgPyB2YWx1ZSA6IFtdXG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwiX2Zyb21cIiwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBfdmFsc1swXSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJudW1iZXItaW5wIHJhbmdlLWZyb21cXFwiLz48c3BhbiBjbGFzcz1cXFwic2VwYXJhdG9yXFxcIj4tPC9zcGFuPjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwiX3RvXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS10b1xcXCIvPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuO3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAoY2lkLCBtdWx0aXBsZSwgb3B0aW9uR3JvdXBzLCBvcHRpb25zLCB1bmRlZmluZWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxzZWxlY3RcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBtdWx0aXBsZT1cXFwibXVsdGlwbGVcXFwiIGNsYXNzPVxcXCJzZWxlY3QtaW5wXFxcIj5cIik7XG5pZiAoIG9wdGlvbkdyb3Vwcylcbntcbi8vIGl0ZXJhdGUgb3B0aW9uR3JvdXBzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdGlvbkdyb3VwcztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGduYW1lID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBnbmFtZSA8ICQkbDsgZ25hbWUrKykge1xuICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGduYW1lIGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3B0cyA9ICQkb2JqW2duYW1lXTtcblxuYnVmLnB1c2goXCI8b3B0Z3JvdXBcIiArIChqYWRlLmF0dHIoXCJsYWJlbFwiLCBnbmFtZSwgdHJ1ZSwgZmFsc2UpKSArIFwiPjwvb3B0Z3JvdXA+XCIpO1xuLy8gaXRlcmF0ZSBvcHRzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IG9wdHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmVsc2Vcbntcbi8vIGl0ZXJhdGUgb3B0aW9uc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3NlbGVjdD5cIik7XG5pZiAoIG11bHRpcGxlKVxue1xuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwiYnRuIGJ0bi14cyBidG4tc3VjY2VzcyBzZWxlY3QtY2hlY2sgZmEgZmEtY2hlY2tcXFwiPjwvc3Bhbj5cIik7XG59fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwibXVsdGlwbGVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm11bHRpcGxlOnR5cGVvZiBtdWx0aXBsZSE9PVwidW5kZWZpbmVkXCI/bXVsdGlwbGU6dW5kZWZpbmVkLFwib3B0aW9uR3JvdXBzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25Hcm91cHM6dHlwZW9mIG9wdGlvbkdyb3VwcyE9PVwidW5kZWZpbmVkXCI/b3B0aW9uR3JvdXBzOnVuZGVmaW5lZCxcIm9wdGlvbnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wdGlvbnM6dHlwZW9mIG9wdGlvbnMhPT1cInVuZGVmaW5lZFwiP29wdGlvbnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwic2VsZWN0b3ItaW5wXFxcIi8+PHVsXCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJ0eXBlbGlzdFwiLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInR5cGVsaXN0XFxcIj48L3VsPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChhY3RpdmVJZHgsIGN1c3RvbSwgbGlzdCwgcXVlcnksIHVuZGVmaW5lZCkge1xudmFyIGFkZCA9IDA7XG5pZiAoIGN1c3RvbSAmJiBxdWVyeSlcbntcbmFkZCA9IDE7XG5idWYucHVzaChcIjxsaT48YSBkYXRhLWlkPVxcXCJfY3VzdG9tXFxcIiBkYXRhLWlkeD1cXFwiLTFcXFwiXCIgKyAoamFkZS5jbHMoW3thY3RpdmU6MCA9PT0gYWN0aXZlSWR4fV0sIFt0cnVlXSkpICsgXCI+PGk+XFxcIlwiICsgKCgoamFkZV9pbnRlcnAgPSBxdWVyeSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXFxcIjwvaT48L2E+PC9saT5cIik7XG59XG5pZiAoIGxpc3QubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBsaXN0XG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IGxpc3Q7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpXCIgKyAoamFkZS5jbHMoW2VsLmNzc2NsYXNzXSwgW3RydWVdKSkgKyBcIj48YVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgZWwuaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwiZGF0YS1pZHhcIiwgaWR4LCB0cnVlLCBmYWxzZSkpICsgKGphZGUuY2xzKFt7YWN0aXZlOihpZHggKyBhZGQpID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj5cIiArICgoKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuZWxzZSBpZiAoICFjdXN0b20pXG57XG5idWYucHVzaChcIjxsaT48YSBjbGFzcz1cXFwiZW1wdHlyZXNcXFwiPm5vIHJlc3VsdCBmb3IgXFxcIlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9hPjwvbGk+XCIpO1xufX0uY2FsbCh0aGlzLFwiYWN0aXZlSWR4XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5hY3RpdmVJZHg6dHlwZW9mIGFjdGl2ZUlkeCE9PVwidW5kZWZpbmVkXCI/YWN0aXZlSWR4OnVuZGVmaW5lZCxcImN1c3RvbVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY3VzdG9tOnR5cGVvZiBjdXN0b20hPT1cInVuZGVmaW5lZFwiP2N1c3RvbTp1bmRlZmluZWQsXCJsaXN0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5saXN0OnR5cGVvZiBsaXN0IT09XCJ1bmRlZmluZWRcIj9saXN0OnVuZGVmaW5lZCxcInF1ZXJ5XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5xdWVyeTp0eXBlb2YgcXVlcnkhPT1cInVuZGVmaW5lZFwiP3F1ZXJ5OnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIHZhbHVlKSB7XG5idWYucHVzaChcIjxpbnB1dFwiICsgKGphZGUuYXR0cihcImlkXCIsIGNpZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJzdHJpbmctaW5wXFxcIi8+XCIpO30uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGxhYmVsLCBzZWxlY3RlZCwgdW5kZWZpbmVkKSB7XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvZGl2PjxzcGFuIGNsYXNzPVxcXCJzdWJsYWJlbFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gbGFiZWwpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjo8L3NwYW4+PHVsIGNsYXNzPVxcXCJzdWJyZXN1bHRzXFxcIj5cIik7XG5pZiAoIHNlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aClcbntcbi8vIGl0ZXJhdGUgc2VsZWN0ZWRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gc2VsZWN0ZWQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IGlkeCA8ICQkbDsgaWR4KyspIHtcbiAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPGxpPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC91bD48ZGl2IGNsYXNzPVxcXCJzdWJzZWxlY3RcXFwiPjwvZGl2PlwiKTt9LmNhbGwodGhpcyxcImxhYmVsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5sYWJlbDp0eXBlb2YgbGFiZWwhPT1cInVuZGVmaW5lZFwiP2xhYmVsOnVuZGVmaW5lZCxcInNlbGVjdGVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5zZWxlY3RlZDp0eXBlb2Ygc2VsZWN0ZWQhPT1cInVuZGVmaW5lZFwiP3NlbGVjdGVkOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcblxuYnVmLnB1c2goXCI8ZGl2IGNsYXNzPVxcXCJhZGQtZmFjZXQtYnRuIGZhIGZhLXBsdXNcXFwiPjwvZGl2PlwiKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9XG5cdFwiTEVGVFwiOiAzN1xuXHRcIlJJR0hUXCI6IDM5XG5cdFwiVVBcIjogMzhcblx0XCJET1dOXCI6IDQwXG5cdFwiRVNDXCI6IFsgMjI5LCAyNyBdXG5cdFwiRU5URVJcIjogMTNcblx0XCJUQUJcIjogOVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuU3ViUmVzdWx0cyA9IHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL3N1YnJlc3VsdHNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0Jhc2UgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHJlc3VsdFRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGVcIiApXG5cblx0aW5pdGlhbGl6ZTogPT5cblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEByZXN1bHQubW9kZWxzXG5cdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEAkZWwuYWRkQ2xhc3MoIFwib3BlblwiIClcblx0XHRAaXNPcGVuID0gdHJ1ZVxuXHRcdEB0cmlnZ2VyKCBcIm9wZW5lZFwiIClcblx0XHRyZXR1cm5cblxuXHRpbnB1dDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuVEFCIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5UQUJcblx0XHRcdEBfb25UYWJBY3Rpb24oIGV2bnQgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRjaWQ6IEBjaWRcblx0XHR2YWx1ZTogQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApXG5cblx0X2dldElucFNlbGVjdG9yOiA9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH1cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRfdG1wbCA9IEB0ZW1wbGF0ZSggQGdldFRlbXBsYXRlRGF0YSgpIClcblx0XHRAJGVsLmh0bWwoIF90bXBsIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvcigpIClcblx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCB0cnVlIClcblx0XHRyZXR1cm5cblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXlkb3duXCJcblx0XHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHQkKCBkb2N1bWVudCApLm9mZiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggZmFsc2UgKVxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwib3BlblwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAaXNPcGVuID0gZmFsc2Vcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQGdldFZhbHVlKClcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogLT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRfY2hlY2tTZWxlY3RFbXB0eTogKCBfdmFsICk9PlxuXHRcdGlmIF8uaXNFbXB0eSggX3ZhbCApIGFuZCBub3QgXy5pc051bWJlciggX3ZhbCApIGFuZCBub3QgXy5pc0Jvb2xlYW4oIF92YWwgKVxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0OiA9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBpZiBAX2NoZWNrU2VsZWN0RW1wdHkoIF92YWwgKVxuXHRcdEBzZXQoIF92YWwgKVxuXHRcdHJldHVyblxuXG5cdHNldDogKCB2YWwgKT0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IHZhbCApXG5cdFx0QHJlc3VsdC5hZGQoIF9tb2RlbCApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgX21vZGVsIClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzQmFzZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNEYXRlUmFuZ2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvZGF0ZXJhbmdlLmphZGVcIiApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Zm9yY2VkRGF0ZVJhbmdlT3B0czpcblx0XHRvcGVuczogXCJyaWdodFwiXG5cblx0ZXZlbnRzOiA9PlxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0aWYgbm90IEBkYXRlcmFuZ2VwaWNrZXI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQG1vZGVsLmdldCggXCJvcHRzXCIgKSwgQGZvcmNlZERhdGVSYW5nZU9wdHMgKVxuXHRcdFx0QCRpbnAuZGF0ZXJhbmdlcGlja2VyKCBfb3B0cywgQF9kYXRlUmV0dXJuIClcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBAJGlucC5kYXRhKCBcImRhdGVyYW5nZXBpY2tlclwiIClcblx0XHRcdEAkaW5wLm9uKCBcImNhbmNlbC5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRcdEAkaW5wLm9uKCBcImhpZGUuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuY29udGFpbmVyPy5hZGRDbGFzcyggXCJkYXRlcmFuZ2UtaWdneVwiIClcblxuXHRcdGVsc2Vcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBkYXRlcmFuZ2VwaWNrZXI/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKSBpZiBfcmVzLnZhbHVlWyAxIF0/XG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcblx0X2RhdGVSZXR1cm46ICggQHN0YXJ0RGF0ZSwgQGVuZERhdGUgKT0+XG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIF9wcmVkZWZWYWw/XG5cdFx0XHRpZiBub3QgXy5pc0FycmF5KCBfcHJlZGVmVmFsIClcblx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0WyBAc3RhcnREYXRlLCBAZW5kRGF0ZSBdID0gX3ByZWRlZlZhbFxuXHRcdFx0cmV0dXJuIF9wcmVkZWZWYWxcblx0XHRfb3V0ID0gWyBAc3RhcnREYXRlLnZhbHVlT2YoKSBdXG5cdFx0X291dC5wdXNoIEBlbmREYXRlLnZhbHVlT2YoKSBpZiBAZW5kRGF0ZT9cblx0XHRyZXR1cm4gX291dFxuXG5cdHNlbGVjdDogPT5cblx0XHRfTW9kZWxDb25zdCA9IEBnZXRTZWxlY3RNb2RlbCgpXG5cdFx0X21vZGVsID0gbmV3IF9Nb2RlbENvbnN0KCB2YWx1ZTogQGdldFZhbHVlKCkgKVxuXHRcdEByZXN1bHQuYWRkKCBfbW9kZWwgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIF9tb2RlbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNEYXRlUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxubmVhcmVzdCA9IChuLCB2KS0+XG5cdG4gPSBuIC8gdlxuXHRuID0gTWF0aC5yb3VuZChuKSAqIHZcblx0cmV0dXJuIG5cblx0XG5wcmVjaXNpb24gPSAobiwgZHApLT5cblx0ZHAgPSBNYXRoLnBvdygxMCwgZHApXG5cdG4gPSBuICogZHBcblx0biA9IE1hdGgucm91bmQobilcblx0biA9IG4gLyBkcFxuXHRyZXR1cm4gblxuXG5jbGFzcyBGYWNldE51bWJlckJhc2UgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAc2V0TnVtYmVyID0gXy50aHJvdHRsZSggQF9zZXROdW1iZXIsIDMwMCwge2xlYWRpbmc6IGZhbHNlLCB0cmFpbGluZzogZmFsc2V9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPVxuXHRcdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdHJldHVybiBfZXZudHNcblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0XyRlbCA9ICQoIGV2bnQuY3VycmVudFRhcmdldCApXG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAY3JlbWVudCggQG1vZGVsLmdldCggXCJzdGVwXCIgKSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApICogLTEsIF8kZWwgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5dXBcIlxuXHRcdFx0X3YgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUucmVwbGFjZSggL1teXFxkXT9bXi1cXGRdKy9nLCBcIlwiIClcblx0XHRcdF92ID0gcGFyc2VJbnQoIF92LCAxMCApXG5cdFx0XHQgXG5cdFx0XHRAc2V0TnVtYmVyKCBfdiwgXyRlbCApXG5cdFx0cmV0dXJuXG5cblx0Y3JlbWVudDogKCBjaGFuZ2UsIGVsID0gQCRpbnAgKT0+XG5cdFx0X3YgPSBlbC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRfdiA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0ZWxzZVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblxuXHRcdEBfc2V0TnVtYmVyKCBfdiArIGNoYW5nZSwgZWwgKVxuXHRcdHJldHVyblxuXG5cdGdldFZhbHVlOiA9PlxuXHRcdF92ID0gQCRpbnAudmFsKClcblx0XHRpZiBub3QgX3Y/Lmxlbmd0aFxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHRyZXR1cm4gcGFyc2VJbnQoIEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YpLCAxMCApXG5cblx0X3NldE51bWJlcjogKCBfdiwgZWwgPSBAJGlucCApPT5cblx0XHRpZiBpc05hTiggX3YgKVxuXHRcdFx0I0AkaW5wLnZhbChcIlwiKVxuXHRcdFx0cmV0dXJuXG5cblx0XHRfY3VyciA9IGVsLnZhbCgpXG5cblx0XHRfdiA9IEB2YWx1ZUJ5RGVmaW5pdGlvbiggX3YpXG5cdFx0aWYgX2N1cnIgIT0gX3YudG9TdHJpbmcoKVxuXHRcdFx0ZWwudmFsKCBfdiApXG5cdFx0cmV0dXJuXG5cblx0dmFsdWVCeURlZmluaXRpb246ICggX3ZhbHVlICktPlxuXHRcdG1heCA9IEBtb2RlbC5nZXQoIFwibWF4XCIgKVxuXHRcdG1pbiA9IEBtb2RlbC5nZXQoIFwibWluXCIgKVxuXHRcdHN0ZXAgPSBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApXG5cdFx0XG5cdFx0IyBmaXggcmV2ZXJzZWQgbWluL21heCBzZXR0aW5nXG5cdFx0aWYgbWluID4gbWF4XG5cdFx0XHRfdG1wID0gbWluXG5cdFx0XHRtaW4gPSBtYXhcblx0XHRcdG1heCA9IF90bXBcblx0XHRcblx0XHQjIG9uIGV4eGVkZGluZyB0aGUgbGltaXRzIHVzZSB0aGUgbGltaXRcblx0XHRpZiBtaW4/IGFuZCBfdmFsdWUgPCBtaW5cblx0XHRcdHJldHVybiBtaW5cblx0XHRpZiBtYXg/IGFuZCBfdmFsdWUgPiBtYXhcblx0XHRcdHJldHVybiBtYXhcblxuXHRcdCMgc2VhcmNoIHRoZSBuZWFyZXN0IF92YWx1ZSB0byB0aGUgc3RlcFxuXHRcdGlmIHN0ZXAgaXNudCAxXG5cdFx0XHRfdmFsdWUgPSBuZWFyZXN0KCBfdmFsdWUsIHN0ZXAgKVxuXHRcdFxuXHRcdCMgY2FsYyB0aGUgcHJlY2lzaW9uIGJ5IHN0ZXBcblx0XHRfcHJlY2lzaW9uID0gTWF0aC5tYXgoIDAsIE1hdGguY2VpbCggTWF0aC5sb2coIDEvc3RlcCApIC8gTWF0aC5sb2coIDEwICkgKSApXG5cdFx0aWYgX3ByZWNpc2lvbiA+IDBcblx0XHRcdF92YWx1ZSA9IHByZWNpc2lvbiggX3ZhbHVlLCBfcHJlY2lzaW9uIClcblx0XHRlbHNlXG5cdFx0XHRfdmFsdWUgPSBNYXRoLnJvdW5kKCBfdmFsdWUgKVxuXHRcdFx0XG5cdFx0cmV0dXJuIF92YWx1ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXROdW1iZXJCYXNlXG4iLCJTdWJSZXN1bHRzID0gcmVxdWlyZSggXCIuLi8uLi9tb2RlbHMvc3VicmVzdWx0c1wiIClcbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgU3RyaW5nT3B0aW9uIGV4dGVuZHMgU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBTdHJpbmdPcHRpb25zIGV4dGVuZHMgU3ViUmVzdWx0c1xuXHRtb2RlbDogU3RyaW5nT3B0aW9uXG5cblxuY2xhc3MgQXJyYXlPcHRpb24gZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJ2YWx1ZVwiXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKSBvciBAZ2V0KCBcIm5hbWVcIiApIG9yIFwiLVwiXG5cblx0bWF0Y2g6ICggY3JpdCApPT5cblx0XHRfcyA9ICBAZ2V0KCBcInZhbHVlXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5jbGFzcyBBcnJheU9wdGlvbnMgZXh0ZW5kcyByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBBcnJheU9wdGlvblxuXG5jbGFzcyBGYWNldFN1YkFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuLi9zZWxlY3RvclwiIClcblx0b3B0RGVmYXVsdDpcblx0XHRsYWJlbDogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblxuXHRtdWx0aVNlbGVjdDogdHJ1ZVxuXG5cdG9wdENvbGw6IFN0cmluZ09wdGlvbnNcblxuXHRjb25zdHJ1Y3RvcjogKCBvcHRpb25zICktPlxuXHRcdG9wdGlvbnMuY3VzdG9tID0gdHJ1ZVxuXHRcdEBjb2xsZWN0aW9uID0gQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBvcHRpb25zLm1vZGVsLmdldCggXCJvcHRpb25zXCIgKSApXG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRzZWxlY3Q6ID0+XG5cdFx0X3ZhbHMgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdGlmIF92YWxzPyBhbmQgbm90IF8uaXNBcnJheSggX3ZhbHMgKVxuXHRcdFx0X3ZhbHMgPSBbIF92YWxzIF1cblx0XHRcdFxuXHRcdGZvciBfdmFsIGluIF92YWxzXG5cdFx0XHRfbWRsID0gQGNvbGxlY3Rpb24uZ2V0KCBfdmFsIClcblx0XHRcdGlmIG5vdCBfbWRsP1xuXHRcdFx0XHRfbWRsID0gbmV3IEBjb2xsZWN0aW9uLm1vZGVsKCB2YWx1ZTogX3ZhbCwgY3VzdG9tOiB0cnVlIClcblx0XHRcdEBzZWxlY3RlZCggX21kbCApXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQHJlc3VsdC5wbHVjayggXCJ2YWx1ZVwiIClcblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbjogKCBvcHRpb25zICk9PlxuXHRcdGlmIF8uaXNGdW5jdGlvbiggb3B0aW9ucyApXG5cdFx0XHRyZXR1cm4gb3B0aW9ucyggQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uIClcblxuXHRcdF9vcHRzID0gW11cblx0XHRmb3Igb3B0IGluIG9wdGlvbnNcblx0XHRcdGlmIF8uaXNTdHJpbmcoIG9wdCApIG9yIF8uaXNOdW1iZXIoIG9wdCApXG5cdFx0XHRcdF9vcHRzLnB1c2ggeyB2YWx1ZTogb3B0LCBsYWJlbDogb3B0IH1cblx0XHRcdGVsc2UgaWYgXy5pc09iamVjdChvcHQpXG5cdFx0XHRcdF9vcHRzLnB1c2ggXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgb3B0IClcblx0XHRyZXR1cm4gbmV3IEBvcHRDb2xsKCBfb3B0cyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YkFycmF5XG4iLCJjbGFzcyBGYWNldFN1YnNOdW1iZXIgZXh0ZW5kcyByZXF1aXJlKCBcIi4vbnVtYmVyX2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL251bWJlci5qYWRlXCIgKVxuXG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICk/Lmxlbmd0aFxuXHRcdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRfcyA9IFwiPGxpPlwiXG5cdFx0X3MgKz0gX3Jlcy5vcGVyYXRvciArIFwiIFwiIGlmIF9yZXMub3BlcmF0b3I/XG5cdFx0X3MgKz0gX3Jlcy52YWx1ZVxuXHRcdF9zICs9IFwiPC9saT5cIlxuXG5cdFx0cmV0dXJuIF9zXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QCRpbnBPcC5zZWxlY3QyKCBcImRlc3Ryb3lcIiApXG5cdFx0XHRAJGlucE9wLnJlbW92ZSgpXG5cdFx0XHRAJGlucE9wID0gbnVsbFxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0X29wU2VsZWN0ZWQ6ID0+XG5cdFx0QHNlbGVjdGVkT1AgPSB0cnVlXG5cdFx0QGZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRpZiBAJGlucE9wPyBhbmQgbm90IEBzZWxlY3RlZE9QXG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwib3BlblwiIClcblx0XHRcdHJldHVyblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICksIG9wZXJhdG9yOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKX0gKVxuXG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3AudmFsKClcblx0XHRlbHNlXG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyXG4iLCJjbGFzcyBGYWNldFN1YnNSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmFuZ2UuamFkZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ICggZXh0ID0gXCJfZnJvbVwiICk9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH0je2V4dH1cIlxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cdFx0cmV0dXJuIFwiPGxpPlwiICtfcmVzLnZhbHVlLmpvaW4oIFwiIC0gXCIgKSArIFwiPC9saT5cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkaW5wVG8gPSBAJGVsLmZpbmQoIEBfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICggaW5wID0gZmFsc2UgKT0+XG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAJCggXCIucmFuZ2VpbnBcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRnZXRSZXN1bHRzOiA9PlxuXHRcdF9yZXQgPVxuXHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblx0XG5cdGdldFZhbHVlOiA9PlxuXHRcdF92RnJvbSA9IHN1cGVyXG5cdFx0X3YgPSBAJGlucFRvLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdHJldHVybiBudWxsXG5cdFx0X3ZUbyA9IHBhcnNlSW50KCBAdmFsdWVCeURlZmluaXRpb24oIF92KSwgMTAgKVxuXG5cdFx0cmV0dXJuIFsgX3ZGcm9tLCBfdlRvIF1cblx0XG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIF92YWw/Lmxlbmd0aCA+PSAyXG5cdFx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdEBzZWxlY3QoKVxuXHRcdHJldHVyblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNSYW5nZVxuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNTZWxlY3QgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc2VsZWN0LmphZGVcIiApXG5cblx0Zm9yY2VkTW9kdWxlT3B0czp7fVxuXHQjXHRtdWx0aXBsZTogdHJ1ZVxuXG5cdGRlZmF1bHRNb2R1bGVPcHRzOlxuXHRcdCNtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxXG5cdFx0d2lkdGg6IFwiYXV0b1wiXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cblx0ZXZlbnRzOiA9PlxuXHRcdF9ldm50cyA9IHt9XG5cdFx0X2V2bnRzWyBcImNsaWNrIC5zZWxlY3QtY2hlY2tcIiBdID0gXCJzZWxlY3RcIiBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBfZXZudHNcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwic2VsZWN0IyN7QGNpZH1cIlxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoKT0+XG5cdFx0QF9pbml0U2VsZWN0MigpXG5cdFx0QHNlbGVjdDIub3BlbigpXG5cdFx0I2Vsc2Vcblx0XHRcdCNAJGlucC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0X2luaXRTZWxlY3QyOiA9PlxuXHRcdGlmIG5vdCBAc2VsZWN0Mj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAZGVmYXVsdE1vZHVsZU9wdHMsIEBtb2RlbC5nZXQoIFwib3B0c1wiICksIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApIH0sIEBmb3JjZWRNb2R1bGVPcHRzIClcblx0XHRcdEAkaW5wLnNlbGVjdDIoIF9vcHRzIClcblx0XHRcdEBzZWxlY3QyID0gQCRpbnAuZGF0YSggXCJzZWxlY3QyXCIgKVxuXHRcdFx0aWYgbm90IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0XHRcdEAkaW5wLm9uIFwic2VsZWN0MjpzZWxlY3RcIiwgQHNlbGVjdFxuXHRcdFx0QHNlbGVjdDIuJGNvbnRhaW5lci5vbiBcImNsaWNrXCIsIEBfc2VsMm9wZW5cblx0XHRcdEBzZWxlY3QyLiRlbGVtZW50LmhpZGUoKVxuXHRcdFx0JCggZG9jdW1lbnQgKS5vbiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQG1vZGVsLmdldCggXCJtdWx0aXBsZVwiIClcblx0XHRyZXR1cm5cblxuXHRfc2VsMm9wZW46ICggZXZudCApLT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0cmV0dXJuIGZhbHNlXG5cdFxuXHRyZW1vdmU6ID0+XG5cdFx0I0AkaW5wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRyZXR1cm4gc3VwZXJcblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0X2RhdGEgPSBfLmV4dGVuZCgge30sIHN1cGVyLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSwgb3B0aW9uczogQF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uKCBAbW9kZWwuZ2V0KCBcIm9wdGlvbnNcIiApICkgfSApXG5cdFx0aWYgX2RhdGEudmFsdWU/IGFuZCBub3QgXy5pc0FycmF5KCBfZGF0YS52YWx1ZSApXG5cdFx0XHRfZGF0YS52YWx1ZSA9IFsgX2RhdGEudmFsdWUgXVxuXG5cdFx0aWYgX2RhdGEudmFsdWU/XG5cdFx0XHRmb3IgX3YgaW4gX2RhdGEudmFsdWUgd2hlbiBfdiBub3QgaW4gXy5wbHVjayggX2RhdGEub3B0aW9ucywgXCJ2YWx1ZVwiIClcblx0XHRcdFx0X2RhdGEub3B0aW9ucy5wdXNoIHsgdmFsdWU6IF92LCBsYWJlbDogX3YsIGdyb3VwOiBudWxsIH1cblx0XHRcblx0XHRfZ3JvdXBzID0gXy5ncm91cEJ5KCBfZGF0YS5vcHRpb25zLCBcImdyb3VwXCIgKVxuXHRcdGlmIF8uY29tcGFjdCggXy5rZXlzKCBfZ3JvdXBzIG9yIHt9ICkgKS5sZW5ndGggPiAxXG5cdFx0XHRfZGF0YS5vcHRpb25Hcm91cHMgPSBfZ3JvdXBzXG5cdFx0cmV0dXJuIF9kYXRhXG5cdFxuXHRfaGFzVGFiTGlzdGVuZXI6ICggY3JlYXRlICk9PlxuXHRcdGlmIGNyZWF0ZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIEBtb2RlbC5nZXQoXCJtdWx0aXBsZVwiKVxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleXVwXCJcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ZhbHMgPSBbXVxuXHRcdGZvciBkYXRhIGluIEBzZWxlY3QyPy5kYXRhKCkgb3IgW11cblx0XHRcdF9kYXRhID0ge31cblx0XHRcdF9kYXRhLnZhbHVlID0gZGF0YS5pZFxuXHRcdFx0X2RhdGEubGFiZWwgPSBkYXRhLnRleHQgaWYgZGF0YS50ZXh0P1xuXHRcdFx0X3ZhbHMucHVzaCggX2RhdGEgKVxuXHRcdHJldHVybiBfdmFsc1xuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0cmV0dXJuIG9wdGlvbnMoIEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiApXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCwgZ3JvdXA6IG51bGwgfVxuXHRcdFx0ZWxzZSBpZiBfLmlzT2JqZWN0KCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cblx0XHRyZXR1cm4gX29wdHNcblxuXHR1bnNlbGVjdDogKCBldm50ICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBldm50LnBhcmFtcz8uZGF0YT8uaWQgKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdEBzZWxlY3QyPy5kZXN0cm95KClcblx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRAJCggXCIuc2VsZWN0LWNoZWNrXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRzZWxlY3Q6ICggZXZudCApPT5cblx0XHRfdmFscyA9IEBnZXRWYWx1ZSgpXG5cdFx0aWYgbm90IF92YWxzPy5sZW5ndGhcblx0XHRcdEBjbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRNb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRmb3IgX3ZhbCBpbiBfdmFsc1xuXHRcdFx0QHJlc3VsdC5hZGQoIG5ldyBNb2RlbENvbnN0KCBfdmFsICkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEByZXN1bHQgKVxuXG5cdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNTZWxlY3RcbiIsImNsYXNzIEZhY2V0U3ViU3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3N0cmluZy5qYWRlXCIgKVxuXHRcblx0ZXZlbnRzOiA9PlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHRzdXBlclxuXHRcdHRyeVxuXHRcdFx0QCRpbnA/LnJlbW92ZSgpXG5cdFx0cmV0dXJuXG5cdFx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZ1xuIiwiU3ViVmlldyA9IHJlcXVpcmUoIFwiLi9zdWJcIiApXG5TZWxlY3RvclZpZXcgPSByZXF1aXJlKCBcIi4vc2VsZWN0b3JcIiApXG5cbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgTWFpblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3dyYXBwZXIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiBcImlnZ3kgY2xlYXJmaXhcIlxuXG5cdGV2ZW50czpcblx0XHRcImNsaWNrIC5hZGQtZmFjZXQtYnRuXCI6IFwiX2FkZEZhY2V0XCJcblx0XHRcImNsaWNrXCI6IFwiX2FkZEZhY2V0XCJcblxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHJlc3VsdHMgPSBvcHRpb25zLnJlc3VsdHNcblxuXHRcdEBjb2xsZWN0aW9uLm9uIFwiaWdneTpyZW1cIiwgQHJlbUZhY2V0XG5cblx0XHRAZWwuY2xhc3NOYW1lICs9IEBjbGFzc05hbWVcblx0XHRAcmVuZGVyKClcblx0XHQkKCBkb2N1bWVudCApLm9uIFwia2V5dXBcIiwgQF9vbktleVxuXG5cdFx0Zm9yIGZjdCBpbiBAY29sbGVjdGlvbi5maWx0ZXIoICggZmN0ICktPnJldHVybiBmY3Q/LmdldCggXCJ2YWx1ZVwiICk/IClcblx0XHRcdHN1YnZpZXcgPSBAZ2VuU3ViKCBmY3QsIGZhbHNlIClcblx0XHRcblx0XHRyZXR1cm5cblxuXHRyZW5kZXI6ID0+XG5cdFx0QCRlbC5odG1sKCBAdGVtcGxhdGUoKSApXG5cdFx0QCRhZGRCdG4gPSBAJCggXCIuYWRkLWZhY2V0LWJ0blwiIClcblx0XHRyZXR1cm5cblxuXHRfYWRkRmFjZXQ6ICggZXZudCApPT5cblx0XHRAYWRkRmFjZXQoKVxuXHRcdHJldHVyblxuXG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5FU0Mgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLkVTQ1xuXHRcdFx0QGV4aXQoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRleGl0OiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3XG5cdFx0XHQjY29uc29sZS5sb2cgXCJNQUlOIFJFTU9WRSBTRUxFQ1RcIlxuXHRcdFx0QHNlbGVjdHZpZXcuY2xvc2UoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKVxuXHRcdHJldHVyblxuXG5cdHJlbUZhY2V0OiAoIGZhY2V0TSApPT5cblx0XHRAcmVzdWx0cy5yZW1vdmUoIGZhY2V0TS5nZXQoIFwibmFtZVwiICkgKVxuXHRcdHJldHVyblxuXG5cdHNldEZhY2V0OiAoIGZhY2V0TSwgZGF0YSApPT5cblx0XHRAY29sbGVjdGlvbi5yZW1vdmUoIGZhY2V0TSApXG5cblx0XHRAcmVzdWx0cy5hZGQoIF8uZXh0ZW5kKCBkYXRhLCB7IG5hbWU6IGZhY2V0TS5nZXQoIFwibmFtZVwiICksIHR5cGU6IGZhY2V0TS5nZXQoIFwidHlwZVwiICkgfSApLCB7IG1lcmdlOiB0cnVlLCBwYXJzZTogdHJ1ZSwgX2ZhY2V0OiBmYWNldE0gfSApXG5cdFx0cmV0dXJuXG5cblx0Z2VuU3ViOiAoIGZhY2V0TSwgYWRkQWZ0ZXIgPSB0cnVlICk9PlxuXHRcdHN1YnZpZXcgPSBuZXcgU3ViVmlldyggbW9kZWw6IGZhY2V0TSwgY29sbGVjdGlvbjogQGNvbGxlY3Rpb24gKVxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHRzICk9PlxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1VCIFZJRVcgQ0xPU0VEXCIsIHJlc3VsdHM/Lmxlbmd0aFxuXHRcdFx0c3Vidmlldy5vZmYoKVxuXHRcdFx0c3Vidmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0cz8ubGVuZ3RoXG5cdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdEBhZGRGYWNldCgpIGlmIGFkZEFmdGVyXG5cdFx0XHRyZXR1cm5cblxuXHRcdHN1YnZpZXcub24oIFwic2VsZWN0ZWRcIiwgQHNldEZhY2V0IClcblx0XHRcblx0XHRAJGFkZEJ0bi5iZWZvcmUoIHN1YnZpZXcucmVuZGVyKCkgKVxuXHRcdHJldHVybiBzdWJ2aWV3XG5cblx0YWRkRmFjZXQ6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU0VMRUNUIEVYSVNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU1VCIEVYSVNUXCJcblx0XHRcdEBzdWJ2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIEVNUFRZIENPTExcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBTZWxlY3RvclZpZXcoIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBjdXN0b206IGZhbHNlIClcblxuXHRcdEAkYWRkQnRuLmJlZm9yZSggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNFTEVDVCBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKVxuXHRcdFx0QHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRpZiBub3QgcmVzdWx0cz8ubGVuZ3RoIGFuZCBAc3Vidmlldz9cblx0XHRcdFx0QHN1YnZpZXcub2ZmKClcblx0XHRcdFx0QHN1YnZpZXcucmVtb3ZlKClcblx0XHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwic2VsZWN0ZWRcIiwgKCBmYWNldE0gKT0+XG5cdFx0XHRmYWNldE0uc2V0KCBcInZhbHVlXCIsIG51bGwgKVxuXHRcdFx0QHN1YnZpZXcgPSBAZ2VuU3ViKCBmYWNldE0gKVxuXHRcdFx0QHN1YnZpZXcub3BlbigpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBNYWluVmlld1xuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTZWxlY3RvclZpZXcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRzL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9yLmphZGVcIiApXG5cdHRlbXBsYXRlRWw6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3JsaS5qYWRlXCIgKVxuXHRtdWx0aVNlbGVjdDogZmFsc2VcblxuXHRjbGFzc05hbWU6ID0+XG5cdFx0Y2xzID0gWyBcImFkZC1mYWNldFwiIF1cblx0XHRpZiBAY3VzdG9tXG5cdFx0XHRjbHMucHVzaCBcImN1c3RvbVwiXG5cdFx0cmV0dXJuIGNscy5qb2luKCBcIiBcIiApXG5cblx0ZXZlbnRzOiA9PlxuXHRcdFwibW91c2Vkb3duIGFcIjogXCJfb25DbGlja1wiXG5cdFx0XCJmb2N1cyBpbnB1dCMje0BjaWR9XCI6IFwib3BlblwiXG5cdFx0I1wiYmx1ciBpbnB1dCMje0BjaWR9XCI6IFwiY2xvc2VcIlxuXHRcdFwia2V5ZG93biBpbnB1dCMje0BjaWR9XCI6IFwic2VhcmNoXCJcblx0XHRcImtleXVwIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXG5cdGNvbnN0cnVjdG9yOiAoIG9wdGlvbnMgKS0+XG5cdFx0QGN1c3RvbSA9ICBvcHRpb25zLmN1c3RvbSBvciBmYWxzZVxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QGN1cnJRdWVyeSA9IFwiXCJcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcdFxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0QHNlYXJjaGNvbGwgPSBAY29sbGVjdGlvbi5zdWIoIC0+dHJ1ZSApXG5cdFx0QHJlc3VsdCA9IG5ldyBAY29sbGVjdGlvbi5jb25zdHJ1Y3RvcigpXG5cdFx0XG5cdFx0I0BsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwiYWRkXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEByZW5kZXJSZXMgKVxuXHRcdEBsaXN0ZW5UbyggQHNlYXJjaGNvbGwsIFwicmVtb3ZlXCIsIEBjaGVja09wdGlvbnNFbXB0eSApXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIGN1c3RvbTogQGN1c3RvbSApXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRsaXN0ID0gQCRlbC5maW5kKCBcIiMje0BjaWR9dHlwZWxpc3RcIiApXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdHJlbmRlclJlczogPT5cblx0XHRAJGxpc3QuZW1wdHkoKVxuXG5cdFx0X2xpc3QgPSBbXVxuXHRcdGZvciBtb2RlbCwgaWR4IGluIEBzZWFyY2hjb2xsLm1vZGVsc1xuXHRcdFx0X2xibCA9IG1vZGVsLmdldExhYmVsKClcblx0XHRcdF9pZCA9IG1vZGVsLmlkXG5cdFx0XHRfY3NzY2xhc3MgPSBtb2RlbC5nZXQoIFwiY3NzY2xhc3NcIiApXG5cdFx0XHRjb25zb2xlLmxvZyBcIm1vZGVsXCIsX2Nzc2NsYXNzXG5cdFx0XHRpZiBAY3VyclF1ZXJ5Py5sZW5ndGggPiAxXG5cdFx0XHRcdF9sYmwgPSBfbGJsLnJlcGxhY2UoIG5ldyBSZWdFeHAoIEBjdXJyUXVlcnksIFwiZ2lcIiApLCAoKCBzdHIgKS0+cmV0dXJuIFwiPGI+I3tzdHJ9PC9iPlwiICkgKVxuXHRcdFx0X2xpc3QucHVzaCBsYWJlbDogX2xibCwgaWQ6IF9pZCwgY3NzY2xhc3M6IF9jc3NjbGFzc1xuXHRcdEAkbGlzdC5hcHBlbmQoIEB0ZW1wbGF0ZUVsKCBsaXN0OiBfbGlzdCwgcXVlcnk6IEBjdXJyUXVlcnksIGFjdGl2ZUlkeDogQGFjdGl2ZUlkeCwgY3VzdG9tOiBAY3VzdG9tICkgKVxuXG5cdFx0QF9jaGVja1Njcm9sbCgpXG5cdFx0XG5cdFx0cmV0dXJuIEAkbGlzdFxuXG5cdF9zY3JvbGxUaWxsOiAxOThcblx0X2NoZWNrU2Nyb2xsOiA9PlxuXHRcdF9oZWlnaHQgPSBAJGxpc3QuaGVpZ2h0KClcblx0XHRpZiBfaGVpZ2h0ID4gMFxuXHRcdFx0QHNjcm9sbEhlbHBlciggX2hlaWdodCApXG5cdFx0XHRyZXR1cm5cblxuXHRcdCMgZXhpdCB0aGUgdGhlIGNhbGwgc3RhY2sgdG8gY2hlY2sgaGVpZ2h0IGFmdGVyIHRoZSBtb2R1bGUgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGRvbVxuXHRcdHNldFRpbWVvdXQoID0+XG5cdFx0XHRAc2Nyb2xsSGVscGVyKCBAJGxpc3QuaGVpZ2h0KCkgKVxuXHRcdCwgMCApXG5cdFx0cmV0dXJuXG5cblx0c2Nyb2xsSGVscGVyOiAoIGhlaWdodCApPT5cblx0XHRpZiBoZWlnaHQgPj0gQF9zY3JvbGxUaWxsXG5cdFx0XHRAc2Nyb2xsaW5nID0gdHJ1ZVxuXHRcdGVsc2Vcblx0XHRcdEBzY3JvbGxpbmcgPSBmYWxzZVxuXHRcdHJldHVyblxuXG5cdGNoZWNrT3B0aW9uc0VtcHR5OiA9PlxuXHRcdCNpZiBAc2VhcmNoY29sbC5sZW5ndGggPD0gMFxuXHRcdCNcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblx0X29uQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRfaWQgPSBAJCggZXZudC5jdXJyZW50VGFyZ2V0ICkuZGF0YSggXCJpZFwiIClcblx0XHRAc2VsZWN0ZWQoIEBjb2xsZWN0aW9uLmdldCggX2lkICkgKVxuXHRcdGlmIG5vdCBAbXVsdGlTZWxlY3Rcblx0XHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0ZWQ6ICggbWRsICk9PlxuXHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdG1kbD8uZXhlYz8oKVxuXHRcdFx0cmV0dXJuXG5cdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBtZGwgKVxuXHRcdEByZXN1bHQuYWRkKCBtZGwgKVxuXHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ID0+XG5cdFx0QCRpbnAuZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdHNlYXJjaDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQudHlwZSBpcyBcImtleWRvd25cIlxuXHRcdFx0c3dpdGNoIGV2bnQua2V5Q29kZVxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLlVQXG5cdFx0XHRcdFx0QG1vdmUoIHRydWUgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkRPV05cblx0XHRcdFx0XHRAbW92ZSggZmFsc2UgKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR3aGVuIEtFWUNPREVTLkVOVEVSXG5cdFx0XHRcdFx0QHNlbGVjdEFjdGl2ZSgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9xID0gZXZudC5jdXJyZW50VGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKClcblx0XHRpZiBfcSBpcyBAY3VyclF1ZXJ5XG5cdFx0XHRyZXR1cm5cblxuXHRcdEBjdXJyUXVlcnkgPSBfcVxuXG5cdFx0QHNlYXJjaGNvbGwudXBkYXRlU3ViRmlsdGVyKCAoIG1kbCApPT5cblx0XHRcdGlmIEByZXN1bHQuZ2V0KCBtZGwuaWQgKT9cblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBub3QgX3E/Lmxlbmd0aFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0X21hdGNoID0gbWRsLm1hdGNoKCBfcSApXG5cdFx0XHRyZXR1cm4gX21hdGNoXG5cdFx0LCBmYWxzZSApXG5cblxuXHRcdEBhY3RpdmVJZHggPSAwXG5cdFx0QHJlbmRlclJlcygpXG5cdFx0cmV0dXJuXG5cblx0bW92ZTogKCB1cCA9IGZhbHNlICk9PlxuXHRcdF9saXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhXCIgKVxuXG5cdFx0X3RvcCA9IDBcblx0XHRpZiB1cFxuXHRcdFx0aWYgKCBAYWN0aXZlSWR4IC0gMSApIDwgX3RvcFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4IC0gMVxuXHRcdGVsc2Vcblx0XHRcdGlmIEBzZWFyY2hjb2xsLmxlbmd0aCAtIDEgPD0gQGFjdGl2ZUlkeFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4ICsgMVxuXG5cblx0XHRAJCggX2xpc3RbIEBhY3RpdmVJZHggXSApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiIClcblx0XHRfJGVsbmV3ID0gQCQoIF9saXN0WyBfbmV3aWR4IF0gKS5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG5cblx0XHRpZiBAc2Nyb2xsaW5nXG5cdFx0XHRfZWxIID0gXyRlbG5ldy5vdXRlckhlaWdodCgpXG5cdFx0XHRfcG9zID0gX2VsSCAqICggX25ld2lkeCArIDEgKVxuXHRcdFx0XyRsaXN0ID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdFwiIClcblx0XHRcdF9zY3JvbGxUID0gXyRsaXN0LnNjcm9sbFRvcCgpXG5cdFx0XHRpZiBfcG9zID4gX3Njcm9sbFQgKyBAX3Njcm9sbFRpbGxcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIEBfc2Nyb2xsVGlsbCApXG5cdFx0XHRlbHNlIGlmIF9wb3MgPCBfc2Nyb2xsVCArIF9lbEhcblx0XHRcdFx0XyRsaXN0LnNjcm9sbFRvcCggX3BvcyAtIF9lbEggKVxuXG5cdFx0QGFjdGl2ZUlkeCA9IF9uZXdpZHhcblx0XHRyZXR1cm5cblxuXHRzZWxlY3Q6PT5cblx0XHRyZXR1cm5cblxuXHRzZWxlY3RBY3RpdmU6ID0+XG5cdFx0X3NlbCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3QgYS5hY3RpdmVcIiApLnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiICkuZGF0YSgpXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRpZiBfc2VsPy5pZHggPj0gMCBhbmQgQHNlYXJjaGNvbGwubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIEBjb2xsZWN0aW9uLmdldCggX3NlbC5pZCApIClcblx0XHRlbHNlIGlmIEBjdXJyUXVlcnk/Lmxlbmd0aFxuXHRcdFx0QHNlbGVjdGVkKCBuZXcgQGNvbGxlY3Rpb24ubW9kZWwoIHZhbHVlOiBAY3VyclF1ZXJ5LCBjdXN0b206IHRydWUgKSApXG5cdFx0XHRAJGlucC52YWwoIFwiXCIgKVxuXHRcdGVsc2Vcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBtdWx0aVNlbGVjdFxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclZpZXdcbiIsImNsYXNzIFZpZXdTdWIgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3N1Yi5qYWRlXCIgKVxuXHRjbGFzc05hbWU6IFwic3ViXCJcblxuXHRpbml0aWFsaXplOiA9PlxuXHRcdEByZXN1bHQgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpXG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOlxuXHRcdFwiY2xpY2sgLnJtLWZhY2V0LWJ0blwiOiBcImRlbFwiXG5cblx0cmVuZGVyOiAoIG9wdE1kbCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZSggbGFiZWw6IEBtb2RlbC5nZXRMYWJlbCgpLCBzZWxlY3RlZDogX2xpc3QgKVxuXHRcdEAkc3ViID0gQCQoIFwiLnN1YnNlbGVjdFwiIClcblx0XHRAJHJlc3VsdHMgPSBAJCggXCIuc3VicmVzdWx0c1wiIClcblxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cdFx0cmV0dXJuIEBlbFxuXG5cdGRlbDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRAY29sbGVjdGlvbi50cmlnZ2VyKCBcImlnZ3k6cmVtXCIsIEBtb2RlbCApXG5cdFx0QGNvbGxlY3Rpb24uYWRkKCBAbW9kZWwgKVxuXHRcdEByZW1vdmUoKVxuXHRcdEB0cmlnZ2VyKCBcImNsb3NlZFwiIClcblx0XHRyZXR1cm4gZmFsc2VcblxuXHRyZW1vdmU6ID0+XG5cdFx0QHNlbGVjdHZpZXc/LnJlbW92ZSgpXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0c2VsZWN0ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQuYWRkKCBvcHRNZGwgKVxuXHRcdEAkcmVzdWx0cy5odG1sKCBAc2VsZWN0dmlldy5yZW5kZXJSZXN1bHQoKSApXG5cdFx0QHRyaWdnZXIoIFwic2VsZWN0ZWRcIiwgQG1vZGVsLCBAc2VsZWN0dmlldy5nZXRSZXN1bHRzKCkgKVxuXHRcdHJldHVyblxuXG5cdGlzT3BlbjogPT5cblx0XHRyZXR1cm4gQHNlbGVjdHZpZXc/XG5cblx0Zm9jdXM6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QG9wZW4oKVxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cdGdlbmVyYXRlU3ViOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0cmV0dXJuIEBzZWxlY3R2aWV3XG5cdFx0XHRcblx0XHRAc2VsZWN0dmlldyA9IG5ldyBAbW9kZWwuU3ViVmlldyggbW9kZWw6IEBtb2RlbCwgZWw6IEAkc3ViIClcblx0XHRAc2VsZWN0dmlldy5vbiBcImNsb3NlZFwiLCAoIHJlc3VsdCApPT5cblx0XHRcdEBzZWxlY3R2aWV3Lm9mZigpXG5cdFx0XHRAc2VsZWN0dmlldy5yZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0I0BzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0QHRyaWdnZXIoIFwiY2xvc2VkXCIsIHJlc3VsdCApXG5cdFx0XHRAcmVtb3ZlKCkgaWYgbm90IHJlc3VsdC5sZW5ndGhcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAc2VsZWN0ZWQoIG1kbCApXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdEAkZWwuYXBwZW5kKCBAc2VsZWN0dmlldy5yZW5kZXIoKSApXG5cdFx0aWYgQG1vZGVsPy5nZXQoIFwidmFsdWVcIiApP1xuXHRcdFx0QHNlbGVjdHZpZXcuc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRvcGVuOiA9PlxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cblx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdTdWJcbiIsbnVsbCwiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuamFkZSA9IGYoKX19KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykgOlxuICAgICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXModmFsKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdmFsW2tleV07IH0pIDpcbiAgICBbdmFsXSkuZmlsdGVyKG51bGxzKS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGNsYXNzZXNcbiAqIEBwYXJhbSB7QXJyYXkuPEJvb2xlYW4+fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xzID0gZnVuY3Rpb24gY2xzKGNsYXNzZXMsIGVzY2FwZWQpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2ldKSB7XG4gICAgICBidWYucHVzaChleHBvcnRzLmVzY2FwZShqb2luQ2xhc3NlcyhbY2xhc3Nlc1tpXV0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5wdXNoKGpvaW5DbGFzc2VzKGNsYXNzZXNbaV0pKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHQgPSBqb2luQ2xhc3NlcyhidWYpO1xuICBpZiAodGV4dC5sZW5ndGgpIHtcbiAgICByZXR1cm4gJyBjbGFzcz1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cblxuZXhwb3J0cy5zdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLm1hcChmdW5jdGlvbiAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbFtzdHlsZV07XG4gICAgfSkuam9pbignOycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgdmFsID0gZXhwb3J0cy5zdHlsZSh2YWwpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiAnICcgKyAodGVyc2UgPyBrZXkgOiBrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHZhbCkuaW5kZXhPZignJicpICE9PSAtMSkge1xuICAgICAgY29uc29sZS53YXJuKCdTaW5jZSBKYWRlIDIuMC4wLCBhbXBlcnNhbmRzIChgJmApIGluIGRhdGEgYXR0cmlidXRlcyAnICtcbiAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2AnKTtcbiAgICB9O1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgZWxpbWluYXRlIHRoZSBkb3VibGUgcXVvdGVzIGFyb3VuZCBkYXRlcyBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAnSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZSgvJy9nLCAnJmFwb3M7JykgKyBcIidcIjtcbiAgfSBlbHNlIGlmIChlc2NhcGVkKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgZXhwb3J0cy5lc2NhcGUodmFsKSArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsLnRvSVNPU3RyaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0phZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjAnKTtcbiAgICB9XG4gICAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBmdW5jdGlvbiBhdHRycyhvYmosIHRlcnNlKXtcbiAgdmFyIGJ1ZiA9IFtdO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09IGtleSkge1xuICAgICAgICBpZiAodmFsID0gam9pbkNsYXNzZXModmFsKSkge1xuICAgICAgICAgIGJ1Zi5wdXNoKCcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmVzY2FwZSA9IGZ1bmN0aW9uIGVzY2FwZShodG1sKXtcbiAgdmFyIHJlc3VsdCA9IFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xuICBpZiAocmVzdWx0ID09PSAnJyArIGh0bWwpIHJldHVybiBodG1sO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIGphZGUgaW4gYGZpbGVuYW1lYCBhdCB0aGUgZ2l2ZW4gYGxpbmVub2AuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG5cbmV4cG9ydHMuRGVidWdJdGVtID0gZnVuY3Rpb24gRGVidWdJdGVtKGxpbmVubywgZmlsZW5hbWUpIHtcbiAgdGhpcy5saW5lbm8gPSBsaW5lbm87XG4gIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbn1cblxufSx7XCJmc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxufSx7fV19LHt9LFsxXSkoMSlcbn0pOyJdfQ==
