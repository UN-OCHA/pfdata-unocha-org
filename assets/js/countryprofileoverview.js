import { chartState } from "./chartstate.js";
import { positionTooltip } from "./positiontooltip.js";

//|constants
const topRowPercentage = 0.45,
	donutsRowPercentage = 1 - topRowPercentage,
	mapDivWidth = 0.3,
	barChartDivWidth = 0.40,
	middleDivWidth = 1 - mapDivWidth - barChartDivWidth,
	minContainerWidth = 1240,
	innerTooltipDivWidth = 290,
	duration = 1000,
	darkerValue = 0.2,
	brighterValueDonut = 0.1,
	darkerValueDonut = 0.3,
	darkerValueText = 0.5,
	padAngleDonut = 0.035,
	classPrefix = "pfbicpoverview",
	thisTab = "Overview",
	formatPercent = d3.format(".0%"),
	formatSIaxes = d3.format("~s"),
	formatMoneyComma = d3.format(",.0f"),
	mapProjection = d3.geoEquirectangular(),
	mapPath = d3.geoPath().projection(mapProjection),
	currentDate = new Date(),
	maxBarWisthPercentage = 0.055,
	localVariable = d3.local(),
	currentYear = currentDate.getFullYear(),
	separator = "##",
	stackKeys = ["total", "cerf", "cbpf"],
	partnersShortNames = {
		1: "INGO",
		2: "NNGO",
		3: "UN",
		4: "Other"
	},
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"]
	}, //THIS SHOULD NOT BE HARDCODED
	barChartPadding = [16, 12, 44, 42],
	barChartLegendPadding = 10,
	barChartLabelsPadding = 4,
	fadeOpacityCurrentYear = 0.5,
	fadeOpacityFundButton = 0.4,
	fadeOpacityLateralDonutText = 0.4,
	fadeOpacityLateralDonut = 0.1,
	moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
		"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
		"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
		"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
	],
	markerAttribute = "M0,0l-8.8-17.7C-12.1-24.3-7.4-32,0-32h0c7.4,0,12.1,7.7,8.8,14.3L0,0z",
	markerScaleSize = 1,
	moneyBagScale = 0.4,
	mainDonutThickness = 0.4,
	cerfDonutThickness = 0.5,
	cbpfDonutThickness = 0.5,
	mainDonutSize = 0.6,
	cerfDonutSize = 0.35,
	cbpfDonutSize = 0.35,
	lateralDonutThickness = 0.2,
	lateralDonutPadding = 0.3,
	polylineBreakPoint = 16,
	mainDonutValuesPadding = 6,
	lateralDonutValuesPadding = 22,
	lateralDonutValuesTopPosition = 52,
	lateralDonutDescriptionPadding = 20,
	lateralDonutDescriptionSpanPadding = 1,
	zeroArrowPadding = 3,
	maxRadius = 15,
	cbpfMapExtraPadding = 34,
	cbpfMapLinkPadding1 = 26,
	cbpfMapLinkPadding2 = 12,
	mapPadding = [12, 12, null, 12],
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5,
	bubbleLegendPadding = 6,
	bubbleLegendVertPadding = 14,
	xAxisTextSize = 12;

//Fake ISO codes for non-country funds, used to modify the map
const globalISOCode = "0G",
	syriaCrossBorderISOCode = "XX",
	venezuelaRefugeeISOCode = "0V",
	southAmericaISOCodes = ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY", "PE", "SR", "UY", "VE"];

let bubbleLegendValue,
	bubbleLegendGroup,
	allocationsWithoutCoordsDisclaimer;

