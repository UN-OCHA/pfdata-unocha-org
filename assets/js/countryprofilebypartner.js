import { chartState } from "./chartstate.js";
import { positionTooltip } from "./positiontooltip.js";

//|constants
const padding = [4, 8, 4, 8],
	paddingCerf = [10, 52, 30, 118],
	paddingCbpf = [10, 52, 30, 118],
	paddingPartnersCerf = [30, 52, 10, 118],
	paddingPartnersCbpf = [30, 52, 10, 118],
	panelHorizontalPadding = 8,
	panelVerticalPadding = 8,
	tooltipVerticalPadding = 6,
	tooltipHorizontalPadding = 6,
	polylinePadding = 4,
	fadeOpacity = 0.2,
	fadeOpacityFundButton = 0.4,
	innerTooltipDivWidth = 290,
	classPrefix = "pfbicpbypartner",
	thisTab = "Allocations by Partner",
	formatPercent = d3.format(".0%"),
	formatPercent1Decimal = d3.format(".1%"),
	formatSIaxes = d3.format("~s"),
	formatMoney0Decimals = d3.format(",.0f"),
	currentDate = new Date(),
	localVariable = d3.local(),
	unBlue = "#1F69B3",
	currentYear = currentDate.getFullYear(),
	separator = "##",
	duration = 1000,
	darkerValue = 0.2,
	darkerValueText = 0.5,
	tickSize = 9,
	bandScalePadding = 0.5,
	labelsPadding = 4,
	partnerNameWidth = 0.4,
	typeWidth = 0.1,
	barWidth = 1 - partnerNameWidth - typeWidth,
	maxRowWidth = 98,
	partnerRowHeight = 3.2,
	partnerRowMinHeight = 2.4,
	namePadding = 1,
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"],
	}, //THIS SHOULD NOT BE HARDCODED
	partnersShortNames = {
		1: "INGO",
		2: "NNGO",
		3: "UN",
		4: "Other",
	},
	doubleClickTime = 500,
	barHeight = 40;

let yearsArrayCerf,
	yearsArrayCbpf,
	totalWidth,
	sortedRow = "value",
	activeTransition = false;

