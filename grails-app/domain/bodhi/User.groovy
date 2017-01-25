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
				def result = User.withCriteria {
					idEq(sss.currentUserId)
					for (def str : eagerLoad) {
						fetchMode str, FetchMode.JOIN
					}
				}
				result[0]
			}
		}
	}

	@RelayField
	NoteRoot lastSelectedRoot

	@RelayField
	Set<NoteRoot> rootNodes
}
