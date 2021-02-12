//|Contributions By Cerf/Cbpf module

import {
	chartState
} from "./chartstate.js";

import {
	donorsFlagsData
} from "./donorsflagsdata.js";

import {
	createLinks
} from "./links.js";

//|constants
const classPrefix = "pfbicc",
	currentDate = new Date(),
	barChartRankingPercentage = 0.32,
	currentYear = currentDate.getFullYear(),
	localVariable = d3.local(),
	allYears = "all",
	svgPaddingsCerf = [38, 16, 80, 50],
	svgPaddingsCbpf = [38, 16, 80, 50],
	svgColumnPadding = [16, 26, 8, 80],
	svgBarChartPaddings = [14, 14, 36, 46],
	barWidth = 24,
	tooltipMargin = 4,
	innerTooltipDivWidth = 220,
	maxBarChartDonorNumber = 45,
	svgColumnChartWidth = 195,
	maxColumnRectHeight = 16,
	svgColumnChartHeight = 380,
	labelsColumnPadding = 2,
	maxYearNumber = 4,
	flagSize = 16,
	flagPadding = 2,
	duration = 1000,
	labelMargin = 22,
	labelPadding = 8,
	labelPaddingInner = 4,
	titlePadding = 6,
	precision = 6,
	topDonors = 10,
	tooltipPadding = 12,
	legendPadding = 36,
	legendRectSize = 16,
	legendTextPadding = 4,
	xGroupExtraPadding = 18,
	lineOpacity = 0.75,
	fadeOpacity = 0.1,
	legendPledgedPadding = 160,
	memberStateString = "Member State",
	privateIsoCode = "xprv",
	formatMoney0Decimals = d3.format(",.0f"),
	formatPercent = d3.format("%"),
	monthFormat = d3.timeFormat("%b"),
	monthFormatFull = d3.timeFormat("%B"),
	monthAbbrvParse = d3.timeParse("%b"),
	monthParse = d3.timeParse("%m"),
	pledgeDateParse = d3.timeParse("%m-%Y"),
	formatSIaxes = d3.format("~s"),
	monthsArray = d3.range(1, 13, 1).map(d => monthFormat(monthParse(d))),
	separator = "##",
	stackKeys = ["cerf", "cbpf"],
	valueTypes = ["pledged", "paid", "total"],
	barAxisTextObj = {
		"Private": "P",
		"Regional Local Authority": "RLA",
		"Regional/ Local Authorities": "RLA",
		"Regional/Local Authorities": "RLA",
		"Private Contributions through UNF": "UNF",
		"Observer": "OB"
	};

//|variables
let selectedYear,
	selectedValue,
	yearsArray;

