let CachedUserMetadata

async function FetchUserMetadata(){
    if (CachedUserMetadata) return CachedUserMetadata

    const UserData = await WaitForQuerySelector(`meta[name="user-data"]`)
    CachedUserMetadata = {DisplayName: UserData.getAttribute("data-displayname"), Name: UserData.getAttribute("data-name"), Premium: UserData.getAttribute("data-ispremiumuser") === "true", Verified: UserData.getAttribute("data-hasverifiedbadge") === "true"}
    return CachedUserMetadata
}

async function GenerateUserHeaderText(Text){
    //Options are {period} {name} {displayname}

    const Metadata = await FetchUserMetadata()

    function GetTimePeriod(){
        const Time = new Date()
        const Hour = Time.getHours()

        if (Hour > 6 && Hour < 12){
            return "morning"
        } else if (Hour > 12 && Hour < 18){
            return "afternoon"
        } else {
            return "evening"
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return capitalizeFirstLetter(Text.replace("{displayname}", Metadata.DisplayName).replace("{name}", Metadata.Name).replace("{period}", GetTimePeriod()))
}