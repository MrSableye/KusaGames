document.addEventListener("DOMContentLoaded", () => {
	let url = new URLSearchParams(location.search);
	let videoId = url.get("videoId")||null;
	new Editor(videoId);
});

function Editor(videoId) {
	this.PlayerLoaderForm = document.getElementById("PlayerLoaderForm");
	this.VideoURLInput = document.getElementById("VideoURLInput");
	this.PlayerLoadButton = document.getElementById("PlayerLoadButton");
	this.VideoDataForm = document.getElementById("VideoDataForm");
	this.NewMatchForm = document.getElementById("NewMatchForm");
	this.ResultsList = document.getElementById("ResultsList");
	this.PlayPauseButton = document.getElementById("PlayPauseButton");
	this.EnterTokenButton = document.getElementById("EnterTokenButton");

	this.P1Char1 = document.getElementById("P1Char1");
	this.P1Char2 = document.getElementById("P1Char2");
	this.P1Char3 = document.getElementById("P1Char3");
	this.P1Char4 = document.getElementById("P1Char4");
	this.P1Name = document.getElementById("P1Name");
	this.P1NameList = document.getElementById("p1name-list");
	this.P1Rank = document.getElementById("P1Rank");
	this.P2Char1 = document.getElementById("P2Char1");
	this.P2Char2 = document.getElementById("P2Char2");
	this.P2Char3 = document.getElementById("P2Char3");
	this.P2Char4 = document.getElementById("P2Char4");
	this.P2Name = document.getElementById("P2Name");
	this.P2NameList = document.getElementById("p2name-list");
	this.P2Rank = document.getElementById("P2Rank");
	this.VideoDate = document.getElementById("VideoDate");
	this.MapSelect = document.getElementById("MapSelect");
	this.WinnerSelect = document.getElementById("WinnerSelect");
	this.VideoTags = document.getElementById("VideoTags");
	this.PlatformSelect = document.getElementById("PlatformSelect");
	this.UpdateVideoDataButton = document.getElementById("UpdateVideoDataButton");
	this.ActionButton = document.getElementById("ActionButton");
	this.TimeRefreshButton = document.getElementById("TimeRefreshButton");
	this.CancelEditButton = document.getElementById("CancelEditButton");
	this.CancelEditContainer = document.getElementById("CancelEditContainer");
	this.EditorGuide = document.getElementById("EditorGuide");
	this.PlayerTip = document.getElementById("PlayerTip");

	this.time = 0;

	this.setupEvents();

	if(videoId) {
		window.addEventListener("load", () => {
			this.VideoURLInput.value = videoId;
			this.PlayerLoadButton.click();
		});
	}

	this._editingRow = null;
	this._editingOrderIndex = null;
}

Editor.prototype.setupEvents = function() {
	this.PlayerLoadButton.addEventListener("click", () => this.loadYoutubePlayer());
	
	let TimeChangeButtons = document.getElementsByClassName("timechange-button");
	for(let elem of TimeChangeButtons) {
		elem.addEventListener("click", () => {
			this.changeTime(parseInt(elem.dataset.timeshift));
		});
	}

	this.TimeRefreshButton.addEventListener("click", () => {
		if(this.YoutubePlayer && this.YoutubePlayer.getCurrentTime) {
			this.onTimeChange(Math.floor(this.YoutubePlayer.getCurrentTime()));
		} else {
			this.onTimeChange(0);
		}
	});

	this.PlayPauseButton.addEventListener("click", () => {
		let currentState = this.YoutubePlayer.getPlayerState();
		if(currentState === YT.PlayerState.PLAYING) {
			this.YoutubePlayer.pauseVideo();
		} else {
			this.YoutubePlayer.playVideo();
		}
	});

	this.UpdateVideoDataButton.addEventListener("click", () => {
		let obj = {
			vid: this.YoutubePlayer.getVideoData().video_id,
			date: this.VideoDate.value,
			platform: this.PlatformSelect.value,
			tags: this.VideoTags.value.trim()
		};

		fetch("/editVideo", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(obj)
		}).then(r => {
			if(r.status !== 200) {
				r.text().then(alert);
			} else {
				this.updateMatchList();
			}
		});
	});

	this.ActionButton.addEventListener("click", () => {
		if(this.ActionButton.innerText === "Add") {
			this.addMatch();
		} else {
			this.editMatch();
		}
	});

	this.CancelEditButton.addEventListener("click", () => {
		this.CancelEditContainer.setAttribute("hidden", 1);
		this.ActionButton.innerText = "Add";
		if(this._editingRow) {
			this._editingRow.classList.remove("editing");
			this._editingRow = null;
		}
	});

	this.EnterTokenButton.addEventListener("click", () => {
		var token = prompt("Enter your token:");
		document.cookie = "token=" + token;
		location.reload()
	});

	document.addEventListener("keydown", (e) => {
		if((e.key === "Control" || e.key === "Shift") && e.shiftKey && e.ctrlKey) {
			if(this.YoutubePlayer && this.YoutubePlayer.getCurrentTime) {
				this.onTimeChange(Math.floor(this.YoutubePlayer.getCurrentTime()));
			}
		}
	});
};

