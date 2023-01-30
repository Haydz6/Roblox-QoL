function GetRecentServers(CurrentPlaceId){
    return chrome.runtime.sendMessage({type: "getrecentservers", placeId: CurrentPlaceId})
}