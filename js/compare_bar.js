const d3 = require("d3");

var bar = function(){
    this.__markers = [];
    this.__height = 40;
    this.__font_height = 14;
    return this;
};

exports.bar = bar;

bar.prototype.container = function(sel){
    if (typeof(sel) == "undefined") return this.d3selection;

    this.d3selection = sel;
    return this;
}

bar.prototype.values = function(arr){
    if (typeof(arr) == "undefined") return this.__values;
    this.__values = arr;
    return this;
}

bar.prototype.add_marker = function(m){
    if (typeof(m) == "undefined") return;
    this.__markers.push(m);
    return this;
}

marker = function(val, label){
    this.__val = val;
    this.__label = label;
    this.__bottom = false;
    return this;
}

marker.prototype.bottom = function (v){
    if (typeof(v) == "undefined") return this.__bottom;
    this.__bottom = v;
    return this;
}
    

exports.marker = marker;

bar.prototype.height = function(h){
    if (typeof(h) == "undefined") return this.__height + this.__font_height * 2;
    this.__height = h;
    return this;
}

bar.prototype.draw = function(){
    
    this.d3selection.html("");
    
    var width = this.d3selection.node().getBoundingClientRect().width;

    var svg_outer = this.d3selection.append("svg")
    	.style("width",width + "px")
	.style("height", this.height() + "px")

    var svg = svg_outer.append("g");

    var x1 = 0;
    var x2 = width;
    var y1 = this.height() / 2;
    var y2 = y1;
    
    var line = svg.append("line")
	.attr("x1",x1)
	.attr("x2",x2)
	.attr("y1",y1)
	.attr("y2",y2)
	.style("stroke","lightgray")
	.style("stroke-width",2);

    var xscale = d3.scaleLinear()
	.domain(this.values())
	.range([10, width - 1]);

    var height = this.height();
    var that = this;
    this.__markers.forEach(function(m, i){

	console.log(m, m.__val);

	var y_padding = 3;
	
	var x1 = xscale(m.__val);
	var x2 = x1;
	var y1 = that.__font_height + y_padding;
	var y2 = height - that.__font_height - y_padding;

	console.log(x1, y1, x2, y2);
	var colors = ["tomato","lightskyblue"];

	svg.append("line")
	    .attr("x1",x1)
	    .attr("x2",x2)
	    .attr("y1",y1)
	    .attr("y2",y2)
	    .style("stroke",colors[i])
	    .style("stroke-width",5);

	var label = svg.append("text")
	    .attr("y",that.__font_height)
	    .style("font-size", that.__font_height)
	    .text(m.__label);

	var label_width = label.node().getBBox().width;

	var label_x = x1 - label_width / 2
	label_x = Math.max(0, label_x);
	label_x = Math.min(width - label_width, label_x);
	console.log("label_x", label_x);
	label.attr("x", label_x);

	if (m.__bottom == true){
	    label.attr("y", height - y_padding);
	}

	svg_outer.attr("height", (svg.node().getBBox().height
				  + svg.node().getBBox().y)
		       + "px");
	
    });
    
}
