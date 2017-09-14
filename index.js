const axios = require("axios"),
	fs = require("fs"),
	config = require("./config.js");

// Get Attendees from Certain
const getAttendees = index => {
	const page = index ? `&start_index=${index}` : `&start_index=1`;
	return axios({
		url: `http://${config.baseURL}/certainExternal/service/v1/Registration/${config.accountCode}/${config.eventCode}?include_list=profile_questions,groups,registration_questions,travel_questions,financial,assistant,additional${page}`,
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Basic ${config.base64Password}`
		}
	});
};

// Loop through full attendee list and write to file
const startPull = async () => {
	try {
		const { data } = await getAttendees();
		console.log(data);
		const pullSize = data.completeCollectionSize;
		const reqPulls = Math.ceil(pullSize / data.maxResults);

		const registrations = [];
		registrations.push(data.registrations);
		for (let i = 2; i <= reqPulls; i++) {
			console.log(`Pulling index ${i} of ${reqPulls}`);
			const { data } = await getAttendees(i);
			registrations.push(data.registrations);
		}

		await fs.writeFile("dist/registrants.json", JSON.stringify(registrations));
		console.log(
			`Finished writing for ${pullSize} registrants over ${reqPulls} pulls.`
		);
	} catch (e) {
		console.log(e);
		console.log("Error getting attendees...");
	}
};

// Start Pull
startPull();
