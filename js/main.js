const d3 = require("d3");
const numeral = require("numeraljs");
const points = require("./points.js");
const slider = require("./slider.js");
const bar = require("./compare_bar.js");
wiggler = require("./wiggle.js");

var felony_url = "https://rawgit.com/trendct-data/ct-penal-code/master/output/felony-examples.json";
var misd_url = "https://rawgit.com/trendct-data/ct-penal-code/master/output/misdemeanor-examples.json";
var bond_url = "https://cdn.rawgit.com/trendct-data/ct-penal-code/6f75c329/data/bond_amount_table.tsv"

inventory = new points.inventory();

marital = new points.factor("Marital status","")
    .add_point(0,"Not married")
    .add_point(3, "Married")
    .add_to(inventory);

charge = new points.factor("Charge (most serious)")
// .add_point(-20, "Capital felony")
    .add_point(-10, "Class A felony")
    .add_point(-9,  "Class B felony")
    .add_point(-8,  "Class C felony")
    .add_point(-7,  "Class D felony")
// .add_point(-6,  "Class E or unclassified felony")
    .add_point(-5,  "Class A misdemeanor")
    .add_point(-4,  "Class B misdemeanor")
    .add_point(-3,  "Class C misdemeanor")
// .add_point(-2,  "Class D misdemeanor")
// .add_point(-1,  "Unclassified misdemeanor")
// .add_point(0,   "Motor vehicle violation")
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
	       + " and does have a safety risk conviction")
    .add_to(inventory);

instrument = new points.factor("Dangerous instrument")
    .add_point(0, "No dangerous instrument involved")
    .add_point(-2, "Dangerous instrument involved")
    .add_to(inventory);

// load the regular slide presentation
// inventory.container(d3.select("#container"));
// inventory.draw();

/*
 * colorize
 */
var risk_color = function(d, i){
    var colors = ["maroon","tomato","orange","gold","yellow","lightyellow",
		  "white","aliceblue","lightskyblue",
		  "palegreen","forestgreen","navy","purple"];
    return colors[i];
};


/*
 *  parse the charges string, returning an array containing
 * the type and class of the offense 
 */
var charge_parse = function(ch){
    var otype = null, oclass = null;

    if (ch.indexOf("felony") >= 0)
	otype = "felony";
    else if (ch.indexOf("misdemeanor") >= 0)
	otype = "misdemeanor";

    if (ch.indexOf("Class ") >= 0){
	oclass = ch.split(" ")[1];
    }

    if (ch.toLowerCase().indexOf("unclassified") >= 0){
	otype = ch.split(" ").reverse()[0].toLowerCase();
	oclass = "unclassified";
    }

    if (ch.indexOf("Capital") >= 0){
	oclass = "felony";
	otype = "capital";
    }
    if (ch == "Motor vehicle violation") otype = "motor vehicle violation";
    return [otype, oclass];
}

var bond_amount = function (otype, oclass, rscore, amts){
    if (otype.toLowerCase().trim() == "motor vehicle violation") return null;
    if (otype.toLowerCase().trim() == "capital") return null;
    if (rscore > 6) var rscore = 6;
    if (rscore < -6) var rscore = -6;
    var index = numeral(rscore).format("+0");
    
    var otype = otype.toUpperCase().trim();
    if (oclass.toUpperCase().indexOf("UNCLASSIFIED") >= 0)
	var oclass = "UNCLASSIFIED"
    else
	var oclass = ("CLASS " + oclass).toUpperCase();

    var matches = amts.filter(function(d){
	if (d["class"].trim().toUpperCase() == oclass
	    && d["otype"].trim().toUpperCase() == otype){
	    return true;
	}

	return false;


    });
    var row = matches[0];
    return row[index];
}


var get_example_offense = function(off_type, off_class, mis, fel){
    if (off_type.toLowerCase() == "felony")
	var sheet = fel;
    else if (off_type.toLowerCase() == "misdemeanor")
	var sheet = mis;
    var options = sheet.filter(function(a){
	return a["class"].toUpperCase() == off_class.toUpperCase()
	    && a["type"].toUpperCase() == off_type.toUpperCase();
    });
    return options[Math.floor(Math.random() * options.length)];
}


