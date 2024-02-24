function ModifyURLForLocale(URL){
    if (URL.includes(".roblox.com/") && !URL.endsWith("roblox.com/*") && (URL.includes("*.roblox") || URL.includes("www.roblox"))){
        const Split = URL.split(".roblox.com/")
        return [true, Split[0] + ".roblox.com/" + "*" + "/" + Split[1]]
    }

    return [false, URL]
}