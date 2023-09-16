async function UpdateHideOfflineRule(RuleEnabled){
    if (RuleEnabled == undefined){
        RuleEnabled = await IsFeatureEnabled("HideOffline")
    }

    let Update
    if (RuleEnabled) Update = {addRules: [{id: 10, priority: 1, action: {type: chrome.declarativeNetRequest.RuleActionType.BLOCK}, condition: {urlFilter: "presence.roblox.com/v1/presence/register-app-presence"}}]}
    else Update = {removeRuleIds: [10]}
    
    try {chrome.declarativeNetRequest.updateDynamicRules(Update)} catch {}
}

ListenForSettingChanged("HideOffline", UpdateHideOfflineRule)
UpdateHideOfflineRule()