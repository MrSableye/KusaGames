const DEFAULT_SEARCH = {
	page: 1,
	p1char1: "",
	p1char2: "",
	p1char3: "",
	p1char4: "",
	p1name1: "",
	p1name2: "",
	p1name3: "",
	p1name4: "",
	p1rank: "",
	p2char1: "",
	p2char2: "",
	p2char3: "",
	p2char4: "",
	p2name1: "",
	p2name2: "",
	p2name3: "",
	p2name4: "",
	p2rank: "",
	map: "",
	winner: "",
	platform: ""
};

function SearchManager(cfg) {
	this.resultsPerPage = cfg.resultsPerPage;
};

SearchManager.prototype.search = function(data, form) {
	let searchQuery = {
		page: parseInt(form.page) || DEFAULT_SEARCH.page,
		p1char1: form.p1char1 || DEFAULT_SEARCH.p1char1,
		p1char2: form.p1char2 || DEFAULT_SEARCH.p1char2,
		p1char3: form.p1char3 || DEFAULT_SEARCH.p1char3,
		p1char4: form.p1char4 || DEFAULT_SEARCH.p1char4,
		p1name1: form.p1name1 || DEFAULT_SEARCH.p1name1,
		p1name2: form.p1name2 || DEFAULT_SEARCH.p1name2,
		p1name3: form.p1name3 || DEFAULT_SEARCH.p1name3,
		p1name4: form.p1name4 || DEFAULT_SEARCH.p1name4,
		p1rank: form.p1rank || DEFAULT_SEARCH.p1rank,
		p2char1: form.p2char1 || DEFAULT_SEARCH.p2char1,
		p2char2: form.p2char2 || DEFAULT_SEARCH.p2char2,
		p2char3: form.p2char3 || DEFAULT_SEARCH.p2char3,
		p2char4: form.p2char4 || DEFAULT_SEARCH.p2char4,
		p2name1: form.p2name1 || DEFAULT_SEARCH.p2name1,
		p2name2: form.p2name2 || DEFAULT_SEARCH.p2name2,
		p2name3: form.p2name3 || DEFAULT_SEARCH.p2name3,
		p2name4: form.p2name4 || DEFAULT_SEARCH.p2name4,
		p2rank: form.p2rank || DEFAULT_SEARCH.p2rank,
		map: form.map || DEFAULT_SEARCH.map,
		winner: form.winner || DEFAULT_SEARCH.winner,
		platform: form.platform || DEFAULT_SEARCH.platform
	};
	let foundMatches = [];

	for(let videoId in data) {
		let videoData = data[videoId];

		if(videoData.provIP) {
			continue;
		}

		if(form.vid && form.vid.length === 11 && videoData.id !== form.vid) {
			continue;
		}
		if(form.tag && !videoData.tags.includes(form.tag)) {
			continue;
		}

		//Check video platform
		if(searchQuery.platform === "A" && videoData.platform === "PC") {
			continue;
		} else if(searchQuery.platform === "PC" && videoData.platform === "A") {
			continue;
		}

		for(let i = 0; i < videoData.matches.length; i++) {
			let match = videoData.matches[i];
			if(matchTest(match, searchQuery)) {
				foundMatches.push(match);
			}
		}

	}

	//Sort matches by video date, and then by order idx in the video
	foundMatches.sort((a, b) => {
		let ad = new Date(a.videoData.date).getTime();
		let bd = new Date(b.videoData.date).getTime();
		let diff = bd - ad;

		//Multiple videos can be in the same date, consistently sort them by id
		if(diff === 0) {
			diff = b.videoData.id.localeCompare(a.videoData.id);
		}

		//Multiple matches can be in the video, sort them by their order
		if(diff === 0) {
			diff = a.orderIndex - b.orderIndex;
		}

		return diff;
	});

	let startIdx = (searchQuery.page - 1) * this.resultsPerPage;

	return {
		"page": searchQuery.page,
		"total": foundMatches.length,
		"matches": foundMatches.splice(startIdx, this.resultsPerPage)
	};
};

