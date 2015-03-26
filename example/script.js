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
		min: null,
		step: 5,
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
		operators: [ "!=", "==" ]
	},{
		type: "daterange",
		name: "shipment",
		label: "Select a date(range)",
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
			type: "string",
			name: "simple" + i,
			label: "Simple " + i,
			options: options
		} );
	}

	newIggy( facets2, "#iggytest2" )
})