IsFeatureEnabled("UserHeader").then(async function(Enabled){
    if (!Enabled) return

    const HomeHeader = document.createElement("div")
    HomeHeader.className = "home-header"
    HomeHeader.innerHTML = `<span class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot"> <thumbnail-2d class="avatar-card-image"><span class="thumbnail-2d-container"><img></span></thumbnail-2d></span><h1 class="name-container"><a class="name"></a></h1>`

    const UserData = await WaitForQuerySelector(`meta[name="user-data"]`)
    HomeHeader.getElementsByClassName("name")[0].innerText = `Hello, ${UserData.getAttribute("data-displayname")}`
    HomeHeader.getElementsByTagName("a")[0].href = `https://www.roblox.com/users/${await GetUserId()}/profile`

    RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${await GetUserId()}&size=150x150&format=Png&isCircular=true`, "GET", null, null, true).then(function([Success, Body]){
        HomeHeader.getElementsByTagName("img")[0].src = Success && Body?.data?.[0]?.imageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
    })

    const HomeContainer = await WaitForId("HomeContainer")
    const Header = await WaitForClassPath(HomeContainer, "container-header")
    Header.replaceChildren()
    Header.appendChild(HomeHeader)

    //Support for premium and verified
})