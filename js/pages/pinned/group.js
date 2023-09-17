IsFeatureEnabled("PinnedGroups").then(async function(Enabled){
    if (!Enabled) return

    let GroupsList
    const Divider = document.createElement("div")
    Divider.className = "rbx-divider"

    const SavedGroupPositions = {}
    const GroupElements = {}
    let PinnedGroups = []

    function GetElementIndex(Element, Children){
        if (!Children) Children = Element.parentElement.children
        for (let i = 0; i < Children.length; i++){
            if (Children[i] === Element){
                return i
            }
        }
    }

    function UpdateGroupPinStatus(Element, GroupId, Pinned){
        if (Pinned){
            const Children = GroupsList.children
            let Index = GetElementIndex(Element, Children)
            if (Index) Index = Children.length - (Index + 1)

            SavedGroupPositions[GroupId] = Index
            GroupsList.insertBefore(Divider, GroupsList.children[0])

            const AppendOrder = []
            for (const [GroupId, Element] of Object.entries(GroupElements)){
                const Index = PinnedGroups.indexOf(parseInt(GroupId))
                if (Index === -1) continue
                AppendOrder.push({GroupId: GroupId, Element: Element, Order: Index})
            }

            AppendOrder.sort(function(a, b){
                return a.Order - b.Order
            })

            for (let i = 0; i < AppendOrder.length; i++){
                GroupsList.insertBefore(AppendOrder[i].Element, Divider)
            }
        } else {
            let Index = SavedGroupPositions[GroupId]
            if (!Index){
                Index = -1
            } else {
                Index = GroupsList.children.length - Index
            }
            
            GroupsList.insertBefore(Element, GroupsList.children[Index])
        }

        if (PinnedGroups.length === 0) Divider.remove()
    }

    const TooltipButtonContainer = document.createElement("li")
    const TooltipDiv = document.createElement("div")
    const TooltipButton = document.createElement("button")
    TooltipDiv.appendChild(TooltipButton)
    TooltipButtonContainer.appendChild(TooltipDiv)

    let IsUpdatingPin = false
    let LastGroupId

    function GetGroupId(){
        return parseInt(window.location.href.split("groups/")[1].split("/")[0])
    }

    function UpdateEnabled(){
        TooltipButton.innerText = PinnedGroups.includes(GetGroupId()) ? "Unpin" : "Pin"
    }

    setInterval(function(){
        if (LastGroupId === GetGroupId()) return
        LastGroupId = GetGroupId()

        UpdateEnabled()
    }, 100)

    async function TogglePin(){
        if (IsUpdatingPin) return
        IsUpdatingPin = true

        const OriginalPinned = PinnedGroups.includes(GetGroupId())
        if (OriginalPinned){
            PinnedGroups.splice(PinnedGroups.indexOf(GetGroupId()), 1)
        } else {
            PinnedGroups.push(GetGroupId())
        }

        UpdateEnabled()
        UpdateGroupPinStatus(GroupElements[GetGroupId()], GetGroupId(), !OriginalPinned)

        const [Success] = await RequestFunc(WebServerEndpoints.Pinned+"group/pin", "POST", null, JSON.stringify([{GroupId: GetGroupId(), Pinned: !OriginalPinned}]))
        if (!Success){
            // if (OriginalPinned){
            //     PinnedGroups.splice(PinnedGroups.indexOf(GetGroupId()), 1)
            // } else {
            //     PinnedGroups.push(GetGroupId())
            // }
        }
        IsUpdatingPin = false
    }

    WaitForClass("group-menu").then(function(Menu){
         ChildAdded(Menu, true, async function(Child){
            if (Child.className.includes("popover")) {
                const List = await WaitForClassPath(Child, "popover-content", "dropdown-menu")
                List.insertBefore(TooltipButtonContainer, List.children[0])
            }
        })

        UpdateEnabled()
    })

    TooltipButtonContainer.addEventListener("click", TogglePin)

    RequestFunc(WebServerEndpoints.Pinned+"group/pinned", "GET").then(function([Success, Body]){
        if (!Success) return

        PinnedGroups = Body
        UpdateEnabled()

        WaitForId("mCSB_2_container").then(async function(List){
            GroupsList = List
            ChildAdded(List, true, async function(GroupItem){
                if (!GroupItem.className) return
                //if (GroupItem !== Divider) GroupsList.insertBefore(Divider, GroupsList.children[0])

                if (GroupItem.getAttribute("hooked")) return
                GroupItem.setAttribute("hooked", true)

                //scope this
                let GroupId
                while (true){
                    GroupId = parseInt(GroupItem.getAttribute("groupId"))
                    if (GroupId && !isNaN(GroupId)) break
                    await sleep(50)
                }
    
                GroupElements[GroupId] = GroupItem
                if (PinnedGroups.includes(GroupId)) UpdateGroupPinStatus(GroupItem, GroupId, true)
            })

            InjectScript("SetGroupIdOnElements")
        })
    })

    document.addEventListener("CurrentRobloxGroups", function(Event){
        const Groups = Event.detail
        const InGroupsLookup = {}

        for (let i = 0; i < Groups.length; i++){
            InGroupsLookup[Groups[i].id] = true
        }

        const LeaveGroups = []
        for (let i = 0; i < PinnedGroups.length; i++){
            if (!InGroupsLookup[PinnedGroups[i]]){
                LeaveGroups.push({GroupId: PinnedGroups[i], Pinned: false})
            }
        }
        if (LeaveGroups.length == 0) return
        RequestFunc(WebServerEndpoints.Pinned+"group/pin", "POST", null, JSON.stringify(LeaveGroups))
    })

    UpdateEnabled()
})