function createCountryProfileByPartner(
	container,
	lists,
	colors,
	tooltipDiv,
	fundButtons,
	yearsButtons
) {
	const cerfId = +Object.keys(lists.fundTypesList).find(
		e => lists.fundTypesList[e] === "cerf"
	);
	const cbpfId = +Object.keys(lists.fundTypesList).find(
		e => lists.fundTypesList[e] === "cbpf"
	);

	const outerDiv = container
		.append("div")
		.attr("class", classPrefix + "outerDiv");

	const chartsDiv = outerDiv
		.append("div")
		.attr("class", classPrefix + "chartsDiv");

	const topRowDiv = chartsDiv
		.append("div")
		.attr("class", classPrefix + "topRowDiv");

	const barChartsDiv = chartsDiv
		.append("div")
		.attr("class", classPrefix + "barChartsDiv");

	const barChartsDivCerf = barChartsDiv
		.append("div")
		.attr("class", classPrefix + "barChartsDivCerf");

	const titleDivCerf = barChartsDivCerf
		.append("div")
		.attr("class", classPrefix + "titleDivCerf")
		.html("CERF");

	const headerRowDivCerf = barChartsDivCerf
		.append("div")
		.attr("class", classPrefix + "headerRowDivCerf");

	const partnersDivCerf = barChartsDivCerf
		.append("div")
		.attr("class", classPrefix + "partnersDivCerf");

	const barChartsDivCbpf = barChartsDiv
		.append("div")
		.attr("class", classPrefix + "barChartsDivCbpf");

	const titleDivCbpf = barChartsDivCbpf
		.append("div")
		.attr("class", classPrefix + "titleDivCbpf")
		.html("CBPF");

	const selectionChartDivCbpf = barChartsDivCbpf
		.append("div")
		.attr("class", classPrefix + "selectionChartDivCbpf");

	const selectionChartDivTitle = selectionChartDivCbpf
		.append("div")
		.attr("class", classPrefix + "selectionChartDivTitle");

	const selectionChartDivContent = selectionChartDivCbpf
		.append("div")
		.attr("class", classPrefix + "selectionChartDivContent");

	const headerRowDivCbpf = barChartsDivCbpf
		.append("div")
		.attr("class", classPrefix + "headerRowDivCbpf");

	const partnersDivCbpf = barChartsDivCbpf
		.append("div")
		.attr("class", classPrefix + "partnersDivCbpf");

	createTopFiguresDiv(topRowDiv, colors, lists);
	createHeaderRow(headerRowDivCerf, headerRowDivCbpf);

	const barChartsDivSize = barChartsDiv.node().getBoundingClientRect();

	totalWidth = barChartsDivSize.width;

	function draw(originalData, resetYear, firstTime) {
		if (firstTime) {
			yearsArrayCerf = createYearsArray(originalData, "cerf");
			yearsArrayCbpf = createYearsArray(originalData, "cbpf");
		}

		if (resetYear)
			setDefaultYear(originalData, yearsArrayCerf, yearsArrayCbpf);

		yearsButtons.classed("active", d =>
			chartState.selectedYearCountryProfile.includes(d)
		);

		disableFunds(originalData, fundButtons);
		disableYears(originalData, yearsButtons);

		const data = processData(originalData, lists, cerfId, cbpfId);

		const syncedTransition = d3
			.transition()
			.duration(duration)
			.on("start", () => (activeTransition = true))
			.on("end", () => (activeTransition = false));

		drawTopFigures(
			data.topFigures,
			topRowDiv,
			colors,
			syncedTransition,
			lists,
			tooltipDiv
		);
		recalculateDivWidth(data, barChartsDivCerf, barChartsDivCbpf);
		if (chartState.selectedFund !== "cerf") {
			drawSelectionChart(
				data.cbpfDataAggregated,
				selectionChartDivCbpf,
				syncedTransition,
				colors,
				tooltipDiv,
				container,
				lists
			);
			reselectCards(selectionChartDivCbpf);
		}
		drawTable(
			data.cerfData,
			null,
			partnersDivCerf,
			container,
			lists,
			colors,
			"cerf",
			syncedTransition,
			tooltipDiv
		);
		drawTable(
			data.cbpfData,
			null,
			partnersDivCbpf,
			container,
			lists,
			colors,
			"cbpf",
			syncedTransition,
			tooltipDiv
		);

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			draw(originalData, false, true);
		});

		yearsButtons.on("click", (event, d) => {
			if (activeTransition) return;
			tooltipDiv.style("display", "none");

			const button = event.currentTarget;
			if (event.altKey) {
				setSelectedYears(d, false);
				return;
			}
			if (localVariable.get(button) !== "clicked") {
				localVariable.set(button, "clicked");
				setTimeout(() => {
					if (localVariable.get(button) === "clicked") {
						setSelectedYears(d, true);
					}
					localVariable.set(button, null);
				}, doubleClickTime);
			} else {
				setSelectedYears(d, false);
				localVariable.set(button, null);
			}

			function setSelectedYears(d, singleSelection) {
				if (singleSelection) {
					chartState.selectedYearCountryProfile = [d];
				} else {
					const index =
						chartState.selectedYearCountryProfile.indexOf(d);
					if (index > -1) {
						if (
							chartState.selectedYearCountryProfile.length === 1
						) {
							return;
						} else {
							chartState.selectedYearCountryProfile.splice(
								index,
								1
							);
						}
					} else {
						chartState.selectedYearCountryProfile.push(d);
					}
				}

				//change everything to chartState.selectedYearCountryProfile, then uncomment this part here:
				draw(originalData, false, false);
			}
		});

		yearsButtons.on("playButtonClick", () => {
			if (chartState.selectedCountryProfileTab !== thisTab) return;
			if (activeTransition) return;
			tooltipDiv.style("display", "none");
			draw(originalData, false, false);
		});

		function reselectCards(container) {
			const cards = container.selectAll(`.${classPrefix}partnersCard`);
			const title = container.select(
				`.${classPrefix}selectionChartDivTitle`
			);

			cards.style("background-color", null).each(d => (d.click = false));

			cards.selectAll("div").style("color", null);

			cards.on("click", redraw);

			function redraw(event, d) {
				d.clicked = !d.clicked;

				tooltipDiv.style("display", "none").html(null);

				if (!d.clicked) {
					cards.style("background-color", null);
					cards.selectAll("div").style("color", null);
					title.html("Click for filtering by partner type:");
					drawTable(
						data.cbpfData,
						null,
						partnersDivCbpf,
						container,
						lists,
						colors,
						"cbpf",
						null,
						tooltipDiv
					);
				} else {
					cards
						.style("background-color", e =>
							e.partnerType === d.partnerType ? unBlue : null
						)
						.each(
							(d, i, n) =>
								(d.clicked = n[i] === event.currentTarget)
						);
					cards
						.selectAll("div")
						.style("color", e =>
							e.partnerType === d.partnerType ? "white" : null
						);
					title.html(
						"Click the selected partner for removing the filter:"
					);
					drawTable(
						data.cbpfData,
						d.partnerType,
						partnersDivCbpf,
						container,
						lists,
						colors,
						"cbpf",
						null,
						tooltipDiv
					);
				}
			}
		}

		//end of draw
	}

	return draw;

	//end of createCountryProfileByPartner
}

