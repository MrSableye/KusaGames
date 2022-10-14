const utils = require("./functions/timeUtils.js");

function MatchManger(server) {
	this.server = server;
}

MatchManger.prototype.validateAddEditVideoForm = function(form) {
	if(!form || Object.keys(form) === 0) {
		return "Nothing passed in.";
	}

	//Global tab chracter check
	for(let field in form) {
		if(form[field].toString().includes("\t")) {
			return "One of the fields contains an invalid character.";
		}
	}

	if(typeof form.vid !== "string" || form.vid.length !== 11) {
		return "Invalid video ID.";
	}

	if(!form.date) {
		return "Set the video date.";
	}

	if(typeof form.date !== "string" || !form.date.match(/\d{4}-\d{2}-\d{2}/) || isNaN(new Date(form.date).getTime())) {
		return "Invalid date.";
	}

	if(!form.platform) {
		return "Set if the video is Arcade or PC";
	}

	if(form.platform !== "A" && form.platform !== "PC") {
		return "Invalid platform value";
	}

	if(!form.tags || typeof form.tags !== "string") {
		form.tags = [];
	} else {
		form.tags = form.tags.replace(/\|+/g, "|").split("|").map(x => x.trim());
	}
};

MatchManger.prototype.editVideo = function(form, ip, auth) {
	let error = this.validateAddEditVideoForm(form);
	if(error) return error;

	let videoData = this.server.games[form.vid] || {};
	if(Object.keys(videoData).length === 0) {
		//New video
		let log = `Added ${auth ? "" : "provisional "}video\t`;
		log += `VideoID: ${form.vid}\t`;
		log += `Tags: ${form.tags}\t`;
		log += `Date: ${form.date}\t`;
		log += `Platform: ${form.platform}.`;
		this.server.logger.log(log, ip, auth);

		videoData.id = form.vid;
		videoData.date = form.date;
		videoData.platform = form.platform;
		videoData.tags = form.tags;
		videoData.provIP = auth ? null : ip;
		videoData.matches = [];
	} else if(!videoData.provIP && !auth) {
		return "Not authorised to edit a non-provisional video.";
	} else if(!auth && videoData.provIP && videoData.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	this.editVideoSpecificFields(videoData, form, ip, auth);

	this.server.games[form.vid] = videoData;

	return null;
};

MatchManger.prototype.addMatch = function(form, ip, auth) {
	let error = this.validateAddEditVideoForm(form);
	if(error) return error;
	error = this.validateAddEditMatchForm(form);
	if(error) return error;

	let videoData = this.server.games[form.vid] || {};

	if(Object.keys(videoData).length === 0) {
		//New video
		let log = `Added ${auth ? "" : "provisional "}video\t`;
		log += `VideoID: ${form.vid}\t`;
		log += `Tags: ${form.tags}\t`;
		log += `Date: ${form.date}\t`;
		log += `Platform: ${form.platform}.`;
		this.server.logger.log(log, ip, auth);

		videoData.id = form.vid;
		videoData.date = form.date;
		videoData.platform = form.platform;
		videoData.tags = form.tags;
		videoData.provIP = auth ? null : ip;
		videoData.matches = [];
	} else if(!videoData.provIP && !auth) {
		return "Not authorised to add a match to a non-provisional video.";
	} else if(!auth && videoData.provIP && videoData.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	this.editVideoSpecificFields(videoData, form, ip, auth);

	videoData.matches = videoData.matches || [];
	videoData.matches.push({
		"time": parseInt(form.time),
		"readableTime": utils.convertSecondsToReadable(form.time),
		"p1char1": form.p1char1,
		"p1char2": form.p1char2,
		"p1char3": form.p1char3,
		"p1char4": form.p1char4,
		"p1name1": form.p1name1,
		"p1name2": form.p1name2,
		"p1name3": form.p1name3,
		"p1name4": form.p1name4,
		"p1rank": form.p1rank,
		"p2char1": form.p2char1,
		"p2char2": form.p2char2,
		"p2char3": form.p2char3,
		"p2char4": form.p2char4,
		"p2name1": form.p2name1,
		"p2name2": form.p2name2,
		"p2name3": form.p2name3,
		"p2name4": form.p2name4,
		"p2rank": form.p2rank,
		"map": form.map,
		"winner": form.winner
	});

	videoData.matches.sort((a, b) => {
		return parseInt(a.time) - parseInt(b.time);
	});

	for(let i = 0; i < videoData.matches.length; i++) {
		videoData.matches[i].orderIndex = i + 1;
		videoData.matches[i].videoData = videoData;
	}

	this.server.games[form.vid] = videoData;

	let log = `Added ${auth ? "" : "provisional "}match\t`;
	log += `VideoID: ${form.vid}\t`;
	log += `Time: ${form.readableTime}\t`;
	log += `P1: [${form.p1char1}, ${form.p1char2}, ${form.p1char3}, ${form.p1char4}] [${form.p1name1}, ${form.p1name2}, ${form.p1name3}, ${form.p1name4}] ${form.p1rank}\t`;
	log += `P2: [${form.p2char1}, ${form.p2char2}, ${form.p2char3}, ${form.p2char4}] [${form.p2name1}, ${form.p2name2}, ${form.p2name3}, ${form.p2name4}] ${form.p2rank}\t`;
	log += `Map: ${form.map}\t`;
	log += `Winner: ${form.winner}.`;
	this.server.logger.log(log, ip, auth);

	return null;
};

MatchManger.prototype.editMatch = function(form, ip, auth) {
	let error = this.validateAddEditVideoForm(form);
	if(error) return error;
	error = this.validateAddEditMatchForm(form, true);
	if(error) return error;

	let videoData = this.server.games[form.vid];
	if(!videoData.provIP && !auth) {
		return "Not authorised to edit a match on a non-provisional video.";
	} else if(!auth && videoData.provIP && videoData.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	this.editVideoSpecificFields(videoData, form, ip, auth);

	let match = videoData.matches.find(m => parseInt(m.orderIndex) === parseInt(form.orderIndex));
	if(!match) {
		return;
	}

	let log = `Modified ${auth ? "" : "provisional "}match\t`;
	log += `VideoID: ${form.vid}\t`;
	if(match.time !== form.time) {
		log += `Time from: ${match.time} to ${form.time}\t`;
		match.time = parseInt(form.time);
		match.readableTime = utils.convertSecondsToReadable(match.time);
	}
	if(match.p1char1 !== form.p1char1) {
		log += `P1 Char 1 from: ${match.p1char1} to ${form.p1char1}\t`;
		match.p1char1 = form.p1char1;
	}
	if(match.p1char2 !== form.p1char2) {
		log += `P1 Char 2 from: ${match.p1char2} to ${form.p1char2}\t`;
		match.p1char2 = form.p1char2;
	}
	if(match.p1char3 !== form.p1char3) {
		log += `P1 Char 3 from: ${match.p1char3} to ${form.p1char3}\t`;
		match.p1char3 = form.p1char3;
	}
	if(match.p1char4 !== form.p1char4) {
		log += `P1 Char 4 from: ${match.p1char4} to ${form.p1char4}\t`;
		match.p1char4 = form.p1char4;
	}
	if(match.p1name1 !== form.p1name1) {
		log += `P1 Name 1 from: ${match.p1name1} to ${form.p1name1}\t`;
		match.p1name1 = form.p1name1;
	}
	if(match.p1name2 !== form.p1name2) {
		log += `P1 Name 2 from: ${match.p1name2} to ${form.p1name2}\t`;
		match.p1name2 = form.p1name2;
	}
	if(match.p1name3 !== form.p1name3) {
		log += `P1 Name 3 from: ${match.p1name3} to ${form.p1name3}\t`;
		match.p1name3 = form.p1name3;
	}
	if(match.p1name4 !== form.p1name4) {
		log += `P1 Name 4 from: ${match.p1name4} to ${form.p1name4}\t`;
		match.p1name4 = form.p1name4;
	}
	if(match.p1rank !== form.p1rank) {
		log += `P1 Rank from: ${match.p1rank} to ${form.p1rank}\t`;
		match.p1rank = form.p1rank;
	}
	if(match.p2char1 !== form.p2char1) {
		log += `P2 Char 1 from: ${match.p2char1} to ${form.p2char1}\t`;
		match.p2char1 = form.p2char1;
	}
	if(match.p2char2 !== form.p2char2) {
		log += `P2 Char 2 from: ${match.p2char2} to ${form.p2char2}\t`;
		match.p2char2 = form.p2char2;
	}
	if(match.p2char3 !== form.p2char3) {
		log += `P2 Char 3 from: ${match.p2char3} to ${form.p2char3}\t`;
		match.p2char3 = form.p2char3;
	}
	if(match.p2char4 !== form.p2char4) {
		log += `P2 Char 4 from: ${match.p2char4} to ${form.p2char4}\t`;
		match.p2char4 = form.p2char4;
	}
	if(match.p2name1 !== form.p2name1) {
		log += `P2 Name 1 from: ${match.p2name1} to ${form.p2name1}\t`;
		match.p2name1 = form.p2name1;
	}
	if(match.p2name2 !== form.p2name2) {
		log += `P2 Name 2 from: ${match.p2name2} to ${form.p2name2}\t`;
		match.p2name2 = form.p2name2;
	}
	if(match.p2name3 !== form.p2name3) {
		log += `P2 Name 3 from: ${match.p2name3} to ${form.p2name3}\t`;
		match.p2name3 = form.p2name3;
	}
	if(match.p2name4 !== form.p2name4) {
		log += `P2 Name 4 from: ${match.p2name4} to ${form.p2name4}\t`;
		match.p2name4 = form.p2name4;
	}
	if(match.p2rank !== form.p2rank) {
		log += `P2 Rank from: ${match.p2rank} to ${form.p2rank}\t`;
		match.p2rank = form.p2rank;
	}
	if(match.map !== form.map) {
		log += `Map from: ${match.map} to ${form.map}\t`;
		match.map = form.map;
	}
	if(match.winner !== form.winner) {
		log += `Winner from: ${match.winner} to ${form.winner}\t`;
		match.winner = form.winner;
	}
	this.server.logger.log(log.trim(), ip, auth);

	videoData.matches.sort((a, b) => {
		return parseInt(a.time) - parseInt(b.time);
	});

	for(let i = 0; i < videoData.matches.length; i++) {
		videoData.matches[i].orderIndex = i + 1;
		videoData.matches[i].videoData = videoData;
	}
};

MatchManger.prototype.editVideoSpecificFields = function(videoData, form, ip, auth) {
	if(videoData.date !== form.date) {
		let log = "Modified video\t";
		log += `VideoID: ${form.vid}\t`;
		log += `Date From: ${videoData.date}\t`;
		log += `Date To: ${form.date}.`;
		this.server.logger.log(log, ip, auth);

		videoData.date = form.date;
	}

	if(videoData.tags.toString() !== form.tags.toString()) {
		let log = "Modified video\t";
		log += `VideoID: ${form.vid}\t`;
		log += `Tags From: ${videoData.tags.toString()}\t`;
		log += `Tags To: ${form.tags.toString()}.`;
		this.server.logger.log(log, ip, auth);

		videoData.tags = form.tags;
	}

	if(videoData.platform !== form.platform) {
		let log = "Modified video\t";
		log += `VideoID: ${form.vid}\t`;
		log += `Platform From: ${videoData.platform}\t`;
		log += `Platform To: ${form.platform}.`;
		this.server.logger.log(log, ip, auth);

		videoData.platform = form.platform;
	}
};

MatchManger.prototype.deleteMatch = function(form, ip, auth) {
	if(!this.server.games[form.vid]) {
		return "Invalid video ID.";
	}
	if(typeof form.time !== "number" || form.time < 0) {
		return "Invalid match time.";
	}
	let video = this.server.games[form.vid];

	if(!video.provIP && !auth) {
		return "Not authorised to delete a match on a non-provisional video.";
	} else if(!auth && video.provIP && video.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	for(let i = 0; i < video.matches.length; i++) {
		let m = video.matches[i];
		if(m.time === form.time) {
			let log = `Deleted ${auth ? "" : "provisional "}match\t`;
			log += `VideoID: ${form.vid}\t`;
			log += `Time: ${m.time}\t`;
			log += `P1: [${m.p1char1}, ${m.p1char2}, ${m.p1char3}, ${m.p1char4}] [${m.p1name1}, ${m.p1name2}, ${m.p1name3}, ${m.p1name4}] ${m.p1rank}\t`;
			log += `P2: [${m.p2char1}, ${m.p2char2}, ${m.p2char3}, ${m.p2char4}] [${m.p2name1}, ${m.p2name2}, ${m.p2name3}, ${m.p2name4}] ${m.p2rank}\t`;
			log += `Map: ${m.map}\t`;
			log += `Winner: ${m.winner}.`;
			this.server.logger.log(log, ip, auth);

			video.matches.splice(i, 1);
			break;
		}
	}

	if(video.matches.length === 0) {
		delete this.server.games[form.vid];
		return null;
	}

	for(let i = 0; i < video.matches.length; i++) {
		video.matches[i].orderIndex = i + 1;
	}

	return null;
};

MatchManger.prototype.validateAddEditMatchForm = function(form, skipCloseTimeCheck) {
	if(parseInt(form.time).toString() !== form.time.toString() || parseInt(form.time) < 0) {
		return "Invalid time.";
	}
	if(!form.p1char1) {
		return "Select player 1 character 1.";
	}
	if(!this.server.charMap[form.p1char1]) {
		return "Select player 1 character 1.";
	}
	if(!form.p1char2) {
		return "Select player 1 character 2.";
	}
	if(!this.server.charMap[form.p1char2]) {
		return "Select player 1 character 2.";
	}
	if(!form.p1char3) {
		return "Select player 1 character 3.";
	}
	if(!this.server.charMap[form.p1char3]) {
		return "Select player 1 character 3.";
	}
	if(!form.p1char4) {
		return "Select player 1 character 4.";
	}
	if(!this.server.charMap[form.p1char4]) {
		return "Select player 1 character 4.";
	}
	if(!form.p1rank) {
		return "Select player 1 rank.";
	}
	if(!this.server.rankMap[form.p1rank]) {
		return "Select player 1 rank.";
	}
	if(!form.p2char1) {
		return "Select player 2 character 1.";
	}
	if(!this.server.charMap[form.p2char1]) {
		return "Select player 2 character 1.";
	}
	if(!form.p2char2) {
		return "Select player 2 character 2.";
	}
	if(!this.server.charMap[form.p2char2]) {
		return "Select player 2 character 2.";
	}
	if(!form.p2char3) {
		return "Select player 2 character 3.";
	}
	if(!this.server.charMap[form.p2char3]) {
		return "Select player 2 character 3.";
	}
	if(!form.p2char4) {
		return "Select player 2 character 4.";
	}
	if(!this.server.charMap[form.p2char4]) {
		return "Select player 2 character 4.";
	}
	if(!form.p2rank) {
		return "Select player 2 rank.";
	}
	if(!this.server.rankMap[form.p2rank]) {
		return "Select player 2 rank.";
	}
	if(!form.map) {
		return "Select a map.";
	}
	if(!this.server.mapMap[form.map]) {
		return "Select a map.";
	}
	if(form.winner !== "1" && form.winner !== "2" && form.winner !== "D") {
		return "Select the winner of the match.";
	}

	//Existing close match test
	if(!skipCloseTimeCheck && this.server.games[form.vid]) {
		let closeMatch = this.server.games[form.vid].matches.find(match => {
			let diff = Math.abs(match.time - parseInt(form.time));
			if(diff < 10) {
				return true;
			}
		});

		if(closeMatch) {
			return "There is already a match within 10 seconds.";
		}
	}

	if(!form.p1name1) {
		form.p1name1 = "";
	}
	if(!form.p1name2) {
		form.p1name2 = "";
	}
	if(!form.p1name3) {
		form.p1name3 = "";
	}
	if(!form.p1name4) {
		form.p1name4 = "";
	}
	if(!form.p2name1) {
		form.p2name1 = "";
	}
	if(!form.p2name2) {
		form.p2name2 = "";
	}
	if(!form.p2name3) {
		form.p2name3 = "";
	}
	if(!form.p2name4) {
		form.p2name4 = "";
	}

	return null;
};

module.exports = MatchManger;
