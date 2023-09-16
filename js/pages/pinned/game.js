IsFeatureEnabled("PinnedGames").then(async function(Enabled){
    if (!Enabled) return

    const PinButton = document.createElement("a")
    PinButton.className = "pin-button-icon"

    const PinImage = document.createElement("img")

    PinButton.appendChild(PinImage)

    const TooltipButtonContainer = document.createElement("li")
    const TooltipDiv = document.createElement("div")
    const TooltipButton = document.createElement("button")
    TooltipDiv.appendChild(TooltipButton)
    TooltipButtonContainer.appendChild(TooltipDiv)

    let IsPinned = false
    let IsUpdatingPin = false

    let ActionMenuInit = false

    const UniverseId = await GetUniverseIdFromGamePage()

    function UpdateEnabled(){
        TooltipButton.innerText = IsPinned ? "Unpin" : "Pin"
        PinImage.src = chrome.runtime.getURL(`img/pinned/${IsPinned ? "" : "un"}pinned.png`)
        PinImage.className = `pin-icon ${IsPinned ? "" : "un"}pinned`
        //Tooltip roblox
    }

    async function TogglePin(){
        if (IsUpdatingPin) return
        IsUpdatingPin = true

        const OriginalPinned = IsPinned
        IsPinned = !IsPinned

        UpdateEnabled()

        const [Success] = await RequestFunc(WebServerEndpoints.Pinned+"pin", "POST", null, JSON.stringify({UniverseId: UniverseId, Pinned: IsPinned}))
        if (!Success){
            IsPinned = OriginalPinned
        }
        IsUpdatingPin = false
    }

    WaitForId("game-context-menu").then(function(Menu){
        ActionMenuInit = true

        PinButton.remove()

        ChildAdded(Menu, true, async function(Child){
            if (Child.className.includes("popover")) {
                const List = await WaitForClassPath(Child, "popover-content", "dropdown-menu")
                List.insertBefore(TooltipButtonContainer, List.children[0])
            }
        })

        UpdateEnabled()
    })
    WaitForClass("game-calls-to-action").then(function(ActionMenu){
        if (ActionMenuInit) return

        ActionMenu.insertBefore(PinButton, ActionMenu.children[0])
    })

    PinButton.addEventListener("click", TogglePin)
    PinButton.addEventListener("mouseenter", function(){
        PinImage.src = chrome.runtime.getURL("img/pinned/pinned.png")
        PinImage.className = "pin-icon pinned"
    })

    PinButton.addEventListener("mouseleave", function(){
        UpdateEnabled()
    })

    TooltipButtonContainer.addEventListener("click", TogglePin)

    RequestFunc(WebServerEndpoints.Pinned+"ispinned?universeId="+UniverseId, "GET").then(function([Success, Body]){
        if (!Success) return
        IsPinned = Body.Pinned
        UpdateEnabled()
    })

    UpdateEnabled()
})