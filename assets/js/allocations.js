//|Allocations module
import { chartState } from "./chartstate.js";
import { clustersIconsData } from "./clustersiconsdata.js";
import { createLinks } from "./links.js";
import { createBreadcrumbs } from "./breadcrumbs.js";

//|constants
const classPrefix = "pfbial",
	mapPercentage = 0.68,
	barChartPercentage = 1 - mapPercentage,
	mapAspectRatio = 2.225,
	legendPanelHeight = 132,
	legendPanelWidth = 110,
	legendPanelHorPadding = 44,
	legendPanelVertPadding = 32,
	legendTextPadding = 18,
	mapZoomButtonHorPadding = 48,
	mapZoomButtonVertPadding = 10,
	mapZoomButtonSize = 26,
	maxPieSize = 26,
	minPieSize = 1,
	maxColumnRectHeight = 14,
	tooltipMargin = 4,
	legendLineSize = 38,
	showNamesMargin = 12,
	duration = 1000,
	timeoutDuration = 50,
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5,
	groupNamePadding = 2,
	barWidth = 36,
	fadeOpacity = 0.35,
	maxLabelLength = 16,
	labelsColumnPadding = 2,
	zoomBoundingMargin = 6,
	clusterIconSize = 24,
	clusterIconPadding = 2,
	localVariable = d3.local(),
	formatPercent = d3.format("%"),
	formatSIaxes = d3.format("~s"),
	formatMoney0Decimals = d3.format(",.0f"),
	innerTooltipDivWidth = 290,
	svgColumnChartWidth = 195,
	svgColumnChartHeight = 500,
	svgMapPadding = [0, 10, 0, 10],
	svgBarChartPadding = [4, 12, 4, 12],
	svgColumnChartPaddingByCountry = [16, 26, 4, 56],
	svgColumnChartPaddingBySector = [16, 26, 4, 90],
	svgColumnChartPaddingByType = [16, 26, 4, 66],
	svgColumnChartTypeHeight = svgColumnChartPaddingByType[0] + svgColumnChartPaddingByType[2] + maxColumnRectHeight + 4 * maxColumnRectHeight,
	VenezuelaRegionalRefugeeAbbr = "Venezuela Refugee...",
	VenezuelaRegionalRefugeeDisclaimer = "*Venezuela RRMC - Venezuela Regional Refugee and Migration Crisis: A regional CERF Underfunded Emergencies allocation supported responses to the Venezuelan Refugee and Migrant Crisis in Brazil, Colombia, Ecuador and Peru.",
	separator = "##",
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	stackKeys = ["total", "cerf", "cbpf"],
	cbpfAllocationTypes = ["1", "2"], //THIS SHOULD NOT BE HARDCODED
	cerfAllocationTypes = ["3", "4"], //THIS SHOULD NOT BE HARDCODED
	centroids = {};

//|variables
let svgMapWidth,
	svgMapHeight,
	allocationsProperty,
	hoveredCountry,
	showCovidDisclaimer = true,
	covid19InCluster = false,
	clickableButtons = true,
	mouseoverBarsColumnTimeout;

//|hardcoded locations
const hardcodedAllocations = [{
	isoCode: "0E",
	long: 36.84,
	lat: -1.28
}, {
	isoCode: "0G",
	long: -73.96,
	lat: 40.75
}, {
	isoCode: "0V",
	long: -66.85,
	lat: 1.23
}];