function matchTest(mData, sq) {
	let p1charset = frequencySet([mData.p1char1, mData.p1char2, mData.p1char3, mData.p1char4]);
	let p1nameset = frequencySet([mData.p1name1, mData.p1name2, mData.p1name3, mData.p1name4])
	let p1set = Object.keys(p1charset).length || Object.keys(p1nameset).length || sq.p1rank.length;
	let p2charset = frequencySet([mData.p2char1, mData.p2char2, mData.p2char3, mData.p2char4]);
	let p2nameset = frequencySet([mData.p2name1, mData.p2name2, mData.p2name3, mData.p2name4])
	let p2set = Object.keys(p2charset).length || Object.keys(p2nameset).length || sq.p2rank.length;

	let p1sqchars = frequencySet([sq.p1char1, sq.p1char2, sq.p1char3, sq.p1char4]);
	let p1sqnames = frequencySet([sq.p1name1, sq.p1name2, sq.p1name3, sq.p1name4]);
	let p2sqchars = frequencySet([sq.p2char1, sq.p2char2, sq.p2char3, sq.p2char4]);
	let p2sqnames = frequencySet([sq.p2name1, sq.p2name2, sq.p2name3, sq.p2name4]);

	if (sq.map.length > 0) {
		if (sq.map !== mData.map) {
			return false;
		}
	}

	if(p1set) {
		if(p2set) {
			let p1 = playerMatches(p1charset, p1nameset, mData.p1rank, p1sqchars, p1sqnames, sq.p1rank);
			let p2 = playerMatches(p2charset, p2nameset, mData.p2rank, p2sqchars, p2sqnames, sq.p2rank);
			//Swapped:
			let p1asp2 = playerMatches(p2charset, p2nameset, mData.p2rank, p1sqchars, p1sqnames, sq.p1rank);
			let p2asp1 = playerMatches(p1charset, p1nameset, mData.p1rank, p2sqchars, p2sqnames, sq.p2rank);

			if(p1 && p2) {
				//Normal match
				let p1Char = frequencySetToKey(p1sqchars) + frequencySetToKey(p1sqnames) + sq.p1rank;
				let p2Char = frequencySetToKey(p2sqchars) + frequencySetToKey(p2sqnames) + sq.p2rank;
				if(p1Char !== p2Char) {
					//Characters are different, so sq.winner is important
					if(sq.winner === "1" && mData.winner !== "1") {
						//Only p1 winner allowed, no p2 or draw
						return false;
					} else if(sq.winner === "2" && mData.winner !== "2") {
						//Only p2 winner allowed, no p1 or draw
						return false;
					}
				}
				//Sides don't matter for draws
				if(sq.winner === "D" && mData.winner !== "D") {
					return false;
				}
			} else if(p1asp2 && p2asp1) {
				//Swapped match
				let p1Char = frequencySetToKey(p1sqchars) + frequencySetToKey(p1sqnames) + sq.p1rank;
				let p2Char = frequencySetToKey(p2sqchars) + frequencySetToKey(p2sqnames) + sq.p2rank;
				if(p1Char !== p2Char) {
					//Characters are different, so sq.winner is important
					if(sq.winner === "1" && mData.winner !== "2") {
						//We are searching for p1 winner, but in reality we want p2 to be a winner
						return false;
					} else if(sq.winner === "2" && mData.winner !== "1") {
						//We are searching for p2 winner, but in reality we want p1 to be a winner
						return false;
					}
				}
				//Sides don't matter for draws
				if(sq.winner === "D" && mData.winner !== "D") {
					return false;
				}
			} else {
				//No match
				return false;
			}
		} else {
			//Only p1 search
			let p1 = playerMatches(p1charset, p1nameset, mData.p1rank, p1sqchars, p1sqnames, sq.p1rank);
			let p1asp2 = playerMatches(p2charset, p2nameset, mData.p2rank, p1sqchars, p1sqnames, sq.p1rank);
			if(p1) {
				//Winner check
				if(sq.winner === "1" && mData.winner !== "1") {
					//Only p1 winner allowed, no p2 or draw
					return false;
				} else if(sq.winner === "2" && mData.winner !== "2") {
					//Only p2 winner allowed, no p1 or draw
					return false;
				} else if(sq.winner === "D" && mData.winner !== "D") {
					//Sides don't matter for draws
					return false;
				}
			} else if(p1asp2) {
				//Winner check reversed
				if(sq.winner === "1" && mData.winner !== "2") {
					//We are searching for p1 winner, but in reality we want p2 to be a winner
					return false;
				} else if(sq.winner === "2" && mData.winner !== "1") {
					//We are searching for p2 winner, but in reality we want p1 to be a winner
					return false;
				} else if(sq.winner === "D" && mData.winner !== "D") {
					//Sides don't matter for draws
					return false;
				}
			} else {
				//Player 1 is set, but no match
				return false;
			}
		}
	} else if(p2set) {
		//Reverse search
		//Only p2 search
		let p2 = playerMatches(p2charset, p2nameset, mData.p2rank, p2sqchars, p2sqnames, sq.p2rank);
		let p2asp1 = playerMatches(p1charset, p1nameset, mData.p1rank, p2sqchars, p2sqnames, sq.p2rank);
		if(p2) {
			//Winner check
			if(sq.winner === "1" && mData.winner !== "1") {
				//Only p1 winner allowed, no p2 or draw
				return false;
			} else if(sq.winner === "2" && mData.winner !== "2") {
				//Only p2 winner allowed, no p1 or draw
				return false;
			} else if(sq.winner === "D" && mData.winner !== "D") {
				//Sides don't matter for draws
				return false;
			}
		} else if(p2asp1) {
			//Winner check reversed
			if(sq.winner === "1" && mData.winner !== "2") {
				//We are searching for p1 winner, but in reality we want p2 to be a winner
				return false;
			} else if(sq.winner === "2" && mData.winner !== "1") {
				//We are searching for p2 winner, but in reality we want p1 to be a winner
				return false;
			} else if(sq.winner === "D" && mData.winner !== "D") {
				//Sides don't matter for draws
				return false;
			}
		} else {
			//Player 2 is set, but no match
			return false;
		}
	} else {
		//Chars are not set, sides don't matter, but draws do
		if(sq.winner === "D" && mData.winner !== "D") {
			return false;
		}
		//Also if side is picked no draws are allows
		if(sq.winner === "1" || sq.winner === "2") {
			if(mData.winner === "D") {
				return false;
			}
		}
	}

	return true;
}

