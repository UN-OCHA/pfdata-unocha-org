(function fallbackLibraries() {

	/*
	Loading scripts and other resources locally when CDNs fail.
	Javascript external resources used by the page:

	1. d3
	2. jQuery
	3. topojson
	4. bootstrap
	5. font awesome
	6. jspdf
	
	Bootstrap is not being checked because it depends on jQuery.
	Fontawesome is not being checked because it changes CSS only

	CSS external resources used:
	1. Bootstrap
	2. Font Awesome
	*/

	const head = document.getElementsByTagName('head')[0];

	const externalResources = [{
		name: "d3",
		version: "7.3.0",
		objectName: "d3",
		localLink: "assets/libs/d3.min.js"
	}, {
		name: "jQuery",
		version: "3.5.1",
		objectName: "jQuery",
		localLink: "assets/libs/jquery.min.js"
	}, {
		name: "topojson",
		version: "3.0.2",
		objectName: "topojson",
		localLink: "assets/libs/topojson.min.js"
	}, {
		name: "jsPdf",
		version: "1.5.3",
		objectName: "jsPDF",
		localLink: "assets/libs/jspdf.min.js"
	}];

	externalResources.forEach(resource => {
		const loaded = !!window[resource.objectName];
		if (!loaded) {
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = resource.localLink;
			head.appendChild(script);
			console.warn(`Fallback: ${resource.name} version ${resource.version} loaded from local copy`);
		};
	});

})();