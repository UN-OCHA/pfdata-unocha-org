//|device features
const isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches);

//|set constants
const generalClassPrefix = "pfbihp",
	localStorageTime = 3600000,
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	formatLastModified = d3.utcFormat("%d/%m/%Y %H:%M:%S"),
	localVariable = d3.local(),
	duration = 1000,
	unBlue = "#65A8DC",
	cerfColor = "#FBD45C",
	cbpfColor = "#F37261",
	formatMoney0Decimals = d3.format(",.0f"),
	allYears = "all",
	lastModifiedUrl = "https://cbpfapi.unocha.org/vo2/odata/LastModified",
	unworldmapUrl = "https://cbpfgms.github.io/pfbi-data/map/unworldmap.json",
	masterFundsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
	masterDonorsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstDonor.json",
	masterAllocationTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
	masterFundTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstFund.json",
	masterPartnerTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
	masterClusterTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json",
	contributionsDataUrl = "https://cbpfgms.github.io/pfbi-data/contributionbycerfcbpf.csv",
	contributionsDataUrlClosedFunds = "https://cbpfgms.github.io/pfbi-data/contributionbycerfcbpfAll.csv",
	allocationsDataUrl = "https://cbpfgms.github.io/pfbi-data/allocationSummary.csv",
	chartTypesAllocations = ["allocationsByCountry", "allocationsBySector", "allocationsByType"],
	chartTypesContributions = ["contributionsByCerfCbpf", "contributionsByDonor"],
	fundValues = ["total", "cerf/cbpf", "cerf", "cbpf"],
	contributionTypes = ["pledged", "paid", "total"],
	separator = "##",
	colorsObject = {
		total: unBlue,
		cerf: cerfColor,
		cbpf: cbpfColor,
		cerfAnalogous: ["#E48F07", "#E2A336", "#FBCC23", "#FBE23E"],
		cbpfAnalogous: ["#B52625", "#CE2E2D", cbpfColor, "#F79C8F"]
	},
	queryStringValues = new URLSearchParams(location.search),
	defaultValues = {
		year: currentYear
	};

//|constants populated with the data
const yearsArrayAllocations = [],
	yearsArrayContributions = [],
	yearsArrayContributionsCbpf = [],
	yearsArrayContributionsCerf = [],
	donorsInSelectedYear = [],
	fundsInSelectedYear = [],
	fundNamesList = {},
	fundAbbreviatedNamesList = {},
	fundRegionsList = {},
	fundIsoCodesList = {},
	fundIsoCodes3List = {},
	fundLatLongList = {},
	donorNamesList = {},
	donorTypesList = {},
	donorIsoCodesList = {},
	fundTypesList = {},
	partnersList = {},
	clustersList = {},
	allocationTypesList = {},
	fundNamesListKeys = [],
	donorNamesListKeys = [],
	topValues = {
		contributions: 0,
		allocations: 0,
		donors: new Set(),
		projects: new Set()
	};

//|set variables
let spinnerContainer,
	drawAllocations,
	drawContributionsByCerfCbpf,
	drawContributionsByDonor,
	allocationsData,
	contributionsDataByDonor,
	cerfPooledFundId;

