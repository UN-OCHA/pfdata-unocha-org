import { chartState } from "./chartstate.js";
import { clustersIconsData } from "./clustersiconsdata.js";
import { positionTooltip } from "./positiontooltip.js";

//|constants
const padding = [40, 60, 20, 196],
	axisPadding = 16,
	tooltipVerticalPadding = 6,
	tooltipHorizontalPadding = 6,
	classPrefix = "pfbicpbysector",
	thisTab = "Allocations by Sector",
	formatPercent = d3.format(".0%"),
	formatSIaxes = d3.format("~s"),
	formatMoney0Decimals = d3.format(",.0f"),
	currentDate = new Date(),
	localVariable = d3.local(),
	unBlue = "#1F69B3",
	currentYear = currentDate.getFullYear(),
	innerTooltipDivWidth = 290,
	separator = "##",
	duration = 1000,
	darkerValue = 0.2,
	darkerValueText = 0.5,
	tickSize = 9,
	clusterIconSize = 24,
	clusterIconPadding = 4,
	fadeOpacityFundButton = 0.4,
	labelsPadding = 2,
	titlePadding = 10,
	stackKeys = ["total", "cerf", "cbpf"],
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"]
	}, //THIS SHOULD NOT BE HARDCODED
	barHeight = 40;

let yearsArrayCerf,
	yearsArrayCbpf,
	svgWidth,
	svgHeight,
	activeTransition = false;

function createCountryProfileBySector(container, lists, colors, tooltipDiv, fundButtons, yearsButtons) {

	const outerDiv = container.append("div")
		.attr("class", classPrefix + "outerDiv");

	const chartsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartsDiv");

	const topRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "topRowDiv");

	const chartDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "chartDiv");

	createTopFiguresDiv(topRowDiv, colors, lists);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	const chartsDivSize = chartsDiv.node().getBoundingClientRect();
	svgWidth = chartsDivSize.width;
	svgHeight = chartsDivSize.height;

	const svg = chartsDiv.append("svg")
		.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
		.style("background-color", "white");

	const xScale = d3.scaleLinear()
		.range([padding[3], chartsDivSize.width - padding[1]]);

	const yScale = d3.scaleBand()
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeOuter(0);

	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(clusterIconSize + 2 * clusterIconPadding)
		.tickFormat(d => lists.clustersList[d]);

	function draw(originalData, resetYear, firstTime) {

		if (firstTime) {
			yearsArrayCerf = createYearsArray(originalData, "cerf");
			yearsArrayCbpf = createYearsArray(originalData, "cbpf");
		};

		if (resetYear) setDefaultYear(originalData, yearsArrayCerf, yearsArrayCbpf);

		yearsButtons.classed("active", d => chartState.selectedYear === d);

		disableFunds(originalData, fundButtons);
		disableYears(originalData, yearsButtons);

		const data = processData(originalData, lists);

		const syncedTransition = d3.transition()
			.duration(duration)
			.on("start", () => activeTransition = true)
			.on("end", () => activeTransition = false);

		drawTopFigures(data.topFigures, topRowDiv, colors, syncedTransition, tooltipDiv);

		const argumentsObject = {
			data: data.stack,
			svg,
			colors,
			stack,
			xScale,
			yScale,
			xAxis,
			yAxis,
			lists,
			syncedTransition,
			container,
			tooltipDiv
		};

		drawStackedChart(argumentsObject);

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			draw(originalData, false, true);
		});

		yearsButtons.on("click", (event, d) => {
			if (activeTransition) return;
			tooltipDiv.style("display", "none");
			chartState.selectedYear = d;
			draw(originalData, false, false);
		});

		yearsButtons.on("playButtonClick", () => {
			if (chartState.selectedCountryProfileTab !== thisTab) return;
			if (activeTransition) return;
			tooltipDiv.style("display", "none");
			draw(originalData, false, false);
		});

		//end of draw
	};

	return draw;

	//end of createCountryProfileBySector
};

