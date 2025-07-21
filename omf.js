const entityDecode = document.createElement("textarea");

function entityEval(s) {
    entityDecode.innerHTML = s;
    return entityDecode.value;
}

function filterComment(raw) {
    const DOM = new DOMParser().parseFromString(raw, "text/html"); 
    
    const walker = document.createTreeWalker(DOM.body, NodeFilter.SHOW_COMMENT); 
    let node;
    let commentNodes = [];
            
    while (node = walker.nextNode()) {
        commentNodes.push(node);
    }
            
    commentNodes.forEach(n => n.remove());
    
    return DOM.body.innerHTML;
}

function component(name, path, {extendTagName = null, fallback = ""} = {} ) {
    // Get tag type from extendTagName
    let extendTagClass = extendTagName === null ? HTMLElement : document.createElement(extendTagName).constructor;

    // Create dynamic object
    const dynamicExtend = class DYNAMICEX extends extendTagClass {
        static fetchRan = false;    // Updates to true when fetch runs (not necessarily successfully)
        static raw;

        constructor() {
            super();
            this.raw = dynamicExtend.raw;

            this.state = {};
            this.onRerender = () => {};
            this.onDestroy = () => {};
            this.templateEval = (t) => new Function("instance", "state", `return \`${t}\`;`)(this, this.state);
        }

        rerender() {
            // Clear old content
            this.textContent = "";


            // Parse raw contents into a DOM 
            const DOM = new DOMParser().parseFromString(this.raw, "text/html");


            // Preprocess HTML string contents (so that {expressions} are evaluated and displayed properly) and append to dom 
            try {
                DOM.body.innerHTML = this.templateEval(entityEval(DOM.body.innerHTML));
            } catch (e) {
                console.log(entityEval(DOM.body.innerHTML));
                throw e;
            }
            (DOM.body.childNodes).forEach(n => this.appendChild(n.cloneNode(true)));


            // Run rerender
            this.onRerender.call(this);
        }
        
        
        connectedCallback() {
            const DOM = new DOMParser().parseFromString(this.raw, "text/html");
            
            // Extract and run scripts and styles
            const scripts = DOM.querySelectorAll("script");
            const styles = DOM.querySelectorAll("style");

            if (!this.scriptsRan) {
                scripts.forEach(script => new Function("instance", "state", script.textContent)(this, this.state));        // TODO: error handling?
                    
                styles.forEach(style => document.body.appendChild(style.cloneNode(true)));
            }

            scripts.forEach(s => s.remove());
            styles.forEach(s => s.remove());
                
            this.raw = DOM.body.innerHTML;      // Recache 
                
            this.rerender();
        }


        disconnectedCallback() {
            this.onDestroy.call(this);
        }
    }


    // Define element helper function
    const define = (raw) => {
        dynamicExtend.raw = filterComment(raw);
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
