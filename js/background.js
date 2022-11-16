/**
 * Registers action that is called when user clicks on browser action (button icon)
 */
chrome.action.onClicked.addListener(async (tab) => {
    // skip urls like "chrome://" to avoid extension error
    if (tab.url?.startsWith("chrome://")) return undefined;

    const patterns = [
        /\/dp\/([A-Z0-9]+)/,
        /\/product\/([A-Z0-9]+)/
    ]
    const tabUrl = new URL(tab.url)

    /**
     * Applies regex patterns to url string to get product id. Stores match object or null if no matches.
     */
    const productId = patterns.reduce((prev, regex) => {
        return prev || tab.url.match(regex)
    }, null)

    const product_title = tab.title;

    let notification
    let url
    if(productId) {
        url = `${tabUrl.protocol}//${tabUrl.host}/dp/${productId[1]}`
        notification = {
            type: 'basic',
            title: 'Link copied to clipboard',
            message: url,
            iconUrl: '../images/img128.png'
        }
    } else {
        notification = {
            type: 'basic',
            title: 'Unable to find Amazon product on this page.',
            message: '',
            iconUrl: '../images/img128.png'
        }
    }
    
    function sendToClipboard(url) {
        const copyFrom = document.createElement("textarea");
        copyFrom.textContent = url;
        document.body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        document.body.removeChild(copyFrom);
    }

    if(url) {
        chrome.storage.sync.get({
            history_enable: 'checked',
            history_length: 100,
            history_queue: [],
        }, function(items) {
            const history_enable = items['history_enable'];
            const history_length = items['history_length'];
            const history_queue = items['history_queue'];
            if(history_enable) {
                while (history_queue.length >= history_length) {
                    history_queue.shift();
                }
                
                history_queue.push({url: url, title: product_title, date: new Date().toLocaleString()});
                chrome.storage.sync.set({
                    history_queue
                });
            }
        });
    }
    if('Notification' in this) {
        chrome.notifications.create('', notification);
        chrome.scripting.executeScript(
            {
              target: {tabId: tab.id},
              func: sendToClipboard,
              args: [notification.message],
            }
        );
    }
});