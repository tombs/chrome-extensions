const text = document.getElementById( 'notify-text' );
const notify = document.getElementById( 'notify-button' );
const reset = document.getElementById( 'notify-reset' );
const counter = document.getElementById( 'notify-count' );

chrome.storage.local.get( ['notifyCount'], data => {
	let value = data.notifyCount || 0;
	counter.innerHTML = value;
} );

chrome.storage.onChanged.addListener( ( changes, namespace ) => {
	if ( changes.notifyCount ) {
		let value = changes.notifyCount.newValue || 0;
		counter.innerHTML = value;
	}
});

reset.addEventListener( 'click', () => {
	chrome.storage.local.clear();
	text.value = '';
  counter.innerHTML = 0;
} );

notify.addEventListener( 'click', () => {
	chrome.runtime.sendMessage( '', {
		type: 'notification',
		message: text.value
	});
} );

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'urls') {
    const textToCopy = message.urls;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        console.log('Text copied to clipboard:', textToCopy);
        text.value = textToCopy
        counter.innerHTML = message.count
      })
      .catch((error) => {
        console.error('Failed to copy text to clipboard:', error);
      });
  }
});