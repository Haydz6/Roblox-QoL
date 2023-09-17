chrome.webRequest.onBeforeRedirect.addListener(function(Document){
    console.log(Document.redirectUrl.includes("roblox.com/request-error?code=404"))
    console.log(Document.url.includes("roblox.com/users/"))
    if (Document.redirectUrl.includes("roblox.com/request-error?code=404") && Document.url.includes("roblox.com/users/")){
        const UserId = Document.url.split("users/")[1].split("/")[0]
        chrome.tabs.update(Document.tabId, {url: "https://roblox.com/banned-user/"+UserId})
    }
}, {urls: ["*://*.roblox.com/users/*/profile"]})