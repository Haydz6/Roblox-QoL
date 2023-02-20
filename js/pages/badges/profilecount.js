async function GetBadgesCount(UserId, Update){
    let Badges = 0
    let Cursor = ""

    return new Promise(async(resolve) => {
        while (true){
            const [Success, Result, Response] = await RequestFunc(`https://badges.roblox.com/v1/users/${UserId}/badges?limit=100&cursor=${Cursor}`, "GET", undefined, undefined, true)

            if (!Success){
                if (!Response || Response.status === 429){
                    await sleep(1000)
                    continue
                }

                Update([false, false, Badges])
            }

            Cursor = Result.nextPageCursor
            Badges += Result.data.length

            if (!Cursor) break

            Update([true, false, Badges])
        }

        Update([true, true, Badges])
        resolve()
    })
}

async function AddCountButton(Section){
    const HeaderContainer = await WaitForClassPath(Section, "container-header")
    const Header = HeaderContainer.getElementsByTagName("h2")[0]

    const CountButton = document.createElement("a")
    CountButton.className = "btn-fixed-width btn-secondary-xs btn-more see-all-link"
    CountButton.innerText = "Count"

    if (Section.id == "player-badges-container") CountButton.style.padding = "0px"

    HeaderContainer.appendChild(CountButton)

    const OriginalHeaderText = Header.innerText
    let IsCounting = false

    CountButton.addEventListener("click", async function(){
        if (IsCounting) return
        IsCounting = true

        Header.innerText = OriginalHeaderText+" (...)"

        GetBadgesCount(await GetTargetId(), function([Success, Completed, Badges]){
            if (Success){
                Header.innerText = `${OriginalHeaderText} (${Badges}${!Completed && "..." || ""})`
            } else {
                Header.innerText = OriginalHeaderText+" (Failed)"
                IsCounting = false
            }
        })
    })
}

async function LookForBadgesSection(){
    AddCountButton(await Promise.race([WaitForClass("btr-profile-playerbadges"), WaitForId("player-badges-container")]))
}

IsFeatureEnabled("CountBadges").then(function(Enabled){
    if (Enabled) LookForBadgesSection()
})