function drawTopFigures(
	data,
	container,
	colors,
	syncedTransition,
	lists,
	tooltipDiv
) {
	container
		.select(`.${classPrefix}spanYearValue`)
		.html(
			`in ${
				chartState.selectedYearCountryProfile.length === 1
					? chartState.selectedYearCountryProfile
					: createYearsList()
			}`
		);

	container
		.select(`.${classPrefix}allocationsValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolate(
				localVariable.get(n[i]) || 0,
				data.total
			);
			localVariable.set(n[i], data.total);
			const finalValue = formatSIFloat(data.total);
			if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
				return t =>
					(n[i].textContent = "$" + formatSIFloat(interpolator(t)));
			} else {
				return t =>
					(n[i].textContent =
						"$" + formatSIFloat(interpolator(t)).slice(0, -1));
			}
		});

	container.select(`.${classPrefix}allocationsUnit`).html(() => {
		const unit = formatSIFloat(data.total).slice(-1);
		return unit === "k"
			? "Thousand"
			: unit === "M"
			? "Million"
			: unit === "G"
			? "Billion"
			: "";
	});

	container
		.select(`.${classPrefix}projectsValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolateRound(
				n[i].textContent || 0,
				data.projects.size
			);
			return t => (n[i].textContent = interpolator(t));
		});

	container
		.select(`.${classPrefix}partnersValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolateRound(
				n[i].textContent || 0,
				data.partners.size
			);
			return t => (n[i].textContent = interpolator(t));
		});

	container
		.select(`.${classPrefix}allocationsDiv`)
		.on("mouseover", event =>
			mouseoverTopFigures(event, data, tooltipDiv, container, colors)
		)
		.on("mouseout", () => mouseOut(tooltipDiv));

	data.partnerFigures.forEach(
		d => (d.partner = partnersShortNames[d.partner])
	);

	data.partnerFigures.sort((a, b) => b.value - a.value);

	let partnerFigures = container
		.select(`.${classPrefix}partnerFiguresDiv`)
		.selectAll(`.${classPrefix}partnerFigures`)
		.data(data.partnerFigures, d => d.partner);

	partnerFigures.exit().remove();

	const partnerFiguresEnter = partnerFigures
		.enter()
		.append("div")
		.attr("class", classPrefix + "partnerFigures");

	const partnerName = partnerFiguresEnter
		.append("div")
		.attr("class", classPrefix + "partnerName")
		.html(d => d.partner + ":");

	const partnerValue = partnerFiguresEnter
		.append("div")
		.attr("class", classPrefix + "partnerValue")
		.html("$0");

	const partnerUnit = partnerFiguresEnter
		.append("div")
		.attr("class", classPrefix + "partnerUnit")
		.html("Allocated");

	const partnerSymbol = partnerFiguresEnter
		.append("div")
		.attr("class", classPrefix + "partnerSymbol");

	partnerFigures = partnerFiguresEnter.merge(partnerFigures);

	partnerFigures.order();

	partnerFigures
		.select(`.${classPrefix}partnerValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (d, i, n) => {
			const interpolator = d3.interpolate(
				localVariable.get(n[i]) || 0,
				d.value
			);
			localVariable.set(n[i], d.value);
			const finalValue = formatSIFloat(d.value);
			if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
				return t =>
					(n[i].textContent = "$" + formatSIFloat(interpolator(t)));
			} else {
				return t =>
					(n[i].textContent =
						"$" + formatSIFloat(interpolator(t)).slice(0, -1));
			}
		});

	partnerFigures.select(`.${classPrefix}partnerUnit`).html(d => {
		const unit = formatSIFloat(d.value).slice(-1);
		return (
			(unit === "k"
				? "Thousand"
				: unit === "M"
				? "Million"
				: unit === "G"
				? "Billion"
				: "") + " Allocated"
		);
	});

	partnerFigures
		.select(`.${classPrefix}partnerSymbol`)
		.each((_, i, n) => d3.select(n[i]).selectChildren().remove())
		.append("i")
		.attr("class", d =>
			d.fund.size > 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs"
		)
		.style("color", d =>
			d.fund.size > 1
				? null
				: colors[lists.fundTypesList[Array.from(d.fund)[0]]]
		);

	container
		.select(`.${classPrefix}partnerFiguresDiv`)
		.on("mouseover", event =>
			mouseoverPartnerFigures(
				event,
				data.partnerFigures,
				tooltipDiv,
				container,
				colors
			)
		)
		.on("mouseout", () => mouseOut(tooltipDiv));

	//end of drawTopFigures
}

