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
    let List

    function AddButtonToList(){
        if (document.getElementById("add-best-friend")) return

        const Item = document.createElement("li")
        const Button = document.createElement("button")
        Button.role = "button"
        Button.id = "add-best-friend"
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
    }

    function UpdateAreFriends(Event){
        AreFriends = Event.detail
        if (AreFriends && List) AddButtonToList()
    }
    InjectScript("AreFriendedProfile")
    document.addEventListener("RobloxQoL.areFriended", UpdateAreFriends)

    const MoreHeader = await WaitForClassPath(await WaitForQuerySelector(".profile-header:not(.hidden)"), "profile-header-more")
    const DropdownContainer = await WaitForClassPath(MoreHeader, "profile-dropdown")

    console.log(DropdownContainer)
    ChildAdded(DropdownContainer, true, async function(NewList){
        if (!NewList.className.includes("dropdown-menu")) return
        List = NewList
        List.style["max-height"] = "300px"
        if (!AreFriends) return

        AddButtonToList()
    })

    const [Success, Body] = await RequestFunc(WebServerEndpoints.BestFriends+"ispinned?userId="+TargetId, "GET")
    if (Success){
        IsPinned = Body.Pinned
        UpdateStatus()
    }
})