//|selections
const selections = {
	chartContainerDiv: d3.select("#main-map-panel").append("div").attr("class", generalClassPrefix + "chartContainerDiv"),
	allocationsTopFigure: d3.select("#high-level-fugure-allocations"),
	contributionsTopFigure: d3.select("#high-level-fugure-contributions"),
	allocationsTopFigurePanel: d3.select(".allocationsFigurePanel"),
	contributionsTopFigurePanel: d3.select(".contributionsFigurePanel"),
	donorsTopFigure: d3.select("#high-level-fugure-donors"),
	projectsTopFigure: d3.select("#high-level-fugure-projects"),
	yearDropdown: d3.select("#ddlDropdown"),
	sideNavContainer: d3.select("#layoutSidenav"),
	lastModifiedSpan: d3.select("#updatedOn"),
	navlinkAllocationsByCountry: d3.select("#navAllocationsByCountry"),
	navlinkAllocationsBySector: d3.select("#navAllocationsBySector"),
	navlinkAllocationsByType: d3.select("#navAllocationsByType"),
	navlinkContributionsByCerfCbpf: d3.select("#navContributionsByCerfCbpf"),
	navlinkContributionsByDonor: d3.select("#navContributionsByDonor"),
	byCountryAllocationsValue: d3.select("#byCountryAllocationsValue"),
	byCountryAllocationsText: d3.select("#byCountryAllocationsText"),
	byCountryCountriesValue: d3.select("#byCountryCountriesValue"),
	byCountryCountriesText: d3.select("#byCountryCountriesText"),
	byCountryProjectsValue: d3.select("#byCountryProjectsValue"),
	byCountryProjectsText: d3.select("#byCountryProjectsText"),
	byCountryPartnersValue: d3.select("#byCountryPartnersValue"),
	byCountryPartnersText: d3.select("#byCountryPartnersText"),
	byCountryChartContainer: d3.select("#bycountry-bar-chart"),
	bySectorChartContainer: d3.select("#bysector-bar-chart"),
	bySectorAllocationsValue: d3.select("#bySectorAllocationsValue"),
	bySectorAllocationsText: d3.select("#bySectorAllocationsText"),
	bySectorCountriesValue: d3.select("#bySectorCountriesValue"),
	bySectorCountriesText: d3.select("#bySectorCountriesText"),
	bySectorProjectsValue: d3.select("#bySectorProjectsValue"),
	bySectorProjectsText: d3.select("#bySectorProjectsText"),
	bySectorPartnersValue: d3.select("#bySectorPartnersValue"),
	bySectorPartnersText: d3.select("#bySectorPartnersText"),
	byTypeCerfChartContainer: d3.select("#bycerf-bar-chart"),
	byTypeCbpfChartContainer: d3.select("#bycbpf-bar-chart"),
	byTypeAllocationsValue: d3.select("#byTypeAllocationsValue"),
	byTypeAllocationsText: d3.select("#byTypeAllocationsText"),
	byTypeCountriesValue: d3.select("#byTypeCountriesValue"),
	byTypeCountriesText: d3.select("#byTypeCountriesText"),
	byTypeProjectsValue: d3.select("#byTypeProjectsValue"),
	byTypeProjectsText: d3.select("#byTypeProjectsText"),
	byTypePartnersValue: d3.select("#byTypePartnersValue"),
	byTypePartnersText: d3.select("#byTypePartnersText"),
	byDonorContributionsValue: d3.select("#byDonorContributionsValue"),
	byDonorContributionsText: d3.select("#byDonorContributionsText"),
	byDonorPaidValue: d3.select("#byDonorPaidValue"),
	byDonorPaidText: d3.select("#byDonorPaidText"),
	byDonorPledgedValue: d3.select("#byDonorPledgedValue"),
	byDonorPledgedText: d3.select("#byDonorPledgedText"),
	byDonorDonorsValue: d3.select("#byDonorDonorsValue"),
	byDonorDonorsText: d3.select("#byDonorDonorsText"),
	byCerfCbpfContributionsValue: d3.select("#byCerfCbpfContributionsValue"),
	byCerfCbpfContributionsText: d3.select("#byCerfCbpfContributionsText"),
	byCerfCbpfPaidValue: d3.select("#byCerfCbpfPaidValue"),
	byCerfCbpfPaidText: d3.select("#byCerfCbpfPaidText"),
	byCerfCbpfPledgedValue: d3.select("#byCerfCbpfPledgedValue"),
	byCerfCbpfPledgedText: d3.select("#byCerfCbpfPledgedText"),
	byCerfCbpfDonorsValue: d3.select("#byCerfCbpfDonorsValue"),
	byCerfCbpfDonorsText: d3.select("#byCerfCbpfDonorsText"),
	byDonorChartContainer: d3.select("#bydonor-bar-chart"),
	byCerfCbpfChartContainer: d3.select("#bycerfcbpf-bar-chart"),
	buttonsContainer: d3.select(".btn-panel"),
	buttonsOuterContainer: d3.select("#btnOptionDiv")
};

const navLinks = [selections.navlinkAllocationsByCountry,
	selections.navlinkAllocationsBySector,
	selections.navlinkAllocationsByType,
	selections.navlinkContributionsByCerfCbpf,
	selections.navlinkContributionsByDonor
];

createSpinner(selections.chartContainerDiv);

//|gets query string values
const queryStringObject = {
	chart: queryStringValues.get("chart"),
	year: queryStringValues.get("year"),
	fund: queryStringValues.get("fund"),
	contributionYear: queryStringValues.get("contributionYear")
};

//|top values tooltip
const topTooltipDiv = selections.sideNavContainer.append("div")
	.attr("id", generalClassPrefix + "topTooltipDiv")
	.style("display", "none");

//|import modules
import {
	createAllocations
} from "./allocations.js";

import {
	createContributionsByCerfCbpf
} from "./contributionsbycerfcbpf.js";

import {
	createContributionsByDonor
} from "./contributionsbydonor.js";

import {
	chartState
} from "./chartstate.js";

import {
	buttonsObject
} from "./buttons.js";

import {
	parameters
} from "./parameters.js";

//|populate 'default' values
for (const key in parameters) {
	defaultValues[key] = parameters[key];
};

//|load master tables, world map and csv data
Promise.all([fetchFile("unworldmap", unworldmapUrl, "world map", "json"),
		fetchFile("masterFunds", masterFundsUrl, "master table for funds", "json"),
		fetchFile("masterDonors", masterDonorsUrl, "master table for donors", "json"),
		fetchFile("masterAllocationTypes", masterAllocationTypesUrl, "master table for allocation types", "json"),
		fetchFile("masterFundTypes", masterFundTypesUrl, "master table for fund types", "json"),
		fetchFile("masterPartnerTypes", masterPartnerTypesUrl, "master table for partner types", "json"),
		fetchFile("masterClusterTypes", masterClusterTypesUrl, "master table for cluster types", "json"),
		fetchFile("allocationsData", allocationsDataUrl, "allocations data", "csv"),
		fetchFile("contributionsData", (parameters.showClosedFunds ? contributionsDataUrlClosedFunds : contributionsDataUrl), "contributions data", "csv"),
		fetchFile("lastModified", lastModifiedUrl, "last modified date", "json")
	])
	.then(rawData => controlCharts(rawData));