function createTopFiguresDiv(container, colors, lists) {
	const allocationsDivWrapper = container
		.append("div")
		.attr("class", classPrefix + "allocationsDivWrapper");

	const allocationsDiv = allocationsDivWrapper
		.append("div")
		.attr("class", classPrefix + "allocationsDiv");

	const descriptionDiv = allocationsDiv
		.append("div")
		.attr("class", classPrefix + "descriptionDiv");

	descriptionDiv
		.append("span")
		.html(
			`Allocated in ${
				lists.fundNamesList[chartState.selectedCountryProfile]
			}`
		);
	descriptionDiv
		.append("span")
		.attr("class", classPrefix + "spanYearValue")
		.html(
			`in ${
				chartState.selectedYearCountryProfile.length === 1
					? chartState.selectedYearCountryProfile
					: createYearsList()
			}`
		);

	const allocationsValuePlusUnit = allocationsDiv
		.append("div")
		.attr("class", classPrefix + "valuePlusUnit");

	const allocationsValue = allocationsValuePlusUnit
		.append("span")
		.attr("class", classPrefix + "allocationsValue")
		.html("$0")
		.call(applyColors, colors);

	const allocationsUnit = allocationsValuePlusUnit
		.append("span")
		.attr("class", classPrefix + "allocationsUnit");

	const projectsAndPartnersDivWrapper = container
		.append("div")
		.attr("class", classPrefix + "projectsAndPartnersDivWrapper");

	const projectsAndPartnersDiv = projectsAndPartnersDivWrapper
		.append("div")
		.attr("class", classPrefix + "projectsAndPartnersDiv");

	const projectsDiv = projectsAndPartnersDiv
		.append("div")
		.attr("class", classPrefix + "projectsDiv");

	const projectsValue = projectsDiv
		.append("span")
		.attr("class", classPrefix + "projectsValue")
		.html("0")
		.call(applyColors, colors);

	const projectsText = projectsDiv
		.append("span")
		.attr("class", classPrefix + "projectsText")
		.html("Projects");

	const partnersDiv = projectsAndPartnersDiv
		.append("div")
		.attr("class", classPrefix + "partnersDiv");

	const partnersValue = partnersDiv
		.append("span")
		.attr("class", classPrefix + "partnersValue")
		.html("0")
		.call(applyColors, colors);

	const partnersText = partnersDiv
		.append("span")
		.attr("class", classPrefix + "partnersText")
		.html("Partners");

	const partnerFiguresDivWrapper = container
		.append("div")
		.attr("class", classPrefix + "partnerFiguresDivWrapper");

	const partnerFiguresDiv = partnerFiguresDivWrapper
		.append("div")
		.attr("class", classPrefix + "partnerFiguresDiv");
}

function createHeaderRow(...containers) {
	containers.forEach(container => {
		container
			.append("div")
			.attr("class", classPrefix + "headerName")
			.style("flex", `0 ${formatPercent(partnerNameWidth)}`)
			.datum({ type: "name" })
			.html("Organization<br>Name")
			.append("div")
			.style("display", "none")
			.attr("class", classPrefix + "iconDiv")
			.append("i")
			.attr("class", "fas fa-sort-alpha-down");
		container
			.append("div")
			.attr("class", classPrefix + "headerType")
			.style("flex", `0 ${formatPercent(typeWidth)}`)
			.datum({ type: "type" })
			.html("Type")
			.append("div")
			.style("display", "none")
			.attr("class", classPrefix + "iconDiv")
			.append("i")
			.attr("class", "fas fa-sort-alpha-down");
		container
			.append("div")
			.attr("class", classPrefix + "headerValue")
			.style("flex", `0 ${formatPercent(barWidth)}`)
			.datum({ type: "value" })
			.html("Allocation Amount")
			.append("div")
			.style("display", "none")
			.attr("class", classPrefix + "iconDiv")
			.append("i")
			.attr("class", "fas fa-sort-amount-down");
	});
}

