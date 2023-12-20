IsFeatureEnabled("AvatarPageCSSFix").then(async function(Enabled){
    if (!Enabled || !CSS.supports("aspect-ratio: 1/1")) return

    while (!document.body) await sleep(0)
    document.body.classList.add("avatar-page-fix")

    const ItemsList = await WaitForClassPath(document.body, "items-list", "hlist")
    ChildAdded(ItemsList, true, async function(Item){
        if (!Item.className) return

        const Equipped = await WaitForClassPath(Item, "item-card-equipped")
        const Container = await WaitForClassPath(Item, "item-card-container")

        console.log(Equipped, Container)
        Container.appendChild(Equipped)
    })
})