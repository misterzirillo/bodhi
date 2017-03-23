package bodhi

/**
 * bodhi
 * @author mcirillo
 */
class UserRoleController {

	static scaffold = UserRole

	def index() {
		[userRoleList: UserRole.all, userRoleCount: UserRole.count()]
	}

	def show() {
		[userRole: UserRole.findById(params.id)]
	}

	def edit() {
		[userRole: UserRole.findById(params.id)]
	}

	def create() {
		[userRole: new UserRole()]
	}

}
