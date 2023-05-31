// background.js

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
    //   chrome.storage.local.get("wordSet", function (result) {
    //     console.log("RESULT: ", result)
    //     const wordList = result.wordSet || [];
    //     sendResponse({ matchedWords: wordList });
    //   });
    chrome.storage.local.get(
        "wordSet",
        function (result) {
            console.log("Stored data:", result.wordSet);
            console.log(
                "Stored data count:",
                result.wordSet.length
            );
        }
    );
    }
  
    return true;
  });
  