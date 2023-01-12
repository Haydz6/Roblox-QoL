async function GetValueLabelFromHeader(GameStatsDiv, Text){
    while (true){
        const children = GameStatsDiv.children

        for (let i = 0; i < children.length; i++){
            const child = children[i]

            if (child.className.search("game-stat") === -1) continue
            
            const Header = child.children[0]
            let Value = child.children[1]

            if (Header && Value){
                const Span = Value.children[0]

                if (Span) Value = Span

                if (Header.innerText === Text) return Value
            }
        }

        await sleep(100)
    }
}

function GetAlphaTween(b, e, i){
    return b + ((i/1) * (e-b))
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function TweenNumber(Label, Start, End, Length) {
    const StartTime = new Date().getTime()
    const EndTime = StartTime + (Length * 1000)

    const FinishedPromise = new Promise((resolve, reject) => {
        function Step(){
            const Current = clamp(((new Date().getTime())-StartTime)/(Length*1000), 0, 1)
    
            Label.innerText = numberWithCommas(Math.floor(GetAlphaTween(Start, End, Current)))
    
            if (Current < 1){
                window.requestAnimationFrame(Step)
            } else {
                resolve()
            }
        }
    
        window.requestAnimationFrame(Step)
    })

    return FinishedPromise
}

async function Main(){
    console.log("starting live stats")

    const GameStatsDiv = await WaitForClass("border-top border-bottom game-stats-container follow-button-enabled")

    const ActiveValue = await GetValueLabelFromHeader(GameStatsDiv, "Active")
    const FavouritesValue = await GetValueLabelFromHeader(GameStatsDiv, "Favorites")
    const VisitsValue = await GetValueLabelFromHeader(GameStatsDiv, "Visits")

    let LastActive = 0
    let LastFavourites = 0
    let LastVisits = 0

    let IsFirst = true

    while (true){
        const [Success, Info] = await GetLiveStatsFromCurrentPlace()

        if (Success){
            if (!IsFirst){
                await Promise.all([
                    TweenNumber(ActiveValue, LastActive, Info.Playing, 5),
                    TweenNumber(FavouritesValue, LastFavourites, Info.Favourites, 5),
                    TweenNumber(VisitsValue, LastVisits, Info.Visits, 5)
                ])
            } else {
                IsFirst = false

                ActiveValue.innerText = numberWithCommas(Info.Playing)
                FavouritesValue.innerText = numberWithCommas(Info.Favourites)
                VisitsValue.innerText = numberWithCommas(Info.Visits)

                await sleep(5*1000)
            }

            LastActive = Info.Playing
            LastFavourites = Info.Favourites
            LastVisits = Info.Visits
        } else {
            await sleep(5*1000)
        }
    }
}

if (IsFeatureEnabled("LiveExperienceStats")){
    Main()
}