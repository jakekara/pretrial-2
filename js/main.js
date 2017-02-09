const d3 = require("d3");
const numeral = require("numeraljs");
const points = require("./points.js");
const slider = require("./slider.js");
const bar = require("./compare_bar.js");

var felony_url = "https://rawgit.com/trendct-data/ct-penal-code/master/output/felony-examples.json";
var misd_url = "https://rawgit.com/trendct-data/ct-penal-code/master/output/felony-examples.json";

inventory = new points.inventory();

marital = new points.factor("Marital status","")
    .add_point(0,"Not married")
    .add_point(3, "Married")
    .add_to(inventory);

charge = new points.factor("Charge (most serious)")
    .add_point(-20, "Capital felony")
    .add_point(-10, "Class A felony")
    .add_point(-9,  "Class B felony")
    .add_point(-8,  "Class C felony")
    .add_point(-7,  "Class D felony")
    .add_point(-6,  "Cass E or unclassified felony")
    .add_point(-5,  "Class A misdemeanor")
    .add_point(-4,  "Class B misdemeanor")
    .add_point(-3,  "Class C misdemeanor")
    .add_point(-2,  "Class D misdemeanor")
    .add_point(-1,  "Unclassified misdemeanor")
    .add_point(0,   "Motor vehicle violation")
    .add_to(inventory);

lives_with = new points.factor("Lives with")
    .add_point(0, "Alone")
    .add_point(2, "Nonimmediate family or roommate")
    .add_point(3, "Immediate family")
    .add_to(inventory);

references = new points.factor("Verifiable references")
    .add_point(0, "No")
    .add_point(2, "Yes")

support = new points.factor("Means of support")
    .add_point(0, "None or incarcerated")
    .add_point(2, "Reliance on others (includes government support)")
    .add_point(4, "Self-reliant (part-time, seasonal and full-time employment)")
    .add_to(inventory);

duration_employed = new points.factor("Length at employer")
    .add_point(0, "Less than one year")
    .add_point(1, "One year but less than two years")
    .add_point(2, "Two or more years at current job")
    .add_to(inventory);

education = new points.factor("Education")
    .add_point(0, "High school or less")
    .add_point(2, "More than high school")
    .add_to(inventory);

substance = new points.factor("Substance/mental health")
    .add_point(0, "No")
    .add_point(-1, "Yes")
    .add_to(inventory);

prior_fta = new points.factor("Prior failure to appear")
    .add_point(1, "No failures to appear")
    .add_point(-2, "Prior FTA for misdemeanor charge")
    .add_point(-3, "Prior FTA for a felony charge")
    .add_to(inventory)

convictions = new points.factor("Number of convictions")
    .add_point(0, "No convictions")
    .add_point(-1, "One or two convictions")
    .add_point(-2, "Prior felony convictions")
    .add_to(inventory);

record = new points.factor("Criminal record")
    .add_point(2, "No prior record")
    .add_point(-1, "Prior misdemeanor convictions")
    .add_point(-2, "Prior felony convictions")
    .add_to(inventory)

safety = new points.factor("Safety risk convictions")
    .add_point(0, "Not charged with a safety risk offense"
	       + " and does not have a safety risk conviction")
    .add_point(-2, "Charged with a safety risk offense"
	       + " and does have a safety risk convinction")
    .add_to(inventory);

instrument = new points.factor("Dangerous instrument")
    .add_point(0, "No dangerous instrument involved")
    .add_point(-2, "Dangerous instrument involved")
    .add_to(inventory);

// inventory.container(d3.select("#container"));
// inventory.draw();

var risk_color = function(d, i){
    var colors = ["maroon","tomato","orange","gold","yellow","lightyellow",
		  "white","aliceblue","lightskyblue",
		  "palegreen","forestgreen","navy","purple"];
    return colors[i];
};

