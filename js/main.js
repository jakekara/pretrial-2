const d3 = require("d3");
const points = require("./points.js");


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

inventory.container(d3.select("#container"));
inventory.draw();