function createCountryProfileOverview(container, lists, colors, mapData, tooltipDiv, fundButtons, yearsButtons) {

	const containerWidth = container.node().getBoundingClientRect().width;

	const outerDiv = container.append("div")
		.attr("class", classPrefix + "outerDiv");

	const chartsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartsDiv");

	const topRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "topRowDiv")
		.style("flex", "0 " + formatPercent(topRowPercentage));

	const donutsRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "donutsRowDiv")
		.style("flex", "0 " + formatPercent(donutsRowPercentage));

	const donutsTitle = donutsRowDiv.append("div")
		.attr("class", classPrefix + "donutsTitle")
		.append("span")
		.html("Allocations by Window/Allocation Type");

	const donutsDiv = donutsRowDiv.append("div")
		.attr("class", classPrefix + "donutsDiv");

	const cerfDonutsDiv = donutsDiv.append("div")
		.attr("class", classPrefix + "cerfDonutsDiv");

	const mainDonutsDiv = donutsDiv.append("div")
		.attr("class", classPrefix + "mainDonutsDiv");

	const cbpfDonutsDiv = donutsDiv.append("div")
		.attr("class", classPrefix + "cbpfDonutsDiv");

	const mapDiv = topRowDiv.append("div")
		.attr("class", classPrefix + "mapDiv")
		.style("flex", "0 " + formatPercent(mapDivWidth));

	const middleDiv = topRowDiv.append("div")
		.attr("class", classPrefix + "middleDiv")
		.style("flex", "0 " + formatPercent(middleDivWidth))
		.style("font-size", containerWidth < minContainerWidth ? "0.9vw" : "0.75vw")
		.style("flex-direction", containerWidth < minContainerWidth ? "column" : "row");

	const topFiguresDiv = middleDiv.append("div")
		.attr("class", classPrefix + "topFiguresDiv")
		.style("flex", containerWidth < minContainerWidth ? "0 65%" : "0 50%")
		.style("justify-content", containerWidth < minContainerWidth ? "space-between" : "center");

	const partnerFiguresDiv = middleDiv.append("div")
		.attr("class", classPrefix + "partnerFiguresDiv")
		.style("flex", containerWidth < minContainerWidth ? "0 35%" : "0 50%")
		.style("justify-content", containerWidth < minContainerWidth ? "center" : "center")
		.style("padding-left", containerWidth < minContainerWidth ? "1%" : null);

	const barChartDiv = topRowDiv.append("div")
		.attr("class", classPrefix + "barChartDiv")
		.style("flex", "0 " + formatPercent(barChartDivWidth));

	createTopFigures(topFiguresDiv, colors, lists);

	const barChartDivSize = barChartDiv.node().getBoundingClientRect();
	const barChartWidth = barChartDivSize.width;
	const barChartHeight = barChartDivSize.height;
	const mainDonutsChartDivSize = mainDonutsDiv.node().getBoundingClientRect();
	const mainDonutsChartWidth = mainDonutsChartDivSize.width;
	const mainDonutsChartHeight = mainDonutsChartDivSize.height;
	const cerfDonutsChartDivSize = cerfDonutsDiv.node().getBoundingClientRect();
	const cerfDonutsChartWidth = cerfDonutsChartDivSize.width;
	const cerfDonutsChartHeight = cerfDonutsChartDivSize.height;
	const cbpfDonutsChartDivSize = cbpfDonutsDiv.node().getBoundingClientRect();
	const cbpfDonutsChartWidth = cbpfDonutsChartDivSize.width;
	const cbpfDonutsChartHeight = cbpfDonutsChartDivSize.height;
	const mapDivSize = mapDiv.node().getBoundingClientRect();

	const svgMap = mapDiv.append("svg")
		.attr("viewBox", `0 0 ${mapDivSize.width} ${mapDivSize.height}`)
		.style("background-color", "white");

	const mapLayer = svgMap.append("g");
	const markersLayer = svgMap.append("g");
	const bubblesLayer = svgMap.append("g");

	const svgBarChart = barChartDiv.append("svg")
		.attr("viewBox", `0 0 ${barChartWidth} ${barChartHeight}`)
		.style("background-color", "white");

	const svgDonutsMain = mainDonutsDiv.append("svg")
		.attr("viewBox", `0 0 ${mainDonutsChartWidth} ${mainDonutsChartHeight}`)
		.style("background-color", "white");

	const svgDonutsCerf = cerfDonutsDiv.append("svg")
		.attr("viewBox", `0 0 ${cerfDonutsChartWidth} ${cerfDonutsChartHeight}`)
		.style("background-color", "white");

	const svgDonutsCbpf = cbpfDonutsDiv.append("svg")
		.attr("viewBox", `0 0 ${cbpfDonutsChartWidth} ${cbpfDonutsChartHeight}`)
		.style("background-color", "white");

	const xScale = d3.scaleBand()
		.range([barChartPadding[3], barChartWidth - barChartPadding[1]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScale = d3.scaleLinear()
		.range([barChartHeight - barChartPadding[2], barChartPadding[0]]);

	const radiusScale = d3.scaleSqrt()
		.range([1, maxRadius]);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.tickSizeInner(3)
		.tickSizeOuter(0);

	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yearRectDef = svgBarChart.append("defs")
		.append("linearGradient")
		.attr("id", "yearRectGradient")
		.attr("x2", "100%")
		.attr("y2", "0%");

	yearRectDef.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", colors.cerf);

	yearRectDef.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", colors.cbpf);

	const yearRect = svgBarChart.append("rect")
		.attr("rx", 1)
		.attr("ry", 1)
		.attr("width", 24)
		.attr("height", 2)
		.attr("y", barChartHeight - barChartPadding[2] + xAxis.tickSizeInner() + xAxisTextSize)
		.style("opacity", 0);

	const xAxisGroup = svgBarChart.append("g")
		.attr("class", classPrefix + "xAxisGroup")
		.attr("transform", "translate(0," + (barChartHeight - barChartPadding[2]) + ")");

	const yAxisGroup = svgBarChart.append("g")
		.attr("class", classPrefix + "yAxisGroup")
		.attr("transform", "translate(" + barChartPadding[3] + ",0)");

	const moneyBagGroup = svgDonutsMain.append("g")
		.attr("transform", `scale(${moneyBagScale})`);

	const moneyBag = moneyBagGroup.selectAll(null)
		.data(moneyBagdAttribute)
		.enter()
		.append("path")
		.style("fill", "#ccc")
		.attr("d", d => d);

	const moneyBagSize = moneyBagGroup.node().getBoundingClientRect();

	moneyBagGroup.attr("transform", `translate(${(mainDonutsChartWidth/2) - (moneyBagSize.width/2)},${(mainDonutsChartHeight/2) - (moneyBagSize.height/2)}) scale(${moneyBagScale})`);

	const arcGeneratorMain = d3.arc()
		.outerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2)
		.innerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2 * (1 - mainDonutThickness));

	const arcGeneratorCerf = d3.arc()
		.outerRadius((cerfDonutsChartHeight - (cerfDonutsChartHeight * (1 - cerfDonutSize))) / 2)
		.innerRadius((cerfDonutsChartHeight - (cerfDonutsChartHeight * (1 - cerfDonutSize))) / 2 * (1 - cerfDonutThickness));

	const arcGeneratorCbpf = d3.arc()
		.outerRadius((cbpfDonutsChartHeight - (cbpfDonutsChartHeight * (1 - cbpfDonutSize))) / 2)
		.innerRadius((cbpfDonutsChartHeight - (cbpfDonutsChartHeight * (1 - cbpfDonutSize))) / 2 * (1 - cbpfDonutThickness));

	const arcGeneratorMainPolyline = d3.arc()
		.outerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2)
		.innerRadius((mainDonutsChartHeight - (mainDonutsChartHeight * (1 - mainDonutSize))) / 2);

	const donutGenerator = d3.pie()
		.value(d => d.value);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	function draw(originalData, originalAdminLevel1Data, resetYear, drawMap) {

		const thisFund = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "total" : chartState.selectedFund,
			thisYear = originalData.find(e => e.year === chartState.selectedYear);

		if (resetYear || (!thisYear || !thisYear[thisFund])) setDefaultYear(originalData, yearsButtons);

		yearsButtons.classed("active", d => chartState.selectedYear === d);

		if (drawMap) createMap(mapData, mapLayer, mapDivSize, lists, mapDiv);

		disableFunds(originalData, fundButtons);
		disableYears(originalData, yearsButtons);

		const data = processData(originalData, lists);
		const adminLevel1Object = originalAdminLevel1Data.find(e => e.year === chartState.selectedYear);
		const adminLevel1Data = adminLevel1Object ? adminLevel1Object.adminLevel1List : [];

		const syncedTransition = d3.transition()
			.duration(duration);

		drawBubbleMap(adminLevel1Data, syncedTransition, data.donutChartData);
		drawTopFigures(data.topFigures, syncedTransition);
		drawPartnerFigures(data.partnerFigures, partnerFiguresDiv, syncedTransition, colors, lists);
		drawBarChart(data.stackedBarData, syncedTransition, originalData, originalAdminLevel1Data);
		drawDonutChart(data.donutChartData, syncedTransition);

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			draw(originalData, originalAdminLevel1Data, false, false);
		});

		yearsButtons.on("click", (event, d) => {
			if (chartState.selectedYear === d) return;
			chartState.selectedYear = d;
			draw(originalData, originalAdminLevel1Data, false, false);
		});

		yearsButtons.on("playButtonClick", () => {
			if (chartState.selectedCountryProfileTab !== thisTab) return;
			draw(originalData, originalAdminLevel1Data, false, false);
		});


		//end of draw
	};

	function drawBubbleMap(adminLevel1Data, syncedTransition, dataTotal) {

		const adminLevel1WithoutCoordinates = adminLevel1Data.filter(d => d.AdminLocation1Latitude === null &&
			d.AdminLocation1Longitude === null &&
			(chartState.selectedFund !== "cerf" && chartState.selectedFund !== "cbpf" ? true : d.FundType === chartState.selectedFund));

		//Create disclaimer for admin lv1 without coords

		const adminLevel1DataCerf = chartState.selectedFund !== "cbpf" ? adminLevel1Data.filter(d => d.FundType === cerfId &&
			d.AdminLocation1Latitude !== null && d.AdminLocation1Longitude !== null) : [];
		const adminLevel1DataCbpf = chartState.selectedFund !== "cerf" ? adminLevel1Data.filter(d => d.FundType === cbpfId &&
			d.AdminLocation1Latitude !== null && d.AdminLocation1Longitude !== null) : [];

		radiusScale.domain([0, d3.max(adminLevel1DataCbpf, d => d.AdminLocation1Budget) || 0]);

		let markers = markersLayer.selectAll(`.${classPrefix}markers`)
			.data(adminLevel1DataCerf, d => d.AdminLocation1 + d.AdminLocation1Latitude.toFixed(6) + d.AdminLocation1Longitude.toFixed(6));

		const markersExit = markers.exit()
			.transition(syncedTransition)
			.style("opacity", 0)
			.remove();

		const markersEnter = markers.enter()
			.append("path")
			.attr("class", classPrefix + "markers")
			.style("opacity", 0)
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.style("fill", colors.cerf)
			.attr("d", markerAttribute)
			.each((d, i, n) => {
				const [long, lat] = mapProjection([d.AdminLocation1Longitude, d.AdminLocation1Latitude]);
				d3.select(n[i]).attr("transform", `translate(${long},${lat}) scale(${markerScaleSize})`)
			});

		markers = markersEnter.merge(markers);

		markers.transition(syncedTransition)
			.style("opacity", 1);

		let bubbles = bubblesLayer.selectAll(`.${classPrefix}bubbles`)
			.data(adminLevel1DataCbpf, d => d.AdminLocation1 + d.AdminLocation1Latitude.toFixed(6) + d.AdminLocation1Longitude.toFixed(6));

		const bubblesExit = bubbles.exit()
			.transition(syncedTransition)
			.attr("r", 1e-6)
			.remove();

		const bubblesEnter = bubbles.enter()
			.append("circle")
			.attr("class", classPrefix + "bubbles")
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.style("fill", colors.cbpf)
			.each((d, i, n) => {
				const [long, lat] = mapProjection([d.AdminLocation1Longitude, d.AdminLocation1Latitude]);
				d3.select(n[i]).attr("cx", long)
					.attr("cy", lat);
			})
			.attr("r", 0);

		bubbles = bubblesEnter.merge(bubbles);

		bubbles.transition(syncedTransition)
			.attr("r", d => radiusScale(d.AdminLocation1Budget));

		bubbleLegendValue.transition(syncedTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, radiusScale.domain()[1]);
				return t => d3.formatPrefix(".2~", interpolator(t))(interpolator(t)).replace("k", " Thousand")
					.replace("M", " Million")
					.replace("G", " Billion");
			}).on("end", (_, i, n) => localVariable.set(bubbleLegendValue.node(), radiusScale.domain()[1]));

		bubbleLegendGroup.transition(syncedTransition)
			.style("opacity", adminLevel1DataCbpf.length ? 1 : 0);

		allocationsWithoutCoordsDisclaimer.datum(adminLevel1WithoutCoordinates)
			.transition(syncedTransition)
			.style("opacity", adminLevel1WithoutCoordinates.length ? 1 : 0);

		const cerfTotal = Object.entries(dataTotal).reduce((acc, curr) => {
			if (curr[0].includes("cerf")) acc += curr[1];
			return acc;
		}, 0);

		markers.on("mouseover", (event, d) => mouseoverMarkers(event, d, tooltipDiv, container, adminLevel1DataCerf, colors, cerfTotal))
			.on("mouseout", () => mouseOut(tooltipDiv));

		bubbles.on("mouseover", (event, d) => mouseoverBubbles(event, d, tooltipDiv, container, colors))
			.on("mouseout", () => mouseOut(tooltipDiv));

	};

	function drawBarChart(unfilteredData, syncedTransition, originalData, originalAdminLevel1Data) {

		const data = unfilteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

		const yearsArrayWithGaps = data.map(d => d.year).sort((a, b) => a - b);
		const yearsArray = d3.range(yearsArrayWithGaps[0], currentYear + 1, 1);
		yearsArray.splice(-1, 0, null);

		const unfilteredYearsArray = unfilteredData.map(d => d.year).sort((a, b) => a - b);
		const yearsArrayForTotal = d3.range(unfilteredYearsArray[0], currentYear + 1, 1);
		yearsArrayForTotal.splice(-1, 0, null);

		//IMPORTANT: keep the bars' width below a maximum
		const availableSpace = barChartWidth - barChartPadding[1] - barChartPadding[3];
		const barChartAreaWidth = Math.min(availableSpace, barChartWidth * maxBarWisthPercentage * (data.length ? yearsArray.length : yearsArrayForTotal.length));

		xScale.domain(data.length ? yearsArray : yearsArrayForTotal)
			.range([barChartPadding[3] + (availableSpace - barChartAreaWidth) / 2, barChartWidth - barChartPadding[1] - (availableSpace - barChartAreaWidth) / 2]);
		yScale.domain([0, d3.max(data, d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) || 0]);

		yearRect.style("opacity", data.length ? 1 : 0)
			.attr("x", xScale(chartState.selectedYear) - 12 + xScale.bandwidth() / 2)
			.style("fill", chartState.selectedFund === "cerf/cbpf" ? "url(#yearRectGradient)" : colors[chartState.selectedFund]);

		let noData = svgBarChart.selectAll(`.${classPrefix}noData`)
			.data([true]);

		noData = noData.enter()
			.append("text")
			.attr("class", classPrefix + "noData")
			.attr("x", barChartWidth / 2)
			.attr("y", barChartHeight / 2)
			.style("opacity", 0)
			.merge(noData)
			.text(data.length ? "" : `No data for ${chartState.selectedFund.toUpperCase()} allocations`);

		noData.transition(syncedTransition)
			.style("opacity", data.length ? 0 : 1);

		const stackedData = stack(data);

		let barsGroups = svgBarChart.selectAll(`.${classPrefix}barsGroups`)
			.data(stackedData, d => d.key);

		const barGroupsExit = barsGroups.exit().remove();

		const barGroupsEnter = barsGroups.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroups")
			.attr("pointer-events", "none")
			.style("fill", d => colors[d.key]);

		barsGroups = barGroupsEnter.merge(barsGroups);

		let bars = barsGroups.selectAll(`.${classPrefix}bars`)
			.data(d => d, d => d.data.year);

		const barsExit = bars.exit()
			.transition(syncedTransition)
			.attr("height", 0)
			.attr("y", yScale.range()[0])
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("width", xScale.bandwidth())
			.attr("height", 0)
			.attr("y", yScale(0))
			.attr("x", d => xScale(d.data.year))

		bars = barsEnter.merge(bars);

		bars.transition(syncedTransition)
			.style("opacity", d => d.data.year === currentYear ? fadeOpacityCurrentYear : 1)
			.attr("width", xScale.bandwidth())
			.attr("x", d => xScale(d.data.year))
			.attr("y", d => d[0] === d[1] ? yScale(0) : yScale(d[1]))
			.attr("height", d => yScale(d[0]) - yScale(d[1]));

		let barsLabels = svgBarChart.selectAll(`.${classPrefix}barsLabels`)
			.data(data, d => d.year);

		const barsLabelsExit = barsLabels.exit()
			.transition(syncedTransition)
			.style("opacity", 0)
			.attr("y", yScale.range()[0])
			.remove();

		const barsLabelsEnter = barsLabels.enter()
			.append("text")
			.attr("class", classPrefix + "barsLabels")
			.attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
			.attr("y", yScale.range()[0])
			.style("opacity", 0);

		barsLabels = barsLabelsEnter.merge(barsLabels);

		barsLabels.transition(syncedTransition)
			.style("opacity", 1)
			.attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
			.attr("y", d => yScale(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) - barChartLabelsPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let barsTooltipRectangles = svgBarChart.selectAll(`.${classPrefix}barsTooltipRectangles`)
			.data(data, d => d.year);

		const barsTooltipRectanglesExit = barsTooltipRectangles.exit().remove();

		const barsTooltipRectanglesEnter = barsTooltipRectangles.enter()
			.append("rect")
			.attr("class", classPrefix + "barsTooltipRectangles")
			.attr("pointer-events", "all")
			.style("opacity", 0)
			.attr("y", barChartPadding[0])
			.attr("height", barChartHeight - barChartPadding[0] - barChartPadding[2])
			.attr("width", xScale.step())
			.attr("x", d => xScale(d.year) - xScale.bandwidth() / 2);

		barsTooltipRectangles = barsTooltipRectanglesEnter.merge(barsTooltipRectangles);

		barsTooltipRectangles.transition(syncedTransition)
			.attr("width", xScale.step())
			.attr("x", d => xScale(d.year) - xScale.bandwidth() / 2);

		yAxis.tickSizeInner(-(xScale.range()[1] - barChartPadding[3]));

		xAxisGroup.transition(syncedTransition)
			.call(xAxis);

		yAxisGroup.transition(syncedTransition)
			.attr("transform", "translate(" + xScale.range()[0] + ",0)")
			.call(yAxis);

		xAxisGroup.selectAll(".tick")
			.filter(d => !d)
			.remove();

		xAxisGroup.selectAll(".tick text")
			.style("font-weight", null)
			.style("opacity", d => d % 2 === chartState.selectedYear % 2 || d === currentYear ? 1 : 0)
			.filter(d => d === chartState.selectedYear)
			.style("font-weight", "700");

		yAxisGroup.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		barsTooltipRectangles.on("mouseover", (event, d) => mouseoverBars(event, d, tooltipDiv, container, colors))
			.on("mouseout", () => mouseOut(tooltipDiv));

		//end of drawBarChart
	};

	function drawDonutChart(originalData, syncedTransition) {

		//CERF to the left, CBPF to the right
		donutGenerator.sort((a, b) => {
			if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
				return a.key === "cerf" && b.key !== "cerf" ? 1 : a.key !== "cerf" && b.key === "cerf" ? -1 : 0;
			} else {
				return +b.key - +a.key;
			};
		});

		const data = [];

		if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
			const cerfObject = populateObject("cerf", originalData);
			const cbpfObject = populateObject("cbpf", originalData);
			data.push(cerfObject, cbpfObject);
		} else {
			Object.entries(originalData).forEach(row => {
				if (row[0].includes(chartState.selectedFund) &&
					allocationTypes[row[0].split(separator)[0]].includes(row[0].split(separator)[1])) {
					data.push({ key: row[0].split(separator)[1], value: row[1] });
				};
			});
		};

		const totalValue = d3.sum(data, d => d.value);
		data.forEach(d => {
			d.percentage = (d.value / totalValue) || 0;
			if (d.types) {
				const totalValue = d3.sum(d.types, e => e.value);
				d.types.forEach(type => type.percentage = (type.value / totalValue) || 0);
			};
		});

		const dataCerf = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
			data.find(e => e.key === "cerf").types.slice() : null;

		const dataCbpf = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
			data.find(e => e.key === "cbpf").types.slice() : null;

		const donutData = donutGenerator.padAngle(data.every(e => e.value) ? padAngleDonut : 0).startAngle(0)(data);

		const donutDataCerf = dataCerf ? donutGenerator.padAngle(dataCerf.every(e => e.value) ? padAngleDonut : 0).startAngle(-Math.PI / 2)(dataCerf) : [];

		const donutDataCbpf = dataCbpf ? donutGenerator.padAngle(dataCbpf.every(e => e.value) ? padAngleDonut : 0).startAngle(-Math.PI / 2)(dataCbpf) : [];

		//main donut

		let mainDonutGroup = svgDonutsMain.selectAll(`.${classPrefix}mainDonutGroup`)
			.data([true]);

		mainDonutGroup = mainDonutGroup.enter()
			.append("g")
			.attr("class", classPrefix + "mainDonutGroup")
			.attr("transform", `translate(${(mainDonutsChartWidth/2)},${(mainDonutsChartHeight/2)})`)
			.merge(mainDonutGroup);

		let mainDonut = mainDonutGroup.selectAll(`.${classPrefix}mainDonut`)
			.data(donutData, d => d.data.key);

		const mainDonutExit = mainDonut.exit()
			.transition(syncedTransition)
			.attrTween("d", (d, i, n) => pieTweenExit(d, i, arcGeneratorMain))
			.remove();

		const mainDonutEnter = mainDonut.enter()
			.append("path")
			.attr("class", classPrefix + "mainDonut")
			.style("fill", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut))
			.each((d, i, n) => {
				const thisObject = Object.assign({}, d);
				thisObject.startAngle = !i ? d.startAngle : 0;
				thisObject.endAngle = !i ? d.startAngle : 0;
				localVariable.set(n[i], thisObject);
			});

		mainDonut = mainDonutEnter.merge(mainDonut);

		mainDonut.transition(syncedTransition)
			.style("fill", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut))
			.attrTween("d", (d, i, n) => pieTween(d, n[i], arcGeneratorMain));

		let mainDonutText = mainDonutGroup.selectAll(`.${classPrefix}mainDonutText`)
			.data(donutData, d => d.data.key);

		const mainDonutTextExit = mainDonutText.exit()
			.transition(syncedTransition)
			.style("opacity", 0)
			.remove();

		const mainDonutTextEnter = mainDonutText.enter()
			.append("text")
			.style("opacity", 0)
			.attr("class", classPrefix + "mainDonutText")
			.attr("x", d => arcGeneratorMain.centroid(d)[0])
			.attr("y", d => arcGeneratorMain.centroid(d)[1])
			.text(d => formatPercent(d.data.percentage));

		mainDonutText = mainDonutTextEnter.merge(mainDonutText);

		mainDonutText.raise();

		mainDonutText.transition(syncedTransition)
			.style("opacity", d => d.data.value ? 1 : 0)
			.attr("x", d => arcGeneratorMain.centroid(d)[0])
			.attr("y", d => arcGeneratorMain.centroid(d)[1])
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(+(n[i].textContent.split("%")[0]) / 100, d.data.percentage);
				return t => formatPercent(interpolator(t));
			});

		let arrowsMain = mainDonutGroup.selectAll(`.${classPrefix}arrowsMain`)
			.data(donutData);

		const arrowsMainEnter = arrowsMain.enter()
			.append("polyline")
			.attr("class", classPrefix + "arrowsMain")
			.style("stroke-width", "2px")
			.style("fill", "none")
			.style("opacity", 0)
			.style("stroke", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut));

		arrowsMain = arrowsMainEnter.merge(arrowsMain);

		arrowsMain.transition(syncedTransition)
			.style("opacity", d => 1)
			.style("stroke", (d, i) => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? colors[d.data.key] :
				!i ? d3.color(colors[chartState.selectedFund]).darker(darkerValueDonut) : d3.color(colors[chartState.selectedFund]).brighter(brighterValueDonut))
			.attr("points", setArrowsPoints);

		let mainDonutValues = mainDonutGroup.selectAll(`.${classPrefix}mainDonutValues`)
			.data(donutData);

		const mainDonutValuesEnter = mainDonutValues.enter()
			.append("text")
			.attr("class", classPrefix + "mainDonutValues")
			.style("opacity", 0)
			.attr("y", -4)
			.style("text-anchor", (_, i) => !i ? "end" : "start")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding))
			.text("$0");

		mainDonutValues = mainDonutValuesEnter.merge(mainDonutValues);

		mainDonutValues.transition(syncedTransition)
			.style("opacity", d => 1)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, d.data.value);
				localVariable.set(n[i], d.data.value);
				const finalValue = formatSIFloat(d.data.value);
				if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
					return t => "$" + formatSIFloatNoZeroes(interpolator(t));
				} else {
					return t => "$" + formatSIFloatNoZeroes(interpolator(t)).slice(0, -1);
				};
			});

		let mainDonutUnits = mainDonutGroup.selectAll(`.${classPrefix}mainDonutUnits`)
			.data(donutData);

		const mainDonutUnitsEnter = mainDonutUnits.enter()
			.append("text")
			.attr("class", classPrefix + "mainDonutUnits")
			.attr("y", 4)
			.style("text-anchor", (_, i) => !i ? "end" : "start")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding));

		mainDonutUnits = mainDonutUnitsEnter.merge(mainDonutUnits);

		mainDonutUnits.text(d => {
			const unit = formatSIFloat(d.data.value).slice(-1);
			return !d.data.value ? "Allocations" : unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "Dollars";
		});

		let mainDonutDescription = mainDonutGroup.selectAll(`.${classPrefix}mainDonutDescription`)
			.data(donutData);

		const mainDonutDescriptionEnter = mainDonutDescription.enter()
			.append("text")
			.attr("class", classPrefix + "mainDonutDescription")
			.attr("y", 30)
			.style("text-anchor", (_, i) => !i ? "end" : "start")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding));

		mainDonutDescriptionEnter.append("tspan")
			.attr("class", classPrefix + "mainDonutDescriptionFirstSpan");

		mainDonutDescriptionEnter.append("tspan")
			.attr("class", classPrefix + "mainDonutDescriptionSecondSpan")
			.attr("dy", "1em")
			.attr("x", (_, i) => (i ? 1 : -1) * (arcGeneratorMain.outerRadius()() + polylineBreakPoint * 2 + mainDonutValuesPadding));

		mainDonutDescription = mainDonutDescriptionEnter.merge(mainDonutDescription);

		mainDonutDescription.select(`.${classPrefix}mainDonutDescriptionFirstSpan`)
			.text(d => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
				`from ${d.data.key.toUpperCase()}` : chartState.selectedFund === "cerf" ? `for ${lists.allocationTypesList[d.data.key].split(" ")[0]}` :
				`for ${lists.allocationTypesList[d.data.key]}`);

		mainDonutDescription.select(`.${classPrefix}mainDonutDescriptionSecondSpan`)
			.text(d => chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "" :
				chartState.selectedFund === "cerf" ? lists.allocationTypesList[d.data.key].split(" ")[1] : "Allocations");

		drawLateralDonut("cerf", svgDonutsCerf, donutDataCerf);
		drawLateralDonut("cbpf", svgDonutsCbpf, donutDataCbpf);

		mainDonutGroup.on("mouseover", event => mouseoverMainDonut(event, donutData, tooltipDiv, container, lists, colors))
			.on("mouseout", () => mouseOut(tooltipDiv));

		function drawLateralDonut(type, donutContainer, fundData) {

			const fundWithNoAllocation = fundData.every(e => !e.value);

			const lateralWidth = type === "cerf" ? cerfDonutsChartWidth : cbpfDonutsChartWidth;
			const lateralHeight = type === "cerf" ? cerfDonutsChartHeight : cbpfDonutsChartHeight;
			const arcGeneratorLateral = type === "cerf" ? arcGeneratorCerf : arcGeneratorCbpf;

			let lateralDonutGroup = donutContainer.selectAll(`.${classPrefix}${type}DonutGroup`)
				.data([true]);

			const lateralDonutGroupExit = lateralDonutGroup.exit()
				.transition(syncedTransition)
				.style("opacity", 0)
				.remove();

			const lateralDonutGroupEnter = lateralDonutGroup.enter()
				.append("g")
				.attr("class", classPrefix + type + "DonutGroup")
				.attr("transform", `translate(${lateralWidth/2},${lateralHeight/2})`);

			lateralDonutGroup = lateralDonutGroupEnter.merge(lateralDonutGroup);

			let lateralDonut = lateralDonutGroup.selectAll(`.${classPrefix}${type}Donut`)
				.data(fundData, d => d.data.key);

			const lateralDonutEnter = lateralDonut.enter()
				.append("path")
				.attr("class", classPrefix + type + "Donut")
				.style("fill", (_, i) => !i ? d3.color(colors[type]).darker(darkerValueDonut) : d3.color(colors[type]).brighter(brighterValueDonut))
				.each((d, i, n) => {
					const thisObject = Object.assign({}, d);
					thisObject.startAngle = !i ? d.startAngle : 0;
					thisObject.endAngle = !i ? d.startAngle : 0;
					localVariable.set(n[i], thisObject);
				});

			lateralDonut = lateralDonutEnter.merge(lateralDonut);

			lateralDonut.transition(syncedTransition)
				.style("fill", (_, i) => !i ? d3.color(colors[type]).darker(darkerValueDonut) : d3.color(colors[type]).brighter(brighterValueDonut))
				.attrTween("d", (d, i, n) => pieTween(d, n[i], arcGeneratorLateral));

			let lateralDonutNoAllocations = lateralDonutGroup.selectAll(`.${classPrefix}lateralDonutNoAllocations`)
				.data(fundWithNoAllocation ? [{ startAngle: 0, endAngle: 2 * Math.PI }] : []);

			const lateralDonutNoAllocationsExit = lateralDonutNoAllocations.exit()
				.transition(syncedTransition)
				.style("opacity", 0)
				.remove();

			const lateralDonutNoAllocationsEnter = lateralDonutNoAllocations.enter()
				.append("path")
				.attr("class", classPrefix + "lateralDonutNoAllocations")
				.style("fill", "#000")
				.attr("opacity", fadeOpacityLateralDonut)
				.each((d, i, n) => {
					const thisObject = Object.assign({}, d);
					thisObject.startAngle = 0;
					thisObject.endAngle = 0;
					localVariable.set(n[i], thisObject);
				});

			lateralDonutNoAllocations = lateralDonutNoAllocationsEnter.merge(lateralDonutNoAllocations);

			lateralDonutNoAllocations.transition(syncedTransition)
				.attrTween("d", (d, i, n) => pieTween(d, n[i], arcGeneratorLateral));

			let lateralDonutText = lateralDonutGroup.selectAll(`.${classPrefix}${type}DonutText`)
				.data(fundData, d => d.data.key);

			const lateralDonutTextEnter = lateralDonutText.enter()
				.append("text")
				.style("opacity", 0)
				.attr("class", classPrefix + type + "DonutText")
				.attr("x", (d, i) => d.data.percentage < 1 ? arcGeneratorLateral.centroid(d)[0] : 0)
				.attr("y", (d, i) => d.data.percentage < 1 ? arcGeneratorLateral.centroid(d)[1] : 0)
				.style("stroke", d => d.data.percentage < 1 ? null : "none")
				.style("font-weight", d => d.data.percentage < 1 ? null : "600")
				.style("fill", d => d.data.percentage < 1 ? null : "#444")
				.text(d => formatPercent(d.data.percentage));

			lateralDonutText = lateralDonutTextEnter.merge(lateralDonutText);

			lateralDonutText.raise();

			lateralDonutText.transition(syncedTransition)
				.style("opacity", d => d.data.value ? 1 : 0)
				.attr("x", (d, i) => d.data.percentage < 1 ? arcGeneratorLateral.centroid(d)[0] : 0)
				.attr("y", (d, i) => d.data.percentage < 1 ? arcGeneratorLateral.centroid(d)[1] : 0)
				.style("stroke", d => d.data.percentage < 1 ? null : "none")
				.style("font-weight", d => d.data.percentage < 1 ? null : "600")
				.style("fill", d => d.data.percentage < 1 ? null : "#444")
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(+(n[i].textContent.split("%")[0]) / 100, d.data.percentage);
					return t => formatPercent(interpolator(t));
				});

			let lateralDonutValues = lateralDonutGroup.selectAll(`.${classPrefix}${type}DonutValues`)
				.data(fundData);

			const lateralDonutValuesEnter = lateralDonutValues.enter()
				.append("text")
				.style("opacity", 0)
				.attr("class", classPrefix + type + "DonutValues")
				.attr("y", (_, i) => (i ? 1 : -1) * (arcGeneratorLateral.outerRadius()()) - (i ? -lateralDonutValuesPadding : lateralDonutValuesTopPosition))
				.text("$0");

			lateralDonutValues = lateralDonutValuesEnter.merge(lateralDonutValues);

			lateralDonutValues.transition(syncedTransition)
				.style("opacity", fundWithNoAllocation ? fadeOpacityLateralDonutText : 1)
				.textTween((d, i, n) => {
					if (!d.data.value) {
						return () => "$0 allocations";
					} else {
						const unit = formatSIFloat(d.data.value).slice(-1);
						const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, d.data.value);
						localVariable.set(n[i], d.data.value);
						const finalValue = formatSIFloat(d.data.value);
						if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
							return t => "$" + formatSIFloatNoZeroes(interpolator(t));
						} else {
							return t => "$" + formatSIFloatNoZeroes(interpolator(t)).slice(0, -1) + (unit === "k" ? " Thousand" : unit === "M" ? " Million" : unit === "G" ? " Billion" : " Dollars");
						};
					};
				});

			let lateralDonutDescription = lateralDonutGroup.selectAll(`.${classPrefix}${type}DonutDescription`)
				.data(fundData);

			const lateralDonutDescriptionEnter = lateralDonutDescription.enter()
				.append("text")
				.attr("class", classPrefix + type + "DonutDescription")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("y", (_, i) => (i ? 1 : -1) * (arcGeneratorLateral.outerRadius()()) - (i ? -lateralDonutValuesPadding : lateralDonutValuesTopPosition) + lateralDonutDescriptionPadding)
				.text(d => type === "cerf" ? lists.allocationTypesList[d.data.key].split(" ")[0] : lists.allocationTypesList[d.data.key])

			lateralDonutDescriptionEnter.append("tspan")
				.attr("dy", lateralDonutDescriptionSpanPadding + "em")
				.attr("x", 0)
				.text(d => type === "cerf" ? lists.allocationTypesList[d.data.key].split(" ")[1] : "Allocations");

			lateralDonutDescription = lateralDonutDescriptionEnter.merge(lateralDonutDescription)
				.transition(syncedTransition)
				.style("opacity", fundWithNoAllocation ? fadeOpacityLateralDonutText : 1)

			lateralDonut.on("mouseover", (event, d) => mouseoverDonut(event, d, tooltipDiv, container, lists, colors))
				.on("mouseout", () => mouseOut(tooltipDiv));

		};

		function setArrowsPoints(d, i) {
			const cofactor = i ? 1 : -1;
			if (d.data.percentage === 0) {
				return `${cofactor*(arcGeneratorMain.outerRadius()() + zeroArrowPadding)},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint*2)},0`;
			} else if (d.data.percentage >= 0.25) {
				return `${cofactor*arcGeneratorMain.outerRadius()()},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
					${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint*2)},0`;
			} else {
				const centroid = arcGeneratorMainPolyline.centroid(d);
				return `${centroid[0]},${centroid[1]} 
						${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},${centroid[1]} 
						${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint)},0 
						${cofactor*(arcGeneratorMain.outerRadius()() + polylineBreakPoint*2)},0`;
			};
		};

		function pieTween(d, thisElement, thisArc) {
			const thisObject = Object.assign({}, d);
			const i = d3.interpolateObject(localVariable.get(thisElement), thisObject);
			localVariable.set(thisElement, i(1));
			return t => thisArc(i(t));
		};

		function pieTweenExit(d, i, thisArc) {
			const thisObject = Object.assign({}, d);
			thisObject.startAngle = 0;
			thisObject.endAngle = 0;
			const interpolator = d3.interpolateObject(d, thisObject);
			return t => thisArc(interpolator(t));
		};

		function populateObject(fund, originalData) {
			const obj = { key: fund, value: 0, types: [] };
			Object.entries(originalData).forEach(row => {
				if (row[0].includes(fund) && allocationTypes[row[0].split(separator)[0]].includes(row[0].split(separator)[1])) {
					obj.value += row[1];
					obj.types.push({ key: row[0].split(separator)[1], value: row[1] })
				};
			});
			return obj;
		};

		//end of drawDonutChart
	};

	function drawTopFigures(data, syncedTransition) {

		topFiguresDiv.select(`.${classPrefix}titleDiv`)
			.html(`${lists.fundNamesList[chartState.selectedCountryProfile]}, ${chartState.selectedYear}`);

		topFiguresDiv.select(`.${classPrefix}allocationsValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (_, i, n) => {
				const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, data.total);
				localVariable.set(n[i], data.total);
				const finalValue = formatSIFloat(data.total);
				if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
				} else {
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
				};
			});

		topFiguresDiv.select(`.${classPrefix}allocationsUnit`)
			.html(() => {
				const unit = formatSIFloat(data.total).slice(-1);
				return unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
			});

		topFiguresDiv.select(`.${classPrefix}projectsValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (_, i, n) => {
				const interpolator = d3.interpolateRound(n[i].textContent || 0, data.projects.size);
				return t => n[i].textContent = interpolator(t);
			});

		topFiguresDiv.select(`.${classPrefix}partnersValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (_, i, n) => {
				const interpolator = d3.interpolateRound(n[i].textContent || 0, data.partners.size);
				return t => n[i].textContent = interpolator(t);
			});

		topFiguresDiv.select(`.${classPrefix}sectorsValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (_, i, n) => {
				const interpolator = d3.interpolateRound(n[i].textContent || 0, data.sectors.size);
				return t => n[i].textContent = interpolator(t);
			});

		topFiguresDiv.on("mouseover", event => mouseoverTopFigures(event, data, tooltipDiv, container, colors))
			.on("mouseout", () => mouseOut(tooltipDiv));

		//end of drawTopFigures
	};

	function drawPartnerFigures(data, figuresContainer, syncedTransition, colors, lists) {

		data.forEach(d => d.partner = partnersShortNames[d.partner]);

		data.sort((a, b) => b.value - a.value);

		let partnerDiv = figuresContainer.selectAll(`.${classPrefix}partnerDiv`)
			.data(data, d => d.partner);

		partnerDiv.exit().remove();

		const partnerDivEnter = partnerDiv.enter()
			.append("div")
			.attr("class", classPrefix + "partnerDiv");

		const partnerName = partnerDivEnter.append("div")
			.attr("class", classPrefix + "partnerName")
			.html(d => d.partner + ":");

		const partnerValue = partnerDivEnter.append("div")
			.attr("class", classPrefix + "partnerValue")
			.html("$0")

		const partnerUnit = partnerDivEnter.append("div")
			.attr("class", classPrefix + "partnerUnit")
			.html("Allocated");

		const partnerSymbol = partnerDivEnter.append("div")
			.attr("class", classPrefix + "partnerSymbol");

		partnerDiv = partnerDivEnter.merge(partnerDiv);

		partnerDiv.order();

		partnerDiv.select(`.${classPrefix}partnerValue`)
			.transition(syncedTransition)
			.call(applyColors, colors)
			.tween("html", (d, i, n) => {
				const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, d.value);
				localVariable.set(n[i], d.value);
				const finalValue = formatSIFloat(d.value);
				if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
				} else {
					return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
				};
			});

		partnerDiv.select(`.${classPrefix}partnerUnit`)
			.html(d => {
				const unit = formatSIFloat(d.value).slice(-1);
				return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") + " Allocated";
			});

		partnerDiv.select(`.${classPrefix}partnerSymbol`)
			.each((_, i, n) => d3.select(n[i]).selectChildren().remove())
			.append("i")
			.attr("class", d => d.fund.size > 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs")
			.style("color", d => d.fund.size > 1 ? null : colors[lists.fundTypesList[Array.from(d.fund)[0]]]);

		figuresContainer.on("mouseenter", event => mouseoverPartnerFigures(event, data, tooltipDiv, container, colors))
			.on("mouseleave", () => mouseOut(tooltipDiv));

		//end of drawPartnerFigures
	};

	return draw;

	//end of createCountryProfileOverview
};

