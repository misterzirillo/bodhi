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
		    def testNote = new NoteNode(content: '# Hi\nI\'m a test note', root: testNoteRoot, leftBound: 0, rightBound: 3)
		    def testNote2 = new NoteNode(content: '# Hi\nI\'m a child test note', root: testNoteRoot, leftBound: 1, rightBound: 2)
		    def testNote3 = new NoteNode(content: '# Hi\nI\'m an unrelated test note', root: testNoteRoot, leftBound: 4, rightBound: 11)
		    def testNote4 = new NoteNode(content: '# Hi\nI\'m an unrelated test note', root: testNoteRoot, leftBound: 5, rightBound: 10)
		    def testNote5 = new NoteNode(content: '# Hi\nI\'m an unrelated test note', root: testNoteRoot, leftBound: 6, rightBound: 7)
		    def testNote6 = new NoteNode(content: '# Hi\nI\'m an unrelated test note', root: testNoteRoot, leftBound: 8, rightBound: 9)
		    testNoteRoot.nodes.addAll testNote, testNote2, testNote3, testNote4, testNote5, testNote6
		    testUser.lastSelectedRoot = testNoteRoot
		    testNoteRoot.lastEditedNode = testNote
		    [testUser, testNote, testNote2, testNote3, testNote4, testNote5, testNote6, testNoteRoot]*.save()

		    def testNoteRoot2 = new NoteRoot(owner: testUser, name: 'Other notebook').save()
		    def testNote20 = new NoteNode(content: 'other note', root: testNoteRoot2, leftBound: 0, rightBound: 1)
		    testNoteRoot2.lastEditedNode = testNote20
		    [testNoteRoot2, testNote20]*.save()

		    UserRole.withSession {
			    it.flush()
			    it.clear()
		    }
	    }
    }
    def destroy = {
    }
}