function drawSelectionChart(
	data,
	container,
	syncedTransition,
	colors,
	tooltip,
	containerDiv,
	lists
) {
	const total = d3.sum(data, d => d.value);
	const maxValue = d3.max(data, d => d.value);

	const titleDiv = container.select(`.${classPrefix}selectionChartDivTitle`);

	titleDiv.html("Click for filtering by partner type:");

	const cardContainer = container.select(
		`.${classPrefix}selectionChartDivContent`
	);

	let partnersCard = cardContainer
		.selectAll(`.${classPrefix}partnersCard`)
		.data(data, d => d.partnerType);

	const partnersCardExit = partnersCard.exit().remove();

	const partnersCardEnter = partnersCard
		.enter()
		.append("div")
		.attr("class", classPrefix + "partnersCard");

	const partnersCardNameDiv = partnersCardEnter
		.append("div")
		.attr("class", classPrefix + "partnersCardNameDiv");

	const partnersCardValueDiv = partnersCardEnter
		.append("div")
		.attr("class", classPrefix + "partnersCardValueDiv");

	const partnersCardBarDiv = partnersCardEnter
		.append("div")
		.attr("class", classPrefix + "partnersCardBarDiv");

	partnersCardNameDiv.html(d => lists.partnersList[d.partnerType]);

	partnersCardValueDiv.html(
		d =>
			`${formatSIFloat(d.value)} (${formatPercent1Decimal(
				d.value / total
			)})`
	);

	const partnersCardBar = partnersCardBarDiv
		.append("div")
		.attr("class", classPrefix + "partnersCardBar")
		.style("background-color", colors.cbpf)
		.style("width", "0%");

	partnersCard = partnersCardEnter.merge(partnersCard);

	partnersCard.order();

	partnersCard
		.select(`.${classPrefix}partnersCardValueDiv`)
		.html(
			d =>
				`${formatSIFloat(d.value)} (${formatPercent1Decimal(
					d.value / total
				)})`
		);

	partnersCard
		.select(`.${classPrefix}partnersCardBar`)
		.transition(syncedTransition)
		.style("width", d => formatPercent1Decimal(d.value / maxValue));

	partnersCard
		.on("mouseover", mouseOverSelection)
		.on("mouseout", () => mouseOut(tooltip));

	function mouseOverSelection(event, datum) {
		tooltip.style("display", "block").html(null);

		const innerTooltipDiv = tooltip
			.append("div")
			.style("max-width", innerTooltipDivWidth + "px")
			.attr("id", classPrefix + "innerTooltipDiv");

		const titleDiv = innerTooltipDiv
			.append("div")
			.attr("class", classPrefix + "tooltipTitleDiv")
			.style("margin-bottom", "18px");

		titleDiv
			.append("strong")
			.style("font-size", "16px")
			.html(lists.partnersList[datum.partnerType]);

		const innerDiv = innerTooltipDiv
			.append("div")
			.style("display", "flex")
			.style("flex-wrap", "wrap")
			.style("white-space", "pre")
			.style("width", "100%");

		const valueDiv = innerDiv
			.append("div")
			.attr("class", classPrefix + "tooltipValue")
			.style("display", "flex")
			.style("align-items", "center")
			.style("width", "100%")
			.style("margin-bottom", "0.4em");

		valueDiv
			.append("span")
			.style("font-weight", 500)
			.attr("class", classPrefix + "tooltipKeys")
			.html("Total:");

		valueDiv.append("span").attr("class", classPrefix + "tooltipLeader");

		valueDiv
			.append("span")
			.attr("class", classPrefix + "tooltipValues")
			.html(formatMoney0Decimals(datum.value));

		innerTooltipDiv
			.append("div")
			.attr("class", classPrefix + "clickText")
			.html(
				datum.clicked
					? "Click for removing the filter"
					: "Click for filtering the partners list, showing only " +
							lists.partnersList[datum.partnerType] +
							" partners. Click again for removing the filter"
			);

		positionTooltip(tooltip, containerDiv, event, "top");
	}

	//end of drawSelectionChart
}

