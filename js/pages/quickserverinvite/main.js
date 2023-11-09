const InviteCache = {}

let PreviousBox

async function GetInvite(PlaceId, JobId){
    if (InviteCache[JobId]){
        while (InviteCache[JobId] === true) await sleep(50)

        if (!InviteCache[JobId]){
            return [false]
        }

        return [true, InviteCache[JobId]]
    }

    InviteCache[JobId] = true

    const [Success, Result] = await RequestFunc(`${WebServerEndpoints.Servers}invite?placeId=${PlaceId}&jobId=${JobId}`, "GET")

    if (!Success){
        delete InviteCache[JobId]
        return [false]
    }

    InviteCache[JobId] = Result.Invite
    return [true, Result.Invite]
}

async function ElementAdded(Element){
	if (Element.className.search("game-server-item") === -1 || Element.className.search("rbx-private-game-server-item") > -1) return

    const CardItem = Element.getElementsByClassName("card-item")[0]
    let GameDetails

    while (!GameDetails){
        await sleep(50)
        GameDetails = CardItem.getElementsByClassName("game-server-details")[0]
    }

	let Buttons
    const GameDetailsChildren = GameDetails.children

    for (let i = 0; i < GameDetailsChildren.length; i++){
        if (GameDetailsChildren[i].tagName.toLowerCase() === "span"){
            Buttons = GameDetailsChildren[i]
            break
        }
    }

    Buttons.children[0].style = "width: 70%!important; max-width: 70%!important; min-width: 30%!important;"

    if (Buttons.children.length > 1) return

    const InviteButton = CreateServerButton("Invite")
    Buttons.appendChild(InviteButton)

    const ButtonRemovedObserver = new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return
    
            const NewNodes = Mutation.removedNodes
            for (let i = 0; i < NewNodes.length; i++){
                const Node = NewNodes[i]
    
                if (InviteButton === Node){
                    Buttons.appendChild(InviteButton)
                }
            }
        })
    })
    ButtonRemovedObserver.observe(Buttons, {childList: true})

    let CurrentBox

    InviteButton.addEventListener("click", async function(){
        if (CurrentBox && !CurrentBox.parentNode){
            CurrentBox = null
        }
        if (PreviousBox && CurrentBox === PreviousBox){
            PreviousBox.remove()
            PreviousBox = null
            return
        }
        if (PreviousBox){
            PreviousBox.remove()
        }

        const [InviteBox, Input, CopiedToClipboard] = CreateInviteBox()

        Buttons.appendChild(InviteBox)

        CurrentBox = InviteBox
        PreviousBox = InviteBox

        Input.value = "Loading..."
        const [Success, Invite] = await GetInvite(Element.getAttribute("placeid"), Element.getAttribute("jobid"))
        Input.value = Success && Invite || "Failed to generate"

        let ClickInt = 0

        if (Success){
            Input.addEventListener("click", async function(){
                ClickInt ++

                Input.select()
                navigator.clipboard.writeText(Invite).then(async() => {
                    CopiedToClipboard.style = ""
                    CopiedToClipboard.innerText = "Copied to clipboard!"

                    const CacheClickInt = ClickInt
                    await sleep(2000)
                    if (CacheClickInt === ClickInt) CopiedToClipboard.style = "display: none;"
                }, async() => {
                    CopiedToClipboard.style = ""
                    CopiedToClipboard.innerText = "Failed to copy!"

                    const CacheClickInt = ClickInt
                    await sleep(2000)
                    if (CacheClickInt === ClickInt) CopiedToClipboard.style = "display: none;"
                })
            })
        }
    })
}

function NewServerAddedMutationInvite(Mutations){
    Mutations.forEach(function(Mutation){
        if (Mutation.type !== "childList") return

        const NewNodes = Mutation.addedNodes

        for (let i = 0; i < NewNodes.length; i++){
            ElementAdded(NewNodes[i])
        }
    })
}

function HandleInviteList(Id){
	WaitForId(Id).then(function(ServerList){
		new MutationObserver(NewServerAddedMutationInvite).observe(ServerList, {childList: true})

		const children = ServerList.children

		for (let i = 0; i < children.length; i++){
			ElementAdded(children[i])
		}
	})
}

setTimeout(function(){
    IsFeatureEnabled("QuickInvite").then(function(Enabled){
        if (!Enabled) return

        HandleInviteList("rbx-game-server-item-container")
        HandleInviteList("rbx-friends-game-server-item-container")
        HandleInviteList("rbx-recent-game-server-item-container")
        HandleInviteList("rbx-voice-game-server-item-container")
    })
}, 0)