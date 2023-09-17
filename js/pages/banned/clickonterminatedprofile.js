IsFeatureEnabled("ViewBannedUser").then(async function(Enabled){
    if (!Enabled) return

    const TabContent = await WaitForClass("tab-content")
    ChildAdded(TabContent, true, async function(TabPane){
        const AvatarCards = await WaitForClassPath(TabPane, "friends-content", "avatar-cards")
        ChildAdded(AvatarCards, true, async function(Child){
            const UserId = parseInt(Child.id)

            const Container = await WaitForClassPath(Child, "avatar-card-container")
            if (!Container.className.includes("disabled")) return

            const Content = await WaitForClassPath(Container, "avatar-card-content")
    
            const ClickableThumbnail = document.createElement("a")
            ClickableThumbnail.className = "avatar-card-link"
            ClickableThumbnail.href = `/users/${UserId}/profile`
    
            const Avatar = await WaitForClassPath(Content, "avatar")
            const Image = await WaitForClassPath(Avatar, "avatar-card-image")
            ClickableThumbnail.appendChild(Image)
            Avatar.appendChild(ClickableThumbnail)
    
            const Caption = await WaitForClassPath(Content, "avatar-card-caption")
            const Span = await WaitForChildIndex(Caption, 0)

            const AvatarNameContainer = await WaitForClassPath(Span, "avatar-name-container")
            const AvatarName = await WaitForClassPath(AvatarNameContainer, "avatar-name")

            while (!AvatarName.innerText) await sleep(100)

            const ClickableAvatarName = document.createElement("a")
            ClickableAvatarName.className = "text-overflow avatar-name"
            ClickableAvatarName.innerText = AvatarName.innerText
            ClickableAvatarName.href = `/users/${UserId}/profile`

            AvatarName.remove()
            AvatarNameContainer.appendChild(ClickableAvatarName)
        })
    })
})