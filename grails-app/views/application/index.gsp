<%@ page import="grails.util.Environment" %>
<!doctype html>
<html>
<head>
	<title>BodhiApp</title>
	<g:if test="${Environment.current != Environment.PRODUCTION}">
		<asset:javascript src="wp-bundle.js"/>
	</g:if>
	<g:else>
		<asset:javascript src="wp-bundle-prod.js" />
	</g:else>
	<asset:stylesheet src="bodhi.css" />
</head>
<body>

<div id="app-root"></div>
<script>
	window.startApp();
</script>

</body>
</html>