function createMap(mapData, mapLayer, mapDivSize, lists, mapDiv) {

	const cbpfFund = lists.cbpfFundsList.includes(chartState.selectedCountryProfile);

	mapPadding[2] = (2 * maxRadius + bubbleLegendVertPadding) + (cbpfFund ? cbpfMapExtraPadding : 0);

	mapLayer.selectChildren().remove();

	const countryFeatures = topojson.feature(mapData, mapData.objects.wrl_polbnda_int_simple_uncs);
	countryFeatures.features = countryFeatures.features.filter(d => {
		if (lists.fundIsoCodesList[chartState.selectedCountryProfile] === globalISOCode) return d.properties.ISO_2 !== "AQ";
		if (lists.fundIsoCodesList[chartState.selectedCountryProfile] === syriaCrossBorderISOCode) return d.properties.ISO_2 === "SY";
		if (lists.fundIsoCodesList[chartState.selectedCountryProfile] === venezuelaRefugeeISOCode) return southAmericaISOCodes.includes(d.properties.ISO_2);
		return d.properties.ISO_2 === lists.fundIsoCodesList[chartState.selectedCountryProfile];
	});

	mapProjection.fitExtent([
		[mapPadding[3], mapPadding[0]],
		[(mapDivSize.width - mapPadding[1] - mapPadding[3]), (mapDivSize.height - mapPadding[0] - mapPadding[2])]
	], countryFeatures);

	const country = mapLayer.append("path")
		.attr("d", mapPath(countryFeatures))
		.style("fill", "#F1F1F1")
		.style("stroke", "#D5D5D5")
		.style("stroke-width", "0.5px");

	bubbleLegendGroup = mapLayer.append("g")
		.attr("transform", `translate(0,${mapDivSize.height - mapPadding[2]})`);

	const bubbleLegendCircle = bubbleLegendGroup.append("circle")
		.attr("fill", "none")
		.style("stroke", "#666")
		.style("stroke-width", "1px")
		.style("stroke-opacity", strokeOpacityValue)
		.attr("r", maxRadius)
		.attr("cx", mapPadding[3] + maxRadius)
		.attr("cy", maxRadius);

	const bubbleLegendText = bubbleLegendGroup.append("text")
		.attr("class", classPrefix + "bubbleLegendText")
		.attr("y", maxRadius)
		.attr("x", mapPadding[3] + 2 * maxRadius + bubbleLegendPadding)
		.text("Max. allocation:");

	const bubbleTextWidth = bubbleLegendText.node().getBoundingClientRect().width;

	bubbleLegendValue = bubbleLegendGroup.append("text")
		.attr("class", classPrefix + "bubbleLegendValue")
		.attr("y", maxRadius)
		.attr("x", mapPadding[3] + 2 * maxRadius + 1.5 * bubbleLegendPadding + bubbleTextWidth)
		.text("0");

	allocationsWithoutCoordsDisclaimer = mapDiv.append("div")
		.attr("class", classPrefix + "allocationsDisclaimer")
		.style("opacity", 0);

	allocationsWithoutCoordsDisclaimer.append("span")
		.attr("class", "fas fa-exclamation-circle");

	if (cbpfFund) {
		mapLayer.append("text")
			.attr("class", classPrefix + "cbpfMapLink")
			.attr("x", mapPadding[3])
			.attr("y", mapDivSize.height - cbpfMapLinkPadding1)
			.text("*Please visit the ")
			.append("a")
			.attr("href", "https://cbpf.data.unocha.org/allocations-overview.html")
			.attr("target", "_blank")
			.text("CBPF Allocations Overview page");

		mapLayer.append("text")
			.attr("class", classPrefix + "cbpfMapLink")
			.attr("x", mapPadding[3])
			.attr("y", mapDivSize.height - cbpfMapLinkPadding2)
			.text("for CBPF allocation details on lower administrative level locations.");
	};

};

