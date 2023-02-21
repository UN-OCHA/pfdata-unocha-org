import { chartState } from "./chartstate.js";
import { donorsFlagsData } from "./donorsflagsdata.js";
import { positionTooltip } from "./positiontooltip.js";

//|constants
const padding = [40, 60, 20, 196],
	tooltipVerticalPadding = 6,
	tooltipHorizontalPadding = 6,
	classPrefix = "pfbicpcontr",
	thisTab = "Contributions by Donor",
	formatPercent = d3.format(".0%"),
	formatSIaxes = d3.format("~s"),
	formatMoney0Decimals = d3.format(",.0f"),
	innerTooltipDivWidth = 290,
	currentDate = new Date(),
	localVariable = d3.local(),
	unBlue = "#1F69B3",
	currentYear = currentDate.getFullYear(),
	separator = "##",
	darkerValue = 0.2,
	darkerValueText = 0.5,
	donorNameWidth = 0.25,
	flagWidth = 0.05,
	barWidth = 1 - donorNameWidth - flagWidth,
	donorDivHeight = 2, //value in "em"
	barHeightFactor = 0.7,
	maxRowWidth = 98,
	textMinPadding = 8,
	valueTypes = ["total", "paid", "pledge"],
	duration = 1000,
	doubleClickTime = 500,
	cerfText1 = "CERF receives broad support from United Nations Member States, observers, regional governments and international organizations, and the private sector, including corporations, non-governmental organizations and individuals.",
	cerfText2 = "All contributions made by donors to the Central Emergency Response Fund (CERF) can be found by clicking on the link below.",
	cerfLink = "Visit <a target='_blank' href='https://cerf.un.org/our-donors/contributions'>cerf.un.org/our-donors/contributions</a>",
	cerfLogo = "./assets/img/cerf-logo.svg";

let yearsArrayCbpf,
	sortedRow = "value",
	selectedType = valueTypes[0],
	activeTransition = false;

function createCountryProfileContributions(container, lists, colors, tooltipDiv, yearsButtons) {

	const outerDiv = container.append("div")
		.attr("class", classPrefix + "outerDiv");

	const chartsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartsDiv");

	const topRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "topRowDiv");

	const chartsContainerDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "chartsContainerDiv");

	const chartDivCerf = chartsContainerDiv.append("div")
		.attr("class", classPrefix + "chartDivCerf");

	const chartTitleCerf = chartDivCerf.append("div")
		.attr("class", classPrefix + "chartTitleCerf")
		.html("CERF");

	const chartContentCerf = chartDivCerf.append("div")
		.attr("class", classPrefix + "chartContentCerf");

	chartContentCerf.append("p").html(cerfText1);
	chartContentCerf.append("p").html(cerfText2);
	chartContentCerf.append("p").html(cerfLink);
	chartContentCerf.append("img").attr("src", cerfLogo);

	const chartDivCbpf = chartsContainerDiv.append("div")
		.attr("class", classPrefix + "chartDivCbpf");

	const chartTitleCbpf = chartDivCbpf.append("div")
		.attr("class", classPrefix + "chartTitleCbpf")
		.html("CBPF");

	const headerRowDivCbpf = chartDivCbpf.append("div")
		.attr("class", classPrefix + "headerRowDivCbpf");

	const chartContentCbpf = chartDivCbpf.append("div")
		.attr("class", classPrefix + "chartContentCbpf");

	createTopFiguresDiv(topRowDiv, colors, lists);
	createHeaderRow(headerRowDivCbpf);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	function draw(originalData, resetYear, firstTime) {

		if (firstTime) {
			yearsArrayCbpf = createYearsArray(originalData);
		};

		const thisYear = originalData.find(e => chartState.selectedYearCountryProfile.includes(e.year));

		if (resetYear || !thisYear) setDefaultYear(originalData, yearsArrayCbpf);

		yearsButtons.classed("active", d => chartState.selectedYearCountryProfile.includes(d));

		const data = processData(originalData, lists);

		const syncedTransition = d3.transition()
			.duration(duration)
			.on("start", () => activeTransition = true)
			.on("end", () => activeTransition = false);

		yearsButtons.on("click", (event, d) => {
			if (activeTransition) return;
			tooltipDiv.style("display", "none");

			const button = event.currentTarget;
			if (event.altKey) {
				setSelectedYears(d, false);
				return;
			};
			if (localVariable.get(button) !== "clicked") {
				localVariable.set(button, "clicked");
				setTimeout(() => {
					if (localVariable.get(button) === "clicked") {
						setSelectedYears(d, true);
					};
					localVariable.set(button, null);
				}, doubleClickTime);
			} else {
				setSelectedYears(d, false);
				localVariable.set(button, null);
			};

			function setSelectedYears(d, singleSelection) {
				if (singleSelection) {
					chartState.selectedYearCountryProfile = [d];
				} else {
					const index = chartState.selectedYearCountryProfile.indexOf(d);
					if (index > -1) {
						if (chartState.selectedYearCountryProfile.length === 1) {
							return;
						} else {
							chartState.selectedYearCountryProfile.splice(index, 1);
						};
					} else {
						chartState.selectedYearCountryProfile.push(d);
					};
				};

				//change everything to chartState.selectedYearCountryProfile, then uncomment this part here:
				draw(originalData, false, false);
			};
		});

		yearsButtons.on("playButtonClick", () => {
			if (chartState.selectedCountryProfileTab !== thisTab) return;
			if (activeTransition) return;
			tooltipDiv.style("display", "none");
			draw(originalData, false, false);
		});

		drawTopFigures(data.topFigures, topRowDiv, colors, syncedTransition, tooltipDiv);

		drawTable(data.cbpfData, chartContentCbpf, container, lists, colors, syncedTransition, tooltipDiv, headerRowDivCbpf);

		//end of draw
	};

	return draw;

	//end of createCountryProfileContributions
};

