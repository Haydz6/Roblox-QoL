function ManifestV2ServerListFixForFirefoxAndroid(){
    return {redirectUrl: chrome.runtime.getURL("js/modules/fixServerListEntryFirefoxAndroid.js")}
}

function ToggleServerListFixForFirefoxAndroid(Enabled){
    const IsFirefoxAndroid = navigator.userAgent.toLowerCase().includes("android") && navigator.userAgent.toLowerCase().includes("firefox")

    if (ManifestVersion >= 3){
        let Update
        if (Enabled && IsFirefoxAndroid) Update = {addRules: [
            {
                id: 12,
                priority: 1,
                condition: {urlFilter: "https://js.rbxcdn.com/8a07ae90334a7b1ce360c0bd9621cf1d6342899b9de21f6cb1ff8c0484df97da.js", resourceTypes: ["script"]},
                action: {type: chrome.declarativeNetRequest?.RuleActionType?.REDIRECT || "redirect", redirect: {url: chrome.runtime.getURL("js/modules/fixServerListEntryFirefoxAndroid.js")}}
            }]}

        else Update = {removeRuleIds: [12]}
        
        try {chrome.declarativeNetRequest.updateDynamicRules(Update)} catch (error) {console.warn(error)}
    } else { //Firefox
        if (Enabled && IsFirefoxAndroid){
            chrome.webRequest.onBeforeRequest.addListener(ManifestV2ServerListFixForFirefoxAndroid, {urls: ["https://js.rbxcdn.com/8a07ae90334a7b1ce360c0bd9621cf1d6342899b9de21f6cb1ff8c0484df97da.js"], types: ["script"]}, ["blocking"])
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(ManifestV2ServerListFixForFirefoxAndroid)
        }
    }
}

ListenForSettingChanged("ServerListFixForFirefoxAndroid", ToggleServerListFixForFirefoxAndroid)
IsFeatureEnabled("ServerListFixForFirefoxAndroid").then(ToggleServerListFixForFirefoxAndroid)