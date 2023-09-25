IsFeatureEnabled("Feed").then(async function(Enabled){
    if (!Enabled) return

    const Item = document.createElement("li")
    Item.style.display = "block"
    Item.innerHTML = `<a class="dynamic-overflow-container text-nav" href="https://www.roblox.com/feeds" id="nav-feed" target="_self"><div><span class="icon-nav-my-feed"></span></div><span class="font-header-2 dynamic-ellipsis-item">Feed</span><div class="dynamic-width-item align-right"><span class="notification-blue notification hidden" title="0" count="0">0</span></div></a>`

    const Navigation = await WaitForId("navigation")
    const List = await WaitForClassPath(Navigation, "left-col-list")
    
    List.insertBefore(Item, document.getElementById("nav-blog")?.parentNode)
})