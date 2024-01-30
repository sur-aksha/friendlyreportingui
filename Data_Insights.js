(function () {
  let template = document.createElement("template");
  template.innerHTML = `
<style>
    :host {}

    /* Style for the container */
    div {
        margin: 25px auto;
        max-width: 80%;
    }

    /* Style for the input field */
    #text-input {
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 70%;
    }
</style>
  <div>
      <ul>
          <li>Dummy Text 1</li>
          <li>Dummy Text 2</li>
          <li>Dummy Text 3</li>
      </ul>
  </div>
  <div>
      <input type="text" id="text-input" placeholder="Enter something">
  </div>
    `;
  class Widget extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({
        mode: "open"
      });
      shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {};
    }
  }
  customElements.define("insights-widget", Widget);
})();