function drawTopFigures(data, container, colors, syncedTransition, tooltipDiv) {

	container.select(`.${classPrefix}spanYearValue`)
		.html(`in ${chartState.selectedYear}`);

	container.select(`.${classPrefix}allocationsValue`)
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

	container.select(`.${classPrefix}allocationsUnit`)
		.html(() => {
			const unit = formatSIFloat(data.total).slice(-1);
			return unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
		});

	container.select(`.${classPrefix}projectsValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolateRound(n[i].textContent || 0, data.projects.size);
			return t => n[i].textContent = interpolator(t);
		});

	container.select(`.${classPrefix}partnersValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolateRound(n[i].textContent || 0, data.partners.size);
			return t => n[i].textContent = interpolator(t);
		});

	container.select(`.${classPrefix}sectorsValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolateRound(n[i].textContent || 0, data.sectors.size);
			return t => n[i].textContent = interpolator(t);
		});

	container.select(`.${classPrefix}allocationsDiv`)
		.on("mouseover", event => mouseoverTopFigures(event, data, tooltipDiv, container, colors))
		.on("mouseout", () => mouseOut(tooltipDiv));

	//end of drawTopFigures
};

function drawStackedChart({
	data,
	svg,
	colors,
	stack,
	yScale,
	xAxis,
	yAxis,
	xScale,
	syncedTransition,
	container,
	lists,
	tooltipDiv
}) {

	const filteredData = data.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

	const maxHeight = Math.min(svgHeight, padding[0] + padding[2] + (data.length * barHeight));

	//TRANSITION HERE???
	svg.attr("viewBox", `0 0 ${svgWidth} ${maxHeight}`);

	const maxValue = d3.max(data, d => chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf);

	xScale.domain([0, maxValue]);

	yScale.domain(filteredData.map(d => d.sector))
		.range([padding[0], maxHeight - padding[2]]);

	xAxis.tickSizeInner(-(yScale.range()[1] - yScale.range()[0]));

	let title = svg.selectAll(`.${classPrefix}title`)
		.data([true]);

	title = title.enter()
		.append("text")
		.attr("class", classPrefix + "title")
		.attr("x", svgWidth / 2)
		.attr("y", padding[0] - titlePadding)
		.text("Allocations by Sector")
		.merge(title);

	let xAxisGroup = svg.selectAll(`.${classPrefix}xAxisGroup`)
		.data([true]);

	xAxisGroup = xAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}xAxisGroup`)
		.attr("transform", "translate(0," + yScale.range()[1] + ")")
		.merge(xAxisGroup)
		.transition(syncedTransition)
		.attr("transform", "translate(0," + yScale.range()[1] + ")")
		.call(xAxis)
		.on("start", (_, i, n) => {
			d3.select(n[i]).selectAll(".tick")
				.filter(e => e === 0)
				.remove();
		});

	let yAxisGroup = svg.selectAll(`.${classPrefix}yAxisGroup`)
		.data([true]);

	yAxisGroup = yAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}yAxisGroup`)
		.attr("transform", "translate(" + padding[3] + ",0)")
		.merge(yAxisGroup)
		.transition(syncedTransition)
		.attr("transform", "translate(" + padding[3] + ",0)")
		.call(customAxis);

	const stackedData = stack(filteredData);

	let barsGroups = svg.selectAll("." + classPrefix + "barsGroups")
		.data(stackedData, d => d.key);

	const barsGroupsExit = barsGroups.exit().remove();

	const barsGroupsEnter = barsGroups.enter()
		.append("g")
		.attr("class", classPrefix + "barsGroups")
		.attr("pointer-events", "none");

	barsGroups = barsGroupsEnter.merge(barsGroups);

	let bars = barsGroups.selectAll("." + classPrefix + "bars")
		.data(d => d, d => d.data.sector);

	const barsExit = bars.exit()
		.transition()
		.duration(duration)
		.attr("width", 0)
		.attr("x", padding[3])
		.style("opacity", 0)
		.remove();

	const barsEnter = bars.enter()
		.append("rect")
		.attr("class", classPrefix + "bars")
		.attr("height", yScale.bandwidth())
		.attr("width", 0)
		.style("fill", (d, i, n) => {
			const thisKey = d3.select(n[i].parentNode).datum().key;
			return colors[thisKey]
		})
		.attr("x", xScale(0))
		.attr("y", d => yScale(d.data.sector))

	bars = barsEnter.merge(bars);

	bars.transition()
		.duration(duration)
		.attr("height", yScale.bandwidth())
		.attr("y", d => yScale(d.data.sector))
		.attr("x", d => d[0] === d[1] ? xScale(0) : xScale(d[0]))
		.attr("width", d => xScale(d[1]) - xScale(d[0]));

	let labels = svg.selectAll("." + classPrefix + "labelsBySector")
		.data(filteredData, d => d.sector);

	const labelsExit = labels.exit()
		.transition()
		.duration(duration)
		.style("opacity", 0)
		.attr("x", padding[3] + labelsPadding)
		.remove();

	const labelsEnter = labels.enter()
		.append("text")
		.attr("class", classPrefix + "labelsBySector")
		.style("opacity", 0)
		.attr("x", padding[3] + labelsPadding)
		.attr("y", d => yScale(d.sector) + yScale.bandwidth() / 2);

	labels = labelsEnter.merge(labels);

	labels.transition()
		.duration(duration)
		.style("opacity", 1)
		.attr("x", d => xScale(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) + labelsPadding)
		.attr("y", d => yScale(d.sector) + yScale.bandwidth() / 2)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
			return t => formatSIFloat(interpolator(t)).replace("G", "B");
		});

	let clusterIcons = svg.selectAll("." + classPrefix + "clusterIcons")
		.data(filteredData, d => d.sector);

	const clusterIconsExit = clusterIcons.exit()
		.transition()
		.duration(duration)
		.style("opacity", 0)
		.remove();

	const clusterIconsEnter = clusterIcons.enter()
		.append("image")
		.attr("class", classPrefix + "clusterIcons")
		.style("opacity", 0)
		.attr("x", padding[3] - clusterIconPadding - clusterIconSize - yAxis.tickSize())
		.attr("y", d => yScale(d.sector) - (clusterIconSize - yScale.bandwidth()) / 2)
		.attr("width", clusterIconSize)
		.attr("height", clusterIconSize)
		.attr("href", d => clustersIconsData[d.sector]);

	clusterIcons = clusterIconsEnter.merge(clusterIcons);

	clusterIcons.transition()
		.duration(duration)
		.style("opacity", 1)
		.attr("y", d => yScale(d.sector) - (clusterIconSize - yScale.bandwidth()) / 2);

	let barsTooltipRectangles = svg.selectAll("." + classPrefix + "barsTooltipRectangles")
		.data(filteredData, d => d.sector);

	const barsTooltipRectanglesExit = barsTooltipRectangles.exit().remove();

	const barsTooltipRectanglesEnter = barsTooltipRectangles.enter()
		.append("rect")
		.attr("class", classPrefix + "barsTooltipRectangles")
		.attr("pointer-events", "all")
		.style("opacity", 0)
		.attr("x", 0)
		.attr("width", svgWidth)
		.attr("height", yScale.step())
		.attr("y", d => yScale(d.sector) - yScale.bandwidth() / 2);

	barsTooltipRectangles = barsTooltipRectanglesEnter.merge(barsTooltipRectangles);

	barsTooltipRectangles.transition()
		.duration(duration)
		.attr("y", d => yScale(d.sector) - yScale.bandwidth() / 2);

	function customAxis(group) {
		const sel = group.selection ? group.selection() : group;
		group.call(yAxis);
		sel.selectAll(".tick text")
			.filter(d => lists.clustersList[d].indexOf(" ") > -1)
			.text(d => lists.clustersList[d])
			.call(wrapTextTwoLines, padding[3] - yAxis.tickPadding() - axisPadding)
		if (sel !== group) group.selectAll(".tick text")
			.filter(d => lists.clustersList[d].indexOf(" ") > -1)
			.attrTween("x", null)
			.tween("text", null);
	};

	barsTooltipRectangles.on("mouseover", (event, d) => mouseoverBars(event, d, tooltipDiv, container, colors, lists))
		.on("mouseout", () => mouseOut(tooltipDiv));

	//end of drawStackedChart
};

function createTopFiguresDiv(container, colors, lists) {

	const allocationsDivWrapper = container.append("div")
		.attr("class", classPrefix + "allocationsDivWrapper");

	const allocationsDiv = allocationsDivWrapper.append("div")
		.attr("class", classPrefix + "allocationsDiv");

	const descriptionDiv = allocationsDiv.append("div")
		.attr("class", classPrefix + "descriptionDiv");

	descriptionDiv.append("span")
		.html(`Allocated in ${lists.fundNamesList[chartState.selectedCountryProfile]}`)
	descriptionDiv.append("span")
		.attr("class", classPrefix + "spanYearValue")
		.html(`in ${chartState.selectedYear}`);

	const allocationsValuePlusUnit = allocationsDiv.append("div")
		.attr("class", classPrefix + "valuePlusUnit");

	const allocationsValue = allocationsValuePlusUnit.append("span")
		.attr("class", classPrefix + "allocationsValue")
		.html("$0")
		.call(applyColors, colors);

	const allocationsUnit = allocationsValuePlusUnit.append("span")
		.attr("class", classPrefix + "allocationsUnit");

	const projectsAndPartnersDivWrapper = container.append("div")
		.attr("class", classPrefix + "projectsAndPartnersDivWrapper");

	const projectsAndPartnersDiv = projectsAndPartnersDivWrapper.append("div")
		.attr("class", classPrefix + "projectsAndPartnersDiv");

	const projectsDiv = projectsAndPartnersDiv.append("div")
		.attr("class", classPrefix + "projectsDiv");

	const projectsValue = projectsDiv.append("span")
		.attr("class", classPrefix + "projectsValue")
		.html("0")
		.call(applyColors, colors);

	const projectsText = projectsDiv.append("span")
		.attr("class", classPrefix + "projectsText")
		.html("Projects");

	const partnersDiv = projectsAndPartnersDiv.append("div")
		.attr("class", classPrefix + "partnersDiv");

	const partnersValue = partnersDiv.append("span")
		.attr("class", classPrefix + "partnersValue")
		.html("0")
		.call(applyColors, colors);

	const partnersText = partnersDiv.append("span")
		.attr("class", classPrefix + "partnersText")
		.html("Partners");

	const sectorsDivWrapper = container.append("div")
		.attr("class", classPrefix + "sectorsDivWrapper");

	const sectorsDiv = sectorsDivWrapper.append("div")
		.attr("class", classPrefix + "sectorsDiv");

	const sectorsValue = sectorsDiv.append("span")
		.attr("class", classPrefix + "sectorsValue")
		.html("0")
		.call(applyColors, colors);

	const sectorsText = sectorsDiv.append("span")
		.attr("class", classPrefix + "sectorsText")
		.html("Sectors");

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
		.html("$" + formatMoney0Decimals(data.total));

	positionTooltip(tooltip, container, event, "right");

};

function mouseoverBars(event, data, tooltip, container, colors, lists) {

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
		.html(lists.clustersList[data.sector]);

	const innerDiv = innerTooltipDiv.append("div");

	if (chartState.selectedFund === "cerf/cbpf") {
		["cerf", "cbpf"].sort((a, b) => data[b] - data[a])
			.filter(d => data[d])
			.forEach(fund => {
				const fundDiv = innerDiv.append("div");

				fundDiv.append("span")
					.html(`${fund.toUpperCase()} Allocations: `);

				fundDiv.append("span")
					.attr("class", classPrefix + "topFiguresAllocationsValue")
					.style("color", d3.color(colors[fund]).darker(darkerValueText))
					.html("$" + formatMoney0Decimals(data[fund]));
			});
	} else {
		innerDiv.append("span")
			.html(`${chartState.selectedFund === "total" ? "Total" : chartState.selectedFund.toUpperCase()} Allocations: `);

		innerDiv.append("span")
			.attr("class", classPrefix + "topFiguresAllocationsValue")
			.call(applyColors, colors)
			.html("$" + formatMoney0Decimals(data[chartState.selectedFund]));
	};

	positionTooltip(tooltip, container, event, "top");

};

function mouseOut(tooltip) {
	tooltip.html(null)
		.style("display", "none");
};

function setChartStateTooltip(event, tooltip) {
	chartState.currentHoveredElement = event.currentTarget;
	chartState.currentTooltip = tooltip;
};

function processData(originalData, lists) {

	const data = {
		topFigures: {
			total: 0,
			projects: new Set(),
			partners: new Set(),
			sectors: new Set()
		},
		stack: []
	};

	originalData.forEach(row => {
		if (chartState.selectedYear === row.year && +row.sector === +row.sector) {
			if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
				data.topFigures.total += row.total;
			} else {
				data.topFigures.total += row[chartState.selectedFund];
			};
			if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
				data.topFigures.sectors.add(row.sector);
				if (row.projectsCerf) row.projectsCerf.toString().split(separator).forEach(e => data.topFigures.projects.add(e));
				if (row.partnersCerf) row.partnersCerf.toString().split(separator).forEach(e => data.topFigures.partners.add(e));
				if (row.projectsCbpf) row.projectsCbpf.toString().split(separator).forEach(e => data.topFigures.projects.add(e));
				if (row.partnersCbpf) row.partnersCbpf.toString().split(separator).forEach(e => data.topFigures.partners.add(e));
			} else {
				if (row[chartState.selectedFund]) data.topFigures.sectors.add(row.sector);
				if (row[`projects${capitalize(chartState.selectedFund)}`]) row[`projects${capitalize(chartState.selectedFund)}`].toString().split(separator).forEach(e => data.topFigures.projects.add(e));
				if (row[`partners${capitalize(chartState.selectedFund)}`]) row[`partners${capitalize(chartState.selectedFund)}`].toString().split(separator).forEach(e => data.topFigures.partners.add(e));
			};
			const copiedRow = Object.assign({}, row);
			copiedRow.total = chartState.selectedFund === "total" ? copiedRow.total : 0;
			copiedRow.cerf = chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? copiedRow.cerf : 0;
			copiedRow.cbpf = chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? copiedRow.cbpf : 0;
			data.stack.push(copiedRow);
		};
	});

	data.stack.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ?
		(b.cerf + b.cbpf) - (a.cerf + a.cbpf) :
		b[chartState.selectedFund] - a[chartState.selectedFund]);

	return data;

	//end of processData
};

function setDefaultYear(originalData, yearsArrayCerf, yearsArrayCbpf) {
	const years = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? [...new Set(yearsArrayCerf.concat(yearsArrayCbpf))] :
		chartState.selectedFund === "cerf" ? yearsArrayCerf : yearsArrayCbpf;
	let index = years.length;
	const dataCerf = originalData.filter(e => e.cerf);
	const dataCbpf = originalData.filter(e => e.cbpf);
	while (--index >= 0) {
		const cerfValue = dataCerf.find(e => e.year === years[index]);
		const cbpfValue = dataCbpf.find(e => e.year === years[index]);
		if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
			if (cerfValue || cbpfValue) {
				chartState.selectedYear = years[index];
				break;
			};
		} else {
			const thisFundValue = chartState.selectedFund === "cerf" ? cerfValue : cbpfValue;
			if (thisFundValue) {
				chartState.selectedYear = years[index];
				break;
			};
		};
	};
};

function disableFunds(data, fundButtons) {
	["cerf", "cbpf"].forEach(fund => {
		const filteredData = data.filter(e=>e.year === chartState.selectedYear);
		const fundInData = filteredData.some(d => d[fund]);
		if (fund === chartState.selectedFund && !fundInData) {
			chartState.selectedFund = "total";
			fundButtons.classed("active", e => e === chartState.selectedFund);
		};
		fundButtons.filter(d => d === fund).style("opacity", fundInData ? 1 : fadeOpacityFundButton)
			.style("pointer-events", fundInData ? "all" : "none")
			.style("filter", fundInData ? null : "saturate(0%)");
	});
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

function wrapTextTwoLines(text, width) {
	text.each(function() {
		let text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1,
			y = text.attr("y"),
			x = text.attr("x"),
			dy = 0.32,
			counter = 0,
			tspan = text.text(null)
			.append("tspan")
			.attr("x", x)
			.attr("y", y)
			.attr("dy", dy + "em");
		while ((word = words.pop()) && counter < 2) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node()
				.getComputedTextLength() > width) {
				counter++;
				line.pop();
				tspan.text(line.join(" ") + (counter < 2 ? "" : "..."));
				line = [word];
				if (counter < 2) {
					tspan = text.append("tspan")
						.attr("x", x)
						.attr("y", y)
						.attr("dy", ++lineNumber * lineHeight + dy + "em")
						.text(word);
					if (counter > 0) d3.select(tspan.node().previousSibling).attr("dy", "-0.3em");
				};
			};
		};
	});
};

function createYearsArray(originalData, fund) {
	const years = originalData.reduce((acc, curr) => {
		if (curr[fund] && !acc.includes(curr.year)) acc.push(curr.year);
		return acc;
	}, []);
	years.sort((a, b) => a - b);
	return years;
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
	const result = d3.formatPrefix("." + digits + "~", value)(value);
	if (parseInt(result) === 1000) {
		const lastDigit = result[result.length - 1];
		const units = { k: "M", M: "B" };
		return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
	};
	return result;
};

function formatSIFloatNoZeroes(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits + "~", value)(value);
};

function parseTransform(translate) {
	const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
	group.setAttributeNS(null, "transform", translate);
	const matrix = group.transform.baseVal.consolidate().matrix;
	return [matrix.e, matrix.f];
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

export { createCountryProfileBySector };