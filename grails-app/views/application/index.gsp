<%@ page import="grails.util.Environment" %>
<!doctype html>
<html>
<head>
	<meta name="viewport" content="width=device-width, minimum-scale=1.0">
	<base target="_blank">
	<title>BodhiApp</title>
	<g:if test="${Environment.current != Environment.PRODUCTION}">
		<asset:javascript src="wp-bundle.js"/>
	</g:if>
	<g:else>
		<asset:javascript src="wp-bundle-prod.js" />
	</g:else>
	<asset:stylesheet src="bodhi.css" />
	<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet">
</head>
<body>

<div id="app-root"></div>
<script>
	window.startApp();
</script>

</body>
</html>