Editor.prototype.onTimeChange = function(time) {
	this.time = time;
	this.ActionButton.dataset.time = ConvertSecondsToReadable(this.time);
};

Editor.prototype.updatePlayerTipContent = function() {
	let unique = {};
	let table = document.getElementById("ResultsTable");
	if(!table) return;

	let tbody = table.tBodies[0];
	while(this.PlayerTip.children.length > 0) {
		this.PlayerTip.removeChild(this.PlayerTip.firstChild);
	}

	for(let row of tbody.rows) {
		let p1name = row.querySelector(".player-1 span").innerText.trim();
		if(p1name.length > 0) {
			let p1char1 = row.querySelector(".player-1 img.char1").dataset.char;
			let p1char2 = row.querySelector(".player-1 img.char2").dataset.char;
			let p1char3 = row.querySelector(".player-1 img.char3").dataset.char;
			let p1char4 = row.querySelector(".player-1 img.char4").dataset.char;
			let p1chars = SortChars(p1char1, p1char2, p1char3, p1char4);
			let p1rank = row.querySelector(".player-1 img.rank-img").dataset.rank;
			unique[p1chars.join(':')+p1name+p1rank] = {name: p1name, char1: p1char1, char2: p1char2, char3: p1char3, char4: p1char4, rank: p1rank};
		}
		let p2name = row.querySelector(".player-2 span").innerText.trim();
		if(p2name.length > 0) {
			let p2char1 = row.querySelector(".player-2 img.char1").dataset.char;
			let p2char2 = row.querySelector(".player-2 img.char2").dataset.char;
			let p2char3 = row.querySelector(".player-2 img.char3").dataset.char;
			let p2char4 = row.querySelector(".player-2 img.char4").dataset.char;
			let p2chars = SortChars(p2char1, p2char2, p2char3, p2char4);
			let p2rank = row.querySelector(".player-2 img.rank-img").dataset.rank;
			unique[p2chars.join(':')+p2name+p2rank] = {name: p2name, char1: p2char1, char2: p2char2, char3: p2char3, char4: p2char4, rank: p2rank};
		}
	}

	let arr = Object.values(unique);
	for(let obj of arr) {
		this.PlayerTip.appendChild(this.buildTipEntry(obj.char1, obj.char2, obj.char3, obj.char4, obj.name, obj.rank));
	}
};

Editor.prototype.buildTipEntry = function(char1, char2, char3, char4, name, rank) {
	let container = document.createElement("div");
	
	let p1button = document.createElement("button");
	p1button.innerText = "P1";
	p1button.classList = "ms-small ms-info";
	let p2button = document.createElement("button");
	p2button.innerText = "P2";
	p2button.classList = "ms-small ms-info";
	p1button.onclick = () => {
		this.P1Name.value = name;
		this.P1Char1.value = char1;
		this.P1Char2.value = char2;
		this.P1Char3.value = char3;
		this.P1Char4.value = char4;
		this.P1Rank.value = rank;
	};
	p2button.onclick = () => {
		this.P2Name.value = name;
		this.P2Char1.value = char1;
		this.P2Char2.value = char2;
		this.P2Char3.value = char3;
		this.P2Char4.value = char4;
		this.P2Rank.value = rank;
	};
	container.appendChild(p1button);
	container.appendChild(p2button);

	let char1Img = document.createElement("img");
	char1Img.src = `img/chars/${char1}.png`;
	let char2Img = document.createElement("img");
	char2Img.src = `img/chars/${char2}.png`;
	let char3Img = document.createElement("img");
	char3Img.src = `img/chars/${char3}.png`;
	let char4Img = document.createElement("img");
	char4Img.src = `img/chars/${char4}.png`;
	let playerName = document.createElement("span");
	playerName.innerText = name;
	let rankImg = document.createElement("img");
	rankImg.src = `img/ranks/${rank}.png`;
	container.appendChild(char1Img);
	container.appendChild(char2Img);
	container.appendChild(char3Img);
	container.appendChild(char4Img);
	container.appendChild(playerName);
	container.appendChild(rankImg);
	
	return container;
};

