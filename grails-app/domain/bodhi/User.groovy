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
class User implements Serializable, AddRootMutation {

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
				content: this.class.classLoader.getResourceAsStream("tutorial1.md").readLines().join('\n'),
				root: root,
				leftBound: 0,
				rightBound: 3
		).save()

		def n2 = new NoteNode(
				content: this.class.classLoader.getResourceAsStream("tutorial2.md").readLines().join('\n'),
				root: root,
				leftBound: 1,
				rightBound: 2
		).save()

		def n3 = new NoteNode(
				content: this.class.classLoader.getResourceAsStream("tutorial3.md").readLines().join('\n'),
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
