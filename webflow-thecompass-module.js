const tc = {}

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
        get value() {
            return value;
        },
        set value(val) {
            update(val)
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
        // console.log("dom", dom)
        if (dom.innerText) {
            const templates = dom.innerText.match(/\{\{ [\w]+ \}\}/g)
            if (templates) {
                templates.forEach((template) => {
                    const key = template.replaceAll("{", "").replaceAll("}", "").replaceAll(" ", "")
                    if (tc[key] === undefined) {
                        tc[key] = Ref(0)
                    }
                    tc[key].subscribe((value, args) => {
                        // console.log(value, template, dom.innerText.indexOf(template) === -1)
                        if (dom.innerText.indexOf(template) === -1) {
                            dom.innerText = args.innerText.replaceAll(template, tc[key].value)
                        } else {
                            dom.innerText = dom.innerText.replaceAll(template, tc[key].value)
                        }
                    }, {innerText: dom.innerText})
                })
            }
        }
    }
    dom.getAttributeNames().forEach(name => {
        const templates = dom.getAttribute(name).match(/\{\{ [\w]+ \}\}/g)
        if (templates) {
            templates.forEach((template) => {
                const key = template.replaceAll("{", "").replaceAll("}", "").replaceAll(" ", "")
                if (tc[key] === undefined) {
                    tc[key] = Ref(0)
                }
                tc[key].subscribe((value, args) => {
                    // console.log(value, template, dom.innerText.indexOf(template) === -1)
                    if (dom.getAttribute(name).indexOf(template) === -1) {
                        dom.setAttribute(name, args.prop.replaceAll(template, tc[key].value))
                    } else {
                        dom.setAttribute(name, dom.getAttribute(name).replaceAll(template, tc[key].value))
                    }
                }, {prop: dom.getAttribute(name)})
            })
        }
    })
    return
}

window.addEventListener('load', () => {
    dfs(document)
    initTC()
    document.querySelectorAll('[aria-tc-onchange]').forEach((dom) => {
        dom.addEventListener('change', eval(dom.getAttribute('aria-tc-onchange')))
    })
    document.querySelectorAll('[aria-tc-onclick]').forEach((dom) => {
        dom.addEventListener('click', eval(dom.getAttribute('aria-tc-onclick')))
    })
    document.querySelectorAll('[aria-tc-onkeyup]').forEach((dom) => {
        dom.addEventListener('keyup', eval(dom.getAttribute('aria-tc-onkeyup')))
    })
})
window.addEventListener('unload', () => {
    Object.values(tc).forEach((value) => value.clear())
})