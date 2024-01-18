//|Initial parameters
const parameters = {
	chart: "allocationsByCountry", //chart displayed when the page loads. 
	//The accepted values are: "allocationsByCountry", "allocationsBySector", "allocationsByType", "allocationsByMonth", "contributionsByCerfCbpf" and "contributionsByDonor"
	fund: "total", //type of fund: total, cerf/cbpf, cerf, cbpf
	year: 2023, //if 'null' the year will be the current year
	showClosedFunds: false, //show or hide closed funds
	cerfFirstYear: null, //if 'null' the first year will be the first year in the data
	cbpfFirstYear: null, //if 'null' the first year will be the first year in the data
	countryProfile: null //selected country in the country profile section. Use the numeric country ID.
};

export { parameters };