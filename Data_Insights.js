(function () {
  let template = document.createElement("template");
  template.innerHTML = `
<style>
    :host {}

    /* Style for the container */
    div {
        margin: 25px auto;
        max-width: 90%;
    }

    /* Style for the insights, title and list */
    .insights {
      display: block;
      margin: 0 auto;
      align-items: center;
      padding: 20px;
      box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
    }

    .insights-title {
      font-family: Arial, sans-serif;
      color: #6ef;
      text-align: center;
    }

    .insights-list {
      list-style-type: disc;
    }
  
    .insights-list li {
      font-family: Arial, sans-serif;
      color: #f97;
      margin-bottom: 10px;
    }

    /* Style for the input container */
    .input-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }

    /* Style for the output container */
    .output-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }

    /* Style for insights container*/
    .insights-container{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /*Style for the speak button without pulse*/
    .no-pulse-button {
      -webkit-animation: none;
      background: #ebd;
    }

    /*Style for the speak button with pulse*/
    .pulse-button{
      position: relative;
      top: 50%;
      left: 50%;
      margin-left: -50px;
      margin-top: -50px;
      display: block;
      width: 100px;
      height: 100px;
      line-height: 100px;
      border: none;
      border-radius: 50%;
      background: #e67;
      cursor: pointer;
      box-shadow: 0 0 0 0 rgba(#e67, .5);
      -webkit-animation: pulse 1.5s infinite;
    }

    @-webkit-keyframes pulse {
      0% {
        @include transform(scale(.9));
      }
      70% {
        @include transform(scale(1));
        box-shadow: 0 0 0 50px rgba(#e67, 0);
      }
        100% {
        @include transform(scale(.9));
        box-shadow: 0 0 0 0 rgba(#e67, 0);
      }
    }

    /* Style for the generated text area */
    #generated-text {
        padding: 10px;
        font-size: 80%;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 96%;
        height: 80%;
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
        width: 15%;
    }

    #speech-input-button {
      padding: 10px;
      font-size: 16px;
      background-color: #3cb6a9;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      width: 5%;
      height: 7%;
  }

    #read-insights-button{
      padding: 10px;
      background-color: #777;
      border-radius: 50%;
      width: 10%;
      height: 10%;
    }

    /* Style for the input field */
    #text-input {
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 7px;
        width: 70%;
    }
</style>

  <div class="widget-container">  
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
        <input type="text" id="text-input" placeholder="Question...">
        <button id="speech-input-button" class="no-pulse-button">
          <img src="https://sur-aksha.github.io/friendlyreportingui.github.io/microphone.png"/ width="20" height="20">
        </button>
        <button id="insights-button">Get Insights</button>
    </div>
    <div class="output-container">
      <textarea id="generated-text" rows="10" cols="50" readonly></textarea>
    </div>
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
    // async connectedCallback() {
    //   this.initMain();
    // }
    async initMain() {
      //Initialize parameters and set default as ""
      const { user_id = "" } = this._props || {};
      const { dashboard_name = "" } = this._props || {};
      const { local_datetime = "" } = this._props || {};
      const { authentication = "" } = this._props || {};

      // Window speech constants
      const speechSynth = window.speechSynthesis;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

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
         
        for(const element of insightsList){
          const insightItem = element.textContent;
          console.log(insightItem);
          const speech = new SpeechSynthesisUtterance(insightItem);
          speechSynth.speak(speech);
        }
      });

      // Handle speech input button click
      speechInputButton.addEventListener('click', () => {
        speechInputButton.className = 'pulse-button';
        speechInputButton.disabled = true;
        recognition.start();
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
            'Authorization': `Bearer ${apiKey}` //to be set from the application side -------------------------
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
        };

        // Re-enable the button when recognition ends
        recognition.onend = () => {
          speechInputButton.disabled = false;
          speechInputButton.className = 'no-pulse-button';
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
      const dataInsightsAPIUrl = "https://hda-friendly-reporting.me.sap.corp/api/v1/insights";
      const apiKey = "sc9as24jlpp7994x";

      this.initMain();

      this.getInsightsFromAPI(dataInsightsAPIUrl, apiKey);
    }

    // update the widget with insights from the API
    getInsightsFromAPI(apiURL, apiKey){
    
      const insightsList = this.shadowRoot.getElementById("insightsList");
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      };
      fetch(apiURL, requestOptions)
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