function controlCharts([worldMap,
	masterFunds,
	masterDonors,
	masterAllocationTypes,
	masterFundTypes,
	masterPartnerTypes,
	masterClusterTypes,
	rawAllocationsData,
	rawContributionsData,
	lastModified
]) {

	createFundNamesList(masterFunds);
	createDonorNamesList(masterDonors);
	createFundTypesList(masterFundTypes);
	createPartnersList(masterPartnerTypes);
	createClustersList(masterClusterTypes);
	createAllocationTypesList(masterAllocationTypes);

	//Hardcoded Syria Cross Border ISO 3 code
	fundIsoCodes3List["108"] = "SCB";

	const lists = {
		fundNamesList: fundNamesList,
		fundAbbreviatedNamesList: fundAbbreviatedNamesList,
		fundRegionsList: fundRegionsList,
		fundIsoCodesList: fundIsoCodesList,
		fundIsoCodes3List: fundIsoCodes3List,
		fundLatLongList: fundLatLongList,
		donorNamesList: donorNamesList,
		donorTypesList: donorTypesList,
		donorIsoCodesList: donorIsoCodesList,
		fundTypesList: fundTypesList,
		partnersList: partnersList,
		clustersList: clustersList,
		allocationTypesList: allocationTypesList,
		fundNamesListKeys: fundNamesListKeys,
		donorNamesListKeys: donorNamesListKeys,
		yearsArrayContributions: yearsArrayContributions,
		yearsArrayContributionsCbpf: yearsArrayContributionsCbpf,
		yearsArrayContributionsCerf: yearsArrayContributionsCerf,
		cerfPooledFundId: cerfPooledFundId,
		defaultValues: defaultValues,
		queryStringValues: queryStringValues
	};

	populateLastModified(lastModified);

	preProcessData(rawAllocationsData, rawContributionsData);

	validateDefault(queryStringObject);

	resetTopValues(topValues);

	allocationsData = processDataAllocations(rawAllocationsData);

	contributionsDataByDonor = processDataContributionsByDonor(rawContributionsData);

	processAllocationsYearData(rawAllocationsData);

	processContributionsYearData(rawContributionsData);

	spinnerContainer.remove();

	updateTopValues(topValues, selections);

	populateYearDropdown(yearsArrayAllocations, selections.yearDropdown);

	buttonsObject.createButtons(selections.buttonsContainer, yearsArrayAllocations, yearsArrayContributions, duration, selections);

	//|Open the link and draws charts according to chartState
	if (chartState.selectedChart === "allocationsByCountry") {
		setTimeout(() => openNav(selections.navlinkAllocationsByCountry.node(), "byCountry", false), duration);
		selections.navlinkAllocationsByCountry.classed("menuactive", true);
		drawAllocations = createAllocations(selections, colorsObject, worldMap, lists);
		drawAllocations(allocationsData);
	};

	if (chartState.selectedChart === "allocationsBySector") {
		setTimeout(() => openNav(selections.navlinkAllocationsBySector.node(), "bySector", false), duration);
		selections.navlinkAllocationsBySector.classed("menuactive", true);
		drawAllocations = createAllocations(selections, colorsObject, worldMap, lists);
		drawAllocations(allocationsData);
	};

	if (chartState.selectedChart === "allocationsByType") {
		setTimeout(() => openNav(selections.navlinkAllocationsByType.node(), "byAllocationType", false), duration);
		selections.navlinkAllocationsByType.classed("menuactive", true);
		drawAllocations = createAllocations(selections, colorsObject, worldMap, lists);
		drawAllocations(allocationsData);
	};

	if (chartState.selectedChart === "contributionsByCerfCbpf") {
		setTimeout(() => openNav(selections.navlinkContributionsByCerfCbpf.node(), "byCerfCbpf", true), duration);
		selections.navlinkContributionsByCerfCbpf.classed("menuactive", true);
		createDisabledOption(selections.yearDropdown, yearsArrayContributions);
		drawContributionsByCerfCbpf = createContributionsByCerfCbpf(selections, colorsObject, lists);
		drawContributionsByCerfCbpf(rawContributionsData);
	};

	if (chartState.selectedChart === "contributionsByDonor") {
		setTimeout(() => openNav(selections.navlinkContributionsByDonor.node(), "byDonor", true), duration);
		selections.navlinkContributionsByDonor.classed("menuactive", true);
		createDisabledOption(selections.yearDropdown, yearsArrayContributions);
		drawContributionsByDonor = createContributionsByDonor(selections, colorsObject, lists);
		drawContributionsByDonor(contributionsDataByDonor);
	};

	//|event listeners
	selections.yearDropdown.on("change", event => {
		if (chartTypesAllocations.includes(chartState.selectedChart)) chartState.selectedYear = +event.target.value || defaultValues.year;
		resetTopValues(topValues);
		allocationsData = processDataAllocations(rawAllocationsData);
		processAllocationsYearData(rawAllocationsData);
		processContributionsYearData(rawContributionsData);
		updateTopValues(topValues, selections);
		if (chartTypesAllocations.includes(chartState.selectedChart)) {
			drawAllocations(allocationsData);
			setQueryString("year", chartState.selectedYear);
		};
	});

	selections.navlinkAllocationsByCountry.on("click", () => {
		if (buttonsObject.playing) stopTimer();
		if (chartState.selectedChart === "allocationsByCountry") return;
		if (chartState.selectedYear === allYears) {
			chartState.selectedYear = defaultValues.year
			allocationsData = processDataAllocations(rawAllocationsData);
		};
		if (chartTypesAllocations.indexOf(chartState.selectedChart) === -1) {
			resetTopValues(topValues);
			processAllocationsYearData(rawAllocationsData);
			processContributionsYearData(rawContributionsData);
			updateTopValues(topValues, selections);
			clearDisabledOption(selections.yearDropdown);
			selections.chartContainerDiv.select("div:not(#" + generalClassPrefix + "SnapshotTooltip)").remove();
			chartState.selectedChart = "allocationsByCountry";
			drawAllocations = createAllocations(selections, colorsObject, worldMap, lists);
		};
		chartState.selectedChart = "allocationsByCountry";
		chartState.selectedRegion = [];
		chartState.selectedCluster = [];
		chartState.selectedType = [];
		queryStringValues.delete("contributionYear");
		queryStringValues.delete("value");
		setQueryString("chart", chartState.selectedChart);
		if (chartState.selectedYear !== defaultValues.year) {
			if (yearsArrayAllocations.includes(chartState.selectedYear)) {
				setQueryString("year", chartState.selectedYear);
			} else {
				chartState.selectedYear = defaultValues.year;
				setQueryString("year", chartState.selectedYear);
			};
		};
		if (chartState.selectedFund !== defaultValues.fund) setQueryString("fund", chartState.selectedFund);
		drawAllocations(allocationsData);
		highlightNavLinks();
	});

	selections.navlinkAllocationsBySector.on("click", () => {
		if (buttonsObject.playing) stopTimer();
		if (chartState.selectedChart === "allocationsBySector") return;
		if (chartState.selectedYear === allYears) {
			chartState.selectedYear = defaultValues.year
			allocationsData = processDataAllocations(rawAllocationsData);
		};
		if (chartTypesAllocations.indexOf(chartState.selectedChart) === -1) {
			resetTopValues(topValues);
			processAllocationsYearData(rawAllocationsData);
			processContributionsYearData(rawContributionsData);
			updateTopValues(topValues, selections);
			clearDisabledOption(selections.yearDropdown);
			selections.chartContainerDiv.select("div:not(#" + generalClassPrefix + "SnapshotTooltip)").remove();
			chartState.selectedChart = "allocationsBySector";
			drawAllocations = createAllocations(selections, colorsObject, worldMap, lists);
		};
		chartState.selectedChart = "allocationsBySector";
		chartState.selectedRegion = [];
		chartState.selectedCluster = [];
		chartState.selectedType = [];
		queryStringValues.delete("contributionYear");
		queryStringValues.delete("value");
		setQueryString("chart", chartState.selectedChart);
		if (chartState.selectedYear !== defaultValues.year) {
			if (yearsArrayAllocations.includes(chartState.selectedYear)) {
				setQueryString("year", chartState.selectedYear);
			} else {
				chartState.selectedYear = defaultValues.year;
				setQueryString("year", chartState.selectedYear);
			};
		};
		if (chartState.selectedFund !== defaultValues.fund) setQueryString("fund", chartState.selectedFund);
		drawAllocations(allocationsData);
		highlightNavLinks();
	});

	selections.navlinkAllocationsByType.on("click", () => {
		if (buttonsObject.playing) stopTimer();
		if (chartState.selectedChart === "allocationsByType") return;
		if (chartState.selectedYear === allYears) {
			chartState.selectedYear = defaultValues.year
			allocationsData = processDataAllocations(rawAllocationsData);
		};
		if (chartTypesAllocations.indexOf(chartState.selectedChart) === -1) {
			resetTopValues(topValues);
			processAllocationsYearData(rawAllocationsData);
			processContributionsYearData(rawContributionsData);
			updateTopValues(topValues, selections);
			clearDisabledOption(selections.yearDropdown);
			selections.chartContainerDiv.select("div:not(#" + generalClassPrefix + "SnapshotTooltip)").remove();
			chartState.selectedChart = "allocationsByType";
			drawAllocations = createAllocations(selections, colorsObject, worldMap, lists);
		};
		chartState.selectedChart = "allocationsByType";
		chartState.selectedRegion = [];
		chartState.selectedCluster = [];
		chartState.selectedType = [];
		queryStringValues.delete("contributionYear");
		queryStringValues.delete("value");
		setQueryString("chart", chartState.selectedChart);
		if (chartState.selectedYear !== defaultValues.year) {
			if (yearsArrayAllocations.includes(chartState.selectedYear)) {
				setQueryString("year", chartState.selectedYear);
			} else {
				chartState.selectedYear = defaultValues.year;
				setQueryString("year", chartState.selectedYear);
			};
		};
		if (chartState.selectedFund !== defaultValues.fund) setQueryString("fund", chartState.selectedFund);
		drawAllocations(allocationsData);
		highlightNavLinks();
	});

	selections.navlinkContributionsByCerfCbpf.on("click", () => {
		if (buttonsObject.playing) stopTimer();
		if (chartState.selectedChart === "contributionsByCerfCbpf") return;
		chartState.selectedChart = "contributionsByCerfCbpf";
		if (!queryStringValues.has("year")) {
			chartState.selectedYear = allYears;
			resetTopValues(topValues);
			processAllocationsYearData(rawAllocationsData);
			processContributionsYearData(rawContributionsData);
			updateTopValues(topValues, selections);
		};
		createDisabledOption(selections.yearDropdown, yearsArrayContributions);
		selections.chartContainerDiv.select("div:not(#" + generalClassPrefix + "SnapshotTooltip)").remove();
		drawContributionsByCerfCbpf = createContributionsByCerfCbpf(selections, colorsObject, lists);
		drawContributionsByCerfCbpf(rawContributionsData);
		highlightNavLinks();
		queryStringValues.delete("year");
		queryStringValues.delete("fund");
		setQueryString("chart", chartState.selectedChart);
	});

	selections.navlinkContributionsByDonor.on("click", () => {
		if (buttonsObject.playing) stopTimer();
		if (chartState.selectedChart === "contributionsByDonor") return;
		chartState.selectedChart = "contributionsByDonor";
		resetTopValues(topValues);
		processAllocationsYearData(rawAllocationsData);
		processContributionsYearData(rawContributionsData);
		updateTopValues(topValues, selections);
		createDisabledOption(selections.yearDropdown, yearsArrayContributions);
		selections.chartContainerDiv.select("div:not(#" + generalClassPrefix + "SnapshotTooltip)").remove();
		drawContributionsByDonor = createContributionsByDonor(selections, colorsObject, lists);
		drawContributionsByDonor(contributionsDataByDonor);
		highlightNavLinks();
		queryStringValues.delete("year");
		queryStringValues.delete("contributionYear");
		queryStringValues.delete("value");
		setQueryString("chart", chartState.selectedChart);
	});

	selections.contributionsTopFigurePanel.on("mouseenter", (event, d) => mouseoverTopFigures(event, d, "contributions"))
		.on("mouseleave", mouseoutTopFigures);

	selections.allocationsTopFigurePanel.on("mouseenter", (event, d) => mouseoverTopFigures(event, d, "allocations"))
		.on("mouseleave", mouseoutTopFigures);

	//end of controlCharts
};