function createHeaderRow(container) {
	container.append("div")
		.attr("class", classPrefix + "headerName")
		.style("flex", `0 ${formatPercent(donorNameWidth)}`)
		.datum({ type: "name" })
		.html("Donor")
		.append("div")
		.style("display", "none")
		.attr("class", classPrefix + "iconDiv")
		.append("i")
		.attr("class", "fas fa-sort-alpha-down");
	container.append("div")
		.attr("class", classPrefix + "headerFlag")
		.style("flex", `0 ${formatPercent(flagWidth)}`)
		.datum({ type: "type" })
		.html(null);
	container.append("div")
		.attr("class", classPrefix + "headerValue")
		.style("flex", `0 ${formatPercent(barWidth)}`)
		.datum({ type: "value" })
		.html("Contribution Amount")
		.append("div")
		.style("display", "none")
		.attr("class", classPrefix + "iconDiv")
		.append("i")
		.attr("class", "fas fa-sort-amount-down");
};

function drawTopFigures(data, container, colors, syncedTransition, tooltipDiv) {

	container.select(`.${classPrefix}spanYearValue`)
		.html(`in ${chartState.selectedYearCountryProfile.length === 1 ? chartState.selectedYearCountryProfile : createYearsList()}`);

	container.select(`.${classPrefix}contributionsValue`)
		.transition(syncedTransition)
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

	container.select(`.${classPrefix}contributionsUnit`)
		.html(() => {
			const unit = formatSIFloat(data.total).slice(-1);
			return unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
		});

	container.select(`.${classPrefix}paidValueDiv`)
		.transition(syncedTransition)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, data.paid);
			localVariable.set(n[i], data.paid);
			const finalValue = formatSIFloat(data.paid);
			if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
			} else {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
			};
		});

	container.select(`.${classPrefix}paidUnitDiv`)
		.html(() => {
			const unit = formatSIFloat(data.paid).slice(-1);
			return +unit === +unit ? null : unit;
		});

	container.select(`.${classPrefix}pledgeValueDiv`)
		.transition(syncedTransition)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, data.pledge);
			localVariable.set(n[i], data.pledge);
			const finalValue = formatSIFloat(data.pledge);
			if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
			} else {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
			};
		});

	container.select(`.${classPrefix}pledgeUnitDiv`)
		.html(() => {
			const unit = formatSIFloat(data.pledge).slice(-1);
			return +unit === +unit ? null : unit;
		});

	container.select(`.${classPrefix}donorsValueDiv`)
		.transition(syncedTransition)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolateRound(localVariable.get(n[i]) || 0, data.donors.size);
			localVariable.set(n[i], data.donors.size);
			return t => n[i].textContent = interpolator(t);
		});

	container.select(`.${classPrefix}donorsTextDiv`)
		.html(data.donors.size > 1 ? "donors" : "donor");

	container.select(`.${classPrefix}contributionsDiv`)
		.on("mouseover", event => mouseoverTopFigures(event, data, tooltipDiv, container, colors))
		.on("mouseout", () => mouseOut(tooltipDiv));

	container.select(`.${classPrefix}paidAndPledgeDiv`)
		.on("mouseover", event => mouseoverPaidPledge(event, data, tooltipDiv, container, colors))
		.on("mouseout", () => mouseOut(tooltipDiv));

	//end of drawTopFigures
};

