import '../styles/Tabs.css';
import React, { useState } from 'react';
import Dropdown from "./DownloadDropdown";
import JSZip from "jszip";

import { SlIcon, SlSpinner } from "@shoelace-style/shoelace/dist/react";

export function TabList ({ children, html, css, js, loadingResponse }) {
	const [activeTab, setActiveTab] = useState(children[0].key);

	const handleChangeTab = (key) => {
		setActiveTab(key);
	}

	const loading_screen = (
		loadingResponse ? (
			<div className="loading-screen">
				<SlSpinner />
			</div>
		) : null
	);

	const downloadOptions = [
		{
		  label: "Download HTML with CSS and Javascript embedded",
		  onClick: () => downloadFullHtmlFile(html, "index.html", "text/html"),
		},
		{
		  label: "Download HTML (.html)",
		  onClick: () => downloadFile(html, "index.html", "text/html"),
		},
		{
		  label: "Download CSS (.css) ",
		  onClick: () => downloadFile(css, "styles.css", "text/css"),
		},
		{
		  label: "Download JavaScript (.js)",
		  onClick: () => downloadFile(js, "script.js", "application/javascript"),
		},
		{
		  label: "Download Zip (All Files)",
		  onClick: () => {
			  const zip = new JSZip();
			  zip.file("index.html", html);
			  zip.file("styles.css", css);
			  zip.file("script.js", js);

			  zip.generateAsync({ type: "blob" }).then((blob) => {
			  downloadFile(blob, "project.zip", "application/zip");
			  });
		},
		},
	];
	
	function downloadFile(fileData, fileName, fileType) {
		const element = document.createElement("a");
		const file = new Blob([fileData], { type: fileType });
		element.href = URL.createObjectURL(file);
		element.download = fileName;
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
		document.body.removeChild(element);
	}

	function downloadFullHtmlFile() {

		const html_file = `
			<html>
				<head>
					<style>${css}</style>
				</head>
				<body>
					${html}
					<script>${js}</script>
				</body>
			</html>
		`;

		const element = document.createElement("a");
		const file = new Blob([html_file], { type: 'text/html' });
		element.href = URL.createObjectURL(file);
		element.download = "index.html";
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
		document.body.removeChild(element);
	}


	return (
		<div className="tablist-container">
			<div className="tablist-header">
				{children.map(({ key, props }) => (
					<div
						key={key}
						className={`tablist-tab ${activeTab === key ? "active" : ""}`}
						onClick={() => handleChangeTab(key)}
					>
						<SlIcon name={props.icon} label={props.label} />
						<span>{props.label}</span>
					</div>
				))}

				<Dropdown options={downloadOptions} onSelectOption={(option) => option.onClick()} />
			</div>
			{children.map(({ key, props }) => (
				<div key={key} className={`tablist-content ${activeTab === key ? "active" : ""}`}>
					<div className="tablist-content-inner">
						{loading_screen}
						{React.cloneElement(props.children, { html, css, js, loadingResponse })}
					</div>
				</div>
			))}
		</div>
	);
}


export function Tab({ label, children }) {
	return (
		<>
			{children}
		</>
	);
}