function mouseoverTopFigures(event, d, value) {

	topTooltipDiv.style("display", "block")
		.html(null);

	const innerTooltipDiv = topTooltipDiv.append("div")
		.classed((value === "contributions" ? generalClassPrefix + "innerTooltipDivContributions" : generalClassPrefix + "innerTooltipDivAllocations"), true)
		.attr("id", generalClassPrefix + "innerTooltipDiv");

	innerTooltipDiv.append("div")
		.style("margin-bottom", "8px")
		.append("strong")
		.html(capitalize(value) + (chartState.selectedChart === "contributionsByDonor" ?
			" from " + yearsArrayContributions[0] + " to " + (currentYear - 1) :
			chartState.selectedYear === allYears ? " in all years" : " in " + chartState.selectedYear));

	const tooltipRow = innerTooltipDiv.append("div")
		.style("margin", "0px")
		.style("display", "flex")
		.style("flex-wrap", "wrap")
		.style("white-space", "pre")
		.style("line-height", 1.4)
		.style("width", "100%");

	tooltipRow.append("div")
		.style("display", "flex")
		.style("flex", "0 40%")
		.html("Total:");

	tooltipRow.append("div")
		.style("display", "flex")
		.style("flex", "0 60%")
		.style("justify-content", "flex-end")
		.style("align-items", "flex-end")
		.html("$" + formatMoney0Decimals(topValues[value]));

	const tooltipTable = innerTooltipDiv.append("table")
		.attr("class", generalClassPrefix + "tooltipTable");

	const topRow = tooltipTable.append("tr");

	topRow.selectAll(null)
		.data([" ", "CERF", "CBPF"])
		.enter()
		.append("th")
		.html(d => d);

	if (value === "contributions") {
		const tableRows = tooltipTable.selectAll(null)
			.data(contributionTypes)
			.enter()
			.append("tr");

		const tableCells = tableRows.selectAll(null)
			.data(d => [" ", "cerf", "cbpf"].map(e => ({
				value: `${e}${separator}${d}`,
				name: d
			})))
			.enter()
			.append("td")
			.html((d, i) => !i ? capitalize(d.name) : topValues[d.value] ? "$" + formatSIFloat(topValues[d.value]).replace("G", "B") : "$0");
	} else {
		tooltipTable.append("tr")
			.selectAll(null)
			.data([" ", "cerf", "cbpf"])
			.enter()
			.append("td")
			.html((d, i) => !i ? "Allocated" : topValues[`${d}${separator}allocated`] ? "$" + formatSIFloat(topValues[`${d}${separator}allocated`]).replace("G", "B") : "$0");
	};

	const thisBox = event.currentTarget.getBoundingClientRect();
	const containerBox = selections.sideNavContainer.node().getBoundingClientRect();
	const tooltipBox = topTooltipDiv.node().getBoundingClientRect();
	const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);
	const thisOffsetLeft = thisBox.right - containerBox.left + 6;

	topTooltipDiv.style("top", thisOffsetTop + "px")
		.style("left", thisOffsetLeft + "px");
};

