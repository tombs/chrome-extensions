// popup.js

document.addEventListener('DOMContentLoaded', function () {
    var checkButton = document.getElementById('checkButton');
    var resultDiv = document.getElementById('result');
    const checkSaved = document.getElementById("checkSaved");

    checkSaved.addEventListener("click", function() {
        chrome.storage.local.get(null, function(result) {
            console.log("result.wordSet", result.wordSet)
            const storedWords = result.wordSet;
            console.log(storedWords);
            // Update UI or perform other operations with the stored words
          });
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
  