/**
 * Build for production or development - with live or mockup test.
 * @namespace Build
 */

/**
 * Build modes enumeration.
 * @memberof Build
 * @enum 
 */
var Modes = {
	/** Popups options page after installation. */
	PRODUCTION: 1,
	/** A more realistic test which connects to Wordnik and uses a internet page to test extension in real life situation. */
	LIVE_TEST: 2,
	/** Fastest test using mockup of Wordnik dictionary (limited words) and a local test page. */
	MOCKUP_TEST: 3
}

var build = {
	Modes: Modes
};

/**
 * Selected build mode.
 * @memberof Build
 * @type {Modes}
 */
build.mode = Modes.PRODUCTION;

build.isProduction = function() {
	return build.mode === Modes.PRODUCTION;
}
build.isMockupTest = function() {
	return build.mode === Modes.MOCKUP_TEST;
}
build.isLiveTest = function() {
	return build.mode === Modes.LIVE_TEST;
}

module.exports = build;