function mouseoutTopFigures() {
	topTooltipDiv.html(null)
		.style("display", "none");
};

function preProcessData(rawAllocationsData, rawContributionsData) {

	const yearsSetAllocations = new Set();
	const yearsSetContributionsCbpf = new Set();
	const yearsSetContributionsCerf = new Set();

	rawAllocationsData.forEach(row => {
		yearsSetAllocations.add(+row.AllocationYear);
	});

	rawContributionsData.forEach(row => {
		if (row.PooledFundId === cerfPooledFundId) {
			if (defaultValues.cerfFirstYear) {
				if (+row.FiscalYear >= defaultValues.cerfFirstYear) yearsSetContributionsCerf.add(+row.FiscalYear);
			} else {
				yearsSetContributionsCerf.add(+row.FiscalYear);
			};
		} else {
			if (defaultValues.cbpfFirstYear) {
				if (+row.FiscalYear >= defaultValues.cbpfFirstYear) yearsSetContributionsCbpf.add(+row.FiscalYear);
			} else {
				yearsSetContributionsCbpf.add(+row.FiscalYear);
			};
		};
	});

	yearsArrayAllocations.push(...yearsSetAllocations);
	yearsArrayAllocations.sort((a, b) => a - b);
	yearsArrayContributionsCbpf.push(...yearsSetContributionsCbpf);
	yearsArrayContributionsCbpf.sort((a, b) => a - b);
	yearsArrayContributionsCerf.push(...yearsSetContributionsCerf);
	yearsArrayContributionsCerf.sort((a, b) => a - b);

	const yearsSetContributions = new Set([...yearsSetContributionsCerf, ...yearsSetContributionsCbpf]);
	yearsArrayContributions.push(...yearsSetContributions);
	yearsArrayContributions.sort((a, b) => a - b);

};

