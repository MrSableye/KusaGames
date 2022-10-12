const fs = require("fs");
const Scanner = require("n-readlines");
const utils = require("./functions/timeUtils.js");

function VideoDataManager(cfg) {
	this.filename = cfg.matchData;
	this.printCloseTimedMatches = false;
}

VideoDataManager.prototype.getJSON = function() {
	const scanner = new Scanner(this.filename);
	const output = {};

	let line;
	let currentVideoId = null;
	while(line = scanner.next()) {
		line = line.toString("UTF-8").trim();

		if(line.length === 0) {
			//Some kind of newline, skip, reset video id
			//Could be lf/cr/crlf
			currentVideoId = null;
			continue;
		}

		if(!currentVideoId) {
			//Process header info for video
			let split = line.split("\t").map(x => x.trim());
			currentVideoId = split[0];
			let obj = {
				"id": currentVideoId,
				"date": split[1],
				"platform": split[2],
				"tags": split[3] ? split[3].split("|") : [],
				"provIP": split[4] ? split[4] : null,
				"matches": [],
			};
			output[currentVideoId] = obj;
		} else {
			//Process match info
			let split = line.split("\t").map(x => x.trim());
			output[currentVideoId].matches.push({
				"orderIndex": output[currentVideoId].matches.length + 1,
				"time": parseInt(split[0]),
				"readableTime": utils.convertSecondsToReadable(split[0]),
				"p1char1": split[1],
				"p1char2": split[2],
				"p1char3": split[3],
				"p1char4": split[4],
				"p1name": split[5],
				"p1rank": split[6],
				"p2char1": split[7],
				"p2char2": split[8],
				"p2char3": split[9],
				"p2char4": split[10],
				"p2name": split[11],
				"p2rank": split[12],
				"map": split[13],
				"winner": split[14],
				"videoData": output[currentVideoId] // Circular
			});
		}
	}

	for(let vid in output) {
		let matches = output[vid].matches;
		matches.sort((a, b) => {
			return parseInt(a.time, 10) - parseInt(b.time, 10);
		});
	}

	return output;
};

VideoDataManager.prototype.saveData = function(json) {
	let str = "";

	for(let vid in json) {
		if(str.length !== 0) {
			str += "\n";
		}

		let data = json[vid];
		str += `${vid}\t${data.date}\t${data.platform}\t${data.tags.map(t => t.trim()).join("|")}\t${data.provIP||""}\n`;

		data.matches.sort((a, b) => {
			return a.time - b.time;
		});

		data.matches.forEach(m => {
			str += `${m.time}\t${m.p1char1}\t${m.p1char2}\t${m.p1char3}\t${m.p1char4}\t${m.p1name}\t${m.p1rank}\t`;
			str += `${m.p2char1}\t${m.p2char2}\t${m.p2char3}\t${m.p2char4}\t${m.p2name}\t${m.p2rank}\t${m.map}\t${m.winner}\n`;
		});
	}

	try {
		fs.writeFileSync(this.filename, str);
	} catch(e) {
		console.error("Error saving video data.", e);
	}
};

module.exports = VideoDataManager;