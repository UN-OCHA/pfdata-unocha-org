//|Allocations by month module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";
import { createBreadcrumbs } from "./breadcrumbs.js";

//|constants
const classPrefix = "pfbicc",
	currentDate = new Date(),
	cumulativeChartHeightPercentage = 0.40,
	currentYear = currentDate.getFullYear(),
	currentMonth = currentDate.getMonth(),
	localVariable = d3.local(),
	allYears = "all",
	svgPaddingsCerf = [38, 42, 20, 50],
	svgPaddingsCbpf = [38, 42, 20, 50],
	svgColumnPadding = [16, 26, 4, 56],
	svgCumulativePaddingsCerf = [26, 42, 50, 50],
	svgCumulativePaddingsCbpf = [26, 42, 50, 50],
	arrowPaddingLeft = 22,
	arrowPaddingRight = 22,
	arrowCircleRadius = 15,
	innerTooltipDivWidth = 290,
	maxTooltipDonorNumber = 20,
	maxTooltipNameLength = 26,
	svgColumnChartWidth = 195,
	maxColumnRectHeight = 16,
	svgColumnChartHeight = 380,
	labelsColumnPadding = 2,
	cumulativeCircleRadius = 2,
	cumulativeLegendCircleRadius = 4,
	cumulativeLegendCirclePadding = 4,
	cumulativeHighlightCircleRadius = 4,
	legendPledgedPadding = 158,
	maxYearNumber = 4,
	duration = 1000,
	labelMargin = 22,
	labelPadding = 8,
	labelPaddingInner = 4,
	titlePadding = 6,
	precision = 6,
	topDonors = 10,
	tooltipPadding = 12,
	tooltipPaddingCumulative = 24,
	legendPadding = 22,
	legendRectSize = 16,
	legendTextPadding = 4,
	lineOpacity = 0.75,
	fadeOpacity = 0.1,
	fadeOpacityPartial = 0.5,
	cumulativeTitlePadding = 20,
	cumulativeLegendPadding = 36,
	cumulativeLegendSize = 60,
	cumulativeStrokeWidth = 2,
	cumulativeLabelPadding = 6,
	maxNumberOfBars = 12,
	tickMove = 6,
	tickSize = 9,
	unBlue = "#1F69B3",
	arrowFadeColor = "#f1f1f1",
	blankImg = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
	formatMoney0Decimals = d3.format(",.0f"),
	formatPercent = d3.format("%"),
	monthFormat = d3.timeFormat("%b"),
	monthFormatFull = d3.timeFormat("%B"),
	monthAbbrvParse = d3.timeParse("%b"),
	monthParse = d3.timeParse("%m"),
	dateParse = d3.timeParse("%m-%Y"),
	formatTime = d3.timeFormat("%d/%m/%Y"),
	formatSIaxes = d3.format("~s"),
	monthsArray = d3.range(1, 13, 1).map(d => monthFormat(monthParse(d))),
	separator = "##",
	stackKeys = ["total"],
	selectedValue = "total";

//|variables
let selectedYear,
	yearsArray,
	yearsArrayCerf,
	yearsArrayCbpf,
	previousXValue,
	cerfId,
	cbpfId;

