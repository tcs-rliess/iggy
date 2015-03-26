jQuery( function( $ ){

	var _printQuery = function( data, target ){
		$( target || "#iggytest1_result" ).html( JSON.stringify( data, null, "  " ) );
	}

	function newIggy( facets, _target ){
		var _iggy = new IGGY( $( _target ), facets );
		var _query = _iggy.getQuery()
		_printQuery( _query.toJSON(), _target + "_result" )
		_iggy.on( "change", function( qColl ){
			_printQuery( qColl.toJSON(), _target + "_result" )
		});
	}

	var facets = [{
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
		type: "number",
		name: "numberop",
		label: "Nummer-OP",
		min: 0,
		max: 100,
		step: 1,
		operators: [ "!=", "==" ]
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


	newIggy( facets, "#iggytest_regular" )


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