//|Country Profile main module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";
import { createBreadcrumbs } from "./breadcrumbs.js";
import { createCountryProfileOverview } from "./countryprofileoverview.js";
import { createCountryProfileByPartner } from "./countryprofilebypartner.js";
import { createCountryProfileBySector } from "./countryprofilebysector.js";
import { createCountryProfileByPartnerAndSector } from "./countryprofilebypartnerandsector.js";
import { createCountryProfileContributions } from "./countryprofilecontributions.js";
import { buttonsObject } from "./buttons.js";
import { positionTooltip } from "./positiontooltip.js";

//|constants
const classPrefix = "pfcpmain",
	generalClassPrefix = "pfbihp",
	tabsData = ["Overview", "Allocations by Partner", "Allocations by Sector", "Allocations by Partner/Sector", "Contributions by Donor"],
	backToMenu = "Back to main menu",
	selectAnOption = "Change Country",
	separator = "##",
	fadeOpacity = 0.1,
	duration = 1000,
	topValuesNoValue = "--",
	piesSize = 20,
	piesMargin = 5,
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.8,
	localVariable = d3.local(),
	alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
	mapProjection = d3.geoEqualEarth(),
	mapPath = d3.geoPath().projection(mapProjection),
	maxPieSize = 32,
	minPieSize = 0.5,
	legendPaddings = [16, 4, 16, 4],
	legendHeight = 82,
	legendWidth = 100,
	legendHorPadding = 44,
	legendVertPadding = 32,
	legendTextPadding = 18,
	legendLineSize = 38,
	legendPadding = 16,
	regionNamesPadding = 4,
	regionValuesSpacing = 10,
	regionValuesPadding = 4,
	darkerValues = 1,
	negativeMarginWidth = 0.12,
	negativeMarginHeight = 0,
	negativeLeftMargin = 0.15,
	innerTooltipDivWidth = 220,
	formatMoney0Decimals = d3.format(",.0f"),
	radiusScale = d3.scaleSqrt().range([minPieSize, maxPieSize]),
	arcGenerator = d3.arc().outerRadius(piesSize / 2).innerRadius(0),
	arcGeneratorRegions = d3.arc().innerRadius(0),
	pieGenerator = d3.pie().value(d => d.value).sort((a, b) => b.fundType - a.fundType),
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	menuIntroText = "OCHA aims to mobilize and engage the full range of financing instruments, mechanisms and partners to ensure that growing humanitarian needs are met, humanitarian leadership and coordination mechanisms are promoted at the country level, and the large array of global humanitarian financing mechanisms are complementary among themselves and coherent with development funding. At the country level, OCHA helps partners to build common strategies and implementation plans and to appeal for funds as a group. OCHA ensures more responsive, predictable and strategic humanitarian financing through its leadership of the Central Emergency Response Fund (CERF) and Country-Based Pooled Funds (CBPFs) for the humanitarian system.";

chartState.selectedCountryProfileTab = tabsData[0];

let overviewData,
	overviewAdminLevel1Data,
	byPartnerData,
	bySectorData,
	byPartnerAndSectorData,
	contributionsData,
	yearsButtons,
	cerfId,
	cbpfId,
	resetYear = true;

const yearsSetAllocations = new Set(),
	yearsSetContributions = new Set(),
	topValues = {
		allocations: 0,
		projects: new Set()
	};

const tabsCallingFunctions = tabsData.map(d => ({
	name: d,
	callingFunction: null
}));

const regionCentroids = {
	"Asia": {
		lat: 46,
		lon: 90
	},
	"Africa": {
		lat: -4,
		lon: 20
	},
	"Latin America": {
		lat: 2,
		lon: -67
	},
	"Middle East": {
		lat: 31,
		lon: 38
	},
	"Micronesia": {
		lat: 6,
		lon: 146
	},
	"Europe": {
		lat: 54,
		lon: 6
	},
	"Polynesia": {
		lat: -14,
		lon: 170
	},
	"Global": {
		lat: 40,
		lon: -70
	}
};

function createCountryProfile(worldMap, rawAllocationsData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, yearsArrayTotal, queryStringObject) {

	d3.select("#pfbihpPlayButton")
		.property("disabled", false); //TODO: check why this is different from the staging version

	const pooledFundsInData = createListMenuData(rawAllocationsData, lists);

	cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	pooledFundsInData.forEach(e => e.funds.sort((a, b) => lists.fundNamesList[a.fund].localeCompare(lists.fundNamesList[b.fund])));

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	if (queryStringObject && queryStringObject.country) {
		chartState.selectedCountryProfile = +queryStringObject.country;
		if (queryStringObject.year) {
			chartState.selectedYear = +queryStringObject.year;
			resetYear = false;
		};
		if (queryStringObject.fund) chartState.selectedFund = queryStringObject.fund;
		drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
		return;
	};

	const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colorsObject, worldMap);

	countries.on("click", (event, d) => {
		chartState.selectedCountryProfile = d.fund;
		setQueryString("country", chartState.selectedCountryProfile, lists);
		drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
	});

};

function createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colors, worldMap) {

	chartState.selectedYear = currentYear;
	chartState.selectedFund = "total";

	let selectedAlphabet = "all";

	const flatFundsArray = pooledFundsInData.flatMap(e => e.funds)
		.sort((a, b) => lists.fundNamesList[a.fund].localeCompare(lists.fundNamesList[b.fund]));

	createDisabledOption(selections.yearDropdown, yearsArrayTotal);

	deleteQueryStringValues(lists);

	topValues.allocations = 0;
	topValues.projects.clear();
	updateTopValues(topValues, selections);

	chartState.selectedCountryProfileTab = tabsData[0];

	outerDiv.selectChildren().remove();

	const maxValueInData = pooledFundsInData.reduce((acc, curr) => {
		curr.funds.forEach(fund => {
			fund.values.forEach(e => acc = Math.max(acc, e.value))
		});
		return acc;
	}, 0);

	const maxValueForRegions = pooledFundsInData.reduce((acc, curr) => {
		curr.values.forEach(e => acc = Math.max(acc, e.value));
		return acc;
	}, 0);

	const headerContainer = outerDiv.append("div")
		.attr("class", "country-pro-main");

	const title = headerContainer.append("h1")
		.html("Country Profile");

	const intro = headerContainer.append("p")
		.html(menuIntroText);

	const innerContainer = outerDiv.append("div")
		.attr("class", classPrefix + "innerContainer");

	const alphabetContainer = innerContainer.append("div")
		.attr("class", classPrefix + "alphabetContainer");

	const listAndMapContainer = innerContainer.append("div")
		.attr("class", classPrefix + "listAndMapContainer");

	const disclaimerContainer = innerContainer.append("div")
		.attr("class", classPrefix + "disclaimerContainer");

	const firstAllocationYear = d3.min(flatFundsArray, d => d3.min(d.values, e => e.year));

	disclaimerContainer.append("span")
		.html(`Based on data from OCHA Grant Manegement System (GMS) since ${firstAllocationYear}`)

	const listContainer = listAndMapContainer.append("div")
		.attr("class", classPrefix + "listContainer");

	const mapContainer = listAndMapContainer.append("div")
		.attr("class", classPrefix + "mapContainer");

	const tableContainer = mapContainer.append("div")
		.attr("class", classPrefix + "tableContainer");

	const innerMapContainer = mapContainer.append("div")
		.attr("class", classPrefix + "innerMapContainer");

	const mapHeader = innerMapContainer.append("div")
		.attr("class", classPrefix + "mapHeader")
		.append("span")
		.html("All-time allocations for the eight OCHA regions:");

	const alphabetData = alphabet.concat("all");

	const alphabetButtons = alphabetContainer.selectAll(null)
		.data(alphabetData)
		.enter()
		.append("button")
		.attr("class", classPrefix + "alphabetButtons")
		.classed("active", d => selectedAlphabet === d)
		.html(d => d.toUpperCase());

	const uls = listContainer.append("ul");

	const countries = uls.selectAll(null)
		.data(flatFundsArray)
		.enter()
		.append("li");

	const piesDiv = countries.append("div")
		.attr("class", classPrefix + "piesDiv")
		.style("width", piesSize + piesMargin + "px")
		.style("height", piesSize + "px");

	const piesSvg = piesDiv.append("svg")
		.attr("width", "100%")
		.attr("height", "100%");

	const countryNames = countries.append("span")
		.attr("class", classPrefix + "countryNames")
		.html(d => lists.fundNamesList[d.fund]);

	createPies(piesSvg, colors, lists);

	const piesContainer = createMap(worldMap, innerMapContainer);

	drawRegionPies(piesContainer.piesGroup, piesContainer.legendGroup, pooledFundsInData, colors, lists);

	drawLegend(piesContainer.legendGroup);

	createRegionsTable(tableContainer, pooledFundsInData, colors, lists);

	alphabetButtons.on("click", (event, datum) => {
		selectedAlphabet = datum;
		alphabetButtons.classed("active", d => selectedAlphabet === d);
		countries.style("display", d => displayCountries(d, datum));
	});

	function displayCountries(d, datum){
		const countryName = lists.fundNamesList[d.fund].replace(/\(.*?\)/g,"");
		const upperCaseLettersArray = countryName.match(/[A-Z]/g).map(e => e.toLowerCase());
		return datum === "all" || upperCaseLettersArray.includes(datum.toLowerCase()) ? null : "none";
	}

	return countries;

};