function processAllocationsYearData(rawAllocationsData) {
	rawAllocationsData.forEach(row => {
		if (row.AllocationYear === chartState.selectedYear ||
			(chartState.selectedChart === "contributionsByCerfCbpf" && chartState.selectedYear === allYears) ||
			(chartState.selectedChart === "contributionsByDonor" && row.AllocationYear < currentYear)) {
			topValues.allocations += row.ClusterBudget;
			row.ProjList.toString().split(separator).forEach(e => topValues.projects.add(e));
			if (fundTypesList[row.FundId] === "cerf") topValues[`cerf${separator}allocated`] = (topValues[`cerf${separator}allocated`] || 0) + row.ClusterBudget;
			if (fundTypesList[row.FundId] === "cbpf") topValues[`cbpf${separator}allocated`] = (topValues[`cbpf${separator}allocated`] || 0) + row.ClusterBudget;
		};
	});
};

function processDataAllocations(rawAllocationsData) {

	const data = [];

	rawAllocationsData.forEach(row => {
		//THIS IS A TEMPORARY FILTER: && +row.PooledFundId
		if (row.AllocationYear === chartState.selectedYear && +row.PooledFundId) {

			const foundFund = data.find(d => d.country === row.PooledFundId);

			if (foundFund) {
				foundFund.allocationsList.push(row);
				pushCbpfOrCerf(foundFund, row);
			} else {
				const fundObject = {
					country: row.PooledFundId,
					countryName: fundNamesList[row.PooledFundId],
					labelText: fundNamesList[row.PooledFundId].split(" "),
					isoCode: fundIsoCodesList[row.PooledFundId],
					cbpf: 0,
					cerf: 0,
					total: 0,
					region: fundRegionsList[row.PooledFundId],
					allocationsList: [row]
				};
				Object.keys(clustersList).forEach(e => {
					fundObject[`cluster${separator}${e}${separator}cerf`] = 0;
					fundObject[`cluster${separator}${e}${separator}cbpf`] = 0;
					fundObject[`cluster${separator}${e}${separator}total`] = 0;
				});
				Object.keys(allocationTypesList).forEach(e => {
					fundObject[`type${separator}${e}${separator}cerf`] = 0;
					fundObject[`type${separator}${e}${separator}cbpf`] = 0;
					fundObject[`type${separator}${e}${separator}total`] = 0;
				});
				pushCbpfOrCerf(fundObject, row);
				data.push(fundObject);
			};

		};

	});

	return data;

};

function pushCbpfOrCerf(obj, row) {
	if (fundTypesList[row.FundId] === "cbpf") {
		obj.cbpf += +row.ClusterBudget;
		obj[`cluster${separator}${row.ClusterId}${separator}cbpf`] += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cbpf`] += +row.ClusterBudget;;
	} else if (fundTypesList[row.FundId] === "cerf") {
		obj.cerf += +row.ClusterBudget;
		obj[`cluster${separator}${row.ClusterId}${separator}cerf`] += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cerf`] += +row.ClusterBudget;;
	};
	obj.total += +row.ClusterBudget;
	obj[`cluster${separator}${row.ClusterId}${separator}total`] += +row.ClusterBudget;
	obj[`type${separator}${row.AllocationSurceId}${separator}total`] += +row.ClusterBudget;;
};

function processContributionsYearData(rawContributionsData) {
	rawContributionsData.forEach(row => {
		if (chartState.selectedChart === "contributionsByDonor") {
			if (row.FiscalYear < currentYear) populateContributionsTopValues(row);
		} else {
			if (row.FiscalYear === chartState.selectedYear || (chartState.selectedYear === allYears && row.FiscalYear <= currentYear)) populateContributionsTopValues(row);
		};
	});
};

