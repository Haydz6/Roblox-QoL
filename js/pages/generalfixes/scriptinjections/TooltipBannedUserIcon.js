function TooltipBannedUserIcon(){
    const Icons = document.getElementsByClassName("banned-user-icon")

    if (Icons.length > 0) $(Icons[0]).tooltip()
}
TooltipBannedUserIcon()