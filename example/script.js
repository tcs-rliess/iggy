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
		cssclass: "runsearch",
		sort: 99
		//value: "first"
	},{
		type: "string",
		name: "simple",
		label: "Simple",
		labeltemplate: "<i class='fa fa-quote-left'></i> <strong>{{label}}</strong> <i class='fa fa-quote-right'></i> ",
		options: [ "frist", "second", "last" ],
		//value: "first"
	},{
		type: "string",
		name: "simple_pinned",
		label: "Simple Pinned",
		pinned: true
	},{
		type: "array",
		name: "arraysel",
		label: "Array Select",
		//value: "custom",
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "array",
		name: "arrayselsingle",
		label: "Array Select Single",
		count: 1,
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "array",
		name: "arrayselsingle_pinned",
		label: "Array Select Single",
		count: 1,
		options: [ "pizza", "pasta", "carne" ],
		pinned: true
	},{
		type: "array",
		name: "arrayseltwo",
		label: "Array Select Two",
		count: 2,
		options: [ "a", "b", "c", "d" ],
		pinned: true
	},{
		type: "array",
		name: "arrayempty",
		label: "Array Empty",
		//value: [ "custom", "values", "predefined" ],
		options: [  ]
	},{
		type: "array",
		name: "arraylabels",
		label: "AA Array Labels",
		custom: false,
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
		type: "select",
		name: "selsingle",
		label: "Select Single",
		options: [ "pizza", "pasta", "carne" ],
		//value: [ "pasta", "soup" ]
	},{
		type: "select",
		name: "selsingle_pinned",
		label: "Select Single",
		options: [ "pizza", "pasta", "carne" ],
		pinned: true
		//value: [ "pasta", "soup" ]
	},{
		type: "select",
		name: "multi",
		label: "Select Multi",
		multiple: true,
		//value: "pizza",
		opts: {
			width: 200
		},
		options: [
			{ value: "m", label: "München" },
			{ value: "hh", label: "Hamburg" },
			{ value: "b", label: "Berlin" },
			{ value: "k", label: "Köln" },
			{ value: "s", label: "Stuttgart" }
		]
	},{
		type: "select",
		name: "multi_pinned",
		label: "Select Multi",
		multiple: true,
		//value: "pizza",
		opts: {
			width: 200
		},
		options: [
			{ value: "m", label: "München" },
			{ value: "hh", label: "Hamburg" },
			{ value: "b", label: "Berlin" },
			{ value: "k", label: "Köln" },
			{ value: "s", label: "Stuttgart" }
		],
		pinned: true
	},{
		type: "select",
		name: "issue45",
		label: "Issue 45",
		multiple: false,
		sort: 1,
		options: [
			{ value: 1, label: "München" },
			{ value: 2, label: "Hamburg" },
			{ value: 3, label: "Berlin" },
			{ value: 4, label: "Köln" },
			{ value: 5, label: "Stuttgart" }
		]
	},{
		type: "select",
		name: "issue45b",
		label: "Issue 45 B",
		multiple: false,
		sort: 2,
		options: [
			{ value: "m", label: "München" },
			{ value: "hh", label: "Hamburg" },
			{ value: "b", label: "Berlin" },
			{ value: 1, label: "Köln" },
			{ value: "s", label: "Stuttgart" }
		]
	},{
		type: "select",
		name: "issue45c",
		label: "Issue 45 C",
		multiple: true,
		sort: 3,
		opts: {
			dataAdapter: TestAdapter
		}
	},{
		type: "select",
		name: "multigroup",
		label: "Select Multi Group",
		multiple: true,
		//value: "pizza",
		options: [
			{ value: "usa", label: "United States", group: "America" },
			{ value: "can", label: "Canada", group: "America" },
			{ value: "jp", label: "Japan", group: "Asia" },
			{ value: "cn", label: "China", group: "Asia" },
			{ value: "ger", label: "Germany", group: "Europe" }
		]
	},{
		type: "select",
		name: "selectcustom",
		label: "Select Custom",
		multiple: true,
		//value: [ "custom", "values", "predefined" ],
		opts: {
			tags: true
		}
	},{
		type: "select",
		name: "selectajax",
		label: "Select Ajax",
		multiple: true,
		//value: [ "custom", "values", "predefined" ],
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
		name: "number",
		label: "Nummer",
		min: null,
		step: 5,
		//value: 42,
		modify: function( value ){
			return { "mod": value }
		},
		sort: 1
	},{
		type: "number",
		name: "numberop",
		label: "Nummer-OP",
		min: 0,
		max: 100,
		step: 1,
		sort: 10,
		//value: 42,
		operator: "!=",
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
		//value: [ Date.now(), Date.now() + 10000 ],
		opts: {},
		modify: function( value, facet ){
			var name = facet.get( "name" )
			var type = facet.get( "type" )
			var _ret = {};
			_ret[ name + "_start" ] = moment( value[ 0 ] ).format( "DD.MM.YYYY" );
			if( value[ 1 ] != undefined )
				_ret[ name + "_end" ] = moment( value[ 1 ] ).format( "DD.MM.YYYY" );
			return _ret
		}
	},{
		type: "daterange",
		label: "Date custom",
		name: "datecustom",
		opts: {
			format: "DD.MM.YYYY",
			showWeekNumbers : true,
			showDropdowns : true,
			timePicker: false,
			parentEl: this.$el,
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'day'), moment().subtract(1, 'day')],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
				'Last 7 Days': [moment().subtract(6, 'day'), moment()],
				'Last 30 Days': [moment().subtract(29, 'day'), moment()],
				'Last 90 Days': [moment().subtract(89, 'day'), moment()]
			}
		}
	},{
		type: "range",
		name: "range",
		label: "Range",
		min: 0,
		max: 100,
		step: 1,
		//value: [ 10,20 ]
	},{
		type: "daterange",
		name: "issue55",
		label: "daterange55",
		value: [moment().add( -4, "d" ).valueOf(), moment().add( 4, "d" ).valueOf() ],
	},{
		type: "daterange",
		name: "issue55_frmt",
		label: "daterange55_frmt",
		dateformat: "DD [foo] MMM [bar] YY",
		value: [moment().add( -4, "d" ).format( "DD [foo] MMM [bar] YY" ), moment().add( 4, "d" ).format( "DD [foo] MMM [bar] YY" ) ],
	}]

	var opts1 = {
		modifyKey: "orgValue",
		dir: "asc",
		sortby: "label",
		searchButton: {
			template: "<i class='fa fa-search'></i> Search!",
			event: "search",
			pullright: false,
			cssclass: "red-search"
		}
	}


	iggy1 = newIggy( facets, "#iggytest1", opts1 )
	iggy1.on( "run", function(){ alert( "Fired Event:\n" + JSON.stringify( arguments ) ) } )
	iggy1.on( "search", function(){ alert( "Fired Search Event:\n" + JSON.stringify( arguments ) ) } )

	var facets2 = []
	var options = []
	var i, j;
	for (i = j = 0; j <= 50; i = ++j) {
		//options.push( { value: "opt" + i, label: "Option " + i } )
		options.push( "opt" + i )
	}
	for (i = j = 0; j <= 100; i = ++j) {
		var _name = "simple";
		if( i < 10 ){
			_name += "0";
		}
		if( i < 100 ){
			_name += "0";
		}
		_name += i;
		facets2.push( {
			type: j % 2 === 0 ? "array" : "select",
			name: _name,
			label: "Simple " + i,
			multiple: true,
			options: options
		} );
	}

	newIggy( facets2, "#iggytest2" )

	var facetsPredef = [{
		type: "string",
		name: "string",
		label: "Simple",
		options: [ "frist", "second", "last" ],
		value: "first"
	},{
		type: "select",
		name: "select_single",
		label: "Select Single",
		options: [ "pizza", "pasta", "carne" ],
		value: [ "pasta", "soup" ]
	},{
		type: "array",
		name: "select_array",
		label: "Select Array",
		value: "custom",
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "array",
		name: "select_array_multi",
		label: "Select Array Multi",
		custom: false,
		value: [ "pizza", "carne" ],
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "array",
		name: "select_array_single",
		label: "Select Array Single",
		custom: false,
		count: 1,
		value: [ "pizza", "carne" ],
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
		name: "numbersimple",
		label: "Number-Simple",
		value: 23
	},{
		type: "number",
		name: "numberop",
		label: "Number-OP",
		min: 0,
		max: 100,
		step: 1,
		operators: [ "!=", "==" ],
		operator: "==",
		value: 42
	},{
		type: "select",
		name: "select_multi",
		label: "Select Multi",
		multiple: true,
		value: "pizza",
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "range",
		name: "range",
		label: "Number Range",
		value: [ 23, 42 ]
	},{
		type: "select",
		name: "selectajax",
		label: "Select Ajax",
		multiple: true,
		value: [ "2", "3" ],
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
		value: [ "28", "31" ],
		opts: {
			dataAdapter: TestAdapter
		}
	},{
		type: "select",
		name: "select_group",
		label: "Select Multi Group",
		multiple: true,
		value: "ger",
		options: [
			{ value: "usa", label: "United States", group: "America" },
			{ value: "can", label: "Canada", group: "America" },
			{ value: "jp", label: "Japan", group: "Asia" },
			{ value: "cn", label: "China", group: "Asia" },
			{ value: "ger", label: "Germany", group: "Europe" }
		]
	},{
		type: "select",
		name: "select_group_int",
		label: "Select Multi Group Int",
		multiple: true,
		value: [66,13,1,"666"],
		options: [
			{ value: 1, label: "One", group: "Int" },
			{ value: 2, label: "Two", group: "Int" },
			{ value: 13, label: "Unlucky...", group: "Fun" },
			{ value: 23, label: "Hack it!", group: "Fun" },
			{ value: 42, label: "The answer", group: "Fun" },
			{ value: 666, label: "Evil!", group: "Fun" }
		]
	},{
		type: "select",
		name: "select_int",
		label: "Select Multi Int",
		multiple: true,
		value: [13,23],
		options: [
			{ value: 1, label: "One" },
			{ value: 2, label: "Two" },
			{ value: 13, label: "Unlucky..." },
			{ value: 23, label: "Hack it!" },
			{ value: 42, label: "The answer" },
			{ value: 666, label: "Evil!" }
		]
	},{
		type: "daterange",
		label: "Date custom",
		name: "datecustom",
		value: [moment().startOf('week'), moment().add(2,"month").endOf('month')],
		opts: {
			format: "DD.MM.YYYY",
			showWeekNumbers : true,
			showDropdowns : true,
			timePicker: false,
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'day'), moment().subtract(1, 'day')],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
				'Last 7 Days': [moment().subtract(6, 'day'), moment()],
				'Last 30 Days': [moment().subtract(29, 'day'), moment()],
				'Last 90 Days': [moment().subtract(89, 'day'), moment()]
			}
		}
	}]
	var opts3 = {
		searchButton: {
			template: "<i class='fa fa-search'></i>",
			event: "search",
			pullright: true
		}
	}
	newIggy( facetsPredef, "#iggytest3", opts3 )
})
