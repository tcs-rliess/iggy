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
		options: [ "frist", "second", "last" ],
		//value: "first"
	},{
		type: "select",
		name: "selsingle",
		label: "Select Single",
		options: [ "pizza", "pasta", "carne" ],
		//value: [ "pasta", "soup" ]
	},{
		type: "array",
		name: "arraysel",
		label: "Select Array",
		//value: "custom",
		options: [ "pizza", "pasta", "carne" ]
	},{
		type: "array",
		name: "arrayempty",
		label: "Empty Array",
		//value: [ "custom", "values", "predefined" ],
		options: [  ]
	},{
		type: "select",
		name: "multi",
		label: "Select Multi",
		multiple: true,
		//value: "pizza",
		options: [ "pizza", "pasta", "carne" ]
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
		type: "number",
		name: "number",
		label: "Nummer",
		min: null,
		step: 5,
		//value: 42,
		modify: function( value ){
			return { "mod": value }
		}
	},{
		type: "number",
		name: "numberop",
		label: "Nummer-OP",
		min: 0,
		max: 100,
		step: 1,
		//value: 42,
		operator: "!=",
		operators: [ "!=", "==" ]
	},{
		type: "daterange",
		name: "shipment",
		label: "Select a date(range)",
		//value: [ Date.now(), Date.now() + 10000 ],
		opts: {},
		modify: function( value, facet ){
			name = facet.get( "name" )
			type = facet.get( "type" )
			var _ret = {};
			_ret[ name + "_start" ] = moment( value[ 0 ] ).format( "DD.MM.YYYY" );
			if( value[ 1 ] != undefined )
				_ret[ name + "_end" ] = moment( value[ 1 ] ).format( "DD.MM.YYYY" );
			return _ret
		}
	},{
		type: "range",
		name: "range",
		label: "Range",
		min: 0,
		max: 100,
		step: 1,
		//value: [ 10,20 ]
	}]

	newIggy( facets, "#iggytest1" )

	var facets2 = []
	var options = []
	var i, j;
	for (i = j = 0; j <= 50; i = ++j) {
		//options.push( { value: "opt" + i, label: "Option " + i } )
		options.push( "opt" + i )
	}
	for (i = j = 0; j <= 100; i = ++j) {
		facets2.push( {
			type: "select",
			name: "simple" + i,
			label: "Simple " + i,
			multiple: true,
			options: options
		} );
	}

	newIggy( facets2, "#iggytest2" )
})