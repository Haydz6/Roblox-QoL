async function HandleAdFrame(Ad){
    if (await IsFeatureKilled("DeleteFrameOfAd")){
        Ad.remove()
    } else {
        Ad.getElementsByTagName("iframe")[0].remove()
    }
}

function NewAd(Ad){
    if (Ad.nodeType === Node.ELEMENT_NODE && Ad.className.includes("abp")) HandleAdFrame(Ad)
}

IsFeatureEnabled("HideRobloxAds").then(async function(Enabled){
    if (Enabled){
        WaitForId("AdvertisingLeaderboard").then(HandleAdFrame)
        WaitForClass("Ads_WideSkyscraper").then(HandleAdFrame)
        WaitForClass("profile-ads-container").then(HandleAdFrame)

        const MainContainer = await WaitForId("container-main")
        const Content = MainContainer.getElementsByClassName("content")[0]

        new MutationObserver(function(Mutations){
            Mutations.forEach(function(Mutation){
                if (Mutation.type !== "childList") return
    
                const NewElements = Mutation.addedNodes
    
                for (let i = 0; i < NewElements.length; i++){
                    NewAd(NewElements[i])
                }
            })
        }).observe(Content, {childList: true})
    
        const Children = Content.children
    
        for (let i = 0; i < Children.length; i++){
            NewAd(Children[i])
        }
    }
})