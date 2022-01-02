function createLinks(containerSelection) {

	const cbpfLink = containerSelection.append("a")
		.attr("class", "nav-link small cbpf-link")
		.attr("data-toggle", "tooltip")
		.attr("href", "https://cbpf.data.unocha.org")
		.attr("title", "Click here to navigate to CBPF Data Hub")
		.attr("target", "_blank");

	cbpfLink.append("span")
		.attr("class", "icon-chart")
		.append("i")
		.attr("class", "fas fa-chart-bar");

	cbpfLink.append("span")
		.html("CBPF Data Hub");

	const cerfLink = containerSelection.append("a")
		.attr("class", "nav-link small cerf-link")
		.attr("data-toggle", "tooltip")
		.attr("href", "https://cerf.data.unocha.org/")
		.attr("title", "Click here to navigate to CERF Data Hub")
		.attr("target", "_blank");

	cerfLink.append("span")
		.attr("class", "icon-chart")
		.append("i")
		.attr("class", "fas fa-chart-bar");

	cerfLink.append("span")
		.html("CERF Data Hub");

	$(cbpfLink.node()).tooltip({
		trigger: 'hover'
	});
	$(cerfLink.node()).tooltip({
		trigger: 'hover'
	});

};

export { createLinks };