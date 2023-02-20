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

function TweenLabel(Label, Start, End, Length, ModifierFunction, OnlyGoesUp){
    if (OnlyGoesUp && Start > End){
        return new Promise((resolve) => {
            resolve()
        })
    }

    return TweenNumber(Start, End, Length, function(i){
        Label.innerText = ModifierFunction && ModifierFunction(i) || i
    })
}

function TweenNumber(Start, End, Length, Callback) {
    const StartTime = new Date().getTime()

    const FinishedPromise = new Promise((resolve) => {
        function Step(){
            const Current = clamp(((new Date().getTime())-StartTime)/(Length*1000), 0, 1)
            
            Callback(Math.floor(GetAlphaTween(Start, End, Current)))
    
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

async function RunLiveStats(){
    const GameStatsDiv = await WaitForClass("border-top border-bottom game-stats-container follow-button-enabled")

    const ActiveValue = await GetValueLabelFromHeader(GameStatsDiv, "Active")
    const FavouritesValue = await GetValueLabelFromHeader(GameStatsDiv, "Favorites")
    const VisitsValue = await GetValueLabelFromHeader(GameStatsDiv, "Visits")

    let LastActive = 0
    let LastFavourites = 0
    let LastVisits = 0

    let IsFirst = true

    new Promise(async() => {
        while (true){
            const [Success, Info] = await GetLiveStatsFromCurrentPlace()

            if (Success){
                if (!IsFirst){
                    await Promise.all([
                        TweenLabel(ActiveValue, LastActive, Info.Playing, 5, numberWithCommas),
                        TweenLabel(FavouritesValue, LastFavourites, Info.Favourites, 5, numberWithCommas),
                        TweenLabel(VisitsValue, LastVisits, Info.Visits, 5, numberWithCommas, true)
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
    })
}

async function RunLiveLikes(){
    const VoteDetails = await WaitForClass("vote-details")
    const VoteBar = VoteDetails.getElementsByClassName("vote-container")[0].getElementsByClassName("vote-percentage")[0]

    const VoteNumbers = VoteDetails.getElementsByClassName("vote-numbers")[0]
    const DislikesLabel = VoteNumbers.getElementsByClassName("count-right")[0].getElementsByClassName("vote-text")[0]
    const LikesLabel = VoteNumbers.getElementsByClassName("count-left")[0].getElementsByClassName("vote-text")[0]

    let LastLikes = 0
    let LastDislikes = 0
    let LastRatio = 0

    let IsFirst = true

    new Promise(async() => {
        while (true){
            const [Success, Info] = await GetLikesFromCurrentPlace()

            if (Success){
                if (!IsFirst){
                    await Promise.all([
                        TweenLabel(DislikesLabel, LastDislikes, Info.Dislikes, 5, Info.Dislikes < 10000 && numberWithCommas || AbbreviateNumber),
                        TweenLabel(LikesLabel, LastLikes, Info.Likes, 5, Info.Likes < 10000 && numberWithCommas || AbbreviateNumber),
                        TweenNumber(LastRatio, Info.Ratio, 5, function(i){
                            VoteBar.style = `width: ${i}%;`
                        })
                    ])
                } else {
                    IsFirst = false

                    DislikesLabel.innerText = (Info.Dislikes < 10000 && numberWithCommas || AbbreviateNumber)(Info.Dislikes)
                    LikesLabel.innerText = (Info.Likes < 10000 && numberWithCommas || AbbreviateNumber)(Info.Likes)
                    VoteBar.style = `width: ${Info.Ratio}%;`

                    await sleep(5*1000)
                }

                LastLikes = Info.Likes
                LastDislikes = Info.Dislikes
                LastRatio = Info.Ratio
            } else {
                await sleep(5*1000)
            }
        }
    })
}

IsFeatureEnabled("LiveExperienceStats").then(function(Enabled){
    if (Enabled){
        RunLiveStats()
        RunLiveLikes()
    }
})