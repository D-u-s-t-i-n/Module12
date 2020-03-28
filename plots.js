function init() {
    // Initialize and populate the drop-down
    var selector = d3.select("#selDataset");
  
    d3.json("samples.json").then((data) => {
      console.log(data);
      var sampleNames = data.names;
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
    
    // Display the first volunteer data instead of blank
    optionChanged(data.names[0]);
  })}
  
  function buildMetadata(sample) {
    // Display the panel data of the volunteer
    d3.json("samples.json").then((data) => {
      var metadata = data.metadata;
      var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
      // Filter by volunteer ID, and assume only one result is returned as it is unique ID
      var resultMeta = resultArray[0];
      var PANEL = d3.select("#sample-metadata");
  
      PANEL.html("");
      Object.entries(resultMeta).forEach(entry => {
        let key = entry[0]; let value = entry[1];
        PANEL.append("h6").text(key + ": " + value);
      });
     
    });
  }

  function buildCharts(sample) {
    // Build the 3 charts - bar, bubble, and 
    d3.json("samples.json").then((data) => {
      var samples = data.samples;
      var resultArray = samples.filter(sampleObj => sampleObj.id == sample);
      var result = resultArray[0];
      
      // Grab the keys to pass to the charts
      let sample_values = resultArray.map(resultArray => parseInt(resultArray.sample_values));
      let otu_ids = resultArray.map(resultArray => parseInt(resultArray.otu_ids));
      let otu_labels = resultArray.map(resultArray => resultArray.otu_labels);

      // Gauge Plot
      var metadata = data.metadata;
      var resultArrayMeta = metadata.filter(sampleObj => sampleObj.id == sample);
      let iWashFreq = resultArrayMeta[0]["wfreq"];

      let trace = 
        {
          domain: { x: [0, 1], y: [0, 1] },
          value: iWashFreq,
          ids: {range:[0,9]},
          title: { text: "Belly Button Washing Frequency" },
          type: "indicator",
          mode: "gauge+number",
          gauge: {
            shape: "angular",
            bar: {color: "darkblue" },
            axis: { range: [null, 9] },
            steps: [
              { range: [0, 1], color: "brown"},
              { range: [1, 2], color: "red" },
              { range: [2, 3], color: "orange" },
              { range: [3, 4], color: "brown" },
              { range: [4, 5], color: "yellow" },
              { range: [5, 6], color: "yellowgreen" },
              { range: [6, 7], color: "lightgreen" },
              { range: [7, 8], color: "green" },
              { range: [8, 9], color: "darkgreen" }
            ],
          }
        };
      Plotly.newPlot("gauge", [trace]);

      // Bubble Plot
      sample_values = (result["sample_values"]);
      otu_ids = (result["otu_ids"]);
      otu_labels = result["otu_labels"];
     
       trace  = {
        type: "bubble",
        x: otu_ids,
        y: sample_values,
        mode: "markers",
        marker: {
          color: otu_ids,
          size: sample_values.map(function(x){return x*0.75}) // Reduce bubble size
        },
        text: otu_labels
      };
      layout = {colorscale: "sequential"};
      Plotly.newPlot("bubble", [trace]);

      // Bar Chart for top 10. JSon file already has the max to min sorted.
      let iMaxCount = 10;
      if (sample_values.length < iMaxCount)
      { iMaxCount = sample_values.length;}

       sample_values = (result["sample_values"].slice(0,10));
       otu_ids = (result["otu_ids"]).slice(0, 10);
       otu_ids = otu_ids.map(i => "OTU " + i);
       otu_labels = result["otu_labels"].slice(0, 10);
      
      let trace2 = {
        x: sample_values,
        y: otu_ids,
        text: otu_labels,
        orientation: "h",
        type: "bar"
        
      }; console.log(sample_values);
      let dataBar = [trace2];
      layout = {
        yaxis: {autorange: "reversed"}
      }; console.log("Test2");
      Plotly.newPlot("bar", dataBar, layout);
      
      
    });
  }

  function optionChanged(newSample) {
    // Called when the pull-down is changed (and also called at start-up)
    buildMetadata(newSample);
    buildCharts(newSample);
  }

  // Start-up
  init();