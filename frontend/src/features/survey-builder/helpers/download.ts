export function downloadJson(json: string, filename = "survey.json"): void {
	const url = URL.createObjectURL(
		new Blob([json], { type: "application/json" }),
	);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	// Let the browser consume the download URL before releasing it.
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
