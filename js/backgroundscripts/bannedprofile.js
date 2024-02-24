chrome.webRequest.onBeforeRedirect.addListener(function(Document){
    if (Document.redirectUrl.includes("roblox.com/request-error?code=404") && Document.url.includes("roblox.com/users/")){
        const Split = Document.url.split("users/")[1].split("/")
        const UserId = Split[0]
        chrome.tabs.update(Document.tabId, {url: "https://www.roblox.com/banned-user/"+UserId+"/"+Split[1]})
    }
}, {urls: ["*://*.roblox.com/users/*/profile*", "*://*.roblox.com/users/*/friends*", "*://*.roblox.com/*/users/*/profile*", "*://*.roblox.com/*/users/*/friends*"]})

//let BannedUsersSupported = true

//try {
//} catch {
    // const NavigationTabs = {}

    // chrome.webNavigation.onBeforeNavigate.addListener(function(Navigation){
    //     if (Navigation.frameType === "outermost_frame" && Navigation.url.includes("roblox.com/users/")){
    //         const Id = Navigation.tabId

    //         NavigationTabs[Id] = Navigation
    //         setTimeout(function(){
    //             delete NavigationTabs[Id]
    //         }, 1000*60)
    //     }
    // })
    // chrome.webNavigation.onCommitted.addListener(function(Navigation){
    //     if (Navigation.frameType === "outermost_frame" && Navigation.url.includes("roblox.com/request-error?code=404")){
    //         const PriorNavigation = NavigationTabs[Navigation.tabId]
    //         if (!PriorNavigation) return

    //         const Split = PriorNavigation.url.split("users/")[1].split("/")
    //         const UserId = Split[0]
    //         chrome.tabs.update(PriorNavigation.tabId, {url: "https://www.roblox.com/banned-user/"+UserId+"/"+Split[1]})

    //         delete NavigationTabs[Navigation.tabId]
    //     }
    // })

    //BannedUsersSupported = false
//} //Stop errors from safari