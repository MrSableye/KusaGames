document.addEventListener("DOMContentLoaded", () => {
	let form = document.getElementById("form");
	let page = document.getElementById("page");
	let p1char1 = document.getElementById("p1char1");
	let p1char2 = document.getElementById("p1char2");
	let p1char3 = document.getElementById("p1char3");
	let p1char4 = document.getElementById("p1char4");
	let p1name1 = document.getElementById("p1name1");
	let p1name2 = document.getElementById("p1name2");
	let p1name3 = document.getElementById("p1name3");
	let p1name4 = document.getElementById("p1name4");
	let p1rank = document.getElementById("p1rank");
	let platform = document.getElementById("platform");
	let map = document.getElementById("map");
	let winner = document.getElementById("winner");
	let p2char1 = document.getElementById("p2char1");
	let p2char2 = document.getElementById("p2char2");
	let p2char3 = document.getElementById("p2char3");
	let p2char4 = document.getElementById("p2char4");
	let p2name1 = document.getElementById("p2name1");
	let p2name2 = document.getElementById("p2name2");
	let p2name3 = document.getElementById("p2name3");
	let p2name4 = document.getElementById("p2name4");
	let p2rank = document.getElementById("p2rank");
	let videoId = document.getElementById("videoId");
	let videoTag = document.getElementById("videoTag");

	//Strip names until search
	page.dataset.name = page.name;
	page.name = "";
	p1char1.dataset.name = p1char1.name;
	p1char1.name = "";
	p1char2.dataset.name = p1char2.name;
	p1char2.name = "";
	p1char3.dataset.name = p1char3.name;
	p1char3.name = "";
	p1char4.dataset.name = p1char4.name;
	p1char4.name = "";
	p1name1.dataset.name = p1name1.name;
	p1name1.name = "";
	p1name2.dataset.name = p1name2.name;
	p1name2.name = "";
	p1name3.dataset.name = p1name3.name;
	p1name3.name = "";
	p1name4.dataset.name = p1name4.name;
	p1name4.name = "";
	p1rank.dataset.name = p1rank.name;
	p1rank.name = "";
	platform.dataset.name = platform.name;
	platform.name = "";
	map.dataset.name = map.name;
	map.name = "";
	winner.dataset.name = winner.name;
	winner.name = "";
	p2char1.dataset.name = p2char1.name;
	p2char1.name = "";
	p2char2.dataset.name = p2char2.name;
	p2char2.name = "";
	p2char3.dataset.name = p2char3.name;
	p2char3.name = "";
	p2char4.dataset.name = p2char4.name;
	p2char4.name = "";
	p2name1.dataset.name = p2name1.name;
	p2name1.name = "";
	p2name2.dataset.name = p2name2.name;
	p2name2.name = "";
	p2name3.dataset.name = p2name3.name;
	p2name3.name = "";
	p2name4.dataset.name = p2name4.name;
	p2name4.name = "";
	p2rank.dataset.name = p2rank.name;
	p2rank.name = "";
	videoId.dataset.name = videoId.name;
	videoId.name = "";
	videoTag.dataset.name = videoTag.name;
	videoTag.name = "";

	p1char1.onchange = onFormChange;
	p1char2.onchange = onFormChange;
	p1char3.onchange = onFormChange;
	p1char4.onchange = onFormChange;
	p1name1.onchange = onFormChange;
	p1name2.onchange = onFormChange;
	p1name3.onchange = onFormChange;
	p1name4.onchange = onFormChange;
	p1rank.onchange = onFormChange;
	platform.onchange = onFormChange;
	map.onchange = onFormChange;
	winner.onchange = onFormChange;
	p2char1.onchange = onFormChange;
	p2char2.onchange = onFormChange;
	p2char3.onchange = onFormChange;
	p2char4.onchange = onFormChange;
	p2name1.onchange = onFormChange;
	p2name2.onchange = onFormChange;
	p2name3.onchange = onFormChange;
	p2name4.onchange = onFormChange;
	p2rank.onchange = onFormChange;
	videoId.onchange = onFormChange;
	videoTag.onchange = onFormChange;

	//Populate fields to the params
	let url = new URLSearchParams(location.search);
	page.value = url.get("page")||"1";
	p1char1.value = url.get("p1char1")||"";
	p1char2.value = url.get("p1char2")||"";
	p1char3.value = url.get("p1char3")||"";
	p1char4.value = url.get("p1char4")||"";
	p1name1.value = url.get("p1name1")||"";
	p1name2.value = url.get("p1name2")||"";
	p1name3.value = url.get("p1name3")||"";
	p1name4.value = url.get("p1name4")||"";
	p1rank.value = url.get("p1rank")||"";
	platform.value = url.get("platform")||"";
	map.value = url.get("map")||"";
	winner.value = url.get("winner")||"";
	p2char1.value = url.get("p2char1")||"";
	p2char2.value = url.get("p2char2")||"";
	p2char3.value = url.get("p2char3")||"";
	p2char4.value = url.get("p2char4")||"";
	p2name1.value = url.get("p2name1")||"";
	p2name2.value = url.get("p2name2")||"";
	p2name3.value = url.get("p2name3")||"";
	p2name4.value = url.get("p2name4")||"";
	p2rank.value = url.get("p2rank")||"";
	videoTag.value = url.get("tag")||"";
	videoId.value = url.get("vid")||"";
	
	//Search button
	document.getElementById("search-button").addEventListener("click", () => {
		updateFormNames();
		let hasValue = updateFormNames();
		if(!hasValue) {
			page.name = page.dataset.name;
			page.value = "1";
		}
		form.submit();
	});

	//Pagination
	let pages = document.querySelectorAll("a[data-page]");
	for(let pageBtn of pages) {
		pageBtn.addEventListener("click", () => {
			page.name = page.dataset.name;
			page.value = pageBtn.dataset.page;
			let hasValue = updateFormNames();
			if(hasValue && page.value === "1") {
				page.name = "";
			}
			form.submit();
		});
	}

	//Report buttons
	let reportButtons = document.getElementsByClassName("report-button");
	for(let btn of reportButtons) {
		btn.addEventListener("click", () => {
			let answer = prompt("What is wrong with this match?");
			if(!answer || answer.length === 0) {
				return alert("Gotta give a reason for reporting something, pal.");
			}

			sendReport(btn.dataset.vid, btn.dataset.idx, btn.dataset.time, answer);
		});
	}

	function onFormChange(elem) {
		let pages = document.querySelectorAll(".ms-pagination");
		for(let p of pages) {
			p.classList.add("ms-disabled");
		}
	}

	function updateFormNames() {
		let hasValue = false;
		
		if(p1char1.value.length > 0) {
			hasValue = true;
			p1char1.name = p1char1.dataset.name;
		}
		if(p1char2.value.length > 0) {
			hasValue = true;
			p1char2.name = p1char2.dataset.name;
		}
		if(p1char3.value.length > 0) {
			hasValue = true;
			p1char3.name = p1char3.dataset.name;
		}
		if(p1char4.value.length > 0) {
			hasValue = true;
			p1char4.name = p1char4.dataset.name;
		}
		if(p1name1.value.length > 0) {
			hasValue = true;
			p1name1.name = p1name1.dataset.name;
		}
		if(p1name2.value.length > 0) {
			hasValue = true;
			p1name2.name = p1name2.dataset.name;
		}
		if(p1name3.value.length > 0) {
			hasValue = true;
			p1name3.name = p1name3.dataset.name;
		}
		if(p1name4.value.length > 0) {
			hasValue = true;
			p1name4.name = p1name4.dataset.name;
		}
		if(p1rank.value.length > 0) {
			hasValue = true;
			p1rank.name = p1rank.dataset.name;
		}
		if(platform.value.length > 0) {
			hasValue = true;
			platform.name = platform.dataset.name;
		}
		if(map.value.length > 0) {
			hasValue = true;
			map.name = map.dataset.name;
		}
		if(winner.value.length > 0) {
			hasValue = true;
			winner.name = winner.dataset.name;
		}
		if(p2char1.value.length > 0) {
			hasValue = true;
			p2char1.name = p2char1.dataset.name;
		}
		if(p2char2.value.length > 0) {
			hasValue = true;
			p2char2.name = p2char2.dataset.name;
		}
		if(p2char3.value.length > 0) {
			hasValue = true;
			p2char3.name = p2char3.dataset.name;
		}
		if(p2char4.value.length > 0) {
			hasValue = true;
			p2char4.name = p2char4.dataset.name;
		}
		if(p2name1.value.length > 0) {
			hasValue = true;
			p2name1.name = p2name1.dataset.name;
		}
		if(p2name2.value.length > 0) {
			hasValue = true;
			p2name2.name = p2name2.dataset.name;
		}
		if(p2name3.value.length > 0) {
			hasValue = true;
			p2name3.name = p2name3.dataset.name;
		}
		if(p2name4.value.length > 0) {
			hasValue = true;
			p2name4.name = p2name4.dataset.name;
		}
		if(p2rank.value.length > 0) {
			hasValue = true;
			p2rank.name = p2rank.dataset.name;
		}
		if(videoId.value.length > 0) {
			hasValue = true;
			videoId.name = videoId.dataset.name;
		}
		if(videoTag.value.length > 0) {
			hasValue = true;
			videoTag.name = videoTag.dataset.name;
		}

		return hasValue;
	}

	function sendReport(vid, idx, time, reason) {
		fetch("/report", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				vid, idx, time, reason
			})
		}).then(() => {
			alert("Your report has been logged. Thanks!");
		});
	}
});