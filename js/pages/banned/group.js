IsFeatureEnabled("ViewBannedGroup").then(function(Enabled){
    if (!Enabled) return
    InjectScript("BannedGroup")
})