let form, display;

function load() {
	form = document.querySelector("form");
	display = document.querySelector("div");
	let data = undefined;

	const url = new URL(window.location.href);
	const encodedData = url.searchParams.get("data");

	if (encodedData) {
		// Decode compressed and URL-safe encoded data from the `data` parameter
		const decoded = decompress(encodedData);
		const params = new URLSearchParams(decoded);

		data = {
			sender: params.get("sender"),
			reciever: params.get("reciever"),
			occasion: params.get("occasion"),
			message: params.get("message"),
			color: params.get("color"),
		};
	} else {
		// Fallback to direct URL parameters if `data` is not present
		if (
			url.searchParams.get("sender") &&
			url.searchParams.get("reciever") &&
			url.searchParams.get("occasion") &&
			url.searchParams.get("message") &&
			url.searchParams.get("color")
		) {
			data = {
				sender: url.searchParams.get("sender"),
				reciever: url.searchParams.get("reciever"),
				occasion: url.searchParams.get("occasion"),
				message: url.searchParams.get("message"),
				color: url.searchParams.get("color"),
			};
		}
	}

	if (data) {
		// Hide the form if data is present to display the card view
		form.style.display = "none";
		// Populate the display section with the data
		document.querySelector("#occasion").innerText = data.occasion;
		document.querySelector("#message").innerText = data.message;
		document.querySelector("#sender").innerText = data.sender;
		document.querySelector("#reciever").innerText = data.reciever;
		// Apply the background and text colors
		document.body.style.backgroundColor = "#" + data.color;
		document.body.style.color = pickTextColorBasedOnBgColorSimple(
			"#" + data.color,
			"#ffffff",
			"#000000"
		);
	}
}

function submitForm(e) {
	e.preventDefault(); // Prevent the default form submission behavior

	const formData = new FormData(form);
	const data = {
		// Collect form data, with default values for empty fields
		sender: formData.get("sender") || "Anonymous",
		reciever: formData.get("reciever") || "You",
		occasion: formData.get("occasion") || "{Occasion}",
		message: formData.get("message") || "",
		color: formData.get("color") ? formData.get("color").slice(1) : "ffffff",
	};

	// Convert data into a query string format
	const params = new URLSearchParams(data).toString();
	// Compress and encode the query string for shorter URL
	const compressed = compress(params);

	// Redirect to the same page with the compressed `data` parameter
	window.location.href =
		window.location.href.split("?")[0] + `?data=${compressed}`;
}

function compress(data) {
	/**
	 * Compresses data using base64 and makes it URL-safe
	 * Replaces '+' with '-', '/' with '_', and removes padding '='
	 */
	return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decompress(data) {
	/**
	 * Decompresses URL-safe base64 data by reversing the compression process
	 * Replaces '-' with '+', '_' with '/', and decodes from base64
	 */
	const padded = data.replace(/-/g, "+").replace(/_/g, "/");
	return atob(padded);
}

function pickTextColorBasedOnBgColorSimple(bgColor, lightColor, darkColor) {
	/**
	 * Determines appropriate text color (light or dark) based on the background color.
	 * Uses the YIQ formula to assess the brightness of the background color.
	 *
	 * @param {string} bgColor - Background color in hex format.
	 * @param {string} lightColor - Text color to use if the background is dark.
	 * @param {string} darkColor - Text color to use if the background is light.
	 * @returns {string} The selected text color.
	 */
	const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
	const r = parseInt(color.substring(0, 2), 16);
	const g = parseInt(color.substring(2, 4), 16);
	const b = parseInt(color.substring(4, 6), 16);
	return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}