function drawTable(
	data,
	partnerType,
	containerDiv,
	container,
	lists,
	colors,
	fundType,
	syncedTransitionOriginal,
	tooltip
) {
	containerDiv.selectChildren().remove();

	const syncedTransition =
		syncedTransitionOriginal ||
		d3
			.transition()
			.duration(duration)
			.on("start", () => (activeTransition = true))
			.on("end", () => (activeTransition = false));

	const namesList =
		fundType === "cerf"
			? lists.unAgenciesNamesList
			: lists.partnersNamesList;

	const filteredData = JSON.parse(
		JSON.stringify(
			!partnerType
				? data
				: data.filter(partner => partner.partnerType === partnerType)
		)
	);

	const maxValue = d3.max(filteredData, d => d.value);

	const rowDiv = containerDiv
		.selectAll(null)
		.data(filteredData, d => d.partner)
		.enter()
		.append("div")
		.attr("class", classPrefix + "rowDiv" + capitalize(fundType))
		.style("background-color", (_, i) => (!(i % 2) ? "#fff" : "#eee"))
		.style("max-height", partnerRowHeight + "em")
		.style("line-height", partnerRowHeight / 2 + "em");

	const partnerNameDiv = rowDiv
		.append("div")
		.attr("class", classPrefix + "partnerNameDiv")
		.style("flex", `0 ${formatPercent(partnerNameWidth)}`)
		.html(d => namesList[d.partner]);

	const partnerTypeDiv = rowDiv
		.append("div")
		.style("flex", `0 ${formatPercent(typeWidth)}`)
		.html(d => partnersShortNames[d.partnerType]);

	const barDivContainer = rowDiv
		.append("div")
		.attr("class", classPrefix + "barDivContainer")
		.style("flex", `0 ${formatPercent(barWidth)}`);

	const barDiv = barDivContainer
		.append("div")
		.attr("class", classPrefix + "barDiv")
		.style("width", "0%")
		.style("background-color", colors[fundType]);

	const barLabel = barDivContainer
		.append("span")
		.attr("class", classPrefix + "barLabel")
		.style("right", "95%");

	rowDiv
		.select(`.${classPrefix}barDiv`)
		.transition(syncedTransition)
		.style("width", d => (maxRowWidth * d.value) / maxValue + "%");

	rowDiv
		.select(`.${classPrefix}barLabel`)
		.transition(syncedTransition)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(
				reverseFormat(n[i].textContent) || 0,
				d.value
			);
			return t =>
				d.value ? formatSIFloat(interpolator(t)).replace("G", "B") : 0;
		})
		.styleTween("right", (d, i, n) => {
			const containerWidth =
				n[i].parentNode.getBoundingClientRect().width;
			return () => {
				const textWidth = n[i].getBoundingClientRect().width;
				const barWidth =
					n[i].previousSibling.getBoundingClientRect().width;
				return textWidth > barWidth
					? 0.99 * containerWidth - barWidth - textWidth + "px"
					: containerWidth - barWidth + "px";
			};
		});

	const thisHeader = d3.select(
		`.${classPrefix}headerRowDiv${capitalize(fundType)}`
	);
	const headerName = thisHeader.select(`.${classPrefix}headerName`);
	const headerType = thisHeader.select(`.${classPrefix}headerType`);
	const headerValue = thisHeader.select(`.${classPrefix}headerValue`);

	headerName
		.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("name"));

	headerType
		.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("type"));

	headerValue
		.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("value"));

	headerValue.dispatch("mouseover");

	function sortRows(sortType) {
		sortedRow = sortType;
		filteredData.sort((a, b) =>
			sortType === "name"
				? namesList[a.partner].localeCompare(namesList[b.partner])
				: sortType === "type"
				? partnersShortNames[a.partnerType].localeCompare(
						partnersShortNames[b.partnerType]
				  )
				: b.value - a.value
		);
		rowDiv
			.data(filteredData, d => d.partner)
			.order()
			.each((_, i, n) =>
				d3
					.select(n[i])
					.style("background-color", !(i % 2) ? "#fff" : "#eee")
			);
	}

	function mouseOverHeader(event) {
		d3.select(event.currentTarget.parentNode)
			.selectAll("div")
			.select(`.${classPrefix}iconDiv`)
			.style("display", (_, i, n) =>
				n[i].parentNode === event.currentTarget ? "block" : "none"
			);
	}

	function mouseOutHeader(event) {
		d3.select(event.currentTarget.parentNode)
			.selectAll("div")
			.select(`.${classPrefix}iconDiv`)
			.style("display", d => (d.type === sortedRow ? "block" : "none"));
	}

	rowDiv
		.on("mouseenter", (event, d) =>
			mouseoverRow(
				event,
				d,
				tooltip,
				container,
				colors,
				fundType,
				namesList
			)
		)
		.on("mouseleave", () => mouseOut(tooltip));

	//end of drawTable
}

function mouseoverTopFigures(event, data, tooltip, container, colors) {
	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block").html(null);

	const innerTooltipDiv = tooltip
		.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv
		.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong").style("font-size", "16px").html("Summary");

	const innerDiv = innerTooltipDiv.append("div");

	innerDiv
		.append("span")
		.html(
			`${
				chartState.selectedFund === "total" ||
				chartState.selectedFund === "cerf/cbpf"
					? "Total"
					: chartState.selectedFund.toUpperCase()
			} Allocations: `
		);

	innerDiv
		.append("span")
		.attr("class", classPrefix + "topFiguresAllocationsValue")
		.call(applyColors, colors)
		.html("$" + formatMoney0Decimals(data.total));

	positionTooltip(tooltip, container, event, "right");
}

function mouseoverPartnerFigures(event, data, tooltip, container, colors) {
	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block").html(null);

	const innerTooltipDiv = tooltip
		.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv
		.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv.append("strong").style("font-size", "16px").html("Summary");

	const innerDiv = innerTooltipDiv.append("div");

	data.forEach(datum => {
		const partnerDiv = innerDiv.append("div");

		partnerDiv
			.append("span")
			.html(
				`${datum.partner} ${
					chartState.selectedFund === "total" ||
					chartState.selectedFund === "cerf/cbpf"
						? "Total"
						: chartState.selectedFund.toUpperCase()
				} allocations: `
			);

		partnerDiv
			.append("span")
			.attr("class", classPrefix + "partnerFiguresAllocationsValue")
			.call(applyColors, colors)
			.html("$" + formatMoney0Decimals(datum.value));
	});

	positionTooltip(tooltip, container, event, "left");
}