function createTopFiguresDiv(container, colors, lists) {

	const contributionsDiv = container.append("div")
		.attr("class", classPrefix + "contributionsDiv");

	const descriptionDiv = contributionsDiv.append("div")
		.attr("class", classPrefix + "descriptionDiv");

	descriptionDiv.append("span")
		.html(`Contributions for ${lists.fundNamesList[chartState.selectedCountryProfile]}`)
	descriptionDiv.append("span")
		.attr("class", classPrefix + "spanYearValue")
		.html(`in ${chartState.selectedYearCountryProfile.length === 1 ? chartState.selectedYearCountryProfile : createYearsList()}`);

	const contributionsValuePlusUnit = contributionsDiv.append("div")
		.attr("class", classPrefix + "valuePlusUnit");

	const contributionsValue = contributionsValuePlusUnit.append("span")
		.attr("class", classPrefix + "contributionsValue")
		.html("$0")
		.call(applyColors, colors);

	const contributionsUnit = contributionsValuePlusUnit.append("span")
		.attr("class", classPrefix + "contributionsUnit");

	const paidAndPledgeDiv = container.append("div")
		.attr("class", classPrefix + "paidAndPledgeDiv");

	const paidDiv = paidAndPledgeDiv.append("div")
		.attr("class", classPrefix + "paidDiv");

	const pledgeDiv = paidAndPledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeDiv");

	const paidValueDiv = paidDiv.append("div")
		.attr("class", classPrefix + "paidValueDiv")
		.html("$0")
		.call(applyColors, colors);

	const paidUnitDiv = paidDiv.append("div")
		.attr("class", classPrefix + "paidUnitDiv");

	const paidTextDiv = paidDiv.append("div")
		.attr("class", classPrefix + "paidTextDiv")
		.html("paid contributions");

	const pledgeValueDiv = pledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeValueDiv")
		.html("$0")
		.call(applyColors, colors);

	const pledgeUnitDiv = pledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeUnitDiv");

	const pledgeTextDiv = pledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeTextDiv")
		.html("pledged contributions");

	const donorsDiv = container.append("div")
		.attr("class", classPrefix + "donorsDiv");

	const donorsValueDiv = donorsDiv.append("div")
		.attr("class", classPrefix + "donorsValueDiv")
		.html("0")
		.call(applyColors, colors);

	const donorsTextDiv = donorsDiv.append("div")
		.attr("class", classPrefix + "donorsTextDiv")
		.html("donors");

};

