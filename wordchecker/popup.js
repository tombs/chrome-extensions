// popup.js

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOCUMENT LOADED!")
    var resultDiv = document.getElementById('result');
    const checkSaved = document.getElementById("checkSaved");
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const checkButton = document.getElementById("checkButton");
    const clearMatched = document.getElementById("clearMatched");

    // chrome.runtime.sendMessage({ action: 'checkWords' }, (response) => {
    //   console.log("TO BG CHECKING WORDS")
    //   if (response && response.matchedWords) {
    //     var matchedWords = response.matchedWords;
    //     if (matchedWords.length > 0) {
    //       resultDiv.textContent = 'Matched words: ' + matchedWords.join(', ');
    //     } else {
    //       resultDiv.textContent = 'No matched words found.';
    //     }
    //   } else {
    //     resultDiv.textContent = 'Error occurred while checking words.';
    //   }
    // });

    uploadButton.addEventListener("click", function () {
      const file = fileInput.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
              const wordsText = event.target.result;
              console.log("WORDS TEXT: ", wordsText)
              const wordsArray = wordsText
                  .split("\r\n")
                  .filter((word) => word.trim() !== "");
              const wordSet = new Set(wordsArray);

              // Save the word set to Chrome storage
              chrome.storage.local.set(
                  { wordSet: Array.from(wordSet) },
                  function () {
                      if (chrome.runtime.lastError) {
                          console.error(
                              "Error uploading words:",
                              chrome.runtime.lastError
                          );
                      } else {
                          console.log(
                              "Word set uploaded and stored in Chrome storage."
                          );
                          // Retrieve the stored data to verify
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
                  }
              );
          };
          reader.readAsText(file);
      }
  });

    checkSaved.addEventListener("click", function() {
        chrome.storage.local.get(null, function(result) {
            console.log("result.wordSet", result.wordSet)
            const storedWords = result.wordSet;
            console.log(storedWords);
            // Update UI or perform other operations with the stored words
          });

          chrome.storage.local.get(['matchedWords'], ({ matchedWords }) => {
            // Access the matchedWords array here
            console.log("STORED MATCHED WORDS: ", matchedWords);
          });
          
    })


    clearMatched.addEventListener("click", function() {
      console.log("CLEARING MATCHED WORDS")
      chrome.storage.local.set({ matchedWords: null });
        
  })
  
    checkButton.addEventListener('click', function () {
      console.log("CLICKED THE CHECK BUTTON")
      chrome.runtime.sendMessage({ action: 'checkWords' }, function (response) {
        if (response && response.matchedWords) {
          var matchedWords = response.matchedWords;
          if (matchedWords.length > 0) {
            resultDiv.textContent = 'Matched words: ' + matchedWords.join(', ');
          } else {
            resultDiv.textContent = 'No matched words found.';
          }
        } else {
          resultDiv.textContent = 'Error occurred while checking words.';
        }
      });
    });
  });
  