function createTopFigures(container, colors, lists) {

	const titleDiv = container.append("div")
		.attr("class", classPrefix + "titleDiv");

	const allocationsDiv = container.append("div")
		.attr("class", classPrefix + "allocationsDiv");

	const allocationsValue = allocationsDiv.append("div")
		.attr("class", classPrefix + "allocationsValue")
		.html("$0")
		.call(applyColors, colors);

	const allocationsUnitContainer = allocationsDiv.append("div")
		.attr("class", classPrefix + "allocationsUnitContainer");

	const allocationsUnit = allocationsUnitContainer.append("div")
		.attr("class", classPrefix + "allocationsUnit");

	const allocationsUnitValue = allocationsUnitContainer.append("div")
		.attr("class", classPrefix + "allocationsUnitValue")
		.html("Allocated");

	const projectsDiv = container.append("div")
		.attr("class", classPrefix + "projectsDiv");

	const projectsValue = projectsDiv.append("span")
		.attr("class", classPrefix + "projectsValue")
		.html("0")
		.call(applyColors, colors);

	const projectsText = projectsDiv.append("span")
		.attr("class", classPrefix + "projectsText")
		.html("Projects");

	const partnersDiv = container.append("div")
		.attr("class", classPrefix + "partnersDiv");

	const partnersValue = partnersDiv.append("span")
		.attr("class", classPrefix + "partnersValue")
		.html("0")
		.call(applyColors, colors);

	const partnersText = partnersDiv.append("span")
		.attr("class", classPrefix + "partnersText")
		.html("Partners");

	const sectorsDiv = container.append("div")
		.attr("class", classPrefix + "sectorsDiv");

	const sectorsValue = sectorsDiv.append("span")
		.attr("class", classPrefix + "sectorsValue")
		.html("0")
		.call(applyColors, colors);

	const sectorsText = sectorsDiv.append("span")
		.attr("class", classPrefix + "sectorsText")
		.html("Sectors");

};