function mouseoverRow(
	event,
	data,
	tooltip,
	container,
	colors,
	fundType,
	namesList
) {
	setChartStateTooltip(event, tooltip);

	tooltip.style("display", "block").html(null);

	const innerTooltipDiv = tooltip
		.append("div")
		.style("max-width", innerTooltipDivWidth + "px")
		.attr("id", classPrefix + "innerTooltipDiv");

	const titleDiv = innerTooltipDiv
		.append("div")
		.attr("class", classPrefix + "tooltipTitleDiv")
		.style("margin-bottom", "18px");

	titleDiv
		.append("strong")
		.style("font-size", "16px")
		.html(namesList[data.partner]);

	const innerDiv = innerTooltipDiv.append("div");

	const valueDiv = innerDiv.append("div");

	valueDiv.append("span").html("Allocation amount: ");

	valueDiv
		.append("span")
		.attr("class", classPrefix + "topFiguresAllocationsValue")
		.style("color", d3.color(colors[fundType]).darker(darkerValueText))
		.html("$" + formatMoney0Decimals(data.value));

	const projectsDiv = innerDiv.append("div");

	const numberofProjects =
		typeof data.projects === "number"
			? 1
			: data.projects.split(separator).length;

	projectsDiv
		.append("span")
		.attr("class", classPrefix + "topFiguresAllocationsValue")
		.style("color", d3.color(colors[fundType]).darker(darkerValueText))
		.html(`${numberofProjects} Project${numberofProjects > 1 ? "s" : ""}`);

	const thisPosition =
		fundType === "cerf" ||
		(chartState.selectedFund !== "total" &&
			chartState.selectedFund !== "cerf/cbpf")
			? "right"
			: "left";

	positionTooltip(tooltip, container, event, thisPosition);
}

function processData(originalData, lists, cerfId, cbpfId) {
	const data = {
		topFigures: {
			total: 0,
			projects: new Set(),
			partners: new Set(),
			partnerFigures: [],
		},
		cbpfData: [],
		cbpfDataAggregated: [],
		cerfData: [],
	};

	if (chartState.selectedFund !== "cbpf")
		originalData.cerf.forEach(row =>
			processRow(row, data.cerfData, true, true, cerfId)
		);
	if (chartState.selectedFund !== "cerf") {
		originalData.cbpfAggregated.forEach(row =>
			processRow(row, data.cbpfDataAggregated, true, false, null)
		);
		originalData.cbpf.forEach(row =>
			processRow(row, data.cbpfData, false, true, cbpfId)
		);
	}

	function processRow(
		row,
		target,
		addTotal,
		countProjectsAndPartners,
		fundType
	) {
		if (chartState.selectedYearCountryProfile.includes(row.year)) {
			row.values.forEach(innerRow => {
				target.push(JSON.parse(JSON.stringify(innerRow)));
				if (addTotal) data.topFigures.total += innerRow.value;
				if (countProjectsAndPartners) {
					data.topFigures.partners.add(innerRow.partner);
					innerRow.projects
						.toString()
						.split(separator)
						.forEach(e => data.topFigures.projects.add(e));
					const foundPartnerTopFigure =
						data.topFigures.partnerFigures.find(
							e => e.partner === innerRow.partnerType
						);
					if (foundPartnerTopFigure) {
						foundPartnerTopFigure.value += innerRow.value;
						foundPartnerTopFigure.fund.add(fundType);
					} else {
						const fundSet = new Set();
						fundSet.add(fundType);
						data.topFigures.partnerFigures.push({
							partner: innerRow.partnerType,
							value: +innerRow.value,
							fund: fundSet,
						});
					}
				}
			});
		}
	}

	if (chartState.selectedYearCountryProfile.length > 1) {
		data.cbpfDataAggregated = data.cbpfDataAggregated.reduce(
			(acc, curr) => {
				const foundPartner = acc.find(
					e => e.partnerType === curr.partnerType
				);
				if (foundPartner) {
					foundPartner.value += curr.value;
				} else {
					acc.push(curr);
				}
				return acc;
			},
			[]
		);
	}

	data.cerfData.sort((a, b) => b.value - a.value);
	data.cbpfData.sort((a, b) => b.value - a.value);
	data.cbpfDataAggregated.sort((a, b) => b.value - a.value);

	return data;

	//end of processData
}

function setDefaultYear(originalData, yearsArrayCerf, yearsArrayCbpf) {
	const years =
		chartState.selectedFund === "total" ||
		chartState.selectedFund === "cerf/cbpf"
			? [...new Set(yearsArrayCerf.concat(yearsArrayCbpf))]
			: chartState.selectedFund === "cerf"
			? yearsArrayCerf
			: yearsArrayCbpf;
	let index = years.length;
	while (--index >= 0) {
		const cerfValue = originalData.cerf.find(e => e.year === years[index]);
		const cbpfValue = originalData.cbpf.find(e => e.year === years[index]);
		if (
			chartState.selectedFund === "total" ||
			chartState.selectedFund === "cerf/cbpf"
		) {
			if (cerfValue || cbpfValue) {
				chartState.selectedYearCountryProfile = [years[index]];
				break;
			}
		} else {
			const thisFundValue =
				chartState.selectedFund === "cerf" ? cerfValue : cbpfValue;
			if (thisFundValue) {
				chartState.selectedYearCountryProfile = [years[index]];
				break;
			}
		}
	}
}

