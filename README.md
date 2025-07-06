# One More Framework
A ~100 line JavaScript frontend framework inspired by the likes of Raylib. 

Give you the power of components and some local state, allowing you to just program nicely in pure JavaScript. 

It doesn't use NPM. It doesn't have megabytes of dependencies. It's all a single function to register where components are stored and native web components. You don't need hours of tutorials to learn how to use it. JavaScript comes prepackaged with the tools for most jobs anyway.

This isn't suitable for targeting older browsers, due to it's dependency on the web component API.

The original reason for One More Framework was just to have elements like a Navbar be stored in a separate place and changes to be propagated through every page with a single change (basically - HTML with the DRY principle). I originally achieved this by having the "component" fetched with HTMX, but I realised I could do one better if I relied on JavaScript.

# This framework is undergoing heavy development in order to ensure it is as light but feature-filled as possible. Changes are expected to happen.
## Planned Changes
- Re-evaluation on the way `fallback` works.
- Re-evaluation for the need of local state being tied to the component
- Making scripts throw custom errors rather than browser-default ones
