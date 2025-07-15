function component(name, path, {extendTagName = null, fallback = ""} = {} ) {
    // Get tag type from extendTagName
    let extendTagClass = extendTagName === null ? HTMLElement : document.createElement(extendTagName).constructor;

    // Create dynamic object
    const dynamicExtend = class DYNAMICEX extends extendTagClass {
        static fetchRan = false;    // Updates to true when fetch runs (not necessarily successfully)
        static raw = fallback;

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


            // Extract and run scripts and styles
            const scripts = DOM.querySelectorAll("script");
            const styles = DOM.querySelectorAll("style");

            if (!this.scriptsRan) {
                scripts.forEach(script => new Function("instance", "state", script.textContent)(this, this.state))        // TODO: error handling?
                
                styles.forEach(style => document.body.appendChild(style.cloneNode(true)))
            }

            scripts.forEach(s => s.remove());
            styles.forEach(s => s.remove());

            this.scriptsRan = dynamicExtend.fetchRan && true;


            // Preprocess HTML string contents (so that {expressions} are evaluated and displayed properly) and append to dom
            (DOM.body.childNodes).forEach(n => {
                if (n.nodeType == Node.ELEMENT_NODE) {
                    n.innerHTML = n.innerHTML.replace(/\{([^}]+)\}/g, (_, expr) => {                                        // TODO: error handling?
                        return new Function("instance", "state", `return (${expr})`)(this, this.state);
                    });
                }

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


    // Define element helper function
    const define = (raw) => {
        dynamicExtend.raw = raw;
        dynamicExtend.fetchRan = true;
        
        if (extendTagName === null) {
            customElements.define(name, dynamicExtend);
        } else { 
            customElements.define(name, dynamicExtend, { extends: extendTagName });
        }
    };


    // Creating the customElement 
    if (path != null) {
        fetch(path)
            .then(res => {              // Fetch content
                if (res.ok) {
                    return res.text();
                } else {
                    throw new Error(`Status from component ${name} at location ${path} threw ${res.status}`);
                    return null;
                }
            }).then(raw => {            // Retroactively add content to DYNEX 
                if (raw == null)    
                    return;
                define(raw);            // Define the custom element using the helper function
            }).catch(() => define(fallback))    // Fallback content used if fetch fails
    } else { 
        define(fallback);                       // Fallback content used if path isn't provided
    }


    // Async fetch breaks component display - manually upgrade to return display to normal
    return customElements.whenDefined(name).then(() => {
        document.querySelectorAll(`${name}, ${extendTagName}[is="${name}"]`).forEach(e => customElements.upgrade(e));
    });
}
