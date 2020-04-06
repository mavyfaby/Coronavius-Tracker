(function() {
	var db = null, currentSearchIndex = null, upload = false;
	
	const DATA_LINK = "https://api.thevirustracker.com/free-api";
	
	if (localStorage) {
		class LocalStorage {
			set(key, value) {
				localStorage.setItem(key, value);
			}
			
			get(key) {
				return localStorage.getItem(key);
			}
			
			init() {
				if (this.get("isFirst") == null) {
					this.set("layout-theme", "dark");
					this.set("color-theme", "green");
					this.set("meta-theme", "dark");
					this.set("isFirst", 1);
				}
			}
		}
		
		db = new LocalStorage();
		db.init();
	}

	const firebaseConfig = {
		apiKey: "AIzaSyC9Egn3cHpw9jkVj1FRfXu7q7nQxf4p5MI",
		authDomain: "covid-19-tracker-9d70e.firebaseapp.com",
		databaseURL: "https://covid-19-tracker-9d70e.firebaseio.com",
		storageBucket: "covid-19-tracker-9d70e.appspot.com",
		messageSenderId: "181076139909"
	}
	
	const email = "maverickfabroa@gmail.com";
	const pass = "U2FsdGVkX19PpsYICH23QxgYRJF8OS8Fqm3JAGpWPuM=";
	const salt = "RM";
	const dcryptd = CryptoJS.AES.decrypt(pass, salt).toString(CryptoJS.enc.Utf8);
	
	const $ = Dom7;
	
	const app = new Framework7({
		root: "#app",
		name: "Worldwide Coronavirus Tracker",
		panel: {
			swipe: "left"
		},
		dialog: {
			autoFocus: false
		}
	});
	
	let basis = true;
	
	if (upload) {
		firebase.initializeApp(firebaseConfig);
		const database = firebase.database();
		
		firebase.auth().signInWithEmailAndPassword(email, dcryptd).catch(function(error) {
			alert(error.code);
		});
		
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				var email = user.email;
				toast5.open();
				
				if (basis) {
					const ref = database.ref("site");
					
					ref.once("value").then(function(snapshot) {
						const val = snapshot.val();
						const views = val.views + 1;
									
						ref.set({ views: views, lastDateViewed: Date.now() });
					});
	
					basis = false;
				}
			}
		});
	}
	
	const main = new Vue({
		el: ".view",
		data: {
			title: "Worldwide Coronavirus Data",
			report: {},
			result: {},
			gResult: {},
			offsetTop: 0,
			colors: [
				{ name: "Red" }, { name: "Green" }, { name: "Blue" },
				{ name: "Pink" }, { name: "Yellow" }, { name: "Orange" },
				{ name: "Purple" }, { name: "Deep Purple" }, { name: "Light Blue" },
				{ name: "Teal" }, { name: "Lime" }, { name: "Deep Orange" },
				{ name: "Gray" }, { name: "Black" }
			],
			layoutTheme: localStorage ? db.get("layout-theme") : "dark",
			colorTheme: localStorage ? db.get("color-theme") : "green",
			metaTheme: localStorage ? db.get("meta-theme") : "dark"
		},
		methods: {
			toggleSwipeStep: function() {
				app.sheetSwipeToStep.stepToggle();
			},
			isMobile: function() {
				const width = window.innerWidth;
				
				if (width >= 320 && width <= 414) {
					return true;
				}
					else {
						return false;
					}
			},
			convert: function(text) {
				let a = text.toLowerCase(), c, d;
				
				for (let i = 0; i < a.length; i++) {
					if (a.charAt(i) == " ") {
						c = a.split(" ");
						d = c[0] + c[1];
						
						return d;
					}
				}
				
				return a;
			},
			fn: function(num) {
				if (num !== null && num !== undefined) {
					return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
				}
			},
			showProgress: function () {
				app.progressbar.show();
			},
			hideProgress: function() {
				app.progressbar.hide();
			},
			scrollTo: function(el) {
				const tel = $("#" + el);
				const rad = window.innerHeight;
				const val = main.offsetTop + tel.offset().top + (tel.height() / 2) - rad;
				
				main.offsetTop = val;
				
				$(".page-content").scrollTop(val, 3000);
			}
		},
		computed: {
			orderedData: function () {
				delete this.report.stat;
				
				return _.sortBy(this.report, 'total_cases').reverse();
			}
		}
	});

	const result = app.sheet.create({
		el: ".result-sheet",
		backdrop: true,
		swipeToStep: true,
		swipeToClose: true
	});

	const globalResult = app.sheet.create({
		el: ".global-sheet",
		backdrop: true,
		swipeToStep: true,
		swipeToClose: true
	});
	
	const about = app.sheet.create({
		el: ".about-sheet",
		backdrop: true,
		swipeToClose: true
	});
	
	const toast1 = app.toast.create({
		text: "Country not found on list!",
		closeButton: true
	});
	
	const toast2 = app.toast.create({
		text: "Input must not be empty!",
		closeButton: true
	});

	const toast3 = app.toast.create({
		text: "Successfully shared!",
		closeButton: true
	});
	
	const toast4 = app.toast.create({
		text: "Sharing failed!",
		closeButton: true
	});
	
	const toast5 = app.toast.create({
		text: "Authenticated!",
		closeTimeout: 3000
	});
	
	const darkModeToggle = app.toggle.create({
		el: "#dark-mode",
	});
	
	let first = true;
	let searchAvail = true;

	function success(data) {
		main.report = data.countryitems[0];

		if (currentSearchIndex) {
			main.result = main.report[currentSearchIndex];
		}
		
		if (first) {
			app.dialog.close();			
			first = false;
		}
		
		searchAvail = true;
		main.hideProgress();
	}

	function error(xhr, status) {
		alert("Error loading data!");
		
		if (first) {
			app.dialog.close();
			
			first = false;
		}
		
		main.hideProgress();
	}

	if (navigator.onLine) {
		try {
			setInterval(function() {
				if (searchAvail) {
					app.request.json(DATA_LINK, { countryTotals: "PH" }, success, error);
					
					main.showProgress();
					
					getGlobalStats();
					
					searchAvail = false;
				}
			}, 2000);
		}
			catch (e) {
				alert(e);
			}
	}
		else {
			app.dialog.alert("No internet connection!");
		}
	
	function gSuccess(data) {
		main.gResult = data.results[0];
	}
	
	function gError(xhr, status) {
		alert("Error: " + status);
	}
	
	function getGlobalStats() {		
		app.request.json(DATA_LINK, { global: "stats" }, gSuccess, gError);
	}
	
	$("#global-stats").click(function() {
		globalResult.open(true);
	});
	
	darkModeToggle.on("change", function() {
		if (this.checked) {
			$("#app").addClass("theme-dark");
			
			changeMetaTheme("dark");
			changeLayoutTheme("dark");
			
			if (localStorage) {
				db.set("layout-theme", "dark");
				db.set("meta-theme", "dark");
			}
		}
			else {
				$("#app").removeClass("theme-dark");
	
				changeLayoutTheme("light");
				
				if (localStorage) {
					changeMetaTheme(db.get("color-theme"));
					
					db.set("layout-theme", "light");
					db.set("meta-theme", db.get("color-theme"));
				}
			}
	});

	$(".selected-theme").on("change", function() {
		const val = this.value;
		
		changeColorTheme(val);
		
		if (localStorage && db.get("layout-theme") !== "dark") {
			changeMetaTheme(val);
		}
	});
	
	$("#share").click(function() {
		if (navigator.share) {
			navigator.share({
				title: main.title,
				text: "Get real-time data of the coronavirus disease in every country.",
				url: "https://mavyfaby.ml/projects/covid"
			}).then(function() {
				toast3.open();
			}).catch(function() {
				toast4.open();
			});
		}
			else {
				app.dialog.alert("Share feature doesn't support by this browser!");
			}
	});
	
	function removeClass(el, className) {
		$(el).removeClass(className);
	}
	
	function changeLayoutTheme(theme) {
		removeClass("#app", "theme-dark");
		removeClass("#app", "theme-light");
		
		if (localStorage) {
			db.set("layout-theme", theme);
		}

		$("#app").addClass("theme-" + theme);
	}
	
	function changeColorTheme(color) {
		const currentTheme = $("#app").attr("class").match(/\bcolor-theme-\S+/g);
		
		try {
			if (currentTheme !== null && currentTheme.length > 0) {
				for (let i = 0; i < currentTheme.length; i++) {
					$("#app").removeClass(currentTheme[i]);
				}
			}
		}
			finally {
				if (localStorage) {
					db.set("color-theme", color);
				}
				
				$("#app").addClass("color-theme-" + color);
			}
	}
	
	function changeMetaTheme(theme) {
		const el = document.querySelector("meta[name=theme-color]");
		
		let color;
		
		if (theme == "dark") {
			color = "#202020";
		}
			else {
				color = $(".color-theme-" + theme).css("--f7-theme-color");
			}
			
		if (localStorage) {
			db.set("meta-theme", theme);
		}
			
		$(el).attr("content", color);
	}
	
	function updateSearchResult(data) {
		main.result = data;
	}
	
	function searchCountry(country) {
		if (country.length > 0) {
			let INPUT = country.toUpperCase(), curentCountry;
			
			const nums = Object.keys(main.report).length;
			
			for (let i = 1; i <= nums; i++) {
				let cut = main.report[i];
				let currentCountry = cut.title;
				let condition = currentCountry.toUpperCase().indexOf(INPUT) !== -1;
				
				if (condition) {
					currentSearchIndex = i;
					
					updateSearchResult(cut);
					
					if (main.isMobile()) {
						main.scrollTo(cut.code);
					}
						else {
							result.open(true);
						}

					return;
				}
				
				if (i >= nums - 1) {
					toast1.open();
					
					return;
				}
			}
		}
			else {
				toast2.open();
			}
	}
	
	try {
		changeColorTheme(main.colorTheme);
		changeLayoutTheme(main.layoutTheme);
		changeMetaTheme(main.metaTheme);
		
		if (localStorage) {
			if (db.get("layout-theme") == "dark") {
				$("#dark-mode-input").prop({
					checked: true
				});
			}
				else {
					$("#dark-mode-input").prop({
						checked: false
					});
				}
		}
	}
		finally {
			$(".view").animate({
				opacity: 1
			});
			
			if (navigator.onLine) {
				app.dialog.preloader("Getting Data");
			}
		}
	
	$("#search-country").click(function() {
		app.dialog.prompt("Search Country", main.title, searchCountry);
	});
})();