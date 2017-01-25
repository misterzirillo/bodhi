package bodhi

class UrlMappings {

    static mappings = {
	    "/$controller/$action?/$id?"{
		    constraints {

		    }
	    }

	    "/graphql"(controller: 'graphql', action: 'index')

        "/"(view: '/index')
        "500"(view: '/error')
        "404"(view: '/notFound')
    }
}
