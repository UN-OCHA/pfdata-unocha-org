//|Options buttons
import { chartState } from "./chartstate.js";

const generalClassPrefix = "pfbihp",
	allocationsBySectorDataUrl = "https://cbpfgms.github.io/pfbi-data/download/pfmb_allocations.csv",
	allocationsDataUrl = "https://cbpfgms.github.io/pfbi-data/download/full_pfmb_allocations.csv",
	contributionsDataUrl = "https://cbpfgms.github.io/pfbi-data/download/pfmb_contributions.csv",
	helpPortalUrl = "https://gms.unocha.org/content/pooled-funds-business-intelligence",
	dateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
	sidenavWidth = document.getElementById("layoutSidenav_nav").offsetWidth;

const buttonsObject = {
	timer: null,
	playing: false,
	createButtons(containerSelection, yearsArrayAllocations, yearsArrayAllocationsCerf, yearsArrayAllocationsCbpf, yearsArrayContributions, duration, selections, rawAllocationsData, lists) {

		const helpIcon = containerSelection.append("button")
			.attr("id", generalClassPrefix + "HelpButton");

		const downloadIcon = containerSelection.append("button")
			.attr("id", generalClassPrefix + "DownloadButton");

		const playIcon = containerSelection.append("button")
			.datum({
				clicked: false
			})
			.attr("id", generalClassPrefix + "PlayButton");

		const snapshotTooltip = selections.chartContainerDiv.append("div")
			.attr("id", generalClassPrefix + "SnapshotTooltip")
			.attr("class", generalClassPrefix + "SnapshotContent")
			.style("display", "none")
			.on("mouseleave", () => {
				chartState.isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				if (chartState.currentTooltip) chartState.currentTooltip.style("display", "none");
				if (chartState.currentHoveredElement) d3.select(chartState.currentHoveredElement).dispatch("mouseout");
			});

		snapshotTooltip.append("p")
			.attr("id", generalClassPrefix + "SnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", () => {
				chartState.isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				createSnapshot("pdf", true, selections);
			});

		snapshotTooltip.append("p")
			.attr("id", generalClassPrefix + "SnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", () => {
				chartState.isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				createSnapshot("png", true, selections);
			});

		selections.chartContainerDiv.on("contextmenu", event => {
			event.preventDefault();
			const thisMouse = d3.pointer(event);
			chartState.isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] + sidenavWidth - 4 + "px");
		});

		const snapshotDiv = containerSelection.append("div")
			.attr("class", generalClassPrefix + "SnapshotDiv");

		const snapshotIcon = snapshotDiv.append("button")
			.attr("id", generalClassPrefix + "SnapshotButton");

		const snapshotContent = snapshotDiv.append("div")
			.attr("class", generalClassPrefix + "SnapshotContent");

		helpIcon.html("HELP  ")
			.append("span")
			.attr("class", "fas fa-info");

		downloadIcon.html(".CSV  ")
			.append("span")
			.attr("class", "fas fa-download");

		playIcon.html("PLAY  ")
			.append("span")
			.attr("class", "fas fa-play");

		snapshotIcon.html("IMAGE ")
			.append("span")
			.attr("class", "fas fa-camera");

		const pdfSpan = snapshotContent.append("p")
			.attr("id", generalClassPrefix + "SnapshotPdfText")
			.html("Download PDF")
			.on("click", () => createSnapshot("pdf", false, selections));

		const pngSpan = snapshotContent.append("p")
			.attr("id", generalClassPrefix + "SnapshotPngText")
			.html("Download Image (PNG)")
			.on("click", () => createSnapshot("png", false, selections));

		snapshotDiv.on("mouseover", () => snapshotContent.style("display", "block"))
			.on("mouseout", () => snapshotContent.style("display", "none"));

		helpIcon.on("click", () => {
			window.open(helpPortalUrl, "help_portal");
		});

		downloadIcon.on("click", () => {
			if (chartState.selectedChart.includes("contributions")) {
				window.open(contributionsDataUrl, "_blank");
			} else if (chartState.selectedChart === "allocationsBySector") {
				window.open(allocationsBySectorDataUrl, "_blank");
			} else if (chartState.selectedChart === "countryProfile") {
				const countryData = rawAllocationsData.filter(e => e.PooledFundId === chartState.selectedCountryProfile);
				const csv = createCountryCsv(countryData, lists);
				const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
				const blobUrl = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.setAttribute("href", blobUrl);
				link.setAttribute("download", lists.fundNamesList[chartState.selectedCountryProfile] + "_CountryProfile");
				link.style = "visibility:hidden";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(blob);
			} else {
				window.open(allocationsDataUrl, "_blank");
			};
		});

		playIcon.on("click", (_, d) => {
			d.clicked = !d.clicked;

			const thisYearArrayAllocations = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
				yearsArrayAllocations : chartState.selectedFund === "cerf" ? yearsArrayAllocationsCerf : yearsArrayAllocationsCbpf;

			const yearsArray = chartState.selectedChart !== "contributionsByCerfCbpf" ?
				JSON.parse(JSON.stringify(thisYearArrayAllocations)) :
				JSON.parse(JSON.stringify(yearsArrayContributions));

			playIcon.html(d.clicked ? "PAUSE " : "PLAY  ")
				.append("span")
				.attr("class", d.clicked ? "fas fa-pause" : "fas fa-play");

			if (d.clicked) {
				selections.buttonsOuterContainer.classed("options-btn-panel-fix", true)
					.classed("options-btn-panel", false);
				loopYears(yearsArray, selections);
				this.playing = true;
				this.timer = d3.interval(() => loopYears(yearsArray, selections), 3 * duration);
			} else {
				selections.buttonsOuterContainer.classed("options-btn-panel-fix", false)
					.classed("options-btn-panel", true);
				d3.select("#pfbihpyearNumberText").text("");
				this.playing = false;
				this.timer.stop();
			};
		});

		//end of createButtons
	}
};

