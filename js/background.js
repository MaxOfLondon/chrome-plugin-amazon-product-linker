/**
 * Registers action that is called when user clicks on addon button (browser action)
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

    let notification
    if(productId) {
        notification = {
            type: 'basic',
            title: 'Link copied to clipboard',
            message: `${tabUrl.protocol}//${tabUrl.host}/dp/${productId[1]}`,
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
    
    /**
     * Copies passed url into clipboard in context of active tab
     * 
     * @param {String} url 
     */
    function sendToClipboard(url) {
        const copyFrom = document.createElement("textarea");
        copyFrom.textContent = url;
        document.body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        document.body.removeChild(copyFrom);
    }

    if('Notification' in this){
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