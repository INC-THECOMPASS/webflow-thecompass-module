let tc = {};
const Ref = (initialValue) => {
    let value = initialValue;
    let subscribers = [];
    const subscribe = (subscriber, bind) =>
        subscribers.push({subscriber, bind});

    const unsubscribe = (subscriber) => {
        subscribers = subscribers.filter(fn => fn.subscriber !== subscriber);
        return subscribers.length;
    }
    const clear = () => {
        subscribers = []
        return 0
    }

    const update = (updater) => {
        // we store the value as it is, and then we update.
        let oldVal = null;
        value = typeof updater === 'function' ?
            updater(value) :
            updater;

        // next, we call each subscriber function with both!
        if (subscribers)
            subscribers.forEach((subscriber) => subscriber.subscriber(value, subscriber.bind))
    }

    return Object.freeze({
        get() {
            return value;
        },
        set(val) {
            update(val);
        },
        set value(val) {
            update(val);
        },
        get value() {
            return value;
        },
        update,
        subscribe,
        unsubscribe,
    })
}

function dfs(dom) {
    if (Array.from(dom.children).length > 0) {
        Array.from(dom.children).forEach((child) => {
            dfs(child)
        })
    } else {
        console.log("dom", dom, dom.innerText)
        if (dom.innerText || (dom.getAttribute('tc-afterload') != null && dom.textContent)) {
            let templates;
            if((dom.getAttribute('tc-afterload') != null)){
                templates = dom.textContent.match(/\{\{ [\w\W]+ \}\}/g)
            }
            else {
                templates = dom.innerText.match(/\{\{ [\w\W]+ \}\}/g)
            }
            console.log("dom2", dom, dom.innerText, templates)

            if (templates) {
                templates.forEach((template) => {
                    const key = template.replaceAll("{", "").replaceAll("}", "").replaceAll(" ", "")

                    if (tc[key] === undefined) {
                        tc[key] = Ref(0)
                    }
                    const realKey = Object.keys(Object.assign(tc)).find(t => key.indexOf(t) !== -1)
                    console.log("dom3", dom, dom.innerText, realKey)
                    console.log(realKey)
                    if(realKey && realKey != "window") {
                        tc[realKey].subscribe((value, args) => {
                            const retValue = eval(key.replaceAll(realKey,realKey+".value "))
                            if((dom.getAttribute('tc-afterload') != null)) {
                                if (dom.textContent.indexOf(template) === -1) {
                                    dom.textContent = args.textContent.replaceAll(template, retValue)
                                } else {
                                    dom.textContent = dom.textContent.replaceAll(template, retValue)
                                }
                            }
                            else {
                                if (dom.innerText.indexOf(template) === -1) {
                                    dom.innerText = args.innerText.replaceAll(template, retValue)
                                } else {
                                    dom.innerText = dom.innerText.replaceAll(template, retValue)
                                }
                            }
                            dom.style.visibility = "visible";

                        }, {innerText: dom.innerText})
                    }
                })
            }
        }
    }
    if (dom.getAttributeNames) {
        dom.getAttributeNames().forEach(name => {
            const templates = dom.getAttribute(name).match(/\{\{ [\w]+ \}\}/g)
            if (templates) {
                templates.forEach((template) => {
                    const key = template.replaceAll("{", "").replaceAll("}", "").replaceAll(" ", "")
                    if (tc[key] === undefined) {
                        tc[key] = Ref(0)
                    }
                    const realKey = Object.keys(Object.assign(tc)).find(t => key.indexOf(t) !== -1)
                    if(realKey && realKey != "window") {
                        tc[realKey].subscribe((value, args) => {
                            const retValue = eval(key.replaceAll(realKey,realKey+".value"))

                            if (dom.getAttribute(name).indexOf(template) === -1) {
                                dom.setAttribute(name, args.prop.replaceAll(template, retValue))
                            } else {
                                dom.setAttribute(name, dom.getAttribute(name).replaceAll(template, retValue))
                            }
                        }, {prop: dom.getAttribute(name)})
                    }
                })
            }
        })
    }
    return
}

window.addEventListener('load', () => {
    initTC()
    dfs(document)
    Object.keys(tc).forEach(key=>{
        window[key] = tc[key]
    })
    initValue()

    document.querySelectorAll('[aria-tc-onchange]').forEach((dom) => {
        dom.addEventListener('change', eval(dom.getAttribute('aria-tc-onchange')))
    })
    document.querySelectorAll('[aria-tc-onclick]').forEach((dom) => {
        dom.addEventListener('click', eval(dom.getAttribute('aria-tc-onclick')))
    })
    document.querySelectorAll('[aria-tc-onkeyup]').forEach((dom) => {
        dom.addEventListener('keyup', eval(dom.getAttribute('aria-tc-onkeyup')))
    })
    // document.querySelectorAll('[tc-afterload]').forEach(dom=>{
    //     dom.style.visibility = "visible"
    // })
})
window.addEventListener('unload', () => {
    Object.values(tc).forEach((value) => value.clear())
})

//TODO: 1. tc-show
//TODO: 2. 이벤트 중복 가능
//TODO: 3. 한 요소 안에 여러개의 변수가 바인딩 되는거
//TODO: 4. tc-if