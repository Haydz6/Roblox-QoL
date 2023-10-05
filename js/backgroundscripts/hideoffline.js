function HideOfflineonBeforeRequest(){
    return {cancel: true}
}

async function UpdateHideOfflineRule(RuleEnabled){
    if (RuleEnabled == undefined){
        RuleEnabled = await IsFeatureEnabled("HideOffline")
    }

    if (ManifestVersion >= 3){
        let Update
        if (RuleEnabled) Update = {addRules: [{id: 10, priority: 1, action: {type: chrome.declarativeNetRequest.RuleActionType.BLOCK}, condition: {urlFilter: "presence.roblox.com/v1/presence/register-app-presence"}}]}
        else Update = {removeRuleIds: [10]}
        
        try {chrome.declarativeNetRequest.updateDynamicRules(Update)} catch {}
    } else { //Firefox
        if (RuleEnabled){
            chrome.webRequest.onBeforeRequest.addListener(HideOfflineonBeforeRequest, {urls: ["presence.roblox.com/v1/presence/register-app-presence"], types: ["xmlhttprequest"]}, ["blocking"])
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(HideOfflineonBeforeRequest)
        }
    }
}

ListenForSettingChanged("HideOffline", UpdateHideOfflineRule)
UpdateHideOfflineRule()