//|Initial parameters
const parameters = {
	chart: "allocationsByCountry", //chart displayed when the page loads
	fund: "total", //type of fund: total, cerf/cbpf, cerf, cbpf
	showClosedFunds: true, //show or hide closed funds
	cerfFirstYear: null, //if 'null' the first year will be the first year in the data
	cbpfFirstYear: null, //if 'null' the first year will be the first year in the data
	countryProfile: null //selected country in the country profile section. Use the numeric country ID.
};

export { parameters };