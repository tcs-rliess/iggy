class IggyResult extends Backbone.Model
	idAttribute: "name"
	defaults: 
		type: "string"
		name: null
		value: null

class IggyResults extends Backbone.Collection
	model: IggyResult

module.exports = IggyResults