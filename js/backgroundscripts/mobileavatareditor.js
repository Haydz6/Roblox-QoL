function ManifestV2AvatarEditorForMobile(request){
    const Headers = request.requestHeaders

    for (let i = 0; i < Headers.length; i++){
        const Header = Headers[i]
        if (Header.name.toLowerCase() === "user-agent"){
            Header.value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            break
        }
    }

    return {requestHeaders: Headers}
}

function ToggleAvatarEditorForMobile(Enabled){
    if (ManifestVersion >= 3){
        let Update
        if (Enabled) Update = {addRules: [
            {
                id: 11,
                priority: 1,
                condition: {urlFilter: "https://www.roblox.com/my/avatar", resourceTypes: ["main_frame"]},
                action: {type: chrome.declarativeNetRequest?.RuleActionType?.MODIFY_HEADERS || "modifyHeaders", requestHeaders: [{header: "user-agent", operation: chrome.declarativeNetRequest?.HeaderOperation?.SET || "set", value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}]}
            }]}

        else Update = {removeRuleIds: [11]}
        
        console.log(Update)
        try {chrome.declarativeNetRequest.updateDynamicRules(Update)} catch (error) {console.warn(error)}
    } else { //Firefox
        if (Enabled){
            chrome.webRequest.onBeforeSendHeaders.addListener(ManifestV2AvatarEditorForMobile, {urls: ["https://www.roblox.com/my/avatar"], types: ["main_frame"]}, ["blocking", "requestHeaders"])
        } else {
            chrome.webRequest.onBeforeSendHeaders.removeListener(ManifestV2AvatarEditorForMobile)
        }
    }
}

ListenForSettingChanged("AvatarEditorForMobile", ToggleAvatarEditorForMobile)
IsFeatureEnabled("AvatarEditorForMobile").then(ToggleAvatarEditorForMobile)