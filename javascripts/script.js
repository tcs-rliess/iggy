jQuery( function( $ ){

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
		event: "run",
		cssclass: "runsearch"
	},{
		type: "string",
		name: "simple",
		label: "Simple",
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
		type: "range",
		name: "range",
		label: "Number Range",
		value: [ 23, 42 ]
	}]

	newIggy( facetsPredef, "#iggytest_predef" )

})