// Version 2 -- challenge
var go_challenge = function(fel, mis){

    var guess_value = null;
    d3.select("#container").html("");
    var challenge = d3.select("#container")
	.append("div").classed("summary", true);


    var header_sel = challenge.append("h1")
	.text("How risky is this defendant?")
    var explainer_sel = challenge.append("div")
	.classed("explainer", true)
	.text("Try your hand at guessing how much of a 'flight risk' you think this randomly-generated defendant represents. Judicial branch employees use some of the factors below in their pretrial risk assessment scale, which is used to make recommendations for bail. Beware, some of these factors are not part of the risk assessment.");

    var got_it = challenge.append("div")
	.append("div")
	.classed("fake-button-container", true)
	.append("div")
	.classed("fake-button", true)
	.attr("id","submit-button")
	.classed("enabled", true)
	.text("Got it");
    
    var summary_sel = challenge.append("div");
    inventory.randomize().display_summary(summary_sel);
    typewriter.prepare(".typewriter");

    // var svg_container = challenge.append("div")
    // 	.style("width","100%");
    
    // var svg = svg_container.append("svg");    
    var svg_slider = new slider.slider()
	.values([-9, 9])
	.radius(20)
	.reverse(true)
	.ticks(["Very low risk",
		"",
	       "Very high risk"])
    
    var slider_sel =  challenge.append("div");
    var result_sel = challenge.append("div").classed("result_sel", true);

    var submit_guess = function(){
	
	if (d3.select(this).classed("enabled") == false) return;
	
	svg_slider.enabled(false);
	
	summary_sel
	// .style("filter","blur(2px)") //
	    .transition()
	    .duration(500)
	    .style("opacity",0.75);
	slider_sel
	    .transition()
	    .duration(250)
	    .style("opacity",0)
	    .style("height", "0px");

	setTimeout(function(){
	    slider_sel.style("display","none");
	}, 250);
	    // .style("filter","blur(3px)");
	d3.select("#submit-button").classed("enabled", false);
	d3.select("#guess-slider").attr("disabled", true);
	
	// d3.select("#picker-svg").classed("enabled", false);

	// guess_value = -1 * Number(d3.select("#guess-slider").node().value);
	guess_value = Math.round(svg_slider.value());
	
	d3.selectAll("td[data-factor]")
	    .text(function(d, i){
		var factor_i = d3.select(this).attr("data-factor");
		return numeral(inventory.factors[factor_i].selected.val)
		    .format("+0");
	    });

	typewriter.prepare(".typewriter-values");
	
	var g = guess_value;
	
	var score = inventory.score();
	if (score > 9) score = 9;
	if (score < -9) score = -9;
	score = Math.round(score);
	g = Math.round(g);
	var off_by = Math.round(Math.abs( g - score));
	if (g < score)
	    var over_under = "overestimated";
	else if (g > score)
	    var over_under = "underestimated";
	else if (g == score)
	    var over_under = "correctly estimated";
	   
	var headline = "You " + over_under + " this defendant's FTA risk";

	console.log("off_by", off_by);
	
	if (off_by == 0)
	    headine = "Correct!"
	var msg ="You guessed this defendant would have a risk score of " + numeral(g).format("+0") + ". ";
	
	msg += "The actuarial pretrial risk assessment score based on "
	    + "the factors above would be " + numeral(score).format("+0") + ".";
	result_sel.append("h1")
	    .text(headline);
	result_sel.append("div").classed("explainer", true).text(msg);

	var line_cont = result_sel
	    .append("div")
	    .style("width", "100%");

	var compline = new bar.bar()
	    .container(line_cont)
	    .values([9,-9])
	    .add_marker(new bar.marker(g, "Your guess").bottom(true))
	    .add_marker(new bar.marker(score, "Actual score"))
	    .draw();

	console.log(compline);

    }
    
    var add_slider = function(sel){

	// var svg_height = 40;

	var guess_display = sel.append("h1")
	    .text("Your guess");

	sel.append("div")
	    .classed("explainer", true)
	    .text("Set the slider to indicate your guess of this defendant's"
		   + " risk score. From left to right, the slider ranges from"
		   + " least to most risk.");
	
	var svg_container = sel.append("div")
	    .style("width","100%");
	
	var svg = svg_container.append("svg");    

	svg_slider.svg(svg)
	    .draw();

	// var slider = sel.append("input")
	//     .attr("id","guess-slider")
	//     .attr("type","range")
	//     .attr("min",-6)
	//     .attr("max",6);
	// slider.node().value = 0;
	
	// var svg = sel.append("svg")
	//     .attr("id","picker-svg")
	//     .style("height", svg_height + "px")
	//     .style("border","1px solid gray")
	//     .classed("enabled", true)
	//     .style("width", sel.node().getBoundingClientRect().width);

	var submit = sel.append("div")
	    .append("div")
	    .classed("fake-button-container", true)
	    .append("div")
	    .classed("fake-button", true)
	    .attr("id","submit-button")
	    .classed("enabled", true)
	    .text("Guess")
	    .on("click", submit_guess);

	sel.append("div").classed("clear-both", true)
	
	// var bbox = svg.node().getBoundingClientRect();
	
	// var hor_padding = 10;
	// var radius = 10;
	// var val_range = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].reverse();
	// var scale = d3.scaleLinear()
	//     .domain([val_range[0],val_range.reverse()[0]])
	//     .range([hor_padding, bbox.width - hor_padding])

	// var scale_inv = d3.scaleLinear()
	//     .domain([hor_padding, bbox.width - hor_padding])
	//     .range(val_range);

	// var box_count = 13;
	// var box_width = bbox.width / box_count;

	var guess = function(d, i){

	    // if (svg.classed("enabled") == false) return;
	    
	    // svg.selectAll("rect.box")
	    // 	.classed("selected", false);

	    d3.select(this).classed("selected", true);

	    guess_value = d3.select(this).attr("data-val");

	    submit.classed("enabled", true);

	}
	
	// svg.selectAll("rect.box")
	//     .data(val_range)
	//     .enter()
	//     .append("rect")
	//     .classed("box", true)
	//     .attr("x",function(d, i){
	// 	return i * box_width;
	//     })
	//     .attr("y", 0)
	//     .attr("width",box_width)
	//     .attr("height",svg_height)
	//     .attr("data-val", function(d){ return d; })
	//     .style("fill", risk_color)
	//     .style("strok-width","0px")
	//     .on("click", guess);
	
	

    }

    var example_offense = function(off_type, off_class){
	if (off_type.toLowerCase() == "felony")
	    var sheet = fel;
	else if (off_type.toLowerCase() == "misdemeanor")
	    var sheet = mis;

	var options = sheet.filter(function(a){
	    return a["class"].toUpperCase() == off_class.toUpperCase();
	});


	return options[Math.random() * options.length];
    }


    var type_across = function(i) {
	if (i >= inventory.factors.length) return;
	
	typewriter.type(".tw" + i,{duration: 250})
	    .then(function(){type_across(i + 1);});
    }

    summary_sel.style("display","none");
    slider_sel.style("visibility","hidden")
	.style("height","0px");

    got_it.on("click", function(){
	got_it.transition().duration(250)
	    .style("opacity",0)
	    .style("height","0px");
	setTimeout(function(){got_it.style("display","none");},100);
	summary_sel.style("display",null);
	slider_sel.style("visibility","visible")
	    .style("height",null);
	type_across(0);
    });
    
    add_slider(slider_sel);

}


d3.json(felony_url, function(fel){
    console.log("felonies", fel);
    d3.json(misd_url, function(mis){
	console.log("misdemeanors", mis);
	go_challenge(fel, mis);
    });
});

			      
