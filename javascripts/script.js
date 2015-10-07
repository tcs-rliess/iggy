jQuery( function( $ ){
	
	var TestAdapter, BaseAdapter,
		bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
		extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
		hasProp = {}.hasOwnProperty;

	BaseAdapter = $.fn.select2.amd.require("select2/data/ajax");

	TestAdapter = (function(superClass) {
		extend(TestAdapter, superClass);

		function TestAdapter($element, options) {
			this.query = bind(this.query, this);
			this.current = bind(this.current, this);
			TestAdapter.__super__.constructor.apply(this, arguments);
			this.fetch = $.Deferred();
			setTimeout((function(_this) {
				return function() {
					
					_this.fetch.resolve([
						{
							id: 27,
							text: "opt 27"
						}, {
							id: 28,
							text: "opt 28"
						}, {
							id: 29,
							text: "opt 29"
						}, {
							id: 30,
							text: "opt 30"
						}, {
							id: 31,
							text: "opt 31"
						}, {
							id: 32,
							text: "opt 32"
						}, {
							id: 33,
							text: "opt 33"
						}
					]);
				};
			})(this), 1000);
			return;
		}

		TestAdapter.prototype.current = function(callback) {
			var id, selected;
			id = this.$element.val();
			selected = [];
			
			this.fetch.then((function(_this) {
				return function(items) {
					var models;
					if( id == undefined || id.length <= 0 ){
						callback(selected);
						return
					}
					models = _.filter(items, function( el ){
						return id.indexOf( el.id.toString() ) >= 0
					});
					callback(models);
				};
			})(this));
		};

		TestAdapter.prototype.query = function(params, callback) {
			this.fetch.then((function(_this) {
				return function(items) {
					var matcher, results;
					matcher = _this.options.get("matcher");
					results = [];
					_.each(items, function(model) {
						var match;
						match = matcher(params, model);
						if (match != null) {
							results.push(match);
						}
					});
					callback({
						results: results
					});
				};
			})(this));
		};

		return TestAdapter;

	})(BaseAdapter);
	
	var _printQuery = function( data, target ){
		$( target || "#iggytest1_result" ).html( JSON.stringify( data, null, "  " ) );
	}

	function newIggy( facets, _target, opts ){
		var _iggy = new IGGY( $( _target ), facets, opts );
		var _query = _iggy.getQuery()
		_printQuery( _query.toJSON(), _target + "_result" )
		_iggy.on( "change", function( qColl ){
			_printQuery( qColl.toJSON(), _target + "_result" )
		});
		return _iggy;
	}

	var facets = [{
		type: "event",
		name: "run",
		label: "Suchen",
		labeltemplate: "<i class='fa fa-search'></i> {{label}}",
		event: "run",
		cssclass: "runsearch"
	},{
		type: "string",
		name: "simple",
		label: "Simple",
		labeltemplate: "<i class='fa fa-quote-left'></i> <strong>{{label}}</strong> <i class='fa fa-quote-right'></i> ",
		options: [ "frist", "second", "last" ]
	},{
		type: "array",
		name: "multi",
		label: "Array",
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "array",
		name: "array_empty",
		label: "Array Empty",
		count: 0,
		options: []
	},{
		type: "array",
		name: "array_single",
		label: "Array Single",
		custom: false,
		count: 1,
		options: [ "A", "B", "C", "D", "E" ]
	},{
		type: "array",
		name: "array_count",
		label: "Array Count 2",
		count: 2,
		options: [ "A", "B", "C", "D", "E" ]
	},{
		type: "array",
		name: "arraylabel",
		label: "Array Labels",
		options: [ 
			{ value: "m", label: "München" },
			{ value: "hh", label: "Hamburg" },
			{ value: "b", label: "Berlin" },
			{ value: "k", label: "Köln" },
			{ value: "s", label: "Stuttgart" }
		]
	},{
		type: "array",
		name: "arrayasyncopt",
		label: "Array Async Options",
		options: function( currentSelection, facet, cb ){
			//console.log(currentSelection, facet, cb);
			setTimeout( function(){
				cb( [ 
					{ value: "m", label: "München" },
					{ value: "hh", label: "Hamburg" },
					{ value: "b", label: "Berlin" },
					{ value: "k", label: "Köln" },
					{ value: "s", label: "Stuttgart" }
				])
			}, 1000 )
			
		}
	},{
		type: "number",
		name: "number",
		label: "Nummer",
		min: 0,
		max: 999,
		step: 5,
		modify: function( value ){
			return { "mod": value }
		}
	},{
		type: "range",
		name: "range",
		label: "Number Range"
	},{
		type: "select",
		name: "select2multi",
		label: "Select2 Multi",
		multiple: true,
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "select",
		name: "select2single",
		label: "Select2 Single",
		multiple: false,
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "select",
		name: "select2labels",
		label: "Select Labels",
		multiple: true,
		options: [ 
			{ value: "m", label: "München" },
			{ value: "hh", label: "Hamburg" },
			{ value: "b", label: "Berlin" },
			{ value: "k", label: "Köln" },
			{ value: "s", label: "Stuttgart" }
		]
	},{
		type: "select",
		name: "select2groups",
		label: "Select Groups",
		multiple: true,
		options: [ 
			{ value: "usa", label: "United States", group: "America" },
			{ value: "can", label: "Canada", group: "America" },
			{ value: "jp", label: "Japan", group: "Asia" },
			{ value: "cn", label: "China", group: "Asia" },
			{ value: "ger", label: "Germany", group: "Europe" }
		]
	},{
		type: "select",
		name: "select2ajax",
		label: "Select Ajax",
		multiple: true,
		opts: {
			ajax:{
				url: "http://jsonplaceholder.typicode.com/users",
				processResults: function( data ){
					var i, len, user
						ret = [];
					for (i = 0, len = data.length; i < len; i++) {
						user = data[i];
						ret.push( { id: user.id, text: user.name } )

					}
					return {
						results: ret
					};
				}
			}
		}
	},{
		type: "select",
		name: "selectapapter",
		label: "Select Adapter",
		multiple: true,
		//value: [ "custom", "values", "predefined" ],
		opts: {
			dataAdapter: TestAdapter
		}
	},{
		type: "number",
		name: "numberop",
		label: "Nummer-OP",
		min: 0,
		max: 100,
		step: 1,
		operators: [ "!=", "==" ],
		modifyKey: "modified",
		modify: function( value, facet, raw ){
			var _ret = {};
			_ret[ raw.operator ] = value;
			return _ret
		}
	},{
		type: "daterange",
		name: "shipment",
		label: "Select a date(range)",
		opts: {},
		modify: function( value, facet ){
			var name = facet.get( "name" )
			var type = facet.get( "type" )
			var _ret = {};
			_ret[ name + "_start" ] = value[ 0 ];
			if( value[ 1 ] != undefined )
				_ret[ name + "_end" ] = value[ 1 ];
			return _ret
		}
	}]


	iggy1 = newIggy( facets, "#iggytest_regular", { modifyKey: "orgValue" } )
	iggy1.on( "run", function(){ alert( "Fired Event:\n" + JSON.stringify( arguments ) ) } )

	var facetsPredef = [{
		type: "string",
		name: "simple",
		label: "Simple",
		options: [ "frist", "second", "last" ],
		value: "first"
	},{
		type: "select",
		name: "selsingle",
		label: "Select Single",
		options: [ "pizza", "pasta", "carne" ],
		value: [ "pasta", "soup" ]
	},{
		type: "array",
		name: "arraysel",
		label: "Select Array",
		value: "custom",
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "array",
		name: "arrayasyncopt",
		label: "Array Async Options",
		value: [ "m", "hh" ],
		options: function( currentSelection, facet, cb ){
			//console.log(currentSelection, facet, cb);
			setTimeout( function(){
				cb( [ 
					{ value: "m", label: "München" },
					{ value: "hh", label: "Hamburg" },
					{ value: "b", label: "Berlin" },
					{ value: "k", label: "Köln" },
					{ value: "s", label: "Stuttgart" }
				])
			}, 1000 )
			
		}
	},{
		type: "number",
		name: "numberop",
		label: "Nummer-OP",
		min: 0,
		max: 100,
		step: 1,
		operators: [ "!=", "==" ],
		operator: "==",
		value: 42
	},{
		type: "select",
		name: "multi",
		label: "Select Multi",
		multiple: true,
		value: "pizza",
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "select",
		name: "selectapapter",
		label: "Select Adapter",
		multiple: true,
		value: [ "28", "31" ],
		opts: {
			dataAdapter: TestAdapter
		}
	},{
		type: "range",
		name: "range",
		label: "Number Range",
		value: [ 23, 42 ]
	}]

	newIggy( facetsPredef, "#iggytest_predef" )

})