// Version 2 -- challenge
var go_challenge = function(fel, mis, amts){

    // wrap bond_amount function
    var bond_amt = function (otype, oclass, rscore){
	return bond_amount (otype, oclass, rscore, amts);
    }

    // wrap get_example_offense function
    var example_offense = function(off_type, off_class){
	return get_example_offense(off_type, off_class, mis, fel);
    }

    var guess_value = null; 		    // the user's guess score

    d3.select("#container").html(""); 	    // clear the countainer
    
    var challenge = d3.select("#container") // set up the display
	.append("div").classed("summary", true);


    var header_sel = challenge.append("h1")
	.text("How much of a 'flight risk' is defendant X?")
    
    var explainer_sel = challenge.append("div")
	.classed("explainer", true)
	.text("Try your hand at guessing how much of a 'flight risk' you think a randomly-generated defendant poses based on the factors below. Judicial branch bail staff weight these factors to try and predict how likely the defendant is to show up in court, and ultimately make a recommendation to a judge for either non-financial release or a bond amount.");

    var got_it = challenge.append("div")
	.append("div")
	.classed("fake-button-container", true)
	.append("div")
	.classed("fake-button", true)
	.attr("id","submit-button")
	.classed("enabled", true)
	.text("OK, go");

    new wiggler.wiggler(got_it).dance_party();

    var summary_sel = challenge.append("div");

    inventory.randomize(); 		    // generate random scenario
    
    inventory.display_summary(summary_sel); // move function to this module
    
    var svg_slider = new slider.slider()
	.values([-9, 9])
	.radius(20)
	.reverse(true)
	.ticks(["<< Lower risk",
		"",
		"Higher risk >>"])
    
    var slider_sel =  challenge.append("div");
    var result_sel = challenge.append("div").classed("result_sel", true);
    
    var otype = null;
    var oclass = null;

    var block_reveal = true;

    var big_reveal = function(callb){
	typewriter.prepare(".typewriter-values");
	var num_factors = inventory.factors.length;
	var type_val = function( i ){
	    if (i >= num_factors) {
		block_reveal = false;
		callb();
		return;
	    }
	    typewriter.type(".twval" + i)
		.then(function(){
		    type_val( i + 1,{"duration":5} );
		});
	}

	type_val( 0 );
    }
    
    var submit_guess = function(){

	var chg = inventory.factors[1].selected.description;

	if (d3.select(this).classed("enabled") == false) return;
	
	svg_slider.enabled(false);
	
	summary_sel
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
	d3.select("#submit-button").classed("enabled", false);
	d3.select("#guess-slider").attr("disabled", true);
	
	guess_value = Math.round(svg_slider.value());
	
	d3.selectAll("td[data-factor]")
	    .html(function(d, i){
		var factor_i = d3.select(this).attr("data-factor");
		return numeral(inventory.factors[factor_i].selected.val)
		    .format("+0");
	    });

	var end_summary = function(){
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
	    
	    var headline = "You " + over_under + " this defendant's flight risk";

	    if (off_by == 0)
		headine = "Correct!"

	    var hi_lo = function(sc){
		ret = "";
		if (sc >= 0)
		    return "little or no";
		if (sc < 0)
		    ret = "moderate";
		if (sc < -3)
		    ret = "relatively high";
		return ret;
	    };
	    
	    var msg ="You guessed this defendant would represent " + hi_lo(g) + " risk of failure to appear, with a score of " + numeral(g).format("+0") + ". The more negative the score, the higher the risk, and any score zero of above typically results in a recommendation for release without a financial bond. ";
	    
	    msg += "The real pretrial risk score based on "
		+ "the factors above would be " + numeral(score).format("+0") + ".";
	    result_sel.append("h1")
		.text(headline);
	    result_sel.append("div").classed("explainer", true).text(msg);

	    var amt_line = function(sc){
		var ret = "";
		if (sc >= 0){
		    ret = "no financial bond";
		}
		else {
		    var amt = bond_amt(otype, oclass, sc);
		    ret = amt.trim() + " bond";
		}
		return ret;
	    }

	    var your_bail = amt_line(g);
	    var real_bail = amt_line(score);

	    var b_versus_b = your_bail
	    if (your_bail != real_bail)
		b_versus_b += " versus " + real_bail;

	    var capitalize = function(s){
		return s[0].toUpperCase() + s.slice(1);
	    };

	    
	    
	    result_sel.append("h1")
		.text(capitalize(b_versus_b));


	    var diff_text = "That's the difference in bail recommendations based on your score and the real one.";

	    if (your_bail == real_bail)
		diff_text = "That's the bail recommendation based on the defendant's risk assessment score.";
		
	    diff_text += " When a financial bail is recommended, the recommended dollar amount comes from a preset table of bond amounts. While the risk score has been validated as a predictor of flight risk, there is no real science behind the dollar value of the financial bond amounts. Ultimately this recommendation is one of the elements a judge considers when setting a bond amount.";
	    result_sel.append("div")
		.classed("explainer", true)
		.text(diff_text)
	    
	    var line_cont = result_sel
		.append("div")
		.style("width", "100%");

	    var compline = new bar.bar()
		.container(line_cont)
		.values([9,-9])
		.add_marker(new bar.marker(g, "Your guess").bottom(true))
		.add_marker(new bar.marker(score, "Actual score"))
		.draw();


	    var retry_button = result_sel.append("div")
		.append("div")
		.classed("fake-button-container", true)
		.append("div")
		.classed("fake-button", true)
		.attr("id","retry-button")
		.classed("enabled", true)
		.text("Try again")
		.on("click", function(){
		    go_challenge(fel, mis, amts);
		});

	    new wiggler.wiggler(retry_button).dance_party();

	    window.scrollTo(0,document.body.scrollHeight);

	}

	big_reveal(end_summary);
    }
    
    var add_slider = function(sel){

	// var svg_height = 40;

	var guess_display = sel.append("h1")
	    .text("Your assessment");

	sel.append("div")
	    .classed("explainer", true)
	    .text("Use the slider to indicate how much risk of failure to appear"
		  + " you feel the above-described defendant poses. When you're"
		  + " confident in your choice, hit the 'submit recommendation'"
		  + " button below to see how you did.");
	
	var svg_container = sel.append("div")
	    .style("width","100%");
	
	var svg = svg_container.append("svg");    

	svg_slider.svg(svg)
	    .draw();

	var submit = sel.append("div")
	    .append("div")
	    .classed("fake-button-container", true)
	    .append("div")
	    .classed("fake-button", true)
	    .attr("id","submit-button")
	    .classed("enabled", true)
	    .text("Submit recommendation")
	    .on("click", submit_guess);

	sel.append("div").classed("clear-both", true)

	var guess = function(d, i){
	    d3.select(this).classed("selected", true);
	    guess_value = d3.select(this).attr("data-val");
	    submit.classed("enabled", true);

	}

    }

    var type_across = function(i) {
	if (i >= inventory.factors.length) return;
	
	typewriter.type(".tw" + i,{duration: 50})
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

	// Add example charge
	var txt = d3.select(".tw1").html();
	var skipstr = "Charge (most serious): "
	var trimmed = txt.slice(skipstr.length);
	var parsed = charge_parse(trimmed);
	otype = parsed[0];
	oclass = parsed[1];

	var example = example_offense(otype, oclass)["offense"];

	if (typeof(example) != "undefined")
	    txt += ", " + example
	d3.select(".tw1").html(txt);

	typewriter.prepare(".typewriter");
	type_across(0);
    });
    
    add_slider(slider_sel);

}

// load JS files and go
d3.json(felony_url, function(fel){
    d3.json(misd_url, function(mis){
	d3.tsv(bond_url, function(amts){
	    go_challenge(fel, mis, amts);
	});
    });
});


