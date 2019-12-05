// this is the background code...

// listen for our browerAction to be clicked
chrome.browserAction.onClicked.addListener(function (tab) {

    console.log('background started')
	// for the current tab, inject the "inject.js" file & execute it
    chrome.tabs.executeScript(tab.ib, {
		file: 'socket.io.js'
	});
	chrome.tabs.executeScript(tab.ib, {
		file: 'index.js'
	});
});