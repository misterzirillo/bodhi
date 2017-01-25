package bodhi

import grails.core.GrailsApplication
import grails.plugin.springsecurity.annotation.Secured
import grails.plugins.*


class ApplicationController implements PluginManagerAware {

	GrailsApplication grailsApplication
	GrailsPluginManager pluginManager

	@Secured('ROLE_USER')
	def index() {}

}
