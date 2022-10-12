document.addEventListener("DOMContentLoaded", () => {
	let form = document.getElementById("form");
	let page = document.getElementById("page");
	let p1char1 = document.getElementById("p1char1");
	let p1char2 = document.getElementById("p1char2");
	let p1char3 = document.getElementById("p1char3");
	let p1char4 = document.getElementById("p1char4");
	let p1name = document.getElementById("p1name");
	let p1rank = document.getElementById("p1rank");
	let platform = document.getElementById("platform");
	let map = document.getElementById("map");
	let winner = document.getElementById("winner");
	let p2char1 = document.getElementById("p2char1");
	let p2char2 = document.getElementById("p2char2");
	let p2char3 = document.getElementById("p2char3");
	let p2char4 = document.getElementById("p2char4");
	let p2name = document.getElementById("p2name");
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
	p1name.dataset.name = p1name.name;
	p1name.name = "";
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
	p2name.dataset.name = p2name.name;
	p2name.name = "";
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
	p1name.onchange = onFormChange;
	p1rank.onchange = onFormChange;
	platform.onchange = onFormChange;
	map.onchange = onFormChange;
	winner.onchange = onFormChange;
	p2char1.onchange = onFormChange;
	p2char2.onchange = onFormChange;
	p2char3.onchange = onFormChange;
	p2char4.onchange = onFormChange;
	p2name.onchange = onFormChange;
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
	p1name.value = url.get("p1name")||"";
	p1rank.value = url.get("p1rank")||"";
	platform.value = url.get("platform")||"";
	map.value = url.get("map")||"";
	winner.value = url.get("winner")||"";
	p2char1.value = url.get("p2char1")||"";
	p2char2.value = url.get("p2char2")||"";
	p2char3.value = url.get("p2char3")||"";
	p2char4.value = url.get("p2char4")||"";
	p2name.value = url.get("p2name")||"";
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
		if(p1name.value.length > 0) {
			hasValue = true;
			p1name.name = p1name.dataset.name;
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
		if(p2name.value.length > 0) {
			hasValue = true;
			p2name.name = p2name.dataset.name;
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