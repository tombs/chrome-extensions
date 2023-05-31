// Function to get all the tabs in the current window
function getAllTabs() {
    console.log("GET ALL TABS")
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        resolve(tabs);
      });
    });
  }
  
//   // Function to iterate over all the tabs
//   function iterateTabs() {
//     console.log("ITERATE TABS")
//     getAllTabs().then((tabs) => {
//       for (let i = 0; i < tabs.length; i++) {
//         // Do something with each tab
//         console.log(tabs[i].url);
//       }
//     });
//   }

function iterateTabs() {
    getAllTabs().then((tabs) => {
        console.log("TABS: ", tabs)
      let urls = ""
      let count = 0
      for (let i = 0; i < tabs.length; i++) {
        count = count + 1
        const tab = tabs[i];
        const title = tab.title;
        const url = tab.url;
  
        urls = urls + `${url};${title}\n`
    }
    const message = { type: 'urls', urls, count }
    console.log("SENDING MESSAGE: ", message)
    chrome.runtime.sendMessage('',message);
    });
  }

// chrome.runtime.onMessage.addListener(iterateTabs);

chrome.runtime.onMessage.addListener( data => {
    if ( data.type === 'notification' ) {
      console.log("ITERATING THROUGH TABS")
      iterateTabs()
    //   notify( data.message );
    }
  });

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "notify",
        title: "Notify!: %s",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ("notify" === info.menuItemId) {
        notify(info.selectionText);
    }
});

const notify = (message) => {
    chrome.storage.local.get(["notifyCount"], (data) => {
        let value = data.notifyCount || 0;
        chrome.storage.local.set({ notifyCount: Number(value) + 1 });
    });

    return chrome.notifications.create("", {
        type: "basic",
        title: "Notify!",
        message: message || "Notify!",
        iconUrl: "./assets/icons/128.png",
    });
};



  
  // Event listener to trigger the iteration when the extension button is clicked
//   chrome.browserAction.onClicked.addListener(iterateTabs);
  