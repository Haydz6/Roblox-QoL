IsFeatureEnabled("HideDesktopAppBanner").then(function(Enabled){
    if (Enabled){
        WaitForId("desktop-app-banner").then(async function(Banner){
            let BannerContainer

            while (!BannerContainer){
                BannerContainer = Banner.getElementsByClassName("banner-container")[0]
                await sleep(1)
            }

            BannerContainer.className = "banner-container hidden"
        })
    }
})