function createAllocations(selections, colors, mapData, lists) {

	d3.select("#pfbihpPlayButton")
		.property("disabled", false);

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	const breadcrumb = createBreadcrumbs(outerDiv, "allocations");

	const topButtonsDiv = breadcrumb.breadcrumbDiv.append("div")
		.attr("data-html2canvas-ignore", "true")
		.attr("class", classPrefix + "topButtonsDiv");

	createLinks(topButtonsDiv);

	const containerDiv = outerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const mapDiv = containerDiv.append("div")
		.attr("class", classPrefix + "mapDiv");

	const tooltipDivMap = mapDiv.append("div")
		.attr("id", classPrefix + "tooltipDivMap")
		.style("display", "none");

	const barChartDivOuter = containerDiv.append("div")
		.attr("class", classPrefix + "barChartDivOuter")
		.style("height", formatPercent(barChartPercentage));

	const venezuelaDisclaimerDiv = barChartDivOuter.append("div")
		.attr("class", classPrefix + "venezuelaDisclaimerDiv")
		.html(VenezuelaRegionalRefugeeDisclaimer);

	const barChartDivTitle = barChartDivOuter.append("div")
		.attr("class", classPrefix + "barChartDivTitle");

	const barChartDivTitleText = barChartDivTitle.append("div")
		.attr("class", classPrefix + "barChartDivTitleText")
		.style("border-bottom", "2px solid " + (chartState.selectedFund === "cerf/cbpf" ? colors.cerf : colors[chartState.selectedFund]));

	const barChartDiv = barChartDivOuter.append("div")
		.attr("class", classPrefix + "barChartDiv");

	const tooltipDivBarChart = barChartDiv.append("div")
		.attr("id", classPrefix + "tooltipDivBarChart")
		.style("display", "none");

	const buttonsDiv = mapDiv.append("div")
		.attr("class", classPrefix + "buttonsDiv");

	const covidDisclaimer = barChartDivOuter.append("div")
		.attr("class", classPrefix + "covidDisclaimer")
		.style("display", "none");

	const covidDisclaimerTopDiv = covidDisclaimer.append("div")
		.attr("class", classPrefix + "covidDisclaimerTopDiv")
		.style("width", "100%");

	const covidDisclaimerTopDivMain = covidDisclaimerTopDiv.append("div")
		.attr("class", classPrefix + "covidDisclaimerTopDivMain")
		.append("b")
		.html("Disclaimer:")

	const covidDisclaimerTopDivClose = covidDisclaimerTopDiv.append("div")
		.attr("class", classPrefix + "covidDisclaimerTopDivClose")
		.on("click", () => {
			showCovidDisclaimer = false;
			covidDisclaimer.remove()
		});

	covidDisclaimerTopDivClose.append("i")
		.attr("class", "far fa-window-close")
		.style("cursor", "pointer");

	const covidDisclaimerDivMain = covidDisclaimer.append("div")
		.attr("class", classPrefix + "covidDisclaimerDivMain")
		.append("p")
		.html("A temporary COVID-19 cluster was established in four countries while the Global HRP to COVID-19 was being released. Funding and people targeted within the temporary COVID-19 cluster do not include the whole CBPF response to COVID-19. Comprehensive data and information on CBPFs response to COVID-19 can be found here <a href='https://pfdata.unocha.org/COVID19/' target='_blank'>https://pfdata.unocha.org/COVID19/</a><br>");

	chartState.currentTooltip = tooltipDivMap;

	const columnChartContainerByCountry = selections.byCountryChartContainer;
	const columnChartContainerBySector = selections.bySectorChartContainer;
	const columnChartContainerByTypeCerf = selections.byTypeCerfChartContainer;
	const columnChartContainerByTypeCbpf = selections.byTypeCbpfChartContainer;

	columnChartContainerByCountry.html(null);
	columnChartContainerBySector.html(null);
	columnChartContainerByTypeCerf.html(null);
	columnChartContainerByTypeCbpf.html(null);

	const svgColumnChartByCountry = columnChartContainerByCountry.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	const svgColumnChartBySector = columnChartContainerBySector.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	const svgColumnChartByTypeCerf = columnChartContainerByTypeCerf.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartTypeHeight);

	const svgColumnChartByTypeCbpf = columnChartContainerByTypeCbpf.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartTypeHeight);

	const mapDivSize = mapDiv.node().getBoundingClientRect();
	const barChartDivSize = barChartDiv.node().getBoundingClientRect();
	const svgMapHeight = mapDivSize.height;
	const svgMapWidth = mapDivSize.width;
	const svgBarChartWidth = barChartDivSize.width;
	const svgBarChartHeight = barChartDivSize.height;
	const svgMapPanelWidth = svgMapWidth / svgMapHeight < mapAspectRatio ? svgMapWidth - svgMapPadding[1] - svgMapPadding[3] :
		(svgMapHeight * mapAspectRatio) - svgMapPadding[1] - svgMapPadding[3];

	const mapInnerDiv = mapDiv.append("div")
		.attr("class", classPrefix + "mapInnerDiv");

	const svgMap = mapInnerDiv.append("svg")
		.attr("width", svgMapWidth)
		.attr("height", svgMapHeight);
	//.attr("viewBox", "0 0 " + svgMapWidth + " " + svgMapHeight);

	//FIX THE ASPECT RATIO! The width should be CONSTANT

	const svgBarChart = barChartDiv.append("svg")
		.attr("width", svgBarChartWidth)
		.attr("height", svgBarChartHeight);
	//.attr("viewBox", "0 0 " + svgBarChartWidth + " " + svgBarChartHeight);

	const zoomLayer = svgMap.append("g")
		.attr("class", classPrefix + "zoomLayer")
		.style("opacity", 0)
		.attr("cursor", "move")
		.attr("pointer-events", "all");

	const mapPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + (svgMapWidth - svgMapPadding[1] - svgMapPadding[3] - svgMapPanelWidth) / 2) + "," + svgMapPadding[0] + ")"),
		width: svgMapPanelWidth,
		height: (svgMapHeight * mapPercentage) - svgMapPadding[0] - svgMapPadding[2],
		padding: [0, 0, 0, 0]
	};

	const legendPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "legendPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + legendPanelHorPadding) + "," + (svgMapPadding[0] + mapPanel.height - legendPanelHeight - legendPanelVertPadding) + ")"),
		width: legendPanelWidth,
		height: legendPanelHeight,
		padding: [30, 0, 20, 4]
	};

	const mapZoomButtonPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "mapZoomButtonPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + mapZoomButtonHorPadding) + "," + (svgMapPadding[0] + mapZoomButtonVertPadding) + ")"),
		width: mapZoomButtonSize,
		height: mapZoomButtonSize * 2,
		padding: [4, 4, 4, 4]
	};

	const checkboxesPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "checkboxesPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + mapZoomButtonHorPadding + 1) + "," + (svgMapPadding[0] + mapZoomButtonVertPadding + mapZoomButtonPanel.height + showNamesMargin) + ")"),
		padding: [0, 0, 0, 0]
	};

	const barChartPanel = {
		main: svgBarChart.append("g")
			.attr("class", classPrefix + "barChartPanel")
			.attr("transform", "translate(" + svgBarChartPadding[3] + "," + svgBarChartPadding[0] + ")"),
		width: svgBarChartWidth - svgBarChartPadding[3] - svgBarChartPadding[1],
		height: svgBarChartHeight - svgBarChartPadding[2] - svgBarChartPadding[0],
		padding: [14, 0, 62, 32],
		labelsPadding: 3
	};

	const mapContainer = mapPanel.main.append("g")
		.attr("class", classPrefix + "mapContainer");

	const zoomRectangle = zoomLayer.append("rect")
		.attr("width", svgMapWidth)
		.attr("height", svgMapHeight);

	const piesContainer = mapPanel.main.append("g")
		.attr("class", classPrefix + "piesContainer");

	const mapProjection = d3.geoEqualEarth();

	const mapPath = d3.geoPath()
		.projection(mapProjection);

	const breadcrumbScale = d3.scaleOrdinal()
		.domain(["allocationsByCountry", "allocationsBySector", "allocationsByType"])
		.range(["by country", "by sector", "by allocation type"]);

	const radiusScale = d3.scaleSqrt()
		.range([minPieSize, maxPieSize]);

	const xScale = d3.scaleBand()
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScale = d3.scaleLinear()
		.range([barChartPanel.height - barChartPanel.padding[2], barChartPanel.padding[0]]);

	const xScaleColumnByCountry = d3.scaleLinear()
		.range([svgColumnChartPaddingByCountry[3], svgColumnChartWidth - svgColumnChartPaddingByCountry[1]]);

	const yScaleColumnByCountry = d3.scaleBand()
		.range([svgColumnChartPaddingByCountry[0], svgColumnChartHeight - svgColumnChartPaddingByCountry[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const xScaleColumnBySector = d3.scaleLinear()
		.range([svgColumnChartPaddingBySector[3], svgColumnChartWidth - svgColumnChartPaddingBySector[1]]);

	const yScaleColumnBySector = d3.scaleBand()
		.range([svgColumnChartPaddingBySector[0], svgColumnChartHeight - svgColumnChartPaddingBySector[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const xScaleColumnByType = d3.scaleLinear()
		.range([svgColumnChartPaddingByType[3], svgColumnChartWidth - svgColumnChartPaddingByType[1]]);

	const yScaleColumnByTypeCerf = d3.scaleBand()
		.range([svgColumnChartPaddingByType[0], svgColumnChartTypeHeight - svgColumnChartPaddingByType[2]])
		.domain(cerfAllocationTypes.map(e => lists.allocationTypesList[e]))
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScaleColumnByTypeCbpf = d3.scaleBand()
		.range([svgColumnChartPaddingByType[0], svgColumnChartTypeHeight - svgColumnChartPaddingByType[2]])
		.domain(cbpfAllocationTypes.map(e => lists.allocationTypesList[e]))
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const clusterNamesScale = d3.scaleOrdinal()
		.domain(["Food Security",
			"Health",
			"Emergency Shelter and NFI",
			"Water Sanitation Hygiene",
			"Protection",
			"Nutrition",
			"Logistics",
			"Education",
			"COVID-19",
			"Coordination and Support Services",
			"Camp Coordination / Management",
			"Early Recovery",
			"Multi-Sector",
			"Multi-purpose cash (not sector-specific)",
			"Emergency Telecommunications",
			"Mine Action"
		])
		.range(["Food Security",
			"Health",
			"Shelter",
			"Water",
			"Protection",
			"Nutrition",
			"Logistics",
			"Education",
			"COVID-19",
			"Coordination",
			"Camp Coordination",
			"Early Recovery",
			"Multi-Sector",
			"Multi-purpose",
			"Emergency Telecom.",
			"Mine Action"
		]);

	const arcGenerator = d3.arc()
		.innerRadius(0);

	const arcGeneratorEnter = d3.arc()
		.innerRadius(0)
		.outerRadius(0);

	const pieGenerator = d3.pie()
		.value(d => d.value)
		.sort(null);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.tickSize(3)
		.tickFormat(d => lists.fundAbbreviatedNamesList[d] === "Venezuela Regional Refugee and Migration Crisis" ?
			VenezuelaRegionalRefugeeAbbr : lists.fundAbbreviatedNamesList[d]);

	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const xAxisColumnByCountry = d3.axisTop(xScaleColumnByCountry)
		.tickSizeOuter(0)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumnByCountry = d3.axisLeft(yScaleColumnByCountry)
		.tickSize(4);

	const xAxisColumnBySector = d3.axisTop(xScaleColumnBySector)
		.tickSizeOuter(0)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumnBySector = d3.axisLeft(yScaleColumnBySector)
		.tickPadding(clusterIconSize + 2 * clusterIconPadding)
		.tickSize(3);

	const xAxisColumnByType = d3.axisTop(xScaleColumnByType)
		.tickSizeOuter(0)
		.tickSizeInner(-(svgColumnChartTypeHeight - svgColumnChartPaddingByType[2] - svgColumnChartPaddingByType[0]))
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumnByTypeCerf = d3.axisLeft(yScaleColumnByTypeCerf)
		.tickSize(4);

	const yAxisColumnByTypeCbpf = d3.axisLeft(yScaleColumnByTypeCbpf)
		.tickSize(4);

	const xAxisGroup = barChartPanel.main.append("g")
		.attr("class", classPrefix + "xAxisGroup")
		.attr("transform", "translate(0," + (barChartPanel.height - barChartPanel.padding[2]) + ")");

	const yAxisGroup = barChartPanel.main.append("g")
		.attr("class", classPrefix + "yAxisGroup")
		.attr("transform", "translate(" + barChartPanel.padding[3] + ",0)");

	const xAxisGroupColumnByCountry = svgColumnChartByCountry.append("g")
		.attr("class", classPrefix + "xAxisGroupColumnByCountry")
		.attr("transform", "translate(0," + svgColumnChartPaddingByCountry[0] + ")");

	const yAxisGroupColumnByCountry = svgColumnChartByCountry.append("g")
		.attr("class", classPrefix + "yAxisGroupColumnByCountry")
		.attr("transform", "translate(" + svgColumnChartPaddingByCountry[3] + ",0)");

	const xAxisGroupColumnBySector = svgColumnChartBySector.append("g")
		.attr("class", classPrefix + "xAxisGroupColumnBySector")
		.attr("transform", "translate(0," + svgColumnChartPaddingBySector[0] + ")");

	const yAxisGroupColumnBySector = svgColumnChartBySector.append("g")
		.attr("class", classPrefix + "yAxisGroupColumnBySector")
		.attr("transform", "translate(" + svgColumnChartPaddingBySector[3] + ",0)");

	const xAxisGroupColumnByTypeCerf = svgColumnChartByTypeCerf.append("g")
		.attr("class", classPrefix + "xAxisGroupColumnByType")
		.attr("transform", "translate(0," + svgColumnChartPaddingByType[0] + ")");

	const xAxisGroupColumnByTypeCbpf = svgColumnChartByTypeCbpf.append("g")
		.attr("class", classPrefix + "xAxisGroupColumnByType")
		.attr("transform", "translate(0," + svgColumnChartPaddingByType[0] + ")");

	const yAxisGroupColumnByTypeCerf = svgColumnChartByTypeCerf.append("g")
		.attr("class", classPrefix + "yAxisGroupColumnByTypeCerf")
		.attr("transform", "translate(" + svgColumnChartPaddingByType[3] + ",0)");

	const yAxisGroupColumnByTypeCbpf = svgColumnChartByTypeCbpf.append("g")
		.attr("class", classPrefix + "yAxisGroupColumnByTypeCbpf")
		.attr("transform", "translate(" + svgColumnChartPaddingByType[3] + ",0)");

	const zoom = d3.zoom()
		.scaleExtent([1, 20])
		.extent([
			[0, 0],
			[mapPanel.width, mapPanel.height]
		])
		.translateExtent([
			[0, 0],
			[mapPanel.width, mapPanel.height]
		]);

	svgMap.call(zoom);

	const defs = svgMap.append("defs");

	const filter = defs.append("filter")
		.attr("id", classPrefix + "dropshadow")
		.attr('filterUnits', 'userSpaceOnUse');

	filter.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", 3);

	filter.append("feOffset")
		.attr("dx", 0)
		.attr("dy", 0);

	const feComponent = filter.append("feComponentTransfer");

	feComponent.append("feFuncA")
		.attr("type", "linear")
		.attr("slope", 0.7);

	const feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode");
	feMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");

	mapZoomButtonPanel.main.style("filter", `url(#${classPrefix}dropshadow)`);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	createMap(mapData);

	createZoomButtons();

	createCheckbox();

	createMapButtons();

	function draw(originalData) {

		breadcrumb.secondBreadcrumbSpan.html(breadcrumbScale(chartState.selectedChart));

		verifyCentroids(originalData);

		createColumnTopValues(originalData);

		createColumnChart(originalData);

		const data = filterData(originalData);

		const hasVenezuelaRRMC = data.find(d => d.isoCode === "0V");
		venezuelaDisclaimerDiv.style("display", hasVenezuelaRRMC ? "block" : "none");

		drawMap(data, originalData);
		drawLegend(data);
		drawBarChart(data, originalData);

		const mapButtons = buttonsDiv.selectAll("button");

		mapButtons.on("click", (event, d) => {
			chartState.selectedFund = d;

			mapButtons.classed("active", e => e === chartState.selectedFund);

			const data = filterData(originalData);

			createColumnTopValues(originalData);

			createColumnChart(originalData);

			drawMap(data, originalData);
			drawLegend(data);
			drawBarChart(data, originalData);

			if (chartState.selectedFund !== lists.defaultValues.fund) {
				if (lists.queryStringValues.has("fund")) {
					lists.queryStringValues.set("fund", chartState.selectedFund);
				} else {
					lists.queryStringValues.append("fund", chartState.selectedFund);
				};
			} else {
				lists.queryStringValues.delete("fund");
			};
			const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
			window.history.replaceState(null, "", newURL);

		});

	};

	function createMap(mapData) {

		const countryFeatures = topojson.feature(mapData, mapData.objects.wrl_polbnda_int_simple_uncs);

		countryFeatures.features = countryFeatures.features.filter(d => d.properties.ISO_2 !== "AQ");

		mapProjection.fitExtent([
			[mapPanel.padding[3], mapPanel.padding[0]],
			[(mapPanel.width - mapPanel.padding[1] - mapPanel.padding[3]), (mapPanel.height - mapPanel.padding[0] - mapPanel.padding[2])]
		], countryFeatures);

		const land = mapContainer.append("path")
			.attr("d", mapPath(topojson.merge(mapData, mapData.objects.wrl_polbnda_int_simple_uncs.geometries.filter(d => d.properties.ISO_2 !== "AQ"))))
			.style("fill", "#F1F1F1");

		const borders = mapContainer.append("path")
			.attr("d", mapPath(topojson.mesh(mapData, mapData.objects.wrl_polbnda_int_simple_uncs, (a, b) => a !== b)))
			.style("fill", "none")
			.style("stroke", "#E5E5E5")
			.style("stroke-width", "1px");

		countryFeatures.features.forEach(d => {
			centroids[d.properties.ISO_2] = {
				x: mapPath.centroid(d.geometry)[0],
				y: mapPath.centroid(d.geometry)[1]
			}
		});

		//Countries with problems:
		//And the fake codes: 0E (Eastern Africa), 0G (Global) and 0V (Venezuela Regional Refugee and Migration Crisis)
		hardcodedAllocations.forEach(d => {
			const projected = mapProjection([d.long, d.lat]);
			centroids[d.isoCode] = {
				x: projected[0],
				y: projected[1]
			};
		});

		//end of createMap
	};

	function createZoomButtons() {

		const zoomInGroup = mapZoomButtonPanel.main.append("g")
			.attr("class", classPrefix + "zoomInGroupMap")
			.attr("cursor", "pointer");

		const zoomInPath = zoomInGroup.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", () => {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(0, mapZoomButtonPanel.padding[0]);
				drawPath.quadraticCurveTo(0, 0, mapZoomButtonPanel.padding[0], 0);
				drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[1], 0);
				drawPath.quadraticCurveTo(mapZoomButtonPanel.width, 0, mapZoomButtonPanel.width, mapZoomButtonPanel.padding[1]);
				drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomInText = zoomInGroup.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", (mapZoomButtonPanel.height / 4) + 7)
			.text("+");

		const zoomOutGroup = mapZoomButtonPanel.main.append("g")
			.attr("class", classPrefix + "zoomOutGroupMap")
			.attr("cursor", "pointer");

		const zoomOutPath = zoomOutGroup.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", () => {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(0, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[3]);
				drawPath.quadraticCurveTo(0, mapZoomButtonPanel.height, mapZoomButtonPanel.padding[3], mapZoomButtonPanel.height);
				drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[2], mapZoomButtonPanel.height);
				drawPath.quadraticCurveTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height, mapZoomButtonPanel.width, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[2]);
				drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomOutText = zoomOutGroup.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", (3 * mapZoomButtonPanel.height / 4) + 7)
			.text("−");

		const zoomLine = mapZoomButtonPanel.main.append("line")
			.attr("x1", 0)
			.attr("x2", mapZoomButtonPanel.width)
			.attr("y1", mapZoomButtonPanel.height / 2)
			.attr("y2", mapZoomButtonPanel.height / 2)
			.style("stroke", "#ccc")
			.style("stroke-width", "1px");

		//end of createZoomButtons
	};

	function createCheckbox() {

		const showNamesGroup = checkboxesPanel.main.append("g")
			.attr("class", classPrefix + "showNamesGroup")
			.attr("cursor", "pointer");

		const outerRectangle = showNamesGroup.append("rect")
			.attr("width", 14)
			.attr("height", 14)
			.attr("rx", 2)
			.attr("ry", 2)
			.attr("fill", "white")
			.attr("stroke", "darkslategray");

		const innerCheck = showNamesGroup.append("polyline")
			.style("stroke-width", "2px")
			.attr("points", "3,7 6,10 11,3")
			.style("fill", "none")
			.style("stroke", chartState.showNames ? "darkslategray" : "white");

		const showNamesText = showNamesGroup.append("text")
			.attr("class", classPrefix + "showNamesText")
			.attr("x", 18)
			.attr("y", 11)
			.text("Show All");

		showNamesGroup.on("click", () => {

			chartState.showNames = !chartState.showNames;

			innerCheck.style("stroke", chartState.showNames ? "darkslategray" : "white");

			piesContainer.selectAll("text")
				.style("display", null);

			if (!chartState.showNames) displayLabels(piesContainer.selectAll("." + classPrefix + "groupName"));

		});

		//end of createCheckbox
	};

	function createMapButtons() {
		const buttons = buttonsDiv.selectAll(null)
			.data(buttonsList)
			.enter()
			.append("button")
			.classed("active", d => chartState.selectedFund === d);

		const bullet = buttons.append("span")
			.attr("class", "icon-circle")
			.append("i")
			.attr("class", (_, i) => i === 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs")
			.style("color", (d, i) => i !== 1 ? colors[d] : null);

		const title = buttons.append("span")
			.html(d => " " + (d === "total" ? capitalize(d) : d.toUpperCase()));
	};

	function drawMap(unfilteredData, originalData) {

		clickableButtons = false;

		const data = unfilteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

		data.sort((a, b) => b.total - a.total || (b.cbpf + b.cerf) - (a.cbpf + a.cerf));

		const maxValue = d3.max(data, d => chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf);

		radiusScale.domain([0, maxValue || 0]);

		const currentTransform = d3.zoomTransform(svgMap.node());

		zoom.on("zoom", zoomed);

		if (data.length) {
			zoomToBoundingBox(data);
		} else {
			zoom.transform(svgMap.transition().duration(duration), d3.zoomIdentity)
		};

		let piesNoData = piesContainer.selectAll("." + classPrefix + "piesNoData")
			.data(data.length ? [] : [true]);

		const piesNoDataExit = piesNoData.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		piesNoData = piesNoData.enter()
			.append("text")
			.attr("class", classPrefix + "piesNoData")
			.attr("x", mapPanel.width / 2)
			.attr("y", mapPanel.height / 2)
			.style("opacity", 0)
			.text("No country in the selection".toUpperCase())
			.merge(piesNoData)
			.transition()
			.duration(duration)
			.style("opacity", 1);

		let pieGroup = piesContainer.selectAll("." + classPrefix + "pieGroup")
			.data(data, d => d.country);

		const pieGroupExit = pieGroup.exit();

		pieGroupExit.each((_, i, n) => {
			const thisGroup = d3.select(n[i]);
			thisGroup.selectAll("." + classPrefix + "slice")
				.transition()
				.duration(duration)
				.attrTween("d", (d, j, m) => {
					const finalObject = d.data.type === "cerf" ? {
						startAngle: 0,
						endAngle: 0,
						outerRadius: 0
					} : {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: 0
					};
					const interpolator = d3.interpolateObject(localVariable.get(m[j]), finalObject);
					return t => arcGenerator(interpolator(t));
				})
				.on("end", () => thisGroup.remove())
		});

		const pieGroupEnter = pieGroup.enter()
			.append("g")
			.attr("class", classPrefix + "pieGroup")
			.style("opacity", 1)
			.attr("transform", d => "translate(" + (centroids[d.isoCode].x * currentTransform.k + currentTransform.x) +
				"," + (centroids[d.isoCode].y * currentTransform.k + currentTransform.y) + ")");

		pieGroup = pieGroupEnter.merge(pieGroup);

		pieGroup.order();

		let slices = pieGroup.selectAll("." + classPrefix + "slice")
			.data(d => pieGenerator([{
				value: d.cerf,
				total: chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf,
				type: "cerf"
			}, {
				value: d.cbpf,
				total: chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf,
				type: "cbpf"
			}, {
				value: d.total,
				total: chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf,
				type: "total"
			}].filter(e => e.value !== 0)), d => d.data.type);

		const slicesRemove = slices.exit()
			.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => {
				const parentDatum = d3.select(n[i].parentNode).datum();
				const thisTotal = radiusScale(chartState.selectedFund === "total" ? parentDatum.total : parentDatum.cbpf + parentDatum.cerf);
				const finalObject = d.data.type === "cerf" ? {
					startAngle: 0,
					endAngle: 0,
					outerRadius: thisTotal
				} : {
					startAngle: Math.PI * 2,
					endAngle: Math.PI * 2,
					outerRadius: thisTotal
				};
				const interpolator = d3.interpolateObject(localVariable.get(n[i]), finalObject);
				return t => arcGenerator(interpolator(t));
			})
			.on("end", (_, i, n) => d3.select(n[i]).remove())

		const slicesEnter = slices.enter()
			.append("path")
			.attr("class", classPrefix + "slice")
			.style("fill", d => colors[d.data.type])
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.each((d, i, n) => {
				let siblingRadius = 0;
				const siblings = d3.select(n[i].parentNode).selectAll("path")
					.each((_, j, m) => {
						const thisLocal = localVariable.get(m[j])
						if (thisLocal) siblingRadius = thisLocal.outerRadius;
					});
				if (d.data.type === "cerf") {
					localVariable.set(n[i], {
						startAngle: 0,
						endAngle: 0,
						outerRadius: siblingRadius
					});
				} else {
					localVariable.set(n[i], {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: siblingRadius
					});
				};
			})

		slices = slicesEnter.merge(slices);

		slices.transition()
			.duration(duration)
			.attrTween("d", pieTween);

		function pieTween(d) {
			const i = d3.interpolateObject(localVariable.get(this), {
				startAngle: d.startAngle,
				endAngle: d.endAngle,
				outerRadius: radiusScale(d.data.total)
			});
			localVariable.set(this, i(1));
			return t => arcGenerator(i(t));
		};

		///

		let pieGroupTexts = piesContainer.selectAll("." + classPrefix + "pieGroupTexts")
			.data(data, d => d.country);

		const pieGroupTextsExit = pieGroupTexts.exit();

		pieGroupTextsExit.selectAll("text, tspan")
			.transition()
			.duration(duration * 0.9)
			.style("opacity", 0);

		const pieGroupTextsEnter = pieGroupTexts.enter()
			.append("g")
			.attr("class", classPrefix + "pieGroupTexts")
			.style("opacity", 1)
			.attr("transform", d => "translate(" + (centroids[d.isoCode].x * currentTransform.k + currentTransform.x) +
				"," + (centroids[d.isoCode].y * currentTransform.k + currentTransform.y) + ")");

		const groupName = pieGroupTextsEnter.append("text")
			.attr("class", classPrefix + "groupName")
			.attr("x", d => radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding)
			.attr("y", d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 1 ? groupNamePadding * 2 - 5 : groupNamePadding * 2
			})
			.style("opacity", 0)
			.text(d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 2 ? thisLabel[0] + " " + thisLabel[1] : thisLabel[0]
			})
			.each((d, i, n) => {
				const thisLabel = chooseLabel(d);
				if (thisLabel.length > 1) {
					d3.select(n[i]).append("tspan")
						.attr("x", radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding)
						.attr("dy", 12)
						.text(thisLabel.length > 2 ? thisLabel.filter((_, i) => i > 1).join(" ") : thisLabel[1]);
				};
			});

		if (!chartState.showNames) {
			groupName.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
		};

		pieGroupTexts = pieGroupTextsEnter.merge(pieGroupTexts);

		pieGroupTexts.raise();

		const allTexts = pieGroupTexts.selectAll("text");

		pieGroupTexts.select("text." + classPrefix + "groupName tspan")
			.text(d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 2 ? thisLabel.filter((_, i) => i > 1).join(" ") : thisLabel[1]
			})
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding);

		pieGroupTexts.select("text." + classPrefix + "groupName")
			.each((d, i, n) => {
				const thisLabel = chooseLabel(d);
				Array.from(n[i].childNodes).find(e => e.nodeType === Node.TEXT_NODE)
					.textContent = thisLabel.length > 2 ? thisLabel[0] + " " + thisLabel[1] : thisLabel[0];
				if (thisLabel.length > 1 && !d3.select(n[i]).select("tspan").size()) {
					d3.select(n[i]).append("tspan")
						.attr("x", radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding)
						.attr("dy", 12)
						.text(thisLabel.length > 2 ? thisLabel.filter((_, i) => i > 1).join(" ") : thisLabel[1]);
				};
			})
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding)
			.attr("y", d => {
				const thisLabel = chooseLabel(d);
				return thisLabel.length > 1 ? groupNamePadding * 2 - 5 : groupNamePadding * 2
			})
			.end()
			.then(() => {
				clickableButtons = true;
				if (chartState.showNames) return;
				allTexts.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
			})
			.catch(error => console.warn("Moved too fast"));

		function chooseLabel(d) {
			if ((!d.cerf && d.cbpf) || chartState.selectedFund === "cbpf") {
				return d.labelTextCbpf;
			} else {
				return d.labelText;
			};
		};

		///

		pieGroup.on("mouseover", pieGroupMouseover);

		function zoomed(event) {

			mapContainer.attr("transform", event.transform);

			mapContainer.select("path:nth-child(2)")
				.style("stroke-width", 1 / event.transform.k + "px");

			pieGroup.attr("transform", d => "translate(" + (centroids[d.isoCode].x * event.transform.k + event.transform.x) +
				"," + (centroids[d.isoCode].y * event.transform.k + event.transform.y) + ")");

			pieGroupExit.attr("transform", d => "translate(" + (centroids[d.isoCode].x * event.transform.k + event.transform.x) +
				"," + (centroids[d.isoCode].y * event.transform.k + event.transform.y) + ")");

			pieGroupTexts.attr("transform", d => "translate(" + (centroids[d.isoCode].x * event.transform.k + event.transform.x) +
				"," + (centroids[d.isoCode].y * event.transform.k + event.transform.y) + ")");

			pieGroupTextsExit.attr("transform", d => "translate(" + (centroids[d.isoCode].x * event.transform.k + event.transform.x) +
				"," + (centroids[d.isoCode].y * event.transform.k + event.transform.y) + ")");

			if (!chartState.showNames) {
				allTexts.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
			};

			//end of zoomed
		};

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomInGroupMap")
			.on("click", () => zoom.scaleBy(svgMap.transition().duration(duration), 2));

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomOutGroupMap")
			.on("click", () => zoom.scaleBy(svgMap.transition().duration(duration), 0.5));

		function pieGroupMouseover(event, datum) {

			if (hoveredCountry === datum.country) return;
			hoveredCountry = datum.country;

			tooltipDivBarChart.style("display", "none")
				.html(null);

			let thisRank,
				thisOrdinal;

			chartState.currentTooltip = tooltipDivMap;

			pieGroup.style("opacity", d => d.country === datum.country ? 1 : fadeOpacity);

			pieGroupTexts.style("opacity", d => d.country === datum.country ? 1 : fadeOpacity);

			barChartPanel.main.selectAll("." + classPrefix + "bars")
				.style("opacity", d => d.data.country === datum.country ? 1 : fadeOpacity);

			barChartPanel.main.selectAll("." + classPrefix + "barsLabels")
				.style("opacity", (d, i) => d.country === datum.country ? 1 : !(i % 4) ? fadeOpacity : 0);

			xAxisGroup.selectAll(".tick")
				.style("opacity", d => d === datum.country ? 1 : fadeOpacity)
				.each((d, i, n) => {
					if (d === datum.country) {
						thisRank = i + 1;
						thisOrdinal = makeOrdinal(thisRank);
						d3.select(n[i]).select("text")
							.append("tspan")
							.attr("class", classPrefix + "countryRanking")
							.attr("dy", "1.2em")
							.attr("x", (_, j, m) => -(m[j].parentNode.getComputedTextLength() / 2))
							.text("(" + thisRank + thisOrdinal + ")");
					} else {
						d3.select(n[i]).select(`.${classPrefix}countryRanking`)
							.remove();
					};
				});

			tooltipDivMap.style("display", "block")
				.html(null);

			createTooltip(datum, thisRank, thisOrdinal, tooltipDivMap);

			const thisBox = event.currentTarget.getBoundingClientRect();

			const containerBox = mapDiv.node().getBoundingClientRect();

			const tooltipBox = tooltipDivMap.node().getBoundingClientRect();

			const thisOffsetTop = thisBox.top + (thisBox.height / 2) - containerBox.top < tooltipBox.height / 2 ?
				tooltipMargin : containerBox.bottom - thisBox.bottom - (thisBox.height / 2) < tooltipBox.height / 2 ?
				containerBox.height - tooltipBox.height - tooltipMargin : (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
				(thisBox.left + 2 * (radiusScale(chartState.selectedFund === "total" ? datum.total : datum.cbpf + datum.cerf) * (containerBox.width / svgMapWidth))) - containerBox.left + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltipDivMap.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

			tooltipDivMap.select(`.${classPrefix}closeButton`)
				.on("click", () => pieGroupMouseout(event));

			zoomLayer.on("click", () => pieGroupMouseout(event));
			containerDiv.on("mouseleave", () => pieGroupMouseout(event));
			buttonsDiv.on("mouseover", () => pieGroupMouseout(event));

		};

		function pieGroupMouseout(event) {

			hoveredCountry = null;

			pieGroup.style("opacity", 1);

			pieGroupTexts.style("opacity", 1);

			barChartPanel.main.selectAll("." + classPrefix + "bars")
				.style("opacity", 1);

			barChartPanel.main.selectAll("." + classPrefix + "barsLabels")
				.style("opacity", (_, i) => !(i % 4) ? 1 : 0);

			xAxisGroup.selectAll(".tick")
				.style("opacity", 1)
				.selectAll("." + classPrefix + "countryRanking")
				.remove();

			tooltipDivMap.html(null)
				.style("display", "none");

		};

		function zoomToBoundingBox(data) {

			let easternCountry;

			const boundingBox = data.reduce((acc, curr) => {
				if (centroids[curr.isoCode].x > acc.e) easternCountry = curr.country;
				acc.n = Math.min(acc.n, centroids[curr.isoCode].y - zoomBoundingMargin - radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				acc.s = Math.max(acc.s, centroids[curr.isoCode].y + zoomBoundingMargin + radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				acc.e = Math.max(acc.e, centroids[curr.isoCode].x + zoomBoundingMargin + radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				acc.w = Math.min(acc.w, centroids[curr.isoCode].x - zoomBoundingMargin - radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				return acc;
			}, {
				n: Infinity,
				s: -Infinity,
				e: -Infinity,
				w: Infinity
			});

			const easternCountryName = piesContainer.append("text")
				.style("opacity", 0)
				.attr("class", classPrefix + "groupName")
				.text(lists.fundNamesList[easternCountry]);

			boundingBox.e = boundingBox.e + easternCountryName.node().getComputedTextLength() + 2;

			easternCountryName.remove();

			const midPointX = (boundingBox.w + boundingBox.e) / 2;
			const midPointY = (boundingBox.n + boundingBox.s) / 2;
			const scale = Math.min(mapPanel.width / (boundingBox.e - boundingBox.w), mapPanel.height / (boundingBox.s - boundingBox.n));
			const translate = [mapPanel.width / 2 - scale * midPointX, mapPanel.height / 2 - scale * midPointY];

			zoom.transform(svgMap.transition().duration(duration),
				d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

		};

		//end of drawMap
	};

	function drawLegend(data) {

		const maxDataValue = radiusScale.domain()[1];

		const sizeCirclesData = maxDataValue ? [0, maxDataValue / 4, maxDataValue / 2, maxDataValue] : [];

		let backgroundRectangle = legendPanel.main.selectAll("." + classPrefix + "backgroundRectangle")
			.data([true]);

		backgroundRectangle = backgroundRectangle.enter()
			.append("rect")
			.attr("class", classPrefix + "backgroundRectangle")
			.merge(backgroundRectangle)
			.style("fill", "#fff")
			.style("opacity", 0.6)
			.attr("width", legendPanel.width)
			.attr("height", legendPanel.height);

		let legendSizeGroups = legendPanel.main.selectAll("." + classPrefix + "legendSizeGroups")
			.data([true]);

		legendSizeGroups = legendSizeGroups.enter()
			.append("g")
			.attr("class", classPrefix + "legendSizeGroups")
			.merge(legendSizeGroups);

		let legendSizeGroup = legendSizeGroups.selectAll("." + classPrefix + "legendSizeGroup")
			.data(sizeCirclesData);

		const legendSizeGroupExit = legendSizeGroup.exit()
			.transition()
			.duration(duration / 2)
			.style("opacity", 0)
			.remove();

		const legendSizeGroupEnter = legendSizeGroup.enter()
			.append("g")
			.style("opacity", 0)
			.attr("class", classPrefix + "legendSizeGroup");

		const legendSizeLines = legendSizeGroupEnter.append("line")
			.attr("x1", legendPanel.padding[3] + radiusScale.range()[1])
			.attr("x2", legendPanel.padding[3] + radiusScale.range()[1] + legendLineSize)
			.attr("y1", d => d ? legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				legendPanel.padding[0] + (radiusScale.range()[1] * 2))
			.attr("y2", d => d ? legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				legendPanel.padding[0] + (radiusScale.range()[1] * 2))
			.style("stroke", "#666")
			.style("stroke-dasharray", "2,2")
			.style("stroke-width", "1px");

		const legendSizeCircles = legendSizeGroupEnter.append("circle")
			.attr("cx", legendPanel.padding[3] + radiusScale.range()[1])
			.attr("cy", d => legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d))
			.attr("r", d => !d ? 0 : radiusScale(d))
			.style("fill", "none")
			.style("stroke", "darkslategray");

		const legendSizeCirclesText = legendSizeGroupEnter.append("text")
			.attr("class", classPrefix + "legendCirclesText")
			.attr("x", legendPanel.padding[3] + radiusScale.range()[1] + legendLineSize + 4)
			.attr("y", (d, i) => i === 1 ? legendPanel.padding[0] + 5 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				i ? legendPanel.padding[0] + 3 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				legendPanel.padding[0] + 3 + (radiusScale.range()[1] * 2) - 2)
			.text(d => d ? d3.formatPrefix(".0", d)(d) : "0");

		legendSizeGroup = legendSizeGroup.merge(legendSizeGroupEnter);

		legendSizeGroup.transition("groupTransition")
			.duration(duration / 2)
			.style("opacity", 1);

		legendSizeGroup.select("." + classPrefix + "legendCirclesText")
			.transition("textTransition")
			.duration(duration)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		const legendData = sizeCirclesData.length ? chartState.selectedFund.split("/") : [];

		let legendColors = legendPanel.main.selectAll("." + classPrefix + "legendColors")
			.data(legendData);

		const legendColorsExit = legendColors.exit()
			.transition()
			.duration(duration / 2)
			.style("opacity", 0)
			.remove();

		const legendColorsEnter = legendColors.enter()
			.append("g")
			.style("opacity", 0)
			.attr("class", classPrefix + "legendColors");

		const legendRects = legendColorsEnter.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("rx", 1)
			.attr("ry", 1)
			.style("stroke-width", "0.5px")
			.style("stroke", "#666");

		const legendText = legendColorsEnter.append("text")
			.attr("x", 14)
			.attr("y", 9);

		legendColors = legendColorsEnter.merge(legendColors);

		legendColors.transition()
			.duration(duration / 2)
			.style("opacity", 1);

		legendColors.attr("transform", (_, i) => "translate(" + legendPanel.padding[3] + "," + (legendPanel.height - legendPanel.padding[2] - legendTextPadding + (+i * legendTextPadding)) + ")");

		legendColors.select("rect")
			.style("fill", d => colors[d]);

		legendColors.select("text")
			.text(d => (chartState.selectedFund === "total" ? capitalize(d) : d.toUpperCase()) + " allocations");

		//end of drawLegend
	};

	function drawBarChart(unfilteredData, originalData) {

		if (covid19InCluster && showCovidDisclaimer) {
			covidDisclaimer.style("display", "block");
		} else {
			covidDisclaimer.style("display", "none");
		};

		const data = unfilteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

		data.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? ((b.cerf + b.cbpf) - (a.cerf + a.cbpf)) :
			b[chartState.selectedFund] - a[chartState.selectedFund]);

		const dynamicWidth = Math.min(svgBarChartWidth - svgBarChartPadding[3] - svgBarChartPadding[1],
			(barChartPanel.padding[1] + barChartPanel.padding[3] + barWidth + data.length * barWidth));

		svgBarChart.transition()
			.duration(duration)
			.attr("width", dynamicWidth);

		barChartPanel.width = dynamicWidth - svgBarChartPadding[3] - svgBarChartPadding[1];

		xScale.range([barChartPanel.padding[3], barChartPanel.width - barChartPanel.padding[1]])
			.domain(data.map(d => d.country));

		yScale.domain([0, d3.max(data, d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund])]);

		xAxis.tickFormat(d => {
			if (lists.fundAbbreviatedNamesList[d] === "Venezuela Regional Refugee and Migration Crisis") return VenezuelaRegionalRefugeeAbbr;
			const thisDatum = data.find(e => e.country === d);
			if ((!thisDatum.cerf && thisDatum.cbpf) || chartState.selectedFund === "cbpf") {
				return (lists.cbpfStatusList[d] === "Closed" ? "(Closed) " : "") + lists.fundAbbreviatedNamesList[d];
			} else {
				return lists.fundAbbreviatedNamesList[d]
			};
		});

		let barTitleSpanText;

		if (chartState.selectedChart === "allocationsByCountry") {
			barTitleSpanText = chartState.selectedRegion.length === 0 ? "all regions" : textWithCommas(chartState.selectedRegion);
		};

		if (chartState.selectedChart === "allocationsBySector") {
			barTitleSpanText = chartState.selectedCluster.length === 0 ? "all sectors" : textWithCommas(chartState.selectedCluster.map(e => lists.clustersList[e]));
		};

		if (chartState.selectedChart === "allocationsByType") {
			barTitleSpanText = chartState.selectedType.length === 0 ? "all allocation types" : textWithCommas(chartState.selectedType.map(e => lists.allocationTypesList[e]));
		};

		let barTitle = barChartDivTitleText.selectAll("." + classPrefix + "barTitle")
			.data([true]);

		barTitle = barTitle.enter()
			.append("span")
			.attr("class", classPrefix + "barTitle")
			.merge(barTitle)
			.html((chartState.selectedFund === "total" ? capitalize(chartState.selectedFund) : chartState.selectedFund.toUpperCase()) + " allocations ")
			.append("span")
			.attr("class", classPrefix + "barTitleSpan")
			.html("(" + barTitleSpanText + ")");

		barChartDivTitleText.classed(classPrefix + "twoColorsBorder", chartState.selectedFund === "cerf/cbpf")
			.transition()
			.duration(duration)
			.style("margin-left", ((svgBarChartWidth - dynamicWidth) / 2) + "px")
			.style("border-color", chartState.selectedFund === "cerf/cbpf" ? colors.cerf : colors[chartState.selectedFund]);

		const stackedData = stack(data);

		let barsGroups = barChartPanel.main.selectAll("." + classPrefix + "barsGroups")
			.data(stackedData, d => d.key);

		const barGroupsExit = barsGroups.exit().remove();

		const barGroupsEnter = barsGroups.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroups")
			.attr("pointer-events", "none")
			.style("fill", d => colors[d.key]);

		barsGroups = barGroupsEnter.merge(barsGroups);

		let bars = barsGroups.selectAll("." + classPrefix + "bars")
			.data(d => d, d => d.data.country);

		const barsExit = bars.exit()
			.transition()
			.duration(duration)
			.attr("height", 0)
			.attr("y", barChartPanel.height - barChartPanel.padding[2])
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("width", xScale.bandwidth())
			.attr("height", 0)
			.attr("y", yScale(0))
			.attr("x", d => xScale(d.data.country))

		bars = barsEnter.merge(bars);

		bars.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("width", xScale.bandwidth())
			.attr("x", d => xScale(d.data.country))
			.attr("y", d => d[0] === d[1] ? yScale(0) : yScale(d[1]))
			.attr("height", d => yScale(d[0]) - yScale(d[1]));

		let barsLabels = barChartPanel.main.selectAll("." + classPrefix + "barsLabels")
			.data(data, d => d.country);

		const barsLabelsExit = barsLabels.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.attr("y", barChartPanel.height - barChartPanel.padding[2])
			.remove();

		const barsLabelsEnter = barsLabels.enter()
			.append("text")
			.attr("class", classPrefix + "barsLabels")
			.attr("x", d => xScale(d.country) + xScale.bandwidth() / 2)
			.attr("y", barChartPanel.height - barChartPanel.padding[2])
			.style("opacity", 0);

		barsLabels = barsLabelsEnter.merge(barsLabels);

		barsLabels.transition()
			.duration(duration)
			.style("opacity", (_, i) => !(i % 4) ? 1 : 0)
			.attr("x", d => xScale(d.country) + xScale.bandwidth() / 2)
			.attr("y", d => yScale(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) - barChartPanel.labelsPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let barsTooltipRectangles = barChartPanel.main.selectAll("." + classPrefix + "barsTooltipRectangles")
			.data(data, d => d.country);

		const barsTooltipRectanglesExit = barsTooltipRectangles.exit().remove();

		const barsTooltipRectanglesEnter = barsTooltipRectangles.enter()
			.append("rect")
			.attr("class", classPrefix + "barsTooltipRectangles")
			.attr("pointer-events", "all")
			.style("opacity", 0)
			.attr("y", barChartPanel.padding[0])
			.attr("height", barChartPanel.height - barChartPanel.padding[0] - barChartPanel.padding[2])
			.attr("width", xScale.step())
			.attr("x", d => xScale(d.country) - xScale.bandwidth() / 2);

		barsTooltipRectangles = barsTooltipRectanglesEnter.merge(barsTooltipRectangles);

		barsTooltipRectangles.transition()
			.duration(duration)
			.attr("width", xScale.step())
			.attr("x", d => xScale(d.country) - xScale.bandwidth() / 2);

		xAxisGroup.transition()
			.duration(duration)
			.call(xAxis);

		xAxisGroup.selectAll(".tick text")
			.attr("transform", "rotate(-40, -4, 7)");

		yAxis.tickSizeInner(-(xScale.range()[1] - barChartPanel.padding[3]));

		yAxisGroup.transition()
			.duration(duration)
			.call(yAxis);

		yAxisGroup.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		barsTooltipRectangles.on("mouseover", mouseoverBarsTooltipRectangles);

		function mouseoverBarsTooltipRectangles(event, d) {

			if (hoveredCountry === d.country) return;
			hoveredCountry = d.country;

			tooltipDivMap.style("display", "none")
				.html(null);

			let thisRank,
				thisOrdinal;

			chartState.currentTooltip = tooltipDivBarChart;

			bars.style("opacity", e => e.data.country === d.country ? 1 : fadeOpacity);

			barsLabels.style("opacity", (e, i) => e.country === d.country ? 1 : !(i % 4) ? fadeOpacity : 0);

			xAxisGroup.selectAll(".tick")
				.style("opacity", e => e === d.country ? 1 : fadeOpacity)
				.each((datum, i, n) => {
					if (datum === d.country) {
						thisRank = i + 1;
						thisOrdinal = makeOrdinal(thisRank);
						d3.select(n[i]).select("text")
							.append("tspan")
							.attr("class", classPrefix + "countryRanking")
							.attr("dy", "1.2em")
							.attr("x", (_, j, m) => -(m[j].parentNode.getComputedTextLength() / 2))
							.text("(" + thisRank + thisOrdinal + ")");
					} else {
						d3.select(n[i]).select(`.${classPrefix}countryRanking`)
							.remove();
					};
				});

			piesContainer.selectAll("." + classPrefix + "pieGroup, ." + classPrefix + "pieGroupTexts")
				.style("opacity", fadeOpacity);

			piesContainer.selectAll("." + classPrefix + "pieGroup")
				.filter(e => e.country === d.country)
				.style("opacity", 1);

			piesContainer.selectAll("." + classPrefix + "pieGroupTexts")
				.filter(e => e.country === d.country)
				.style("opacity", 1)
				.select("text")
				.style("display", (_, i, n) => {
					localVariable.set(n[i], d3.select(n[i]).style("display"));
					return null;
				});

			tooltipDivBarChart.style("display", "block")
				.html(null);

			createTooltip(d, thisRank, thisOrdinal, tooltipDivBarChart);

			const thisBox = event.currentTarget.getBoundingClientRect();

			const containerBox = barChartDiv.node().getBoundingClientRect();

			const tooltipBox = tooltipDivBarChart.node().getBoundingClientRect();

			const thisOffsetTop = containerBox.bottom - thisBox.bottom - (thisBox.height / 2) < tooltipBox.height / 2 ?
				containerBox.height - tooltipBox.height - tooltipMargin : (containerBox.height / 2) - (tooltipBox.height / 2);

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + tooltipMargin ?
				thisBox.left - containerBox.left + thisBox.width + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltipDivBarChart.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

			tooltipDivBarChart.select(`.${classPrefix}closeButton`)
				.on("click", () => mouseoutBarsTooltipRectangles(event, d));

			zoomLayer.on("click", () => mouseoutBarsTooltipRectangles(event, d));
			containerDiv.on("mouseleave", () => mouseoutBarsTooltipRectangles(event, d));
			buttonsDiv.on("mouseover", () => mouseoutBarsTooltipRectangles(event, d));

		};

		function mouseoutBarsTooltipRectangles(_, d) {

			hoveredCountry = null;

			bars.style("opacity", 1);

			barsLabels.style("opacity", (_, i) => !(i % 4) ? 1 : 0);

			xAxisGroup.selectAll(".tick")
				.style("opacity", 1)
				.selectAll("." + classPrefix + "countryRanking")
				.remove();

			piesContainer.selectAll("." + classPrefix + "pieGroup, ." + classPrefix + "pieGroupTexts")
				.style("opacity", 1);

			piesContainer.selectAll("." + classPrefix + "pieGroupTexts")
				.filter(e => e.country === d.country)
				.select("text")
				.style("display", (_, i, n) => localVariable.get(n[i]));

			tooltipDivBarChart.html(null)
				.style("display", "none");
		};

		//end of drawBarChart
	};

	function createTooltip(datum, rank, ordinal, container) {

		const projectsTotal = new Set(),
			projectsCerf = new Set(),
			projectsCbpf = new Set(),
			typesData = {},
			clusterDataCerf = {},
			clusterDataCbpf = {},
			showCerfOnly = chartState.selectedFund === "cerf",
			showCbpfOnly = chartState.selectedFund === "cbpf";

		let tooltipTotal = 0,
			tooltipCerf = 0,
			tooltipCbpf = 0,
			chartDivCerf,
			chartDivCbpf;

		cerfAllocationTypes.forEach(e => typesData[e] = 0);
		cbpfAllocationTypes.forEach(e => typesData[e] = 0);

		datum.allocationsList.forEach(row => {
			if (row.FundId === cerfId) {
				row.ProjList.toString().split(separator).forEach(e => {
					projectsTotal.add(e);
					projectsCerf.add(e);
				});
				tooltipTotal += row.ClusterBudget;
				tooltipCerf += row.ClusterBudget;
				typesData[row.AllocationSurceId] += row.ClusterBudget;
				clusterDataCerf[row.ClusterId] = (clusterDataCerf[row.ClusterId] || 0) + row.ClusterBudget;
			};
			if (row.FundId === cbpfId) {
				row.ProjList.toString().split(separator).forEach(e => {
					projectsTotal.add(e);
					projectsCbpf.add(e);
				});
				tooltipTotal += row.ClusterBudget;
				tooltipCbpf += row.ClusterBudget;
				typesData[row.AllocationSurceId] += row.ClusterBudget;
				clusterDataCbpf[row.ClusterId] = (clusterDataCbpf[row.ClusterId] || 0) + row.ClusterBudget;
			};
		});

		const totalSubtext = chartState.selectedFund === "cerf" || chartState.selectedFund === "cbpf" ?
			"  (CERF + CBPF)" : "";

		const innerTooltipDiv = container.append("div")
			.style("max-width", innerTooltipDivWidth + "px")
			.attr("id", classPrefix + "innerTooltipDiv");

		const titleDiv = innerTooltipDiv.append("div")
			.attr("class", classPrefix + "tooltipTitleDiv")
			.style("margin-bottom", "18px");

		const titleDivText = titleDiv.append("div")
			.attr("class", classPrefix + "tooltipTitleDivText");

		titleDivText.append("strong")
			.style("font-size", "16px")
			.html((!tooltipCerf && tooltipCbpf) || chartState.selectedFund === "cbpf" ? datum.countryNameCbpf : datum.countryName);

		titleDivText.append("span")
			.attr("class", classPrefix + "tooltipRank")
			.html(` (rank:&nbsp;${rank}<sup>${ordinal}</sup>)`);

		const closeButton = titleDiv.append("div")
			.attr("class", classPrefix + "closeButton")
			.append("span")
			.attr("class", "fas fa-times");

		const innerDiv = innerTooltipDiv.append("div")
			.style("display", "flex")
			.style("flex-wrap", "wrap")
			.style("white-space", "pre")
			.style("width", "100%");

		const rowDivTotal = innerDiv.append("div")
			.attr("class", classPrefix + "tooltipTotalValue")
			.style("display", "flex")
			.style("align-items", "center")
			.style("width", "100%")
			.style("margin-bottom", "16px");

		rowDivTotal.append("span")
			.style("font-weight", 500)
			.attr("class", classPrefix + "tooltipKeys")
			.html(`Total<span id='${classPrefix}totalSubtext' style='font-size:0.7em;font-weight:400'></span>:`);

		rowDivTotal.select("#" + classPrefix + "totalSubtext")
			.html(totalSubtext);

		rowDivTotal.append("span")
			.attr("class", classPrefix + "tooltipLeader");

		rowDivTotal.append("span")
			.attr("class", classPrefix + "tooltipValues")
			.html(formatMoney0Decimals(tooltipTotal))
			.append("span")
			.attr("class", classPrefix + "tooltipProjectsTotal")
			.html(` (${projectsTotal.size} Project${projectsTotal.size > 1 ? "s" : ""})`);

		if (!showCbpfOnly) {
			const rowDivCerf = innerDiv.append("div")
				.attr("class", classPrefix + "tooltipCerfValue")
				.classed(classPrefix + "tooltipZeroValueCbpf", !tooltipCerf)
				.style("display", "flex")
				.style("align-items", "center")
				.style("width", "100%")
				.style("margin-bottom", "4px");

			rowDivCerf.append("span")
				.style("font-weight", 500)
				.attr("class", classPrefix + "tooltipKeys")
				.html("CERF:");

			rowDivCerf.append("span")
				.attr("class", classPrefix + "tooltipLeader");

			rowDivCerf.append("span")
				.attr("class", classPrefix + "tooltipValues")
				.html(formatMoney0Decimals(tooltipCerf))
				.append("span")
				.attr("class", classPrefix + "tooltipProjectsCerf")
				.html(` (${projectsCerf.size} Project${projectsCerf.size > 1 ? "s" : ""})`);

			chartDivCerf = innerDiv.append("div")
				.style("width", "100%")
				.style("margin-bottom", "6px");

			if (tooltipCerf) {
				const cerfLinkUrl = `https://cerf.un.org/what-we-do/allocation/${chartState.selectedYear}/country/${lists.cerfIdsList[datum.country]}`;
				const cerfLinkUrlText = `CERF - ${chartState.selectedYear} - ${datum.countryName} allocation data`;

				const cerfLink = innerDiv.append("div")
					.attr("class", classPrefix + "cerfLink");

				cerfLink.append("span")
					.html("More info: ");

				cerfLink.append("a")
					.attr("href", cerfLinkUrl)
					.attr("target", "_blank")
					.html(cerfLinkUrlText);
			} else {
				chartDivCerf.style("margin-bottom", "10px", "important")
					.style("border-bottom", "1px dotted #999", "important")
					.style("padding-bottom", "5px", "important");
			};
		};

		if (!showCerfOnly) {
			const closedText = lists.cbpfStatusList[datum.country] === "Closed" ? " (closed)" : "";

			const rowDivCbpf = innerDiv.append("div")
				.attr("class", classPrefix + "tooltipCbpfValue")
				.classed(classPrefix + "tooltipZeroValueCbpf", !tooltipCbpf)
				.style("display", "flex")
				.style("align-items", "center")
				.style("width", "100%")
				.style("margin-bottom", "4px");

			rowDivCbpf.append("span")
				.style("font-weight", 500)
				.attr("class", classPrefix + "tooltipKeys")
				.html(`CBPF${closedText}:`);

			rowDivCbpf.append("span")
				.attr("class", classPrefix + "tooltipLeader");

			rowDivCbpf.append("span")
				.attr("class", classPrefix + "tooltipValues")
				.html(formatMoney0Decimals(tooltipCbpf))
				.append("span")
				.attr("class", classPrefix + "tooltipProjectsCbpf")
				.html(` (${projectsCbpf.size} Project${projectsCbpf.size > 1 ? "s" : ""})`);

			chartDivCbpf = innerDiv.append("div")
				.style("width", "100%");
		};

		if ((chartState.selectedChart === "allocationsByCountry" || chartState.selectedChart === "allocationsByType") && tooltipCerf && !showCbpfOnly) createSvgByCountry("cerf");
		if ((chartState.selectedChart === "allocationsByCountry" || chartState.selectedChart === "allocationsByType") && tooltipCbpf && !showCerfOnly) createSvgByCountry("cbpf");

		if (chartState.selectedChart === "allocationsBySector" && tooltipCerf && !showCbpfOnly) createSvgBySector("cerf");
		if (chartState.selectedChart === "allocationsBySector" && tooltipCbpf && !showCerfOnly) createSvgBySector("cbpf");

		function createSvgByCountry(fundType) {

			const thisTypeArray = fundType === "cerf" ? cerfAllocationTypes : cbpfAllocationTypes;
			const thisChartDiv = fundType === "cerf" ? chartDivCerf : chartDivCbpf;
			const thisyScale = fundType === "cerf" ? yScaleColumnByTypeCerf : yScaleColumnByTypeCbpf;

			const svgData = thisTypeArray.map(e => ({
				type: lists.allocationTypesList[e],
				value: typesData[e]
			}));

			const height = 72,
				padding = [16, 28, 4, 66];

			const svg = thisChartDiv.append("svg")
				.attr("width", innerTooltipDivWidth)
				.attr("height", height);

			const xScale = xScaleColumnByType.copy()
				.range([padding[3], innerTooltipDivWidth - padding[1]])
				.domain([0, d3.max(svgData, d => d.value)]);

			const yScale = thisyScale.copy()
				.range([padding[0], height - padding[2]])
				.paddingOuter(0.2);

			const xAxis = d3.axisTop(xScale)
				.tickSizeOuter(0)
				.tickSizeInner(-(height - padding[2] - padding[0]))
				.ticks(3)
				.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

			const yAxis = d3.axisLeft(yScale)
				.tickSize(4);

			svg.append("g")
				.attr("class", classPrefix + "xAxisGroupColumnByType")
				.attr("transform", "translate(0," + padding[0] + ")")
				.call(xAxis)
				.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			svg.append("g")
				.attr("class", classPrefix + "yAxisGroupColumnByTypeCerf")
				.attr("transform", "translate(" + padding[3] + ",0)")
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxis);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => d.split(" ")[0])
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.attr("dy", "-0.3em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.text(d => d.split(" ")[1]);
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

			svg.selectAll(null)
				.data(svgData)
				.enter()
				.append("rect")
				.attr("height", yScale.bandwidth())
				.attr("width", 0)
				.style("fill", colors[fundType])
				.attr("x", padding[3])
				.attr("y", d => yScale(d.type))
				.transition()
				.duration(duration)
				.attr("width", d => xScale(d.value) - padding[3]);


			svg.selectAll(null)
				.data(svgData)
				.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnByTypeCerf")
				.attr("x", padding[3] + labelsColumnPadding)
				.attr("y", d => yScale(d.type) + yScale.bandwidth() / 2)
				.transition()
				.duration(duration)
				.attr("x", d => xScale(d.value) + labelsColumnPadding)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.value);
					return t => d.value ? formatSIFloat(interpolator(t)).replace("G", "B") : 0;
				});

			//end of createSvgByCountry
		};

		function createSvgBySector(fundType) {

			const thisChartDiv = fundType === "cerf" ? chartDivCerf : chartDivCbpf;
			const thisTypeObject = fundType === "cerf" ? clusterDataCerf : clusterDataCbpf;

			const svgData = Object.entries(thisTypeObject).map(e => ({
					cluster: lists.clustersList[e[0]],
					clusterId: e[0],
					value: e[1]
				})).filter(e => !chartState.selectedCluster.length || chartState.selectedCluster.indexOf(e.clusterId) > -1)
				.sort((a, b) => b.value - a.value);

			const padding = [16, 26, 4, 90],
				height = padding[0] + padding[2] + maxColumnRectHeight * 1.6 * svgData.length;

			const svg = thisChartDiv.append("svg")
				.attr("width", innerTooltipDivWidth)
				.attr("height", height);

			const yScale = yScaleColumnBySector.copy()
				.domain(svgData.map(e => e.cluster))
				.range([padding[0], height - padding[2]]);

			const xScale = xScaleColumnBySector.copy()
				.range([padding[3], innerTooltipDivWidth - padding[1]])
				.domain([0, d3.max(svgData, e => e.value)]);

			const xAxis = d3.axisTop(xScale)
				.tickSizeOuter(0)
				.tickSizeInner(-(height - padding[0] - padding[2]))
				.ticks(3)
				.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

			const yAxis = d3.axisLeft(yScale)
				.tickPadding(clusterIconSize + 2 * clusterIconPadding)
				.tickSize(3);

			svg.append("g")
				.attr("class", classPrefix + "xAxisGroupColumnBySector")
				.attr("transform", "translate(0," + padding[0] + ")")
				.call(xAxis)
				.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			svg.append("g")
				.attr("class", classPrefix + "yAxisGroupColumnBySector")
				.attr("transform", "translate(" + padding[3] + ",0)")
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxis);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => clusterNamesScale(d).split(" ")[0])
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.attr("dy", d => clusterNamesScale(d).indexOf(" ") > -1 ? "-0.3em" : "0.32em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.text(d => clusterNamesScale(d).split(" ")[1]);
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

			svg.selectAll(null)
				.data(svgData)
				.enter()
				.append("rect")
				.attr("height", yScale.bandwidth())
				.attr("width", 0)
				.style("fill", colors[fundType])
				.attr("x", xScale(0))
				.attr("y", d => yScale(d.cluster))
				.transition()
				.duration(duration)
				.attr("width", d => xScale(d.value) - padding[3]);

			svg.selectAll(null)
				.data(svgData)
				.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnBySector")
				.attr("x", padding[3] + labelsColumnPadding)
				.attr("y", d => yScale(d.cluster) + yScale.bandwidth() / 2)
				.transition()
				.duration(duration)
				.attr("x", d => xScale(d.value) + labelsColumnPadding)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.value);
					return t => d.value ? formatSIFloat(interpolator(t)).replace("G", "B") : 0;
				});

			svg.selectAll(null)
				.data(svgData)
				.enter()
				.append("image")
				.attr("x", padding[3] - clusterIconPadding - clusterIconSize - yAxis.tickSize())
				.attr("y", d => yScale(d.cluster) - (clusterIconSize - yScale.bandwidth()) / 2)
				.attr("width", clusterIconSize)
				.attr("height", clusterIconSize)
				.attr("href", d => clustersIconsData[d.clusterId]);

			//end of createSvgBySector
		}

		//end of createTooltip
	};

	function createColumnTopValues(originalData) {

		const filteredData = originalData.filter(row => {
			const filterRegion = !chartState.selectedRegion.length ? true : chartState.selectedRegion.indexOf(row.region) > -1;
			const filterCluster = !chartState.selectedCluster.length ? true : chartState.selectedCluster.some(e => row[`cluster${separator}${e}${separator}total`]);
			const filterType = !chartState.selectedType.length ? true : chartState.selectedType.some(e => row[`type${separator}${e}${separator}total`]);

			return filterRegion && filterCluster && filterType;
		});

		const numberOfProjects = new Set(),
			numberOfPartners = new Set();

		const numberOfCountries = filteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]).length;

		const rowFund = chartState.selectedFund === "cerf/cbpf" ? "total" : chartState.selectedFund;

		const totalAllocations = d3.sum(filteredData, row => {
			if (chartState.selectedChart === "allocationsByCountry") {
				return row[rowFund];
			};
			if (chartState.selectedChart === "allocationsBySector") {
				if (!chartState.selectedCluster.length) {
					return row[rowFund];
				} else {
					let rowSum = 0;
					chartState.selectedCluster.forEach(e => {
						rowSum += row[`cluster${separator}${e}${separator}${rowFund}`];
					});
					return rowSum;
				};
			};
			if (chartState.selectedChart === "allocationsByType") {
				if (!chartState.selectedType.length) {
					return row[rowFund];
				} else {
					let rowSum = 0;
					chartState.selectedType.forEach(e => {
						rowSum += row[`type${separator}${e}${separator}${rowFund}`];
					});
					return rowSum;
				};
			};
		});

		filteredData.forEach(row => {
			row.allocationsList.forEach(allocation => {
				if (chartState.selectedFund === "total" ||
					chartState.selectedFund === "cerf/cbpf" ||
					lists.fundTypesList[allocation.FundId] === chartState.selectedFund) {
					if (chartState.selectedChart === "allocationsByCountry" ||
						(chartState.selectedChart === "allocationsBySector" && !chartState.selectedCluster.length) ||
						(chartState.selectedChart === "allocationsByType" && !chartState.selectedType.length) ||
						(chartState.selectedChart === "allocationsBySector" && chartState.selectedCluster.indexOf(allocation.ClusterId + "") > -1) ||
						(chartState.selectedChart === "allocationsByType" && chartState.selectedType.indexOf(allocation.AllocationSurceId + "") > -1)) {
						allocation.ProjList.toString().split(separator).forEach(e => numberOfProjects.add(e));
						numberOfPartners.add(allocation.PartnerCode);
					};
				};
			});
		});

		const updateTransition = d3.transition()
			.duration(duration);

		updateValues(chartState.selectedChart === "allocationsByCountry" ? "Country" :
			chartState.selectedChart === "allocationsBySector" ? "Sector" : "Type");

		function updateValues(selector) {

			selections[`by${selector}AllocationsValue`].transition(updateTransition)
				.textTween((_, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalAllocations);
					return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
				});

			selections[`by${selector}AllocationsText`].text((chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "Total" :
				chartState.selectedFund.toUpperCase()) + " allocations");

			selections[`by${selector}CountriesValue`].transition(updateTransition)
				.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfCountries));

			selections[`by${selector}CountriesText`].html(numberOfCountries > 1 ? "Countries" : "Country");

			selections[`by${selector}ProjectsValue`].transition(updateTransition)
				.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfProjects.size));

			selections[`by${selector}ProjectsText`].html(numberOfProjects.size > 1 ? "Projects" : "Project");

			selections[`by${selector}PartnersValue`].transition(updateTransition)
				.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfPartners.size));

			selections[`by${selector}PartnersText`].html(numberOfPartners.size > 1 ? "Partners" : "Partner");

		};

		//end of createColumnTopValues
	};

	function createColumnChart(originalData) {

		if (chartState.selectedChart === "allocationsByCountry") {
			const columnData = originalData.reduce((acc, curr) => {
				const foundRegion = acc.find(e => e.region === curr.region);
				if (foundRegion) {
					foundRegion.total += chartState.selectedFund === "total" ? curr.total : 0;
					foundRegion.cerf += chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr.cerf : 0;
					foundRegion.cbpf += chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr.cbpf : 0;
				} else {
					acc.push({
						region: curr.region,
						total: chartState.selectedFund === "total" ? curr.total : 0,
						cerf: chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr.cerf : 0,
						cbpf: chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr.cbpf : 0,
					});
				};
				return acc;
			}, []);
			columnData.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? ((b.cerf + b.cbpf) - (a.cerf + a.cbpf)) :
				b[chartState.selectedFund] - a[chartState.selectedFund]);
			columnData.forEach(row => row.clicked = chartState.selectedRegion.indexOf(row.region) > -1);
			createAllocationsByCountryColumnChart(columnData);
		};
		if (chartState.selectedChart === "allocationsBySector") {
			const columnData = originalData.reduce((acc, curr) => {
				for (const key in lists.clustersList) {
					const foundCluster = acc.find(e => e.cluster === lists.clustersList[key]);
					if (foundCluster) {
						foundCluster.total += chartState.selectedFund === "total" ? curr[`cluster${separator}${key}${separator}total`] : 0;
						foundCluster.cerf += chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr[`cluster${separator}${key}${separator}cerf`] : 0;
						foundCluster.cbpf += chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr[`cluster${separator}${key}${separator}cbpf`] : 0;
					} else {
						acc.push({
							cluster: lists.clustersList[key],
							clusterId: key,
							total: chartState.selectedFund === "total" ? curr[`cluster${separator}${key}${separator}total`] : 0,
							cerf: chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr[`cluster${separator}${key}${separator}cerf`] : 0,
							cbpf: chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr[`cluster${separator}${key}${separator}cbpf`] : 0,
						});
					};
				};
				return acc;
			}, []);
			columnData.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? ((b.cerf + b.cbpf) - (a.cerf + a.cbpf)) :
				b[chartState.selectedFund] - a[chartState.selectedFund]);
			columnData.forEach(row => row.clicked = chartState.selectedCluster.indexOf(row.clusterId) > -1);
			createAllocationsBySectorColumnChart(columnData);
		};
		if (chartState.selectedChart === "allocationsByType") {
			const columnData = originalData.reduce((acc, curr) => {
				for (const key in lists.allocationTypesList) {
					const foundCluster = acc.find(e => e.allocationType === lists.allocationTypesList[key]);
					if (foundCluster) {
						foundCluster.total += chartState.selectedFund === "total" ? curr[`type${separator}${key}${separator}total`] : 0;
						foundCluster.cerf += chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr[`type${separator}${key}${separator}cerf`] : 0;
						foundCluster.cbpf += chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr[`type${separator}${key}${separator}cbpf`] : 0;
					} else {
						acc.push({
							allocationType: lists.allocationTypesList[key],
							allocationTypeId: key,
							total: chartState.selectedFund === "total" ? curr[`type${separator}${key}${separator}total`] : 0,
							cerf: chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr[`type${separator}${key}${separator}cerf`] : 0,
							cbpf: chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr[`type${separator}${key}${separator}cbpf`] : 0,
						});
					};
				};
				return acc;
			}, []);
			columnData.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? ((b.cerf + b.cbpf) - (a.cerf + a.cbpf)) :
				b[chartState.selectedFund] - a[chartState.selectedFund]);
			columnData.forEach(row => row.clicked = chartState.selectedType.indexOf(row.allocationTypeId) > -1);
			createAllocationsByTypeColumnChart(columnData);
		};

		function createAllocationsByCountryColumnChart(columnData) {

			const filteredData = columnData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

			yScaleColumnByCountry.domain(filteredData.map(e => e.region))
				.range([svgColumnChartPaddingByCountry[0],
					Math.min(svgColumnChartHeight - svgColumnChartPaddingByCountry[2], maxColumnRectHeight * 2 * (filteredData.length + 1))
				]);

			svgColumnChartByCountry.attr("height", yScaleColumnByCountry.range()[1] + svgColumnChartPaddingByCountry[2]);

			xScaleColumnByCountry.domain([0, d3.max(filteredData, e => chartState.selectedFund === "total" ? e.total : e.cbpf + e.cerf)]);

			const stackedData = stack(filteredData);

			let barsGroupsColumn = svgColumnChartByCountry.selectAll("." + classPrefix + "barsGroupsColumn")
				.data(stackedData, d => d.key);

			const barsGroupsColumnExit = barsGroupsColumn.exit().remove();

			const barsGroupsColumnEnter = barsGroupsColumn.enter()
				.append("g")
				.attr("class", classPrefix + "barsGroupsColumn")
				.attr("pointer-events", "none");

			barsGroupsColumn = barsGroupsColumnEnter.merge(barsGroupsColumn);

			let barsColumn = barsGroupsColumn.selectAll("." + classPrefix + "barsColumn")
				.data(d => d, d => d.data.region);

			const barsColumnExit = barsColumn.exit()
				.transition()
				.duration(duration)
				.attr("width", 0)
				.attr("x", svgColumnChartPaddingByCountry[3])
				.style("opacity", 0)
				.remove();

			const barsColumnEnter = barsColumn.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumn")
				.attr("height", yScaleColumnByCountry.bandwidth())
				.attr("width", 0)
				.style("fill", (d, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return colors[thisKey];
				})
				.attr("x", xScaleColumnByCountry(0))
				.attr("y", d => yScaleColumnByCountry(d.data.region))

			barsColumn = barsColumnEnter.merge(barsColumn);

			barsColumn.transition()
				.duration(duration)
				.attr("height", yScaleColumnByCountry.bandwidth())
				.attr("y", d => yScaleColumnByCountry(d.data.region))
				.attr("x", d => d[0] === d[1] ? xScaleColumnByCountry(0) : xScaleColumnByCountry(d[0]))
				.attr("width", d => xScaleColumnByCountry(d[1]) - xScaleColumnByCountry(d[0]));

			let labelsColumn = svgColumnChartByCountry.selectAll("." + classPrefix + "labelsColumnByCountry")
				.data(filteredData, d => d.region);

			const labelsColumnExit = labelsColumn.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingByCountry[3] + labelsColumnPadding)
				.remove();

			const labelsColumnEnter = labelsColumn.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnByCountry")
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingByCountry[3] + labelsColumnPadding)
				.attr("y", d => yScaleColumnByCountry(d.region) + yScaleColumnByCountry.bandwidth() / 2);

			labelsColumn = labelsColumnEnter.merge(labelsColumn);

			labelsColumn.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => xScaleColumnByCountry(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) + labelsColumnPadding)
				.attr("y", d => yScaleColumnByCountry(d.region) + yScaleColumnByCountry.bandwidth() / 2)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
					return t => formatSIFloat(interpolator(t)).replace("G", "B");
				});

			let barsColumnTooltipRectangles = svgColumnChartByCountry.selectAll("." + classPrefix + "barsColumnTooltipRectangles")
				.data(filteredData, d => d.region);

			const barsColumnTooltipRectanglesExit = barsColumnTooltipRectangles.exit().remove();

			const barsColumnTooltipRectanglesEnter = barsColumnTooltipRectangles.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumnTooltipRectangles")
				.attr("pointer-events", "all")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("width", svgColumnChartWidth)
				.attr("height", yScaleColumnByCountry.step())
				.attr("y", d => yScaleColumnByCountry(d.region) - yScaleColumnByCountry.bandwidth() / 2);

			barsColumnTooltipRectangles = barsColumnTooltipRectanglesEnter.merge(barsColumnTooltipRectangles);

			barsColumnTooltipRectangles.transition()
				.duration(duration)
				.attr("y", d => yScaleColumnByCountry(d.region) - yScaleColumnByCountry.bandwidth() / 2);

			barsColumnTooltipRectangles.on("mouseover", mouseoverBarsColumnTooltipRectangles)
				.on("mouseout", mouseoutBarsColumnTooltipRectangles)
				.on("click", clickBarsColumnTooltipRectangles);

			function mouseoverBarsColumnTooltipRectangles(event, d) {

				if (!d.clicked) {
					chartState.selectedRegion.push(d.region);
				};

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBars();

			};

			function mouseoutBarsColumnTooltipRectangles(event, d) {

				if (!d.clicked) {
					const index = chartState.selectedRegion.indexOf(d.region);
					if (index > -1) {
						chartState.selectedRegion.splice(index, 1);
					};
				};

				const data = filterData(originalData);

				mouseoverBarsColumnTimeout = setTimeout(() => {

					createColumnTopValues(originalData);

					drawMap(data, originalData);
					drawLegend(data);
					drawBarChart(data, originalData);

				}, timeoutDuration);

				highlightBars();

			};

			function clickBarsColumnTooltipRectangles(event, d) {

				d.clicked = !d.clicked;

				if (!d.clicked) {
					const index = chartState.selectedRegion.indexOf(d.region);
					chartState.selectedRegion.splice(index, 1);
				} else {
					if (chartState.selectedRegion.indexOf(d.region) === -1) {
						chartState.selectedRegion.push(d.region);
					}
				};

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBars();

			};

			function highlightBars() {
				barsColumn.style("fill", (e, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return chartState.selectedRegion.indexOf(e.data.region) > -1 ? d3.color(colors[thisKey]).darker(0.5) : colors[thisKey];
				});

				yAxisGroupColumnByCountry.selectAll(".tick text")
					.classed(classPrefix + "darkTick", e => chartState.selectedRegion.indexOf(e) > -1);
			};

			xAxisColumnByCountry.tickSizeInner(-(yScaleColumnByCountry.range()[1] - yScaleColumnByCountry.range()[0]));

			xAxisGroupColumnByCountry.transition()
				.duration(duration)
				.call(xAxisColumnByCountry);

			xAxisGroupColumnByCountry.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			yAxisGroupColumnByCountry.transition()
				.duration(duration)
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxisColumnByCountry);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => d.split(" ")[0] === "South-Eastern" ? "South-East." : d.split(" ")[0] === "Horn" ? "Horn of" : d.split(" ")[0])
					.attr("x", -(yAxisColumnByCountry.tickPadding() + yAxisColumnByCountry.tickSize()))
					.attr("dy", "-0.3em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxisColumnByCountry.tickPadding() + yAxisColumnByCountry.tickSize()))
					.text(d => d.split(" ")[1] === "of" ? "Africa" : d.split(" ")[1]);
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

			highlightBars();

			//end of createAllocationsByCountryColumnChart
		};

		function createAllocationsBySectorColumnChart(columnData) {

			const filteredData = columnData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

			yScaleColumnBySector.domain(filteredData.map(e => e.cluster))
				.range([svgColumnChartPaddingBySector[0],
					Math.min(svgColumnChartHeight - svgColumnChartPaddingBySector[2], maxColumnRectHeight * 2 * (filteredData.length + 1))
				]);

			svgColumnChartBySector.attr("height", yScaleColumnBySector.range()[1] + svgColumnChartPaddingBySector[2]);

			xScaleColumnBySector.domain([0, d3.max(filteredData, e => chartState.selectedFund === "total" ? e.total : e.cbpf + e.cerf)]);

			const stackedData = stack(filteredData);

			let barsGroupsColumn = svgColumnChartBySector.selectAll("." + classPrefix + "barsGroupsColumn")
				.data(stackedData, d => d.key);

			const barsGroupsColumnExit = barsGroupsColumn.exit().remove();

			const barsGroupsColumnEnter = barsGroupsColumn.enter()
				.append("g")
				.attr("class", classPrefix + "barsGroupsColumn")
				.attr("pointer-events", "none");

			barsGroupsColumn = barsGroupsColumnEnter.merge(barsGroupsColumn);

			let barsColumn = barsGroupsColumn.selectAll("." + classPrefix + "barsColumn")
				.data(d => d, d => d.data.cluster);

			const barsColumnExit = barsColumn.exit()
				.transition()
				.duration(duration)
				.attr("width", 0)
				.attr("x", svgColumnChartPaddingBySector[3])
				.style("opacity", 0)
				.remove();

			const barsColumnEnter = barsColumn.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumn")
				.attr("height", yScaleColumnBySector.bandwidth())
				.attr("width", 0)
				.style("fill", (d, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return colors[thisKey]
				})
				.attr("x", xScaleColumnBySector(0))
				.attr("y", d => yScaleColumnBySector(d.data.cluster))

			barsColumn = barsColumnEnter.merge(barsColumn);

			barsColumn.transition()
				.duration(duration)
				.attr("height", yScaleColumnBySector.bandwidth())
				.attr("y", d => yScaleColumnBySector(d.data.cluster))
				.attr("x", d => d[0] === d[1] ? xScaleColumnBySector(0) : xScaleColumnBySector(d[0]))
				.attr("width", d => xScaleColumnBySector(d[1]) - xScaleColumnBySector(d[0]));

			let labelsColumn = svgColumnChartBySector.selectAll("." + classPrefix + "labelsColumnBySector")
				.data(filteredData, d => d.cluster);

			const labelsColumnExit = labelsColumn.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingBySector[3] + labelsColumnPadding)
				.remove();

			const labelsColumnEnter = labelsColumn.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnBySector")
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingBySector[3] + labelsColumnPadding)
				.attr("y", d => yScaleColumnBySector(d.cluster) + yScaleColumnBySector.bandwidth() / 2);

			labelsColumn = labelsColumnEnter.merge(labelsColumn);

			labelsColumn.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => xScaleColumnBySector(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) + labelsColumnPadding)
				.attr("y", d => yScaleColumnBySector(d.cluster) + yScaleColumnBySector.bandwidth() / 2)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
					return t => formatSIFloat(interpolator(t)).replace("G", "B");
				});

			let clusterIconsColumn = svgColumnChartBySector.selectAll("." + classPrefix + "clusterIconsColumn")
				.data(filteredData, d => d.cluster);

			const clusterIconsColumnExit = clusterIconsColumn.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const clusterIconsColumnEnter = clusterIconsColumn.enter()
				.append("image")
				.attr("class", classPrefix + "clusterIconsColumn")
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingBySector[3] - clusterIconPadding - clusterIconSize - yAxisColumnBySector.tickSize())
				.attr("y", d => yScaleColumnBySector(d.cluster) - (clusterIconSize - yScaleColumnBySector.bandwidth()) / 2)
				.attr("width", clusterIconSize)
				.attr("height", clusterIconSize)
				.attr("href", d => clustersIconsData[d.clusterId]);

			clusterIconsColumn = clusterIconsColumnEnter.merge(clusterIconsColumn);

			clusterIconsColumn.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("y", d => yScaleColumnBySector(d.cluster) - (clusterIconSize - yScaleColumnBySector.bandwidth()) / 2);

			let barsColumnTooltipRectangles = svgColumnChartBySector.selectAll("." + classPrefix + "barsColumnTooltipRectangles")
				.data(filteredData, d => d.cluster);

			const barsColumnTooltipRectanglesExit = barsColumnTooltipRectangles.exit().remove();

			const barsColumnTooltipRectanglesEnter = barsColumnTooltipRectangles.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumnTooltipRectangles")
				.attr("pointer-events", "all")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("width", svgColumnChartWidth)
				.attr("height", yScaleColumnBySector.step())
				.attr("y", d => yScaleColumnBySector(d.cluster) - yScaleColumnBySector.bandwidth() / 2);

			barsColumnTooltipRectangles = barsColumnTooltipRectanglesEnter.merge(barsColumnTooltipRectangles);

			barsColumnTooltipRectangles.transition()
				.duration(duration)
				.attr("y", d => yScaleColumnBySector(d.cluster) - yScaleColumnBySector.bandwidth() / 2);

			barsColumnTooltipRectangles.on("mouseover", mouseoverBarsColumnTooltipRectangles)
				.on("mouseout", mouseoutBarsColumnTooltipRectangles)
				.on("click", clickBarsColumnTooltipRectangles);

			function mouseoverBarsColumnTooltipRectangles(event, d) {

				if (!d.clicked) {
					chartState.selectedCluster.push(d.clusterId);
				};

				covid19InCluster = chartState.selectedCluster.includes("16");

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBars();

			};

			function mouseoutBarsColumnTooltipRectangles(event, d) {

				if (!d.clicked) {
					const index = chartState.selectedCluster.indexOf(d.clusterId);
					if (index > -1) {
						chartState.selectedCluster.splice(index, 1);
					};
				};

				const data = filterData(originalData);

				mouseoverBarsColumnTimeout = setTimeout(() => {

					createColumnTopValues(originalData);

					drawMap(data, originalData);
					drawLegend(data);
					drawBarChart(data, originalData);

				}, timeoutDuration);

				highlightBars();

			};

			function clickBarsColumnTooltipRectangles(event, d) {

				d.clicked = !d.clicked;

				if (!d.clicked) {
					const index = chartState.selectedCluster.indexOf(d.clusterId);
					chartState.selectedCluster.splice(index, 1);
				} else {
					if (chartState.selectedCluster.indexOf(d.clusterId) === -1) {
						chartState.selectedCluster.push(d.clusterId);
					}
				};

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBars();

			};

			function highlightBars() {
				barsColumn.style("fill", (e, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return chartState.selectedCluster.indexOf(e.data.clusterId) > -1 ? d3.color(colors[thisKey]).darker(0.5) : colors[thisKey];
				});

				yAxisGroupColumnBySector.selectAll(".tick text")
					.classed(classPrefix + "darkTick", e => chartState.selectedCluster.indexOf(Object.keys(lists.clustersList).find(f => lists.clustersList[f] === e)) > -1);
			};

			xAxisColumnBySector.tickSizeInner(-(yScaleColumnBySector.range()[1] - yScaleColumnBySector.range()[0]))

			xAxisGroupColumnBySector.transition()
				.duration(duration)
				.call(xAxisColumnBySector);

			xAxisGroupColumnBySector.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			yAxisGroupColumnBySector.transition()
				.duration(duration)
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxisColumnBySector);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => clusterNamesScale(d).split(" ")[0])
					.attr("x", -(yAxisColumnBySector.tickPadding() + yAxisColumnBySector.tickSize()))
					.attr("dy", d => clusterNamesScale(d).indexOf(" ") > -1 ? "-0.3em" : "0.32em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxisColumnBySector.tickPadding() + yAxisColumnBySector.tickSize()))
					.text(d => clusterNamesScale(d).split(" ")[1]);
				sel.selectAll(".tick")
					.filter(d => d === "COVID-19")
					.append("text")
					.attr("width", 14)
					.attr("height", 14)
					.attr("x", -88)
					.attr("y", -8)
					.attr("class", "fas fa-info-circle")
					.style("color", "#666");
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

			highlightBars();

			//end of createAllocationsBySectorColumnChart
		};

		function createAllocationsByTypeColumnChart(columnDataType) {

			if (chartState.selectedFund === "cbpf") {
				columnChartContainerByTypeCerf.transition()
					.duration(duration)
					.style("height", "0px");
			} else {
				if (!parseFloat(columnChartContainerByTypeCerf.style("height"))) {
					columnChartContainerByTypeCerf.transition()
						.duration(duration)
						.style("height", null);
				};
			};

			if (chartState.selectedFund === "cerf") {
				columnChartContainerByTypeCbpf.transition()
					.duration(duration)
					.style("height", "0px");
			} else {
				if (!parseFloat(columnChartContainerByTypeCbpf.style("height"))) {
					columnChartContainerByTypeCbpf.transition()
						.duration(duration)
						.style("height", null);
				};
			};

			const cerfData = columnDataType.filter(d => cerfAllocationTypes.indexOf(d.allocationTypeId) > -1);
			const cbpfData = columnDataType.filter(d => cbpfAllocationTypes.indexOf(d.allocationTypeId) > -1);

			const cerfFilteredData = cerfData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
			const cbpfFilteredData = cbpfData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

			xScaleColumnByType.domain([0,
				Math.max(cerfFilteredData.length ? d3.max(cerfFilteredData, e => chartState.selectedFund === "total" ? e.total : e.cbpf + e.cerf) : 0,
					cbpfFilteredData.length ? d3.max(cbpfFilteredData, e => chartState.selectedFund === "total" ? e.total : e.cbpf + e.cerf) : 0)
			]);

			const stackedDataCerf = stack(cerfFilteredData);
			const stackedDataCbpf = stack(cbpfFilteredData);

			//CERF chart

			let barsGroupsColumnCerf = svgColumnChartByTypeCerf.selectAll("." + classPrefix + "barsGroupsColumnCerf")
				.data(stackedDataCerf, d => d.key);

			const barsGroupsColumnCerfExit = barsGroupsColumnCerf.exit().remove();

			const barsGroupsColumnCerfEnter = barsGroupsColumnCerf.enter()
				.append("g")
				.attr("class", classPrefix + "barsGroupsColumnCerf")
				.attr("pointer-events", "none");

			barsGroupsColumnCerf = barsGroupsColumnCerfEnter.merge(barsGroupsColumnCerf);

			let barsColumnCerf = barsGroupsColumnCerf.selectAll("." + classPrefix + "barsColumnCerf")
				.data(d => d, d => d.data.allocationType);

			const barsColumnCerfExit = barsColumnCerf.exit()
				.transition()
				.duration(duration)
				.attr("width", 0)
				.attr("x", svgColumnChartPaddingByType[3])
				.style("opacity", 0)
				.remove();

			const barsColumnCerfEnter = barsColumnCerf.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumnCerf")
				.attr("height", yScaleColumnByTypeCerf.bandwidth())
				.attr("width", 0)
				.style("fill", (d, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return colors[thisKey]
				})
				.attr("x", xScaleColumnByType(0))
				.attr("y", d => yScaleColumnByTypeCerf(d.data.allocationType))

			barsColumnCerf = barsColumnCerfEnter.merge(barsColumnCerf);

			barsColumnCerf.transition()
				.duration(duration)
				.attr("height", yScaleColumnByTypeCerf.bandwidth())
				.attr("y", d => yScaleColumnByTypeCerf(d.data.allocationType))
				.attr("x", d => d[0] === d[1] ? xScaleColumnByType(0) : xScaleColumnByType(d[0]))
				.attr("width", d => xScaleColumnByType(d[1]) - xScaleColumnByType(d[0]));

			let labelsColumnCerf = svgColumnChartByTypeCerf.selectAll("." + classPrefix + "labelsColumnByTypeCerf")
				.data(cerfFilteredData, d => d.allocationType);

			const labelsColumnCerfExit = labelsColumnCerf.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingByType[3] + labelsColumnPadding)
				.remove();

			const labelsColumnCerfEnter = labelsColumnCerf.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnByTypeCerf")
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingByType[3] + labelsColumnPadding)
				.attr("y", d => yScaleColumnByTypeCerf(d.allocationType) + yScaleColumnByTypeCerf.bandwidth() / 2);

			labelsColumnCerf = labelsColumnCerfEnter.merge(labelsColumnCerf);

			labelsColumnCerf.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => xScaleColumnByType(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) + labelsColumnPadding)
				.attr("y", d => yScaleColumnByTypeCerf(d.allocationType) + yScaleColumnByTypeCerf.bandwidth() / 2)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
					return t => formatSIFloat(interpolator(t)).replace("G", "B");
				});

			let barsColumnCerfTooltipRectangles = svgColumnChartByTypeCerf.selectAll("." + classPrefix + "barsColumnCerfTooltipRectangles")
				.data(cerfFilteredData, d => d.allocationType);

			const barsColumnCerfTooltipRectanglesExit = barsColumnCerfTooltipRectangles.exit().remove();

			const barsColumnCerfTooltipRectanglesEnter = barsColumnCerfTooltipRectangles.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumnCerfTooltipRectangles")
				.attr("pointer-events", "all")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("width", svgColumnChartWidth)
				.attr("height", yScaleColumnByTypeCerf.step())
				.attr("y", d => yScaleColumnByTypeCerf(d.allocationType) - yScaleColumnByTypeCerf.bandwidth() / 2);

			barsColumnCerfTooltipRectangles = barsColumnCerfTooltipRectanglesEnter.merge(barsColumnCerfTooltipRectangles);

			barsColumnCerfTooltipRectangles.transition()
				.duration(duration)
				.attr("y", d => yScaleColumnByTypeCerf(d.allocationType) - yScaleColumnByTypeCerf.bandwidth() / 2);

			barsColumnCerfTooltipRectangles.on("mouseover", mouseoverBarsColumnCerfTooltipRectangles)
				.on("mouseout", mouseoutBarsColumnCerfTooltipRectangles)
				.on("click", clickBarsColumnCerfTooltipRectangles);

			function mouseoverBarsColumnCerfTooltipRectangles(event, d) {

				if (!d.clicked) {
					chartState.selectedType.push(d.allocationTypeId);
				};

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBarsCerf();

			};

			function mouseoutBarsColumnCerfTooltipRectangles(event, d) {

				if (!d.clicked) {
					const index = chartState.selectedType.indexOf(d.allocationTypeId);
					if (index > -1) {
						chartState.selectedType.splice(index, 1);
					};
				};

				const data = filterData(originalData);

				mouseoverBarsColumnTimeout = setTimeout(() => {

					createColumnTopValues(originalData);

					drawMap(data, originalData);
					drawLegend(data);
					drawBarChart(data, originalData);

				}, timeoutDuration);

				highlightBarsCerf();

			};

			function clickBarsColumnCerfTooltipRectangles(event, d) {

				d.clicked = !d.clicked;

				if (!d.clicked) {
					const index = chartState.selectedType.indexOf(d.allocationTypeId);
					chartState.selectedType.splice(index, 1);
				} else {
					if (chartState.selectedType.indexOf(d.allocationTypeId) === -1) {
						chartState.selectedType.push(d.allocationTypeId);
					}
				};

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBarsCerf();

			};

			function highlightBarsCerf() {
				barsColumnCerf.style("fill", (e, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return chartState.selectedType.indexOf(e.data.allocationTypeId) > -1 ? d3.color(colors[thisKey]).darker(0.5) : colors[thisKey];
				});

				yAxisGroupColumnByTypeCerf.selectAll(".tick text")
					.classed(classPrefix + "darkTick", e => chartState.selectedType.indexOf(Object.keys(lists.allocationTypesList).find(f => lists.allocationTypesList[f] === e)) > -1);
			};

			xAxisGroupColumnByTypeCerf.transition()
				.duration(duration)
				.call(xAxisColumnByType);

			xAxisGroupColumnByTypeCerf.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			yAxisGroupColumnByTypeCerf.transition()
				.duration(duration)
				.call(customAxisCerf);

			function customAxisCerf(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxisColumnByTypeCerf);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => d.split(" ")[0])
					.attr("x", -(yAxisColumnByTypeCerf.tickPadding() + yAxisColumnByTypeCerf.tickSize()))
					.attr("dy", "-0.3em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxisColumnByTypeCerf.tickPadding() + yAxisColumnByTypeCerf.tickSize()))
					.text(d => d.split(" ")[1]);
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

			highlightBarsCerf();

			//CBPF chart

			let barsGroupsColumnCbpf = svgColumnChartByTypeCbpf.selectAll("." + classPrefix + "barsGroupsColumnCbpf")
				.data(stackedDataCbpf, d => d.key);

			const barsGroupsColumnCbpfExit = barsGroupsColumnCbpf.exit().remove();

			const barsGroupsColumnCbpfEnter = barsGroupsColumnCbpf.enter()
				.append("g")
				.attr("class", classPrefix + "barsGroupsColumnCbpf")
				.attr("pointer-events", "none");

			barsGroupsColumnCbpf = barsGroupsColumnCbpfEnter.merge(barsGroupsColumnCbpf);

			let barsColumnCbpf = barsGroupsColumnCbpf.selectAll("." + classPrefix + "barsColumnCbpf")
				.data(d => d, d => d.data.allocationType);

			const barsColumnCbpfExit = barsColumnCbpf.exit()
				.transition()
				.duration(duration)
				.attr("width", 0)
				.attr("x", svgColumnChartPaddingByType[3])
				.style("opacity", 0)
				.remove();

			const barsColumnCbpfEnter = barsColumnCbpf.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumnCbpf")
				.attr("height", yScaleColumnByTypeCbpf.bandwidth())
				.attr("width", 0)
				.style("fill", (d, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return colors[thisKey]
				})
				.attr("x", xScaleColumnByType(0))
				.attr("y", d => yScaleColumnByTypeCbpf(d.data.allocationType))

			barsColumnCbpf = barsColumnCbpfEnter.merge(barsColumnCbpf);

			barsColumnCbpf.transition()
				.duration(duration)
				.attr("height", yScaleColumnByTypeCbpf.bandwidth())
				.attr("y", d => yScaleColumnByTypeCbpf(d.data.allocationType))
				.attr("x", d => d[0] === d[1] ? xScaleColumnByType(0) : xScaleColumnByType(d[0]))
				.attr("width", d => xScaleColumnByType(d[1]) - xScaleColumnByType(d[0]));

			let labelsColumnCbpf = svgColumnChartByTypeCbpf.selectAll("." + classPrefix + "labelsColumnByTypeCbpf")
				.data(cbpfFilteredData, d => d.allocationType);

			const labelsColumnCbpfExit = labelsColumnCbpf.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingByType[3] + labelsColumnPadding)
				.remove();

			const labelsColumnCbpfEnter = labelsColumnCbpf.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnByTypeCbpf")
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingByType[3] + labelsColumnPadding)
				.attr("y", d => yScaleColumnByTypeCbpf(d.allocationType) + yScaleColumnByTypeCbpf.bandwidth() / 2);

			labelsColumnCbpf = labelsColumnCbpfEnter.merge(labelsColumnCbpf);

			labelsColumnCbpf.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", d => xScaleColumnByType(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) + labelsColumnPadding)
				.attr("y", d => yScaleColumnByTypeCbpf(d.allocationType) + yScaleColumnByTypeCbpf.bandwidth() / 2)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
					return t => formatSIFloat(interpolator(t)).replace("G", "B");
				});

			let barsColumnCbpfTooltipRectangles = svgColumnChartByTypeCbpf.selectAll("." + classPrefix + "barsColumnCbpfTooltipRectangles")
				.data(cbpfFilteredData, d => d.allocationType);

			const barsColumnCbpfTooltipRectanglesExit = barsColumnCbpfTooltipRectangles.exit().remove();

			const barsColumnCbpfTooltipRectanglesEnter = barsColumnCbpfTooltipRectangles.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumnCbpfTooltipRectangles")
				.attr("pointer-events", "all")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("width", svgColumnChartWidth)
				.attr("height", yScaleColumnByTypeCbpf.step())
				.attr("y", d => yScaleColumnByTypeCbpf(d.allocationType) - yScaleColumnByTypeCbpf.bandwidth() / 2);

			barsColumnCbpfTooltipRectangles = barsColumnCbpfTooltipRectanglesEnter.merge(barsColumnCbpfTooltipRectangles);

			barsColumnCbpfTooltipRectangles.transition()
				.duration(duration)
				.attr("y", d => yScaleColumnByTypeCbpf(d.allocationType) - yScaleColumnByTypeCbpf.bandwidth() / 2);

			barsColumnCbpfTooltipRectangles.on("mouseover", mouseoverBarsColumnCbpfTooltipRectangles)
				.on("mouseout", mouseoutBarsColumnCbpfTooltipRectangles)
				.on("click", clickBarsColumnCbpfTooltipRectangles);

			function mouseoverBarsColumnCbpfTooltipRectangles(event, d) {

				if (!d.clicked) {
					chartState.selectedType.push(d.allocationTypeId);
				};

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBarsCbpf();

			};

			function mouseoutBarsColumnCbpfTooltipRectangles(event, d) {

				if (!d.clicked) {
					const index = chartState.selectedType.indexOf(d.allocationTypeId);
					if (index > -1) {
						chartState.selectedType.splice(index, 1);
					};
				};

				const data = filterData(originalData);

				mouseoverBarsColumnTimeout = setTimeout(() => {

					createColumnTopValues(originalData);

					drawMap(data, originalData);
					drawLegend(data);
					drawBarChart(data, originalData);

				}, timeoutDuration);

				highlightBarsCbpf();

			};

			function clickBarsColumnCbpfTooltipRectangles(event, d) {

				d.clicked = !d.clicked;

				if (!d.clicked) {
					const index = chartState.selectedType.indexOf(d.allocationTypeId);
					chartState.selectedType.splice(index, 1);
				} else {
					if (chartState.selectedType.indexOf(d.allocationTypeId) === -1) {
						chartState.selectedType.push(d.allocationTypeId);
					}
				};

				const data = filterData(originalData);

				clearTimeout(mouseoverBarsColumnTimeout);

				createColumnTopValues(originalData);

				drawMap(data, originalData);
				drawLegend(data);
				drawBarChart(data, originalData);

				highlightBarsCbpf();

			};

			function highlightBarsCbpf() {
				barsColumnCbpf.style("fill", (e, i, n) => {
					const thisKey = d3.select(n[i].parentNode).datum().key;
					return chartState.selectedType.indexOf(e.data.allocationTypeId) > -1 ? d3.color(colors[thisKey]).darker(0.5) : colors[thisKey];
				});

				yAxisGroupColumnByTypeCbpf.selectAll(".tick text")
					.classed(classPrefix + "darkTick", e => chartState.selectedType.indexOf(Object.keys(lists.allocationTypesList).find(f => lists.allocationTypesList[f] === e)) > -1);
			};

			xAxisGroupColumnByTypeCbpf.transition()
				.duration(duration)
				.call(xAxisColumnByType);

			xAxisGroupColumnByTypeCbpf.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			yAxisGroupColumnByTypeCbpf.transition()
				.duration(duration)
				.call(customAxisCbpf);

			function customAxisCbpf(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxisColumnByTypeCbpf);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => d.split(" ")[0])
					.attr("x", -(yAxisColumnByTypeCbpf.tickPadding() + yAxisColumnByTypeCbpf.tickSize()))
					.attr("dy", "-0.3em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxisColumnByTypeCbpf.tickPadding() + yAxisColumnByTypeCbpf.tickSize()))
					.text(d => d.split(" ")[1]);
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

			highlightBarsCbpf();

			//end of createAllocationsByTypeColumnChart
		};

		//end of createColumnChart
	};

	function filterData(originalData) {

		const data = [];

		originalData.forEach(row => {
			const copiedRow = Object.assign({}, row);
			if (chartState.selectedChart === "allocationsByCountry") {
				if (chartState.selectedFund === "total") {
					copiedRow.cbpf = 0;
					copiedRow.cerf = 0;
				};
				if (chartState.selectedFund === "cerf/cbpf") {
					copiedRow.total = 0;
				};
				if (chartState.selectedFund === "cerf") {
					copiedRow.cbpf = 0;
					copiedRow.total = 0;
				};
				if (chartState.selectedFund === "cbpf") {
					copiedRow.cerf = 0;
					copiedRow.total = 0;
				};
				if (chartState.selectedRegion.length === 0) {
					data.push(copiedRow);
				} else {
					if (chartState.selectedRegion.indexOf(copiedRow.region) > -1) data.push(copiedRow);
				};
			};
			if (chartState.selectedChart === "allocationsBySector") {
				copiedRow.total = 0;
				copiedRow.cerf = 0;
				copiedRow.cbpf = 0;

				for (const key in lists.clustersList) {
					if (chartState.selectedCluster.length === 0 || chartState.selectedCluster.indexOf(key) > -1) {
						if (chartState.selectedFund === "total") {
							copiedRow.total += copiedRow[`cluster${separator}${key}${separator}total`];
						};
						if (chartState.selectedFund === "cerf/cbpf") {
							copiedRow.cerf += copiedRow[`cluster${separator}${key}${separator}cerf`];
							copiedRow.cbpf += copiedRow[`cluster${separator}${key}${separator}cbpf`];
						};
						if (chartState.selectedFund === "cerf") {
							copiedRow.cerf += copiedRow[`cluster${separator}${key}${separator}cerf`];
						};
						if (chartState.selectedFund === "cbpf") {
							copiedRow.cbpf += copiedRow[`cluster${separator}${key}${separator}cbpf`];
						};
					};
				};

				data.push(copiedRow);
			};
			if (chartState.selectedChart === "allocationsByType") {
				copiedRow.total = 0;
				copiedRow.cerf = 0;
				copiedRow.cbpf = 0;

				if ((chartState.selectedFund === "cerf" && !d3.disjoint(cbpfAllocationTypes, chartState.selectedType)) ||
					(chartState.selectedFund === "cbpf" && !d3.disjoint(cerfAllocationTypes, chartState.selectedType))) chartState.selectedType.length = 0;

				for (const key in lists.allocationTypesList) {
					if (chartState.selectedType.length === 0 || chartState.selectedType.indexOf(key) > -1) {
						if (chartState.selectedFund === "total") {
							copiedRow.total += copiedRow[`type${separator}${key}${separator}total`];
						};
						if (chartState.selectedFund === "cerf/cbpf") {
							copiedRow.cerf += copiedRow[`type${separator}${key}${separator}cerf`];
							copiedRow.cbpf += copiedRow[`type${separator}${key}${separator}cbpf`];
						};
						if (chartState.selectedFund === "cerf") {
							copiedRow.cerf += copiedRow[`type${separator}${key}${separator}cerf`];
						};
						if (chartState.selectedFund === "cbpf") {
							copiedRow.cbpf += copiedRow[`type${separator}${key}${separator}cbpf`];
						};
					};
				};

				data.push(copiedRow);
			};
		});

		return data;

		//end of filterData
	};

	function verifyCentroids(data) {
		data.forEach(row => {
			if (!centroids[row.isoCode] || isNaN(centroids[row.isoCode].x) || isNaN(centroids[row.isoCode].y)) {
				if (!isNaN(lists.fundLatLongList[row.isoCode][0]) || !isNaN(lists.fundLatLongList[row.isoCode][1])) {
					centroids[row.isoCode] = {
						x: mapProjection([lists.fundLatLongList[row.isoCode][1], lists.fundLatLongList[row.isoCode][0]])[0],
						y: mapProjection([lists.fundLatLongList[row.isoCode][1], lists.fundLatLongList[row.isoCode][0]])[1]
					};
				} else {
					centroids[row.isoCode] = {
						x: mapProjection([0, 0])[0],
						y: mapProjection([0, 0])[1]
					};
					console.warn("Attention: " + row.isoCode + "(" + row.countryName + ") has no centroid");
				};
			};
		});
	};

	return draw;

	//end of createAllocations
};