Editor.prototype.updateMatchList = function(vid) {
	if(!vid) {
		vid = this.YoutubePlayer.getVideoData().video_id;
	}

	fetch("/videoMatches?vid=" + vid)
	.then((r) => {
		r.json().then(json => {
			this.ResultsList.innerHTML = json.html || "";
			this.VideoDate.value = json.date || "";
			this.PlatformSelect.value = json.platform || "";
			this.VideoTags.value = json.tags ? json.tags.join("|") : "";

			//Go To buttons events
			let gotoButtons = document.getElementsByClassName("goto-button");
			for(let btn of gotoButtons) {
				btn.onclick = () => {
					this.goToTime(parseInt(btn.dataset.time));
				};
			}
			//Edit buttons
			let editButtons = document.getElementsByClassName("edit-button");
			for(let btn of editButtons) {
				btn.onclick = () => {
					this.editButtonPress(
						btn,
						parseInt(btn.dataset.idx),
						btn.dataset.p1char1,
						btn.dataset.p1char2,
						btn.dataset.p1char3,
						btn.dataset.p1char4,
						btn.dataset.p1name,
						btn.dataset.p1rank,
						btn.dataset.p2char1,
						btn.dataset.p2char2,
						btn.dataset.p2char3,
						btn.dataset.p2char4,
						btn.dataset.p2name,
						btn.dataset.p2rank,
						btn.dataset.map,
						btn.dataset.winner,
						parseInt(btn.dataset.time),
						btn.dataset.seek === "1"
					);
				};
			}
			//Delete buttons
			let deleteButtons = document.getElementsByClassName("delete-button");
			for(let btn of deleteButtons) {
				btn.onclick = () => {
					this.deleteMatch(parseInt(btn.dataset.time));
				};
			}

			this.updatePlayerTipContent();
		});
	});
};

Editor.prototype.editButtonPress = function(btn, idx, p1char1, p1char2, p1char3, p1char4, p1name, p1rank, p2char1, p2char2, p2char3, p2char4, p2name, p2rank, map, winner, time, seek) {
	this.ActionButton.innerText = "Edit";

	if(seek) {
		this.goToTime(time);
	}
	this.onTimeChange(time);

	this.P1Char1.value = p1char1;
	this.P1Char2.value = p1char2;
	this.P1Char3.value = p1char3;
	this.P1Char4.value = p1char4;
	this.P1Name.value = p1name;
	this.P1Rank.value = p1rank;
	this.P2Char1.value = p2char1;
	this.P2Char2.value = p2char2;
	this.P2Char3.value = p2char3;
	this.P2Char4.value = p2char4;
	this.P2Name.value = p2name;
	this.P2Rank.value = p2rank;
	this.MapSelect.value = map;
	this.WinnerSelect.value = winner;

	if(this._editingRow) {
		this._editingRow.classList.remove("editing");
	}
	this._editingRow = btn.closest("tr");
	this._editingRow.classList.add("editing");
	this.CancelEditContainer.removeAttribute("hidden");
	this._editingOrderIndex = idx;
	this.YoutubePlayer.getIframe().scrollIntoView();
};

Editor.prototype.editMatch = function() {
	this.CancelEditButton.click();
	let obj = {
		vid: this.YoutubePlayer.getVideoData().video_id,
		date: this.VideoDate.value,
		time: this.time,
		platform: this.PlatformSelect.value,
		orderIndex: this._editingOrderIndex,
		p1char1: this.P1Char1.value,
		p1char2: this.P1Char2.value,
		p1char3: this.P1Char3.value,
		p1char4: this.P1Char4.value,
		p1name: this.P1Name.value.trim(),
		p1rank: this.P1Rank.value,
		p2char1: this.P2Char1.value,
		p2char2: this.P2Char2.value,
		p2char3: this.P2Char3.value,
		p2char4: this.P2Char4.value,
		p2name: this.P2Name.value.trim(),
		p2rank: this.P2Rank.value,
		map: this.MapSelect.value,
		winner: this.WinnerSelect.value,
		tags: this.VideoTags.value.trim()
	};
	fetch("/editMatch", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(obj)
	}).then(r => {
		if(r.status !== 200) {
			r.text().then(alert);
		} else {
			this.updateMatchList();
		}
	});
};

