(function () {
  let template = document.createElement("template");
  template.innerHTML = `
<style>
    :host {}
    
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }

    /* Style for the container */
    div {
        margin: 1rem auto;
        max-width: 98%;
    }

    /* Style for speech input button & animating microphone */

    .microphone-button {
      padding: 2%;
      display: grid;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 0;
      color: #c88500;
      background: #3a393b;
      cursor: pointer;
      overflow: hidden;
      position: relative;
    }

    @keyframes voiceRecording {
      0%, 100% { d: path("M50,30 50,70"); }
      50% { d: path("M50,10 50,90"); }
    }
    
    .listening path {
      d: path("M50,30 50,70");
      stroke-width: 18;
      animation: voiceRecording 0.5s infinite;
      transition: all 0.2s;
    }
    
    .listening path:nth-child(1) {
      transform: translate(-30%);
      animation-delay: -0.25s;
    }
    
    .listening path:nth-child(2) {
      transform: translate(30%);
      animation-delay: -0.25s;
    }
    
    .microphone-button:focus-within button {
      background: #444;
    }
    
    .microphone-button button:focus {
      background: #000;
      border: 1px dashed white;
      box-shadow: inset 0 0 0 1px white;
    }

    /* Style for the insights, title and list */
    .insights {
      display: block;
      margin: 0 auto;
      align-items: center;
      padding: 1%;
      box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
    }

    .insights-title {
      font-family: Arial, sans-serif;
      color: #e28100;
      text-align: center;
    }

    .insights-list {
      list-style-type: disc;
    }
  
    .insights-list li {
      font-family: Arial, sans-serif;
      color: #fff;
      margin-bottom: 10px;
    }

    /* Style for the input container */
    .input-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 95%
    }

    /* Style for the output container */
    .output-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Style for insights container*/
    .insights-container{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 88%;
    }

    /* Style for the generated text area */
    #generated-text {
        padding: 1%;
        font-size: 80%;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
        width: 100%;
        height: auto;
    }

    /* Style for the button */
    #insights-button {
        padding: 2%;
        font-size: 85%;
        background-color: #00709f;
        color: #fff;
        border: none;
        border-radius: 1rem;
        cursor: pointer;
    }

    #read-insights-button{
      padding: 1%;
      background-color: #3a393b;
      border-radius: 50%;
      border: 0;
    }

    /* Style for the input field */
    #text-input {
        padding: 1.5%;
        font-size: 95%;
        border: 1px solid #ccc;
        border-radius: 7px;
        width: 70%;
    }
</style>
    <div class="insights">
      <div class="insights-container">
        <h1 class="insights-title">Data Insights</h1>
        <button id="read-insights-button">
          <img src="https://sur-aksha.github.io/friendlyreportingui.github.io/microphone.png"/ width="30" height="30">
        </button>
      </div>
      <ul id="insightsList" class="insights-list"></ul>
    </div>
    <div class="input-container">
        <input type="text" id="text-input" placeholder="Type or dictate to get insights">
        <button id="speech-input-button" class="microphone-button">
             <svg viewBox="0 0 100 100" width="1.5rem" height="1.5rem" aria-hidden="true">
              <g stroke="currentColor" stroke-linecap="round" fill="none">
                <path d="M50,15 50,50" stroke-width="20"  />
                <path d="M30,35 C 25,84 75,84 70,35" stroke-width="6" />
                <path d="M50,70 50,96" stroke-width="6" />
              </g>
            </svg>
        </button>
        <button id="insights-button">Get Insights</button>
    </div>
    <div class="output-container">
      <textarea id="generated-text" rows="10" readonly></textarea>
    </div>
    `;
  class Widget extends HTMLElement {

    dataInsightsAPIUrl = "https://hda-friendly-reporting.me.sap.corp/api/v1/insights";
    apiKey = "sc9as24jlpp7994x";
    userID = this._props || {};

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
      
      const { dashboard_name = "" } = this._props || {};
      const { local_datetime = "" } = this._props || {};

      // Window speech constants
      const speechSynth = window.speechSynthesis;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      const speaking = false;
      

      //Get UI elements
      const promptInput = this.shadowRoot.getElementById("text-input");
      const generatedText = this.shadowRoot.getElementById("generated-text");
      generatedText.value = "";
      const generateButton = this.shadowRoot.getElementById("insights-button");
      const readInsightsButton = this.shadowRoot.getElementById("read-insights-button");
      const speechInputButton = this.shadowRoot.getElementById("speech-input-button");

      //configure speech recognition
      this.configureSpeechRecognition(recognition, promptInput, speechInputButton);
      
      

      //Handle read insights button click
      readInsightsButton.addEventListener('click', () => {
        const insightsList = this.shadowRoot.getElementById("insightsList").getElementsByTagName("li");
        if(!speechInputButton.classList.contains("listening")){
          this.speaking = true;
          for(const element of insightsList){
            const insightItem = element.textContent;
            console.log(insightItem);
            const speech = new SpeechSynthesisUtterance(insightItem);
            speechSynth.speak(speech);
          }
          this.speaking = false;
        }
      });

      // Handle speech input button click
      speechInputButton.addEventListener('click', () => {
        if(!speaking){
          speechInputButton.classList.add("listening");
          speechInputButton.disabled = true;
          recognition.start();  
        }
      });

      // Handle button click
      generateButton.addEventListener("click", async () => {
        const generatedText = this.shadowRoot.getElementById("generated-text");
        generatedText.value = "We are processing your request...";
        const prompt = promptInput.value;
        
        // Define API endpoint metadata
        const url = "https://hda-friendly-reporting.me.sap.corp/api/v1/llms/navigation";
        const data = { user_prompt: prompt };
        const options = {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}` //to be set from the application side -------------------------
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

    configureSpeechRecognition(recognition, promptInput, speechInputButton){
        // Configure recognition settings
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          promptInput.value = transcript;
          promptInput.scrollLeft = promptInput.scrollWidth;
        };

        // Handle recognition errors
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          speechInputButton.classList.remove("listening");
        };

        // Re-enable the button when recognition ends
        recognition.onend = () => {
          speechInputButton.disabled = false;
          speechInputButton.classList.remove("listening");
        };
    }
    getDataInsights(){
      // replace with actual insights in production 
      const jsonData = {
        "insights": [
            {
                "id": 1,
                "title": "Insight 1",
                "content": "There was a spike in the runtime from the previous week. You might want to look into that"
            },
            {
                "id": 2,
                "title": "Insight 2",
                "content": "The failures have stabilised over the past 3 weeks with 1 lesser failure per week."
            },
            {
                "id": 3,
                "title": "Insight 3",
                "content": "The documentation has new sections detailing over the newly added charts."
            },
            {
              "id": 4,
              "title": "Insight 4",
              "content": "Stages from release pipelines of Microservices ABC and XYZ have reduced runtimes."
            },
            {
                "id": 5,
                "title": "Insight 5",
                "content": "The average runtime has reduced for microservices in ABX product."
            },
            {
                "id": 6,
                "title": "Insight 6",
                "content": "The E2E runtime for Microservice ABX has reduced over the last 3 months."
            },
            {
              "id": 7,
              "title": "Insight 7",
              "content": "There is higher adoption than the past months"
            },
            {
                "id": 8,
                "title": "Insight 8",
                "content": "Change failure rates have dropped for bugs with regression label"
            },
            {
                "id": 9,
                "title": "Insight 9",
                "content": "Time to reach development has increased over the past quarter"
            }
        ],
        "user": {
            "name": "I556644"
        }
      };
      let randomIDs = this.getRandomIDs(3, 9);
      let randomInsights = [];
      randomIDs.forEach(element => {
        randomInsights.push(jsonData.insights[element].content);
      });
      return randomInsights;
    }
    getRandomIDs(numberOfInsights, maxInsights){
      let arr = [];
      while(arr.length < numberOfInsights){
          let r = Math.floor(Math.random() * maxInsights);
          if(arr.indexOf(r) === -1) arr.push(r);
      }
      return arr;
    }
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = {
        ...this._props,
        ...changedProperties
      };
      
    }
    onCustomWidgetAfterUpdate(changedProperties) {
      //this.initMain();
      if("user_id" in changedProperties){
        this.userID = changedProperties["user_id"];
        console.log("User ID from application :", this.userID);
      }
      
      this.getInsightsFromAPI();
    }

    get user_id(){
      return this.userID;
    }

    

    // update the widget with insights from the API
    getInsightsFromAPI(){
    
      const insightsList = this.shadowRoot.getElementById("insightsList");
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      };
      fetch(this.dataInsightsAPIUrl, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response failed');
          }
          return response.json();
        })
        .then(data => {
          data.insights.forEach(element => {
             insightsList.innerHTML += ('<li>'+element+'</li>');
          });
        })
        .catch(error => {
         console.error('Error:', error);
            const insights = this.getDataInsights();
            console.log(insights);
            insights.forEach(element => {
              insightsList.innerHTML += ('<li>'+element+'</li>');
           });
        });
    }
    
  }
  customElements.define("external-friendly-reporting-insights", Widget);
})();