function createMap(mapData, container) {

	const containerSize = container.node().getBoundingClientRect();

	const mapWidth = containerSize.width,
		mapHeight = containerSize.height;

	const mapSvg = container.append("svg")
		.attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`);

	const mapGroup = mapSvg.append("g")
		.attr("transform", `translate(${-((negativeMarginWidth + negativeLeftMargin) * mapWidth)},${-(negativeMarginHeight * mapHeight)})`);

	const piesGroup = mapSvg.append("g")
		.attr("transform", `translate(${-((negativeMarginWidth + negativeLeftMargin) * mapWidth)},${-(negativeMarginHeight * mapHeight)})`);

	const legendGroup = mapSvg.append("g")
		.attr("transform", `translate(${legendPadding},${mapHeight - legendPadding - legendHeight})`);

	const countryFeatures = topojson.feature(mapData, mapData.objects.wrl_polbnda_int_simple_uncs);

	countryFeatures.features = countryFeatures.features.filter(d => d.properties.ISO_2 !== "AQ");

	mapProjection.fitExtent([
		[0, 0],
		[mapWidth + 2 * (negativeMarginWidth * mapWidth), mapHeight + 2 * (negativeMarginHeight * mapHeight)]
	], countryFeatures);

	const land = mapGroup.append("path")
		.attr("d", mapPath(topojson.merge(mapData, mapData.objects.wrl_polbnda_int_simple_uncs.geometries.filter(d => d.properties.ISO_2 !== "AQ"))))
		.style("fill", "#F5F5F5");

	const borders = mapGroup.append("path")
		.attr("d", mapPath(topojson.mesh(mapData, mapData.objects.wrl_polbnda_int_simple_uncs, (a, b) => a !== b)))
		.style("fill", "none")
		.style("stroke", "#EAEAEA")
		.style("stroke-width", "1px");

	for (let region in regionCentroids) {
		const projected = mapProjection([regionCentroids[region].lon, regionCentroids[region].lat]);
		regionCentroids[region].x = projected[0];
		regionCentroids[region].y = projected[1];
	};

	return { piesGroup, legendGroup };

};

function drawRegionPies(container, legendContainer, data, colors, lists) {

	const maxValue = d3.max(data, d => d3.sum(d.fundTypes, e => e.value));

	radiusScale.domain([0, maxValue]);

	let pieGroup = container.selectAll("." + classPrefix + "pieGroup")
		.data(data, d => d.region);

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
				return t => arcGeneratorRegions(interpolator(t));
			})
			.on("end", () => thisGroup.remove())
	});

	const pieGroupEnter = pieGroup.enter()
		.append("g")
		.attr("class", classPrefix + "pieGroup")
		.style("opacity", 1)
		.attr("transform", d => "translate(" + (regionCentroids[d.region].x) + "," + (regionCentroids[d.region].y) + ")");

	pieGroup = pieGroupEnter.merge(pieGroup);

	pieGroup.order();

	let slices = pieGroup.selectAll("." + classPrefix + "slice")
		.data(d => pieGenerator([{
			value: d.fundTypes.find(e => e.fundType === cerfId) ? d.fundTypes.find(e => e.fundType === cerfId).value : 0,
			total: d3.sum(d.fundTypes, e => e.value),
			type: "cerf"
		}, {
			value: d.fundTypes.find(e => e.fundType === cbpfId) ? d.fundTypes.find(e => e.fundType === cbpfId).value : 0,
			total: d3.sum(d.fundTypes, e => e.value),
			type: "cbpf"
		}].filter(e => e.value !== 0)), d => d.data.type);

	const slicesRemove = slices.exit()
		.remove();

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

	let regionNames = pieGroup.selectAll(`.${classPrefix}regionNames`)
		.data(d => [d]);

	const regionNamesExit = regionNames.exit()
		.remove();

	const regionNamesEnter = regionNames.enter()
		.append("text")
		.attr("class", classPrefix + "regionNames");

	regionNames = regionNamesEnter.merge(regionNames);

	regionNames.attr("y", d => radiusScale(d3.sum(d.fundTypes, e => e.value)) + regionNamesPadding)
		.text(d => d.region);

	let regionValues = pieGroup.selectAll(`.${classPrefix}regionValues`)
		.data(d => d.fundTypes);

	const regionValuesExit = regionValues.exit()
		.remove();

	const regionValuesEnter = regionValues.enter()
		.append("text")
		.attr("class", classPrefix + "regionValues")
		.style("fill", d => d3.color(colors[lists.fundTypesList[d.fundType]]).darker(darkerValues))
		.attr("y", (d, i, n) => {
			const parentDatum = d3.select(n[i].parentNode).datum().fundTypes;
			return -radiusScale(d3.sum(parentDatum, e => e.value)) - (i * regionValuesSpacing) - regionValuesPadding;
		})
		.text(d => lists.fundTypesList[d.fundType] + ": ");

	const regionValuesSpan = regionValuesEnter.append("tspan")
		.attr("class", classPrefix + "regionValuesSpan")
		.text(d => formatSIFloat(d.value).replace("G", "B"));

	regionValues = regionValuesEnter.merge(regionValues);

	function pieTween(d) {
		const i = d3.interpolateObject(localVariable.get(this), {
			startAngle: d.startAngle,
			endAngle: d.endAngle,
			outerRadius: radiusScale(d.data.total)
		});
		localVariable.set(this, i(1));
		return t => arcGeneratorRegions(i(t));
	};

};

function drawLegend(container) {

	const maxDataValue = radiusScale.domain()[1];

	const sizeCirclesData = maxDataValue ? [0, maxDataValue / 4, maxDataValue / 2, maxDataValue] : [];

	let backgroundRectangle = container.selectAll("." + classPrefix + "backgroundRectangle")
		.data([true]);

	backgroundRectangle = backgroundRectangle.enter()
		.append("rect")
		.attr("class", classPrefix + "backgroundRectangle")
		.merge(backgroundRectangle)
		.style("fill", "#fff")
		.style("opacity", 0.6)
		.attr("width", legendWidth)
		.attr("height", legendHeight);

	let legendSizeGroups = container.selectAll("." + classPrefix + "legendSizeGroups")
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
		.attr("x1", legendPaddings[3] + radiusScale.range()[1])
		.attr("x2", legendPaddings[3] + radiusScale.range()[1] + legendLineSize)
		.attr("y1", d => d ? legendPaddings[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
			legendPaddings[0] + (radiusScale.range()[1] * 2))
		.attr("y2", d => d ? legendPaddings[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
			legendPaddings[0] + (radiusScale.range()[1] * 2))
		.style("stroke", "#666")
		.style("stroke-dasharray", "2,2")
		.style("stroke-width", "1px");

	const legendSizeCircles = legendSizeGroupEnter.append("circle")
		.attr("cx", legendPaddings[3] + radiusScale.range()[1])
		.attr("cy", d => legendPaddings[0] + (radiusScale.range()[1] * 2) - radiusScale(d))
		.attr("r", d => !d ? 0 : radiusScale(d))
		.style("fill", "none")
		.style("stroke", "darkslategray");

	const legendSizeCirclesText = legendSizeGroupEnter.append("text")
		.attr("class", classPrefix + "legendCirclesText")
		.attr("x", legendPaddings[3] + radiusScale.range()[1] + legendLineSize + 4)
		.attr("y", (d, i) => i === 1 ? legendPaddings[0] + 5 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
			i ? legendPaddings[0] + 3 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				legendPaddings[0] + 3 + (radiusScale.range()[1] * 2) - 2)
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

};

function createRegionsTable(container, data, colors, lists) {

	container.append("span")
		.html("All regions, all-time allocations:");

	const allData = data.reduce((acc, curr) => {
		curr.fundTypes.forEach(type => {
			const foundType = acc.find(e => e.fundType === type.fundType);
			if (foundType) {
				foundType.value += type.value;
			} else {
				acc.push({
					fundType: type.fundType,
					value: type.value
				});
			};
		});
		return acc;
	}, []);

	const table = container.append("table")
		.attr("class", classPrefix + "table");

	const tableRow = table.selectAll(null)
		.data(allData)
		.enter()
		.append("tr");

	const tableCell = tableRow.selectAll(null)
		.data(d => Object.values(d))
		.enter()
		.append("td")
		.html((d, i) => i ? "$" + formatSIFloat(d).replace("G", "B") : lists.fundTypesList[d].toUpperCase());

};

function createPies(container, colors, lists) {

	const group = container.append("g")
		.attr("transform", `translate(${piesSize / 2},${piesSize / 2})`);

	const pies = group.selectAll(null)
		.data(d => pieGenerator(d.fundTypes))
		.enter()
		.append("path")
		.attr("d", arcGenerator)
		.attr("fill", d => colors[lists.fundTypesList[d.data.fundType]]);

};

function drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal) {

	if (buttonsObject.playing) stopTimer();

	processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists);

	const mergedYears = Array.from(new Set([...yearsSetAllocations, ...yearsSetContributions]));
	mergedYears.sort((a, b) => a - b);

	createDisabledOption(selections.yearDropdown, mergedYears);

	updateTopValues(topValues, selections);

	outerDiv.selectChildren().remove();

	const breadcrumb = createBreadcrumbs(outerDiv, "country profile");

	breadcrumb.firstBreadcrumb.style("cursor", "pointer");

	breadcrumb.secondBreadcrumbSpan.html(lists.fundNamesList[chartState.selectedCountryProfile]);

	const topButtonsDiv = breadcrumb.breadcrumbDiv.append("div")
		.attr("data-html2canvas-ignore", "true")
		.attr("class", classPrefix + "topButtonsDiv");

	createLinks(topButtonsDiv);

	const dropdownAndButtonsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "dropdownAndButtonsDiv");

	const dropdownDiv = dropdownAndButtonsDiv.append("div")
		.attr("class", classPrefix + "dropdownDiv");

	const yearsButtonsDiv = dropdownAndButtonsDiv.append("div")
		.attr("class", classPrefix + "yearsButtonsDiv");

	const fundsButtonsDiv = dropdownAndButtonsDiv.append("div")
		.attr("class", classPrefix + "fundsButtonsDiv");

	const tabsOuterDiv = outerDiv.append("div")
		.attr("class", classPrefix + "tabsOuterDiv");

	const tabsDiv = tabsOuterDiv.append("div")
		.attr("class", classPrefix + "tabsDiv");

	const chartDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartDiv");

	const tooltipDiv = chartDiv.append("div")
		.attr("id", classPrefix + "tooltipDiv")
		.style("display", "none");

	const tooltipDivYears = outerDiv.append("div")
		.attr("id", classPrefix + "tooltipDivYears")
		.style("display", "none");

	const dropdown = createDropdown(dropdownDiv, pooledFundsInData, lists);

	yearsButtons = createYearsButtons(yearsButtonsDiv, chartState.selectedCountryProfileTab === tabsData[tabsData.length - 1] ? yearsSetContributions : yearsSetAllocations, outerDiv, tooltipDivYears);

	yearsButtons.on("click.main", (_, d) => setQueryString("year", d, lists));

	const fundsButtons = createFundsButtons(fundsButtonsDiv, colorsObject);

	fundsButtons.on("click.main", (event, d) => setQueryString("fund", d, lists));

	const tabs = createTabs(tabsDiv, tabsData);

	setCallFunctions()
	callDrawingFunction();

	dropdown.list.on("click", (_, d) => {
		dropdown.container.classed("active", d => d.clicked = false);
		if (d.name === backToMenu) {
			const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colorsObject, worldMap);
			countries.on("click", (_, d) => {
				chartState.selectedCountryProfile = d.fund;
				setQueryString("country", chartState.selectedCountryProfile, lists);
				drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
			});
			return;
		};
		if (d.name === chartState.selectedCountryProfile) return;
		chartState.selectedYear = currentYear;
		chartState.selectedFund = "total";
		chartState.selectedCountryProfileTab = tabsData[0];
		tabs.classed("active", d => d === chartState.selectedCountryProfileTab);
		deleteQueryStringValues(lists);
		chartState.selectedCountryProfile = d.name;
		setQueryString("country", chartState.selectedCountryProfile, lists);
		breadcrumb.secondBreadcrumbSpan.html(lists.fundNamesList[chartState.selectedCountryProfile]);
		processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists);
		const mergedYears = Array.from(new Set([...yearsSetAllocations, ...yearsSetContributions]));
		mergedYears.sort((a, b) => a - b);
		createDisabledOption(selections.yearDropdown, mergedYears);
		updateTopValues(topValues, selections);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		yearsButtons = createYearsButtons(yearsButtonsDiv, d === tabsData[tabsData.length - 1] ? yearsSetContributions : yearsSetAllocations, outerDiv, tooltipDivYears);
		yearsButtons.on("click.main", (_, d) => setQueryString("year", d, lists));
		setCallFunctions();
		callDrawingFunction();
	});

	tabs.on("click", (event, d) => {
		if (chartState.selectedCountryProfileTab === d) return;
		if (buttonsObject.playing) stopTimer();
		if (d.includes("Contributions") || chartState.selectedCountryProfileTab.includes("Contributions")) {
			yearsButtons = createYearsButtons(yearsButtonsDiv, d === tabsData[tabsData.length - 1] ? yearsSetContributions : yearsSetAllocations, outerDiv, tooltipDivYears);
			yearsButtons.on("click.main", (_, d) => setQueryString("year", d, lists));
		};
		chartState.selectedCountryProfileTab = d;
		fundsButtons.style("display", e => d === tabsData[tabsData.length - 1] || ((d === tabsData[1] || d === tabsData[3]) && e === "cerf/cbpf") ? "none" : null);
		tabs.classed("active", (_, i, n) => n[i] === event.currentTarget);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		repositionYearsButtons(yearsButtonsDiv);
		setCallFunctions();
		callDrawingFunction();
	});

	breadcrumb.firstBreadcrumb.on("click", (event, d) => {
		const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colorsObject, worldMap);
		countries.on("click", (event, d) => {
			chartState.selectedCountryProfile = d.fund;
			setQueryString("country", chartState.selectedCountryProfile, lists);
			drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
		});
		return;
	});

	function setCallFunctions() {
		if (chartState.selectedCountryProfileTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction = createCountryProfileOverview(chartDiv, lists, colorsObject, worldMap, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction = createCountryProfileByPartner(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[2]) tabsCallingFunctions.find(d => d.name === tabsData[2]).callingFunction = createCountryProfileBySector(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[3]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction = createCountryProfileByPartnerAndSector(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[4]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction = createCountryProfileContributions(chartDiv, lists, colorsObject, tooltipDiv, yearsButtons);
	};

	function callDrawingFunction() {
		if (chartState.selectedCountryProfileTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction(overviewData, overviewAdminLevel1Data, resetYear, true);
		if (chartState.selectedCountryProfileTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction(byPartnerData, true, true);
		if (chartState.selectedCountryProfileTab === tabsData[2]) tabsCallingFunctions.find(d => d.name === tabsData[2]).callingFunction(bySectorData, true, true);
		if (chartState.selectedCountryProfileTab === tabsData[3]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction(byPartnerAndSectorData, true, true);
		if (chartState.selectedCountryProfileTab === tabsData[4]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction(contributionsData, true, true);
	};

};

function createDropdown(container, pooledFundsInData, lists) {

	const data = pooledFundsInData.reduce((acc, curr) => {
		acc.push({ type: "region", name: curr.region });
		curr.funds.forEach(e => acc.push({ type: "fund", name: e.fund }));
		return acc;
	}, []);

	data.unshift({ type: "backmenu", name: backToMenu });

	const dropdownContainer = container.append("div")
		.datum({
			clicked: false
		})
		.attr("class", classPrefix + "dropdownContainer");

	const dropdownTitleDiv = dropdownContainer.append("div")
		.attr("class", classPrefix + "dropdownTitleDiv");

	const dropdownTitle = dropdownTitleDiv.append("div")
		.attr("class", classPrefix + "dropdownTitle")
		.html(selectAnOption);

	const dropdownArrow = dropdownTitleDiv.append("div")
		.attr("class", classPrefix + "dropdownArrow");

	dropdownArrow.append("i")
		.attr("class", "fa fa-angle-down");

	const titleWidth = dropdownTitleDiv.node().getBoundingClientRect().width;

	container.style("max-width", (titleWidth + 24) + "px"); //'24' is the padding of the dropdown

	const dropdownList = dropdownContainer.append("div")
		.attr("class", classPrefix + "dropdownList");

	const items = dropdownList.selectAll(null)
		.data(data)
		.enter()
		.append("span")
		.attr("class", d => d.type)
		.html(d => d.type === "fund" ? lists.fundNamesList[d.name] : d.name);

	dropdownTitleDiv.on("click", () => {
		dropdownContainer.classed("active", d => d.clicked = !d.clicked);
	});

	dropdownContainer.on("mouseleave", () => dropdownContainer.classed("active", d => d.clicked = false));

	const countries = items.filter(d => d.tyope !== "region");

	return { list: countries, container: dropdownContainer };

};

function createFundsButtons(container, colors) {
	const buttons = container.selectAll(null)
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

	return buttons;
};

function createYearsButtons(container, yearsDataSet, outerDiv, tooltipDivYears) {

	d3.select("#pfbihpPlayButton")
		.property("disabled", !yearsDataSet.size);

	container.selectChildren().remove();

	const yearsData = Array.from(yearsDataSet).sort((a, b) => a - b);

	const yearLeftArrow = container.append("div")
		.attr("class", classPrefix + "yearLeftArrow")
		.style("cursor", "pointer");

	const yearButtonsContainerDiv = container.append("div")
		.attr("class", classPrefix + "yearButtonsContainerDiv");

	const yearButtonsContainer = yearButtonsContainerDiv.append("div")
		.attr("class", classPrefix + "yearButtonsContainer");

	const yearRightArrow = container.append("div")
		.attr("class", classPrefix + "yearRightArrow")
		.style("opacity", fadeOpacity)
		.style("cursor", "default");

	yearLeftArrow.append("i")
		.attr("class", "fas fa-angle-left");

	yearRightArrow.append("i")
		.attr("class", "fas fa-angle-right");

	const yearsButtons = yearButtonsContainer.selectAll(null)
		.data(yearsData)
		.enter()
		.append("button")
		.html(d => d);

	let yearButtonsSize,
		yearButtonsContainerSize;

	setTimeout(function () {
		yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth;
		yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;

		//1 as padding for small differences
		if (yearButtonsSize <= yearButtonsContainerSize + 1) {
			yearLeftArrow.style("display", "none");
			yearRightArrow.style("display", "none");
		};

		yearButtonsContainer.style("left", -1 * (yearButtonsSize - yearButtonsContainerSize) + "px");
	}, duration / 10);

	yearLeftArrow.on("click", () => {
		const thisLeft = parseInt(yearButtonsContainer.style("left"), 10);
		yearRightArrow.style("opacity", 1)
			.style("cursor", "pointer");
		yearButtonsContainer.transition()
			.duration(duration)
			.style("left", Math.min(thisLeft + yearButtonsContainerSize, 0) + "px")
			.on("end", () => {
				if (parseInt(yearButtonsContainer.style("left"), 10) === 0) {
					yearLeftArrow.style("opacity", fadeOpacity)
						.style("cursor", "default");
				};
			});
	});

	yearRightArrow.on("click", () => {
		const thisLeft = parseInt(yearButtonsContainer.style("left"), 10);
		yearLeftArrow.style("opacity", 1)
			.style("cursor", "pointer");
		yearButtonsContainer.transition()
			.duration(duration)
			.style("left", Math.max(thisLeft - yearButtonsContainerSize, -1 * (yearButtonsSize - yearButtonsContainerSize)) + "px")
			.on("end", () => {
				if (parseInt(yearButtonsContainer.style("left"), 10) === -1 * (yearButtonsSize - yearButtonsContainerSize)) {
					yearRightArrow.style("opacity", fadeOpacity)
						.style("cursor", "default");
				};
			});
	});

	yearsButtons.on("mouseover", (event, d) => mouseoverYears(event, d, tooltipDivYears, outerDiv))
		.on("mouseout", () => mouseOut(tooltipDivYears));

	return yearsButtons;
};

function repositionYearsButtons(container) {
	const yearButtonsContainerDiv = container.select(`.${classPrefix}yearButtonsContainerDiv`),
		yearButtonsContainer = container.select(`.${classPrefix}yearButtonsContainer`),
		yearLeftArrow = container.select(`.${classPrefix}yearLeftArrow`),
		yearRightArrow = container.select(`.${classPrefix}yearRightArrow`);

	let yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth,
		yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;

	if (yearButtonsSize <= yearButtonsContainerSize) {
		yearLeftArrow.style("display", "none");
		yearRightArrow.style("display", "none");
	} else {
		yearLeftArrow.style("display", null);
		yearRightArrow.style("display", null);
		yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth;
		yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;
	};

	yearButtonsContainer.style("left", -1 * (yearButtonsSize - yearButtonsContainerSize) + "px");
};

function createTabs(container, data) {

	const ul = container.append("ul")
		.attr("class", "nav nav-tabs");

	const tab = ul.selectAll(null)
		.data(data)
		.enter()
		.append("li")
		.attr("class", "nav-item")
		.append("a")
		.attr("class", "nav-link")
		.attr("href", "#")
		.classed("active", (_, i) => !i)
		.html(d => d);

	return tab;
};

function processAdminLevel1DataForCountryProfileOverview(rawAdminLevel1Data) {
	const data = [];
	rawAdminLevel1Data.forEach(row => {
		if (+row.PooledFundId === chartState.selectedCountryProfile) {
			const foundYear = data.find(d => d.year === row.AllocationYear);
			if (foundYear) {
				const foundAdminLevel1 = foundYear.adminLevel1List.find(e => e.AdminLocation1 === row.AdminLocation1 &&
					e.FundType === row.FundType &&
					e.AdminLocation1Latitude.toFixed(6) === row.AdminLocation1Latitude.toFixed(6) &&
					e.AdminLocation1Longitude.toFixed(6) === row.AdminLocation1Longitude.toFixed(6));
				if (foundAdminLevel1) {
					foundAdminLevel1.AdminLocation1Budget += row.AdminLocation1Budget;
				} else {
					foundYear.adminLevel1List.push(row);
				};
			} else {
				data.push({
					year: row.AllocationYear,
					adminLevel1List: [row]
				});
			};
		};
	});
	return data;
};

function processDataForCountryProfileOverview(rawAllocationsData, lists) {
	const data = [];
	yearsSetAllocations.clear();
	topValues.allocations = 0;
	topValues.projects.clear();
	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			yearsSetAllocations.add(row.AllocationYear);
			topValues.allocations += +row.ClusterBudget;
			row.ProjList.toString().split(separator).forEach(e => topValues.projects.add(e));
			const foundYear = data.find(d => d.year === row.AllocationYear);
			if (foundYear) {
				foundYear.allocationsList.push(row);
				pushCbpfOrCerf(foundYear, row, lists);
			} else {
				const yearObject = {
					year: row.AllocationYear,
					cbpf: 0,
					cerf: 0,
					total: 0,
					allocationsList: [row]
				};
				Object.keys(lists.allocationTypesList).forEach(e => {
					yearObject[`type${separator}${e}${separator}cerf`] = 0;
					yearObject[`type${separator}${e}${separator}cbpf`] = 0;
					yearObject[`type${separator}${e}${separator}total`] = 0;
				});
				pushCbpfOrCerf(yearObject, row, lists);
				data.push(yearObject);
			};
		};
	});
	return data;
};

function processDataForCountryProfileByPartner(rawAllocationsData, lists) {

	const data = {
		cerf: [],
		cbpf: [],
		cbpfAggregated: []
	};

	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			if (row.FundId === cbpfId) {
				const foundYearAggregated = data.cbpfAggregated.find(e => e.year === row.AllocationYear);
				if (foundYearAggregated) {
					const foundPartner = foundYearAggregated.values.find(e => e.partner === row.OrganizatinonId);
					if (foundPartner) {
						foundPartner.value += row.ClusterBudget;
					} else {
						foundYearAggregated.values.push({
							partner: row.OrganizatinonId,
							partnerType: row.OrganizatinonId,
							value: row.ClusterBudget
						});
					};
				} else {
					data.cbpfAggregated.push({
						year: row.AllocationYear,
						values: [{
							partner: row.OrganizatinonId,
							partnerType: row.OrganizatinonId,
							value: row.ClusterBudget
						}]
					});
				};
				populate(data.cbpf, row);
			};
			if (row.FundId === cerfId) populate(data.cerf, row);
		};
	});

	function populate(target, row) {
		const foundYear = target.find(e => e.year === row.AllocationYear);
		if (foundYear) {
			const foundPartner = foundYear.values.find(e => e.partner === row.PartnerCode);
			if (foundPartner) {
				foundPartner.value += row.ClusterBudget;
				foundPartner.projects += separator + row.ProjList;
			} else {
				foundYear.values.push({
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					value: row.ClusterBudget,
					projects: row.ProjList
				});
			};
		} else {
			target.push({
				year: row.AllocationYear,
				values: [{
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					value: row.ClusterBudget,
					projects: row.ProjList
				}]
			});
		};
	};

	data.cerf.sort((a, b) => a.year - b.year);
	data.cbpf.sort((a, b) => a.year - b.year);
	data.cbpfAggregated.sort((a, b) => a.year - b.year);

	return data;

};

function processDataForCountryProfileBySector(rawAllocationsData, lists) {

	const data = [];

	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			if (row.FundId === cerfId) {
				const foundYearAndSector = data.find(e => e.year === row.AllocationYear && e.sector === row.ClusterId);
				if (foundYearAndSector) {
					foundYearAndSector.total += row.ClusterBudget;
					foundYearAndSector.cerf += row.ClusterBudget;
					foundYearAndSector.projectsCerf += (foundYearAndSector.projectsCerf === "" ? "" : separator) + row.ProjList;
					foundYearAndSector.partnersCerf += (foundYearAndSector.partnersCerf === "" ? "" : separator) + row.PartnerCode;
				} else {
					data.push({
						year: row.AllocationYear,
						sector: row.ClusterId,
						projectsCerf: row.ProjList,
						partnersCerf: row.PartnerCode,
						projectsCbpf: "",
						partnersCbpf: "",
						total: row.ClusterBudget,
						cerf: row.ClusterBudget,
						cbpf: 0
					});
				};
			};
			if (row.FundId === cbpfId) {
				if (row.PooledFundId === chartState.selectedCountryProfile && row.FundId === cbpfId) {
					const foundYearAndSector = data.find(e => e.year === row.AllocationYear && e.sector === row.ClusterId);
					if (foundYearAndSector) {
						foundYearAndSector.total += row.ClusterBudget;
						foundYearAndSector.cbpf += row.ClusterBudget;
						foundYearAndSector.projectsCbpf += (foundYearAndSector.projectsCbpf === "" ? "" : separator) + row.ProjList;
						foundYearAndSector.partnersCbpf += (foundYearAndSector.partnersCbpf === "" ? "" : separator) + row.PartnerCode;
					} else {
						data.push({
							year: row.AllocationYear,
							sector: row.ClusterId,
							projectsCerf: "",
							partnersCerf: "",
							projectsCbpf: row.ProjList,
							partnersCbpf: row.PartnerCode,
							total: row.ClusterBudget,
							cerf: 0,
							cbpf: row.ClusterBudget
						});
					};
				};
			};
		};
	});

	return data;

};

function processDataForCountryProfileByPartnerAndSector(rawAllocationsData, lists) {

	const data = {
		cerf: [],
		cbpf: []
	};

	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			if (row.FundId === cbpfId) populate(data.cbpf, row);
			if (row.FundId === cerfId) populate(data.cerf, row);
		};
	});

	function populate(target, row) {
		const foundYear = target.find(e => e.year === row.AllocationYear);
		if (foundYear) {
			const foundPartnerAndSector = foundYear.values.find(e => e.partner === row.PartnerCode && e.sector === row.ClusterId);
			if (foundPartnerAndSector) {
				foundPartnerAndSector.value += row.ClusterBudget;
				foundPartnerAndSector.projects += separator + row.ProjList;
			} else {
				foundYear.values.push({
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					projects: row.ProjList,
					sector: row.ClusterId,
					value: row.ClusterBudget
				});
			};
		} else {
			target.push({
				year: row.AllocationYear,
				values: [{
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					projects: row.ProjList,
					sector: row.ClusterId,
					value: row.ClusterBudget
				}]
			});
		};
	};

	data.cerf.sort((a, b) => a.year - b.year);
	data.cbpf.sort((a, b) => a.year - b.year);

	return data;

};

function processDataForCountryProfileContributions(rawContributionsData, lists) {

	const data = [];
	yearsSetContributions.clear();

	rawContributionsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			yearsSetContributions.add(row.FiscalYear);
			const foundYear = data.find(e => e.year === row.FiscalYear);
			if (foundYear) {
				const foundDonor = foundYear.values.find(e => e.donor === row.DonorId);
				if (foundDonor) {
					foundDonor.total += (row.PledgeAmt + row.PaidAmt);
					foundDonor.paid += row.PaidAmt;
					foundDonor.pledge += row.PledgeAmt;
				} else {
					foundYear.values.push({
						donor: row.DonorId,
						total: (row.PledgeAmt + row.PaidAmt),
						pledge: row.PledgeAmt,
						paid: row.PaidAmt
					});
				};
			} else {
				data.push({
					year: row.FiscalYear,
					values: [{
						donor: row.DonorId,
						total: (row.PledgeAmt + row.PaidAmt),
						pledge: row.PledgeAmt,
						paid: row.PaidAmt
					}]
				});
			};
		};
	});

	data.sort((a, b) => a.year - b.year);

	return data;

};

function pushCbpfOrCerf(obj, row, lists) {
	if (row.FundId === cbpfId) {
		obj.cbpf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cbpf`] += +row.ClusterBudget;;
	} else if (row.FundId === cerfId) {
		obj.cerf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cerf`] += +row.ClusterBudget;;
	};
	obj.total += +row.ClusterBudget;
	obj[`type${separator}${row.AllocationSurceId}${separator}total`] += +row.ClusterBudget;;
};

function createListMenuData(rawAllocationsData, lists) {

	const data = [];

	rawAllocationsData.forEach(row => {
		const foundRegion = data.find(e => e.region === lists.fundRegionsList[row.PooledFundId]);
		if (foundRegion) {
			const foundYearRegion = foundRegion.values.find(e => e.year === row.AllocationYear);
			if (foundYearRegion) {
				foundYearRegion.value += row.ClusterBudget;
			} else {
				foundRegion.values.push({
					year: row.AllocationYear,
					value: row.ClusterBudget
				});
			};
			const foundFundTypeRegion = foundRegion.fundTypes.find(e => e.fundType === row.FundId);
			if (foundFundTypeRegion) {
				foundFundTypeRegion.value += row.ClusterBudget;
			} else {
				foundRegion.fundTypes.push({
					fundType: row.FundId,
					value: row.ClusterBudget
				});
			};
			const foundCountry = foundRegion.funds.find(e => e.fund === row.PooledFundId);
			if (foundCountry) {
				const foundFundTypeCountry = foundCountry.fundTypes.find(e => e.fundType === row.FundId);
				if (foundFundTypeCountry) {
					foundFundTypeCountry.value += row.ClusterBudget;
				} else {
					foundCountry.fundTypes.push({
						fundType: row.FundId,
						value: row.ClusterBudget
					});
				};
				const foundYear = foundCountry.values.find(e => e.year === row.AllocationYear);
				if (foundYear) {
					foundYear.value += row.ClusterBudget;
				} else {
					foundCountry.values.push({
						year: row.AllocationYear,
						value: row.ClusterBudget
					});
				};
			} else {
				foundRegion.funds.push({
					fund: row.PooledFundId,
					fundTypes: [{
						fundType: row.FundId,
						value: row.ClusterBudget
					}],
					values: [{
						year: row.AllocationYear,
						value: row.ClusterBudget
					}]
				});
			};
		} else {
			data.push({
				region: lists.fundRegionsList[row.PooledFundId],
				funds: [{
					fund: row.PooledFundId,
					fundTypes: [{
						fundType: row.FundId,
						value: row.ClusterBudget
					}],
					values: [{
						year: row.AllocationYear,
						value: row.ClusterBudget
					}]
				}],
				fundTypes: [{
					fundType: row.FundId,
					value: row.ClusterBudget
				}],
				values: [{
					year: row.AllocationYear,
					value: row.ClusterBudget
				}]
			});
		};
	});

	return data;
};

function processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists) {
	overviewData = processDataForCountryProfileOverview(rawAllocationsData, lists);
	overviewAdminLevel1Data = processAdminLevel1DataForCountryProfileOverview(adminLevel1Data);
	byPartnerData = processDataForCountryProfileByPartner(rawAllocationsData, lists);
	bySectorData = processDataForCountryProfileBySector(rawAllocationsData, lists);
	byPartnerAndSectorData = processDataForCountryProfileByPartnerAndSector(rawAllocationsData, lists);
	contributionsData = processDataForCountryProfileContributions(rawContributionsData, lists);
};

function createDisabledOption(dropdownContainer, yearsArray) {
	dropdownContainer.attr("disabled", "disabled");

	let disabledOption = dropdownContainer.selectAll("#" + generalClassPrefix + "disabledOption")
		.data([true]);

	disabledOption = disabledOption.enter()
		.append("option")
		.attr("id", generalClassPrefix + "disabledOption")
		.merge(disabledOption)
		.property("selected", true)
		.property("disabled", true)
		.html(yearsArray[0] + " - " + Math.min(yearsArray[yearsArray.length - 1], currentYear));
};

function updateTopValues(topValues, selections) {

	const updateTransition = d3.transition()
		.duration(duration);

	selections.contributionsTopFigure.text(topValuesNoValue);

	selections.allocationsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			if (!topValues.allocations) return () => topValuesNoValue;
			const currValue = n[i].textContent === topValuesNoValue ? 0 : reverseFormat(n[i].textContent.split("$")[1]);
			const interpolator = d3.interpolate(currValue || 0, topValues.allocations);
			return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
		});

	selections.donorsTopFigure.text(topValuesNoValue);

	selections.projectsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			if (!topValues.projects.size) return () => topValuesNoValue;
			return d3.interpolateRound(+n[i].textContent || 0, topValues.projects.size)
		});

};

function mouseoverYears(event, datum, tooltip, container) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const innerDiv = innerTooltipDiv.append("div");

	innerDiv.append("span")
		.html("Click for selecting a single year. Double-click or ALT + click for selecting multiple years.");

	positionTooltip(tooltip, container, event, "bottom");
};

function mouseOut(tooltip) {
	tooltip.html(null)
		.style("display", "none");
};

function setChartStateTooltip(event, tooltip) {
	chartState.currentHoveredElement = event.currentTarget;
	chartState.currentTooltip = tooltip;
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits, value)(value);
};

function setQueryString(key, value, lists) {
	if (lists.queryStringValues.has(key)) {
		lists.queryStringValues.set(key, value);
	} else {
		lists.queryStringValues.append(key, value);
	};
	const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
	window.history.replaceState(null, "", newURL);
};

function deleteQueryStringValues(lists) {
	lists.queryStringValues.delete("country");
	lists.queryStringValues.delete("year");
	lists.queryStringValues.delete("fund");
	const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
	window.history.replaceState(null, "", newURL);
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

function stopTimer() {
	buttonsObject.playing = false;
	buttonsObject.timer.stop();
	d3.select("#pfbihpyearNumberText").text("");
	d3.select("#" + generalClassPrefix + "PlayButton")
		.datum({
			clicked: false
		})
		.html("PLAY  ")
		.append("span")
		.attr("class", "fas fa-play");
};

export { createCountryProfile };