jQuery( function( $ ){

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
		type: "number",
		name: "numberop",
		label: "Nummer-OP",
		min: 0,
		max: 100,
		step: 1,
		operators: [ "!=", "==" ]
	}]

	var _iggy = new IGGY( $( "#iggytest1" ), facets );

	var _query = _iggy.getQuery()
	
	var _printQuery = function( data, target ){
		$( target ? target : "#iggytest1_result" ).html( JSON.stringify( data, null, "	" ) );
	}
	//_printQuery( facets, "#iggytest1_config" );
	_printQuery( _query.toJSON() )


	_iggy.on( "change", function( qColl ){
		_printQuery( qColl.toJSON() )
	});
})