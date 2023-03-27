var game = new Phaser.Game({
	width: 1600,
	height: 900,
	scene: {
		preload: preload,
		create: create,
		update: update
	},
	scene: {
		key: 'nextPage',
		preload: nextPreload,
		create: nextCreate,
		update: nextUpdate
	}
});

function nextPreload() {
	// Load any assets needed for the next page
}

function nextCreate() {
	// Create the next page
}

function nextUpdate() {
	// Update any logic for the next page
}