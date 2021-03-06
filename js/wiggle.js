var d3 = require("d3");

var wiggler = function(sel){
    this.d3selection = sel;
    this.__auto = true;
    this.__degree = 5;
    this.__duration = 200;
    this.__frequency = 1000 * 5;
    this.__ease = d3.easeCubicIn;
    return this;
}

exports.wiggler = wiggler;

wiggler.prototype.degree = function(d){
    if (typeof(d) == "undefined") return this.__degree;
    this.__degree = d;
    return this;
}

wiggler.prototype.n_to_degs = function(n){
    return n + "deg"
}

wiggler.prototype.reset = function(){

    return this.wiggle_to(0);
}

wiggler.prototype.wiggle_to = function(n){

    var tfunc = this.d3selection.style("transform");
    
    tfunc = "rotate(" + this.n_to_degs(n) + ")";

    return this.d3selection
	.transition()
	.duration(Math.round(Math.random() * this.__duration))
	.ease(this.__ease)
	.style("transform", tfunc);
}

wiggler.prototype.twist_to = function(n){

    var that = this;
    return this.wiggle_to(n)
	.on("end", function(){
	    that.wiggle_to(-1 * n)
		.on("end", function(){
		    that.reset();
		});
	});
}

wiggler.prototype.dance = function(){
    return this.twist_to(Math.round(Math.random() * this.__degree));
}

wiggler.prototype.spin = function(){

    var that = this;
    return this.wiggle_to(180)
	.on("end", function(){
	    that.reset();
	});
}

wiggler.prototype.stop = function(){
    clearInterval(this.__interval);
    return this;
}

wiggler.prototype.loop = function(f){
    this.stop();
    this.__interval = setInterval(f, this.__frequency);
    return this;
}

wiggler.prototype.spin_cycle = function(){
    var that = this;
    return this.loop(function(){
	that.spin();
    });
}

wiggler.prototype.frequency = function(f){
    if (typeof(f) == "undefined") return this.__frequency;
    this.__frequency = f;

    return this;
}


wiggler.prototype.dance_party = function(delay){
    var delay = delay || 0;

    var that = this;

    setTimeout(function(){
	return that.loop(function(){
	    that.dance();
	});
    }, delay);

    return this;
}
