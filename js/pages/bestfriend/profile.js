IsFeatureEnabled("BestFriends").then(async function(Enabled){
    if (!Enabled) return

    const TargetId = await GetTargetId()
    if (await GetUserId() === TargetId || !TargetId) return

    let IsPinned = false
    let LastButton
    function UpdateStatus(){
        if (!LastButton) return
        LastButton.innerText = `${IsPinned ? "Remove" : "Add"} Best Friend`
    }

    let AreFriends = false

    function UpdateAreFriends(Event){
        AreFriends = Event.detail
    }
    InjectScript("AreFriendedProfile")
    document.addEventListener("RobloxQoL.areFriended", UpdateAreFriends)

    const MoreHeader = await WaitForId("profile-header-more")
    ChildAdded(MoreHeader, true, async function(Popover){
        const PopoverContent = Popover.getElementsByClassName("popover-content")[0]
        if (!PopoverContent) return

        ChildAdded(PopoverContent, true, function(List){
            if (!List.className.includes("dropdown-menu")) return
            if (!AreFriends) return

            const Item = document.createElement("li")
            const Button = document.createElement("button")
            Button.role = "button"
            LastButton = Button
            UpdateStatus()

            Button.addEventListener("click", async function(){
                IsPinned = !IsPinned
                UpdateStatus()

                const OriginalPinned = IsPinned
                const [Success] = await RequestFunc(WebServerEndpoints.BestFriends+"pin", "POST", {"Content-Type": "application/json"}, JSON.stringify({Pinned: IsPinned, UserId: TargetId}))
                if (!Success){
                    IsPinned = OriginalPinned
                    UpdateStatus()
                }
            })

            Item.appendChild(Button)
            List.insertBefore(Item, List.children[0])
        })
    })

    const [Success, Body] = await RequestFunc(WebServerEndpoints.BestFriends+"ispinned?userId="+TargetId, "GET")
    if (Success){
        IsPinned = Body.Pinned
        UpdateStatus()
    }
})