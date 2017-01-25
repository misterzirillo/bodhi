package bodhi

import grails.util.Environment

class BootStrap {

    def init = { servletContext ->

	    if (Environment.current != Environment.PRODUCTION) {
		    def adminRole = new Role(authority: 'ROLE_ADMIN').save()
		    def userRole = new Role(authority: 'ROLE_USER').save()

		    def adminUser = new User(password: 'changeme', username: 'admin').save()
		    def testUser = new User(password: 'changeme', username: 'test').save()

		    UserRole.create adminUser, adminRole
		    UserRole.create testUser, userRole

		    def testNoteRoot = new NoteRoot(owner: testUser, name: 'Test Notebook').save()
		    def testNote = new NoteNode(content: '# Hi\nI\'m a test note', root: testNoteRoot, leftBound: 0, rightBound: 1)
		    testNoteRoot.nodes << testNote
		    testUser.lastSelectedRoot = testNoteRoot
		    testNoteRoot.lastEditedNote = testNote
		    testUser.save()
		    testNote.save()
		    testNoteRoot.save()

		    UserRole.withSession {
			    it.flush()
			    it.clear()
		    }
	    }
    }
    def destroy = {
    }
}
