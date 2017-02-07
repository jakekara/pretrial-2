default: clean bundle.min.js pretrial.min.css

pretrial.min.css: pretrial.css
	uglifycss css/pretrial.css > css/pretrial.min.css

pretrial.css: css/pretrial.scss
	sass css/pretrial.scss css/pretrial.css

bundle.min.js: bundle.js
	uglifyjs js/bundle.js -o js/bundle.min.js

bundle.js: js/main.js
	browserify js/main.js -o js/bundle.js

clean:
	rm -f js/bundle.js
	rm -f js/bundle.min.js
	rm -f css/pretrial.css
	rm -f css/pretrial.min.css
