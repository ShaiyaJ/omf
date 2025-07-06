function component(name, path, {extendTagName = null, fallback = "", state = {}} = {} ) {
    // Get tag type from extendTagName
    let extendTagClass = extendTagName === null ? HTMLElement : document.createElement(extendTagName).constructor;

    // Create dynamic object
    const dynamicExtend = class DYNEX extends extendTagClass {
        static fetchRan = false;  // Updates to true when fetch runs (not necessarily successfully)
        static raw = fallback ? fallback : "";

        constructor() {
            super();
            this.scriptsRun = false;

            this.state = structuredClone(state);
            this.onCreate = () => {};
            this.onRerender = () => {};
            this.onDestroy = () => {};
        }

        rerender() {
            // Clear old content
            this.innerHTML = "";

            // Parse raw contents into a DOM
            const DOM = new DOMParser().parseFromString(dynamicExtend.raw, "text/html");

            // Preprocess HTML string contents and run scripts
            (DOM.body.childNodes).forEach(n => {
                if (!["SCRIPT", "STYLE"].includes(n.tagName) && n.nodeType === Node.ELEMENT_NODE) {     // Preprocessing non-"code" children - replacing {} with the resulting JS
                    n.innerHTML = n.innerHTML.replace(/\{([^}]+)\}/g, (_, expr) => {    // TODO: error handling?
                        return new Function("component", "state", `return (${expr})`)(this, this.state);
                    });
                } else {    // Otherwise, run the scripts and delete the tags
                    if (!this.scriptsRun) {
                        const scripts = DOM.querySelectorAll("script");

                        scripts.forEach(script => {
                            new Function("component", "state", script.textContent)(this, this.state);        // TODO: error handling?
                            script.remove();
                        });
                    }

                }
            });

            if (dynamicExtend.fetchRan && !this.scriptsRun)         // Re-run onCreate when the content is avaliable
                this.onCreate.call(this);

            this.scriptsRun = dynamicExtend.fetchRan && true;
            
            // Append each node of this DOM to the instance of the tag
            (DOM.body.childNodes).forEach(node => {
                this.appendChild(node.cloneNode(true));
            });

            // Run rerender
            this.onRerender.call(this);
        }
        
        connectedCallback() {
            this.onCreate.call(this);
            this.rerender();
        }

        disconnectedCallback() {
            this.onDestroy.call(this);
        }
    }


    // Creating the customElement 
    fetch(path)
        .then(res => {              // Fetch content
            if (res.ok)
                return res.text();
            else {
                throw new Error(`Status from component ${name} at location ${path} threw ${res.status}`);
                return null;
            }
        }).then(raw => {            // Retroactively add content to DYNEX 
            dynamicExtend.fetchRan = true;

            if (raw === null)
                return;

            dynamicExtend.raw = raw;
        }).then(_ => {              // Define the custom element
            if (extendTagName === null)
                customElements.define(name, dynamicExtend);
            else 
                customElements.define(name, dynamicExtend, { extends: extendTagName });
        });


    // Async fetch breaks component display - manually upgrade to return display to normal
    return customElements.whenDefined(name).then(() => {
        document.querySelectorAll(`${name}, ${extendTagName}[is="${name}"]`).forEach(e => customElements.upgrade(e));
    });
}
