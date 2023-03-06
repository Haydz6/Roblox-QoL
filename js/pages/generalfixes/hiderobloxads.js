function NewAd(Ad){
    if (Ad.nodeType === Node.ELEMENT_NODE && Ad.className.search("abp") > -1) Ad.remove()
}

IsFeatureEnabled("HideRobloxAds").then(async function(Enabled){
    if (Enabled){
        WaitForId("AdvertisingLeaderboard").then(function(Ad){
            Ad.remove()
        })
        WaitForClass("Ads_WideSkyscraper").then(function(Ad){
            Ad.remove()
        })
        WaitForClass("profile-ads-container").then(function(Ad){
            Ad.remove()
        })

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