function loopYears(yearsArray, selections) {
	if (chartState.selectedChart === "countryProfile") {
		const yearButtons = d3.select(".pfcpmainyearsButtonsDiv")
			.selectAll("button")
			.filter((_, i, n) => +d3.select(n[i]).style("opacity") === 1);
		const yearsArrayCountryProfile = yearButtons.data();
		let yearIndex = yearsArrayCountryProfile.indexOf(chartState.selectedYear);
		chartState.selectedYear = yearsArrayCountryProfile[++yearIndex % yearsArrayCountryProfile.length];
		d3.select("#pfbihpyearNumberText").text(chartState.selectedYear);
		const thisYearButton = yearButtons.filter(d => d === chartState.selectedYear);
		thisYearButton.dispatch("playButtonClick");
	} else {
		const index = yearsArray.indexOf(chartState.selectedYear);
		chartState.selectedYear = yearsArray[(index + 1) % yearsArray.length];
		d3.select("#pfbihpyearNumberText").text(chartState.selectedYear);
		if (chartState.selectedChart !== "contributionsByCerfCbpf") {
			selections.yearDropdown.selectAll("option")
				.property("selected", d => chartState.selectedYear === d);
			selections.yearDropdown.dispatch("change");
		} else {
			const yearButton = d3.select(".pfbiccyearButtonsDiv")
				.selectAll("button")
				.filter(d => d === chartState.selectedYear);
			yearButton.dispatch("click");
		};
	};
};

function createCountryCsv(countryData, lists) {

	const data = [];

	countryData.forEach(row => {
		data.push({
			Year: row.AllocationYear,
			"Fund": lists.fundTypesList[row.FundId].toUpperCase(),
			Sector: lists.clustersList[row.ClusterId],
			"Allocation Source": lists.allocationTypesList[row.AllocationSurceId],
			"Number of projects": row.NumbofProj,
			"Partner Type": lists.partnersList[row.OrganizatinonId],
			Budget: row.ClusterBudget
		})
	});

	return d3.csvFormat(data);
};

