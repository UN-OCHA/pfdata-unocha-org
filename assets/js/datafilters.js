const dataFilters = {
	contributionsData: {
		columns: [
			{
				name: "FiscalYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "PledgePaidDate",
				type: "string",
				filterFunction: str => /^\d{2}-\d{4}$/.test(str),
			},
			{
				name: "DonorId",
				type: "number",
				filterFunction: n => n > 0 && n <= 250, //the max ID in the donors master table plus some padding
			},
			{
				name: "PooledFundId",
				type: "number",
				filterFunction: n => n > 0 && n <= 300, //the max ID in the funds master table plus some padding
			},
			{
				name: "PledgeAmt",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
			{
				name: "PaidAmt",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
		],
	},
	allocationsData: {
		columns: [
			{
				name: "AllocationYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "PooledFundId",
				type: "number",
				filterFunction: n => n > 0 && n <= 300, //the max ID in the funds master table plus some padding
			},
			{
				name: "PartnerCode",
				type: "number",
				filterFunction: null,
			},
			{
				name: "OrganizatinonId",
				type: "number",
				filterFunction: n => n > 0 && n <= 4,
			},
			{
				name: "ClusterId",
				type: "number",
				filterFunction: n => n > 0 && n <= 17, //currently the max ID in the clusters master table
			},
			{
				name: "FundId",
				type: "number",
				filterFunction: n => n === 1 || n === 2, //two funds, CERF and CBPF
			},
			{
				name: "AllocationSourceId",
				type: "number",
				filterFunction: n => n > 0 && n <= 4,
			},
			{
				name: "ProjList",
				type: t =>
					typeof t === "number" ||
					(typeof t === "string" && t.includes("##")), //the value is either a number or, if a string, it has a separator "##"
				filterFunction: null,
			},
			{
				name: "NumbofProj",
				type: "number",
				filterFunction: null,
			},
			{
				name: "ClusterBudget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
		],
	},
	allocationsMonthlyData: {
		columns: [
			{
				name: "ApprovedDate",
				type: "string",
				filterFunction: str => /^\d{2}-\d{4}$/.test(str),
			},
			{
				name: "PooledFundName",
				type: "number",
				filterFunction: n => n > 0 && n <= 300, //the max ID in the funds master table plus some padding
			},
			{
				name: "FundType",
				type: "number",
				filterFunction: n => n === 1 || n === 2, //two funds, CERF and CBPF
			},
			{
				name: "Budget",
				type: "number",
				filterFunction: n => n >= 0, //the dollar value must not be negative
			},
		],
	},
	adminLevel1Data: {
		columns: [
			{
				name: "PooledFundId",
				type: "number",
				filterFunction: n => n > 0 && n <= 300, //the max ID in the funds master table plus some padding
			},
			{
				name: "AllocationSourceId",
				type: "number",
				filterFunction: n => n > 0 && n <= 4,
			},
			{
				name: "AllocationYear",
				type: "number",
				filterFunction: null,
			},
			{
				name: "AdminLocation1",
				type: "string",
				filterFunction: null,
			},
			{
				name: "AdminLocation1Latitude",
				type: "number",
				filterFunction: n => n >= -90 && n <= 90, //max and min latitude
			},
			{
				name: "AdminLocation1Longitude",
				type: "number",
				filterFunction: n => n >= -180 && n <= 180, //max and min longitude
			},
			{
				name: "AdminLocation1Budget",
				type: "number",
				filterFunction: null,
			},
			{
				name: "FundType",
				type: "number",
				filterFunction: n => n === 1 || n === 2, //two funds, CERF and CBPF
			},
		],
	},
};

export { dataFilters };