function createContributionsByCerfCbpf(selections, colors, lists) {

	d3.select("#pfbihpPlayButton")
		.property("disabled", false);

	selectedYear = lists.queryStringValues.has("contributionYear") ? lists.queryStringValues.get("contributionYear").split("|").map(e => +e) :
		lists.queryStringValues.has("year") ? [+lists.queryStringValues.get("year")] : [allYears];
	selectedValue = lists.queryStringValues.has("value") ? lists.queryStringValues.get("value") : "total";

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	const breadcrumbDiv = outerDiv.append("div")
		.attr("class", classPrefix + "breadcrumbDiv");

	const breadcrumbDivInner = breadcrumbDiv.append("div")
		.attr("class", classPrefix + "breadcrumbDivInner");

	const firstBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", classPrefix + "firstBreadcrumb");

	firstBreadcrumb.append("span")
		.html("contributions");

	const middleBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", classPrefix + "middleBreadcrumb");

	const secondBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", classPrefix + "secondBreadcrumb");

	secondBreadcrumb.append("span")
		.html("by CERF/CBPF");

	const topButtonsDiv = breadcrumbDiv.append("div")
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

	const paidPledgedButtonsDiv = topDiv.append("div")
		.attr("class", classPrefix + "paidPledgedButtonsDiv");

	const chartAreaDiv = containerDiv.append("div")
		.attr("class", classPrefix + "chartAreaDiv")
		.style("height", formatPercent(1 - barChartRankingPercentage));

	const barChartRankingDivOuter = containerDiv.append("div")
		.attr("class", classPrefix + "barChartRankingDivOuter")
		.style("height", formatPercent(barChartRankingPercentage));

	const barChartRankingDivTitle = barChartRankingDivOuter.append("div")
		.attr("class", classPrefix + "barChartRankingDivTitle");

	const barChartRankingDivTitleText = barChartRankingDivTitle.append("div")
		.attr("class", classPrefix + "barChartRankingDivTitleText");

	const barChartRankingDiv = barChartRankingDivOuter.append("div")
		.attr("class", classPrefix + "barChartRankingDiv");

	const cerfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cerfContainerDiv");

	const cbpfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cbpfContainerDiv");

	chartState.currentTooltip = tooltipDiv;

	const cerfContainerDivSize = cerfContainerDiv.node().getBoundingClientRect();
	const cbpfContainerDivSize = cbpfContainerDiv.node().getBoundingClientRect();
	const barChartContainerSize = barChartRankingDiv.node().getBoundingClientRect();

	const svgWidthCerf = cerfContainerDivSize.width;
	const svgWidthCbpf = cbpfContainerDivSize.width;
	const svgHeightCerf = cerfContainerDivSize.height;
	const svgHeightCbpf = cbpfContainerDivSize.height;
	const svgBarChartWidth = barChartContainerSize.width;
	const svgBarChartHeight = barChartContainerSize.height;

	const svgCerf = cerfContainerDiv.append("svg")
		.attr("width", svgWidthCerf)
		.attr("height", svgHeightCerf);

	const svgCbpf = cbpfContainerDiv.append("svg")
		.attr("width", svgWidthCbpf)
		.attr("height", svgHeightCbpf);

	const svgBarChart = barChartRankingDiv.append("svg")
		.attr("width", svgBarChartWidth)
		.attr("height", svgBarChartHeight);

	const columnChartContainer = selections.byCerfCbpfChartContainer;

	columnChartContainer.html(null);

	const svgColumnChart = columnChartContainer.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	yearsArray = d3.range(lists.yearsArrayContributions[0], currentYear + 1, 1);

	const divergingColor = d3.scaleLinear()
		.domain([maxYearNumber - 1, 0])
		.range([-0.5, 0.4]);

	const xScaleCerf = d3.scaleBand()
		.range([svgPaddingsCerf[3], svgWidthCerf - svgPaddingsCerf[1]])
		.paddingOuter(0.1);

	const xScaleCerfInner = d3.scaleBand()
		.paddingInner(0.35)
		.paddingOuter(0.2);

	const xScaleCbpf = d3.scaleBand()
		.range([svgPaddingsCbpf[3], svgWidthCbpf - svgPaddingsCbpf[1]])
		.paddingOuter(0.1);

	const xScaleCbpfInner = d3.scaleBand()
		.paddingInner(0.35)
		.paddingOuter(0.2);

	const yScaleCerf = d3.scaleLinear()
		.range([svgHeightCerf - svgPaddingsCerf[2], svgPaddingsCerf[0] + labelMargin]);

	const yScaleCbpf = d3.scaleLinear()
		.range([svgHeightCbpf - svgPaddingsCbpf[2], svgPaddingsCbpf[0] + labelMargin]);

	const xScaleColumn = d3.scaleLinear()
		.range([svgColumnPadding[3], svgColumnChartWidth - svgColumnPadding[1]]);

	const yScaleColumn = d3.scaleBand()
		.range([svgColumnPadding[0], svgColumnChartHeight - svgColumnPadding[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const xScaleBarChart = d3.scaleBand()
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScaleBarChart = d3.scaleLinear()
		.range([svgBarChartHeight - svgBarChartPaddings[2], svgBarChartPaddings[0]]);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const lineGeneratorCerf = d3.line()
		.y(d => yScaleCerf(d[`${selectedValue}${separator}cerf`]))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCerf(d.year) : xScaleCerf(d.month)) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGroupGeneratorCerf = d3.line()
		.y(d => yScaleCerf(d[selectedValue]))
		.x(d => xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGeneratorCbpf = d3.line()
		.y(d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCbpf(d.year) : xScaleCbpf(d.month)) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGroupGeneratorCbpf = d3.line()
		.y(d => yScaleCbpf(d[selectedValue]))
		.x(d => xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGeneratorBaseCerf = d3.line()
		.y(() => yScaleCerf(0))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCerf(d.year) : xScaleCerf(d.month)) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGroupGeneratorBaseCerf = d3.line()
		.y(d => yScaleCerf(0))
		.x(d => xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGeneratorBaseCbpf = d3.line()
		.y(() => yScaleCbpf(0))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCbpf(d.year) : xScaleCbpf(d.month)) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGroupGeneratorBaseCbpf = d3.line()
		.y(d => yScaleCbpf(0))
		.x(d => xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const xAxisCerf = d3.axisBottom(xScaleCerf)
		.tickSizeOuter(0);

	const xAxisCbpf = d3.axisBottom(xScaleCbpf)
		.tickSizeOuter(0);

	const xAxisGroupedCerf = d3.axisBottom(xScaleCerfInner)
		.tickFormat(d => d % 100 < 10 ? "0" + d % 100 : d % 100)
		.tickSizeInner(3)
		.tickSizeOuter(0);

	const xAxisGroupedCbpf = d3.axisBottom(xScaleCbpfInner)
		.tickFormat(d => d % 100 < 10 ? "0" + d % 100 : d % 100)
		.tickSizeInner(3)
		.tickSizeOuter(0);

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

	const xAxisBarChart = d3.axisBottom(xScaleBarChart)
		.tickSize(3);

	const yAxisBarChart = d3.axisLeft(yScaleBarChart)
		.tickSizeOuter(0)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const xAxisGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "xAxisGroupCerf")
		.attr("transform", "translate(0," + (svgHeightCerf - svgPaddingsCerf[2]) + ")");

	const xAxisGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "xAxisGroupCbpf")
		.attr("transform", "translate(0," + (svgHeightCbpf - svgPaddingsCbpf[2]) + ")");

	const yAxisGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "yAxisGroupCerf")
		.attr("transform", "translate(" + svgPaddingsCerf[3] + ",0)");

	const yAxisGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "yAxisGroupCbpf")
		.attr("transform", "translate(" + svgPaddingsCbpf[3] + ",0)");

	const xAxisColumn = d3.axisTop(xScaleColumn)
		.tickSizeOuter(0)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumn = d3.axisLeft(yScaleColumn)
		.tickPadding(flagSize + 2 * flagPadding)
		.tickSize(3);

	const xAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "xAxisGroupColumn")
		.attr("transform", "translate(0," + svgColumnPadding[0] + ")");

	const yAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "yAxisGroupColumn")
		.attr("transform", "translate(" + svgColumnPadding[3] + ",0)");

	const xAxisGroupBarChart = svgBarChart.append("g")
		.attr("class", classPrefix + "xAxisGroupBarChart")
		.attr("transform", "translate(0," + (svgBarChartHeight - svgBarChartPaddings[2]) + ")");

	const yAxisGroupBarChart = svgBarChart.append("g")
		.attr("class", classPrefix + "yAxisGroupBarChart")
		.attr("transform", "translate(" + svgBarChartPaddings[3] + ",0)");

	const chartLayerCerf = svgCerf.append("g");
	const chartLayerCbpf = svgCbpf.append("g");
	const tooltipRectLayerCerf = svgCerf.append("g");
	const tooltipRectLayerCbpf = svgCbpf.append("g");

	const defsCerf = svgCerf.append("defs")

	const patternCerf = defsCerf.append("pattern")
		.attr("id", classPrefix + "patternCerf")
		.attr("width", 10)
		.attr("height", 6)
		.attr("patternUnits", "userSpaceOnUse")
		.attr("patternTransform", "rotate(-45 0 0)")
		.append("line")
		.attr("x1", 0)
		.attr("y1", 2)
		.attr("x2", 10)
		.attr("y2", 2)
		.attr("stroke-width", 2)
		.attr("stroke", colors.cerf);

	const defsCbpf = svgCbpf.append("defs")

	const patternCbpf = defsCbpf.append("pattern")
		.attr("id", classPrefix + "patternCbpf")
		.attr("width", 10)
		.attr("height", 6)
		.attr("patternUnits", "userSpaceOnUse")
		.attr("patternTransform", "rotate(-45 0 0)")
		.append("line")
		.attr("x1", 0)
		.attr("y1", 2)
		.attr("x2", 10)
		.attr("y2", 2)
		.attr("stroke-width", 2)
		.attr("stroke", colors.cbpf);

	createYearButtons(yearButtonsDiv);

	createPaidPledgedButtons(paidPledgedButtonsDiv);

	function draw(originalData) {

		let data = filterData(originalData);
		let columnData = filterDataColumn(originalData);

		drawCerf(data);
		drawCbpf(data);
		drawBarChartRanking(columnData);
		createColumnTopValues(columnData);
		createColumnChart(columnData);

		const yearButtons = yearButtonsDiv.selectAll("button");

		const valueButtons = paidPledgedButtonsDiv.selectAll("button");

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

			drawCerf(data);
			drawCbpf(data);
			drawBarChartRanking(columnData);
			createColumnTopValues(columnData);
			createColumnChart(columnData);

			yearButtons.classed("active", d => selectedYear.indexOf(d) > -1);
			selections.yearDropdown.select("#pfbihpdisabledOption")
				.html(selectedYear.length > 1 ? "Multiple years" : selectedYear[0] === allYears ? "All" : selectedYear[0]);

			selections.yearDropdown.dispatch("change");

			if (selectedYear[0] !== allYears) {
				const yearValues = selectedYear.join("|");
				if (lists.queryStringValues.has("contributionYear")) {
					lists.queryStringValues.set("contributionYear", yearValues);
				} else {
					lists.queryStringValues.append("contributionYear", yearValues);
				};
			} else {
				lists.queryStringValues.delete("contributionYear");
			};
			const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
			window.history.replaceState(null, "", newURL);

		};

		valueButtons.on("click", (event, d) => {
			selectedValue = d;
			valueButtons.classed("active", e => e === selectedValue);
			drawCerf(data);
			drawCbpf(data);
			drawBarChartRanking(columnData);
			createColumnTopValues(columnData);
			createColumnChart(columnData);

			if (selectedValue !== "total") {
				if (lists.queryStringValues.has("value")) {
					lists.queryStringValues.set("value", selectedValue);
				} else {
					lists.queryStringValues.append("value", selectedValue);
				};
			} else {
				lists.queryStringValues.delete("value");
			};
			const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
			window.history.replaceState(null, "", newURL);
		});

		//end of draw
	};

	function createYearButtons(container) {

		const yearsData = yearsArray.concat([allYears]).reverse();

		const yearsButtons = container.selectAll(null)
			.data(yearsData)
			.enter()
			.append("button")
			.classed("active", d => selectedYear.indexOf(d) > -1)
			.html(d => d === allYears ? capitalize(allYears) : d);

	};

	function createPaidPledgedButtons(container) {

		const valuesButtons = container.selectAll(null)
			.data(valueTypes)
			.enter()
			.append("button")
			.classed("active", d => selectedValue === d)
			.html(d => capitalize(d));

	};

	function drawCerf(data) {

		const xValue = selectedYear[0] === allYears ? "year" : "month";

		const dataYear = selectedYear[0] === allYears ? data : [];

		const dataMonth = selectedYear[0] === allYears ? [] : data;

		if (dataMonth.length) {
			dataMonth.forEach(row => {
				const monthlyData = row.monthValues.reduce((acc, curr) => {
					if (curr.PooledFundId === lists.cerfPooledFundId) {
						const foundYear = acc.find(e => e.year === +curr.PledgePaidDate.split("-")[1]);
						if (foundYear) {
							foundYear.total += curr.PaidAmt + curr.PledgeAmt;
							foundYear.paid += curr.PaidAmt;
							foundYear.pledged += curr.PledgeAmt;
						} else {
							acc.push({
								year: +curr.PledgePaidDate.split("-")[1],
								total: curr.PaidAmt + curr.PledgeAmt,
								paid: curr.PaidAmt,
								pledged: curr.PledgeAmt
							});
						};
					};
					return acc;
				}, []);
				monthlyData.sort((a, b) => b.year - a.year);
				row.cerfMonthlyData = monthlyData;
			});
		};

		const minxScaleValue = d3.max(data, d => d[`total${separator}cerf`]) || 1e3;

		const minxScaleInnerValue = d3.max(dataMonth, d => d3.max(d.cerfMonthlyData, e => e.total)) || 1e3;

		xScaleCerf.domain(selectedYear[0] === allYears ? yearsArray : monthsArray);

		xScaleCerf.paddingInner(selectedYear[0] === allYears ? 0.5 : 0.2);

		yScaleCerf.domain([0, (selectedYear[0] === allYears ?
			d3.max(data, d => d[`${selectedValue}${separator}cerf`]) || minxScaleValue :
			d3.max(dataMonth, d => d3.max(d.cerfMonthlyData, e => e[selectedValue])) || minxScaleInnerValue)]);

		xScaleCerfInner.domain(selectedYear[0] === allYears ? [] : selectedYear.slice().sort((a, b) => a - b))
			.range([0, xScaleCerf.bandwidth()]);

		let chartTitleCerf = svgCerf.selectAll("." + classPrefix + "chartTitleCerf")
			.data([true]);

		const chartTitleEnterCerf = chartTitleCerf.enter()
			.append("text")
			.attr("class", classPrefix + "chartTitleCerf")
			.attr("x", svgPaddingsCerf[3] + (svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]) / 2)
			.attr("y", svgPaddingsCerf[0] - titlePadding)
			.text("CERF ")
			.append("tspan")
			.attr("class", classPrefix + "chartTitleSpanCerf")
			.text("(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		chartTitleCerf = chartTitleEnterCerf.merge(chartTitleCerf);

		chartTitleCerf.select("tspan")
			.text("(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		let barsCerf = chartLayerCerf.selectAll("." + classPrefix + "barsCerf")
			.data(dataYear, d => d.year);

		const barsCerfExit = barsCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsCerfEnter = barsCerf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsCerf")
			.attr("x", d => xScaleCerf(d.year))
			.attr("width", xScaleCerf.bandwidth())
			.attr("y", d => yScaleCerf(0))
			.attr("height", 0)
			.style("fill", d => selectedYear[0] === allYears && d.year === currentYear ? `url(#${classPrefix}patternCerf)` : colors.cerf)
			.attr("stroke", d => selectedYear[0] === allYears && d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => selectedYear[0] === allYears && d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsCerf = barsCerfEnter.merge(barsCerf);

		barsCerf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCerf(d[`${selectedValue}${separator}cerf`]))
			.attr("height", d => svgHeightCerf - svgPaddingsCerf[2] - yScaleCerf(d[`${selectedValue}${separator}cerf`]));

		let labelsCerf = chartLayerCerf.selectAll("." + classPrefix + "labelsCerf")
			.data(dataYear.filter(e => e[`${selectedValue}${separator}cerf`]), d => d.year);

		const labelsCerfExit = labelsCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.style("opacity", 0)
			.remove();

		const labelsCerfEnter = labelsCerf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsCerf")
			.attr("x", d => xScaleCerf(d.year) + xScaleCerf.bandwidth() / 2)
			.attr("y", d => d[`pledged${separator}cerf`] && selectedValue === "total" ? yScaleCerf(0) - (2 * labelPadding) : yScaleCerf(0) - labelPadding);

		labelsCerf = labelsCerfEnter.merge(labelsCerf);

		labelsCerf.transition()
			.duration(duration)
			.attr("y", d => d[`pledged${separator}cerf`] && selectedValue === "total" ? yScaleCerf(d[`total${separator}cerf`]) - (2 * labelPadding) : yScaleCerf(d[`${selectedValue}${separator}cerf`]) - labelPadding)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[`${selectedValue}${separator}cerf`]);
				return !d[`pledged${separator}cerf`] || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCerf(d.year) + xScaleCerf.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d[`pledged${separator}cerf`])(d[`pledged${separator}cerf`]) + ")");
			});

		let groupCerf = chartLayerCerf.selectAll("." + classPrefix + "groupCerf")
			.data(dataMonth, d => d.month);

		const groupExitCerf = groupCerf.exit()
			.remove();

		const groupEnterCerf = groupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "groupCerf")
			.attr("transform", d => "translate(" + xScaleCerf(d.month) + ",0)");

		groupCerf = groupEnterCerf.merge(groupCerf);

		groupCerf.attr("transform", d => "translate(" + xScaleCerf(d.month) + ",0)");

		let barsGroupCerf = groupCerf.selectAll("." + classPrefix + "barsGroupCerf")
			.data(d => d.cerfMonthlyData, d => d.year);

		const barsGroupExitCerf = barsGroupCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsGroupEnterCerf = barsGroupCerf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsGroupCerf")
			.attr("x", d => xScaleCerfInner(d.year))
			.attr("width", xScaleCerfInner.bandwidth())
			.attr("y", d => yScaleCerf(0))
			.attr("height", 0)
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}patternCerf)` : colors.cerf)
			.attr("stroke", d => d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsGroupCerf = barsGroupEnterCerf.merge(barsGroupCerf);

		barsGroupCerf.transition()
			.duration(duration)
			.style("opacity", 1)
			.style("fill", (d, i, n) => d.year === currentYear ? `url(#${classPrefix}patternCerf)` :
				n.length > 1 ? d3.color(colors.cerf).darker(divergingColor(i)) : colors.cerf)
			.attr("x", d => xScaleCerfInner(d.year))
			.attr("width", xScaleCerfInner.bandwidth())
			.attr("y", d => yScaleCerf(d[selectedValue]))
			.attr("height", d => svgHeightCerf - svgPaddingsCerf[2] - yScaleCerf(d[selectedValue]));

		let lineGroupCerf = groupCerf.selectAll("." + classPrefix + "lineGroupCerf")
			.data(d => d.cerfMonthlyData.filter(e => e.year !== currentYear).length > 1 ? [d.cerfMonthlyData.filter(e => e.year !== currentYear)] : []);

		const lineGroupCerfExit = lineGroupCerf.exit()
			.remove();

		const lineGroupCerfEnter = lineGroupCerf.enter()
			.append("path")
			.attr("class", classPrefix + "lineGroupCerf")
			.style("fill", "none")
			.style("stroke-width", "2px")
			.style("opacity", lineOpacity)
			.style("stroke", "#aaa")
			.attr("d", lineGroupGeneratorBaseCerf);

		lineGroupCerf = lineGroupCerfEnter.merge(lineGroupCerf);

		lineGroupCerf.raise();

		lineGroupCerf.transition()
			.duration(duration)
			.style("opacity", d => d.some(e => e[selectedValue]) ? lineOpacity : 0)
			.attrTween("d", (d, i, n) => pathTween(lineGroupGeneratorCerf(d), precision, n[i])());

		let labelsGroupCerf = groupCerf.selectAll("." + classPrefix + "labelsGroupCerf")
			.data(d => d.cerfMonthlyData.filter(e => e[selectedValue]), d => d.year);

		const labelsGroupCerfExit = labelsGroupCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.style("opacity", 0)
			.remove();

		const labelsGroupCerfEnter = labelsGroupCerf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsGroupCerf")
			.attr("x", d => xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCerf(0) - (3 * labelPaddingInner) : yScaleCerf(0) - labelPaddingInner);

		labelsGroupCerf = labelsGroupCerfEnter.merge(labelsGroupCerf);

		labelsGroupCerf.transition()
			.duration(duration)
			.attr("x", d => xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCerf(d[selectedValue]) - (3 * labelPaddingInner) : yScaleCerf(d[selectedValue]) - labelPaddingInner)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[selectedValue]);
				return !d.pledged || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d.pledged)(d.pledged) + ")");
			});

		let xAxisGroupedGroupCerf = groupCerf.selectAll("." + classPrefix + "xAxisGroupedGroupCerf")
			.data([true]);

		xAxisGroupedGroupCerf = xAxisGroupedGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "xAxisGroupedGroupCerf")
			.attr("transform", "translate(0," + (svgHeightCerf - svgPaddingsCerf[2]) + ")")
			.merge(xAxisGroupedGroupCerf)
			.style("opacity", selectedYear.length > 1 ? 1 : 0);

		xAxisGroupedGroupCerf.transition()
			.duration(duration)
			.call(xAxisGroupedCerf);

		let tooltipRectCerf = tooltipRectLayerCerf.selectAll("." + classPrefix + "tooltipRectCerf")
			.data(selectedYear[0] === allYears ? dataYear : dataMonth, d => selectedYear[0] === allYears ? d.year : d.month);

		const tooltipRectCerfExit = tooltipRectCerf.exit()
			.remove();

		const tooltipRectCerfEnter = tooltipRectCerf.enter()
			.append("rect")
			.style("opacity", 0)
			.attr("pointer-events", "all")
			.attr("class", classPrefix + "tooltipRectCerf")
			.attr("x", d => xScaleCerf(d[xValue]))
			.attr("y", svgPaddingsCerf[0])
			.attr("width", xScaleCerf.bandwidth())
			.attr("height", svgHeightCerf - svgPaddingsCerf[0] - svgPaddingsCerf[2]);

		tooltipRectCerf = tooltipRectCerfEnter.merge(tooltipRectCerf);

		tooltipRectCerf.attr("x", d => xScaleCerf(d[xValue]))
			.attr("width", xScaleCerf.bandwidth());

		tooltipRectCerf.on("mouseover", mouseoverTooltipCerf)
			.on("mouseout", mouseoutTooltipCerf);

		function mouseoverTooltipCerf(event, d) {

			chartState.currentHoveredElement = event.currentTarget;

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(selectedYear[0] === allYears ? d.year : monthFormatFull(monthAbbrvParse(d.month)));

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			const tooltipData = selectedYear[0] === allYears ?
				[{
					year: d.year,
					total: d[`total${separator}cerf`],
					paid: d[`paid${separator}cerf`],
					pledged: d[`pledged${separator}cerf`]
				}] : d.cerfMonthlyData;

			tooltipData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(selectedYear[0] === allYears ? capitalize(selectedValue) : row.year);

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row[selectedValue]));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = this.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisoffsetLeft = (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
				tooltipPadding : (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) > containerSize.width ?
				containerSize.width - tooltipSize.width - tooltipPadding : (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) - containerSize.left;

			tooltipDiv.style("left", thisoffsetLeft + "px")
				.style("top", (thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top + "px");

		};

		function mouseoutTooltipCerf() {
			if (chartState.isSnapshotTooltipVisible) return;
			chartState.currentHoveredElement = null;

			tooltipDiv.html(null)
				.style("display", "none");
		};

		xAxisCerf.tickSizeInner(selectedYear.length === 1 ? 6 : 0);

		xAxisGroupCerf.transition()
			.duration(duration)
			.attr("transform", "translate(0," + (selectedYear.length === 1 ?
				svgHeightCerf - svgPaddingsCerf[2] : svgHeightCerf - svgPaddingsCerf[2] + xGroupExtraPadding) + ")")
			.call(xAxisCerf);

		yAxisGroupCerf.transition()
			.duration(duration)
			.call(yAxisCerf);

		yAxisGroupCerf.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		let legendGroupCerf = svgCerf.selectAll("." + classPrefix + "legendGroupCerf")
			.data(selectedYear[0] === allYears || selectedYear.indexOf(currentYear) > -1 ? [true] : []);

		const legendGroupExitCerf = legendGroupCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendGroupEnterCerf = legendGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroupCerf")
			.attr("transform", "translate(" + (svgPaddingsCerf[3] + xScaleCerf.paddingOuter() * xScaleCerf.step()) + "," + (svgHeightCerf - legendPadding) + ")")
			.style("opacity", 0);

		legendGroupEnterCerf.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", "url(#" + classPrefix + "patternCerf)");

		legendGroupEnterCerf.append("text")
			.attr("x", legendRectSize + legendTextPadding)
			.attr("y", legendRectSize / 2)
			.text("Current year");

		legendGroupCerf = legendGroupEnterCerf.merge(legendGroupCerf);

		legendGroupCerf.transition()
			.duration(duration)
			.style("opacity", 1);

		let legendPledgedCerf = svgCerf.selectAll("." + classPrefix + "legendPledgedCerf")
			.data(dataYear.some(e => e[`pledged${separator}cerf`]) || dataMonth.some(e => e[`pledged${separator}cerf`]) ? [true] : []);

		const legendPledgedExitCerf = legendPledgedCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendPledgedEnterCerf = legendPledgedCerf.enter()
			.append("text")
			.attr("class", classPrefix + "legendPledgedCerf")
			.style("opacity", 0)
			.attr("x", legendGroupCerf.size() ? legendPledgedPadding : svgPaddingsCerf[3] + xScaleCerf.paddingOuter() * xScaleCerf.step())
			.attr("y", svgHeightCerf - legendPadding + legendRectSize / 2)
			.classed(classPrefix + "pledgedValue", true)
			.text("(*)");

		legendPledgedEnterCerf.append("tspan")
			.style("fill", "#777")
			.text(": Pledged Values");

		legendPledgedCerf = legendPledgedEnterCerf.merge(legendPledgedCerf);

		legendPledgedCerf.transition()
			.duration(duration)
			.attr("x", legendGroupCerf.size() ? legendPledgedPadding : svgPaddingsCerf[3] + xScaleCerf.paddingOuter() * xScaleCerf.step())
			.style("opacity", 1);

		//end of drawCerf
	};

	function drawCbpf(data) {

		const xValue = selectedYear[0] === allYears ? "year" : "month";

		const dataYear = selectedYear[0] === allYears ? data : [];

		const dataMonth = selectedYear[0] === allYears ? [] : data;

		if (dataMonth.length) {
			dataMonth.forEach(row => {
				const monthlyData = row.monthValues.reduce((acc, curr) => {
					if (curr.PooledFundId !== lists.cerfPooledFundId) {
						const foundYear = acc.find(e => e.year === +curr.PledgePaidDate.split("-")[1]);
						if (foundYear) {
							foundYear.total += curr.PaidAmt + curr.PledgeAmt;
							foundYear.paid += curr.PaidAmt;
							foundYear.pledged += curr.PledgeAmt;
						} else {
							acc.push({
								year: +curr.PledgePaidDate.split("-")[1],
								total: curr.PaidAmt + curr.PledgeAmt,
								paid: curr.PaidAmt,
								pledged: curr.PledgeAmt
							});
						};
					};
					return acc;
				}, []);
				monthlyData.sort((a, b) => b.year - a.year);
				row.cbpfMonthlyData = monthlyData;
			});
		};

		const minxScaleValue = d3.max(data, d => d[`total${separator}cbpf`]) || 1e3;

		const minxScaleInnerValue = d3.max(dataMonth, d => d3.max(d.cbpfMonthlyData, e => e.total)) || 1e3;

		xScaleCbpf.domain(selectedYear[0] === allYears ? yearsArray : monthsArray);

		xScaleCbpf.paddingInner(selectedYear[0] === allYears ? 0.5 : 0.2);

		yScaleCbpf.domain([0, (selectedYear[0] === allYears ?
			d3.max(data, d => d[`${selectedValue}${separator}cbpf`]) || minxScaleValue :
			d3.max(dataMonth, d => d3.max(d.cbpfMonthlyData, e => e[selectedValue])) || minxScaleInnerValue)]);

		xScaleCbpfInner.domain(selectedYear[0] === allYears ? [] : selectedYear.slice().sort((a, b) => a - b))
			.range([0, xScaleCbpf.bandwidth()]);

		let chartTitleCbpf = svgCbpf.selectAll("." + classPrefix + "chartTitleCbpf")
			.data([true]);

		const chartTitleEnterCbpf = chartTitleCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "chartTitleCbpf")
			.attr("x", svgPaddingsCbpf[3] + (svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]) / 2)
			.attr("y", svgPaddingsCbpf[0] - titlePadding)
			.text("CBPF ")
			.append("tspan")
			.attr("class", classPrefix + "chartTitleSpanCbpf")
			.text("(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		chartTitleCbpf = chartTitleEnterCbpf.merge(chartTitleCbpf);

		chartTitleCbpf.select("tspan")
			.text("(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		let barsCbpf = chartLayerCbpf.selectAll("." + classPrefix + "barsCbpf")
			.data(dataYear, d => d.year);

		const barsCbpfExit = barsCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsCbpfEnter = barsCbpf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsCbpf")
			.attr("x", d => xScaleCbpf(d.year))
			.attr("width", xScaleCbpf.bandwidth())
			.attr("y", d => yScaleCbpf(0))
			.attr("height", 0)
			.style("fill", d => selectedYear[0] === allYears && d.year === currentYear ? `url(#${classPrefix}patternCbpf)` : colors.cbpf)
			.attr("stroke", d => selectedYear[0] === allYears && d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => selectedYear[0] === allYears && d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsCbpf = barsCbpfEnter.merge(barsCbpf);

		barsCbpf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]))
			.attr("height", d => svgHeightCbpf - svgPaddingsCbpf[2] - yScaleCbpf(d[`${selectedValue}${separator}cbpf`]));

		let labelsCbpf = chartLayerCbpf.selectAll("." + classPrefix + "labelsCbpf")
			.data(dataYear.filter(e => e[`${selectedValue}${separator}cbpf`]), d => d.year);

		const labelsCbpfExit = labelsCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.style("opacity", 0)
			.remove();

		const labelsCbpfEnter = labelsCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsCbpf")
			.attr("x", d => xScaleCbpf(d.year) + xScaleCbpf.bandwidth() / 2)
			.attr("y", d => d[`pledged${separator}cbpf`] && selectedValue === "total" ? yScaleCbpf(0) - (2 * labelPadding) : yScaleCbpf(0) - labelPadding);

		labelsCbpf = labelsCbpfEnter.merge(labelsCbpf);

		labelsCbpf.transition()
			.duration(duration)
			.attr("y", d => d[`pledged${separator}cbpf`] && selectedValue === "total" ? yScaleCbpf(d[`total${separator}cbpf`]) - (2 * labelPadding) : yScaleCbpf(d[`${selectedValue}${separator}cbpf`]) - labelPadding)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[`${selectedValue}${separator}cbpf`]);
				return !d[`pledged${separator}cbpf`] || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCbpf(d.year) + xScaleCbpf.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d[`pledged${separator}cbpf`])(d[`pledged${separator}cbpf`]) + ")");
			});

		let groupCbpf = chartLayerCbpf.selectAll("." + classPrefix + "groupCbpf")
			.data(dataMonth, d => d.month);

		const groupExitCbpf = groupCbpf.exit()
			.remove();

		const groupEnterCbpf = groupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "groupCbpf")
			.attr("transform", d => "translate(" + xScaleCbpf(d.month) + ",0)");

		groupCbpf = groupEnterCbpf.merge(groupCbpf);

		groupCbpf.attr("transform", d => "translate(" + xScaleCbpf(d.month) + ",0)");

		let barsGroupCbpf = groupCbpf.selectAll("." + classPrefix + "barsGroupCbpf")
			.data(d => d.cbpfMonthlyData, d => d.year);

		const barsGroupExitCbpf = barsGroupCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsGroupEnterCbpf = barsGroupCbpf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsGroupCbpf")
			.attr("x", d => xScaleCbpfInner(d.year))
			.attr("width", xScaleCbpfInner.bandwidth())
			.attr("y", d => yScaleCbpf(0))
			.attr("height", 0)
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}patternCbpf)` : colors.cbpf)
			.attr("stroke", d => d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsGroupCbpf = barsGroupEnterCbpf.merge(barsGroupCbpf);

		barsGroupCbpf.transition()
			.duration(duration)
			.style("opacity", 1)
			.style("fill", (d, i, n) => d.year === currentYear ? `url(#${classPrefix}patternCbpf)` :
				n.length > 1 ? d3.color(colors.cbpf).darker(divergingColor(i)) : colors.cbpf)
			.attr("x", d => xScaleCbpfInner(d.year))
			.attr("width", xScaleCbpfInner.bandwidth())
			.attr("y", d => yScaleCbpf(d[selectedValue]))
			.attr("height", d => svgHeightCbpf - svgPaddingsCbpf[2] - yScaleCbpf(d[selectedValue]));

		let lineGroupCbpf = groupCbpf.selectAll("." + classPrefix + "lineGroupCbpf")
			.data(d => d.cbpfMonthlyData.filter(e => e.year !== currentYear).length > 1 ? [d.cbpfMonthlyData.filter(e => e.year !== currentYear)] : []);

		const lineGroupCbpfExit = lineGroupCbpf.exit()
			.remove();

		const lineGroupCbpfEnter = lineGroupCbpf.enter()
			.append("path")
			.attr("class", classPrefix + "lineGroupCbpf")
			.style("fill", "none")
			.style("stroke-width", "2px")
			.style("opacity", lineOpacity)
			.style("stroke", "#aaa")
			.attr("d", lineGroupGeneratorBaseCbpf);

		lineGroupCbpf = lineGroupCbpfEnter.merge(lineGroupCbpf);

		lineGroupCbpf.raise();

		lineGroupCbpf.transition()
			.duration(duration)
			.style("opacity", d => d.some(e => e[selectedValue]) ? lineOpacity : 0)
			.attrTween("d", (d, i, n) => pathTween(lineGroupGeneratorCbpf(d), precision, n[i])());

		let labelsGroupCbpf = groupCbpf.selectAll("." + classPrefix + "labelsGroupCbpf")
			.data(d => d.cbpfMonthlyData.filter(e => e[selectedValue]), d => d.year);

		const labelsGroupCbpfExit = labelsGroupCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.style("opacity", 0)
			.remove();

		const labelsGroupCbpfEnter = labelsGroupCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsGroupCbpf")
			.attr("x", d => xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCbpf(0) - (3 * labelPaddingInner) : yScaleCbpf(0) - labelPaddingInner);

		labelsGroupCbpf = labelsGroupCbpfEnter.merge(labelsGroupCbpf);

		labelsGroupCbpf.transition()
			.duration(duration)
			.attr("x", d => xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCbpf(d[selectedValue]) - (3 * labelPaddingInner) : yScaleCbpf(d[selectedValue]) - labelPaddingInner)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[selectedValue]);
				return !d.pledged || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d.pledged)(d.pledged) + ")");
			});

		let xAxisGroupedGroupCbpf = groupCbpf.selectAll("." + classPrefix + "xAxisGroupedGroupCbpf")
			.data([true]);

		xAxisGroupedGroupCbpf = xAxisGroupedGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "xAxisGroupedGroupCbpf")
			.attr("transform", "translate(0," + (svgHeightCbpf - svgPaddingsCbpf[2]) + ")")
			.merge(xAxisGroupedGroupCbpf)
			.style("opacity", selectedYear.length > 1 ? 1 : 0);

		xAxisGroupedGroupCbpf.transition()
			.duration(duration)
			.call(xAxisGroupedCbpf);

		let tooltipRectCbpf = tooltipRectLayerCbpf.selectAll("." + classPrefix + "tooltipRectCbpf")
			.data(selectedYear[0] === allYears ? dataYear : dataMonth, d => selectedYear[0] === allYears ? d.year : d.month);

		const tooltipRectCbpfExit = tooltipRectCbpf.exit()
			.remove();

		const tooltipRectCbpfEnter = tooltipRectCbpf.enter()
			.append("rect")
			.style("opacity", 0)
			.attr("pointer-events", "all")
			.attr("class", classPrefix + "tooltipRectCbpf")
			.attr("x", d => xScaleCbpf(d[xValue]))
			.attr("y", svgPaddingsCbpf[0])
			.attr("width", xScaleCbpf.bandwidth())
			.attr("height", svgHeightCbpf - svgPaddingsCbpf[0] - svgPaddingsCbpf[2]);

		tooltipRectCbpf = tooltipRectCbpfEnter.merge(tooltipRectCbpf);

		tooltipRectCbpf.attr("x", d => xScaleCbpf(d[xValue]))
			.attr("width", xScaleCbpf.bandwidth());

		tooltipRectCbpf.on("mouseover", mouseoverTooltipCbpf)
			.on("mouseout", mouseoutTooltipCbpf);

		function mouseoverTooltipCbpf(event, d) {

			chartState.currentHoveredElement = event.currentTarget;

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(selectedYear[0] === allYears ? d.year : monthFormatFull(monthAbbrvParse(d.month)));

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			const tooltipData = selectedYear[0] === allYears ?
				[{
					year: d.year,
					total: d[`total${separator}cbpf`],
					paid: d[`paid${separator}cbpf`],
					pledged: d[`pledged${separator}cbpf`]
				}] : d.cbpfMonthlyData;

			tooltipData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(selectedYear[0] === allYears ? capitalize(selectedValue) : row.year);

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row[selectedValue]));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = this.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisoffsetLeft = (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
				tooltipPadding : (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) > containerSize.width ?
				containerSize.width - tooltipSize.width - tooltipPadding : (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) - containerSize.left;

			tooltipDiv.style("left", thisoffsetLeft + "px")
				.style("top", (thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top + "px");

		};

		function mouseoutTooltipCbpf() {
			if (chartState.isSnapshotTooltipVisible) return;
			chartState.currentHoveredElement = null;

			tooltipDiv.html(null)
				.style("display", "none");
		};

		xAxisCbpf.tickSizeInner(selectedYear.length === 1 ? 6 : 0);

		xAxisGroupCbpf.transition()
			.duration(duration)
			.attr("transform", "translate(0," + (selectedYear.length === 1 ?
				svgHeightCbpf - svgPaddingsCbpf[2] : svgHeightCbpf - svgPaddingsCbpf[2] + xGroupExtraPadding) + ")")
			.call(xAxisCbpf);

		yAxisGroupCbpf.transition()
			.duration(duration)
			.call(yAxisCbpf);

		yAxisGroupCbpf.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		let legendGroupCbpf = svgCbpf.selectAll("." + classPrefix + "legendGroupCbpf")
			.data(selectedYear[0] === allYears || selectedYear.indexOf(currentYear) > -1 ? [true] : []);

		const legendGroupExitCbpf = legendGroupCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendGroupEnterCbpf = legendGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroupCbpf")
			.attr("transform", "translate(" + (svgPaddingsCbpf[3] + xScaleCbpf.paddingOuter() * xScaleCbpf.step()) + "," + (svgHeightCbpf - legendPadding) + ")")
			.style("opacity", 0);

		legendGroupEnterCbpf.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", "url(#" + classPrefix + "patternCbpf)");

		legendGroupEnterCbpf.append("text")
			.attr("x", legendRectSize + legendTextPadding)
			.attr("y", legendRectSize / 2)
			.text("Current year");

		legendGroupCbpf = legendGroupEnterCbpf.merge(legendGroupCbpf);

		legendGroupCbpf.transition()
			.duration(duration)
			.style("opacity", 1);

		let legendPledgedCbpf = svgCbpf.selectAll("." + classPrefix + "legendPledgedCbpf")
			.data(dataYear.some(e => e[`pledged${separator}cbpf`]) || dataMonth.some(e => e[`pledged${separator}cbpf`]) ? [true] : []);

		const legendPledgedExitCbpf = legendPledgedCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendPledgedEnterCbpf = legendPledgedCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "legendPledgedCbpf")
			.style("opacity", 0)
			.attr("x", legendGroupCbpf.size() ? legendPledgedPadding : svgPaddingsCbpf[3] + xScaleCbpf.paddingOuter() * xScaleCbpf.step())
			.attr("y", svgHeightCbpf - legendPadding + legendRectSize / 2)
			.classed(classPrefix + "pledgedValue", true)
			.text("(*)");

		legendPledgedEnterCbpf.append("tspan")
			.style("fill", "#777")
			.text(": Pledged Values");

		legendPledgedCbpf = legendPledgedEnterCbpf.merge(legendPledgedCbpf);

		legendPledgedCbpf.transition()
			.duration(duration)
			.attr("x", legendGroupCbpf.size() ? legendPledgedPadding : svgPaddingsCbpf[3] + xScaleCbpf.paddingOuter() * xScaleCbpf.step())
			.style("opacity", 1);

		//end of drawCbpf
	};

	function drawBarChartRanking(data) {

		data.sort((a, b) => b[`${selectedValue}${separator}total`] - a[`${selectedValue}${separator}total`]);

		const barData = data.reduce((acc, curr, index) => {
			if (index < maxBarChartDonorNumber) {
				acc.push({
					donor: curr.donor,
					isoCode: curr.isoCode.toLowerCase(),
					donorId: curr.donorId,
					cerf: curr[`${selectedValue}${separator}cerf`],
					cbpf: curr[`${selectedValue}${separator}cbpf`],
					totalValue: curr[`total${separator}cerf`] + curr[`total${separator}cbpf`]
				});
			} else if (index === maxBarChartDonorNumber) {
				acc.push({
					donor: "Others",
					isoCode: null,
					donorId: null,
					cerf: curr[`${selectedValue}${separator}cerf`],
					cbpf: curr[`${selectedValue}${separator}cbpf`],
					totalValue: curr[`total${separator}cerf`] + curr[`total${separator}cbpf`]
				});
			} else {
				acc[maxBarChartDonorNumber].cerf += curr[`${selectedValue}${separator}cerf`];
				acc[maxBarChartDonorNumber].cbpf += curr[`${selectedValue}${separator}cbpf`];
				acc[maxBarChartDonorNumber].totalValue += curr[`total${separator}cerf`] + curr[`total${separator}cbpf`];
			};
			return acc;
		}, []);

		const dynamicWidth = Math.min(svgBarChartWidth, svgBarChartPaddings[1] + svgBarChartPaddings[3] + barWidth + barData.length * barWidth);

		svgBarChart.transition()
			.duration(duration)
			.attr("width", dynamicWidth);

		xScaleBarChart.range([svgBarChartPaddings[3], dynamicWidth - svgBarChartPaddings[1]])
			.domain(barData.map(d => d.donorId));

		const minxScaleValue = d3.max(barData, d => d.totalValue);

		yScaleBarChart.domain([0, d3.max(barData, e => e.cbpf + e.cerf) || minxScaleValue]);

		let barTitle = barChartRankingDivTitleText.selectAll("." + classPrefix + "barTitle")
			.data([true]);

		barTitle = barTitle.enter()
			.append("span")
			.attr("class", classPrefix + "barTitle")
			.merge(barTitle)
			.html("Donors, " + selectedValue + " values ")
			.append("span")
			.attr("class", classPrefix + "barTitleSpan")
			.html("(" + (selectedYear[0] === allYears ? "all years" : makeList(selectedYear.slice())) + ")");

		barChartRankingDivTitleText.transition()
			.duration(duration)
			.style("margin-left", ((svgBarChartWidth - dynamicWidth) / 2) + "px");

		const stackedData = stack(barData);

		let barsGroups = svgBarChart.selectAll("." + classPrefix + "barsGroups")
			.data(stackedData, d => d.key);

		const barsGroupsExit = barsGroups.exit().remove();

		const barsGroupsEnter = barsGroups.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroups")
			.attr("pointer-events", "none");

		barsGroups = barsGroupsEnter.merge(barsGroups);

		let bars = barsGroups.selectAll("." + classPrefix + "bars")
			.data(d => d, d => d.data.donor);

		const barsExit = bars.exit()
			.transition()
			.duration(duration)
			.attr("height", 0)
			.attr("y", svgBarChartHeight - svgBarChartPaddings[3])
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("width", xScaleBarChart.bandwidth())
			.attr("height", 0)
			.style("fill", (d, i, n) => {
				const thisKey = d3.select(n[i].parentNode).datum().key;
				return colors[thisKey]
			})
			.attr("y", yScaleBarChart(0))
			.attr("x", d => xScaleBarChart(d.data.donorId))

		bars = barsEnter.merge(bars);

		bars.transition()
			.duration(duration)
			.attr("width", xScaleBarChart.bandwidth())
			.attr("x", d => xScaleBarChart(d.data.donorId))
			.attr("y", d => d[0] === d[1] ? yScaleBarChart(0) : yScaleBarChart(d[1]))
			.attr("height", d => yScaleBarChart(d[0]) - yScaleBarChart(d[1]));

		let barsLabels = svgBarChart.selectAll("." + classPrefix + "barsLabels")
			.data(barData, d => d.donorId);

		const barsLabelsExit = barsLabels.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.attr("y", svgBarChartHeight - svgBarChartPaddings[2])
			.remove();

		const barsLabelsEnter = barsLabels.enter()
			.append("text")
			.attr("class", classPrefix + "barsLabels")
			.attr("x", d => xScaleBarChart(d.donorId) + xScaleBarChart.bandwidth() / 2)
			.attr("y", svgBarChartHeight - svgBarChartPaddings[2])
			.style("opacity", 0);

		barsLabels = barsLabelsEnter.merge(barsLabels);

		barsLabels.transition()
			.duration(duration)
			.style("opacity", (_, i) => !(i % 4) ? 1 : 0)
			.attr("x", d => xScaleBarChart(d.donorId) + xScaleBarChart.bandwidth() / 2)
			.attr("y", d => yScaleBarChart(d.cerf + d.cbpf) - labelsColumnPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.cerf + d.cbpf);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let barsTooltipRectangles = svgBarChart.selectAll("." + classPrefix + "barsTooltipRectangles")
			.data(barData, d => d.donorId);

		const barsTooltipRectanglesExit = barsTooltipRectangles.exit().remove();

		const barsTooltipRectanglesEnter = barsTooltipRectangles.enter()
			.append("rect")
			.attr("class", classPrefix + "barsTooltipRectangles")
			.attr("pointer-events", "all")
			.style("opacity", 0)
			.attr("y", svgBarChartPaddings[0])
			.attr("height", svgBarChartHeight - svgBarChartPaddings[0] - svgBarChartPaddings[2])
			.attr("width", xScaleBarChart.step())
			.attr("x", d => xScaleBarChart(d.donorId) - xScaleBarChart.bandwidth() / 2);

		barsTooltipRectangles = barsTooltipRectanglesEnter.merge(barsTooltipRectangles);

		barsTooltipRectangles.transition()
			.duration(duration)
			.attr("width", xScaleBarChart.step())
			.attr("x", d => xScaleBarChart(d.donorId) - xScaleBarChart.bandwidth() / 2)
			.each((_, i, n) => localVariable.set(n[i], i));

		barsTooltipRectangles.on("mouseover", mouseoverBarsTooltipRectangles)
			.on("mouseout", mouseoutBarsTooltipRectangles);

		xAxisGroupBarChart.transition()
			.duration(duration)
			.call(customAxisBarChart);

		function customAxisBarChart(group) {
			const sel = group.selection ? group.selection() : group;
			group.call(xAxisBarChart);
			sel.selectAll(".tick text")
				.text(d => d !== null ? (lists.donorTypesList[d] !== memberStateString ? barAxisTextObj[lists.donorTypesList[d]] : null) : "O");
			sel.selectAll(".tick")
				.filter(d => lists.donorTypesList[d] === memberStateString)
				.append("image")
				.attr("width", flagSize)
				.attr("height", flagSize)
				.attr("y", 2)
				.attr("x", -flagSize / 2)
				.attr("href", d => donorsFlagsData[lists.donorIsoCodesList[d].toLowerCase()]);
			if (sel !== group) group.selectAll(".tick text")
				.attrTween("x", null)
				.tween("text", null);
		};

		yAxisBarChart.tickSizeInner(-(xScaleBarChart.range()[1] - svgBarChartPaddings[3]));

		yAxisGroupBarChart.transition()
			.duration(duration)
			.call(yAxisBarChart);

		yAxisGroupBarChart.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		function mouseoverBarsTooltipRectangles(event, d) {
			chartState.currentHoveredElement = event.currentTarget;

			bars.style("opacity", e => e.data.donor === d.donor ? 1 : fadeOpacity);
			barsLabels.style("opacity", (e, i) => e.donor === d.donor ? 1 : !(i % 4) ? fadeOpacity : 0);
			xAxisGroupBarChart.selectAll(".tick")
				.style("opacity", e => e === d.donorId ? 1 : fadeOpacity);

			const thisIndex = localVariable.get(event.currentTarget);
			const ordinal = makeOrdinal(thisIndex + 1);

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			const titleDiv = innerTooltipDiv.append("div")
				.attr("class", classPrefix + "tooltipTitleDiv")
				.style("margin-bottom", "18px");

			if (donorsFlagsData[d.isoCode] || barAxisTextObj[lists.donorTypesList[d.donorId]] === "P") {
				titleDiv.append("img")
					.attr("width", flagSize)
					.attr("height", barAxisTextObj[lists.donorTypesList[d.donorId]] === "P" ? null : flagSize)
					.style("margin-right", "4px")
					.style("margin-bottom", "2px")
					.attr("src", barAxisTextObj[lists.donorTypesList[d.donorId]] === "P" ? donorsFlagsData[privateIsoCode] : donorsFlagsData[d.isoCode])
			};

			titleDiv.append("strong")
				.style("font-size", "16px")
				.html(d.donor)
				.append("span")
				.attr("class", classPrefix + "tooltipRank")
				.html(` (rank: ${thisIndex + 1}<sup>${ordinal}</sup>)`);

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			stackKeys.forEach(key => {

				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("margin-bottom", "4px")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipKeys")
					.html(key.toUpperCase());

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(d[key]));
			});

			if (lists.donorTypesList[d.donorId] !== memberStateString) {
				innerTooltipDiv.append("div")
					.attr("class", classPrefix + "tooltipFooter")
					.html("(" + lists.donorTypesList[d.donorId] + ")");
			};

			const thisBox = event.currentTarget.getBoundingClientRect();

			const containerBox = containerDiv.node().getBoundingClientRect();

			const tooltipBox = tooltipDiv.node().getBoundingClientRect();

			const thisOffsetTop = (thisBox.top + thisBox.height / 2 - tooltipBox.height / 2) - containerBox.top;

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + tooltipMargin ?
				thisBox.left - containerBox.left + thisBox.width + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltipDiv.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");
		};

		function mouseoutBarsTooltipRectangles() {
			if (chartState.isSnapshotTooltipVisible) return;
			chartState.currentHoveredElement = null;

			bars.style("opacity", 1);
			barsLabels.style("opacity", (_, i) => !(i % 4) ? 1 : 0);
			xAxisGroupBarChart.selectAll(".tick")
				.style("opacity", 1);

			tooltipDiv.style("display", "none")
				.html(null);
		};

		//end of drawBarChartRanking
	};

	function createColumnTopValues(originalData) {

		let totalContributions = 0,
			totalPaid = 0,
			totalPledged = 0;

		const numberOfDonors = originalData.length;

		originalData.forEach(row => {
			totalContributions += row[`total${separator}total`];
			totalPaid += row[`paid${separator}total`];
			totalPledged += row[`pledged${separator}total`];
		});

		const updateTransition = d3.transition()
			.duration(duration);

		selections.byCerfCbpfContributionsValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalContributions);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byCerfCbpfPaidValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalPaid);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byCerfCbpfPledgedValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalPledged);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byCerfCbpfDonorsValue.transition(updateTransition)
			.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfDonors));

		selections.byCerfCbpfDonorsText.html(numberOfDonors > 1 ? "Donors" : "Donor");

		//end of createColumnTopValues
	};

	function createColumnChart(data) {

		data.sort((a, b) => b[`${selectedValue}${separator}total`] - a[`${selectedValue}${separator}total`]);

		const columnData = data.reduce((acc, curr, index) => {
			if (index < topDonors) {
				acc.push({
					donor: curr.donor,
					isoCode: curr.isoCode.toLowerCase(),
					cerf: curr[`${selectedValue}${separator}cerf`],
					cbpf: curr[`${selectedValue}${separator}cbpf`],
					totalValue: curr[`total${separator}cerf`] + curr[`total${separator}cbpf`]
				});
			} else if (index === topDonors) {
				acc.push({
					donor: "Others",
					cerf: curr[`${selectedValue}${separator}cerf`],
					cbpf: curr[`${selectedValue}${separator}cbpf`],
					totalValue: curr[`total${separator}cerf`] + curr[`total${separator}cbpf`]
				});
			} else {
				acc[topDonors].cerf += curr[`${selectedValue}${separator}cerf`];
				acc[topDonors].cbpf += curr[`${selectedValue}${separator}cbpf`];
				acc[topDonors].totalValue += curr[`total${separator}cerf`] + curr[`total${separator}cbpf`];
			};
			return acc;
		}, []);

		yScaleColumn.domain(columnData.map(e => e.donor))
			.range([svgColumnPadding[0],
				Math.min(svgColumnChartHeight - svgColumnPadding[2], maxColumnRectHeight * 2 * (columnData.length + 1))
			]);

		const minxScaleValue = d3.max(columnData, d => d.totalValue);

		xScaleColumn.domain([0, d3.max(columnData, e => e.cbpf + e.cerf) || minxScaleValue]);

		const stackedData = stack(columnData);

		let barsGroupsColumn = svgColumnChart.selectAll("." + classPrefix + "barsGroupsColumn")
			.data(stackedData, d => d.key);

		const barsGroupsColumnExit = barsGroupsColumn.exit().remove();

		const barsGroupsColumnEnter = barsGroupsColumn.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroupsColumn")
			.attr("pointer-events", "none");

		barsGroupsColumn = barsGroupsColumnEnter.merge(barsGroupsColumn);

		let barsColumn = barsGroupsColumn.selectAll("." + classPrefix + "barsColumn")
			.data(d => d, d => d.data.donor);

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
				return colors[thisKey]
			})
			.attr("x", xScaleColumn(0))
			.attr("y", d => yScaleColumn(d.data.donor))

		barsColumn = barsColumnEnter.merge(barsColumn);

		barsColumn.transition()
			.duration(duration)
			.attr("height", yScaleColumn.bandwidth())
			.attr("y", d => yScaleColumn(d.data.donor))
			.attr("x", d => d[0] === d[1] ? xScaleColumn(0) : xScaleColumn(d[0]))
			.attr("width", d => xScaleColumn(d[1]) - xScaleColumn(d[0]));

		let labelsColumn = svgColumnChart.selectAll("." + classPrefix + "labelsColumn")
			.data(columnData, d => d.donor);

		const labelsColumnExit = labelsColumn.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const labelsColumnEnter = labelsColumn.enter()
			.append("text")
			.attr("class", classPrefix + "labelsColumn")
			.style("opacity", 0)
			.attr("x", svgColumnPadding[3] + labelsColumnPadding)
			.attr("y", d => yScaleColumn(d.donor) + yScaleColumn.bandwidth() / 2);

		labelsColumn = labelsColumnEnter.merge(labelsColumn);

		labelsColumn.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => xScaleColumn(d.cerf + d.cbpf) + labelsColumnPadding)
			.attr("y", d => yScaleColumn(d.donor) + yScaleColumn.bandwidth() / 2)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.cerf + d.cbpf);
				return t => formatSIFloat(interpolator(t)).replace("G", "B");
			});

		let flagsColumn = svgColumnChart.selectAll("." + classPrefix + "flagsColumn")
			.data(columnData.slice(0, topDonors), d => d.donor);

		const flagsColumnExit = flagsColumn.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const flagsColumnEnter = flagsColumn.enter()
			.append("image")
			.attr("class", classPrefix + "flagsColumn")
			.style("opacity", 0)
			.attr("x", svgColumnPadding[3] - flagPadding - flagSize - yAxisColumn.tickSize())
			.attr("y", d => yScaleColumn(d.donor))
			.attr("width", flagSize)
			.attr("height", flagSize)
			.attr("href", d => donorsFlagsData[d.isoCode]);

		flagsColumn = flagsColumnEnter.merge(flagsColumn);

		flagsColumn.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleColumn(d.donor));

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
				.text(d => d.split(" ")[0])
				.attr("x", -(yAxisColumn.tickPadding() + yAxisColumn.tickSize()))
				.attr("dy", "-0.3em")
				.append("tspan")
				.attr("dy", "1.1em")
				.attr("x", -(yAxisColumn.tickPadding() + yAxisColumn.tickSize()))
				.text(d => d.split(" ")[1]);
			sel.selectAll(".tick text")
				.filter(d => d === "Others")
				.attr("dx", flagSize + flagPadding);
			if (sel !== group) group.selectAll(".tick text")
				.filter(d => d.indexOf(" ") > -1)
				.attrTween("x", null)
				.tween("text", null);
		};


		//end of createColumnChart
	};

	function filterData(originalData) {

		const data = [];

		originalData.forEach(row => {

			if (selectedYear.indexOf(allYears) > -1 && row.FiscalYear <= currentYear) {

				const foundYear = data.find(e => e.year === row.FiscalYear);

				if (foundYear) {
					pushCbpfOrCerfContribution(foundYear, row);
					foundYear.yearValues.push(row);
				} else {
					const yearObject = {
						year: row.FiscalYear,
						[`total${separator}total`]: 0,
						[`total${separator}cerf`]: 0,
						[`total${separator}cbpf`]: 0,
						[`paid${separator}total`]: 0,
						[`paid${separator}cerf`]: 0,
						[`paid${separator}cbpf`]: 0,
						[`pledged${separator}total`]: 0,
						[`pledged${separator}cerf`]: 0,
						[`pledged${separator}cbpf`]: 0,
						yearValues: [row]
					};
					pushCbpfOrCerfContribution(yearObject, row);
					data.push(yearObject);
				};

			} else {
				if (selectedYear.indexOf(+row.PledgePaidDate.split("-")[1]) > -1) {

					const foundMonth = data.find(e => e.month === monthFormat(pledgeDateParse(row.PledgePaidDate)));

					if (foundMonth) {
						pushCbpfOrCerfContribution(foundMonth, row);
						foundMonth.monthValues.push(row);
					} else {
						const monthObject = {
							month: monthFormat(pledgeDateParse(row.PledgePaidDate)),
							[`total${separator}total`]: 0,
							[`total${separator}cerf`]: 0,
							[`total${separator}cbpf`]: 0,
							[`paid${separator}total`]: 0,
							[`paid${separator}cerf`]: 0,
							[`paid${separator}cbpf`]: 0,
							[`pledged${separator}total`]: 0,
							[`pledged${separator}cerf`]: 0,
							[`pledged${separator}cbpf`]: 0,
							monthValues: []
						};
						pushCbpfOrCerfContribution(monthObject, row);
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
			if (selectedYear.indexOf(allYears) > -1 && row.FiscalYear <= currentYear) {

				const foundDonor = data.find(e => e.donorId === row.DonorId);

				if (foundDonor) {
					pushCbpfOrCerfContribution(foundDonor, row);
				} else {
					const donorObject = {
						donor: lists.donorNamesList[row.DonorId],
						donorId: row.DonorId,
						isoCode: lists.donorIsoCodesList[row.DonorId],
						[`total${separator}total`]: 0,
						[`total${separator}cerf`]: 0,
						[`total${separator}cbpf`]: 0,
						[`paid${separator}total`]: 0,
						[`paid${separator}cerf`]: 0,
						[`paid${separator}cbpf`]: 0,
						[`pledged${separator}total`]: 0,
						[`pledged${separator}cerf`]: 0,
						[`pledged${separator}cbpf`]: 0
					};
					pushCbpfOrCerfContribution(donorObject, row);
					data.push(donorObject);
				};
			} else {
				if (selectedYear.indexOf(row.FiscalYear) > -1) {

					const foundDonor = data.find(e => e.donorId === row.DonorId);

					if (foundDonor) {
						pushCbpfOrCerfContribution(foundDonor, row);
					} else {
						const donorObject = {
							donor: lists.donorNamesList[row.DonorId],
							donorId: row.DonorId,
							isoCode: lists.donorIsoCodesList[row.DonorId],
							[`total${separator}total`]: 0,
							[`total${separator}cerf`]: 0,
							[`total${separator}cbpf`]: 0,
							[`paid${separator}total`]: 0,
							[`paid${separator}cerf`]: 0,
							[`paid${separator}cbpf`]: 0,
							[`pledged${separator}total`]: 0,
							[`pledged${separator}cerf`]: 0,
							[`pledged${separator}cbpf`]: 0
						};
						pushCbpfOrCerfContribution(donorObject, row);
						data.push(donorObject);
					};
				};

			};
		});

		return data;

	};

	function pushCbpfOrCerfContribution(obj, row) {
		if (row.PooledFundId === lists.cerfPooledFundId) {
			obj[`total${separator}cerf`] += row.PaidAmt + row.PledgeAmt;
			obj[`paid${separator}cerf`] += row.PaidAmt;
			obj[`pledged${separator}cerf`] += row.PledgeAmt;
		} else {
			obj[`total${separator}cbpf`] += row.PaidAmt + row.PledgeAmt;
			obj[`paid${separator}cbpf`] += row.PaidAmt;
			obj[`pledged${separator}cbpf`] += row.PledgeAmt;
		};
		obj[`total${separator}total`] += row.PaidAmt + row.PledgeAmt;
		obj[`paid${separator}total`] += row.PaidAmt;
		obj[`pledged${separator}total`] += row.PledgeAmt;
	};

	return draw;

	//end of createContributionsByCerfCbpf
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

function makeList(arr) {
	return arr.sort((a, b) => a - b)
		.reduce((acc, curr, index) => acc + (index >= arr.length - 2 ? index > arr.length - 2 ? curr : curr + " and " : curr + ", "), "");
};

function makeOrdinal(value) {
	return value % 10 === 1 && value !== 11 ?
		"st" : value % 10 === 2 && value !== 12 ?
		"nd" : value % 10 === 3 && value !== 13 ?
		"rd" : "th";
};

export {
	createContributionsByCerfCbpf
};