function disableFunds(data, fundButtons) {
	["cerf", "cbpf"].forEach(fund => {
		const thisYearArray = data[fund].map(e => e.year);
		const fundInData = thisYearArray.some(year =>
			chartState.selectedYearCountryProfile.includes(year)
		);
		if (fund === chartState.selectedFund && !fundInData) {
			chartState.selectedFund = "total";
		}
		fundButtons
			.filter(d => d === fund)
			.style("opacity", fundInData ? 1 : fadeOpacityFundButton)
			.style("pointer-events", fundInData ? "all" : "none")
			.style("filter", fundInData ? null : "saturate(0%)");
	});
	fundButtons.classed("active", e => e === chartState.selectedFund);
}

function disableYears(data, yearsButtons) {
	if (
		chartState.selectedFund !== "total" &&
		chartState.selectedFund !== "cerf/cbpf"
	) {
		const thisYearArray = data[chartState.selectedFund].map(e => e.year);
		yearsButtons
			.style("opacity", d =>
				thisYearArray.includes(d) ? 1 : fadeOpacityFundButton
			)
			.style("pointer-events", d =>
				thisYearArray.includes(d) ? "all" : "none"
			)
			.style("filter", d =>
				thisYearArray.includes(d) ? null : "saturate(0%)"
			);
	} else {
		yearsButtons
			.style("opacity", 1)
			.style("pointer-events", "all")
			.style("filter", null);
	}
}

function createYearsList() {
	const yearsList = chartState.selectedYearCountryProfile
		.sort(function (a, b) {
			return a - b;
		})
		.reduce(function (acc, curr, index) {
			return (
				acc +
				(index >= chartState.selectedYearCountryProfile.length - 2
					? index > chartState.selectedYearCountryProfile.length - 2
						? curr
						: curr + " and "
					: curr + ", ")
			);
		}, "");
	return chartState.selectedYearCountryProfile.length > 4
		? "several years selected"
		: yearsList;
}

function recalculateDivWidth(data, barChartsDivCerf, barChartsDivCbpf) {
	if (data.cerfData.length && data.cbpfData.length) {
		barChartsDivCerf.style("width", "50%").style("display", null);
		barChartsDivCbpf.style("width", "50%").style("display", null);
	} else if (!data.cbpfData.length && data.cerfData.length) {
		barChartsDivCerf.style("width", "100%").style("display", null);
		barChartsDivCbpf.style("width", "0%").style("display", "none");
	} else if (!data.cerfData.length && data.cbpfData.length) {
		barChartsDivCerf.style("width", "0%").style("display", "none");
		barChartsDivCbpf.style("width", "100%").style("display", null);
	} else if (!data.cerfData.length && !data.cbpfData.length) {
		barChartsDivCerf.style("width", "0%").style("display", "none");
		barChartsDivCbpf.style("width", "0%").style("display", "none");
	}
}

function createYearsArray(originalData, fund) {
	return originalData[fund].map(d => d.year);
}

function applyColors(selection, colors) {
	selection.style(
		"color",
		chartState.selectedFund === "total" ||
			chartState.selectedFund === "cerf/cbpf"
			? colors.total
			: d3.color(colors[chartState.selectedFund]).darker(darkerValueText)
	);
}

function setChartStateTooltip(event, tooltip) {
	chartState.currentHoveredElement = event.currentTarget;
	chartState.currentTooltip = tooltip;
}

function mouseOut(tooltip) {
	tooltip.html(null).style("display", "none");
}

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1);
}

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	const result = d3.formatPrefix("." + digits + "~", value)(value);
	if (parseInt(result) === 1000) {
		const lastDigit = result[result.length - 1];
		const units = { k: "M", M: "B" };
		return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
	}
	return result;
}

function formatSIFloatNoZeroes(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits + "~", value)(value);
}

function parseTransform(translate) {
	const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
	group.setAttributeNS(null, "transform", translate);
	const matrix = group.transform.baseVal.consolidate().matrix;
	return [matrix.e, matrix.f];
}

function wrapTextTwoLines(text, width) {
	text.each(function () {
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
			tspan = text
				.text(null)
				.append("tspan")
				.attr("x", x)
				.attr("y", y)
				.attr("dy", dy + "em");
		while ((word = words.pop()) && counter < 2) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				counter++;
				line.pop();
				tspan.text(line.join(" ") + (counter < 2 ? "" : "..."));
				line = [word];
				if (counter < 2) {
					tspan = text
						.append("tspan")
						.attr("x", x)
						.attr("y", y)
						.attr("dy", ++lineNumber * lineHeight + dy + "em")
						.text(word);
					if (counter > 0)
						d3.select(tspan.node().previousSibling).attr(
							"dy",
							"-0.3em"
						);
				}
			}
		}
	});
}

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
		y: Math.pow(10, -24),
	};
	Object.keys(transformation).some(k => {
		if (s.indexOf(k) > 0) {
			returnValue = parseFloat(s.split(k)[0]) * transformation[k];
			return true;
		}
	});
	return returnValue;
}

export { createCountryProfileByPartner };
