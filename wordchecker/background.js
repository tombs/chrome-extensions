  chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
  } catch (error) {
    console.error('Error injecting content script:', error);
  }
});

// Function to handle the message from content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'extractWords') {
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
  
      sendResponse({ words });
    }
  });
  
  // Function to handle the message from popup
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("RECEIVED REQUEST FROM POPUP")
    if (request.action === 'checkWords') {

      chrome.storage.local.get('wordSet', function(result) {
        var data = result.wordSet;
        console.log("DATA: ", data)
        // Send data to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          console.log("TABS: ", tabs)
          var activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: 'dataUpdate', data: data }, function(response) {
            console.log('Content script received the data');
            console.log("MATCHED WORDS: ", response.matchedWords)
          });
        });
      });

      // chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      //   var activeTab = tabs[0];
      //   chrome.tabs.sendMessage(activeTab.id, { action: 'checkWords' }, function(response) {
      //     console.log('Content script received the message');
      //   });
      // });
    //   chrome.storage.local.get("wordSet", function (result) {
    //     console.log("RESULT: ", result)
    //     const wordList = result.wordSet || [];
    //     sendResponse({ matchedWords: wordList });
    //   });

    // chrome.storage.local.get(
    //     "wordSet",
    //     function (result) {
    //         console.log("Stored data:", result.wordSet);
    //         console.log(
    //             "Stored data count:",
    //             result.wordSet.length
    //         );
    //     }
    // );

    }
  
    return true;
  });
  

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("RECEIVED MESSAGE FROM CONTENT: ", request.action)
    if (request.action === 'fetchOverlayHTML') {
      fetch(chrome.runtime.getURL('overlay.html'))
        .then(response => response.text())
        .then(htmlContent => {
          sendResponse({ htmlContent });
        })
        .catch(error => {
          console.error('Failed to fetch overlay HTML:', error);
          sendResponse(null);
        });
      
      return true; // To indicate that a response will be sent asynchronously
    }
  });