package bodhi

import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import groovy.transform.EqualsAndHashCode
import groovy.transform.ToString
import io.cirill.relay.RelayHelpers
import io.cirill.relay.annotation.RelayField
import io.cirill.relay.annotation.RelayQuery
import io.cirill.relay.annotation.RelayType
import io.cirill.relay.dsl.GQLFieldSpec
import org.hibernate.FetchMode

@EqualsAndHashCode(includes='username')
@ToString(includes='username', includeNames=true, includePackage=false)
@RelayType
class User implements Serializable {

	private static final long serialVersionUID = 1

	transient springSecurityService

	@RelayField
	String username

	String password
	boolean enabled = true
	boolean accountExpired
	boolean accountLocked
	boolean passwordExpired

	Set<Role> getAuthorities() {
		UserRole.findAllByUser(this)*.role
	}

	def beforeInsert() {
		encodePassword()
	}

	def beforeUpdate() {
		if (isDirty('password')) {
			encodePassword()
		}
	}

	protected void encodePassword() {
		password = springSecurityService?.passwordEncoder ? springSecurityService.encodePassword(password) : password
	}

	static transients = ['springSecurityService']

	static constraints = {
		password blank: false, password: true
		username blank: false, unique: true
		lastSelectedRoot nullable: true
	}

	static mapping = {
		password column: '`password`'
		rootNodes sort: 'lastUpdated', order: 'desc'
	}

	static hasMany = [ rootNodes: NoteRoot ]

	@RelayQuery
	static userQuery = {
		GQLFieldSpec.field {
			name 'currentUser'
			description 'The current user'
			type {
				ref 'User'
			}
			dataFetcher { env ->
				def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
				def eagerLoad = RelayHelpers.eagerFetchStrings(env)
				User.withCriteria {
					idEq(sss.currentUserId)
					for (def str : eagerLoad) {
						fetchMode str, FetchMode.JOIN
					}
				}.first()
			}
		}
	}

	@RelayField
	NoteRoot lastSelectedRoot

	@RelayField
	Set<NoteRoot> rootNodes

	void createTutorial() {

		def root =  new NoteRoot(owner: this, name: 'Tutorial', description: 'Introducing Bodhi').save()

		def n1 = new NoteNode(
				content: """![Leaf](https://www.spreadshirt.com/image-server/v1/designs/10094712,width=178,height=178/bodhi-leaf.png)
# Welcome to Bodhi
Bodhi is a handy document organization tool. The purpose of Bodhi is to separate an otherwise linear document into three distinct layers. You can think of each layer as a sub-heading in an outline.

The smallest unit of a Bodhi document is the _leaf_. Each leaf may have a parent, sibling, and child leaves. Related leaves will change color. As you navigate the _tree_ related leaves will move into view.

## Controlling Bodhi
The most efficient way to control Bodhi is with the keyboard (clicking is allowed too). Take a moment to acquaint yourself with the keyboard controls shown in the next leaf.""",
				root: root,
				leftBound: 0,
				rightBound: 3
		).save()

		def n2 = new NoteNode(
				content: """## Controls
- **Up/Down/Left/Right:** Navigate to an adjacent leaf.

- **Ctrl+Enter:** Toggle the editor for the current leaf. When the editor closes the leaf is saved.

- **Ctrl+Shift+Up:** Create a sibling above the current leaf.

- **Ctrl+Shift+Down:** Create a sibling below the current leaf.

- **Ctrl+Shift+Right:** Create a child leaf.

### Try it
Navigate to this leaf then create a child leaf with __Ctrl+Shift+Right__. Edit the leaf with __Ctrl-Enter__.

### Markdown
Markdown is a simple way to format plain text. Edit this leaf to see some example Markdown. A full Markdown tutorial can be found [here](https://guides.github.com/features/mastering-markdown/).""",
				root: root,
				leftBound: 1,
				rightBound: 2
		).save()

		def n3 = new NoteNode(
				content: """### Credits
A __big__ thanks to the authors of the following technologies for making this project possible:

- [react](https://facebook.github.io/react/) - props to Facebook's React team for consuming more of my time than the social network itself
- [relay](https://facebook.github.io/relay/)
- [react-remarkable](https://github.com/acdlite/react-remarkable)
- [react-hotkeys](https://github.com/chrisui/react-hotkeys)
- [grails](https://github.com/grails)
- [relay-gorm-connector](https://github.com/mrcirillo/relay-gorm-connector) - shameless plug of my supporting project for Grails and GraphQL/Relay""",
				root: root,
				leftBound: 4,
				rightBound: 5
		)

		root.nodes = [n1, n2, n3]
		root.lastEditedNode = n1
		lastSelectedRoot = root
		save()
	}
}
