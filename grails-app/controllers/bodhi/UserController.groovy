package bodhi

/**
 * bodhi
 * @author mcirillo
 */
class UserController {

	static scaffold = User

	def index() {
		def users = User.all
		[userList: users, userCount: users.size()]
	}

	def show() {
		[user: User.findById(params.id)]
	}

	def edit() {
		[user: User.findById(params.id)]
	}

	def create() {
		[user: new User()]
	}
}