function populateContributionsTopValues(row) {
	topValues.contributions += (+row.PaidAmt) + (+row.PledgeAmt);
	topValues.donors.add(row.DonorId);
	if (row.PooledFundId === cerfPooledFundId) {
		topValues[`cerf${separator}paid`] = (topValues[`cerf${separator}paid`] || 0) + (+row.PaidAmt);
		topValues[`cerf${separator}pledged`] = (topValues[`cerf${separator}pledged`] || 0) + (+row.PledgeAmt);
		topValues[`cerf${separator}total`] = (topValues[`cerf${separator}total`] || 0) + ((+row.PaidAmt) + (+row.PledgeAmt));
	} else {
		topValues[`cbpf${separator}paid`] = (topValues[`cbpf${separator}paid`] || 0) + (+row.PaidAmt);
		topValues[`cbpf${separator}pledged`] = (topValues[`cbpf${separator}pledged`] || 0) + (+row.PledgeAmt);
		topValues[`cbpf${separator}total`] = (topValues[`cbpf${separator}total`] || 0) + ((+row.PaidAmt) + (+row.PledgeAmt));
	};
};

function processDataContributionsByDonor(rawContributionsData) {

	const data = [];

	rawContributionsData.forEach(row => {

		if (row.FiscalYear <= currentYear) {

			const foundDonor = data.find(e => e.donorId === row.DonorId);

			if (foundDonor) {
				if (row.FiscalYear < currentYear) pushCbpfOrCerfContribution(foundDonor, row);
				const foundYear = foundDonor.contributions.find(e => e.year === row.FiscalYear);
				if (foundYear) {
					pushCbpfOrCerfContribution(foundYear, row);
				} else {
					const yearObject = {
						year: row.FiscalYear,
						total: 0,
						cerf: 0,
						cbpf: 0,
						[`paid${separator}total`]: 0,
						[`paid${separator}cerf`]: 0,
						[`paid${separator}cbpf`]: 0,
						[`pledged${separator}total`]: 0,
						[`pledged${separator}cerf`]: 0,
						[`pledged${separator}cbpf`]: 0
					};
					pushCbpfOrCerfContribution(yearObject, row);
					foundDonor.contributions.push(yearObject);
				};
			} else {
				const donorObject = {
					donor: donorNamesList[row.DonorId],
					donorId: row.DonorId,
					isoCode: donorIsoCodesList[row.DonorId],
					contributions: [],
					total: 0,
					cerf: 0,
					cbpf: 0,
					[`paid${separator}total`]: 0,
					[`paid${separator}cerf`]: 0,
					[`paid${separator}cbpf`]: 0,
					[`pledged${separator}total`]: 0,
					[`pledged${separator}cerf`]: 0,
					[`pledged${separator}cbpf`]: 0
				};
				const yearObject = {
					year: row.FiscalYear,
					total: 0,
					cerf: 0,
					cbpf: 0,
					[`paid${separator}total`]: 0,
					[`paid${separator}cerf`]: 0,
					[`paid${separator}cbpf`]: 0,
					[`pledged${separator}total`]: 0,
					[`pledged${separator}cerf`]: 0,
					[`pledged${separator}cbpf`]: 0
				};
				if (row.FiscalYear < currentYear) pushCbpfOrCerfContribution(donorObject, row);
				pushCbpfOrCerfContribution(yearObject, row);
				donorObject.contributions.push(yearObject);
				data.push(donorObject);
			};
		};
	});

	return data;

};

function pushCbpfOrCerfContribution(obj, row) {
	if (row.PooledFundId === cerfPooledFundId) {
		obj.cerf += row.PaidAmt + row.PledgeAmt;
		obj[`paid${separator}cerf`] += row.PaidAmt;
		obj[`pledged${separator}cerf`] += row.PledgeAmt;
	} else {
		obj.cbpf += row.PaidAmt + row.PledgeAmt;
		obj[`paid${separator}cbpf`] += row.PaidAmt;
		obj[`pledged${separator}cbpf`] += row.PledgeAmt;
	};
	obj.total += row.PaidAmt + row.PledgeAmt;
	obj[`paid${separator}total`] += row.PaidAmt;
	obj[`pledged${separator}total`] += row.PledgeAmt;
};

function fetchFile(fileName, url, warningString, method) {
	if (localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
		const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
			JSON.parse(localStorage.getItem(fileName)).data;
		console.info("PFBI chart info: " + warningString + " from local storage");
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod = method === "csv" ? d3.csv : d3.json;
		const rowFunction = method === "csv" ? d3.autoType : null;
		return fetchMethod(url, rowFunction).then(fetchedData => {
			try {
				localStorage.setItem(fileName, JSON.stringify({
					data: method === "csv" ? d3.csvFormat(fetchedData) : fetchedData,
					timestamp: currentDate.getTime()
				}));
			} catch (error) {
				console.info("PFBI chart, " + error);
			};
			console.info("PFBI chart info: " + warningString + " from API");
			return fetchedData;
		});
	};
};

function updateTopValues(topValues, selections) {

	const updateTransition = d3.transition()
		.duration(duration);

	selections.contributionsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, topValues.contributions);
			return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
		});

	selections.allocationsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, topValues.allocations);
			return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
		});

	selections.donorsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, topValues.donors.size));

	selections.projectsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, topValues.projects.size));

};

function populateYearDropdown(yearData, dropdownContainer) {

	let yearDropdownOptions = dropdownContainer.selectAll(`.${generalClassPrefix}yearDropdownOptions`)
		.data(yearData.slice().reverse());

	const yearDropdownOptionsExit = yearDropdownOptions.exit().remove();

	const yearDropdownOptionsEnter = yearDropdownOptions.enter()
		.append("option")
		.attr("class", generalClassPrefix + "yearDropdownOptions")
		.html(d => d)
		.attr("value", d => d);

	yearDropdownOptions = yearDropdownOptionsEnter.merge(yearDropdownOptions);

	yearDropdownOptions.property("selected", d => chartState.selectedYear === d);

};

