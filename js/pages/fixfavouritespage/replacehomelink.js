IsFeatureEnabled("FixFavouritesPage").then(async function(Enabled){
    if (!Enabled) return

    while (true){
        const SeeAllButtons = document.getElementsByClassName("btn-secondary-xs see-all-link-icon btn-more")

        for (let i = 0; i < SeeAllButtons.length; i++){
            const Button = SeeAllButtons[i]
            if (Button.href.search("sortName/v2/Favorites") > -1){
                Button.href = "https://roblox.com/discover#/sortName?sort=Favorites"
                break
            }
        }

        await sleep(20)
    }
})