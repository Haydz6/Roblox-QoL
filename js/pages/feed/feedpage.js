IsFeatureEnabled("Feed").then(async function(Enabled){
    if (!Enabled) return

    const Content = await WaitForClass("content")
    Content.replaceChildren()
    Content.appendChild(CreateFeed())
})