//|Chart state
const chartState = {
	selectedYearValue: null,
	selectedChartValue: null,
	selectedFundValue: null,
	selectedRegionValue: [],
	selectedClusterValue: [],
	selectedTypeValue: [],
	showNamesValue: false,
	currentTooltipValue: null,
	currentHoveredElementValue: null,
	isSnapshotTooltipVisibleValue: false,
	selectedCountryProfileValue: null,
	selectedCountryProfileTabValue: null
};

for (const key in chartState) {
	const actualKey = key.replace("Value", "");
	Object.defineProperty(chartState, actualKey, {
		get() {
			return this[key]
		},
		set(value) {
			this[key] = value
		}
	});
};

export { chartState };