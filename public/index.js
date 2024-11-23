import Table from "./Table.js"

var table;

document.addEventListener('DOMContentLoaded', () => {
	const interBubble = document.querySelector('.interactive');
	let curX = 0;
	let curY = 0;
	let tgX = 0;
	let tgY = 0;

	const move = () => {
		curX += (tgX - curX) / 20;
		curY += (tgY - curY) / 20;
		interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
		requestAnimationFrame(move);
	};

	window.addEventListener('mousemove', (event) => {
		tgX = event.clientX;
		tgY = event.clientY;
	});

	move();
});

// called when GUI play button clicked
export function play() {
	table.play();
}

// called when GUI pause button clicked
export function pause() {
	table.pause();
}

// plays previous track and switches to prev playlist if necessary
export function playPrev() {
	table.playPrev();
}

// plays next track and switches to next playlist if necessary
export function playNext() {
	table.playNext();
}

// plays random track
function randomTrack() {
	table.randomTrack();
}

function changeWallpaper(imageUrl, buttonId) {
	document.body.style.background = `url(${imageUrl}) no-repeat fixed center top`;	

	// Reset active class for all buttons
	const buttons = document.querySelectorAll('.wallpapers button');
	buttons.forEach(button => button.classList.remove('active-wallpaper'));
  
	// Add active class to the clicked button
	const activeButton = document.getElementById(buttonId);
	if (activeButton) {
	  activeButton.classList.add('active-wallpaper');
	}
}
  

// populate playlist content table
export function populatePlayListContentTable(initialPlaylistIndex) {
	// add functions to buttons since onClick doesnt work
	document.getElementById("wallpaper-w1").onclick = () => {
		console.log('Button clicked!'); 
		changeWallpaper('images/4k-Wallpaper-Main.jpg', 'wallpaper-w1');
	};
	document.getElementById("wallpaper-w2").onclick = () => {
		changeWallpaper('images/4k-Wallpaper-Secondary.jpg', 'wallpaper-w2');
	};
	document.getElementById("wallpaper-w3").onclick = () => {
		changeWallpaper('images/4k-Wallpaper-Tertiary.jpg', 'wallpaper-w3');
	};
	document.getElementById("wallpaper-w4").onclick = () => {
		changeWallpaper('images/4k-Wallpaper.jpg', 'wallpaper-w4');
	};
	document.getElementById("wallpaper-w5").onclick = () => {
		changeWallpaper('images/4k-Wallpaper-Quartnary.jpg', 'wallpaper-w5');
	};
	document.getElementById("rew").onclick = () => {
		playPrev();
	};
	document.getElementById("play").onclick = () => {
		play();
	};
	document.getElementById("pause").onclick = () => {
		pause();
	};
	document.getElementById("fwd").onclick = () => {
		playNext();
	};
	document.getElementById("randomButton").onclick = () => {
		randomTrack();
	};
	document.getElementById("loginButton").onclick = () => {
		login();
	};
	document.getElementById("modifyButton").onclick = () => {
		modify();
	};
	// initialize new table
	table = new Table(initialPlaylistIndex);
}

// resets everything, 
function reset() {
	table.table.replaceChildren();
	table.dropdownMenu.replaceChildren();
	const saveIndex = table.index;
	populatePlayListContentTable(saveIndex);
}

// user clicks modify button
function modify() {
	const inputOptions = {
		"Add": "Add",
		"Delete": "Delete",
		"Edit": "Edit",
		"Clear Buttons": "Clear Buttons"
	};
	Swal.fire({
		title: "Choose Modification Type",
		input: "radio",
		inputOptions,
		showCancelButton: true,
		inputValidator: (value) => {
			if (!value) {
				return "You need to choose something!";
			}
		}
	}).then((result) => {
		if (result.isConfirmed) {
			if (result.value == "Add") {
				table.showAddButtons();
			} else if (result.value == "Delete") {
				table.showDeleteButtons();
			} else if (result.value == "Edit"){
				table.showEditButtons();
			} else { // clear buttons
				table.resetButtons();
			}
		}
	});
}

export function editHandler(track, speaker, theme, description, rowIndex) {
	Swal.fire({
		title: "Edit Contents",
		html: `
      <label>Track</label>
      <input id="popup-track" class="swal2-input" value="${track}">
      <label>Speaker</label>
      <input id="popup-speaker" class="swal2-input" value="${speaker}">
      <label>Theme</label>
      <input id="popup-theme" class="swal2-input" value="${theme}">
      <label>Description</label>
      <input id="popup-description" class="swal2-input" value="${description}">
    `,
		showCloseButton: true,
		showCancelButton: true,
		confirmButtonText: "Save Changes",
		preConfirm: () => {
			// Retrieve edited values
			const newTrack = document.getElementById('popup-track').value;
			const newSpeaker = document.getElementById('popup-speaker').value;
			const newTheme = document.getElementById('popup-theme').value;
			const newDescription = document.getElementById('popup-description').value;

			// return values to update row
			return { newTrack, newSpeaker, newTheme, newDescription };
		}
	}).then((result) => {
		if (result.isConfirmed) {

			// update row with new values
			const row = document.getElementsByClassName("table")[0].rows[rowIndex + 1];
			row.cells[0].innerHTML = `<button class="show-more" onclick="editHandler('${result.value.newTrack}', '${result.value.newSpeaker}', '${result.value.newTheme}', '${result.value.newDescription}', ${rowIndex})"></button>`;
			row.cells[1].innerHTML = `<i>"${result.value.newTrack}"</i>`;
			row.cells[2].innerHTML = result.value.newSpeaker;
			row.cells[3].innerHTML = result.value.newTheme;
			row.cells[4].innerHTML = result.value.newDescription;

			Swal.fire({
				title: 'Changes Saved!',
				icon: 'success',
				timer: 1500,
				showConfirmButton: false
			});
		}
	});
}