function createSnapshot(type, fromContextMenu, selections) {

	const downloadingDiv = d3.select("body").append("div")
		.style("position", "fixed")
		.attr("id", generalClassPrefix + "DownloadingDiv")
		.style("left", window.innerWidth / 2 - 100 + "px")
		.style("top", window.innerHeight / 2 - 100 + "px");

	const downloadingDivSvg = downloadingDiv.append("svg")
		.attr("class", generalClassPrefix + "DownloadingDivSvg")
		.attr("width", 200)
		.attr("height", 100);

	const downloadingDivText = "Downloading " + type.toUpperCase();

	createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

	const listOfStyles = [
		"font-size",
		"font-family",
		"font-weight",
		"fill",
		"stroke",
		"stroke-dasharray",
		"stroke-width",
		"opacity",
		"text-anchor",
		"text-transform",
		"shape-rendering",
		"letter-spacing",
		"white-space",
		"paint-order",
		"dominant-baseline"
	];

	//const imageDiv = selections.chartContainerDiv.node();

	let imageDiv;

	selections.chartContainerDiv.selectAll("svg")
		.each((_, i, n) => {
			const thisSize = n[i].getBoundingClientRect();
			n[i].setAttribute("width", thisSize.width);
			n[i].setAttribute("height", thisSize.height);
			setSvgStyles(n[i]);
		});

	//removing the CP dropdown list
	if (chartState.selectedChart === "countryProfile") {
		d3.select(".pfcpmaindropdownList").style("display", "none");
	};

	//change styles of long lists
	if (chartState.selectedChart === "countryProfile" && chartState.selectedCountryProfileTab === "Allocations by Partner") {
		d3.select(".pfbicpbypartnerpartnersDivCerf").style("overflow-y", "visible");
		d3.select(".pfbicpbypartnerpartnersDivCbpf").style("overflow-y", "visible");
		imageDiv = selections.chartContainerDiv.select(".pfcpmainchartDiv").node();
	} else if (chartState.selectedChart === "countryProfile" && chartState.selectedCountryProfileTab === "Allocations by Partner/Sector") {
		d3.select(".pfbicppspartnersDivCerf").style("overflow-y", "visible");
		d3.select(".pfbicppspartnersDivCbpf").style("overflow-y", "visible");
		imageDiv = selections.chartContainerDiv.select(".pfcpmainchartDiv").node();
	} else if (chartState.selectedChart === "countryProfile" && chartState.selectedCountryProfileTab === "Contributions by Donor") {
		d3.select(".pfbicpcontrchartContentCerf").select("img").style("display", "none");
		d3.select(".pfbicpcontrchartContentCbpf").style("overflow-y", "visible");
		imageDiv = selections.chartContainerDiv.select(".pfcpmainchartDiv").node();
	} else {
		imageDiv = selections.chartContainerDiv.node();
	};

	html2canvas(imageDiv).then(function(canvas) {

		removeProgressWheel();
		d3.select("#" + generalClassPrefix + "DownloadingDiv").remove();

		if (type === "png") {
			downloadSnapshotPng(canvas);
		} else {
			downloadSnapshotPdf(canvas, selections);
		};

		if (fromContextMenu && chartState.currentHoveredElement) d3.select(chartState.currentHoveredElement).dispatch("mouseout");

		//restore original styles
		if (chartState.selectedChart === "countryProfile") {
			d3.select(".pfcpmaindropdownList").style("display", null);
		};

		if (chartState.selectedChart === "countryProfile" && chartState.selectedCountryProfileTab === "Allocations by Partner") {
			d3.select(".pfbicpbypartnerpartnersDivCerf").style("overflow-y", null);
			d3.select(".pfbicpbypartnerpartnersDivCbpf").style("overflow-y", null);
		};

		if (chartState.selectedChart === "countryProfile" && chartState.selectedCountryProfileTab === "Allocations by Partner/Sector") {
			d3.select(".pfbicppspartnersDivCerf").style("overflow-y", null);
			d3.select(".pfbicppspartnersDivCbpf").style("overflow-y", null);
		};

		if (chartState.selectedChart === "countryProfile" && chartState.selectedCountryProfileTab === "Contributions by Donor") {
			d3.select(".pfbicpcontrchartContentCerf").select("img").style("display", null);
			d3.select(".pfbicpcontrchartContentCbpf").style("overflow-y", null);
		};

	});

	function setSvgStyles(node) {

		if (!node.style) return;

		let styles = getComputedStyle(node);

		for (let i = 0; i < listOfStyles.length; i++) {
			node.style[listOfStyles[i]] = styles[listOfStyles[i]];
		};

		for (let i = 0; i < node.childNodes.length; i++) {
			setSvgStyles(node.childNodes[i]);
		};
	};

	//end of createSnapshot
};