function processData(originalData, lists) {

	const data = {
		stackedBarData: [],
		topFigures: {
			total: 0,
			projects: new Set(),
			partners: new Set(),
			sectors: new Set()
		},
		partnerFigures: [],
		donutChartData: {}
	};

	const rowFund = chartState.selectedFund === "cerf/cbpf" ? "total" : chartState.selectedFund;

	originalData.forEach(row => {
		const copiedRow = Object.assign({}, row);
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
		data.stackedBarData.push(copiedRow);
		if (row.year === chartState.selectedYear) {
			for (const key in row) {
				if (key.includes("type") && !key.includes("total")) {
					const properties = key.split(separator);
					data.donutChartData[`${properties[2]}${separator}${properties[1]}`] = row[key];
				};
			};
			data.topFigures.total += row[rowFund];
			row.allocationsList.forEach(allocation => {
				if (chartState.selectedFund === "cerf/cbpf" ||
					chartState.selectedFund === "total" ||
					chartState.selectedFund === lists.fundTypesList[allocation.FundId]) {
					allocation.ProjList.toString().split(separator).forEach(e => data.topFigures.projects.add(e));
					data.topFigures.partners.add(allocation.PartnerCode);
					data.topFigures.sectors.add(allocation.ClusterId);
					const foundPartner = data.partnerFigures.find(e => e.partner === allocation.OrganizatinonId);
					if (foundPartner) {
						foundPartner.value += allocation.ClusterBudget;
						foundPartner.fund.add(allocation.FundId);
					} else {
						const fundSet = new Set();
						fundSet.add(allocation.FundId);
						data.partnerFigures.push({
							partner: allocation.OrganizatinonId,
							value: +allocation.ClusterBudget,
							fund: fundSet
						});
					};
				};
			});
		};
	});

	return data;
};

