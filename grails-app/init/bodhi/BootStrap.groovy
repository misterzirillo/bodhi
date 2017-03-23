package bodhi

import grails.util.Environment

class BootStrap {

    def init = { servletContext ->

	    if (User.count() < 1) {
		    def adminRole = new Role(authority: 'ROLE_ADMIN').save()
		    def userRole = new Role(authority: 'ROLE_USER').save()

		    def adminUser = new User(password: 'changeme', username: 'admin').save()
		    def testUser = new User(password: 'changeme', username: 'testuser').save()

		    UserRole.create adminUser, adminRole
		    UserRole.create testUser, userRole

		    //testUser.createTutorial()

		    UserRole.withSession {
			    it.flush()
			    it.clear()
		    }
	    }
    }
    def destroy = {
    }
}
