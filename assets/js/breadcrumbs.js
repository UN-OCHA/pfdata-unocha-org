const generalClassPrefix = "pfbihp";

function createBreadcrumbs(containerSelection, firstValue) {

	const breadcrumbDiv = containerSelection.append("div")
		.attr("class", generalClassPrefix + "breadcrumbDiv");

	const breadcrumbDivInner = breadcrumbDiv.append("div")
		.attr("class", generalClassPrefix + "breadcrumbDivInner");

	const firstBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", generalClassPrefix + "firstBreadcrumb");

	firstBreadcrumb.append("span")
		.html(firstValue);

	const middleBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", generalClassPrefix + "middleBreadcrumb");

	const secondBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", generalClassPrefix + "secondBreadcrumb");

	const secondBreadcrumbSpan = secondBreadcrumb.append("span");

	return { breadcrumbDiv, secondBreadcrumbSpan, firstBreadcrumb };

};

export { createBreadcrumbs };