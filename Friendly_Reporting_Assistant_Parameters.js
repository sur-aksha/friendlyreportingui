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

    /* Style for the input container */
    .input-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    /* Style for the input field */
    #prompt-input {
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 70%;
    }

    /* Style for the button */
    #generate-button {
        padding: 10px;
        font-size: 16px;
        background-color: #3cb6a9;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        width: 25%;
    }

    /* Style for the generated text area */
    #generated-text {
        padding: 10px 3%;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width:94%;
    }

    img {
      width: 20%;
      max-width: 100px;
    }

    h1 {
      font-size: 2vw;
      margin-left: 10px;
    }
</style>
  <div style="display: flex; align-items: center; justify-content: center;">
  <img src="https://erdasheshi.github.io/friendlyreportingui.github.io/FR_Icon.jpg"/>
  <h1>Friendly Reporting Assistant (parameters)</h1>
  </div>
  <div class="input-container">
      <input type="text" id="prompt-input" placeholder="Enter a prompt">
      <button id="generate-button">Generate</button>
  </div>
    <textarea id="generated-text" rows="10" cols="50" readonly></ textarea>
    <h4 style="display: flex; align-items: center; justify-content: center;">Welcome to your Dashboard Assistant! My goal is to assist you in effortlessly navigating this dashboard to quickly find the information you need.</h4>
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
    async connectedCallback() {
      this.initMain();
    }
    async initMain() {
      //Initialize parameters and set default as ""
      const { user_id = "" } = this._props || {};
      const { dashboard_name = "" } = this._props || {};
      const { local_datetime = "" } = this._props || {};
      const { authentication = "" } = this._props || {};
      console.log("user_id" + user_id);
      console.log("dashboard_name " + dashboard_name);
      console.log("local_datetime " + local_datetime);
      console.log("authentication " + authentication);

      //Get UI elements
      const generatedText = this.shadowRoot.getElementById("generated-text");
      generatedText.value = "";
      const generateButton = this.shadowRoot.getElementById("generate-button");

      // Handle button click
      generateButton.addEventListener("click", async () => {
        const promptInput = this.shadowRoot.getElementById("prompt-input");
        const generatedText = this.shadowRoot.getElementById("generated-text");
        generatedText.value = "We are processing your request";
        const prompt = promptInput.value;
        
        // Define API endpoint metadata
        const url = "https://hda-friendly-reporting.me.sap.corp/api/v1/llms/navigation";
        const data = { user_prompt: prompt };
        const options = {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authentication
          },
          body: JSON.stringify(data)
        };

        // API call and output processing
       await fetch(url, options)
          .then((response) => {
            const res = response;
            if (res.ok) {
              return res.json();
            } else {
              throw new Error('Network response failed.');
            }
          })
          .then((data) => {
            const output_guide = data.output_guide;
            generatedText.value  = output_guide;
          })
          .catch((error) => console.error(`Fetch Error: ${error}`));
      });
    }
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = {
        ...this._props,
        ...changedProperties
      };
    }
    onCustomWidgetAfterUpdate(changedProperties) {
      this.initMain();
    }
  }
  customElements.define("external-parameters-friendly-reporting-assistant", Widget);
})()
;