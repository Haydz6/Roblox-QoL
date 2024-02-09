IsFeatureEnabled("ShowFullVoteCount").then(async function(Enabled){
    if (!Enabled) return
    if (await IsFeatureEnabled("LiveExperienceStats")) return

    const VoteDetails = await WaitForClass("vote-details")

    const VoteNumbers = VoteDetails.getElementsByClassName("vote-numbers")[0]
    const DislikesLabel = VoteNumbers.getElementsByClassName("count-right")[0].getElementsByClassName("vote-text")[0]
    const LikesLabel = VoteNumbers.getElementsByClassName("count-left")[0].getElementsByClassName("vote-text")[0]

    const [Success, Info] = await GetLikesFromCurrentPlace()
    if (Success){
        LikesLabel.innerText = numberWithCommas(Info.Likes)
        DislikesLabel.innerText = numberWithCommas(Info.Dislikes)
    }
})