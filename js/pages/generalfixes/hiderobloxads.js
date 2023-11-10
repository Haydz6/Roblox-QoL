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

        // IsFeatureKilled("FlexBoxHideAds").then(function(Killed){
        //     if (!Killed){
        //         Content.style.display = "flex"
        //         Content.style.justifyContent = "center"
        //     }
        // })
        IsFeatureKilled("HideRobloxAdFix").then(function(Killed){
            if (!Killed){
                Content.style.padding = "20px"
        
                const DocURL = window.location.href
                if (DocURL.includes("/home") || DocURL.match("/games/[0-9]+/") && DocURL.match("/games/[0-9]+/").length != 0) {
                    Content.style.maxWidth = "1000px"
                }
            }
        })

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