function createAllocationsByMonth(selections, colors, lists) {

	cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	d3.select("#pfbihpPlayButton")
		.property("disabled", false);

	selectedYear = lists.queryStringValues.has("allocationYear") ? lists.queryStringValues.get("allocationYear").split("|").map(e => +e) :
		lists.queryStringValues.has("year") ? [+lists.queryStringValues.get("year")] : [allYears];

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	const breadcrumb = createBreadcrumbs(outerDiv, "allocations");

	breadcrumb.secondBreadcrumbSpan.html("by Year/Month");

	const topButtonsDiv = breadcrumb.breadcrumbDiv.append("div")
		.attr("data-html2canvas-ignore", "true")
		.attr("class", classPrefix + "topButtonsDiv");

	createLinks(topButtonsDiv);

	const containerDiv = outerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const tooltipDiv = containerDiv.append("div")
		.attr("id", classPrefix + "tooltipDiv")
		.style("display", "none");

	const topDiv = containerDiv.append("div")
		.attr("class", classPrefix + "topDiv");

	const yearButtonsDiv = topDiv.append("div")
		.attr("class", classPrefix + "yearButtonsDiv");

	const chartAreaDiv = containerDiv.append("div")
		.attr("class", classPrefix + "chartAreaDiv");

	const cerfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cerfContainerDiv");

	const cbpfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cbpfContainerDiv");

	chartState.currentTooltip = tooltipDiv;

	const cerfContainerDivSize = cerfContainerDiv.node().getBoundingClientRect();
	const cbpfContainerDivSize = cbpfContainerDiv.node().getBoundingClientRect();

	const svgWidthCerf = cerfContainerDivSize.width,
		svgWidthCbpf = cbpfContainerDivSize.width,
		svgHeightCerf = cerfContainerDivSize.height,
		svgHeightCbpf = cbpfContainerDivSize.height;

	const tickStepCerf = (svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]) / maxNumberOfBars,
		tickStepCbpf = (svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]) / maxNumberOfBars;

	const svgCerf = cerfContainerDiv.append("svg")
		.attr("width", svgWidthCerf)
		.attr("height", svgHeightCerf);

	const svgCbpf = cbpfContainerDiv.append("svg")
		.attr("width", svgWidthCbpf)
		.attr("height", svgHeightCbpf);

	const clipPathCerf = svgCerf.append("clipPath")
		.attr("id", classPrefix + "clipPathCerf")
		.append("rect")
		.attr("height", svgHeightCerf - svgPaddingsCerf[0] - svgPaddingsCerf[2])
		.attr("width", svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]);

	const clipPathGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "clipPathGroupCerf")
		.attr("transform", "translate(" + svgPaddingsCerf[3] + ",0)")
		.attr("clip-path", "url(#" + classPrefix + "clipPathCerf)");

	const chartAreaCerf = clipPathGroupCerf.append("g")
		.attr("class", classPrefix + "chartAreaCerf")
		.attr("transform", "translate(0,0)");

	const clipPathCbpf = svgCbpf.append("clipPath")
		.attr("id", classPrefix + "clipPathCbpf")
		.append("rect")
		.attr("height", svgHeightCbpf - svgPaddingsCbpf[0] - svgPaddingsCbpf[2])
		.attr("width", svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]);

	const clipPathGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "clipPathGroupCbpf")
		.attr("transform", "translate(" + svgPaddingsCbpf[3] + ",0)")
		.attr("clip-path", "url(#" + classPrefix + "clipPathCbpf)");

	const chartAreaCbpf = clipPathGroupCbpf.append("g")
		.attr("class", classPrefix + "chartAreaCbpf")
		.attr("transform", "translate(0,0)");

	const chartLayerCerf = chartAreaCerf.append("g");
	const chartLayerCbpf = chartAreaCbpf.append("g");
	const tooltipRectLayerCerf = chartAreaCerf.append("g");
	const tooltipRectLayerCbpf = chartAreaCbpf.append("g");

	const columnChartContainer = selections.byMonthChartContainer;

	columnChartContainer.html(null);

	const svgColumnChart = columnChartContainer.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	yearsArray = d3.range(lists.yearsArrayAllocations[0], currentYear + 1, 1);
	yearsArrayCerf = d3.range(lists.yearsArrayAllocationsCerf[0], currentYear + 1, 1);
	yearsArrayCbpf = d3.range(lists.yearsArrayAllocationsCbpf[0], currentYear + 1, 1);

	const xScaleCerf = d3.scaleBand()
		.paddingOuter(0.2);

	xScaleCerf.invert = function(x) {
		return d3.scaleQuantize().domain(this.range()).range(this.domain())(x);
	};

	const xScaleCerfInner = d3.scaleBand()
		.paddingInner(0.35)
		.paddingOuter(0.2);

	const xScaleCbpf = d3.scaleBand()
		.paddingOuter(0.2);

	xScaleCbpf.invert = function(x) {
		return d3.scaleQuantize().domain(this.range()).range(this.domain())(x);
	};

	const xScaleCbpfInner = d3.scaleBand()
		.paddingInner(0.35)
		.paddingOuter(0.2);

	const yScaleCerf = d3.scaleLinear()
		.range([(svgHeightCerf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCerf[2], svgPaddingsCerf[0] + labelMargin]);

	const yScaleCbpf = d3.scaleLinear()
		.range([(svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCbpf[2], svgPaddingsCbpf[0] + labelMargin]);

	const yScaleCumulativeCerf = d3.scaleLinear()
		.range([svgHeightCerf - svgPaddingsCerf[2] - svgCumulativePaddingsCerf[2], (svgHeightCerf * (1 - cumulativeChartHeightPercentage)) + svgCumulativePaddingsCerf[0]]);

	const yScaleCumulativeCbpf = d3.scaleLinear()
		.range([svgHeightCbpf - svgPaddingsCbpf[2] - svgCumulativePaddingsCbpf[2], (svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) + svgCumulativePaddingsCbpf[0]]);

	const xScaleColumn = d3.scaleLinear()
		.range([svgColumnPadding[3], svgColumnChartWidth - svgColumnPadding[1]]);

	const yScaleColumn = d3.scaleBand()
		.range([svgColumnPadding[0], svgColumnChartHeight - svgColumnPadding[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const colorScaleCerf = d3.scaleOrdinal();

	const colorScaleCbpf = d3.scaleOrdinal();

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const cumulativeLineGeneratorCerf = d3.line()
		.y(d => yScaleCumulativeCerf(d.total))
		.x(d => xScaleCerf(selectedYear[0] === allYears ? d.year : d.month) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const cumulativeLineGeneratorCbpf = d3.line()
		.y(d => yScaleCumulativeCbpf(d.total))
		.x(d => xScaleCbpf(selectedYear[0] === allYears ? d.year : d.month) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const xAxisCerf = d3.axisBottom(xScaleCerf)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(tickSize);

	const xAxisCbpf = d3.axisBottom(xScaleCbpf)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(tickSize);

	const yAxisCerf = d3.axisLeft(yScaleCerf)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]))
		.tickSizeOuter(0);

	const yAxisCbpf = d3.axisLeft(yScaleCbpf)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]))
		.tickSizeOuter(0);

	const yAxisCumulativeCerf = d3.axisLeft(yScaleCumulativeCerf)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]))
		.tickSizeOuter(0);

	const yAxisCumulativeCbpf = d3.axisLeft(yScaleCumulativeCbpf)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]))
		.tickSizeOuter(0);

	const xAxisGroupCerf = chartAreaCerf.append("g")
		.attr("class", classPrefix + "xAxisGroupCerf")
		.attr("transform", "translate(0," + ((svgHeightCerf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCerf[2]) + ")");

	const xAxisGroupCbpf = chartAreaCbpf.append("g")
		.attr("class", classPrefix + "xAxisGroupCbpf")
		.attr("transform", "translate(0," + ((svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCbpf[2]) + ")");

	const yAxisGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "yAxisGroupCerf")
		.attr("transform", "translate(" + svgPaddingsCerf[3] + ",0)");

	const yAxisGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "yAxisGroupCbpf")
		.attr("transform", "translate(" + svgPaddingsCbpf[3] + ",0)");

	const yAxisGroupCumulativeCerf = svgCerf.append("g")
		.attr("class", classPrefix + "yAxisGroupCumulativeCerf")
		.attr("transform", "translate(" + svgCumulativePaddingsCerf[3] + ",0)");

	const yAxisGroupCumulativeCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "yAxisGroupCumulativeCbpf")
		.attr("transform", "translate(" + svgCumulativePaddingsCbpf[3] + ",0)");

	yAxisGroupCerf.lower();
	yAxisGroupCbpf.lower();
	yAxisGroupCumulativeCerf.lower();
	yAxisGroupCumulativeCbpf.lower();

	const xAxisColumn = d3.axisTop(xScaleColumn)
		.tickSizeOuter(0)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumn = d3.axisLeft(yScaleColumn)
		.tickSize(3);

	const xAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "xAxisGroupColumn")
		.attr("transform", "translate(0," + svgColumnPadding[0] + ")");

	const yAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "yAxisGroupColumn")
		.attr("transform", "translate(" + svgColumnPadding[3] + ",0)");

	const defsCerf = svgCerf.append("defs")

	const patternCerf = defsCerf.append("pattern")
		.attr("id", classPrefix + "patterncerf")
		.attr("width", 10)
		.attr("height", 6)
		.attr("patternUnits", "userSpaceOnUse")
		.attr("patternTransform", "rotate(-45 0 0)");

	patternCerf.append("line")
		.attr("x1", 0)
		.attr("y1", 1)
		.attr("x2", 10)
		.attr("y2", 1)
		.attr("stroke-width", 3)
		.attr("stroke", colors.cerf);

	patternCerf.append("line")
		.attr("x1", 0)
		.attr("y1", 4)
		.attr("x2", 10)
		.attr("y2", 4)
		.attr("stroke-width", 4)
		.attr("stroke", "white");

	const defsCbpf = svgCbpf.append("defs")

	const patternCbpf = defsCbpf.append("pattern")
		.attr("id", classPrefix + "patterncbpf")
		.attr("width", 10)
		.attr("height", 6)
		.attr("patternUnits", "userSpaceOnUse")
		.attr("patternTransform", "rotate(-45 0 0)");

	patternCbpf.append("line")
		.attr("x1", 0)
		.attr("y1", 1)
		.attr("x2", 10)
		.attr("y2", 1)
		.attr("stroke-width", 3)
		.attr("stroke", colors.cbpf);

	patternCbpf.append("line")
		.attr("x1", 0)
		.attr("y1", 4)
		.attr("x2", 10)
		.attr("y2", 4)
		.attr("stroke-width", 4)
		.attr("stroke", "white");

	createYearButtons(yearButtonsDiv);

	function draw(originalData) {

		let data = filterData(originalData);
		let columnData = filterDataColumn(originalData);

		drawChart(data, "cerf");
		drawChart(data, "cbpf");
		createColumnTopValues(columnData);
		createColumnChart(columnData);

		const yearButtons = yearButtonsDiv.selectAll("button");

		yearButtons.on("mouseover", mouseoveryearButtons)
			.on("mouseout", mouseoutyearButtons)
			.on("click", (event, d) => {
				tooltipDiv.style("display", "none");
				const self = event.currentTarget;
				if (event.altKey) {
					clickyearButtons(d, false);
					return;
				};
				if (localVariable.get(self) !== "clicked") {
					localVariable.set(self, "clicked");
					setTimeout(() => {
						if (localVariable.get(self) === "clicked") {
							clickyearButtons(d, true);
						};
						localVariable.set(self, null);
					}, 250);
				} else {
					clickyearButtons(d, false);
					localVariable.set(self, null);
				};
			});

		function mouseoveryearButtons(_, d) {
			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltip = tooltipDiv.append("div")
				.style("max-width", "180px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltip.html(d === allYears ? "Click to show all years" : "Click for selecting a single year, double-click or ALT + click for selecting multiple years. Maximum: " + maxYearNumber + " years.");

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = this.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			tooltipDiv.style("left", (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
					tooltipPadding :
					thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
				.style("top", thisSize.top - containerSize.top + thisSize.height + 4 + "px");
		};

		function mouseoutyearButtons() {
			tooltipDiv.html(null)
				.style("display", "none");
		};

		function clickyearButtons(d, singleSelection) {
			if (singleSelection || d === allYears || selectedYear[0] === allYears) {
				selectedYear = [d];
				chartState.selectedYear = d;
			} else {
				const index = selectedYear.indexOf(d);
				if (index > -1) {
					if (selectedYear.length === 1) {
						return;
					} else {
						selectedYear.splice(index, 1);
					}
				} else {
					selectedYear.push(d);
					if (selectedYear.length > maxYearNumber) selectedYear.shift();
					chartState.selectedYear = d;
				};
			};

			data = filterData(originalData);
			columnData = filterDataColumn(originalData);

			drawChart(data, "cerf");
			drawChart(data, "cbpf");
			createColumnTopValues(columnData);
			createColumnChart(columnData);

			yearButtons.classed("active", d => selectedYear.indexOf(d) > -1);
			selections.yearDropdown.select("#pfbihpdisabledOption")
				.html(selectedYear.length > 1 ? "Multiple years" : selectedYear[0] === allYears ? "All" : selectedYear[0]);

			selections.yearDropdown.dispatch("change");

			if (selectedYear[0] !== allYears) {
				const yearValues = selectedYear.join("|");
				if (lists.queryStringValues.has("allocationYear")) {
					lists.queryStringValues.set("allocationYear", yearValues);
				} else {
					lists.queryStringValues.append("allocationYear", yearValues);
				};
			} else {
				lists.queryStringValues.delete("allocationYear");
			};
			const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
			window.history.replaceState(null, "", newURL);

		};

		//end of draw
	};

	function createYearButtons(container) {

		const yearsData = yearsArray.concat([allYears]);

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
			.classed("active", d => selectedYear.indexOf(d) > -1)
			.html(d => d === allYears ? capitalize(allYears) : d);

		let yearButtonsSize,
			yearButtonsContainerSize;

		setTimeout(function() {
			yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth;
			yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;

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

		//end of createYearButtons
	};

	function drawChart(data, fundType) {

		const xScale = fundType === "cerf" ? xScaleCerf : xScaleCbpf;
		const yScale = fundType === "cerf" ? yScaleCerf : yScaleCbpf;
		const xScaleInner = fundType === "cerf" ? xScaleCerfInner : xScaleCbpfInner;
		const yScaleCumulative = fundType === "cerf" ? yScaleCumulativeCerf : yScaleCumulativeCbpf;
		const yearsArray = fundType === "cerf" ? yearsArrayCerf : yearsArrayCbpf;
		const chartArea = fundType === "cerf" ? chartAreaCerf : chartAreaCbpf;
		const chartLayer = fundType === "cerf" ? chartLayerCerf : chartLayerCbpf;
		const tooltipRectLayer = fundType === "cerf" ? tooltipRectLayerCerf : tooltipRectLayerCbpf;
		const svg = fundType === "cerf" ? svgCerf : svgCbpf;
		const tickStep = fundType === "cerf" ? tickStepCerf : tickStepCbpf;
		const colorScale = fundType === "cerf" ? colorScaleCerf : colorScaleCbpf;
		const svgPaddings = fundType === "cerf" ? svgPaddingsCerf : svgPaddingsCbpf;
		const svgCumulativePaddings = fundType === "cerf" ? svgCumulativePaddingsCerf : svgCumulativePaddingsCbpf;
		const svgWidth = fundType === "cerf" ? svgWidthCerf : svgWidthCbpf;
		const svgHeight = fundType === "cerf" ? svgHeightCerf : svgHeightCbpf;
		const xAxis = fundType === "cerf" ? xAxisCerf : xAxisCbpf;
		const xAxisGroup = fundType === "cerf" ? xAxisGroupCerf : xAxisGroupCbpf;
		const yAxis = fundType === "cerf" ? yAxisCerf : yAxisCbpf;
		const yAxisGroup = fundType === "cerf" ? yAxisGroupCerf : yAxisGroupCbpf;
		const yAxisCumulative = fundType === "cerf" ? yAxisCumulativeCerf : yAxisCumulativeCbpf;
		const yAxisGroupCumulative = fundType === "cerf" ? yAxisGroupCumulativeCerf : yAxisGroupCumulativeCbpf;
		const cumulativeLineGenerator = fundType === "cerf" ? cumulativeLineGeneratorCerf : cumulativeLineGeneratorCbpf;

		if (selectedYear[0] !== allYears) {
			chartArea.transition()
				.duration(duration)
				.attr("transform", "translate(0,0)");
		};

		const noValues = selectedYear.every(e => e < yearsArray[0]);
		const xValue = selectedYear[0] === allYears ? "year" : "month";
		const dataYear = selectedYear[0] === allYears ? data.filter(e => yearsArray.includes(e.year)) : [];
		const dataMonth = selectedYear[0] === allYears || noValues ? [] : data;

		if (dataMonth.length) {
			dataMonth.forEach(row => {
				const monthlyData = row.monthValues.reduce((acc, curr) => {
					if (fundType === "cerf" ? curr.FundType === cerfId : curr.FundType !== cerfId) {
						const foundYear = acc.find(e => e.year === +curr.ApprovedDate.split("-")[1]);
						if (foundYear) {
							foundYear.total += curr.Budget;
						} else {
							acc.push({
								year: +curr.ApprovedDate.split("-")[1],
								total: curr.Budget,
							});
						};
					};
					return acc;
				}, []);
				monthlyData.sort((a, b) => b.year - a.year);
				row.monthlyData = monthlyData;
			});
		};

		const dataMonthWithZeros = monthsArray.reduce((acc, curr) => {
			const foundMonth = dataMonth.find(e => e.month === curr);
			if (foundMonth) {
				if (foundMonth.monthlyData.length !== selectedYear.length) {
					selectedYear.forEach(year => {
						if (!(year === currentYear && monthAbbrvParse(curr).getMonth() >= currentMonth) && year >= yearsArray[0]) {
							const foundYear = foundMonth.monthlyData.find(f => f.year === year);
							if (!foundYear) {
								foundMonth.monthlyData.push({
									year: year,
									total: 0,
								});
							};
						};
					});
				};
				acc.push(foundMonth);
			} else if (!(selectedYear.length === 1 && selectedYear[0] === currentYear)) {
				const obj = {
					month: curr,
					monthlyData: []
				};
				selectedYear.forEach(year => {
					if (!(year === currentYear && monthAbbrvParse(curr).getMonth() >= currentMonth) && year >= yearsArray[0]) {
						obj.monthlyData.push({
							year: year,
							total: 0,
						});
					};
				});
				acc.push(obj);
			};
			return acc;
		}, []);

		const dataCumulative = noValues ? [] :
			selectedYear[0] === allYears ?
			dataYear.reduce((acc, curr, index) => {
				acc[0].values.push({
					year: curr.year,
					total: curr[`${selectedValue}${separator}${fundType}`] + (acc[0].values[index - 1] ? acc[0].values[index - 1].total : 0)
				});
				return acc;
			}, [{
				year: allYears,
				values: []
			}]) : dataMonthWithZeros.reduce((acc, curr, index) => {
				curr.monthlyData.forEach(d => {
					const foundYear = acc.find(e => e.year === d.year);
					if (foundYear) {
						foundYear.values.push({
							month: curr.month,
							total: d[selectedValue] + (foundYear.values[index - 1] ? foundYear.values[index - 1].total : 0)
						});
					} else {
						acc.push({
							year: d.year,
							values: [{
								month: curr.month,
								total: d[selectedValue]
							}]
						});
					};
				});
				return acc;
			}, []);

		const minxScaleValue = d3.max(data, d => d[`total${separator}${fundType}`]) || 1e3;

		const minxScaleInnerValue = d3.max(dataMonth, d => d3.max(d.monthlyData, e => e.total)) || 1e3;

		xScale.domain(selectedYear[0] === allYears ? yearsArray : monthsArray)
			.range([0, (selectedYear[0] === allYears ? yearsArray.length : monthsArray.length) * tickStep]);

		xScale.paddingInner(selectedYear[0] === allYears ? 0.5 : 0.2);

		yScale.domain([0, (selectedYear[0] === allYears ?
			d3.max(data, d => d[`${selectedValue}${separator}${fundType}`]) || minxScaleValue :
			d3.max(dataMonth, d => d3.max(d.monthlyData, e => e[selectedValue])) || minxScaleInnerValue)]);

		yScaleCumulative.domain([0, (selectedYear[0] === allYears ?
			dataCumulative[0].values[dataCumulative[0].values.length - 1].total || minxScaleValue :
			d3.max(dataCumulative, d => d.values[d.values.length - 1].total) || minxScaleInnerValue)]);

		xScaleInner.domain(selectedYear[0] === allYears ? [] : selectedYear.slice().filter(e => e >= yearsArray[0]).sort((a, b) => a - b))
			.range([0, xScale.bandwidth()]);

		colorScale.domain(selectedYear.slice().sort((a, b) => a - b))
			.range(selectedYear.length === 1 ? [colors[fundType]] : colors[fundType + "Analogous"].slice().reverse());

		const syncedTransition = d3.transition(fundType)
			.duration(duration);

		let chartTitle = svg.selectAll("." + classPrefix + "chartTitle")
			.data([true]);

		const chartTitleEnter = chartTitle.enter()
			.append("text")
			.attr("class", classPrefix + "chartTitle")
			.attr("x", svgPaddings[3] + (svgWidth - svgPaddings[1] - svgPaddings[3]) / 2)
			.attr("y", noValues ? d3.mean(yScale.range()) : svgPaddings[0] - titlePadding)
			.text(noValues ? "" : fundType.toUpperCase() + (fundType === "cbpf" ? "* " : " "));

		chartTitleEnter.append("tspan")
			.attr("class", classPrefix + "chartTitleSpan")
			.text(noValues ? fundType.toUpperCase() + " started operations in " + yearsArray[0] :
				"(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		chartTitle = chartTitleEnter.merge(chartTitle);

		chartTitle.attr("y", noValues ? d3.mean(yScale.range()) : svgPaddings[0] - titlePadding);

		chartTitle.node().childNodes[0].textContent = noValues ? "" : fundType.toUpperCase() + (fundType === "cbpf" ? "* " : " ");

		chartTitle.select("tspan")
			.text(noValues ? fundType.toUpperCase() + " started operations in " + yearsArray[0] :
				"(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		let cumulativeVerticalRect = chartLayer.selectAll("." + classPrefix + "cumulativeVerticalRect")
			.data([true]);

		cumulativeVerticalRect = cumulativeVerticalRect.enter()
			.append("rect")
			.attr("class", classPrefix + "cumulativeVerticalRect")
			.style("opacity", 0)
			.style("fill", "#f6f6f6")
			.merge(cumulativeVerticalRect)
			.attr("y", yScale.range()[1] - labelMargin)
			.attr("height", yScaleCumulative.range()[0] - yScale.range()[1] + labelMargin);

		let bars = chartLayer.selectAll("." + classPrefix + "bars")
			.data(dataYear, d => d.year);

		const barsExit = bars.exit()
			.transition(syncedTransition)
			.attr("y", yScale(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("x", d => xScale(d.year))
			.attr("width", xScale.bandwidth())
			.attr("y", d => yScale(0))
			.attr("height", 0)
			.style("fill", d => selectedYear[0] === allYears && d.year === currentYear ? `url(#${classPrefix}pattern${fundType})` : colors[fundType])
			.attr("stroke", d => selectedYear[0] === allYears && d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => selectedYear[0] === allYears && d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		bars = barsEnter.merge(bars);

		bars.transition(syncedTransition)
			.style("opacity", 1)
			.attr("y", d => yScale(d[`${selectedValue}${separator}${fundType}`]))
			.attr("height", d => yScale(0) - yScale(d[`${selectedValue}${separator}${fundType}`]));

		let labels = chartLayer.selectAll("." + classPrefix + "labels")
			.data(dataYear.filter(e => e[`${selectedValue}${separator}${fundType}`]), d => d.year);

		const labelsExit = labels.exit()
			.transition(syncedTransition)
			.attr("y", yScale(0))
			.style("opacity", 0)
			.remove();

		const labelsEnter = labels.enter()
			.append("text")
			.attr("class", classPrefix + "labels")
			.attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
			.attr("y", yScale(0) - labelPadding);

		labels = labelsEnter.merge(labels);

		labels.transition(syncedTransition)
			.attr("y", d => yScale(d[`${selectedValue}${separator}${fundType}`]) - labelPadding)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[`${selectedValue}${separator}${fundType}`]);
				return t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"));
			});

		let group = chartLayer.selectAll("." + classPrefix + "group")
			.data(dataMonth, d => d.month);

		const groupExit = group.exit()
			.remove();

		const groupEnter = group.enter()
			.append("g")
			.attr("class", classPrefix + "group")
			.attr("transform", d => "translate(" + xScale(d.month) + ",0)");

		group = groupEnter.merge(group);

		group.attr("transform", d => "translate(" + xScale(d.month) + ",0)");

		let barsGroup = group.selectAll("." + classPrefix + "barsGroup")
			.data(d => d.monthlyData, d => d.year);

		const barsGroupExit = barsGroup.exit()
			.transition(syncedTransition)
			.attr("y", yScale(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsGroupEnter = barsGroup.enter()
			.append("rect")
			.attr("class", classPrefix + "barsGroup")
			.attr("x", d => xScaleInner(d.year))
			.attr("width", xScaleInner.bandwidth())
			.attr("y", d => yScale(0))
			.attr("height", 0)
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}pattern${fundType})` : colors[fundType])
			.attr("stroke", d => d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsGroup = barsGroupEnter.merge(barsGroup);

		barsGroup.transition(syncedTransition)
			.style("opacity", 1)
			.style("fill", (d, i, n) => d.year === currentYear ? `url(#${classPrefix}pattern${fundType})` : colorScale(d.year))
			.attr("x", d => xScaleInner(d.year))
			.attr("width", xScaleInner.bandwidth())
			.attr("y", d => yScale(d[selectedValue]))
			.attr("height", d => yScale(0) - yScale(d[selectedValue]));

		let labelsGroup = group.selectAll("." + classPrefix + "labelsGroup")
			.data(d => d.monthlyData.filter((e, i) => e[selectedValue]), d => d.year);

		const labelsGroupExit = labelsGroup.exit()
			.transition(syncedTransition)
			.attr("y", yScale(0))
			.style("opacity", 0)
			.remove();

		const labelsGroupEnter = labelsGroup.enter()
			.append("text")
			.attr("class", classPrefix + "labelsGroup")
			.attr("x", d => xScaleInner(d.year) + xScaleInner.bandwidth() / 2)
			.attr("y", yScale(0) - labelPaddingInner);

		labelsGroup = labelsGroupEnter.merge(labelsGroup);

		labelsGroup.raise();

		labelsGroup.transition(syncedTransition)
			.attr("x", d => xScaleInner(d.year) + xScaleInner.bandwidth() / 2)
			.attr("y", d => yScale(d[selectedValue]) - labelPaddingInner)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[selectedValue]);
				return t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"));
			});

		group.selectAll("text")
			.style("opacity", (_, i, n) => n.length > 2 ? +(!i || i === selectedYear.length - 1) : 1);

		let tooltipRect = tooltipRectLayer.selectAll("." + classPrefix + "tooltipRect")
			.data(dataYear, d => d.year);

		const tooltipRectExit = tooltipRect.exit()
			.remove();

		const tooltipRectEnter = tooltipRect.enter()
			.append("rect")
			.style("opacity", 0)
			.attr("pointer-events", "all")
			.attr("class", classPrefix + "tooltipRect")
			.attr("x", d => xScale(d[xValue]))
			.attr("y", svgPaddings[0])
			.attr("width", xScale.bandwidth())
			.attr("height", (svgHeight * (1 - cumulativeChartHeightPercentage)) - svgPaddings[0] - svgPaddings[2]);

		tooltipRect = tooltipRectEnter.merge(tooltipRect);

		tooltipRect.attr("x", d => xScale(d[xValue]))
			.attr("width", xScale.bandwidth());

		let tooltipGroup = chartLayer.selectAll("." + classPrefix + "tooltipGroup")
			.data(dataMonth, d => d.month);

		const tooltipGroupExit = tooltipGroup.exit()
			.remove();

		const tooltipGroupEnter = tooltipGroup.enter()
			.append("g")
			.attr("class", classPrefix + "tooltipGroup")
			.attr("transform", d => "translate(" + xScale(d.month) + ",0)");

		tooltipGroup = tooltipGroupEnter.merge(tooltipGroup);

		tooltipGroup.attr("transform", d => "translate(" + xScale(d.month) + ",0)")
			.each(d => d.monthlyData.forEach(e => e.parentData = d));

		let tooltipRectGroup = tooltipGroup.selectAll("." + classPrefix + "tooltipRectGroup")
			.data(d => d.monthlyData, d => d.year);

		const tooltipRectGroupExit = tooltipRectGroup.exit()
			.remove();

		const tooltipRectGroupEnter = tooltipRectGroup.enter()
			.append("rect")
			.attr("class", classPrefix + "tooltipRectGroup")
			.attr("x", d => xScaleInner(d.year))
			.attr("width", xScaleInner.bandwidth())
			.attr("y", svgPaddings[0])
			.attr("height", (svgHeight * (1 - cumulativeChartHeightPercentage)) - svgPaddings[0] - svgPaddings[2])
			.style("opacity", 0)
			.attr("pointer-events", "all");

		tooltipRectGroup = tooltipRectGroupEnter.merge(tooltipRectGroup);

		tooltipRectGroup.transition(syncedTransition)
			.attr("x", d => xScaleInner(d.year))
			.attr("width", xScaleInner.bandwidth());

		tooltipRect.on("mouseover", (event, d) => mouseoverTooltip(event, d, "yearTooltip"))
			.on("mouseout", mouseoutTooltip);

		tooltipRectGroup.on("mouseover", (event, d) => mouseoverTooltip(event, d, "monthTooltip"))
			.on("mouseout", mouseoutTooltip);

		function mouseoverTooltip(event, d, tooltipType) {

			chartState.currentHoveredElement = event.currentTarget;

			group.call(highlightSelection);
			labels.call(highlightSelection);
			bars.call(highlightSelection);

			function highlightSelection(selection) {
				selection.style("opacity", e => d.parentData ? (e.month === d.parentData.month ? 1 : fadeOpacity) :
					e.year === d.year ? 1 : fadeOpacity);
			};

			if (selectedYear.length > 1) {
				barsGroup.style("opacity", e => e.year === d.year ? 1 : fadeOpacityPartial);
				labelsGroup.style("opacity", e => e.year === d.year ? 1 : 0);
			};

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(tooltipType === "yearTooltip" ? d.year : monthFormatFull(monthAbbrvParse(d.parentData.month)) + " " + d.year);

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			const valuesArray = tooltipType === "yearTooltip" ? d.yearValues : d.parentData.monthValues.filter(e => +e.ApprovedDate.split("-")[1] === d.year);

			const totalValues = valuesArray.reduce((acc, curr) => {
				if (fundType === "cerf" ? curr.FundType === cerfId : curr.FundType !== cerfId) {
					acc.total += curr.Budget;
				};
				return acc;
			}, {
				total: 0
			});

			let tooltipData = valuesArray.reduce((acc, curr) => {
				if (fundType === "cerf" ? curr.FundType === cerfId : curr.FundType !== cerfId) {
					const foundFund = acc.find(e => e.fundId === curr.PooledFundName);
					if (foundFund) {
						foundFund.total += curr.Budget;
					} else {
						acc.push({
							fundId: curr.PooledFundName,
							total: curr.Budget,
						});
					};
				};
				return acc;
			}, []);

			tooltipData.sort((a, b) => b[selectedValue] - a[selectedValue]);

			tooltipData = tooltipData.reduce((acc, curr, index) => {
				if (index < maxTooltipDonorNumber) {
					acc.push(curr)
				} else if (index === maxTooltipDonorNumber) {
					curr.fundId = null;
					acc.push(curr);
				} else {
					acc[maxTooltipDonorNumber].total += curr.total;
				};
				return acc;
			}, []);

			const rowDivTotal = tooltipContainer.append("div")
				.style("display", "flex")
				.style("align-items", "center")
				.style("margin-bottom", "12px")
				.style("width", "100%");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipYears")
				.html("Total");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipLeader");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipValues")
				.html("$" + formatMoney0Decimals(totalValues[selectedValue]));

			tooltipData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(row.fundId ? lists.fundAbbreviatedNamesList[row.fundId].substring(0, maxTooltipNameLength) : "Others");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row[selectedValue]));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = event.currentTarget.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisOffsetLeft = tooltipSize.width > containerSize.right - thisSize.right - tooltipPadding ?
				thisSize.left - containerSize.left - thisSize.width - tooltipSize.width - tooltipPadding :
				thisSize.left - containerSize.left + thisSize.width + tooltipPadding;

			tooltipDiv.style("left", thisOffsetLeft + "px")
				.style("top", Math.max((thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top, 0) + "px");

		};

		function mouseoutTooltip() {
			if (chartState.isSnapshotTooltipVisible) return;
			chartState.currentHoveredElement = null;

			group.style("opacity", 1);
			labels.style("opacity", 1);
			bars.style("opacity", 1);
			barsGroup.style("opacity", 1);
			group.selectAll("text")
				.style("opacity", (_, i) => +(!i || i === selectedYear.length - 1));

			tooltipDiv.html(null)
				.style("display", "none");
		};

		xAxisGroup.transition(syncedTransition)
			.style("opacity", noValues ? 0 : 1)
			.attr("transform", "translate(0," + yScale(0) + ")")
			.call(xAxis);

		yAxisGroup.transition(syncedTransition)
			.style("opacity", noValues ? 0 : 1)
			.call(yAxis);

		yAxisGroup.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		yAxisGroupCumulative.transition(syncedTransition)
			.style("opacity", noValues ? 0 : 1)
			.call(yAxisCumulative)
			.selectAll("line")
			.style("stroke-dasharray", d => !d ? "none" : null)
			.style("stroke", d => !d ? "#bbb" : null);

		let legendGroup = svg.selectAll("." + classPrefix + "legendGroup")
			.data(selectedYear[0] === allYears || selectedYear.indexOf(currentYear) > -1 ? [true] : []);

		const legendGroupExit = legendGroup.exit()
			.call(exitSelection, syncedTransition);

		const legendGroupEnter = legendGroup.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroup")
			.attr("transform", "translate(" + (svgPaddings[3] + xScale.paddingOuter() * xScale.step()) + "," + (svgHeight - legendPadding) + ")")
			.style("opacity", 0);

		legendGroupEnter.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", `url(#${classPrefix}pattern${fundType})`);

		legendGroupEnter.append("text")
			.attr("x", legendRectSize + legendTextPadding)
			.attr("y", legendRectSize / 2)
			.text("Current year");

		legendGroup = legendGroupEnter.merge(legendGroup);

		legendGroup.transition(syncedTransition)
			.style("opacity", 1);

		let legendPledged = svg.selectAll("." + classPrefix + "legendPledged")
			.data(fundType === "cbpf" ? [true] : []);

		legendPledged = legendPledged.enter()
			.append("text")
			.attr("class", classPrefix + "legendPledged")
			.attr("x", legendGroup.size() ? legendPledgedPadding : svgPaddings[3] + xScale.paddingOuter() * xScale.step())
			.attr("y", svgHeight - legendPadding + legendRectSize / 2)
			.text("*: Limited allocation data in GMS prior to 2015")
			.merge(legendPledged)
			.transition(syncedTransition)
			.attr("x", legendGroup.size() ? legendPledgedPadding : svgPaddings[3] + xScale.paddingOuter() * xScale.step());

		let cumulativeTitle = svg.selectAll("." + classPrefix + "cumulativeTitle")
			.data([true]);

		const cumulativeTitleEnter = cumulativeTitle.enter()
			.append("text")
			.attr("class", classPrefix + "cumulativeTitle")
			.attr("x", svgPaddings[3] + (svgWidth - svgPaddings[1] - svgPaddings[3]) / 2)
			.attr("y", yScaleCumulative(0) + cumulativeTitlePadding)
			.style("opacity", noValues ? 0 : 1)
			.text("Cumulative total");

		cumulativeTitle = cumulativeTitleEnter.merge(cumulativeTitle);

		cumulativeTitle.transition(syncedTransition)
			.style("opacity", noValues ? 0 : 1);

		let cumulativeLines = chartLayer.selectAll("." + classPrefix + "cumulativeLines")
			.data(dataCumulative);

		const cumulativeLinesExit = cumulativeLines.exit()
			.call(exitSelection, syncedTransition);

		const cumulativeLinesEnter = cumulativeLines.enter()
			.append("path")
			.attr("class", classPrefix + "cumulativeLines")
			.style("stroke", colors[fundType])
			.style("fill", "none")
			.style("stroke-width", cumulativeStrokeWidth)
			.attr("d", d => cumulativeLineGenerator(d.values));

		cumulativeLines = cumulativeLinesEnter.merge(cumulativeLines);

		cumulativeLines.transition(syncedTransition)
			.style("stroke", d => colorScale(d.year))
			.attr("d", d => cumulativeLineGenerator(d.values));

		let cumulativeLabels = chartLayer.selectAll("." + classPrefix + "cumulativeLabels")
			.data(dataCumulative.length === 1 ? dataCumulative[0].values : []);

		const cumulativeLabelsExit = cumulativeLabels.exit()
			.call(exitSelection, syncedTransition);

		const cumulativeLabelsEnter = cumulativeLabels.enter()
			.append("text")
			.attr("class", classPrefix + "cumulativeLabels")
			.attr("x", d => xScale(d[selectedYear[0] === allYears ? "year" : "month"]) + xScale.bandwidth() / 2)
			.attr("y", d => yScaleCumulative(d.total) - cumulativeLabelPadding)
			.text(d => "$" + formatSIFloat1Digit(d.total));

		cumulativeLabels = cumulativeLabelsEnter.merge(cumulativeLabels);

		cumulativeLabels.transition(syncedTransition)
			.attr("x", d => xScale(d[selectedYear[0] === allYears ? "year" : "month"]) + xScale.bandwidth() / 2)
			.attr("y", d => yScaleCumulative(d.total) - cumulativeLabelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.total);
				return t => "$" + formatSIFloat1Digit(interpolator(t)).replace("G", "B");
			});

		let cumulativeCirclesGroup = chartLayer.selectAll("." + classPrefix + "cumulativeCirclesGroup")
			.data(dataCumulative);

		const cumulativeCirclesGroupExit = cumulativeCirclesGroup.exit()
			.call(exitSelection, syncedTransition);

		const cumulativeCirclesGroupEnter = cumulativeCirclesGroup.enter()
			.append("g")
			.attr("class", classPrefix + "cumulativeCirclesGroup")
			.style("fill", d => colorScale(d.year));

		cumulativeCirclesGroup = cumulativeCirclesGroupEnter.merge(cumulativeCirclesGroup);

		cumulativeCirclesGroup.transition(syncedTransition)
			.style("fill", d => colorScale(d.year));

		let cumulativeCircles = cumulativeCirclesGroup.selectAll("." + classPrefix + "cumulativeCircles")
			.data(d => d.values, d => selectedYear[0] === allYears ? d.year : d.month);

		const cumulativeCirclesExit = cumulativeCircles.exit()
			.call(exitSelection, syncedTransition);

		const cumulativeCirclesEnter = cumulativeCircles.enter()
			.append("circle")
			.attr("class", classPrefix + "cumulativeCircles")
			.attr("r", cumulativeCircleRadius)
			.attr("cy", d => yScaleCumulative(d.total))
			.attr("cx", d => xScale(selectedYear[0] === allYears ? d.year : d.month) + xScale.bandwidth() / 2);

		cumulativeCircles = cumulativeCirclesEnter.merge(cumulativeCircles);

		cumulativeCircles.transition(syncedTransition)
			.attr("cy", d => yScaleCumulative(d.total))
			.attr("cx", d => xScale(selectedYear[0] === allYears ? d.year : d.month) + xScale.bandwidth() / 2);

		let cumulativeRectangle = chartLayer.selectAll("." + classPrefix + "cumulativeRectangle")
			.data([true]);

		cumulativeRectangle = cumulativeRectangle.enter()
			.append("rect")
			.attr("class", classPrefix + "cumulativeRectangle")
			.style("opacity", 0)
			.attr("pointer-events", "all")
			.attr("x", 0)
			.attr("y", yScaleCumulative.range()[1])
			.attr("height", yScaleCumulative.range()[0] - yScaleCumulative.range()[1])
			.merge(cumulativeRectangle)
			.attr("width", xScale.range()[1])
			.raise();

		let cumulativeLegend = svg.selectAll("." + classPrefix + "cumulativeLegend")
			.data(selectedYear.length > 1 ? colorScale.domain().filter(e => yearsArray.includes(e)).reverse() : []);

		const cumulativeLegendExit = cumulativeLegend.exit()
			.call(exitSelection, syncedTransition);

		const cumulativeLegendEnter = cumulativeLegend.enter()
			.append("text")
			.attr("class", classPrefix + "cumulativeLegend")
			.attr("y", yScaleCumulative(0) + cumulativeLegendPadding)
			.attr("x", (_, i) => svgPaddings[3] + xScale.paddingOuter() * xScale.step() + cumulativeLegendCircleRadius + cumulativeLegendCirclePadding + i * cumulativeLegendSize)
			.text(d => d);

		cumulativeLegend = cumulativeLegendEnter.merge(cumulativeLegend);

		cumulativeLegend.transition(syncedTransition)
			.attr("x", (_, i) => svgPaddings[3] + xScale.paddingOuter() * xScale.step() + cumulativeLegendCircleRadius + cumulativeLegendCirclePadding + i * cumulativeLegendSize)
			.text(d => d);

		let cumulativeLegendCircle = svg.selectAll("." + classPrefix + "cumulativeLegendCircle")
			.data(selectedYear.length > 1 ? colorScale.domain().filter(e => yearsArray.includes(e)).reverse() : []);

		const cumulativeLegendCircleExit = cumulativeLegendCircle.exit()
			.call(exitSelection, syncedTransition);

		const cumulativeLegendCircleEnter = cumulativeLegendCircle.enter()
			.append("circle")
			.attr("class", classPrefix + "cumulativeLegendCircle")
			.attr("cy", yScaleCumulative(0) + cumulativeLegendPadding)
			.attr("cx", (_, i) => svgPaddings[3] + xScale.paddingOuter() * xScale.step() + i * cumulativeLegendSize)
			.attr("r", cumulativeLegendCircleRadius)
			.style("fill", d => colorScale(d));

		cumulativeLegendCircle = cumulativeLegendCircleEnter.merge(cumulativeLegendCircle);

		cumulativeLegendCircle.transition(syncedTransition)
			.attr("cx", (_, i) => svgPaddings[3] + xScale.paddingOuter() * xScale.step() + i * cumulativeLegendSize)
			.style("fill", d => colorScale(d));

		cumulativeRectangle.on("mousemove", event => {

			chartState.currentHoveredElement = event.currentTarget;

			const xValue = xScale.invert(d3.pointer(event)[0]);

			if (xValue === previousXValue && tooltipDiv.style("display") === "block") return;

			previousXValue = xValue;

			const thisData = dataCumulative.reduce((acc, curr) => {
				const thisValue = curr.values.find(e => (selectedYear[0] === allYears ? e.year : e.month) === xValue);
				if (thisValue) {
					const thisValueCopied = JSON.parse(JSON.stringify(thisValue));
					thisValueCopied.year = curr.year;
					acc.push(thisValueCopied);
				};
				return acc;
			}, []);

			thisData.sort((a, b) => b.total - a.total);

			if (!thisData.length) {
				d3.select(event.currentTarget).dispatch("mouseout");
				return;
			};

			const tooltipText = xValue === yearsArray[0] || xValue === monthsArray[0] ? "Allocations in " :
				"Total allocations up to ";

			cumulativeVerticalRect.style("opacity", 1)
				.attr("x", xScale(xValue) - (xScale.step() - xScale.bandwidth()) / 2)
				.attr("width", xScale.step());

			if (cumulativeLabels.size()) {
				cumulativeLabels.style("opacity", e => (selectedYear[0] === allYears ? e.year : e.month) === xValue ? 1 : fadeOpacity);
			};

			let highlightCircles = chartArea.selectAll("." + classPrefix + "highlightCircles")
				.data(thisData);

			const highlightCirclesExit = highlightCircles.exit()
				.remove();

			const highlightCirclesEnter = highlightCircles.enter()
				.append("circle")
				.attr("class", classPrefix + "highlightCircles")
				.attr("r", cumulativeHighlightCircleRadius)
				.style("fill", "none")
				.style("stroke-width", "1px")
				.attr("pointer-events", "none")
				.style("stroke", d => colorScale(d.year))
				.attr("cx", xScale(xValue) + xScale.bandwidth() / 2)
				.attr("cy", d => yScaleCumulative(d.total));

			highlightCircles = highlightCirclesEnter.merge(highlightCircles);

			highlightCircles.attr("cx", xScale(xValue) + xScale.bandwidth() / 2)
				.attr("cy", d => yScaleCumulative(d.total))
				.style("stroke", d => colorScale(d.year));

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(tooltipText + (selectedYear[0] === allYears ? xValue : monthFormatFull(monthAbbrvParse(xValue))));

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			thisData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("span")
					.style("color", colorScale(row.year))
					.html("&#9679;&nbsp;");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(selectedYear[0] === allYears ? "Total" : row.year);

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row.total));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = event.currentTarget.getBoundingClientRect();
			const lineSize = cumulativeVerticalRect.node().getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisOffsetLeft = tooltipSize.width > containerSize.right - lineSize.right - tooltipPaddingCumulative ?
				lineSize.left - containerSize.left - lineSize.width - tooltipSize.width - tooltipPaddingCumulative :
				lineSize.left - containerSize.left + lineSize.width + tooltipPaddingCumulative;

			tooltipDiv.style("left", thisOffsetLeft + "px")
				.style("top", Math.max((thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top, 0) + "px");


		}).on("mouseout", () => {
			if (chartState.isSnapshotTooltipVisible) return;
			chartState.currentHoveredElement = null;

			cumulativeVerticalRect.style("opacity", 0);
			chartArea.selectAll("." + classPrefix + "highlightCircles")
				.remove();
			if (cumulativeLabels.size()) cumulativeLabels.style("opacity", 1);

			tooltipDiv.style("display", "none")
				.html(null);
		});

		//arrows and listeners CERF

		let leftArrowGroup = svg.selectAll("." + classPrefix + "leftArrowGroup")
			.data(selectedYear[0] === allYears ? [true] : []);

		const leftArrowGroupExit = leftArrowGroup.exit()
			.call(exitSelection, syncedTransition);

		const leftArrowGroupEnter = leftArrowGroup.enter()
			.append("g")
			.attr("class", classPrefix + "leftArrowGroup")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (svgPaddings[3] - arrowPaddingLeft) + "," + (svgHeight * (1 - cumulativeChartHeightPercentage) - arrowCircleRadius / 2) + ")");

		const leftArrowCircle = leftArrowGroupEnter.append("circle")
			.style("fill", d3.color(colors[fundType]).darker(0.6))
			.attr("r", arrowCircleRadius);

		const leftArrowChevron = leftArrowGroupEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u2039");

		leftArrowGroup = leftArrowGroupEnter.merge(leftArrowGroup);

		leftArrowGroup.transition(syncedTransition)
			.style("opacity", 1);

		let rightArrowGroup = svg.selectAll("." + classPrefix + "rightArrowGroup")
			.data(selectedYear[0] === allYears ? [true] : []);

		const rightArrowGroupExit = rightArrowGroup.exit()
			.call(exitSelection, syncedTransition);

		const rightArrowGroupEnter = rightArrowGroup.enter()
			.append("g")
			.attr("class", classPrefix + "rightArrowGroup")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (svgWidth - svgPaddings[1] + arrowPaddingLeft) + "," + (svgHeight * (1 - cumulativeChartHeightPercentage) - arrowCircleRadius / 2) + ")");

		const rightArrowCircle = rightArrowGroupEnter.append("circle")
			.style("fill", d3.color(colors[fundType]).darker(0.6))
			.attr("r", arrowCircleRadius);

		const rightArrowChevron = rightArrowGroupEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u203a");

		rightArrowGroup = rightArrowGroupEnter.merge(rightArrowGroup);

		rightArrowGroup.transition(syncedTransition)
			.style("opacity", 1);

		if (selectedYear[0] === allYears) {
			chartArea.transition()
				.duration(duration)
				.attr("transform", "translate(" +
					(-(xScale.range()[1] - maxNumberOfBars * tickStep)) +
					",0)")
				.on("end", checkCurrentTranslate);
		};

		leftArrowGroup.on("click", () => {
			const currentTranslate = parseTransform(chartArea.attr("transform"))[0];
			chartArea.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.min(0, (currentTranslate + tickMove * tickStep)) + ",0)")
				.on("end", checkArrows);
		});

		rightArrowGroup.on("click", () => {
			const currentTranslate = parseTransform(chartArea.attr("transform"))[0];
			chartArea.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.max(-(xScale.range()[1] - maxNumberOfBars * tickStep),
					(-(Math.abs(currentTranslate) + tickMove * tickStep))) + ",0)")
				.on("end", checkArrows);
		});

		function checkArrows() {
			const currentTranslate = parseTransform(chartArea.attr("transform"))[0];

			if (currentTranslate === 0) {
				leftArrowGroup.select("circle").style("fill", arrowFadeColor);
				leftArrowGroup.attr("pointer-events", "none");
			} else {
				leftArrowGroup.select("circle").style("fill", d3.color(colors[fundType]).darker(0.6));
				leftArrowGroup.attr("pointer-events", "all");
			};

			if (~~Math.abs(currentTranslate) >= ~~(xScale.range()[1] - maxNumberOfBars * tickStep)) {
				rightArrowGroup.select("circle").style("fill", arrowFadeColor);
				rightArrowGroup.attr("pointer-events", "none");
			} else {
				rightArrowGroup.select("circle").style("fill", d3.color(colors[fundType]).darker(0.6));
				rightArrowGroup.attr("pointer-events", "all");
			};
		};

		function checkCurrentTranslate() {
			const currentTranslate = parseTransform(chartArea.attr("transform"))[0];
			if (currentTranslate === 0) {
				leftArrowGroup.select("circle").style("fill", arrowFadeColor);
				leftArrowGroup.attr("pointer-events", "none");
			};
			if (~~Math.abs(currentTranslate) >= ~~(xScale.range()[1] - maxNumberOfBars * tickStep)) {
				rightArrowGroup.select("circle").style("fill", arrowFadeColor);
				rightArrowGroup.attr("pointer-events", "none");
			};
		};

		//end of drawChart
	};

	function createColumnTopValues(originalData) {

		let totalAllocations = 0;

		const numberOfCountries = originalData.length;

		originalData.forEach(row => {
			totalAllocations += row[`total${separator}total`];
		});

		const updateTransition = d3.transition()
			.duration(duration);

		selections.byMonthAllocationsValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalAllocations);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byMonthCountriesValue.transition(updateTransition)
			.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfCountries));

		selections.byCerfCbpfDonorsText.html(numberOfCountries > 1 ? "Donors" : "Donor");

		//end of createColumnTopValues
	};

	function createColumnChart(data) {

		const columnData = data.reduce((acc, curr) => {
			const foundRegion = acc.find(e => e.region === curr.region);
			if (foundRegion) {
				foundRegion.total += curr[`total${separator}total`];
			} else {
				acc.push({
					region: curr.region,
					total: curr[`total${separator}total`]
				});
			};
			return acc;
		}, []);
		columnData.sort((a, b) => b.total - a.total);
		columnData.forEach(row => row.clicked = chartState.selectedRegion.indexOf(row.region) > -1);

		const filteredData = columnData.filter(d => d.total);

		yScaleColumn.domain(filteredData.map(e => e.region))
			.range([svgColumnPadding[0],
				Math.min(svgColumnChartHeight - svgColumnPadding[2], maxColumnRectHeight * 2 * (filteredData.length + 1))
			]);

		svgColumnChart.attr("height", yScaleColumn.range()[1] + svgColumnPadding[2]);

		xScaleColumn.domain([0, d3.max(filteredData, e => e.total)]);

		const stackedData = stack(filteredData);

		let barsGroupsColumn = svgColumnChart.selectAll("." + classPrefix + "barsGroupsColumn")
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
			.attr("x", svgColumnPadding[3])
			.style("opacity", 0)
			.remove();

		const barsColumnEnter = barsColumn.enter()
			.append("rect")
			.attr("class", classPrefix + "barsColumn")
			.attr("height", yScaleColumn.bandwidth())
			.attr("width", 0)
			.style("fill", (d, i, n) => {
				const thisKey = d3.select(n[i].parentNode).datum().key;
				return colors[thisKey];
			})
			.attr("x", xScaleColumn(0))
			.attr("y", d => yScaleColumn(d.data.region))

		barsColumn = barsColumnEnter.merge(barsColumn);

		barsColumn.transition()
			.duration(duration)
			.attr("height", yScaleColumn.bandwidth())
			.attr("y", d => yScaleColumn(d.data.region))
			.attr("x", d => d[0] === d[1] ? xScaleColumn(0) : xScaleColumn(d[0]))
			.attr("width", d => xScaleColumn(d[1]) - xScaleColumn(d[0]));

		let labelsColumn = svgColumnChart.selectAll("." + classPrefix + "labelsColumn")
			.data(filteredData, d => d.region);

		const labelsColumnExit = labelsColumn.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.attr("x", svgColumnPadding[3] + labelsColumnPadding)
			.remove();

		const labelsColumnEnter = labelsColumn.enter()
			.append("text")
			.attr("class", classPrefix + "labelsColumn")
			.style("opacity", 0)
			.attr("x", svgColumnPadding[3] + labelsColumnPadding)
			.attr("y", d => yScaleColumn(d.region) + yScaleColumn.bandwidth() / 2);

		labelsColumn = labelsColumnEnter.merge(labelsColumn);

		labelsColumn.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => xScaleColumn(d.total) + labelsColumnPadding)
			.attr("y", d => yScaleColumn(d.region) + yScaleColumn.bandwidth() / 2)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.total);
				return t => formatSIFloat(interpolator(t)).replace("G", "B");
			});

		let barsColumnTooltipRectangles = svgColumnChart.selectAll("." + classPrefix + "barsColumnTooltipRectangles")
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
			.attr("height", yScaleColumn.step())
			.attr("y", d => yScaleColumn(d.region) - yScaleColumn.bandwidth() / 2);

		barsColumnTooltipRectangles = barsColumnTooltipRectanglesEnter.merge(barsColumnTooltipRectangles);

		barsColumnTooltipRectangles.transition()
			.duration(duration)
			.attr("y", d => yScaleColumn(d.region) - yScaleColumn.bandwidth() / 2);

		// barsColumnTooltipRectangles.on("mouseover", mouseoverBarsColumnTooltipRectangles)
		// 	.on("mouseout", mouseoutBarsColumnTooltipRectangles)
		// 	.on("click", clickBarsColumnTooltipRectangles);

		function highlightBars() {
			barsColumn.style("fill", (e, i, n) => {
				const thisKey = d3.select(n[i].parentNode).datum().key;
				return chartState.selectedRegion.indexOf(e.data.region) > -1 ? d3.color(colors[thisKey]).darker(0.5) : colors[thisKey];
			});

			yAxisGroupColumn.selectAll(".tick text")
				.classed(classPrefix + "darkTick", e => chartState.selectedRegion.indexOf(e) > -1);
		};

		xAxisColumn.tickSizeInner(-(yScaleColumn.range()[1] - yScaleColumn.range()[0]));

		xAxisGroupColumn.transition()
			.duration(duration)
			.call(xAxisColumn);

		xAxisGroupColumn.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		yAxisGroupColumn.transition()
			.duration(duration)
			.call(customAxis);

		function customAxis(group) {
			const sel = group.selection ? group.selection() : group;
			group.call(yAxisColumn);
			sel.selectAll(".tick text")
				.filter(d => d.indexOf(" ") > -1)
				.text(d => d.split(" ")[0] === "South-Eastern" ? "South-East." : d.split(" ")[0] === "Horn" ? "Horn of" : d.split(" ")[0])
				.attr("x", -(yAxisColumn.tickPadding() + yAxisColumn.tickSize()))
				.attr("dy", "-0.3em")
				.append("tspan")
				.attr("dy", "1.1em")
				.attr("x", -(yAxisColumn.tickPadding() + yAxisColumn.tickSize()))
				.text(d => d.split(" ")[1] === "of" ? "Africa" : d.split(" ")[1]);
			if (sel !== group) group.selectAll(".tick text")
				.filter(d => d.indexOf(" ") > -1)
				.attrTween("x", null)
				.tween("text", null);
		};

		//end of createColumnChart
	};

	function filterData(originalData) {

		//data columns: ['ApprovedDate', 'PooledFundName', 'FundType', 'Budget']

		const data = [];

		originalData.forEach(row => {

			if (selectedYear.indexOf(allYears) > -1 && (+row.ApprovedDate.split("-")[1]) <= currentYear) {

				const foundYear = data.find(e => e.year === (+row.ApprovedDate.split("-")[1]));

				if (foundYear) {
					pushCbpfOrCerfAllocation(foundYear, row);
					foundYear.yearValues.push(row);
				} else {
					const yearObject = {
						year: (+row.ApprovedDate.split("-")[1]),
						[`total${separator}total`]: 0,
						[`total${separator}cerf`]: 0,
						[`total${separator}cbpf`]: 0,
						yearValues: [row]
					};
					pushCbpfOrCerfAllocation(yearObject, row);
					data.push(yearObject);
				};

			} else {
				if (selectedYear.indexOf(+row.ApprovedDate.split("-")[1]) > -1) {

					const foundMonth = data.find(e => e.month === monthFormat(dateParse(row.ApprovedDate)));

					if (foundMonth) {
						pushCbpfOrCerfAllocation(foundMonth, row);
						foundMonth.monthValues.push(row);
					} else {
						const monthObject = {
							month: monthFormat(dateParse(row.ApprovedDate)),
							[`total${separator}total`]: 0,
							[`total${separator}cerf`]: 0,
							[`total${separator}cbpf`]: 0,
							monthValues: []
						};
						pushCbpfOrCerfAllocation(monthObject, row);
						monthObject.monthValues.push(row);
						data.push(monthObject);
					};
				};
			};

		});

		data.sort((a, b) => selectedYear.indexOf(allYears) > -1 ?
			a.year - b.year :
			monthAbbrvParse(a.month) - monthAbbrvParse(b.month));

		return data;

	};

	function filterDataColumn(originalData) {

		const data = [];

		originalData.forEach(row => {
			if (selectedYear.indexOf(allYears) > -1 && (+row.ApprovedDate.split("-")[1]) <= currentYear) {

				const foundFund = data.find(e => e.fundId === row.PooledFundName);

				if (foundFund) {
					pushCbpfOrCerfAllocation(foundFund, row);
				} else {
					const fundObject = {
						fund: lists.fundNamesList[row.PooledFundName],
						fundId: row.PooledFundName,
						region: lists.fundRegionsList[row.PooledFundName],
						[`total${separator}total`]: 0,
						[`total${separator}cerf`]: 0,
						[`total${separator}cbpf`]: 0,
					};
					pushCbpfOrCerfAllocation(fundObject, row);
					data.push(fundObject);
				};
			} else {
				if (selectedYear.indexOf((+row.ApprovedDate.split("-")[1])) > -1) {

					const foundFund = data.find(e => e.fundId === row.PooledFundName);

					if (foundFund) {
						pushCbpfOrCerfAllocation(foundFund, row);
					} else {
						const fundObject = {
							fund: lists.fundNamesList[row.PooledFundName],
							fundId: row.PooledFundName,
							region: lists.fundRegionsList[row.PooledFundName],
							[`total${separator}total`]: 0,
							[`total${separator}cerf`]: 0,
							[`total${separator}cbpf`]: 0,
						};
						pushCbpfOrCerfAllocation(fundObject, row);
						data.push(fundObject);
					};
				};

			};
		});

		return data;

	};

	function pushCbpfOrCerfAllocation(obj, row) {
		if (row.FundType === cerfId) {
			obj[`total${separator}cerf`] += row.Budget;
		} else {
			obj[`total${separator}cbpf`] += row.Budget;
		};
		obj[`total${separator}total`] += row.Budget;
	};

	return draw;

	//end of createAllocationsByMonth
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	const result = d3.formatPrefix("." + digits + "~", value)(value);
	if (parseInt(result) === 1000) {
		const lastDigit = result[result.length - 1];
		const units = { k: "M", M: "B" };
		return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
	};
	return result;
};

function formatSIFloat1Digit(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length >= 1 ? 1 : 0;
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

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function pathTween(newPath, precision, self) {
	return function() {
		var path0 = self,
			path1 = path0.cloneNode(),
			n0 = path0.getTotalLength(),
			n1 = (path1.setAttribute("d", newPath), path1).getTotalLength();

		var distances = [0],
			i = 0,
			dt = precision / Math.max(n0, n1);
		while ((i += dt) < 1) distances.push(i);
		distances.push(1);

		var points = distances.map(function(t) {
			var p0 = path0.getPointAtLength(t * n0),
				p1 = path1.getPointAtLength(t * n1);
			return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
		});

		return function(t) {
			return t < 1 ? "M" + points.map(function(p) {
				return p(t);
			}).join("L") : newPath;
		};
	};
};

function parseTransform(translate) {
	const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
	group.setAttributeNS(null, "transform", translate);
	const matrix = group.transform.baseVal.consolidate().matrix;
	return [matrix.e, matrix.f];
};

function exitSelection(selection, transition) {
	selection.transition(transition)
		.style("opacity", 0)
		.remove();
};

export { createAllocationsByMonth };