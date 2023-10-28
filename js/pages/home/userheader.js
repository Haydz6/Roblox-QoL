IsFeatureEnabled("UserHeader").then(async function(Enabled){
    if (!Enabled) return

    const HomeHeader = document.createElement("div")
    HomeHeader.className = "home-header"

    const VerifiedSVG = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cg clip-path='url(%23clip0_8_46)'%3E%3Crect x='5.88818' width='22.89' height='22.89' transform='rotate(15 5.88818 0)' fill='%230066FF'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M20.543 8.7508L20.549 8.7568C21.15 9.3578 21.15 10.3318 20.549 10.9328L11.817 19.6648L7.45 15.2968C6.85 14.6958 6.85 13.7218 7.45 13.1218L7.457 13.1148C8.058 12.5138 9.031 12.5138 9.633 13.1148L11.817 15.2998L18.367 8.7508C18.968 8.1498 19.942 8.1498 20.543 8.7508Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_8_46'%3E%3Crect width='28' height='28' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E`

    const UserData = await WaitForQuerySelector(`meta[name="user-data"]`)
    HomeHeader.innerHTML = `<span class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot"> <thumbnail-2d class="avatar-card-image"><span class="thumbnail-2d-container"><img class="user-headshot"></span></thumbnail-2d></span><h1 class="name-container"><a class="name"></a>${UserData.getAttribute("data-ispremiumuser") === "true" ? `<span class="icon-premium icon-premium-medium"></span>` : ""}${UserData.getAttribute("data-hasverifiedbadge") === "true" ? `<img class="icon-verified-badge" src="${VerifiedSVG}">` : ""}</h1>`

    HomeHeader.getElementsByClassName("name")[0].innerText = `Hello, ${UserData.getAttribute("data-displayname")}`
    HomeHeader.getElementsByTagName("a")[0].href = `https://www.roblox.com/users/${await GetUserId()}/profile`

    RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${await GetUserId()}&size=150x150&format=Png&isCircular=true`, "GET", null, null, true).then(function([Success, Body]){
        HomeHeader.getElementsByTagName("img")[0].src = Success && Body?.data?.[0]?.imageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
    })

    const HomeContainer = await WaitForId("HomeContainer")
    const Header = await WaitForClassPath(HomeContainer, "container-header")
    Header.replaceChildren()
    Header.appendChild(HomeHeader)
})