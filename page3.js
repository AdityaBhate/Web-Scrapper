const fs = require("fs");
const puppeteer = require("puppeteer");

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
	const browser = await puppeteer.launch({
		// headless: false,
		defaultViewport: false,
	});

	const page = await browser.newPage();
	await page.goto(
		"https://www.jaquar.com/en/laguna-faucets#/attrFilters=32!#-!8819&pageSize=12&orderBy=0&pageNumber=3"
	);

	let isBtnDisabled = false;
	while (!isBtnDisabled) {
		await page.waitForSelector(".products-wrapper");
		const productsHandles = await page.$$(
			".product-list.product-grid.nop7SpikesAjaxFiltersGrid.ajaxBusyPanelParent> .item-grid .item-box"
		);

		for (const producthandle of productsHandles) {
			let title = "Null";
			let code = "Null";
			let img = "Null";
			let rprice = "Null";

			try {
				title = await page.evaluate(
					(el) => el.querySelector(".details > h2 > a").textContent,
					producthandle
				);
			} catch (error) {}

			try {
				code = await page.evaluate(
					(el) => el.querySelector(".product-code.sku > span").textContent,
					producthandle
				);
			} catch (error) {}

			try {
				img = await page.evaluate(
					(el) =>
						el.querySelector(".picture.product-thumb img").getAttribute("src"),
					producthandle
				);
			} catch (error) {}

			try {
				rprice = await page.evaluate(
					(el) => el.querySelector(".price-box > .prices.flLeft").textContent,
					producthandle
				);
			} catch (error) {}

			if (title !== "Null") {
				fs.appendFile(
					"productPage3.csv",
					`${title},${code},${img},${rprice}\n`,
					function (err) {
						if (err) throw err;
					}
				);
				console.log("saved!");
			}
		}

		await page.waitForSelector(".next-page", { visible: true });
		const is_disabled = (await page.$(".next-page")) !== null;

		isBtnDisabled = is_disabled;
		if (!is_disabled) {
			await Promise.all([
				page.click(".next-page"),
				page.waitForNavigation({ waitUntil: "networkidle2" }),
			]);
		}
	}

	await browser.close();
})();
