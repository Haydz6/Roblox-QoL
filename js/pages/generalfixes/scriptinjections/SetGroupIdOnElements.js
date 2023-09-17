async function SetGroupIdOnElement(){
    const List = document.getElementById("mCSB_2_container")

    function ChildAdded(Node, SendInitial, Callback){
        if (SendInitial){
          const children = Node.children
          if (children){
            for (let i = 0; i < children.length; i++){
              Callback(children[i])
            }
          }
        }
      
        return new MutationObserver(function(Mutations, Observer){
          Mutations.forEach(function(Mutation) {
            if (Mutation.type !== "childList") return
      
            const addedNodes = Mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++){
              Callback(addedNodes[i], function(){
                try {Observer.disconnect()} catch {}
              })
            }
          })
        }).observe(Node, {childList: true})
    }

    ChildAdded(List, true, function(Element){
        const Scope = angular.element(Element).scope()
        const GroupId = Scope?.group?.id

        if (GroupId) Element.setAttribute("groupId", GroupId)
    })
}

async function SendGroupsBackToContent_Scripts(){
    let ControllerElement
    while (true){
        ControllerElement = document.querySelector('[ng-controller="groupController"]')
        if (ControllerElement) break
        await new Promise(r => setTimeout(r, 100))
    }

    const GroupController = angular.element(ControllerElement).scope()
    document.dispatchEvent(new CustomEvent("CurrentRobloxGroups", {detail: GroupController.library.groupsList.groups}))
}

SetGroupIdOnElement()
SendGroupsBackToContent_Scripts()