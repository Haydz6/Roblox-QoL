async function SetThemeToSystem(){ //If changed live
    if (!window.matchMedia) return

    function ReplaceClass(Element, Theme){
        if (!IsFeatureEnabled("SetThemeToSystem")) return
        Element.className = Element.className.replace("dark-theme", "").replace("light-theme", "") + ` ${Theme}-theme`
    }

    function GetTheme(){
        const Theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        const Opposite = Theme == "dark" ? "light" : "dark"

        return [Theme, Opposite]
    }

    let LastTheme

    function EnsureCorrectTheme(Element){
        new MutationObserver(function(Mutations){
            Mutations.forEach(function(Mutation){
                const [Theme, Opposite] = GetTheme()
                const Target = Mutation.target
                console.log(Target.className)
                if (Target.className.includes(Opposite+"-theme")) Target.className = Target.className.replace(Opposite+"-theme", "") + " "+Theme+"-theme"
            })
        }).observe(Element, {attributeFilter: ["class"]})
    }

    async function UpdateTheme(){
        if (!IsFeatureEnabled("SetThemeToSystem")) return
        const [Theme, Opposite] = GetTheme()
        LastTheme = Theme
        
        const ThemeElements = document.querySelectorAll("."+Opposite+"-theme")
        for (let i = 0; i < ThemeElements.length; i++){
            ReplaceClass(ThemeElements[i], Theme)
        }
    }

    while (!document.body || !IsFeatureEnabled("SetThemeToSystem")) await sleep(0)
    const Args = GetTheme()
    LastTheme = Args[0] //thanks js

    const Ids = ["navigation-container", "chat-container", "notification-stream-popover"]
    const Classes = ["notification-stream-base", "container-main"]
    for (let i = 0; i < Ids.length; i++){
        WaitForId(Ids[i]).then(async function(Element){
            ReplaceClass(Element, LastTheme)
            //EnsureCorrectTheme(Element)
        })
    }
    for (let i = 0; i < Classes.length; i++){
        WaitForClass(Classes[i]).then(async function(Element){
            ReplaceClass(Element, LastTheme)
            //EnsureCorrectTheme(Element)
        })
    }

    ListenForFeatureChanged("SetThemeToSystem", function(Enabled){
        if (Enabled) UpdateTheme()
    })

    //EnsureCorrectTheme(document.body)
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", UpdateTheme)
    UpdateTheme()
}
SetThemeToSystem()