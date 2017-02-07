d3 = require("d3");
const numeral = require("numeraljs");

var point = function(val, description){
    this.factor = null;
    this.val = val;
    this.description = description;
    return this;
};

exports.point = point;

var factor = function(headline, description){
    this.inventory = null;
    this.headline = headline;
    this.description = description
    this.points = [];
    this.selected = null;
    return this;
};

exports.factor = factor;

factor.prototype.add_to = function(inv){
    inv.add_factor(this);
    return this;
}

factor.prototype.select = function(point){
    this.selected = point;
    return this;
}

factor.prototype.add_point = function(val, description){
    var new_point = new point(val, description);
    new_point.factor = this;
    this.points.push(new_point);
    return this;
}

var inventory = function(){
    this.factors = [];
    return this;
}

exports.inventory = inventory;

inventory.prototype.add_factor = function(factor){
    factor.inventory = this;
    this.factors.push(factor);
    return this;
}

inventory.prototype.score = function(){
    return d3.sum(this.factors.map(function(f){
	return f.selected.val;
    }));
}

inventory.prototype.container = function(sel){
    if (typeof(sel) == "undefined") return this.__container;
    this.__container = sel;
    return this;
}

inventory.prototype.generate_report = function(sel){
    sel.html("");
    sel.append("h1")
	.text("Final report");

    var summary = sel.append("div")
	.classed("report-section", true);

    summary.append("h3")
	.text("Risk score: " + numeral(this.score()).format("+0"));


    var pre = summary.append("table")
    var rows = pre.selectAll("td")
	.data(this.factors)
	.enter()
	.append("tr");

    rows.each(function(d){
	d3.select(this).append("td")
	    .text(numeral(d.selected.val).format("+0"));

	d3.select(this).append("td")
	    .text("<strong>" + d.headline + ":</strong> "
		  + d.selected.description);
    });
}

inventory.prototype.draw = function(){
    this.__selection = this.__container.append("div");

    var show_factor = function( i ){
	var sel = "div.factor[data-factor='" + i + "']";
	d3.selectAll("div.factor[data-factor]").classed("hidden", true);
	d3.selectAll("div.factor[data-factor='"+i+"']").classed("hidden", false);
    };

    var report = this.__selection.append("div")
	.classed("summary", true)
	.classed("hidden", true)

    var that = this;
    
    var show_report = function(){
	show_factor ( - 1);
	report.classed("hidden", false);
	report.style("opacity",0);
	report.transition().duration(250).style("opacity",1);
	that.generate_report(report);
    }
    
    var factors = this.__selection.selectAll("div.factor")
	.data(this.factors)
	.enter()
	.append("div")
	.classed("factor", true)
	.attr("data-factor", function(d, i){ return i;})

    var num_factors = this.factors.length;
    var position = factors.append("div")
	.classed("top-bar", true)
	.text(function(d, i){
	    return (i + 1) + "/" + num_factors;
	})
    
    factors.append("h3")
	.text(function(d){
	    return d.headline;
	});

    var enable_nav = function ( i ){
	console.log("enabling");
	d3.select(".factor[data-factor='" + i + "']")
	    .select(".nav-bar")
	    .selectAll("div")
	    .classed("enabled", true);
    };

    var list = factors.append("div")
	.append("ul")
	.attr("data-factor", function(d, i){
	    return i;
	})
	.each(function(d, i){

	    var points = d3.select(this).selectAll("li")
		.data(d.points)
		.enter()
		.append("li")
		.attr("data-factor", function(){
		    return i;
		})
		.attr("data-point", function(x, j){
		    return j;
		})
		.text(function(p){
		    return p.description;
		})


	    var deselect_points = function (factor_i){
		d3.select("[data-factor='" + factor_i + "']")
		    .selectAll("li")
		    .classed("selected", false);
	    };
	    
	    points.on("click", function(d, i){
		deselect_points(d3.select(this).attr("data-factor"));
		d.factor.select(d);
		enable_nav(d3.select(this).attr("data-factor"));
		d3.select(this)
		    .classed("selected", true);
	    });
	});

    var nav = factors.append("div")
	.classed("nav-bar", true)

    var next = nav.append("div")
    	.attr("data-factor", function(d, i){ return i;})
	.classed("next", true)
	.text(function(d, i){
	    if (i < num_factors - 1) return "next >>";
	    return "next >>";
	})
    	// .classed("hidden", function(d, i){
	//     if (i == num_factors - 1) return true;
	//     return false;
	// })
    	.on("click", function(d, i){
	    if (i == num_factors - 1) {
		show_report();
		return;
	    }
	    if (d3.select(this).classed("enabled") == false) return;
	    show_factor(i + 1);
	});


    var prev = nav.append("div")
	.attr("data-factor", function(d, i){ return i;})
	.classed("prev", true)
	.text("<< prev")
	.classed("hidden", function(d, i){
	    if (i == 0) return true;
	    return false;
	})
	.on("click", function(d, i){
	    if (i == 0) return;
	    show_factor(i - 1);
	});

    nav.append("div")
	.classed("clear-both", true);

    show_factor( 0 );
}
