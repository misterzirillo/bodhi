

// Added by the Spring Security Core plugin:
grails.plugin.springsecurity.userLookup.userDomainClassName = 'bodhi.User'
grails.plugin.springsecurity.userLookup.authorityJoinClassName = 'bodhi.UserRole'
grails.plugin.springsecurity.authority.className = 'bodhi.Role'
grails.plugin.springsecurity.logout.postOnly = false
grails.plugin.springsecurity.controllerAnnotations.staticRules = [
	[pattern: '/',               access: ['permitAll']],
	[pattern: '/error',          access: ['permitAll']],
	[pattern: '/index',          access: ['permitAll']],
	[pattern: '/index.gsp',      access: ['permitAll']],
	[pattern: '/shutdown',       access: ['permitAll']],
	[pattern: '/assets/**',      access: ['permitAll']],
	[pattern: '/**/js/**',       access: ['permitAll']],
	[pattern: '/**/css/**',      access: ['permitAll']],
	[pattern: '/**/images/**',   access: ['permitAll']],
	[pattern: '/**/favicon.ico', access: ['permitAll']],
	[pattern: '/graphql/introspect',     access: ['permitAll']],
	[pattern: '/graphql**',     access: ['ROLE_USER']],
	[pattern: '/application/**', access: ['ROLE_USER']],
	[pattern: "/console/**", access: ['ROLE_ADMIN']],
	[pattern: "/static/console/**", access:   ['ROLE_ADMIN']], // Grails 3.x
	[pattern: '/user/**', access: ['ROLE_ADMIN']],
]

grails.plugin.springsecurity.filterChain.chainMap = [
	[pattern: '/assets/**',      filters: 'none'],
	[pattern: '/**/js/**',       filters: 'none'],
	[pattern: '/**/css/**',      filters: 'none'],
	[pattern: '/**/images/**',   filters: 'none'],
	[pattern: '/**/favicon.ico', filters: 'none'],
	[pattern: '/**',             filters: 'JOINED_FILTERS']
]
