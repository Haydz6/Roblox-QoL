IsFeatureEnabled("ShowFollowsYou").then(async function(Enabled){
    if (!Enabled || (await GetUserId() == GetTargetId())) return

    const [Success, Body] = await RequestFunc("https://friends.roblox.com/v1/user/following-exists", "POST", null, JSON.stringify({targetUserIds: [GetTargetId()]}), true)
    if (!Success || !Body?.followings?.[0]?.isFollowed) return

    const HeaderTitle = await WaitForClass("header-title")
    const Image = document.createElement("img")
    Image.src = chrome.runtime.getURL("img/profile/followsyou.png")
    Image.style = "height: 30px; width: 30px; margin: 0px 10px;"
    Image.id = "FollowsYouIcon"

    Image.setAttribute("data-toggle", "tooltip")
    Image.setAttribute("data-placement", "bottom")
    Image.setAttribute("data-original-title", "Follows You")

    HeaderTitle.appendChild(Image)
    InjectScript("TooltipFollowsYou")
})