function drawTable(data, containerDiv, container, lists, colors, syncedTransitionOriginal, tooltipDiv, header) {

	const maxValue = d3.max(data, d => d[selectedType]);

	const syncedTransition = syncedTransitionOriginal || d3.transition()
		.duration(duration)
		.on("start", () => activeTransition = true)
		.on("end", () => activeTransition = false);

	let rowDiv = containerDiv.selectAll(`.${classPrefix}rowDiv`)
		.data(data, d => d.donor);

	rowDiv.exit()
		.remove();

	const rowDivEnter = rowDiv.enter()
		.append("div")
		.attr("class", classPrefix + "rowDiv")
		.style("height", donorDivHeight + "em", "important")
		.style("top", (_, i) => (donorDivHeight * i) + "em");

	const rowDivName = rowDivEnter.append("div")
		.attr("class", classPrefix + "rowDivName")
		.style("flex", `0 ${formatPercent(donorNameWidth)}`)
		.html(d => lists.donorNamesList[d.donor])

	const rowDivFlag = rowDivEnter.append("div")
		.attr("class", classPrefix + "rowDivFlag")
		.style("flex", `0 ${formatPercent(flagWidth)}`)
		.append("img")
		.attr("height", "24px")
		.attr("width", "24px")
		.attr("src", d => donorsFlagsData[lists.donorIsoCodesList[d.donor].toLowerCase()]);

	const barDivContainer = rowDivEnter.append("div")
		.attr("class", classPrefix + "barDivContainer")
		.style("flex", `0 ${formatPercent(barWidth)}`);

	const barDiv = barDivContainer.append("div")
		.attr("class", classPrefix + "barDiv")
		.style("width", "0%")
		.style("height", (donorDivHeight * barHeightFactor) + "em")
		.style("background-color", colors.cbpf);

	const barLabel = barDivContainer.append("span")
		.attr("class", classPrefix + "barLabel")
		.style("right", "95%");

	rowDiv = rowDivEnter.merge(rowDiv);

	rowDiv.order();

	rowDiv.transition(syncedTransition)
		.style("top", (_, i) => (donorDivHeight * i) + "em");

	rowDiv.select(`.${classPrefix}barDiv`)
		.transition(syncedTransition)
		.style("width", d => maxValue === 0 ? "0%" : (maxRowWidth * d[selectedType] / maxValue) + "%");

	rowDiv.select(`.${classPrefix}barLabel`)
		.transition(syncedTransition)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[selectedType]);
			return t => d[selectedType] ? formatSIFloat(interpolator(t)).replace("G", "B") : 0;
		})
		.styleTween("right", (d, i, n) => {
			const containerWidth = n[i].parentNode.getBoundingClientRect().width;
			return () => {
				const textWidth = n[i].getBoundingClientRect().width;
				const barWidth = n[i].previousSibling.getBoundingClientRect().width;
				return textWidth + textMinPadding > barWidth ?
					0.99 * containerWidth - barWidth - textWidth + "px" :
					containerWidth - barWidth + "px";
			};
		});

	const headerName = header.select(`.${classPrefix}headerName`);
	const headerValue = header.select(`.${classPrefix}headerValue`);

	headerName.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("name"));

	headerValue.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("value"));

	headerValue.dispatch("mouseover");

	function sortRows(sortType) {
		sortedRow = sortType;
		data.sort((a, b) => sortType === "name" ? lists.donorNamesList[a.donor].localeCompare(lists.donorNamesList[b.donor]) :
			b[selectedType] - a[selectedType]);
		rowDiv.data(data, d => d.donor)
			.order()
			.transition()
			.duration(duration)
			.style("top", (_, i) => (donorDivHeight * i) + "em");
	};

	function mouseOverHeader(event) {
		d3.select(event.currentTarget.parentNode)
			.selectAll("div")
			.select(`.${classPrefix}iconDiv`)
			.style("display", (_, i, n) => n[i].parentNode === event.currentTarget ? "block" : "none");
	};

	function mouseOutHeader(event) {
		d3.select(event.currentTarget.parentNode)
			.selectAll("div")
			.select(`.${classPrefix}iconDiv`)
			.style("display", d => d.type === sortedRow ? "block" : "none");
	};

	rowDiv.on("mouseenter", (event, d) => mouseoverRow(event, d, tooltipDiv, container, colors, lists))
		.on("mouseleave", () => mouseOut(tooltipDiv));

	//end of drawTable
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
		.html("Total Contributions: ");

	innerDiv.append("span")
		.attr("class", classPrefix + "topFiguresContributionsValue")
		.call(applyColors, colors)
		.html("$" + formatMoney0Decimals(data.total));

	positionTooltip(tooltip, container, event, "right");

};

function mouseoverPaidPledge(event, data, tooltip, container, colors) {

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

	const paidDiv = innerDiv.append("div");

	paidDiv.append("span")
		.html("Total paid: ");

	paidDiv.append("span")
		.attr("class", classPrefix + "topFiguresContributionsValue")
		.call(applyColors, colors)
		.html("$" + formatMoney0Decimals(data.paid));

	const pledgeDiv = innerDiv.append("div");

	pledgeDiv.append("span")
		.html("Total pledged: ");

	pledgeDiv.append("span")
		.attr("class", classPrefix + "topFiguresContributionsValue")
		.call(applyColors, colors)
		.html("$" + formatMoney0Decimals(data.pledge));

	positionTooltip(tooltip, container, event, "left");

};