function validateDefault(values) {
	chartState.selectedChart = chartTypesAllocations.indexOf(values.chart) > -1 || chartTypesContributions.indexOf(values.chart) > -1 ?
		values.chart : defaultValues.chart;
	const yearArray = chartTypesAllocations.indexOf(chartState.selectedChart) > -1 ? yearsArrayAllocations : yearsArrayContributions;
	if (!yearArray.includes(defaultValues.year)) {
		defaultValues.year = yearArray[yearArray.length - 1];
	};
	if (values.chart === "contributionsByCerfCbpf") {
		if (values.contributionYear) {
			chartState.selectedYear = parseInt(values.contributionYear);
		} else {
			chartState.selectedYear = allYears;
		};
	} else {
		chartState.selectedYear = +values.year === +values.year && yearArray.indexOf(+values.year) > -1 ?
			+values.year : defaultValues.year;
	};
	chartState.selectedFund = fundValues.indexOf(values.fund) > -1 ? values.fund : defaultValues.fund;
};

function createFundNamesList(fundsData) {
	fundsData.forEach(row => {
		fundNamesList[row.id + ""] = row.PooledFundName;
		fundAbbreviatedNamesList[row.id + ""] = row.PooledFundNameAbbrv;
		fundNamesListKeys.push(row.id + "");
		fundRegionsList[row.id + ""] = row.RegionNameArr;
		fundIsoCodesList[row.id + ""] = row.ISO2Code;
		fundIsoCodes3List[row.id + ""] = row.CountryCode;
		fundLatLongList[row.ISO2Code] = [row.latitude, row.longitude];
		if (row.PooledFundName === "CERF") cerfPooledFundId = row.id;
	});
};

function createDonorNamesList(donorsData) {
	donorsData.forEach(row => {
		donorNamesList[row.id + ""] = row.donorName;
		donorNamesListKeys.push(row.id + "");
		donorTypesList[row.id + ""] = row.donorType;
		donorIsoCodesList[row.id + ""] = row.donorISO2Code;
	});
};

function createFundTypesList(fundTypesData) {
	fundTypesData.forEach(row => {
		fundTypesList[row.id + ""] = row.FundName.toLowerCase();
	});
};

function createPartnersList(partnersData) {
	partnersData.forEach(row => {
		partnersList[row.id + ""] = row.OrganizationTypeName;
	});
};

function createClustersList(clustersData) {
	clustersData.forEach(row => {
		clustersList[row.id + ""] = row.ClustNm;
	});
};

function createAllocationTypesList(allocationTypesData) {
	allocationTypesData.forEach(row => {
		allocationTypesList[row.id + ""] = row.AllocationName;
	});
};

function resetTopValues(obj) {
	for (const key in obj) typeof obj[key] === "number" ? obj[key] = 0 : obj[key].clear();
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

function createSpinner(container) {
	spinnerContainer = container.append("div")
		.attr("class", generalClassPrefix + "spinnerContainer");

	spinnerContainer.append("div")
		.attr("class", generalClassPrefix + "spinnerText")
		.html("Loading data");

	spinnerContainer.append("div")
		.attr("class", "loader");
};

function createDisabledOption(dropdownContainer, yearsArray) {
	let disabledOption = dropdownContainer.selectAll("#" + generalClassPrefix + "disabledOption")
		.data([true]);

	disabledOption = disabledOption.enter()
		.append("option")
		.attr("id", generalClassPrefix + "disabledOption")
		.merge(disabledOption)
		.property("selected", true)
		.property("disabled", true)
		.html(chartState.selectedChart === "contributionsByDonor" ? yearsArray[0] + " - " + (currentYear - 1) :
			(chartState.selectedYear === allYears ? "All" : chartState.selectedYear));
};

function clearDisabledOption(dropdownContainer) {
	dropdownContainer.select("#" + generalClassPrefix + "disabledOption").remove();
	dropdownContainer.selectAll("option")
		.property("selected", d => chartState.selectedYear === d);
};

function highlightNavLinks() {
	navLinks.forEach(e => e.classed("menuactive", e === selections["navlink" + capitalize(chartState.selectedChart)]));
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function setQueryString(key, value) {
	if (queryStringValues.has(key)) {
		queryStringValues.set(key, value);
	} else {
		queryStringValues.append(key, value);
	};
	const newURL = window.location.origin + window.location.pathname + "?" + queryStringValues.toString();
	window.history.replaceState(null, "", newURL);
};

function populateLastModified(lastModifiedData) {
	const lastModifiedDate = new Date(lastModifiedData.value[0].last_updated_date + "-05:00"); //Date is in US EST time zone
	selections.lastModifiedSpan.html("Data updated on " + formatLastModified(lastModifiedDate) + " (GMT)")
};

function stopTimer() {
	buttonsObject.playing = false;
	buttonsObject.timer.stop();
	d3.select("#" + generalClassPrefix + "PlayButton")
		.datum({
			clicked: false
		})
		.html("PLAY  ")
		.append("span")
		.attr("class", "fas fa-play");
};