Editor.prototype.deleteMatch = function(time) {
	let sure = confirm("You sure?");
	if(sure) {
		this.CancelEditButton.click();
		let vid = this.YoutubePlayer.getVideoData().video_id;
		let obj = {
			vid,
			time
		};
		fetch("/deleteMatch", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(obj)
		}).then(r => {
			if(r.status !== 200) {
				r.text().then(alert);
			} else {
				this.updateMatchList();
			}
		});
	}
};

Editor.prototype.goToTime = function(seconds) {
	this.YoutubePlayer.seekTo(seconds);
};

Editor.prototype.addMatch = function() {
	let obj = {
		vid: this.YoutubePlayer.getVideoData().video_id,
		date: this.VideoDate.value,
		time: this.time,
		readableTime: ConvertSecondsToReadable(this.time),
		platform: this.PlatformSelect.value,
		p1char1: this.P1Char1.value,
		p1char2: this.P1Char2.value,
		p1char3: this.P1Char3.value,
		p1char4: this.P1Char4.value,
		p1name: this.P1Name.value.trim(),
		p1rank: this.P1Rank.value,
		p2char1: this.P2Char1.value,
		p2char2: this.P2Char2.value,
		p2char3: this.P2Char3.value,
		p2char4: this.P2Char4.value,
		p2name: this.P2Name.value.trim(),
		p2rank: this.P2Rank.value,
		map: this.MapSelect.value,
		winner: this.WinnerSelect.value,
		tags: this.VideoTags.value.trim()
	};

	//Add names to the list, if they arent there yet
	this.addNameToLists(this.P1Name.value);
	this.addNameToLists(this.P2Name.value);

	fetch("/addMatch", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(obj)
	}).then(r => {
		if(r.status !== 200) {
			r.text().then(alert);
		} else {
			this.updateMatchList();
		}
	});
};

Editor.prototype.addNameToLists = function(name) {
	//Only using p1 list to find if already exists
	let options = this.P1NameList.options;
	for(let i = 0; i < options.length; i++) {
		if(name.toLowerCase() === options[i].value.toLowerCase()) {
			return; //Already exists
		}
	}

	let p1Option = document.createElement("option");
	p1Option.value = name;
	this.P1NameList.appendChild(p1Option);
	let p2Option = document.createElement("option");
	p2Option.value = name;
	this.P2NameList.appendChild(p2Option);
};

Editor.prototype.loadYoutubePlayer = function() {
	let id = GetVideoId(this.VideoURLInput.value);

	if(id.length !== 11) {
		return alert("Bad video URL.");
	}

	this.PlayerLoaderForm.setAttribute("hidden", 1);
	this.EditorGuide.setAttribute("hidden", 1);
	this.VideoDataForm.removeAttribute("hidden");
	this.NewMatchForm.removeAttribute("hidden");
	this.ResultsList.removeAttribute("hidden");

	this.YoutubePlayer = new YT.Player("YoutubePlayer", {
		height: "450",
		width: "1000",
		autoplay: true,
		rel: 0,
		videoId: id,
		events: {
			onReady: () => {
				this.YoutubePlayer.setVolume(10);
			}
		}
	});

	this.updateMatchList(id);
	window.history.pushState("","","?videoId=" + id);
};

Editor.prototype.changeTime = function(amount) {
	if(this.YoutubePlayer && this.YoutubePlayer.getCurrentTime) {
		let time = parseInt(this.YoutubePlayer.getCurrentTime());
		let newTime = time + amount;
		this.YoutubePlayer.seekTo(newTime);
	}
};

function GetVideoId(url) {
	let ID = null;

	if(url.length === 11) {
		url = "v=" + url;
	}

	url = url.replace(/(>|<)/gi, "").split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

	if(url[2] !== undefined) {
		ID = url[2].split(/[^0-9a-z_\-]/i);
		ID = ID[0];
	} else {
		ID = url;
	}

	return ID;
}

function ConvertSecondsToReadable(time) {
	time = parseInt(time, 10);

	if(time === 0) {
		return "0s";
	}

	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	while(true) {
		if(time >= 3600) {
			hours++;
			time -= 3600;
			continue;
		}
		if(time >= 60) {
			minutes++;
			time -= 60;
			continue;
		}
		seconds = time;
		break;
	}

	let str = "";
	if(hours > 0 || (minutes === 0 && seconds === 0)) {
		str += `${hours}h`;
	}
	if(minutes > 0 || (hours === 0 && seconds === 0)) {
		str += `${minutes}m`;
	}
	if(seconds > 0 || (minutes === 0 && hours === 0)) {
		str += `${seconds}s`;
	}

	return str;
}

function SortChars(char1, char2, char3, char4) {
	let chars = [char1, char2, char3, char4];
	chars.sort();
	return chars;
}