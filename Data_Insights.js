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
     /* Style for the generated text area */
     #generated-text {
         padding: 10px 3%;
         font-size: 16px;
         border: 1px solid #ccc;
         border-radius: 5px;
         width:94%;
     }
     /* Style for the button */
     #insights-button {
         padding: 10px;
         font-size: 16px;
         background-color: #3cb6a9;
         color: #fff;
         border: none;
         border-radius: 5px;
         cursor: pointer;
         width: 25%;
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
     <h2>Data Insights</h2>
       <ul>
           <li>Dummy Text 1</li>
           <li>Dummy Text 2</li>
           <li>Dummy Text 3</li>
       </ul>
   </div>
   <div>
       <input type="text" id="text-input" placeholder="Question...">
       <button id="insights-button">Get Insights</button>
       <textarea id="generated-text" rows="10" cols="50" readonly></ textarea>
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
     async connectedCallback() {
       this.initMain();
     }
     async initMain() {
       //Initialize parameters and set default as ""
       const { user_id = "" } = this._props || {};
       const { dashboard_name = "" } = this._props || {};
       const { local_datetime = "" } = this._props || {};
       const { authentication = "" } = this._props || {};

       //Get UI elements
       const generatedText = this.shadowRoot.getElementById("generated-text");
       generatedText.value = "";
       const generateButton = this.shadowRoot.getElementById("insights-button");

       // Handle button click
       generateButton.addEventListener("click", async () => {
         const promptInput = this.shadowRoot.getElementById("text-input");
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
             'Authorization': 'Bearer sc9as24jlpp7994x' //to be set from the application side -------------------------
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
   customElements.define("insights-widget", Widget);
 })();
