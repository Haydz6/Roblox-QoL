function TooltipPinnedButton(){
    const Icons = document.getElementsByClassName("pin-button-icon")

    if (Icons.length > 0) $(Icons[0]).tooltip()
}
TooltipPinnedButton()