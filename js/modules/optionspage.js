let RequestButtonsCount = 0
let GrantedCount = 0

function OnAllGranted(){
    document.getElementById("empty-page-text").style.display = ""
}

function OnGranted(){
    GrantedCount++
    if (GrantedCount >= RequestButtonsCount) OnAllGranted()
}

function SetupRequestButton(Button, Permissions){
    RequestButtonsCount++
    
    Button.addEventListener("click", function(){
        chrome.permissions.request(Permissions, function(Granted){
            if (Granted){
                Button.style.display = "none"
                OnGranted()
            }
        })
    })

    chrome.permissions.contains(Permissions, function(Granted){
        if (Granted){
            Button.style.display = "none"
            OnGranted()
        }
    })
}

SetupRequestButton(document.getElementById("required-request-button"), {origins: ["*://*.roblox.com/", "*://*.rbxcdn.com/", "*://*.roqol.io/"]})
SetupRequestButton(document.getElementById("discord-request-button"), {origins: ["*://*.discord.com/"]})