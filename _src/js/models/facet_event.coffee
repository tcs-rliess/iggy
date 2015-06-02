class FctEvent extends require( "./facet_base" )
	SubView: null
	onlyExec: true
	defaults: =>
		return $.extend super,
			options: []
		
	exec: ( )=>
		@main.trigger( @get( "event" ), @toJSON() )
		return
module.exports = FctEvent