function downloadSnapshotPng(source) {

	const currentDate = new Date();

	const fileName = chartState.selectedChart + "_" + dateFormat(currentDate) + ".png";

	source.toBlob(function(blob) {
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		if (link.download !== undefined) {
			link.setAttribute("href", url);
			link.setAttribute("download", fileName);
			link.style = "visibility:hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			window.location.href = url;
		};
	});

};

function downloadSnapshotPdf(source, selections) {

	const pdfMargins = {
		top: 10,
		bottom: 16,
		left: 20,
		right: 30
	};

	let pdf,
		pdfHeight,
		pdfTextPosition;

	const point = 2.834646,
		sourceDimentions = selections.chartContainerDiv.node().getBoundingClientRect(),
		widthInMilimeters = 210 - pdfMargins.left * 2,
		heightInMilimeters = widthInMilimeters * (sourceDimentions.height / sourceDimentions.width),
		maxHeightInMilimeters = 180;


	if (heightInMilimeters > maxHeightInMilimeters) {
		pdfHeight = 297 + heightInMilimeters - maxHeightInMilimeters;
		pdf = new jsPDF({
			format: [210 * point, (pdfHeight) * point],
			unit: "mm"
		})
	} else {
		pdfHeight = 297;
		pdf = new jsPDF();
	};

	createLetterhead();

	const intro = pdf.splitTextToSize("", (210 - pdfMargins.left - pdfMargins.right), {
		fontSize: 12
	});

	const chartTitle = "";

	const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

	pdf.setTextColor(60);
	pdf.setFont('helvetica');
	pdf.setFontType("normal");
	pdf.setFontSize(12);
	pdf.text(pdfMargins.left, 48, intro);

	pdf.setTextColor(65, 143, 222);
	pdf.setFont('helvetica');
	pdf.setFontType("bold");
	pdf.setFontSize(16);
	pdf.text(chartTitle, pdfMargins.left, 65);

	pdf.setFontSize(12);

	const yearsText = "Selected year: ";

	pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
		fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
		"" + "</span></div>", pdfMargins.left, 70, {
			width: 210 - pdfMargins.left - pdfMargins.right
		},
		function(position) {
			pdfTextPosition = position;
		});

	pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

	const currentDate = new Date();

	pdf.save("AllocationFlow_" + dateFormat(currentDate) + ".pdf");

	function createLetterhead() {

		const footer = "© OCHA CBPF Section 2019 | For more information, please visit pfbi.unocha.org";

		pdf.setTextColor(60);
		pdf.setFont("arial");
		pdf.setFontType("normal");
		pdf.setFontSize(10);
		pdf.text(footer, pdfMargins.left, pdfHeight - pdfMargins.bottom + 10);

	};

	//end of downloadSnapshotPdf
};

function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
	const wheelGroup = thissvg.append("g")
		.attr("class", generalClassPrefix + "d3chartwheelGroup")
		.attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 5 + ")");

	const loadingText = wheelGroup.append("text")
		.attr("text-anchor", "middle")
		.style("font-family", "Roboto")
		.style("font-weight", "bold")
		.style("font-size", "12px")
		.attr("y", 48)
		.text(thistext);

	const arc = d3.arc()
		.outerRadius(25)
		.innerRadius(20);

	const wheel = wheelGroup.append("path")
		.datum({
			startAngle: 0,
			endAngle: 0
		})
		.attr("d", arc);

	transitionIn();

	function transitionIn() {
		wheel.transition()
			.duration(1000)
			.attrTween("d", function(d) {
				const interpolate = d3.interpolate(0, Math.PI * 2);
				return function(t) {
					d.endAngle = interpolate(t);
					return arc(d)
				}
			})
			.on("end", transitionOut)
	};

	function transitionOut() {
		wheel.transition()
			.duration(1000)
			.attrTween("d", function(d) {
				const interpolate = d3.interpolate(0, Math.PI * 2);
				return function(t) {
					d.startAngle = interpolate(t);
					return arc(d)
				}
			})
			.on("end", function(d) {
				d.startAngle = 0;
				transitionIn()
			})
	};

	//end of createProgressWheel
};

function removeProgressWheel() {
	const wheelGroup = d3.select("." + generalClassPrefix + "d3chartwheelGroup");
	wheelGroup.select("path").interrupt();
	wheelGroup.remove();
};

export { buttonsObject };