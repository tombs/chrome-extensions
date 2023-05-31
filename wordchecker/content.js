// content.js

// Function to send a message to the background script
function sendMessageToBackgroundScript(message, callback) {
    chrome.runtime.sendMessage(message, callback);
  }
  
  // Function to handle the message from background script
  function handleMessage(request, sender, sendResponse) {
    if (request.action === 'checkWords') {
      sendMessageToBackgroundScript({ action: 'checkWords' }, function (response) {
        const matchedWords = response.matchedWords || [];
        sendResponse({ matchedWords });
      });
    }
  
    return true;
  }
  
  // Function to extract words from the webpage
  function extractWords() {
    const textNodes = document.evaluate(
      '//text()[normalize-space()]',
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
  
    const words = [];
    for (let i = 0; i < textNodes.snapshotLength; i++) {
      const textNode = textNodes.snapshotItem(i);
      const nodeWords = textNode.textContent.trim().split(/\s+/);
      words.push(...nodeWords);
    }
  
    return words;
  }
  
  // Send a message to the background script to check words on page load
  sendMessageToBackgroundScript({ action: 'checkWords' }, function (response) {
    const matchedWords = response.matchedWords || [];
    console.log('Matched words on page load:', matchedWords);
  });
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(handleMessage);
  