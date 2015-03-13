jQuery( function( $ ){

	var facets = [{
		type: "string",
		name: "simple",
		label: "Simple select or text",
		options: [ "frist", "second", "last" ]
	},{
		type: "array",
		name: "multi",
		label: "Multiple",
		options: [ "pizza", "pasta", "carne" ]
	}]

	new IGGY( $( "#iggytest1" ), facets )
})