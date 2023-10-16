let BannedUsersSupported = true

try {
    chrome.webRequest.onBeforeRedirect.addListener(function(Document){
        if (Document.redirectUrl.includes("roblox.com/request-error?code=404") && Document.url.includes("roblox.com/users/")){
            const Split = Document.url.split("users/")[1].split("/")
            const UserId = Split[0]
            chrome.tabs.update(Document.tabId, {url: "https://roblox.com/banned-user/"+UserId+"/"+Split[1]})
        }
    }, {urls: ["*://*.roblox.com/users/*/profile*", "*://*.roblox.com/users/*/friends*"]})
} catch {
    BannedUsersSupported = false
} //Stop errors from safari