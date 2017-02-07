default: bundle.min.js pretrial.min.css

pretrial.min.css: pretrial.css
	uglifycss css/pretrial.css > css/pretrial.min.css

pretrial.css: css/pretrial.scss
	sass css/pretrial.scss css/pretrial.css

bundle.min.js: bundle.js
	uglifyjs js/bundle.js -o js/bundle.min.js

bundle.js: js/main.js
	browserify js/main.js -o js/bundle.js