function setDefaultYear(originalData, yearsButtons) {
	const years = originalData.map(d => d.year).sort((a, b) => a - b);
	let index = years.length;
	while (--index >= 0) {
		const thisFund = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "total" : chartState.selectedFund;
		if (originalData[index][thisFund]) {
			chartState.selectedYear = years[index];
			break;
		};
	};
	yearsButtons.filter(d => +d === chartState.selectedYear).dispatch("click");
};

function mouseoverMarkers(event, datum, tooltip, container, adminLevel1DataCerf, colors, cerfTotal) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong")
		.style("font-size", "16px")
		.html(datum.AdminLocation1);

	const innerDiv = innerTooltipDiv.append("div");

	innerDiv.append("span")
		.style("color", d3.color(colors.cerf).darker(darkerValueText))
		.style("font-weight", "bold")
		.html("$" + formatMoneyComma(cerfTotal));

	innerDiv.append("span")
		.html(" Allocated to all CERF locations");

	positionTooltip(tooltip, container, event, "right");
};

function mouseoverBubbles(event, datum, tooltip, container, colors) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong")
		.style("font-size", "16px")
		.html(datum.AdminLocation1);

	const innerDiv = innerTooltipDiv.append("div");

	innerDiv.append("span")
		.attr("class", classPrefix + "mapAllocationsText")
		.html(`${chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "Total" : chartState.selectedFund.toUpperCase()} CBPF Allocations: `);

	innerDiv.append("span")
		.attr("class", classPrefix + "mapAllocationsValue")
		.call(applyColors, colors)
		.html("$" + formatMoneyComma(datum.AdminLocation1Budget));

	positionTooltip(tooltip, container, event, "right");
};

