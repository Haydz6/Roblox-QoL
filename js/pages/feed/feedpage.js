IsFeatureEnabled("Feed").then(async function(Enabled){
    if (!Enabled) return

    const Title = document?.head?.getElementsByTagName("title")?.[0]
    if (Title) Title.innerText += " - Feed"

    const Content = await WaitForClass("content")
    Content.replaceChildren()
    Content.appendChild(CreateFeed())
})