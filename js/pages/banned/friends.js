IsFeatureEnabled("ViewBannedUser").then(async function(Enabled){
    if (!Enabled) return
    if (!window.location.href.includes("friends")) return

    const Title = await WaitForClass("error-title")

    function Error(Text){
        Title.innerText = "Failed: "+Text
    }

    Title.innerText = "Fetching user info"

    const UserId = parseInt(window.location.href.split("banned-user/")[1])
    if (!UserId || isNaN(UserId)) return Error("UserId is not valid")

    const [Success, Account] = await RequestFunc("https://users.roblox.com/v1/users/"+UserId, "GET")
    if (!Success){
        if (Account?.errors?.[0]?.code === 3){
            Error("User does not exist")
            return
        }

        Error("Failed to fetch user info")
        return
    }
    if (!Account.isBanned){
        window.location.href = `https://www.roblox.com/users/${UserId}/friends`
        return
    }

    WaitForTag("title").then(function(Title){
        Title.innerText = "Friends - Roblox"
    })
    
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = async function(){
        if (xmlhttp.status == 200 && xmlhttp.readyState == 4){
            const Content = await WaitForClass("content")
            Content.innerHTML = xmlhttp.responseText

            Content.getElementsByClassName("friends-title")[0].innerText = `${Account.displayName} (@${Account.name})'s Friends`

            const NavTabs = Content.getElementsByClassName("nav-tabs")[0]
            const TabTemplate = NavTabs.children[0].cloneNode(true)
            NavTabs.replaceChildren()

            const List = Content.getElementsByClassName("hlist")[0]
            const Template = List.children[0].cloneNode(true)

            Content.getElementsByClassName("friends-filter")[0].remove()
            Content.getElementsByClassName("tooltip-container")[0].remove()

            function CreateFromData(Name, Data){
                const UserIds = []
                const UserIdToHeadshot = {}

                for (let i = 0; i < Data.length; i++){
                    const User = Data[i]
                    const Presence = User.presenceType
                    const PresenceString = Presence === 0 && "Offline" || Presence === 1 && "Online" || Presence === 2 && "Game" || Presence === 3 && "Studio" || "Offline"

                    const Element = Template.cloneNode(true)
                    Element.id = User.id

                    Element.getElementsByClassName("name-label")[0].innerText = `@${User.name}`
                    Element.getElementsByClassName("avatar-name")[0].innerText = User.displayName
                    Element.getElementsByClassName("presence-status")[0].innerText = PresenceString

                    const PresenceIcon = Element.getElementsByClassName("icon-game")[0]
                    if (Presence === 0 || !Presence) PresenceIcon.remove()
                    else PresenceIcon.className = `${PresenceString.toLowerCase()} icon-${PresenceString.toLowerCase()}`

                    const URL = `/users/${User.id}/profile`
                    Element.getElementsByClassName("avatar-card-link")[0].href = URL
                    Element.getElementsByClassName("avatar-name")[0].href = URL

                    UserIds.push(User.id)
                    UserIdToHeadshot[User.id] = Element.getElementsByClassName("avatar-card-image")[0].children[0]

                    List.appendChild(Element)
                }

                while (UserIds.length !== 0) {
                    const Body = []
                    for (let i = 0; i < Math.min(UserIds.length, 100); i++){
                        const UserId = UserIds.pop()
                        Body[i] = {
                            requestId: UserId,
                            targetId: UserId,
                            type: "AvatarHeadShot",
                            size: "150x150"
                        }
                    }

                    RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", {"Content-Type": "application/json"}, JSON.stringify(Body), true).then(function([Success, Body]){
                        if (!Success) return

                        const Data = Body.data
                        for (let i = 0; i < Data.length; i++){
                            UserIdToHeadshot[Data[i].targetId].src = Data[i].imageUrl
                        }
                    })
                }
            }

            let CurrentPage
            let CurrentCategory
            let Next, Prev

            const TabButtons = []

            const NextButton = Content.getElementsByClassName("pager-next")[0].children[0]
            const PrevButton = Content.getElementsByClassName("pager-prev")[0].children[0]
            const PageCounter = document.getElementById("rbx-current-page")

            function CreateSortCategory(Name, URL, Cursored){
                let PrevCursor, NextCursor
                let Cursor

                const Button = TabTemplate.cloneNode(true)
                Button.id = Name.toLowerCase()
                Button.href = `#!/${Name.toLowerCase()}`
                Button.getElementsByClassName("text-lead")[0].innerText = Name
                
                const TabButton = Button.getElementsByClassName("rbx-tab-heading")[0]
                TabButton.className = "rbx-tab-heading"
                TabButtons.push(TabButton)

                async function Get(){
                    if (CurrentCategory !== Name) CurrentPage = 1
                    TabButton.className = "rbx-tab-heading active"

                    NextButton.setAttribute("disabled", "")
                    PrevButton.setAttribute("disabled", "")
                    PageCounter.innerText = CurrentPage

                    CurrentCategory = Name
                    Next = GetNext
                    Prev = GetPrev

                    List.replaceChildren()

                    const [Success, Result] = await RequestFunc(`${URL}?cursor=${Cursor || ""}&limit=18`, "GET", undefined, undefined, true)
                    if (!Success) return

                    const [CountSuccess, CountResult] = await RequestFunc(URL+"/count", "GET", undefined, undefined, true)
                    if (CountSuccess) Content.getElementsByClassName("friends-subtitle")[0].innerText = `${Name} (${CountResult.count})`

                    PrevCursor = Result.previousPageCursor
                    NextCursor = Result.nextPageCursor

                    if (PrevCursor) PrevButton.removeAttribute("disabled")
                    if (NextCursor) NextButton.removeAttribute("disabled")

                    const Data = Result.data
                    CreateFromData(Name, Data)
                }

                function GetNext(){
                    CurrentPage++
                    Cursor = NextCursor
                    Get()
                }

                function GetPrev(){
                    CurrentPage--
                    Cursor = PrevCursor
                    Get()
                }

                Button.addEventListener("click", function(){
                    for (let i = 0; i < TabButtons.length; i++){
                        TabButtons[i].className = "rbx-tab-heading"
                    }

                    Get()
                })

                NavTabs.appendChild(Button)

                return Get
            }

            PrevButton.addEventListener("click", function(){
                Prev()
            })

            NextButton.addEventListener("click", function(){
                Next()
            })

            CreateSortCategory("Friends", `https://friends.roblox.com/v1/users/${UserId}/friends`, false)()
            CreateSortCategory("Following", `https://friends.roblox.com/v1/users/${UserId}/followings`, true)
            CreateSortCategory("Followers", `https://friends.roblox.com/v1/users/${UserId}/followers`, true)
        }
    }

    xmlhttp.open("GET", chrome.runtime.getURL("html/friends.html"), true)
    xmlhttp.send()
})