IsFeatureEnabled("AvatarPageCSSFix").then(async function(Enabled){
    if (!Enabled || !CSS.supports("aspect-ratio: 1/1")) return

    while (!document.body) await sleep(0)
    document.body.classList.add("avatar-page-fix")

    const ItemsList = await WaitForClassPath(document.body, "items-list", "hlist")
    ChildAdded(ItemsList, true, async function(Item){
        if (!Item.className) return

        const Equipped = await WaitForClassPath(Item, "item-card-equipped")
        const Container = await WaitForClassPath(Item, "item-card-container")

        Container.appendChild(Equipped)
    })
})

IsFeatureEnabled("BypassAvatarEditorMobilePromptUpsellButton").then(async function(Enabled){
    if (!Enabled) return

    const Content = await WaitForClass("content")
    ChildAdded(Content, true, async function(Upsell, Disconnect){
        if (Upsell.id !== "upsell-container") return
        Disconnect()

        const Panel = await WaitForClassPath(Upsell, "part2-panel")
        const ContinueButton = document.createElement("a")
        ContinueButton.className = "btn-secondary-lg get-app-button"
        ContinueButton.innerText = "Continue anyways"

        Content.addEventListener("click", function(){
            SetFeatureEnabled("AvatarEditorForMobile", true, true).then(function(){
                window.location.reload()
            })
        })

        IsFeatureEnabled("AvatarEditorForMobile").then(function(Enabled){
            if (!Enabled) return
            setTimeout(function(){
                window.location.reload()
            }, 200)
        })

        Panel.appendChild(ContinueButton)
    })
})