function displayLabels(labelSelection) {
	labelSelection.each(function(d) {
		const outerElement = this;
		const outerBox = this.getBoundingClientRect();
		labelSelection.each(function(e) {
			if (outerElement !== this) {
				const innerBox = this.getBoundingClientRect();
				if (!(outerBox.right < innerBox.left ||
						outerBox.left > innerBox.right ||
						outerBox.bottom < innerBox.top ||
						outerBox.top > innerBox.bottom)) {
					if (chartState.selectedFund === "total" ? e.total < d.total : (e.cbpf + e.cerf) < (d.cbpf + d.cerf)) {
						d3.select(this).style("display", "none");
						d3.select(this.previousSibling).style("display", "none");
					} else {
						d3.select(outerElement).style("display", "none");
						d3.select(outerElement.previousSibling).style("display", "none");
					};
				};
			};
		});
	});
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits, value)(value);
};

function reverseFormat(s) {
	if (+s === 0) return 0;
	let returnValue;
	const transformation = {
		Y: Math.pow(10, 24),
		Z: Math.pow(10, 21),
		E: Math.pow(10, 18),
		P: Math.pow(10, 15),
		T: Math.pow(10, 12),
		G: Math.pow(10, 9),
		B: Math.pow(10, 9),
		M: Math.pow(10, 6),
		k: Math.pow(10, 3),
		h: Math.pow(10, 2),
		da: Math.pow(10, 1),
		d: Math.pow(10, -1),
		c: Math.pow(10, -2),
		m: Math.pow(10, -3),
		μ: Math.pow(10, -6),
		n: Math.pow(10, -9),
		p: Math.pow(10, -12),
		f: Math.pow(10, -15),
		a: Math.pow(10, -18),
		z: Math.pow(10, -21),
		y: Math.pow(10, -24)
	};
	Object.keys(transformation).some(k => {
		if (s.indexOf(k) > 0) {
			returnValue = parseFloat(s.split(k)[0]) * transformation[k];
			return true;
		}
	});
	return returnValue;
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function textWithCommas(arr) {
	return arr.reduce((acc, curr, index) => acc + (index >= arr.length - 2 ? index > arr.length - 2 ? curr : curr + " and " : curr + ", "), "");
};

function makeOrdinal(value) {
	return value % 10 === 1 && value !== 11 ?
		"st" : value % 10 === 2 && value !== 12 ?
		"nd" : value % 10 === 3 && value !== 13 ?
		"rd" : "th";
};

export { createAllocations };