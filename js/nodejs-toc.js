define([], function () {
	var toc = [
		{ depth: "0", short: "<i class='fa fa-home'></i>", desc: "Introduction" },

		{ depth: "1", short: "1", desc: "Node.js Fundamentals" },
		{ depth: "1,0", short: "<i class='fa fa-pencil'></i>", desc: "Learning Objectives <i class='checked fa fa-star-half-o fa-lg'></i>", video: "9780133929294-Lesson_1_0.mov" },
		{ depth: "1,1", short: "1.1", desc: "Set up the Node.js development environment <i class='checked fa fa-star fa-lg'></i>", video: "9780133929294-Lesson_1_1.mov" },
		{ depth: "1,1a", short: "<i class='fa fa-question-circle'></i>", desc: "<span class='quiz'>Check yourself with a quiz</span>", src: "extras/Module_01/index.html" },
		{ depth: "1,2", short: "1.2", desc: "Create a Node.js application", video: "9780133929294-Lesson_1_2.mov" },
		{ depth: "1,3", short: "1.3", desc: "Create a Node.js module", video: "9780133929294-Lesson_1_3.mov" },
		{ depth: "1,4", short: "1.4", desc: "Utilize the Node.js callback model", video: "9780133929294-Lesson_1_4.mov" },
		{ depth: "1,5", short: "1.5", desc: "Implement events and listeners", video: "9780133929294-Lesson_1_5.mov" },
		{ depth: "1,6", short: "1.6", desc: "Handle streams and file I/O", video: "9780133929294-Lesson_1_6.mov" },

		{ depth: "2", short: "2", desc: "MongoDB Fundamentals" },
		{ depth: "2,0", short: "<i class='fa fa-pencil'></i>", desc: "Learning Objectives" },
		{ depth: "2,1", short: "2.1", desc: "Create databases, collections and documents in the MongoDB Shell" },
		{ depth: "2,2", short: "2.2", desc: "View documents in a collection from the MongoDB Shell" },
		{ depth: "2,3", short: "2.3", desc: "Modify and remove documents, collections and databases from the MongoDB Shell" },
		{ depth: "2,4", short: "2.4", desc: "Apply users and authentication to MongoDB" },
		{ depth: "2,5", short: "2.5", desc: "Add and remove indexes to improve performance" },
		{ depth: "2,6", short: "2.6", desc: "Use Arc, QuadCurve, and CubicCurve" },

		{ depth: "3", short: "3", desc: "Using MongoDB as the Data Store for Node.js Applications" },
		{ depth: "3,0", short: "<i class='fa fa-pencil'></i>", desc: "Learning Objectives" },
		{ depth: "3,1", short: "3.1", desc: "Access MongoDB from Node.js applications" },
		{ depth: "3,2", short: "3.2", desc: "Find documents in a collection" },
		{ depth: "3,3", short: "3.3", desc: "Limit the results returned from a find operation using count, limit and field methods" },
		{ depth: "3,4", short: "3.4", desc: "Sort the documents returned in find operations" },
		{ depth: "3,5", short: "3.5", desc: "Retrieve aggregated Results" },
		{ depth: "3,6", short: "3.6", desc: "Add and remove documents in a collection" },
		{ depth: "3,7", short: "3.7", desc: "Update documents in a collection" },

		{ depth: "4", short: "4", desc: "Using Express as the Node.js Web Server" },
		{ depth: "4,0", short: "<i class='fa fa-pencil'></i>", desc: "Learning Objectives" },
		{ depth: "4,1", short: "4.1", desc: "Create your first express server" },
		{ depth: "4,2", short: "4.2", desc: "Implement routes" },
		{ depth: "4,3", short: "4.3", desc: "Serve static files" },
		{ depth: "4,4", short: "4.4", desc: "Handle query parameters" },
		{ depth: "4,5", short: "4.5", desc: "Use a template engine and templates" },
		{ depth: "4,6", short: "4.6", desc: "Handle JSON data in the request and response" },
		{ depth: "4,7", short: "4.7", desc: "Use sessions to store data between requests" },

		{ depth: "5", short: "5", desc: "AngularJS Framework Fundamentals" },
		{ depth: "5,0", short: "<i class='fa fa-pencil'></i>", desc: "Learning Objectives" },
		{ depth: "5,1", short: "5.1", desc: "Build your first AngularJS application" },
		{ depth: "5,2", short: "5.2", desc: "Use AngularJS directives to bind view elements to the scope" },
		{ depth: "5,3", short: "5.3", desc: "Create your own custom directive" },
		{ depth: "5,4", short: "5.4", desc: "Use AngularJS events to create, detect and handle changes to the scope" },
		{ depth: "5,5", short: "5.5", desc: "Use the $http services for AJAX communications with the web server" },
		{ depth: "5,6", short: "5.6", desc: "Create your own custom service" },

		{ depth: "6", short: "6", desc: "Implementing the Full Node.js, MongoDB and AngularJS Stack to Add User Authentication to a Web Site" },
		{ depth: "6,0", short: "<i class='fa fa-pencil'></i>", desc: "Learning Objectives" },
		{ depth: "6,1", short: "6.1", desc: "Create the application server, routes and views" },
		{ depth: "6,2", short: "6.2", desc: "Add session support to the server" },
		{ depth: "6,3", short: "6.3", desc: "Implement the user controller to iteract with MongoDB" },
		{ depth: "6,4", short: "6.4", desc: "Implement the AngularJS user model and controller" },

		{ depth: "7", short: "7", desc: "Implementing the Full Node.js, MongoDB and AngularJS Stack to Provide a Dynamic View of Backend Data" },
		{ depth: "7,0", short: "<i class='fa fa-pencil'></i>", desc: "Learning Objectives" },
		{ depth: "7,1", short: "7.1", desc: "Create a dynamic table of database data using Node.js, MongoDB and AngularJS" },
		{ depth: "7,2", short: "7.2", desc: "Add paging to the table view" },
		{ depth: "7,3", short: "7.3", desc: "Filter data displayed in the application" },
		{ depth: "7,4", short: "7.4", desc: "Sort data displayed in the application view" },

		{ depth: "8", short: "<i class='fa fa-flag-checkered'></i>", desc: "Summary" }
	];
	
	var code1 = '<pre id="code1" class="code-listing">var censoredWords = ["sad", "bad", "mad"];\n\
var customCensoredWords = [];\n\
\n\
function censor(inStr) {\n\
	for (idx in censoredWords) {\n\
		inStr = inStr.replace(censoredWords[idx], "****");\n\
	}\n\
\n\
	for (idx in customCensoredWords) {\n\
		inStr = inStr.replace(customCensoredWords[idx], "****");\n\
	}\n\
	return inStr;\n\
}\n\
\n\
function addCensoredWord(word){\n\
	customCensoredWords.push(word);\n\
}\n\
\n\
function getCensoredWords(){\n\
	return censoredWords.concat(customCensoredWords);\n\
}\n\
\n\
exports.censor = censor;\n\
exports.addCensoredWord = addCensoredWord;\n\
exports.getCensoredWords = getCensoredWords;</pre>';

	var code2 = '<pre id="code2" class="code-listing">var greeting = "Hello World";\n\
console.log(greeting);\n\
\n\
var random = Math.floor( Math.random() * 10);\n\
console.log("Random: " + random);\n\
\n\
function displayMessgae(msg){\n\
	console.log(msg);\n\
}\n\
\n\
var arr = ["One", "Two", "Three"];\n\
console.log("Element 0: " + arr[0]);\n\
console.log("Element 2: " + arr[2]);\n\
\n\
var obj = {first: "Brad", last: "Dayley"};\n\
console.log("First: " + obj.first);\n\
console.log("Last: " + obj.last);\n\
\n\
// ^load os from node_modules\n\
var os = require(\'os\');\n\
console.log("platform :" + os.platform());</pre>';
	
	var sandbox1 = '<iframe src="https://pearson.programmr.com/embed.php?action=tf&amp;path=pearson/files/jquerybook/listing2_1" width="100%" height="__window height__" frameborder="0"></iframe>';
	var sandbox2 = '<iframe src="https://pearson.programmr.com/embed.php?action=tf&amp;path=pearson/files/jquerybook/listing2_2" width="100%" height="__window height__" frameborder="0"></iframe>';

	var markers = [

//        { depth: "1,0", start: 15, end: 20, type: "epub", src: "nodejsmongodbangularjs", page: "ch03.html#ch03lev1sec1", title: "Node.js, MongoDB, and Angular.js", cover: "9780133844344.jpg" },


		{ depth: "1,1", start: 18, end: 23, type: "epub", text: "Click here to read about installing Node.js in this chapter from <strong>Learning Node.js</strong>", src: "learningnodejs", page: "ch01.html#ch01_ch01", title: "Learning Node.js", cover: "9780133377989.jpg" },

		{ depth: "1,1", start: 22, end: 27, id: "project1", text: "Click here to download the project files for this particular example.", type: "files" },

		{ depth: "1,1", start: 26, end: 31, type: "epub", src: "nodejsmongodbangularjs", page: "ch03.html#ch03lev1sec1", title: "Node.js, MongoDB, and Angular.js", cover: "9780133844344.jpg", text: "Click here to read more about the install process." },

		{ depth: "1,1", start: 35, end: 40, type: "extra", text: "<span class='quiz'>Test what you've learned with this quiz</span>", src: "extras/Module_01/index.html" },

		{ depth: "1,1", start: 58, end: 63, type: "epub", src: "nodejsmongodbangularjs", page: "ch13.html#page_227", title: "Node.js, MongoDB, and Angular.js", cover: "9780133844344.jpg", text: "Click here for more details about MongoDB installation." },

		{ depth: "1,2", start: 18, end: 23, type: "epub", src: "learningnodejs", page: "ch04.html#ch04_ch04", title: "Learning Node.js", cover: "9780133377989.jpg", text: "Click here to read more about writing simple applications." },

		{ depth: "1,2", start: 42, end: 47, type: "epub", src: "learningangularjs", page: "ch01.html#ch01lev1sec1", title: "Learning Angular.js", cover: "9780134034614.jpg", text: "Click here to read more about setting up a development environment for Node.js." },

		{ depth: "1,2", start: 56, end: 172, type: "code", text: "Click here to see or copy the Node.js code I'm talking about here.", html: code2 },

		{ depth: "1,2", start: 61, end: 66, id: "sandbox1", text: "Click here to try it out this exact code in a live sandbox.", type: "sandbox", html: sandbox1 },
		{ depth: "1,2", start: 65, end: 70, id: "sandbox2", text: "Click here to try out this other code in a live sandbox.", type: "sandbox", html: sandbox2 },

		{ depth: "1,3", start: 11, end: 16, type: "epub", src: "learningnodejs", page: "ch05.html#ch05_ch05", title: "Learning Node.js", cover: "9780133377989.jpg", text: "Click here to read more about modules." },

		{ depth: "1,4", start: 10, end: 15, type: "epub", src: "learningnodejs", page: "ch03.html#ch03_ch03", title: "Learning Node.js", cover: "9780133377989.jpg" },

		{ depth: "1,5", start: 15, end: 20, type: "epub", src: "learningnodejs", page: "ch04.html#ch04lev1sec6", title: "Learning Node.js", cover: "9780133377989.jpg" },

		{ depth: "1,6", start: 10, end: 15, type: "epub", src: "learningnodejs", page: "ch06.html#ch06_ch06", title: "Learning Node.js", cover: "9780133377989.jpg" }
	];

	var temp_markers = [
		{ depth: "0", short: "<i class='fa fa-home'></i>", desc: "Marker A" },
		{ depth: "0,0", short: "<i class='fa fa-home'></i>", desc: "Marker 1" },
		{ depth: "0,1", short: "<i class='fa fa-home'></i>", desc: "Marker 2" },
		{ depth: "0,2", short: "<i class='fa fa-home'></i>", desc: "Marker 3" }
		];

	return { toc: toc, markers: markers, temp_markers: temp_markers };
});