// user clicks add button on this row
export async function addHandler(playlistName, playlistOrder) {
	const loggedIn = await isLoggedIn();
	// first loggedIn checkpoint
	if (!loggedIn) {
		Swal.fire({
			title: "You need to be logged in to add rows",
		});
		return;
	}
	// ask user if they want to add a row above or below this row
	const inputOptions = {
		"Above": "Above",
		"Below": "Below"
	};
	//
	const { value: aboveOrBelow } = await Swal.fire({
		title: "Add row above or below this one",
		input: "radio",
		inputOptions
	});
	// user exited the popup, they dont want to add a row
	if (!aboveOrBelow) {
		return;
	}
	if (aboveOrBelow == "Below") {
		playlistOrder++;
	}

	// prompt user to enter row data
	// build html form to present to user
	let htmlString = ``;
	const entries = [
		"URL", "FileName", "Speaker",
		"Description", "TrackName", "Date", "Theme"
	];
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		htmlString += `<input id="swal-input${i}" class="swal2-input">`;
		htmlString += `<p>${entry}</p>`;
	}
	const { value: rowValues } = await Swal.fire({
		title: "Fill in row values",
		html: htmlString,
		showCancelButton: true,
		preConfirm: () => {
			var returner = [];
			for (let i = 0; i < entries.length; i++) {
				returner.push(document.getElementById(`swal-input${i}`).value);
			}
			return returner;
		}
	});

	// user cancelled
	if (!rowValues) return;

	// build and send query to actually add a row to the database
	var query = `/add?`;
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		query += `${entry}=${rowValues[i]}&`;
	}
	query += `PlaylistOrder=${playlistOrder}&PlaylistName=${playlistName}`;
	const data = await fetch(query,
		{ method: "POST" }
	);
	const dataJSON = await data.json();
	const addResult = await dataJSON.addResult;
	if (!addResult) {
		Swal.fire({
			title: "You need to be logged in to add rows",
		});
		return
	}
	Swal.fire({
		title: "Successful addition! Refreshing...",
	});
	// reset makes the added row appear (refreshes db)
	reset();
}

// user clicks delete button on this row
export async function deleteHandler(playlistName, playlistOrder) {
	const loggedIn = await isLoggedIn();
	// first loggedIn checkpoint
	if (!loggedIn) {
		Swal.fire({
			title: "You need to be logged in to delete rows",
		});
		return;
	}
	const { value: confirmDelete } = await Swal.fire({
		title: "Are you sure you want to delete the row?",
		showCancelButton: true
	});
	// clicked cancel button
	if (!confirmDelete) return
	// use playlistOrder as the primary key because no 2 documents
	// should have same playlistOrder
	const query = `/delete?PlaylistOrder=${playlistOrder}&Theme=${playlistName}`
	const data = await fetch(query,
		{ method: "POST" }
	);
	const dataJSON = await data.json();
	const addResult = await dataJSON.addResult;
	if (!addResult) {
		Swal.fire({
			title: "You need to be logged in to add rows",
		});
		return
	}
	Swal.fire({
		title: "Successful deletion! Refreshing...",
	});
	// reset makes the deleted row disappear (refreshes db)
	reset();
}

// User attempts to login
// TODO: use <input> so that user's password appears as
// * instead of actual thing
async function login() {
	try {
		const guess = prompt("Enter Secret Password");
		if (!guess) {
			alert("Incorrect Password");
			return
		}
		const query = "/login?Password=" + guess;
		// returns true if user guessed correct password
		const data = await fetch(query,
			{ method: "POST" }
		);
		const dataJSON = await data.json()
		const guessResult = dataJSON.guessResult;
		// guessed right
		if (guessResult == 0) {
			alert("Welcome User");
		}
		// guessed wrong
		else if (guessResult == 1) {
			alert("Incorrect Password");
		}
		// user was already logged in
		else {
			alert("You are already logged in!");
		}
	}
	catch (err) {
		console.error("login function error: " + err);
	}
}

// returns whether or not user is logged in
async function isLoggedIn() {
	try {
		const query = "/login"
		const data = await fetch(query,
			{ method: "POST" }
		);
		const dataJSON = await data.json()
		return dataJSON.isLoggedIn;
	}
	catch (err) {
		console.error("isLoggedIn function error: " + err);
	}
}
