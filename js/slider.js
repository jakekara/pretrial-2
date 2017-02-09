var slider = function(){
    this.__enabled = true;
    this.__radius = 10;
    this.__stroke_width = 1;
    return this;
}

exports.slider = slider;

slider.prototype.svg = function(sel){
    if (typeof(sel) == "undefined") return this.d3selection;
    this.d3selection = sel;
    return this;
}

slider.prototype.min_val = function(){
    return this.domain()[0];
}

slider.prototype.max_val = function(){
    return this.domain().reverse()[0];
}

slider.prototype.value = function(v){
    if (typeof(v) == "undefined") return this.__value;
    var v = Math.min(v, d3.max(this.values()));
    var v = Math.max(v, d3.min(this.values()));
    this.__value = v;
    return this;
}

slider.prototype.values = function(arr){
    if (typeof(arr) == "undefined") return this.__values;
    this.__values = arr;
    this.value(d3.mean(d3.extent(arr)));
    return this;
}

slider.prototype.bbox = function(){
    return this.svg().node().getBoundingClientRect();
}

slider.prototype.padding = function(){
    return this.__stroke_width + this.__radius;
}

slider.prototype.domain = function(){
    if (this.reverse() == true) return this.values().sort().reverse();
    return this.values().sort();
}

slider.prototype.iscale = function(){
    var range = [this.padding(),
		 this.bbox().width - this.padding()];

    return d3.scaleLinear()
	.domain(range)
	.range(this.domain());
}

slider.prototype.scale = function(){
    var range = [this.padding(),
		 this.bbox().width - this.padding()];

    return d3.scaleLinear()
	.domain(this.domain())
	.range(range);
}

slider.prototype.axis = function(){
    this.d3axis = d3.axisBottom()
	.tickSize(this.padding())
	.scale(this.scale());

    var ticks = this.ticks();
    var that = this;
    if(typeof(ticks) != "undefined"){
	that.d3axis.ticks(ticks.length)
	    .tickFormat(function(i, j){
		return ticks[j];
	    })
	    .tickSizeOuter(0)
    }
    
    return this.d3axis;
}

slider.prototype.knob_position = function(){
    var y = this.padding();
    var x = this.scale()(this.value());
    this.knob
	.attr("cx", x)
	.attr("cy", y);
}

slider.prototype.knob_type = function(kt){
    if (typeof(kt) == "undefined") return this.__knob_type || "circle";
    this.__knob_type = kt;
    return this;
}

slider.prototype.knob_move_to = function(val){

    if (typeof(val) == "undefined") return;

    if (val > Math.max(this.min_val(),this.max_val())) return;

    if(val < Math.min(this.min_val(), this.max_val())) return;

    this.value(val);
    this.knob_position();
}

slider.prototype.knob_make_draggable = function(){
    var that = this;
    var drag_end = function(){
	if (that.enabled() == false) return;
	that.value(that.iscale()(d3.event.x));
	console.log("set value to ", that.value());
    }

    var drag_drag = function(){
	if (that.enabled() == false) return;
	var x = d3.event.x;
	var val = that.iscale()(x);
	that.knob_move_to(val);
    }

    this.knob.call(d3.drag()
		   .on("end", drag_end)
		   .on("drag",drag_drag));
}

slider.prototype.reverse = function(v){
    if (typeof(v) == "undefined") return this.__reverse || false;
    this.__reverse = v;
    return this;
}

slider.prototype.enabled = function(v){
    if (typeof(v) == "undefined") return this.__enabled;
    console.log("setting enabled to " + v);
    this.__enabled = v;
    if (v == false) this.svg().classed("disabled", true);
    return this;
}

slider.prototype.ticks = function(arr){
    if (typeof(arr) == "undefined") return this.__tick_labels;
    this.__tick_labels = arr;
    return this;
}

slider.prototype.radius = function(r){
    if (typeof(r) == "undefined") return this.__radius;
    this.__radius = r;
    return this;
}

slider.prototype.draw = function(){

    this.svg().html("");
    this.svg().attr("width",
		    this.svg().node().parentNode.getBoundingClientRect().width);

    var container = this.svg().append("g");
    
    container.append("g")
	.attr("transform", "translate(0," + this.padding() + ")")
	.call(this.axis());

    this.knob = container.append("g")
	.append(this.knob_type())
	.attr("r", this.radius())

    this.knob_position();
    this.knob_make_draggable();

    this.svg().attr("height",
		    container.node().getBBox().height
		    + container.node().getBBox().y
		    + "px");

    var that = this;
    d3.select(window).on("resize", function(){
	that.draw()
    });
    return this;
}