function playerMatches(mCharSet, mNameSet, mRank, sqCharSet, sqNameSet, sqRank) {
	//Player character check
	for(let sqChar of Object.keys(sqCharSet)) {
		if (!sqChar.length) continue;
		let sqCharFreq = sqCharSet[sqChar] || 0;
		let mCharFreq = mCharSet[sqChar] || 0;

		if (mCharFreq < sqCharFreq) {
			return false;
		}
	}

	//Player name check
	for(let sqName of Object.keys(sqNameSet)) {
		if (!sqName.length) continue;
		let sqNameFreq = sqNameSet[sqName] || 0;
		let mNameFreq = mNameSet[sqName] || 0;

		if (mNameFreq < sqNameFreq) {
			return false;
		}
	}

	//Player rank check
	if(sqRank.length > 0) {
		if(sqRank !== mRank) {
			return false;
		}
	}

	return true;
}

function frequencySet(items) {
	let frequencySet = {};
	items.forEach((items) => {
		frequencySet[items] = (frequencySet[items] || 0) + 1;
	});
	return frequencySet;
}

function frequencySetToKey(freqSet) {
	let items = [];
	for(let item of Object.keys(freqSet)) {
		for(let i = 0; i < freqSet[item]; i++) {
			items.push(item);
		}
	}
	return items.sort().join(':');
}

module.exports = SearchManager;
