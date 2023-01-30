let GroupFolders //Structure: {Groups: [GROUPID, GROUPID], Open: BOOL}
let FetchingGroupFolders = false

async function GetGroupFolders(){
    while (FetchingGroupFolders) await sleep(50)

    if (!GroupFolders){
        FetchingGroupFolders = true
        GroupFolders = await chrome.storage.getItem("robloxqol-groupfolders")
        FetchingGroupFolders = false
    }

    return GroupFolders
}