function mouseoverRow(event, data, tooltip, container, colors, lists) {

	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block")
		.html(null);

	const innerTooltipDiv = tooltip.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("display", "flex")
		.style("align-items", "center")
		.style("margin-bottom", "18px");

	titleDiv.append("div")
		.append("strong")
		.style("font-size", "16px")
		.html(lists.donorNamesList[data.donor]);

	titleDiv.append("div")
		.attr("class", classPrefix + "rowDivFlag")
		.style("margin-left", "6px")
		.append("img")
		.attr("height", "24px")
		.attr("width", "24px")
		.attr("src", d => donorsFlagsData[lists.donorIsoCodesList[data.donor].toLowerCase()]);

	const innerDiv = innerTooltipDiv.append("div");

	const valueDiv = innerDiv.append("div");

	valueDiv.append("span")
		.html("Contribution amount: ");

	valueDiv.append("span")
		.attr("class", classPrefix + "topFiguresContributionsValue")
		.style("color", d3.color(colors.cbpf).darker(darkerValueText))
		.html("$" + formatMoney0Decimals(data.total));

	const paidDiv = innerDiv.append("div");

	paidDiv.append("span")
		.html("Paid amount: ");

	paidDiv.append("span")
		.attr("class", classPrefix + "topFiguresContributionsValue")
		.style("color", d3.color(colors.cbpf).darker(darkerValueText))
		.html("$" + formatMoney0Decimals(data.paid));

	const pledgeDiv = innerDiv.append("div");

	pledgeDiv.append("span")
		.html("Pledged amount: ");

	pledgeDiv.append("span")
		.attr("class", classPrefix + "topFiguresContributionsValue")
		.style("color", d3.color(colors.cbpf).darker(darkerValueText))
		.html("$" + formatMoney0Decimals(data.pledge));

	positionTooltip(tooltip, container, event, "left");

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
			paid: 0,
			pledge: 0,
			donors: new Set()
		},
		cbpfData: []
	};

	originalData.forEach(row => {
		if (chartState.selectedYearCountryProfile.includes(row.year)) {
			row.values.forEach(innerRow => {
				if (chartState.selectedYearCountryProfile.length === 1) {
					data.cbpfData.push(JSON.parse(JSON.stringify(innerRow)));
				} else {
					const foundDonor = data.cbpfData.find(e => e.donor === innerRow.donor);
					if (foundDonor) {
						foundDonor.total += innerRow.total;
						foundDonor.paid += innerRow.paid;
						foundDonor.pledge += innerRow.pledge;
					} else {
						data.cbpfData.push(JSON.parse(JSON.stringify(innerRow)));
					};
				};
				data.topFigures.total += innerRow.total;
				data.topFigures.paid += innerRow.paid;
				data.topFigures.pledge += innerRow.pledge;
				data.topFigures.donors.add(innerRow.donor);
			});
		};
	});

	data.cbpfData.sort((a, b) => b[selectedType] - a[selectedType]);

	return data;

	//end of processData
};

function setDefaultYear(originalData, years) {
	const beforeCurrentYears = years.filter(e => e <= currentYear);
	const filteredYears = beforeCurrentYears.length ? beforeCurrentYears : years;
	let index = filteredYears.length;
	while (--index >= 0) {
		const cbpfValue = originalData.find(e => e.year === filteredYears[index]);
		if (cbpfValue) {
			chartState.selectedYearCountryProfile = [filteredYears[index]];
			break;
		};
	};
};

function createYearsList() {
	const yearsList = chartState.selectedYearCountryProfile.sort(function(a, b) {
		return a - b;
	}).reduce(function(acc, curr, index) {
		return acc + (index >= chartState.selectedYearCountryProfile.length - 2 ? index > chartState.selectedYearCountryProfile.length - 2 ? curr : curr + " and " : curr + ", ");
	}, "");
	return chartState.selectedYearCountryProfile.length > 4 ? "several years selected" : yearsList;
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

function createYearsArray(originalData) {
	return originalData.map(d => d.year);
};

function applyColors(selection, colors) {
	selection.style("color", d3.color(colors.cbpf).darker(darkerValueText));
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

export { createCountryProfileContributions };