function mouseoverTopFigures(event, data, tooltip, container, colors) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong")
		.style("font-size", "16px")
		.html("Summary");

	const innerDiv = innerTooltipDiv.append("div");

	innerDiv.append("span")
		.html(`${chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "Total" : chartState.selectedFund.toUpperCase()} Allocations: `);

	innerDiv.append("span")
		.attr("class", classPrefix + "topFiguresAllocationsValue")
		.call(applyColors, colors)
		.html("$" + formatMoneyComma(data.total));

	positionTooltip(tooltip, container, event, "center");

};

function mouseoverPartnerFigures(event, data, tooltip, container, colors) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong")
		.style("font-size", "16px")
		.html("Summary");

	const innerDiv = innerTooltipDiv.append("div");

	data.forEach(datum => {

		const partnerDiv = innerDiv.append("div");

		partnerDiv.append("span")
			.html(`${datum.partner} ${chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "Total" : chartState.selectedFund.toUpperCase()} allocations: `);

		partnerDiv.append("span")
			.attr("class", classPrefix + "partnerFiguresAllocationsValue")
			.call(applyColors, colors)
			.html("$" + formatMoneyComma(datum.value));

	});

	positionTooltip(tooltip, container, event, "center");

};

function mouseoverBars(event, data, tooltip, container, colors) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong")
		.style("font-size", "16px")
		.html(data.year);

	const innerDiv = innerTooltipDiv.append("div");

	if (chartState.selectedFund === "cerf/cbpf") {
		["cerf", "cbpf"].forEach(fund => {
			const fundDiv = innerDiv.append("div");

			fundDiv.append("span")
				.html(`${fund.toUpperCase()} Allocations: `);

			fundDiv.append("span")
				.attr("class", classPrefix + "topFiguresAllocationsValue")
				.style("color", d3.color(colors[fund]).darker(darkerValueText))
				.html("$" + formatMoneyComma(data[fund]));
		});
	} else {
		innerDiv.append("span")
			.html(`${chartState.selectedFund === "total" ? "Total" : chartState.selectedFund.toUpperCase()} Allocations: `);

		innerDiv.append("span")
			.attr("class", classPrefix + "topFiguresAllocationsValue")
			.call(applyColors, colors)
			.html("$" + formatMoneyComma(data[chartState.selectedFund]));
	};

	positionTooltip(tooltip, container, event, "left");

};

