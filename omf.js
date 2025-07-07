function component(name, path, {extendTagName = null, fallback = ""} = {} ) {
    // Get tag type from extendTagName
    let extendTagClass = extendTagName === null ? HTMLElement : document.createElement(extendTagName).constructor;

    // Create dynamic object
    const dynamicExtend = class DYNEX extends extendTagClass {
        static fetchRan = false;  // Updates to true when fetch runs (not necessarily successfully)
        static raw = fallback ? fallback : "";

        constructor() {
            super();
            this.scriptsRan = false;

            this.state = {};
            this.onRerender = () => {};
            this.onDestroy = () => {};
        }

        rerender() {
            // Clear old content
            this.innerHTML = "";


            // Parse raw contents into a DOM
            const DOM = new DOMParser().parseFromString(dynamicExtend.raw, "text/html");


            // Extract and run scripts
            const scripts = DOM.querySelectorAll("script");

            if (!this.scriptsRan) {
                scripts.forEach(script => {
                    new Function("instance", "state", script.textContent)(this, this.state);        // TODO: error handling?
                });
            }

            scripts.forEach(s => s.remove());

            this.scriptsRan = dynamicExtend.fetchRan && true;


            // Preprocess HTML string contents and append to dom
            (DOM.body.childNodes).forEach(n => {
                if (n.nodeType == Node.ELEMENT_NODE)
                    n.innerHTML = n.innerHTML.replace(/\{([^}]+)\}/g, (_, expr) => {    // TODO: error handling?
                        return new Function("instance", "state", `return (${expr})`)(this, this.state);
                    });

                this.appendChild(n.cloneNode(true));
            });


            // Run rerender
            this.onRerender.call(this);
        }
        
        connectedCallback() {
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
