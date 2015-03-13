describe "MAIN TEST'S", ->

	describe "init el", ->

		it "Namespace IGGY exists", ->
			Should.exist( IGGY )
			return

		it "test for target element", ->
			Should.equal( $( "#iggytarget" ).length, 1 )
			return

		it "init IGGY without `el`", ->
			try
				new IGGY(  )
				throw "should fail!"
			catch err
				Should( err.name ).equal( "EMISSINGEL" )
			return

		it "init IGGY by empty string", ->
			try
				new IGGY( "" )
				throw "should fail!"
			catch err
				Should( err.name ).equal( "EEMPTYELSTRING" )
			return

		it "init IGGY as string invalid", ->
			try
				new IGGY( "#nonsense" )
				throw "should fail!"
			catch err
				Should( err.name ).equal( "EINVALIDELSTRING" )
			return

		it "init iggy with invalid jQuery", ->
			try
				new IGGY( $( "#nonsense" ) )
				throw "should fail!"
			catch err
				Should( err.name ).equal( "EEMPTYELJQUERY" )
			return



		it "init iggy with invalid el type number", ->
			try
				new IGGY( 1 )
				throw "should fail!"
			catch err
				Should( err.name ).equal( "EINVALIDELTYPE" )
			return

		it "init iggy with invalid el type array", ->
			try
				new IGGY( [1,2,3] )
				throw "should fail!"
			catch err
				Should( err.name ).equal( "EINVALIDELTYPE" )
			return

		it "init iggy by selector", ->
			new IGGY( "#iggytarget" )
			return

		it "init iggy by dom element", ->
			new IGGY( document.getElementById( "iggytarget" ) )
			return

		it "init iggy by jQuery", ->
			new IGGY( $( "#iggytarget" ) )
			return

		return

	describe "init facets", ->

		fasets = [
			type: "string"
			name: "simple"
			label: "Simple select or text"
			options: [ "a", "b", "c" ]
		]

		it "init iggy by jQuery", ->
			new IGGY( $( "#iggytarget" ), fasets )
			return

		it "check if iggy exists", ->
			Should.equal( $( "#iggytarget .iggy" ).length, 1 )
			return

			
		return
	return
