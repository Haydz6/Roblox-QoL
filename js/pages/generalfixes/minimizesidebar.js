let IsSidebarOpen = true

function UpdateSidebar(Open){
    const Navigation = document.getElementById("navigation")

    Navigation.classList.add("roqol-sidebar-check")

    if (Open) Navigation.classList.add("minimized")
    else Navigation.classList.remove("minimized")
}

IsFeatureEnabled("MinimizableSideBar").then(async function(Enabled){
    if (!Enabled) return

    IsSidebarOpen = localStorage.getItem("sidebar-minimized") == "true" ? true : false

    const Navigation = await WaitForId("navigation")

    const Hamburger = document.createElement("li")
    Hamburger.className = "hamburger"
    Hamburger.innerHTML = `<a class="dynamic-overflow-container text-nav" id="nav-hamburger"><div><span class="icon-default-navigation"></span></div></a>`

    const List = await WaitForClassPath(Navigation, "left-col-list")
    List.appendChild(Hamburger)

    Hamburger.getElementsByTagName("a")[0].addEventListener("click", function(){
        IsSidebarOpen = !IsSidebarOpen
        localStorage.setItem("sidebar-minimized", IsSidebarOpen)
        chrome.runtime.sendMessage({type: "Sidebar", state: IsSidebarOpen})

        UpdateSidebar(IsSidebarOpen)
    })

    new MutationObserver(function(){
        if (!Navigation.classList.contains("roqol-sidebar-check")) UpdateSidebar(IsSidebarOpen)
    }).observe(Navigation, {attributes: true, attributeFilter: ["class"]})

    UpdateSidebar(IsSidebarOpen)
})

chrome.runtime.onMessage.addListener(function(Message){
    if (Message.type === "Sidebar"){
        IsSidebarOpen = Message.state
        UpdateSidebar(IsSidebarOpen)
    }
})