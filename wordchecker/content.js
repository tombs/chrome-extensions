// Retrieve the word set from Chrome storage
chrome.storage.local.get("wordSet", function (result) {
    const storedWordSet = new Set(result.wordSet);
    // Do something with the stored word set
    console.log("Retrieved word set:", storedWordSet);
});

// Function to extract words from the webpage
function extractWords(wordsToCheck) {
    const textNodes = document.evaluate(
        "//text()[normalize-space()]",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );

    const words = [];
    const matchedWords = [];
    console.log("TEXT NODES LENGTH: ", textNodes.snapshotLength);
    for (let i = 0; i < textNodes.snapshotLength; i++) {
        // console.log("i: ",i)
        const textNode = textNodes.snapshotItem(i);
        const nodeWords = textNode.textContent.trim().split(/\s+/);
        for (const word of nodeWords) {
            if (wordsToCheck.includes(word)) {
                if (!matchedWords.includes(word)) {
                    matchedWords.push(word);
                }
                highlightWord(textNode, word);
            }
        }
        words.push(...nodeWords);
    }
    return { words, matchedWords };
}

// Function to handle the message from the background script
function handleMessage(request, sender, sendResponse) {
    console.log("GETTING REQUEST FROM BACKGROUND");
    if (request.action === "dataUpdate") {
        const wordsToCheck = request.data;
        console.log("WORDS TO CHECK: ", wordsToCheck);
        const { words, matchedWords } = extractWords(wordsToCheck);

        chrome.storage.local.set({ matchedWords: matchedWords });

        console.log("WEB PAGE WORDS: ", words);
        // const matchedWords = wordsToCheck.filter(word => webpageWords.includes(word));
        sendResponse({ matchedWords });
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(handleMessage);

// function highlightWord(node, word) {
//   const regex = new RegExp(`\\b${word}\\b`, 'gi');
//   const replacement = `<span style="background-color: yellow;">$&</span>`;
//   console.log("NODE INNER: ", node.innerHTML)
//   console.log("NODE: ", node)
//   console.log("WORD: ", word)
//   node.innerHTML = node.innerHTML.replace(regex, replacement);
// }

// function highlightWord(node, word) {
//   const regex = new RegExp(`\\b${word}\\b`, 'gi');
//   const highlightColor = 'yellow';

//   if (node.nodeType === Node.TEXT_NODE) {
//     const parentNode = node.parentNode;
//     const textContent = node.textContent;
//     const matches = textContent.match(regex);

//     if (matches) {
//       const fragment = document.createDocumentFragment();
//       const parts = textContent.split(regex);

//       for (let i = 0; i < parts.length; i++) {
//         fragment.appendChild(document.createTextNode(parts[i]));

//         if (i < matches.length) {
//           const span = document.createElement('span');
//           span.style.backgroundColor = highlightColor;
//           span.appendChild(document.createTextNode(matches[i]));
//           fragment.appendChild(span);
//         }
//       }

//       parentNode.replaceChild(fragment, node);
//     }
//   } else {
//     const childNodes = node.childNodes;
//     for (const childNode of childNodes) {
//       highlightWord(childNode, word);
//     }
//   }
// }

function highlightWord(node, word) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const highlightColor = "yellow";
    const highlightFontSize = "2em";

    const wrapper = document.createElement("div");

    if (node.nodeType === Node.TEXT_NODE) {
        const parentNode = node.parentNode;
        const textContent = node.textContent;
        const matches = textContent.match(regex);

        if (parentNode) {
            if (matches) {
                const parts = textContent.split(regex);

                for (let i = 0; i < parts.length; i++) {
                    wrapper.appendChild(document.createTextNode(parts[i]));

                    if (i < matches.length) {
                        const span = document.createElement("span");
                        span.style.backgroundColor = highlightColor;
                        span.style.fontSize = highlightFontSize;
                        span.appendChild(document.createTextNode(matches[i]));
                        wrapper.appendChild(span);
                    }
                }

                parentNode.replaceChild(wrapper, node);
            }
        }
    } else {
        const childNodes = node.childNodes;
        for (const childNode of childNodes) {
            highlightWord(childNode, word);
        }
    }
}

chrome.runtime.sendMessage({ action: "fetchOverlayHTML" }, (response) => {
    console.log("SENDING MESSAGE TO BACKGROUND");
    console.log("BACKGROUND RESPONSE: ", response);
    if (response && response.htmlContent) {
        displayOverlay(response.htmlContent);
    } else {
        console.error("Failed to fetch overlay HTML.");
    }
});

function displayOverlay(htmlContent) {
  console.log("DISPLAYING OVERLAY");
  const overlay = document.createElement("div");
  overlay.innerHTML = htmlContent;
  overlay.id = "wordOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "20px";
  overlay.style.right = "20px";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.color = "white";
  overlay.style.padding = "10px";
  overlay.style.zIndex = "9999";

  const contentContainer = document.createElement("div");
  contentContainer.id = "overlayContent";
  overlay.appendChild(contentContainer);

  document.body.appendChild(overlay);

  const wordList = document.getElementById("matchedWordList");
  console.log("UL: ", wordList);

  // Fetch the matched words from storage and display them in the overlay
  chrome.storage.local.get(["matchedWords"], ({ matchedWords }) => {
    if (matchedWords && matchedWords.length > 0) {
      matchedWords.forEach((word) => {
        const listItem = document.createElement("li");
        listItem.textContent = word;
        wordList.appendChild(listItem);
      });
    }
  });
}