function mouseoverDonut(event, data, tooltip, container, lists, colors) {

	const thisFund = Object.entries(allocationTypes).find(d => d[1].includes(data.data.key))[0];

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong")
		.style("font-size", "16px")
		.html(lists.allocationTypesList[data.data.key]);

	innerTooltipDiv.append("div")
		.style("color", d3.color(colors[thisFund]).darker(darkerValueText))
		.style("font-weight", "bold")
		.html("$" + formatMoneyComma(data.value));

	positionTooltip(tooltip, container, event, "top");

};

function mouseoverMainDonut(event, data, tooltip, container, lists, colors) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong")
		.style("font-size", "16px")
		.html("Summary");

	const innerDiv = innerTooltipDiv.append("div");

	innerDiv.append("span")
		.html("Total allocations: ");

	const sumAllocations = d3.sum(data, d => d.value);

	innerDiv.append("span")
		.attr("class", classPrefix + "topFiguresAllocationsValue")
		.call(applyColors, colors)
		.html("$" + formatMoneyComma(sumAllocations));

	const filteredData = data.filter(d => d.value).sort((a, b) => b.value - a.value);

	filteredData.forEach(datum => {
		const thisFund = +datum.data.key === +datum.data.key ? Object.entries(allocationTypes).find(d => d[1].includes(datum.data.key))[0] : datum.data.key;

		const rowDiv = innerDiv.append("div");

		rowDiv.append("span")
			.html(`${+datum.data.key === +datum.data.key ? lists.allocationTypesList[datum.data.key] : datum.data.key.toUpperCase()} Allocations: `);

		rowDiv.append("span")
			.attr("class", classPrefix + "topFiguresAllocationsValue")
			.style("color", d3.color(colors[thisFund]).darker(darkerValueText))
			.html("$" + formatMoneyComma(datum.value));
	});

	positionTooltip(tooltip, container, event, "top");

};

function setChartStateTooltip(event, tooltip) {
	chartState.currentHoveredElement = event.currentTarget;
	chartState.currentTooltip = tooltip;
};

function disableFunds(data, fundButtons) {
	["cerf", "cbpf"].forEach(fund => {
		const filteredData = data.filter(e => e.year === chartState.selectedYear);
		const fundInData = filteredData.some(d => d[fund]);
		if (fund === chartState.selectedFund && !fundInData) {
			chartState.selectedFund = "total";
		};
		fundButtons.filter(d => d === fund).style("opacity", fundInData ? 1 : fadeOpacityFundButton)
			.style("pointer-events", fundInData ? "all" : "none")
			.style("filter", fundInData ? null : "saturate(0%)");
	});
	fundButtons.classed("active", e => e === chartState.selectedFund);
};

function disableYears(data, yearsButtons) {
	if (chartState.selectedFund !== "total" && chartState.selectedFund !== "cerf/cbpf") {
		const thisYearSet = data.reduce((acc, curr) => {
			if (curr[chartState.selectedFund]) acc.add(curr.year);
			return acc;
		}, new Set());
		yearsButtons.style("opacity", d => thisYearSet.has(d) ? 1 : fadeOpacityFundButton)
			.style("pointer-events", d => thisYearSet.has(d) ? "all" : "none")
			.style("filter", d => thisYearSet.has(d) ? null : "saturate(0%)");
	} else {
		yearsButtons.style("opacity", 1)
			.style("pointer-events", "all")
			.style("filter", null);
	};
};

function mouseOut(tooltip) {
	tooltip.html(null)
		.style("display", "none");
};

function applyColors(selection, colors) {
	selection.style("color", chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
		colors.total : d3.color(colors[chartState.selectedFund]).darker(darkerValueText));
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits, value)(value);
};

function formatSIFloatNoZeroes(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits + "~", value)(value);
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

export { createCountryProfileOverview };